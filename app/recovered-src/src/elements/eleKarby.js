// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/elements/eleKarby.dis
var EleKarby = ElePlayer.extend({
  _isFat: false,
  updateJumpCounter: function (arg0) {
    this._jumpTimeCounter += arg0;
    if (this._isFat) {
      if (this._jumpTimeCounter > 0.05) {
        this.stopJumpCounter();
        this._speedY = 500;
        this._isJumpLimitY = false;
        this.rootNode.setScaleY(1);
        this.rootNode.setPosition(cc.p(0, 0));
      }
      return;
    }
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
        this._speedY = game.Data.playerYJumpSpeed;
        this._accY = this._jumpAccY;
      }
      this.rootNode.setScaleY(1);
      this.rootNode.setPosition(cc.p(0, 0));
    }
  },
  setFat: function (arg0) {
    this._isFat = arg0;
    if (arg0) {
      this._speedXLimit = 250;
      this.setMoveState(MoveState.Inhaled);
    } else {
      this._speedXLimit = game.Data.playerXSpeedLimit;
    }
  },
  BButton: function (arg0) {
    if (this._isFat) {
      if (!arg0 && this._moveState !== MoveState.Spit) {
        this.setMoveState(MoveState.Spit);
        ItemSpitStar.create(this.getElePosition(), this.getFaceToNumber());
      }
      return;
    }
    if (this._isJumping) {
      return;
    }
    if (arg0) {
      this.stopSucking();
      this._moveState = MoveState.Breath;
      this.playAnimate("huxi");
      this._freezeMoveButton = false;
    } else {
      this.setMoveState(MoveState.InhalePrepare);
      this._freezeMoveButton = true;
      this._accX = 0;
    }
  },
  feed: function () {
    this.setMoveState(MoveState.Inhaled);
    this.setFat(true);
    this.stopSucking();
  },
  setMoveState: function (arg0) {
    if (this._moveState === arg0) {
      return;
    }
    if (this._isBrake && arg0 === MoveState.Moving) {
      return;
    }
    if (this._isJumping && arg0 === MoveState.Brake) {
      return;
    }
    if (this._isBounce) {
      return;
    }
    switch (arg0) {
      case MoveState.Breath:
        if (this._isBrake || this.isInhaling() || this._moveState === MoveState.Spit) {
          return;
        }
        if (this._isFat) {
          this.playAnimate("huxi_fat");
        } else {
          this.playAnimate("huxi");
        }
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
        this._freezeMoveButton = false;
        this._moveState = null;
        if (this._isFat) {
          this.playAnimate(this.AniTimeLine.dash_stop);
        } else {
          this.playAnimate("fast_run_stop2");
        }
        break;
      case MoveState.Moving:
        if (this.isInhaling() || this._moveState === MoveState.Spit) {
          return;
        }
        this.rootNode.stopAllActions();
        if (this._isFat) {
          this.playAnimate(this.AniTimeLine.run + "_fat");
        } else {
          this.playAnimate(this.AniTimeLine.run);
        }
        break;
      case MoveState.Brake:
        if (this.isInhaling() || this._moveState === MoveState.Spit) {
          return;
        }
        this.setFaceTo(this._faceTo, true);
        this._isBrake = true;
        this.playAnimate(this.AniTimeLine.run_brake);
        break;
      case MoveState.JumpUp:
        if (this._isFat) {
          this.playAnimate("jump_fat");
        } else {
          this.playAnimate(this.AniTimeLine.jump_up);
        }
        break;
      case MoveState.JumpDown:
        if (this._isSmashing) {
          return;
        }
        if (this._isFat) {
          this.playAnimate("jump_down_fat");
        } else {
          this.playAnimate(this.AniTimeLine.jump_down);
        }
        break;
      case MoveState.DashJumpUp:
        this.playAnimate(this.AniTimeLine.dash_jump_up);
        break;
      case MoveState.DashJumpDown:
        this.playAnimate(this.AniTimeLine.dash_jump_down);
        break;
      case MoveState.InhalePrepare:
        this.playAnimate(this.AniTimeLine.inhale_ready, function () {
          this.setMoveState(MoveState.Inhaling);
        }.bind(this));
        break;
      case MoveState.Inhaling:
        this.playAnimate(this.AniTimeLine.inhale_loop);
        this.startSucking();
        break;
      case MoveState.Inhaled:
        this.playAnimate(this.AniTimeLine.inhale_end, function () {
          this._freezeMoveButton = false;
          this._moveState = MoveState.Breath;
          if (this._isFat) {
            this.playAnimate("huxi_fat");
          } else {
            this.playAnimate("huxi");
          }
        }.bind(this));
        break;
      case MoveState.Spit:
        this._freezeMoveButton = true;
        this.playAnimate(this.AniTimeLine.spit, function () {
          this.setFat(false);
          this._moveState = MoveState.Breath;
          this.playAnimate("huxi");
          this._freezeMoveButton = false;
        }.bind(this));
        break;
    }
    this._moveState = arg0;
  },
  _arrSuckedObj: null,
  _arrSuckMap: null,
  startSucking: function () {
    vee.Utils.scheduleCallbackForTarget(this._container, this.updateSucking.bind(this));
    this._arrSuckedObj = [];
    this._mapDangerArea = vee.Map.create(game.Logic._tmxMapSize, game.Logic._tmxTileSize);
    var local0 = this.getFaceToNumber();
    var local1 = null;
    for (var local2 = -1; local2 < 2; local2++) {
      for (var local3 = 1; local3 < 4; local3++) {
        local1 = cc.p(this._grid.x + local0 * local3, this._grid.y + local2);
        var local4 = game.Logic.getTileInfoAt(local1);
        if (local4 && local4.type === game.ObjectType.Block) {
          break;
        }
        this._mapDangerArea.setObject(true, local1);
      }
    }
  },
  stopUpdateSucking: function () {
    vee.Utils.unscheduleAllCallbacksForTarget(this._container);
  },
  stopSucking: function () {
    vee.Utils.unscheduleAllCallbacksForTarget(this._container);
    if (this._arrSuckedObj) {
      for (var local0 = this._arrSuckedObj.length, local1 = 0; local1 < local0; local1++) {
        this._arrSuckedObj[local1].releaseObj();
      }
      this._arrSuckedObj = null;
    }
    this._arrSuckMap = null;
  },
  updateSucking: function () {
    game.Logic.dynamicObjMap.forEachObjects(function (arg0) {
      if (this._mapDangerArea.getObject(arg0._grid)) {
        var local0 = arg0.getInhaleController();
        if (local0) {
          local0.inhaleObj();
          this._arrSuckedObj.push(local0);
        }
      }
    }.bind(this));
    var local0 = this.getFaceToNumber();
    var local1 = null;
    for (var local2 = -1; local2 < 2; local2++) {
      for (var local3 = 1; local3 < 4; local3++) {
        local1 = cc.p(this._grid.x + local0 * local3, this._grid.y + local2);
        if (!this._mapDangerArea.getObject(local1)) {
          break;
        }
        var local4 = game.Logic.objMap.getObject(local1);
        if (local4 && local4._eleType === game.EleType.Item) {
          game.Logic.removeMapExObjectByGrid(local1);
          game.Logic.objMap.removeObject(local1);
          local4.setDynamic(0, 0);
        }
      }
    }
  },
  randomBreath: function () {
  },
  isInhaling: function () {
    if (this._moveState === MoveState.InhalePrepare || this._moveState === MoveState.Inhaling || this._moveState === MoveState.Inhaled) {
      return true;
    }
    return false;
  }
});
