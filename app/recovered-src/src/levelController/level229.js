// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/levelController/level229.dis
LevelController.Level229 = LevelController.extend({
  eventStory1: function (arg0) {
    this.showStory(1, arg0, (((((("SelectNpc,Flash;FaceTo,left;MoveCamera,20,10,2;ShowDialog," + vee.Utils.getLocalizedStringForKey("Welcome to the Phantom World!", "\u6b22\u8fce\u6765\u5230\u5e7b\u5f71\u4e16\u754c\uff01")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("Let me show you some interesting things.", "\u6211\u5e26\u4f60\u53bb\u770b\u770b\u6709\u54ea\u4e9b\u597d\u73a9\u7684\u4e1c\u897f\u5427~")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("Follow me!", "\u8d70\uff0c\u8ddf\u6211\u6765\u3002")) + ";HideDialog;MoveCamera,25,10,1.5;FaceTo,right;MoveRole,25,10;Jump,29,11;MoveRole,30,11;Jump,33,9;MoveRole,34,9;ResetRole,105,18"));
  },
  skip1: function () {
    cc.log("skip 1 called!");
    this.skipStory(2);
  },
  eventStory2: function (arg0) {
    this.showStory(2, arg0, (((("SelectNpc,Flash;ResetRole,105,18;FaceTo,left;MoveCamera,102,18,1.5;ShowDialog," + vee.Utils.getLocalizedStringForKey("Not bad!", "\u4e0d\u8d56\u561b\uff01")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("Come here!", "\u5f80\u8fd9\u513f\u8d70\u3002")) + ";HideDialog;FaceTo,right;MoveRole,107,18;Jump,110,19;MoveRole,113,19;RemoveRole"));
  },
  skip2: function () {
    cc.log("skip 2 called!");
  }
});
