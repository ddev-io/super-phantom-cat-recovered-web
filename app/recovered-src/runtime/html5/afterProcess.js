// Conservative launch shim: original runtime/html5/afterProcess.js was not present in this handoff archive.
// The Android/web handoff has no recoverable payload for this file, so keep post-processing as a no-op.
(function () {
  if (typeof cc !== "undefined") {
    cc._superCatAfterProcessReady = true;
  }
}());
