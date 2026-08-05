// Recovered source-like JS from /mnt/data/smdis/dis/UI/popview/ccbRevivalVideoAlert.dis
// Source-like reconstruction from smdis.

var ccbRevivalVideoAlert = vee.Class.extend({
  btnVideo: null,
  lbTitle: null,
  lbDetail: null,
  layerType: null,
  ccbInit: function (arg0) {
    this.handleKey(true);
    this.revivalType = arg0;
    vee.Audio.playEffect(res.inGame_function_unlockAvator_mp3);
    this.playAnimate("show");
    this._tempControllerState = vee.Controller.cacheControllerState();
    vee.Controller.cacheControllerState();
    this.initController();
  },
  initController: function () {
    vee.Controller.clearAllButtonAction();
    vee.Controller.initSelector(1, 1, this.onClose.bind(this), cc.p(0, 0));
    vee.Controller.registerItemByButton(this.btnVideo, cc.p(0, 0), this.onVideo.bind(this), "res/mfi_btn_on_170.png");
    vee.Controller.activeSelector();
  },
  onVideo: function () {
    vee.Utils.scheduleOnce(function () {
      if ((this.revivalType != ccbRevivalVideoAlert.revivalType.DEADZONE)) {
        this.revivalByNormal();
      } else {
        this.revivalByDeadZone();
      }
      game.Data.oLyGame.resumeGame();
      vee.PopMgr.closeLayer();
      vee.Controller.reviveControllerState(this._tempControllerState);
    }.bind(this), 0.2);
    vee.Controller.reviveControllerState(this._tempControllerState);
    game.Data.willShowVideoAd = true;
    vee.Controller.deactiveSelector();
  },
  revivalByNormal: function () {
    game.Data.addLife();
    game.Data.oPlayerCtl._container.stopAllActions();
    game.Data.oPlayerCtl.hurtInvisible(12);
    game.Data.oPlayerCtl.hurtShock();
  },
  revivalByDeadZone: function () {
    game.Data.oPlayerCtl.revivalByDeadZone();
  },
  onClose: function () {
    game.Data.oLyGame.resumeGame();
    this.playAnimate("hide", function () {
      vee.PopMgr.closeLayerByCtl(this);
      game.Data.gameOver();
      vee.Controller.reviveControllerState(this._tempControllerState);
    }.bind(this));
    vee.Controller.deactiveSelector();
  },
  onKeyBack: function () {
    this.onClose();
    return true;
  }
});
ccbRevivalVideoAlert.show = function (arg0) {
  if (((game.Data.zqdebug) || (vee.Ad.checkCacheVideoAd()))) {
    var local0 = vee.PopMgr.popCCB(res.ccbRevivalVideoAlert_ccbi, {
      alpha: 0
    });
    local0.controller.ccbInit(arg0);
    game.Data.oLyGame.pauseGame();
    return true;
  } else {
    return false;
  }
};
ccbRevivalVideoAlert.revivalType = {
  NORMAL: 1,
  DEADZONE: 2
};
