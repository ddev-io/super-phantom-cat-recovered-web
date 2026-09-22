// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/common/controls.dis
var vee = vee || {};
vee.Controls = {
  wrap2ScrollView: function (arg0, arg1) {
    var local0 = arg0.getParent();
    arg0.retain();
    if (local0) {
      arg0.removeFromParent();
    }
    if (!arg1 || arg1.width == 0 || arg1.height == 0) {
      if (local0) {
        arg1 = local0.getContentSize();
      } else {
        arg1 = vee.PopMgr.winSize;
      }
    }
    var local1 = cc.ScrollView.create(arg1, arg0);
    if (local0) {
      local0.addChild(local1);
    }
    arg0.release();
    return local1;
  }
};
var VeeMusicButton = cc.Class.extend({
  btnChange: null,
  onDidLoadFromCCB: function () {
    this.btnChange.setSelected(vee.Audio.musicEnabled);
  },
  onChange: function () {
    var local0 = vee.Audio;
    local0.setMusicEnabled(!local0.musicEnabled);
    this.btnChange.setSelected(local0.musicEnabled);
    local0.onEvent("button");
  }
});
var VeeSoundButton = cc.Class.extend({
  btnChange: null,
  onDidLoadFromCCB: function () {
    this.btnChange.setSelected(vee.Audio.soundEnabled);
  },
  onChange: function () {
    var local0 = vee.Audio;
    local0.setSoundEnabled(!local0.soundEnabled);
    this.btnChange.setSelected(local0.soundEnabled);
    local0.onEvent("button");
  }
});
cc.BuilderReader.registerController("VeeMusicButton", VeeMusicButton);
var VeeProgress = cc.Class.extend({
  lyBG: null,
  lyProgress: null,
  lyProgressContent: null,
  lySurface: null,
  lyHeader: null,
  size: null,
  progress: 0,
  maxValue: 100,
  _beforeCallback: null,
  _callback: null,
  _isRuning: false,
  _runOutDuration: 1,
  _easeEffect: true,
  _isVertical: false,
  onDidLoadFromCCB: function () {
    var local0 = (this.rootNode.getTag() > 0);
    this._isVertical = local0;
    this.size = this.rootNode.getContentSize();
    this.lyHeader.setPositionX(this.size.width);
    this.lyProgress.retain();
    this.lyProgress.removeFromParent();
    var local1 = cc.ScrollView.create(this.size, this.lyProgress);
    local1.setClippingToBounds(true);
    local1.setTouchEnabled(false);
    this.lyProgressContent.addChild(local1);
    this.lyProgress.release();
  },
  setIsVertical: function (arg0) {
    this._isVertical = arg0;
  },
  getProgress: function () {
    return this.progress;
  },
  getValue: function () {
    return (this.maxValue * this.progress);
  },
  getMaxValue: function () {
    return this.maxValue;
  },
  setRunOutSpeed: function (arg0) {
    this._runOutDuration = arg0;
  },
  setEaseEffectEnabled: function (arg0) {
    this._easeEffect = arg0;
  },
  reset: function (arg0, arg1, arg2, arg3) {
    this.progress = arg0;
    this.maxValue = arg1;
    this._beforeCallback = arg2;
    this._callback = arg3;
    this.updateProgress();
  },
  setProgress: function (arg0, arg1) {
    if (arg0 == this.percent) {
      return undefined;
    }
    if (arg0 < 0) {
      arg0 = 0;
    } else if (arg0 > 1) {
      arg0 = 1;
    }
    if (this._isRuning) {
      this.onValueChanged();
    }
    this.progress = arg0;
    this.updateProgress(arg1);
  },
  setValue: function (arg0, arg1) {
    this.progress = arg0 / this.maxValue;
    this.lyProgress.stopAllActions();
    this.lyHeader.stopAllActions();
    this.setProgress(this.progress, arg1);
  },
  getPositionXOfValue: function (arg0) {
    return this.getPositionXOfProgress(arg0 / this.maxValue);
  },
  getPositionYOfValue: function (arg0) {
    return this.getPositionYOfProgress(arg0 / this.maxValue);
  },
  getPositionXOfProgress: function (arg0) {
    return (this.size.width * arg0);
  },
  getPositionYOfProgress: function (arg0) {
    return (this.size.height * arg0);
  },
  updateProgress: function (arg0) {
    if (this._beforeCallback) {
      this._beforeCallback(this);
    }
    if (this._isVertical) {
      this._updateProgressVertical(arg0);
    } else {
      this._updateProgressHorizontal(arg0);
    }
  },
  _updateProgressHorizontal: function (arg0) {
    var local0 = this.size.width * (this.progress - 1);
    var local1 = this.size.width + local0;
    if (arg0) {
      var local2 = this.lyProgress.getPositionX();
      var local3 = 0;
      if (this._easeEffect) {
        local3 = 0.3;
      }
      var local4 = (Math.abs(local2 - local0) / this.size.width + local3) * this._runOutDuration;
      if (local4 > this._runOutDuration) {
        local4 = this._runOutDuration;
      }
      this._isRuning = true;
      var local5 = cc.MoveTo.create(local4, cc.p(local0, 0));
      var local6 = local5;
      if (this._easeEffect) {
        local6 = cc.EaseExponentialOut.create(local5);
      }
      var local7 = cc.CallFunc.create(this.onValueChanged, this);
      this.lyProgress.runAction(cc.Sequence.create(local6, local7));
      var local8 = cc.MoveTo.create(local4, cc.p(local1, 0));
      var local9 = local8;
      if (this._easeEffect) {
        local9 = cc.EaseExponentialOut.create(local8);
      }
      this.lyHeader.runAction(local9);
    } else {
      this.lyProgress.setPositionX(local0);
      this.lyHeader.setPositionX(local1);
      this.onValueChanged();
    }
  },
  _updateProgressVertical: function (arg0) {
    var local0 = this.size.height * (this.progress - 1);
    var local1 = this.size.width + local0;
    if (arg0) {
      var local2 = this.lyProgress.getPositionY();
      var local3 = 0;
      if (this._easeEffect) {
        local3 = 0.3;
      }
      var local4 = (Math.abs(local2 - local0) / this.size.height + local3) * this._runOutDuration;
      if (local4 > this._runOutDuration) {
        local4 = this._runOutDuration;
      }
      this._isRuning = true;
      var local5 = cc.MoveTo.create(local4, cc.p(0, local0));
      var local6 = local5;
      if (this._easeEffect) {
        local6 = cc.EaseExponentialOut.create(local5);
      }
      var local7 = cc.CallFunc.create(this.onValueChanged, this);
      this.lyProgress.runAction(cc.Sequence.create(local6, local7));
      var local8 = cc.MoveTo.create(local4, cc.p(0, local1));
      var local9 = cc.EaseExponentialOut.create(local8);
      this.lyHeader.runAction(local9);
    } else {
      this.lyProgress.setPositionY(local0);
      this.lyHeader.setPositionY(local1);
      this.onValueChanged();
    }
  },
  onValueChanged: function () {
    if (this._callback) {
      this._callback(this);
    }
    this._isRuning = false;
  }
});
cc.BuilderReader.registerController("VeeSoundButton", VeeSoundButton);
VeeProgress.onValueChanged = function () {
  };
var VeeRateButton = vee.Class.extend({
  onRate: function () {
    vee.Utils.rate();
  }
});
var VeeTableViewController = vee.Class.extend({
  _cellSize: null,
  _cellNum: 0,
  _cellCCB: null,
  _isUseDifferentCCB: false,
  _dataSource: null,
  _cellSizeArr: null,
  setCellNumber: function (arg0) {
    this._cellNum = arg0;
  },
  setCellCCB: function (arg0) {
    this._cellCCB = arg0;
    this._isUseDifferentCCB = _.isArray(arg0);
    var local0 = this._isUseDifferentCCB ? arg0[arg0.length - 1] : arg0;
    var local1 = cc.BuilderReader.load(local0);
    this._cellSize = local1.getContentSize();
    if (this._isUseDifferentCCB) {
      this._cellSizeArr = [];
      this._cellSizeArr[arg0.length - 1] = this._cellSize;
    }
  },
  setDataSource: function (arg0) {
    this._dataSource = arg0;
  },
  cellSizeForTable: function () {
    return this._cellSize;
  },
  _updateCellSize: function (arg0) {
    if (this._cellCCB[arg0] && !this._cellSizeArr[arg0]) {
      var local0 = cc.BuilderReader.load(this._cellCCB[arg0]);
      var local1 = local0.getContentSize();
      this._cellSizeArr[arg0] = cc.size(local1.width, local1.height);
    }
  },
  tableCellSizeForIndex: function (arg0, arg1) {
    if (this._isUseDifferentCCB) {
      var local0 = this._cellNum - arg1 - 1;
      this._updateCellSize(local0 + 1);
      this._updateCellSize(local0 - 1);
      return this._cellSizeArr[local0];
    }
    return this._cellSize;
  },
  numberOfCellsInTableView: function () {
    return this._cellNum;
  },
  tableCellAtIndex: function (arg0, arg1) {
    var local0 = arg0.dequeueCell();
    if (!local0) {
      local0 = new cc.TableViewCell();
    }
    var local1;
    var local2 = this._cellNum - arg1 - 1;
    var local3 = local0.getChildren()[0];
    if (!local3 || this._isUseDifferentCCB) {
      local0.removeAllChildren();
      var local4 = this._isUseDifferentCCB ? this._cellCCB[local2] : this._cellCCB;
      local3 = cc.BuilderReader.load(local4);
      local0.addChild(local3);
    }
    local1 = local3.controller;
    if (_.isFunction(local1._updateIndex)) {
      local1._updateIndex(local2, this._dataSource);
    }
    return local0;
  },
  tableCellTouched: function (arg0, arg1) {
    var local0 = arg1.getChildren()[0];
    var local1 = local0.controller;
    if (_.isFunction(local1.touched)) {
      local1.touched(arg0);
    }
  },
  tableCellHighlight: function (arg0, arg1) {
    var local0 = arg1.getChildren()[0];
    var local1 = local0.controller;
    if (_.isFunction(local1.touched2)) {
      local1.touched2(arg0);
    }
  },
  m_pointMax: null,
  m_pointMin: null,
  setMaxMinPoint: function (arg0, arg1) {
    if (arg0) {
      this.m_pointMax = arg0;
    }
    if (arg1) {
      this.m_pointMin = arg1;
    }
  },
  scrollViewDidScroll: function (arg0) {
    var local0 = arg0.getContentOffset();
    if (this.m_pointMax) {
      var local1 = this.m_pointMax;
      if (local0.y > local1.y) {
        arg0.getContainer().setPosition(local1);
        return undefined;
      }
    }
    if (this.m_pointMin) {
      var local2 = this.m_pointMin;
      if (local0.y < local2.y) {
        arg0.getContainer().setPosition(local2);
        return undefined;
      }
    }
  }
});
cc.BuilderReader.registerController("VeeRateButton", VeeRateButton);
VeeTableViewController.createTableView = function (arg0, arg1, arg2, arg3) {
    var local0 = new VeeTableViewController();
    local0.setCellCCB(arg1);
    if (_.isArray(arg1)) {
      local0.setCellNumber(arg1.length);
    } else {
      local0.setCellNumber(arg2);
    }
    local0.setDataSource(arg3);
    var local1 = cc.TableView.create(local0, arg0);
    local1.controller = local0;
    local1.setDelegate(local0);
    return local1;
  };
var VeeTableCellController = vee.Class.extend({
  _idx: 0,
  getIdx: function () {
    return this._idx;
  },
  _updateIndex: function (arg0, arg1) {
    this._idx = arg0;
    this.updateIndex(arg0, arg1);
  },
  updateIndex: function () {
  },
  touched: function () {
  },
  touched2: function () {
  }
});
var VeeNotification = vee.Class.extend({
  _autoHide: false,
  _bindingID: -1,
  lbNotice: null,
  onCreate: function () {
    this._autoHide = true;
    this._bindingID = null;
  },
  onExit: function () {
    if (this._bindingID) {
      vee.VIPValues.releaseBinding(this._bindingID);
    }
  },
  setAutoHide: function (arg0) {
    this._autoHide = arg0;
    this.updateValue();
  },
  _formatFunction: null,
  setFormatFunction: function (arg0) {
    this._formatFunction = arg0;
  },
  updateValue: function (arg0, arg1) {
    if (arg1 == undefined) {
      arg1 = vee.VIPValues.getValue(arg0);
    }
    var local0 = this._formatFunction ? this._formatFunction(arg1) : "" + arg1;
    this.lbNotice.setString(local0);
    if (!arg1 && this._autoHide) {
      this.rootNode.setVisible(false);
    } else {
      this.rootNode.setVisible(true);
    }
  },
  reset: function (arg0) {
    this._bindingID = vee.VIPValues.bind2Value(arg0, function (arg0, arg1) {
      this.updateValue(arg0, arg1);
    }.bind(this));
    this.updateValue(arg0);
  }
});
cc.BuilderReader.registerController("VeeTableCellController", VeeTableCellController);
var VeeRecordButton = vee.Class.extend({
  btnTouch: null,
  spL: null,
  isRecording: false,
  ccblbRec: null,
  onCreate: function () {
    if (!vee.Utils.isRecordAvaliable()) {
      this.rootNode.removeFromParent();
      return undefined;
    }
    if (vee.Utils.isIOS10() && null != this.ccblbRec) {
      cc.log("zq debug set lab===live");
      this.ccblbRec.setString("LIVE");
    }
    if (VeeRecordButton.isPluginRecording) {
      this.playAnimate("recording");
    } else {
      this.playAnimate("show");
    }
    VeeRecordButton.register(this);
    vee.Controller.registerControllerSprite(this.spL);
    if (game.Data.version.isMultiDemo) {
      this.btnTouch.setVisible(true);
      this.ccblbRec.setString("NET");
    }
  },
  onExit: function () {
    VeeRecordButton.remove(this);
    vee.Controller.removeControllerSprite(this.spL);
  },
  onTouch: function () {
    if (game.Data.isAndroid) {
      vee.Utils.recordScreen();
    } else if (VeeRecordButton.isPluginRecording) {
      vee.Utils.stopRecordScreen();
      this.btnTouch.setVisible(false);
      this.playAnimate("stop", function () {
        this.btnTouch.setVisible(true);
      }.bind(this));
    } else {
      vee.Utils.recordScreen();
      this.playAnimate("starting");
      VeeRecordButton.setBtnEnable(false);
    }
  }
});
cc.BuilderReader.registerController("VeeRecordButton", VeeRecordButton);
cc.BuilderReader.registerController("VeeNotification", VeeNotification);
VeeRecordButton.isPluginRecording = false;
VeeRecordButton.registeredButtonPool = [];
VeeRecordButton.register = function (arg0) {
    VeeRecordButton.registeredButtonPool.push(arg0);
  };
VeeRecordButton.remove = function (arg0) {
    var local0 = 0;
    var local1 = VeeRecordButton.registeredButtonPool.length;
    while (local0 < local1) {
      var local2 = VeeRecordButton.registeredButtonPool[local0];
      if (local2 == arg0) {
        VeeRecordButton.registeredButtonPool.splice(local0, 1);
      }
      local0++;
    }
  };
vee.resetRecordButtonState = function (arg0) {
    cc.log("reset record button state =====" + arg0);
    if (arg0 == "true") {
      VeeRecordButton.isPluginRecording = true;
      VeeRecordButton.setBtnEnable(true);
      VeeRecordButton.playRecAnimate("start");
    } else if (arg0 == "error") {
      VeeRecordButton.stopRecord();
      VeeRecordButton.playRecAnimate("stop");
      VeeRecordButton.setBtnEnable(true);
    } else if (arg0 == "false") {
      VeeRecordButton.stopRecord();
      VeeRecordButton.playRecAnimate("stop");
      VeeRecordButton.setBtnEnable(true);
      VeeRecordButton.isPluginRecording = false;
    } else if (arg0 == "cancel") {
      VeeRecordButton.playRecAnimate("stop");
      VeeRecordButton.setBtnEnable(true);
    }
  };
VeeRecordButton.setBtnEnable = function (arg0) {
    var local0 = VeeRecordButton.registeredButtonPool.length;
    var local1 = 0;
    var local2 = local0;
    while (local1 < local2) {
      var local3 = VeeRecordButton.registeredButtonPool[local1];
      if (local3) {
        local3.btnTouch.setVisible(arg0);
      }
      local1++;
    }
  };
VeeRecordButton.playRecAnimate = function (arg0) {
    var local0 = VeeRecordButton.registeredButtonPool.length;
    var local1 = 0;
    var local2 = local0;
    while (local1 < local2) {
      var local3 = VeeRecordButton.registeredButtonPool[local1];
      if (local3) {
        local3.playAnimate(arg0);
      }
      local1++;
    }
  };
VeeRecordButton.stopRecord = function () {
    if (VeeRecordButton.isPluginRecording) {
      vee.Utils.stopRecordScreen();
    }
  };
