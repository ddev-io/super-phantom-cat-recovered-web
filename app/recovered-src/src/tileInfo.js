
// Recovered readable source from smdis/tileInfo.dis
// Functions that could not be verified with full confidence are marked with RECOVERY_UNCERTAIN_TILEINFO.

function TileData_edge(tile, name) {
  return tile && tile.tileInfo && typeof tile.tileInfo[name] === "number" ? tile.tileInfo[name] : 0;
}

function TileData_getTileRect(tile) {
  // In the original bytecode edgeLeft/edgeRight are not horizontal insets.
  // For block tiles edgeLeft is used as the effective collision height
  // above tile.bottom (64 for a full block, ~28/54 for partial blocks).
  var top = tile.bottom + TileData_edge(tile, "edgeLeft");
  if (!isFinite(top) || top <= tile.bottom) {
    top = tile.top - TileData_edge(tile, "edgeTop");
  }
  return {
    left: tile.left,
    right: tile.right,
    bottom: tile.bottom + TileData_edge(tile, "edgeBottom"),
    top: top
  };
}

function TileData_getElementRect(pos, ele) {
  var offset = ele && ele.boxOffset ? ele.boxOffset : cc.p(0, 0);
  var size = ele && ele.boxSize ? ele.boxSize : cc.size(TILE_WIDTH, TILE_WIDTH);
  var centerX = pos.x + offset.x;
  var centerY = pos.y + offset.y;
  return {
    left: centerX - size.width / 2,
    right: centerX + size.width / 2,
    bottom: centerY - size.height / 2,
    top: centerY + size.height / 2,
    offset: offset,
    size: size
  };
}

function TileData_rectsOverlap(a, b) {
  return a.left < b.right && a.right > b.left && a.bottom < b.top && a.top > b.bottom;
}

function TileData_correctPosition(tile, pos, ele, side) {
  var tileRect = TileData_getTileRect(tile);
  var eleRect = TileData_getElementRect(pos, ele);
  if (!TileData_rectsOverlap(tileRect, eleRect)) {
    return null;
  }

  var corrected = cc.p(pos.x, pos.y);
  switch (side) {
    case "top":
      corrected.y = tileRect.top + eleRect.size.height / 2 - eleRect.offset.y;
      if (ele && typeof ele.downToBarrier === "function") { ele.downToBarrier(tile); }
      if (ele && typeof ele.setJumping === "function") { ele.setJumping(false); }
      break;
    case "bottom":
      corrected.y = tileRect.bottom - eleRect.size.height / 2 - eleRect.offset.y;
      if (ele && typeof ele.upToBarrier === "function") { ele.upToBarrier(tile); }
      break;
    case "left":
      corrected.x = tileRect.left - eleRect.size.width / 2 - eleRect.offset.x;
      if (ele && typeof ele.rightToBarrier === "function") { ele.rightToBarrier(tile); }
      break;
    case "right":
      corrected.x = tileRect.right + eleRect.size.width / 2 - eleRect.offset.x;
      if (ele && typeof ele.leftToBarrier === "function") { ele.leftToBarrier(tile); }
      break;
    default:
      var pushLeft = Math.abs(eleRect.right - tileRect.left);
      var pushRight = Math.abs(tileRect.right - eleRect.left);
      var pushBottom = Math.abs(eleRect.top - tileRect.bottom);
      var pushTop = Math.abs(tileRect.top - eleRect.bottom);
      var best = Math.min(pushLeft, pushRight, pushBottom, pushTop);
      if (best === pushTop) { return TileData_correctPosition(tile, pos, ele, "top"); }
      if (best === pushBottom) { return TileData_correctPosition(tile, pos, ele, "bottom"); }
      if (best === pushLeft) { return TileData_correctPosition(tile, pos, ele, "left"); }
      return TileData_correctPosition(tile, pos, ele, "right");
  }
  return corrected;
}

function TileData_safeCall(obj, methodName) {
  if (obj && typeof obj[methodName] === "function") {
    return obj[methodName].apply(obj, Array.prototype.slice.call(arguments, 2));
  }
  return undefined;
}


var TileData = cc.Class.extend({
  gid: 0,
  grid: null,
  layer: null,
  check: true,
  refreshSign: false,
  tileInfo: null,
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  setTileDataPos: function (arg0) {
    this.left = arg0.x;
    this.bottom = arg0.y;
    this.top = (this.bottom + TILE_WIDTH);
    this.right = (this.left + TILE_WIDTH);
  },
  init: function () {
  },
  collide: function () {
  },
  viewIn: function () {
  },
  viewOut: function () {
  },
  checkOrigin: function () {
  },
  checkTop: function () {
  },
  checkTopLeft: function () {
  },
  checkTopRight: function () {
  },
  checkLeft: function () {
  },
  checkRight: function () {
  },
  checkBottom: function () {
  },
  checkBottomLeft: function () {
  },
  checkBottomRight: function () {
  },
  collideEvent: function () {
  }
});
TileData.createTileData = function (arg0) {
    var local0 = TileData.gid2td["Tile" + arg0];
    if (local0) {
      return new local0();
    }
    var local1 = game.TileIDInfo["Tile" + arg0];
    if (local1) {
      var local2 = new TileData();
      local2.tileInfo = local1;
      local2.check = false;
      return local2;
    }
    return undefined;
  };
TileData.BlockData = TileData.extend({
  tileInfo: game.TileInfo.TileBlock,
  checkOriginPosY: function (arg0, arg1) {
    return this.bottom + TileData_edge(this, "edgeBottom") + arg0.height / 2 - arg1.y;
  },
  checkOrigin: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "origin");
  },
  checkTopPosY: function (arg0, arg1) {
    return this.top - TileData_edge(this, "edgeTop") + arg0.height / 2 - arg1.y;
  },
  checkTop: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "top");
  },
  checkTopLeftPosY: function (arg0, arg1) {
    return this.checkTopPosY(arg0, arg1);
  },
  checkTopLeft: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkTop(arg0, arg1);
  },
  checkTopRightPosY: function (arg0, arg1) {
    return this.checkTopPosY(arg0, arg1);
  },
  checkTopRight: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkTop(arg0, arg1);
  },
  checkLeft: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "left");
  },
  checkRight: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "right");
  },
  checkBottom: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "bottom");
  },
  checkBottomLeft: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkBottom(arg0, arg1);
  },
  checkBottomRight: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkBottom(arg0, arg1);
  }
});
TileData.UPSlopeData = TileData.BlockData.extend({
  tileInfo: game.TileInfo.TileUPSlope,
  checkOriginPosY: function (arg0, arg1, arg2) {
    return this.bottom + TileData_edge(this, "edgeBottom") + arg0.height / 2 - arg1.y;
  },
  checkOrigin: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "origin");
  },
  checkLeft: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "left");
  },
  checkRight: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "right");
  },
  checkTopPosY: function (arg0, arg1, arg2) {
    return this.top - TileData_edge(this, "edgeTop") + arg0.height / 2 - arg1.y;
  },
  checkTop: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "top");
  },
  checkTopLeftPosY: function (arg0, arg1, arg2) {
    return this.checkTopPosY(arg0, arg1);
  },
  checkTopLeft: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkTop(arg0, arg1);
  },
  checkTopRightPosY: function (arg0, arg1, arg2) {
    return this.checkTopPosY(arg0, arg1);
  },
  checkTopRight: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkTop(arg0, arg1);
  }
});
TileData.UPSlopeZeroToHalfData = TileData.UPSlopeData.extend({
  tileInfo: game.TileInfo.TileUpSlopeZeroToHalf
});
TileData.UPSlopeHalfToTopData = TileData.UPSlopeData.extend({
  tileInfo: game.TileInfo.TileUpSlopeHalfToTop
});
TileData.DOWNSlopeData = TileData.UPSlopeData.extend({
  tileInfo: game.TileInfo.TileDownSlope,
  checkOriginPosY: function (arg0, arg1, arg2) {
    return this.bottom + TileData_edge(this, "edgeBottom") + arg0.height / 2 - arg1.y;
  },
  checkTopPosY: function (arg0, arg1, arg2) {
    return this.top - TileData_edge(this, "edgeTop") + arg0.height / 2 - arg1.y;
  },
  checkTopLeftPosY: function (arg0, arg1, arg2) {
    return this.checkTopPosY(arg0, arg1);
  },
  checkTopRightPosY: function (arg0, arg1, arg2) {
    return this.checkTopPosY(arg0, arg1);
  }
});
TileData.DOWNSlopeTopToHalfData = TileData.DOWNSlopeData.extend({
  tileInfo: game.TileInfo.TileDownSlopeTopToHalf
});
TileData.DOWNSlopeHalfToZertData = TileData.DOWNSlopeData.extend({
  tileInfo: game.TileInfo.TileDownSlopeHalfToZero
});
TileData.UPSlopeLeftToZero = TileData.BlockData.extend({
  tileInfo: game.TileInfo.TileUpSlopeLeftToZero,
  checkOrigin: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "origin");
  },
  checkTop: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "top");
  },
  checkTopLeft: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkTop(arg0, arg1);
  },
  checkTopRight: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkTop(arg0, arg1);
  },
  checkLeft: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "left");
  },
  checkBottom: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "bottom");
  },
  checkBottomLeft: function (arg0, arg1) {
    return this.checkBottom(arg0, arg1);
  },
  checkBottomRight: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkBottom(arg0, arg1);
  }
});
TileData.UPSlopeLeftToHalfData = TileData.UPSlopeLeftToZero.extend({
  tileInfo: game.TileInfo.TileUpSlopeLeftToHalf
});
TileData.DOWNSlopeRightToZeroData = TileData.BlockData.extend({
  tileInfo: game.TileInfo.TileDownSlopeRightToZero,
  checkOrigin: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "origin");
  },
  checkTop: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "top");
  },
  checkTopLeft: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkTop(arg0, arg1);
  },
  checkTopRight: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkTop(arg0, arg1);
  },
  checkRight: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "right");
  },
  checkBottom: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "bottom");
  },
  checkBottomLeft: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkBottom(arg0, arg1);
  },
  checkBottomRight: function (arg0, arg1) {
    return this.checkBottom(arg0, arg1);
  }
});
TileData.DOWNSlopeRightToHalfData = TileData.DOWNSlopeRightToZeroData.extend({
  tileInfo: game.TileInfo.TileDownSlopeRightToHalf
});
TileData.BounceBlockData = TileData.BlockData.extend({
  tileInfo: game.TileInfo.TileBlockBounce,
  init: function () {
    this.tile = this.layer.getTileAt(this.grid);
  },
  checkOrigin: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "origin");
  },
  checkTop: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "top");
  },
  checkTopLeft: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkTop(arg0, arg1);
  },
  checkTopRight: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkTop(arg0, arg1);
  },
  checkLeft: function () {
    return null;
  },
  checkRight: function () {
    return null;
  },
  checkBottom: function () {
    return null;
  },
  checkBottomLeft: function () {
    return null;
  },
  checkBottomRight: function () {
    return null;
  },
  collide: function (ele, dir) {
    // Tile callback. Bounce blocks react when the player lands on them.
    if (!ele || ele._eleType !== game.EleType.Player || dir !== vee.Direction.Bottom) { return; }

    this.shouldJump = true;
    this.isBouncing = true;
    ele.holdJump = true;
    ele._speedX = 0;
    ele._accX = 0;

    if (game.Data.isHoldJumpButtom || ele._isSmashing) {
      ele._speedY = 1600;
      ele._isJumpLimitY = false;
      ele.holdJump = false;
    } else {
      ele._speedY = 1020;
      ele._isJumpLimitY = false;
      game.Data.cameraRestoreY = true;
      ele.holdJump = false;
    }

    if (game.Data.oLyGame && game.Data.oLyGame._holdLeft && ele.moveLeft) { ele.moveLeft(); }
    else if (game.Data.oLyGame && game.Data.oLyGame._holdRight && ele.moveRight) { ele.moveRight(); }
    else if (game.Data.stageType === game.StageType.Parkour &&
        game.Data.oPlayerCtl && game.Data.oPlayerCtl.parkourMove) {
      game.Data.oPlayerCtl.parkourMove();
    }
  }
});
TileData.BlockOneWayData = TileData.BounceBlockData.extend({
  tileInfo: game.TileInfo.TileBlockOneWay,
  collide: function () {
  }
});
TileData.BlockHurtData = TileData.BlockData.extend({
  tileInfo: game.TileInfo.TileBlockHurt,
  collide: function (ele, dir) {
    // Tile callback signature is (element, direction), not (position, element).
    // The old recovered code incorrectly called checkOrigin(ele, dir), which made
    // dir become the `ele` argument and crashed on ele.boxSize.height.
    if (!ele) { return; }

    if (ele._eleType === game.EleType.Player) {
      if (game.Data.playerHawk || (game.Data.playerInvisible && !ele._isSmashing)) {
        return;
      }

      if (this.gid === 34) {
        if (dir === vee.Direction.Bottom && ele._grid && this.grid && ele._grid.x === this.grid.x && ele.getShock) {
          ele.getShock(vee.Direction.revert(ele._faceTo), true);
        }
      } else if (ele.getShock) {
        ele.getShock(vee.Direction.revert(ele._faceTo), true);
      }
    } else if (ele._eleType === game.EleType.Enemy && ele.dieEffect) {
      ele.dieEffect();
    }
  }
});
TileData.BlockHurtHalfData = TileData.BlockHurtData.extend({
  tileInfo: game.TileInfo.TileBlockHurtHalf
});
TileData.BlockHideData = TileData.BlockData.extend({
  tileInfo: game.TileInfo.TileBlockHide,
  init: function () {
    this.tile = this.layer.getTileAt(this.grid);
    this.tile.setVisible(false);
  },
  checkOriginPosY: function (arg0, arg1) {
    return this.bottom + TileData_edge(this, "edgeBottom") + arg0.height / 2 - arg1.y;
  },
  checkOrigin: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "origin");
  },
  checkTopPosY: function (arg0, arg1) {
    return this.top - TileData_edge(this, "edgeTop") + arg0.height / 2 - arg1.y;
  },
  checkTop: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "top");
  },
  checkTopLeftPosY: function (arg0, arg1) {
    return this.checkTopPosY(arg0, arg1);
  },
  checkTopLeft: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkTop(arg0, arg1);
  },
  checkTopRightPosY: function (arg0, arg1) {
    return this.checkTopPosY(arg0, arg1);
  },
  checkTopRight: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkTop(arg0, arg1);
  },
  checkLeft: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "left");
  },
  checkRight: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "right");
  },
  checkBottom: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "bottom");
  },
  checkBottomLeft: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkBottom(arg0, arg1);
  },
  checkBottomRight: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkBottom(arg0, arg1);
  }
});
TileData.DynamicBlockData = TileData.BlockData.extend({
  checkBottomLeft: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkBottom(arg0, arg1);
  },
  checkBottomRight: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkBottom(arg0, arg1);
  }
});
TileData.BlockFadeData = TileData.BlockOneWayData.extend({
  tileInfo: game.TileInfo.TileBlockHide,
  init: function () {
    this.tile = this.layer.getTileAt(this.grid);
  },
  collide: function (ele, dir) {
    if (ele && ele._eleType === game.EleType.Player && dir === vee.Direction.Bottom && !this._isFading) {
      this.collideEvent();
      this.sendCollideMsg();
    }
  },
  sendCollideMsg: function () {
    var data = {};
    data.tileId = this.gid;
    data.posX = this.grid.x;
    data.posY = this.grid.y;
    data.state = 0;
    data.tmxLayerName = this.layer && this.layer.getLayerName ? this.layer.getLayerName() : "";
    if (typeof MsgController !== "undefined" && MsgController.sendTileMsg) {
      MsgController.sendTileMsg(data);
    }
  },
  _getFadeMap: function () {
    if (!game.Logic || !this.layer) {
      return null;
    }
    if (this.layer === game.Logic._tmxLayer) {
      return game.Logic.map;
    }
    if (this.layer === game.Logic._tmxLayerEx) {
      return game.Logic.mapex;
    }
    return null;
  },
  _setFadeActive: function (active) {
    this.check = active;
    var map = this._getFadeMap();
    if (map && map.setObject) {
      map.setObject(active ? this : null, this.grid);
    }
  },
  collideEvent: function () {
    if (this._isFading) { return; }
    this._isFading = true;
    if (vee.Audio && res.inGame_efx_bubbleVanish_mp3) {
      vee.Audio.playEffect(res.inGame_efx_bubbleVanish_mp3);
    }
    if (this.tile) {
      this.tile.runAction(cc.sequence(
        cc.spawn(
          cc.sequence(
            cc.rotateTo(0.1, -4),
            cc.rotateTo(0.1, 3),
            cc.rotateTo(0.1, -2),
            cc.rotateTo(0.1, 2),
            cc.rotateTo(0.1, 0),
            cc.moveBy(0.2, cc.p(0, -30))
          ),
          cc.fadeTo(0.7, 0)
        ),
        cc.callFunc(function () {
          cc.log("fade info check =====false  x=%d  y=%d", this.grid.x, this.grid.y);
          this._setFadeActive(false);
          if (this.tile && this.tile.setVisible) {
            this.tile.setVisible(false);
          }
        }.bind(this)),
        cc.delayTime(1),
        cc.callFunc(function () {
          if (this.tile) {
            if (this.tile.setOpacity) {
              this.tile.setOpacity(0);
            }
            if (this.tile.setVisible) {
              this.tile.setVisible(true);
            }
          }
        }.bind(this)),
        cc.moveBy(0.01, cc.p(0, 30)),
        cc.fadeTo(0.2, 255),
        cc.callFunc(function () {
          this._isFading = false;
          this._setFadeActive(true);
        }.bind(this))
      ));
    } else {
      this._isFading = false;
      this._setFadeActive(true);
    }
  }
});
TileData.BlockBombData = TileData.BlockData.extend({
  tileInfo: game.TileInfo.TileBlockBomb,
  bombEfx: null,
  isPlayerBomb: false,
  isBooming: false,
  tempData: null,

  _shouldBoomByCollision: function (ele, dir, forceBoom) {
    if (forceBoom) {
      return true;
    }
    if (!ele) {
      return false;
    }
    if (ele._eleType === game.EleType.Player) {
      return (dir === vee.Direction.Bottom && ele.isSmashing && ele.isSmashing()) ||
        (dir === vee.Direction.Top && ele._speedY > game.Data.playerYTriggerSpeed);
    }
    if (ele._eleType === game.EleType.Enemy) {
      return (dir === vee.Direction.Left || dir === vee.Direction.Right) && ele.isDashing && ele.isDashing();
    }
    return ele._type === game.ObjectType.Bullet;
  },

  _isBombBreakTarget: function (tile) {
    if (!tile) {
      return false;
    }
    return (game.Logic && game.Logic.isBreakableBlock && game.Logic.isBreakableBlock(tile.gid)) ||
      tile.gid === game.BlockType.BombBlock ||
      tile.gid === game.BlockType.SkillSmash ||
      tile.gid === game.BlockType.SkillBullet ||
      tile.gid === game.BlockType.SkillTeleport ||
      tile.gid === game.BlockType.SkillBomb ||
      tile.gid === game.BlockType.QuestionBlock;
  },

  _restoreCenterTile: function (grid) {
    var layer = this.layer || (game.Logic && game.Logic._tmxLayer);
    if (!layer) {
      return;
    }

    if (!this.tempData) {
      if (layer.removeTileAt) {
        layer.removeTileAt(grid);
      }
      if (game.Logic && game.Logic.map && game.Logic.map.removeObject) {
        game.Logic.map.removeObject(grid);
      }
      return;
    }

    var restoreLayer = this.tempData.layer || layer;
    if (restoreLayer.setTileGID) {
      restoreLayer.setTileGID(this.tempData.gid, grid);
    }
    var restoreData = game.Logic.getTileData ? game.Logic.getTileData(grid, restoreLayer) : this.tempData;
    if (game.Logic.map && game.Logic.map.setObject) {
      game.Logic.map.setObject(restoreData, grid);
    }

    var tileNode = restoreLayer.getTileAt ? restoreLayer.getTileAt(grid) : null;
    if (tileNode && tileNode.setVisible && this.tempData.tileInfo &&
      !this.tempData.tileInfo.slope &&
      this.tempData.tileInfo.type !== game.ObjectType.BlockOneWay &&
      this.tempData.tileInfo.type !== game.ObjectType.BlockBounce) {
      tileNode.setVisible(false);
    }
  },

  _runBombExplosion: function (boomGrid, sourceEle) {
    var shakeTime = 0.02;
    var shakeRange = 5;
    if (game.Data && game.Data.oLyGame && game.Data.oLyGame.rootNode && game.Data.oLyGame.rootNode.runAction) {
      game.Data.oLyGame.rootNode.runAction(cc.Sequence.create(
        cc.MoveBy.create(shakeTime, 0, -shakeRange),
        cc.MoveBy.create(shakeTime, 0, shakeRange * 2),
        cc.MoveBy.create(shakeTime, 0, -shakeRange),
        cc.MoveBy.create(shakeTime, 0, shakeRange),
        cc.MoveBy.create(shakeTime, 0, -shakeRange * 2),
        cc.MoveBy.create(shakeTime, 0, shakeRange)
      ));
    }

    var origin = cc.p(boomGrid.x - 1, boomGrid.y - 1);
    for (var ix = 0; ix < 3; ix++) {
      for (var iy = 0; iy < 3; iy++) {
        var grid = cc.p(origin.x + ix, origin.y + iy);
        var tile = game.Logic && game.Logic.map && game.Logic.map.getObject ? game.Logic.map.getObject(grid) : null;
        var dir = vee.Direction.pointToDirection ? vee.Direction.pointToDirection(cc.p(ix - 1, iy - 1)) : vee.Direction.Origin;

        if (tile && game.Logic && game.Logic.checkTileTrigger) {
          game.Logic.checkTileTrigger(grid, dir, tile, sourceEle, true);
        }
        if (tile && this._isBombBreakTarget(tile) && tile.collide) {
          tile.collide(null, null, true);
        }

        if (ix === 1 && iy === 1) {
          this._restoreCenterTile(grid);
        }
      }
    }

    var pos = game.Logic.getTilePosByGrid ? game.Logic.getTilePosByGrid(origin) : cc.p(boomGrid.x * TILE_WIDTH, boomGrid.y * TILE_WIDTH);
    pos.y -= TILE_WIDTH * 2;
    var rect = cc.rect(pos.x, pos.y, TILE_WIDTH * 3, TILE_WIDTH * 3);
    var objects = game.Logic && game.Logic.dynamicObjMap && game.Logic.dynamicObjMap.getObjects ? game.Logic.dynamicObjMap.getObjects() : [];
    for (var i = 0; i < objects.length; i++) {
      var obj = objects[i];
      if (obj && obj._eleType === game.EleType.Enemy && obj.getElePosition && cc.rectContainsPoint(rect, obj.getElePosition())) {
        if (obj.hitByStar) {
          obj.hitByStar();
        }
      }
    }
  },

  collide: function (ele, dir, forceBoom) {
    if (this.bombEfx && (this.bombEfx.boomed || this.bombEfx.isStatic)) {
      return;
    }
    if (!this._shouldBoomByCollision(ele, dir, forceBoom)) {
      return;
    }

    dir = dir || vee.Direction.Origin;
    var dirPoint = vee.Direction.direction2Point ? vee.Direction.direction2Point(dir) : cc.p(0, 0);
    var targetGrid = vee.Utils && vee.Utils.pAdd ? vee.Utils.pAdd(this.grid, cc.p(dirPoint.x, dirPoint.y)) : cc.p(this.grid.x + dirPoint.x, this.grid.y + dirPoint.y);
    var boomGrid = cc.p(targetGrid.x, targetGrid.y);
    var player = game.Data && game.Data.oPlayerCtl;
    var layer = this.layer || (game.Logic && game.Logic._tmxLayer);

    if (!this.bombEfx) {
      if (this.isPlayerBomb && typeof EfxPlayerTNT !== "undefined" && EfxPlayerTNT.create) {
        this.bombEfx = EfxPlayerTNT.create(game.Logic.getTilePosCenterByGrid(this.grid));
        if (this.bombEfx.bornAnimate) {
          this.bombEfx.bornAnimate();
        }
      } else if (typeof EfxTNT !== "undefined" && EfxTNT.create) {
        this.bombEfx = EfxTNT.create(game.Logic.getTilePosCenterByGrid(this.grid));
      }
    }

    var targetTile = game.Logic && game.Logic.map && game.Logic.map.getObject ? game.Logic.map.getObject(targetGrid) : null;
    var canMoveToTarget = ((targetTile && targetTile.gid === 0) || !targetTile) &&
      !this.isPlayerBomb &&
      (!player || !player._grid || !game.Logic.isGridSame || !game.Logic.isGridSame(targetGrid, player._grid));

    var activeBombData = this;
    if (canMoveToTarget && layer && layer.setTileGID) {
      layer.setTileGID(this.gid, targetGrid);
      activeBombData = game.Logic.getTileData ? game.Logic.getTileData(targetGrid, layer) : this;
      if (game.Logic.map && game.Logic.map.setObject) {
        game.Logic.map.setObject(activeBombData, targetGrid);
      }
      activeBombData.bombEfx = this.bombEfx;
      activeBombData.isPlayerBomb = this.isPlayerBomb;
      activeBombData.tempData = null;

      var newTileNode = layer.getTileAt ? layer.getTileAt(targetGrid) : null;
      if (this.isPlayerBomb) {
        if (newTileNode && newTileNode.setVisible) {
          newTileNode.setVisible(false);
        }
        if (activeBombData.bombEfx && activeBombData.bombEfx.breathAnimate) {
          activeBombData.bombEfx.breathAnimate();
        }
        if (activeBombData.bombEfx && activeBombData.bombEfx._container && activeBombData.bombEfx._container.runAction) {
          activeBombData.bombEfx._container.runAction(cc.sequence(
            cc.EaseExponentialOut.create(cc.moveTo(0.3, game.Logic.getTilePosCenterByGrid(targetGrid))),
            cc.callFunc(function () {
              activeBombData.bombEfx.boomAnimate();
            })
          ));
        }
      } else if (newTileNode && newTileNode.runAction) {
        var startPos = game.Logic.getTilePosByGrid(this.grid);
        var endPos = vee.Utils && vee.Utils.pAdd ? vee.Utils.pAdd(startPos, cc.p(dirPoint.x * TILE_WIDTH, -dirPoint.y * TILE_WIDTH)) : cc.p(startPos.x + dirPoint.x * TILE_WIDTH, startPos.y - dirPoint.y * TILE_WIDTH);
        newTileNode.setPosition(startPos);
        newTileNode.runAction(cc.sequence(
          cc.EaseExponentialOut.create(cc.moveTo(0.3, endPos)),
          cc.callFunc(function () {
            if (newTileNode.setVisible) {
              newTileNode.setVisible(false);
            }
            if (activeBombData.bombEfx && activeBombData.bombEfx._container && activeBombData.bombEfx._container.setPosition) {
              activeBombData.bombEfx._container.setPosition(cc.p(endPos.x + TILE_WIDTH_HALF, endPos.y + TILE_WIDTH_HALF));
            }
            if (activeBombData.bombEfx && activeBombData.bombEfx.boomAnimate) {
              activeBombData.bombEfx.boomAnimate();
            }
          }.bind(this))
        ));
      }

      if (layer.removeTileAt) {
        layer.removeTileAt(this.grid);
      }
      if (game.Logic.map && game.Logic.map.removeObject) {
        game.Logic.map.removeObject(this.grid);
      }
      if (vee.Audio && vee.Audio.playEffect && res.inGame_efx_bombCount_mp3) {
        vee.Audio.playEffect(res.inGame_efx_bombCount_mp3);
      }
      if (typeof EfxHitBlock !== "undefined" && EfxHitBlock.create) {
        EfxHitBlock.create(game.Logic.getTilePosCenterByGrid(targetGrid), vee.Direction.revert ? vee.Direction.revert(dir) : dir);
      }
    } else {
      if (this.isBooming) {
        return;
      }
      this.isBooming = true;
      boomGrid = cc.p(this.grid.x, this.grid.y);
      if (this.bombEfx && !this.bombEfx.isStatic) {
        if (!this.tile && layer && layer.getTileAt) {
          this.tile = layer.getTileAt(this.grid);
        }
        if (this.tile && this.tile.setVisible) {
          this.tile.setVisible(false);
        }
        if (this.bombEfx.boomAnimate) {
          this.bombEfx.boomAnimate();
        }
      }
    }

    if (activeBombData.bombEfx && activeBombData.bombEfx.setBoomFunc) {
      var self = activeBombData;
      activeBombData.bombEfx.setBoomFunc(function () {
        self._runBombExplosion(boomGrid, ele);
      });
    }
  }
});
TileData.BlockBreakableData = TileData.BlockData.extend({
  tileInfo: game.TileInfo.TileBlockBreakable,
  removed: false,

  collide: function (player, direction, forceBreak) {
    if (this.removed) {
      return;
    }

    var shouldBreak = !!forceBreak;
    if (!shouldBreak && player) {
      switch (direction) {
        case vee.Direction.Top:
        case vee.Direction.TopLeft:
        case vee.Direction.TopRight:
          shouldBreak = player._speedY > game.Data.playerYTriggerSpeed;
          break;

        case vee.Direction.Bottom:
        case vee.Direction.BottomLeft:
        case vee.Direction.BottomRight:
          shouldBreak = !!player._isSmashing || player._moveState === MoveState.Smash;
          break;

        case vee.Direction.Left:
        case vee.Direction.Right:
          shouldBreak = typeof player.isDashing === "function" && player.isDashing();
          break;
      }
    }

    if (!shouldBreak) {
      return;
    }

    var gid = this.layer ? this.layer.getTileGIDAt(this.grid) : this.gid;
    this.removed = true;

    if (vee.Audio && vee.Audio.playEffect) {
      vee.Audio.playEffect("res/inGame_efx_blockBreak_" + vee.Utils.randomInt(1, 4) + ".mp3");
      if (res.inGame_efx_blockBreak_mp3) {
        vee.Audio.playEffect(res.inGame_efx_blockBreak_mp3);
      }
    }

    if (this.layer) {
      this.layer.removeTileAt(this.grid);
    }
    if (game.Logic && game.Logic.map) {
      game.Logic.map.removeObject(this.grid);
    }
    if (game.Logic && game.Logic._tmxLayerGrass) {
      game.Logic._tmxLayerGrass.removeTileAt(this.grid);
    }
    if (typeof EfxBlockBreak !== "undefined" && EfxBlockBreak.show) {
      EfxBlockBreak.show(game.Logic.getTilePosCenterByGrid(this.grid), null);
    }

    this.afterCollide(gid);

    if (!player || !player._pos) {
      return;
    }

    var neighbour = null;
    var neighbourGrid = null;
    if (player._pos.x < this.left + 20) {
      neighbourGrid = cc.p(this.grid.x - 1, this.grid.y);
    } else if (player._pos.x > this.right - 20) {
      neighbourGrid = cc.p(this.grid.x + 1, this.grid.y);
    }

    if (neighbourGrid && game.Logic && game.Logic.map) {
      neighbour = game.Logic.map.getObject(neighbourGrid);
      if (neighbour && game.Logic.isBreakableBlock(neighbour.gid)) {
        neighbour.collide(player, direction, forceBreak);
        game.Logic.checkTileTrigger(neighbourGrid, direction, neighbour, player);
      }
    }
  },

  afterCollide: function () {
  }
});
TileData.BlockSinkData = TileData.BlockData.extend({
  tileInfo: game.TileInfo.TileBlockSink,
  _speedLimit: 5,
  _shouldBlockBottom: true,
  spSink1: null,
  spSink2: null,
  init: function () {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    this.refreshSign = false;
  },
  viewOut: function () {
  },
  sink: function (arg0, arg1, arg2) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    this.refreshSign = true;
    if (this.spSink1) { this.spSink1.runAction(cc.fadeOut(0.3)); }
    if (this.spSink2) { this.spSink2.runAction(cc.fadeOut(0.3)); }
  },
  checkOriginPosY: function (arg0, arg1) {
    return this.bottom + TileData_edge(this, "edgeBottom") + arg0.height / 2 - arg1.y;
  },
  checkOrigin: function (arg0, arg1) {
    var local0 = this.checkOriginPosY(arg1.boxSize, arg1.boxOffset);
    this.sink(arg0, local0, arg1);
  },
  checkTopPosY: function (arg0, arg1) {
    return this.top - TileData_edge(this, "edgeTop") + arg0.height / 2 - arg1.y;
  },
  checkTop: function (arg0, arg1) {
    var local0 = this.checkTopPosY(arg1.boxSize, arg1.boxOffset);
    this.sink(arg0, local0, arg1);
  },
  checkTopLeftPosY: function (arg0, arg1) {
    return this.checkTopPosY(arg0, arg1);
  },
  checkTopLeft: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkTop(arg0, arg1);
  },
  checkTopRightPosY: function (arg0, arg1) {
    return this.checkTopPosY(arg0, arg1);
  },
  checkTopRight: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkTop(arg0, arg1);
  },
  checkLeft: function () {
  },
  checkRight: function () {
  },
  checkBottom: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return TileData_correctPosition(this, arg0, arg1, "bottom");
  },
  checkBottomLeft: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkBottom(arg0, arg1);
  },
  checkBottomRight: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    return this.checkBottom(arg0, arg1);
  }
});
TileData.BlockSinkDataEfxPool = [];
TileData.BlockTrapData = TileData.BlockData.extend({
  tileInfo: game.TileInfo.TileBlockTrap,
  trapCtl: null,
  trapped: false,
  init: function () {
    var local0 = cc.BuilderReader.load(res.eleTrap_ccbi);
    local0.setPosition(cc.p((this.left + TILE_WIDTH_HALF), (this.bottom + TILE_WIDTH_HALF)));
    game.Data.oLyGame.lyMapBack.addChild(local0, 1);
    local0.controller.ccbInit();
    local0.controller.grid = cc.p(this.grid.x, (this.grid.y - 1));
    this.trapCtl = local0.controller;
    local0.controller.trapBlockData = this;
  },
  collide: function (ele, dir) {
    if (!this.trapped && dir === vee.Direction.Bottom) {
      this.trapped = true;
      if (this.trapCtl && this.trapCtl.attack) { this.trapCtl.attack(); }
    }
  }
});
TileData.BlockSmashData = TileData.BlockBreakableData.extend({
  tileInfo: game.TileInfo.TileBlockBreakable,
  skillObjType: game.ObjectType.BoxSmash,
  skillType: game.PlayerType.Smash,

  afterCollide: function (gid) {
    if (gid === game.BlockType.BreakableBlock) {
      return;
    }

    var item = Item.createWithInfo({
      type: this.skillObjType
    });
    if (!item) {
      return;
    }

    var pos = game.Logic.getTilePosByGrid(this.grid);
    item.controller.initPosition(cc.p(pos.x + TILE_WIDTH / 2, pos.y + TILE_WIDTH / 2));
    item.controller._layerBelong = this.layer;
    game.Logic.objMap.setObject(item.controller, this.grid);
    item.controller.setGridInMap(this.grid);
  }
});
TileData.BlockBulletData = TileData.BlockSmashData.extend({
  tileInfo: game.TileInfo.TileBlockBreakable,
  skillObjType: game.ObjectType.BoxBullet,
  skillType: game.PlayerType.Bullet
});
TileData.BlockTeleportData = TileData.BlockSmashData.extend({
  tileInfo: game.TileInfo.TileBlockBreakable,
  skillObjType: game.ObjectType.BoxTeleport,
  skillType: game.PlayerType.Teleport
});
TileData.BlockSkillBombData = TileData.BlockSmashData.extend({
  tileInfo: game.TileInfo.TileBlockBreakable,
  skillObjType: game.ObjectType.BoxBomb,
  skillType: game.PlayerType.Bomb
});
TileData.BlockHawkData = TileData.BlockSmashData.extend({
  tileInfo: game.TileInfo.TileBlockBreakable,
  skillObjType: game.ObjectType.BoxHawk,
  skillType: game.PlayerType.Hawk
});
TileData.BlockScaleData = TileData.BlockData.extend({
  tileInfo: game.TileInfo.TileBlockScale,
  _isScaleUp: false,
  _scaleDir: null,
  _lastScaleDir: null,
  _isAnimating: false,
  parentBlock: null,
  childBlocks: null,
  FINAL_TILEID_BASE: 141,
  FINAL_TILEID_TOPLEFT: 142,
  FINAL_TILEID_TOPRIGHT: 143,
  FINAL_TILEID_BOTTOMLEFT: 144,
  FINAL_TILEID_BOTTOMRIGHT: 145,
  _isStopCamera: false,
  init: function () {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    this.refreshSign = false;
  },
  collide: function (ele, dir) {
    if (!ele || !ele._pos || this._isAnimating) { return; }

    switch (dir) {
      case vee.Direction.Top:
        this._scaleDir = (game.Data.oPlayerCtl && game.Data.oPlayerCtl._faceTo === vee.Direction.Right) ?
          vee.Direction.TopRight : vee.Direction.TopLeft;
        this.scaleBlock(ele._pos, this._scaleDir);
        break;
      case vee.Direction.Bottom:
        if (ele._eleType === game.EleType.Player && ele.isSmashing && ele.isSmashing()) {
          this._scaleDir = (game.Data.oPlayerCtl && game.Data.oPlayerCtl._faceTo === vee.Direction.Right) ?
            vee.Direction.BottomRight : vee.Direction.BottomLeft;
          if (game.Data.isEnableCameraYOff) { this._isStopCamera = true; }
          this.scaleBlock(ele._pos, this._scaleDir);
        }
        break;
      case vee.Direction.Right:
        if (ele.isDashing && ele.isDashing()) {
          this._scaleDir = vee.Direction.TopRight;
          this.scaleBlock(ele._pos, this._scaleDir);
        }
        break;
      case vee.Direction.Left:
        if (ele.isDashing && ele.isDashing()) {
          this._scaleDir = vee.Direction.TopLeft;
          this.scaleBlock(ele._pos, this._scaleDir);
        }
        break;
    }
  },
  checkUpByDir: function (arg0) {
    return arg0 === vee.Direction.Top || arg0 === vee.Direction.TopLeft || arg0 === vee.Direction.TopRight;
  },
  scaleBlock: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    if (arg0 > 0) { this.scaleUp(); } else { this.scaleDown(); }
  },
  scaleUp: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    this._scaleState = 1;
    this.createBlocks && this.createBlocks();
  },
  scaleDown: function (arg0, arg1) {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    this._scaleState = 0;
    this.createBlocks && this.createBlocks();
  },
  createBlocks: function () {
    // RECOVERY_UNCERTAIN_TILEINFO: reconstructed from bytecode; verify collision behavior for this tile type.
    this.createChildBlocks && this.createChildBlocks();
  },
  getBaseBlockScaleUpGid: function () {
    return this.gid;
  },
  getNewGidByGrid: function (arg0) {
    return this.getBaseBlockScaleUpGid();
  },
  createChildBlocks: function (arg0) {
    var local0 = this.getNewGidByGrid(arg0);
    var local1 = game.Logic.getTileDataByGid(local0, arg0, this.layer);
    local1.parentBlock = this;
    local1._isScaleUp = true;
    game.Logic.map.setObject(local1, arg0);
    this.layer.setTileGID(local0, arg0);
    return local1;
  }
});
TileData.RunBackwardBlockData = TileData.BlockData.extend({
  collide: function (ele, dir) {
    if (!ele || ele._eleType !== game.EleType.Player) {
      return;
    }
    var isParkour = game.Data.stageType === game.StageType.Parkour;
    if (!isParkour && ele._moveState !== MoveState.Breath) {
      return;
    }
    if (dir === vee.Direction.Right && ele.setFaceTo) {
      ele.setFaceTo(vee.Direction.Left, true);
    } else if (dir === vee.Direction.Left && ele.setFaceTo) {
      ele.setFaceTo(vee.Direction.Right, true);
    }
    if (isParkour && ele.parkourMove) {
      ele.parkourMove();
    }
  }
});


// Collision core restored closer to the original bytecode.  The first readable
// recovery used one generic rectangle helper and treated edgeLeft/edgeRight as
// horizontal insets.  In this game data edgeLeft is the block surface height;
// for full blocks it is 64.  Treating it as an inset makes the collision rect
// invalid and the player falls through the map.
function TileData_playerHalfW(ele) {
  return ele && ele.boxSize ? ele.boxSize.width / 2 : TILE_WIDTH_HALF;
}
function TileData_playerHalfH(ele) {
  return ele && ele.boxSize ? ele.boxSize.height / 2 : TILE_WIDTH_HALF;
}
function TileData_playerOffsetX(ele) {
  return ele && ele.boxOffset ? ele.boxOffset.x : 0;
}
function TileData_playerOffsetY(ele) {
  return ele && ele.boxOffset ? ele.boxOffset.y : 0;
}
function TileData_blockTopY(tile, ele) {
  return tile.bottom + TileData_edge(tile, "edgeLeft") + TileData_playerHalfH(ele) - TileData_playerOffsetY(ele);
}
function TileData_blockBottomY(tile, ele) {
  return tile.bottom - TileData_playerHalfH(ele) - TileData_playerOffsetY(ele);
}
function TileData_triggerBlock(tile, dir, ele) {
  if (game && game.Logic && game.Logic.checkTileTrigger) {
    game.Logic.checkTileTrigger(tile.grid, dir, tile, ele);
  }
}
function TileData_landOnBlock(tile, pos, ele, y, trigger) {
  if (trigger) {
    TileData_triggerBlock(tile, vee.Direction.Bottom, ele);
  }
  if (ele && typeof ele.downToBarrier === "function") {
    ele.downToBarrier(tile);
  }
  if (ele && typeof ele.setJumping === "function") {
    ele.setJumping(false);
  }
  if (game && game.Logic && game.Logic.calcSpeedScaleRate && tile.tileInfo) {
    game.Logic.calcSpeedScaleRate(ele, tile.tileInfo);
  }
  return cc.p(pos.x, y);
}
function TileData_blockCheckOriginPosY(size, offset) {
  size = size || cc.size(TILE_WIDTH, TILE_WIDTH);
  offset = offset || cc.p(0, 0);
  return this.bottom + TileData_edge(this, "edgeLeft") + size.height / 2 - offset.y;
}
function TileData_blockCheckOrigin(pos, ele) {
  if (!pos || typeof pos.x !== "number" || typeof pos.y !== "number" || !ele || !ele.boxSize) { return null; }
  var y = this.checkOriginPosY(ele.boxSize, ele.boxOffset);
  if (ele && typeof ele.isJumping === "function" && ele.isJumping()) {
    if (y > pos.y && ele._speedY < 0) {
      return TileData_landOnBlock(this, pos, ele, y, false);
    }
    return null;
  }
  return TileData_landOnBlock(this, pos, ele, y, false);
}
function TileData_blockCheckTopPosY(size, offset) {
  return this.bottom + TileData_edge(this, "edgeLeft") + size.height / 2 - offset.y;
}
function TileData_blockCheckTop(pos, ele) {
  if (!pos || typeof pos.x !== "number" || typeof pos.y !== "number" || !ele || !ele.boxSize) { return null; }
  var y = this.checkTopPosY(ele.boxSize, ele.boxOffset);
  if (y <= pos.y) {
    return null;
  }
  if (ele && typeof ele.isJumping === "function" && ele.isJumping()) {
    if (ele._speedY < 0) {
      return TileData_landOnBlock(this, pos, ele, y, true);
    }
    return null;
  }
  return TileData_landOnBlock(this, pos, ele, y, false);
}
function TileData_blockCheckTopLeft(pos, ele) {
  if (!pos || !ele || !ele.boxSize) { return null; }
  if (this.left - pos.x > game.Data.playerBottomEdgeWidth) {
    return null;
  }
  var y = this.checkTopLeftPosY(ele.boxSize, ele.boxOffset);
  if (ele.isJumping && ele.isJumping()) {
    if (y <= pos.y) { return null; }
    var sideX = this.left - TileData_playerHalfW(ele);
    if (sideX >= pos.x) { return null; }
    var prev = TileData_getPrevElePos(ele);
    if (prev && prev.y >= y && ele._speedY < 0) {
      return TileData_landOnBlock(this, pos, ele, y, true);
    }
    if (ele._speedX > 0) {
      TileData_triggerBlock(this, vee.Direction.Bottom, ele);
      if (ele.rightToBarrier) { ele.rightToBarrier(this); }
    }
    var dx = pos.x - sideX;
    if (dx > 8) { dx = 8; }
    return cc.p(pos.x - dx, pos.y);
  }
  return TileData_landOnBlock(this, pos, ele, y, false);
}
function TileData_blockCheckTopRight(pos, ele) {
  if (!pos || !ele || !ele.boxSize) { return null; }
  if (pos.x - this.right > game.Data.playerBottomEdgeWidth &&
      !(ele.isJumping && ele.isJumping())) {
    return null;
  }
  var y = this.checkTopRightPosY(ele.boxSize, ele.boxOffset);
  if (ele.isJumping && ele.isJumping()) {
    if (y <= pos.y) { return null; }
    var sideX = this.right + TileData_playerHalfW(ele);
    if (sideX <= pos.x) { return null; }
    var prev = TileData_getPrevElePos(ele);
    if (prev && prev.y >= y && ele._speedY < 0) {
      return TileData_landOnBlock(this, pos, ele, y, true);
    }
    if (ele._speedX < 0) {
      TileData_triggerBlock(this, vee.Direction.Bottom, ele);
      if (ele.leftToBarrier) { ele.leftToBarrier(this); }
    }
    var dx = sideX - pos.x;
    if (dx > 8) { dx = 8; }
    return cc.p(pos.x + dx, pos.y);
  }
  return TileData_landOnBlock(this, pos, ele, y, false);
}
function TileData_blockCheckLeft(pos, ele) {
  if (pos.y >= this.bottom + TileData_edge(this, "edgeLeft") + TileData_playerHalfH(ele)) {
    return null;
  }
  var x = this.left - TileData_playerHalfW(ele) - TileData_playerOffsetX(ele);
  if (x < pos.x) {
    TileData_triggerBlock(this, vee.Direction.Right, ele);
    if (ele && typeof ele.rightToBarrier === "function") {
      ele.rightToBarrier(this);
    }
    var dx = pos.x - x;
    if (dx > 8) { dx = 8; }
    return cc.p(pos.x - dx, pos.y);
  }
  return null;
}
function TileData_blockCheckRight(pos, ele) {
  if (pos.y >= this.bottom + TileData_edge(this, "edgeLeft") + TileData_playerHalfH(ele)) {
    return null;
  }
  var x = this.right + TileData_playerHalfW(ele) - TileData_playerOffsetX(ele);
  if (x > pos.x) {
    TileData_triggerBlock(this, vee.Direction.Left, ele);
    if (ele && typeof ele.leftToBarrier === "function") {
      ele.leftToBarrier(this);
    }
    var dx = x - pos.x;
    if (dx > 8) { dx = 8; }
    return cc.p(pos.x + dx, pos.y);
  }
  return null;
}
function TileData_blockCheckBottom(pos, ele) {
  var y = this.bottom - TileData_playerHalfH(ele) - TileData_playerOffsetY(ele);
  if (y < pos.y) {
    TileData_triggerBlock(this, vee.Direction.Top, ele);
    if (ele && ele._speedY > 0 && typeof ele.upToBarrier === "function") {
      ele.upToBarrier(this);
    }
    return cc.p(pos.x, y);
  }
  return null;
}
function TileData_blockCheckBottomLeft(pos, ele) {
  if (this.left - pos.x < game.Data.playerTopEdgeWidth) {
    return this.checkBottom(pos, ele);
  }
  return null;
}
function TileData_blockCheckBottomRight(pos, ele) {
  if (pos.x - this.right < game.Data.playerTopEdgeWidth) {
    return this.checkBottom(pos, ele);
  }
  return null;
}
function TileData_installSolidBlockCollision(klass) {
  if (!klass || !klass.prototype) { return; }
  klass.prototype.checkOriginPosY = TileData_blockCheckOriginPosY;
  klass.prototype.checkOrigin = TileData_blockCheckOrigin;
  klass.prototype.checkTopPosY = TileData_blockCheckTopPosY;
  klass.prototype.checkTop = TileData_blockCheckTop;
  klass.prototype.checkTopLeftPosY = TileData_blockCheckTopPosY;
  klass.prototype.checkTopLeft = TileData_blockCheckTopLeft;
  klass.prototype.checkTopRightPosY = TileData_blockCheckTopPosY;
  klass.prototype.checkTopRight = TileData_blockCheckTopRight;
  klass.prototype.checkLeft = TileData_blockCheckLeft;
  klass.prototype.checkRight = TileData_blockCheckRight;
  klass.prototype.checkBottom = TileData_blockCheckBottom;
  klass.prototype.checkBottomLeft = TileData_blockCheckBottomLeft;
  klass.prototype.checkBottomRight = TileData_blockCheckBottomRight;
}
TileData_installSolidBlockCollision(TileData.BlockData);
TileData_installSolidBlockCollision(TileData.BlockHideData);
TileData_installSolidBlockCollision(TileData.BlockHurtData);
TileData_installSolidBlockCollision(TileData.BlockHurtHalfData);
TileData_installSolidBlockCollision(TileData.DynamicBlockData);
TileData_installSolidBlockCollision(TileData.BlockBombData);
TileData_installSolidBlockCollision(TileData.BlockBreakableData);
TileData_installSolidBlockCollision(TileData.BlockTrapData);
TileData_installSolidBlockCollision(TileData.RunBackwardBlockData);


// Restored special collision for one-way/bounce platforms and slopes.
// The generic rectangle fallback makes one-way platforms solid from the side
// and makes triangular tiles behave like full square blocks.
function TileData_localPos(tile, pos) {
  return cc.p(pos.x - tile.left, pos.y - tile.bottom);
}
function TileData_clamp(v, lo, hi) {
  return v < lo ? lo : (v > hi ? hi : v);
}
function TileData_getPrevElePos(ele) {
  if (ele && typeof ele.getElePosition === "function") {
    var p = ele.getElePosition();
    if (p && typeof p.y === "number") { return p; }
  }
  if (ele && ele._lastPosition) { return ele._lastPosition; }
  return null;
}
function TileData_getTopSurfaceY(tile, pos, ele) {
  var local = TileData_localPos(tile, pos);
  var x = TileData_clamp(local.x, 0, TILE_WIDTH);
  var info = tile.tileInfo || {};
  var y = tile.bottom + x * (info.slope || 0) + TileData_edge(tile, "edgeLeft") + TileData_playerHalfH(ele) - TileData_playerOffsetY(ele);
  var capEdge = (info.slope || 0) < 0 ? TileData_edge(tile, "edgeLeft") : TileData_edge(tile, "edgeRight");
  var capY = tile.bottom + capEdge + TileData_playerHalfH(ele) - TileData_playerOffsetY(ele);
  return Math.min(y, capY);
}
function TileData_landOnSpecialSurface(tile, pos, ele, y, trigger) {
  if (trigger) {
    TileData_triggerBlock(tile, vee.Direction.Bottom, ele);
  }
  if (ele && typeof ele.downToBarrier === "function") {
    ele.downToBarrier(tile);
  }
  if (ele && typeof ele.setJumping === "function") {
    ele.setJumping(false);
  }
  if (game && game.Logic && game.Logic.calcSpeedScaleRate && tile.tileInfo) {
    game.Logic.calcSpeedScaleRate(ele, tile.tileInfo);
  }
  return cc.p(pos.x, y);
}
function TileData_slopeTopCheck(tile, pos, ele, trigger) {
  if (!pos || !ele || !ele.boxSize) { return null; }
  var y = TileData_getTopSurfaceY(tile, pos, ele);

  if (ele && typeof ele.isJumping === "function" && ele.isJumping()) {
    // While jumping/falling the original bytecode only collides when the slope
    // surface is above the candidate position.  For checkTop it additionally
    // requires falling speed, so a jump from below is not stopped by the slope.
    if (y <= pos.y) { return null; }
    if (trigger) {
      if (ele._speedY < 0) {
        return TileData_landOnSpecialSurface(tile, pos, ele, y, true);
      }
      return null;
    }
    if (ele._speedY < 0) {
      return TileData_landOnSpecialSurface(tile, pos, ele, y, false);
    }
    return cc.p(pos.x, y);
  }

  // Important for walking over double/half slope tiles and for downhill
  // animation: when the player is already grounded, the slope must snap both
  // upward and downward to its surface.  Returning null for y <= pos.y makes
  // the player leave the ground on descending slopes and hit the next half
  // slope as if it were a small wall.
  return TileData_landOnSpecialSurface(tile, pos, ele, y, trigger);
}
function TileData_slopeCheckOrigin(pos, ele) {
  return TileData_slopeTopCheck(this, pos, ele, false);
}
function TileData_slopeCheckTop(pos, ele) {
  return TileData_slopeTopCheck(this, pos, ele, true);
}
function TileData_slopeCheckTopLeft(pos, ele) {
  if (this.left - pos.x > game.Data.playerBottomEdgeWidth) { return null; }
  return this.checkTop(pos, ele);
}
function TileData_slopeCheckTopRight(pos, ele) {
  if (pos.x - this.right > game.Data.playerBottomEdgeWidth) { return null; }
  return this.checkTop(pos, ele);
}
function TileData_slopeSideTolerance(ele) {
  // Half-slope tiles meet with small one-pixel edge differences
  // (for example 0->half ends at 32 while half->top starts at 33).
  // Without tolerance the next slope is treated as a vertical wall.
  return Math.max(2, Math.min(8, TileData_playerHalfH(ele) * 0.25));
}
function TileData_slopeCheckLeft(pos, ele) {
  if (!pos || !ele || !ele.boxSize) { return null; }
  var edge = TileData_edge(this, "edgeLeft");
  // Match the original bytecode: side blocking for a top-oriented slope uses
  // the element position against tile.bottom + edgeLeft, not surfaceY + halfH.
  // Adding the player half height here makes the next half-slope look like a
  // vertical wall, so the player cannot climb from 0->half to half->top.
  if (pos.y >= this.bottom + edge - TileData_slopeSideTolerance(ele)) { return null; }
  var x = this.left - TileData_playerHalfW(ele) - TileData_playerOffsetX(ele);
  if (x < pos.x) {
    TileData_triggerBlock(this, vee.Direction.Right, ele);
    if (ele && typeof ele.rightToBarrier === "function") { ele.rightToBarrier(this); }
    var dx = pos.x - x;
    if (dx > 8) { dx = 8; }
    return cc.p(pos.x - dx, pos.y);
  }
  return null;
}
function TileData_slopeCheckRight(pos, ele) {
  if (!pos || !ele || !ele.boxSize) { return null; }
  var edge = TileData_edge(this, "edgeRight");
  // Same as checkLeft: the original check uses the raw side height.
  // This keeps the vertical solid part of the triangle, but stops blocking
  // normal walking across connected/half slope tiles.
  if (pos.y >= this.bottom + edge - TileData_slopeSideTolerance(ele)) { return null; }
  var x = this.right + TileData_playerHalfW(ele) - TileData_playerOffsetX(ele);
  if (x > pos.x) {
    TileData_triggerBlock(this, vee.Direction.Left, ele);
    if (ele && typeof ele.leftToBarrier === "function") { ele.leftToBarrier(this); }
    var dx = x - pos.x;
    if (dx > 8) { dx = 8; }
    return cc.p(pos.x + dx, pos.y);
  }
  return null;
}
function TileData_installTopSlopeCollision(klass) {
  if (!klass || !klass.prototype) { return; }
  klass.prototype.checkOriginPosY = function (local, size, offset) {
    size = size || cc.size(TILE_WIDTH, TILE_WIDTH);
    offset = offset || cc.p(0, 0);
    var fakeEle = { boxSize: size, boxOffset: offset };
    return TileData_getTopSurfaceY(this, cc.p(this.left + (local ? local.x : 0), this.bottom + (local ? local.y : 0)), fakeEle);
  };
  klass.prototype.checkOrigin = TileData_slopeCheckOrigin;
  klass.prototype.checkTopPosY = klass.prototype.checkOriginPosY;
  klass.prototype.checkTop = TileData_slopeCheckTop;
  klass.prototype.checkTopLeftPosY = klass.prototype.checkOriginPosY;
  klass.prototype.checkTopLeft = TileData_slopeCheckTopLeft;
  klass.prototype.checkTopRightPosY = klass.prototype.checkOriginPosY;
  klass.prototype.checkTopRight = TileData_slopeCheckTopRight;
  klass.prototype.checkLeft = TileData_slopeCheckLeft;
  klass.prototype.checkRight = TileData_slopeCheckRight;
}
function TileData_sideSlopeSurfaceY(tile, pos, ele, rightSlope) {
  var local = TileData_localPos(tile, pos);
  var x = TileData_clamp(local.x, 0, TILE_WIDTH);
  var info = tile.tileInfo || {};
  var y;
  if (rightSlope) {
    if (x < TileData_edge(tile, "edgeTop")) {
      y = tile.bottom + TILE_WIDTH;
    } else {
      y = tile.bottom + TILE_WIDTH + (x - TileData_edge(tile, "edgeTop")) * (info.slope || 0);
    }
    if (x >= TileData_edge(tile, "edgeBottom")) { return null; }
  } else {
    if (x > TileData_edge(tile, "edgeTop")) {
      y = tile.bottom + TILE_WIDTH;
    } else {
      y = tile.bottom + (x - TileData_edge(tile, "edgeBottom")) * (info.slope || 0);
    }
    if (x <= TileData_edge(tile, "edgeBottom")) { return null; }
  }
  return y + TileData_playerHalfH(ele) - TileData_playerOffsetY(ele);
}
function TileData_sideSlopeTopCheck(tile, pos, ele, rightSlope, trigger) {
  if (!pos || !ele || !ele.boxSize) { return null; }
  var y = TileData_sideSlopeSurfaceY(tile, pos, ele, rightSlope);
  if (y == null) { return null; }

  if (ele && typeof ele.isJumping === "function" && ele.isJumping()) {
    if (y <= pos.y) { return null; }
    if (trigger) {
      if (ele._speedY < 0) {
        return TileData_landOnSpecialSurface(tile, pos, ele, y, true);
      }
      return null;
    }
    if (ele._speedY < 0) {
      return TileData_landOnSpecialSurface(tile, pos, ele, y, false);
    }
    return cc.p(pos.x, y);
  }

  return TileData_landOnSpecialSurface(tile, pos, ele, y, trigger);
}
function TileData_leftSideSlopeCheckOrigin(pos, ele) {
  return TileData_sideSlopeTopCheck(this, pos, ele, false, false);
}
function TileData_leftSideSlopeCheckTop(pos, ele) {
  return TileData_sideSlopeTopCheck(this, pos, ele, false, true);
}
function TileData_rightSideSlopeCheckOrigin(pos, ele) {
  return TileData_sideSlopeTopCheck(this, pos, ele, true, false);
}
function TileData_rightSideSlopeCheckTop(pos, ele) {
  return TileData_sideSlopeTopCheck(this, pos, ele, true, true);
}
function TileData_leftSideSlopeCheckLeft(pos, ele) {
  if (!pos || !ele || !ele.boxSize) { return null; }
  var local = TileData_localPos(this, pos);
  var x = this.left + local.y * (this.tileInfo ? this.tileInfo.slope : 0) + TileData_edge(this, "edgeBottom");
  if (ele._speedX >= 0 && x < pos.x) {
    if (ele && typeof ele.rightToBarrier === "function") { ele.rightToBarrier(this); }
    if (game && game.Logic && game.Logic.calcSpeedScaleRate) { game.Logic.calcSpeedScaleRate(ele, this.tileInfo); }
    return cc.p(x, pos.y);
  }
  return null;
}
function TileData_rightSideSlopeCheckRight(pos, ele) {
  if (!pos || !ele || !ele.boxSize) { return null; }
  var local = TileData_localPos(this, pos);
  var x = this.left + local.y * (this.tileInfo ? this.tileInfo.slope : 0) + TileData_edge(this, "edgeBottom");
  if (ele._speedX <= 0 && x > pos.x) {
    if (ele && typeof ele.leftToBarrier === "function") { ele.leftToBarrier(this); }
    if (game && game.Logic && game.Logic.calcSpeedScaleRate) { game.Logic.calcSpeedScaleRate(ele, this.tileInfo); }
    return cc.p(x, pos.y);
  }
  return null;
}
function TileData_installSideSlopeCollision(klass, rightSlope) {
  if (!klass || !klass.prototype) { return; }
  klass.prototype.checkOrigin = rightSlope ? TileData_rightSideSlopeCheckOrigin : TileData_leftSideSlopeCheckOrigin;
  klass.prototype.checkTop = rightSlope ? TileData_rightSideSlopeCheckTop : TileData_leftSideSlopeCheckTop;
  klass.prototype.checkTopLeft = TileData_slopeCheckTopLeft;
  klass.prototype.checkTopRight = TileData_slopeCheckTopRight;
  if (rightSlope) {
    klass.prototype.checkLeft = function () { return null; };
    klass.prototype.checkRight = TileData_rightSideSlopeCheckRight;
    klass.prototype.checkBottom = function (pos, ele) {
      if (pos && pos.x < this.left + TileData_edge(this, "edgeBottom")) { return TileData_blockCheckBottom.call(this, pos, ele); }
      return null;
    };
  } else {
    klass.prototype.checkLeft = TileData_leftSideSlopeCheckLeft;
    klass.prototype.checkRight = function () { return null; };
    klass.prototype.checkBottom = function (pos, ele) {
      if (pos && pos.x > this.left + TileData_edge(this, "edgeBottom")) { return TileData_blockCheckBottom.call(this, pos, ele); }
      return null;
    };
  }
  klass.prototype.checkBottomLeft = function (pos, ele) { return this.checkBottom(pos, ele); };
  klass.prototype.checkBottomRight = function (pos, ele) { return this.checkBottom(pos, ele); };
}
function TileData_platformSurfaceY(tile, ele) {
  var y = tile.bottom + TileData_edge(tile, "edgeLeft");
  if (tile.tile && typeof tile.tile.getPositionY === "function" && typeof tile.tile.getScaleY === "function") {
    y = tile.tile.getPositionY() + tile.tile.getScaleY() * TILE_WIDTH;
  }
  return y + TileData_playerHalfH(ele) - TileData_playerOffsetY(ele);
}
function TileData_canLandOnPlatform(tile, pos, ele, y) {
  if (!ele) { return true; }
  if (ele._speedY > 0) { return false; }
  var prev = TileData_getPrevElePos(ele);
  if (prev && typeof prev.y === "number") {
    return prev.y >= y - 1 && pos.y <= y + 8;
  }
  return pos.y <= y + 8;
}
function TileData_platformCheckTop(pos, ele, trigger) {
  if (!pos || !ele || !ele.boxSize) { return null; }
  var y = TileData_platformSurfaceY(this, ele);
  if (y <= pos.y) { return null; }
  if (!TileData_canLandOnPlatform(this, pos, ele, y)) { return null; }
  return TileData_landOnSpecialSurface(this, pos, ele, y, trigger);
}
function TileData_platformCheckOrigin(pos, ele) {
  return TileData_platformCheckTop.call(this, pos, ele, false);
}
function TileData_platformCheckTopDir(pos, ele) {
  return TileData_platformCheckTop.call(this, pos, ele, true);
}
function TileData_installPlatformCollision(klass) {
  if (!klass || !klass.prototype) { return; }
  klass.prototype.checkOrigin = TileData_platformCheckOrigin;
  klass.prototype.checkTop = TileData_platformCheckTopDir;
  klass.prototype.checkTopLeft = TileData_blockCheckTopLeft;
  klass.prototype.checkTopRight = TileData_blockCheckTopRight;
  klass.prototype.checkLeft = function () { return null; };
  klass.prototype.checkRight = function () { return null; };
  klass.prototype.checkBottom = function () { return null; };
  klass.prototype.checkBottomLeft = function () { return null; };
  klass.prototype.checkBottomRight = function () { return null; };
}
TileData_installTopSlopeCollision(TileData.UPSlopeData);
TileData_installTopSlopeCollision(TileData.UPSlopeZeroToHalfData);
TileData_installTopSlopeCollision(TileData.UPSlopeHalfToTopData);
TileData_installTopSlopeCollision(TileData.DOWNSlopeData);
TileData_installTopSlopeCollision(TileData.DOWNSlopeTopToHalfData);
TileData_installTopSlopeCollision(TileData.DOWNSlopeHalfToZertData);
TileData_installSideSlopeCollision(TileData.UPSlopeLeftToZero, false);
TileData_installSideSlopeCollision(TileData.UPSlopeLeftToHalfData, false);
TileData_installSideSlopeCollision(TileData.DOWNSlopeRightToZeroData, true);
TileData_installSideSlopeCollision(TileData.DOWNSlopeRightToHalfData, true);
TileData_installPlatformCollision(TileData.BounceBlockData);
TileData_installPlatformCollision(TileData.BlockOneWayData);

TileData.gid2td = {
  Tile1: TileData.BlockData,
  Tile2: TileData.BlockData,
  Tile3: TileData.BlockData,
  Tile4: TileData.BlockData,
  Tile5: TileData.BlockData,
  Tile6: TileData.BlockData,
  Tile7: TileData.BlockData,
  Tile8: TileData.BlockData,
  Tile9: TileData.BlockData,
  Tile10: TileData.BlockData,
  Tile11: TileData.BlockData,
  Tile12: TileData.BlockData,
  Tile13: TileData.BlockData,
  Tile14: TileData.BlockData,
  Tile15: TileData.BlockData,
  Tile16: TileData.BlockData,
  Tile17: TileData.BlockData,
  Tile18: TileData.BlockData,
  Tile19: TileData.BlockData,
  Tile20: TileData.BlockData,
  Tile30: TileData.BlockData,
  Tile37: TileData.BlockSinkData,
  Tile38: TileData.BlockSinkData,
  Tile41: TileData.UPSlopeData,
  Tile42: TileData.DOWNSlopeData,
  Tile43: TileData.UPSlopeZeroToHalfData,
  Tile44: TileData.UPSlopeHalfToTopData,
  Tile45: TileData.DOWNSlopeTopToHalfData,
  Tile46: TileData.DOWNSlopeHalfToZertData,
  Tile47: TileData.UPSlopeLeftToZero,
  Tile48: TileData.DOWNSlopeRightToZeroData,
  Tile57: TileData.UPSlopeLeftToHalfData,
  Tile58: TileData.DOWNSlopeRightToHalfData,
  Tile61: TileData.DynamicBlockData,
  Tile62: TileData.BlockBreakableData,
  Tile64: TileData.BlockData,
  Tile65: TileData.BounceBlockData,
  Tile66: TileData.BlockBreakableData,
  Tile67: TileData.BlockOneWayData,
  Tile68: TileData.BlockOneWayData,
  Tile69: TileData.BlockBreakableData,
  Tile70: TileData.BlockBreakableData,
  Tile134: TileData.RunBackwardBlockData,
  Tile135: TileData.RunBackwardBlockData,
  Tile71: TileData.BlockHurtHalfData,
  Tile72: TileData.BlockHurtData,
  Tile73: TileData.BlockHurtData,
  Tile77: TileData.BlockHideData,
  Tile78: TileData.BlockFadeData,
  Tile79: TileData.BlockBombData,
  Tile93: TileData.BlockOneWayData,
  Tile94: TileData.BlockData,
  Tile97: TileData.BlockOneWayData,
  Tile108: TileData.BlockData,
  Tile109: TileData.BlockData,
  Tile110: TileData.BlockData,
  Tile122: TileData.BlockTrapData,
  Tile136: TileData.BlockHawkData,
  Tile137: TileData.BlockSmashData,
  Tile138: TileData.BlockBulletData,
  Tile139: TileData.BlockTeleportData,
  Tile140: TileData.BlockSkillBombData,
  Tile141: TileData.BlockScaleData,
  Tile142: TileData.BlockScaleData,
  Tile143: TileData.BlockScaleData,
  Tile144: TileData.BlockScaleData,
  Tile145: TileData.BlockScaleData
};
