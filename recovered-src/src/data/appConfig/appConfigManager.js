// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/data/appConfig/appConfigManager.dis
var app = app || {};
app.configManager = {
  AppName: "SuperCat",
  AppAlias: "supercat",
  AppURL: null,
  RateURL: null,
  PromoURL: "http://www.veewo.com",
  PromoChannel: "promo",
  PromoBannerEnable: true,
  PromoFullScreenEnable: true,
  GameCenterPluginName: "SocialGameCenter",
  AnalyticsPluginName: "AnalyticsUmengGame",
  AnalyticsPluginADTrackName: "AnalyticsMAT",
  IAPPluginName: "IAPManager",
  AdBannerPluginName: "AdsAdapter",
  AdInterstialPluginName: "AdsAdapter",
  SharePluginName: "VeeShare",
  AdVideoPluginName: "AdsVungle",
  IsBannerEnabled: true,
  IsInterestialEnabled: true,
  AdPosConfig: [],
  AdPosEntityConfig: [],
  init: function () {
    switch (game.Data.version.curVersion) {
      case VERSION.IOS_GENUINE:
      case VERSION.TVOS_GENUINE:
        this.initConfigByTable(appConfig_IOS);
        break;
      case VERSION.IOS_FREE:
        this.initConfigByTable(appConfig_IOS_Free);
        break;
      case VERSION.IOS_FREE_CN:
        this.initConfigByTable(appConfig_IOS_Free_CN);
        break;
      case VERSION.ANDROID_GOOGLE_FREE:
        this.initConfigByTable(appConfig_Android_free);
        break;
    }
  },
  initConfigByTable: function (arg0) {
    app.Config = arg0;
  }
};
