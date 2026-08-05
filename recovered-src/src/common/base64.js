// Recovered from smdis output: C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/common/base64.dis
// First-pass semantic reconstruction for the SpiderMonkey v33 bytecode file.
(function (global) {
  var Base64 = {};

  Base64.encTable = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"];
  Base64.decTable = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1];

  Base64.encUTF8 = function (str) {
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c > 0 && c <= 0x7f) {
        out.push(c);
      } else if (c >= 0x80 && c <= 0x7ff) {
        out.push(0xc0 | ((c >> 6) & 0x1f), 0x80 | (c & 0x3f));
      } else if (c >= 0x800 && c <= 0xffff) {
        out.push(0xe0 | ((c >> 12) & 0x0f), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
      }
    }
    return out;
  };

  Base64.decUTF8 = function (bytes) {
    var out = [];
    for (var i = 0; i < bytes.length; i++) {
      var c = bytes[i];
      if (c < 0x80) {
        out.push(String.fromCharCode(c));
      } else if (c >= 0x0c && c < 0xe0) {
        var c2 = bytes[++i];
        out.push(String.fromCharCode(((c & 0x1f) << 6) | (c2 & 0x3f)));
      } else if (c >= 0xe0 && c < 0xf0) {
        var c3b = bytes[++i];
        var c3c = bytes[++i];
        out.push(String.fromCharCode(((c & 0x0f) << 12) | ((c3b & 0x3f) << 6) | (c3c & 0x3f)));
      } else if (c >= 0xf0 && c < 0xf8) {
        var c4b = bytes[++i];
        var c4c = bytes[++i];
        var c4d = bytes[++i];
        out.push(String.fromCharCode(((c & 0x07) << 18) | ((c4b & 0x3f) << 12) | ((c4c & 0x3f) << 6) | (c4d & 0x3f)));
      } else if (c >= 0xf8 && c < 0xfc) {
        var c5b = bytes[++i];
        var c5c = bytes[++i];
        var c5d = bytes[++i];
        var c5e = bytes[++i] & 0x3f;
        out.push(String.fromCharCode(((c & 0x03) << 24) | ((c5b & 0x3f) << 18) | ((c5c & 0x3f) << 12) | ((c5d & 0x3f) << 6) | c5e));
      } else if (c >= 0xfc) {
        var c6b = bytes[++i];
        var c6c = bytes[++i];
        var c6d = bytes[++i];
        var c6e = (bytes[++i] & 0x3f) << 6;
        var c6f = bytes[++i] & 0x3f;
        out.push(String.fromCharCode(((c & 0x01) << 30) | ((c6b & 0x3f) << 24) | ((c6c & 0x3f) << 18) | ((c6d & 0x3f) << 12) | c6e | c6f));
      }
    }
    return out.join("");
  };

  Base64.encUTF16 = function (str) {
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      out.push(c >> 8, c & 0xff);
    }
    return out;
  };

  Base64.decUTF16 = function (bytes) {
    var out = [];
    for (var i = 0; i < bytes.length;) {
      out.push(String.fromCharCode((bytes[i++] << 8) | bytes[i++]));
    }
    return out.join("");
  };

  Base64.encUTF16ES6 = function (str) {
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var unit = str.charCodeAt(i);
      var point = str.codePointAt(i) - 0x10000;
      if (point < 0) {
        out.push((unit & 0xff00) >> 8, unit & 0xff);
      } else if (point >= 0 && point <= 0xfffff) {
        var hi = (point >> 10) + 0xd800;
        out.push((hi >> 8) & 0xff, hi & 0xff);
        var lo = (point & 0x3ff) + 0xdc00;
        out.push((lo >> 8) & 0xff, lo & 0xff);
        i++;
      }
    }
    return out;
  };

  Base64.decUTF16ES6 = function (bytes) {
    var out = [];
    for (var i = 0; i < bytes.length;) {
      var hi = (bytes[i++] << 8) | bytes[i++];
      var lo = (bytes[i++] << 8) | bytes[i++];
      if (!(hi >= 0xd800 && hi <= 0xdbff && lo >= 0xdc00 && lo <= 0xdfff)) {
        out.push(String.fromCharCode(hi));
        i -= 2;
      } else {
        out.push(String.fromCodePoint(0x10000 | ((hi - 0xd800) << 10) | (lo - 0xdc00)));
      }
    }
    return out.join("");
  };

  Base64.encUTF32 = function (str) {
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      out.push(c >> 24, (c >> 16) & 0xff, (c >> 8) & 0xff, c & 0xff);
    }
    return out;
  };

  Base64.decUTF32 = function (bytes) {
    var out = [];
    for (var i = 0; i < bytes.length;) {
      out.push(String.fromCharCode((bytes[i++] << 24) | (bytes[i++] << 16) | (bytes[i++] << 8) | bytes[i++]));
    }
    return out.join("");
  };

  Base64.encode = function (str, encoding) {
    if (!str) return "";

    var bytes;
    if (encoding === 32) {
      bytes = Base64.encUTF32(str);
    } else if (encoding === 16) {
      bytes = Base64.encUTF16(str);
    } else if (encoding === 166) {
      bytes = Base64.encUTF16ES6(str);
    } else {
      bytes = Base64.encUTF8(str);
    }

    var out = [];
    for (var i = 0; i < bytes.length;) {
      var b1 = bytes[i++] & 0xff;
      out.push(Base64.encTable[b1 >> 2]);

      if (i === bytes.length) {
        out.push(Base64.encTable[(b1 & 3) << 4], "==");
        break;
      }

      var b2 = bytes[i++];
      if (i === bytes.length) {
        out.push(Base64.encTable[((b1 & 3) << 4) | ((b2 >> 4) & 15)]);
        out.push(Base64.encTable[(b2 & 15) << 2], "=");
        break;
      }

      var b3 = bytes[i++];
      out.push(Base64.encTable[((b1 & 3) << 4) | ((b2 >> 4) & 15)]);
      out.push(Base64.encTable[((b2 & 15) << 2) | ((b3 & 0xc0) >> 6)]);
      out.push(Base64.encTable[b3 & 63]);
    }
    return out.join("");
  };

  Base64.decode = function (value, encoding) {
    if (!value) return "";

    var i = 0;
    var len = value.length;
    var bytes = [];
    while (i < len) {
      var b1 = Base64.decTable[value.charCodeAt(i++)];
      var b2 = Base64.decTable[value.charCodeAt(i++)];
      bytes.push((b1 << 2) | (b2 >> 4));

      var b3 = Base64.decTable[value.charCodeAt(i++)];
      if (b3 === -1) break;
      bytes.push(((b2 & 15) << 4) | (b3 >> 2));

      var b4 = Base64.decTable[value.charCodeAt(i++)];
      if (b4 === -1) break;
      bytes.push(((b3 & 3) << 6) | b4);
    }

    if (encoding === 32) return Base64.decUTF32(bytes);
    if (encoding === 16) return Base64.decUTF16(bytes);
    if (encoding === 166) return Base64.decUTF16ES6(bytes);
    return Base64.decUTF8(bytes);
  };

  Base64.log = function (value) {
    document.write(value + "</br>");
  };

  global.Base64 = Base64;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Base64;
  }
}(typeof globalThis !== "undefined" ? globalThis : this));
