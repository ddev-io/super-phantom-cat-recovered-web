function _enemyGetSideAgainstPlayer(obj) {
  return obj.getElePosition().x > game.Data.oPlayerCtl.getElePosition().x ? vee.Direction.Left : vee.Direction.Right;
}

var EnemyJumpSlime = Enemy.extend({
  objType: game.ObjectType.JumpSlime,
  linkedSlime: null,
  hasLinkedSlime: false,
  jumpCount: 0,
  slimeSign: "slime parent ",
  _lastJumpPos: null,
  initGrid: null,
  limitLeft: null,
  limitRight: null,
  isSlimeJumping: false,
  _jumpWidth: 3,
  _deep: 4,

  _alignWithJumpSurface: function (pos) {
    if (!pos || !game.Logic || !game.Logic.map) {
      return pos;
    }
    var hasG = this._hasG;
    var aligned = this.safeEnemyPos(pos);
    this._hasG = hasG;
    return aligned || pos;
  },

  bornWithPos: function (pos) {
    var elePos = this._alignWithJumpSurface(cc.p(pos.x, pos.y - TILE_WIDTH_HALF - this.boxSize.height / 2));
    this.setElePosition(elePos);
    this._container.stopAllActions();
    this.playAnimate("huxi");
    this._hasCollide = true;
    this._hasG = false;
    this._needSafePos = false;
    this.needRefreshPos = false;

    var cfg = game.Logic.configMap.getObject(this._grid);
    var needLink = true;
    if (cfg) {
      if (cfg.slimeCount === "1") {
        needLink = false;
      }
      var data = cfg.name ? cfg.name.split(",") : [];
      if (data.length > 0) {
        this.limitLeft = this._grid.x + parseInt(data[0], 10);
      }
      if (data.length > 1) {
        this.limitRight = this._grid.x + parseInt(data[1], 10);
      }
      if (data.length > 2 && data[2] === "right") {
        this._faceTo = vee.Direction.Right;
        this._container.setScaleX(1);
      }
    }

    if (this.objType === game.ObjectType.JumpFrog) {
      cc.log("asdfasdfasdfasdfasdfasdf");
      needLink = false;
    }

    if (!this.linkedSlime && needLink) {
      this.initGrid = cc.p(this._grid.x, this._grid.y);
      var childNode = Enemy.createWithInfo({ type: game.ObjectType.JumpSlimeLink, dir: vee.Direction.Left });
      var child = childNode.controller;
      child.objType = game.ObjectType.JumpSlimeLink;
      child.linkedSlime = this;
      child.hasLinkedSlime = true;
      child.limitLeft = this.limitLeft;
      child.limitRight = this.limitRight;
      this.linkedSlime = child;
      this.hasLinkedSlime = true;

      var childGrid = game.Logic.getTileGridByPos(pos);
      childGrid.y--;
      var childPos = game.Logic.getTilePosByGrid(childGrid);
      child._grid = childGrid;
      child.initGrid = cc.p(childGrid.x, childGrid.y);
      child.initPosition(cc.p(childPos.x, elePos.y + this.boxSize.height / 2 + TILE_WIDTH));
      child.slimeSign = "slime child ";
      game.Logic.dynamicObjMap.setObject(child, childGrid);
      game.Data.usingEnemyPool.push(child);
      child.afterCreate();
      child.jumpCount = 1;
      child.slimeJump();
    } else if (needLink === false) {
      this.slimeJump();
    }
  },

  slimeJump: function () {
    var target;
    if (!this.linkedSlime) {
      target = this.getTargetPoint();
      this.jumpTo(target);
      this.isSlimeJumping = true;
    } else if (this.jumpCount > 0) {
      target = this.getTargetPoint();
      this.jumpTo(target);
      this.jumpCount--;
      cc.log(this.slimeSign + vee.Direction.direction2String(this._faceTo));
      this.isSlimeJumping = true;
    } else {
      this.linkedSlime.jumpCount = 2;
      this.linkedSlime.slimeJump();
      this.isSlimeJumping = false;
    }
  },

  jumpTo: function (target) {
    if (!target) {
      return;
    }
    if (!this.linkedSlime && this.hasLinkedSlime) {
      this.hasLinkedSlime = false;
    }
    var targetGrid = game.Logic.getTileGridByPos(target);
    var gridDX = targetGrid.x - this._grid.x;
    if (gridDX > 0) {
      this._container.setScaleX(1);
    } else {
      this._container.setScaleX(-1);
    }
    this._faceTo = gridDX > 0 ? vee.Direction.Right : vee.Direction.Left;
    this.playAnimate("jump_up");
    if (!this._isOver) {
      vee.Audio.playEffect(res.inGame_action_jump_mp3);
    }
    this._container.runAction(cc.sequence(
      cc.spawn(
        cc.EaseInOut.create(
          cc.jumpTo(0.7, target.x, target.y, Math.abs(gridDX) * game.Data.tileSizeWidth, 1),
          EnemyJumpSlime.jumpEase
        ),
        cc.sequence(
          cc.delayTime(0.2),
          cc.callFunc(function () {
            if (this.linkedSlime) {
              this.linkedSlime._container.setScaleX(this._container.getScaleX());
            }
          }.bind(this))
        )
      ),
      cc.callFunc(function () {
        this.playAnimate("jump_down");
        if (!this.linkedSlime && this.hasLinkedSlime) {
          this.hasLinkedSlime = false;
          this._container.runAction(cc.moveBy(0.3, cc.p(0, -this.boxSize.height)));
        }
      }.bind(this)),
      cc.delayTime(0.6),
      cc.callFunc(function () {
        this.setElePosition(this._container.getPosition());
        this.onGridChanged();
        this.slimeJump();
      }.bind(this))
    ));
    this._lastJumpPos = this.getElePosition();
  },

  getTargetPoint: function () {
    var target = null;
    if (this.limitLeft && this._faceTo === vee.Direction.Left) {
      if (this._grid.x - (this._jumpWidth - 1) >= this.limitLeft) {
        target = this.searchTargetPoint(this._faceTo);
      }
    } else if (this.limitRight) {
      if (this._grid.x + (this._jumpWidth - 1) <= this.limitRight) {
        target = this.searchTargetPoint(this._faceTo);
      }
    } else {
      target = this.searchTargetPoint(this._faceTo);
    }

    if (!target) {
      this._faceTo = vee.Direction.revert(this._faceTo);
      target = this.searchTargetPoint(this._faceTo);
      if (!target) {
        target = this._lastJumpPos;
      }
    }
    return target;
  },

  searchTargetPoint: function () {
    if (this.jumpCount > 1 && this.linkedSlime) {
      var linkedPos = this.linkedSlime.getElePosition();
      return cc.p(linkedPos.x, linkedPos.y + this.boxSize.height + 2);
    }

    var result = null;
    var startGrid = cc.p(this._grid.x, this._grid.y);
    var sign = this._faceTo === vee.Direction.Left ? -1 : 1;
    var step = sign;
    while (Math.abs(step) < this._jumpWidth) {
      var checkGrid = cc.p(startGrid.x + step, startGrid.y);
      var obj = game.Logic.map.getObject(checkGrid);
      if (game.Logic.isBlock(obj)) {
        break;
      }
      result = cc.p(startGrid.x + step, startGrid.y);
      step += sign;
    }

    if (!result) {
      return null;
    }

    startGrid = cc.p(result.x, result.y);
    for (var depth = 1; depth < EnemyJumpSlime.deep; depth++) {
      var downGrid = cc.p(startGrid.x, startGrid.y + depth);
      var downObj = game.Logic.map.getObject(downGrid);
      if (downObj && downObj.tileInfo && downObj.tileInfo.type === game.ObjectType.BlockHurt) {
        return null;
      }
      if (game.Logic.isBlock(downObj)) {
        var finalGrid = cc.p(startGrid.x, startGrid.y + depth - 1);
        var finalPos = game.Logic.getTilePosCenterByGrid(finalGrid);
        finalPos.y -= TILE_WIDTH_HALF - this.boxSize.height / 2;
        return this._alignWithJumpSurface(finalPos);
      }
    }
    return null;
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

  die: function () {
    this.onDead();
    this._container.stopAllActions();
    this._isOver = true;
    game.Data.removeUsingEnemy(this);
    this.inhaleController = null;

    if (this.linkedSlime) {
      var linked = this.linkedSlime;
      if (this._gridInMap) {
        game.Logic.dynamicObjMap.setObject(null, linked.initGrid);
        game.Logic.dynamicObjMap.setObject(linked, this.initGrid);
        linked._gridInMap = cc.p(this._gridInMap.x, this._gridInMap.y);
      } else {
        game.Logic.dynamicObjMap.setObject(null, this.initGrid);
      }
      if (!linked.isSlimeJumping) {
        linked.slimeJump();
      }
      if (linked.jumpCount === 0) {
        linked.hasLinkedSlime = false;
      }
      linked.linkedSlime = null;
      this.linkedSlime = null;
    } else if (this._gridInMap) {
      game.Logic.dynamicObjMap.removeObject(this._gridInMap);
    }

    this.rootNode.setVisible(false);
    this._speedX = 0;
    this._speedY = 0;
    this._accX = 0;
    this._accY = 0;
    this._checkPosFirst = null;
    this._checkPosLast = null;
    this._container.removeFromParent();
  },

  dieAnimate: function () {
    this.onKill();
    this._container.stopAllActions();
    EfxEnemyDie.show(this.getElePosition());
    this._hasCollide = false;
    this._isOver = true;
    this.die();
  }
});

EnemyJumpSlime.jumpEase = 0.8;
EnemyJumpSlime.deep = 4;

var EnemyJumpFrog = EnemyJumpSlime.extend({
  objType: game.ObjectType.JumpFrog
});
