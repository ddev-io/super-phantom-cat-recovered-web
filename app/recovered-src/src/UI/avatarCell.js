// Source-like reconstruction from UI/avatarCell.dis

var AvatarCell = vee.Class.extend({
  lbPrice: null,
  lbTitle: null,
  lbDesc: null,
  btnBuy: null,
  lyAvatar: null,
  lyContent: null,
  spAvatar: null,
  nodeProgress: null,
  spBG: null,
  avatarData: null,
  idx: 0,
  isStart: false,
  clickTimes: 0,

  onCreate: function () {
    if (this.rootNode.getTag() === 1) {
      this.init();
    }
  },

  init: function (tag) {
    if (typeof tag === "number" && this.rootNode && this.rootNode.setTag) {
      this.rootNode.setTag(tag);
    }

    var nodeTag = this.rootNode && this.rootNode.getTag ? this.rootNode.getTag() : 0;
    if (!nodeTag || nodeTag < 1) {
      nodeTag = (typeof tag === "number" && tag > 0) ? tag : (this.idx + 1);
      if (!nodeTag || nodeTag < 1) {
        nodeTag = 1;
      }
      if (this.rootNode && this.rootNode.setTag) {
        this.rootNode.setTag(nodeTag);
      }
    }

    this.idx = nodeTag - 1;
    LyAvatarStore.arrCell[this.idx] = this;

    var data = game.AvatarData.getAvatarData(this.idx);
    if (!data) {
      return;
    }
    this.avatarData = data;
    this.spAvatar.setTexture(data.picName);
    if (this.btnBuy && typeof this.btnBuy.setControlSwallowTouches === "function") {
      this.btnBuy.setControlSwallowTouches(false);
    }
    this.resetState();
    this.lbPrice.setString(this.avatarData.priceDesc);

    var descIndex = (game.Data.isAndroid && data.idx === 4) ? 10 : data.idx;
    this.lbTitle.setString(game.AvatarData.getAvatarName(descIndex));
    this.lbDesc.setString(game.AvatarData.getAvatarDesc(descIndex));
  },

  resetState: function () {
    if (this.avatarData.owned) {
      if (this.avatarData.idx === game.AvatarData.getCurrentAvatar().idx) {
        this.playAnimate("selected");
        AvatarCell.selectedCell = this;
      } else {
        this.playAnimate("owned");
      }
      return;
    }

    if (this.avatarData.iapIndex !== -1) {
      this.playAnimate("iap");
      return;
    }

    if (this._isMidAutumnFacebookAvatar()) {
      this.playAnimate("facebook");
      return;
    }

    if (this._isSpecialVideoAvatar()) {
      this.playAnimate("video");
      return;
    }

    if (game.Data.isUnlocking()) {
      var nextAvatar = game.AvatarData.getNextAvatar();
      if (nextAvatar && nextAvatar.idx === this.idx) {
        this.playAnimate("unlocking");
        this.nodeProgress.setScaleX(game.LevelData.getCoin() / nextAvatar.price);
      } else {
        this.playAnimate("lock");
      }
      return;
    }

    this.playAnimate("lock");
  },

  refreshCellState: function () {
    this.avatarData = game.AvatarData.getAvatarData(this.idx);
    this.resetState();
  },

  select: function () {
    game.AvatarData.avatarSelected(this.idx);
    if (AvatarCell.selectedCell && AvatarCell.selectedCell !== this) {
      AvatarCell.selectedCell.disSelect();
    }
    AvatarCell.selectedCell = this;
    this.playAnimate("selected");
    vee.Audio.playEffect(res.outGame_menu_changeAvator_mp3);
  },

  disSelect: function () {
    this.playAnimate("owned");
  },

  onBuy: function () {
    if (!this.avatarData) {
      var nodeTag = this.rootNode && this.rootNode.getTag ? this.rootNode.getTag() : 0;
      this.init(nodeTag && nodeTag > 0 ? nodeTag : (this.idx + 1));
    }
    if (!this.avatarData) {
      return;
    }

    if (vee.Analytics && typeof vee.Analytics.logEvent === "function") {
      vee.Analytics.logEvent("Role_click_" + this.avatarData.type);
    }

    if (this.avatarData.owned || game.Data.isAllLevelOpen) {
      this.select();
    } else if (this.avatarData.iapIndex !== -1) {
      if (vee.IAPMgr && typeof vee.IAPMgr.buyProduct === "function") {
        vee.IAPMgr.buyProduct(
          this.avatarData.iapIndex,
          function () {
            game.AvatarData.avatarPurchased(this.avatarData.iapIndex);
            this.playAnimate("owned");
          }.bind(this),
          function () {}
        );
      }
    } else if (this._isMidAutumnFacebookAvatar()) {
      AlertFacebook.show();
    } else if (this._isSpecialEventAvatar(14)) {
      AlertUnlockRoleByVideo.show(13);
    } else if (this._isSpecialEventAvatar(15)) {
      AlertUnlockRoleByVideo.show(14);
    }

    if (this.avatarData.owned) {
      return;
    }

    if (this.isStart) {
      this.clickTimes = +this.clickTimes + 1;
      if (this.clickTimes > 30) {
        this.avatarData.owned = true;
      }
    } else if (this.avatarData.type === game.Roles.MaNtIs) {
      this.isStart = true;
      this.clickTimes = +this.clickTimes + 1;
      vee.Utils.scheduleOnce(function () {
        this.isStart = false;
        this.clickTimes = 0;
      }.bind(this), 5);
    }
  },

  _isMidAutumnFacebookAvatar: function () {
    return game.Data.version.curVersion !== VERSION.TVOS_GENUINE &&
      game.Data.version.isMidAutumn &&
      this.avatarData.idx === 13;
  },

  _isSpecialEventAvatar: function (idx) {
    return game.Data.version.curVersion !== VERSION.TVOS_GENUINE &&
      !game.Data.isFreeGame &&
      game.Data.version.isSetShowSpecialEvent &&
      this.avatarData.idx === idx;
  },

  _isSpecialVideoAvatar: function () {
    return this._isSpecialEventAvatar(14) || this._isSpecialEventAvatar(15);
  }
});

AvatarCell.selectedCell = null;
