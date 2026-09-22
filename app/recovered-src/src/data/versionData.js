// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/data/versionData.dis
var game = game || {};
var VERSION = {
  ANDROID_GOOGLE_FREE: 1,
  ANDROID_WECHAT: 2,
  ANDROID_GENUINE: 3,
  IOS_GENUINE: 101,
  IOS_FREE: 102,
  IOS_FREE_CN: 103,
  TVOS_GENUINE: 201
};
game.Data.version = {
  curVersion: VERSION.ANDROID_GOOGLE_FREE,
  codeVersion: 11,
  zqdebug: false,
  newVersion: true,
  isNewIosVersion: true,
  isKTPlay: false,
  isAutoSave: true,
  isMidAutumn: true,
  isNewRateVersion: true,
  isAdmobAd: false,
  isSetShowSpecialEvent: true,
  isQXSdk: false,
  isMultiDemo: true,
  init: function () {
    game.Data.zqdebug = this.zqdebug;
    if (cc.sys.os == cc.sys.OS_ANDROID) {
      game.Data.isAndroid = true;
    } else {
      game.Data.isAndroid = false;
    }
    game.Data.isFreeGame = false;
    game.Data.isReverseWorldOpen = false;
    game.Data.isIOSCN = false;
    game.Data.isWeiXin = false;
    this.newVersion = false;
    this.isNewIosVersion = false;
    this.isKTPlay = false;
    this.isAutoSave = false;
    switch (this.curVersion) {
      case VERSION.IOS_FREE:
        game.Data.isFreeGame = true;
        this.newVersion = true;
        this.isNewIosVersion = true;
        game.Data.isReverseWorldOpen = true;
        this.isNewRateVersion = true;
        this.isAdmobAd = true;
        this.isSetShowSpecialEvent = true;
        this.isQXSdk = true;
        break;
      case VERSION.IOS_GENUINE:
      case VERSION.TVOS_GENUINE:
        game.Data.isReverseWorldOpen = true;
        vee.data.moon = true;
        this.isNewRateVersion = true;
        this.isSetShowSpecialEvent = true;
        break;
      case VERSION.IOS_FREE_CN:
        game.Data.isFreeGame = true;
        game.Data.isIOSCN = true;
        this.newVersion = true;
        this.isNewIosVersion = true;
        this.isAdmobAd = true;
        game.Data.isReverseWorldOpen = true;
        this.isKTPlay = true;
        break;
      case VERSION.ANDROID_GOOGLE_FREE:
        game.Data.isFreeGame = true;
        game.Data.isReverseWorldOpen = true;
        this.newVersion = true;
        this.isAutoSave = true;
        this.isNewRateVersion = true;
        this.isAdmobAd = true;
        this.isSetShowSpecialEvent = true;
        this.isQXSdk = true;
        break;
      case VERSION.ANDROID_WECHAT:
        game.Data.isWeiXin = true;
        game.Data.isReverseWorldOpen = true;
        break;
      case VERSION.ANDROID_GENUINE:
        game.Data.isReverseWorldOpen = true;
        game.Data.isClearVersion = true;
        break;
    }
    app.configManager.init();
  },
  isShowSpecialLevel: function () {
    if (this.isSetShowSpecialEvent) {
      cc.log("check is show special level event");
      var local0 = game.LevelData.getCategory(0);
      var local1 = local0.getLevelData(2).isLevelPassed;
      if (local1 || game.LevelData.getCategory(1).getLevelData(0).isLevelPassed) {
        return true;
      }
      return false;
    }
  }
};
