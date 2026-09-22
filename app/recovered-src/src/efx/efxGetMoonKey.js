// Recovered source-like JS from /mnt/data/smdis/dis/efx/efxGetMoonKey.dis
// Source-like reconstruction from smdis.

var EfxGetMoonKey = vee.Class.extend({
  ccbInit: function () {
    this.playAnimate("open", function () {
      this.playAnimate("hide", function () {
        this.rootNode.removeFromParent();
      }.bind(this));
    }.bind(this));
  }
});
EfxGetMoonKey.show = function () {
  var local0 = cc.BuilderReader.load(res.efx_PowerMoonBar_ccbi);
  game.Data.oLyGame.rootNode.addChild(local0, 8);
  var local1 = game.Data.oLyGame.nodeT;
  local0.setPosition(vee.Utils.pSub(local1.getPosition(), cc.p(0, 130)));
  local0.controller.ccbInit();
};
