// Recovered source-like JS from /mnt/data/smdis/dis/efx/efxPlayer.dis
// Source-like reconstruction from smdis.

var EfxGamePoint = vee.Class.extend({
  onCreate: function () {

  },
  inAnimate: function () {
    this.playAnimate("show", function () {
      this.rootNode.removeFromParent();
    }.bind(this));
  },
  outAnimate: function () {

  },
  loopAnimate: function () {

  }
});
EfxGamePoint.show = function (arg0) {
  var local0 = cc.BuilderReader.load(res.efx_GamePiont_ccbi);
  local0.setPosition(arg0);
  game.Data.oLyGame.lyMap.addChild(local0, 8);
};
var EfxPlayerOut = vee.Class.extend({
  onCreate: function () {
    this.playAnimate("show", function () {
      this.rootNode.removeFromParent();
    }.bind(this));
  }
});
EfxPlayerOut.show = function (arg0) {
  var local0 = cc.BuilderReader.load(res.efx_PlayerOut_ccbi);
  local0.setPosition(arg0);
  game.Data.oLyGame.lyMap.addChild(local0, 8);
};
var EfxCannonPs = vee.Class.extend({
  ps1: null,
  ps2: null,
  onCreate: function () {
    this.playAnimate("show", function () {
      game.Data.changePosFunc = null;
      this.rootNode.removeFromParent();
    }.bind(this));
  },
  init: function () {
    this.ps1.setPositionType(cc.ParticleSystem.TYPE_RELATIVE);
    this.ps1.setPositionType(cc.ParticleSystem.TYPE_RELATIVE);
  }
});
EfxCannonPs.show = function () {
  var local0 = cc.BuilderReader.load(res.efx_Player_DaPao_LiZi_ccbi);
  local0.controller.init();
  game.Data.oPlayerCtl._container.addChild(local0, 8);
  return local0.controller;
};
var EfxPlayerDie = vee.Class.extend({
  removeFunc: null,
  onCreate: function () {
    this.playAnimate("Show", function () {
      this.rootNode.removeFromParent();
      if (this.removeFunc) {
        this.removeFunc();
      }
    }.bind(this));
  }
});
EfxPlayerDie.show = function (arg0, arg1) {
  var local0 = cc.BuilderReader.load(res.efx_elePlayerZhai_die_ccbi);
  local0.setPosition(arg0);
  local0.controller.removeFunc = arg1;
  game.Data.oLyGame.lyMap.addChild(local0, 8);
};
