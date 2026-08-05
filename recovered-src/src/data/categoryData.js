// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/data/categoryData.dis
var CategoryData = cc.Class.extend({
  idx: null,
  bg: null,
  title: null,
  percent: null,
  levels: null,
  beginLevel: null,
  endLevel: null,
  levelCount: null,
  unlockStar: null,
  lockStatus: null,
  bgUnlock: null,
  categoryReady: null,
  ctor: function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
    this.bg = arg0;
    this.title = arg1;
    this.idx = arg2;
    this.percent = arg5;
    this.beginLevel = arg3;
    this.levelCount = arg4;
    this.unlockStar = arg6;
    this.lockStatus = arg7;
    this.bgUnlock = arg8;
    this.categoryReady = arg9;
    this.endLevel = ((this.beginLevel + this.levelCount) - 1);
  },
  getStarCount: function (arg0) {
    return ((arg0 & 1) ? 1 : 0) + ((arg0 & 16) ? 1 : 0) + ((arg0 & 256) ? 1 : 0);
  },
  isAllLevelUnlock: function () {
    for (var local0 in this.levels) {
      var local1 = this.levels[local0];
      if (local1.lock) {
        return false;
      }
    }
    return true;
  },
  isAllLevelPass: function () {
    var local0 = this.levels[this.levelCount - 1];
    vee.Utils.logObj(local0, "level data---------");
    return local0.isLevelPassed;
  },
  checkHasUnlockMoon: function () {
    var local0 = game.LevelData.selectedCategory.idx;
    if (game.Data.version.newVersion) {
      var local1 = game.LevelData.getCategory(0).isAllLevelPass();
      var local2 = this.getLevelData(0).isLevelPassed;
      cc.log("level index========%d", local0);
      return local1 && local2 && local0 < 5;
    }
    return this.isAllLevelPass() && local0 < 5;
  },
  updatePercent: function () {
    var local0 = 0;
    if (!this.levels) {
      this.load();
    }
    for (var local1 = 0; local1 < this.levelCount; local1++) {
      local0 += this.getStarCount(this.levels[local1].star);
    }
    var local2 = Math.floor(local0 * 100 / (this.levelCount * 3));
    if (local2 == 100) {
      vee.GameCenter.unlockAchievement(this.idx);
    }
    if (this.percent != local2) {
      game.LevelData.setPercent(this.idx, this.percent);
      this.percent = local2;
    }
  },
  isAllStarArchive: function () {
    var local0 = this.getCategoryStarCount();
    return (local0 === (this.levelCount * 3));
  },
  getCategoryStarCount: function () {
    var local0 = 0;
    if (!this.levels) {
      this.load();
    }
    for (var local1 = 0; local1 < this.levelCount; local1++) {
      local0 += this.getStarCount(this.levels[local1].star);
    }
    return local0;
  },
  save: function () {
    vee.Utils.saveObj(this.levels, ("yrogetac_" + this.idx));
    this.updatePercent();
  },
  load: function () {
    cc.log("this.idx = " + this.idx);
    if (this.idx == undefined) {
      return null;
    }
    this.levels = vee.Utils.loadObj("yrogetac_" + this.idx);
    if (!this.levels) {
      this.levels = [];
    }
    for (var local0 = 0; local0 < this.levelCount; local0++) {
      if (!this.levels[local0]) {
        this.levels[local0] = {
          levelNo: this.beginLevel + local0,
          lock: true,
          isCollectAllCoin: false,
          star: 0,
          playedCount: 0,
          lastKilledPos: false,
        };
      }
    }
    if (this.levels[0].levelNo < 99) {
      this.levels[0].lock = false;
    }
    this.save();
  },
  getLevelDataController: function (arg0) {
    if (!this.levels) {
      this.load();
    }
    if (!this.levels || !this.levels[arg0]) {
      return null;
    }
    return CategoryData.LevelDataController.getController(arg0, this.levels[arg0]);
  },
  getLevelData: function (arg0) {
    if (!this.levels) {
      this.load();
    }
    if (this.levels) {
      return this.levels[arg0];
    }
    return null;
  }
});
CategoryData.LevelData = {
  levelNo: 0,
  lock: true,
  star: 0,
  playedCount: 0,
  continueKilledCount: 0,
  lastKilledPos: null,
  isCollectAllCoin: false,
  isReverseKeyCollected: false,
  isLevelPassed: false
};
CategoryData.LevelDataController = {
  levelData: null,
  idx: null,
  tempStarAchieved: 0,
  tempKeyCollected: false,
  getController: function (arg0, arg1) {
    this.idx = arg0;
    this.levelData = arg1;
    this.tempStarAchieved = 0;
    return this;
  },
  getLevelState: function (arg0) {
    arg0 = arg0 ? arg0 : this.levelData;
    if (arg0.lock) {
      return 0;
    }
    return arg0.playedCount > 0 ? 2 : 1;
  },
  levelComplete: function (arg0) {
    var local0 = game.LevelData.selectedCategory;
    this.levelData.playedCount++;
    this.levelData.isLevelPassed = true;
    if (arg0) {
      this.levelData.isCollectAllCoin = true;
    }
    this.levelData.lastKilledPos = false;
    this.levelData.continueKilledCount = 0;
    var local1 = this.levelData.star | this.tempStarAchieved;
    if (local1 != this.levelData.star) {
      if (local0.idx < 100) {
        game.LevelData.addStar(local0.getStarCount(local1) - local0.getStarCount(this.levelData.star));
      }
      this.levelData.star = local1;
    }
    if (this.tempKeyCollected && local0.idx < 100) {
      this.levelData.isReverseKeyCollected = true;
      if (game.Data.isReverseWorldOpen) {
        this._checkReverseLevel(local0);
      }
      this.tempKeyCollected = false;
    }
    if (local0.idx < 100) {
      var local2 = local0.getLevelData(this.idx + 1);
      if (local2) {
        local2.lock = false;
      }
    }
    game.LevelData.selectedCategory.save();
  },
  _checkReverseLevel: function (arg0) {
    var local0 = arg0.idx + 100;
    var local1 = game.LevelData.getCategory(local0);
    var local2 = local1.getLevelData(this.idx);
    if (local2) {
      local2.lock = false;
      game.Data.newMoonLevelIdx = local2.levelNo;
      cc.log("game.Data.newMoonLevelIdx + " + game.Data.newMoonLevelIdx);
    }
    local1.save();
  },
  levelFail: function (arg0) {
    this.levelData.continueKilledCount = (this.levelData.continueKilledCount + 1);
    this.lastKilledPos = arg0;
    game.LevelData.selectedCategory.save();
  },
  gameBegin: function (arg0) {
    if (!arg0) {
      cc.log(" !!!!!!!!!! ======= reset level data!!");
      this.tempStarAchieved = 0;
    }
  },
  starAchieved: function (arg0) {
    switch (arg0) {
      case 1:
        this.tempStarAchieved = this.tempStarAchieved | 1;
        break;
      case 2:
        this.tempStarAchieved = this.tempStarAchieved | 16;
        break;
      case 3:
        this.tempStarAchieved = this.tempStarAchieved | 256;
        break;
    }
  },
  isTempStarAchieved: function (arg0) {
    switch (arg0) {
      case 1:
        return (this.tempStarAchieved & 1) > 0;
      case 2:
        return (this.tempStarAchieved & 16) > 0;
      case 3:
        return (this.tempStarAchieved & 256) > 0;
    }
    return false;
  },
  isStarAchieved: function (arg0) {
    switch (arg0) {
      case 1:
        return (this.levelData.star & 1) > 0;
      case 2:
        return (this.levelData.star & 16) > 0;
      case 3:
        return (this.levelData.star & 256) > 0;
    }
    return false;
  },
  getCurrentStarAchieved: function () {
    return this.tempStarAchieved;
  },
  getAchievedStarCount: function () {
    var local0 = 0;
    for (var i = 1; i < 4; i++) {
      if (this.isStarAchieved(i)) {
        local0++;
      }
    }
    return local0;
  },
  tempReverseKeyCollected: function () {
    this.tempKeyCollected = true;
  },
  isLevelReverseKeyCollected: function () {
    return this.levelData.isReverseKeyCollected;
  },
  getLevelNo: function () {
    return this.levelData.levelNo;
  },
  isAllCoinCollect: function () {
    return this.levelData.isCollectAllCoin;
  },
  isNextLevelAvailable: function () {
    var local0 = game.LevelData.selectedCategory.getLevelData(this.idx + 1);
    if (local0 && !local0.lock) {
      return true;
    }
    return false;
  },
  isHaveNextLevel: function () {
    cc.log("is have next level");
    var local0 = game.LevelData.selectedCategory.getLevelData(this.idx + 1);
    if (local0 && !local0.lock) {
      cc.log("is have next level 11111111");
      return true;
    }
    cc.log("is have next level 22222222");
    return false;
  },
  isGoNextCategory: function () {
    if (game.Data.isClearVersion || game.Data.isFreeGame) {
      var local0 = game.LevelData.selectedLevel;
      var local1 = local0 && local0.isLevelReverseKeyCollected();
      if (game.Data.isSelectingReverseWorld && !local1) {
        return false;
      }
      if (game.LevelData.selectedCategory.idx == 5 && game.LevelData.selectedLevel.idx == game.LevelData.selectedCategory.levelCount - 1) {
        return false;
      }
      var local2 = game.LevelData.getNextCategory();
      if (!local2 || !local2.categoryReady) {
        return false;
      }
      game.LevelData.selectedCategory = local2;
      var local3 = local2.getLevelData(0);
      game.LevelData.selectedLevel = this.getController(0, local3);
      return true;
    }
    return false;
  },
  setNextSelectLevel: function () {
    var local0 = game.LevelData.selectedCategory.getLevelData((this.idx + 1));
    game.LevelData.selectedLevel = this.getController((this.idx + 1), local0);
  },
  goNextLevel: function () {
    var local0 = game.LevelData.selectedCategory.getLevelData(this.idx + 1);
    if (local0 && !local0.lock) {
      game.LevelData.selectedLevel = this.getController(this.idx + 1, local0);
      return true;
    }
    if (game.Data.isClearVersion || game.Data.isFreeGame) {
      var local1 = game.LevelData.selectedLevel;
      var local2 = local1 && local1.isLevelReverseKeyCollected();
      if (game.Data.isSelectingReverseWorld && !local2) {
        return false;
      }
      if (game.LevelData.selectedCategory.idx == 5 && game.LevelData.selectedLevel.idx == game.LevelData.selectedCategory.levelCount - 1) {
        return false;
      }
      var local3 = game.LevelData.getNextCategory();
      if (!local3) {
        return false;
      }
      game.LevelData.selectedCategory = local3;
      local0 = local3.getLevelData(0);
      game.LevelData.selectedLevel = this.getController(0, local0);
      return true;
    }
    return false;
  }
};
