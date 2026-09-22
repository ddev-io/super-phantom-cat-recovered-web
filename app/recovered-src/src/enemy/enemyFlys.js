function _enemyGetSideAgainstPlayer(obj) {
  return obj.getElePosition().x > game.Data.oPlayerCtl.getElePosition().x ? vee.Direction.Left : vee.Direction.Right;
}

var EnemyMoth = EnemyMushroom.extend({
  objType: game.ObjectType.Moth,
  _accYForSet: 500,
  _accXForSet: 500,
  _speedXLimitForSet: 200,
  _speedYLimitForSet: 200,
  _hasDecay: false,
  _needSafePos: false,
  _loopEfx: null,

  bornWithPos: function () {
    this._hasDecay = false;
    this._needSafePos = false;
    this._hasG = false;
  },

  onDead: function () {
  },

  collide: function (dir) {
    var player = game.Data.oPlayerCtl;
    if (player._isBounce || !this._hasCollide) {
      return;
    }
    if (dir === vee.Direction.Top && !player.extendController) {
      if (!game.Data.playerHawk) {
        this.popPlayerUp();
        this.dieAnimate(dir);
      }
      return;
    }
    if (game.Data.playerHawk) {
      game.Data.oLyGame.shake();
      this.dieAnimate(dir);
      return;
    }
    if (game.Data.playerInvisible || player._isBounce) {
      return;
    }
    player.getShock(_enemyGetSideAgainstPlayer(this), true);
  },

  defaultMoveLogic: function () {
  },

  safeEnemyPos: function (pos) {
    var grid = game.Logic.getTileGridByPos(pos);
    var obj = game.Logic.map.getObject(grid);
    this._isSloping = false;
    var rough = game.Logic.checkTileRough(obj, pos, this, vee.Direction.Origin);
    if (!rough) {
      var downObj = game.Logic.map.getObject(cc.p(grid.x, grid.y - 1));
      rough = game.Logic.checkTileRough(downObj, pos, this, vee.Direction.Bottom);
    }
    if (rough) {
      pos.y = rough.y + this.boxSize.height / 2 - this.boxOffset.y;
    }
    return pos;
  },

  setFaceTo: function (dir, force) {
    if (this._faceTo === dir && !force) {
      return;
    }
    dir = dir || vee.Direction.Left;
    this._faceTo = dir;
    this.rootNode.setScaleX(dir === vee.Direction.Left ? 1 : -1);
  },

  setMoveState: function () {
  }
});

var EnemyBee = EnemyMoth.extend({
  objType: game.ObjectType.Bee,
  _accYForSet: 1200,
  _accXForSet: 5000,
  _speedXLimitForSet: 250,
  _speedYLimitForSet: 250,
  _loopEfx: null,
  _lockY: true,
  count: 0,

  bornWithPos: function () {
    this._hasDecay = false;
    this._needSafePos = false;
    this._hasG = false;
  },

  onDead: function () {
  },

  AILogic: function () {
    this._hasCollide = true;
    var cfg = game.Logic.configMap.getObject(this._grid);
    if (cfg) {
      if (cfg.first && cfg.last) {
        this._hasG = false;
        this._checkPosFirst = game.Logic.getTilePosCenterByGrid(vee.Utils.pAdd(this._grid, cfg.first));
        this._checkPosLast = game.Logic.getTilePosCenterByGrid(vee.Utils.pAdd(this._grid, cfg.last));
        if (cfg.first.y - cfg.last.y === 0 || this._lockY) {
          this._onlyHor = true;
          this._accY = 0;
        } else {
          this._hasG = false;
          this._accY = this._accYForSet * (vee.Utils.isLucky(0.5) ? -1 : 1);
          this._speedYLimit = this._speedYLimitForSet;
        }
        if (this._checkPosFirst.y < this._checkPosLast.y) {
          var temp = this._checkPosFirst.y;
          this._checkPosFirst.y = this._checkPosLast.y;
          this._checkPosLast.y = temp;
        }
      }
      this._speedXLimit = this._speedXLimitForSet;
      if (cfg.dir === "right") {
        this.moveRight();
      } else {
        this.moveLeft();
      }
    } else if (this._faceTo === vee.Direction.Right) {
      this.moveRight();
    } else {
      this.moveLeft();
    }
    this.playAnimate("run");
  },

  AILogicPerFrame: function () {
    if (this.count > 1) {
      this.count = 0;
      return;
    }
    this.count += 1;
    var myPos = this.getElePosition();
    if (this._checkPosFirst) {
      if (!this._onlyHor) {
        if (myPos.y > this._checkPosFirst.y) {
          this._accY = -this._accYForSet;
        }
        if (myPos.y < this._checkPosLast.y) {
          this._accY = this._accYForSet;
        }
      }
    } else {
      this.defaultMoveLogic();
    }
    myPos = null;
  },

  afterCreate: function () {
    if (this._faceTo === vee.Direction.Right) {
      if (this._grid.x - game.Data.oPlayerCtl._grid.x > 0) {
        this.die();
      }
    } else if (this._grid.x - game.Data.oPlayerCtl._grid.x < 0) {
      this.die();
    }
  }
});

var EnemyFastBee = EnemyBee.extend({
  objType: game.ObjectType.FastBee,
  _lockY: false,
  _accYForSet: 1200,
  _accXForSet: 5000,
  _speedXLimitForSet: 320,
  _speedYLimitForSet: 250,
  _loopEfx: null,

  bornWithPos: function () {
    this._hasDecay = false;
    this._needSafePos = false;
    this._hasG = false;
  },

  onDead: function () {
  },

  AILogic: function () {
    this._speedXLimit = this._speedXLimitForSet + vee.Utils.randomInt(-30, 30);
    this._hasCollide = true;
    var cfg = game.Logic.configMap.getObject(this._grid);
    if (cfg) {
      if (cfg.first && cfg.last) {
        this._hasG = false;
        this._checkPosFirst = game.Logic.getTilePosCenterByGrid(vee.Utils.pAdd(this._grid, cfg.first));
        this._checkPosLast = game.Logic.getTilePosCenterByGrid(vee.Utils.pAdd(this._grid, cfg.last));
        if (cfg.first.y - cfg.last.y === 0 || this._lockY) {
          this._onlyHor = true;
          this._accY = 0;
        } else {
          this._hasG = false;
          this._accY = this._accYForSet * (vee.Utils.isLucky(0.5) ? -1 : 1);
          this._speedYLimit = this._speedYLimitForSet;
        }
        if (this._checkPosFirst.y < this._checkPosLast.y) {
          var temp = this._checkPosFirst.y;
          this._checkPosFirst.y = this._checkPosLast.y;
          this._checkPosLast.y = temp;
        }
      }
      this._speedXLimit = this._speedXLimitForSet;
      if (cfg.dir === "right") {
        this.moveRight();
      } else {
        this.moveLeft();
      }
    } else if (this._faceTo === vee.Direction.Right) {
      this.moveRight();
    } else {
      this.moveLeft();
    }
    this.playAnimate("run");
  }
});

var EnemyMadBee = EnemyBee.extend({
  objType: game.ObjectType.MadBee,
  _accYForSet: 1200,
  _accXForSet: 5000,
  _speedXLimitForSet: 150,
  _speedYLimitForSet: 150,
  _playerPos: null,

  resetStatus: function () {
    this._container.setRotation(0);
    this._isOver = false;
    this._isFindPlayer = false;
    this._dashing = false;
    this._playerPos = null;
  },

  AILogicPerFrame: function () {
    if (this.count > 1) {
      this.count = 0;
      return;
    }
    if (this._isOver) {
      return;
    }
    this._pos = this.getElePosition();
    this._playerGrid = game.Data.oPlayerCtl._grid;
    var gridDX = this._grid.x - this._playerGrid.x;
    var gridDY = this._grid.y - this._playerGrid.y;
    if (((gridDX > 0 && this._faceTo === vee.Direction.Left) ||
        (gridDX < 0 && this._faceTo === vee.Direction.Right)) &&
        Math.abs(gridDX) < 6 &&
        Math.abs(gridDY) < 3 &&
        !game.Data.oPlayerCtl._isBounce) {
      if (!this._isFindPlayer) {
        vee.Audio.playEffect(res.inGame_monster_crazyFound_mp3);
        this._isFindPlayer = true;
        this._checkPosFirst = null;
        this._accX = 0;
        this._accY = 0;
        this._speedX = 0;
        this._speedY = 0;
        this.playAnimate("get", function () {
          this._speedXLimit = 9999;
          this._speedYLimit = 9999;
          this.playAnimate("eat");
          this._playerPos = game.Data.oPlayerCtl.getElePosition();
          if (this._playerPos.x > this._pos.x) {
            this.setFaceTo(vee.Direction.Right);
          } else {
            this.setFaceTo(vee.Direction.Left);
          }
          this._dashing = true;
          var angle = vee.Utils.angleOfLine(this._pos, vee.Utils.pAdd(this._playerPos, cc.p(0, 32)));
          var target = vee.Utils.getPointWithAngle(this._pos, 800, angle);
          this._container.setRotation(angle + 90 * (this._faceTo === vee.Direction.Left ? 1 : -1));
          this._speedX = target.x - this._pos.x;
          this._speedY = target.y - this._pos.y;
        }.bind(this));
      }
    } else if (!this._isFindPlayer) {
      this._dashing = false;
      this._speedXLimit = 150;
    }
    this.count += 1;

    var myPos = this.getElePosition();
    if (this._checkPosFirst && !this._isFindPlayer) {
      if (!this._onlyHor) {
        if (myPos.y > this._checkPosFirst.y) {
          this._accY = -this._accYForSet;
        }
        if (myPos.y < this._checkPosLast.y) {
          this._accY = this._accYForSet;
        }
      }
    } else {
      this.defaultMoveLogic();
    }
    myPos = null;
  }
});

var EnemyFish = EnemyMoth.extend({
  objType: game.ObjectType.Fish,
  _loopEfx: null,

  bornWithPos: function () {
    this._hasDecay = false;
    this._needSafePos = false;
    this._hasG = false;
  },

  onDead: function () {
  }
});
