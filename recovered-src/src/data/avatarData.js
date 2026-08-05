// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/data/avatarData.dis

function SC_avatarLocalizedText(key, fallback) {
  var text = key;
  if (typeof vee !== "undefined" && vee.Utils && typeof vee.Utils.getLocalizedStringForKey === "function") {
    try {
      text = vee.Utils.getLocalizedStringForKey(key);
    } catch (e) {
      text = key;
    }
  }
  if (text && text !== key) {
    return text;
  }
  return fallback || key;
}

function SC_avatarFallbackName(idx) {
  var names = {
    0: "Mr. White",
    1: "Kevo",
    2: "Hermione",
    3: "Tiny",
    4: "M-42",
    5: "Cop",
    6: "Spaceman",
    7: "Bear",
    8: "Vampire",
    9: "Flash",
    10: "Android",
    11: "MaNtIs",
    12: "Fox",
    13: "Rabbit",
    14: "Halloween",
    15: "Blast"
  };
  return names[idx] || ("Avatar " + idx);
}

function SC_avatarFallbackDesc(idx) {
  var desc = {
    0: "Default character",
    1: "Smash power",
    2: "Bullet power",
    3: "Tiny body",
    4: "Teleport power",
    5: "Bullet power",
    6: "Bomb power",
    7: "Strong body",
    8: "Vampire power",
    9: "Fast movement",
    10: "Android exclusive character",
    11: "Special character",
    12: "Special character",
    13: "Special character",
    14: "Special event character",
    15: "Special event character"
  };
  return desc[idx] || "Special character";
}

game.AvatarData = {
  productDataTemplate: {
    idx: 0,
    name: "Normal",
    desc: "\u9ed8\u8ba4\u4e3b\u89d2",
    priceDesc: "--",
    price: 0,
    iapIndex: -1,
    role: res.elePlayer_Zhai_ccbi,
    owned: true
  },
  productData: [
    {
      idx: 0,
      name: "avatar_0_name",
      type: game.Roles.Cat,
      picName: res.hero_show_1_cat_png,
      headName: res.hero_head_1_cat_png,
      cannonHeadName: res.hero_head_1_cat_png,
      dieName: "res/hero_dead_1_cat.png",
      desc: "avatar_0_desc",
      priceDesc: "--",
      price: 0,
      iapIndex: -1,
      role: res.elePlayer_Zhai_ccbi,
      coinFrame: "",
      owned: true,
      eventIdx: 200
    },
    {
      idx: 1,
      name: "avatar_1_name",
      type: game.Roles.Kevo,
      picName: res.hero_show_2_kevo_png,
      headName: res.hero_head_2_kevo_png,
      cannonHeadName: res.hero_head_2_kevo_png,
      dieName: "res/hero_dead_2_kevo.png",
      desc: "avatar_1_desc",
      priceDesc: "5",
      price: 250,
      iapIndex: -1,
      role: res.hero_kevo_ccbi,
      coinFrame: "coin_fist.png",
      owned: false,
      eventIdx: 203
    },
    {
      idx: 2,
      name: "avatar_2_name",
      type: game.Roles.Girl,
      picName: res.hero_show_6_girl_png,
      headName: res.hero_head_6_girl_png,
      cannonHeadName: res.hero_head_6_girl_png,
      dieName: "res/hero_dead_6_girl.png",
      desc: "avatar_2_desc",
      priceDesc: "$0.99",
      price: vee.Utils.getObjByPlatform(500, 1000),
      iapIndex: -1,
      role: res.hero_girl_ccbi,
      coinFrame: "coin_RedGirl.png",
      owned: false,
      eventIdx: 102
    },
    {
      idx: 3,
      name: "avatar_3_name",
      type: game.Roles.Tiny,
      picName: res.hero_show_10_tiny_png,
      headName: res.hero_head_10_tiny_png,
      cannonHeadName: res.hero_head_small_10_tiny_png,
      dieName: "res/hero_dead_10_tiny.png",
      desc: "avatar_3_desc",
      priceDesc: "10",
      price: vee.Utils.getObjByPlatform(1000, 2000),
      iapIndex: -1,
      role: res.hero_ji_ccbi,
      coinFrame: "coin_chicken.png",
      owned: false,
      eventIdx: 104
    },
    {
      idx: 4,
      name: "avatar_4_name",
      type: game.Roles.Marvin,
      picName: res.hero_show_8_marvin_png,
      headName: res.hero_head_8_marvin_png,
      cannonHeadName: res.hero_head_8_marvin_png,
      dieName: "res/hero_dead_8_marvin.png",
      desc: "avatar_4_desc",
      priceDesc: "10",
      price: vee.Utils.getObjByPlatform(1200, 3500),
      iapIndex: -1,
      role: res.hero_marvin_ccbi,
      coinFrame: "coin_42.png",
      owned: false,
      eventIdx: 202
    },
    {
      idx: 5,
      name: "avatar_5_name",
      type: game.Roles.Cop,
      picName: res.hero_show_4_cat_png,
      headName: res.hero_head_4_cap_png,
      cannonHeadName: res.hero_head_4_cap_png,
      dieName: "res/hero_dead_4_cat.png",
      desc: "avatar_5_desc",
      priceDesc: "30",
      price: vee.Utils.getObjByPlatform(1200, 3500),
      iapIndex: -1,
      role: res.hero_cap_ccbi,
      coinFrame: "coin_gun.png",
      owned: false,
      eventIdx: 101
    },
    {
      idx: 6,
      name: "avatar_6_name",
      type: game.Roles.Space,
      picName: res.hero_show_5_space_png,
      headName: res.hero_head_5_space_png,
      cannonHeadName: res.hero_head_5_space_png,
      dieName: "res/hero_dead_5_space.png",
      desc: "avatar_6_desc",
      priceDesc: "10",
      price: vee.Utils.getObjByPlatform(1500, 3500),
      iapIndex: -1,
      role: res.hero_nasa_ccbi,
      coinFrame: "coin_Xman.png",
      owned: false,
      eventIdx: 201
    },
    {
      idx: 7,
      name: "avatar_7_name",
      type: game.Roles.bear,
      picName: res.hero_show_9_bear_png,
      headName: res.hero_head_9_bear_png,
      cannonHeadName: res.hero_head_9_bear_png,
      dieName: "res/hero_dead_9_bear.png",
      desc: "avatar_7_desc",
      priceDesc: "$0.99",
      price: vee.Utils.getObjByPlatform(1500, 4500),
      iapIndex: -1,
      role: res.hero_beer_ccbi,
      coinFrame: "coin_bear.png",
      owned: false,
      eventIdx: 204
    },
    {
      idx: 8,
      name: "avatar_8_name",
      type: game.Roles.Vampire,
      picName: res.hero_show_7_vampire_png,
      headName: res.hero_head_7_vampire_png,
      cannonHeadName: res.hero_head_7_vampire_png,
      dieName: "res/hero_dead_7_vampire.png",
      desc: "avatar_8_desc",
      priceDesc: "2000",
      price: vee.Utils.getObjByPlatform(3000, 6000),
      iapIndex: -1,
      role: res.hero_dracula_ccbi,
      coinFrame: "coin_blood.png",
      owned: false,
      eventIdx: 103
    },
    {
      idx: 9,
      name: "avatar_9_name",
      type: game.Roles.Flash,
      picName: res.hero_show_3_flash_png,
      headName: res.hero_head_3_flash_png,
      cannonHeadName: res.hero_head_3_flash_png,
      dieName: "res/hero_dead_3_flash.png",
      desc: "avatar_9_desc",
      priceDesc: "$0.99",
      price: vee.Utils.getObjByPlatform(5000, 10000),
      iapIndex: -1,
      role: res.hero_davinci_ccbi,
      coinFrame: "coin_power.png",
      owned: false,
      eventIdx: 205
    },
    {
      idx: 11,
      name: "avatar_11_name",
      type: game.Roles.MaNtIs,
      picName: res.hero_show_12_m_png,
      headName: res.hero_head_12_m_png,
      cannonHeadName: res.hero_head_12_m_png,
      dieName: res.hero_dead_12_m_png,
      desc: "avatar_11_desc",
      priceDesc: "10",
      price: vee.Utils.getObjByPlatform(5000, 10000),
      iapIndex: -1,
      role: res.hero_m_ccbi,
      coinFrame: "coin_42.png",
      owned: false,
      eventIdx: 200
    },
    {
      idx: 12,
      name: "avatar_12_name",
      type: game.Roles.Fox,
      picName: res.hero_show_13_fox_png,
      headName: res.hero_head_13_fox_png,
      cannonHeadName: res.hero_head_13_fox_png,
      dieName: res.hero_dead_Fox2_png,
      desc: "avatar_12_desc",
      priceDesc: "10",
      price: vee.Utils.getObjByPlatform(5000, 10000),
      iapIndex: -1,
      role: res.hero_fox_ccbi,
      coinFrame: "coin_42.png",
      owned: false,
      eventIdx: 200
    },
    {
      idx: 13,
      name: "avatar_13_name",
      type: game.Roles.Robbit,
      picName: res.hero_show_14_rabbit_png,
      headName: res.hero_head_14_rabbit_png,
      cannonHeadName: res.hero_head_14_rabbit_png,
      dieName: res.hero_dead_14_rabbit_png,
      desc: "avatar_13_desc",
      priceDesc: "10",
      price: vee.Utils.getObjByPlatform(5000, 10000),
      iapIndex: -1,
      role: res.hero_Rabbit_ccbi,
      coinFrame: "coin_42.png",
      owned: false,
      eventIdx: 200
    },
    {
      idx: 14,
      name: "avatar_14_name",
      type: game.Roles.Holloween,
      picName: res.hero_show_15_holloween_png,
      headName: res.hero_head_15_holloween_png,
      cannonHeadName: res.hero_head_15_holloween_png,
      dieName: res.hero_dead_15_holloween_png,
      desc: "avatar_14_desc",
      priceDesc: "10",
      price: vee.Utils.getObjByPlatform(5000, 10000),
      iapIndex: -1,
      role: res.hero_skeleton_ccbi,
      coinFrame: "coin_42.png",
      owned: false,
      eventIdx: 200
    },
    {
      idx: 15,
      name: "avatar_15_name",
      type: game.Roles.Blast,
      picName: res.hero_show_16_blast_png,
      headName: res.hero_head_16_blast_png,
      cannonHeadName: res.hero_head_16_blast_png,
      dieName: res.hero_dead_16_blast_png,
      desc: "avatar_15_desc",
      priceDesc: "10",
      price: vee.Utils.getObjByPlatform(5000, 10000),
      iapIndex: -1,
      role: res.hero_Blast_ccbi,
      coinFrame: "coin_42.png",
      owned: false,
      eventIdx: 200
    }
  ],
  productData_android: [
    {
      idx: 0,
      name: "avatar_0_name",
      type: game.Roles.Cat,
      picName: res.hero_show_1_cat_png,
      headName: res.hero_head_1_cat_png,
      cannonHeadName: res.hero_head_1_cat_png,
      dieName: res.hero_dead_1_cat_png,
      desc: "avatar_0_desc",
      priceDesc: "--",
      price: 0,
      iapIndex: -1,
      role: res.elePlayer_Zhai_ccbi,
      coinFrame: "",
      owned: true,
      eventIdx: 200
    },
    {
      idx: 1,
      name: "avatar_1_name",
      type: game.Roles.Kevo,
      picName: res.hero_show_2_kevo_png,
      headName: res.hero_head_2_kevo_png,
      cannonHeadName: res.hero_head_2_kevo_png,
      dieName: res.hero_dead_2_kevo_png,
      desc: "avatar_1_desc",
      priceDesc: "5",
      price: 250,
      iapIndex: -1,
      role: res.hero_kevo_ccbi,
      coinFrame: "coin_fist.png",
      owned: false,
      eventIdx: 203
    },
    {
      idx: 2,
      name: "avatar_2_name",
      type: game.Roles.Girl,
      picName: res.hero_show_6_girl_png,
      headName: res.hero_head_6_girl_png,
      cannonHeadName: res.hero_head_6_girl_png,
      dieName: res.hero_dead_6_girl_png,
      desc: "avatar_2_desc",
      priceDesc: "$0.99",
      price: vee.Utils.getObjByPlatform(500, 1000),
      iapIndex: -1,
      role: res.hero_girl_ccbi,
      coinFrame: "coin_RedGirl.png",
      owned: false,
      eventIdx: 102
    },
    {
      idx: 3,
      name: "avatar_3_name",
      type: game.Roles.Tiny,
      picName: res.hero_show_10_tiny_png,
      headName: res.hero_head_10_tiny_png,
      cannonHeadName: res.hero_head_small_10_tiny_png,
      dieName: res.hero_dead_10_tiny_png,
      desc: "avatar_3_desc",
      priceDesc: "10",
      price: vee.Utils.getObjByPlatform(1000, 2000),
      iapIndex: -1,
      role: res.hero_ji_ccbi,
      coinFrame: "coin_chicken.png",
      owned: false,
      eventIdx: 104
    },
    {
      idx: 4,
      name: "avatar_10_name",
      type: game.Roles.Android,
      picName: res.hero_show_11_android_png,
      headName: res.hero_head_11_android_png,
      cannonHeadName: res.hero_head_11_android_png,
      dieName: res.hero_dead_11_android_png,
      desc: "avatar_10_desc",
      priceDesc: "$0.99",
      price: vee.Utils.getObjByPlatform(1200, 3500),
      iapIndex: -1,
      role: res.hero_android_ccbi,
      coinFrame: "coin_power.png",
      owned: false,
      eventIdx: 202
    },
    {
      idx: 5,
      name: "avatar_5_name",
      type: game.Roles.Cop,
      picName: res.hero_show_4_cat_png,
      headName: res.hero_head_4_cap_png,
      cannonHeadName: res.hero_head_4_cap_png,
      dieName: res.hero_dead_4_cat_png,
      desc: "avatar_5_desc",
      priceDesc: "30",
      price: vee.Utils.getObjByPlatform(1200, 3500),
      iapIndex: -1,
      role: res.hero_cap_ccbi,
      coinFrame: "coin_gun.png",
      owned: false,
      eventIdx: 101
    },
    {
      idx: 6,
      name: "avatar_6_name",
      type: game.Roles.Space,
      picName: res.hero_show_5_space_png,
      headName: res.hero_head_5_space_png,
      cannonHeadName: res.hero_head_5_space_png,
      dieName: res.hero_dead_5_space_png,
      desc: "avatar_6_desc",
      priceDesc: "10",
      price: vee.Utils.getObjByPlatform(1500, 3500),
      iapIndex: -1,
      role: res.hero_nasa_ccbi,
      coinFrame: "coin_Xman.png",
      owned: false,
      eventIdx: 201
    },
    {
      idx: 7,
      name: "avatar_7_name",
      type: game.Roles.bear,
      picName: res.hero_show_9_bear_png,
      headName: res.hero_head_9_bear_png,
      cannonHeadName: res.hero_head_9_bear_png,
      dieName: res.hero_dead_9_bear_png,
      desc: "avatar_7_desc",
      priceDesc: "$0.99",
      price: vee.Utils.getObjByPlatform(1500, 4500),
      iapIndex: -1,
      role: res.hero_beer_ccbi,
      coinFrame: "coin_bear.png",
      owned: false,
      eventIdx: 204
    },
    {
      idx: 8,
      name: "avatar_8_name",
      type: game.Roles.Vampire,
      picName: res.hero_show_7_vampire_png,
      headName: res.hero_head_7_vampire_png,
      cannonHeadName: res.hero_head_7_vampire_png,
      dieName: res.hero_dead_7_vampire_png,
      desc: "avatar_8_desc",
      priceDesc: "2000",
      price: vee.Utils.getObjByPlatform(3000, 6000),
      iapIndex: -1,
      role: res.hero_dracula_ccbi,
      coinFrame: "coin_blood.png",
      owned: false,
      eventIdx: 103
    },
    {
      idx: 9,
      name: "avatar_9_name",
      type: game.Roles.Flash,
      picName: res.hero_show_3_flash_png,
      headName: res.hero_head_3_flash_png,
      cannonHeadName: res.hero_head_3_flash_png,
      dieName: res.hero_dead_3_flash_png,
      desc: "avatar_9_desc",
      priceDesc: "$0.99",
      price: vee.Utils.getObjByPlatform(5000, 10000),
      iapIndex: -1,
      role: res.hero_davinci_ccbi,
      coinFrame: "coin_power.png",
      owned: false,
      eventIdx: 205
    },
    {
      idx: 11,
      name: "avatar_11_name",
      type: game.Roles.MaNtIs,
      picName: res.hero_show_12_m_png,
      headName: res.hero_head_12_m_png,
      cannonHeadName: res.hero_head_12_m_png,
      dieName: res.hero_dead_12_m_png,
      desc: "avatar_11_desc",
      priceDesc: "10",
      price: vee.Utils.getObjByPlatform(5000, 10000),
      iapIndex: -1,
      role: res.hero_m_ccbi,
      coinFrame: "coin_42.png",
      owned: false,
      eventIdx: 200
    },
    {
      idx: 12,
      name: "avatar_12_name",
      type: game.Roles.Fox,
      picName: res.hero_show_13_fox_png,
      headName: res.hero_head_13_fox_png,
      cannonHeadName: res.hero_head_13_fox_png,
      dieName: res.hero_dead_Fox2_png,
      desc: "avatar_12_desc",
      priceDesc: "10",
      price: vee.Utils.getObjByPlatform(5000, 10000),
      iapIndex: -1,
      role: res.hero_fox_ccbi,
      coinFrame: "coin_42.png",
      owned: false,
      eventIdx: 200
    },
    {
      idx: 13,
      name: "avatar_13_name",
      type: game.Roles.Robbit,
      picName: res.hero_show_14_rabbit_png,
      headName: res.hero_head_14_rabbit_png,
      cannonHeadName: res.hero_head_14_rabbit_png,
      dieName: res.hero_dead_14_rabbit_png,
      desc: "avatar_13_desc",
      priceDesc: "10",
      price: vee.Utils.getObjByPlatform(5000, 10000),
      iapIndex: -1,
      role: res.hero_Rabbit_ccbi,
      coinFrame: "coin_42.png",
      owned: false,
      eventIdx: 200
    },
    {
      idx: 14,
      name: "avatar_14_name",
      type: game.Roles.Holloween,
      picName: res.hero_show_15_holloween_png,
      headName: res.hero_head_15_holloween_png,
      cannonHeadName: res.hero_head_15_holloween_png,
      dieName: res.hero_dead_15_holloween_png,
      desc: "avatar_14_desc_android",
      priceDesc: "10",
      price: vee.Utils.getObjByPlatform(5000, 10000),
      iapIndex: -1,
      role: res.hero_skeleton_ccbi,
      coinFrame: "coin_42.png",
      owned: false,
      eventIdx: 200
    },
    {
      idx: 15,
      name: "avatar_15_name",
      type: game.Roles.Blast,
      picName: res.hero_show_16_blast_png,
      headName: res.hero_head_16_blast_png,
      cannonHeadName: res.hero_head_16_blast_png,
      dieName: res.hero_dead_16_blast_png,
      desc: "avatar_15_desc_android",
      priceDesc: "10",
      price: vee.Utils.getObjByPlatform(5000, 10000),
      iapIndex: -1,
      role: res.hero_Blast_ccbi,
      coinFrame: "coin_42.png",
      owned: false,
      eventIdx: 200
    }
  ],
  getAvatarName: function (arg0) {
    if (!game.Data.isAndroid && arg0 == 10) {
      arg0 = 11;
    }
    var key = "avatar_" + arg0 + "_name";
    return SC_avatarLocalizedText(key, SC_avatarFallbackName(arg0));
  },
  getAvatarDesc: function (arg0) {
    if (!game.Data.isAndroid && arg0 == 10) {
      arg0 = 11;
    }

    var key = "avatar_" + arg0 + "_desc";
    if (arg0 == 14 || arg0 == 15) {
      if (game.Data.version.curVersion === VERSION.ANDROID_GOOGLE_FREE || game.Data.version.curVersion === VERSION.IOS_FREE || game.Data.version.curVersion === VERSION.IOS_FREE_CN) {
        key = "avatar_" + arg0 + "_desc_android";
      }
    }
    if (game.Data.version.curVersion === VERSION.TVOS_GENUINE) {
      if (arg0 == 13 || arg0 == 14 || arg0 == 15) {
        key = "avatar_" + arg0 + "_desc_android";
      }
    }
    return SC_avatarLocalizedText(key, SC_avatarFallbackDesc(arg0));
  },
  getProductData: function () {
    return game.Data.isAndroid ? this.productData_android : this.productData;
  },
  init: function () {
    var local0 = this.getProductData().length;
    for (var local1 = 0; local1 < local0; local1++) {
      this.getAvatarData(local1);
    }
  },
  getAvatarData: function (arg0) {
    var local0 = this.getProductData()[arg0];
    if (!local0) {
      return this.getProductData()[0];
    }
    local0.owned = vee.VIPValues.getValue("avatar_" + arg0) === 1 ? true : local0.owned;
    return local0;
  },
  avatarPurchased: function (arg0) {
    this.getProductData()[arg0].owned = true;
    vee.VIPValues.setValue("avatar_" + arg0, 1);
    vee.VIPValues.save();
    LyAvatarStore.refreshState();
    vee.Analytics.logEvent("UnlockRole", {
      playCount: "" + game.Data.getTotalPlayCount()
    });
  },
  allPurchase: function () {
    var local0 = this.getProductData().length;
    for (var local1 = 0; local1 < local0; local1++) {
      this.avatarPurchased(local1);
      vee.Analytics.UGameEvent.unlockRoleEvent("pay", local1);
    }
    vee.data.allcat = true;
    vee.saveData();
    LyAvatarStore.refreshState();
  },
  isAllRole: function () {
    var local0 = this.getProductData();
    for (var local1 in local0) {
      var local2 = local0[local1];
      if (!local2.owned) {
        return false;
      }
    }
    return true;
  },
  avatarSelected: function (arg0) {
    vee.VIPValues.setValue("currentAvatar", arg0);
    vee.VIPValues.save();
    game.Data.changeAvatar(arg0);
  },
  getCurrentAvatar: function () {
    var local0 = vee.VIPValues.getValue("currentAvatar");
    if (!local0) {
      return this.getProductData()[0];
    }
    return this.getProductData()[local0];
  },
  getNextAvatar: function (arg0, arg1) {
    if (!game.Data.isUnlocking() && !arg1) {
      return null;
    }
    cc.log("get next avatar===========1111111111");
    if (!arg0) {
      arg0 = 0;
    }
    var local0 = this.getProductData().length;
    var local1 = 0;
    for (var local2 = 0; local2 < local0; local2++) {
      var local3 = this.getProductData()[local2];
      if (local3.idx > 11) {
        continue;
      }
      if (!local3.owned) {
        if (local1 < arg0) {
          local1++;
          continue;
        }
        return local3;
      }
    }
    cc.log("get next avatar===========333333333333");
    return null;
  },
  getUnlockedCount: function () {
    var local0 = this.getProductData().length;
    var local1 = 0;
    for (var local2 = 0; local2 < local0; local2++) {
      if (this.getProductData()[local2].owned) {
        local1++;
      }
    }
    return local1;
  },
  checkUnlockMidAutRole: function () {
    var local0 = game.AvatarData.getAvatarData(12);
    if (game.Data.version.isMidAutumn && !local0.owned) {
      var local1 = game.LevelData.selectedLevel;
      if (game.Data.version.curVersion === VERSION.TVOS_GENUINE) {
        if (game.LevelData.selectedCategory.idx === 7 && game.LevelData.selectedCategory.percent >= 100) {
          return true;
        }
      } else if (game.LevelData.selectedCategory.idx === 7 && local1.idx === 2 && local1.getLevelState() === 2) {
        return true;
      }
    }
    return false;
  },
  unlockMidAutRole: function () {
    vee.Utils.openURL("https://www.facebook.com/veewosupercat/?ref=bookmarks");
    game.AvatarData.avatarPurchased(12);
    vee.Analytics.UGameEvent.unlockRoleEvent("facebook", 12);
  },
  checkUnlockHolloweenRole: function () {
    var local0 = game.AvatarData.getAvatarData(13);
    if (!local0.owned) {
      var local1 = game.LevelData.selectedLevel;
      if (game.LevelData.selectedCategory.idx === 8 && game.LevelData.selectedCategory.percent >= 100) {
        return true;
      }
    }
    return false;
  },
  checkUnlockThanksgivingRole: function () {
    var local0 = game.AvatarData.getAvatarData(14);
    if (!local0.owned) {
      var local1 = game.LevelData.selectedLevel;
      if (game.LevelData.selectedCategory.idx === 9 && game.LevelData.selectedCategory.percent >= 100) {
        return true;
      }
    }
    return false;
  },
  unlockVideoRoleByAvatarId: function () {
    var local2 = arguments[0];
    vee.Ad.showVideoAd(function () {
      vee.Analytics.UGameEvent.showAdEvent("alerts", "video", "unlockRole_" + local2);
      game.AvatarData.avatarPurchased(local2);
      vee.Analytics.UGameEvent.unlockRoleEvent("video", local2);
      vee.Utils.scheduleOnce(function () {
        game.AvatarData.avatarSelected(local2);
        LyUnlock.show(local2);
      }, 1);
    }, "unlockRole");
  }
};
