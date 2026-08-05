
function SCWideTitle_getWinSize() {
  if (typeof cc === "undefined") { return null; }
  var win = null;
  if (typeof vee !== "undefined" && vee.PopMgr && vee.PopMgr.winSize) {
    win = vee.PopMgr.winSize;
  }
  if ((!win || !win.width || !win.height) && cc.view && cc.view.getVisibleSize) {
    try { win = cc.view.getVisibleSize(); } catch (e0) { win = null; }
  }
  if ((!win || !win.width || !win.height) && cc.director && cc.director.getWinSize) {
    try { win = cc.director.getWinSize(); } catch (e1) { win = null; }
  }
  if ((!win || !win.width || !win.height) && cc.winSize) {
    win = cc.winSize;
  }
  if (!win || !win.width || !win.height) { return null; }

  var width = win.width;
  var height = win.height;
  if (cc.view && cc.view.getFrameSize) {
    try {
      var frame = cc.view.getFrameSize();
      if (frame && frame.width && frame.height && height) {
        width = Math.max(width, height * frame.width / frame.height);
      }
    } catch (e2) {}
  }
  if (cc.view && cc.view.getCanvasSize) {
    try {
      var canvas = cc.view.getCanvasSize();
      if (canvas && canvas.width && canvas.height && height) {
        width = Math.max(width, height * canvas.width / canvas.height);
      }
    } catch (e3) {}
  }

  // Old builds may report only the legacy design width although the real
  // window is wider. Use a conservative ultrawide fallback only for bg nodes.
  if (width / height < 2.05 && win.width / win.height > 1.90) {
    width = Math.max(width, height * 2.40);
  }
  return cc.size(Math.ceil(width), Math.ceil(height));
}

function SCWideTitle_getNodeSize(node) {
  if (!node) { return null; }
  var size = null;
  if (node.getContentSize) {
    try { size = node.getContentSize(); } catch (e0) { size = null; }
  }
  if (size && size.width > 8 && size.height > 8) { return size; }
  if (node.getBoundingBox) {
    try {
      var box = node.getBoundingBox();
      if (box && box.width > 8 && box.height > 8) { return cc.size(box.width, box.height); }
    } catch (e1) {}
  }
  return null;
}

function SCWideTitle_children(node) {
  try { return node && node.getChildren ? (node.getChildren() || []) : []; } catch (e) { return []; }
}

function SCWideTitle_isVisible(node) {
  if (!node) { return false; }
  if (node.isVisible) {
    try { return !!node.isVisible(); } catch (e0) { return true; }
  }
  return node.visible !== false;
}

function SCWideTitle_nodeHasInteractiveApi(node) {
  return !!(node && (
    node.addTargetWithActionForControlEvents ||
    node.setBackgroundSpriteForState ||
    node.setTitleForState ||
    node.setTouchEnabled ||
    node.addTouchEventListener
  ));
}

function SCWideTitle_nodeLooksLikeText(node) {
  return !!(node && (node.setString || node.getString || node.setFontSize || node.setFontName));
}

function SCWideTitle_isSolidColorLike(node) {
  return !!(node && node.setContentSize && (node.setStartColor || node.setEndColor || node.setColor));
}

function SCWideTitle_isSpriteLike(node) {
  return !!(node && (node.setTextureRect || node.getSpriteFrame || node.setSpriteFrame || node.getTexture));
}

function SCWideTitle_markExcluded(set, node) {
  if (!node || node.__scWideTitleMark) { return; }
  node.__scWideTitleMark = true;
  set.push(node);
  var children = SCWideTitle_children(node);
  for (var i = 0; i < children.length; i++) {
    SCWideTitle_markExcluded(set, children[i]);
  }
}

function SCWideTitle_collectExclusions(controller) {
  var set = [];
  if (!controller) { return set; }
  var keys = [
    "btnPlay", "btnHelp", "btnInfo", "btnGoogle", "btnSaveGame", "labSaveGame",
    "ccbEfxLogo", "nodePlayer", "playerNode", "ccbBalloon", "spL", "nodeT"
  ];
  for (var i = 0; i < keys.length; i++) {
    if (controller[keys[i]]) { SCWideTitle_markExcluded(set, controller[keys[i]]); }
  }
  for (var j = 0; j < set.length; j++) {
    if (set[j]) { set[j].__scWideTitleMark = false; }
  }
  return set;
}

function SCWideTitle_subtreeContainsAny(root, excluded) {
  if (!root) { return false; }
  for (var i = 0; i < excluded.length; i++) {
    if (root === excluded[i]) { return true; }
  }
  var children = SCWideTitle_children(root);
  for (var j = 0; j < children.length; j++) {
    if (SCWideTitle_subtreeContainsAny(children[j], excluded)) { return true; }
  }
  return false;
}

function SCWideTitle_subtreeHasUI(root, excluded, depth) {
  if (!root || depth > 10) { return false; }
  if (SCWideTitle_subtreeContainsAny(root, excluded)) { return true; }
  if (SCWideTitle_nodeHasInteractiveApi(root) || SCWideTitle_nodeLooksLikeText(root)) { return true; }
  var children = SCWideTitle_children(root);
  for (var i = 0; i < children.length; i++) {
    if (SCWideTitle_subtreeHasUI(children[i], excluded, depth + 1)) { return true; }
  }
  return false;
}

function SCWideTitle_calcCandidateScore(node, root) {
  if (!node || node === root || !SCWideTitle_isVisible(node)) { return -999999; }
  if (SCWideTitle_nodeHasInteractiveApi(node) || SCWideTitle_nodeLooksLikeText(node)) { return -999999; }

  var win = SCWideTitle_getWinSize();
  var size = SCWideTitle_getNodeSize(node);
  if (!win || !size) { return -999999; }

  var minW = Math.min(900, win.width * 0.58);
  var minH = Math.min(420, win.height * 0.55);
  if (size.width < minW || size.height < minH) { return -999999; }

  var children = SCWideTitle_children(node);
  var spriteLike = SCWideTitle_isSpriteLike(node) || SCWideTitle_isSolidColorLike(node);
  var score = size.width * size.height;
  if (spriteLike) { score += 500000; }
  if (children.length > 0) { score += 200000; }
  if (node.controller) { score += 250000; }

  // Prefer nodes that already start near the screen origin. Do not require it,
  // because CCB roots can be offset on wide screens.
  try {
    var pos = node.getPosition ? node.getPosition() : cc.p(0, 0);
    score -= Math.abs(pos.x) * 100;
    score -= Math.abs(pos.y) * 20;
  } catch (e0) {}
  return score;
}

function SCWideTitle_findBestBackgroundNode(root, controller) {
  var excluded = SCWideTitle_collectExclusions(controller);
  var best = null;
  var bestScore = -999999;

  function walk(node, depth) {
    if (!node || depth > 14) { return; }
    if (node !== root && !SCWideTitle_subtreeHasUI(node, excluded, 0)) {
      var score = SCWideTitle_calcCandidateScore(node, root);
      if (score > bestScore) {
        bestScore = score;
        best = node;
      }
    }
    var children = SCWideTitle_children(node);
    for (var i = 0; i < children.length; i++) {
      walk(children[i], depth + 1);
    }
  }

  walk(root, 0);
  return best;
}

function SCWideTitle_fitBackgroundNode(node, root) {
  if (!node || typeof cc === "undefined") { return false; }
  var win = SCWideTitle_getWinSize();
  var size = SCWideTitle_getNodeSize(node);
  if (!win || !size || !size.width || !size.height) { return false; }

  if (node.__scWideTitleBaseScaleX == null) {
    node.__scWideTitleBaseScaleX = node.getScaleX ? node.getScaleX() : (node.scaleX || 1);
    node.__scWideTitleBaseScaleY = node.getScaleY ? node.getScaleY() : (node.scaleY || 1);
    node.__scWideTitleBasePos = node.getPosition ? node.getPosition() : cc.p(0, 0);
  }

  var parent = node.getParent ? node.getParent() : root;
  var leftBottom = cc.p(0, 0);
  if (parent && parent.convertToNodeSpace) {
    try { leftBottom = parent.convertToNodeSpace(cc.p(0, 0)); } catch (e0) { leftBottom = node.__scWideTitleBasePos; }
  }

  if (node.setAnchorPoint) {
    try { node.setAnchorPoint(cc.p(0, 0)); } catch (e1) {}
  }
  if (node.setPosition) {
    try { node.setPosition(cc.p(leftBottom.x, leftBottom.y)); } catch (e2) {}
  }

  if (SCWideTitle_isSolidColorLike(node) && node.setContentSize) {
    try { node.setContentSize(cc.size(win.width, win.height)); } catch (e3) {}
    if (node.setScaleX) { node.setScaleX(1); }
    if (node.setScaleY) { node.setScaleY(1); }
    return true;
  }

  // Cover the wide screen. Background-only containers are allowed here;
  // UI-containing containers were filtered out before this point.
  var sx = Math.max(win.width / size.width, 1);
  var sy = Math.max(win.height / size.height, 1);
  if (node.setScaleX && node.setScaleY) {
    node.setScaleX(node.__scWideTitleBaseScaleX * sx);
    node.setScaleY(node.__scWideTitleBaseScaleY * sy);
  } else if (node.setScale) {
    node.setScale(node.__scWideTitleBaseScaleX * sx, node.__scWideTitleBaseScaleY * sy);
  }
  return true;
}

function SCWideTitle_fixBackground(controller) {
  if (!controller || !controller.rootNode) { return false; }
  var bg = SCWideTitle_findBestBackgroundNode(controller.rootNode, controller);
  if (bg) {
    controller.__scWideTitleBgNode = bg;
    return SCWideTitle_fitBackgroundNode(bg, controller.rootNode);
  }
  return false;
}

function SCWideTitle_scheduleBackgroundFix(controller) {
  if (!controller || !controller.rootNode) { return; }
  var fix = function () { SCWideTitle_fixBackground(controller); };
  fix();
  if (typeof vee !== "undefined" && vee.Utils && vee.Utils.scheduleOnceForTarget) {
    vee.Utils.scheduleOnceForTarget(controller, fix, 0.01);
    vee.Utils.scheduleOnceForTarget(controller, fix, 0.2);
    vee.Utils.scheduleOnceForTarget(controller, fix, 0.8);
    vee.Utils.scheduleOnceForTarget(controller, fix, 1.6);
  } else if (controller.rootNode && controller.rootNode.runAction && cc.sequence) {
    controller.rootNode.runAction(cc.sequence(cc.delayTime(0.01), cc.callFunc(fix)));
    controller.rootNode.runAction(cc.sequence(cc.delayTime(0.2), cc.callFunc(fix)));
    controller.rootNode.runAction(cc.sequence(cc.delayTime(0.8), cc.callFunc(fix)));
  }
}

var LyIndex = vee.Class.extend({
  _isOver: false,
  btnPlay: null,
  btnHelp: null,
  btnInfo: null,
  btnGoogle: null,
  btnSaveGame: null,
  labSaveGame: null,
  ccbEfxLogo: null,
  nodePlayer: null,
  playerNode: null,
  spChildhood: null,
  ccbBalloon: null,
  spL: null,

  onCreate: function () {
  },

  ccbInit: function () {
    this.handleKey(true);
    SCWideTitle_scheduleBackgroundFix(this);
    if (this.ccbEfxLogo && this.ccbEfxLogo.setVisible) {
      this.ccbEfxLogo.setVisible(false);
    }

    var avatar = game.AvatarData.getCurrentAvatar();
    this.playerNode = cc.BuilderReader.load(avatar.role);

    if (vee.Audio && typeof vee.Audio.playEffect === "function") {
      vee.Audio.playEffect(res.outGame_efx_showLogo_mp3);
    }

    this.playerNode.controller.playAnimate("huxi_1", function () {
      this.playerNode.controller.randomBreath();
    }.bind(this));

    this.nodePlayer.addChild(this.playerNode);
    SCWideTitle_scheduleBackgroundFix(this);

    this.btnSaveGame.setVisible(game.Data.isAndroid);
    this.labSaveGame.setVisible(game.Data.isAndroid);
    this.spL.setVisible(game.Data.isAndroid);

    if (vee.isFirstPlay) {
      vee.PopMgr.alert(
        "单机游戏，数据无法同步到其他设备；卸载游戏会导致数据丢失。",
        "提示",
        function () {
        }
      );
    }

    if (vee.IAPMgr && typeof vee.IAPMgr.getServicePriceList === "function") {
      vee.IAPMgr.getServicePriceList();
    }

    if (typeof MultiController !== "undefined" && MultiController) {
      if (MultiController.joinData && typeof MultiController.startJoinRoom === "function") {
        MultiController.startJoinRoom(
          "+" + MultiController.joinData.roomId,
          MultiController.joinData.levelId
        );
      }

      MultiController.isOpenGame = true;
    }
  },

  allUnlockAndAllStart: function () {
    vee.Utils.logObj(game.LevelData.defaultData, "default data=====");

    for (var categoryId in game.LevelData.defaultData) {
      var defaultCategoryData = game.LevelData.defaultData[categoryId];

      game.LevelData.coreData.percents[categoryId] = 100;
      game.LevelData.coreData.lockStatus[categoryId] = 3;

      vee.Utils.logObj(defaultCategoryData, "data======");

      var category = game.LevelData.getCategory(categoryId);
      category.lockStatus = game.LevelData.LockStatus.UNLOCKED;

      for (var levelId in category.levels) {
        var level = category.levels[levelId];

        level.lock = false;
        level.playedCount = 1;
        level.isLevelPassed = true;
        level.star = 273;
        level.isCollectAllCoin = true;

        vee.Utils.logObj(level, "level data======");
      }

      category.save();
    }

    vee.data.moon = true;
    vee.data.show_btn_world = true;
    vee.VIPValues.setValue("star", "999");

    game.LevelData.save();
    vee.saveData();
  },

  onExit: function () {
  },

  showLogo: function () {
    if (!this.ccbEfxLogo) {
      return;
    }

    this.ccbEfxLogo.setVisible(true);
    this.ccbEfxLogo.controller.loop();
  },

  initController: function () {
    vee.Controller.clearAllButtonAction();
    vee.Controller.activeButton();

    vee.Controller.registerButtonAction([
      vee.KeyCode.BUTTON_A,
      vee.KeyCode.BUTTON_DPAD_CENTER
    ], function () {
      this.onPlay();
    }.bind(this));

    vee.Controller.registerButtonAction([
      vee.KeyCode.BUTTON_LEFT_SHOULDER,
      vee.KeyCode.AXIS_LEFT_TRIGGER
    ], function () {
      this.onSave();
    }.bind(this));
  },

  onPlay: function () {
    cc.log("zq debug data save load start!!!!");
    game.initPhantomCatData();
    cc.log("zq debug data save load end!!!!");

    if (this._isOver) {
      return;
    }

    if (game.Data.isFreeGame &&
        vee.Ad &&
        typeof vee.Ad.showInterstitialAndBlockButton === "function" &&
        vee.Ad.showInterstitialAndBlockButton("start_btn")) {
      cc.log("zq debug onplay click============");
      return;
    }

    this._isOver = true;
    vee.Controller.clearGlobalButtonAction();
    vee.Transition.out(res.MapTransition_ccbi, function () {
      LyLevelSelect.show();
    });
  },

  onSave: function () {
    cc.log("zq debug on save btn click");

    var writablePath = "";
    if (typeof jsb !== "undefined" &&
        jsb.fileUtils &&
        typeof jsb.fileUtils.getWritablePath === "function") {
      writablePath = jsb.fileUtils.getWritablePath();
    }

    if (vee.GameCenter && typeof vee.GameCenter.saveGameData === "function") {
      vee.GameCenter.saveGameData(writablePath);
    }

    vee.PopMgr.popLoading();
  },

  onKeyBack: function () {
    vee.Controller.clearGlobalButtonAction();

    if (typeof VeeQuitBox !== "undefined" && VeeQuitBox && typeof VeeQuitBox.show === "function") {
      VeeQuitBox.show(function () {
        vee.Controller.registerGlobalButtonAction(this.onPlay.bind(this));

        if (typeof app !== "undefined" && app && typeof app.closeGame === "function") {
          app.closeGame();
        }
      }.bind(this));
    }

    if (vee.data.stad) {
    }

    return true;
  }
});

LyIndex.show = function () {
  vee.PopMgr.closeAll();

  var layerFile = res.index_ccbi;
  var layer = vee.PopMgr.popCCB(layerFile);
  layer.controller.ccbInit();
  SCWideTitle_scheduleBackgroundFix(layer.controller);
};

var LyIndexWeiXin = LyIndex.extend({
  onQQ: function () {
    if (vee.IAPMgr && typeof vee.IAPMgr.QQLogin === "function") {
      vee.IAPMgr.QQLogin();
    }
  },

  onWeiXin: function () {
    if (vee.IAPMgr && typeof vee.IAPMgr.WeiXinLogin === "function") {
      vee.IAPMgr.WeiXinLogin();
    }
  },

  onPlayNoLogin: function () {
    if (vee.IAPMgr && typeof vee.IAPMgr.logout === "function") {
      vee.IAPMgr.logout();
    }

    LyIndexWeiXin.playGame();
    game.loginPlatform = "normal";
    game.initPhantomCatData();
  },

  onKeyBack: function () {
    return true;
  },

  onExit: function () {
    if (vee.IAPMgr && typeof vee.IAPMgr.removeAllCallback === "function") {
      vee.IAPMgr.removeAllCallback();
    }
  }
});

LyIndexWeiXin.playGame = function () {
  if (vee.isFirstPlay) {
    vee.isFirstPlay = true;
    vee.PopMgr.closeAll();
    cc.director.purgeCachedData();
    vee.PopMgr.popCCB("res/veeGameLayer.ccbi");
    game.Data.oLyGame.onLoaded();
    game.Data.oLyGame.initStage("Story1");
    return;
  }

  vee.Controller.clearGlobalButtonAction();
  vee.Transition.out(res.MapTransition_ccbi, function () {
    LyLevelSelect.show();
  });
};

LyIndexWeiXin.show = function () {
  var layer = vee.PopMgr.popCCB(res.indexWeixin_ccbi);
  layer.controller.ccbInit();

  if (!vee.IAPMgr) {
    return;
  }

  vee.IAPMgr.LoginSuccessCallback = function () {
    LyIndexWeiXin.playGame();
  };

  vee.IAPMgr.LoginFailedCallback = function () {
    vee.Utils.scheduleBack(function () {
      vee.PopMgr.alert("登陆失败，请重新登陆", "登陆失败", function () {
      });
    });
  };
};

var LyWeiXinOpen = vee.Class.extend({
  ccbInit: function () {
    this.playAnimate("play", function () {
      vee.PopMgr.closeLayer();
      LyIndexWeiXin.show();
    });
  }
});

LyWeiXinOpen.show = function () {
  var layer = vee.PopMgr.popCCB(res.lyWeixinOpen_ccbi);
  layer.controller.ccbInit();
};

if (vee.IAPMgr) {
  vee.IAPMgr.NeedLoginCallback = function () {
    if (typeof LyWXLogin !== "undefined" && LyWXLogin && typeof LyWXLogin.show === "function") {
      LyWXLogin.show();
    }
  };
}

var EfxChildBalloon = vee.Class.extend({
  show: function () {
    this.playAnimate("loop");
    this.rootNode.runAction(cc.sequence(
      cc.delayTime(0.3),
      cc.callFunc(function () {
        this.rootNode.setVisible(true);
      }.bind(this))
    ));
  }
});
