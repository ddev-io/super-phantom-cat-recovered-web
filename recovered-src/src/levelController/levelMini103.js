// Recovered source-like JS from /mnt/data/smdis/dis/levelController/levelMini103.dis
// Source-like reconstruction from smdis.

LevelController.LevelMini103 = LevelController.extend({
  eventStory1: function (arg0) {
    this.showStory(1, arg0, (((((("RemoveEnemy;SelectNpc;FaceTo,left;MoveCamera,32,14,2;ShowDialog," + vee.Utils.getLocalizedStringForKey("Great! You're almost there!", "\u4e0d\u9519\uff0c\u4f60\u5feb\u5230\u4e86\uff01")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("Keep moving, buddy!", "\u522b\u505c\u4e0b\u811a\u6b65\uff0c\u575a\u6301\u4f4f\u4f19\u8ba1\uff01")) + ";HideDialog;TimeLine,huxi_2;Delay,1;AddCoin,") + vee.Utils.getObjByPlatform("250", "500", "250")) + ";Delay,2;GameOver"));
  }
});
