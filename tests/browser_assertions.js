async () => {
    var checks = [];
    function check(name, condition) { checks.push({name: name, passed: !!condition}); if (!condition) throw new Error('FAILED: ' + name); }
    function delay(ms) { return new Promise(function(resolve) { setTimeout(resolve, ms); }); }
    function imageTexture() { var t = new cc.Texture2D(), canvas = document.createElement('canvas'); canvas.width = canvas.height = 64; t.initWithElement(canvas); return t; }
    cc.director.pause();
    check('game startup completed', !!cc.gameInited && !!game.Data.oLyGame);
    check('global image concurrency stays at one', __supercatMemory.snapshot().peakActiveImages === 1);
    check('background atlas preload is disabled', !window.__supercatBgPreloadStarted);
    check('no startup music decoded into AudioBuffers', !Object.keys(cc.loader.cache).some(function(k) { return /bgm_/.test(k) && cc.loader.cache[k]._buffer; }));

    var texture = imageTexture(), frame = new cc.SpriteFrame(texture, cc.rect(0, 0, 64, 64));
    var pending = new cc.Sprite(); pending.setSpriteFrame(frame);
    check('pending frame preserves texture reference', pending.getSpriteFrame().getTexture() === texture);
    var scale9 = new ccui.Scale9Sprite(frame); scale9.setPreferredSize(cc.size(200, 90));
    texture.handleLoadedTexture();
    check('lazy Scale9Sprite survives initial decode', !!scale9._scale9Image && !!scale9._textureLoaded);
    check('lazy Scale9Sprite preserves preferred size', scale9.getContentSize().width === 200 && scale9.getContentSize().height === 90);
    check('lazy sprite gets its final texture', pending.getTexture() === texture);

    var oldTexture = imageTexture(), oldFrame = new cc.SpriteFrame(oldTexture, cc.rect(0, 0, 64, 64));
    pending.setSpriteFrame(oldFrame); pending.setSpriteFrame(frame); oldTexture.handleLoadedTexture();
    check('late old texture cannot overwrite current frame', pending.getTexture() === texture);

    var engine = cc.audioEngine;
    engine.playMusic('res/bgm_menu.mp3', true); await delay(250);
    var old = engine._currMusic, element = old._element;
    check('music uses HTML audio rather than a decoded buffer', old._AUDIO_TYPE === 'AUDIO' && !old._buffer && !!element);
    engine.setMusicVolume(0.35); check('music volume retained', Math.abs(element.volume - 0.35) < 0.001);
    engine.pauseMusic(); check('music pauses', element.paused && old._pause);
    engine.resumeMusic(); await delay(80); check('music resumes', old._playing && !old._pause);
    engine.playMusic('res/bgm_1.mp3', true); await delay(200);
    check('switching music releases old media source', old._element === null && !element.getAttribute('src'));
    var current = engine._currMusic;
    engine.stopMusic(); check('stopping music releases current source', engine._currMusic === null && current._element === null);

    var before = __supercatMemory.snapshot().imageLoads;
    cc.director.purgeCachedData();
    await delay(50);
    check('cache purge does not reload all atlases', __supercatMemory.snapshot().imageLoads === before);
    var data = window.__supercatSpriteFramePlists, key = Object.keys(data).filter(function(k) { return data[k].frames; })[0];
    var frameName = Object.keys(data[key].frames)[0];
    var restored = cc.spriteFrameCache.getSpriteFrame(frameName);
    check('frame lookup restores requested atlas after purge', !!restored && !!restored.getTexture());
    await delay(150);

    var oldLoader = cc.loader.load, entered = false, label = '';
    cc.loader.load = function(res, progress, complete) { complete('intentional test failure'); };
    try {
        cc.LoaderScene.prototype._startLoading.call({resources:['missing.test'], unschedule:function(){},
            _label:{setString:function(s){label=s;}}, cb:function(){entered=true;}});
    } finally { cc.loader.load = oldLoader; }
    check('failed startup resource does not enter game', !entered && /failed/.test(label));
    return checks;
}
