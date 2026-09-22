// Source-like reconstruction from UI/lyVideoAlert.dis

var LyVideoAlert = vee.Class.extend({
  btnVideo: null,
  lbTitle: null,
  lbDetail: null,
  layerType: null,
  _tempControllerState: null,

  ccbInit: function (type) {
    vee.Audio.playEffect(res.inGame_function_unlockAvator_mp3);
    this.playAnimate("show", this.initController.bind(this));
    this.layerType = type;

    switch (type) {
      case LyVideoAlert.Type.FOR_LIFE:
        this.lbTitle.setString(vee.Utils.getLocalizedStringForKey("EXTRA LIFE"));
        this.lbDetail.setString(vee.Utils.getLocalizedStringForKey("Watch video to get an extra life"));
        break;
    }

    if (game.Data.isWeiXin) {
      this.btnVideo.setBackgroundSpriteForState(
        new cc.Scale9Sprite(res.btn_fill_watch_weixin_png),
        cc.CONTROL_STATE_NORMAL
      );
    }

    this.handleKey(true);
    this._tempControllerState = vee.Controller.cacheControllerState();
  },

  initController: function () {
    vee.Controller.initSelector(1, 1, this.onClose.bind(this), cc.p(0, 0));
    vee.Controller.registerItemByButton(this.btnVideo, cc.p(0, 0), this.onVideo.bind(this), "res/mfi_btn_on_170.png");
    vee.Controller.activeSelector();
  },

  onVideo: function () {
    var successCall = function () {
      game.Data.oLyGame.resumeGame();
      vee.PopMgr.closeLayer();

      if (this.layerType === LyVideoAlert.Type.FOR_LIFE) {
        vee.Utils.scheduleOnce(function () {
          game.Data.addLife();
          game.Data.oPlayerCtl.hurtInvisible(12);
          game.Data.oPlayerCtl.hurtShock();
          vee.Analytics.UGameEvent.showAdEvent("alert", "video", "addLife");
        }, 0.2);
        vee.Controller.reviveControllerState(this._tempControllerState);
      }
    }.bind(this);

    if (game.Data.isWeiXin) {
      vee.IAPMgr.buyProduct(6, successCall);
    } else {
      vee.Ad.showVideoAd(successCall, "addLife");
    }

    vee.Controller.deactiveSelector();
  },

  onClose: function () {
    game.Data.oLyGame.resumeGame();
    this.playAnimate("hide", function () {
      vee.PopMgr.closeLayerByCtl(this);
      if (this.layerType === LyVideoAlert.Type.FOR_LIFE) {
        game.Data.gameOver();
      }
      vee.Controller.reviveControllerState(this._tempControllerState);
    }.bind(this));
    vee.Controller.deactiveSelector();
  },

  onKeyBack: function () {
    this.onClose();
    return true;
  }
});

LyVideoAlert.show = function (type) {
  if (!type) {
    type = LyVideoAlert.Type.FOR_LIFE;
  }

  if (vee.Ad.checkCacheVideoAd() || game.Data.isWeiXin) {
    var layer = vee.PopMgr.popCCB(res.lyVideoAlert_ccbi, { alpha: 0 });
    layer.controller.ccbInit(type);
    game.Data.oLyGame.pauseGame();
    return true;
  }

  return false;
};

LyVideoAlert.Type = {
  FOR_HAWK: 1,
  FOR_LIFE: 2
};
