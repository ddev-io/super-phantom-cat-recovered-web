function __cinemaCall(obj, methodName) {
  if (!obj || typeof obj[methodName] !== "function") {
    return undefined;
  }
  return obj[methodName].apply(obj, Array.prototype.slice.call(arguments, 2));
}

function __cinemaPoint(x, y) {
  return (typeof cc !== "undefined" && cc.p) ? cc.p(x, y) : { x: x, y: y };
}

function __cinemaStopCallbacks(target, func) {
  if (!target || typeof vee === "undefined" || !vee.Utils) {
    return;
  }
  if (func && typeof vee.Utils.unscheduleCallbackForTarget === "function") {
    vee.Utils.unscheduleCallbackForTarget(target, func);
  } else if (typeof vee.Utils.unscheduleAllCallbacksForTarget === "function") {
    vee.Utils.unscheduleAllCallbacksForTarget(target);
  }
}

function __cinemaSchedule(target, func, interval) {
  if (target && func && typeof vee !== "undefined" && vee.Utils && typeof vee.Utils.scheduleCallbackForTarget === "function") {
    vee.Utils.scheduleCallbackForTarget(target, func, interval || 0);
  }
}

function __cinemaScheduleOnce(target, func, delay, node) {
  if (!func) {
    return;
  }
  if (typeof vee !== "undefined" && vee.Utils && typeof vee.Utils.scheduleOnceForTarget === "function") {
    vee.Utils.scheduleOnceForTarget(target || Cinema, func, delay || 0);
    return;
  }
  node = node || (game.Data && game.Data.oLyGame && (game.Data.oLyGame.lyMapBack || game.Data.oLyGame.lyMap || game.Data.oLyGame.lyContainer));
  if (node && node.runAction && typeof cc !== "undefined" && cc.sequence) {
    node.runAction(cc.sequence(cc.delayTime(delay || 0), cc.callFunc(func)));
    return;
  }
  if (typeof setTimeout === "function") {
    setTimeout(func, (delay || 0) * 1000);
  }
}

function __cinemaGetObjPos(obj) {
  if (!obj) {
    return null;
  }
  if (obj._container && obj._container.getPosition) {
    var nodePos = obj._container.getPosition();
    if (nodePos) {
      return nodePos;
    }
  }
  if (obj.getElePosition) {
    var elePos = obj.getElePosition();
    if (elePos) {
      return elePos;
    }
  }
  return obj._pos || null;
}

function __cinemaRunAction(node, action) {
  __cinemaCall(node, "runAction", action);
}

function __cinemaSetVisible(node, visible) {
  __cinemaCall(node, "setVisible", !!visible);
}

function __cinemaGridToPos(gridOrX, y) {
  var grid = (typeof gridOrX === "number") ? __cinemaPoint(gridOrX, y) : gridOrX;
  return game.Logic.getTilePosCenterByGrid(grid);
}

function __cinemaInstallMoveStopCheck(role, targetPos, callback) {
  if (!role || !targetPos) {
    if (callback) {
      callback();
    }
    return;
  }

  role.checkPosForCinema = targetPos;
  role.checkPosUpdateFunc = function () {
    var reachedRight = role._speedX > 0 && role._pos && role._pos.x > role.checkPosForCinema.x;
    var reachedLeft = role._speedX < 0 && role._pos && role._pos.x < role.checkPosForCinema.x;

    if (!reachedRight && !reachedLeft) {
      return;
    }

    __cinemaCall(role, "stopMove");
    __cinemaStopCallbacks(role, role.checkPosUpdateFunc);

    if (callback) {
      callback();
    }
  }.bind(role);

  __cinemaSchedule(role, role.checkPosUpdateFunc);
}

var Cinema = {
  smallcat: null,
  phantom: null,
  enemy: [],
  checkDogPos: null,
  phantomPos: null,
  _walkSfx: null,
  analyseTag: false,
  _finishing: false,
  _storyOverStarted: false,
  _smashTriggered: false,
  _smashCallbackStarted: false,

  init: function () {
    this.enemy = [];
    this.smallcat = null;
    this.phantom = null;
    this._finishing = false;
    this._storyOverStarted = false;
    this._smashTriggered = false;
    this._smashCallbackStarted = false;
    this._smashWatchStarted = false;
    this._smashLandWatchStarted = false;
    this._enemyWatchStartTime = 0;
    this._smashTriggered = false;
    this._smashCallbackStarted = false;

    if (typeof LyBlackCutScene !== "undefined") {
      LyBlackCutScene.ctl = null;
    }

    this.checkDogPos = game.Logic.getTilePosCenterByGrid(__cinemaPoint(21, 44));

    var lyGame = game.Data.oLyGame;
    if (lyGame) {
      lyGame.stopCamera = true;
      game.Data.cameraRestoreY = false;

      if (lyGame.lyContainer) {
        lyGame.lyContainer.setPosition(game.Logic.getCameraPosByGrid(__cinemaPoint(12, 22)));
      }

      if (lyGame.hideControlButton && LyGame.ControlButtonType) {
        lyGame.hideControlButton(LyGame.ControlButtonType.ActionButton);
        lyGame.hideControlButton(LyGame.ControlButtonType.JumpButton);
        lyGame.hideControlButton(LyGame.ControlButtonType.MoveButton);
      }

      __cinemaSetVisible(lyGame.nodeT, false);
      __cinemaSetVisible(lyGame.nodeTRElements, false);
      __cinemaSetVisible(lyGame.nodeTLElements, false);
    }

    this.smallcat = game.Data.npcmap ? game.Data.npcmap.SmallCat : null;
    this.phantom = game.Data.npcmap ? game.Data.npcmap.Phantom : null;

    if (this.phantom && this.phantom._container) {
      var phantomPos = this.phantom._container.getPosition();
      __cinemaCall(this.phantom, "setElePosition", __cinemaPoint(phantomPos.x + TILE_WIDTH_HALF, phantomPos.y));
      __cinemaCall(this.phantom, "setJumping", false);
      this.phantom._speedY = 0;
      game.Data.arrUpdateObj.push(this.phantom);
    }

    __cinemaCall(game.Logic, "deployTileConfig", __cinemaPoint(30, 41));

    var skipSign = vee.data["skipSign" + game.Data.performingTMXIdx];
    if (lyGame) {
      __cinemaCall(lyGame, "setSkipButtonVisible", true);
    }
    vee.data["skipSign" + game.Data.performingTMXIdx] = true;
    __cinemaCall(vee, "saveData");

    if (this.analyseTag && vee.Analytics && vee.Analytics.logMissionStart) {
      cc.log("记录开始");
      vee.Analytics.logMissionStart("LevelStoryAnimate");
    }

    var func4Started = false;
    var startFunc4 = function () {
      if (func4Started) {
        return;
      }
      func4Started = true;
      func4();
    };

    var func5 = function () {
      var duration = Cinema.getMoveDur(14);
      var target = game.Logic.getTilePosCenterByGrid(__cinemaPoint(11, 44));

      __cinemaCall(Cinema.smallcat, "setFaceTo", vee.Direction.Left);
      __cinemaCall(Cinema.smallcat, "playAnimate", "escape");

      if (Cinema.smallcat && Cinema.smallcat._container) {
        Cinema.smallcat._container.runAction(cc.sequence(
          cc.moveTo(duration, target),
          cc.callFunc(function () {
            __cinemaCall(Cinema.smallcat, "playAnimate", "fright");
          })
        ));
      }

      Cinema.moveCamera(14, 42, duration, Cinema.EaseType.EASEINOUT);

      // Do not force the next stage here. The original timing is controlled
      // by updateCheckDog when the enemies visually reach the check point.
    };

    var func4 = function () {
      if (!Cinema.smallcat || !Cinema.smallcat._container) {
        return;
      }

      Cinema.smallcat._container.runAction(cc.sequence(
        cc.delayTime(0.5),
        cc.callFunc(function () {
          Cinema.moveCamera(31, 42, 1.6, Cinema.EaseType.EASEINOUT);
        }),
        cc.delayTime(0.8),
        cc.callFunc(function () {
          var objects = game.Logic.dynamicObjMap.getObjects();
          var count = 0;

          for (var i in objects) {
            var obj = objects[i];
            if (!obj) {
              continue;
            }

            obj.idxInMap = i;

            if (vee.Utils.getObjByPlatform(true, true, false)) {
              Cinema.enemy.unshift(obj);
              obj.movePos = __cinemaPoint(11, 44);
              __cinemaCall(obj, "findTargetWithDelay", 0.3 * (3 + count), function () {
                this._dashing = true;
                this._speedXLimit = 520;
                __cinemaCall(this, "playAnimate", "eat");
                __cinemaCall(this, "moveLeft");
              }.bind(obj));
              count++;
            } else {
              Cinema.enemy.push(obj);
              obj.movePos = __cinemaPoint(11, 44);
              __cinemaCall(obj, "findTargetWithDelay", 0.3 * (5 - count), function () {
                this._dashing = true;
                this._speedXLimit = 520;
                __cinemaCall(this, "playAnimate", "eat");
                __cinemaCall(this, "moveLeft");
              }.bind(obj));
              count++;
            }
          }

          Cinema.startEnemySmashWatch();
          __cinemaCall(vee.Audio, "playMusic", res.bgm_mini_mp3);
        }),
        cc.delayTime(0.5),
        cc.callFunc(function () {
          __cinemaCall(Cinema.smallcat, "playAnimate", "fright");
        }),
        cc.delayTime(0.7),
        cc.callFunc(func5)
      ));
    };

    var func3 = function () {
      __cinemaCall(game.Data.oLyGame, "shake");
      __cinemaCall(game.Logic, "checkTileTrigger", __cinemaPoint(22, 44), vee.Direction.Origin, null, Cinema.smallcat);
      __cinemaCall(Cinema.smallcat, "playAnimate", "landing");
      Cinema.moveCamera(25, 42, 1.2);

      if (Cinema.smallcat && Cinema.smallcat._container) {
        Cinema.smallcat._container.runAction(cc.sequence(
          cc.moveBy(1.2, __cinemaPoint(TILE_WIDTH * 5 + TILE_WIDTH_HALF, 0)),
          cc.callFunc(startFunc4)
        ));

        // Some recovered builds lose the cc.callFunc at the end of this moveBy.
        // Keep the visual move, but also start the next cinema stage from scheduler.
        if (vee && vee.Utils && vee.Utils.scheduleOnceForTarget) {
          vee.Utils.scheduleOnceForTarget(Cinema, startFunc4, 1.25);
        }
      } else {
        startFunc4();
      }
    };

    var func2 = function () {
      __cinemaCall(vee.Audio, "stopEffect", Cinema._walkSfx);
      __cinemaCall(vee.Audio, "playEffect", res.inGame_character_littleShock_mp3);
      __cinemaCall(Cinema.smallcat, "playAnimate", "fright", function () {
        var duration = Cinema.getMoveDur(11);
        var target = game.Logic.getTilePosCenterByGrid(__cinemaPoint(22, 44));

        if (Cinema.smallcat && Cinema.smallcat._container) {
          Cinema.smallcat._container.runAction(cc.sequence(
            cc.EaseOut.create(cc.moveBy(0.3, __cinemaPoint(0, 60)), 3),
            cc.callFunc(function () {
              __cinemaCall(vee.Audio, "playEffect", res.inGame_character_littleDrop_mp3);
              __cinemaCall(Cinema.smallcat, "playAnimate", "drop");
            }),
            cc.moveTo(duration, __cinemaPoint(target.x + TILE_WIDTH_HALF, target.y)),
            cc.callFunc(func3)
          ));
        }

        Cinema.moveCamera(22, 42, duration + 1, Cinema.EaseType.EASEINOUT);
      });
    };

    var func1 = function () {
      Cinema._walkSfx = __cinemaCall(vee.Audio, "playEffect", res.inGame_character_littleWalk_mp3);
      __cinemaCall(Cinema.smallcat, "playAnimate", "run");

      var duration = Cinema.getMoveDur(22);
      var target = game.Logic.getTilePosCenterByGrid(__cinemaPoint(22, 22));

      if (Cinema.smallcat && Cinema.smallcat._container) {
        Cinema.smallcat._container.runAction(cc.sequence(
          cc.moveTo(duration + 2, __cinemaPoint(target.x + TILE_WIDTH_HALF, target.y)),
          cc.callFunc(function () {
            __cinemaCall(game.Logic, "checkTileTrigger", __cinemaPoint(22, 22), vee.Direction.Origin, null, Cinema.smallcat);
            __cinemaCall(game.Logic, "checkTileTrigger", __cinemaPoint(22, 21), vee.Direction.Origin, null, Cinema.smallcat);
            __cinemaCall(Cinema.smallcat, "playAnimate", "huxi_1");
          }),
          cc.delayTime(0.5),
          cc.callFunc(func2)
        ));
      }

      if (game.Data.oLyGame && game.Data.oLyGame.lyMap) {
        game.Data.oLyGame.lyMap.runAction(cc.sequence(
          cc.delayTime(Cinema.getMoveDur(12)),
          cc.callFunc(function () {
            Cinema.moveCamera(22, 22, Cinema.getMoveDur(10));
          })
        ));
      }
    };

    if (game.Data.oLyGame && game.Data.oLyGame.lyMapBack) {
      game.Data.oLyGame.lyMapBack.runAction(cc.sequence(
        cc.delayTime(0.5),
        cc.callFunc(func1)
      ));
    } else {
      func1();
    }

    void skipSign;
  },
  startEnemySmashWatch: function () {
    if (Cinema._smashWatchStarted || Cinema._smashTriggered || Cinema._finishing) {
      return;
    }

    Cinema._smashWatchStarted = true;
    Cinema._enemyWatchStartTime = (Date.now ? Date.now() : (new Date()).getTime());

    __cinemaSchedule(Cinema, Cinema.updateCheckDog, 0);

    var node = game.Data && game.Data.oLyGame &&
      (game.Data.oLyGame.lyMapBack || game.Data.oLyGame.lyMap || game.Data.oLyGame.lyContainer);
    var pollFromAction = function () {
      if (Cinema._smashTriggered || Cinema._finishing) {
        return;
      }
      Cinema.updateCheckDog();
      if (!Cinema._smashTriggered && node && node.runAction) {
        node.runAction(cc.sequence(cc.delayTime(0.05), cc.callFunc(pollFromAction)));
      }
    };
    if (node && node.runAction) {
      node.runAction(cc.sequence(cc.delayTime(0.05), cc.callFunc(pollFromAction)));
    }

    // Backup with the original enemy timing. This is earlier than func5 finish,
    // so it does not skip the visible chase like the previous forced fix did.
    __cinemaScheduleOnce(Cinema, function () {
      if (!Cinema._smashTriggered && !Cinema._finishing) {
        Cinema.startSmashStage();
      }
    }, 2.25, node);
  },

  startSmashStage: function () {
    if (Cinema._smashTriggered || Cinema._smashCallbackStarted || Cinema._finishing) {
      return;
    }

    Cinema._smashTriggered = true;
    __cinemaStopCallbacks(Cinema, Cinema.updateCheckDog);

    if (Cinema.phantom) {
      var cd = game.Data && typeof game.Data.BButtonCDTime === "number" ? game.Data.BButtonCDTime : 0;
      if (typeof Cinema.phantom._dtCounter === "number" && Cinema.phantom._dtCounter < cd) {
        Cinema.phantom._dtCounter = cd + 0.1;
      }

      if (game.Data && game.Data.arrUpdateObj && game.Data.arrUpdateObj.indexOf && game.Data.arrUpdateObj.indexOf(Cinema.phantom) < 0) {
        game.Data.arrUpdateObj.push(Cinema.phantom);
      }

      __cinemaCall(Cinema.phantom, "BButtonSmash", false);
      Cinema.watchSmashLanding();
    }

    __cinemaCall(game.Logic, "checkTileTrigger", __cinemaPoint(14, 40), vee.Direction.Origin, null, Cinema.smallcat);
  },

  watchSmashLanding: function () {
    if (Cinema._smashLandWatchStarted || Cinema._smashCallbackStarted || Cinema._finishing) {
      return;
    }

    Cinema._smashLandWatchStarted = true;
    var startedAt = Date.now ? Date.now() : (new Date()).getTime();
    var node = Cinema.phantom && Cinema.phantom._container ? Cinema.phantom._container :
      (game.Data && game.Data.oLyGame && (game.Data.oLyGame.lyMapBack || game.Data.oLyGame.lyMap || game.Data.oLyGame.lyContainer));

    var poll = function () {
      if (Cinema._smashCallbackStarted || Cinema._finishing) {
        return;
      }

      var now = Date.now ? Date.now() : (new Date()).getTime();
      var elapsed = (now - startedAt) / 1000;
      var phantom = Cinema.phantom;
      var state = phantom ? phantom._moveState : null;
      var smashShake = (typeof MoveState !== "undefined" && state === MoveState.SmashShake);
      var notSmashingAnymore = phantom && phantom.isSmashing && !phantom.isSmashing() && elapsed > 0.4;
      var stoppedAtGround = phantom && phantom.isSmashing && phantom.isSmashing() &&
        typeof MoveState !== "undefined" && state === MoveState.Smash &&
        elapsed > 0.7 && Math.abs(phantom._speedY || 0) < 1;

      if (smashShake || notSmashingAnymore || stoppedAtGround || elapsed > 2.2) {
        Cinema.smashCallback();
        return;
      }

      if (node && node.runAction) {
        node.runAction(cc.sequence(cc.delayTime(0.05), cc.callFunc(poll)));
      } else {
        __cinemaScheduleOnce(Cinema, poll, 0.05);
      }
    };

    __cinemaScheduleOnce(Cinema, poll, 0.05, node);
  },

  updateCheckDog: function () {
    if (Cinema._smashTriggered || !Cinema.checkDogPos) {
      return;
    }

    var thresholdX = Cinema.checkDogPos.x;
    for (var i = 0; i < Cinema.enemy.length; i++) {
      var enemy = Cinema.enemy[i];
      if (!enemy) {
        continue;
      }

      var enemyPos = __cinemaGetObjPos(enemy);
      var enemyGrid = enemy._grid || null;
      if ((enemyPos && enemyPos.x < thresholdX) || (enemyGrid && enemyGrid.x <= 21)) {
        Cinema.startSmashStage();
        break;
      }
    }
  },

  smashCallback: function () {
    if (Cinema._smashCallbackStarted || Cinema._finishing) {
      return;
    }
    Cinema._smashCallbackStarted = true;
    Cinema._smashLandWatchStarted = true;
    __cinemaStopCallbacks(Cinema, Cinema.updateCheckDog);
    var continueWithBombRun = function () {
      game.Data.arrUpdateObj = [];
      Cinema.MoveRole(Cinema.phantom, 28, 44, function () {
        __cinemaCall(Cinema.phantom, "playAnimate", "huxi_1");
        __cinemaCall(game.Logic, "setBomb", __cinemaPoint(29, 44));

        var bomb = game.Logic.map && game.Logic.map.getObject(__cinemaPoint(29, 44));
        if (bomb) {
          __cinemaCall(bomb, "collide", Cinema.phantom, vee.Direction.Origin, true);
        }

        Cinema.JumpRole(Cinema.phantom, 29, 43, 2, function () {
          Cinema.moveCamera(32, 42, 8);
          Cinema.JumpRole(Cinema.phantom, 32, 41, 3, function () {
            var blackCut = LyBlackCutScene.getCtl();
            __cinemaCall(blackCut, "playAnimate", "out");
            Cinema.JumpRole(Cinema.phantom, 34, 40, 2, function () {
              cc.log("1");
              Cinema.JumpRole(Cinema.phantom, 37, 39, 2, function () {
                Cinema.storyOver();
              });
            });
          });
        });
      });
    };

    var teleportSmallCat = function () {
      if (Cinema.smallcat) {
        __cinemaSetVisible(Cinema.smallcat._container, false);
        __cinemaCall(Cinema.smallcat._container, "setLocalZOrder", 3);
        __cinemaCall(Cinema.smallcat, "playAnimate", "safe");
      }

      __cinemaCall(Cinema.phantom, "BButtonTeleport");
      __cinemaSchedule(Cinema, Cinema.updateSmallCatPos);

      if (Cinema.smallcat && Cinema.smallcat._container) {
        __cinemaRunAction(Cinema.smallcat._container, cc.sequence(
          cc.delayTime(0.2),
          cc.callFunc(function () {
            __cinemaSetVisible(Cinema.smallcat._container, true);
            Cinema.smallcat._container.setPosition(game.Logic.getTilePosCenterByGrid(__cinemaPoint(16, 44)));
            if (Cinema.enemy[0]) {
              __cinemaCall(Cinema.enemy[0], "playAnimate", "get");
            }
          }),
          cc.delayTime(0.3),
          cc.callFunc(function () {
            Cinema.moveBy(Cinema.phantom, 10);
            __cinemaRunAction(Cinema.smallcat._container, cc.sequence(
              cc.callFunc(function () {
                __cinemaCall(Cinema.smallcat, "playAnimate", "run");
              }),
              cc.moveBy(0.2, __cinemaPoint(32, 0)),
              cc.callFunc(function () {
                __cinemaCall(Cinema.smallcat, "playAnimate", "shiver");
              }),
              cc.delayTime(0.5),
              cc.callFunc(function () {
                if (Cinema.enemy[1]) {
                  Cinema.enemy[1]._dashing = true;
                  Cinema.enemy[1]._speedXLimit = 450;
                  __cinemaCall(Cinema.enemy[1], "playAnimate", "get");

                  if (Cinema.enemy[1]._container) {
                    Cinema.enemy[1]._container.runAction(cc.sequence(
                      cc.delayTime(0.5),
                      cc.callFunc(function () {
                        if (!Cinema.enemy[1]) {
                          return;
                        }

                        __cinemaCall(Cinema.enemy[1], "playAnimate", "eat");
                        Cinema.moveToGrid(Cinema.enemy[1], __cinemaPoint(11, 44), function () {
                          __cinemaCall(Cinema.enemy[1], "stopMove");
                          Cinema.enemy[1]._speedX = 0;
                          __cinemaCall(Cinema.enemy[1], "playAnimate", "get", function () {
                            if (Cinema.enemy[1]) {
                              Cinema.enemy[1].hitByStar = function () {};
                              Cinema.moveToGrid(Cinema.enemy[1], __cinemaPoint(28, 44), continueWithBombRun);
                              __cinemaCall(Cinema.enemy[1], "playAnimate", "eat");
                              Cinema.enemy[1]._speedXLimit = 520;
                            }
                          });
                        });
                      })
                    ));
                  }
                }
              }),
              cc.delayTime(0.9),
              cc.callFunc(continueWithBombRun)
            ));
          }),
          cc.delayTime(0.3),
          cc.callFunc(function () {
            __cinemaCall(Cinema.phantom, "BButtonBullet");
          })
        ));
      }

      Cinema.moveCamera(30, 42, Cinema.getMoveDur(12), Cinema.EaseType.EASEINOUT);
    };

    var enemyToRemove = Cinema.enemy[2];
    if (enemyToRemove) {
      __cinemaStopCallbacks(enemyToRemove);
      __cinemaCall(enemyToRemove, "dieAnimate");
      Cinema.enemy.pop();
    }

    for (var i = 0; i < Cinema.enemy.length; i++) {
      var enemy = Cinema.enemy[i];
      if (!enemy) {
        continue;
      }
      enemy._stopY = true;
      __cinemaCall(enemy, "stopMove");
      __cinemaCall(enemy, "playAnimate", "get", function () {
        __cinemaCall(this, "playAnimate", "run");
      }.bind(enemy));
      if (enemy._container) {
        enemy._container.runAction(cc.sequence(
          cc.EaseExponentialOut.create(cc.moveBy(0.5, __cinemaPoint(30, 60))),
          cc.callFunc(function () {})
        ));
      }
    }

    __cinemaCall(vee.Audio, "stopMusic");
    __cinemaCall(vee.Audio, "playMusic", res.bgm_invisible_10s_mp3);

    var duration = Cinema.getMoveDur(4);
    var target = game.Logic.getTilePosCenterByGrid(__cinemaPoint(14, 44));
    if (Cinema.smallcat && Cinema.smallcat._container) {
      Cinema.smallcat._container.runAction(cc.sequence(
        cc.delayTime(0.6),
        cc.callFunc(function () {
          __cinemaCall(Cinema.smallcat, "playAnimate", "run");
        }),
        cc.moveTo(duration, __cinemaPoint(target.x - 15, target.y)),
        cc.callFunc(function () {
          __cinemaCall(Cinema.smallcat, "playAnimate", "huxi_1");
        }),
        cc.delayTime(0.4),
        cc.callFunc(teleportSmallCat)
      ));
    } else {
      teleportSmallCat();
    }
  },

  updateSmallCatPos: function () {
    if (!Cinema.phantom || !Cinema.phantom._container || !Cinema.smallcat || !Cinema.smallcat._container) {
      return;
    }
    this.phantomPos = Cinema.phantom._container.getPosition();
    Cinema.smallcat._container.setPosition(__cinemaPoint(this.phantomPos.x - 5, this.phantomPos.y - 34));
  },

  moveCamera: function (gridX, gridY, duration, easeType) {
    if (!easeType) {
      easeType = Cinema.EaseType.LINER;
    }

    var target = game.Logic.getCameraPosByGrid(__cinemaPoint(gridX, gridY));
    var move = cc.moveTo(parseFloat(duration), target);
    var action = null;

    if (easeType === Cinema.EaseType.LINER) {
      action = move;
    } else if (easeType === Cinema.EaseType.EASEIN) {
      action = cc.EaseIn.create(move, 3);
    } else if (easeType === Cinema.EaseType.EASEOUT) {
      action = cc.EaseOut.create(move, 3);
    } else if (easeType === Cinema.EaseType.EASEINOUT) {
      action = cc.EaseInOut.create(move, 3);
    }

    if (action && game.Data.oLyGame && game.Data.oLyGame.lyContainer) {
      game.Data.oLyGame.lyContainer.runAction(action);
    }
  },

  moveToGrid: function (role, grid, callback) {
    var targetPos = game.Logic.getTilePosCenterByGrid(grid);
    if (!role || !targetPos) {
      return;
    }

    if (role._pos && targetPos.x > role._pos.x) {
      __cinemaCall(role, "moveRight");
    } else {
      __cinemaCall(role, "moveLeft");
    }

    __cinemaInstallMoveStopCheck(role, targetPos, callback);
  },

  moveBy: function (role, offsetX, callback) {
    if (!role || !role._pos) {
      return;
    }

    var targetPos = __cinemaPoint(role._pos.x + offsetX, 0);
    if (targetPos.x > role._pos.x) {
      __cinemaCall(role, "moveRight");
    } else {
      __cinemaCall(role, "moveLeft");
    }

    __cinemaInstallMoveStopCheck(role, targetPos, callback);
  },

  getMoveDur: function (distance) {
    return distance * 0.2;
  },

  MoveRole: function (role, gridX, gridY, callback) {
    if (!role || !role._container) {
      if (callback) {
        callback();
      }
      return;
    }

    var targetGrid = __cinemaPoint(gridX, gridY);
    var targetPos = game.Logic.getTilePosCenterByGrid(targetGrid);
    var currentPos = role._container.getPosition();
    var currentGrid = game.Logic.getTileGridByPos(currentPos);
    var dx = targetGrid.x - currentGrid.x;

    if (dx > 0) {
      __cinemaCall(role, "setFaceTo", vee.Direction.Right);
    } else if (dx < 0) {
      __cinemaCall(role, "setFaceTo", vee.Direction.Left);
    }

    var distance = vee.Utils.manhattanDistance(vee.Utils.pSub(targetGrid, currentGrid));
    var duration = Cinema.getMoveDur(distance);
    var done = callback || function () {};

    __cinemaCall(role, "playAnimate", "run");
    role._container.runAction(cc.sequence(cc.moveTo(duration, targetPos), cc.callFunc(done)));
  },

  JumpRole: function (role, gridX, gridY, heightInTiles, callback) {
    if (!role || !role._container) {
      if (callback) {
        callback();
      }
      return;
    }

    var targetGrid = __cinemaPoint(gridX, gridY);
    var targetPos = game.Logic.getTilePosCenterByGrid(targetGrid);
    var currentPos = role._container.getPosition();
    var currentGrid = game.Logic.getTileGridByPos(currentPos);
    var distance = vee.Utils.manhattanDistance(vee.Utils.pSub(targetGrid, currentGrid));
    var duration = Cinema.getMoveDur(distance);
    var height = heightInTiles * TILE_WIDTH;
    var done = callback || function () {};

    role._container.runAction(cc.sequence(
      cc.delayTime(0),
      cc.callFunc(function () {
        __cinemaCall(role, "playAnimate", "run_jump_up");
      }),
      cc.jumpTo(duration, targetPos.x, targetPos.y, height, 1),
      cc.callFunc(done)
    ));
  },

  storyOver: function () {
    if (Cinema._storyOverStarted || Cinema._finishing) {
      return;
    }

    Cinema._storyOverStarted = true;

    if (this.analyseTag && vee.Analytics && vee.Analytics.logMissionCompleted) {
      cc.log("记录结束");
      vee.Analytics.logMissionCompleted("LevelStoryAnimate");
    }

    var target = game.Logic.getTilePosCenterByGrid(__cinemaPoint(56, 21));
    Story.isShowStory = false;
    Cinema.isCinema = false;

    if (!Cinema.smallcat || !Cinema.smallcat._container) {
      Cinema.finishToTutorial();
      return;
    }

    __cinemaCall(Cinema.smallcat, "playAnimate", "jump");
    Cinema.smallcat._container.runAction(
      cc.EaseExponentialOut.create(cc.moveTo(0.8, target))
    );

    Cinema.smallcat._container.runAction(cc.sequence(
      cc.delayTime(0.85),
      cc.callFunc(function () {
        Cinema.finishToTutorial();
      })
    ));
  },
  setAnalyse: function (analyseTag) {
    this.analyseTag = analyseTag;
  },

  closeCinema: function () {
    __cinemaStopCallbacks(Cinema);
    for (var i = 0; i < Cinema.enemy.length; i++) {
      __cinemaStopCallbacks(Cinema.enemy[i]);
    }
    __cinemaStopCallbacks(Cinema.smallcat);
    __cinemaStopCallbacks(Cinema.phantom);
  }
};

Cinema.finishToTutorial = function () {
  if (Cinema._finishing) {
    return;
  }

  Cinema._finishing = true;

  if (Cinema.analyseTag && vee.Analytics && vee.Analytics.logMissionCompleted) {
    cc.log("Cinema analyse end");
    vee.Analytics.logMissionCompleted("LevelStoryAnimate");
  }

  Story.isShowStory = false;
  Cinema.isCinema = false;

  try {
    Cinema.closeCinema();
  } catch (err) {
    cc.log("SuperCat: closeCinema skipped: " + err);
  }

  vee.Transition.out(res.MapTransition_ccbi, function () {
    vee.PopMgr.closeAll();
    if (cc.director && cc.director.purgeCachedData) {
      cc.director.purgeCachedData();
    }
    vee.PopMgr.popCCB("res/veeGameLayer.ccbi");
    game.Data.oLyGame.onLoaded();
    game.Data.oLyGame.initStage("Tutorial");
  });
};

Cinema.isCinema = false;
Cinema.EaseType = {
  LINER: 1,
  EASEIN: 2,
  EASEOUT: 3,
  EASEINOUT: 4
};

var LyBlackCutScene = vee.Class.extend({
  ccbInit: function () {}
});

LyBlackCutScene.ctl = null;

LyBlackCutScene.getCtl = function () {
  if (!LyBlackCutScene.ctl) {
    var layer = vee.PopMgr.popCCB(res.lyBlackCutScene_ccbi);
    if (layer && layer.controller) {
      layer.controller.ccbInit();
      LyBlackCutScene.ctl = layer.controller;
    }
  }
  return LyBlackCutScene.ctl;
};

LyBlackCutScene.remove = function () {
  if (LyBlackCutScene.ctl) {
    if (LyBlackCutScene.ctl.rootNode) {
      LyBlackCutScene.ctl.rootNode.removeFromParent();
    }
    LyBlackCutScene.ctl = null;
  }
};

var LyCatGrow = vee.Class.extend({
  ccbInit: function (callback) {
    this.playAnimate("show", function () {
      this.playAnimate("star", function () {
        vee.PopMgr.closeLayerByCtl(this);
        if (callback) {
          callback();
        }
      }.bind(this));
    }.bind(this));
  }
});

LyCatGrow.show = function (callback) {
  var layer = vee.PopMgr.popCCB(res.lyBG_story_2_ccbi, { alpha: 0 });
  if (layer && layer.controller) {
    layer.controller.ccbInit(callback);
  }
};
