function _enemyGetSideAgainstPlayer(obj) {
  return obj.getElePosition().x > game.Data.oPlayerCtl.getElePosition().x ? vee.Direction.Left : vee.Direction.Right;
}

var EnemyArmorSlime = EnemyMushroom.extend({
  objType: game.ObjectType.ArmorSlime,
  _popPlayerHeightMax: 1500,
  _popPlayerHeight: 1500,
  rectSize: null,
  _shrink: false,

  bornWithPos: function () {
    this.rectSize = cc.size(this.boxSize.width, this.boxSize.height);
  },

  getEleRect: function () {
    var pos = this.getElePosition();
    return cc.rect(
      pos.x + this.boxOffset.x - this.boxSize.width / 2,
      pos.y + this.boxOffset.y - this.boxSize.height / 2,
      this.rectSize.width,
      this.rectSize.height
    );
  },

  collide: function (dir) {
    var player = game.Data.oPlayerCtl;
    if (player._isBounce || !this._hasCollide) {
      return;
    }

    if (dir === vee.Direction.Top) {
      this.popPlayerUp();
      EfxEnemyDie.show(this.getElePosition(), true);
      if (this._shrink) {
        this.playAnimate("defensehold", function () {
          this.reviveSlime();
        }.bind(this));
      } else {
        this._speedX = 0;
        this._accX = 0;
        this.setShrink(true);
        this.playAnimate("defense", function () {
          this.reviveSlime();
        }.bind(this));
      }
    }
  },

  setShrink: function (shrink) {
    this._shrink = shrink;
    if (this._shrink) {
      this.rectSize.height = 30;
      this._stopX = true;
    } else {
      this.rectSize.height = 70;
      this._stopX = false;
    }
  },

  checkCollide: function () {
    var selfRect = this.getEleRect();
    var playerRect = game.Data.oPlayerCtl.getEleRect();
    playerRect.x -= this._checkWidthOff;
    playerRect.width += this._checkWidthOff * 2;

    if (!cc.rectIntersectsRect(selfRect, playerRect)) {
      return;
    }

    var playerY = game.Data.oPlayerCtl.getElePosition().y;
    var topY = selfRect.y + selfRect.height / 2;
    var dy = playerY - topY;
    if (dy > this.rectSize.height / 2 + this.boxOffset.y && game.Data.oPlayerCtl._speedY < 0) {
      this.collide(vee.Direction.Top);
    }
  },

  hitByStar: function () {
  },

  moveLeft: function () {
    if (this._shrink) {
      return;
    }
    this.setFaceTo(vee.Direction.Left, true);
    this._accX = -this._accXForSet;
  },

  moveRight: function () {
    if (this._shrink) {
      return;
    }
    this.setFaceTo(vee.Direction.Right, true);
    this._accX = this._accXForSet;
  },

  reviveSlime: function () {
    this.playAnimate("revive", function () {
      this.playAnimate("run");
      this.setShrink(false);
      if (this._faceTo === vee.Direction.Left) {
        this.moveLeft();
      } else {
        this.moveRight();
      }
    }.bind(this));
  },

  dieEffect: function () {
    EfxEnemyDie.show(this.getElePosition());
    this._accX = 0;
    this._speedX = 0;
    this._isOver = true;
    this.playAnimate("die", function () {
      this.die();
    }.bind(this));
  },

  dieAnimate: function () {
    this.onKill();
    EfxEnemyDie.show(this.getElePosition());
    this._hasCollide = false;
    this._isOver = true;
    this.die();
  }
});

var EnemyArmorSlimeHawk = EnemyMushroom.extend({
  objType: game.ObjectType.ArmorSlimeHawk,

  collideInhale: function () {
    var player = game.Data.oPlayerCtl;
    if (game.Data.playerInvisible || player._isBounce) {
      return;
    }

    player.getShock(vee.Direction.revert(player._faceTo), true);
    this.onGridChanged();
  },

  collide: function (dir) {
    var player;

    if (game.Data.playerHawk) {
      game.Data.oLyGame.shake();
      this.die();
      return;
    }

    player = game.Data.oPlayerCtl;
    if ((game.Data.playerInvisible || player._isBounce) &&
        !(dir === vee.Direction.Top && player.isSmashing())) {
      return;
    }

    dir = _enemyGetSideAgainstPlayer(this);
    player.getShock(dir, true);
    this.setFaceTo(vee.Direction.revert(dir));
    this.onGridChanged();

    if (this._faceTo === vee.Direction.Left) {
      this.moveLeft();
    } else {
      this.moveRight();
    }
  },

  getInhaleController: function () {
    if (this.inhaleController) {
      return null;
    }

    this.inhaleController = new InhaleDamageObj();
    this.inhaleController.obj = this;
    return this.inhaleController;
  },

  hitByStar: function () {
  },

  checkCollide: function () {
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
  }
});
