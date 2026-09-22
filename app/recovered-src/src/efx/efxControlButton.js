// Source-like reconstruction from smdis/efx/efxControlButton.dis

var EfxHighlightButton = vee.Class.extend({
  isGesture: false,

  onJump: function () {
    if (this._buttonMask & LyGame.ControlButtonType.JumpButton) {
      this.hide();
    }
  },

  onAction: function () {
    if (this._buttonMask & LyGame.ControlButtonType.ActionButton) {
      this.hide();
    }
  },

  onMove: function () {
    return;
  },

  _buttonMask: null,

  show: function (buttonMask, loop) {
    this._buttonMask = buttonMask;

    if (buttonMask & LyGame.ControlButtonType.ActionButton) {
      if (!game.Data.oLyGame.btnSmash.isVisible()) {
        this.rootNode.setVisible(false);
        return;
      }
      this.rootNode.setPosition(game.Data.oLyGame.btnSmash.getPosition());
    } else if (buttonMask & LyGame.ControlButtonType.JumpButton) {
      if (!game.Data.oLyGame.btnJump.isVisible()) {
        this.rootNode.setVisible(false);
        return;
      }
      this.rootNode.setPosition(game.Data.oLyGame.btnJump.getPosition());
    }

    this._stop = false;
    this.rootNode.setVisible(true);
    this.playAnimate(loop ? "loop" : "show");
  },

  getButtonMask: function () {
    return this._buttonMask;
  },

  remove: function () {
    this.rootNode.removeFromParent();
  },

  _stop: false,

  hide: function () {
    this._stop = true;
  },

  _animationCompleted: function () {
    if (this._stop) {
      this.rootNode.stopAllActions();
      this.rootNode.setVisible(false);
    }
  }
});

var EfxHighlightButtonMove = EfxHighlightButton.extend({
  onMove: function () {
    this.hide();
  },

  show: function (buttonMask, loop) {
    if (!game.Data.oLyGame.btnMove.isVisible()) {
      return;
    }

    this.rootNode.setPosition(game.Data.oLyGame.btnMove.getPosition());
    this._stop = false;
    this.rootNode.setVisible(true);
    this.playAnimate(loop ? "loop" : "show");
  }
});

var EfxShowBtnA = vee.Class.extend({
  _highlight: false,
  spBtn: null,

  show: function (highlight) {
    this._highlight = highlight;
    this.rootNode.setPosition(game.Data.oLyGame.btnSmash.getPosition());
    this.playAnimate("show", function () {
      this.rootNode.removeFromParent();
      if (this._highlight) {
        game.Data.oLyGame.setHighlightControlButton(LyGame.ControlButtonType.ActionButton, true);
      }
    }.bind(this));

    switch (game.Data.playerType) {
      case game.PlayerType.Smash:
        this.spBtn.setTexture(res.btn_a_1_fall_png);
        break;
      case game.PlayerType.Teleport:
        this.spBtn.setTexture(res.btn_a_3_blink_png);
        break;
      case game.PlayerType.Bullet:
        this.spBtn.setTexture(res.btn_a_2_shoot_png);
        break;
      case game.PlayerType.Bomb:
        this.spBtn.setTexture(res.btn_a_4_bomb_png);
        break;
    }
  },

  showButton: function () {
    game.Data.oLyGame.showControlButton(LyGame.ControlButtonType.ActionButton);
  }
});

var EfxShowBtnB = EfxShowBtnA.extend({
  _highlight: false,

  show: function (highlight) {
    this._highlight = highlight;
    this.rootNode.setPosition(game.Data.oLyGame.btnJump.getPosition());
    this.playAnimate("show", function () {
      this.rootNode.removeFromParent();
      if (this._highlight) {
        game.Data.oLyGame.setHighlightControlButton(LyGame.ControlButtonType.JumpButton, true);
      }
    }.bind(this));
  },

  showButton: function () {
    game.Data.oLyGame.showControlButton(LyGame.ControlButtonType.JumpButton);
  }
});

var EfxShowBtnMove = EfxShowBtnA.extend({
  _highlight: false,

  show: function (highlight) {
    this._highlight = highlight;
    this.rootNode.setPosition(game.Data.oLyGame.btnMove.getPosition());
    this.playAnimate("show", function () {
      this.rootNode.removeFromParent();
      if (this._highlight) {
        game.Data.oLyGame.setHighlightControlButton(LyGame.ControlButtonType.MoveButton, true);
      }
    }.bind(this));
  },

  showButton: function () {
    game.Data.oLyGame.showControlButton(LyGame.ControlButtonType.MoveButton);
  }
});

var EfxHighlightGesture = EfxHighlightButton.extend({
  isGesture: true,

  onJump: function () {
    return;
  },

  onAction: function () {
    this.hide();
  },

  show: function (buttonMask, loop) {
    if (!loop || game.Data.playerType === game.PlayerType.Normal) {
      this.rootNode.setVisible(false);
      return;
    }

    this.rootNode.setVisible(true);
    this.playAnimate(game.Data.playerType === game.PlayerType.Smash ? "B" : "A");
  }
});
