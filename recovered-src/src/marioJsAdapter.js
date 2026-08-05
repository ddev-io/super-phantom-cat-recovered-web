// Recovered first-pass JS from /mnt/data/work_supercat_phase34_all/handoff-web/project/recovered-src/dis-samples/dis/marioJsAdapter.dis
var mario = mario || {};
mario.initGame = function () {
    var local0 = cc.Layer.create();
    local0.setContentSize(cc.size(1136, 768));
    vee.PopMgr.popLayer(local0);
    mario.JsAdapter.getInstance().initGame(local0, 100);
  };
