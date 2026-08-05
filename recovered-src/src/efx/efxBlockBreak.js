// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/efx/efxBlockBreak.dis
var EfxBlockBreak = vee.Class.extend({
  ps1: null,
  removeFunc: null,
  onCreate: function () {
    this.ps1.setPositionType(1);
  },
  show: function () {
    this.playAnimate("show", function () {
      this.rootNode.setVisible(false);
      EfxBlockBreak.pool.push(this);
    }.bind(this));
  },
  setRemoveFunc: function (arg0) {
    this.removeFunc = arg0;
  },
  breakBlock: function () {
    if (this.removeFunc) {
      this.removeFunc();
    }
  }
});
EfxBlockBreak.show = function (arg0, arg1) {
    var local0 = EfxBlockBreak.pool.pop();
    if (!local0) {
      var local1 = cc.BuilderReader.load(res.efx_blockBreak_ccbi);
      game.Data.oLyGame.lyMap.addChild(local1, 8);
      local0 = local1.controller;
    }
    local0.rootNode.setVisible(true);
    local0.rootNode.setPosition(arg0);
    local0.setRemoveFunc(arg1);
    local0.show();
  };
EfxBlockBreak.pool = null;
