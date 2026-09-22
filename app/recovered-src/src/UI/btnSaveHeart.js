// Recovered source-like JS from /mnt/data/smdis/dis/UI/btnSaveHeart.dis
// Source-like reconstruction from smdis.

var BtnSaveHeart = vee.Class.extend({
  lbCoinNum: null,
  onCreate: function () {
    this.lbCoinNum.setString(game.Data.savePointLifePrice);
  },
  showAnimate: function () {
    this.playAnimate("show");
  },
  hideAnimate: function () {
    this.playAnimate("end");
  },
  onBuy: function () {
    if ((game.LevelData.getCoin() < game.Data.savePointLifePrice)) {
      AlertMoreCoin.show();
    } else {
      game.LevelData.costCoin(game.Data.savePointLifePrice);
      game.Data.oLyGame.refreshCoin();
      game.Data.addLifeTo(game.Data.playerMaxLife);
      EfxGetLife.show(game.Data.oPlayerCtl.getElePosition());
      BtnSaveHeart.hide();
    }
  },
  onExit: function () {
    BtnSaveHeart.ctl = null;
  }
});
BtnSaveHeart.ctl = null;
BtnSaveHeart.hasShown = false;
BtnSaveHeart.show = function () {
  if (((BtnSaveHeart.hasShown) || ((game.Data.playerLife >= game.Data.playerMaxLife)))) {
    return undefined;
  }
  BtnSaveHeart.hasShown = true;
  if (!(BtnSaveHeart.ctl)) {
    var local0 = cc.BuilderReader.load(res.saveHeart_ccbi);
    game.Data.oLyGame.nodeT.addChild(local0, 8);
    BtnSaveHeart.ctl = local0.controller;
  }
  BtnSaveHeart.ctl.showAnimate();
  game.Data.gridChangeFunc = function (arg0) {
    if (((((arg0.x + 1) >= ItemSavePoint.btnBuyGrid.x)) && (((arg0.x - 1) <= ItemSavePoint.btnBuyGrid.x)) && (!((arg0.y == ItemSavePoint.btnBuyGrid.y))))) {
      BtnSaveHeart.hide();
    }
  };
};
BtnSaveHeart.hide = function () {
  if (!(BtnSaveHeart.hasShown)) {
    return undefined;
  }
  BtnSaveHeart.hasShown = false;
  game.Data.gridChangeFunc = null;
  if (BtnSaveHeart.ctl) {
    BtnSaveHeart.ctl.hideAnimate();
  }
};
