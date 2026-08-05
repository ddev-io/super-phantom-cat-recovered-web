// Recovered source-like JS from /mnt/data/smdis/dis/efx/efxBlackCatLight.dis
// Source-like reconstruction from smdis.

var EfxBlackCatLight = vee.Class.extend({
  ccbInit: function () {
    EfxBlackCatLight.ctl = this;
  }
});
EfxBlackCatLight.ctl = null;
EfxBlackCatLight.player = null;
EfxBlackCatLight.show = function () {
  var local0 = cc.BuilderReader.load(res.efx_HeroBlackCat_ccbi);
  local0.controller.ccbInit();
  return local0;
};
EfxBlackCatLight.remove = function (arg0) {
  if (EfxBlackCatLight.ctl) {
    EfxBlackCatLight.ctl.playAnimate("3", arg0);
  }
};
