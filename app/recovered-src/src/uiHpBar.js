// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/uiHpBar.dis
var UIHPBar = vee.Class.extend({
  nodeHPContainer: null,
  _hpBarWidth: 44,
  _hp: -1,
  onCreate: function () {
  },
  setHP: function (arg0) {
    var local0 = res.ga_icon_heart_png;
    if (game.Data.checkIs61()) {
      local0 = res.ga_ui_Childheart_png;
    }
    this.nodeHPContainer.removeAllChildren();
    for (var local1 = 0; local1 < arg0; local1++) {
      var local2 = new cc.Sprite(local0);
      local2.setPositionX(local1 * 56);
      this.nodeHPContainer.addChild(local2);
    }
    if (this._hp > arg0) {
      var local3 = EfxCostLife.create(cc.p(cc.p(56 * (this._hp - 1), 0)));
      this.rootNode.addChild(local3, 2);
    }
    this._hp = arg0;
  }
});
UIHPBar.create = function (arg0) {
    var local0 = cc.BuilderReader.load(res.UIHPBar_ccbi);
    local0.controller.setHP(arg0);
    return local0;
  };
if (cc.BuilderReader && cc.BuilderReader.registerController) {
  cc.BuilderReader.registerController("UIHPBar", UIHPBar);
  cc.BuilderReader.registerController("uiHpBar", UIHPBar);
}
