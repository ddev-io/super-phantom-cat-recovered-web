// Recovered source-like JS from /mnt/data/smdis/dis/item/itemSavePoint.dis
// Source-like reconstruction from smdis.

var ItemSavePoint = Item.extend({
  ps1: null,
  bornWithPos: function (arg0) {
    ItemSavePoint.btnBuyPos = cc.p(arg0.x, (arg0.y + 150));
    cc.p(arg0.x, (arg0.y + 150));
    ItemSavePoint.btnBuyGrid = cc.p(this._grid.x, this._grid.y);
    cc.p(this._grid.x, this._grid.y);
    if (game.Data.savePointSaved) {
      this.playAnimate("light");
    } else {
      this.playAnimate("close");
    }
    this.setElePosition(cc.p(arg0.x, (arg0.y - TILE_WIDTH_HALF)));
    this.ps1.setPositionType(1);
  },
  collide: function () {
    if (!(game.Data.savePointSaved)) {
      game.Data.retryCount = 0;
      game.Data.savePointSaved = true;
      vee.Audio.playEffect(res.inGame_event_relayReach_mp3);
      this.playAnimate("open");
      game.Data.setSavePointIdx(game.Data.performingTMXIdx);
      if ((game.Data.roleType == game.Roles.Girl)) {
        game.Data.addLife();
      }
      ItemTransformBox.transformBackFromHawk();
    }
  }
});
ItemSavePoint.btnBuyPos = null;
ItemSavePoint.btnBuyGrid = null;
