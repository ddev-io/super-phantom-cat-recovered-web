// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/uiCoinCounter.dis
var UICoinCounter = vee.Class.extend({
  lbCounter: null,
  onCreate: function () {
  },
  initCoinCounter: function () {
    this.lbCounter.setString(((game.Data.coin + "/") + game.Data.stageMaxCoin));
  },
  updateCoin: function () {
    this.playAnimate("get");
    this.lbCounter.setString(((game.Data.coin + "/") + game.Data.stageMaxCoin));
  }
});
