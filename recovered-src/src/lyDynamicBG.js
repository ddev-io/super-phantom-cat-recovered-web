// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/lyDynamicBG.dis
var LyDynamicBG = vee.Class.extend({
  dynamicObj1: null,
  bgName: null,
  _posPrev: null,
  _posNext: null,
  setOffset: function (arg0) {
    if (this.dynamicObj1) {
      this._posPrev = this.dynamicObj1.getPosition();
      this._posNext = vee.Utils.pAdd(this._posPrev, cc.p(arg0.x * 0.2, arg0.y * 0.1));
      this.dynamicObj1.setPosition(this.safePos(this._posNext));
    }
  },
  _objSize: null,
  safePos: function (arg0) {
    arg0.x = arg0.x > 0 ? 0 : arg0.x;
    arg0.y = arg0.y > 0 ? 0 : arg0.y;
    return arg0;
  },
  disappear: function () {
    game.Data.isChangingBG = true;
    this.rootNode.removeFromParent();
    game.Data.isChangingBG = false;
  }
});
LyDynamicBG.create = function (arg0) {
    var local0 = cc.BuilderReader.load((("res/" + arg0) + ".ccbi"));
    local0.controller.name = arg0;
    return local0;
  };
