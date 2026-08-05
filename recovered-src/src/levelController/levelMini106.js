// Recovered source-like JS from /mnt/data/smdis/dis/levelController/levelMini106.dis
// Source-like reconstruction from smdis.

LevelController.LevelMini106 = LevelController.extend({
  eventStory1: function (arg0) {
    this.showStory(1, arg0, (((((("RemoveEnemy;MoveCamera,21,7,1;SelectNpc;ShowDialog," + vee.Utils.getLocalizedStringForKey("Good Job -- but this isn't enough.", "\u8fd8\u4e0d\u9519\uff0c\u4f46\u662f\u8fd8\u4e0d\u591f\u3002")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("Try to catch me next time!", "\u4e0b\u6b21\u518d\u6765\u5c1d\u8bd5\u6293\u4f4f\u6211\u5427\uff01")) + ";HideDialog;TimeLine,huxi_2;Delay,1;AddCoin,") + vee.Utils.getObjByPlatform("700", "900", "700")) + ";Delay,2;GameOver"));
  }
});
