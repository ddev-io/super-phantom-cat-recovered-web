var ItemMovingPlatform = Item.extend({
  _type: game.ObjectType.MovingPlatform,
  _checkPosWidth: 0,
  _checkPosHeight: 0,
  nodePlatform: null,
  _createByPlatform: false,
  _createMapPointAndPlatform: true,
  _backToOrigin: false,
  _w: null,
  _h: null,
  _startPos: null,

  bornWithPos: function (pos) {
    this._lastPos = pos;
    this._container.stopAllActions();
    game.Data.registerUpdateObj(this);

    var configObj = game.Logic.configMap.getObject(this._gridInMap);
    if (!configObj) {
      this.errorInInit();
      return;
    }

    var path = configObj.name.split(";");
    for (var i = 0; i < 2; i++) {
      var lastPath = path[path.length - 1];
      var lastPathParts = lastPath.split(",");
      if (lastPathParts.length === 1) {
        if (lastPathParts[0] === "X") {
          this._createMapPointAndPlatform = false;
          path.pop();
        } else if (lastPathParts[0] === "R") {
          this._backToOrigin = true;
          path.pop();
        }
      }
    }

    var width = configObj.width || 3;
    var height = configObj.height || 1;

    this.nodeBox.setContentSize(cc.size(
      width * game.Data.tileSizeWidth,
      (height + 1) * game.Data.tileSizeWidth
    ));

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

        spriteFile = "res/block_move_" + categoryIdx + ".png";
        if (null === res["block_move_" + categoryIdx + "_png"]) {
          spriteFile = "res/block_move_1.png";
        }
      } else {
        spriteFile = "res/block_move_1.png";
      }

      for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
          var sp = new cc.Sprite(spriteFile);
          sp.setPosition(cc.p(startX + x * TILE_WIDTH, startY + y * TILE_WIDTH));
          this.nodePlatform.addChild(sp);
        }
      }
    }

    var platformSize = cc.size(
      width * game.Data.tileSizeWidth,
      height * game.Data.tileSizeWidth
    );

    this.resetBoxInfo();
    this._checkPosWidth = this.boxSize.width / 2;
    this._checkPosHeight = this.boxSize.height / 2;

    var offset = cc.p(
      platformSize.width / 2 - game.Data.tileSizeWidth / 2,
      platformSize.height / 2 - game.Data.tileSizeWidth / 2
    );

    var startPos = vee.Utils.pAdd(pos, offset);
    this.setElePosition(startPos);
    this._startPos = startPos;

    var actions = [];
    var reversePoints = [];
    var fromPos = startPos;
    var toPos = null;
    var baseGrid = cc.p(this._gridInMap.x, this._gridInMap.y);

    for (var pathIdx = 0, pathCount = path.length; pathIdx < pathCount; pathIdx++) {
      var pathPoint = game.Data.getPointFromString1(path[pathIdx]);
      pathPoint = vee.Utils.pAdd(baseGrid, pathPoint);

      var linkedPlatformCreated = false;
      var mapExObj = game.Logic.mapex.getObject(pathPoint);
      if (!this._createByPlatform && mapExObj && !game.Logic.isGridSame(pathPoint, this._gridInMap)) {
        if (mapExObj.gid === game.BlockType.MovingPlatform) {
          cc.log("platform : creating linked platform at: " + pathPoint.x + ", " + pathPoint.y);
          game.Logic.createItemByGrid(pathPoint, true);
          linkedPlatformCreated = true;
        }
      }

      if ((this._createMapPointAndPlatform || !linkedPlatformCreated) && this.shouldCreateMapPoint(pathPoint)) {
        cc.log("platform : creating path at: " + pathPoint.x + ", " + pathPoint.y);
        toPos = vee.Utils.pAdd(game.Logic.getTilePosCenterByGrid(pathPoint), offset);
        actions.push(cc.moveTo(
          vee.Utils.distanceBetweenPoints(fromPos, toPos) / 100,
          toPos
        ));
        reversePoints.push(cc.p(toPos.x, toPos.y));
        fromPos = toPos;
      }

      baseGrid = pathPoint;
    }

    if (this._backToOrigin) {
      actions.push(cc.callFunc(function () {
        this.setElePosition(this._startPos);
        if (this._isGetPlayer) {
          this._isGetPlayer = false;
          game.Data.oPlayerCtl.jumpSign = false;
        }
        game.Data.removeGrabbedPlatform(this);
      }.bind(this)));
    } else if (!game.Logic.isGridSame(pathPoint, this._gridInMap)) {
      reversePoints = reversePoints.reverse();
      reversePoints.push(cc.p(startPos.x, startPos.y));
      reversePoints.shift();

      for (var reverseIdx = 0, reverseCount = reversePoints.length; reverseIdx < reverseCount; reverseIdx++) {
        toPos = reversePoints[reverseIdx];
        actions.push(cc.moveTo(
          vee.Utils.distanceBetweenPoints(fromPos, toPos) / 100,
          toPos
        ));
        fromPos = toPos;
      }
    }

    this._container.runAction(cc.repeat(cc.sequence(actions), 9999));
  },

  errorInInit: function () {
    cc.log("error in init item moving platform!");
    this._container.removeFromParent();
  },

  shouldCreateMapPoint: function (grid) {
    if (game.Logic.isGridSame(grid, this._gridInMap)) {
      return true;
    }

    var configObj = game.Logic.configMap.getObject(grid);
    if (!configObj) {
      return true;
    }

    if (!this._createMapPointAndPlatform) {
      return false;
    }

    var path = configObj.name.split(";");
    var lastPath = path[path.length - 1];
    var lastPathParts = lastPath.split(",");
    return lastPathParts.length !== 1;
  },

  _lastPos: null,
  _dt: null,
  _isGetPlayer: false,

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

  getPosOff: function () {
    return vee.Utils.pSub(this._container.getPosition(), this._lastPos);
  },

  getCheckLine: function (y) {
    return y + this._checkPosHeight;
  },

  playerOnTop: function () {
  },

  afterUpdate: function () {
  },

  getInhaleController: function () {
    return null;
  },

  die: function () {
    game.Data.removeUpdateObj(this);
  }
});
