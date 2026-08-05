function __storyCall(obj, methodName) {
  if (!obj || typeof obj[methodName] !== "function") {
    return undefined;
  }
  return obj[methodName].apply(obj, Array.prototype.slice.call(arguments, 2));
}

function __storyPoint(x, y) {
  return (typeof cc !== "undefined" && cc.p) ? cc.p(x, y) : { x: x, y: y };
}

function __storyArg(args, index) {
  if (_.isArray(args)) {
    return args[index || 0];
  }
  return args;
}

function __storyParseArgs(args) {
  if (_.isArray(args)) {
    return args.slice(0);
  }
  if (args === undefined || args === null) {
    return [];
  }
  return ("" + args).split(",");
}

function __storyRestoreAfterStory() {
  if (game.Data.oLyGame) {
    game.Data.oLyGame.stopCamera = false;
    game.Data.oLyGame.freezeButton = false;
    __storyCall(game.Data.oLyGame, "hideStoryBlackEdge");
  }

  if (game.Data.oPlayerCtl) {
    game.Data.oPlayerCtl._freezeMoveButton = false;
  }

  Story.isShowStory = false;

  if (game.Data.playerType !== game.PlayerType.Normal) {
    __storyCall(game.Data.oLyGame, "showControlButton", LyGame.ControlButtonType.ActionButton, true);
    __storyCall(game.Data.oLyGame, "showControlButton", LyGame.ControlButtonType.JumpButton, true);
  }

  if (__storyCall(game.Data, "isInParkour")) {
    __storyCall(game.Data.oPlayerCtl, "parkourMove");
  } else {
    __storyCall(game.Data.oLyGame, "showControlButton", LyGame.ControlButtonType.MoveButton, true);
  }
}

function __storyLogError(message) {
  cc.log(message + Story.getDebugDesc());
}

var Story = {
  selectedNPC: null,
  grid: null,
  arrScript: [],
  isShowStory: false,
  tempCameraPos: null,
  isSkip: false,
  handSkip: false,
  storyId: null,

  showStory: function (script, grid, isSkip, storyId, handSkip) {
    cc.log("show story called!");

    if (!Story.isSkip) {
      Story.isSkip = isSkip;
    }

    Story.storyId = storyId;
    Story.handSkip = handSkip;

    var hasPlayed = __storyCall(game.Data, "getStoryHasPlayed", game.Data.performingTMXIdx, storyId);
    if (hasPlayed) {
      if (Story.isSkip) {
        if (!handSkip) {
          if (storyId === 1) {
            handSkip = true;
          } else {
            cc.log("001");
            Story.callSkipFunc(Story.storyId);
            return;
          }
        }
      } else {
        __storyCall(game.Data.oLyGame, "setSkipButtonVisible", true);
      }
    } else {
      cc.log("story " + storyId + " and hand skip is " + handSkip);
      if (handSkip) {
        Story.handSkip = false;
        cc.log("002");
        return;
      }
      Story.isSkip = false;
    }

    cc.log("story " + storyId + " played!");
    __storyCall(game.Data, "setStoryHasPlayed", game.Data.performingTMXIdx, storyId, true);
    __storyCall(vee, "saveData");

    if (!handSkip && game.Data.oLyGame) {
      game.Data.oLyGame.stopCamera = true;
      game.Data.oLyGame.freezeButton = true;
      __storyCall(game.Data.oLyGame, "showStoryBlackEdge");
      Story.isShowStory = true;

      if (game.Data.oPlayerCtl) {
        game.Data.oPlayerCtl._freezeMoveButton = true;
        game.Data.oPlayerCtl._speedX = 0;
        game.Data.oPlayerCtl._accX = 0;
        __storyCall(game.Data.oLyGame, "leftBtnUp");
        __storyCall(game.Data.oLyGame, "rightBtnUp");
        game.Data.cameraRestoreY = false;
        if (game.Data.oLyGame.lyContainer) {
          Story.tempCameraPos = game.Data.oLyGame.lyContainer.getPosition();
        }
      }
    }

    if (grid) {
      Story.grid = __storyPoint(grid.x, grid.y);
    }

    Story.arrScript = (script || "").split(";");
    Story.showNext();
  },

  showNext: function () {
    if (Story.arrScript.length > 0) {
      var commandLine = Story.arrScript.shift();
      cc.log("[Story] next: " + commandLine + Story.getDebugDesc());
      var args = commandLine.split(",");
      var functionName = args.shift();

      var canRunWithoutNpc = {
        SelectNpc: true,
        MoveCamera: true,
        Delay: true,
        UnlockRole: true,
        Trigger: true,
        RemoveEnemy: true,
        AddCoin: true,
        GameOver: true
      };

      if (!canRunWithoutNpc[functionName] && !Story.selectedNPC) {
        cc.log("Error in " + functionName + ": you should select a npc first." + Story.getDebugDesc());
      }

      var func = Story[functionName];
      if (_.isFunction(func)) {
        if (args.length === 0) {
          func.call(Story);
        } else {
          func.call(Story, args);
        }
      } else {
        cc.log("Error in story function name: '" + functionName + "', check spell!");
      }
      return;
    }

    if (Cinema.isCinema) {
      Cinema.storyOver();
      __storyCall(game.Data.oLyGame, "hideStoryBlackEdge");
      return;
    }

    if (Story.handSkip) {
      Story.handSkip = false;
      return;
    }

    if (Story.isSkip) {
      Story.callSkipFunc(Story.storyId);
    }

    if (game.Data.oLyGame && game.Data.oLyGame.nodeSkip && game.Data.oLyGame.nodeSkip.isVisible()) {
      __storyCall(game.Data.oLyGame, "setSkipButtonVisible", false);
    }

    if (!game.Data.oPlayerCtl || !game.Data.oLyGame || !game.Data.oLyGame.lyContainer) {
      __storyRestoreAfterStory();
      return;
    }

    var playerPos = game.Data.oPlayerCtl.getElePosition();
    var cameraOffset = __storyPoint(0, 60);
    game.Data.cameraYPos = -60;

    cameraOffset.x = game.Data.oPlayerCtl._faceTo === vee.Direction.Left ? -game.Data.cameraXPosLimit : game.Data.cameraXPosLimit;
    game.Data.cameraXPos = -cameraOffset.x;

    var cameraTarget = __storyPoint(568 - cameraOffset.x, 384 - cameraOffset.y);
    cameraTarget = __storyPoint(cameraTarget.x - playerPos.x, cameraTarget.y - playerPos.y);

    game.Data.oPlayerCtl._offsetX = 0;
    game.Data.oPlayerCtl._offsetY = 0;

    game.Data.oLyGame.lyContainer.runAction(cc.sequence(
      cc.EaseInOut.create(cc.moveTo(0.8, cameraTarget), 3),
      cc.callFunc(__storyRestoreAfterStory)
    ));
  },

  skipStory: function () {
    __storyCall(game.Data.oLyGame, "setSkipButtonVisible", false);
    Story.isSkip = true;

    __storyCall(game.Data.oLyGame && game.Data.oLyGame.rootNode, "stopAllActions");
    __storyCall(game.Data.oLyGame && game.Data.oLyGame.lyContainer, "stopAllActions");
    __storyCall(UIDialog, "hide");

    if (Story.selectedNPC && Story.selectedNPC._container) {
      __storyCall(Story.selectedNPC._container, "stopAllActions");
    }

    Story.showNext();
  },

  callSkipFunc: function (storyId) {
    var levelController = game.Data.oLvCtl;
    var funcName = "skip" + storyId;
    if (levelController && _.isFunction(levelController[funcName])) {
      levelController[funcName]();
    }
  },

  SelectNpc: function (npcName) {
    npcName = __storyArg(npcName);
    if (!npcName) {
      npcName = "defaultNpc";
    }

    Story.selectedNPC = game.Data.npcmap ? game.Data.npcmap[npcName] : null;
    if (!Story.selectedNPC) {
      cc.log("Error in selectnpc: wrong npc name " + npcName + Story.getDebugDesc());
    }

    Story.showNext();
  },

  TimeLine: function (animationName) {
    if (Story.isSkip) {
      Story.showNext();
      return;
    }

    animationName = __storyArg(animationName);
    __storyCall(Story.selectedNPC, "playAnimate", animationName);

    Story.showNext();
  },

  Delay: function (duration) {
    if (Story.isSkip) {
      Story.showNext();
      return;
    }

    duration = parseFloat(__storyArg(duration));
    if (game.Data.oLyGame && game.Data.oLyGame.rootNode) {
      game.Data.oLyGame.rootNode.runAction(cc.sequence(cc.delayTime(duration), cc.callFunc(function () {
        Story.showNext();
      })));
    }
  },

  ShowDialog: function (dialogParts) {
    if (Story.isSkip) {
      Story.showNext();
      return;
    }

    var text = _.isArray(dialogParts) ? dialogParts.join(",") : (dialogParts || "");
    __storyCall(UIDialog, "show", text);
  },

  HideDialog: function () {
    if (Story.isSkip) {
      Story.showNext();
      return;
    }

    __storyCall(UIDialog, "hide");
  },

  FaceTo: function (direction) {
    direction = __storyArg(direction);
    if (!Story.isSkip) {
      if (direction === "left") {
        __storyCall(Story.selectedNPC, "setFaceTo", vee.Direction.Left, true);
      } else {
        __storyCall(Story.selectedNPC, "setFaceTo", vee.Direction.Right, true);
      }
    }
    Story.showNext();
  },

  PlaySound: function (soundDesc) {
    if (!Story.isSkip) {
      var parts = __storyParseArgs(soundDesc);
      var prefix = parts.shift();
      var soundPath = "res/" + prefix + vee.Utils.randomChoice(parts) + ".mp3";
      __storyCall(vee.Audio, "playEffect", soundPath);
    }
    Story.showNext();
  },

  Jump: function (args) {
    args = __storyParseArgs(args);
    if (args.length < 2) {
      __storyLogError("Error in jump: arguments number invalid.");
      Story.showNext();
      return;
    }

    var grid = __storyPoint(parseInt(args[0], 10), parseInt(args[1], 10));
    var targetPos = game.Logic.getTilePosCenterByGrid(grid);

    if (Story.isSkip) {
      if (Story.selectedNPC && Story.selectedNPC._container) {
        Story.selectedNPC._container.setPosition(targetPos);
      }
      Story.showNext();
      return;
    }

    var jumpHeight = args.length > 2 ? args[2] : 3;
    jumpHeight = jumpHeight * TILE_WIDTH;

    Story.selectedNPC._container.runAction(cc.sequence(
      cc.delayTime(0),
      cc.callFunc(function () {
        __storyCall(Story.selectedNPC, "playAnimate", "run_jump_up");
      }),
      cc.jumpTo(0.7, targetPos.x, targetPos.y, jumpHeight, 1),
      cc.callFunc(function () {
        __storyCall(Story.selectedNPC, "playAnimate", "huxi_1");
        Story.showNext();
      })
    ));
  },

  MoveRole: function (args) {
    args = __storyParseArgs(args);
    if (args.length < 2) {
      __storyLogError("Error in moverole: arguments number invalid.");
      Story.showNext();
      return;
    }

    var targetGrid = __storyPoint(parseInt(args[0], 10), parseInt(args[1], 10));
    var targetPos = game.Logic.getTilePosCenterByGrid(targetGrid);

    if (Story.isSkip) {
      if (Story.selectedNPC && Story.selectedNPC._container) {
        Story.selectedNPC._container.setPosition(targetPos);
      }
      Story.showNext();
      return;
    }

    var currentPos = Story.selectedNPC._container.getPosition();
    var currentGrid = game.Logic.getTileGridByPos(currentPos);
    var dx = targetGrid.x - currentGrid.x;

    if (dx > 0) {
      __storyCall(Story.selectedNPC, "setFaceTo", vee.Direction.Right);
    } else if (dx < 0) {
      __storyCall(Story.selectedNPC, "setFaceTo", vee.Direction.Left);
    }

    var distance = vee.Utils.manhattanDistance(vee.Utils.pSub(targetGrid, currentGrid));
    var duration = distance * 0.2;

    __storyCall(Story.selectedNPC, "playAnimate", "run");
    Story.selectedNPC._container.runAction(cc.sequence(
      cc.moveTo(duration, targetPos),
      cc.callFunc(function () {
        __storyCall(Story.selectedNPC, "playAnimate", "huxi_1");
        Story.showNext();
      })
    ));
  },

  ResetRole: function (args) {
    args = __storyParseArgs(args);
    if (args.length < 2) {
      __storyLogError("Error in moverole: arguments number invalid.");
      Story.showNext();
      return;
    }

    var grid = __storyPoint(parseInt(args[0], 10), parseInt(args[1], 10));
    var targetPos = game.Logic.getTilePosCenterByGrid(grid);
    if (Story.selectedNPC && Story.selectedNPC._container) {
      Story.selectedNPC._container.setPosition(targetPos);
    }
    Story.showNext();
  },

  MoveCamera: function (args) {
    if (Story.isSkip) {
      Story.showNext();
      return;
    }

    args = __storyParseArgs(args);
    if (args.length < 3) {
      __storyLogError("Error in movecamera: arguments number invalid.");
      Story.showNext();
      return;
    }

    var grid = __storyPoint(parseInt(args[0], 10), parseInt(args[1], 10));
    var targetPos = game.Logic.getTilePosCenterByGrid(grid);
    var duration = parseFloat(args[2]);
    var containerPos = __storyPoint(568 - targetPos.x, 384 - targetPos.y);

    game.Data.oLyGame.lyContainer.runAction(cc.sequence(
      cc.EaseInOut.create(cc.moveTo(duration, containerPos), 3),
      cc.callFunc(function () {
        Story.showNext();
      })
    ));
  },

  RemoveRole: function () {
    if (Story.selectedNPC) {
      var npcName = Story.selectedNPC.npcname;
      if (npcName && game.Data.npcmap) {
        game.Data.npcmap[npcName] = null;
      } else if (game.Data.npcmap) {
        for (var key in game.Data.npcmap) {
          if (game.Data.npcmap[key] === Story.selectedNPC) {
            game.Data.npcmap[key] = null;
          }
        }
      }

      if (Story.selectedNPC._container) {
        Story.selectedNPC._container.removeFromParent();
      }
      Story.selectedNPC = null;
    }

    Story.showNext();
  },

  UnlockRole: function () {
    __storyCall(game.Data, "setUnlocking", true);
    var nextAvatar = __storyCall(game.AvatarData, "getNextAvatar");
    if (nextAvatar) {
      ItemCoin.coinFrameName = nextAvatar.coinFrame;
      if (game.Data.oLyGame && game.Data.oLyGame.spCoinIcon) {
        game.Data.oLyGame.spCoinIcon.setSpriteFrame(ItemCoin.coinFrameName);
      }
      __storyCall(ItemCoin, "refreshAllCoin");
    } else {
      ItemCoin.coinFrameName = null;
    }

    Story.showNext();
  },

  Trigger: function (args) {
    args = __storyParseArgs(args);
    if (args.length < 2) {
      Story.showNext();
      return;
    }

    var grid = __storyPoint(parseInt(args[0], 10), parseInt(args[1], 10));
    var direction = vee.Direction.Origin;
    if (args.length >= 3) {
      direction = vee.Direction.string2Direction(args[2]);
    }

    var trigger = game.Logic.triggerMap && game.Logic.triggerMap.getObject(grid);
    if (trigger) {
      trigger.func(grid, direction);
    } else {
      __storyLogError("Error in Trigger: trigger does not exist.");
    }

    Story.showNext();
  },

  AddCoin: function (count) {
    count = __storyArg(count);
    __storyCall(game.Data.oLyGame, "hideStoryBlackEdge");
    Story._showCoinParticle(parseInt(count, 10));
  },

  RemoveEnemy: function () {
    var objects = game.Logic.dynamicObjMap ? game.Logic.dynamicObjMap.getObjects() : [];
    for (var key in objects) {
      var obj = objects[key];
      if (obj && obj._eleType === game.EleType.Enemy) {
        __storyCall(obj, "die");
      }
    }
    Story.showNext();
  },

  GameOver: function () {
    game.Data.oLyGame.stopCamera = true;
    game.Data.oLyGame.freezeButton = true;
    Story.isShowStory = false;

    __storyCall(EfxStageEnd, "show", game.Data.oPlayerCtl._pos);
    __storyCall(game.Data.oPlayerCtl, "gameOverOut", function () {
      var playerNode = game.Data.oPlayerCtl.getContainerNode();
      var rootNode = game.Data.oPlayerCtl.rootNode;
      playerNode.setPosition(__storyPoint(0, 0));
      playerNode.retain();
      playerNode.removeFromParent();

      var layer = LyGameWin.show();
      if (layer && layer.controller && layer.controller.nodeAvatar) {
        layer.controller.nodeAvatar.addChild(playerNode);
      }

      playerNode.release();
      game.Data.oLyGameOver.oPlayer = rootNode;
      __storyCall(rootNode.controller, "playAnimate", "huxi_2", function () {
        if (game.Data.oLyGameOver) {
          __storyCall(game.Data.oLyGameOver.oPlayer.controller, "randomBreath");
        }
      });
    });
  },

  getDebugDesc: function () {
    var grid = Story.grid || { x: 0, y: 0 };
    return " map idx = " + game.Data.performingTMXIdx + " grid.x = " + grid.x + " grid.y = " + grid.y;
  },

  _coinOff: 0,
  _coinItr: 0,
  _coinFrameName: null,
  coinStartPos: null,
  coinPos: null,

  _showCoinParticle: function (count) {
    Story._coinOff = count;
    Story._coinItr = count > 40 ? Math.ceil(count / 40) : 1;
    cc.log(Story._coinItr);

    var npcPos = Story.selectedNPC._container.getPosition();
    var screenPos = game.Data.oLyGame.getElePosInScreen(npcPos);
    Story.coinStartPos = vee.Utils.pAdd(screenPos, __storyPoint(0, TILE_WIDTH_HALF));
    Story.coinPos = game.Data.oLyGame.getCoinIconPos();

    var nextAvatar = __storyCall(game.AvatarData, "getNextAvatar");
    Story._coinFrameName = nextAvatar ? nextAvatar.coinFrame : "coin_fist.png";

    __storyCall(vee.Utils, "scheduleCallbackForTarget", game.Data.oLyGame.blackEdgeBL, Story.updateShowCoin, 0.05);
  },

  updateShowCoin: function () {
    if (Story._coinOff > 0) {
      if (Story._coinItr > Story._coinOff) {
        Story._coinItr = Story._coinOff;
      }
      Story._coinOff -= Story._coinItr;

      var coin = new cc.Sprite("#" + Story._coinFrameName);
      coin.setPosition(Story.coinStartPos);
      coin.itr = Story._coinItr;
      if (Story._coinOff <= 0) {
        coin.isOver = true;
      }

      coin.runAction(cc.sequence(
        cc.jumpTo(0.5, Story.coinPos.x, Story.coinPos.y, 80, 1),
        cc.callFunc(function () {
          __storyCall(game.Data, "addTempCoin", coin.itr);
          if (coin.isOver) {
            Story.showNext();
          }
          coin.removeFromParent();
          __storyCall(vee.Audio, "playEffect", res.inGame_function_countCoins_mp3);
        })
      ));
      game.Data.oLyGame.rootNode.addChild(coin, 10);
    } else {
      __storyCall(vee.Utils, "unscheduleAllCallbacksForTarget", game.Data.oLyGame.blackEdgeBL);
    }
  }
};
