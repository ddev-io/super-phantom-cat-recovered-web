// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/common/onlineConfig.dis
var vee = vee || {};
vee.OnlineConfig = {
  pOnlineConfigPlugin: null,
  activate: function (arg0) {
    this.pOnlineConfigPlugin = arg0;
  },
  getConfigParam: function (arg0, arg1) {
    arg1 = arg1 || 0;
    if (this.pOnlineConfigPlugin) {
      var local0 = this.pOnlineConfigPlugin.callStringFuncWithParam("getOnlineConfig", new plugin.PluginParam(undefined, plugin.PluginParam.ParamType.TypeStringMap, {
        key: arg0
      }));
      return local0 === null ? arg1 : local0;
    }
    cc.log("Plugin online config not found!");
    return arg1;
  }
};
