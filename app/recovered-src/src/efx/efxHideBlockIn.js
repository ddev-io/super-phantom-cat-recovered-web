// Recovered source-like JS from /mnt/data/smdis/dis/efx/efxHideBlockIn.dis
// Source-like reconstruction from smdis.

var EfxHideBlockIn = vee.Class.extend({
  ccbInit: function () {
    this.playAnimate("show", function () {
      this.rootNode.removeFromParent();
    }.bind(this));
  }
});
EfxHideBlockIn.show = function (arg0) {
  var local0 = cc.BuilderReader.load(res.efx_HideBlockIn_ccbi);
  local0.controller.ccbInit();
  local0.setPosition(arg0);
  game.Data.oLyGame.lyMap.addChild(local0, 8);
};
