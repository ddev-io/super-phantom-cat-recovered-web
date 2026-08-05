function __goCall(obj, methodName) {
  if (!obj || typeof obj[methodName] !== "function") {
    return undefined;
  }
  return obj[methodName].apply(obj, Array.prototype.slice.call(arguments, 2));
}

function __goPoint(x, y) {
  return (typeof cc !== "undefined" && cc.p) ? cc.p(x, y) : { x: x, y: y };
}

function __goVisible(node, visible) {
  __goCall(node, "setVisible", !!visible);
}

function __goNumberController(label, value, formatter) {
  if (vee.ScoreController && typeof vee.ScoreController.registerController === "function") {
    return vee.ScoreController.registerController(label, value || 0, formatter);
  }
  __goSetString(label, value || 0);
  return {
    setNumber: function (number) {
      if (formatter) {
        formatter(label, number || 0);
      } else {
        __goSetString(label, number || 0);
      }
    }
  };
}

function __goSetString(label, value) {
  __goCall(label, "setString", String(value));
}

function __goSetScaleX(node, scaleX) {
  if (!node) {
    return;
  }
  if (isNaN(scaleX) || !isFinite(scaleX)) {
    scaleX = 0;
  }
  __goCall(node, "setScaleX", Math.max(0, Math.min(1, scaleX)));
}

function __goSetTexture(sprite, textureName) {
  if (sprite && textureName) {
    __goCall(sprite, "setTexture", textureName);
  }
}

function __goSetSpriteFrame(sprite, frameName) {
  if (sprite && frameName) {
    __goCall(sprite, "setSpriteFrame", frameName);
  }
}

function __goResetAvatarProgressFrame(controller) {
  controller._nextAvatar = null;
  controller._coinFrameName = "Coin_small.png";
  __goSetSpriteFrame(controller.spCoinIcon, controller._defaultCoinSpriteFrame);
}

function __goSafePlatformWritablePath() {
  if (typeof jsb !== "undefined" && jsb.fileUtils && typeof jsb.fileUtils.getWritablePath === "function") {
    return jsb.fileUtils.getWritablePath();
  }
  return "";
}

function __goAutoSaveIfNeeded() {
  if (game.Data.isAndroid && game.Data.version && game.Data.version.isAutoSave) {
    __goCall(vee.GameCenter, "autoSaveGame", __goSafePlatformWritablePath(), "autoSave");
  }

  if (game.Data.version && typeof VERSION !== "undefined" && game.Data.version.curVersion === VERSION.TVOS_GENUINE) {
    var common = __goCall(vee.Common, "getInstance");
    __goCall(common, "saveGameData");
  }
}

function __goHideRecordIfUnavailable(controller) {
  if (typeof VeeRecordButton !== "undefined" && !VeeRecordButton.isPluginRecording) {
    __goVisible(controller.ccbRecord, false);
  }
}

function __goPrepareAvatarProgress(controller, ownerClass) {
  if (!controller._defaultCoinSpriteFrame && controller.spCoinIcon && controller.spCoinIcon.getSpriteFrame) {
    controller._defaultCoinSpriteFrame = controller.spCoinIcon.getSpriteFrame();
  }

  controller._coin = __goCall(game.LevelData, "getCoin") || 0;
  controller._gettedCoin = __goCall(game.Data, "getTempCoin") || 0;
  controller._nextAvatar = ownerClass.shouldShowAvatarProgress() ? (__goCall(game.AvatarData, "getNextAvatar") || null) : null;
  controller.unlockedIdx = -1;

  if (!controller._nextAvatar) {
    controller._isUnlock = false;
    __goResetAvatarProgressFrame(controller);
    controller.setProgressEnable(false);
    return;
  }

  var avatar = controller._nextAvatar;
  controller._coinFrameName = avatar.coinFrame || controller._coinFrameName;
  __goSetTexture(controller.spAvatarHead, avatar.headName);
  __goSetSpriteFrame(controller.spCoinIcon, avatar.coinFrame);
  controller.setProgressEnable(true);

  ownerClass.targetCoin = avatar.price || 0;
  __goSetScaleX(controller.spCoinProgress, ownerClass.targetCoin ? (controller._coin / ownerClass.targetCoin) * controller._maxPercent : 0);

  if (controller._gettedCoin) {
    __goCall(game.LevelData, "addCoin", controller._gettedCoin);
  } else {
    controller._progressEnable = false;
  }

  var totalCoin = __goCall(game.LevelData, "getCoin") || controller._coin;
  if (avatar.price && totalCoin >= avatar.price) {
    __goCall(game.LevelData, "resetCoin", totalCoin);

    var idx = avatar.idx;
    if (idx >= 11) {
      idx -= 1;
    }

    __goCall(game.AvatarData, "avatarPurchased", idx);
    if (vee.Analytics && vee.Analytics.UGameEvent) {
      __goCall(vee.Analytics.UGameEvent, "unlockRoleEventParam", "coin", idx);
    }

    controller.unlockedIdx = idx;
    controller._isUnlock = true;
    __goCall(game.Data, "setUnlocking", false);
  } else {
    controller._isUnlock = false;
  }
}

function __goSetHeroTexture(controller) {
  if (!controller.spHero) {
    return;
  }

  var player = game.Data.oPlayerCtl;
  if (game.Data.checkIs61 && game.Data.checkIs61() && player) {
    if (player.ccbName === game.RoleNameStrData.Fox) {
      __goSetTexture(controller.spHero, res.hero_dead_Fox2_png);
      return;
    }
    if (player.ccbName === game.RoleNameStrData.SmallFox) {
      __goSetTexture(controller.spHero, res.hero_dead_Fox1_png);
      return;
    }
  }

  if (game.Data.checkIsMidAutumn && game.Data.checkIsMidAutumn()) {
    __goSetTexture(controller.spHero, res.hero_dead_14_rabbit_png);
    return;
  }

  var eventAvatar = null;
  if (game.Data.checkIsHolloween && game.Data.checkIsHolloween()) {
    eventAvatar = __goCall(game.AvatarData, "getAvatarData", 13);
  } else if (game.Data.checkIsThanksgiving && game.Data.checkIsThanksgiving()) {
    eventAvatar = __goCall(game.AvatarData, "getAvatarData", 14);
  }

  if (eventAvatar && eventAvatar.dieName) {
    __goSetTexture(controller.spHero, eventAvatar.dieName);
    return;
  }

  var avatar = __goCall(game.AvatarData, "getCurrentAvatar");
  if (avatar && avatar.dieName) {
    __goSetTexture(controller.spHero, avatar.dieName);
  }
}

function __goInitGameOverLabels(controller, ownerClass) {
  controller.oCoinCtl = __goNumberController(controller.lbTargetCoin, controller._coin || 0, ownerClass.formatFunc);
  controller.oGettedCoinCtl = __goNumberController(controller.lbCoinNum, controller._gettedCoin || 0);
  __goVisible(controller.lbCoinPerfect, false);
}

function __goLogMissionFailed() {
  if (!game.LevelData.selectedCategory || !game.LevelData.selectedLevel) {
    return;
  }

  var category = game.LevelData.selectedCategory.idx + 1;
  var level = game.LevelData.selectedLevel.idx + 1;
  __goCall(vee.Analytics, "logMissionFailed", "Level" + (category - 100) + "-" + level + "R");
}

function __goOpenGame(revive) {
  __goCall(vee.PopMgr, "closeAll");
  __goCall(cc.director, "purgeCachedData");
  __goCall(vee.PopMgr, "popCCB", "res/veeGameLayer.ccbi");
  cc.log("opening level: " + game.Data.performingTMXIdx);

  if (game.Data.oLyGame) {
    __goCall(game.Data.oLyGame, "onLoaded");
    __goCall(game.Data.oLyGame, "initStage", game.Data.performingTMXIdx, revive);
  }
}

function __goUpdateVisibleProgress(controller, ownerClass) {
  var target = ownerClass.targetCoin || 0;
  var percent = target ? (controller._coin / target) * controller._maxPercent : 0;
  __goSetScaleX(controller.spCoinProgress, percent);
  if (controller.oCoinCtl) {
    controller.oCoinCtl.setNumber(controller._coin || 0);
  }
  if (controller.oGettedCoinCtl) {
    controller.oGettedCoinCtl.setNumber(controller._gettedCoin || 0);
  }
}


var LyGameOverMini = vee.Class.extend({
  nodeTL: null,
  nodeTR: null,
  btnRetry: null,
  btnQuit: null,
  btnAd: null,
  ccbAvatarStore: null,
  lbTargetCoin: null,
  lbCoinNum: null,
  lbCoinPerfect: null,
  spCoinProgress: null,
  spAvatarHead: null,
  spCoinIcon: null,
  nodeProgressDesc: null,
  nodeProgress: null,
  oCoinCtl: null,
  oGettedCoinCtl: null,
  lyNormalBG: null,
  ly3starBG: null,
  lyMiniBG: null,
  ccbRecord: null,
  unlockedIdx: -1,
  coinStartPos: null,
  coinPos: null,
  _coin: 0,
  _gettedCoin: 0,
  _nextAvatar: null,
  _isUnlock: false,
  _progressEnable: true,
  _maxPercent: 0.42,
  _coinOff: 0,
  _coinCount: 0,
  _coinItr: 0,
  _coinFrameName: null,
  _defaultCoinSpriteFrame: null,

  onCreate: function () {
    __goHideRecordIfUnavailable(this);
    game.Data.oLyGameOver = this;
    __goCall(vee.Audio, "playEffect", res.inGame_function_lose_mp3);
    __goCall(game.LevelData, "save");
    __goCall(this, "handleKey", true);
  },

  onKeyBack: function () {
    this.onQuit();
    return true;
  },

  onExit: function () {
    game.Data.oLyGameOver = null;
    if (cc.spriteFrameCache) {
      __goCall(cc.spriteFrameCache, "removeSpriteFramesFromFile", res.item_coin_frames_plist);
      __goCall(cc.spriteFrameCache, "removeSpriteFramesFromFile", res.item_plist);
    }
  },

  ccbInit: function () {},

  onLoaded: function () {
    __goAutoSaveIfNeeded();
    cc.log("MINI OVER onLoaded");
    __goCall(vee.Controller, "clearAll");

    if (game.Data.isFreeGame) {
      cc.log("zq debug lygameovermini onloaded");
      __goCall(vee.Ad, "showInterstitialByOnlineConfig", "mini_over");
      if (vee.Analytics && vee.Analytics.UGameEvent) {
        __goCall(vee.Analytics.UGameEvent, "showAdEvent", "mini_over", "interstial");
      }
    }

    __goCall(vee.Audio, "stopMusic");

    if (game.Data.version && game.Data.version.isKTPlay) {
      __goCall(this, "playAnimate", "LoseKTPlay");
    } else {
      __goCall(this, "playAnimate", "LoseMini");
    }

    if (vee.PopMgr && vee.PopMgr.PositionType) {
      __goCall(vee.PopMgr, "setNodePos", this.nodeTL, vee.PopMgr.PositionType.TopLeft);
      __goCall(vee.PopMgr, "setNodePos", this.nodeTR, vee.PopMgr.PositionType.TopRight);
    }

    var progressTexture = this.spCoinProgress && __goCall(this.spCoinProgress, "getTexture");
    __goCall(progressTexture, "setAliasTexParameters");

    __goPrepareAvatarProgress(this, LyGameOverMini);
    __goInitGameOverLabels(this, LyGameOverMini);
    __goCall(game.LevelData, "save");
  },

  initController: function () {
    __goCall(vee.Controller, "initSelector", 1, 2, this.onQuit.bind(this), __goPoint(0, 1));
    __goCall(vee.Controller, "registerItemByButton", this.btnQuit, __goPoint(0, 0), this.onQuit.bind(this), "res/mfi_pause_btn_small.png");
    __goCall(vee.Controller, "registerItemByButton", this.btnRetry, __goPoint(0, 1), this.onRetry.bind(this), "res/mfi_pause_btn_big.png");
    __goCall(vee.Controller, "activeSelector");
    __goCall(vee.Controller, "activeButton");
  },

  onRetry: function () {
    var self = this;
    __goCall(vee.Audio, "playEffect", res.inGame_menu_click_mp3);
    __goCall(vee.Transition, "out", res.MapTransition_ccbi, function () {
      self._openGame(false);
    });
    __goCall(vee.Controller, "deactiveSelector");
  },

  onQuit: function () {
    __goCall(vee.Transition, "out", res.MapTransition_ccbi, function () {
      LyLevelSelect.show();
    });
    __goCall(vee.Controller, "deactiveSelector");
  },

  onKTPlay: function () {
    __goCall(vee.KTPlay, "show");
  },

  startProgress: function () {
    this._progressAnimate();
  },

  _openGame: function (revive) {
    __goOpenGame(revive);
  },

  setProgressEnable: function (enabled) {
    this._progressEnable = !!enabled;
    __goVisible(this.nodeProgress, enabled);
    __goVisible(this.nodeProgressDesc, enabled);
  },

  _progressAnimate: function () {
    if (!this._progressEnable || !this._nextAvatar) {
      return;
    }

    __goSetTexture(this.spAvatarHead, this._nextAvatar.headName);
    LyGameOverMini.targetCoin = this._nextAvatar.price || LyGameOverMini.targetCoin;

    if (this._isUnlock) {
      this._showCoinParticle(Math.max(0, (LyGameOverMini.targetCoin || 0) - (this._coin || 0)));
    } else {
      this._showCoinParticle(this._gettedCoin || 0);
    }
  },

  setProgressFromCoin: function () {
    __goUpdateVisibleProgress(this, LyGameOverMini);
  },

  _showCoinParticle: function (amount) {
    this._coinOff = amount || 0;
    this._coinItr = this._coinOff > 40 ? Math.ceil(this._coinOff / 40) : 1;
    this._coinCount = 0;

    var labelPos = this.lbCoinNum && __goCall(this.lbCoinNum, "getPosition") || __goPoint(0, 0);
    var nodePos = this.nodeTR && __goCall(this.nodeTR, "getPosition") || __goPoint(0, 0);
    if (vee.Utils && vee.Utils.pAdd) {
      this.coinStartPos = vee.Utils.pAdd(labelPos, nodePos);
    } else {
      this.coinStartPos = __goPoint(labelPos.x + nodePos.x, labelPos.y + nodePos.y);
    }

    if (vee.Utils && vee.Utils.scheduleCallbackForTarget) {
      vee.Utils.scheduleCallbackForTarget(this.nodeTR || this.rootNode || this, this.updateShowCoin.bind(this), 0.05);
    } else {
      this.updateShowCoin();
    }
  },

  updateShowCoin: function () {
    if (this._coinOff <= 0) {
      __goCall(vee.Utils, "unscheduleAllCallbacksForTarget", this.nodeTR || this.rootNode || this);
      return;
    }

    if (this._coinItr > this._coinOff) {
      this._coinItr = this._coinOff;
    }

    this._coinOff -= this._coinItr;
    this._gettedCoin -= this._coinItr;
    this._coin += this._coinItr;

    __goUpdateVisibleProgress(this, LyGameOverMini);

    if (this._coinOff <= 0 && this.unlockedIdx >= 0) {
      __goCall(LyUnlock, "show", this.unlockedIdx);
      if (this.oCoinCtl) {
        this.oCoinCtl.setNumber(LyGameOverMini.targetCoin || 0);
      }
    }

    __goCall(vee.Audio, "playEffect", res.inGame_function_countCoins_mp3);
  },

  changeAvatar: function () {}
});

LyGameOverMini.targetCoin = null;

LyGameOverMini.shouldShowAvatarProgress = function () {
  return !!(game.Data && game.Data.stageType === game.StageType.Event);
};

LyGameOverMini.formatFunc = function (label, value) {
  __goSetString(label, value + " / " + (LyGameOverMini.targetCoin || 0));
};

LyGameOverMini.show = function () {
  var layer = __goCall(vee.PopMgr, "popCCB", res.GameOverMini_ccbi, { alpha: 0 });
  if (layer && layer.controller) {
    __goCall(layer.controller, "ccbInit");
  }
  return layer;
};
