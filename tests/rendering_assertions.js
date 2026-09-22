/* Execute this async function in a running game via Playwright/Web Inspector.
 * Each pending texture is completed explicitly: no timing-dependent mocks.
 */
async () => {
    var results = [];
    function assert(condition, message) { if (!condition) throw new Error(message); }
    async function test(name, fn) {
        try { await fn(); results.push({name: name, passed: true}); }
        catch (e) { results.push({name: name, passed: false, error: String(e.stack || e)}); }
    }
    var pendingId = 0;
    function pending(w, h) {
        var texture = new cc.Texture2D();
        texture.url = "__rendering_test_" + (++pendingId);
        return {texture: texture, load: function () {
            var canvas = document.createElement('canvas');
            canvas.width = w || 64; canvas.height = h || 64;
            var context = canvas.getContext('2d');
            context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height);
            // Follow the real loader/cache completion path in both backends.
            cc.loader.cache[texture.url] = canvas;
            texture.handleLoadedTexture();
            delete cc.loader.cache[texture.url];
        }};
    }
    function frame(p, x, y, w, h) { return new cc.SpriteFrame(p.texture, cc.rect(x || 0, y || 0, w || 32, h || 32)); }
    function sizeIs(node, w, h) { var s=node.getContentSize(); return s.width===w && s.height===h; }
    function finiteQuad(q) {
        return ['bl','br','tl','tr'].every(function(k){return isFinite(q[k].vertices.x)&&isFinite(q[k].vertices.y)&&isFinite(q[k].texCoords.u)&&isFinite(q[k].texCoords.v);});
    }
    var glMode = cc._renderType === cc.game.RENDER_TYPE_WEBGL;
    var wasPaused = cc.director.isPaused();
    cc.director.pause();
    await test('game has initialized', function(){assert(cc.gameInited && game.Data.oLyGame, 'game not ready');});
    await test('decoded texture cache hit is synchronous after purge', function(){
        var url='res/forest_intro.png', saved=cc.textureCache._textures[url];
        delete cc.textureCache._textures[url];
        var callbackRan=false, t=cc.textureCache.addImage(url,function(){callbackRan=true;});
        assert(t.isLoaded() && t.width>0 && callbackRan, 'cached image returned a pending texture');
    });
    await test('pending frame retains texture identity and layout', function(){
        var p=pending(), f=new cc.SpriteFrame(p.texture,cc.rect(8,10,20,12),false,cc.p(3,-2),cc.size(40,30));
        var s=new cc.Sprite(f);
        assert(s.getTexture()===p.texture,'lost texture reference');
        assert(sizeIs(s,40,30),'lost original size before decode');
        assert(s.getOffsetPosition().x===13 && s.getOffsetPosition().y===7,'lost trim offset');
        p.load();
        assert(s._textureLoaded && sizeIs(s,40,30),'incorrect final geometry');
    });
    await test('pending sprites are accepted by SpriteBatchNode', function(){
        var p=pending(), s=new cc.Sprite(frame(p)), batch=new cc.SpriteBatchNode(p.texture,4);
        batch.addChild(s);
        assert(batch.getChildren().indexOf(s)>=0,'batch rejected unloaded sprite');
        p.load(); s.updateTransform();
        assert(s.getTexture()===p.texture && s._textureLoaded,'batch sprite did not finish loading');
        if(glMode) assert(batch.textureAtlas.totalQuads===1 && finiteQuad(batch.textureAtlas.quads[0]),'bad batch quad');
    });
    await test('late constructor frame cannot resize a newer frame', function(){
        var a=pending(),b=pending();b.load();
        var s=new cc.Sprite(frame(a,0,0,20,10));
        s.setSpriteFrame(frame(b,2,3,11,13));a.load();
        assert(s.getTexture()===b.texture && s._rect.x===2 && sizeIs(s,11,13),'late initial frame overwrote current geometry');
    });
    await test('late frame cannot overwrite explicit setTexture', function(){
        var a=pending(),b=pending();b.load();var s=new cc.Sprite(frame(a));
        s.setTexture(b.texture);a.load();
        assert(s.getTexture()===b.texture,'late frame overwrote explicit texture');
    });
    await test('late setTexture cannot overwrite a newer frame', function(){
        var a=pending(),b=pending();b.load();var s=new cc.Sprite();s.setTexture(a.texture);
        s.setSpriteFrame(frame(b,3,4,10,12));a.load();
        assert(s.getTexture()===b.texture && s._rect.x===3 && sizeIs(s,10,12),'late texture overwrote frame');
    });
    await test('pending setTexture can be cleared without resurrection', function(){
        var a=pending(),s=new cc.Sprite();s.setTexture(a.texture);s.setTexture(null);a.load();
        assert(s.getTexture()===null,'cleared texture came back');
    });
    await test('replaced pending frames release their listeners', function(){
        var a=pending(),b=pending(),fa=frame(a),fb=frame(b),s=new cc.Sprite(fa);
        for(var i=0;i<20;i++)s.setSpriteFrame(i%2?fb:fa);
        var count=(fa._listeners&&fa._listeners.load||[]).concat(fb._listeners&&fb._listeners.load||[]).filter(function(x){return x.eventTarget===s;}).length;
        assert(count===1,'stale frame listeners accumulated: '+count);a.load();b.load();
    });
    await test('deferred tinted sprite preserves color, opacity and visibility', function(){
        var a=pending(),s=new cc.Sprite(frame(a));s.setColor(cc.color(80,120,160));s.setOpacity(110);s.setVisible(false);a.load();
        assert(!s.isVisible() && s.getOpacity()===110 && s.getColor().r===80,'load changed sprite state');
    });
    await test('hidden Scale9Sprite remains hidden after decode', function(){
        var p=pending(),s=new ccui.Scale9Sprite(frame(p));s.setVisible(false);p.load();
        assert(!s.isVisible(),'load made hidden Scale9Sprite visible');
    });
    await test('visible Scale9Sprite remains visible after decode', function(){
        var p=pending(),s=new ccui.Scale9Sprite(frame(p));s.setVisible(true);p.load();
        assert(s.isVisible() && s._textureLoaded && s._renderers.length>0,'visible Scale9Sprite missing');
    });
    await test('deferred Scale9Sprite preserves preferred size', function(){
        var p=pending(),s=new ccui.Scale9Sprite(frame(p));s.setPreferredSize(cc.size(210,90));p.load();
        assert(sizeIs(s,210,90),'preferred size lost');
    });
    await test('deferred Scale9Sprite rebuilds the render command list', function(){
        var p=pending(),s=new ccui.Scale9Sprite(frame(p));cc.renderer.childrenOrderDirty=false;p.load();
        assert(cc.renderer.childrenOrderDirty,'new sliced renderers were not scheduled');
    });
    await test('Scale9Sprite frame replacement uses new texture', function(){
        var a=pending(),b=pending();a.load();b.load();
        var s=new ccui.Scale9Sprite(frame(a));s.setSpriteFrame(frame(b,8,4,16,18));
        assert(s._scale9Image.getTexture()===b.texture && s._spriteRect.x===8,'old Scale9 texture retained');
    });
    await test('late Scale9 frame cannot replace current frame', function(){
        var a=pending(),b=pending();b.load();var s=new ccui.Scale9Sprite(frame(a,0,0,20,10));
        s.setSpriteFrame(frame(b,4,6,14,18));s.setPreferredSize(cc.size(190,80));s.setVisible(false);a.load();
        assert(s._scale9Image.getTexture()===b.texture && s._spriteRect.x===4 && sizeIs(s,190,80) && !s.isVisible(),'late Scale9 frame changed current state');
    });
    await test('deferred Scale9 file load fires once and preserves its crop', function(){
        var p=pending(), key=p.texture.url, count=0;
        cc.textureCache._textures[key]=p.texture;
        try {
            var s=new ccui.Scale9Sprite(key,cc.rect(8,6,20,18),cc.rect(4,4,8,8));
            s.addEventListener('load',function(){count++;},s);
            s.setContentSize(180,75);s.setVisible(false);p.load();
            assert(count===1 && s._spriteRect.x===8 && s._spriteRect.width===20,'repeated load or wrong crop');
            assert(sizeIs(s,180,75) && !s.isVisible(),'file load changed layout/visibility');
        } finally {delete cc.textureCache._textures[key];}
    });
    await test('trimmed Scale9 frames preserve offsets and original size', function(){
        var p=pending(), f=new cc.SpriteFrame(p.texture,cc.rect(8,10,20,12),false,cc.p(3,-2),cc.size(40,30));
        var s=new ccui.Scale9Sprite(f);s.setPreferredSize(cc.size(200,80));p.load();
        assert(s._offset.x===3 && s._offset.y===-2 && s._originalSize.width===40 && sizeIs(s,200,80),'trim metadata lost');
    });
    await test('deferred rotated Scale9 frames use the decoded texture', function(){
        var p=pending(),f=new cc.SpriteFrame(p.texture,cc.rect(8,8,20,12),true,cc.p(0,0),cc.size(20,12)),s=new ccui.Scale9Sprite(f);
        p.load();assert(s._textureLoaded && s._scale9Image.getTexture()===f.getTexture(),'rotated frame texture mismatch');
        assert(s._spriteFrameRotated===glMode,'Canvas frame rotated twice or WebGL rotation lost');
        s._renderers.forEach(function(n){assert(n.getTexture()===f.getTexture(),'slice references old atlas');});
    });
    await test('already-decoded rotated frames work outside SpriteFrameCache', function(){
        var p=pending();p.load();
        var f=new cc.SpriteFrame(p.texture,cc.rect(8,8,20,12),true,cc.p(0,0),cc.size(20,12));
        var s=new cc.Sprite(f);
        if(glMode)assert(f.isRotated() && s.getTexture()===p.texture,'WebGL packed rotation lost');
        else assert(!f.isRotated() && f.getTexture()!==p.texture && f.getRect().x===0 && f.getTexture().width===20 && f.getTexture().height===12,'Canvas drew packed frame sideways');
    });
    await test('replaced Scale9 sources release their load listeners', function(){
        var p=pending(),q=pending(),s=new ccui.Scale9Sprite(frame(p)),old=s._scale9Image;
        s.setSpriteFrame(frame(q));
        assert(!(old._listeners.load||[]).some(function(l){return l.eventTarget===s;}),'stale Scale9 listener retained');
        q.load();p.load();assert(s._scale9Image.getTexture()===q.texture,'stale source restored');
    });
    await test('loading inactive button state does not duplicate the background', function(){
        var a=pending(),b=pending();a.load();
        var normal=new ccui.Scale9Sprite(frame(a)),pressed=new ccui.Scale9Sprite(frame(b));
        var button=new cc.ControlButton(new cc.LabelTTF('', 'Arial',12),normal);
        button.setBackgroundSpriteForState(pressed,cc.CONTROL_STATE_HIGHLIGHTED);b.load();
        assert(normal.isVisible()&&!pressed.isVisible(),'both normal and highlighted backgrounds visible');
        button.setHighlighted(true);
        assert(!normal.isVisible()&&pressed.isVisible(),'highlight state switch is broken');
        button.setHighlighted(false);
        assert(normal.isVisible()&&!pressed.isVisible(),'normal state switch is broken');
    });
    await test('no inactive game-button background is drawn', function(){
        ['btnJump','btnSmash'].forEach(function(k){var b=game.Data.oLyGame[k];if(!b)return;
            var backgrounds=b.getChildren().filter(function(n){return n instanceof ccui.Scale9Sprite&&n.isVisible();});
            assert(backgrounds.length<=1,k+' draws '+backgrounds.length+' backgrounds');
        });
    });
    if(glMode) await test('all current TMX quads have finite texture coordinates', function(){
        game.Logic._tmxMap.getChildren().forEach(function(n){if(!(n instanceof cc.TMXLayer))return;var a=n.textureAtlas;
            if(a.totalQuads)assert(n.getTexture().isLoaded() && a.quads[0].tr.texCoords.u!==a.quads[0].bl.texCoords.u,'zero-width texture coordinates');
            for(var i=0;i<a.totalQuads;i++)assert(finiteQuad(a.quads[i]),'invalid UV in '+n.layerName+' tile '+i);
        });
    });
    if(glMode) await test('player batch contains visible sprite quads', function(){
        var batches=[];function walk(n){if(n instanceof cc.SpriteBatchNode)batches.push(n);n.getChildren().forEach(walk);}
        walk(game.Data.oPlayerCtl.rootNode);
        assert(batches.some(function(n){return n.textureAtlas.totalQuads>0;}),'player sprite rejected during CCB load');
    });
    if(glMode) await test('pending sprite UVs are finite before decode', function(){
        var p=pending(),s=new cc.Sprite(frame(p,8,8,20,20));
        assert(finiteQuad(s.quad),'nonfinite pending UV');p.load();
    });
    cc.renderer.childrenOrderDirty=true;
    if(!wasPaused)cc.director.resume();
    return {renderer:glMode?'WebGL':'Canvas',passed:results.filter(function(r){return r.passed;}).length,failed:results.filter(function(r){return !r.passed;}).length,checks:results};
}
