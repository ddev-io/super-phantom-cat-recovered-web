// Source-like reconstruction from UI/lyGetBlackCat.dis

var LyGetBlackCat = vee.Class.extend({
  btnVideo: null,
  btnOK: null,
  _isOver: false,
  _tempControllerState: null,

  ccbInit: function () {
    this.handleKey(true);
    this._tempControllerState = vee.Controller.cacheControllerState();

    game.Data.oLyGame.leftBtnUp();
    game.Data.oLyGame.rightBtnUp();
    vee.Audio.playEffect(res.inGame_function_unlockAvator_mp3);

    this.playAnimate(game.Data.isFreeGame || game.Data.isWeiXin ? "open" : "open_pro");

    if (game.Data.isWeiXin) {
      this.btnVideo.setBackgroundSpriteForState(
        new cc.Scale9Sprite(res.btn_hero_power_watch_weixin_png),
        cc.CONTROL_STATE_NORMAL
      );
    }

    this.initController();
  },

  onKeyBack: function () {
    this.onClose();
    return true;
  },

  initController: function () {
    vee.Controller.clearAllButtonAction();
    vee.Controller.initSelector(1, 1, this.onClose.bind(this), cc.p(0, 0));

    var handler = game.Data.isFreeGame ? this.onVideo.bind(this) : this.onOK.bind(this);
    var button = game.Data.isFreeGame ? this.btnVideo : this.btnOK;

    vee.Controller.registerItemByButton(button, cc.p(0, 0), handler, "res/mfi_btn_on_210.png");
    vee.Controller.activeSelector();
  },

  onVideo: function () {
    if (this._isOver) {
      return;
    }

    vee.Audio.stopAllEffcts();
    if (game.LevelData.selectedCategory && game.LevelData.selectedLevel) {
      var category = game.LevelData.selectedCategory.idx + 1;
      var level = game.LevelData.selectedLevel.idx + 1;
      vee.Analytics.logEvent("GetBlackCatAt" + category + "0" + level);
    }

    var successCall = function () {
      game.Data.oLyGame.resumeGame();
      vee.PopMgr.closeLayer();
      vee.Controller.reviveControllerState(this._tempControllerState);
      vee.Analytics.UGameEvent.showAdEvent("alert", "video", "blackCat");
      vee.Utils.scheduleOnce(function () {
        ItemTransformBox.transformToHawk();
      }, 2);
    }.bind(this);

    if (game.Data.isWeiXin) {
      vee.IAPMgr.buyProduct(4, successCall);
    } else if (game.Data.zqdebug) {
      successCall();
    } else {
      vee.Ad.showVideoAd(successCall, "blackCat");
    }
  },

  onOK: function () {
    if (this._isOver) {
      return;
    }

    if (game.LevelData.selectedCategory && game.LevelData.selectedLevel) {
      var category = game.LevelData.selectedCategory.idx + 1;
      var level = game.LevelData.selectedLevel.idx + 1;
      vee.Analytics.logEvent("GetBlackCatAt" + category + "0" + level);
      game.Data.oLyGame._isBlackCatModel = true;
    }

    game.Data.oLyGame.resumeGame();
    ItemTransformBox.transformToHawk();
    this.onClose();
  },

  onClose: function () {
    if (this._isOver) {
      return;
    }

    this._isOver = true;
    vee.Controller.deactiveSelector();
    vee.Controller.reviveControllerState(this._tempControllerState);
    this.playAnimate(game.Data.isFreeGame ? "hide" : "hide_pro", this.closeFunc.bind(this));
  },

  closeFunc: function () {
    vee.PopMgr.closeLayerByCtl(this);
    game.Data.oLyGame.resumeGame();
  }
});

LyGetBlackCat.show = function () {
  cc.log("zq debug ly get black cat pop========");

  if (game.Data.isFreeGame && !game.Data.isWeiXin) {
    if (!game.Data.zqdebug && !vee.Ad.checkCacheVideoAd()) {
      return;
    }
  }

  var layer = vee.PopMgr.popCCB(res.lyBlackCatPower_ccbi, { alpha: 0 });
  layer.controller.ccbInit();
  game.Data.oLyGame.pauseGame();
};
