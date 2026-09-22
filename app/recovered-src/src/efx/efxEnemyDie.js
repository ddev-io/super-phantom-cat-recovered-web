// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/efx/efxEnemyDie.dis
var EfxEnemyDie = vee.Class.extend({
  ps1: null,
  show: function () {
    this.playAnimate("show", function () {
      this.rootNode.setVisible(false);
      EfxEnemyDie.pool.push(this);
    }.bind(this));
    vee.Audio.playEffect(res.inGame_event_deathMonster_mp3);
  },
  ccbInit: function () {
    this.ps1.setPositionType(1);
  }
});
EfxEnemyDie.ensureSpriteFrames = function () {
  var frameCache = cc.spriteFrameCache;
  if (!frameCache) {
    return;
  }
  if (!frameCache.getSpriteFrame("efx_round_1.png") && res.efx_box_plist) {
    frameCache.addSpriteFrames(res.efx_box_plist);
  }
  if (!frameCache.getSpriteFrame("efx_Fang.png") && res.item_plist) {
    frameCache.addSpriteFrames(res.item_plist);
  }
};
EfxEnemyDie.show = function (arg0, arg1) {
    if (!arg1) {
      EfxApplause.Analysis.onKillEnemy();
    }
    var local0 = EfxEnemyDie.pool.pop();
    if (!local0) {
      EfxEnemyDie.ensureSpriteFrames();
      var local1 = cc.BuilderReader.load(res.efx_Guai_die_ccbi);
      local1.controller.ccbInit();
      game.Data.oLyGame.lyMap.addChild(local1, 8);
      local0 = local1.controller;
    }
    local0.rootNode.setVisible(true);
    local0.rootNode.setPosition(arg0);
    local0.show();
  };
EfxEnemyDie.pool = null;
