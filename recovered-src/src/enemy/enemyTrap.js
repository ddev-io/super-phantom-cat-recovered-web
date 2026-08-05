// Recovered source-like JS from /mnt/data/smdis/dis/enemy/enemyTrap.dis
// Source-like reconstruction from smdis.

var EnemyTrap = vee.Class.extend({
  trapBlockData: null,
  grid: null,
  ccbInit: function () {
    this.playAnimate("huxi");
  },
  attack: function () {
    this.playAnimate("attack", function () {
      this.playAnimate("reset", function () {
        this.trapBlockData.trapped = false;
      }.bind(this));
      game.Logic.map.removeObject(this.grid);
    }.bind(this));
  },
  makeDamage: function () {
    var local0 = game.Data.oPlayerCtl._grid;
    if (game.Logic.isGridSame(this.grid, local0)) {
      game.Data.oPlayerCtl.getShock(game.Data.oPlayerCtl._faceTo, true);
    }
    var local1 = game.Logic.map.getObject(this.grid);
    if (((local1) && ((local1.tileInfo.type == game.ObjectType.BlockBomb)))) {
      var local2 = game.Logic.getBlockTileData(this.grid, this.trapBlockData.layer);
      local1.tempData = local2;
    } else {
      local2 = game.Logic.getBlockTileData(this.grid, this.trapBlockData.layer);
      game.Logic.map.setObject(local2, this.grid);
    }
  }
});
