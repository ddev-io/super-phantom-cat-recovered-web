// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/levelController/level231.dis
LevelController.Level231 = LevelController.extend({
  eventStory1: function (arg0) {
    this.showStory(1, arg0, (((((((((("SelectNpc,Flash;FaceTo,left;MoveCamera,21,18,1.5;ShowDialog," + vee.Utils.getLocalizedStringForKey("You made it! It seems like you\u2019re already getting used to the Phantom World.", "\u4f60\u8fc7\u6765\u4e86\u554a\uff0c\u770b\u6765\u4f60\u5df2\u7ecf\u4e60\u60ef\u4e86\u5e7b\u5f71\u4e16\u754c\u3002")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("But you'd better watch out!", "\u4e0d\u8fc7\u8fd8\u662f\u8981\u5c0f\u5fc3\u70b9\uff0c")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("Be careful not to fall off the platforms or you will lose the game!", "\u770b\uff0c\u4ece\u8fd9\u91cc\u6389\u4e0b\u53bb\u5c31\u4f1a\u5931\u8d25\u54e6\u3002")) + ";HideDialog;MoveCamera,21,21,0.75;Delay,1.5;MoveCamera,21,18,0.75;ShowDialog,") + vee.Utils.getLocalizedStringForKey("Take care, buddy!", "\u603b\u4e4b\uff0c\u5c0f\u5fc3\u70b9\u5427\uff0c")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("I gotta go, catch you later, buddy!", "\u6211\u5148\u8d70\u5566\uff0c\u8ddf\u8fc7\u6765\u54e6\uff01")) + ";FaceTo,right;HideDialog;MoveRole,24,18;Jump,27,17;MoveRole,30,17;Jump,33,16;RemoveRole"));
  },
  skip1: function () {
    cc.log("skip 1 called!");
  }
});
