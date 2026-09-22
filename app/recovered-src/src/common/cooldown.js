// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/common/cooldown.dis
var vee = vee || {};
vee.CoolDown = {
  buffer: null,
  getCDTimestamp: function (arg0, arg1) {
    return this._getCDTimestamp(arg0, arg1, false);
  },
  getCDTimestamp2SpecDate: function (arg0, arg1, arg2, arg3) {
    var local0 = new Date();
    var local1 = local0.getTime();
    var local2;
    if (arg3 != undefined) {
      local0.setDate(arg3);
      local2 = local0.getTime();
      if (local2 < local1) {
        local2 += 86400000;
        local0.setTime(local2);
      }
    }
    if (arg2 != undefined) {
      local0.setHours(arg2);
      local2 = local0.getTime();
      if (local2 < local1) {
        local2 += 3600000;
        local0.setTime(local2);
      }
    }
    local0.setMinutes(arg1);
    local2 = local0.getTime();
    if (local2 < local1) {
      local2 += 60000;
      local0.setTime(local2);
    }
    return this._getCDTimestamp(arg0, local2, false);
  },
  _getCDTimestamp: function (arg0, arg1, arg2) {
    if (!this.buffer) {
      this.buffer = vee.VIPValues.create(null, "NwodLook");
      this.buffer.forEachValue(function (key, value) {
        cc.log("key \t" + key + "\t value\t" + value);
      });
    }
    var local0 = this.buffer.getValue(arg0);
    if (local0 === null) {
      if (!arg1) {
        cc.log("Please set interval!");
        return null;
      }
      var local1 = new Date().getTime();
      this.buffer.setValue(arg0, parseInt(local1));
      this.buffer.setValue(arg0 + "itv", parseInt(arg1));
      this.buffer.save("NwodLook");
      return arg1;
    }
    var local2 = parseInt(this.buffer.getValue(arg0 + "itv"));
    var local1 = new Date().getTime();
    var local3 = local0 + local2 - local1;
    if (local3 < 0) {
      var local4 = 0;
      if (local2 < Math.abs(local3)) {
        local4 = local3;
      } else {
        local4 = local3 % local2;
      }
      if (arg2) {
        this.buffer.setValue(arg0, parseInt(local1 + local4));
        this.buffer.save("NwodLook");
      }
    }
    return local3;
  },
  getCDedCount: function (arg0, arg1) {
    var local0 = this._getCDTimestamp(arg0, arg1, true);
    if (local0) {
      if (local0 > 0) {
        return 0;
      }
      return Math.floor(Math.abs(local0) / arg1);
    }
    cc.log("Please set interval!");
  }
};
