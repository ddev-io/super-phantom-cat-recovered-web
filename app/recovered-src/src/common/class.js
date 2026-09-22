// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/common/class.dis
var vee = vee || {};
vee.Class = cc.Class.extend({
  _rootNode_onEnter: null,
  _rootNode_onExit: null,
  onDidLoadFromCCB: function () {
    this._rootNode_onEnter = this.rootNode.onEnter;
    this._rootNode_onExit = this.rootNode.onExit;
    this.rootNode.onEnter = this._onEnter.bind(this);
    this.rootNode.onExit = this._onExit.bind(this);
    if (this.rootNode.animationManager) {
      this.rootNode.animationManager.setCompletedAnimationCallback(this._animationCompleted.bind(this));
    }
    this.onCreate();
  },
  onCreate: function () {
  },
  onLoaded: function () {
  },
  onClosed: function () {
  },
  onExit: function () {
  },
  onEnter: function () {
  },
  _onEnter: function () {
    this._rootNode_onEnter.call(this.rootNode);
    this.onEnter();
  },
  _onExit: function () {
    this.onExit();
    this.handleKey(false);
    if (this.rootNode.animationManager) {
      this.rootNode.animationManager.setCompletedAnimationCallback(function () {
      });
    }
    this._rootNode_onExit.call(this.rootNode);
  },
  _isAnimating: false,
  isAnimating: function () {
    return this._isAnimating;
  },
  _animationName: null,
  getLastAnimationName: function () {
    return this._animationName;
  },
  _animationCompleted: function () {
    this._isAnimating = false;
    if (this._animationCallback) {
      this._animationCallback();
    }
  },
  _animationCallback: null,
  playAnimate: function (arg0, arg1, arg2, arg3) {
    if (arg2 === undefined) {
      arg2 = true;
    }
    if (arg3 === undefined) {
      arg3 = 0;
    }

    this._animationCallback = arg1;
    this._isAnimating = true;
    this._animationName = arg0;

    var local0 = this.rootNode && this.rootNode.animationManager;
    if (!local0) {
      cc.log("missing animation manager: " + arg0);
      this._isAnimating = false;
      if (this._animationCallback) {
        this._animationCallback();
      }
      return undefined;
    }

    local0.setCompletedAnimationCallback(this, this._animationCompleted.bind(this));

    if (local0.runAnimationsForSequenceNamedTweenDuration) {
      local0.runAnimationsForSequenceNamedTweenDuration(arg0, arg3, arg2);
      return undefined;
    }

    if (local0._getSequenceId && local0.runAnimationsForSequenceIdTweenDuration) {
      var local1 = local0._getSequenceId(arg0);
      if (local1 !== -1 && local1 !== undefined && local1 !== null) {
        local0.runAnimationsForSequenceIdTweenDuration(local1, arg3, arg2);
        return undefined;
      }
    }

    cc.log("missing animation sequence: " + arg0);
    this._isAnimating = false;
    if (this._animationCallback) {
      this._animationCallback();
    }
    return undefined;
  },
  onKeyMenu: function () {
    cc.log("implement controller's onKeyMenu function to support menu key");
    return false;
  },
  onKeyBack: function () {
    cc.log("implement controller's onKeyBack function to support back key");
    return false;
  },
  onKeyPressed: function () {
    return false;
  },
  onKeyReleased: function () {
    return false;
  },
  _keyListener: null,
  handleKey: function (arg0) {
    var localThis = this;
    if (!arg0 && this._keyListener) {
      cc.eventManager.removeListener(this._keyListener);
      this._keyListener = null;
      return;
    }
    if (this._keyListener) {
      this.handleKey(false);
    }
    this._keyListener = cc.EventListener.create({
      event: cc.EventListener.KEYBOARD,
      onKeyPressed: function (key, event) {
        var handled = localThis.onKeyPressed(key);
        if (handled) {
          event.stopPropagation();
        }
        return handled;
      },
      onKeyReleased: function (key, event) {
        var handled = localThis.onKeyReleased(key);
        if (key === cc.KEY.back) {
          handled = localThis.onKeyBack();
        } else if (key === cc.KEY.menu) {
          handled = localThis.onKeyMenu();
        }
        if (handled) {
          event.stopPropagation();
        }
        return handled;
      }
    });
    cc.eventManager.addListener(this._keyListener, this.rootNode);
  }
});
