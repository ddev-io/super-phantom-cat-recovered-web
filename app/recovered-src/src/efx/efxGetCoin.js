// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/efx/efxGetCoin.dis
var EfxGetCoin = vee.Class.extend({
  showAnimate: function () {
    this.playAnimate("Show", function () {
      this.rootNode.setVisible(false);
      EfxGetCoin.pool.push(this);
    }.bind(this));
  }
});
EfxGetCoin.pool = null;
EfxGetCoin.show = function (arg0) {
    var local0 = EfxGetCoin.pool.pop();
    if (!local0) {
      var local1 = cc.BuilderReader.load(res.efx_EatSmallCoin_Star_ccbi);
      game.Data.oLyGame.lyMap.addChild(local1, 8);
      local0 = local1.controller;
    }
    local0.rootNode.setVisible(true);
    local0.rootNode.setPosition(arg0);
    local0.showAnimate();
  };
