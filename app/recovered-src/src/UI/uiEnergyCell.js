// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/UI/uiEnergyCell.dis
var UIEnergyCell = vee.Class.extend({
  show: function () {
    this.playAnimate("on");
  },
  hide: function () {
    this.playAnimate("off");
  },
  use: function () {
    this.playAnimate("use");
  }
});
UIEnergyCell.create = function () {
    return cc.BuilderReader.load(res.uiEnergyCell_ccbi);
  };
