// Recovered source-like JS from /mnt/data/smdis/dis/efx/efxDust.dis
// Source-like reconstruction from smdis.

var DustType = {
  JumpDust: 1,
  RunDust: 2,
  SmashDust: 3,
  ForceJumpDust: 4
};
var EfxDust = {
  jumpDustPool: null,
  runDustPool: null,
  smashDustPool: null,
  isJump: false,
  init: function () {
    this.jumpDustPool = [];
    this.runDustPool = [];
    this.smashDustPool = [];
  },
  show: function (arg0, arg1, arg2) {
    var local0 = this.getDustName(arg1);
    if (!(local0)) {
      return undefined;
    }
    var local1 = this[(local0 + "DustPool")];
    var local2 = null;
    if (((local1) && ((local1.length > 0)))) {
      var local3 = local1.pop();
      local3.show();
      local2 = local3.rootNode;
      local2.setVisible(true);
    } else {
      var local4 = (("res/efx_Dust_" + local0) + ".ccbi");
      var local5 = cc.BuilderReader.load(local4);
      var lyGame = game && game.Data && game.Data.oLyGame;
      if (!lyGame || !lyGame.lyMap) {
        return undefined;
      }
      lyGame.lyMap.addChild(local5, 11);
      local5.controller.show(local0);
      local2 = local5;
    }
    local2.setPosition(arg0);
    if (arg2) {
      if ((arg2 == vee.Direction.Left)) {
        local2.setScaleX(-1);
      } else {
        local2.setScaleX(1);
      }
    }
  },
  getDustName: function (arg0) {
    switch (arg0) {
    case DustType.JumpDust:
      if (this.isJump) {
        return null;
      }
      return "jump";
    case DustType.RunDust:
      return "run";
    case DustType.SmashDust:
      return "smash";
    case DustType.ForceJumpDust:
      return "jump";
    default:
      return undefined;
    }
  }
};
var EfxDustCtl = vee.Class.extend({
  _name: null,
  show: function (arg0) {
    this._name = arg0 || this._name;
    this._aniCall = function () {
      EfxDust[(this._name + "DustPool")].push(this);
      this.rootNode.setVisible(false);
    }.bind(this);
    this.playAnimate(this._name, this._aniCall);
  }
});
