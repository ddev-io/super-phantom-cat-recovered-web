function __levelCellGetSelectedCategory() {
  var category = game.LevelData.selectedCategory;
  if (category) {
    return category;
  }

  var levelSelectCtl = game.Data.oLvSelectCtl;
  if (levelSelectCtl && levelSelectCtl.isSelectingLevel &&
      levelSelectCtl.selectedCategory &&
      typeof levelSelectCtl.selectedCategory.getCategoryData === "function") {
    category = levelSelectCtl.selectedCategory.getCategoryData();
    if (category) {
      game.LevelData.selectedCategory = category;
      return category;
    }
  }

  return null;
}

var LevelCell = vee.Class.extend({
  btnSelect: null,
  spBG: null,
  spStar1: null,
  spStar2: null,
  spStar3: null,
  spCoin: null,
  spMoon: null,
  lbLevelNo: null,
  lyContent: null,
  ccbBtnShop: null,

  idx: 0,

  checkLevelLockByParkour: function () {
    var category = __levelCellGetSelectedCategory();
    return category &&
      category.idx === 9 &&
      this.idx > 0 &&
      !game.LevelData.checkParkourlevelUnlock(this.idx);
  },

  onSelectEvent: function () {
    vee.Audio.playEffect(res.outGame_menu_chooseLevel_mp3);

    var startCallback = function () {
      var category = __levelCellGetSelectedCategory();
      if (!category) {
        cc.log("LevelCell.onSelectEvent ignored: selected category is not ready");
        return;
      }
      var levelController = category.getLevelDataController(this.idx);

      game.LevelData.selectedLevel = levelController;
      game.LevelData.selectedLevel.idx = this.idx;

      vee.PopMgr.closeAll();
      cc.director.purgeCachedData();
      vee.PopMgr.popCCB("res/veeGameLayer.ccbi");

      cc.log(
        "opening level: " +
        game.LevelData.levelMap[levelController.getLevelNo() - 1]
      );

      game.Data.oLyGame.onLoaded();
      game.Data.oLyGame.initStage(
        game.LevelData.levelMap[levelController.getLevelNo() - 1]
      );
    }.bind(this);

    var levelSelectCtl = game.Data.oLvSelectCtl;
    if (levelSelectCtl && typeof levelSelectCtl.startLevel === "function") {
      levelSelectCtl.startLevel(startCallback);
    }
  },

  onSelect: function () {
    var levelSelectCtl = game.Data.oLvSelectCtl;
    if (!levelSelectCtl) {
      cc.log("LevelCell.onSelect ignored: level select controller is not ready");
      return false;
    }
    if (levelSelectCtl._isOver) {
      return;
    }

    var category = __levelCellGetSelectedCategory();
    if (!category) {
      cc.log("LevelCell.onSelect ignored: selected category is not ready");
      return false;
    }

    cc.log("zq debug on level cell click");
    cc.log(
      "zq debug selected category idx===%d   level idx===%d",
      category.idx,
      this.idx
    );

    game.Data.setSelectedLvIdx(category.idx + 1);

    var levelController = category.getLevelDataController(this.idx);
    var canOpenLevel = levelController.getLevelState() !== 0 || game.Data.isAllLevelOpen;

    if (canOpenLevel) {
      if (this.checkLevelLockByParkour()) {
        ccbAlertUnlockLevel.show(this.idx, this.onSelectEvent.bind(this));
      } else {
        this.onSelectEvent();
      }
    } else if (category.idx > 99) {
      AlertMoonLocked.show(this.idx, true);
    }

    return true;
  },

  updateContent: function () {
    var category = __levelCellGetSelectedCategory();
    if (!category) {
      cc.log("error no selected category data");
      return;
    }

    var startIndex = Math.ceil((7 - category.levelCount) / 2) + 1;
    var tag = parseInt(this.rootNode.getTag());

    if (tag < startIndex || tag >= startIndex + category.levelCount) {
      this.lyContent.setVisible(false);
      return;
    }

    this.idx = tag - startIndex;

    var levelController = category.getLevelDataController(this.idx);
    var levelState = levelController.getLevelState();

    this.lyContent.setVisible(true);
    this.lbLevelNo.setString(tag - startIndex + 1);

    switch (levelState) {
      case 0:
        this.playAnimate(game.Data.isSelectingReverseWorld ? "lock_moon" : "lock");
        break;

      case 1:
        this.playAnimate("unlock");
        break;

      case 2:
        this.playAnimate("played");
        this._updateProgressIcons(levelController, category);
        break;

      default:
        cc.log("error getLevelState error: " + levelState);
        return;
    }
  },

  _updateProgressIcons: function (levelController, category) {
    this.spStar1.initWithFile(
      levelController.isStarAchieved(1) ?
        res.level_icon_star_on_png :
        res.level_icon_star_off_png
    );
    this.spStar2.initWithFile(
      levelController.isStarAchieved(2) ?
        res.level_icon_star_on_png :
        res.level_icon_star_off_png
    );
    this.spStar3.initWithFile(
      levelController.isStarAchieved(3) ?
        res.level_icon_star_on_png :
        res.level_icon_star_off_png
    );
    this.spCoin.initWithFile(
      levelController.isAllCoinCollect() ?
        res.level_icon_coin_on_png :
        res.level_icon_coin_off_png
    );

    var shouldShowMoon;
    if (game.Data.isReverseWorldOpen && game.Data.version.newVersion) {
      shouldShowMoon = vee.data.moon &&
        !game.Data.isSelectingReverseWorld &&
        category.checkHasUnlockMoon();
    } else {
      shouldShowMoon = game.Data.isShowBtnWorld() &&
        !game.Data.isSelectingReverseWorld &&
        category.checkHasUnlockMoon();
    }

    if (shouldShowMoon) {
      this.spMoon.initWithFile(
        levelController.isLevelReverseKeyCollected() ?
          res.level_icon_moon_on_png :
          res.level_icon_moon_off_png
      );
      this.spMoon.setVisible(true);
    } else {
      this.spMoon.setVisible(false);
    }
  }
});

var EfxLevelCells = vee.Class.extend({
  onCreate: function () {
    this.rootNode.setVisible(false);
  },

  show: function (callback) {
    vee.Audio.playEffect(res.outGame_menu_chooseSection_mp3);
    this.playAnimate("Show", callback);
  },

  hide: function (callback) {
    vee.Audio.playEffect(res.outGame_menu_leaveSection_mp3);
    this.playAnimate("Hide", callback);
  },

  updateCells: function () {
    var count = this.rootNode.getChildrenCount();
    var children = this.rootNode.getChildren();

    for (var i = 0; i < count; i++) {
      children[i].controller.updateContent();
    }
  }
});
