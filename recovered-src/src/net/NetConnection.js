// Conservative launch shim: original NetConnection.jsc was not present in this handoff archive.
// Single-player recovery keeps networking disabled while preserving the public surface used by deferred multiplayer modules.
var NetConnection = NetConnection || {
  connected: false,
  isConnected: function () {
    return this.connected;
  },
  connect: function () {
    this.connected = false;
    return false;
  },
  close: function () {
    this.connected = false;
  },
  disconnect: function () {
    this.close();
  },
  send: function () {
    return false;
  },
  addListener: function () {
  },
  removeListener: function () {
  },
  removeAllListeners: function () {
  }
};
