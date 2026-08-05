// Source-like reconstruction from UI/lyGestureDrawNode.dis

var LyGestureDrawNode = vee.GestureControllerDelegate.extend({
  rootNode: null,
  _origin: null,
  _end: null,
  _bufferOffsetX: 25,
  _maxOffsetX: 50,
  _bufferOffsetY: 140,
  _bufferOffsetSmash: 120,
  _distance: 0,
  spOrigin: null,
  spEnd: null,

  setScale: function (scale) {
    this._bufferOffsetX = 25 * scale;
    this._maxOffsetX = 50 * scale;
    this._bufferOffsetY = 140 * scale;
    this._bufferOffsetSmash = 120 * scale;
    this.spOrigin.setScale(1 * scale);
    this.spEnd.setScale(2.5 * scale);
  },

  init: function () {
    var rootNode = new cc.Node();
    this.rootNode = rootNode;

    var origin = cc.Sprite.create(res.btn_circle_png);
    origin.setScale(1);
    origin.setOpacity(0);
    rootNode.addChild(origin);
    this.spOrigin = origin;

    var end = cc.Sprite.create(res.efx_one_png);
    end.setScale(2.5);
    end.setOpacity(0);
    rootNode.addChild(end);
    this.spEnd = end;

    this.gestureController = vee.GestureController.registerController(rootNode, this, false);
  },

  unregister: function () {
  },

  onGestureBegin: function (gesture) {
    this._origin = gesture.getBeginPoint();
    this._end = this._origin;

    this.spOrigin.stopAllActions();
    this.spOrigin.setOpacity(128);
    this.spEnd.stopAllActions();
    this.spEnd.setOpacity(196);
    this.draw();

    return true;
  },

  onGestureMove: function (gesture, offset) {
    var point = gesture.getLastPoint();
    this._end = point;

    if (Math.abs(offset.x) >= 50 || this._isOnLeft || this._isOnRight) {
      var deltaX = point.x - this._origin.x;
      if (deltaX > this._maxOffsetX) {
        this._origin.x = point.x - this._maxOffsetX;
      } else if (deltaX < -this._maxOffsetX) {
        this._origin.x = point.x + this._maxOffsetX;
      }
    }

    if (offset.y < 0) {
      if (this._origin.y > point.y) {
        this._origin.y = point.y;
      }
    } else if (point.y - this._origin.y > this._bufferOffsetY) {
      this._origin.y = point.y - this._bufferOffsetY;
    }

    var horizontalDistance = this._end.x - this._origin.x;
    this._distance = Math.abs(horizontalDistance);
    this._end.x += this._distance > 100 ? (horizontalDistance > 0 ? 50 : -50) : horizontalDistance / 2;
    this.draw();
  },

  onGestureSwipe: function (gesture, angle, distance) {
    if (distance < this._bufferOffsetSmash) {
      return;
    }
    this.spEnd.setOpacity(0);
    this.spOrigin.setOpacity(0);
  },

  onGestureLeave: function () {
    this.clear();
    this._origin = null;
  },

  draw: function () {
    this.spOrigin.setOpacity(this._distance > 100 ? 0 : 128);
    this.spOrigin.setPosition(this._origin.x, this._origin.y + 15);

    if (this._distance > this._bufferOffsetX) {
      this.spEnd.setPosition(this._end.x, this._end.y + 15);
    } else {
      this.spEnd.setPosition(this._origin.x, this._end.y + 15);
    }
  },

  clear: function () {
    this.spEnd.runAction(cc.spawn(
      cc.moveTo(0.2, this._origin.x, this._origin.y + 15),
      cc.fadeTo(0.2, 0)
    ));
    this.spOrigin.runAction(cc.fadeTo(0.2, 0));
  }
});

LyGestureDrawNode.create = function () {
  cc.spriteFrameCache.addSpriteFrames(res.efx_box_plist);

  var controller = new LyGestureDrawNode();
  controller.init();
  return controller;
};
