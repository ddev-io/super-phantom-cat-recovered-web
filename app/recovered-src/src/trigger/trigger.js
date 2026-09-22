// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/trigger/trigger.dis
var Trigger = cc.Class.extend({
  _eleType: game.EleType.Trigger,
  name: null,
  type: null,
  func: function () {
    cc.log((("Trigger : '" + name) + "' didn`t implement a function."));
  }
});
Trigger.resetTriggerSign = function () {
    Trigger.TutorialStep.triggerSign = {};
  };
Trigger.getTrigger = function (arg0) {
    return game.Logic.objMap.getObject(arg0);
  };
Trigger.setTrigger = function (arg0, arg1) {
    game.Logic.objMap.setObject(arg1, arg0);
  };
Trigger.create = function (arg0) {
    if (!arg0.type) {
      cc.log("triggerInfo.type is empty!");
      return;
    }
    if (!Trigger[arg0.type]) {
      cc.log("Trigger Constructor is not found :" + arg0.type);
    }
    var local0 = new Trigger[arg0.type]();
    local0.name = arg0.name;
    local0.type = arg0.type;
    local0.grid = cc.p(arg0.x, arg0.y);
    return local0;
  };
Trigger.SwitchTriggerType = {
  Show: 1,
  Hide: 2,
  Toggle: 3
};
Trigger.showCCB = function (arg0, arg1, arg2) {
    var local0 = arguments[3];
    if (this._isPlaying) {
      return;
    }
    this._isPlaying = true;
    var local1 = cc.BuilderReader.load(arg0 || res.tip1_ccbi);
    game.Data.oLyGame.lyMap.addChild(local1);
    var local2 = game.Logic.getTilePosByGrid(arg1);
    local1.setPosition(cc.p(local2.x + game.Data.tileSizeWidth / 2, local2.y + game.Data.tileSizeWidth / 2));
    local1.runAction(cc.sequence(
      cc.delayTime(local1.animationManager._sequences[0]._duration),
      cc.callFunc(function () {
        if (local0) {
          local1.controller.playAnimate(local0);
        }
      }),
      cc.callFunc(arg2),
      cc.callFunc(function () {
        this._isPlaying = false;
      }.bind(this)),
      cc.callFunc(function () {
        this.removeFromParent();
      }.bind(local1))
    ));
  };
Trigger.ShowCCB = Trigger.extend({
  func: function (arg0) {
    var local0 = this.name.split(",");
    if (local0.length < 2) {
      Trigger.showCCB("res/" + this.name + ".ccbi", arg0);
    } else {
      Trigger.showCCB("res/" + local0[0] + ".ccbi", arg0, null, local0[1]);
    }
  }
});
Trigger.TutorialStep = Trigger.extend({
  func: function (arg0) {
    if (EleGuide.ctl) {
      var local0 = this.name.split(",");
      if (local0.length !== 4) {
        cc.log("Error in Trigger.TutorialStep, name = " + this.name);
        return;
      }
      if (Trigger.TutorialStep.triggerSign[local0[3]]) {
        cc.log("tutorial step has shown");
        return;
      }
      Trigger.TutorialStep.triggerSign[local0[3]] = true;
      var local1 = cc.p(parseInt(local0[0]), parseInt(local0[1]));
      local1 = vee.Utils.pAdd(local1, arg0);
      if (local0[2] === "hide") {
        EleGuide.showGuide(local1, local0[2], function () {
          vee.PopMgr.closeLayerByCtl(EleGuide.ctl);
        });
      } else {
        EleGuide.showGuide(local1, local0[2], null);
      }
    }
  }
});
Trigger.TutorialStep.triggerSign = {};
Trigger.ShowFinger = Trigger.extend({
  func: function (arg0) {
    if (this._isPlaying) {
      return false;
    }
    this._isPlaying = true;
    var local0 = cc.BuilderReader.load(res.tipsFinger_ccbi);
    var local1 = game.Logic.getTilePosByGrid(arg0);
    local0.setPosition(cc.p(local1.x + game.Data.tileSizeWidth / 2, local1.y + game.Data.tileSizeWidth / 2));
    game.Data.oLyGame.lyMap.addChild(local0, 99);
    var local2;
    if (this.name === "right") {
      local2 = "0";
    } else if (this.name === "top_right") {
      local2 = "45";
    } else if (this.name === "top") {
      local2 = "90";
    } else if (this.name === "top_left") {
      local2 = "45";
      local0.setScaleX(-1);
    } else if (this.name === "left") {
      local2 = "0";
      local0.setScaleX(-1);
    } else if (this.name === "bottom_left") {
      local2 = "-45";
      local0.setScaleX(-1);
    } else if (this.name === "bottom") {
      local2 = "-90";
    } else if (this.name === "bottom_right") {
      local2 = "-45";
    }
    local0.controller.playAnimate(local2, function () {
      local0.controller.playAnimate(local2 + "_out", function () {
        local0.removeFromParent();
        this._isPlaying = false;
      }.bind(this));
    }.bind(this));
    return true;
  }
});
Trigger.DeadZone = Trigger.extend({
  dead: false,
  getRevivePoint: function () {
    var local0 = this.name;
    if (local0 && local0 !== "") {
      local0 = local0.replace("(", "");
      local0 = local0.replace(")", "");
      var local1 = local0.split(",");
      if (local1.length !== 2) {
        cc.log("zq debug deadzone revive point error!!!grid==x=%d y=%d", this.grid.x, this.grid.y);
        return null;
      }
      return cc.p(local1[0], local1[1]);
    }
    return null;
  },
  func: function () {
    if (this.dead) {
      return;
    }
    if (game.Data.playerHawk) {
      game.Data.oPlayerCtl.reviveFloat();
      return;
    }
    var local0 = this.getRevivePoint();
    cc.log("zq debug revival count=====%d", game.Logic._deadZoneRevivalCount);
    if (local0 !== null && game.Data.isFreeGame && vee.Ad.checkCacheVideoAd() && game.Logic._deadZoneRevivalCount > 0) {
      cc.log("zq debug show revival video alert pop");
      game.Logic._deadZoneRevivalCount -= 1;
      game.Data.oPlayerCtl.reviveGrid = local0;
      ccbRevivalVideoAlert.show(ccbRevivalVideoAlert.revivalType.DEADZONE);
      return;
    }
    this.dead = true;
    this.overEvent();
  },
  overEvent: function () {
    cc.log("zq debug deadzone 11111111111111");
    game.Data.gameFail();
    cc.log("zq debug deadzone 22222222222222");
    game.Data.oLyGame.gameSlow();
    cc.log("zq debug deadzone 33333333333333");
    game.Data.stageFinish(game.FinishType.DEAD);
    cc.log("zq debug deadzone 44444444444444");
    game.Data.oPlayerCtl.gameOverFall(function () {
      cc.log("zq debug deadzone 5555555555");
      vee.GameModule.SceneMgr.openOver();
    }.bind(this));
    cc.log("zq debug deadzone 66666666666666");
  }
});
Trigger.cameraYFreezed = false;
Trigger.CameraYFreeze = Trigger.extend({
  func: function () {
    game.Data.oLyGame.setCameraYFreeze(true, game.Data.oPlayerCtl.getElePosition().y);
    Trigger.cameraYFreezed = true;
    if (game.Data.oPlayerCtl._isReviveFloat) {
      Trigger.CameraYResume.entityFunc();
    }
  }
});
Trigger.CameraYResume = Trigger.extend({
  func: function () {
    if (Trigger.cameraYFreezed) {
      game.Data.cameraYPos = game.Data.cameraYPos - (game.Data.oLyGame._freezeY - game.Data.oPlayerCtl._pos.y);
      game.Data.cameraYrevived = false;
      game.Data.oLyGame.setCameraYFreeze(false, 0);
      Trigger.cameraYFreezed = false;
    }
  }
});
Trigger.CameraYResume.entityFunc = function () {
    if (Trigger.cameraYFreezed) {
      game.Data.cameraYPos = game.Data.cameraYPos - (game.Data.oLyGame._freezeY - game.Data.oPlayerCtl._pos.y);
      game.Data.cameraYrevived = false;
      game.Data.oLyGame.setCameraYFreeze(false, 0);
      Trigger.cameraYFreezed = false;
    }
  };
Trigger._getMaskLayer = function (name) {
    if (name && game.Logic._tmxMap) {
      return game.Logic._tmxMap.getLayer(name);
    }
    return game.Logic._tmxLayerHide;
  };

Trigger._layerFadeTime = 0.3;

Trigger._getLayerOpacity = function (layer) {
    if (!layer) {
      return 255;
    }
    if (typeof layer._triggerFadeOpacity === "number") {
      return layer._triggerFadeOpacity;
    }
    if (typeof layer.getOpacity === "function") {
      return layer.getOpacity();
    }
    return 255;
  };

Trigger._setLayerOpacityVisual = function (layer, opacity) {
    if (!layer) {
      return;
    }
    opacity = Math.max(0, Math.min(255, Math.round(opacity)));
    layer._triggerFadeOpacity = opacity;
    if (typeof layer.setOpacity === "function") {
      layer.setOpacity(opacity);
    }
    // Не включаем cascade opacity: на восстановленных уровнях в layer.children
    // иногда попадают динамические объекты/враги, и они начинали исчезать вместе
    // со слоем пещеры. Тайлы анимируем вручную ниже.
    if (typeof layer.setCascadeOpacityEnabled === "function") {
      layer.setCascadeOpacityEnabled(false);
    }
    if (!layer._triggerOpacityNodes && opacity !== 255 && typeof layer.getTileAt === "function") {
      Trigger._collectLayerOpacityNodes(layer, true);
    }
    var nodes = Trigger._collectLayerOpacityNodes(layer, false);
    for (var i = 0; i < nodes.length; i += 1) {
      if (nodes[i] && nodes[i] !== layer && typeof nodes[i].setOpacity === "function") {
        nodes[i].setOpacity(opacity);
      }
    }
  };

Trigger._collectLayerOpacityNodes = function (layer, rebuild) {
    if (!layer) {
      return [];
    }
    var nodes = [];
    var used = [];
    var addNode = function (node) {
      if (!node || typeof node.setOpacity !== "function") {
        return;
      }
      for (var i = 0; i < used.length; i += 1) {
        if (used[i] === node) {
          return;
        }
      }
      used.push(node);
      nodes.push(node);
    };

    if (!rebuild && layer._triggerOpacityNodes) {
      for (var n = 0; n < layer._triggerOpacityNodes.length; n += 1) {
        if (layer._triggerOpacityNodes[n] && layer._triggerOpacityNodes[n]._triggerOpacityTile === true) {
          addNode(layer._triggerOpacityNodes[n]);
        }
      }
    }

    if (!rebuild && typeof layer.getChildren === "function") {
      var children = layer.getChildren() || [];
      for (var i = 0; i < children.length; i += 1) {
        if (children[i] && children[i]._triggerOpacityTile === true) {
          addNode(children[i]);
        }
      }
    }

    // getTileAt() создаёт/возвращает sprite тайла. Раньше тут был лимит 2500
    // клеток, из-за него дальние части больших уровней не попадали в fade и
    // в некоторых пещерах слой менялся мгновенно. При старте fade собираем
    // весь диапазон слоя и кэшируем sprites, а в кадрах только обновляем opacity.
    if (rebuild && typeof layer.getTileAt === "function") {
      var minX = typeof layer.originX === "number" && isFinite(layer.originX) ? layer.originX : 0;
      var minY = typeof layer.originY === "number" && isFinite(layer.originY) ? layer.originY : 0;
      var maxX = typeof layer.maxX === "number" && isFinite(layer.maxX) ? layer.maxX : null;
      var maxY = typeof layer.maxY === "number" && isFinite(layer.maxY) ? layer.maxY : null;
      if (maxX === null || maxY === null) {
        var size = null;
        if (typeof layer.getLayerSize === "function") {
          size = layer.getLayerSize();
        }
        if (!size && game.Logic && game.Logic._tmxMapSize) {
          size = game.Logic._tmxMapSize;
        }
        maxX = size && typeof size.width === "number" ? size.width - 1 : minX - 1;
        maxY = size && typeof size.height === "number" ? size.height - 1 : minY - 1;
      }
      var maxTiles = 50000;
      var scanned = 0;
      for (var x = minX; x <= maxX; x += 1) {
        for (var y = minY; y <= maxY; y += 1) {
          if (scanned >= maxTiles) {
            break;
          }
          var grid = cc.p(x, y);
          var gid = 0;
          if (typeof layer.getTileGIDAt === "function") {
            gid = layer.getTileGIDAt(grid);
          }
          if (gid) {
            var tile = layer.getTileAt(grid);
            if (tile) {
              tile._triggerOpacityTile = true;
            }
            addNode(tile);
          }
          scanned += 1;
        }
        if (scanned >= maxTiles) {
          break;
        }
      }
      layer._triggerOpacityNodes = nodes.slice(0);
    }
    return nodes;
  };

Trigger._cancelLayerFade = function (layer) {
    if (!layer) {
      return;
    }
    if (layer._triggerFadeTargetObj && layer._triggerFadeCallback && vee.Utils && vee.Utils.unscheduleCallbackForTarget) {
      vee.Utils.unscheduleCallbackForTarget(layer._triggerFadeTargetObj, layer._triggerFadeCallback);
    }
    if (typeof layer.stopAllActions === "function") {
      layer.stopAllActions();
    }
    layer._triggerFadeCallback = null;
    layer._triggerFadeTargetObj = null;
    layer._triggerFadeRunning = false;
  };

Trigger._fadeLayerTo = function (layer, targetOpacity, duration, hideWhenDone) {
    if (!layer) {
      return;
    }
    duration = typeof duration === "number" ? duration : Trigger._layerFadeTime;
    targetOpacity = Math.max(0, Math.min(255, targetOpacity));
    if (typeof layer.setCascadeOpacityEnabled === "function") {
      layer.setCascadeOpacityEnabled(false);
    }
    if (typeof layer.setVisible === "function" && targetOpacity > 0) {
      layer.setVisible(true);
    }

    var current = Trigger._getLayerOpacity(layer);
    if (layer._triggerFadeRunning && layer._triggerFadeTarget === targetOpacity) {
      return;
    }
    if (!layer._triggerFadeRunning && Math.abs(current - targetOpacity) <= 1) {
      Trigger._setLayerOpacityVisual(layer, targetOpacity);
      if (hideWhenDone && typeof layer.setVisible === "function") {
        layer.setVisible(false);
      } else if (targetOpacity > 0 && typeof layer.setVisible === "function") {
        layer.setVisible(true);
      }
      layer._triggerFadeTarget = targetOpacity;
      return;
    }

    Trigger._cancelLayerFade(layer);

    if (targetOpacity > 0 && typeof layer.setVisible === "function") {
      layer.setVisible(true);
    }
    Trigger._collectLayerOpacityNodes(layer, true);
    Trigger._setLayerOpacityVisual(layer, current);

    var startOpacity = current;
    var elapsed = 0;
    var target = { layer: layer };
    var callback = function (dt) {
      dt = Number(dt);
      if (!dt || !isFinite(dt) || dt <= 0) {
        dt = 1 / 60;
      }
      elapsed += dt;
      var t = duration <= 0 ? 1 : Math.min(1, elapsed / duration);
      var opacity = startOpacity + (targetOpacity - startOpacity) * t;
      Trigger._setLayerOpacityVisual(layer, opacity);
      if (t >= 1) {
        Trigger._cancelLayerFade(layer);
        Trigger._setLayerOpacityVisual(layer, targetOpacity);
        layer._triggerFadeTarget = targetOpacity;
        if (hideWhenDone && typeof layer.setVisible === "function") {
          layer.setVisible(false);
        } else if (targetOpacity > 0 && typeof layer.setVisible === "function") {
          layer.setVisible(true);
        }
      }
    };

    layer._triggerFadeTarget = targetOpacity;
    layer._triggerFadeRunning = true;
    layer._triggerFadeTargetObj = target;
    layer._triggerFadeCallback = callback;

    if (vee.Utils && vee.Utils.scheduleCallbackForTarget) {
      vee.Utils.scheduleCallbackForTarget(target, callback, 0);
    } else if (typeof layer.runAction === "function" && typeof cc !== "undefined" && cc.fadeTo) {
      layer.runAction(cc.sequence(
        cc.fadeTo(duration, targetOpacity),
        cc.callFunc(function () {
          Trigger._setLayerOpacityVisual(layer, targetOpacity);
          layer._triggerFadeRunning = false;
          if (hideWhenDone && typeof layer.setVisible === "function") {
            layer.setVisible(false);
          }
        })
      ));
    } else {
      Trigger._setLayerOpacityVisual(layer, targetOpacity);
      if (hideWhenDone && typeof layer.setVisible === "function") {
        layer.setVisible(false);
      }
    }
  };

Trigger._fadeLayerOut = function (layer, duration) {
    Trigger._fadeLayerTo(layer, 0, duration, true);
  };

Trigger._fadeLayerIn = function (layer, duration) {
    if (layer && typeof layer.setVisible === "function") {
      layer.setVisible(true);
    }
    if (layer && Trigger._getLayerOpacity(layer) <= 1 && layer._triggerFadeTarget !== 255) {
      Trigger._setLayerOpacityVisual(layer, 0);
    }
    Trigger._fadeLayerTo(layer, 255, duration, false);
  };

Trigger._hideMaskLayer = function (layer) {
    if (!layer) {
      return;
    }
    if (typeof layer.getOpacity === "function" && layer.getOpacity() === 255 && layer._triggerFadeTarget !== 0) {
      vee.Audio.playEffect(res.inGame_event_maskOff_mp3);
    }
    Trigger._fadeLayerOut(layer, Trigger._layerFadeTime);
  };

Trigger._showMaskLayer = function (layer) {
    Trigger._fadeLayerIn(layer, Trigger._layerFadeTime);
  };

Trigger.HideMask = Trigger.extend({
  func: function () {
    Trigger._hideMaskLayer(Trigger._getMaskLayer(this.name));
  }
});
Trigger.ShowMask = Trigger.extend({
  func: function () {
    Trigger._showMaskLayer(Trigger._getMaskLayer(this.name));
  }
});
Trigger.HideExtra = Trigger.extend({
  _switchType: Trigger.SwitchTriggerType.Hide,
  func: function (arg0, arg1) {
    var local0 = this.name.split(",");
    if (local0.length > 1 && arg1 === vee.Direction.Origin) {
      return;
    }
    Trigger.HideExtra.func(arg0, arg1, local0[0], this);
  }
});
Trigger.HideExtra.func = function (arg0, arg1, arg2, arg3) {
    var local0 = game.Logic._tmxMap.getLayer(arg2);
    if (local0 && local0.isVisible()) {
      Trigger._fadeLayerOut(local0, 0.2);
      for (var local1 = local0.originX; local1 <= local0.maxX; local1 += 1) {
        for (var local2 = local0.originY; local2 <= local0.maxY; local2 += 1) {
          var local3 = cc.p(local1, local2);
          var local4 = game.Logic.map.getObject(local3);
          if (local4 && local4.layer === local0) {
            game.Logic.map.removeObject(local3);
            var local5 = game.Logic.mapex.getObject(local3);
            if (local5 && local5.layer === local0) {
              game.Logic.mapex.removeObject(local3);
            }
            var local6 = game.Logic.objMap.getObject(local3);
            if (local6 && local6._container) {
              local6._container.removeFromParent();
              game.Logic.objMap.removeObject(local3);
            }
            var local7 = game.Logic.getTileData(local3, game.Logic._tmxLayer);
            if (local7 && game.Logic.isExObjType(local7.tileInfo.type)) {
              game.Logic.mapex.setObject(local7, local3);
            } else {
              game.Logic.map.setObject(local7, local3);
            }
            game.Logic.createItemByGrid(local3);
            game.Logic.createEnemyByGrid(local3);
          }
        }
      }
      Trigger.switchTriggerReset(game.BlockType.SwitchHide, local0);
      var local8 = game.Logic._tmxMap.getLayer("bg_" + arg2);
      if (local8) {
        Trigger._fadeLayerOut(local8, 0.2);
      }
    }
  };
Trigger.ShowExtra = Trigger.extend({
  _switchType: Trigger.SwitchTriggerType.Show,
  func: function (arg0, arg1) {
    var local0 = this.name.split(",");
    if (local0.length > 1 && arg1 === vee.Direction.Origin) {
      return;
    }
    Trigger.ShowExtra.func(arg0, arg1, local0[0], this);
  }
});
Trigger.ShowExtra.func = function (arg0, arg1, arg2, arg3) {
    var local0 = game.Logic._tmxMap.getLayer(arg2);
    if (local0 && !local0.isVisible()) {
      if (arg3) {
        Trigger.switchTriggerReset(game.BlockType.SwitchShow, local0);
      }
      local0.setVisible(true);
      Trigger._cancelLayerFade(local0);
      Trigger._setLayerOpacityVisual(local0, 0);
      game.Logic.addExtraTileToMap(local0);
      if (game.Data.oPlayerCtl) {
        game.Logic.deployTileConfig(game.Data.oPlayerCtl._grid, false, local0);
      }
      Trigger._fadeLayerIn(local0, 0.2);
      var local1 = game.Logic._tmxMap.getLayer("bg_" + arg2);
      if (local1) {
        if (typeof local1.setVisible === "function") {
          local1.setVisible(true);
        }
        Trigger._cancelLayerFade(local1);
        Trigger._setLayerOpacityVisual(local1, 0);
        Trigger._fadeLayerIn(local1, 0.2);
      }
    }
  };
Trigger.ToggleExtra = Trigger.extend({
  _switchType: Trigger.SwitchTriggerType.Toggle,
  func: function (arg0, arg1) {
    var local0 = game.Logic._tmxMap.getLayer(this.name);
    if (local0) {
      if (local0.isVisible()) {
        Trigger.HideExtra.func(arg0, arg1, this.name, this);
        Trigger.switchTriggerReset(game.BlockType.SwitchHide, local0);
      } else {
        Trigger.ShowExtra.func(arg0, arg1, this.name, this);
        Trigger.switchTriggerReset(game.BlockType.SwitchShow, local0);
      }
    }
  }
});
Trigger.switchTriggerReset = function (arg0, arg1) {
    if (arg1.hideTileGrid) {
      var local0 = arg1.hideTileGrid.length;
      var local1 = null;
      for (var local2 = 0; local2 < local0; local2 += 1) {
        local1 = arg1.hideTileGrid[local2];
        var local3 = game.Logic.map.getObject(local1);
        if (local3) {
          var local4 = local3.layer.getTileGIDAt(local1);
          var local5 = arg0 === game.BlockType.SwitchShow ? game.BlockType.SwitchHide : game.BlockType.SwitchDisable;
          local3.layer.setTileGID(local5, local1);
          if (local4 === local5) {
            cc.log("1");
            cc.log("===");
          } else {
            EfxSwitch.create(game.Logic.getTilePosCenterByGrid(local1), EfxSwitch.gid2Str(local4), EfxSwitch.gid2Str(local5));
            vee.Audio.playEffect(res.inGame_event_switchOn_mp3);
          }
        }
      }
    }
    if (arg1.showTileGrid) {
      local0 = arg1.showTileGrid.length;
      local1 = null;
      for (local2 = 0; local2 < local0; local2 += 1) {
        local1 = arg1.showTileGrid[local2];
        var local6 = game.Logic.map.getObject(local1);
        if (local6) {
          local4 = local6.layer.getTileGIDAt(local1);
          local5 = arg0 === game.BlockType.SwitchShow ? game.BlockType.SwitchDisable : game.BlockType.SwitchShow;
          local6.layer.setTileGID(local5, local1);
          if (local4 === local5) {
            cc.log("2");
            cc.log("===");
          } else {
            EfxSwitch.create(game.Logic.getTilePosCenterByGrid(local1), EfxSwitch.gid2Str(local4), EfxSwitch.gid2Str(local5));
            vee.Audio.playEffect(res.inGame_event_switchOff_mp3);
          }
        }
      }
    }
    if (arg1.toggleTileGrid) {
      local0 = arg1.toggleTileGrid.length;
      local1 = null;
      for (local2 = 0; local2 < local0; local2 += 1) {
        local1 = arg1.toggleTileGrid[local2];
        var local7 = game.Logic.map.getObject(local1);
        if (local7) {
          local4 = local7.layer.getTileGIDAt(local1);
          local5 = arg0 === game.BlockType.SwitchShow ? game.BlockType.SwitchHide : game.BlockType.SwitchShow;
          local7.layer.setTileGID(arg0 === game.BlockType.SwitchShow ? game.BlockType.SwitchHide : game.BlockType.SwitchShow, local1);
          if (local4 !== local5) {
            EfxSwitch.create(game.Logic.getTilePosCenterByGrid(local1), EfxSwitch.gid2Str(local4), EfxSwitch.gid2Str(local5));
            if (local5 === game.BlockType.SwitchShow) {
              vee.Audio.playEffect(res.inGame_event_switchOff_mp3);
            } else {
              vee.Audio.playEffect(res.inGame_event_switchOn_mp3);
            }
          }
        }
      }
    }
  };
Trigger.DoorIn = Trigger.extend({
  func: function () {
    if (game.Logic._tmxMap) {
      game.Logic._tmxMap.removeFromParent();
    }
    game.Data.oPlayerCtl.stopUpdate();
    vee.Utils.scheduleOnce(function () {
      game.Data.isDoorIn = true;
      game.Data.oLyGame.showTMX("res/" + this.name + ".tmx");
    }.bind(this), 0.1);
  }
});
Trigger.DoorOut = Trigger.extend({
  func: function () {
    if (game.Logic._tmxMap) {
      game.Logic._tmxMap.removeFromParent();
    }
    game.Data.oPlayerCtl.stopUpdate();
    var local0 = this.name.split(",");
    if (local0.length === 3) {
      this.name = local0[0];
      game.Data.doorOutOffset = cc.p(parseInt(local0[1]), -parseInt(local0[2]));
    } else {
      game.Data.doorOutOffset = cc.p(-1, 0);
    }
    vee.Utils.scheduleOnce(function () {
      game.Data.isDoorIn = false;
      game.Data.oLyGame.showTMX("res/" + this.name + ".tmx");
    }.bind(this), 0.1);
  }
});
Trigger.Exchange = Trigger.extend({
  func: function () {
    if (game.Data.playerType === parseInt(this.name)) {
      return;
    }
    game.Data.playerType = parseInt(this.name);
    var local0 = ElePlayer.create(parseInt(this.name));
    local0.controller.setElePosition(game.Data.oPlayerCtl.getElePosition());
    game.Data.oPlayerCtl._container.removeFromParent();
    game.Data.oPlayerCtl = local0.controller;
    game.Data.oLyGame.lyMap.addChild(local0.container, 2);
  }
});
Trigger.ShowSusliks = Trigger.extend({
  func: function () {
    if (!EnemySusliks.arrSusliks) {
      game.Logic.showSequenceSusliks(this.name);
    }
  }
});
Trigger.ChangeBG = Trigger.extend({
  func: function () {
    if (game.Data.isChangingBG || game.Data.oLyGame.bgCtl && game.Data.oLyGame.bgCtl.bgName === this.name) {
      return;
    }
    var local0 = game.Data.oLyGame;
    var local1 = LyDynamicBG.create(this.name);
    local1.setLocalZOrder(1);
    local0.lyBG.addChild(local1);
    if (local0.bgCtl) {
      local0.bgCtl.rootNode.setLocalZOrder(2);
      local0.bgCtl.disappear();
    }
    local0.bgCtl = local1.controller;
  }
});
Trigger.Event = Trigger.extend({
  func: function (arg0, arg1) {
    if (game.Data.oLvCtl) {
      var local0 = this.name.split(";");
      var local1 = game.Data.oLvCtl["event" + local0[0]];
      if (_.isFunction(local1)) {
        game.Data.oLvCtl["event" + local0[0]](arg0, arg1, local0);
      } else {
        cc.log("ERROR: event name invalid : event " + local0[0] + this.name);
      }
    }
  }
});
Trigger.AddItem = Trigger.extend({
  func: function (arg0, arg1, arg2) {
    if (this.triggered) {
      return;
    }
    this.triggered = true;
    if (arg1 !== vee.Direction.Origin) {
      var local0 = game.itemStringMap[this.name];
      if (local0) {
        var local1 = Item.createWithInfo({
          type: local0
        });
        if (local1) {
          var local2 = game.Logic.getTilePosByGrid(arg0);
          local1.controller.initPosition(cc.p(local2.x + game.Data.tileSizeWidth / 2, local2.y + game.Data.tileSizeWidth / 2));
          if (arg2) {
            local1.controller._layerBelong = arg2.layer;
          } else {
            local1.controller._layerBelong = game.Logic._tmxLayer;
          }
          var local3 = game.Logic.getTileDataByGid(game.BlockType.Coin, arg0);
          game.Logic.objMap.setObject(local1.controller, arg0);
          local1.controller.setGridInMap(arg0);
          game.Logic.mapex.setObject(local3, arg0);
        }
      }
    }
  }
});
Trigger.ForceMove = Trigger.extend({
  func: function () {
    game.Data.oLyGame.leftBtnUp();
    game.Data.oLyGame.rightBtnUp();
    if (!this.name || this.name === "right") {
      game.Data.oPlayerCtl.moveRight();
    } else {
      game.Data.oPlayerCtl.moveLeft();
    }
    vee.Utils.scheduleOnce(function () {
      game.Data.oLyGame.leftBtnUp();
      game.Data.oLyGame.rightBtnUp();
    }, 0.35);
  }
});
Trigger.StageOver = Trigger.extend({
  _isOver: false,
  func: function () {
    if (this._isOver) {
      return;
    }
    this._isOver = true;
    game.Data.oLyGame.stopCamera = true;
    game.Data.oLyGame.freezeButton = true;
    game.Data.oPlayerCtl.gameOverOut(function () {
      vee.Transition.out(res.MapTransition_ccbi, function () {
        var local0 = game.Data.oPlayerCtl.getContainerNode();
        local0.setPosition(cc.p(0, 0));
        game.Data.oPlayerCtl.playAnimate("huxi_2", function () {
          game.Data.oPlayerCtl.randomBreath();
        });
        local0.retain();
        local0.removeFromParent();
        vee.PopMgr.closeAll();
        var local1 = LyGameWin.show();
        local1.controller.nodeAvatar.addChild(local0);
        local0.release();
      });
    });
  }
});
Trigger.ShowCoins = Trigger.extend({
  _isOver: false,
  func: function () {
    if (this._isOver) {
      return;
    }
    this._isOver = true;
    game.Logic.showSequenceCoin(this.name);
  }
});
Trigger.BigCoin = Trigger.extend({
  _isGetted: false,
  func: function (arg0, arg1) {
    if (arg1 === vee.Direction.Origin) {
      return;
    }
    if (this._isGetted) {
      return;
    }
    this._isGetted = true;
    var local0 = parseInt(this.name);
    if (game.LevelData.selectedLevel) {
      cc.log("level coin idx = " + local0);
      game.LevelData.selectedLevel.starAchieved(local0);
      var local1 = game.LevelData.selectedLevel.getCurrentStarAchieved();
      cc.log("getted star : " + local1);
      game.Data.oLyGame.unlockStar(local0);
      game.Data.collectedStarCount += 1;
    }
  }
});
Trigger.HighlightAction = Trigger.extend({
  func: function () {
    if (this.isOver) {
      return;
    }
    this.isOver = true;
    game.Data.oLyGame.setHighlightControlButton(LyGame.ControlButtonType.ActionButton, parseInt(this.name));
  }
});
Trigger.Story = Trigger.extend({
  _isOver: false,
  func: function (arg0) {
    if (this._isOver) {
      return;
    }
    this._isOver = true;
    Story.showStory(this.name, arg0);
  }
});
Trigger.Parkour = Trigger.extend({
  func: function () {
    var local0 = parseInt(this.name);
    game.Logic.setForParkour(local0 > 0);
    if (game.Data.oPlayerCtl) {
      game.Data.oPlayerCtl.parkourMove();
    }
  }
});
