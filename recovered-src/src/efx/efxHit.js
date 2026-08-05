// Source-like reconstruction from smdis/efx/efxHit.dis

var EfxHit = vee.Class.extend({
  psStar1: null,
  psStar2: null,

  onCreate: function () {
    this.playAnimate("Show", function () {
      this.rootNode.removeFromParent();
    }.bind(this));
  }
});

EfxHit.create = function (pos, direction) {
  var node = cc.BuilderReader.load(res.efx_hit_enemy_ccbi);

  if (node.controller.psStar1) {
    node.controller.psStar1.setPositionType(1);
  }
  if (node.controller.psStar2) {
    node.controller.psStar2.setPositionType(1);
  }

  var offset = vee.Direction.direction2Point(direction);
  offset.x *= game.Data.tileSizeWidth / 2;
  offset.y *= -(game.Data.tileSizeWidth / 2);

  if (offset.x) {
    offset.x += offset.x > 0 ? -20 : 20;
  }
  if (offset.y) {
    offset.y += offset.y > 0 ? -20 : 20;
  }

  node.setPosition(vee.Utils.pAdd(pos, offset));
  game.Data.oLyGame.lyMap.addChild(node, 8);
  return node;
};

var EfxHitBlock = {};

EfxHitBlock.create = function (pos, direction) {
  var node = cc.BuilderReader.load(res.efx_hit_block_ccbi);

  if (node.controller.psStar1) {
    node.controller.psStar1.setPositionType(1);
  }
  if (node.controller.psStar2) {
    node.controller.psStar2.setPositionType(1);
  }

  var offset = vee.Direction.direction2Point(direction);
  offset.x *= TILE_WIDTH_HALF + 6;
  offset.y *= -TILE_WIDTH_HALF - 6;

  node.setPosition(vee.Utils.pAdd(pos, offset));
  game.Data.oLyGame.lyMap.addChild(node, 8);
  return node;
};

var EfxBulletShoot = {};

EfxBulletShoot.create = function (pos, direction, parent) {
  var node = cc.BuilderReader.load(res.efx_PlayerAttack_ccbi);
  var offset = vee.Direction.direction2Point(direction);

  node.setScaleX(offset.x);
  offset.x *= game.Data.tileSizeWidth / 2;
  offset.y *= -(game.Data.tileSizeWidth / 2);

  if (offset.x) {
    offset.x += offset.x > 0 ? 5 : -5;
  }
  if (offset.y) {
    offset.y += offset.y > 0 ? 5 : -5;
  }

  node.setPosition(offset);
  parent.addChild(node, 8);
  return node;
};

var EfxTeleportDust = {};

EfxTeleportDust.create = function (pos, direction) {
  var node = cc.BuilderReader.load(res.efx_PlayerShunYi_LiZi_ccbi);
  node.controller.ps1.setPositionType(1);

  var offset = vee.Direction.direction2Point(direction);
  node.setScaleX(offset.x);
  offset.x *= game.Data.tileSizeWidth / 2;
  offset.y *= -(game.Data.tileSizeWidth / 2);

  if (offset.x) {
    offset.x += offset.x > 0 ? 5 : -5;
  }
  if (offset.y) {
    offset.y += offset.y > 0 ? 5 : -5;
  }

  node.setPosition(vee.Utils.pAdd(pos, offset));
  game.Data.oLyGame.lyMap.addChild(node, 8);
  return node;
};

var EfxGetBigCoin = EfxHit.extend({
  ps1: null,

  ccbInit: function () {
    this.ps1.setPositionType(1);
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

EfxGetBigCoin.create = function (pos) {
  var node = cc.BuilderReader.load(res.efx_EatBigCoin_Star_ccbi);

  if (node.controller.psStar) {
    node.controller.psStar.setPositionType(1);
  }

  node.setPosition(pos);
  node.controller.ccbInit();
  game.Data.oLyGame.lyMap.addChild(node, 8);
};
