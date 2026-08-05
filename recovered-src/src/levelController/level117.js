// Recovered source-like JS from /mnt/data/smdis/dis/levelController/level117.dis
// Source-like reconstruction from smdis.

LevelController.Level117 = LevelController.extend({
  prepare: function () {
    this._story = [];
    game.Data.gameStartTime = new Date().getTime();
    new Date().getTime();
  },
  complete: function () {
    var local0 = new Date().getTime();
    var local1 = (local0 - game.Data.gameStartTime);
    local1 = Math.floor((local1 / 1000));
    if ((local1 < 60)) {
      vee.GameCenter.unlockAchievement(5);
    }
  },
  eventStory1: function (arg0) {
    this.showStory(1, arg0, (((((((((((((("SelectNpc,Flash;FaceTo,left;MoveCamera,46,14,2;ShowDialog," + vee.Utils.getLocalizedStringForKey("Take it easy.", "\u6162\u70b9\uff01")) + ";HideDialog;MoveRole,49,14;ShowDialog,") + vee.Utils.getLocalizedStringForKey("Notice the cliff, you can't jump over it.", "\u8fd9\u4e2a\u60ac\u5d16\u592a\u8fdc\u4e86\uff0c\u4f60\u8df3\u4e0d\u8fc7\u6765\u7684\u3002")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("Okay", "\u55ef\u2026\u2026")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("The terrain seems so fragile there!", "\u4e0d\u8fc7\u8fd9\u4e00\u5e26\u7684\u5730\u5757\u4f3c\u4e4e\u5f88\u8106\u5f31\u3002")) + ";HideDialog;Trigger,50,16;Trigger,51,16;MoveCamera,44,17,1;Delay,1;MoveCamera,46,14,1;ShowDialog,") + vee.Utils.getLocalizedStringForKey("Take it with you, it might help you!", "\u5e26\u4e0a\u8fd9\u4e2a\u7cbe\u7075\u5427\uff0c\u4f1a\u6709\u5e2e\u52a9\u7684\u3002")) + ";HideDialog;Trigger,55,15;MoveCamera,42,14,1;ShowDialog,") + vee.Utils.getLocalizedStringForKey("Come over here, hurry!", "\u8d76\u7d27\u8fc7\u6765\u5427\uff01")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("I will wait for you there!", "\u6211\u5728\u524d\u9762\u7b49\u4f60~")) + ";HideDialog;MoveRole,54,14;ResetRole,69,14"));
  },
  skip1: function () {
    cc.log("skip 1 called!");
  },
  eventStory2: function (arg0) {
    this.showStory(2, arg0, (((((("SelectNpc,Flash;FaceTo,right;ResetRole,95,25;MoveCamera,94,28,1.0;Jump,97,28;Jump,99,33;FaceTo,left;MoveCamera,97,33,1.0;ShowDialog," + vee.Utils.getLocalizedStringForKey("Ah, here you are!", "\u554a\uff0c\u4f60\u4e5f\u5230\u4e86\u554a\u3002")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("I'm faster than you.", "\u6211\u6bd4\u4f60\u5feb\uff0c")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("I've gotta go now,I can't wait any longer!", "\u5148\u8d70\u5566\uff0c\u4e0d\u7b49\u4f60\u4e86~")) + ";HideDialog;MoveRole,106,33;RemoveRole"));
    this.blockStory(3, true);
  },
  skip2: function () {
    cc.log("skip 2 called!");
    this.skipStory(3);
    this.blockStory(3, true);
  },
  eventStory3: function (arg0) {
    this.showStory(3, arg0, (((((("SelectNpc,Flash;FaceTo,left;MoveCamera,67,13,1.0;ShowDialog," + vee.Utils.getLocalizedStringForKey("Cool, never thought that you could go that far.", "\u5389\u5bb3\uff0c\u6211\u4ece\u672a\u6599\u5230\u4f60\u53ef\u4ee5\u6765\u5230\u8fd9\u91cc\uff01")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("I'm counting on you\uff01", "\u6211\u5f88\u770b\u597d\u4f60\u7684\uff01")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("Keep going on!", "\u8981\u52a0\u6cb9\u54e6~")) + ";HideDialog;Delay,1"));
    this.blockStory(2, true);
  },
  skip3: function () {
    cc.log("skip 3 called!");
    this.skipStory(2);
    this.blockStory(2, true);
  }
});
