// Recovered source-like JS from /mnt/data/smdis/dis/UI/dialog.dis
// Source-like reconstruction from smdis.

var UIDialog = vee.Class.extend({
  lbDialogContent: null,
  nodeRole: null,
  btnNext: null,
  _ready: false,
  _isOver: false,
  _soundData: null,
  ccbInit: function () {
    vee.Controller.registerGlobalButtonAction(this.onNext.bind(this));
  },
  onExit: function () {
    UIDialog.ctl = null;
  },
  showDialog: function (arg0) {
    if (this._ready) {
      this.lbDialogContent.setString(arg0);
    } else {
      this.rootNode.setVisible(true);
      var local0 = cc.BuilderReader.load(Story.selectedNPC.ccbName);
      local0.controller.playAnimate("huxi_1");
      this._soundData = game.RoleSoundData[Story.selectedNPC.npcname];
      this.nodeRole.addChild(local0);
      this.lbDialogContent.setString(arg0);
      this.playAnimate("show", function () {
        this._ready = true;
      }.bind(this));
    }
    this.showRoleVoice();
  },
  showRoleVoice: function () {
    var local0 = vee.Utils.randomInt(1, this._soundData.soundIdxRange);
    var local1 = (((("res/inGame_character_" + this._soundData.soundFileCharacterName) + "_") + local0) + ".mp3");
    vee.Audio.playEffect(local1);
  },
  hideDialog: function () {
    vee.Controller.clearGlobalButtonAction();
    this._isOver = true;
    this.playAnimate("out", function () {
      vee.PopMgr.closeLayerByCtl(UIDialog.ctl);
      UIDialog.ctl = null;
      if (!(Story.isSkip)) {
        Story.showNext();
      }
    });
  },
  onNext: function () {
    if (((!(this._ready)) || (this._isOver))) {
      return undefined;
    }
    Story.showNext();
  }
});
UIDialog.ctl = null;
UIDialog.show = function (arg0) {
  if (UIDialog.ctl) {
    UIDialog.ctl.showDialog(arg0);
  } else {
    var local0 = vee.PopMgr.popCCB(res.guideDialog_ccbi);
    local0.setVisible(false);
    local0.controller.ccbInit();
    local0.controller.showDialog(arg0);
    UIDialog.ctl = local0.controller;
  }
};
UIDialog.hide = function () {
  if (UIDialog.ctl) {
    UIDialog.ctl.hideDialog();
  }
};
