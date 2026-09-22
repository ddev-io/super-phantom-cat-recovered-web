// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/uiCoin.dis
var UICoin = vee.Class.extend({
  lbCoinNum: null,
  onCreate: function () {
    this.lbCoinNum.setString(game.LevelData.getCoin());
  },
  refresh: function () {
    this.lbCoinNum.setString(game.LevelData.getCoin());
  },
  showAnimate: function () {
    this.playAnimate("show");
  },
  hideAnimate: function () {
    this.playAnimate("end");
  }
});
