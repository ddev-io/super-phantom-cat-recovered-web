function _enemyGetSideAgainstPlayer(obj) {
  return obj.getElePosition().x > game.Data.oPlayerCtl.getElePosition().x ? vee.Direction.Left : vee.Direction.Right;
}

var EnemyCannon = EnemyMushroom.extend({
  objType: game.ObjectType.Cannon,
  spHead: null,
  nodeCannon: null,
  _cannonReady: false,
  _ready: false,
  _loopEfx: null,
  _cannonResetPending: false,

  onCreate: function () {
    this.boxOffset = this.nodeBox.getPosition();
    this.boxSize = this.nodeBox.getContentSize();
  },

  resetStatus: function () {
    this._cannonReady = false;
    this._ready = false;
    this._stopX = false;
    this._hasCollide = true;
    this._isOver = false;
    this._cannonResetPending = false;
    this.playAnimate("run");
    this.nodeCannon.setRotation(0);
  },

  transform: function () {
    this._ready = false;
    this.playAnimate("ready", function () {
    }.bind(this));
    this._ready = true;
    if (this.spHead) {
      this.spHead.setVisible(false);
    }
    this._cannonReady = true;
  },

  checkSpicalRole: function () {
    if (game.Data.checkIsMidAutumn && game.Data.checkIsMidAutumn()) {
      this.spHead.setTexture(game.AvatarData.getAvatarData(12).cannonHeadName);
      return true;
    }
    if (game.Data.checkIsHolloween && game.Data.checkIsHolloween()) {
      this.spHead.setTexture(game.AvatarData.getAvatarData(13).cannonHeadName);
      return true;
    }
    if (game.Data.checkIsThanksgiving && game.Data.checkIsThanksgiving()) {
      this.spHead.setTexture(game.AvatarData.getAvatarData(14).cannonHeadName);
      return true;
    }
    return false;
  },

  _reloaded: false,

  reload: function () {
    if (!this._ready) {
      return;
    }

    this._reloaded = true;
    this._cannonResetPending = false;
    game.Data.playerInvisible = true;
    game.Data.playerInCannon = true;

    var player = game.Data.oPlayerCtl;
    if (!player) {
      return;
    }

    if (player._container && player._container.stopAllActions) {
      player._container.stopAllActions();
    }
    if (player.elf && player.elf.hide) {
      player.elf.hide();
    }

    this.playAnimate("ready_in");
    if (this.spHead) {
      this.spHead.setVisible(true);
      this.spHead.setScaleX(player._faceTo === vee.Direction.Left ? 1 : -1);
    }

    if (game.Data.playerHawk) {
      var animation = new cc.Animation();
      for (var i = 1; i < 5; i += 1) {
        var frame = cc.spriteFrameCache.getSpriteFrame("hero_head_0_cat_" + i + ".png");
        if (frame) {
          animation.addSpriteFrame(frame);
        }
      }
      animation.setDelayPerUnit(1 / 30);
      animation.setRestoreOriginalFrame(false);
      animation.setLoops(9999);
      this.animate = cc.animate(animation);
      if (this.spHead) {
        this.spHead.runAction(this.animate);
      }
    } else if (!this.checkSpicalRole()) {
      this.spHead.setTexture(game.AvatarData.getCurrentAvatar().cannonHeadName);
    }

    this.setFaceTo(vee.Direction.Right, true);
    player.extendController = this;
    if (player._container) {
      player._container.setVisible(false);
    }
    player.setElePosition(this.getElePosition());
    game.Data.cameraXPos -= player._offsetX;
    game.Data.cameraYPos -= player._offsetY;
    game.Data.cameraXrevived = false;
    player._speedX = 0;
    player._speedY = 0;
  },

  onAButton: function () {
    if (!this._reloaded) {
      return;
    }

    var data = game.Data;
    var player = data.oPlayerCtl;
    if (!player) {
      return;
    }

    if (player.elf && player.elf.show) {
      player.elf.show();
    }
    this._hasCollide = false;
    this._alreadyRotate = false;
    this._cannonResetPending = true;
    this._stopRotateSchedule();

    if (this.spHead) {
      this.spHead.setVisible(false);
    }
    data.playerInvisible = false;
    data.playerInCannon = false;
    player._isFlying = true;
    player.extendController = null;
    if (player._container) {
      player._container.setVisible(true);
    }
    player.setElePosition(this.getElePosition());

    var angle = this.nodeCannon.getRotation();
    var efx = EfxCannonShoot.show(angle);
    if (this.rootNode && efx) {
      this.rootNode.addChild(efx);
    }

    var velocity = vee.Utils.getPointWithAngle(cc.p(0, 0), 2000, angle);
    player._accX = 0;
    player._speedX = -velocity.x;
    player._speedY = velocity.y < 1750 ? 1750 : velocity.y;
    player._isJumpLimitY = false;
    player.setFaceTo(this._agl > 0 ? vee.Direction.Left : vee.Direction.Right);

    if (data.oLyGame && data.oLyGame._holdLeft) {
      player.moveLeft();
    } else if (data.oLyGame && data.oLyGame._holdRight) {
      player.moveRight();
    }

    this.playAnimate("attack", false);
    vee.Audio.stopEffect(this._loopEfx);

    if (data.playerType !== game.PlayerType.Normal && data.oLyGame && data.oLyGame.showControlButton) {
      data.oLyGame.showControlButton(LyGame.ControlButtonType.ActionButton);
    }

    // В оригинале runCannon вызывается callback-ом из CCB-анимации attack.
    // После восстановления callback иногда теряется, из-за этого робот остаётся
    // в состоянии attack/hidden. Fallback ниже безопасен: runCannon идемпотентен.
    vee.Utils.scheduleOnceForTarget(this._container, function () {
      this.runCannon();
    }.bind(this), 0.45);
  },

  runCannon: function () {
    if (!this._cannonResetPending && !this._reloaded) {
      return;
    }
    this._reloaded = false;
    this._cannonResetPending = false;
    this.resetStatus();
    if (this._faceTo === vee.Direction.Right) {
      this.moveRight();
    } else {
      this.moveLeft();
    }
    this.onGridChanged();
  },

  resetGun: function () {
    this.nodeCannon.runAction(cc.rotateTo(1, 0));
  },

  showDust: function () {
    EfxDust.show(this.getElePosition(), DustType.ForceJumpDust);
  },

  touchGround: function () {
  },

  _alreadyRotate: false,
  _rotateDir: vee.Direction.Origin,
  hitByStar: null,
  _rotateSpeed: 30,
  _agl: 0,
  _aglLimit: 30,
  _rotateTarget: null,
  _rotateCallback: null,

  _startRotateSchedule: function () {
    if (!vee.Utils || !vee.Utils.scheduleCallbackForTarget) {
      return;
    }
    if (!this._rotateCallback) {
      this._rotateCallback = this.updateRotate.bind(this);
    }
    this._rotateTarget = this._rotateTarget || this;
    if (vee.Utils.unscheduleCallbackForTarget) {
      vee.Utils.unscheduleCallbackForTarget(this._rotateTarget, this._rotateCallback);
    }
    vee.Utils.scheduleCallbackForTarget(this._rotateTarget, this._rotateCallback, 0);
  },

  _stopRotateSchedule: function () {
    if (this._rotateTarget && this._rotateCallback && vee.Utils && vee.Utils.unscheduleCallbackForTarget) {
      vee.Utils.unscheduleCallbackForTarget(this._rotateTarget, this._rotateCallback);
    } else if (this._rotateTarget && vee.Utils && vee.Utils.unscheduleAllCallbacksForTarget) {
      vee.Utils.unscheduleAllCallbacksForTarget(this._rotateTarget);
    }
  },

  onMoveBtnDown: function (dir) {
    var speed = 0;
    if (dir === vee.Direction.Left) {
      speed = -30;
    } else if (dir === vee.Direction.Right) {
      speed = 30;
    }
    if (!speed) {
      this.onMoveBtnUp();
      return;
    }

    if (this._rotateDir !== dir || this._rotateSpeed !== speed) {
      this._rotateDir = dir;
      this._rotateSpeed = speed;
      if (this.spHead) {
        this.spHead.setScaleX(this._rotateSpeed < 0 ? -1 : 1);
      }
    }
    if (this._alreadyRotate) {
      return;
    }
    cc.log && cc.log("start rotate");
    this._alreadyRotate = true;
    // Do not unschedule everything on _container: that target is also used by
    // animations/reset callbacks after recovery and it can stop the cannon.
    this._startRotateSchedule();
  },

  onMoveBtnUp: function () {
    this._alreadyRotate = false;
    this._rotateDir = vee.Direction.Origin;
    this._stopRotateSchedule();
  },

  updateRotate: function (dt) {
    if (!this.nodeCannon || !this.nodeCannon.getRotation || !this.nodeCannon.setRotation) {
      return;
    }
    dt = Number(dt);
    if (!dt || !isFinite(dt) || dt <= 0) {
      dt = 1 / 60;
    }
    if (dt > 0.05) {
      dt = 0.05;
    }
    this._agl = this._rotateSpeed * dt + this.nodeCannon.getRotation();
    this._agl = this._agl > this._aglLimit ? this._aglLimit : this._agl;
    this._agl = this._agl < -this._aglLimit ? -this._aglLimit : this._agl;
    this.nodeCannon.setRotation(this._agl);
  },

  checkCollide: function () {
    if (!this._hasCollide) {
      return;
    }

    var selfRect = this.getEleRect();
    var player = game.Data.oPlayerCtl;
    if (!player) {
      return;
    }
    var playerRect = player.getEleRect();
    if (!cc.rectIntersectsRect(selfRect, playerRect)) {
      return;
    }

    var playerY = player.getElePosition().y;
    var playerRect2 = player.getEleRect();
    var selfPos = this.getElePosition();
    var selfY = selfPos.y;

    if (selfY <= playerY) {
      var dy = playerY - selfY;
      if (dy > this.boxSize.height / 2 + this.boxOffset.y) {
        if (player._speedY < 0) {
          this.collide(vee.Direction.Top);
        }
      } else if (selfPos.x > playerRect2.x && selfPos.x < playerRect2.x + playerRect2.width) {
        if (playerRect2.x + playerRect2.width / 2 > selfPos.x) {
          this.collide(vee.Direction.Right);
        } else {
          this.collide(vee.Direction.Left);
        }
      }
    } else if (selfPos.x > playerRect2.x && selfPos.x < playerRect2.x + playerRect2.width) {
      this.collide(vee.Direction.Bottom);
    }
  },

  collide: function (dir) {
    if (!this._hasCollide) {
      return;
    }

    var player = game.Data.oPlayerCtl;
    if (dir === vee.Direction.Top && player && player._speedY < 0 && !player.extendController) {
      this._speedX = 0;
      this._accX = 0;
      this._stopX = true;
      this.transform();
      this.reload();
      if (game.Data.oLyGame && game.Data.oLyGame.hideControlButton) {
        game.Data.oLyGame.hideControlButton(LyGame.ControlButtonType.ActionButton);
      }
      return;
    }
  },

  dieEffect: function () {
  },

  getInhaleController: function () {
    return null;
  },

  moveLeft: function () {
    if (this._reloaded) {
      return;
    }
    this._container.setScaleX(1);
    this.setFaceTo(vee.Direction.Left, true);
    this._accX = -this._accXForSet;
  },

  moveRight: function () {
    if (this._reloaded) {
      return;
    }
    this._container.setScaleX(1);
    this.setFaceTo(vee.Direction.Right, true);
    this._accX = this._accXForSet;
  }
});

var EfxCannonShoot = vee.Class.extend({
  nodeCannon: null,
  ps1: null,
  ps2: null,
  ps3: null,

  onCreate: function () {
    this.playAnimate("attack", function () {
      this.rootNode.removeFromParent();
    }.bind(this));
  },

  ccbInit: function () {
    this.ps1.setPositionType(1);
    this.ps2.setPositionType(1);
    this.ps3.setPositionType(1);
  },

  setAngle: function (angle) {
    this.nodeCannon.setRotation(angle);
  }
});

EfxCannonShoot.show = function (angle) {
  var node = cc.BuilderReader.load(res.eleLuoBo_Yan_ccbi);
  node.controller.setAngle(angle);
  node.controller.ccbInit();
  return node;
};
