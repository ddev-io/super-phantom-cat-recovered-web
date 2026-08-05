var ItemDrawer = Item.extend({
  _type: game.ObjectType.Drawer,
  _drawerDir: null,
  _drawerDirNum: null,
  inMapBack: true,
  spDrawer: null,

  onCreate: function () {
    this.resetBoxInfo();
    this.afterCreate();
  },

  bornWithPos: function () {
    game.Data.registerUpdateObj(this);

    var configObj = game.Logic.configMap.getObject(this._gridInMap);
    var faceDir = null;

    if (configObj) {
      faceDir = vee.Direction.string2Direction(configObj.name);
    } else {
      var dirs = this.getDirArr();
      for (var i in dirs) {
        var dir = dirs[i];
        var grid = game.Logic.map.getObject(vee.Utils.pAdd(this._gridInMap, vee.Direction.direction2Point(dir)));
        if (game.Logic.isBlock(grid)) {
          faceDir = dir;
        }
      }
    }

    faceDir = faceDir || vee.Direction.Left;
    this._drawerDir = vee.Direction.revert(faceDir);
    this.setFaceTo(faceDir);
    this._drawerDirNum = -vee.Direction.direction2Point(faceDir).x;

    this.setElePosition(cc.p(this._pos.x - this._drawerDirNum * TILE_WIDTH_HALF, this._pos.y));
    this.nodeBox.setContentSize(cc.size(this.boxSize.width + TILE_WIDTH_HALF, this.boxSize.height + TILE_WIDTH));
    this.resetBoxInfo();
    this.playAnimate("out");
  },

  getEleRect: function () {
    var pos = this.getElePosition();
    var scaleX = this.spDrawer.getScaleX();
    var x = this._drawerDirNum > 0 ? 0 : (this.boxOffset.x - this.boxSize.width) * scaleX;
    var width = this.boxSize.width * scaleX;

    return cc.rect(
      pos.x + x,
      pos.y + this.boxOffset.y - this.boxSize.height / 2,
      width,
      this.boxSize.height
    );
  },

  updatePos: function () {
    this._rectEnemy = this.getEleRect();
    this.checkEleCollide(game.Data.oPlayerCtl);
    this._lastPos = vee.Utils.pAdd(this._pos, this.nodeBox.getPosition());
  },

  checkEleCollide: function (ele) {
    var nextPos = ele.getNextCastPos();
    if (!cc.rectContainsPoint(this._rectEnemy, nextPos)) {
      return;
    }

    var pos = ele._pos;
    if (pos.y >= this._rectEnemy.y + this._rectEnemy.height) {
      if (ele._speedY <= 0) {
        this.pushTo(vee.Direction.Top, pos, this._rectEnemy, ele);
      }
      return;
    }

    if (pos.y <= this._rectEnemy.y) {
      this.pushTo(vee.Direction.Bottom, pos, this._rectEnemy, ele);
      return;
    }

    if (pos.x <= this._rectEnemy.x) {
      this.pushTo(vee.Direction.Left, pos, this._rectEnemy, ele);
      return;
    }

    if (pos.x >= this._rectEnemy.x + this._rectEnemy.width) {
      this.pushTo(vee.Direction.Right, pos, this._rectEnemy, ele);
      return;
    }

    this.pushTo(this._drawerDir, pos, this._rectEnemy, ele);
  },

  pushTo: function (dir, pos, rect, ele) {
    if (!dir) {
      return;
    }

    switch (dir) {
      case vee.Direction.Top:
        ele.downToBarrier();
        ele.needUpdateState = false;
        ele.setJumping(false);
        ele.isUpdateY = false;
        ele.updateState();
        ele.setElePosition(cc.p(pos.x, rect.y + rect.height));
        break;

      case vee.Direction.Bottom:
        ele.setElePosition(cc.p(pos.x, rect.y - 5));
        ele.upToBarrier();
        ele.stopRunning();
        break;

      case vee.Direction.Left:
        ele.setElePosition(cc.p(rect.x, pos.y));
        ele.rightToBarrier();
        ele.stopRunning();
        break;

      case vee.Direction.Right:
        ele.setElePosition(cc.p(rect.x + rect.width, pos.y));
        ele.leftToBarrier();
        ele.stopRunning();
        break;
    }

    this._tempDir = dir;
  },

  getPosOff: function () {
    return vee.Utils.pSub(vee.Utils.pAdd(this.getElePosition(), this.nodeBox.getPosition()), this._lastPos);
  },

  getInhaleController: function () {
    return null;
  },

  getDirArr: function () {
    return [vee.Direction.Left, vee.Direction.Right];
  },

  removeOnGridChange: function () {
    game.Data.removeUpdateObj(this);
  }
});
