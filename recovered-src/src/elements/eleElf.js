// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/elements/eleElf.dis
var EleElf = vee.Class.extend({
  psDust: null,
  _container: null,
  node1: null,
  onExit: function () {
    EleElf.elf = null;
  },
  startUp: function () {
    EleElf.elf = this;
    this.playAnimate("show");
    this.psDust.setPositionType(1);
    this.changeDir();
    this._container.setPosition(cc.p(0, -50));
    this._container.runAction(cc.repeat(cc.sequence(cc.EaseInOut.create(cc.moveBy(1, cc.p(50, 0)), 3.14), cc.EaseInOut.create(cc.moveBy(2, cc.p(-100, 0)), 3.14), cc.EaseInOut.create(cc.moveBy(1, cc.p(50, 0)), 3.14)), 99999));
    this._container.runAction(cc.repeat(cc.sequence(cc.EaseInOut.create(cc.moveBy(2, cc.p(0, 100)), 3.14), cc.EaseInOut.create(cc.moveBy(2, cc.p(0, -100)), 3.14)), 99999));
    this._container.setVisible(false);
  },
  changeDir: function (arg0) {
    if (arg0 === vee.Direction.Left) {
      this._container.stopAllActions();
      this._container.runAction(cc.EaseOut.create(cc.moveTo(0.4, cc.p(50, 50)), 3));
    } else {
      this._container.stopAllActions();
      this._container.runAction(cc.EaseOut.create(cc.moveTo(0.4, cc.p(-50, 50)), 3));
    }
  },
  _stopUpdateOffset: false,
  setOffset: function (arg0) {
    if (this._stopUpdateOffset) {
      return;
    }
    var local0 = this._container.getPosition();
    local0.x = local0.x > 50 ? 50 : local0.x;
    local0.x = local0.x < -50 ? -50 : local0.x;
    local0.y = 50;
    arg0.y = arg0.y < 0 ? arg0.y : arg0.y * 2;
    this._container.setPosition(vee.Utils.pAdd(cc.p(arg0.x * 2, arg0.y), local0));
  }
});
EleElf.elf = null;
EleElf.addToPlayer = function (arg0) {
    game.Data.oPlayerCtl._container.addChild(arg0, 999);
  };
EleElf.changeElfDir = function (arg0) {
    if (EleElf.elf) {
      EleElf.elf.changeDir(arg0);
    }
  };
EleElf.setElfOffset = function (arg0) {
    if (EleElf.elf) {
      EleElf.elf.setOffset(arg0);
    }
  };
EleElf.create = function () {
    var local0 = cc.BuilderReader.load(res.eleElf_ccbi);
    var local1 = cc.Node.create();
    local1.addChild(local0);
    local0.controller._container = local1;
    local0.controller.startUp();
    return local1;
  };
