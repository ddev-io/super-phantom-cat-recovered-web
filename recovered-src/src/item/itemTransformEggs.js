var ItemTransformBox = Item.extend({
  _transformTo: game.PlayerType.Bullet,
  ps1: null,
  _aniName: null,
  bornWithPos: function () {
    this.ps1.setPositionType(1);
    switch (this._objType) {
      case game.ObjectType.BoxSmash:
        this._transformTo = game.PlayerType.Smash;
        this._aniName = "smash";
        break;
      case game.ObjectType.BoxBullet:
        this._transformTo = game.PlayerType.Bullet;
        this._aniName = "bullet";
        break;
      case game.ObjectType.BoxTeleport:
        this._transformTo = game.PlayerType.Teleport;
        this._aniName = "teleport";
        break;
      case game.ObjectType.BoxBomb:
        this._transformTo = game.PlayerType.Bomb;
        this._aniName = "bomb";
        break;
      case game.ObjectType.BoxHawk:
        this._transformTo = game.PlayerType.Hawk;
        this._aniName = "star";
        break;
    }
    this.playAnimate(this._aniName);
  },
  AILogicPerFrame: function () {
    if (!this._grid) {
      return;
    }
    if (
      this._grid.x > game.Data.oPlayerCtl._grid.x + this._checkForDieW ||
      this._grid.x < game.Data.oPlayerCtl._grid.x - this._checkForDieW ||
      this._grid.y > game.Data.oPlayerCtl._grid.y + this._checkForDieW ||
      this._grid.y < game.Data.oPlayerCtl._grid.y - this._checkForDieW
    ) {
      this.disappear();
    }
  },
  collide: function () {
    if (this._isOver) {
      return;
    }

    this._isOver = true;
    vee.Audio.playEffect(res.inGame_pick_pixie_mp3);

    if (this._transformTo === game.PlayerType.Hawk) {
      ItemTransformBox.transformToHawk(true, true);
    } else {
      game.Data.setPlayerType(this._transformTo);
      game.Data.oLyGame.showPowerDesc(this._transformTo);
    }

    this.playAnimate(this._aniName + "_out", function () {
      this.die();
    }.bind(this));
  },
  slow1: function () {
    vee.PopMgr.rootNode.getScheduler().setTimeScale(0.7);
  },
  slow2: function () {
    vee.PopMgr.rootNode.getScheduler().setTimeScale(0.12);
  },
  resume2: function () {
    vee.PopMgr.rootNode.getScheduler().setTimeScale(0.6);
  },
  resume1: function () {
    vee.PopMgr.rootNode.getScheduler().setTimeScale(1);
  }
});

ItemTransformBox.transformToHawk = function (autoBack, slowEffect) {
    vee.Audio.playEffect(res.inGame_efx_invisibleStart_mp3);
    if (game.Data.oPlayerCtl.clearMotionStreak) {
      game.Data.oPlayerCtl.clearMotionStreak();
    }
    game.Data.oPlayerCtl._container.runAction(cc.scaleTo(0.1, 0));
    game.Data.tempPlayerCtl = game.Data.oPlayerCtl;

    var player = ElePlayer.create(res.hero_blackcat_ccbi);
    game.Data.oLyGame.lyMap.addChild(player.container, 2);
    game.Data.oPlayerCtl = player.controller;
    game.Data.oPlayerCtl.copyPlayerState(game.Data.tempPlayerCtl);

    var light = EfxBlackCatLight.show();
    player.container.addChild(light, -1);
    player.container.setScale(0);
    player.container.runAction(cc.scaleTo(0.1, 1));

    if (game.Data.isInParkour()) {
      if (player.controller.isCanOperatByParkour) {
        player.controller.addMotionStreak(true);
        player.controller.startUpdate();
        player.controller.parkourMove();
      }
    }

    game.Data.playerHawk = true;
    if (slowEffect) {
      game.Data.oLyGame.slowDur = 0.2;
      game.Data.oLyGame.startSlowRate = 0.3;
      game.Data.oLyGame.slowReviveRate = 0.06;
      game.Data.oLyGame.gameSlow();
    }

    game.Data.oLyGame.showPowerDesc(game.PlayerType.Hawk);

    var grid = game.Data.oPlayerCtl._grid;
    var center = game.Logic.getTilePosCenterByGrid(grid);
    var mask = cc.LayerColor.create(cc.BLACK, 10000, 10000);
    game.Data.oLyGame.lyMapBack.addChild(mask, 1);
    mask.setPosition(cc.p(center.x - 5000, center.y - 5000));
    mask.setOpacity(0);
    mask.runAction(cc.sequence(
      cc.fadeTo(0.1, 150),
      cc.delayTime(0.5),
      cc.fadeTo(0.3, 50),
      cc.fadeTo(0.56, 0),
      cc.callFunc(function () {
        mask.removeFromParent();
      })
    ));

    EfxHawkLight.show(cc.p(center.x, center.y - TILE_WIDTH_HALF));
    vee.Audio.playMusic(res.bgm_invisible_mp3);

    if (autoBack) {
      vee.Utils.scheduleOnceForTarget(game.Data, ItemTransformBox.transformBackFromHawk, 60);
    }
  };

ItemTransformBox.transformBackFromHawk = function () {
    if (game.Data.playerHawk) {
      game.Data.playerHawk = false;
      cc.log("player is back!!!!!!!");

      game.Data.tempPlayerCtl._container.setScale(1);
      game.Data.tempPlayerCtl.copyPlayerState(game.Data.oPlayerCtl);
      EfxBlackCatLight.player = game.Data.oPlayerCtl;
      if (game.Data.oPlayerCtl.clearMotionStreak) {
        game.Data.oPlayerCtl.clearMotionStreak();
      }
      game.Data.oPlayerCtl.rootNode.setVisible(false);
      game.Data.oPlayerCtl = game.Data.tempPlayerCtl;

      EfxBlackCatLight.remove(function () {
        cc.log("removed");
        EfxBlackCatLight.player._container.removeFromParent();
      });

      game.Data.oPlayerCtl._jumpCount = 1;
      if (game.Data.isInParkour() && game.Data.oPlayerCtl.isCanOperatByParkour) {
        game.Data.oPlayerCtl.addMotionStreak(false);
        game.Data.oPlayerCtl.startUpdate();
        game.Data.oPlayerCtl.parkourMove();
      }
      vee.Audio.playMusic(game.Logic._bgmName);
    }
  };
