// Recovered source-like JS from /mnt/data/smdis/dis/UI/lySpecial.dis
// Source-like reconstruction from smdis.

var LySpecial = vee.Class.extend({
  lbTitle: null,
  lbContent: null,
  lbDetail: null,
  btnConfirm: null,
  btnClose: null,
  btnRewardCoin: null,
  spHead: null,
  _isOver: false,
  _tempControllerState: null,
  onCreate: function () {
    game.Data.resetMiniCount();
  },
  ccbInit: function () {
    this.playAnimate("OPEN");
    var local0 = null;
    var local1 = game.AvatarData.getNextAvatar(0, true);
    if (local1) {
      local0 = local1.headName;
    } else {
      var local2 = {'type': 'arr', 'items': ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']};
      var local3 = game.AvatarData.getCurrentAvatar().idx;
      local2.splice(local3, 1);
      local1 = game.AvatarData.getAvatarData(vee.Utils.randomChoice(local2));
      local0 = local1.headName;
    }
    this.spHead.setTexture(local0);
    this.handleKey(true);
    this._tempControllerState = vee.Controller.cacheControllerState();
    vee.Controller.cacheControllerState();
  },
  initController: function () {
    vee.Controller.initSelector(1, 1, this.onClose.bind(this), cc.p(0, 0));
    vee.Controller.registerItemByButton(this.btnConfirm, cc.p(0, 0), this.onConfirm.bind(this), "res/mfi_btn_on_210.png");
    vee.Controller.activeSelector();
  },
  onKeyBack: function () {
    this.onClose();
    return true;
  },
  onConfirm: function () {
    if (this._isOver) {
      return undefined;
    }
    this._isOver = true;
    vee.Controller.deactiveSelector();
    game.Data.resetMiniCount();
    cc.log(("mini count = " + game.Data.getMiniCount()));
    this.playAnimate("HIDE", function () {
      game.Data.oLyGameOver.showMini();
      vee.PopMgr.closeLayer();
    }.bind(this));
  },
  onRewardCoin: function () {

  },
  onClose: function () {
    if (this._isOver) {
      return undefined;
    }
    this._isOver = true;
    vee.Controller.deactiveSelector();
    this.playAnimate("HIDE", function () {
      vee.Controller.reviveControllerState(this._tempControllerState);
      vee.PopMgr.closeLayer();
    });
    game.Data.oLyGameOver.blockButton = false;
  }
});
LySpecial.show = function () {
  var local0 = vee.PopMgr.popCCB(res.vAlertboxChallenge_ccbi, {
    alpha: 0
  });
  local0.controller.ccbInit();
  vee.Audio.playEffect(res.inGame_function_bonusEntrance_mp3);
};
