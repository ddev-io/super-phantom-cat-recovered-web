// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/levelController/level105.dis
LevelController.Level105 = LevelController.extend({
  complete: function () {
    if (game.Data.jumpCount === 0) {
      vee.GameCenter.unlockAchievement(6);
    }
  }
});
