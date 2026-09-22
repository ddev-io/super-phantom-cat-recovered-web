// Recovered source-like JS from /mnt/data/smdis/dis/UI/star.dis
// Source-like reconstruction from smdis.

var UIStar = vee.Class.extend({
  _lock: null,
  spBack: null,
  setGettedStar: function () {
    var local0 = res.ga_ui_star_off_2_png;
    if (game.Data.checkIs61()) {
      local0 = res.ga_ui_starChild_off_png;
    }
    this.spBack.setTexture(local0);
    this.spBack.setColor(cc.color(255, 255, 255));
    this.spBack.setOpacity(255);
  },
  setLocked: function (arg0) {
    this._lock = arg0;
    if (arg0) {
      this.playAnimate("dark");
    } else {
      this.playAnimate("light");
    }
  },
  unlockAnimate: function () {
    if (this._lock) {
      this.playAnimate("show");
    }
  }
});
UIStar.create = function (arg0) {
  var local0 = res.uiStar_ccbi;
  if (game.Data.checkIs61()) {
    local0 = res.uiStarChild_ccbi;
  }
  var local1 = cc.BuilderReader.load(local0);
  local1.controller.setLocked(arg0);
  return local1;
};
