var LyGameWin = vee.Class.extend({
  nodeTL: null,
  nodeTR: null,
  btnRetry: null,
  btnNext: null,
  btnQuit: null,
  btnShare: null,
  btnKTPlay: null,
  nodeStar: null,
  nodeAvatar: null,
  lbTargetCoin: null,
  lbCoinNum: null,
  lbCoinPerfect: null,
  spCoinProgress: null,
  spCoinIcon: null,
  spAvatarHead: null,
  nodeProgressDesc: null,
  nodeProgress: null,
  nodeShare: null,
  _tempStar: null,
  oPlayer: null,
  oCoinCtl: null,
  oGettedCoinCtl: null,
  lyNormalBG: null,
  ly3starBG: null,
  lyMiniBG: null,
  ccbRecord: null,
  coinStartPos: null,
  coinPos: cc.p(507, 297),
  isShowMini: false,
  blockButton: false,
  unlockedIdx: -1,
  _isOver: false,
  _coin: 0,
  _gettedCoin: 0,
  _nextAvatar: null,
  _isUnlock: false,
  _showReward: true,
  _shieldTouch: false,
  _defaultCoinSpriteFrame: null,

  onCreate: function () {
    if (!VeeRecordButton.isPluginRecording) {
      this.ccbRecord.setVisible(false);
    }
    vee.Audio.playEffect(res.inGame_function_win_mp3);
    this.handleKey(true);
  },

  onKeyBack: function () {
    this.onQuit();
  },

  onExit: function () {
    game.Data.oLyGameOver = null;
    cc.spriteFrameCache.removeSpriteFramesFromFile(res.item_coin_frames_plist);
    cc.spriteFrameCache.removeSpriteFramesFromFile(res.item_plist);
  },

  initController: function () {
    cc.log("game win init controller");

    if (game.Data.isAndroid && game.Data.version.isAutoSave) {
      vee.GameCenter.autoSaveGame(jsb.fileUtils.getWritablePath(), "autoSave");
    }

    if (game.Data.version.curVersion === VERSION.TVOS_GENUINE) {
      vee.Common.getInstance().saveGameData();
    }

    vee.Controller.initSelector(3, 1, this.onQuit.bind(this), cc.p(1, 0));
    vee.Controller.registerItemByButton(
      BtnShop.instance.btnOpenStore,
      cc.p(2, 0),
      this.ccbAvatarStore.controller.onOpenStore.bind(this),
      res.mfi_home_avatar_on_png
    );
    vee.Controller.registerItemByButton(
      this.btnNext,
      cc.p(1, 0),
      this.onNext.bind(this),
      "res/mfi_pause_btn_big.png"
    );

    if (game.Data.stageType !== game.StageType.Mini) {
      vee.Controller.registerItemByButton(
        this.btnRetry,
        cc.p(0, 0),
        this.onRetry.bind(this),
        "res/mfi_pause_btn_small.png"
      );
    }

    vee.Controller.activeSelector();

    if (vee.Utils.isRecordAvaliable()) {
      var recordController = this.ccbRecord.controller;
      vee.Controller.registerButtonAction([
        vee.KeyCode.AXIS_LEFT_TRIGGER,
        vee.KeyCode.BUTTON_LEFT_SHOULDER
      ], recordController.onTouch.bind(recordController));
    }

    var storeController = this.ccbAvatarStore.controller;
    vee.Controller.registerButtonAction([
      vee.KeyCode.AXIS_RIGHT_TRIGGER,
      vee.KeyCode.BUTTON_RIGHT_SHOULDER
    ], storeController.onOpenStore.bind(storeController));

    vee.Controller.activeButton();
  },

  ccbInit: function () {
    vee.Controller.clearAll();
    game.Data.oLyGameOver = this;
    game.Data.stageFinish(game.FinishType.WIN);
    game.Data.addMiniCount();

    this.spCoinProgress.getTexture().setAliasTexParameters();
    if (!this._defaultCoinSpriteFrame && this.spCoinIcon && this.spCoinIcon.getSpriteFrame) {
      this._defaultCoinSpriteFrame = this.spCoinIcon.getSpriteFrame();
    }
    this._initAvatarStore();
    this._checkMini();
    this.checkAvatar(game.Data.getTempCoin());

    this.oCoinCtl = vee.ScoreController.registerController(this.lbTargetCoin, this._coin, LyGameWin.formatFunc);
    this.oGettedCoinCtl = vee.ScoreController.registerController(this.lbCoinNum, this._gettedCoin);

    this._checkBigStar();
    this._checkStartAdSign();
    game.Data.oLvCtl.complete();
    vee.GameCenter.submitScore(game.LevelData.getStar(), 0);
    game.LevelData.save();
    this._logAnalyticsEvent();
    this._checkNewMoonWorld();

    vee.PopMgr.setNodePos(this.nodeTL, vee.PopMgr.PositionType.TopLeft);
    vee.PopMgr.setNodePos(this.nodeTR, vee.PopMgr.PositionType.TopRight);
    this.nodeTL.runAction(cc.sequence(
      cc.delayTime(3),
      cc.callFunc(this.initController.bind(this)),
      cc.delayTime(0.2),
      cc.callFunc(this.removeGame.bind(this)),
      cc.delayTime(1),
      cc.callFunc(this.startProgress.bind(this))
    ));

    if (this.btnKTPlay) {
      this.btnKTPlay.setVisible(game.Data.version.isKTPlay);
    }

    if (this.nodeShare && vee.KTPlay && typeof vee.KTPlay.isNewNotice === "function" && vee.KTPlay.isNewNotice()) {
      this.spDot = new cc.Sprite(res.image_redot_png);
      this.nodeShare.addChild(this.spDot);
      this.spDot.setPosition(cc.p(52, 34));
    }
  },

  _initAvatarStore: function () {
    var avatarStore = LyAvatarStore.load();
    this.rootNode.addChild(avatarStore);
    avatarStore.controller.onLoaded();
  },

  showAdCallbackForOpen: function () {
    this._shieldTouch = false;

    if (game.Data.willShowVideoAd) {
      vee.Ad.showRevivalVideoAd();
      return;
    }

    if (game.Data.isFreeGame && !game.Data.shownVideoAd) {
      cc.log("zq debug lyGameWin ccbInit");
      vee.Ad.showInterstitialByOnlineConfig("game_win");
      vee.Analytics.UGameEvent.showAdEvent("game_win", "interstial");
    }

    game.Data.shownVideoAd = false;
  },

  _checkMini: function () {
    if (game.Data.stageType === game.StageType.Mini) {
      game.MiniLevelData.setMiniGameProgress(2, game.LevelData.selectedCategory.idx, game.Data.performingTMXIdx);
      this.btnRetry.setVisible(false);

      if (game.Data.version.isKTPlay) {
        this.playAnimate("mini endKT");
      } else {
        this.playAnimate("mini end");
      }
    } else if (game.Data.version.isKTPlay) {
      this.playAnimate("normalKT");
    } else {
      this.playAnimate("normal");
    }

    cc.log("mini game = " + game.Data.getMiniCount());

    var miniCount = game.Data.getMiniCount();
    this.miniIdx = game.MiniLevelData.getMiniGameIdx(game.LevelData.selectedCategory.idx);

    if (miniCount >= 2 && this.miniIdx !== null && vee.Utils.isLucky(miniCount / (miniCount + 1))) {
      this.blockButton = true;
      this.isShowMini = true;
    }

    if (game.Data.isAllLevelOpen) {
      this.blockButton = true;
      this.isShowMini = true;
    }
  },

  _checkBigStar: function () {
    if (game.Data.stageType === game.StageType.Mini) {
      this.lyNormalBG.setVisible(true);
      return;
    }

    this._tempStar = game.LevelData.selectedLevel.getCurrentStarAchieved();
    cc.log("star = " + this._tempStar);

    var delay = 3;
    var newStarIdx = 1;

    for (var i = 1; i < 4; i++) {
      var starNode = this["nodeStar" + i];
      if (!starNode) {
        continue;
      }

      if (game.LevelData.selectedLevel.isStarAchieved(i)) {
        starNode.controller.setGettedStar();
      }

      cc.log("debug::::IDX = " + i + "    " + this.checkTempStarArchive(i));

      if (this.checkTempStarArchive(i)) {
        starNode.starIdx = newStarIdx;
        starNode.runAction(cc.sequence(
          cc.delayTime(delay),
          cc.callFunc(function () {
            this.controller.show();
            vee.Audio.playEffect("res/inGame_function_winStar" + this.starIdx + ".mp3");
          }.bind(starNode))
        ));
        newStarIdx++;
        delay += 0.4;
      }
    }

    if (game.Data.collectedStarCount === 3) {
      this.ly3starBG.setVisible(true);
      if (game.Data.getPlayCount() > 5 && !game.Data.isRated()) {
        LyGameWin.isShowRate = true;
      }
    } else {
      this.lyNormalBG.setVisible(true);
    }
  },

  _checkStartAdSign: function () {
    var isPerfect;
    if (game.Data.stageType === game.StageType.Event) {
      isPerfect = game.Data.isLastStageAllCoin;
    } else {
      isPerfect = game.Data.getTempCoin() >= game.Data.stageMaxCoin;
    }

    this.lbCoinPerfect.setVisible(isPerfect);
    game.LevelData.selectedLevel.levelComplete(isPerfect);
  },

  _checkNewMoonWorld: function () {
    game.Data.newReverseWorldIdx = -1;
    var count = game.LevelData.categoryCount - 1;
    for (var i = 0; i < count; i++) {
      game.LevelData.checkLevelLockState(i);
    }
  },

  _logAnalyticsEvent: function () {
    var categoryIdx = game.LevelData.selectedCategory.idx + 1;
    var levelIdx = game.LevelData.selectedLevel.idx + 1;
    var stageName = "";

    if (game.Data.stageType === game.StageType.Mini) {
      stageName = "Mini";
    } else if (game.Data.stageType === game.StageType.Event) {
      stageName = "Event";
    }

    vee.Analytics.logEvent(
      "GameWin" + stageName + categoryIdx + "0" + levelIdx,
      {
        star: "" + game.LevelData.selectedLevel.getAchievedStarCount(),
        coin: "" + this._gettedCoin
      }
    );
  },

  checkAvatar: function (coin) {
    this._coin = game.LevelData.getCoin();
    if (!this._coin) {
      this._coin = 0;
    }

    this._gettedCoin = coin;
    var nextAvatar = LyGameWin.shouldShowAvatarProgress() ? game.AvatarData.getNextAvatar() : null;
    var progress = 1;

    if (nextAvatar) {
      this._coinFrameName = nextAvatar.coinFrame;
      this.spAvatarHead.setTexture(nextAvatar.headName);
      this.setProgressEnable(true);
      LyGameWin.targetCoin = nextAvatar.price;

      progress = this._coin / nextAvatar.price;
      this.spCoinProgress.setScaleX(progress * this._maxPercent);
      this._nextAvatar = nextAvatar;

      game.LevelData.addCoin(this._gettedCoin);
      if (this._gettedCoin === 0) {
        this._progressEnable = false;
      }

      var totalCoin = game.LevelData.getCoin();
      if (totalCoin >= nextAvatar.price) {
        game.LevelData.resetCoin(totalCoin);
        var unlockIdx = nextAvatar.idx;
        if (unlockIdx >= 11) {
          unlockIdx--;
        }

        game.AvatarData.avatarPurchased(unlockIdx);
        vee.Analytics.UGameEvent.unlockRoleEvent("coin", unlockIdx);
        this.unlockedIdx = unlockIdx;
        game.Data.setUnlocking(false);
        this._isUnlock = true;
        this.blockButton = true;
      } else {
        this._isUnlock = false;
      }

      this.spCoinIcon.setSpriteFrame(nextAvatar.coinFrame);
      return;
    }

    this._isUnlock = false;
    if (!game.AvatarData.isAllRole()) {
      this.isShowMini = false;
    }
    this._nextAvatar = null;
    this._coinFrameName = LyGameWin.defaultCoinFrameName;
    if (this.spCoinIcon && this._defaultCoinSpriteFrame) {
      this.spCoinIcon.setSpriteFrame(this._defaultCoinSpriteFrame);
    }
    this.setProgressEnable(false);
    this.blockButton = false;
  },

  checkTempStarArchive: function (idx) {
    switch (idx) {
      case 1:
        return (this._tempStar & 1) > 0;
      case 2:
        return (this._tempStar & 16) > 0;
      case 3:
        return (this._tempStar & 256) > 0;
      default:
        return false;
    }
  },

  checkHasUnlockRoleBySpecialLevel: function () {
    if (game.AvatarData.checkUnlockMidAutRole()) {
      if (game.Data.version.curVersion === VERSION.TVOS_GENUINE) {
        game.AvatarData.avatarPurchased(12);
        vee.Analytics.UGameEvent.unlockRoleEvent("allStar", 12);
        LyUnlock.show(12);
      } else {
        AlertFacebook.show();
      }
      return true;
    }

    if (game.AvatarData.checkUnlockHolloweenRole()) {
      game.AvatarData.avatarPurchased(13);
      vee.Analytics.UGameEvent.unlockRoleEvent("allStar", 13);
      LyUnlock.show(13);
      return true;
    }

    if (game.AvatarData.checkUnlockThanksgivingRole()) {
      game.AvatarData.avatarPurchased(14);
      vee.Analytics.UGameEvent.unlockRoleEvent("allStar", 14);
      LyUnlock.show(14);
      return true;
    }

    return false;
  },

  _showAlerts: function () {
    if (this._isOver) {
      return;
    }

    if (this.checkHasUnlockRoleBySpecialLevel()) {
      return;
    }

    this.blockButton = false;

    if (this.unlockedIdx >= 0) {
      var callback = null;
      if (game.Data.newReverseWorldIdx > -1) {
        callback = this._showMoonCategoryAlert.bind(this);
      } else if (game.Data.newMoonLevelIdx > -1) {
        callback = this._showMoonLevelAlert.bind(this);
      }

      LyUnlock.show(this.unlockedIdx, callback);
      this.oCoinCtl.setNumber(LyGameWin.targetCoin);
      this.unlockedIdx = -1;
      return;
    }

    if (game.Data.newReverseWorldIdx > -1) {
      this._showMoonCategoryAlert();
      return;
    }

    if (game.Data.newMoonLevelIdx > -1) {
      this._showMoonLevelAlert();
      return;
    }

    if (this.isShowMini) {
      LySpecial.show();
      this.isShowMini = false;
      return;
    }

    if (this._nextAvatar && this._showReward) {
      LyReward.showLogic(true, this._nextAvatar.price - this._coin);
      this._showReward = false;
      return;
    }

    var shouldShowRate = (LyGameWin.isShowRate && !this._isUnlock) ||
      (vee.dataManager.isNewVersionRate() &&
       game.LevelData.selectedCategory &&
       game.LevelData.selectedLevel &&
       game.LevelData.selectedLevel.idx > 0);

    if (!shouldShowRate) {
      return;
    }

    if (this.isShowMini) {
      this.blockButton = false;
      this.isShowMini = false;
    }

    if (game.LevelData.selectedCategory && game.LevelData.selectedLevel) {
      var categoryIdx = game.LevelData.selectedCategory.idx + 1;
      var levelIdx = game.LevelData.selectedLevel.idx + 1;
      if (categoryIdx > 1 && levelIdx > 2) {
        LyRate.show();
        LyGameWin.isShowRate = false;
        game.dataManager.setVersionRateFalse();
      }
    }

    game.Data.resetPlayCount();
  },

  _showMoonCategoryAlert: function () {
    LyUnlockedMoonWorld.show(false);
    game.Data.newReverseWorldIdx = -1;
  },

  _showMoonLevelAlert: function () {
    LyUnlockedMoon.show();
  },

  onRetry: function () {
    if (this.blockButton || this._isOver || this._shieldTouch) {
      return;
    }

    vee.Audio.playEffect(res.inGame_menu_click_mp3);
    if (game.Data.costEnergy()) {
      vee.dataManager.setEnergy(vee.dataManager.getEnergy() + 1);
    }

    this.winRetry();
    vee.Controller.deactiveSelector();
    this._isOver = true;
  },

  winRetry: function () {
    cc.log("2 performingTMXIdx = " + game.Data.performingTMXIdx);
    if (game.Data.stageType === game.StageType.Event && game.Data.lastTMXIdx !== null) {
      game.Data.performingTMXIdx = game.Data.lastTMXIdx;
    }

    cc.log("1 performingTMXIdx = " + game.Data.performingTMXIdx);
    vee.Transition.out(res.MapTransition_ccbi, function () {
      this._openGame(game.Data.performingTMXIdx, false);
    }.bind(this));
  },

  onNext: function () {
    if (this.blockButton || this._isOver || this._shieldTouch) {
      return;
    }

    cc.log("zq debug 111111111 select level idx===%d", game.LevelData.selectedLevel.idx);

    if (game.LevelData.selectedLevel.isHaveNextLevel()) {
      cc.log("zq debug 2222222222 select level idx===%d", game.LevelData.selectedLevel.idx);
      if (game.LevelData.selectedCategory.idx === 9 &&
          !game.LevelData.checkParkourlevelUnlock(game.LevelData.selectedLevel.idx + 1)) {
        ccbAlertUnlockLevel.show(game.LevelData.selectedLevel.idx + 1, function () {
          game.LevelData.selectedLevel.setNextSelectLevel();
          this.goNextLevelEvent();
        }.bind(this));
      } else {
        cc.log("zq debug lygame win level event");
        game.LevelData.selectedLevel.setNextSelectLevel();
        this.goNextLevelEvent();
      }
      return;
    }

    if (game.LevelData.selectedLevel.isGoNextCategory()) {
      this.goNextLevelEvent();
      return;
    }

    vee.Transition.out(res.MapTransition_ccbi, function () {
      LyLevelSelect.show();
    }.bind(this));
    vee.Controller.deactiveSelector();
    this._isOver = true;
  },

  goNextLevelEvent: function () {
    if (game.Data.costEnergy()) {
      vee.dataManager.setEnergy(vee.dataManager.getEnergy() + 1);
    }

    this.winNext();
    vee.Controller.deactiveSelector();
    this._isOver = true;
  },

  winNext: function () {
    game.Logic.startGame(game.LevelData.getCurrentLevelMapIndex(), false);
  },

  onShare: function () {
    if (this.blockButton) {
      return;
    }
  },

  onQuit: function () {
    if (this.blockButton || this._isOver || this._shieldTouch) {
      return;
    }

    vee.dataManager.setEnergy(vee.dataManager.getEnergy() + 1);
    vee.Transition.out(res.MapTransition_ccbi, function () {
      LyLevelSelect.show();
    }.bind(this));
    vee.Controller.deactiveSelector();
    this._isOver = true;
  },

  onKTPlay: function () {
    if (vee.KTPlay && typeof vee.KTPlay.show === "function") {
      vee.KTPlay.show();
    }
  },

  startProgress: function () {
    this._progressAnimate();
  },

  removeGame: function () {
    var objects = game.Logic.dynamicObjMap.getObjects();
    for (var key in objects) {
      var obj = objects[key];
      if (obj && obj._eleType === game.EleType.Enemy) {
        obj.die();
      }
    }

    vee.PopMgr.closeLayerByCtl(game.Logic.oLyGame);
  },

  miniIdx: null,

  showMini: function () {
    game.MiniLevelData.setMiniGameProgress(1, game.LevelData.selectedCategory.idx, this.miniIdx);
    var endCallback = function () {
      this._openGame(this.miniIdx, false, game.StageType.Mini);
    }.bind(this);

    if (game.Data.isIOSCN || game.Data.isAndroid) {
      this.playAnimate("miniKT", endCallback);
    } else {
      this.playAnimate("mini", endCallback);
    }
  },

  _openGame: function (mapIdx, isRetry, stageType) {
    vee.PopMgr.closeAll();
    cc.director.purgeCachedData();
    vee.PopMgr.popCCB("res/veeGameLayer.ccbi");
    cc.log("opening level: " + mapIdx);
    game.Data.oLyGame.onLoaded();
    game.Data.oLyGame.initStage(mapIdx, isRetry, stageType);
  },

  _progressEnable: true,

  setProgressEnable: function (enabled) {
    this._progressEnable = enabled;
    this.nodeProgress.setVisible(enabled);
    this.nodeProgressDesc.setVisible(enabled);
  },

  _maxPercent: 42,

  _progressAnimate: function () {
    cc.log("_progressEnable = " + this._progressEnable);
    if (!this._progressEnable) {
      this._showAlerts();
      return;
    }

    if (!this._nextAvatar) {
      return;
    }

    this.spAvatarHead.setTexture(this._nextAvatar.headName);
    var price = this._nextAvatar.price;
    LyGameWin.targetCoin = price;

    if (this._isUnlock) {
      this._showCoinParticle(price - this._coin);
    } else {
      this._showCoinParticle(this._gettedCoin);
    }
  },

  _coinOff: 0,
  _coinCount: 0,
  _coinItr: 0,
  _coinFrameName: null,

  _showCoinParticle: function (coinOff) {
    this._coinOff = coinOff;
    this._coinItr = coinOff > 40 ? Math.ceil(coinOff / 40) : 1;
    this._coinCount = 0;
    this.coinStartPos = vee.Utils.pAdd(this.lbCoinNum.getPosition(), this.nodeTR.getPosition());
    vee.Utils.scheduleCallbackForTarget(this.nodeTR, this.updateShowCoin.bind(this), 0.05);
  },

  updateShowCoin: function () {
    if (this._coinOff <= 0) {
      vee.Utils.unscheduleAllCallbacksForTarget(this.nodeTR);
      return;
    }

    if (this._coinItr > this._coinOff) {
      this._coinItr = this._coinOff;
    }

    this._coinOff -= this._coinItr;
    this._gettedCoin -= this._coinItr;
    this.oGettedCoinCtl.setNumber(this._gettedCoin);
    this._coinCount += this._coinItr;

    var coinSprite = new cc.Sprite("#" + this._coinFrameName);
    coinSprite.setPosition(this.coinStartPos);
    coinSprite.itr = this._coinItr;
    if (this._coinOff <= 0) {
      coinSprite.isOver = true;
    }

    coinSprite.runAction(cc.sequence(
      cc.jumpTo(0.5, this.coinPos.x, this.coinPos.y, 100, 1),
      cc.callFunc(function () {
        this._coin += coinSprite.itr;
        this.oCoinCtl.setNumber(this._coin);
        this.spCoinProgress.stopAllActions();
        this.spCoinProgress.runAction(cc.scaleTo(
          0.04,
          this._coin / LyGameWin.targetCoin * this._maxPercent,
          1
        ));

        if (coinSprite.isOver) {
          this._showAlerts();
        }

        coinSprite.removeFromParent();
        vee.Audio.playEffect(res.inGame_function_countCoins_mp3);
      }.bind(this))
    ));

    this.rootNode.addChild(coinSprite, 10);
  },

  changeAvatar: function (idx) {
    var avatarData = game.AvatarData.getAvatarData(idx);
    if (!avatarData) {
      return;
    }

    this.nodeAvatar.removeAllChildren();
    var player = ElePlayer.create(avatarData.role);
    this.nodeAvatar.addChild(player.container);
    player.controller.playAnimate("huxi_1");
  }
});

LyGameWin.show = function () {
  var ccb = res.GameWin_ccbi;
  if (game.Data.checkIs61()) {
    ccb = res.GameWinChild_ccbi;
  }

  var layer = vee.PopMgr.popCCB(ccb, {alpha: 0});
  layer.controller.ccbInit();
  return layer;
};

LyGameWin.targetCoin = null;
LyGameWin.defaultCoinFrameName = "Coin_small.png";

LyGameWin.shouldShowAvatarProgress = function () {
  return !!(game.Data && game.Data.stageType === game.StageType.Event);
};

LyGameWin.formatFunc = function (label, value) {
  label.setString(value + " / " + LyGameWin.targetCoin);
};

LyGameWin.isShowRate = false;
