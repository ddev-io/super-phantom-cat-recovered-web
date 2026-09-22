// Recovered source-like JS from /mnt/data/smdis/dis/UI/popview/ccbAlertUnlockLevel.dis
// Source-like reconstruction from smdis.

var ccbAlertUnlockLevel = vee.Class.extend({
  btnBuy: null,
  btnWatch: null,
  lbWatch: null,
  levelId: null,
  videoCallback: null,
  closeCallback: null,
  labPrice: null,
  init: function (arg0, arg1, arg2) {
    this.levelId = arg0;
    this.videoCallback = arg1;
    this.closeCallback = arg2;
    this.handleKey(true);
    this.playAnimate("show", this.initController.bind(this));
    vee.Controller.cacheControllerState(this);
    vee.IAPMgr.setPriceLabByServer(vee.IAPMgr.goodsKey.UNLOCK_PARKOUR_LEVELS, this.labPrice);
    this.btnWatch.setEnabled(vee.Ad.checkCacheVideoAd());
  },
  onKeyBack: function () {
    this.onClose();
    return true;
  },
  initController: function () {
    vee.Controller.initSelector(2, 1, this.onClose.bind(this), cc.p(0, 0));
    vee.Controller.registerItemByButton(this.btnWatch, cc.p(0, 0), this.onWatch.bind(this), "res/mfi_btn_on_170.png");
    vee.Controller.registerItemByButton(this.btnBuy, cc.p(1, 0), this.onBuy.bind(this), "res/mfi_btn_on_170.png");
    vee.Controller.activeSelector();
  },
  onBuy: function () {
    cc.log("zq debug buy parkour all levels");
    vee.IAPMgr.buyProduct(4, function () {
      this.onClose(true);
      vee.dataManager.setAllParkourLevelUnlock();
      if (this.videoCallback) {
        this.videoCallback();
      }
    }.bind(this));
  },
  onWatch: function () {
    if (!(this.btnWatch.isEnabled())) {
      return undefined;
    }
    vee.Ad.showVideoAd(function () {
      this.onClose(true);
      vee.dataManager.unlockParkourLevel(this.levelId);
      if (this.videoCallback) {
        this.videoCallback();
      }
      vee.Analytics.UGameEvent.showAdEvent("alert", "video", ("unlockParkourLv_" + this.levelId));
    }.bind(this), "unlockParkourLv");
  },
  btnClose: null,
  _isOver: false,
  onClose: function (skipCloseCallback) {
    if (this._isOver) {
      return undefined;
    }
    this._isOver = true;
    vee.Controller.deactiveSelector();
    vee.Controller.reviveControllerStateByCtl(this);
    this.playAnimate("hide", function () {
      vee.PopMgr.closeLayerByCtl(this);
      if (skipCloseCallback !== true && this.closeCallback) {
        this.closeCallback();
      }
    }.bind(this));
  }
});
ccbAlertUnlockLevel.show = function (arg0, arg1, arg2) {
  var local0 = vee.PopMgr.popCCB(res.ccbAlertUnlockLevel_ccbi, {
    alpha: 0
  });
  local0.controller.init(arg0, arg1, arg2);
};
