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

cc.getAbsolutePosition = function(pt, type, containerSize, propName){
    var absPt = cc.p(0,0);
    if(type === CCB_POSITIONTYPE_RELATIVE_BOTTOM_LEFT)
        absPt = pt;
    else if(type === CCB_POSITIONTYPE_RELATIVE_TOP_LEFT){
        absPt.x = pt.x;
        absPt.y = containerSize.height - pt.y;
    } else if(type === CCB_POSITIONTYPE_RELATIVE_TOP_RIGHT){
        absPt.x = containerSize.width - pt.x;
        absPt.y = containerSize.height - pt.y;
    } else if (type === CCB_POSITIONTYPE_RELATIVE_BOTTOM_RIGHT) {
        absPt.x = containerSize.width - pt.x;
        absPt.y = pt.y;
    } else if (type === CCB_POSITIONTYPE_PERCENT) {
        absPt.x = (containerSize.width * pt.x / 100.0);
        absPt.y = (containerSize.height * pt.y / 100.0);
    } else if (type === CCB_POSITIONTYPE_MULTIPLY_RESOLUTION) {
        var resolutionScale = cc.BuilderReader.getResolutionScale();
        absPt.x = pt.x * resolutionScale;
        absPt.y = pt.y * resolutionScale;
    }

    return absPt;
};

cc._getAbsolutePosition = function(x, y, type, containerSize, propName){
    var absPt = cc.p(0,0);
    if(type === CCB_POSITIONTYPE_RELATIVE_BOTTOM_LEFT){
        absPt.x = x;
        absPt.y = y;
    } else if(type === CCB_POSITIONTYPE_RELATIVE_TOP_LEFT){
        absPt.x = x;
        absPt.y = containerSize.height - y;
    } else if(type === CCB_POSITIONTYPE_RELATIVE_TOP_RIGHT){
        absPt.x = containerSize.width - x;
        absPt.y = containerSize.height - y;
    } else if (type === CCB_POSITIONTYPE_RELATIVE_BOTTOM_RIGHT) {
        absPt.x = containerSize.width - x;
        absPt.y = y;
    } else if (type === CCB_POSITIONTYPE_PERCENT) {
        absPt.x = (containerSize.width * x / 100.0);
        absPt.y = (containerSize.height * y / 100.0);
    } else if (type === CCB_POSITIONTYPE_MULTIPLY_RESOLUTION) {
        var resolutionScale = cc.BuilderReader.getResolutionScale();
        absPt.x = x * resolutionScale;
        absPt.y = y * resolutionScale;
    }
    return absPt;
};

cc._getAbsolutePositionV6 = function (x, y, positionType, containerSize, propName) {
    if (!positionType || !positionType.__supercatCCBPositionV6) {
        return cc._getAbsolutePosition(x, y, positionType, containerSize, propName);
    }

    containerSize = containerSize || cc.size(0, 0);

    function resolveComponent(value, unit, size) {
        if (unit === 0) {
            return value;
        }
        if (unit === 1) {
            return value * cc.BuilderReader.getResolutionScale();
        }
        if (unit === 2) {
            return size * value;
        }

        cc.log("Unsupported CCB v6 position unit " + unit + ", falling back to points.");
        return value;
    }

    var corner = positionType.corner || 0;
    var absX = resolveComponent(x, positionType.xUnit || 0, containerSize.width);
    var absY = resolveComponent(y, positionType.yUnit || 0, containerSize.height);

    if (corner === CCB_POSITIONTYPE_RELATIVE_TOP_RIGHT ||
            corner === CCB_POSITIONTYPE_RELATIVE_BOTTOM_RIGHT) {
        absX = containerSize.width - absX;
    }
    if (corner === CCB_POSITIONTYPE_RELATIVE_TOP_LEFT ||
            corner === CCB_POSITIONTYPE_RELATIVE_TOP_RIGHT) {
        absY = containerSize.height - absY;
    }

    return cc.p(absX, absY);
};

cc.setRelativeScale = function(node,scaleX, scaleY, type, propName){
    if(!node)
        throw new Error("cc.setRelativeScale(): node should be non-null");

    if (type === CCB_POSITIONTYPE_MULTIPLY_RESOLUTION) {
        var resolutionScale = cc.BuilderReader.getResolutionScale();

        scaleX *= resolutionScale;
        scaleY *= resolutionScale;
    }

    node.setScaleX(scaleX);
    node.setScaleY(scaleY);
};
