// Recovered first-pass JS from project/recovered-src/dis-samples/dis/gameData.dis
var game = game || {};
var TILE_WIDTH = 64;
var TILE_WIDTH_HALF = 32;
var TILE_WIDTH_3_1 = 21;
var TILE_WIDTH_3_2 = 43;
game.Data = {
  winSize: cc.size(768, 1136),
  tileSizeWidth: 64,
  tileSizeWidthHalf: 32,
  secretLayerStatus: 1,
  isDoorIn: true,
  doorOutOffset: cc.p(0, 0),
  isHoldJumpButtom: false,
  isChangingBG: false,
  performingTMXIdx: null,
  lastTMXIdx: null,
  realLastTmxIdx: null,
  savePointSaved: false,
  savePointLifePrice: 100,
  overRevivePrice: 200,
  energyReviveDelay: 600000,
  smallButtonRate: 0.6,
  videoReward: 500,
  energyUnlimitedTime: 20,
  level61Time: 1440,
  isSelectingReverseWorld: false,
  newReverseWorldIdx: -1,
  newMoonLevelIdx: -9,
  isResetSkip: true,
  collectedStarCount: 0,
  stageMaxCoin: 0,
  stageType: 1,
  playerDeadGrid: null,
  bgName: null,
  gameStartTime: null,
  jumpCount: 0,
  isEnableCameraYOff: true,
  retryCount: 0,
  tempPlayerCtl: null,
  deadCount: 0,
  mapRightEdge: 0,
  oLyGame: null,
  oLyGameOver: null,
  oPlayerCtl: null,
  MultiMine: null,
  oLvCtl: null,
  oLvSelectCtl: null,
  oLvLoadingCtl: null,
  oPauseCtl: null,
  oEnergyCtl: null,
  tmxInfoStack: null,
  itemCoinPool: [],
  enemyPool: [],
  usingEnemyPool: [],
  npcmap: {},
  arrUpdateObj: [],
  arrGrabbedPlatform: [],
  arrSkillBoxes: [],
  playerLife: 0,
  playerMaxLife: 5,
  coin: 0,
  playerType: 0,
  roleType: null,
  isUpdatePlayerPos: false,
  playerSizeWidth: 64,
  playerTopEdgeWidth: 10,
  playerBottomEdgeWidth: 20,
  dynamicBlockTopEdgeWidth: 25,
  G: -4000,
  playerXacc: 3000,
  playerXdecay: 2560,
  playerXSpeedLimit: 440,
  playerXBurstSpeed: 600,
  playerBurstHoldTime: 0.1,
  playerYSpeedLimit: -1000,
  playerYJumpSpeed: 1080,
  playerYTriggerSpeed: 800,
  playerYMiniJumpSpeed: 480,
  playerJumpHeight: 230,
  playerInvisible: false,
  playerHawk: false,
  playerTeleportLength: 3,
  BButtonCDTime: 0,
  bulletCount: 1,
  cameraXPos: 0,
  cameraXPosLimit: 50,
  cameraXMoveSpeed: 100,
  cameraXrevived: true,
  cameraYPos: 0,
  cameraYPosOff: -60,
  cameraYPosLimit: 260,
  cameraYMoveRate: 0.65,
  cameraYRestoreSpeed: 200,
  cameraRestoreY: 1,
  cameraYrevived: true,
  cameraScaleRate: 1,
  cameraScaleSpeed: 0.01,
  cameraScaleLimitMAX: 1,
  cameraScaleLimitMIN: 1,
  btnMovePos: null,
  btnDropPos: null,
  btnJumpPos: null,
  isAndroid: true,
  isFreeGame: true,
  isWeiXin: false,
  isReverseWorldOpen: true,
  isIOSCN: false,
  is61: false,
  isClearVersion: false,
  isAllLevelOpen: false,
  orderId: null,
  isAutoLoginGoogle: false,
  isAndroidTV_test: false,
  isInLevelSceen: false,
  willShowVideoAd: false,
  shownVideoAd: false,
  willShowLoginPop: false,
  curSceen: null,
  gameType: null,
  init: function () {
    this.winSize = vee.Director.getWinSize();
    this.loadBtnPos();
    game.LevelData.initReverseWorldData();
  },
  loadBtnPos: function () {
    this.btnMovePos = this.getPositionFromStr(vee.data.btnpos1);
    this.btnDropPos = this.getPositionFromStr(vee.data.btnpos2);
    this.btnJumpPos = this.getPositionFromStr(vee.data.btnpos3);
  },
  getPositionFromStr: function (arg0) {
    if (!arg0) {
      return null;
    }
    var local0 = arg0.split(",");
    if (local0.length !== 2) {
      return null;
    }
    return cc.p(parseInt(local0[0]), parseInt(local0[1]));
  },
  resetData: function () {
    game.Data.newMoonLevelIdx = -1;
    cc.log("reset data!");
    game.Data.oPlayerCtl = null;
    this.isLastStageAllCoin = false;
    this.resetTempCoin();
    this.itemCoinPool = [];
    this.enemyPool = [];
    this.usingEnemyPool = [];
    this.tmxInfoStack = [];
    this.arrGrabbedPlatform = [];
    this.arrUpdateObj = [];
    this.arrSkillBoxes = [];
    this.playerInvisible = false;
    this.npcmap = {};
    this.jumpCount = 0;
    this.isEnableCameraYOff = true;
    this.deadCount = 0;
    this.playerHawk = false;
    if (this.isResetSkip) {
      Story.isSkip = false;
      Story.handSkip = false;
    } else {
      this.isResetSkip = true;
    }
    ItemCoin.pool = [];
    EfxDust.init();
    EfxSwitch.pool = [];
    EfxGetCoin.pool = [];
    EfxEnemyDie.pool = [];
    EfxBlockBreak.pool = [];
    EfxUFO.pool = [];
    ElePlayer.tempPlayerCtl = null;
    TileData.BlockSinkDataEfxPool = [];
    EleText.Clear();
    this.collectedStarCount = 0;
    this.stageMaxCoin = 0;
    Trigger.cameraYFreezed = false;
    EleText.Clear();
    this.bulletCount = 1;
    this.roleType = game.AvatarData.getCurrentAvatar().type;
    switch (this.roleType) {
      case game.Roles.Cop:
        this.bulletCount = 2;
        break;
      case game.Roles.Girl:
        this.playerLife = 3;
        break;
    }
    this.resetPlayerLife();
  },
  isLastStageAllCoin: false,
  resetEventData: function () {
    game.Data.newMoonLevelIdx = -1;
    game.Data.oPlayerCtl = null;
    this.isLastStageAllCoin = false;
    this.itemCoinPool = [];
    this.enemyPool = [];
    this.usingEnemyPool = [];
    this.tmxInfoStack = [];
    this.arrGrabbedPlatform = [];
    this.arrUpdateObj = [];
    this.arrSkillBoxes = [];
    this.playerInvisible = false;
    this.npcmap = {};
    ItemCoin.pool = [];
    EfxDust.init();
    EfxSwitch.pool = [];
    EfxGetCoin.pool = [];
    EfxEnemyDie.pool = [];
    EfxBlockBreak.pool = [];
    TileData.BlockSinkDataEfxPool = [];
    EleText.Clear();
    if (this.getTempCoin() >= this.stageMaxCoin) {
      this.isLastStageAllCoin = true;
    }
    this.resetTempCoin();
    this.stageMaxCoin = 0;
    EleText.Clear();
    this.bulletCount = 1;
    this.roleType = game.AvatarData.getCurrentAvatar().type;
    switch (this.roleType) {
      case game.Roles.Cop:
        this.bulletCount = 2;
        break;
      case game.Roles.Girl:
        this.playerLife = 3;
        break;
    }
    this.resetPlayerLife();
  },
  resetPlayerLife: function () {
    if (this.roleType === game.Roles.Girl) {
      this.playerLife = 3;
    } else {
      this.playerLife = 2;
    }
  },
  setPlayerType: function (arg0) {
    if (!this.oPlayerCtl) {
      return undefined;
    }
    if (arg0 === game.PlayerType.Normal) {
      switch (this.roleType) {
        case game.Roles.Cop:
          arg0 = game.PlayerType.Bullet;
          break;
        default:
          this.oLyGame.hideBButton();
          break;
      }
    } else if (arg0 !== this.playerType) {
      this.playerType = arg0;
      this.oLyGame.showBButton();
    }
    this.oPlayerCtl._dtCounter = 9999;
    this.playerType = arg0;
    if (game.Data.oPlayerCtl.elf) {
      game.Data.oPlayerCtl.elf.show(true);
    }
    switch (this.playerType) {
      case game.PlayerType.Smash:
      case game.PlayerType.Teleport:
      case game.PlayerType.Bomb:
        this.BButtonCDTime = 1;
        break;
      case game.PlayerType.Bullet:
        this.BButtonCDTime = 0.4;
        break;
    }
    this.oLyGame.refreshBButton(arg0);
    this.refreshSkillBoxes(arg0);
  },
  setPlayerInvisible: function (arg0) {
    this.playerInvisible = arg0;
  },
  changePosFunc: null,
  onPlayerChangePos: function (arg0) {
    if (this.changePosFunc) {
      this.changePosFunc(arg0);
    }
  },
  gridChangeFunc: null,
  onPlayerGridChange: function (arg0) {
    if (this.gridChangeFunc) {
      this.gridChangeFunc(arg0);
    }
    if (this.npcmap && !Story.isShowStory && !Cinema.isCinema) {
      var local1 = game.Data.oPlayerCtl._container.getPosition();
      for (var local2 in this.npcmap) {
        var local3 = this.npcmap[local2];
        if (local3) {
          var local0 = local3._container.getPosition();
          if (local0.x > local1.x) {
            local3.setFaceTo(vee.Direction.Left);
          } else {
            local3.setFaceTo(vee.Direction.Right);
          }
        }
      }
    }
  },
  costLife: function (arg0) {
    if (!arg0) {
      arg0 = 1;
    }
    this.oLvCtl.onUpdateLife(-arg0);
    this.playerLife = this.playerLife - arg0;
    this.oLyGame.refreshHeart();
    if (this.playerLife <= 0) {
      if (this.isFreeGame && this.deadCount < 1 && vee.Ad.checkCacheVideoAd() && game.Logic._deadZoneRevivalCount > 0) {
        this.deadCount = this.deadCount + 1;
        game.Logic._deadZoneRevivalCount = game.Logic._deadZoneRevivalCount - 1;
        ccbRevivalVideoAlert.show(ccbRevivalVideoAlert.revivalType.NORMAL);
        cc.log("zq debug cost life revival video pop========111111");
      } else {
        this.gameOver();
        cc.log("zq debug cost life revival video pop========222222");
      }
      return false;
    }
    if (game.Data.checkIs61() && this.playerLife === 1 && !game.Data.playerHawk) {
      ElePlayer.transformTo(game.RoleNameStrData.SmallFox);
      ElePlayer.efxMarioShrink();
    }
    return true;
  },
  playOverGid: {},
  gameOver: function () {
    this.playOverGid = cc.p(this.oPlayerCtl._grid.x, this.oPlayerCtl._grid.y);
    vee.Utils.unscheduleAllCallbacksForTarget(game.Data);
    vee.Audio.playEffect(res.inGame_event_deathNoLife_mp3);
    game.Data.oLyGame.gameSlow();
    game.Data.oLyGame._isOver = true;
    this.stageFinish(game.FinishType.DEAD);
    this.oPlayerCtl.elf.hide();
    this.oPlayerCtl._isOver = true;
    this.playerLife = 0;
    this.gameFail();
    this.oPlayerCtl._container.runAction(cc.sequence(cc.delayTime(0.4), cc.callFunc(function () {
      this.oLyGame.gameOver();
      this.oPlayerCtl.gameOver();
      this.oPlayerCtl._container.stopAllActions();
      this.oPlayerCtl.rootNode.setVisible(false);
      EfxPlayerDie.show(this.oPlayerCtl.getElePosition(), function () {
        if (game.Data.stageType === game.StageType.Mini) {
          vee.GameModule.SceneMgr.openOver();
        } else {
          vee.Transition.out(res.MapTransition_ccbi, function () {
            vee.GameModule.SceneMgr.openOver();
          });
        }
      });
    }.bind(this))));
  },
  gameFail: function () {
    if (game.LevelData.selectedLevel) {
      game.LevelData.selectedLevel.levelFail(this.oPlayerCtl._grid);
    }
  },
  addLife: function (arg0) {
    if (!arg0) {
      arg0 = 1;
    }
    this.oLvCtl.onUpdateLife(arg0);
    if (game.Data.checkIs61() && this.playerLife === 1 && !game.Data.playerHawk) {
      ElePlayer.transformTo(game.RoleNameStrData.Fox);
      ElePlayer.efxMarioGrow();
    }
    this.playerLife = this.playerLife + arg0;
    if (this.playerLife > this.playerMaxLife) {
      this.playerLife = this.playerMaxLife;
    }
    this.oLyGame.refreshHeart();
  },
  addLifeTo: function (arg0) {
    this.playerLife = arg0;
    this.oLyGame.refreshHeart();
  },
  addTMXInfo: function (arg0, arg1, arg2, arg3) {
    this.tmxInfoStack.push({
      tmxFileName: arg0,
      playerGrid: arg1,
      objMap: arg2,
      triggerMap: arg3
    });
  },
  getTMXInfoByName: function (arg0) {
    for (var local0 = 0; local0 < this.tmxInfoStack.length; local0++) {
      var local1 = this.tmxInfoStack[local0];
      if (local1.tmxFileName === arg0) {
        return {
          idx: local0,
          info: local1
        };
      }
    }
    return null;
  },
  getEnemyFromPool: function (arg0) {
    var local0 = this.enemyPool.length;
    for (var local1 = 0; local1 < local0; local1++) {
      var local2 = this.enemyPool[local1];
      if (local2.objType === arg0) {
        local2.rootNode.setVisible(true);
        this.enemyPool.splice(local1, 1);
        return local2.rootNode;
      }
    }
    return null;
  },
  removeUsingEnemy: function (arg0) {
    for (var local0 = 0, local1 = this.usingEnemyPool.length; local0 < local1; local0++) {
      var local2 = this.usingEnemyPool[local0];
      if (local2 === arg0) {
        this.usingEnemyPool.splice(local0, 1);
      }
    }
  },
  registerUpdateObj: function (arg0) {
    this.arrUpdateObj.push(arg0);
  },
  removeUpdateObj: function (arg0) {
    for (var local0 = 0, local1 = this.arrUpdateObj.length; local0 < local1; local0++) {
      var local2 = this.arrUpdateObj[local0];
      if (local2 === arg0) {
        this.arrUpdateObj.splice(local0, 1);
      }
    }
  },
  addGrabbedPlatform: function (arg0) {
    this.arrGrabbedPlatform.push(arg0);
  },
  removeGrabbedPlatform: function (arg0) {
    for (var local0 = 0, local1 = this.arrGrabbedPlatform.length; local0 < local1; local0++) {
      var local2 = this.arrGrabbedPlatform[local0];
      if (local2 === arg0) {
        this.arrGrabbedPlatform.splice(local0, 1);
      }
    }
  },
  detachAllGrabbedPlatform: function () {
    var local0 = this.arrGrabbedPlatform.length;
    for (var local1 = 0; local1 < local0; local1++) {
      var local2 = this.arrGrabbedPlatform[local1];
      if (local2) {
        local2._isGetPlayer = false;
      }
    }
  },
  getPointFromString: function (arg0) {
    var local0 = arg0.split(",");
    if (local0.length === 2) {
      return cc.p(parseInt(local0[0]), parseInt(local0[1]));
    }
    return null;
  },
  getPointFromString1: function (arg0) {
    arg0 = arg0.substring(1, arg0.length - 1);
    var local0 = arg0.split(",");
    if (local0.length === 2) {
      return cc.p(parseInt(local0[0]), parseInt(local0[1]));
    }
    return null;
  },
  addPerformingSkillBoxes: function (arg0, arg1) {
    var local0 = arg1.getTileGIDAt(arg0);
    if (local0 >= 137 && local0 <= 140) {
      game.Data.arrSkillBoxes.push({
        gid: local0,
        grid: cc.p(arg0.x, arg0.y),
        layer: arg1
      });
    }
  },
  refreshSkillBoxes: function (arg0) {
    var local0 = this.arrSkillBoxes.length;
    var local1 = this.playerType2gid(arg0);
    cc.log("playerTypeGid = " + local1);
    for (var local2 = 0; local2 < local0; local2++) {
      var local3 = this.arrSkillBoxes[local2];
      var local4 = local3.layer.getTileGIDAt(local3.grid);
      cc.log("gid = " + local4);
      if (local4 === local1) {
        local3.layer.setTileGID(game.BlockType.BreakableBlock, local3.grid);
      }
    }
  },
  playerType2gid: function (arg0) {
    switch (arg0) {
      case game.PlayerType.Smash:
        return game.BlockType.SkillSmash;
      case game.PlayerType.Teleport:
        return game.BlockType.SkillTeleport;
      case game.PlayerType.Bullet:
        return game.BlockType.SkillBullet;
      case game.PlayerType.Bomb:
        return game.BlockType.SkillBomb;
    }
  },
  changeAvatar: function (arg0) {
    if (this.oLyGameOver) {
      this.oLyGameOver.changeAvatar(arg0);
    }
    BtnShop.refreshHead();
    LyAvatarStore.refreshState();
  },
  stageFinish: function (arg0) {
    vee.Audio.stopMusic();
    if (!game.LevelData.selectedCategory || !game.LevelData.selectedLevel) {
      return undefined;
    }
    var local0 = game.LevelData.selectedCategory.idx + 1;
    var local1 = game.LevelData.selectedLevel.idx + 1;
    var local2 = "";
    if (this.stageType === game.StageType.Mini) {
      local2 = "Mini";
    } else if (this.stageType === game.StageType.Event) {
      local2 = "Event";
    }
    switch (arg0) {
      case game.FinishType.DEAD:
        this.playerDeadGrid = cc.p(this.oPlayerCtl._grid.x, this.oPlayerCtl._grid.y);
        vee.Analytics.logEvent("GameOver" + local2 + local0 + "0" + local1, {
          gridx: "" + this.playerDeadGrid.x,
          gridy: "" + this.playerDeadGrid.y
        });
        break;
    }
  },
  getSavePointIdx: function () {
    return vee.dataManager.getSavePointIdx();
  },
  setSavePointIdx: function (arg0) {
    vee.dataManager.setSavePointIdx(("" + arg0));
  },
  resetTempCoin: function () {
    vee.dataManager.setTpCoin(0);
  },
  getTempCoin: function () {
    return vee.dataManager.getTpCoin();
  },
  addTempCoin: function (arg0) {
    if (!arg0) {
      arg0 = 1;
    }
    vee.dataManager.setTpCoin(vee.dataManager.getTpCoin() + arg0);
    if (this.oLyGame) {
      this.oLyGame.refreshCoin();
    }
  },
  setSelectedLvIdx: function (arg0) {
    vee.dataManager.setSelectLvIdx(arg0);
  },
  getSelectedLvIdx: function () {
    return vee.dataManager.getSelectLvIdx();
  },
  getEnergy: function () {
    var local0 = parseInt(vee.dataManager.getEnergy());
    if (!local0 && local0 !== 0) {
      this.fillEnergy();
      local0 = 5;
    }
    if (local0 < 5) {
      var local1 = this.getEnergyReviveTs();
      var local2 = new Date().getTime();
      var local3 = local2 - local1;
      if (local3 > 0) {
        var local4 = 1 + Math.floor(local3 / this.energyReviveDelay);
        this.addEnergy(local4);
        local0 = parseInt(vee.dataManager.getEnergy());
        if (local0 < 5) {
          vee.dataManager.setEnergyTs(this.nextEnergyTsFromNow());
        }
      }
    }
    return local0;
  },
  onEnergyEmpty: function (arg0) {
    if (game.Data.getPower() > 0) {
      AlertUsePower.show(arg0);
    } else {
      AlertGetPower.show(arg0);
    }
  },
  getPower: function () {
    return parseInt(vee.dataManager.getPower());
  },
  getPowerLeftTime: function () {
    var local0 = vee.Utils.getTimeNow();
    var local1 = vee.dataManager.getPowerTs();
    var local2 = game.Data.energyUnlimitedTime * 60 - (local0 - local1) / 1000;
    return local2 > 0 ? local2 : 0;
  },
  getLevel61LeftTime: function () {
    var local0 = vee.Utils.getTimeNow();
    var local1 = vee.data.level61_ts;
    var local2 = game.Data.level61Time * 60 - (local0 - local1) / 1000;
    return local2 > 0 ? local2 : 0;
  },
  addEnergy: function (arg0) {
    if (!arg0) {
      arg0 = 1;
    }
    var local0 = parseInt(vee.dataManager.getEnergy());
    if (local0 >= 5) {
      return undefined;
    }
    var local1 = local0 + arg0 > 5 ? 5 : local0 + arg0;
    vee.dataManager.setEnergy(local1);
  },
  fillEnergy: function () {
    vee.dataManager.setEnergy(5);
  },
  energyUnlimited: function (arg0) {
    var local0 = new Date().getTime();
    vee.data.ultE_ts = local0;
    vee.data.ultEitv = ((arg0 * 60) * 1000);
    vee.saveData();
  },
  isEnergyUnlimited: function () {
    if (this.isAndroidTV_test) {
      return true;
    }
    var local0 = new Date().getTime();
    var local1 = parseInt(vee.data.ultE_ts);
    var local2 = parseInt(vee.data.ultEitv);
    if (local0 - local2 < local1) {
      return true;
    }
    return false;
  },
  costEnergy: function () {
    var local0 = parseInt(vee.dataManager.getEnergy());
    if (game.Data.isEnergyUnlimited() || !game.Data.isFreeGame) {
      return true;
    }
    if (local0 < 1) {
      return false;
    }
    if (local0 === 5) {
      vee.dataManager.setEnergyTs(this.nextEnergyTsFromNow());
    }
    if (this.oEnergyCtl) {
      this.oEnergyCtl.costAnimate();
    }
    vee.dataManager.setEnergy(local0 - 1);
    return true;
  },
  nextEnergyTsFromNow: function () {
    var local0 = new Date().getTime();
    return (local0 + this.energyReviveDelay);
  },
  getEnergyReviveTs: function () {
    return vee.dataManager.getEnergyTs();
  },
  getMiniCount: function () {
    if (game.LevelData.selectedCategory && game.LevelData.selectedCategory.idx > 0) {
      var local0 = parseInt(vee.data.mini);
      if (!local0 && local0 !== 0) {
        local0 = 0;
        vee.saveData();
      }
      return local0;
    }
    return 0;
  },
  addMiniCount: function (arg0) {
    if (game.LevelData.selectedCategory && game.LevelData.selectedCategory.idx > 0) {
      if (game.Data.stageType === game.StageType.Mini) {
        return undefined;
      }
      if (!arg0) {
        arg0 = 1;
      }
      var local0 = this.getMiniCount();
      vee.data.mini = local0 + parseInt(arg0);
      vee.saveData();
    }
  },
  resetMiniCount: function () {
    vee.data.mini = 0;
    vee.saveData();
  },
  getEventCount: function () {
    var local0 = parseInt(vee.data.event);
    if (!local0 && local0 !== 0) {
      local0 = 0;
      vee.saveData();
    }
    return local0;
  },
  addEventCount: function (arg0) {
    if (!arg0) {
      arg0 = 1;
    }
    var local0 = this.getEventCount();
    vee.data.event = local0 + parseInt(arg0);
    vee.saveData();
  },
  resetEventCount: function () {
    vee.data.event = 0;
    vee.saveData();
  },
  setUnlocking: function (arg0) {
    vee.data.ulk = arg0;
    vee.saveData();
    this.resetEventCount();
  },
  isUnlocking: function () {
    if (vee.data.ulk) {
      return true;
    }
    return false;
  },
  addPlayCount: function () {
    var local0 = this.getPlayCount();
    vee.data.pc = parseInt(local0) + 1;
    vee.saveData();
  },
  isRated: function () {
    return vee.data.rated;
  },
  rated: function () {
    vee.data.rated = true;
    vee.saveData();
  },
  getPlayCount: function () {
    var local0 = parseInt(vee.data.pc);
    if (!local0 && local0 !== 0) {
      local0 = 0;
      vee.saveData();
    }
    return local0;
  },
  resetPlayCount: function () {
    vee.data.pc = 0;
    vee.saveData();
  },
  getTotalPlayCount: function () {
    var local0 = parseInt(vee.data.tpc);
    if (!local0 && local0 !== 0) {
      local0 = 0;
      vee.saveData();
    }
    return local0;
  },
  addTotalPlayCount: function () {
    var local0 = this.getTotalPlayCount();
    vee.data.tpc = parseInt(local0) + 1;
    vee.saveData();
    cc.log("zq debug playCount=====%d", vee.data.tpc);
    vee.Analytics.UGameEvent.registerSuperProperty("super_playCount", vee.data.tpc);
  },
  playCountThisGame: 0,
  banAdThisGame: false,
  showBanAd: function () {
    if (vee.data.stad && vee.data.tenStage && (this.playCountThisGame === 0 || this.playCountThisGame >= 5) && !this.banAdThisGame) {
      LyReward.show(LyReward.Type.BanAd);
    }
  },
  getAdConfigBy: function (arg0) {
    if (arg0 === game.AdType.GameStart) {
      var local0 = game.Data.getTotalPlayCount();
      if (local0 % 2 === 0) {
        arg0 = "Even";
      } else {
        arg0 = "Odd";
      }
    }
    return {
      AppGoogleInterstialId: app.Config["Ad" + arg0]
    };
  },
  isStaticBG: function () {
    return vee.data.staticBG;
  },
  setStaticBG: function (arg0) {
    vee.data.staticBG = arg0;
    vee.saveData();
  },
  isGestureControl: function () {
    return vee.data.gesture;
  },
  setGestureControl: function (arg0) {
    vee.data.gesture = arg0;
    vee.saveData();
  },
  isSmallButton: function () {
    return vee.data.small;
  },
  setSmallButton: function (arg0) {
    vee.data.small = arg0;
    vee.saveData();
  },
  isNewReverseWorld: false,
  isShowBtnWorld: function () {
    return vee.data.show_btn_world;
  },
  checkShowBtnWorld: function () {
    var local0 = vee.data.show_btn_world;
    if (!local0) {
      var local1 = game.AvatarData.getAvatarData(1);
      if ((this.isUnlocking() || local1.owned) && this.isReverseWorldOpen) {
        this.isNewReverseWorld = true;
        vee.data.show_btn_world = true;
        vee.saveData();
      }
    }
  },
  checkIs61: function () {
    if (game.LevelData.selectedCategory) {
      var local0 = game.LevelData.selectedCategory.idx + 1;
      if (local0 === 7) {
        return true;
      }
    }
    return false;
  },
  checkIsMidAutumn: function () {
    if (game.Data.version.isMidAutumn && game.LevelData.selectedCategory) {
      var local0 = game.LevelData.selectedCategory.idx + 1;
      if (local0 === 8) {
        return true;
      }
    }
    return false;
  },
  checkIsHolloween: function () {
    if (game.Data.version.isSetShowSpecialEvent && game.LevelData.selectedCategory) {
      var local0 = game.LevelData.selectedCategory.idx + 1;
      if (local0 === 9) {
        return true;
      }
    }
    return false;
  },
  checkIsThanksgiving: function () {
    if (game.Data.version.isSetShowSpecialEvent && game.LevelData.selectedCategory) {
      var local0 = game.LevelData.selectedCategory.idx + 1;
      if (local0 === 10) {
        return true;
      }
    }
    return false;
  },
  isTipsPurchased: function (arg0) {
    return vee.data["buy" + arg0 + "tips"];
  },
  purchaseTip: function (arg0) {
    vee.data["buy" + arg0 + "tips"] = true;
    vee.saveData();
  },
  getStoryHasPlayed: function (arg0, arg1) {
    var local0 = this.getStageTypeString(game.Data.stageType);
    var local1 = vee.data[local0 + "story" + arg0 + "-" + arg1];
    return local1;
  },
  setStoryHasPlayed: function (arg0, arg1, arg2) {
    var local0 = this.getStageTypeString(game.Data.stageType);
    vee.data[local0 + "story" + arg0 + "-" + arg1] = arg2;
    vee.saveData();
  },
  getStageTypeString: function (arg0) {
    switch (arg0) {
      case game.StageType.Event:
        return "Event";
      case game.StageType.Mini:
        return "Mini";
      default:
        return "";
    }
  },
  isInParkour: function () {
    return (this.stageType === game.StageType.Parkour);
  },
  isUnlockMoon: function () {
  }
};
game.AdType = {
  Odd: "Odd",
  Even: "Even",
  Pause: "Pause",
  GameOver: "GameOver",
  StartUp: "StartUp",
  Exit: "Exit",
  GameStart: 1
};
game.PlayerType = {
  Normal: 1,
  Bullet: 2,
  Smash: 3,
  Teleport: 4,
  Bomb: 5,
  Hawk: 6,
  Mine: 7
};
game.StageType = {
  Normal: 1,
  Mini: 2,
  Event: 3,
  Parkour: 4
};
game.Roles = {
  Cat: 1,
  Normal: 2,
  Kevo: 3,
  Flash: 4,
  Cop: 5,
  Space: 6,
  Girl: 7,
  Vampire: 8,
  Marvin: 9,
  bear: 10,
  Tiny: 11,
  MaNtIs: 12,
  Android: 13,
  Fox: 14,
  Robbit: 15,
  Holloween: 16,
  Blast: 17
};
game.RoleNameStrData = {
  cat: res.elePlayer_Zhai_ccbi,
  Kevo: res.hero_kevo_ccbi,
  Flash: res.hero_davinci_ccbi,
  Cop: res.hero_cap_ccbi,
  Spaceman: res.hero_nasa_ccbi,
  Hermione: res.hero_girl_ccbi,
  Vampire: res.hero_dracula_ccbi,
  "M-42": res.hero_marvin_ccbi,
  Bear: res.hero_beer_ccbi,
  Tiny: res.hero_ji_ccbi,
  Phantom: res.hero_blackcat_ccbi,
  SmallCat: res.hero_smallcat_ccbi,
  MaNtIs: res.hero_m_ccbi,
  Android: res.hero_android_ccbi,
  SmallFox: res.hero_smallfox_ccbi,
  Fox: res.hero_fox_ccbi
};
game.RoleNameStrDataRevert = {
  "res/elePlayer_Zhai.ccbi": "cat",
  "res/hero_kevo.ccbi": "Kevo",
  "res/hero_davinci.ccbi": "Flash",
  "res/hero_cap.ccbi": "Cop",
  "res/hero_nasa.ccbi": "Spaceman",
  "res/hero_girl.ccbi": "Hermione",
  "res/hero_dracula.ccbi": "Vampire",
  "res/hero_marvin.ccbi": "M-42",
  "res/hero_beer.ccbi": "Bear",
  "res/hero_ji.ccbi": "Tiny",
  "res/hero_blackcat.ccbi": "Phantom",
  "res/hero_smallcat.ccbi": "SmallCat",
  "res/hero_m.ccbi": "MaNtIs",
  "res/hero_android.ccbi": "Android"
};
game.RoleSoundData = {
  cat: {
    soundFileCharacterName: "",
    soundIdxRange: 2
  },
  Kevo: {
    soundFileCharacterName: "kevo",
    soundIdxRange: 2
  },
  Flash: {
    soundFileCharacterName: "flashEyes",
    soundIdxRange: 2
  },
  Cop: {
    soundFileCharacterName: "cop",
    soundIdxRange: 2
  },
  Spaceman: {
    soundFileCharacterName: "spaceman",
    soundIdxRange: 2
  },
  Hermione: {
    soundFileCharacterName: "hermione",
    soundIdxRange: 2
  },
  Vampire: {
    soundFileCharacterName: "vampire",
    soundIdxRange: 2
  },
  "M-42": {
    soundFileCharacterName: "m-42",
    soundIdxRange: 2
  },
  Bear: {
    soundFileCharacterName: "fearBear",
    soundIdxRange: 2
  },
  Tiny: {
    soundFileCharacterName: "tiny",
    soundIdxRange: 3
  },
  Phantom: {
    soundFileCharacterName: "phantom",
    soundIdxRange: 2
  },
  SmallCat: {
    soundFileCharacterName: "smallCat",
    soundIdxRange: 2
  },
  MaNtIs: {
    soundFileCharacterName: "mantis",
    soundIdxRange: 2
  },
  Android: {
    soundFileCharacterName: "android",
    soundIdxRange: 2
  }
};
game.LayerType = {
  Main: 1,
  Extra: 2
};
game.SecretLayerStatus = {
  Hide: 0,
  Show: 1
};
game.EleType = {
  Player: 0,
  Enemy: 1,
  Item: 2,
  Trigger: 3
};
game.FinishType = {
  WIN: 1,
  DEAD: 2,
  QUIT: 3
};
game.LifeEmptyType = {
  Select: 0,
  Lose: 1
};
game.ObjectType = {
  None: -1,
  Slime: 0,
  DogSlime: 1,
  Cannon: 2,
  Susliks: 3,
  Spider: 4,
  Moth: 5,
  ArmorSlime: 6,
  ArmorSlimeHawk: 7,
  SusliksHawk: 8,
  Bee: 9,
  FastBee: 10,
  JumpSlime: 11,
  JumpSlimeLink: 12,
  Fish: 13,
  Flight: 14,
  MadBee: 15,
  DrillDog: 16,
  MapEater: 17,
  JumpFrog: 18,
  Coin: 100,
  Egg: 101,
  Heart: 102,
  Accelerater: 103,
  BigCoin: 104,
  DynamicBlock: 105,
  MovingPlatform: 106,
  GravityPlatform: 107,
  FallingBlock: 108,
  Fire: 112,
  BoxSmash: 113,
  BoxBullet: 114,
  BoxTeleport: 115,
  BoxBomb: 116,
  Drawer: 117,
  Bullet: 118,
  SavePoint: 119,
  StageEnd: 120,
  SkillSmash: 121,
  SkillBullet: 122,
  SkillTeleport: 123,
  SkillBomb: 124,
  BoxHawk: 125,
  ReverseKey: 126,
  ScaleBlock: 130,
  Block: 1000,
  BlockOneWay: 1001,
  Slope: 1002,
  BlockHide: 1003,
  BlockStab: 1004,
  BlockHurt: 1005,
  BlockBounce: 1006,
  BlockBomb: 1007,
  BlockBreakable: 1008,
  BlockSwitchOn: 1009,
  BlockSwitchOff: 1010,
  BlockSwitchDisable: 1011,
  BlockSink: 1012,
  BlockTrap: 1013,
  BlockScale: 1019,
  NPC: 2000
};
game.enemyStringMap = {
  slime: game.ObjectType.Slime,
  dogSlime: game.ObjectType.DogSlime,
  carrot: game.ObjectType.Cannon,
  spider: game.ObjectType.Spider,
  moth: game.ObjectType.Moth,
  armorSlime: game.ObjectType.ArmorSlime,
  armorSlimeHawk: game.ObjectType.armorSlimeHawk,
  susliksHawk: game.ObjectType.SusliksHawk,
  Bees: game.ObjectType.Bee,
  fastBee: game.ObjectType.FastBee,
  fish: game.ObjectType.Fish,
  jumpSlime: game.ObjectType.JumpSlime,
  flight: game.ObjectType.Flight,
  madbee: game.ObjectType.MadBee,
  frog: game.ObjectType.JumpFrog
};
game.itemStringMap = {
  coin: game.ObjectType.Coin,
  egg: game.ObjectType.Egg,
  heart: game.ObjectType.Heart,
  key: game.ObjectType.ReverseKey,
  boxSmash: game.ObjectType.BoxSmash,
  boxBullet: game.ObjectType.BoxBullet,
  boxTeleport: game.ObjectType.BoxTeleport,
  boxBomb: game.ObjectType.BoxBomb
};
game.BlockType = {
  HideBlock: 10,
  DynamicBlock: 61,
  BreakableBlock: 66,
  SwitchShow: 108,
  SwitchHide: 109,
  SwitchDisable: 110,
  BounceBlock: 65,
  BombBlock: 79,
  QuestionBlock: 62,
  Coin: 81,
  MovingPlatform: 74,
  FallingPlatform: 75,
  GravityPlatform: 76,
  SkillSmash: 137,
  SkillBullet: 138,
  SkillTeleport: 139,
  SkillBomb: 140,
  MoonBlock: 107
};
// unsupported main opcode at 012F9: sub
// unsupported main opcode at 01310: sub
// unsupported main opcode at 0137F: sub
// unsupported main opcode at 01396: sub
// unsupported main opcode at 015EB: add
// unsupported main opcode at 01785: add
game.TileInfo = {
  type: game.ObjectType.Slope,
  GID: 44,
  isVertical: false,
  orientation: vee.Direction.Top,
  edgeTop: 0,
  edgeBottom: 0,
  edgeLeft: game.Data.tileSizeWidthHalf,
  edgeRight: 0,
  slope: -0.5,
  speedScale: 0.85,
  TileDownSlopeRightToHalf: {
    type: game.ObjectType.Slope,
    GID: 56,
    isVertical: false,
    orientation: vee.Direction.Right,
    edgeTop: game.Data.tileSizeWidthHalf,
    edgeBottom: game.Data.tileSizeWidth,
    edgeLeft: 0,
    edgeRight: 0,
    slope: -2,
    speedScale: 0.5
  },
  TileDownSlopeRightToZero: {
    type: game.ObjectType.Slope,
    GID: 56,
    isVertical: false,
    orientation: vee.Direction.Right,
    edgeTop: 0,
    edgeBottom: game.Data.tileSizeWidthHalf,
    edgeLeft: 0,
    edgeRight: 0,
    slope: -2,
    speedScale: 0.5
  },
  TileBlockBounce: {
    type: game.ObjectType.BlockBounce,
    GID: 10,
    isVertical: false,
    orientation: vee.Direction.Top,
    edgeTop: 0,
    edgeBottom: 0,
    edgeLeft: TILE_WIDTH,
    edgeRight: TILE_WIDTH,
    slope: 0,
    speedScale: 1
  },
  TileBlockFade: {
    type: game.ObjectType.Block,
    GID: 10,
    isVertical: false,
    orientation: vee.Direction.Top,
    edgeTop: 0,
    edgeBottom: 0,
    edgeLeft: game.Data.tileSizeWidth,
    edgeRight: game.Data.tileSizeWidth,
    slope: 0,
    speedScale: 1
  },
  TileBlockBomb: {
    type: game.ObjectType.BlockBomb,
    GID: 10,
    isVertical: false,
    orientation: vee.Direction.Top,
    edgeTop: 0,
    edgeBottom: 0,
    edgeLeft: game.Data.tileSizeWidth,
    edgeRight: game.Data.tileSizeWidth,
    slope: 0,
    speedScale: 1
  },
  TileBlockBreakable: {
    type: game.ObjectType.BlockBreakable,
    GID: 10,
    isVertical: false,
    orientation: vee.Direction.Top,
    edgeTop: 0,
    edgeBottom: 0,
    edgeLeft: game.Data.tileSizeWidth,
    edgeRight: game.Data.tileSizeWidth,
    slope: 0,
    speedScale: 1
  },
  TileBlockSwitchOn: {
    type: game.ObjectType.BlockSwitchOn,
    GID: 10,
    isVertical: false,
    orientation: vee.Direction.Top,
    edgeTop: 0,
    edgeBottom: 0,
    edgeLeft: game.Data.tileSizeWidth,
    edgeRight: game.Data.tileSizeWidth,
    slope: 0,
    speedScale: 1
  },
  TileBlockSwitchOff: {
    type: game.ObjectType.BlockSwitchOff,
    GID: 10,
    isVertical: false,
    orientation: vee.Direction.Top,
    edgeTop: 0,
    edgeBottom: 0,
    edgeLeft: game.Data.tileSizeWidth,
    edgeRight: game.Data.tileSizeWidth,
    slope: 0,
    speedScale: 1
  },
  TileBlockSwitchDisable: {
    type: game.ObjectType.BlockSwitchDisable,
    GID: 10,
    isVertical: false,
    orientation: vee.Direction.Top,
    edgeTop: 0,
    edgeBottom: 0,
    edgeLeft: game.Data.tileSizeWidth,
    edgeRight: game.Data.tileSizeWidth,
    slope: 0,
    speedScale: 1
  },
  TileBlockSink: {
    type: game.ObjectType.BlockSink,
    GID: 10,
    isVertical: false,
    orientation: vee.Direction.Top,
    edgeTop: 0,
    edgeBottom: 0,
    edgeLeft: game.Data.tileSizeWidth,
    edgeRight: game.Data.tileSizeWidth,
    slope: 0,
    speedScale: 1
  },
  TileBlockTrap: {
    type: game.ObjectType.BlockTrap,
    GID: 10,
    isVertical: false,
    orientation: vee.Direction.Top,
    edgeTop: 0,
    edgeBottom: 0,
    edgeLeft: game.Data.tileSizeWidth,
    edgeRight: game.Data.tileSizeWidth,
    slope: 0,
    speedScale: 1
  },
  TileBlockScale: {
    type: game.ObjectType.BlockScale,
    edgeTop: 0,
    edgeBottom: 0,
    edgeLeft: game.Data.tileSizeWidth,
    edgeRight: game.Data.tileSizeWidth,
    slope: 0,
    speedScale: 1
  },
  TileHorizonBounce: {
    type: game.ObjectType.Block,
    edgeTop: 0,
    edgeBottom: 0,
    edgeLeft: game.Data.tileSizeWidth,
    edgeRight: game.Data.tileSizeWidth,
    slope: 0,
    speedScale: 1
  },
  TileEnemySlime: {
    type: game.ObjectType.Slime,
    faceDir: vee.Direction.Left
  },
  TileEnemyDogSlime: {
    type: game.ObjectType.DogSlime,
    faceDir: vee.Direction.Left
  },
  TileEnemyCannon: {
    type: game.ObjectType.Cannon,
    faceDir: vee.Direction.Left
  },
  TileEnemySpider: {
    type: game.ObjectType.Spider,
    faceDir: vee.Direction.Left
  },
  TileEnemyArmorSlime: {
    type: game.ObjectType.ArmorSlime,
    faceDir: vee.Direction.Left
  },
  TileEnemyArmorSlimeHawk: {
    type: game.ObjectType.ArmorSlimeHawk,
    faceDir: vee.Direction.Left
  },
  TileEnemySusliksHawk: {
    type: game.ObjectType.SusliksHawk,
    faceDir: vee.Direction.Left
  },
  TileEnemyJumpSlime: {
    type: game.ObjectType.JumpSlime,
    faceDir: vee.Direction.Left
  },
  TileEnemyMoth: {
    type: game.ObjectType.Moth,
    faceDir: vee.Direction.Left
  },
  TileEnemyBee: {
    type: game.ObjectType.Bee,
    faceDir: vee.Direction.Left
  },
  TileEnemyFastBee: {
    type: game.ObjectType.FastBee,
    faceDir: vee.Direction.Left
  },
  TileEnemyFish: {
    type: game.ObjectType.Fish,
    faceDir: vee.Direction.Left
  },
  TileEnemyFlight: {
    type: game.ObjectType.Flight,
    faceDir: vee.Direction.Left
  },
  TileEnemyMadBee: {
    type: game.ObjectType.MadBee,
    faceDir: vee.Direction.Left
  },
  TileEnemyDrillDog: {
    type: game.ObjectType.DrillDog,
    faceDir: vee.Direction.Left
  },
  TileEnemyJumpFrog: {
    type: game.ObjectType.JumpFrog,
    faceDir: vee.Direction.Left
  },
  TileEnemyMapEater: {
    type: game.ObjectType.MapEater,
    faceDir: vee.Direction.Left
  },
  TileItemCoin: {
    type: game.ObjectType.Coin
  },
  TileItemBigCoin: {
    type: game.ObjectType.BigCoin
  },
  TileItemEgg: {
    type: game.ObjectType.Egg
  },
  TileItemHeart: {
    type: game.ObjectType.Heart
  },
  TileItemAccelerater: {
    type: game.ObjectType.Accelerater
  },
  TileItemMovingPlatform: {
    type: game.ObjectType.MovingPlatform
  },
  TileItemGravityPlatform: {
    type: game.ObjectType.GravityPlatform
  },
  TileItemFallingBlock: {
    type: game.ObjectType.FallingBlock
  },
  TileItemFire: {
    type: game.ObjectType.Fire
  },
  TileItemBoxSmash: {
    type: game.ObjectType.BoxSmash
  },
  TileItemBoxBullet: {
    type: game.ObjectType.BoxBullet
  },
  TileItemBoxTeleport: {
    type: game.ObjectType.BoxTeleport
  },
  TileItemBoxBomb: {
    type: game.ObjectType.BoxBomb
  },
  TileItemBoxHawk: {
    type: game.ObjectType.BoxHawk
  },
  TileItemDrawer: {
    type: game.ObjectType.Drawer
  },
  TileItemReverseKey: {
    type: game.ObjectType.ReverseKey
  },
  TileItemSavePoint: {
    type: game.ObjectType.SavePoint
  },
  TileItemStageEnd: {
    type: game.ObjectType.StageEnd
  },
  TileItemScaleBlock: {
    type: game.ObjectType.ScaleBlock
  },
  TileNPC: {
    type: game.ObjectType.NPC
  }
};
// The decompiler dropped several early TileInfo initprops. Without these
// aliases, map GIDs 1-20 resolve to undefined tile data and the level stalls.
game.TileInfo.TileBlock = game.TileInfo.TileBlock || {
  type: game.ObjectType.Block,
  GID: 10,
  isVertical: false,
  orientation: vee.Direction.Top,
  edgeTop: 0,
  edgeBottom: 0,
  edgeLeft: game.Data.tileSizeWidth,
  edgeRight: game.Data.tileSizeWidth,
  slope: 0,
  speedScale: 1
};
game.TileInfo.TileBlockHide = game.TileInfo.TileBlockHide || {
  type: game.ObjectType.BlockHide,
  GID: 10,
  isVertical: false,
  orientation: vee.Direction.Top,
  edgeTop: 0,
  edgeBottom: 0,
  edgeLeft: game.Data.tileSizeWidth,
  edgeRight: game.Data.tileSizeWidth,
  slope: 0,
  speedScale: 1
};
game.TileInfo.TileBlockHurt = game.TileInfo.TileBlockHurt || {
  type: game.ObjectType.BlockHurt,
  GID: 10,
  isVertical: false,
  orientation: vee.Direction.Top,
  edgeTop: 0,
  edgeBottom: 0,
  edgeLeft: game.Data.tileSizeWidth,
  edgeRight: game.Data.tileSizeWidth,
  slope: 0,
  speedScale: 1
};
game.TileInfo.TileBlockHurtHalf = game.TileInfo.TileBlockHurtHalf || {
  type: game.ObjectType.BlockHurt,
  GID: 10,
  isVertical: false,
  orientation: vee.Direction.Top,
  edgeTop: 0,
  edgeBottom: 0,
  edgeLeft: TILE_WIDTH_HALF,
  edgeRight: TILE_WIDTH_HALF,
  slope: 0,
  speedScale: 1
};
game.TileInfo.TileBlockHalf = game.TileInfo.TileBlockHalf || {
  type: game.ObjectType.BlockStab,
  GID: 10,
  isVertical: false,
  orientation: vee.Direction.Top,
  edgeTop: 0,
  edgeBottom: 0,
  edgeLeft: game.Data.tileSizeWidthHalf - 4,
  edgeRight: game.Data.tileSizeWidthHalf - 4,
  slope: 0,
  speedScale: 1
};
game.TileInfo.TileBlockTopHalf = game.TileInfo.TileBlockTopHalf || {
  type: game.ObjectType.Block,
  GID: 10,
  isVertical: false,
  orientation: vee.Direction.Bottom,
  edgeTop: 0,
  edgeBottom: 0,
  edgeLeft: game.Data.tileSizeWidth - 10,
  edgeRight: game.Data.tileSizeWidth - 10,
  slope: 0,
  speedScale: 1
};
game.TileInfo.TileBlockOneWay = game.TileInfo.TileBlockOneWay || {
  type: game.ObjectType.BlockOneWay,
  GID: 10,
  isVertical: false,
  orientation: vee.Direction.Top,
  edgeTop: 0,
  edgeBottom: 0,
  edgeLeft: game.Data.tileSizeWidth,
  edgeRight: game.Data.tileSizeWidth,
  slope: 0,
  speedScale: 1
};
game.TileInfo.TileUPSlope = game.TileInfo.TileUPSlope || {
  type: game.ObjectType.Slope,
  GID: 34,
  isVertical: false,
  orientation: vee.Direction.Top,
  edgeTop: 0,
  edgeBottom: 0,
  edgeLeft: 0,
  edgeRight: game.Data.tileSizeWidth,
  slope: 1,
  speedScale: 0.7
};
game.TileInfo.TileDownSlope = game.TileInfo.TileDownSlope || {
  type: game.ObjectType.Slope,
  GID: 44,
  isVertical: false,
  orientation: vee.Direction.Top,
  edgeTop: 0,
  edgeBottom: 0,
  edgeLeft: game.Data.tileSizeWidth,
  edgeRight: 0,
  slope: -1,
  speedScale: 0.7
};
game.TileInfo.TileUpSlopeZeroToHalf = game.TileInfo.TileUpSlopeZeroToHalf || {
  type: game.ObjectType.Slope,
  GID: 34,
  isVertical: false,
  orientation: vee.Direction.Top,
  edgeTop: 0,
  edgeBottom: 0,
  edgeLeft: 0,
  edgeRight: game.Data.tileSizeWidthHalf,
  slope: 0.5,
  speedScale: 0.85
};
game.TileInfo.TileUpSlopeHalfToTop = game.TileInfo.TileUpSlopeHalfToTop || {
  type: game.ObjectType.Slope,
  GID: 34,
  isVertical: false,
  orientation: vee.Direction.Top,
  edgeTop: 0,
  edgeBottom: 0,
  edgeLeft: game.Data.tileSizeWidthHalf + 1,
  edgeRight: game.Data.tileSizeWidth,
  slope: 0.5,
  speedScale: 0.85
};
game.TileInfo.TileUpSlopeLeftToHalf = game.TileInfo.TileUpSlopeLeftToHalf || {
  type: game.ObjectType.Slope,
  GID: 56,
  isVertical: false,
  orientation: vee.Direction.Left,
  edgeTop: game.Data.tileSizeWidthHalf,
  edgeBottom: 0,
  edgeLeft: 0,
  edgeRight: 0,
  slope: 2,
  speedScale: 0.5
};
game.TileInfo.TileUpSlopeLeftToZero = game.TileInfo.TileUpSlopeLeftToZero || {
  type: game.ObjectType.Slope,
  GID: 56,
  isVertical: false,
  orientation: vee.Direction.Left,
  edgeTop: game.Data.tileSizeWidth,
  edgeBottom: game.Data.tileSizeWidthHalf,
  edgeLeft: 0,
  edgeRight: 0,
  slope: 2,
  speedScale: 0.5
};
game.TileInfo.TileDownSlopeTopToHalf = game.TileInfo.TileDownSlopeTopToHalf || {
  type: game.ObjectType.Slope,
  GID: 44,
  isVertical: false,
  orientation: vee.Direction.Top,
  edgeTop: 0,
  edgeBottom: 0,
  edgeLeft: game.Data.tileSizeWidth,
  edgeRight: game.Data.tileSizeWidthHalf + 1,
  slope: -0.5,
  speedScale: 0.85
};
game.TileInfo.TileDownSlopeHalfToZero = game.TileInfo.TileDownSlopeHalfToZero || {
  type: game.ObjectType.Slope,
  GID: 44,
  isVertical: false,
  orientation: vee.Direction.Top,
  edgeTop: 0,
  edgeBottom: 0,
  edgeLeft: game.Data.tileSizeWidthHalf,
  edgeRight: 0,
  slope: -0.5,
  speedScale: 0.85
};
game.TileIDInfo = {
  Tile1: game.TileInfo.TileBlock,
  Tile2: game.TileInfo.TileBlock,
  Tile3: game.TileInfo.TileBlock,
  Tile4: game.TileInfo.TileBlock,
  Tile5: game.TileInfo.TileBlock,
  Tile6: game.TileInfo.TileBlock,
  Tile7: game.TileInfo.TileBlock,
  Tile8: game.TileInfo.TileBlock,
  Tile9: game.TileInfo.TileBlock,
  Tile10: game.TileInfo.TileBlock,
  Tile11: game.TileInfo.TileBlock,
  Tile12: game.TileInfo.TileBlock,
  Tile13: game.TileInfo.TileBlock,
  Tile14: game.TileInfo.TileBlock,
  Tile15: game.TileInfo.TileBlock,
  Tile16: game.TileInfo.TileBlock,
  Tile17: game.TileInfo.TileBlock,
  Tile18: game.TileInfo.TileBlock,
  Tile19: game.TileInfo.TileBlock,
  Tile20: game.TileInfo.TileBlock,
  Tile30: game.TileInfo.TileBlock,
  Tile41: game.TileInfo.TileUPSlope,
  Tile42: game.TileInfo.TileDownSlope,
  Tile43: game.TileInfo.TileUpSlopeZeroToHalf,
  Tile44: game.TileInfo.TileUpSlopeHalfToTop,
  Tile45: game.TileInfo.TileDownSlopeTopToHalf,
  Tile46: game.TileInfo.TileDownSlopeHalfToZero,
  Tile47: game.TileInfo.TileUpSlopeLeftToZero,
  Tile48: game.TileInfo.TileDownSlopeRightToZero,
  Tile57: game.TileInfo.TileUpSlopeLeftToHalf,
  Tile58: game.TileInfo.TileDownSlopeRightToHalf,
  Tile61: game.TileInfo.TileBlock,
  Tile62: game.TileInfo.TileBlockBreakable,
  Tile64: game.TileInfo.TileBlock,
  Tile65: game.TileInfo.TileBlockBounce,
  Tile66: game.TileInfo.TileBlockBreakable,
  Tile67: game.TileInfo.TileBlockOneWay,
  Tile68: game.TileInfo.TileBlockOneWay,
  Tile69: game.TileInfo.TileBlockBreakable,
  Tile70: game.TileInfo.TileBlockBreakable,
  Tile134: game.TileInfo.TileHorizonBounce,
  Tile135: game.TileInfo.TileHorizonBounce,
  Tile71: game.TileInfo.TileBlockHurt,
  Tile72: game.TileInfo.TileBlockHurt,
  Tile73: game.TileInfo.TileBlockHurt,
  Tile77: game.TileInfo.TileBlockHalf,
  Tile78: game.TileInfo.TileBlockFade,
  Tile79: game.TileInfo.TileBlockBomb,
  Tile93: game.TileInfo.TileBlockOneWay,
  Tile94: game.TileInfo.TileBlock,
  Tile97: game.TileInfo.TileBlockOneWay,
  Tile108: game.TileInfo.TileBlock,
  Tile109: game.TileInfo.TileBlock,
  Tile110: game.TileInfo.TileBlock,
  Tile137: game.TileInfo.TileBlockBreakable,
  Tile138: game.TileInfo.TileBlockBreakable,
  Tile139: game.TileInfo.TileBlockBreakable,
  Tile140: game.TileInfo.TileBlockBreakable,
  Tile37: game.TileInfo.TileBlockSink,
  Tile38: game.TileInfo.TileBlockSink,
  Tile141: game.TileInfo.TileBlockScale,
  Tile142: game.TileInfo.TileBlockScale,
  Tile143: game.TileInfo.TileBlockScale,
  Tile144: game.TileInfo.TileBlockScale,
  Tile145: game.TileInfo.TileBlockScale,
  Tile111: game.TileInfo.TileEnemySlime,
  Tile112: game.TileInfo.TileEnemyDogSlime,
  Tile113: game.TileInfo.TileEnemyCannon,
  Tile114: game.TileInfo.TileEnemySusliksHawk,
  Tile115: game.TileInfo.TileEnemyArmorSlime,
  Tile116: game.TileInfo.TileEnemyArmorSlimeHawk,
  Tile117: game.TileInfo.TileEnemySpider,
  Tile118: game.TileInfo.TileEnemyFastBee,
  Tile119: game.TileInfo.TileEnemyMoth,
  Tile127: game.TileInfo.TileEnemyJumpSlime,
  Tile128: game.TileInfo.TileEnemyBee,
  Tile129: game.TileInfo.TileEnemyFish,
  Tile125: game.TileInfo.TileEnemyMadBee,
  Tile124: game.TileInfo.TileEnemyFlight,
  Tile126: game.TileInfo.TileEnemyDrillDog,
  Tile121: game.TileInfo.TileEnemyJumpFrog,
  Tile123: game.TileInfo.TileItemDrawer,
  Tile122: game.TileInfo.TileBlockTrap,
  Tile63: game.TileInfo.TileItemEgg,
  Tile64: game.TileInfo.TileItemEgg,
  Tile81: game.TileInfo.TileItemCoin,
  Tile82: game.TileInfo.TileItemBigCoin,
  Tile83: game.TileInfo.TileItemHeart,
  Tile84: game.TileInfo.TileItemBoxSmash,
  Tile85: game.TileInfo.TileItemBoxBullet,
  Tile86: game.TileInfo.TileItemBoxTeleport,
  Tile87: game.TileInfo.TileItemBoxBomb,
  Tile74: game.TileInfo.TileItemMovingPlatform,
  Tile75: game.TileInfo.TileItemFallingBlock,
  Tile76: game.TileInfo.TileItemGravityPlatform,
  Tile99: game.TileInfo.TileItemStageEnd,
  Tile100: game.TileInfo.TileItemSavePoint,
  Tile107: game.TileInfo.TileItemReverseKey,
  Tile130: game.TileInfo.TileItemFire,
  Tile120: game.TileInfo.TileNPC
};
game.CCBClass = {
  CCB_LY_GAME: "1"
};
