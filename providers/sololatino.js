/**
 * sololatino - Built from src/sololatino/
 * Generated: 2026-04-14T14:32:27.580Z
 */
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// node_modules/axios/dist/axios.min.js
var axios_min_exports = {};
var init_axios_min = __esm({
  "node_modules/axios/dist/axios.min.js"() {
    !function(e, t) {
      "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : (e = "undefined" != typeof globalThis ? globalThis : e || self).axios = t();
    }(void 0, function() {
      "use strict";
      function e(e2, t2) {
        this.v = e2, this.k = t2;
      }
      function t(e2, t2) {
        (null == t2 || t2 > e2.length) && (t2 = e2.length);
        for (var n2 = 0, r2 = Array(t2); n2 < t2; n2++)
          r2[n2] = e2[n2];
        return r2;
      }
      function n(t2) {
        var n2 = {}, r2 = false;
        function o2(n3, o3) {
          return r2 = true, o3 = new Promise(function(e2) {
            e2(t2[n3](o3));
          }), { done: false, value: new e(o3, 1) };
        }
        return n2["undefined" != typeof Symbol && Symbol.iterator || "@@iterator"] = function() {
          return this;
        }, n2.next = function(e2) {
          return r2 ? (r2 = false, e2) : o2("next", e2);
        }, "function" == typeof t2.throw && (n2.throw = function(e2) {
          if (r2)
            throw r2 = false, e2;
          return o2("throw", e2);
        }), "function" == typeof t2.return && (n2.return = function(e2) {
          return r2 ? (r2 = false, e2) : o2("return", e2);
        }), n2;
      }
      function r(e2) {
        var t2, n2, r2, i2 = 2;
        for ("undefined" != typeof Symbol && (n2 = Symbol.asyncIterator, r2 = Symbol.iterator); i2--; ) {
          if (n2 && null != (t2 = e2[n2]))
            return t2.call(e2);
          if (r2 && null != (t2 = e2[r2]))
            return new o(t2.call(e2));
          n2 = "@@asyncIterator", r2 = "@@iterator";
        }
        throw new TypeError("Object is not async iterable");
      }
      function o(e2) {
        function t2(e3) {
          if (Object(e3) !== e3)
            return Promise.reject(new TypeError(e3 + " is not an object."));
          var t3 = e3.done;
          return Promise.resolve(e3.value).then(function(e4) {
            return { value: e4, done: t3 };
          });
        }
        return o = function(e3) {
          this.s = e3, this.n = e3.next;
        }, o.prototype = { s: null, n: null, next: function() {
          return t2(this.n.apply(this.s, arguments));
        }, return: function(e3) {
          var n2 = this.s.return;
          return void 0 === n2 ? Promise.resolve({ value: e3, done: true }) : t2(n2.apply(this.s, arguments));
        }, throw: function(e3) {
          var n2 = this.s.return;
          return void 0 === n2 ? Promise.reject(e3) : t2(n2.apply(this.s, arguments));
        } }, new o(e2);
      }
      function i(e2, t2, n2, r2, o2, i2, a2) {
        try {
          var u2 = e2[i2](a2), s2 = u2.value;
        } catch (e3) {
          return void n2(e3);
        }
        u2.done ? t2(s2) : Promise.resolve(s2).then(r2, o2);
      }
      function a(e2) {
        return function() {
          var t2 = this, n2 = arguments;
          return new Promise(function(r2, o2) {
            var a2 = e2.apply(t2, n2);
            function u2(e3) {
              i(a2, r2, o2, u2, s2, "next", e3);
            }
            function s2(e3) {
              i(a2, r2, o2, u2, s2, "throw", e3);
            }
            u2(void 0);
          });
        };
      }
      function u(t2) {
        return new e(t2, 0);
      }
      function s(e2, t2, n2) {
        return t2 = p(t2), function(e3, t3) {
          if (t3 && ("object" == typeof t3 || "function" == typeof t3))
            return t3;
          if (void 0 !== t3)
            throw new TypeError("Derived constructors may only return object or undefined");
          return function(e4) {
            if (void 0 === e4)
              throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return e4;
          }(e3);
        }(e2, y() ? Reflect.construct(t2, n2 || [], p(e2).constructor) : t2.apply(e2, n2));
      }
      function c(e2, t2) {
        if (!(e2 instanceof t2))
          throw new TypeError("Cannot call a class as a function");
      }
      function f(e2, t2) {
        for (var n2 = 0; n2 < t2.length; n2++) {
          var r2 = t2[n2];
          r2.enumerable = r2.enumerable || false, r2.configurable = true, "value" in r2 && (r2.writable = true), Object.defineProperty(e2, S(r2.key), r2);
        }
      }
      function l(e2, t2, n2) {
        return t2 && f(e2.prototype, t2), n2 && f(e2, n2), Object.defineProperty(e2, "prototype", { writable: false }), e2;
      }
      function d(e2, t2, n2) {
        return (t2 = S(t2)) in e2 ? Object.defineProperty(e2, t2, { value: n2, enumerable: true, configurable: true, writable: true }) : e2[t2] = n2, e2;
      }
      function p(e2) {
        return p = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(e3) {
          return e3.__proto__ || Object.getPrototypeOf(e3);
        }, p(e2);
      }
      function h(e2, t2) {
        if ("function" != typeof t2 && null !== t2)
          throw new TypeError("Super expression must either be null or a function");
        e2.prototype = Object.create(t2 && t2.prototype, { constructor: { value: e2, writable: true, configurable: true } }), Object.defineProperty(e2, "prototype", { writable: false }), t2 && O(e2, t2);
      }
      function y() {
        try {
          var e2 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
          }));
        } catch (e3) {
        }
        return (y = function() {
          return !!e2;
        })();
      }
      function v(e2, t2) {
        var n2 = Object.keys(e2);
        if (Object.getOwnPropertySymbols) {
          var r2 = Object.getOwnPropertySymbols(e2);
          t2 && (r2 = r2.filter(function(t3) {
            return Object.getOwnPropertyDescriptor(e2, t3).enumerable;
          })), n2.push.apply(n2, r2);
        }
        return n2;
      }
      function b(e2) {
        for (var t2 = 1; t2 < arguments.length; t2++) {
          var n2 = null != arguments[t2] ? arguments[t2] : {};
          t2 % 2 ? v(Object(n2), true).forEach(function(t3) {
            d(e2, t3, n2[t3]);
          }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e2, Object.getOwnPropertyDescriptors(n2)) : v(Object(n2)).forEach(function(t3) {
            Object.defineProperty(e2, t3, Object.getOwnPropertyDescriptor(n2, t3));
          });
        }
        return e2;
      }
      function m() {
        var e2, t2, n2 = "function" == typeof Symbol ? Symbol : {}, r2 = n2.iterator || "@@iterator", o2 = n2.toStringTag || "@@toStringTag";
        function i2(n3, r3, o3, i3) {
          var s3 = r3 && r3.prototype instanceof u2 ? r3 : u2, c3 = Object.create(s3.prototype);
          return g(c3, "_invoke", function(n4, r4, o4) {
            var i4, u3, s4, c4 = 0, f3 = o4 || [], l3 = false, d3 = { p: 0, n: 0, v: e2, a: p2, f: p2.bind(e2, 4), d: function(t3, n5) {
              return i4 = t3, u3 = 0, s4 = e2, d3.n = n5, a2;
            } };
            function p2(n5, r5) {
              for (u3 = n5, s4 = r5, t2 = 0; !l3 && c4 && !o5 && t2 < f3.length; t2++) {
                var o5, i5 = f3[t2], p3 = d3.p, h2 = i5[2];
                n5 > 3 ? (o5 = h2 === r5) && (s4 = i5[(u3 = i5[4]) ? 5 : (u3 = 3, 3)], i5[4] = i5[5] = e2) : i5[0] <= p3 && ((o5 = n5 < 2 && p3 < i5[1]) ? (u3 = 0, d3.v = r5, d3.n = i5[1]) : p3 < h2 && (o5 = n5 < 3 || i5[0] > r5 || r5 > h2) && (i5[4] = n5, i5[5] = r5, d3.n = h2, u3 = 0));
              }
              if (o5 || n5 > 1)
                return a2;
              throw l3 = true, r5;
            }
            return function(o5, f4, h2) {
              if (c4 > 1)
                throw TypeError("Generator is already running");
              for (l3 && 1 === f4 && p2(f4, h2), u3 = f4, s4 = h2; (t2 = u3 < 2 ? e2 : s4) || !l3; ) {
                i4 || (u3 ? u3 < 3 ? (u3 > 1 && (d3.n = -1), p2(u3, s4)) : d3.n = s4 : d3.v = s4);
                try {
                  if (c4 = 2, i4) {
                    if (u3 || (o5 = "next"), t2 = i4[o5]) {
                      if (!(t2 = t2.call(i4, s4)))
                        throw TypeError("iterator result is not an object");
                      if (!t2.done)
                        return t2;
                      s4 = t2.value, u3 < 2 && (u3 = 0);
                    } else
                      1 === u3 && (t2 = i4.return) && t2.call(i4), u3 < 2 && (s4 = TypeError("The iterator does not provide a '" + o5 + "' method"), u3 = 1);
                    i4 = e2;
                  } else if ((t2 = (l3 = d3.n < 0) ? s4 : n4.call(r4, d3)) !== a2)
                    break;
                } catch (t3) {
                  i4 = e2, u3 = 1, s4 = t3;
                } finally {
                  c4 = 1;
                }
              }
              return { value: t2, done: l3 };
            };
          }(n3, o3, i3), true), c3;
        }
        var a2 = {};
        function u2() {
        }
        function s2() {
        }
        function c2() {
        }
        t2 = Object.getPrototypeOf;
        var f2 = [][r2] ? t2(t2([][r2]())) : (g(t2 = {}, r2, function() {
          return this;
        }), t2), l2 = c2.prototype = u2.prototype = Object.create(f2);
        function d2(e3) {
          return Object.setPrototypeOf ? Object.setPrototypeOf(e3, c2) : (e3.__proto__ = c2, g(e3, o2, "GeneratorFunction")), e3.prototype = Object.create(l2), e3;
        }
        return s2.prototype = c2, g(l2, "constructor", c2), g(c2, "constructor", s2), s2.displayName = "GeneratorFunction", g(c2, o2, "GeneratorFunction"), g(l2), g(l2, o2, "Generator"), g(l2, r2, function() {
          return this;
        }), g(l2, "toString", function() {
          return "[object Generator]";
        }), (m = function() {
          return { w: i2, m: d2 };
        })();
      }
      function g(e2, t2, n2, r2) {
        var o2 = Object.defineProperty;
        try {
          o2({}, "", {});
        } catch (e3) {
          o2 = 0;
        }
        g = function(e3, t3, n3, r3) {
          function i2(t4, n4) {
            g(e3, t4, function(e4) {
              return this._invoke(t4, n4, e4);
            });
          }
          t3 ? o2 ? o2(e3, t3, { value: n3, enumerable: !r3, configurable: !r3, writable: !r3 }) : e3[t3] = n3 : (i2("next", 0), i2("throw", 1), i2("return", 2));
        }, g(e2, t2, n2, r2);
      }
      function w(e2) {
        if (null != e2) {
          var t2 = e2["function" == typeof Symbol && Symbol.iterator || "@@iterator"], n2 = 0;
          if (t2)
            return t2.call(e2);
          if ("function" == typeof e2.next)
            return e2;
          if (!isNaN(e2.length))
            return { next: function() {
              return e2 && n2 >= e2.length && (e2 = void 0), { value: e2 && e2[n2++], done: !e2 };
            } };
        }
        throw new TypeError(typeof e2 + " is not iterable");
      }
      function O(e2, t2) {
        return O = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(e3, t3) {
          return e3.__proto__ = t3, e3;
        }, O(e2, t2);
      }
      function E(e2, t2) {
        return function(e3) {
          if (Array.isArray(e3))
            return e3;
        }(e2) || function(e3, t3) {
          var n2 = null == e3 ? null : "undefined" != typeof Symbol && e3[Symbol.iterator] || e3["@@iterator"];
          if (null != n2) {
            var r2, o2, i2, a2, u2 = [], s2 = true, c2 = false;
            try {
              if (i2 = (n2 = n2.call(e3)).next, 0 === t3) {
                if (Object(n2) !== n2)
                  return;
                s2 = false;
              } else
                for (; !(s2 = (r2 = i2.call(n2)).done) && (u2.push(r2.value), u2.length !== t3); s2 = true)
                  ;
            } catch (e4) {
              c2 = true, o2 = e4;
            } finally {
              try {
                if (!s2 && null != n2.return && (a2 = n2.return(), Object(a2) !== a2))
                  return;
              } finally {
                if (c2)
                  throw o2;
              }
            }
            return u2;
          }
        }(e2, t2) || j(e2, t2) || function() {
          throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }();
      }
      function R(e2) {
        return function(e3) {
          if (Array.isArray(e3))
            return t(e3);
        }(e2) || function(e3) {
          if ("undefined" != typeof Symbol && null != e3[Symbol.iterator] || null != e3["@@iterator"])
            return Array.from(e3);
        }(e2) || j(e2) || function() {
          throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }();
      }
      function S(e2) {
        var t2 = function(e3, t3) {
          if ("object" != typeof e3 || !e3)
            return e3;
          var n2 = e3[Symbol.toPrimitive];
          if (void 0 !== n2) {
            var r2 = n2.call(e3, t3);
            if ("object" != typeof r2)
              return r2;
            throw new TypeError("@@toPrimitive must return a primitive value.");
          }
          return ("string" === t3 ? String : Number)(e3);
        }(e2, "string");
        return "symbol" == typeof t2 ? t2 : t2 + "";
      }
      function T(e2) {
        return T = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e3) {
          return typeof e3;
        } : function(e3) {
          return e3 && "function" == typeof Symbol && e3.constructor === Symbol && e3 !== Symbol.prototype ? "symbol" : typeof e3;
        }, T(e2);
      }
      function j(e2, n2) {
        if (e2) {
          if ("string" == typeof e2)
            return t(e2, n2);
          var r2 = {}.toString.call(e2).slice(8, -1);
          return "Object" === r2 && e2.constructor && (r2 = e2.constructor.name), "Map" === r2 || "Set" === r2 ? Array.from(e2) : "Arguments" === r2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r2) ? t(e2, n2) : void 0;
        }
      }
      function A(e2) {
        return function() {
          return new k(e2.apply(this, arguments));
        };
      }
      function k(t2) {
        var n2, r2;
        function o2(n3, r3) {
          try {
            var a2 = t2[n3](r3), u2 = a2.value, s2 = u2 instanceof e;
            Promise.resolve(s2 ? u2.v : u2).then(function(e2) {
              if (s2) {
                var r4 = "return" === n3 ? "return" : "next";
                if (!u2.k || e2.done)
                  return o2(r4, e2);
                e2 = t2[r4](e2).value;
              }
              i2(a2.done ? "return" : "normal", e2);
            }, function(e2) {
              o2("throw", e2);
            });
          } catch (e2) {
            i2("throw", e2);
          }
        }
        function i2(e2, t3) {
          switch (e2) {
            case "return":
              n2.resolve({ value: t3, done: true });
              break;
            case "throw":
              n2.reject(t3);
              break;
            default:
              n2.resolve({ value: t3, done: false });
          }
          (n2 = n2.next) ? o2(n2.key, n2.arg) : r2 = null;
        }
        this._invoke = function(e2, t3) {
          return new Promise(function(i3, a2) {
            var u2 = { key: e2, arg: t3, resolve: i3, reject: a2, next: null };
            r2 ? r2 = r2.next = u2 : (n2 = r2 = u2, o2(e2, t3));
          });
        }, "function" != typeof t2.return && (this.return = void 0);
      }
      function P(e2) {
        var t2 = "function" == typeof Map ? /* @__PURE__ */ new Map() : void 0;
        return P = function(e3) {
          if (null === e3 || !function(e4) {
            try {
              return -1 !== Function.toString.call(e4).indexOf("[native code]");
            } catch (t3) {
              return "function" == typeof e4;
            }
          }(e3))
            return e3;
          if ("function" != typeof e3)
            throw new TypeError("Super expression must either be null or a function");
          if (void 0 !== t2) {
            if (t2.has(e3))
              return t2.get(e3);
            t2.set(e3, n2);
          }
          function n2() {
            return function(e4, t3, n3) {
              if (y())
                return Reflect.construct.apply(null, arguments);
              var r2 = [null];
              r2.push.apply(r2, t3);
              var o2 = new (e4.bind.apply(e4, r2))();
              return n3 && O(o2, n3.prototype), o2;
            }(e3, arguments, p(this).constructor);
          }
          return n2.prototype = Object.create(e3.prototype, { constructor: { value: n2, enumerable: false, writable: true, configurable: true } }), O(n2, e3);
        }, P(e2);
      }
      function _(e2, t2) {
        return function() {
          return e2.apply(t2, arguments);
        };
      }
      k.prototype["function" == typeof Symbol && Symbol.asyncIterator || "@@asyncIterator"] = function() {
        return this;
      }, k.prototype.next = function(e2) {
        return this._invoke("next", e2);
      }, k.prototype.throw = function(e2) {
        return this._invoke("throw", e2);
      }, k.prototype.return = function(e2) {
        return this._invoke("return", e2);
      };
      var x, N = Object.prototype.toString, C = Object.getPrototypeOf, U = Symbol.iterator, F = Symbol.toStringTag, D = (x = /* @__PURE__ */ Object.create(null), function(e2) {
        var t2 = N.call(e2);
        return x[t2] || (x[t2] = t2.slice(8, -1).toLowerCase());
      }), B = function(e2) {
        return e2 = e2.toLowerCase(), function(t2) {
          return D(t2) === e2;
        };
      }, L = function(e2) {
        return function(t2) {
          return T(t2) === e2;
        };
      }, I = Array.isArray, q = L("undefined");
      function M(e2) {
        return null !== e2 && !q(e2) && null !== e2.constructor && !q(e2.constructor) && J(e2.constructor.isBuffer) && e2.constructor.isBuffer(e2);
      }
      var z = B("ArrayBuffer");
      var H = L("string"), J = L("function"), W = L("number"), K = function(e2) {
        return null !== e2 && "object" === T(e2);
      }, V = function(e2) {
        if ("object" !== D(e2))
          return false;
        var t2 = C(e2);
        return !(null !== t2 && t2 !== Object.prototype && null !== Object.getPrototypeOf(t2) || F in e2 || U in e2);
      }, G = B("Date"), X = B("File"), $ = B("Blob"), Q = B("FileList");
      var Y = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : "undefined" != typeof window ? window : "undefined" != typeof global ? global : {}, Z = void 0 !== Y.FormData ? Y.FormData : void 0, ee = B("URLSearchParams"), te = E(["ReadableStream", "Request", "Response", "Headers"].map(B), 4), ne = te[0], re = te[1], oe = te[2], ie = te[3];
      function ae(e2, t2) {
        var n2, r2, o2 = (arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}).allOwnKeys, i2 = void 0 !== o2 && o2;
        if (null != e2)
          if ("object" !== T(e2) && (e2 = [e2]), I(e2))
            for (n2 = 0, r2 = e2.length; n2 < r2; n2++)
              t2.call(null, e2[n2], n2, e2);
          else {
            if (M(e2))
              return;
            var a2, u2 = i2 ? Object.getOwnPropertyNames(e2) : Object.keys(e2), s2 = u2.length;
            for (n2 = 0; n2 < s2; n2++)
              a2 = u2[n2], t2.call(null, e2[a2], a2, e2);
          }
      }
      function ue(e2, t2) {
        if (M(e2))
          return null;
        t2 = t2.toLowerCase();
        for (var n2, r2 = Object.keys(e2), o2 = r2.length; o2-- > 0; )
          if (t2 === (n2 = r2[o2]).toLowerCase())
            return n2;
        return null;
      }
      var se = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : "undefined" != typeof window ? window : global, ce = function(e2) {
        return !q(e2) && e2 !== se;
      };
      var fe, le = (fe = "undefined" != typeof Uint8Array && C(Uint8Array), function(e2) {
        return fe && e2 instanceof fe;
      }), de = B("HTMLFormElement"), pe = /* @__PURE__ */ function() {
        var e2 = Object.prototype.hasOwnProperty;
        return function(t2, n2) {
          return e2.call(t2, n2);
        };
      }(), he = B("RegExp"), ye = function(e2, t2) {
        var n2 = Object.getOwnPropertyDescriptors(e2), r2 = {};
        ae(n2, function(n3, o2) {
          var i2;
          false !== (i2 = t2(n3, o2, e2)) && (r2[o2] = i2 || n3);
        }), Object.defineProperties(e2, r2);
      };
      var ve, be, me, ge, we = B("AsyncFunction"), Oe = (ve = "function" == typeof setImmediate, be = J(se.postMessage), ve ? setImmediate : be ? (me = "axios@".concat(Math.random()), ge = [], se.addEventListener("message", function(e2) {
        var t2 = e2.source, n2 = e2.data;
        t2 === se && n2 === me && ge.length && ge.shift()();
      }, false), function(e2) {
        ge.push(e2), se.postMessage(me, "*");
      }) : function(e2) {
        return setTimeout(e2);
      }), Ee = "undefined" != typeof queueMicrotask ? queueMicrotask.bind(se) : "undefined" != typeof process && process.nextTick || Oe, Re = { isArray: I, isArrayBuffer: z, isBuffer: M, isFormData: function(e2) {
        var t2;
        return e2 && (Z && e2 instanceof Z || J(e2.append) && ("formdata" === (t2 = D(e2)) || "object" === t2 && J(e2.toString) && "[object FormData]" === e2.toString()));
      }, isArrayBufferView: function(e2) {
        return "undefined" != typeof ArrayBuffer && ArrayBuffer.isView ? ArrayBuffer.isView(e2) : e2 && e2.buffer && z(e2.buffer);
      }, isString: H, isNumber: W, isBoolean: function(e2) {
        return true === e2 || false === e2;
      }, isObject: K, isPlainObject: V, isEmptyObject: function(e2) {
        if (!K(e2) || M(e2))
          return false;
        try {
          return 0 === Object.keys(e2).length && Object.getPrototypeOf(e2) === Object.prototype;
        } catch (e3) {
          return false;
        }
      }, isReadableStream: ne, isRequest: re, isResponse: oe, isHeaders: ie, isUndefined: q, isDate: G, isFile: X, isReactNativeBlob: function(e2) {
        return !(!e2 || void 0 === e2.uri);
      }, isReactNative: function(e2) {
        return e2 && void 0 !== e2.getParts;
      }, isBlob: $, isRegExp: he, isFunction: J, isStream: function(e2) {
        return K(e2) && J(e2.pipe);
      }, isURLSearchParams: ee, isTypedArray: le, isFileList: Q, forEach: ae, merge: function e2() {
        for (var t2 = ce(this) && this || {}, n2 = t2.caseless, r2 = t2.skipUndefined, o2 = {}, i2 = function(t3, i3) {
          if ("__proto__" !== i3 && "constructor" !== i3 && "prototype" !== i3) {
            var a3 = n2 && ue(o2, i3) || i3;
            V(o2[a3]) && V(t3) ? o2[a3] = e2(o2[a3], t3) : V(t3) ? o2[a3] = e2({}, t3) : I(t3) ? o2[a3] = t3.slice() : r2 && q(t3) || (o2[a3] = t3);
          }
        }, a2 = 0, u2 = arguments.length; a2 < u2; a2++)
          arguments[a2] && ae(arguments[a2], i2);
        return o2;
      }, extend: function(e2, t2, n2) {
        return ae(t2, function(t3, r2) {
          n2 && J(t3) ? Object.defineProperty(e2, r2, { value: _(t3, n2), writable: true, enumerable: true, configurable: true }) : Object.defineProperty(e2, r2, { value: t3, writable: true, enumerable: true, configurable: true });
        }, { allOwnKeys: (arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {}).allOwnKeys }), e2;
      }, trim: function(e2) {
        return e2.trim ? e2.trim() : e2.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
      }, stripBOM: function(e2) {
        return 65279 === e2.charCodeAt(0) && (e2 = e2.slice(1)), e2;
      }, inherits: function(e2, t2, n2, r2) {
        e2.prototype = Object.create(t2.prototype, r2), Object.defineProperty(e2.prototype, "constructor", { value: e2, writable: true, enumerable: false, configurable: true }), Object.defineProperty(e2, "super", { value: t2.prototype }), n2 && Object.assign(e2.prototype, n2);
      }, toFlatObject: function(e2, t2, n2, r2) {
        var o2, i2, a2, u2 = {};
        if (t2 = t2 || {}, null == e2)
          return t2;
        do {
          for (i2 = (o2 = Object.getOwnPropertyNames(e2)).length; i2-- > 0; )
            a2 = o2[i2], r2 && !r2(a2, e2, t2) || u2[a2] || (t2[a2] = e2[a2], u2[a2] = true);
          e2 = false !== n2 && C(e2);
        } while (e2 && (!n2 || n2(e2, t2)) && e2 !== Object.prototype);
        return t2;
      }, kindOf: D, kindOfTest: B, endsWith: function(e2, t2, n2) {
        e2 = String(e2), (void 0 === n2 || n2 > e2.length) && (n2 = e2.length), n2 -= t2.length;
        var r2 = e2.indexOf(t2, n2);
        return -1 !== r2 && r2 === n2;
      }, toArray: function(e2) {
        if (!e2)
          return null;
        if (I(e2))
          return e2;
        var t2 = e2.length;
        if (!W(t2))
          return null;
        for (var n2 = new Array(t2); t2-- > 0; )
          n2[t2] = e2[t2];
        return n2;
      }, forEachEntry: function(e2, t2) {
        for (var n2, r2 = (e2 && e2[U]).call(e2); (n2 = r2.next()) && !n2.done; ) {
          var o2 = n2.value;
          t2.call(e2, o2[0], o2[1]);
        }
      }, matchAll: function(e2, t2) {
        for (var n2, r2 = []; null !== (n2 = e2.exec(t2)); )
          r2.push(n2);
        return r2;
      }, isHTMLForm: de, hasOwnProperty: pe, hasOwnProp: pe, reduceDescriptors: ye, freezeMethods: function(e2) {
        ye(e2, function(t2, n2) {
          if (J(e2) && -1 !== ["arguments", "caller", "callee"].indexOf(n2))
            return false;
          var r2 = e2[n2];
          J(r2) && (t2.enumerable = false, "writable" in t2 ? t2.writable = false : t2.set || (t2.set = function() {
            throw Error("Can not rewrite read-only method '" + n2 + "'");
          }));
        });
      }, toObjectSet: function(e2, t2) {
        var n2 = {}, r2 = function(e3) {
          e3.forEach(function(e4) {
            n2[e4] = true;
          });
        };
        return I(e2) ? r2(e2) : r2(String(e2).split(t2)), n2;
      }, toCamelCase: function(e2) {
        return e2.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(e3, t2, n2) {
          return t2.toUpperCase() + n2;
        });
      }, noop: function() {
      }, toFiniteNumber: function(e2, t2) {
        return null != e2 && Number.isFinite(e2 = +e2) ? e2 : t2;
      }, findKey: ue, global: se, isContextDefined: ce, isSpecCompliantForm: function(e2) {
        return !!(e2 && J(e2.append) && "FormData" === e2[F] && e2[U]);
      }, toJSONObject: function(e2) {
        var t2 = new Array(10), n2 = function(e3, r2) {
          if (K(e3)) {
            if (t2.indexOf(e3) >= 0)
              return;
            if (M(e3))
              return e3;
            if (!("toJSON" in e3)) {
              t2[r2] = e3;
              var o2 = I(e3) ? [] : {};
              return ae(e3, function(e4, t3) {
                var i2 = n2(e4, r2 + 1);
                !q(i2) && (o2[t3] = i2);
              }), t2[r2] = void 0, o2;
            }
          }
          return e3;
        };
        return n2(e2, 0);
      }, isAsyncFn: we, isThenable: function(e2) {
        return e2 && (K(e2) || J(e2)) && J(e2.then) && J(e2.catch);
      }, setImmediate: Oe, asap: Ee, isIterable: function(e2) {
        return null != e2 && J(e2[U]);
      } }, Se = function(e2) {
        function t2(e3, n2, r2, o2, i2) {
          var a2;
          return c(this, t2), a2 = s(this, t2, [e3]), Object.defineProperty(a2, "message", { value: e3, enumerable: true, writable: true, configurable: true }), a2.name = "AxiosError", a2.isAxiosError = true, n2 && (a2.code = n2), r2 && (a2.config = r2), o2 && (a2.request = o2), i2 && (a2.response = i2, a2.status = i2.status), a2;
        }
        return h(t2, e2), l(t2, [{ key: "toJSON", value: function() {
          return { message: this.message, name: this.name, description: this.description, number: this.number, fileName: this.fileName, lineNumber: this.lineNumber, columnNumber: this.columnNumber, stack: this.stack, config: Re.toJSONObject(this.config), code: this.code, status: this.status };
        } }], [{ key: "from", value: function(e3, n2, r2, o2, i2, a2) {
          var u2 = new t2(e3.message, n2 || e3.code, r2, o2, i2);
          return u2.cause = e3, u2.name = e3.name, null != e3.status && null == u2.status && (u2.status = e3.status), a2 && Object.assign(u2, a2), u2;
        } }]);
      }(P(Error));
      Se.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE", Se.ERR_BAD_OPTION = "ERR_BAD_OPTION", Se.ECONNABORTED = "ECONNABORTED", Se.ETIMEDOUT = "ETIMEDOUT", Se.ERR_NETWORK = "ERR_NETWORK", Se.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS", Se.ERR_DEPRECATED = "ERR_DEPRECATED", Se.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE", Se.ERR_BAD_REQUEST = "ERR_BAD_REQUEST", Se.ERR_CANCELED = "ERR_CANCELED", Se.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT", Se.ERR_INVALID_URL = "ERR_INVALID_URL";
      function Te(e2) {
        return Re.isPlainObject(e2) || Re.isArray(e2);
      }
      function je(e2) {
        return Re.endsWith(e2, "[]") ? e2.slice(0, -2) : e2;
      }
      function Ae(e2, t2, n2) {
        return e2 ? e2.concat(t2).map(function(e3, t3) {
          return e3 = je(e3), !n2 && t3 ? "[" + e3 + "]" : e3;
        }).join(n2 ? "." : "") : t2;
      }
      var ke = Re.toFlatObject(Re, {}, null, function(e2) {
        return /^is[A-Z]/.test(e2);
      });
      function Pe(e2, t2, n2) {
        if (!Re.isObject(e2))
          throw new TypeError("target must be an object");
        t2 = t2 || new FormData();
        var r2 = (n2 = Re.toFlatObject(n2, { metaTokens: true, dots: false, indexes: false }, false, function(e3, t3) {
          return !Re.isUndefined(t3[e3]);
        })).metaTokens, o2 = n2.visitor || c2, i2 = n2.dots, a2 = n2.indexes, u2 = (n2.Blob || "undefined" != typeof Blob && Blob) && Re.isSpecCompliantForm(t2);
        if (!Re.isFunction(o2))
          throw new TypeError("visitor must be a function");
        function s2(e3) {
          if (null === e3)
            return "";
          if (Re.isDate(e3))
            return e3.toISOString();
          if (Re.isBoolean(e3))
            return e3.toString();
          if (!u2 && Re.isBlob(e3))
            throw new Se("Blob is not supported. Use a Buffer instead.");
          return Re.isArrayBuffer(e3) || Re.isTypedArray(e3) ? u2 && "function" == typeof Blob ? new Blob([e3]) : Buffer.from(e3) : e3;
        }
        function c2(e3, n3, o3) {
          var u3 = e3;
          if (Re.isReactNative(t2) && Re.isReactNativeBlob(e3))
            return t2.append(Ae(o3, n3, i2), s2(e3)), false;
          if (e3 && !o3 && "object" === T(e3)) {
            if (Re.endsWith(n3, "{}"))
              n3 = r2 ? n3 : n3.slice(0, -2), e3 = JSON.stringify(e3);
            else if (Re.isArray(e3) && function(e4) {
              return Re.isArray(e4) && !e4.some(Te);
            }(e3) || (Re.isFileList(e3) || Re.endsWith(n3, "[]")) && (u3 = Re.toArray(e3)))
              return n3 = je(n3), u3.forEach(function(e4, r3) {
                !Re.isUndefined(e4) && null !== e4 && t2.append(true === a2 ? Ae([n3], r3, i2) : null === a2 ? n3 : n3 + "[]", s2(e4));
              }), false;
          }
          return !!Te(e3) || (t2.append(Ae(o3, n3, i2), s2(e3)), false);
        }
        var f2 = [], l2 = Object.assign(ke, { defaultVisitor: c2, convertValue: s2, isVisitable: Te });
        if (!Re.isObject(e2))
          throw new TypeError("data must be an object");
        return function e3(n3, r3) {
          if (!Re.isUndefined(n3)) {
            if (-1 !== f2.indexOf(n3))
              throw Error("Circular reference detected in " + r3.join("."));
            f2.push(n3), Re.forEach(n3, function(n4, i3) {
              true === (!(Re.isUndefined(n4) || null === n4) && o2.call(t2, n4, Re.isString(i3) ? i3.trim() : i3, r3, l2)) && e3(n4, r3 ? r3.concat(i3) : [i3]);
            }), f2.pop();
          }
        }(e2), t2;
      }
      function _e(e2) {
        var t2 = { "!": "%21", "'": "%27", "(": "%28", ")": "%29", "~": "%7E", "%20": "+", "%00": "\0" };
        return encodeURIComponent(e2).replace(/[!'()~]|%20|%00/g, function(e3) {
          return t2[e3];
        });
      }
      function xe(e2, t2) {
        this._pairs = [], e2 && Pe(e2, this, t2);
      }
      var Ne = xe.prototype;
      function Ce(e2) {
        return encodeURIComponent(e2).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
      }
      function Ue(e2, t2, n2) {
        if (!t2)
          return e2;
        var r2, o2 = n2 && n2.encode || Ce, i2 = Re.isFunction(n2) ? { serialize: n2 } : n2, a2 = i2 && i2.serialize;
        if (r2 = a2 ? a2(t2, i2) : Re.isURLSearchParams(t2) ? t2.toString() : new xe(t2, i2).toString(o2)) {
          var u2 = e2.indexOf("#");
          -1 !== u2 && (e2 = e2.slice(0, u2)), e2 += (-1 === e2.indexOf("?") ? "?" : "&") + r2;
        }
        return e2;
      }
      Ne.append = function(e2, t2) {
        this._pairs.push([e2, t2]);
      }, Ne.toString = function(e2) {
        var t2 = e2 ? function(t3) {
          return e2.call(this, t3, _e);
        } : _e;
        return this._pairs.map(function(e3) {
          return t2(e3[0]) + "=" + t2(e3[1]);
        }, "").join("&");
      };
      var Fe = function() {
        return l(function e2() {
          c(this, e2), this.handlers = [];
        }, [{ key: "use", value: function(e2, t2, n2) {
          return this.handlers.push({ fulfilled: e2, rejected: t2, synchronous: !!n2 && n2.synchronous, runWhen: n2 ? n2.runWhen : null }), this.handlers.length - 1;
        } }, { key: "eject", value: function(e2) {
          this.handlers[e2] && (this.handlers[e2] = null);
        } }, { key: "clear", value: function() {
          this.handlers && (this.handlers = []);
        } }, { key: "forEach", value: function(e2) {
          Re.forEach(this.handlers, function(t2) {
            null !== t2 && e2(t2);
          });
        } }]);
      }(), De = { silentJSONParsing: true, forcedJSONParsing: true, clarifyTimeoutError: false, legacyInterceptorReqResOrdering: true }, Be = { isBrowser: true, classes: { URLSearchParams: "undefined" != typeof URLSearchParams ? URLSearchParams : xe, FormData: "undefined" != typeof FormData ? FormData : null, Blob: "undefined" != typeof Blob ? Blob : null }, protocols: ["http", "https", "file", "blob", "url", "data"] }, Le = "undefined" != typeof window && "undefined" != typeof document, Ie = "object" === ("undefined" == typeof navigator ? "undefined" : T(navigator)) && navigator || void 0, qe = Le && (!Ie || ["ReactNative", "NativeScript", "NS"].indexOf(Ie.product) < 0), Me = "undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope && "function" == typeof self.importScripts, ze = Le && window.location.href || "http://localhost", He = b(b({}, Object.freeze({ __proto__: null, hasBrowserEnv: Le, hasStandardBrowserEnv: qe, hasStandardBrowserWebWorkerEnv: Me, navigator: Ie, origin: ze })), Be);
      function Je(e2) {
        function t2(e3, n3, r2, o2) {
          var i2 = e3[o2++];
          if ("__proto__" === i2)
            return true;
          var a2 = Number.isFinite(+i2), u2 = o2 >= e3.length;
          return i2 = !i2 && Re.isArray(r2) ? r2.length : i2, u2 ? (Re.hasOwnProp(r2, i2) ? r2[i2] = [r2[i2], n3] : r2[i2] = n3, !a2) : (r2[i2] && Re.isObject(r2[i2]) || (r2[i2] = []), t2(e3, n3, r2[i2], o2) && Re.isArray(r2[i2]) && (r2[i2] = function(e4) {
            var t3, n4, r3 = {}, o3 = Object.keys(e4), i3 = o3.length;
            for (t3 = 0; t3 < i3; t3++)
              r3[n4 = o3[t3]] = e4[n4];
            return r3;
          }(r2[i2])), !a2);
        }
        if (Re.isFormData(e2) && Re.isFunction(e2.entries)) {
          var n2 = {};
          return Re.forEachEntry(e2, function(e3, r2) {
            t2(function(e4) {
              return Re.matchAll(/\w+|\[(\w*)]/g, e4).map(function(e5) {
                return "[]" === e5[0] ? "" : e5[1] || e5[0];
              });
            }(e3), r2, n2, 0);
          }), n2;
        }
        return null;
      }
      var We = { transitional: De, adapter: ["xhr", "http", "fetch"], transformRequest: [function(e2, t2) {
        var n2, r2 = t2.getContentType() || "", o2 = r2.indexOf("application/json") > -1, i2 = Re.isObject(e2);
        if (i2 && Re.isHTMLForm(e2) && (e2 = new FormData(e2)), Re.isFormData(e2))
          return o2 ? JSON.stringify(Je(e2)) : e2;
        if (Re.isArrayBuffer(e2) || Re.isBuffer(e2) || Re.isStream(e2) || Re.isFile(e2) || Re.isBlob(e2) || Re.isReadableStream(e2))
          return e2;
        if (Re.isArrayBufferView(e2))
          return e2.buffer;
        if (Re.isURLSearchParams(e2))
          return t2.setContentType("application/x-www-form-urlencoded;charset=utf-8", false), e2.toString();
        if (i2) {
          if (r2.indexOf("application/x-www-form-urlencoded") > -1)
            return function(e3, t3) {
              return Pe(e3, new He.classes.URLSearchParams(), b({ visitor: function(e4, t4, n3, r3) {
                return He.isNode && Re.isBuffer(e4) ? (this.append(t4, e4.toString("base64")), false) : r3.defaultVisitor.apply(this, arguments);
              } }, t3));
            }(e2, this.formSerializer).toString();
          if ((n2 = Re.isFileList(e2)) || r2.indexOf("multipart/form-data") > -1) {
            var a2 = this.env && this.env.FormData;
            return Pe(n2 ? { "files[]": e2 } : e2, a2 && new a2(), this.formSerializer);
          }
        }
        return i2 || o2 ? (t2.setContentType("application/json", false), function(e3, t3, n3) {
          if (Re.isString(e3))
            try {
              return (t3 || JSON.parse)(e3), Re.trim(e3);
            } catch (e4) {
              if ("SyntaxError" !== e4.name)
                throw e4;
            }
          return (n3 || JSON.stringify)(e3);
        }(e2)) : e2;
      }], transformResponse: [function(e2) {
        var t2 = this.transitional || We.transitional, n2 = t2 && t2.forcedJSONParsing, r2 = "json" === this.responseType;
        if (Re.isResponse(e2) || Re.isReadableStream(e2))
          return e2;
        if (e2 && Re.isString(e2) && (n2 && !this.responseType || r2)) {
          var o2 = !(t2 && t2.silentJSONParsing) && r2;
          try {
            return JSON.parse(e2, this.parseReviver);
          } catch (e3) {
            if (o2) {
              if ("SyntaxError" === e3.name)
                throw Se.from(e3, Se.ERR_BAD_RESPONSE, this, null, this.response);
              throw e3;
            }
          }
        }
        return e2;
      }], timeout: 0, xsrfCookieName: "XSRF-TOKEN", xsrfHeaderName: "X-XSRF-TOKEN", maxContentLength: -1, maxBodyLength: -1, env: { FormData: He.classes.FormData, Blob: He.classes.Blob }, validateStatus: function(e2) {
        return e2 >= 200 && e2 < 300;
      }, headers: { common: { Accept: "application/json, text/plain, */*", "Content-Type": void 0 } } };
      Re.forEach(["delete", "get", "head", "post", "put", "patch"], function(e2) {
        We.headers[e2] = {};
      });
      var Ke = Re.toObjectSet(["age", "authorization", "content-length", "content-type", "etag", "expires", "from", "host", "if-modified-since", "if-unmodified-since", "last-modified", "location", "max-forwards", "proxy-authorization", "referer", "retry-after", "user-agent"]), Ve = Symbol("internals");
      function Ge(e2) {
        return e2 && String(e2).trim().toLowerCase();
      }
      function Xe(e2) {
        return false === e2 || null == e2 ? e2 : Re.isArray(e2) ? e2.map(Xe) : String(e2).replace(/[\r\n]+$/, "");
      }
      function $e(e2, t2, n2, r2, o2) {
        return Re.isFunction(r2) ? r2.call(this, t2, n2) : (o2 && (t2 = n2), Re.isString(t2) ? Re.isString(r2) ? -1 !== t2.indexOf(r2) : Re.isRegExp(r2) ? r2.test(t2) : void 0 : void 0);
      }
      var Qe = function() {
        return l(function e2(t2) {
          c(this, e2), t2 && this.set(t2);
        }, [{ key: "set", value: function(e2, t2, n2) {
          var r2 = this;
          function o2(e3, t3, n3) {
            var o3 = Ge(t3);
            if (!o3)
              throw new Error("header name must be a non-empty string");
            var i3 = Re.findKey(r2, o3);
            (!i3 || void 0 === r2[i3] || true === n3 || void 0 === n3 && false !== r2[i3]) && (r2[i3 || t3] = Xe(e3));
          }
          var i2 = function(e3, t3) {
            return Re.forEach(e3, function(e4, n3) {
              return o2(e4, n3, t3);
            });
          };
          if (Re.isPlainObject(e2) || e2 instanceof this.constructor)
            i2(e2, t2);
          else if (Re.isString(e2) && (e2 = e2.trim()) && !/^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e2.trim()))
            i2(function(e3) {
              var t3, n3, r3, o3 = {};
              return e3 && e3.split("\n").forEach(function(e4) {
                r3 = e4.indexOf(":"), t3 = e4.substring(0, r3).trim().toLowerCase(), n3 = e4.substring(r3 + 1).trim(), !t3 || o3[t3] && Ke[t3] || ("set-cookie" === t3 ? o3[t3] ? o3[t3].push(n3) : o3[t3] = [n3] : o3[t3] = o3[t3] ? o3[t3] + ", " + n3 : n3);
              }), o3;
            }(e2), t2);
          else if (Re.isObject(e2) && Re.isIterable(e2)) {
            var a2, u2, s2, c2 = {}, f2 = function(e3, t3) {
              var n3 = "undefined" != typeof Symbol && e3[Symbol.iterator] || e3["@@iterator"];
              if (!n3) {
                if (Array.isArray(e3) || (n3 = j(e3)) || t3) {
                  n3 && (e3 = n3);
                  var r3 = 0, o3 = function() {
                  };
                  return { s: o3, n: function() {
                    return r3 >= e3.length ? { done: true } : { done: false, value: e3[r3++] };
                  }, e: function(e4) {
                    throw e4;
                  }, f: o3 };
                }
                throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
              }
              var i3, a3 = true, u3 = false;
              return { s: function() {
                n3 = n3.call(e3);
              }, n: function() {
                var e4 = n3.next();
                return a3 = e4.done, e4;
              }, e: function(e4) {
                u3 = true, i3 = e4;
              }, f: function() {
                try {
                  a3 || null == n3.return || n3.return();
                } finally {
                  if (u3)
                    throw i3;
                }
              } };
            }(e2);
            try {
              for (f2.s(); !(s2 = f2.n()).done; ) {
                var l2 = s2.value;
                if (!Re.isArray(l2))
                  throw TypeError("Object iterator must return a key-value pair");
                c2[u2 = l2[0]] = (a2 = c2[u2]) ? Re.isArray(a2) ? [].concat(R(a2), [l2[1]]) : [a2, l2[1]] : l2[1];
              }
            } catch (e3) {
              f2.e(e3);
            } finally {
              f2.f();
            }
            i2(c2, t2);
          } else
            null != e2 && o2(t2, e2, n2);
          return this;
        } }, { key: "get", value: function(e2, t2) {
          if (e2 = Ge(e2)) {
            var n2 = Re.findKey(this, e2);
            if (n2) {
              var r2 = this[n2];
              if (!t2)
                return r2;
              if (true === t2)
                return function(e3) {
                  for (var t3, n3 = /* @__PURE__ */ Object.create(null), r3 = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g; t3 = r3.exec(e3); )
                    n3[t3[1]] = t3[2];
                  return n3;
                }(r2);
              if (Re.isFunction(t2))
                return t2.call(this, r2, n2);
              if (Re.isRegExp(t2))
                return t2.exec(r2);
              throw new TypeError("parser must be boolean|regexp|function");
            }
          }
        } }, { key: "has", value: function(e2, t2) {
          if (e2 = Ge(e2)) {
            var n2 = Re.findKey(this, e2);
            return !(!n2 || void 0 === this[n2] || t2 && !$e(0, this[n2], n2, t2));
          }
          return false;
        } }, { key: "delete", value: function(e2, t2) {
          var n2 = this, r2 = false;
          function o2(e3) {
            if (e3 = Ge(e3)) {
              var o3 = Re.findKey(n2, e3);
              !o3 || t2 && !$e(0, n2[o3], o3, t2) || (delete n2[o3], r2 = true);
            }
          }
          return Re.isArray(e2) ? e2.forEach(o2) : o2(e2), r2;
        } }, { key: "clear", value: function(e2) {
          for (var t2 = Object.keys(this), n2 = t2.length, r2 = false; n2--; ) {
            var o2 = t2[n2];
            e2 && !$e(0, this[o2], o2, e2, true) || (delete this[o2], r2 = true);
          }
          return r2;
        } }, { key: "normalize", value: function(e2) {
          var t2 = this, n2 = {};
          return Re.forEach(this, function(r2, o2) {
            var i2 = Re.findKey(n2, o2);
            if (i2)
              return t2[i2] = Xe(r2), void delete t2[o2];
            var a2 = e2 ? function(e3) {
              return e3.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, function(e4, t3, n3) {
                return t3.toUpperCase() + n3;
              });
            }(o2) : String(o2).trim();
            a2 !== o2 && delete t2[o2], t2[a2] = Xe(r2), n2[a2] = true;
          }), this;
        } }, { key: "concat", value: function() {
          for (var e2, t2 = arguments.length, n2 = new Array(t2), r2 = 0; r2 < t2; r2++)
            n2[r2] = arguments[r2];
          return (e2 = this.constructor).concat.apply(e2, [this].concat(n2));
        } }, { key: "toJSON", value: function(e2) {
          var t2 = /* @__PURE__ */ Object.create(null);
          return Re.forEach(this, function(n2, r2) {
            null != n2 && false !== n2 && (t2[r2] = e2 && Re.isArray(n2) ? n2.join(", ") : n2);
          }), t2;
        } }, { key: Symbol.iterator, value: function() {
          return Object.entries(this.toJSON())[Symbol.iterator]();
        } }, { key: "toString", value: function() {
          return Object.entries(this.toJSON()).map(function(e2) {
            var t2 = E(e2, 2);
            return t2[0] + ": " + t2[1];
          }).join("\n");
        } }, { key: "getSetCookie", value: function() {
          return this.get("set-cookie") || [];
        } }, { key: Symbol.toStringTag, get: function() {
          return "AxiosHeaders";
        } }], [{ key: "from", value: function(e2) {
          return e2 instanceof this ? e2 : new this(e2);
        } }, { key: "concat", value: function(e2) {
          for (var t2 = new this(e2), n2 = arguments.length, r2 = new Array(n2 > 1 ? n2 - 1 : 0), o2 = 1; o2 < n2; o2++)
            r2[o2 - 1] = arguments[o2];
          return r2.forEach(function(e3) {
            return t2.set(e3);
          }), t2;
        } }, { key: "accessor", value: function(e2) {
          var t2 = (this[Ve] = this[Ve] = { accessors: {} }).accessors, n2 = this.prototype;
          function r2(e3) {
            var r3 = Ge(e3);
            t2[r3] || (!function(e4, t3) {
              var n3 = Re.toCamelCase(" " + t3);
              ["get", "set", "has"].forEach(function(r4) {
                Object.defineProperty(e4, r4 + n3, { value: function(e5, n4, o2) {
                  return this[r4].call(this, t3, e5, n4, o2);
                }, configurable: true });
              });
            }(n2, e3), t2[r3] = true);
          }
          return Re.isArray(e2) ? e2.forEach(r2) : r2(e2), this;
        } }]);
      }();
      function Ye(e2, t2) {
        var n2 = this || We, r2 = t2 || n2, o2 = Qe.from(r2.headers), i2 = r2.data;
        return Re.forEach(e2, function(e3) {
          i2 = e3.call(n2, i2, o2.normalize(), t2 ? t2.status : void 0);
        }), o2.normalize(), i2;
      }
      function Ze(e2) {
        return !(!e2 || !e2.__CANCEL__);
      }
      Qe.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]), Re.reduceDescriptors(Qe.prototype, function(e2, t2) {
        var n2 = e2.value, r2 = t2[0].toUpperCase() + t2.slice(1);
        return { get: function() {
          return n2;
        }, set: function(e3) {
          this[r2] = e3;
        } };
      }), Re.freezeMethods(Qe);
      var et = function(e2) {
        function t2(e3, n2, r2) {
          var o2;
          return c(this, t2), (o2 = s(this, t2, [null == e3 ? "canceled" : e3, Se.ERR_CANCELED, n2, r2])).name = "CanceledError", o2.__CANCEL__ = true, o2;
        }
        return h(t2, e2), l(t2);
      }(Se);
      function tt(e2, t2, n2) {
        var r2 = n2.config.validateStatus;
        n2.status && r2 && !r2(n2.status) ? t2(new Se("Request failed with status code " + n2.status, [Se.ERR_BAD_REQUEST, Se.ERR_BAD_RESPONSE][Math.floor(n2.status / 100) - 4], n2.config, n2.request, n2)) : e2(n2);
      }
      var nt = function(e2, t2) {
        var n2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 3, r2 = 0, o2 = function(e3, t3) {
          e3 = e3 || 10;
          var n3, r3 = new Array(e3), o3 = new Array(e3), i2 = 0, a2 = 0;
          return t3 = void 0 !== t3 ? t3 : 1e3, function(u2) {
            var s2 = Date.now(), c2 = o3[a2];
            n3 || (n3 = s2), r3[i2] = u2, o3[i2] = s2;
            for (var f2 = a2, l2 = 0; f2 !== i2; )
              l2 += r3[f2++], f2 %= e3;
            if ((i2 = (i2 + 1) % e3) === a2 && (a2 = (a2 + 1) % e3), !(s2 - n3 < t3)) {
              var d2 = c2 && s2 - c2;
              return d2 ? Math.round(1e3 * l2 / d2) : void 0;
            }
          };
        }(50, 250);
        return function(e3, t3) {
          var n3, r3, o3 = 0, i2 = 1e3 / t3, a2 = function(t4) {
            var i3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : Date.now();
            o3 = i3, n3 = null, r3 && (clearTimeout(r3), r3 = null), e3.apply(void 0, R(t4));
          };
          return [function() {
            for (var e4 = Date.now(), t4 = e4 - o3, u2 = arguments.length, s2 = new Array(u2), c2 = 0; c2 < u2; c2++)
              s2[c2] = arguments[c2];
            t4 >= i2 ? a2(s2, e4) : (n3 = s2, r3 || (r3 = setTimeout(function() {
              r3 = null, a2(n3);
            }, i2 - t4)));
          }, function() {
            return n3 && a2(n3);
          }];
        }(function(n3) {
          var i2 = n3.loaded, a2 = n3.lengthComputable ? n3.total : void 0, u2 = i2 - r2, s2 = o2(u2);
          r2 = i2;
          var c2 = d({ loaded: i2, total: a2, progress: a2 ? i2 / a2 : void 0, bytes: u2, rate: s2 || void 0, estimated: s2 && a2 && i2 <= a2 ? (a2 - i2) / s2 : void 0, event: n3, lengthComputable: null != a2 }, t2 ? "download" : "upload", true);
          e2(c2);
        }, n2);
      }, rt = function(e2, t2) {
        var n2 = null != e2;
        return [function(r2) {
          return t2[0]({ lengthComputable: n2, total: e2, loaded: r2 });
        }, t2[1]];
      }, ot = function(e2) {
        return function() {
          for (var t2 = arguments.length, n2 = new Array(t2), r2 = 0; r2 < t2; r2++)
            n2[r2] = arguments[r2];
          return Re.asap(function() {
            return e2.apply(void 0, n2);
          });
        };
      }, it = He.hasStandardBrowserEnv ? /* @__PURE__ */ function(e2, t2) {
        return function(n2) {
          return n2 = new URL(n2, He.origin), e2.protocol === n2.protocol && e2.host === n2.host && (t2 || e2.port === n2.port);
        };
      }(new URL(He.origin), He.navigator && /(msie|trident)/i.test(He.navigator.userAgent)) : function() {
        return true;
      }, at = He.hasStandardBrowserEnv ? { write: function(e2, t2, n2, r2, o2, i2, a2) {
        if ("undefined" != typeof document) {
          var u2 = ["".concat(e2, "=").concat(encodeURIComponent(t2))];
          Re.isNumber(n2) && u2.push("expires=".concat(new Date(n2).toUTCString())), Re.isString(r2) && u2.push("path=".concat(r2)), Re.isString(o2) && u2.push("domain=".concat(o2)), true === i2 && u2.push("secure"), Re.isString(a2) && u2.push("SameSite=".concat(a2)), document.cookie = u2.join("; ");
        }
      }, read: function(e2) {
        if ("undefined" == typeof document)
          return null;
        var t2 = document.cookie.match(new RegExp("(?:^|; )" + e2 + "=([^;]*)"));
        return t2 ? decodeURIComponent(t2[1]) : null;
      }, remove: function(e2) {
        this.write(e2, "", Date.now() - 864e5, "/");
      } } : { write: function() {
      }, read: function() {
        return null;
      }, remove: function() {
      } };
      function ut(e2, t2, n2) {
        var r2, o2 = !("string" == typeof (r2 = t2) && /^([a-z][a-z\d+\-.]*:)?\/\//i.test(r2));
        return e2 && (o2 || 0 == n2) ? function(e3, t3) {
          return t3 ? e3.replace(/\/?\/$/, "") + "/" + t3.replace(/^\/+/, "") : e3;
        }(e2, t2) : t2;
      }
      var st = function(e2) {
        return e2 instanceof Qe ? b({}, e2) : e2;
      };
      function ct(e2, t2) {
        t2 = t2 || {};
        var n2 = {};
        function r2(e3, t3, n3, r3) {
          return Re.isPlainObject(e3) && Re.isPlainObject(t3) ? Re.merge.call({ caseless: r3 }, e3, t3) : Re.isPlainObject(t3) ? Re.merge({}, t3) : Re.isArray(t3) ? t3.slice() : t3;
        }
        function o2(e3, t3, n3, o3) {
          return Re.isUndefined(t3) ? Re.isUndefined(e3) ? void 0 : r2(void 0, e3, 0, o3) : r2(e3, t3, 0, o3);
        }
        function i2(e3, t3) {
          if (!Re.isUndefined(t3))
            return r2(void 0, t3);
        }
        function a2(e3, t3) {
          return Re.isUndefined(t3) ? Re.isUndefined(e3) ? void 0 : r2(void 0, e3) : r2(void 0, t3);
        }
        function u2(n3, o3, i3) {
          return i3 in t2 ? r2(n3, o3) : i3 in e2 ? r2(void 0, n3) : void 0;
        }
        var s2 = { url: i2, method: i2, data: i2, baseURL: a2, transformRequest: a2, transformResponse: a2, paramsSerializer: a2, timeout: a2, timeoutMessage: a2, withCredentials: a2, withXSRFToken: a2, adapter: a2, responseType: a2, xsrfCookieName: a2, xsrfHeaderName: a2, onUploadProgress: a2, onDownloadProgress: a2, decompress: a2, maxContentLength: a2, maxBodyLength: a2, beforeRedirect: a2, transport: a2, httpAgent: a2, httpsAgent: a2, cancelToken: a2, socketPath: a2, responseEncoding: a2, validateStatus: u2, headers: function(e3, t3, n3) {
          return o2(st(e3), st(t3), 0, true);
        } };
        return Re.forEach(Object.keys(b(b({}, e2), t2)), function(r3) {
          if ("__proto__" !== r3 && "constructor" !== r3 && "prototype" !== r3) {
            var i3 = Re.hasOwnProp(s2, r3) ? s2[r3] : o2, a3 = i3(e2[r3], t2[r3], r3);
            Re.isUndefined(a3) && i3 !== u2 || (n2[r3] = a3);
          }
        }), n2;
      }
      var ft, lt = function(e2) {
        var t2 = ct({}, e2), n2 = t2.data, r2 = t2.withXSRFToken, o2 = t2.xsrfHeaderName, i2 = t2.xsrfCookieName, a2 = t2.headers, u2 = t2.auth;
        if (t2.headers = a2 = Qe.from(a2), t2.url = Ue(ut(t2.baseURL, t2.url, t2.allowAbsoluteUrls), e2.params, e2.paramsSerializer), u2 && a2.set("Authorization", "Basic " + btoa((u2.username || "") + ":" + (u2.password ? unescape(encodeURIComponent(u2.password)) : ""))), Re.isFormData(n2)) {
          if (He.hasStandardBrowserEnv || He.hasStandardBrowserWebWorkerEnv)
            a2.setContentType(void 0);
          else if (Re.isFunction(n2.getHeaders)) {
            var s2 = n2.getHeaders(), c2 = ["content-type", "content-length"];
            Object.entries(s2).forEach(function(e3) {
              var t3 = E(e3, 2), n3 = t3[0], r3 = t3[1];
              c2.includes(n3.toLowerCase()) && a2.set(n3, r3);
            });
          }
        }
        if (He.hasStandardBrowserEnv && (r2 && Re.isFunction(r2) && (r2 = r2(t2)), r2 || false !== r2 && it(t2.url))) {
          var f2 = o2 && i2 && at.read(i2);
          f2 && a2.set(o2, f2);
        }
        return t2;
      }, dt = "undefined" != typeof XMLHttpRequest && function(e2) {
        return new Promise(function(t2, n2) {
          var r2, o2, i2, a2, u2, s2 = lt(e2), c2 = s2.data, f2 = Qe.from(s2.headers).normalize(), l2 = s2.responseType, d2 = s2.onUploadProgress, p2 = s2.onDownloadProgress;
          function h2() {
            a2 && a2(), u2 && u2(), s2.cancelToken && s2.cancelToken.unsubscribe(r2), s2.signal && s2.signal.removeEventListener("abort", r2);
          }
          var y2 = new XMLHttpRequest();
          function v2() {
            if (y2) {
              var r3 = Qe.from("getAllResponseHeaders" in y2 && y2.getAllResponseHeaders());
              tt(function(e3) {
                t2(e3), h2();
              }, function(e3) {
                n2(e3), h2();
              }, { data: l2 && "text" !== l2 && "json" !== l2 ? y2.response : y2.responseText, status: y2.status, statusText: y2.statusText, headers: r3, config: e2, request: y2 }), y2 = null;
            }
          }
          if (y2.open(s2.method.toUpperCase(), s2.url, true), y2.timeout = s2.timeout, "onloadend" in y2 ? y2.onloadend = v2 : y2.onreadystatechange = function() {
            y2 && 4 === y2.readyState && (0 !== y2.status || y2.responseURL && 0 === y2.responseURL.indexOf("file:")) && setTimeout(v2);
          }, y2.onabort = function() {
            y2 && (n2(new Se("Request aborted", Se.ECONNABORTED, e2, y2)), y2 = null);
          }, y2.onerror = function(t3) {
            var r3 = t3 && t3.message ? t3.message : "Network Error", o3 = new Se(r3, Se.ERR_NETWORK, e2, y2);
            o3.event = t3 || null, n2(o3), y2 = null;
          }, y2.ontimeout = function() {
            var t3 = s2.timeout ? "timeout of " + s2.timeout + "ms exceeded" : "timeout exceeded", r3 = s2.transitional || De;
            s2.timeoutErrorMessage && (t3 = s2.timeoutErrorMessage), n2(new Se(t3, r3.clarifyTimeoutError ? Se.ETIMEDOUT : Se.ECONNABORTED, e2, y2)), y2 = null;
          }, void 0 === c2 && f2.setContentType(null), "setRequestHeader" in y2 && Re.forEach(f2.toJSON(), function(e3, t3) {
            y2.setRequestHeader(t3, e3);
          }), Re.isUndefined(s2.withCredentials) || (y2.withCredentials = !!s2.withCredentials), l2 && "json" !== l2 && (y2.responseType = s2.responseType), p2) {
            var b2 = E(nt(p2, true), 2);
            i2 = b2[0], u2 = b2[1], y2.addEventListener("progress", i2);
          }
          if (d2 && y2.upload) {
            var m2 = E(nt(d2), 2);
            o2 = m2[0], a2 = m2[1], y2.upload.addEventListener("progress", o2), y2.upload.addEventListener("loadend", a2);
          }
          (s2.cancelToken || s2.signal) && (r2 = function(t3) {
            y2 && (n2(!t3 || t3.type ? new et(null, e2, y2) : t3), y2.abort(), y2 = null);
          }, s2.cancelToken && s2.cancelToken.subscribe(r2), s2.signal && (s2.signal.aborted ? r2() : s2.signal.addEventListener("abort", r2)));
          var g2, w2, O2 = (g2 = s2.url, (w2 = /^([-+\w]{1,25})(:?\/\/|:)/.exec(g2)) && w2[1] || "");
          O2 && -1 === He.protocols.indexOf(O2) ? n2(new Se("Unsupported protocol " + O2 + ":", Se.ERR_BAD_REQUEST, e2)) : y2.send(c2 || null);
        });
      }, pt = function(e2, t2) {
        var n2 = (e2 = e2 ? e2.filter(Boolean) : []).length;
        if (t2 || n2) {
          var r2, o2 = new AbortController(), i2 = function(e3) {
            if (!r2) {
              r2 = true, u2();
              var t3 = e3 instanceof Error ? e3 : this.reason;
              o2.abort(t3 instanceof Se ? t3 : new et(t3 instanceof Error ? t3.message : t3));
            }
          }, a2 = t2 && setTimeout(function() {
            a2 = null, i2(new Se("timeout of ".concat(t2, "ms exceeded"), Se.ETIMEDOUT));
          }, t2), u2 = function() {
            e2 && (a2 && clearTimeout(a2), a2 = null, e2.forEach(function(e3) {
              e3.unsubscribe ? e3.unsubscribe(i2) : e3.removeEventListener("abort", i2);
            }), e2 = null);
          };
          e2.forEach(function(e3) {
            return e3.addEventListener("abort", i2);
          });
          var s2 = o2.signal;
          return s2.unsubscribe = function() {
            return Re.asap(u2);
          }, s2;
        }
      }, ht = m().m(function e2(t2, n2) {
        var r2, o2, i2;
        return m().w(function(e3) {
          for (; ; )
            switch (e3.n) {
              case 0:
                if (r2 = t2.byteLength, n2 && !(r2 < n2)) {
                  e3.n = 2;
                  break;
                }
                return e3.n = 1, t2;
              case 1:
                return e3.a(2);
              case 2:
                o2 = 0;
              case 3:
                if (!(o2 < r2)) {
                  e3.n = 5;
                  break;
                }
                return i2 = o2 + n2, e3.n = 4, t2.slice(o2, i2);
              case 4:
                o2 = i2, e3.n = 3;
                break;
              case 5:
                return e3.a(2);
            }
        }, e2);
      }), yt = function() {
        var e2 = A(m().m(function e3(t2, o2) {
          var i2, a2, s2, c2, f2, l2, d2;
          return m().w(function(e4) {
            for (; ; )
              switch (e4.p = e4.n) {
                case 0:
                  i2 = false, a2 = false, e4.p = 1, c2 = r(vt(t2));
                case 2:
                  return e4.n = 3, u(c2.next());
                case 3:
                  if (!(i2 = !(f2 = e4.v).done)) {
                    e4.n = 5;
                    break;
                  }
                  return l2 = f2.value, e4.d(w(n(r(ht(l2, o2)))), 4);
                case 4:
                  i2 = false, e4.n = 2;
                  break;
                case 5:
                  e4.n = 7;
                  break;
                case 6:
                  e4.p = 6, d2 = e4.v, a2 = true, s2 = d2;
                case 7:
                  if (e4.p = 7, e4.p = 8, !i2 || null == c2.return) {
                    e4.n = 9;
                    break;
                  }
                  return e4.n = 9, u(c2.return());
                case 9:
                  if (e4.p = 9, !a2) {
                    e4.n = 10;
                    break;
                  }
                  throw s2;
                case 10:
                  return e4.f(9);
                case 11:
                  return e4.f(7);
                case 12:
                  return e4.a(2);
              }
          }, e3, null, [[8, , 9, 11], [1, 6, 7, 12]]);
        }));
        return function(t2, n2) {
          return e2.apply(this, arguments);
        };
      }(), vt = function() {
        var e2 = A(m().m(function e3(t2) {
          var o2, i2, a2, s2;
          return m().w(function(e4) {
            for (; ; )
              switch (e4.p = e4.n) {
                case 0:
                  if (!t2[Symbol.asyncIterator]) {
                    e4.n = 2;
                    break;
                  }
                  return e4.d(w(n(r(t2))), 1);
                case 1:
                  return e4.a(2);
                case 2:
                  o2 = t2.getReader(), e4.p = 3;
                case 4:
                  return e4.n = 5, u(o2.read());
                case 5:
                  if (i2 = e4.v, a2 = i2.done, s2 = i2.value, !a2) {
                    e4.n = 6;
                    break;
                  }
                  return e4.a(3, 8);
                case 6:
                  return e4.n = 7, s2;
                case 7:
                  e4.n = 4;
                  break;
                case 8:
                  return e4.p = 8, e4.n = 9, u(o2.cancel());
                case 9:
                  return e4.f(8);
                case 10:
                  return e4.a(2);
              }
          }, e3, null, [[3, , 8, 10]]);
        }));
        return function(t2) {
          return e2.apply(this, arguments);
        };
      }(), bt = function(e2, t2, n2, r2) {
        var o2, i2 = yt(e2, t2), u2 = 0, s2 = function(e3) {
          o2 || (o2 = true, r2 && r2(e3));
        };
        return new ReadableStream({ pull: function(e3) {
          return a(m().m(function t3() {
            var r3, o3, a2, c2, f2, l2;
            return m().w(function(t4) {
              for (; ; )
                switch (t4.p = t4.n) {
                  case 0:
                    return t4.p = 0, t4.n = 1, i2.next();
                  case 1:
                    if (r3 = t4.v, o3 = r3.done, a2 = r3.value, !o3) {
                      t4.n = 2;
                      break;
                    }
                    return s2(), e3.close(), t4.a(2);
                  case 2:
                    c2 = a2.byteLength, n2 && (f2 = u2 += c2, n2(f2)), e3.enqueue(new Uint8Array(a2)), t4.n = 4;
                    break;
                  case 3:
                    throw t4.p = 3, l2 = t4.v, s2(l2), l2;
                  case 4:
                    return t4.a(2);
                }
            }, t3, null, [[0, 3]]);
          }))();
        }, cancel: function(e3) {
          return s2(e3), i2.return();
        } }, { highWaterMark: 2 });
      }, mt = Re.isFunction, gt = { Request: (ft = Re.global).Request, Response: ft.Response }, wt = Re.global, Ot = wt.ReadableStream, Et = wt.TextEncoder, Rt = function(e2) {
        try {
          for (var t2 = arguments.length, n2 = new Array(t2 > 1 ? t2 - 1 : 0), r2 = 1; r2 < t2; r2++)
            n2[r2 - 1] = arguments[r2];
          return !!e2.apply(void 0, n2);
        } catch (e3) {
          return false;
        }
      }, St = function(e2) {
        var t2 = e2 = Re.merge.call({ skipUndefined: true }, gt, e2), n2 = t2.fetch, r2 = t2.Request, o2 = t2.Response, i2 = n2 ? mt(n2) : "function" == typeof fetch, u2 = mt(r2), s2 = mt(o2);
        if (!i2)
          return false;
        var c2, f2 = i2 && mt(Ot), l2 = i2 && ("function" == typeof Et ? (c2 = new Et(), function(e3) {
          return c2.encode(e3);
        }) : function() {
          var e3 = a(m().m(function e4(t3) {
            var n3, o3;
            return m().w(function(e5) {
              for (; ; )
                switch (e5.n) {
                  case 0:
                    return n3 = Uint8Array, e5.n = 1, new r2(t3).arrayBuffer();
                  case 1:
                    return o3 = e5.v, e5.a(2, new n3(o3));
                }
            }, e4);
          }));
          return function(t3) {
            return e3.apply(this, arguments);
          };
        }()), d2 = u2 && f2 && Rt(function() {
          var e3 = false, t3 = new Ot(), n3 = new r2(He.origin, { body: t3, method: "POST", get duplex() {
            return e3 = true, "half";
          } }).headers.has("Content-Type");
          return t3.cancel(), e3 && !n3;
        }), p2 = s2 && f2 && Rt(function() {
          return Re.isReadableStream(new o2("").body);
        }), h2 = { stream: p2 && function(e3) {
          return e3.body;
        } };
        i2 && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach(function(e3) {
          !h2[e3] && (h2[e3] = function(t3, n3) {
            var r3 = t3 && t3[e3];
            if (r3)
              return r3.call(t3);
            throw new Se("Response type '".concat(e3, "' is not supported"), Se.ERR_NOT_SUPPORT, n3);
          });
        });
        var y2 = function() {
          var e3 = a(m().m(function e4(t3) {
            var n3;
            return m().w(function(e5) {
              for (; ; )
                switch (e5.n) {
                  case 0:
                    if (null != t3) {
                      e5.n = 1;
                      break;
                    }
                    return e5.a(2, 0);
                  case 1:
                    if (!Re.isBlob(t3)) {
                      e5.n = 2;
                      break;
                    }
                    return e5.a(2, t3.size);
                  case 2:
                    if (!Re.isSpecCompliantForm(t3)) {
                      e5.n = 4;
                      break;
                    }
                    return n3 = new r2(He.origin, { method: "POST", body: t3 }), e5.n = 3, n3.arrayBuffer();
                  case 3:
                  case 6:
                    return e5.a(2, e5.v.byteLength);
                  case 4:
                    if (!Re.isArrayBufferView(t3) && !Re.isArrayBuffer(t3)) {
                      e5.n = 5;
                      break;
                    }
                    return e5.a(2, t3.byteLength);
                  case 5:
                    if (Re.isURLSearchParams(t3) && (t3 += ""), !Re.isString(t3)) {
                      e5.n = 7;
                      break;
                    }
                    return e5.n = 6, l2(t3);
                  case 7:
                    return e5.a(2);
                }
            }, e4);
          }));
          return function(t3) {
            return e3.apply(this, arguments);
          };
        }(), v2 = function() {
          var e3 = a(m().m(function e4(t3, n3) {
            var r3;
            return m().w(function(e5) {
              for (; ; )
                if (0 === e5.n)
                  return r3 = Re.toFiniteNumber(t3.getContentLength()), e5.a(2, null == r3 ? y2(n3) : r3);
            }, e4);
          }));
          return function(t3, n3) {
            return e3.apply(this, arguments);
          };
        }();
        return function() {
          var e3 = a(m().m(function e4(t3) {
            var i3, a2, s3, c3, f3, l3, y3, g2, w2, O2, R2, S2, T2, j2, A2, k2, P2, _2, x2, N2, C2, U2, F2, D2, B2, L2, I2, q2, M2, z2, H2, J2, W2, K2, V2, G2, X2, $2, Q2;
            return m().w(function(e5) {
              for (; ; )
                switch (e5.p = e5.n) {
                  case 0:
                    if (i3 = lt(t3), a2 = i3.url, s3 = i3.method, c3 = i3.data, f3 = i3.signal, l3 = i3.cancelToken, y3 = i3.timeout, g2 = i3.onDownloadProgress, w2 = i3.onUploadProgress, O2 = i3.responseType, R2 = i3.headers, S2 = i3.withCredentials, T2 = void 0 === S2 ? "same-origin" : S2, j2 = i3.fetchOptions, A2 = n2 || fetch, O2 = O2 ? (O2 + "").toLowerCase() : "text", k2 = pt([f3, l3 && l3.toAbortSignal()], y3), P2 = null, _2 = k2 && k2.unsubscribe && function() {
                      k2.unsubscribe();
                    }, e5.p = 1, !(X2 = w2 && d2 && "get" !== s3 && "head" !== s3)) {
                      e5.n = 3;
                      break;
                    }
                    return e5.n = 2, v2(R2, c3);
                  case 2:
                    $2 = x2 = e5.v, X2 = 0 !== $2;
                  case 3:
                    if (!X2) {
                      e5.n = 4;
                      break;
                    }
                    N2 = new r2(a2, { method: "POST", body: c3, duplex: "half" }), Re.isFormData(c3) && (C2 = N2.headers.get("content-type")) && R2.setContentType(C2), N2.body && (U2 = rt(x2, nt(ot(w2))), F2 = E(U2, 2), D2 = F2[0], B2 = F2[1], c3 = bt(N2.body, 65536, D2, B2));
                  case 4:
                    return Re.isString(T2) || (T2 = T2 ? "include" : "omit"), L2 = u2 && "credentials" in r2.prototype, I2 = b(b({}, j2), {}, { signal: k2, method: s3.toUpperCase(), headers: R2.normalize().toJSON(), body: c3, duplex: "half", credentials: L2 ? T2 : void 0 }), P2 = u2 && new r2(a2, I2), e5.n = 5, u2 ? A2(P2, j2) : A2(a2, I2);
                  case 5:
                    return q2 = e5.v, M2 = p2 && ("stream" === O2 || "response" === O2), p2 && (g2 || M2 && _2) && (z2 = {}, ["status", "statusText", "headers"].forEach(function(e6) {
                      z2[e6] = q2[e6];
                    }), H2 = Re.toFiniteNumber(q2.headers.get("content-length")), J2 = g2 && rt(H2, nt(ot(g2), true)) || [], W2 = E(J2, 2), K2 = W2[0], V2 = W2[1], q2 = new o2(bt(q2.body, 65536, K2, function() {
                      V2 && V2(), _2 && _2();
                    }), z2)), O2 = O2 || "text", e5.n = 6, h2[Re.findKey(h2, O2) || "text"](q2, t3);
                  case 6:
                    return G2 = e5.v, !M2 && _2 && _2(), e5.n = 7, new Promise(function(e6, n3) {
                      tt(e6, n3, { data: G2, headers: Qe.from(q2.headers), status: q2.status, statusText: q2.statusText, config: t3, request: P2 });
                    });
                  case 7:
                    return e5.a(2, e5.v);
                  case 8:
                    if (e5.p = 8, Q2 = e5.v, _2 && _2(), !Q2 || "TypeError" !== Q2.name || !/Load failed|fetch/i.test(Q2.message)) {
                      e5.n = 9;
                      break;
                    }
                    throw Object.assign(new Se("Network Error", Se.ERR_NETWORK, t3, P2, Q2 && Q2.response), { cause: Q2.cause || Q2 });
                  case 9:
                    throw Se.from(Q2, Q2 && Q2.code, t3, P2, Q2 && Q2.response);
                  case 10:
                    return e5.a(2);
                }
            }, e4, null, [[1, 8]]);
          }));
          return function(t3) {
            return e3.apply(this, arguments);
          };
        }();
      }, Tt = /* @__PURE__ */ new Map(), jt = function(e2) {
        for (var t2, n2, r2 = e2 && e2.env || {}, o2 = r2.fetch, i2 = [r2.Request, r2.Response, o2], a2 = i2.length, u2 = Tt; a2--; )
          t2 = i2[a2], void 0 === (n2 = u2.get(t2)) && u2.set(t2, n2 = a2 ? /* @__PURE__ */ new Map() : St(r2)), u2 = n2;
        return n2;
      };
      jt();
      var At = { http: null, xhr: dt, fetch: { get: jt } };
      Re.forEach(At, function(e2, t2) {
        if (e2) {
          try {
            Object.defineProperty(e2, "name", { value: t2 });
          } catch (e3) {
          }
          Object.defineProperty(e2, "adapterName", { value: t2 });
        }
      });
      var kt = function(e2) {
        return "- ".concat(e2);
      }, Pt = function(e2) {
        return Re.isFunction(e2) || null === e2 || false === e2;
      };
      var _t = { getAdapter: function(e2, t2) {
        for (var n2, r2, o2 = (e2 = Re.isArray(e2) ? e2 : [e2]).length, i2 = {}, a2 = 0; a2 < o2; a2++) {
          var u2 = void 0;
          if (r2 = n2 = e2[a2], !Pt(n2) && void 0 === (r2 = At[(u2 = String(n2)).toLowerCase()]))
            throw new Se("Unknown adapter '".concat(u2, "'"));
          if (r2 && (Re.isFunction(r2) || (r2 = r2.get(t2))))
            break;
          i2[u2 || "#" + a2] = r2;
        }
        if (!r2) {
          var s2 = Object.entries(i2).map(function(e3) {
            var t3 = E(e3, 2), n3 = t3[0], r3 = t3[1];
            return "adapter ".concat(n3, " ") + (false === r3 ? "is not supported by the environment" : "is not available in the build");
          }), c2 = o2 ? s2.length > 1 ? "since :\n" + s2.map(kt).join("\n") : " " + kt(s2[0]) : "as no adapter specified";
          throw new Se("There is no suitable adapter to dispatch the request " + c2, "ERR_NOT_SUPPORT");
        }
        return r2;
      }, adapters: At };
      function xt(e2) {
        if (e2.cancelToken && e2.cancelToken.throwIfRequested(), e2.signal && e2.signal.aborted)
          throw new et(null, e2);
      }
      function Nt(e2) {
        return xt(e2), e2.headers = Qe.from(e2.headers), e2.data = Ye.call(e2, e2.transformRequest), -1 !== ["post", "put", "patch"].indexOf(e2.method) && e2.headers.setContentType("application/x-www-form-urlencoded", false), _t.getAdapter(e2.adapter || We.adapter, e2)(e2).then(function(t2) {
          return xt(e2), t2.data = Ye.call(e2, e2.transformResponse, t2), t2.headers = Qe.from(t2.headers), t2;
        }, function(t2) {
          return Ze(t2) || (xt(e2), t2 && t2.response && (t2.response.data = Ye.call(e2, e2.transformResponse, t2.response), t2.response.headers = Qe.from(t2.response.headers))), Promise.reject(t2);
        });
      }
      var Ct = "1.14.0", Ut = {};
      ["object", "boolean", "number", "function", "string", "symbol"].forEach(function(e2, t2) {
        Ut[e2] = function(n2) {
          return T(n2) === e2 || "a" + (t2 < 1 ? "n " : " ") + e2;
        };
      });
      var Ft = {};
      Ut.transitional = function(e2, t2, n2) {
        function r2(e3, t3) {
          return "[Axios v" + Ct + "] Transitional option '" + e3 + "'" + t3 + (n2 ? ". " + n2 : "");
        }
        return function(n3, o2, i2) {
          if (false === e2)
            throw new Se(r2(o2, " has been removed" + (t2 ? " in " + t2 : "")), Se.ERR_DEPRECATED);
          return t2 && !Ft[o2] && (Ft[o2] = true, console.warn(r2(o2, " has been deprecated since v" + t2 + " and will be removed in the near future"))), !e2 || e2(n3, o2, i2);
        };
      }, Ut.spelling = function(e2) {
        return function(t2, n2) {
          return console.warn("".concat(n2, " is likely a misspelling of ").concat(e2)), true;
        };
      };
      var Dt = { assertOptions: function(e2, t2, n2) {
        if ("object" !== T(e2))
          throw new Se("options must be an object", Se.ERR_BAD_OPTION_VALUE);
        for (var r2 = Object.keys(e2), o2 = r2.length; o2-- > 0; ) {
          var i2 = r2[o2], a2 = t2[i2];
          if (a2) {
            var u2 = e2[i2], s2 = void 0 === u2 || a2(u2, i2, e2);
            if (true !== s2)
              throw new Se("option " + i2 + " must be " + s2, Se.ERR_BAD_OPTION_VALUE);
          } else if (true !== n2)
            throw new Se("Unknown option " + i2, Se.ERR_BAD_OPTION);
        }
      }, validators: Ut }, Bt = Dt.validators, Lt = function() {
        return l(function e3(t2) {
          c(this, e3), this.defaults = t2 || {}, this.interceptors = { request: new Fe(), response: new Fe() };
        }, [{ key: "request", value: (e2 = a(m().m(function e3(t2, n2) {
          var r2, o2, i2;
          return m().w(function(e4) {
            for (; ; )
              switch (e4.p = e4.n) {
                case 0:
                  return e4.p = 0, e4.n = 1, this._request(t2, n2);
                case 1:
                  return e4.a(2, e4.v);
                case 2:
                  if (e4.p = 2, (i2 = e4.v) instanceof Error) {
                    r2 = {}, Error.captureStackTrace ? Error.captureStackTrace(r2) : r2 = new Error(), o2 = r2.stack ? r2.stack.replace(/^.+\n/, "") : "";
                    try {
                      i2.stack ? o2 && !String(i2.stack).endsWith(o2.replace(/^.+\n.+\n/, "")) && (i2.stack += "\n" + o2) : i2.stack = o2;
                    } catch (e5) {
                    }
                  }
                  throw i2;
                case 3:
                  return e4.a(2);
              }
          }, e3, this, [[0, 2]]);
        })), function(t2, n2) {
          return e2.apply(this, arguments);
        }) }, { key: "_request", value: function(e3, t2) {
          "string" == typeof e3 ? (t2 = t2 || {}).url = e3 : t2 = e3 || {};
          var n2 = t2 = ct(this.defaults, t2), r2 = n2.transitional, o2 = n2.paramsSerializer, i2 = n2.headers;
          void 0 !== r2 && Dt.assertOptions(r2, { silentJSONParsing: Bt.transitional(Bt.boolean), forcedJSONParsing: Bt.transitional(Bt.boolean), clarifyTimeoutError: Bt.transitional(Bt.boolean), legacyInterceptorReqResOrdering: Bt.transitional(Bt.boolean) }, false), null != o2 && (Re.isFunction(o2) ? t2.paramsSerializer = { serialize: o2 } : Dt.assertOptions(o2, { encode: Bt.function, serialize: Bt.function }, true)), void 0 !== t2.allowAbsoluteUrls || (void 0 !== this.defaults.allowAbsoluteUrls ? t2.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : t2.allowAbsoluteUrls = true), Dt.assertOptions(t2, { baseUrl: Bt.spelling("baseURL"), withXsrfToken: Bt.spelling("withXSRFToken") }, true), t2.method = (t2.method || this.defaults.method || "get").toLowerCase();
          var a2 = i2 && Re.merge(i2.common, i2[t2.method]);
          i2 && Re.forEach(["delete", "get", "head", "post", "put", "patch", "common"], function(e4) {
            delete i2[e4];
          }), t2.headers = Qe.concat(a2, i2);
          var u2 = [], s2 = true;
          this.interceptors.request.forEach(function(e4) {
            if ("function" != typeof e4.runWhen || false !== e4.runWhen(t2)) {
              s2 = s2 && e4.synchronous;
              var n3 = t2.transitional || De;
              n3 && n3.legacyInterceptorReqResOrdering ? u2.unshift(e4.fulfilled, e4.rejected) : u2.push(e4.fulfilled, e4.rejected);
            }
          });
          var c2, f2 = [];
          this.interceptors.response.forEach(function(e4) {
            f2.push(e4.fulfilled, e4.rejected);
          });
          var l2, d2 = 0;
          if (!s2) {
            var p2 = [Nt.bind(this), void 0];
            for (p2.unshift.apply(p2, u2), p2.push.apply(p2, f2), l2 = p2.length, c2 = Promise.resolve(t2); d2 < l2; )
              c2 = c2.then(p2[d2++], p2[d2++]);
            return c2;
          }
          l2 = u2.length;
          for (var h2 = t2; d2 < l2; ) {
            var y2 = u2[d2++], v2 = u2[d2++];
            try {
              h2 = y2(h2);
            } catch (e4) {
              v2.call(this, e4);
              break;
            }
          }
          try {
            c2 = Nt.call(this, h2);
          } catch (e4) {
            return Promise.reject(e4);
          }
          for (d2 = 0, l2 = f2.length; d2 < l2; )
            c2 = c2.then(f2[d2++], f2[d2++]);
          return c2;
        } }, { key: "getUri", value: function(e3) {
          return Ue(ut((e3 = ct(this.defaults, e3)).baseURL, e3.url, e3.allowAbsoluteUrls), e3.params, e3.paramsSerializer);
        } }]);
        var e2;
      }();
      Re.forEach(["delete", "get", "head", "options"], function(e2) {
        Lt.prototype[e2] = function(t2, n2) {
          return this.request(ct(n2 || {}, { method: e2, url: t2, data: (n2 || {}).data }));
        };
      }), Re.forEach(["post", "put", "patch"], function(e2) {
        function t2(t3) {
          return function(n2, r2, o2) {
            return this.request(ct(o2 || {}, { method: e2, headers: t3 ? { "Content-Type": "multipart/form-data" } : {}, url: n2, data: r2 }));
          };
        }
        Lt.prototype[e2] = t2(), Lt.prototype[e2 + "Form"] = t2(true);
      });
      var It = function() {
        function e2(t2) {
          if (c(this, e2), "function" != typeof t2)
            throw new TypeError("executor must be a function.");
          var n2;
          this.promise = new Promise(function(e3) {
            n2 = e3;
          });
          var r2 = this;
          this.promise.then(function(e3) {
            if (r2._listeners) {
              for (var t3 = r2._listeners.length; t3-- > 0; )
                r2._listeners[t3](e3);
              r2._listeners = null;
            }
          }), this.promise.then = function(e3) {
            var t3, n3 = new Promise(function(e4) {
              r2.subscribe(e4), t3 = e4;
            }).then(e3);
            return n3.cancel = function() {
              r2.unsubscribe(t3);
            }, n3;
          }, t2(function(e3, t3, o2) {
            r2.reason || (r2.reason = new et(e3, t3, o2), n2(r2.reason));
          });
        }
        return l(e2, [{ key: "throwIfRequested", value: function() {
          if (this.reason)
            throw this.reason;
        } }, { key: "subscribe", value: function(e3) {
          this.reason ? e3(this.reason) : this._listeners ? this._listeners.push(e3) : this._listeners = [e3];
        } }, { key: "unsubscribe", value: function(e3) {
          if (this._listeners) {
            var t2 = this._listeners.indexOf(e3);
            -1 !== t2 && this._listeners.splice(t2, 1);
          }
        } }, { key: "toAbortSignal", value: function() {
          var e3 = this, t2 = new AbortController(), n2 = function(e4) {
            t2.abort(e4);
          };
          return this.subscribe(n2), t2.signal.unsubscribe = function() {
            return e3.unsubscribe(n2);
          }, t2.signal;
        } }], [{ key: "source", value: function() {
          var t2;
          return { token: new e2(function(e3) {
            t2 = e3;
          }), cancel: t2 };
        } }]);
      }();
      var qt = { Continue: 100, SwitchingProtocols: 101, Processing: 102, EarlyHints: 103, Ok: 200, Created: 201, Accepted: 202, NonAuthoritativeInformation: 203, NoContent: 204, ResetContent: 205, PartialContent: 206, MultiStatus: 207, AlreadyReported: 208, ImUsed: 226, MultipleChoices: 300, MovedPermanently: 301, Found: 302, SeeOther: 303, NotModified: 304, UseProxy: 305, Unused: 306, TemporaryRedirect: 307, PermanentRedirect: 308, BadRequest: 400, Unauthorized: 401, PaymentRequired: 402, Forbidden: 403, NotFound: 404, MethodNotAllowed: 405, NotAcceptable: 406, ProxyAuthenticationRequired: 407, RequestTimeout: 408, Conflict: 409, Gone: 410, LengthRequired: 411, PreconditionFailed: 412, PayloadTooLarge: 413, UriTooLong: 414, UnsupportedMediaType: 415, RangeNotSatisfiable: 416, ExpectationFailed: 417, ImATeapot: 418, MisdirectedRequest: 421, UnprocessableEntity: 422, Locked: 423, FailedDependency: 424, TooEarly: 425, UpgradeRequired: 426, PreconditionRequired: 428, TooManyRequests: 429, RequestHeaderFieldsTooLarge: 431, UnavailableForLegalReasons: 451, InternalServerError: 500, NotImplemented: 501, BadGateway: 502, ServiceUnavailable: 503, GatewayTimeout: 504, HttpVersionNotSupported: 505, VariantAlsoNegotiates: 506, InsufficientStorage: 507, LoopDetected: 508, NotExtended: 510, NetworkAuthenticationRequired: 511, WebServerIsDown: 521, ConnectionTimedOut: 522, OriginIsUnreachable: 523, TimeoutOccurred: 524, SslHandshakeFailed: 525, InvalidSslCertificate: 526 };
      Object.entries(qt).forEach(function(e2) {
        var t2 = E(e2, 2), n2 = t2[0], r2 = t2[1];
        qt[r2] = n2;
      });
      var Mt = function e2(t2) {
        var n2 = new Lt(t2), r2 = _(Lt.prototype.request, n2);
        return Re.extend(r2, Lt.prototype, n2, { allOwnKeys: true }), Re.extend(r2, n2, null, { allOwnKeys: true }), r2.create = function(n3) {
          return e2(ct(t2, n3));
        }, r2;
      }(We);
      return Mt.Axios = Lt, Mt.CanceledError = et, Mt.CancelToken = It, Mt.isCancel = Ze, Mt.VERSION = Ct, Mt.toFormData = Pe, Mt.AxiosError = Se, Mt.Cancel = Mt.CanceledError, Mt.all = function(e2) {
        return Promise.all(e2);
      }, Mt.spread = function(e2) {
        return function(t2) {
          return e2.apply(null, t2);
        };
      }, Mt.isAxiosError = function(e2) {
        return Re.isObject(e2) && true === e2.isAxiosError;
      }, Mt.mergeConfig = ct, Mt.AxiosHeaders = Qe, Mt.formToJSON = function(e2) {
        return Je(Re.isHTMLForm(e2) ? new FormData(e2) : e2);
      }, Mt.getAdapter = _t.getAdapter, Mt.HttpStatusCode = qt, Mt.default = Mt, Mt;
    });
  }
});

// src/utils/tmdb.js
var require_tmdb = __commonJS({
  "src/utils/tmdb.js"(exports2, module2) {
    var axios2 = (init_axios_min(), __toCommonJS(axios_min_exports));
    var TMDB_API_KEY2 = "439c478a771f35c05022f9feabcca01c";
    var titleCache = /* @__PURE__ */ new Map();
    function getTmdbTitle2(tmdbId, mediaType, retries = 2) {
      return __async(this, null, function* () {
        if (!tmdbId)
          return null;
        const cleanId = tmdbId.toString().split(":")[0];
        const cacheKey = `${cleanId}_${mediaType}`;
        if (titleCache.has(cacheKey))
          return titleCache.get(cacheKey);
        try {
          const type = mediaType === "movie" || mediaType === "movies" ? "movie" : "tv";
          let url;
          if (cleanId.startsWith("tt")) {
            url = `https://api.themoviedb.org/3/find/${cleanId}?api_key=${TMDB_API_KEY2}&external_source=imdb_id`;
            const { data } = yield axios2.get(url, { timeout: 6e3 });
            const result = type === "movie" ? data.movie_results && data.movie_results[0] : data.tv_results && data.tv_results[0] || data.movie_results && data.movie_results[0];
            const title = result ? result.name || result.title : null;
            if (title)
              titleCache.set(cacheKey, title);
            return title;
          } else {
            url = `https://api.themoviedb.org/3/${type}/${cleanId}?api_key=${TMDB_API_KEY2}`;
            const { data } = yield axios2.get(url, { timeout: 6e3 });
            const title = data.name || data.title || null;
            if (title)
              titleCache.set(cacheKey, title);
            return title;
          }
        } catch (e) {
          if (retries > 0) {
            console.log(`[TMDB-Rescue] Retrying ${tmdbId} (${retries} left)...`);
            yield new Promise((r) => setTimeout(r, 1e3));
            return getTmdbTitle2(tmdbId, mediaType, retries - 1);
          }
          console.log(`[TMDB-Rescue] Failed to fetch title for ${tmdbId}: ${e.message}`);
          return null;
        }
      });
    }
    function getTmdbInfo(tmdbId, mediaType) {
      return __async(this, null, function* () {
        if (!tmdbId)
          return null;
        const cleanId = tmdbId.toString().split(":")[0];
        const type = mediaType === "movie" || mediaType === "movies" ? "movie" : "tv";
        try {
          let url;
          let result;
          if (cleanId.startsWith("tt")) {
            url = `https://api.themoviedb.org/3/find/${cleanId}?api_key=${TMDB_API_KEY2}&external_source=imdb_id`;
            const { data } = yield axios2.get(url, { timeout: 6e3 });
            result = type === "movie" ? data.movie_results && data.movie_results[0] : data.tv_results && data.tv_results[0] || data.movie_results && data.movie_results[0];
          } else {
            url = `https://api.themoviedb.org/3/${type}/${cleanId}?api_key=${TMDB_API_KEY2}`;
            const { data } = yield axios2.get(url, { timeout: 6e3 });
            result = data;
          }
          if (result) {
            const title = result.name || result.title;
            const date = result.release_date || result.first_air_date || "";
            const year = date.split("-")[0];
            return { title, year };
          }
          return null;
        } catch (e) {
          return null;
        }
      });
    }
    module2.exports = { getTmdbTitle: getTmdbTitle2, getTmdbInfo };
  }
});

// src/utils/ua.js
var require_ua = __commonJS({
  "src/utils/ua.js"(exports2, module2) {
    var UA_POOL = [
      // Windows - Chrome 146 (Custom modern fingerprint)
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"
    ];
    function getRandomUA2() {
      const index = Math.floor(Math.random() * UA_POOL.length);
      return UA_POOL[index];
    }
    module2.exports = { getRandomUA: getRandomUA2, UA_POOL };
  }
});

// src/utils/http.js
var require_http = __commonJS({
  "src/utils/http.js"(exports2, module2) {
    var axios2 = (init_axios_min(), __toCommonJS(axios_min_exports));
    var { getRandomUA: getRandomUA2 } = require_ua();
    var DEFAULT_CHROME_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36";
    var sessionUA = null;
    function setSessionUA2(ua) {
      sessionUA = ua;
    }
    function getSessionUA2() {
      return sessionUA || DEFAULT_CHROME_UA;
    }
    function getStealthHeaders() {
      return {
        "User-Agent": getSessionUA2(),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "es-US,es;q=0.9,en-US;q=0.8,en;q=0.7,es-419;q=0.6",
        "sec-ch-ua": '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1"
      };
    }
    var DEFAULT_UA = getSessionUA2();
    var MOBILE_UA = getSessionUA2();
    function request(url, options) {
      return __async(this, null, function* () {
        var opt = options || {};
        var currentUA = opt.headers && opt.headers["User-Agent"] ? opt.headers["User-Agent"] : getSessionUA2();
        var headers = Object.assign({
          "User-Agent": currentUA,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "es-MX,es;q=0.9,en;q=0.8"
        }, opt.headers);
        try {
          var timeoutMs = opt.timeout || 5e3;
          var controller = new AbortController();
          var timeoutId = setTimeout(() => {
            controller.abort();
          }, timeoutMs);
          var fetchOptions = Object.assign({
            redirect: opt.redirect || "follow"
          }, opt, {
            headers,
            signal: controller.signal
          });
          var response = yield fetch(url, fetchOptions);
          clearTimeout(timeoutId);
          if (opt.redirect === "manual" && (response.status === 301 || response.status === 302)) {
            const redirectUrl = response.headers.get("location");
            console.log(`[HTTP] Redirecci\xF3n detectada (Manual): ${redirectUrl}`);
            return { status: response.status, redirectUrl, ok: false };
          }
          if (!response.ok && !opt.ignoreErrors) {
            console.warn("[HTTP] Error " + response.status + " en " + url);
          }
          return response;
        } catch (error) {
          console.error("[HTTP] Error en " + url + ": " + error.message);
          throw error;
        }
      });
    }
    function fetchHtml(url, options) {
      return __async(this, null, function* () {
        var res = yield request(url, options);
        return yield res.text();
      });
    }
    function fetchJson(url, options) {
      return __async(this, null, function* () {
        var res = yield request(url, options);
        return yield res.json();
      });
    }
    module2.exports = {
      request,
      fetchHtml,
      fetchJson,
      getSessionUA: getSessionUA2,
      setSessionUA: setSessionUA2,
      getStealthHeaders,
      DEFAULT_UA,
      MOBILE_UA
    };
  }
});

// src/utils/m3u8.js
var require_m3u8 = __commonJS({
  "src/utils/m3u8.js"(exports2, module2) {
    var axios2 = (init_axios_min(), __toCommonJS(axios_min_exports));
    var { getSessionUA: getSessionUA2 } = require_http();
    var UA = getSessionUA2();
    function getQualityFromHeight(height) {
      if (!height)
        return "1080p";
      const h = parseInt(height);
      if (h >= 2160)
        return "4K";
      if (h >= 1440)
        return "1440p";
      if (h >= 1080)
        return "1080p";
      if (h >= 720)
        return "720p";
      if (h >= 480)
        return "480p";
      if (h >= 360)
        return "360p";
      return "1080p";
    }
    function parseBestQuality(content, url = "") {
      if (content) {
        const lines = content.split("\n");
        let bestHeight = 0;
        for (const line of lines) {
          if (line.includes("RESOLUTION=")) {
            const match = line.match(/RESOLUTION=\d+x(\d+)/i);
            if (match) {
              const height = parseInt(match[1]);
              if (height > bestHeight)
                bestHeight = height;
            }
          }
        }
        if (bestHeight > 0)
          return getQualityFromHeight(bestHeight);
      }
      const qMatch = url.match(/[_-](\d{3,4})[pP]?/);
      if (qMatch) {
        const h = parseInt(qMatch[1]);
        if (h >= 360 && h <= 4320)
          return getQualityFromHeight(h);
      }
      return "1080p";
    }
    var VALIDATION_CACHE = /* @__PURE__ */ new Map();
    function validateStream(stream) {
      return __async(this, null, function* () {
        if (!stream || !stream.url)
          return stream;
        const { url, headers } = stream;
        if (VALIDATION_CACHE.has(url)) {
          console.log(`[m3u8] Sirviendo desde cach\xE9: ${url.substring(0, 40)}...`);
          return __spreadValues(__spreadValues({}, stream), VALIDATION_CACHE.get(url));
        }
        try {
          try {
            yield axios2.head(url, {
              timeout: 1e3,
              headers: __spreadValues({ "User-Agent": getSessionUA2() }, headers || {})
            });
          } catch (e) {
            if (e.response && (e.response.status === 404 || e.response.status === 403)) {
              return __spreadProps(__spreadValues({}, stream), { verified: false });
            }
          }
          const response = yield axios2.get(url, {
            timeout: 3e3,
            skipSizeCheck: true,
            // REGLA CRÍTICA NUVIO: Ignorar detector de OOM para validación
            headers: __spreadValues({
              "User-Agent": getSessionUA2(),
              "Range": "bytes=0-4096"
            }, headers || {}),
            responseType: "text"
          });
          const text = response.data;
          let resultData = { verified: true };
          if (text && (url.includes(".m3u8") || text.includes("#EXTM3U"))) {
            const realQuality = parseBestQuality(text, url);
            resultData.quality = realQuality;
          }
          VALIDATION_CACHE.set(url, resultData);
          return __spreadValues(__spreadValues({}, stream), resultData);
        } catch (error) {
          const fallbackQuality = parseBestQuality("", url);
          const resultData = { quality: fallbackQuality, verified: true };
          VALIDATION_CACHE.set(url, resultData);
          return __spreadValues(__spreadValues({}, stream), resultData);
        }
      });
    }
    module2.exports = { validateStream, getQualityFromHeight };
  }
});

// src/utils/sorting.js
var sorting_exports = {};
__export(sorting_exports, {
  sortStreamsByQuality: () => sortStreamsByQuality
});
function sortStreamsByQuality(streams) {
  if (!Array.isArray(streams))
    return [];
  return [...streams].sort((a, b) => {
    const scoreA = QUALITY_SCORE[a.quality] || 0;
    const scoreB = QUALITY_SCORE[b.quality] || 0;
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    const serverA = (a.serverLabel || "").split(" ")[0];
    const serverB = (b.serverLabel || "").split(" ")[0];
    const speedA = SERVER_SCORE[serverA] || 0;
    const speedB = SERVER_SCORE[serverB] || 0;
    if (speedA !== speedB) {
      return speedB - speedA;
    }
    if (a.verified && !b.verified)
      return -1;
    if (!a.verified && b.verified)
      return 1;
    return 0;
  });
}
var QUALITY_SCORE, SERVER_SCORE;
var init_sorting = __esm({
  "src/utils/sorting.js"() {
    QUALITY_SCORE = {
      "4K": 100,
      "1440p": 90,
      "1080p": 80,
      "720p": 70,
      "480p": 60,
      "360p": 50,
      "240p": 40,
      "Auto": 30,
      "Unknown": 0
    };
    SERVER_SCORE = {
      "VOE": 10,
      "Filemoon": 10,
      "Tplayer": 10,
      "Vimeos": 10,
      "Netu": 5,
      "GoodStream": 10,
      "StreamWish": -5,
      "VidHide": -5
    };
  }
});

// src/utils/mirrors.js
var require_mirrors = __commonJS({
  "src/utils/mirrors.js"(exports2, module2) {
    var MIRRORS = {
      VIDHIDE: [
        "vidhide",
        "minochinos",
        "vadisov",
        "vaiditv",
        "amusemre",
        "callistanise",
        "vhaudm",
        "mdfury",
        "dintezuvio",
        "acek-cdn",
        "vedonm",
        "vidhidepro",
        "vidhidevip"
      ],
      STREAMWISH: [
        "hlswish",
        "streamwish",
        "hglink",
        "hglamioz",
        "hglink.to",
        "audinifer",
        "embedwish",
        "awish",
        "dwish",
        "strwish",
        "filelions",
        "wishembed",
        "wishfast"
      ],
      FILEMOON: [
        "filemoon",
        "moonalu",
        "moonembed",
        "bysedikamoum",
        "r66nv9ed",
        "398fitus",
        "filemoon.sx",
        "filemoon.to"
      ],
      VOE: [
        "voe.sx",
        "voe-sx",
        "voex.sx",
        "marissashare",
        "cloudwindow"
      ],
      FASTREAM: [
        "fastream",
        "fastplay",
        "fembed"
      ],
      OKRU: [
        "ok.ru",
        "okru"
      ],
      PIXELDRAIN: [
        "pixeldrain"
      ],
      BUZZHEAVIER: [
        "buzzheavier",
        "bzh.sh"
      ],
      GOODSTREAM: [
        "goodstream",
        "gs.one"
      ]
    };
    function isMirror2(url, groupName) {
      if (!url || !MIRRORS[groupName])
        return false;
      const s = url.toLowerCase();
      return MIRRORS[groupName].some((m) => s.includes(m));
    }
    module2.exports = { MIRRORS, isMirror: isMirror2 };
  }
});

// src/utils/engine.js
var require_engine = __commonJS({
  "src/utils/engine.js"(exports2, module2) {
    var { validateStream } = require_m3u8();
    var { sortStreamsByQuality: sortStreamsByQuality2 } = (init_sorting(), __toCommonJS(sorting_exports));
    var { isMirror: isMirror2 } = require_mirrors();
    function normalizeLanguage(lang) {
      const l = (lang || "").toLowerCase();
      if (l.includes("lat") || l.includes("mex") || l.includes("col") || l.includes("arg") || l.includes("chi") || l.includes("per") || l.includes("dub") || l.includes("dual")) {
        return "Latino";
      }
      if (l.includes("esp") || l.includes("cas") || l.includes("spa") || l.includes("cast")) {
        return "Espa\xF1ol";
      }
      if (l.includes("sub") || l.includes("vose") || l.includes("eng")) {
        return "Subtitulado";
      }
      return lang || "Latino";
    }
    function normalizeServer(server, url = "", resolvedServerName = null) {
      if (resolvedServerName)
        return resolvedServerName;
      const u = (url || "").toLowerCase();
      const s = (server || "").toLowerCase();
      if (isMirror2(u, "VIDHIDE") || isMirror2(s, "VIDHIDE"))
        return "VidHide";
      if (isMirror2(u, "STREAMWISH") || isMirror2(s, "STREAMWISH"))
        return "StreamWish";
      if (isMirror2(u, "VOE") || isMirror2(s, "VOE"))
        return "VOE";
      if (isMirror2(u, "FILEMOON") || isMirror2(s, "FILEMOON"))
        return "Filemoon";
      if (url) {
        try {
          const domain = new URL(url).hostname.replace("www.", "");
          return domain.charAt(0).toUpperCase() + domain.slice(1);
        } catch (e) {
        }
      }
      return server || "Servidor";
    }
    function finalizeStreams2(streams, providerName, mediaTitle) {
      return __async(this, null, function* () {
        if (!Array.isArray(streams) || streams.length === 0)
          return [];
        console.log(`[Engine] MODO TOTAL v5.6.95 - Sin filtros. Mostrando todo...`);
        const sorted = sortStreamsByQuality2(streams);
        const processed = [];
        const seenTitles = /* @__PURE__ */ new Set();
        for (const s of sorted) {
          const lang = normalizeLanguage(s.langLabel || s.language || s.Audio || s.audio);
          const isLatino = lang.toLowerCase().includes("lat") || lang.toLowerCase().includes("mex");
          if (!isLatino)
            continue;
          const server = normalizeServer(s.serverLabel || s.serverName || s.servername, s.url, s.serverName);
          let displayQuality = s.quality || "HD";
          let checkMark = "";
          if (s.verified) {
            checkMark = " \u2705";
          }
          const fullTitle = `${displayQuality}${checkMark} - ${lang} - ${server}`;
          if (seenTitles.has(fullTitle))
            continue;
          seenTitles.add(fullTitle);
          processed.push({
            name: providerName || "Plugin Latino",
            title: fullTitle,
            url: s.url,
            quality: displayQuality,
            serverName: server,
            lang,
            headers: s.headers || {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            }
          });
        }
        return processed;
      });
    }
    module2.exports = { finalizeStreams: finalizeStreams2 };
  }
});

// src/sololatino/index.js
var axios = (init_axios_min(), __toCommonJS(axios_min_exports));
var { getTmdbTitle } = require_tmdb();
var { finalizeStreams } = require_engine();
var { getSessionUA, setSessionUA } = require_http();
var { getRandomUA } = require_ua();
var { isMirror } = require_mirrors();
var BASE_URL = "https://player.pelisserieshoy.com";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var RESULT_CACHE = /* @__PURE__ */ new Map();
var CACHE_TTL = 5 * 60 * 1e3;
function getImdbIdInternal(idOrQuery, mediaType) {
  return __async(this, null, function* () {
    const rawId = idOrQuery.toString().split(":")[0];
    if (rawId.startsWith("tt"))
      return rawId;
    try {
      const type = mediaType === "movie" || mediaType === "movies" ? "movie" : "tv";
      const url = `https://api.themoviedb.org/3/${type}/${rawId}/external_ids?api_key=${TMDB_API_KEY}`;
      const { data } = yield axios.get(url, { timeout: 5e3 });
      return data.imdb_id || null;
    } catch (e) {
      return null;
    }
  });
}
function getDirectStream(id, token, cookie, playerUrl, sessionHeaders) {
  return __async(this, null, function* () {
    try {
      const body = new URLSearchParams({ a: "2", tok: token, v: id }).toString();
      const config = {
        timeout: 8e3,
        headers: __spreadProps(__spreadValues({}, sessionHeaders), {
          "Referer": playerUrl,
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        })
      };
      if (cookie)
        config.headers["cookie"] = cookie;
      const { data } = yield axios.post(`${BASE_URL}/s.php`, body, config);
      return data && data.u ? { url: data.u, sig: data.sig } : null;
    } catch (e) {
      return null;
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    if (!tmdbId)
      return [];
    const parts = tmdbId.toString().split(":");
    const realId = parts[0];
    const s = parseInt(parts[1] || season || 1);
    const e = parseInt(parts[2] || episode || 1);
    const isMovie = mediaType === "movie" || mediaType === "movies";
    const cacheKey = isMovie ? realId : `${realId}-${s}-${e}`;
    const now = Date.now();
    if (RESULT_CACHE.has(cacheKey)) {
      const cached = RESULT_CACHE.get(cacheKey);
      if (now - cached.time < CACHE_TTL) {
        console.log(`[SoloLatino] STEALTH: Servido desde cach\xE9 inteligente: ${cacheKey}`);
        return cached.data;
      }
    }
    const UA = getRandomUA();
    setSessionUA(UA);
    const SESSION_HEADERS = {
      "User-Agent": UA,
      "Accept": "*/*",
      "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
      "X-Requested-With": "XMLHttpRequest",
      "Referer": "https://sololatino.net/"
    };
    let mediaTitle = title;
    if (!mediaTitle && tmdbId) {
      mediaTitle = yield getTmdbTitle(tmdbId, mediaType);
    }
    const imdbId = yield getImdbIdInternal(realId, mediaType);
    if (!imdbId)
      return [];
    const epStr = e < 10 ? `0${e}` : e;
    const slug = isMovie ? imdbId : `${imdbId}-${s}x${epStr}`;
    const playerUrl = `${BASE_URL}/f/${slug}`;
    try {
      console.log(`[SoloLatino] STEALTH v6.8.0 - Navegaci\xF3n de Sigilo Iniciada: ${slug}`);
      const { data: html, headers: respHeaders } = yield axios.get(playerUrl, { headers: SESSION_HEADERS, timeout: 6e3 });
      yield sleep(1e3);
      const cookie = (respHeaders["set-cookie"] || []).map((c) => c.split(";")[0]).join("; ");
      const tokenMatch = html.match(/(?:let\s+token|const\s+_t)\s*=\s*'([^']+)'/);
      if (tokenMatch && tokenMatch[1]) {
        const token = tokenMatch[1];
        const postH = __spreadProps(__spreadValues({}, SESSION_HEADERS), {
          "Referer": playerUrl,
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        });
        if (cookie)
          postH["cookie"] = cookie;
        yield axios.post(`${BASE_URL}/s.php`, "a=click&tok=" + token, { headers: postH });
        yield sleep(1500);
        const { data: scanData } = yield axios.post(`${BASE_URL}/s.php`, "a=1&tok=" + token, { headers: postH });
        const uniqueServers = /* @__PURE__ */ new Map();
        (scanData && scanData.s || []).forEach((ser) => {
          if (ser[1])
            uniqueServers.set(ser[1], ser);
        });
        if (scanData && scanData.langs_s) {
          Object.keys(scanData.langs_s).forEach((k) => {
            (scanData.langs_s[k] || []).forEach((ser) => {
              if (ser[1])
                uniqueServers.set(ser[1], ser);
            });
          });
        }
        const serverList = Array.from(uniqueServers.values()).slice(0, 6);
        const resolved = [];
        for (const ser of serverList) {
          const [name, id] = Array.isArray(ser) ? ser : [ser[0], ser[1]];
          try {
            console.log(`[SoloLatino] Resolviendo servidor: ${name}...`);
            const direct = yield getDirectStream(id, token, cookie, playerUrl, SESSION_HEADERS);
            if (direct && direct.url) {
              let finalUrl = direct.url;
              if (direct.sig)
                finalUrl = `${BASE_URL}/p.php?url=${encodeURIComponent(direct.url)}&sig=${direct.sig}`;
              let techName = "";
              if (isMirror(direct.url, "VIDHIDE"))
                techName = "VidHide";
              else if (isMirror(direct.url, "FILEMOON"))
                techName = "Filemoon";
              else if (isMirror(direct.url, "STREAMWISH"))
                techName = "StreamWish";
              else if (isMirror(direct.url, "VOE"))
                techName = "VOE";
              const fullName = techName ? `${name} - ${techName}` : name;
              resolved.push({
                langLabel: "Latino",
                serverName: fullName,
                url: finalUrl,
                quality: "1080p",
                headers: { "User-Agent": UA, "Referer": playerUrl, "Origin": BASE_URL }
              });
              console.log(`[SoloLatino] Esperando 3.5s antes del siguiente servidor...`);
              yield sleep(3500);
            }
          } catch (e2) {
            console.log(`[SoloLatino] Error resolviendo servidor, saltando...`);
          }
        }
        const final = yield finalizeStreams(resolved, "SoloLatino", mediaTitle);
        if (final.length > 0) {
          RESULT_CACHE.set(cacheKey, { time: now, data: final });
        }
        return final;
      }
    } catch (e2) {
      console.log(`[SoloLatino] Error en Stealth: ${e2.message}`);
    }
    return [];
  });
}
module.exports = { getStreams };
/*! Bundled license information:

axios/dist/axios.min.js:
  (*! Axios v1.14.0 Copyright (c) 2026 Matt Zabriskie and contributors *)
  (*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE *)
*/
