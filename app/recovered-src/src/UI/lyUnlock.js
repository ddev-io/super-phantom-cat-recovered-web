// Recovered source-like JS from /mnt/data/smdis/dis/UI/lyUnlock.dis
// Source-like reconstruction from smdis.

var LyUnlock = vee.Class.extend({
  nodePlayer: null,
  btnSwitch: null,
  _isOver: false,
  _idx: null,
  _tempSelectorState: null,
  _callback: null,
  ccbInit: function () {
    this.playAnimate("open");
    this.handleKey(true);
    this._tempSelectorState = vee.Controller.cacheControllerState();
    vee.Controller.cacheControllerState();
  },
  initController: function () {
    vee.Controller.initSelector(1, 1, null, cc.p(0, 0));
    vee.Controller.registerItemByButton(this.btnSwitch, cc.p(0, 0), this.onSwitch.bind(this), "res/mfi_btn_on_210.png");
    vee.Controller.activeSelector();
  },
  onKeyBack: function () {
    this.onSwitch();
    return true;
  },
  setIdx: function (arg0) {
    this._idx = arg0;
    var local0 = game.AvatarData.getAvatarData(arg0);
    var local1 = ElePlayer.create(local0.role);
    this.nodePlayer.addChild(local1.container);
    local1.controller.playAnimate("huxi_1");
  },
  setCallback: function (arg0) {
    this._callback = arg0;
  },
  onSwitch: function () {
    if (this._isOver) {
      return undefined;
    }
    this._isOver = true;
    vee.Controller.deactiveSelector();
    game.AvatarData.avatarSelected(this._idx);
    LyAvatarStore.refreshState();
    this.playAnimate("hide", function () {
      vee.Controller.reviveControllerState(this._tempSelectorState);
      vee.PopMgr.closeLayer();
      if (game.Data.oLyGameOver) {
        game.Data.oLyGameOver.blockButton = false;
      }
      if (this._callback) {
        this._callback();
      }
    }.bind(this));
  }
});
LyUnlock.show = function (arg0, arg1) {
  var local0 = vee.PopMgr.popCCB(res.vGameOverUnlock_ccbi, {
    alpha: 0
  });
  local0.controller.ccbInit();
  local0.controller.setIdx(arg0);
  local0.controller.setCallback(arg1);
  vee.Audio.playEffect(res.inGame_function_unlockAvator_mp3);
};
