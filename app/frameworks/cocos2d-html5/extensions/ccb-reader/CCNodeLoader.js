/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
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

var PROPERTY_POSITION = "position";
var PROPERTY_CONTENTSIZE = "contentSize";
var PROPERTY_SKEW = "skew";
var PROPERTY_ANCHORPOINT = "anchorPoint";
var PROPERTY_SCALE = "scale";
var PROPERTY_ROTATION = "rotation";
var PROPERTY_TAG = "tag";
var PROPERTY_IGNOREANCHORPOINTFORPOSITION = "ignoreAnchorPointForPosition";
var PROPERTY_VISIBLE = "visible";

var ASSERT_FAIL_UNEXPECTED_PROPERTY = function (propertyName) {
    cc.log("Unexpected property: '" + propertyName + "'!");
};

var ASSERT_FAIL_UNEXPECTED_PROPERTYTYPE = function (propertyName) {
    cc.log("Unexpected property type: '" + propertyName + "'!");
};

cc._supercatNormalizeCCBOpacity = cc._supercatNormalizeCCBOpacity || function (value) {
    if (typeof value === "number" && value > 0 && value <= 1) {
        return Math.round(value * 255);
    }
    return value;
};

cc._supercatCCBRegisteredFonts = cc._supercatCCBRegisteredFonts || {};

cc._supercatResolveCCBFontName = cc._supercatResolveCCBFontName || function (fontName, ccbReader) {
    if (!fontName || typeof fontName !== "string") {
        return fontName;
    }

    var match = fontName.match(/^(.*)\.(ttf|ttc|otf|woff|woff2)$/i);
    if (!match) {
        // System font, for example Helvetica.
        return fontName;
    }

    var familyName = match[1];
    var rootPath = "";
    if (ccbReader && typeof ccbReader.getCCBRootPath === "function") {
        rootPath = ccbReader.getCCBRootPath() || "";
    }

    var url = fontName;
    if (!/^(?:[a-z]+:)?\/\//i.test(url) && url.charAt(0) !== "/" && url.indexOf("/") < 0) {
        url = rootPath + url;
    }

    if (typeof document !== "undefined" && !cc._supercatCCBRegisteredFonts[familyName]) {
        cc._supercatCCBRegisteredFonts[familyName] = true;

        var ext = (match[2] || "ttf").toLowerCase();
        var format = ext === "otf" ? "opentype" : (ext === "woff2" ? "woff2" : (ext === "woff" ? "woff" : "truetype"));
        var safeFamily = familyName.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
        var safeUrl = encodeURI(url).replace(/'/g, "%27");

        var style = document.createElement("style");
        style.type = "text/css";
        style.textContent = "@font-face{font-family:'" + safeFamily + "';src:url('" + safeUrl + "') format('" + format + "');font-weight:normal;font-style:normal;}";
        (document.head || document.body || document.documentElement).appendChild(style);

        // Trigger browser font loading early. Rendering will refresh naturally on
        // the next Cocos frame; this also fixes labels created before CSS font
        // parsing has finished in some browsers.
        if (document.fonts && typeof document.fonts.load === "function") {
            document.fonts.load("1em '" + familyName.replace(/'/g, "\\'") + "'");
        }
    }

    return familyName;
};

function BlockData(selMenuHander, target) {
    this.selMenuHander = selMenuHander;
    this.target = target;
}

function BlockCCControlData(selCCControlHandler, target, controlEvents) {
    this.selCCControlHandler = selCCControlHandler;
    this.target = target;
    this.controlEvents = controlEvents;
}

cc.NodeLoader = cc.Class.extend({
    _customProperties:null,

    ctor:function(){
        this._customProperties = new cc._Dictionary();
    },

    loadCCNode:function (parent, ccbReader) {
        return this._createCCNode(parent, ccbReader);
        //this.parseProperties(node, parent, ccbReader);
        //return node;
    },

    parseProperties:function (node, parent, ccbReader) {
        this._customProperties = new cc._Dictionary();

        if (ccbReader.getFileVersion && ccbReader.getFileVersion() >= 6) {
            this.parsePropertiesForVersion6(node, parent, ccbReader);
            return;
        }

        var numRegularProps = ccbReader.readInt(false);
        var numExturaProps = ccbReader.readInt(false);
        var propertyCount = numRegularProps + numExturaProps;

        for (var i = 0; i < propertyCount; i++) {
            var isExtraProp = (i >= numRegularProps);
            var type = ccbReader.readInt(false);
            var propertyName = ccbReader.readCachedString();

            // Check if the property can be set for this platform
            var setProp = false;

            var platform = ccbReader.readByte();
            if ((platform === CCB_PLATFORM_ALL) ||(platform === CCB_PLATFORM_IOS) ||(platform === CCB_PLATFORM_MAC) )
                setProp = true;

            //forward properties for sub ccb files
            if(node instanceof cc.BuilderFile){
                if(node.getCCBFileNode() && isExtraProp){
                    node = node.getCCBFileNode();
                    //skip properties that doesn't have a value to override
                    var getExtraPropsNames = node.userObject;
                    setProp = getExtraPropsNames.indexOf(propertyName) !== -1;
                }
            } else if(isExtraProp && node === ccbReader.getAnimationManager().getRootNode()){
                var extraPropsNames = node.userObject;
                if(!extraPropsNames){
                    extraPropsNames = [];
                    node.userObject = extraPropsNames;
                }
                extraPropsNames.push(propertyName);
            }

            switch (type) {
                case CCB_PROPTYPE_POSITION:
                {
                    var position = this.parsePropTypePosition(node, parent, ccbReader, propertyName);
                    if (setProp)
                        this.onHandlePropTypePosition(node, parent, propertyName, position, ccbReader);
                    break;
                }
                case CCB_PROPTYPE_POINT:
                {
                    var point = this.parsePropTypePoint(node, parent, ccbReader);
                    if (setProp)
                        this.onHandlePropTypePoint(node, parent, propertyName, point, ccbReader);
                    break;
                }
                case CCB_PROPTYPE_POINTLOCK:
                {
                    var pointLock = this.parsePropTypePointLock(node, parent, ccbReader);
                    if (setProp)
                        this.onHandlePropTypePointLock(node, parent, propertyName, pointLock, ccbReader);
                    break;
                }
                case CCB_PROPTYPE_SIZE:
                {
                    var size = this.parsePropTypeSize(node, parent, ccbReader);
                    if (setProp)
                        this.onHandlePropTypeSize(node, parent, propertyName, size, ccbReader);
                    break;
                }
                case CCB_PROPTYPE_SCALELOCK:
                {
                    var scaleLock = this.parsePropTypeScaleLock(node, parent, ccbReader, propertyName);
                    if (setProp)
                        this.onHandlePropTypeScaleLock(node, parent, propertyName, scaleLock, ccbReader);
                    break;
                }
                case CCB_PROPTYPE_FLOATXY:
                {
                    var xy = this.parsePropTypeFloatXY(node, parent, ccbReader);
                    if (setProp)
                        this.onHandlePropTypeFloatXY(node, parent, propertyName, xy, ccbReader);
                    break;
                }

                case CCB_PROPTYPE_FLOAT:
                {
                    var f = this.parsePropTypeFloat(node, parent, ccbReader, propertyName);
                    if (setProp) {
                        this.onHandlePropTypeFloat(node, parent, propertyName, f, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_DEGREES:
                {
                    var degrees = this.parsePropTypeDegrees(node, parent, ccbReader, propertyName);
                    if (setProp) {
                        this.onHandlePropTypeDegrees(node, parent, propertyName, degrees, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_FLOATSCALE:
                {
                    var floatScale = this.parsePropTypeFloatScale(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeFloatScale(node, parent, propertyName, floatScale, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_INTEGER:
                {
                    var integer = this.parsePropTypeInteger(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeInteger(node, parent, propertyName, integer, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_INTEGERLABELED:
                {
                    var integerLabeled = this.parsePropTypeIntegerLabeled(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeIntegerLabeled(node, parent, propertyName, integerLabeled, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_FLOATVAR:
                {
                    var floatVar = this.parsePropTypeFloatVar(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeFloatVar(node, parent, propertyName, floatVar, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_CHECK:
                {
                    var check = this.parsePropTypeCheck(node, parent, ccbReader, propertyName);
                    if (setProp) {
                        this.onHandlePropTypeCheck(node, parent, propertyName, check, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_SPRITEFRAME:
                {
                    var ccSpriteFrame = this.parsePropTypeSpriteFrame(node, parent, ccbReader, propertyName);
                    if (setProp) {
                        this.onHandlePropTypeSpriteFrame(node, parent, propertyName, ccSpriteFrame, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_ANIMATION:
                {
                    var ccAnimation = this.parsePropTypeAnimation(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeAnimation(node, parent, propertyName, ccAnimation, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_TEXTURE:
                {
                    var ccTexture2D = this.parsePropTypeTexture(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeTexture(node, parent, propertyName, ccTexture2D, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_BYTE:
                {
                    var byteValue = this.parsePropTypeByte(node, parent, ccbReader, propertyName);
                    if (setProp) {
                        this.onHandlePropTypeByte(node, parent, propertyName, byteValue, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_COLOR3:
                {
                    var color = this.parsePropTypeColor3(node, parent, ccbReader, propertyName);
                    if (setProp) {
                        this.onHandlePropTypeColor3(node, parent, propertyName, color, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_COLOR4VAR:
                {
                    var color4FVar = this.parsePropTypeColor4FVar(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeColor4FVar(node, parent, propertyName, color4FVar, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_FLIP:
                {
                    var flip = this.parsePropTypeFlip(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeFlip(node, parent, propertyName, flip, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_BLENDMODE:
                {
                    var blendFunc = this.parsePropTypeBlendFunc(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeBlendFunc(node, parent, propertyName, blendFunc, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_FNTFILE:
                {
                    var fntFile = ccbReader.getCCBRootPath() + this.parsePropTypeFntFile(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeFntFile(node, parent, propertyName, fntFile, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_FONTTTF:
                {
                    var fontTTF = this.parsePropTypeFontTTF(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeFontTTF(node, parent, propertyName, fontTTF, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_STRING:
                {
                    var stringValue = this.parsePropTypeString(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeString(node, parent, propertyName, stringValue, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_TEXT:
                {
                    var textValue = this.parsePropTypeText(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeText(node, parent, propertyName, textValue, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_BLOCK:
                {
                    var blockData = this.parsePropTypeBlock(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeBlock(node, parent, propertyName, blockData, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_BLOCKCCCONTROL:
                {
                    var blockCCControlData = this.parsePropTypeBlockCCControl(node, parent, ccbReader);
                    if (setProp && blockCCControlData != null) {
                        this.onHandlePropTypeBlockCCControl(node, parent, propertyName, blockCCControlData, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_CCBFILE:
                {
                    var ccbFileNode = this.parsePropTypeCCBFile(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeCCBFile(node, parent, propertyName, ccbFileNode, ccbReader);
                    }
                    break;
                }
                default:
                    ASSERT_FAIL_UNEXPECTED_PROPERTYTYPE(type);
                    break;
            }
        }
    },

    parsePropertiesForVersion6:function (node, parent, ccbReader) {
        var numRegularProps = ccbReader.readInt(false);
        var numExtraProps = ccbReader.readInt(false);
        var propertyCount = numRegularProps + numExtraProps;

        for (var i = 0; i < propertyCount; i++) {
            var isExtraProp = (i >= numRegularProps);
            var type = ccbReader.readInt(false);
            var propertyName = ccbReader.readCachedString();
            var value = this._parseValueForVersion6(node, parent, ccbReader, type, propertyName);

            if (isExtraProp) {
                if (value !== undefined) {
                    this._customProperties.setObject(value, propertyName);
                }
                continue;
            }

            this._applyValueForVersion6(node, parent, ccbReader, type, propertyName, value);
        }
    },

    _parseValueForVersion6:function (node, parent, ccbReader, type, propertyName) {
        switch (type) {
            case CCB_PROPTYPE_POSITION:
                return this.parsePropTypePosition(node, parent, ccbReader, propertyName);
            case CCB_PROPTYPE_POINT:
                return this.parsePropTypePoint(node, parent, ccbReader);
            case CCB_PROPTYPE_POINTLOCK:
                return this.parsePropTypePointLock(node, parent, ccbReader);
            case CCB_PROPTYPE_SIZE:
                return this.parsePropTypeSize(node, parent, ccbReader);
            case CCB_PROPTYPE_SCALELOCK:
                return this.parsePropTypeScaleLock(node, parent, ccbReader, propertyName);
            case CCB_PROPTYPE_FLOATXY:
                return this.parsePropTypeFloatXY(node, parent, ccbReader);
            case CCB_PROPTYPE_FLOAT:
                return this.parsePropTypeFloat(node, parent, ccbReader, propertyName);
            case CCB_PROPTYPE_DEGREES:
                return this.parsePropTypeDegrees(node, parent, ccbReader, propertyName);
            case CCB_PROPTYPE_FLOATSCALE:
                return this.parsePropTypeFloatScale(node, parent, ccbReader);
            case CCB_PROPTYPE_INTEGER:
                return this.parsePropTypeInteger(node, parent, ccbReader);
            case CCB_PROPTYPE_INTEGERLABELED:
                return this.parsePropTypeIntegerLabeled(node, parent, ccbReader);
            case CCB_PROPTYPE_FLOATVAR:
                return this.parsePropTypeFloatVar(node, parent, ccbReader);
            case CCB_PROPTYPE_CHECK:
                return this.parsePropTypeCheck(node, parent, ccbReader, propertyName);
            case CCB_PROPTYPE_SPRITEFRAME:
                return this.parsePropTypeSpriteFrame(node, parent, ccbReader, propertyName);
            case CCB_PROPTYPE_ANIMATION:
                return this.parsePropTypeAnimation(node, parent, ccbReader);
            case CCB_PROPTYPE_TEXTURE:
                return this.parsePropTypeTexture(node, parent, ccbReader);
            case CCB_PROPTYPE_BYTE:
                return this.parsePropTypeByte(node, parent, ccbReader, propertyName);
            case CCB_PROPTYPE_COLOR3:
                return this.parsePropTypeColor3(node, parent, ccbReader, propertyName);
            case CCB_PROPTYPE_COLOR4:
                return this.parsePropTypeColor4V6(node, parent, ccbReader, propertyName);
            case CCB_PROPTYPE_COLOR4VAR:
                return this.parsePropTypeColor4FVar(node, parent, ccbReader);
            case CCB_PROPTYPE_FLIP:
                return this.parsePropTypeFlip(node, parent, ccbReader);
            case CCB_PROPTYPE_BLENDMODE:
                return this.parsePropTypeBlendFunc(node, parent, ccbReader);
            case CCB_PROPTYPE_FNTFILE:
                return ccbReader.getCCBRootPath() + this.parsePropTypeFntFile(node, parent, ccbReader);
            case CCB_PROPTYPE_FONTTTF:
                return this.parsePropTypeFontTTF(node, parent, ccbReader);
            case CCB_PROPTYPE_STRING:
                return this.parsePropTypeString(node, parent, ccbReader, propertyName);
            case CCB_PROPTYPE_TEXT:
                return this.parsePropTypeText(node, parent, ccbReader, propertyName);
            case CCB_PROPTYPE_BLOCK:
                return this.parsePropTypeBlock(node, parent, ccbReader);
            case CCB_PROPTYPE_BLOCKCCCONTROL:
                return this.parsePropTypeBlockCCControl(node, parent, ccbReader);
            case CCB_PROPTYPE_CCBFILE:
                return this.parsePropTypeCCBFile(node, parent, ccbReader);
            case CCB_PROPTYPE_NODEREFERENCE:
                if (propertyName === "png") {
                    return this.parsePropTypeTexture(node, parent, ccbReader);
                }
                return ccbReader.readInt(false);
            case CCB_PROPTYPE_FLOATCHECK:
                return this.parsePropTypeFloatCheckV6(node, parent, ccbReader);
            case CCB_PROPTYPE_EFFECTCONTROL:
                return this.parsePropTypeEffectControlV6(node, parent, ccbReader);
            case CCB_PROPTYPE_SOUNDFILE:
                return ccbReader.readCachedString();
            case CCB_PROPTYPE_OFFSETS:
                return this.parsePropTypeOffsetsV6(node, parent, ccbReader);
            case CCB_PROPTYPE_MEMBERVARASSIGNMENT:
                return this.parsePropTypeMemberVarAssignmentV6(node, parent, ccbReader);
            default:
                ASSERT_FAIL_UNEXPECTED_PROPERTYTYPE(type);
                return undefined;
        }
    },

    _applyValueForVersion6:function (node, parent, ccbReader, type, propertyName, value) {
        propertyName = this._normalizePropertyNameForVersion6(node, propertyName);

        switch (type) {
            case CCB_PROPTYPE_POSITION:
                this.onHandlePropTypePosition(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_POINT:
                this.onHandlePropTypePoint(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_POINTLOCK:
                this.onHandlePropTypePointLock(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_SIZE:
                this.onHandlePropTypeSize(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_SCALELOCK:
                this.onHandlePropTypeScaleLock(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_FLOATXY:
                this.onHandlePropTypeFloatXY(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_FLOAT:
                this.onHandlePropTypeFloat(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_DEGREES:
                this.onHandlePropTypeDegrees(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_FLOATSCALE:
                this.onHandlePropTypeFloatScale(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_INTEGER:
                this.onHandlePropTypeInteger(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_INTEGERLABELED:
                this.onHandlePropTypeIntegerLabeled(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_FLOATVAR:
                this.onHandlePropTypeFloatVar(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_CHECK:
                this.onHandlePropTypeCheck(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_SPRITEFRAME:
                this.onHandlePropTypeSpriteFrame(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_ANIMATION:
                this.onHandlePropTypeAnimation(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_TEXTURE:
                this.onHandlePropTypeTexture(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_BYTE:
                this.onHandlePropTypeByte(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_COLOR3:
                this.onHandlePropTypeColor3(node, parent, propertyName, value, ccbReader);
                if (propertyName === "color" && value.a != null && node.setOpacity) {
                    node.setOpacity(value.a);
                }
                break;
            case CCB_PROPTYPE_COLOR4:
                if (propertyName === "color") {
                    if (node.setColor) {
                        node.setColor({r:value.r, g:value.g, b:value.b});
                    }
                    if (node.setOpacity) {
                        node.setOpacity(value.a);
                    }
                } else if (propertyName === "fontColor" && node && typeof node.setFontFillColor === "function") {
                    node.setFontFillColor(value);
                } else if (!this._rememberKnownPropertyForVersion6(node, propertyName, value)) {
                    this._customProperties.setObject(value, propertyName);
                }
                break;
            case CCB_PROPTYPE_COLOR4VAR:
                this.onHandlePropTypeColor4FVar(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_FLIP:
                this.onHandlePropTypeFlip(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_BLENDMODE:
                this.onHandlePropTypeBlendFunc(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_FNTFILE:
                this.onHandlePropTypeFntFile(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_FONTTTF:
                this.onHandlePropTypeFontTTF(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_STRING:
                this.onHandlePropTypeString(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_TEXT:
                this.onHandlePropTypeText(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_BLOCK:
                this.onHandlePropTypeBlock(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_BLOCKCCCONTROL:
                if (value != null) {
                    this.onHandlePropTypeBlockCCControl(node, parent, propertyName, value, ccbReader);
                }
                break;
            case CCB_PROPTYPE_CCBFILE:
                this.onHandlePropTypeCCBFile(node, parent, propertyName, value, ccbReader);
                break;
            case CCB_PROPTYPE_NODEREFERENCE:
                if (propertyName === "png") {
                    this.onHandlePropTypeTexture(node, parent, propertyName, value, ccbReader);
                } else if (value !== undefined) {
                    this._customProperties.setObject(value, propertyName);
                }
                break;
            default:
                if (value !== undefined) {
                    this._customProperties.setObject(value, propertyName);
                }
                break;
        }
    },

    _normalizePropertyNameForVersion6:function (node, propertyName) {
        if (!(cc.ControlButton && node instanceof cc.ControlButton)) {
            return propertyName;
        }

        var propertyMap = {
            "preferredSize":"preferedSize",
            "userInteractionEnabled":"enabled",
            "zoomWhenHighlighted":"zoomOnTouchDown",
            "title":"title|1",
            "fontName":"titleTTF|1",
            "fontSize":"titleTTFSize|1",
            "fontColor":"titleColor|1",
            "labelColor|Normal":"titleColor|1",
            "labelColor|Highlighted":"titleColor|2",
            "labelColor|Disabled":"titleColor|3",
            "backgroundSpriteFrame|Normal":"backgroundSpriteFrame|1",
            "backgroundSpriteFrame|Highlighted":"backgroundSpriteFrame|2",
            "backgroundSpriteFrame|Selected":"backgroundSpriteFrame|4",
            "backgroundSpriteFrame|Disabled":"backgroundSpriteFrame|3"
        };

        return propertyMap[propertyName] || propertyName;
    },

    _rememberKnownPropertyForVersion6:function (node, propertyName, value) {
        var known = {
            color:true,
            fontColor:true,
            blendFunc:true,
            texture:true,
            png:true,
            spriteFrame:true,
            displayFrame:true,
            resetOnVisibilityToggle:true,
            particlePositionType:true,
            adjustsFontSizeToFit:true,
            outlineColor:true,
            outlineWidth:true,
            shadowColor:true,
            shadowOffset:true,
            shadowBlurRadius:true,
            maxSize:true,
            horizontalPadding:true,
            verticalPadding:true,
            block:true
        };
        if (!known[propertyName]) {
            return false;
        }
        if (value !== undefined) {
            this._customProperties.setObject(value, propertyName);
            if (node) {
                node.__supercatCCBProperties = node.__supercatCCBProperties || {};
                node.__supercatCCBProperties[propertyName] = value;
                this._applyKnownTextPropertiesForVersion6(node);
            }
        }
        return true;
    },

    _getColorAlphaForVersion6:function (color) {
        if (!color || color.a == null) {
            return 255;
        }
        return color.a <= 1 ? color.a * 255 : color.a;
    },

    _getVectorComponentForVersion6:function (value, firstName, secondName) {
        if (!value) {
            return 0;
        }
        var result = value[firstName];
        if (result == null) {
            result = value[secondName];
        }
        return result || 0;
    },

    _applyKnownTextPropertiesForVersion6:function (node) {
        var props = node && node.__supercatCCBProperties;
        if (!props) {
            return;
        }

        // The SuperCat CCB v6 files always contain outline/shadow properties for
        // LabelTTF nodes, even when the effect is disabled. Native Cocos2d-x keeps
        // these values in LabelTTFLoader and enables the effect only when the
        // stored width/alpha/offset/blur make it visible. Calling the HTML5
        // enable* methods with zero values is not equivalent: enableShadow() turns
        // alpha 0 into its default 0.5 opacity, and enableStroke() still marks the
        // label as stroked. This created the unwanted dark border around text.
        if (typeof node.enableStroke === "function" && props.outlineColor && props.outlineWidth != null) {
            var outlineAlpha = this._getColorAlphaForVersion6(props.outlineColor);
            var outlineWidth = props.outlineWidth || 0;
            if (outlineWidth > 0 && outlineAlpha > 0) {
                node.enableStroke(props.outlineColor, outlineWidth);
            } else if (typeof node.disableStroke === "function") {
                node.disableStroke();
            }
        }

        if (typeof node.enableShadow === "function" &&
                (props.shadowColor || props.shadowOffset || props.shadowBlurRadius != null)) {
            var shadowColor = props.shadowColor || cc.color(0, 0, 0, 128);
            var shadowAlpha = this._getColorAlphaForVersion6(shadowColor);
            var shadowOffset = props.shadowOffset || cc.size(0, 0);
            var shadowBlur = props.shadowBlurRadius || 0;
            var shadowX = this._getVectorComponentForVersion6(shadowOffset, "x", "width");
            var shadowY = this._getVectorComponentForVersion6(shadowOffset, "y", "height");

            if (shadowAlpha > 0 && (shadowBlur > 0 || shadowX !== 0 || shadowY !== 0)) {
                node.enableShadow(shadowColor, shadowOffset, shadowBlur);
            } else if (typeof node.disableShadow === "function") {
                node.disableShadow();
            }
        }
    },

    _setBlendFuncIfPossible:function (node, blendFunc) {
        if (!node || typeof node.setBlendFunc !== "function" || !blendFunc) {
            return false;
        }
        try {
            node.setBlendFunc(blendFunc);
        } catch (err) {
            node.setBlendFunc(blendFunc.src, blendFunc.dst);
        }
        return true;
    },

    _setSpriteFrameIfPossible:function (node, spriteFrame) {
        if (!node || typeof node.setSpriteFrame !== "function" || !spriteFrame) {
            return false;
        }
        node.setSpriteFrame(spriteFrame);
        return true;
    },

    _mapPositionTypeForVersion6:function (corner, xUnit, yUnit) {
        return {
            __supercatCCBPositionV6:true,
            corner:corner,
            xUnit:xUnit,
            yUnit:yUnit
        };
    },

    getCustomProperties:function(){
        return this._customProperties;
    },

    _createCCNode:function (parent, ccbReader) {
        return new cc.Node();
    },

    parsePropTypePosition:function (node, parent, ccbReader, propertyName) {
        var x = ccbReader.readFloat();
        var y = ccbReader.readFloat();

        var type;
        if (ccbReader.getFileVersion && ccbReader.getFileVersion() >= 6) {
            var corner = ccbReader.readByte();
            var xUnit = ccbReader.readByte();
            var yUnit = ccbReader.readByte();
            type = this._mapPositionTypeForVersion6(corner, xUnit, yUnit);
        } else {
            type = ccbReader.readInt(false);
        }

        var containerSize = ccbReader.getAnimationManager().getContainerSize(parent);
        var pt = (type && type.__supercatCCBPositionV6 && cc._getAbsolutePositionV6)
            ? cc._getAbsolutePositionV6(x, y, type, containerSize, propertyName)
            : cc._getAbsolutePosition(x, y, type, containerSize, propertyName);

        // parsePropTypePosition must only decode and return the value.
        // The actual target property is applied later by onHandlePropTypePosition().
        // Some CCB properties, for example LabelTTF shadowOffset, use the same
        // POSITION value format but must not move the node itself.
        if (ccbReader.getAnimatedProperties().indexOf(propertyName) > -1) {
            var baseValue = [x, y, type];
            ccbReader.getAnimationManager().setBaseValue(baseValue, node, propertyName);
        }

        return pt;
    },

    parsePropTypePoint:function (node, parent, ccbReader) {
        var x = ccbReader.readFloat();
        var y = ccbReader.readFloat();

        return cc.p(x, y);
    },

    parsePropTypePointLock:function (node, parent, ccbReader) {
        var x = ccbReader.readFloat();
        var y = ccbReader.readFloat();

        return cc.p(x, y);
    },

    parsePropTypeSize:function (node, parent, ccbReader) {
        var width = ccbReader.readFloat();
        var height = ccbReader.readFloat();

        var containerSize = ccbReader.getAnimationManager().getContainerSize(parent);
        var type;

        if (ccbReader.getFileVersion && ccbReader.getFileVersion() >= 6) {
            var widthUnit = ccbReader.readByte();
            var heightUnit = ccbReader.readByte();
            var resolutionScale = cc.BuilderReader.getResolutionScale();

            if (widthUnit === 1) {
                width *= resolutionScale;
            } else if (widthUnit === 2) {
                width = containerSize.width * width;
            } else if (widthUnit === 3) {
                width = containerSize.width - width;
            } else if (widthUnit === 4) {
                width = containerSize.width - width * resolutionScale;
            }

            if (heightUnit === 1) {
                height *= resolutionScale;
            } else if (heightUnit === 2) {
                height = containerSize.height * height;
            } else if (heightUnit === 3) {
                height = containerSize.height - height;
            } else if (heightUnit === 4) {
                height = containerSize.height - height * resolutionScale;
            }

            return cc.size(width, height);
        }

        type = ccbReader.readInt(false);

        switch (type) {
            case CCB_SIZETYPE_ABSOLUTE:
                /* Nothing. */
                break;
            case CCB_SIZETYPE_RELATIVE_CONTAINER:
                width = containerSize.width - width;
                height = containerSize.height - height;
                break;
            case CCB_SIZETYPE_PERCENT:
                width = (containerSize.width * width / 100.0);
                height = (containerSize.height * height / 100.0);
                break;
            case CCB_SIZETYPE_HORIZONTAL_PERCENT:
                width = (containerSize.width * width / 100.0);
                break;
            case CCB_SIZETYPE_VERTICAL_PERCENT:
                height = (containerSize.height * height / 100.0);
                break;
            case CCB_SIZETYPE_MULTIPLY_RESOLUTION:
                var resolutionScale = cc.BuilderReader.getResolutionScale();
                width *= resolutionScale;
                height *= resolutionScale;
                break;
            default:
                cc.log("Unknown CCB type.");
                break;
        }

        return cc.size(width, height);
    },

    parsePropTypeScaleLock:function (node, parent, ccbReader, propertyName) {
        var x = ccbReader.readFloat();
        var y = ccbReader.readFloat();

        var type;
        if (ccbReader.getFileVersion && ccbReader.getFileVersion() >= 6) {
            type = ccbReader.readByte();
        } else {
            type = ccbReader.readInt(false);
        }

        cc.setRelativeScale(node,x,y,type,propertyName);

        if(ccbReader.getAnimatedProperties().indexOf(propertyName) > -1){
            ccbReader.getAnimationManager().setBaseValue([x,y,type],node,propertyName);
        }

        if (type === CCB_SCALETYPE_MULTIPLY_RESOLUTION) {
            x *= cc.BuilderReader.getResolutionScale();
            y *= cc.BuilderReader.getResolutionScale();
        }

        return [x, y];
    },

    parsePropTypeFloat:function (node, parent, ccbReader, propertyName) {
        var ret = ccbReader.readFloat();
        if(ccbReader.getAnimatedProperties().indexOf(propertyName) > -1){
            ccbReader.getAnimationManager().setBaseValue(ret,node, propertyName);
        }
        return ret;
    },

    parsePropTypeDegrees:function (node, parent, ccbReader, propertyName) {
        var ret = ccbReader.readFloat();
        if(ccbReader.getAnimatedProperties().indexOf(propertyName) > -1){
            ccbReader.getAnimationManager().setBaseValue(ret,node, propertyName);
        }
        return ret;
    },

    parsePropTypeFloatScale:function (node, parent, ccbReader) {
        var f = ccbReader.readFloat();

        var type = ccbReader.readInt(false);

        if (type === CCB_SCALETYPE_MULTIPLY_RESOLUTION) {
            f *= cc.BuilderReader.getResolutionScale();
        }

        return f;
    },

    parsePropTypeInteger:function (node, parent, ccbReader) {
        return ccbReader.readInt(true);
    },

    parsePropTypeIntegerLabeled:function (node, parent, ccbReader) {
        return ccbReader.readInt(true);
    },

    parsePropTypeFloatVar:function (node, parent, ccbReader) {
        var f = ccbReader.readFloat();
        var fVar = ccbReader.readFloat();
        return [f, fVar];
    },

    parsePropTypeCheck:function (node, parent, ccbReader, propertyName) {
        var ret = ccbReader.readBool();
        if(ccbReader.getAnimatedProperties().indexOf(propertyName) > -1){
            ccbReader.getAnimationManager().setBaseValue(ret,node, propertyName);
        }
        return ret;
    },

    parsePropTypeSpriteFrame:function (node, parent, ccbReader, propertyName) {
        var spriteSheet = "";
        var spriteFile;

        if (ccbReader.getFileVersion && ccbReader.getFileVersion() >= 6) {
            spriteFile = ccbReader.readCachedString();
        } else {
            spriteSheet = ccbReader.readCachedString();
            spriteFile =  ccbReader.readCachedString();
        }

        ccbReader._lastSpriteFrameNameV6 = spriteFile || "";
        ccbReader._lastSpriteFramePropertyNameV6 = propertyName || "";
        ccbReader._lastSpriteFrameCCBFileV6 = ccbReader._currentCCBFileName || "";
        ccbReader._lastSpriteFrameWasEmptyV6 = !spriteFile;
        ccbReader._lastMissingSpriteFrameNameV6 = "";

        var spriteFrame;
        if(spriteFile != null && spriteFile.length !== 0){
            if (ccbReader.getFileVersion && ccbReader.getFileVersion() >= 6) {
                spriteFrame = ccbReader._resolveSpriteFrameV6(spriteFile);
            } else if(spriteSheet.length === 0){
                spriteFile = ccbReader.getCCBRootPath() + spriteFile;
                var texture = cc.textureCache.addImage(spriteFile);

                var locContentSize = texture.getContentSize();
                var bounds = cc.rect(0, 0, locContentSize.width, locContentSize.height);
                spriteFrame = new cc.SpriteFrame(texture, bounds);
            } else {
                var frameCache = cc.spriteFrameCache;
                spriteSheet = ccbReader.getCCBRootPath() + spriteSheet;
                //load the sprite sheet only if it is not loaded
                if(ccbReader.getLoadedSpriteSheet().indexOf(spriteSheet) === -1){
                    frameCache.addSpriteFrames(spriteSheet);
                    ccbReader.getLoadedSpriteSheet().push(spriteSheet);
                }
                spriteFrame = frameCache.getSpriteFrame(spriteFile);
            }
            if (!spriteFrame) {
                ccbReader._lastMissingSpriteFrameNameV6 = spriteFile;
            }
            if(ccbReader.getAnimatedProperties().indexOf(propertyName) > -1){
                ccbReader.getAnimationManager().setBaseValue(spriteFrame,node,propertyName);
            }
        }

        return spriteFrame;
    },

    parsePropTypeAnimation:function (node, parent, ccbReader) {
        var animationFile = ccbReader.getCCBRootPath() + ccbReader.readCachedString();
        var animation = ccbReader.readCachedString();

        var ccAnimation = null;

        // Support for stripping relative file paths, since ios doesn't currently
        // know what to do with them, since its pulling from bundle.
        // Eventually this should be handled by a client side asset manager
        // interface which figured out what resources to load.
        // TODO Does this problem exist in C++?
        animation = cc.BuilderReader.lastPathComponent(animation);
        animationFile = cc.BuilderReader.lastPathComponent(animationFile);

        if (animation != null && animation !== "") {
            var animationCache = cc.animationCache;
            animationCache.addAnimations(animationFile);

            ccAnimation = animationCache.getAnimation(animation);
        }
        return ccAnimation;
    },

    parsePropTypeTexture:function (node, parent, ccbReader) {
        var spriteFile = ccbReader.readCachedString();
        if (!spriteFile) {
            return null;
        }

        if (ccbReader.getFileVersion && ccbReader.getFileVersion() >= 6 && ccbReader._resolveSpriteFrameV6) {
            var spriteFrame = ccbReader._resolveSpriteFrameV6(spriteFile);
            if (spriteFrame && spriteFrame.getTexture) {
                return {
                    __supercatCCBTextureFrame:true,
                    name:spriteFile,
                    texture:spriteFrame.getTexture(),
                    rect:spriteFrame.getRect ? spriteFrame.getRect() : null,
                    spriteFrame:spriteFrame
                };
            }
        }

        spriteFile = ccbReader.getCCBRootPath() + spriteFile;
        if(spriteFile !== "")
            return cc.textureCache.addImage(spriteFile);
        return null;
    },

    parsePropTypeByte:function (node, parent, ccbReader, propertyName) {
        var ret = ccbReader.readByte();
        if (propertyName === "opacity" && ccbReader.getFileVersion && ccbReader.getFileVersion() >= 6) {
            ret = cc._supercatNormalizeCCBOpacity(ret);
        }
        if(ccbReader.getAnimatedProperties().indexOf(propertyName) > -1){
            ccbReader.getAnimationManager().setBaseValue(ret,node, propertyName);
        }
        return ret;
    },

    parsePropTypeColor3:function (node, parent, ccbReader, propertyName) {
        var color;
        if (ccbReader.getFileVersion && ccbReader.getFileVersion() >= 6) {
            color = ccbReader._readColor4V6();
        } else {
            var red = ccbReader.readByte();
            var green = ccbReader.readByte();
            var blue = ccbReader.readByte();
            color = {r:red, g:green, b:blue };
        }
        if(ccbReader.getAnimatedProperties().indexOf(propertyName) > -1){
            ccbReader.getAnimationManager().setBaseValue(cc.Color3BWapper.create(color),node, propertyName);
        }
        return color;
    },

    parsePropTypeColor4FVar:function (node, parent, ccbReader) {
        //TODO Color4F doesn't supports on HTML5
        var red = 0 | (ccbReader.readFloat() * 255);
        var green = 0 | (ccbReader.readFloat() * 255);
        var blue = 0 | (ccbReader.readFloat() * 255);
        var alpha = ccbReader.readFloat();
        alpha = alpha <= 1 ? (0 | (alpha * 255)) : alpha;
        var redVar = 0 | (ccbReader.readFloat() * 255);
        var greenVar = 0 | (ccbReader.readFloat() * 255);
        var blueVar = 0 | (ccbReader.readFloat() * 255);
        var alphaVar = ccbReader.readFloat();
        alphaVar = alphaVar <= 1 ? (0 | (alphaVar * 255)) : alphaVar;

        var colors = [];
        colors[0] = {r:red, g:green, b:blue, a:alpha};
        colors[1] = {r:redVar, g:greenVar, b:blueVar, a:alphaVar};

        return colors;
    },

    parsePropTypeFlip:function (node, parent, ccbReader) {
        var flipX = ccbReader.readBool();
        var flipY = ccbReader.readBool();

        return [flipX, flipY];
    },

    parsePropTypeBlendFunc:function (node, parent, ccbReader) {
        var source = ccbReader.readInt(false);
        var destination = ccbReader.readInt(false);

        return new cc.BlendFunc(source, destination);
    },

    parsePropTypeFntFile:function (node, parent, ccbReader) {
        return ccbReader.readCachedString();
    },

    parsePropTypeString:function (node, parent, ccbReader) {
        var ret = ccbReader.readCachedString();
        if (ccbReader.getFileVersion && ccbReader.getFileVersion() >= 6) {
            ccbReader.readBool();
        }
        return ret;
    },

    parsePropTypeText:function (node, parent, ccbReader) {
        var ret = ccbReader.readCachedString();
        if (ccbReader.getFileVersion && ccbReader.getFileVersion() >= 6) {
            ccbReader.readBool();
        }
        return ret;
    },

    parsePropTypeFontTTF:function (node, parent, ccbReader) {
        var fontTTF = ccbReader.readCachedString();
        return cc._supercatResolveCCBFontName(fontTTF, ccbReader);
    },

    parsePropTypeColor4V6:function (node, parent, ccbReader, propertyName) {
        return ccbReader._readColor4V6();
    },

    parsePropTypeFloatCheckV6:function (node, parent, ccbReader) {
        return [ccbReader.readFloat(), ccbReader.readBool()];
    },

    parsePropTypeOffsetsV6:function (node, parent, ccbReader) {
        return [ccbReader.readFloat(), ccbReader.readFloat(), ccbReader.readFloat(), ccbReader.readFloat()];
    },

    parsePropTypeMemberVarAssignmentV6:function (node, parent, ccbReader) {
        var assignmentType = ccbReader.readInt(false);
        return {
            target:assignmentType,
            name:assignmentType !== CCB_TARGETTYPE_NONE ? ccbReader.readCachedString() : ""
        };
    },

    parsePropTypeEffectControlV6:function (node, parent, ccbReader) {
        var effects = [];
        var effectCount = ccbReader.readInt(false);
        for (var i = 0; i < effectCount; i++) {
            var effect = {
                baseClass:ccbReader.readCachedString(),
                properties:{}
            };
            var propertyCount = ccbReader.readInt(false);
            for (var j = 0; j < propertyCount; j++) {
                var type = ccbReader.readInt(false);
                var name = ccbReader.readCachedString();
                effect.properties[name] = this._parseValueForVersion6(node, parent, ccbReader, type, name);
            }
            effects.push(effect);
        }
        return effects;
    },

    parsePropTypeBlock:function (node, parent, ccbReader) {
        var selectorName = ccbReader.readCachedString();
        var selectorTarget = ccbReader.readInt(false);

        if (selectorTarget !== CCB_TARGETTYPE_NONE) {
            var target = null;
            if(!ccbReader.isJSControlled()) {
                if (selectorTarget === CCB_TARGETTYPE_DOCUMENTROOT) {
                    target = ccbReader.getAnimationManager().getRootNode();
                } else if (selectorTarget === CCB_TARGETTYPE_OWNER) {
                    target = ccbReader.getOwner();
                }

                if (target !== null) {
                    if (selectorName.length > 0) {
                        var selMenuHandler = 0;

                        //var targetAsCCBSelectorResolver = target;
                        if (target.onResolveCCBCCMenuItemSelector)
                            selMenuHandler = target.onResolveCCBCCMenuItemSelector(target, selectorName);

                        if (selMenuHandler === 0) {
                            var ccbSelectorResolver = ccbReader.getCCBSelectorResolver();
                            if (ccbSelectorResolver != null)
                                selMenuHandler = ccbSelectorResolver.onResolveCCBCCMenuItemSelector(target, selectorName);
                        }

                        if (selMenuHandler === 0) {
                            cc.log("Skipping selector '" +selectorName+ "' since no CCBSelectorResolver is present.");
                        } else {
                            return new BlockData(selMenuHandler,target);
                        }
                    } else {
                        cc.log("Unexpected empty selector.");
                    }
                } else {
                    cc.log("Unexpected NULL target for selector.");
                }
            } else {
                // CocosBuilder 3 / modified v6 stores CCButton callbacks as a generic
                // BLOCK property instead of BLOCKCCCONTROL.  The stock HTML5 reader used
                // to keep controlEvents = 0 here, so JS-controlled CCButton nodes got
                // their callback name but never fired on click/tap.
                // For CCButton this property means a normal button activation.
                var callbackControlEvents = (cc.ControlButton && node instanceof cc.ControlButton)
                    ? cc.CONTROL_EVENT_TOUCH_UP_INSIDE
                    : 0;

                if(selectorTarget === CCB_TARGETTYPE_DOCUMENTROOT){
                    ccbReader.addDocumentCallbackNode(node);
                    ccbReader.addDocumentCallbackName(selectorName);
                    ccbReader.addDocumentCallbackControlEvents(callbackControlEvents);
                } else {
                    ccbReader.addOwnerCallbackNode(node);
                    ccbReader.addOwnerCallbackName(selectorName);
                    ccbReader.addOwnerCallbackControlEvents(callbackControlEvents);
                }
            }
        }
        return null;
    },

    parsePropTypeBlockCCControl:function (node, parent, ccbReader) {
        var selectorName = ccbReader.readCachedString();
        var selectorTarget = ccbReader.readInt(false);
        var controlEvents = ccbReader.readInt(false);

        if (selectorTarget !== CCB_TARGETTYPE_NONE) {
            if(!ccbReader.isJSControlled()){
                var target = null;
                if (selectorTarget === CCB_TARGETTYPE_DOCUMENTROOT) {
                    target = ccbReader.getAnimationManager().getRootNode();
                } else if (selectorTarget === CCB_TARGETTYPE_OWNER) {
                    target = ccbReader.getOwner();
                }

                if (target !== null) {
                    if (selectorName.length > 0) {
                        var selCCControlHandler = 0;

                        if (target.onResolveCCBCCControlSelector) {
                            selCCControlHandler = target.onResolveCCBCCControlSelector(target, selectorName);
                        }
                        if (selCCControlHandler === 0) {
                            var ccbSelectorResolver = ccbReader.getCCBSelectorResolver();
                            if (ccbSelectorResolver != null) {
                                selCCControlHandler = ccbSelectorResolver.onResolveCCBCCControlSelector(target, selectorName);
                            }
                        }

                        if (selCCControlHandler === 0) {
                            cc.log("Skipping selector '" + selectorName + "' since no CCBSelectorResolver is present.");
                        } else {
                            return new BlockCCControlData(selCCControlHandler,target,controlEvents);
                        }
                    } else {
                        cc.log("Unexpected empty selector.");
                    }
                } else {
                    cc.log("Unexpected NULL target for selector.");
                }
            } else {
                if(selectorTarget === CCB_TARGETTYPE_DOCUMENTROOT){
                    ccbReader.addDocumentCallbackNode(node);
                    ccbReader.addDocumentCallbackName(selectorName);
                    ccbReader.addDocumentCallbackControlEvents(controlEvents);
                } else {
                    ccbReader.addOwnerCallbackNode(node);
                    ccbReader.addOwnerCallbackName(selectorName);
                    ccbReader.addOwnerCallbackControlEvents(controlEvents);
                }
            }
        }
        return null;
    },

    parsePropTypeCCBFile:function (node, parent, ccbReader) {
        var ccbPath = ccbReader.readCachedString();
        var rootPath = ccbReader.getCCBRootPath() || cc.BuilderReader.getResourcePath() || "";
        if (rootPath && !/[\\\/]$/.test(rootPath)) {
            rootPath += "/";
        }

        function makeFallbackNode() {
            var fallbackNode = new cc.Node();
            if (parent && parent.getContentSize) {
                fallbackNode.setContentSize(parent.getContentSize());
            }
            return fallbackNode;
        }

        var ccbFileWithoutPathExtension = cc.BuilderReader.deletePathExtension(ccbPath);
        var ccbFileName = "";
        var bytes = null;
        var candidateMap = {};
        var candidates = [];

        function pushCandidate(path) {
            if (!path || candidateMap[path]) {
                return;
            }
            candidateMap[path] = true;
            candidates.push(path);
        }

        var baseName = cc.BuilderReader.lastPathComponent(ccbFileWithoutPathExtension);
        pushCandidate(rootPath + baseName + ".ccbi");
        pushCandidate(rootPath + ccbFileWithoutPathExtension + ".ccbi");
        pushCandidate("res/" + baseName + ".ccbi");
        pushCandidate("res/" + ccbFileWithoutPathExtension + ".ccbi");
        pushCandidate(baseName + ".ccbi");
        pushCandidate(ccbFileWithoutPathExtension + ".ccbi");

        var myCCBReader = new cc.BuilderReader(ccbReader);

        for (var i = 0; i < candidates.length; i++) {
            var candidate = candidates[i];
            bytes = cc.loader.getRes(candidate);
            if (!bytes) {
                var realUrl = cc.loader.getUrl(candidate);
                bytes = cc.loader.loadBinarySync(realUrl);
                if (bytes) {
                    cc.loader.cache[candidate] = bytes;
                }
            }
            if (bytes) {
                ccbFileName = candidate;
                break;
            }
        }

        if (!bytes) {
            cc.log("Failed to resolve nested CCB file: " + ccbPath + " candidates=" + candidates.join(", "));
            return makeFallbackNode();
        }

        try {
            myCCBReader.initWithData(bytes,ccbReader.getOwner());
            myCCBReader.getAnimationManager().setRootContainerSize(parent.getContentSize());
            myCCBReader.setAnimationManagers(ccbReader.getAnimationManagers());

            myCCBReader.getAnimationManager().setOwner(ccbReader.getOwner());
            var ccbFileNode = myCCBReader.readFileWithCleanUp(false);
            ccbReader.setAnimationManagers(myCCBReader.getAnimationManagers());
            if (ccbFileNode) {
                cc.BuilderReader._attachDocumentController(ccbFileNode, myCCBReader.getAnimationManager(), ccbReader.getOwner());
            }

            if(ccbFileNode && myCCBReader.getAnimationManager().getAutoPlaySequenceId() !== -1)
                myCCBReader.getAnimationManager().runAnimations(myCCBReader.getAnimationManager().getAutoPlaySequenceId(),0);

            return ccbFileNode;
        } catch (error) {
            cc.log("Nested CCB fallback for " + ccbPath + ": " + error);
            return makeFallbackNode();
        }
    },

    parsePropTypeFloatXY:function(node, parent, ccbReader){
        var x = ccbReader.readFloat();
        var y = ccbReader.readFloat();
        return [x,y];
    },

    onHandlePropTypePosition:function (node, parent, propertyName, position, ccbReader) {
        if (propertyName === PROPERTY_POSITION || !propertyName) {
            if (node && typeof node.setPosition === "function") {
                node.setPosition(position);
            }
            return;
        }

        var nameX = propertyName + "X";
        var nameY = propertyName + "Y";
        if (node && typeof node[nameX] === "function" && typeof node[nameY] === "function") {
            node[nameX](position.x);
            node[nameY](position.y);
            return;
        }
        if (this._rememberKnownPropertyForVersion6(node, propertyName, position)) {
            return;
        }

        // Do not treat other properties such as "scale" as a position. If this
        // happens, it is usually a CCB stream alignment issue; log and skip.
        cc.log("CCB v6 unsupported position property '" + propertyName + "', skipping.");
        ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
    },

    onHandlePropTypePoint:function (node, parent, propertyName, position, ccbReader) {
        if (propertyName === PROPERTY_ANCHORPOINT) {
            node.setAnchorPoint(position);
        } else if (this._rememberKnownPropertyForVersion6(node, propertyName, position)) {
            return;
        } else {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },

    onHandlePropTypePointLock:function (node, parent, propertyName, pointLock, ccbReader) {
        if (!this._rememberKnownPropertyForVersion6(node, propertyName, pointLock)) {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },

    onHandlePropTypeSize:function (node, parent, propertyName, sizeValue, ccbReader) {
        if (propertyName === PROPERTY_CONTENTSIZE) {
            node.setContentSize(sizeValue);
        } else if (this._rememberKnownPropertyForVersion6(node, propertyName, sizeValue)) {
            return;
        } else {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },

    onHandlePropTypeScaleLock:function (node, parent, propertyName, scaleLock, ccbReader) {
        if (propertyName === PROPERTY_SCALE) {
            node.setScaleX(scaleLock[0]);
            node.setScaleY(scaleLock[1]);
        } else if (this._rememberKnownPropertyForVersion6(node, propertyName, scaleLock)) {
            return;
        } else {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },
    onHandlePropTypeFloatXY: function (node, parent, propertyName, xy, ccbReader) {
        if (propertyName === PROPERTY_SKEW) {
            node.setSkewX(xy[0]);
            node.setSkewY(xy[1]);
            return;
        }

        var nameX = propertyName + "X";
        var nameY = propertyName + "Y";
        if (node && typeof node[nameX] === "function" && typeof node[nameY] === "function") {
            node[nameX](xy[0]);
            node[nameY](xy[1]);
            return;
        }
        if (this._rememberKnownPropertyForVersion6(node, propertyName, xy)) {
            return;
        }

        cc.log("CCB v6 unsupported FloatXY property '" + propertyName + "', skipping.");
    },
    onHandlePropTypeFloat:function (node, parent, propertyName, floatValue, ccbReader) {
        if (propertyName === "opacity" && node && typeof node.setOpacity === "function") {
            node.setOpacity(cc._supercatNormalizeCCBOpacity(floatValue));
            return;
        }

        //ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        // It may be a custom property, add it to custom property dictionary.
        this._customProperties.setObject(floatValue, propertyName);
        this._rememberKnownPropertyForVersion6(node, propertyName, floatValue);
    },

    onHandlePropTypeDegrees:function (node, parent, propertyName, degrees, ccbReader) {
        if (propertyName === PROPERTY_ROTATION) {
            node.setRotation(degrees);
        } else if (this._rememberKnownPropertyForVersion6(node, propertyName, degrees)) {
            return;
        } else {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },

    onHandlePropTypeFloatScale:function (node, parent, propertyName, floatScale, ccbReader) {
        if (!this._rememberKnownPropertyForVersion6(node, propertyName, floatScale)) {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },

    onHandlePropTypeInteger:function (node, parent, propertyName, integer, ccbReader) {
        if (propertyName === PROPERTY_TAG) {
            node.setTag(integer);
        } else if (this._rememberKnownPropertyForVersion6(node, propertyName, integer)) {
            return;
        } else {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },

    onHandlePropTypeIntegerLabeled:function (node, parent, propertyName, integerLabeled, ccbReader) {
        if (!this._rememberKnownPropertyForVersion6(node, propertyName, integerLabeled)) {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },

    onHandlePropTypeFloatVar:function (node, parent, propertyName, floatVar, ccbReader) {
        if (!this._rememberKnownPropertyForVersion6(node, propertyName, floatVar)) {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },

    onHandlePropTypeCheck:function (node, parent, propertyName, check, ccbReader) {
        if (propertyName === PROPERTY_VISIBLE) {
            node.setVisible(check);
        } else if (propertyName === PROPERTY_IGNOREANCHORPOINTFORPOSITION) {
            node.ignoreAnchorPointForPosition(check);
        } else if (this._rememberKnownPropertyForVersion6(node, propertyName, check)) {
            return;
        } else {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },

    onHandlePropTypeSpriteFrame:function (node, parent, propertyName, spriteFrame, ccbReader) {
        if ((propertyName === "spriteFrame" || propertyName === "displayFrame") &&
            this._setSpriteFrameIfPossible(node, spriteFrame)) {
            if (ccbReader && ccbReader._lastSpriteFrameNameV6) {
                node.__supercatCCBSpriteFrameName = ccbReader._lastSpriteFrameNameV6;
                if (ccbReader._lastSpriteFrameNameV6 === "efx_box/efx_peak.png" && node.setVisible) {
                    node.setVisible(false);
                }
            }
            return;
        }
        if (!this._rememberKnownPropertyForVersion6(node, propertyName, spriteFrame)) {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },

    onHandlePropTypeAnimation:function (node, parent, propertyName, ccAnimation, ccbReader) {
        if (!this._rememberKnownPropertyForVersion6(node, propertyName, ccAnimation)) {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },

    onHandlePropTypeTexture:function (node, parent, propertyName, ccTexture2D, ccbReader) {
        if ((propertyName === "texture" || propertyName === "png") && ccTexture2D) {
            // CocosBuilder 3 / ccbi v6 often stores a CCSprite image as a
            // Texture property instead of a SpriteFrame property. The old
            // html5 reader only remembered that value, so sprites such as
            // img_logo_super.png kept their default/previous frame. When the
            // v6 resolver returns a wrapped SpriteFrame, apply it exactly like
            // a normal display frame so the original texture rect and trimmed
            // offsets are preserved.
            if (ccTexture2D.__supercatCCBTextureFrame && ccTexture2D.spriteFrame &&
                    this._setSpriteFrameIfPossible(node, ccTexture2D.spriteFrame)) {
                this._rememberKnownPropertyForVersion6(node, propertyName, ccTexture2D);
                return;
            }

            if (node && typeof node.initWithTexture === "function" &&
                    (ccTexture2D instanceof cc.Texture2D || ccTexture2D.getContentSize)) {
                node.initWithTexture(ccTexture2D);
                this._rememberKnownPropertyForVersion6(node, propertyName, ccTexture2D);
                return;
            }

            if (node && typeof node.setTexture === "function" &&
                    (ccTexture2D instanceof cc.Texture2D || ccTexture2D.getContentSize)) {
                node.setTexture(ccTexture2D);
                this._rememberKnownPropertyForVersion6(node, propertyName, ccTexture2D);
                return;
            }
        }

        if (!this._rememberKnownPropertyForVersion6(node, propertyName, ccTexture2D)) {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },
    onHandlePropTypeByte:function (node, parent, propertyName, byteValue, ccbReader) {
        if (propertyName === "opacity" && node && typeof node.setOpacity === "function") {
            node.setOpacity(byteValue);
        } else if (!this._rememberKnownPropertyForVersion6(node, propertyName, byteValue)) {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },
    onHandlePropTypeColor3:function (node, parent, propertyName, ccColor3B, ccbReader) {
        if (propertyName === "color" && node && typeof node.setColor === "function") {
            node.setColor(ccColor3B);
            if (ccColor3B.a != null && typeof node.setOpacity === "function") {
                node.setOpacity(ccColor3B.a);
            }
        } else if (propertyName === "fontColor" && node && typeof node.setFontFillColor === "function") {
            node.setFontFillColor(ccColor3B);
        } else if (!this._rememberKnownPropertyForVersion6(node, propertyName, ccColor3B)) {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },
    onHandlePropTypeColor4FVar:function (node, parent, propertyName, ccColor4FVar, ccbReader) {
        if (!this._rememberKnownPropertyForVersion6(node, propertyName, ccColor4FVar)) {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },
    onHandlePropTypeFlip:function (node, parent, propertyName, flip, ccbReader) {
        if (!this._rememberKnownPropertyForVersion6(node, propertyName, flip)) {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },
    onHandlePropTypeBlendFunc:function (node, parent, propertyName, ccBlendFunc, ccbReader) {
        if (propertyName === "blendFunc" && this._setBlendFuncIfPossible(node, ccBlendFunc)) {
            return;
        }
        if (!this._rememberKnownPropertyForVersion6(node, propertyName, ccBlendFunc)) {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },
    onHandlePropTypeFntFile:function (node, parent, propertyName, fntFile, ccbReader) {
        if (!this._rememberKnownPropertyForVersion6(node, propertyName, fntFile)) {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },
    onHandlePropTypeString:function (node, parent, propertyName, strValue, ccbReader) {
        //ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        // It may be a custom property, add it to custom property dictionary.
        this._customProperties.setObject(strValue, propertyName);
    },
    onHandlePropTypeText:function (node, parent, propertyName, textValue, ccbReader) {
        if (!this._rememberKnownPropertyForVersion6(node, propertyName, textValue)) {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },
    onHandlePropTypeFontTTF:function (node, parent, propertyName, fontTTF, ccbReader) {
        if (!this._rememberKnownPropertyForVersion6(node, propertyName, fontTTF)) {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },
    onHandlePropTypeBlock:function (node, parent, propertyName, blockData, ccbReader) {
        if (!this._rememberKnownPropertyForVersion6(node, propertyName, blockData)) {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },
    onHandlePropTypeBlockCCControl:function (node, parent, propertyName, blockCCControlData, ccbReader) {
        ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
    },
    onHandlePropTypeCCBFile:function (node, parent, propertyName, ccbFileNode, ccbReader) {
        ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
    }
});

cc.NodeLoader.loader = function () {
    return new cc.NodeLoader();
};
