// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/lyLevelLoading.dis
var LyLevelLoading = vee.Class.extend({
  lbPercent: null,
  lbHD: null,
  onCreate: function () {
    game.Data.oLvLoadingCtl = this;
    this.playAnimate("in", function () {
      game.Logic.flushFunctionPool();
    });
  },
  onExit: function () {
    game.Data.oLvLoadingCtl = null;
  },
  ccbInit: function () {
    this.lbHD.setVisible(game.Data.isAndroid);
    vee.Audio.playEffect(res.outGame_efx_senceChange_mp3);
  },
  setPercent: function (arg0) {
    this.lbPercent.setString((arg0 + "%"));
  },
  loaded: function () {
    this.lbPercent.setString("100%");
    if (cc.sys && !cc.sys.isNative) {
      vee.PopMgr.closeLayerByCtl(this);
      vee.Transition.in(res.MapTransition_ccbi, null, cc.p(568, 384));
      return;
    }
    this.playAnimate("out", function () {
      vee.PopMgr.closeLayerByCtl(this);
      vee.Transition.in(res.MapTransition_ccbi, null, cc.p(568, 384));
    }.bind(this));
  }
});
LyLevelLoading.show = function () {
    var local0 = vee.PopMgr.popCCB(res.lyLevelLoading_ccbi, true);
    local0.controller.ccbInit();
  };
