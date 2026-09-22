// Source-like reconstruction from UI/uiEnergy.dis

var UIEnergy = vee.Class.extend({
  lbCounter: null,
  nodeEnergy: null,
  lbPowerNum: null,
  lbPowerCounter: null,
  powerTimeLeft: null,
  mTimer: null,
  spProgress: null,
  timeLeft: null,

  onCreate: function () {
    game.Data.oEnergyCtl = this;
    this.showEnergy();
  },

  onExit: function () {
    game.Data.oEnergyCtl = null;
    vee.Utils.unscheduleAllCallbacksForTarget(this.rootNode);
  },

  showEnergy: function () {
    var energy = game.Data.getEnergy();

    for (var i = 1; i < 6; i++) {
      var cell = this.nodeEnergy.getChildByTag(i);
      if (!cell) {
        cell = UIEnergyCell.create();
        this.nodeEnergy.addChild(cell);
        cell.setTag(i);
        cell.setPositionX(i * 38 - 46);
      }

      if (i <= energy) {
        cell.controller.show();
      } else {
        cell.controller.hide();
      }
    }

    vee.Utils.unscheduleAllCallbacksForTarget(this.rootNode);

    if (energy < 5) {
      this.playAnimate("empty");

      var reviveTs = game.Data.getEnergyReviveTs();
      var nowTs = new Date().getTime();
      this.timeLeft = parseInt((reviveTs - nowTs) / 1000, 10);
      this.setTimeStr();

      vee.Utils.scheduleCallbackForTarget(
        this.rootNode,
        this.updateTimeCounter.bind(this),
        1
      );
    } else if (parseInt(vee.dataManager.getPowerTs(), 10) > 0) {
      if (parseInt(game.Data.getPowerLeftTime(), 10) > 0) {
        this.powerTimeLeft = parseInt(game.Data.getPowerLeftTime(), 10);
        this.playAnimate("unlimiting");
        this.nodeEnergy.setVisible(false);
        this.setPowerTimeStr();
        this.updateProgressBar(this.powerTimeLeft / (game.Data.energyUnlimitedTime * 60));

        vee.Utils.scheduleCallbackForTarget(
          this.rootNode,
          this.updatePowerTimeCounter.bind(this),
          1
        );
        this.spProgress.setVisible(true);
      } else {
        vee.Utils.scheduleOnce(function () {
          this.playAnimate("powerOver");
        }.bind(this), 1);
        vee.dataManager.setPowerTs(0);
      }
    } else {
      this.playAnimate("full");
      this.lbCounter.setVisible(true);
      this.lbCounter.setString("MAX");
    }

    this.lbPowerNum.setString("x" + game.Data.getPower());
  },

  onBuyPower: function () {
    AlertGetPower.show(game.LifeEmptyType.Select);
  },

  usePower: function () {
    this.powerTimeLeft = parseInt(game.Data.getPowerLeftTime(), 10);
    this.playAnimate("usePower", function () {
      this.setPowerTimeStr();
      vee.Utils.unscheduleAllCallbacksForTarget(this.rootNode);
      vee.Utils.scheduleCallbackForTarget(
        this.rootNode,
        this.updatePowerTimeCounter.bind(this),
        1
      );
      this.spProgress.setVisible(true);
    }.bind(this));
    vee.saveData();
  },

  setPowerTimeStr: function () {
    var min = Math.floor(this.powerTimeLeft / 60);
    var sec = Math.floor(this.powerTimeLeft - min * 60);
    this.lbPowerCounter.setString(this._formatTime(min, sec));
  },

  updatePowerTimeCounter: function () {
    this.powerTimeLeft = this.powerTimeLeft - 1;

    if (this.powerTimeLeft > 0) {
      this.setPowerTimeStr();
      this.updateProgressBar(this.powerTimeLeft / (game.Data.energyUnlimitedTime * 60));
    } else {
      vee.Utils.unscheduleAllCallbacksForTarget(this.rootNode);
      this.playAnimate("powerOver", function () {
        this.showEnergy();
        this.nodeEnergy.setVisible(true);
      }.bind(this));
      vee.dataManager.setPowerTs(0);
      vee.saveData();
    }
  },

  initProgress: function () {
  },

  updateProgressBar: function (percent) {
    this.spProgress.setScaleX(5.55 * percent);
    this.spProgress.setPositionX(-111);
  },

  removeProgressBar: function () {
  },

  costAnimate: function () {
    var cell = this.nodeEnergy.getChildByTag(game.Data.getEnergy());
    if (cell) {
      cell.controller.use();
    } else {
      cc.log("error : invalid energy tag = " + game.Data.getEnergy());
    }
  },

  setTimeStr: function () {
    var min = Math.floor(this.timeLeft / 60);
    var sec = Math.floor(this.timeLeft - min * 60);
    this.lbCounter.setString(this._formatTime(min, sec));
  },

  updateTimeCounter: function () {
    this.timeLeft = this.timeLeft - 1;

    if (this.timeLeft > 0) {
      this.setTimeStr();
      return;
    }

    game.Data.addEnergy(1);
    var energy = parseInt(vee.dataManager.getEnergy(), 10);
    if (energy < 5) {
      vee.dataManager.setEnergyTs(game.Data.nextEnergyTsFromNow());
    }
    this.showEnergy();
  },

  _formatTime: function (min, sec) {
    min = min < 10 ? "0" + min : min;
    sec = sec < 10 ? "0" + sec : sec;
    return min + ":" + sec;
  }
});

var UIEnergyTemp = vee.Class.extend({});
