// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/common/pagingController.dis
var vee = vee || {};
vee.PagingController = cc.Class.extend({
  _currGrid: null,
  _map: null,
  _horizontalEnabled: false,
  _verticalEnabled: false,
  _canSwipe: true,
  _container: false,
  _offset: null,
  _sensitivity: 1,
  _tileDistance: 0,
  _bounceEnabled: false,
  _pageWidthDiv2: 0,
  _gestureController: null,
  _currentPos: null,
  setSensitivity: function (arg0) {
    this._sensitivity = arg0;
  },
  init: function (arg0, arg1, arg2, arg3) {
    this._sensitivity = 1;
    this._bounceEnabled = false;
    this._container = arg0;
    this._horizontalEnabled = arg1 && arg1 > 0;
    this._verticalEnabled = arg2 && arg2 > 0;
    if (!arg2) {
      arg2 = 1;
    }
    if (!arg3) {
      arg3 = arg0.getContentSize();
    }
    if (this._horizontalEnabled && this._verticalEnabled) {
      this._tileDistance = vee.Utils.distanceBetweenPoints(cc.p(0, 0), cc.p(arg3.width, arg3.height));
    } else if (this._horizontalEnabled) {
      this._tileDistance = arg3.width;
    } else {
      this._tileDistance = arg3.height;
    }
    this._pageWidthDiv2 = arg3.width / 2 - 2;
    var local0 = new vee.Map();
    local0.setMapSize(cc.size(arg1, arg2));
    local0.setTileSize(arg3);
    var local1 = arg0.getPosition();
    var local2 = arg0.getAnchorPoint();
    this._offset = cc.p(arg3.width / 2, arg3.height / 2);
    local1.x = local1.x - (arg3.width * (arg1 - 1) + this._offset.x);
    local1.y = local1.y + (arg3.height * (arg2 - 1) - this._offset.y);
    local0.setPosition(local1);
    this._map = local0;
    this._currGrid = local0.position2Grid(arg0.getPosition());
    this._currentPos = local0.grid2Position(this._currGrid);
    this._gestureController = vee.GestureController.registerController(arg0, this);
    this._dragingBuffer = cc.p(0, 0);
    this._dragingEnabled = true;
  },
  setEnabled: function (arg0) {
    this._gestureController.setEnabled(arg0);
  },
  setSwallowTouches: function (arg0) {
    this._gestureController.setSwallowTouches(arg0);
  },
  setBounceEnabled: function (arg0) {
    this._bounceEnabled = arg0;
  },
  getPageWidth: function () {
    return this._map.tileSize.width;
  },
  _dragingEnabled: false,
  setDragingEnabled: function (arg0) {
    this._dragingEnabled = arg0;
  },
  _dragingBuffer: null,
  setDragingBuffer: function (arg0, arg1) {
    arg1 = arg1 || arg0;
    this._dragingBuffer = cc.p(arg0, arg1);
  },
  setPosition: function (arg0) {
    this._container.setPosition(arg0);
  },
  animatePosition: function (arg0, arg1) {
    var local0 = cc.MoveTo.create(arg0, arg1);
    this._container.runAction(local0);
  },
  onGestureDrag: function (arg0, arg1) {
    if (!this._dragingEnabled) {
      return undefined;
    }
    var local0 = cc.p(this._currentPos.x, this._currentPos.y);
    var local1 = this._map.getPosition();
    var local2 = this._map.getContentSize();
    local2.width = local2.width + local1.x + this._offset.x + (this._bounceEnabled ? this._pageWidthDiv2 : 0);
    local2.height = local2.height - (local1.y + this._offset.y);
    local1.x = local1.x + (this._offset.x - (this._bounceEnabled ? this._pageWidthDiv2 : 0));
    local1.y = local1.y - this._offset.y;
    var local3 = arg0.getLastOffset();
    if (this._horizontalEnabled && Math.abs(arg1.x) > this._dragingBuffer.x) {
      if (local3.x > 50) {
        arg1.x = arg1.x - (local3.x - 50);
      } else if (local3.x < -50) {
        arg1.x = arg1.x - (local3.x + 50);
      }
      var local4 = local0.x + this._sensitivity * (arg1.x + (arg1.x > 0 ? -this._dragingBuffer.x : this._dragingBuffer.x));
      if (local4 <= local1.x) {
        local4 = local1.x;
      } else if (local4 >= local2.width) {
        local4 = local2.width;
      }
      local0.x = local4;
    }
    if (this._verticalEnabled && Math.abs(arg1.x) > this._dragingBuffer.y) {
      if (local3.y > 50) {
        arg1.x = arg1.x - (local3.y - 50);
      } else if (local3.y < -50) {
        arg1.y = arg1.y - (local3.y + 50);
      }
      var local4 = local0.y + this._sensitivity * (arg1.y + (arg1.y > 0 ? -this._dragingBuffer.y : this._dragingBuffer.y));
      if (local4 <= local1.y) {
        local4 = local1.y;
      } else if (local4 >= local2.height) {
        local4 = local2.height;
      }
      local0.y = local4;
    }
    this.setPosition(local0);
    this._needReset = true;
  },
  setCanSwipe: function (arg0) {
    this._canSwipe = arg0;
  },
  onGestureSwipe: function (arg0, arg1) {
    if (!this._canSwipe) {
      return undefined;
    }
    var local0 = vee.Direction.getDirectionByAngle(arg1, true);
    if (!(this._horizontalEnabled && this._verticalEnabled)) {
      if (this._horizontalEnabled) {
        if (!vee.Direction.isHorizontal(local0)) {
          local0 = vee.Direction.origin;
        }
      } else if (!vee.Direction.isVertical(local0)) {
        local0 = vee.Direction.origin;
      }
    }
    var local1 = this._map.gridByDirection(this._currGrid, local0);
    if (local1) {
      this._setGrid(local1, true, true);
      return;
    }
    this._setGrid(this._currGrid, true);
  },
  _needReset: false,
  onGestureLeave: function () {
    if (!this._dragingEnabled) {
      return undefined;
    }
    if (this._needReset) {
      this._currGrid = this._map.position2Grid(this._container.getPosition());
      if (this._currGrid) {
        this._setGrid(this._currGrid, true);
      } else {
        this._setGrid(cc.p(6, 0), true);
      }
    }
  },
  setPage: function (arg0, arg1) {
    var local0 = this._map.length - arg0;
    cc.log("maplength====%d   set page =====", this._map.length, local0);
    this._setGrid(this._map.index2Grid(local0), arg1);
  },
  _setGrid: function (arg0, arg1, arg2) {
    this._needReset = false;
    this._container.stopAllActions();
    var local0 = this._map.grid2Position(arg0);
    this._currGrid = arg0;
    this._currentPos = local0;
    if (arg1) {
      var local1 = vee.Utils.distanceBetweenPoints(local0, this._container.getPosition());
      var local2 = 0.2 * local1 / this._tileDistance;
      this.animatePosition(local2, local0, arg2);
    } else {
      this.setPosition(local0);
    }
    if (_.isFunction(this._onPageChanged)) {
      this._onPageChanged(this, this.getCurrentPageNum());
    }
  },
  getCurrentPageNum: function () {
    return this._map.length - this._map.grid2Index(this._currGrid);
  },
  getTotalPageCount: function () {
    return this._map.length;
  },
  getCurrentPagePos: function () {
    return this._currentPos;
  },
  _onPageChanged: null,
  setPageChanged: function (arg0) {
    this._onPageChanged = arg0;
  }
});
vee.PagingController.registerController = function (arg0, arg1, arg2, arg3) {
    var local0 = new vee.PagingController();
    local0.init(arg0, arg1, arg2, arg3);
    arg0.pagingController = local0;
    return local0;
  };
vee.PowerPagingController = vee.PagingController.extend({
  _animationCallback: null,
  setResetAnimation: function (arg0) {
    this._animationCallback = arg0;
  },
  _positionChanged: function () {
  },
  setPositionChanged: function (arg0) {
    this._positionChanged = arg0;
  },
  animatePosition: function (arg0, arg1, arg2) {
    var local0;
    if (arg2) {
      local0 = cc.moveTo(0.5, arg1).easing(cc.easeExponentialOut());
    } else {
      local0 = cc.moveTo(arg0, arg1).easing(cc.easeExponentialOut(3));
    }
    this._container.runAction(local0);
    if (this._animationCallback) {
      this._animationCallback(this, arg0, arg1);
    }
  },
  setPosition: function (arg0) {
    this._container.setPosition(arg0);
    this._positionChanged(this, arg0);
  }
});
vee.PowerPagingController.registerController = function (arg0, arg1, arg2, arg3) {
    var local0 = new vee.PowerPagingController();
    local0.init(arg0, arg1, arg2, arg3);
    arg0.pagingController = local0;
    return local0;
  };
