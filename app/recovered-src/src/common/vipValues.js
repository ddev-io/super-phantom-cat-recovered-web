// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/common/vipValues.dis
vee.NumberProtector = cc.Class.extend({
  _protect: 0,
  _secret: 0,
  _value: 0,
  _isInProtected: false,
  _callback: null,
  _default: 0,
  setDefaultValue: function (arg0) {
    this._secret = (vee.NumberProtector.SecretNum + vee.Utils.randomInt(0, 999));
    this._default = arg0;
    this._isInProtected = true;
    this._protect = (this._secret - arg0);
  },
  setProtectEnabled: function (arg0) {
    this._isInProtected = arg0;
    if (arg0) {
      this._protect = this._secret - this._value;
    }
  },
  setValue: function (arg0) {
    if (!_.isNumber(arg0)) {
      cc.log("Error!! NumberProtector value must be numeric:\t" + arg0);
      return false;
    }
    if (this._isValidate()) {
      this._value = arg0;
      if (this._isInProtected) {
        this._protect = this._secret - this._value;
      }
      return true;
    }
    cc.log("Error in VipValue.setValue NumberProtector value must be numeric:\t" + arg0);
    return false;
  },
  getValue: function () {
    if (this._isValidate()) {
      return this._value;
    }
    return this._default;
  },
  addValue: function (arg0) {
    if (_.isNumber(arg0)) {
      this.setValue(arg0 + this._value);
    }
  },
  setAbnormalCallback: function (arg0, arg1) {
    if (arg1) {
      this._callback = arg0;
    } else {
      this._afterAbnormal = arg0;
    }
  },
  _afterAbnormal: function () {
  },
  _onAbnormal: function () {
    vee.PopMgr.alert(vee.Utils.getStringByLanguage("Abnormal data operation detected!", "\u53d1\u73b0\u975e\u6b63\u5e38\u7684\u6570\u636e\u64cd\u4f5c!"), vee.Utils.getStringByLanguage("Error", "\u51fa\u9519\u4e86"));
    this._value = this._default;
    this._protect = (this._secret - this._value);
    this._afterAbnormal();
  },
  _isValidate: function (arg0) {
    if (arg0 == undefined) {
      arg0 = true;
    }
    if (!this._isInProtected) {
      return true;
    }
    if (this._value + this._protect != this._secret) {
      if (arg0) {
        if (this._callback && _.isFunction(this._callback)) {
          this._callback(this);
        } else {
          this._onAbnormal();
        }
      }
      return false;
    }
    return true;
  },
  _getDataObject: function () {
    if (!this._isValidate(false)) {
      this._value = this._default;
    }
    return {
      isProtect: this._isInProtected,
      defaultValue: this._default,
      value: this._value
    };
  },
  _setDataObject: function (arg0) {
    this.setDefaultValue(arg0.defaultValue);
    this.setProtectEnabled(arg0.isProtect);
    this.setValue(arg0.value);
  }
});
vee.NumberProtector.create = function (arg0, arg1) {
    var local0 = new vee.NumberProtector();
    local0.setAbnormalCallback(arg1, true);
    local0.setDefaultValue(arg0);
    local0.setProtectEnabled(true);
    return local0;
  };
vee.NumberProtector.SecretNum = 19861024;
vee._VIPValues = cc.Class.extend({
  _protectors: null,
  _bindings: null,
  bind2Value: function (arg0, arg1) {
    if (!this._bindings[arg0]) {
      this._bindings[arg0] = [];
    }
    var local0 = this._bindings[arg0].length;
    for (var local1 in this._bindings) {
      if (!this._bindings[local1]) {
        local0 = local1;
      }
    }
    this._bindings[arg0].push(arg1);
    return {
      key: arg0,
      index: local0
    };
  },
  releaseBinding: function (arg0) {
    if (!arg0) {
      return undefined;
    }
    var local0 = arg0.key;
    var local1 = arg0.index;
    if (!this._bindings[local0]) {
      return undefined;
    }
    this._bindings[local0][local1] = null;
  },
  setValue: function () {
    var key = arguments[0];
    var value = arguments[1];
    var local0 = this._protectors[key];
    if (!local0) {
      local0 = vee.NumberProtector.create(value);
      local0.key = key;
      var owner = this;
      local0.setAbnormalCallback(function () {
        owner.removeValue(key);
      });
      this._protectors[key] = local0;
    }
    if (!local0.setValue(value)) {
      cc.log("value key :" + key);
    }
    var local1 = this._bindings[key];
    if (local1) {
      for (var local2 in local1) {
        if (local1[local2]) {
          local1[local2](key, value);
        }
      }
    }
  },
  add2Value: function (arg0, arg1) {
    this.setValue(arg0, (this.getValue(arg0) + arg1));
  },
  forEachValue: function (arg0) {
    for (var local0 in this._protectors) {
      arg0(local0, this._protectors[local0].getValue());
    }
  },
  removeValue: function (arg0) {
    delete this._bindings[arg0];
    delete this._protectors[arg0];
  },
  getValue: function (arg0) {
    if (this._protectors && this._protectors.hasOwnProperty(arg0)) {
      return this._protectors[arg0].getValue();
    }
    return null;
  },
  getNumberProtector: function (arg0) {
    return this._protectors[arg0];
  },
  load: function (arg0, arg1) {
    this._protectors = {};
    this._bindings = {};
    arg1 = arg1 || "sulavPiv";
    var local0 = vee.Utils.loadObj(arg1);
    if (!local0) {
      local0 = {};
      if (arg0) {
        for (var local1 in arg0) {
          local0[local1] = {
            isProtect: true,
            defaultValue: arg0[local1],
            value: arg0[local1]
          };
        }
      }
    }
    for (var local1 in local0) {
      var local2 = new vee.NumberProtector();
      local2._setDataObject(local0[local1]);
      this._protectors[local1] = local2;
    }
  },
  save: function (arg0) {
    arg0 = arg0 || "sulavPiv";
    var local0 = {};
    for (var local1 in this._protectors) {
      local0[local1] = this._protectors[local1]._getDataObject();
    }
    vee.Utils.saveObj(local0, arg0);
  }
});
vee._VIPValues.create = function (arg0, arg1) {
    var local0 = new vee._VIPValues();
    local0.load(arg0, arg1);
    return local0;
  };
vee.VIPValues = new vee._VIPValues();
vee.VIPValues.create = vee._VIPValues.create;
