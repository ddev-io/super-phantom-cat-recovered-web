// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/efx/efxLevel.dis
var EfxLevel = vee.Class.extend({
  lbLevelTitle: null,
  lbLevelContent: null,
  nodeT: null,
  setLevel: function (arg0, arg1) {
    if (arg0 > 99) {
      arg0 -= 100;
      arg0 = "M" + arg0;
    }
    vee.PopMgr.setNodePos(this.nodeT, vee.PopMgr.PositionType.Top);
    this.lbLevelTitle.setString(arg0 + "-" + arg1);
    this.playAnimate("show", function () {
      this.playAnimate("end", function () {
        this.rootNode.removeFromParent();
        vee.PopMgr.closeLayerByCtl(this);
      }.bind(this));
    }.bind(this));
  }
});
EfxLevel.show = function (arg0, arg1) {
    var local0 = vee.PopMgr.popCCB(res.guideLevel_ccbi);
    local0.controller.setLevel(arg0, arg1);
  };
