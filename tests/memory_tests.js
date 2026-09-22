/* Regression tests for the ES5 webOS memory runtime; run with Node.js. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const app = process.argv[2] || path.resolve(__dirname, '../app');
const source = fs.readFileSync(path.join(app, 'assets/webos-memory.js'), 'utf8');
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('PASS ' + name); }
function environment() {
    let now = 0, serial = 0, tasks = [], loads = [], elements = [], eventHandlers = {};
    function later(fn, delay) { const id = ++serial; tasks.push({id, at: now + delay, fn}); return id; }
    function cancel(id) { tasks = tasks.filter(t => t.id !== id); }
    function advance(delta) {
        const end = now + delta; let max = 10000;
        while (true) {
            tasks.sort((a, b) => a.at - b.at || a.id - b.id);
            if (!tasks.length || tasks[0].at > end) break;
            assert.ok(--max > 0, 'timer loop did not settle');
            const t = tasks.shift(); now = t.at; t.fn();
        }
        now = end;
    }
    function Image() { this.handlers = {}; this.complete = false; this.width = this.naturalWidth = 0; this.crossOrigin = ''; }
    Image.prototype.addEventListener = function(k, f) { (this.handlers[k] || (this.handlers[k] = [])).push(f); };
    Image.prototype.removeEventListener = function(k, f) { this.handlers[k] = (this.handlers[k] || []).filter(x => x !== f); };
    Image.prototype.emit = function(k) { (this.handlers[k] || []).slice().forEach(f => f()); };
    Image.prototype.removeAttribute = function(k) { if (k === 'crossorigin') this.crossOrigin = ''; else if (k === 'src') this._src = ''; };
    Object.defineProperty(Image.prototype, 'src', {get() { return this._src; }, set(url) {
        this._src = url; loads.push(url);
        if (url.indexOf('timeout') !== -1) return;
        later(() => {
            if (url.indexOf('bad') !== -1) this.emit('error');
            else { this.complete = true; this.width = this.naturalWidth = 32; this.height = this.naturalHeight = 16; this.emit('load'); }
        }, 5);
    }});
    function Audio(context, gain, url) { this.src = url; this._playing = false; this._pause = false; this._buffer = null; }
    Audio.prototype.setElement = function(e) { this._element = e; this._AUDIO_TYPE = 'AUDIO'; };
    Audio.prototype.setVolume = function(v) { this.volume = v; if (this._element) this._element.volume = v; };
    Audio.prototype.play = function(offset, loop) { this._playing = true; this.loop = !!loop; if (this._playOfAudio) this._playOfAudio(); };
    Audio.prototype.stop = function() { this._playing = false; if (this._element) this._element.pause(); };
    Audio.prototype.getPlaying = function() { return this._playing; };
    Audio.prototype.pause = function() { this._playing = false; this._pause = true; if (this._element) this._element.pause(); };
    Audio.prototype.resume = function() { if (!this._pause) return; if (this._resumeOfAudio) this._resumeOfAudio(); this._pause = false; this._playing = true; };
    const cache = {}, engine = {
        _audioPool: {}, _pauseCache: [], _musicVolume: 0.4,
        playEffect(url, loop) {
            if (!cache[url]) cache[url] = {_buffer: {length: 262144, numberOfChannels: 2}, _volume: {disconnect() {}}};
            const a = new Audio(null, null, url); a._buffer = cache[url]._buffer;
            a._volume = {disconnect() {}}; a.play(0, loop);
            (this._audioPool[url] || (this._audioPool[url] = [])).push(a); return a;
        },
        unloadEffect(url) { delete cache[url]; delete this._audioPool[url]; },
        pauseMusic() { if (this._currMusic) this._currMusic.pause(); },
        resumeMusic() { if (this._currMusic) this._currMusic.resume(); }
    };
    let atlasCalls = 0, textureCalls = 0;
    const cc = {
        loader: {cache, getRes(url) { return cache[url]; }},
        textureCache: {_textures: {}, addImage() { textureCalls++; }},
        spriteFrameCache: {_spriteFrames: {}, _addSpriteFramesByObject(file, dict) { atlasCalls++; cc.textureCache.addImage(file); Object.keys(dict.frames).forEach(k => {this._spriteFrames[k] = {file};}); }},
        audioEngine: engine, Audio, view: {enableRetina(v) { this.retina = v; }}
    };
    const ctx = {
        cc, Image, console, location: {protocol: 'file:'},
        __supercatLowMemory: true, __supercatImageLoadConcurrency: 1,
        setTimeout: later, clearTimeout: cancel, setInterval() { return 1; },
        document: {
            addEventListener(k, f) { eventHandlers[k] = f; },
            createElement(kind) {
                assert.equal(kind, 'audio');
                const e = {paused: true, playCount: 0, loadCount: 0,
                    play() { this.paused = false; this.playCount++; return {catch() {}}; },
                    pause() { this.paused = true; },
                    load() { this.loadCount++; },
                    removeAttribute(k) { if (k === 'src') this.src = ''; }};
                elements.push(e); return e;
            }
        }
    };
    ctx.window = ctx; vm.createContext(ctx); vm.runInContext(source, ctx);
    const api = ctx.__supercatMemory; api.install();
    return {cc, ctx, api, cache, engine, advance, loads, elements, eventHandlers,
        atlasCalls: () => atlasCalls, textureCalls: () => textureCalls};
}
test('images are globally serialized and duplicate URLs share a single decode', () => {
    const e = environment(); let calls = 0;
    const cb = (err, img) => { assert.equal(err, null); assert.equal(img.width, 32); calls++; };
    const a = e.cc.loader.loadImg('a.png', cb);
    const b = e.cc.loader.loadImg('a.png', cb);
    e.cc.loader.loadImg('b.png', cb);
    assert.equal(a, b); assert.equal(e.loads.length, 0);
    e.advance(100); assert.equal(calls, 3); assert.deepEqual(e.loads, ['a.png', 'b.png']);
    assert.equal(e.api.snapshot().peakActiveImages, 1);
});
test('pending Image in loader.cache is not mistaken for a decoded cache hit', () => {
    const e = environment(); let calls = 0;
    e.cache['a.png'] = e.cc.loader.loadImg('a.png', () => calls++);
    e.cc.loader.loadImg('a.png', () => calls++); assert.equal(calls, 0);
    e.advance(100); assert.equal(calls, 2); assert.equal(e.loads.length, 1);
});
test('completed image cache hits do not reload the file', () => {
    const e = environment(); e.cc.loader.loadImg('a.png'); e.advance(100);
    let hit; e.cc.loader.loadImg('a.png', (err, img) => { assert.equal(err, null); hit = img; });
    assert.equal(hit, e.cache['a.png']); assert.equal(e.loads.length, 1);
});
test('image error cleans the cache and does not block later jobs', () => {
    const e = environment(); let bad = 0, good = 0;
    e.cache['bad.png'] = e.cc.loader.loadImg('bad.png', err => { assert.ok(err); bad++; });
    e.cc.loader.loadImg('good.png', err => { assert.equal(err, null); good++; });
    e.advance(100); assert.equal(bad, 1); assert.equal(good, 1); assert.equal(e.cache['bad.png'], undefined);
    assert.equal(e.api.imageQueue().active, 0);
});
test('CORS fallback retries once, then reports failure exactly once', () => {
    const e = environment(); e.ctx.location.protocol = 'https:'; let bad = 0;
    e.cc.loader.loadImg('bad.png', err => { assert.ok(err); bad++; });
    e.advance(100); assert.equal(bad, 1); assert.equal(e.loads.length, 2);
});
test('image timeout releases its slot and cancels the request', () => {
    const e = environment(); let failures = 0, good = 0;
    const img = e.cc.loader.loadImg('timeout.png', err => { assert.match(err, /timeout/); failures++; });
    e.cc.loader.loadImg('good.png', err => { assert.equal(err, null); good++; });
    e.advance(20100); assert.equal(failures, 1); assert.equal(good, 1); assert.equal(img.src, '');
});
test('atlas indexing does not allocate textures; requested atlas can be restored after purge', () => {
    const e = environment(); e.cache['res/spriteFrameFileList.plist'] = {spriteFrameFiles:['one.plist', 'two.plist']};
    e.cache['res/one.plist'] = {frames: {'one/a.png': {aliases:['a_alias.png']}}};
    e.cache['res/two.plist'] = {frames: {'two/b.png': {}}};
    e.api.indexAtlases(); assert.equal(e.atlasCalls(), 0); assert.equal(e.textureCalls(), 0);
    e.api.ensureFrame('one/a.png'); assert.equal(e.atlasCalls(), 1); assert.ok(e.cc.spriteFrameCache._spriteFrames['one/a.png']);
    e.cc.spriteFrameCache._spriteFrames = {}; e.api.indexAtlases(); assert.equal(e.atlasCalls(), 1);
    e.api.ensureFrame('a_alias.png'); assert.equal(e.atlasCalls(), 2);
    e.api.ensureFrame('not_present.png'); assert.equal(e.atlasCalls(), 2);
});
test('music uses one media element, supports pause/resume, and releases old sources', () => {
    const e = environment(); e.engine.playMusic('res/sound/bgm_1.mp3', true);
    const first = e.engine._currMusic, element = first._element;
    assert.equal(first.src, 'res/bgm_1.mp3'); assert.equal(first._buffer, null);
    assert.equal(element.preload, 'none'); assert.equal(element.loop, true); assert.equal(element.volume, 0.4);
    e.engine.pauseMusic(); assert.equal(element.paused, true); const plays = element.playCount;
    e.eventHandlers.keydown(); assert.equal(element.playCount, plays, 'gesture must not resume paused music');
    e.engine.resumeMusic(); assert.equal(element.paused, false);
    e.engine._pauseCache.push(first); e.engine.playMusic('res/bgm_2.mp3', false);
    assert.equal(first._element, null); assert.equal(element.src, ''); assert.equal(element.loadCount, 1);
    assert.equal(e.engine._pauseCache.length, 0); assert.equal(Object.keys(e.cache).length, 0);
    e.engine.stopMusic(); assert.equal(e.engine._currMusic, null); assert.equal(e.elements[1].src, '');
});
test('effect voice cap counts both playing and paused voices', () => {
    const e = environment(), voices = [];
    for (let i = 0; i < 6; i++) voices.push(e.engine.playEffect('res/s' + i + '.mp3'));
    assert.ok(voices.every(Boolean)); voices[0].pause();
    assert.equal(e.engine.playEffect('res/overflow.mp3'), null);
    voices[1].stop(); assert.ok(e.engine.playEffect('res/next.mp3'));
    assert.equal(e.api.snapshot().droppedEffects, 1);
});
test('decoded effect cache is trimmed without evicting active/paused voices', () => {
    const e = environment(); const active = e.engine.playEffect('res/active.mp3'); active.pause();
    for (let i = 0; i < 28; i++) { const v = e.engine.playEffect('res/s' + i + '.mp3'); assert.ok(v); v.stop(); }
    e.api.trimEffects(); assert.ok(e.cache['res/active.mp3']);
    assert.ok(e.api.snapshot().decodedAudioBytes <= 12 * 1024 * 1024);
    assert.ok(Object.keys(e.engine._audioPool).length <= 24);
});
test('install is idempotent and retina scaling is disabled', () => {
    const e = environment(), loader = e.cc.loader.loadImg; e.api.install();
    assert.equal(e.cc.loader.loadImg, loader); assert.equal(e.cc.view.retina, false);
});
test('stopping a paused effect releases its voice and clears the paused flag', () => {
    const e = environment(), a = e.engine.playEffect('res/a.mp3');
    a.pause(); assert.equal(a._pause, true); a.stop(); assert.equal(a._pause, false);
    a.resume(); assert.equal(a.getPlaying(), false);
});
console.log(JSON.stringify({passed, failed: 0}));
