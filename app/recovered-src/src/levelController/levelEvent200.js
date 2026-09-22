// Recovered source-like JS from /mnt/data/smdis/dis/levelController/levelEvent200.dis
// Source-like reconstruction from smdis.

LevelController.LevelEvent200 = LevelController.extend({
  eventStory1: function (arg0) {
    this.showStory(1, arg0, (((((((((((((("SelectNpc,Flash;FaceTo,right;MoveCamera,24,11,2;FaceTo,left;MoveRole,24,11;ShowDialog," + vee.Utils.getLocalizedStringForKey("Hey! New face?", "\u563f\uff0c\u65b0\u9762\u5b54\uff1f")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("I hope your brain can still perform its function, you know...", "\u5e0c\u671b\u4f60\u8fd8\u662f\u5fc3\u667a\u6b63\u5e38\u7684\uff0c\u561b\u2026\u2026")) + ";HideDialog;FaceTo,right;SelectNpc;MoveRole,25,11;ShowDialog,") + vee.Utils.getLocalizedStringForKey("Watch out!", "\u5c0f\u5fc3\uff01")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("(Snap)", "\uff08\u54cd\u6307\uff09")) + ";HideDialog;Trigger,3,3;ShowDialog,") + vee.Utils.getLocalizedStringForKey("It's dangerous okay?", "\u62dc\u6258\uff0c\u8fd9\u5f88\u5371\u9669\u7684\uff08\u7701\u7565\u4e09\u5343\u5b57\uff09")) + ";HideDialog;Delay,1;UnlockRole;SelectNpc,Flash;FaceTo,left;ShowDialog,") + vee.Utils.getLocalizedStringForKey("Okay, we need a face-to-face conversation.", "\u597d\u5427\uff0c\u4e5f\u8bb8\u6211\u4eec\u9700\u8981\u9762\u8c08\u4e00\u4e0b\u3002")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("(Snap) Come on! Make your way over there!", "\uff08\u54cd\u6307\uff09\u8bd5\u7740\u505a\u70b9\u4ec0\u4e48\u5427\uff01")) + ";HideDialog;TimeLine,huxi_2;Delay,1;Trigger,4,3;MoveCamera,21,16,1;MoveCamera,24,11,1"));
  },
  eventStory2: function (arg0) {
    this.showStory(2, arg0, (((("SelectNpc;FaceTo,right;MoveCamera,27,11,2;ShowDialog," + vee.Utils.getLocalizedStringForKey("Flash just chatted with me. My apologies.", "\u95ea\u7535\u732b\u8ddf\u6211\u4eb2\u5207\u4ea4\u8c08\u4e86\u4e00\u4e0b\u3002\u6211\u5411\u4f60\u9053\u6b49\u3002")) + ";ShowDialog,") + vee.Utils.getLocalizedStringForKey("Take these as a gift -- and please stay calm.", "\u4f5c\u4e3a\u793c\u7269\uff0c\u6536\u4e0b\u8fd9\u4e9b\u3002\u8bf7\u4fdd\u6301\u795e\u5fd7\u6e05\u9192\u54e6\u3002")) + ";HideDialog;Trigger,32,12"));
  }
});
