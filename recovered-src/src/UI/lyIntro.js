// Source-like reconstruction from UI/lyIntro.dis

var LyIntro = vee.Class.extend({
  _countOfAnimate: 0,
  _sumOfAnimates: 0,
  _moveSpeed: 120,
  _isPlayerStop: false,
  _playerToMacCenter: 3,

  _animateTimeLines: {
    logo_dis: "logo",
    mac_show: "show",
    mac_run: "run",
    logo_start: "2",
    breath: "huxi",
    run: "run"
  },

  onLoaded: function () {
  },

  ccbInit: function () {
    this._sumOfAnimates = 2;
    this.playAnimate(this._animateTimeLines.logo_dis, function () {
      this._countOfAnimate += 1;
      if (this._countOfAnimate === 2) {
        this.mac.controller.playAnimate(this._animateTimeLines.mac_show);
        cc.log("animate callback");
        this.player.controller.playAnimate(this._animateTimeLines.run);
        this._updateFunc = this.updateFunc.bind(this);
        vee.Utils.scheduleCallbackForTarget(this.rootNode, this._updateFunc);
      }
      this.handleKey(true);
    }.bind(this));
  },

  updateFunc: function (dt) {
    cc.log("update");
    if (!this._isPlayerStop) {
      this.player.setPositionX(this.player.getPositionX() + this._moveSpeed * dt);
      this.judgeIsPlayerMoveToTheGoal();
    }
  },

  judgeIsPlayerMoveToTheGoal: function () {
    this._countOfAnimate = 0;

    if (this.player.getPositionX() >= this.mac.getPositionX()) {
      this.player.controller.playAnimate(this._animateTimeLines.breath);
      this._isPlayerStop = true;
      this.player.setPositionX(this.mac.getPositionX() - this._playerToMacCenter);
      vee.Utils.unscheduleCallbackForTarget(this.rootNode, this._updateFunc);

      this.rootNode.runAction(cc.sequence(
        cc.delayTime(0.5),
        cc.callFunc(function () {
          this.mac.controller.playAnimate(this._animateTimeLines.mac_run, function () {
            this.logo.controller.playAnimate(this._animateTimeLines.logo_start, function () {
              this._countOfAnimate += 1;
              if (this._countOfAnimate === 4) {
                this.onIntroOver();
              }
            }.bind(this));
          }.bind(this));
        }.bind(this))
      ));
    }
  },

  onIntroOver: function () {
    vee.Transition.out(res.MapTransition_ccbi, function () {
      vee.PopMgr.closeAll();
      cc.director.purgeCachedData();
      vee.PopMgr.popCCB("res/veeGameLayer.ccbi");
      game.Data.oLyGame.onLoaded();
      game.Data.oLyGame.initStage("Tutorial");
    });
  }
});

cc.BuilderReader.registerController("LyIntro", LyIntro);

var MacCtrl = vee.Class.extend({});
cc.BuilderReader.registerController("MacCtrl", MacCtrl);

var LogoCtrl = vee.Class.extend({});
cc.BuilderReader.registerController("LogoCtrl", LogoCtrl);

var HeroCtrl = vee.Class.extend({});
cc.BuilderReader.registerController("HeroCtrl", HeroCtrl);

var PlayerCtrl = vee.Class.extend({});
cc.BuilderReader.registerController("PlayerCtrl", PlayerCtrl);

var RobotCtrl = vee.Class.extend({});
cc.BuilderReader.registerController("RobotCtrl", RobotCtrl);

LyIntro.show = function () {
  var layer = vee.PopMgr.popCCB(res.intro_ccbi);
  layer.controller.ccbInit();
};
