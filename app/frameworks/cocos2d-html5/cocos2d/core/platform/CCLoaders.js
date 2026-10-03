/****************************************************************************
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

cc._txtLoader = {
    load : function(realUrl, url, res, cb){
        cc.loader.loadTxt(realUrl, cb);
    }
};
cc.loader.register(["txt", "xml", "vsh", "fsh", "atlas"], cc._txtLoader);

cc._jsonLoader = {
    load : function(realUrl, url, res, cb){
        cc.loader.loadJson(realUrl, cb);
    }
};
cc.loader.register(["json", "ExportJson"], cc._jsonLoader);

cc._jsLoader = {
    load : function(realUrl, url, res, cb){
        cc.loader.loadJs(realUrl, cb);
    }
};
cc.loader.register(["js"], cc._jsLoader);

cc._imgLoader = {
    load : function(realUrl, url, res, cb){
        cc.loader.cache[url] = cc.loader.loadImg(realUrl, function(err, img){
            if(err)
                return cb(err);
            cc.textureCache.handleLoadedTexture(url);
            cb(null, img);
        });
    }
};
cc.loader.register(["png", "jpg", "bmp","jpeg","gif", "ico", "tiff", "webp"], cc._imgLoader);
cc._serverImgLoader = {
    load : function(realUrl, url, res, cb){
        cc.loader.cache[url] =  cc.loader.loadImg(res.src, function(err, img){
            if(err)
                return cb(err);
            cc.textureCache.handleLoadedTexture(url);
            cb(null, img);
        });
    }
};
cc.loader.register(["serverImg"], cc._serverImgLoader);

cc._plistLoader = {
    load : function(realUrl, url, res, cb){
        cc.loader.loadTxt(realUrl, function(err, txt){
            if(err)
                return cb(err);
            cb(null, cc.plistParser.parse(txt));
        });
    }
};
cc.loader.register(["plist"], cc._plistLoader);

cc._fontLoader = {
    TYPE: {'.eot':'embedded-opentype', '.ttf':'truetype', '.ttc':'truetype',
        '.otf':'opentype', '.woff':'woff', '.woff2':'woff2', '.svg':'svg'},
    _fonts: Object.create(null),
    _family: function (name) {
        return String(name).replace(/\\/g, '/').split('/').pop().replace(/\.(ttf|ttc|otf|woff2?|eot|svg)$/i, '');
    },
    _quote: function (value) {
        return "'" + String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
    },
    _notifyReady: function (entry, error) {
        if (entry.state !== 'loading') return;
        entry.state = error ? 'error' : 'loaded';
        entry.error = error || null;
        clearTimeout(entry.timer);
        if (entry.probes) entry.probes.forEach(function (p) { if (p.parentNode) p.parentNode.removeChild(p); });
        entry.probes = null;
        // Heights measured while a fallback was used must never survive font load.
        if (!error && cc.LabelTTF) cc.LabelTTF.__fontHeightCache = {};
        var callbacks = entry.callbacks;
        entry.callbacks = [];
        callbacks.forEach(function (cb) { cb(error || null, !error); });
    },
    _whenReady: function (name, cb) {
        var entry = this._fonts[this._family(name)];
        if (!entry) return;
        if (entry.state === 'loading') entry.callbacks.push(cb);
        else cb(entry.error, entry.state === 'loaded');
    },
    _loadFont: function (name, srcs, type, cb) {
        name = this._family(name);
        var self = this, entry = this._fonts[name];
        if (entry) {
            if (cb) this._whenReady(name, cb);
            return entry;
        }
        entry = this._fonts[name] = {name:name, state:'loading', callbacks:cb ? [cb] : []};
        var sources = Array.isArray(srcs) ? srcs : [srcs];
        var rules = sources.map(function (src) {
            var ext = cc.path.extname(src).toLowerCase();
            var format = self.TYPE[ext] || self.TYPE[type];
            return 'url(' + self._quote(encodeURI(src)) + ')' + (format ? ' format(' + self._quote(format) + ')' : '');
        });
        var style = document.createElement('style');
        style.type = 'text/css';
        style.textContent = '@font-face{font-family:' + this._quote(name) + ';src:' + rules.join(',') + ';font-weight:normal;font-style:normal;}';
        (document.head || document.body || document.documentElement).appendChild(style);
        var text = 'BESbswy0123456789MWil';
        entry.timer = setTimeout(function () {
            self._notifyReady(entry, new Error('Font load timed out: ' + name));
        }, 15000);
        if (document.fonts && typeof document.fonts.load === 'function') {
            try {
                document.fonts.load('32px ' + this._quote(name), text).then(function (faces) {
                    self._notifyReady(entry, faces.length ? null : new Error('Font was not registered: ' + name));
                }, function (error) { self._notifyReady(entry, error); });
            } catch (error) { self._notifyReady(entry, error); }
        } else {
            // Older webOS engines: compare two different fallback families.
            var probes = [], widths = [];
            ['monospace', 'serif'].forEach(function (fallback) {
                var probe = document.createElement('span');
                probe.style.cssText = 'position:absolute;left:-10000px;top:-10000px;visibility:hidden;white-space:nowrap;font-size:32px;line-height:normal;';
                probe.style.fontFamily = fallback;
                probe.textContent = text;
                (document.body || document.documentElement).appendChild(probe);
                widths.push(probe.offsetWidth);
                probe.style.fontFamily = self._quote(name) + ',' + fallback;
                probes.push(probe);
            });
            entry.probes = probes;
            (function poll() {
                if (entry.state !== 'loading') return;
                if (probes[0].offsetWidth !== widths[0] && probes[1].offsetWidth !== widths[1])
                    self._notifyReady(entry, null);
                else setTimeout(poll, 50);
            })();
        }
        return entry;
    },
    load: function (realUrl, url, res, cb) {
        if (cc.isString(res)) {
            var type = cc.path.extname(res).toLowerCase();
            this._loadFont(this._family(res), realUrl || res, type, cb);
        } else {
            this._loadFont(res.name, res.srcs || realUrl, res.type, cb);
        }
    }
};
cc.loader.register(['font','eot','ttf','ttc','otf','woff','woff2','svg'], cc._fontLoader);

cc._binaryLoader = {
    load : function(realUrl, url, res, cb){
        cc.loader.loadBinary(realUrl, cb);
    }
};

cc._csbLoader = {
    load: function(realUrl, url, res, cb){
        cc.loader.loadCsb(realUrl, cb);
    }
};
cc.loader.register(["csb"], cc._csbLoader);
