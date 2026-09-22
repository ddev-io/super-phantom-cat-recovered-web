// Recovered source-like JS from /mnt/data/smdis/dis/UI/lyTipsDesc.dis
// Source-like reconstruction from smdis.

var LyTipsDesc = vee.Class.extend({
  lbContent: null,
  ccbInit: function () {
    this.playAnimate("show");
    this.setDescIdx(0);
  },
  onChange1: function () {
    if (game.Logic._mapTips) {
      this.setDescIdx(0);
    }
  },
  onChange2: function () {
    if (game.Logic._mapTips) {
      this.setDescIdx(1);
    }
  },
  onChange3: function () {
    if (game.Logic._mapTips) {
      this.setDescIdx(2);
    }
  },
  _idx: null,
  setDescIdx: function (arg0) {
    if (arg0 == this._idx) {
      return undefined;
    }
    this._idx = arg0;
    this.lbContent.setString(game.Logic._mapTips[this._idx]);
    for (var local0 = 1; local0 < 4; local0++) {
      var local1 = this["btn" + local0];
      var suffix = (local0 == arg0 + 1) ? "_on.png" : "_off.png";
      local1.setBackgroundSpriteForState(
      cc.Scale9Sprite.create("res/btn_tips_" + local0 + suffix),
      cc.CONTROL_STATE_NORMAL
      );
    }
  },
  onClose: function () {
    this.playAnimate("hide", function () {
      vee.PopMgr.closeLayerByCtl(this);
    }.bind(this));
  }
});
LyTipsDesc.show = function () {
  var local0 = vee.PopMgr.popCCB(res.lyTipsDesc_ccbi, {
    alpha: 0
  });
  local0.controller.ccbInit();
};
