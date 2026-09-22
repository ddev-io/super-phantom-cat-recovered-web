// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/levelController/level222.dis
LevelController.Level222 = LevelController.extend({
  eventStory1: function (arg0) {
    this.showStory(1, arg0, (((((((("SelectNpc,Flash;FaceTo,left;MoveCamera,87,24,2;ShowDialog," + vee.Utils.getLocalizedStringForKey("Hey!", "\u563f\uff01")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("Here's a different sprite!", "\u8fd9\u513f\u6709\u4e2a\u4e0d\u4e00\u6837\u7684\u5c0f\u7cbe\u7075\uff0c")) + ";HideDialog;MoveCamera,90,23,1;ShowDialog,") + vee.Utils.getLocalizedStringForKey("It can make you more powerful !", "\u5b83\u53ef\u4ee5\u7ed9\u4f60\u5168\u65b0\u7684\u529b\u91cf\u3002")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("Try it!", "\u5feb\u8bd5\u8bd5\u770b\u5427~")) + ";HideDialog"));
  },
  skip1: function () {
    cc.log("skip 1 called!");
    this.skipStory(2);
  },
  eventStory2: function (arg0) {
    this.showStory(2, arg0, (((((("Trigger,83,27;SelectNpc,Flash;FaceTo,left;MoveCamera,85,31,1.5;Delay,0.5;MoveCamera,85,26,2;ShowDialog," + vee.Utils.getLocalizedStringForKey("Amazing!", "\u592a\u68d2\u4e86\uff0c")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("Here is a secret path!", "\u8fd9\u91cc\u6709\u4e00\u6761\u9690\u85cf\u7684\u901a\u9053\u3002")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("We can walk through it!", "\u6211\u4eec\u53ef\u4ee5\u4ece\u8fd9\u91cc\u8d70\uff01")) + ";HideDialog;MoveRole,90,25;Jump,87,28;MoveRole,82,28;Jump,82,33,1;RemoveRole"));
  },
  skip2: function () {
    cc.log("skip 2 called!");
  }
});
