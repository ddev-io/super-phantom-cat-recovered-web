
function __sc_safeCall(receiver, methodName) {
  if (!receiver || typeof receiver[methodName] !== "function") {
    return undefined;
  }

  try {
    return receiver[methodName].apply(receiver, Array.prototype.slice.call(arguments, 2));
  } catch (e) {
    return undefined;
  }
}

function __sc_safeCallPath(root, path) {
  var args = Array.prototype.slice.call(arguments, 2);
  var parts = path.split(".");
  var receiver = root;

  for (var i = 0; i < parts.length - 1; i++) {
    if (!receiver) {
      return undefined;
    }
    receiver = receiver[parts[i]];
  }

  return __sc_safeCall.apply(null, [receiver, parts[parts.length - 1]].concat(args));
}

if (vee.GameModule) {
  vee.GameModule.MainLayer.extend({
    ccbSelectLayer: null,

    onLoaded: function () {
      this.ccbSelectLayer.controller.onLoaded();
    },

    onKeyBack: function () {
      if (!LyAvatarStore.isShow) {
        vee.onKeyBack();
      }
    },

    onSetting: function () {
      LyPosSetting.show();
    }
  });

  vee.GameModule.OverLayer.extend({
    getShareContent: function () {
      return "这才是真正的 分享字符串";
    }
  });

  vee.GameModule.SceneMgr.openOver = function () {
    cc.log("game.Data.stageType = " + game.Data.stageType);

    if (game.Data.stageType === game.StageType.Mini) {
      __sc_safeCallPath(vee, "Analytics.UGameEvent.gameEndEvent", "Mini", "fail");
      LyGameOverMini.show();
      return;
    }

    __sc_safeCallPath(vee, "Analytics.UGameEvent.gameEndEvent", "", "fail");

    var overFile = this.overFile;
    var openOverLayer = function () {
      cc.log("zq debug open over ============ 2222222222");
      vee.PopMgr.closeAll();
      vee.PopMgr.popCCB(overFile, true);
      game.Data.oLyGameOver.onLoaded();
    };

    if (game.Data.willShowVideoAd && __sc_safeCall(vee.Ad, "checkCacheVideoAd")) {
      cc.log("zq debug open over ============ 1111111111");
      __sc_safeCall(vee.Ad, "showRevivalVideoAd", function () {
        vee.Utils.scheduleOnce(openOverLayer, 0.2);
      });
      return;
    }

    openOverLayer();
  };
}

game.AnalyticsUmeng = null;
game.loginPlatform = "";

game.initPhantomCatData = function () {
  var savedData = vee.Utils.loadObj("VeeData");

  if (!savedData) {
    vee.isNewPlayer = true;
    vee.isFirstPlay = true;
    vee.data.veewocheck = "ok";
    vee.saveData();
  } else {
    vee.isFirstPlay = false;
    vee.data = savedData;
  }

  app.init(vee.isFirstPlay);
  game.Data.init();
  game.LevelData.categories = [];
  game.LevelData.load();
  game.AvatarData.init();
  vee.saveData();
  vee.VIPValues.save();
};

function requestNewUserAnAlytics() {
  vee.isNewPlayer = vee.data.isRequestNewPlayer;

  if (!(game.Data.isClearVersion && (vee.isNewPlayer === undefined || vee.isNewPlayer))) {
    return;
  }

  var requestCallback = function (responseText) {
    cc.log("http request-------callback js" + responseText);

    var response = JSON.parse(responseText);
    vee.Utils.logObj(response, "request return");

    if (response.data.result === "success") {
      vee.isNewPlayer = false;
      vee.data.isRequestNewPlayer = false;
      vee.saveData();
      cc.log("http request-------success");
    } else {
      vee.isNewPlayer = true;
      vee.data.isRequestNewPlayer = true;
      vee.saveData();
      cc.log("http request-------fail");
    }
  };

  var clientTime = new Date().getTime();
  var platform = "";

  if (cc.sys.os === cc.sys.OS_ANDROID) {
    platform = "android";
  } else if (cc.sys.os === cc.sys.OS_IOS) {
    platform = "ios";
  }

  var url = "http://www.veewogames.cn/php/newuser.php?clientTime=" +
    clientTime + "&platform=" + platform;

  cc.log("zq debug  url====" + url);
  vee.Utils.getObjWithURL(url, function (data) {
    requestCallback(data);
  }, null, null, true);
}

vee.saveResultForTVOS = function (result) {
  cc.log(result === "true" ? "save result for tvos success" : "save result for tvos fail");
};

vee.loadResultForTVOS = function (result) {
  if (result === "true") {
    cc.log("load result for tvos success");
    game.initPhantomCatData();
  } else {
    cc.log("load result for tvos fail");
  }

  vee.PopMgr.removeLoading();
};

vee.showIndexLayerForTVOS = function () {
  vee.PopMgr.closeAll();
};

function protoTest() {
  var ProtoBuf = dcodeIO.ProtoBuf;
  var builder = ProtoBuf.loadProtoFile("res/protobuf/userProto.proto");
  var GameUserInfo = builder.build("gameProto.GameUserInfo");
  var user = new GameUserInfo();

  user.uid = "testuid";
  user.uname = "testuname";

  var buffer = GameUserInfo.encode(user);
  cc.log("buffer=====" + buffer);

  var decoded = GameUserInfo.decode(buffer);
  cc.log("new user===id=%s    uname===%s", decoded.uid, decoded.uname);
}

vee.configWithUrlData = function (encodedData) {
  cc.log("app.js configWithUrlData ============" + encodedData);

  if (!encodedData) {
    return;
  }

  var jsonText = Base64.decode(encodedData);
  var data = JSON.parse(jsonText);

  vee.Utils.logObj(data, "url data ==========");

  if (game.Data.version.curVersion === VERSION.TVOS_GENUINE) {
    return;
  }

  if (typeof MultiController !== "undefined" && MultiController && MultiController.isOpenGame) {
    __sc_safeCall(MultiController, "startJoinRoom", "+" + data.roomId, data.levelId);
  } else if (typeof MultiController !== "undefined" && MultiController) {
    MultiController.joinData = data;
  }
};

function isShowSpecialVersion() {
  return false;
}

if (typeof VeeRestorePurchaseButton !== "undefined" &&
    VeeRestorePurchaseButton) {
  __sc_safeCall(VeeRestorePurchaseButton, "registerCallback", function () {});
}

vee.Transition.pop = function (ccbFile, position) {
  // The native build passed an extra flag here; on web the 4th argument is
  // ccbRootPath, so `true` corrupted texture paths ("truebig/...").
  var node = cc.BuilderReader.load(ccbFile);
  var shield = cc.LayerGradient.create(
    cc.color(0, 0, 0, 150),
    cc.color(0, 0, 0, 150)
  );

  shield.setOpacity(0);

  cc.eventManager.addListener({
    event: cc.EventListener.TOUCH_ONE_BY_ONE,
    swallowTouches: true,
    onTouchBegan: function () {
      return true;
    }
  }, shield);

  node.addChild(shield);
  vee.PopMgr.rootNode.addChild(node);

  if (position) {
    node.setPosition(position);
  } else {
    vee.PopMgr.setNodePos(
      node,
      vee.PopMgr.PositionType.Center,
      cc.p(0, 0),
      true
    );
  }

  return node;
};

function main() {
  cc.log("zqdebug main init start================");

  game.Data.version.init();
  vee.init();
  game.Data.init();
  if (typeof tt_enableOnlineConfig === "function") {
    tt_enableOnlineConfig();
  }

  if (game.Data.version.curVersion !== VERSION.TVOS_GENUINE &&
      typeof MultiController !== "undefined" &&
      MultiController &&
      typeof MultiController.init === "function") {
    MultiController.init();
  }

  __sc_safeCall(vee.Controller, "active");

  if (game.Data.version.isKTPlay) {
    __sc_safeCall(vee.KTPlay, "activate");
  }

  game.LevelData.load();
  game.AvatarData.init();
  app.checkData();
  __sc_safeCall(vee.Ad, "activate");
  __sc_safeCall(vee.Analytics, "activate");
  __sc_safeCall(vee.OnlineConfig, "activate", vee.Analytics && vee.Analytics.pAnalytics);

  if (game.Data.isFreeGame) {
    cc.log("zq debug checkHasContinuousLogin 11111111111");

    if (vee.dataManager.checkHasContinuousLogin()) {
      cc.log("zq debug checkHasContinuousLogin 2222222222222");
      game.Data.willShowLoginPop = true;

      var continuousLoginDays = vee.dataManager.getContinuousLoginDays();
      if (continuousLoginDays > 3) {
        vee.Ad.isNoAd = true;
      }
    }

    vee.dataManager.setLoginTime();
    cc.log("zq debug checkHasContinuousLogin 333333333");
    __sc_safeCall(vee.Ad, "activate");
  }

  if (!(game.Data.isAndroid && !game.Data.isFreeGame)) {
    __sc_safeCall(vee.IAPMgr, "activate");
    __sc_safeCall(vee.GameCenter, "activate");

    if (!game.Data.isAndroid) {
      __sc_safeCall(vee.GameCenter, "login");
    }

    __sc_safeCall(vee.Utils, "checkPackage");
  }

  var startFunc = function () {
    vee.PopMgr.closeAll();

    if (vee.dataManager.getPower() === undefined) {
      vee.dataManager.setPower(1);
    }

    vee.saveData();

    var showVersionSceen = function (callback, showSpecialVersion) {
      var versionSprite = cc.Sprite("res/version_cn.png");
      versionSprite.setAnchorPoint(cc.p(0, 0));
      vee.PopMgr.popLayer(versionSprite);
      versionSprite.runAction(cc.sequence(
        cc.delayTime(1.5),
        cc.fadeOut(1.5),
        cc.callFunc(function () {
          var openSprite = cc.Sprite(
            showSpecialVersion ? "res/specialversion_cn.png" : "res/open_sceen_cn.png"
          );

          openSprite.setAnchorPoint(cc.p(0, 0));
          vee.PopMgr.popLayer(openSprite);
          openSprite.runAction(cc.sequence(
            cc.delayTime(1.5),
            cc.callFunc(function () {
              if (callback) {
                callback();
              }
            })
          ));
        })
      ));
    };

    var gameStartFunc = function () {
      vee.PopMgr.closeAll();
      cc.director.purgeCachedData();
      vee.PopMgr.popCCB("res/veeGameLayer.ccbi");
      game.Data.oLyGame.onLoaded();
      __sc_safeCall(vee.Analytics, "logEvent", "story_start");
      __sc_safeCallPath(vee, "Analytics.UGameEvent.startGuideLevel");
      game.Data.oLyGame.initStage("Story1");
      game.Data.oLyGame.setFirstPlay(true);
    };

    var enterGameWithTransition = function () {
      vee.Transition.out(res.MapTransition_ccbi, gameStartFunc);
    };

    if (vee.isFirstPlay) {
      vee.Common.getInstance().setIsCanMenuClick(false);

      if (game.Data.isAndroid) {
        if (game.Data.isWeiXin) {
          LyWeiXinOpen.show();
        } else if (game.Data.isFreeGame) {
          vee.PopMgr.alert(
            vee.Utils.getLocalizedStringForKey("Do you want to login Google Play Game Services?"),
            vee.Utils.getLocalizedStringForKey("GooglePlay"),
            function () {
              game.Data.isAutoLoginGoogle = true;
              __sc_safeCall(vee.GameCenter, "login");
              enterGameWithTransition();
            },
            function () {
              game.Data.isAutoLoginGoogle = false;
              enterGameWithTransition();
            }
          );
        } else {
          enterGameWithTransition();
        }
      } else if (game.Data.version.curVersion === VERSION.IOS_FREE_CN) {
        showVersionSceen(enterGameWithTransition);
      } else if (isShowSpecialVersion()) {
        showVersionSceen(enterGameWithTransition, true);
      } else {
        if (game.Data.version.curVersion === VERSION.TVOS_GENUINE) {
          vee.Common.getInstance().loadGameData();
        }
        enterGameWithTransition();
      }
    } else if (game.Data.isWeiXin) {
      LyWeiXinOpen.show();
    } else if (game.Data.version.curVersion === VERSION.TVOS_GENUINE) {
      LyTVOSIndex.show();
    } else if (game.Data.version.curVersion === VERSION.IOS_FREE_CN) {
      showVersionSceen(function () {
        LyIndex.show();
      });
    } else if (isShowSpecialVersion()) {
      showVersionSceen(function () {
        LyIndex.show();
      }, true);
    } else {
      LyIndex.show();

      if (game.Data.isAutoLoginGoogle && game.Data.isAndroid) {
        __sc_safeCall(vee.GameCenter, "login");
      }
    }

    if (game.Data.isFreeGame && game.Data.isAndroid) {
      vee.Utils.scheduleOnce(showOpenScreenAd, 1.4);
    }
  };

  var showOpenScreenAd = function () {
    cc.log("show open screen ad!");
    __sc_safeCall(vee.Ad, "showInterstitialByOnlineConfig", "open_screen");
    __sc_safeCallPath(vee, "Analytics.UGameEvent.showAdEvent", "openScreen", "interstial");
  };

  if (game.Data.isAndroid) {
    LySplash.show();
    vee.Utils.scheduleOnce(function () {
      vee.PopMgr.closeAll();
      startFunc();
    }, 1);
  } else {
    startFunc();
    vee.Utils.scheduleOnce(showOpenScreenAd, 2);
  }

  if (typeof gameCanvas !== "undefined" && gameCanvas !== null && gameCanvas.focus) {
    gameCanvas.focus();
  }

  if (vee.Utils.getObjByPlatform(true, true, false)) {
    cc.log("测111111试：" + vee.data.tag_61);

    if (vee.data.tag_61 === undefined) {
      vee.data.tag_61 = 1;

      var levelState = game.LevelData
        .getCategory(6)
        .getLevelDataController(0)
        .getLevelState();

      if (levelState !== 2) {
        vee.data.level61_ts = vee.Utils.getTimeNow();
      }
    }
  }
}
