
// Recovered readable source from smdis/lyGame.dis
// Functions that could not be verified with full confidence are marked with RECOVERY_UNCERTAIN_LYGAME.

function LyGame_safeCall(target, methodName) {
  if (!target || typeof target[methodName] !== "function") {
    return undefined;
  }
  try {
    return target[methodName].apply(target, Array.prototype.slice.call(arguments, 2));
  } catch (e) {
    return undefined;
  }
}

function LyGame_setVisible(node, visible) {
  if (node && typeof node.setVisible === "function") {
    node.setVisible(!!visible);
  } else if (node) {
    node.visible = !!visible;
  }
}

function LyGame_setSpriteFrame(node, frameName) {
  if (node && frameName && typeof node.setSpriteFrame === "function") {
    node.setSpriteFrame(frameName);
  }
}

function LyGame_registerButton(button, target, handler, events) {
  if (button && typeof button.addTargetWithActionForControlEvents === "function") {
    button.addTargetWithActionForControlEvents(target, handler, events);
  }
}

function LyGame_touchEvents(includeDragInside) {
  var events = cc.CONTROL_EVENT_TOUCH_DOWN |
    cc.CONTROL_EVENT_TOUCH_DRAG_EXIT |
    cc.CONTROL_EVENT_TOUCH_DRAG_OUTSIDE |
    cc.CONTROL_EVENT_TOUCH_CANCEL |
    cc.CONTROL_EVENT_TOUCH_DRAG_ENTER |
    cc.CONTROL_EVENT_TOUCH_UP_INSIDE |
    cc.CONTROL_EVENT_TOUCH_UP_OUTSIDE;
  if (includeDragInside) {
    events |= cc.CONTROL_EVENT_TOUCH_DRAG_INSIDE;
  }
  return events;
}

function LyGame_hasControlEvent(event, mask) {
  return !!(event & mask);
}

function LyGame_getPlayerCtl() {
  return (game && game.Data && (game.Data.oPlayerCtl || game.Data.oPlayer)) || null;
}

function LyGame_getButtonScale() {
  return (game.Data.isSmallButton && game.Data.isSmallButton()) ? (game.Data.smallButtonRate || 0.75) : 1;
}

function LyGame_easeOut(action) {
  return (cc.EaseExponentialOut && cc.EaseExponentialOut.create) ?
    cc.EaseExponentialOut.create(action) :
    action;
}


var LyGame = vee.Class.extend({
  lyContainer: null,
  lyMap: null,
  lyMapBack: null,
  lyBG: null,
  ccbHPBar: null,
  lyTouch: null,
  lbCoinNum: null,
  spCoinIcon: null,
  nodeT: null,
  nodeTR: null,
  nodeTL: null,
  nodeBL: null,
  nodeTLElements: null,
  nodeTRElements: null,
  nodeStar: null,
  nodeSkip: null,
  btnMove: null,
  btnJump: null,
  btnSmash: null,
  btnPause: null,
  btnSkip: null,
  blackEdgeBL: null,
  blackEdgeTL: null,
  ccbRecord: null,
  ccbTips: null,
  _holdLeft: false,
  _holdRight: false,
  drawNode: null,
  bgCtl: null,
  _keyState: null,
  _btnPos: null,
  _moveBtnRect: null,
  _rectLeftButton: null,
  _rectRightButton: null,
  _isOver: false,
  _spBtnR: null,
  _xRightEdge: 0,
  lyGesture: null,
  lbKeyCode: null,
  _efxHighlightButton: null,
  _startDateTime: 0,
  _tmpHeartNum: 0,
  _tmpCostLifeNum: 0,
  _isBlackCatModel: false,
  _defaultCoinSpriteFrame: null,
  initAnalyticsData: function () {
    this._isBlackCatModel = false;
    this._startDateTime = new Date().getTime();
    this._tmpHeartNum = 0;
    this._tmpCostLifeNum = 0;
  },
  onCreate: function () {
    if (typeof __supercatBootTrace === "function") {
      __supercatBootTrace("LyGame.onCreate");
    }
    VeeRecordButton.stopRecord();
    game.Data.oLyGame = this;
  },
  onLoaded: function () {
    game.Data.curSceen = "lyGame";
    this.initAnalyticsData();
    game.Data.isInLevelSceen = true;

    LyGame_safeCall(vee.Controller, "clearAll");
    LyGame_safeCall(vee.Controller, "deactiveButton");
    LyGame_safeCall(vee.Controller, "deactiveSelector");

    if (!this._defaultCoinSpriteFrame && this.spCoinIcon && this.spCoinIcon.getSpriteFrame) {
      this._defaultCoinSpriteFrame = this.spCoinIcon.getSpriteFrame();
    }

    if (cc.spriteFrameCache) {
      cc.spriteFrameCache.addSpriteFrames(res.item_coin_frames_plist, res.item_coin_frames_png);
      cc.spriteFrameCache.addSpriteFrames(res.item_plist, res.item_png);
    }

    LyGame_registerButton(this.btnMove, this, this.onMove, LyGame_touchEvents(true));
    LyGame_registerButton(this.btnJump, this, this.onJump, LyGame_touchEvents(false));
    LyGame_registerButton(this.btnSmash, this, this.onSmash, LyGame_touchEvents(false));
    LyGame_registerButton(this.btnPause, this, this.onPause, cc.CONTROL_EVENT_TOUCH_UP_INSIDE);

    this.resetButtonState();
    this._keyState = [];
    this.handleKey(true);
    this.registerControllerGameInput();

    LyGame_safeCall(vee.GestureController, "registerController", this.lyTouch, this, false);
    LyGame_safeCall(vee.PopMgr, "setNodePos", this.nodeT, vee.PopMgr.PositionType.Top);
    LyGame_safeCall(vee.PopMgr, "setNodePos", this.nodeTL, vee.PopMgr.PositionType.TopLeft);
    LyGame_safeCall(vee.PopMgr, "setNodePos", this.nodeTR, vee.PopMgr.PositionType.TopRight);
    LyGame_safeCall(vee.PopMgr, "setNodePos", this.nodeBL, vee.PopMgr.PositionType.BottomLeft);

    this.resetGestureControl();
    this.resetButtonSize();

    this._spBtnR = new cc.Sprite(res.mfi_btn_R_png);
    if (this.btnSkip) {
      this.btnSkip.addChild(this._spBtnR);
      var size = this.btnSkip.getContentSize();
      this._spBtnR.setPosition(cc.p(size.width, size.height * 0.8));
    }
    LyGame_safeCall(vee.Controller, "registerControllerSprite", this._spBtnR);

    if (this.nodeSkip && vee.PopMgr && vee.PopMgr.rootNode) {
      this.nodeSkip.removeFromParent(false);
      this.nodeSkip.retain();
      vee.PopMgr.rootNode.addChild(this.nodeSkip, 999);
      this.nodeSkip.release();
      var skipPos = this.nodeSkip.getPosition();
      this.nodeSkip.setPosition(vee.Utils.pAdd(skipPos, cc.p(vee.PopMgr.winSize.width, 0)));
    }

    this._controllerCallback = this.onControllerStateChange.bind(this);
    LyGame_safeCall(vee.Controller, "registerControllerCallback", this._controllerCallback);

    if (game.Data.version.curVersion !== VERSION.TVOS_GENUINE) {
      this.initMultiUI();
    }
  },
  ccbWIFI: null,
  ccbLabelCD: null,
  initMultiUI: function () {
    var hasMultiLevel = typeof MultiController !== "undefined" && MultiController.checkHasMultiLevel && MultiController.checkHasMultiLevel();
    if (hasMultiLevel) {
      LyGame_setVisible(this.nodeStar, false);
      LyGame_setVisible(this.lbCoinNum, false);
      LyGame_setVisible(this.spCoinIcon, false);
      LyGame_setVisible(this.lbKeyCode, false);
      LyGame_setVisible(this.ccbHPBar, false);
      LyGame_setVisible(this.ccbRecord, false);
      LyGame_setVisible(this.ccbWIFI, true);
      LyGame_setVisible(this.ccbLabelCD, false);
      return;
    }
    LyGame_setVisible(this.ccbWIFI, false);
    LyGame_setVisible(this.ccbLabelCD, false);
  },
  onKeyBack: function () {
    if (game.Data.performingTMXIdx === "Story1" || game.Data.performingTMXIdx === "Tutorial" || Story.isShowStory) {
      this.onSkip();
    } else {
      this.onPause();
    }
  },
  resetGestureControl: function () {
    var scale = LyGame_getButtonScale();
    if (this.lyGesture && this.lyGesture.controller) {
      this.lyGesture.controller.setEnabled(!!(game.Data.isGestureControl && game.Data.isGestureControl()));
      this.lyGesture.controller.setScale && this.lyGesture.controller.setScale(scale);
    }
  },
  resetButtonSize: function () {
    if (!this.btnMove || !this.btnJump || !this.btnSmash) {
      return;
    }
    var scale = LyGame_getButtonScale();
    this.btnMove.setScale(scale);
    this.btnJump.setScale(scale);
    this.btnSmash.setScale(scale);
  },
  onKeyPressed: function () {
    // Keyboard/gamepad movement is normalized in controller.js.
    // Keep this listener only for platform back/menu keys handled by vee.Class.
    return false;
  },
  onKeyReleased: function () {
    return false;
  },
  registerControllerGameInput: function () {
    if (!vee.Controller || !vee.KeyCode) {
      return;
    }
    LyGame_safeCall(vee.Controller, "registerButtonAction",
      vee.KeyCode.BUTTON_DPAD_LEFT,
      this.leftBtnDown.bind(this),
      this.leftBtnUp.bind(this)
    );
    LyGame_safeCall(vee.Controller, "registerButtonAction",
      vee.KeyCode.BUTTON_DPAD_RIGHT,
      this.rightBtnDown.bind(this),
      this.rightBtnUp.bind(this)
    );
    LyGame_safeCall(vee.Controller, "registerButtonAction",
      [vee.KeyCode.BUTTON_DPAD_UP, vee.KeyCode.BUTTON_A],
      this.jumpButtonDown.bind(this),
      this.jumpButtonUp.bind(this)
    );
    LyGame_safeCall(vee.Controller, "registerButtonAction",
      vee.KeyCode.BUTTON_B,
      this.BButtonDown.bind(this),
      this.BButtonUp.bind(this)
    );
    LyGame_safeCall(vee.Controller, "activeButton");
  },
  onExit: function () {
    var player = LyGame_getPlayerCtl();
    if (player && player.stopUpdate) {
      player.stopUpdate();
    }
    game.Data.isUpdatePlayerPos = false;
    game.Data.isInLevelSceen = false;
    vee.Controller.deactiveButton();
    this.nodeSkip.removeFromParent(true);
    game.Data.oLyGame = null;
    vee.PopMgr.rootNode.getScheduler().setTimeScale(1);
    this.stopUpdate();
    vee.Controller.removeControllerCallback(this._controllerCallback);
    vee.Controller.removeControllerSprite(this._spBtnR);
  },
  loadingFinish: function () {
    var player = LyGame_getPlayerCtl();
    if (player && player.playerInAninate) {
      player.playerInAninate();
      vee.Utils.scheduleOnceForTarget(this, function () {
        var curPlayer = LyGame_getPlayerCtl();
        if (game.Data.isInParkour && game.Data.isInParkour() && curPlayer && !curPlayer.isCanOperatByParkour) {
          return;
        }
        if (curPlayer && !curPlayer._isOver && curPlayer.startUpdate) {
          curPlayer.startUpdate();
        } else if (game.Data) {
          game.Data.isUpdatePlayerPos = true;
        }
      }.bind(this), 1.3);
    }
    this.refreshCoin();
    this.refreshHeart();
    this.refreshBButton();
    this.refreshTipsButton();
    this.adaptWideScreenBackground(true);
  },
  _controllerCallback: null,
  onControllerStateChange: function (arg0) {
    if (arg0 === vee.Controller.States.CONTROLLER_ATTACH) {
      this.hideButtons();
    } else if (arg0 === vee.Controller.States.CONTROLLER_DETACH && !Story.isShowStory && !Cinema.isCinema) {
      this.showButtons(false);
    }
  },
  updateCall: null,
  _isUpdateScheduled: false,
  _lastUpdateClock: 0,
  startUpdate: function () {
    if (this._isUpdateScheduled) {
      return;
    }
    this.updateCall = this.updateFunc.bind(this);
    this._updateSchedulerTarget = this._updateSchedulerTarget || this;
    vee.Utils.scheduleCallbackForTarget(this._updateSchedulerTarget, this.updateCall, 0);
    this._isUpdateScheduled = true;
  },
  stopUpdate: function () {
    if (this._updateSchedulerTarget && vee.Utils && vee.Utils.unscheduleAllCallbacksForTarget) {
      vee.Utils.unscheduleAllCallbacksForTarget(this._updateSchedulerTarget);
    }
    if (this.rootNode && vee.Utils && vee.Utils.unscheduleAllCallbacksForTarget) {
      vee.Utils.unscheduleAllCallbacksForTarget(this.rootNode);
    }
    this._isUpdateScheduled = false;
  },
  ensurePlayerUpdate: function () {
    if (!this._isUpdateScheduled) {
      this.startUpdate();
    }
    if (game.Data && game.Data.oPlayerCtl && !game.Data.oPlayerCtl._isOver) {
      game.Data.isUpdatePlayerPos = true;
      if (game.Data.oPlayerCtl.ensureMotionDriver) {
        game.Data.oPlayerCtl.ensureMotionDriver();
      }
    }
  },
  resetButtonState: function () {
    if (game.Data.loadBtnPos) {
      game.Data.loadBtnPos();
    }

    if (this.btnMove) {
      if (game.Data.btnMovePos) {
        this.btnMove.setPosition(game.Data.btnMovePos);
      } else if (vee.PopMgr && vee.PopMgr.setNodePos) {
        vee.PopMgr.setNodePos(this.btnMove, vee.PopMgr.PositionType.BottomLeft);
      }
    }

    var jumpBasePos = null;
    if (this.btnJump) {
      if (game.Data.btnJumpPos) {
        this.btnJump.setPosition(game.Data.btnJumpPos);
        jumpBasePos = game.Data.btnJumpPos;
      } else if (vee.PopMgr && vee.PopMgr.setNodePos) {
        vee.PopMgr.setNodePos(this.btnJump, vee.PopMgr.PositionType.BottomRight);
        jumpBasePos = this.btnJump.getPosition();
      }
    }

    if (this.btnSmash) {
      if (game.Data.btnDropPos) {
        this.btnSmash.setPosition(game.Data.btnDropPos);
      } else if (jumpBasePos) {
        var size = this.btnSmash.getContentSize ? this.btnSmash.getContentSize() : cc.size(0, 0);
        this.btnSmash.setPosition(vee.Utils.pAdd(jumpBasePos, cc.p(-size.width, 0)));
      }
    }

    if (this.btnMove) {
      this._btnPos = this.btnMove.getPosition();
      var moveSize = this.btnMove.getContentSize ? this.btnMove.getContentSize() : cc.size(0, 0);
      var scale = LyGame_getButtonScale();
      moveSize = cc.size(moveSize.width * scale, moveSize.height * scale);
      this._moveBtnRect = cc.rect(
        this._btnPos.x - moveSize.width / 2,
        this._btnPos.y - moveSize.height / 2,
        moveSize.width,
        moveSize.height
      );
      this._rectLeftButton = cc.rect(
        this._moveBtnRect.x,
        this._moveBtnRect.y,
        this._moveBtnRect.width / 2,
        this._moveBtnRect.height
      );
      this._rectRightButton = cc.rect(
        this._moveBtnRect.x + this._moveBtnRect.width / 2,
        this._moveBtnRect.y,
        this._moveBtnRect.width / 2,
        this._moveBtnRect.height
      );
    }

    this._holdLeft = false;
    this._holdRight = false;
  },
  hideBButton: function () {
    this.hideControlButton(LyGame.ControlButtonType.ActionButton);
  },
  showBButton: function () {
    if (this.checkIsParkourState()) {
      this.hideControlButton(LyGame.ControlButtonType.ActionButton);
      return;
    }
    this.btnSmash.setVisible(false);
    this.showControlButton(LyGame.ControlButtonType.ActionButton, true);
  },
  checkIsParkourState: function () {
    return !!(game.Data.isInParkour && game.Data.isInParkour());
  },
  _touchPos: null,
  onGestureBegin: function (gesture) {
    var point = gesture && gesture.getBeginPoint ? gesture.getBeginPoint() : null;
    if (point && this._moveBtnRect && cc.rectContainsPoint(this._moveBtnRect, point)) {
      this._touchPos = point;
    }

    if (this.checkIsParkourState()) {
      var player = LyGame_getPlayerCtl();
      if (player && !player.isCanOperatByParkour && player.startParkourRun) {
        player.startParkourRun();
        return true;
      }
      this.onJump(this, cc.CONTROL_EVENT_TOUCH_DOWN);
    }
    return true;
  },
  _forcePos: null,
  onGestureMove: function (gesture) {
    var point = gesture && gesture.getLastPoint ? gesture.getLastPoint() : null;
    if (point && this._moveBtnRect && cc.rectContainsPoint(this._moveBtnRect, point)) {
      this._touchPos = point;
    }
    if (gesture && gesture.getForce && gesture.getForce() > 3 && gesture.getLastPoint) {
      this._forcePos = gesture.getLastPoint();
    }
  },
  onGestureLeave: function (gesture) {
    this._touchPos = null;
    this._forcePos = null;
    if (this.checkIsParkourState()) {
      this.onJump(this, cc.CONTROL_EVENT_TOUCH_UP_INSIDE);
    }
  },
  gameOver: function () {
    this.stopUpdate();
    this._isOver = true;
  },
  _isFirstPlay: false,
  setFirstPlay: function (arg0) {
    this._isFirstPlay = arg0;
  },
  isFirstPlay: function () {
    return this._isFirstPlay;
  },
  initStage: function (arg0, arg1, arg2) {
    cc.log("start game : " + arg0);

    if (arg0 !== game.Data.realLastTmxIdx) {
      game.Data.retryCount = 0;
    }

    Cinema.isCinema = ((arg0 + "").substring(0, 5) === "Story");
    this.setSkipButtonVisible(false);

    game.Data.realLastTmxIdx = arg0;

    if (vee.Ad && vee.Ad.addAdPlayCount) {
      vee.Ad.addAdPlayCount();
    }
    game.Data.playCountThisGame++;

    if (arg0 === "Tutorial" && vee.Utils.isRecordAvaliable && vee.Utils.isRecordAvaliable()) {
      this.isPause = true;
      this.ccbRecord.setVisible(false);
    }

    if (!arg2) {
      arg2 = game.StageType.Normal;
    }

    game.Data.stageType = arg2;
    if (arg2 === game.StageType.Parkour) {
      this.hideButtons();
    }

    if (!game.Data.performingTMXIdx) {
      game.Data.lastTMXIdx = arg0;
    } else {
      game.Data.lastTMXIdx = game.Data.performingTMXIdx;
    }

    if (arg2 === game.StageType.Normal) {
      if (game.Data.addPlayCount) {
        game.Data.addPlayCount();
      }
      if (game.Data.isFreeGame && vee.Ad && vee.Ad.changeEntityAdIDTo) {
        vee.Ad.changeEntityAdIDTo("mini_over");
      }
    } else if (game.Data.isFreeGame && vee.Ad && vee.Ad.changeEntityAdIDTo) {
      vee.Ad.changeEntityAdIDTo("game_over");
    }

    if (game.Data.isFreeGame && vee.Ad && vee.Ad.changeEntityAdIDTo) {
      vee.Ad.changeEntityAdIDTo("game_win");
    }

    if (game.LevelData.selectedLevel && arg2 === game.StageType.Normal) {
      game.LevelData.selectedLevel.gameBegin(arg1);
    }

    if (!arg1 && game.Data.setSavePointIdx) {
      game.Data.setSavePointIdx(-999);
    }

    game.Data.performingTMXIdx = arg0;

    if (arg2 !== game.StageType.Event) {
      if (game.Data.resetData) {
        game.Data.resetData();
      }
      if (arg2 === game.StageType.Normal && game.Data.addEventCount) {
        game.Data.addEventCount();
      }
    } else {
      if (game.Data.resetEventData) {
        game.Data.resetEventData();
      }
      if (game.Data.resetEventCount) {
        game.Data.resetEventCount();
      }
    }

    this.refreshCoin();
    this.createLevelStars();
    this.stopCamera = false;
    this.freezeButton = false;
    this.refreshHeart();

    game.Data.coin = 0;

    var nextAvatar = null;
    if (arg2 === game.StageType.Event && game.AvatarData.getNextAvatar) {
      nextAvatar = game.AvatarData.getNextAvatar();
    }
    ItemCoin.coinFrameName = nextAvatar ? nextAvatar.coinFrame : null;
    if (Cinema.isCinema) {
      ItemCoin.coinFrameName = "coin_fist.png";
    }

    this.lyContainer.removeAllChildren();

    this.lyMap = new cc.Layer();
    this.lyMap.setPosition(cc.p(3, 3));
    this.lyMapBack = new cc.Layer();
    this.lyMapBack.setPosition(cc.p(3, 3));

    var levelPrefix = "";
    var tmxName = "res/map" + arg0 + ".tmx";

    cc.log("stageType = " + arg2);

    if (arg2 === game.StageType.Mini) {
      this.nodeT.setVisible(false);
      levelPrefix = "Mini";
      tmxName = "res/mapMini" + arg0 + ".tmx";
    } else if (arg2 === game.StageType.Event) {
      levelPrefix = "Event";
      tmxName = "res/mapEvent" + arg0 + ".tmx";
    }

    if (game.LevelData.selectedCategory && game.LevelData.selectedLevel) {
      var categoryIdx = game.LevelData.selectedCategory.idx + 1;
      var levelIdx = game.LevelData.selectedLevel.idx + 1;

      if (vee.Analytics && vee.Analytics.logEvent) {
        vee.Analytics.logEvent("GameStart" + levelPrefix + categoryIdx + "0" + levelIdx);
      }
      if (vee.Analytics && vee.Analytics.UGameEvent && vee.Analytics.UGameEvent.gameStartEvent) {
        vee.Analytics.UGameEvent.gameStartEvent(levelPrefix);
      }
      if ((arg2 === game.StageType.Normal || arg2 === game.StageType.Parkour) && vee.Analytics && vee.Analytics.logMissionStart) {
        if (categoryIdx > 100) {
          vee.Analytics.logMissionStart("Level" + (categoryIdx - 100) + "-" + levelIdx + "R");
        } else {
          vee.Analytics.logMissionStart("Level" + categoryIdx + "-" + levelIdx);
        }
      }
    }

    if (arg2 === game.StageType.Mini && vee.Analytics && vee.Analytics.logMissionStart) {
      vee.Analytics.logMissionStart("LevelMini" + arg0);
    }

    var tmxMap = this.showTMX(tmxName);

    LyLevelLoading.show();
    this._wideBgFixKey = null;
    this.adaptWideScreenBackground(true);

    this.lyContainer.addChild(tmxMap, 2);
    tmxMap.addChild(this.lyMap, 100);
    tmxMap.addChild(this.lyMapBack);

    game.Data.oLvCtl = LevelController.getController(levelPrefix + arg0);

    this.refreshCoinSpriteFrame(nextAvatar);

    if (game.Data.addTotalPlayCount) {
      game.Data.addTotalPlayCount();
    }

    if (game.Data.roleType === game.Roles.Marvin || game.Data.roleType === game.Roles.Android) {
      this.lbCoinNum.setPositionX(this.lbCoinNum.getPositionX() - 50);
      this.spCoinIcon.setPositionX(this.spCoinIcon.getPositionX() - 50);
    }

    if (game.Data.stageType === game.StageType.Normal && game.Data.isWeiXin && arg0 !== "Tutorial" && arg0 !== "Story1") {
      this.ccbTips.setVisible(true);
    } else {
      this.ccbTips.setVisible(false);
    }

    this.ccbTips.controller.ccbInit();
    this.refreshTipsButton();
  },
  showTMX: function (arg0) {
    var local0 = game.Logic.createTMXMap(arg0);
    return local0;
  },
  createLevelStars: function () {
    if (!this.nodeStar || typeof UIStar === "undefined") { return; }
    this.nodeStar.removeAllChildren && this.nodeStar.removeAllChildren();
    var selectedLevel = game.LevelData && game.LevelData.selectedLevel;
    for (var i = 1; i < 4; i++) {
      var star = UIStar.create(true);
      star.setPosition(cc.p((i - 2) * 36, 0));
      star.setTag(i);
      this.nodeStar.addChild(star);
      if (!selectedLevel) {
        continue;
      }
      if (selectedLevel.isTempStarAchieved && selectedLevel.isTempStarAchieved(i)) {
        star.controller.setLocked(false);
      } else if (selectedLevel.isStarAchieved && selectedLevel.isStarAchieved(i)) {
        star.controller.setGettedStar();
      }
    }
  },
  unlockStar: function (arg0) {
    var star = this.nodeStar && this.nodeStar.getChildByTag ? this.nodeStar.getChildByTag(arg0) : null;
    if (star && star.controller && star.controller.unlockAnimate) {
      star.controller.unlockAnimate();
    }
  },
  refreshCoin: function () {
    if (!this.lbCoinNum) {
      return;
    }
    if (game.Data.roleType === game.Roles.Marvin || game.Data.roleType === game.Roles.Android) {
      this.lbCoinNum.setString(game.Data.getTempCoin() + " / " + game.Data.stageMaxCoin);
    } else {
      this.lbCoinNum.setString(game.Data.getTempCoin());
    }
  },
  refreshCoinSpriteFrame: function (nextAvatar) {
    if (!this.spCoinIcon) {
      return;
    }
    if (game.Data.checkIs61 && game.Data.checkIs61()) {
      LyGame_setSpriteFrame(this.spCoinIcon, "CoinChild_small.png");
    } else if (nextAvatar && nextAvatar.coinFrame) {
      LyGame_setSpriteFrame(this.spCoinIcon, nextAvatar.coinFrame);
    } else if (this._defaultCoinSpriteFrame) {
      LyGame_setSpriteFrame(this.spCoinIcon, this._defaultCoinSpriteFrame);
    }
  },
  refreshHeart: function () {
    this.ccbHPBar.controller.setHP(game.Data.playerLife);
  },
  refreshBButton: function (arg0) {
    var playerType = arg0 || game.Data.playerType;
    this.showBButton();
    if (!this.btnSmash) { return; }
    if (playerType === game.PlayerType.Normal) {
      this.hideBButton();
    }
  },
  refreshTipsButton: function () {
    this.ccbTips.controller.refreshBtnFrame();
  },
  showPowerDesc: function (arg0) {
    EfxPowerDesc.show(arg0, vee.Utils.pSub(this.nodeT.getPosition(), cc.p(0, 110)));
  },
  getElePosInScreen: function (arg0) {
    if (!arg0) { return cc.p(0, 0); }
    var pos = arg0.getElePosition ? arg0.getElePosition() : arg0.getPosition();
    if (this.lyMap && this.lyMap.convertToWorldSpace) {
      return this.lyMap.convertToWorldSpace(pos);
    }
    return pos;
  },
  getCoinIconPos: function () {
    return vee.Utils.pAdd(this.nodeTR.getPosition(), this.spCoinIcon.getPosition());
  },
  _cameraPos: null,
  _sclRate: null,

  _wideBgFixKey: null,
  _wideBgSourceNode: null,
  _getWideBackgroundRectInLayer: function () {
    var parent = (this.lyBG && this.lyBG.getParent && this.lyBG.getParent()) || this.rootNode || null;
    var win = (vee && vee.PopMgr && vee.PopMgr.winSize) || (cc && cc.winSize) || null;
    if (!parent || !win || !win.width || !win.height) {
      return null;
    }

    var p0 = cc.p(0, 0);
    var p1 = cc.p(win.width, win.height);

    if (parent.convertToNodeSpace) {
      try {
        p0 = parent.convertToNodeSpace(cc.p(0, 0));
        p1 = parent.convertToNodeSpace(cc.p(win.width, win.height));
      } catch (e) {
        if (this.rootNode && this.rootNode.getPosition) {
          var rootPos = this.rootNode.getPosition();
          p0 = cc.p(-rootPos.x, -rootPos.y);
          p1 = cc.p(win.width - rootPos.x, win.height - rootPos.y);
        }
      }
    } else if (this.rootNode && this.rootNode.getPosition) {
      var rootPos2 = this.rootNode.getPosition();
      p0 = cc.p(-rootPos2.x, -rootPos2.y);
      p1 = cc.p(win.width - rootPos2.x, win.height - rootPos2.y);
    }

    var left = Math.min(p0.x, p1.x);
    var bottom = Math.min(p0.y, p1.y);
    var width = Math.abs(p1.x - p0.x);
    var height = Math.abs(p1.y - p0.y);

    if (!width || !height) {
      return null;
    }

    return cc.rect(left, bottom, width, height);
  },
  _getBgNodeSize: function (node) {
    if (!node) {
      return null;
    }

    var size = node.getContentSize ? node.getContentSize() : null;
    if (size && size.width > 4 && size.height > 4) {
      return size;
    }

    if (node.getBoundingBox) {
      var box = node.getBoundingBox();
      if (box && box.width > 4 && box.height > 4) {
        return cc.size(box.width, box.height);
      }
    }

    return cc.size(1136, 768);
  },
  _getWideBackgroundCoverRect: function (rect, children) {
    if (!rect || !rect.width || !rect.height) {
      return rect;
    }

    var bottomPad = 0;
    var baseAspect = 1136 / 768;
    var screenAspect = rect.width / rect.height;
    if (screenAspect <= baseAspect) {
      return rect;
    }

    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      var bgNode = this._findPrimaryBackgroundNode(child);
      var size = this._getBgNodeSize(bgNode);
      if (!size || !size.width || !size.height) {
        continue;
      }

      var scaledHeightForWidth = rect.width * size.height / size.width;
      bottomPad = Math.max(bottomPad, scaledHeightForWidth - rect.height);
    }

    if (bottomPad <= 0) {
      return rect;
    }

    bottomPad = Math.ceil(bottomPad);
    return cc.rect(rect.x, rect.y - Math.ceil(bottomPad * 0.5), rect.width, rect.height + bottomPad);
  },
  _findPrimaryBackgroundNode: function (node) {
    if (!node) {
      return null;
    }

    var best = null;
    var bestArea = 0;
    var scan = function (cur) {
      if (!cur) {
        return;
      }
      var size = cur.getContentSize ? cur.getContentSize() : null;
      var scaleX = cur.getScaleX ? Math.abs(cur.getScaleX()) : Math.abs(cur.scaleX || 1);
      var scaleY = cur.getScaleY ? Math.abs(cur.getScaleY()) : Math.abs(cur.scaleY || 1);
      if (size && size.width > 300 && size.height > 250) {
        var area = size.width * scaleX * size.height * scaleY;
        if (area > bestArea) {
          best = cur;
          bestArea = area;
        }
      }
      var children = cur.getChildren ? cur.getChildren() : [];
      for (var i = 0; i < children.length; i++) {
        scan(children[i]);
      }
    };

    scan(node);
    return best || node;
  },
  _fitBgNodeToRect: function (node, rect) {
    if (!node || !rect) {
      return false;
    }

    var size = this._getBgNodeSize(node);
    if (!size || !size.width || !size.height) {
      return false;
    }

    if (node.__lyGameWideBaseScaleX == null) {
      node.__lyGameWideBaseScaleX = node.getScaleX ? node.getScaleX() : (node.scaleX || 1);
      node.__lyGameWideBaseScaleY = node.getScaleY ? node.getScaleY() : (node.scaleY || 1);
    }

    var sx = Math.max(rect.width / size.width, 1);
    var sy = Math.max(rect.height / size.height, 1);

    if (node.setAnchorPoint) {
      node.setAnchorPoint(cc.p(0, 0));
    }
    if (node.setPosition) {
      node.setPosition(cc.p(rect.x, rect.y));
    }
    if (node.setScaleX) {
      node.setScaleX(node.__lyGameWideBaseScaleX * sx);
      if (node.setScaleY) {
        node.setScaleY(node.__lyGameWideBaseScaleY * sy);
      }
    } else if (node.setScale) {
      node.setScale(node.__lyGameWideBaseScaleX * sx, node.__lyGameWideBaseScaleY * sy);
    }
    return true;
  },
  adaptWideScreenBackground: function (force) {
    if (!this.lyBG || !this.lyBG.getChildren) {
      return;
    }

    var rect = this._getWideBackgroundRectInLayer();
    if (!rect || !rect.width || !rect.height) {
      return;
    }

    var children = this.lyBG.getChildren() || [];
    if (!children.length) {
      return;
    }

    var coverRect = this._getWideBackgroundCoverRect(rect, children);

    var key = [
      Math.round(coverRect.x),
      Math.round(coverRect.y),
      Math.round(coverRect.width),
      Math.round(coverRect.height),
      children.length,
      game.Data && game.Data.bgName || ""
    ].join(":");

    if (!force && this._wideBgFixKey === key) {
      return;
    }
    this._wideBgFixKey = key;

    if (this.lyBG.setAnchorPoint) {
      this.lyBG.setAnchorPoint(cc.p(0, 0));
    }
    if (this.lyBG.setPosition) {
      this.lyBG.setPosition(cc.p(0, 0));
    }
    if (this.lyBG.setContentSize) {
      this.lyBG.setContentSize(cc.size(coverRect.x + coverRect.width, coverRect.height));
    }

    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (!child) {
        continue;
      }

      // For a dynamic CCB background the large sky sprite is often nested
      // inside the loaded root node. Stretch that real background node instead
      // of adding artificial side panels.
      var bgNode = this._findPrimaryBackgroundNode(child);
      this._fitBgNodeToRect(bgNode, coverRect);

      // Static PNG backgrounds are direct children of lyBG.
      if (bgNode !== child) {
        var childSize = this._getBgNodeSize(child);
        if (childSize && childSize.width >= 1000 && childSize.height >= 600) {
          this._fitBgNodeToRect(child, coverRect);
        }
      }
    }
  },
  initCamera: function (arg0) {
    this.setCameraFollow(arg0 || LyGame_getPlayerCtl());
    this.setCameraXRightEdge();
    this._safeCameraPos();
  },
  updateFunc: function (arg0) {
    if (this.isPause && game.Data.performingTMXIdx !== "Tutorial") {
      return;
    }
    if (game.Data.oLyGameOver) {
      return;
    }
    if (typeof MultiController !== "undefined" && !MultiController._isReady && MultiController.checkHasMultiLevel && MultiController.checkHasMultiLevel()) {
      return;
    }

    var now = Date.now ? Date.now() : (new Date()).getTime();
    var dt = Number(arg0);
    if (!dt || !isFinite(dt) || dt <= 0) {
      dt = this._lastUpdateClock ? (now - this._lastUpdateClock) / 1000 : 1 / 60;
    }
    this._lastUpdateClock = now;
    game.Data._lastLyGameUpdateClock = now;
    if (parseFloat(dt.toFixed(3)) > 0.02) {
      dt = 0.02;
    }

    if (vee.Utils && vee.Utils.beginTiming) {
      vee.Utils.beginTiming();
    }

    var objects = [];
    if (game.Logic && game.Logic.dynamicObjMap && game.Logic.dynamicObjMap.getObjects) {
      objects = game.Logic.dynamicObjMap.getObjects() || [];
    }
    for (var i = 0; i < objects.length; i++) {
      var obj = objects[i];
      if (obj && !obj.uncheck && obj.updatePos) {
        obj.updatePos(dt);
      }
    }

    var updateObjs = game.Data.arrUpdateObj || [];
    for (var j = 0; j < updateObjs.length; j++) {
      var updateObj = updateObjs[j];
      if (updateObj && !updateObj.uncheck && updateObj.updatePos) {
        updateObj.updatePos(dt);
      }
    }

    var player = game.Data.oPlayerCtl;
    if (player && player.updatePos) {
      var playerIsMoving = player._accX !== 0 || player._speedX !== 0 || player._speedY !== 0 || player._isJumping;
      if (game.Data.isUpdatePlayerPos || playerIsMoving) {
        game.Data.isUpdatePlayerPos = true;
        player.updatePos(dt);
        this.setCameraFollow(player.getElePosition(), dt);
      }
    }

    if (game.Data.version.curVersion !== VERSION.TVOS_GENUINE && typeof MultiController !== "undefined" && MultiController.update) {
      MultiController.update(dt);
    }

    this.updateSlow(dt);
    this.adaptWideScreenBackground(false);
    this._safeCameraPos();
  },
  _castPos: null,
  stopCamera: false,
  debugPreCamera: null,
  setCameraFollow: function (arg0) {
    this._cameraFollow = arg0;
  },
  _safeCameraPos: function () {
    // RECOVERY_UNCERTAIN_LYGAME: camera clamping is approximated for readability.
    if (!this._cameraFollow || !this.lyContainer || !this._cameraFollow.getElePosition) { return; }
    var pos = this._cameraFollow.getElePosition();
    var win = vee.PopMgr && vee.PopMgr.winSize || cc.winSize;
    var x = Math.min(0, Math.max(-this._xRightEdge, win.width / 2 - pos.x));
    this.lyContainer.setPositionX(x);
  },
  setCameraXRightEdge: function () {
    this._xRightEdge = ((1136 - game.Data.mapRightEdge) - TILE_WIDTH_HALF);
  },
  _isFreezeY: false,
  _freezeY: 0,
  setCameraYFreeze: function (arg0, arg1) {
    this._isFreezeY = !!arg0;
    this._freezeY = arg1 || 0;
    this._cameraYFreeze = this._isFreezeY;
    this._cameraYFreezeValue = this._freezeY;
  },
  _isFreezeX: false,
  _freezeX: 0,
  setCameraXFreeze: function (arg0, arg1) {
    this._isFreezeX = !!arg0;
    this._freezeX = arg1 || 0;
    this._cameraXFreeze = this._isFreezeX;
    this._cameraXFreezeValue = this._freezeX;
  },
  showStoryBlackEdge: function () {
    if (vee.Utils && vee.Utils.isRecordAvaliable && vee.Utils.isRecordAvaliable() && this.ccbRecord) {
      this.ccbRecord.setVisible(false);
    }

    function showEdge(edge, fromY, toY) {
      if (!edge) { return; }
      LyGame_setVisible(edge, true);
      edge.stopAllActions && edge.stopAllActions();
      edge.setOpacity && edge.setOpacity(0);
      edge.setPosition && edge.setPosition(cc.p(0, fromY));
      if (edge.runAction) {
        edge.runAction(cc.spawn(
          LyGame_easeOut(cc.moveTo(0.6, cc.p(0, toY))),
          LyGame_easeOut(cc.fadeTo(0.6, 255))
        ));
      }
    }

    showEdge(this.blackEdgeTL, 0, -100);
    showEdge(this.blackEdgeBL, -100, 0);
    this.hideButtons();
  },
  shake: function () {
    if (this.lyContainer) {
      this.lyContainer.stopActionByTag && this.lyContainer.stopActionByTag(90);
      var action = cc.sequence(cc.moveBy(0.03, cc.p(4, 0)), cc.moveBy(0.03, cc.p(-8, 0)), cc.moveBy(0.03, cc.p(4, 0)));
      action.setTag && action.setTag(90);
      this.lyContainer.runAction(action);
    }
  },
  timeScale: 1,
  startSlowRate: 0.05,
  slowDur: 0.1,
  slowReviveRate: 0.02,
  gameSlow: function () {
    this._slowTime = 0.15;
    this._slowScale = 0.25;
    if (cc.director && cc.director.getScheduler) {
      cc.director.getScheduler().setTimeScale(this._slowScale);
    }
  },
  updateSlow: function (arg0) {
    if (!this._slowTime) { return; }
    this._slowTime -= arg0 || 0;
    if (this._slowTime <= 0 && cc.director && cc.director.getScheduler) {
      this._slowTime = 0;
      cc.director.getScheduler().setTimeScale(1);
    }
  },
  hideStoryBlackEdge: function () {
    if (vee.Utils && vee.Utils.isRecordAvaliable && vee.Utils.isRecordAvaliable() &&
        this.ccbRecord && !this.ccbRecord.isRecording) {
      this.ccbRecord.setVisible(true);
    }

    function hideEdge(edge, toY) {
      if (!edge) { return; }
      LyGame_setVisible(edge, true);
      edge.stopAllActions && edge.stopAllActions();
      if (edge.runAction) {
        edge.runAction(cc.sequence(
          cc.spawn(
            LyGame_easeOut(cc.moveTo(1, cc.p(0, toY))),
            LyGame_easeOut(cc.fadeTo(1, 0))
          ),
          cc.callFunc(function () {
            LyGame_setVisible(edge, false);
          })
        ));
      } else {
        LyGame_setVisible(edge, false);
      }
    }

    hideEdge(this.blackEdgeTL, 0);
    hideEdge(this.blackEdgeBL, -100);
  },
  showButtons: function (arg0) {
    if (vee.Controller && vee.Controller.isControllerControlling) {
      return;
    }
    if (this.checkIsParkourState()) {
      this.hideButtons();
      return;
    }
    var visible = arg0 !== false;
    if (game.Data.playerType !== game.PlayerType.Normal) {
      this.showControlButton(LyGame.ControlButtonType.ActionButton, visible);
    } else {
      this.hideControlButton(LyGame.ControlButtonType.ActionButton);
    }
    this.showControlButton(LyGame.ControlButtonType.JumpButton, visible);
    this.showControlButton(LyGame.ControlButtonType.MoveButton, visible);
  },
  hideButtons: function () {
    this.hideControlButton(LyGame.ControlButtonType.ActionButton);
    this.hideControlButton(LyGame.ControlButtonType.JumpButton);
    this.hideControlButton(LyGame.ControlButtonType.MoveButton);
  },
  hideUI: function () {
    this.hideControlButton(LyGame.ControlButtonType.ActionButton);
    this.hideControlButton(LyGame.ControlButtonType.JumpButton);
    this.hideControlButton(LyGame.ControlButtonType.MoveButton);
    this.nodeTL.setVisible(false);
    this.nodeT.setVisible(false);
    this.nodeTR.setVisible(false);
  },
  _tempRButtonAction: null,
  setSkipButtonVisible: function (arg0) {
    LyGame_setVisible(this.nodeSkip, arg0);
    if (arg0) {
      LyGame_safeCall(vee.Controller, "registerButtonAction", [vee.KeyCode.BUTTON_RIGHT_SHOULDER, vee.KeyCode.AXIS_RIGHT_TRIGGER], this.onSkip.bind(this));
      LyGame_safeCall(vee.Controller, "activeButton");
    } else {
      LyGame_safeCall(vee.Controller, "registerButtonAction", [vee.KeyCode.BUTTON_RIGHT_SHOULDER, vee.KeyCode.AXIS_RIGHT_TRIGGER], null);
    }
  },
  freezeButton: false,
  onMove: function (control, event) {
    if (this.freezeButton) {
      return;
    }

    var downEvent = LyGame_hasControlEvent(event, cc.CONTROL_EVENT_TOUCH_DOWN) ||
      LyGame_hasControlEvent(event, cc.CONTROL_EVENT_TOUCH_DRAG_ENTER) ||
      LyGame_hasControlEvent(event, cc.CONTROL_EVENT_TOUCH_DRAG_INSIDE);

    if (downEvent) {
      if (!this._touchPos || !this._btnPos) {
        return;
      }

      if (this._efxHighlightButton && this._efxHighlightButton.onMove) {
        this._efxHighlightButton.onMove();
      }

      if (this._touchPos.x < this._btnPos.x) {
        if (this.btnMove && this.btnMove.setBackgroundSpriteForState && cc.Scale9Sprite) {
          this.btnMove.setBackgroundSpriteForState(cc.Scale9Sprite.create(res.btn_move_on_left_png), cc.CONTROL_STATE_HIGHLIGHTED);
        }
        this.rightBtnUp();
        this.leftBtnDown();
      } else {
        if (this.btnMove && this.btnMove.setBackgroundSpriteForState && cc.Scale9Sprite) {
          this.btnMove.setBackgroundSpriteForState(cc.Scale9Sprite.create(res.btn_move_on_right_png), cc.CONTROL_STATE_HIGHLIGHTED);
        }
        this.leftBtnUp();
        this.rightBtnDown();
      }
    }

    var upEvent = LyGame_hasControlEvent(event, cc.CONTROL_EVENT_TOUCH_DRAG_EXIT) ||
      LyGame_hasControlEvent(event, cc.CONTROL_EVENT_TOUCH_DRAG_OUTSIDE) ||
      LyGame_hasControlEvent(event, cc.CONTROL_EVENT_TOUCH_CANCEL) ||
      LyGame_hasControlEvent(event, cc.CONTROL_EVENT_TOUCH_UP_INSIDE) ||
      LyGame_hasControlEvent(event, cc.CONTROL_EVENT_TOUCH_UP_OUTSIDE);

    if (upEvent) {
      this._holdLeft = false;
      this._holdRight = false;
      var player = LyGame_getPlayerCtl();
      if (player && player.extendController && player.extendController.onMoveBtnUp) {
        player.extendController.onMoveBtnUp();
        return;
      }
      this.rightBtnUp();
      this.leftBtnUp();
    }
  },
  leftBtnDown: function () {
    if (this.freezeButton) {
      return;
    }
    this.ensurePlayerUpdate();
    this._holdLeft = true;
    var player = LyGame_getPlayerCtl();
    if (!player) {
      return;
    }
    if (player.extendController && player.extendController.onMoveBtnDown) {
      player.extendController.onMoveBtnDown(vee.Direction.Right);
      return;
    }
    if (player.moveLeft) {
      player.moveLeft();
    }
  },
  leftBtnUp: function () {
    this._holdLeft = false;
    var player = LyGame_getPlayerCtl();
    if (!player) {
      return;
    }
    if (player.extendController && player.extendController.onMoveBtnUp) {
      player.extendController.onMoveBtnUp();
      return;
    }
    if (!this._holdRight && !(game.Data.isInParkour && game.Data.isInParkour()) && player.stopMove) {
      player.stopMove();
    }
  },
  rightBtnDown: function () {
    if (this.freezeButton) {
      return;
    }
    this.ensurePlayerUpdate();
    this._holdRight = true;
    var player = LyGame_getPlayerCtl();
    if (!player) {
      return;
    }
    if (player.extendController && player.extendController.onMoveBtnDown) {
      player.extendController.onMoveBtnDown(vee.Direction.Left);
      return;
    }
    if (player.moveRight) {
      player.moveRight();
    }
  },
  rightBtnUp: function () {
    this._holdRight = false;
    var player = LyGame_getPlayerCtl();
    if (!player) {
      return;
    }
    if (player.extendController && player.extendController.onMoveBtnUp) {
      player.extendController.onMoveBtnUp();
      return;
    }
    if (!this._holdLeft && !(game.Data.isInParkour && game.Data.isInParkour()) && player.stopMove) {
      player.stopMove();
    }
  },
  onJump: function (control, event) {
    var downEvent = LyGame_hasControlEvent(event, cc.CONTROL_EVENT_TOUCH_DOWN) ||
      LyGame_hasControlEvent(event, cc.CONTROL_EVENT_TOUCH_DRAG_ENTER);
    if (downEvent) {
      this.jumpButtonDown();
    }

    var upEvent = LyGame_hasControlEvent(event, cc.CONTROL_EVENT_TOUCH_DRAG_EXIT) ||
      LyGame_hasControlEvent(event, cc.CONTROL_EVENT_TOUCH_DRAG_OUTSIDE) ||
      LyGame_hasControlEvent(event, cc.CONTROL_EVENT_TOUCH_CANCEL) ||
      LyGame_hasControlEvent(event, cc.CONTROL_EVENT_TOUCH_UP_INSIDE) ||
      LyGame_hasControlEvent(event, cc.CONTROL_EVENT_TOUCH_UP_OUTSIDE);
    if (upEvent) {
      this.jumpButtonUp();
    }
  },
  jumpButtonDown: function () {
    if (this.freezeButton) {
      return;
    }
    this.ensurePlayerUpdate();
    if (this._efxHighlightButton && this._efxHighlightButton.onJump) {
      this._efxHighlightButton.onJump();
    }
    var player = LyGame_getPlayerCtl();
    if (!player) {
      return;
    }
    if (player.extendController && player.extendController.onAButton) {
      player.extendController.onAButton();
      return;
    }
    if (player.jump) {
      // Do not force the internal jump gate.  Passing true here made every
      // touch-down act like a fresh ground jump and allowed infinite jumping.
      player.jump();
    }
    game.Data.isHoldJumpButtom = true;
  },
  jumpButtonUp: function () {
    if (this.freezeButton) {
      return;
    }
    var player = LyGame_getPlayerCtl();
    if (player) {
      player._jumpButtonReleased = true;
    }
    game.Data.isHoldJumpButtom = false;
  },
  onSmash: function (control, event) {
    var downEvent = LyGame_hasControlEvent(event, cc.CONTROL_EVENT_TOUCH_DOWN) ||
      LyGame_hasControlEvent(event, cc.CONTROL_EVENT_TOUCH_DRAG_ENTER);
    if (downEvent) {
      this.BButtonDown();
    }

    var upEvent = LyGame_hasControlEvent(event, cc.CONTROL_EVENT_TOUCH_DRAG_EXIT) ||
      LyGame_hasControlEvent(event, cc.CONTROL_EVENT_TOUCH_DRAG_OUTSIDE) ||
      LyGame_hasControlEvent(event, cc.CONTROL_EVENT_TOUCH_CANCEL) ||
      LyGame_hasControlEvent(event, cc.CONTROL_EVENT_TOUCH_UP_INSIDE) ||
      LyGame_hasControlEvent(event, cc.CONTROL_EVENT_TOUCH_UP_OUTSIDE);
    if (upEvent) {
      this.BButtonUp();
    }
  },
  BButtonDown: function () {
    if (this.freezeButton) {
      return;
    }
    var player = LyGame_getPlayerCtl();
    if (player && player.BButton) {
      player.BButton();
    }
    if (this._efxHighlightButton && this._efxHighlightButton.onAction) {
      this._efxHighlightButton.onAction();
    }
  },
  BButtonUp: function () {
    if (this.freezeButton) {
      return;
    }
    var player = LyGame_getPlayerCtl();
    if (player && player.BButton) {
      player.BButton(true);
    }
  },
  onClearPool: function () {
    if (game.Pool && game.Pool.clear) { game.Pool.clear(); }
  },
  onLeft: function (arg0, arg1) {
    if (this.freezeButton) {
      return;
    }

    var downEvent = LyGame_hasControlEvent(arg1, cc.CONTROL_EVENT_TOUCH_DOWN) ||
      LyGame_hasControlEvent(arg1, cc.CONTROL_EVENT_TOUCH_DRAG_ENTER);
    if (downEvent) {
      this.rightBtnUp();
      this.ensurePlayerUpdate();
      this._holdLeft = true;
      var downPlayer = LyGame_getPlayerCtl();
      if (downPlayer && downPlayer.extendController && downPlayer.extendController.onMoveBtnDown) {
        downPlayer.extendController.onMoveBtnDown(vee.Direction.Right);
        return;
      }
      if (this._efxHighlightButton && this._efxHighlightButton.onMove) {
        this._efxHighlightButton.onMove();
      }
      if (downPlayer && downPlayer.moveLeft) {
        downPlayer.moveLeft();
      }
    }

    var upEvent = LyGame_hasControlEvent(arg1, cc.CONTROL_EVENT_TOUCH_DRAG_EXIT) ||
      LyGame_hasControlEvent(arg1, cc.CONTROL_EVENT_TOUCH_DRAG_OUTSIDE) ||
      LyGame_hasControlEvent(arg1, cc.CONTROL_EVENT_TOUCH_CANCEL) ||
      LyGame_hasControlEvent(arg1, cc.CONTROL_EVENT_TOUCH_UP_INSIDE) ||
      LyGame_hasControlEvent(arg1, cc.CONTROL_EVENT_TOUCH_UP_OUTSIDE);
    if (upEvent) {
      this._holdLeft = false;
      var upPlayer = LyGame_getPlayerCtl();
      if (upPlayer && upPlayer.extendController && upPlayer.extendController.onMoveBtnUp) {
        upPlayer.extendController.onMoveBtnUp();
        return;
      }
      if (!this._holdRight) {
        if (upPlayer && upPlayer.stopMove) {
          upPlayer.stopMove();
        }
      } else if (LyGame_hasControlEvent(arg1, cc.CONTROL_EVENT_TOUCH_UP_OUTSIDE)) {
        this.rightBtnUp();
      }

      var dragOut = LyGame_hasControlEvent(arg1, cc.CONTROL_EVENT_TOUCH_DRAG_EXIT) ||
        LyGame_hasControlEvent(arg1, cc.CONTROL_EVENT_TOUCH_DRAG_OUTSIDE);
      if (this._touchPos && dragOut && this._rectRightButton &&
          cc.rectContainsPoint(this._rectRightButton, this._touchPos)) {
        this.rightBtnDown();
      } else if (this._holdRight) {
        this.rightBtnUp();
      }
    }
  },
  onRight: function (arg0, arg1) {
    if (this.freezeButton) {
      return;
    }

    var downEvent = LyGame_hasControlEvent(arg1, cc.CONTROL_EVENT_TOUCH_DOWN) ||
      LyGame_hasControlEvent(arg1, cc.CONTROL_EVENT_TOUCH_DRAG_ENTER);
    if (downEvent) {
      this.leftBtnUp();
      this.ensurePlayerUpdate();
      this._holdRight = true;
      var downPlayer = LyGame_getPlayerCtl();
      if (downPlayer && downPlayer.extendController && downPlayer.extendController.onMoveBtnDown) {
        downPlayer.extendController.onMoveBtnDown(vee.Direction.Left);
        return;
      }
      if (this._efxHighlightButton && this._efxHighlightButton.onMove) {
        this._efxHighlightButton.onMove();
      }
      if (downPlayer && downPlayer.moveRight) {
        downPlayer.moveRight();
      }
    }

    var upEvent = LyGame_hasControlEvent(arg1, cc.CONTROL_EVENT_TOUCH_DRAG_EXIT) ||
      LyGame_hasControlEvent(arg1, cc.CONTROL_EVENT_TOUCH_DRAG_OUTSIDE) ||
      LyGame_hasControlEvent(arg1, cc.CONTROL_EVENT_TOUCH_CANCEL) ||
      LyGame_hasControlEvent(arg1, cc.CONTROL_EVENT_TOUCH_UP_INSIDE) ||
      LyGame_hasControlEvent(arg1, cc.CONTROL_EVENT_TOUCH_UP_OUTSIDE);
    if (upEvent) {
      this._holdRight = false;
      var upPlayer = LyGame_getPlayerCtl();
      if (upPlayer && upPlayer.extendController && upPlayer.extendController.onMoveBtnUp) {
        upPlayer.extendController.onMoveBtnUp();
        return;
      }
      if (!this._holdLeft) {
        if (upPlayer && upPlayer.stopMove) {
          upPlayer.stopMove();
        }
      } else if (LyGame_hasControlEvent(arg1, cc.CONTROL_EVENT_TOUCH_UP_OUTSIDE)) {
        this.leftBtnUp();
      }

      var dragOut = LyGame_hasControlEvent(arg1, cc.CONTROL_EVENT_TOUCH_DRAG_EXIT) ||
        LyGame_hasControlEvent(arg1, cc.CONTROL_EVENT_TOUCH_DRAG_OUTSIDE);
      if (this._touchPos && dragOut && this._rectLeftButton &&
          cc.rectContainsPoint(this._rectLeftButton, this._touchPos)) {
        this.leftBtnDown();
      } else if (this._holdLeft) {
        this.leftBtnUp();
      }
    }
  },
  onSkip: function () {
    if (game.Data.performingTMXIdx === "Story1" && typeof Cinema !== "undefined") {
      if (Cinema.finishToTutorial) { Cinema.finishToTutorial(); }
      else if (Cinema.closeCinema) { Cinema.closeCinema(); }
      this.setSkipButtonVisible(false);
      return;
    }
    if (typeof Cinema !== "undefined" && Cinema.closeCinema) {
      Cinema.closeCinema();
    }
    if (typeof Story !== "undefined") {
      if (Story.skipStory) {
        Story.skipStory();
      } else if (Story.skip) {
        Story.skip();
      }
    }
    this.setSkipButtonVisible(false);
  },
  isPause: false,
  onPause: function () {
    if (Story.isShowStory || this.isPause || game.Data.performingTMXIdx === "Tutorial" || this._isOver || Cinema.isCinema || game.Data.oLyGameOver) {
      return;
    }
    cc.log && cc.log("on pause click==============");
    this.pauseGame();
    if (LyPause && LyPause.show) {
      LyPause.show();
    }
  },
  pauseGame: function () {
    this.isPause = true;
    if (vee.PopMgr && vee.PopMgr.pause) {
      vee.PopMgr.pause(this.rootNode, true);
    }
    if (this.gestureController) {
      this.gestureController.setEnabled(false);
    }
    this.leftBtnUp();
    this.rightBtnUp();
  },
  resumeGame: function () {
    this.isPause = false;
    if (this.gestureController) {
      this.gestureController.setEnabled(true);
    }
    if (vee.PopMgr && vee.PopMgr.resume) {
      vee.PopMgr.resume();
    } else if (cc.director && cc.director.resume) {
      cc.director.resume();
    }
  },
  hideControlButton: function (arg0) {
    if (this._efxHighlightButton &&
        this._efxHighlightButton.getButtonMask &&
        (this._efxHighlightButton.getButtonMask() & arg0)) {
      this._efxHighlightButton.remove();
      this._efxHighlightButton = null;
    }
    if (arg0 & LyGame.ControlButtonType.MoveButton) {
      LyGame_setVisible(this.btnMove, false);
    }
    if (arg0 & LyGame.ControlButtonType.ActionButton) {
      LyGame_setVisible(this.btnSmash, false);
    }
    if (arg0 & LyGame.ControlButtonType.JumpButton) {
      LyGame_setVisible(this.btnJump, false);
    }
  },
  showControlButton: function (arg0, arg1, arg2) {
    if ((this.lyGesture && this.lyGesture.controller &&
          this.lyGesture.controller.getEnabled &&
          this.lyGesture.controller.getEnabled()) ||
        (vee.Controller && vee.Controller.isControllerControlling)) {
      return;
    }

    var isSmall = !!(game.Data.isSmallButton && game.Data.isSmallButton());
    var self = this;

    function loadGuide(ccbi, button, highlightMask) {
      var node = cc.BuilderReader && cc.BuilderReader.load ? cc.BuilderReader.load(ccbi) : null;
      if (!node) {
        LyGame_setVisible(button, true);
        return;
      }
      if (isSmall && node.setScale) {
        node.setScale(game.Data.smallButtonRate);
      }
      if (self.rootNode && self.rootNode.addChild) {
        self.rootNode.addChild(node);
      }
      if (node.controller && node.controller.show) {
        node.controller.show(arg2);
      }
      if (highlightMask) {
        self.setHighlightControlButton(arg0);
      }
    }

    if (arg0 & LyGame.ControlButtonType.MoveButton) {
      if (arg1) {
        loadGuide(res.guideBtnMove_ccbi, this.btnMove);
      } else {
        LyGame_setVisible(this.btnMove, true);
      }
    }
    if (arg0 & LyGame.ControlButtonType.ActionButton) {
      if (arg1) {
        loadGuide(res.guideBtnA_ccbi, this.btnSmash, true);
      } else {
        LyGame_setVisible(this.btnSmash, true);
      }
    }
    if (arg0 & LyGame.ControlButtonType.JumpButton) {
      if (arg1) {
        loadGuide(res.guideBtnB_ccbi, this.btnJump);
      } else {
        LyGame_setVisible(this.btnJump, true);
      }
    }
  },
  setHighlightControlButton: function (arg0, arg1) {
    var isSmall = !!(game.Data.isSmallButton && game.Data.isSmallButton());
    var isGesture = !!(this.lyGesture && this.lyGesture.controller &&
      this.lyGesture.controller.getEnabled &&
      this.lyGesture.controller.getEnabled());

    if (this._efxHighlightButton &&
        ((!this._efxHighlightButton.getButtonMask ||
          !(this._efxHighlightButton.getButtonMask() & arg0)) ||
          this._efxHighlightButton.isGesture !== isGesture)) {
      this._efxHighlightButton.remove();
      this._efxHighlightButton = null;
    }

    if (!this._efxHighlightButton) {
      var ccbi = isGesture ? res.btnLightGesture_ccbi :
        ((arg0 & LyGame.ControlButtonType.MoveButton) ? res.btnLightMove_ccbi : res.btnLight_ccbi);
      var node = cc.BuilderReader && cc.BuilderReader.load ? cc.BuilderReader.load(ccbi) : null;
      if (!node || !node.controller) {
        return;
      }
      if (this.rootNode && this.rootNode.addChild) {
        this.rootNode.addChild(node);
      }
      if (isSmall && !isGesture && node.setScale) {
        node.setScale(game.Data.smallButtonRate);
      }
      this._efxHighlightButton = node.controller;
    }

    if (this._efxHighlightButton.show) {
      this._efxHighlightButton.show(arg0, arg1);
    }
  }
});
LyGame.ControlButtonType = {
  MoveButton: 1,
  ActionButton: 16,
  JumpButton: 256
};
LyGame.ctl = null;
LyGame.getCtl = function () {
  if (!LyGame.ctl) {
    LyGame.ctl = LyGame.create();
  }
  return LyGame.ctl;
};
if (cc.BuilderReader && cc.BuilderReader.registerController) {
  cc.BuilderReader.registerController("LyGame", LyGame);
  cc.BuilderReader.registerController("lygame", LyGame);
}
var BtnTips = vee.Class.extend({
  spTip: null,
  ccbInit: function () {
    this.playAnimate("delay");
  },
  onTip: function () {
    var purchased = game.Data.isTipsPurchased && game.Data.isTipsPurchased(game.Data.performingTMXIdx);
    if (purchased) {
      if (LyTipsDesc && LyTipsDesc.show) { LyTipsDesc.show(); }
      if (game.Logic && game.Logic.showTipsLayer) { game.Logic.showTipsLayer(); }
    } else {
      LyGame_safeCall(vee.IAPMgr, "buyProduct", 7, function () {});
    }
  },
  refreshBtnFrame: function () {
    var purchased = game.Data.isTipsPurchased && game.Data.isTipsPurchased(game.Data.performingTMXIdx);
    if (this.spTip) {
      this.spTip.setTexture(purchased ? res.btn_tip_1_png : res.btn_tip_0_png);
    }
  }
});
if (cc.BuilderReader && cc.BuilderReader.registerController) {
  cc.BuilderReader.registerController("BtnTips", BtnTips);
  cc.BuilderReader.registerController("btnTips", BtnTips);
}
