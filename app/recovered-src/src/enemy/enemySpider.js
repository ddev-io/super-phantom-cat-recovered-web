function _enemyGetSideAgainstPlayer(obj) {
  return obj.getElePosition().x > game.Data.oPlayerCtl.getElePosition().x ? vee.Direction.Left : vee.Direction.Right;
}

var EnemySpider = Enemy.extend({
  objType: game.ObjectType.Spider,
  spLine: null,
  _lineTopPosY: null,
  _topLimitY: null,
  _bottomLimitY: null,
  _dur: null,
  _elePos: null,
  _popPlayerHeightMax: 1500,
  _popPlayerHeight: 1500,

  bornWithPos: function () {
    this._container.stopAllActions();
    this._hasCollide = true;
    this._hasG = false;
    this._needSafePos = false;
    this.playAnimate("run");

    var pos = this.getElePosition();
    this.spLine.setOpacity(255);
    var grid = cc.p(this._gridInMap.x, this._gridInMap.y - 1);
    var blockCount = 0;
    var oneWayOffset = 0;

    while (game.Logic.checkTileGridValid(grid)) {
      var obj = game.Logic.map.getObject(grid);
      if (obj && obj.gid) {
        var info = game.Logic.getTileInfoByGID(obj.gid);
        if (info) {
          var type = info.type;
          if (type === game.ObjectType.Block || type === game.ObjectType.Slope ||
              type === game.ObjectType.BlockHurt || type === game.ObjectType.BlockOneWay) {
            oneWayOffset = type === game.ObjectType.BlockOneWay ? 32 : 0;
            grid.y++;
            break;
          }
        }
      }
      blockCount++;
      grid.y--;
    }

    var lineHeight = game.Data.tileSizeWidth / 2 + blockCount * game.Data.tileSizeWidth + oneWayOffset;
    this.spLine.setScaleY(lineHeight);
    this._lineTopPosY = pos.y + lineHeight;

    var cfg = game.Logic.configMap.getObject(this._gridInMap);
    var topY;
    var bottomY;
    if (cfg) {
      var limit = cfg.name.split(",");
      if (limit.length === 2) {
        topY = game.Logic.getTilePosCenterByGrid(cc.p(0, this._gridInMap.y + parseInt(limit[0], 10))).y;
        bottomY = game.Logic.getTilePosCenterByGrid(cc.p(0, this._gridInMap.y + parseInt(limit[1], 10))).y;
      }
    }
    if (topY == null || bottomY == null) {
      topY = game.Logic.getTilePosCenterByGrid(this._gridInMap).y;
      bottomY = pos.y;
    }

    this._dur = (topY - bottomY) / 200;
    this._topLimitY = topY;
    this._bottomLimitY = bottomY;
    this._elePos = pos;
    this.runMoveAnimate();
  },

  runMoveAnimate: function () {
    this._container.runAction(cc.repeat(cc.sequence(
      cc.moveTo(this._dur, cc.p(this._elePos.x, this._topLimitY)),
      cc.delayTime(0.5),
      cc.moveTo(this._dur, cc.p(this._elePos.x, this._bottomLimitY)),
      cc.delayTime(0.5)
    ), 99999));
  },

  AILogicPerFrame: function () {
    this.spLine.setScaleY(this._lineTopPosY - this.getElePosition().y);
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

  getInhaleController: function () {
    if (this.inhaleController) {
      return null;
    }
    this.inhaleController = new InhaleSpiderObj();
    this.inhaleController.obj = this;
    return this.inhaleController;
  },

  dieAnimate: function () {
    this.onKill();
    this.spLine.setOpacity(0);
    EfxEnemyDie.show(this.getElePosition());
    this._hasCollide = false;
    this._isOver = true;
    this.die();
  }
});
