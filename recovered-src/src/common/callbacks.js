// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/common/callbacks.dis
var vee = vee || {};
vee.onApplicationDidEnterBackground = function () {
    vee.Audio.stopMusicWithSave();
    vee.Audio.pauseAllEffects();
    vee.saveData();
    vee.Analytics.UGameEvent.gameStopEvent();
    vee.Analytics.stopSession();
  };
vee.onApplicationWillEnterForeground = function () {
    vee.Audio.playLastMusic();
    vee.Audio.resumeAllEffects();
    vee.Analytics.startSession();
  };
vee.getConfig = function (arg0) {
    return app.Config[arg0];
  };
vee.configWithUrlData = function () {
    cc.log("js vee.configWithUrlData ================");
  };
vee.shareCallback = function () {
  };
vee.configIAPPrices = function (arg0) {
    for (var local0 = 0; local0 < arg0.length; local0++) {
      app.Config.IAPs[local0].prices = arg0[local0];
    }
    vee.data.arrPrices = arg0;
    vee.saveData();
  };
vee.alert = function (arg0, arg1) {
    vee.PopMgr.alert(arg1, arg0);
  };
vee.onKeyBack = function () {
    vee.Utils.scheduleOnce(function () {
      VeeQuitBox.show();
    }, 0.2);
  };
