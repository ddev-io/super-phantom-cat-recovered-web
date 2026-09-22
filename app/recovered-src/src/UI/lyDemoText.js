// Recovered source-like JS from /mnt/data/smdis/dis/UI/lyDemoText.dis
// Source-like reconstruction from smdis.

var LyDemoText = vee.Class.extend({
  ccbInit: function (arg0) {
    this.playAnimate("open", arg0);
  }
});
LyDemoText.show = function (arg0) {
  var local0 = vee.PopMgr.popCCB("res/lyDemoText.ccbi", {
    alpha: 0
  });
  local0.controller.ccbInit(arg0);
};
