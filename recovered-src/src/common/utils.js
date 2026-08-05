// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/common/utils.dis
var vee = vee || {};
String.prototype.replaceAll = function (arg0, arg1, arg2) {
    if (!RegExp.prototype.isPrototypeOf(arg0)) {
      return this.replace(new RegExp(arg0, arg2 ? "gi" : "g"), arg1);
    }
    return this.replace(arg0, arg1);
  };
vee.Utils = {
  preLoad: function (arg0, arg1, arg2) {
    for (var local0 = 0; local0 < arg0.length; local0++) {
      var local1 = arg0[local0];
      var local2 = local1.src ? local1.src : local1;
      var local3 = local1.type ? local1.type : String(local2).split(".").pop();
      switch (local3) {
        case "music":
        case "mp3":
        case "caf":
        case "ogg":
        case "wav":
          cc.AudioEngine.getInstance().preloadMusic(local2);
          break;
        case "sound":
          cc.AudioEngine.getInstance().preloadEffect(local2);
          break;
        case "image":
        case "png":
        case "jpeg":
        case "jpg":
          cc.TextureCache.getInstance().addImage(local2);
          break;
        case "plist":
          cc.SpriteFrameCache.getInstance().addSpriteFrames(local2);
          break;
      }
    }
    if (arg1) {
      arg1.call(arg2);
    }
  },
  collideWithCallback: function (arg0, arg1, arg2, arg3, arg4, arg5) {
    var local0 = arg2;
    var local1 = arg3;
    var local2 = [cc.p(0, 0), cc.p(0, 0)];
    for (var local3 = 0; local3 < arg1; local3 += arg0) {
      if (arg5(local0, local1)) {
        this.scheduleOnce(function () {
          arg5(local0, local1);
        }, local3);
        return;
      }
      local2 = arg4(arg0);
      local0 = vee.Utils.addPoints(local2[0], local0);
      local1 = vee.Utils.addPoints(local2[1], local1);
    }
  },
  getTimeNow: function () {
    return new Date().getTime();
  },
  getDeltaTime: function (arg0) {
    var local0 = Math.floor(arg0 / 3600);
    var local1 = Math.floor((arg0 - local0 * 3600) / 60);
    var local2 = Math.floor(arg0 - local0 * 3600 - local1 * 60);
    return {
      hours: local0,
      minutes: local1,
      seconds: local2
    };
  },
  formatTimeWithSecond: function (arg0) {
    var local0 = this.getDeltaTime(arg0);
    if (local0.hours < 10) {
      local0.hours = "0" + local0.hours;
    }
    if (local0.minutes < 10) {
      local0.minutes = "0" + local0.minutes;
    }
    if (local0.seconds < 10) {
      local0.seconds = "0" + local0.seconds;
    }
    return local0.hours + ":" + local0.minutes + ":" + local0.seconds;
  },
  roundNumber: function (arg0, arg1) {
    var local0 = Math.pow(10, arg1);
    return Math.round(arg0 * local0) / local0;
  },
  isEmpty: function (arg0) {
    if (arg0 == null) {
      return true;
    }
    if (arg0.length > 0) {
      return false;
    }
    if (arg0.length === 0) {
      return true;
    }
    for (var local0 in arg0) {
      if (Object.prototype.hasOwnProperty.call(arg0, local0)) {
        return false;
      }
    }
    return true;
  },
  iterateChildren: function (arg0, arg1, arg2) {
    var local0 = arg0.getChildren();
    var local1 = true;
    if (arg2) {
      for (var local2 = local0.length - 1; local2 >= 0; local2--) {
        local1 = arg1(local0[local2], local2, arg0);
        if (local1 === false) {
          return false;
        }
      }
      return undefined;
    }
    for (var local2 = 0; local2 < local0.length; local2++) {
      local1 = arg1(local0[local2], local2, arg0);
      if (local1 === false) {
        return false;
      }
    }
  },
  getValues: function (arg0) {
    var local0 = [];
    for (var local1 in arg0) {
      if (arg0.hasOwnProperty(local1)) {
        local0.push(arg0[local1]);
      }
    }
    return local0;
  },
  forEach: function (arg0, arg1, arg2) {
    var local0 = true;
    for (var local1 = 0; local1 < arg0.length; local1++) {
      local0 = arg1.call(arg2, arg0[local1], local1, arg0);
      if (local0 === false) {
        return local0;
      }
    }
  },
  getArrayOfObj: function (arg0, arg1) {
    var local0 = [];
    for (var local1 = 0; local1 < arg0; local1++) {
      local0.push(this.copy(arg1));
    }
    return local0;
  },
  scheduleCallbackForTarget: function () {
    var local0 = cc.director.getScheduler();
    local0.scheduleCallbackForTarget.apply(local0, Array.prototype.slice.call(arguments));
  },
  scheduleOnceForTarget: function (arg0, arg1, arg2) {
    var local0 = cc.director.getScheduler();
    local0.scheduleCallbackForTarget(arg0, arg1, 0, 0, arg2);
  },
  scheduleResumeTarget: function (arg0) {
    cc.director.getScheduler().resumeTarget(arg0);
  },
  schedulePauseTarget: function (arg0) {
    cc.director.getScheduler().pauseTarget(arg0);
  },
  unscheduleCallbackForTarget: function () {
    var local0 = cc.director.getScheduler();
    local0.unscheduleCallbackForTarget.apply(local0, Array.prototype.slice.call(arguments));
  },
  unscheduleAllCallbacksForTarget: function (arg0) {
    cc.director.getScheduler().unscheduleAllForTarget(arg0);
  },
  generateInstance: function () {
    var theClass = arguments[0];
    theClass.getInstance = function () {
      if (!theClass._instance) {
        theClass._instance = new theClass();
      }
      return theClass._instance;
    };
  },
  randomInt: function (arg0, arg1) {
    var local0 = arg1 - arg0;
    return Math.floor(Math.random() * (local0 + 1)) + arg0;
  },
  randomChoice: function (arg0) {
    var local0 = vee.Utils.randomInt(0, arg0.length - 1);
    return arg0[local0];
  },
  lineIntersectLine: function (arg0, arg1, arg2, arg3) {
    var local0 = arg1.x - arg0.x;
    var local1 = arg1.y - arg0.y;
    var local2 = arg3.x - arg2.x;
    var local3 = arg3.y - arg2.y;
    var local4 = (-local1 * (arg0.x - arg2.x) + local0 * (arg0.y - arg2.y)) / (-local2 * local1 + local0 * local3);
    var local5 = (local2 * (arg0.y - arg2.y) - local3 * (arg0.x - arg2.x)) / (-local2 * local1 + local0 * local3);
    return local4 >= 0 && local4 <= 1 && local5 >= 0 && local5 <= 1;
  },
  lineIntersectCircle: function (arg0, arg1, arg2, arg3) {
    var local0 = this.pointToLineSquaredDistance(arg2, arg0, arg1);
    return arg3 * arg3 >= local0;
  },
  lineIntersectRect: function (arg0, arg1, arg2) {
    var local0 = cc.p(arg2.x, arg2.y);
    var local1 = cc.p(arg2.x + arg2.width, arg2.y);
    var local2 = cc.p(arg2.x + arg2.width, arg2.y + arg2.height);
    var local3 = cc.p(arg2.x, arg2.y + arg2.height);
    var local4 = [[local0, local1], [local1, local2], [local2, local3], [local3, local0]];
    for (var local5 = 0; local5 < local4.length; local5++) {
      var local6 = local4[local5];
      if (vee.Utils.lineIntersectLine(arg0, arg1, local6[0], local6[1])) {
        return true;
      }
    }
    return false;
  },
  pointToLineSquaredDistance: function (arg0, arg1, arg2) {
    var local0 = this.distancePower2BetweenPoints(arg1, arg2);
    if (local0 == 0) {
      return this.distancePower2BetweenPoints(arg0, arg1);
    }
    var local1 = ((arg0.x - arg1.x) * (arg2.x - arg1.x) + (arg0.y - arg1.y) * (arg2.y - arg1.y)) / local0;
    if (local1 < 0) {
      return this.distancePower2BetweenPoints(arg0, arg1);
    }
    if (local1 > 1) {
      return this.distancePower2BetweenPoints(arg0, arg2);
    }
    return this.distancePower2BetweenPoints(arg0, {
      x: arg1.x + local1 * (arg2.x - arg1.x),
      y: arg1.y + local1 * (arg2.y - arg1.y)
    });
  },
  logObj: function () {
  },
  logKey: function (arg0, arg1) {
    cc.log("Object Name:\t" + arg1);
    cc.log("{");
    for (var local0 in arg0) {
      cc.log("\t" + local0 + " : " + typeof arg0[local0]);
    }
    cc.log("}");
  },
  logValue: function (arg0, arg1, arg2) {
    cc.log("Object Name:\t" + arg1);
    cc.log("{");
    for (var local0 in arg0) {
      var local1 = arg0[local0];
      if (_.isNull(local1)) {
        cc.log("\t" + local0 + " : null");
      } else if (_.isString(local1)) {
        cc.log("\t" + local0 + " : \"" + local1.toString() + "\"");
      } else if (_.isNumber(local1) || _.isBoolean(local1)) {
        cc.log("\t" + local0 + " : " + local1.toString());
      } else if (!arg2) {
        cc.log("\t" + local0 + " : " + typeof arg0[local0]);
      }
    }
    cc.log("}");
  },
  saveObj: function (arg0, arg1) {
    if (arg0 === null || arg0 === undefined) {
      return undefined;
    }
    vee.Common.getInstance().saveToFile(arg0, game.loginPlatform + arg1);
  },
  loadObj: function () {
    var local0 = (typeof game !== "undefined" && game.loginPlatform ? game.loginPlatform : "") + arguments[0] + ".o";
    var local1 = "";
    if (typeof vee !== "undefined" && vee.Common && vee.Common.getInstance) {
      local1 = vee.Common.getInstance().loadFromFile(local0);
    } else if (typeof cc !== "undefined" && cc.sys && cc.sys.localStorage) {
      local1 = cc.sys.localStorage.getItem(local0);
    }
    if (local1 === "" || local1 === null || local1 === undefined) {
      return null;
    }
    return eval("(" + local1 + ")");
  },
  getInt: function (arg0) {
    return vee.Common.getInstance().getInt(arg0);
  },
  saveInt: function (arg0, arg1) {
    vee.Common.getInstance().saveInt(arg0, arg1);
  },
  removeObj: function (arg0, arg1, arg2) {
    var local0 = arg2 ? arg2 : arg0[arg1];
    var local1 = arg0.pop();
    if (local0 != local1) {
      arg0[arg1] = local1;
    }
  },
  radianToDegree: function (arg0) {
    return arg0 * (180 / Math.PI);
  },
  degreeToRadian: function (arg0) {
    return arg0 * Math.PI / 180;
  },
  distanceBetweenPoints: function (arg0, arg1) {
    return Math.sqrt(this.distancePower2BetweenPoints(arg0, arg1));
  },
  distancePower2BetweenPoints: function (arg0, arg1) {
    arg1 = arg1 ? arg1 : cc.p(0, 0);
    var local0 = arg1.x - arg0.x;
    var local1 = arg1.y - arg0.y;
    return local0 * local0 + local1 * local1;
  },
  manhattanDistance: function (arg0) {
    return (Math.abs(arg0.x) + Math.abs(arg0.y));
  },
  addPoints: function (arg0, arg1) {
    return cc.p((arg0.x + arg1.x), (arg0.y + arg1.y));
  },
  pAdd: function (arg0, arg1) {
    return this.addPoints(arg0, arg1);
  },
  multiPoints: function (arg0, arg1) {
    return cc.p(arg0.x * (arg1.x ? arg1.x : arg1), arg0.y * (arg1.y ? arg1.y : arg1));
  },
  pMult: function (arg0, arg1) {
    return this.multiPoints(arg0, arg1);
  },
  substractPoints: function (arg0, arg1) {
    return cc.p((arg0.x - arg1.x), (arg0.y - arg1.y));
  },
  pSub: function (arg0, arg1) {
    return this.substractPoints(arg0, arg1);
  },
  getPointWithOffset: function (arg0, arg1, arg2) {
    var local0 = vee.Utils.distanceBetweenPoints(cc.p(0, 0), arg2);
    var local1 = arg2.x === 0 ? arg2.x : arg1 / local0 * arg2.x;
    var local2 = arg2.y === 0 ? arg2.y : arg1 / local0 * arg2.y;
    return cc.p(arg0.x + local1, arg0.y + local2);
  },
  getPointWithAngle: function (arg0, arg1, arg2) {
    var local0 = arg2 * Math.PI / 180;
    var local1 = Math.sin(local0) * arg1;
    var local2 = Math.cos(local0) * arg1;
    return cc.p(arg0.x + local1, arg0.y + local2);
  },
  angleBetweenLines: function (arg0, arg1, arg2, arg3) {
    var local0 = arg1.x - arg0.x;
    var local1 = arg1.y - arg0.y;
    var local2 = arg3.x - arg2.x;
    var local3 = arg3.y - arg2.y;
    if ((local0 === 0 && local1 === 0) || (local2 === 0 && local3 === 0)) {
      return 0;
    }
    var local4 = Math.acos((local0 * local2 + local1 * local3) / (Math.sqrt(local0 * local0 + local1 * local1) * Math.sqrt(local2 * local2 + local3 * local3)));
    return vee.Utils.radianToDegree(local4);
  },
  angleOfLine: function (arg0, arg1) {
    arg1 = arg1 ? arg1 : cc.p(0, 0);
    var local0 = arg1.x - arg0.x;
    var local1 = arg1.y - arg0.y;
    if (local0 == 0) {
      return local1 > 0 ? 0 : 180;
    }
    var local2 = local0 > 0 ? 1 : -1;
    var local3 = Math.acos(local1 / Math.sqrt(local0 * local0 + local1 * local1));
    var local4 = local2 * vee.Utils.radianToDegree(local3);
    if (local4 < 0) {
      local4 += 360;
    }
    return local4;
  },
  callFunction: function (arg0) {
    if (arg0) {
      return arg0.apply(null, Array.prototype.slice.call(arguments, 1));
    }
  },
  scheduleOnce: function (arg0, arg1) {
    var local0 = {
      callback: function () {
        arg0(arg1);
      }
    };
    vee.Utils.scheduleOnceForTarget(local0, local0.callback, 0);
  },
  _scheduleBackFunc: null,
  scheduleBack: function () {
    var local0 = arguments[0];
    var local1 = arguments[1];
    this._scheduleBackFunc = function () {
      local0();
      this._scheduleBackFunc = null;
    };
    this.scheduleOnce(this._scheduleBackFunc.bind(this), local1);
  },
  warpEaseAction: function (arg0, arg1, arg2) {
    arg1 = arg1 ? arg1 : vee.EaseType.LINER;
    arg2 = arg2 ? arg2 : 3;
    var local0 = null;
    switch (arg1) {
      case vee.EaseType.LINER:
        local0 = arg0;
        break;
      case vee.EaseType.EASE_IN:
        local0 = cc.EaseIn.create(arg0, arg2);
        break;
      case vee.EaseType.EASE_OUT:
        local0 = cc.EaseOut.create(arg0, arg2);
        break;
      case vee.EaseType.EASE_IN_OUT:
        local0 = cc.EaseInOut.create(arg0, arg2);
        break;
      case vee.EaseType.EASE_EXP_IN:
        local0 = cc.EaseExponentialIn.create(arg0);
        break;
      case vee.EaseType.EASE_EXP_OUT:
        local0 = cc.EaseExponentialOut.create(arg0);
        break;
    }
    return local0;
  },
  shareScreen: function (arg0, arg1, arg2) {
    if (!arg2) {
      arg2 = vee.Share.ShareType.BOTH;
    }
    arg1 = arg1 ? arg1 : vee.PopMgr.rootNode;
    var local0 = vee.Common.getInstance();
    vee.Promo.hideMoreGameBanner();
    var local1 = local0.saveImage(arg1, "shareImage.jpg");
    vee.Promo.showMoreGameBanner();
    vee.Share.share(arg0, local1, app.Config.AppURL, arg2);
  },
  shareMsg: function (arg0, arg1) {
    this.shareScreen(arg0, arg1, vee.Share.ShareType.MSG_ONLY);
  },
  shareImage: function (arg0) {
    this.shareScreen("", arg0, vee.Share.ShareType.IMG_ONLY);
  },
  getPlayerName: function () {
    return vee.GameCenter.getPlayerName();
  },
  openURL: function (arg0) {
    var local0 = vee.Common.getInstance();
    local0.openURL(arg0);
  },
  isDebugMode: function () {
    return vee.Common.getInstance().isDebugMode();
  },
  rateUs: function () {
    var local0 = vee.Common.getInstance();
    var local1 = app.Config.AppID;
    local0.rateUs(local1);
  },
  showAppById: function (arg0) {
    var local0 = vee.Common.getInstance();
    local0.rateUs(arg0);
  },
  showRateUs: function (arg0, arg1) {
    if (!arg0 && !arg1) {
      arg0 = "RateUsCount";
      arg1 = app.Config.arrRateUs;
    }
    if (!arg1) {
      cc.log("Need app.Config.arrRateUs to be defined");
      return undefined;
    }
    if (!vee.data[arg0]) {
      vee.data[arg0] = 0;
    }
    vee.data[arg0] = parseInt(vee.data[arg0]) + 1;
    for (var local0 in app.Config.arrRateUs) {
      var local1 = app.Config.arrRateUs[local0];
      if (parseInt(vee.data[arg0]) == local1 && !vee.data.RatedUs) {
        vee.PopMgr.alert(vee.Utils.getLocalizedStringForKey("Have fun? \nPlease rate us!"), vee.Utils.getLocalizedStringForKey("RATE US"), function () {
          vee.Utils.rateUs();
          vee.data.RatedUs = true;
          vee.saveData();
        }, true);
        return true;
      }
    }
    return false;
  },
  rate: function () {
    vee.Utils.rateUs();
  },
  getStringByPlatform: function (arg0, arg1, arg2) {
    return this.getObjByPlatform(arg0, arg1, arg2);
  },
  getObjByPlatform: function (arg0, arg1, arg2) {
    var local0 = {};
    if (typeof game !== "undefined" && game.Data && game.Data.version && game.Data.version.curVersion === VERSION.TVOS_GENUINE) {
      local0[cc.sys.OS_TVOS] = arg0;
    } else {
      local0[cc.sys.OS_IOS] = arg0;
    }
    local0[cc.sys.OS_ANDROID] = arg1;
    var local1 = local0[cc.sys.os];
    if (local1 === undefined) {
      return arg2;
    }
    return local1;
  },
  getStringByLanguage: function (arg0) {
    return this.getLocalizedStringForKey(arg0);
  },
  getObjByLanguage: function (arg0, arg1, arg2, arg3, arg4) {
    var local0 = {};
    if (_.isArray(arg0)) {
      local0[cc.sys.LANGUAGE_ENGLISH] = arg0[0];
      local0[cc.sys.LANGUAGE_CHINESE] = arg0[1];
      local0[cc.sys.LANGUAGE_KOREAN] = arg0[2];
      local0[cc.sys.LANGUAGE_JAPANESE] = arg0[3];
      local0[cc.sys.LANGUAGE_GERMAN] = arg0[4];
    } else {
      local0[cc.sys.LANGUAGE_ENGLISH] = arg0;
      local0[cc.sys.LANGUAGE_CHINESE] = arg1;
      local0[cc.sys.LANGUAGE_KOREAN] = arg3;
      local0[cc.sys.LANGUAGE_JAPANESE] = arg2;
      local0[cc.sys.LANGUAGE_GERMAN] = arg4;
    }
    var local1 = local0[cc.sys.language];
    if (local1 === undefined) {
      return local0[cc.sys.LANGUAGE_ENGLISH];
    }
    return local1;
  },
  RequestType: {
    GET: 0,
    POST: 1,
    PUT: 2,
    DELETE: 3,
    UNKNOWN: 4
  },
  getObjWithURL: function (arg0, arg1, arg2, arg3, arg4) {
    if (arg2 && arg3) {
      arg3 = "a=" + arg2 + "&v=1&body=" + arg3;
    }
    this.requestURL(arg0, arg3, arg3 ? this.RequestType.POST : this.RequestType.GET, arg1, arg4 ? true : false);
  },
  getObjWithURLOld: function (arg0, arg1, arg2, arg3, arg4) {
    vee.Common.getInstance().requestServerOld(arg0, 1, arg2 ? arg2 : "", arg3 ? arg3 : "", function (value) {
      vee.Utils.logObj(value, "getObjectWithURLOld");
      arg1(value);
    }, arg4 ? true : false);
  },
  downloadFileFromURL: function (arg0, arg1) {
    this.requestURL(arg0, "", this.RequestType.GET, arg1, false);
  },
  uploadObjFromURL: function (arg0, arg1, arg2) {
    this.requestURL(arg0, arg1, this.RequestType.PUT, arg2, false);
  },
  getApiFromURL: function () {
    this.requestURL(url, "", this.RequestType.POST, callback, true);
  },
  requestURL: function (arg0, arg1, arg2, arg3, arg4) {
    vee.Common.getInstance().requestServer(arg0, arg1 ? JSON.stringify(arg1) : "", arg2 ? arg2 : this.RequestType.GET, function (value) {
      vee.Utils.logObj(value, "requestURL");
      arg3(value);
    }, arg4);
  },
  requestURLOld: function (arg0, arg1, arg2, arg3, arg4) {
    vee.Common.getInstance().requestServerOld(arg0, arg1 ? JSON.stringify(arg1) : "", arg2 ? arg2 : this.RequestType.GET, function (value) {
      vee.Utils.logObj(value, "requestURLOld");
      arg3(value);
    }, arg4);
  },
  isLucky: function (arg0) {
    return this.randomInt(0, 999) < arg0 * 1000;
  },
  copy: function (arg0) {
    if (_.isArray(arg0)) {
      var local0 = [];
      for (var local1 in arg0) {
        local0[local1] = vee.Utils.copy(arg0[local1]);
      }
      return local0;
    }
    if (_.isObject(arg0)) {
      var local2 = {};
      for (var local1 in arg0) {
        local2[local1] = vee.Utils.copy(arg0[local1]);
      }
      return local2;
    }
    return arg0;
  },
  setBtnBackgroundFrame: function (arg0, arg1) {
    arg0.setBackgroundSpriteFrameForState(arg1, 1);
  },
  submitScore: function (arg0, arg1) {
    vee.GameCenter.submitScore(arg0, arg1);
  },
  showLeaderboard: function (arg0) {
    vee.GameCenter.showLeaderboard(arg0);
  },
  launchAppById: function (arg0) {
    var local0 = vee.Common.getInstance();
    return local0.launchApp(arg0);
  },
  checkIsInstalledApp: function (arg0) {
    var local0 = vee.Common.getInstance();
    return local0.checkIsInstalled(arg0);
  },
  checkLocalUpdate: function (arg0) {
    var local0 = vee.Common.getInstance();
    var local1 = local0.checkLocalUpdate();
    if (local1 && _.isFunction(arg0)) {
      arg0();
    }
  },
  isIOS10: function () {
    var local0 = vee.Common.getInstance();
    if (game.Data.isAndroid) {
      return false;
    }
    return local0.isIOS10();
  },
  isIOS103: function () {
    var local0 = vee.Common.getInstance();
    if (game.Data.isAndroid) {
      return false;
    }
    return local0.isIOS103();
  },
  isRecordAvaliable: function () {
    var local0 = vee.Common.getInstance();
    if (game.Data.version.isMultiDemo) {
      return true;
    }
    return local0.isRecordAvaliable();
  },
  recordScreen: function () {
    if (cc.sys.os == cc.sys.OS_ANDROID) {
      vee.GameCenter.showVideoOverlay();
    } else {
      var local0 = vee.Common.getInstance();
      local0.recordScreen();
    }
  },
  stopRecordScreen: function () {
    var local0 = vee.Common.getInstance();
    local0.stopRecordScreen();
  },
  reloadCache: function () {
    var local0 = vee.Common.getInstance();
    local0.reloadCache();
    cc.spriteFrameCache = cc.SpriteFrameCache.getInstance();
  },
  checkPackage: function () {
    var local0 = vee.Common.getInstance();
    local0.checkPackage(app.Config.AppID);
  },
  checkSignature: function () {
    var local0 = vee.Common.getInstance();
    local0.checkSignature(app.Config.signature);
  },
  getLocalizedStringForKey: function (arg0) {
    var local0 = vee.Common.getInstance();
    return local0.getLocalizedStringForKey(arg0);
  },
  forEachGrid: function (arg0, arg1, arg2) {
    var local0 = arg1.x - arg0.x > 0 ? 1 : -1;
    var local1 = arg1.y - arg0.y > 0 ? 1 : -1;
    for (var local2 = arg0.y; local1 > 0 ? local2 <= arg1.y : local2 >= arg1.y; local2 += local1) {
      for (var local3 = arg0.x; local0 > 0 ? local3 <= arg1.x : local3 >= arg1.x; local3 += local0) {
        arg2(cc.p(local3, local2));
      }
    }
  },
  simpleEncode: function (arg0, arg1) {
    if (!arg1) {
      arg0 = arg0.toLowerCase();
    }
    var local0 = arg1 || vee.Utils.CodeMap;
    var local1 = arg0.length;
    if (local1 > 20) {
      return -1;
    }
    var local2 = vee.Utils.randomInt(1, 9);
    var local3;
    var local4 = "" + local2;
    for (var local5 = 0; local5 < local1; local5++) {
      local3 = (local0[arg0[local5]] || parseInt(arg0[local5], 36));
      local3 = local3 + local2 + (local5 % 2 ? local2 : 0);
      local4 += local3 > 9 ? "" + local3 : "0" + local3;
    }
    return local4;
  },
  simpleDecode: function (arg0, arg1) {
    var local0 = arg1 || vee.Utils.CodeMap;
    var local1 = arg0.length;
    var local2 = parseInt(arg0[0]);
    var local3;
    var local4 = "";
    for (var local5 = 1; local5 < local1; local5 += 2) {
      local3 = parseInt(arg0[local5] + arg0[local5 + 1]);
      local3 = local3 - local2 - (((local5 - 1) / 2) % 2 ? local2 : 0);
      local4 += (local0[local3] || local3.toString(36, 0));
    }
    return local4;
  },
  __timing: null,
  beginTiming: function () {
    this.__timing = this.getTimeNow();
  },
  endTiming: function (arg0) {
    if (this.getTimeNow() - this.__timing > 10) {
      cc.log(arg0 + " cost time===" + (this.getTimeNow() - this.__timing));
    }
    this.__timing = this.getTimeNow();
  },
  obj2str: function (arg0) {
    if (typeof arg0 === "string" || arg0 === null) {
      return arg0;
    }
    if (typeof arg0 === "object") {
      return JSON.stringify(arg0);
    }
    return arg0.toString();
  }
};
vee.Utils.logObj = function () {
    function serialize(value, label) {
      var local0 = label ? label + " : " : "";
      if (value === null) {
        return local0 + "null";
      }
      if (typeof value === "string") {
        return local0 + "\"" + value.toString() + "\"";
      }
      if (typeof value === "number" || typeof value === "boolean") {
        return local0 + value.toString();
      }
      if (typeof value === "function") {
        return local0 + "function()";
      }
      return local0 + JSON.stringify(value);
    }
    return function (arg0, arg1) {
      cc.log(serialize(arg0, arg1));
    };
  }();
vee.Utils.saveObj = function () {
    function serialize(value) {
      return JSON.stringify(value);
    }
    return function (arg0, arg1) {
      if (!arg1) {
        if (cc && cc.log) {
          cc.log("Error: saveObj needs a key");
        }
        return undefined;
      }
      var local0 = serialize(arg0);
      var local1 = (typeof game !== "undefined" && game.loginPlatform ? game.loginPlatform : "") + arg1 + ".o";
      if (typeof vee !== "undefined" && vee.Common && vee.Common.getInstance) {
        vee.Common.getInstance().saveToFile(local0, local1);
      } else if (typeof cc !== "undefined" && cc.sys && cc.sys.localStorage) {
        cc.sys.localStorage.setItem(local1, local0);
      }
    };
  }();
vee.Utils.CodeMap = {
  ".": 36,
  "36": ".",
  ":": 37,
  "37": ":"
};
vee.EaseType = {
  LINER: 1,
  EASE_IN: 2,
  EASE_OUT: 3,
  EASE_IN_OUT: 4,
  EASE_EXP_OUT: 5,
  EASE_EXP_IN: 6
};
