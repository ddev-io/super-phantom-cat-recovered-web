// Recovered source-like JS from /mnt/data/smdis/dis/efx/efxGuideLogo.dis
// Source-like reconstruction from smdis.

var EfxGuideLogo = vee.Class.extend({
  _isOver: false,
  show: function () {
    this.playAnimate("start");
  },
  initController: function () {
    vee.Controller.registerGlobalButtonAction(this.onTouch.bind(this));
  },
  onTouch: function () {
    if (this._isOver) {
      return undefined;
    }
    this._isOver = true;
    vee.Transition.out(res.MapTransition_ccbi, function () {
      LyLevelSelect.show();
    });
  }
});
