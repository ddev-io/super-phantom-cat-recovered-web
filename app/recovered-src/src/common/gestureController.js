// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/common/gestureController.dis
var vee = vee || {};
vee.GestureController = cc.Class.extend({
  _target: null,
  _touchSource: null,
  _isTouchBegin: false,
  _beginPoint: null,
  _lastPoint: null,
  _lastOffset: null,
  _timeBegin: null,
  _touchOffset: null,
  _eventListenser: null,
  _force: null,
  _antiFix: false,
  _normalWidth: 0,
  unregister: function () {
    this._target = null;
    if (this._eventListenser) {
      cc.eventManager.removeListener(this._eventListenser);
      this._eventListenser = null;
    }
    this._isTouchBegin = false;
  },
  setSwallowTouches: function () {
    if (this._eventListenser) {
      this._eventListenser.setSwallowTouches(false);
    }
  },
  register: function (arg0, arg1, arg2) {
    this.unregister();
    this._target = arg1;
    arg0.touchHandler = this;
    if (arg2 === undefined) {
      arg2 = true;
    }
    this._swallow = arg2;
    var local0 = cc.EventListener.create({
      event: cc.EventListener.TOUCH_ONE_BY_ONE,
      swallowTouches: arg2,
      onTouchBegan: this._handleTouchBegan,
      onTouchMoved: this._handleTouchMoved,
      onTouchEnded: this._handleTouchEnded,
      onTouchCancelled: this._handleTouchEnded
    });
    this._eventListenser = local0;
    cc.eventManager.addListener(local0, arg0);
    var local1 = vee.PopMgr.winSize;
    this._antiFix = false;
    this._normalWidth = local1.width - 100;
    this._enabled = true;
  },
  setAntiFixEnabled: function (arg0) {
    if (arg0) {
      var local0 = vee.PopMgr.winSize;
      this._antiFix = vee.Utils.getObjByPlatform(true, false, false) && local0.height > local0.width && local0.width / local0.height <= 0.7;
      return;
    }
    this._antiFix = false;
  },
  getAntiFixPosition: function (arg0) {
    if (this._antiFix && arg0.x > this._normalWidth) {
      var local0 = arg0.x - this._normalWidth;
      var local1 = arg0.x - local0 * (1 - local0 / 100) / 4 - 10;
      return cc.p(local1, arg0.y);
    }
    return arg0;
  },
  getBeginPoint: function () {
    var local0 = this._antiFix ? this.getAntiFixPosition(this._beginPoint) : this._beginPoint;
    var local1 = this._touchOffset;
    return cc.p(local0.x - local1.x, local0.y - local1.y);
  },
  getBeginPointInWorld: function () {
    if (this._antiFix) {
      return this.getAntiFixPosition(this._beginPoint);
    }
    return this._beginPoint;
  },
  getLastPoint: function () {
    var local0 = this._antiFix ? this.getAntiFixPosition(this._lastPoint) : this._lastPoint;
    var local1 = this._touchOffset;
    return cc.p(local0.x - local1.x, local0.y - local1.y);
  },
  getLastOffset: function () {
    return this._lastOffset;
  },
  getLastPointInWorld: function () {
    if (this._antiFix) {
      return this.getAntiFixPosition(this._lastPoint);
    }
    return this._lastPoint;
  },
  getDuration: function () {
    var local0 = new Date();
    return (local0 - this._timeBegin);
  },
  getForce: function () {
    return this._force;
  },
  _handleTouchBegan: function (arg0, arg1) {
    if (!vee.GestureController.checkHasCanTouch(arg0)) {
      return false;
    }
    var local0 = arg1.getCurrentTarget();
    var local1 = local0.touchHandler;
    local1._touchOffset = local0.convertToWorldSpace(cc.p(0, 0));
    local1._isTouchBegin = true;
    local1._beginPoint = arg0.getLocation();
    local1._lastPoint = local1._beginPoint;
    local1._lastOffset = cc.p(0, 0);
    local1._timeBegin = new Date();
    if (arg0.getTouchForce) {
      local1._force = arg0.getTouchForce();
    }
    return local1._onGestureBegin();
  },
  _handleTouchMoved: function (arg0, arg1) {
    if (!vee.GestureController.checkHasCanTouch(arg0)) {
      return undefined;
    }
    var local0 = arg1.getCurrentTarget().touchHandler;
    var local1 = arg0.getLocation();
    local0._lastOffset = cc.p(local1.x - local0._lastPoint.x, local1.y - local0._lastPoint.y);
    if (arg0.getTouchForce) {
      local0._force = arg0.getTouchForce();
    }
    local0._onGestureMove(local1);
    local0._onGestureDrag(local1);
    local0._lastPoint = local1;
    return true;
  },
  _handleTouchEnded: function (arg0, arg1) {
    if (vee.GestureController.checkHasCanTouch(arg0)) {
      vee.GestureController.singleTouchCacheId = null;
    }
    var local0 = arg1.getCurrentTarget().touchHandler;
    var local1 = arg0.getLocation();
    if (arg0.getTouchForce) {
      local0._force = arg0.getTouchForce();
    }
    local0._onGestureMove(local1);
    local0._onGestureDrag(local1);
    var local2 = vee.Utils.distanceBetweenPoints(local0._beginPoint, local1);
    if (local2 < 50) {
      local0._onGestureTap(local2);
    } else if (local2 >= 50 && local2 / local0.getDuration() > 0.5) {
      local0._onGestureSwipe(local1, local2);
    }
    local0._onGestureLeave();
    local0._isTouchBegin = false;
    return true;
  },
  _enabled: true,
  setEnabled: function (arg0) {
    this._enabled = arg0;
  },
  _onGestureBegin: function () {
    if (!this._enabled) {
      return false;
    }
    if (this._target && this._target.onGestureBegin) {
      return this._target.onGestureBegin(this) ? true : false;
    }
    return true;
  },
  _onGestureTap: function (arg0) {
    if (this._target && this._target.onGestureTap) {
      this._target.onGestureTap(this, arg0);
    }
  },
  _onGestureMove: function () {
    if (this._target && this._target.onGestureMove) {
      this._target.onGestureMove(this, this._lastOffset);
    }
  },
  _onGestureDrag: function (arg0) {
    if (this._target && this._target.onGestureDrag) {
      var local0 = this._beginPoint;
      this._target.onGestureDrag(this, cc.p(arg0.x - local0.x, arg0.y - local0.y));
    }
  },
  _onGestureSwipe: function (arg0, arg1) {
    if (this._target && this._target.onGestureSwipe) {
      var local0 = vee.Utils.angleOfLine(this._beginPoint, arg0);
      this._target.onGestureSwipe(this, local0, arg1);
    }
  },
  _onGestureLeave: function () {
    if (this._target && this._target.onGestureLeave) {
      this._target.onGestureLeave(this);
    }
  }
});
vee.GestureController.registerController = function (arg0, arg1, arg2) {
    var local0 = new vee.GestureController();
    local0.register(arg0, arg1, arg2);
    arg1.gestureController = local0;
    return local0;
  };
vee.GestureController.isSingleTouchMode = false;
vee.GestureController.singleTouchCacheId = null;
vee.GestureController.checkHasCanTouch = function (arg0) {
    if (vee.GestureController.isSingleTouchMode) {
      var local0 = arg0.getID();
      if (vee.GestureController.singleTouchCacheId === null || vee.GestureController.singleTouchCacheId === local0) {
        vee.GestureController.singleTouchCacheId = local0;
        return true;
      }
      return false;
    }
    return true;
  };
vee.GestureControllerDelegate = vee.Class.extend({
  onGestureTap: function () {
  },
  onGestureMove: function () {
  },
  onGestureDrag: function () {
  },
  onGestureSwipe: function () {
  },
  onGestureBegin: function () {
    return true;
  },
  onGestureLeave: function () {
  }
});
