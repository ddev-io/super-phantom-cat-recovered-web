
function SCWideMenu_getVisibleRectInNode(node) {
  if (!node || typeof cc === "undefined") {
    return null;
  }

  var win = null;
  if (typeof vee !== "undefined" && vee.PopMgr && vee.PopMgr.winSize) {
    win = vee.PopMgr.winSize;
  }
  if ((!win || !win.width || !win.height) && cc.winSize) {
    win = cc.winSize;
  }
  if ((!win || !win.width || !win.height) && cc.view && cc.view.getVisibleSize) {
    win = cc.view.getVisibleSize();
  }
  if (!win || !win.width || !win.height) {
    return null;
  }

  var p0 = cc.p(0, 0);
  var p1 = cc.p(win.width, win.height);

  if (node.convertToNodeSpace) {
    try {
      p0 = node.convertToNodeSpace(cc.p(0, 0));
      p1 = node.convertToNodeSpace(cc.p(win.width, win.height));
    } catch (e) {
      if (node.getPosition) {
        var pos = node.getPosition();
        p0 = cc.p(-pos.x, -pos.y);
        p1 = cc.p(win.width - pos.x, win.height - pos.y);
      }
    }
  } else if (node.getPosition) {
    var pos2 = node.getPosition();
    p0 = cc.p(-pos2.x, -pos2.y);
    p1 = cc.p(win.width - pos2.x, win.height - pos2.y);
  }

  var left = Math.min(p0.x, p1.x);
  var bottom = Math.min(p0.y, p1.y);
  var width = Math.abs(p1.x - p0.x);
  var height = Math.abs(p1.y - p0.y);
  if (!width || !height) {
    return null;
  }
  return cc.rect(left, bottom, width, height);
}

function SCWideMenu_getNodeSize(node) {
  if (!node) {
    return null;
  }
  var size = node.getContentSize ? node.getContentSize() : null;
  if (size && size.width > 4 && size.height > 4) {
    return size;
  }
  if (node.getBoundingBox) {
    var box = node.getBoundingBox();
    if (box && box.width > 4 && box.height > 4) {
      return cc.size(box.width, box.height);
    }
  }
  return null;
}

function SCWideMenu_fitSolidBackground(node, rect) {
  if (!node || !rect) {
    return false;
  }
  if (node.setAnchorPoint) {
    node.setAnchorPoint(cc.p(0, 0));
  }
  if (node.setPosition) {
    node.setPosition(cc.p(rect.x, rect.y));
  }
  if (node.setContentSize) {
    node.setContentSize(cc.size(rect.width, rect.height));
  }
  if (node.setScaleX) {
    node.setScaleX(1);
  }
  if (node.setScaleY) {
    node.setScaleY(1);
  }
  return true;
}

function SCWideMenu_fitSpriteBackground(node, rect) {
  if (!node || !rect) {
    return false;
  }
  var size = SCWideMenu_getNodeSize(node);
  if (!size || !size.width || !size.height) {
    return false;
  }
  if (node.__scWideMenuBaseScaleX == null) {
    node.__scWideMenuBaseScaleX = node.getScaleX ? node.getScaleX() : (node.scaleX || 1);
    node.__scWideMenuBaseScaleY = node.getScaleY ? node.getScaleY() : (node.scaleY || 1);
  }
  if (node.setAnchorPoint) {
    node.setAnchorPoint(cc.p(0, 0));
  }
  if (node.setPosition) {
    node.setPosition(cc.p(rect.x, rect.y));
  }
  var sx = Math.max(rect.width / size.width, 1);
  var sy = Math.max(rect.height / size.height, 1);
  if (node.setScaleX) {
    node.setScaleX(node.__scWideMenuBaseScaleX * sx);
    if (node.setScaleY) {
      node.setScaleY(node.__scWideMenuBaseScaleY * sy);
    }
  } else if (node.setScale) {
    node.setScale(node.__scWideMenuBaseScaleX * sx, node.__scWideMenuBaseScaleY * sy);
  }
  return true;
}

function SCWideMenu_isLargeBackgroundCandidate(node) {
  if (!node) {
    return false;
  }
  var size = SCWideMenu_getNodeSize(node);
  if (!size) {
    return false;
  }
  if (size.width < 900 || size.height < 350) {
    return false;
  }
  var visible = true;
  if (node.isVisible) {
    visible = node.isVisible();
  } else if (node.visible === false) {
    visible = false;
  }
  if (!visible) {
    return false;
  }
  return true;
}

function SCWideMenu_fixRootBackground(controller, explicitNodes) {
  if (!controller || !controller.rootNode) {
    return;
  }
  var rect = SCWideMenu_getVisibleRectInNode(controller.rootNode);
  if (!rect || !rect.width || !rect.height) {
    return;
  }

  if (explicitNodes) {
    for (var i = 0; i < explicitNodes.length; i++) {
      if (explicitNodes[i]) {
        SCWideMenu_fitSolidBackground(explicitNodes[i], rect);
      }
    }
  }

  // Do not auto-scale arbitrary large children here. In lyLevelSelect the first
  // category cell (OVERTURE) may be a direct root child and has a large bounding
  // box, so the old broad scan treated it as a background and moved/scaled it
  // away from its real page position. The two gradient layers passed through
  // explicitNodes are the only nodes that should be stretched for wide screens.
}

function SCWideMenu_scheduleBackgroundFix(controller, explicitNodes) {
  SCWideMenu_fixRootBackground(controller, explicitNodes);

  var fix = function () {
    SCWideMenu_fixRootBackground(controller, explicitNodes);
  };

  if (typeof vee !== "undefined" && vee.Utils && vee.Utils.scheduleOnceForTarget) {
    vee.Utils.scheduleOnceForTarget(controller, fix, 0.01);
    vee.Utils.scheduleOnceForTarget(controller, fix, 0.25);
    vee.Utils.scheduleOnceForTarget(controller, fix, 0.8);
  } else if (controller.rootNode && controller.rootNode.runAction && cc.sequence) {
    controller.rootNode.runAction(cc.sequence(cc.delayTime(0.01), cc.callFunc(fix)));
    controller.rootNode.runAction(cc.sequence(cc.delayTime(0.25), cc.callFunc(fix)));
    controller.rootNode.runAction(cc.sequence(cc.delayTime(0.8), cc.callFunc(fix)));
  }
}

function SCLevelSelect_isRecoveredLightBlur(node) {
  if (!node || typeof cc === "undefined" || !cc.Sprite || !(node instanceof cc.Sprite)) {
    return false;
  }

  var texture = node._texture;
  var textureName = texture && (texture.url || texture._url || texture.src || "") || "";
  textureName = textureName.replace(/\\/g, "/").toLowerCase();
  var slash = textureName.lastIndexOf("/");
  var textureKey = slash >= 0 ? textureName.substring(slash + 1) : textureName;
  if (textureKey !== "efx_box.png") {
    return false;
  }

  var size = node.getContentSize ? node.getContentSize() : node._contentSize;
  return !!(size && Math.round(size.width) === 144 && Math.round(size.height) === 144);
}

function SCLevelSelect_hideRecoveredLightBlur(rootNode) {
  if (!rootNode) {
    return;
  }

  var visit = function (node) {
    if (!node) {
      return;
    }

    if (SCLevelSelect_isRecoveredLightBlur(node)) {
      if (node.stopAllActions) {
        node.stopAllActions();
      }
      if (node.setOpacity) {
        node.setOpacity(0);
      }
      if (node.setVisible) {
        node.setVisible(false);
      }
    }

    var children = node._children || [];
    for (var i = 0; i < children.length; i++) {
      visit(children[i]);
    }
  };

  visit(rootNode);
}

function SCLevelSelect_scheduleHideRecoveredLightBlur(controller) {
  if (!controller || !controller.rootNode) {
    return;
  }

  var hide = function () {
    SCLevelSelect_hideRecoveredLightBlur(controller.rootNode);
  };

  hide();
  if (typeof vee !== "undefined" && vee.Utils && vee.Utils.scheduleOnceForTarget) {
    vee.Utils.scheduleOnceForTarget(controller, hide, 0.05);
    vee.Utils.scheduleOnceForTarget(controller, hide, 0.5);
  } else if (controller.rootNode.runAction && cc.sequence) {
    controller.rootNode.runAction(cc.sequence(cc.delayTime(0.05), cc.callFunc(hide)));
    controller.rootNode.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(hide)));
  }
}

function __lyLevelSelectSafeCall(obj, method) {
  if (!obj || typeof obj[method] !== "function") { return undefined; }
  var args = Array.prototype.slice.call(arguments, 2);
  return obj[method].apply(obj, args);
}

var LyLevelSelect = vee.Class.extend({
  ccbCategory1: null,
  ccbCategory2: null,
  ccbCategory3: null,
  ccbCategory4: null,
  ccbCategory5: null,
  ccbCategory6: null,
  ccbCategory7: null,
  btnSetting: null,
  btnGoogle: null,
  btnHelp: null,
  btnInfo: null,
  nodeBR: null,
  ccbEnergy: null,
  ccbLevelCells: null,
  ccbBtnShop: null,
  ccbBtnWorld: null,
  ccbFlag: null,
  ccbSocial: null,
  nodeT: null,
  ccbBtnBalloon: null,
  ccbBtnMoon: null,
  ccbBtnBattle: null,
  nodeTR: null,
  spKeySelWorld: null,
  nodeReverseParticle: null,
  ccbparticleSnow: null,
  _isOver: false,
  lyBgColor: null,
  lyBgColor2: null,
  categoryCtls: null,
  width: 0,
  selectedCategory: null,
  isSelectingLevel: false,
  isAnimating: false,
  pagingCtl: null,
  lbCoinNum: null,
  lbStarNum: null,
  _selectedPage: 0,
  arrReadyUnlockIdx: null,
  _maxPageNum: 0,
  _mapType: 1,
  ccparticle: null,
  nodeNormalParticle: null,
  _maxPageCount: -1,
  _isFocusMenu: false,
  _isFocusTop: false,
  topTag: false,
  _tempControllerState: null,
  moonWhiteSceenDebug: false,

  initContent: function () {
    game.Data.curSceen = "LyLevelSelect";

    var lastCategoryIndex = game.LevelData.categoryCount - 1;
    var firstCell = this.ccbCategory1;
    var firstPos = firstCell.getPosition();

    if (firstCell && firstCell.controller) {
      firstCell.controller._origin = cc.p(firstPos.x, firstPos.y);
      firstCell.setPosition(cc.p(firstPos.x, firstPos.y));
    }

    for (var i = 1; i < lastCategoryIndex; i++) {
      var x = firstPos.x + i * 510;
      var y = firstPos.y;
      var ccbi = (i < lastCategoryIndex - 1) ? res.CategoryCell_ccbi : res.CategoryCellSoon_ccbi;

      if (game.Data.version.curVersion === VERSION.TVOS_GENUINE && i === lastCategoryIndex - 1) {
        ccbi = res.CategoryCell_ccbi;
      }

      var cell = cc.BuilderReader.load(ccbi);
      cell.controller._origin = cc.p(x, y);
      cell.setPosition(cc.p(x, y));
      this["ccbCategory" + (i + 1)] = cell;
      this.lyContent.addChild(cell);
    }
  },

  showAudioPreloading: function () {},

  adaptWideScreenBackground: function () {
    SCWideMenu_scheduleBackgroundFix(this, [this.lyBgColor, this.lyBgColor2]);
  },

  setOldPlayerForParkourLevel: function () {
    if (vee.dataManager.isOldPlayerInParkour() !== "false" || game.Data.zqdebug) {
      if (vee.dataManager.getIsFirstClickCategory9() === "false") {
        vee.dataManager.setOldplayerInParkour("true");
      } else {
        vee.dataManager.setOldplayerInParkour("false");
      }
    }
  },

  ccbInit: function () {
    game.Data.oLvSelectCtl = this;
    cc.log("lyLevelSelect init disconnect================");
    __lyLevelSelectSafeCall(typeof MultiController !== "undefined" ? MultiController : null, "disconnectGame");

    this.categoryCtls = [];
    this.setOldPlayerForParkourLevel();
    __lyLevelSelectSafeCall(vee.IAPMgr, "getServicePriceList");
    __lyLevelSelectSafeCall(vee.Controller, "clearAll");
    this.initContent();
    this.adaptWideScreenBackground();
    SCLevelSelect_scheduleHideRecoveredLightBlur(this);

    game.Data.retryCount = 0;

    var avatarStore = LyAvatarStore.load();
    this.rootNode.addChild(avatarStore);
    avatarStore.controller.onLoaded();

    __lyLevelSelectSafeCall(typeof VeeRecordButton !== "undefined" ? VeeRecordButton : null, "stopRecord");
    game.Data.oLvSelectCtl = this;
    game.Data.checkShowBtnWorld();

    this._maxPageNum = game.LevelData.categoryCount;
    var pagingCtl = vee.PowerPagingController.registerController(this.lyContent, this._maxPageNum - 1);
    pagingCtl.setSensitivity(0.75);
    pagingCtl.setResetAnimation(this.animatePagePos.bind(this));
    pagingCtl.setPositionChanged(this.updatePagePos.bind(this));
    pagingCtl.setBounceEnabled(true);
    pagingCtl.setDragingBuffer(30);
    pagingCtl.onGestureTap = this.onGestureTap.bind(this);
    pagingCtl.setSwallowTouches(false);
    pagingCtl.setPageChanged(function () {
      vee.Audio.playEffect(res.outGame_menu_viewSection_mp3);
    }.bind(this));

    if (this.ccparticle) {
      this.ccparticle.setVisible(false);
    }
    if (this.nodeNormalParticle) {
      this.nodeNormalParticle.setVisible(false);
    }
    if (this.ccbparticleSnow) {
      this.ccbparticleSnow.setVisible(true);
      vee.Audio.playMusic(res.outGame_menu_levelSelect_mp3);
    }

    this.pagingCtl = pagingCtl;
    this.width = pagingCtl.getPageWidth();

    // Level cells must stay hidden on the category map. Some recovered CCBs do
    // not call EfxLevelCells.onCreate(), so the OVERTURE level list was visible
    // immediately after opening the level-select screen. Keep the panel hidden
    // until showCategoryLevels()/enterSelectLevel() is called by a real tap.
    if (this.ccbLevelCells) {
      this.ccbLevelCells.setVisible(false);
      this.ccbLevelCells.setLocalZOrder(0);
    }
    game.LevelData.selectedCategory = null;

    this.unlockLevel61();
    this.refreshCategory();

    if (game.Data.version.isSetShowSpecialEvent) {
      this.setSpecialLevelEvent();
    } else {
      this.updateLevel61();
    }

    this.lyContent.setLocalZOrder(1);
    this.ccbBtnShop.setLocalZOrder(999);
    this.ccbEnergy.setLocalZOrder(999);
    if (this.ccbBtnWorld) {
      this.ccbBtnWorld.setLocalZOrder(1000);
    }
    if (this.ccbBtnBattle) {
      this.ccbBtnBattle.setLocalZOrder(1001);
    }

    vee.PopMgr.setNodePos(this.ccbBtnWorld, vee.PopMgr.PositionType.TopLeft);
    vee.PopMgr.setNodePos(this.ccbBtnBattle, vee.PopMgr.PositionType.TopLeft);
    vee.PopMgr.setNodePos(this.ccbBtnShop, vee.PopMgr.PositionType.TopRight);
    vee.PopMgr.setNodePos(this.nodeTR, vee.PopMgr.PositionType.TopRight);

    if (this.nodeT) {
      vee.PopMgr.setNodePos(this.nodeT, vee.PopMgr.PositionType.Top);
      if (this.ccbFlag) {
        this.ccbFlag.controller.loopAnimate();
      }
    }

    this.refreshCoin();

    cc.log("star = " + game.LevelData.getStar());
    this.lbStarNum.setString(game.LevelData.getStar());
    if (typeof vee !== "undefined" && vee.Analytics &&
        typeof vee.Analytics.logPlayerLevel === "function") {
      vee.Analytics.logPlayerLevel("" + game.LevelData.getStar());
    }

    vee.Transition.in(res.MapTransition_ccbi);
    this.ccbLevelCells.controller.updateCells();
    // updateCells() can fill the OVERTURE cells because the current page is
    // selected by the pager, but the grid itself must remain closed here.
    this.ccbLevelCells.setVisible(false);
    this.ccbLevelCells.setLocalZOrder(0);
    game.LevelData.selectedCategory = null;
    this.handleKey(true);

    this.btnGoogle.setVisible(game.Data.isAndroid && game.Data.isFreeGame);
    this.btnSetting.setVisible(game.Data.isAndroid && game.Data.isFreeGame);
    this.ccbEnergy.setVisible(game.Data.isFreeGame);

    this.registerController();

    if (game.Data.isWeiXin) {
      this.btnGoogle.setBackgroundSpriteForState(new cc.Scale9Sprite(res.btn_home_index_quit_png), cc.CONTROL_STATE_NORMAL);
    }

    var shouldShowWorldButton = game.Data.isShowBtnWorld() ||
      game.Data.isReverseWorldOpen ||
      (typeof vee !== "undefined" && vee.data && vee.data.moon);

    if (shouldShowWorldButton) {
      this.ccbBtnWorld.setVisible(true);

      var battleX = this.ccbBtnWorld.getContentSize().width + this.ccbBtnWorld.getPositionX();
      this.ccbBtnBattle.setPosition(cc.p(battleX, this.ccbBtnWorld.getPositionY()));

      if (game.Data.isNewReverseWorld) {
        game.Data.isNewReverseWorld = false;
        this._mapType = LyLevelSelect.MapType.MAP_NORMAL;
        this._showNormal();
        this.ccbBtnWorld.controller.showMoon();
        this.ccbBtnWorld.controller.setNew(true);
      } else if (game.Data.isSelectingReverseWorld) {
        this._mapType = LyLevelSelect.MapType.MAP_REVERSE;
        this._showReverse();
      } else {
        this._mapType = LyLevelSelect.MapType.MAP_NORMAL;
        this._showNormal();
      }
    } else {
      this.ccbBtnWorld.setVisible(false);
      this.ccbBtnBattle.setPosition(cc.p(this.ccbBtnWorld.getPositionX(), this.ccbBtnWorld.getPositionY()));
      game.Data.isSelectingReverseWorld = false;
      this.nodeReverseParticle.setVisible(false);
    }

    if (game.Data.version.isMidAutumn && this.ccbBtnMoon) {
      cc.log("btn moon visible=====" + !game.Data.isSelectingReverseWorld);
      this.ccbBtnMoon.controller.ccbInit();
      this.ccbBtnMoon.setVisible(!game.Data.isSelectingReverseWorld && game.Data.version.isShowSpecialLevel());
    }

    if (this.nodeBR) {
      vee.PopMgr.setNodePos(this.nodeBR, vee.PopMgr.PositionType.BottomRight);
      this.nodeBR.setLocalZOrder(1000);
      this.nodeBR.setVisible(game.Data.version.isKTPlay);
      this.ccbSocial.controller.ccbInit();
    }

    var avatar = game.AvatarData.getAvatarData(11);
    if (!avatar.owned) {
      var levelState = game.LevelData.getCategory(6).getLevelDataController(0).getLevelState();
      if (levelState === 2) {
        game.AvatarData.avatarPurchased(11);
        vee.Analytics.UGameEvent.unlockRoleEvent("61", 11);
      }
    }

    MultiController.isMultiLevel = false;
    MultiController.isOpenGame = true;
    this.showLoginPop();
    this.adaptWideScreenBackground();
  },

  showLoginPop: function () {
    if (game.Data.willShowLoginPop && game.Data.isFreeGame) {
      game.Data.willShowLoginPop = false;
      var days = vee.dataManager.getContinuousLoginDays();
      cc.log("zq debug ===========show login pop   days===" + days);
      if (days < 5) {
        ccbContinuousLoginAlert.show(days);
      }
    }

    vee.dataManager.setLoginTime();
  },

  onExit: function () {
    LyLevelSelect.isUnlocking = false;
    game.Data.oLvSelectCtl = null;
    vee.Controller.deactiveSelector();
    vee.Controller.removeControllerSprite(this.spKeySelWorld);
  },

  refreshCategory: function () {
    if (game.Data.isFreeGame) {
      var firstAvailablePage = 0;
      for (var i = 1; i <= this._maxPageNum - 1; i++) {
        var cell = this["ccbCategory" + i];
        if (!cell) {
          continue;
        }

        this.categoryCtls[i] = cell.controller;
        var categoryIndex = i - 1;
        if (game.Data.isSelectingReverseWorld) {
          categoryIndex += 100;
        }

        if (!this.categoryCtls[i].setIndex(categoryIndex)) {
          firstAvailablePage = i;
        }
        this.categoryCtls[i].disSelect(0);
      }

      var selectedLvIdx = game.Data.getSelectedLvIdx();
      if (selectedLvIdx > 20) {
        selectedLvIdx -= 100;
      }
      this.pagingCtl.setPage(selectedLvIdx, true);
      return;
    }

    this.arrReadyUnlockIdx = [];
    for (var j = 1; j <= this._maxPageNum - 1; j++) {
      var categoryCell = this["ccbCategory" + j];
      if (!categoryCell) {
        continue;
      }

      this.categoryCtls[j] = categoryCell.controller;
      var idx = j - 1;
      if (game.Data.isSelectingReverseWorld) {
        idx += 100;
      }

      var isReady = this.categoryCtls[j].setIndex(idx);
      if (isReady) {
        this.arrReadyUnlockIdx.push(j);
      }
      this.categoryCtls[j].disSelect(0);
    }

    this.unlockCategory();
  },

  showFirstCategory: function () {
    this._selectedPage = 1;
    this.selectedCategory = this.categoryCtls[1].select(0.01);

    var colors = game.LevelData.getBgColors(this._selectedPage - 1);
    this.lyBgColor.setOpacity(255);
    this.lyBgColor.setStartColor(colors[1]);
    this.lyBgColor.setEndColor(colors[0]);
  },

  registerController: function () {
    this._maxPageCount = this.pagingCtl.getTotalPageCount();

    vee.Controller.clearAllButtonAction();
    vee.Controller.activeButton();
    vee.Controller.registerButtonAction(vee.KeyCode.BUTTON_DPAD_LEFT, this.pageToLeft.bind(this));
    vee.Controller.registerButtonAction(vee.KeyCode.BUTTON_DPAD_RIGHT, this.pageToRight.bind(this));
    vee.Controller.registerButtonAction(vee.KeyCode.BUTTON_DPAD_DOWN, this.pageToBottom.bind(this));
    vee.Controller.registerButtonAction(vee.KeyCode.BUTTON_DPAD_UP, this.pageToTop.bind(this));
    vee.Controller.registerButtonAction([vee.KeyCode.BUTTON_A, vee.KeyCode.BUTTON_DPAD_CENTER], function () {
      if (!this._isFocusMenu && !this.isSelectingLevel) {
        this.showCategoryLevels();
      }
    }.bind(this));
    vee.Controller.registerButtonAction(vee.KeyCode.BUTTON_B, function () {
      if (this.isSelectingLevel) {
        this.leaveSelectLevel();
      } else {
        this.backClickEvent();
      }
    }.bind(this));
    vee.Controller.registerButtonAction(
      [vee.KeyCode.BUTTON_RIGHT_SHOULDER, vee.KeyCode.AXIS_RIGHT_TRIGGER],
      this.ccbBtnShop.controller.onOpenStore.bind(this.ccbBtnShop.controller)
    );
    vee.Controller.registerButtonAction(
      [vee.KeyCode.BUTTON_LEFT_SHOULDER, vee.KeyCode.AXIS_LEFT_TRIGGER],
      this.ccbBtnWorld.controller.onReverseWorld.bind(this.ccbBtnWorld.controller)
    );
    vee.Controller.registerControllerSprite(this.spKeySelWorld);
  },

  backClickEvent: function () {
    if (game.Data.version.curVersion === VERSION.TVOS_GENUINE) {
      vee.Transition.out(res.MapTransition_ccbi, function () {
        LyTVOSIndex.show();
      });
    } else {
      VeeQuitBox.show();
    }
  },

  createTopItemMap: function () {
    vee.Controller.clearAllItem();

    if (game.Data.isReverseWorldOpen && game.Data.isShowBtnWorld()) {
      vee.Controller.initSelector(2, 1, null, cc.p(1, 0));
      vee.Controller.registerItemByButton(
        BtnWorld.instance.btnReverseWorld,
        cc.p(0, 0),
        this.ccbBtnWorld.controller.onReverseWorld.bind(this.ccbBtnWorld.controller),
        res.mfi_home_world_on_png
      );
    } else {
      vee.Controller.initSelector(2, 1, null, cc.p(0, 0));
      vee.Controller.registerItemByButton(
        BtnShop.instance.btnOpenStore,
        cc.p(0, 0),
        this.ccbBtnShop.controller.onOpenStore.bind(this.ccbBtnShop.controller),
        res.mfi_home_avatar_on_png
      );
    }

    vee.Controller.deactiveSelector();
  },

  createLeftItemMap: function () {
    vee.Controller.clearAllItem();
    vee.Controller.deactiveSelector();
  },

  createLevelsItemMap: function (categoryData) {
    vee.Controller.clearAllItem();

    var firstRow = Math.ceil((7 - categoryData.levelCount) / 2) + 1;
    vee.Controller.initSelector(7, 2, null, cc.p(firstRow - 1, 1 - firstRow % 2));

    for (var i = 0; i < categoryData.levelCount; i++) {
      var tag = firstRow + i;
      var gridX = tag - 1;
      var gridY = 1 - tag % 2;
      var cellCtl = this.ccbLevelCells.getChildByTag(tag).controller;

      vee.Controller.registerItemByButton(
        cellCtl.spBG,
        cc.p(gridX, gridY),
        cellCtl.onSelect.bind(cellCtl),
        res.mfi_home_level_on_png
      );
    }
  },

  pageToLeft: function () {
    if (this.isSelectingLevel || this._isFocusTop) {
      return;
    }

    var currentPage = this.pagingCtl.getCurrentPageNum();
    if (currentPage > 1) {
      this.pagingCtl.setPage(currentPage - 1, true);
    } else if (!this._isFocusMenu) {
      this._isFocusMenu = true;
      this.createLeftItemMap();
      vee.Controller.activeSelector();
    }
  },

  pageToRight: function () {
    if (this.isSelectingLevel || this._isFocusTop) {
      return;
    }

    var currentPage = this.pagingCtl.getCurrentPageNum();
    if (this._isFocusMenu) {
      this._isFocusMenu = false;
      vee.Controller.deactiveSelector(true);
    } else if (currentPage < this._maxPageCount) {
      this.pagingCtl.setPage(currentPage + 1, true);
    }
  },

  pageToTop: function () {
    if (this.isSelectingLevel) {
      return;
    }

    if (!this._isFocusMenu || this.topTag) {
      this.createTopItemMap();
      this._isFocusTop = true;
      this._isFocusMenu = false;
      this.topTag = false;
      vee.Controller.activeSelector();
      return;
    }

    var grid = vee.Controller.getSelectorGrid();
    if (this._isFocusMenu && grid.x === 0 && grid.y === 0) {
      this.topTag = true;
    }
  },

  pageToBottom: function () {
    if (!this._isFocusTop) {
      return;
    }

    this._isFocusTop = false;
    vee.Controller.deactiveSelector(true);
  },

  onHelp: function () {
    if (this._isOver) {
      return;
    }

    this._isOver = true;
    vee.Transition.out(res.MapTransition_ccbi, function () {
      vee.PopMgr.closeAll();
      cc.director.purgeCachedData();
      vee.PopMgr.popCCB("res/veeGameLayer.ccbi");
      game.Data.oLyGame.onLoaded();
      game.Data.oLyGame.initStage("Story1");
    });
  },

  onInfo: function () {
    LyStaff.show();
  },

  onSetting: function () {
    if (this._isOver) {
      return;
    }
    LyPosSetting.show();
  },

  onGoogle: function () {
    if (game.Data.isWeiXin) {
      vee.PopMgr.closeAll();
      LyIndexWeiXin.show();
      vee.IAPMgr.logout();
    } else {
      LyGoogle.show();
    }
  },

  onKeyBack: function () {
    if (this._isOver) {
      return;
    }

    if (this.isSelectingLevel) {
      this.leaveSelectLevel();
      return;
    }

    this.backClickEvent();
  },

  refreshCoin: function () {
    if (!this.lbCoinNum) {
      return;
    }

    if (game.LevelData.getCoin() > 0) {
      this.lbCoinNum.setString(game.LevelData.getCoin());
    } else {
      this.lbCoinNum.setString("0");
    }

    this.lbCoinNum.setString(game.LevelData.getCoin());
  },

  unlockCategory: function () {
    cc.log("unlock category length ====%d", this.arrReadyUnlockIdx.length);

    if (this.arrReadyUnlockIdx.length > 0) {
      LyLevelSelect.isUnlocking = true;
      this.pagingCtl.setEnabled(false);

      var page = this.arrReadyUnlockIdx.shift();
      if (page > 20) {
        page -= 100;
      }

      this.pagingCtl.setPage(page, true);
      this.categoryCtls[page].unlockAnimate(this.unlockCategory.bind(this));
      return;
    }

    LyLevelSelect.isUnlocking = false;
    this.pagingCtl.setEnabled(true);

    var selectedLvIdx = game.Data.getSelectedLvIdx();
    cc.log("check 61 idx = " + selectedLvIdx);
    if (selectedLvIdx > 20) {
      selectedLvIdx -= 100;
    }

    this.pagingCtl.setPage(selectedLvIdx, true);
  },

  unlockCategoryByIdx: function (idx, shouldShowLevels) {
    this.categoryCtls[idx].unlockAnimate(function () {
      this.categoryCtls[idx].changeToPercentage();
      if (shouldShowLevels) {
        this.showCategoryLevels();
      }
    }.bind(this));
  },

  setSpecialLevelEvent: function () {
    if (!game.Data.version.isShowSpecialLevel()) {
      return;
    }

    for (var idx = 6; idx < game.LevelData.categoryCount - 1; idx++) {
      var category = game.LevelData.getCategory(idx);
      if (category.lockStatus === game.LevelData.LockStatus.LOCKED && category.categoryReady) {
        cc.log("set special level event=====%d", idx);
        game.LevelData.setLockStatus(idx, game.LevelData.LockStatus.UNLOCKED);
      }
    }
  },

  updateLevel61: function () {
    if (vee.data.level61_ts && game.Data.getLevel61LeftTime() > 0) {
      this.ccbCategory7.controller.setLeftTime(game.Data.getLevel61LeftTime());
    }
  },

  unlockLevel61: function () {
    if (game.Data.getLevel61LeftTime() <= 0 &&
        game.LevelData.getCategory(6).lockStatus === game.LevelData.LockStatus.LOCKED) {
      game.LevelData.setLockStatus(6, game.LevelData.LockStatus.UNLOCKED);
    }
  },

  onGestureTap: function (gesture, delta) {
    cc.log("on select click");

    if (!this.selectedCategory || this.isAnimating) {
      return;
    }

    if (!this.isSelectingLevel) {
      var point = gesture.getLastPointInWorld();
      if (delta < 30) {
        if (vee.Utils.distancePower2BetweenPoints(point, cc.p(58, 340)) < 45000) {
          this.pageToLeft();
        } else if (vee.Utils.distancePower2BetweenPoints(point, cc.p(568, 340)) < 45000) {
          this.showCategoryLevels();
        } else if (vee.Utils.distancePower2BetweenPoints(point, cc.p(1078, 340)) < 45000) {
          this.pageToRight();
        }
      }
      return;
    }

    this.leaveSelectLevel();
  },

  showCategoryLevels: function () {
    if (!this.selectedCategory.isLock || game.Data.isAllLevelOpen) {
      this.enterSelectLevel();

      var categoryData = game.LevelData.selectedCategory;
      if (categoryData) {
        this.createLevelsItemMap(categoryData);
        vee.Controller.activeSelector();
      }
      return;
    }

    var data = this.selectedCategory._categoryData;
    if (!this.selectedCategory.isComingSoon && data && data.categoryReady) {
      var idx = this.pagingCtl.getCurrentPageNum() - 1;
      AlertUnlockCategory.show(this.selectedCategory.getUnlockStarDesc(game.Data.isSelectingReverseWorld), idx);
    } else {
      vee.Analytics.UGameEvent.clickButtonEvent("preRegist");
      ccbPreRegistPop.show();
    }
  },

  enterSelectLevel: function () {
    this.isSelectingLevel = true;
    this.pagingCtl.setDragingEnabled(false);
    this.pagingCtl.setCanSwipe(false);
    this.selectedCategory.enter();
    this.ccbLevelCells.setVisible(true);
    this.isAnimating = true;

    game.LevelData.selectedCategory = this.selectedCategory.getCategoryData();
    this.ccbLevelCells.controller.updateCells();
    this.ccbBtnWorld.isCanClick = false;
    this.ccbLevelCells.controller.show(function () {
      this.isAnimating = false;
      this.ccbLevelCells.setLocalZOrder(999);
      this.ccbBtnWorld.isCanClick = true;
    }.bind(this));
  },

  leaveSelectLevel: function () {
    if (this._isOver) {
      return;
    }

    this.isSelectingLevel = false;
    this.selectedCategory.out();
    this.ccbLevelCells.setLocalZOrder(0);
    this.isAnimating = true;
    game.LevelData.selectedCategory = null;
    vee.Controller.deactiveSelector();
    this.ccbLevelCells.controller.hide(function () {
      this.isAnimating = false;
      this.pagingCtl.setDragingEnabled(true);
      this.pagingCtl.setCanSwipe(true);
      this.ccbLevelCells.setVisible(false);
    }.bind(this));
  },

  startLevel: function (callback) {
    if (game.Data.costEnergy()) {
      this._isOver = true;
      LyLevelSelect.isUnlocking = true;
      this.pagingCtl.setEnabled(false);

      var delay = game.Data.isEnergyUnlimited() ? 0 : 0.4;
      vee.Utils.scheduleOnceForTarget(this, function () {
        vee.Transition.out(res.MapTransition_ccbi, callback);
      }, delay);
      return;
    }

    game.Data.onEnergyEmpty(game.LifeEmptyType.Select);
  },

  showLevelMap: function (mapType) {
    if (mapType === this._mapType) {
      return;
    }

    this._isFocusMenu = false;
    this._mapType = mapType;
    vee.Controller.deactiveButton();
    vee.Controller.deactiveSelector(true);

    if (mapType === LyLevelSelect.MapType.MAP_NORMAL) {
      vee.Transition.perform(
        res.MapTransition_ccbi,
        this._showNormal.bind(this),
        0,
        this.showLevelMapFinish.bind(this)
      );
    } else if (mapType === LyLevelSelect.MapType.MAP_REVERSE) {
      if (!this.moonWhiteSceenDebug) {
        this.moonWhiteSceenDebug = true;
        vee.Analytics.logEvent("moonWorld_whiteSceenTag_start");
      }

      vee.Transition.perform(
        res.MapTransition_ccbi,
        this._showReverse.bind(this),
        0,
        this.showLevelMapFinish.bind(this)
      );
    }

    if (this.isSelectingLevel) {
      this.leaveSelectLevel();
    }

    this._curMapType = mapType;

    if (game.Data.version.isMidAutumn && this.ccbBtnMoon) {
      this.ccbBtnMoon.setVisible(
        mapType === LyLevelSelect.MapType.MAP_NORMAL && game.Data.version.isShowSpecialLevel()
      );
    }
  },

  showLevelMapFinish: function () {
    vee.Controller.activeButton();

    if (this.moonWhiteSceenDebug) {
      this.moonWhiteSceenDebug = false;
      vee.Analytics.logEvent("moonWorld_whiteSceenTag_end");
    }
  },

  _showNormal: function () {
    game.Data.isSelectingReverseWorld = false;

    var colors = game.LevelData.getBgColors(this._selectedPage - 1);
    this.resetColor(colors);
    this.adaptWideScreenBackground();

    this.nodeReverseParticle.setVisible(false);
    this.ccbBtnWorld.controller.showMoon();
    this.ccbBtnWorld.controller.setNew(false);
    this.refreshCategory();
  },

  _showReverse: function () {
    game.Data.isSelectingReverseWorld = true;

    var colors = [cc.color(14, 6, 14, 255), cc.color(47, 34, 100, 255)];
    this.resetColor(colors);
    this.adaptWideScreenBackground();

    if (this.nodeReverseParticle) {
      this.nodeReverseParticle.setVisible(true);
    }
    if (this.ccbBtnWorld) {
      this.ccbBtnWorld.controller.showSun();
    }
    if (this.ccbBtnWorld) {
      this.ccbBtnWorld.controller.setNew(false);
    }

    this.refreshCategory();
  },

  animatePagePos: function (controller, duration) {
    var page = controller.getCurrentPageNum();
    if (!this.categoryCtls[page]) {
      page = 1;
      this.pagingCtl.setPage(page, false);
    }

    this.selectedCategory = this.categoryCtls[page].select(duration);

    if (page !== 1 && this.categoryCtls[page - 1]) {
      this.categoryCtls[page - 1].disSelect(duration);
    }
    if (page !== this._maxPageNum && this.categoryCtls[page + 1]) {
      this.categoryCtls[page + 1].disSelect(duration);
    }

    if (this._mapType === LyLevelSelect.MapType.MAP_NORMAL) {
      this.updateColor(page);
    }
  },

  updateColor: function (page) {
    if (this._mapType !== LyLevelSelect.MapType.MAP_NORMAL) {
      return;
    }
    if (page === this._selectedPage) {
      return;
    }

    this._selectedPage = page;
    var colors = game.LevelData.getBgColors(page - 1);
    this.resetColor(colors);
  },

  resetColor: function (colors) {
    this.adaptWideScreenBackground();
    this.lyBgColor.setOpacity(255);
    this.lyBgColor2.setStartColor(colors[1]);
    this.lyBgColor2.setEndColor(colors[0]);
    this.lyBgColor.runAction(cc.sequence(
      cc.fadeOut(0.3),
      cc.callFunc(function () {
        this.lyBgColor.setStartColor(this.lyBgColor2.startColor);
        this.lyBgColor.setEndColor(this.lyBgColor2.endColor);
        this.lyBgColor.setOpacity(255);
      }.bind(this))
    ));
  },

  updatePagePos: function (controller, position) {
    var offsetX = position.x - controller.getCurrentPagePos().x;
    if (offsetX === 0) {
      return;
    }

    var offset = Math.min(1, Math.abs(offsetX) / this.width);
    if (offset > 0.3) {
      this.selectedCategory = null;
    }

    var page = controller.getCurrentPageNum();
    this.categoryCtls[page].setOffset(1 - offset);

    if (offsetX > 0 && page > 1) {
      this.categoryCtls[page - 1].setOffset(offset);
    }

    if (offsetX < 0 && page < 5) {
      this.categoryCtls[page + 1].setOffset(offset);
    }

    if (this._isFocusMenu) {
      this._isFocusMenu = false;
      vee.Controller.deactiveSelector(true);
    }
  }
});

LyLevelSelect.isUnlocking = false;
LyLevelSelect.MapType = {
  MAP_NORMAL: 1,
  MAP_REVERSE: 2
};

LyLevelSelect.show = function () {
  vee.soundButton();
  vee.PopMgr.closeAll();

  var ccbPath = res.lyLevelSelect_ccbi;
  var layer = vee.PopMgr.popCCB(ccbPath);
  layer.controller.ccbInit();
};

var BtnBalloon = vee.Class.extend({
  spBalloon: null,

  ccbInit: function () {
    this.playAnimate("loop");

    var lang = vee.Utils.getLocalizedStringForKey("lang");
    if (lang === "cn_s" || lang === "cn_t") {
      this.spBalloon.setTexture(res.levelBalloonCN_png);
    }
  },

  onTouch: function () {
    var lvSelectCtl = game.Data.oLvSelectCtl;
    if (!lvSelectCtl) {
      return;
    }

    if (lvSelectCtl.isSelectingLevel) {
      lvSelectCtl.leaveSelectLevel();
    }
    lvSelectCtl.leaveSelectLevel();
    lvSelectCtl.pagingCtl.setPage(7, true);
  }
});

var BtnMoon = vee.Class.extend({
  ccbInit: function () {
    this.playAnimate("loop");
  },

  onTouch: function () {
    var lvSelectCtl = game.Data.oLvSelectCtl;
    if (!lvSelectCtl) {
      return;
    }

    if (lvSelectCtl.isSelectingLevel) {
      lvSelectCtl.leaveSelectLevel();
    }
    lvSelectCtl.leaveSelectLevel();
    lvSelectCtl.pagingCtl.setPage(9, true);
  }
});

var EfxFlags = vee.Class.extend({
  loopAnimate: function () {
    this.playAnimate("loop");
  }
});

var BtnSocial = vee.Class.extend({
  nodeAni: null,
  spDot: null,

  ccbInit: function () {
    if (vee.KTPlay && typeof vee.KTPlay.isNewNotice === "function" && vee.KTPlay.isNewNotice()) {
      this.spDot = new cc.Sprite(res.image_redot_png);
      if (this.nodeAni) {
        this.nodeAni.addChild(this.spDot);
        this.spDot.setPosition(cc.p(30, 40));
      }
    }
  },

  onKTPlay: function () {
    if (vee.KTPlay && typeof vee.KTPlay.show === "function") {
      vee.KTPlay.show();
    }
    if (this.spDot) {
      this.spDot.setVisible(false);
    }
  }
});
