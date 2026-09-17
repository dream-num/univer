import {
  UniverSheetsFindReplacePlugin
} from "../chunk-A6JH6MFK.js";
import {
  UniverSheetsThreadCommentUIPlugin
} from "../chunk-RS7WUHOJ.js";
import {
  UniverSheetsNoteUIPlugin,
  UniverSheetsTableUIPlugin
} from "../chunk-IMLGZZ4M.js";
import {
  UniverSheetsSortUIPlugin
} from "../chunk-HI54EUIE.js";
import {
  UniverThreadCommentUIPlugin
} from "../chunk-3WOCRIC2.js";
import {
  UniverVue3AdapterPlugin,
  UniverWebComponentAdapterPlugin
} from "../chunk-LLR6EPNA.js";
import {
  UniverNetworkPlugin
} from "../chunk-BMS77Y3S.js";
import "../chunk-POBEMVCS.js";
import {
  UniverSheetsThreadCommentPlugin
} from "../chunk-NJGSTZSU.js";
import {
  UniverSheetsCrosshairHighlightPlugin
} from "../chunk-PRZ2MIYX.js";
import {
  UniverSheetsNotePlugin,
  UniverSheetsTablePlugin
} from "../chunk-SPJ3J4VO.js";
import {
  UniverSheetsZenEditorPlugin
} from "../chunk-WVHVGHAD.js";
import {
  UniverSheetsHyperLinkPlugin,
  UniverSheetsHyperLinkUIPlugin
} from "../chunk-BBGQPEWJ.js";
import {
  UniverSheetsSortPlugin
} from "../chunk-7OGYBNIL.js";
import {
  UniverThreadCommentPlugin
} from "../chunk-CER5CEC6.js";
import {
  UniverWatermarkPlugin
} from "../chunk-FRWZDCQD.js";
import {
  UniverSheetsDrawingPlugin,
  UniverSheetsDrawingUIPlugin
} from "../chunk-FXH7NPJ2.js";
import {
  FUniver
} from "../chunk-2WA7JL2E.js";
import {
  UniverSheetsConditionalFormattingUIPlugin,
  UniverSheetsDataValidationUIPlugin,
  UniverSheetsFilterUIPlugin
} from "../chunk-QZPOCNAB.js";
import {
  UniverSheetsConditionalFormattingPlugin
} from "../chunk-VEA4DFFB.js";
import {
  UniverSheetsFilterPlugin
} from "../chunk-ESCGSVMK.js";
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
  UniverDocsUIPlugin,
  UniverSheetsDataValidationPlugin
} from "../chunk-7ZOWWEOA.js";
import "../chunk-LI6UXASZ.js";
import {
  UniverUIPlugin,
  render,
  require_jsx_runtime,
  require_react
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
  Univer
} from "../chunk-EJSPXROI.js";
import "../chunk-EQ2B2W73.js";
import {
  __decorateClass,
  __toESM
} from "../chunk-24OICD5T.js";

// ../node_modules/.pnpm/@lit+react@1.0.8_@types+react@19.2.15/node_modules/@lit/react/create-component.js
var e = /* @__PURE__ */ new Set(["children", "localName", "ref", "style", "className"]);
var n = /* @__PURE__ */ new WeakMap();
var t = (e6, t5, o6, l3, a3) => {
  const s4 = a3 == null ? void 0 : a3[t5];
  void 0 === s4 ? (e6[t5] = o6, null == o6 && t5 in HTMLElement.prototype && e6.removeAttribute(t5)) : o6 !== l3 && ((e7, t6, o7) => {
    let l4 = n.get(e7);
    void 0 === l4 && n.set(e7, l4 = /* @__PURE__ */ new Map());
    let a4 = l4.get(t6);
    void 0 !== o7 ? void 0 === a4 ? (l4.set(t6, a4 = { handleEvent: o7 }), e7.addEventListener(t6, a4)) : a4.handleEvent = o7 : void 0 !== a4 && (l4.delete(t6), e7.removeEventListener(t6, a4));
  })(e6, s4, o6);
};
var o = ({ react: n6, tagName: o6, elementClass: l3, events: a3, displayName: s4 }) => {
  const c4 = new Set(Object.keys(a3 != null ? a3 : {})), r4 = n6.forwardRef(((s5, r5) => {
    const i5 = n6.useRef(/* @__PURE__ */ new Map()), d3 = n6.useRef(null), f3 = {}, u3 = {};
    for (const [n7, t5] of Object.entries(s5)) e.has(n7) ? f3["className" === n7 ? "class" : n7] = t5 : c4.has(n7) || n7 in l3.prototype ? u3[n7] = t5 : f3[n7] = t5;
    return n6.useLayoutEffect((() => {
      if (null === d3.current) return;
      const e6 = /* @__PURE__ */ new Map();
      for (const n7 in u3) t(d3.current, n7, s5[n7], i5.current.get(n7), a3), i5.current.delete(n7), e6.set(n7, s5[n7]);
      for (const [e7, n7] of i5.current) t(d3.current, e7, void 0, n7, a3);
      i5.current = e6;
    })), n6.useLayoutEffect((() => {
      var _a6;
      (_a6 = d3.current) == null ? void 0 : _a6.removeAttribute("defer-hydration");
    }), []), f3.suppressHydrationWarning = true, n6.createElement(o6, { ...f3, ref: n6.useCallback(((e6) => {
      d3.current = e6, "function" == typeof r5 ? r5(e6) : null !== r5 && (r5.current = e6);
    }), [r5]) });
  }));
  return r4.displayName = s4 != null ? s4 : l3.name, r4;
};

// ../node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/css-tag.js
var t2 = globalThis;
var e2 = t2.ShadowRoot && (void 0 === t2.ShadyCSS || t2.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = /* @__PURE__ */ Symbol();
var o2 = /* @__PURE__ */ new WeakMap();
var n2 = class {
  constructor(t5, e6, o6) {
    if (this._$cssResult$ = true, o6 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t5, this.t = e6;
  }
  get styleSheet() {
    let t5 = this.o;
    const s4 = this.t;
    if (e2 && void 0 === t5) {
      const e6 = void 0 !== s4 && 1 === s4.length;
      e6 && (t5 = o2.get(s4)), void 0 === t5 && ((this.o = t5 = new CSSStyleSheet()).replaceSync(this.cssText), e6 && o2.set(s4, t5));
    }
    return t5;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t5) => new n2("string" == typeof t5 ? t5 : t5 + "", void 0, s);
var S = (s4, o6) => {
  if (e2) s4.adoptedStyleSheets = o6.map((t5) => t5 instanceof CSSStyleSheet ? t5 : t5.styleSheet);
  else for (const e6 of o6) {
    const o7 = document.createElement("style"), n6 = t2.litNonce;
    void 0 !== n6 && o7.setAttribute("nonce", n6), o7.textContent = e6.cssText, s4.appendChild(o7);
  }
};
var c = e2 ? (t5) => t5 : (t5) => t5 instanceof CSSStyleSheet ? ((t6) => {
  let e6 = "";
  for (const s4 of t6.cssRules) e6 += s4.cssText;
  return r(e6);
})(t5) : t5;

// ../node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e3, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o3, getPrototypeOf: n3 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t5, s4) => t5;
var u = { toAttribute(t5, s4) {
  switch (s4) {
    case Boolean:
      t5 = t5 ? l : null;
      break;
    case Object:
    case Array:
      t5 = null == t5 ? t5 : JSON.stringify(t5);
  }
  return t5;
}, fromAttribute(t5, s4) {
  let i5 = t5;
  switch (s4) {
    case Boolean:
      i5 = null !== t5;
      break;
    case Number:
      i5 = null === t5 ? null : Number(t5);
      break;
    case Object:
    case Array:
      try {
        i5 = JSON.parse(t5);
      } catch (t6) {
        i5 = null;
      }
  }
  return i5;
} };
var f = (t5, s4) => !i2(t5, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
var _a, _b;
(_a = Symbol.metadata) != null ? _a : Symbol.metadata = /* @__PURE__ */ Symbol("metadata"), (_b = a.litPropertyMetadata) != null ? _b : a.litPropertyMetadata = /* @__PURE__ */ new WeakMap();
var y = class extends HTMLElement {
  static addInitializer(t5) {
    var _a6;
    this._$Ei(), ((_a6 = this.l) != null ? _a6 : this.l = []).push(t5);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t5, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t5) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t5, s4), !s4.noAccessor) {
      const i5 = /* @__PURE__ */ Symbol(), h3 = this.getPropertyDescriptor(t5, i5, s4);
      void 0 !== h3 && e3(this.prototype, t5, h3);
    }
  }
  static getPropertyDescriptor(t5, s4, i5) {
    var _a6;
    const { get: e6, set: r4 } = (_a6 = h(this.prototype, t5)) != null ? _a6 : { get() {
      return this[s4];
    }, set(t6) {
      this[s4] = t6;
    } };
    return { get: e6, set(s5) {
      const h3 = e6 == null ? void 0 : e6.call(this);
      r4 == null ? void 0 : r4.call(this, s5), this.requestUpdate(t5, h3, i5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t5) {
    var _a6;
    return (_a6 = this.elementProperties.get(t5)) != null ? _a6 : b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t5 = n3(this);
    t5.finalize(), void 0 !== t5.l && (this.l = [...t5.l]), this.elementProperties = new Map(t5.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t6 = this.properties, s4 = [...r2(t6), ...o3(t6)];
      for (const i5 of s4) this.createProperty(i5, t6[i5]);
    }
    const t5 = this[Symbol.metadata];
    if (null !== t5) {
      const s4 = litPropertyMetadata.get(t5);
      if (void 0 !== s4) for (const [t6, i5] of s4) this.elementProperties.set(t6, i5);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t6, s4] of this.elementProperties) {
      const i5 = this._$Eu(t6, s4);
      void 0 !== i5 && this._$Eh.set(i5, t6);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i5 = [];
    if (Array.isArray(s4)) {
      const e6 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e6) i5.unshift(c(s5));
    } else void 0 !== s4 && i5.push(c(s4));
    return i5;
  }
  static _$Eu(t5, s4) {
    const i5 = s4.attribute;
    return false === i5 ? void 0 : "string" == typeof i5 ? i5 : "string" == typeof t5 ? t5.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var _a6;
    this._$ES = new Promise((t5) => this.enableUpdating = t5), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (_a6 = this.constructor.l) == null ? void 0 : _a6.forEach((t5) => t5(this));
  }
  addController(t5) {
    var _a6, _b2;
    ((_a6 = this._$EO) != null ? _a6 : this._$EO = /* @__PURE__ */ new Set()).add(t5), void 0 !== this.renderRoot && this.isConnected && ((_b2 = t5.hostConnected) == null ? void 0 : _b2.call(t5));
  }
  removeController(t5) {
    var _a6;
    (_a6 = this._$EO) == null ? void 0 : _a6.delete(t5);
  }
  _$E_() {
    const t5 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i5 of s4.keys()) this.hasOwnProperty(i5) && (t5.set(i5, this[i5]), delete this[i5]);
    t5.size > 0 && (this._$Ep = t5);
  }
  createRenderRoot() {
    var _a6;
    const t5 = (_a6 = this.shadowRoot) != null ? _a6 : this.attachShadow(this.constructor.shadowRootOptions);
    return S(t5, this.constructor.elementStyles), t5;
  }
  connectedCallback() {
    var _a6, _b2;
    (_a6 = this.renderRoot) != null ? _a6 : this.renderRoot = this.createRenderRoot(), this.enableUpdating(true), (_b2 = this._$EO) == null ? void 0 : _b2.forEach((t5) => {
      var _a7;
      return (_a7 = t5.hostConnected) == null ? void 0 : _a7.call(t5);
    });
  }
  enableUpdating(t5) {
  }
  disconnectedCallback() {
    var _a6;
    (_a6 = this._$EO) == null ? void 0 : _a6.forEach((t5) => {
      var _a7;
      return (_a7 = t5.hostDisconnected) == null ? void 0 : _a7.call(t5);
    });
  }
  attributeChangedCallback(t5, s4, i5) {
    this._$AK(t5, i5);
  }
  _$ET(t5, s4) {
    var _a6;
    const i5 = this.constructor.elementProperties.get(t5), e6 = this.constructor._$Eu(t5, i5);
    if (void 0 !== e6 && true === i5.reflect) {
      const h3 = (void 0 !== ((_a6 = i5.converter) == null ? void 0 : _a6.toAttribute) ? i5.converter : u).toAttribute(s4, i5.type);
      this._$Em = t5, null == h3 ? this.removeAttribute(e6) : this.setAttribute(e6, h3), this._$Em = null;
    }
  }
  _$AK(t5, s4) {
    var _a6, _b2, _c;
    const i5 = this.constructor, e6 = i5._$Eh.get(t5);
    if (void 0 !== e6 && this._$Em !== e6) {
      const t6 = i5.getPropertyOptions(e6), h3 = "function" == typeof t6.converter ? { fromAttribute: t6.converter } : void 0 !== ((_a6 = t6.converter) == null ? void 0 : _a6.fromAttribute) ? t6.converter : u;
      this._$Em = e6;
      const r4 = h3.fromAttribute(s4, t6.type);
      this[e6] = (_c = r4 != null ? r4 : (_b2 = this._$Ej) == null ? void 0 : _b2.get(e6)) != null ? _c : r4, this._$Em = null;
    }
  }
  requestUpdate(t5, s4, i5, e6 = false, h3) {
    var _a6, _b2;
    if (void 0 !== t5) {
      const r4 = this.constructor;
      if (false === e6 && (h3 = this[t5]), i5 != null ? i5 : i5 = r4.getPropertyOptions(t5), !(((_a6 = i5.hasChanged) != null ? _a6 : f)(h3, s4) || i5.useDefault && i5.reflect && h3 === ((_b2 = this._$Ej) == null ? void 0 : _b2.get(t5)) && !this.hasAttribute(r4._$Eu(t5, i5)))) return;
      this.C(t5, s4, i5);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t5, s4, { useDefault: i5, reflect: e6, wrapped: h3 }, r4) {
    var _a6, _b2, _c;
    i5 && !((_a6 = this._$Ej) != null ? _a6 : this._$Ej = /* @__PURE__ */ new Map()).has(t5) && (this._$Ej.set(t5, (_b2 = r4 != null ? r4 : s4) != null ? _b2 : this[t5]), true !== h3 || void 0 !== r4) || (this._$AL.has(t5) || (this.hasUpdated || i5 || (s4 = void 0), this._$AL.set(t5, s4)), true === e6 && this._$Em !== t5 && ((_c = this._$Eq) != null ? _c : this._$Eq = /* @__PURE__ */ new Set()).add(t5));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t6) {
      Promise.reject(t6);
    }
    const t5 = this.scheduleUpdate();
    return null != t5 && await t5, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var _a6, _b2;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if ((_a6 = this.renderRoot) != null ? _a6 : this.renderRoot = this.createRenderRoot(), this._$Ep) {
        for (const [t7, s5] of this._$Ep) this[t7] = s5;
        this._$Ep = void 0;
      }
      const t6 = this.constructor.elementProperties;
      if (t6.size > 0) for (const [s5, i5] of t6) {
        const { wrapped: t7 } = i5, e6 = this[s5];
        true !== t7 || this._$AL.has(s5) || void 0 === e6 || this.C(s5, void 0, i5, e6);
      }
    }
    let t5 = false;
    const s4 = this._$AL;
    try {
      t5 = this.shouldUpdate(s4), t5 ? (this.willUpdate(s4), (_b2 = this._$EO) == null ? void 0 : _b2.forEach((t6) => {
        var _a7;
        return (_a7 = t6.hostUpdate) == null ? void 0 : _a7.call(t6);
      }), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t5 = false, this._$EM(), s5;
    }
    t5 && this._$AE(s4);
  }
  willUpdate(t5) {
  }
  _$AE(t5) {
    var _a6;
    (_a6 = this._$EO) == null ? void 0 : _a6.forEach((t6) => {
      var _a7;
      return (_a7 = t6.hostUpdated) == null ? void 0 : _a7.call(t6);
    }), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t5)), this.updated(t5);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t5) {
    return true;
  }
  update(t5) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t6) => this._$ET(t6, this[t6]))), this._$EM();
  }
  updated(t5) {
  }
  firstUpdated(t5) {
  }
};
var _a2;
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p == null ? void 0 : p({ ReactiveElement: y }), ((_a2 = a.reactiveElementVersions) != null ? _a2 : a.reactiveElementVersions = []).push("2.1.2");

// ../node_modules/.pnpm/lit-html@3.3.2/node_modules/lit-html/lit-html.js
var t3 = globalThis;
var i3 = (t5) => t5;
var s2 = t3.trustedTypes;
var e4 = s2 ? s2.createPolicy("lit-html", { createHTML: (t5) => t5 }) : void 0;
var h2 = "$lit$";
var o4 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n4 = "?" + o4;
var r3 = `<${n4}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t5) => null === t5 || "object" != typeof t5 && "function" != typeof t5;
var u2 = Array.isArray;
var d2 = (t5) => u2(t5) || "function" == typeof (t5 == null ? void 0 : t5[Symbol.iterator]);
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t5) => (i5, ...s4) => ({ _$litType$: t5, strings: i5, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = /* @__PURE__ */ Symbol.for("lit-noChange");
var A = /* @__PURE__ */ Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t5, i5) {
  if (!u2(t5) || !t5.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e4 ? e4.createHTML(i5) : i5;
}
var N = (t5, i5) => {
  const s4 = t5.length - 1, e6 = [];
  let n6, l3 = 2 === i5 ? "<svg>" : 3 === i5 ? "<math>" : "", c4 = v;
  for (let i6 = 0; i6 < s4; i6++) {
    const s5 = t5[i6];
    let a3, u3, d3 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n6 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n6 != null ? n6 : v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n6 = void 0);
    const x2 = c4 === p2 && t5[i6 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e6.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o4 + x2) : s5 + o4 + (-2 === d3 ? i6 : x2);
  }
  return [V(t5, l3 + (t5[s4] || "<?>") + (2 === i5 ? "</svg>" : 3 === i5 ? "</math>" : "")), e6];
};
var S2 = class _S {
  constructor({ strings: t5, _$litType$: i5 }, e6) {
    let r4;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t5.length - 1, d3 = this.parts, [f3, v2] = N(t5, i5);
    if (this.el = _S.createElement(f3, e6), P.currentNode = this.el.content, 2 === i5 || 3 === i5) {
      const t6 = this.el.content.firstChild;
      t6.replaceWith(...t6.childNodes);
    }
    for (; null !== (r4 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r4.nodeType) {
        if (r4.hasAttributes()) for (const t6 of r4.getAttributeNames()) if (t6.endsWith(h2)) {
          const i6 = v2[a3++], s4 = r4.getAttribute(t6).split(o4), e7 = /([.?@])?(.*)/.exec(i6);
          d3.push({ type: 1, index: l3, name: e7[2], strings: s4, ctor: "." === e7[1] ? I : "?" === e7[1] ? L : "@" === e7[1] ? z : H }), r4.removeAttribute(t6);
        } else t6.startsWith(o4) && (d3.push({ type: 6, index: l3 }), r4.removeAttribute(t6));
        if (y2.test(r4.tagName)) {
          const t6 = r4.textContent.split(o4), i6 = t6.length - 1;
          if (i6 > 0) {
            r4.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i6; s4++) r4.append(t6[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r4.append(t6[i6], c3());
          }
        }
      } else if (8 === r4.nodeType) if (r4.data === n4) d3.push({ type: 2, index: l3 });
      else {
        let t6 = -1;
        for (; -1 !== (t6 = r4.data.indexOf(o4, t6 + 1)); ) d3.push({ type: 7, index: l3 }), t6 += o4.length - 1;
      }
      l3++;
    }
  }
  static createElement(t5, i5) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t5, s4;
  }
};
function M(t5, i5, s4 = t5, e6) {
  var _a6, _b2, _c;
  if (i5 === E) return i5;
  let h3 = void 0 !== e6 ? (_a6 = s4._$Co) == null ? void 0 : _a6[e6] : s4._$Cl;
  const o6 = a2(i5) ? void 0 : i5._$litDirective$;
  return (h3 == null ? void 0 : h3.constructor) !== o6 && ((_b2 = h3 == null ? void 0 : h3._$AO) == null ? void 0 : _b2.call(h3, false), void 0 === o6 ? h3 = void 0 : (h3 = new o6(t5), h3._$AT(t5, s4, e6)), void 0 !== e6 ? ((_c = s4._$Co) != null ? _c : s4._$Co = [])[e6] = h3 : s4._$Cl = h3), void 0 !== h3 && (i5 = M(t5, h3._$AS(t5, i5.values), h3, e6)), i5;
}
var R = class {
  constructor(t5, i5) {
    this._$AV = [], this._$AN = void 0, this._$AD = t5, this._$AM = i5;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t5) {
    var _a6;
    const { el: { content: i5 }, parts: s4 } = this._$AD, e6 = ((_a6 = t5 == null ? void 0 : t5.creationScope) != null ? _a6 : l2).importNode(i5, true);
    P.currentNode = e6;
    let h3 = P.nextNode(), o6 = 0, n6 = 0, r4 = s4[0];
    for (; void 0 !== r4; ) {
      if (o6 === r4.index) {
        let i6;
        2 === r4.type ? i6 = new k(h3, h3.nextSibling, this, t5) : 1 === r4.type ? i6 = new r4.ctor(h3, r4.name, r4.strings, this, t5) : 6 === r4.type && (i6 = new Z(h3, this, t5)), this._$AV.push(i6), r4 = s4[++n6];
      }
      o6 !== (r4 == null ? void 0 : r4.index) && (h3 = P.nextNode(), o6++);
    }
    return P.currentNode = l2, e6;
  }
  p(t5) {
    let i5 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t5, s4, i5), i5 += s4.strings.length - 2) : s4._$AI(t5[i5])), i5++;
  }
};
var k = class _k {
  get _$AU() {
    var _a6, _b2;
    return (_b2 = (_a6 = this._$AM) == null ? void 0 : _a6._$AU) != null ? _b2 : this._$Cv;
  }
  constructor(t5, i5, s4, e6) {
    var _a6;
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t5, this._$AB = i5, this._$AM = s4, this.options = e6, this._$Cv = (_a6 = e6 == null ? void 0 : e6.isConnected) != null ? _a6 : true;
  }
  get parentNode() {
    let t5 = this._$AA.parentNode;
    const i5 = this._$AM;
    return void 0 !== i5 && 11 === (t5 == null ? void 0 : t5.nodeType) && (t5 = i5.parentNode), t5;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t5, i5 = this) {
    t5 = M(this, t5, i5), a2(t5) ? t5 === A || null == t5 || "" === t5 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t5 !== this._$AH && t5 !== E && this._(t5) : void 0 !== t5._$litType$ ? this.$(t5) : void 0 !== t5.nodeType ? this.T(t5) : d2(t5) ? this.k(t5) : this._(t5);
  }
  O(t5) {
    return this._$AA.parentNode.insertBefore(t5, this._$AB);
  }
  T(t5) {
    this._$AH !== t5 && (this._$AR(), this._$AH = this.O(t5));
  }
  _(t5) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t5 : this.T(l2.createTextNode(t5)), this._$AH = t5;
  }
  $(t5) {
    var _a6;
    const { values: i5, _$litType$: s4 } = t5, e6 = "number" == typeof s4 ? this._$AC(t5) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (((_a6 = this._$AH) == null ? void 0 : _a6._$AD) === e6) this._$AH.p(i5);
    else {
      const t6 = new R(e6, this), s5 = t6.u(this.options);
      t6.p(i5), this.T(s5), this._$AH = t6;
    }
  }
  _$AC(t5) {
    let i5 = C.get(t5.strings);
    return void 0 === i5 && C.set(t5.strings, i5 = new S2(t5)), i5;
  }
  k(t5) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i5 = this._$AH;
    let s4, e6 = 0;
    for (const h3 of t5) e6 === i5.length ? i5.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i5[e6], s4._$AI(h3), e6++;
    e6 < i5.length && (this._$AR(s4 && s4._$AB.nextSibling, e6), i5.length = e6);
  }
  _$AR(t5 = this._$AA.nextSibling, s4) {
    var _a6;
    for ((_a6 = this._$AP) == null ? void 0 : _a6.call(this, false, true, s4); t5 !== this._$AB; ) {
      const s5 = i3(t5).nextSibling;
      i3(t5).remove(), t5 = s5;
    }
  }
  setConnected(t5) {
    var _a6;
    void 0 === this._$AM && (this._$Cv = t5, (_a6 = this._$AP) == null ? void 0 : _a6.call(this, t5));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t5, i5, s4, e6, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t5, this.name = i5, this._$AM = e6, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t5, i5 = this, s4, e6) {
    const h3 = this.strings;
    let o6 = false;
    if (void 0 === h3) t5 = M(this, t5, i5, 0), o6 = !a2(t5) || t5 !== this._$AH && t5 !== E, o6 && (this._$AH = t5);
    else {
      const e7 = t5;
      let n6, r4;
      for (t5 = h3[0], n6 = 0; n6 < h3.length - 1; n6++) r4 = M(this, e7[s4 + n6], i5, n6), r4 === E && (r4 = this._$AH[n6]), o6 || (o6 = !a2(r4) || r4 !== this._$AH[n6]), r4 === A ? t5 = A : t5 !== A && (t5 += (r4 != null ? r4 : "") + h3[n6 + 1]), this._$AH[n6] = r4;
    }
    o6 && !e6 && this.j(t5);
  }
  j(t5) {
    t5 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t5 != null ? t5 : "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t5) {
    this.element[this.name] = t5 === A ? void 0 : t5;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t5) {
    this.element.toggleAttribute(this.name, !!t5 && t5 !== A);
  }
};
var z = class extends H {
  constructor(t5, i5, s4, e6, h3) {
    super(t5, i5, s4, e6, h3), this.type = 5;
  }
  _$AI(t5, i5 = this) {
    var _a6;
    if ((t5 = (_a6 = M(this, t5, i5, 0)) != null ? _a6 : A) === E) return;
    const s4 = this._$AH, e6 = t5 === A && s4 !== A || t5.capture !== s4.capture || t5.once !== s4.once || t5.passive !== s4.passive, h3 = t5 !== A && (s4 === A || e6);
    e6 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t5), this._$AH = t5;
  }
  handleEvent(t5) {
    var _a6, _b2;
    "function" == typeof this._$AH ? this._$AH.call((_b2 = (_a6 = this.options) == null ? void 0 : _a6.host) != null ? _b2 : this.element, t5) : this._$AH.handleEvent(t5);
  }
};
var Z = class {
  constructor(t5, i5, s4) {
    this.element = t5, this.type = 6, this._$AN = void 0, this._$AM = i5, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t5) {
    M(this, t5);
  }
};
var B = t3.litHtmlPolyfillSupport;
var _a3;
B == null ? void 0 : B(S2, k), ((_a3 = t3.litHtmlVersions) != null ? _a3 : t3.litHtmlVersions = []).push("3.3.2");
var D = (t5, i5, s4) => {
  var _a6, _b2;
  const e6 = (_a6 = s4 == null ? void 0 : s4.renderBefore) != null ? _a6 : i5;
  let h3 = e6._$litPart$;
  if (void 0 === h3) {
    const t6 = (_b2 = s4 == null ? void 0 : s4.renderBefore) != null ? _b2 : null;
    e6._$litPart$ = h3 = new k(i5.insertBefore(c3(), t6), t6, void 0, s4 != null ? s4 : {});
  }
  return h3._$AI(t5), h3;
};

// ../node_modules/.pnpm/lit-element@4.2.2/node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var _a6, _b2;
    const t5 = super.createRenderRoot();
    return (_b2 = (_a6 = this.renderOptions).renderBefore) != null ? _b2 : _a6.renderBefore = t5.firstChild, t5;
  }
  update(t5) {
    const r4 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t5), this._$Do = D(r4, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var _a6;
    super.connectedCallback(), (_a6 = this._$Do) == null ? void 0 : _a6.setConnected(true);
  }
  disconnectedCallback() {
    var _a6;
    super.disconnectedCallback(), (_a6 = this._$Do) == null ? void 0 : _a6.setConnected(false);
  }
  render() {
    return E;
  }
};
var _a4;
i4._$litElement$ = true, i4["finalized"] = true, (_a4 = s3.litElementHydrateSupport) == null ? void 0 : _a4.call(s3, { LitElement: i4 });
var o5 = s3.litElementPolyfillSupport;
o5 == null ? void 0 : o5({ LitElement: i4 });
var _a5;
((_a5 = s3.litElementVersions) != null ? _a5 : s3.litElementVersions = []).push("4.2.2");

// ../node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/decorators/custom-element.js
var t4 = (t5) => (e6, o6) => {
  void 0 !== o6 ? o6.addInitializer(() => {
    customElements.define(t5, e6);
  }) : customElements.define(t5, e6);
};

// src/sheets-webcomponent/main.tsx
var React = __toESM(require_react());
var import_jsx_runtime = __toESM(require_jsx_runtime());
var MyWebComponent = class extends i4 {
  firstUpdated() {
    const container = this.renderRoot.querySelector("#containerId");
    const univer = new Univer({
      locale: "zhCN" /* ZH_CN */,
      locales: {
        ["zhCN" /* ZH_CN */]: zh_CN_default
      },
      logLevel: 4 /* VERBOSE */
    });
    univer.registerPlugin(UniverNetworkPlugin);
    univer.registerPlugin(UniverFormulaEnginePlugin);
    univer.registerPlugin(UniverRenderEnginePlugin);
    univer.registerPlugin(UniverUIPlugin, {
      container,
      ribbonType: "classic"
    });
    univer.registerPlugin(UniverDocsPlugin);
    univer.registerPlugin(UniverDocsUIPlugin);
    univer.registerPlugin(UniverSheetsPlugin);
    univer.registerPlugin(UniverSheetsUIPlugin);
    univer.registerPlugin(UniverSheetsNumfmtPlugin);
    univer.registerPlugin(UniverSheetsNumfmtUIPlugin);
    univer.registerPlugin(UniverSheetsFormulaPlugin);
    univer.registerPlugin(UniverSheetsFormulaUIPlugin);
    univer.registerPlugin(UniverSheetsDrawingPlugin);
    univer.registerPlugin(UniverSheetsDrawingUIPlugin);
    univer.registerPlugin(UniverSheetsConditionalFormattingPlugin);
    univer.registerPlugin(UniverSheetsConditionalFormattingUIPlugin);
    univer.registerPlugin(UniverSheetsDataValidationPlugin);
    univer.registerPlugin(UniverSheetsDataValidationUIPlugin);
    univer.registerPlugin(UniverSheetsFilterPlugin);
    univer.registerPlugin(UniverSheetsFilterUIPlugin);
    univer.registerPlugin(UniverSheetsSortPlugin);
    univer.registerPlugin(UniverSheetsSortUIPlugin);
    univer.registerPlugin(UniverSheetsHyperLinkPlugin);
    univer.registerPlugin(UniverSheetsHyperLinkUIPlugin);
    univer.registerPlugin(UniverSheetsTablePlugin);
    univer.registerPlugin(UniverSheetsTableUIPlugin);
    univer.registerPlugin(UniverSheetsNotePlugin);
    univer.registerPlugin(UniverSheetsNoteUIPlugin);
    univer.registerPlugin(UniverThreadCommentPlugin);
    univer.registerPlugin(UniverThreadCommentUIPlugin);
    univer.registerPlugin(UniverSheetsThreadCommentPlugin);
    univer.registerPlugin(UniverSheetsThreadCommentUIPlugin);
    univer.registerPlugin(UniverSheetsFindReplacePlugin);
    univer.registerPlugin(UniverSheetsZenEditorPlugin);
    univer.registerPlugin(UniverSheetsCrosshairHighlightPlugin);
    univer.registerPlugin(UniverWatermarkPlugin);
    univer.registerPlugin(UniverWebComponentAdapterPlugin);
    univer.registerPlugin(UniverVue3AdapterPlugin);
    univer.createUnit(2 /* UNIVER_SHEET */, DEFAULT_WORKBOOK_DATA_DEMO);
    window.univerAPI = FUniver.newAPI(univer);
  }
  render() {
    return b2`
            <link rel="stylesheet" href="./main.css">
            <div style="height: 100%;" id="containerId" />
        `;
  }
};
MyWebComponent = __decorateClass([
  t4("my-univer")
], MyWebComponent);
var App = o({
  tagName: "my-univer",
  elementClass: MyWebComponent,
  react: React,
  events: {
    onMyEvent: "my-event"
  }
});
render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, {}), document.getElementById("app"));
/*! Bundled license information:

@lit/react/create-component.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
@lit/reactive-element/decorators/custom-element.js:
@lit/reactive-element/decorators/property.js:
@lit/reactive-element/decorators/state.js:
@lit/reactive-element/decorators/event-options.js:
@lit/reactive-element/decorators/base.js:
@lit/reactive-element/decorators/query.js:
@lit/reactive-element/decorators/query-all.js:
@lit/reactive-element/decorators/query-async.js:
@lit/reactive-element/decorators/query-assigned-nodes.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
