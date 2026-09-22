// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/elements/eleSmallCat.dis
var EleSmallCat = vee.Class.extend({
  _eleType: game.EleType.Player,
  _container: null,
  _triggerObj: true,
  nodeBox: null,
  boxOffset: null,
  boxSize: null,
  _speedX: 0,
  _speedY: 0,
  _accX: 0,
  _accY: 0,
  _speedXLimit: 0,
  _decay: 0,
  _G: 0,
  _isJumping: true,
  _isBrake: false,
  _pos: null,
  _grid: cc.p(0, 0),
  _lastPosition: null,
  _lastGrid: null,
  _faceTo: vee.Direction.Right,
  _moveDir: vee.Direction.Origin,
  _isBounce: false,
  _isOver: false,
  onCreate: function () {
    this.boxOffset = this.nodeBox.getPosition();
    this.boxSize = this.nodeBox.getContentSize();
    this._speedXLimit = game.Data.playerXSpeedLimit;
    this._decay = 6000;
    this._G = game.Data.G;
  },
  ccbInit: function () {
  },
  setContainerNode: function (arg0) {
    this._container = arg0;
  },
  getContainerNode: function () {
    return this._container;
  },
  getElePosition: function () {
    return this._container.getPosition();
  },
  setElePosition: function (arg0) {
    var local0 = game.Logic.getTileGridByPos(arg0);
    if (!this._pos && this._grid && this._grid.x === 0 && this._grid.y === 0) {
      this._grid = local0;
      this._lastGrid = cc.p(local0.x, local0.y);
    }
    if (!game.Logic.isGridSame(local0, this._grid)) {
      this._lastGrid = cc.p(this._grid.x, this._grid.y);
      this._grid = local0;
      this.onGridChanged();
    }
    this._lastPosition = this._container.getPosition();
    this._offsetX = this._lastPosition.x - arg0.x;
    this._offsetY = this._lastPosition.y - arg0.y;
    this._container.setPosition(arg0);
    game.Data.onPlayerChangePos(arg0);
    this._pos = cc.p(arg0.x, arg0.y);
  },
  setFaceTo: function (arg0, arg1) {
    if (this._faceTo === arg0 && !arg1) {
      return;
    }
    this._isBrake = false;
    this._faceTo = arg0;
    if (arg0 === vee.Direction.Left) {
      this.rootNode.setScaleX(-1);
    } else {
      this.rootNode.setScaleX(1);
    }
  },
  getNextCastPos: function () {
    var local0 = cc.p(this._pos.x, this._pos.y);
    var local1 = this._speedY;
    var local2 = 0.017;
    local1 += (this._accY + (this._jumpSpeedProtect ? 0 : game.Data.G)) * local2;
    if (this.isLimitY) {
      local1 = local1 < game.Data.playerYSpeedLimit ? game.Data.playerYSpeedLimit : local1;
    }
    local0.y += local1 * local2;
    var local3 = this._speedX;
    local3 += this._accX * local2 * (this._isBounce ? 0.1 : 1);
    if (local3 > this._speedXLimit) {
      local3 = this._speedXLimit;
    } else if (local3 < -this._speedXLimit) {
      local3 = -this._speedXLimit;
    }
    local0.x += local3 * local2;
    return local0;
  },
  isJumping: function () {
    return this._isJumping;
  },
  setJumping: function (arg0) {
    this._isJumping = arg0;
  },
  moveLeft: function () {
    this.setFaceTo(vee.Direction.Left);
    this._accX = -game.Data.playerXacc;
  },
  moveRight: function () {
    this.setFaceTo(vee.Direction.Right);
    this._accX = game.Data.playerXacc;
  },
  stopMove: function () {
    this._accX = 0;
  },
  leftToBarrier: function () {
    this._speedX = 0;
  },
  rightToBarrier: function () {
    this._speedX = 0;
  },
  upToBarrier: function () {
    this._speedY = 0;
    this._accY = 0;
  },
  _gidForCheck: 0,
  downToBarrier: function () {
    this._speedY = 0;
    this._accY = 0;
  },
  onGridChanged: function () {
    if (!this._grid || !this._lastGrid) {
      return;
    }
    game.Logic.checkNewGrids(this._lastGrid, vee.Utils.pSub(this._grid, this._lastGrid));
    game.Logic.checkTileTrigger(this._grid, vee.Direction.Origin, null, this);
    game.Data.onPlayerGridChange(this._grid);
  },
  _speedScaleRate: 1,
  _safePos: null,
  _dtCounter: 0,
  updatePos: function (arg0) {
    this.calcX(arg0);
    this.calcY(arg0);
    this.calcMoveDir();
    var local0 = this.getCastPos(arg0);
    this.setElePosition(game.Logic.safePos(local0, this));
    if (this.elf) {
      this.elf.follow(arg0);
    }
    if (this._speedY !== 0) {
      this.setJumping(true);
    }
    if (this._isBounce || this._isFlying) {
      return;
    }
    this.calcDecay(arg0);
  },
  calcX: function (arg0) {
    this._speedX += this._accX * arg0 * (this._isBounce ? 0.1 : 1);
    if (this._speedX > this._speedXLimit) {
      this._speedX = this._speedXLimit;
    } else if (this._speedX < -this._speedXLimit) {
      this._speedX = -this._speedXLimit;
    }
  },
  isLimitY: true,
  isUpdateY: true,
  calcY: function (arg0) {
    if (this.isUpdateY) {
      this._speedY += (this._accY + (this._jumpSpeedProtect ? 0 : this._G)) * arg0;
      if (this.isLimitY) {
        this._speedY = this._speedY < game.Data.playerYSpeedLimit ? game.Data.playerYSpeedLimit : this._speedY;
      }
    }
  },
  calcMoveDir: function () {
    this._moveDir = game.Logic.getMoveDirectionBySpeedX(this._speedX);
  },
  getCastPos: function (arg0) {
    var local0 = cc.p(
      this.getElePosition().x + this._speedX * arg0 * this._speedScaleRate,
      this.getElePosition().y + this._speedY * arg0
    );
    local0.x = local0.x < 96 ? 96 : local0.x;
    if (this._isJumpLimitY) {
      local0.y = local0.y > this._jumpHeightLimitY ? this._jumpHeightLimitY : local0.y;
    }
    return local0;
  },
  calcDecay: function (arg0) {
    if (this._accX > 0 && this._speedX < 0) {
      this._speedX += this._decay * arg0;
    } else if (this._accX < 0 && this._speedX > 0) {
      this._speedX -= this._decay * arg0;
    } else if (this._accX === 0 && this._speedX !== 0) {
      if (this._speedX > 0) {
        this._speedX -= this._decay * arg0;
        if (this._speedX <= 0) {
          this._speedX = 0;
        }
      } else {
        this._speedX += this._decay * arg0;
        if (this._speedX >= 0) {
          this._speedX = 0;
        }
      }
    } else {
      this._isBrake = false;
    }
  }
});
EleSmallCat.create = function () {
    var local0 = cc.BuilderReader.load(res.hero_smallcat_ccbi);
    var local1 = cc.Node.create();
    local1.addChild(local0);
    local0.controller.setContainerNode(local1);
    return {
      container: local1,
      controller: local0.controller
    };
  };
