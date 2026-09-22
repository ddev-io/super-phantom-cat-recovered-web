var ItemFire = Item.extend({
  _type: game.ObjectType.Fire,
  spFire: null,
  _loopEfx: null,
  _startPos: null,
  _tarPos: null,
  _height: null,
  _dur: 0,

  bornWithPos: function (pos) {
    vee.Utils.scheduleCallbackForTarget(this.rootNode, this.updatePos.bind(this), 0.1);
    this._startPos = pos;

    var configObj = game.Logic.configMap.getObject(this._grid);
    if (configObj) {
      var config = configObj.name.split(",");
      if (config.length === 3) {
        var targetGrid = cc.p(parseInt(config[0]), parseInt(config[1]));
        targetGrid = vee.Utils.pAdd(targetGrid, this._gridInMap);
        this._tarPos = cc.p(game.Logic.getTilePosCenterByGrid(targetGrid));

        var heightGridY = this._gridInMap.y + parseInt(config[2]);
        var heightPos = game.Logic.getTilePosCenterByGrid(cc.p(0, heightGridY));
        this._height = heightPos.y - this._tarPos.y;

        if (this._tarPos.x < this._grid.x) {
          this.nodeBox.setScaleX(-1);
        }

        this._dur = 1.6;
        this.runJump();
      } else {
        this.errorInInit();
      }
    } else {
      this.errorInInit();
    }

    this.playAnimate("run");
  },

  runJump: function () {
    this._hasCollide = true;
    this.spFire.setVisible(true);
    this.setElePosition(this._startPos);
    vee.Audio.playEffect(res.inGame_efx_fire_mp3);

    this._container.runAction(cc.sequence(
      cc.jumpTo(this._dur, this._tarPos.x, this._tarPos.y, this._height, 1),
      cc.callFunc(function () {
        this._hasCollide = false;
        this.spFire.setVisible(false);
      }.bind(this)),
      cc.delayTime(0.5),
      cc.callFunc(function () {
        this.runJump();
      }.bind(this))
    ));
  },

  errorInInit: function () {
    cc.log("error in init item fire!");
    this._container.removeFromParent();
  },

  updatePos: function () {
    var fireRect = this.getEleRect();
    var playerRect = game.Data.oPlayerCtl.getEleRect();

    if (cc.rectIntersectsRect(fireRect, playerRect)) {
      this.collidePlayer();
    }
  },

  getInhaleController: function () {
    return null;
  },

  collidePlayer: function () {
    if (game.Data.oPlayerCtl._isBounce || !this._hasCollide || game.Data.playerInvisible || game.Data.playerHawk) {
      return;
    }

    var dir = this.getElePosition().x > game.Data.oPlayerCtl.getElePosition().x ?
      vee.Direction.Left :
      vee.Direction.Right;

    game.Data.oPlayerCtl.getShock(dir, true);
  },

  onDead: function () {
  }
});
