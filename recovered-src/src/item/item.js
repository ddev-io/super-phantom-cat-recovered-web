var Item = vee.Class.extend({
  nodeBox: null,
  boxOffset: null,
  boxSize: null,
  _eleType: game.EleType.Item,
  _objType: game.ObjectType.None,
  _container: null,
  _grid: null,
  _gridInMap: null,
  _layerBelong: 1,
  _speedX: 0,
  _speedY: 0,
  _accX: 0,
  _accY: 0,
  _speedXLimit: 500,
  _speedYLimit: -1300,
  _faceTo: vee.Direction.Right,
  _moveDir: vee.Direction.Origin,
  _decayX: 2200,
  _eleSize: null,
  _checkForDieW: 17,
  _type: null,
  onCreate: function () {
    this.resetBoxInfo();
    this.afterCreate();
    this.AILogic();
  },
  resetBoxInfo: function () {
    if (this.nodeBox) {
      this.boxOffset = this.nodeBox.getPosition();
      this.boxSize = this.nodeBox.getContentSize();
    } else {
      this.boxOffset = cc.p(0, 0);
      this.boxSize = cc.size(game.Data.tileSizeWidth, game.Data.tileSizeWidth);
    }
  },
  afterCreate: function () {
  },
  initPosition: function (arg0) {
    this._isOver = false;
    this._eleSize = this.rootNode.getContentSize();
    this.setElePosition(arg0);
    this.bornWithPos(arg0);
  },
  getElePosition: function () {
    return this._container.getPosition();
  },
  setGridInMap: function (arg0) {
    this._gridInMap = arg0;
  },
  _pos: null,
  setElePosition: function (arg0) {
    if (this._isOver) {
      return;
    }
    this._container.setPosition(arg0);
    this._grid = game.Logic.getTileGridByPos(arg0);
    this._pos = cc.p(arg0.x, arg0.y);
  },
  setContainerNode: function (arg0) {
    this._container = arg0;
  },
  setFaceTo: function (arg0, arg1) {
    if (this._faceTo === arg0 && !arg1) {
      return;
    }
    arg0 = arg0 || vee.Direction.Left;
    this._faceTo = arg0;
    if (arg0 === vee.Direction.Left) {
      this.rootNode.setScaleX(-1);
    } else {
      this.rootNode.setScaleX(1);
    }
  },
  jump: function () {
    if (!this._isJumping) {
      this._speedY = 12;
      this.setJumping(true);
    }
  },
  setJumping: function (arg0) {
    this._isJumping = arg0;
  },
  getEleRect: function () {
    var local0 = this.getElePosition();
    var local1 = cc.rect(
      local0.x + this.boxOffset.x - this.boxSize.width / 2,
      local0.y + this.boxOffset.y - this.boxSize.height / 2,
      this.boxSize.width,
      this.boxSize.height
    );
    return local1;
  },
  moveLeft: function () {
    this._faceTo = vee.Direction.Left;
    this._accX = -game.Data.playerXacc;
  },
  moveRight: function () {
    this._faceTo = vee.Direction.Right;
    this._accX = game.Data.playerXacc;
  },
  stopMove: function () {
    this._accX = 0;
  },
  leftToBarrier: function () {
  },
  rightToBarrier: function () {
  },
  upToBarrier: function () {
    this._speedY = 0;
    this._accY = 0;
  },
  downToBarrier: function () {
    this._speedY = 0;
    this._accY = 0;
  },
  disappear: function () {
    if (this._gridInMap) {
      game.Logic.objMap.setObject(null, this._gridInMap);
    }
    this._container.removeFromParent();
  },
  die: function () {
    this.onDead();
    this.inhaleController = null;
    this._isOver = true;
    if (this._gridInMap) {
      if (!this._staticItem) {
        game.Logic.dynamicObjMap.setObject(null, this._gridInMap);
      } else {
        game.Logic.objMap.setObject(null, this._gridInMap);
        game.Logic.removeMapExObjectByGrid(this._gridInMap);
      }
    }
    this._container.removeFromParent();
  },
  onDead: function () {
  },
  onGridChanged: function () {
    if (!this._grid || !this._lastGrid) {
      return;
    }
  },
  _isOver: false,
  _staticItem: true,
  _haveDecay: true,
  updatePos: function (arg0) {
    if (this._isOver) {
      return;
    }
    this.AILogicPerFrame(arg0);
    if (!this._staticItem) {
      this.calcX(arg0);
      var local0 = game.Logic.getMoveDirectionBySpeedX(this._speedX);
      this._moveDir = local0;
      this.calcY(arg0);
      this.refreshPosition(arg0);
    }
    this.checkCollide();
    if (this._speedY !== 0) {
      this.setJumping(true);
    }
    this.calcDecay(arg0);
    this.afterUpdatePos();
  },
  calcX: function (arg0) {
    this._speedX += this._accX * arg0;
    if (Math.abs(this._speedX) > this._speedXLimit) {
      var local0 = this._speedX > 0 ? 1 : -1;
      this._speedX = this._speedXLimit * local0;
    }
  },
  _hasG: true,
  calcY: function (arg0) {
    this._speedY += this._accY * arg0;
    if (this._hasG) {
      this._speedY += game.Data.G * arg0;
    }
    if (this._speedY < this._speedYLimit) {
      this._speedY = this._speedYLimit;
    }
  },
  _safePos: null,
  refreshPosition: function (arg0) {
    var local0 = cc.p(
      this.getElePosition().x + this._speedX * arg0,
      this.getElePosition().y + this._speedY * arg0
    );
    var local1 = game.Logic.getTileGridByPos(this.getElePosition());
    if (!this._lastGrid || local1.x !== this._lastGrid.x || local1.y !== this._lastGrid.y) {
      this.onGridChanged();
      this._lastGrid = local1;
    }
    this.setElePosition(game.Logic.safePos(local0, this));
  },
  _hasCollide: true,
  checkCollide: function () {
    if (!this._hasCollide || !game.Data.oPlayerCtl) {
      return;
    }
    var local0 = this.getEleRect();
    var local1 = game.Data.oPlayerCtl.getEleRect();
    if (cc.rectIntersectsRect(local0, local1)) {
      if (local0.y < local1.y) {
        var local2 = vee.Utils.pSub(this.getElePosition(), game.Data.oPlayerCtl.getElePosition());
        var local3 = local2.x / local2.y;
        if (local3 > -1.4 && local3 < 1.4) {
          this.collide(vee.Direction.Top);
        } else if (local1.x + game.Data.tileSizeWidth / 2 > this.getElePosition().x) {
          this.collide(vee.Direction.Right);
        } else {
          this.collide(vee.Direction.Left);
        }
      } else {
        this.collide(vee.Direction.Bottom);
      }
    }
  },
  calcDecay: function (arg0) {
    if (!this._staticItem && this._haveDecay) {
      if (this._speedY !== 0) {
        this.setJumping(true);
      }
      if (this._accX > 0 && this._speedX < 0) {
        this._speedX += this._decayX * arg0;
        return;
      }
      if (this._accX < 0 && this._speedX > 0) {
        this._speedX -= this._decayX * arg0;
        return;
      }
      if (this._accX === 0 && this._speedX !== 0) {
        if (this._speedX > 0) {
          this._speedX -= this._decayX * arg0;
          if (this._speedX <= 0) {
            this._speedX = 0;
          }
        } else if (this._speedX <= 0) {
          this._speedX += this._decayX * arg0;
          if (this._speedX >= 0) {
            this._speedX = 0;
          }
        }
      }
    }
  },
  isDashing: function () {
    return false;
  },
  inhaleController: null,
  getInhaleController: function () {
    if (this.inhaleController) {
      return null;
    }
    this.inhaleController = new InhaleObj();
    this.inhaleController.obj = this;
    return this.inhaleController;
  },
  getAte: function () {
    this.die();
  },
  setDynamic: function (arg0, arg1) {
    if (arg0 === undefined) {
      arg0 = 300;
    }
    if (arg1 === undefined) {
      arg1 = 0;
    }
    this._staticItem = false;
    this._haveDecay = false;
    this._speedX = arg0;
    this._speedY = arg1;
    this._tempSpeedY = arg1;
    game.Logic.dynamicObjMap.setObject(this, this._grid);
  },
  hitByStar: null,
  bornWithPos: function () {
  },
  AILogic: function () {
  },
  AILogicPerFrame: function () {
  },
  collide: function () {
  },
  afterUpdatePos: function () {
  },
  removeOnGridChange: function () {
  },
  collideEvent: function () {
  }
});
Item.createWithInfo = function (itemInfo, grid, gid) {
    var ccbName = null;

    switch (itemInfo.type) {
      case game.ObjectType.Coin:
        ccbName = game.Data.checkIs61() ? res.itemCoinChild_ccbi : res.itemCoin_ccbi;
        break;
      case game.ObjectType.BigCoin:
        ccbName = game.Data.checkIs61() ? res.itemBigCoinChild_ccbi : res.itemBigCoin_ccbi;
        break;
      case game.ObjectType.Egg:
        ccbName = res.itemEgg_ccbi;
        break;
      case game.ObjectType.Heart:
        ccbName = res.itemHeart_ccbi;
        break;
      case game.ObjectType.DynamicBlock:
        ccbName = res.itemDynamicBlock_ccbi;
        break;
      case game.ObjectType.MovingPlatform:
        ccbName = res.itemMovingPlatform_ccbi;
        break;
      case game.ObjectType.GravityPlatform:
        ccbName = res.itemGravityPlarform_ccbi;
        break;
      case game.ObjectType.FallingBlock:
        ccbName = res.itemFallingBlock_ccbi;
        break;
      case game.ObjectType.Fire:
        ccbName = res.itemFire_ccbi;
        break;
      case game.ObjectType.BoxSmash:
        ccbName = game.Data.curPlayerType === game.PlayerType.Smash ? false : res.itemEgg2_ccbi;
        break;
      case game.ObjectType.BoxBullet:
        ccbName = game.Data.curPlayerType === game.PlayerType.Bullet ? false : res.itemEgg2_ccbi;
        break;
      case game.ObjectType.BoxTeleport:
        ccbName = game.Data.curPlayerType === game.PlayerType.Teleport ? false : res.itemEgg2_ccbi;
        break;
      case game.ObjectType.BoxBomb:
        ccbName = game.Data.curPlayerType === game.PlayerType.Bomb ? false : res.itemEgg2_ccbi;
        break;
      case game.ObjectType.BoxHawk:
        ccbName = game.Data.curPlayerType === game.PlayerType.Hawk ? false : res.itemEgg2_ccbi;
        break;
      case game.ObjectType.Drawer:
        ccbName = res.itemDrawer_ccbi;
        break;
      case game.ObjectType.ReverseKey: {
        var selectedCategory = game.Data.selectedCategory;
        var selectedLevel = game.Data.selectedLevel;
        var moonUnlocked = game.Data.version.newVersion ? vee.data.moon : game.Data.isShowBtnWorld();
        var prerequisitePassed = game.Data.version.newVersion ?
          selectedCategory && selectedCategory.levels[0].isLevelPassed :
          selectedCategory && selectedCategory.levels[selectedCategory.levels.length - 1].isLevelPassed;
        var keyCollected = selectedLevel && selectedLevel.isLevelReverseKeyCollected();

        cc.log("isReverseWorldOpen: " + game.Data.isReverseWorldOpen);
        cc.log("levelPassd: " + prerequisitePassed);
        cc.log("levelKeyGot: " + keyCollected);
        cc.log("had open: " + moonUnlocked);

        if (game.Data.isReverseWorldOpen && prerequisitePassed && !keyCollected && moonUnlocked) {
          if ((game.Data.isAndroid || game.Data.version.isNewIosVersion) && game.Data.isFreeGame) {
            if (vee.data.moon) {
              ccbName = res.itemReverseKey_ccbi;
            }
          } else {
            ccbName = res.itemReverseKey_ccbi;
          }
        } else if (game.Data.isReverseWorldOpen && !keyCollected && grid) {
          vee.Utils.logObj(grid, "key grid");
          var tileData = game.Logic.getTileDataByGid(1, grid, gid);
          game.Logic.map.setObject(tileData, grid);
        } else {
          ccbName = false;
        }
        break;
      }
      case game.ObjectType.SavePoint:
        ccbName = res.savePoint_ccbi;
        break;
      case game.ObjectType.StageEnd:
        ccbName = res.efx_GamePiont_ccbi;
        break;
      case game.ObjectType.ScaleBlock:
        ccbName = res.itemScaleBlock_ccbi;
        break;
    }

    if (!ccbName) {
      return null;
    }

    if (itemInfo.type === game.ObjectType.Coin && game.Data.itemCoinPool.length > 0) {
      var pooledCoin = game.Data.itemCoinPool.shift();
      pooledCoin._container.setVisible(true);
      return {
        container: pooledCoin._container,
        controller: pooledCoin
      };
    }

    var node = cc.BuilderReader.load(ccbName);
    var container = cc.Node.create();
    container.addChild(node);
    node.controller.setContainerNode(container);
    node.controller._objType = itemInfo.type;

    if (node.controller.inMapBack) {
      game.Data.oLyGame.lyMapBack.addChild(container);
    } else {
      game.Data.oLyGame.lyMap.addChild(container);
    }

    return {
      container: container,
      controller: node.controller
    };
  };
Item.createDynamicCoin = function (pos, speedX, speedY) {
    var item = Item.createWithType(game.ObjectType.Coin);
    item.controller.initPosition(pos);
    item.controller.setDynamic(speedX, speedY);
    item.controller._hasG = true;
    return {
      container: item.container,
      controller: item.controller
    };
  };
var ItemCoin = Item.extend({
  _type: game.ObjectType.Coin,
  _tempSpeedY: 600,
  spCoin: null,
  spParticle: null,
  afterCreate: function () {
    this.spParticle.getTexture().setAliasTexParameters();
    ItemCoin.pool.push(this);
  },
  onShow: function () {
    this.spParticle.setRotation((10 * vee.Utils.randomInt(0, 36)));
  },
  bornWithPos: function () {
    this.refreshCoinFrame();
  },
  refreshCoinFrame: function () {
    if (game.Data.checkIs61()) {
      return;
    }
    var frameName = ItemCoin.coinFrameName || ItemCoin.defaultCoinFrameName;
    if (frameName) {
      this.spCoin.setSpriteFrame(frameName);
    }
  },
  AILogic: function () {
  },
  leftToBarrier: function () {
    this._speedX = 300;
  },
  rightToBarrier: function () {
    this._speedX = -300;
  },
  downToBarrier: function () {
    if (this._tempSpeedY > 100) {
      this._tempSpeedY = this._tempSpeedY / 1.4;
      this._speedY = this._tempSpeedY;
    } else {
      this._haveDecay = true;
    }
  },
  onDead: function () {
    this.stopUpdate();
    game.Logic.showGetCoinEfx(this.getElePosition());
    game.Data.addTempCoin();
    if (this._gridInMap) {
      var local0 = game.Logic.triggerMap.getObject(this._grid);
      if (local0) {
        local0.func(this._grid);
      }
    }
  },
  setSequenceCoin: function () {
    vee.Utils.scheduleCallbackForTarget(this.nodeBox, this.checkCollide.bind(this), 0.1);
  },
  stopUpdate: function () {
    vee.Utils.unscheduleAllCallbacksForTarget(this.nodeBox);
  },
  collide: function () {
    if (this._isOver) {
      return;
    }
    this.collideEvent(false);
    if (game.Data.version.curVersion !== VERSION.TVOS_GENUINE && MultiController.MultiMine) {
      if (MultiController.MultiMine.checkHaveMine()) {
        MultiController.MultiMine.addCountDownTime(1);
      }
      this.sendDieMsg();
    }
  },
  collideEvent: function () {
    if (this._isOver) {
      return;
    }
    var local0 = new Date().getTime();
    if (ItemCoin.lastGetTs) {
      if (local0 - ItemCoin.lastGetTs < ItemCoin.soundLvUpTs) {
        if (ItemCoin.coinSoundIdx < 8) {
          ItemCoin.coinSoundIdx += 1;
        }
      } else {
        ItemCoin.coinSoundIdx = 1;
      }
    } else {
      ItemCoin.coinSoundIdx = 1;
    }
    vee.Audio.playEffect("res/inGame_pick_coin_" + ItemCoin.coinSoundIdx + ".mp3");
    ItemCoin.lastGetTs = local0;
    EfxApplause.Analysis.onGetCoin();
    this.die();
  },
  sendDieMsg: function () {
    var local0 = {};
    local0.itemId = this._type;
    local0.posX = this._gridInMap.x;
    local0.posY = this._gridInMap.y;
    local0.state = 0;
    local0.mineOverTime = MultiController.MultiMine.cooldownTime;
    MsgController.sendItemMsg(local0);
    cc.log("send item msg ====overtime===" + local0.mineOverTime);
  }
});
ItemCoin.soundLvUpTs = 300;
ItemCoin.lastGetTs = null;
ItemCoin.coinSoundIdx = 0;
ItemCoin.coinFrameName = null;
ItemCoin.defaultCoinFrameName = "Coin_small.png";
ItemCoin.pool = [];
ItemCoin.refreshAllCoin = function () {
    var local0 = ItemCoin.pool.length;
    var local1 = null;
    for (var local2 = 0; local2 < local0; local2++) {
      local1 = ItemCoin.pool[local2];
      if (local1) {
        local1.refreshCoinFrame();
      }
    }
  };
var ItemBigCoin = Item.extend({
  _type: game.ObjectType.BigCoin,
  _tempSpeedY: 600,
  _pickupBoxSize: 120,
  resetBoxInfo: function () {
    this._super();
    if (!this.boxSize) {
      return;
    }
    var minSize = this._pickupBoxSize;
    this.boxSize = cc.size(
      Math.max(this.boxSize.width, minSize),
      Math.max(this.boxSize.height, minSize)
    );
  },
  initPosition: function (arg0) {
    var local0 = game.Logic.triggerMap.getObject(this._gridInMap);
    if (local0 && local0.type === "BigCoin") {
      if (game.LevelData.selectedLevel && game.LevelData.selectedLevel.isTempStarAchieved(parseInt(local0.name))) {
        this.die();
        return;
      }
    }
    arg0 = vee.Utils.pAdd(arg0, cc.p(game.Data.tileSizeWidth / 2, game.Data.tileSizeWidth / 2));
    this._eleSize = this.rootNode.getContentSize();
    this.setElePosition(arg0);
    this.bornWithPos(arg0);
  },
  bornWithPos: function () {
    vee.Utils.scheduleCallbackForTarget(this.rootNode, this.updatePos.bind(this));
  },
  onExit: function () {
    vee.Utils.unscheduleAllCallbacksForTarget(this.rootNode);
  },
  leftToBarrier: function () {
    this._speedX = 300;
  },
  rightToBarrier: function () {
    this._speedX = -300;
  },
  downToBarrier: function () {
    if (this._tempSpeedY > 100) {
      this._tempSpeedY = this._tempSpeedY / 1.4;
      this._speedY = this._tempSpeedY;
    } else {
      this._haveDecay = true;
    }
  },
  collide: function (moveDir) {
    if (moveDir === vee.Direction.Origin) {
      return;
    }
    if (this._isOver) {
      return;
    }

    vee.Audio.playEffect(res.inGame_pick_bigCoin_mp3);
    vee.Audio.playEffect(res.inGame_function_star_mp3);
    EfxGetBigCoin.create(this.getElePosition());
    this._isOver = true;
    this.playAnimate("out", function () {
      this.die();
    }.bind(this));

    vee.Utils.logObj(this._gridInMap, "coin grid");
    if (this._gridInMap) {
      var trigger = game.Logic.triggerMap.getObject(this._gridInMap);
      if (trigger) {
        trigger.func(this._gridInMap);
      }
    }
  },
  inhaleController: null,
  getInhaleController: function () {
    if (this.inhaleController) {
      return null;
    }
    this.inhaleController = new InhaleObj();
    this.inhaleController.obj = this;
    return this.inhaleController;
  }
});
var ItemEgg = Item.extend({
  _type: game.ObjectType.Egg,
  _HP: 1,
  _isMovingEgg: false,
  spEgg: null,
  lbHPNum: null,
  _hasG: false,
  bornWithPos: function () {
    this.setDynamic(0, 0);

    var config = game.Logic.configMap.getObject(this._grid);
    if (config && config.type === "egg") {
      this._HP = parseInt(config.name);
      this._isMovingEgg = true;

      if (this._HP > 1) {
        this.spEgg.setSpriteFrame("item_egg_run.png");
        this.lbHPNum.setVisible(true);
        this.lbHPNum.setString("" + this._HP);
      }
    }
  },
  afterUpdatePos: function () {
    if (!this._grid) {
      return;
    }

    var player = game.Data.oPlayerCtl;
    if (
      this._grid.x > player._grid.x + this._checkForDieW ||
      this._grid.x < player._grid.x - this._checkForDieW ||
      this._grid.y > player._grid.y + this._checkForDieW ||
      this._grid.y < player._grid.y - this._checkForDieW
    ) {
      this.disappear();
    }
  },
  disappear: function () {
    if (this._gridInMap) {
      game.Logic.dynamicObjMap.removeObject(this._gridInMap);
      game.Logic.objMap.setObject(null, this._gridInMap);
    }
    this._container.removeFromParent();
  },
  _cachedDir: null,
  collide: function (dir) {
    if (this._isOver) {
      return;
    }

    if (dir === vee.Direction.Left && game.Data.oPlayerCtl._speedX > 0) {
      game.Data.oPlayerCtl.setElePosition(cc.p(
        this.getElePosition().x - this.boxSize.width / 2 - game.Data.oPlayerCtl.boxSize.width / 2,
        game.Data.oPlayerCtl.getElePosition().y
      ));
      game.Data.oPlayerCtl.stopRunning();
    } else if (dir === vee.Direction.Right && game.Data.oPlayerCtl._speedX < 0) {
      game.Data.oPlayerCtl.setElePosition(cc.p(
        this.getElePosition().x + this.boxSize.width / 2 + game.Data.oPlayerCtl.boxSize.width / 2,
        game.Data.oPlayerCtl.getElePosition().y
      ));
      game.Data.oPlayerCtl.stopRunning();
    } else if (dir === vee.Direction.Top && game.Data.oPlayerCtl._speedY < 0) {
      if (game.Data.oPlayerCtl.holdJumpKey) {
        game.Data.oPlayerCtl._speedY = 1300;
      } else {
        game.Data.oPlayerCtl._speedY = 800;
      }
      game.Data.oPlayerCtl._isJumpLimitY = false;
      this.costHP(dir);
      EfxHitBlock.create(this.getElePosition(), dir);
    } else if (dir === vee.Direction.Bottom && game.Data.oPlayerCtl._speedY > 0) {
      game.Data.oPlayerCtl.upToBarrier();
      this._cachedDir = dir;
      this.costHP(dir);
    }
  },
  die: function () {
    this.onDead();
    if (this._gridInMap) {
      if (this._staticItem) {
        game.Logic.objMap.setObject(null, this._gridInMap);
      }
      game.Logic.removeMapExObjectByGrid(this._gridInMap);
    }
    this.removeOnGridChange();
    this._container.removeFromParent();
  },
  costHP: function (dir) {
    this._HP--;
    if (this.lbHPNum) {
      this.lbHPNum.setString("" + this._HP);
    }

    var pos = this.getElePosition();
    if (this._HP <= 0) {
      game.Logic.dynamicObjMap.setObject(null, this._gridInMap);
      vee.Utils.scheduleOnce(function () {
        Item.createDynamicCoin(pos, dir === vee.Direction.Left ? -300 : 300, 1700);
      }, 0.2);
      vee.Utils.unscheduleAllCallbacksForTarget(this.rootNode);
      this._hasCollide = false;
      this.playAnimate("ready");
    } else {
      this._container.runAction(cc.moveTo(0.1, vee.Utils.pAdd(this.getElePosition(), cc.p(game.Data.tileSizeWidth, 0))));
    }
  },
  hitByStar: function (arg0) {
    var local0 = this.getElePosition();
    this.costHP(arg0);
  }
});
var ItemHeart = Item.extend({
  spHeart: null,
  _type: game.ObjectType.Heart,
  ps1: null,
  bornWithPos: function () {
    if (game.Data.checkIs61()) {
      this.spHeart.setTexture(res.ga_ui_Childheart_png);
    }
    if (this.ps1) {
      this.ps1.setPositionType(1);
    }
  },
  collide: function () {
    game.Data.oLyGame._tmpHeartNum = (game.Data.oLyGame._tmpHeartNum + 1);
    game.Data.addLife();
    vee.Audio.playEffect(res.inGame_pick_heart_mp3);
    EfxGetLife.show(this.getElePosition());
    this.die();
  }
});
var ItemAccelerater = Item.extend({
  _type: game.ObjectType.Accelerater,
  collide: function () {
  }
});
var ItemSpitStar = Item.extend({
  _type: game.ObjectType.Bullet,
  _hasCollide: false,
  _haveDecay: false,
  _staticItem: false,
  _hasG: false,
  _triggerObj: true,
  _speedXLimit: 750,
  _checkForDieW: 10,
  _bulletUpdateTarget: null,
  _bulletUpdateCallback: null,
  _stopBulletUpdate: function () {
    var target = this._bulletUpdateTarget || this._container || this.rootNode;
    var callback = this._bulletUpdateCallback;
    if (target && callback && vee.Utils && vee.Utils.unscheduleCallbackForTarget) {
      vee.Utils.unscheduleCallbackForTarget(target, callback);
    } else if (target && vee.Utils && vee.Utils.unscheduleAllCallbacksForTarget) {
      vee.Utils.unscheduleAllCallbacksForTarget(target);
    }
    this._bulletUpdateTarget = null;
    this._bulletUpdateCallback = null;
  },
  _startBulletUpdate: function () {
    this._stopBulletUpdate();
    var target = this._container || this.rootNode;
    if (!target || !vee.Utils || !vee.Utils.scheduleCallbackForTarget) {
      return;
    }
    this._bulletUpdateTarget = target;
    this._bulletUpdateCallback = function (dt) {
      if (this._isOver) {
        return;
      }
      if (!dt || dt <= 0 || dt !== dt) {
        if (cc.director && cc.director.getDeltaTime) {
          dt = cc.director.getDeltaTime();
        }
        if (!dt || dt <= 0 || dt !== dt) {
          dt = 1 / 60;
        }
      }
      this.updatePos(dt);
    }.bind(this);
    vee.Utils.scheduleCallbackForTarget(target, this._bulletUpdateCallback, 0);
  },
  bornWithPos: function () {
    this.playAnimate("show2");
    this._startBulletUpdate();
  },
  onExit: function () {
    this._stopBulletUpdate();
  },
  _rectStar: null,
  _rectObj: null,
  AILogicPerFrame: function () {
    var obj = game.Logic.objMap.getObject(this._grid);
    if (obj && obj._type === game.ObjectType.Egg) {
      obj.hitByStar(this._moveDir);
    } else {
      this._rectStar = this.getEleRect();
      var objects = game.Logic.dynamicObjMap.getObjects();
      for (var key in objects) {
        obj = objects[key];
        if (obj && obj.hitByStar) {
          this._rectObj = obj.getEleRect();
          if (cc.rectIntersectsRect(this._rectStar, this._rectObj)) {
            obj.hitByStar(this._moveDir);
            this.dieEffect();
            break;
          }
        }
      }
    }
    obj = null;
  },
  stopMove: function () {
  },
  isDashing: function () {
    return true;
  },
  refreshPosition: function (dt) {
    if (!dt || dt <= 0 || dt !== dt) {
      dt = 1 / 60;
    }
    if (!this._speedX || this._speedX !== this._speedX) {
      this._speedX = (this._faceTo === vee.Direction.Left ? -1 : 1) * (this._speedXLimit || 750);
    }
    var pos = cc.p(
      this.getElePosition().x + this._speedX * dt,
      this.getElePosition().y + this._speedY * dt
    );
    this.setElePosition(pos);
    var grid = this._grid || game.Logic.getTileGridByPos(pos);
    if (!this._lastGrid || grid.x !== this._lastGrid.x || grid.y !== this._lastGrid.y) {
      this.onGridChanged();
      this._lastGrid = cc.p(grid.x, grid.y);
    }
  },
  onGridChanged: function () {
    var tileData = game.Logic.map.getObject(this._grid);
    if (tileData && game.Logic.isBlock(tileData)) {
      this.checkBarrier(tileData);
    } else {
      var pos = this.getElePosition();
      var gridCenter = game.Logic.getTilePosCenterByGrid(this._grid);
      var checkGrid;

      if (pos.y > gridCenter.y + 10) {
        checkGrid = cc.p(this._grid.x, this._grid.y - 1);
        tileData = game.Logic.map.getObject(checkGrid);
        if (tileData && game.Logic.isBlock(tileData)) {
          this.checkBarrier(tileData, checkGrid);
        }
      } else if (pos.y < gridCenter.y - 10) {
        checkGrid = cc.p(this._grid.x, this._grid.y + 1);
        tileData = game.Logic.map.getObject(checkGrid);
        if (tileData && game.Logic.isBlock(tileData)) {
          this.checkBarrier(tileData, checkGrid);
        }
      }
    }

    var player = game.Data.oPlayerCtl;
    if (player && (
      this._grid.x > player._grid.x + this._checkForDieW ||
      this._grid.x < player._grid.x - this._checkForDieW ||
      this._grid.y > player._grid.y + this._checkForDieW ||
      this._grid.y < player._grid.y - this._checkForDieW
    )) {
      this._isOver = true;
      this.reviveBullet();
      this.die();
    }
  },
  checkBarrier: function (tileData, grid) {
    if (this._faceTo === vee.Direction.Left) {
      this.leftToBarrier(tileData, grid);
    } else {
      this.rightToBarrier(tileData, grid);
    }
  },
  onDead: function () {
    this._stopBulletUpdate();
  },
  dieEffect: function () {
    this._isOver = true;
    this._accX = 0;
    this._speedX = 0;
    this.playAnimate("out", function () {
      this.die();
    }.bind(this));
    this.reviveBullet();
  },
  reviveBullet: function () {
    if (!game.Data.oPlayerCtl) {
      return;
    }

    if (game.Data.bulletCount === 0) {
      game.Data.oPlayerCtl.resetDTCounter();
    }
    game.Data.bulletCount = +game.Data.bulletCount + 1;

    if (game.Data.roleType === game.Roles.Cop && game.Data.bulletCount > 2) {
      game.Data.bulletCount = 2;
    } else if (game.Data.roleType !== game.Roles.Cop && game.Data.bulletCount > 1) {
      game.Data.bulletCount = 1;
    }
  },
  leftToBarrier: function (tileData, grid) {
    if (!grid) {
      grid = this._grid;
    }
    if (game.Logic.checkTileTrigger) {
      game.Logic.checkTileTrigger(grid, vee.Direction.Left, tileData, this);
    }
    if (game.Logic.triggerTileCallback) {
      game.Logic.triggerTileCallback(tileData, this, vee.Direction.Left);
    }
    if (tileData) {
      this.setElePosition(cc.p(tileData.right, this.getElePosition().y));
    }
    this.dieEffect();
  },
  rightToBarrier: function (tileData, grid) {
    if (!grid) {
      grid = this._grid;
    }
    if (game.Logic.checkTileTrigger) {
      game.Logic.checkTileTrigger(grid, vee.Direction.Right, tileData, this);
    }
    if (game.Logic.triggerTileCallback) {
      game.Logic.triggerTileCallback(tileData, this, vee.Direction.Right);
    }
    if (tileData) {
      this.setElePosition(cc.p(tileData.left, this.getElePosition().y));
    }
    this.dieEffect();
  }
});
ItemSpitStar.create = function (pos, speedRate) {
    var node = cc.BuilderReader.load(res.itemSpitStar_ccbi);
    var container = new cc.Node();
    var controller = node.controller;
    var dir = Number(speedRate);

    if (!dir || dir !== dir) {
      dir = 1;
    }
    dir = dir < 0 ? -1 : 1;

    container.addChild(node);
    controller.setContainerNode(container);
    controller._staticItem = false;
    controller._haveDecay = false;
    controller._hasG = false;
    controller._speedY = 0;
    controller._accX = 0;
    controller._accY = 0;
    controller._speedX = Math.abs(controller._speedXLimit || 750) * dir;
    controller.setFaceTo(dir > 0 ? vee.Direction.Right : vee.Direction.Left, true);
    controller.initPosition(pos);
    game.Data.oLyGame.lyMap.addChild(container);
    controller._startBulletUpdate();
  };
