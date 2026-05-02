"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
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
/* GPAce — Academic Details React Logic */
console.log('[AcademicDetails] JSX script starting...');
var _React = React,
  useState = _React.useState,
  useEffect = _React.useEffect,
  useMemo = _React.useMemo,
  useRef = _React.useRef;
var IconAD = function IconAD(_ref) {
  var name = _ref.name,
    _ref$size = _ref.size,
    size = _ref$size === void 0 ? 18 : _ref$size,
    _ref$stroke = _ref.stroke,
    stroke = _ref$stroke === void 0 ? 2 : _ref$stroke;
  var paths = {
    flame: /*#__PURE__*/React.createElement("path", {
      d: "M12 3s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 11 8 12 8 13a4 4 0 0 0 8 0c0-3-2-6-4-10z"
    }),
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
      fill: "currentColor",
      stroke: "none"
    })),
    chart: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
      d: "M4 19V5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M4 19h16"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M7 16l4-5 3 3 5-7"
    })),
    brain: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
      d: "M9 4a3 3 0 0 0-3 3v0a3 3 0 0 0-2 5v0a3 3 0 0 0 2 4v0a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V4a3 3 0 0 0-3-3z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M15 4a3 3 0 0 1 3 3v0a3 3 0 0 1 2 5v0a3 3 0 0 1-2 4v0a3 3 0 0 1-3 3"
    })),
    settings: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19 13a1.7 1.7 0 0 0 0 -2l1-1-2-3-1 .5a1.7 1.7 0 0 1 -2-1L14 5h-4l-1 1.5a1.7 1.7 0 0 1-2 1l-1-.5-2 3 1 1a1.7 1.7 0 0 0 0 2l-1 1 2 3 1-.5a1.7 1.7 0 0 1 2 1L10 19h4l1-1.5a1.7 1.7 0 0 1 2-1l1 .5 2-3z"
    })),
    info: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "9"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "8",
      x2: "12",
      y2: "8.5"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "11",
      x2: "12",
      y2: "16"
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
    chevD: /*#__PURE__*/React.createElement("polyline", {
      points: "6 9 12 15 18 9"
    }),
    sun: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
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
    })),
    book: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
      d: "M4 5a2 2 0 0 1 2-2h11v18H6a2 2 0 0 1-2-2z"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "9",
      y1: "3",
      x2: "9",
      y2: "21"
    })),
    sparkles: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
      d: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"
    })),
    edit: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
      d: "M14 4l6 6-11 11H3v-6z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14 4l3-3 6 6-3 3"
    })),
    trash: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("polyline", {
      points: "4 7 20 7"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9 7V4h6v3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"
    })),
    check: /*#__PURE__*/React.createElement("polyline", {
      points: "4 12 10 18 20 6"
    }),
    cloud: /*#__PURE__*/React.createElement("path", {
      d: "M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5-2A4 4 0 0 0 7 18z"
    }),
    archive: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "4",
      width: "18",
      height: "4",
      rx: "1"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "10",
      y1: "12",
      x2: "14",
      y2: "12"
    })),
    drive: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "6",
      width: "18",
      height: "13",
      rx: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "7",
      y1: "11",
      x2: "9",
      y2: "11"
    })),
    database: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("ellipse", {
      cx: "12",
      cy: "5",
      rx: "9",
      ry: "3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 12c0 1.66 4 3 9 3s9-1.34 9-3"
    }))
  };
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, paths[name]);
};
function AppAD() {
  var _useState = useState("default"),
    _useState2 = _slicedToArray(_useState, 2),
    semester = _useState2[0],
    setSemester = _useState2[1];
  var _useState3 = useState({}),
    _useState4 = _slicedToArray(_useState3, 2),
    allSemesters = _useState4[0],
    setAllSemesters = _useState4[1];
  var _useState5 = useState([]),
    _useState6 = _slicedToArray(_useState5, 2),
    subjects = _useState6[0],
    setSubjects = _useState6[1];
  var _useState7 = useState(""),
    _useState8 = _slicedToArray(_useState7, 2),
    count = _useState8[0],
    setCount = _useState8[1];
  var _useState9 = useState(""),
    _useState0 = _slicedToArray(_useState9, 2),
    bulk = _useState0[0],
    setBulk = _useState0[1];
  var _useState1 = useState({
      gpaceSizeKB: 0
    }),
    _useState10 = _slicedToArray(_useState1, 2),
    stats = _useState10[0],
    setStats = _useState10[1];
  var _useState11 = useState(false),
    _useState12 = _slicedToArray(_useState11, 2),
    showArchived = _useState12[0],
    setShowArchived = _useState12[1];
  var _useState13 = useState([]),
    _useState14 = _slicedToArray(_useState13, 2),
    forms = _useState14[0],
    setForms = _useState14[1];
  var saveToBackend = function saveToBackend(updatedSubjects) {
    var targetSem = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : semester;
    if (window.SemesterService) {
      window.SemesterService.updateSemester(targetSem, {
        subjects: updatedSubjects
      });
      window.dispatchEvent(new CustomEvent('subjectsChanged', {
        detail: {
          subjects: updatedSubjects,
          semester: targetSem
        }
      }));
      if (window.saveSubjectsToFirestore) window.saveSubjectsToFirestore(updatedSubjects, targetSem);
    }
  };
  var init = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
      var _sems$cur, cur, sems, curSubs, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            if (!(!window.SemesterService || !window.storageService)) {
              _context.n = 1;
              break;
            }
            return _context.a(2);
          case 1:
            _context.p = 1;
            _context.n = 2;
            return window.SemesterService.initialize();
          case 2:
            cur = window.SemesterService.getCurrentSemester() || 'default';
            sems = window.SemesterService.getAllSemesters() || {};
            setSemester(cur);
            setAllSemesters(sems);
            curSubs = ((_sems$cur = sems[cur]) === null || _sems$cur === void 0 ? void 0 : _sems$cur.subjects) || [];
            setSubjects(curSubs);
            setStats(window.storageService.getStats() || {
              gpaceSizeKB: 0
            });
            _context.n = 4;
            break;
          case 3:
            _context.p = 3;
            _t = _context.v;
            console.error(_t);
          case 4:
            return _context.a(2);
        }
      }, _callee, null, [[1, 3]]);
    }));
    return function init() {
      return _ref2.apply(this, arguments);
    };
  }();
  useEffect(function () {
    var check = setInterval(function () {
      if (window.SemesterService && window.storageService) {
        init();
        clearInterval(check);
      }
    }, 100);
    return function () {
      return clearInterval(check);
    };
  }, []);
  var totalCredits = useMemo(function () {
    return (subjects || []).reduce(function (s, x) {
      return s + (Number(x.creditHours) || 0);
    }, 0);
  }, [subjects]);
  var gpaceKB = Number(stats === null || stats === void 0 ? void 0 : stats.gpaceSizeKB) || 0;
  var storagePercent = Math.min(100, gpaceKB / 10240 * 100);
  var currentSemesterData = (allSemesters === null || allSemesters === void 0 ? void 0 : allSemesters[semester]) || {
    name: semester
  };
  var generateForms = function generateForms() {
    var n = parseInt(count);
    if (isNaN(n) || n <= 0) return;
    var newForms = Array.from({
      length: n
    }, function (_, i) {
      return {
        id: Date.now() + i,
        name: "",
        creditHours: 3,
        cognitiveDifficulty: 50,
        tag: ""
      };
    });
    setForms(newForms);
  };
  var handleFormChange = function handleFormChange(id, field, value) {
    setForms(function (prev) {
      return prev.map(function (f) {
        if (f.id === id) {
          var updated = _objectSpread(_objectSpread({}, f), {}, _defineProperty({}, field, value));
          if (field === 'name') {
            var base = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || "SUBJ";
            updated.tag = base + Math.floor(Math.random() * 900 + 100);
          }
          return updated;
        }
        return f;
      });
    });
  };
  var deleteGeneratedForm = function deleteGeneratedForm(id) {
    setForms(function (prev) {
      return prev.filter(function (f) {
        return f.id !== id;
      });
    });
  };
  var saveAllSubjects = function saveAllSubjects() {
    var validForms = forms.filter(function (f) {
      return f.name.trim();
    });
    if (validForms.length === 0) {
      setForms([]);
      return;
    }
    var updated = [].concat(_toConsumableArray(subjects), _toConsumableArray(validForms.map(function (f) {
      return _objectSpread(_objectSpread({}, f), {}, {
        relativeScore: 0,
        academicPerformance: 50
      });
    })));
    setSubjects(updated);
    saveToBackend(updated);
    setForms([]);
    setCount("");
  };
  var totalFormCredits = useMemo(function () {
    return forms.reduce(function (s, x) {
      return s + (Number(x.creditHours) || 0);
    }, 0);
  }, [forms]);
  var parseBulk = function parseBulk() {
    var lines = bulk.split("\n").map(function (l) {
      return l.trim();
    }).filter(Boolean);
    var newSubs = lines.map(function (l, i) {
      var lastComma = l.lastIndexOf(',');
      var name = l,
        cr = 3;
      if (lastComma !== -1) {
        name = l.substring(0, lastComma).trim();
        cr = Number(l.substring(lastComma + 1).trim()) || 3;
      }
      return {
        id: Date.now() + i,
        name: name || "Untitled",
        creditHours: cr,
        tag: (name || "SUBJ").toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) + Math.floor(Math.random() * 900 + 100),
        relativeScore: 0,
        cognitiveDifficulty: 50,
        academicPerformance: 50
      };
    });
    var updated = [].concat(_toConsumableArray(subjects), _toConsumableArray(newSubs));
    setSubjects(updated);
    saveToBackend(updated);
    setBulk("");
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "app"
  }, /*#__PURE__*/React.createElement("main", {
    className: "acd-stage"
  }, /*#__PURE__*/React.createElement("div", {
    className: "acd-header"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "acd-h1"
  }, "Academic Details"), /*#__PURE__*/React.createElement("p", {
    className: "acd-sub"
  }, "Manage subjects, credits and semester data. GPAce uses these to weight your tasks and project your GPA.")), /*#__PURE__*/React.createElement("section", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sem-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sem-left"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sem-title"
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      color: 'white'
    }
  }, currentSemesterData.name || semester), /*#__PURE__*/React.createElement("span", {
    className: "chip synced"
  }, /*#__PURE__*/React.createElement(IconAD, {
    name: "cloud",
    size: 12
  }), " Cloud Synced"), /*#__PURE__*/React.createElement("span", {
    className: "chip local"
  }, /*#__PURE__*/React.createElement(IconAD, {
    name: "info",
    size: 12
  }), " Local Storage Only")), /*#__PURE__*/React.createElement("div", {
    className: "sem-help"
  }, "Select or create a semester to manage subject data separately for different academic periods.")), /*#__PURE__*/React.createElement("div", {
    className: "sem-select-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sem-select-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sem-label-side"
  }, /*#__PURE__*/React.createElement("span", null, "Select"), /*#__PURE__*/React.createElement("span", null, "Semester:")), /*#__PURE__*/React.createElement("div", {
    className: "sem-select-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sem-select"
  }, /*#__PURE__*/React.createElement("select", {
    value: semester,
    onChange: function onChange(e) {
      var _sems$e$target$value;
      setSemester(e.target.value);
      window.SemesterService.setCurrentSemester(e.target.value);
      var sems = window.SemesterService.getAllSemesters() || {};
      setSubjects(((_sems$e$target$value = sems[e.target.value]) === null || _sems$e$target$value === void 0 ? void 0 : _sems$e$target$value.subjects) || []);
    }
  }, Object.keys(allSemesters || {}).map(function (id) {
    return /*#__PURE__*/React.createElement("option", {
      key: id,
      value: id
    }, allSemesters[id].name || id);
  })), /*#__PURE__*/React.createElement(IconAD, {
    name: "chevD",
    size: 14
  })), /*#__PURE__*/React.createElement("div", {
    className: "sem-actions-wrap"
  }, /*#__PURE__*/React.createElement("button", {
    className: "icon-btn-outline"
  }, /*#__PURE__*/React.createElement(IconAD, {
    name: "settings",
    size: 18
  }), /*#__PURE__*/React.createElement(IconAD, {
    name: "chevD",
    size: 10,
    stroke: 3
  }))))))), /*#__PURE__*/React.createElement("div", {
    className: "storage-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "storage-bar-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "storage-bar-meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "storage-track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "storage-fill",
    style: {
      width: "".concat(storagePercent, "%")
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "storage-text"
  }, "Storage \xB7 ", gpaceKB.toFixed(1), " of 10240 KB used")), /*#__PURE__*/React.createElement("div", {
    className: "storage-actions"
  }, /*#__PURE__*/React.createElement("label", {
    className: "switch-wrap"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: showArchived,
    onChange: function onChange(e) {
      return setShowArchived(e.target.checked);
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "toggle-switch"
  }), /*#__PURE__*/React.createElement("span", {
    className: "switch-label"
  }, "Show Archived")), /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "manage-storage-link"
  }, /*#__PURE__*/React.createElement(IconAD, {
    name: "database",
    size: 14
  }), " Manage Storage"))))), /*#__PURE__*/React.createElement("section", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "add-subj-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "add-subj-icon"
  }, /*#__PURE__*/React.createElement(IconAD, {
    name: "plus",
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    className: "add-subj-text"
  }, /*#__PURE__*/React.createElement("h3", null, "Add New Subject"), /*#__PURE__*/React.createElement("p", null, "Generate empty forms or paste a bulk list from your registrar."))), /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Enter Number of Subjects"), /*#__PURE__*/React.createElement("div", {
    className: "inline-form"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: count,
    onChange: function onChange(e) {
      return setCount(e.target.value);
    },
    className: "acd-input",
    placeholder: "e.g. 5"
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    onClick: generateForms
  }, /*#__PURE__*/React.createElement(IconAD, {
    name: "sparkles",
    size: 16
  }), " Generate Forms")), /*#__PURE__*/React.createElement("div", {
    className: "divider-or"
  }, "OR"), /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Bulk Add Subjects"), /*#__PURE__*/React.createElement("p", {
    className: "acd-sub",
    style: {
      fontSize: '13px',
      marginBottom: '12px'
    }
  }, "Format: ", /*#__PURE__*/React.createElement("code", {
    style: {
      color: 'var(--accent)'
    }
  }, "Subject Name, Credit Hours"), " \u2014 one per line"), /*#__PURE__*/React.createElement("textarea", {
    className: "bulk-textarea",
    value: bulk,
    onChange: function onChange(e) {
      return setBulk(e.target.value);
    },
    placeholder: "Linear Algebra, 4\nMechanics, 4\nCognitive Neuroscience, 3"
  }), /*#__PURE__*/React.createElement("div", {
    className: "inline-form",
    style: {
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '16px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    onClick: parseBulk,
    disabled: !bulk.trim()
  }, /*#__PURE__*/React.createElement(IconAD, {
    name: "check",
    size: 16
  }), " Add Subjects"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '13px',
      color: 'var(--dd-text-muted)'
    }
  }, bulk.split("\n").filter(function (l) {
    return l.trim();
  }).length, " line(s) detected")), forms.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "generated-forms",
    style: {
      marginTop: '32px'
    }
  }, forms.map(function (f, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: f.id,
      className: "subject-form-block",
      style: {
        marginBottom: '24px',
        padding: '20px',
        border: '1px solid var(--dd-line)',
        borderRadius: '12px'
      }
    }, /*#__PURE__*/React.createElement("h4", {
      style: {
        color: 'white',
        marginBottom: '16px'
      }
    }, "Subject ", i + 1), /*#__PURE__*/React.createElement("div", {
      className: "mb-3"
    }, /*#__PURE__*/React.createElement("label", {
      className: "form-label"
    }, "Subject Name"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      className: "acd-input w-100",
      value: f.name,
      onChange: function onChange(e) {
        return handleFormChange(f.id, 'name', e.target.value);
      }
    }), f.tag && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        color: 'var(--dd-text-muted)',
        marginTop: '4px'
      }
    }, "Tag: ", f.tag)), /*#__PURE__*/React.createElement("div", {
      className: "mb-3"
    }, /*#__PURE__*/React.createElement("label", {
      className: "form-label"
    }, "Credit Hours"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "acd-input w-100",
      value: f.creditHours,
      onChange: function onChange(e) {
        return handleFormChange(f.id, 'creditHours', e.target.value);
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "mb-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "d-flex justify-content-between align-items-center mb-2"
    }, /*#__PURE__*/React.createElement("label", {
      className: "form-label mb-0"
    }, "Cognitive Difficulty Level (1-100)"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'white',
        fontWeight: 600
      }
    }, f.cognitiveDifficulty)), /*#__PURE__*/React.createElement("input", {
      type: "range",
      className: "w-100",
      min: "1",
      max: "100",
      value: f.cognitiveDifficulty,
      onChange: function onChange(e) {
        return handleFormChange(f.id, 'cognitiveDifficulty', e.target.value);
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '11px',
        color: 'var(--dd-text-muted)',
        marginTop: '8px'
      }
    }, "1 = Very Easy, 50 = Moderate, 100 = Very Challenging")));
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn-primary w-100",
    style: {
      padding: '14px'
    },
    onClick: saveAllSubjects
  }, "Save All Subjects"))), /*#__PURE__*/React.createElement("section", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "subjects-card-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "subj-list-icon"
  }, /*#__PURE__*/React.createElement(IconAD, {
    name: "book",
    size: 20
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: '20px',
      fontWeight: 700,
      margin: 0,
      color: 'white'
    }
  }, "Subjects \xB7 ", subjects.length), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '14px',
      color: 'var(--dd-text-muted)',
      margin: '4px 0 0'
    }
  }, totalCredits, " total credits this semester"))), /*#__PURE__*/React.createElement("div", {
    className: "subj-list"
  }, subjects.map(function (s, idx) {
    return /*#__PURE__*/React.createElement("div", {
      key: s.id || idx,
      className: "subj-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "subj-pip",
      style: {
        background: "oklch(0.65 0.2 ".concat(idx * 47 % 360, ")")
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "subj-name",
      style: {
        color: 'white'
      }
    }, s.name || "Untitled Subject"), /*#__PURE__*/React.createElement("div", {
      className: "subj-meta"
    }, /*#__PURE__*/React.createElement("div", {
      className: "credits-badge"
    }, /*#__PURE__*/React.createElement("strong", null, s.creditHours), /*#__PURE__*/React.createElement("span", null, "CR")), /*#__PURE__*/React.createElement("button", {
      className: "action-btn",
      title: "Edit"
    }, /*#__PURE__*/React.createElement(IconAD, {
      name: "edit",
      size: 14
    })), /*#__PURE__*/React.createElement("button", {
      className: "action-btn",
      title: "Archive"
    }, /*#__PURE__*/React.createElement(IconAD, {
      name: "archive",
      size: 14
    })), /*#__PURE__*/React.createElement("button", {
      className: "action-btn",
      onClick: function onClick() {
        var up = subjects.filter(function (x) {
          return (x.id || x.tag) !== (s.id || s.tag);
        });
        setSubjects(up);
        saveToBackend(up);
      },
      title: "Delete"
    }, /*#__PURE__*/React.createElement(IconAD, {
      name: "trash",
      size: 14
    }))));
  }), subjects.length === 0 && /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: 'center',
      padding: '40px',
      color: 'var(--dd-text-muted)'
    }
  }, "No subjects added yet.")))));
}

// Global initialization bridge
var initReactApp = function initReactApp() {
  var container = document.getElementById("root");
  if (container) {
    ReactDOM.createRoot(container).render(/*#__PURE__*/React.createElement(AppAD, null));
  }
};

// Start when everything is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReactApp);
} else {
  initReactApp();
}