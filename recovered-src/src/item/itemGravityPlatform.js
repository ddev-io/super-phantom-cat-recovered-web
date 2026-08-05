var ItemGravityPlatform = ItemMovingPlatform.extend({
  _type: game.ObjectType.GravityPlatform,
  _isInit: false,
  nodePlatform: null,
  _w: null,
  _h: null,
  _posYLimit: null,
  _originPosY: null,

  bornWithPos: function (pos) {
    if (this._isInit) {
      return;
    }

    this._isInit = true;
    this._lastPos = pos;
    game.Data.registerUpdateObj(this);

    var configObj = game.Logic.configMap.getObject(this._grid);
    if (!configObj) {
      this._posYLimit = this._originPosY;
      this._checkPosWidth = this.boxSize.width / 2;
      return;
    }

    var limitGridY = parseInt(configObj.name) + this._grid.y;
    this._posYLimit = game.Logic.getTilePosCenterByGrid(cc.p(0, limitGridY)).y;

    var width = configObj.width || 3;
    var height = configObj.height || 0.5;

    this.nodeBox.setContentSize(cc.size(
      width * game.Data.tileSizeWidth,
      (height + 1) * game.Data.tileSizeWidth
    ));

    var platformSize = cc.size(
      width * game.Data.tileSizeWidth,
      height * game.Data.tileSizeWidth
    );

    this.resetBoxInfo();
    this._checkPosWidth = this.boxSize.width / 2;
    this._checkPosHeight = this.boxSize.height / 2;

    if (width !== this._w || height !== this._h) {
      this.nodePlatform.removeAllChildren();
      this._w = width;
      this._h = height;

      var startX = -TILE_WIDTH * width / 2 + TILE_WIDTH_HALF;
      var startY = -TILE_WIDTH * height / 2 + TILE_WIDTH_HALF;
      var spriteFile;

      if (game.LevelData.selectedCategory) {
        var categoryIdx = game.LevelData.selectedCategory.idx + 1;
        if (categoryIdx > 100) {
          categoryIdx -= 100;
        }

        spriteFile = "res/block_fall_" + categoryIdx + ".png";
        if (null === res["block_fall_" + categoryIdx + "_png"]) {
          spriteFile = "res/block_fall_1.png";
        }
      } else {
        spriteFile = "res/block_fall_1.png";
      }

      for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
          var sp = new cc.Sprite(spriteFile);
          sp.setPosition(cc.p(startX + x * TILE_WIDTH, startY + y * TILE_WIDTH));
          this.nodePlatform.addChild(sp);
        }
      }
    }

    this.resetBoxInfo();
    this._checkPosWidth = this.boxSize.width / 2;

    var offset = cc.p(
      platformSize.width / 2 - game.Data.tileSizeWidth / 2,
      platformSize.height / 2 - game.Data.tileSizeWidth / 2
    );

    var startPos = vee.Utils.pAdd(pos, offset);
    this.setElePosition(startPos);
    this._originPosY = startPos.y;
    this._posYLimit += offset.y;
    this._lastPos = pos;
  },

  _rectEnemy: null,

  updatePos: function (dt) {
    this._dt = dt;

    var player = game.Data.oPlayerCtl;
    var playerPos = player._pos;
    var platformPos = this.getElePosition();

    if (playerPos.x < platformPos.x - this._checkPosWidth ||
        playerPos.x > platformPos.x + this._checkPosWidth ||
        player._speedY > 0) {
      if (this._isGetPlayer) {
        player.jumpSign = false;
      }
      this._isGetPlayer = false;
      game.Data.removeGrabbedPlatform(this);
    } else if (this._isGetPlayer) {
      this.pushTo(vee.Direction.Top, playerPos, this.getEleRect(), player);
    } else {
      var nextSpeedY = player._speedY;
      var checkDt = 0.02;
      nextSpeedY += (player._accY + (player._jumpSpeedProtect ? 0 : game.Data.G)) * checkDt;

      if (player.isLimitY) {
        nextSpeedY = nextSpeedY < game.Data.playerYSpeedLimit ?
          game.Data.playerYSpeedLimit :
          nextSpeedY;
      }

      var nextY = playerPos.y + nextSpeedY * checkDt;
      var checkLine = this.getCheckLine(platformPos.y);
      var lastCheckLine = this.getCheckLine(this._lastPos.y);

      if (player._speedY <= 0 &&
          ((nextY <= checkLine && playerPos.y >= checkLine) ||
           (nextY <= lastCheckLine && playerPos.y >= lastCheckLine))) {
        this._isGetPlayer = true;
        game.Data.addGrabbedPlatform(this);
        player.downToBarrier();
        player.setJumping(false);
        player._speedY = 0;
        player.jumpSign = true;
        this.pushTo(vee.Direction.Top, playerPos, this.getEleRect(), player);
      } else {
        this._isGetPlayer = false;
        player.jumpSign = false;
        game.Data.removeGrabbedPlatform(this);
      }
    }

    this._lastPos = platformPos;
    this.afterUpdate(dt);
  },

  pushTo: function (dir, pos, rect, player) {
    if (player._isSmashing) {
      player._speedY = 0;
    }

    player.isUpdateY = false;
    player.needUpdateState = false;
    player.updateState();

    var posOff = this.getPosOff();
    player.setElePosition(cc.p(pos.x + posOff.x, rect.y + rect.height));
    this.playerOnTop();
  },

  _castPosY: 0,
  _pushed: false,

  playerOnTop: function () {
    if (this._pushed) {
      return;
    }

    this._castPosY = this._container.getPositionY() - 200 * this._dt;
    this._castPosY = this._castPosY < this._posYLimit ? this._posYLimit : this._castPosY;
    this._container.setPositionY(this._castPosY);
    this._pos.y = this._castPosY;
    this._pushed = true;
  },

  afterUpdate: function () {
    if (this._pushed) {
      this._pushed = false;
      return;
    }

    this._castPosY = this._container.getPositionY() + 300 * this._dt;
    this._castPosY = this._castPosY > this._originPosY ? this._originPosY : this._castPosY;
    this._container.setPositionY(this._castPosY);
    this._pos.y = this._castPosY;
  },

  removeOnGridChange: function () {
    game.Data.removeUpdateObj(this);
  },

  die: function () {
    game.Data.removeUpdateObj(this);
    this.onDead();

    if (this._gridInMap) {
      if (!this._staticItem) {
        game.Logic.dynamicObjMap.setObject(null, this._gridInMap);
      } else {
        game.Logic.objMap.setObject(null, this._gridInMap);
      }
    }

    this._container.removeFromParent();
  }
});
