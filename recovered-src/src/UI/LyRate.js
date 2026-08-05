// Recovered source-like JS from /mnt/data/smdis/dis/UI/LyRate.dis
// Source-like reconstruction from smdis.

var LyRate = vee.Class.extend({
  _isOver: false,
  _tempSelectorState: null,
  btnStar1: null,
  btnStar2: null,
  btnStar3: null,
  btnStar4: null,
  btnStar5: null,
  ccbInit: function () {
    vee.Audio.playEffect(res.inGame_menu_showMessage_mp3);
    this.playAnimate("show");
    this.handleKey(true);
    this._tempSelectorState = vee.Controller.cacheControllerState();
    vee.Controller.cacheControllerState();
    this.initController();
  },
  initController: function () {
    vee.Controller.clearAllButtonAction();
    vee.Controller.activeButton();
    vee.Controller.initSelector(1, 1, this.onClose.bind(this), cc.p(0, 0));
    vee.Controller.registerButtonAction([vee.KeyCode.BUTTON_A, vee.KeyCode.BUTTON_DPAD_CENTER], this.onConfirm5.bind(this));
    vee.Controller.activeSelector();
  },
  onKeyBack: function () {
    this.onClose();
    return true;
  },
  onConfirm1: function () {
    this.onClose();
    vee.Analytics.UGameEvent.rateClickEvent(1);
  },
  onConfirm2: function () {
    this.onClose();
    vee.Analytics.UGameEvent.rateClickEvent(2);
  },
  onConfirm3: function () {
    this.onClose();
    vee.Analytics.UGameEvent.rateClickEvent(3);
  },
  onConfirm4: function () {
    cc.log("zq debug rate layer click 4");
    this.onConfirm();
    vee.Analytics.UGameEvent.rateClickEvent(4);
  },
  onConfirm5: function () {
    cc.log("zq debug rate layer click 5");
    this.onConfirm();
    vee.Analytics.UGameEvent.rateClickEvent(5);
  },
  onConfirm: function () {
    if (this._isOver) {
      return undefined;
    }
    this._isOver = true;
    vee.Utils.rateUs();
    game.Data.rated();
    this.closeFunc();
  },
  onClose: function () {
    if (this._isOver) {
      return undefined;
    }
    this._isOver = true;
    this.closeFunc();
  },
  closeFunc: function () {
    vee.Controller.deactiveSelector();
    this.playAnimate("hide", function () {
      vee.Controller.reviveControllerState(this._tempSelectorState);
      vee.PopMgr.closeLayerByCtl(this);
    }.bind(this));
  }
});
LyRate.show = function () {
  if (vee.Utils.isIOS103()) {
    vee.Utils.rateUs();
  } else {
    var local0 = vee.PopMgr.popCCB(res.warnPayment_ccbi, {
      alpha: 0
    });
    local0.controller.ccbInit();
    vee.Audio.playEffect(res.inGame_menu_showMessage_mp3);
  }
};
