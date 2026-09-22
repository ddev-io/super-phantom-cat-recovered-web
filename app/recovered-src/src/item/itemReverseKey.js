// Recovered source-like JS from /mnt/data/smdis/dis/item/itemReverseKey.dis
// Source-like reconstruction from smdis.

var ItemReverseKey = Item.extend({
  _type: game.ObjectType.ReverseKey,
  _isOver: false,
  bornWithPos: function () {
    cc.log("key create!");
  },
  collide: function () {
    if (this._isOver) {
      return undefined;
    }
    this._isOver = true;
    vee.Audio.playEffect(res.inGame_function_unlockAvator_mp3);
    var local0 = game.LevelData.selectedLevel;
    if (local0) {
      local0.tempReverseKeyCollected();
    }
    this.playAnimate("Hide", function () {
      this.die();
    }.bind(this));
    EfxGetMoonKey.show();
  }
});
