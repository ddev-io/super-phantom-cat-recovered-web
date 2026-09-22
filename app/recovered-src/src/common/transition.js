// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/common/transition.dis
var VeeTransition = vee.Class.extend({
  _in: function () {
    var callback = arguments[0];
    this.playAnimate("out", function () {
      this.rootNode.removeFromParent();
      if (callback) {
        callback();
      }
    }.bind(this));
  },
  _out: function () {
    var callback = arguments[0];
    this.playAnimate("in", function () {
      this.rootNode.removeFromParent();
      if (callback) {
        callback();
      }
    }.bind(this));
  },
  _performInOut: function () {
    var midwayCallback = arguments[0];
    var delay = arguments[1];
    var doneCallback = arguments[2];
    this.playAnimate("in", function () {
      this.rootNode.runAction(cc.sequence(
        cc.delayTime(delay),
        cc.callFunc(function () {
          if (midwayCallback) {
            midwayCallback();
          }
          this._in(doneCallback);
        }.bind(this))
      ));
    }.bind(this));
  }
});
var vee = vee || {};
vee.Transition = {};
vee.Transition.pop = function (arg0, arg1) {
    var local0 = cc.BuilderReader.load(arg0);
    var local1 = cc.LayerGradient.create(cc.color(0, 0, 0, 150), cc.color(0, 0, 0, 150));
    local1.setOpacity(0);
    cc.eventManager.addListener({
      event: cc.EventListener.TOUCH_ONE_BY_ONE,
      swallowTouches: true,
      onTouchBegan: function () {
        return true;
      }
    }, local1);
    local0.addChild(local1);
    vee.PopMgr.rootNode.addChild(local0);
    if (arg1) {
      local0.setPosition(arg1);
    } else {
      vee.PopMgr.setNodePos(local0, vee.PopMgr.PositionType.Center, cc.p(0, 0), true);
    }
    return local0;
  };
vee.Transition.in = function (arg0, arg1, arg2) {
    var local0 = this.pop(arg0, arg2);
    local0.controller._in(arg1);
  };
vee.Transition.out = function (arg0, arg1, arg2) {
    var local0 = this.pop(arg0, arg2);
    local0.controller._out(arg1);
  };
vee.Transition.perform = function (arg0, arg1, arg2, arg3) {
    if (!arg2) {
      arg2 = 0;
    }
    var local0 = this.pop(arg0);
    local0.controller._performInOut(arg1, arg2, arg3);
  };
