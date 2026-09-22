// Recovered first-pass JS from recovered-src/dis-samples/dis/gameLogic.dis
var game = game || {};
game.Logic = {
  _tmxMap: null,
  _tmxLayer: null,
  _tmxLayerEx: null,
  _tmxLayerHide: null,
  _tmxLayerExtra: null,
  _tmxLayerGrass: null,
  _tmxLayerTips: null,
  _tmxTileSize: null,
  _mapTips: [],
  objMap: null,
  triggerMap: null,
  dynamicObjMap: null,
  configMap: null,
  map: null,
  mapex: null,
  _bgmName: null,
  _isParkour: null,
  _deadZoneRevivalCount: 1,
  init: function () {
  },
  _resolveTMXResource: function (tmxName) {
    if (typeof tmxName !== "string") {
      tmxName = String(tmxName);
    }

    if (tmxName.indexOf("res/") === 0 || /\.tmx$/i.test(tmxName)) {
      return tmxName;
    }

    var key = "map" + tmxName + "_tmx";
    if (typeof res !== "undefined" && res && res[key]) {
      return res[key];
    }

    cc.log("TMX resource alias not found: " + tmxName + ", using raw name");
    return tmxName;
  },

  _normalizeResourcePath: function (basePath, sourcePath) {
    if (!sourcePath) {
      return sourcePath;
    }

    sourcePath = String(sourcePath);

    if (/^(?:[a-z]+:)?\/\//i.test(sourcePath) || sourcePath.indexOf("data:") === 0) {
      return sourcePath;
    }

    if (sourcePath.indexOf("res/") === 0 || sourcePath.charAt(0) === "/") {
      return sourcePath;
    }

    basePath = String(basePath || "");
    var slash = basePath.lastIndexOf("/");
    var dir = slash >= 0 ? basePath.substring(0, slash + 1) : "";
    var parts = (dir + sourcePath).split("/");
    var out = [];

    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      if (!part || part === ".") {
        continue;
      }
      if (part === "..") {
        if (out.length) {
          out.pop();
        }
        continue;
      }
      out.push(part);
    }

    return out.join("/");
  },
  _resourceBasename: function (path) {
    path = String(path || "");
    var q = path.indexOf("?");
    if (q >= 0) {
      path = path.substring(0, q);
    }
    var slash = path.lastIndexOf("/");
    return slash >= 0 ? path.substring(slash + 1) : path;
  },
  _tmxTextureCandidates: function (imagePath, basePath) {
    var candidates = [];
    var addCandidate = function (path) {
      if (!path) { return; }
      path = String(path);
      for (var i = 0; i < candidates.length; i++) {
        if (candidates[i] === path) {
          return;
        }
      }
      candidates.push(path);
    };

    var normalized = this._normalizeResourcePath(basePath || "", imagePath);
    var basename = this._resourceBasename(normalized || imagePath);
    var isNormalizedLocal = normalized &&
      !/^(?:[a-z]+:)?\/\//i.test(normalized) &&
      normalized.indexOf("data:") !== 0 &&
      normalized.charAt(0) !== "/";
    var normalizedInRes = isNormalizedLocal && normalized.indexOf("res/") !== 0 ? "res/" + normalized : null;

    if (basePath) {
      addCandidate(normalized);
      addCandidate(normalizedInRes);
    } else {
      addCandidate(normalizedInRes);
    }
    addCandidate(imagePath);
    addCandidate(normalized);
    addCandidate(normalizedInRes);
    if (basename) {
      addCandidate(basename);
      addCandidate("res/" + basename);
    }

    if (typeof res !== "undefined" && res) {
      var basenameLower = basename ? basename.toLowerCase() : null;
      for (var key in res) {
        if (!res.hasOwnProperty(key)) { continue; }
        var value = res[key];
        if (typeof value !== "string") { continue; }
        if (!/\.(png|jpg|jpeg|webp)$/i.test(value)) { continue; }
        if (value === imagePath || value === normalized) {
          addCandidate(value);
          continue;
        }
        if (basenameLower && this._resourceBasename(value).toLowerCase() === basenameLower) {
          addCandidate(value);
        }
      }
    }

    return candidates;
  },
  _tryGetTextureByPath: function (path) {
    if (!path || typeof cc === "undefined" || !cc.textureCache) {
      return null;
    }

    var cache = cc.textureCache;
    var getTexture = cache.__tmxOriginalGetTextureForKey || cache.getTextureForKey;
    var tex = null;

    if (typeof getTexture === "function") {
      tex = getTexture.call(cache, path);
      if (tex) {
        return tex;
      }
    }

    if (typeof cache.addImage === "function") {
      tex = cache.addImage(path);
      if (tex) {
        return tex;
      }
      if (typeof getTexture === "function") {
        tex = getTexture.call(cache, path);
      }
    }

    return tex || null;
  },
  _ensureTMXTexture: function (imagePath, basePath) {
    var candidates = this._tmxTextureCandidates(imagePath, basePath);
    for (var i = 0; i < candidates.length; i++) {
      var tex = this._tryGetTextureByPath(candidates[i]);
      if (tex) {
        return tex;
      }
    }
    return null;
  },
  _installTMXTextureFallback: function () {
    if (typeof cc === "undefined" || !cc.textureCache || cc.textureCache.__tmxTextureFallbackInstalled) {
      return;
    }

    var cache = cc.textureCache;
    if (typeof cache.getTextureForKey !== "function") {
      return;
    }

    cache.__tmxOriginalGetTextureForKey = cache.getTextureForKey;
    var logic = this;

    cache.getTextureForKey = function (key) {
      var tex = cache.__tmxOriginalGetTextureForKey.call(cache, key);
      if (tex || typeof key !== "string" || !/\.(png|jpg|jpeg|webp)$/i.test(key)) {
        return tex;
      }
      return logic._ensureTMXTexture(key, null) || tex;
    };

    cache.__tmxTextureFallbackInstalled = true;
  },
  _getLoaderText: function (resourcePath) {
    if (typeof cc === "undefined" || !cc.loader || typeof cc.loader.getRes !== "function") {
      return null;
    }

    var data = cc.loader.getRes(resourcePath);
    if (!data) {
      return null;
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.documentElement && typeof XMLSerializer !== "undefined") {
      try {
        return new XMLSerializer().serializeToString(data);
      } catch (e) {
        return null;
      }
    }

    if (typeof data.getElementsByTagName === "function" && typeof XMLSerializer !== "undefined") {
      try {
        return new XMLSerializer().serializeToString(data);
      } catch (e2) {
        return null;
      }
    }

    return null;
  },
  _prepareTMXTextureFromText: function (resourcePath, text, visited) {
    if (!text) {
      return;
    }

    visited = visited || {};
    visited[resourcePath] = true;

    var imageRegex = /<image\b[^>]*\bsource=["']([^"']+)["'][^>]*>/g;
    var match;

    while ((match = imageRegex.exec(text))) {
      this._ensureTMXTexture(match[1], resourcePath);
    }

    var tilesetRegex = /<tileset\b[^>]*\bsource=["']([^"']+)["'][^>]*>/g;
    while ((match = tilesetRegex.exec(text))) {
      var tsxPath = this._normalizeResourcePath(resourcePath, match[1]);
      if (visited[tsxPath]) {
        continue;
      }
      var tsxText = this._getLoaderText(tsxPath);
      this._prepareTMXTextureFromText(tsxPath, tsxText, visited);
    }
  },
  _prepareTMXTextures: function (tmxResource) {
    this._installTMXTextureFallback();
    var text = this._getLoaderText(tmxResource);
    this._prepareTMXTextureFromText(tmxResource, text, {});
  },
  createTMXMap: function (arg0) {
    var tmxResource = this._resolveTMXResource(arg0);
    this._prepareTMXTextures(tmxResource);
    var local0 = cc.TMXTiledMap.create(tmxResource);
    this.setPerformingTMX(local0, arg0);
    return local0;
  },
  getLayerByName: function (arg0) {
    var local0 = this._tmxMap.getLayer(arg0);
    return local0;
  },
  savePointGrid: null,
  playerGrid: null,
  otherPlayerGrid: null,
  setPerformingTMX: function (arg0) {
    var localTmxFileName = arguments[1];
    this.funcPool = [];
    arg0.tmxFileName = localTmxFileName;
    this._tmxMap = arg0;
    this._tmxMapSize = arg0.getMapSize();
    this._tmxTileSize = arg0.getTileSize();
    game.Data.mapRightEdge = this._tmxMapSize.width * TILE_WIDTH - TILE_WIDTH_HALF;
    game.Data.oLyGame.setCameraXRightEdge(game.Data.mapRightEdge);
    this._tmxLayer = this._tmxMap.getLayer("main");
    this.map = vee.Map.create(this._tmxMapSize, this._tmxTileSize);
    var local0 = this._tmxLayer.getLocalZOrder();
    if (game.Data.oLyGame && game.Data.oLyGame.lyMapBack &&
        typeof game.Data.oLyGame.lyMapBack.setLocalZOrder === "function") {
      game.Data.oLyGame.lyMapBack.setLocalZOrder(local0 - 1);
    }
    this._tmxLayerEx = this._tmxMap.getLayer("mainEx");
    if (this._tmxLayerEx) {
      this._tmxLayerEx.setVisible(false);
    }
    this.mapex = vee.Map.create(this._tmxMapSize, this._tmxTileSize);
    this._tmxLayerHide = this._tmxMap.getLayer("mask");
    if (this._tmxLayerHide) {
      this._tmxLayerHide.setLocalZOrder(101);
    } else {
      this._tmxLayerHide = null;
    }
    this._tmxLayerGrass = this._tmxMap.getLayer("grass");
    if (this._tmxLayerGrass) {
      this._tmxLayerGrass = null;
    }
    this._tmxLayerTips = this._tmxMap.getLayer("tips");
    if (this._tmxLayerTips) {
      this._tmxLayerTips.setVisible(false);
      var local1 = this._tmxMap.getProperties();
      this._mapTips = [];
      this._mapTips.push(local1.tip1);
      this._mapTips.push(local1.tip2);
      this._mapTips.push(local1.tip3);
    } else {
      this._tmxLayerTips = null;
      this._mapTips = [];
    }
    this.configMap = vee.Map.create(this._tmxMapSize, this._tmxTileSize);
    this.funcPool.push(function () {
      cc.log("func 1");
      var local0 = this._tmxMap.getProperties();
      for (var local1 in local0) {
        var local2 = parseInt(local0[local1]);
        var local3 = game.enemyStringMap[local1];
        if (local3) {
          for (var local4 = 0; local4 < local2; local4++) {
            var local5 = Enemy.createWithInfo({
              type: local3,
              dir: vee.Direction.Left
            }, true);
            if (local5) {
              game.Data.enemyPool.push(local5.controller);
            }
          }
        }
      }
      var local6 = local0.bg;
      if (local6) {
        game.Data.bgName = local6;
        game.Data.oLyGame.lyBG.removeAllChildren();
        if (game.Data.isStaticBG()) {
          var local7 = new cc.Sprite("res/" + local6 + ".png");
          local7.setAnchorPoint(cc.p(0, 0));
          game.Data.oLyGame.lyBG.addChild(local7, 1);
        } else {
          var local8 = LyDynamicBG.create(local6);
          game.Data.oLyGame.lyBG.addChild(local8, 1);
          game.Data.oLyGame.bgCtl = local8.controller;
        }
      } else {
        game.Data.bgName = null;
      }
      this._isParkour = local0.isParkour;
      if (this._isParkour) {
        this.setForParkour(true);
      } else {
        this._isParkour = null;
      }
      this._bgmName = local0.bgm;
      if (this._bgmName) {
        this._bgmName = "res/" + this._bgmName + ".mp3";
        vee.Audio.preload(this._bgmName);
      } else {
        this._bgmName = null;
      }
      var local9 = local0.deadZoneRevivalCount;
      if (local9) {
        this._deadZoneRevivalCount = parseInt(local9);
      } else {
        this._deadZoneRevivalCount = 1;
      }
    }.bind(this));
    this.funcPool.push(function () {
      cc.log("func 2");
      this.playerGrid = this.deployConfig();
    }.bind(this));
    this.funcPool.push(function () {
      cc.log("func 3");
      var savedPointIdx = game.Data.getSavePointIdx();
      if (savedPointIdx != null && ("" + savedPointIdx) === ("" + game.Data.performingTMXIdx) && this.savePointGrid) {
        this.playerGrid = this.savePointGrid;
        game.Data.savePointSaved = true;
      } else {
        game.Data.savePointSaved = false;
      }
      var local0 = game.Data.getTMXInfoByName(localTmxFileName);
      if (local0) {
        this.objMap = local0.info.objMap;
        if (game.Data.isDoorIn) {
          this.deployPlayer(this.playerGrid);
        } else {
          this.playerGrid = vee.Utils.pAdd(local0.info.playerGrid, game.Data.doorOutOffset);
          var local1 = this.getTilePosByGrid(this.playerGrid);
          game.Data.oPlayerCtl.setElePosition(cc.p(local1.x + TILE_WIDTH_HALF, local1.y + TILE_WIDTH_HALF));
          game.Data.oPlayerCtl.resetPlayerState();
          game.Data.oLyGame.setCameraFollow(local1);
        }
      } else {
        this.objMap = vee.Map.create(this._tmxMapSize, this._tmxTileSize);
        this.triggerMap = vee.Map.create(this._tmxMapSize, this._tmxTileSize);
        this.dynamicObjMap = vee.Map.create(this._tmxMapSize, this._tmxTileSize);
        this.deployPlayer(this.playerGrid);
      }
      if (game.Data.isInParkour() && game.Data.oPlayerCtl && game.Data.oPlayerCtl.isCanOperatByParkour) {
        game.Data.oPlayerCtl.parkourMove();
      }
      if (game.Data.oPlayerCtl) {
        game.Data.oLyGame.initCamera(game.Data.oPlayerCtl.getElePosition());
      }
    }.bind(this));
    this.funcPool.push(function () {
      cc.log("func 4");
      if (game.Data.oPlayerCtl) {
        var local0 = ElePowerSymbol.create(game.Data.oPlayerCtl);
        game.Data.oLyGame.lyMap.addChild(local0.nodeBox);
        game.Data.oPlayerCtl.elf = local0;
        game.Data.setPlayerType(game.PlayerType.Normal);
      }
    }.bind(this));
    this.funcPool.push(function () {
      cc.log("func 5");
      cc.log(new Date());
      this.savePointGrid = null;
      for (var local0 = 0; local0 < this._tmxMapSize.width; local0++) {
        for (var local1 = 0; local1 < this._tmxMapSize.height; local1++) {
          var local2 = cc.p(local0, local1);
          var local3 = this.getTileData(local2, this._tmxLayer);
          if (local3) {
            if (local3.tileInfo.type === game.ObjectType.NPC) {
              this.createNPC(local2, local3);
            }
            if (local3 && this.isExObjType(local3.tileInfo.type)) {
              this.mapex.setObject(local3, local2);
            } else {
              this.map.setObject(local3, local2);
            }
            if (local3.tileInfo.type === game.ObjectType.SavePoint) {
              this.savePointGrid = cc.p(local2.x, local2.y);
            }
            if (local3.gid === game.BlockType.Coin) {
              game.Data.stageMaxCoin++;
            }
          }
          if (this._tmxLayerEx) {
            var local4 = this.getTileData(local2, this._tmxLayerEx);
            if (local4) {
              this.mapex.setObject(local4, local2);
              if (local4.gid === game.BlockType.Coin) {
                game.Data.stageMaxCoin++;
              }
            }
          }
          game.Data.addPerformingSkillBoxes(local2, this._tmxLayer);
        }
      }
      cc.log("coin in main : " + game.Data.stageMaxCoin);
      cc.log(new Date());
    }.bind(this));
    this.funcPool.push(function () {
      cc.log("func 6");
      var local0 = this._tmxMap.allLayers();
      for (var local1 in local0) {
        var local2 = local0[local1];
        if (local2.getLayerName().substring(0, 5) === "extra") {
          var local3 = local2.getProperties();
          local2.originX = parseInt(local3.x);
          local2.originY = parseInt(local3.y);
          local2.maxX = parseInt(local3.maxX);
          local2.maxY = parseInt(local3.maxY);
          local2.isExtra = true;
          if (local3.isShow) {
            cc.log("is show....");
            this.addExtraTileToMap(local2);
          } else {
            local2.runAction(cc.fadeTo(0, 0));
            local2.setVisible(false);
            var local4 = this._tmxMap.getLayer("bg_" + local2.getLayerName());
            if (local4) {
              local4.setVisible(false);
              local4.runAction(cc.fadeTo(0, 0));
            }
          }
          var local5 = parseInt(local3.coin);
          if (local5) {
            game.Data.stageMaxCoin += local5;
          }
        } else if (local2.getLayerName().substring(0, 4) === "mask") {
          local2.setLocalZOrder(101);
        }
      }
      cc.log("coin in extra : " + game.Data.stageMaxCoin);
      var local6 = this._tmxMap.getObjectGroups();
      for (var local7 in local6) {
        var local8 = local6[local7];
        if (local8.getGroupName().substring(0, 8) === "coinList") {
          game.Data.stageMaxCoin += local8.getObjects().length;
        }
      }
      cc.log("coin in object group : " + game.Data.stageMaxCoin);
    }.bind(this));
    this.funcPool.push(function () {
      cc.log("func 7");
      this.deployTriggerConfig();
    }.bind(this));
    this.funcPool.push(function () {
      cc.log("func 8");
      this.deployTileConfig(this.playerGrid);
    }.bind(this));
    this.funcPool.push(function () {
      cc.log("func 9");
      game.Data.oLvCtl.prepare();
    }.bind(this));
    this.funcPool.push(function () {
      cc.log("func 10");
      EfxEnemyDie.show(cc.p(-5000, -5000));
      EfxBlockBreak.show(cc.p(-5000, -5000));
      EfxGetCoin.show(cc.p(-5000, -5000));
      if (game.Logic._bgmName) {
        vee.Audio.playMusic(game.Logic._bgmName);
      } else {
        vee.Audio.stopMusic();
      }
      if (!MultiController.checkHasMultiLevel() && !game.Data.isCinema && (game.Data.stageType === game.StageType.Normal || game.Data.stageType === game.StageType.Parkour) && game.LevelData.selectedCategory && game.LevelData.selectedLevel) {
        var local0 = game.LevelData.selectedCategory.idx + 1;
        var local1 = game.LevelData.selectedLevel.idx + 1;
        if (game.Data.performingTMXIdx !== "Tutorial" && game.Data.performingTMXIdx !== "Story1") {
          if (local0 === 7) {
            local0 = 0;
          }
          cc.log("ef level level=========%d", local1);
          EfxLevel.show(local0, local1);
        }
      }
      game.Data.oLyGame.refreshCoin();
    }.bind(this));
    this.funcStepCallback = function (arg0) {
      game.Data.oLvLoadingCtl.setPercent(arg0);
    }.bind(this);
    this.funcSeqFinishCallback = function () {
      game.Data.oLvLoadingCtl.loaded();
      game.Data.oLyGame.startUpdate();
      game.Data.oLyGame.loadingFinish();
      if (game.Data.isFreeGame) {
        if (game.Data.retryCount > 1) {
          vee.Utils.scheduleOnce(function () {
            LyGetBlackCat.show();
          }, 1.5);
        }
      } else if (game.Data.retryCount > 2 && vee.Utils.isLucky(0.3 + game.Data.retryCount / 5)) {
        vee.Utils.scheduleOnce(function () {
          LyGetBlackCat.show();
        }, 1.5);
      }
      cc.log("stage max coin count = " + game.Data.stageMaxCoin);
      if (Cinema.isCinema) {
        Cinema.init();
        if (game.Data.oLyGame.isFirstPlay()) {
          Cinema.setAnalyse(true);
        }
      }
      if (MultiController.checkHasMultiLevel()) {
        cc.eventManager.dispatchCustomEvent("multi_gamestart_loadover");
      }
    }.bind(this);
  },
  funcPool: null,
  funcPoolLen: null,
  flushFunctionPool: function () {
    this.funcPoolLen = this.funcPool.length;
    if (this.funcPoolLen > 0) {
      vee.Utils.scheduleOnce(this.funcInSeq.bind(this));
    }
  },
  funcStepCallback: null,
  funcSeqFinishCallback: null,
  funcInSeq: function () {
    var local0 = this.funcPool.shift();
    if (_.isFunction(local0)) {
      local0();
    }
    var local1 = this.funcPool.length;
    if (this.funcPool.length > 0) {
      if (this.funcStepCallback) {
        this.funcStepCallback(parseInt(((this.funcPoolLen - local1) / this.funcPoolLen) * 100));
      }
      if (parseInt(((this.funcPoolLen - local1) / this.funcPoolLen) * 100) === 70) {
        cc.log("check point!");
      }
      vee.Utils.scheduleOnce(this.funcInSeq.bind(this));
    } else if (this.funcSeqFinishCallback) {
      this.funcSeqFinishCallback();
    }
  },
  deployConfig: function () {
    var local0 = this._tmxMap.getObjectGroup("objConfig").getObjects();
    var local1 = null;
    var local2 = local0.length;
    for (var local5 = 0; local5 < local2; local5++) {
      var local3 = local0[local5];
      var local6 = this.getTileGridByPos(cc.p(local3.x + TILE_WIDTH_HALF, local3.y + TILE_WIDTH_HALF));
      if (local3.type === "player") {
        if (local3.name === "other") {
          cc.log("zqdebug other grid=======x=%d  y=%d", local6.x, local6.y);
          this.otherPlayerGrid = local6;
        } else {
          local1 = local6;
          cc.log("zqdebug role grid=======x=%d  y=%d", local6.x, local6.y);
        }
      } else if (local3.type === "enemy") {
        var local4 = local3.name.split(",");
        var local7 = local4.length;
        if (local7 >= 4) {
          var local8 = local7 === 5 ? local4[4] : null;
          this.configMap.setObject({
            first: cc.p(parseInt(local4[0]), parseInt(local4[1])),
            last: cc.p(parseInt(local4[2]), parseInt(local4[3])),
            dir: local8,
            name: local3.name
          }, local6);
        } else if (local7 === 1) {
          this.configMap.setObject({
            dir: local4[0],
            name: local3.name
          }, local6);
        } else {
          this.configMap.setObject(local3, local6);
        }
      } else if (
        local3.type === "egg" ||
        local3.type === "transform" ||
        local3.type === "platform" ||
        local3.type === "trapStone" ||
        local3.type === "fire" ||
        local3.type === "npc"
      ) {
        this.configMap.setObject(local3, local6);
      } else if (local3.type === "scaleBlock") {
        this.configMap.setObject(local3, local6);
      }
    }
    return local1;
  },
  deployPlayer: function (arg0) {
    if (arg0) {
      var local0 = this.getTilePosByGrid(arg0);
      if (game.Data.oPlayerCtl) {
        game.Data.oPlayerCtl.setElePosition(cc.p(local0.x + TILE_WIDTH_HALF, local0.y + TILE_WIDTH_HALF));
        game.Data.oPlayerCtl.resetPlayerState();
        game.Data.oLyGame.setCameraFollow(cc.p(local0.x, local0.y));
        game.Data.oPlayerCtl.startUpdate();
      } else {
        var local1 = game.AvatarData.getCurrentAvatar();
        var local2 = local1.role;
        if (local1.type === game.Roles.Vampire) {
          var local3 = new cc.Sprite(res.bg_power_bat_png);
          local3.setScale(2);
          local3.setAnchorPoint(cc.p(0, 0));
          game.Data.oLyGame.lyTouch.addChild(local3);
        }
        if (game.Data.checkIs61()) {
          local2 = res.hero_smallfox_ccbi;
          game.Data.playerLife = 1;
          game.Data.oLyGame.refreshHeart();
        } else if (game.Data.checkIsMidAutumn()) {
          local2 = game.AvatarData.getAvatarData(12).role;
        } else if (game.Data.checkIsHolloween()) {
          local2 = game.AvatarData.getAvatarData(13).role;
        } else if (game.Data.checkIsThanksgiving()) {
          local2 = game.AvatarData.getAvatarData(14).role;
        }
        if ("Tutorial" === game.Data.performingTMXIdx) {
          local2 = res.elePlayer_Zhai_ccbi;
        }
        if (MultiController.checkHasMultiLevel()) {
          local2 = res.hero_red_ccbi;
        }
        var local4 = ElePlayer.create(local2);
        local4.controller.stopUpdate();
        local4.controller.isCanOperatByParkour = false;
        local4.controller.playerInAninate();
        game.Data.oPlayerCtl = local4.controller;
        game.Data.oLyGame.lyMap.addChild(local4.container, 2);
        game.Data.oLyGame.lyContainer.setScale(game.Data.cameraScaleLimitMIN);
        var local5 = cc.p(local0.x + TILE_WIDTH_HALF, local0.y + TILE_WIDTH_HALF);
        local4.controller.setElePosition(local5);
        local4.controller._offsetX = 0;
        local4.controller._offsetY = 0;
        if (this._isParkour) {
          local4.controller.addMotionStreak();
          local4.controller.hideStreak();
        }
      }
      return this.getTileGridByPos(cc.p(local0.x + TILE_WIDTH_HALF, local0.y + TILE_WIDTH_HALF));
    }
  },
  deployTileConfig: function (arg0, arg1, arg2) {
    if (arg0) {
      var local0 = arg0.x - this._checkDistanceHor;
      var local1 = arg0.y - this._checkDistanceVer;
      var local2 = arg0.x + this._checkDistanceHor;
      var local3 = arg0.y + this._checkDistanceVer;
      if (MultiController.checkHasMultiLevel()) {
        local0 = 0;
        local1 = 0;
        local2 = this._tmxMapSize.width;
        local3 = this._tmxMapSize.height;
      }
      if (local0 < 0) {
        local0 = 0;
      }
      if (local1 >= this._tmxMapSize.height) {
        local1 = this._tmxMapSize.height - 1;
      }
      if (local2 >= this._tmxMapSize.width) {
        local2 = this._tmxMapSize.width - 1;
      }
      if (local3 < 0) {
        local3 = 0;
      }
      if (arg1) {
        for (var local4 = local0; local4 < local2; local4++) {
          for (var local5 = local1; local5 < local3; local5++) {
            var local6 = this.objMap.getObject(cc.p(local4, local5));
            if (local6 && local6._eleType !== game.EleType.Trigger) {
              local6._container.removeFromParent();
              this.objMap.removeObject(cc.p(local4, local5));
            }
          }
        }
      } else {
        for (var local4 = local0; local4 <= local2; local4++) {
          for (var local5 = local1; local5 <= local3; local5++) {
            var local7 = cc.p(local4, local5);
            this.createItemByGrid(local7, false, arg2);
            this.createEnemyByGrid(local7, arg2);
            this._checkTd = game.Logic.map.getObject(local7);
            if (this._checkTd) {
              this._checkTd.viewIn();
            }
          }
        }
      }
    }
  },
  deployTriggerConfig: function () {
    Trigger.resetTriggerSign();
    var local0 = this._tmxMap.getObjectGroup("triggerConfig");
    if (!local0) {
      return;
    }
    var local1 = local0.getObjects();
    var local2 = local1.length;
    var local3 = game.LevelData.selectedCategory;
    var local4 = false;
    if (local3 && local3.checkHasUnlockMoon()) {
      local4 = true;
    }
    var local5 = game.LevelData.selectedLevel;
    var local6 = local5 && local5.isLevelReverseKeyCollected();
    for (var local7 = 0; local7 < local2; local7++) {
      var local8 = local1[local7];
      var local9 = this.getTileGridByPos(cc.p(local8.x + TILE_WIDTH_HALF, local8.y + TILE_WIDTH_HALF));
      var local10 = true;
      if (local8.type === "ShowExtra") {
        var local11 = this._tmxMap.getLayer(local8.name);
        if (local11) {
          if (!local11.showTileGrid) {
            local11.showTileGrid = [];
          }
          local11.showTileGrid.push(local9);
        }
      } else if (local8.type === "HideExtra") {
        var local11 = this._tmxMap.getLayer(local8.name);
        if (local11) {
          if (!local11.hideTileGrid) {
            local11.hideTileGrid = [];
          }
          local11.hideTileGrid.push(local9);
        }
      } else if (local8.type === "ToggleExtra") {
        var local11 = this._tmxMap.getLayer(local8.name);
        if (local11) {
          if (!local11.toggleTileGrid) {
            local11.toggleTileGrid = [];
          }
          local11.toggleTileGrid.push(local9);
        }
      } else if (local8.type === "AddItem") {
        if (local8.name === "coin") {
          game.Data.stageMaxCoin++;
        }
      } else if (local8.type === "ShowText" || local8.type === "ShowTextOnce") {
        if (vee.data.moon && local4 && !local6) {
          var local12 = this.triggerMap.getObject(local9);
          if (local12 && !local8.moon) {
            local10 = false;
          }
        } else if (local8.moon) {
          local10 = false;
        }
      }
      if (local10) {
        this.triggerMap.setObject(Trigger.create(local8), local9);
      }
    }
  },
  showSequenceCoin: function (arg0) {
    var local0 = this._tmxMap.getObjectGroup(arg0);
    if (local0.hasShown) {
      return;
    }
    local0.hasShown = true;
    if (local0) {
      var local1 = local0.getObjects();
      vee.Audio.playEffect(res.inGame_efx_coinGenerate_mp3);
      var local2 = {};
      local2.objs = local1;
      local2.coinIdx = 0;
      vee.Utils.scheduleCallbackForTarget(local2, function () {
        var local0 = this.objs.shift();
        if (!local0) {
          vee.Utils.unscheduleAllCallbacksForTarget(this);
          return;
        }
        var local1 = game.Logic;
        var local2 = local1.getTileGridByPos(cc.p(local0.x + TILE_WIDTH_HALF, local0.y + TILE_WIDTH_HALF));
        var local3 = local1.getTileDataByGid(game.BlockType.Coin, local2);
        local1.mapex.setObject(local3, local2);
        var local4 = local1.createItemByGrid(local2);
        local4.controller.playAnimate("Create");
        local4.controller.setGridInMap(local2);
        local4.container.coinIdx = this.coinIdx;
        local4.container.runAction(cc.sequence(
          cc.delayTime(0.25),
          cc.callFunc(function () {
            if (this.coinIdx < 10) {
              vee.Audio.playEffect(res.inGame_efx_coinListGenerate_mp3);
            }
          }.bind(local4.container))
        ));
        this.coinIdx++;
      }.bind(local2), 0.1);
    } else {
      cc.log("Error: Load sequence coin layer failed. coinLayerName = " + arg0);
    }
  },
  showSequenceSusliks: function (arg0) {
    var local0 = this._tmxMap.getObjectGroup(arg0);
    if (local0) {
      var local1 = local0.getObjects();
      var local2 = local1.length;
      var local3 = local0.getProperties();
      var local4 = parseFloat(local3.duration) || 3;
      var local5 = parseFloat(local3.interval) || 1;
      EnemySusliks.arrSusliks = [];
      EnemySusliks.killCount = 0;
      EnemySusliks.disappearCount = 0;
      for (var local6 = 0; local6 < local2; local6++) {
        var local7 = local1[local6];
        var local8 = vee.Direction.string2Direction(local7.dir);
        if (!local8) {
          local8 = vee.Direction.Top;
        }
        var local9 = EnemySusliks.create(
          this.getTilePosCenterByGrid(this.getTileGridByPos(cc.p(local7.x + TILE_WIDTH_HALF, local7.y + TILE_WIDTH_HALF))),
          local8
        );
        EnemySusliks.arrSusliks.push(local9);
        local9.susIdx = local6;
        local9._container.setVisible(false);
        local9._container.runAction(cc.sequence(
          cc.delayTime((local6 + 1) * local5),
          cc.callFunc(function () {
            this.show();
            this._container.setVisible(true);
          }.bind(local9)),
          cc.delayTime(local4),
          cc.callFunc(function () {
            this.disappear();
          }.bind(local9))
        ));
        game.Data.oLyGame.lyMapBack.addChild(local9._container);
      }
    }
  },
  _checkW: 28,
  _checkH: 24,
  _checkWHalf: 14,
  _checkHHalf: 12,
  _checkDistanceHor: 12,
  _checkDistanceVer: 10,
  _checkGrid: null,
  _gridNext: null,
  _checkTd: null,
  checkNewGrids: function (arg0, arg1) {
    var local0 = cc.p(arg0.x, arg0.y);
    this._gridNext = vee.Utils.pAdd(local0, arg1);
    if ((Math.abs(arg1.x) > 1 || Math.abs(arg1.y) > 1) &&
        typeof window !== "undefined" && window.__SUPER_CAT_DEBUG_GRID_JUMPS) {
      cc.log("SuperCat: long grid delta x=" + arg1.x + " y=" + arg1.y);
    }
    if (arg1.x !== 0) {
      var local1;
      var local2;
      if (arg1.x > 0) {
        local1 = 1;
        local2 = local0.x + this._checkDistanceHor;
        local0.x -= this._checkDistanceHor + 3;
      } else {
        local1 = -1;
        local2 = local0.x - this._checkDistanceHor;
        local0.x += this._checkDistanceHor + 3;
      }
      for (var local3 = local1; Math.abs(local3) <= Math.abs(arg1.x); local3 += local1) {
        for (var local4 = -6; local4 < this._checkH + 6; local4++) {
          this._checkGrid = cc.p(local0.x + (local3 - local1), this._gridNext.y - local4 + this._checkHHalf);
          this.removeItemByGrid(this._checkGrid);
          this._checkTd = game.Logic.map.getObject(this._checkGrid);
          if (this._checkTd) {
            this._checkTd.viewOut();
          }
          if (local4 >= 0 && local4 < this._checkH) {
            this._checkGrid = cc.p(local2 + local3, this._gridNext.y - local4 + this._checkHHalf);
            this.createEnemyByGrid(this._checkGrid);
            this.createItemByGrid(this._checkGrid);
            this._checkTd = game.Logic.map.getObject(this._checkGrid);
            if (this._checkTd) {
              this._checkTd.viewIn();
            }
          }
        }
      }
    }
    if (arg1.y !== 0) {
      if (arg1.y < 0) {
        this._gridNext.y -= this._checkDistanceVer;
        local0.y += this._checkDistanceVer + 3;
      } else {
        this._gridNext.y += this._checkDistanceVer;
        local0.y -= this._checkDistanceVer + 3;
      }
      for (var local4 = -6; local4 < this._checkW + 6; local4++) {
        this._checkGrid = cc.p(this._gridNext.x + local4 - this._checkWHalf, local0.y);
        this.removeItemByGrid(this._checkGrid);
        this._checkTd = game.Logic.map.getObject(this._checkGrid);
        if (this._checkTd) {
          this._checkTd.viewOut();
        }
        if (local4 >= 0 && local4 < this._checkW) {
          this._checkGrid = cc.p(this._gridNext.x + local4 - this._checkWHalf, this._gridNext.y);
          this.createEnemyByGrid(this._checkGrid);
          this.createItemByGrid(this._checkGrid);
          this._checkTd = game.Logic.map.getObject(this._checkGrid);
          if (this._checkTd) {
            this._checkTd.viewIn();
          }
        }
      }
    }
  },
  createEnemyByGrid: function (arg0, arg1) {
    if (!this.checkTileGridValid(arg0)) {
      return;
    }
    if (this.dynamicObjMap.getObject(arg0)) {
      return;
    }
    var local0 = this.mapex.getObject(arg0);
    if (!local0) {
      return;
    }
    if (arg1 && local0.layer !== arg1) {
      return;
    }
    if (!local0.refreshSign) {
      local0.refreshSign = 0;
    }
    switch (local0.tileInfo.type) {
      case game.ObjectType.Slime:
        if (local0.refreshSign > 0) {
          local0.refreshSign = 0;
          return;
        }
        break;
    }
    local0.refreshSign++;
    var local1 = Enemy.createWithInfo(local0.tileInfo);
    if (local1) {
      if (Cinema.isCinema) {
        local1.controller.AILogic = function () {};
        local1.controller.AILogicPerFrame = function () {};
      }
      var local2 = local0.layer.getTileAt(arg0);
      if (local2) {
        local2.setVisible(false);
      }
      var local3 = this.getTilePosByGrid(arg0);
      local1.controller._grid = arg0;
      local1.controller.setGridInMap(arg0);
      if (local1.controller.objType === game.ObjectType.SusliksHawk) {
        local1.controller.initPosition(cc.p(local3.x + TILE_WIDTH_HALF, local3.y + TILE_WIDTH_HALF));
      } else {
        local1.controller.initPosition(cc.p(local3.x + TILE_WIDTH_HALF, local3.y + TILE_WIDTH_HALF + 5));
      }
      local1.controller.cutInAnimate();
      this.dynamicObjMap.setObject(local1.controller, arg0);
      game.Data.usingEnemyPool.push(local1.controller);
      local1.controller.afterCreate();
      if (Cinema.isCinema) {
        local1.controller._hasCollide = false;
      }
    }
  },
  _layerType: game.LayerType.Main,
  createItemByGrid: function (arg0, arg1, arg2) {
    if (!this.checkTileGridValid(arg0)) {
      return;
    }
    if (this.objMap.getObject(arg0)) {
      return;
    }
    var local0 = this.mapex.getObject(arg0);
    if (!local0) {
      return;
    }
    if (arg2 && local0.layer !== arg2) {
      return;
    }
    if (local0.tileInfo) {
      var local1 = Item.createWithInfo(local0.tileInfo, arg0, arg2);
      if (local1 === false) {
        var local2 = local0.layer.getTileAt(arg0);
        if (local2) {
          local2.setVisible(false);
        }
      } else if (local1) {
        if (local0.layer) {
          var local2 = local0.layer.getTileAt(arg0);
          if (local2) {
            local2.setVisible(false);
          }
        }
        var local3 = this.getTilePosByGrid(arg0);
        this.objMap.setObject(local1.controller, arg0);
        local1.controller.setGridInMap(arg0);
        local1.controller._createByPlatform = arg1;
        local1.controller.initPosition(cc.p(local3.x + TILE_WIDTH_HALF, local3.y + TILE_WIDTH_HALF));
        local1.controller._layerBelong = local0.layer;
        return local1;
      }
    }
  },
  createNPC: function (arg0, arg1) {
    if (this.objMap.getObject(arg0)) {
      return;
    }
    var local0 = this.configMap.getObject(arg0);
    if (local0) {
      var local1 = game.RoleNameStrData[local0.name];
      if (!local1) {
        var local2 = game.AvatarData.getNextAvatar(0, true);
        if (local2) {
          local1 = local2.role;
        } else {
          var local3 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          var local4 = game.AvatarData.getCurrentAvatar().idx;
          local3.splice(local4, 1);
          local2 = game.AvatarData.getAvatarData(vee.Utils.randomChoice(local3));
          local1 = local2.role;
        }
      }
      if (local1) {
        arg1.layer.removeTileAt(arg0);
        var local5 = ElePlayer.create(local1);
        game.Data.oLyGame.lyMap.addChild(local5.container, 2);
        var local6 = local0.name;
        if (!local6) {
          local6 = "defaultNpc";
        }
        game.Data.npcmap[local6] = local5.controller;
        local5.controller.playAnimate("huxi_1");
        local5.controller.ccbName = local1;
        local5.controller.npcname = game.RoleNameStrDataRevert[local1];
        local5.container.setPosition(this.getTilePosCenterByGrid(arg0));
        this.objMap.setObject(local5.controller, arg0);
      }
    }
  },
  removeItemByGrid: function (arg0) {
    var local0 = this.objMap.getObject(arg0);
    if (!local0) {
      return;
    }
    if (local0._eleType !== game.EleType.Item) {
      return;
    }
    if (local0._type === game.ObjectType.Coin) {
      local0._container.setVisible(false);
      this.objMap.setObject(null, arg0);
      game.Data.itemCoinPool.push(local0);
    } else if (
      local0._type !== game.ObjectType.MovingPlatform &&
      local0._type !== game.ObjectType.FallingBlock &&
      local0._type !== game.ObjectType.Egg &&
      local0._type !== game.ObjectType.Bullet
    ) {
      this.objMap.setObject(null, arg0);
      local0.removeOnGridChange();
      local0._container.removeFromParent();
    }
  },
  checkItemCollide: function (arg0) {
    var local0 = this.objMap.getObject(arg0);
    if (local0 && local0._eleType === game.EleType.Item) {
      local0.collide();
    }
  },
  checkBigCoinCollideNearPlayer: function (arg0, arg1) {
    if (!arg0 || !arg1 || !arg1.getEleRect) {
      return;
    }
    var local0 = arg1.getEleRect();
    var local1;
    var local2;
    var local3;
    for (local1 = -1; local1 <= 1; local1++) {
      for (local2 = -1; local2 <= 1; local2++) {
        local3 = this.objMap.getObject(cc.p(arg0.x + local1, arg0.y + local2));
        if (
          local3 &&
          local3._eleType === game.EleType.Item &&
          local3._type === game.ObjectType.BigCoin &&
          !local3._isOver &&
          local3.getEleRect &&
          cc.rectIntersectsRect(local3.getEleRect(), local0)
        ) {
          local3.collide(vee.Direction.Top);
        }
      }
    }
  },
  _checkBottom: false,
  _checkTop: false,
  _checkLeft: false,
  _checkRight: false,
  safePos: function (arg0, arg1) {
    arg1._speedScaleRate = 1;
    var local0 = this.getTileGridByPos(arg0);
    var local1 = this.map.getObject(local0);
    var local2 = this.checkTile(local1, arg0, arg1, vee.Direction.Origin);
    if (arg1._eleType === game.EleType.Player) {
      this.checkItemCollide(local0);
      var local3 = this.getTilePosByGrid(local0);
      var local4 = cc.p(arg0.x - local3.x, arg0.y - local3.y);
      if (local4.x < TILE_WIDTH_3_1) {
        this.checkItemCollide(cc.p(local0.x - 1, local0.y));
      } else if (local4.x > TILE_WIDTH_3_2) {
        this.checkItemCollide(cc.p(local0.x + 1, local0.y));
      }
      this.checkBigCoinCollideNearPlayer(local0, arg1);
    }
    this._checkBottom = false;
    this._checkTop = false;
    this._checkLeft = false;
    this._checkRight = false;
    var local5 = this.getTilePosCenterByGrid(local0);
    if (!local2 || (local1 && local1.tileInfo && local1.tileInfo.type === game.ObjectType.BlockOneWay)) {
      if (!local2) {
        local2 = arg0;
      }
      var local6 = [];
      if (arg1._speedY > 0) {
        local6.push(vee.Direction.Top);
        if (arg0.y < local5.y) {
          local6.push(vee.Direction.Bottom);
        }
      } else {
        local6.push(vee.Direction.Bottom);
        if (arg0.y > local5.y) {
          local6.push(vee.Direction.Top);
        }
      }
      if (arg0.x < local5.x) {
        local6.push(vee.Direction.Left);
        this._checkLeft = true;
      }
      if (arg0.x > local5.x) {
        local6.push(vee.Direction.Right);
        this._checkRight = true;
      }
      for (var local7 = 0; local7 < local6.length; local7++) {
        var local8 = local6[local7];
        var local9 = this.getTileDataByDir(local0, local8);
        var local10 = this.checkTile(local9, local2, arg1, local8);
        if (local10) {
          local2 = local10;
        } else if (local8 === vee.Direction.Bottom) {
          if (!(local9 && local9.tileInfo && local9.tileInfo.slope !== 0)) {
            this._checkBottom = true;
          }
        } else if (local8 === vee.Direction.Top) {
          this._checkTop = true;
        }
      }
    } else if (local2 && local1 && local1.tileInfo && local1.tileInfo.slope === 0) {
      var local6 = [];
      if (arg0.x < local5.x) {
        local6.push(vee.Direction.Left);
        this._checkLeft = true;
      }
      if (arg0.x > local5.x) {
        local6.push(vee.Direction.Right);
        this._checkRight = true;
      }
      for (var local7 = 0; local7 < local6.length; local7++) {
        var local8 = local6[local7];
        var local9 = this.getTileDataByDir(local0, local8);
        var local10 = this.checkTile(local9, local2, arg1, local8);
        if (local10) {
          local2 = local10;
        }
      }
    }
    var local11 = [];
    if (this._checkBottom && arg1._eleType === game.EleType.Player) {
      if (this._checkLeft) {
        local11.push(vee.Direction.BottomLeft);
      }
      if (this._checkRight) {
        local11.push(vee.Direction.BottomRight);
      }
    }
    if (this._checkTop && arg1._eleType === game.EleType.Player) {
      if (this._checkLeft) {
        local11.push(vee.Direction.TopLeft);
      }
      if (this._checkRight) {
        local11.push(vee.Direction.TopRight);
      }
    }
    for (var local7 = 0; local7 < local11.length; local7++) {
      var local8 = local11[local7];
      var local9 = this.getTileDataByDir(local0, local8);
      var local10 = this.checkTile(local9, local2, arg1, local8);
      if (local10) {
        local2 = local10;
      }
    }
    return local2;
  },
  checkTile: function (arg0, arg1, arg2, arg3) {
    var local0 = null;
    if (arg0 && arg0.check && arg0.tileInfo) {
      switch (arg3) {
        case vee.Direction.TopLeft:
          local0 = arg0.checkBottomRight(arg1, arg2);
          break;
        case vee.Direction.Top:
          local0 = arg0.checkBottom(arg1, arg2);
          break;
        case vee.Direction.TopRight:
          local0 = arg0.checkBottomLeft(arg1, arg2);
          break;
        case vee.Direction.Right:
          local0 = arg0.checkLeft(arg1, arg2);
          break;
        case vee.Direction.BottomRight:
          local0 = arg0.checkTopLeft(arg1, arg2);
          break;
        case vee.Direction.Bottom:
          local0 = arg0.checkTop(arg1, arg2);
          break;
        case vee.Direction.BottomLeft:
          local0 = arg0.checkTopRight(arg1, arg2);
          break;
        case vee.Direction.Left:
          local0 = arg0.checkRight(arg1, arg2);
          break;
        case vee.Direction.Origin:
          local0 = arg0.checkOrigin(arg1, arg2);
          break;
      }
    }
    return local0;
  },
  checkTileRough: function (arg0, arg1, arg2, arg3) {
    var local0 = null;
    if (arg0 && arg0.check && arg0.tileInfo) {
      if (arg3 === vee.Direction.Origin) {
        local0 = arg0.checkOrigin(arg1, arg2);
      } else {
        local0 = arg0.checkTop(arg1, arg2);
      }
    }
    return local0;
  },
  calcSpeedScaleRate: function (arg0, arg1) {
    if (arg0._speedX * arg1.slope >= 0) {
      arg0._speedScaleRate = arg1.speedScale;
    } else {
      arg0._speedScaleRate = 1;
    }
  },
  checkTileTrigger: function (arg0, arg1, arg2, arg3, arg4) {
    if (arg3 && arg3._eleType === game.EleType.Player && arg3._isOver) {
      return;
    }
    if (!arg4 && !arg3._triggerObj) {
      return;
    }
    var local0 = false;
    if (arg4) {
      local0 = true;
    } else {
      switch (arg1) {
        case vee.Direction.Origin:
          var local1 = this.triggerMap.getObject(arg0);
          if (local1) {
            local1.func(arg0, arg1);
          }
          break;
        case vee.Direction.Top:
        case vee.Direction.TopLeft:
        case vee.Direction.TopRight:
          if (arg3._speedY > game.Data.playerYTriggerSpeed) {
            arg1 = vee.Direction.Top;
            local0 = true;
          }
          break;
        case vee.Direction.Bottom:
        case vee.Direction.BottomLeft:
        case vee.Direction.BottomRight:
          if (arg3._moveState === MoveState.Smash) {
            arg1 = vee.Direction.Bottom;
            local0 = true;
          }
          break;
        case vee.Direction.Left:
        case vee.Direction.Right:
          if (arg3.isDashing()) {
            local0 = true;
          }
          break;
      }
    }
    if (local0 && arg2) {
      var local1 = this.triggerMap.getObject(arg0);
      var local2 = null;
      if (arg2.tile) {
        local2 = arg2.tile;
      } else if (arg2.layer) {
        local2 = arg2.layer.getTileAt(arg0);
      }
      var local3 = false;
      if (local2 && arg2.gid === game.BlockType.DynamicBlock) {
        var local5 = vee.Direction.direction2Point(arg1);
        var local6 = vee.Utils.pAdd(arg0, cc.p(local5.x, local5.y));
        if (arg2.layer.getTileGIDAt(local6) !== 0 && local5.x * local5.y !== 0) {
          local6 = vee.Utils.pAdd(arg0, cc.p(0, local5.y));
        }
        if (arg2.layer.getTileGIDAt(local6) !== 0 && local5.x * local5.y !== 0) {
          local6 = vee.Utils.pAdd(arg0, cc.p(local5.x, 0));
        }
        local5 = vee.Utils.pSub(local6, arg0);
        var localOccupiedObj = this.objMap && this.objMap.getObject ? this.objMap.getObject(local6) : null;
        var localOccupiedCleared = false;
        if (localOccupiedObj && localOccupiedObj.squeeze) {
          localOccupiedCleared = !!localOccupiedObj.squeeze(arg1);
        }
        if (!this.map.getObject(local6) && !this.mapex.getObject(local6) &&
            (!localOccupiedObj || localOccupiedObj._eleType === game.EleType.Player || localOccupiedObj._isOver || localOccupiedCleared)) {
          arg2.layer.setTileGID(arg2.gid, local6);
          var local7 = arg2.layer.getTileAt(local6);
          local7.setVisible(true);
          this.map.setObject(this.getTileData(local6, arg2.layer), local6);
          var local8 = arg2.layer.getTileAt(local6);
          local8.setPosition(this.getTilePosByGrid(arg0));
          local8.runAction(cc.EaseExponentialOut.create(cc.moveTo(
            0.2,
            vee.Utils.pAdd(local8.getPosition(), cc.p(local5.x * TILE_WIDTH, -local5.y * TILE_WIDTH))
          )));
          arg2.layer.removeTileAt(arg0);
          this.map.removeObject(arg0);
          vee.Audio.playEffect(res.inGame_event_blockMove_mp3);
          EfxHitBlock.create(this.getTilePosCenterByGrid(local6), vee.Direction.revert(arg1));
          if (arg2.layer.isExtra) {
            if (local6.x < arg2.layer.originX) {
              arg2.layer.originX = local6.x;
            } else if (local6.x > arg2.layer.maxX) {
              arg2.layer.maxX = local6.x;
            }
            if (local6.y < arg2.layer.originY) {
              arg2.layer.originY = local6.y;
            } else if (local6.y > arg2.layer.maxY) {
              arg2.layer.maxY = local6.y;
            }
          }
          local3 = true;
          var local9 = game.Data.oPlayerCtl;
          if (this.isGridSame(local9._grid, local6)) {
            var local10 = vee.Direction.direction2Point(arg1);
            var local11 = null;
            if (local10.x < 0) {
              local11 = cc.p(local9._grid.x - 1, local9._grid.y);
            } else {
              local11 = cc.p(local9._grid.x + 1, local9._grid.y);
            }
            local9.setElePosition(this.getTilePosByGrid(local11));
          }
        } else {
          vee.Audio.playEffect(res.inGame_efx_blockUnmove_mp3);
          local0 = false;
        }
      }
      if (local0 && local1 && local1 !== "removed") {
        if (local1._eleType !== game.EleType.Trigger) {
          return;
        }
        var local12 = vee.Direction.direction2Point(arg1);
        local1.func(arg0, arg1, arg2);
      }
    }
  },
  startGame: function () {
    var local0 = arguments[0];
    var local1 = arguments[1];
    var local2 = arguments[2];
    vee.Transition.out(res.MapTransition_ccbi, function () {
      vee.PopMgr.closeAll();
      var local3 = vee.PopMgr.popCCB("res/veeGameLayer.ccbi");
      game.Data.oLyGame.onLoaded();
      game.Data.oLyGame.initStage(local0, local1, local2);
    });
  },
  checkTileGridValid: function (arg0) {
    return arg0.x < this._tmxMapSize.width && arg0.x >= 0 && arg0.y < this._tmxMapSize.height && arg0.y >= 0;
  },
  getTileGridByPos: function (arg0) {
    var local0 = Math.floor(arg0.x / this._tmxTileSize.width);
    var local1 = Math.floor((this._tmxMapSize.height * this._tmxTileSize.height - arg0.y) / this._tmxTileSize.height);
    return cc.p(local0, local1);
  },
  getTilePosByGrid: function (arg0) {
    if (!arg0) {
      return null;
    }
    var local0 = arg0.x * TILE_WIDTH;
    var local1 = ((this._tmxMapSize.height - 1) - arg0.y) * TILE_WIDTH;
    return cc.p(local0, local1);
  },
  getTilePosCenterByGrid: function (arg0) {
    var local0 = ((arg0.x * TILE_WIDTH) + TILE_WIDTH_HALF);
    var local1 = ((((this._tmxMapSize.height - 1) - arg0.y) * TILE_WIDTH) + TILE_WIDTH_HALF);
    return cc.p(local0, local1);
  },
  getTileInfoByGID: function (arg0) {
    return game.TileIDInfo["Tile" + arg0];
  },
  getGridByDir: function (arg0, arg1) {
    var local0 = vee.Direction.direction2Point(arg1);
    arg0 = vee.Utils.pAdd(arg0, local0);
    if (this.checkTileGridValid(arg0)) {
      return arg0;
    }
    return null;
  },
  getTileData: function (arg0, arg1) {
    if (!arg1) {
      arg1 = this._tmxLayer;
    }
    if (!arg1 || !arg0 || !this.checkTileGridValid(arg0)) {
      return null;
    }
    var local0 = arg1.getTileGIDAt(arg0);
    var local1 = this.getTileDataByGid(local0, arg0, arg1);
    return local1;
  },
  _missingTileInfoGids: {},
  getTileDataByGid: function (arg0, arg1, arg2) {
    if (!arg0) {
      return null;
    }
    var local0 = TileData.createTileData(arg0);
    if (local0 && !local0.tileInfo) {
      if (!this._missingTileInfoGids[arg0]) {
        this._missingTileInfoGids[arg0] = true;
        cc.log("Missing tileInfo for gid: " + arg0 + " at (" + arg1.x + "," + arg1.y + ")");
      }
      return null;
    }
    if (local0) {
      var local1 = this.getTilePosByGrid(arg1);
      local0.setTileDataPos(local1);
      local0.gid = arg0;
      local0.grid = cc.p(arg1.x, arg1.y);
      local0.layer = arg2;
      local0.init();
      return local0;
    }
    return null;
  },
  getBlockTileData: function (arg0, arg1) {
    var local0 = this.getTilePosByGrid(arg0);
    var local1 = arg1.getTileGIDAt(arg0);
    var local2 = TileData.createTileData(1);
    local2.setTileDataPos(local0);
    local2.gid = 1;
    local2.grid = cc.p(arg0.x, arg0.y);
    if (arg1) {
      local2.layer = arg1;
    }
    local2.init();
    return local2;
  },
  getTileInfoAt: function (arg0, arg1) {
    if (!arg1) {
      arg1 = this._tmxLayer;
    }
    if (!arg1 || !arg0 || !this.checkTileGridValid(arg0)) {
      return null;
    }
    var local0 = this.getTileInfoByGID(arg1.getTileGIDAt(arg0));
    return local0;
  },
  getTileDataByDir: function (arg0, arg1) {
    return this.map.getObject(this.getGridByDir(arg0, arg1));
  },
  getItemByGrid: function (arg0) {
    var local0 = this.objMap.getObject(arg0);
    if (local0 && local0._eleType === game.EleType.Item) {
      return local0;
    }
    return null;
  },
  getCameraOffset: function (arg0, arg1, arg2, arg3) {
    if (!arg3) {
      arg3 = 0.02;
    }
    if (!arg1) {
      if (game.Data.cameraXrevived) {
        if (arg0 === vee.Direction.Right) {
          game.Data.cameraXPos -= game.Data.cameraXMoveSpeed * arg3;
          if (game.Data.cameraXPos < -game.Data.cameraXPosLimit) {
            game.Data.cameraXPos = -game.Data.cameraXPosLimit;
          }
        } else {
          game.Data.cameraXPos += game.Data.cameraXMoveSpeed * arg3;
          if (game.Data.cameraXPos > game.Data.cameraXPosLimit) {
            game.Data.cameraXPos = game.Data.cameraXPosLimit;
          }
        }
      } else if (arg0 === vee.Direction.Right) {
        if (game.Data.cameraXPos < -game.Data.cameraXPosLimit) {
          game.Data.cameraXPos += game.Data.cameraXMoveSpeed * arg3 * 4;
        } else {
          game.Data.cameraXPos -= game.Data.cameraXMoveSpeed * arg3 * 4;
          if (game.Data.cameraXPos < -game.Data.cameraXPosLimit) {
            game.Data.cameraXPos = -game.Data.cameraXPosLimit;
            game.Data.cameraXrevived = true;
          }
        }
      } else {
        if (game.Data.cameraXPos > game.Data.cameraXPosLimit) {
          game.Data.cameraXPos -= game.Data.cameraXMoveSpeed * arg3 * 4;
        } else {
          game.Data.cameraXPos += game.Data.cameraXMoveSpeed * arg3 * 4;
          if (game.Data.cameraXPos > game.Data.cameraXPosLimit) {
            game.Data.cameraXPos = game.Data.cameraXPosLimit;
            game.Data.cameraXrevived = true;
          }
        }
      }
    }
    var local0 = game.Data.oPlayerCtl._speedY;
    if (arg2) {
      cc.log("");
      local0 = 0;
    }
    if (game.Data.cameraYrevived) {
      if (local0 === 0 || !game.Data.isEnableCameraYOff) {
        if (game.Data.cameraYPos > game.Data.cameraYPosOff) {
          game.Data.cameraYPos -= game.Data.cameraYRestoreSpeed * arg3;
          if (game.Data.cameraYPos < game.Data.cameraYPosOff) {
            game.Data.cameraYPos = game.Data.cameraYPosOff;
          }
        } else if (game.Data.cameraYPos < game.Data.cameraYPosOff) {
          game.Data.cameraYPos += game.Data.cameraYRestoreSpeed * arg3;
          if (game.Data.cameraYPos > game.Data.cameraYPosOff) {
            game.Data.cameraYPos = game.Data.cameraYPosOff;
          }
        }
      } else {
        game.Data.cameraYPos -= game.Data.oPlayerCtl._offsetY * game.Data.cameraYMoveRate;
        if (game.Data.cameraYPos > game.Data.cameraYPosLimit) {
          game.Data.cameraYPos = game.Data.cameraYPosLimit;
        } else if (game.Data.cameraYPos < -game.Data.cameraYPosLimit) {
          game.Data.cameraYPos = -game.Data.cameraYPosLimit;
        }
      }
      if (game.Data.cameraRestoreY) {
        var local1 = game.Data.cameraYPos - game.Data.cameraYPosOff;
        if (Math.abs(local1) > 2) {
          local1 = local1 > 0 ? 2 : -2;
          game.Data.cameraYPos -= local1;
        } else {
          game.Data.cameraRestoreY = false;
        }
      }
    } else if (game.Data.cameraYPos > game.Data.cameraYPosOff) {
      game.Data.cameraYPos -= game.Data.cameraXMoveSpeed * arg3 * 2;
      if (game.Data.cameraYPos < game.Data.cameraYPosOff) {
        game.Data.cameraYPos = game.Data.cameraYPosOff;
        game.Data.cameraYrevived = true;
      }
    } else {
      game.Data.cameraYPos += game.Data.cameraXMoveSpeed * arg3 * 2;
      if (game.Data.cameraYPos > game.Data.cameraYPosOff) {
        game.Data.cameraYPos = game.Data.cameraYPosOff;
        game.Data.cameraYrevived = true;
      }
    }
    return cc.p(568 + game.Data.cameraXPos, 384 + game.Data.cameraYPos);
  },
  getCameraScaleRate: function (arg0) {
    if (arg0) {
      game.Data.cameraScaleRate -= game.Data.cameraScaleSpeed;
      if (game.Data.cameraScaleRate < game.Data.cameraScaleLimitMAX) {
        game.Data.cameraScaleRate = game.Data.cameraScaleLimitMAX;
      }
    } else {
      game.Data.cameraScaleRate += game.Data.cameraScaleSpeed;
      game.Data.cameraScaleRate += game.Data.cameraScaleSpeed;
      if (game.Data.cameraScaleRate > game.Data.cameraScaleLimitMIN) {
        game.Data.cameraScaleRate = game.Data.cameraScaleLimitMIN;
      }
    }
    return game.Data.cameraScaleRate;
  },
  getCameraPosByGrid: function (arg0) {
    var local0 = game.Logic.getTilePosCenterByGrid(arg0);
    return cc.p((568 - local0.x), (384 - local0.y));
  },
  getMoveDirectionBySpeedX: function (arg0) {
    var local0 = null;
    if (arg0 > 0) {
      local0 = vee.Direction.Right;
    } else if (arg0 < 0) {
      local0 = vee.Direction.Left;
    } else {
      local0 = vee.Direction.Origin;
    }
    return local0;
  },
  showTipsLayer: function () {
    if (this._tmxLayerTips) {
      this._tmxLayerTips.setVisible(true);
    }
  },
  addExtraTileToMap: function (arg0) {
    for (var local0 = arg0.originX; local0 <= arg0.maxX; local0++) {
      for (var local1 = arg0.originY; local1 <= arg0.maxY; local1++) {
        var local2 = game.Logic.getTileData(cc.p(local0, local1), arg0);
        if (local2 && this.isExObjType(local2.tileInfo.type)) {
          this.mapex.setObject(local2, cc.p(local0, local1));
        } else if (local2) {
          this.map.setObject(local2, cc.p(local0, local1));
          this.mapex.setObject(null, cc.p(local0, local1));
          var local3 = this.objMap.getObject(cc.p(local0, local1));
          if (local3) {
            local3.disappear();
          }
        }
        game.Data.addPerformingSkillBoxes(cc.p(local0, local1), arg0);
      }
    }
  },
  triggerTileCallback: function (arg0, arg1, arg2) {
    if (arg0) {
      return arg0.collide(arg1, arg2);
    }
  },
  setBomb: function (arg0) {
    game.Logic._tmxLayer.setTileGID(game.BlockType.BombBlock, arg0);
    var local0 = game.Logic.getTileData(arg0, game.Logic._tmxLayer);
    local0.isPlayerBomb = true;
    var local1 = game.Logic._tmxLayer.getTileAt(arg0);
    local1.setVisible(false);
    game.Logic.map.setObject(local0, arg0);
  },
  isGridSame: function (arg0, arg1) {
    return arg0.x === arg1.x && arg0.y === arg1.y;
  },
  isBlock: function (arg0) {
    if (arg0 && arg0.tileInfo && (
      arg0.tileInfo.type === game.ObjectType.Block ||
      arg0.tileInfo.type === game.ObjectType.Slope ||
      arg0.tileInfo.type === game.ObjectType.BlockStab ||
      arg0.tileInfo.type === game.ObjectType.BlockHurt ||
      arg0.tileInfo.type === game.ObjectType.BlockBreakable ||
      arg0.tileInfo.type === game.ObjectType.BlockBomb ||
      arg0.tileInfo.type === game.ObjectType.BlockScale
    )) {
      return true;
    }
    return false;
  },
  isHurtBlock: function (arg0) {
    return arg0 === 72 || arg0 === 73 || arg0 === 71;
  },
  isBreakableBlock: function (arg0) {
    return arg0 === 62 || arg0 === 66 || arg0 === 69 || arg0 === 70 || arg0 === 137 || arg0 === 138 || arg0 === 139 || arg0 === 140;
  },
  isExObjType: function (arg0) {
    return (arg0 >= 0 && arg0 <= 99) || (arg0 >= 100 && arg0 <= 200) || arg0 === 2000;
  },
  showGetCoinEfx: function (arg0) {
    EfxGetCoin.show(arg0);
  },
  drawRectByGrid: function (arg0) {
    game.Data.oLyGame.drawNode.drawRect(cc.p((arg0.x * TILE_WIDTH), (((game.Logic._tmxMapSize.height - 1) - arg0.y) * TILE_WIDTH)), cc.p(((arg0.x * TILE_WIDTH) + TILE_WIDTH), ((((game.Logic._tmxMapSize.height - 1) - arg0.y) * TILE_WIDTH) + TILE_WIDTH)));
  },
  drawRect: function (arg0) {
    game.Data.oLyGame.drawNode.drawRect(cc.p(arg0.x, arg0.y), cc.p((arg0.x + arg0.width), (arg0.y + arg0.height)), cc.RED);
  },
  removeMapExObjectByGrid: function (arg0) {
    var local0 = this.mapex.getObject(arg0);
    if (local0) {
      this.mapex.removeObject(arg0);
    }
  },
  setForParkour: function (arg0) {
    if (arg0) {
      game.Data.stageType = game.StageType.Parkour;
      game.Data.oLyGame.hideControlButton(LyGame.ControlButtonType.ActionButton | LyGame.ControlButtonType.MoveButton | LyGame.ControlButtonType.JumpButton);
    } else {
      game.Data.stageType = game.StageType.Normal;
      if (!Story.isShowStory) {
        game.Data.oLyGame.showControlButton(LyGame.ControlButtonType.MoveButton);
      }
    }
    if (game.Data.oLyGame.bgCtl) {
      game.Data.oLyGame.bgCtl._moveRateX = arg0 ? 1.5 : 0.5;
    }
  }
};
