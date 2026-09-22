// Recovered source-like JS from /mnt/data/smdis/dis/efx/efxGetLife.dis
// Source-like reconstruction from smdis.

var EfxGetLife = {
  show: function (arg0) {
    var local0 = cc.BuilderReader.load(res.efx_GetLife_ccbi);
    local0.setPosition(arg0);
    local0.getChildByTag(9).setPositionType(cc.ParticleSystem.TYPE_RELATIVE);
    local0.runAction(cc.sequence(cc.delayTime(2), cc.callFunc(function () {
      this.removeFromParent();
    }.bind(local0))));
    game.Data.oLyGame.lyMap.addChild(local0, 11);
  }
};
