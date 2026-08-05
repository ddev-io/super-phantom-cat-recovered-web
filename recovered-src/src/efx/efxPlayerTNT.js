// Recovered source-like JS from /mnt/data/smdis/dis/efx/efxPlayerTNT.dis
// Source-like reconstruction from smdis.

var EfxPlayerTNT = vee.Class.extend({
  ps1: null,
  _container: null,
  isStatic: true,
  boomed: false,
  boomFunc: null,
  onLoaded: function () {
    this.ps1.setPositionType(1);
  },
  breathAnimate: function () {
    this.playAnimate("breath");
  },
  bornAnimate: function () {
    this.playAnimate("in", function () {
      this.isStatic = false;
      this.boomAnimate();
    }.bind(this));
  },
  boomAnimate: function (arg0) {
    if (this.boomed) {
      return undefined;
    }
    if (arg0) {
      this.boomAnimateExplode();
      return undefined;
    }
    this.playAnimate("boom", function () {
      this.boomAnimateExplode();
    }.bind(this));
  },
  boomAnimateExplode: function () {
    this.playAnimate("boom3", function () {
      this.die();
    }.bind(this));
  },
  setBoomFunc: function (arg0) {
    this.boomFunc = arg0;
  },
  startBoom: function () {
    vee.Audio.playEffect(res.inGame_efx_bombExplode_mp3);
    this.boomed = true;
  },
  boom: function () {
    if (this.boomFunc) {
      this.boomFunc();
    }
  },
  die: function () {
    this.rootNode.removeFromParent();
  }
});
EfxPlayerTNT.create = function (arg0) {
  var local0 = cc.BuilderReader.load(res.efx_PlayerTNT_ccbi);
  var local1 = cc.Node.create();
  local0.controller._container = local1;
  local1.addChild(local0);
  local1.setPosition(arg0);
  game.Data.oLyGame.lyMap.addChild(local1, 11);
  return local0.controller;
};
var EfxTNT = EfxPlayerTNT.extend({
  onLoaded: function () {

  },
  boomAnimate: function (arg0) {
    if (arg0) {
      return undefined;
    }
    this.playAnimate("boom", function () {
      this.die();
    }.bind(this));
  }
});
EfxTNT.create = function (arg0) {
  var local0 = cc.BuilderReader.load(res.efx_TNT_ccbi);
  var local1 = cc.Node.create();
  local0.controller._container = local1;
  local0.controller.isStatic = false;
  local1.addChild(local0);
  local1.setPosition(arg0);
  game.Data.oLyGame.lyMap.addChild(local1, 11);
  return local0.controller;
};
