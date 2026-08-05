// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/InhaleObj.dis
var InhaleObj = vee.Class.extend({
  obj: null,
  inhaleObj: function () {
    game.Logic.dynamicObjMap.removeObject(this.obj._gridInMap);
    this.obj._container.runAction(cc.sequence(
      cc.spawn(
        cc.sequence(
          cc.moveBy(0.7, cc.p(0, 20)),
          cc.callFunc(function () {
            this.obj.inhaleController.releaseObj = function () {};
          }.bind(this)),
          cc.moveBy(0.2, cc.p(0, -10))
        ),
        cc.EaseExponentialIn.create(cc.moveBy(1, cc.pSub(game.Data.oPlayerCtl.getElePosition(), this.obj.getElePosition())))
      ),
      cc.callFunc(function () {
        this.obj.inhaleController.releaseObj = function () {};
        this.obj.getAte();
      }.bind(this))
    ));
  },
  releaseObj: function () {
    this.obj._container.stopAllActions();
    game.Logic.dynamicObjMap.setObject(this.obj, this.obj._gridInMap);
    this.obj.inhaleController = null;
  }
});
var InhaleDamageObj = InhaleObj.extend({
  inhaleObj: function () {
    game.Logic.dynamicObjMap.removeObject(this.obj._gridInMap);
    this.obj._container.stopAllActions();
    this.obj._container.runAction(cc.sequence(
      cc.spawn(
        cc.sequence(
          cc.moveBy(0.7, cc.p(0, 20)),
          cc.moveBy(0.2, cc.p(0, -10))
        ),
        cc.EaseExponentialIn.create(cc.moveBy(1, cc.pSub(game.Data.oPlayerCtl.getElePosition(), this.obj.getElePosition())))
      ),
      cc.callFunc(function () {
        this.obj.collideInhale();
        this.releaseObj();
      }.bind(this))
    ));
  },
  releaseObj: function () {
    this.obj._container.stopAllActions();
    game.Logic.dynamicObjMap.setObject(this.obj, this.obj._gridInMap);
    this.obj.inhaleController = null;
    game.Data.oPlayerCtl.stopUpdateSucking();
  }
});
var InhaleSpiderObj = InhaleObj.extend({
  inhaleObj: function () {
    this.obj._container.stopAllActions();
    game.Logic.dynamicObjMap.removeObject(this.obj._gridInMap);
    var local0 = 0.02;
    var local1 = 5;
    this.obj.nodeBox.runAction(cc.sequence(
      cc.repeat(
        cc.sequence(
          cc.moveBy(local0, cc.p(local1, 0)),
          cc.moveBy(local0 * 2, cc.p(-local1 * 2, 0)),
          cc.moveBy(local0, cc.p(local1, 0))
        ),
        10
      ),
      cc.callFunc(function () {
        this.obj.inhaleController.releaseObj = function () {};
        this.obj.spLine.setOpacity(0);
      }.bind(this)),
      cc.EaseExponentialIn.create(cc.moveBy(0.1, cc.pSub(game.Data.oPlayerCtl.getElePosition(), this.obj.getElePosition()))),
      cc.callFunc(function () {
        this.obj.inhaleController.releaseObj = function () {};
        this.obj.getAte();
        this.obj.nodeBox.setPosition(cc.p(0, 0));
      }.bind(this))
    ));
  },
  releaseObj: function () {
    this.obj.nodeBox.stopAllActions();
    this.obj.nodeBox.setPositionX(0);
    this.obj.runMoveAnimate();
    game.Logic.dynamicObjMap.setObject(this.obj, this.obj._gridInMap);
    this.obj.inhaleController = null;
    game.Data.oPlayerCtl.stopUpdateSucking();
  }
});
