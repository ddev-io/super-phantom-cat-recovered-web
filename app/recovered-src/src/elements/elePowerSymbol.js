// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/elements/elePowerSymbol.dis
var ElePowerSymbol = vee.Class.extend({
  _getPosition: null,
  nodeBox: null,
  _speedX: 0,
  _speedY: 0,
  ps1: null,
  ps2: null,
  psDust: null,
  _isShow: false,
  show: function (arg0) {
    if (this._isShow && !arg0) {
      return;
    }
    this._isShow = true;
    this.nodeBox.setPosition(this._getPosition());
    var local0 = this.getAnimateStr();
    if (local0) {
      this.playAnimate(local0 + "_in");
    }
  },
  getAnimateStr: function () {
    switch (game.Data.playerType) {
      case game.PlayerType.Smash:
        return "smash";
      case game.PlayerType.Bullet:
        return "bullet";
      case game.PlayerType.Teleport:
        return "teleport";
      case game.PlayerType.Bomb:
        return "bomb";
    }
  },
  hide: function () {
    if (!this._isShow || game.Data.playerType === game.PlayerType.Normal) {
      return;
    }
    this._isShow = false;
    this.playAnimate("out");
  },
  follow: function (arg0) {
    var local0 = this.nodeBox.getPosition();
    var local1 = vee.Utils.pSub(this._getPosition(), local0);
    this._speedX = (local1.x * 5);
    local0.x = (local0.x + (this._speedX * arg0));
    this._speedY = (local1.y * 5);
    local0.y = (local0.y + (this._speedY * arg0));
    this.nodeBox.setPosition(local0);
  },
  attach: function (arg0) {
    this._getPosition = arg0;
  }
});
ElePowerSymbol.create = function () {
    var local0 = arguments[0];
    var local1 = cc.BuilderReader.load(res.eleElf_ccbi).controller;
    var local2 = new cc.Node();
    local2.addChild(local1.rootNode);
    local1.nodeBox = local2;
    local2.controller = local1;
    if (local0.getPosition4Symbol) {
      local1.attach(local0.getPosition4Symbol.bind(local0));
    } else {
      local1.attach(function () {
        return local0;
      });
    }
    return local1;
  };
