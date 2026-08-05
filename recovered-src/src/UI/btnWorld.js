// Recovered source-like JS from /mnt/data/smdis/dis/UI/btnWorld.dis
// Source-like reconstruction from smdis.

var BtnWorld = vee.Class.extend({
  spBtnL: null,
  spNew: null,
  _lvCtl: null,
  btnReverseWorld: null,
  isCanClick: true,
  onCreate: function () {
    vee.Controller.registerControllerSprite(this.spBtnL);
    this.spNew.setVisible(false);
    this.showMoon();
    BtnWorld.instance = this;
  },
  onExit: function () {
    vee.Controller.removeControllerSprite(this.spBtnL);
  },
  setLvCtl: function (arg0) {
    this._lvCtl = arg0;
  },
  setNew: function (arg0) {
    this.spNew.setVisible(arg0);
  },
  onReverseWorld: function () {
    if (((!(this.rootNode.isVisible())) || (!(this.isCanClick)))) {
      return undefined;
    }
    var local0 = game.Data.oLvSelectCtl;
    var local1 = local0._mapType;
    if ((local1 == LyLevelSelect.MapType.MAP_NORMAL)) {
      if ((game.Data.isAndroid || game.Data.version.isNewIosVersion) && game.Data.isFreeGame) {
        if (vee.data.moon) {
          this._isSun = false;
          local0.showLevelMap(LyLevelSelect.MapType.MAP_REVERSE);
        } else {
          cc.log("showMoonWorld2");
          LyUnlockedMoonWorld.show(true);
        }
      } else {
        this._isSun = false;
        local0.showLevelMap(LyLevelSelect.MapType.MAP_REVERSE);
      }
    } else {
      if ((local1 == LyLevelSelect.MapType.MAP_REVERSE)) {
        this._isSun = true;
        local0.showLevelMap(LyLevelSelect.MapType.MAP_NORMAL);
      }
    }
  },
  showSun: function () {
    this.playAnimate("Moon_show");
  },
  showMoon: function () {
    this.playAnimate("Sun_show");
  }
});
BtnWorld.instance = null;
