// Recovered source-like JS from /mnt/data/smdis/dis/efx/efxSmashDust.dis
// Source-like reconstruction from smdis.

var EfxSmashDust = vee.Class.extend({
  psDust: null,
  onCreate: function () {
    this.psDust.setPositionType(1);
    this.playAnimate("smash", function () {
      this.rootNode.removeFromParent();
    }.bind(this));
  }
});
EfxSmashDust.show = function (arg0) {
  var lyMap = game && game.Data && game.Data.oLyGame && game.Data.oLyGame.lyMap;
  if (!lyMap) {
    return;
  }
  var local0 = cc.BuilderReader.load(res.efx_Dust_smash_ccbi);
  if (!local0) {
    return;
  }
  local0.setPosition(arg0);
  lyMap.addChild(local0, 11);
};
var EfxSmashFlash = vee.Class.extend({
  ps1: null,
  ps2: null,
  onCreate: function () {
    this.ps1.setPositionType(1);
    this.ps2.setPositionType(1);
    this.playAnimate("Show", function () {
      this.rootNode.removeFromParent();
    }.bind(this));
  }
});
EfxSmashFlash.show = function (arg0) {
  var lyMap = game && game.Data && game.Data.oLyGame && game.Data.oLyGame.lyMap;
  if (!lyMap) {
    return;
  }
  var local0 = cc.BuilderReader.load(res.efx_elePlayerZhai_Lizi_ccbi);
  if (!local0) {
    return;
  }
  local0.setPosition(arg0);
  lyMap.addChild(local0, 11);
};
