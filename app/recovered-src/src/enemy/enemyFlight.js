function _enemyGetSideAgainstPlayer(obj) {
  return obj.getElePosition().x > game.Data.oPlayerCtl.getElePosition().x ? vee.Direction.Left : vee.Direction.Right;
}

var EnemyFlight = EnemyMushroom.extend({
  objType: game.ObjectType.Flight,
  _reloaded: false,
  _accXForSet: 300,
  spHead: null,

  resetStatus: function () {
    this._reloaded = false;
    this._hasCollide = true;
    this._isOver = false;
  },

  checkCollide: function () {
    if (!this._hasCollide) {
      return;
    }
    var selfRect = this.getEleRect();
    var playerRect = game.Data.oPlayerCtl.getEleRect();
    if (!cc.rectIntersectsRect(selfRect, playerRect)) {
      return;
    }

    var playerY = game.Data.oPlayerCtl.getElePosition().y;
    var selfY = this.getElePosition().y;
    if (selfY <= playerY) {
      var dy = playerY - selfY;
      if (dy > this.boxSize.height / 2 + this.boxOffset.y && game.Data.oPlayerCtl._speedY < 0) {
        this.collide(vee.Direction.Top);
        return;
      }
    }
    this.collide();
  },

  collide: function (dir) {
    if (game.Data.playerHawk) {
      game.Data.oLyGame.shake();
      this.hitByStar(dir);
      return;
    }
    if ((game.Data.playerInvisible || game.Data.oPlayerCtl._isBounce) && !(dir === vee.Direction.Top && !game.Data.oPlayerCtl.isSmashing())) {
      return;
    }
    game.Data.oPlayerCtl.getShock(_enemyGetSideAgainstPlayer(this), true);
  },

  reload: function () {
    var player = game.Data.oPlayerCtl;
    this._reloaded = true;
    this._hasCollide = false;
    this._speedX = 0;
    game.Data.playerInvisible = false;
    player.extendController = this;
    player.hide();
    player._speedX = 0;
    player._speedY = 0;
    player._accX = 0;
    player._accY = 0;
    player.needRefreshPos = false;
    player._hasG = false;
    player._hasCollide = false;
    player._needSafePos = false;
  },

  _touchCount: 0,

  touchGround: function (force) {
    if (this._touchCount >= 1 || force) {
      var player = game.Data.oPlayerCtl;
      this._reloaded = false;
      this._hasCollide = true;
      player.show();
      player.extendController = null;
      player.needRefreshPos = true;
      player._hasG = true;
      player._hasCollide = true;
      player._needSafePos = true;
      player.setElePosition(this.getElePosition());
      player.onGridChanged();
      player._speedY = 200;
      this._touchCount = 0;
    } else {
      this._touchCount++;
    }
  },

  touchGroundComplete: function () {
    this.touchGround(true);
  },

  afterUpdatePos: function () {
    if (this._reloaded) {
      game.Data.oPlayerCtl.setElePosition(this.getElePosition());
    }
  },

  onMoveBtnDown: function (dir) {
    if (!this._reloaded) {
      return;
    }
    if (dir === vee.Direction.Left) {
      this._accX = this._accXForSet;
      this._container.setScaleX(-1);
    } else if (dir === vee.Direction.Right) {
      this._accX = -this._accXForSet;
      this._container.setScaleX(1);
    }
  },

  onMoveBtnUp: function () {
    this._accX = 0;
  },

  onAButton: function () {
  },

  dieEffect: function () {
  },

  AILogic: function () {
  },

  AILogicPerFrame: function () {
  },

  leftToBarrier: function () {
    this._speedX = 0;
  },

  rightToBarrier: function () {
    this._speedX = 0;
  },

  hitByStar: function (dir) {
    if (this._isOver) {
      return;
    }
    this.dieAnimate(dir);
  }
});

var EfxUFO = vee.Class.extend({
  show: function () {
  }
});
