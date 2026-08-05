// Recovered source-like JS from /mnt/data/smdis/dis/efx/efxCostLife.dis
// Source-like reconstruction from smdis.

var EfxCostLife = vee.Class.extend({
  ps1: null,
  onCreate: function () {
    this.playAnimate("Show", function () {
      this.rootNode.removeFromParent();
    }.bind(this));
  },
  init: function () {
    this.ps1.setPositionType(1);
  }
});
EfxCostLife.create = function (arg0) {
  var local0 = cc.BuilderReader.load(res.efx_Life_loss_ccbi);
  local0.setPosition(arg0);
  local0.controller.init();
  return local0;
};
