import {
  UniverSheetsNumfmtUIPlugin
} from "../chunk-UFFVGXSC.js";
import {
  UniverSheetsFormulaUIPlugin
} from "../chunk-DMIB6PSO.js";
import {
  UniverSheetsNumfmtPlugin
} from "../chunk-LZWJIT7W.js";
import {
  UniverSheetsUIPlugin
} from "../chunk-BHQGV2VJ.js";
import {
  DEFAULT_WORKBOOK_DATA_DEMO
} from "../chunk-VEBN3ADF.js";
import {
  UniverDocsPlugin,
  UniverDocsUIPlugin
} from "../chunk-7ZOWWEOA.js";
import "../chunk-LI6UXASZ.js";
import {
  UniverUIPlugin,
  render,
  require_jsx_runtime,
  require_react,
  require_react_dom
} from "../chunk-VNXQUZSG.js";
import {
  zh_CN_default
} from "../chunk-QRLMZA6Y.js";
import {
  UniverSheetsFormulaPlugin
} from "../chunk-YVPSS3XX.js";
import {
  UniverFormulaEnginePlugin,
  UniverSheetsPlugin
} from "../chunk-Q6Y4PHRI.js";
import {
  UniverRenderEnginePlugin
} from "../chunk-XOCU2XR6.js";
import {
  Tools,
  Univer
} from "../chunk-EJSPXROI.js";
import "../chunk-EQ2B2W73.js";
import {
  __commonJS,
  __esm,
  __export,
  __toCommonJS,
  __toESM
} from "../chunk-24OICD5T.js";

// ../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js
var require_classnames = __commonJS({
  "../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js"(exports, module) {
    (function() {
      "use strict";
      var hasOwn = {}.hasOwnProperty;
      function classNames() {
        var classes = "";
        for (var i3 = 0; i3 < arguments.length; i3++) {
          var arg = arguments[i3];
          if (arg) {
            classes = appendClass(classes, parseValue(arg));
          }
        }
        return classes;
      }
      function parseValue(arg) {
        if (typeof arg === "string" || typeof arg === "number") {
          return arg;
        }
        if (typeof arg !== "object") {
          return "";
        }
        if (Array.isArray(arg)) {
          return classNames.apply(null, arg);
        }
        if (arg.toString !== Object.prototype.toString && !arg.toString.toString().includes("[native code]")) {
          return arg.toString();
        }
        var classes = "";
        for (var key in arg) {
          if (hasOwn.call(arg, key) && arg[key]) {
            classes = appendClass(classes, key);
          }
        }
        return classes;
      }
      function appendClass(value, newClass) {
        if (!newClass) {
          return value;
        }
        if (value) {
          return value + " " + newClass;
        }
        return value + newClass;
      }
      if (typeof module !== "undefined" && module.exports) {
        classNames.default = classNames;
        module.exports = classNames;
      } else if (typeof define === "function" && typeof define.amd === "object" && define.amd) {
        define("classnames", [], function() {
          return classNames;
        });
      } else {
        window.classNames = classNames;
      }
    })();
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_freeGlobal.js
var require_freeGlobal = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_freeGlobal.js"(exports, module) {
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    module.exports = freeGlobal;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_root.js
var require_root = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_root.js"(exports, module) {
    var freeGlobal = require_freeGlobal();
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    module.exports = root;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Symbol.js
var require_Symbol = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Symbol.js"(exports, module) {
    var root = require_root();
    var Symbol2 = root.Symbol;
    module.exports = Symbol2;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getRawTag.js
var require_getRawTag = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getRawTag.js"(exports, module) {
    var Symbol2 = require_Symbol();
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var nativeObjectToString = objectProto.toString;
    var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
      try {
        value[symToStringTag] = void 0;
        var unmasked = true;
      } catch (e) {
      }
      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }
    module.exports = getRawTag;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_objectToString.js
var require_objectToString = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_objectToString.js"(exports, module) {
    var objectProto = Object.prototype;
    var nativeObjectToString = objectProto.toString;
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }
    module.exports = objectToString;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseGetTag.js
var require_baseGetTag = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseGetTag.js"(exports, module) {
    var Symbol2 = require_Symbol();
    var getRawTag = require_getRawTag();
    var objectToString = require_objectToString();
    var nullTag = "[object Null]";
    var undefinedTag = "[object Undefined]";
    var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
    function baseGetTag(value) {
      if (value == null) {
        return value === void 0 ? undefinedTag : nullTag;
      }
      return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
    }
    module.exports = baseGetTag;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isObject.js
var require_isObject = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isObject.js"(exports, module) {
    function isObject2(value) {
      var type = typeof value;
      return value != null && (type == "object" || type == "function");
    }
    module.exports = isObject2;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isFunction.js
var require_isFunction = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isFunction.js"(exports, module) {
    var baseGetTag = require_baseGetTag();
    var isObject2 = require_isObject();
    var asyncTag = "[object AsyncFunction]";
    var funcTag = "[object Function]";
    var genTag = "[object GeneratorFunction]";
    var proxyTag = "[object Proxy]";
    function isFunction(value) {
      if (!isObject2(value)) {
        return false;
      }
      var tag = baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }
    module.exports = isFunction;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_coreJsData.js
var require_coreJsData = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_coreJsData.js"(exports, module) {
    var root = require_root();
    var coreJsData = root["__core-js_shared__"];
    module.exports = coreJsData;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isMasked.js
var require_isMasked = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isMasked.js"(exports, module) {
    var coreJsData = require_coreJsData();
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
      return uid ? "Symbol(src)_1." + uid : "";
    })();
    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func;
    }
    module.exports = isMasked;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_toSource.js
var require_toSource = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_toSource.js"(exports, module) {
    var funcProto = Function.prototype;
    var funcToString = funcProto.toString;
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {
        }
        try {
          return func + "";
        } catch (e) {
        }
      }
      return "";
    }
    module.exports = toSource;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsNative.js
var require_baseIsNative = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsNative.js"(exports, module) {
    var isFunction = require_isFunction();
    var isMasked = require_isMasked();
    var isObject2 = require_isObject();
    var toSource = require_toSource();
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var reIsNative = RegExp(
      "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    );
    function baseIsNative(value) {
      if (!isObject2(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    module.exports = baseIsNative;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getValue.js
var require_getValue = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getValue.js"(exports, module) {
    function getValue(object, key) {
      return object == null ? void 0 : object[key];
    }
    module.exports = getValue;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getNative.js
var require_getNative = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getNative.js"(exports, module) {
    var baseIsNative = require_baseIsNative();
    var getValue = require_getValue();
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : void 0;
    }
    module.exports = getNative;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_defineProperty.js
var require_defineProperty = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_defineProperty.js"(exports, module) {
    var getNative = require_getNative();
    var defineProperty = (function() {
      try {
        var func = getNative(Object, "defineProperty");
        func({}, "", {});
        return func;
      } catch (e) {
      }
    })();
    module.exports = defineProperty;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseAssignValue.js
var require_baseAssignValue = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseAssignValue.js"(exports, module) {
    var defineProperty = require_defineProperty();
    function baseAssignValue(object, key, value) {
      if (key == "__proto__" && defineProperty) {
        defineProperty(object, key, {
          "configurable": true,
          "enumerable": true,
          "value": value,
          "writable": true
        });
      } else {
        object[key] = value;
      }
    }
    module.exports = baseAssignValue;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayAggregator.js
var require_arrayAggregator = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayAggregator.js"(exports, module) {
    function arrayAggregator(array, setter, iteratee, accumulator) {
      var index = -1, length = array == null ? 0 : array.length;
      while (++index < length) {
        var value = array[index];
        setter(accumulator, value, iteratee(value), array);
      }
      return accumulator;
    }
    module.exports = arrayAggregator;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_createBaseFor.js
var require_createBaseFor = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_createBaseFor.js"(exports, module) {
    function createBaseFor(fromRight) {
      return function(object, iteratee, keysFunc) {
        var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
        while (length--) {
          var key = props[fromRight ? length : ++index];
          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }
        return object;
      };
    }
    module.exports = createBaseFor;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseFor.js
var require_baseFor = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseFor.js"(exports, module) {
    var createBaseFor = require_createBaseFor();
    var baseFor = createBaseFor();
    module.exports = baseFor;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseTimes.js
var require_baseTimes = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseTimes.js"(exports, module) {
    function baseTimes(n, iteratee) {
      var index = -1, result = Array(n);
      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }
    module.exports = baseTimes;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isObjectLike.js
var require_isObjectLike = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isObjectLike.js"(exports, module) {
    function isObjectLike(value) {
      return value != null && typeof value == "object";
    }
    module.exports = isObjectLike;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsArguments.js
var require_baseIsArguments = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsArguments.js"(exports, module) {
    var baseGetTag = require_baseGetTag();
    var isObjectLike = require_isObjectLike();
    var argsTag = "[object Arguments]";
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag;
    }
    module.exports = baseIsArguments;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isArguments.js
var require_isArguments = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isArguments.js"(exports, module) {
    var baseIsArguments = require_baseIsArguments();
    var isObjectLike = require_isObjectLike();
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    var isArguments = baseIsArguments(/* @__PURE__ */ (function() {
      return arguments;
    })()) ? baseIsArguments : function(value) {
      return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
    };
    module.exports = isArguments;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isArray.js
var require_isArray = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isArray.js"(exports, module) {
    var isArray = Array.isArray;
    module.exports = isArray;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/stubFalse.js
var require_stubFalse = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/stubFalse.js"(exports, module) {
    function stubFalse() {
      return false;
    }
    module.exports = stubFalse;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isBuffer.js
var require_isBuffer = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isBuffer.js"(exports, module) {
    var root = require_root();
    var stubFalse = require_stubFalse();
    var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var Buffer = moduleExports ? root.Buffer : void 0;
    var nativeIsBuffer = Buffer ? Buffer.isBuffer : void 0;
    var isBuffer = nativeIsBuffer || stubFalse;
    module.exports = isBuffer;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isIndex.js
var require_isIndex = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isIndex.js"(exports, module) {
    var MAX_SAFE_INTEGER = 9007199254740991;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
    }
    module.exports = isIndex;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isLength.js
var require_isLength = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isLength.js"(exports, module) {
    var MAX_SAFE_INTEGER = 9007199254740991;
    function isLength(value) {
      return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    module.exports = isLength;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsTypedArray.js
var require_baseIsTypedArray = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsTypedArray.js"(exports, module) {
    var baseGetTag = require_baseGetTag();
    var isLength = require_isLength();
    var isObjectLike = require_isObjectLike();
    var argsTag = "[object Arguments]";
    var arrayTag = "[object Array]";
    var boolTag = "[object Boolean]";
    var dateTag = "[object Date]";
    var errorTag = "[object Error]";
    var funcTag = "[object Function]";
    var mapTag = "[object Map]";
    var numberTag = "[object Number]";
    var objectTag = "[object Object]";
    var regexpTag = "[object RegExp]";
    var setTag = "[object Set]";
    var stringTag = "[object String]";
    var weakMapTag = "[object WeakMap]";
    var arrayBufferTag = "[object ArrayBuffer]";
    var dataViewTag = "[object DataView]";
    var float32Tag = "[object Float32Array]";
    var float64Tag = "[object Float64Array]";
    var int8Tag = "[object Int8Array]";
    var int16Tag = "[object Int16Array]";
    var int32Tag = "[object Int32Array]";
    var uint8Tag = "[object Uint8Array]";
    var uint8ClampedTag = "[object Uint8ClampedArray]";
    var uint16Tag = "[object Uint16Array]";
    var uint32Tag = "[object Uint32Array]";
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
    function baseIsTypedArray(value) {
      return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }
    module.exports = baseIsTypedArray;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseUnary.js
var require_baseUnary = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseUnary.js"(exports, module) {
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }
    module.exports = baseUnary;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_nodeUtil.js
var require_nodeUtil = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_nodeUtil.js"(exports, module) {
    var freeGlobal = require_freeGlobal();
    var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal.process;
    var nodeUtil = (function() {
      try {
        var types = freeModule && freeModule.require && freeModule.require("util").types;
        if (types) {
          return types;
        }
        return freeProcess && freeProcess.binding && freeProcess.binding("util");
      } catch (e) {
      }
    })();
    module.exports = nodeUtil;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isTypedArray.js
var require_isTypedArray = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isTypedArray.js"(exports, module) {
    var baseIsTypedArray = require_baseIsTypedArray();
    var baseUnary = require_baseUnary();
    var nodeUtil = require_nodeUtil();
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
    module.exports = isTypedArray;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayLikeKeys.js
var require_arrayLikeKeys = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayLikeKeys.js"(exports, module) {
    var baseTimes = require_baseTimes();
    var isArguments = require_isArguments();
    var isArray = require_isArray();
    var isBuffer = require_isBuffer();
    var isIndex = require_isIndex();
    var isTypedArray = require_isTypedArray();
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
      for (var key in value) {
        if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
        (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
        isIndex(key, length)))) {
          result.push(key);
        }
      }
      return result;
    }
    module.exports = arrayLikeKeys;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isPrototype.js
var require_isPrototype = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isPrototype.js"(exports, module) {
    var objectProto = Object.prototype;
    function isPrototype(value) {
      var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
      return value === proto;
    }
    module.exports = isPrototype;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_overArg.js
var require_overArg = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_overArg.js"(exports, module) {
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    module.exports = overArg;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_nativeKeys.js
var require_nativeKeys = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_nativeKeys.js"(exports, module) {
    var overArg = require_overArg();
    var nativeKeys = overArg(Object.keys, Object);
    module.exports = nativeKeys;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseKeys.js
var require_baseKeys = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseKeys.js"(exports, module) {
    var isPrototype = require_isPrototype();
    var nativeKeys = require_nativeKeys();
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty.call(object, key) && key != "constructor") {
          result.push(key);
        }
      }
      return result;
    }
    module.exports = baseKeys;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isArrayLike.js
var require_isArrayLike = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isArrayLike.js"(exports, module) {
    var isFunction = require_isFunction();
    var isLength = require_isLength();
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }
    module.exports = isArrayLike;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/keys.js
var require_keys = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/keys.js"(exports, module) {
    var arrayLikeKeys = require_arrayLikeKeys();
    var baseKeys = require_baseKeys();
    var isArrayLike = require_isArrayLike();
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }
    module.exports = keys;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseForOwn.js
var require_baseForOwn = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseForOwn.js"(exports, module) {
    var baseFor = require_baseFor();
    var keys = require_keys();
    function baseForOwn(object, iteratee) {
      return object && baseFor(object, iteratee, keys);
    }
    module.exports = baseForOwn;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_createBaseEach.js
var require_createBaseEach = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_createBaseEach.js"(exports, module) {
    var isArrayLike = require_isArrayLike();
    function createBaseEach(eachFunc, fromRight) {
      return function(collection, iteratee) {
        if (collection == null) {
          return collection;
        }
        if (!isArrayLike(collection)) {
          return eachFunc(collection, iteratee);
        }
        var length = collection.length, index = fromRight ? length : -1, iterable = Object(collection);
        while (fromRight ? index-- : ++index < length) {
          if (iteratee(iterable[index], index, iterable) === false) {
            break;
          }
        }
        return collection;
      };
    }
    module.exports = createBaseEach;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseEach.js
var require_baseEach = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseEach.js"(exports, module) {
    var baseForOwn = require_baseForOwn();
    var createBaseEach = require_createBaseEach();
    var baseEach = createBaseEach(baseForOwn);
    module.exports = baseEach;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseAggregator.js
var require_baseAggregator = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseAggregator.js"(exports, module) {
    var baseEach = require_baseEach();
    function baseAggregator(collection, setter, iteratee, accumulator) {
      baseEach(collection, function(value, key, collection2) {
        setter(accumulator, value, iteratee(value), collection2);
      });
      return accumulator;
    }
    module.exports = baseAggregator;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheClear.js
var require_listCacheClear = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheClear.js"(exports, module) {
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }
    module.exports = listCacheClear;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/eq.js
var require_eq = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/eq.js"(exports, module) {
    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }
    module.exports = eq;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_assocIndexOf.js
var require_assocIndexOf = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_assocIndexOf.js"(exports, module) {
    var eq = require_eq();
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }
    module.exports = assocIndexOf;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheDelete.js
var require_listCacheDelete = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheDelete.js"(exports, module) {
    var assocIndexOf = require_assocIndexOf();
    var arrayProto = Array.prototype;
    var splice = arrayProto.splice;
    function listCacheDelete(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }
    module.exports = listCacheDelete;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheGet.js
var require_listCacheGet = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheGet.js"(exports, module) {
    var assocIndexOf = require_assocIndexOf();
    function listCacheGet(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      return index < 0 ? void 0 : data[index][1];
    }
    module.exports = listCacheGet;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheHas.js
var require_listCacheHas = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheHas.js"(exports, module) {
    var assocIndexOf = require_assocIndexOf();
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
    module.exports = listCacheHas;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheSet.js
var require_listCacheSet = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheSet.js"(exports, module) {
    var assocIndexOf = require_assocIndexOf();
    function listCacheSet(key, value) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    module.exports = listCacheSet;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_ListCache.js
var require_ListCache = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_ListCache.js"(exports, module) {
    var listCacheClear = require_listCacheClear();
    var listCacheDelete = require_listCacheDelete();
    var listCacheGet = require_listCacheGet();
    var listCacheHas = require_listCacheHas();
    var listCacheSet = require_listCacheSet();
    function ListCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype["delete"] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    module.exports = ListCache;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stackClear.js
var require_stackClear = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stackClear.js"(exports, module) {
    var ListCache = require_ListCache();
    function stackClear() {
      this.__data__ = new ListCache();
      this.size = 0;
    }
    module.exports = stackClear;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stackDelete.js
var require_stackDelete = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stackDelete.js"(exports, module) {
    function stackDelete(key) {
      var data = this.__data__, result = data["delete"](key);
      this.size = data.size;
      return result;
    }
    module.exports = stackDelete;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stackGet.js
var require_stackGet = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stackGet.js"(exports, module) {
    function stackGet(key) {
      return this.__data__.get(key);
    }
    module.exports = stackGet;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stackHas.js
var require_stackHas = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stackHas.js"(exports, module) {
    function stackHas(key) {
      return this.__data__.has(key);
    }
    module.exports = stackHas;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Map.js
var require_Map = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Map.js"(exports, module) {
    var getNative = require_getNative();
    var root = require_root();
    var Map2 = getNative(root, "Map");
    module.exports = Map2;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_nativeCreate.js
var require_nativeCreate = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_nativeCreate.js"(exports, module) {
    var getNative = require_getNative();
    var nativeCreate = getNative(Object, "create");
    module.exports = nativeCreate;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashClear.js
var require_hashClear = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashClear.js"(exports, module) {
    var nativeCreate = require_nativeCreate();
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }
    module.exports = hashClear;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashDelete.js
var require_hashDelete = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashDelete.js"(exports, module) {
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }
    module.exports = hashDelete;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashGet.js
var require_hashGet = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashGet.js"(exports, module) {
    var nativeCreate = require_nativeCreate();
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? void 0 : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : void 0;
    }
    module.exports = hashGet;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashHas.js
var require_hashHas = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashHas.js"(exports, module) {
    var nativeCreate = require_nativeCreate();
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
    }
    module.exports = hashHas;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashSet.js
var require_hashSet = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashSet.js"(exports, module) {
    var nativeCreate = require_nativeCreate();
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
      return this;
    }
    module.exports = hashSet;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Hash.js
var require_Hash = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Hash.js"(exports, module) {
    var hashClear = require_hashClear();
    var hashDelete = require_hashDelete();
    var hashGet = require_hashGet();
    var hashHas = require_hashHas();
    var hashSet = require_hashSet();
    function Hash(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    Hash.prototype.clear = hashClear;
    Hash.prototype["delete"] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;
    module.exports = Hash;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheClear.js
var require_mapCacheClear = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheClear.js"(exports, module) {
    var Hash = require_Hash();
    var ListCache = require_ListCache();
    var Map2 = require_Map();
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        "hash": new Hash(),
        "map": new (Map2 || ListCache)(),
        "string": new Hash()
      };
    }
    module.exports = mapCacheClear;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isKeyable.js
var require_isKeyable = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isKeyable.js"(exports, module) {
    function isKeyable(value) {
      var type = typeof value;
      return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
    }
    module.exports = isKeyable;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getMapData.js
var require_getMapData = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getMapData.js"(exports, module) {
    var isKeyable = require_isKeyable();
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
    }
    module.exports = getMapData;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheDelete.js
var require_mapCacheDelete = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheDelete.js"(exports, module) {
    var getMapData = require_getMapData();
    function mapCacheDelete(key) {
      var result = getMapData(this, key)["delete"](key);
      this.size -= result ? 1 : 0;
      return result;
    }
    module.exports = mapCacheDelete;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheGet.js
var require_mapCacheGet = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheGet.js"(exports, module) {
    var getMapData = require_getMapData();
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }
    module.exports = mapCacheGet;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheHas.js
var require_mapCacheHas = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheHas.js"(exports, module) {
    var getMapData = require_getMapData();
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }
    module.exports = mapCacheHas;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheSet.js
var require_mapCacheSet = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheSet.js"(exports, module) {
    var getMapData = require_getMapData();
    function mapCacheSet(key, value) {
      var data = getMapData(this, key), size = data.size;
      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }
    module.exports = mapCacheSet;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_MapCache.js
var require_MapCache = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_MapCache.js"(exports, module) {
    var mapCacheClear = require_mapCacheClear();
    var mapCacheDelete = require_mapCacheDelete();
    var mapCacheGet = require_mapCacheGet();
    var mapCacheHas = require_mapCacheHas();
    var mapCacheSet = require_mapCacheSet();
    function MapCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype["delete"] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    module.exports = MapCache;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stackSet.js
var require_stackSet = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stackSet.js"(exports, module) {
    var ListCache = require_ListCache();
    var Map2 = require_Map();
    var MapCache = require_MapCache();
    var LARGE_ARRAY_SIZE = 200;
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }
    module.exports = stackSet;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Stack.js
var require_Stack = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Stack.js"(exports, module) {
    var ListCache = require_ListCache();
    var stackClear = require_stackClear();
    var stackDelete = require_stackDelete();
    var stackGet = require_stackGet();
    var stackHas = require_stackHas();
    var stackSet = require_stackSet();
    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }
    Stack.prototype.clear = stackClear;
    Stack.prototype["delete"] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;
    module.exports = Stack;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_setCacheAdd.js
var require_setCacheAdd = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_setCacheAdd.js"(exports, module) {
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED);
      return this;
    }
    module.exports = setCacheAdd;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_setCacheHas.js
var require_setCacheHas = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_setCacheHas.js"(exports, module) {
    function setCacheHas(value) {
      return this.__data__.has(value);
    }
    module.exports = setCacheHas;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_SetCache.js
var require_SetCache = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_SetCache.js"(exports, module) {
    var MapCache = require_MapCache();
    var setCacheAdd = require_setCacheAdd();
    var setCacheHas = require_setCacheHas();
    function SetCache(values) {
      var index = -1, length = values == null ? 0 : values.length;
      this.__data__ = new MapCache();
      while (++index < length) {
        this.add(values[index]);
      }
    }
    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
    SetCache.prototype.has = setCacheHas;
    module.exports = SetCache;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arraySome.js
var require_arraySome = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arraySome.js"(exports, module) {
    function arraySome(array, predicate) {
      var index = -1, length = array == null ? 0 : array.length;
      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }
      return false;
    }
    module.exports = arraySome;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cacheHas.js
var require_cacheHas = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cacheHas.js"(exports, module) {
    function cacheHas(cache, key) {
      return cache.has(key);
    }
    module.exports = cacheHas;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_equalArrays.js
var require_equalArrays = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_equalArrays.js"(exports, module) {
    var SetCache = require_SetCache();
    var arraySome = require_arraySome();
    var cacheHas = require_cacheHas();
    var COMPARE_PARTIAL_FLAG = 1;
    var COMPARE_UNORDERED_FLAG = 2;
    function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      }
      var arrStacked = stack.get(array);
      var othStacked = stack.get(other);
      if (arrStacked && othStacked) {
        return arrStacked == other && othStacked == array;
      }
      var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : void 0;
      stack.set(array, other);
      stack.set(other, array);
      while (++index < arrLength) {
        var arrValue = array[index], othValue = other[index];
        if (customizer) {
          var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
        }
        if (compared !== void 0) {
          if (compared) {
            continue;
          }
          result = false;
          break;
        }
        if (seen) {
          if (!arraySome(other, function(othValue2, othIndex) {
            if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
            result = false;
            break;
          }
        } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
          result = false;
          break;
        }
      }
      stack["delete"](array);
      stack["delete"](other);
      return result;
    }
    module.exports = equalArrays;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Uint8Array.js
var require_Uint8Array = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Uint8Array.js"(exports, module) {
    var root = require_root();
    var Uint8Array2 = root.Uint8Array;
    module.exports = Uint8Array2;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapToArray.js
var require_mapToArray = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapToArray.js"(exports, module) {
    function mapToArray(map) {
      var index = -1, result = Array(map.size);
      map.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }
    module.exports = mapToArray;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_setToArray.js
var require_setToArray = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_setToArray.js"(exports, module) {
    function setToArray(set) {
      var index = -1, result = Array(set.size);
      set.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }
    module.exports = setToArray;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_equalByTag.js
var require_equalByTag = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_equalByTag.js"(exports, module) {
    var Symbol2 = require_Symbol();
    var Uint8Array2 = require_Uint8Array();
    var eq = require_eq();
    var equalArrays = require_equalArrays();
    var mapToArray = require_mapToArray();
    var setToArray = require_setToArray();
    var COMPARE_PARTIAL_FLAG = 1;
    var COMPARE_UNORDERED_FLAG = 2;
    var boolTag = "[object Boolean]";
    var dateTag = "[object Date]";
    var errorTag = "[object Error]";
    var mapTag = "[object Map]";
    var numberTag = "[object Number]";
    var regexpTag = "[object RegExp]";
    var setTag = "[object Set]";
    var stringTag = "[object String]";
    var symbolTag = "[object Symbol]";
    var arrayBufferTag = "[object ArrayBuffer]";
    var dataViewTag = "[object DataView]";
    var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
    var symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
    function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
      switch (tag) {
        case dataViewTag:
          if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
            return false;
          }
          object = object.buffer;
          other = other.buffer;
        case arrayBufferTag:
          if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array2(object), new Uint8Array2(other))) {
            return false;
          }
          return true;
        case boolTag:
        case dateTag:
        case numberTag:
          return eq(+object, +other);
        case errorTag:
          return object.name == other.name && object.message == other.message;
        case regexpTag:
        case stringTag:
          return object == other + "";
        case mapTag:
          var convert = mapToArray;
        case setTag:
          var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
          convert || (convert = setToArray);
          if (object.size != other.size && !isPartial) {
            return false;
          }
          var stacked = stack.get(object);
          if (stacked) {
            return stacked == other;
          }
          bitmask |= COMPARE_UNORDERED_FLAG;
          stack.set(object, other);
          var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
          stack["delete"](object);
          return result;
        case symbolTag:
          if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other);
          }
      }
      return false;
    }
    module.exports = equalByTag;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayPush.js
var require_arrayPush = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayPush.js"(exports, module) {
    function arrayPush(array, values) {
      var index = -1, length = values.length, offset = array.length;
      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }
    module.exports = arrayPush;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseGetAllKeys.js
var require_baseGetAllKeys = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseGetAllKeys.js"(exports, module) {
    var arrayPush = require_arrayPush();
    var isArray = require_isArray();
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
    }
    module.exports = baseGetAllKeys;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayFilter.js
var require_arrayFilter = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayFilter.js"(exports, module) {
    function arrayFilter(array, predicate) {
      var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }
    module.exports = arrayFilter;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/stubArray.js
var require_stubArray = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/stubArray.js"(exports, module) {
    function stubArray() {
      return [];
    }
    module.exports = stubArray;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getSymbols.js
var require_getSymbols = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getSymbols.js"(exports, module) {
    var arrayFilter = require_arrayFilter();
    var stubArray = require_stubArray();
    var objectProto = Object.prototype;
    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    var nativeGetSymbols = Object.getOwnPropertySymbols;
    var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
      if (object == null) {
        return [];
      }
      object = Object(object);
      return arrayFilter(nativeGetSymbols(object), function(symbol) {
        return propertyIsEnumerable.call(object, symbol);
      });
    };
    module.exports = getSymbols;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getAllKeys.js
var require_getAllKeys = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getAllKeys.js"(exports, module) {
    var baseGetAllKeys = require_baseGetAllKeys();
    var getSymbols = require_getSymbols();
    var keys = require_keys();
    function getAllKeys(object) {
      return baseGetAllKeys(object, keys, getSymbols);
    }
    module.exports = getAllKeys;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_equalObjects.js
var require_equalObjects = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_equalObjects.js"(exports, module) {
    var getAllKeys = require_getAllKeys();
    var COMPARE_PARTIAL_FLAG = 1;
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
      if (objLength != othLength && !isPartial) {
        return false;
      }
      var index = objLength;
      while (index--) {
        var key = objProps[index];
        if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
          return false;
        }
      }
      var objStacked = stack.get(object);
      var othStacked = stack.get(other);
      if (objStacked && othStacked) {
        return objStacked == other && othStacked == object;
      }
      var result = true;
      stack.set(object, other);
      stack.set(other, object);
      var skipCtor = isPartial;
      while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key], othValue = other[key];
        if (customizer) {
          var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
        }
        if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
          result = false;
          break;
        }
        skipCtor || (skipCtor = key == "constructor");
      }
      if (result && !skipCtor) {
        var objCtor = object.constructor, othCtor = other.constructor;
        if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
          result = false;
        }
      }
      stack["delete"](object);
      stack["delete"](other);
      return result;
    }
    module.exports = equalObjects;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_DataView.js
var require_DataView = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_DataView.js"(exports, module) {
    var getNative = require_getNative();
    var root = require_root();
    var DataView = getNative(root, "DataView");
    module.exports = DataView;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Promise.js
var require_Promise = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Promise.js"(exports, module) {
    var getNative = require_getNative();
    var root = require_root();
    var Promise2 = getNative(root, "Promise");
    module.exports = Promise2;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Set.js
var require_Set = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Set.js"(exports, module) {
    var getNative = require_getNative();
    var root = require_root();
    var Set2 = getNative(root, "Set");
    module.exports = Set2;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_WeakMap.js
var require_WeakMap = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_WeakMap.js"(exports, module) {
    var getNative = require_getNative();
    var root = require_root();
    var WeakMap2 = getNative(root, "WeakMap");
    module.exports = WeakMap2;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getTag.js
var require_getTag = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getTag.js"(exports, module) {
    var DataView = require_DataView();
    var Map2 = require_Map();
    var Promise2 = require_Promise();
    var Set2 = require_Set();
    var WeakMap2 = require_WeakMap();
    var baseGetTag = require_baseGetTag();
    var toSource = require_toSource();
    var mapTag = "[object Map]";
    var objectTag = "[object Object]";
    var promiseTag = "[object Promise]";
    var setTag = "[object Set]";
    var weakMapTag = "[object WeakMap]";
    var dataViewTag = "[object DataView]";
    var dataViewCtorString = toSource(DataView);
    var mapCtorString = toSource(Map2);
    var promiseCtorString = toSource(Promise2);
    var setCtorString = toSource(Set2);
    var weakMapCtorString = toSource(WeakMap2);
    var getTag = baseGetTag;
    if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map2 && getTag(new Map2()) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set2 && getTag(new Set2()) != setTag || WeakMap2 && getTag(new WeakMap2()) != weakMapTag) {
      getTag = function(value) {
        var result = baseGetTag(value), Ctor = result == objectTag ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString:
              return dataViewTag;
            case mapCtorString:
              return mapTag;
            case promiseCtorString:
              return promiseTag;
            case setCtorString:
              return setTag;
            case weakMapCtorString:
              return weakMapTag;
          }
        }
        return result;
      };
    }
    module.exports = getTag;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsEqualDeep.js
var require_baseIsEqualDeep = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsEqualDeep.js"(exports, module) {
    var Stack = require_Stack();
    var equalArrays = require_equalArrays();
    var equalByTag = require_equalByTag();
    var equalObjects = require_equalObjects();
    var getTag = require_getTag();
    var isArray = require_isArray();
    var isBuffer = require_isBuffer();
    var isTypedArray = require_isTypedArray();
    var COMPARE_PARTIAL_FLAG = 1;
    var argsTag = "[object Arguments]";
    var arrayTag = "[object Array]";
    var objectTag = "[object Object]";
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
      var objIsArr = isArray(object), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
      objTag = objTag == argsTag ? objectTag : objTag;
      othTag = othTag == argsTag ? objectTag : othTag;
      var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
      if (isSameTag && isBuffer(object)) {
        if (!isBuffer(other)) {
          return false;
        }
        objIsArr = true;
        objIsObj = false;
      }
      if (isSameTag && !objIsObj) {
        stack || (stack = new Stack());
        return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
      }
      if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
        var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
          stack || (stack = new Stack());
          return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
        }
      }
      if (!isSameTag) {
        return false;
      }
      stack || (stack = new Stack());
      return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
    }
    module.exports = baseIsEqualDeep;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsEqual.js
var require_baseIsEqual = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsEqual.js"(exports, module) {
    var baseIsEqualDeep = require_baseIsEqualDeep();
    var isObjectLike = require_isObjectLike();
    function baseIsEqual(value, other, bitmask, customizer, stack) {
      if (value === other) {
        return true;
      }
      if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
        return value !== value && other !== other;
      }
      return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
    }
    module.exports = baseIsEqual;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsMatch.js
var require_baseIsMatch = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsMatch.js"(exports, module) {
    var Stack = require_Stack();
    var baseIsEqual = require_baseIsEqual();
    var COMPARE_PARTIAL_FLAG = 1;
    var COMPARE_UNORDERED_FLAG = 2;
    function baseIsMatch(object, source, matchData, customizer) {
      var index = matchData.length, length = index, noCustomizer = !customizer;
      if (object == null) {
        return !length;
      }
      object = Object(object);
      while (index--) {
        var data = matchData[index];
        if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
          return false;
        }
      }
      while (++index < length) {
        data = matchData[index];
        var key = data[0], objValue = object[key], srcValue = data[1];
        if (noCustomizer && data[2]) {
          if (objValue === void 0 && !(key in object)) {
            return false;
          }
        } else {
          var stack = new Stack();
          if (customizer) {
            var result = customizer(objValue, srcValue, key, object, source, stack);
          }
          if (!(result === void 0 ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result)) {
            return false;
          }
        }
      }
      return true;
    }
    module.exports = baseIsMatch;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isStrictComparable.js
var require_isStrictComparable = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isStrictComparable.js"(exports, module) {
    var isObject2 = require_isObject();
    function isStrictComparable(value) {
      return value === value && !isObject2(value);
    }
    module.exports = isStrictComparable;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getMatchData.js
var require_getMatchData = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getMatchData.js"(exports, module) {
    var isStrictComparable = require_isStrictComparable();
    var keys = require_keys();
    function getMatchData(object) {
      var result = keys(object), length = result.length;
      while (length--) {
        var key = result[length], value = object[key];
        result[length] = [key, value, isStrictComparable(value)];
      }
      return result;
    }
    module.exports = getMatchData;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_matchesStrictComparable.js
var require_matchesStrictComparable = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_matchesStrictComparable.js"(exports, module) {
    function matchesStrictComparable(key, srcValue) {
      return function(object) {
        if (object == null) {
          return false;
        }
        return object[key] === srcValue && (srcValue !== void 0 || key in Object(object));
      };
    }
    module.exports = matchesStrictComparable;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseMatches.js
var require_baseMatches = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseMatches.js"(exports, module) {
    var baseIsMatch = require_baseIsMatch();
    var getMatchData = require_getMatchData();
    var matchesStrictComparable = require_matchesStrictComparable();
    function baseMatches(source) {
      var matchData = getMatchData(source);
      if (matchData.length == 1 && matchData[0][2]) {
        return matchesStrictComparable(matchData[0][0], matchData[0][1]);
      }
      return function(object) {
        return object === source || baseIsMatch(object, source, matchData);
      };
    }
    module.exports = baseMatches;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isSymbol.js
var require_isSymbol = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isSymbol.js"(exports, module) {
    var baseGetTag = require_baseGetTag();
    var isObjectLike = require_isObjectLike();
    var symbolTag = "[object Symbol]";
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
    }
    module.exports = isSymbol;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isKey.js
var require_isKey = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isKey.js"(exports, module) {
    var isArray = require_isArray();
    var isSymbol = require_isSymbol();
    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
    var reIsPlainProp = /^\w*$/;
    function isKey(value, object) {
      if (isArray(value)) {
        return false;
      }
      var type = typeof value;
      if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
        return true;
      }
      return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
    }
    module.exports = isKey;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/memoize.js
var require_memoize = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/memoize.js"(exports, module) {
    var MapCache = require_MapCache();
    var FUNC_ERROR_TEXT = "Expected a function";
    function memoize2(func, resolver) {
      if (typeof func != "function" || resolver != null && typeof resolver != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var memoized = function() {
        var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result) || cache;
        return result;
      };
      memoized.cache = new (memoize2.Cache || MapCache)();
      return memoized;
    }
    memoize2.Cache = MapCache;
    module.exports = memoize2;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_memoizeCapped.js
var require_memoizeCapped = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_memoizeCapped.js"(exports, module) {
    var memoize2 = require_memoize();
    var MAX_MEMOIZE_SIZE = 500;
    function memoizeCapped(func) {
      var result = memoize2(func, function(key) {
        if (cache.size === MAX_MEMOIZE_SIZE) {
          cache.clear();
        }
        return key;
      });
      var cache = result.cache;
      return result;
    }
    module.exports = memoizeCapped;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stringToPath.js
var require_stringToPath = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stringToPath.js"(exports, module) {
    var memoizeCapped = require_memoizeCapped();
    var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
    var reEscapeChar = /\\(\\)?/g;
    var stringToPath = memoizeCapped(function(string) {
      var result = [];
      if (string.charCodeAt(0) === 46) {
        result.push("");
      }
      string.replace(rePropName, function(match, number, quote, subString) {
        result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
      });
      return result;
    });
    module.exports = stringToPath;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayMap.js
var require_arrayMap = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayMap.js"(exports, module) {
    function arrayMap(array, iteratee) {
      var index = -1, length = array == null ? 0 : array.length, result = Array(length);
      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }
    module.exports = arrayMap;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseToString.js
var require_baseToString = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseToString.js"(exports, module) {
    var Symbol2 = require_Symbol();
    var arrayMap = require_arrayMap();
    var isArray = require_isArray();
    var isSymbol = require_isSymbol();
    var INFINITY = 1 / 0;
    var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
    var symbolToString = symbolProto ? symbolProto.toString : void 0;
    function baseToString(value) {
      if (typeof value == "string") {
        return value;
      }
      if (isArray(value)) {
        return arrayMap(value, baseToString) + "";
      }
      if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : "";
      }
      var result = value + "";
      return result == "0" && 1 / value == -INFINITY ? "-0" : result;
    }
    module.exports = baseToString;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/toString.js
var require_toString = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/toString.js"(exports, module) {
    var baseToString = require_baseToString();
    function toString(value) {
      return value == null ? "" : baseToString(value);
    }
    module.exports = toString;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_castPath.js
var require_castPath = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_castPath.js"(exports, module) {
    var isArray = require_isArray();
    var isKey = require_isKey();
    var stringToPath = require_stringToPath();
    var toString = require_toString();
    function castPath(value, object) {
      if (isArray(value)) {
        return value;
      }
      return isKey(value, object) ? [value] : stringToPath(toString(value));
    }
    module.exports = castPath;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_toKey.js
var require_toKey = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_toKey.js"(exports, module) {
    var isSymbol = require_isSymbol();
    var INFINITY = 1 / 0;
    function toKey(value) {
      if (typeof value == "string" || isSymbol(value)) {
        return value;
      }
      var result = value + "";
      return result == "0" && 1 / value == -INFINITY ? "-0" : result;
    }
    module.exports = toKey;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseGet.js
var require_baseGet = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseGet.js"(exports, module) {
    var castPath = require_castPath();
    var toKey = require_toKey();
    function baseGet(object, path) {
      path = castPath(path, object);
      var index = 0, length = path.length;
      while (object != null && index < length) {
        object = object[toKey(path[index++])];
      }
      return index && index == length ? object : void 0;
    }
    module.exports = baseGet;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/get.js
var require_get = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/get.js"(exports, module) {
    var baseGet = require_baseGet();
    function get2(object, path, defaultValue) {
      var result = object == null ? void 0 : baseGet(object, path);
      return result === void 0 ? defaultValue : result;
    }
    module.exports = get2;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseHasIn.js
var require_baseHasIn = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseHasIn.js"(exports, module) {
    function baseHasIn(object, key) {
      return object != null && key in Object(object);
    }
    module.exports = baseHasIn;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hasPath.js
var require_hasPath = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hasPath.js"(exports, module) {
    var castPath = require_castPath();
    var isArguments = require_isArguments();
    var isArray = require_isArray();
    var isIndex = require_isIndex();
    var isLength = require_isLength();
    var toKey = require_toKey();
    function hasPath(object, path, hasFunc) {
      path = castPath(path, object);
      var index = -1, length = path.length, result = false;
      while (++index < length) {
        var key = toKey(path[index]);
        if (!(result = object != null && hasFunc(object, key))) {
          break;
        }
        object = object[key];
      }
      if (result || ++index != length) {
        return result;
      }
      length = object == null ? 0 : object.length;
      return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
    }
    module.exports = hasPath;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/hasIn.js
var require_hasIn = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/hasIn.js"(exports, module) {
    var baseHasIn = require_baseHasIn();
    var hasPath = require_hasPath();
    function hasIn(object, path) {
      return object != null && hasPath(object, path, baseHasIn);
    }
    module.exports = hasIn;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseMatchesProperty.js
var require_baseMatchesProperty = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseMatchesProperty.js"(exports, module) {
    var baseIsEqual = require_baseIsEqual();
    var get2 = require_get();
    var hasIn = require_hasIn();
    var isKey = require_isKey();
    var isStrictComparable = require_isStrictComparable();
    var matchesStrictComparable = require_matchesStrictComparable();
    var toKey = require_toKey();
    var COMPARE_PARTIAL_FLAG = 1;
    var COMPARE_UNORDERED_FLAG = 2;
    function baseMatchesProperty(path, srcValue) {
      if (isKey(path) && isStrictComparable(srcValue)) {
        return matchesStrictComparable(toKey(path), srcValue);
      }
      return function(object) {
        var objValue = get2(object, path);
        return objValue === void 0 && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
      };
    }
    module.exports = baseMatchesProperty;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/identity.js
var require_identity = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/identity.js"(exports, module) {
    function identity(value) {
      return value;
    }
    module.exports = identity;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseProperty.js
var require_baseProperty = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseProperty.js"(exports, module) {
    function baseProperty(key) {
      return function(object) {
        return object == null ? void 0 : object[key];
      };
    }
    module.exports = baseProperty;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_basePropertyDeep.js
var require_basePropertyDeep = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_basePropertyDeep.js"(exports, module) {
    var baseGet = require_baseGet();
    function basePropertyDeep(path) {
      return function(object) {
        return baseGet(object, path);
      };
    }
    module.exports = basePropertyDeep;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/property.js
var require_property = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/property.js"(exports, module) {
    var baseProperty = require_baseProperty();
    var basePropertyDeep = require_basePropertyDeep();
    var isKey = require_isKey();
    var toKey = require_toKey();
    function property(path) {
      return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
    }
    module.exports = property;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIteratee.js
var require_baseIteratee = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIteratee.js"(exports, module) {
    var baseMatches = require_baseMatches();
    var baseMatchesProperty = require_baseMatchesProperty();
    var identity = require_identity();
    var isArray = require_isArray();
    var property = require_property();
    function baseIteratee(value) {
      if (typeof value == "function") {
        return value;
      }
      if (value == null) {
        return identity;
      }
      if (typeof value == "object") {
        return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
      }
      return property(value);
    }
    module.exports = baseIteratee;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_createAggregator.js
var require_createAggregator = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_createAggregator.js"(exports, module) {
    var arrayAggregator = require_arrayAggregator();
    var baseAggregator = require_baseAggregator();
    var baseIteratee = require_baseIteratee();
    var isArray = require_isArray();
    function createAggregator(setter, initializer) {
      return function(collection, iteratee) {
        var func = isArray(collection) ? arrayAggregator : baseAggregator, accumulator = initializer ? initializer() : {};
        return func(collection, setter, baseIteratee(iteratee, 2), accumulator);
      };
    }
    module.exports = createAggregator;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/countBy.js
var require_countBy = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/countBy.js"(exports, module) {
    var baseAssignValue = require_baseAssignValue();
    var createAggregator = require_createAggregator();
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var countBy = createAggregator(function(result, value, key) {
      if (hasOwnProperty.call(result, key)) {
        ++result[key];
      } else {
        baseAssignValue(result, key, 1);
      }
    });
    module.exports = countBy;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_assignValue.js
var require_assignValue = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_assignValue.js"(exports, module) {
    var baseAssignValue = require_baseAssignValue();
    var eq = require_eq();
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) {
        baseAssignValue(object, key, value);
      }
    }
    module.exports = assignValue;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseSet.js
var require_baseSet = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseSet.js"(exports, module) {
    var assignValue = require_assignValue();
    var castPath = require_castPath();
    var isIndex = require_isIndex();
    var isObject2 = require_isObject();
    var toKey = require_toKey();
    function baseSet(object, path, value, customizer) {
      if (!isObject2(object)) {
        return object;
      }
      path = castPath(path, object);
      var index = -1, length = path.length, lastIndex = length - 1, nested = object;
      while (nested != null && ++index < length) {
        var key = toKey(path[index]), newValue = value;
        if (key === "__proto__" || key === "constructor" || key === "prototype") {
          return object;
        }
        if (index != lastIndex) {
          var objValue = nested[key];
          newValue = customizer ? customizer(objValue, key, nested) : void 0;
          if (newValue === void 0) {
            newValue = isObject2(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {};
          }
        }
        assignValue(nested, key, newValue);
        nested = nested[key];
      }
      return object;
    }
    module.exports = baseSet;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_basePickBy.js
var require_basePickBy = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_basePickBy.js"(exports, module) {
    var baseGet = require_baseGet();
    var baseSet = require_baseSet();
    var castPath = require_castPath();
    function basePickBy(object, paths, predicate) {
      var index = -1, length = paths.length, result = {};
      while (++index < length) {
        var path = paths[index], value = baseGet(object, path);
        if (predicate(value, path)) {
          baseSet(result, castPath(path, object), value);
        }
      }
      return result;
    }
    module.exports = basePickBy;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getPrototype.js
var require_getPrototype = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getPrototype.js"(exports, module) {
    var overArg = require_overArg();
    var getPrototype = overArg(Object.getPrototypeOf, Object);
    module.exports = getPrototype;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getSymbolsIn.js
var require_getSymbolsIn = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getSymbolsIn.js"(exports, module) {
    var arrayPush = require_arrayPush();
    var getPrototype = require_getPrototype();
    var getSymbols = require_getSymbols();
    var stubArray = require_stubArray();
    var nativeGetSymbols = Object.getOwnPropertySymbols;
    var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
      var result = [];
      while (object) {
        arrayPush(result, getSymbols(object));
        object = getPrototype(object);
      }
      return result;
    };
    module.exports = getSymbolsIn;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_nativeKeysIn.js
var require_nativeKeysIn = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_nativeKeysIn.js"(exports, module) {
    function nativeKeysIn(object) {
      var result = [];
      if (object != null) {
        for (var key in Object(object)) {
          result.push(key);
        }
      }
      return result;
    }
    module.exports = nativeKeysIn;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseKeysIn.js
var require_baseKeysIn = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseKeysIn.js"(exports, module) {
    var isObject2 = require_isObject();
    var isPrototype = require_isPrototype();
    var nativeKeysIn = require_nativeKeysIn();
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function baseKeysIn(object) {
      if (!isObject2(object)) {
        return nativeKeysIn(object);
      }
      var isProto = isPrototype(object), result = [];
      for (var key in object) {
        if (!(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))) {
          result.push(key);
        }
      }
      return result;
    }
    module.exports = baseKeysIn;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/keysIn.js
var require_keysIn = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/keysIn.js"(exports, module) {
    var arrayLikeKeys = require_arrayLikeKeys();
    var baseKeysIn = require_baseKeysIn();
    var isArrayLike = require_isArrayLike();
    function keysIn(object) {
      return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
    }
    module.exports = keysIn;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getAllKeysIn.js
var require_getAllKeysIn = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getAllKeysIn.js"(exports, module) {
    var baseGetAllKeys = require_baseGetAllKeys();
    var getSymbolsIn = require_getSymbolsIn();
    var keysIn = require_keysIn();
    function getAllKeysIn(object) {
      return baseGetAllKeys(object, keysIn, getSymbolsIn);
    }
    module.exports = getAllKeysIn;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/pickBy.js
var require_pickBy = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/pickBy.js"(exports, module) {
    var arrayMap = require_arrayMap();
    var baseIteratee = require_baseIteratee();
    var basePickBy = require_basePickBy();
    var getAllKeysIn = require_getAllKeysIn();
    function pickBy(object, predicate) {
      if (object == null) {
        return {};
      }
      var props = arrayMap(getAllKeysIn(object), function(prop) {
        return [prop];
      });
      predicate = baseIteratee(predicate);
      return basePickBy(object, props, function(value, path) {
        return predicate(value, path[0]);
      });
    }
    module.exports = pickBy;
  }
});

// ../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/utils/js_utils.js
function memoize(fn) {
  let result = null;
  const memoized = () => {
    if (result == null) {
      result = fn();
    }
    return result;
  };
  return memoized;
}
function without(items, item) {
  return items.filter(
    (i3) => i3 !== item
  );
}
function union(itemsA, itemsB) {
  const set = /* @__PURE__ */ new Set();
  const insertItem = (item) => set.add(item);
  itemsA.forEach(insertItem);
  itemsB.forEach(insertItem);
  const result = [];
  set.forEach(
    (key) => result.push(key)
  );
  return result;
}
var init_js_utils = __esm({
  "../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/utils/js_utils.js"() {
  }
});

// ../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/EnterLeaveCounter.js
var EnterLeaveCounter;
var init_EnterLeaveCounter = __esm({
  "../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/EnterLeaveCounter.js"() {
    init_js_utils();
    EnterLeaveCounter = class {
      enter(enteringNode) {
        const previousLength = this.entered.length;
        const isNodeEntered = (node) => this.isNodeInDocument(node) && (!node.contains || node.contains(enteringNode));
        this.entered = union(this.entered.filter(isNodeEntered), [
          enteringNode
        ]);
        return previousLength === 0 && this.entered.length > 0;
      }
      leave(leavingNode) {
        const previousLength = this.entered.length;
        this.entered = without(this.entered.filter(this.isNodeInDocument), leavingNode);
        return previousLength > 0 && this.entered.length === 0;
      }
      reset() {
        this.entered = [];
      }
      constructor(isNodeInDocument) {
        this.entered = [];
        this.isNodeInDocument = isNodeInDocument;
      }
    };
  }
});

// ../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/NativeDragSources/NativeDragSource.js
var NativeDragSource;
var init_NativeDragSource = __esm({
  "../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/NativeDragSources/NativeDragSource.js"() {
    NativeDragSource = class {
      initializeExposedProperties() {
        Object.keys(this.config.exposeProperties).forEach((property) => {
          Object.defineProperty(this.item, property, {
            configurable: true,
            enumerable: true,
            get() {
              console.warn(`Browser doesn't allow reading "${property}" until the drop event.`);
              return null;
            }
          });
        });
      }
      loadDataTransfer(dataTransfer) {
        if (dataTransfer) {
          const newProperties = {};
          Object.keys(this.config.exposeProperties).forEach((property) => {
            const propertyFn = this.config.exposeProperties[property];
            if (propertyFn != null) {
              newProperties[property] = {
                value: propertyFn(dataTransfer, this.config.matchesTypes),
                configurable: true,
                enumerable: true
              };
            }
          });
          Object.defineProperties(this.item, newProperties);
        }
      }
      canDrag() {
        return true;
      }
      beginDrag() {
        return this.item;
      }
      isDragging(monitor, handle) {
        return handle === monitor.getSourceId();
      }
      endDrag() {
      }
      constructor(config) {
        this.config = config;
        this.item = {};
        this.initializeExposedProperties();
      }
    };
  }
});

// ../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/NativeTypes.js
var NativeTypes_exports = {};
__export(NativeTypes_exports, {
  FILE: () => FILE,
  HTML: () => HTML,
  TEXT: () => TEXT,
  URL: () => URL
});
var FILE, URL, TEXT, HTML;
var init_NativeTypes = __esm({
  "../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/NativeTypes.js"() {
    FILE = "__NATIVE_FILE__";
    URL = "__NATIVE_URL__";
    TEXT = "__NATIVE_TEXT__";
    HTML = "__NATIVE_HTML__";
  }
});

// ../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/NativeDragSources/getDataFromDataTransfer.js
function getDataFromDataTransfer(dataTransfer, typesToTry, defaultValue) {
  const result = typesToTry.reduce(
    (resultSoFar, typeToTry) => resultSoFar || dataTransfer.getData(typeToTry),
    ""
  );
  return result != null ? result : defaultValue;
}
var init_getDataFromDataTransfer = __esm({
  "../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/NativeDragSources/getDataFromDataTransfer.js"() {
  }
});

// ../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/NativeDragSources/nativeTypesConfig.js
var nativeTypesConfig;
var init_nativeTypesConfig = __esm({
  "../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/NativeDragSources/nativeTypesConfig.js"() {
    init_NativeTypes();
    init_getDataFromDataTransfer();
    nativeTypesConfig = {
      [FILE]: {
        exposeProperties: {
          files: (dataTransfer) => Array.prototype.slice.call(dataTransfer.files),
          items: (dataTransfer) => dataTransfer.items,
          dataTransfer: (dataTransfer) => dataTransfer
        },
        matchesTypes: [
          "Files"
        ]
      },
      [HTML]: {
        exposeProperties: {
          html: (dataTransfer, matchesTypes) => getDataFromDataTransfer(dataTransfer, matchesTypes, ""),
          dataTransfer: (dataTransfer) => dataTransfer
        },
        matchesTypes: [
          "Html",
          "text/html"
        ]
      },
      [URL]: {
        exposeProperties: {
          urls: (dataTransfer, matchesTypes) => getDataFromDataTransfer(dataTransfer, matchesTypes, "").split("\n"),
          dataTransfer: (dataTransfer) => dataTransfer
        },
        matchesTypes: [
          "Url",
          "text/uri-list"
        ]
      },
      [TEXT]: {
        exposeProperties: {
          text: (dataTransfer, matchesTypes) => getDataFromDataTransfer(dataTransfer, matchesTypes, ""),
          dataTransfer: (dataTransfer) => dataTransfer
        },
        matchesTypes: [
          "Text",
          "text/plain"
        ]
      }
    };
  }
});

// ../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/NativeDragSources/index.js
function createNativeDragSource(type, dataTransfer) {
  const config = nativeTypesConfig[type];
  if (!config) {
    throw new Error(`native type ${type} has no configuration`);
  }
  const result = new NativeDragSource(config);
  result.loadDataTransfer(dataTransfer);
  return result;
}
function matchNativeItemType(dataTransfer) {
  if (!dataTransfer) {
    return null;
  }
  const dataTransferTypes = Array.prototype.slice.call(dataTransfer.types || []);
  return Object.keys(nativeTypesConfig).filter((nativeItemType) => {
    const typeConfig = nativeTypesConfig[nativeItemType];
    if (!(typeConfig === null || typeConfig === void 0 ? void 0 : typeConfig.matchesTypes)) {
      return false;
    }
    return typeConfig.matchesTypes.some(
      (t2) => dataTransferTypes.indexOf(t2) > -1
    );
  })[0] || null;
}
var init_NativeDragSources = __esm({
  "../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/NativeDragSources/index.js"() {
    init_NativeDragSource();
    init_nativeTypesConfig();
  }
});

// ../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/BrowserDetector.js
var isFirefox, isSafari;
var init_BrowserDetector = __esm({
  "../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/BrowserDetector.js"() {
    init_js_utils();
    isFirefox = memoize(
      () => /firefox/i.test(navigator.userAgent)
    );
    isSafari = memoize(
      () => Boolean(window.safari)
    );
  }
});

// ../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/MonotonicInterpolant.js
var MonotonicInterpolant;
var init_MonotonicInterpolant = __esm({
  "../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/MonotonicInterpolant.js"() {
    MonotonicInterpolant = class {
      interpolate(x4) {
        const { xs, ys, c1s, c2s, c3s } = this;
        let i3 = xs.length - 1;
        if (x4 === xs[i3]) {
          return ys[i3];
        }
        let low = 0;
        let high = c3s.length - 1;
        let mid;
        while (low <= high) {
          mid = Math.floor(0.5 * (low + high));
          const xHere = xs[mid];
          if (xHere < x4) {
            low = mid + 1;
          } else if (xHere > x4) {
            high = mid - 1;
          } else {
            return ys[mid];
          }
        }
        i3 = Math.max(0, high);
        const diff = x4 - xs[i3];
        const diffSq = diff * diff;
        return ys[i3] + c1s[i3] * diff + c2s[i3] * diffSq + c3s[i3] * diff * diffSq;
      }
      constructor(xs, ys) {
        const { length } = xs;
        const indexes = [];
        for (let i3 = 0; i3 < length; i3++) {
          indexes.push(i3);
        }
        indexes.sort(
          (a4, b2) => xs[a4] < xs[b2] ? -1 : 1
        );
        const dys = [];
        const dxs = [];
        const ms = [];
        let dx;
        let dy;
        for (let i1 = 0; i1 < length - 1; i1++) {
          dx = xs[i1 + 1] - xs[i1];
          dy = ys[i1 + 1] - ys[i1];
          dxs.push(dx);
          dys.push(dy);
          ms.push(dy / dx);
        }
        const c1s = [
          ms[0]
        ];
        for (let i22 = 0; i22 < dxs.length - 1; i22++) {
          const m22 = ms[i22];
          const mNext = ms[i22 + 1];
          if (m22 * mNext <= 0) {
            c1s.push(0);
          } else {
            dx = dxs[i22];
            const dxNext = dxs[i22 + 1];
            const common = dx + dxNext;
            c1s.push(3 * common / ((common + dxNext) / m22 + (common + dx) / mNext));
          }
        }
        c1s.push(ms[ms.length - 1]);
        const c2s = [];
        const c3s = [];
        let m3;
        for (let i3 = 0; i3 < c1s.length - 1; i3++) {
          m3 = ms[i3];
          const c1 = c1s[i3];
          const invDx = 1 / dxs[i3];
          const common = c1 + c1s[i3 + 1] - m3 - m3;
          c2s.push((m3 - c1 - common) * invDx);
          c3s.push(common * invDx * invDx);
        }
        this.xs = xs;
        this.ys = ys;
        this.c1s = c1s;
        this.c2s = c2s;
        this.c3s = c3s;
      }
    };
  }
});

// ../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/OffsetUtils.js
function getNodeClientOffset(node) {
  const el = node.nodeType === ELEMENT_NODE ? node : node.parentElement;
  if (!el) {
    return null;
  }
  const { top, left } = el.getBoundingClientRect();
  return {
    x: left,
    y: top
  };
}
function getEventClientOffset(e) {
  return {
    x: e.clientX,
    y: e.clientY
  };
}
function isImageNode(node) {
  var ref;
  return node.nodeName === "IMG" && (isFirefox() || !((ref = document.documentElement) === null || ref === void 0 ? void 0 : ref.contains(node)));
}
function getDragPreviewSize(isImage, dragPreview, sourceWidth, sourceHeight) {
  let dragPreviewWidth = isImage ? dragPreview.width : sourceWidth;
  let dragPreviewHeight = isImage ? dragPreview.height : sourceHeight;
  if (isSafari() && isImage) {
    dragPreviewHeight /= window.devicePixelRatio;
    dragPreviewWidth /= window.devicePixelRatio;
  }
  return {
    dragPreviewWidth,
    dragPreviewHeight
  };
}
function getDragPreviewOffset(sourceNode, dragPreview, clientOffset, anchorPoint, offsetPoint) {
  const isImage = isImageNode(dragPreview);
  const dragPreviewNode = isImage ? sourceNode : dragPreview;
  const dragPreviewNodeOffsetFromClient = getNodeClientOffset(dragPreviewNode);
  const offsetFromDragPreview = {
    x: clientOffset.x - dragPreviewNodeOffsetFromClient.x,
    y: clientOffset.y - dragPreviewNodeOffsetFromClient.y
  };
  const { offsetWidth: sourceWidth, offsetHeight: sourceHeight } = sourceNode;
  const { anchorX, anchorY } = anchorPoint;
  const { dragPreviewWidth, dragPreviewHeight } = getDragPreviewSize(isImage, dragPreview, sourceWidth, sourceHeight);
  const calculateYOffset = () => {
    const interpolantY = new MonotonicInterpolant([
      0,
      0.5,
      1
    ], [
      // Dock to the top
      offsetFromDragPreview.y,
      // Align at the center
      offsetFromDragPreview.y / sourceHeight * dragPreviewHeight,
      // Dock to the bottom
      offsetFromDragPreview.y + dragPreviewHeight - sourceHeight
    ]);
    let y3 = interpolantY.interpolate(anchorY);
    if (isSafari() && isImage) {
      y3 += (window.devicePixelRatio - 1) * dragPreviewHeight;
    }
    return y3;
  };
  const calculateXOffset = () => {
    const interpolantX = new MonotonicInterpolant([
      0,
      0.5,
      1
    ], [
      // Dock to the left
      offsetFromDragPreview.x,
      // Align at the center
      offsetFromDragPreview.x / sourceWidth * dragPreviewWidth,
      // Dock to the right
      offsetFromDragPreview.x + dragPreviewWidth - sourceWidth
    ]);
    return interpolantX.interpolate(anchorX);
  };
  const { offsetX, offsetY } = offsetPoint;
  const isManualOffsetX = offsetX === 0 || offsetX;
  const isManualOffsetY = offsetY === 0 || offsetY;
  return {
    x: isManualOffsetX ? offsetX : calculateXOffset(),
    y: isManualOffsetY ? offsetY : calculateYOffset()
  };
}
var ELEMENT_NODE;
var init_OffsetUtils = __esm({
  "../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/OffsetUtils.js"() {
    init_BrowserDetector();
    init_MonotonicInterpolant();
    ELEMENT_NODE = 1;
  }
});

// ../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/OptionsReader.js
var OptionsReader;
var init_OptionsReader = __esm({
  "../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/OptionsReader.js"() {
    OptionsReader = class {
      get window() {
        if (this.globalContext) {
          return this.globalContext;
        } else if (typeof window !== "undefined") {
          return window;
        }
        return void 0;
      }
      get document() {
        var ref;
        if ((ref = this.globalContext) === null || ref === void 0 ? void 0 : ref.document) {
          return this.globalContext.document;
        } else if (this.window) {
          return this.window.document;
        } else {
          return void 0;
        }
      }
      get rootElement() {
        var ref;
        return ((ref = this.optionsArgs) === null || ref === void 0 ? void 0 : ref.rootElement) || this.window;
      }
      constructor(globalContext, options) {
        this.ownerDocument = null;
        this.globalContext = globalContext;
        this.optionsArgs = options;
      }
    };
  }
});

// ../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/HTML5BackendImpl.js
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _objectSpread(target) {
  for (var i3 = 1; i3 < arguments.length; i3++) {
    var source = arguments[i3] != null ? arguments[i3] : {};
    var ownKeys = Object.keys(source);
    if (typeof Object.getOwnPropertySymbols === "function") {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }
    ownKeys.forEach(function(key) {
      _defineProperty(target, key, source[key]);
    });
  }
  return target;
}
var HTML5BackendImpl;
var init_HTML5BackendImpl = __esm({
  "../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/HTML5BackendImpl.js"() {
    init_EnterLeaveCounter();
    init_NativeDragSources();
    init_NativeTypes();
    init_OffsetUtils();
    init_OptionsReader();
    HTML5BackendImpl = class {
      /**
      * Generate profiling statistics for the HTML5Backend.
      */
      profile() {
        var ref, ref1;
        return {
          sourcePreviewNodes: this.sourcePreviewNodes.size,
          sourcePreviewNodeOptions: this.sourcePreviewNodeOptions.size,
          sourceNodeOptions: this.sourceNodeOptions.size,
          sourceNodes: this.sourceNodes.size,
          dragStartSourceIds: ((ref = this.dragStartSourceIds) === null || ref === void 0 ? void 0 : ref.length) || 0,
          dropTargetIds: this.dropTargetIds.length,
          dragEnterTargetIds: this.dragEnterTargetIds.length,
          dragOverTargetIds: ((ref1 = this.dragOverTargetIds) === null || ref1 === void 0 ? void 0 : ref1.length) || 0
        };
      }
      // public for test
      get window() {
        return this.options.window;
      }
      get document() {
        return this.options.document;
      }
      /**
      * Get the root element to use for event subscriptions
      */
      get rootElement() {
        return this.options.rootElement;
      }
      setup() {
        const root = this.rootElement;
        if (root === void 0) {
          return;
        }
        if (root.__isReactDndBackendSetUp) {
          throw new Error("Cannot have two HTML5 backends at the same time.");
        }
        root.__isReactDndBackendSetUp = true;
        this.addEventListeners(root);
      }
      teardown() {
        const root = this.rootElement;
        if (root === void 0) {
          return;
        }
        root.__isReactDndBackendSetUp = false;
        this.removeEventListeners(this.rootElement);
        this.clearCurrentDragSourceNode();
        if (this.asyncEndDragFrameId) {
          var ref;
          (ref = this.window) === null || ref === void 0 ? void 0 : ref.cancelAnimationFrame(this.asyncEndDragFrameId);
        }
      }
      connectDragPreview(sourceId, node, options) {
        this.sourcePreviewNodeOptions.set(sourceId, options);
        this.sourcePreviewNodes.set(sourceId, node);
        return () => {
          this.sourcePreviewNodes.delete(sourceId);
          this.sourcePreviewNodeOptions.delete(sourceId);
        };
      }
      connectDragSource(sourceId, node, options) {
        this.sourceNodes.set(sourceId, node);
        this.sourceNodeOptions.set(sourceId, options);
        const handleDragStart = (e) => this.handleDragStart(e, sourceId);
        const handleSelectStart = (e) => this.handleSelectStart(e);
        node.setAttribute("draggable", "true");
        node.addEventListener("dragstart", handleDragStart);
        node.addEventListener("selectstart", handleSelectStart);
        return () => {
          this.sourceNodes.delete(sourceId);
          this.sourceNodeOptions.delete(sourceId);
          node.removeEventListener("dragstart", handleDragStart);
          node.removeEventListener("selectstart", handleSelectStart);
          node.setAttribute("draggable", "false");
        };
      }
      connectDropTarget(targetId, node) {
        const handleDragEnter = (e) => this.handleDragEnter(e, targetId);
        const handleDragOver = (e) => this.handleDragOver(e, targetId);
        const handleDrop = (e) => this.handleDrop(e, targetId);
        node.addEventListener("dragenter", handleDragEnter);
        node.addEventListener("dragover", handleDragOver);
        node.addEventListener("drop", handleDrop);
        return () => {
          node.removeEventListener("dragenter", handleDragEnter);
          node.removeEventListener("dragover", handleDragOver);
          node.removeEventListener("drop", handleDrop);
        };
      }
      addEventListeners(target) {
        if (!target.addEventListener) {
          return;
        }
        target.addEventListener("dragstart", this.handleTopDragStart);
        target.addEventListener("dragstart", this.handleTopDragStartCapture, true);
        target.addEventListener("dragend", this.handleTopDragEndCapture, true);
        target.addEventListener("dragenter", this.handleTopDragEnter);
        target.addEventListener("dragenter", this.handleTopDragEnterCapture, true);
        target.addEventListener("dragleave", this.handleTopDragLeaveCapture, true);
        target.addEventListener("dragover", this.handleTopDragOver);
        target.addEventListener("dragover", this.handleTopDragOverCapture, true);
        target.addEventListener("drop", this.handleTopDrop);
        target.addEventListener("drop", this.handleTopDropCapture, true);
      }
      removeEventListeners(target) {
        if (!target.removeEventListener) {
          return;
        }
        target.removeEventListener("dragstart", this.handleTopDragStart);
        target.removeEventListener("dragstart", this.handleTopDragStartCapture, true);
        target.removeEventListener("dragend", this.handleTopDragEndCapture, true);
        target.removeEventListener("dragenter", this.handleTopDragEnter);
        target.removeEventListener("dragenter", this.handleTopDragEnterCapture, true);
        target.removeEventListener("dragleave", this.handleTopDragLeaveCapture, true);
        target.removeEventListener("dragover", this.handleTopDragOver);
        target.removeEventListener("dragover", this.handleTopDragOverCapture, true);
        target.removeEventListener("drop", this.handleTopDrop);
        target.removeEventListener("drop", this.handleTopDropCapture, true);
      }
      getCurrentSourceNodeOptions() {
        const sourceId = this.monitor.getSourceId();
        const sourceNodeOptions = this.sourceNodeOptions.get(sourceId);
        return _objectSpread({
          dropEffect: this.altKeyPressed ? "copy" : "move"
        }, sourceNodeOptions || {});
      }
      getCurrentDropEffect() {
        if (this.isDraggingNativeItem()) {
          return "copy";
        }
        return this.getCurrentSourceNodeOptions().dropEffect;
      }
      getCurrentSourcePreviewNodeOptions() {
        const sourceId = this.monitor.getSourceId();
        const sourcePreviewNodeOptions = this.sourcePreviewNodeOptions.get(sourceId);
        return _objectSpread({
          anchorX: 0.5,
          anchorY: 0.5,
          captureDraggingState: false
        }, sourcePreviewNodeOptions || {});
      }
      isDraggingNativeItem() {
        const itemType = this.monitor.getItemType();
        return Object.keys(NativeTypes_exports).some(
          (key) => NativeTypes_exports[key] === itemType
        );
      }
      beginDragNativeItem(type, dataTransfer) {
        this.clearCurrentDragSourceNode();
        this.currentNativeSource = createNativeDragSource(type, dataTransfer);
        this.currentNativeHandle = this.registry.addSource(type, this.currentNativeSource);
        this.actions.beginDrag([
          this.currentNativeHandle
        ]);
      }
      setCurrentDragSourceNode(node) {
        this.clearCurrentDragSourceNode();
        this.currentDragSourceNode = node;
        const MOUSE_MOVE_TIMEOUT = 1e3;
        this.mouseMoveTimeoutTimer = setTimeout(() => {
          var ref;
          return (ref = this.rootElement) === null || ref === void 0 ? void 0 : ref.addEventListener("mousemove", this.endDragIfSourceWasRemovedFromDOM, true);
        }, MOUSE_MOVE_TIMEOUT);
      }
      clearCurrentDragSourceNode() {
        if (this.currentDragSourceNode) {
          this.currentDragSourceNode = null;
          if (this.rootElement) {
            var ref;
            (ref = this.window) === null || ref === void 0 ? void 0 : ref.clearTimeout(this.mouseMoveTimeoutTimer || void 0);
            this.rootElement.removeEventListener("mousemove", this.endDragIfSourceWasRemovedFromDOM, true);
          }
          this.mouseMoveTimeoutTimer = null;
          return true;
        }
        return false;
      }
      handleDragStart(e, sourceId) {
        if (e.defaultPrevented) {
          return;
        }
        if (!this.dragStartSourceIds) {
          this.dragStartSourceIds = [];
        }
        this.dragStartSourceIds.unshift(sourceId);
      }
      handleDragEnter(_e, targetId) {
        this.dragEnterTargetIds.unshift(targetId);
      }
      handleDragOver(_e, targetId) {
        if (this.dragOverTargetIds === null) {
          this.dragOverTargetIds = [];
        }
        this.dragOverTargetIds.unshift(targetId);
      }
      handleDrop(_e, targetId) {
        this.dropTargetIds.unshift(targetId);
      }
      constructor(manager, globalContext, options) {
        this.sourcePreviewNodes = /* @__PURE__ */ new Map();
        this.sourcePreviewNodeOptions = /* @__PURE__ */ new Map();
        this.sourceNodes = /* @__PURE__ */ new Map();
        this.sourceNodeOptions = /* @__PURE__ */ new Map();
        this.dragStartSourceIds = null;
        this.dropTargetIds = [];
        this.dragEnterTargetIds = [];
        this.currentNativeSource = null;
        this.currentNativeHandle = null;
        this.currentDragSourceNode = null;
        this.altKeyPressed = false;
        this.mouseMoveTimeoutTimer = null;
        this.asyncEndDragFrameId = null;
        this.dragOverTargetIds = null;
        this.lastClientOffset = null;
        this.hoverRafId = null;
        this.getSourceClientOffset = (sourceId) => {
          const source = this.sourceNodes.get(sourceId);
          return source && getNodeClientOffset(source) || null;
        };
        this.endDragNativeItem = () => {
          if (!this.isDraggingNativeItem()) {
            return;
          }
          this.actions.endDrag();
          if (this.currentNativeHandle) {
            this.registry.removeSource(this.currentNativeHandle);
          }
          this.currentNativeHandle = null;
          this.currentNativeSource = null;
        };
        this.isNodeInDocument = (node) => {
          return Boolean(node && this.document && this.document.body && this.document.body.contains(node));
        };
        this.endDragIfSourceWasRemovedFromDOM = () => {
          const node = this.currentDragSourceNode;
          if (node == null || this.isNodeInDocument(node)) {
            return;
          }
          if (this.clearCurrentDragSourceNode() && this.monitor.isDragging()) {
            this.actions.endDrag();
          }
          this.cancelHover();
        };
        this.scheduleHover = (dragOverTargetIds) => {
          if (this.hoverRafId === null && typeof requestAnimationFrame !== "undefined") {
            this.hoverRafId = requestAnimationFrame(() => {
              if (this.monitor.isDragging()) {
                this.actions.hover(dragOverTargetIds || [], {
                  clientOffset: this.lastClientOffset
                });
              }
              this.hoverRafId = null;
            });
          }
        };
        this.cancelHover = () => {
          if (this.hoverRafId !== null && typeof cancelAnimationFrame !== "undefined") {
            cancelAnimationFrame(this.hoverRafId);
            this.hoverRafId = null;
          }
        };
        this.handleTopDragStartCapture = () => {
          this.clearCurrentDragSourceNode();
          this.dragStartSourceIds = [];
        };
        this.handleTopDragStart = (e) => {
          if (e.defaultPrevented) {
            return;
          }
          const { dragStartSourceIds } = this;
          this.dragStartSourceIds = null;
          const clientOffset = getEventClientOffset(e);
          if (this.monitor.isDragging()) {
            this.actions.endDrag();
            this.cancelHover();
          }
          this.actions.beginDrag(dragStartSourceIds || [], {
            publishSource: false,
            getSourceClientOffset: this.getSourceClientOffset,
            clientOffset
          });
          const { dataTransfer } = e;
          const nativeType = matchNativeItemType(dataTransfer);
          if (this.monitor.isDragging()) {
            if (dataTransfer && typeof dataTransfer.setDragImage === "function") {
              const sourceId = this.monitor.getSourceId();
              const sourceNode = this.sourceNodes.get(sourceId);
              const dragPreview = this.sourcePreviewNodes.get(sourceId) || sourceNode;
              if (dragPreview) {
                const { anchorX, anchorY, offsetX, offsetY } = this.getCurrentSourcePreviewNodeOptions();
                const anchorPoint = {
                  anchorX,
                  anchorY
                };
                const offsetPoint = {
                  offsetX,
                  offsetY
                };
                const dragPreviewOffset = getDragPreviewOffset(sourceNode, dragPreview, clientOffset, anchorPoint, offsetPoint);
                dataTransfer.setDragImage(dragPreview, dragPreviewOffset.x, dragPreviewOffset.y);
              }
            }
            try {
              dataTransfer === null || dataTransfer === void 0 ? void 0 : dataTransfer.setData("application/json", {});
            } catch (err) {
            }
            this.setCurrentDragSourceNode(e.target);
            const { captureDraggingState } = this.getCurrentSourcePreviewNodeOptions();
            if (!captureDraggingState) {
              setTimeout(
                () => this.actions.publishDragSource(),
                0
              );
            } else {
              this.actions.publishDragSource();
            }
          } else if (nativeType) {
            this.beginDragNativeItem(nativeType);
          } else if (dataTransfer && !dataTransfer.types && (e.target && !e.target.hasAttribute || !e.target.hasAttribute("draggable"))) {
            return;
          } else {
            e.preventDefault();
          }
        };
        this.handleTopDragEndCapture = () => {
          if (this.clearCurrentDragSourceNode() && this.monitor.isDragging()) {
            this.actions.endDrag();
          }
          this.cancelHover();
        };
        this.handleTopDragEnterCapture = (e) => {
          this.dragEnterTargetIds = [];
          if (this.isDraggingNativeItem()) {
            var ref;
            (ref = this.currentNativeSource) === null || ref === void 0 ? void 0 : ref.loadDataTransfer(e.dataTransfer);
          }
          const isFirstEnter = this.enterLeaveCounter.enter(e.target);
          if (!isFirstEnter || this.monitor.isDragging()) {
            return;
          }
          const { dataTransfer } = e;
          const nativeType = matchNativeItemType(dataTransfer);
          if (nativeType) {
            this.beginDragNativeItem(nativeType, dataTransfer);
          }
        };
        this.handleTopDragEnter = (e) => {
          const { dragEnterTargetIds } = this;
          this.dragEnterTargetIds = [];
          if (!this.monitor.isDragging()) {
            return;
          }
          this.altKeyPressed = e.altKey;
          if (dragEnterTargetIds.length > 0) {
            this.actions.hover(dragEnterTargetIds, {
              clientOffset: getEventClientOffset(e)
            });
          }
          const canDrop = dragEnterTargetIds.some(
            (targetId) => this.monitor.canDropOnTarget(targetId)
          );
          if (canDrop) {
            e.preventDefault();
            if (e.dataTransfer) {
              e.dataTransfer.dropEffect = this.getCurrentDropEffect();
            }
          }
        };
        this.handleTopDragOverCapture = (e) => {
          this.dragOverTargetIds = [];
          if (this.isDraggingNativeItem()) {
            var ref;
            (ref = this.currentNativeSource) === null || ref === void 0 ? void 0 : ref.loadDataTransfer(e.dataTransfer);
          }
        };
        this.handleTopDragOver = (e) => {
          const { dragOverTargetIds } = this;
          this.dragOverTargetIds = [];
          if (!this.monitor.isDragging()) {
            e.preventDefault();
            if (e.dataTransfer) {
              e.dataTransfer.dropEffect = "none";
            }
            return;
          }
          this.altKeyPressed = e.altKey;
          this.lastClientOffset = getEventClientOffset(e);
          this.scheduleHover(dragOverTargetIds);
          const canDrop = (dragOverTargetIds || []).some(
            (targetId) => this.monitor.canDropOnTarget(targetId)
          );
          if (canDrop) {
            e.preventDefault();
            if (e.dataTransfer) {
              e.dataTransfer.dropEffect = this.getCurrentDropEffect();
            }
          } else if (this.isDraggingNativeItem()) {
            e.preventDefault();
          } else {
            e.preventDefault();
            if (e.dataTransfer) {
              e.dataTransfer.dropEffect = "none";
            }
          }
        };
        this.handleTopDragLeaveCapture = (e) => {
          if (this.isDraggingNativeItem()) {
            e.preventDefault();
          }
          const isLastLeave = this.enterLeaveCounter.leave(e.target);
          if (!isLastLeave) {
            return;
          }
          if (this.isDraggingNativeItem()) {
            setTimeout(
              () => this.endDragNativeItem(),
              0
            );
          }
          this.cancelHover();
        };
        this.handleTopDropCapture = (e) => {
          this.dropTargetIds = [];
          if (this.isDraggingNativeItem()) {
            var ref;
            e.preventDefault();
            (ref = this.currentNativeSource) === null || ref === void 0 ? void 0 : ref.loadDataTransfer(e.dataTransfer);
          } else if (matchNativeItemType(e.dataTransfer)) {
            e.preventDefault();
          }
          this.enterLeaveCounter.reset();
        };
        this.handleTopDrop = (e) => {
          const { dropTargetIds } = this;
          this.dropTargetIds = [];
          this.actions.hover(dropTargetIds, {
            clientOffset: getEventClientOffset(e)
          });
          this.actions.drop({
            dropEffect: this.getCurrentDropEffect()
          });
          if (this.isDraggingNativeItem()) {
            this.endDragNativeItem();
          } else if (this.monitor.isDragging()) {
            this.actions.endDrag();
          }
          this.cancelHover();
        };
        this.handleSelectStart = (e) => {
          const target = e.target;
          if (typeof target.dragDrop !== "function") {
            return;
          }
          if (target.tagName === "INPUT" || target.tagName === "SELECT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
            return;
          }
          e.preventDefault();
          target.dragDrop();
        };
        this.options = new OptionsReader(globalContext, options);
        this.actions = manager.getActions();
        this.monitor = manager.getMonitor();
        this.registry = manager.getRegistry();
        this.enterLeaveCounter = new EnterLeaveCounter(this.isNodeInDocument);
      }
    };
  }
});

// ../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/index.js
var HTML5Backend;
var init_dist = __esm({
  "../node_modules/.pnpm/react-dnd-html5-backend@16.0.1/node_modules/react-dnd-html5-backend/dist/index.js"() {
    init_HTML5BackendImpl();
    HTML5Backend = function createBackend(manager, context, options) {
      return new HTML5BackendImpl(manager, context, options);
    };
  }
});

// ../node_modules/.pnpm/@react-dnd+invariant@4.0.2/node_modules/@react-dnd/invariant/dist/index.js
function invariant(condition, format, ...args) {
  if (isProduction()) {
    if (format === void 0) {
      throw new Error("invariant requires an error message argument");
    }
  }
  if (!condition) {
    let error;
    if (format === void 0) {
      error = new Error("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");
    } else {
      let argIndex = 0;
      error = new Error(format.replace(/%s/g, function() {
        return args[argIndex++];
      }));
      error.name = "Invariant Violation";
    }
    error.framesToPop = 1;
    throw error;
  }
}
function isProduction() {
  return typeof process !== "undefined" && true;
}
var init_dist2 = __esm({
  "../node_modules/.pnpm/@react-dnd+invariant@4.0.2/node_modules/@react-dnd/invariant/dist/index.js"() {
  }
});

// ../node_modules/.pnpm/react-dnd-touch-backend@16.0.1/node_modules/react-dnd-touch-backend/dist/interfaces.js
var ListenerType;
var init_interfaces = __esm({
  "../node_modules/.pnpm/react-dnd-touch-backend@16.0.1/node_modules/react-dnd-touch-backend/dist/interfaces.js"() {
    (function(ListenerType2) {
      ListenerType2["mouse"] = "mouse";
      ListenerType2["touch"] = "touch";
      ListenerType2["keyboard"] = "keyboard";
    })(ListenerType || (ListenerType = {}));
  }
});

// ../node_modules/.pnpm/react-dnd-touch-backend@16.0.1/node_modules/react-dnd-touch-backend/dist/OptionsReader.js
var OptionsReader2;
var init_OptionsReader2 = __esm({
  "../node_modules/.pnpm/react-dnd-touch-backend@16.0.1/node_modules/react-dnd-touch-backend/dist/OptionsReader.js"() {
    OptionsReader2 = class {
      get delay() {
        var _delay;
        return (_delay = this.args.delay) !== null && _delay !== void 0 ? _delay : 0;
      }
      get scrollAngleRanges() {
        return this.args.scrollAngleRanges;
      }
      get getDropTargetElementsAtPoint() {
        return this.args.getDropTargetElementsAtPoint;
      }
      get ignoreContextMenu() {
        var _ignoreContextMenu;
        return (_ignoreContextMenu = this.args.ignoreContextMenu) !== null && _ignoreContextMenu !== void 0 ? _ignoreContextMenu : false;
      }
      get enableHoverOutsideTarget() {
        var _enableHoverOutsideTarget;
        return (_enableHoverOutsideTarget = this.args.enableHoverOutsideTarget) !== null && _enableHoverOutsideTarget !== void 0 ? _enableHoverOutsideTarget : false;
      }
      get enableKeyboardEvents() {
        var _enableKeyboardEvents;
        return (_enableKeyboardEvents = this.args.enableKeyboardEvents) !== null && _enableKeyboardEvents !== void 0 ? _enableKeyboardEvents : false;
      }
      get enableMouseEvents() {
        var _enableMouseEvents;
        return (_enableMouseEvents = this.args.enableMouseEvents) !== null && _enableMouseEvents !== void 0 ? _enableMouseEvents : false;
      }
      get enableTouchEvents() {
        var _enableTouchEvents;
        return (_enableTouchEvents = this.args.enableTouchEvents) !== null && _enableTouchEvents !== void 0 ? _enableTouchEvents : true;
      }
      get touchSlop() {
        return this.args.touchSlop || 0;
      }
      get delayTouchStart() {
        var ref, ref1;
        var ref2, ref3;
        return (ref3 = (ref2 = (ref = this.args) === null || ref === void 0 ? void 0 : ref.delayTouchStart) !== null && ref2 !== void 0 ? ref2 : (ref1 = this.args) === null || ref1 === void 0 ? void 0 : ref1.delay) !== null && ref3 !== void 0 ? ref3 : 0;
      }
      get delayMouseStart() {
        var ref, ref4;
        var ref5, ref6;
        return (ref6 = (ref5 = (ref = this.args) === null || ref === void 0 ? void 0 : ref.delayMouseStart) !== null && ref5 !== void 0 ? ref5 : (ref4 = this.args) === null || ref4 === void 0 ? void 0 : ref4.delay) !== null && ref6 !== void 0 ? ref6 : 0;
      }
      get window() {
        if (this.context && this.context.window) {
          return this.context.window;
        } else if (typeof window !== "undefined") {
          return window;
        }
        return void 0;
      }
      get document() {
        var ref;
        if ((ref = this.context) === null || ref === void 0 ? void 0 : ref.document) {
          return this.context.document;
        }
        if (this.window) {
          return this.window.document;
        }
        return void 0;
      }
      get rootElement() {
        var ref;
        return ((ref = this.args) === null || ref === void 0 ? void 0 : ref.rootElement) || this.document;
      }
      constructor(args, context) {
        this.args = args;
        this.context = context;
      }
    };
  }
});

// ../node_modules/.pnpm/react-dnd-touch-backend@16.0.1/node_modules/react-dnd-touch-backend/dist/utils/math.js
function distance(x1, y1, x22, y22) {
  return Math.sqrt(Math.pow(Math.abs(x22 - x1), 2) + Math.pow(Math.abs(y22 - y1), 2));
}
function inAngleRanges(x1, y1, x22, y22, angleRanges) {
  if (!angleRanges) {
    return false;
  }
  const angle = Math.atan2(y22 - y1, x22 - x1) * 180 / Math.PI + 180;
  for (let i3 = 0; i3 < angleRanges.length; ++i3) {
    const ar = angleRanges[i3];
    if (ar && (ar.start == null || angle >= ar.start) && (ar.end == null || angle <= ar.end)) {
      return true;
    }
  }
  return false;
}
var init_math = __esm({
  "../node_modules/.pnpm/react-dnd-touch-backend@16.0.1/node_modules/react-dnd-touch-backend/dist/utils/math.js"() {
  }
});

// ../node_modules/.pnpm/react-dnd-touch-backend@16.0.1/node_modules/react-dnd-touch-backend/dist/utils/predicates.js
function eventShouldStartDrag(e) {
  return e.button === void 0 || e.button === MouseButton.Left;
}
function eventShouldEndDrag(e) {
  return e.buttons === void 0 || (e.buttons & MouseButtons.Left) === 0;
}
function isTouchEvent(e) {
  return !!e.targetTouches;
}
var MouseButtons, MouseButton;
var init_predicates = __esm({
  "../node_modules/.pnpm/react-dnd-touch-backend@16.0.1/node_modules/react-dnd-touch-backend/dist/utils/predicates.js"() {
    MouseButtons = {
      Left: 1,
      Right: 2,
      Center: 4
    };
    MouseButton = {
      Left: 0,
      Center: 1,
      Right: 2
    };
  }
});

// ../node_modules/.pnpm/react-dnd-touch-backend@16.0.1/node_modules/react-dnd-touch-backend/dist/utils/offsets.js
function getNodeClientOffset2(node) {
  const el = node.nodeType === ELEMENT_NODE2 ? node : node.parentElement;
  if (!el) {
    return void 0;
  }
  const { top, left } = el.getBoundingClientRect();
  return {
    x: left,
    y: top
  };
}
function getEventClientTouchOffset(e, lastTargetTouchFallback) {
  if (e.targetTouches.length === 1) {
    return getEventClientOffset2(e.targetTouches[0]);
  } else if (lastTargetTouchFallback && e.touches.length === 1) {
    if (e.touches[0].target === lastTargetTouchFallback.target) {
      return getEventClientOffset2(e.touches[0]);
    }
  }
  return;
}
function getEventClientOffset2(e, lastTargetTouchFallback) {
  if (isTouchEvent(e)) {
    return getEventClientTouchOffset(e, lastTargetTouchFallback);
  } else {
    return {
      x: e.clientX,
      y: e.clientY
    };
  }
}
var ELEMENT_NODE2;
var init_offsets = __esm({
  "../node_modules/.pnpm/react-dnd-touch-backend@16.0.1/node_modules/react-dnd-touch-backend/dist/utils/offsets.js"() {
    init_predicates();
    ELEMENT_NODE2 = 1;
  }
});

// ../node_modules/.pnpm/react-dnd-touch-backend@16.0.1/node_modules/react-dnd-touch-backend/dist/utils/supportsPassive.js
var supportsPassive;
var init_supportsPassive = __esm({
  "../node_modules/.pnpm/react-dnd-touch-backend@16.0.1/node_modules/react-dnd-touch-backend/dist/utils/supportsPassive.js"() {
    supportsPassive = (() => {
      let supported = false;
      try {
        addEventListener("test", () => {
        }, Object.defineProperty({}, "passive", {
          get() {
            supported = true;
            return true;
          }
        }));
      } catch (e) {
      }
      return supported;
    })();
  }
});

// ../node_modules/.pnpm/react-dnd-touch-backend@16.0.1/node_modules/react-dnd-touch-backend/dist/TouchBackendImpl.js
var eventNames, TouchBackendImpl;
var init_TouchBackendImpl = __esm({
  "../node_modules/.pnpm/react-dnd-touch-backend@16.0.1/node_modules/react-dnd-touch-backend/dist/TouchBackendImpl.js"() {
    init_dist2();
    init_interfaces();
    init_OptionsReader2();
    init_math();
    init_offsets();
    init_predicates();
    init_supportsPassive();
    eventNames = {
      [ListenerType.mouse]: {
        start: "mousedown",
        move: "mousemove",
        end: "mouseup",
        contextmenu: "contextmenu"
      },
      [ListenerType.touch]: {
        start: "touchstart",
        move: "touchmove",
        end: "touchend"
      },
      [ListenerType.keyboard]: {
        keydown: "keydown"
      }
    };
    TouchBackendImpl = class _TouchBackendImpl {
      /**
      * Generate profiling statistics for the HTML5Backend.
      */
      profile() {
        var ref;
        return {
          sourceNodes: this.sourceNodes.size,
          sourcePreviewNodes: this.sourcePreviewNodes.size,
          sourcePreviewNodeOptions: this.sourcePreviewNodeOptions.size,
          targetNodes: this.targetNodes.size,
          dragOverTargetIds: ((ref = this.dragOverTargetIds) === null || ref === void 0 ? void 0 : ref.length) || 0
        };
      }
      // public for test
      get document() {
        return this.options.document;
      }
      setup() {
        const root = this.options.rootElement;
        if (!root) {
          return;
        }
        invariant(!_TouchBackendImpl.isSetUp, "Cannot have two Touch backends at the same time.");
        _TouchBackendImpl.isSetUp = true;
        this.addEventListener(root, "start", this.getTopMoveStartHandler());
        this.addEventListener(root, "start", this.handleTopMoveStartCapture, true);
        this.addEventListener(root, "move", this.handleTopMove);
        this.addEventListener(root, "move", this.handleTopMoveCapture, true);
        this.addEventListener(root, "end", this.handleTopMoveEndCapture, true);
        if (this.options.enableMouseEvents && !this.options.ignoreContextMenu) {
          this.addEventListener(root, "contextmenu", this.handleTopMoveEndCapture);
        }
        if (this.options.enableKeyboardEvents) {
          this.addEventListener(root, "keydown", this.handleCancelOnEscape, true);
        }
      }
      teardown() {
        const root = this.options.rootElement;
        if (!root) {
          return;
        }
        _TouchBackendImpl.isSetUp = false;
        this._mouseClientOffset = {};
        this.removeEventListener(root, "start", this.handleTopMoveStartCapture, true);
        this.removeEventListener(root, "start", this.handleTopMoveStart);
        this.removeEventListener(root, "move", this.handleTopMoveCapture, true);
        this.removeEventListener(root, "move", this.handleTopMove);
        this.removeEventListener(root, "end", this.handleTopMoveEndCapture, true);
        if (this.options.enableMouseEvents && !this.options.ignoreContextMenu) {
          this.removeEventListener(root, "contextmenu", this.handleTopMoveEndCapture);
        }
        if (this.options.enableKeyboardEvents) {
          this.removeEventListener(root, "keydown", this.handleCancelOnEscape, true);
        }
        this.uninstallSourceNodeRemovalObserver();
      }
      addEventListener(subject, event, handler, capture = false) {
        const options = supportsPassive ? {
          capture,
          passive: false
        } : capture;
        this.listenerTypes.forEach(function(listenerType) {
          const evt = eventNames[listenerType][event];
          if (evt) {
            subject.addEventListener(evt, handler, options);
          }
        });
      }
      removeEventListener(subject, event, handler, capture = false) {
        const options = supportsPassive ? {
          capture,
          passive: false
        } : capture;
        this.listenerTypes.forEach(function(listenerType) {
          const evt = eventNames[listenerType][event];
          if (evt) {
            subject.removeEventListener(evt, handler, options);
          }
        });
      }
      connectDragSource(sourceId, node) {
        const handleMoveStart = this.handleMoveStart.bind(this, sourceId);
        this.sourceNodes.set(sourceId, node);
        this.addEventListener(node, "start", handleMoveStart);
        return () => {
          this.sourceNodes.delete(sourceId);
          this.removeEventListener(node, "start", handleMoveStart);
        };
      }
      connectDragPreview(sourceId, node, options) {
        this.sourcePreviewNodeOptions.set(sourceId, options);
        this.sourcePreviewNodes.set(sourceId, node);
        return () => {
          this.sourcePreviewNodes.delete(sourceId);
          this.sourcePreviewNodeOptions.delete(sourceId);
        };
      }
      connectDropTarget(targetId, node) {
        const root = this.options.rootElement;
        if (!this.document || !root) {
          return () => {
          };
        }
        const handleMove = (e) => {
          if (!this.document || !root || !this.monitor.isDragging()) {
            return;
          }
          let coords;
          switch (e.type) {
            case eventNames.mouse.move:
              coords = {
                x: e.clientX,
                y: e.clientY
              };
              break;
            case eventNames.touch.move:
              var ref, ref1;
              coords = {
                x: ((ref = e.touches[0]) === null || ref === void 0 ? void 0 : ref.clientX) || 0,
                y: ((ref1 = e.touches[0]) === null || ref1 === void 0 ? void 0 : ref1.clientY) || 0
              };
              break;
          }
          const droppedOn = coords != null ? this.document.elementFromPoint(coords.x, coords.y) : void 0;
          const childMatch = droppedOn && node.contains(droppedOn);
          if (droppedOn === node || childMatch) {
            return this.handleMove(e, targetId);
          }
        };
        this.addEventListener(this.document.body, "move", handleMove);
        this.targetNodes.set(targetId, node);
        return () => {
          if (this.document) {
            this.targetNodes.delete(targetId);
            this.removeEventListener(this.document.body, "move", handleMove);
          }
        };
      }
      getTopMoveStartHandler() {
        if (!this.options.delayTouchStart && !this.options.delayMouseStart) {
          return this.handleTopMoveStart;
        }
        return this.handleTopMoveStartDelay;
      }
      installSourceNodeRemovalObserver(node) {
        this.uninstallSourceNodeRemovalObserver();
        this.draggedSourceNode = node;
        this.draggedSourceNodeRemovalObserver = new MutationObserver(() => {
          if (node && !node.parentElement) {
            this.resurrectSourceNode();
            this.uninstallSourceNodeRemovalObserver();
          }
        });
        if (!node || !node.parentElement) {
          return;
        }
        this.draggedSourceNodeRemovalObserver.observe(node.parentElement, {
          childList: true
        });
      }
      resurrectSourceNode() {
        if (this.document && this.draggedSourceNode) {
          this.draggedSourceNode.style.display = "none";
          this.draggedSourceNode.removeAttribute("data-reactid");
          this.document.body.appendChild(this.draggedSourceNode);
        }
      }
      uninstallSourceNodeRemovalObserver() {
        if (this.draggedSourceNodeRemovalObserver) {
          this.draggedSourceNodeRemovalObserver.disconnect();
        }
        this.draggedSourceNodeRemovalObserver = void 0;
        this.draggedSourceNode = void 0;
      }
      constructor(manager, context, options) {
        this.getSourceClientOffset = (sourceId) => {
          const element = this.sourceNodes.get(sourceId);
          return element && getNodeClientOffset2(element);
        };
        this.handleTopMoveStartCapture = (e) => {
          if (!eventShouldStartDrag(e)) {
            return;
          }
          this.moveStartSourceIds = [];
        };
        this.handleMoveStart = (sourceId) => {
          if (Array.isArray(this.moveStartSourceIds)) {
            this.moveStartSourceIds.unshift(sourceId);
          }
        };
        this.handleTopMoveStart = (e) => {
          if (!eventShouldStartDrag(e)) {
            return;
          }
          const clientOffset = getEventClientOffset2(e);
          if (clientOffset) {
            if (isTouchEvent(e)) {
              this.lastTargetTouchFallback = e.targetTouches[0];
            }
            this._mouseClientOffset = clientOffset;
          }
          this.waitingForDelay = false;
        };
        this.handleTopMoveStartDelay = (e) => {
          if (!eventShouldStartDrag(e)) {
            return;
          }
          const delay = e.type === eventNames.touch.start ? this.options.delayTouchStart : this.options.delayMouseStart;
          this.timeout = setTimeout(this.handleTopMoveStart.bind(this, e), delay);
          this.waitingForDelay = true;
        };
        this.handleTopMoveCapture = () => {
          this.dragOverTargetIds = [];
        };
        this.handleMove = (_evt, targetId) => {
          if (this.dragOverTargetIds) {
            this.dragOverTargetIds.unshift(targetId);
          }
        };
        this.handleTopMove = (e1) => {
          if (this.timeout) {
            clearTimeout(this.timeout);
          }
          if (!this.document || this.waitingForDelay) {
            return;
          }
          const { moveStartSourceIds, dragOverTargetIds } = this;
          const enableHoverOutsideTarget = this.options.enableHoverOutsideTarget;
          const clientOffset = getEventClientOffset2(e1, this.lastTargetTouchFallback);
          if (!clientOffset) {
            return;
          }
          if (this._isScrolling || !this.monitor.isDragging() && inAngleRanges(this._mouseClientOffset.x || 0, this._mouseClientOffset.y || 0, clientOffset.x, clientOffset.y, this.options.scrollAngleRanges)) {
            this._isScrolling = true;
            return;
          }
          if (!this.monitor.isDragging() && // eslint-disable-next-line no-prototype-builtins
          this._mouseClientOffset.hasOwnProperty("x") && moveStartSourceIds && distance(this._mouseClientOffset.x || 0, this._mouseClientOffset.y || 0, clientOffset.x, clientOffset.y) > (this.options.touchSlop ? this.options.touchSlop : 0)) {
            this.moveStartSourceIds = void 0;
            this.actions.beginDrag(moveStartSourceIds, {
              clientOffset: this._mouseClientOffset,
              getSourceClientOffset: this.getSourceClientOffset,
              publishSource: false
            });
          }
          if (!this.monitor.isDragging()) {
            return;
          }
          const sourceNode = this.sourceNodes.get(this.monitor.getSourceId());
          this.installSourceNodeRemovalObserver(sourceNode);
          this.actions.publishDragSource();
          if (e1.cancelable) e1.preventDefault();
          const dragOverTargetNodes = (dragOverTargetIds || []).map(
            (key) => this.targetNodes.get(key)
          ).filter(
            (e) => !!e
          );
          const elementsAtPoint = this.options.getDropTargetElementsAtPoint ? this.options.getDropTargetElementsAtPoint(clientOffset.x, clientOffset.y, dragOverTargetNodes) : this.document.elementsFromPoint(clientOffset.x, clientOffset.y);
          const elementsAtPointExtended = [];
          for (const nodeId in elementsAtPoint) {
            if (!elementsAtPoint.hasOwnProperty(nodeId)) {
              continue;
            }
            let currentNode = elementsAtPoint[nodeId];
            if (currentNode != null) {
              elementsAtPointExtended.push(currentNode);
            }
            while (currentNode) {
              currentNode = currentNode.parentElement;
              if (currentNode && elementsAtPointExtended.indexOf(currentNode) === -1) {
                elementsAtPointExtended.push(currentNode);
              }
            }
          }
          const orderedDragOverTargetIds = elementsAtPointExtended.filter(
            (node) => dragOverTargetNodes.indexOf(node) > -1
          ).map(
            (node) => this._getDropTargetId(node)
          ).filter(
            (node) => !!node
          ).filter(
            (id, index, ids) => ids.indexOf(id) === index
          );
          if (enableHoverOutsideTarget) {
            for (const targetId in this.targetNodes) {
              const targetNode = this.targetNodes.get(targetId);
              if (sourceNode && targetNode && targetNode.contains(sourceNode) && orderedDragOverTargetIds.indexOf(targetId) === -1) {
                orderedDragOverTargetIds.unshift(targetId);
                break;
              }
            }
          }
          orderedDragOverTargetIds.reverse();
          this.actions.hover(orderedDragOverTargetIds, {
            clientOffset
          });
        };
        this._getDropTargetId = (node) => {
          const keys = this.targetNodes.keys();
          let next = keys.next();
          while (next.done === false) {
            const targetId = next.value;
            if (node === this.targetNodes.get(targetId)) {
              return targetId;
            } else {
              next = keys.next();
            }
          }
          return void 0;
        };
        this.handleTopMoveEndCapture = (e) => {
          this._isScrolling = false;
          this.lastTargetTouchFallback = void 0;
          if (!eventShouldEndDrag(e)) {
            return;
          }
          if (!this.monitor.isDragging() || this.monitor.didDrop()) {
            this.moveStartSourceIds = void 0;
            return;
          }
          if (e.cancelable) e.preventDefault();
          this._mouseClientOffset = {};
          this.uninstallSourceNodeRemovalObserver();
          this.actions.drop();
          this.actions.endDrag();
        };
        this.handleCancelOnEscape = (e) => {
          if (e.key === "Escape" && this.monitor.isDragging()) {
            this._mouseClientOffset = {};
            this.uninstallSourceNodeRemovalObserver();
            this.actions.endDrag();
          }
        };
        this.options = new OptionsReader2(options, context);
        this.actions = manager.getActions();
        this.monitor = manager.getMonitor();
        this.sourceNodes = /* @__PURE__ */ new Map();
        this.sourcePreviewNodes = /* @__PURE__ */ new Map();
        this.sourcePreviewNodeOptions = /* @__PURE__ */ new Map();
        this.targetNodes = /* @__PURE__ */ new Map();
        this.listenerTypes = [];
        this._mouseClientOffset = {};
        this._isScrolling = false;
        if (this.options.enableMouseEvents) {
          this.listenerTypes.push(ListenerType.mouse);
        }
        if (this.options.enableTouchEvents) {
          this.listenerTypes.push(ListenerType.touch);
        }
        if (this.options.enableKeyboardEvents) {
          this.listenerTypes.push(ListenerType.keyboard);
        }
      }
    };
  }
});

// ../node_modules/.pnpm/react-dnd-touch-backend@16.0.1/node_modules/react-dnd-touch-backend/dist/index.js
var TouchBackend;
var init_dist3 = __esm({
  "../node_modules/.pnpm/react-dnd-touch-backend@16.0.1/node_modules/react-dnd-touch-backend/dist/index.js"() {
    init_TouchBackendImpl();
    init_interfaces();
    init_TouchBackendImpl();
    TouchBackend = function createBackend2(manager, context = {}, options = {}) {
      return new TouchBackendImpl(manager, context, options);
    };
  }
});

// ../node_modules/.pnpm/dnd-multi-backend@8.1.2_dnd-core@16.0.1/node_modules/dnd-multi-backend/dist/index.js
var E, P, t, s, p, h, B, c, l, a, d, k, x, T, D, m, v, f, w, M, S, y, L, O, C, U;
var init_dist4 = __esm({
  "../node_modules/.pnpm/dnd-multi-backend@8.1.2_dnd-core@16.0.1/node_modules/dnd-multi-backend/dist/index.js"() {
    E = (r) => {
      throw TypeError(r);
    };
    P = (r, n, e) => n.has(r) || E("Cannot " + e);
    t = (r, n, e) => (P(r, n, "read from private field"), e ? e.call(r) : n.get(r));
    s = (r, n, e) => n.has(r) ? E("Cannot add the same private member more than once") : n instanceof WeakSet ? n.add(r) : n.set(r, e);
    p = (r, n, e, i3) => (P(r, n, "write to private field"), i3 ? i3.call(r, e) : n.set(r, e), e);
    B = class {
      constructor() {
        s(this, h);
        this.register = (n) => {
          t(this, h).push(n);
        };
        this.unregister = (n) => {
          for (; t(this, h).indexOf(n) !== -1; ) t(this, h).splice(t(this, h).indexOf(n), 1);
        };
        this.backendChanged = (n) => {
          for (let e of t(this, h)) e.backendChanged(n);
        };
        p(this, h, []);
      }
    };
    h = /* @__PURE__ */ new WeakMap();
    w = class w2 {
      constructor(n, e, i3) {
        s(this, c);
        s(this, l);
        s(this, a);
        s(this, d);
        s(this, k);
        s(this, x, (n2, e2, i4) => {
          var _a, _b;
          if (!i4.backend) throw new Error(`You must specify a 'backend' property in your Backend entry: ${JSON.stringify(i4)}`);
          let u2 = i4.backend(n2, e2, i4.options), o = i4.id, g2 = !i4.id && u2 && u2.constructor;
          if (g2 && (o = u2.constructor.name), !o) throw new Error(`You must specify an 'id' property in your Backend entry: ${JSON.stringify(i4)}
        see this guide: https://github.com/louisbrunner/dnd-multi-backend/tree/master/packages/react-dnd-multi-backend#migrating-from-5xx`);
          if (g2 && console.warn(`Deprecation notice: You are using a pipeline which doesn't include backends' 'id'.
        This might be unsupported in the future, please specify 'id' explicitely for every backend.`), t(this, a)[o]) throw new Error(`You must specify a unique 'id' property in your Backend entry:
        ${JSON.stringify(i4)} (conflicts with: ${JSON.stringify(t(this, a)[o])})`);
          return { id: o, instance: u2, preview: (_a = i4.preview) != null ? _a : false, transition: i4.transition, skipDispatchOnTransition: (_b = i4.skipDispatchOnTransition) != null ? _b : false };
        });
        this.setup = () => {
          if (!(typeof window > "u")) {
            if (w2.isSetUp) throw new Error("Cannot have two MultiBackends at the same time.");
            w2.isSetUp = true, t(this, T).call(this, window), t(this, a)[t(this, c)].instance.setup();
          }
        };
        this.teardown = () => {
          typeof window > "u" || (w2.isSetUp = false, t(this, D).call(this, window), t(this, a)[t(this, c)].instance.teardown());
        };
        this.connectDragSource = (n2, e2, i4) => t(this, f).call(this, "connectDragSource", n2, e2, i4);
        this.connectDragPreview = (n2, e2, i4) => t(this, f).call(this, "connectDragPreview", n2, e2, i4);
        this.connectDropTarget = (n2, e2, i4) => t(this, f).call(this, "connectDropTarget", n2, e2, i4);
        this.profile = () => t(this, a)[t(this, c)].instance.profile();
        this.previewEnabled = () => t(this, a)[t(this, c)].preview;
        this.previewsList = () => t(this, l);
        this.backendsList = () => t(this, d);
        s(this, T, (n2) => {
          for (let e2 of t(this, d)) e2.transition && n2.addEventListener(e2.transition.event, t(this, m));
        });
        s(this, D, (n2) => {
          for (let e2 of t(this, d)) e2.transition && n2.removeEventListener(e2.transition.event, t(this, m));
        });
        s(this, m, (n2) => {
          var _a;
          let e2 = t(this, c);
          if (t(this, d).some((i4) => i4.id !== t(this, c) && i4.transition && i4.transition.check(n2) ? (p(this, c, i4.id), true) : false), t(this, c) !== e2) {
            t(this, a)[e2].instance.teardown();
            for (let [g2, b2] of Object.entries(t(this, k))) b2.unsubscribe(), b2.unsubscribe = t(this, v).call(this, b2.func, ...b2.args);
            t(this, l).backendChanged(this);
            let i4 = t(this, a)[t(this, c)];
            if (i4.instance.setup(), i4.skipDispatchOnTransition) return;
            let u2 = n2.constructor, o = new u2(n2.type, n2);
            (_a = n2.target) == null ? void 0 : _a.dispatchEvent(o);
          }
        });
        s(this, v, (n2, e2, i4, u2) => t(this, a)[t(this, c)].instance[n2](e2, i4, u2));
        s(this, f, (n2, e2, i4, u2) => {
          let o = `${n2}_${e2}`, g2 = t(this, v).call(this, n2, e2, i4, u2);
          return t(this, k)[o] = { func: n2, args: [e2, i4, u2], unsubscribe: g2 }, () => {
            t(this, k)[o].unsubscribe(), delete t(this, k)[o];
          };
        });
        if (!i3 || !i3.backends || i3.backends.length < 1) throw new Error(`You must specify at least one Backend, if you are coming from 2.x.x (or don't understand this error)
        see this guide: https://github.com/louisbrunner/dnd-multi-backend/tree/master/packages/react-dnd-multi-backend#migrating-from-2xx`);
        p(this, l, new B()), p(this, a, {}), p(this, d, []);
        for (let u2 of i3.backends) {
          let o = t(this, x).call(this, n, e, u2);
          t(this, a)[o.id] = o, t(this, d).push(o);
        }
        p(this, c, t(this, d)[0].id), p(this, k, {});
      }
    };
    c = /* @__PURE__ */ new WeakMap(), l = /* @__PURE__ */ new WeakMap(), a = /* @__PURE__ */ new WeakMap(), d = /* @__PURE__ */ new WeakMap(), k = /* @__PURE__ */ new WeakMap(), x = /* @__PURE__ */ new WeakMap(), T = /* @__PURE__ */ new WeakMap(), D = /* @__PURE__ */ new WeakMap(), m = /* @__PURE__ */ new WeakMap(), v = /* @__PURE__ */ new WeakMap(), f = /* @__PURE__ */ new WeakMap(), w.isSetUp = false;
    M = w;
    S = (r, n, e) => new M(r, n, e);
    y = (r, n) => ({ event: r, check: n });
    L = y("touchstart", (r) => {
      let n = r;
      return n.touches !== null && n.touches !== void 0;
    });
    O = y("dragstart", (r) => r.type.indexOf("drag") !== -1 || r.type.indexOf("drop") !== -1);
    C = y("mousedown", (r) => r.type.indexOf("touch") === -1 && r.type.indexOf("mouse") !== -1);
    U = y("pointerdown", (r) => r.pointerType === "mouse");
  }
});

// ../node_modules/.pnpm/rdndmb-html5-to-touch@8.1.2_dnd-core@16.0.1/node_modules/rdndmb-html5-to-touch/dist/index.js
var dist_exports = {};
__export(dist_exports, {
  HTML5toTouch: () => c2
});
var c2;
var init_dist5 = __esm({
  "../node_modules/.pnpm/rdndmb-html5-to-touch@8.1.2_dnd-core@16.0.1/node_modules/rdndmb-html5-to-touch/dist/index.js"() {
    init_dist();
    init_dist3();
    init_dist4();
    c2 = { backends: [{ id: "html5", backend: HTML5Backend, transition: U }, { id: "touch", backend: TouchBackend, options: { enableMouseEvents: true }, preview: true, transition: L }] };
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/core/DndContext.js
var import_react, DndContext;
var init_DndContext = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/core/DndContext.js"() {
    import_react = __toESM(require_react(), 1);
    DndContext = (0, import_react.createContext)({
      dragDropManager: void 0
    });
  }
});

// ../node_modules/.pnpm/@babel+runtime@7.27.1/node_modules/@babel/runtime/helpers/esm/typeof.js
var init_typeof = __esm({
  "../node_modules/.pnpm/@babel+runtime@7.27.1/node_modules/@babel/runtime/helpers/esm/typeof.js"() {
  }
});

// ../node_modules/.pnpm/@babel+runtime@7.27.1/node_modules/@babel/runtime/helpers/esm/toPrimitive.js
var init_toPrimitive = __esm({
  "../node_modules/.pnpm/@babel+runtime@7.27.1/node_modules/@babel/runtime/helpers/esm/toPrimitive.js"() {
    init_typeof();
  }
});

// ../node_modules/.pnpm/@babel+runtime@7.27.1/node_modules/@babel/runtime/helpers/esm/toPropertyKey.js
var init_toPropertyKey = __esm({
  "../node_modules/.pnpm/@babel+runtime@7.27.1/node_modules/@babel/runtime/helpers/esm/toPropertyKey.js"() {
    init_typeof();
    init_toPrimitive();
  }
});

// ../node_modules/.pnpm/@babel+runtime@7.27.1/node_modules/@babel/runtime/helpers/esm/defineProperty.js
var init_defineProperty = __esm({
  "../node_modules/.pnpm/@babel+runtime@7.27.1/node_modules/@babel/runtime/helpers/esm/defineProperty.js"() {
    init_toPropertyKey();
  }
});

// ../node_modules/.pnpm/@babel+runtime@7.27.1/node_modules/@babel/runtime/helpers/esm/objectSpread2.js
var init_objectSpread2 = __esm({
  "../node_modules/.pnpm/@babel+runtime@7.27.1/node_modules/@babel/runtime/helpers/esm/objectSpread2.js"() {
    init_defineProperty();
  }
});

// ../node_modules/.pnpm/redux@4.2.1/node_modules/redux/es/redux.js
function formatProdErrorMessage(code) {
  return "Minified Redux error #" + code + "; visit https://redux.js.org/Errors?code=" + code + " for the full message or use the non-minified dev environment for full errors. ";
}
function isPlainObject(obj) {
  if (typeof obj !== "object" || obj === null) return false;
  var proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto;
}
function createStore(reducer, preloadedState, enhancer) {
  var _ref2;
  if (typeof preloadedState === "function" && typeof enhancer === "function" || typeof enhancer === "function" && typeof arguments[3] === "function") {
    throw new Error(true ? formatProdErrorMessage(0) : "It looks like you are passing several store enhancers to createStore(). This is not supported. Instead, compose them together to a single function. See https://redux.js.org/tutorials/fundamentals/part-4-store#creating-a-store-with-enhancers for an example.");
  }
  if (typeof preloadedState === "function" && typeof enhancer === "undefined") {
    enhancer = preloadedState;
    preloadedState = void 0;
  }
  if (typeof enhancer !== "undefined") {
    if (typeof enhancer !== "function") {
      throw new Error(true ? formatProdErrorMessage(1) : "Expected the enhancer to be a function. Instead, received: '" + kindOf(enhancer) + "'");
    }
    return enhancer(createStore)(reducer, preloadedState);
  }
  if (typeof reducer !== "function") {
    throw new Error(true ? formatProdErrorMessage(2) : "Expected the root reducer to be a function. Instead, received: '" + kindOf(reducer) + "'");
  }
  var currentReducer = reducer;
  var currentState = preloadedState;
  var currentListeners = [];
  var nextListeners = currentListeners;
  var isDispatching = false;
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }
  function getState() {
    if (isDispatching) {
      throw new Error(true ? formatProdErrorMessage(3) : "You may not call store.getState() while the reducer is executing. The reducer has already received the state as an argument. Pass it down from the top reducer instead of reading it from the store.");
    }
    return currentState;
  }
  function subscribe(listener) {
    if (typeof listener !== "function") {
      throw new Error(true ? formatProdErrorMessage(4) : "Expected the listener to be a function. Instead, received: '" + kindOf(listener) + "'");
    }
    if (isDispatching) {
      throw new Error(true ? formatProdErrorMessage(5) : "You may not call store.subscribe() while the reducer is executing. If you would like to be notified after the store has been updated, subscribe from a component and invoke store.getState() in the callback to access the latest state. See https://redux.js.org/api/store#subscribelistener for more details.");
    }
    var isSubscribed = true;
    ensureCanMutateNextListeners();
    nextListeners.push(listener);
    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }
      if (isDispatching) {
        throw new Error(true ? formatProdErrorMessage(6) : "You may not unsubscribe from a store listener while the reducer is executing. See https://redux.js.org/api/store#subscribelistener for more details.");
      }
      isSubscribed = false;
      ensureCanMutateNextListeners();
      var index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
      currentListeners = null;
    };
  }
  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error(true ? formatProdErrorMessage(7) : "Actions must be plain objects. Instead, the actual type was: '" + kindOf(action) + "'. You may need to add middleware to your store setup to handle dispatching other values, such as 'redux-thunk' to handle dispatching functions. See https://redux.js.org/tutorials/fundamentals/part-4-store#middleware and https://redux.js.org/tutorials/fundamentals/part-6-async-logic#using-the-redux-thunk-middleware for examples.");
    }
    if (typeof action.type === "undefined") {
      throw new Error(true ? formatProdErrorMessage(8) : 'Actions may not have an undefined "type" property. You may have misspelled an action type string constant.');
    }
    if (isDispatching) {
      throw new Error(true ? formatProdErrorMessage(9) : "Reducers may not dispatch actions.");
    }
    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }
    var listeners = currentListeners = nextListeners;
    for (var i3 = 0; i3 < listeners.length; i3++) {
      var listener = listeners[i3];
      listener();
    }
    return action;
  }
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== "function") {
      throw new Error(true ? formatProdErrorMessage(10) : "Expected the nextReducer to be a function. Instead, received: '" + kindOf(nextReducer));
    }
    currentReducer = nextReducer;
    dispatch({
      type: ActionTypes.REPLACE
    });
  }
  function observable() {
    var _ref;
    var outerSubscribe = subscribe;
    return _ref = {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe: function subscribe2(observer) {
        if (typeof observer !== "object" || observer === null) {
          throw new Error(true ? formatProdErrorMessage(11) : "Expected the observer to be an object. Instead, received: '" + kindOf(observer) + "'");
        }
        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }
        observeState();
        var unsubscribe = outerSubscribe(observeState);
        return {
          unsubscribe
        };
      }
    }, _ref[$$observable] = function() {
      return this;
    }, _ref;
  }
  dispatch({
    type: ActionTypes.INIT
  });
  return _ref2 = {
    dispatch,
    subscribe,
    getState,
    replaceReducer
  }, _ref2[$$observable] = observable, _ref2;
}
var $$observable, randomString, ActionTypes;
var init_redux = __esm({
  "../node_modules/.pnpm/redux@4.2.1/node_modules/redux/es/redux.js"() {
    init_objectSpread2();
    $$observable = (function() {
      return typeof Symbol === "function" && Symbol.observable || "@@observable";
    })();
    randomString = function randomString2() {
      return Math.random().toString(36).substring(7).split("").join(".");
    };
    ActionTypes = {
      INIT: "@@redux/INIT" + randomString(),
      REPLACE: "@@redux/REPLACE" + randomString(),
      PROBE_UNKNOWN_ACTION: function PROBE_UNKNOWN_ACTION() {
        return "@@redux/PROBE_UNKNOWN_ACTION" + randomString();
      }
    };
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/utils/js_utils.js
function get(obj, path, defaultValue) {
  return path.split(".").reduce(
    (a4, c5) => a4 && a4[c5] ? a4[c5] : defaultValue || null,
    obj
  );
}
function without2(items, item) {
  return items.filter(
    (i3) => i3 !== item
  );
}
function isObject(input) {
  return typeof input === "object";
}
function xor(itemsA, itemsB) {
  const map = /* @__PURE__ */ new Map();
  const insertItem = (item) => {
    map.set(item, map.has(item) ? map.get(item) + 1 : 1);
  };
  itemsA.forEach(insertItem);
  itemsB.forEach(insertItem);
  const result = [];
  map.forEach((count, key) => {
    if (count === 1) {
      result.push(key);
    }
  });
  return result;
}
function intersection(itemsA, itemsB) {
  return itemsA.filter(
    (t2) => itemsB.indexOf(t2) > -1
  );
}
var init_js_utils2 = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/utils/js_utils.js"() {
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/actions/dragDrop/types.js
var INIT_COORDS, BEGIN_DRAG, PUBLISH_DRAG_SOURCE, HOVER, DROP, END_DRAG;
var init_types = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/actions/dragDrop/types.js"() {
    INIT_COORDS = "dnd-core/INIT_COORDS";
    BEGIN_DRAG = "dnd-core/BEGIN_DRAG";
    PUBLISH_DRAG_SOURCE = "dnd-core/PUBLISH_DRAG_SOURCE";
    HOVER = "dnd-core/HOVER";
    DROP = "dnd-core/DROP";
    END_DRAG = "dnd-core/END_DRAG";
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/actions/dragDrop/local/setClientOffset.js
function setClientOffset(clientOffset, sourceClientOffset) {
  return {
    type: INIT_COORDS,
    payload: {
      sourceClientOffset: sourceClientOffset || null,
      clientOffset: clientOffset || null
    }
  };
}
var init_setClientOffset = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/actions/dragDrop/local/setClientOffset.js"() {
    init_types();
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/actions/dragDrop/beginDrag.js
function createBeginDrag(manager) {
  return function beginDrag(sourceIds = [], options = {
    publishSource: true
  }) {
    const { publishSource = true, clientOffset, getSourceClientOffset: getSourceClientOffset2 } = options;
    const monitor = manager.getMonitor();
    const registry = manager.getRegistry();
    manager.dispatch(setClientOffset(clientOffset));
    verifyInvariants(sourceIds, monitor, registry);
    const sourceId = getDraggableSource(sourceIds, monitor);
    if (sourceId == null) {
      manager.dispatch(ResetCoordinatesAction);
      return;
    }
    let sourceClientOffset = null;
    if (clientOffset) {
      if (!getSourceClientOffset2) {
        throw new Error("getSourceClientOffset must be defined");
      }
      verifyGetSourceClientOffsetIsFunction(getSourceClientOffset2);
      sourceClientOffset = getSourceClientOffset2(sourceId);
    }
    manager.dispatch(setClientOffset(clientOffset, sourceClientOffset));
    const source = registry.getSource(sourceId);
    const item = source.beginDrag(monitor, sourceId);
    if (item == null) {
      return void 0;
    }
    verifyItemIsObject(item);
    registry.pinSource(sourceId);
    const itemType = registry.getSourceType(sourceId);
    return {
      type: BEGIN_DRAG,
      payload: {
        itemType,
        item,
        sourceId,
        clientOffset: clientOffset || null,
        sourceClientOffset: sourceClientOffset || null,
        isSourcePublic: !!publishSource
      }
    };
  };
}
function verifyInvariants(sourceIds, monitor, registry) {
  invariant(!monitor.isDragging(), "Cannot call beginDrag while dragging.");
  sourceIds.forEach(function(sourceId) {
    invariant(registry.getSource(sourceId), "Expected sourceIds to be registered.");
  });
}
function verifyGetSourceClientOffsetIsFunction(getSourceClientOffset2) {
  invariant(typeof getSourceClientOffset2 === "function", "When clientOffset is provided, getSourceClientOffset must be a function.");
}
function verifyItemIsObject(item) {
  invariant(isObject(item), "Item must be an object.");
}
function getDraggableSource(sourceIds, monitor) {
  let sourceId = null;
  for (let i3 = sourceIds.length - 1; i3 >= 0; i3--) {
    if (monitor.canDragSource(sourceIds[i3])) {
      sourceId = sourceIds[i3];
      break;
    }
  }
  return sourceId;
}
var ResetCoordinatesAction;
var init_beginDrag = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/actions/dragDrop/beginDrag.js"() {
    init_dist2();
    init_js_utils2();
    init_setClientOffset();
    init_types();
    ResetCoordinatesAction = {
      type: INIT_COORDS,
      payload: {
        clientOffset: null,
        sourceClientOffset: null
      }
    };
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/actions/dragDrop/drop.js
function _defineProperty3(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _objectSpread3(target) {
  for (var i3 = 1; i3 < arguments.length; i3++) {
    var source = arguments[i3] != null ? arguments[i3] : {};
    var ownKeys = Object.keys(source);
    if (typeof Object.getOwnPropertySymbols === "function") {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }
    ownKeys.forEach(function(key) {
      _defineProperty3(target, key, source[key]);
    });
  }
  return target;
}
function createDrop(manager) {
  return function drop(options = {}) {
    const monitor = manager.getMonitor();
    const registry = manager.getRegistry();
    verifyInvariants2(monitor);
    const targetIds = getDroppableTargets(monitor);
    targetIds.forEach((targetId, index) => {
      const dropResult = determineDropResult(targetId, index, registry, monitor);
      const action = {
        type: DROP,
        payload: {
          dropResult: _objectSpread3({}, options, dropResult)
        }
      };
      manager.dispatch(action);
    });
  };
}
function verifyInvariants2(monitor) {
  invariant(monitor.isDragging(), "Cannot call drop while not dragging.");
  invariant(!monitor.didDrop(), "Cannot call drop twice during one drag operation.");
}
function determineDropResult(targetId, index, registry, monitor) {
  const target = registry.getTarget(targetId);
  let dropResult = target ? target.drop(monitor, targetId) : void 0;
  verifyDropResultType(dropResult);
  if (typeof dropResult === "undefined") {
    dropResult = index === 0 ? {} : monitor.getDropResult();
  }
  return dropResult;
}
function verifyDropResultType(dropResult) {
  invariant(typeof dropResult === "undefined" || isObject(dropResult), "Drop result must either be an object or undefined.");
}
function getDroppableTargets(monitor) {
  const targetIds = monitor.getTargetIds().filter(monitor.canDropOnTarget, monitor);
  targetIds.reverse();
  return targetIds;
}
var init_drop = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/actions/dragDrop/drop.js"() {
    init_dist2();
    init_js_utils2();
    init_types();
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/actions/dragDrop/endDrag.js
function createEndDrag(manager) {
  return function endDrag() {
    const monitor = manager.getMonitor();
    const registry = manager.getRegistry();
    verifyIsDragging(monitor);
    const sourceId = monitor.getSourceId();
    if (sourceId != null) {
      const source = registry.getSource(sourceId, true);
      source.endDrag(monitor, sourceId);
      registry.unpinSource();
    }
    return {
      type: END_DRAG
    };
  };
}
function verifyIsDragging(monitor) {
  invariant(monitor.isDragging(), "Cannot call endDrag while not dragging.");
}
var init_endDrag = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/actions/dragDrop/endDrag.js"() {
    init_dist2();
    init_types();
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/utils/matchesType.js
function matchesType(targetType, draggedItemType) {
  if (draggedItemType === null) {
    return targetType === null;
  }
  return Array.isArray(targetType) ? targetType.some(
    (t2) => t2 === draggedItemType
  ) : targetType === draggedItemType;
}
var init_matchesType = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/utils/matchesType.js"() {
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/actions/dragDrop/hover.js
function createHover(manager) {
  return function hover(targetIdsArg, { clientOffset } = {}) {
    verifyTargetIdsIsArray(targetIdsArg);
    const targetIds = targetIdsArg.slice(0);
    const monitor = manager.getMonitor();
    const registry = manager.getRegistry();
    const draggedItemType = monitor.getItemType();
    removeNonMatchingTargetIds(targetIds, registry, draggedItemType);
    checkInvariants(targetIds, monitor, registry);
    hoverAllTargets(targetIds, monitor, registry);
    return {
      type: HOVER,
      payload: {
        targetIds,
        clientOffset: clientOffset || null
      }
    };
  };
}
function verifyTargetIdsIsArray(targetIdsArg) {
  invariant(Array.isArray(targetIdsArg), "Expected targetIds to be an array.");
}
function checkInvariants(targetIds, monitor, registry) {
  invariant(monitor.isDragging(), "Cannot call hover while not dragging.");
  invariant(!monitor.didDrop(), "Cannot call hover after drop.");
  for (let i3 = 0; i3 < targetIds.length; i3++) {
    const targetId = targetIds[i3];
    invariant(targetIds.lastIndexOf(targetId) === i3, "Expected targetIds to be unique in the passed array.");
    const target = registry.getTarget(targetId);
    invariant(target, "Expected targetIds to be registered.");
  }
}
function removeNonMatchingTargetIds(targetIds, registry, draggedItemType) {
  for (let i3 = targetIds.length - 1; i3 >= 0; i3--) {
    const targetId = targetIds[i3];
    const targetType = registry.getTargetType(targetId);
    if (!matchesType(targetType, draggedItemType)) {
      targetIds.splice(i3, 1);
    }
  }
}
function hoverAllTargets(targetIds, monitor, registry) {
  targetIds.forEach(function(targetId) {
    const target = registry.getTarget(targetId);
    target.hover(monitor, targetId);
  });
}
var init_hover = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/actions/dragDrop/hover.js"() {
    init_dist2();
    init_matchesType();
    init_types();
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/actions/dragDrop/publishDragSource.js
function createPublishDragSource(manager) {
  return function publishDragSource() {
    const monitor = manager.getMonitor();
    if (monitor.isDragging()) {
      return {
        type: PUBLISH_DRAG_SOURCE
      };
    }
    return;
  };
}
var init_publishDragSource = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/actions/dragDrop/publishDragSource.js"() {
    init_types();
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/actions/dragDrop/index.js
function createDragDropActions(manager) {
  return {
    beginDrag: createBeginDrag(manager),
    publishDragSource: createPublishDragSource(manager),
    hover: createHover(manager),
    drop: createDrop(manager),
    endDrag: createEndDrag(manager)
  };
}
var init_dragDrop = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/actions/dragDrop/index.js"() {
    init_beginDrag();
    init_drop();
    init_endDrag();
    init_hover();
    init_publishDragSource();
    init_types();
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/classes/DragDropManagerImpl.js
var DragDropManagerImpl;
var init_DragDropManagerImpl = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/classes/DragDropManagerImpl.js"() {
    init_dragDrop();
    DragDropManagerImpl = class {
      receiveBackend(backend) {
        this.backend = backend;
      }
      getMonitor() {
        return this.monitor;
      }
      getBackend() {
        return this.backend;
      }
      getRegistry() {
        return this.monitor.registry;
      }
      getActions() {
        const manager = this;
        const { dispatch } = this.store;
        function bindActionCreator(actionCreator) {
          return (...args) => {
            const action = actionCreator.apply(manager, args);
            if (typeof action !== "undefined") {
              dispatch(action);
            }
          };
        }
        const actions = createDragDropActions(this);
        return Object.keys(actions).reduce((boundActions, key) => {
          const action = actions[key];
          boundActions[key] = bindActionCreator(action);
          return boundActions;
        }, {});
      }
      dispatch(action) {
        this.store.dispatch(action);
      }
      constructor(store, monitor) {
        this.isSetUp = false;
        this.handleRefCountChange = () => {
          const shouldSetUp = this.store.getState().refCount > 0;
          if (this.backend) {
            if (shouldSetUp && !this.isSetUp) {
              this.backend.setup();
              this.isSetUp = true;
            } else if (!shouldSetUp && this.isSetUp) {
              this.backend.teardown();
              this.isSetUp = false;
            }
          }
        };
        this.store = store;
        this.monitor = monitor;
        store.subscribe(this.handleRefCountChange);
      }
    };
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/utils/coords.js
function add(a4, b2) {
  return {
    x: a4.x + b2.x,
    y: a4.y + b2.y
  };
}
function subtract(a4, b2) {
  return {
    x: a4.x - b2.x,
    y: a4.y - b2.y
  };
}
function getSourceClientOffset(state) {
  const { clientOffset, initialClientOffset, initialSourceClientOffset } = state;
  if (!clientOffset || !initialClientOffset || !initialSourceClientOffset) {
    return null;
  }
  return subtract(add(clientOffset, initialSourceClientOffset), initialClientOffset);
}
function getDifferenceFromInitialOffset(state) {
  const { clientOffset, initialClientOffset } = state;
  if (!clientOffset || !initialClientOffset) {
    return null;
  }
  return subtract(clientOffset, initialClientOffset);
}
var init_coords = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/utils/coords.js"() {
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/utils/dirtiness.js
function areDirty(dirtyIds, handlerIds) {
  if (dirtyIds === NONE) {
    return false;
  }
  if (dirtyIds === ALL || typeof handlerIds === "undefined") {
    return true;
  }
  const commonIds = intersection(handlerIds, dirtyIds);
  return commonIds.length > 0;
}
var NONE, ALL;
var init_dirtiness = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/utils/dirtiness.js"() {
    init_js_utils2();
    NONE = [];
    ALL = [];
    NONE.__IS_NONE__ = true;
    ALL.__IS_ALL__ = true;
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/classes/DragDropMonitorImpl.js
var DragDropMonitorImpl;
var init_DragDropMonitorImpl = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/classes/DragDropMonitorImpl.js"() {
    init_dist2();
    init_coords();
    init_dirtiness();
    init_matchesType();
    DragDropMonitorImpl = class {
      subscribeToStateChange(listener, options = {}) {
        const { handlerIds } = options;
        invariant(typeof listener === "function", "listener must be a function.");
        invariant(typeof handlerIds === "undefined" || Array.isArray(handlerIds), "handlerIds, when specified, must be an array of strings.");
        let prevStateId = this.store.getState().stateId;
        const handleChange = () => {
          const state = this.store.getState();
          const currentStateId = state.stateId;
          try {
            const canSkipListener = currentStateId === prevStateId || currentStateId === prevStateId + 1 && !areDirty(state.dirtyHandlerIds, handlerIds);
            if (!canSkipListener) {
              listener();
            }
          } finally {
            prevStateId = currentStateId;
          }
        };
        return this.store.subscribe(handleChange);
      }
      subscribeToOffsetChange(listener) {
        invariant(typeof listener === "function", "listener must be a function.");
        let previousState = this.store.getState().dragOffset;
        const handleChange = () => {
          const nextState = this.store.getState().dragOffset;
          if (nextState === previousState) {
            return;
          }
          previousState = nextState;
          listener();
        };
        return this.store.subscribe(handleChange);
      }
      canDragSource(sourceId) {
        if (!sourceId) {
          return false;
        }
        const source = this.registry.getSource(sourceId);
        invariant(source, `Expected to find a valid source. sourceId=${sourceId}`);
        if (this.isDragging()) {
          return false;
        }
        return source.canDrag(this, sourceId);
      }
      canDropOnTarget(targetId) {
        if (!targetId) {
          return false;
        }
        const target = this.registry.getTarget(targetId);
        invariant(target, `Expected to find a valid target. targetId=${targetId}`);
        if (!this.isDragging() || this.didDrop()) {
          return false;
        }
        const targetType = this.registry.getTargetType(targetId);
        const draggedItemType = this.getItemType();
        return matchesType(targetType, draggedItemType) && target.canDrop(this, targetId);
      }
      isDragging() {
        return Boolean(this.getItemType());
      }
      isDraggingSource(sourceId) {
        if (!sourceId) {
          return false;
        }
        const source = this.registry.getSource(sourceId, true);
        invariant(source, `Expected to find a valid source. sourceId=${sourceId}`);
        if (!this.isDragging() || !this.isSourcePublic()) {
          return false;
        }
        const sourceType = this.registry.getSourceType(sourceId);
        const draggedItemType = this.getItemType();
        if (sourceType !== draggedItemType) {
          return false;
        }
        return source.isDragging(this, sourceId);
      }
      isOverTarget(targetId, options = {
        shallow: false
      }) {
        if (!targetId) {
          return false;
        }
        const { shallow } = options;
        if (!this.isDragging()) {
          return false;
        }
        const targetType = this.registry.getTargetType(targetId);
        const draggedItemType = this.getItemType();
        if (draggedItemType && !matchesType(targetType, draggedItemType)) {
          return false;
        }
        const targetIds = this.getTargetIds();
        if (!targetIds.length) {
          return false;
        }
        const index = targetIds.indexOf(targetId);
        if (shallow) {
          return index === targetIds.length - 1;
        } else {
          return index > -1;
        }
      }
      getItemType() {
        return this.store.getState().dragOperation.itemType;
      }
      getItem() {
        return this.store.getState().dragOperation.item;
      }
      getSourceId() {
        return this.store.getState().dragOperation.sourceId;
      }
      getTargetIds() {
        return this.store.getState().dragOperation.targetIds;
      }
      getDropResult() {
        return this.store.getState().dragOperation.dropResult;
      }
      didDrop() {
        return this.store.getState().dragOperation.didDrop;
      }
      isSourcePublic() {
        return Boolean(this.store.getState().dragOperation.isSourcePublic);
      }
      getInitialClientOffset() {
        return this.store.getState().dragOffset.initialClientOffset;
      }
      getInitialSourceClientOffset() {
        return this.store.getState().dragOffset.initialSourceClientOffset;
      }
      getClientOffset() {
        return this.store.getState().dragOffset.clientOffset;
      }
      getSourceClientOffset() {
        return getSourceClientOffset(this.store.getState().dragOffset);
      }
      getDifferenceFromInitialOffset() {
        return getDifferenceFromInitialOffset(this.store.getState().dragOffset);
      }
      constructor(store, registry) {
        this.store = store;
        this.registry = registry;
      }
    };
  }
});

// ../node_modules/.pnpm/@react-dnd+asap@5.0.2/node_modules/@react-dnd/asap/dist/makeRequestCall.js
function makeRequestCallFromTimer(callback) {
  return function requestCall() {
    const timeoutHandle = setTimeout(handleTimer, 0);
    const intervalHandle = setInterval(handleTimer, 50);
    function handleTimer() {
      clearTimeout(timeoutHandle);
      clearInterval(intervalHandle);
      callback();
    }
  };
}
function makeRequestCallFromMutationObserver(callback) {
  let toggle = 1;
  const observer = new BrowserMutationObserver(callback);
  const node = document.createTextNode("");
  observer.observe(node, {
    characterData: true
  });
  return function requestCall() {
    toggle = -toggle;
    node.data = toggle;
  };
}
var scope, BrowserMutationObserver, makeRequestCall;
var init_makeRequestCall = __esm({
  "../node_modules/.pnpm/@react-dnd+asap@5.0.2/node_modules/@react-dnd/asap/dist/makeRequestCall.js"() {
    scope = typeof global !== "undefined" ? global : self;
    BrowserMutationObserver = scope.MutationObserver || scope.WebKitMutationObserver;
    makeRequestCall = typeof BrowserMutationObserver === "function" ? (
      // reliably everywhere they are implemented.
      // They are implemented in all modern browsers.
      //
      // - Android 4-4.3
      // - Chrome 26-34
      // - Firefox 14-29
      // - Internet Explorer 11
      // - iPad Safari 6-7.1
      // - iPhone Safari 7-7.1
      // - Safari 6-7
      makeRequestCallFromMutationObserver
    ) : (
      // task queue, are implemented in Internet Explorer 10, Safari 5.0-1, and Opera
      // 11-12, and in web workers in many engines.
      // Although message channels yield to any queued rendering and IO tasks, they
      // would be better than imposing the 4ms delay of timers.
      // However, they do not work reliably in Internet Explorer or Safari.
      // Internet Explorer 10 is the only browser that has setImmediate but does
      // not have MutationObservers.
      // Although setImmediate yields to the browser's renderer, it would be
      // preferrable to falling back to setTimeout since it does not have
      // the minimum 4ms penalty.
      // Unfortunately there appears to be a bug in Internet Explorer 10 Mobile (and
      // Desktop to a lesser extent) that renders both setImmediate and
      // MessageChannel useless for the purposes of ASAP.
      // https://github.com/kriskowal/q/issues/396
      // Timers are implemented universally.
      // We fall back to timers in workers in most engines, and in foreground
      // contexts in the following browsers.
      // However, note that even this simple case requires nuances to operate in a
      // broad spectrum of browsers.
      //
      // - Firefox 3-13
      // - Internet Explorer 6-9
      // - iPad Safari 4.3
      // - Lynx 2.8.7
      makeRequestCallFromTimer
    );
  }
});

// ../node_modules/.pnpm/@react-dnd+asap@5.0.2/node_modules/@react-dnd/asap/dist/AsapQueue.js
var AsapQueue;
var init_AsapQueue = __esm({
  "../node_modules/.pnpm/@react-dnd+asap@5.0.2/node_modules/@react-dnd/asap/dist/AsapQueue.js"() {
    init_makeRequestCall();
    AsapQueue = class {
      // Use the fastest means possible to execute a task in its own turn, with
      // priority over other events including IO, animation, reflow, and redraw
      // events in browsers.
      //
      // An exception thrown by a task will permanently interrupt the processing of
      // subsequent tasks. The higher level `asap` function ensures that if an
      // exception is thrown by a task, that the task queue will continue flushing as
      // soon as possible, but if you use `rawAsap` directly, you are responsible to
      // either ensure that no exceptions are thrown from your task, or to manually
      // call `rawAsap.requestFlush` if an exception is thrown.
      enqueueTask(task) {
        const { queue: q, requestFlush } = this;
        if (!q.length) {
          requestFlush();
          this.flushing = true;
        }
        q[q.length] = task;
      }
      constructor() {
        this.queue = [];
        this.pendingErrors = [];
        this.flushing = false;
        this.index = 0;
        this.capacity = 1024;
        this.flush = () => {
          const { queue: q } = this;
          while (this.index < q.length) {
            const currentIndex = this.index;
            this.index++;
            q[currentIndex].call();
            if (this.index > this.capacity) {
              for (let scan = 0, newLength = q.length - this.index; scan < newLength; scan++) {
                q[scan] = q[scan + this.index];
              }
              q.length -= this.index;
              this.index = 0;
            }
          }
          q.length = 0;
          this.index = 0;
          this.flushing = false;
        };
        this.registerPendingError = (err) => {
          this.pendingErrors.push(err);
          this.requestErrorThrow();
        };
        this.requestFlush = makeRequestCall(this.flush);
        this.requestErrorThrow = makeRequestCallFromTimer(() => {
          if (this.pendingErrors.length) {
            throw this.pendingErrors.shift();
          }
        });
      }
    };
  }
});

// ../node_modules/.pnpm/@react-dnd+asap@5.0.2/node_modules/@react-dnd/asap/dist/RawTask.js
var RawTask;
var init_RawTask = __esm({
  "../node_modules/.pnpm/@react-dnd+asap@5.0.2/node_modules/@react-dnd/asap/dist/RawTask.js"() {
    RawTask = class {
      call() {
        try {
          this.task && this.task();
        } catch (error) {
          this.onError(error);
        } finally {
          this.task = null;
          this.release(this);
        }
      }
      constructor(onError, release) {
        this.onError = onError;
        this.release = release;
        this.task = null;
      }
    };
  }
});

// ../node_modules/.pnpm/@react-dnd+asap@5.0.2/node_modules/@react-dnd/asap/dist/TaskFactory.js
var TaskFactory;
var init_TaskFactory = __esm({
  "../node_modules/.pnpm/@react-dnd+asap@5.0.2/node_modules/@react-dnd/asap/dist/TaskFactory.js"() {
    init_RawTask();
    TaskFactory = class {
      create(task) {
        const tasks = this.freeTasks;
        const t1 = tasks.length ? tasks.pop() : new RawTask(
          this.onError,
          (t2) => tasks[tasks.length] = t2
        );
        t1.task = task;
        return t1;
      }
      constructor(onError) {
        this.onError = onError;
        this.freeTasks = [];
      }
    };
  }
});

// ../node_modules/.pnpm/@react-dnd+asap@5.0.2/node_modules/@react-dnd/asap/dist/asap.js
function asap(task) {
  asapQueue.enqueueTask(taskFactory.create(task));
}
var asapQueue, taskFactory;
var init_asap = __esm({
  "../node_modules/.pnpm/@react-dnd+asap@5.0.2/node_modules/@react-dnd/asap/dist/asap.js"() {
    init_AsapQueue();
    init_TaskFactory();
    asapQueue = new AsapQueue();
    taskFactory = new TaskFactory(asapQueue.registerPendingError);
  }
});

// ../node_modules/.pnpm/@react-dnd+asap@5.0.2/node_modules/@react-dnd/asap/dist/types.js
var init_types2 = __esm({
  "../node_modules/.pnpm/@react-dnd+asap@5.0.2/node_modules/@react-dnd/asap/dist/types.js"() {
  }
});

// ../node_modules/.pnpm/@react-dnd+asap@5.0.2/node_modules/@react-dnd/asap/dist/index.js
var init_dist6 = __esm({
  "../node_modules/.pnpm/@react-dnd+asap@5.0.2/node_modules/@react-dnd/asap/dist/index.js"() {
    init_asap();
    init_AsapQueue();
    init_TaskFactory();
    init_types2();
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/actions/registry.js
function addSource(sourceId) {
  return {
    type: ADD_SOURCE,
    payload: {
      sourceId
    }
  };
}
function addTarget(targetId) {
  return {
    type: ADD_TARGET,
    payload: {
      targetId
    }
  };
}
function removeSource(sourceId) {
  return {
    type: REMOVE_SOURCE,
    payload: {
      sourceId
    }
  };
}
function removeTarget(targetId) {
  return {
    type: REMOVE_TARGET,
    payload: {
      targetId
    }
  };
}
var ADD_SOURCE, ADD_TARGET, REMOVE_SOURCE, REMOVE_TARGET;
var init_registry = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/actions/registry.js"() {
    ADD_SOURCE = "dnd-core/ADD_SOURCE";
    ADD_TARGET = "dnd-core/ADD_TARGET";
    REMOVE_SOURCE = "dnd-core/REMOVE_SOURCE";
    REMOVE_TARGET = "dnd-core/REMOVE_TARGET";
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/contracts.js
function validateSourceContract(source) {
  invariant(typeof source.canDrag === "function", "Expected canDrag to be a function.");
  invariant(typeof source.beginDrag === "function", "Expected beginDrag to be a function.");
  invariant(typeof source.endDrag === "function", "Expected endDrag to be a function.");
}
function validateTargetContract(target) {
  invariant(typeof target.canDrop === "function", "Expected canDrop to be a function.");
  invariant(typeof target.hover === "function", "Expected hover to be a function.");
  invariant(typeof target.drop === "function", "Expected beginDrag to be a function.");
}
function validateType(type, allowArray) {
  if (allowArray && Array.isArray(type)) {
    type.forEach(
      (t2) => validateType(t2, false)
    );
    return;
  }
  invariant(typeof type === "string" || typeof type === "symbol", allowArray ? "Type can only be a string, a symbol, or an array of either." : "Type can only be a string or a symbol.");
}
var init_contracts = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/contracts.js"() {
    init_dist2();
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/interfaces.js
var HandlerRole;
var init_interfaces2 = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/interfaces.js"() {
    (function(HandlerRole2) {
      HandlerRole2["SOURCE"] = "SOURCE";
      HandlerRole2["TARGET"] = "TARGET";
    })(HandlerRole || (HandlerRole = {}));
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/utils/getNextUniqueId.js
function getNextUniqueId() {
  return nextUniqueId++;
}
var nextUniqueId;
var init_getNextUniqueId = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/utils/getNextUniqueId.js"() {
    nextUniqueId = 0;
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/classes/HandlerRegistryImpl.js
function getNextHandlerId(role) {
  const id = getNextUniqueId().toString();
  switch (role) {
    case HandlerRole.SOURCE:
      return `S${id}`;
    case HandlerRole.TARGET:
      return `T${id}`;
    default:
      throw new Error(`Unknown Handler Role: ${role}`);
  }
}
function parseRoleFromHandlerId(handlerId) {
  switch (handlerId[0]) {
    case "S":
      return HandlerRole.SOURCE;
    case "T":
      return HandlerRole.TARGET;
    default:
      throw new Error(`Cannot parse handler ID: ${handlerId}`);
  }
}
function mapContainsValue(map, searchValue) {
  const entries = map.entries();
  let isDone = false;
  do {
    const { done, value: [, value] } = entries.next();
    if (value === searchValue) {
      return true;
    }
    isDone = !!done;
  } while (!isDone);
  return false;
}
var HandlerRegistryImpl;
var init_HandlerRegistryImpl = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/classes/HandlerRegistryImpl.js"() {
    init_dist6();
    init_dist2();
    init_registry();
    init_contracts();
    init_interfaces2();
    init_getNextUniqueId();
    HandlerRegistryImpl = class {
      addSource(type, source) {
        validateType(type);
        validateSourceContract(source);
        const sourceId = this.addHandler(HandlerRole.SOURCE, type, source);
        this.store.dispatch(addSource(sourceId));
        return sourceId;
      }
      addTarget(type, target) {
        validateType(type, true);
        validateTargetContract(target);
        const targetId = this.addHandler(HandlerRole.TARGET, type, target);
        this.store.dispatch(addTarget(targetId));
        return targetId;
      }
      containsHandler(handler) {
        return mapContainsValue(this.dragSources, handler) || mapContainsValue(this.dropTargets, handler);
      }
      getSource(sourceId, includePinned = false) {
        invariant(this.isSourceId(sourceId), "Expected a valid source ID.");
        const isPinned = includePinned && sourceId === this.pinnedSourceId;
        const source = isPinned ? this.pinnedSource : this.dragSources.get(sourceId);
        return source;
      }
      getTarget(targetId) {
        invariant(this.isTargetId(targetId), "Expected a valid target ID.");
        return this.dropTargets.get(targetId);
      }
      getSourceType(sourceId) {
        invariant(this.isSourceId(sourceId), "Expected a valid source ID.");
        return this.types.get(sourceId);
      }
      getTargetType(targetId) {
        invariant(this.isTargetId(targetId), "Expected a valid target ID.");
        return this.types.get(targetId);
      }
      isSourceId(handlerId) {
        const role = parseRoleFromHandlerId(handlerId);
        return role === HandlerRole.SOURCE;
      }
      isTargetId(handlerId) {
        const role = parseRoleFromHandlerId(handlerId);
        return role === HandlerRole.TARGET;
      }
      removeSource(sourceId) {
        invariant(this.getSource(sourceId), "Expected an existing source.");
        this.store.dispatch(removeSource(sourceId));
        asap(() => {
          this.dragSources.delete(sourceId);
          this.types.delete(sourceId);
        });
      }
      removeTarget(targetId) {
        invariant(this.getTarget(targetId), "Expected an existing target.");
        this.store.dispatch(removeTarget(targetId));
        this.dropTargets.delete(targetId);
        this.types.delete(targetId);
      }
      pinSource(sourceId) {
        const source = this.getSource(sourceId);
        invariant(source, "Expected an existing source.");
        this.pinnedSourceId = sourceId;
        this.pinnedSource = source;
      }
      unpinSource() {
        invariant(this.pinnedSource, "No source is pinned at the time.");
        this.pinnedSourceId = null;
        this.pinnedSource = null;
      }
      addHandler(role, type, handler) {
        const id = getNextHandlerId(role);
        this.types.set(id, type);
        if (role === HandlerRole.SOURCE) {
          this.dragSources.set(id, handler);
        } else if (role === HandlerRole.TARGET) {
          this.dropTargets.set(id, handler);
        }
        return id;
      }
      constructor(store) {
        this.types = /* @__PURE__ */ new Map();
        this.dragSources = /* @__PURE__ */ new Map();
        this.dropTargets = /* @__PURE__ */ new Map();
        this.pinnedSourceId = null;
        this.pinnedSource = null;
        this.store = store;
      }
    };
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/utils/equality.js
function areCoordsEqual(offsetA, offsetB) {
  if (!offsetA && !offsetB) {
    return true;
  } else if (!offsetA || !offsetB) {
    return false;
  } else {
    return offsetA.x === offsetB.x && offsetA.y === offsetB.y;
  }
}
function areArraysEqual(a4, b2, isEqual = strictEquality) {
  if (a4.length !== b2.length) {
    return false;
  }
  for (let i3 = 0; i3 < a4.length; ++i3) {
    if (!isEqual(a4[i3], b2[i3])) {
      return false;
    }
  }
  return true;
}
var strictEquality;
var init_equality = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/utils/equality.js"() {
    strictEquality = (a4, b2) => a4 === b2;
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/reducers/dirtyHandlerIds.js
function reduce(_state = NONE, action) {
  switch (action.type) {
    case HOVER:
      break;
    case ADD_SOURCE:
    case ADD_TARGET:
    case REMOVE_TARGET:
    case REMOVE_SOURCE:
      return NONE;
    case BEGIN_DRAG:
    case PUBLISH_DRAG_SOURCE:
    case END_DRAG:
    case DROP:
    default:
      return ALL;
  }
  const { targetIds = [], prevTargetIds = [] } = action.payload;
  const result = xor(targetIds, prevTargetIds);
  const didChange = result.length > 0 || !areArraysEqual(targetIds, prevTargetIds);
  if (!didChange) {
    return NONE;
  }
  const prevInnermostTargetId = prevTargetIds[prevTargetIds.length - 1];
  const innermostTargetId = targetIds[targetIds.length - 1];
  if (prevInnermostTargetId !== innermostTargetId) {
    if (prevInnermostTargetId) {
      result.push(prevInnermostTargetId);
    }
    if (innermostTargetId) {
      result.push(innermostTargetId);
    }
  }
  return result;
}
var init_dirtyHandlerIds = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/reducers/dirtyHandlerIds.js"() {
    init_dragDrop();
    init_registry();
    init_dirtiness();
    init_equality();
    init_js_utils2();
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/reducers/dragOffset.js
function _defineProperty4(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _objectSpread4(target) {
  for (var i3 = 1; i3 < arguments.length; i3++) {
    var source = arguments[i3] != null ? arguments[i3] : {};
    var ownKeys = Object.keys(source);
    if (typeof Object.getOwnPropertySymbols === "function") {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }
    ownKeys.forEach(function(key) {
      _defineProperty4(target, key, source[key]);
    });
  }
  return target;
}
function reduce2(state = initialState, action) {
  const { payload } = action;
  switch (action.type) {
    case INIT_COORDS:
    case BEGIN_DRAG:
      return {
        initialSourceClientOffset: payload.sourceClientOffset,
        initialClientOffset: payload.clientOffset,
        clientOffset: payload.clientOffset
      };
    case HOVER:
      if (areCoordsEqual(state.clientOffset, payload.clientOffset)) {
        return state;
      }
      return _objectSpread4({}, state, {
        clientOffset: payload.clientOffset
      });
    case END_DRAG:
    case DROP:
      return initialState;
    default:
      return state;
  }
}
var initialState;
var init_dragOffset = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/reducers/dragOffset.js"() {
    init_dragDrop();
    init_equality();
    initialState = {
      initialSourceClientOffset: null,
      initialClientOffset: null,
      clientOffset: null
    };
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/reducers/dragOperation.js
function _defineProperty5(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _objectSpread5(target) {
  for (var i3 = 1; i3 < arguments.length; i3++) {
    var source = arguments[i3] != null ? arguments[i3] : {};
    var ownKeys = Object.keys(source);
    if (typeof Object.getOwnPropertySymbols === "function") {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }
    ownKeys.forEach(function(key) {
      _defineProperty5(target, key, source[key]);
    });
  }
  return target;
}
function reduce3(state = initialState2, action) {
  const { payload } = action;
  switch (action.type) {
    case BEGIN_DRAG:
      return _objectSpread5({}, state, {
        itemType: payload.itemType,
        item: payload.item,
        sourceId: payload.sourceId,
        isSourcePublic: payload.isSourcePublic,
        dropResult: null,
        didDrop: false
      });
    case PUBLISH_DRAG_SOURCE:
      return _objectSpread5({}, state, {
        isSourcePublic: true
      });
    case HOVER:
      return _objectSpread5({}, state, {
        targetIds: payload.targetIds
      });
    case REMOVE_TARGET:
      if (state.targetIds.indexOf(payload.targetId) === -1) {
        return state;
      }
      return _objectSpread5({}, state, {
        targetIds: without2(state.targetIds, payload.targetId)
      });
    case DROP:
      return _objectSpread5({}, state, {
        dropResult: payload.dropResult,
        didDrop: true,
        targetIds: []
      });
    case END_DRAG:
      return _objectSpread5({}, state, {
        itemType: null,
        item: null,
        sourceId: null,
        dropResult: null,
        didDrop: false,
        isSourcePublic: null,
        targetIds: []
      });
    default:
      return state;
  }
}
var initialState2;
var init_dragOperation = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/reducers/dragOperation.js"() {
    init_dragDrop();
    init_registry();
    init_js_utils2();
    initialState2 = {
      itemType: null,
      item: null,
      sourceId: null,
      targetIds: [],
      dropResult: null,
      didDrop: false,
      isSourcePublic: null
    };
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/reducers/refCount.js
function reduce4(state = 0, action) {
  switch (action.type) {
    case ADD_SOURCE:
    case ADD_TARGET:
      return state + 1;
    case REMOVE_SOURCE:
    case REMOVE_TARGET:
      return state - 1;
    default:
      return state;
  }
}
var init_refCount = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/reducers/refCount.js"() {
    init_registry();
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/reducers/stateId.js
function reduce5(state = 0) {
  return state + 1;
}
var init_stateId = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/reducers/stateId.js"() {
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/reducers/index.js
function _defineProperty6(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _objectSpread6(target) {
  for (var i3 = 1; i3 < arguments.length; i3++) {
    var source = arguments[i3] != null ? arguments[i3] : {};
    var ownKeys = Object.keys(source);
    if (typeof Object.getOwnPropertySymbols === "function") {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }
    ownKeys.forEach(function(key) {
      _defineProperty6(target, key, source[key]);
    });
  }
  return target;
}
function reduce6(state = {}, action) {
  return {
    dirtyHandlerIds: reduce(state.dirtyHandlerIds, {
      type: action.type,
      payload: _objectSpread6({}, action.payload, {
        prevTargetIds: get(state, "dragOperation.targetIds", [])
      })
    }),
    dragOffset: reduce2(state.dragOffset, action),
    refCount: reduce4(state.refCount, action),
    dragOperation: reduce3(state.dragOperation, action),
    stateId: reduce5(state.stateId)
  };
}
var init_reducers = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/reducers/index.js"() {
    init_js_utils2();
    init_dirtyHandlerIds();
    init_dragOffset();
    init_dragOperation();
    init_refCount();
    init_stateId();
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/createDragDropManager.js
function createDragDropManager(backendFactory, globalContext = void 0, backendOptions = {}, debugMode = false) {
  const store = makeStoreInstance(debugMode);
  const monitor = new DragDropMonitorImpl(store, new HandlerRegistryImpl(store));
  const manager = new DragDropManagerImpl(store, monitor);
  const backend = backendFactory(manager, globalContext, backendOptions);
  manager.receiveBackend(backend);
  return manager;
}
function makeStoreInstance(debugMode) {
  const reduxDevTools = typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION__;
  return createStore(reduce6, debugMode && reduxDevTools && reduxDevTools({
    name: "dnd-core",
    instanceId: "dnd-core"
  }));
}
var init_createDragDropManager = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/createDragDropManager.js"() {
    init_redux();
    init_DragDropManagerImpl();
    init_DragDropMonitorImpl();
    init_HandlerRegistryImpl();
    init_reducers();
  }
});

// ../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/index.js
var init_dist7 = __esm({
  "../node_modules/.pnpm/dnd-core@16.0.1/node_modules/dnd-core/dist/index.js"() {
    init_createDragDropManager();
    init_interfaces2();
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/core/DndProvider.js
function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i3;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i3 = 0; i3 < sourceSymbolKeys.length; i3++) {
      key = sourceSymbolKeys[i3];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i3;
  for (i3 = 0; i3 < sourceKeys.length; i3++) {
    key = sourceKeys[i3];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function getDndContextValue(props) {
  if ("manager" in props) {
    const manager2 = {
      dragDropManager: props.manager
    };
    return [
      manager2,
      false
    ];
  }
  const manager = createSingletonDndContext(props.backend, props.context, props.options, props.debugMode);
  const isGlobalInstance = !props.context;
  return [
    manager,
    isGlobalInstance
  ];
}
function createSingletonDndContext(backend, context = getGlobalContext(), options, debugMode) {
  const ctx = context;
  if (!ctx[INSTANCE_SYM]) {
    ctx[INSTANCE_SYM] = {
      dragDropManager: createDragDropManager(backend, context, options, debugMode)
    };
  }
  return ctx[INSTANCE_SYM];
}
function getGlobalContext() {
  return typeof global !== "undefined" ? global : window;
}
var import_jsx_runtime, import_react2, refCount, INSTANCE_SYM, DndProvider;
var init_DndProvider = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/core/DndProvider.js"() {
    import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
    init_dist7();
    import_react2 = __toESM(require_react(), 1);
    init_DndContext();
    refCount = 0;
    INSTANCE_SYM = /* @__PURE__ */ Symbol.for("__REACT_DND_CONTEXT_INSTANCE__");
    DndProvider = /* @__PURE__ */ (0, import_react2.memo)(function DndProvider2(_param) {
      var { children } = _param, props = _objectWithoutProperties(_param, [
        "children"
      ]);
      const [manager, isGlobalInstance] = getDndContextValue(props);
      (0, import_react2.useEffect)(() => {
        if (isGlobalInstance) {
          const context = getGlobalContext();
          ++refCount;
          return () => {
            if (--refCount === 0) {
              context[INSTANCE_SYM] = null;
            }
          };
        }
        return;
      }, []);
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DndContext.Provider, {
        value: manager,
        children
      });
    });
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/core/DragPreviewImage.js
var import_react3, DragPreviewImage;
var init_DragPreviewImage = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/core/DragPreviewImage.js"() {
    import_react3 = __toESM(require_react(), 1);
    DragPreviewImage = (0, import_react3.memo)(function DragPreviewImage2({ connect, src }) {
      (0, import_react3.useEffect)(() => {
        if (typeof Image === "undefined") return;
        let connected = false;
        const img = new Image();
        img.src = src;
        img.onload = () => {
          connect(img);
          connected = true;
        };
        return () => {
          if (connected) {
            connect(null);
          }
        };
      });
      return null;
    });
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/core/index.js
var init_core = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/core/index.js"() {
    init_DndContext();
    init_DndProvider();
    init_DragPreviewImage();
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/types.js
var init_types3 = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/types.js"() {
  }
});

// ../node_modules/.pnpm/fast-deep-equal@3.1.3/node_modules/fast-deep-equal/index.js
var require_fast_deep_equal = __commonJS({
  "../node_modules/.pnpm/fast-deep-equal@3.1.3/node_modules/fast-deep-equal/index.js"(exports, module) {
    "use strict";
    module.exports = function equal2(a4, b2) {
      if (a4 === b2) return true;
      if (a4 && b2 && typeof a4 == "object" && typeof b2 == "object") {
        if (a4.constructor !== b2.constructor) return false;
        var length, i3, keys;
        if (Array.isArray(a4)) {
          length = a4.length;
          if (length != b2.length) return false;
          for (i3 = length; i3-- !== 0; )
            if (!equal2(a4[i3], b2[i3])) return false;
          return true;
        }
        if (a4.constructor === RegExp) return a4.source === b2.source && a4.flags === b2.flags;
        if (a4.valueOf !== Object.prototype.valueOf) return a4.valueOf() === b2.valueOf();
        if (a4.toString !== Object.prototype.toString) return a4.toString() === b2.toString();
        keys = Object.keys(a4);
        length = keys.length;
        if (length !== Object.keys(b2).length) return false;
        for (i3 = length; i3-- !== 0; )
          if (!Object.prototype.hasOwnProperty.call(b2, keys[i3])) return false;
        for (i3 = length; i3-- !== 0; ) {
          var key = keys[i3];
          if (!equal2(a4[key], b2[key])) return false;
        }
        return true;
      }
      return a4 !== a4 && b2 !== b2;
    };
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useIsomorphicLayoutEffect.js
var import_react4, useIsomorphicLayoutEffect;
var init_useIsomorphicLayoutEffect = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useIsomorphicLayoutEffect.js"() {
    import_react4 = __toESM(require_react(), 1);
    useIsomorphicLayoutEffect = typeof window !== "undefined" ? import_react4.useLayoutEffect : import_react4.useEffect;
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useCollector.js
function useCollector(monitor, collect, onUpdate) {
  const [collected, setCollected] = (0, import_react5.useState)(
    () => collect(monitor)
  );
  const updateCollected = (0, import_react5.useCallback)(() => {
    const nextValue = collect(monitor);
    if (!(0, import_fast_deep_equal.default)(collected, nextValue)) {
      setCollected(nextValue);
      if (onUpdate) {
        onUpdate();
      }
    }
  }, [
    collected,
    monitor,
    onUpdate
  ]);
  useIsomorphicLayoutEffect(updateCollected);
  return [
    collected,
    updateCollected
  ];
}
var import_fast_deep_equal, import_react5;
var init_useCollector = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useCollector.js"() {
    import_fast_deep_equal = __toESM(require_fast_deep_equal(), 1);
    import_react5 = __toESM(require_react(), 1);
    init_useIsomorphicLayoutEffect();
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useMonitorOutput.js
function useMonitorOutput(monitor, collect, onCollect) {
  const [collected, updateCollected] = useCollector(monitor, collect, onCollect);
  useIsomorphicLayoutEffect(function subscribeToMonitorStateChange() {
    const handlerId = monitor.getHandlerId();
    if (handlerId == null) {
      return;
    }
    return monitor.subscribeToStateChange(updateCollected, {
      handlerIds: [
        handlerId
      ]
    });
  }, [
    monitor,
    updateCollected
  ]);
  return collected;
}
var init_useMonitorOutput = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useMonitorOutput.js"() {
    init_useCollector();
    init_useIsomorphicLayoutEffect();
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useCollectedProps.js
function useCollectedProps(collector, monitor, connector) {
  return useMonitorOutput(
    monitor,
    collector || (() => ({})),
    () => connector.reconnect()
  );
}
var init_useCollectedProps = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useCollectedProps.js"() {
    init_useMonitorOutput();
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useOptionalFactory.js
function useOptionalFactory(arg, deps) {
  const memoDeps = [
    ...deps || []
  ];
  if (deps == null && typeof arg !== "function") {
    memoDeps.push(arg);
  }
  return (0, import_react6.useMemo)(() => {
    return typeof arg === "function" ? arg() : arg;
  }, memoDeps);
}
var import_react6;
var init_useOptionalFactory = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useOptionalFactory.js"() {
    import_react6 = __toESM(require_react(), 1);
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrag/connectors.js
function useConnectDragSource(connector) {
  return (0, import_react7.useMemo)(
    () => connector.hooks.dragSource(),
    [
      connector
    ]
  );
}
function useConnectDragPreview(connector) {
  return (0, import_react7.useMemo)(
    () => connector.hooks.dragPreview(),
    [
      connector
    ]
  );
}
var import_react7;
var init_connectors = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrag/connectors.js"() {
    import_react7 = __toESM(require_react(), 1);
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/internals/DragSourceMonitorImpl.js
var isCallingCanDrag, isCallingIsDragging, DragSourceMonitorImpl;
var init_DragSourceMonitorImpl = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/internals/DragSourceMonitorImpl.js"() {
    init_dist2();
    isCallingCanDrag = false;
    isCallingIsDragging = false;
    DragSourceMonitorImpl = class {
      receiveHandlerId(sourceId) {
        this.sourceId = sourceId;
      }
      getHandlerId() {
        return this.sourceId;
      }
      canDrag() {
        invariant(!isCallingCanDrag, "You may not call monitor.canDrag() inside your canDrag() implementation. Read more: http://react-dnd.github.io/react-dnd/docs/api/drag-source-monitor");
        try {
          isCallingCanDrag = true;
          return this.internalMonitor.canDragSource(this.sourceId);
        } finally {
          isCallingCanDrag = false;
        }
      }
      isDragging() {
        if (!this.sourceId) {
          return false;
        }
        invariant(!isCallingIsDragging, "You may not call monitor.isDragging() inside your isDragging() implementation. Read more: http://react-dnd.github.io/react-dnd/docs/api/drag-source-monitor");
        try {
          isCallingIsDragging = true;
          return this.internalMonitor.isDraggingSource(this.sourceId);
        } finally {
          isCallingIsDragging = false;
        }
      }
      subscribeToStateChange(listener, options) {
        return this.internalMonitor.subscribeToStateChange(listener, options);
      }
      isDraggingSource(sourceId) {
        return this.internalMonitor.isDraggingSource(sourceId);
      }
      isOverTarget(targetId, options) {
        return this.internalMonitor.isOverTarget(targetId, options);
      }
      getTargetIds() {
        return this.internalMonitor.getTargetIds();
      }
      isSourcePublic() {
        return this.internalMonitor.isSourcePublic();
      }
      getSourceId() {
        return this.internalMonitor.getSourceId();
      }
      subscribeToOffsetChange(listener) {
        return this.internalMonitor.subscribeToOffsetChange(listener);
      }
      canDragSource(sourceId) {
        return this.internalMonitor.canDragSource(sourceId);
      }
      canDropOnTarget(targetId) {
        return this.internalMonitor.canDropOnTarget(targetId);
      }
      getItemType() {
        return this.internalMonitor.getItemType();
      }
      getItem() {
        return this.internalMonitor.getItem();
      }
      getDropResult() {
        return this.internalMonitor.getDropResult();
      }
      didDrop() {
        return this.internalMonitor.didDrop();
      }
      getInitialClientOffset() {
        return this.internalMonitor.getInitialClientOffset();
      }
      getInitialSourceClientOffset() {
        return this.internalMonitor.getInitialSourceClientOffset();
      }
      getSourceClientOffset() {
        return this.internalMonitor.getSourceClientOffset();
      }
      getClientOffset() {
        return this.internalMonitor.getClientOffset();
      }
      getDifferenceFromInitialOffset() {
        return this.internalMonitor.getDifferenceFromInitialOffset();
      }
      constructor(manager) {
        this.sourceId = null;
        this.internalMonitor = manager.getMonitor();
      }
    };
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/internals/DropTargetMonitorImpl.js
var isCallingCanDrop, DropTargetMonitorImpl;
var init_DropTargetMonitorImpl = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/internals/DropTargetMonitorImpl.js"() {
    init_dist2();
    isCallingCanDrop = false;
    DropTargetMonitorImpl = class {
      receiveHandlerId(targetId) {
        this.targetId = targetId;
      }
      getHandlerId() {
        return this.targetId;
      }
      subscribeToStateChange(listener, options) {
        return this.internalMonitor.subscribeToStateChange(listener, options);
      }
      canDrop() {
        if (!this.targetId) {
          return false;
        }
        invariant(!isCallingCanDrop, "You may not call monitor.canDrop() inside your canDrop() implementation. Read more: http://react-dnd.github.io/react-dnd/docs/api/drop-target-monitor");
        try {
          isCallingCanDrop = true;
          return this.internalMonitor.canDropOnTarget(this.targetId);
        } finally {
          isCallingCanDrop = false;
        }
      }
      isOver(options) {
        if (!this.targetId) {
          return false;
        }
        return this.internalMonitor.isOverTarget(this.targetId, options);
      }
      getItemType() {
        return this.internalMonitor.getItemType();
      }
      getItem() {
        return this.internalMonitor.getItem();
      }
      getDropResult() {
        return this.internalMonitor.getDropResult();
      }
      didDrop() {
        return this.internalMonitor.didDrop();
      }
      getInitialClientOffset() {
        return this.internalMonitor.getInitialClientOffset();
      }
      getInitialSourceClientOffset() {
        return this.internalMonitor.getInitialSourceClientOffset();
      }
      getSourceClientOffset() {
        return this.internalMonitor.getSourceClientOffset();
      }
      getClientOffset() {
        return this.internalMonitor.getClientOffset();
      }
      getDifferenceFromInitialOffset() {
        return this.internalMonitor.getDifferenceFromInitialOffset();
      }
      constructor(manager) {
        this.targetId = null;
        this.internalMonitor = manager.getMonitor();
      }
    };
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/internals/registration.js
function registerTarget(type, target, manager) {
  const registry = manager.getRegistry();
  const targetId = registry.addTarget(type, target);
  return [
    targetId,
    () => registry.removeTarget(targetId)
  ];
}
function registerSource(type, source, manager) {
  const registry = manager.getRegistry();
  const sourceId = registry.addSource(type, source);
  return [
    sourceId,
    () => registry.removeSource(sourceId)
  ];
}
var init_registration = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/internals/registration.js"() {
  }
});

// ../node_modules/.pnpm/@react-dnd+shallowequal@4.0.2/node_modules/@react-dnd/shallowequal/dist/index.js
function shallowEqual(objA, objB, compare, compareContext) {
  let compareResult = compare ? compare.call(compareContext, objA, objB) : void 0;
  if (compareResult !== void 0) {
    return !!compareResult;
  }
  if (objA === objB) {
    return true;
  }
  if (typeof objA !== "object" || !objA || typeof objB !== "object" || !objB) {
    return false;
  }
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) {
    return false;
  }
  const bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);
  for (let idx = 0; idx < keysA.length; idx++) {
    const key = keysA[idx];
    if (!bHasOwnProperty(key)) {
      return false;
    }
    const valueA = objA[key];
    const valueB = objB[key];
    compareResult = compare ? compare.call(compareContext, valueA, valueB, key) : void 0;
    if (compareResult === false || compareResult === void 0 && valueA !== valueB) {
      return false;
    }
  }
  return true;
}
var init_dist8 = __esm({
  "../node_modules/.pnpm/@react-dnd+shallowequal@4.0.2/node_modules/@react-dnd/shallowequal/dist/index.js"() {
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/internals/isRef.js
function isRef(obj) {
  return (
    // eslint-disable-next-line no-prototype-builtins
    obj !== null && typeof obj === "object" && Object.prototype.hasOwnProperty.call(obj, "current")
  );
}
var init_isRef = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/internals/isRef.js"() {
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/internals/wrapConnectorHooks.js
function throwIfCompositeComponentElement(element) {
  if (typeof element.type === "string") {
    return;
  }
  const displayName = element.type.displayName || element.type.name || "the component";
  throw new Error(`Only native element nodes can now be passed to React DnD connectors.You can either wrap ${displayName} into a <div>, or turn it into a drag source or a drop target itself.`);
}
function wrapHookToRecognizeElement(hook) {
  return (elementOrNode = null, options = null) => {
    if (!(0, import_react8.isValidElement)(elementOrNode)) {
      const node = elementOrNode;
      hook(node, options);
      return node;
    }
    const element = elementOrNode;
    throwIfCompositeComponentElement(element);
    const ref = options ? (node) => hook(node, options) : hook;
    return cloneWithRef(element, ref);
  };
}
function wrapConnectorHooks(hooks) {
  const wrappedHooks = {};
  Object.keys(hooks).forEach((key) => {
    const hook = hooks[key];
    if (key.endsWith("Ref")) {
      wrappedHooks[key] = hooks[key];
    } else {
      const wrappedHook = wrapHookToRecognizeElement(hook);
      wrappedHooks[key] = () => wrappedHook;
    }
  });
  return wrappedHooks;
}
function setRef(ref, node) {
  if (typeof ref === "function") {
    ref(node);
  } else {
    ref.current = node;
  }
}
function cloneWithRef(element, newRef) {
  const previousRef = element.ref;
  invariant(typeof previousRef !== "string", "Cannot connect React DnD to an element with an existing string ref. Please convert it to use a callback ref instead, or wrap it into a <span> or <div>. Read more: https://reactjs.org/docs/refs-and-the-dom.html#callback-refs");
  if (!previousRef) {
    return (0, import_react8.cloneElement)(element, {
      ref: newRef
    });
  } else {
    return (0, import_react8.cloneElement)(element, {
      ref: (node) => {
        setRef(previousRef, node);
        setRef(newRef, node);
      }
    });
  }
}
var import_react8;
var init_wrapConnectorHooks = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/internals/wrapConnectorHooks.js"() {
    init_dist2();
    import_react8 = __toESM(require_react(), 1);
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/internals/SourceConnector.js
var SourceConnector;
var init_SourceConnector = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/internals/SourceConnector.js"() {
    init_dist8();
    init_isRef();
    init_wrapConnectorHooks();
    SourceConnector = class {
      receiveHandlerId(newHandlerId) {
        if (this.handlerId === newHandlerId) {
          return;
        }
        this.handlerId = newHandlerId;
        this.reconnect();
      }
      get connectTarget() {
        return this.dragSource;
      }
      get dragSourceOptions() {
        return this.dragSourceOptionsInternal;
      }
      set dragSourceOptions(options) {
        this.dragSourceOptionsInternal = options;
      }
      get dragPreviewOptions() {
        return this.dragPreviewOptionsInternal;
      }
      set dragPreviewOptions(options) {
        this.dragPreviewOptionsInternal = options;
      }
      reconnect() {
        const didChange = this.reconnectDragSource();
        this.reconnectDragPreview(didChange);
      }
      reconnectDragSource() {
        const dragSource = this.dragSource;
        const didChange = this.didHandlerIdChange() || this.didConnectedDragSourceChange() || this.didDragSourceOptionsChange();
        if (didChange) {
          this.disconnectDragSource();
        }
        if (!this.handlerId) {
          return didChange;
        }
        if (!dragSource) {
          this.lastConnectedDragSource = dragSource;
          return didChange;
        }
        if (didChange) {
          this.lastConnectedHandlerId = this.handlerId;
          this.lastConnectedDragSource = dragSource;
          this.lastConnectedDragSourceOptions = this.dragSourceOptions;
          this.dragSourceUnsubscribe = this.backend.connectDragSource(this.handlerId, dragSource, this.dragSourceOptions);
        }
        return didChange;
      }
      reconnectDragPreview(forceDidChange = false) {
        const dragPreview = this.dragPreview;
        const didChange = forceDidChange || this.didHandlerIdChange() || this.didConnectedDragPreviewChange() || this.didDragPreviewOptionsChange();
        if (didChange) {
          this.disconnectDragPreview();
        }
        if (!this.handlerId) {
          return;
        }
        if (!dragPreview) {
          this.lastConnectedDragPreview = dragPreview;
          return;
        }
        if (didChange) {
          this.lastConnectedHandlerId = this.handlerId;
          this.lastConnectedDragPreview = dragPreview;
          this.lastConnectedDragPreviewOptions = this.dragPreviewOptions;
          this.dragPreviewUnsubscribe = this.backend.connectDragPreview(this.handlerId, dragPreview, this.dragPreviewOptions);
        }
      }
      didHandlerIdChange() {
        return this.lastConnectedHandlerId !== this.handlerId;
      }
      didConnectedDragSourceChange() {
        return this.lastConnectedDragSource !== this.dragSource;
      }
      didConnectedDragPreviewChange() {
        return this.lastConnectedDragPreview !== this.dragPreview;
      }
      didDragSourceOptionsChange() {
        return !shallowEqual(this.lastConnectedDragSourceOptions, this.dragSourceOptions);
      }
      didDragPreviewOptionsChange() {
        return !shallowEqual(this.lastConnectedDragPreviewOptions, this.dragPreviewOptions);
      }
      disconnectDragSource() {
        if (this.dragSourceUnsubscribe) {
          this.dragSourceUnsubscribe();
          this.dragSourceUnsubscribe = void 0;
        }
      }
      disconnectDragPreview() {
        if (this.dragPreviewUnsubscribe) {
          this.dragPreviewUnsubscribe();
          this.dragPreviewUnsubscribe = void 0;
          this.dragPreviewNode = null;
          this.dragPreviewRef = null;
        }
      }
      get dragSource() {
        return this.dragSourceNode || this.dragSourceRef && this.dragSourceRef.current;
      }
      get dragPreview() {
        return this.dragPreviewNode || this.dragPreviewRef && this.dragPreviewRef.current;
      }
      clearDragSource() {
        this.dragSourceNode = null;
        this.dragSourceRef = null;
      }
      clearDragPreview() {
        this.dragPreviewNode = null;
        this.dragPreviewRef = null;
      }
      constructor(backend) {
        this.hooks = wrapConnectorHooks({
          dragSource: (node, options) => {
            this.clearDragSource();
            this.dragSourceOptions = options || null;
            if (isRef(node)) {
              this.dragSourceRef = node;
            } else {
              this.dragSourceNode = node;
            }
            this.reconnectDragSource();
          },
          dragPreview: (node, options) => {
            this.clearDragPreview();
            this.dragPreviewOptions = options || null;
            if (isRef(node)) {
              this.dragPreviewRef = node;
            } else {
              this.dragPreviewNode = node;
            }
            this.reconnectDragPreview();
          }
        });
        this.handlerId = null;
        this.dragSourceRef = null;
        this.dragSourceOptionsInternal = null;
        this.dragPreviewRef = null;
        this.dragPreviewOptionsInternal = null;
        this.lastConnectedHandlerId = null;
        this.lastConnectedDragSource = null;
        this.lastConnectedDragSourceOptions = null;
        this.lastConnectedDragPreview = null;
        this.lastConnectedDragPreviewOptions = null;
        this.backend = backend;
      }
    };
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/internals/TargetConnector.js
var TargetConnector;
var init_TargetConnector = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/internals/TargetConnector.js"() {
    init_dist8();
    init_isRef();
    init_wrapConnectorHooks();
    TargetConnector = class {
      get connectTarget() {
        return this.dropTarget;
      }
      reconnect() {
        const didChange = this.didHandlerIdChange() || this.didDropTargetChange() || this.didOptionsChange();
        if (didChange) {
          this.disconnectDropTarget();
        }
        const dropTarget = this.dropTarget;
        if (!this.handlerId) {
          return;
        }
        if (!dropTarget) {
          this.lastConnectedDropTarget = dropTarget;
          return;
        }
        if (didChange) {
          this.lastConnectedHandlerId = this.handlerId;
          this.lastConnectedDropTarget = dropTarget;
          this.lastConnectedDropTargetOptions = this.dropTargetOptions;
          this.unsubscribeDropTarget = this.backend.connectDropTarget(this.handlerId, dropTarget, this.dropTargetOptions);
        }
      }
      receiveHandlerId(newHandlerId) {
        if (newHandlerId === this.handlerId) {
          return;
        }
        this.handlerId = newHandlerId;
        this.reconnect();
      }
      get dropTargetOptions() {
        return this.dropTargetOptionsInternal;
      }
      set dropTargetOptions(options) {
        this.dropTargetOptionsInternal = options;
      }
      didHandlerIdChange() {
        return this.lastConnectedHandlerId !== this.handlerId;
      }
      didDropTargetChange() {
        return this.lastConnectedDropTarget !== this.dropTarget;
      }
      didOptionsChange() {
        return !shallowEqual(this.lastConnectedDropTargetOptions, this.dropTargetOptions);
      }
      disconnectDropTarget() {
        if (this.unsubscribeDropTarget) {
          this.unsubscribeDropTarget();
          this.unsubscribeDropTarget = void 0;
        }
      }
      get dropTarget() {
        return this.dropTargetNode || this.dropTargetRef && this.dropTargetRef.current;
      }
      clearDropTarget() {
        this.dropTargetRef = null;
        this.dropTargetNode = null;
      }
      constructor(backend) {
        this.hooks = wrapConnectorHooks({
          dropTarget: (node, options) => {
            this.clearDropTarget();
            this.dropTargetOptions = options;
            if (isRef(node)) {
              this.dropTargetRef = node;
            } else {
              this.dropTargetNode = node;
            }
            this.reconnect();
          }
        });
        this.handlerId = null;
        this.dropTargetRef = null;
        this.dropTargetOptionsInternal = null;
        this.lastConnectedHandlerId = null;
        this.lastConnectedDropTarget = null;
        this.lastConnectedDropTargetOptions = null;
        this.backend = backend;
      }
    };
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/internals/index.js
var init_internals = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/internals/index.js"() {
    init_DragSourceMonitorImpl();
    init_DropTargetMonitorImpl();
    init_registration();
    init_SourceConnector();
    init_TargetConnector();
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDragDropManager.js
function useDragDropManager() {
  const { dragDropManager } = (0, import_react9.useContext)(DndContext);
  invariant(dragDropManager != null, "Expected drag drop context");
  return dragDropManager;
}
var import_react9;
var init_useDragDropManager = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDragDropManager.js"() {
    init_dist2();
    import_react9 = __toESM(require_react(), 1);
    init_core();
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrag/useDragSourceConnector.js
function useDragSourceConnector(dragSourceOptions, dragPreviewOptions) {
  const manager = useDragDropManager();
  const connector = (0, import_react10.useMemo)(
    () => new SourceConnector(manager.getBackend()),
    [
      manager
    ]
  );
  useIsomorphicLayoutEffect(() => {
    connector.dragSourceOptions = dragSourceOptions || null;
    connector.reconnect();
    return () => connector.disconnectDragSource();
  }, [
    connector,
    dragSourceOptions
  ]);
  useIsomorphicLayoutEffect(() => {
    connector.dragPreviewOptions = dragPreviewOptions || null;
    connector.reconnect();
    return () => connector.disconnectDragPreview();
  }, [
    connector,
    dragPreviewOptions
  ]);
  return connector;
}
var import_react10;
var init_useDragSourceConnector = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrag/useDragSourceConnector.js"() {
    import_react10 = __toESM(require_react(), 1);
    init_internals();
    init_useDragDropManager();
    init_useIsomorphicLayoutEffect();
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrag/useDragSourceMonitor.js
function useDragSourceMonitor() {
  const manager = useDragDropManager();
  return (0, import_react11.useMemo)(
    () => new DragSourceMonitorImpl(manager),
    [
      manager
    ]
  );
}
var import_react11;
var init_useDragSourceMonitor = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrag/useDragSourceMonitor.js"() {
    import_react11 = __toESM(require_react(), 1);
    init_internals();
    init_useDragDropManager();
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrag/DragSourceImpl.js
var DragSourceImpl;
var init_DragSourceImpl = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrag/DragSourceImpl.js"() {
    DragSourceImpl = class {
      beginDrag() {
        const spec = this.spec;
        const monitor = this.monitor;
        let result = null;
        if (typeof spec.item === "object") {
          result = spec.item;
        } else if (typeof spec.item === "function") {
          result = spec.item(monitor);
        } else {
          result = {};
        }
        return result !== null && result !== void 0 ? result : null;
      }
      canDrag() {
        const spec = this.spec;
        const monitor = this.monitor;
        if (typeof spec.canDrag === "boolean") {
          return spec.canDrag;
        } else if (typeof spec.canDrag === "function") {
          return spec.canDrag(monitor);
        } else {
          return true;
        }
      }
      isDragging(globalMonitor, target) {
        const spec = this.spec;
        const monitor = this.monitor;
        const { isDragging } = spec;
        return isDragging ? isDragging(monitor) : target === globalMonitor.getSourceId();
      }
      endDrag() {
        const spec = this.spec;
        const monitor = this.monitor;
        const connector = this.connector;
        const { end } = spec;
        if (end) {
          end(monitor.getItem(), monitor);
        }
        connector.reconnect();
      }
      constructor(spec, monitor, connector) {
        this.spec = spec;
        this.monitor = monitor;
        this.connector = connector;
      }
    };
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrag/useDragSource.js
function useDragSource(spec, monitor, connector) {
  const handler = (0, import_react12.useMemo)(
    () => new DragSourceImpl(spec, monitor, connector),
    [
      monitor,
      connector
    ]
  );
  (0, import_react12.useEffect)(() => {
    handler.spec = spec;
  }, [
    spec
  ]);
  return handler;
}
var import_react12;
var init_useDragSource = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrag/useDragSource.js"() {
    import_react12 = __toESM(require_react(), 1);
    init_DragSourceImpl();
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrag/useDragType.js
function useDragType(spec) {
  return (0, import_react13.useMemo)(() => {
    const result = spec.type;
    invariant(result != null, "spec.type must be defined");
    return result;
  }, [
    spec
  ]);
}
var import_react13;
var init_useDragType = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrag/useDragType.js"() {
    init_dist2();
    import_react13 = __toESM(require_react(), 1);
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrag/useRegisteredDragSource.js
function useRegisteredDragSource(spec, monitor, connector) {
  const manager = useDragDropManager();
  const handler = useDragSource(spec, monitor, connector);
  const itemType = useDragType(spec);
  useIsomorphicLayoutEffect(function registerDragSource() {
    if (itemType != null) {
      const [handlerId, unregister] = registerSource(itemType, handler, manager);
      monitor.receiveHandlerId(handlerId);
      connector.receiveHandlerId(handlerId);
      return unregister;
    }
    return;
  }, [
    manager,
    monitor,
    connector,
    handler,
    itemType
  ]);
}
var init_useRegisteredDragSource = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrag/useRegisteredDragSource.js"() {
    init_internals();
    init_useDragDropManager();
    init_useIsomorphicLayoutEffect();
    init_useDragSource();
    init_useDragType();
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrag/useDrag.js
function useDrag(specArg, deps) {
  const spec = useOptionalFactory(specArg, deps);
  invariant(!spec.begin, `useDrag::spec.begin was deprecated in v14. Replace spec.begin() with spec.item(). (see more here - https://react-dnd.github.io/react-dnd/docs/api/use-drag)`);
  const monitor = useDragSourceMonitor();
  const connector = useDragSourceConnector(spec.options, spec.previewOptions);
  useRegisteredDragSource(spec, monitor, connector);
  return [
    useCollectedProps(spec.collect, monitor, connector),
    useConnectDragSource(connector),
    useConnectDragPreview(connector)
  ];
}
var init_useDrag = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrag/useDrag.js"() {
    init_dist2();
    init_useCollectedProps();
    init_useOptionalFactory();
    init_connectors();
    init_useDragSourceConnector();
    init_useDragSourceMonitor();
    init_useRegisteredDragSource();
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrag/index.js
var init_useDrag2 = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrag/index.js"() {
    init_useDrag();
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDragLayer.js
function useDragLayer(collect) {
  const dragDropManager = useDragDropManager();
  const monitor = dragDropManager.getMonitor();
  const [collected, updateCollected] = useCollector(monitor, collect);
  (0, import_react14.useEffect)(
    () => monitor.subscribeToOffsetChange(updateCollected)
  );
  (0, import_react14.useEffect)(
    () => monitor.subscribeToStateChange(updateCollected)
  );
  return collected;
}
var import_react14;
var init_useDragLayer = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDragLayer.js"() {
    import_react14 = __toESM(require_react(), 1);
    init_useCollector();
    init_useDragDropManager();
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrop/connectors.js
function useConnectDropTarget(connector) {
  return (0, import_react15.useMemo)(
    () => connector.hooks.dropTarget(),
    [
      connector
    ]
  );
}
var import_react15;
var init_connectors2 = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrop/connectors.js"() {
    import_react15 = __toESM(require_react(), 1);
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrop/useDropTargetConnector.js
function useDropTargetConnector(options) {
  const manager = useDragDropManager();
  const connector = (0, import_react16.useMemo)(
    () => new TargetConnector(manager.getBackend()),
    [
      manager
    ]
  );
  useIsomorphicLayoutEffect(() => {
    connector.dropTargetOptions = options || null;
    connector.reconnect();
    return () => connector.disconnectDropTarget();
  }, [
    options
  ]);
  return connector;
}
var import_react16;
var init_useDropTargetConnector = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrop/useDropTargetConnector.js"() {
    import_react16 = __toESM(require_react(), 1);
    init_internals();
    init_useDragDropManager();
    init_useIsomorphicLayoutEffect();
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrop/useDropTargetMonitor.js
function useDropTargetMonitor() {
  const manager = useDragDropManager();
  return (0, import_react17.useMemo)(
    () => new DropTargetMonitorImpl(manager),
    [
      manager
    ]
  );
}
var import_react17;
var init_useDropTargetMonitor = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrop/useDropTargetMonitor.js"() {
    import_react17 = __toESM(require_react(), 1);
    init_internals();
    init_useDragDropManager();
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrop/useAccept.js
function useAccept(spec) {
  const { accept } = spec;
  return (0, import_react18.useMemo)(() => {
    invariant(spec.accept != null, "accept must be defined");
    return Array.isArray(accept) ? accept : [
      accept
    ];
  }, [
    accept
  ]);
}
var import_react18;
var init_useAccept = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrop/useAccept.js"() {
    init_dist2();
    import_react18 = __toESM(require_react(), 1);
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrop/DropTargetImpl.js
var DropTargetImpl;
var init_DropTargetImpl = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrop/DropTargetImpl.js"() {
    DropTargetImpl = class {
      canDrop() {
        const spec = this.spec;
        const monitor = this.monitor;
        return spec.canDrop ? spec.canDrop(monitor.getItem(), monitor) : true;
      }
      hover() {
        const spec = this.spec;
        const monitor = this.monitor;
        if (spec.hover) {
          spec.hover(monitor.getItem(), monitor);
        }
      }
      drop() {
        const spec = this.spec;
        const monitor = this.monitor;
        if (spec.drop) {
          return spec.drop(monitor.getItem(), monitor);
        }
        return;
      }
      constructor(spec, monitor) {
        this.spec = spec;
        this.monitor = monitor;
      }
    };
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrop/useDropTarget.js
function useDropTarget(spec, monitor) {
  const dropTarget = (0, import_react19.useMemo)(
    () => new DropTargetImpl(spec, monitor),
    [
      monitor
    ]
  );
  (0, import_react19.useEffect)(() => {
    dropTarget.spec = spec;
  }, [
    spec
  ]);
  return dropTarget;
}
var import_react19;
var init_useDropTarget = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrop/useDropTarget.js"() {
    import_react19 = __toESM(require_react(), 1);
    init_DropTargetImpl();
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrop/useRegisteredDropTarget.js
function useRegisteredDropTarget(spec, monitor, connector) {
  const manager = useDragDropManager();
  const dropTarget = useDropTarget(spec, monitor);
  const accept = useAccept(spec);
  useIsomorphicLayoutEffect(function registerDropTarget() {
    const [handlerId, unregister] = registerTarget(accept, dropTarget, manager);
    monitor.receiveHandlerId(handlerId);
    connector.receiveHandlerId(handlerId);
    return unregister;
  }, [
    manager,
    monitor,
    dropTarget,
    connector,
    accept.map(
      (a4) => a4.toString()
    ).join("|")
  ]);
}
var init_useRegisteredDropTarget = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrop/useRegisteredDropTarget.js"() {
    init_internals();
    init_useDragDropManager();
    init_useIsomorphicLayoutEffect();
    init_useAccept();
    init_useDropTarget();
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrop/useDrop.js
function useDrop(specArg, deps) {
  const spec = useOptionalFactory(specArg, deps);
  const monitor = useDropTargetMonitor();
  const connector = useDropTargetConnector(spec.options);
  useRegisteredDropTarget(spec, monitor, connector);
  return [
    useCollectedProps(spec.collect, monitor, connector),
    useConnectDropTarget(connector)
  ];
}
var init_useDrop = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrop/useDrop.js"() {
    init_useCollectedProps();
    init_useOptionalFactory();
    init_connectors2();
    init_useDropTargetConnector();
    init_useDropTargetMonitor();
    init_useRegisteredDropTarget();
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrop/index.js
var init_useDrop2 = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/useDrop/index.js"() {
    init_useDrop();
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/index.js
var init_hooks = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/hooks/index.js"() {
    init_types3();
    init_useDrag2();
    init_useDragDropManager();
    init_useDragLayer();
    init_useDrop2();
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/types/connectors.js
var init_connectors3 = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/types/connectors.js"() {
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/types/monitors.js
var init_monitors = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/types/monitors.js"() {
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/types/options.js
var init_options = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/types/options.js"() {
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/types/index.js
var init_types4 = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/types/index.js"() {
    init_connectors3();
    init_monitors();
    init_options();
  }
});

// ../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/index.js
var dist_exports2 = {};
__export(dist_exports2, {
  DndContext: () => DndContext,
  DndProvider: () => DndProvider,
  DragPreviewImage: () => DragPreviewImage,
  useDrag: () => useDrag,
  useDragDropManager: () => useDragDropManager,
  useDragLayer: () => useDragLayer,
  useDrop: () => useDrop
});
var init_dist9 = __esm({
  "../node_modules/.pnpm/react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6/node_modules/react-dnd/dist/index.js"() {
    init_core();
    init_hooks();
    init_types4();
  }
});

// ../node_modules/.pnpm/react-dnd-preview@8.1.2_react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6__react@19.2.6/node_modules/react-dnd-preview/dist/index.js
var import_react20, import_react21, import_jsx_runtime2, i, l2, m2, P2, f2, d2, c3, x2, a2, v2;
var init_dist10 = __esm({
  "../node_modules/.pnpm/react-dnd-preview@8.1.2_react-dnd@16.0.1_@types+node@25.9.1_@types+react@19.2.15_react@19.2.6__react@19.2.6/node_modules/react-dnd-preview/dist/index.js"() {
    import_react20 = __toESM(require_react(), 1);
    import_react21 = __toESM(require_react(), 1);
    init_dist9();
    import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
    i = (0, import_react20.createContext)(void 0);
    l2 = (e, t2) => ({ x: e.x - t2.x, y: e.y - t2.y });
    m2 = (e, t2) => ({ x: e.x + t2.x, y: e.y + t2.y });
    P2 = (e) => {
      let t2 = e.getInitialClientOffset(), n = e.getInitialSourceClientOffset();
      return t2 === null || n === null ? { x: 0, y: 0 } : l2(t2, n);
    };
    f2 = (e, t2) => {
      switch (e) {
        case "left":
        case "top-start":
        case "bottom-start":
          return 0;
        case "right":
        case "top-end":
        case "bottom-end":
          return t2.width;
        default:
          return t2.width / 2;
      }
    };
    d2 = (e, t2) => {
      switch (e) {
        case "top":
        case "top-start":
        case "top-end":
          return 0;
        case "bottom":
        case "bottom-start":
        case "bottom-end":
          return t2.height;
        default:
          return t2.height / 2;
      }
    };
    c3 = (e, t2, n = "center", r = { x: 0, y: 0 }) => {
      let o = e.getClientOffset();
      if (o === null) return null;
      if (!t2.current || !t2.current.getBoundingClientRect) return l2(o, P2(e));
      let s3 = t2.current.getBoundingClientRect(), p2 = { x: f2(n, s3), y: d2(n, s3) };
      return m2(l2(o, p2), r);
    };
    x2 = (e) => {
      let t2 = `translate(${e.x.toFixed(1)}px, ${e.y.toFixed(1)}px)`;
      return { pointerEvents: "none", position: "fixed", top: 0, left: 0, transform: t2, WebkitTransform: t2 };
    };
    a2 = (e) => {
      let t2 = (0, import_react21.useRef)(null), n = useDragLayer((r) => ({ currentOffset: c3(r, t2, e == null ? void 0 : e.placement, e == null ? void 0 : e.padding), isDragging: r.isDragging(), itemType: r.getItemType(), item: r.getItem(), monitor: r }));
      return !n.isDragging || n.currentOffset === null ? { display: false } : { display: true, itemType: n.itemType, item: n.item, style: x2(n.currentOffset), monitor: n.monitor, ref: t2 };
    };
    v2 = (e) => {
      let t2 = a2({ placement: e.placement, padding: e.padding });
      if (!t2.display) return null;
      let { display: n, ...r } = t2, o;
      return "children" in e ? typeof e.children == "function" ? o = e.children(r) : o = e.children : o = e.generator(r), (0, import_jsx_runtime2.jsx)(i.Provider, { value: r, children: o });
    };
  }
});

// ../node_modules/.pnpm/react-dnd-multi-backend@8.1.2_dnd-core@16.0.1_react-dnd@16.0.1_@types+node@25.9.1_@type_27845ccbeec8b47b384e517a0fb04d46/node_modules/react-dnd-multi-backend/dist/index.js
var dist_exports3 = {};
__export(dist_exports3, {
  DndProvider: () => g,
  HTML5DragTransition: () => O,
  MouseTransition: () => C,
  MultiBackend: () => S,
  PointerTransition: () => U,
  Preview: () => b,
  PreviewContext: () => i,
  TouchTransition: () => L,
  createTransition: () => y,
  useMultiDrag: () => ee,
  useMultiDrop: () => ne,
  usePreview: () => ie
});
var import_react22, import_jsx_runtime3, import_react23, import_react_dom, import_react24, import_jsx_runtime4, import_react25, i2, g, s2, b, O2, a3, ee, ne, ie;
var init_dist11 = __esm({
  "../node_modules/.pnpm/react-dnd-multi-backend@8.1.2_dnd-core@16.0.1_react-dnd@16.0.1_@types+node@25.9.1_@type_27845ccbeec8b47b384e517a0fb04d46/node_modules/react-dnd-multi-backend/dist/index.js"() {
    init_dist4();
    init_dist4();
    import_react22 = __toESM(require_react(), 1);
    init_dist9();
    import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
    import_react23 = __toESM(require_react(), 1);
    init_dist10();
    import_react_dom = __toESM(require_react_dom(), 1);
    import_react24 = __toESM(require_react(), 1);
    init_dist9();
    import_jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
    init_dist9();
    import_react25 = __toESM(require_react(), 1);
    init_dist9();
    init_dist9();
    init_dist10();
    i2 = (0, import_react22.createContext)(null);
    g = ({ portal: e, ...t2 }) => {
      let [r, o] = (0, import_react22.useState)(null);
      return (0, import_jsx_runtime3.jsxs)(i2.Provider, { value: e != null ? e : r, children: [(0, import_jsx_runtime3.jsx)(DndProvider, { backend: S, ...t2 }), e ? null : (0, import_jsx_runtime3.jsx)("div", { ref: o })] });
    };
    s2 = () => {
      let [e, t2] = (0, import_react24.useState)(false), r = (0, import_react24.useContext)(DndContext);
      return (0, import_react24.useEffect)(() => {
        var _a;
        let o = (_a = r == null ? void 0 : r.dragDropManager) == null ? void 0 : _a.getBackend(), n = { backendChanged: (p2) => {
          t2(p2.previewEnabled());
        } };
        return t2(o.previewEnabled()), o.previewsList().register(n), () => {
          o.previewsList().unregister(n);
        };
      }, [r, r.dragDropManager]), e;
    };
    b = (e) => {
      let t2 = s2(), r = (0, import_react23.useContext)(i2);
      if (!t2) return null;
      let o = (0, import_jsx_runtime4.jsx)(v2, { ...e });
      return r !== null ? (0, import_react_dom.createPortal)(o, r) : o;
    };
    b.Context = i;
    O2 = (e, t2, r, o) => {
      let n = r.getBackend();
      r.receiveBackend(o);
      let p2 = t2(e);
      return r.receiveBackend(n), p2;
    };
    a3 = (e, t2) => {
      var _a;
      let r = (0, import_react25.useContext)(DndContext), o = (_a = r == null ? void 0 : r.dragDropManager) == null ? void 0 : _a.getBackend();
      if (o === void 0) throw new Error("could not find backend, make sure you are using a <DndProvider />");
      let n = t2(e), p2 = {}, d3 = o.backendsList();
      for (let u2 of d3) p2[u2.id] = O2(e, t2, r.dragDropManager, u2.instance);
      return [n, p2];
    };
    ee = (e) => a3(e, useDrag);
    ne = (e) => a3(e, useDrop);
    ie = (e) => {
      let t2 = s2(), r = a2(e);
      return t2 ? r : { display: false };
    };
  }
});

// ../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/rng.js
var require_rng = __commonJS({
  "../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/rng.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = rng;
    var getRandomValues;
    var rnds8 = new Uint8Array(16);
    function rng() {
      if (!getRandomValues) {
        getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
        if (!getRandomValues) {
          throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
        }
      }
      return getRandomValues(rnds8);
    }
  }
});

// ../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/regex.js
var require_regex = __commonJS({
  "../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/regex.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
    exports.default = _default;
  }
});

// ../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/validate.js
var require_validate = __commonJS({
  "../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/validate.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _regex = _interopRequireDefault(require_regex());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function validate(uuid) {
      return typeof uuid === "string" && _regex.default.test(uuid);
    }
    var _default = validate;
    exports.default = _default;
  }
});

// ../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/stringify.js
var require_stringify = __commonJS({
  "../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/stringify.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    exports.unsafeStringify = unsafeStringify;
    var _validate = _interopRequireDefault(require_validate());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var byteToHex = [];
    for (let i3 = 0; i3 < 256; ++i3) {
      byteToHex.push((i3 + 256).toString(16).slice(1));
    }
    function unsafeStringify(arr, offset = 0) {
      return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
    }
    function stringify(arr, offset = 0) {
      const uuid = unsafeStringify(arr, offset);
      if (!(0, _validate.default)(uuid)) {
        throw TypeError("Stringified UUID is invalid");
      }
      return uuid;
    }
    var _default = stringify;
    exports.default = _default;
  }
});

// ../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/v1.js
var require_v1 = __commonJS({
  "../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/v1.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _rng = _interopRequireDefault(require_rng());
    var _stringify = require_stringify();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var _nodeId;
    var _clockseq;
    var _lastMSecs = 0;
    var _lastNSecs = 0;
    function v1(options, buf, offset) {
      let i3 = buf && offset || 0;
      const b2 = buf || new Array(16);
      options = options || {};
      let node = options.node || _nodeId;
      let clockseq = options.clockseq !== void 0 ? options.clockseq : _clockseq;
      if (node == null || clockseq == null) {
        const seedBytes = options.random || (options.rng || _rng.default)();
        if (node == null) {
          node = _nodeId = [seedBytes[0] | 1, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
        }
        if (clockseq == null) {
          clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
        }
      }
      let msecs = options.msecs !== void 0 ? options.msecs : Date.now();
      let nsecs = options.nsecs !== void 0 ? options.nsecs : _lastNSecs + 1;
      const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
      if (dt < 0 && options.clockseq === void 0) {
        clockseq = clockseq + 1 & 16383;
      }
      if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === void 0) {
        nsecs = 0;
      }
      if (nsecs >= 1e4) {
        throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
      }
      _lastMSecs = msecs;
      _lastNSecs = nsecs;
      _clockseq = clockseq;
      msecs += 122192928e5;
      const tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
      b2[i3++] = tl >>> 24 & 255;
      b2[i3++] = tl >>> 16 & 255;
      b2[i3++] = tl >>> 8 & 255;
      b2[i3++] = tl & 255;
      const tmh = msecs / 4294967296 * 1e4 & 268435455;
      b2[i3++] = tmh >>> 8 & 255;
      b2[i3++] = tmh & 255;
      b2[i3++] = tmh >>> 24 & 15 | 16;
      b2[i3++] = tmh >>> 16 & 255;
      b2[i3++] = clockseq >>> 8 | 128;
      b2[i3++] = clockseq & 255;
      for (let n = 0; n < 6; ++n) {
        b2[i3 + n] = node[n];
      }
      return buf || (0, _stringify.unsafeStringify)(b2);
    }
    var _default = v1;
    exports.default = _default;
  }
});

// ../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/parse.js
var require_parse = __commonJS({
  "../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/parse.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _validate = _interopRequireDefault(require_validate());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function parse(uuid) {
      if (!(0, _validate.default)(uuid)) {
        throw TypeError("Invalid UUID");
      }
      let v4;
      const arr = new Uint8Array(16);
      arr[0] = (v4 = parseInt(uuid.slice(0, 8), 16)) >>> 24;
      arr[1] = v4 >>> 16 & 255;
      arr[2] = v4 >>> 8 & 255;
      arr[3] = v4 & 255;
      arr[4] = (v4 = parseInt(uuid.slice(9, 13), 16)) >>> 8;
      arr[5] = v4 & 255;
      arr[6] = (v4 = parseInt(uuid.slice(14, 18), 16)) >>> 8;
      arr[7] = v4 & 255;
      arr[8] = (v4 = parseInt(uuid.slice(19, 23), 16)) >>> 8;
      arr[9] = v4 & 255;
      arr[10] = (v4 = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
      arr[11] = v4 / 4294967296 & 255;
      arr[12] = v4 >>> 24 & 255;
      arr[13] = v4 >>> 16 & 255;
      arr[14] = v4 >>> 8 & 255;
      arr[15] = v4 & 255;
      return arr;
    }
    var _default = parse;
    exports.default = _default;
  }
});

// ../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/v35.js
var require_v35 = __commonJS({
  "../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/v35.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.URL = exports.DNS = void 0;
    exports.default = v35;
    var _stringify = require_stringify();
    var _parse = _interopRequireDefault(require_parse());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function stringToBytes(str) {
      str = unescape(encodeURIComponent(str));
      const bytes = [];
      for (let i3 = 0; i3 < str.length; ++i3) {
        bytes.push(str.charCodeAt(i3));
      }
      return bytes;
    }
    var DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    exports.DNS = DNS;
    var URL2 = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
    exports.URL = URL2;
    function v35(name, version, hashfunc) {
      function generateUUID(value, namespace, buf, offset) {
        var _namespace;
        if (typeof value === "string") {
          value = stringToBytes(value);
        }
        if (typeof namespace === "string") {
          namespace = (0, _parse.default)(namespace);
        }
        if (((_namespace = namespace) === null || _namespace === void 0 ? void 0 : _namespace.length) !== 16) {
          throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
        }
        let bytes = new Uint8Array(16 + value.length);
        bytes.set(namespace);
        bytes.set(value, namespace.length);
        bytes = hashfunc(bytes);
        bytes[6] = bytes[6] & 15 | version;
        bytes[8] = bytes[8] & 63 | 128;
        if (buf) {
          offset = offset || 0;
          for (let i3 = 0; i3 < 16; ++i3) {
            buf[offset + i3] = bytes[i3];
          }
          return buf;
        }
        return (0, _stringify.unsafeStringify)(bytes);
      }
      try {
        generateUUID.name = name;
      } catch (err) {
      }
      generateUUID.DNS = DNS;
      generateUUID.URL = URL2;
      return generateUUID;
    }
  }
});

// ../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/md5.js
var require_md5 = __commonJS({
  "../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/md5.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    function md5(bytes) {
      if (typeof bytes === "string") {
        const msg = unescape(encodeURIComponent(bytes));
        bytes = new Uint8Array(msg.length);
        for (let i3 = 0; i3 < msg.length; ++i3) {
          bytes[i3] = msg.charCodeAt(i3);
        }
      }
      return md5ToHexEncodedArray(wordsToMd5(bytesToWords(bytes), bytes.length * 8));
    }
    function md5ToHexEncodedArray(input) {
      const output = [];
      const length32 = input.length * 32;
      const hexTab = "0123456789abcdef";
      for (let i3 = 0; i3 < length32; i3 += 8) {
        const x4 = input[i3 >> 5] >>> i3 % 32 & 255;
        const hex = parseInt(hexTab.charAt(x4 >>> 4 & 15) + hexTab.charAt(x4 & 15), 16);
        output.push(hex);
      }
      return output;
    }
    function getOutputLength(inputLength8) {
      return (inputLength8 + 64 >>> 9 << 4) + 14 + 1;
    }
    function wordsToMd5(x4, len) {
      x4[len >> 5] |= 128 << len % 32;
      x4[getOutputLength(len) - 1] = len;
      let a4 = 1732584193;
      let b2 = -271733879;
      let c5 = -1732584194;
      let d3 = 271733878;
      for (let i3 = 0; i3 < x4.length; i3 += 16) {
        const olda = a4;
        const oldb = b2;
        const oldc = c5;
        const oldd = d3;
        a4 = md5ff(a4, b2, c5, d3, x4[i3], 7, -680876936);
        d3 = md5ff(d3, a4, b2, c5, x4[i3 + 1], 12, -389564586);
        c5 = md5ff(c5, d3, a4, b2, x4[i3 + 2], 17, 606105819);
        b2 = md5ff(b2, c5, d3, a4, x4[i3 + 3], 22, -1044525330);
        a4 = md5ff(a4, b2, c5, d3, x4[i3 + 4], 7, -176418897);
        d3 = md5ff(d3, a4, b2, c5, x4[i3 + 5], 12, 1200080426);
        c5 = md5ff(c5, d3, a4, b2, x4[i3 + 6], 17, -1473231341);
        b2 = md5ff(b2, c5, d3, a4, x4[i3 + 7], 22, -45705983);
        a4 = md5ff(a4, b2, c5, d3, x4[i3 + 8], 7, 1770035416);
        d3 = md5ff(d3, a4, b2, c5, x4[i3 + 9], 12, -1958414417);
        c5 = md5ff(c5, d3, a4, b2, x4[i3 + 10], 17, -42063);
        b2 = md5ff(b2, c5, d3, a4, x4[i3 + 11], 22, -1990404162);
        a4 = md5ff(a4, b2, c5, d3, x4[i3 + 12], 7, 1804603682);
        d3 = md5ff(d3, a4, b2, c5, x4[i3 + 13], 12, -40341101);
        c5 = md5ff(c5, d3, a4, b2, x4[i3 + 14], 17, -1502002290);
        b2 = md5ff(b2, c5, d3, a4, x4[i3 + 15], 22, 1236535329);
        a4 = md5gg(a4, b2, c5, d3, x4[i3 + 1], 5, -165796510);
        d3 = md5gg(d3, a4, b2, c5, x4[i3 + 6], 9, -1069501632);
        c5 = md5gg(c5, d3, a4, b2, x4[i3 + 11], 14, 643717713);
        b2 = md5gg(b2, c5, d3, a4, x4[i3], 20, -373897302);
        a4 = md5gg(a4, b2, c5, d3, x4[i3 + 5], 5, -701558691);
        d3 = md5gg(d3, a4, b2, c5, x4[i3 + 10], 9, 38016083);
        c5 = md5gg(c5, d3, a4, b2, x4[i3 + 15], 14, -660478335);
        b2 = md5gg(b2, c5, d3, a4, x4[i3 + 4], 20, -405537848);
        a4 = md5gg(a4, b2, c5, d3, x4[i3 + 9], 5, 568446438);
        d3 = md5gg(d3, a4, b2, c5, x4[i3 + 14], 9, -1019803690);
        c5 = md5gg(c5, d3, a4, b2, x4[i3 + 3], 14, -187363961);
        b2 = md5gg(b2, c5, d3, a4, x4[i3 + 8], 20, 1163531501);
        a4 = md5gg(a4, b2, c5, d3, x4[i3 + 13], 5, -1444681467);
        d3 = md5gg(d3, a4, b2, c5, x4[i3 + 2], 9, -51403784);
        c5 = md5gg(c5, d3, a4, b2, x4[i3 + 7], 14, 1735328473);
        b2 = md5gg(b2, c5, d3, a4, x4[i3 + 12], 20, -1926607734);
        a4 = md5hh(a4, b2, c5, d3, x4[i3 + 5], 4, -378558);
        d3 = md5hh(d3, a4, b2, c5, x4[i3 + 8], 11, -2022574463);
        c5 = md5hh(c5, d3, a4, b2, x4[i3 + 11], 16, 1839030562);
        b2 = md5hh(b2, c5, d3, a4, x4[i3 + 14], 23, -35309556);
        a4 = md5hh(a4, b2, c5, d3, x4[i3 + 1], 4, -1530992060);
        d3 = md5hh(d3, a4, b2, c5, x4[i3 + 4], 11, 1272893353);
        c5 = md5hh(c5, d3, a4, b2, x4[i3 + 7], 16, -155497632);
        b2 = md5hh(b2, c5, d3, a4, x4[i3 + 10], 23, -1094730640);
        a4 = md5hh(a4, b2, c5, d3, x4[i3 + 13], 4, 681279174);
        d3 = md5hh(d3, a4, b2, c5, x4[i3], 11, -358537222);
        c5 = md5hh(c5, d3, a4, b2, x4[i3 + 3], 16, -722521979);
        b2 = md5hh(b2, c5, d3, a4, x4[i3 + 6], 23, 76029189);
        a4 = md5hh(a4, b2, c5, d3, x4[i3 + 9], 4, -640364487);
        d3 = md5hh(d3, a4, b2, c5, x4[i3 + 12], 11, -421815835);
        c5 = md5hh(c5, d3, a4, b2, x4[i3 + 15], 16, 530742520);
        b2 = md5hh(b2, c5, d3, a4, x4[i3 + 2], 23, -995338651);
        a4 = md5ii(a4, b2, c5, d3, x4[i3], 6, -198630844);
        d3 = md5ii(d3, a4, b2, c5, x4[i3 + 7], 10, 1126891415);
        c5 = md5ii(c5, d3, a4, b2, x4[i3 + 14], 15, -1416354905);
        b2 = md5ii(b2, c5, d3, a4, x4[i3 + 5], 21, -57434055);
        a4 = md5ii(a4, b2, c5, d3, x4[i3 + 12], 6, 1700485571);
        d3 = md5ii(d3, a4, b2, c5, x4[i3 + 3], 10, -1894986606);
        c5 = md5ii(c5, d3, a4, b2, x4[i3 + 10], 15, -1051523);
        b2 = md5ii(b2, c5, d3, a4, x4[i3 + 1], 21, -2054922799);
        a4 = md5ii(a4, b2, c5, d3, x4[i3 + 8], 6, 1873313359);
        d3 = md5ii(d3, a4, b2, c5, x4[i3 + 15], 10, -30611744);
        c5 = md5ii(c5, d3, a4, b2, x4[i3 + 6], 15, -1560198380);
        b2 = md5ii(b2, c5, d3, a4, x4[i3 + 13], 21, 1309151649);
        a4 = md5ii(a4, b2, c5, d3, x4[i3 + 4], 6, -145523070);
        d3 = md5ii(d3, a4, b2, c5, x4[i3 + 11], 10, -1120210379);
        c5 = md5ii(c5, d3, a4, b2, x4[i3 + 2], 15, 718787259);
        b2 = md5ii(b2, c5, d3, a4, x4[i3 + 9], 21, -343485551);
        a4 = safeAdd(a4, olda);
        b2 = safeAdd(b2, oldb);
        c5 = safeAdd(c5, oldc);
        d3 = safeAdd(d3, oldd);
      }
      return [a4, b2, c5, d3];
    }
    function bytesToWords(input) {
      if (input.length === 0) {
        return [];
      }
      const length8 = input.length * 8;
      const output = new Uint32Array(getOutputLength(length8));
      for (let i3 = 0; i3 < length8; i3 += 8) {
        output[i3 >> 5] |= (input[i3 / 8] & 255) << i3 % 32;
      }
      return output;
    }
    function safeAdd(x4, y3) {
      const lsw = (x4 & 65535) + (y3 & 65535);
      const msw = (x4 >> 16) + (y3 >> 16) + (lsw >> 16);
      return msw << 16 | lsw & 65535;
    }
    function bitRotateLeft(num, cnt) {
      return num << cnt | num >>> 32 - cnt;
    }
    function md5cmn(q, a4, b2, x4, s3, t2) {
      return safeAdd(bitRotateLeft(safeAdd(safeAdd(a4, q), safeAdd(x4, t2)), s3), b2);
    }
    function md5ff(a4, b2, c5, d3, x4, s3, t2) {
      return md5cmn(b2 & c5 | ~b2 & d3, a4, b2, x4, s3, t2);
    }
    function md5gg(a4, b2, c5, d3, x4, s3, t2) {
      return md5cmn(b2 & d3 | c5 & ~d3, a4, b2, x4, s3, t2);
    }
    function md5hh(a4, b2, c5, d3, x4, s3, t2) {
      return md5cmn(b2 ^ c5 ^ d3, a4, b2, x4, s3, t2);
    }
    function md5ii(a4, b2, c5, d3, x4, s3, t2) {
      return md5cmn(c5 ^ (b2 | ~d3), a4, b2, x4, s3, t2);
    }
    var _default = md5;
    exports.default = _default;
  }
});

// ../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/v3.js
var require_v3 = __commonJS({
  "../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/v3.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _v = _interopRequireDefault(require_v35());
    var _md = _interopRequireDefault(require_md5());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var v32 = (0, _v.default)("v3", 48, _md.default);
    var _default = v32;
    exports.default = _default;
  }
});

// ../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/native.js
var require_native = __commonJS({
  "../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/native.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
    var _default = {
      randomUUID
    };
    exports.default = _default;
  }
});

// ../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/v4.js
var require_v4 = __commonJS({
  "../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/v4.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _native = _interopRequireDefault(require_native());
    var _rng = _interopRequireDefault(require_rng());
    var _stringify = require_stringify();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function v4(options, buf, offset) {
      if (_native.default.randomUUID && !buf && !options) {
        return _native.default.randomUUID();
      }
      options = options || {};
      const rnds = options.random || (options.rng || _rng.default)();
      rnds[6] = rnds[6] & 15 | 64;
      rnds[8] = rnds[8] & 63 | 128;
      if (buf) {
        offset = offset || 0;
        for (let i3 = 0; i3 < 16; ++i3) {
          buf[offset + i3] = rnds[i3];
        }
        return buf;
      }
      return (0, _stringify.unsafeStringify)(rnds);
    }
    var _default = v4;
    exports.default = _default;
  }
});

// ../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/sha1.js
var require_sha1 = __commonJS({
  "../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/sha1.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    function f3(s3, x4, y3, z) {
      switch (s3) {
        case 0:
          return x4 & y3 ^ ~x4 & z;
        case 1:
          return x4 ^ y3 ^ z;
        case 2:
          return x4 & y3 ^ x4 & z ^ y3 & z;
        case 3:
          return x4 ^ y3 ^ z;
      }
    }
    function ROTL(x4, n) {
      return x4 << n | x4 >>> 32 - n;
    }
    function sha1(bytes) {
      const K = [1518500249, 1859775393, 2400959708, 3395469782];
      const H = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
      if (typeof bytes === "string") {
        const msg = unescape(encodeURIComponent(bytes));
        bytes = [];
        for (let i3 = 0; i3 < msg.length; ++i3) {
          bytes.push(msg.charCodeAt(i3));
        }
      } else if (!Array.isArray(bytes)) {
        bytes = Array.prototype.slice.call(bytes);
      }
      bytes.push(128);
      const l3 = bytes.length / 4 + 2;
      const N = Math.ceil(l3 / 16);
      const M2 = new Array(N);
      for (let i3 = 0; i3 < N; ++i3) {
        const arr = new Uint32Array(16);
        for (let j = 0; j < 16; ++j) {
          arr[j] = bytes[i3 * 64 + j * 4] << 24 | bytes[i3 * 64 + j * 4 + 1] << 16 | bytes[i3 * 64 + j * 4 + 2] << 8 | bytes[i3 * 64 + j * 4 + 3];
        }
        M2[i3] = arr;
      }
      M2[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
      M2[N - 1][14] = Math.floor(M2[N - 1][14]);
      M2[N - 1][15] = (bytes.length - 1) * 8 & 4294967295;
      for (let i3 = 0; i3 < N; ++i3) {
        const W = new Uint32Array(80);
        for (let t2 = 0; t2 < 16; ++t2) {
          W[t2] = M2[i3][t2];
        }
        for (let t2 = 16; t2 < 80; ++t2) {
          W[t2] = ROTL(W[t2 - 3] ^ W[t2 - 8] ^ W[t2 - 14] ^ W[t2 - 16], 1);
        }
        let a4 = H[0];
        let b2 = H[1];
        let c5 = H[2];
        let d3 = H[3];
        let e = H[4];
        for (let t2 = 0; t2 < 80; ++t2) {
          const s3 = Math.floor(t2 / 20);
          const T2 = ROTL(a4, 5) + f3(s3, b2, c5, d3) + e + K[s3] + W[t2] >>> 0;
          e = d3;
          d3 = c5;
          c5 = ROTL(b2, 30) >>> 0;
          b2 = a4;
          a4 = T2;
        }
        H[0] = H[0] + a4 >>> 0;
        H[1] = H[1] + b2 >>> 0;
        H[2] = H[2] + c5 >>> 0;
        H[3] = H[3] + d3 >>> 0;
        H[4] = H[4] + e >>> 0;
      }
      return [H[0] >> 24 & 255, H[0] >> 16 & 255, H[0] >> 8 & 255, H[0] & 255, H[1] >> 24 & 255, H[1] >> 16 & 255, H[1] >> 8 & 255, H[1] & 255, H[2] >> 24 & 255, H[2] >> 16 & 255, H[2] >> 8 & 255, H[2] & 255, H[3] >> 24 & 255, H[3] >> 16 & 255, H[3] >> 8 & 255, H[3] & 255, H[4] >> 24 & 255, H[4] >> 16 & 255, H[4] >> 8 & 255, H[4] & 255];
    }
    var _default = sha1;
    exports.default = _default;
  }
});

// ../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/v5.js
var require_v5 = __commonJS({
  "../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/v5.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _v = _interopRequireDefault(require_v35());
    var _sha = _interopRequireDefault(require_sha1());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var v5 = (0, _v.default)("v5", 80, _sha.default);
    var _default = v5;
    exports.default = _default;
  }
});

// ../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/nil.js
var require_nil = __commonJS({
  "../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/nil.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _default = "00000000-0000-0000-0000-000000000000";
    exports.default = _default;
  }
});

// ../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/version.js
var require_version = __commonJS({
  "../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/version.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _validate = _interopRequireDefault(require_validate());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function version(uuid) {
      if (!(0, _validate.default)(uuid)) {
        throw TypeError("Invalid UUID");
      }
      return parseInt(uuid.slice(14, 15), 16);
    }
    var _default = version;
    exports.default = _default;
  }
});

// ../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/index.js
var require_commonjs_browser = __commonJS({
  "../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "NIL", {
      enumerable: true,
      get: function get2() {
        return _nil.default;
      }
    });
    Object.defineProperty(exports, "parse", {
      enumerable: true,
      get: function get2() {
        return _parse.default;
      }
    });
    Object.defineProperty(exports, "stringify", {
      enumerable: true,
      get: function get2() {
        return _stringify.default;
      }
    });
    Object.defineProperty(exports, "v1", {
      enumerable: true,
      get: function get2() {
        return _v.default;
      }
    });
    Object.defineProperty(exports, "v3", {
      enumerable: true,
      get: function get2() {
        return _v2.default;
      }
    });
    Object.defineProperty(exports, "v4", {
      enumerable: true,
      get: function get2() {
        return _v3.default;
      }
    });
    Object.defineProperty(exports, "v5", {
      enumerable: true,
      get: function get2() {
        return _v4.default;
      }
    });
    Object.defineProperty(exports, "validate", {
      enumerable: true,
      get: function get2() {
        return _validate.default;
      }
    });
    Object.defineProperty(exports, "version", {
      enumerable: true,
      get: function get2() {
        return _version.default;
      }
    });
    var _v = _interopRequireDefault(require_v1());
    var _v2 = _interopRequireDefault(require_v3());
    var _v3 = _interopRequireDefault(require_v4());
    var _v4 = _interopRequireDefault(require_v5());
    var _nil = _interopRequireDefault(require_nil());
    var _version = _interopRequireDefault(require_version());
    var _validate = _interopRequireDefault(require_validate());
    var _stringify = _interopRequireDefault(require_stringify());
    var _parse = _interopRequireDefault(require_parse());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
  }
});

// ../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/contextTypes.js
var require_contextTypes = __commonJS({
  "../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/contextTypes.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MosaicWindowContext = exports.MosaicContext = void 0;
    var react_1 = __importDefault(require_react());
    exports.MosaicContext = react_1.default.createContext(void 0);
    exports.MosaicWindowContext = react_1.default.createContext(void 0);
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isFlattenable.js
var require_isFlattenable = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isFlattenable.js"(exports, module) {
    var Symbol2 = require_Symbol();
    var isArguments = require_isArguments();
    var isArray = require_isArray();
    var spreadableSymbol = Symbol2 ? Symbol2.isConcatSpreadable : void 0;
    function isFlattenable(value) {
      return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
    }
    module.exports = isFlattenable;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseFlatten.js
var require_baseFlatten = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseFlatten.js"(exports, module) {
    var arrayPush = require_arrayPush();
    var isFlattenable = require_isFlattenable();
    function baseFlatten(array, depth, predicate, isStrict, result) {
      var index = -1, length = array.length;
      predicate || (predicate = isFlattenable);
      result || (result = []);
      while (++index < length) {
        var value = array[index];
        if (depth > 0 && predicate(value)) {
          if (depth > 1) {
            baseFlatten(value, depth - 1, predicate, isStrict, result);
          } else {
            arrayPush(result, value);
          }
        } else if (!isStrict) {
          result[result.length] = value;
        }
      }
      return result;
    }
    module.exports = baseFlatten;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/flatten.js
var require_flatten = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/flatten.js"(exports, module) {
    var baseFlatten = require_baseFlatten();
    function flatten(array) {
      var length = array == null ? 0 : array.length;
      return length ? baseFlatten(array, 1) : [];
    }
    module.exports = flatten;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseClamp.js
var require_baseClamp = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseClamp.js"(exports, module) {
    function baseClamp(number, lower, upper) {
      if (number === number) {
        if (upper !== void 0) {
          number = number <= upper ? number : upper;
        }
        if (lower !== void 0) {
          number = number >= lower ? number : lower;
        }
      }
      return number;
    }
    module.exports = baseClamp;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_trimmedEndIndex.js
var require_trimmedEndIndex = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_trimmedEndIndex.js"(exports, module) {
    var reWhitespace = /\s/;
    function trimmedEndIndex(string) {
      var index = string.length;
      while (index-- && reWhitespace.test(string.charAt(index))) {
      }
      return index;
    }
    module.exports = trimmedEndIndex;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseTrim.js
var require_baseTrim = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseTrim.js"(exports, module) {
    var trimmedEndIndex = require_trimmedEndIndex();
    var reTrimStart = /^\s+/;
    function baseTrim(string) {
      return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
    }
    module.exports = baseTrim;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/toNumber.js
var require_toNumber = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/toNumber.js"(exports, module) {
    var baseTrim = require_baseTrim();
    var isObject2 = require_isObject();
    var isSymbol = require_isSymbol();
    var NAN = 0 / 0;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsOctal = /^0o[0-7]+$/i;
    var freeParseInt = parseInt;
    function toNumber(value) {
      if (typeof value == "number") {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject2(value)) {
        var other = typeof value.valueOf == "function" ? value.valueOf() : value;
        value = isObject2(other) ? other + "" : other;
      }
      if (typeof value != "string") {
        return value === 0 ? value : +value;
      }
      value = baseTrim(value);
      var isBinary = reIsBinary.test(value);
      return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
    }
    module.exports = toNumber;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/clamp.js
var require_clamp = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/clamp.js"(exports, module) {
    var baseClamp = require_baseClamp();
    var toNumber = require_toNumber();
    function clamp(number, lower, upper) {
      if (upper === void 0) {
        upper = lower;
        lower = void 0;
      }
      if (upper !== void 0) {
        upper = toNumber(upper);
        upper = upper === upper ? upper : 0;
      }
      if (lower !== void 0) {
        lower = toNumber(lower);
        lower = lower === lower ? lower : 0;
      }
      return baseClamp(toNumber(number), lower, upper);
    }
    module.exports = clamp;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/now.js
var require_now = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/now.js"(exports, module) {
    var root = require_root();
    var now = function() {
      return root.Date.now();
    };
    module.exports = now;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/debounce.js
var require_debounce = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/debounce.js"(exports, module) {
    var isObject2 = require_isObject();
    var now = require_now();
    var toNumber = require_toNumber();
    var FUNC_ERROR_TEXT = "Expected a function";
    var nativeMax = Math.max;
    var nativeMin = Math.min;
    function debounce(func, wait, options) {
      var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
      if (typeof func != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      wait = toNumber(wait) || 0;
      if (isObject2(options)) {
        leading = !!options.leading;
        maxing = "maxWait" in options;
        maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
        trailing = "trailing" in options ? !!options.trailing : trailing;
      }
      function invokeFunc(time) {
        var args = lastArgs, thisArg = lastThis;
        lastArgs = lastThis = void 0;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
      }
      function leadingEdge(time) {
        lastInvokeTime = time;
        timerId = setTimeout(timerExpired, wait);
        return leading ? invokeFunc(time) : result;
      }
      function remainingWait(time) {
        var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
        return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
      }
      function shouldInvoke(time) {
        var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
        return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
      }
      function timerExpired() {
        var time = now();
        if (shouldInvoke(time)) {
          return trailingEdge(time);
        }
        timerId = setTimeout(timerExpired, remainingWait(time));
      }
      function trailingEdge(time) {
        timerId = void 0;
        if (trailing && lastArgs) {
          return invokeFunc(time);
        }
        lastArgs = lastThis = void 0;
        return result;
      }
      function cancel() {
        if (timerId !== void 0) {
          clearTimeout(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = void 0;
      }
      function flush() {
        return timerId === void 0 ? result : trailingEdge(now());
      }
      function debounced() {
        var time = now(), isInvoking = shouldInvoke(time);
        lastArgs = arguments;
        lastThis = this;
        lastCallTime = time;
        if (isInvoking) {
          if (timerId === void 0) {
            return leadingEdge(lastCallTime);
          }
          if (maxing) {
            clearTimeout(timerId);
            timerId = setTimeout(timerExpired, wait);
            return invokeFunc(lastCallTime);
          }
        }
        if (timerId === void 0) {
          timerId = setTimeout(timerExpired, wait);
        }
        return result;
      }
      debounced.cancel = cancel;
      debounced.flush = flush;
      return debounced;
    }
    module.exports = debounce;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/throttle.js
var require_throttle = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/throttle.js"(exports, module) {
    var debounce = require_debounce();
    var isObject2 = require_isObject();
    var FUNC_ERROR_TEXT = "Expected a function";
    function throttle(func, wait, options) {
      var leading = true, trailing = true;
      if (typeof func != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      if (isObject2(options)) {
        leading = "leading" in options ? !!options.leading : leading;
        trailing = "trailing" in options ? !!options.trailing : trailing;
      }
      return debounce(func, wait, {
        "leading": leading,
        "maxWait": wait,
        "trailing": trailing
      });
    }
    module.exports = throttle;
  }
});

// ../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/util/assertNever.js
var require_assertNever = __commonJS({
  "../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/util/assertNever.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertNever = void 0;
    function assertNever(shouldBeNever) {
      throw new Error("Unhandled case: " + JSON.stringify(shouldBeNever));
    }
    exports.assertNever = assertNever;
  }
});

// ../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/util/BoundingBox.js
var require_BoundingBox = __commonJS({
  "../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/util/BoundingBox.js"(exports) {
    "use strict";
    var __assign = exports && exports.__assign || function() {
      __assign = Object.assign || function(t2) {
        for (var s3, i3 = 1, n = arguments.length; i3 < n; i3++) {
          s3 = arguments[i3];
          for (var p2 in s3) if (Object.prototype.hasOwnProperty.call(s3, p2))
            t2[p2] = s3[p2];
        }
        return t2;
      };
      return __assign.apply(this, arguments);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BoundingBox = void 0;
    var assertNever_1 = require_assertNever();
    var BoundingBox;
    (function(BoundingBox2) {
      function empty() {
        return {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        };
      }
      BoundingBox2.empty = empty;
      function split(boundingBox, relativeSplitPercentage, direction) {
        var absolutePercentage = getAbsoluteSplitPercentage(boundingBox, relativeSplitPercentage, direction);
        if (direction === "column") {
          return {
            first: __assign(__assign({}, boundingBox), { bottom: 100 - absolutePercentage }),
            second: __assign(__assign({}, boundingBox), { top: absolutePercentage })
          };
        } else if (direction === "row") {
          return {
            first: __assign(__assign({}, boundingBox), { right: 100 - absolutePercentage }),
            second: __assign(__assign({}, boundingBox), { left: absolutePercentage })
          };
        } else {
          return (0, assertNever_1.assertNever)(direction);
        }
      }
      BoundingBox2.split = split;
      function getAbsoluteSplitPercentage(boundingBox, relativeSplitPercentage, direction) {
        var top = boundingBox.top, right = boundingBox.right, bottom = boundingBox.bottom, left = boundingBox.left;
        if (direction === "column") {
          var height = 100 - top - bottom;
          return height * relativeSplitPercentage / 100 + top;
        } else if (direction === "row") {
          var width = 100 - right - left;
          return width * relativeSplitPercentage / 100 + left;
        } else {
          return (0, assertNever_1.assertNever)(direction);
        }
      }
      BoundingBox2.getAbsoluteSplitPercentage = getAbsoluteSplitPercentage;
      function getRelativeSplitPercentage(boundingBox, absoluteSplitPercentage, direction) {
        var top = boundingBox.top, right = boundingBox.right, bottom = boundingBox.bottom, left = boundingBox.left;
        if (direction === "column") {
          var height = 100 - top - bottom;
          return (absoluteSplitPercentage - top) / height * 100;
        } else if (direction === "row") {
          var width = 100 - right - left;
          return (absoluteSplitPercentage - left) / width * 100;
        } else {
          return (0, assertNever_1.assertNever)(direction);
        }
      }
      BoundingBox2.getRelativeSplitPercentage = getRelativeSplitPercentage;
      function asStyles(_a) {
        var top = _a.top, right = _a.right, bottom = _a.bottom, left = _a.left;
        return {
          top: "".concat(top, "%"),
          right: "".concat(right, "%"),
          bottom: "".concat(bottom, "%"),
          left: "".concat(left, "%")
        };
      }
      BoundingBox2.asStyles = asStyles;
    })(BoundingBox = exports.BoundingBox || (exports.BoundingBox = {}));
  }
});

// ../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/Split.js
var require_Split = __commonJS({
  "../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/Split.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || /* @__PURE__ */ (function() {
      var extendStatics = function(d3, b2) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d4, b3) {
          d4.__proto__ = b3;
        } || function(d4, b3) {
          for (var p2 in b3) if (Object.prototype.hasOwnProperty.call(b3, p2)) d4[p2] = b3[p2];
        };
        return extendStatics(d3, b2);
      };
      return function(d3, b2) {
        if (typeof b2 !== "function" && b2 !== null)
          throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
        extendStatics(d3, b2);
        function __() {
          this.constructor = d3;
        }
        d3.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __());
      };
    })();
    var __assign = exports && exports.__assign || function() {
      __assign = Object.assign || function(t2) {
        for (var s3, i3 = 1, n = arguments.length; i3 < n; i3++) {
          s3 = arguments[i3];
          for (var p2 in s3) if (Object.prototype.hasOwnProperty.call(s3, p2))
            t2[p2] = s3[p2];
        }
        return t2;
      };
      return __assign.apply(this, arguments);
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Split = void 0;
    var classnames_1 = __importDefault(require_classnames());
    var clamp_1 = __importDefault(require_clamp());
    var throttle_1 = __importDefault(require_throttle());
    var react_1 = __importDefault(require_react());
    var BoundingBox_1 = require_BoundingBox();
    var RESIZE_THROTTLE_MS = 1e3 / 30;
    var TOUCH_EVENT_OPTIONS = {
      capture: true,
      passive: false
    };
    var Split = (
      /** @class */
      (function(_super) {
        __extends(Split2, _super);
        function Split2() {
          var _this = _super !== null && _super.apply(this, arguments) || this;
          _this.rootElement = react_1.default.createRef();
          _this.listenersBound = false;
          _this.onMouseDown = function(event) {
            if (!isTouchEvent2(event)) {
              if (event.button !== 0) {
                return;
              }
            }
            event.preventDefault();
            _this.bindListeners();
          };
          _this.onMouseUp = function(event) {
            _this.unbindListeners();
            var percentage = _this.calculateRelativePercentage(event);
            _this.props.onRelease(percentage);
          };
          _this.onMouseMove = function(event) {
            event.preventDefault();
            _this.throttledUpdatePercentage(event);
          };
          _this.throttledUpdatePercentage = (0, throttle_1.default)(function(event) {
            var percentage = _this.calculateRelativePercentage(event);
            if (percentage !== _this.props.splitPercentage) {
              _this.props.onChange(percentage);
            }
          }, RESIZE_THROTTLE_MS);
          return _this;
        }
        Split2.prototype.render = function() {
          var direction = this.props.direction;
          return react_1.default.createElement(
            "div",
            { className: (0, classnames_1.default)("mosaic-split", {
              "-row": direction === "row",
              "-column": direction === "column"
            }), ref: this.rootElement, onMouseDown: this.onMouseDown, style: this.computeStyle() },
            react_1.default.createElement("div", { className: "mosaic-split-line" })
          );
        };
        Split2.prototype.componentDidMount = function() {
          this.rootElement.current.addEventListener("touchstart", this.onMouseDown, TOUCH_EVENT_OPTIONS);
        };
        Split2.prototype.componentWillUnmount = function() {
          this.unbindListeners();
          if (this.rootElement.current) {
            this.rootElement.current.ownerDocument.removeEventListener("touchstart", this.onMouseDown, TOUCH_EVENT_OPTIONS);
          }
        };
        Split2.prototype.bindListeners = function() {
          if (!this.listenersBound) {
            this.rootElement.current.ownerDocument.addEventListener("mousemove", this.onMouseMove, true);
            this.rootElement.current.ownerDocument.addEventListener("touchmove", this.onMouseMove, TOUCH_EVENT_OPTIONS);
            this.rootElement.current.ownerDocument.addEventListener("mouseup", this.onMouseUp, true);
            this.rootElement.current.ownerDocument.addEventListener("touchend", this.onMouseUp, true);
            this.listenersBound = true;
          }
        };
        Split2.prototype.unbindListeners = function() {
          if (this.rootElement.current) {
            this.rootElement.current.ownerDocument.removeEventListener("mousemove", this.onMouseMove, true);
            this.rootElement.current.ownerDocument.removeEventListener("touchmove", this.onMouseMove, TOUCH_EVENT_OPTIONS);
            this.rootElement.current.ownerDocument.removeEventListener("mouseup", this.onMouseUp, true);
            this.rootElement.current.ownerDocument.removeEventListener("touchend", this.onMouseUp, true);
            this.listenersBound = false;
          }
        };
        Split2.prototype.computeStyle = function() {
          var _a;
          var _b = this.props, boundingBox = _b.boundingBox, direction = _b.direction, splitPercentage = _b.splitPercentage;
          var positionStyle = direction === "column" ? "top" : "left";
          var absolutePercentage = BoundingBox_1.BoundingBox.getAbsoluteSplitPercentage(boundingBox, splitPercentage, direction);
          return __assign(__assign({}, BoundingBox_1.BoundingBox.asStyles(boundingBox)), (_a = {}, _a[positionStyle] = "".concat(absolutePercentage, "%"), _a));
        };
        Split2.prototype.calculateRelativePercentage = function(event) {
          var _a = this.props, minimumPaneSizePercentage = _a.minimumPaneSizePercentage, direction = _a.direction, boundingBox = _a.boundingBox;
          var parentBBox = this.rootElement.current.parentElement.getBoundingClientRect();
          var location = isTouchEvent2(event) ? event.changedTouches[0] : event;
          var absolutePercentage;
          if (direction === "column") {
            absolutePercentage = (location.clientY - parentBBox.top) / parentBBox.height * 100;
          } else {
            absolutePercentage = (location.clientX - parentBBox.left) / parentBBox.width * 100;
          }
          var relativePercentage = BoundingBox_1.BoundingBox.getRelativeSplitPercentage(boundingBox, absolutePercentage, direction);
          return (0, clamp_1.default)(relativePercentage, minimumPaneSizePercentage, 100 - minimumPaneSizePercentage);
        };
        Split2.defaultProps = {
          onChange: function() {
            return void 0;
          },
          onRelease: function() {
            return void 0;
          },
          minimumPaneSizePercentage: 20
        };
        return Split2;
      })(react_1.default.PureComponent)
    );
    exports.Split = Split;
    function isTouchEvent2(event) {
      return event.changedTouches != null;
    }
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayEach.js
var require_arrayEach = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayEach.js"(exports, module) {
    function arrayEach(array, iteratee) {
      var index = -1, length = array == null ? 0 : array.length;
      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }
    module.exports = arrayEach;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_copyObject.js
var require_copyObject = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_copyObject.js"(exports, module) {
    var assignValue = require_assignValue();
    var baseAssignValue = require_baseAssignValue();
    function copyObject(source, props, object, customizer) {
      var isNew = !object;
      object || (object = {});
      var index = -1, length = props.length;
      while (++index < length) {
        var key = props[index];
        var newValue = customizer ? customizer(object[key], source[key], key, object, source) : void 0;
        if (newValue === void 0) {
          newValue = source[key];
        }
        if (isNew) {
          baseAssignValue(object, key, newValue);
        } else {
          assignValue(object, key, newValue);
        }
      }
      return object;
    }
    module.exports = copyObject;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseAssign.js
var require_baseAssign = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseAssign.js"(exports, module) {
    var copyObject = require_copyObject();
    var keys = require_keys();
    function baseAssign(object, source) {
      return object && copyObject(source, keys(source), object);
    }
    module.exports = baseAssign;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseAssignIn.js
var require_baseAssignIn = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseAssignIn.js"(exports, module) {
    var copyObject = require_copyObject();
    var keysIn = require_keysIn();
    function baseAssignIn(object, source) {
      return object && copyObject(source, keysIn(source), object);
    }
    module.exports = baseAssignIn;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneBuffer.js
var require_cloneBuffer = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneBuffer.js"(exports, module) {
    var root = require_root();
    var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var Buffer = moduleExports ? root.Buffer : void 0;
    var allocUnsafe = Buffer ? Buffer.allocUnsafe : void 0;
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
      buffer.copy(result);
      return result;
    }
    module.exports = cloneBuffer;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_copyArray.js
var require_copyArray = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_copyArray.js"(exports, module) {
    function copyArray(source, array) {
      var index = -1, length = source.length;
      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }
    module.exports = copyArray;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_copySymbols.js
var require_copySymbols = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_copySymbols.js"(exports, module) {
    var copyObject = require_copyObject();
    var getSymbols = require_getSymbols();
    function copySymbols(source, object) {
      return copyObject(source, getSymbols(source), object);
    }
    module.exports = copySymbols;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_copySymbolsIn.js
var require_copySymbolsIn = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_copySymbolsIn.js"(exports, module) {
    var copyObject = require_copyObject();
    var getSymbolsIn = require_getSymbolsIn();
    function copySymbolsIn(source, object) {
      return copyObject(source, getSymbolsIn(source), object);
    }
    module.exports = copySymbolsIn;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_initCloneArray.js
var require_initCloneArray = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_initCloneArray.js"(exports, module) {
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function initCloneArray(array) {
      var length = array.length, result = new array.constructor(length);
      if (length && typeof array[0] == "string" && hasOwnProperty.call(array, "index")) {
        result.index = array.index;
        result.input = array.input;
      }
      return result;
    }
    module.exports = initCloneArray;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneArrayBuffer.js
var require_cloneArrayBuffer = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneArrayBuffer.js"(exports, module) {
    var Uint8Array2 = require_Uint8Array();
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new Uint8Array2(result).set(new Uint8Array2(arrayBuffer));
      return result;
    }
    module.exports = cloneArrayBuffer;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneDataView.js
var require_cloneDataView = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneDataView.js"(exports, module) {
    var cloneArrayBuffer = require_cloneArrayBuffer();
    function cloneDataView(dataView, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
      return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
    }
    module.exports = cloneDataView;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneRegExp.js
var require_cloneRegExp = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneRegExp.js"(exports, module) {
    var reFlags = /\w*$/;
    function cloneRegExp(regexp) {
      var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
      result.lastIndex = regexp.lastIndex;
      return result;
    }
    module.exports = cloneRegExp;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneSymbol.js
var require_cloneSymbol = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneSymbol.js"(exports, module) {
    var Symbol2 = require_Symbol();
    var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
    var symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
    function cloneSymbol(symbol) {
      return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
    }
    module.exports = cloneSymbol;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneTypedArray.js
var require_cloneTypedArray = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneTypedArray.js"(exports, module) {
    var cloneArrayBuffer = require_cloneArrayBuffer();
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }
    module.exports = cloneTypedArray;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_initCloneByTag.js
var require_initCloneByTag = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_initCloneByTag.js"(exports, module) {
    var cloneArrayBuffer = require_cloneArrayBuffer();
    var cloneDataView = require_cloneDataView();
    var cloneRegExp = require_cloneRegExp();
    var cloneSymbol = require_cloneSymbol();
    var cloneTypedArray = require_cloneTypedArray();
    var boolTag = "[object Boolean]";
    var dateTag = "[object Date]";
    var mapTag = "[object Map]";
    var numberTag = "[object Number]";
    var regexpTag = "[object RegExp]";
    var setTag = "[object Set]";
    var stringTag = "[object String]";
    var symbolTag = "[object Symbol]";
    var arrayBufferTag = "[object ArrayBuffer]";
    var dataViewTag = "[object DataView]";
    var float32Tag = "[object Float32Array]";
    var float64Tag = "[object Float64Array]";
    var int8Tag = "[object Int8Array]";
    var int16Tag = "[object Int16Array]";
    var int32Tag = "[object Int32Array]";
    var uint8Tag = "[object Uint8Array]";
    var uint8ClampedTag = "[object Uint8ClampedArray]";
    var uint16Tag = "[object Uint16Array]";
    var uint32Tag = "[object Uint32Array]";
    function initCloneByTag(object, tag, isDeep) {
      var Ctor = object.constructor;
      switch (tag) {
        case arrayBufferTag:
          return cloneArrayBuffer(object);
        case boolTag:
        case dateTag:
          return new Ctor(+object);
        case dataViewTag:
          return cloneDataView(object, isDeep);
        case float32Tag:
        case float64Tag:
        case int8Tag:
        case int16Tag:
        case int32Tag:
        case uint8Tag:
        case uint8ClampedTag:
        case uint16Tag:
        case uint32Tag:
          return cloneTypedArray(object, isDeep);
        case mapTag:
          return new Ctor();
        case numberTag:
        case stringTag:
          return new Ctor(object);
        case regexpTag:
          return cloneRegExp(object);
        case setTag:
          return new Ctor();
        case symbolTag:
          return cloneSymbol(object);
      }
    }
    module.exports = initCloneByTag;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseCreate.js
var require_baseCreate = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseCreate.js"(exports, module) {
    var isObject2 = require_isObject();
    var objectCreate = Object.create;
    var baseCreate = /* @__PURE__ */ (function() {
      function object() {
      }
      return function(proto) {
        if (!isObject2(proto)) {
          return {};
        }
        if (objectCreate) {
          return objectCreate(proto);
        }
        object.prototype = proto;
        var result = new object();
        object.prototype = void 0;
        return result;
      };
    })();
    module.exports = baseCreate;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_initCloneObject.js
var require_initCloneObject = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_initCloneObject.js"(exports, module) {
    var baseCreate = require_baseCreate();
    var getPrototype = require_getPrototype();
    var isPrototype = require_isPrototype();
    function initCloneObject(object) {
      return typeof object.constructor == "function" && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
    }
    module.exports = initCloneObject;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsMap.js
var require_baseIsMap = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsMap.js"(exports, module) {
    var getTag = require_getTag();
    var isObjectLike = require_isObjectLike();
    var mapTag = "[object Map]";
    function baseIsMap(value) {
      return isObjectLike(value) && getTag(value) == mapTag;
    }
    module.exports = baseIsMap;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isMap.js
var require_isMap = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isMap.js"(exports, module) {
    var baseIsMap = require_baseIsMap();
    var baseUnary = require_baseUnary();
    var nodeUtil = require_nodeUtil();
    var nodeIsMap = nodeUtil && nodeUtil.isMap;
    var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
    module.exports = isMap;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsSet.js
var require_baseIsSet = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsSet.js"(exports, module) {
    var getTag = require_getTag();
    var isObjectLike = require_isObjectLike();
    var setTag = "[object Set]";
    function baseIsSet(value) {
      return isObjectLike(value) && getTag(value) == setTag;
    }
    module.exports = baseIsSet;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isSet.js
var require_isSet = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isSet.js"(exports, module) {
    var baseIsSet = require_baseIsSet();
    var baseUnary = require_baseUnary();
    var nodeUtil = require_nodeUtil();
    var nodeIsSet = nodeUtil && nodeUtil.isSet;
    var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
    module.exports = isSet;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseClone.js
var require_baseClone = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseClone.js"(exports, module) {
    var Stack = require_Stack();
    var arrayEach = require_arrayEach();
    var assignValue = require_assignValue();
    var baseAssign = require_baseAssign();
    var baseAssignIn = require_baseAssignIn();
    var cloneBuffer = require_cloneBuffer();
    var copyArray = require_copyArray();
    var copySymbols = require_copySymbols();
    var copySymbolsIn = require_copySymbolsIn();
    var getAllKeys = require_getAllKeys();
    var getAllKeysIn = require_getAllKeysIn();
    var getTag = require_getTag();
    var initCloneArray = require_initCloneArray();
    var initCloneByTag = require_initCloneByTag();
    var initCloneObject = require_initCloneObject();
    var isArray = require_isArray();
    var isBuffer = require_isBuffer();
    var isMap = require_isMap();
    var isObject2 = require_isObject();
    var isSet = require_isSet();
    var keys = require_keys();
    var keysIn = require_keysIn();
    var CLONE_DEEP_FLAG = 1;
    var CLONE_FLAT_FLAG = 2;
    var CLONE_SYMBOLS_FLAG = 4;
    var argsTag = "[object Arguments]";
    var arrayTag = "[object Array]";
    var boolTag = "[object Boolean]";
    var dateTag = "[object Date]";
    var errorTag = "[object Error]";
    var funcTag = "[object Function]";
    var genTag = "[object GeneratorFunction]";
    var mapTag = "[object Map]";
    var numberTag = "[object Number]";
    var objectTag = "[object Object]";
    var regexpTag = "[object RegExp]";
    var setTag = "[object Set]";
    var stringTag = "[object String]";
    var symbolTag = "[object Symbol]";
    var weakMapTag = "[object WeakMap]";
    var arrayBufferTag = "[object ArrayBuffer]";
    var dataViewTag = "[object DataView]";
    var float32Tag = "[object Float32Array]";
    var float64Tag = "[object Float64Array]";
    var int8Tag = "[object Int8Array]";
    var int16Tag = "[object Int16Array]";
    var int32Tag = "[object Int32Array]";
    var uint8Tag = "[object Uint8Array]";
    var uint8ClampedTag = "[object Uint8ClampedArray]";
    var uint16Tag = "[object Uint16Array]";
    var uint32Tag = "[object Uint32Array]";
    var cloneableTags = {};
    cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
    cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
    function baseClone(value, bitmask, customizer, key, object, stack) {
      var result, isDeep = bitmask & CLONE_DEEP_FLAG, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG;
      if (customizer) {
        result = object ? customizer(value, key, object, stack) : customizer(value);
      }
      if (result !== void 0) {
        return result;
      }
      if (!isObject2(value)) {
        return value;
      }
      var isArr = isArray(value);
      if (isArr) {
        result = initCloneArray(value);
        if (!isDeep) {
          return copyArray(value, result);
        }
      } else {
        var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
        if (isBuffer(value)) {
          return cloneBuffer(value, isDeep);
        }
        if (tag == objectTag || tag == argsTag || isFunc && !object) {
          result = isFlat || isFunc ? {} : initCloneObject(value);
          if (!isDeep) {
            return isFlat ? copySymbolsIn(value, baseAssignIn(result, value)) : copySymbols(value, baseAssign(result, value));
          }
        } else {
          if (!cloneableTags[tag]) {
            return object ? value : {};
          }
          result = initCloneByTag(value, tag, isDeep);
        }
      }
      stack || (stack = new Stack());
      var stacked = stack.get(value);
      if (stacked) {
        return stacked;
      }
      stack.set(value, result);
      if (isSet(value)) {
        value.forEach(function(subValue) {
          result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
        });
      } else if (isMap(value)) {
        value.forEach(function(subValue, key2) {
          result.set(key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
        });
      }
      var keysFunc = isFull ? isFlat ? getAllKeysIn : getAllKeys : isFlat ? keysIn : keys;
      var props = isArr ? void 0 : keysFunc(value);
      arrayEach(props || value, function(subValue, key2) {
        if (props) {
          key2 = subValue;
          subValue = value[key2];
        }
        assignValue(result, key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
      });
      return result;
    }
    module.exports = baseClone;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/clone.js
var require_clone = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/clone.js"(exports, module) {
    var baseClone = require_baseClone();
    var CLONE_SYMBOLS_FLAG = 4;
    function clone(value) {
      return baseClone(value, CLONE_SYMBOLS_FLAG);
    }
    module.exports = clone;
  }
});

// ../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/util/mosaicUtilities.js
var require_mosaicUtilities = __commonJS({
  "../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/util/mosaicUtilities.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getAndAssertNodeAtPathExists = exports.getNodeAtPath = exports.getLeaves = exports.getPathToCorner = exports.getOtherDirection = exports.getOtherBranch = exports.createBalancedTreeFromLeaves = exports.isParent = exports.Corner = void 0;
    var clone_1 = __importDefault(require_clone());
    var get_1 = __importDefault(require_get());
    function alternateDirection(node, direction) {
      if (direction === void 0) {
        direction = "row";
      }
      if (isParent(node)) {
        var nextDirection = getOtherDirection(direction);
        return {
          direction,
          first: alternateDirection(node.first, nextDirection),
          second: alternateDirection(node.second, nextDirection)
        };
      } else {
        return node;
      }
    }
    var Corner;
    (function(Corner2) {
      Corner2[Corner2["TOP_LEFT"] = 1] = "TOP_LEFT";
      Corner2[Corner2["TOP_RIGHT"] = 2] = "TOP_RIGHT";
      Corner2[Corner2["BOTTOM_LEFT"] = 3] = "BOTTOM_LEFT";
      Corner2[Corner2["BOTTOM_RIGHT"] = 4] = "BOTTOM_RIGHT";
    })(Corner = exports.Corner || (exports.Corner = {}));
    function isParent(node) {
      return node.direction != null;
    }
    exports.isParent = isParent;
    function createBalancedTreeFromLeaves(leaves, startDirection) {
      if (startDirection === void 0) {
        startDirection = "row";
      }
      if (leaves.length === 0) {
        return null;
      }
      var current = (0, clone_1.default)(leaves);
      var next = [];
      while (current.length > 1) {
        while (current.length > 0) {
          if (current.length > 1) {
            next.push({
              direction: "row",
              first: current.shift(),
              second: current.shift()
            });
          } else {
            next.unshift(current.shift());
          }
        }
        current = next;
        next = [];
      }
      return alternateDirection(current[0], startDirection);
    }
    exports.createBalancedTreeFromLeaves = createBalancedTreeFromLeaves;
    function getOtherBranch(branch) {
      if (branch === "first") {
        return "second";
      } else if (branch === "second") {
        return "first";
      } else {
        throw new Error("Branch '".concat(branch, "' not a valid branch"));
      }
    }
    exports.getOtherBranch = getOtherBranch;
    function getOtherDirection(direction) {
      if (direction === "row") {
        return "column";
      } else {
        return "row";
      }
    }
    exports.getOtherDirection = getOtherDirection;
    function getPathToCorner(tree, corner) {
      var currentNode = tree;
      var currentPath = [];
      while (isParent(currentNode)) {
        if (currentNode.direction === "row" && (corner === Corner.TOP_LEFT || corner === Corner.BOTTOM_LEFT)) {
          currentPath.push("first");
          currentNode = currentNode.first;
        } else if (currentNode.direction === "column" && (corner === Corner.TOP_LEFT || corner === Corner.TOP_RIGHT)) {
          currentPath.push("first");
          currentNode = currentNode.first;
        } else {
          currentPath.push("second");
          currentNode = currentNode.second;
        }
      }
      return currentPath;
    }
    exports.getPathToCorner = getPathToCorner;
    function getLeaves(tree) {
      if (tree == null) {
        return [];
      } else if (isParent(tree)) {
        return getLeaves(tree.first).concat(getLeaves(tree.second));
      } else {
        return [tree];
      }
    }
    exports.getLeaves = getLeaves;
    function getNodeAtPath(tree, path) {
      if (path.length > 0) {
        return (0, get_1.default)(tree, path, null);
      } else {
        return tree;
      }
    }
    exports.getNodeAtPath = getNodeAtPath;
    function getAndAssertNodeAtPathExists(tree, path) {
      if (tree == null) {
        throw new Error("Root is empty, cannot fetch path");
      }
      var node = getNodeAtPath(tree, path);
      if (node == null) {
        throw new Error("Path [".concat(path.join(", "), "] did not resolve to a node"));
      }
      return node;
    }
    exports.getAndAssertNodeAtPathExists = getAndAssertNodeAtPathExists;
  }
});

// ../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/MosaicRoot.js
var require_MosaicRoot = __commonJS({
  "../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/MosaicRoot.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || /* @__PURE__ */ (function() {
      var extendStatics = function(d3, b2) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d4, b3) {
          d4.__proto__ = b3;
        } || function(d4, b3) {
          for (var p2 in b3) if (Object.prototype.hasOwnProperty.call(b3, p2)) d4[p2] = b3[p2];
        };
        return extendStatics(d3, b2);
      };
      return function(d3, b2) {
        if (typeof b2 !== "function" && b2 !== null)
          throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
        extendStatics(d3, b2);
        function __() {
          this.constructor = d3;
        }
        d3.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __());
      };
    })();
    var __assign = exports && exports.__assign || function() {
      __assign = Object.assign || function(t2) {
        for (var s3, i3 = 1, n = arguments.length; i3 < n; i3++) {
          s3 = arguments[i3];
          for (var p2 in s3) if (Object.prototype.hasOwnProperty.call(s3, p2))
            t2[p2] = s3[p2];
        }
        return t2;
      };
      return __assign.apply(this, arguments);
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MosaicRoot = void 0;
    var flatten_1 = __importDefault(require_flatten());
    var react_1 = __importDefault(require_react());
    var contextTypes_1 = require_contextTypes();
    var Split_1 = require_Split();
    var BoundingBox_1 = require_BoundingBox();
    var mosaicUtilities_1 = require_mosaicUtilities();
    var MosaicRoot = (
      /** @class */
      (function(_super) {
        __extends(MosaicRoot2, _super);
        function MosaicRoot2() {
          var _this = _super !== null && _super.apply(this, arguments) || this;
          _this.onResize = function(percentage, path, suppressOnRelease) {
            _this.context.mosaicActions.updateTree([
              {
                path,
                spec: {
                  splitPercentage: {
                    $set: percentage
                  }
                }
              }
            ], suppressOnRelease);
          };
          return _this;
        }
        MosaicRoot2.prototype.render = function() {
          var root = this.props.root;
          return react_1.default.createElement("div", { className: "mosaic-root" }, this.renderRecursively(root, BoundingBox_1.BoundingBox.empty(), []));
        };
        MosaicRoot2.prototype.renderRecursively = function(node, boundingBox, path) {
          if ((0, mosaicUtilities_1.isParent)(node)) {
            var splitPercentage = node.splitPercentage == null ? 50 : node.splitPercentage;
            var _a = BoundingBox_1.BoundingBox.split(boundingBox, splitPercentage, node.direction), first = _a.first, second = _a.second;
            return (0, flatten_1.default)([
              this.renderRecursively(node.first, first, path.concat("first")),
              this.renderSplit(node.direction, boundingBox, splitPercentage, path),
              this.renderRecursively(node.second, second, path.concat("second"))
            ].filter(nonNullElement));
          } else {
            return react_1.default.createElement("div", { key: node, className: "mosaic-tile", style: __assign({}, BoundingBox_1.BoundingBox.asStyles(boundingBox)) }, this.props.renderTile(node, path));
          }
        };
        MosaicRoot2.prototype.renderSplit = function(direction, boundingBox, splitPercentage, path) {
          var _this = this;
          var resize = this.props.resize;
          if (resize !== "DISABLED") {
            return react_1.default.createElement(Split_1.Split, __assign({ key: path.join(",") + "splitter" }, resize, { boundingBox, splitPercentage, direction, onChange: function(percentage) {
              return _this.onResize(percentage, path, true);
            }, onRelease: function(percentage) {
              return _this.onResize(percentage, path, false);
            } }));
          } else {
            return null;
          }
        };
        MosaicRoot2.contextType = contextTypes_1.MosaicContext;
        return MosaicRoot2;
      })(react_1.default.PureComponent)
    );
    exports.MosaicRoot = MosaicRoot;
    function nonNullElement(x4) {
      return x4 !== null;
    }
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/noop.js
var require_noop = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/noop.js"(exports, module) {
    function noop() {
    }
    module.exports = noop;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayReduce.js
var require_arrayReduce = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayReduce.js"(exports, module) {
    function arrayReduce(array, iteratee, accumulator, initAccum) {
      var index = -1, length = array == null ? 0 : array.length;
      if (initAccum && length) {
        accumulator = array[++index];
      }
      while (++index < length) {
        accumulator = iteratee(accumulator, array[index], index, array);
      }
      return accumulator;
    }
    module.exports = arrayReduce;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_basePropertyOf.js
var require_basePropertyOf = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_basePropertyOf.js"(exports, module) {
    function basePropertyOf(object) {
      return function(key) {
        return object == null ? void 0 : object[key];
      };
    }
    module.exports = basePropertyOf;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_deburrLetter.js
var require_deburrLetter = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_deburrLetter.js"(exports, module) {
    var basePropertyOf = require_basePropertyOf();
    var deburredLetters = {
      // Latin-1 Supplement block.
      "\xC0": "A",
      "\xC1": "A",
      "\xC2": "A",
      "\xC3": "A",
      "\xC4": "A",
      "\xC5": "A",
      "\xE0": "a",
      "\xE1": "a",
      "\xE2": "a",
      "\xE3": "a",
      "\xE4": "a",
      "\xE5": "a",
      "\xC7": "C",
      "\xE7": "c",
      "\xD0": "D",
      "\xF0": "d",
      "\xC8": "E",
      "\xC9": "E",
      "\xCA": "E",
      "\xCB": "E",
      "\xE8": "e",
      "\xE9": "e",
      "\xEA": "e",
      "\xEB": "e",
      "\xCC": "I",
      "\xCD": "I",
      "\xCE": "I",
      "\xCF": "I",
      "\xEC": "i",
      "\xED": "i",
      "\xEE": "i",
      "\xEF": "i",
      "\xD1": "N",
      "\xF1": "n",
      "\xD2": "O",
      "\xD3": "O",
      "\xD4": "O",
      "\xD5": "O",
      "\xD6": "O",
      "\xD8": "O",
      "\xF2": "o",
      "\xF3": "o",
      "\xF4": "o",
      "\xF5": "o",
      "\xF6": "o",
      "\xF8": "o",
      "\xD9": "U",
      "\xDA": "U",
      "\xDB": "U",
      "\xDC": "U",
      "\xF9": "u",
      "\xFA": "u",
      "\xFB": "u",
      "\xFC": "u",
      "\xDD": "Y",
      "\xFD": "y",
      "\xFF": "y",
      "\xC6": "Ae",
      "\xE6": "ae",
      "\xDE": "Th",
      "\xFE": "th",
      "\xDF": "ss",
      // Latin Extended-A block.
      "\u0100": "A",
      "\u0102": "A",
      "\u0104": "A",
      "\u0101": "a",
      "\u0103": "a",
      "\u0105": "a",
      "\u0106": "C",
      "\u0108": "C",
      "\u010A": "C",
      "\u010C": "C",
      "\u0107": "c",
      "\u0109": "c",
      "\u010B": "c",
      "\u010D": "c",
      "\u010E": "D",
      "\u0110": "D",
      "\u010F": "d",
      "\u0111": "d",
      "\u0112": "E",
      "\u0114": "E",
      "\u0116": "E",
      "\u0118": "E",
      "\u011A": "E",
      "\u0113": "e",
      "\u0115": "e",
      "\u0117": "e",
      "\u0119": "e",
      "\u011B": "e",
      "\u011C": "G",
      "\u011E": "G",
      "\u0120": "G",
      "\u0122": "G",
      "\u011D": "g",
      "\u011F": "g",
      "\u0121": "g",
      "\u0123": "g",
      "\u0124": "H",
      "\u0126": "H",
      "\u0125": "h",
      "\u0127": "h",
      "\u0128": "I",
      "\u012A": "I",
      "\u012C": "I",
      "\u012E": "I",
      "\u0130": "I",
      "\u0129": "i",
      "\u012B": "i",
      "\u012D": "i",
      "\u012F": "i",
      "\u0131": "i",
      "\u0134": "J",
      "\u0135": "j",
      "\u0136": "K",
      "\u0137": "k",
      "\u0138": "k",
      "\u0139": "L",
      "\u013B": "L",
      "\u013D": "L",
      "\u013F": "L",
      "\u0141": "L",
      "\u013A": "l",
      "\u013C": "l",
      "\u013E": "l",
      "\u0140": "l",
      "\u0142": "l",
      "\u0143": "N",
      "\u0145": "N",
      "\u0147": "N",
      "\u014A": "N",
      "\u0144": "n",
      "\u0146": "n",
      "\u0148": "n",
      "\u014B": "n",
      "\u014C": "O",
      "\u014E": "O",
      "\u0150": "O",
      "\u014D": "o",
      "\u014F": "o",
      "\u0151": "o",
      "\u0154": "R",
      "\u0156": "R",
      "\u0158": "R",
      "\u0155": "r",
      "\u0157": "r",
      "\u0159": "r",
      "\u015A": "S",
      "\u015C": "S",
      "\u015E": "S",
      "\u0160": "S",
      "\u015B": "s",
      "\u015D": "s",
      "\u015F": "s",
      "\u0161": "s",
      "\u0162": "T",
      "\u0164": "T",
      "\u0166": "T",
      "\u0163": "t",
      "\u0165": "t",
      "\u0167": "t",
      "\u0168": "U",
      "\u016A": "U",
      "\u016C": "U",
      "\u016E": "U",
      "\u0170": "U",
      "\u0172": "U",
      "\u0169": "u",
      "\u016B": "u",
      "\u016D": "u",
      "\u016F": "u",
      "\u0171": "u",
      "\u0173": "u",
      "\u0174": "W",
      "\u0175": "w",
      "\u0176": "Y",
      "\u0177": "y",
      "\u0178": "Y",
      "\u0179": "Z",
      "\u017B": "Z",
      "\u017D": "Z",
      "\u017A": "z",
      "\u017C": "z",
      "\u017E": "z",
      "\u0132": "IJ",
      "\u0133": "ij",
      "\u0152": "Oe",
      "\u0153": "oe",
      "\u0149": "'n",
      "\u017F": "s"
    };
    var deburrLetter = basePropertyOf(deburredLetters);
    module.exports = deburrLetter;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/deburr.js
var require_deburr = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/deburr.js"(exports, module) {
    var deburrLetter = require_deburrLetter();
    var toString = require_toString();
    var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
    var rsComboMarksRange = "\\u0300-\\u036f";
    var reComboHalfMarksRange = "\\ufe20-\\ufe2f";
    var rsComboSymbolsRange = "\\u20d0-\\u20ff";
    var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
    var rsCombo = "[" + rsComboRange + "]";
    var reComboMark = RegExp(rsCombo, "g");
    function deburr(string) {
      string = toString(string);
      return string && string.replace(reLatin, deburrLetter).replace(reComboMark, "");
    }
    module.exports = deburr;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_asciiWords.js
var require_asciiWords = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_asciiWords.js"(exports, module) {
    var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
    function asciiWords(string) {
      return string.match(reAsciiWord) || [];
    }
    module.exports = asciiWords;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hasUnicodeWord.js
var require_hasUnicodeWord = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hasUnicodeWord.js"(exports, module) {
    var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
    function hasUnicodeWord(string) {
      return reHasUnicodeWord.test(string);
    }
    module.exports = hasUnicodeWord;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_unicodeWords.js
var require_unicodeWords = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_unicodeWords.js"(exports, module) {
    var rsAstralRange = "\\ud800-\\udfff";
    var rsComboMarksRange = "\\u0300-\\u036f";
    var reComboHalfMarksRange = "\\ufe20-\\ufe2f";
    var rsComboSymbolsRange = "\\u20d0-\\u20ff";
    var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
    var rsDingbatRange = "\\u2700-\\u27bf";
    var rsLowerRange = "a-z\\xdf-\\xf6\\xf8-\\xff";
    var rsMathOpRange = "\\xac\\xb1\\xd7\\xf7";
    var rsNonCharRange = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf";
    var rsPunctuationRange = "\\u2000-\\u206f";
    var rsSpaceRange = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000";
    var rsUpperRange = "A-Z\\xc0-\\xd6\\xd8-\\xde";
    var rsVarRange = "\\ufe0e\\ufe0f";
    var rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;
    var rsApos = "['\u2019]";
    var rsBreak = "[" + rsBreakRange + "]";
    var rsCombo = "[" + rsComboRange + "]";
    var rsDigits = "\\d+";
    var rsDingbat = "[" + rsDingbatRange + "]";
    var rsLower = "[" + rsLowerRange + "]";
    var rsMisc = "[^" + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + "]";
    var rsFitz = "\\ud83c[\\udffb-\\udfff]";
    var rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")";
    var rsNonAstral = "[^" + rsAstralRange + "]";
    var rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
    var rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
    var rsUpper = "[" + rsUpperRange + "]";
    var rsZWJ = "\\u200d";
    var rsMiscLower = "(?:" + rsLower + "|" + rsMisc + ")";
    var rsMiscUpper = "(?:" + rsUpper + "|" + rsMisc + ")";
    var rsOptContrLower = "(?:" + rsApos + "(?:d|ll|m|re|s|t|ve))?";
    var rsOptContrUpper = "(?:" + rsApos + "(?:D|LL|M|RE|S|T|VE))?";
    var reOptMod = rsModifier + "?";
    var rsOptVar = "[" + rsVarRange + "]?";
    var rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*";
    var rsOrdLower = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])";
    var rsOrdUpper = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])";
    var rsSeq = rsOptVar + reOptMod + rsOptJoin;
    var rsEmoji = "(?:" + [rsDingbat, rsRegional, rsSurrPair].join("|") + ")" + rsSeq;
    var reUnicodeWord = RegExp([
      rsUpper + "?" + rsLower + "+" + rsOptContrLower + "(?=" + [rsBreak, rsUpper, "$"].join("|") + ")",
      rsMiscUpper + "+" + rsOptContrUpper + "(?=" + [rsBreak, rsUpper + rsMiscLower, "$"].join("|") + ")",
      rsUpper + "?" + rsMiscLower + "+" + rsOptContrLower,
      rsUpper + "+" + rsOptContrUpper,
      rsOrdUpper,
      rsOrdLower,
      rsDigits,
      rsEmoji
    ].join("|"), "g");
    function unicodeWords(string) {
      return string.match(reUnicodeWord) || [];
    }
    module.exports = unicodeWords;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/words.js
var require_words = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/words.js"(exports, module) {
    var asciiWords = require_asciiWords();
    var hasUnicodeWord = require_hasUnicodeWord();
    var toString = require_toString();
    var unicodeWords = require_unicodeWords();
    function words(string, pattern, guard) {
      string = toString(string);
      pattern = guard ? void 0 : pattern;
      if (pattern === void 0) {
        return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
      }
      return string.match(pattern) || [];
    }
    module.exports = words;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_createCompounder.js
var require_createCompounder = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_createCompounder.js"(exports, module) {
    var arrayReduce = require_arrayReduce();
    var deburr = require_deburr();
    var words = require_words();
    var rsApos = "['\u2019]";
    var reApos = RegExp(rsApos, "g");
    function createCompounder(callback) {
      return function(string) {
        return arrayReduce(words(deburr(string).replace(reApos, "")), callback, "");
      };
    }
    module.exports = createCompounder;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/kebabCase.js
var require_kebabCase = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/kebabCase.js"(exports, module) {
    var createCompounder = require_createCompounder();
    var kebabCase = createCompounder(function(result, word, index) {
      return result + (index ? "-" : "") + word.toLowerCase();
    });
    module.exports = kebabCase;
  }
});

// ../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/util/OptionalBlueprint.js
var require_OptionalBlueprint = __commonJS({
  "../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/util/OptionalBlueprint.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m3, k3, k22) {
      if (k22 === void 0) k22 = k3;
      var desc = Object.getOwnPropertyDescriptor(m3, k3);
      if (!desc || ("get" in desc ? !m3.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m3[k3];
        } };
      }
      Object.defineProperty(o, k22, desc);
    }) : (function(o, m3, k3, k22) {
      if (k22 === void 0) k22 = k3;
      o[k22] = m3[k3];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v4) {
      Object.defineProperty(o, "default", { enumerable: true, value: v4 });
    }) : function(o, v4) {
      o["default"] = v4;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k3 in mod) if (k3 !== "default" && Object.prototype.hasOwnProperty.call(mod, k3)) __createBinding(result, mod, k3);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OptionalBlueprint = void 0;
    var classnames_1 = __importDefault(require_classnames());
    var kebabCase_1 = __importDefault(require_kebabCase());
    var React = __importStar(require_react());
    var contextTypes_1 = require_contextTypes();
    var OptionalBlueprint;
    (function(OptionalBlueprint2) {
      OptionalBlueprint2.Icon = function(_a) {
        var icon = _a.icon, className = _a.className, _b = _a.size, size = _b === void 0 ? "standard" : _b;
        var blueprintNamespace = React.useContext(contextTypes_1.MosaicContext).blueprintNamespace;
        return React.createElement("span", { className: (0, classnames_1.default)(className, getIconClass(blueprintNamespace, icon), "".concat(blueprintNamespace, "-icon-").concat(size)) });
      };
      function getClasses(blueprintNamespace) {
        var names = [];
        for (var _i = 1; _i < arguments.length; _i++) {
          names[_i - 1] = arguments[_i];
        }
        return names.map(function(name) {
          return "".concat(blueprintNamespace, "-").concat((0, kebabCase_1.default)(name));
        }).join(" ");
      }
      OptionalBlueprint2.getClasses = getClasses;
      function getIconClass(blueprintNamespace, iconName) {
        return "".concat(blueprintNamespace, "-icon-").concat((0, kebabCase_1.default)(iconName));
      }
      OptionalBlueprint2.getIconClass = getIconClass;
    })(OptionalBlueprint = exports.OptionalBlueprint || (exports.OptionalBlueprint = {}));
  }
});

// ../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/MosaicZeroState.js
var require_MosaicZeroState = __commonJS({
  "../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/MosaicZeroState.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || /* @__PURE__ */ (function() {
      var extendStatics = function(d3, b2) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d4, b3) {
          d4.__proto__ = b3;
        } || function(d4, b3) {
          for (var p2 in b3) if (Object.prototype.hasOwnProperty.call(b3, p2)) d4[p2] = b3[p2];
        };
        return extendStatics(d3, b2);
      };
      return function(d3, b2) {
        if (typeof b2 !== "function" && b2 !== null)
          throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
        extendStatics(d3, b2);
        function __() {
          this.constructor = d3;
        }
        d3.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __());
      };
    })();
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MosaicZeroState = void 0;
    var classnames_1 = __importDefault(require_classnames());
    var noop_1 = __importDefault(require_noop());
    var react_1 = __importDefault(require_react());
    var contextTypes_1 = require_contextTypes();
    var OptionalBlueprint_1 = require_OptionalBlueprint();
    var MosaicZeroState = (
      /** @class */
      (function(_super) {
        __extends(MosaicZeroState2, _super);
        function MosaicZeroState2() {
          var _this = _super !== null && _super.apply(this, arguments) || this;
          _this.replace = function() {
            return Promise.resolve(_this.props.createNode()).then(function(node) {
              return _this.context.mosaicActions.replaceWith([], node);
            }).catch(noop_1.default);
          };
          return _this;
        }
        MosaicZeroState2.prototype.render = function() {
          return react_1.default.createElement(
            "div",
            { className: (0, classnames_1.default)("mosaic-zero-state", OptionalBlueprint_1.OptionalBlueprint.getClasses(this.context.blueprintNamespace, "NON_IDEAL_STATE")) },
            react_1.default.createElement(
              "div",
              { className: OptionalBlueprint_1.OptionalBlueprint.getClasses(this.context.blueprintNamespace, "NON_IDEAL_STATE_VISUAL") },
              react_1.default.createElement(OptionalBlueprint_1.OptionalBlueprint.Icon, { className: "default-zero-state-icon", size: "large", icon: "APPLICATIONS" })
            ),
            react_1.default.createElement("h4", { className: OptionalBlueprint_1.OptionalBlueprint.getClasses(this.context.blueprintNamespace, "HEADING") }, "No Windows Present"),
            react_1.default.createElement("div", null, this.props.createNode && react_1.default.createElement("button", { className: (0, classnames_1.default)(OptionalBlueprint_1.OptionalBlueprint.getClasses(this.context.blueprintNamespace, "BUTTON"), OptionalBlueprint_1.OptionalBlueprint.getIconClass(this.context.blueprintNamespace, "ADD")), onClick: this.replace }, "Add New Window"))
          );
        };
        MosaicZeroState2.contextType = contextTypes_1.MosaicContext;
        return MosaicZeroState2;
      })(react_1.default.PureComponent)
    );
    exports.MosaicZeroState = MosaicZeroState;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseValues.js
var require_baseValues = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseValues.js"(exports, module) {
    var arrayMap = require_arrayMap();
    function baseValues(object, props) {
      return arrayMap(props, function(key) {
        return object[key];
      });
    }
    module.exports = baseValues;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/values.js
var require_values = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/values.js"(exports, module) {
    var baseValues = require_baseValues();
    var keys = require_keys();
    function values(object) {
      return object == null ? [] : baseValues(object, keys(object));
    }
    module.exports = values;
  }
});

// ../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/internalTypes.js
var require_internalTypes = __commonJS({
  "../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/internalTypes.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MosaicDropTargetPosition = void 0;
    exports.MosaicDropTargetPosition = {
      TOP: "top",
      BOTTOM: "bottom",
      LEFT: "left",
      RIGHT: "right"
    };
  }
});

// ../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/types.js
var require_types = __commonJS({
  "../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/types.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MosaicDragType = void 0;
    exports.MosaicDragType = {
      WINDOW: "MosaicWindow"
    };
  }
});

// ../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/MosaicDropTarget.js
var require_MosaicDropTarget = __commonJS({
  "../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/MosaicDropTarget.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m3, k3, k22) {
      if (k22 === void 0) k22 = k3;
      var desc = Object.getOwnPropertyDescriptor(m3, k3);
      if (!desc || ("get" in desc ? !m3.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m3[k3];
        } };
      }
      Object.defineProperty(o, k22, desc);
    }) : (function(o, m3, k3, k22) {
      if (k22 === void 0) k22 = k3;
      o[k22] = m3[k3];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v4) {
      Object.defineProperty(o, "default", { enumerable: true, value: v4 });
    }) : function(o, v4) {
      o["default"] = v4;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k3 in mod) if (k3 !== "default" && Object.prototype.hasOwnProperty.call(mod, k3)) __createBinding(result, mod, k3);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MosaicDropTarget = void 0;
    var classnames_1 = __importDefault(require_classnames());
    var react_1 = __importStar(require_react());
    var react_dnd_1 = (init_dist9(), __toCommonJS(dist_exports2));
    var contextTypes_1 = require_contextTypes();
    var types_1 = require_types();
    function MosaicDropTarget(_a) {
      var path = _a.path, position = _a.position;
      var mosaicId = (0, react_1.useContext)(contextTypes_1.MosaicContext).mosaicId;
      var _b = (0, react_dnd_1.useDrop)({
        accept: types_1.MosaicDragType.WINDOW,
        drop: function(item, _monitor) {
          if (mosaicId === (item === null || item === void 0 ? void 0 : item.mosaicId)) {
            return { path, position };
          } else {
            return {};
          }
        },
        collect: function(monitor) {
          return {
            isOver: monitor.isOver(),
            draggedMosaicId: (monitor.getItem() || {}).mosaicId
          };
        }
      }), _c = _b[0], isOver = _c.isOver, draggedMosaicId = _c.draggedMosaicId, connectDropTarget = _b[1];
      return react_1.default.createElement("div", { ref: connectDropTarget, className: (0, classnames_1.default)("drop-target", position, {
        "drop-target-hover": isOver && draggedMosaicId === mosaicId
      }) });
    }
    exports.MosaicDropTarget = MosaicDropTarget;
  }
});

// ../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/RootDropTargets.js
var require_RootDropTargets = __commonJS({
  "../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/RootDropTargets.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RootDropTargets = void 0;
    var classnames_1 = __importDefault(require_classnames());
    var values_1 = __importDefault(require_values());
    var react_1 = __importDefault(require_react());
    var react_dnd_1 = (init_dist9(), __toCommonJS(dist_exports2));
    var internalTypes_1 = require_internalTypes();
    var MosaicDropTarget_1 = require_MosaicDropTarget();
    var types_1 = require_types();
    exports.RootDropTargets = react_1.default.memo(function() {
      var isDragging = (0, react_dnd_1.useDrop)({
        accept: types_1.MosaicDragType.WINDOW,
        collect: function(monitor) {
          return {
            isDragging: monitor.getItem() !== null && monitor.getItemType() === types_1.MosaicDragType.WINDOW
          };
        }
      })[0].isDragging;
      var delayedIsDragging = useDelayedTrue(isDragging, 0);
      return react_1.default.createElement("div", { className: (0, classnames_1.default)("drop-target-container", {
        "-dragging": delayedIsDragging
      }) }, (0, values_1.default)(internalTypes_1.MosaicDropTargetPosition).map(function(position) {
        return react_1.default.createElement(MosaicDropTarget_1.MosaicDropTarget, { position, path: [], key: position });
      }));
    });
    exports.RootDropTargets.displayName = "RootDropTargets";
    function useDelayedTrue(currentValue, delay) {
      var delayedRef = react_1.default.useRef(currentValue);
      var _a = react_1.default.useState(0), setCounter = _a[1];
      var setAndRender = function(newValue) {
        delayedRef.current = newValue;
        setCounter(function(count) {
          return count + 1;
        });
      };
      if (!currentValue) {
        delayedRef.current = false;
      }
      react_1.default.useEffect(function() {
        if (delayedRef.current === currentValue || !currentValue) {
          return;
        }
        var timer = window.setTimeout(function() {
          return setAndRender(true);
        }, delay);
        return function() {
          window.clearTimeout(timer);
        };
      }, [currentValue]);
      return delayedRef.current;
    }
  }
});

// ../node_modules/.pnpm/immutability-helper@3.1.1/node_modules/immutability-helper/index.js
var require_immutability_helper = __commonJS({
  "../node_modules/.pnpm/immutability-helper@3.1.1/node_modules/immutability-helper/index.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function stringifiable(obj) {
      return typeof obj === "object" && !("toString" in obj) ? Object.prototype.toString.call(obj).slice(8, -1) : obj;
    }
    var isProduction2 = typeof process === "object" && true;
    function invariant2(condition, message) {
      if (!condition) {
        if (isProduction2) {
          throw new Error("Invariant failed");
        }
        throw new Error(message());
      }
    }
    exports.invariant = invariant2;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var splice = Array.prototype.splice;
    var toString = Object.prototype.toString;
    function type(obj) {
      return toString.call(obj).slice(8, -1);
    }
    var assign = Object.assign || /* istanbul ignore next */
    (function(target, source) {
      getAllKeys(source).forEach(function(key) {
        if (hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      });
      return target;
    });
    var getAllKeys = typeof Object.getOwnPropertySymbols === "function" ? function(obj) {
      return Object.keys(obj).concat(Object.getOwnPropertySymbols(obj));
    } : function(obj) {
      return Object.keys(obj);
    };
    function copy(object) {
      return Array.isArray(object) ? assign(object.constructor(object.length), object) : type(object) === "Map" ? new Map(object) : type(object) === "Set" ? new Set(object) : object && typeof object === "object" ? assign(Object.create(Object.getPrototypeOf(object)), object) : object;
    }
    var Context = (
      /** @class */
      (function() {
        function Context2() {
          this.commands = assign({}, defaultCommands);
          this.update = this.update.bind(this);
          this.update.extend = this.extend = this.extend.bind(this);
          this.update.isEquals = function(x4, y3) {
            return x4 === y3;
          };
          this.update.newContext = function() {
            return new Context2().update;
          };
        }
        Object.defineProperty(Context2.prototype, "isEquals", {
          get: function() {
            return this.update.isEquals;
          },
          set: function(value) {
            this.update.isEquals = value;
          },
          enumerable: true,
          configurable: true
        });
        Context2.prototype.extend = function(directive, fn) {
          this.commands[directive] = fn;
        };
        Context2.prototype.update = function(object, $spec) {
          var _this = this;
          var spec = typeof $spec === "function" ? { $apply: $spec } : $spec;
          if (!(Array.isArray(object) && Array.isArray(spec))) {
            invariant2(!Array.isArray(spec), function() {
              return "update(): You provided an invalid spec to update(). The spec may not contain an array except as the value of $set, $push, $unshift, $splice or any custom command allowing an array value.";
            });
          }
          invariant2(typeof spec === "object" && spec !== null, function() {
            return "update(): You provided an invalid spec to update(). The spec and every included key path must be plain objects containing one of the " + ("following commands: " + Object.keys(_this.commands).join(", ") + ".");
          });
          var nextObject = object;
          getAllKeys(spec).forEach(function(key) {
            if (hasOwnProperty.call(_this.commands, key)) {
              var objectWasNextObject = object === nextObject;
              nextObject = _this.commands[key](spec[key], nextObject, spec, object);
              if (objectWasNextObject && _this.isEquals(nextObject, object)) {
                nextObject = object;
              }
            } else {
              var nextValueForKey = type(object) === "Map" ? _this.update(object.get(key), spec[key]) : _this.update(object[key], spec[key]);
              var nextObjectValue = type(nextObject) === "Map" ? nextObject.get(key) : nextObject[key];
              if (!_this.isEquals(nextValueForKey, nextObjectValue) || typeof nextValueForKey === "undefined" && !hasOwnProperty.call(object, key)) {
                if (nextObject === object) {
                  nextObject = copy(object);
                }
                if (type(nextObject) === "Map") {
                  nextObject.set(key, nextValueForKey);
                } else {
                  nextObject[key] = nextValueForKey;
                }
              }
            }
          });
          return nextObject;
        };
        return Context2;
      })()
    );
    exports.Context = Context;
    var defaultCommands = {
      $push: function(value, nextObject, spec) {
        invariantPushAndUnshift(nextObject, spec, "$push");
        return value.length ? nextObject.concat(value) : nextObject;
      },
      $unshift: function(value, nextObject, spec) {
        invariantPushAndUnshift(nextObject, spec, "$unshift");
        return value.length ? value.concat(nextObject) : nextObject;
      },
      $splice: function(value, nextObject, spec, originalObject) {
        invariantSplices(nextObject, spec);
        value.forEach(function(args) {
          invariantSplice(args);
          if (nextObject === originalObject && args.length) {
            nextObject = copy(originalObject);
          }
          splice.apply(nextObject, args);
        });
        return nextObject;
      },
      $set: function(value, _nextObject, spec) {
        invariantSet(spec);
        return value;
      },
      $toggle: function(targets, nextObject) {
        invariantSpecArray(targets, "$toggle");
        var nextObjectCopy = targets.length ? copy(nextObject) : nextObject;
        targets.forEach(function(target) {
          nextObjectCopy[target] = !nextObject[target];
        });
        return nextObjectCopy;
      },
      $unset: function(value, nextObject, _spec, originalObject) {
        invariantSpecArray(value, "$unset");
        value.forEach(function(key) {
          if (Object.hasOwnProperty.call(nextObject, key)) {
            if (nextObject === originalObject) {
              nextObject = copy(originalObject);
            }
            delete nextObject[key];
          }
        });
        return nextObject;
      },
      $add: function(values, nextObject, _spec, originalObject) {
        invariantMapOrSet(nextObject, "$add");
        invariantSpecArray(values, "$add");
        if (type(nextObject) === "Map") {
          values.forEach(function(_a) {
            var key = _a[0], value = _a[1];
            if (nextObject === originalObject && nextObject.get(key) !== value) {
              nextObject = copy(originalObject);
            }
            nextObject.set(key, value);
          });
        } else {
          values.forEach(function(value) {
            if (nextObject === originalObject && !nextObject.has(value)) {
              nextObject = copy(originalObject);
            }
            nextObject.add(value);
          });
        }
        return nextObject;
      },
      $remove: function(value, nextObject, _spec, originalObject) {
        invariantMapOrSet(nextObject, "$remove");
        invariantSpecArray(value, "$remove");
        value.forEach(function(key) {
          if (nextObject === originalObject && nextObject.has(key)) {
            nextObject = copy(originalObject);
          }
          nextObject.delete(key);
        });
        return nextObject;
      },
      $merge: function(value, nextObject, _spec, originalObject) {
        invariantMerge(nextObject, value);
        getAllKeys(value).forEach(function(key) {
          if (value[key] !== nextObject[key]) {
            if (nextObject === originalObject) {
              nextObject = copy(originalObject);
            }
            nextObject[key] = value[key];
          }
        });
        return nextObject;
      },
      $apply: function(value, original) {
        invariantApply(value);
        return value(original);
      }
    };
    var defaultContext = new Context();
    exports.isEquals = defaultContext.update.isEquals;
    exports.extend = defaultContext.extend;
    exports.default = defaultContext.update;
    exports.default.default = module.exports = assign(exports.default, exports);
    function invariantPushAndUnshift(value, spec, command) {
      invariant2(Array.isArray(value), function() {
        return "update(): expected target of " + stringifiable(command) + " to be an array; got " + stringifiable(value) + ".";
      });
      invariantSpecArray(spec[command], command);
    }
    function invariantSpecArray(spec, command) {
      invariant2(Array.isArray(spec), function() {
        return "update(): expected spec of " + stringifiable(command) + " to be an array; got " + stringifiable(spec) + ". Did you forget to wrap your parameter in an array?";
      });
    }
    function invariantSplices(value, spec) {
      invariant2(Array.isArray(value), function() {
        return "Expected $splice target to be an array; got " + stringifiable(value);
      });
      invariantSplice(spec.$splice);
    }
    function invariantSplice(value) {
      invariant2(Array.isArray(value), function() {
        return "update(): expected spec of $splice to be an array of arrays; got " + stringifiable(value) + ". Did you forget to wrap your parameters in an array?";
      });
    }
    function invariantApply(fn) {
      invariant2(typeof fn === "function", function() {
        return "update(): expected spec of $apply to be a function; got " + stringifiable(fn) + ".";
      });
    }
    function invariantSet(spec) {
      invariant2(Object.keys(spec).length === 1, function() {
        return "Cannot have more than one key in an object with $set";
      });
    }
    function invariantMerge(target, specValue) {
      invariant2(specValue && typeof specValue === "object", function() {
        return "update(): $merge expects a spec of type 'object'; got " + stringifiable(specValue);
      });
      invariant2(target && typeof target === "object", function() {
        return "update(): $merge expects a target of type 'object'; got " + stringifiable(target);
      });
    }
    function invariantMapOrSet(target, command) {
      var typeOfTarget = type(target);
      invariant2(typeOfTarget === "Map" || typeOfTarget === "Set", function() {
        return "update(): " + stringifiable(command) + " expects a target of type Set or Map; got " + stringifiable(typeOfTarget);
      });
    }
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseSlice.js
var require_baseSlice = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseSlice.js"(exports, module) {
    function baseSlice(array, start, end) {
      var index = -1, length = array.length;
      if (start < 0) {
        start = -start > length ? 0 : length + start;
      }
      end = end > length ? length : end;
      if (end < 0) {
        end += length;
      }
      length = start > end ? 0 : end - start >>> 0;
      start >>>= 0;
      var result = Array(length);
      while (++index < length) {
        result[index] = array[index + start];
      }
      return result;
    }
    module.exports = baseSlice;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/toFinite.js
var require_toFinite = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/toFinite.js"(exports, module) {
    var toNumber = require_toNumber();
    var INFINITY = 1 / 0;
    var MAX_INTEGER = 17976931348623157e292;
    function toFinite(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }
      value = toNumber(value);
      if (value === INFINITY || value === -INFINITY) {
        var sign = value < 0 ? -1 : 1;
        return sign * MAX_INTEGER;
      }
      return value === value ? value : 0;
    }
    module.exports = toFinite;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/toInteger.js
var require_toInteger = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/toInteger.js"(exports, module) {
    var toFinite = require_toFinite();
    function toInteger(value) {
      var result = toFinite(value), remainder = result % 1;
      return result === result ? remainder ? result - remainder : result : 0;
    }
    module.exports = toInteger;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/drop.js
var require_drop = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/drop.js"(exports, module) {
    var baseSlice = require_baseSlice();
    var toInteger = require_toInteger();
    function drop(array, n, guard) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return [];
      }
      n = guard || n === void 0 ? 1 : toInteger(n);
      return baseSlice(array, n < 0 ? 0 : n, length);
    }
    module.exports = drop;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/dropRight.js
var require_dropRight = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/dropRight.js"(exports, module) {
    var baseSlice = require_baseSlice();
    var toInteger = require_toInteger();
    function dropRight(array, n, guard) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return [];
      }
      n = guard || n === void 0 ? 1 : toInteger(n);
      n = length - n;
      return baseSlice(array, 0, n < 0 ? 0 : n);
    }
    module.exports = dropRight;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isEqual.js
var require_isEqual = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isEqual.js"(exports, module) {
    var baseIsEqual = require_baseIsEqual();
    function isEqual(value, other) {
      return baseIsEqual(value, other);
    }
    module.exports = isEqual;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/last.js
var require_last = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/last.js"(exports, module) {
    function last(array) {
      var length = array == null ? 0 : array.length;
      return length ? array[length - 1] : void 0;
    }
    module.exports = last;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/set.js
var require_set = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/set.js"(exports, module) {
    var baseSet = require_baseSet();
    function set(object, path, value) {
      return object == null ? object : baseSet(object, path, value);
    }
    module.exports = set;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/take.js
var require_take = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/take.js"(exports, module) {
    var baseSlice = require_baseSlice();
    var toInteger = require_toInteger();
    function take(array, n, guard) {
      if (!(array && array.length)) {
        return [];
      }
      n = guard || n === void 0 ? 1 : toInteger(n);
      return baseSlice(array, 0, n < 0 ? 0 : n);
    }
    module.exports = take;
  }
});

// ../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/util/mosaicUpdates.js
var require_mosaicUpdates = __commonJS({
  "../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/util/mosaicUpdates.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createExpandUpdate = exports.createHideUpdate = exports.createDragToUpdates = exports.createRemoveUpdate = exports.updateTree = exports.buildSpecFromUpdate = void 0;
    var immutability_helper_1 = __importDefault(require_immutability_helper());
    var drop_1 = __importDefault(require_drop());
    var dropRight_1 = __importDefault(require_dropRight());
    var isEqual_1 = __importDefault(require_isEqual());
    var last_1 = __importDefault(require_last());
    var set_1 = __importDefault(require_set());
    var take_1 = __importDefault(require_take());
    var internalTypes_1 = require_internalTypes();
    var mosaicUtilities_1 = require_mosaicUtilities();
    function buildSpecFromUpdate(mosaicUpdate) {
      if (mosaicUpdate.path.length > 0) {
        return (0, set_1.default)({}, mosaicUpdate.path, mosaicUpdate.spec);
      } else {
        return mosaicUpdate.spec;
      }
    }
    exports.buildSpecFromUpdate = buildSpecFromUpdate;
    function updateTree(root, updates) {
      var currentNode = root;
      updates.forEach(function(mUpdate) {
        currentNode = (0, immutability_helper_1.default)(currentNode, buildSpecFromUpdate(mUpdate));
      });
      return currentNode;
    }
    exports.updateTree = updateTree;
    function createRemoveUpdate(root, path) {
      var parentPath = (0, dropRight_1.default)(path);
      var nodeToRemove = (0, last_1.default)(path);
      var siblingPath = parentPath.concat((0, mosaicUtilities_1.getOtherBranch)(nodeToRemove));
      var sibling = (0, mosaicUtilities_1.getAndAssertNodeAtPathExists)(root, siblingPath);
      return {
        path: parentPath,
        spec: {
          $set: sibling
        }
      };
    }
    exports.createRemoveUpdate = createRemoveUpdate;
    function isPathPrefixEqual(a4, b2, length) {
      return (0, isEqual_1.default)((0, take_1.default)(a4, length), (0, take_1.default)(b2, length));
    }
    function createDragToUpdates(root, sourcePath, destinationPath, position) {
      var destinationNode = (0, mosaicUtilities_1.getAndAssertNodeAtPathExists)(root, destinationPath);
      var updates = [];
      var destinationIsParentOfSource = isPathPrefixEqual(sourcePath, destinationPath, destinationPath.length);
      if (destinationIsParentOfSource) {
        destinationNode = updateTree(destinationNode, [
          createRemoveUpdate(destinationNode, (0, drop_1.default)(sourcePath, destinationPath.length))
        ]);
      } else {
        updates.push(createRemoveUpdate(root, sourcePath));
        var removedNodeParentIsInPath = isPathPrefixEqual(sourcePath, destinationPath, sourcePath.length - 1);
        if (removedNodeParentIsInPath) {
          destinationPath.splice(sourcePath.length - 1, 1);
        }
      }
      var sourceNode = (0, mosaicUtilities_1.getAndAssertNodeAtPathExists)(root, sourcePath);
      var first;
      var second;
      if (position === internalTypes_1.MosaicDropTargetPosition.LEFT || position === internalTypes_1.MosaicDropTargetPosition.TOP) {
        first = sourceNode;
        second = destinationNode;
      } else {
        first = destinationNode;
        second = sourceNode;
      }
      var direction = "column";
      if (position === internalTypes_1.MosaicDropTargetPosition.LEFT || position === internalTypes_1.MosaicDropTargetPosition.RIGHT) {
        direction = "row";
      }
      updates.push({
        path: destinationPath,
        spec: {
          $set: { first, second, direction }
        }
      });
      return updates;
    }
    exports.createDragToUpdates = createDragToUpdates;
    function createHideUpdate(path) {
      var targetPath = (0, dropRight_1.default)(path);
      var thisBranch = (0, last_1.default)(path);
      var splitPercentage;
      if (thisBranch === "first") {
        splitPercentage = 0;
      } else {
        splitPercentage = 100;
      }
      return {
        path: targetPath,
        spec: {
          splitPercentage: {
            $set: splitPercentage
          }
        }
      };
    }
    exports.createHideUpdate = createHideUpdate;
    function createExpandUpdate(path, percentage) {
      var _a;
      var spec = {};
      for (var i3 = path.length - 1; i3 >= 0; i3--) {
        var branch = path[i3];
        var splitPercentage = branch === "first" ? percentage : 100 - percentage;
        spec = (_a = {
          splitPercentage: {
            $set: splitPercentage
          }
        }, _a[branch] = spec, _a);
      }
      return {
        spec,
        path: []
      };
    }
    exports.createExpandUpdate = createExpandUpdate;
  }
});

// ../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/Mosaic.js
var require_Mosaic = __commonJS({
  "../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/Mosaic.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || /* @__PURE__ */ (function() {
      var extendStatics = function(d3, b2) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d4, b3) {
          d4.__proto__ = b3;
        } || function(d4, b3) {
          for (var p2 in b3) if (Object.prototype.hasOwnProperty.call(b3, p2)) d4[p2] = b3[p2];
        };
        return extendStatics(d3, b2);
      };
      return function(d3, b2) {
        if (typeof b2 !== "function" && b2 !== null)
          throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
        extendStatics(d3, b2);
        function __() {
          this.constructor = d3;
        }
        d3.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __());
      };
    })();
    var __assign = exports && exports.__assign || function() {
      __assign = Object.assign || function(t2) {
        for (var s3, i3 = 1, n = arguments.length; i3 < n; i3++) {
          s3 = arguments[i3];
          for (var p2 in s3) if (Object.prototype.hasOwnProperty.call(s3, p2))
            t2[p2] = s3[p2];
        }
        return t2;
      };
      return __assign.apply(this, arguments);
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Mosaic = exports.MosaicWithoutDragDropContext = void 0;
    var classnames_1 = __importDefault(require_classnames());
    var countBy_1 = __importDefault(require_countBy());
    var keys_1 = __importDefault(require_keys());
    var pickBy_1 = __importDefault(require_pickBy());
    var rdndmb_html5_to_touch_1 = (init_dist5(), __toCommonJS(dist_exports));
    var react_1 = __importDefault(require_react());
    var react_dnd_1 = (init_dist9(), __toCommonJS(dist_exports2));
    var react_dnd_multi_backend_1 = (init_dist11(), __toCommonJS(dist_exports3));
    var uuid_1 = require_commonjs_browser();
    var contextTypes_1 = require_contextTypes();
    var MosaicRoot_1 = require_MosaicRoot();
    var MosaicZeroState_1 = require_MosaicZeroState();
    var RootDropTargets_1 = require_RootDropTargets();
    var mosaicUpdates_1 = require_mosaicUpdates();
    var mosaicUtilities_1 = require_mosaicUtilities();
    var DEFAULT_EXPAND_PERCENTAGE = 70;
    function isUncontrolled(props) {
      return props.initialValue != null;
    }
    var MosaicWithoutDragDropContext = (
      /** @class */
      (function(_super) {
        __extends(MosaicWithoutDragDropContext2, _super);
        function MosaicWithoutDragDropContext2() {
          var _this = this;
          var _a;
          _this = _super.apply(this, arguments) || this;
          _this.state = {
            currentNode: null,
            lastInitialValue: null,
            mosaicId: (_a = _this.props.mosaicId) !== null && _a !== void 0 ? _a : (0, uuid_1.v4)()
          };
          _this.updateRoot = function(updates, suppressOnRelease) {
            if (suppressOnRelease === void 0) {
              suppressOnRelease = false;
            }
            var currentNode = _this.getRoot() || {};
            _this.replaceRoot((0, mosaicUpdates_1.updateTree)(currentNode, updates), suppressOnRelease);
          };
          _this.replaceRoot = function(currentNode, suppressOnRelease) {
            if (suppressOnRelease === void 0) {
              suppressOnRelease = false;
            }
            _this.props.onChange(currentNode);
            if (!suppressOnRelease && _this.props.onRelease) {
              _this.props.onRelease(currentNode);
            }
            if (isUncontrolled(_this.props)) {
              _this.setState({ currentNode });
            }
          };
          _this.actions = {
            updateTree: _this.updateRoot,
            remove: function(path) {
              if (path.length === 0) {
                _this.replaceRoot(null);
              } else {
                _this.updateRoot([(0, mosaicUpdates_1.createRemoveUpdate)(_this.getRoot(), path)]);
              }
            },
            expand: function(path, percentage) {
              if (percentage === void 0) {
                percentage = DEFAULT_EXPAND_PERCENTAGE;
              }
              return _this.updateRoot([(0, mosaicUpdates_1.createExpandUpdate)(path, percentage)]);
            },
            getRoot: function() {
              return _this.getRoot();
            },
            hide: function(path) {
              return _this.updateRoot([(0, mosaicUpdates_1.createHideUpdate)(path)]);
            },
            replaceWith: function(path, newNode) {
              return _this.updateRoot([
                {
                  path,
                  spec: {
                    $set: newNode
                  }
                }
              ]);
            }
          };
          _this.childContext = {
            mosaicActions: _this.actions,
            mosaicId: _this.state.mosaicId,
            blueprintNamespace: _this.props.blueprintNamespace
          };
          return _this;
        }
        MosaicWithoutDragDropContext2.getDerivedStateFromProps = function(nextProps, prevState) {
          if (nextProps.mosaicId && prevState.mosaicId !== nextProps.mosaicId && false) {
            throw new Error("Mosaic does not support updating the mosaicId after instantiation");
          }
          if (isUncontrolled(nextProps) && nextProps.initialValue !== prevState.lastInitialValue) {
            return {
              lastInitialValue: nextProps.initialValue,
              currentNode: nextProps.initialValue
            };
          }
          return null;
        };
        MosaicWithoutDragDropContext2.prototype.render = function() {
          var className = this.props.className;
          return react_1.default.createElement(
            contextTypes_1.MosaicContext.Provider,
            { value: this.childContext },
            react_1.default.createElement(
              "div",
              { className: (0, classnames_1.default)(className, "mosaic mosaic-drop-target") },
              this.renderTree(),
              react_1.default.createElement(RootDropTargets_1.RootDropTargets, null)
            )
          );
        };
        MosaicWithoutDragDropContext2.prototype.getRoot = function() {
          if (isUncontrolled(this.props)) {
            return this.state.currentNode;
          } else {
            return this.props.value;
          }
        };
        MosaicWithoutDragDropContext2.prototype.renderTree = function() {
          var root = this.getRoot();
          this.validateTree(root);
          if (root === null || root === void 0) {
            return this.props.zeroStateView;
          } else {
            var _a = this.props, renderTile = _a.renderTile, resize = _a.resize;
            return react_1.default.createElement(MosaicRoot_1.MosaicRoot, { root, renderTile, resize });
          }
        };
        MosaicWithoutDragDropContext2.prototype.validateTree = function(node) {
          if (false) {
            var duplicates = (0, keys_1.default)((0, pickBy_1.default)((0, countBy_1.default)((0, mosaicUtilities_1.getLeaves)(node)), function(n) {
              return n > 1;
            }));
            if (duplicates.length > 0) {
              throw new Error("Duplicate IDs [".concat(duplicates.join(", "), "] detected. Mosaic does not support leaves with the same ID"));
            }
          }
        };
        MosaicWithoutDragDropContext2.defaultProps = {
          onChange: function() {
            return void 0;
          },
          zeroStateView: react_1.default.createElement(MosaicZeroState_1.MosaicZeroState, null),
          className: "mosaic-blueprint-theme",
          blueprintNamespace: "bp3"
        };
        return MosaicWithoutDragDropContext2;
      })(react_1.default.PureComponent)
    );
    exports.MosaicWithoutDragDropContext = MosaicWithoutDragDropContext;
    var Mosaic2 = (
      /** @class */
      (function(_super) {
        __extends(Mosaic3, _super);
        function Mosaic3() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        Mosaic3.prototype.render = function() {
          return react_1.default.createElement(
            react_dnd_1.DndProvider,
            __assign({ backend: react_dnd_multi_backend_1.MultiBackend, options: rdndmb_html5_to_touch_1.HTML5toTouch }, this.props.dragAndDropManager && { manager: this.props.dragAndDropManager }),
            react_1.default.createElement(MosaicWithoutDragDropContext, __assign({}, this.props))
          );
        };
        return Mosaic3;
      })(react_1.default.PureComponent)
    );
    exports.Mosaic = Mosaic2;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseDelay.js
var require_baseDelay = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseDelay.js"(exports, module) {
    var FUNC_ERROR_TEXT = "Expected a function";
    function baseDelay(func, wait, args) {
      if (typeof func != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      return setTimeout(function() {
        func.apply(void 0, args);
      }, wait);
    }
    module.exports = baseDelay;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_apply.js
var require_apply = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_apply.js"(exports, module) {
    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0:
          return func.call(thisArg);
        case 1:
          return func.call(thisArg, args[0]);
        case 2:
          return func.call(thisArg, args[0], args[1]);
        case 3:
          return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }
    module.exports = apply;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_overRest.js
var require_overRest = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_overRest.js"(exports, module) {
    var apply = require_apply();
    var nativeMax = Math.max;
    function overRest(func, start, transform) {
      start = nativeMax(start === void 0 ? func.length - 1 : start, 0);
      return function() {
        var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
        while (++index < length) {
          array[index] = args[start + index];
        }
        index = -1;
        var otherArgs = Array(start + 1);
        while (++index < start) {
          otherArgs[index] = args[index];
        }
        otherArgs[start] = transform(array);
        return apply(func, this, otherArgs);
      };
    }
    module.exports = overRest;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/constant.js
var require_constant = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/constant.js"(exports, module) {
    function constant(value) {
      return function() {
        return value;
      };
    }
    module.exports = constant;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseSetToString.js
var require_baseSetToString = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseSetToString.js"(exports, module) {
    var constant = require_constant();
    var defineProperty = require_defineProperty();
    var identity = require_identity();
    var baseSetToString = !defineProperty ? identity : function(func, string) {
      return defineProperty(func, "toString", {
        "configurable": true,
        "enumerable": false,
        "value": constant(string),
        "writable": true
      });
    };
    module.exports = baseSetToString;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_shortOut.js
var require_shortOut = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_shortOut.js"(exports, module) {
    var HOT_COUNT = 800;
    var HOT_SPAN = 16;
    var nativeNow = Date.now;
    function shortOut(func) {
      var count = 0, lastCalled = 0;
      return function() {
        var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
        lastCalled = stamp;
        if (remaining > 0) {
          if (++count >= HOT_COUNT) {
            return arguments[0];
          }
        } else {
          count = 0;
        }
        return func.apply(void 0, arguments);
      };
    }
    module.exports = shortOut;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_setToString.js
var require_setToString = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_setToString.js"(exports, module) {
    var baseSetToString = require_baseSetToString();
    var shortOut = require_shortOut();
    var setToString = shortOut(baseSetToString);
    module.exports = setToString;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseRest.js
var require_baseRest = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseRest.js"(exports, module) {
    var identity = require_identity();
    var overRest = require_overRest();
    var setToString = require_setToString();
    function baseRest(func, start) {
      return setToString(overRest(func, start, identity), func + "");
    }
    module.exports = baseRest;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/defer.js
var require_defer = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/defer.js"(exports, module) {
    var baseDelay = require_baseDelay();
    var baseRest = require_baseRest();
    var defer = baseRest(function(func, args) {
      return baseDelay(func, 1, args);
    });
    module.exports = defer;
  }
});

// ../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isEmpty.js
var require_isEmpty = __commonJS({
  "../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isEmpty.js"(exports, module) {
    var baseKeys = require_baseKeys();
    var getTag = require_getTag();
    var isArguments = require_isArguments();
    var isArray = require_isArray();
    var isArrayLike = require_isArrayLike();
    var isBuffer = require_isBuffer();
    var isPrototype = require_isPrototype();
    var isTypedArray = require_isTypedArray();
    var mapTag = "[object Map]";
    var setTag = "[object Set]";
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function isEmpty(value) {
      if (value == null) {
        return true;
      }
      if (isArrayLike(value) && (isArray(value) || typeof value == "string" || typeof value.splice == "function" || isBuffer(value) || isTypedArray(value) || isArguments(value))) {
        return !value.length;
      }
      var tag = getTag(value);
      if (tag == mapTag || tag == setTag) {
        return !value.size;
      }
      if (isPrototype(value)) {
        return !baseKeys(value).length;
      }
      for (var key in value) {
        if (hasOwnProperty.call(value, key)) {
          return false;
        }
      }
      return true;
    }
    module.exports = isEmpty;
  }
});

// ../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/buttons/MosaicButton.js
var require_MosaicButton = __commonJS({
  "../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/buttons/MosaicButton.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createDefaultToolbarButton = exports.DefaultToolbarButton = void 0;
    var classnames_1 = __importDefault(require_classnames());
    var react_1 = __importDefault(require_react());
    var contextTypes_1 = require_contextTypes();
    var OptionalBlueprint_1 = require_OptionalBlueprint();
    var DefaultToolbarButton = function(_a) {
      var title = _a.title, className = _a.className, onClick = _a.onClick, text = _a.text;
      var blueprintNamespace = react_1.default.useContext(contextTypes_1.MosaicContext).blueprintNamespace;
      return react_1.default.createElement("button", { title, onClick, className: (0, classnames_1.default)("mosaic-default-control", OptionalBlueprint_1.OptionalBlueprint.getClasses(blueprintNamespace, "BUTTON", "MINIMAL"), className) }, text && react_1.default.createElement("span", { className: "control-text" }, text));
    };
    exports.DefaultToolbarButton = DefaultToolbarButton;
    var createDefaultToolbarButton = function(title, className, onClick, text) {
      return react_1.default.createElement(exports.DefaultToolbarButton, { title, className, onClick, text });
    };
    exports.createDefaultToolbarButton = createDefaultToolbarButton;
  }
});

// ../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/buttons/ExpandButton.js
var require_ExpandButton = __commonJS({
  "../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/buttons/ExpandButton.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || /* @__PURE__ */ (function() {
      var extendStatics = function(d3, b2) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d4, b3) {
          d4.__proto__ = b3;
        } || function(d4, b3) {
          for (var p2 in b3) if (Object.prototype.hasOwnProperty.call(b3, p2)) d4[p2] = b3[p2];
        };
        return extendStatics(d3, b2);
      };
      return function(d3, b2) {
        if (typeof b2 !== "function" && b2 !== null)
          throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
        extendStatics(d3, b2);
        function __() {
          this.constructor = d3;
        }
        d3.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __());
      };
    })();
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExpandButton = void 0;
    var classnames_1 = __importDefault(require_classnames());
    var react_1 = __importDefault(require_react());
    var contextTypes_1 = require_contextTypes();
    var OptionalBlueprint_1 = require_OptionalBlueprint();
    var MosaicButton_1 = require_MosaicButton();
    var ExpandButton = (
      /** @class */
      (function(_super) {
        __extends(ExpandButton2, _super);
        function ExpandButton2() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        ExpandButton2.prototype.render = function() {
          var _this = this;
          return react_1.default.createElement(contextTypes_1.MosaicContext.Consumer, null, function(_a) {
            var mosaicActions = _a.mosaicActions;
            return react_1.default.createElement(MosaicButton_1.DefaultToolbarButton, { title: "Expand", className: (0, classnames_1.default)("expand-button", OptionalBlueprint_1.OptionalBlueprint.getIconClass(_this.context.blueprintNamespace, "MAXIMIZE")), onClick: _this.createExpand(mosaicActions) });
          });
        };
        ExpandButton2.prototype.createExpand = function(mosaicActions) {
          var _this = this;
          return function() {
            mosaicActions.expand(_this.context.mosaicWindowActions.getPath());
            if (_this.props.onClick) {
              _this.props.onClick();
            }
          };
        };
        ExpandButton2.contextType = contextTypes_1.MosaicWindowContext;
        return ExpandButton2;
      })(react_1.default.PureComponent)
    );
    exports.ExpandButton = ExpandButton;
  }
});

// ../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/buttons/RemoveButton.js
var require_RemoveButton = __commonJS({
  "../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/buttons/RemoveButton.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || /* @__PURE__ */ (function() {
      var extendStatics = function(d3, b2) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d4, b3) {
          d4.__proto__ = b3;
        } || function(d4, b3) {
          for (var p2 in b3) if (Object.prototype.hasOwnProperty.call(b3, p2)) d4[p2] = b3[p2];
        };
        return extendStatics(d3, b2);
      };
      return function(d3, b2) {
        if (typeof b2 !== "function" && b2 !== null)
          throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
        extendStatics(d3, b2);
        function __() {
          this.constructor = d3;
        }
        d3.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __());
      };
    })();
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoveButton = void 0;
    var classnames_1 = __importDefault(require_classnames());
    var react_1 = __importDefault(require_react());
    var contextTypes_1 = require_contextTypes();
    var OptionalBlueprint_1 = require_OptionalBlueprint();
    var MosaicButton_1 = require_MosaicButton();
    var RemoveButton = (
      /** @class */
      (function(_super) {
        __extends(RemoveButton2, _super);
        function RemoveButton2() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        RemoveButton2.prototype.render = function() {
          var _this = this;
          return react_1.default.createElement(contextTypes_1.MosaicContext.Consumer, null, function(_a) {
            var mosaicActions = _a.mosaicActions, blueprintNamespace = _a.blueprintNamespace;
            return react_1.default.createElement(MosaicButton_1.DefaultToolbarButton, { title: "Close Window", className: (0, classnames_1.default)("close-button", OptionalBlueprint_1.OptionalBlueprint.getIconClass(blueprintNamespace, "CROSS")), onClick: _this.createRemove(mosaicActions) });
          });
        };
        RemoveButton2.prototype.createRemove = function(mosaicActions) {
          var _this = this;
          return function() {
            mosaicActions.remove(_this.context.mosaicWindowActions.getPath());
            if (_this.props.onClick) {
              _this.props.onClick();
            }
          };
        };
        RemoveButton2.contextType = contextTypes_1.MosaicWindowContext;
        return RemoveButton2;
      })(react_1.default.PureComponent)
    );
    exports.RemoveButton = RemoveButton;
  }
});

// ../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/buttons/ReplaceButton.js
var require_ReplaceButton = __commonJS({
  "../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/buttons/ReplaceButton.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || /* @__PURE__ */ (function() {
      var extendStatics = function(d3, b2) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d4, b3) {
          d4.__proto__ = b3;
        } || function(d4, b3) {
          for (var p2 in b3) if (Object.prototype.hasOwnProperty.call(b3, p2)) d4[p2] = b3[p2];
        };
        return extendStatics(d3, b2);
      };
      return function(d3, b2) {
        if (typeof b2 !== "function" && b2 !== null)
          throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
        extendStatics(d3, b2);
        function __() {
          this.constructor = d3;
        }
        d3.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __());
      };
    })();
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReplaceButton = void 0;
    var classnames_1 = __importDefault(require_classnames());
    var noop_1 = __importDefault(require_noop());
    var react_1 = __importDefault(require_react());
    var contextTypes_1 = require_contextTypes();
    var OptionalBlueprint_1 = require_OptionalBlueprint();
    var MosaicButton_1 = require_MosaicButton();
    var ReplaceButton = (
      /** @class */
      (function(_super) {
        __extends(ReplaceButton2, _super);
        function ReplaceButton2() {
          var _this = _super !== null && _super.apply(this, arguments) || this;
          _this.replace = function() {
            _this.context.mosaicWindowActions.replaceWithNew().then(function() {
              if (_this.props.onClick) {
                _this.props.onClick();
              }
            }).catch(noop_1.default);
          };
          return _this;
        }
        ReplaceButton2.prototype.render = function() {
          return react_1.default.createElement(MosaicButton_1.DefaultToolbarButton, { title: "Replace Window", className: (0, classnames_1.default)("replace-button", OptionalBlueprint_1.OptionalBlueprint.getIconClass(this.context.blueprintNamespace, "EXCHANGE")), onClick: this.replace });
        };
        ReplaceButton2.contextType = contextTypes_1.MosaicWindowContext;
        return ReplaceButton2;
      })(react_1.default.PureComponent)
    );
    exports.ReplaceButton = ReplaceButton;
  }
});

// ../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/buttons/SplitButton.js
var require_SplitButton = __commonJS({
  "../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/buttons/SplitButton.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || /* @__PURE__ */ (function() {
      var extendStatics = function(d3, b2) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d4, b3) {
          d4.__proto__ = b3;
        } || function(d4, b3) {
          for (var p2 in b3) if (Object.prototype.hasOwnProperty.call(b3, p2)) d4[p2] = b3[p2];
        };
        return extendStatics(d3, b2);
      };
      return function(d3, b2) {
        if (typeof b2 !== "function" && b2 !== null)
          throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
        extendStatics(d3, b2);
        function __() {
          this.constructor = d3;
        }
        d3.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __());
      };
    })();
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SplitButton = void 0;
    var classnames_1 = __importDefault(require_classnames());
    var noop_1 = __importDefault(require_noop());
    var react_1 = __importDefault(require_react());
    var contextTypes_1 = require_contextTypes();
    var OptionalBlueprint_1 = require_OptionalBlueprint();
    var MosaicButton_1 = require_MosaicButton();
    var SplitButton = (
      /** @class */
      (function(_super) {
        __extends(SplitButton2, _super);
        function SplitButton2() {
          var _this = _super !== null && _super.apply(this, arguments) || this;
          _this.split = function() {
            _this.context.mosaicWindowActions.split().then(function() {
              if (_this.props.onClick) {
                _this.props.onClick();
              }
            }).catch(noop_1.default);
          };
          return _this;
        }
        SplitButton2.prototype.render = function() {
          return react_1.default.createElement(MosaicButton_1.DefaultToolbarButton, { title: "Split Window", className: (0, classnames_1.default)("split-button", OptionalBlueprint_1.OptionalBlueprint.getIconClass(this.context.blueprintNamespace, "ADD_COLUMN_RIGHT")), onClick: this.split });
        };
        SplitButton2.contextType = contextTypes_1.MosaicWindowContext;
        return SplitButton2;
      })(react_1.default.PureComponent)
    );
    exports.SplitButton = SplitButton;
  }
});

// ../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/buttons/defaultToolbarControls.js
var require_defaultToolbarControls = __commonJS({
  "../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/buttons/defaultToolbarControls.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DEFAULT_CONTROLS_WITHOUT_CREATION = exports.DEFAULT_CONTROLS_WITH_CREATION = void 0;
    var react_1 = __importDefault(require_react());
    var ExpandButton_1 = require_ExpandButton();
    var RemoveButton_1 = require_RemoveButton();
    var ReplaceButton_1 = require_ReplaceButton();
    var SplitButton_1 = require_SplitButton();
    exports.DEFAULT_CONTROLS_WITH_CREATION = react_1.default.Children.toArray([
      react_1.default.createElement(ReplaceButton_1.ReplaceButton, null),
      react_1.default.createElement(SplitButton_1.SplitButton, null),
      react_1.default.createElement(ExpandButton_1.ExpandButton, null),
      react_1.default.createElement(RemoveButton_1.RemoveButton, null)
    ]);
    exports.DEFAULT_CONTROLS_WITHOUT_CREATION = react_1.default.Children.toArray([react_1.default.createElement(ExpandButton_1.ExpandButton, null), react_1.default.createElement(RemoveButton_1.RemoveButton, null)]);
  }
});

// ../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/buttons/Separator.js
var require_Separator = __commonJS({
  "../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/buttons/Separator.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || /* @__PURE__ */ (function() {
      var extendStatics = function(d3, b2) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d4, b3) {
          d4.__proto__ = b3;
        } || function(d4, b3) {
          for (var p2 in b3) if (Object.prototype.hasOwnProperty.call(b3, p2)) d4[p2] = b3[p2];
        };
        return extendStatics(d3, b2);
      };
      return function(d3, b2) {
        if (typeof b2 !== "function" && b2 !== null)
          throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
        extendStatics(d3, b2);
        function __() {
          this.constructor = d3;
        }
        d3.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __());
      };
    })();
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Separator = void 0;
    var react_1 = __importDefault(require_react());
    var Separator = (
      /** @class */
      (function(_super) {
        __extends(Separator2, _super);
        function Separator2() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        Separator2.prototype.render = function() {
          return react_1.default.createElement("div", { className: "separator" });
        };
        return Separator2;
      })(react_1.default.PureComponent)
    );
    exports.Separator = Separator;
  }
});

// ../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/MosaicWindow.js
var require_MosaicWindow = __commonJS({
  "../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/MosaicWindow.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || /* @__PURE__ */ (function() {
      var extendStatics = function(d3, b2) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d4, b3) {
          d4.__proto__ = b3;
        } || function(d4, b3) {
          for (var p2 in b3) if (Object.prototype.hasOwnProperty.call(b3, p2)) d4[p2] = b3[p2];
        };
        return extendStatics(d3, b2);
      };
      return function(d3, b2) {
        if (typeof b2 !== "function" && b2 !== null)
          throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
        extendStatics(d3, b2);
        function __() {
          this.constructor = d3;
        }
        d3.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __());
      };
    })();
    var __assign = exports && exports.__assign || function() {
      __assign = Object.assign || function(t2) {
        for (var s3, i3 = 1, n = arguments.length; i3 < n; i3++) {
          s3 = arguments[i3];
          for (var p2 in s3) if (Object.prototype.hasOwnProperty.call(s3, p2))
            t2[p2] = s3[p2];
        }
        return t2;
      };
      return __assign.apply(this, arguments);
    };
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m3, k3, k22) {
      if (k22 === void 0) k22 = k3;
      var desc = Object.getOwnPropertyDescriptor(m3, k3);
      if (!desc || ("get" in desc ? !m3.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m3[k3];
        } };
      }
      Object.defineProperty(o, k22, desc);
    }) : (function(o, m3, k3, k22) {
      if (k22 === void 0) k22 = k3;
      o[k22] = m3[k3];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v4) {
      Object.defineProperty(o, "default", { enumerable: true, value: v4 });
    }) : function(o, v4) {
      o["default"] = v4;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k3 in mod) if (k3 !== "default" && Object.prototype.hasOwnProperty.call(mod, k3)) __createBinding(result, mod, k3);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MosaicWindow = exports.InternalMosaicWindow = void 0;
    var classnames_1 = __importDefault(require_classnames());
    var defer_1 = __importDefault(require_defer());
    var dropRight_1 = __importDefault(require_dropRight());
    var isEmpty_1 = __importDefault(require_isEmpty());
    var isEqual_1 = __importDefault(require_isEqual());
    var values_1 = __importDefault(require_values());
    var react_1 = __importStar(require_react());
    var react_dnd_1 = (init_dist9(), __toCommonJS(dist_exports2));
    var defaultToolbarControls_1 = require_defaultToolbarControls();
    var Separator_1 = require_Separator();
    var contextTypes_1 = require_contextTypes();
    var internalTypes_1 = require_internalTypes();
    var MosaicDropTarget_1 = require_MosaicDropTarget();
    var types_1 = require_types();
    var mosaicUpdates_1 = require_mosaicUpdates();
    var mosaicUtilities_1 = require_mosaicUtilities();
    var OptionalBlueprint_1 = require_OptionalBlueprint();
    var InternalMosaicWindow = (
      /** @class */
      (function(_super) {
        __extends(InternalMosaicWindow2, _super);
        function InternalMosaicWindow2() {
          var _this = _super !== null && _super.apply(this, arguments) || this;
          _this.state = {
            additionalControlsOpen: false
          };
          _this.rootElement = null;
          _this.renderDropTarget = function(position) {
            var path = _this.props.path;
            return react_1.default.createElement(MosaicDropTarget_1.MosaicDropTarget, { position, path, key: position });
          };
          _this.split = function() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
            }
            _this.checkCreateNode();
            var _a = _this.props, createNode = _a.createNode, path = _a.path;
            var mosaicActions = _this.context.mosaicActions;
            var root = mosaicActions.getRoot();
            var direction = _this.rootElement.offsetWidth > _this.rootElement.offsetHeight ? "row" : "column";
            return Promise.resolve(createNode.apply(void 0, args)).then(function(second) {
              return mosaicActions.replaceWith(path, {
                direction,
                second,
                first: (0, mosaicUtilities_1.getAndAssertNodeAtPathExists)(root, path)
              });
            });
          };
          _this.swap = function() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
            }
            _this.checkCreateNode();
            var mosaicActions = _this.context.mosaicActions;
            var _a = _this.props, createNode = _a.createNode, path = _a.path;
            return Promise.resolve(createNode.apply(void 0, args)).then(function(node) {
              return mosaicActions.replaceWith(path, node);
            });
          };
          _this.setAdditionalControlsOpen = function(additionalControlsOpenOption) {
            var _a, _b;
            var additionalControlsOpen = additionalControlsOpenOption === "toggle" ? !_this.state.additionalControlsOpen : additionalControlsOpenOption;
            _this.setState({ additionalControlsOpen });
            (_b = (_a = _this.props).onAdditionalControlsToggle) === null || _b === void 0 ? void 0 : _b.call(_a, additionalControlsOpen);
          };
          _this.getPath = function() {
            return _this.props.path;
          };
          _this.connectDragSource = function(connectedElements) {
            var connectDragSource = _this.props.connectDragSource;
            return connectDragSource(connectedElements);
          };
          _this.childContext = {
            blueprintNamespace: _this.context.blueprintNamespace,
            mosaicWindowActions: {
              split: _this.split,
              replaceWithNew: _this.swap,
              setAdditionalControlsOpen: _this.setAdditionalControlsOpen,
              getPath: _this.getPath,
              connectDragSource: _this.connectDragSource
            }
          };
          return _this;
        }
        InternalMosaicWindow2.prototype.render = function() {
          var _this = this;
          var _a = this.props, className = _a.className, isOver = _a.isOver, renderPreview = _a.renderPreview, additionalControls = _a.additionalControls, connectDropTarget = _a.connectDropTarget, connectDragPreview = _a.connectDragPreview, draggedMosaicId = _a.draggedMosaicId, disableAdditionalControlsOverlay = _a.disableAdditionalControlsOverlay;
          return react_1.default.createElement(contextTypes_1.MosaicWindowContext.Provider, { value: this.childContext }, connectDropTarget(react_1.default.createElement(
            "div",
            { className: (0, classnames_1.default)("mosaic-window mosaic-drop-target", className, {
              "drop-target-hover": isOver && draggedMosaicId === this.context.mosaicId,
              "additional-controls-open": this.state.additionalControlsOpen
            }), ref: function(element) {
              return _this.rootElement = element;
            } },
            this.renderToolbar(),
            react_1.default.createElement("div", { className: "mosaic-window-body" }, this.props.children),
            !disableAdditionalControlsOverlay && react_1.default.createElement("div", { className: "mosaic-window-body-overlay", onClick: function() {
              _this.setAdditionalControlsOpen(false);
            } }),
            react_1.default.createElement("div", { className: "mosaic-window-additional-actions-bar" }, additionalControls),
            connectDragPreview(renderPreview(this.props)),
            react_1.default.createElement("div", { className: "drop-target-container" }, (0, values_1.default)(internalTypes_1.MosaicDropTargetPosition).map(this.renderDropTarget))
          )));
        };
        InternalMosaicWindow2.prototype.getToolbarControls = function() {
          var _a = this.props, toolbarControls = _a.toolbarControls, createNode = _a.createNode;
          if (toolbarControls) {
            return toolbarControls;
          } else if (createNode) {
            return defaultToolbarControls_1.DEFAULT_CONTROLS_WITH_CREATION;
          } else {
            return defaultToolbarControls_1.DEFAULT_CONTROLS_WITHOUT_CREATION;
          }
        };
        InternalMosaicWindow2.prototype.renderToolbar = function() {
          var _a;
          var _this = this;
          var _b = this.props, title = _b.title, draggable = _b.draggable, additionalControls = _b.additionalControls, additionalControlButtonText = _b.additionalControlButtonText, path = _b.path, renderToolbar = _b.renderToolbar;
          var additionalControlsOpen = this.state.additionalControlsOpen;
          var toolbarControls = this.getToolbarControls();
          var draggableAndNotRoot = draggable && path.length > 0;
          var connectIfDraggable = draggableAndNotRoot ? this.props.connectDragSource : function(el) {
            return el;
          };
          if (renderToolbar) {
            var connectedToolbar = connectIfDraggable(renderToolbar(this.props, draggable));
            return react_1.default.createElement("div", { className: (0, classnames_1.default)("mosaic-window-toolbar", { draggable: draggableAndNotRoot }) }, connectedToolbar);
          }
          var titleDiv = connectIfDraggable(react_1.default.createElement("div", { title, className: "mosaic-window-title" }, title));
          var hasAdditionalControls = !(0, isEmpty_1.default)(additionalControls);
          return react_1.default.createElement(
            "div",
            { className: (0, classnames_1.default)("mosaic-window-toolbar", { draggable: draggableAndNotRoot }) },
            titleDiv,
            react_1.default.createElement(
              "div",
              { className: (0, classnames_1.default)("mosaic-window-controls", OptionalBlueprint_1.OptionalBlueprint.getClasses("BUTTON_GROUP")) },
              hasAdditionalControls && react_1.default.createElement(
                "button",
                { onClick: function() {
                  return _this.setAdditionalControlsOpen(!additionalControlsOpen);
                }, className: (0, classnames_1.default)(OptionalBlueprint_1.OptionalBlueprint.getClasses(this.context.blueprintNamespace, "BUTTON", "MINIMAL"), OptionalBlueprint_1.OptionalBlueprint.getIconClass(this.context.blueprintNamespace, "MORE"), (_a = {}, _a[OptionalBlueprint_1.OptionalBlueprint.getClasses(this.context.blueprintNamespace, "ACTIVE")] = additionalControlsOpen, _a)) },
                react_1.default.createElement("span", { className: "control-text" }, additionalControlButtonText)
              ),
              hasAdditionalControls && react_1.default.createElement(Separator_1.Separator, null),
              toolbarControls
            )
          );
        };
        InternalMosaicWindow2.prototype.checkCreateNode = function() {
          if (this.props.createNode == null) {
            throw new Error("Operation invalid unless `createNode` is defined");
          }
        };
        InternalMosaicWindow2.defaultProps = {
          additionalControlButtonText: "More",
          draggable: true,
          renderPreview: function(_a) {
            var title = _a.title;
            return react_1.default.createElement(
              "div",
              { className: "mosaic-preview" },
              react_1.default.createElement(
                "div",
                { className: "mosaic-window-toolbar" },
                react_1.default.createElement("div", { className: "mosaic-window-title" }, title)
              ),
              react_1.default.createElement(
                "div",
                { className: "mosaic-window-body" },
                react_1.default.createElement("h4", null, title),
                react_1.default.createElement(OptionalBlueprint_1.OptionalBlueprint.Icon, { className: "default-preview-icon", size: "large", icon: "APPLICATION" })
              )
            );
          },
          renderToolbar: null
        };
        InternalMosaicWindow2.contextType = contextTypes_1.MosaicContext;
        return InternalMosaicWindow2;
      })(react_1.default.Component)
    );
    exports.InternalMosaicWindow = InternalMosaicWindow;
    function ConnectedInternalMosaicWindow(props) {
      var _a = (0, react_1.useContext)(contextTypes_1.MosaicContext), mosaicActions = _a.mosaicActions, mosaicId = _a.mosaicId;
      var _b = (0, react_dnd_1.useDrag)({
        type: types_1.MosaicDragType.WINDOW,
        item: function(_monitor) {
          if (props.onDragStart) {
            props.onDragStart();
          }
          var hideTimer = (0, defer_1.default)(function() {
            return mosaicActions.hide(props.path);
          });
          return {
            mosaicId,
            hideTimer
          };
        },
        end: function(item, monitor) {
          var hideTimer = item.hideTimer;
          window.clearTimeout(hideTimer);
          var ownPath = props.path;
          var dropResult = monitor.getDropResult() || {};
          var position = dropResult.position, destinationPath = dropResult.path;
          if (position != null && destinationPath != null && !(0, isEqual_1.default)(destinationPath, ownPath)) {
            mosaicActions.updateTree((0, mosaicUpdates_1.createDragToUpdates)(mosaicActions.getRoot(), ownPath, destinationPath, position));
            if (props.onDragEnd) {
              props.onDragEnd("drop");
            }
          } else {
            mosaicActions.updateTree([
              {
                path: (0, dropRight_1.default)(ownPath),
                spec: {
                  splitPercentage: {
                    $set: void 0
                  }
                }
              }
            ]);
            if (props.onDragEnd) {
              props.onDragEnd("reset");
            }
          }
        }
      }), connectDragSource = _b[1], connectDragPreview = _b[2];
      var _c = (0, react_dnd_1.useDrop)({
        accept: types_1.MosaicDragType.WINDOW,
        collect: function(monitor) {
          var _a2;
          return {
            isOver: monitor.isOver(),
            draggedMosaicId: (_a2 = monitor.getItem()) === null || _a2 === void 0 ? void 0 : _a2.mosaicId
          };
        }
      }), _d = _c[0], isOver = _d.isOver, draggedMosaicId = _d.draggedMosaicId, connectDropTarget = _c[1];
      return react_1.default.createElement(InternalMosaicWindow, __assign({}, props, { connectDragPreview, connectDragSource, connectDropTarget, isOver, draggedMosaicId }));
    }
    var MosaicWindow2 = (
      /** @class */
      (function(_super) {
        __extends(MosaicWindow3, _super);
        function MosaicWindow3() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        MosaicWindow3.prototype.render = function() {
          return react_1.default.createElement(ConnectedInternalMosaicWindow, __assign({}, this.props));
        };
        return MosaicWindow3;
      })(react_1.default.PureComponent)
    );
    exports.MosaicWindow = MosaicWindow2;
  }
});

// ../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/index.js
var require_lib = __commonJS({
  "../node_modules/.pnpm/react-mosaic-component@6.1.1_@types+node@25.9.1_@types+react@19.2.15_dnd-core@16.0.1_re_c1b91c5b70918c3bb9163e59f0bbfe4a/node_modules/react-mosaic-component/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DEFAULT_CONTROLS_WITHOUT_CREATION = exports.DEFAULT_CONTROLS_WITH_CREATION = exports.RemoveButton = exports.SplitButton = exports.ReplaceButton = exports.ExpandButton = exports.Separator = exports.MosaicZeroState = exports.DefaultToolbarButton = exports.createDefaultToolbarButton = exports.MosaicWindow = exports.isParent = exports.getPathToCorner = exports.getOtherDirection = exports.getOtherBranch = exports.getNodeAtPath = exports.getLeaves = exports.getAndAssertNodeAtPathExists = exports.Corner = exports.createBalancedTreeFromLeaves = exports.updateTree = exports.createRemoveUpdate = exports.createHideUpdate = exports.createExpandUpdate = exports.createDragToUpdates = exports.buildSpecFromUpdate = exports.MosaicWindowContext = exports.MosaicContext = exports.MosaicDragType = exports.MosaicWithoutDragDropContext = exports.Mosaic = void 0;
    var Mosaic_1 = require_Mosaic();
    Object.defineProperty(exports, "Mosaic", { enumerable: true, get: function() {
      return Mosaic_1.Mosaic;
    } });
    Object.defineProperty(exports, "MosaicWithoutDragDropContext", { enumerable: true, get: function() {
      return Mosaic_1.MosaicWithoutDragDropContext;
    } });
    var types_1 = require_types();
    Object.defineProperty(exports, "MosaicDragType", { enumerable: true, get: function() {
      return types_1.MosaicDragType;
    } });
    var contextTypes_1 = require_contextTypes();
    Object.defineProperty(exports, "MosaicContext", { enumerable: true, get: function() {
      return contextTypes_1.MosaicContext;
    } });
    Object.defineProperty(exports, "MosaicWindowContext", { enumerable: true, get: function() {
      return contextTypes_1.MosaicWindowContext;
    } });
    var mosaicUpdates_1 = require_mosaicUpdates();
    Object.defineProperty(exports, "buildSpecFromUpdate", { enumerable: true, get: function() {
      return mosaicUpdates_1.buildSpecFromUpdate;
    } });
    Object.defineProperty(exports, "createDragToUpdates", { enumerable: true, get: function() {
      return mosaicUpdates_1.createDragToUpdates;
    } });
    Object.defineProperty(exports, "createExpandUpdate", { enumerable: true, get: function() {
      return mosaicUpdates_1.createExpandUpdate;
    } });
    Object.defineProperty(exports, "createHideUpdate", { enumerable: true, get: function() {
      return mosaicUpdates_1.createHideUpdate;
    } });
    Object.defineProperty(exports, "createRemoveUpdate", { enumerable: true, get: function() {
      return mosaicUpdates_1.createRemoveUpdate;
    } });
    Object.defineProperty(exports, "updateTree", { enumerable: true, get: function() {
      return mosaicUpdates_1.updateTree;
    } });
    var mosaicUtilities_1 = require_mosaicUtilities();
    Object.defineProperty(exports, "createBalancedTreeFromLeaves", { enumerable: true, get: function() {
      return mosaicUtilities_1.createBalancedTreeFromLeaves;
    } });
    Object.defineProperty(exports, "Corner", { enumerable: true, get: function() {
      return mosaicUtilities_1.Corner;
    } });
    Object.defineProperty(exports, "getAndAssertNodeAtPathExists", { enumerable: true, get: function() {
      return mosaicUtilities_1.getAndAssertNodeAtPathExists;
    } });
    Object.defineProperty(exports, "getLeaves", { enumerable: true, get: function() {
      return mosaicUtilities_1.getLeaves;
    } });
    Object.defineProperty(exports, "getNodeAtPath", { enumerable: true, get: function() {
      return mosaicUtilities_1.getNodeAtPath;
    } });
    Object.defineProperty(exports, "getOtherBranch", { enumerable: true, get: function() {
      return mosaicUtilities_1.getOtherBranch;
    } });
    Object.defineProperty(exports, "getOtherDirection", { enumerable: true, get: function() {
      return mosaicUtilities_1.getOtherDirection;
    } });
    Object.defineProperty(exports, "getPathToCorner", { enumerable: true, get: function() {
      return mosaicUtilities_1.getPathToCorner;
    } });
    Object.defineProperty(exports, "isParent", { enumerable: true, get: function() {
      return mosaicUtilities_1.isParent;
    } });
    var MosaicWindow_1 = require_MosaicWindow();
    Object.defineProperty(exports, "MosaicWindow", { enumerable: true, get: function() {
      return MosaicWindow_1.MosaicWindow;
    } });
    var MosaicButton_1 = require_MosaicButton();
    Object.defineProperty(exports, "createDefaultToolbarButton", { enumerable: true, get: function() {
      return MosaicButton_1.createDefaultToolbarButton;
    } });
    Object.defineProperty(exports, "DefaultToolbarButton", { enumerable: true, get: function() {
      return MosaicButton_1.DefaultToolbarButton;
    } });
    var MosaicZeroState_1 = require_MosaicZeroState();
    Object.defineProperty(exports, "MosaicZeroState", { enumerable: true, get: function() {
      return MosaicZeroState_1.MosaicZeroState;
    } });
    var Separator_1 = require_Separator();
    Object.defineProperty(exports, "Separator", { enumerable: true, get: function() {
      return Separator_1.Separator;
    } });
    var ExpandButton_1 = require_ExpandButton();
    Object.defineProperty(exports, "ExpandButton", { enumerable: true, get: function() {
      return ExpandButton_1.ExpandButton;
    } });
    var ReplaceButton_1 = require_ReplaceButton();
    Object.defineProperty(exports, "ReplaceButton", { enumerable: true, get: function() {
      return ReplaceButton_1.ReplaceButton;
    } });
    var SplitButton_1 = require_SplitButton();
    Object.defineProperty(exports, "SplitButton", { enumerable: true, get: function() {
      return SplitButton_1.SplitButton;
    } });
    var RemoveButton_1 = require_RemoveButton();
    Object.defineProperty(exports, "RemoveButton", { enumerable: true, get: function() {
      return RemoveButton_1.RemoveButton;
    } });
    var defaultToolbarControls_1 = require_defaultToolbarControls();
    Object.defineProperty(exports, "DEFAULT_CONTROLS_WITH_CREATION", { enumerable: true, get: function() {
      return defaultToolbarControls_1.DEFAULT_CONTROLS_WITH_CREATION;
    } });
    Object.defineProperty(exports, "DEFAULT_CONTROLS_WITHOUT_CREATION", { enumerable: true, get: function() {
      return defaultToolbarControls_1.DEFAULT_CONTROLS_WITHOUT_CREATION;
    } });
  }
});

// src/sheets-multi/main.tsx
var import_react26 = __toESM(require_react());
var import_react_mosaic_component = __toESM(require_lib());
var import_jsx_runtime5 = __toESM(require_jsx_runtime());
function factory(id) {
  return function createUniverOnContainer() {
    const univer = new Univer({
      locale: "zhCN" /* ZH_CN */,
      locales: {
        ["zhCN" /* ZH_CN */]: zh_CN_default
      },
      logLevel: 4 /* VERBOSE */
    });
    univer.registerPlugin(UniverFormulaEnginePlugin);
    univer.registerPlugin(UniverRenderEnginePlugin);
    univer.registerPlugin(UniverUIPlugin, {
      container: id,
      ribbonType: "classic"
    });
    univer.registerPlugin(UniverDocsPlugin);
    univer.registerPlugin(UniverDocsUIPlugin);
    univer.registerPlugin(UniverSheetsPlugin);
    univer.registerPlugin(UniverSheetsUIPlugin);
    univer.registerPlugin(UniverSheetsFormulaUIPlugin);
    univer.registerPlugin(UniverSheetsNumfmtPlugin);
    univer.registerPlugin(UniverSheetsNumfmtUIPlugin);
    univer.registerPlugin(UniverSheetsFormulaPlugin);
    const data = Tools.deepClone(DEFAULT_WORKBOOK_DATA_DEMO);
    data.id = id;
    univer.createUnit(2 /* UNIVER_SHEET */, data);
  };
}
var TITLE_MAP = {
  a: "Sheet 1",
  b: "Sheet 2",
  c: "Sheet 3"
};
function App() {
  (0, import_react26.useEffect)(() => {
    factory("app-a")();
    factory("app-b")();
    factory("app-c")();
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    import_react_mosaic_component.Mosaic,
    {
      renderTile: (id, path) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        import_react_mosaic_component.MosaicWindow,
        {
          path,
          title: TITLE_MAP[id],
          toolbarControls: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", {}),
          children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { id: `app-${id}`, className: "univer-h-full", children: TITLE_MAP[id] })
        }
      ),
      initialValue: {
        direction: "row",
        first: "a",
        second: {
          direction: "column",
          first: "b",
          second: "c"
        }
      }
    }
  );
}
render(/* @__PURE__ */ (0, import_jsx_runtime5.jsx)(App, {}), document.getElementById("app"));
export {
  App
};
/*! Bundled license information:

classnames/index.js:
  (*!
  	Copyright (c) 2018 Jed Watson.
  	Licensed under the MIT License (MIT), see
  	http://jedwatson.github.io/classnames
  *)

react-mosaic-component/lib/index.js:
  (**
   * @license
   * Copyright 2019 Kevin Verdieck, originally developed at Palantir Technologies, Inc.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *     http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
*/
