// Recovered source-like JS from /mnt/data/smdis/dis/levelController/levelMini206.dis
// Source-like reconstruction from smdis.

LevelController.LevelMini206 = LevelController.extend({
  eventStory1: function (arg0) {
    this.showStory(1, arg0, (((("RemoveEnemy;MoveCamera,20,19,1;SelectNpc;ShowDialog," + vee.Utils.getLocalizedStringForKey("There's no time for talking. Take this -- and go!", "\u6ca1\u65f6\u95f4\u5e9f\u8bdd\u4e86\uff01\u8ddf\uff01\u6211\uff01\u8d70\uff01")) + ";HideDialog;TimeLine,huxi_2;Delay,1;AddCoin,") + vee.Utils.getObjByPlatform("250", "500", "250")) + ";Delay,1;GameOver"));
  }
});
