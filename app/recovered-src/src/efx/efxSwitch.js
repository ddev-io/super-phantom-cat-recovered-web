// Recovered source-like JS from /mnt/data/smdis/dis/efx/efxSwitch.dis
// Source-like reconstruction from smdis.

var EfxSwitch = vee.Class.extend({
  ps1: null,
  ps2: null,
  init: function () {
    this.ps1.setPositionType(1);
    this.ps2.setPositionType(1);
  },
  show: function (arg0, arg1) {
    var local0 = ((arg0 + "To") + arg1);
    this.playAnimate(local0, function () {
      this.removeEfx();
    }.bind(this));
  },
  removeEfx: function () {
    this.rootNode.setVisible(false);
    EfxSwitch.pool.push(this);
  }
});
EfxSwitch.Status = {
  ON: 1,
  OFF: 2,
  DISABLE: 3
};
EfxSwitch.StatusStr = {
  ON: "On",
  OFF: "Off",
  DISABLE: "Dis"
};
EfxSwitch.gid2Str = function (arg0) {
  switch (arg0) {
  case game.BlockType.SwitchShow:
    return EfxSwitch.StatusStr.ON;
  case game.BlockType.SwitchHide:
    return EfxSwitch.StatusStr.OFF;
  case game.BlockType.SwitchDisable:
    return EfxSwitch.StatusStr.DISABLE;
  default:
    return undefined;
  }
};
EfxSwitch.pool = [];
EfxSwitch.create = function (arg0, arg1, arg2) {
  if (((!(arg1)) || (!(arg2)))) {
    return null;
  }
  var local0 = null;
  if ((EfxSwitch.pool.length > 0)) {
    local0 = EfxSwitch.pool.pop().rootNode;
    local0.setVisible(true);
  } else {
    local0 = cc.BuilderReader.load(res.efx_switch_ccbi);
    game.Data.oLyGame.lyMap.addChild(local0, 8);
    local0.controller.init();
  }
  local0.setPosition(arg0);
  local0.controller.show(arg1, arg2);
  return local0.controller;
};
