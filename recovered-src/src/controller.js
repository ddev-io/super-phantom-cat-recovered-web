// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/controller.dis
var vee = vee || {};
vee.KeyCode = {
  JOYSTICK_LEFT_X: 1000,
  JOYSTICK_LEFT_Y: 1001,
  JOYSTICK_RIGHT_X: 1002,
  JOYSTICK_RIGHT_Y: 1003,
  BUTTON_A: 1004,
  BUTTON_B: 1005,
  BUTTON_C: 1006,
  BUTTON_X: 1007,
  BUTTON_Y: 1008,
  BUTTON_Z: 1009,
  BUTTON_DPAD_UP: 1010,
  BUTTON_DPAD_DOWN: 1011,
  BUTTON_DPAD_LEFT: 1012,
  BUTTON_DPAD_RIGHT: 1013,
  BUTTON_DPAD_CENTER: 1014,
  BUTTON_LEFT_SHOULDER: 1015,
  BUTTON_RIGHT_SHOULDER: 1016,
  AXIS_LEFT_TRIGGER: 1017,
  AXIS_RIGHT_TRIGGER: 1018,
  BUTTON_LEFT_THUMBSTICK: 1019,
  BUTTON_RIGHT_THUMBSTICK: 1020,
  BUTTON_START: 1021,
  BUTTON_SELECT: 1022,
  BUTTON_PAUSE: 1023,
  KEY_MAX: 1024
};
vee.Controller = {
  States: {
    CONTROLLER_ATTACH: 1,
    CONTROLLER_DETACH: 2
  },
  isActive: false,
  isConnected: false,
  rootNode: null,
  _listener: null,
  isControllerControlling: false,
  _arrSprites: [],
  _controllerCallbacks: [],
  active: function () {
    this.isActive = true;
    if (!this.rootNode) {
      var local0 = new cc.Node();
      vee.PopMgr._root.addChild(local0, 10);
      this.rootNode = local0;
      if (cc.EventListenerController && typeof cc.EventListenerController.create === "function" &&
          cc.Controller && typeof cc.Controller.startDiscoveryController === "function") {
        var local1 = cc.EventListenerController.create();
        vee.Utils.logKey(local1);
        local1.onConnected = this._onConnected.bind(this);
        local1.onDisconnected = this._onDisconnected.bind(this);
        local1.onKeyDown = this._onKeyDown.bind(this);
        local1.onKeyUp = this._onKeyUp.bind(this);
        local1.onKeyRepeat = this._onKeyRepeat.bind(this);
        local1.onAxisEvent = this._onAxisEvent.bind(this);
        cc.eventManager.addListener(local1, this.rootNode);
        cc.Controller.startDiscoveryController();
        this._listener = local1;
      } else {
        cc.log("controller discovery is unavailable in this web runtime");
        this._listener = null;
      }
      vee.GestureController.registerController(this.rootNode, this, false);
    }
    this._attachKeyboardListener();
  },
  onGestureBegin: function () {
    if (this.isControllerControlling) {
      this.isControllerControlling = false;
      this.controllerDetach();
    }
    return true;
  },
  onControllerEvent: function () {
    if (this.isControllerControlling) {
      return true;
    }
    this.isControllerControlling = true;
    this.controllerAttach();
    return false;
  },
  controllerDetach: function () {
    for (var local0 in this._arrSprites) {
      var local1 = this._arrSprites[local0];
      if (cc.sys.isObjectValid(local1)) {
        local1.stopAllActions();
        local1.runAction(cc.fadeTo(0.3, 0));
      }
    }
    if (this._isActiveSelector && cc.sys.isObjectValid(this._cursor)) {
      this._cursor.stopAllActions();
      this._cursor.runAction(cc.fadeTo(0.3, 0));
    }
    this._callControllerCallback(this.States.CONTROLLER_DETACH);
  },
  controllerAttach: function () {
    for (var local0 in this._arrSprites) {
      var local1 = this._arrSprites[local0];
      if (cc.sys.isObjectValid(local1)) {
        local1.stopAllActions();
        local1.runAction(cc.fadeTo(0.3, 255));
      }
    }
    if (this._isActiveSelector) {
      var local2 = this._itemMap.getObject(this._cursorGrid);
      this._showCursorAt(local2);
    }
    this._callControllerCallback(this.States.CONTROLLER_ATTACH);
  },
  registerControllerSprite: function (arg0) {
    if (arg0) {
      arg0.setVisible(this.isConnected);
      this._arrSprites.push(arg0);
    }
  },
  removeControllerSprite: function (arg0) {
    for (var local0 in this._arrSprites) {
      var local1 = this._arrSprites[local0];
      if (local1 == arg0) {
        cc.log("removed spr tag = " + arg0.getTag());
        this._arrSprites.splice(local0, 1);
        break;
      }
    }
  },
  registerControllerCallback: function (arg0) {
    this._controllerCallbacks.push(arg0);
  },
  removeControllerCallback: function (arg0) {
    for (var local0 in this._controllerCallbacks) {
      var local1 = this._controllerCallbacks[local0];
      if (arg0 == local1) {
        this._controllerCallbacks.splice(local0, 1);
        break;
      }
    }
  },
  _callControllerCallback: function (arg0) {
    for (var local0 in this._controllerCallbacks) {
      var local1 = this._controllerCallbacks[local0];
      if (local1) {
        local1(arg0);
      }
    }
  },
  cacheControllerState: function (arg0) {
    var local0 = {
      tempItemMap: vee.Controller.getItemMap(),
      tempBtnMap: vee.Controller.getButtonMap(),
      tempIsActiveSelector: vee.Controller._isActiveSelector,
      tempSelectorBButtonCallback: vee.Controller._BButtonCallback,
      tempCursorGrid: vee.Controller._cursorGrid,
      tempIsActiveButton: vee.Controller._isActiveButton
    };
    if (arg0) {
      arg0._tempControllerData = local0;
    }
    vee.Controller.clearAllButtonAction();
    vee.Controller.deactiveSelector();
    vee.Controller.deactiveButton();
    return local0;
  },
  reviveControllerStateByCtl: function (arg0) {
    this.reviveControllerState(arg0._tempControllerData);
  },
  reviveControllerState: function (arg0) {
    vee.Controller.setButtonMap(arg0.tempBtnMap);
    vee.Controller.setItemMap(arg0.tempItemMap);
    vee.Controller._cursorGrid = arg0.tempCursorGrid;
    vee.Controller._BButtonCallback = arg0.tempSelectorBButtonCallback;
    vee.Controller.deactiveSelector();
    if (arg0.tempIsActiveSelector) {
      cc.log("selector revived");
      vee.Controller.activeSelector();
    }
    vee.Controller.deactiveButton();
    if (arg0.tempIsActiveButton) {
      vee.Controller.activeButton();
    }
  },
  _tempButtonActive: false,
  _tempSelectorActive: false,
  tempDisable: function () {
    this._tempButtonActive = this._isActiveButton;
    this._tempSelectorActive = this._isActiveSelector;
    this.deactiveButton();
    this.deactiveSelector();
  },
  tempRevive: function () {
    if (this._tempButtonActive) {
      this.activeButton();
    }
    if (this._tempSelectorActive) {
      this.activeSelector();
    }
  },
  keyCode2Dir: function (arg0) {
    switch (arg0) {
      case vee.KeyCode.BUTTON_DPAD_UP:
        return vee.Direction.Top;
      case vee.KeyCode.BUTTON_DPAD_DOWN:
        return vee.Direction.Bottom;
      case vee.KeyCode.BUTTON_DPAD_LEFT:
        return vee.Direction.Left;
      case vee.KeyCode.BUTTON_DPAD_RIGHT:
        return vee.Direction.Right;
      default:
        return null;
    }
  },
  dir2KeyCode: function (arg0) {
    switch (arg0) {
      case vee.Direction.Top:
        return vee.KeyCode.BUTTON_DPAD_UP;
      case vee.Direction.Bottom:
        return vee.KeyCode.BUTTON_DPAD_DOWN;
      case vee.Direction.Left:
        return vee.KeyCode.BUTTON_DPAD_LEFT;
      case vee.Direction.Right:
        return vee.KeyCode.BUTTON_DPAD_RIGHT;
    }
  },
  axis2Dir: function (arg0, arg1) {
    switch (arg0) {
      case vee.KeyCode.JOYSTICK_LEFT_X:
        if (arg1 > 0.4) {
          return vee.Direction.Right;
        }
        if (arg1 < -0.4) {
          return vee.Direction.Left;
        }
        break;
      case vee.KeyCode.JOYSTICK_LEFT_Y:
        if (arg1 > 0.4) {
          return vee.Direction.Bottom;
        }
        if (arg1 < -0.4) {
          return vee.Direction.Top;
        }
        break;
    }
    return null;
  },
  _onConnected: function () {
    cc.log("controller connected");
    this.isConnected = true;
    this.controllerAttach();
    if (this.rootNode) {
      var local0 = VeeMfiConnect.create();
      local0.showConnect();
      this.rootNode.addChild(local0.rootNode);
      vee.PopMgr.setNodePos(local0.rootNode, vee.PopMgr.PositionType.Top);
    }
  },
  _onDisconnected: function () {
    cc.log("controller disconnected");
    this.isConnected = false;
    this.controllerDetach();
    if (this.rootNode) {
      var local0 = VeeMfiConnect.create();
      local0.showDisconect();
      this.rootNode.addChild(local0.rootNode);
      vee.PopMgr.setNodePos(local0.rootNode, vee.PopMgr.PositionType.Top);
    }
  },
  _onKeyDown: function (arg0) {
    if (this.onControllerEvent()) {
      this._selectorInput(arg0);
    }
    if (this._globalKeyDown) {
      this._globalKeyDown();
    }
    this._actionInput(arg0, true);
  },
  _onKeyUp: function (arg0) {
    this._actionInput(arg0, false);
    if (this._globalKeyUp) {
      this._globalKeyUp();
    }
  },
  _onKeyRepeat: function () {
  },
  _xTempDir: null,
  _yTempDir: null,
  _LTriggerDown: false,
  _axisState: {
    key1017: false,
    key1018: false
  },
  _onAxisEvent: function (arg0, arg1) {
    if (this.onControllerEvent()) {
      if (arg0 == vee.KeyCode.JOYSTICK_LEFT_X) {
        var local0 = this.axis2Dir(arg0, arg1);
        this.calcInputDirX(local0);
      } else if (arg0 == vee.KeyCode.JOYSTICK_LEFT_Y) {
        var local0 = this.axis2Dir(arg0, arg1);
        this.calcInputDirY(local0);
      } else if (arg1 > 0.5) {
        var local1 = this._axisState["key" + arg0];
        if (!local1) {
          this._axisState["key" + arg0] = true;
          this._onKeyDown(arg0);
        }
      } else if (this._axisState["key" + arg0]) {
        this._axisState["key" + arg0] = false;
        this._onKeyUp(arg0);
      }
    }
  },
  calcInputDirX: function (arg0) {
    if (this._xTempDir) {
      if (arg0 != this._xTempDir) {
        this._onKeyUp(this.dir2KeyCode(this._xTempDir));
        this._onKeyDown(this.dir2KeyCode(arg0));
      }
    } else {
      this._onKeyDown(this.dir2KeyCode(arg0));
    }
    this._xTempDir = arg0;
  },
  calcInputDirY: function (arg0) {
    if (this._yTempDir) {
      if (arg0 != this._yTempDir) {
        this._onKeyUp(this.dir2KeyCode(this._yTempDir));
        this._onKeyDown(this.dir2KeyCode(arg0));
      }
    } else {
      this._onKeyDown(this.dir2KeyCode(arg0));
    }
    this._yTempDir = arg0;
  },
  _globalKeyDown: null,
  _globalKeyUp: null,
  registerGlobalButtonAction: function (arg0, arg1) {
    this._globalKeyDown = arg0;
    this._globalKeyUp = arg1;
  },
  clearGlobalButtonAction: function () {
    this._globalKeyDown = null;
    this._globalKeyUp = null;
  },
  clearAll: function () {
    this.clearGlobalButtonAction();
    this.clearAllItem();
    this.clearAllButtonAction();
  },
  _itemMap: null,
  _cursor: null,
  _isActiveSelector: false,
  _cursorGrid: null,
  _BButtonCallback: null,
  initSelector: function (arg0, arg1, arg2, arg3) {
    if (arg1 && arg0) {
      this._itemMap = vee.Map.create(cc.size(arg0, arg1), cc.p(1, 1));
    }
    if (!this.isActive) {
      return undefined;
    }
    this._BButtonCallback = arg2;
    if (arg3) {
      this._cursorGrid = arg3;
    }
    if (this._isActiveSelector) {
      this.activeSelector(arg3, true);
    }
  },
  registerItem: function (arg0, arg1) {
    arg0.grid = arg1;
    this._itemMap.setObject(arg0, arg1);
  },
  registerItemByButton: function (arg0, arg1, arg2, arg3, arg4) {
    var local0 = this.createItemByButton(arg0, arg2, arg3, arg4);
    this.registerItem(local0, arg1);
  },
  createItem: function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    return {
      pos: arg0,
      size: arg1,
      onBtnUp: arg2,
      onBtnDown: arg3,
      highlightSprite: arg4,
      spriteOffset: arg6,
      node: arg5
    };
  },
  createItemByButton: function (arg0, arg1, arg2, arg3) {
    if (!arg0) {
      cc.log("Error in createItemByButton : button cannot be null!");
    }
    return this.createItem(arg0.getPosition(), arg0.getContentSize(), null, arg1, arg2, arg0, arg3);
  },
  clearItem: function (arg0, arg1) {
    this._itemMap.removeObject(arg0);
    if (arg1) {
      this._move(vee.Direction.Left);
      this._move(vee.Direction.Right);
      this._move(vee.Direction.Bottom);
      this._move(vee.Direction.Top);
    }
  },
  clearAllItem: function () {
    this._itemMap = null;
  },
  setItemMap: function (arg0) {
    this._itemMap = arg0;
  },
  getItemMap: function () {
    return this._itemMap;
  },
  getItemMapCopy: function () {
    return vee.Utils.copy(this._itemMap);
  },
  getSelectorGrid: function () {
    return cc.p(this._cursorGrid.x, this._cursorGrid.y);
  },
  activeSelector: function (arg0) {
    if (this._isActiveSelector) {
      return undefined;
    }
    if (!this._itemMap) {
      return undefined;
    }
    var local0 = null;
    if (arg0) {
      local0 = arg0;
    } else if (this._cursorGrid) {
      local0 = this._cursorGrid;
    } else {
      cc.log("To active Selector, please define default selector grid first!");
    }
    this._isActiveSelector = true;
    var local1 = this._itemMap.getObject(local0);
    this._showCursorAt(local1);
  },
  deactiveSelector: function (arg0) {
    if (!this.isActive) {
      return undefined;
    }
    cc.log("debug deactive selector========");
    this._isActiveSelector = false;
    if (!cc.sys.isObjectValid(this._cursor)) {
      this._cursor = null;
    }
    if (this._cursor && arg0) {
      this._cursor.stopAllActions();
      this._cursor.runAction(cc.fadeTo(0.1, 0));
    }
  },
  _selectorInput: function (arg0) {
    if (this._isActiveSelector) {
      var local0 = this.keyCode2Dir(arg0);
      if (local0) {
        this._move(local0);
      } else {
        switch (arg0) {
          case vee.KeyCode.BUTTON_A:
          case vee.KeyCode.BUTTON_DPAD_CENTER:
            this._onA();
            break;
          case vee.KeyCode.BUTTON_B:
            this._onB();
            break;
        }
      }
    }
  },
  _onA: function () {
    var local0 = this._itemMap.getObject(this._cursorGrid);
    if (local0 && local0.onBtnDown) {
      local0.onBtnDown();
    }
  },
  _onB: function () {
    if (this._BButtonCallback) {
      this._BButtonCallback();
    }
  },
  _canLoop: false,
  _move: function (arg0) {
    if (!this._isActiveSelector) {
      return undefined;
    }
    var local0 = this._getItemByDir(this._cursorGrid, arg0);
    this._showCursorAt(local0);
  },
  _getItemByDir: function (arg0, arg1) {
    var local0 = null;
    var local1 = vee.Direction.direction2Point(arg1);
    var local2 = vee.Utils.pAdd(arg0, local1);
    var local3 = 1;
    while (!local0 && local2) {
      local0 = this._getItemInLine(local2, vee.Direction.getDirectionClockwise(arg1, true), local3 + 2);
      local3++;
      local2 = vee.Utils.pAdd(arg0, cc.p(local1.x * local3, local1.y * local3));
      local2 = this._itemMap.lawGrid(local2);
    }
    return local0;
  },
  _getItemByOffset: function (arg0, arg1, arg2) {
    var local0 = vee.Utils.pAdd(arg0, cc.p((arg1.x * arg2), (arg1.y * arg2)));
    return this._itemMap.getObject(local0);
  },
  _getItemInLine: function (arg0, arg1, arg2) {
    var local0 = this._itemMap.getObject(arg0);
    var local1 = vee.Direction.direction2Point(arg1);
    if (!local0) {
      var local2 = 1;
      while (local2 <= arg2) {
        local0 = this._getItemByOffset(arg0, local1, local2);
        if (local0) {
          break;
        }
        local0 = this._getItemByOffset(arg0, local1, -local2);
        if (local0) {
          break;
        }
        local2++;
      }
    }
    return local0;
  },
  _showCursorAt: function (arg0) {
    if (!arg0) {
      return undefined;
    }
    if (arg0.node && arg0.highlightSprite && this.isControllerControlling) {
      if (!cc.sys.isObjectValid(this._cursor)) {
        this._cursor = null;
      }
      if (this._cursor) {
        this._cursor.setTexture(arg0.highlightSprite);
        this._cursor.retain();
        this._cursor.removeFromParent();
        arg0.node.addChild(this._cursor);
        this._cursor.release();
      } else {
        this._cursor = cc.Sprite.create(arg0.highlightSprite);
        arg0.node.addChild(this._cursor);
      }
      var local0 = arg0.node.getAnchorPoint();
      var local1 = cc.p(local0.x * arg0.size.width, local0.y * arg0.size.height);
      var local2 = cc.p(0, 0);
      if (arg0.spriteOffset) {
        local2 = arg0.spriteOffset;
      }
      this._cursor.setPosition(vee.Utils.pAdd(local1, local2));
      this._cursor.stopAllActions();
      this._cursor.setScale(1.3);
      this._cursor.setOpacity(255);
      this._cursor.runAction(cc.sequence(
        cc.EaseExponentialOut.create(cc.scaleTo(0.2, 1)),
        cc.repeat(cc.sequence(cc.fadeTo(0.5, 50), cc.fadeTo(0.5, 255)), 9999)
      ));
    }
    vee.Utils.logObj(arg0.grid, "cursor grid");
    this._cursorGrid = cc.p(arg0.grid.x, arg0.grid.y);
  },
  _isActiveButton: false,
  _buttonMap: {},
  registerButtonAction: function (arg0, arg1, arg2) {
    if (_.isArray(arg0)) {
      for (var local0 in arg0) {
        var local1 = arg0[local0];
        this._registerAction(local1, arg1, arg2);
      }
    } else {
      this._registerAction(arg0, arg1, arg2);
    }
  },
  _registerAction: function (arg0, arg1, arg2) {
    this._buttonMap[arg0] = {};
    this._buttonMap[arg0].onKeyDown = arg1;
    this._buttonMap[arg0].onKeyUp = arg2;
  },
  getButtonActionKeyDown: function (arg0) {
    var local0 = this._buttonMap[arg0].onKeyDown;
    return local0;
  },
  getButtonActionKeyUp: function (arg0) {
    var local0 = this._buttonMap[arg0].onKeyUp;
    return local0;
  },
  clearButtonAction: function (arg0) {
    this._buttonMap[arg0] = null;
  },
  clearAllButtonAction: function () {
    this._buttonMap = null;
    this._buttonMap = {};
  },
  setButtonMap: function (arg0) {
    this._buttonMap = arg0;
  },
  getButtonMap: function () {
    return this._buttonMap;
  },
  activeButton: function () {
    if (!this.rootNode) {
      return undefined;
    }
    this._isActiveButton = true;
  },
  deactiveButton: function () {
    this._isActiveButton = false;
  },
  _actionInput: function (arg0, arg1) {
    if (this._isActiveButton) {
      var local0 = this._buttonMap[arg0];
      if (local0) {
        if (arg1 && local0.onKeyDown) {
          local0.onKeyDown();
        } else if (local0.onKeyUp) {
          local0.onKeyUp();
        }
      }
    }
  },
  _keyboardListenerAttached: false,
  _keyboardDownMap: {},
  _attachKeyboardListener: function () {
    if (this._keyboardListenerAttached) {
      return;
    }
    var target = null;
    if (typeof window !== "undefined" && window && window.addEventListener) {
      target = window;
    } else if (typeof document !== "undefined" && document && document.addEventListener) {
      target = document;
    } else if (typeof gameCanvas !== "undefined" && gameCanvas && gameCanvas.addEventListener) {
      target = gameCanvas;
    }
    if (!target) {
      return;
    }
    target.addEventListener("keydown", this._onKeyboardDown.bind(this), true);
    target.addEventListener("keyup", this._onKeyboardUp.bind(this), true);
    this._keyboardListenerAttached = true;
  },
  _keyboardEventCode: function (event) {
    if (!event) {
      return 0;
    }
    return event.keyCode || event.which || 0;
  },
  _keyboardCodeToControllerKey: function (keyCode) {
    switch (keyCode) {
      case 37: // ArrowLeft
      case 65: // A
        return vee.KeyCode.BUTTON_DPAD_LEFT;
      case 39: // ArrowRight
      case 68: // D
        return vee.KeyCode.BUTTON_DPAD_RIGHT;
      case 38: // ArrowUp
      case 87: // W
        return vee.KeyCode.BUTTON_DPAD_UP;
      case 40: // ArrowDown
      case 83: // S
        return vee.KeyCode.BUTTON_DPAD_DOWN;
      case 32: // Space
        return vee.KeyCode.BUTTON_A;
      case 13: // Enter
        return vee.KeyCode.BUTTON_DPAD_CENTER;
      case 16: // Shift
      case 74: // J
      case 75: // K
        return vee.KeyCode.BUTTON_B;
      case 88: // X
      case 76: // L
        return vee.KeyCode.BUTTON_X;
      default:
        return null;
    }
  },
  _shouldPreventKeyboardDefault: function (keyCode) {
    switch (keyCode) {
      case 32:
      case 37:
      case 38:
      case 39:
      case 40:
        return true;
      default:
        return false;
    }
  },
  _stopKeyboardEvent: function (event, keyCode) {
    if (!event || !this._shouldPreventKeyboardDefault(keyCode)) {
      return;
    }
    if (event.preventDefault) {
      event.preventDefault();
    }
    if (event.stopPropagation) {
      event.stopPropagation();
    }
  },
  _dispatchKeyboardInput: function (controllerKey, isDown) {
    if (!this.isControllerControlling) {
      this.isControllerControlling = true;
      this.controllerAttach();
    }
    if (isDown && this._isActiveSelector) {
      this._selectorInput(controllerKey);
    }
    if (this._globalKeyDown && isDown) {
      this._globalKeyDown();
    } else if (this._globalKeyUp && !isDown) {
      this._globalKeyUp();
    }
    this._actionInput(controllerKey, isDown);
  },
  _onKeyboardDown: function (event) {
    var rawKey = this._keyboardEventCode(event);
    var controllerKey = this._keyboardCodeToControllerKey(rawKey);
    if (controllerKey === null) {
      return;
    }
    this._stopKeyboardEvent(event, rawKey);
    var stateKey = "key" + controllerKey;
    if (this._keyboardDownMap[stateKey]) {
      return;
    }
    this._keyboardDownMap[stateKey] = true;
    this._dispatchKeyboardInput(controllerKey, true);
  },
  _onKeyboardUp: function (event) {
    var rawKey = this._keyboardEventCode(event);
    var controllerKey = this._keyboardCodeToControllerKey(rawKey);
    if (controllerKey === null) {
      return;
    }
    this._stopKeyboardEvent(event, rawKey);
    this._keyboardDownMap["key" + controllerKey] = false;
    this._dispatchKeyboardInput(controllerKey, false);
  }
};
