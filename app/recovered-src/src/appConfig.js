// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/appConfig.dis
var app = app || {};
app.init = function (arg0) {
    if (arg0) {
      vee.saveData();
    }
    if (!game.Data.isAndroid) {
      vee.Common.getInstance().removeAllNotifications();
    }
  };
app.closeGame = function () {
    app.addCatNotification();
  };
app.leave = function () {
    cc.log("app leave");
    app.saveDataBeforeLeave();
    vee.saveData();
    game.LevelData.save();
    vee.VIPValues.save();
    app.addCatNotification();
  };
app.resume = function () {
    cc.log("app resume");
    app.checkData();
    if (game.Data.isVideoAding) {
      cc.log("zq debug is video ading====");
      game.Data.isVideoAding = false;
    } else if (game.Data.isInLevelSceen && game.Data.oLyGame) {
      cc.log("zq debug not video ading=====");
      game.Data.oLyGame.onPause();
    }
    if (!game.Data.isAndroid) {
      vee.Common.getInstance().removeAllNotifications();
    }
  };
app.saveDataBeforeLeave = function () {
    var local0 = new Date().getTime();
    vee.data.leavets = local0;
    vee.saveData();
  };
app.checkData = function () {
    var local0 = parseInt(vee.data.leavets);
    var local1 = parseInt(new Date().getTime());
    if (local1 < local0) {
      var local2 = parseInt(vee.dataManager.getEnergy());
      vee.dataManager.setEnergyTs(game.Data.nextEnergyTsFromNow());
      if (local2 > 1) {
        vee.dataManager.setEnergy(1);
      } else {
        vee.dataManager.setEnergy(0);
      }
      vee.data.ultE_ts = 0;
      if (game.Data.oEnergyCtl) {
        game.Data.oEnergyCtl.showEnergy();
      }
      vee.Utils.scheduleOnce(function () {
        vee.PopMgr.alert(vee.Utils.getLocalizedStringForKey("There`s a time leap!"), vee.Utils.getLocalizedStringForKey("ERROR"));
      }, 0.2);
    }
    vee.data.leavets = 0;
  };
app.addCatNotification = function () {
    if (!game.Data.isAndroid) {
      return;
    }
    var local0 = game.Data.getEnergy();
    var local1 = {
      tag: "0",
      closetime: "" + new Date().getTime(),
    };
    var local2 = 86400000;
    local1.fireDate1 = "" + local2 * 3;
    local1.ticker1 = vee.Utils.getLocalizedStringForKey("Have you forgotten me?");
    local1.title1 = vee.Utils.getLocalizedStringForKey("Have you forgotten me?");
    local1.content1 = vee.Utils.getLocalizedStringForKey("Meow~~~ I miss you. Still remember the days we advance in the game? Wanna go back to Phantom World for more surprise!");
    local1.fireDate2 = "" + local2 * 7;
    local1.ticker2 = vee.Utils.getLocalizedStringForKey("Have you forgotten me?");
    local1.title2 = vee.Utils.getLocalizedStringForKey("Have you forgotten me?");
    local1.content2 = vee.Utils.getLocalizedStringForKey("Meow~~~ I miss you. Still remember the days we advance in the game? Wanna go back to Phantom World for more surprise!");
    local1.fireDate3 = "" + local2 * 14;
    local1.ticker3 = vee.Utils.getLocalizedStringForKey("Have you forgotten me?");
    local1.title3 = vee.Utils.getLocalizedStringForKey("Have you forgotten me?");
    local1.content3 = vee.Utils.getLocalizedStringForKey("Meow~~~ I miss you. Still remember the days we advance in the game? Wanna go back to Phantom World for more surprise!");
    if (local0 < 5) {
      var local3 = 5 - local0 - 1;
      if (local3 < 0) {
        local3 = 0;
      }
      var local4 = game.Data.getEnergyReviveTs();
      var local5 = new Date().getTime();
      var local6 = parseInt(local4 - local5) + local3 * game.Data.energyReviveDelay;
      cc.log("arg1 = " + local0);
      cc.log("arg2 = " + parseInt(local4 - local5));
      cc.log("arg1 = " + local3);
      cc.log("arg1 = " + game.Data.energyReviveDelay);
      cc.log("arg1 = " + local4);
      cc.log("arg1 = " + local5);
      cc.log("energy full revive time left : " + local6);
      local1.fireDate4 = "" + local6;
      local1.ticker4 = vee.Utils.getLocalizedStringForKey("Meow~~~ Energy is full!");
      local1.title4 = vee.Utils.getLocalizedStringForKey("Meow~~~ Energy is full!");
      local1.content4 = vee.Utils.getLocalizedStringForKey("Here we go, Mr. White!  It's time for journey! Meow~~~ Let's continue completing levels! Characters and locked levels are waiting for us!!!");
    }
    vee.Common.getInstance().addLocalNotification(local1);
  };
app.closeGame = function () {
    app.addCatNotification();
  };
