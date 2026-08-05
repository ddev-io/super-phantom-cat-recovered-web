// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/common/gameModule.dis
var vee = vee || {};
var game = game || {};
game.oGame = null;
game.oMain = null;
game.oScore = null;
vee.GameModule = {};
vee.GameModule.GlobalContext = this;
vee.GameModule.SceneMgr = {
  helpFile: "res/veeHelpLayer.ccbi",
  mainFile: "res/veeMainLayer.ccbi",
  gameFile: "res/veeGameLayer.ccbi",
  overFile: "res/veeOverLayer.ccbi",
  openMain: function () {
    vee.soundButton();
    vee.PopMgr.closeAll();
    game.oGame = null;
    var local0 = vee.PopMgr.popCCB(this.mainFile, true);
    game.oMain = local0.controller;
    game.oMain.handleKey(true);
  },
  openHelp: function () {
    vee.soundPopup();
    var local0 = vee.PopMgr.popCCB(this.helpFile, true);
    local0.controller.handleKey(true);
  },
  openGame: function () {
    vee.soundButton();
    vee.PopMgr.closeAll();
    game.oMain = null;
    var local0 = vee.PopMgr.popCCB(this.gameFile);
    game.oGame = local0.controller;
    game.oGame.handleKey(true);
  },
  openOver: function () {
    var local0 = vee.PopMgr.popCCB(this.overFile, true).controller;
    if (game.oScore && local0.lbScore) {
      local0.lbScore.setString(game.oScore.getNumber());
    }
  },
  isPlaying: function () {
    return game.oGame && game.oGame.isPlaying();
  },
  quitGame: function () {
    this.openMain();
  }
};
vee.GameModule.MainLayer = {
  extend: function (arg0) {
    veeMainLayer = veeMainLayer.extend(arg0);
    cc.BuilderReader.registerController("veeMainLayer", veeMainLayer);
  },
  _popUps: 0,
  _lySetting: null,
  onRank: function () {
    vee.soundButton();
    if (!app.Config.LeaderboardIDs) {
      return undefined;
    }
    if (app.Config.LeaderboardIDs.length > 1) {
      vee.Utils.showLeaderBoard();
    } else {
      vee.Utils.showLeaderboard(app.Config.LeaderboardIDs[0]);
    }
  },
  setEnableSetting: function (arg0) {
    if (!arg0) {
      this.settingFile = null;
    } else {
      this.settingFile = arg0;
    }
  },
  settingFile: "res/veeSetting.ccbi",
  onSetting: function () {
    this._popUps++;
    vee.soundButton();
    vee.PopMgr.popCCB(this.settingFile, true, this);
    this.afterSetting();
  },
  afterSetting: function () {
  },
  onHelp: function () {
    this._popUps++;
    vee.soundButton();
    vee.GameModule.SceneMgr.openHelp();
  },
  afterClose: function () {
  },
  onClose: function () {
    if (this._popUps > 0) {
      vee.soundCloseLayer();
      vee.PopMgr.closeLayer();
      this._popUps--;
      this.afterClose();
      return true;
    }
    return false;
  },
  beforePlay: function () {
  },
  onPlay: function () {
    vee.soundButton();
    var local0 = this.beforePlay();
    if (local0) {
      return undefined;
    }
    vee.GameModule.SceneMgr.openGame();
  },
  onRate: function () {
    vee.soundButton();
    vee.Utils.rate();
  },
  onKeyBack: function () {
    if (!this.onClose()) {
      vee.onKeyBack();
    }
  },
  onKeyMenu: function () {
    if (this.settingFile && this._popUps == 0) {
      this.onSetting();
    }
  }
};
var veeMainLayer = vee.Class.extend(vee.GameModule.MainLayer);
vee.GameModule.GameLayer = {
  extend: function (arg0) {
    veeGameLayer = veeGameLayer.extend(arg0);
    cc.BuilderReader.registerController("veeGameLayer", veeGameLayer);
  },
  onCreate: function () {
    if (this.lbScore) {
      game.oScore = vee.ScoreController.registerController(this.lbScore, 0);
    }
  },
  _bIsPause: false,
  _bIsGameOver: false,
  isPlaying: function () {
    return !this._bIsPause;
  },
  onKeyMenu: function () {
    if (this._bIsGameOver) {
      return false;
    }
    if (!this._bIsPause) {
      this.onPause();
      return true;
    }
    return false;
  },
  onKeyBack: function () {
    if (this._bIsGameOver) {
      return false;
    }
    if (this._bIsPause) {
      this.onResume();
      return true;
    } else {
      this.onPause();
      return true;
    }
    return false;
  },
  pauseFile: "res/veePause.ccbi",
  beforePause: function () {
    return true;
  },
  onPause: function () {
    if (!this.beforePause()) {
      return undefined;
    }
    vee.soundPopup();
    vee.PopMgr.pause(this.rootNode);
    vee.PopMgr.popCCB(this.pauseFile, true, this);
    this._bIsPause = true;
    this.afterPause();
  },
  afterPause: function () {
  },
  beforeResume: function () {
  },
  onResume: function () {
    this.beforeResume();
    vee.soundCloseLayer();
    vee.PopMgr.resume();
    vee.PopMgr.closeLayer();
    this._bIsPause = false;
    vee.Audio.resume();
    this.afterResume();
  },
  afterResume: function () {
  },
  beforeRetry: function () {
  },
  onRetry: function () {
    var local0 = this.beforeRetry();
    vee.PopMgr.resume();
    vee.Audio.resume();
    vee.soundButton();
    if (local0) {
      return undefined;
    }
    vee.GameModule.SceneMgr.openGame();
  },
  beforeGameOver: function () {
  },
  gameOver: function () {
    this.beforeGameOver();
    vee.GameModule.SceneMgr.openOver();
    this._bIsPause = true;
    this._bIsGameOver = true;
  },
  onHelp: function () {
    vee.GameModule.SceneMgr.openHelp();
  },
  onClose: function () {
    if (this._bIsPause) {
      vee.PopMgr.closeLayer();
    }
  },
  beforeQuit: function () {
  },
  onQuit: function () {
    this.beforeQuit();
    cc.director.resume();
    vee.Audio.resume();
    vee.soundButton();
    vee.GameModule.SceneMgr.quitGame();
  },
  popLayer: function () {
    this._popUps++;
  },
  closeLayer: function () {
    this.onClose();
  }
};
var veeGameLayer = vee.Class.extend(vee.GameModule.GameLayer);
vee.GameModule.HelpLayer = {
  extend: function (arg0) {
    veeHelpLayer = veeHelpLayer.extend(arg0);
    cc.BuilderReader.registerController("veeHelpLayer", veeHelpLayer);
  },
  lyContent: null,
  onLoaded: function () {
    if (this.lyContent) {
      var local0 = this.lyContent.getChildrenCount();
      vee.PagingController.registerController(this.lyContent, local0);
      this.lyContent.pagingController.setSensitivity(1.2);
    }
    this.afterLoaded();
  },
  afterLoaded: function () {
  },
  onClose: function () {
    vee.soundCloseLayer();
    vee.PopMgr.closeLayer();
  },
  onKeyBack: function () {
    this.onClose();
  }
};
var veeHelpLayer = vee.Class.extend(vee.GameModule.HelpLayer);
vee.GameModule.OverLayer = {
  extend: function (arg0) {
    veeOverLayer = veeOverLayer.extend(arg0);
    cc.BuilderReader.registerController("veeOverLayer", veeOverLayer);
  },
  lbScore: null,
  beforeRetry: function () {
  },
  onRetry: function () {
    var local0 = this.beforeRetry();
    if (local0) {
      return undefined;
    }
    vee.GameModule.SceneMgr.openGame();
  },
  beforeNextLevel: function () {
  },
  onNextLevel: function () {
    this.beforeNextLevel();
    vee.GameModule.SceneMgr.openGame();
  },
  beforeQuit: function () {
  },
  onQuit: function () {
    this.beforeQuit();
    vee.GameModule.SceneMgr.quitGame();
  },
  getShareContent: function () {
    return "\u8bf7\u91cd\u8f7d getShareContent \u65b9\u6cd5\u8bbe\u7f6e\u5206\u4eab\u5185\u5bb9";
  },
  beforeShare: function () {
  },
  onShare: function () {
    this.beforeShare();
    vee.Utils.shareScreen(this.getShareContent());
    this.afterShare();
  },
  afterShare: function () {
  }
};
var veeOverLayer = vee.Class.extend(vee.GameModule.OverLayer);
