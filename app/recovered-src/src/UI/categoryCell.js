// Source-like reconstruction from UI/categoryCell.dis

function __categoryCellPad2(value) {
  value = Math.floor(value);
  return value < 10 ? "0" + value : "" + value;
}

var CategoryCell = vee.Class.extend({
  _idx: 0,
  lyContent: null,
  lbTitle: null,
  lbPercent: null,
  lbTime: null,
  spBG: null,
  spLock: null,
  spLockBg: null,
  spLockStar: null,
  lbStarNum: null,
  nodeLockDesc: null,
  spLockLbStar: null,
  isLock: true,
  categoryReady: false,
  width: 0,
  _categoryData: null,
  _origin: 0,

  onCreate: function () {
    this._origin = this.rootNode.getPosition();
    this._origin.y += 0;
  },

  zqdebugLog: function () {
    cc.log("zqdebug category cell index====" + this._idx);
  },

  setIndex: function (idx) {
    this._idx = idx;

    var data = game.LevelData.getCategory(idx);
    game.LevelData.checkLevelLockState(idx);

    this.lbTitle.setString(vee.Utils.getLocalizedStringForKey(data.title));
    this.lbPercent.setString(data.percent + "%");

    var bg = data.bg;
    var readyToUnlock = false;
    this.categoryReady = data.categoryReady;

    if (game.Data.isFreeGame || game.Data.isClearVersion) {
      this.lbStarNum.setVisible(false);
      this.nodeLockDesc.setVisible(false);

      this.isLock = data.lockStatus === game.LevelData.LockStatus.LOCKED;
      this.spLock.setVisible(this.isLock);
      this.spLockBg.setVisible(this.isLock);
      this.spLockStar.setVisible(this.isLock);
      this.lbPercent.setVisible(!this.isLock);

      if (this.isLock) {
        if (game.Data.isSelectingReverseWorld) {
          this.playAnimate("Default Timeline");
        }

        if (!this.categoryReady) {
          if (game.Data.isSelectingReverseWorld) {
            this.lbTitle.setString(vee.Utils.getLocalizedStringForKey("COMING SOON"));
            bg = res.level_image_mid_negative_6_png;
          } else {
            this.lbTitle.setString(vee.Utils.getLocalizedStringForKey("MORE GAME"));
            bg = res.level_image_moregames_png;
            this.spLock.setVisible(false);
            this.spLockBg.setVisible(false);
            this.spLockStar.setVisible(false);
            this.lbStarNum.setVisible(false);
            this.spLockLbStar.setVisible(false);
          }
        }
      } else {
        this.changeToPercentage();
        if (game.Data.isSelectingReverseWorld) {
          bg = data.bgUnlock;
        }
      }
    } else {
      if (data.lockStatus === game.LevelData.LockStatus.LOCKED || !this.categoryReady) {
        this.spLock.setVisible(true);
        this.spLockBg.setVisible(true);
        this.spLockStar.setVisible(true);

        if (!this.lbTime.isVisible()) {
          this.lbStarNum.setString(game.LevelData.getStar() + " / " + data.unlockStar);
          this.lbStarNum.setOpacity(255);
          this.lbStarNum.setVisible(true);
          this.nodeLockDesc.setVisible(true);
        }

        this.lbPercent.setVisible(false);
        this.isLock = true;

        if (game.Data.isSelectingReverseWorld) {
          this.playAnimate("Default Timeline");
        }

        if (!this.categoryReady) {
          if (game.Data.isSelectingReverseWorld) {
            this.lbTitle.setString(vee.Utils.getLocalizedStringForKey("COMING SOON"));
            bg = res.level_image_mid_negative_6_png;
          } else {
            this.lbTitle.setString(vee.Utils.getLocalizedStringForKey("MORE GAME"));
            bg = res.level_image_moregames_png;
            this.spLock.setVisible(false);
            this.spLockBg.setVisible(false);
            this.spLockStar.setVisible(false);
            this.lbStarNum.setVisible(false);
            this.spLockLbStar.setVisible(false);
          }
        }
      } else if (data.lockStatus === game.LevelData.LockStatus.READY_TO_UNLOCK) {
        this.spLock.setVisible(true);
        this.spLockBg.setVisible(true);
        this.nodeLockDesc.setVisible(true);
        this.spLockLbStar.setVisible(false);
        this.lbStarNum.setVisible(false);
        readyToUnlock = true;
      } else {
        this.changeToPercentage();
        if (game.Data.isSelectingReverseWorld) {
          bg = data.bgUnlock;
        }
      }
    }

    if (game.Data.isSelectingReverseWorld) {
      this.spLockStar.setVisible(false);
      this.lbStarNum.setVisible(false);
      this.lbPercent.setVisible(false);
      this.nodeLockDesc.setVisible(false);
    }

    this.spBG.initWithFile(bg);
    this.lyContent.setCascadeOpacityEnabled(true);
    this.nodeLockDesc.setCascadeOpacityEnabled(true);
    this.width = this.lyContent.getContentSize().width;
    this._categoryData = data;

    return game.Data.isFreeGame || game.Data.isClearVersion ? this.isLock : readyToUnlock;
  },

  _getSunWorldBg: function (idx) {
    var data = game.LevelData.getCategory(idx - 100);
    return data ? data.bg : null;
  },

  setLeftTime: function (leftTime) {
    this.levelTimeLeft = parseInt(leftTime, 10);
    this.lbPercent.setVisible(false);
    this.lbStarNum.setVisible(false);
    this.lbTime.setVisible(true);
    this.spLockLbStar.setVisible(false);
    vee.Utils.scheduleCallbackForTarget(this.rootNode, this.updateLevelTimeCounter.bind(this), 1);
  },

  setTimeStr: function () {
    this.lbTime.setString(this.getLevelTimeStr(this.levelTimeLeft));
  },

  getLevelTimeStr: function (timeLeft) {
    var hours = Math.floor(timeLeft / 3600);
    var minutes = Math.floor(timeLeft / 60 - hours * 60);
    return __categoryCellPad2(hours) + ":" + __categoryCellPad2(minutes);
  },

  updateLevelTimeCounter: function () {
    this.levelTimeLeft -= 1;
    if (this.levelTimeLeft > 0) {
      this.setTimeStr();
      return;
    }

    vee.Utils.unscheduleAllCallbacksForTarget(this.rootNode);
    vee.data.level61_ts = 0;
    game.Data.oLvSelectCtl.unlockCategoryByIdx(7, false);
    vee.saveData();
  },

  getUnlockStarDesc: function (isReverseWorld) {
    var category = game.LevelData.getCategory(this._idx);
    if (isReverseWorld) {
      var sunCategory = game.LevelData.getCategory(this._idx - 100);
      return category.levelCount * 3 - sunCategory.getCategoryStarCount();
    }
    return category.unlockStar - game.LevelData.getStar();
  },

  unlockAnimate: function (callback) {
    this.playAnimate("Unlock", function () {
      game.LevelData.setLockStatus(this._idx, game.LevelData.LockStatus.UNLOCKED);
      this.isLock = false;
      if (callback) {
        callback();
      }
    }.bind(this));
  },

  changeToPercentage: function () {
    this.spLock.setVisible(false);
    this.spLockBg.setVisible(false);
    this.spLockStar.setVisible(false);
    this.nodeLockDesc.setVisible(false);
    this.lbPercent.setVisible(true);
    this.lbTime.setVisible(false);
    this.isLock = false;
  },

  setOffset: function (offset) {
    this.rootNode.setPositionY(this._origin.y - 30 + 30 * offset);
    this.spBG.setOpacity(127 + 128 * offset);

    var opacity = Math.max(0, 512 * (offset - 0.5) - 1);
    this.lbTitle.setOpacity(opacity);
    this.lbPercent.setOpacity(opacity);
    if (this._idx === 6) {
      this.lbTime.setOpacity(opacity);
    }
    this.nodeLockDesc.setOpacity(opacity);
  },

  select: function (duration) {
    this.rootNode.runAction(cc.moveTo(duration, this._origin));
    this.spBG.runAction(cc.fadeTo(duration, 255));
    this.lbTitle.runAction(cc.fadeTo(duration, 255));
    this.lbPercent.runAction(cc.fadeTo(duration, 255));
    if (this._idx === 6) {
      this.lbTime.runAction(cc.fadeTo(duration, 255));
    }
    this.nodeLockDesc.runAction(cc.fadeTo(duration, 255));
    return this;
  },

  getCategoryData: function () {
    return this._categoryData;
  },

  disSelect: function (duration) {
    var target = vee.Utils.pAdd(cc.p(0, -30), this._origin);

    if (duration > 0.02) {
      this.rootNode.runAction(cc.moveTo(duration, target));
      this.spBG.runAction(cc.fadeTo(duration, 128));
      this.lbTitle.runAction(cc.fadeTo(duration, 0));
      this.lbPercent.runAction(cc.fadeTo(duration, 0));
      if (this._idx === 6) {
        this.lbTime.runAction(cc.fadeTo(duration, 0));
      }
      this.nodeLockDesc.runAction(cc.fadeTo(duration, 0));
      return;
    }

    this.rootNode.setPosition(target);
    this.spBG.setOpacity(128);
    this.lbTitle.setOpacity(0);
    this.lbPercent.setOpacity(0);
    if (this._idx === 6) {
      this.lbTime.setOpacity(0);
    }
    this.nodeLockDesc.setOpacity(0);
  },

  enter: function () {
    this.lbTime.setVisible(false);
    this.playAnimate("Enter");
  },

  out: function () {
    this.lbTime.setVisible(false);
    this.playAnimate("Out");
  }
});

var ComingSoonCell = CategoryCell.extend({
  spBG: null,
  isComingSoon: true,

  setIndex: function (idx) {
    this._idx = idx;
    this.spBG.setVisible(false);
  },

  showPreRegistCell: function () {
  },

  refresh: function () {
    cc.log("zq debug coming soon cell ==============");
    this.spBG.setTexture(res.level_image_moregames_png);
  },

  select: function (duration) {
    this.rootNode.runAction(cc.moveTo(duration, this._origin));
    this.spBG.runAction(cc.fadeTo(duration, 255));
    return this;
  },

  disSelect: function (duration) {
    this.rootNode.runAction(cc.moveTo(duration, vee.Utils.pAdd(cc.p(0, -30), this._origin)));
    this.spBG.runAction(cc.fadeTo(duration, 128));
  },

  setOffset: function (offset) {
    this.rootNode.setPositionY(this._origin.y - 30 + 30 * offset);
    this.spBG.setOpacity(127 + 128 * offset);
  }
});
