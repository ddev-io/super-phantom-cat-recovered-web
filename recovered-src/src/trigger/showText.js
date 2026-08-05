var EleText = vee.Class.extend({
  lbTitle: null,
  lbContent: null,
  id: -1,
  _showOnce: false,

  setText: function (title, contentKey) {
    this.lbTitle.setString(title);
    this.lbContent.setString(vee.Utils.getLocalizedStringForKey(contentKey));
  },

  setShowOnce: function (value) {
    this._showOnce = value;
  },

  show: function (pos, duration) {
    this.rootNode.setPosition(pos);
    this.rootNode.setVisible(true);
    this.playAnimate("Show");
    vee.Audio.playEffect(res.inGame_efx_showText_mp3);

    if (duration > 0) {
      vee.Utils.scheduleOnceForTarget(this.rootNode, function () {
        this.playAnimate("Hide", function () {
          this.rootNode.setVisible(false);
          EleText.ReuseText.push(this);
          EleText.Texts[this.id] = this._showOnce;
        }.bind(this));
      }.bind(this), duration);
    }
  }
});

EleText.Texts = [];
EleText.ReuseText = [];

EleText.GetText = function () {
  var text = this.ReuseText.pop();

  if (!text) {
    text = cc.BuilderReader.load(res.eleText_ccbi).controller;
    game.Data.oLyGame.lyMap.addChild(text.rootNode, -999);
  }

  text.setShowOnce(false);
  return text;
};

EleText.Clear = function () {
  EleText.Texts = [];
  EleText.ReuseText = [];
};

EleText.Show = function (id, pos, title, contentKey, duration, showOnce) {
  var text = this.Texts[id];

  if (!text) {
    text = this.GetText();
    text.id = id;
    text.setText(title, contentKey);

    if (duration.length > 0) {
      duration = parseFloat(duration);
    } else {
      duration = -1;
    }

    text.setShowOnce(showOnce);
    text.show(pos, duration);
    this.Texts[id] = text;
  }
};

Trigger.ShowText = Trigger.extend({
  func: function (grid, arg1, showOnce) {
    var data = this.name.split(";");

    if (data[4]) {
      var offset = game.Data.getPointFromString1(data[4]);
      grid = vee.Utils.pAdd(grid, offset);
    }

    var pos = game.Logic.getTilePosCenterByGrid(grid);

    if (data[5] && vee.Controller.isConnected) {
      return;
    }

    EleText.Show(data[0], pos, data[1], data[2], data[3], showOnce);
  }
});

Trigger.ShowTextOnce = Trigger.ShowText.extend({
  func: function (grid) {
    var data = this.name.split(";");

    if (data[4]) {
      var offset = game.Data.getPointFromString1(data[4]);
      grid = vee.Utils.pAdd(grid, offset);
    }

    var pos = game.Logic.getTilePosCenterByGrid(grid);
    EleText.Show(data[0], pos, data[1], data[2], data[3], true);
  }
});
