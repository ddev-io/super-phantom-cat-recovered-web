// Recovered source-like JS from /mnt/data/smdis/dis/efx/efxHawkLight.dis
// Source-like reconstruction from smdis.

var EfxHawkLight = vee.Class.extend({
  ccbInit: function () {
    this.playAnimate("drop light", function () {
      this.rootNode.removeFromParent();
    }.bind(this));
  }
});
EfxHawkLight.show = function (arg0) {
  var local0 = cc.BuilderReader.load(res.ele_HeroLightDrop_ccbi);
  game.Data.oLyGame.lyMap.addChild(local0, 1);
  local0.setPosition(arg0);
  local0.controller.ccbInit();
};
