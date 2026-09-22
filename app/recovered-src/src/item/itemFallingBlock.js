var ItemFallingBlock = ItemGravityPlatform.extend({
  _type: game.ObjectType.FallingBlock,
  _dangerCloseBottom: null,
  _dangerCloseTop: null,
  _moveDirH: null,
  _moveDirV: null,
  _createByPlatform: false,
  _isInit: false,

  bornWithPos: function (pos) {
    if (this._isInit) {
      return;
    }

    this._isInit = true;

    var configObj = game.Logic.configMap.getObject(this._grid);
    var width = configObj.width || 3;
    var height = configObj.height || 0.5;

    this.nodeBox.setContentSize(cc.size(
      (width + 1) * game.Data.tileSizeWidth,
      (height + 1) * game.Data.tileSizeWidth
    ));

    var blockSize = cc.size(
      width * game.Data.tileSizeWidth,
      height * game.Data.tileSizeWidth
    );

    this.spPlatform.setContentSize(blockSize);
    this.resetBoxInfo();
    this._checkPosWidth = this.boxSize.width / 2;

    var offset = cc.p(
      blockSize.width / 2 - game.Data.tileSizeWidth / 2,
      blockSize.height / 2 - game.Data.tileSizeWidth / 2
    );

    var startPos = vee.Utils.pAdd(pos, offset);
    this._container.setPosition(startPos);

    var route = configObj.name.split(";");
    var targetGrid = game.Data.getPointFromString1(route[0]);
    targetGrid = vee.Utils.pAdd(targetGrid, this._grid);

    var targetPos = game.Logic.getTilePosCenterByGrid(targetGrid);
    targetPos = vee.Utils.pAdd(targetPos, offset);

    var lastGrid = targetGrid;
    if (!this._createByPlatform) {
      for (var i = 1, count = route.length; i < count; i++) {
        var linkedGrid = game.Data.getPointFromString1(route[i]);
        linkedGrid = vee.Utils.pAdd(lastGrid, linkedGrid);
        game.Logic.createItemByGrid(linkedGrid, true);
        lastGrid = cc.p(linkedGrid.x, linkedGrid.y);
      }
    }

    var moveOff = vee.Utils.pSub(targetPos, startPos);
    var shakeOffX = 0;
    if (moveOff.x > 0) {
      shakeOffX = -10;
    } else if (moveOff.x < 0) {
      shakeOffX = 10;
    }

    var shakeOffY = 0;
    if (moveOff.y > 0) {
      shakeOffY = -10;
    } else if (moveOff.y < 0) {
      shakeOffY = 10;
    }

    this._moveDirH = moveOff.x > 0 ? vee.Direction.Right : vee.Direction.Left;
    this._moveDirV = moveOff.y > 0 ? vee.Direction.Top : vee.Direction.Bottom;

    var duration = vee.Utils.distanceBetweenPoints(targetPos, startPos) / 100;

    this._container.runAction(cc.repeat(cc.sequence(
      cc.EaseIn.create(cc.moveTo(duration, targetPos), 6),
      cc.callFunc(function () {
        this._moveDirH = vee.Direction.revert(this._moveDirH);
        this._moveDirV = vee.Direction.revert(this._moveDirV);
      }.bind(this)),
      cc.moveTo(0.04, cc.p(targetPos.x + shakeOffX, targetPos.y + shakeOffY)),
      cc.moveTo(0.04, targetPos),
      cc.moveTo(0.02, cc.p(targetPos.x + shakeOffX, targetPos.y + shakeOffY)),
      cc.moveTo(0.02, targetPos),
      cc.delayTime(0.6),
      cc.moveTo(duration * 1.3, startPos),
      cc.delayTime(1),
      cc.callFunc(function () {
        this._moveDirH = vee.Direction.revert(this._moveDirH);
        this._moveDirV = vee.Direction.revert(this._moveDirV);
      }.bind(this))
    ), 9999));

    vee.Utils.scheduleCallbackForTarget(this.rootNode, this.updatePos.bind(this));
  },

  updatePos: function (dt) {
    this._dt = dt;

    var playerPos = game.Data.oPlayerCtl.getElePosition();
    var blockPos = this.getElePosition();

    if (playerPos.x < blockPos.x - this._checkPosWidth ||
        playerPos.x > blockPos.x + this._checkPosWidth) {
      this._lastPos = blockPos;
      this.afterUpdate(dt);
      return;
    }

    var blockRect = this.getEleRect();
    var playerLastPos = game.Data.oPlayerCtl._lastPosition;

    if (cc.rectContainsPoint(blockRect, playerPos)) {
      if (playerLastPos.y >= blockRect.y + blockRect.height) {
        this.pushTo(vee.Direction.Top, playerPos, blockRect, game.Data.oPlayerCtl);
      } else if (playerLastPos.y <= blockRect.y) {
        this.pushTo(vee.Direction.Bottom, playerPos, blockRect, game.Data.oPlayerCtl);
      } else if (playerLastPos.x <= blockRect.x) {
        this.pushTo(vee.Direction.Left, playerPos, blockRect, game.Data.oPlayerCtl);
      } else if (playerLastPos.x >= blockRect.x + blockRect.width) {
        this.pushTo(vee.Direction.Right, playerPos, blockRect, game.Data.oPlayerCtl);
      } else if (!this._tempDir) {
        if (playerPos.x < blockRect.x + 10) {
          this.pushTo(vee.Direction.Left, playerPos, blockRect, game.Data.oPlayerCtl);
        } else if (playerPos.x > blockRect.x + blockRect.width - 10) {
          this.pushTo(vee.Direction.Right, playerPos, blockRect, game.Data.oPlayerCtl);
        } else if (playerPos.y > blockRect.y + blockRect.height / 2) {
          this.pushTo(vee.Direction.Top, playerPos, blockRect, game.Data.oPlayerCtl);
        } else {
          this.pushTo(vee.Direction.Bottom, playerPos, blockRect, game.Data.oPlayerCtl);
        }
      } else {
        this.pushTo(this._tempDir, playerPos, blockRect, game.Data.oPlayerCtl);
      }
    } else {
      this._tempDir = null;
    }

    this._lastPos = blockPos;
    this.afterUpdate(dt);
  },

  _rectEnemy: null,
  _posEnemy: null,

  checkEleCollide: function (enemy) {
    if (!enemy) {
      return;
    }

    enemy.squeezingDir = null;

    var enemyPos = enemy.getElePosition();
    if (enemyPos.x < this._posEnemy.x - this._checkPosWidth ||
        enemyPos.x > this._posEnemy.x + this._checkPosWidth) {
      return;
    }

    if (cc.rectContainsPoint(this._rectEnemy, enemyPos)) {
      if (enemyPos.y >= this._rectEnemy.y + this._rectEnemy.height) {
        this.pushTo(vee.Direction.Top, enemyPos, this._rectEnemy, enemy);
      } else if (enemyPos.y <= this._rectEnemy.y) {
        this.pushTo(vee.Direction.Bottom, enemyPos, this._rectEnemy, enemy);
      } else if (enemyPos.x <= this._rectEnemy.x) {
        this.pushTo(vee.Direction.Left, enemyPos, this._rectEnemy, enemy);
      } else if (enemyPos.x >= this._rectEnemy.x + this._rectEnemy.width) {
        this.pushTo(vee.Direction.Right, enemyPos, this._rectEnemy, enemy);
      } else if (enemyPos.x < this._rectEnemy.x + 10) {
        this.pushTo(vee.Direction.Left, enemyPos, this._rectEnemy, enemy);
      } else if (enemyPos.x > this._rectEnemy.x + this._rectEnemy.width - 10) {
        this.pushTo(vee.Direction.Right, enemyPos, this._rectEnemy, enemy);
      } else if (enemyPos.y > this._rectEnemy.y + this._rectEnemy.height / 2) {
        this.pushTo(vee.Direction.Top, enemyPos, this._rectEnemy, enemy);
      } else {
        this.pushTo(vee.Direction.Bottom, enemyPos, this._rectEnemy, enemy);
      }
    }
  },

  pushTo: function (dir, pos, rect, ele) {
    if (!dir || !ele) {
      return;
    }

    switch (dir) {
      case vee.Direction.Top:
        ele.downToBarrier();
        ele.needUpdateState = false;
        ele.setJumping(false);
        ele.updateState();
        this.playerOnTop();

        var posOff = this.getPosOff();
        if (!ele.squeeze(vee.Direction.Bottom)) {
          ele.setElePosition(cc.p(pos.x + posOff.x, rect.y + rect.height - 5));
        }
        break;

      case vee.Direction.Bottom:
        ele.upToBarrier();
        ele.stopRunning();
        if (this._moveDirV === vee.Direction.Bottom && !ele.squeeze(vee.Direction.Top)) {
          ele.setElePosition(cc.p(pos.x, rect.y - 10));
        }
        break;

      case vee.Direction.Left:
        ele.rightToBarrier();
        ele.stopRunning();
        if (!ele.squeeze(vee.Direction.Right)) {
          ele.setElePosition(cc.p(rect.x, pos.y));
        }
        break;

      case vee.Direction.Right:
        ele.leftToBarrier();
        ele.stopRunning();
        if (!ele.squeeze(vee.Direction.Left)) {
          ele.setElePosition(cc.p(rect.x + rect.width, pos.y));
        }
        break;
    }

    this._tempDir = dir;
  },

  playerOnTop: function () {
  },

  afterUpdate: function () {
  },

  die: function () {
  }
});
