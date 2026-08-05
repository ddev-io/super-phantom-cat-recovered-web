function __lyPauseCall(obj, methodName) {
  if (!obj || typeof obj[methodName] !== "function") {
    return undefined;
  }
  return obj[methodName].apply(obj, Array.prototype.slice.call(arguments, 2));
}

function __lyPausePoint(x, y) {
  return (typeof cc !== "undefined" && cc.p) ? cc.p(x, y) : { x: x, y: y };
}

function __lyPauseSetVisible(node, visible) {
  __lyPauseCall(node, "setVisible", !!visible);
}

function __lyPauseLocalized(text) {
  if (typeof vee !== "undefined" && vee.Utils && typeof vee.Utils.getLocalizedStringForKey === "function") {
    return vee.Utils.getLocalizedStringForKey(text);
  }
  return text;
}

var LyPause = vee.Class.extend({
  btnQuit: null,
  btnControl: null,
  btnResume: null,
  btnChange: null,
  ccbMusicBtn: null,
  ccbSoundBtn: null,
  lbChangeDesc: null,
  _isOver: false,
  _tempControllerState: null,

  onCreate: function () {
    __lyPauseCall(vee.Audio, "pauseMusic");
    game.Data.oPauseCtl = this;
  },

  onKeyBack: function () {
    this.onResume();
    return true;
  },

  ccbInit: function () {
    var self = this;

    __lyPauseCall(this, "playAnimate", "show", function () {
      if (game.Data.oLyGame && game.Data.oLyGame.rootNode) {
        __lyPauseCall(game.Data.oLyGame.rootNode, "pause");
      }
    });

    __lyPauseCall(this, "handleKey", true);
    __lyPauseCall(this.btnChange, "setSelected", __lyPauseCall(game.Data, "isStaticBG"));
    __lyPauseCall(vee.Audio, "playEffect", res.inGame_menu_showPausePage_mp3);

    __lyPauseSetVisible(this.btnChange, game.Data.isAndroid);
    __lyPauseSetVisible(this.lbChangeDesc, game.Data.isAndroid);

    __lyPauseCall(vee.Controller, "cacheControllerState", this);

    if (__lyPauseCall(MultiController, "checkHasMultiLevel")) {
      __lyPauseCall(MultiController, "sendPauseGame");
      MultiController._isReady = false;
    }
  },

  onExit: function () {
    game.Data.oPauseCtl = null;
  },

  initController: function () {
    __lyPauseCall(vee.Controller, "initSelector", 4, 3, this.onResume.bind(this), __lyPausePoint(1, 0));
    this.createItem();
    __lyPauseCall(vee.Controller, "activeSelector");
  },

  createItem: function () {
    __lyPauseCall(vee.Controller, "registerItemByButton", this.btnResume, __lyPausePoint(1, 0), this.onResume.bind(this), "res/mfi_pause_btn_big.png");
    __lyPauseCall(vee.Controller, "registerItemByButton", this.btnQuit, __lyPausePoint(2, 0), this.onQuit.bind(this), "res/mfi_pause_btn_small.png");

    var soundController = this.ccbSoundBtn && this.ccbSoundBtn.controller;
    if (soundController) {
      __lyPauseCall(vee.Controller, "registerItemByButton", soundController.btnChange, __lyPausePoint(1, 1), soundController.onChange.bind(soundController), "res/mfi_pause_btn_small.png");
    }

    var musicController = this.ccbMusicBtn && this.ccbMusicBtn.controller;
    if (musicController) {
      __lyPauseCall(vee.Controller, "registerItemByButton", musicController.btnChange, __lyPausePoint(2, 1), musicController.onChange.bind(musicController), "res/mfi_pause_btn_small.png");
    }

    if (game.Data.isAndroid) {
      __lyPauseCall(vee.Controller, "registerItemByButton", this.btnChange, __lyPausePoint(0, 2), this.onChange.bind(this), "res/mfi_pause_btn_small.png");
    }
  },

  onQuit: function () {
    if (this._isOver) {
      return;
    }

    cc.log("zq debug ly pause on quit=====================");
    __lyPauseCall(vee.Audio, "playEffect", res.inGame_menu_showMessage_mp3);

    __lyPauseCall(
      vee.PopMgr,
      "alert",
      __lyPauseLocalized("Do you want to return to the Stage Select page? (Your game progress will not be saved.)"),
      __lyPauseLocalized("QUIT"),
      this._confirmQuit.bind(this),
      function () {}
    );
  },

  _confirmQuit: function () {
    var self = this;

    __lyPauseCall(MultiController, "sendLeaveGameMsg");
    this._isOver = true;

    if (game.Data.oLyGame && game.Data.oLyGame.rootNode) {
      __lyPauseCall(game.Data.oLyGame.rootNode, "resume");
    }

    game.Data.oPauseCtl = null;
    __lyPauseCall(vee.PopMgr, "resume");

    __lyPauseCall(this, "playAnimate", "empty", function () {
      __lyPauseCall(game.Data, "stageFinish", game.FinishType.QUIT);
      __lyPauseCall(vee.Transition, "out", res.MapTransition_ccbi, function () {
        LyLevelSelect.show();
      });
      __lyPauseCall(vee.Controller, "deactiveSelector");
    });
  },

  onChange: function () {
    var isStatic = !!__lyPauseCall(game.Data, "isStaticBG");
    __lyPauseCall(this.btnChange, "setSelected", !isStatic);
    __lyPauseCall(game.Data, "setStaticBG", !isStatic);
  },

  onControl: function () {
    if (this._isOver) {
      return;
    }
    LyPosSetting.show();
  },

  onResume: function () {
    var self = this;

    __lyPauseCall(vee.Controller, "deactiveButton");
    __lyPauseCall(vee.Controller, "deactiveSelector");
    __lyPauseCall(vee.Audio, "resumeMusic");

    if (__lyPauseCall(MultiController, "checkHasMultiLevel")) {
      __lyPauseCall(MultiController, "sendBackGame");
      MultiController._isReady = true;
    }

    if (this._isOver) {
      return;
    }

    this._isOver = true;
    __lyPauseCall(cc.director, "resume");
    game.Data.oPauseCtl = null;
    __lyPauseCall(vee.Audio, "playEffect", res.inGame_menu_hidePausePage_mp3);

    __lyPauseCall(this, "playAnimate", "hide", function () {
      __lyPauseCall(vee.PopMgr, "closeLayer");
      __lyPauseCall(vee.PopMgr, "resume");

      if (game.Data.oLyGame) {
        __lyPauseCall(game.Data.oLyGame, "resumeGame");
        __lyPauseCall(vee.Controller, "reviveControllerStateByCtl", self);
      }
    });

    this._refreshBackgroundAfterResume();
  },

  _refreshBackgroundAfterResume: function () {
    var lyGame = game.Data.oLyGame;
    if (!lyGame || !lyGame.lyBG) {
      return;
    }

    __lyPauseCall(lyGame.lyBG, "removeAllChildren");

    if (game.Data.bgName) {
      if (__lyPauseCall(game.Data, "isStaticBG")) {
        var bg = new cc.Sprite("res/" + game.Data.bgName + ".png");
        __lyPauseCall(bg, "setAnchorPoint", __lyPausePoint(0, 0));
        __lyPauseCall(lyGame.lyBG, "addChild", bg, 1);
        lyGame.bgCtl = null;
      } else if (typeof LyDynamicBG !== "undefined" && LyDynamicBG.create) {
        var dynamicBg = LyDynamicBG.create(game.Data.bgName);
        __lyPauseCall(lyGame.lyBG, "addChild", dynamicBg, 1);
        lyGame.bgCtl = dynamicBg && dynamicBg.controller;
      }
    }

    lyGame._wideBgFixKey = null;
    __lyPauseCall(lyGame, "adaptWideScreenBackground", true);

    if (game.Data.stageType === game.StageType.Parkour && game.Data.oPlayerCtl) {
      __lyPauseCall(game.Data.oPlayerCtl, "parkourMove");
    }
  }
});

LyPause.show = function () {
  var layer = __lyPauseCall(vee.PopMgr, "popCCB", res.gamePuase_ccbi, { alpha: 0 });
  if (layer && layer.controller) {
    __lyPauseCall(layer.controller, "ccbInit");
  }
  return layer;
};
