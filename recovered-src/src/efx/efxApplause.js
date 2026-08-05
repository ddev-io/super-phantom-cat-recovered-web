// Source-like reconstruction from smdis/efx/efxApplause.dis

var EfxApplause = vee.Class.extend({
  show: function () {
    if (this._isAnimating) {
      return;
    }
    this.playAnimate("open");
  },

  onExit: function () {
    EfxApplause.share = null;
  }
});

EfxApplause.show = function () {
  if (!EfxApplause.share) {
    var node = cc.BuilderReader.load(res.efx_applause_ccbi);
    game.Data.oLyGame.rootNode.addChild(node, 999);
    EfxApplause.share = node.controller;
  }
  EfxApplause.share.show();
};

EfxApplause.share = null;

EfxApplause.Analysis = {
  coinsInOneJump: 0,
  enemiesInOneJump: 0,
  distanceInOneJump: 0,
  heightInOneJump: 0,
  _conditions: [
    {
      coin: 0,
      enemy: 4,
      height: 0,
      distance: 0
    }
  ],
  _beginPos: null,

  onJump: function (pos) {
    if (this._beginPos) {
      return;
    }
    this.coinsInOneJump = 0;
    this.enemiesInOneJump = 0;
    this.distanceInOneJump = 0;
    this.heightInOneJump = 0;
    this._beginPos = pos;
  },

  onKillEnemy: function () {
    this.enemiesInOneJump++;
  },

  onGetCoin: function () {
    this.coinsInOneJump++;
  },

  onLand: function (pos) {
    if (!this._beginPos) {
      return;
    }
    this.distanceInOneJump = Math.abs(pos.x - this._beginPos.x);
    this.heightInOneJump = this._beginPos.y - pos.y;
    this._beginPos = null;
    this.checkConditions();
  },

  getBeginPos: function () {
    return this._beginPos;
  },

  addCondition: function (condition) {
    this._conditions.push(condition);
  },

  checkConditions: function () {
    var count = this._conditions.length;

    for (var i = 0; i < count; i++) {
      if (this.checkCondition(this._conditions[i])) {
        EfxApplause.show();
        break;
      }
    }

    for (var j = 1; j < count; j++) {
      this._conditions.pop();
    }
  },

  checkCondition: function (condition) {
    if (condition.coin > 0 && this.coinsInOneJump < condition.coin) {
      return false;
    }
    if (condition.enemy > 0 && this.enemiesInOneJump < condition.enemy) {
      return false;
    }
    if (condition.height > 0 && this.heightInOneJump < condition.height) {
      return false;
    }
    if (condition.height < 0 && this.heightInOneJump > condition.height) {
      return false;
    }
    if (condition.distance > 0 && this.distanceInOneJump < condition.distance) {
      return false;
    }
    return true;
  }
};

EfxApplause.Analysis.ApplauseCondition = {
  coin: 0,
  enemy: 0,
  height: 0,
  distance: 0
};

EfxApplause.addCondition = function (coin, enemy, height, distance) {
  EfxApplause.Analysis.addCondition({
    coin: coin || 0,
    enemy: enemy || 0,
    height: height || 0,
    distance: distance || 0
  });
};

Trigger.Applause = Trigger.extend({
  _isShow: false,

  func: function () {
    if (!this.name) {
      EfxApplause.show();
      return;
    }

    var values = this.name.split(",");
    EfxApplause.addCondition(values[0], values[1], values[2], values[3]);
  }
});

Trigger.ApplauseOnce = Trigger.extend({
  _isShow: false,

  func: function () {
    if (this._isShow) {
      return;
    }

    this._isShow = true;

    if (!this.name) {
      if (!this._isShow) {
        EfxApplause.show();
      }
      return;
    }

    var values = this.name.split(",");
    EfxApplause.addCondition(values[0], values[1], values[2], values[3]);
  }
});
