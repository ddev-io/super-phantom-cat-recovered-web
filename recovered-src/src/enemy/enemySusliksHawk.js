function _enemyGetSideAgainstPlayer(obj) {
  var player = game.Data && game.Data.oPlayerCtl;
  if (!player || !player.getElePosition) {
    return vee.Direction.Origin;
  }
  return obj.getElePosition().x > player.getElePosition().x ? vee.Direction.Left : vee.Direction.Right;
}

var EnemySusliksHawk = Enemy.extend({
  objType: game.ObjectType.SusliksHawk,
  _hasG: false,
  needRefreshPos: false,

  cutInAnimate: function () {
  },

  bornWithPos: function () {
    this.needRefreshPos = false;
    this._hasG = false;
    this.startIn();
  },

  getInhaleController: function () {
    return null;
  },

  hitByStar: function (dir) {
    if (this._isOver || !this._hasCollide) {
      return;
    }
    this.dieAnimate(dir);
  },

  startIn: function () {
    this._hasCollide = true;
    this.playAnimate("in", function () {
      this.playAnimate("loop");
      this.startHurt();
    }.bind(this));
  },

  startHurt: function () {
    this._container.runAction(cc.sequence(
      cc.delayTime(2),
      cc.callFunc(function () {
        this._hasCollide = false;
        this.playAnimate("out", function () {
          this.startHide();
        }.bind(this));
      }, this)
    ));
  },

  startHide: function () {
    this._container.runAction(cc.sequence(
      cc.delayTime(2),
      cc.callFunc(function () {
        this.startIn();
      }, this)
    ));
  },

  collide: function (dir) {
    var player = game.Data && game.Data.oPlayerCtl;
    if (!player || !player.getEleRect || !player.getElePosition) {
      return;
    }
    if (game.Data.playerHawk) {
      game.Data.oLyGame.shake();
      this.hitByStar();
      return;
    }

    var ignore = (game.Data.playerInvisible || player._isBounce) &&
      !(dir === vee.Direction.Top && !player.isSmashing());
    if (ignore) {
      return;
    }

    player.getShock(_enemyGetSideAgainstPlayer(this), true);
  },

  dieAnimate: function (dir) {
    this.onKill();
    EfxEnemyDie.show(this.getElePosition());
    this._container.stopAllActions();
    this._hasCollide = false;
    this._isOver = true;
    this.die();
  },

  getEleRect: function () {
    var pos = this.getElePosition();
    return cc.rect(
      pos.x + this.boxOffset.x - this.boxSize.width / 2,
      pos.y + this.boxOffset.y - this.boxSize.height / 2,
      this.boxSize.width,
      this.boxSize.height - 30
    );
  },

  checkCollide: function () {
    var player = game.Data && game.Data.oPlayerCtl;
    if (game.Data.playerInvisible || !this._hasCollide || !player || !player.getEleRect || !player.getElePosition) {
      return;
    }
    var selfRect = this.getEleRect();
    var playerRect = player.getEleRect();
    if (!cc.rectIntersectsRect(selfRect, playerRect)) {
      return;
    }

    var playerY = player.getElePosition().y;
    var selfY = this.getElePosition().y;
    if (selfY <= playerY) {
      var dy = playerY - selfY;
      if (dy > this.boxSize.height / 2 + this.boxOffset.y && player._speedY < 0) {
        this.collide(vee.Direction.Top);
        return;
      }
    }
    this.collide();
  }
});
