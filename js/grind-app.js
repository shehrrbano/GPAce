"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * grind-app.jsx - Unified Application Root
 * Sanitized Imports & Strict Hook Ordering
 */
var _React = React,
  useState = _React.useState,
  useEffect = _React.useEffect,
  useCallback = _React.useCallback,
  useMemo = _React.useMemo;

// ─── Component Primitives ───────────────────────────────────────
var Icon = function Icon(_ref) {
  var _paths;
  var name = _ref.name,
    _ref$size = _ref.size,
    size = _ref$size === void 0 ? 18 : _ref$size,
    _ref$stroke = _ref.stroke,
    stroke = _ref$stroke === void 0 ? 1.6 : _ref$stroke,
    _ref$color = _ref.color,
    color = _ref$color === void 0 ? "currentColor" : _ref$color;
  var paths = (_paths = {
    play: /*#__PURE__*/React.createElement("polygon", {
      points: "6 4 20 12 6 20 6 4",
      fill: color,
      stroke: "none"
    }),
    pause: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("rect", {
      x: "6",
      y: "4",
      width: "4",
      height: "16",
      fill: color,
      stroke: "none"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "14",
      y: "4",
      width: "4",
      height: "16",
      fill: color,
      stroke: "none"
    })),
    reset: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
      d: "M3 12a9 9 0 1 0 3-6.7"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 4v5h5"
    })),
    skip: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("polygon", {
      points: "5 4 15 12 5 20 5 4",
      fill: color,
      stroke: color
    }), /*#__PURE__*/React.createElement("line", {
      x1: "19",
      y1: "5",
      x2: "19",
      y2: "19"
    })),
    timer: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "13",
      r: "8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 9v4l2.5 2.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9 2h6"
    })),
    flame: /*#__PURE__*/React.createElement("path", {
      d: "M12 3s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 11 8 12 8 13a4 4 0 0 0 8 0c0-3-2-6-4-10z"
    }),
    brain: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
      d: "M9 4a3 3 0 0 0-3 3v0a3 3 0 0 0-2 5v0a3 3 0 0 0 2 4v0a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V4a3 3 0 0 0-3-3z M15 4a3 3 0 0 1 3 3v0a3 3 0 0 1 2 5v0a3 3 0 0 1-2 4v0a3 3 0 0 1-3 3h0a3 3 0 0 1-3-3"
    })),
    target: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "9"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "5"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "1.5",
      fill: color,
      stroke: "none"
    })),
    list: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "6",
      x2: "20",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "12",
      x2: "20",
      y2: "12"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "18",
      x2: "20",
      y2: "18"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "4",
      cy: "6",
      r: "1",
      fill: color
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "4",
      cy: "12",
      r: "1",
      fill: color
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "4",
      cy: "18",
      r: "1",
      fill: color
    })),
    chart: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
      d: "M4 19V5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M4 19h16"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M7 16l4-5 3 3 5-7"
    })),
    sparkles: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
      d: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"
    })),
    coffee: /*#__PURE__*/React.createElement("path", {
      d: "M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"
    }),
    clip: /*#__PURE__*/React.createElement("path", {
      d: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
    }),
    zap: /*#__PURE__*/React.createElement("polygon", {
      points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2"
    }),
    battery: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("rect", {
      x: "1",
      y: "6",
      width: "18",
      height: "12",
      rx: "2",
      ry: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "23",
      y1: "13",
      x2: "23",
      y2: "11"
    })),
    search: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "11",
      r: "8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "21",
      y1: "21",
      x2: "16.65",
      y2: "16.65"
    })),
    externalLink: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
      d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "15 3 21 3 21 9"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "10",
      y1: "14",
      x2: "21",
      y2: "3"
    })),
    fileText: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
      d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "14 2 14 8 20 8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "16",
      y1: "13",
      x2: "8",
      y2: "13"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "16",
      y1: "17",
      x2: "8",
      y2: "17"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "10 9 9 9 8 9"
    })),
    settings: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
    })),
    plus: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "5",
      x2: "12",
      y2: "19"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "5",
      y1: "12",
      x2: "19",
      y2: "12"
    })),
    code: /*#__PURE__*/React.createElement("polyline", {
      points: "16 18 22 12 16 6 8 6 2 12 8 18"
    })
  }, _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_paths, "zap", /*#__PURE__*/React.createElement("polygon", {
    points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2"
  })), "battery", /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("rect", {
    x: "1",
    y: "6",
    width: "18",
    height: "12",
    rx: "2",
    ry: "2"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "23",
    y1: "13",
    x2: "23",
    y2: "11"
  }))), "settings", /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"
  }))), "plus", /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "5",
    x2: "12",
    y2: "19"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "5",
    y1: "12",
    x2: "19",
    y2: "12"
  }))), "check", /*#__PURE__*/React.createElement("polyline", {
    points: "4 12 10 18 20 6"
  })), "arrowRight", /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
    x1: "5",
    y1: "12",
    x2: "19",
    y2: "12"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "13 6 19 12 13 18"
  }))), "arrowUp", /*#__PURE__*/React.createElement("polyline", {
    points: "18 15 12 9 6 15"
  })), "bell", /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
    d: "M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 19a2 2 0 0 0 4 0"
  }))), "moon", /*#__PURE__*/React.createElement("path", {
    d: "M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"
  })), "sun", /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "4"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "2",
    x2: "12",
    y2: "4"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "20",
    x2: "12",
    y2: "22"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "2",
    y1: "12",
    x2: "4",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "20",
    y1: "12",
    x2: "22",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "5",
    y1: "5",
    x2: "6.5",
    y2: "6.5"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "17.5",
    y1: "17.5",
    x2: "19",
    y2: "19"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "5",
    y1: "19",
    x2: "6.5",
    y2: "17.5"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "17.5",
    y1: "6.5",
    x2: "19",
    y2: "5"
  }))), _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_paths, "grip", /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "6",
    r: "1.2",
    fill: color,
    stroke: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "12",
    r: "1.2",
    fill: color,
    stroke: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "18",
    r: "1.2",
    fill: color,
    stroke: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "15",
    cy: "6",
    r: "1.2",
    fill: color,
    stroke: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "15",
    cy: "12",
    r: "1.2",
    fill: color,
    stroke: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "15",
    cy: "18",
    r: "1.2",
    fill: color,
    stroke: "none"
  }))), "code", /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("polyline", {
    points: "16 18 22 12 16 6"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "8 6 2 12 8 18"
  }))), "coffee", /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
    d: "M18 8h1a4 4 0 0 1 0 8h-1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "6",
    y1: "1",
    x2: "6",
    y2: "4"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "10",
    y1: "1",
    x2: "10",
    y2: "4"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "14",
    y1: "1",
    x2: "14",
    y2: "4"
  }))), "clip", /*#__PURE__*/React.createElement("path", {
    d: "M6 7.91V16a6 6 0 0 0 12 0V4.5a4.5 4.5 0 0 0-9 0V15a3 3 0 0 0 6 0V7.91"
  })), "camera", /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "4",
    width: "18",
    height: "14",
    rx: "2",
    ry: "2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "11",
    r: "3"
  }))), "help", /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "17",
    x2: "12.01",
    y2: "17"
  }))), "chevronUp", /*#__PURE__*/React.createElement("polyline", {
    points: "18 15 12 9 6 15"
  })), "chevronDown", /*#__PURE__*/React.createElement("polyline", {
    points: "6 9 12 15 18 9"
  })), "graphUp", /*#__PURE__*/React.createElement("polyline", {
    points: "23 6 13.5 15.5 8.5 10.5 1 18"
  })), "cards", /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "4",
    width: "16",
    height: "12",
    rx: "2"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "6",
    y: "8",
    width: "16",
    height: "12",
    rx: "2"
  }))), _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_paths, "chat", /*#__PURE__*/React.createElement("path", {
    d: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
  })), "fileText", /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
    d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "14 2 14 8 20 8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "16",
    y1: "13",
    x2: "8",
    y2: "13"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "16",
    y1: "17",
    x2: "8",
    y2: "17"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "10 9 9 9 8 9"
  }))), "folder", /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
    d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
  }))), "search", /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "21",
    y1: "21",
    x2: "16.65",
    y2: "16.65"
  }))), "externalLink", /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
    d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "15 3 21 3 21 9"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "10",
    y1: "14",
    x2: "21",
    y2: "3"
  }))), "link", /*#__PURE__*/React.createElement("path", {
    d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
  })), "circle", /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  })), "refresh", /*#__PURE__*/React.createElement("path", {
    d: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
  })), "key", /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
    d: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zM12 2l.103.103A1.5 1.5 0 0 1 12.553 3H14.5a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 1-.5.5h-1.5a1.5 1.5 0 0 0-1.06.44l-1.503 1.503"
  }))));
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, paths[name]);
};
var formatDate = function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    var d = new Date(dateStr);
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var day = d.getDate();
    var month = months[d.getMonth()];
    var hours = d.getHours();
    var minutes = d.getMinutes().toString().padStart(2, '0');
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return "".concat(day, " ").concat(month, ", ").concat(hours.toString().padStart(2, '0'), ":").concat(minutes, " ").concat(ampm);
  } catch (e) {
    return null;
  }
};

// ─── Main Application ──────────────────────────────────────────
function App() {
  var _useState = useState([]),
    _useState2 = _slicedToArray(_useState, 2),
    tasks = _useState2[0],
    setTasks = _useState2[1];
  var _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    isWorkspaceOpen = _useState4[0],
    setIsWorkspaceOpen = _useState4[1];
  var _useState5 = useState(0),
    _useState6 = _slicedToArray(_useState5, 2),
    insightIdx = _useState6[0],
    setInsightIdx = _useState6[1];
  var _useState7 = useState(0),
    _useState8 = _slicedToArray(_useState7, 2),
    streak = _useState8[0],
    setStreak = _useState8[1];
  var _useState9 = useState({
      timeLeft: 1500,
      duration: 1500,
      isRunning: false,
      mode: 'focus',
      pomodoroCount: 0
    }),
    _useState0 = _slicedToArray(_useState9, 2),
    timerState = _useState0[0],
    setTimerState = _useState0[1];
  var _useState1 = useState([]),
    _useState10 = _slicedToArray(_useState1, 2),
    taskFiles = _useState10[0],
    setTaskFiles = _useState10[1];
  var _useState11 = useState(false),
    _useState12 = _slicedToArray(_useState11, 2),
    loadingTaskFiles = _useState12[0],
    setLoadingTaskFiles = _useState12[1];
  var _useState13 = useState(0),
    _useState14 = _slicedToArray(_useState13, 2),
    focusScore = _useState14[0],
    setFocusScore = _useState14[1];
  var _useState15 = useState(0),
    _useState16 = _slicedToArray(_useState15, 2),
    utilization = _useState16[0],
    setUtilization = _useState16[1];

  // Initialized effect replaced with a no-op to maintain hook order if necessary
  useEffect(function () {}, []);

  // Calibration handlers removed

  var getDynamicCircadianCurve = useCallback(function () {
    var wake = localStorage.getItem('wakeTime') || "07:00";
    var sleep = localStorage.getItem('sleepTime') || "23:00";
    var _wake$split$map = wake.split(':').map(Number),
      _wake$split$map2 = _slicedToArray(_wake$split$map, 1),
      wH = _wake$split$map2[0];
    var _sleep$split$map = sleep.split(':').map(Number),
      _sleep$split$map2 = _slicedToArray(_sleep$split$map, 1),
      sH = _sleep$split$map2[0];
    return Array.from({
      length: 9
    }, function (_, i) {
      var hour = wH + i * (sH - wH) / 8;
      var midpoint = (wH + sH) / 2;
      var variance = Math.sin((hour - midpoint) * (Math.PI / (sH - wH) * 1.5));
      return {
        t: "".concat(Math.floor(hour % 12 || 12)).concat(hour >= 12 ? 'p' : 'a'),
        v: Math.max(0.2, 0.5 + variance * 0.3)
      };
    });
  }, []);
  var insights = useMemo(function () {
    return [{
      tag: "Pattern",
      text: "Your focus peaks between 9–11am. Study high-priority tasks now."
    }, {
      tag: "Risk",
      text: "You've logged ".concat(tasks.filter(function (t) {
        return t.completed;
      }).length, " tasks already. Take a 15-min break.")
    }, {
      tag: "Streak",
      text: "GPAce Streak: ".concat(streak, " days active.")
    }];
  }, [tasks, streak]);
  useEffect(function () {
    var sync = function sync() {
      try {
        var _window$timerControll;
        var storage = window.storageService || (window.getStorage ? window.getStorage() : null);
        if (storage) {
          var tasksJson = storage.get('calculatedPriorityTasks', []);
          var parsedTasks = [];
          if (Array.isArray(tasksJson)) {
            parsedTasks = tasksJson;
          } else if (typeof tasksJson === 'string') {
            try {
              parsedTasks = JSON.parse(tasksJson) || [];
            } catch (e) {
              console.error('[App] JSON Parse failed for tasks:', e);
              parsedTasks = [];
            }
          }
          setTasks(parsedTasks);
          setStreak(storage.get('currentStreak', 0));
        }
        if ((_window$timerControll = window.timerController) !== null && _window$timerControll !== void 0 && _window$timerControll.state) {
          var ts = window.timerController.state;
          setTimerState({
            timeLeft: ts.timeLeft,
            duration: ts.duration || 1500,
            isRunning: ts.isRunning,
            mode: ts.currentState || 'focus',
            pomodoroCount: ts.pomodoroCount
          });
        }
        if (window.statsController) {
          setFocusScore(window.statsController.calculateFocusScore() || 0);
          setUtilization(window.statsController.calculateTimeUtilization() || 0);
        }
      } catch (err) {
        console.error('[App] Sync error:', err);
      }
    };
    sync();
    var id = setInterval(sync, 1000); // Relaxed frequency to 1s
    window.addEventListener('storage', sync);
    window.addEventListener('tasksUpdated', sync);
    return function () {
      clearInterval(id);
      window.removeEventListener('storage', sync);
      window.removeEventListener('tasksUpdated', sync);
    };
  }, [getDynamicCircadianCurve]);
  useEffect(function () {
    var id = setInterval(function () {
      return setInsightIdx(function (i) {
        return (i + 1) % insights.length;
      });
    }, 7000);
    return function () {
      return clearInterval(id);
    };
  }, [insights]);
  var toggleWorkspace = useCallback(function () {
    return setIsWorkspaceOpen(function (prev) {
      return !prev;
    });
  }, []);
  useEffect(function () {
    window.openWorkspace = toggleWorkspace;
  }, [toggleWorkspace]);
  var currentTask = tasks.find(function (t) {
    return t.current;
  }) || tasks.find(function (t) {
    return !t.completed && !t.done;
  });
  var cognitiveLoad = useMemo(function () {
    return tasks.filter(function (t) {
      return !t.completed && !t.done;
    }).reduce(function (sum, t) {
      return sum + (t.weight || 10);
    }, 0);
  }, [tasks]);
  var _useState17 = useState([]),
    _useState18 = _slicedToArray(_useState17, 2),
    libraryFiles = _useState18[0],
    setLibraryFiles = _useState18[1];
  var _useState19 = useState(false),
    _useState20 = _slicedToArray(_useState19, 2),
    loadingLibrary = _useState20[0],
    setLoadingLibrary = _useState20[1];
  useEffect(function () {
    if (!(currentTask !== null && currentTask !== void 0 && currentTask.id)) return;
    var fetchAllFiles = /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
        var _match;
        var projectPrefix, files, _files, _t, _t2;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.p = _context.n) {
            case 0:
              if (window.googleDriveAPI) {
                _context.n = 1;
                break;
              }
              return _context.a(2);
            case 1:
              if (window.googleDriveAPI.isAuthorized) {
                _context.n = 2;
                break;
              }
              console.debug('[App] Skipping Drive fetch: Not authorized');
              return _context.a(2);
            case 2:
              // Fetch Library Files
              projectPrefix = ((_match = (currentTask.projectId || currentTask.id || '').match(/^[a-zA-Z]+/)) === null || _match === void 0 ? void 0 : _match[0]) || '';
              if (!projectPrefix) {
                _context.n = 7;
                break;
              }
              _context.p = 3;
              setLoadingLibrary(true);
              _context.n = 4;
              return window.googleDriveAPI.getSubjectFiles(projectPrefix);
            case 4:
              files = _context.v;
              setLibraryFiles(files || []);
              _context.n = 6;
              break;
            case 5:
              _context.p = 5;
              _t = _context.v;
              console.error('[App] Failed to fetch library files:', _t);
            case 6:
              _context.p = 6;
              setLoadingLibrary(false);
              return _context.f(6);
            case 7:
              _context.p = 7;
              setLoadingTaskFiles(true);
              _context.n = 8;
              return window.googleDriveAPI.getTaskFiles(currentTask.id);
            case 8:
              _files = _context.v;
              setTaskFiles(_files || []);
              _context.n = 10;
              break;
            case 9:
              _context.p = 9;
              _t2 = _context.v;
              console.error('[App] Failed to fetch task files:', _t2);
            case 10:
              _context.p = 10;
              setLoadingTaskFiles(false);
              return _context.f(10);
            case 11:
              return _context.a(2);
          }
        }, _callee, null, [[7, 9, 10, 11], [3, 5, 6, 7]]);
      }));
      return function fetchAllFiles() {
        return _ref2.apply(this, arguments);
      };
    }();
    fetchAllFiles();
    var handleDriveUpdate = function handleDriveUpdate() {
      return fetchAllFiles();
    };
    window.addEventListener('google-drive-initialized', handleDriveUpdate);
    window.addEventListener('google-drive-authenticated', handleDriveUpdate);
    window.addEventListener('google-drive-authorized', handleDriveUpdate); // new: fires on restore

    return function () {
      window.removeEventListener('google-drive-initialized', handleDriveUpdate);
      window.removeEventListener('google-drive-authenticated', handleDriveUpdate);
      window.removeEventListener('google-drive-authorized', handleDriveUpdate);
    };
  }, [currentTask === null || currentTask === void 0 ? void 0 : currentTask.id]);
  return /*#__PURE__*/React.createElement("div", {
    className: "app ".concat(isWorkspaceOpen ? 'workspace-open' : '')
  }, /*#__PURE__*/React.createElement(GlobalProgressBar, null), /*#__PURE__*/React.createElement("div", {
    className: "layout-master"
  }, /*#__PURE__*/React.createElement("main", {
    className: "stage"
  }, /*#__PURE__*/React.createElement("section", {
    className: "left-col"
  }, /*#__PURE__*/React.createElement(CurrentTaskCard, {
    task: currentTask,
    libraryCount: libraryFiles.length,
    taskFiles: taskFiles,
    loadingFiles: loadingTaskFiles
  }), /*#__PURE__*/React.createElement(InsightStrip, {
    insight: insights[insightIdx],
    idx: insightIdx,
    total: insights.length,
    setIdx: setInsightIdx
  }), /*#__PURE__*/React.createElement(SubjectLibrary, {
    files: libraryFiles,
    loading: loadingLibrary,
    taskId: currentTask === null || currentTask === void 0 ? void 0 : currentTask.id
  }), /*#__PURE__*/React.createElement(TaskTimer, null)), /*#__PURE__*/React.createElement("section", {
    className: "right-col"
  }, /*#__PURE__*/React.createElement(TaskQueue, {
    tasks: tasks
  }), /*#__PURE__*/React.createElement(TelemetryGrid, {
    sessions: timerState.pomodoroCount,
    streak: streak,
    focusScore: focusScore,
    utilization: utilization,
    energyData: getDynamicCircadianCurve(),
    mode: timerState.mode,
    isCompact: isWorkspaceOpen
  })))), /*#__PURE__*/React.createElement("div", {
    className: "workspace-panel ".concat(isWorkspaceOpen ? 'is-open' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "workspace-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wh-title"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand-mark small",
    style: {
      width: '24px',
      height: '24px',
      borderRadius: '6px'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "target",
    size: 14,
    color: "var(--accent)"
  })), /*#__PURE__*/React.createElement("span", null, "Workspace Stage")), /*#__PURE__*/React.createElement("button", {
    className: "workspace-close btn-icon ghost",
    onClick: toggleWorkspace,
    "aria-label": "Close Workspace",
    style: {
      transform: 'none'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-x-lg"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "workspace-content"
  }, /*#__PURE__*/React.createElement("iframe", {
    src: "workspace.html",
    frameBorder: "0",
    className: "workspace-iframe",
    title: "GPAce Legacy Stage"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "workspace-overlay ".concat(isWorkspaceOpen ? 'is-visible' : ''),
    onClick: toggleWorkspace
  }), /*#__PURE__*/React.createElement(CommandCenter, {
    onToggleAI: toggleWorkspace
  }), /*#__PURE__*/React.createElement(WorkspaceToggle, {
    active: isWorkspaceOpen,
    onClick: toggleWorkspace
  }));
}

// ─── Sub-Components ──────────────────────────────────────────────

function GlobalProgressBar(_ref3) {
  var isCompact = _ref3.isCompact;
  var _useState21 = useState(0),
    _useState22 = _slicedToArray(_useState21, 2),
    progress = _useState22[0],
    setProgress = _useState22[1];
  var _useState23 = useState(true),
    _useState24 = _slicedToArray(_useState23, 2),
    visible = _useState24[0],
    setVisible = _useState24[1];
  useEffect(function () {
    var p = 30;
    setProgress(p);
    var simInterval = setInterval(function () {
      p = p + (100 - p) * 0.1;
      if (p > 90) p = 90;
      setProgress(p);
    }, 300);
    var completeProgress = function completeProgress() {
      clearInterval(simInterval);
      setProgress(100);
      setTimeout(function () {
        return setVisible(false);
      }, 500);
    };
    if (window.gpace_ready || window.bootstrapManager && window.bootstrapManager.isBooted()) {
      completeProgress();
    } else {
      window.addEventListener('gpace-ready', completeProgress);
      window.addEventListener('appBooted', completeProgress);
    }
    return function () {
      clearInterval(simInterval);
      window.removeEventListener('gpace-ready', completeProgress);
      window.removeEventListener('appBooted', completeProgress);
    };
  }, []);
  if (!visible) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "global-progress-bar ".concat(isCompact ? 'is-compact' : ''),
    style: {
      opacity: progress === 100 ? 0 : 1,
      transition: 'opacity 0.5s ease-out 0.3s'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "gpb-fill",
    style: {
      width: "".concat(progress, "%"),
      transition: progress === 100 ? 'width 0.2s ease-out' : 'width 1s linear'
    }
  }));
}
function TaskTimer(_ref4) {
  var isCompact = _ref4.isCompact;
  var _useState25 = useState({
      timeLeft: 1500,
      duration: 1500,
      isRunning: false,
      mode: 'focus'
    }),
    _useState26 = _slicedToArray(_useState25, 2),
    timerState = _useState26[0],
    setTimerState = _useState26[1];
  useEffect(function () {
    var sync = function sync() {
      var _window$timerControll2;
      if ((_window$timerControll2 = window.timerController) !== null && _window$timerControll2 !== void 0 && _window$timerControll2.state) {
        var ts = window.timerController.state;
        setTimerState({
          timeLeft: ts.timeLeft,
          duration: ts.duration || 1500,
          isRunning: ts.isRunning,
          mode: ts.currentState || 'focus'
        });
      }
    };
    sync();
    var id = setInterval(sync, 250);
    return function () {
      return clearInterval(id);
    };
  }, []);
  var timeLeft = timerState.timeLeft || 0;
  var mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  var ss = String(timeLeft % 60).padStart(2, "0");
  var progress = timeLeft / (timerState.duration || 1500) * 100;
  if (isCompact) {
    return /*#__PURE__*/React.createElement("div", {
      className: "task-timer-indicator is-compact ".concat(timerState.isRunning ? 'running' : 'paused')
    }, /*#__PURE__*/React.createElement("div", {
      className: "tt-content"
    }, /*#__PURE__*/React.createElement("div", {
      className: "tt-time"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mode-dot",
      "data-mode": timerState.mode
    }), /*#__PURE__*/React.createElement("span", null, mm, ":", ss))));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "timer-widget glass-panel " + (timerState.isRunning ? "running" : "paused")
  }, /*#__PURE__*/React.createElement("div", {
    className: "tw-bg-glow"
  }), /*#__PURE__*/React.createElement("div", {
    className: "tw-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tw-main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tw-visual"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 100 100",
    className: "progress-ring"
  }, /*#__PURE__*/React.createElement("circle", {
    className: "ring-bg",
    cx: "50",
    cy: "50",
    r: "45"
  }), /*#__PURE__*/React.createElement("circle", {
    className: "ring-fill",
    cx: "50",
    cy: "50",
    r: "45",
    style: {
      strokeDashoffset: 283 - 283 * progress / 100
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "tw-time-large"
  }, mm, ":", ss)), /*#__PURE__*/React.createElement("div", {
    className: "tw-info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tw-label"
  }, timerState.mode.toUpperCase(), " SESSION"), /*#__PURE__*/React.createElement("div", {
    className: "tw-status"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pulse-dot"
  }), timerState.isRunning ? "ACTIVE" : "PAUSED"))), /*#__PURE__*/React.createElement("div", {
    className: "tw-controls-pro"
  }, /*#__PURE__*/React.createElement("button", {
    className: "tw-ctrl reset",
    onClick: function onClick() {
      var _window$timerControll3;
      return (_window$timerControll3 = window.timerController) === null || _window$timerControll3 === void 0 ? void 0 : _window$timerControll3.handleReset();
    },
    title: "Reset"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "reset",
    size: 18
  })), /*#__PURE__*/React.createElement("button", {
    className: "tw-ctrl main-play",
    onClick: function onClick() {
      var _window$timerControll4;
      return (_window$timerControll4 = window.timerController) === null || _window$timerControll4 === void 0 ? void 0 : _window$timerControll4.handleToggle();
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: timerState.isRunning ? "pause" : "play",
    size: 24,
    fill: "white"
  })), /*#__PURE__*/React.createElement("button", {
    className: "tw-ctrl skip",
    onClick: function onClick() {
      var _window$timerControll5, _window$timerControll6, _window$timerControll7, _window$timerControll8;
      return ((_window$timerControll5 = window.timerController) === null || _window$timerControll5 === void 0 || (_window$timerControll6 = _window$timerControll5.skipSession) === null || _window$timerControll6 === void 0 ? void 0 : _window$timerControll6.call(_window$timerControll5)) || ((_window$timerControll7 = window.timerController) === null || _window$timerControll7 === void 0 || (_window$timerControll8 = _window$timerControll7.skipBreak) === null || _window$timerControll8 === void 0 ? void 0 : _window$timerControll8.call(_window$timerControll7));
    },
    title: "Skip"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "skip",
    size: 18
  })))));
}
function TopBar(_ref5) {
  var sessions = _ref5.sessions,
    isCompact = _ref5.isCompact;
  var _React$useState = React.useState(null),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    user = _React$useState2[0],
    setUser = _React$useState2[1];
  var _React$useState3 = React.useState(null),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    activeDropdown = _React$useState4[0],
    setActiveDropdown = _React$useState4[1];
  useEffect(function () {
    var checkAuth = function checkAuth() {
      if (window.auth) {
        setUser(window.auth.currentUser);
        var unsubscribe = window.auth.onAuthStateChanged(function (u) {
          setUser(u);
        });
        return unsubscribe;
      }
      return null;
    };
    var unsub = checkAuth();
    if (!unsub) {
      var interval = setInterval(function () {
        unsub = checkAuth();
        if (unsub) clearInterval(interval);
      }, 500);
      return function () {
        clearInterval(interval);
        if (unsub && typeof unsub === 'function') unsub();
      };
    }
    return function () {
      if (unsub && typeof unsub === 'function') unsub();
    };
  }, []);
  useEffect(function () {
    var closeDropdown = function closeDropdown() {
      return setActiveDropdown(null);
    };
    document.addEventListener('click', closeDropdown);
    return function () {
      return document.removeEventListener('click', closeDropdown);
    };
  }, []);
  var handleLogin = function handleLogin() {
    if (window.signInWithGoogle) window.signInWithGoogle();
  };
  var handleLogout = function handleLogout() {
    if (window.signOutUser) window.signOutUser();
  };
  var getInitials = function getInitials(name) {
    return name ? name.split(' ').map(function (n) {
      return n[0];
    }).join('').substring(0, 2).toUpperCase() : 'SR';
  };
  var productivityTabs = [{
    id: "grind",
    label: "Grind Mode",
    icon: "flame",
    active: true,
    action: function action() {
      return window.location.href = 'grind.html';
    }
  }, {
    id: "queue",
    label: "Task Queue",
    icon: "list",
    action: function action() {
      return window.location.href = 'tasks.html';
    }
  }, {
    id: "drip",
    label: "Daily Drip",
    icon: "chart",
    action: function action() {
      return window.location.href = 'daily-calendar.html';
    }
  }];
  var studyTabs = [{
    id: "marks",
    label: "Subject Marks",
    icon: "graphUp",
    action: function action() {
      return window.location.href = 'subject-marks.html';
    }
  }, {
    id: "flashcards",
    label: "Flashcards",
    icon: "cards",
    action: function action() {
      return window.location.href = 'flashcards.html';
    }
  }, {
    id: "station",
    label: "Grind Station",
    icon: "target",
    action: function action() {
      return window.location.href = 'study-spaces.html';
    }
  }];
  var appTabs = [{
    id: "juice",
    label: "Brain Juice",
    icon: "brain",
    action: function action() {
      return window.location.href = 'academic-details.html';
    }
  }, {
    id: "hustle",
    label: "Hustle Hub",
    icon: "collection",
    action: function action() {
      return window.location.href = 'extracted.html';
    }
  }, {
    id: "feedback",
    label: "Test Feedback",
    icon: "chat",
    action: function action() {
      return window.location.href = 'instant-test-feedback.html';
    }
  }, {
    id: "converter",
    label: "MD Converter",
    icon: "fileText",
    action: function action() {
      return window.location.href = 'markdown-converter.html';
    }
  }];
  return /*#__PURE__*/React.createElement("header", {
    className: "topbar ".concat(isCompact ? 'is-compact' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand-mark"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "target",
    size: 20,
    color: "var(--accent)"
  })), !isCompact && /*#__PURE__*/React.createElement("div", {
    className: "brand-name"
  }, "GPAce"), /*#__PURE__*/React.createElement("div", {
    className: "brand-meta"
  }, new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).replace(',', ' ·'))), /*#__PURE__*/React.createElement("nav", {
    className: "nav-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tab-group productivity"
  }, productivityTabs.map(function (t) {
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      className: "tab" + (t.active ? " is-active" : ""),
      onClick: t.action,
      title: t.label
    }, /*#__PURE__*/React.createElement(Icon, {
      name: t.icon,
      size: 15
    }), !isCompact && /*#__PURE__*/React.createElement("span", null, t.label));
  })), /*#__PURE__*/React.createElement("div", {
    className: "tab-group utilities"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dropdown-wrap"
  }, /*#__PURE__*/React.createElement("button", {
    className: "tab dropdown-trigger" + (activeDropdown === 'toolkit' ? " is-open" : ""),
    onClick: function onClick(e) {
      e.stopPropagation();
      setActiveDropdown(activeDropdown === 'toolkit' ? null : 'toolkit');
    },
    title: "Toolkit"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "folder",
    size: 15
  }), !isCompact && /*#__PURE__*/React.createElement("span", null, "Toolkit"), /*#__PURE__*/React.createElement(Icon, {
    name: "chevronDown",
    size: 12,
    stroke: 2
  })), activeDropdown === 'toolkit' && /*#__PURE__*/React.createElement("div", {
    className: "dropdown-menu"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dropdown-label"
  }, "Study Tools"), studyTabs.map(function (t) {
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      className: "dropdown-item",
      onClick: t.action
    }, /*#__PURE__*/React.createElement(Icon, {
      name: t.icon,
      size: 14
    }), /*#__PURE__*/React.createElement("span", null, t.label));
  }), /*#__PURE__*/React.createElement("div", {
    className: "dropdown-divider"
  }), /*#__PURE__*/React.createElement("div", {
    className: "dropdown-label"
  }, "Applications"), appTabs.map(function (t) {
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      className: "dropdown-item",
      onClick: t.action
    }, /*#__PURE__*/React.createElement(Icon, {
      name: t.icon,
      size: 14
    }), /*#__PURE__*/React.createElement("span", null, t.label));
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "top-right"
  }, /*#__PURE__*/React.createElement("div", {
    className: "session-pill"
  }, /*#__PURE__*/React.createElement("span", null, sessions, !isCompact && ' sessions')), /*#__PURE__*/React.createElement("button", {
    className: "btn-icon ghost",
    onClick: function onClick() {
      return window.dispatchEvent(new CustomEvent('toggleSettingsDrawer'));
    },
    "aria-label": "Settings",
    title: "Settings"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "settings",
    size: 18
  })), user ? /*#__PURE__*/React.createElement("div", {
    className: "auth-area auth-user",
    onClick: handleLogout,
    title: "Click to Logout",
    style: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center'
    }
  }, user.photoURL ? /*#__PURE__*/React.createElement("img", {
    src: user.photoURL,
    alt: "Avatar",
    className: "avatar",
    style: {
      objectFit: 'cover'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    className: "avatar"
  }, getInitials(user.displayName || user.email))) : /*#__PURE__*/React.createElement("button", {
    className: "btn-ghost small auth-login",
    onClick: handleLogin
  }, "Login")));
}
function CurrentTaskCard(_ref6) {
  var _task$links;
  var task = _ref6.task,
    _ref6$libraryCount = _ref6.libraryCount,
    libraryCount = _ref6$libraryCount === void 0 ? 0 : _ref6$libraryCount,
    _ref6$taskFiles = _ref6.taskFiles,
    taskFiles = _ref6$taskFiles === void 0 ? [] : _ref6$taskFiles,
    _ref6$loadingFiles = _ref6.loadingFiles,
    loadingFiles = _ref6$loadingFiles === void 0 ? false : _ref6$loadingFiles;
  var _React$useState5 = React.useState('subtasks'),
    _React$useState6 = _slicedToArray(_React$useState5, 2),
    activeTab = _React$useState6[0],
    setActiveTab = _React$useState6[1];
  if (!task) {
    return /*#__PURE__*/React.createElement("div", {
      className: "card current-task empty"
    }, /*#__PURE__*/React.createElement("div", {
      className: "muted"
    }, "No active task available"), /*#__PURE__*/React.createElement("button", {
      className: "btn-primary",
      onClick: function onClick() {
        var _window$taskCreationC;
        return (_window$taskCreationC = window.taskCreationController) === null || _window$taskCreationC === void 0 ? void 0 : _window$taskCreationC.showTaskModal();
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 14
    }), " Create Task"));
  }
  var handleInterleave = function handleInterleave() {
    try {
      var _window$taskDisplayCo;
      if (window.interleaveTask) {
        window.interleaveTask();
      } else if ((_window$taskDisplayCo = window.taskDisplayController) !== null && _window$taskDisplayCo !== void 0 && _window$taskDisplayCo.navigateTask) {
        window.taskDisplayController.navigateTask('next');
      }
    } catch (err) {
      console.error('[App] Interleave execution failed:', err);
    }
  };
  var handleSkip = function handleSkip() {
    try {
      var _window$taskDisplayCo2;
      if (window.skipTask) {
        window.skipTask();
      } else if ((_window$taskDisplayCo2 = window.taskDisplayController) !== null && _window$taskDisplayCo2 !== void 0 && _window$taskDisplayCo2.navigateTask) {
        window.taskDisplayController.navigateTask('next');
      }
    } catch (err) {
      console.error('[App] Skip execution failed:', err);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "card current-task"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-header-top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "task-meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "status-badge"
  }, "NOW FOCUSING"), /*#__PURE__*/React.createElement("span", {
    className: "priority-tag " + (task.priority || 'medium')
  }, task.priority, " priority"))), /*#__PURE__*/React.createElement("h1", {
    className: "task-title"
  }, task.title), /*#__PURE__*/React.createElement("div", {
    className: "ct-meta"
  }, /*#__PURE__*/React.createElement("span", null, task.projectId), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, "~", task.est || 90, "m"))), /*#__PURE__*/React.createElement("div", {
    className: "ct-subtabs"
  }, /*#__PURE__*/React.createElement("button", {
    className: "st-btn" + (activeTab === 'subtasks' ? " active" : ""),
    onClick: function onClick() {
      return setActiveTab('subtasks');
    }
  }, "SUBTASKS"), /*#__PURE__*/React.createElement("button", {
    className: "st-btn" + (activeTab === 'attachments' ? " active" : ""),
    onClick: function onClick() {
      return setActiveTab('attachments');
    }
  }, "ATTACHMENTS (", taskFiles.length || 0, ")"), /*#__PURE__*/React.createElement("button", {
    className: "st-btn" + (activeTab === 'links' ? " active" : ""),
    onClick: function onClick() {
      return setActiveTab('links');
    }
  }, "LINKS (", ((_task$links = task.links) === null || _task$links === void 0 ? void 0 : _task$links.length) || 0, ")")), /*#__PURE__*/React.createElement("div", {
    className: "ct-tab-content"
  }, activeTab === 'subtasks' && /*#__PURE__*/React.createElement("div", {
    className: "tab-pane"
  }, task.subtasks && task.subtasks.length > 0 ? /*#__PURE__*/React.createElement("ul", {
    className: "mini-subtask-list"
  }, task.subtasks.map(function (st, i) {
    return /*#__PURE__*/React.createElement("li", {
      key: i,
      className: "mini-st-item"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: st.completed ? "check" : "circle",
      size: 12,
      color: st.completed ? "var(--accent)" : "var(--muted)"
    }), /*#__PURE__*/React.createElement("span", null, st.text || st.title));
  })) : /*#__PURE__*/React.createElement("div", {
    className: "muted smaller",
    style: {
      marginBottom: '8px'
    }
  }, "No subtasks defined"), /*#__PURE__*/React.createElement("button", {
    className: "btn-ghost small",
    style: {
      width: '100%',
      justifyContent: 'center',
      marginTop: '4px'
    },
    onClick: function onClick() {
      var _window$taskCreationC2, _window$taskCreationC3;
      return (_window$taskCreationC2 = window.taskCreationController) === null || _window$taskCreationC2 === void 0 || (_window$taskCreationC3 = _window$taskCreationC2.showSubtaskModal) === null || _window$taskCreationC3 === void 0 ? void 0 : _window$taskCreationC3.call(_window$taskCreationC2, task.id);
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 12
  }), " ADD SUBTASK")), activeTab === 'attachments' && /*#__PURE__*/React.createElement("div", {
    className: "tab-pane"
  }, loadingFiles ? /*#__PURE__*/React.createElement("div", {
    className: "center-all p-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "spinner-small"
  })) : taskFiles.length > 0 ? /*#__PURE__*/React.createElement("div", {
    className: "task-attachments-grid mb-3"
  }, taskFiles.map(function (file) {
    return /*#__PURE__*/React.createElement("div", {
      key: file.id,
      className: "task-attachment-item",
      onClick: function onClick() {
        return window.open(file.webViewLink, '_blank');
      }
    }, file.mimeType.startsWith('image/') ? /*#__PURE__*/React.createElement("img", {
      src: file.thumbnailLink || file.webContentLink,
      alt: file.name,
      className: "attachment-thumb"
    }) : /*#__PURE__*/React.createElement("div", {
      className: "attachment-icon-box"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "fileText",
      size: 24
    })), /*#__PURE__*/React.createElement("span", {
      className: "attachment-name-mini"
    }, file.name));
  })) : /*#__PURE__*/React.createElement("div", {
    className: "muted smaller center-all p-2"
  }, "No specific files for this task"), /*#__PURE__*/React.createElement("div", {
    className: "d-flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-ghost small flex-grow-1",
    style: {
      justifyContent: 'center'
    },
    onClick: function onClick() {
      var _window$openWorkspace, _window;
      return (_window$openWorkspace = (_window = window).openWorkspace) === null || _window$openWorkspace === void 0 ? void 0 : _window$openWorkspace.call(_window, task.id);
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clip",
    size: 12
  }), " SUBJECT LIBRARY"), /*#__PURE__*/React.createElement("button", {
    className: "btn-ghost small flex-grow-1",
    style: {
      justifyContent: 'center'
    },
    onClick: function onClick() {
      var _window$googleDriveAP;
      return (_window$googleDriveAP = window.googleDriveAPI) === null || _window$googleDriveAP === void 0 ? void 0 : _window$googleDriveAP.authorize().then(function () {
        var _window$taskCreationC4;
        return (_window$taskCreationC4 = window.taskCreationController) === null || _window$taskCreationC4 === void 0 ? void 0 : _window$taskCreationC4.showTaskModal();
      });
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 12
  }), " ADD IMAGE"))), activeTab === 'links' && /*#__PURE__*/React.createElement("div", {
    className: "tab-pane"
  }, task.links && task.links.length > 0 ? /*#__PURE__*/React.createElement("ul", {
    className: "mini-link-list"
  }, task.links.map(function (link, i) {
    return /*#__PURE__*/React.createElement("li", {
      key: i,
      className: "mini-link-item"
    }, /*#__PURE__*/React.createElement("a", {
      href: link.url || link,
      target: "_blank",
      rel: "noopener noreferrer"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "link",
      size: 12
    }), " ", link.title || (typeof link === 'string' ? link.substring(0, 30) + '...' : 'External Link')));
  })) : /*#__PURE__*/React.createElement("div", {
    className: "muted smaller",
    style: {
      marginBottom: '8px'
    }
  }, "No links attached"), /*#__PURE__*/React.createElement("button", {
    className: "btn-ghost small",
    style: {
      width: '100%',
      justifyContent: 'center',
      marginTop: '4px'
    },
    onClick: function onClick() {
      var _window$addNewLink, _window2;
      return (_window$addNewLink = (_window2 = window).addNewLink) === null || _window$addNewLink === void 0 ? void 0 : _window$addNewLink.call(_window2, task.id);
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 12
  }), " ADD LINK"))), /*#__PURE__*/React.createElement("div", {
    className: "ct-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-ghost",
    onClick: function onClick() {
      try {
        var sys = window.TaskSystem || window.taskService;
        if (sys !== null && sys !== void 0 && sys.completeTask) {
          sys.completeTask(task.projectId, task.id);
        }
      } catch (err) {
        console.error('[App] Complete Task failed:', err);
      }
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 14
  }), " COMPLETE"), /*#__PURE__*/React.createElement("button", {
    className: "btn-interleave",
    onClick: handleInterleave
  }, /*#__PURE__*/React.createElement("div", {
    className: "btn-label-stack"
  }, /*#__PURE__*/React.createElement("div", {
    className: "btn-primary-row"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "refresh",
    size: 14
  }), " INTERLEAVE"), task.lastInterleaved && /*#__PURE__*/React.createElement("div", {
    className: "btn-timestamp"
  }, "Last Reviewed: ", formatDate(task.lastInterleaved)))), /*#__PURE__*/React.createElement("button", {
    className: "btn-ghost",
    onClick: handleSkip
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "skip",
    size: 14
  }), " SKIP"), /*#__PURE__*/React.createElement("button", {
    className: "btn-ghost",
    onClick: function onClick() {
      var _window$performAISear, _window3;
      return (_window$performAISear = (_window3 = window).performAISearch) === null || _window$performAISear === void 0 ? void 0 : _window$performAISear.call(_window3);
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkles",
    size: 14
  }), " AI HELP")));
}
function SubjectLibrary(_ref7) {
  var files = _ref7.files,
    loading = _ref7.loading,
    taskId = _ref7.taskId;
  var _React$useState7 = React.useState(''),
    _React$useState8 = _slicedToArray(_React$useState7, 2),
    filter = _React$useState8[0],
    setFilter = _React$useState8[1];

  // Helper: check if user was previously connected (survives token expiry)
  var wasConnectedBefore = function wasConnectedBefore() {
    try {
      return localStorage.getItem('gpace_gdrive_was_connected') === 'true';
    } catch (e) {
      return false;
    }
  };

  // Tri-state: true = authorized, false = not connected, 'connecting' = initializing a previous session
  var getInitialAuthState = function getInitialAuthState() {
    var _window$googleDriveAP2, _window$googleDriveAP3;
    if ((_window$googleDriveAP2 = window.googleDriveAPI) !== null && _window$googleDriveAP2 !== void 0 && _window$googleDriveAP2.isAuthorized) return true;
    if (!((_window$googleDriveAP3 = window.googleDriveAPI) !== null && _window$googleDriveAP3 !== void 0 && _window$googleDriveAP3.isInitialized) && wasConnectedBefore()) return 'connecting';
    return false;
  };
  var _React$useState9 = React.useState(getInitialAuthState),
    _React$useState0 = _slicedToArray(_React$useState9, 2),
    isAuthorized = _React$useState0[0],
    setIsAuthorized = _React$useState0[1];
  React.useEffect(function () {
    var onAuthorized = function onAuthorized() {
      return setIsAuthorized(true);
    };
    var onSignedOut = function onSignedOut() {
      return setIsAuthorized(false);
    };
    var updateAuthStatus = function updateAuthStatus() {
      var _window$googleDriveAP4, _window$googleDriveAP5;
      if ((_window$googleDriveAP4 = window.googleDriveAPI) !== null && _window$googleDriveAP4 !== void 0 && _window$googleDriveAP4.isAuthorized) {
        setIsAuthorized(true);
      } else if ((_window$googleDriveAP5 = window.googleDriveAPI) !== null && _window$googleDriveAP5 !== void 0 && _window$googleDriveAP5.isInitialized) {
        // Initialized but not authorized — show connect button
        setIsAuthorized(false);
      }
      // If not initialized yet and was connected before, keep 'connecting'
    };
    window.addEventListener('google-drive-authorized', onAuthorized);
    window.addEventListener('google-drive-authenticated', onAuthorized);
    window.addEventListener('google-drive-signed-out', onSignedOut);
    window.addEventListener('google-drive-initialized', updateAuthStatus);

    // Polling fallback: check every 300ms for up to 6 seconds after mount
    // Handles case where Drive was already initialized before component mounted
    var pollCount = 0;
    var pollInterval = setInterval(function () {
      var _window$googleDriveAP6, _window$googleDriveAP7;
      pollCount++;
      if ((_window$googleDriveAP6 = window.googleDriveAPI) !== null && _window$googleDriveAP6 !== void 0 && _window$googleDriveAP6.isAuthorized) {
        setIsAuthorized(true);
        clearInterval(pollInterval);
      } else if ((_window$googleDriveAP7 = window.googleDriveAPI) !== null && _window$googleDriveAP7 !== void 0 && _window$googleDriveAP7.isInitialized || pollCount >= 20) {
        // Initialized but not authorized, OR timed out — resolve to false
        setIsAuthorized(function (prev) {
          return prev === 'connecting' ? false : prev;
        });
        clearInterval(pollInterval);
      }
    }, 300);
    return function () {
      window.removeEventListener('google-drive-authorized', onAuthorized);
      window.removeEventListener('google-drive-authenticated', onAuthorized);
      window.removeEventListener('google-drive-signed-out', onSignedOut);
      window.removeEventListener('google-drive-initialized', updateAuthStatus);
      clearInterval(pollInterval);
    };
  }, []);
  var filteredFiles = React.useMemo(function () {
    var unique = (files || []).filter(function (f, i, self) {
      return self.findIndex(function (t) {
        return t.id === f.id;
      }) === i;
    });
    return unique.filter(function (f) {
      var _f$appProperties;
      var isLibrary = ((_f$appProperties = f.appProperties) === null || _f$appProperties === void 0 ? void 0 : _f$appProperties.isLibraryItem) === 'true';
      var isTextbook = /textbook|reference|manual|handbook|guide|syllabus/i.test(f.name);

      // Prioritize properly tagged library items and academic reference materials
      return (isLibrary || isTextbook) && f.name.toLowerCase().includes(filter.toLowerCase());
    });
  }, [files, filter]);
  var getFileBadge = function getFileBadge(file) {
    var _file$appProperties, _file$appProperties2;
    var materialType = ((_file$appProperties = file.appProperties) === null || _file$appProperties === void 0 ? void 0 : _file$appProperties.materialType) || ((_file$appProperties2 = file.appProperties) === null || _file$appProperties2 === void 0 ? void 0 : _file$appProperties2.category);
    if (materialType) {
      var type = materialType.toLowerCase();
      if (type.includes('reference')) return /*#__PURE__*/React.createElement("span", {
        className: "sl-badge badge-reference"
      }, "REFERENCE");
      if (type.includes('textbook')) return /*#__PURE__*/React.createElement("span", {
        className: "sl-badge badge-textbook"
      }, "TEXTBOOK");
      if (type.includes('solution')) return /*#__PURE__*/React.createElement("span", {
        className: "sl-badge badge-solution"
      }, "SOLUTION");
      return /*#__PURE__*/React.createElement("span", {
        className: "sl-badge badge-general"
      }, type.toUpperCase());
    }
    var n = file.name.toLowerCase();
    if (n.includes('reference')) return /*#__PURE__*/React.createElement("span", {
      className: "sl-badge badge-reference"
    }, "REFERENCE");
    if (n.includes('textbook')) return /*#__PURE__*/React.createElement("span", {
      className: "sl-badge badge-textbook"
    }, "TEXTBOOK");
    if (n.includes('solution')) return /*#__PURE__*/React.createElement("span", {
      className: "sl-badge badge-solution"
    }, "SOLUTION");
    return null;
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "subject-library glass-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sl-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sl-title"
  }, "SUBJECT LIBRARY"), /*#__PURE__*/React.createElement("div", {
    className: "sl-search"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 10
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "sl-filter",
    className: "visually-hidden"
  }, "Filter subject library"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    id: "sl-filter",
    name: "libraryFilter",
    placeholder: "Filter...",
    value: filter,
    onChange: function onChange(e) {
      return setFilter(e.target.value);
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "sl-scroll-area"
  }, isAuthorized === 'connecting' ? /*#__PURE__*/React.createElement("div", {
    className: "center-all flex-col",
    style: {
      height: '120px',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "spinner-small"
  }), /*#__PURE__*/React.createElement("div", {
    className: "muted smaller",
    style: {
      opacity: 0.6
    }
  }, "Restoring Drive...")) : !isAuthorized ? /*#__PURE__*/React.createElement("div", {
    className: "center-all flex-col",
    style: {
      height: '120px',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "muted smaller"
  }, "Drive Access Required"), /*#__PURE__*/React.createElement("button", {
    className: "btn-ghost small",
    onClick: function onClick() {
      var _window$googleDriveAP8;
      return (_window$googleDriveAP8 = window.googleDriveAPI) === null || _window$googleDriveAP8 === void 0 ? void 0 : _window$googleDriveAP8.authorize(false);
    },
    style: {
      padding: '6px 12px',
      borderColor: 'var(--accent)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "zap",
    size: 12
  }), " Connect Drive")) : loading ? /*#__PURE__*/React.createElement("div", {
    className: "muted smaller center-all",
    style: {
      height: '100px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "spinner-small"
  }), " Loading...") : filteredFiles.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "muted smaller center-all",
    style: {
      height: '100px'
    }
  }, filter ? 'No matches' : 'Empty Library') : /*#__PURE__*/React.createElement("div", {
    className: "sl-list"
  }, filteredFiles.map(function (file) {
    return /*#__PURE__*/React.createElement("div", {
      key: file.id,
      className: "sl-item"
    }, /*#__PURE__*/React.createElement("div", {
      className: "sl-item-main"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "fileText",
      size: 14,
      className: "muted"
    }), /*#__PURE__*/React.createElement("div", {
      className: "sl-item-info"
    }, /*#__PURE__*/React.createElement("span", {
      className: "sl-name"
    }, file.name), getFileBadge(file))), /*#__PURE__*/React.createElement("div", {
      className: "sl-item-actions"
    }, /*#__PURE__*/React.createElement("a", {
      href: file.webViewLink,
      target: "_blank",
      className: "sl-action-btn",
      title: "Open"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "externalLink",
      size: 12
    }))));
  }))), /*#__PURE__*/React.createElement("button", {
    className: "btn-add-library",
    onClick: function onClick() {
      var _window$noteToTaskCon;
      return (_window$noteToTaskCon = window.noteToTaskController) === null || _window$noteToTaskCon === void 0 ? void 0 : _window$noteToTaskCon.openFilePicker();
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 10
  }), " ADD TO LIBRARY"));
}
function InsightStrip(_ref8) {
  var insight = _ref8.insight,
    idx = _ref8.idx,
    total = _ref8.total,
    setIdx = _ref8.setIdx,
    isCompact = _ref8.isCompact;
  if (!insight || isCompact) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "card insight"
  }, /*#__PURE__*/React.createElement("div", {
    className: "insight-icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkles",
    size: 16
  })), /*#__PURE__*/React.createElement("div", {
    className: "insight-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "insight-tag"
  }, "Gemini \xB7 ", insight.tag), /*#__PURE__*/React.createElement("div", {
    className: "insight-text"
  }, insight.text)), /*#__PURE__*/React.createElement("div", {
    className: "insight-nav"
  }, _toConsumableArray(Array(total)).map(function (_, i) {
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      className: "d" + (i === idx ? " active" : ""),
      onClick: function onClick() {
        return setIdx(i);
      }
    });
  })));
}
function TaskQueue(_ref9) {
  var tasks = _ref9.tasks,
    isCompact = _ref9.isCompact;
  var open = tasks.filter(function (t) {
    return !t.completed && !t.done;
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "card queue ".concat(isCompact ? 'is-compact' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "queue-head"
  }, /*#__PURE__*/React.createElement("h3", null, "Up next"), !isCompact && /*#__PURE__*/React.createElement("button", {
    className: "btn-ghost small",
    onClick: function onClick() {
      var _window$taskCreationC5;
      return (_window$taskCreationC5 = window.taskCreationController) === null || _window$taskCreationC5 === void 0 ? void 0 : _window$taskCreationC5.showTaskModal();
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 13
  }), " Add")), /*#__PURE__*/React.createElement("ul", {
    className: "task-list"
  }, open.slice(1, isCompact ? 4 : 6).map(function (t) {
    return /*#__PURE__*/React.createElement("li", {
      key: t.id,
      className: "task-row" + (t.current ? " is-current" : "")
    }, /*#__PURE__*/React.createElement("button", {
      className: "check",
      onClick: function onClick() {
        var _window$TaskSystem;
        return (_window$TaskSystem = window.TaskSystem) === null || _window$TaskSystem === void 0 ? void 0 : _window$TaskSystem.completeTask(t.projectId, t.id);
      },
      "aria-label": "Complete"
    }, /*#__PURE__*/React.createElement("span", {
      className: "check-box"
    })), /*#__PURE__*/React.createElement("div", {
      className: "task-main",
      onClick: function onClick() {
        var _window$taskDisplayCo3;
        return (_window$taskDisplayCo3 = window.taskDisplayController) === null || _window$taskDisplayCo3 === void 0 ? void 0 : _window$taskDisplayCo3.navigateTask('next');
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "task-title"
    }, t.title), /*#__PURE__*/React.createElement("div", {
      className: "task-meta"
    }, /*#__PURE__*/React.createElement("span", {
      className: "course-pill"
    }, t.projectId), !isCompact && t.links && t.links.length > 0 && /*#__PURE__*/React.createElement("span", {
      className: "meta-badge"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "link",
      size: 10
    }), " ", t.links.length))), /*#__PURE__*/React.createElement("div", {
      className: "task-right"
    }, /*#__PURE__*/React.createElement("span", {
      className: "prio-dot prio-" + (t.priority || 'medium')
    })));
  })));
}
function EnergyGraph(_ref0) {
  var data = _ref0.data;
  var canvasRef = React.useRef(null);
  React.useEffect(function () {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.width;
    var h = canvas.height;

    // Use theme colors
    var accent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#00a3c4';
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2 * dpr;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    var points = data.map(function (d, i) {
      return {
        x: i / (data.length - 1) * w,
        y: h - d.v * h * 0.7 - h * 0.15
      };
    });
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < points.length; i++) {
      var xc = (points[i].x + points[i - 1].x) / 2;
      var yc = (points[i].y + points[i - 1].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.stroke();

    // Gradient fill
    var grad = ctx.createLinearGradient(0, 0, 0, h);
    // Support oklch transparency safely, fallback to rgba if needed
    var fillStyle = 'rgba(56, 189, 248, 0.2)'; // Safe default fallback
    try {
      if (accent.includes('oklch')) {
        // Many browsers do not yet support oklch in canvas gradients.
        // Using a safe rgba fallback that matches the Grind Mode blue accent.
        fillStyle = 'rgba(56, 189, 248, 0.2)';
      } else if (accent.startsWith('#')) {
        fillStyle = accent + '33';
      } else if (accent.startsWith('rgb')) {
        fillStyle = accent.replace('rgb', 'rgba').replace(')', ', 0.2)');
      }
    } catch (e) {
      console.warn('Canvas color parse fallback applied', e);
    }
    grad.addColorStop(0, fillStyle);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Current time indicator
    var now = new Date();
    var currentHour = now.getHours() + now.getMinutes() / 60;
    var wake = localStorage.getItem('wakeTime') || "07:00";
    var sleep = localStorage.getItem('sleepTime') || "23:00";
    var _wake$split$map3 = wake.split(':').map(Number),
      _wake$split$map4 = _slicedToArray(_wake$split$map3, 1),
      wH = _wake$split$map4[0];
    var _sleep$split$map3 = sleep.split(':').map(Number),
      _sleep$split$map4 = _slicedToArray(_sleep$split$map3, 1),
      sH = _sleep$split$map4[0];
    if (currentHour >= wH && currentHour <= sH) {
      var progress = (currentHour - wH) / (sH - wH);
      var cx = progress * w;

      // Find Y at cx using linear interpolation of points
      var idx = Math.max(0, Math.min(points.length - 2, Math.floor(progress * (points.length - 1))));
      var p1 = points[idx];
      var p2 = points[idx + 1];
      var segmentProgress = progress * (points.length - 1) % 1;
      var cy = p1.y + (p2.y - p1.y) * segmentProgress;
      ctx.beginPath();
      ctx.fillStyle = accent;
      ctx.arc(cx, cy, 3 * dpr, 0, Math.PI * 2);
      ctx.fill();

      // Glow
      ctx.shadowBlur = 8 * dpr;
      ctx.shadowColor = accent;
      ctx.stroke();
    }
  }, [data]);
  return /*#__PURE__*/React.createElement("canvas", {
    ref: canvasRef,
    width: 240,
    height: 60,
    style: {
      width: '100%',
      height: '60px',
      display: 'block'
    }
  });
}
function TelemetryGrid(_ref1) {
  var sessions = _ref1.sessions,
    streak = _ref1.streak,
    focusScore = _ref1.focusScore,
    utilization = _ref1.utilization,
    energyData = _ref1.energyData,
    mode = _ref1.mode,
    isCompact = _ref1.isCompact;
  return /*#__PURE__*/React.createElement("div", {
    className: "telemetry ".concat(isCompact ? 'is-compact' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "telemetry-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card metric"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric-head"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "timer",
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, "Sessions")), /*#__PURE__*/React.createElement("div", {
    className: "metric-value"
  }, sessions), /*#__PURE__*/React.createElement("div", {
    className: "metric-foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip ok"
  }, "STEADY"))), /*#__PURE__*/React.createElement("div", {
    className: "card metric"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric-head"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "flame",
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, "Streak")), /*#__PURE__*/React.createElement("div", {
    className: "metric-value"
  }, streak, /*#__PURE__*/React.createElement("span", {
    className: "unit"
  }, "d")), /*#__PURE__*/React.createElement("div", {
    className: "metric-foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip active"
  }, "ON FIRE"))), /*#__PURE__*/React.createElement("div", {
    className: "card metric"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric-head"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "target",
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, "Status")), /*#__PURE__*/React.createElement("div", {
    className: "metric-value",
    style: {
      fontSize: '18px',
      textTransform: 'uppercase'
    }
  }, mode || 'IDLE'), /*#__PURE__*/React.createElement("div", {
    className: "metric-foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip active"
  }, "READY")))), /*#__PURE__*/React.createElement("div", {
    className: "telemetry-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card metric"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric-head"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "zap",
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, "Utilization")), /*#__PURE__*/React.createElement("div", {
    className: "metric-value"
  }, utilization, /*#__PURE__*/React.createElement("span", {
    className: "unit"
  }, "%")), /*#__PURE__*/React.createElement("div", {
    className: "metric-foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip active"
  }, "EFFICIENT"))), /*#__PURE__*/React.createElement("div", {
    className: "card metric"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric-head"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "brain",
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, "Focus")), /*#__PURE__*/React.createElement("div", {
    className: "metric-value"
  }, focusScore, /*#__PURE__*/React.createElement("span", {
    className: "unit"
  }, "%")), /*#__PURE__*/React.createElement("div", {
    className: "metric-foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip active"
  }, "OPTIMAL"))), /*#__PURE__*/React.createElement("div", {
    className: "card metric energy-metric"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric-head"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chart",
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, "Energy")), /*#__PURE__*/React.createElement("div", {
    className: "metric-graph-wrap"
  }, /*#__PURE__*/React.createElement(EnergyGraph, {
    data: energyData
  })))));
}

// Energy Graph and Prompt components removed

function CommandCenter(_ref10) {
  var onToggleAI = _ref10.onToggleAI;
  var _React$useState1 = React.useState(""),
    _React$useState10 = _slicedToArray(_React$useState1, 2),
    query = _React$useState10[0],
    setSearchQuery = _React$useState10[1];
  var handleSearch = function handleSearch() {
    if (window.performAISearch && query) {
      var input = document.getElementById('searchQuery');
      if (input) input.value = query;
      window.performAISearch();
      setSearchQuery("");
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "gpac-command-dock-connected"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cc-connected-wrap"
  }, /*#__PURE__*/React.createElement("button", {
    className: "cc-btn amber circle",
    title: "Relaxed Mode",
    onClick: function onClick() {
      return window.location.href = 'relaxed-mode/index.html';
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "coffee",
    size: 18,
    color: "white"
  })), /*#__PURE__*/React.createElement("button", {
    className: "cc-btn ghost",
    title: "Upload",
    onClick: function onClick() {
      var _document$getElementB;
      return (_document$getElementB = document.getElementById('imageUpload')) === null || _document$getElementB === void 0 ? void 0 : _document$getElementB.click();
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clip",
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    className: "cc-input-group"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "cc-chat-input",
    className: "visually-hidden"
  }, "How can I help you?"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    id: "cc-chat-input",
    name: "commandChat",
    placeholder: "How can I help you?",
    value: query,
    onChange: function onChange(e) {
      return setSearchQuery(e.target.value);
    },
    onKeyDown: function onKeyDown(e) {
      return e.key === 'Enter' && handleSearch();
    }
  })), /*#__PURE__*/React.createElement("button", {
    className: "cc-btn ghost",
    title: "Camera",
    onClick: function onClick() {
      var _window$noteToTaskCon2;
      return (_window$noteToTaskCon2 = window.noteToTaskController) === null || _window$noteToTaskCon2 === void 0 ? void 0 : _window$noteToTaskCon2.openFilePicker();
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "camera",
    size: 18
  })), /*#__PURE__*/React.createElement("button", {
    className: "cc-btn blue circle",
    title: "Add Task",
    onClick: function onClick() {
      var _window$taskCreationC6;
      return (_window$taskCreationC6 = window.taskCreationController) === null || _window$taskCreationC6 === void 0 ? void 0 : _window$taskCreationC6.showTaskModal();
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 20,
    color: "white"
  })), /*#__PURE__*/React.createElement("button", {
    className: "cc-btn cyan circle",
    title: "Send",
    onClick: handleSearch
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrowUp",
    size: 20,
    color: "white"
  })), /*#__PURE__*/React.createElement("button", {
    className: "cc-btn ghost",
    title: "API Configuration",
    onClick: function onClick() {
      var _window$openApiSettin, _window4;
      return (_window$openApiSettin = (_window4 = window).openApiSettingsModal) === null || _window$openApiSettin === void 0 ? void 0 : _window$openApiSettin.call(_window4);
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "settings",
    size: 18
  })), /*#__PURE__*/React.createElement("button", {
    className: "cc-btn ghost",
    title: "Gemini Key Toggle",
    onClick: function onClick() {
      var _window$geminiKeyMana;
      return (_window$geminiKeyMana = window.geminiKeyManagerUI) === null || _window$geminiKeyMana === void 0 ? void 0 : _window$geminiKeyMana.showModal();
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "key",
    size: 18
  })), /*#__PURE__*/React.createElement("button", {
    className: "cc-btn red circle",
    title: "Help"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "help",
    size: 18,
    color: "white"
  }))));
}
function WorkspaceToggle(_ref11) {
  var active = _ref11.active,
    onClick = _ref11.onClick;
  return /*#__PURE__*/React.createElement("button", {
    className: "workspace-toggle ".concat(active ? 'is-active' : ''),
    onClick: onClick,
    "aria-label": "Toggle Workspace"
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi ".concat(active ? 'bi-x-lg' : 'bi-diamond-fill')
  }));
}
function ErrorBoundary(_ref12) {
  var children = _ref12.children;
  var _useState27 = useState(null),
    _useState28 = _slicedToArray(_useState27, 2),
    errorInfo = _useState28[0],
    setErrorInfo = _useState28[1];
  useEffect(function () {
    var handle = function handle(e) {
      console.error('[App] Boundary Error:', e);
      setErrorInfo(e.message || String(e));
    };
    window.addEventListener('error', handle);
    return function () {
      return window.removeEventListener('error', handle);
    };
  }, []);
  if (errorInfo) return /*#__PURE__*/React.createElement("div", {
    className: "error-screen"
  }, /*#__PURE__*/React.createElement("h1", null, "App Collision"), /*#__PURE__*/React.createElement("p", null, "Manual edits fragmented the React tree. Attempting recovery..."), /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#ff5555',
      margin: '20px',
      fontSize: '12px',
      background: 'rgba(0,0,0,0.3)',
      padding: '10px',
      borderRadius: '4px'
    }
  }, errorInfo), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return window.location.reload();
    }
  }, "RELOAD STAGE"));
  return children;
}
var root = ReactDOM.createRoot(document.getElementById("root"));
root.render(/*#__PURE__*/React.createElement(React.StrictMode, null, /*#__PURE__*/React.createElement(ErrorBoundary, null, /*#__PURE__*/React.createElement(App, null))));