// Recovered source-like JS from /mnt/data/smdis/dis/efx/efxBubble.dis
// Source-like reconstruction from smdis.

var EfxBubble = vee.Class.extend({
  _callback: null,
  ccbInit: function (arg0) {
    this._callback = arg0;
    this.playAnimate("show", function () {
      if (this._callback) {
        this._callback();
      }
      this.boom();
    }.bind(this));
    this.rootNode.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(function () {
      if (game.Data.oPlayerCtl) {
        game.Data.oPlayerCtl._canReviveFloat = true;
      }
    })));
  },
  boom: function () {
    this.playAnimate("boom", function () {
      this.rootNode.removeFromParent();
    });
  }
});
EfxBubble.show = function (arg0) {
  var local0 = cc.BuilderReader.load(res.efx_bubble_ccbi);
  local0.controller.ccbInit(arg0);
  return local0;
};
