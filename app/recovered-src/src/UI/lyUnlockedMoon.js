// Recovered source-like JS from /mnt/data/smdis/dis/UI/lyUnlockedMoon.dis
// Source-like reconstruction from smdis.

var LyUnlockedMoon = vee.Class.extend({
  btnConfirm: null,
  spCategory: null,
  _isOver: false,
  _tempControllerState: null,
  lbLevel: null,
  _category: null,
  ccbInit: function () {
    this.handleKey(true);
    this.playAnimate("open");
    this._category = game.LevelData.getCategory((game.LevelData.selectedCategory.idx + 100));
    game.LevelData.getCategory((game.LevelData.selectedCategory.idx + 100));
    this.spCategory.setTexture(this._category.bgUnlock);
    this.lbLevel.setString(((("MOON WORLD M" + (game.LevelData.selectedCategory.idx + 1)) + "-") + (game.LevelData.selectedLevel.idx + 1)));
    this._tempControllerState = vee.Controller.cacheControllerState();
    vee.Controller.cacheControllerState();
    vee.Controller.deactiveButton();
    vee.Controller.deactiveSelector(true);
  },
  initController: function () {
    vee.Controller.initSelector(1, 1, this.onConfirm.bind(this), cc.p(0, 0));
    vee.Controller.registerItemByButton(this.btnConfirm, cc.p(0, 0), this.onConfirm.bind(this), "res/mfi_btn_on_170.png");
    vee.Controller.activeSelector();
  },
  onConfirm: function () {
    if (this._isOver) {
      return undefined;
    }
    this._isOver = true;
    this.playAnimate("hide", function () {
      vee.Controller.reviveControllerState(this._tempControllerState);
      vee.PopMgr.closeLayerByCtl(this);
      var local0 = this._category.idx;
      game.LevelData.selectedCategory = game.LevelData.getCategory(local0);
      game.LevelData.getCategory(local0);
      game.LevelData.selectedLevel = game.LevelData.selectedCategory.getLevelDataController(game.LevelData.selectedLevel.idx);
      game.LevelData.selectedCategory.getLevelDataController(game.LevelData.selectedLevel.idx);
      game.Data.isSelectingReverseWorld = true;
      game.Logic.startGame(game.LevelData.levelMap[(game.Data.newMoonLevelIdx - 1)]);
    }.bind(this));
    vee.Controller.deactiveSelector();
  },
  onClose: function () {
    if (this._isOver) {
      return undefined;
    }
    this._isOver = true;
    this.playAnimate("hide", function () {
      vee.Controller.reviveControllerState(this._tempControllerState);
      vee.PopMgr.closeLayerByCtl(this);
    }.bind(this));
    vee.Controller.deactiveSelector();
  },
  onKeyBack: function () {
    this.onClose();
    return true;
  }
});
LyUnlockedMoon.show = function () {
  var local0 = vee.PopMgr.popCCB(res.lyUnlockedMoon_ccbi, {
    alpha: 0
  });
  local0.controller.ccbInit();
};
