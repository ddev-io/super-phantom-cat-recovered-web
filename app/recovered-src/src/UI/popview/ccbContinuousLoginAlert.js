// Recovered source-like JS from /mnt/data/smdis/dis/UI/popview/ccbContinuousLoginAlert.dis
// Source-like reconstruction from smdis.

var ccbContinuousLoginAlert = vee.Class.extend({
  contiunsDays: 0,
  ccbSignNode_1: null,
  ccbSignNode_2: null,
  ccbSignNode_3: null,
  ccbSignNode_4: null,
  ccbParticleCoin: null,
  init: function (arg0) {
    this._tempControllerState = vee.Controller.cacheControllerState();
    if (game.Data.zqdebug || (arg0 < 4 && vee.dataManager.isSuccessContinuousLogin())) {
      game.LevelData.addCoin(arg0 * 50);
      this.ccbParticleCoin.setVisible(true);
      this.ccbParticleCoin.setEmissionRate(100 * arg0);
      this.playAnimate("show_coin", function () {
        game.Data.oLvSelectCtl.refreshCoin();
        this.initController();
      }.bind(this));
    } else {
      this.ccbParticleCoin.setVisible(false);
      this.playAnimate("show", function () {
        this.initController();
      }.bind(this));
    }
    cc.log("zq debug ccbContinuousLoginAlert =====%d", arg0);
    for (var local0 = 0; local0 < 4; local0++) {
      var signNode = this["ccbSignNode_" + (local0 + 1)];
      if (local0 == arg0 - 1) {
        if (local0 == 3) {
          signNode.animationManager.setCompletedAnimationCallback(this, function () {
            this.playAnimate("get");
          }.bind(this));
        }
        signNode.animationManager.runAnimationsForSequenceNamedTweenDuration("show", 0, false);
      } else if (local0 < arg0) {
        signNode.animationManager.runAnimationsForSequenceNamedTweenDuration("on", 0, false);
      } else {
        signNode.animationManager.runAnimationsForSequenceNamedTweenDuration("normal", 0, false);
      }
    }
  },
  initController: function () {
    vee.Controller.clearAllButtonAction();
    vee.Controller.registerButtonAction(vee.KeyCode.BUTTON_B, this.onClose.bind(this));
    vee.Controller.activeButton();
  },
  onClose: function () {
    if (this._isOver) {
      return undefined;
    }
    this._isOver = true;
    vee.Controller.reviveControllerState(this._tempControllerState);
    this.playAnimate("hide", function () {
      vee.PopMgr.closeLayerByCtl(this);
    }.bind(this));
  }
});
ccbContinuousLoginAlert.show = function (arg0) {
  var local0 = vee.PopMgr.popCCB(res.dailyMission_ccbi, {
    alpha: 0
  });
  local0.controller.init(arg0);
};
