// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/common/popMgr.dis
var vee = vee || {};
vee.PopMgr = {
  layers: [],
  rootNode: null,
  scheduler: null,
  _root: null,
  currentScene: null,
  winSize: {
    width: 640,
    height: 960
  },
  originOffset: {
    x: 0,
    y: 0
  },
  centerPoint: {
    x: 320,
    y: 480
  },
  defalutMaskAlpha: 150,
  PositionType: {
    Top: {
      x: 0.5,
      y: 1
    },
    TopLeft: {
      x: 0,
      y: 1
    },
    TopRight: {
      x: 1,
      y: 1
    },
    Center: {
      x: 0.5,
      y: 0.5
    },
    Left: {
      x: 0,
      y: 0.5
    },
    Right: {
      x: 1,
      y: 0.5
    },
    Bottom: {
      x: 0.5,
      y: 0
    },
    BottomLeft: {
      x: 0,
      y: 0
    },
    BottomRight: {
      x: 1,
      y: 0
    }
  },
  getLastLayer: function () {
    var local0 = this.layers.length;
    return local0 ? this.layers[this.layers.length - 1] : null;
  },
  popCCB: function (arg0, arg1, arg2, arg3, arg4) {
    var local0 = cc.BuilderReader.load(arg0, arg2);
    var local1 = this.popLayer(local0, arg1, null, arg3, arg4);
    if (!arg2 && local0.controller && _.isFunction(local0.controller.onLoaded)) {
      local0.controller.onLoaded();
    }
    return local1;
  },
  popLayer: function (arg0, arg1, arg2, arg3, arg4) {
    var local0 = arg0.getContentSize();
    var local1 = arg2 ? arg2.getContentSize() : this.winSize;
    arg2 = arg2 ? arg2 : this.rootNode;
    arg0.setPosition((local1.width - local0.width) / 2, (local1.height - local0.height) / 2);
    var local2 = arg3 ? arg3 : this.PositionType.Center;
    if (arg3) {
      this.resetLayer(arg0, arg3, arg4, true);
    }
    if (arg1) {
      var local3 = cc.LayerColor.create(cc.color(0, 0, 0, 0), this.winSize.width, this.winSize.height);
      cc.eventManager.addListener({
        event: cc.EventListener.TOUCH_ONE_BY_ONE,
        swallowTouches: true,
        onTouchBegan: function () {
          return true;
        },
      }, local3);
      local3.addChild(arg0);
      local3.controller = arg0.controller;
      if (arg0.controller) {
        arg0.controller.lyMask = local3;
      }
      local3.setOpacity(0);
      if (this.defalutMaskAlpha > 0 && arg1.alpha !== 0) {
        local3.runAction(cc.FadeTo.create(0.1, arg1.alpha ? arg1.alpha : this.defalutMaskAlpha));
      }
      arg0 = local3;
    }
    this.layers.push(arg0);
    arg2.addChild(arg0);
    return arg0;
  },
  resetLayer: function (arg0, arg1, arg2, arg3) {
    if (arg3 === undefined) {
      arg3 = true;
    }
    var local0 = arg0.getParent() || this.rootNode;
    var local1 = arg0.getContentSize();
    var local2 = arg0.getAnchorPoint();
    var local3 = local0.getContentSize();
    var local4 = local0.convertToWorldSpace(cc.p(0, 0));
    if (arg3) {
      local4 = cc.pSub(local4, this.originOffset);
    }
    var local5 = arg1 ? arg1 : this.PositionType.Center;
    var local6 = cc.p((local2.x - local5.x) * local1.width, (local2.y - local5.y) * local1.height);
    var local7 = cc.p(this.winSize.width * local5.x, this.winSize.height * local5.y);
    local7 = vee.Utils.pSub(local7, local4);
    local7 = vee.Utils.pAdd(local7, local6);
    arg2 = arg2 || { x: 0, y: 0 };
    local7 = vee.Utils.pAdd(local7, arg2);
    arg0.setPosition(local7);
  },
  setNodePos: function (arg0, arg1, arg2) {
    var local0 = cc.p(this.winSize.width, this.winSize.height);
    var local1 = arg1 ? arg1 : this.PositionType.Center;
    var local2 = vee.Utils.pMult(local1, local0);
    if (arg2) {
      local2 = vee.Utils.pAdd(local2, arg2);
    }
    var local3 = arg0.getParent().convertToNodeSpace(local2);
    var local4 = arg0.getAnchorPoint();
    var local5 = arg0.getContentSize();
    var local6 = cc.p((local4.x - local1.x) * local5.width, (local4.y - local1.y) * local5.height);
    arg0.setPosition(vee.Utils.pAdd(local3, local6));
  },
  closeLayer: function (arg0) {
    cc.log("zq debug close layer==========count====%d", arg0);
    arg0 = arg0 || 1;
    arg0 = Math.min(arg0, this.layers.length);
    while (arg0) {
      arg0--;
      var local0 = this.layers.pop();
      if (local0 == null) {
        return;
      }
      var local1 = local0.controller;
      if (local1 && _.isFunction(local1.onClosed)) {
        local1.onClosed();
      }
      if (local0 === this.loading) {
        this.loading = null;
      }
      local0.removeFromParent();
    }
  },
  closeLayerByCtl: function (arg0) {
    var local0 = this.layers.slice();
    for (var local1 = 0; local1 < local0.length; local1++) {
      var local2 = local0[local1];
      if (local2.controller === arg0) {
        var local3 = this.layers.indexOf(local2);
        if (local3 >= 0) {
          this.layers.splice(local3, 1);
        }
        if (arg0 && _.isFunction(arg0.onClosed)) {
          arg0.onClosed.call(arg0);
        }
        if (local2 === this.loading) {
          this.loading = null;
        }
        local2.removeFromParent();
      }
    }
  },
  closeAll: function () {
    this.scheduler.removeAllChildren();
    this.closeLayer(999);
  },
  resetScene: function (arg0, arg1) {
    if (this.currentScene) {
      this.currentScene.removeAllChildren();
    }
    this.layers = [];
    vee.Director = cc.director;
    var local0 = arg0 ? arg0 : cc.size(768, 1136);
    this.winSize = vee.Director.getWinSize();
    this.originOffset = cc.p((local0.width - this.winSize.width) / 2, (local0.height - this.winSize.height) / 2);
    this.centerPoint = cc.p(this.winSize.width / 2, this.winSize.height / 2);
    var local1 = arg1 ? cc.Scene.createWithPhysics() : cc.Scene.create();
    var local2 = cc.Node.create();
    var local3 = cc.LayerColor.create(cc.color(0, 0, 0, 150), this.winSize.width, this.winSize.height);
    var local4 = cc.Node.create();
    local3.addChild(local4);
    local2.addChild(local3);
    local1.addChild(local2);
    this.rootNode = local3;
    this.scheduler = local4;
    this._root = local2;
    vee.Director.runScene(local1);
    this.currentScene = local1;
  },
  changeScene: function (arg0, arg1) {
    this.layer = [];
    this.layers = [];
    this.loading = null;
    this.scheduler.removeAllChildren();
    var local0 = cc.Scene.create();
    var local1 = cc.Node.create();
    var local2 = cc.LayerColor.create(cc.color(0, 0, 0, 150), this.winSize.width, this.winSize.height);
    var local3 = cc.Node.create();
    local2.addChild(local3);
    local1.addChild(local2);
    local0.addChild(local1);
    this.rootNode = local2;
    this.scheduler = local3;
    this._root = local1;
    this.popCCB(arg0);
    if (arg1) {
      local0 = arg1(undefined, local0);
    }
    vee.Director.replaceScene(local0);
    this.currentScene = local0;
  },
  autoGarbageCollect: function (arg0) {
    if (!arg0) {
      arg0 = 5;
    }
    cc.sys.garbageCollect();
    if (!this.currentScene) {
      return;
    }
    vee.Utils.unscheduleAllCallbacksForTarget(this.currentScene);
    vee.Utils.scheduleCallbackForTarget(this.currentScene, cc.sys.garbageCollect, arg0);
  },
  stopGarbageCollect: function () {
    if (!this.currentScene) {
      return;
    }
    vee.Utils.unscheduleAllCallbacksForTarget(this.currentScene);
  },
  pause: function (arg0) {
    var local0 = arg0 ? arg0 : this._root;
    if (!local0) {
      return;
    }
    this._pauseNode(local0, true);
  },
  _pauseNode: function (arg0, arg1) {
    arg0.pause();
    if (arg1) {
      var local0 = arg0.getChildren();
      for (var local1 in local0) {
        this._pauseNode(local0[local1], true);
      }
    } else {
      arg0.pause();
    }
  },
  resume: function () {
    if (!this._root) {
      return;
    }
    this._resumeNode(this._root, false);
    this._resumeNode(this.scheduler, true);
    this._root.scheduleOnce(function () {
      this._resumeNode(this.rootNode, true);
    }.bind(this), 0.2);
  },
  _resumeNode: function (arg0, arg1) {
    arg0.resume();
    if (arg1) {
      var local0 = arg0.getChildren();
      for (var local1 in local0) {
        this._resumeNode(local0[local1], true);
      }
    }
  },
  alert: function (arg0, arg1, arg2, arg3, arg4) {
    if (!VeeAlertbox.shared) {
      vee.PopMgr.popCCB("res/vAlertbox.ccbi", true);
    }
    var local0 = VeeAlertbox.shared;
    local0.setContent(arg0, arg1);
    local0.setBtnText(arg4);
    local0.setConfirmCallback(arg2);
    if (arg2 && arg3 == undefined) {
      local0.setCloseEnabled(true);
    } else {
      local0.setCloseEnabled(arg2 && arg3 === false ? false : true);
      if (arg3) {
        local0.setCloseCallback(arg3);
      }
    }
    return local0;
  },
  popLoading: function (arg0) {
    if (this.loading) {
      return;
    }
    this.loading = this.popCCB("res/vLoading.ccbi", true);
    if (arg0) {
      this.loading.controller.setCloseCallback(arg0);
    }
  },
  removeLoading: function () {
    if (this.loading) {
      cc.log("zq debug removeLoading============");
      for (var local0 in this.layers) {
        var local1 = this.layers[local0];
        if (local1 === this.loading) {
          this.layers.splice(local0, 1);
          break;
        }
      }
      this.loading.removeFromParent();
      this.loading = null;
    }
  },
  setIsNotShowLyMask: function (arg0) {
    this.isNotShowLyMask = arg0;
  },
  popNetLoading: function () {
    this.popLoading();
  }
};
var VeeAlertbox = vee.Class.extend({
  _onConfirmCallback: null,
  _onCloseCallback: null,
  _autoClose: true,
  _tempControllerState: null,
  _closed: false,
  btnConfirm: null,
  onCreate: function () {
  },
  onExit: function () {
    VeeAlertbox.shared = null;
  },
  onLoaded: function () {
    this._autoClose = true;
    VeeAlertbox.shared = this;
    this.handleKey(true);
    this._tempControllerState = vee.Controller.cacheControllerState();
    vee.Controller.deactiveButton();
    vee.Controller.deactiveSelector(true);
    vee.Controller.initSelector(1, 1, this.onClose.bind(this), cc.p(0, 0));
    vee.Controller.registerItemByButton(this.btnConfirm, cc.p(0, 0), this.onConfirm.bind(this), "res/mfi_btn_on_170.png");
    this.onConfirm = this.onClose;
    this._onClose = this.onClose;
    this.setCloseEnabled(false);
    this.playAnimate("show", function () {
      cc.log("show");
      vee.Controller.activeSelector();
    }.bind(this));
  },
  setAutoClose: function (arg0) {
    this._autoClose = arg0;
  },
  onConfirm: function () {
    if (this._closed) {
      return;
    }
    this._closed = true;
    cc.log("confirm");
    VeeAlertbox.shared = null;
    this.playAnimate("hide", function () {
      vee.Controller.reviveControllerState(this._tempControllerState);
      if (this._autoClose) {
        vee.PopMgr.closeLayer();
      }
      if (this._onConfirmCallback) {
        this._onConfirmCallback(this);
      }
    }.bind(this));
  },
  onClose: function () {
    if (this._closed) {
      return;
    }
    this._closed = true;
    cc.log("close");
    VeeAlertbox.shared = null;
    this.playAnimate("hide", function () {
      vee.Controller.reviveControllerState(this._tempControllerState);
      if (this._autoClose) {
        vee.PopMgr.closeLayer();
      }
      if (_.isFunction(this._onCloseCallback)) {
        this._onCloseCallback(this);
      }
    }.bind(this));
  },
  onKeyBack: function () {
    this.onClose();
    return true;
  },
  setCloseEnabled: function (arg0) {
    this.btnClose.setVisible(arg0);
    this.btnClose.setEnabled(arg0);
  },
  setContent: function (arg0, arg1) {
    if (!arg0) {
      arg0 = "";
    }
    if (!arg1) {
      arg1 = "";
    }
    this.lbContent.setString(arg0);
    this.lbContent.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    this.lbContent.setVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
    this.lbTitle.setString(arg1);
  },
  setBtnText: function (arg0) {
    if (arg0) {
      this.btnConfirm.setTitleForState(arg0, cc.CONTROL_STATE_NORMAL);
      this.btnConfirm.setTitleForState(arg0, cc.CONTROL_STATE_DISABLED);
    }
  },
  setConfirmCallback: function (arg0) {
    this._onConfirmCallback = arg0;
  },
  setCloseCallback: function (arg0) {
    this._onCloseCallback = arg0;
  }
});
VeeAlertbox.shared = null;
var VeeLoading = vee.Class.extend({
  _closeCallback: null,
  btnClose: null,
  onLoaded: function () {
    this.handleKey(true);
    if (this.btnClose) {
      this.btnClose.setVisible(false);
      vee.PopMgr.resetLayer(this.btnClose, vee.PopMgr.PositionType.TopRight, cc.p(-100, -100));
    }
    vee.Controller.tempDisable();
  },
  setMaskVisible: function (arg0) {
    if (this.lyMask) {
      this.lyMask.setVisible(arg0);
    }
  },
  setCloseCallback: function (arg0) {
    this._closeCallback = arg0;
    if (this.btnClose) {
      this.btnClose.setVisible(true);
    }
  },
  onClose: function () {
  },
  onExit: function () {
    vee.Controller.tempRevive();
    vee.PopMgr.closeLayerByCtl(this);
    if (_.isFunction(this._closeCallback)) {
      this._closeCallback();
    }
  },
  onKeyBack: function () {
    return true;
  }
});
