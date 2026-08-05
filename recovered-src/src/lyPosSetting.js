function __lyPosCall(obj, methodName) {
  if (!obj || typeof obj[methodName] !== "function") {
    return undefined;
  }
  return obj[methodName].apply(obj, Array.prototype.slice.call(arguments, 2));
}

function __lyPosLocalized(key) {
  if (typeof vee !== "undefined" && vee.Utils && typeof vee.Utils.getLocalizedStringForKey === "function") {
    return vee.Utils.getLocalizedStringForKey(key);
  }
  return key;
}

function __lyPosPoint(x, y) {
  return (typeof cc !== "undefined" && cc.p) ? cc.p(x, y) : { x: x, y: y };
}

var LyPosSetting = vee.Class.extend({
  spLeft: null,
  btnReset: null,
  btnDone: null,
  btnScale: null,
  btnChangeType: null,
  ccbDisplay: null,
  nodeTL: null,
  nodeTR: null,
  nodeContainer: null,
  lyTouch: null,
  lbControlType: null,
  lbDesc: null,
  _scaleRate: 1,
  _arrTouchedBtn: null,

  onCreate: function () {
    this.handleKey(true);
  },

  onKeyBack: function () {
    this.onDone();
    return true;
  },

  ccbInit: function () {
    __lyPosCall(vee.GestureController, "registerController", this.lyTouch, this, true);
    __lyPosCall(vee.PopMgr, "setNodePos", this.nodeTL, vee.PopMgr.PositionType.TopLeft);
    __lyPosCall(vee.PopMgr, "setNodePos", this.nodeTR, vee.PopMgr.PositionType.TopRight);

    if (game.Data.btnMovePos) {
      this._setButtonPosition(1, game.Data.btnMovePos);
      this._setButtonPosition(2, game.Data.btnDropPos);
      this._setButtonPosition(3, game.Data.btnJumpPos);
    } else {
      this.onReset();
    }

    var isGesture = __lyPosCall(game.Data, "isGestureControl");
    this._setType(!!isGesture);

    var isSmallButton = __lyPosCall(game.Data, "isSmallButton");
    this._setSize(!!isSmallButton);
  },

  _setButtonPosition: function (tag, position) {
    var button = this.nodeContainer && this.nodeContainer.getChildByTag(tag);
    if (button && position) {
      __lyPosCall(button, "setPosition", position);
    }
  },

  _setType: function (isGesture) {
    if (isGesture) {
      __lyPosCall(this.lbControlType, "setString", __lyPosLocalized("GESTURE"));
      __lyPosCall(this.lbDesc, "setString", __lyPosLocalized("Hold your finger to the screen to jump higher."));
      __lyPosCall(this, "playAnimate", "B");

      if (this.ccbDisplay && this.ccbDisplay.controller) {
        __lyPosCall(this.ccbDisplay.controller, "showAnimate");
      }
    } else {
      __lyPosCall(this.lbControlType, "setString", __lyPosLocalized("BUTTON"));
      __lyPosCall(this.lbDesc, "setString", __lyPosLocalized("Move these buttons as you like."));
      __lyPosCall(this, "playAnimate", "A");
    }
  },

  _setSize: function (isSmall) {
    if (isSmall) {
      __lyPosCall(this.btnScale, "setBackgroundSpriteForState", cc.Scale9Sprite.create(res.btn_custom_1x_png), cc.CONTROL_STATE_NORMAL);
      this._resetBtnScale(game.Data.smallButtonRate);
    } else {
      __lyPosCall(this.btnScale, "setBackgroundSpriteForState", cc.Scale9Sprite.create(res.btn_custom_2x_png), cc.CONTROL_STATE_NORMAL);
      this._resetBtnScale(1);
    }
  },

  _resetBtnScale: function (scaleRate) {
    this._scaleRate = scaleRate;

    for (var tag = 1; tag < 4; tag++) {
      var button = this.nodeContainer && this.nodeContainer.getChildByTag(tag);
      if (!button) {
        continue;
      }

      __lyPosCall(button, "stopAllActions");
      __lyPosCall(button, "runAction", cc.EaseElasticOut.create(cc.scaleTo(0.3, scaleRate), 1));
    }
  },

  onDone: function () {
    for (var tag = 1; tag < 4; tag++) {
      var button = this.nodeContainer && this.nodeContainer.getChildByTag(tag);
      if (!button) {
        continue;
      }
      vee.data["btnpos" + tag] = "" + button.getPositionX() + "," + button.getPositionY();
    }

    __lyPosCall(vee, "saveData");
    __lyPosCall(vee.PopMgr, "closeLayer");

    if (game.Data.oLyGame) {
      __lyPosCall(game.Data.oLyGame, "resetGestureControl");
      __lyPosCall(game.Data.oLyGame, "resetButtonSize");
      __lyPosCall(game.Data.oLyGame, "resetButtonState");
    }
  },

  onReset: function () {
    var isSmallButton = __lyPosCall(game.Data, "isSmallButton");
    var moveButton = this.nodeContainer && this.nodeContainer.getChildByTag(1);
    var jumpButton = this.nodeContainer && this.nodeContainer.getChildByTag(3);
    var dropButton = this.nodeContainer && this.nodeContainer.getChildByTag(2);

    __lyPosCall(vee.PopMgr, "setNodePos", moveButton, vee.PopMgr.PositionType.BottomLeft);
    __lyPosCall(vee.PopMgr, "setNodePos", jumpButton, vee.PopMgr.PositionType.BottomRight);

    if (jumpButton && dropButton) {
      var jumpPos = __lyPosPoint(jumpButton.getPosition().x, jumpButton.getPosition().y);
      var dropPos = vee.Utils.pAdd(jumpPos, __lyPosPoint(-dropButton.getContentSize().width, 0));
      __lyPosCall(dropButton, "setPosition", dropPos);
    }

    this._setSize(!!isSmallButton);
  },

  onChangeType: function () {
    var isGesture = !__lyPosCall(game.Data, "isGestureControl");
    __lyPosCall(game.Data, "setGestureControl", isGesture);
    this._setType(isGesture);
  },

  onScale: function () {
    var isSmall = !__lyPosCall(game.Data, "isSmallButton");
    __lyPosCall(game.Data, "setSmallButton", isSmall);
    this._setSize(isSmall);
  },

  onGestureBegin: function (gesture) {
    if (__lyPosCall(game.Data, "isGestureControl")) {
      return false;
    }

    this._arrTouchedBtn = [];
    var beginPoint = gesture.getBeginPoint();

    for (var tag = 1; tag < 4; tag++) {
      var button = this.nodeContainer && this.nodeContainer.getChildByTag(tag);
      if (!button) {
        continue;
      }

      var position = button.getPosition();
      var size = button.getContentSize();
      size = { width: size.width * this._scaleRate, height: size.height * this._scaleRate };

      var bounds = cc.rect(position.x - size.width / 2, position.y - size.height / 2, size.width, size.height);
      if (cc.rectContainsPoint(bounds, beginPoint)) {
        this._arrTouchedBtn.push(button);
      }
    }

    return true;
  },

  onGestureMove: function (gesture, delta) {
    if (!this._arrTouchedBtn) {
      return;
    }

    for (var i = 0; i < this._arrTouchedBtn.length; i++) {
      var button = this._arrTouchedBtn[i];
      if (button) {
        button.setPosition(vee.Utils.pAdd(button.getPosition(), delta));
      }
    }
  },

  onGestureLeave: function () {
    this._arrTouchedBtn = null;
  }
});

LyPosSetting.show = function () {
  var layer = vee.PopMgr.popCCB(res.lyPosSetting_ccbi, true);
  if (layer && layer.controller) {
    layer.controller.ccbInit();
  }
};

var LyGestureDisplay = vee.Class.extend({
  showAnimate: function () {
    this.playAnimate("show");
  }
});
