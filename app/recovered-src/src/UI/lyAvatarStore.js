// Source-like reconstruction from UI/lyAvatarStore.dis

var BtnShop = vee.Class.extend({
  spHead: null,
  spBtnR: null,
  btnOpenStore: null,
  tmpIndex: 0,

  onCreate: function () {
    BtnShop.instance = this;
    this.refreshBtnHead();
    vee.Controller.registerControllerSprite(this.spBtnR);
  },

  onExit: function () {
    BtnShop.instance = null;
    vee.Controller.removeControllerSprite(this.spBtnR);
  },

  refreshBtnHead: function () {
    var avatar = game.AvatarData.getCurrentAvatar();
    this.spHead.setTexture(avatar.headName);
  },

  onOpenStore: function () {
    if (game.Data.zqdebug) {
      LyMultiGameWin.show();
      this.tmpIndex = +this.tmpIndex + 1;
      return;
    }

    if (LyLevelSelect.isUnlocking) {
      return;
    }

    var store = LyAvatarStore.getInstance();
    if (store) {
      store.show();
    }
  }
});

BtnShop.instance = null;
BtnShop.refreshHead = function () {
  if (BtnShop.instance) {
    BtnShop.instance.refreshBtnHead();
  }
};

var LyAvatarStore = vee.Class.extend({
  pagingCtl: null,
  btnClose: null,
  btnBuyAll: null,
  btnRestore: null,
  containerNode: null,
  lbPrice: null,
  lbRestore: null,
  ccbBuyAvatar: null,
  _tempControllerState: null,
  _defaultCursorGrid: null,

  onLoaded: function () {
    LyAvatarStore.instance = this;
    this.initContent();

    var count = this.lyContent.getChildrenCount();
    var pageNum = game.Data.isFreeGame ? Math.ceil((count - 1) / 2) + 1 : Math.ceil(count / 2);
    cc.log("lyContent count=====%d   num====%d", count, pageNum);

    var paging = vee.PowerPagingController.registerController(this.lyContent, pageNum);
    paging.setSensitivity(0.75);
    paging.setBounceEnabled(true);
    paging.setPageChanged(this.onPageChanged.bind(this));
    paging.setDragingBuffer(30);
    paging.setEnabled(false);
    this.pagingCtl = paging;

    vee.PopMgr.setNodePos(this.btnClose, vee.PopMgr.PositionType.TopRight, cc.p(0, 0));
    this.rootNode.setVisible(false);
    this.rootNode.setLocalZOrder(-1);
    this.refreshCoin();
    this.refreshBuyState();
    this.handleKey(true);
    LyAvatarStore.isShow = false;
  },

  initContent: function () {
    cc.log(
      "content size===w==%d  h==%d",
      this.lyContent.getContentSize().width,
      this.lyContent.getContentSize().height
    );

    var productCount = game.AvatarData.getProductData().length;
    var firstCell = this.lyContent.getChildByTag(1);
    var startX = firstCell.getPositionX();

    for (var i = 1; i < productCount; i++) {
      var node = cc.BuilderReader.load(res.avatarCell_ccbi);
      var tag = i + 1;
      node.setTag(tag);

      var page = Math.floor(i / 2);
      var y = ((tag + 1) % 2 === 0) ? 360 : 114;
      var x = startX + page * 552;

      node.setPosition(cc.p(x, y));
      this.lyContent.addChild(node);
      this["avatarCell" + tag] = node;
      node.controller.init(tag);
    }
  },

  initController: function () {
    vee.Controller.activeButton();
    vee.Controller.registerButtonAction(
      vee.KeyCode.BUTTON_DPAD_LEFT,
      this.pageToLeft.bind(this)
    );
    vee.Controller.registerButtonAction(
      vee.KeyCode.BUTTON_DPAD_RIGHT,
      this.pageToRight.bind(this)
    );
    vee.Controller.registerButtonAction([
      vee.KeyCode.BUTTON_B,
      vee.KeyCode.BUTTON_RIGHT_SHOULDER,
      vee.KeyCode.AXIS_RIGHT_TRIGGER
    ], this.hide.bind(this));

    var defaultGrid = this._defaultCursorGrid || cc.p(1, 0);
    vee.Controller.initSelector(9, 2, null, defaultGrid);

    if (game.Data.isFreeGame && this.btnBuyAll.isVisible()) {
      vee.Controller.registerItemByButton(
        this.btnBuyAll,
        cc.p(0, 0),
        this.onBuyAll.bind(this),
        "res/mfi_btn_on_210.png"
      );
      vee.Controller.registerItemByButton(
        this.btnRestore,
        cc.p(0, 1),
        this.onRestore.bind(this),
        "res/mfi_btn_on_170.png"
      );
    }

    this.createItem();
    vee.Controller.activeSelector();
  },

  pageToLeft: function () {
    var grid = vee.Controller.getSelectorGrid();
    cc.log("page To left ===x=%d  y=%d", grid.x, grid.y);
    this.pagingCtl.setPage(grid.x + 1, true);
  },

  pageToRight: function () {
    var grid = vee.Controller.getSelectorGrid();
    cc.log("page To Right ===x=%d  y=%d", grid.x, grid.y);
    this.pagingCtl.setPage(grid.x + 1, true);
  },

  createItem: function () {
    for (var page = 1; page < 9; page++) {
      var cell = this._getAvatarCellCtl(page * 2 - 1);
      var gridX = game.Data.isFreeGame ? page : page - 1;

      if (cell) {
        vee.Controller.registerItemByButton(
          cell.spBG,
          cc.p(gridX, 0),
          cell.onBuy.bind(cell),
          "res/mfi_avatar_on.png",
          cc.p(-4, 0)
        );
      }

      cell = this._getAvatarCellCtl(page * 2);
      if (cell) {
        vee.Controller.registerItemByButton(
          cell.spBG,
          cc.p(gridX, 1),
          cell.onBuy.bind(cell),
          "res/mfi_avatar_on.png",
          cc.p(-4, 0)
        );
      }
    }
  },

  _getAvatarCellCtl: function (index) {
    var node = this["avatarCell" + index];
    return node ? node.controller : null;
  },

  onExit: function () {
    LyAvatarStore.instance = null;
    LyAvatarStore.arrCell = [];
  },

  refreshBuyState: function () {
    if (game.Data.isWeiXin) {
      this.btnRestore.setVisible(false);
      this.lbRestore.setVisible(false);
    }

    if (game.Data.isFreeGame && vee.data.allcat) {
      this.btnBuyAll.setVisible(false);
      this.btnRestore.setVisible(false);
      this.lbPrice.setVisible(false);
      this.lbRestore.setVisible(false);
      this.ccbBuyAvatar.controller.refreshState();
    }
  },

  onKeyBack: function () {
    this.hide();
    return true;
  },

  refreshCoin: function () {
  },

  onClose: function () {
    this.hide();
  },

  show: function () {
    game.Data.curSceen = "lyAvatarStore";
    LyAvatarStore.isShow = true;
    cc.log("avatar show");

    this.pagingCtl.setEnabled(true);
    this.rootNode.setVisible(true);
    this.rootNode.setLocalZOrder(99999);
    this.playAnimate("show");
    vee.Audio.playEffect(res.outGame_menu_intoStore_mp3);
    this._tempControllerState = vee.Controller.cacheControllerState();
  },

  hide: function () {
    if (!LyAvatarStore.isShow) {
      return;
    }

    vee.Controller.deactiveSelector();
    vee.Controller.deactiveButton();

    if (vee.Controller._cursorGrid) {
      this._defaultCursorGrid = cc.p(
        vee.Controller._cursorGrid.x,
        vee.Controller._cursorGrid.y
      );
    }

    this.pagingCtl.setEnabled(false);
    this.playAnimate("hide", function () {
      LyAvatarStore.isShow = false;
      this.rootNode.setVisible(false);
      this.rootNode.setLocalZOrder(-1);
      vee.Controller.reviveControllerState(this._tempControllerState);
    }.bind(this));
    vee.Audio.playEffect(res.outGame_menu_closeStore_mp3);
  },

  onPageChanged: function () {
  },

  onBuyAll: function () {
    if (!this.btnBuyAll.isVisible()) {
      return;
    }

    if (vee.IAPMgr && typeof vee.IAPMgr.buyProduct === "function") {
      vee.IAPMgr.buyProduct(1, function () {
        game.AvatarData.allPurchase();
        this.refreshBuyState();
        cc.log("state : " + vee.Controller._isActiveSelector + " " + vee.Controller._isActiveButton);
        vee.Controller.activeButton();
        vee.Controller.activeSelector();
        vee.Utils.scheduleOnce(function () {
          vee.PopMgr.alert(
            vee.Utils.getLocalizedStringForKey("All avatar has been unlocked"),
            vee.Utils.getLocalizedStringForKey("SUCCESS")
          );
        }, 0.2);
        if (vee.Analytics && typeof vee.Analytics.logChargeSuccess === "function") {
          vee.Analytics.logChargeSuccess(game.Data.orderId);
        }
      }.bind(this), function () {});
    }

    game.Data.orderId = new Date().getTime();
    if (vee.Analytics && typeof vee.Analytics.logChargeRequest === "function") {
      vee.Analytics.logChargeRequest(game.Data.orderId, 1, 1.99);
    }
  },

  onRestore: function () {
    if (!this.btnRestore.isVisible()) {
      return;
    }

    if (!vee.IAPMgr || typeof vee.IAPMgr.restoreProduct !== "function") {
      return;
    }

    vee.IAPMgr.restoreProduct(function (productIds) {
      cc.log("pd id = " + productIds);
      var ids = productIds.split(",");

      for (var i in ids) {
        var id = ids[i];
        if (id === "com.veewo.allcat" || id === "com.veewo.allcat.cn") {
          game.AvatarData.allPurchase();
          this.refreshBuyState();
          vee.Controller.activeButton();
          vee.Controller.activeSelector();
          vee.Utils.scheduleOnce(function () {
            vee.PopMgr.alert(
              vee.Utils.getLocalizedStringForKey("All avatar has been unlocked"),
              vee.Utils.getLocalizedStringForKey("SUCCESS")
            );
          }, 0.2);
        }
      }
    }.bind(this));
  }
});

LyAvatarStore.instance = null;
LyAvatarStore.arrCell = [];
LyAvatarStore.isShow = false;

LyAvatarStore.getInstance = function () {
  return LyAvatarStore.instance;
};

LyAvatarStore.refreshState = function () {
  if (!LyAvatarStore.instance) {
    return;
  }

  for (var i in LyAvatarStore.arrCell) {
    var cell = LyAvatarStore.arrCell[i];
    if (cell) {
      cell.refreshCellState();
    }
  }
};

LyAvatarStore.load = function () {
  var layer = null;
  if (game.Data.isFreeGame) {
    layer = cc.BuilderReader.load(res.lyAvatarStore_android_ccbi);
  } else {
    layer = cc.BuilderReader.load(res.lyAvatarStore_ccbi);
  }
  return layer;
};

var BuyAvatar = vee.Class.extend({
  spText: null,

  onCreate: function () {
    this.refreshState();
  },

  refreshState: function () {
    if (vee.data.allcat) {
      this.spText.setVisible(false);
    }
  }
});
