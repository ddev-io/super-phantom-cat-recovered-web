// Recovered source-like JS from /mnt/data/smdis/dis/UI/lyStaff.dis
// Source-like reconstruction from smdis.

var LyStaff = vee.Class.extend({
  btnQuit: null,
  nodeTL: null,
  _tempControllerState: null,
  ccbInit: function () {
    vee.Audio.playMusic(res.bgm_10_mp3);
    this.playAnimate("show", function () {

    }.bind(this));
    vee.PopMgr.setNodePos(this.nodeTL, vee.PopMgr.PositionType.TopLeft);
    this.handleKey(true);
    if (((!(game.Data.isFreeGame)) && (!(game.Data.isAndroid)))) {
      vee.Ad.showInterstitialAd();
      vee.Analytics.UGameEvent.showAdEvent("LyStaff", "interstial", "");
    }
    this._tempControllerState = vee.Controller.cacheControllerState();
    vee.Controller.cacheControllerState();
    vee.Controller.registerButtonAction(vee.KeyCode.BUTTON_B, this.onQuit.bind(this));
    vee.Controller.activeButton();
  },
  onKeyBack: function () {
    this.onQuit();
    return true;
  },
  onQuit: function () {
    vee.Audio.stopMusic();
    vee.PopMgr.closeLayerByCtl(this);
    vee.Controller.reviveControllerState(this._tempControllerState);
  }
});
LyStaff.show = function () {
  var local0 = vee.PopMgr.popCCB(res.lyStaff_ccbi, {
    alpha: 0
  });
  local0.controller.ccbInit();
};
