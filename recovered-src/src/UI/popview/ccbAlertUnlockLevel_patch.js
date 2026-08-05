// Conservative launch shim: no .dis/source payload for this plain JS patch file was present in smdis-supercat-all.zip.
(function () {
  var root = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : this);
  root.ccbAlertUnlockLevel_patch = root.ccbAlertUnlockLevel_patch || {};
})();
