var AlertMoreCoin;
var AlertFillEnergy;
var AlertUnlockCategory;
var AlertUsePower;
var AlertGetPower;
var AlertMoonLocked;
var AlertFacebook;
var AlertUnlockRoleByVideo;
var AlertParkourTip;
var VeeAlertSupport;
var VeeQuitBox = VeeQuitBox || {};

function __alertsSetPriceLabel(goodsKeyName, label) {
    var iapMgr = (typeof vee !== "undefined") ? vee.IAPMgr : null;
    if (!iapMgr || typeof iapMgr.setPriceLabByServer !== "function") {
        return;
    }

    var goodsKey = goodsKeyName;
    if (iapMgr.goodsKey && typeof iapMgr.goodsKey[goodsKeyName] !== "undefined") {
        goodsKey = iapMgr.goodsKey[goodsKeyName];
    }

    try {
        iapMgr.setPriceLabByServer(goodsKey, label);
    } catch (e) {
        cc.log("setPriceLabByServer skipped: " + goodsKeyName);
    }
}

function __alertsRestoreUnlockCategoryOutlets(controller) {
    if (controller && !controller.lbCase1Moon && controller.lbCase4) {
        controller.lbCase1Moon = controller.lbCase4;
    }
}

AlertMoreCoin = vee.Class.extend({
    _isOver: false,
    btnBuy: null,
    btnClose: null,

    onCreate: function () {
        this.playAnimate("show", function () {
            if (game.Data.oLyGame) {
                cc.director.pause();
            }
        }.bind(this));
        this.handleKey(true);
    },

    onKeyBack: function () {
        this.onClose();
        return true;
    },

    onBuy: function () {
        if (this._isOver) {
            return;
        }
    },

    onClose: function () {
        if (this._isOver) {
            return;
        }

        this._isOver = true;
        if (!game.Data.oPauseCtl) {
            cc.director.resume();
        }

        this.playAnimate("hide", function () {
            vee.PopMgr.closeLayerByCtl(this);
        }.bind(this));
    }
});

AlertMoreCoin.show = function () {
    vee.PopMgr.popCCB(res.warnCoin_ccbi, { alpha: 0 });
};

AlertFillEnergy = vee.Class.extend({
    _isOver: false,
    _videoAvailable: false,
    btnBuy: null,
    btnWatch: null,
    btnClose: null,

    onCreate: function () {
        this.handleKey(true);
    },

    ccbInit: function () {
        this._videoAvailable = vee.Ad.checkCacheVideoAd();

        if (game.Data.isWeiXin) {
            this.playAnimate("show", this.initController.bind(this));
            this.btnWatch.setBackgroundSpriteForState(
                new cc.Scale9Sprite(res.btn_power_2_watch_weixin_png),
                cc.CONTROL_STATE_NORMAL
            );
            return;
        }

        if (this._videoAvailable) {
            this.playAnimate("show", this.initController.bind(this));
        } else {
            this.btnWatch.setEnabled(false);
            this.playAnimate("show_buy_only", this.initController.bind(this));
        }
    },

    initController: function () {},

    onKeyBack: function () {
        this.onClose();
        return true;
    },

    onBuy: function () {
        vee.IAPMgr.buyProduct(2, function () {
            vee.PopMgr.closeLayerByCtl(this);
            game.Data.fillEnergy();
            vee.Analytics.UGameEvent.showAdEvent("alert", "video", "fillEnergy");
            game.Data.energyUnlimited(game.Data.energyUnlimitedTime);

            if (game.Data.oEnergyCtl) {
                game.Data.oEnergyCtl.showEnergy();
            }

            vee.Utils.scheduleOnce(function () {
                vee.PopMgr.alert(
                    vee.Utils.getLocalizedStringForKey("You`ve got MAX energy for 20 min!"),
                    vee.Utils.getLocalizedStringForKey("CONGRATULATION")
                );
            }, 0.2);
        }.bind(this));
    },

    onWatch: function () {
        vee.Ad.showVideoAd(function () {
            vee.PopMgr.closeLayerByCtl(this);
            game.Data.addEnergy(1);

            if (game.Data.oEnergyCtl) {
                game.Data.oEnergyCtl.showEnergy();
            }

            vee.Utils.scheduleOnce(function () {
                vee.PopMgr.alert(
                    vee.Utils.getLocalizedStringForKey("You`ve got an energy!"),
                    vee.Utils.getLocalizedStringForKey("CONGRATULATION")
                );
            }, 0.2);
        }.bind(this), "addEnergy");
    },

    onClose: function () {
        if (this._isOver) {
            return;
        }

        this._isOver = true;
        var endFunc = function () {
            vee.PopMgr.closeLayerByCtl(this);
        }.bind(this);

        if (this._videoAvailable) {
            this.playAnimate("hide", endFunc);
        } else {
            this.playAnimate("hide_buy_only", endFunc);
        }
    }
});

AlertFillEnergy.show = function () {
    var node = vee.PopMgr.popCCB(res.warnLife_ccbi, { alpha: 0 });
    node.controller.ccbInit();
};

AlertUnlockCategory = vee.Class.extend({
    _isOver: false,
    _tempControllerState: null,
    _anim: null,
    _idx: 0,
    lbCase1: null,
    lbCase2: null,
    lbCase3: null,
    lbCase4: null,
    lbTitle: null,
    lbLevel: null,
    spStar: null,
    labPrice: null,
    lbStarDesc: null,
    lbCase1Moon: null,
    btnOk: null,
    btnFree: null,
    btnVideo: null,
    btnBuy: null,
    btnClose: null,

    onCreate: function () {
        this.handleKey(true);
        this._tempControllerState = vee.Controller.cacheControllerState();
    },

    ccbInit: function (idx) {
        __alertsRestoreUnlockCategoryOutlets(this);
        this._anim = "";
        cc.log("idx ====", idx);
        this._idx = idx;
        this.lbLevel.setString(this._idx + "-" + game.LevelData.getCategory(this._idx - 1).levelCount);
        __alertsSetPriceLabel("UNLOCKLEVELS", this.labPrice);

        if (game.Data.isSelectingReverseWorld) {
            if (game.Data.version.newVersion) {
                this.lbLevel.setString(this._idx + "-1");
            }
            this._anim = "_moon";
            this.playAnimate("show" + this._anim);
            return;
        }

        var shouldUseSimpleLock =
            (!game.Data.version.isSetShowSpecialEvent && (this._idx === 7 || !game.Data.isFreeGame)) ||
            this._ccbName === res.warnLock_ccbi;

        if (shouldUseSimpleLock) {
            this._anim = "";
            this.playAnimate("show" + this._anim);
            return;
        }

        var levelState = game.LevelData.getCategory(0).getLevelDataController(2).getLevelState();
        if (levelState !== 2) {
            this._anim = "_ok";
        } else if (idx === 3) {
            this._anim = "_video";
        } else if (idx === 2) {
            this._anim = "_free";
        } else {
            this._anim = "_buy";
        }

        this.playAnimate("show" + this._anim);

        if (!vee.Ad.checkCacheVideoAd()) {
            this.btnVideo.setEnabled(false);
        }
    },

    initController: function () {
        vee.Controller.initSelector(1, 1, this.onClose.bind(this), cc.p(0, 0));

        if (this._idx < 7) {
            if (this._anim === "_video") {
                vee.Controller.registerItemByButton(this.btnVideo, cc.p(0, 0), this.onVideo.bind(this), "res/mfi_btn_on_170.png");
            } else if (this._anim === "_free") {
                vee.Controller.registerItemByButton(this.btnFree, cc.p(0, 0), this.onFree.bind(this), "res/mfi_btn_on_170.png");
            } else if (this._anim === "_buy") {
                vee.Controller.registerItemByButton(this.btnBuy, cc.p(0, 0), this.onBuy.bind(this), "res/mfi_btn_on_170.png");
            } else {
                vee.Controller.registerItemByButton(this.btnOk, cc.p(0, 0), this.onConfirm.bind(this), "res/mfi_btn_on_170.png");
            }
        } else {
            vee.Controller.registerItemByButton(this.btnOk, cc.p(0, 0), this.onConfirm.bind(this), "res/mfi_btn_on_170.png");
        }

        vee.Controller.activeSelector();
    },

    onKeyBack: function () {
        this.onClose();
        return true;
    },

    setStarDesc: function (text) {
        this.lbStarDesc.setString(text);

        if (!game.Data.isSelectingReverseWorld) {
            return;
        }

        var caseText = this.lbCase1.getString();
        cc.log("idx = " + this._idx);

        var category = game.LevelData.getCategory(this._idx - 1);
        var title = "";
        if (category) {
            title = category.title;
            cc.log("category title = " + title);
        }

        this.lbCase1.setString(
            vee.Utils.getLocalizedStringForKey(caseText) + " " + vee.Utils.getLocalizedStringForKey(title)
        );
        this.lbCase1Moon.setString(
            vee.Utils.getLocalizedStringForKey("You need to complete previous levels") + " " +
            vee.Utils.getLocalizedStringForKey(title)
        );
    },

    getLevelTimeStr: function (seconds) {
        var hour = Math.floor(seconds / 3600);
        var minute = Math.floor(seconds / 60 - hour * 60);
        if (minute < 10) {
            minute = "0" + minute;
        }
        if (hour < 10) {
            hour = "0" + hour;
        }
        return hour + ":" + minute;
    },

    onConfirm: function () {
        this.onClose();
    },

    onFree: function () {
        this.onClose();
        if (game.Data.oLvSelectCtl) {
            game.Data.oLvSelectCtl.unlockCategoryByIdx(this._idx, true);
        }
    },

    onVideo: function () {
        vee.Ad.showVideoAd(function () {
            this.onClose();
            if (game.Data.oLvSelectCtl) {
                game.Data.oLvSelectCtl.unlockCategoryByIdx(this._idx, true);
                vee.Analytics.UGameEvent.showAdEvent(
                    "unlockCategory",
                    "video",
                    "unlockCategory_" + this._idx
                );
            }
        }.bind(this), "unlockCategory");
    },

    onBuy: function () {
        cc.log("on buy click=======");
        vee.IAPMgr.buyProduct(0, function () {
            this.onClose();
            if (game.Data.oLvSelectCtl) {
                game.Data.oLvSelectCtl.unlockCategoryByIdx(this._idx, true);
            }
            vee.Analytics.logChargeSuccess(game.Data.orderId);
        }.bind(this), function () {
            return;
        }.bind(this));

        game.Data.orderId = new Date().getTime();
        vee.Analytics.logChargeRequest(game.Data.orderId, 0, 0.99);
    },

    onClose: function () {
        if (this._isOver) {
            return;
        }

        this._isOver = true;
        vee.Audio.playEffect(res.outGame_menu_leaveLocked_mp3);

        var animName = this._ccbName === res.warnLock_free_ccbi ? "hide" + this._anim : "hide";
        if (game.Data.isSelectingReverseWorld) {
            animName = "hide_moon";
        }

        this.playAnimate(animName, function () {
            vee.Controller.reviveControllerState(this._tempControllerState);
            vee.PopMgr.closeLayerByCtl(this);
        }.bind(this));
        vee.Controller.deactiveSelector();
    }
});

AlertUnlockCategory.show = function (starDesc, categoryIdx) {
    var ccbName;
    if (game.Data.isFreeGame) {
        ccbName = res.warnLock_free_ccbi;
    } else {
        ccbName = categoryIdx > 5 ? res.warnLock_free_ccbi : res.warnLock_ccbi;
    }

    var node = vee.PopMgr.popCCB(ccbName, { alpha: 0 });
    node.controller._ccbName = ccbName;
    node.controller.ccbInit(categoryIdx + 1);
    node.controller.setStarDesc(starDesc);
};

AlertUsePower = vee.Class.extend({
    ccbUIEnergy: null,
    emptyType: 0,
    btnUse: null,
    btnClose: null,
    _isOver: false,

    onCreate: function () {
        this.playAnimate("show");
        this.ccbUIEnergy.setVisible(false);
        this.handleKey(true);
        vee.Controller.cacheControllerState(this);
    },

    onKeyBack: function () {
        this.onClose();
        return true;
    },

    initController: function () {
        vee.Controller.initSelector(1, 1, this.onClose.bind(this), cc.p(0, 0));
        vee.Controller.registerItemByButton(this.btnUse, cc.p(0, 0), this.onUse.bind(this), "res/mfi_btn_on_170.png");
        vee.Controller.activeSelector();
    },

    setEmptyType: function (emptyType) {
        this.emptyType = emptyType;
    },

    onUse: function () {
        this.onClose();
        game.Data.fillEnergy();
        game.Data.energyUnlimited(game.Data.energyUnlimitedTime);
        vee.dataManager.setPower(vee.dataManager.getPower() - 1);
        vee.dataManager.setPowerTs(vee.Utils.getTimeNow());

        switch (this.emptyType) {
        case game.LifeEmptyType.Select:
            if (game.Data.oEnergyCtl) {
                game.Data.oEnergyCtl.usePower();
            }
            break;

        case game.LifeEmptyType.Lose:
            if (game.Data.oLyGameOver) {
                this.playAnimate("showPower", function () {
                    game.Data.oLyGameOver.loseRetry();
                });
                this.showUsePower();
            }
            break;
        }
    },

    showUsePower: function () {
        vee.Utils.scheduleOnce(function () {
            this.ccbUIEnergy.setVisible(true);
            this.ccbUIEnergy.controller.playAnimate("usePower");
        }.bind(this), 1);
    },

    onClose: function () {
        if (this._isOver) {
            return;
        }

        this._isOver = true;
        vee.Controller.deactiveSelector();
        this.playAnimate("hide", function () {
            vee.Controller.reviveControllerStateByCtl(this);
            vee.PopMgr.closeLayerByCtl(this);
        }.bind(this));
    }
});

AlertUsePower.show = function (emptyType) {
    var node = vee.PopMgr.popCCB(res.warnUsePower_ccbi, { alpha: 0 });
    node.controller.setEmptyType(emptyType);
};

AlertGetPower = vee.Class.extend({
    btnBuy: null,
    btnWatch: null,
    lbWatch: null,
    emptyType: 0,
    labPrice: null,
    btnClose: null,
    _isOver: false,

    onCreate: function () {
        if (!vee.Ad.checkCacheVideoAd() || parseInt(vee.dataManager.getEnergy()) === 5) {
            this.btnWatch.setEnabled(false);
        }

        if (game.Data.isWeiXin) {
            this.btnWatch.setEnabled(true);
            this.btnWatch.setBackgroundSpriteForState(
                new cc.Scale9Sprite(res.btn_power_2_watch_weixin_png),
                cc.CONTROL_STATE_NORMAL
            );
            this.lbWatch.setString("购买获得一点生命");
        }

        this.playAnimate("show");
        this.handleKey(true);
        vee.Controller.cacheControllerState(this);
        __alertsSetPriceLabel("POWER", this.labPrice);
    },

    onKeyBack: function () {
        this.onClose();
        return true;
    },

    initController: function () {
        vee.Controller.initSelector(2, 1, this.onClose.bind(this), cc.p(0, 0));
        vee.Controller.registerItemByButton(this.btnBuy, cc.p(0, 0), this.onBuy.bind(this), "res/mfi_btn_on_170.png");
        vee.Controller.registerItemByButton(this.btnWatch, cc.p(1, 0), this.onWatch.bind(this), "res/mfi_btn_on_170.png");
        vee.Controller.activeSelector();
    },

    setEmptyType: function (emptyType) {
        this.emptyType = emptyType;
    },

    onBuy: function () {
        vee.IAPMgr.buyProduct(2, function () {
            this.onClose();
            vee.dataManager.setPower(vee.dataManager.getPower() + 3);
            if (game.Data.oEnergyCtl) {
                game.Data.oEnergyCtl.showEnergy();
            }
            vee.Analytics.logChargeSuccess(game.Data.orderId);
            AlertUsePower.show(this.emptyType);
        }.bind(this), function () {
            return;
        }.bind(this));

        game.Data.orderId = new Date().getTime();
        vee.Analytics.logChargeRequest(game.Data.orderId, 2, 0.99);
    },

    onWatch: function () {
        if (!this.btnWatch.isEnabled()) {
            return;
        }

        var successCallback = function () {
            vee.PopMgr.closeLayerByCtl(this);
            vee.Analytics.UGameEvent.showAdEvent("alert", "video", "getPower");
            game.Data.addEnergy(1);

            if (game.Data.oEnergyCtl) {
                game.Data.oEnergyCtl.showEnergy();
            }

            vee.Utils.scheduleOnce(function () {
                vee.PopMgr.alert(
                    vee.Utils.getLocalizedStringForKey("You`ve got an energy!"),
                    vee.Utils.getLocalizedStringForKey("CONGRATULATION")
                );
            }, 0.2);
        }.bind(this);

        if (game.Data.isWeiXin) {
            vee.IAPMgr.buyProduct(3, successCallback);
        } else {
            vee.Ad.showVideoAd(successCallback, "getPower");
        }
    },

    onClose: function () {
        if (this._isOver) {
            return;
        }

        this._isOver = true;
        vee.Controller.deactiveSelector();
        vee.Controller.reviveControllerStateByCtl(this);
        this.playAnimate("hide", function () {
            vee.PopMgr.closeLayerByCtl(this);
        }.bind(this));
    }
});

AlertGetPower.show = function (emptyType) {
    var node = vee.PopMgr.popCCB(res.warnGetPower_ccbi, { alpha: 0 });
    node.controller.setEmptyType(emptyType);
};

VeeQuitBox.show = function (callback) {
    if (VeeQuitBox.hasShow) {
        return;
    }

    if (vee.Promo.isActivated && vee.data.adEnabled) {
        cc.log("zq debug veequit box 11111111");
        vee.PopMgr.popCCB("vQuit.ccbi", true);
        return;
    }

    cc.log("zq debug veequit box 22222222");
    vee.PopMgr.alert(
        vee.Utils.getLocalizedStringForKey("Do you want to leave the game? (Your game progress will not be saved.)"),
        vee.Utils.getLocalizedStringForKey("QUIT"),
        function () {
            app.closeGame();
            vee.Director.end();
            app.closeGame();
        },
        function () {
            if (callback) {
                callback();
            }
        }
    );
    cc.log("zq debug veequit box 33333333");
};

AlertMoonLocked = vee.Class.extend({
    btnBuy: null,
    btnClose: null,
    _isOver: false,
    _levelIdx: null,
    _tempControllerState: null,
    isSpacial: false,

    ccbInit: function (levelIdx, needCheckPass) {
        this.handleKey(true);
        this._tempControllerState = vee.Controller.cacheControllerState();
        this._levelIdx = levelIdx;
        this.playAnimate("show");
        this.isSpacial = false;

        if (needCheckPass && !this.checkIsPass()) {
            this.isSpacial = true;
            var selectedCategory = game.LevelData.selectedCategory;
            var category = game.LevelData.getCategory(selectedCategory.idx - 100);
            this.lbCase2.setString(
                vee.Utils.getLocalizedStringForKey("Play the corresponding") + " " +
                vee.Utils.getLocalizedStringForKey(category.title) + " " +
                (category.idx + 1) + "-" + (levelIdx + 1) + "\n" +
                vee.Utils.getLocalizedStringForKey("find the Moon Key to UNLOCK!")
            );
        }
    },

    initController: function () {
        vee.Controller.initSelector(1, 1, this.onClose.bind(this), cc.p(0, 0));
        vee.Controller.registerItemByButton(this.btnBuy, cc.p(0, 0), this.onBuy.bind(this), "res/mfi_btn_on_170.png");
        vee.Controller.activeSelector();
    },

    checkIsPass: function () {
        cc.log("check is pass");
        var selectedCategory = game.LevelData.selectedCategory;
        var idx = selectedCategory.idx - 100;
        var category = game.LevelData.getCategory(idx);
        return category.getLevelDataController(this._levelIdx).levelData.isLevelPassed;
    },

    onKeyBack: function () {
        this.onClose();
        return true;
    },

    onBuy: function () {
        cc.log("unlock moon level-------------");
        if (this.isSpacial) {
            this.onClose();
            return;
        }

        var selectedCategory = game.LevelData.selectedCategory;
        var idx = selectedCategory.idx - 100;
        game.LevelData.selectedCategory = game.LevelData.getCategory(idx);
        game.LevelData.selectedLevel = game.LevelData.selectedCategory.getLevelDataController(this._levelIdx);
        game.Logic.startGame(game.LevelData.levelMap[game.LevelData.selectedLevel.getLevelNo() - 1]);
        vee.Controller.deactiveButton();
        vee.Controller.deactiveSelector();
    },

    onClose: function () {
        if (this._isOver) {
            return;
        }

        this._isOver = true;
        this.playAnimate("hide", function () {
            vee.Controller.reviveControllerState(this._tempControllerState);
            vee.PopMgr.closeLayerByCtl(this);
        }.bind(this));
        vee.Controller.deactiveSelector();
    }
});

AlertMoonLocked.show = function (levelIdx, needCheckPass) {
    var node = vee.PopMgr.popCCB(res.warnMoon_Lock_ccbi, true);
    node.controller.ccbInit(levelIdx, needCheckPass);
};

AlertFacebook = vee.Class.extend({
    btnFaceBook: null,

    ccbInit: function () {
        this.handleKey(true);
        this.playAnimate("show");
        this.initController();
    },

    initController: function () {
        vee.Controller.cacheControllerState(this);
        vee.Controller.clearAllButtonAction();
        vee.Controller.initSelector(1, 1, this.onClose.bind(this), cc.p(0, 0));
        vee.Controller.registerItemByButton(this.btnFaceBook, cc.p(0, 0), this.onClick.bind(this), "res/mfi_btn_on_170.png");
        vee.Controller.activeSelector();
    },

    onClick: function () {
        this.onClose();
        game.AvatarData.unlockMidAutRole();
        game.AvatarData.avatarSelected(12);
        vee.Controller.reviveControllerStateByCtl(this);
        LyUnlock.show(12);
    },

    onClose: function () {
        if (this._isOver) {
            return;
        }

        this._isOver = true;
        this.playAnimate("hide", function () {
            vee.PopMgr.closeLayerByCtl(this);
            vee.Controller.reviveControllerStateByCtl(this);
        }.bind(this));
    },

    onKeyBack: function () {
        this.onClose();
    }
});

AlertFacebook.show = function () {
    var node = vee.PopMgr.popCCB(res.lyNewAvatar_ccbi, true);
    node.controller.ccbInit();
};

AlertUnlockRoleByVideo = vee.Class.extend({
    ccbAvatar: null,
    avatarId: null,
    btnFaceBook: null,

    ccbInit: function (avatarId) {
        this.handleKey(true);
        var avatarData = game.AvatarData.getAvatarData(avatarId);
        this.avatarId = avatarId;
        this.ccbAvatar.setTexture(avatarData.picName);
        this.playAnimate("show");

        if (!vee.Ad.checkCacheVideoAd()) {
            this.btnFaceBook.setEnabled(false);
        }
    },

    onClick: function () {
        if (vee.Ad.checkCacheVideoAd()) {
            this.onClose();
            game.AvatarData.unlockVideoRoleByAvatarId(this.avatarId);
        } else {
            cc.log("js = ad video is not ready");
        }
    },

    onClose: function () {
        if (this._isOver) {
            return;
        }

        this._isOver = true;
        this.playAnimate("hide", function () {
            vee.PopMgr.closeLayerByCtl(this);
        }.bind(this));
    },

    onKeyBack: function () {
        this.onClose();
    }
});

AlertUnlockRoleByVideo.show = function (avatarId) {
    var node = vee.PopMgr.popCCB(res.lyUnlockVideoRole_ccbi, true);
    node.controller.ccbInit(avatarId);
};

AlertParkourTip = vee.Class.extend({
    alertCallback: null,
    parentNode: null,

    ccbInit: function (callback) {
        this.handleKey(true);
        this.alertCallback = callback;
        this.playAnimate("show_moon");

        var listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onGestureBegin
        });
        cc.eventManager.addListener(listener, this.parentNode);

        vee.Controller.cacheControllerState(this);
        vee.Controller.clearAllButtonAction();
        vee.Controller.registerButtonAction(
            [vee.KeyCode.BUTTON_B, vee.KeyCode.BUTTON_A],
            this.onClose.bind(this)
        );
        vee.Controller.activeButton();
    },

    onGestureBegin: function (touch, event) {
        var target = event.getCurrentTarget();
        cc.log("zq debug ==============onGestureBegin");
        target.controller.onClick();
        return true;
    },

    onClick: function () {
        this.onClose();
    },

    onClose: function () {
        if (this._isOver) {
            return;
        }

        this._isOver = true;
        vee.Controller.reviveControllerStateByCtl(this);
        this.alertCallback();
        this.playAnimate("hide_moon", function () {
            vee.PopMgr.closeLayerByCtl(this);
        }.bind(this));
    },

    onKeyBack: function () {
        this.onClose();
    },

    setNode: function (node) {
        this.parentNode = node;
    }
});

AlertParkourTip.show = function (callback) {
    var node = vee.PopMgr.popCCB(res.warnParkourTip_ccbi, false);
    node.controller.setNode(node);
    node.controller.ccbInit(callback);
};

VeeAlertSupport = vee.Class.extend({
    ccbInit: function () {
        this.handleKey(true);
        vee.dataManager.setIsFirstClickCategory9(false);
        this.playAnimate("show");
    },

    onConfirm: function () {
        vee.Analytics.logEvent("ThanksgivingLevelClick");
        this.onClose();
        vee.Ad.showVideoAd(function () {
            vee.Analytics.UGameEvent.showAdEvent("support_parkourLv", "video", "");
        }, "support_parkourLv");
    },

    onClose: function () {
        if (this._isOver) {
            return;
        }

        this._isOver = true;
        this.playAnimate("hide", function () {
            vee.PopMgr.closeLayerByCtl(this);
        }.bind(this));
    },

    onKeyBack: function () {
        this.onClose();
    }
});

VeeAlertSupport.show = function () {
    var node = vee.PopMgr.popCCB(res.vAlertboxSupport_ccbi);
    node.controller.ccbInit();
};
