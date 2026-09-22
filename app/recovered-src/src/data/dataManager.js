// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/data/dataManager.dis
vee.dataManager = {
  setData: function (arg0, arg1) {
    vee.data[arg0] = arg1;
    vee.saveData();
  },
  getData: function (arg0) {
    return vee.data[arg0];
  },
  getPower: function () {
    return this.getData("power");
  },
  setPower: function (arg0) {
    this.setData("power", arg0);
  },
  getPowerTs: function () {
    return this.getData("power_ts");
  },
  setPowerTs: function (arg0) {
    this.setData("power_ts", arg0);
  },
  getEnergy: function () {
    return this.getData("energy");
  },
  setEnergy: function (arg0) {
    this.setData("energy", arg0);
  },
  getEnergyTs: function () {
    return this.getData("energy_ts");
  },
  setEnergyTs: function (arg0) {
    this.setData("energy_ts", arg0);
  },
  getSavePointIdx: function () {
    return this.getData("savePointIdx");
  },
  setSavePointIdx: function (arg0) {
    this.setData("savePointIdx", arg0);
  },
  getTpCoin: function () {
    return this.getData("tpcoin");
  },
  setTpCoin: function (arg0) {
    this.setData("tpcoin", arg0);
  },
  getSelectLvIdx: function () {
    var local0 = this.getData("selectedLvIdx");
    return parseInt(local0 ? local0 : 1);
  },
  setSelectLvIdx: function (arg0) {
    this.setData("selectedLvIdx", arg0);
  },
  getIsFirstClickCategory9: function () {
    return this.getData("isFirstClickThanksgivingCategory");
  },
  setIsFirstClickCategory9: function () {
    this.setData("isFirstClickThanksgivingCategory", "false");
  },
  isUnlockParkourLevel: function (arg0) {
    return this.getData(("parkourLevelUnlock_" + arg0));
  },
  unlockParkourLevel: function (arg0) {
    this.setData(("parkourLevelUnlock_" + arg0), "true");
  },
  isOldPlayerInParkour: function () {
    return this.getData("isOldPlayerInParkour");
  },
  setOldplayerInParkour: function (arg0) {
    this.setData("isOldPlayerInParkour", arg0);
  },
  isAllParkourLevelUnlock: function () {
    return this.getData("allParkourLevelUnlock");
  },
  setAllParkourLevelUnlock: function () {
    this.setData("allParkourLevelUnlock", "true");
  },
  getPreloginTime: function () {
    return this.getData("loginTime");
  },
  checkHasContinuousLogin: function () {
    var local0 = this.getPreloginTime();
    if (!local0) {
      return false;
    }
    var local1 = new Date();
    var local2 = local0.split("|");
    var local3 = new Date(local1.getFullYear(), local1.getMonth(), local1.getDate());
    var local4 = new Date(local2[0], local2[1], local2[2]);
    var local5 = (local3 - local4) / 86400000;
    if (local5 > 1) {
      vee.Analytics.UGameEvent.registerSuperProperty("super_countionDay", local5 * -1);
    }
    cc.log("date index ======" + local5);
    if (local5 == 1) {
      if (this.getContinuousLoginDays() == 0) {
        cc.log("zq debug getContinuousLoginDays 1111");
        this.setIsSuccessContinuousLogin("true");
      }
      this.setContinuousLoginDays(this.getContinuousLoginDays() + 1);
      vee.Analytics.UGameEvent.registerSuperProperty("super_countionDay", this.getContinuousLoginDays());
      return true;
    }
    if (local5 > 1) {
      var local6 = this.getContinuousLoginDays() - local5 + 1;
      if (this.getContinuousLoginDays() > 4) {
        local6 = 4 - local5 + 1;
      }
      var local7 = local6 > 0 ? local6 : 0;
      cc.log("zq debug getContinuousLoginDays 22222 ====" + local7);
      this.setIsSuccessContinuousLogin(local7 == 0 ? "true" : "false");
      this.setContinuousLoginDays(local7);
      return local7 > 0 ? true : false;
    }
    return false;
  },
  setLoginTime: function () {
    var local0 = new Date();
    this.setData("loginTime", ((((("" + local0.getFullYear()) + "|") + local0.getMonth()) + "|") + local0.getDate()));
  },
  getContinuousLoginDays: function () {
    var local0 = parseInt(this.getData("continuousDays"));
    return local0 ? local0 : 0;
  },
  setContinuousLoginDays: function (arg0) {
    if (arg0 == 3) {
      cc.log("push no ad notiction");
    }
    this.setData("continuousDays", "" + arg0);
  },
  isSuccessContinuousLogin: function () {
    var local0 = this.getData("isSuccessContinuousLogin");
    return (local0 === "true");
  },
  setIsSuccessContinuousLogin: function (arg0) {
    this.setData("isSuccessContinuousLogin", ("" + arg0));
  },
  isNewVersionRate: function () {
    return this.getData("version_code_rate_" + game.Data.version.codeVersion) !== "false";
  },
  setVersionRateFalse: function () {
    this.setData(("version_code_rate_" + game.Data.version.codeVersion), "false");
  },
  isCanPlayWithFriend: function () {
    return this.getData("isCanPlayWithFriend") === "true";
  },
  setPlayWithFriend: function () {
    this.setData("isCanPlayWithFriend", "true");
  }
};

if (typeof game !== "undefined") {
  game.dataManager = vee.dataManager;
}
