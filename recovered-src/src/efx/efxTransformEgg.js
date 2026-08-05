// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/efx/efxTransformEgg.dis
var EfxTransformEgg = vee.Class.extend({
  _type: null,
  setTransformType: function (arg0) {
    this._type = arg0;
  },
  hidePlayer: function () {
    game.Data.oPlayerCtl._container.setVisible(false);
  },
  createPlayer: function () {
    var local0 = game.Data.oPlayerCtl.getElePosition();
    game.Data.oPlayerCtl._container.removeFromParent();
    var local1 = ElePlayer.create(this._type);
    game.Data.setPlayerType(this._type);
    game.Data.oPlayerCtl = null;
    game.Data.oPlayerCtl = local1.controller;
    game.Data.oLyGame.lyMap.addChild(local1.container, 2);
    local1.controller.setElePosition(local0);
    game.Data.oPlayerCtl._speedY = 800;
    game.Data.oPlayerCtl._offsetY = 0;
  },
  remove: function () {
    game.Data.playerInvisible = false;
    this.rootNode.removeFromParent();
  }
});
EfxTransformEgg.create = function (arg0) {
    var local0 = cc.BuilderReader.load(res.efx_BianShen_Mario_ccbi);
    local0.controller.setTransformType(arg0);
    local0.setPosition(game.Data.oPlayerCtl.getElePosition());
    game.Data.oLyGame.lyMap.addChild(local0, 8);
    return local0;
  };
