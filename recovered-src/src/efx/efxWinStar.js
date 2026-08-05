// Recovered source-like JS from /mnt/data/smdis/dis/efx/efxWinStar.dis
// Source-like reconstruction from smdis.

var EfxWinStar = vee.Class.extend({
  spBack: null,
  setGettedStar: function () {
    if (game.Data.checkIs61()) {
      this.spBack.setSpriteFrame("win_statChild_off2.png");
    } else {
      this.spBack.setSpriteFrame("win_stat_off_2.png");
    }
  },
  show: function () {
    this.playAnimate("light");
  },
  unlock: function () {
    this.playAnimate("unlock");
  },
  ScrShake: function () {
    if (!(game.Data.oLyGameOver)) {
      return undefined;
    }
    var local0 = game.Data.oLyGameOver.rootNode;
    local0.stopAllActions();
    var local1 = 0.03;
    var local2 = 18;
    local0.runAction(cc.sequence(cc.MoveBy.create(local1, 0, -(local2)), cc.MoveBy.create(local1, 0, (local2 * 2)), cc.MoveBy.create(local1, 0, -(local2)), cc.MoveBy.create((local1 / 2), 0, local2), cc.MoveBy.create((local1 / 2), 0, (-(local2) * 2)), cc.MoveBy.create((local1 / 2), 0, local2)));
  }
});
