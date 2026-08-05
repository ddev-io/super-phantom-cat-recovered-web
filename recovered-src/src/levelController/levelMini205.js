// Recovered source-like JS from /mnt/data/smdis/dis/levelController/levelMini205.dis
// Source-like reconstruction from smdis.

LevelController.LevelMini205 = LevelController.extend({
  eventStory1: function (arg0) {
    this.showStory(1, arg0, (((((("RemoveEnemy;MoveCamera,34,11,2;SelectNpc;FaceTo,left;ShowDialog," + vee.Utils.getLocalizedStringForKey("Nice! You found me!", "\u4e0d\u9519\uff0c\u4f60\u627e\u5230\u6211\u4e86\uff01")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("Get your bonus here!", "\u6765\u62ff\u4f60\u7684\u5956\u52b1\u5427\uff01")) + ";HideDialog;TimeLine,huxi_2;Delay,1;AddCoin,") + vee.Utils.getObjByPlatform("200", "400", "200")) + ";Delay,2;GameOver"));
  }
});
