// Source-like reconstruction from UI/lyUnlockedMoonWorld.dis

var LyUnlockedMoonWorld = vee.Class.extend({
  btnConfirm: null,
  btnClose: null,
  btnBuy: null,
  lbDes: null,
  _isOver: false,
  _tempControllerState: null,
  _isBuy: false,
  labPrice: null,

  ccbInit: function (isUnlockMoon) {
    this.handleKey(true);

    if ((game.Data.isAndroid || game.Data.version.isNewIosVersion) && game.Data.isFreeGame) {
      cc.log("Moon Data2:" + vee.data.moon);
      if (!vee.data.moon) {
        this.playAnimate("open_buy");
        this._isBuy = true;
        vee.IAPMgr.setPriceLabByServer(vee.IAPMgr.goodsKey.UNLOCKMOON, this.labPrice);
      } else {
        this._isBuy = false;
        this.playAnimate("open");
      }
    } else {
      this._isBuy = false;
      this.playAnimate("open");
    }

    if (isUnlockMoon) {
      this.lbDes.setString("Unlock Moon World");
    }

    this._tempControllerState = vee.Controller.cacheControllerState();
    this.initController();

    if ((game.Data.isFreeGame && (game.Data.isAndroid || game.Data.version.isNewIosVersion)) && this._isBuy) {
      this.lbDes.setString(vee.Utils.getLocalizedStringForKey("Moon World with 24 new levels!"));
    } else if (!this._isBuy) {
      var idx = game.LevelData.selectedCategory.idx + 100;
      var category = game.LevelData.getCategory(idx);
      this.lbDes.setString(
        vee.Utils.getLocalizedStringForKey("moon world") + " " +
        vee.Utils.getLocalizedStringForKey(category.title)
      );
    }
  },

  initController: function () {
    cc.log("zq debug ly unlocked moon world init controller");
    vee.Controller.clearAllButtonAction();
    vee.Controller.activeButton();
    vee.Controller.initSelector(1, 1, this.onClose.bind(this), cc.p(0, 0));
    vee.Controller.registerItemByButton(this.btnBuy, cc.p(0, 0), this.onBuy.bind(this), "res/mfi_btn_on_170.png");
    vee.Controller.activeSelector();
  },

  onBuy: function () {
    cc.log("zqdebug onBuy click");
    if (this._isOver) {
      return;
    }

    cc.log("on buy click111111");
    vee.IAPMgr.buyProduct(3, function () {
      cc.log("on buy click222222");
      vee.data.moon = true;
      this.onClose();
      vee.Analytics.logChargeSuccess(game.Data.orderId);
    }.bind(this), function () {});

    game.Data.orderId = new Date().getTime();
    vee.Analytics.logChargeRequest(game.Data.orderId, 3, 0.99);
    cc.log("on buy click 3333333");
  },

  onConfirm: function () {
    if (this._isOver) {
      return;
    }

    this._isOver = true;
    this.playAnimate("hide", function () {
      vee.Controller.reviveControllerState(this._tempControllerState);
      vee.PopMgr.closeLayerByCtl(this);
    }.bind(this));
    vee.Controller.deactiveSelector();
  },

  onClose: function () {
    cc.log("zq debug ly unlocked moon world onClose");
    if (this._isOver) {
      return;
    }

    this._isOver = true;
    this.playAnimate("hide", function () {
      vee.Controller.reviveControllerState(this._tempControllerState);
      vee.PopMgr.closeLayerByCtl(this);
    }.bind(this));
    vee.Controller.deactiveSelector();
  },

  onKeyBack: function () {
    this.onClose();
    return true;
  }
});

LyUnlockedMoonWorld.show = function (isUnlockMoon) {
  var layer = vee.PopMgr.popCCB(res.lyUnlockedMoonWorld_ccbi, { alpha: 0 });
  layer.controller.ccbInit(isUnlockMoon);
};
