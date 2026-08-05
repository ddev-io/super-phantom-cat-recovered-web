var EnemySusliks = Enemy.extend({
  objType: game.ObjectType.Susliks,
  needRefreshPos: false,

  resetStatus: function () {
    this.needRefreshPos = false;
  },

  show: function () {
    this.playAnimate("in");
    this.initPosition(this._container.getPosition());
  },

  disappear: function () {
    this._hasCollide = false;
    vee.Utils.unscheduleAllCallbacksForTarget(this.rootNode);
    EnemySusliks.disappearCount++;

    var hide = function () {
      this._container.setVisible(false);
    }.bind(this);

    if (EnemySusliks.disappearCount === EnemySusliks.arrSusliks.length) {
      EnemySusliks.removeAllSusliks();
      this.playAnimate("out", hide);
    } else {
      this.playAnimate("out", hide);
    }
  },

  setElePosition: function (pos) {
    this._container.setPosition(pos);
  },

  setDir: function (dir) {
    switch (dir) {
    case vee.Direction.Left:
      this._container.setRotation(-90);
      break;
    case vee.Direction.Right:
      this._container.setRotation(90);
      break;
    case vee.Direction.Bottom:
      this._container.setRotation(180);
      break;
    default:
      break;
    }
  },

  _hasCollide: true,

  collide: function (dir) {
    var player = game.Data.oPlayerCtl;
    if (game.Data.playerInvisible || !this._hasCollide) {
      return;
    }

    if (dir === vee.Direction.Top && player._speedY < 0 && !player.extendController) {
      EfxEnemyDie.show(this.getElePosition());
      this.popPlayerUp();
      this.costHP(dir);
      return;
    }

    if (game.Data.playerHawk) {
      game.Data.oLyGame.shake();
      this.dieAnimate(dir);
      return;
    }

    if (dir === vee.Direction.Bottom && player._speedY > 0) {
      EfxEnemyDie.show(this.getElePosition());
      player.upToBarrier();
      this.costHP(dir);
      return;
    }

    if (game.Data.playerInvisible) {
      return;
    }
    player.getShock(dir, true);
  },

  costHP: function (dir) {
    this._hasCollide = false;
    vee.Utils.unscheduleAllCallbacksForTarget(this.rootNode);
    this._container.stopAllActions();
    EnemySusliks.killCount++;
    EnemySusliks.disappearCount++;
    this.playAnimate("in2", function () {
      if (EnemySusliks.arrSusliks.length === EnemySusliks.killCount ||
          EnemySusliks.disappearCount === EnemySusliks.arrSusliks.length) {
        EnemySusliks.removeAllSusliks();
      } else {
        this.playAnimate("loop2");
      }
    }.bind(this));
  },

  hitByStar: function () {
    if (this._isOver) {
      return;
    }
    this.costHP();
  },

  getInhaleController: function () {
    return null;
  },

  die: function () {
    this.onDead();
    vee.Audio.playEffect("res/inGame_event_deathMonster_" + vee.Utils.randomInt(1, 6) + ".mp3");
    game.Data.removeUsingEnemy(this);
    this._container.stopAllActions();
    this._isOver = true;
    this._hasCollide = false;
    vee.Utils.unscheduleAllCallbacksForTarget(this.rootNode);

    if (this._container.isVisible()) {
      this.playAnimate("out", function () {
        this._container.removeFromParent();
      }.bind(this), false);
    } else {
      this._container.removeFromParent();
    }
  }
});

EnemySusliks.create = function (pos, dir) {
  var node = cc.BuilderReader.load(res.eleDiShu_ccbi);
  var container = new cc.Node();
  container.addChild(node);
  node.controller._container = container;
  node.controller.setDir(dir);
  container.setPosition(pos);
  return node.controller;
};

EnemySusliks.killCount = 0;
EnemySusliks.disappearCount = 0;
EnemySusliks.arrSusliks = null;

EnemySusliks.removeAllSusliks = function () {
  var list = this.arrSusliks || [];
  for (var i = 0; i < list.length; i++) {
    list[i].die();
  }
  EnemySusliks.arrSusliks = null;
  EnemySusliks.killCount = 0;
  EnemySusliks.disappearCount = 0;
};
