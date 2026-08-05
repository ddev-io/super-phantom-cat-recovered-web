// Recovered source-like JS from /mnt/data/smdis/dis/levelController/level201.dis
// Source-like reconstruction from smdis.

LevelController.Level201 = LevelController.extend({
  complete: function () {
    if ((game.Data.getTempCoin() >= game.Data.stageMaxCoin)) {
      vee.GameCenter.unlockAchievement(8);
    }
  }
});
