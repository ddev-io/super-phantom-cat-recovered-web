
function SCWideTitle_getWinSize() {
  if (typeof cc === "undefined") { return null; }
  var win = null;
  if (typeof vee !== "undefined" && vee.PopMgr && vee.PopMgr.winSize) {
    win = vee.PopMgr.winSize;
  }
  if ((!win || !win.width || !win.height) && cc.view && cc.view.getVisibleSize) {
    try { win = cc.view.getVisibleSize(); } catch (e0) { win = null; }
  }
  if ((!win || !win.width || !win.height) && cc.director && cc.director.getWinSize) {
    try { win = cc.director.getWinSize(); } catch (e1) { win = null; }
  }
  if ((!win || !win.width || !win.height) && cc.winSize) {
    win = cc.winSize;
  }
  if (!win || !win.width || !win.height) { return null; }

  var width = win.width;
  var height = win.height;
  if (cc.view && cc.view.getFrameSize) {
    try {
      var frame = cc.view.getFrameSize();
      if (frame && frame.width && frame.height && height) {
        width = Math.max(width, height * frame.width / frame.height);
      }
    } catch (e2) {}
  }
  if (cc.view && cc.view.getCanvasSize) {
    try {
      var canvas = cc.view.getCanvasSize();
      if (canvas && canvas.width && canvas.height && height) {
        width = Math.max(width, height * canvas.width / canvas.height);
      }
    } catch (e3) {}
  }

  // Old builds may report only the legacy design width although the real
  // window is wider. Use a conservative ultrawide fallback only for bg nodes.
  if (width / height < 2.05 && win.width / win.height > 1.90) {
    width = Math.max(width, height * 2.40);
  }
  return cc.size(Math.ceil(width), Math.ceil(height));
}

function SCWideTitle_getNodeSize(node) {
  if (!node) { return null; }
  var size = null;
  if (node.getContentSize) {
    try { size = node.getContentSize(); } catch (e0) { size = null; }
  }
  if (size && size.width > 8 && size.height > 8) { return size; }
  if (node.getBoundingBox) {
    try {
      var box = node.getBoundingBox();
      if (box && box.width > 8 && box.height > 8) { return cc.size(box.width, box.height); }
    } catch (e1) {}
  }
  return null;
}

function SCWideTitle_children(node) {
  try { return node && node.getChildren ? (node.getChildren() || []) : []; } catch (e) { return []; }
}

function SCWideTitle_isVisible(node) {
  if (!node) { return false; }
  if (node.isVisible) {
    try { return !!node.isVisible(); } catch (e0) { return true; }
  }
  return node.visible !== false;
}

function SCWideTitle_nodeHasInteractiveApi(node) {
  return !!(node && (
    node.addTargetWithActionForControlEvents ||
    node.setBackgroundSpriteForState ||
    node.setTitleForState ||
    node.setTouchEnabled ||
    node.addTouchEventListener
  ));
}

function SCWideTitle_nodeLooksLikeText(node) {
  return !!(node && (node.setString || node.getString || node.setFontSize || node.setFontName));
}

function SCWideTitle_isSolidColorLike(node) {
  return !!(node && node.setContentSize && (node.setStartColor || node.setEndColor || node.setColor));
}

function SCWideTitle_isSpriteLike(node) {
  return !!(node && (node.setTextureRect || node.getSpriteFrame || node.setSpriteFrame || node.getTexture));
}

function SCWideTitle_markExcluded(set, node) {
  if (!node || node.__scWideTitleMark) { return; }
  node.__scWideTitleMark = true;
  set.push(node);
  var children = SCWideTitle_children(node);
  for (var i = 0; i < children.length; i++) {
    SCWideTitle_markExcluded(set, children[i]);
  }
}

function SCWideTitle_collectExclusions(controller) {
  var set = [];
  if (!controller) { return set; }
  var keys = [
    "btnPlay", "btnHelp", "btnInfo", "btnGoogle", "btnSaveGame", "labSaveGame",
    "ccbEfxLogo", "nodePlayer", "playerNode", "ccbBalloon", "spL", "nodeT"
  ];
  for (var i = 0; i < keys.length; i++) {
    if (controller[keys[i]]) { SCWideTitle_markExcluded(set, controller[keys[i]]); }
  }
  for (var j = 0; j < set.length; j++) {
    if (set[j]) { set[j].__scWideTitleMark = false; }
  }
  return set;
}

function SCWideTitle_subtreeContainsAny(root, excluded) {
  if (!root) { return false; }
  for (var i = 0; i < excluded.length; i++) {
    if (root === excluded[i]) { return true; }
  }
  var children = SCWideTitle_children(root);
  for (var j = 0; j < children.length; j++) {
    if (SCWideTitle_subtreeContainsAny(children[j], excluded)) { return true; }
  }
  return false;
}

function SCWideTitle_subtreeHasUI(root, excluded, depth) {
  if (!root || depth > 10) { return false; }
  if (SCWideTitle_subtreeContainsAny(root, excluded)) { return true; }
  if (SCWideTitle_nodeHasInteractiveApi(root) || SCWideTitle_nodeLooksLikeText(root)) { return true; }
  var children = SCWideTitle_children(root);
  for (var i = 0; i < children.length; i++) {
    if (SCWideTitle_subtreeHasUI(children[i], excluded, depth + 1)) { return true; }
  }
  return false;
}

function SCWideTitle_calcCandidateScore(node, root) {
  if (!node || node === root || !SCWideTitle_isVisible(node)) { return -999999; }
  if (SCWideTitle_nodeHasInteractiveApi(node) || SCWideTitle_nodeLooksLikeText(node)) { return -999999; }

  var win = SCWideTitle_getWinSize();
  var size = SCWideTitle_getNodeSize(node);
  if (!win || !size) { return -999999; }

  var minW = Math.min(900, win.width * 0.58);
  var minH = Math.min(420, win.height * 0.55);
  if (size.width < minW || size.height < minH) { return -999999; }

  var children = SCWideTitle_children(node);
  var spriteLike = SCWideTitle_isSpriteLike(node) || SCWideTitle_isSolidColorLike(node);
  var score = size.width * size.height;
  if (spriteLike) { score += 500000; }
  if (children.length > 0) { score += 200000; }
  if (node.controller) { score += 250000; }

  // Prefer nodes that already start near the screen origin. Do not require it,
  // because CCB roots can be offset on wide screens.
  try {
    var pos = node.getPosition ? node.getPosition() : cc.p(0, 0);
    score -= Math.abs(pos.x) * 100;
    score -= Math.abs(pos.y) * 20;
  } catch (e0) {}
  return score;
}

function SCWideTitle_findBestBackgroundNode(root, controller) {
  var excluded = SCWideTitle_collectExclusions(controller);
  var best = null;
  var bestScore = -999999;

  function walk(node, depth) {
    if (!node || depth > 14) { return; }
    if (node !== root && !SCWideTitle_subtreeHasUI(node, excluded, 0)) {
      var score = SCWideTitle_calcCandidateScore(node, root);
      if (score > bestScore) {
        bestScore = score;
        best = node;
      }
    }
    var children = SCWideTitle_children(node);
    for (var i = 0; i < children.length; i++) {
      walk(children[i], depth + 1);
    }
  }

  walk(root, 0);
  return best;
}

function SCWideTitle_fitBackgroundNode(node, root) {
  if (!node || typeof cc === "undefined") { return false; }
  var win = SCWideTitle_getWinSize();
  var size = SCWideTitle_getNodeSize(node);
  if (!win || !size || !size.width || !size.height) { return false; }

  if (node.__scWideTitleBaseScaleX == null) {
    node.__scWideTitleBaseScaleX = node.getScaleX ? node.getScaleX() : (node.scaleX || 1);
    node.__scWideTitleBaseScaleY = node.getScaleY ? node.getScaleY() : (node.scaleY || 1);
    node.__scWideTitleBasePos = node.getPosition ? node.getPosition() : cc.p(0, 0);
  }

  var parent = node.getParent ? node.getParent() : root;
  var leftBottom = cc.p(0, 0);
  if (parent && parent.convertToNodeSpace) {
    try { leftBottom = parent.convertToNodeSpace(cc.p(0, 0)); } catch (e0) { leftBottom = node.__scWideTitleBasePos; }
  }

  if (node.setAnchorPoint) {
    try { node.setAnchorPoint(cc.p(0, 0)); } catch (e1) {}
  }
  if (node.setPosition) {
    try { node.setPosition(cc.p(leftBottom.x, leftBottom.y)); } catch (e2) {}
  }

  if (SCWideTitle_isSolidColorLike(node) && node.setContentSize) {
    try { node.setContentSize(cc.size(win.width, win.height)); } catch (e3) {}
    if (node.setScaleX) { node.setScaleX(1); }
    if (node.setScaleY) { node.setScaleY(1); }
    return true;
  }

  // Cover the wide screen. Background-only containers are allowed here;
  // UI-containing containers were filtered out before this point.
  var sx = Math.max(win.width / size.width, 1);
  var sy = Math.max(win.height / size.height, 1);
  if (node.setScaleX && node.setScaleY) {
    node.setScaleX(node.__scWideTitleBaseScaleX * sx);
    node.setScaleY(node.__scWideTitleBaseScaleY * sy);
  } else if (node.setScale) {
    node.setScale(node.__scWideTitleBaseScaleX * sx, node.__scWideTitleBaseScaleY * sy);
  }
  return true;
}

function SCWideTitle_fixBackground(controller) {
  if (!controller || !controller.rootNode) { return false; }
  var bg = SCWideTitle_findBestBackgroundNode(controller.rootNode, controller);
  if (bg) {
    controller.__scWideTitleBgNode = bg;
    return SCWideTitle_fitBackgroundNode(bg, controller.rootNode);
  }
  return false;
}

function SCWideTitle_scheduleBackgroundFix(controller) {
  if (!controller || !controller.rootNode) { return; }
  var fix = function () { SCWideTitle_fixBackground(controller); };
  fix();
  if (typeof vee !== "undefined" && vee.Utils && vee.Utils.scheduleOnceForTarget) {
    vee.Utils.scheduleOnceForTarget(controller, fix, 0.01);
    vee.Utils.scheduleOnceForTarget(controller, fix, 0.2);
    vee.Utils.scheduleOnceForTarget(controller, fix, 0.8);
    vee.Utils.scheduleOnceForTarget(controller, fix, 1.6);
  } else if (controller.rootNode && controller.rootNode.runAction && cc.sequence) {
    controller.rootNode.runAction(cc.sequence(cc.delayTime(0.01), cc.callFunc(fix)));
    controller.rootNode.runAction(cc.sequence(cc.delayTime(0.2), cc.callFunc(fix)));
    controller.rootNode.runAction(cc.sequence(cc.delayTime(0.8), cc.callFunc(fix)));
  }
}

// Recovered source-like JS from /mnt/data/smdis/dis/UI/lySplash.dis
// Source-like reconstruction from smdis.

var LySplash = vee.Class.extend({
  nodeT: null,
  ccbInit: function () {
    vee.PopMgr.setNodePos(this.nodeT, vee.PopMgr.PositionType.Top);
    SCWideTitle_scheduleBackgroundFix(this);
  }
});
LySplash.show = function () {
  var local0 = vee.PopMgr.popCCB(res.lyStartPage_ccbi, {
    alpha: 0
  });
  local0.controller.ccbInit();
  SCWideTitle_scheduleBackgroundFix(local0.controller);
};
