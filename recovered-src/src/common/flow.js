// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/common/flow.dis
var Flow = Flow || {};
Flow.FlowStatus = {
  WaitingForInput: 1,
  WaitingForAction: 2,
  Finished: 3
};
Flow.BasicModel = cc.Class.extend({
  data: null,
  _name: "BasicModel",
  _status: Flow.FlowStatus.WaitingForInput,
  _onResult: null,
  _chainCallback: null,
  _head: null,
  ctor: function (arg0) {
    this.data = arg0;
  },
  log: function (arg0, arg1) {
    cc.log(((((((("Flow [" + this._name) + "|") + this._status) + "] ") + arg0) + ": \t") + arg1));
  },
  reset: function () {
    this._status = Flow.FlowStatus.WaitingForInput;
  },
  _input: function (arg0) {
    if (this._status != Flow.FlowStatus.WaitingForInput) {
      this.log("error", "Flow is not waitingForInput");
      return undefined;
    }
    this._status = Flow.FlowStatus.WaitingForAction;
    this._action(this.onInput(arg0));
  },
  _action: function (arg0) {
    if (this._status != Flow.FlowStatus.WaitingForAction) {
      return undefined;
    }
    this.onAction(arg0);
  },
  output: function (arg0) {
    if (this._onResult) {
      this._onResult(arg0);
    }
    if (this._chainCallback) {
      this._chainCallback(arg0);
    }
  },
  done: function (arg0) {
    this.output(true, arg0);
  },
  onInput: function (arg0) {
    return arg0;
  },
  onAction: function (arg0) {
    this.output(arg0);
  },
  onResult: function (arg0) {
    this._onResult = arg0;
    return this;
  },
  go: function (arg0) {
    var local0 = this._head ? this._head : this;
    local0._input(arg0);
  },
  then: function (arg0, arg1) {
    var local0 = Flow.do(arg0, arg1);
    if (!local0) {
      this.log("error", "Object is not a instance of Flow.");
      return undefined;
    }
    local0._head = this._head ? this._head : this;
    this._chainCallback = function (arg0) {
      this._input(arg0);
    }.bind(local0);
    return local0;
  },
  fork: function () {
    this.log("error", "To support fork you must extend a Flow.ForkModel or use Flow.extendFork function.");
    return undefined;
  },
  thenAll: function (arg0) {
    return this.then(Flow.doAll(arg0));
  }
});
Flow.do = function (arg0, arg1) {
    if (arg0 instanceof Array && arg0.length === 2) {
      arg1 = arg0[1];
      arg0 = arg0[0];
    }
    var local0 = arg0 instanceof Flow.BasicModel ? arg0 : new arg0(arg1);
    if (!(local0 instanceof Flow.BasicModel)) {
      return null;
    }
    return local0;
  };
Flow.doAll = function (arg0) {
    return new Flow.SyncModel(arg0);
  };
Flow.extend = function (arg0, arg1) {
    if (_.isFunction(arg0)) {
      var local0 = arg0;
      arg0 = {};
      arg0._name = arg1 ? arg1 : "Name Unknown";
      arg0.onAction = local0;
    }
    return Flow.BasicModel.extend(arg0);
  };
Flow.ForkModel = Flow.extend({
  _name: "ForkModel",
  forkObject: null,
  output: function (arg0, arg1) {
    if (this.forkObject && (_.isString(arg1) || _.isNumber(arg1))) {
      arg1 = this.forkObject[arg1];
    }
    if (arg1 && this.forkObject) {
      arg1 = Flow.do(arg1);
    }
    if (this.forkObject && !arg1) {
      this.log("error", "Missing fork. You must pass your fork argument like this.output(data, fork); or this.done(fork) ");
      vee.Utils.logKey(this.forkObject, "Here are your forks:");
      return undefined;
    }
    this._status = Flow.FlowStatus.Finished;
    if (this.forkObject) {
      arg1.onResult(this._onResult);
      arg1._chainCallback = this._chainCallback;
      arg1.go(arg0);
      return;
    }
    if (this._onResult) {
      this._onResult(arg0);
    }
    if (this._chainCallback) {
      this._chainCallback(arg0);
    }
  },
  fork: function (arg0) {
    this.forkObject = arg0;
    return this;
  }
});
Flow.extendFork = function (arg0, arg1) {
    if (_.isFunction(arg0)) {
      var local0 = arg0;
      arg0 = {};
      arg0._name = arg1 ? arg1 : "Name Unknown";
      arg0.onAction = local0;
    }
    return Flow.ForkModel.extend(arg0);
  };
Flow.ValidateModel = Flow.extend({
  _name: "ValidateModel",
  _inputLock: null,
  validate: function (arg0) {
    for (var local0 in this._inputLock) {
      var local1 = this._inputLock[local0];
      if (typeof local1 !== "string") {
        local1 = local0;
      }
      if (!arg0.hasOwnProperty(local1)) {
        return false;
      }
    }
    return this.onValidate(arg0);
  },
  onValidate: function () {
    return true;
  },
  _input: function (arg0) {
    if (!this.validate(arg0)) {
      this.log("Warning", "Input validate fail");
      this.reset();
      return undefined;
    }
    this._super(arg0);
  }
});
Flow.SyncModel = Flow.extend({
  _name: "SyncModel",
  count: 0,
  subMissionDone: function () {
    this.count = this.count + 1;
    if (this.count === this.data.length) {
      this.done();
    }
  },
  onAction: function (arg0) {
    if (!(this.data instanceof Array)) {
      this.log("error", "Wrap Data is not an Array of flows");
      return undefined;
    }
    var local0 = this.data.length;
    var local1 = 0;
    while (local1 < local0) {
      var local2 = Flow.do(this.data[local1]);
      local2.onResult(function () {
        this.subMissionDone();
      }.bind(this));
      local2.go(arg0);
      local1 = local1 + 1;
    }
  }
});
Flow.NONE = Flow.BasicModel;
