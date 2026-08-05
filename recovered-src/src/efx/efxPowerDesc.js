// Recovered source-like JS from /mnt/data/smdis/dis/efx/efxPowerDesc.dis
// Source-like reconstruction from smdis.

var EfxPowerDesc = vee.Class.extend({
  spIcon: null,
  lbDesc: null,
  ccbInit: function () {

  },
  setType: function (arg0) {
    switch (arg0) {
    case game.PlayerType.Smash:
      this.lbDesc.setString("Smash Sprite");
      break;
    case game.PlayerType.Bullet:
      this.lbDesc.setString("Bullet Sprite");
      break;
    case game.PlayerType.Teleport:
      this.lbDesc.setString("Blink Sprite");
      break;
    case game.PlayerType.Bomb:
      this.lbDesc.setString("Bomb Sprite");
      break;
    case game.PlayerType.Hawk:
      this.lbDesc.setString("~Phantom~");
      break;
    }
    var alias2 = parseInt(arg0) - 1;
    this.playAnimate("show " + alias2, function () {
      this.playAnimate("hide " + alias2, function () {
        this.rootNode.removeFromParent();
      }.bind(this));
    }.bind(this));
  }
});
EfxPowerDesc.show = function (arg0, arg1) {
  var local0 = cc.BuilderReader.load(res.efx_PowerBar_ccbi);
  local0.setPosition(arg1);
  game.Data.oLyGame.rootNode.addChild(local0, 8);
  local0.controller.ccbInit();
  local0.controller.setType(arg0);
};
