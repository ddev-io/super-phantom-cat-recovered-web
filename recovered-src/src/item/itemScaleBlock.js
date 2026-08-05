var ItemScaleBlock = Item.extend({
  _type: game.ObjectType.ScaleBlock,
  ccbInit: function () {
    game.Data.registerUpdateObj(this);
    this.nodeRect = this.nodeBox;
    this.updateBoxData();
  },
  showScaleAnimate: function (aniName, callback) {
    this.playAnimate(aniName, function () {
      if (callback) {
        callback();
      }
      this.die();
    }.bind(this));
  },
  onPlayerStepOn: function () {
  },
  onDead: function () {
    game.Data.removeUpdateObj(this);
  },
  updatePos: function () {
    this.updateBoxData();
    this._rectEnemy = this.getEleRect();
    this.checkEleCollide(game.Data.oPlayerCtl);
  },
  updateBoxData: function () {
    this.boxOffset = this.nodeRect.getPosition();
    this.boxSize = this.nodeRect.getContentSize();
    this.boxSizeHalf = cc.size(this.boxSize.width / 2, this.boxSize.height / 2);
    this.playerSize = game.Data.oPlayerCtl.boxSize;
    this.playerSizeHalf = cc.size(this.playerSize.width / 2, this.playerSize.height / 2);
  },
  getEleRect: function () {
    var scaleX = this.nodeRect.getScaleX();
    var x = this.boxOffset.x - this.boxSizeHalf.width * scaleX - this.playerSizeHalf.width;
    var scaleY = this.nodeRect.getScaleY();
    var y = this.boxOffset.y - this.boxSizeHalf.height * scaleY - this.playerSizeHalf.height;
    var pos = this.getElePosition();
    x += pos.x;
    y += pos.y;
    var width = this.boxSize.width * scaleX + this.playerSize.width;
    var height = this.boxSize.height * scaleY + this.playerSize.height;
    return cc.rect(x, y, width, height);
  },
  checkEleCollide: function (player) {
    var nextPos = player.getNextCastPos();
    if (cc.rectContainsPoint(this._rectEnemy, nextPos)) {
      var playerPos = player._pos;

      if (playerPos.y >= this._rectEnemy.y + this._rectEnemy.height) {
        if (player._speedY <= 0) {
          this.pushTo(vee.Direction.Top, playerPos, this._rectEnemy, player);
        }
      } else if (playerPos.y <= this._rectEnemy.y) {
        this.pushTo(vee.Direction.Bottom, playerPos, this._rectEnemy, player);
      } else if (playerPos.x <= this._rectEnemy.x) {
        this.pushTo(vee.Direction.Left, playerPos, this._rectEnemy, player);
      } else if (playerPos.x >= this._rectEnemy.x + this._rectEnemy.width) {
        this.pushTo(vee.Direction.Right, playerPos, this._rectEnemy, player);
      } else {
        var blockPos = vee.Utils.pAdd(this.getElePosition(), this.boxOffset);
        var dir = this.getFarthestDir(blockPos, playerPos);
        this.pushTo(dir, playerPos, this._rectEnemy, player);
      }
    }
  },
  getFarthestDir: function (blockPos, playerPos) {
    var offset = vee.Utils.pSub(blockPos, playerPos);
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      return offset.x > 0 ? vee.Direction.Left : vee.Direction.Right;
    }
    return offset.y > 0 ? vee.Direction.Bottom : vee.Direction.Top;
  },
  pushTo: function (dir, playerPos, rect, player) {
    if (!dir) {
      return;
    }

    switch (dir) {
      case vee.Direction.Top:
        player.downToBarrier();
        player.setJumping(false);
        player.isUpdateY = false;
        player.updateState();
        player.setElePosition(cc.p(playerPos.x, rect.y + rect.height));
        break;
      case vee.Direction.Bottom:
        player.setElePosition(cc.p(playerPos.x, rect.y - 5));
        player.upToBarrier();
        break;
      case vee.Direction.Left:
        player.setElePosition(cc.p(rect.x, playerPos.y));
        player.rightToBarrier();
        player.stopRunning();
        break;
      case vee.Direction.Right:
        player.setElePosition(cc.p(rect.x + rect.width, playerPos.y));
        player.leftToBarrier();
        player.stopRunning();
        break;
    }

    if (this.onPlayerStepOn) {
      this.onPlayerStepOn(dir);
    }
  }
});

ItemScaleBlock.show = function (grid, dir, scaleUp, callback) {
    var item = Item.createWithInfo(game.TileInfo.TileItemScaleBlock, grid);
    item.controller.ccbInit();

    var pos = game.Logic.getTilePosCenterByGrid(grid);
    item.controller.initPosition(pos);

    var aniName = vee.Direction.direction2String(dir);
    aniName += scaleUp ? "_scaleup" : "_scaledown";
    item.controller.showScaleAnimate(aniName, callback);
  };
