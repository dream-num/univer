import {
  AbsoluteRefType,
  AutoFillSeries,
  BaselineOffset,
  BooleanNumber,
  BorderStyleTypes,
  BorderType,
  CanceledError,
  ColorType,
  CommandType,
  CommonHideTypes,
  CopyPasteType,
  DataValidationErrorStyle,
  DataValidationOperator,
  DataValidationRenderMode,
  DataValidationStatus,
  DataValidationType,
  DeleteDirection,
  DeveloperMetadataVisibility,
  Dimension,
  Direction,
  Disposable,
  HorizontalAlign,
  ICommandService,
  IUndoRedoService,
  IUniverInstanceService,
  Inject,
  Injector,
  InterpolationPointType,
  LifecycleService,
  LifecycleStages,
  LocaleService,
  LocaleType,
  MentionType,
  ParagraphStyleBuilder,
  ParagraphStyleValue,
  ProtectionType,
  Rectangle,
  RedoCommand,
  Registry,
  RelativeDate,
  RichTextBuilder,
  RichTextValue,
  SheetTypes,
  TextDecoration,
  TextDecorationBuilder,
  TextDirection,
  TextStyleBuilder,
  TextStyleValue,
  ThemeColorType,
  ThemeService,
  Tools,
  UndoCommand,
  Univer,
  UniverType,
  UserManagerService,
  VerticalAlign,
  WrapStrategy,
  filter,
  lib_exports,
  toDisposable
} from "./chunk-EJSPXROI.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField
} from "./chunk-24OICD5T.js";

// ../packages/core/src/facade/f-base.ts
var FBase = class extends Disposable {
  /**
   * @ignore
   */
  static extend(source) {
    Object.getOwnPropertyNames(source.prototype).forEach((name) => {
      if (name !== "constructor") {
        this.prototype[name] = source.prototype[name];
      }
    });
    Object.getOwnPropertyNames(source).forEach((name) => {
      if (name !== "prototype" && name !== "name" && name !== "length") {
        this[name] = source[name];
      }
    });
  }
};
var InitializerSymbol = /* @__PURE__ */ Symbol("initializers");
var ManualInitSymbol = /* @__PURE__ */ Symbol("manualInit");
var FBaseInitialable = class extends Disposable {
  constructor(_injector) {
    super();
    __publicField(this, "_injector", _injector);
    const Ctor = this.constructor;
    const manual = Boolean(Ctor[ManualInitSymbol]);
    if (manual) return;
    const self = this;
    const initializers = Object.getPrototypeOf(this)[InitializerSymbol];
    if (initializers) {
      initializers.forEach(function(fn) {
        fn.apply(self, [_injector]);
      });
    }
  }
  /**
   * @ignore
   */
  _initialize(injector, ..._rest) {
  }
  _runInitializers(...args) {
    const initializers = Object.getPrototypeOf(this)[InitializerSymbol];
    if (initializers == null ? void 0 : initializers.length) {
      initializers.forEach((fn) => fn.apply(this, args));
    }
  }
  static _enableManualInit() {
    this[ManualInitSymbol] = true;
  }
  /**
   * @ignore
   */
  static extend(source) {
    Object.getOwnPropertyNames(source.prototype).forEach((name) => {
      if (name === "_initialize") {
        let initializers = this.prototype[InitializerSymbol];
        if (!initializers) {
          initializers = [];
          this.prototype[InitializerSymbol] = initializers;
        }
        initializers.push(source.prototype._initialize);
      } else if (name !== "constructor") {
        this.prototype[name] = source.prototype[name];
      }
    });
    Object.getOwnPropertyNames(source).forEach((name) => {
      if (name !== "prototype" && name !== "name" && name !== "length") {
        this[name] = source[name];
      }
    });
  }
};

// ../packages/core/src/facade/f-blob.ts
var FBlob = class extends FBase {
  constructor(_blob, _injector) {
    super();
    __publicField(this, "_blob", _blob);
    __publicField(this, "_injector", _injector);
  }
  /**
   * Returns a copy of this blob.
   * @returns a new blob by copying the current blob
   * @example
   * ```ts
   * const blob = univerAPI.newBlob();
   * const newBlob = blob.copyBlob();
   * console.log(newBlob);
   * ```
   */
  copyBlob() {
    return this._injector.createInstance(FBlob, this._blob);
  }
  /**
   * Return the data inside this object as a blob converted to the specified content type.
   * @param contentType the content type refer to https://developer.mozilla.org/en-US/docs/Web/HTTP/MIME_types/Common_types
   * @returns a new blob by converting the current blob to the specified content type
   * @example
   * ```ts
   * const blob = univerAPI.newBlob();
   * const newBlob = blob.getAs('text/plain');
   * console.log(newBlob);
   * ```
   */
  getAs(contentType) {
    const newBlob = this.copyBlob();
    newBlob.setContentType(contentType);
    return newBlob;
  }
  getDataAsString(charset) {
    if (this._blob === null) {
      return Promise.resolve("");
    }
    if (charset === void 0) {
      return this._blob.text();
    }
    return new Promise((resolve, reject) => {
      this._blob.arrayBuffer().then((arrayBuffer) => {
        const text = new TextDecoder(charset).decode(arrayBuffer);
        resolve(text);
      }).catch((error) => {
        reject(new Error(`Failed to read Blob as ArrayBuffer: ${error.message}`));
      });
    });
  }
  /**
   * Gets the data stored in this blob.
   * @returns the blob content as a byte array
   * @example
   * ```ts
   * const blob = univerAPI.newBlob();
   * const bytes = await blob.getBytes();
   * console.log(bytes);
   * ```
   */
  getBytes() {
    if (!this._blob) {
      return Promise.reject(new Error("Blob is undefined or null."));
    }
    return this._blob.arrayBuffer().then((buffer) => new Uint8Array(buffer));
  }
  /**
   * Sets the data stored in this blob.
   * @param bytes a byte array
   * @returns the blob object
   * @example
   * ```ts
   * const blob = univerAPI.newBlob();
   * const bytes = new Uint8Array(10);
   * blob.setBytes(bytes);
   * ```
   */
  setBytes(bytes) {
    this._blob = new Blob([bytes.buffer]);
    return this;
  }
  setDataFromString(data, contentType) {
    const contentTypeVal = contentType != null ? contentType : "text/plain";
    const blob = new Blob([data], { type: contentTypeVal });
    this._blob = blob;
    return this;
  }
  /**
   * Gets the content type of the data stored in this blob.
   * @returns the content type
   * @example
   * ```ts
   * const blob = univerAPI.newBlob();
   * const contentType = blob.getContentType();
   * console.log(contentType);
   * ```
   */
  getContentType() {
    var _a;
    return (_a = this._blob) == null ? void 0 : _a.type;
  }
  /**
   * Sets the content type of the data stored in this blob.
   * @param contentType the content type refer to https://developer.mozilla.org/en-US/docs/Web/HTTP/MIME_types/Common_types
   * @returns the blob object
   * @example
   * ```ts
   * const blob = univerAPI.newBlob();
   * blob.setContentType('text/plain');
   * ```
   */
  setContentType(contentType) {
    var _a;
    this._blob = (_a = this._blob) == null ? void 0 : _a.slice(0, this._blob.size, contentType);
    return this;
  }
};
FBlob = __decorateClass([
  __decorateParam(1, Inject(Injector))
], FBlob);

// ../packages/core/src/facade/f-doc.ts
var FDoc = class extends FBaseInitialable {
  constructor(doc, _injector) {
    super(_injector);
    __publicField(this, "doc", doc);
  }
};
FDoc = __decorateClass([
  __decorateParam(1, Inject(Injector))
], FDoc);

// ../packages/core/src/facade/f-enum.ts
var _FEnum = class _FEnum {
  static get() {
    if (this._instance) {
      return this._instance;
    }
    const instance = new _FEnum();
    this._instance = instance;
    return instance;
  }
  /**
   * @ignore
   */
  static extend(source) {
    Object.getOwnPropertyNames(source.prototype).forEach((name) => {
      if (name !== "constructor") {
        this.prototype[name] = source.prototype[name];
      }
    });
    Object.getOwnPropertyNames(source).forEach((name) => {
      if (name !== "prototype" && name !== "name" && name !== "length") {
        this[name] = source[name];
      }
    });
  }
  constructor() {
    for (const key in _FEnum.prototype) {
      this[key] = _FEnum.prototype[key];
    }
  }
  /**
   * Defines different types of absolute references
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.AbsoluteRefType);
   * ```
   */
  get AbsoluteRefType() {
    return AbsoluteRefType;
  }
  /**
   * Defines different types of Univer instances
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.UniverInstanceType.UNIVER_SHEET);
   * ```
   */
  get UniverInstanceType() {
    return UniverType;
  }
  /**
   * Represents different stages in the lifecycle
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.LifecycleStages.Rendered);
   * ```
   */
  get LifecycleStages() {
    return LifecycleStages;
  }
  /**
   * Different types of data validation
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.DataValidationType.LIST);
   * ```
   */
  get DataValidationType() {
    return DataValidationType;
  }
  /**
   * Different error display styles
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.DataValidationErrorStyle.WARNING);
   * ```
   */
  get DataValidationErrorStyle() {
    return DataValidationErrorStyle;
  }
  /**
   * Different validation rendering modes
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.DataValidationRenderMode.TEXT);
   * ```
   */
  get DataValidationRenderMode() {
    return DataValidationRenderMode;
  }
  /**
   * Different validation operators
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.DataValidationOperator.BETWEEN);
   * ```
   */
  get DataValidationOperator() {
    return DataValidationOperator;
  }
  /**
   * Different validation states
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.DataValidationStatus.VALID);
   * ```
   */
  get DataValidationStatus() {
    return DataValidationStatus;
  }
  /**
   * Different types of commands
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.CommandType.COMMAND);
   * ```
   */
  get CommandType() {
    return CommandType;
  }
  /**
   * Different baseline offsets for text baseline positioning
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.BaselineOffset.SUPERSCRIPT);
   * ```
   */
  get BaselineOffset() {
    return BaselineOffset;
  }
  /**
   * Boolean number representations
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.BooleanNumber.TRUE);
   * ```
   */
  get BooleanNumber() {
    return BooleanNumber;
  }
  /**
   * Different horizontal text alignment options
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.HorizontalAlign.CENTER);
   * ```
   */
  get HorizontalAlign() {
    return HorizontalAlign;
  }
  /**
   * Different text decoration styles
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.TextDecoration.DOUBLE);
   * ```
   */
  get TextDecoration() {
    return TextDecoration;
  }
  /**
   * Different text direction options
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.TextDirection.LEFT_TO_RIGHT);
   * ```
   */
  get TextDirection() {
    return TextDirection;
  }
  /**
   * Different vertical text alignment options
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.VerticalAlign.MIDDLE);
   * ```
   */
  get VerticalAlign() {
    return VerticalAlign;
  }
  /**
   * Different wrap strategy options
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.WrapStrategy.WRAP);
   * ```
   */
  get WrapStrategy() {
    return WrapStrategy;
  }
  /**
   * Different border types
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.BorderType.OUTSIDE);
   * ```
   */
  get BorderType() {
    return BorderType;
  }
  /**
   * Different border style types
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.BorderStyleTypes.NONE);
   * ```
   */
  get BorderStyleTypes() {
    return BorderStyleTypes;
  }
  /**
   * Auto fill series types
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.AutoFillSeries.ALTERNATE_SERIES);
   * ```
   */
  get AutoFillSeries() {
    return AutoFillSeries;
  }
  /**
   * Color types
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.ColorType.RGB);
   * ```
   */
  get ColorType() {
    return ColorType;
  }
  /**
   * Common hide types
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.CommonHideTypes.ON);
   * ```
   */
  get CommonHideTypes() {
    return CommonHideTypes;
  }
  /**
   * Copy paste types
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.CopyPasteType.PASTE_VALUES);
   * ```
   */
  get CopyPasteType() {
    return CopyPasteType;
  }
  /**
   * Delete direction types
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.DeleteDirection.LEFT);
   * ```
   */
  get DeleteDirection() {
    return DeleteDirection;
  }
  /**
   * Developer metadata visibility types
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.DeveloperMetadataVisibility.DOCUMENT);
   * ```
   */
  get DeveloperMetadataVisibility() {
    return DeveloperMetadataVisibility;
  }
  /**
   * Dimension types
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.Dimension.ROWS);
   * ```
   */
  get Dimension() {
    return Dimension;
  }
  /**
   * Direction types
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.Direction.UP);
   * ```
   */
  get Direction() {
    return Direction;
  }
  /**
   * Interpolation point types
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.InterpolationPointType.NUMBER);
   * ```
   */
  get InterpolationPointType() {
    return InterpolationPointType;
  }
  /**
   * Locale types
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.LocaleType.EN_US);
   * ```
   */
  get LocaleType() {
    return LocaleType;
  }
  /**
   * Mention types
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.MentionType.PERSON);
   * ```
   */
  get MentionType() {
    return MentionType;
  }
  /**
   * Protection types
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.ProtectionType.RANGE);
   * ```
   */
  get ProtectionType() {
    return ProtectionType;
  }
  /**
   * Relative date types
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.RelativeDate.TODAY);
   * ```
   */
  get RelativeDate() {
    return RelativeDate;
  }
  /**
   * Sheet types
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.SheetTypes.GRID);
   * ```
   */
  get SheetTypes() {
    return SheetTypes;
  }
  /**
   * Theme color types
   *
   * @example
   * ```ts
   * console.log(univerAPI.Enum.ThemeColorType.ACCENT1);
   * ```
   */
  get ThemeColorType() {
    return ThemeColorType;
  }
};
/**
 * @ignore
 */
__publicField(_FEnum, "_instance");
var FEnum = _FEnum;

// ../packages/core/src/facade/f-event.ts
var _FEventName = class _FEventName {
  static get() {
    if (this._instance) {
      return this._instance;
    }
    const instance = new _FEventName();
    this._instance = instance;
    return instance;
  }
  /**
   * @ignore
   */
  static extend(source) {
    Object.getOwnPropertyNames(source.prototype).forEach((name) => {
      if (name !== "constructor") {
        this.prototype[name] = source.prototype[name];
      }
    });
    Object.getOwnPropertyNames(source).forEach((name) => {
      if (name !== "prototype" && name !== "name" && name !== "length") {
        this[name] = source[name];
      }
    });
  }
  constructor() {
    for (const key in _FEventName.prototype) {
      this[key] = _FEventName.prototype[key];
    }
  }
  /**
   * Event fired when a document is created
   * @see {@link IDocCreatedParam}
   * @example
   * ```ts
   * const disposable = univerAPI.addEvent(univerAPI.Event.DocCreated, (params) => {
   *   const { unitId, type, doc, unit } = params;
   *   console.log('doc created', params);
   * });
   *
   * // Remove the event listener, use `disposable.dispose()`
   * ```
   */
  get DocCreated() {
    return "DocCreated";
  }
  /**
   * Event fired when a document is disposed
   * @see {@link IDocDisposedEvent}
   * @example
   * ```ts
   * const disposable = univerAPI.addEvent(univerAPI.Event.DocDisposed, (params) => {
   *   const { unitId, unitType, snapshot } = params;
   *   console.log('doc disposed', params);
   * });
   *
   * // Remove the event listener, use `disposable.dispose()`
   * ```
   */
  get DocDisposed() {
    return "DocDisposed";
  }
  /**
   * Event fired when life cycle is changed
   * @see {@link ILifeCycleChangedEvent}
   * @example
   * ```ts
   * const disposable = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, (params) => {
   *   const { stage } = params;
   *   console.log('life cycle changed', params);
   * });
   *
   * // Remove the event listener, use `disposable.dispose()`
   * ```
   */
  get LifeCycleChanged() {
    return "LifeCycleChanged";
  }
  /**
   * Event fired when a redo command is executed
   * @see {@link ICommandEvent}
   * @example
   * ```ts
   * const disposable = univerAPI.addEvent(univerAPI.Event.Redo, (event) => {
   *   const { params, id, type } = event;
   *   console.log('redo command executed', event);
   * });
   *
   * // Remove the event listener, use `disposable.dispose()`
   * ```
   */
  get Redo() {
    return "Redo";
  }
  /**
   * Event fired when an undo command is executed
   * @see {@link ICommandEvent}
   * @example
   * ```ts
   * const disposable = univerAPI.addEvent(univerAPI.Event.Undo, (event) => {
   *   const { params, id, type } = event;
   *   console.log('undo command executed', event);
   * });
   *
   * // Remove the event listener, use `disposable.dispose()`
   * ```
   */
  get Undo() {
    return "Undo";
  }
  /**
   * Event fired before a redo command is executed
   * @see {@link ICommandEvent}
   * @example
   * ```ts
   * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeRedo, (event) => {
   *   const { params, id, type } = event;
   *   console.log('before redo command executed', event);
   *
   *   // Cancel the redo operation
   *   event.cancel = true;
   * });
   *
   * // Remove the event listener, use `disposable.dispose()`
   * ```
   */
  get BeforeRedo() {
    return "BeforeRedo";
  }
  /**
   * Event fired before an undo command is executed
   * @see {@link ICommandEvent}
   * @example
   * ```ts
   * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeUndo, (event) => {
   *   const { params, id, type } = event;
   *   console.log('before undo command executed', event);
   *
   *   // Cancel the undo operation
   *   event.cancel = true;
   * });
   *
   * // Remove the event listener, use `disposable.dispose()`
   * ```
   */
  get BeforeUndo() {
    return "BeforeUndo";
  }
  /**
   * Event fired when a command is executed
   * @see {@link ICommandEvent}
   * @example
   * ```ts
   * const disposable = univerAPI.addEvent(univerAPI.Event.CommandExecuted, (event) => {
   *   const { params, id, type, options } = event;
   *   console.log('command executed', event);
   * });
   *
   * // Remove the event listener, use `disposable.dispose()`
   * ```
   */
  get CommandExecuted() {
    return "CommandExecuted";
  }
  /**
   * Event fired before a command is executed
   * @see {@link ICommandEvent}
   * @example
   * ```ts
   * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeCommandExecute, (event) => {
   *   const { params, id, type, options } = event;
   *   console.log('before command executed', event);
   *
   *   // Cancel the command execution
   *   event.cancel = true;
   * });
   *
   * // Remove the event listener, use `disposable.dispose()`
   * ```
   */
  get BeforeCommandExecute() {
    return "BeforeCommandExecute";
  }
};
/**
 * @ignore
 */
__publicField(_FEventName, "_instance");
var FEventName = _FEventName;

// ../packages/core/src/facade/f-event-registry.ts
var FEventRegistry = class {
  constructor() {
    __publicField(this, "_eventRegistry", /* @__PURE__ */ new Map());
    __publicField(this, "_eventHandlerMap", /* @__PURE__ */ new Map());
    __publicField(this, "_eventHandlerRegisted", /* @__PURE__ */ new Map());
  }
  _ensureEventRegistry(event) {
    if (!this._eventRegistry.has(event)) {
      this._eventRegistry.set(event, new Registry());
    }
    return this._eventRegistry.get(event);
  }
  registerEventHandler(event, handler) {
    const current = this._eventHandlerMap.get(event);
    if (current) {
      current.add(handler);
    } else {
      this._eventHandlerMap.set(event, /* @__PURE__ */ new Set([handler]));
    }
    if (this._ensureEventRegistry(event).getData().length) {
      this._initEventHandler(event);
    }
    return toDisposable(() => {
      var _a, _b, _c, _d;
      (_a = this._eventHandlerMap.get(event)) == null ? void 0 : _a.delete(handler);
      (_c = (_b = this._eventHandlerRegisted.get(event)) == null ? void 0 : _b.get(handler)) == null ? void 0 : _c.dispose();
      (_d = this._eventHandlerRegisted.get(event)) == null ? void 0 : _d.delete(handler);
    });
  }
  removeEvent(event, callback) {
    const map = this._ensureEventRegistry(event);
    map.delete(callback);
    if (map.getData().length === 0) {
      const disposable = this._eventHandlerRegisted.get(event);
      disposable == null ? void 0 : disposable.forEach((d) => d.dispose());
      this._eventHandlerRegisted.delete(event);
    }
  }
  _initEventHandler(event) {
    let current = this._eventHandlerRegisted.get(event);
    const handlers = this._eventHandlerMap.get(event);
    if (!handlers) return;
    if (!current || current.size === 0) {
      current = /* @__PURE__ */ new Map();
      this._eventHandlerRegisted.set(event, current);
      handlers == null ? void 0 : handlers.forEach((handler) => {
        current == null ? void 0 : current.set(handler, toDisposable(handler()));
      });
    }
  }
  /**
   * Add an event listener
   * @param {string} event key of event
   * @param {(params: IEventParamConfig[typeof event]) => void} callback callback when event triggered
   * @returns {Disposable} The Disposable instance, for remove the listener
   * @example
   * ```ts
   * univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, (params) => {
   *   const { stage } = params;
   *   console.log('life cycle changed', params);
   * });
   * ```
   */
  addEvent(event, callback) {
    this._ensureEventRegistry(event).add(callback);
    this._initEventHandler(event);
    return toDisposable(() => this.removeEvent(event, callback));
  }
  /**
   * Fire an event, used in internal only.
   * @param {string} event key of event
   * @param {any} params params of event
   * @returns {boolean} should cancel
   * @example
   * ```ts
   * this.fireEvent(univerAPI.Event.LifeCycleChanged, params);
   * ```
   */
  fireEvent(event, params) {
    var _a;
    (_a = this._eventRegistry.get(event)) == null ? void 0 : _a.getData().forEach((callback) => {
      callback(params);
    });
    return params.cancel;
  }
};

// ../packages/core/src/facade/f-hooks.ts
var FHooks = class extends FBase {
  constructor(_injector, _lifecycleService) {
    super();
    __publicField(this, "_injector", _injector);
    __publicField(this, "_lifecycleService", _lifecycleService);
  }
  /**
   * @param callback
   * @deprecated use `univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {})` as instead
   */
  onStarting(callback) {
    return toDisposable(this._lifecycleService.lifecycle$.pipe(filter((lifecycle) => lifecycle === 0 /* Starting */)).subscribe(callback));
  }
  /**
   * @param callback
   * @deprecated use `univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {})` as instead
   */
  onReady(callback) {
    return toDisposable(this._lifecycleService.lifecycle$.pipe(filter((lifecycle) => lifecycle === 1 /* Ready */)).subscribe(callback));
  }
  /**
   * @param callback
   * @deprecated use `univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {})` as instead
   */
  onRendered(callback) {
    return toDisposable(this._lifecycleService.lifecycle$.pipe(filter((lifecycle) => lifecycle === 2 /* Rendered */)).subscribe(callback));
  }
  /**
   * @param callback
   * @deprecated use `univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {})` as instead
   */
  onSteady(callback) {
    return toDisposable(this._lifecycleService.lifecycle$.pipe(filter((lifecycle) => lifecycle === 3 /* Steady */)).subscribe(callback));
  }
  /**
   * @param callback
   * @deprecated use `univerAPI.addEvent(univerAPI.Event.BeforeUndo, (event) => {})` as instead
   */
  onBeforeUndo(callback) {
    const commandService = this._injector.get(ICommandService);
    return commandService.beforeCommandExecuted((command) => {
      if (command.id === UndoCommand.id) {
        const undoredoService = this._injector.get(IUndoRedoService);
        const action = undoredoService.pitchTopUndoElement();
        if (action) {
          callback(action);
        }
      }
    });
  }
  /**
   * @param callback
   * @deprecated use `univerAPI.addEvent(univerAPI.Event.Undo, (event) => {})` as instead
   */
  onUndo(callback) {
    const commandService = this._injector.get(ICommandService);
    return commandService.onCommandExecuted((command) => {
      if (command.id === UndoCommand.id) {
        const undoredoService = this._injector.get(IUndoRedoService);
        const action = undoredoService.pitchTopUndoElement();
        if (action) {
          callback(action);
        }
      }
    });
  }
  /**
   * @param callback
   * @deprecated use `univerAPI.addEvent(univerAPI.Event.BeforeRedo, (event) => {})` as instead
   */
  onBeforeRedo(callback) {
    const commandService = this._injector.get(ICommandService);
    return commandService.beforeCommandExecuted((command) => {
      if (command.id === RedoCommand.id) {
        const undoredoService = this._injector.get(IUndoRedoService);
        const action = undoredoService.pitchTopRedoElement();
        if (action) {
          callback(action);
        }
      }
    });
  }
  /**
   * @param callback
   * @deprecated use `univerAPI.addEvent(univerAPI.Event.Redo, (event) => {})` as instead
   */
  onRedo(callback) {
    const commandService = this._injector.get(ICommandService);
    return commandService.onCommandExecuted((command) => {
      if (command.id === RedoCommand.id) {
        const undoredoService = this._injector.get(IUndoRedoService);
        const action = undoredoService.pitchTopRedoElement();
        if (action) {
          callback(action);
        }
      }
    });
  }
};
FHooks = __decorateClass([
  __decorateParam(0, Inject(Injector)),
  __decorateParam(1, Inject(LifecycleService))
], FHooks);

// ../packages/core/src/facade/f-usermanager.ts
var FUserManager = class extends FBase {
  constructor(_injector, _userManagerService) {
    super();
    __publicField(this, "_injector", _injector);
    __publicField(this, "_userManagerService", _userManagerService);
  }
  /**
   * Get current user info.
   * @returns {IUser} Current user info.
   * @example
   * ```typescript
   * univerAPI.getUserManager().getCurrentUser();
   * ```
   */
  getCurrentUser() {
    return this._userManagerService.getCurrentUser();
  }
};
FUserManager = __decorateClass([
  __decorateParam(0, Inject(Injector)),
  __decorateParam(1, Inject(UserManagerService))
], FUserManager);

// ../packages/core/src/facade/f-util.ts
var _FUtil = class _FUtil {
  static get() {
    if (this._instance) {
      return this._instance;
    }
    const instance = new _FUtil();
    this._instance = instance;
    return instance;
  }
  /**
   * @ignore
   */
  static extend(source) {
    Object.getOwnPropertyNames(source.prototype).forEach((name) => {
      if (name !== "constructor") {
        this.prototype[name] = source.prototype[name];
      }
    });
    Object.getOwnPropertyNames(source).forEach((name) => {
      if (name !== "prototype" && name !== "name" && name !== "length") {
        this[name] = source[name];
      }
    });
  }
  /**
   * Rectangle utils, including range operations likes merge, subtract, split
   *
   * @example
   * ```ts
   * const ranges = [
   *   { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 },
   *   { startRow: 1, startColumn: 1, endRow: 2, endColumn: 2 }
   * ];
   * const merged = univerAPI.Util.rectangle.mergeRanges(ranges);
   * console.log(merged);
   * ```
   */
  get rectangle() {
    return Rectangle;
  }
  /**
   * Number format utils, including parse and strigify about date, price, etc
   *
   * @example
   * ```ts
   * const text = univerAPI.Util.numfmt.format('#,##0.00', 1234.567);
   * console.log(text);
   * ```
   */
  get numfmt() {
    return lib_exports;
  }
  /**
   * common tools
   *
   * @example
   * ```ts
   * const key = univerAPI.Util.tools.generateRandomId(6);
   * console.log(key);
   * ```
   */
  get tools() {
    return Tools;
  }
};
/**
 * @ignore
 */
__publicField(_FUtil, "_instance");
var FUtil = _FUtil;

// ../packages/core/src/facade/f-univer.ts
var InitializerSymbol2 = /* @__PURE__ */ Symbol("initializers");
var FUniver = class extends Disposable {
  constructor(_injector, _commandService, _univerInstanceService, _lifecycleService) {
    super();
    __publicField(this, "_injector", _injector);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_lifecycleService", _lifecycleService);
    __publicField(this, "_eventRegistry", new FEventRegistry());
    __publicField(this, "registerEventHandler", (event, handler) => {
      return this._eventRegistry.registerEventHandler(event, handler);
    });
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.LifeCycleChanged,
        () => toDisposable(
          this._lifecycleService.lifecycle$.subscribe((stage) => {
            this.fireEvent(this.Event.LifeCycleChanged, { stage });
          })
        )
      )
    );
    this._initUnitEvent(this._injector);
    this._initBeforeCommandEvent(this._injector);
    this._initCommandEvent(this._injector);
    this._injector.onDispose(() => {
      this.dispose();
    });
    const initializers = Object.getPrototypeOf(this)[InitializerSymbol2];
    if (initializers) {
      const self = this;
      initializers.forEach(function(fn) {
        fn.apply(self, [_injector]);
      });
    }
  }
  /**
   * Create an FUniver instance, if the injector is not provided, it will create a new Univer instance.
   * @static
   * @param {Univer | Injector} wrapped - The Univer instance or injector instance.
   * @returns {FUniver} - The FUniver instance.
   *
   * @example
   * ```ts
   * const univerAPI = FUniver.newAPI(univer);
   * ```
   */
  static newAPI(wrapped) {
    const injector = wrapped instanceof Univer ? wrapped.__getInjector() : wrapped;
    return injector.createInstance(FUniver);
  }
  /**
   * @ignore
   */
  _initialize(injector) {
  }
  /**
   * @ignore
   */
  static extend(source) {
    Object.getOwnPropertyNames(source.prototype).forEach((name) => {
      if (name === "_initialize") {
        let initializers = this.prototype[InitializerSymbol2];
        if (!initializers) {
          initializers = [];
          this.prototype[InitializerSymbol2] = initializers;
        }
        initializers.push(source.prototype._initialize);
      } else if (name !== "constructor") {
        this.prototype[name] = source.prototype[name];
      }
    });
    Object.getOwnPropertyNames(source).forEach((name) => {
      if (name !== "prototype" && name !== "name" && name !== "length") {
        this[name] = source[name];
      }
    });
  }
  _initCommandEvent(injector) {
    const commandService = injector.get(ICommandService);
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.Redo,
        () => commandService.onCommandExecuted((commandInfo) => {
          const { id, type: propType, params } = commandInfo;
          if (commandInfo.id === RedoCommand.id) {
            const type = propType;
            const eventParams = { id, type, params };
            this.fireEvent(this.Event.Redo, eventParams);
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.Undo,
        () => commandService.onCommandExecuted((commandInfo) => {
          const { id, type: propType, params } = commandInfo;
          if (commandInfo.id === UndoCommand.id) {
            const type = propType;
            const eventParams = { id, type, params };
            this.fireEvent(this.Event.Undo, eventParams);
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.CommandExecuted,
        () => commandService.onCommandExecuted((commandInfo, options) => {
          const { id, type: propType, params } = commandInfo;
          if (commandInfo.id !== RedoCommand.id && commandInfo.id !== UndoCommand.id) {
            const type = propType;
            const eventParams = { id, type, params, options };
            this.fireEvent(this.Event.CommandExecuted, eventParams);
          }
        })
      )
    );
  }
  _initBeforeCommandEvent(injector) {
    const commandService = injector.get(ICommandService);
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.BeforeRedo,
        () => commandService.beforeCommandExecuted((commandInfo) => {
          const { id, type: propType, params } = commandInfo;
          if (commandInfo.id === RedoCommand.id) {
            const type = propType;
            const eventParams = { id, type, params };
            this.fireEvent(this.Event.BeforeRedo, eventParams);
            if (eventParams.cancel) {
              throw new CanceledError();
            }
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.BeforeUndo,
        () => commandService.beforeCommandExecuted((commandInfo) => {
          const { id, type: propType, params } = commandInfo;
          if (commandInfo.id === UndoCommand.id) {
            const type = propType;
            const eventParams = { id, type, params };
            this.fireEvent(this.Event.BeforeUndo, eventParams);
            if (eventParams.cancel) {
              throw new CanceledError();
            }
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.BeforeCommandExecute,
        () => commandService.beforeCommandExecuted((commandInfo, options) => {
          const { id, type: propType, params } = commandInfo;
          if (commandInfo.id !== RedoCommand.id && commandInfo.id !== UndoCommand.id) {
            const type = propType;
            const eventParams = { id, type, params, options };
            this.fireEvent(this.Event.BeforeCommandExecute, eventParams);
            if (eventParams.cancel) {
              throw new CanceledError();
            }
          }
        })
      )
    );
  }
  _initUnitEvent(injector) {
    const univerInstanceService = injector.get(IUniverInstanceService);
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.DocDisposed,
        () => univerInstanceService.unitDisposed$.subscribe((unit) => {
          if (unit.type === 1 /* UNIVER_DOC */) {
            this.fireEvent(this.Event.DocDisposed, {
              unitId: unit.getUnitId(),
              unitType: unit.type,
              snapshot: unit.getSnapshot()
            });
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.DocCreated,
        () => univerInstanceService.unitAdded$.subscribe((event) => {
          const { unit } = event;
          if (unit.type === 1 /* UNIVER_DOC */) {
            const doc = unit;
            const docUnit = injector.createInstance(FDoc, doc);
            this.fireEvent(this.Event.DocCreated, {
              unitId: unit.getUnitId(),
              type: unit.type,
              doc: docUnit,
              unit: docUnit
            });
          }
        })
      )
    );
  }
  /**
   * Dispose the UniverSheet by the `unitId`. The UniverSheet would be unload from the application.
   * @param unitId The unit id of the UniverSheet.
   * @returns Whether the Univer instance is disposed successfully.
   *
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const unitId = fWorkbook?.getId();
   *
   * if (unitId) {
   *   univerAPI.disposeUnit(unitId);
   * }
   * ```
   */
  disposeUnit(unitId) {
    return this._univerInstanceService.disposeUnit(unitId);
  }
  /**
   * Get the current lifecycle stage.
   * @returns {LifecycleStages} - The current lifecycle stage.
   *
   * @example
   * ```ts
   * const stage = univerAPI.getCurrentLifecycleStage();
   * console.log(stage);
   * ```
   */
  getCurrentLifecycleStage() {
    const lifecycleService = this._injector.get(LifecycleService);
    return lifecycleService.stage;
  }
  /**
   * Undo an editing on the currently focused document.
   * @returns {Promise<boolean>} undo result
   *
   * @example
   * ```ts
   * await univerAPI.undo();
   * ```
   */
  undo() {
    return this._commandService.executeCommand(UndoCommand.id);
  }
  /**
   * Redo an editing on the currently focused document.
   * @returns {Promise<boolean>} redo result
   *
   * @example
   * ```ts
   * await univerAPI.redo();
   * ```
   */
  redo() {
    return this._commandService.executeCommand(RedoCommand.id);
  }
  /**
   * Toggle dark mode on or off.
   * @param {boolean} isDarkMode - Whether the dark mode is enabled.
   * @example
   * ```ts
   * univerAPI.toggleDarkMode(true);
   * ```
   */
  toggleDarkMode(isDarkMode) {
    const themeService = this._injector.get(ThemeService);
    themeService.setDarkMode(isDarkMode);
  }
  /**
   * Load locales for the given locale.
   * @description This method is utilized to load locales, which can be either built-in or custom-defined.
   * @param {string} locale - A unique locale identifier.
   * @param {ILanguagePack} locales  - The locales object containing the translations.
   * @example
   * ```ts
   * univerAPI.loadLocales('esES', {
   *   'Hello World': 'Hola Mundo',
   * });
   * ```
   */
  loadLocales(locale, locales) {
    const localeService = this._injector.get(LocaleService);
    localeService.load({ [locale]: locales });
  }
  /**
   * Set the current locale.
   * @param {string} locale - A unique locale identifier.
   * @example
   * ```ts
   * univerAPI.setLocale('esES');
   * ```
   */
  setLocale(locale) {
    const localeService = this._injector.get(LocaleService);
    localeService.setLocale(locale);
  }
  /**
   * Register a callback that will be triggered before invoking a command.
   * @deprecated use `univerAPI.addEvent(univerAPI.Event.BeforeCommandExecute, (event) => {})` instead.
   * @param {CommandListener} callback The callback.
   * @returns {IDisposable} The disposable instance.
   */
  onBeforeCommandExecute(callback) {
    return this._commandService.beforeCommandExecuted((command, options) => {
      callback(command, options);
    });
  }
  /**
   * Register a callback that will be triggered when a command is invoked.
   * @deprecated use `univerAPI.addEvent(univerAPI.Event.CommandExecuted, (event) => {})` instead.
   * @param {CommandListener} callback The callback.
   * @returns {IDisposable} The disposable instance.
   */
  onCommandExecuted(callback) {
    return this._commandService.onCommandExecuted((command, options) => {
      callback(command, options);
    });
  }
  /**
   * Execute a command with the given id and parameters.
   * @param id Identifier of the command.
   * @param params Parameters of this execution.
   * @param options Options of this execution.
   * @returns The result of the execution. It is a boolean value by default which indicates the command is executed.
   *
   * @example
   * ```ts
   * univerAPI.executeCommand('sheet.command.set-range-values', {
   *   value: { v: "Hello, Univer!" },
   *   range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 }
   * });
   * ```
   */
  executeCommand(id, params, options) {
    return this._commandService.executeCommand(id, params, options);
  }
  /**
   * Execute a command with the given id and parameters synchronously.
   * @param id Identifier of the command.
   * @param params Parameters of this execution.
   * @param options Options of this execution.
   * @returns The result of the execution. It is a boolean value by default which indicates the command is executed.
   *
   * @example
   * ```ts
   * univerAPI.syncExecuteCommand('sheet.command.set-range-values', {
   *   value: { v: "Hello, Univer!" },
   *   range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 }
   * });
   * ```
   */
  syncExecuteCommand(id, params, options) {
    return this._commandService.syncExecuteCommand(id, params, options);
  }
  /**
   * Get hooks.
   * @deprecated use `addEvent` instead.
   * @returns {FHooks} FHooks instance
   */
  getHooks() {
    return this._injector.createInstance(FHooks);
  }
  get Enum() {
    return FEnum.get();
  }
  get Event() {
    return FEventName.get();
  }
  get Util() {
    return FUtil.get();
  }
  /**
   * Add an event listener
   * @param {string} event key of event
   * @param {(params: IEventParamConfig[typeof event]) => void} callback callback when event triggered
   * @returns {Disposable} The Disposable instance, for remove the listener
   * @example
   * ```ts
   * // Add life cycle changed event listener
   * const disposable = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, (params) => {
   *   const { stage } = params;
   *   console.log('life cycle changed', params);
   * });
   *
   * // Remove the event listener, use `disposable.dispose()`
   * ```
   */
  addEvent(event, callback) {
    if (!event || !callback) throw new Error("Cannot add empty event");
    return this._eventRegistry.addEvent(event, callback);
  }
  /**
   * Fire an event, used in internal only.
   * @param {string} event key of event
   * @param {any} params params of event
   * @returns {boolean} should cancel
   * @example
   * ```ts
   * this.fireEvent(univerAPI.Event.LifeCycleChanged, params);
   * ```
   */
  fireEvent(event, params) {
    return this._eventRegistry.fireEvent(event, params);
  }
  getUserManager() {
    return this._injector.createInstance(FUserManager);
  }
  /**
   * Create a new blob.
   * @returns {FBlob} The new blob instance
   * @example
   * ```ts
   * const blob = univerAPI.newBlob();
   * ```
   */
  newBlob() {
    return this._injector.createInstance(FBlob, null);
  }
  /**
   * Create a new rich text.
   * @param {IDocumentData} data
   * @returns {RichTextBuilder} The new rich text instance
   * @example
   * ```ts
   * const richText = univerAPI.newRichText({ body: { dataStream: 'Hello World\r\n' } });
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const range = fWorksheet.getRange('A1');
   * range.setRichTextValueForCell(richText);
   * ```
   */
  newRichText(data) {
    return RichTextBuilder.create(data);
  }
  /**
   * Create a new rich text value.
   * @param {IDocumentData} data - The rich text data
   * @returns {RichTextValue} The new rich text value instance
   * @example
   * ```ts
   * const richTextValue = univerAPI.newRichTextValue({ body: { dataStream: 'Hello World\r\n' } });
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const range = fWorksheet.getRange('A1');
   * range.setRichTextValueForCell(richTextValue);
   * ```
   */
  newRichTextValue(data) {
    return RichTextValue.create(data);
  }
  /**
   * Create a new paragraph style.
   * @param {IParagraphStyle} style - The paragraph style
   * @returns {ParagraphStyleBuilder} The new paragraph style instance
   * @example
   * ```ts
   * const richText = univerAPI.newRichText({ body: { dataStream: 'Hello World\r\n' } });
   * const paragraphStyle = univerAPI.newParagraphStyle({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
   * richText.insertParagraph(paragraphStyle);
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const range = fWorksheet.getRange('A1');
   * range.setRichTextValueForCell(richText);
   * ```
   */
  newParagraphStyle(style) {
    return ParagraphStyleBuilder.create(style);
  }
  /**
   * Create a new paragraph style value.
   * @param {IParagraphStyle} style - The paragraph style
   * @returns {ParagraphStyleValue} The new paragraph style value instance
   * @example
   * ```ts
   * const paragraphStyleValue = univerAPI.newParagraphStyleValue();
   * ```
   */
  newParagraphStyleValue(style) {
    return ParagraphStyleValue.create(style);
  }
  /**
   * Create a new text style.
   * @param {ITextStyle} style - The text style
   * @returns {TextStyleBuilder} The new text style instance
   * @example
   * ```ts
   * const textStyle = univerAPI.newTextStyle();
   * ```
   */
  newTextStyle(style) {
    return TextStyleBuilder.create(style);
  }
  /**
   * Create a new text style value.
   * @param {ITextStyle} style - The text style
   * @returns {TextStyleValue} The new text style value instance
   * @example
   * ```ts
   * const textStyleValue = univerAPI.newTextStyleValue();
   * ```
   */
  newTextStyleValue(style) {
    return TextStyleValue.create(style);
  }
  /**
   * Create a new text decoration.
   * @param {ITextDecoration} decoration - The text decoration
   * @returns {TextDecorationBuilder} The new text decoration instance
   * @example
   * ```ts
   * const decoration = univerAPI.newTextDecoration();
   * ```
   */
  newTextDecoration(decoration) {
    return new TextDecorationBuilder(decoration);
  }
};
FUniver = __decorateClass([
  __decorateParam(0, Inject(Injector)),
  __decorateParam(1, ICommandService),
  __decorateParam(2, IUniverInstanceService),
  __decorateParam(3, Inject(LifecycleService))
], FUniver);

export {
  FBase,
  FBaseInitialable,
  FEnum,
  FEventName,
  FHooks,
  FUniver
};
