// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/enemy/enemy.dis
var Enemy = InhaleObj.extend({
  nodeBox: null,
  boxOffset: null,
  boxSize: null,
  _checkPosFirst: null,
  _checkPosLast: null,
  _eleType: game.EleType.Enemy,
  _container: null,
  _grid: null,
  _gridInMap: null,
  _lastPosition: null,
  pushedDir: null,
  _speedX: 0,
  _speedY: 0,
  _accX: 0,
  _accY: 0,
  _accXForSet: game.Data.playerXacc,
  _accYForSet: game.Data.playerXacc,
  _speedXLimit: 100,
  _speedYLimit: 1300,
  _speedXLimitForSet: 100,
  _speedYLimitForSet: 1300,
  _faceTo: vee.Direction.Right,
  _moveDir: vee.Direction.Origin,
  _decayX: 2200,
  _eleSize: null,
  _moveState: MoveState.Moving,
  _speedScaleRate: 1,
  uncheck: false,
  onCreate: function () {
    this.pushedDir = [];
    this.boxOffset = this.nodeBox.getPosition();
    this.boxSize = this.nodeBox.getContentSize();
  },
  cutInAnimate: function () {
    var local0 = arguments[0];
    this.uncheck = true;
    this._isOver = true;
    this.playAnimate("in", function () {
      this.uncheck = false;
      this._isOver = false;
      if (local0) {
        local0();
      }
    }.bind(this));
  },
  onExit: function () {
  },
  initPosition: function (arg0) {
    this.needRefreshPos = true;
    this._stopX = false;
    this._hasG = true;
    this._needSafePos = true;
    this._hasCollide = true;
    this._isOver = false;
    this.setElePosition(arg0);
    this.bornWithPos(arg0);
    this._grid = game.Logic.getTileGridByPos(arg0);
    this._lastGrid = game.Logic.getTileGridByPos(arg0);
    this.resetStatus();
    this._onlyHor = false;
    this._onlyVer = false;
    this._speedXLimit = this._speedXLimitForSet;
    this._speedYLimit = this._speedYLimitForSet;
    this.AILogic();
    this.onGridChanged();
  },
  afterCreate: function () {
  },
  resetStatus: function () {
  },
  updateState: function () {
  },
  isDashing: function () {
  },
  setMoveState: function (arg0) {
    if (this._moveState === arg0) {
      return;
    }
    switch (arg0) {
      case MoveState.JumpUp:
        break;
      case MoveState.Moving:
        EfxDust.show(this.getElePosition(), DustType.ForceJumpDust);
        break;
    }
    this._moveState = arg0;
  },
  setGridInMap: function (arg0) {
    this._gridInMap = arg0;
  },
  getElePosition: function () {
    return this._container.getPosition();
  },
  _pos: null,
  _checkForDieW: 17,
  setElePosition: function (arg0) {
    this._lastPosition = this._container.getPosition();
    this._container.setPosition(arg0);
    this._grid = game.Logic.getTileGridByPos(arg0);
    this._pos = cc.p(arg0.x, arg0.y);
  },
  setContainerNode: function (arg0) {
    this._container = arg0;
  },
  jump: function () {
    if (!this._isJumping) {
      this.setJumping(true);
    }
  },
  setJumping: function (arg0) {
    this._isJumping = arg0;
  },
  isJumping: function () {
    return this._isJumping;
  },
  getEleRect: function () {
    var local0 = this.getElePosition();
    var local1 = cc.rect(
      local0.x + this.boxOffset.x - this.boxSize.width / 2,
      local0.y + this.boxOffset.y - this.boxSize.height / 2,
      this.boxSize.width,
      this.boxSize.height
    );
    return local1;
  },
  setFaceTo: function (arg0, arg1) {
    if (this._faceTo === arg0 && !arg1) {
      return;
    }
    arg0 = arg0 || vee.Direction.Left;
    this._faceTo = arg0;
    if (arg0 === vee.Direction.Left) {
      this.rootNode.setScaleX(1);
    } else {
      this.rootNode.setScaleX(-1);
    }
  },
  getFaceToNumber: function () {
    if (this._faceTo === vee.Direction.Left) {
      return -1;
    }
    return 1;
  },
  moveLeft: function () {
    this.setFaceTo(vee.Direction.Left, true);
    this._accX = -this._accXForSet;
  },
  moveRight: function () {
    this.setFaceTo(vee.Direction.Right, true);
    this._accX = this._accXForSet;
  },
  die: function () {
    this.onDead();
    this._hasCollide = false;
    this._isOver = true;
    game.Data.removeUsingEnemy(this);
    this.inhaleController = null;
    if (this._gridInMap) {
      game.Logic.dynamicObjMap.removeObject(this._gridInMap);
    }
    this.rootNode.setVisible(false);
    this._speedX = 0;
    this._speedY = 0;
    this._accX = 0;
    this._accY = 0;
    this._checkPosFirst = null;
    this._checkPosLast = null;
    game.Data.enemyPool.push(this);
  },
  stopMove: function () {
    this._accX = 0;
  },
  leftToBarrier: function (arg0) {
    this.pushedDir[vee.Direction.Left] = 1;
    game.Logic.triggerTileCallback(arg0, this, vee.Direction.Left);
  },
  rightToBarrier: function (arg0) {
    this.pushedDir[vee.Direction.Right] = 1;
    game.Logic.triggerTileCallback(arg0, this, vee.Direction.Right);
  },
  upToBarrier: function (arg0) {
    this.pushedDir[vee.Direction.Top] = 1;
    this._speedY = 0;
    this._accY = 0;
    game.Logic.triggerTileCallback(arg0, this, vee.Direction.Top);
  },
  jumping: false,
  downToBarrier: function (arg0) {
    this.pushedDir[vee.Direction.Bottom] = 1;
    this._speedY = 0;
    this._accY = 0;
    this.jumping = false;
    game.Logic.triggerTileCallback(arg0, this, vee.Direction.Bottom);
  },
  dieEffect: function () {
    var local0 = this.getElePosition();
    EfxEnemyDie.show(local0);
    this._accX = 0;
    this._speedX = 0;
    this._isOver = true;
    this.playAnimate("die", function () {
      this.die();
    }.bind(this));
  },
  squeeze: function (arg0) {
    if (this._isOver) {
      return true;
    }
    if (this.pushedDir[vee.Direction.revert(arg0)]) {
      this.dieEffect();
      return true;
    }
  },
  _xLimit: null,
  onGridChanged: function () {
    if (!this._grid || !this._lastGrid) {
      return;
    }
    if (game.Data.oPlayerCtl && (
      this._grid.x > game.Data.oPlayerCtl._grid.x + this._checkForDieW ||
      this._grid.x < game.Data.oPlayerCtl._grid.x - this._checkForDieW ||
      this._grid.y > game.Data.oPlayerCtl._grid.y + this._checkForDieW ||
      this._grid.y < game.Data.oPlayerCtl._grid.y - this._checkForDieW
    )) {
      this._isOver = true;
      this.die();
    }
    var local0 = cc.p(
      this._faceTo === vee.Direction.Right ? this._grid.x + 1 : this._grid.x - 1,
      this._isSloping ? this._grid.y - 1 : this._grid.y
    );
    this.updateXLimit(local0);
  },
  updateXLimit: function (arg0) {
    if (this._speedScaleRate < 1) {
      arg0.y -= 1;
      if (this._speedScaleRate < 0.6 || this._speedScaleRate > 0.8) {
        var local0 = game.Logic.map.getObject(this._grid);
        if (local0 && local0.tileInfo && local0.tileInfo.speedScale < 1) {
          arg0.y -= 1;
        } else {
          arg0.y += 1;
        }
      }
    }
    var local1 = game.Logic.map.getObject(arg0);
    if (local1) {
      var local2 = game.TileIDInfo["Tile" + local1.gid];
      if (local2 && (
        local2.type === game.ObjectType.Block ||
        local2.type === game.ObjectType.BlockHurt ||
        local2.type === game.ObjectType.BlockBomb ||
        local2.type === game.ObjectType.BlockBreakable ||
        local2.type === game.ObjectType.BlockScale
      )) {
        this._xLimit = game.Logic.getTilePosCenterByGrid(arg0).x + (
          this._faceTo === vee.Direction.Right ? -TILE_WIDTH - 10 : TILE_WIDTH + 10
        );
        return;
      }
    } else {
      this._xLimit = null;
    }
  },
  needRefreshPos: true,
  _freezeY: false,
  updatePos: function (arg0) {
    if (this._isOver || this.AILogicPerFrame(arg0)) {
      return;
    }
    if (this.needRefreshPos) {
      this.calcX(arg0);
      var local0 = game.Logic.getMoveDirectionBySpeedX(this._speedX);
      this._moveDir = local0;
      if (!this._freezeY) {
        this.calcY(arg0);
      }
      this.refreshPosition(arg0);
    }
    this.checkCollide();
    if (this.needRefreshPos) {
      if (this._speedY !== 0) {
        this.setJumping(true);
      }
      this.checkDecay(arg0);
    }
    this.afterUpdatePos();
  },
  _stopX: false,
  calcX: function (arg0) {
    if (this._stopX) {
      return;
    }
    this._speedX += this._accX * arg0;
    if (Math.abs(this._speedX) > this._speedXLimit) {
      var local0 = this._speedX > 0 ? 1 : -1;
      this._speedX = this._speedXLimit * local0;
    }
    this._speedX = Math.round(this._speedX);
  },
  _hasG: true,
  _stopY: false,
  calcY: function (arg0) {
    if (this._stopY) {
      return;
    }
    this.setMoveState(this._speedY !== 0 ? MoveState.JumpUp : MoveState.Moving);
    this._speedY += this._accY * arg0;
    if (this._hasG) {
      this._speedY += game.Data.G * arg0;
    }
    if (Math.abs(this._speedY) > this._speedYLimit) {
      var local0 = this._speedY > 0 ? 1 : -1;
      this._speedY = this._speedYLimit * local0;
    }
    this._speedY = Math.round(this._speedY);
  },
  _needSafePos: true,
  _safePos: null,
  refreshPosition: function (arg0) {
    var local0 = cc.p(
      this.getElePosition().x + this._speedX * arg0 * this._speedScaleRate,
      this.getElePosition().y + this._speedY * arg0
    );
    this.pushedDir = [];
    if (this._needSafePos) {
      this.setElePosition(this.safeEnemyPos(local0));
    } else {
      this.setElePosition(local0);
    }
    var local1 = this._grid || game.Logic.getTileGridByPos(this.getElePosition());
    if (!this._lastGrid || local1.x !== this._lastGrid.x || local1.y !== this._lastGrid.y) {
      this.onGridChanged();
      this._lastGrid = cc.p(local1.x, local1.y);
    }
  },
  _isSloping: false,
  safeEnemyPos: function (arg0) {
    var local0 = game.Logic.getTileGridByPos(arg0);
    var local1 = game.Logic.map.getObject(local0);
    this._isSloping = false;
    var local2 = game.Logic.checkTileRough(local1, arg0, this, vee.Direction.Origin);
    if (!local2) {
      local1 = game.Logic.map.getObject(cc.p(local0.x, local0.y + 1));
      local2 = game.Logic.checkTileRough(local1, arg0, this, vee.Direction.Bottom);
    }
    this._hasG = !local2;
    return local2 ? local2 : arg0;
  },
  _hasCollide: true,
  _checkWidthOff: 30,
  checkCollide: function () {
    if (!this._hasCollide) {
      return;
    }
    var local0 = this.getEleRect();
    var local1 = game.Data.oPlayerCtl.getEleRect();
    local1.x -= this._checkWidthOff;
    local1.width += this._checkWidthOff * 2;
    if (cc.rectIntersectsRect(local0, local1)) {
      var local2 = game.Data.oPlayerCtl.getElePosition().y;
      var local3 = game.Data.oPlayerCtl.getEleRect();
      var local4 = this.getElePosition();
      var local5 = local4.y;
      if (local5 <= local2) {
        var local6 = local2 - local5;
        if (local6 > this.boxSize.height / 2 + this.boxOffset.y) {
          if (game.Data.oPlayerCtl._speedY <= 0) {
            this.collide(vee.Direction.Top);
          }
        } else if (local4.x > local3.x && local4.x < local3.x + local3.width) {
          if (local3.x + local3.width / 2 > local4.x) {
            this.collide(vee.Direction.Right);
          } else {
            this.collide(vee.Direction.Left);
          }
        }
      } else if (local4.x > local3.x && local4.x < local3.x + local3.width) {
        this.collide(vee.Direction.Bottom);
      }
    }
  },
  _hasDecay: true,
  checkDecay: function (arg0) {
    if (!this._hasDecay) {
      return;
    }
    if (this._accX > 0 && this._speedX < 0) {
      this._speedX += this._decayX * arg0;
      return;
    }
    if (this._accX < 0 && this._speedX > 0) {
      this._speedX -= this._decayX * arg0;
      return;
    }
    if (this._accX === 0 && this._speedX !== 0) {
      if (this._speedX > 0) {
        this._speedX -= this._decayX * arg0;
        if (this._speedX <= 0) {
          this._speedX = 0;
        }
      } else {
        this._speedX += this._decayX * arg0;
        if (this._speedX >= 0) {
          this._speedX = 0;
        }
      }
    }
  },
  inhaleController: null,
  getInhaleController: function () {
    if (this.inhaleController) {
      return null;
    }
    this.inhaleController = new InhaleObj();
    this.inhaleController.obj = this;
    return this.inhaleController;
  },
  getAte: function () {
    game.Data.oPlayerCtl.feed();
    this.die();
  },
  hitByStar: function (arg0) {
    if (this._isOver) {
      return;
    }
    this.dieAnimate(arg0);
  },
  _popPlayerHeightMax: 1500,
  _popPlayerHeight: 950,
  popPlayerUp: function () {
    var local0 = game.Data.oPlayerCtl;
    if (local0._isSmashing) {
      return;
    }
    local0._isFlying = false;
    if (!local0._isSmashing) {
      local0._isJumpLimitY = false;
      if (game.Data.isHoldJumpButtom) {
        local0._speedY = this._popPlayerHeightMax;
      } else {
        local0._speedY = this._popPlayerHeight;
      }
    }
    local0._speedX = 0;
  },
  defaultMoveLogic: function () {
    if (this._xLimit === null || this._speedX === 0) {
      return;
    }
    if (this._speedX > 0) {
      if (this.getElePosition().x > this._xLimit) {
        this.moveLeft();
        this._xLimit = null;
        this.onGridChanged();
        this.rightToBarrier();
      }
      return;
    }
    if (this.getElePosition().x < this._xLimit) {
      this.moveRight();
      this._xLimit = null;
      this.onGridChanged();
      this.leftToBarrier();
    }
  },
  getShock: function () {
    this.needRefreshPos = false;
  },
  resumeShock: function () {
    this.needRefreshPos = true;
  },
  isDashing: function () {
    return false;
  },
  onKill: function () {
    var local0 = game.AvatarData.getCurrentAvatar();
    if (local0 && local0.type === game.Roles.Vampire && vee.Utils.isLucky(0.33)) {
      game.Data.addLife();
    }
  },
  bornWithPos: function () {
  },
  AILogic: function () {
  },
  AILogicPerFrame: function () {
  },
  onDead: function () {
  },
  collide: function () {
  },
  afterUpdatePos: function () {
  }
});
Enemy.createWithInfo = function (arg0, arg1) {
    var local0 = game.Data.getEnemyFromPool(arg0.type);
    if (local0 && !arg1) {
      local0.controller.setFaceTo(arg0.dir, true);
      return {
        container: local0.controller._container,
        controller: local0.controller
      };
    }
    var local1 = null;
    switch (arg0.type) {
      case game.ObjectType.Slime:
        local1 = res.eleSLM_ccbi;
        break;
      case game.ObjectType.DogSlime:
        local1 = res.eleSLM_Dog_ccbi;
        break;
      case game.ObjectType.Cannon:
        local1 = res.eleLuoBo_ccbi;
        break;
      case game.ObjectType.Spider:
        local1 = res.eleSpider_ccbi;
        break;
      case game.ObjectType.ArmorSlime:
        local1 = res.eleSLM_Armor_ccbi;
        break;
      case game.ObjectType.ArmorSlimeHawk:
        local1 = res.eleSLM_Invisible_ccbi;
        break;
      case game.ObjectType.SusliksHawk:
        local1 = res.eleDiShu2_ccbi;
        break;
      case game.ObjectType.JumpSlime:
        local1 = res.enemyJumpSlime_ccbi;
        break;
      case game.ObjectType.JumpSlimeLink:
        local1 = res.enemyJumpSlime2_ccbi;
        break;
      case game.ObjectType.Moth:
        local1 = res.eleBat4_ccbi;
        break;
      case game.ObjectType.Bee:
        local1 = res.eleBat_ccbi;
        break;
      case game.ObjectType.FastBee:
        local1 = res.eleBat2_ccbi;
        break;
      case game.ObjectType.Fish:
        local1 = res.eleBat3_ccbi;
        break;
      case game.ObjectType.Flight:
        local1 = res.eleUFO_ccbi;
        break;
      case game.ObjectType.MadBee:
        local1 = res.eleBat_C_ccbi;
        break;
      case game.ObjectType.DrillDog:
        local1 = res.eleDrillDog_ccbi;
        break;
      case game.ObjectType.MapEater:
        local1 = res.eleMapEater_ccbi;
        break;
      case game.ObjectType.JumpFrog:
        local1 = res.enemyJumpSlime3_ccbi;
        break;
    }
    if (!local1) {
      return null;
    }
    local0 = cc.BuilderReader.load(local1);
    var local2 = cc.Node.create();
    local2.addChild(local0);
    local0.controller.setContainerNode(local2);
    local0.controller.setFaceTo(arg0.dir, true);
    if (local0.controller.inMapBack) {
      game.Data.oLyGame.lyMapBack.addChild(local2);
    } else {
      game.Data.oLyGame.lyMap.addChild(local2);
    }
    return {
      container: local2,
      controller: local0.controller
    };
  };
var EnemyMushroom = Enemy.extend({
  objType: game.ObjectType.Slime,
  _runAI: true,
  _onlyHor: false,
  _onlyVer: false,
  resetStatus: function () {
    this._hasCollide = true;
  },
  AILogic: function () {
    this._hasCollide = true;
    var local0 = game.Logic.configMap.getObject(this._grid);
    if (local0) {
      if (local0.first && local0.last) {
        this._hasG = false;
        this._checkPosFirst = game.Logic.getTilePosCenterByGrid(vee.Utils.pAdd(this._grid, local0.first));
        this._checkPosLast = game.Logic.getTilePosCenterByGrid(vee.Utils.pAdd(this._grid, local0.last));
        if (local0.first.y - local0.last.y === 0) {
          this._onlyHor = true;
          this._accY = 0;
        } else {
          this._hasG = false;
          this._accY = this._accYForSet;
          this._speedYLimit = this._speedYLimitForSet;
        }
        if (local0.first.x - local0.last.x === 0) {
          this._onlyVer = true;
          this._accX = 0;
          this._speedXLimit = 0;
        } else {
          this._accX = this._accXForSet;
          this._speedXLimit = this._speedXLimitForSet;
        }
        if (this._checkPosFirst.y < this._checkPosLast.y) {
          var local1 = this._checkPosFirst.y;
          this._checkPosFirst.y = this._checkPosLast.y;
          this._checkPosLast.y = local1;
        }
      }
      if (local0.dir === "right") {
        this.setFaceTo(vee.Direction.Right);
      } else {
        this.setFaceTo(vee.Direction.Left);
      }
    }
    if (this._faceTo === vee.Direction.Right) {
      this.moveRight();
    } else {
      this.moveLeft();
    }
    this.playAnimate("run");
  },
  count: 0,
  AILogicPerFrame: function () {
    if (this.count > 1) {
      this.count = 0;
      return;
    }
    this.count += 1;
    var local0 = this.getElePosition();
    if (this._checkPosFirst) {
      if (!this._onlyVer) {
        if (local0.x < this._checkPosFirst.x) {
          this._accX = this._accXForSet;
          this.setFaceTo(vee.Direction.Right);
        }
        if (local0.x > this._checkPosLast.x) {
          this._accX = -this._accXForSet;
          this.setFaceTo(vee.Direction.Left);
        }
      }
      if (!this._onlyHor) {
        if (local0.y > this._checkPosFirst.y) {
          this._accY = -this._accYForSet;
        }
        if (local0.y < this._checkPosLast.y) {
          this._accY = this._accYForSet;
        }
      }
    } else {
      this.defaultMoveLogic();
    }
    local0 = null;
  },
  leftToBarrier: function () {
    this.moveRight();
  },
  rightToBarrier: function () {
    this.moveLeft();
  },
  collide: function (arg0) {
    var local0 = game.Data.oPlayerCtl;
    if (local0._isBounce || !this._hasCollide) {
      return;
    }
    if (arg0 === vee.Direction.Top && !local0.extendController) {
      if (!game.Data.playerHawk) {
        this.popPlayerUp();
        this.dieAnimate(arg0);
      }
      return;
    }
    if (game.Data.playerHawk) {
      game.Data.oLyGame.shake();
      this.dieAnimate(arg0);
      return;
    }
    if (game.Data.playerInvisible || local0._isBounce) {
      return;
    }
    if (this.getElePosition().x > local0.getElePosition().x) {
      arg0 = vee.Direction.Left;
    } else {
      arg0 = vee.Direction.Right;
    }
    local0.getShock(arg0, true);
    this.setFaceTo(vee.Direction.revert(arg0));
    this.onGridChanged();
    if (this._faceTo === vee.Direction.Left) {
      this.moveLeft();
    } else {
      this.moveRight();
    }
  },
  dieAnimate: function () {
    this.onKill();
    var local0 = this.getElePosition();
    EfxEnemyDie.show(local0);
    this._hasCollide = false;
    this._isOver = true;
    this.die();
  }
});
var EnemyDogSlime = EnemyMushroom.extend({
  objType: game.ObjectType.DogSlime,
  _triggerObj: true,
  _runAI: true,
  _loopEfx: null,
  resetStatus: function () {
    this._dashing = false;
    this._isFindPlayer = false;
  },
  _dashing: false,
  isDashing: function () {
    return this._dashing;
  },
  findTarget: function (arg0) {
    vee.Audio.playEffect(res.inGame_monster_crazyFound_mp3);
    this._isFindPlayer = true;
    this._checkPosFirst = null;
    this._accX = 0;
    if (arg0) {
      this.playAnimate("get", arg0);
    } else {
      this.playAnimate("get");
    }
  },
  _findTargetCallback: null,
  findTargetWithDelay: function (arg0, arg1) {
    if (arg1) {
      this._findTargetCallback = arg1;
    }
    this._container.runAction(cc.sequence(
      cc.delayTime(arg0),
      cc.callFunc(function () {
        this.findTarget(this._findTargetCallback);
      }.bind(this))
    ));
  },
  dogDash: function () {
    this.playAnimate("eat");
    this._playerPos = game.Data.oPlayerCtl.getElePosition();
    this._speedXLimit = 600;
    this._dashing = true;
    if (this._faceTo === vee.Direction.Right) {
      this.moveRight();
    } else {
      this.moveLeft();
    }
  },
  _pos: null,
  _playerGrid: null,
  _playerPos: null,
  _isFindPlayer: false,
  AILogicPerFrame: function () {
    if (this._isOver) {
      return;
    }
    this._pos = this.getElePosition();
    this._playerGrid = game.Data.oPlayerCtl._grid;
    if (this._playerGrid.y === this._grid.y && (
      (this._faceTo === vee.Direction.Left &&
        this._grid.x - this._playerGrid.x <= 6 &&
        this._grid.x - this._playerGrid.x >= 0) ||
      (this._faceTo === vee.Direction.Right &&
        this._playerGrid.x - this._grid.x <= 6 &&
        this._playerGrid.x - this._grid.x >= 0)
    ) && !game.Data.oPlayerCtl._isBounce) {
      if (!this._isFindPlayer) {
        this.findTarget(function () {
          this.dogDash();
        }.bind(this));
      }
    } else if (!this._isFindPlayer) {
      this._dashing = false;
    }
    var local0 = this.getElePosition();
    if (this._checkPosFirst && !this._isFindPlayer) {
      if (!this._onlyVer) {
        if (local0.x < this._checkPosFirst.x) {
          this._accX = this._accXForSet;
          this.setFaceTo(vee.Direction.Right);
        }
        if (local0.x > this._checkPosLast.x) {
          this._accX = -this._accXForSet;
          this.setFaceTo(vee.Direction.Left);
        }
      }
      if (!this._onlyHor) {
        if (local0.y > this._checkPosFirst.y) {
          this._accY = -this._accYForSet;
        }
        if (local0.y < this._checkPosLast.y) {
          this._accY = this._accYForSet;
        }
      }
    } else {
      this.defaultMoveLogic();
    }
    local0 = null;
  },
  leftToBarrier: function () {
    this._hasG = true;
    var local0 = cc.p(this._grid.x - 1, this._grid.y);
    var local1 = game.Logic.map.getObject(local0);
    game.Logic.checkTileTrigger(local0, vee.Direction.Left, local1, this);
    game.Logic.triggerTileCallback(local1, this, vee.Direction.Left);
    if (!this._isOver) {
      if (this._dashing) {
        this._accX = 0;
        this._speedX = 200;
        this._speedY = 500;
      }
      this._dashing = false;
      this._isFindPlayer = false;
      this._speedXLimit = 100;
      this.playAnimate("run");
      this.moveRight();
    }
  },
  rightToBarrier: function () {
    this._hasG = true;
    var local0 = cc.p(this._grid.x + 1, this._grid.y);
    var local1 = game.Logic.map.getObject(local0);
    game.Logic.checkTileTrigger(local0, vee.Direction.Right, local1, this);
    game.Logic.triggerTileCallback(local1, this, vee.Direction.Right);
    if (!this._isOver) {
      if (this._dashing) {
        this._accX = 0;
        this._speedX = -200;
        this._speedY = 500;
      }
      this._dashing = false;
      this._isFindPlayer = false;
      this._speedXLimit = 100;
      this.playAnimate("run");
      this.moveLeft();
    }
  },
  downToBarrier: function (arg0) {
    if (!this._dashing) {
      this._speedXLimit = this._speedXLimitForSet;
    }
    this.pushedDir[vee.Direction.Bottom] = 1;
    this._speedY = 0;
    this._accY = 0;
    this.jumping = false;
    game.Logic.triggerTileCallback(arg0, this, vee.Direction.Bottom);
  },
  collide: function (arg0) {
    if (game.Data.oPlayerCtl._isBounce || this._isOver) {
      return;
    }
    if (arg0 === vee.Direction.Top && !game.Data.oPlayerCtl.extendController) {
      if (!game.Data.playerHawk) {
        this.popPlayerUp();
        this.dieAnimate(arg0);
      }
      return;
    }
    if (game.Data.playerHawk) {
      game.Data.oLyGame.shake();
      this.dieAnimate(arg0);
      return;
    }
    if (game.Data.playerInvisible) {
      return;
    }
    if (this.getElePosition().x > game.Data.oPlayerCtl.getElePosition().x) {
      arg0 = vee.Direction.Left;
    } else {
      arg0 = vee.Direction.Right;
    }
    game.Data.oPlayerCtl.getShock(arg0, true);
    this.onGridChanged();
  },
  onDead: function () {
  },
  moveToGrid: function (arg0, arg1) {
    Cinema.moveToGrid(this, arg0, arg1);
  }
});
