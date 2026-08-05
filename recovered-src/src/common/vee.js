// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/common/vee.dis
vee.isFirstPlay = false;
vee.isNewPlayer = false;
vee.hideListener = cc.EventListener.create({
  event: cc.EventListener.CUSTOM,
  eventName: "game_on_hide",
  callback: function () {
    app.leave();
    vee.onApplicationDidEnterBackground();
  }
});
vee.showListener = cc.EventListener.create({
  event: cc.EventListener.CUSTOM,
  eventName: "game_on_show",
  callback: function () {
    vee.onApplicationWillEnterForeground();
    vee.Utils.scheduleBack(app.resume);
  }
});
vee.init = function () {
    var local0 = vee.Utils.loadObj("VeeData");
    if (!local0) {
      vee.isFirstPlay = true;
      vee.data.veewocheck = "ok";
      vee.saveData();
    } else {
      vee.data = local0;
    }
    cc.eventManager.addListener(vee.hideListener, 1);
    cc.eventManager.addListener(vee.showListener, 1);
    vee.Audio.init();
    vee.PopMgr.resetScene();
    app.init(vee.isFirstPlay);
  };
vee.data = {
  musicEnabled: true,
  soundEnabled: true,
  adEnabled: true,
  gameCenterEnabled: true
};
vee.saveData = function () {
    vee.Utils.saveObj(vee.data, "VeeData");
  };
