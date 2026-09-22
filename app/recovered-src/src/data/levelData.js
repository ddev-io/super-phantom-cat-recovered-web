// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/data/levelData.dis
var game = game || {};
game.LevelData = {
  LockStatus: {
    LOCKED: 1,
    READY_TO_UNLOCK: 2,
    UNLOCKED: 3
  },
  categoryCount: 13,
  defaultData: [
    {
      bg: res.level_image_mid_0_png,
      title: "OVERTURE",
      idx: 0,
      beginLevel: 1,
      levelCount: 3,
      percent: 0,
      unlockStar: 0,
      bgUnlock: res.level_image_mid_0_png,
      categoryReady: true,
      bgColor1: [0, 222, 186],
      bgColor2: [61, 70, 255],
      lockStatus: 3
    },
    {
      bg: res.level_image_mid_1_png,
      title: "SOFTLIGHT",
      idx: 1,
      beginLevel: 4,
      levelCount: 7,
      percent: 0,
      unlockStar: 5,
      bgUnlock: res.level_image_mid_1_png,
      categoryReady: true,
      bgColor1: [153, 194, 255],
      bgColor2: [127, 13, 255],
      lockStatus: 1
    },
    {
      bg: res.level_image_mid_2_png,
      title: "RAINFALL",
      idx: 2,
      beginLevel: 11,
      levelCount: 7,
      percent: 0,
      unlockStar: vee.Utils.getObjByPlatform(20, 20),
      bgUnlock: res.level_image_mid_2_png,
      categoryReady: true,
      bgColor1: [255, 191, 178],
      bgColor2: [255, 53, 181],
      lockStatus: 1
    },
    {
      bg: res.level_image_mid_3_png,
      title: "SUNWIND",
      idx: 3,
      beginLevel: 18,
      levelCount: 7,
      percent: 0,
      unlockStar: vee.Utils.getObjByPlatform(40, 40),
      bgUnlock: res.level_image_mid_3_png,
      categoryReady: true,
      bgColor1: [255, 220, 127],
      bgColor2: [255, 80, 45],
      lockStatus: 1
    },
    {
      bg: res.level_image_mid_4_png,
      title: "DREAMLAND",
      idx: 4,
      beginLevel: 25,
      levelCount: 7,
      percent: 0,
      unlockStar: vee.Utils.getObjByPlatform(60, 60),
      bgUnlock: res.level_image_mid_4_png,
      categoryReady: true,
      bgColor1: [255, 148, 137],
      bgColor2: [75, 0, 199],
      lockStatus: 1
    },
    {
      bg: res.level_image_mid_5_png,
      title: "SNOWFLAKE",
      idx: 5,
      beginLevel: 32,
      levelCount: 7,
      percent: 0,
      unlockStar: vee.Utils.getObjByPlatform(70, 70),
      bgUnlock: res.level_image_mid_5_png,
      categoryReady: true,
      bgColor1: [224, 136, 255],
      bgColor2: [0, 18, 190],
      lockStatus: 1
    },
    {
      bg: res.level_image_mid_Child_png,
      title: "OLDTIME",
      idx: 6,
      beginLevel: 39,
      levelCount: 3,
      percent: 0,
      unlockStar: 999,
      bgUnlock: res.level_image_mid_Child_png,
      categoryReady: true,
      bgColor1: [255, 116, 214],
      bgColor2: [255, 129, 53],
      lockStatus: 1
    },
    {
      bg: res.level_image_mid_autumn_png,
      title: "AUTUMNIGHT",
      idx: 7,
      beginLevel: 42,
      levelCount: 3,
      percent: 0,
      unlockStar: 999,
      bgUnlock: res.level_image_mid_autumn_png,
      categoryReady: true,
      bgColor1: [65, 47, 143],
      bgColor2: [114, 55, 141],
      lockStatus: 1
    },
    {
      bg: res.level_image_mid_halloween_png,
      title: "HALLOWEEN",
      idx: 8,
      beginLevel: 45,
      levelCount: 3,
      percent: 0,
      unlockStar: 999,
      bgUnlock: res.level_image_mid_autumn_png,
      categoryReady: true,
      bgColor1: [159, 66, 16],
      bgColor2: [57, 28, 101],
      lockStatus: 1
    },
    {
      bg: res.level_image_mid_thanks_png,
      title: "DISCORUN",
      idx: 9,
      beginLevel: 48,
      levelCount: 7,
      percent: 0,
      unlockStar: 999,
      bgUnlock: res.level_image_mid_autumn_png,
      categoryReady: true,
      bgColor1: [255, 0, 210],
      bgColor2: [81, 0, 191],
      lockStatus: 1
    },
    {
      bg: res.level_image_springtime_png,
      title: "SPRINGTIME",
      idx: 10,
      beginLevel: 55,
      levelCount: 3,
      percent: 0,
      unlockStar: 999,
      bgUnlock: res.level_image_springtime_png,
      categoryReady: true,
      bgColor1: [255, 178, 95],
      bgColor2: [255, 51, 17],
      lockStatus: 1
    },
    {
      bg: res.level_image_moregames_png,
      bgColor1: [43, 9, 64],
      bgColor2: [38, 53, 101],
      lockStatus: 1,
      categoryReady: false
    }
  ],
  initReverseWorldData: function () {
    this.defaultData[100] = {
      bg: res.level_image_mid_negative_0_png,
      title: "CRESCENT",
      idx: 100,
      beginLevel: 101,
      levelCount: 3,
      percent: 0,
      unlockStar: 999,
      bgUnlock: res.level_image_mid_moon_0_png,
      categoryReady: true,
      bgColor1: [0, 222, 186],
      bgColor2: [61, 70, 255],
      lockStatus: 1
    };
    this.defaultData[101] = {
      bg: res.level_image_mid_negative_1_png,
      title: "MOONLIGHT",
      idx: 101,
      beginLevel: 104,
      levelCount: 7,
      percent: 0,
      unlockStar: 999,
      bgUnlock: res.level_image_mid_moon_1_png,
      categoryReady: true,
      bgColor1: [153, 194, 255],
      bgColor2: [127, 13, 255],
      lockStatus: 1
    };
    this.defaultData[102] = {
      bg: res.level_image_mid_negative_2_png,
      title: "MOONFALL",
      idx: 102,
      beginLevel: 111,
      levelCount: 7,
      percent: 0,
      unlockStar: 999,
      bgUnlock: res.level_image_mid_moon_2_png,
      categoryReady: true,
      bgColor1: [255, 191, 178],
      bgColor2: [255, 53, 181],
      lockStatus: 1
    };
    this.defaultData[103] = {
      bg: res.level_image_mid_negative_3_png,
      title: "MOONWIND",
      idx: 103,
      beginLevel: 118,
      levelCount: 7,
      percent: 0,
      unlockStar: 999,
      bgUnlock: res.level_image_mid_moon_3_png,
      categoryReady: true,
      bgColor1: [255, 220, 127],
      bgColor2: [255, 80, 45],
      lockStatus: 1
    };
    this.defaultData[104] = {
      bg: res.level_image_mid_negative_4_png,
      title: "MOONLAND",
      idx: 104,
      beginLevel: 125,
      levelCount: 7,
      percent: 0,
      unlockStar: 999,
      bgUnlock: res.level_image_mid_moon_4_png,
      categoryReady: true,
      bgColor1: [255, 148, 137],
      bgColor2: [75, 0, 199],
      lockStatus: 1
    };
    this.defaultData[105] = {
      bg: res.level_image_mid_negative_5_png,
      title: "MOONFLAKE",
      idx: 105,
      beginLevel: 132,
      bgUnlock: res.level_image_mid_moon_5_png,
      levelCount: 7,
      percent: 0,
      unlockStar: 999,
      categoryReady: false,
      bgColor1: [224, 136, 255],
      bgColor2: [0, 57, 174],
      lockStatus: 1
    };
    for (var local0 = 106; local0 <= 111; local0++) {
      this.defaultData[local0] = {
        bgColor1: [97, 194, 255],
        bgColor2: [62, 23, 188],
        lockStatus: 1
      };
    }
    var local1 = ["229R", "230R", "233R", "100R", "222R", "200R", "231R", "204R", "247R", "201R", "111R", "236R", "106R", "243R", "103R", "115R", "235R", "117R", "246R", "112R", "242R", "114R", "244R", "116R", "108R", "105R", "223R", "113R", "253R", "109R", "252R", "254R", "256R", "245R", "257R", "258R", "248R", "261R"];
    for (var local2 = 0; local2 < local1.length; local2++) {
      this.levelMap[local2 + 100] = local1[local2];
    }
  },
  levelMap: {
    "0": 229,
    "1": 230,
    "2": 233,
    "3": 100,
    "4": 222,
    "5": 200,
    "6": 231,
    "7": 204,
    "8": 247,
    "9": 201,
    "10": 111,
    "11": 236,
    "12": 106,
    "13": 243,
    "14": 103,
    "15": 115,
    "16": 235,
    "17": 117,
    "18": 246,
    "19": 112,
    "20": 242,
    "21": 114,
    "22": 244,
    "23": 116,
    "24": 108,
    "25": 105,
    "26": 223,
    "27": 113,
    "28": 253,
    "29": 109,
    "30": 252,
    "31": 254,
    "32": 256,
    "33": 245,
    "34": 257,
    "35": 258,
    "36": 248,
    "37": 261,
    "38": "Children1",
    "39": "Children2",
    "40": "Children3",
    "41": "Moon1",
    "42": "Moon2",
    "43": "Moon3",
    "44": "Hollow1",
    "45": "Hollow2",
    "46": "Hollow3",
    "47": "Parkour1",
    "48": "Parkour2",
    "49": "Parkour3",
    "50": "Parkour4",
    "51": "Parkour5",
    "52": "Parkour6",
    "53": "Parkour7",
    "54": "Spring1",
    "55": "Spring2",
    "56": "Spring3"
  },
  selectedCategory: null,
  selectedLevel: null,
  categories: [],
  coreData: null,
  getDefaultData: function (arg0) {
    return this.defaultData[arg0];
  },
  getCategory: function (arg0) {
    if (!this.coreData) {
      this.load();
    }
    var local0 = this.defaultData[arg0];
    if (!local0) {
      return null;
    }
    if (!this.categories[arg0]) {
      var local1 = this.coreData.percents[arg0];
      var local2 = this.coreData.lockStatus[arg0];
      this.categories[arg0] = new CategoryData(local0.bg, local0.title, local0.idx, local0.beginLevel, local0.levelCount, local1 ? local1 : 0, local0.unlockStar, local2 ? local2 : local0.lockStatus, local0.bgUnlock, local0.categoryReady);
      this.categories[arg0].updatePercent();
    }
    this.categories[arg0].categoryReady = local0.categoryReady;
    return this.categories[arg0];
  },
  getCurrentLevelMapIndex: function () {
    return this.levelMap[this.selectedLevel.getLevelNo() - 1];
  },
  getBgColors: function (arg0) {
    if (arg0 > game.LevelData.categoryCount - 2) {
      arg0 = game.LevelData.categoryCount - 2;
    }
    var local0 = this.defaultData[arg0].bgColor1;
    var local1 = this.defaultData[arg0].bgColor2;
    return [
      cc.color(local0[0], local0[1], local0[2], 255),
      cc.color(local1[0], local1[1], local1[2], 255)
    ];
  },
  getNextCategory: function () {
    return this.getCategory((this.selectedCategory.idx + 1));
  },
  setPercent: function (arg0, arg1) {
    this.coreData.percents[arg0] = arg1;
    this.save();
  },
  setLockStatus: function (arg0, arg1) {
    if (this.categories[arg0]) {
      this.coreData.lockStatus[arg0] = arg1;
      this.categories[arg0].lockStatus = arg1;
      this.save();
    }
  },
  load: function () {
    this.categoryCount = 13;
    if (game.Data.version.curVersion === VERSION.TVOS_GENUINE) {
      this.categoryCount = this.categoryCount - 1;
    }
    vee.VIPValues.load({
      coin: 0,
      star: 0
    });
    this.coreData = vee.Utils.loadObj("AtadLevel");
    if (!this.coreData) {
      this.coreData = {
        percents: {},
        lockStatus: {
          0: 3,
          1: 1,
          2: 1,
          3: 1,
          4: 1,
          5: 1,
          6: 1,
          7: 1,
          8: 1,
          9: 1,
          10: 1,
          11: 1,
          12: 1,
          100: 1,
          101: 1,
          102: 1,
          103: 1,
          104: 1,
          105: 1,
          106: 1,
          107: 1,
          108: 1,
          109: 1,
          110: 1,
          111: 1,
          112: 1
        }
      };
      this.save();
    }
  },
  save: function () {
    vee.Utils.saveObj(this.coreData, "AtadLevel");
    vee.VIPValues.save();
  },
  getStar: function () {
    return vee.VIPValues.getValue("star") || "0";
  },
  addStar: function (arg0) {
    var local0 = this.getStar();
    vee.VIPValues.add2Value("star", arg0);
    local0 = this.getStar();
    vee.Analytics.UGameEvent.registerSuperProperty("super_starCount", local0);
    for (var local1 in this.defaultData) {
      var local2 = this.defaultData[local1];
      if (local0 >= local2.unlockStar) {
        cc.log("this.coreData.lockStatus[" + local1 + "] = " + this.coreData.lockStatus[local1]);
        if (this.coreData.lockStatus[local1] === game.LevelData.LockStatus.LOCKED) {
          if (game.Data.isFreeGame) {
            return undefined;
          }
          this.setLockStatus(local1, game.LevelData.LockStatus.READY_TO_UNLOCK);
        }
      }
    }
  },
  checkLevelLockState: function (arg0) {
    var local0 = this.getStar();
    var local1 = this.defaultData[arg0];
    if (local1) {
      if (arg0 < 100) {
        this._checkNormalCategoryUnlock(arg0, local1.unlockStar);
        this._checkMoonCategoryUnlock(arg0 + 100);
      } else {
        this._checkMoonCategoryUnlock(arg0);
      }
    }
  },
  _checkNormalCategoryUnlock: function (arg0, arg1) {
    if (game.Data.isFreeGame) {
      return undefined;
    }
    var local0 = this.getStar();
    if (local0 >= arg1) {
      cc.log("this.coreData.lockStatus[" + arg0 + "] = " + this.coreData.lockStatus[arg0]);
      if (this.coreData.lockStatus[arg0] === game.LevelData.LockStatus.LOCKED) {
        this.setLockStatus(arg0, game.LevelData.LockStatus.READY_TO_UNLOCK);
      }
    }
  },
  _checkMoonCategoryUnlock: function () {
    var local2 = arguments[0];
    if (!game.Data.isReverseWorldOpen) {
      return undefined;
    }
    var local0 = game.LevelData.getCategory(local2 - 100);
    var local1 = game.LevelData.getCategory(local2);
    if (!local1.categoryReady) {
      return undefined;
    }
    local0.updatePercent();
    var local3 = function () {
      if (local1.lockStatus !== game.LevelData.LockStatus.UNLOCKED) {
        game.Data.newReverseWorldIdx = local2;
      }
      this.setLockStatus(local2, game.LevelData.LockStatus.UNLOCKED);
    }.bind(this);
    var local4 = game.LevelData.getCategory(0);
    if (game.Data.version.newVersion) {
      if (local4.levels[local4.levels.length - 1].isLevelPassed && local0.levels[0].isLevelPassed) {
        local3();
      }
    } else {
      if (local0.levels[local0.levels.length - 1].isLevelPassed) {
        local3();
      } else {
        this.setLockStatus(local2, game.LevelData.LockStatus.LOCKED);
      }
    }
  },
  getCoin: function () {
    var local0 = vee.VIPValues.getValue("coin");
    if (!local0) {
      return 0;
    }
    return local0;
  },
  addCoin: function (arg0) {
    vee.VIPValues.add2Value("coin", arg0);
    vee.VIPValues.save();
  },
  costCoin: function (arg0) {
    this.addCoin(-arg0);
    vee.VIPValues.save();
  },
  resetCoin: function () {
    vee.VIPValues.setValue("coin", 0);
    vee.VIPValues.save();
  },
  checkParkourlevelUnlock: function (arg0) {
    if (!game.Data.isFreeGame || vee.dataManager.isUnlockParkourLevel(arg0) === "true" || vee.dataManager.isAllParkourLevelUnlock() === "true") {
      return true;
    }
    return false;
  }
};
game.MiniLevelData = {
  levels: [
    [101],
    [101, 100, 107, 201, 205],
    [
      201,
      205,
      206,
      103,
      204,
      108
    ],
    [204, 108, 200, 105, 202],
    [202, 104, 203, 106]
  ],
  getMiniGameIdx: function (arg0) {
    if (arg0 > 0 && arg0 < this.levels.length) {
      var local0 = this.levels[arg0];
      var local1 = local0.length;
      var local2 = -1;
      var local3 = null;
      var local4 = [];
      for (var local5 = 0; local5 < local1; local5++) {
        var local6 = local0[local5];
        var local7 = parseInt(vee.data["miniid" + local6]);
        cc.log("checking levelIdx = " + local6);
        cc.log("checking map sign = " + local7);
        if (!local7) {
          local2 = local6;
          local3 = null;
          cc.log("selected : " + local2);
          break;
        }
        if (local2 == -1) {
          local2 = local6;
          local3 = local7;
          cc.log("selected : " + local2);
        } else if (local3 > local7) {
          local2 = local6;
          local3 = local7;
          cc.log("selected : " + local2);
        }
      }
      if (local3 !== null) {
        local2 = vee.Utils.randomChoice(local0);
      }
      cc.log("selectedIdx = " + local2);
      cc.log("map sign = " + local3);
      return local2;
    }
    return null;
  },
  setMiniGameProgress: function (arg0, arg1, arg2) {
    var local0 = parseInt(vee.data["miniid" + arg2]);
    if (arg0 > local0 || !local0) {
      cc.log("refresh mini sign : ctg " + arg1 + " level " + arg2);
      vee.data["miniid" + arg2] = arg0;
      vee.saveData();
    }
  }
};
