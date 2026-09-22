var IntroTips = vee.Class.extend({
  _isHide: false,
  _nextPos: null,

  activate: function (pos) {
    this._nextPos = null;
    this.rootNode.setVisible(true);

    if (this._isHide) {
      this.rootNode.setPosition(pos);
      this.playAnimate("show");
      this._isHide = false;
    } else {
      this._nextPos = pos;
    }
  },

  achieved: function () {
    if (this._isHide) {
      return;
    }

    this._isHide = false;
    this.playAnimate("end", this.onEnd);
    vee.Audio.playEffect(res.inGame_efx_hideLight_mp3);
  },

  onEnd: function () {
    this._isHide = true;

    if (this._nextPos) {
      this.rootNode.setPosition(this._nextPos);
      this.playAnimate("show");
      this._nextPos = null;
      this._isHide = false;
    }
  },

  onCreate: function () {
    this.rootNode.setVisible(false);
    this._isHide = true;
  }
});

LevelController.LevelTutorial = LevelController.extend({
  _target: null,
  _introTips: null,
  _guideText: null,
  _guideAnim: null,
  _logoCtl: null,
  _isOver: false,

  prepare: function () {
    cc.log("prepare right");

    game.Data.oLyGame.ccbHPBar.setVisible(false);
    game.Data.oLyGame.nodeTRElements.setVisible(false);
    game.Data.oLyGame.nodeT.setVisible(false);
    game.Data.oLyGame.hideControlButton(
      LyGame.ControlButtonType.ActionButton |
      LyGame.ControlButtonType.JumpButton |
      LyGame.ControlButtonType.MoveButton
    );

    var introTips = cc.BuilderReader.load(res.introTips_ccbi);
    game.Data.oLyGame.lyMap.addChild(introTips);
    this._introTips = introTips.controller;

    this._guideText = vee.PopMgr.popCCB(res.guideText_ccbi).controller;
    if (!vee.Controller.isConnected) {
      this._guideText.setVisible(false);
    }

    this._guideText.show(this.firstStep.bind(this));

    cc.spriteFrameCache.addSpriteFrames(res.img_Logo_a_plist, res.img_Logo_a_png);
    cc.spriteFrameCache.addSpriteFrames(res.img_Logo_h_plist, res.img_Logo_h_png);
    cc.spriteFrameCache.addSpriteFrames(res.img_Logo_m_plist, res.img_Logo_m_png);
    cc.spriteFrameCache.addSpriteFrames(res.img_Logo_n_plist, res.img_Logo_n_png);
    cc.spriteFrameCache.addSpriteFrames(res.img_Logo_o_plist, res.img_Logo_o_png);
    cc.spriteFrameCache.addSpriteFrames(res.img_Logo_p_plist, res.img_Logo_p_png);
    cc.spriteFrameCache.addSpriteFrames(res.img_Logo_t_plist, res.img_Logo_t_png);
    cc.spriteFrameCache.addSpriteFrames(res.img_Logo_txt_cat_plist, res.img_Logo_txt_cat_png);

    this._logoCtl = cc.BuilderReader.load(res.guideLogo_ccbi).controller;
    game.Data.oLyGame.lyMap.addChild(this._logoCtl.rootNode, 99);

    vee.Analytics.logMissionStart("Tutorial");
    game.Data.oLyGame.freezeButton = true;
    LyCatGrow.show(function () {
      game.Data.oLyGame.freezeButton = false;
      EleGuide.show();
    });

    var skipSignTutorial = vee.data.skipSignTutorial;
    game.Data.oLyGame.setSkipButtonVisible(true);
    vee.data.skipSignTutorial = true;
    vee.saveData();
  },

  firstStep: function () {
    this.activateTarget(cc.p(21, 31));
    game.Data.oLyGame.showControlButton(LyGame.ControlButtonType.MoveButton, true, true);
  },

  activateTarget: function (grid) {
    this._target = grid;
    this._introTips.activate(game.Logic.getTilePosByGrid(grid));
  },

  achievedTarget: function () {
    this._introTips.achieved();
  },

  onUpdateLife: function (value) {
    game.Data.playerLife = game.Data.playerLife - value;
  },

  updateText: function (grid, title, contentKey) {
    if (title && title.length) {
      this._guideText.setText(title, contentKey);
      vee.Audio.playEffect(res.inGame_efx_showCourseText_mp3);
    }
  },

  extraFunc: function (grid, arg1, funcName, arg3) {
    if (funcName && this[funcName]) {
      this[funcName](grid, arg1, arg3);
    }
  },

  eventShowTarget: function (grid, arg1, data) {
    if (grid.x == this._target.x && grid.y == this._target.y) {
      this.achievedTarget();
      this.activateTarget(this.getGrid(data[1]));
      this.updateText(grid, data[2], data[3]);
      this.extraFunc(grid, arg1, data[4], data[5]);
    }
  },

  eventShowJump: function (grid, arg1, data) {
    if (grid.x == this._target.x && grid.y == this._target.y) {
      this.achievedTarget();
      this._target = this.getGrid(data[1]);
      game.Data.oLyGame.showControlButton(LyGame.ControlButtonType.JumpButton, true, true);
      this.updateText(grid, data[2], data[3]);
      this.extraFunc(grid, arg1, data[4], data[5]);
    }
  },

  eventGetCoin: function (grid, arg1, data) {
    if (grid.x == this._target.x && grid.y == this._target.y) {
      this.achievedTarget();
      this._target = this.getGrid(data[1]);
      this.updateText(grid, data[2], data[3]);
      this.extraFunc(grid, arg1, data[4], data[5]);
    }
  },

  eventHideText: function () {
    this.HideText();
  },

  eventTutorialStep: function (grid, arg1, data) {
    if (data.length > 0) {
      vee.Utils.logObj(data);
      EleGuide.showGuide(data[1]);
    }
  },

  eventOver: function () {
    if (this._isOver) {
      return;
    }

    this._isOver = true;
    game.Data.oLyGame.setSkipButtonVisible(false);
    game.Data.oLyGame.stopCamera = true;
    game.Data.oLyGame.freezeButton = true;
    game.Data.oLyGame.hideControlButton(
      LyGame.ControlButtonType.MoveButton |
      LyGame.ControlButtonType.JumpButton |
      LyGame.ControlButtonType.ActionButton
    );

    game.Data.oPlayerCtl.moveRight();
    game.Data.oPlayerCtl._isRandonBreath = false;
    game.Data.oPlayerCtl.playAnimate("huxi_1", function () {
    });

    var logoPos = game.Logic.getTilePosCenterByGrid(cc.p(91, 22));
    logoPos = cc.p(logoPos.x - 568, logoPos.y - 384);
    this._logoCtl.rootNode.setPosition(logoPos);
    this._logoCtl.show();

    logoPos = cc.p(-logoPos.x, -logoPos.y);
    var moveOffset = vee.Utils.pSub(logoPos, game.Data.oLyGame.lyContainer.getPosition());

    game.Data.oLyGame.lyContainer.runAction(cc.sequence(
      cc.spawn(
        cc.EaseExponentialOut.create(cc.moveBy(8, cc.p(0, moveOffset.y))),
        cc.EaseExponentialOut.create(cc.moveBy(1, cc.p(moveOffset.x, 0)))
      ),
      cc.delayTime(1),
      cc.callFunc(function () {
        cc.spriteFrameCache.removeSpriteFramesFromFile(res.img_Logo_a_plist);
        cc.spriteFrameCache.removeSpriteFramesFromFile(res.img_Logo_h_plist);
        cc.spriteFrameCache.removeSpriteFramesFromFile(res.img_Logo_m_plist);
        cc.spriteFrameCache.removeSpriteFramesFromFile(res.img_Logo_n_plist);
        cc.spriteFrameCache.removeSpriteFramesFromFile(res.img_Logo_o_plist);
        cc.spriteFrameCache.removeSpriteFramesFromFile(res.img_Logo_p_plist);
        cc.spriteFrameCache.removeSpriteFramesFromFile(res.img_Logo_t_plist);
        cc.spriteFrameCache.removeSpriteFramesFromFile(res.img_Logo_txt_cat_plist);
      })
    ));

    vee.Analytics.logMissionCompleted("Tutorial");
  },

  Highlight: function () {
    game.Data.oLyGame.setHighlightControlButton(LyGame.ControlButtonType.JumpButton, true);
  },

  HideText: function () {
    this._guideText.hide();
  },

  ShowExtra: function (grid, arg1, data) {
    Trigger.ShowExtra.func(grid, arg1, data);
  },

  HideExtra: function (grid, arg1, data) {
    Trigger.HideExtra.func(grid, arg1, data);
  },

  getGrid: function (value) {
    var data = value.split(",");
    return cc.p(data[0], data[1]);
  }
});

var EleGuideText = vee.Class.extend({
  lbTitle: null,
  lbContent: null,
  _isHide: false,

  show: function (callback) {
    this._isHide = false;
    this.rootNode.setPosition(vee.PopMgr.centerPoint);
    this.playAnimate("guide", callback);
  },

  setText: function (title, contentKey) {
    this._isHide = false;
    this.lbTitle.setString(title);
    this.lbContent.setString(vee.Utils.getLocalizedStringForKey(contentKey));
    this.playAnimate("show");
  },

  hide: function () {
    if (this._isHide) {
      return;
    }

    this._isHide = true;
    this.playAnimate("end");
  },

  setVisible: function (visible) {
    this.rootNode.setVisible(visible);
  }
});

var EleGuide = vee.Class.extend({
  onExit: function () {
    EleGuide.ctl = null;
  }
});

EleGuide.show = function () {
  if (!vee.Controller.isConnected) {
    var guide = cc.BuilderReader.load(res.lyPosGestureStar_ccbi);
    game.Data.oLyGame.lyMapBack.addChild(guide, 8);
    guide.controller.playAnimate("2", function () {
      guide.controller.playAnimate("loop2");
    });
    guide.setPosition(game.Logic.getTilePosCenterByGrid(cc.p(16, 31)));
    EleGuide.ctl = guide.controller;
  }
};

EleGuide.showGuide = function (pos, animName, callback) {
  if (!vee.Controller.isConnected) {
    animName = animName || "2";

    var guide = cc.BuilderReader.load(res.lyPosGestureStar_ccbi);
    game.Data.oLyGame.lyMapBack.addChild(guide, 8);
    guide.controller.playAnimate(animName, function () {
      guide.controller.playAnimate("loop" + animName);

      if (callback) {
        callback();
      }
    });
    guide.setPosition(game.Logic.getTilePosCenterByGrid(pos));
  }
};

EleGuide.ctl = null;
