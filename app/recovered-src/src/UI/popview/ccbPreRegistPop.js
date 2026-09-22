// Source-like reconstruction from UI/popview/ccbPreRegistPop.dis

var ccbPreRegistPop = vee.Class.extend({
  ccbLbinfo: null,
  labRegist: null,
  textField: null,

  init: function () {
    this._box1 = new cc.EditBox(
      cc.size(480, 100),
      new cc.Scale9Sprite(res.level_image_mid_SPC2_email_png)
    );
    this._box1.setPlaceHolder("Enter your Email ID..");
    this._box1.setPlaceholderFont("res/Linotte-Regular.ttf", 36);
    this._box1.x = this.ccbLbinfo.getPositionX();
    this._box1.y = this.ccbLbinfo.getPositionY();
    this._box1.setFont("res/Linotte-Regular.ttf", 36);
    this._box1.setFontColor(cc.color(251, 250, 0));
    this._box1.setInputMode(cc.EDITBOX_INPUT_MODE_EMAILADDR);
    this.rootNode.addChild(this._box1);
    this.labRegist.setFontName("");
  },

  onClose: function () {
    if (this._isOver) {
      return;
    }

    this._isOver = true;
    this._box1.removeFromParent();
    this.playAnimate("hide", function () {
      vee.PopMgr.closeLayerByCtl(this);
    }.bind(this));
  },

  getResponeText: function (text) {
    if (text === "You have successfullly registered!") {
      return vee.Utils.getLocalizedStringForKey("Registered");
    }
    if (text === "This email address has already been registered") {
      return vee.Utils.getLocalizedStringForKey("Already in use");
    }
    if (text === "Wrong Email format") {
      return vee.Utils.getLocalizedStringForKey("wrong email address");
    }
    return vee.Utils.getLocalizedStringForKey("Unknown Error");
  },

  checkEmail: function (email) {
    var emailRegExp = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
    return emailRegExp.test(email);
  },

  onRegist: function () {
    if (!this.checkEmail(this._box1.getString())) {
      vee.PopMgr.alert(vee.Utils.getLocalizedStringForKey("wrong email address"));
      return;
    }

    var platform = game.Data.isAndroid ? "Android" : "IOS";
    var url = "http://www.veewo.com/regist?email=" + this._box1.getString() + "&platform=" + platform;
    cc.log("url=======" + url);

    vee.PopMgr.popLoading();
    this.httpRequest(url, function (success, request) {
      vee.PopMgr.removeLoading();
      if (success) {
        cc.log("request success========request===" + request);
        var responseText = request.responseText;
        cc.log("all===" + responseText);
        var message = this.getResponeText(responseText);
        vee.PopMgr.alert(message, "", function () {
          cc.log("alert==================================");
          if (responseText === "You have successfullly registered!") {
            this.onClose();
          }
        }.bind(this));
      } else {
        cc.log("request fail ======request ====" + request);
        vee.PopMgr.alert(request.responseText);
      }
    }.bind(this), 10, function () {
      vee.PopMgr.removeLoading();
    });
  },

  httpRequest: function (url, callback, timeoutSeconds, timeoutCallback) {
    var request = cc.loader.getXMLHttpRequest();
    cc.log("Status: Send Get Request to " + url);

    request.timeout = timeoutSeconds * 1000;
    request.open("GET", url, true);
    request.onreadystatechange = function () {
      cc.log("zq debug ready state change======" + request.readyState);
      if (request.readyState === 4 && request.status >= 200 && request.status <= 207) {
        cc.log("Status: Got GET response! " + request.statusText);
        callback(true, request);
      } else if (request.readyState === 4) {
        callback(false, request);
      }
    };
    request.ontimeout = function () {
      vee.PopMgr.alert(vee.Utils.getLocalizedStringForKey("Timeout"));
      vee.PopMgr.removeLoading();
    };
    request.send();
    vee.Utils.scheduleOnce(timeoutCallback, timeoutSeconds);
  }
});

ccbPreRegistPop.show = function () {
  var layer = vee.PopMgr.popCCB(res.levelPreregisterpopup_ccbi, { alpha: 0 });
  layer.controller.init();
};
