// Recovered source-like JS from /mnt/data/smdis/dis/levelController/level230.dis
// Source-like reconstruction from smdis.

LevelController.Level230 = LevelController.extend({
  eventStory1: function (arg0) {
    this.showStory(1, arg0, (((((((("SelectNpc,Flash;FaceTo,left;MoveCamera,62,12,1.5;ShowDialog," + vee.Utils.getLocalizedStringForKey("You made it!", "\u563f\uff0c\u4f60\u603b\u7b97\u8fc7\u6765\u4e86\u3002")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("Look, there's a sprite.", "\u770b\uff0c\u8fd9\u91cc\u6709\u4e2a\u7cbe\u7075\uff0c")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("Sprite is the superpower within this phantom world.", "\u7cbe\u7075\u4eec\u662f\u5e7b\u5f71\u4e16\u754c\u7684\u8d85\u80fd\u91cf\u3002")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("Take this with you to use its magical powers.", "\u5e26\u4e0a\u5b83\u5427\uff0c\u8fd9\u6837\u4f60\u5c31\u53ef\u4ee5\u4f7f\u7528\u7cbe\u7075\u7684\u80fd\u529b\u4e86\u3002")) + ";HideDialog"));
  },
  skip1: function () {
    cc.log("skip 1 called!");
    this.skipStory(2);
  },
  eventStory2: function (arg0) {
    this.showStory(2, arg0, (((("SelectNpc,Flash;FaceTo,right;MoveCamera,68,12,1.5;Trigger,77,6;ShowDialog," + vee.Utils.getLocalizedStringForKey("Nice, You opened up a new shortcut!", "\u592a\u68d2\u4e86\uff0c\u4f60\u6253\u5f00\u4e86\u4e00\u4e2a\u65b0\u7684\u901a\u9053\uff01")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("Come on, let's go!", "\u6211\u4eec\u8d70\u5427\uff0c\u6211\u5728\u524d\u9762\u7b49\u4f60\u3002")) + ";HideDialog;MoveCamera,70,16,0.35;Jump,66,15;Jump,69,18;MoveCamera,75,17,1;MoveRole,85,18;Jump,88,16;RemoveRole"));
  },
  skip2: function () {
    cc.log("skip 2 called!");
  },
  _event1Over: false,
  eventCustomController: function () {
    if (this._event1Over) {
      return undefined;
    }
    this._event1Over = true;
    if (vee.Controller.isControllerControlling) {
      return undefined;
    }
    vee.PopMgr.alert(vee.Utils.getLocalizedStringForKey("Do you want to change the position or size of control button?"), vee.Utils.getLocalizedStringForKey("Custom Controller"), function () {
      LyPosSetting.show();
    });
  }
});
