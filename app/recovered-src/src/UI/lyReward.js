// Source-like reconstruction from UI/lyReward.dis

var LyReward = vee.Class.extend({
  btnVideo: null,
  btnConfirm: null,
  btnRewardCoin: null,
  lbDetailCoin: null,
  lbDetailVideo: null,
  isOver: false,
  type: null,
  randomCoin: 0,
  _tempControllerState: null,

  setType: function (type) {
    vee.Audio.playEffect(res.inGame_function_bonusEntrance_mp3);
    this.type = type;
    this.randomCoin = vee.Utils.randomInt(50, 100);

    this.lbDetailCoin.setString(
      vee.Utils.getLocalizedStringForKey("Collect") + " " + this.randomCoin + " " +
      vee.Utils.getLocalizedStringForKey("data")
    );
    this.lbDetailVideo.setString(
      vee.Utils.getLocalizedStringForKey("Collect") + " " + game.Data.videoReward + " " +
      vee.Utils.getLocalizedStringForKey("data")
    );

    if (type === LyReward.Type.Video) {
      this.playAnimate("show");
    } else if (type === LyReward.Type.Coin) {
      this.playAnimate("showNoVideo");
    }

    this.handleKey(true);

    if (game.Data.isWeiXin) {
      this.btnVideo.setBackgroundSpriteForState(
        new cc.Scale9Sprite(res.btn_fill_watch_weixin_png),
        cc.CONTROL_STATE_NORMAL
      );
    }

    this._tempControllerState = vee.Controller.cacheControllerState();
  },

  initController: function () {
    vee.Controller.initSelector(2, 1, this.onClose.bind(this), cc.p(0, 0));
    vee.Controller.registerItemByButton(
      this.btnRewardCoin,
      cc.p(0, 0),
      this.onRewardCoin.bind(this),
      "res/mfi_btn_on_170.png"
    );

    if (this.type === LyReward.Type.Video) {
      vee.Controller.registerItemByButton(this.btnVideo, cc.p(1, 0), this.onVideo.bind(this), "res/mfi_btn_on_170.png");
    } else {
      vee.Controller.registerItemByButton(this.btnConfirm, cc.p(1, 0), this.onVideo.bind(this), "res/mfi_btn_on_170.png");
    }

    vee.Controller.activeSelector();
  },

  onKeyBack: function () {
    this.onClose();
    return true;
  },

  onVideo: function () {
    if (this.isOver) {
      return;
    }

    this.isOver = true;
    this.onClose(true);

    if (this.type === LyReward.Type.Video) {
      var successCall = function () {
        if (game.Data.oLyGameOver) {
          game.Data.oLyGameOver.checkAvatar(500);
          game.Data.oLyGameOver.startProgress();
        }
        vee.Analytics.UGameEvent.showAdEvent("alert", "video", "lyReward_500coin");
      };

      if (game.Data.isWeiXin) {
        vee.IAPMgr.buyProduct(5, successCall);
      } else {
        vee.Ad.showVideoAd(successCall, "500CoinReward");
      }
    } else {
      vee.Ad.showVideoAd(function () {
        vee.Utils.scheduleOnce(function () {
          vee.PopMgr.alert(
            vee.Utils.getLocalizedStringForKey("There will be NO Ads before you quit this game. Enjoy it!"),
            vee.Utils.getLocalizedStringForKey("REMOVE ADS")
          );
        }, 0.2);
        game.Data.banAdThisGame = true;
      }, "lyReward");
    }
  },

  onRewardCoin: function () {
    if (this.isOver) {
      return;
    }

    this.isOver = true;
    this.onClose(true);

    if (game.Data.oLyGameOver) {
      game.Data.oLyGameOver.checkAvatar(this.randomCoin);
      game.Data.oLyGameOver.startProgress();
    }
  },

  onClose: function (force) {
    if (this.isOver && !force) {
      return;
    }

    this.isOver = true;
    vee.Controller.deactiveSelector();

    var closeFunc = function () {
      vee.Controller.reviveControllerState(this._tempControllerState);
      vee.PopMgr.closeLayerByCtl(this);
    }.bind(this);

    if (this.type === LyReward.Type.Video) {
      this.playAnimate("close", closeFunc);
    } else if (this.type === LyReward.Type.Coin) {
      this.playAnimate("closeNoVideo", closeFunc);
    }
  }
});

LyReward.hasShown = false;
LyReward.forceShowCoin = 500;
LyReward.Type = {
  Video: 1,
  Coin: 2,
  BanAd: 3
};

LyReward.show = function (type) {
  if (!game.Data.isFreeGame) {
    return;
  }

  var layer = vee.PopMgr.popCCB(res.vAlertboxPop_ccbi, { alpha: 0 });
  layer.controller.setType(type);
  LyReward.hasShown = true;
};

LyReward.showLogic = function (force) {
  if (!game.Data || game.Data.stageType !== game.StageType.Event) {
    return;
  }

  if (LyReward.hasShown) {
    LyReward.hasShown = false;
    return;
  }

  var nextAvatar = game.AvatarData.getNextAvatar();
  if (!nextAvatar || nextAvatar.idx < 2) {
    return;
  }

  var luckyRate = force ? 0.9 : 0.9;
  if (!vee.Utils.isLucky(luckyRate)) {
    return;
  }

  if (vee.Ad.checkCacheVideoAd() || game.Data.isWeiXin) {
    LyReward.show(LyReward.Type.Video);
  } else {
    LyReward.show(LyReward.Type.Coin);
  }
};
