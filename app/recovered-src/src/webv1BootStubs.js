(function (root) {
  function noop() {}
  function asyncNoopCallback(callback, value) {
    if (typeof callback === "function") {
      setTimeout(function () {
        try {
          callback(value);
        } catch (error) {
        }
      }, 0);
    }
  }

  function ensureObject(holder, key) {
    if (!holder[key] || typeof holder[key] !== "object") {
      holder[key] = {};
    }
    return holder[key];
  }

  function ensureFunc(holder, key, fallback) {
    if (typeof holder[key] !== "function") {
      holder[key] = fallback || noop;
    }
    return holder[key];
  }

  root.vee = root.vee || {};
  var localStorageRef = root.cc && root.cc.sys ? root.cc.sys.localStorage : (root.localStorage || null);

  function storageSet(key, value) {
    if (!localStorageRef) {
      return;
    }
    try {
      localStorageRef.setItem(key, value);
    } catch (error) {
    }
  }

  function storageGet(key) {
    if (!localStorageRef) {
      return "";
    }
    try {
      return localStorageRef.getItem(key) || "";
    } catch (error) {
      return "";
    }
  }

  function requestMethodName(method) {
    if (method === 1 || method === "POST") {
      return "POST";
    }
    if (method === 2 || method === "PUT") {
      return "PUT";
    }
    if (method === 3 || method === "DELETE") {
      return "DELETE";
    }
    return "GET";
  }

  var ad = ensureObject(root.vee, "Ad");
  ensureFunc(ad, "showBannerAd");
  ensureFunc(ad, "hideBannerAd");
  ensureFunc(ad, "preloadVideoAd");
  ensureFunc(ad, "showInterstitialByOnlineConfig");
  ensureFunc(ad, "checkCacheVideoAd", function () {
    return false;
  });
  ensureFunc(ad, "showVideoAd", function (callback) {
    if (typeof callback === "function") {
      try {
        callback(false);
      } catch (error) {
      }
    }
    return false;
  });

  var analytics = ensureObject(root.vee, "Analytics");
  if (!("pAnalytics" in analytics)) {
    analytics.pAnalytics = null;
  }
  ensureFunc(analytics, "activate");
  ensureFunc(analytics, "loadPlugins");
  ensureFunc(analytics, "unloadPlugin");
  ensureFunc(analytics, "loadFeedbackAngent");
  ensureFunc(analytics, "getAnalytics", function () {
    return analytics.pAnalytics || null;
  });
  ensureFunc(analytics, "logEvent");
  ensureFunc(analytics, "ugameLogEvent");
  ensureFunc(analytics, "startSession");
  ensureFunc(analytics, "stopSession");
  ensureFunc(analytics, "logTimedEventBegin");
  ensureFunc(analytics, "logTimedEventEnd");
  ensureFunc(analytics, "registerSuperProperty");
  ensureFunc(analytics, "logPlayerLevel");
  ensureFunc(analytics, "logItemPurchase");
  ensureFunc(analytics, "logItemUse");
  ensureFunc(analytics, "logChargeRequest");
  ensureFunc(analytics, "logChargeSuccess");
  ensureFunc(analytics, "logMissionStart");
  ensureFunc(analytics, "logMissionCompleted");
  ensureFunc(analytics, "logMissionFailed");
  ensureFunc(analytics, "logReward");
  ensureFunc(analytics, "logBonus");
  ensureFunc(analytics, "logAdTrackingCustEvent1");
  ensureFunc(analytics, "logAdTrackingCustEvent2");
  ensureFunc(analytics, "logAdTrackingCustEvent3");
  ensureFunc(analytics, "logAdTrackingRegister");
  ensureFunc(analytics, "logAdTrackingLogin");

  var analyticsEvents = ensureObject(analytics, "UGameEvent");
  ensureFunc(analyticsEvents, "startGuideLevel");
  ensureFunc(analyticsEvents, "getLevelType", function () {
    return "";
  });
  ensureFunc(analyticsEvents, "registerSuperProperty");
  ensureFunc(analyticsEvents, "gameStartEvent");
  ensureFunc(analyticsEvents, "gameEndEvent");
  ensureFunc(analyticsEvents, "gameStopEvent");
  ensureFunc(analyticsEvents, "payEvent");
  ensureFunc(analyticsEvents, "showAdEvent");
  ensureFunc(analyticsEvents, "unlockRoleEvent");
  ensureFunc(analyticsEvents, "unlockRoleEventParam");
  ensureFunc(analyticsEvents, "clickButtonEvent");
  ensureFunc(analyticsEvents, "rateClickEvent");

  var iapMgr = ensureObject(root.vee, "IAPMgr");
  iapMgr.goodsKey = iapMgr.goodsKey || {};
  if (typeof iapMgr.goodsKey.UNLOCKLEVELS === "undefined") {
    iapMgr.goodsKey.UNLOCKLEVELS = 0;
  }
  if (typeof iapMgr.goodsKey.ALLHEROS === "undefined") {
    iapMgr.goodsKey.ALLHEROS = 1;
  }
  if (typeof iapMgr.goodsKey.POWER === "undefined") {
    iapMgr.goodsKey.POWER = 2;
  }
  if (typeof iapMgr.goodsKey.UNLOCKMOON === "undefined") {
    iapMgr.goodsKey.UNLOCKMOON = 3;
  }
  if (typeof iapMgr.goodsKey.UNLOCK_PARKOUR_LEVELS === "undefined") {
    iapMgr.goodsKey.UNLOCK_PARKOUR_LEVELS = 4;
  }
  function getIapInfo(productIdx) {
    return root.app && root.app.Config && root.app.Config.IAPs ?
      root.app.Config.IAPs[productIdx] : null;
  }
  ensureFunc(iapMgr, "getServicePriceList", function () {
    return null;
  });
  ensureFunc(iapMgr, "setPriceForLab", function (productIdx, label) {
    if (!label || typeof label.setString !== "function") {
      return;
    }
    var iapInfo = getIapInfo(productIdx);
    if (iapInfo && iapInfo.priceStr) {
      label.setString(iapInfo.priceStr);
    }
  });
  ensureFunc(iapMgr, "setPriceLabByServer", function (productIdx, label) {
    this.setPriceForLab(productIdx, label);
  });
  ensureFunc(iapMgr, "buyProduct", function (productIdx, successCallback) {
    var iapInfo = getIapInfo(productIdx) || { ProductID: String(productIdx) };
    if (root.cc && root.cc.log) {
      root.cc.log("webv1 IAP fallback purchase: " + iapInfo.ProductID);
    }
    asyncNoopCallback(successCallback, iapInfo.ProductID);
  });
  ensureFunc(iapMgr, "buyProductWithCustomParams", function (iapInfo, successCallback) {
    asyncNoopCallback(successCallback, iapInfo && iapInfo.ProductID);
  });
  ensureFunc(iapMgr, "restoreProduct", function (successCallback) {
    asyncNoopCallback(successCallback, []);
  });
  ensureFunc(iapMgr, "QQLogin");
  ensureFunc(iapMgr, "WeiXinLogin");
  ensureFunc(iapMgr, "logout");
  ensureFunc(iapMgr, "removeAllCallback");
  if (typeof iapMgr.NeedLoginCallback !== "function") {
    iapMgr.NeedLoginCallback = noop;
  }

  var gameCenter = ensureObject(root.vee, "GameCenter");
  ensureFunc(gameCenter, "saveGameData");
  ensureFunc(gameCenter, "showLeaderboard");
  ensureFunc(gameCenter, "showVideoOverlay");
  ensureFunc(gameCenter, "submitScore");
  ensureFunc(gameCenter, "unlockAchievement");
  ensureFunc(gameCenter, "getPlayerName", function () {
    return "";
  });

  var promo = ensureObject(root.vee, "Promo");
  ensureFunc(promo, "hideMoreGameBanner");
  ensureFunc(promo, "showMoreGameBanner");

  var share = ensureObject(root.vee, "Share");
  if (!share.ShareType || typeof share.ShareType !== "object") {
    share.ShareType = {
      BOTH: 0,
      MSG_ONLY: 1,
      IMG_ONLY: 2
    };
  }
  ensureFunc(share, "share");

  var ktplay = ensureObject(root.vee, "KTPlay");
  ensureFunc(ktplay, "activate");
  ensureFunc(ktplay, "show");
  ensureFunc(ktplay, "isNewNotice", function () {
    return false;
  });

  var common = ensureObject(root.vee, "Common");
  if (typeof common.getInstance !== "function") {
    common.getInstance = function () {
      return common;
    };
  }
  ensureFunc(common, "setSoundEnabled");
  ensureFunc(common, "setIsCanMenuClick");
  ensureFunc(common, "removeAllNotifications");
  ensureFunc(common, "addLocalNotification");
  ensureFunc(common, "openURL", function (url) {
    if (typeof root.open === "function") {
      try {
        root.open(url, "_blank");
      } catch (error) {
      }
    }
  });
  ensureFunc(common, "isDebugMode", function () {
    return false;
  });
  ensureFunc(common, "rateUs");
  ensureFunc(common, "launchApp", function () {
    return false;
  });
  ensureFunc(common, "checkIsInstalled", function () {
    return false;
  });
  ensureFunc(common, "checkLocalUpdate", function () {
    return false;
  });
  ensureFunc(common, "isIOS10", function () {
    return false;
  });
  ensureFunc(common, "isIOS103", function () {
    return false;
  });
  ensureFunc(common, "isRecordAvaliable", function () {
    return false;
  });
  ensureFunc(common, "recordScreen");
  ensureFunc(common, "stopRecordScreen");
  ensureFunc(common, "reloadCache");
  ensureFunc(common, "checkPackage");
  ensureFunc(common, "checkSignature");
  ensureFunc(common, "loadGameData");
  ensureFunc(common, "saveImage", function (node, fileName) {
    return fileName || "shareImage.jpg";
  });
  ensureFunc(common, "getLocalizedStringForKey", function (key) {
    return key;
  });
  ensureFunc(common, "saveToFile", function (value, key) {
    storageSet(key, typeof value === "string" ? value : JSON.stringify(value));
  });
  ensureFunc(common, "loadFromFile", function (key) {
    return storageGet(key);
  });
  ensureFunc(common, "getInt", function (key) {
    return parseInt(storageGet(key) || "0", 10) || 0;
  });
  ensureFunc(common, "saveInt", function (key, value) {
    storageSet(key, String(value));
  });
  ensureFunc(common, "requestServer", function (url, body, method, callback) {
    if (typeof fetch !== "function") {
      asyncNoopCallback(callback, "");
      return;
    }
    var methodName = requestMethodName(method);
    var options = { method: methodName };
    if (methodName !== "GET" && body) {
      options.body = body;
      options.headers = { "Content-Type": "application/json" };
    }
    fetch(url, options).then(function (response) {
      return response.text();
    }).then(function (text) {
      asyncNoopCallback(callback, text);
    }).catch(function () {
      asyncNoopCallback(callback, "");
    });
  });
  ensureFunc(common, "requestServerOld", function (url, method, action, body, callback) {
    common.requestServer(url, body, method, callback);
  });

  root.LyGoogle = root.LyGoogle || {};
  root.LyWXLogin = root.LyWXLogin || {};
  root.LyTVOSIndex = root.LyTVOSIndex || {};
  ensureFunc(root.LyGoogle, "show");
  ensureFunc(root.LyWXLogin, "show");
  ensureFunc(root.LyTVOSIndex, "show");

  root.MultiController = root.MultiController || {};
  ensureFunc(root.MultiController, "checkHasMultiLevel", function () {
    return false;
  });
  ensureFunc(root.MultiController, "checkCanOpen", function () {
    return false;
  });
  ensureFunc(root.MultiController, "show");
  ensureFunc(root.MultiController, "hide");
  root.MultiController.MultiMine = root.MultiController.MultiMine || {};
  root.MultiController.MultiMine.cooldownTime = typeof root.MultiController.MultiMine.cooldownTime === "number" ? root.MultiController.MultiMine.cooldownTime : 0;
  ensureFunc(root.MultiController.MultiMine, "checkHaveMine", function () {
    return false;
  });
  ensureFunc(root.MultiController.MultiMine, "addCountDownTime");

  root.MsgController = root.MsgController || {};
  ensureFunc(root.MsgController, "sendItemMsg");
  ensureFunc(root.MsgController, "sendTileMsg");

  root.protobuf = root.protobuf || {};
  root.dcodeIO = root.dcodeIO || {};
  if (typeof root.dcodeIO.ByteBuffer !== "function") {
    root.dcodeIO.ByteBuffer = function ByteBuffer() {};
  }
  if (typeof root.dcodeIO.Long !== "function") {
    root.dcodeIO.Long = function Long() {};
  }

  root.jsb = root.jsb || {};
  var fileUtils = ensureObject(root.jsb, "fileUtils");
  ensureFunc(fileUtils, "getWritablePath", function () {
    return "";
  });

  var audio = ensureObject(root.jsb, "AudioEngine");
  var webAudioUnlocked = false;
  var titleLogoEffectQueue = null;
  var titleLogoUnlockListenersBound = false;

  function getWebAudio() {
    return root.cc && root.cc.audioEngine ? root.cc.audioEngine : null;
  }

  function isTitleLogoEffect(path) {
    return typeof path === "string" &&
      /(?:^|\/)outGame_efx_showLogo(?:_tutorial)?\.mp3(?:[?#].*)?$/.test(path);
  }

  function removeTitleLogoUnlockListeners(handler) {
    if (!root.document || !root.document.removeEventListener) {
      return;
    }
    var events = ["pointerdown", "touchstart", "mousedown", "keydown"];
    for (var i = 0; i < events.length; i++) {
      root.document.removeEventListener(events[i], handler, true);
    }
  }

  function playTitleLogoEffect(path, loop) {
    var engine = getWebAudio();
    if (!engine || typeof engine.playEffect !== "function") {
      return 0;
    }
    try {
      var audioId = engine.playEffect(path, !!loop);
      resumeAudioContext(audioId);
      return audioId;
    } catch (error) {
      return 0;
    }
  }

  function resumeAudioContext(audioId) {
    var context = audioId && audioId._context;
    if (context && typeof context.resume === "function" && context.state === "suspended") {
      try {
        context.resume();
      } catch (error) {
      }
    }
  }

  function isSuspendedWebAudio(audioId) {
    var context = audioId && audioId._context;
    return !!(context && typeof context.state === "string" && context.state !== "running");
  }

  function stopTitleLogoEffect(audioId) {
    var engine = getWebAudio();
    if (engine && typeof engine.stopEffect === "function" && audioId) {
      try {
        engine.stopEffect(audioId);
      } catch (error) {
      }
    }
  }

  function flushTitleLogoEffectQueue() {
    webAudioUnlocked = true;
    var queued = titleLogoEffectQueue;
    titleLogoEffectQueue = null;
    if (queued) {
      playTitleLogoEffect(queued.path, queued.loop);
    }
  }

  function bindTitleLogoUnlockListeners() {
    if (titleLogoUnlockListenersBound || !root.document || !root.document.addEventListener) {
      return;
    }
    titleLogoUnlockListenersBound = true;
    var handler = function () {
      removeTitleLogoUnlockListeners(handler);
      flushTitleLogoEffectQueue();
    };
    var events = ["pointerdown", "touchstart", "mousedown", "keydown"];
    for (var i = 0; i < events.length; i++) {
      root.document.addEventListener(events[i], handler, true);
    }
  }

  ensureFunc(audio, "preload", function (path, callback) {
    var engine = getWebAudio();
    if (engine && typeof engine.preloadEffect === "function") {
      try {
        engine.preloadEffect(path);
      } catch (error) {
      }
    }
    if (typeof callback === "function") {
      try {
        callback(true);
      } catch (error) {
      }
    }
  });
  ensureFunc(audio, "play2d", function (path, loop) {
    var engine = getWebAudio();
    if (!engine) {
      if (!loop && isTitleLogoEffect(path)) {
        titleLogoEffectQueue = { path: path, loop: loop };
        bindTitleLogoUnlockListeners();
      }
      return 0;
    }
    try {
      if (loop) {
        engine.playMusic(path, true);
        return -1;
      }
      if (!webAudioUnlocked && isTitleLogoEffect(path)) {
        var titleEffect = engine.playEffect(path, !!loop);
        if (isSuspendedWebAudio(titleEffect)) {
          stopTitleLogoEffect(titleEffect);
          titleLogoEffectQueue = { path: path, loop: loop };
          bindTitleLogoUnlockListeners();
          return 0;
        }
        webAudioUnlocked = true;
        return titleEffect;
      }
      return engine.playEffect(path, !!loop);
    } catch (error) {
      if (!loop && isTitleLogoEffect(path)) {
        titleLogoEffectQueue = { path: path, loop: loop };
        bindTitleLogoUnlockListeners();
      }
      return 0;
    }
  });
  ensureFunc(audio, "stop", function (audioId) {
    var engine = getWebAudio();
    if (!engine) {
      return;
    }
    if (audioId === -1) {
      engine.stopMusic();
      return;
    }
    engine.stopEffect(audioId);
  });
  ensureFunc(audio, "stopAll", function () {
    var engine = getWebAudio();
    if (!engine) {
      return;
    }
    engine.stopMusic();
    engine.stopAllEffects();
  });
  ensureFunc(audio, "pause", function (audioId) {
    var engine = getWebAudio();
    if (!engine) {
      return;
    }
    if (audioId === -1) {
      engine.pauseMusic();
      return;
    }
    engine.pauseEffect(audioId);
  });
  ensureFunc(audio, "pauseAll", function () {
    var engine = getWebAudio();
    if (!engine) {
      return;
    }
    engine.pauseMusic();
    engine.pauseAllEffects();
  });
  ensureFunc(audio, "resume", function (audioId) {
    var engine = getWebAudio();
    if (!engine) {
      return;
    }
    if (audioId === -1) {
      engine.resumeMusic();
      return;
    }
    engine.resumeEffect(audioId);
  });
  ensureFunc(audio, "resumeAll", function () {
    var engine = getWebAudio();
    if (!engine) {
      return;
    }
    engine.resumeMusic();
    engine.resumeAllEffects();
  });
  ensureFunc(audio, "uncache", function () {
    return 0;
  });
}(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this)));
