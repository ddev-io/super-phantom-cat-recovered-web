// Recovered source-like JS from /mnt/data/smdis/dis/levelController/levelMini200.dis
// Source-like reconstruction from smdis.

LevelController.LevelMini200 = LevelController.extend({
  eventStory1: function (arg0) {
    this.showStory(1, arg0, (((((("RemoveEnemy;MoveCamera,35,25,2;SelectNpc;FaceTo,left;ShowDialog," + vee.Utils.getLocalizedStringForKey("Well done! You survived.", "\u5e72\u7684\u4e0d\u9519\uff0c\u4f60\u8fd8\u6d3b\u7740\u3002")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("But don't lose your attention!", "\u522b\u653e\u677e\u8b66\u60d5\uff01")) + ";HideDialog;TimeLine,huxi_2;Delay,1;AddCoin,") + vee.Utils.getObjByPlatform("400", "700", "400")) + ";Delay,2;GameOver"));
  }
});
