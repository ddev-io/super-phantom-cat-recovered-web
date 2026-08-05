from __future__ import annotations

import argparse
import json
import mimetypes
import os
import shutil
import socket
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent

# Make sure older Android/Cocos extensions get reasonable content types.
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/octet-stream", ".ccbi")
mimetypes.add_type("application/xml", ".tmx")
mimetypes.add_type("application/xml", ".tsx")
mimetypes.add_type("application/xml", ".plist")


class WebV1HTTPServer(ThreadingHTTPServer):
    daemon_threads = True
    block_on_close = False
    allow_reuse_address = True
    request_queue_size = 512

    def server_bind(self) -> None:
        try:
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        except OSError:
            pass
        try:
            self.socket.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
        except OSError:
            pass
        super().server_bind()


class WebV1RequestHandler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def send_head(self):
        if "If-Modified-Since" in self.headers:
            del self.headers["If-Modified-Since"]
        if "If-None-Match" in self.headers:
            del self.headers["If-None-Match"]
        return super().send_head()

    def do_POST(self) -> None:
        if self.path.split("?", 1)[0] != "/__supercat_client_log":
            self.send_error(404, "Not found")
            return

        try:
            length = int(self.headers.get("Content-Length", "0") or "0")
        except ValueError:
            length = 0
        length = max(0, min(length, 256 * 1024))
        raw = self.rfile.read(length)
        text = raw.decode("utf-8", errors="replace")
        try:
            payload = json.loads(text) if text else {}
        except json.JSONDecodeError:
            payload = {"raw": text}

        print("[browser-console] " + json.dumps(payload, ensure_ascii=False)[:4000])
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_OPTIONS(self) -> None:
        if self.path.split("?", 1)[0] == "/__supercat_client_log":
            self.send_response(204)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Access-Control-Max-Age", "86400")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        self.send_error(405, "Method not allowed")

    def copyfile(self, source, outputfile) -> None:
        # Bigger chunks reduce per-request overhead during Cocos preload bursts.
        shutil.copyfileobj(source, outputfile, length=1024 * 1024)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header("Connection", "close")
        super().end_headers()

    def log_message(self, format: str, *args) -> None:
        # Keep server output readable; browser console reports still print above.
        if self.path.startswith("/__supercat_client_log"):
            return
        print(
            "%s - - [%s] %s"
            % (self.address_string(), self.log_date_time_string(), format % args)
        )


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve the recovered Super Phantom Cat web build.")
    parser.add_argument("--bind", default="127.0.0.1", help="host to bind")
    parser.add_argument("--port", default=8000, type=int, help="port to listen on")
    parser.add_argument(
        "--workers",
        default=128,
        type=int,
        help="kept for backward compatibility; ThreadingHTTPServer now handles the burst directly",
    )
    args = parser.parse_args()

    handler_cls = partial(WebV1RequestHandler, directory=os.fspath(ROOT))
    server = WebV1HTTPServer((args.bind, args.port), handler_cls)

    print(f"Serving {ROOT} at http://{args.bind}:{args.port}/assets/index.webv1.html")
    print("Server burst mode: request_queue_size=512, unbounded daemon threads")
    try:
        server.serve_forever(poll_interval=0.05)
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
