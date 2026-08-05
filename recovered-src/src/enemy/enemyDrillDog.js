function _enemyGetSideAgainstPlayer(obj) {
  return obj.getElePosition().x > game.Data.oPlayerCtl.getElePosition().x ? vee.Direction.Left : vee.Direction.Right;
}

var EnemyDrillDogSlime = EnemyDogSlime.extend({
  inMapBack: true,

  leftToBarrier: function () {
    this._hasG = true;
    var grid = cc.p(this._grid.x - 1, this._grid.y);
    var obj = game.Logic.map.getObject(grid);
    if (game.Logic.isBlock(obj)) {
      this.hitByStar();
    } else {
      this._grid.x--;
      this.onGridChanged();
    }
  },

  rightToBarrier: function () {
    this._hasG = true;
    var grid = cc.p(this._grid.x + 1, this._grid.y);
    var obj = game.Logic.map.getObject(grid);
    if (game.Logic.isBlock(obj)) {
      this.hitByStar();
    } else {
      this._grid.x++;
      this.onGridChanged();
    }
  },

  extract: function () {
    this._hasG = true;
    this._speedX = this._faceTo === vee.Direction.Left ? -this._speedXForSet : this._speedXForSet;
    this.playAnimate("run");
  },

  hitByStar: function () {
    this._hasG = true;
    this._speedY = 200;
    this._speedX = this._faceTo === vee.Direction.Left ? 200 : -200;
    this.die();
  },

  onBarrier: function () {
    this.hitByStar();
  },

  downToBarrier: function (obj) {
    if (obj && obj.tileInfo && obj.tileInfo.type === game.ObjectType.BlockHurt) {
      this.die();
    }
  },

  collide: function (dir) {
    if (!this._hasCollide) {
      return;
    }
    if (dir === vee.Direction.Top && !game.Data.oPlayerCtl.extendController) {
      this.popPlayerUp();
      this.hitByStar();
      return;
    }
    if (!game.Data.playerInvisible) {
      game.Data.oPlayerCtl.getShock(_enemyGetSideAgainstPlayer(this), true);
    }
  }
});
