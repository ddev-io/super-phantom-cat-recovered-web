var __supercatBootRoot = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : this);
(function (root) {
	var state = {
		lines: [],
		overlay: null,
		showOverlay: false
	};

	function ensureOverlay() {
		if (!state.showOverlay) {
			return null;
		}
		if (state.overlay || typeof document === "undefined") {
			return state.overlay;
		}
		var parent = document.body || document.documentElement;
		if (!parent) {
			return null;
		}
		var overlay = document.createElement("pre");
		overlay.id = "supercat-boot-debug";
		overlay.style.position = "fixed";
		overlay.style.left = "0";
		overlay.style.top = "0";
		overlay.style.zIndex = "99999";
		overlay.style.margin = "0";
		overlay.style.padding = "8px 10px";
		overlay.style.maxWidth = "48vw";
		overlay.style.maxHeight = "45vh";
		overlay.style.overflow = "auto";
		overlay.style.background = "rgba(0,0,0,0.72)";
		overlay.style.color = "#7CFF7C";
		overlay.style.font = "12px/1.35 Consolas, monospace";
		overlay.style.pointerEvents = "none";
		overlay.style.whiteSpace = "pre-wrap";
		parent.appendChild(overlay);
		state.overlay = overlay;
		return overlay;
	}

	root.__supercatBootTrace = function (message) {
		var text = String(message);
		if (typeof console !== "undefined" && typeof console.log === "function") {
			console.log("[supercat]", text);
		}
		state.lines.push(text);
		if (state.lines.length > 22) {
			state.lines.shift();
		}
		var overlay = ensureOverlay();
		if (overlay) {
			overlay.textContent = state.lines.join("\n");
		}
	};

	if (state.showOverlay && typeof document !== "undefined") {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", function () {
				ensureOverlay();
			}, { once: true });
		} else {
			ensureOverlay();
		}
	}

	if (typeof root.addEventListener === "function") {
		root.addEventListener("error", function (event) {
			var details = event && (event.message || (event.error && event.error.stack) || event.filename);
			root.__supercatBootTrace("window.error: " + details);
		});
	}

	root.__supercatBootTrace("main.js loaded");
})(__supercatBootRoot);

if (typeof cc !== "undefined" && typeof cc._addEventListener !== "function") {
	cc._addEventListener = function (target, type, listener, useCapture) {
		if (target && target.addEventListener) {
			target.addEventListener(type, listener, !!useCapture);
		}
	};
}

if (typeof cc !== "undefined" && cc.loader && typeof cc.loader.register === "function") {
	cc.loader.register(["ccbLang"], {
		load: function (realUrl, url, res, cb) {
			cc.loader.loadTxt(realUrl, function (err, txt) {
				cb(err, txt || "");
			});
		},
		getBasePath: function () {
			return cc.loader.resPath;
		}
	});
}

function __supercatIsPreloadResource(item) {
	var isString = typeof item === "string";
	if (item == null) {
		return false;
	}
	if (isString) {
		return /\.[^./?#]+(?:[?#].*)?$/.test(item);
	}
	if (typeof item === "object") {
		if (item.type) {
			return true;
		}
		if (typeof item.src === "string") {
			return /\.[^./?#]+(?:[?#].*)?$/.test(item.src);
		}
	}
	return false;
}

var __supercatValidResSet = null;
function __supercatGetValidResSet() {
	if (__supercatValidResSet) {
		return __supercatValidResSet;
	}
	if (typeof g_resources === "undefined" || !g_resources || !g_resources.length) {
		return null;
	}
	var set = {};
	for (var i = 0; i < g_resources.length; i++) {
		var item = g_resources[i];
		var src = typeof item === "string" ? item : (item && item.src);
		if (typeof src === "string") {
			set[src] = true;
		}
	}
	__supercatValidResSet = set;
	return set;
}

// Some CCBI files retain their original subfolders although the recovered
// resource directory is flat. Use the matching root-level asset when present.
function __supercatFixResourcePath(url) {
	if (typeof url !== "string" || !url) {
		return url;
	}
	var set = __supercatGetValidResSet();
	if (!set || set[url]) {
		return url;
	}
	var clean = url.split("?")[0].split("#")[0];
	if (set[clean] || clean.indexOf(".") < 0) {
		return url;
	}
	var base = clean.substring(clean.lastIndexOf("/") + 1);
	var flat = "res/" + base;
	return flat !== clean && set[flat] ? flat : url;
}

function __supercatInstallFlatPathFallback() {
	if (typeof cc === "undefined") {
		return;
	}
	if (cc.textureCache && typeof cc.textureCache.addImage === "function" && !cc.textureCache.__supercatFlatPathWrapped) {
		var originalAddImage = cc.textureCache.addImage;
		cc.textureCache.addImage = function (url, cb, target) {
			return originalAddImage.call(this, __supercatFixResourcePath(url), cb, target);
		};
		cc.textureCache.__supercatFlatPathWrapped = true;
	}
	if (cc.spriteFrameCache && typeof cc.spriteFrameCache.addSpriteFrames === "function" && !cc.spriteFrameCache.__supercatFlatPathWrapped) {
		var originalAddSpriteFrames = cc.spriteFrameCache.addSpriteFrames;
		cc.spriteFrameCache.addSpriteFrames = function (url, texture) {
			return originalAddSpriteFrames.call(this, __supercatFixResourcePath(url), texture);
		};
		cc.spriteFrameCache.__supercatFlatPathWrapped = true;
	}
}

function __supercatPreloadSpriteFrameFiles() {
	if (!cc || !cc.loader || !cc.spriteFrameCache) {
		return;
	}
	if (cc.spriteFrameCache.__supercatAtlasesRegistered) {
		return;
	}
	var root = __supercatBootRoot;
	root.__supercatSpriteFramePlists = root.__supercatSpriteFramePlists || {};
	var config = cc.loader.getRes("res/spriteFrameFileList.plist") || root.__supercatSpriteFrameFileListConfig;
	if (config) {
		root.__supercatSpriteFrameFileListConfig = config;
	}
	var files = config && config.spriteFrameFiles;
	if (!files || !files.length) {
		return;
	}
	var loaded = 0;
	for (var i = 0; i < files.length; i++) {
		var plistPath = "res/" + files[i];
		var plistData = cc.loader.getRes(plistPath) || root.__supercatSpriteFramePlists[plistPath];
		if (!plistData) {
			cc.log("SuperCat: sprite frame plist not preloaded: " + plistPath);
			continue;
		}
		root.__supercatSpriteFramePlists[plistPath] = plistData;
		if (typeof cc.spriteFrameCache._addSpriteFramesByObject === "function") {
			cc.spriteFrameCache._addSpriteFramesByObject(plistPath, plistData);
		} else {
			cc.spriteFrameCache.addSpriteFrames(plistPath);
		}
		loaded++;
	}
	if (loaded > 0) {
		cc.spriteFrameCache.__supercatAtlasesRegistered = true;
	}
	__supercatBootRoot.__supercatBootTrace("sprite frame atlases registered=" + loaded);
}

function __supercatSpriteFrameBaseName(name) {
	if (typeof name !== "string") {
		return name;
	}
	var slashPos = Math.max(name.lastIndexOf("/"), name.lastIndexOf("\\"));
	return slashPos >= 0 ? name.substring(slashPos + 1) : name;
}

function __supercatPatchSpriteFrameCacheLookup() {
	if (!cc || !cc.spriteFrameCache || cc.spriteFrameCache.__supercatLookupWrapped) {
		return;
	}
	var frameCache = cc.spriteFrameCache;
	var originalGetSpriteFrame = frameCache.getSpriteFrame;
	var originalClear = frameCache._clear;
	frameCache.getSpriteFrame = function (name) {
		var frame = originalGetSpriteFrame.call(this, name);
		var baseName = __supercatSpriteFrameBaseName(name);
		if (!frame && baseName !== name) {
			frame = originalGetSpriteFrame.call(this, baseName);
		}
		if (!frame && !this.__supercatResolvingMissingFrame) {
			this.__supercatResolvingMissingFrame = true;
			__supercatPreloadSpriteFrameFiles();
			this.__supercatResolvingMissingFrame = false;
			frame = originalGetSpriteFrame.call(this, name);
			if (!frame && baseName !== name) {
				frame = originalGetSpriteFrame.call(this, baseName);
			}
		}
		return frame;
	};
	if (typeof originalClear === "function") {
		frameCache._clear = function () {
			var result = originalClear.apply(this, arguments);
			this.__supercatAtlasesRegistered = false;
			return result;
		};
	}
	frameCache.__supercatLookupWrapped = true;
}

function __supercatPatchPurgeCachedData() {
	if (!cc || !cc.director || typeof cc.director.purgeCachedData !== "function" || cc.director.__supercatPurgeWrapped) {
		return;
	}
	var originalPurgeCachedData = cc.director.purgeCachedData;
	cc.director.purgeCachedData = function () {
		var result = originalPurgeCachedData.apply(this, arguments);
		__supercatPreloadSpriteFrameFiles();
		return result;
	};
	cc.director.__supercatPurgeWrapped = true;
}

function __supercatNormalizeListener(listener) {
	if (!listener || typeof listener !== "object") {
		return listener;
	}
	if (typeof listener._getListenerID === "function" || typeof listener.checkAvailable === "function") {
		return listener;
	}
	if (typeof cc !== "undefined" && cc.EventListener && typeof cc.EventListener.create === "function" && listener.event) {
		try {
			return cc.EventListener.create(listener);
		} catch (err) {
			cc.log("failed to normalize listener: " + err);
		}
	}
	return listener;
}

function __supercatPatchEventManager() {
	if (typeof cc === "undefined" || !cc.eventManager || typeof cc.eventManager.addListener !== "function") {
		return;
	}
	if (cc.eventManager.__supercatCompatAddListener) {
		return;
	}
	var __supercatAddListener = cc.eventManager.addListener;
	cc.eventManager.addListener = function (listener, nodeOrPriority) {
		return __supercatAddListener.call(this, __supercatNormalizeListener(listener), nodeOrPriority);
	};
	cc.eventManager.__supercatCompatAddListener = true;
}
__supercatPatchEventManager();

function __supercatPatchLyGameCamera() {
	var root = __supercatBootRoot;
	var LyGameClass = root && root.LyGame;
	var proto = LyGameClass && LyGameClass.prototype;
	if (!proto || proto.__supercatCameraPatched) {
		return;
	}

	function validNumber(value) {
		return typeof value === "number" && isFinite(value);
	}

	function validPoint(point) {
		return point && validNumber(point.x) && validNumber(point.y);
	}

	function resetCameraScale() {
		if (typeof game === "undefined" || !game.Data) {
			return 1;
		}
		var fallback = validNumber(game.Data.cameraScaleLimitMIN) ? game.Data.cameraScaleLimitMIN : 1;
		if (!validNumber(game.Data.cameraScaleRate)) {
			game.Data.cameraScaleRate = fallback;
		}
		return game.Data.cameraScaleRate;
	}

	function resolveCameraScale(isFastMove) {
		resetCameraScale();
		var scale = game && game.Logic && typeof game.Logic.getCameraScaleRate === "function"
			? game.Logic.getCameraScaleRate(!!isFastMove)
			: resetCameraScale();
		if (!validNumber(scale) || scale <= 0) {
			scale = validNumber(game.Data.cameraScaleLimitMIN) ? game.Data.cameraScaleLimitMIN : 1;
			game.Data.cameraScaleRate = scale;
		}
		return scale;
	}

	function getCameraCenter(self, player) {
		var faceTo = player && player._faceTo;
		if (game && game.Logic && typeof game.Logic.getCameraOffset === "function") {
			var center = game.Logic.getCameraOffset(faceTo, self._isFreezeX, self._isFreezeY);
			if (validPoint(center)) {
				return center;
			}
		}
		return cc.p(568, 384);
	}

	function resetCameraPositionFromLevelSide() {
		if (typeof game === "undefined" || !game.Data) {
			return;
		}
		var category = game.LevelData && game.LevelData.selectedCategory;
		if (category && category.idx > 99) {
			game.Data.cameraXPos = game.Data.cameraXPosLimit;
		} else {
			game.Data.cameraXPos = -game.Data.cameraXPosLimit;
		}
		game.Data.cameraYPos = game.Data.cameraYPosOff;
	}

	function applyCamera(self, targetPos, useDynamicScale, clampX, dt) {
		if (!self || !self.lyContainer || typeof game === "undefined" || !game.Data) {
			return;
		}
		var player = game.Data.oPlayerCtl;
		if (!validPoint(targetPos) && player && typeof player.getElePosition === "function") {
			targetPos = player.getElePosition();
		}
		if (!validPoint(targetPos)) {
			targetPos = cc.p(0, 0);
		}

		if (useDynamicScale) {
			var moveState = player && player._moveState;
			var isFastMove = typeof MoveState !== "undefined" &&
				(moveState === MoveState.Dash || moveState === MoveState.DashJump);
			self._sclRate = resolveCameraScale(isFastMove);
			self.lyContainer.setScale(self._sclRate);
		} else {
			self._sclRate = validNumber(self._sclRate) && self._sclRate > 0 ? self._sclRate : 1;
		}

		if (self._isFreezeY) {
			targetPos = cc.p(targetPos.x, self._freezeY);
		}

		var cameraCenter = game && game.Logic && typeof game.Logic.getCameraOffset === "function"
			? game.Logic.getCameraOffset(player && player._faceTo, self._isFreezeX, self._isFreezeY, dt)
			: getCameraCenter(self, player);
		if (!validPoint(cameraCenter)) {
			cameraCenter = getCameraCenter(self, player);
		}
		self._cameraPos = cameraCenter;
		self._castPos = cc.p(
			self._cameraPos.x - targetPos.x * self._sclRate,
			self._cameraPos.y - targetPos.y * self._sclRate
		);
		if (clampX && typeof self._safeCameraPos === "function") {
			self._safeCameraPos();
		}
		self.lyContainer.setPosition(self._castPos);
	}

	proto.initCamera = function (targetPos) {
		resetCameraPositionFromLevelSide();
		applyCamera(this, targetPos, true, false);
	};

	proto.setCameraFollow = function (targetPos, dt) {
		if (this.stopCamera || !(game && game.Data && game.Data.oPlayerCtl)) {
			return;
		}
		applyCamera(this, targetPos, false, true, dt);
		if (this.bgCtl && typeof this.bgCtl.setOffset === "function") {
			this.bgCtl.setOffset(vee.Utils.pSub(this._castPos, this.lyContainer.getPosition()));
		}
	};

	proto._safeCameraPos = function () {
		if (!this._castPos) {
			return;
		}
		if (this._castPos.x > -64) {
			this._castPos.x = -64;
		}
		if (validNumber(this._xRightEdge) && this._castPos.x < this._xRightEdge) {
			this._castPos.x = this._xRightEdge;
		}
	};

	proto.__supercatCameraPatched = true;
	root.__supercatBootTrace("LyGame camera patch installed");
}

function __supercatInstallBootDebugHooks() {
	if (typeof __supercatBootRoot === "undefined" || __supercatBootRoot.__supercatBootDebugHooksInstalled) {
		return;
	}
	__supercatBootRoot.__supercatBootDebugHooksInstalled = true;
	__supercatBootRoot.__supercatBootTrace("install boot debug hooks");
	__supercatPatchLyGameCamera();

	if (typeof cc !== "undefined" && cc.BuilderReader && typeof cc.BuilderReader.load === "function" && !cc.BuilderReader.__supercatDebugWrapped) {
		var __supercatBuilderLoad = cc.BuilderReader.load;
		cc.BuilderReader.load = function (path, owner) {
			__supercatBootRoot.__supercatBootTrace("BuilderReader.load " + path);
			var node = __supercatBuilderLoad.apply(this, arguments);
			if (!node) {
				__supercatBootRoot.__supercatBootTrace("BuilderReader.load returned null: " + path);
				return node;
			}
			var sizeText = "?";
			try {
				if (typeof node.getContentSize === "function") {
					var size = node.getContentSize();
					sizeText = size.width + "x" + size.height;
				}
			} catch (err) {
				sizeText = "size-error";
			}
			__supercatBootRoot.__supercatBootTrace("BuilderReader.ok " + path + " size=" + sizeText + " controller=" + !!node.controller);
			return node;
		};
		cc.BuilderReader.__supercatDebugWrapped = true;
	}

	if (typeof cc !== "undefined" && cc.director && typeof cc.director.runScene === "function" && !cc.director.__supercatDebugRunScene) {
		var __supercatRunScene = cc.director.runScene;
		cc.director.runScene = function (scene) {
			__supercatBootRoot.__supercatBootTrace("director.runScene");
			return __supercatRunScene.apply(this, arguments);
		};
		cc.director.__supercatDebugRunScene = true;
	}

	if (typeof cc !== "undefined" && cc.director && typeof cc.director.replaceScene === "function" && !cc.director.__supercatDebugReplaceScene) {
		var __supercatReplaceScene = cc.director.replaceScene;
		cc.director.replaceScene = function (scene) {
			__supercatBootRoot.__supercatBootTrace("director.replaceScene");
			return __supercatReplaceScene.apply(this, arguments);
		};
		cc.director.__supercatDebugReplaceScene = true;
	}

	if (typeof vee !== "undefined" && vee.PopMgr) {
		if (typeof vee.PopMgr.resetScene === "function" && !vee.PopMgr.__supercatDebugResetScene) {
			var __supercatResetScene = vee.PopMgr.resetScene;
			vee.PopMgr.resetScene = function () {
				__supercatBootRoot.__supercatBootTrace("PopMgr.resetScene");
				return __supercatResetScene.apply(this, arguments);
			};
			vee.PopMgr.__supercatDebugResetScene = true;
		}
		if (typeof vee.PopMgr.popCCB === "function" && !vee.PopMgr.__supercatDebugPopCCB) {
			var __supercatPopCCB = vee.PopMgr.popCCB;
			vee.PopMgr.popCCB = function (path) {
				__supercatBootRoot.__supercatBootTrace("PopMgr.popCCB " + path);
				var layer = __supercatPopCCB.apply(this, arguments);
				__supercatBootRoot.__supercatBootTrace("PopMgr.popCCB done " + path + " controller=" + !!(layer && layer.controller));
				return layer;
			};
			vee.PopMgr.__supercatDebugPopCCB = true;
		}
		if (typeof vee.PopMgr.closeAll === "function" && !vee.PopMgr.__supercatDebugCloseAll) {
			var __supercatCloseAll = vee.PopMgr.closeAll;
			vee.PopMgr.closeAll = function () {
				__supercatBootRoot.__supercatBootTrace("PopMgr.closeAll");
				return __supercatCloseAll.apply(this, arguments);
			};
			vee.PopMgr.__supercatDebugCloseAll = true;
		}
	}
}

function __supercatScheduleBootFallback() {
	if (typeof __supercatBootRoot === "undefined" || __supercatBootRoot.__supercatBootFallbackScheduled) {
		return;
	}
	__supercatBootRoot.__supercatBootFallbackScheduled = true;
	setTimeout(function () {
		try {
			var layers = (typeof vee !== "undefined" && vee.PopMgr && vee.PopMgr.layers) ? vee.PopMgr.layers.length : -1;
			var isAndroid = (typeof game !== "undefined" && game.Data) ? game.Data.isAndroid : "n/a";
			var isFreeGame = (typeof game !== "undefined" && game.Data) ? game.Data.isFreeGame : "n/a";
			__supercatBootRoot.__supercatBootTrace("boot fallback check layers=" + layers + " android=" + isAndroid + " free=" + isFreeGame);
			if (layers > 0) {
				return;
			}
			if (typeof LyIndex !== "undefined" && typeof LyIndex._startWebStory1 === "function") {
				__supercatBootRoot.__supercatBootTrace("boot fallback -> LyIndex._startWebStory1()");
				LyIndex._startWebStory1();
				return;
			}
			if (typeof LyIndex !== "undefined" && typeof LyIndex.show === "function") {
				__supercatBootRoot.__supercatBootTrace("boot fallback -> LyIndex.show()");
				LyIndex.show();
				return;
			}
			if (typeof LySplash !== "undefined" && typeof LySplash.show === "function") {
				__supercatBootRoot.__supercatBootTrace("boot fallback -> LySplash.show()");
				LySplash.show();
				return;
			}
			__supercatBootRoot.__supercatBootTrace("boot fallback found no entry layer");
		} catch (err) {
			var details = (err && err.stack) ? err.stack : err;
			__supercatBootRoot.__supercatBootTrace("boot fallback error: " + details);
		}
	}, 300);
}

if (typeof cc !== "undefined" && typeof cc.AsyncPool === "function" && !cc.__supercatAsyncPoolLimited) {
	var __SuperCatAsyncPool = cc.AsyncPool;
	var __SUPER_CAT_ASYNC_LIMIT = 16;
	cc.AsyncPool = function (srcObj, limit, iterator, onEnd, target) {
		var size = 0;
		if (srcObj && typeof srcObj.length === "number") {
			size = srcObj.length;
		} else if (srcObj) {
			for (var key in srcObj) {
				if (Object.prototype.hasOwnProperty.call(srcObj, key)) {
					size++;
				}
			}
		}
		if (!limit || limit > __SUPER_CAT_ASYNC_LIMIT) {
			limit = Math.min(size || __SUPER_CAT_ASYNC_LIMIT, __SUPER_CAT_ASYNC_LIMIT);
		}
		return new __SuperCatAsyncPool(srcObj, limit, iterator, onEnd, target);
	};
	cc.AsyncPool.prototype = __SuperCatAsyncPool.prototype;
	cc.__supercatAsyncPoolLimited = true;
}

if (typeof cc !== "undefined" && cc.loader && typeof cc.loader._loadResIterator === "function" && !cc.loader.__supercatSafeIterator) {
	var __supercatLoadResIterator = cc.loader._loadResIterator;
	cc.loader._loadResIterator = function (item, index, cb) {
		if (!__supercatIsPreloadResource(item)) {
			cc.log("skip invalid preload resource: " + item);
			if (typeof cb === "function") {
				cb(null, null);
			}
			return;
		}
		return __supercatLoadResIterator.call(this, item, index, cb);
	};
	cc.loader.__supercatSafeIterator = true;
}

cc.game.onStart = function(){
	__supercatBootRoot.__supercatBootTrace("cc.game.onStart");
	__supercatInstallFlatPathFallback();
	__supercatPatchEventManager();
	if (cc.BuilderReader && typeof cc.BuilderReader.setResourcePath === "function") {
		cc.BuilderReader.setResourcePath("res/");
		__supercatBootRoot.__supercatBootTrace("BuilderReader.resourcePath=res/");
	}
	var wsize = cc.view && typeof cc.view.getFrameSize === "function"
		? cc.view.getFrameSize()
		: cc.size(0, 0);
	if (!wsize || !wsize.width || !wsize.height || (wsize.width <= 300 && wsize.height <= 150)) {
		wsize = cc.size(
			(typeof window !== "undefined" && window.innerWidth) || 1136,
			(typeof window !== "undefined" && window.innerHeight) || 768
		);
	}
	var isVerticle = (wsize.width < wsize.height);

	var width = wsize.width;
	var height = wsize.height;

	var resWidth = (isVerticle ? 640 : 960);
	var resHeight = (isVerticle ? 960 :  640);

	var rW = width/resWidth;
	var rH = height/resHeight;
	var wDes, hDes, pDes;
	if (rW >= rH) {
		pDes = cc.ResolutionPolicy.FIXED_HEIGHT;
		wDes = Math.min(width, (isVerticle ? 768 : 1136));
		hDes = resHeight;
	} else {
		pDes = cc.ResolutionPolicy.FIXED_WIDTH;
		wDes = resWidth;
		hDes = Math.min(height, (isVerticle ? 1136 : 768));
	}
	cc.view.setDesignResolutionSize(wDes, hDes, pDes) ;
	cc.view.resizeWithBrowserSize(false);
	__supercatBootRoot.__supercatBootTrace("design=" + wDes + "x" + hDes + " win=" + width + "x" + height);

	var preloadResources = (g_resources || []).filter(__supercatIsPreloadResource);
	__supercatBootRoot.__supercatBootTrace("preload resources=" + preloadResources.length);

    cc.LoaderScene.preload(preloadResources, function () {
		__supercatBootRoot.__supercatBootTrace("preload complete");
		__supercatPatchSpriteFrameCacheLookup();
		__supercatPreloadSpriteFrameFiles();
		__supercatPatchPurgeCachedData();
		__supercatPatchEventManager();
		__supercatInstallBootDebugHooks();
		if (typeof main === "function") {
			__supercatBootRoot.__supercatBootTrace("calling main()");
			main();
			__supercatBootRoot.__supercatBootTrace("main() returned");
			__supercatScheduleBootFallback();
			cc.gameInited = true;
			return;
		}
		cc.error("Global main() was not exported by app.js");
    }, this);


/*
	var scene = new cc.Scene();
	var layer = new cc.LayerColor(cc.color(0,0,0));
	var bg = new cc.Sprite("res/level_image_battle_time_ring.png");
	bg.setColor(cc.GREEN);
	var progress = new cc.ProgressTimer(bg);
	progress.setType(cc.ProgressTimer.TYPE_RADIAL);
	progress.setReverseDirection(true);
	layer.addChild(progress);

	progress.setPosition(cc.p(568, 384));
	var time = 0;
	layer.schedule(function (dt) {
		time += dt;

		progress.setPercentage(100 - time / 5 * 100);
	});

	scene.addChild(layer);
	cc.director.runScene(scene);


	var listener = cc.EventListener.create({
		event: cc.EventListener.TOUCH_ONE_BY_ONE,
		swallowTouches: true,
		onTouchBegan: function () {
			time = 0;
			return false;
		}
	});

	// this._eventListenser = listener;
	cc.eventManager.addListener(listener, layer);
*/

//
//
//	var label = new cc.LabelTTF("Hello Veewo", "res/Novecento wide.ttf", 30);
//	label.setFontFillColor(cc.color(0, 0, 255));
//	label.setPosition(cc.p(width/6, height/4));
//
//	var label2 = new cc.LabelTTF("简体测试", "res/Novecento wide.ttf", 30);
//	label2.setFontFillColor(cc.color(0, 255, 0));
//	label2.setPosition(cc.p(width/6, height/4 + 60));
//
//	var label3 = new cc.LabelTTF("繁體測試", "res/Novecento wide.ttf", 30);
//	label3.setFontFillColor(cc.color(255, 0, 0));
//	label3.setPosition(cc.p(width/6, height/4 + 120));
//
//	layer.addChild(label);
//	layer.addChild(label2);
//	layer.addChild(label3);
//
//
//	var label = new cc.LabelTTF("Hello Veewo", "res/Linotte-Regular.ttf", 30);
//	label.setFontFillColor(cc.color(0, 0, 255));
//	label.setPosition(cc.p(width/3, height/4));
//
//	var label2 = new cc.LabelTTF("简体测试", "res/Linotte-Regular.ttf", 30);
//	label.setFontFillColor(cc.color(0, 255, 0));
//	label2.setPosition(cc.p(width/3, height/4 + 60));
//
//	var label3 = new cc.LabelTTF("繁體測試", "res/Linotte-Regular.ttf", 30);
//	label3.setFontFillColor(cc.color(255, 0, 0));
//	label3.setPosition(cc.p(width/3, height/4 + 120));
//
//	layer.addChild(label);
//	layer.addChild(label2);
//	layer.addChild(label3);

};

cc.game.run();
