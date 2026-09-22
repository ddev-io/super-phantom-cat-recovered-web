// Recovered readable source from smdis/elements/elePlayer.dis
// Functions that could not be verified with full confidence are marked with RECOVERY_UNCERTAIN_ELEPLAYER.

var MoveState = {
  Breath: 0,
  Dash: 1,
  DashBrake: 2,
  DashHolding: 3,
  Bounce: 4,
  Moving: 5,
  Brake: 6,
  JumpUp: 7,
  JumpDown: 8,
  DashJumpUp: 9,
  DashJumpDown: 10,
  SmashRolling: 11,
  Smash: 12,
  SmashShake: 13,
  SmashReset: 14,
  Spit: 15,
  Hanged: 20,
  Bomb_breath: 101,
  Bomb_get: 102,
  Bomb_run: 103,
  Bomb_fall: 104
};

var ElePlayer = vee.Class.extend({
  _eleType: game.EleType.Player,
  _triggerObj: true,
  boxOffset: null,
  boxSize: null,
  nodeBox: null,
  _container: null,
  extendController: null,
  _speedX: 0,
  _speedY: 0,
  _accX: 0,
  _accY: 0,
  _speedXLimit: 0,
  _speedYLimit: 0,
  _jumpCount: 1,
  _offsetX: 0,
  _offsetY: 0,
  _G: 0,
  _decay: 0,
  _moveState: MoveState.Moving,
  _isJumping: true,
  _isBrake: false,
  _isBounce: false,
  _isFlying: false,
  _isTeleport: false,
  _lastPosition: null,
  _grid: cc.p(0, 0),
  _lastGrid: null,
  _faceTo: vee.Direction.Right,
  _moveDir: vee.Direction.Origin,
  pushedDir: null,
  _isOver: false,
  _holdingDir: null,
  elf: null,
  _streak: null,
  _partice: null,
  elfMine: null,
  isShowMine: false,

  onCreate: function () {
    this.boxOffset = this.nodeBox.getPosition();
    this.boxSize = this.nodeBox.getContentSize();
    this._speedXLimit = game.Data.playerXSpeedLimit;
    this._speedYLimit = game.Data.playerYSpeedLimit;
    this._decay = game.Data.playerXdecay;
    this._G = game.Data.G;
    this._speedScaleRate = 1;
  },

  addMotionStreak: function (isSuper) {
    var streakPng = res.streak_png;
    var particleCcbi = res.particles_parkour_ccbi;
    if (isSuper) {
      streakPng = res.super_streak_png;
      particleCcbi = res.particles_super_parkour_ccbi;
    }

    var lyMap = game.Data && game.Data.oLyGame && game.Data.oLyGame.lyMap;
    var streak = null;
    var streakMinSeg = -1;

    this.clearMotionStreak();

    // Different recovered/runtime builds expose MotionStreak differently:
    // original bytecode used a constructor, but this cocos2d-js build may only
    // provide cc.MotionStreak.create().  Do not stop level loading if the
    // optional trail effect cannot be created.
    if (cc.MotionStreak) {
      try {
        if (typeof cc.MotionStreak.create === "function") {
          streak = cc.MotionStreak.create(0.4, streakMinSeg, 40, cc.color.WHITE, streakPng);
        } else if (typeof cc.MotionStreak === "function") {
          streak = new cc.MotionStreak(0.4, streakMinSeg, 40, cc.color.WHITE, streakPng);
        }
      } catch (e) {
        streak = null;
        cc.log && cc.log("MotionStreak disabled:", e.message || e);
      }
    }

    if (streak) {
      if (streak.setFastMode) {
        streak.setFastMode(true);
      }
      if (streak.setBlendFunc) {
        streak.setBlendFunc(1, 771);
      }
      if (lyMap) {
        lyMap.addChild(streak);
      }
      this._streak = streak;
    }

    var particle = cc.BuilderReader.load(particleCcbi);
    if (particle) {
      if (lyMap) {
        lyMap.addChild(particle);
      }
      particle.x = this.getElePosition().x;
      particle.y = this.getElePosition().y;
      this._partice = particle;
      this._particeDelay = 0;
    }
  },

  clearMotionStreak: function () {
    if (this._streak) {
      if (this._streak.removeFromParent) {
        this._streak.removeFromParent();
      }
      this._streak = null;
    }
    if (this._partice) {
      if (this._partice.removeFromParent) {
        this._partice.removeFromParent();
      }
      this._partice = null;
    }
    this._particeDelay = 0;
  },

  updateMotionStreak: function (dt) {
    if (this._streak) {
      var pos = this.getElePosition();
      this._streak.x = pos.x;
      this._streak.y = pos.y;
    }
    if (this._partice) {
      this._particeDelay += dt;
      if (this._particeDelay > 0.03) {
        this._particeDelay -= 0.03;
        this._partice.runAction(cc.moveTo(0.025, this.getElePosition()));
      }
    }
  },

  hideStreak: function () {
    if (this._streak) {
      this._streak.setVisible(false);
    }
    if (this._partice) {
      this._partice.setVisible(false);
    }
  },

  showStreak: function () {
    if (this._streak) {
      this._streak.setVisible(true);
    }
    if (this._partice) {
      this._partice.setVisible(true);
    }
  },

  ccbInit: function () {
    var category = game.LevelData.selectedCategory;
    if (category && category.idx > 99) {
      this.setFaceTo(vee.Direction.Left, true);
    }
  },

  isCanOperatByParkour: false,

  playerInAninate: function () {
    var self = this;
    this.setMoveState(MoveState.Breath);
    this.rootNode.setVisible(false);
    vee.Utils.scheduleOnceForTarget(this.rootNode, function () {
      self.rootNode.setVisible(true);
      ItemStageEnd.show(self.getElePosition());
      vee.Audio.playEffect(res.inGame_efx_entrance_mp3);
      cc.log("zq debug player in aninate");
      self.playAnimate("start_in", function () {
        var selectedLevel = game.LevelData.selectedLevel;
        var isParkour = game.Data.isInParkour && game.Data.isInParkour();
        var needParkourTip = isParkour &&
          game.LevelData.selectedCategory &&
          game.LevelData.selectedCategory.idx === 9 &&
          selectedLevel &&
          selectedLevel.idx === 0 &&
          selectedLevel.getLevelState() === 1;
        if (needParkourTip) {
          AlertParkourTip.show(function () {
            self.startParkourRun();
          }.bind(self));
        } else if (isParkour) {
          self.startParkourRun();
        } else {
          self.playAnimate("huxi_1");
          if (!MultiController.checkHasMultiLevel()) {
            self.startUpdate();
          }
        }
      }.bind(self));
    }.bind(this), 1);
  },

  onExit: function () {
    this.stopUpdate();
  },

  _eleSize: cc.size(game.Data.tileSizeWidth, game.Data.tileSizeWidth),
  AniTimeLine: {
    breath1: "huxi_1",
    breath2: "huxi_2",
    run: "run",
    run_brake: "run_brake",
    dash: "fast_run",
    dash_brake: "fast_run_brake",
    injure: "injure",
    jump_up: "run_jump_up",
    jump_down: "run_jump_down",
    dash_jump_up: "run_jump_up",
    dash_jump_down: "run_jump_down",
    out: "out",
    fall: "fall",
    smash_rolling: "smash_rolling",
    smash: "smash",
    smash_reset: "smash_huxi",
    inhale_ready: "inhale_ready",
    inhale_loop: "inhale_loop",
    inhale_end: "inhale_end",
    spit: "attack_fat",
    hang: "hang",
    run_fast: "run_fast"
  },

  _isOverFall: false,
  gameOverFall: function (callback) {
    if (this._isOverFall) {
      return;
    }
    this._isOverFall = true;
    this.gameOver();
    vee.Audio.playEffect(res.inGame_event_deathInstant_mp3);
    this.playAnimate("fall", function () {
      if (callback) {
        callback();
      }
    });
  },

  _isOverOut: false,
  _callback: null,
  gameOverOut: function (callback) {
    this._callback = callback;
    if (this._isOverOut) {
      return;
    }
    if (this.elf) {
      this.elf.hide();
    }
    this._speedX = 0;
    this._accX = 0;
    this._isOverOut = true;
    this.gameOver();
    vee.Audio.playEffect(res.inGame_efx_exit_mp3);
    this.playAnimate("out", function () {
      if (this._callback) {
        this._callback();
      }
    }.bind(this));
  },

  gameOver: function () {
    this.stopUpdate();
    this._isBounce = true;
    game.Data.playOverGid = cc.p(this._grid.x, this._grid.y);
    game.Data.oLyGame.gameOver();
    if (this.elf) {
      this.elf.hide();
    }
    this._isOver = true;
  },

  stopUpdate: function () {
    game.Data.isUpdatePlayerPos = false;
    if (this._motionDriverTarget && this._motionDriverCallback &&
        vee.Utils && vee.Utils.unscheduleCallbackForTarget) {
      vee.Utils.unscheduleCallbackForTarget(this._motionDriverTarget, this._motionDriverCallback);
    } else if (this._motionDriverTarget && vee.Utils && vee.Utils.unscheduleAllCallbacksForTarget) {
      vee.Utils.unscheduleAllCallbacksForTarget(this._motionDriverTarget);
    }
    this._motionDriverScheduled = false;
    this._motionDriverCallback = null;
    this._motionDriverTarget = null;
  },

  startUpdate: function () {
    game.Data.isUpdatePlayerPos = true;
    if (this.ensureMotionDriver) {
      this.ensureMotionDriver();
    }
  },

  setContainerNode: function (node) {
    this._container = node;
  },

  getContainerNode: function () {
    return this._container;
  },

  getElePosition: function () {
    return this._container.getPosition();
  },

  getPosition4Symbol: function () {
    return vee.Utils.pAdd(
      this._container.getPosition(),
      this._faceTo === vee.Direction.Right ? cc.p(-45, 30) : cc.p(45, 30)
    );
  },

  jumpSign: false,
  isJumping: function () {
    return this.jumpSign ? true : this._isJumping;
  },

  _pos: null,
  setElePosition: function (pos) {
    var grid = game.Logic.getTileGridByPos(pos);
    if (!game.Logic.isGridSame(grid, this._grid)) {
      this._lastGrid = cc.p(this._grid.x, this._grid.y);
      this._grid = grid;
      this.onGridChanged();
    }
    this._lastPosition = this._container.getPosition();
    this._offsetX = this._lastPosition.x - pos.x;
    this._offsetY = this._lastPosition.y - pos.y;
    this._container.setPosition(pos);
    game.Data.onPlayerChangePos(pos);
    this._pos = cc.p(pos.x, pos.y);
  },

  getEleRect: function () {
    var pos = this.getElePosition();
    return cc.rect(
      pos.x + this.boxOffset.x - this.boxSize.width / 2,
      pos.y + this.boxOffset.y - this.boxSize.height / 2,
      this.boxSize.width,
      this.boxSize.height
    );
  },

  getNextCastPos: function () {
    var pos = cc.p(this._pos.x, this._pos.y);
    var dt = 0.02;
    var speedY = this._speedY + (this._accY + (this._jumpSpeedProtect ? 0 : game.Data.G)) * dt;
    if (this.isLimitY && speedY < this._speedYLimit) {
      speedY = this._speedYLimit;
    }
    pos.y += speedY * dt;

    var speedX = this._speedX + this._accX * dt * (this._isBounce ? 0.1 : 1);
    if (speedX > this._speedXLimit) {
      speedX = this._speedXLimit;
    } else if (speedX < -this._speedXLimit) {
      speedX = -this._speedXLimit;
    }
    pos.x += speedX * dt;
    return pos;
  },

  resetPlayerState: function () {
    this._moveDir = vee.Direction.Origin;
    this._speedX = 0;
    this._speedY = 0;
    this._accX = 0;
    this._accY = 0;
  },

  stepAnimate: function () {
    if (this._moveDir !== vee.Direction.Origin) {
      this.setFaceTo(this._moveDir);
    }
    if (this.extendController) {
      return;
    }
    if (Math.abs(this._offsetX || 0) < 0.5) {
      return;
    }
    if (this.pushedDir && this.pushedDir[this._faceTo]) {
      return;
    }
    EfxDust.show(this.getElePosition(), DustType.RunDust, this._faceTo);
  },

  _isRandonBreath: true,
  randomBreath: function () {
    if (!this._isRandonBreath) {
      return;
    }
    this._isRandonBreath = false;
    this.playAnimate(this.AniTimeLine.breath2, function () {
      this._isRandonBreath = true;
      if (this._moveState === MoveState.Breath) {
        this.randomBreath();
      }
    }.bind(this));
  },

  getMoveState: function () {
    return this._moveState;
  },

  setMoveState: function (state) {
    if (this._moveState === state || this._isBounce || this._isOver) {
      return;
    }

    var isSmashing = false;
    switch (state) {
      case MoveState.Breath:
        if (this._isBrake || this._isSmashing) {
          return;
        }
        if (typeof MultiController !== "undefined" && MultiController.hasMine && MultiController.hasMine()) {
          this.playAnimate("huxi_bomb");
        } else {
          this.playAnimate("huxi_1", function () {
            if (this._moveState === MoveState.Breath) {
              this.randomBreath();
            }
          }.bind(this));
        }
        if (this._moveState !== MoveState.Brake && this._isJumping) {
          EfxDust.isJump = false;
          if (!this.extendController) {
            EfxDust.show(this.getElePosition(), DustType.JumpDust);
          } else {
            this.extendController.touchGround();
          }
          EfxApplause.Analysis.onLand(this._grid);
          vee.Audio.playEffect(res.inGame_event_toGround_mp3);
        }
        break;
      case MoveState.Moving:
        if (this._isBrake || this._isSmashing) {
          return;
        }
        this.rootNode.stopAllActions();
        this.setMovingAnima();
        if (this._moveState === MoveState.JumpDown) {
          EfxDust.isJump = false;
          if (!this.extendController) {
            EfxDust.show(this.getElePosition(), DustType.JumpDust);
          } else {
            this.extendController.touchGround();
          }
          EfxApplause.Analysis.onLand(this._grid);
          vee.Audio.playEffect(res.inGame_event_toGround_mp3);
        }
        break;
      case MoveState.Brake:
        if (this._isJumping || this._isSmashing) {
          return;
        }
        this.setFaceTo(this._faceTo, true);
        this._isBrake = true;
        this.playAnimate(this.AniTimeLine.run_brake);
        break;
      case MoveState.JumpUp:
        EfxApplause.Analysis.onJump(this._grid);
        this.playAnimate(this.AniTimeLine.jump_up);
        break;
      case MoveState.JumpDown:
        if (this._isSmashing) {
          return;
        }
        EfxApplause.Analysis.onJump(this._grid);
        this.playAnimate(this.AniTimeLine.jump_down);
        break;
      case MoveState.DashJumpUp:
        this.playAnimate(this.AniTimeLine.dash_jump_up);
        break;
      case MoveState.DashJumpDown:
        this.playAnimate(this.AniTimeLine.dash_jump_down);
        break;
      case MoveState.Spit:
        this.playAnimate(this.AniTimeLine.spit);
        break;
      case MoveState.Dash:
        this.rootNode.stopAllActions();
        this.playAnimate(this.AniTimeLine.dash);
        break;
      case MoveState.DashBrake:
        this.playAnimate(this.AniTimeLine.dash_brake);
        break;
      case MoveState.DashHolding:
        break;
      case MoveState.Bounce:
        this._isBounce = true;
        this.playAnimate(this.AniTimeLine.injure);
        this.hideStreak();
        break;
      case MoveState.SmashRolling:
      case MoveState.Smash:
      case MoveState.SmashShake:
        isSmashing = true;
        this.playAnimate("smash");
        break;
      case MoveState.SmashReset:
        isSmashing = true;
        break;
      case MoveState.Bomb_breath:
        this.playAnimate("huxi_bomb");
        break;
      case MoveState.Bomb_fall:
        this.playAnimate("fall_bomb");
        break;
      case MoveState.Bomb_get:
        this.playAnimate("get_bomb");
        break;
      default:
        break;
    }
    this._isSmashing = isSmashing;
    this._moveState = state;
  },

  setFaceTo: function (dir, force) {
    if (!force && this._faceTo === dir) {
      return;
    }
    this._isBrake = false;
    this._faceTo = dir;
    this.rootNode.setScaleX(dir === vee.Direction.Left ? -1 : 1);
  },

  getFaceToNumber: function () {
    return this._faceTo === vee.Direction.Left ? -1 : 1;
  },

  _isSmashing: false,
  isSmashing: function () {
    return this._isSmashing;
  },

  _jumpAccY: 1600,
  _jumpAccYmini: 600,
  holdJump: false,

  jump: function (pressed) {
    if (this.holdJump || this.extendController || this._freezeMoveButton || this._isSmashing || this._isTeleport) {
      return;
    }
    if (this._isReviveFloat) {
      this.cancelReviveFloat();
      return;
    }
    if (!(this._jumpCount > 0 || pressed)) {
      return;
    }
    game.Data.jumpCount++;
    if (this.rootNode) {
      this.rootNode.setScaleY(0.7);
      this.rootNode.setPosition(cc.p(0, -10));
    }
    this.startJumpCounter();
    this._jumpHeightLimitY = this.getElePosition().y + game.Data.playerJumpHeight;
    this._jumpCount--;
    this.setJumping(true);
    this.startUpdate();
  },

  jumpImmediately: function () {
    if (this._freezeMoveButton || this._isSmashing) {
      return;
    }
    this._jumpCount = 1;
    this.jump(true);
  },

  resetJumpCount: true,
  setJumping: function (jumping) {
    if (this._moveState === MoveState.Smash && jumping === false) {
      return;
    }
    this._isJumping = jumping;
    if (!jumping) {
      this._jumpCount = 1;
      this._speedScaleRate = 1;
    } else {
      if (this.resetJumpCount) {
        this._jumpCount = 0;
      } else {
        this.resetJumpCount = true;
      }
      this._speedScaleRate = 0.8;
    }
  },

  resetDTCounter: function () {
    this._dtCounter = 0;
    this._timeChecked = true;
  },

  checkTime: function () {
    if (this._timeChecked && this._dtCounter > 0.05) {
      this._timeChecked = false;
    }
  },

  _timeChecked: true,
  checkDTCounter: function (dt) {
    this._dtCounter += dt;
    if (this._dtCounter > 0.05) {
      this._timeChecked = false;
    }
  },

  _BBtnDown: false,
  BButton: function (pressed) {
    if (this.extendController || this.isSmashing()) {
      return;
    }
    this._BBtnDown = !pressed;
    switch (game.Data.playerType) {
      case game.PlayerType.Smash:
        this.BButtonSmash(pressed);
        break;
      case game.PlayerType.Teleport:
        this.BButtonTeleport(pressed);
        break;
      case game.PlayerType.Bullet:
        this.BButtonBullet(pressed);
        break;
      case game.PlayerType.Bomb:
        this.BButtonBomb(pressed);
        break;
      default:
        break;
    }
  },

  beginSmashPos: null,

  _skillCDReady: function (released) {
    if (released || this._freezeMoveButton) {
      return false;
    }
    var cd = (game.Data && typeof game.Data.BButtonCDTime === "number") ? game.Data.BButtonCDTime : 0;
    return this._dtCounter > cd;
  },

  _isPassableSkillTile: function (tileData) {
    if (!tileData) {
      return true;
    }
    if (!tileData.check) {
      return true;
    }
    if (!tileData.tileInfo) {
      return false;
    }
    return tileData.tileInfo.type === game.ObjectType.BlockOneWay ||
      tileData.tileInfo.type === game.ObjectType.BlockBounce;
  },

  _hideSkillElf: function () {
    if (this.elf && this.elf.hide) {
      this.elf.hide();
    }
  },

  BButtonSmash: function (released) {
    // Original logic: false/undefined = button down; true = button release.
    // Do not block this by _freezeMoveButton: cinema calls Phantom.BButtonSmash()
    // while normal player controls are frozen. The bytecode checks only
    // the release flag and the skill cooldown here.
    if (released) {
      return;
    }

    var cd = (game.Data && typeof game.Data.BButtonCDTime === "number") ? game.Data.BButtonCDTime : 0;
    if (this._dtCounter < cd) {
      return;
    }

    this.setMoveState(MoveState.SmashRolling);
    this.beginSmashPos = this.getElePosition();

    var startSmashDrop = function () {
      if (vee.Audio && vee.Audio.playEffect) {
        vee.Audio.playEffect(res.inGame_action_smashStart_mp3 || res.inGame_action_smashStart__mp3);
      }
      if (this._container && this._container.setVisible) {
        this._container.setVisible(true);
      }
      if (game.Data) {
        game.Data.playerInvisible = true;
      }
      this._accX = 0;
      this._speedX = 0;
      this._speedY = 0;
      if (typeof EfxSmashFlash !== "undefined" && EfxSmashFlash.show) {
        EfxSmashFlash.show(this.getElePosition());
      }
      this.startUpdate();
      this.setMoveState(MoveState.Smash);
      if (typeof EfxApplause !== "undefined" && EfxApplause.Analysis && EfxApplause.Analysis.onJump) {
        EfxApplause.Analysis.onJump(this._grid);
      }
      this._speedY = -1300;
    }.bind(this);

    if (!this._isJumping) {
      if (game.Data && game.Data.detachAllGrabbedPlatform) {
        game.Data.detachAllGrabbedPlatform();
      }

      var offsetY = 0;
      for (var i = 1; i < 3; i++) {
        var probeGrid = cc.p(this._grid.x, this._grid.y - i);
        var tile = game.Logic && game.Logic.map && game.Logic.map.getObject ? game.Logic.map.getObject(probeGrid) : null;
        if (tile && tile.check) {
          break;
        }
        offsetY += TILE_WIDTH;
      }

      var pos = this.getElePosition();
      this.setElePosition(cc.p(pos.x, pos.y + offsetY));

      if (!(typeof Cinema !== "undefined" && Cinema.isCinema) && game.Data && game.Data.oLyGame && !game.Data.oLyGame._isFreezeY) {
        game.Data.cameraYPos += offsetY;
      }

      this.stopUpdate();
      if (game.Data) {
        game.Data.playerInvisible = true;
      }
      if (typeof EfxSmashFlash !== "undefined" && EfxSmashFlash.show) {
        EfxSmashFlash.show(this.getElePosition());
      }
      if (this._container && this._container.setVisible) {
        this._container.setVisible(false);
      }

      var playRollingThenDrop = function () {
        this._accX = 0;
        this._speedX = 0;
        this._speedY = 0;
        this.playAnimate(this.AniTimeLine.smash_rolling, startSmashDrop);
      }.bind(this);

      if (vee.Utils && vee.Utils.scheduleOnce) {
        vee.Utils.scheduleOnce(playRollingThenDrop);
      } else if (vee.Utils && vee.Utils.scheduleOnceForTarget) {
        vee.Utils.scheduleOnceForTarget(this, playRollingThenDrop, 0);
      } else {
        playRollingThenDrop();
      }

      this.setJumping(false);
    } else {
      if (game.Data) {
        game.Data.playerInvisible = true;
      }
      this._accX = 0;
      this._speedX = 0;
      this._speedY = 0;
      if (typeof EfxSmashFlash !== "undefined" && EfxSmashFlash.show) {
        EfxSmashFlash.show(this.getElePosition());
      }
      this.setMoveState(MoveState.Smash);
      if (typeof EfxApplause !== "undefined" && EfxApplause.Analysis && EfxApplause.Analysis.onJump) {
        EfxApplause.Analysis.onJump(this._grid);
      }
      if (vee.Audio && vee.Audio.playEffect) {
        vee.Audio.playEffect(res.inGame_action_smashStart_mp3 || res.inGame_action_smashStart__mp3);
      }
      this._speedY = -1300;
    }

    this.isLimitY = false;
    this.resetDTCounter();
    this._hideSkillElf();
  },

  BButtonTeleport: function (released) {
    if (!this._skillCDReady(released) || this._isSmashing || this._isJumping) {
      return;
    }

    if (game.Data && game.Data.detachAllGrabbedPlatform) {
      game.Data.detachAllGrabbedPlatform();
    }

    var dir = this.getFaceToNumber ? this.getFaceToNumber() : (this._faceTo === vee.Direction.Left ? -1 : 1);
    var len = (game.Data && game.Data.playerTeleportLength) || 3;
    var destGrid = cc.p(this._grid.x + dir * len, this._grid.y);
    var maxStep = Math.abs(destGrid.x - this._grid.x);
    var targetGrid = destGrid;

    for (var i = 0; i <= maxStep; i++) {
      var probe = cc.p(destGrid.x - dir * i, destGrid.y);
      var tile = game.Logic.map && game.Logic.map.getObject ? game.Logic.map.getObject(probe) : null;
      if (this._isPassableSkillTile(tile)) {
        targetGrid = probe;
        break;
      }
      if (i === 0) {
        var outside = cc.p(destGrid.x + dir, destGrid.y);
        var outsideTile = game.Logic.map && game.Logic.map.getObject ? game.Logic.map.getObject(outside) : null;
        if (this._isPassableSkillTile(outsideTile)) {
          targetGrid = outside;
          break;
        }
      }
    }

    var targetPos = game.Logic.getTilePosCenterByGrid(targetGrid);
    if (targetPos.x < 96) {
      targetPos.x = 96;
    }

    if (game.Data && game.Data.setPlayerInvisible) {
      game.Data.setPlayerInvisible(true);
    } else if (game.Data) {
      game.Data.playerInvisible = true;
    }
    this._isBounce = true;
    this._isTeleport = true;

    if (vee.Audio && vee.Audio.playEffect) {
      vee.Audio.playEffect(res.inGame_action_teleport_mp3);
    }
    if (typeof EfxTeleportDust !== "undefined" && EfxTeleportDust.create) {
      EfxTeleportDust.create(this.getElePosition(), this._faceTo);
    }

    this.playAnimate("shunyi_out", function () {
      var oldPos = this.getElePosition();
      this.setElePosition(targetPos);
      if (game.Data) {
        game.Data.cameraXPos = (game.Data.cameraXPos || 0) - (oldPos.x - targetPos.x);
        game.Data.cameraXrevived = false;
      }
      this.playAnimate("shunyi_in", function () {
        this._isTeleport = false;
        this._isBounce = false;
        if (game.Data && game.Data.setPlayerInvisible) {
          game.Data.setPlayerInvisible(false);
        } else if (game.Data) {
          game.Data.playerInvisible = false;
        }
        this.setMoveState(MoveState.Breath);
      }.bind(this));
    }.bind(this));

    this.resetDTCounter();
    this._hideSkillElf();
  },

  BButtonBullet: function (released) {
    if (!this._skillCDReady(released) || this._isSmashing || this._isTeleport) {
      return;
    }
    if (!game.Data || game.Data.bulletCount <= 0) {
      return;
    }

    if (vee.Audio && vee.Audio.playEffect) {
      vee.Audio.playEffect(res.inGame_action_bullet_mp3);
    }
    game.Data.bulletCount--;

    var pos = this.getElePosition();
    if (typeof EfxBulletShoot !== "undefined" && EfxBulletShoot.create) {
      EfxBulletShoot.create(pos, this._faceTo, this._container);
    }

    var offset = vee.Direction.direction2Point(this._faceTo);
    offset.x *= game.Data.tileSizeWidth / 2;
    offset.y *= game.Data.tileSizeWidth / -2;
    if (offset.x) {
      offset.x += offset.x > 0 ? 5 : -5;
    }
    if (offset.y) {
      offset.y += offset.y > 0 ? 5 : -5;
    }

    if (typeof ItemSpitStar !== "undefined" && ItemSpitStar.create) {
      ItemSpitStar.create(vee.Utils.pAdd(pos, offset), this.getFaceToNumber());
    }
    if (game.Data.bulletCount <= 0) {
      this._hideSkillElf();
    }
  },

  BButtonBomb: function (released) {
    if (!this._skillCDReady(released) || this._isSmashing || this._isTeleport || this._isJumping) {
      return;
    }

    var dir = this.getFaceToNumber ? this.getFaceToNumber() : (this._faceTo === vee.Direction.Left ? -1 : 1);
    var castPos = this.getNextCastPos ? this.getNextCastPos() : this.getElePosition();
    var baseGrid = game.Logic.getTileGridByPos(castPos, this._pos.y);
    var bombGrid = cc.p(baseGrid.x + dir, baseGrid.y);
    var mapTile = game.Logic.map && game.Logic.map.getObject ? game.Logic.map.getObject(bombGrid) : null;
    var mapExTile = game.Logic.mapex && game.Logic.mapex.getObject ? game.Logic.mapex.getObject(bombGrid) : null;
    var tempData = null;

    var blocked = false;
    if (mapTile && !this._isPassableSkillTile(mapTile)) {
      blocked = true;
    }
    if (mapExTile && mapExTile.tileInfo &&
      (mapExTile.tileInfo.type === game.ObjectType.Susliks || mapExTile.tileInfo.type === game.ObjectType.SusliksHawk)) {
      blocked = true;
    }

    if (blocked) {
      bombGrid = cc.p(this._grid.x, this._grid.y);
      var currentTile = game.Logic.map && game.Logic.map.getObject ? game.Logic.map.getObject(bombGrid) : null;
      if (currentTile && currentTile.tileInfo && currentTile.tileInfo.slope !== 0 && currentTile.tileInfo.slope !== undefined) {
        tempData = currentTile;
      }
    } else if (mapTile) {
      tempData = mapTile;
    }

    if (game.Logic.isGridSame && game.Logic.isGridSame(this._grid, bombGrid)) {
      var backGrid = cc.p(bombGrid.x - dir, bombGrid.y);
      var backTile = game.Logic.map && game.Logic.map.getObject ? game.Logic.map.getObject(backGrid) : null;
      if (!this._isPassableSkillTile(backTile)) {
        return;
      }
      var backPos = game.Logic.getTilePosCenterByGrid(backGrid);
      var oldPos = this.getElePosition();
      this.setElePosition(backPos);
      if (game.Data) {
        game.Data.cameraXPos = (game.Data.cameraXPos || 0) - (oldPos.x - backPos.x);
        game.Data.cameraXrevived = false;
      }
    }

    this._speedX = 0;
    if (game.Logic._tmxLayer && game.Logic._tmxLayer.setTileGID) {
      game.Logic._tmxLayer.setTileGID(game.BlockType.BombBlock, bombGrid);
    }

    var bombData = null;
    if (game.Logic.getTileData) {
      bombData = game.Logic.getTileData(bombGrid, game.Logic._tmxLayer);
    }
    if (bombData) {
      bombData.tempData = tempData;
      bombData.isPlayerBomb = true;
    }

    var tileNode = game.Logic._tmxLayer && game.Logic._tmxLayer.getTileAt ? game.Logic._tmxLayer.getTileAt(bombGrid) : null;
    if (tileNode && tileNode.setVisible) {
      tileNode.setVisible(false);
    }
    if (game.Logic.map && game.Logic.map.setObject && bombData) {
      game.Logic.map.setObject(bombData, bombGrid);
    }

    var enemies = game.Logic.dynamicObjMap && game.Logic.dynamicObjMap.getObjects ? game.Logic.dynamicObjMap.getObjects() : [];
    for (var i = 0; i < enemies.length; i++) {
      var enemy = enemies[i];
      if (!enemy || enemy._eleType !== game.EleType.Enemy || !enemy._grid) {
        continue;
      }
      if (enemy._grid.y !== bombGrid.y || enemy._grid.x < bombGrid.x - 1 || enemy._grid.x > bombGrid.x + 1) {
        continue;
      }
      var center = game.Logic.getTilePosCenterByGrid(bombGrid);
      var enemyPos = enemy.getElePosition();
      if (enemyPos.x > center.x) {
        var rightEdge = game.Logic.getTilePosByGrid(cc.p(bombGrid.x + 1, bombGrid.y));
        if (enemyPos.x <= rightEdge.x) {
          if (enemy.moveRight) { enemy.moveRight(); }
          enemy.setElePosition(game.Logic.getTilePosCenterByGrid(cc.p(bombGrid.x + 1, bombGrid.y)));
          enemy._speedY = 0;
        }
      } else {
        var leftEdge = game.Logic.getTilePosByGrid(cc.p(bombGrid.x - 1, bombGrid.y));
        if (enemyPos.x >= leftEdge.x) {
          if (enemy.moveLeft) { enemy.moveLeft(); }
          enemy.setElePosition(game.Logic.getTilePosCenterByGrid(cc.p(bombGrid.x - 1, bombGrid.y)));
          enemy._speedY = 0;
        }
      }
    }

    if (bombData && bombData.collide) {
      bombData.collide(this, vee.Direction.Origin, true);
    }
    if (vee.Audio && vee.Audio.playEffect) {
      vee.Audio.playEffect(res.inGame_action_bomb_mp3);
    }
    this.resetDTCounter();
    this._hideSkillElf();
  },

  _freezeMoveButton: false,
  moveLeft: function () {
    if (this.extendController || this.isSmashing() || this._isBounce || (this._freezeMoveButton && this._moveState !== MoveState.SmashReset)) {
      return;
    }
    if ((this._moveState === MoveState.Dash || this._moveState === MoveState.DashJumpUp || this._moveState === MoveState.DashJumpDown) && !this._isJumping && this._moveDir !== vee.Direction.Left) {
      this._accX = -game.Data.playerXacc;
      this.setMoveState(MoveState.DashBrake);
      this.setFaceTo(vee.Direction.Left);
    } else {
      this.setFaceTo(vee.Direction.Left);
      this._accX = -game.Data.playerXacc;
    }
    this._moveDir = vee.Direction.Left;
    this.startUpdate();
  },

  moveRight: function () {
    if (this.extendController || this.isSmashing() || this._isBounce || (this._freezeMoveButton && this._moveState !== MoveState.SmashReset)) {
      return;
    }
    if ((this._moveState === MoveState.Dash || this._moveState === MoveState.DashJumpUp || this._moveState === MoveState.DashJumpDown) && !this._isJumping && this._moveDir !== vee.Direction.Right) {
      this._accX = game.Data.playerXacc;
      this.setMoveState(MoveState.DashBrake);
      this.setFaceTo(vee.Direction.Right);
    } else {
      this.setFaceTo(vee.Direction.Right);
      this._accX = game.Data.playerXacc;
    }
    this._moveDir = vee.Direction.Right;
    this.startUpdate();
  },

  getShock: function (dir, hurt) {
    if (this._isBounce) {
      return;
    }
    if (this.extendController && this.extendController.touchGround) {
      this.extendController.touchGround(true);
    }

    this.setJumping(true);
    this.setMoveState(MoveState.Bounce);
    vee.Audio.playEffect(res.inGame_event_hurted_mp3);

    this._accX = 0;
    this._speedXLimit = game.Data.playerXSpeedLimit;
    if (dir === vee.Direction.Left) {
      this._speedX = -200;
    } else if (dir === vee.Direction.Right) {
      this._speedX = 200;
    } else {
      this._speedX = this._speedX > 0 ? -200 : 200;
    }

    this._isJumpLimitY = false;
    this._speedY = 1000;
    this._accY = 0;
    this._jumpSpeedProtect = false;
    this.stopJumpCounter();

    var canShock = true;
    if (hurt) {
      if (game.Data && game.Data.costLife) {
        canShock = game.Data.costLife();
      }
      this.hurtInvisible();
    }
    if (canShock) {
      this.hurtShock();
    }
    if (typeof EfxApplause !== "undefined" && EfxApplause.Analysis && EfxApplause.Analysis.onLand) {
      EfxApplause.Analysis.onLand(this._grid);
    }
  },

  hurtInvisible: function (duration) {
    duration = duration || 6;
    game.Data.playerInvisible = true;
    var target = this._container || this.rootNode;
    if (!target || !target.runAction) {
      game.Data.playerInvisible = false;
      return;
    }
    target.runAction(cc.sequence(
      cc.repeat(
        cc.sequence(
          cc.delayTime(0.2),
          cc.hide(),
          cc.callFunc(function () { game.Data.playerInvisible = true; }.bind(this)),
          cc.delayTime(0.2),
          cc.show(),
          cc.callFunc(function () { game.Data.playerInvisible = true; }.bind(this))
        ),
        duration
      ),
      cc.callFunc(function () {
        game.Data.playerInvisible = false;
        target.setVisible(true);
      }.bind(this))
    ));
  },

  hurtShock: function () {
    var root = game.Data && game.Data.oLyGame && game.Data.oLyGame.rootNode;
    if (!root || !root.runAction) {
      return;
    }

    var x = 4;
    var y = 20;
    var t = 0.05;
    root.runAction(cc.sequence(
      cc.moveBy(t, cc.p(-x, y)),
      cc.moveBy(t, cc.p(x * 2, -y * 2)),
      cc.moveBy(t, cc.p(-x * 2, y * 2)),
      cc.moveBy(t, cc.p(x, -y))
    ));
  },

  revivalByDeadZone: function () {
    // RECOVERY_UNCERTAIN_ELEPLAYER: revive position is inferred from stored safe position.
    if (!this._safePos) {
      this.gameOverFall();
      return;
    }
    this.setElePosition(this._safePos);
    this._speedX = 0;
    this._speedY = 0;
    this.hurtInvisible();
  },

  _isReviveFloat: false,
  _canReviveFloat: true,
  _bubbleCtl: null,
  reviveFloat: function () {
    if (!this._canReviveFloat || this._isReviveFloat) {
      return;
    }
    this._isReviveFloat = true;
    this._speedX = 0;
    this._speedY = 0;
    this._accX = 0;
    this._accY = 0;
    this.playAnimate("bubble");
  },

  cancelReviveFloat: function () {
    if (!this._isReviveFloat) {
      return;
    }
    this._isReviveFloat = false;
    this._canReviveFloat = false;
    this._accY = game.Data.G;
    this.setJumping(true);
  },

  stopMove: function () {
    this._accX = 0;
  },

  stopRunning: function () {
    this._speedX = 0;
  },

  leftToBarrier: function (tile) {
    this.pushedDir[vee.Direction.Left] = 1;
    if (game.Logic && game.Logic.triggerTileCallback) {
      game.Logic.triggerTileCallback(tile, this, vee.Direction.Left);
    }
    this._speedX = 0;
  },

  rightToBarrier: function (tile) {
    this.pushedDir[vee.Direction.Right] = 1;
    if (game.Logic && game.Logic.triggerTileCallback) {
      game.Logic.triggerTileCallback(tile, this, vee.Direction.Right);
    }
    this._speedX = 0;
  },

  upToBarrier: function (tile) {
    this.pushedDir[vee.Direction.Top] = 1;
    if (tile && vee.Audio && vee.Audio.playEffect && res.inGame_event_hitBlock_mp3) {
      vee.Audio.playEffect(res.inGame_event_hitBlock_mp3);
    }
    if (game.Logic && game.Logic.triggerTileCallback) {
      game.Logic.triggerTileCallback(tile, this, vee.Direction.Top);
    }
    this._speedY = 0;
    this._accY = 0;
    if (this.stopJumpCounter) {
      this.stopJumpCounter();
    }
  },

  _gidForCheck: 0,
  downToBarrier: function (tile) {
    this._isJumpLimitY = false;
    this.pushedDir[vee.Direction.Bottom] = 1;
    this._isFlying = false;
    if (this.stopJumpCounter) {
      this.stopJumpCounter();
    }

    // The original bytecode returns immediately while the smash landing/reset
    // animation is already active. Without this guard the restored collision
    // code can call downToBarrier every frame, replaying the shake/sound/dust
    // endlessly and leaving the player stuck in the smash state.
    if (this._moveState === MoveState.SmashShake || this._moveState === MoveState.SmashReset) {
      return;
    }

    if (tile && typeof tile.gid !== "undefined") {
      this._gidForCheck = tile.gid;
      if (game.Data && game.Data.detachAllGrabbedPlatform) {
        game.Data.detachAllGrabbedPlatform();
      }
    } else {
      this._gidForCheck = -1;
    }

    if (this.isSmashing && this.isSmashing() && game.Logic && game.Logic.isBreakableBlock && !game.Logic.isBreakableBlock(this._gidForCheck)) {
      if (typeof Cinema !== "undefined" && Cinema.isCinema && Cinema.smashCallback) {
        Cinema.smashCallback();
      }
      if (vee.Audio && vee.Audio.playEffect && res.inGame_action_smashOver_mp3) {
        vee.Audio.playEffect(res.inGame_action_smashOver_mp3);
      }
      this.isLimitY = true;
      this._speedY = 0;
      this._accY = 0;
      this.setJumping(false);
      this.setMoveState(MoveState.SmashShake);

      var resetCalled = false;
      var resetSmashState = function () {
        if (resetCalled) {
          return;
        }
        resetCalled = true;
        this._isSmashing = false;
        this._speedY = 0;
        this._accY = 0;
        this.setMoveState(MoveState.Breath);
        if (this._container && this._container.setVisible) {
          this._container.setVisible(true);
        }
        if (this.rootNode && this.rootNode.setVisible) {
          this.rootNode.setVisible(true);
        }
        if (game.Data) {
          game.Data.playerInvisible = false;
        }
      }.bind(this);

      var shakeTime = 0.03;
      var shakeRange = 18;
      if (game.Data && game.Data.oLyGame && game.Data.oLyGame.rootNode) {
        game.Data.oLyGame.rootNode.stopAllActions();
        game.Data.oLyGame.rootNode.runAction(cc.sequence(
          cc.MoveBy.create(shakeTime, 0, -shakeRange),
          cc.MoveBy.create(shakeTime, 0, shakeRange * 2),
          cc.MoveBy.create(shakeTime, 0, -shakeRange),
          cc.MoveBy.create(shakeTime / 2, 0, shakeRange),
          cc.MoveBy.create(shakeTime / 2, 0, -shakeRange * 2),
          cc.MoveBy.create(shakeTime / 2, 0, shakeRange)
        ));
      }
      if (this.playAnimate && this.AniTimeLine && this.AniTimeLine.smash_reset) {
        this.playAnimate(this.AniTimeLine.smash_reset, resetSmashState);
        if (vee.Utils && vee.Utils.scheduleOnceForTarget) {
          vee.Utils.scheduleOnceForTarget(this, resetSmashState, 0.6);
        }
      } else {
        resetSmashState();
      }
      if (typeof EfxSmashDust !== "undefined" && EfxSmashDust.show) {
        EfxSmashDust.show(this.getElePosition());
      }
      if (game.Logic && game.Logic.triggerTileCallback) {
        game.Logic.triggerTileCallback(tile, this, vee.Direction.Bottom);
      }
      return;
    }

    this._speedY = 0;
    this._accY = 0;
    game.Data.cameraRestoreY = false;

    if (game.Data.oLyGame && game.Data.oLyGame._holdLeft && this.moveLeft) {
      this.moveLeft();
    } else if (game.Data.oLyGame && game.Data.oLyGame._holdRight && this.moveRight) {
      this.moveRight();
    }

    if (this._moveState === MoveState.DashJumpUp || this._moveState === MoveState.DashJumpDown) {
      this.setMoveState(MoveState.Dash);
    }

    if (this._moveState === MoveState.Bounce) {
      this._isBounce = false;
      if (game.Data.isInParkour && game.Data.isInParkour()) {
        this._container.runAction(cc.sequence(
          cc.delayTime(0.2),
          cc.callFunc(function () { this.parkourMove(); }.bind(this))
        ));
      } else {
        this.setMoveState(MoveState.Breath);
      }
    } else if (this._moveDir === vee.Direction.Origin && !this.isSmashing()) {
      this.setMoveState(MoveState.Breath);
    } else if (!this.isSmashing()) {
      this.setMoveState(MoveState.Moving);
    }

    this.setJumping(false);
    if (game.Logic && game.Logic.triggerTileCallback) {
      game.Logic.triggerTileCallback(tile, this, vee.Direction.Bottom);
    }
  },

  squeeze: function () {
    this.gameOverFall();
  },

  onGridChanged: function () {
    if (!this._grid || !this._lastGrid) {
      return;
    }

    game.Logic.checkNewGrids(this._lastGrid, vee.Utils.pSub(this._grid, this._lastGrid));
    game.Logic.checkTileTrigger(this._grid, vee.Direction.Origin, null, this);
    game.Data.onPlayerGridChange(this._grid);
  },


  _motionDriverScheduled: false,
  _motionDriverLastClock: 0,
  ensureMotionDriver: function () {
    if (this._motionDriverScheduled) {
      return;
    }
    if (!vee.Utils || !vee.Utils.scheduleCallbackForTarget) {
      return;
    }
    // Schedule on the controller object itself, not on rootNode/nodeBox.
    // rootNode and all children can be paused by PopMgr during level start,
    // while the controller target keeps receiving scheduler ticks.
    var target = this;
    this._motionDriverTarget = target;
    this._motionDriverLastClock = Date.now ? Date.now() : (new Date()).getTime();
    this._motionDriverCallback = function (dt) {
      if (!game.Data || game.Data.oPlayerCtl !== this || !game.Data.oLyGame ||
          !game.Data.isInLevelSceen || this._isOver) {
        this.stopUpdate();
        return;
      }
      var now = Date.now ? Date.now() : (new Date()).getTime();
      var lastLyUpdate = game.Data._lastLyGameUpdateClock || 0;
      if (lastLyUpdate && now - lastLyUpdate < 80) {
        this._motionDriverLastClock = now;
        return;
      }
      if (!game.Data.isUpdatePlayerPos && !this._jumpSpeedProtect && this._accX === 0 && this._speedX === 0 && this._speedY === 0) {
        this._motionDriverLastClock = now;
        return;
      }
      if (game.Data.oLyGame && game.Data.oLyGame.isPause) {
        this._motionDriverLastClock = now;
        return;
      }
      dt = Number(dt);
      if (!dt || !isFinite(dt) || dt <= 0) {
        dt = this._motionDriverLastClock ? (now - this._motionDriverLastClock) / 1000 : 1 / 60;
      }
      this._motionDriverLastClock = now;
      if (dt > 0.02) {
        dt = 0.02;
      }
      game.Data.isUpdatePlayerPos = true;
      this.updatePos(dt);
      if (game.Data.oLyGame) {
        if (game.Data.oLyGame.setCameraFollow) {
          game.Data.oLyGame.setCameraFollow(this);
        }
        if (game.Data.oLyGame._safeCameraPos) {
          game.Data.oLyGame._safeCameraPos();
        }
      }
    }.bind(this);
    vee.Utils.scheduleCallbackForTarget(target, this._motionDriverCallback, 0);
    this._motionDriverScheduled = true;
  },

  _speedScaleRate: 1,
  _safePos: null,
  needUpdateState: true,
  _dtCounter: 0,

  updatePos: function (dt) {
    dt = Number(dt);
    if (!dt || !isFinite(dt) || dt <= 0) {
      dt = 1 / 60;
    } else if (dt > 0.02) {
      dt = 0.02;
    }
    this.updateMotionStreak(dt);
    this.checkDTCounter(dt);
    this.pushedDir = [];
    if (this.extendController && this.extendController.objType !== game.ObjectType.Flight) {
      return;
    }
    this.calcX(dt);
    if (this._jumpSpeedProtect) {
      this.updateJumpCounter(dt);
    }
    this.calcY(dt);
    this.calcMoveDir();
    var castPos = this.getCastPos(dt);
    this.setElePosition(game.Logic.safePos(castPos, this));
    if (this.elf) {
      this.elf.follow(dt);
    }
    if (game.Data.isInParkour() && this._moveState === MoveState.Hanged) {
      this.parkourMove();
    }
    if (this.needUpdateState) {
      this.updateState();
    } else {
      this.needUpdateState = true;
    }
    if (this._speedY !== 0) {
      this.setJumping(true);
    }
    if (!this._isBounce && !this._isFlying) {
      this.calcDecay(dt);
    }
  },

  calcX: function (dt) {
    if (this._freezeMoveButton) {
      return;
    }
    this._speedX += this._accX * dt * (this._isBounce ? 0.1 : 1);
    if (this._speedX > this._speedXLimit) {
      this._speedX = this._speedXLimit;
    } else if (this._speedX < -this._speedXLimit) {
      this._speedX = -this._speedXLimit;
    }
  },

  isLimitY: true,
  isUpdateY: true,
  resetUpdateY: true,
  calcY: function (dt) {
    if (!this.isUpdateY) {
      if (this.resetUpdateY) {
        this.isUpdateY = true;
      }
      return;
    }
    this._speedY += (this._accY + (this._jumpSpeedProtect ? 0 : this._G)) * dt;
    if (this.isLimitY && this._speedY < this._speedYLimit) {
      this._speedY = this._speedYLimit;
    }
  },

  calcMoveDir: function () {
    this._moveDir = game.Logic.getMoveDirectionBySpeedX(this._speedX);
  },

  getCastPos: function (dt) {
    var pos = cc.p(
      this._pos.x + this._speedX * dt * this._speedScaleRate,
      this._pos.y + this._speedY * dt
    );

    if (pos.x < 96) {
      pos.x = 96;
    }
    if (pos.x > game.Data.mapRightEdge) {
      pos.x = game.Data.mapRightEdge;
    }
    if (this._isJumpLimitY && pos.y > this._jumpHeightLimitY) {
      pos.y = this._jumpHeightLimitY;
    }
    return pos;
  },

  calcDecay: function (dt) {
    if (this._accX > 0 && this._speedX < 0) {
      this.setMoveState(MoveState.Brake);
      this._speedX += this._decay * dt;
    } else if (this._accX < 0 && this._speedX > 0) {
      this.setMoveState(MoveState.Brake);
      this._speedX -= this._decay * dt;
    } else if (this._accX === 0 && this._speedX !== 0) {
      this.setMoveState(MoveState.Brake);
      if (this._speedX > 0) {
        this._speedX -= this._decay * dt;
        if (this._speedX <= 0) {
          this._speedX = 0;
        }
      } else {
        this._speedX += this._decay * dt;
        if (this._speedX >= 0) {
          this._speedX = 0;
        }
      }
    } else {
      this._isBrake = false;
    }
  },

  updateState: function () {
    if (this._speedY === 0) {
      if (!this._isJumping) {
        if (this._speedX === 0) {
          if (!this._isSmashing) {
            this.setMoveState(MoveState.Breath);
            this.setFaceTo(this._faceTo);
          }
        } else {
          this.setMoveState(MoveState.Moving);
        }
      }
    } else {
      this.setMoveState(this._speedY > 0 ? MoveState.JumpUp : MoveState.JumpDown);
    }
  },

  isDashing: function () {
    return game.Data.isPlayerDashing;
  },

  _jumpButtonReleased: false,
  _jumpSpeedProtect: false,
  _jumpTimeCounter: 0,
  _jumpTimeChecker: 0.2,
  _jumpHeightLimitY: 0,
  _isJumpLimitY: false,

  updateJumpCounter: function (dt) {
    this._jumpTimeCounter += dt;
    if (this._jumpTimeCounter > 0.15) {
      this.stopJumpCounter();
      this._accY = 0;
      if (this._jumpButtonReleased) {
        this._speedY = this._jumpAccYmini;
      }
      return;
    }

    if (this._jumpTimeCounter > 0.05) {
      if (this._isBounce) {
        this.stopJumpCounter();
      } else {
        this._speedY = game.Data.playerYJumpSpeed - 0.05 * this._jumpTimeCounter * 2000;
        this._accY = this._jumpAccY;
      }
      this._isJumpLimitY = true;
      this.rootNode.setScaleY(1);
      this.rootNode.setPosition(cc.p(0, 0));
    }
  },

  startJumpCounter: function () {
    if (this._isBounce) {
      return;
    }
    this.stopJumpCounter(true);
    this._jumpSpeedProtect = true;
    this._jumpButtonReleased = false;
    this._jumpTimeChecker = 0.3;
    this._jumpTimeCounter = 0;
    vee.Audio.playEffect(res.inGame_action_jump_mp3);
    // The jump counter is advanced from updatePos so it still works if nodeBox is paused.
    this.startUpdate();
  },

  stopJumpCounter: function (force) {
    if (this._jumpTimeCounter <= 0.05 && !force) {
      return;
    }
    if (vee.Utils && vee.Utils.unscheduleAllCallbacksForTarget && this.nodeBox) {
      vee.Utils.unscheduleAllCallbacksForTarget(this.nodeBox);
    }
    this._jumpTimeCounter = 0;
    this._jumpSpeedProtect = false;
  },

  copyPlayerState: function (player) {
    this.setElePosition(player.getElePosition());
    this._speedX = player._speedX;
    this._speedY = player._speedY;
    this._accX = player._accX;
    this._accY = player._accY;
    this._speedXLimit = player._speedXLimit;
    this._speedYLimit = player._speedYLimit;
    this._jumpCount = player._jumpCount;
    this._offsetX = player._offsetX;
    this._offsetY = player._offsetY;
    this._G = player._G;
    this._decay = player._decay;
    this._moveState = player._moveState;
    this._isJumping = player._isJumping;
    this._isBrake = player._isBrake;
    this._isBounce = player._isBounce;
    this._isFlying = player._isFlying;
    this._isTeleport = player._isTeleport;
    this._lastPosition = player._lastPosition;
    this._grid = cc.p(player._grid.x, player._grid.y);
    this._lastGrid = player._lastGrid;
    this._faceTo = player._faceTo;
    this._moveDir = player._moveDir;
    this.pushedDir = player.pushedDir;
    this._isOver = player._isOver;
    this._holdingDir = player._holdingDir;
    this._safePos = player._safePos;
    this.isCanOperatByParkour = player.isCanOperatByParkour;
    this.setFaceTo(this._faceTo, true);
  },

  setMovingAnima: function () {
    if (game.Data && game.Data.isInParkour && game.Data.isInParkour() && this.AniTimeLine.run_fast) {
      var animMgr = this.rootNode && this.rootNode.animationManager;
      if (!animMgr || !animMgr._getSequenceId || animMgr._getSequenceId(this.AniTimeLine.run_fast) !== -1) {
        this.playAnimate(this.AniTimeLine.run_fast);
        return;
      }
    }
    if (this.isDashing()) {
      this.playAnimate(this.AniTimeLine.dash);
    } else {
      this.playAnimate(this.AniTimeLine.run);
    }
  },

  parkourMove: function () {
    if (!(game.Data && game.Data.isInParkour && game.Data.isInParkour())) {
      this.stopMove();
      return;
    }
    if (!this.isCanOperatByParkour) {
      this.stopMove();
      return;
    }
    this.showStreak();

    // In parkour levels the player auto-runs by the facing direction.
    // Direction-changing blocks update _faceTo first and then call parkourMove(),
    // so using _moveDir here keeps the old direction and breaks those blocks.
    if (this._moveState === MoveState.Hanged &&
        this.extendController && this.extendController.onMoveBtnDown) {
      this.extendController.onMoveBtnDown(
        this._faceTo === vee.Direction.Right ? vee.Direction.Left : vee.Direction.Right
      );
      return;
    }

    if (this._faceTo === vee.Direction.Right) {
      this.moveRight();
      this.setMovingAnima();
    } else if (this._faceTo === vee.Direction.Left) {
      this.moveLeft();
      this.setMovingAnima();
    }
  },

  startParkourRun: function () {
    if (!(game.Data && game.Data.isInParkour && game.Data.isInParkour())) {
      return false;
    }
    this.isCanOperatByParkour = true;
    if (!this._streak && !this._partice) {
      this.addMotionStreak(game.Data.playerHawk === true);
    } else {
      this.showStreak();
    }
    this.startUpdate();
    this.parkourMove();
    return true;
  }
});

ElePlayer.create = function (ccbName) {
  var node = cc.BuilderReader.load(ccbName);
  var container = cc.Node.create();
  container.addChild(node);
  node.controller.setContainerNode(container);
  node.controller.ccbName = ccbName;
  node.controller.ccbInit();
  return {
    container: container,
    controller: node.controller
  };
};

ElePlayer.transformTo = function (ccbName) {
  if (game.Data.oPlayerCtl.ccbName === ccbName) {
    return;
  }

  var controller = null;
  if (ElePlayer.tempPlayerCtl && ElePlayer.tempPlayerCtl.ccbName === ccbName) {
    controller = ElePlayer.tempPlayerCtl;
  } else {
    var created = ElePlayer.create(ccbName);
    game.Data.oLyGame.lyMap.addChild(created.container, 2);
    controller = created.controller;
  }

  controller.copyPlayerState(game.Data.oPlayerCtl);
  ElePlayer.tempPlayerCtl = game.Data.oPlayerCtl;
  game.Data.oPlayerCtl = controller;
};

ElePlayer.efxMarioGrow = function () {
  if (!ElePlayer.tempPlayerCtl) {
    return;
  }
  game.Data.oLyGame.pauseGame(true);
  game.Data.oPlayerCtl._container.resume();
  ElePlayer.tempPlayerCtl._container.resume();
  game.Data.oPlayerCtl._container.stopAllActions();
  ElePlayer.tempPlayerCtl._container.stopAllActions();
  ElePlayer.tempPlayerCtl.setMoveState(game.Data.oPlayerCtl._moveState);
  game.Data.oPlayerCtl._container.setVisible(true);
  game.Data.oPlayerCtl._container.runAction(cc.blink(0.5, 5));
  ElePlayer.tempPlayerCtl._container.setVisible(false);
  ElePlayer.tempPlayerCtl._container.runAction(cc.sequence(
    cc.delayTime(0.05),
    cc.callFunc(function () {
      ElePlayer.tempPlayerCtl._container.setVisible(true);
    }),
    cc.blink(0.4, 4),
    cc.callFunc(function () {
      ElePlayer.tempPlayerCtl._container.setVisible(false);
      cc.log("ctl name = " + ElePlayer.tempPlayerCtl.ccbName);
      game.Data.oLyGame.resumeGame();
    }),
    cc.delayTime(1),
    cc.callFunc(function () {
      cc.log("ctl name = " + ElePlayer.tempPlayerCtl.ccbName);
      cc.log("visible state = " + ElePlayer.tempPlayerCtl._container.isVisible());
    })
  ));
};

ElePlayer.efxMarioShrink = function () {
  if (!ElePlayer.tempPlayerCtl) {
    return;
  }
  game.Data.oLyGame.pauseGame(true);
  game.Data.oPlayerCtl._container.resume();
  ElePlayer.tempPlayerCtl._container.resume();
  game.Data.oPlayerCtl._container.stopAllActions();
  ElePlayer.tempPlayerCtl._container.stopAllActions();
  game.Data.oPlayerCtl._container.setVisible(true);
  game.Data.oPlayerCtl._container.runAction(cc.blink(1, 5));
  ElePlayer.tempPlayerCtl._container.setVisible(false);
  ElePlayer.tempPlayerCtl._container.runAction(cc.sequence(
    cc.delayTime(0.1),
    cc.callFunc(function () {
      ElePlayer.tempPlayerCtl._container.setVisible(true);
    }),
    cc.blink(0.8, 4),
    cc.callFunc(function () {
      ElePlayer.tempPlayerCtl._container.setVisible(false);
      ElePlayer.tempPlayerCtl.setMoveState(MoveState.Breath);
      ElePlayer.tempPlayerCtl.playAnimate("huxi_1");
      ElePlayer.tempPlayerCtl._container.stopAllActions();
      cc.log("ctl name = " + ElePlayer.tempPlayerCtl.ccbName);
      cc.log("visible states = " + ElePlayer.tempPlayerCtl._container.isVisible());
      game.Data.oLyGame.resumeGame();
      game.Data.oPlayerCtl.hurtInvisible();
    })
  ));
};

ElePlayer.tempPlayerCtl = null;
