// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/levelController/levelController.dis
var LevelController = cc.Class.extend({
  _story: null,
  _handSkip: false,
  prepare: function () {
    this._story = [];
  },
  complete: function () {
  },
  onUpdateLife: function () {
  },
  showStory: function (arg0, arg1, arg2) {
    if (this._story[arg0]) {
      return;
    }
    if (this._handSkip) {
      Story.showStory(arg2, arg1, false, arg0, true);
    } else {
      this._story[arg0] = true;
      Story.showStory(arg2, arg1, false, arg0, false);
    }
  },
  skipStory: function (arg0) {
    var local0 = this["eventStory" + arg0];
    this._handSkip = true;
    if (local0) {
      local0.bind(this)();
    }
    this._handSkip = false;
  },
  blockStory: function (arg0, arg1) {
    var local0 = game.Data.getStoryHasPlayed(game.Data.performingTMXIdx, arg0);
    cc.log("story " + arg0 + " played is " + local0);
    if (local0 || arg1) {
      this._story[arg0] = true;
    }
  }
});
LevelController.getController = function (arg0) {
    var local0 = LevelController["Level" + arg0];
    if (local0) {
      return new local0();
    }
    return new LevelController();
  };
