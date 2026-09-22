// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/levelController/level236.dis
LevelController.Level236 = LevelController.extend({
  eventStory1: function (arg0) {
    this.showStory(1, arg0, (((((("SelectNpc,Flash;FaceTo,left;MoveCamera,48,20,2;ShowDialog," + vee.Utils.getLocalizedStringForKey("Well...", "\u54e6\u2026\u2026")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("Look, there's a new kind of sprite.", "\u770b\uff0c\u90a3\u91cc\u6709\u4e2a\u65b0\u79cd\u7c7b\u7684\u7cbe\u7075\u3002")) + ";HideDialog;MoveCamera,43,17,2;Delay,1;MoveCamera,48,20,2;ShowDialog,") + vee.Utils.getLocalizedStringForKey("Try it, you might find something interesting!", "\u8bd5\u8bd5\u770b\uff0c\u4f1a\u5f88\u6709\u8da3\u7684\u54e6\uff01")) + ";HideDialog;MoveRole,59,20;ResetRole,86,23"));
  },
  skip1: function () {
    cc.log("skip 1 called!");
    this.skipStory(2);
    this.skipStory(3);
  },
  eventStory2: function (arg0) {
    this.showStory(2, arg0, (((((("SelectNpc,Flash;FaceTo,left;MoveCamera,83,23,1.5;ShowDialog," + vee.Utils.getLocalizedStringForKey("Okay, I'm trapped!", "\u597d\u5427\uff0c\u6211\u5c45\u7136\u88ab\u56f0\u4f4f\u4e86\u2026\u2026")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("I need your help!", "\u5e2e\u6211\u4e00\u628a\uff01")) + ";HideDialog;MoveCamera,90,12,2;Delay,1;MoveCamera,83,23,2;ShowDialog,") + vee.Utils.getLocalizedStringForKey("Use your new power!", "\u4f7f\u7528\u4f60\u7684\u65b0\u80fd\u529b\uff01")) + ";HideDialog"));
  },
  skip2: function () {
    cc.log("skip 2 called!");
    this.skipStory(3);
    this.blockStory(3, true);
  },
  eventStory3: function (arg0) {
    this.showStory(3, arg0, (((("SelectNpc,Flash;FaceTo,left;MoveCamera,85,24,2;ShowDialog," + vee.Utils.getLocalizedStringForKey("Well done!", "\u5e72\u7684\u4e0d\u9519\uff01")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("Use your new power wisely!", "\u8981\u6d3b\u7528\u4f60\u7684\u65b0\u80fd\u529b\u54e6\uff01")) + ";HideDialog;MoveRole,87,23;Jump,89,26;MoveRole,93,26;RemoveRole"));
  },
  skip3: function () {
    cc.log("skip 3 called!");
  }
});
