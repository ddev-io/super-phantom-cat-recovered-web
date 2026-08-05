// Source-like reconstruction from UI/lyGestureController.dis

var LyGestureController = vee.GestureControllerDelegate.extend({
  _enabled: false,
  _gestureController: null,
  _origin: null,
  _bufferOffsetX: 25,
  _maxOffsetX: 50,
  _bufferOffsetY: 50,
  _bufferOffsetSmash: 120,
  _isOnLeft: false,
  _isOnRight: false,
  _isOnJump: false,
  _drawCtl: null,

  setScale: function (scale) {
    if (!this._enabled) {
      return;
    }

    this._bufferOffsetX = 25 * scale;
    this._maxOffsetX = 50 * scale;
    this._bufferOffsetY = 50 * scale;
    this._bufferOffsetSmash = 120 * scale;

    if (this._drawCtl) {
      this._drawCtl.setScale(scale);
    }
  },

  setEnabled: function (enabled) {
    if (enabled === this._enabled) {
      return;
    }

    this._enabled = enabled;

    if (enabled) {
      this._drawCtl = LyGestureDrawNode.create();
      this.rootNode.addChild(this._drawCtl.rootNode);
      this._gestureController = vee.GestureController.registerController(this.rootNode, this, false);

      game.Data.oLyGame.hideControlButton(LyGame.ControlButtonType.MoveButton);
      game.Data.oLyGame.hideControlButton(LyGame.ControlButtonType.JumpButton);
      game.Data.oLyGame.hideControlButton(LyGame.ControlButtonType.ActionButton);
      return;
    }

    if (this._drawCtl) {
      this._drawCtl.gestureController.unregister();
      this._drawCtl = null;
    }

    if (this._gestureController) {
      this._gestureController.unregister();
      this._gestureController = null;
    }

    game.Data.oLyGame.showControlButton(LyGame.ControlButtonType.MoveButton, false, false);
    game.Data.oLyGame.showControlButton(LyGame.ControlButtonType.JumpButton, false, false);
    if (game.Data.playerType !== game.PlayerType.Normal) {
      game.Data.oLyGame.showControlButton(LyGame.ControlButtonType.ActionButton, false, false);
    }
  },

  getEnabled: function () {
    return this._enabled;
  },

  onGestureBegin: function (gesture) {
    this._origin = gesture.getBeginPoint();
    return true;
  },

  onGestureMove: function (gesture, offset) {
    var point = gesture.getLastPoint();

    if (Math.abs(offset.x) >= 50 || this._isOnLeft || this._isOnRight) {
      var deltaX = point.x - this._origin.x;
      if (deltaX > this._bufferOffsetX) {
        if (deltaX > this._maxOffsetX) {
          this._origin.x = point.x - this._maxOffsetX;
        }
        this.onRight();
      } else if (deltaX < -this._bufferOffsetX) {
        if (deltaX < -this._maxOffsetX) {
          this._origin.x = point.x + this._maxOffsetX;
        }
        this.onLeft();
      } else {
        this.onLeftRelease();
        this.onRightRelease();
      }
    }

    if (!this._isOnJump) {
      if (offset.y < 0) {
        this._origin.y = point.y;
      } else if (point.y - this._origin.y > this._bufferOffsetY) {
        this.onJump();
      }
    } else if (offset.y < 0) {
      this.onJumpRelease();
    }
  },

  onGestureSwipe: function (gesture, angle, distance) {
    if (distance < this._bufferOffsetSmash) {
      return;
    }

    switch (game.Data.playerType) {
      case game.PlayerType.Bullet:
      case game.PlayerType.Bomb:
      case game.PlayerType.Teleport:
        if (angle > 60 && angle < 120) {
          this.onRight();
          this.onRightRelease();
          this.onSmash();
        } else if (angle > 240 && angle < 300) {
          this.onLeft();
          this.onLeftRelease();
          this.onSmash();
        }
        break;
      case game.PlayerType.Smash:
        if (angle > 150 && angle < 210) {
          this.onSmash();
        }
        break;
    }
  },

  onGestureTap: function () {
    switch (game.Data.playerType) {
      case game.PlayerType.Bullet:
      case game.PlayerType.Bomb:
        this.onSmash();
        break;
    }
  },

  onGestureLeave: function () {
    this.onLeftRelease();
    this.onRightRelease();
    this.onJumpRelease();
  },

  onLeft: function () {
    this._isOnLeft = true;
    game.Data.oLyGame.onLeft(this, cc.CONTROL_EVENT_TOUCH_DOWN);
  },

  onLeftRelease: function () {
    if (this._isOnLeft) {
      game.Data.oLyGame.onLeft(this, cc.CONTROL_EVENT_TOUCH_UP_INSIDE);
    }
    this._isOnLeft = false;
  },

  onRight: function () {
    this._isOnRight = true;
    game.Data.oLyGame.onRight(this, cc.CONTROL_EVENT_TOUCH_DOWN);
  },

  onRightRelease: function () {
    if (this._isOnRight) {
      game.Data.oLyGame.onRight(this, cc.CONTROL_EVENT_TOUCH_UP_INSIDE);
    }
    this._isOnRight = false;
  },

  onJump: function () {
    this._isOnJump = true;
    game.Data.oLyGame.onJump(this, cc.CONTROL_EVENT_TOUCH_DOWN);
  },

  onJumpRelease: function () {
    this._isOnJump = false;
    game.Data.oLyGame.onJump(this, cc.CONTROL_EVENT_TOUCH_UP_INSIDE);
  },

  onSmash: function () {
    game.Data.oLyGame.onSmash(this, cc.CONTROL_EVENT_TOUCH_DOWN);
    game.Data.oLyGame.onSmash(this, cc.CONTROL_EVENT_TOUCH_UP_INSIDE);
  }
});
