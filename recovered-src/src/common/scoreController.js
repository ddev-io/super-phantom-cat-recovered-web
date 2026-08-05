// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/common/scoreController.dis
var vee = vee || {};
vee.ScoreController = cc.Class.extend({
  _label: null,
  _displayValue: 0,
  _prefix: null,
  _appendix: null,
  _formatFunction: null,
  _numberProtector: null,
  _invisibleWhenEmpty: false,
  _rootNode_onExit: null,
  _tempValue: 0,
  _offset: 0,
  _enableFlow: false,
  _flowDuration: 0.3,
  init: function (arg0, arg1, arg2) {
    this.rootNode = arg0;
    this._label = arg0;
    this._numberProtector = vee.NumberProtector.create(arg1);
    this._numberProtector.setValue(arg1);
    this._formatFunction = arg2;
    this._invisibleWhenEmpty = false;
    arg0.scoreController = this;
    this._updateValue();
  },
  initWithKey: function (arg0, arg1, arg2) {
    if (this._bindingID) {
      this.onExit();
    }
    this._label = arg0;
    this._formatFunction = arg2;
    this.bind2VIPValues(arg1);
    arg0.scoreController = this;
  },
  setEnableFlow: function (arg0, arg1) {
    this._enableFlow = arg0;
    this._flowDuration = arg1 ? arg1 : this._flowDuration;
  },
  setInvisibleWhenEmpty: function (arg0) {
    this._invisibleWhenEmpty = arg0;
    this._updateValue();
  },
  _bindingID: null,
  bind2VIPValues: function (arg0) {
    var local0 = vee.VIPValues.getNumberProtector(arg0);
    if (local0) {
      this._numberProtector = local0;
      this._updateValue();
      this._bindingID = vee.VIPValues.bind2Value(arg0, function () {
        this._updateValue();
      }.bind(this));
    }
    this._rootNode_onExit = this._label.onExit;
    this._label.onExit = this.onExit.bind(this);
  },
  onExit: function () {
    cc.log("scoreController onExit");
    if (this._bindingID) {
      vee.VIPValues.releaseBinding(this._bindingID);
      this._bindingID = null;
    }
    this._rootNode_onExit.call(this._label);
  },
  setProtectEnabled: function (arg0) {
    this._numberProtector.setProtectEnabled(arg0);
  },
  getString: function () {
    return this._label.getString();
  },
  getNumber: function () {
    return this._numberProtector.getValue();
  },
  setNumber: function (arg0) {
    this._numberProtector.setValue(arg0);
    if (this._displayValue != arg0) {
      this._tempValue = this._displayValue;
      this._updateValue();
    }
  },
  addNumber: function (arg0) {
    this.setNumber((this._numberProtector.getValue() + arg0));
  },
  setDisplayFormat: function (arg0, arg1) {
    this._prefix = arg0;
    this._appendix = arg1;
    this._updateValue();
  },
  _updateValue: function () {
    this._displayValue = this._numberProtector.getValue();
    if (this._enableFlow) {
      if (!this._displayValue && this._invisibleWhenEmpty) {
        this._label.setString("");
      } else if (this._label) {
        this._offset = (this._displayValue - this._tempValue) / (60 * this._flowDuration);
        if (Math.abs(this._offset) < 1) {
          this._offset = this._offset / Math.abs(this._offset);
        } else {
          this._offset = parseInt(this._offset);
        }
        vee.Utils.scheduleCallbackForTarget(this._label, this._schValue.bind(this));
      } else {
        cc.log("ERROR vee.ScoreController: this._label is " + this._label);
      }
      return;
    }
    var local0 = (this._prefix ? this._prefix : "") + vee.ScoreController.getScoreString(this._displayValue) + (this._appendix ? this._appendix : "");
    if (!this._displayValue && this._invisibleWhenEmpty) {
      local0 = "";
    }
    if (this._formatFunction) {
      this._formatFunction(this._label, this._displayValue, local0);
    } else {
      this._label.setString(local0);
    }
  },
  _schValue: function () {
    this._tempValue = this._tempValue + this._offset;
    if ((this._offset > 0 && this._tempValue >= this._displayValue) || (this._offset < 0 && this._tempValue <= this._displayValue)) {
      this._tempValue = this._displayValue;
      this._setTempValue();
      vee.Utils.unscheduleAllCallbacksForTarget(this._label);
    } else {
      this._setTempValue();
    }
  },
  _setTempValue: function () {
    var local0 = (this._prefix ? this._prefix : "") + vee.ScoreController.getScoreString(this._tempValue) + (this._appendix ? this._appendix : "");
    if (this._formatFunction) {
      this._formatFunction(this._label, this._tempValue, local0);
    } else {
      this._label.setString(local0);
    }
  }
});
vee.ScoreController.registerController = function (arg0, arg1, arg2) {
    var local0 = new vee.ScoreController();
    local0.init(arg0, arg1, arg2);
    return local0;
  };
vee.ScoreController.registerControllerWithKey = function (arg0, arg1, arg2) {
    var local0 = new vee.ScoreController();
    local0.initWithKey(arg0, arg1, arg2);
    return local0;
  };
vee.ScoreController.getScoreString = function (arg0) {
    var local0 = arg0 % 1000;
    var local1 = "";
    while (arg0 > 1000) {
      if (local0 < 10) {
        local1 = ",00" + local0 + local1;
      } else if (local0 < 100) {
        local1 = ",0" + local0 + local1;
      } else {
        local1 = "," + local0 + local1;
      }
      arg0 = Math.floor(arg0 / 1000);
      local0 = arg0 % 1000;
    }
    local1 = "" + arg0 + local1;
    return local1;
  };
