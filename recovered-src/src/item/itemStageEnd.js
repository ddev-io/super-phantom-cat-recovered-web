var ItemStageEnd = Item.extend({
  ps1: null,
  ps2: null,
  _pos: null,

  bornWithPos: function (pos) {
    this._pos = pos;
    this.setElePosition(cc.p(pos.x, pos.y - TILE_WIDTH_HALF));
    this.loopAnimate();
  },

  inAnimate: function () {
    this.playAnimate("in", function () {
      this.rootNode.removeFromParent();
    }.bind(this));
  },

  outAnimate: function () {
    this.playAnimate("out");
  },

  loopAnimate: function () {
    this.playAnimate("loop");
  },

  _isOver: false,

  collide: function () {
    var player = game.Data.oPlayerCtl;
    if (player._pos.x < this._pos.x - 5 || player._pos.x > this._pos.x + 5 || this._isOver) {
      return;
    }

    ItemTransformBox.transformBackFromHawk();
    this._isOver = true;
    this.outAnimate();

    if (player.extendController) {
      player.extendController.touchGround();
    }

    if (game.LevelData.selectedCategory && game.LevelData.selectedLevel) {
      var categoryIdx = game.LevelData.selectedCategory.idx + 1;
      var levelIdx = game.LevelData.selectedLevel.idx + 1;
      if (game.Data.stageType === game.StageType.Normal) {
        vee.Analytics.logMissionCompleted("Level" + categoryIdx + "-" + levelIdx);
        vee.Analytics.UGameEvent.gameEndEvent("", "success");
      }
    }

    if (game.Data.stageType === game.StageType.Mini) {
      vee.Analytics.logMissionCompleted("LevelMini" + game.Data.performingTMXIdx);
      vee.Analytics.UGameEvent.gameEndEvent("Mini", "success");
    }

    if (game.Data.isClearVersion || game.Data.isFreeGame) {
      cc.log("选ID：" + game.LevelData.selectedLevel.idx);
      cc.log("选关卡数：" + game.LevelData.selectedCategory.levelCount);
      if (game.LevelData.selectedLevel.idx === game.LevelData.selectedCategory.levelCount - 1 &&
          game.LevelData.selectedCategory.idx < 5) {
        game.LevelData.setLockStatus(game.LevelData.selectedCategory.idx + 1, game.LevelData.LockStatus.UNLOCKED);
      }
    }

    game.Data.oLyGame.stopCamera = true;
    game.Data.oLyGame.freezeButton = true;
    player.gameOverOut(function () {
      this._onPlayerOutFinished();
    }.bind(this));
  },

  _onPlayerOutFinished: function () {
    var eventIdx = null;
    cc.log("unlocking = " + game.Data.isUnlocking());

    if (game.LevelData.selectedCategory) {
      var categoryIdx = game.LevelData.selectedCategory.idx + 1;
      var levelIdx = game.LevelData.selectedLevel.idx + 1;
      if (categoryIdx === 2 && levelIdx === 7) {
        vee.data.tenStage = true;
        vee.saveData();
      }
    }

    var avatar = game.AvatarData.getNextAvatar(0, true);
    if (avatar && avatar.idx === 1) {
      var firstNext = vee.data.fn;
      var category = game.LevelData.selectedCategory.idx + 1;
      var level = game.LevelData.selectedLevel.idx + 1;

      if (!firstNext) {
        if (category === 1 && level === 3) {
          game.Data.addEventCount(2);
          vee.data.fn = true;
          vee.saveData();
          if (!game.Data.isRated()) {
            LyGameWin.isShowRate = true;
          }
        } else {
          avatar = null;
        }
      }
    }

    if (!game.Data.isUnlocking() && game.Data.getEventCount() >= 2 && avatar) {
      eventIdx = avatar.eventIdx;
      cc.log("event = " + game.Data.getEventCount());
      vee.Transition.out(res.MapTransition_ccbi, function () {
        vee.PopMgr.closeAll();
        cc.director.purgeCachedData();
        vee.PopMgr.popCCB("res/veeGameLayer.ccbi");
        cc.log("opening level: " + eventIdx);
        game.Data.oLyGame.onLoaded();
        game.Data.oLyGame.initStage(eventIdx, false, game.StageType.Event);
      });
      return;
    }

    var showWinPop = function () {
      var playerContainer = game.Data.oPlayerCtl.getContainerNode();
      var playerRoot = game.Data.oPlayerCtl.rootNode;

      playerContainer.setPosition(cc.p(0, 0));
      playerContainer.retain();
      playerContainer.removeFromParent();

      var gameWinLayer = LyGameWin.show();
      gameWinLayer.controller.nodeAvatar.addChild(playerContainer);
      playerContainer.release();

      game.Data.oLyGameOver.oPlayer = playerRoot;
      playerRoot.controller.playAnimate("huxi_2", function () {
        if (game.Data.oLyGameOver) {
          game.Data.oLyGameOver.oPlayer.controller.randomBreath();
        }
      });
    }.bind(this);

    if (game.Data.willShowVideoAd) {
      vee.Ad.showRevivalVideoAd(showWinPop);
      return;
    }

    if (game.Data.isFreeGame) {
      cc.log("zq debug lyGameWin ccbInit");
      vee.Ad.showInterstitialByOnlineConfig("game_win");
      vee.Analytics.UGameEvent.showAdEvent("game_win", "interstial");
    }

    showWinPop();
  }
});

ItemStageEnd.show = function (pos) {
  var layer = cc.BuilderReader.load(res.efx_GamePiont_ccbi);
  game.Data.oLyGame.lyMap.addChild(layer, 1);
  layer.setPosition(cc.p(pos.x, pos.y - TILE_WIDTH_HALF));
  layer.controller.inAnimate();
};

var EfxStageEnd = vee.Class.extend({
  ccbInit: function () {
    this.playAnimate("show", function () {
      this.rootNode.removeFromParent();
    }.bind(this));
  }
});

EfxStageEnd.show = function (pos) {
  var layer = cc.BuilderReader.load(res.efx_stageEnd_ccbi);
  layer.setPosition(pos);
  game.Data.oLyGame.lyMap.addChild(layer, 11);
  layer.controller.ccbInit();
};
