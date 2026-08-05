// Recovered source-like JS from /mnt/data/smdis/dis/efx/efxCostEnergy.dis
// Source-like reconstruction from smdis.

var EfxCostEnergy = vee.Class.extend({
  ccbInit: function () {
    this.playAnimate("show");
  }
});
EfxCostEnergy.show = function (arg0, arg1) {
  if (game.Data.isFreeGame) {
    var local0 = cc.BuilderReader.load(res.efx_battery_ccbi);
    local0.controller.ccbInit();
    local0.setPosition(arg0);
    arg1.addChild(local0, 2);
  }
};
