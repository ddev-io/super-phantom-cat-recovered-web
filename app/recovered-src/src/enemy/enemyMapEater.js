// Recovered source-like JS from /mnt/data/smdis/dis/enemy/enemyMapEater.dis
// Source-like reconstruction from smdis.

var EnemyMapEater = Enemy.extend({
  objType: game.ObjectType.MapEater,
  _speedXLimit: 100,
  _speedXLimitForSet: 100,
  bornWithPos: function () {
    this._hasG = false;
    this._needSafePos = false;
    this._hasCollide = true;
    this._accX = 100;
  },
  checkCollide: function () {
    if (!(this._hasCollide)) {
      return undefined;
    }
    var local0 = this.getEleRect();
    if (cc.rectContainsPoint(local0, game.Data.oPlayerCtl._pos)) {
      this.collide();
    }
  },
  onGridChanged: function () {

  },
  collide: function () {
    if (!(this._hasCollide)) {
      return undefined;
    }
    this._hasCollide = false;
    this._accX = 0;
    game.Data.oPlayerCtl.getShock(vee.Direction.Right);
    game.Data.costLife(99);
  }
});
