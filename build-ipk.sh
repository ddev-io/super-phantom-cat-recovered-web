#!/bin/sh
set -eu
cd "$(dirname "$0")"
if ! command -v ares-package >/dev/null 2>&1; then
    echo 'webOS CLI is not installed. Install it with: npm install -g @webos-tools/cli' >&2
    exit 1
fi
if [ ! -f app/appinfo.json ]; then
    echo 'Missing app/appinfo.json. Extract the complete project first.' >&2
    exit 1
fi
ares-package --no-minify ./app
