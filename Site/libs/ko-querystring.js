(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("knockout"));
	else if(typeof define === 'function' && define.amd)
		define(["knockout"], factory);
	else if(typeof exports === 'object')
		exports["ko-querystring"] = factory(require("knockout"));
	else
		root["ko-querystring"] = factory(root["ko"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.isBool = isBool;
exports.isEmpty = isEmpty;
exports.isNumber = isNumber;
exports.isUndefined = isUndefined;
exports.entries = entries;
exports.omit = omit;
function isBool(x) {
  return typeof x === 'boolean';
}

function isEmpty(x) {
  return x.length === 0;
}

function isNumber(x) {
  return !isNaN(parseFloat(x));
}

function isUndefined(x) {
  return typeof x === 'undefined';
}

function entries(obj) {
  return Object.keys(obj).map(function (k) {
    return [k, obj[k]];
  });
}

function omit(obj, fn) {
  var ret = {};
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = entries(obj)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _step$value = _slicedToArray(_step.value, 2),
          k = _step$value[0],
          v = _step$value[1];

      if (!fn(v)) {
        ret[k] = v;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return ret;
}

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _knockout = __webpack_require__(1);

var _knockout2 = _interopRequireDefault(_knockout);

var _utils = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var query = {};
var links = {};

var _parse = void 0,
    _stringify = void 0;

function getDefaults(config) {
  var defaults = {};
  (0, _utils.entries)(config).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        k = _ref2[0],
        v = _ref2[1];

    return defaults[k] = isQueryParamConfigObject(v) ? v.default : v;
  });
  return defaults;
}

function isQueryParamConfigObject(c) {
  return c && (c.default || c.initial || c.coerce);
}

var Query = function () {
  function Query(config, group) {
    _classCallCheck(this, Query);

    this._group = group;

    if ((0, _utils.isUndefined)(query[this._group])) {
      query[this._group] = {};
      links[this._group] = 1;
    } else {
      links[this._group]++;
    }

    this.set(config);
  }

  _createClass(Query, [{
    key: 'set',
    value: function set(config) {
      var _this = this;

      this._config = config;
      this._defaults = Object.assign({}, this._defaults || {}, getDefaults(config));
      var group = this._group;
      var fromQS = Query.fromQS(group);

      (0, _utils.entries)(config).forEach(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            name = _ref4[0],
            _ref4$ = _ref4[1],
            config = _ref4$ === undefined ? {} : _ref4$;

        _this[name] = query[group][name];

        if ((0, _utils.isUndefined)(_this[name])) {
          var _default = _this._defaults[name];
          var coerce = config.coerce || function (x) {
            return x;
          };
          var init = !(0, _utils.isUndefined)(fromQS[name]) ? fromQS[name] : config.initial;

          _this[name] = query[group][name] = Query.createQueryParam(group, name, _default, init, coerce);
        } else {
          _this[name].set(config);
        }
      });

      _knockout2.default.tasks.runEarly();
    }
  }, {
    key: 'toJS',
    value: function toJS() {
      return (0, _utils.omit)(_knockout2.default.toJS(query[this._group]), _utils.isUndefined);
    }
  }, {
    key: 'toString',
    value: function toString() {
      return Query.stringify(this.toJS());
    }
  }, {
    key: 'asObservable',
    value: function asObservable() {
      var _this2 = this;

      if (!this._forceRecompute) {
        this._forceRecompute = _knockout2.default.observable(false);
      }

      return _knockout2.default.pureComputed(function () {
        _this2._forceRecompute();
        return _this2.toJS();
      });
    }
  }, {
    key: 'clear',
    value: function clear() {
      var _this3 = this;

      Object.keys(query[this._group]).forEach(function (k) {
        return query[_this3._group][k].clear();
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (--links[this._group] === 0) {
        var current = Object.assign({}, Query.fromQS(), this.constructor.getCleanQuery());
        delete current[this._group];
        Query.writeQueryString(current);

        delete query[this._group];
      }
    }
  }], [{
    key: 'setParser',
    value: function setParser(parser) {
      _parse = parser.parse;
      _stringify = parser.stringify;
    }
  }, {
    key: 'getQueryString',
    value: function getQueryString() {
      var matches = /\?([^#]*)/.exec(location.search + location.hash);
      return matches ? matches[1] : '';
    }
  }, {
    key: 'fromQS',
    value: function fromQS(group) {
      var query = this.parse(this.getQueryString());
      return ((0, _utils.isUndefined)(group) ? query : query[group]) || {};
    }
  }, {
    key: 'getCleanQuery',
    value: function getCleanQuery() {
      var _query = {};
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _utils.entries)(query)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = _slicedToArray(_step.value, 2),
              g = _step$value[0],
              q = _step$value[1];

          _query[g] = _knockout2.default.toJS((0, _utils.omit)(q, function (v) {
            return v.isDefault() || (0, _utils.isUndefined)(v()) || (0, _utils.isEmpty)(v()) && !(0, _utils.isNumber)(v()) && !(0, _utils.isBool)(v());
          }));
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (_query[undefined]) {
        Object.assign(_query, _query[undefined]);
        delete _query[undefined];
      }
      return _query;
    }
  }, {
    key: 'writeQueryString',
    value: function writeQueryString(_query) {
      if (!_query) {
        _query = this.getCleanQuery();
      }

      var qs = Query.stringify(_query);

      var currentUrl = location.pathname + location.search + location.hash;
      var currentPathname = /([^?#]*)/.exec(currentUrl)[1];
      var hashMatches = /(#[^!]*)/.exec(currentUrl);

      var newUrl = currentPathname;

      if (qs) {
        newUrl += '?' + qs;
      }

      if (hashMatches) {
        newUrl += hashMatches[1];
      }

      history.replaceState(history.state, document.title, newUrl);
    }
  }, {
    key: 'queueQueryStringWrite',
    value: function queueQueryStringWrite() {
      var _this4 = this;

      if (!this._queuedUpdate) {
        this._queuedUpdate = new Promise(function (resolve) {
          _knockout2.default.tasks.schedule(function () {
            Query.writeQueryString();
            resolve();
            _this4._queuedUpdate = false;
          });
        });
      }

      return this._queuedUpdate;
    }
  }, {
    key: 'createQueryParam',
    value: function createQueryParam(group, name, __default, init, coerce) {
      var _default = _knockout2.default.observable(_knockout2.default.toJS(__default));
      var _p = _knockout2.default.observable((0, _utils.isUndefined)(init) ? _default() : init);
      var isDefault = _knockout2.default.pureComputed(function () {
        return p() === _default();
      });

      var p = _knockout2.default.pureComputed({
        read: function read() {
          return _p();
        },
        write: function write(v) {
          if ((0, _utils.isUndefined)(v)) {
            v = _default();
          }
          if (coerce) {
            v = coerce(v);
          }
          _p(v);
          Query.queueQueryStringWrite();
        }
      });

      Object.assign(p, {
        isDefault: isDefault,
        set: function set(d) {
          if (!isQueryParamConfigObject(d)) {
            if (isDefault() || (0, _utils.isUndefined)(p())) {
              p(d);
            }
            _default(d);
          } else {
            if (d.coerce) {
              coerce = d.coerce;
            }
            if (isDefault() || (0, _utils.isUndefined)(p()) || !(0, _utils.isUndefined)(d.initial)) {
              p((0, _utils.isUndefined)(d.initial) ? d.default : d.initial);
            }
            if (d.default) {
              _default(d.default);
            }
          }
        },
        clear: function clear() {
          return p(_default());
        }
      });

      return p;
    }
  }, {
    key: 'defaultParser',
    get: function get() {
      return {
        parse: function parse(str) {
          return JSON.parse(decodeURIComponent(str || '{}'));
        },
        stringify: function stringify(obj) {
          return JSON.stringify(obj) === '{}' ? '' : encodeURIComponent(JSON.stringify(obj));
        }
      };
    }
  }, {
    key: 'parse',
    get: function get() {
      return _parse || this.defaultParser.parse;
    }
  }, {
    key: 'stringify',
    get: function get() {
      return _stringify || this.defaultParser.stringify;
    }
  }]);

  return Query;
}();

exports.default = Query;

/***/ })
/******/ ]);
});