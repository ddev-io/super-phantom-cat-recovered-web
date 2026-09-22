// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/common/map.dis
var vee = vee || {};
vee.Direction = {
  Origin: 0,
  TopLeft: 1,
  Top: 2,
  TopRight: 3,
  Right: 4,
  BottomRight: 5,
  Bottom: 6,
  BottomLeft: 7,
  Left: 8,
  isNextToDirection: function (arg0, arg1) {
    var local0 = Math.abs(arg0 - arg1);
    return arg0 === 0 || arg1 === 0 || local0 === 1 || local0 === 7;
  },
  isTop: function (arg0) {
    return this.isNextToDirection(arg0, this.Top);
  },
  isRight: function (arg0) {
    return this.isNextToDirection(arg0, this.Right);
  },
  isLeft: function (arg0) {
    return this.isNextToDirection(arg0, this.Left);
  },
  isBottom: function (arg0) {
    return this.isNextToDirection(arg0, this.Bottom);
  },
  direction2Point: function (arg0) {
    switch (arg0) {
      case this.TopLeft:
        return cc.p(-1, -1);
      case this.Top:
        return cc.p(0, -1);
      case this.TopRight:
        return cc.p(1, -1);
      case this.Right:
        return cc.p(1, 0);
      case this.BottomRight:
        return cc.p(1, 1);
      case this.Bottom:
        return cc.p(0, 1);
      case this.BottomLeft:
        return cc.p(-1, 1);
      case this.Left:
        return cc.p(-1, 0);
      default:
        return cc.p(0, 0);
    }
  },
  pointToDirection: function (arg0) {
    switch (arg0.y) {
      case -1:
        switch (arg0.x) {
          case -1:
            return vee.Direction.TopLeft;
          case 0:
            return vee.Direction.Top;
          case 1:
            return vee.Direction.TopRight;
        }
        break;
      case 0:
        switch (arg0.x) {
          case -1:
            return vee.Direction.Left;
          case 0:
            return vee.Direction.Origin;
          case 1:
            return vee.Direction.Right;
        }
        break;
      case 1:
        switch (arg0.x) {
          case -1:
            return vee.Direction.BottomLeft;
          case 0:
            return vee.Direction.Bottom;
          case 1:
            return vee.Direction.BottomRight;
        }
        break;
    }
  },
  direction2String: function (arg0) {
    switch (arg0) {
      case this.TopLeft:
        return "TopLeft";
      case this.Top:
        return "Top";
      case this.TopRight:
        return "TopRight";
      case this.Right:
        return "Right";
      case this.BottomRight:
        return "BottomRight";
      case this.Bottom:
        return "Bottom";
      case this.BottomLeft:
        return "BottomLeft";
      case this.Left:
        return "Left";
      default:
        return "Origin";
    }
  },
  string2Direction: function (arg0) {
    return this[arg0];
  },
  getDirectionByAngle: function (arg0, arg1) {
    var local0 = Math.floor(Math.floor(arg0 + (arg1 ? 45 : 22.5)) % 360 / (arg1 ? 90 : 45)) + 1;
    local0 = local0 * (arg1 ? 2 : 1);
    if (arg1) {
      return local0;
    }
    return this.getDirectionClockwise(local0);
  },
  getDirectionClockwise: function (arg0, arg1) {
    arg0 = arg0 + 1 + (arg1 ? 1 : 0);
    if (arg0 > this.Left) {
      arg0 = arg1 ? this.Top : this.TopLeft;
    }
    return arg0;
  },
  getNextDirection: function (arg0, arg1) {
    return this.getDirectionClockwise(arg0, arg1);
  },
  getLastDirection: function (arg0, arg1) {
    return this.getDirectionCounterClockwise(arg0, arg1);
  },
  getDirectionCounterClockwise: function (arg0, arg1) {
    arg0 = arg0 - (1 + (arg1 ? 1 : 0));
    if (arg0 < (arg1 ? this.Top : this.TopLeft)) {
      arg0 = this.Left;
    }
    return arg0;
  },
  getRandomDirection: function (arg0, arg1) {
    var local0 = (arg1 ? this.Left / 2 : this.Left) + (arg0 ? 0 : 1);
    var local1 = Math.floor(cc.RANDOM_0_1() * 1000) % local0 + (arg0 ? 1 : 0);
    if (arg1) {
      return local1 * 2;
    }
    return local1;
  },
  revert: function (arg0) {
    arg0 = this.getDirectionClockwise(arg0);
    arg0 = this.getDirectionClockwise(arg0);
    arg0 = this.getDirectionClockwise(arg0);
    arg0 = this.getDirectionClockwise(arg0);
    return arg0;
  },
  isHorizontal: function (arg0) {
    return arg0 === this.Left || arg0 === this.Right;
  },
  isVertical: function (arg0) {
    return arg0 === this.Top || arg0 === this.Bottom;
  }
};
vee.Map = cc.Class.extend({
  _objs: null,
  setObject: function (arg0, arg1) {
    if (arg1 === null || arg1 === undefined) {
      return undefined;
    }
    var local0 = arg1;
    if (_.isObject(arg1)) {
      local0 = this.grid2Index(arg1);
    }
    if (local0 >= 0) {
      this._objs[local0] = arg0;
    }
  },
  setObjectByIndex: function (arg0, arg1) {
    if (arg1 === null || arg1 === undefined) {
      return undefined;
    }
    if (arg1 >= 0) {
      this._objs[arg1] = arg0;
    }
  },
  getObjectByIndex: function (arg0) {
    return this._objs[arg0];
  },
  getObject: function (arg0) {
    if (arg0 === null || arg0 === undefined) {
      return null;
    }
    var local0 = arg0;
    if (_.isObject(arg0)) {
      local0 = this.grid2Index(arg0);
    }
    if (local0 >= 0) {
      return this._objs[local0];
    }
    return null;
  },
  removeObject: function (arg0) {
    this.setObject(null, arg0);
  },
  getObjects: function () {
    return this._objs;
  },
  forEachObjects: function (arg0) {
    for (var local0 in this._objs) {
      if (this._objs[local0] !== null) {
        arg0(this._objs[local0]);
      }
    }
  },
  forEachGrid: function (arg0, arg1) {
    var local0;
    var local1;
    var local2;
    var local3;
    if (!arg1) {
      arg1 = vee.Direction.TopLeft;
    }
    if (vee.Direction.isBottom(arg1)) {
      local1 = this.mapSize.height - 1;
      local3 = 0;
    } else {
      local1 = 0;
      local3 = this.mapSize.height - 1;
    }
    if (vee.Direction.isRight(arg1)) {
      local0 = this.mapSize.width - 1;
      local2 = 0;
    } else {
      local0 = 0;
      local2 = this.mapSize.width - 1;
    }
    vee.Utils.forEachGrid(cc.p(local0, local1), cc.p(local2, local3), arg0);
  },
  removeAllObjects: function () {
    this._objs = [];
  },
  baseLocation: {
    x: 0,
    y: 0
  },
  tileSize: {
    width: 0,
    height: 0
  },
  mapSize: {
    width: 10,
    height: 10
  },
  contentSize: {
    width: 0,
    height: 0
  },
  getContentSize: function () {
    return cc.size(this.contentSize.width, this.contentSize.height);
  },
  length: 0,
  setMapSize: function (arg0) {
    this.mapSize = arg0;
    this.contentSize.width = (this.mapSize.width * this.tileSize.width);
    this.contentSize.height = (this.mapSize.height * this.tileSize.height);
    this.length = (arg0.width * arg0.height);
  },
  setTileSize: function (arg0) {
    this.tileSize = arg0;
    this.contentSize.width = (this.mapSize.width * this.tileSize.width);
    this.contentSize.height = (this.mapSize.height * this.tileSize.height);
  },
  setPosition: function (arg0) {
    this.baseLocation = arg0;
  },
  getPosition: function () {
    return cc.p(this.baseLocation.x, this.baseLocation.y);
  },
  position2Grid: function (arg0) {
    var local0 = Math.floor((arg0.x - this.baseLocation.x) / this.tileSize.width);
    var local1 = this.mapSize.height - Math.floor((arg0.y - this.baseLocation.y) / this.tileSize.height) - 1;
    if (local0 < 0 || local1 < 0 || local0 >= this.mapSize.width || local1 >= this.mapSize.height) {
      return null;
    }
    return cc.p(local0, local1);
  },
  mapPosition2Grid: function (arg0) {
    var local0 = Math.floor(arg0.x / this.tileSize.width);
    var local1 = this.mapSize.height - Math.floor(arg0.y / this.tileSize.height) - 1;
    if (local0 < 0 || local1 < 0 || local0 >= this.mapSize.width || local1 >= this.mapSize.height) {
      return null;
    }
    return cc.p(local0, local1);
  },
  gridByDirection: function (arg0, arg1) {
    return this.lawGrid(cc.pAdd(arg0, vee.Direction.direction2Point(arg1)));
  },
  grid2Index: function (arg0) {
    if (!this.lawGrid(arg0)) {
      return -1;
    }
    return arg0.x + arg0.y * this.mapSize.width;
  },
  index2Grid: function (arg0) {
    return cc.p(arg0 % this.mapSize.width, Math.floor(arg0 / this.mapSize.width));
  },
  grid2Position: function (arg0) {
    return cc.p((this.baseLocation.x + ((arg0.x + 0.5) * this.tileSize.width)), (this.baseLocation.y + (((this.mapSize.height - arg0.y) - 0.5) * this.tileSize.height)));
  },
  grid2PositionInMap: function (arg0) {
    return cc.p(((arg0.x + 0.5) * this.tileSize.width), (((this.mapSize.height - arg0.y) - 0.5) * this.tileSize.height));
  },
  forceLawGrid: function (arg0) {
    var local0 = Math.max(0, Math.min((this.mapSize.width - 1), arg0.x));
    var local1 = Math.max(0, Math.min((this.mapSize.height - 1), arg0.y));
    return cc.p(local0, local1);
  },
  lawGrid: function (arg0) {
    if (!arg0) {
      return null;
    }
    if (arg0.x < 0 || arg0.y < 0 || arg0.x >= this.mapSize.width || arg0.y >= this.mapSize.height) {
      return null;
    }
    return arg0;
  }
});
vee.Map.create = function (arg0, arg1) {
    var local0 = new vee.Map();
    if (arg0) {
      local0.setMapSize(arg0);
    }
    if (arg1) {
      local0.setTileSize(arg1);
    }
    local0._objs = [];
    return local0;
  };
