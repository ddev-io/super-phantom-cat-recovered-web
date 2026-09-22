/* Super Cat webOS low-memory runtime. ES5 for older webOS Chromium versions. */
(function (root) {
    "use strict";
    var api = root.__supercatMemory = {};
    var atlasIndex = null;
    var installed = false;
    var stats = { imageLoads: 0, imageErrors: 0, activeImages: 0, peakActiveImages: 0,
        indexedAtlases: 0, loadedAtlases: 0, droppedEffects: 0 };

    function trace(message) {
        if (root.__supercatBootTrace) root.__supercatBootTrace(message);
    }
    function own(obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); }
    function flat(path) {
        return typeof root.__supercatFixResourcePath === "function" ?
            root.__supercatFixResourcePath(path) : path;
    }
    function base(path) { return String(path).replace(/^.*[\\/]/, ""); }

    // Index the small plist dictionaries, NOT textures or SpriteFrame instances.
    // _addSpriteFramesByObject() itself calls addImage(): calling it for every
    // plist would defeat an image-preload filter and allocate all 62 atlases.
    api.indexAtlases = function () {
        var cache = cc.spriteFrameCache;
        var list = cc.loader.getRes("res/spriteFrameFileList.plist") ||
            root.__supercatSpriteFrameFileListConfig;
        if (!list || !list.spriteFrameFiles) return;
        root.__supercatSpriteFrameFileListConfig = list;
        var saved = root.__supercatSpriteFramePlists = root.__supercatSpriteFramePlists || {};
        if (atlasIndex) {
            cache.__supercatAtlasesRegistered = true;
            return;
        }
        atlasIndex = Object.create(null);
        for (var i = 0; i < list.spriteFrameFiles.length; i++) {
            var path = "res/" + list.spriteFrameFiles[i];
            var dict = saved[path] || cc.loader.getRes(path);
            if (!dict || !dict.frames) continue;
            saved[path] = dict;
            stats.indexedAtlases++;
            for (var name in dict.frames) {
                if (!own(dict.frames, name)) continue;
                if (!own(atlasIndex, name)) atlasIndex[name] = path;
                var shortName = base(name);
                if (!own(atlasIndex, shortName)) atlasIndex[shortName] = path;
                var aliases = dict.frames[name].aliases || [];
                for (var j = 0; j < aliases.length; j++) {
                    if (!own(atlasIndex, aliases[j])) atlasIndex[aliases[j]] = path;
                }
            }
        }
        cache.__supercatAtlasesRegistered = true;
        trace("lazy atlas index=" + stats.indexedAtlases + " (no texture preload)");
    };

    api.ensureFrame = function (name, exactOnly) {
        api.indexAtlases();
        if (!atlasIndex) return;
        var path = atlasIndex[name] || (!exactOnly && atlasIndex[base(name)]);
        var dict = path && root.__supercatSpriteFramePlists[path];
        if (!dict) return;
        cc.spriteFrameCache._addSpriteFramesByObject(path, dict);
        stats.loadedAtlases++;
    };

    function installImageQueue() {
        var loader = cc.loader, pending = Object.create(null), queue = [], active = 0;
        var limit = Math.max(1, Math.min(2, parseInt(root.__supercatImageLoadConcurrency, 10) || 1));
        var gap = 16, timer = null;
        function schedule() {
            if (timer !== null) return;
            timer = setTimeout(function () { timer = null; pump(); }, gap);
        }
        function pump() {
            while (active < limit && queue.length) start(queue.shift());
        }
        function start(job) {
            active++;
            stats.activeImages = active;
            stats.peakActiveImages = Math.max(stats.peakActiveImages, active);
            var img = job.image, done = false, timeout;
            function cleanup() {
                clearTimeout(timeout);
                img.removeEventListener("load", loaded, false);
                img.removeEventListener("error", failed, false);
            }
            function finish(error) {
                if (done) return;
                done = true;
                cleanup();
                delete pending[job.url];
                if (error) {
                    stats.imageErrors++;
                    if (loader.cache[job.url] === img) delete loader.cache[job.url];
                } else {
                    stats.imageLoads++;
                    loader.cache[job.url] = img;
                }
                // Keep this slot occupied while callbacks upload the texture.
                // Nested addImage() calls join this same global queue.
                try {
                    for (var i = 0; i < job.callbacks.length; i++) {
                        try { job.callbacks[i](error || null, error ? null : img); }
                        catch (e) { setTimeout((function (err) { return function () { throw err; }; })(e), 0); }
                    }
                } finally {
                    job.callbacks.length = 0;
                    active--;
                    stats.activeImages = active;
                    schedule();
                }
            }
            function loaded() { finish(null); }
            function failed() {
                if (img.crossOrigin && !job.retried) {
                    job.retried = true;
                    img.removeAttribute("crossorigin");
                    img.src = job.url;
                } else finish("Image load failed: " + job.url);
            }
            img.addEventListener("load", loaded, false);
            img.addEventListener("error", failed, false);
            timeout = setTimeout(function () {
                finish("Image load timeout: " + job.url);
                // Cancel the timed-out request without navigating to the page URL.
                img.removeAttribute("src");
            }, 20000);
            if (job.crossOrigin && root.location.protocol !== "file:") img.crossOrigin = "Anonymous";
            img.src = job.url;
        }
        loader.loadImg = function (url, option, callback) {
            url = flat(url);
            var crossOrigin = true;
            if (typeof option === "function") callback = option;
            else if (option && option.isCrossOrigin !== undefined && option.isCrossOrigin !== null)
                crossOrigin = !!option.isCrossOrigin;
            // Cocos stores the returned Image before it has decoded. Do not
            // mistake that placeholder for a completed cache hit.
            var job = pending[url];
            if (job) {
                if (typeof callback === "function") job.callbacks.push(callback);
                return job.image;
            }
            var cached = loader.getRes(url);
            if (cached && (cached.naturalWidth || cached.width) && cached.complete !== false) {
                if (typeof callback === "function") callback(null, cached);
                return cached;
            }
            job = { url: url, image: new Image(), callbacks: [], crossOrigin: crossOrigin, retried: false };
            if (typeof callback === "function") job.callbacks.push(callback);
            pending[url] = job;
            queue.push(job);
            schedule();
            return job.image;
        };
        api.imageQueue = function () { return { active: active, queued: queue.length }; };
    }


    function installLazySpriteCompatibility() {
        // The recovered CCB v6 reader used loader.getRes() as a file-existence
        // test. With lazy images, an existing but unloaded file is not a miss.
        // Dimensions in this tiny generated manifest keep CCB layouts valid
        // before the asynchronous image decode has completed.
        var reader = cc.BuilderReader && cc.BuilderReader.prototype;
        if (reader && reader._loadTextureSpriteFrameV6) {
            var originalTextureFrame = reader._loadTextureSpriteFrameV6;
            reader._loadTextureSpriteFrameV6 = function (spriteFile) {
                var path = flat("res/" + spriteFile);
                var sizes = root.__supercatImageSizes || {};
                if (!sizes[path]) path = "res/" + base(spriteFile);
                var size = sizes[path];
                if (!size) return originalTextureFrame.call(this, spriteFile);
                var texture = cc.textureCache.addImage(path);
                return new cc.SpriteFrame(texture, cc.rect(0, 0, size[0], size[1]));
            };
            var originalExact = reader._getSpriteFrameExactV6;
            reader._getSpriteFrameExactV6 = function (name) {
                var frame = originalExact.call(this, name);
                if (!frame) {
                    api.ensureFrame(name, true);
                    frame = originalExact.call(this, name);
                }
                return frame;
            };
        }
        var sprite = cc.Sprite && cc.Sprite.prototype;
        if (sprite && sprite.setSpriteFrame && sprite.getSpriteFrame) {
            var originalSet = sprite.setSpriteFrame;
            var originalGet = sprite.getSpriteFrame;
            sprite.setSpriteFrame = function (frame) {
                var resolved = typeof frame === "string" ? cc.spriteFrameCache.getSpriteFrame(frame) : frame;
                this.__supercatPendingFrame = resolved || null;
                return originalSet.call(this, resolved || frame);
            };
            sprite.getSpriteFrame = function () {
                var pending = this.__supercatPendingFrame;
                if (pending && !this._textureLoaded) return pending;
                return originalGet.apply(this, arguments);
            };
        }
    }

    function installAudio() {
        var engine = cc.audioEngine;
        if (!engine || !cc.Audio) return;
        // Cocos 3.x leaves _pause set after stop(). A stopped, formerly paused
        // effect must not occupy a voice/cache slot forever or resume later.
        var originalStop = cc.Audio.prototype.stop;
        cc.Audio.prototype.stop = function () {
            var result = originalStop.apply(this, arguments);
            this._pause = false;
            return result;
        };
        var seen = Object.create(null), clock = 0;
        var budget = 12 * 1024 * 1024, maxFiles = 24, maxVoices = 6;
        var originalEffect = engine.playEffect;
        function normalize(url) {
            return flat(String(url).replace(/(^|\/)res\/sound\//, "$1res/"));
        }
        function releaseMusic(audio) {
            if (!audio) return;
            audio.stop();
            if (audio._element) {
                audio._element.removeAttribute("src");
                audio._element.load();
                audio._element = null;
            }
            // Remove a stopped stream from the engine's visibility-pause list.
            var list = engine._pauseCache || [];
            for (var i = list.length - 1; i >= 0; i--) if (list[i] === audio) list.splice(i, 1);
        }
        function attemptPlay(audio) {
            if (engine._currMusic !== audio || !audio._element) return;
            try {
                var promise = audio._element.play();
                if (promise && typeof promise.catch === "function") promise.catch(function (err) {
                    // A user gesture may be required; retry only the current,
                    // still-requested track, never a stopped or paused one.
                    if (err && err.name !== "NotAllowedError" && err.name !== "AbortError")
                        trace("music playback: " + err.message);
                });
            } catch (err) { trace("music playback: " + err.message); }
        }
        engine.playMusic = function (url, loop) {
            if (typeof url !== "string" || !url) return;
            url = normalize(url);
            releaseMusic(this._currMusic);
            var element = document.createElement("audio");
            element.preload = "none";
            element.src = url;
            var audio = new cc.Audio(null, null, url);
            audio.setElement(element);
            audio._playOfAudio = function () {
                element.loop = this.loop;
                attemptPlay(this);
            };
            audio._resumeOfAudio = function () { attemptPlay(this); };
            this._currMusic = audio;
            audio.setVolume(this._musicVolume);
            audio.play(0, !!loop);
        };
        engine.stopMusic = function () {
            releaseMusic(this._currMusic);
            this._currMusic = null;
        };
        function unlock() {
            var audio = engine._currMusic;
            if (audio && audio._playing && !audio._pause && audio._element && audio._element.paused)
                attemptPlay(audio);
        }
        document.addEventListener("keydown", unlock, true);
        document.addEventListener("mousedown", unlock, true);
        document.addEventListener("touchstart", unlock, true);

        function busy(audio) {
            return !!(audio && (audio._pause || (audio.getPlaying && audio.getPlaying())));
        }
        function trimEffects() {
            var entries = [], total = 0;
            for (var url in seen) {
                if (!own(seen, url)) continue;
                var sample = cc.loader.getRes(url), bytes = 0;
                if (sample && sample._buffer) bytes = sample._buffer.length * sample._buffer.numberOfChannels * 4;
                total += bytes;
                entries.push({ url: url, time: seen[url], bytes: bytes });
            }
            entries.sort(function (a, b) { return a.time - b.time; });
            var count = entries.length;
            for (var i = 0; i < entries.length && (total > budget || count > maxFiles); i++) {
                var entry = entries[i], pool = engine._audioPool[entry.url] || [], inUse = false;
                var sample = cc.loader.getRes(entry.url);
                // Do not unload an in-flight decode or paused/playing effect.
                if (!sample || (!sample._buffer && !sample._supercatDecodeFailed)) continue;
                for (var j = 0; j < pool.length; j++) if (busy(pool[j])) inUse = true;
                if (inUse) continue;
                for (j = 0; j < pool.length; j++) {
                    pool[j].stop();
                    if (pool[j]._volume && pool[j]._volume.disconnect) pool[j]._volume.disconnect();
                    pool[j]._buffer = null;
                    pool[j]._setBufferCallback = null;
                }
                if (sample._volume && sample._volume.disconnect) sample._volume.disconnect();
                engine.unloadEffect(entry.url);
                delete seen[entry.url];
                total -= entry.bytes;
                count--;
            }
        }
        engine.playEffect = function (url, loop) {
            if (typeof url !== "string" || !url) return null;
            url = normalize(url);
            var voices = 0, pool = this._audioPool;
            for (var key in pool) {
                if (!own(pool, key)) continue;
                for (var i = 0; i < pool[key].length; i++) if (busy(pool[key][i])) voices++;
            }
            if (voices >= maxVoices) { stats.droppedEffects++; return null; }
            seen[url] = ++clock;
            trimEffects();
            return originalEffect.call(this, url, loop);
        };
        api.trimEffects = trimEffects;
        // A soft decoded-effect-cache budget; active effects are never evicted.
        setInterval(trimEffects, 5000);
    }

    api.snapshot = function () {
        var result = {}, key, cache = cc.loader.cache;
        for (key in stats) if (own(stats, key)) result[key] = stats[key];
        result.textureCount = 0;
        result.textureRGBABytes = 0;
        result.decodedAudioBytes = 0;
        for (key in cc.textureCache._textures) {
            if (!own(cc.textureCache._textures, key)) continue;
            var texture = cc.textureCache._textures[key];
            result.textureCount++;
            var size = texture.getContentSizeInPixels ? texture.getContentSizeInPixels() : null;
            result.textureRGBABytes += (texture._pixelsWide || (size && size.width) || 0) *
                (texture._pixelsHigh || (size && size.height) || 0) * 4;
        }
        for (key in cache) if (own(cache, key) && cache[key] && cache[key]._buffer)
            result.decodedAudioBytes += cache[key]._buffer.length * cache[key]._buffer.numberOfChannels * 4;
        result.imageQueue = api.imageQueue ? api.imageQueue() : null;
        // These are asset estimates, not total process RSS or the TV's GPU usage.
        return result;
    };
    api.install = function () {
        if (installed || !root.__supercatLowMemory) return;
        installed = true;
        installImageQueue();
        installLazySpriteCompatibility();
        installAudio();
        if (cc.view && cc.view.enableRetina) cc.view.enableRetina(false);
        trace("webOS low-memory runtime installed");
    };
})(window);
