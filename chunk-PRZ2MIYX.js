import {
  SheetSkeletonManagerService,
  getCoordByCell
} from "./chunk-BHQGV2VJ.js";
import {
  Button,
  Checkbox,
  ComponentManager,
  CrossHighlightingIcon,
  FormDualColumnLayout,
  FormLayout,
  IDialogService,
  ILayoutService,
  IMenuManagerService,
  IMessageService,
  IShortcutService,
  Input,
  Pager,
  SearchIcon,
  Select,
  borderClassName,
  clsx,
  getMenuHiddenObservable,
  require_jsx_runtime,
  require_react,
  useDebounceFn,
  useDependency,
  useObservable
} from "./chunk-VNXQUZSG.js";
import {
  IRefSelectionsService,
  REF_SELECTIONS_ENABLED,
  SheetsSelectionsService
} from "./chunk-Q6Y4PHRI.js";
import {
  IRenderManagerService,
  RENDER_RAW_FORMULA_KEY,
  Rect,
  Shape
} from "./chunk-XOCU2XR6.js";
import {
  BehaviorSubject,
  ColorKit,
  Disposable,
  DisposableCollection,
  EDITOR_ACTIVATED,
  FOCUSING_SHEET,
  ICommandService,
  IConfigService,
  IConfirmService,
  IContextService,
  IUniverInstanceService,
  Inject,
  Injector,
  LocaleService,
  Plugin,
  Rectangle,
  RxDisposable,
  Subject,
  combineLatest,
  createIdentifier,
  debounceTime,
  fromEvent,
  map,
  merge,
  merge_default,
  startWith,
  takeUntil,
  tap,
  throttleTime,
  toDisposable
} from "./chunk-EJSPXROI.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField,
  __toESM
} from "./chunk-24OICD5T.js";

// ../packages/sheets-crosshair-highlight/package.json
var package_default = {
  name: "@univerjs/sheets-crosshair-highlight",
  version: "0.25.2",
  private: false,
  description: "Crosshair highlight plugin for Univer Sheets.",
  author: "DreamNum Co., Ltd. <developer@univer.ai>",
  license: "Apache-2.0",
  funding: {
    type: "opencollective",
    url: "https://opencollective.com/univer"
  },
  homepage: "https://univer.ai",
  repository: {
    type: "git",
    url: "https://github.com/dream-num/univer"
  },
  bugs: {
    url: "https://github.com/dream-num/univer/issues"
  },
  keywords: [
    "univer",
    "sheets",
    "crosshair",
    "highlight",
    "plugin"
  ],
  exports: {
    ".": "./src/index.ts",
    "./*": "./src/*",
    "./locale/*": "./src/locale/*.ts",
    "./facade": "./src/facade/index.ts"
  },
  main: "./src/index.ts",
  types: "./lib/types/index.d.ts",
  publishConfig: {
    access: "public",
    main: "./lib/es/index.js",
    module: "./lib/es/index.js",
    exports: {
      ".": {
        import: "./lib/es/index.js",
        require: "./lib/cjs/index.js",
        types: "./lib/types/index.d.ts"
      },
      "./*": {
        import: "./lib/es/*",
        require: "./lib/cjs/*",
        types: "./lib/types/index.d.ts"
      },
      "./locale/*": {
        import: "./lib/es/locale/*.js",
        require: "./lib/cjs/locale/*.js",
        types: "./lib/types/locale/*.d.ts"
      },
      "./facade": {
        import: "./lib/es/facade.js",
        require: "./lib/cjs/facade.js",
        types: "./lib/types/facade/index.d.ts"
      },
      "./lib/facade": {
        import: "./lib/es/facade.js",
        require: "./lib/cjs/facade.js",
        types: "./lib/types/facade/index.d.ts"
      },
      "./lib/*": "./lib/*"
    }
  },
  directories: {
    lib: "lib"
  },
  files: [
    "lib"
  ],
  scripts: {
    test: "vitest run",
    "test:watch": "vitest",
    coverage: "vitest run --coverage",
    typecheck: "tsc --noEmit",
    "build:bundle": "univer-cli build",
    "build:types": "tsc -p tsconfig.node.json",
    build: "pnpm run build:bundle && pnpm run build:types"
  },
  peerDependencies: {
    react: "^16.9.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc",
    rxjs: ">=7.0.0"
  },
  dependencies: {
    "@univerjs/core": "workspace:*",
    "@univerjs/design": "workspace:*",
    "@univerjs/engine-render": "workspace:*",
    "@univerjs/icons": "1.4.0",
    "@univerjs/sheets": "workspace:*",
    "@univerjs/sheets-ui": "workspace:*",
    "@univerjs/ui": "workspace:*"
  },
  devDependencies: {
    "@univerjs-infra/shared": "workspace:*",
    postcss: "^8.5.15",
    react: "18.3.1",
    rxjs: "^7.8.2",
    tailwindcss: "3.4.18",
    typescript: "^6.0.3",
    vitest: "^4.1.7"
  }
};

// ../packages/sheets-crosshair-highlight/src/config/config.ts
var SHEETS_CROSSHAIR_HIGHLIGHT_PLUGIN_CONFIG_KEY = "sheets-crosshair-highlight.config";
var configSymbol = Symbol(SHEETS_CROSSHAIR_HIGHLIGHT_PLUGIN_CONFIG_KEY);
var defaultPluginConfig = {};

// ../packages/sheets-crosshair-highlight/src/services/crosshair.service.ts
var CROSSHAIR_HIGHLIGHT_COLORS = [
  "rgba(158, 109, 227, 0.3)",
  "rgba(254, 75, 75, 0.3)",
  "rgba(255, 140, 81, 0.3)",
  "rgba(164, 220, 22, 0.3)",
  "rgba(45, 174, 255, 0.3)",
  "rgba(58, 96, 247, 0.3)",
  "rgba(242, 72, 166, 0.3)",
  "rgba(153, 153, 153, 0.3)",
  "rgba(158, 109, 227, 0.15)",
  "rgba(254, 75, 75, 0.15)",
  "rgba(255, 140, 81, 0.15)",
  "rgba(164, 220, 22, 0.15)",
  "rgba(45, 174, 255, 0.15)",
  "rgba(58, 96, 247, 0.15)",
  "rgba(242, 72, 166, 0.15)",
  "rgba(153, 153, 153, 0.15)"
];
var SheetsCrosshairHighlightService = class extends Disposable {
  constructor() {
    super(...arguments);
    __publicField(this, "_enabled$", new BehaviorSubject(false));
    __publicField(this, "enabled$", this._enabled$.asObservable());
    __publicField(this, "_color$", new BehaviorSubject(CROSSHAIR_HIGHLIGHT_COLORS[0]));
    __publicField(this, "color$", this._color$.asObservable());
  }
  get enabled() {
    return this._enabled$.getValue();
  }
  get color() {
    return this._color$.getValue();
  }
  dispose() {
    this._enabled$.complete();
  }
  setEnabled(value) {
    this._enabled$.next(value);
  }
  setColor(value) {
    this._color$.next(value);
  }
};

// ../packages/sheets-crosshair-highlight/src/commands/operations/operation.ts
var ToggleCrosshairHighlightOperation = {
  id: "sheet.operation.toggle-crosshair-highlight",
  type: 1 /* OPERATION */,
  handler(accessor) {
    const service = accessor.get(SheetsCrosshairHighlightService);
    const turnedOn = service.enabled;
    service.setEnabled(!turnedOn);
    return true;
  }
};
var SetCrosshairHighlightColorOperation = {
  id: "sheet.operation.set-crosshair-highlight-color",
  type: 1 /* OPERATION */,
  handler(accessor, { value }) {
    const service = accessor.get(SheetsCrosshairHighlightService);
    if (!service.enabled) service.setEnabled(true);
    service.setColor(value);
    return true;
  }
};
var EnableCrosshairHighlightOperation = {
  id: "sheet.operation.enable-crosshair-highlight",
  type: 1 /* OPERATION */,
  handler(accessor) {
    const service = accessor.get(SheetsCrosshairHighlightService);
    if (service.enabled) {
      return false;
    }
    service.setEnabled(true);
    return true;
  }
};
var DisableCrosshairHighlightOperation = {
  id: "sheet.operation.disable-crosshair-highlight",
  type: 1 /* OPERATION */,
  handler(accessor) {
    const service = accessor.get(SheetsCrosshairHighlightService);
    if (!service.enabled) {
      return false;
    }
    service.setEnabled(false);
    return true;
  }
};

// ../packages/sheets-crosshair-highlight/src/menu/crosshair.menu.ts
var CROSSHAIR_HIGHLIGHT_OVERLAY_COMPONENT = "CROSSHAIR_HIGHLIGHT_OVERLAY_COMPONENT";
function CrosshairHighlightMenuItemFactory(accessor) {
  const crosshairHighlightService = accessor.get(SheetsCrosshairHighlightService);
  return {
    id: ToggleCrosshairHighlightOperation.id,
    tooltip: "sheets-crosshair-highlight.button.tooltip",
    type: 2 /* BUTTON_SELECTOR */,
    icon: "CrossHighlightingIcon",
    selections: [
      {
        label: {
          name: CROSSHAIR_HIGHLIGHT_OVERLAY_COMPONENT,
          hoverable: false,
          selectable: false
        }
      }
    ],
    selectionsCommandId: SetCrosshairHighlightColorOperation.id,
    activated$: crosshairHighlightService.enabled$,
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */)
  };
}

// ../packages/sheets-crosshair-highlight/src/menu/schema.ts
var menuSchema = {
  ["contextMenu.footerMenu" /* FOOTER_MENU */]: {
    ["contextMenu.others" /* OTHERS */]: {
      [ToggleCrosshairHighlightOperation.id]: {
        order: 0,
        menuItemFactory: CrosshairHighlightMenuItemFactory
      }
    }
  }
};

// ../packages/sheets-crosshair-highlight/src/views/components/CrosshairHighlight.tsx
var import_react = __toESM(require_react());
var import_jsx_runtime = __toESM(require_jsx_runtime());
function CrosshairOverlay(props) {
  const { onChange } = props;
  const crosshairSrv = useDependency(SheetsCrosshairHighlightService);
  const currentColor = useObservable(crosshairSrv.color$);
  const handleColorPicked = (0, import_react.useCallback)((color) => {
    onChange == null ? void 0 : onChange(color);
  }, [onChange]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "univer-grid univer-grid-cols-8 univer-gap-x-2 univer-gap-y-3", children: CROSSHAIR_HIGHLIGHT_COLORS.map((color) => {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        className: clsx(`hover:univer-ring-primary-600/40 univer-box-border univer-size-5 univer-cursor-pointer univer-rounded univer-ring-offset-1 univer-transition-shadow hover:univer-ring-[1.5px]`, borderClassName, {
          "univer-ring-[1.5px] univer-ring-primary-600 hover:univer-ring-primary-600": color === currentColor
        }),
        style: { backgroundColor: color },
        onClick: () => handleColorPicked(color)
      },
      color
    );
  }) });
}

// ../packages/sheets-crosshair-highlight/src/controllers/crosshair.controller.ts
var SheetsCrosshairHighlightController = class extends Disposable {
  constructor(_componentMgr, _menuManagerService, _cmdSrv) {
    super();
    __publicField(this, "_componentMgr", _componentMgr);
    __publicField(this, "_menuManagerService", _menuManagerService);
    __publicField(this, "_cmdSrv", _cmdSrv);
    this._initCommands();
    this._initMenus();
    this._initComponents();
  }
  _initCommands() {
    [
      ToggleCrosshairHighlightOperation,
      SetCrosshairHighlightColorOperation,
      EnableCrosshairHighlightOperation,
      DisableCrosshairHighlightOperation
    ].forEach((c) => this._cmdSrv.registerCommand(c));
  }
  _initMenus() {
    this._menuManagerService.mergeMenu(menuSchema);
  }
  _initComponents() {
    this._componentMgr.register(CROSSHAIR_HIGHLIGHT_OVERLAY_COMPONENT, CrosshairOverlay);
    this._componentMgr.register("CrossHighlightingIcon", CrossHighlightingIcon);
  }
};
SheetsCrosshairHighlightController = __decorateClass([
  __decorateParam(0, Inject(ComponentManager)),
  __decorateParam(1, IMenuManagerService),
  __decorateParam(2, ICommandService)
], SheetsCrosshairHighlightController);

// ../packages/sheets-crosshair-highlight/src/const.ts
var SHEETS_CROSSHAIR_HIGHLIGHT_Z_INDEX = 1;

// ../packages/sheets-crosshair-highlight/src/util.ts
var CrossHairRangeCollection = class {
  constructor() {
    __publicField(this, "_selectedRanges", []);
    __publicField(this, "_ranges", []);
  }
  addRange(range) {
    if (range.rangeType === 2 /* COLUMN */ || range.rangeType === 1 /* ROW */ || range.rangeType === 3 /* ALL */) {
      return;
    }
    const intersects = this._getIntersects(range);
    const splitRanges = this._getSplitRanges(range, intersects);
    if (splitRanges.length > 0) {
      this._ranges.push(...splitRanges);
    }
  }
  setSelectedRanges(selectedRange) {
    this._selectedRanges = selectedRange;
  }
  _getSplitRanges(range, intersects) {
    let splitRanges = [range];
    for (const intersect of intersects.concat(this._selectedRanges)) {
      const newRanges = [];
      for (const splitRange of splitRanges) {
        const split = Rectangle.subtract(splitRange, intersect);
        if (split && split.length > 0) {
          newRanges.push(...split);
        }
      }
      splitRanges = newRanges;
    }
    return splitRanges.filter((range2) => range2.startRow <= range2.endRow && range2.startColumn <= range2.endColumn);
  }
  _getIntersects(addRange) {
    const intersects = [];
    for (const range of this._ranges) {
      const intersect = Rectangle.getIntersects(range, addRange);
      if (intersect) {
        intersects.push(intersect);
      }
    }
    return intersects;
  }
  getRanges() {
    return this._ranges;
  }
  reset() {
    this._ranges = [];
    this._selectedRanges = [];
  }
};

// ../packages/sheets-crosshair-highlight/src/views/widgets/crosshair-highlight-shape.ts
var SheetCrossHairHighlightShape = class extends Shape {
  constructor(key, props) {
    super(key, props);
    // protected _showHighLight = false;
    __publicField(this, "_color");
    if (props) {
      this.setShapeProps(props);
    }
  }
  setShapeProps(props) {
    if (typeof props.color !== "undefined") {
      this._color = props.color;
    }
    this.transformByState({
      width: props.width,
      height: props.height
    });
  }
  _draw(ctx) {
    var _a, _b;
    const color = `rgba(${this._color.r}, ${this._color.g}, ${this._color.b}, ${(_b = (_a = this._color) == null ? void 0 : _a.a) != null ? _b : 0.5})`;
    Rect.drawWith(ctx, {
      width: this.width,
      height: this.height,
      fill: color,
      stroke: void 0,
      strokeWidth: 0,
      evented: false
    });
  }
};

// ../packages/sheets-crosshair-highlight/src/views/widgets/crosshair-highlight.render-controller.ts
var SheetCrosshairHighlightRenderController = class extends Disposable {
  constructor(_context, _sheetSkeletonManagerService, _sheetsSelectionsService, _sheetsCrosshairHighlightService, _contextService, _refSelectionsService) {
    super();
    __publicField(this, "_context", _context);
    __publicField(this, "_sheetSkeletonManagerService", _sheetSkeletonManagerService);
    __publicField(this, "_sheetsSelectionsService", _sheetsSelectionsService);
    __publicField(this, "_sheetsCrosshairHighlightService", _sheetsCrosshairHighlightService);
    __publicField(this, "_contextService", _contextService);
    __publicField(this, "_refSelectionsService", _refSelectionsService);
    __publicField(this, "_shapes", []);
    __publicField(this, "_rangeCollection", new CrossHairRangeCollection());
    __publicField(this, "_color", "rgba(255,0,0,0.5)");
    this._initRenderListener();
  }
  _transformSelection(selectionData, sheet) {
    if (!selectionData) {
      return;
    }
    const rowCount = sheet.getRowCount();
    const columnCount = sheet.getColumnCount();
    const ranges = [];
    for (const selection of selectionData) {
      const { startRow, endRow, startColumn, endColumn } = selection.range;
      if (endRow - startRow + 1 === rowCount || endColumn - startColumn + 1 === columnCount) {
        continue;
      }
      ranges.push(selection.range);
    }
    this._rangeCollection.setSelectedRanges(ranges);
    for (const range of ranges) {
      this.addSelection(range, sheet);
    }
  }
  _initRenderListener() {
    const workbook = this._context.unit;
    this.disposeWithMe(combineLatest([
      this._contextService.subscribeContextValue$(REF_SELECTIONS_ENABLED).pipe(startWith(false)),
      this._sheetSkeletonManagerService.currentSkeleton$,
      this._sheetsCrosshairHighlightService.enabled$,
      this._sheetsCrosshairHighlightService.color$.pipe(tap((color) => this._color = color)),
      merge(
        this._sheetsSelectionsService.selectionMoveStart$,
        this._sheetsSelectionsService.selectionMoving$,
        this._sheetsSelectionsService.selectionMoveEnd$,
        this._sheetsSelectionsService.selectionSet$,
        workbook.activeSheet$.pipe(map(() => this._sheetsSelectionsService.getCurrentSelections()))
      ),
      merge(
        this._refSelectionsService.selectionMoveStart$,
        this._refSelectionsService.selectionMoving$,
        this._refSelectionsService.selectionMoveEnd$,
        this._sheetsSelectionsService.selectionSet$,
        workbook.activeSheet$.pipe(map(() => this._refSelectionsService.getCurrentSelections()))
      )
    ]).subscribe(([refSelectionEnabled, _, enabled, _color, normalSelections, refSelection]) => {
      this._clear();
      if (!enabled) return;
      const selections = refSelectionEnabled ? refSelection : normalSelections;
      this._rangeCollection.reset();
      this._transformSelection(selections, workbook.getActiveSheet());
      this.render(this._rangeCollection.getRanges());
    }));
  }
  addSelection(range, sheet) {
    if (range.rangeType === 2 /* COLUMN */ || range.rangeType === 1 /* ROW */ || range.rangeType === 3 /* ALL */) {
      return;
    }
    const maxRow = sheet.getRowCount();
    const maxColumn = sheet.getColumnCount();
    const { startRow, endRow, startColumn, endColumn } = range;
    const left = {
      startRow,
      endRow,
      startColumn: 0,
      endColumn: startColumn - 1
    };
    const right = {
      startRow,
      endRow,
      startColumn: endColumn + 1,
      endColumn: maxColumn
    };
    const top = {
      startRow: 0,
      endRow: startRow - 1,
      startColumn,
      endColumn
    };
    const bottom = {
      startRow: endRow + 1,
      endRow: maxRow,
      startColumn,
      endColumn
    };
    for (const range2 of [left, right, top, bottom]) {
      if (range2.startRow <= range2.endRow && range2.startColumn <= range2.endColumn) {
        this._rangeCollection.addRange(range2);
      }
    }
  }
  _clear() {
    this._shapes.forEach((shape) => {
      shape.dispose();
    });
    this._shapes = [];
  }
  _addShapes(range, index, scene, skeleton) {
    const { startRow, endRow, startColumn, endColumn } = range;
    const startPosition = getCoordByCell(startRow, startColumn, scene, skeleton);
    const endPosition = getCoordByCell(endRow, endColumn, scene, skeleton);
    const { startX, startY } = startPosition;
    const { endX, endY } = endPosition;
    const width = endX - startX;
    const height = endY - startY;
    const shapeProps = {
      left: startX,
      top: startY,
      color: new ColorKit(this._color).toRgb(),
      width,
      height,
      zIndex: SHEETS_CROSSHAIR_HIGHLIGHT_Z_INDEX,
      evented: false
    };
    const currentShapes = new SheetCrossHairHighlightShape(`crosshair-${index}`, shapeProps);
    this._shapes.push(currentShapes);
    scene.addObject(currentShapes);
  }
  render(ranges) {
    const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
    if (!skeleton) {
      return;
    }
    const { scene } = this._context;
    this._clear();
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];
      this._addShapes(range, i, scene, skeleton);
    }
    scene.makeDirty(true);
  }
  async dispose() {
    super.dispose();
  }
};
SheetCrosshairHighlightRenderController = __decorateClass([
  __decorateParam(1, Inject(SheetSkeletonManagerService)),
  __decorateParam(2, Inject(SheetsSelectionsService)),
  __decorateParam(3, Inject(SheetsCrosshairHighlightService)),
  __decorateParam(4, Inject(IContextService)),
  __decorateParam(5, IRefSelectionsService)
], SheetCrosshairHighlightRenderController);

// ../packages/sheets-crosshair-highlight/src/plugin.ts
var UniverSheetsCrosshairHighlightPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig, _injector, _renderManagerService, _configService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_configService", _configService);
    const { ...rest } = merge_default(
      {},
      defaultPluginConfig,
      this._config
    );
    this._configService.setConfig(SHEETS_CROSSHAIR_HIGHLIGHT_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    [
      [SheetsCrosshairHighlightService],
      [SheetsCrosshairHighlightController]
    ].forEach((d) => this._injector.add(d));
  }
  onReady() {
    [
      [SheetCrosshairHighlightRenderController]
    ].forEach((d) => this._injector.add(d));
    this._injector.get(SheetsCrosshairHighlightController);
    this._renderManagerService.registerRenderModule(2 /* UNIVER_SHEET */, [SheetCrosshairHighlightRenderController]);
  }
};
__publicField(UniverSheetsCrosshairHighlightPlugin, "pluginName", "SHEET_CROSSHAIR_HIGHLIGHT_PLUGIN");
__publicField(UniverSheetsCrosshairHighlightPlugin, "packageName", package_default.name);
__publicField(UniverSheetsCrosshairHighlightPlugin, "version", package_default.version);
__publicField(UniverSheetsCrosshairHighlightPlugin, "type", 2 /* UNIVER_SHEET */);
UniverSheetsCrosshairHighlightPlugin = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IRenderManagerService),
  __decorateParam(3, IConfigService)
], UniverSheetsCrosshairHighlightPlugin);

// ../packages/find-replace/package.json
var package_default2 = {
  name: "@univerjs/find-replace",
  version: "0.25.2",
  private: false,
  description: "Shared find and replace services and UI infrastructure for Univer.",
  author: "DreamNum Co., Ltd. <developer@univer.ai>",
  license: "Apache-2.0",
  funding: {
    type: "opencollective",
    url: "https://opencollective.com/univer"
  },
  homepage: "https://univer.ai",
  repository: {
    type: "git",
    url: "https://github.com/dream-num/univer"
  },
  bugs: {
    url: "https://github.com/dream-num/univer/issues"
  },
  keywords: [
    "univer",
    "find-replace",
    "search",
    "replace",
    "plugin"
  ],
  exports: {
    ".": "./src/index.ts",
    "./*": "./src/*",
    "./locale/*": "./src/locale/*.ts"
  },
  main: "./src/index.ts",
  types: "./lib/types/index.d.ts",
  publishConfig: {
    access: "public",
    main: "./lib/es/index.js",
    module: "./lib/es/index.js",
    exports: {
      ".": {
        import: "./lib/es/index.js",
        require: "./lib/cjs/index.js",
        types: "./lib/types/index.d.ts"
      },
      "./*": {
        import: "./lib/es/*",
        require: "./lib/cjs/*",
        types: "./lib/types/index.d.ts"
      },
      "./locale/*": {
        import: "./lib/es/locale/*.js",
        require: "./lib/cjs/locale/*.js",
        types: "./lib/types/locale/*.d.ts"
      },
      "./lib/*": "./lib/*"
    }
  },
  directories: {
    lib: "lib"
  },
  files: [
    "lib"
  ],
  scripts: {
    test: "vitest run",
    "test:watch": "vitest",
    coverage: "vitest run --coverage",
    typecheck: "tsc --noEmit",
    "build:bundle": "univer-cli build",
    "build:types": "tsc -p tsconfig.node.json",
    build: "pnpm run build:bundle && pnpm run build:types"
  },
  peerDependencies: {
    react: "^16.9.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc",
    rxjs: ">=7.0.0"
  },
  dependencies: {
    "@univerjs/core": "workspace:*",
    "@univerjs/design": "workspace:*",
    "@univerjs/engine-render": "workspace:*",
    "@univerjs/icons": "1.4.0",
    "@univerjs/ui": "workspace:*"
  },
  devDependencies: {
    "@univerjs-infra/shared": "workspace:*",
    postcss: "^8.5.15",
    react: "18.3.1",
    rxjs: "^7.8.2",
    tailwindcss: "3.4.18",
    typescript: "^6.0.3",
    vitest: "^4.1.7"
  }
};

// ../packages/find-replace/src/config/config.ts
var FIND_REPLACE_PLUGIN_CONFIG_KEY = "find-replace.config";
var configSymbol2 = Symbol(FIND_REPLACE_PLUGIN_CONFIG_KEY);
var defaultPluginConfig2 = {};

// ../packages/find-replace/src/services/context-keys.ts
var FIND_REPLACE_INPUT_FOCUS = "FIND_REPLACE_INPUT_FOCUS";
var FIND_REPLACE_DIALOG_FOCUS = "FIND_REPLACE_DIALOG_FOCUS";
var FIND_REPLACE_REPLACE_REVEALED = "FIND_REPLACE_REPLACE_REVEALED";

// ../packages/find-replace/src/services/find-replace.service.ts
var FindModel = class extends Disposable {
};
var IFindReplaceService = createIdentifier("find-replace.service");
function shouldStateUpdateTriggerResearch(statusUpdate) {
  if (typeof statusUpdate.findString !== "undefined") return true;
  if (typeof statusUpdate.inputtingFindString !== "undefined") return true;
  if (typeof statusUpdate.findDirection !== "undefined") return true;
  if (typeof statusUpdate.matchesTheWholeCell !== "undefined") return true;
  if (typeof statusUpdate.caseSensitive !== "undefined") return true;
  if (typeof statusUpdate.findScope !== "undefined") return true;
  if (typeof statusUpdate.findBy !== "undefined") return true;
  return false;
}
var FindReplaceModel = class extends Disposable {
  constructor(_state, _providers, _univerInstanceService, _commandService) {
    super();
    __publicField(this, "_state", _state);
    __publicField(this, "_providers", _providers);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "currentMatch$", new BehaviorSubject(null));
    __publicField(this, "replaceables$", new BehaviorSubject([]));
    /** All find models returned by providers. */
    __publicField(this, "_findModels", []);
    /** The find model that the current match is from. */
    __publicField(this, "_matchingModel", null);
    __publicField(this, "_matches", []);
    __publicField(this, "_currentSearchingDisposables", null);
    this.disposeWithMe(
      this._state.stateUpdates$.pipe(throttleTime(200, void 0, { leading: true, trailing: true })).subscribe(async (stateUpdate) => {
        const state = this._state.state;
        if (shouldStateUpdateTriggerResearch(stateUpdate)) {
          if (state.findString !== "" && !state.replaceRevealed) {
            await this._startSearching();
            this._state.changeState({ findCompleted: true });
          } else if (stateUpdate.replaceRevealed !== true) {
            this._stopSearching();
          }
        }
      })
    );
  }
  get searched() {
    return this._findModels.length > 0;
  }
  dispose() {
    super.dispose();
    this._stopSearching();
    this.currentMatch$.complete();
    this.replaceables$.complete();
    this._state.changeState({ ...createInitFindReplaceState(), revealed: false });
  }
  async start() {
    if (!this._state.findString) {
      return { results: [] };
    }
    const complete = await this._startSearching();
    this._state.changeState({ findCompleted: true });
    return complete;
  }
  focusSelection() {
    var _a;
    (_a = this._matchingModel) == null ? void 0 : _a.focusSelection();
  }
  /** Call this method to start a `searching`. */
  async _startSearching() {
    if (!this._state.findString) {
      return { results: [] };
    }
    const providers = Array.from(this._providers);
    const findModels = this._findModels = (await Promise.all(providers.map((provider) => provider.find({
      findString: this._state.findString,
      findDirection: this._state.findDirection,
      findScope: this._state.findScope,
      findBy: this._state.findBy,
      replaceRevealed: this._state.replaceRevealed,
      caseSensitive: this._state.caseSensitive,
      matchesTheWholeCell: this._state.matchesTheWholeCell
    })))).flat();
    this._subscribeToModelsChanges(findModels);
    const newMatches = this._matches = findModels.map((c) => c.getMatches()).flat();
    this.replaceables$.next(newMatches.filter((m) => m.replaceable));
    if (!newMatches.length) {
      this._state.changeState({ matchesCount: 0, matchesPosition: 0 });
      return { results: [] };
    }
    this._moveToInitialMatch(findModels);
    this._state.changeState({ matchesCount: newMatches.length });
    return { results: newMatches };
  }
  /** Terminate the current searching session, when searching string is empty. */
  _stopSearching() {
    var _a;
    this._providers.forEach((provider) => provider.terminate());
    this._findModels = [];
    this._matches = [];
    this._matchingModel = null;
    (_a = this._currentSearchingDisposables) == null ? void 0 : _a.dispose();
    this._currentSearchingDisposables = null;
    this.currentMatch$.next(null);
    this.replaceables$.next([]);
    this._state.changeState({
      findCompleted: false,
      matchesCount: 0,
      matchesPosition: 0
    });
  }
  // When a document's content changes, we should reset all matches and try to move to the next match.
  _subscribeToModelsChanges(models) {
    const disposables = this._currentSearchingDisposables = new DisposableCollection();
    const matchesUpdateSubscription = combineLatest(models.map((model) => model.matchesUpdate$)).pipe(debounceTime(220)).subscribe(([...allMatches]) => {
      const newMatches = this._matches = allMatches.flat();
      if (newMatches.length) {
        this._moveToInitialMatch(this._findModels, true);
        this._state.changeState({ matchesCount: newMatches.length });
        this.replaceables$.next(newMatches.filter((m) => m.replaceable));
      } else {
        this._state.changeState({ matchesCount: 0, matchesPosition: 0 });
        this.replaceables$.next([]);
      }
    });
    models.forEach((model) => disposables.add(toDisposable(model.activelyChangingMatch$.subscribe((match) => {
      const index = this._matches.findIndex((m) => m === match);
      this._state.changeState({ matchesPosition: index + 1 });
    }))));
    disposables.add(toDisposable(matchesUpdateSubscription));
  }
  async replace() {
    if (!this._matchingModel) {
      return false;
    }
    return this._matchingModel.replace(this._state.replaceString);
  }
  async replaceAll() {
    const result = await Promise.all(this._findModels.map((m) => m.replaceAll(this._state.replaceString))).then((results) => results.reduce((acc, cur) => {
      acc.success += cur.success;
      acc.failure += cur.failure;
      return acc;
    }, { success: 0, failure: 0 }));
    if (result.failure === 0) {
      this._stopSearching();
    }
    return result;
  }
  getCurrentMatch() {
    return this._state.matchesPosition > 0 ? this._matches[this._state.matchesPosition - 1] : null;
  }
  _markMatch(match) {
    const index = this._matches.findIndex((value) => value === match);
    this.currentMatch$.next(match);
    this._state.changeState({ matchesPosition: index + 1 });
  }
  moveToNextMatch() {
    if (!this._matchingModel) {
      return;
    }
    const loopInCurrentUnit = this._findModels.length === 1;
    const nextMatch = this._matchingModel.moveToNextMatch({ loop: loopInCurrentUnit });
    if (nextMatch) {
      this._markMatch(nextMatch);
      return nextMatch;
    } else {
      const currentModelIndex = this._findModels.findIndex((m) => m === this._matchingModel);
      return this._moveToNextUnitMatch(currentModelIndex);
    }
  }
  _moveToNextUnitMatch(startingIndex) {
    const l = this._findModels.length;
    for (let i = (startingIndex + 1) % l; i !== startingIndex; ) {
      const nextPositionModel = this._findModels[i];
      const nextMatch = nextPositionModel.moveToNextMatch({ ignoreSelection: true });
      if (nextMatch) {
        this._matchingModel = nextPositionModel;
        this._markMatch(nextMatch);
        return nextMatch;
      }
      i = (i + 1) % l;
    }
    if (this._matchingModel) {
      const nextMatch = this._matchingModel.moveToNextMatch({ ignoreSelection: true });
      if (nextMatch) this._markMatch(nextMatch);
      return nextMatch;
    }
  }
  moveToPreviousMatch() {
    if (!this._matchingModel) {
      return;
    }
    const loopInCurrentUnit = this._findModels.length === 1;
    const nextMatch = this._matchingModel.moveToPreviousMatch({ loop: loopInCurrentUnit });
    if (nextMatch) {
      const index = this._matches.findIndex((value) => value === nextMatch);
      this.currentMatch$.next(nextMatch);
      this._state.changeState({ matchesPosition: index + 1 });
      return nextMatch;
    } else {
      const l = this._findModels.length;
      const currentModelIndex = this._findModels.findIndex((m) => m === this._matchingModel);
      for (let i = (currentModelIndex - 1 + l) % l; i !== currentModelIndex; ) {
        const nextPositionModel = this._findModels[i];
        const nextMatch3 = nextPositionModel.moveToPreviousMatch({ ignoreSelection: true });
        if (nextMatch3) {
          this._matchingModel = nextPositionModel;
          this._markMatch(nextMatch3);
          return nextMatch3;
        }
        i = (i - 1) % l;
      }
      const nextMatch2 = this._matchingModel.moveToPreviousMatch({ ignoreSelection: true });
      if (nextMatch2) this._markMatch(nextMatch2);
      return nextMatch2;
    }
  }
  _moveToInitialMatch(findModels, noFocus = false) {
    var _a;
    const focusedUnitId = (_a = this._univerInstanceService.getFocusedUnit()) == null ? void 0 : _a.getUnitId();
    if (!focusedUnitId) {
      return -1;
    }
    const i = findModels.findIndex((model) => model.unitId === focusedUnitId);
    if (i !== -1) {
      this._matchingModel = findModels[i];
      const nextMatch = this._matchingModel.moveToNextMatch({ stayIfOnMatch: true, noFocus });
      if (nextMatch) {
        this._markMatch(nextMatch);
        return i;
      }
    }
    this._moveToNextUnitMatch(i);
    return 0;
  }
};
FindReplaceModel = __decorateClass([
  __decorateParam(2, IUniverInstanceService),
  __decorateParam(3, ICommandService)
], FindReplaceModel);
function createInitFindReplaceState() {
  return {
    caseSensitive: false,
    findBy: "value" /* VALUE */,
    findCompleted: false,
    findDirection: "row" /* ROW */,
    findScope: "subunit" /* SUBUNIT */,
    findString: "",
    inputtingFindString: "",
    matchesCount: 0,
    matchesPosition: 0,
    matchesTheWholeCell: false,
    replaceRevealed: false,
    replaceString: "",
    revealed: true
  };
}
var FindReplaceState = class {
  constructor() {
    __publicField(this, "_stateUpdates$", new Subject());
    __publicField(this, "stateUpdates$", this._stateUpdates$.asObservable());
    __publicField(this, "_state$", new BehaviorSubject(createInitFindReplaceState()));
    __publicField(this, "state$", this._state$.asObservable());
    __publicField(this, "_findString", "");
    __publicField(this, "_inputtingFindString", "");
    __publicField(this, "_replaceString", "");
    __publicField(this, "_revealed", false);
    __publicField(this, "_replaceRevealed", false);
    __publicField(this, "_matchesPosition", 0);
    __publicField(this, "_matchesCount", 0);
    __publicField(this, "_caseSensitive", true);
    __publicField(this, "_matchesTheWholeCell", false);
    __publicField(this, "_findDirection", "row" /* ROW */);
    __publicField(this, "_findScope", "subunit" /* SUBUNIT */);
    __publicField(this, "_findBy", "value" /* VALUE */);
    __publicField(this, "_findCompleted", false);
  }
  get state() {
    return this._state$.getValue();
  }
  get inputtingFindString() {
    return this._inputtingFindString;
  }
  get findString() {
    return this._findString;
  }
  get revealed() {
    return this._revealed;
  }
  get replaceRevealed() {
    return this._replaceRevealed;
  }
  get matchesPosition() {
    return this._matchesPosition;
  }
  get matchesCount() {
    return this._matchesCount;
  }
  get replaceString() {
    return this._replaceString;
  }
  get caseSensitive() {
    return this._caseSensitive;
  }
  get matchesTheWholeCell() {
    return this._matchesTheWholeCell;
  }
  get findDirection() {
    return this._findDirection;
  }
  get findScope() {
    return this._findScope;
  }
  get findBy() {
    return this._findBy;
  }
  get findCompleted() {
    return this._findCompleted;
  }
  // eslint-disable-next-line max-lines-per-function, complexity
  changeState(changes) {
    let changed = false;
    const changedState = {};
    if (typeof changes.findString !== "undefined" && changes.findString !== this._findString) {
      this._findString = changes.findString;
      changedState.findString = this._findString;
      changed = true;
    }
    if (typeof changes.revealed !== "undefined" && changes.revealed !== this._revealed) {
      this._revealed = changes.revealed;
      changedState.revealed = changes.revealed;
      changed = true;
    }
    if (typeof changes.replaceRevealed !== "undefined" && changes.replaceRevealed !== this._replaceRevealed) {
      this._replaceRevealed = changes.replaceRevealed;
      changedState.replaceRevealed = changes.replaceRevealed;
      changed = true;
    }
    if (typeof changes.replaceString !== "undefined" && changes.replaceString !== this._replaceString) {
      this._replaceString = changes.replaceString;
      changedState.replaceString = changes.replaceString;
      changed = true;
    }
    if (typeof changes.matchesCount !== "undefined" && changes.matchesCount !== this._matchesCount) {
      this._matchesCount = changes.matchesCount;
      changedState.matchesCount = changes.matchesCount;
      changed = true;
    }
    if (typeof changes.matchesPosition !== "undefined" && changes.matchesPosition !== this._matchesPosition) {
      this._matchesPosition = changes.matchesPosition;
      changedState.matchesPosition = changes.matchesPosition;
      changed = true;
    }
    if (typeof changes.findBy !== "undefined" && changes.findBy !== this._findBy) {
      this._findBy = changes.findBy;
      changedState.findBy = changes.findBy;
      changed = true;
    }
    if (typeof changes.findScope !== "undefined" && changes.findScope !== this._findScope) {
      this._findScope = changes.findScope;
      changedState.findScope = changes.findScope;
      changed = true;
    }
    if (typeof changes.findDirection !== "undefined" && changes.findDirection !== this._findDirection) {
      this._findDirection = changes.findDirection;
      changedState.findDirection = changes.findDirection;
      changed = true;
    }
    if (typeof changes.caseSensitive !== "undefined" && changes.caseSensitive !== this._caseSensitive) {
      this._caseSensitive = changes.caseSensitive;
      changedState.caseSensitive = changes.caseSensitive;
      changed = true;
    }
    if (typeof changes.matchesTheWholeCell !== "undefined" && changes.matchesTheWholeCell !== this._matchesTheWholeCell) {
      this._matchesTheWholeCell = changes.matchesTheWholeCell;
      changedState.matchesTheWholeCell = changes.matchesTheWholeCell;
      changed = true;
    }
    if (typeof changes.inputtingFindString !== "undefined" && changes.inputtingFindString !== this._inputtingFindString) {
      this._inputtingFindString = changes.inputtingFindString;
      changedState.inputtingFindString = changes.inputtingFindString;
      changed = true;
    }
    if (typeof changes.findCompleted !== "undefined" && changes.findCompleted !== this._findCompleted) {
      this._findCompleted = changes.findCompleted;
      changedState.findCompleted = changes.findCompleted;
      changed = true;
    }
    if (changed) {
      this._state$.next({
        caseSensitive: this._caseSensitive,
        findBy: this._findBy,
        findCompleted: this._findCompleted,
        findDirection: this._findDirection,
        findScope: this._findScope,
        findString: this._findString,
        inputtingFindString: this._inputtingFindString,
        matchesCount: this._matchesCount,
        matchesPosition: this._matchesPosition,
        matchesTheWholeCell: this._matchesTheWholeCell,
        replaceRevealed: this._replaceRevealed,
        revealed: this._revealed
      });
      this._stateUpdates$.next(changedState);
    }
  }
};
var FindReplaceService = class extends Disposable {
  constructor(_injector, _contextService) {
    super();
    __publicField(this, "_injector", _injector);
    __publicField(this, "_contextService", _contextService);
    __publicField(this, "_providers", /* @__PURE__ */ new Set());
    __publicField(this, "_state", new FindReplaceState());
    __publicField(this, "_model");
    __publicField(this, "_modelDisposables", null);
    __publicField(this, "_currentMatch$", new BehaviorSubject(null));
    __publicField(this, "currentMatch$", this._currentMatch$.asObservable());
    __publicField(this, "_replaceables$", new BehaviorSubject([]));
    __publicField(this, "replaceables$", this._replaceables$.asObservable());
    __publicField(this, "_focusSignal$", new Subject());
    __publicField(this, "focusSignal$", this._focusSignal$.asObservable());
  }
  get stateUpdates$() {
    return this._state.stateUpdates$;
  }
  get state$() {
    return this._state.state$;
  }
  get revealed() {
    return this._state.revealed;
  }
  get replaceRevealed() {
    return this._state.replaceRevealed;
  }
  dispose() {
    super.dispose();
    this._currentMatch$.next(null);
    this._currentMatch$.complete();
    this._replaceables$.next([]);
    this._replaceables$.complete();
    this._focusSignal$.complete();
  }
  getProviders() {
    return this._providers;
  }
  getCurrentMatch() {
    var _a;
    return (_a = this._model) == null ? void 0 : _a.getCurrentMatch();
  }
  getFindString() {
    return this._state.findString;
  }
  changeFindString(findString) {
    this._state.changeState({ findString });
  }
  focusFindInput() {
    this._focusSignal$.next();
  }
  changeInputtingFindString(value) {
    if (value) {
      this._state.changeState({ inputtingFindString: value });
    } else {
      this._state.changeState({ inputtingFindString: "", findString: "" });
    }
  }
  changeReplaceString(replaceString) {
    this._state.changeState({ replaceString });
  }
  changeMatchesTheWholeCell(matchesTheWholeCell) {
    this._state.changeState({ matchesTheWholeCell });
  }
  changeCaseSensitive(caseSensitive) {
    this._state.changeState({ caseSensitive });
  }
  changeFindBy(findBy) {
    this._state.changeState({ findBy });
    this._toggleDisplayRawFormula(findBy === "formula" /* FORMULA */);
  }
  changeFindScope(scope) {
    this._state.changeState({ findScope: scope });
  }
  changeFindDirection(direction) {
    this._state.changeState({ findDirection: direction });
  }
  moveToNextMatch() {
    if (!this._model) {
      return;
    }
    if (this._state.replaceRevealed && !this._model.searched) {
      this._state.changeState({ findString: this._state.inputtingFindString });
      this._model.start();
    } else {
      this._model.moveToNextMatch();
    }
    this._focusSignal$.next();
  }
  moveToPreviousMatch() {
    if (!this._model) {
      return;
    }
    if (this._state.replaceRevealed && !this._model.searched) {
      this._state.changeState({ findString: this._state.inputtingFindString });
      this._model.start();
    } else {
      this._model.moveToPreviousMatch();
    }
    this._focusSignal$.next();
  }
  async replace() {
    if (!this._model) {
      return false;
    }
    return this._model.replace();
  }
  async replaceAll() {
    if (!this._model) {
      throw new Error("[FindReplaceService] replaceAll: model is not initialized!");
    }
    return this._model.replaceAll();
  }
  revealReplace() {
    this._state.changeState({ replaceRevealed: true, inputtingFindString: this._state.findString });
    this._toggleRevealReplace(true);
  }
  focusSelection() {
    var _a;
    (_a = this._model) == null ? void 0 : _a.focusSelection();
  }
  start(revealReplace = false) {
    if (this._providers.size === 0) {
      return false;
    }
    this._model = this._injector.createInstance(FindReplaceModel, this._state, this._providers);
    this._modelDisposables = new DisposableCollection();
    this._modelDisposables.add(toDisposable(this._model.currentMatch$.subscribe((match) => this._currentMatch$.next(match))));
    this._modelDisposables.add(toDisposable(this._model.replaceables$.subscribe((replaceables) => this._replaceables$.next(replaceables))));
    const newState = createInitFindReplaceState();
    if (revealReplace) {
      newState.replaceRevealed = true;
    }
    this._state.changeState(newState);
    this._toggleRevealReplace(revealReplace);
    return true;
  }
  find() {
    var _a;
    (_a = this._model) == null ? void 0 : _a.start();
  }
  terminate() {
    var _a, _b;
    (_a = this._model) == null ? void 0 : _a.dispose();
    this._model = null;
    (_b = this._modelDisposables) == null ? void 0 : _b.dispose();
    this._modelDisposables = null;
    this._toggleDisplayRawFormula(false);
    this._toggleRevealReplace(false);
  }
  registerFindReplaceProvider(provider) {
    this._providers.add(provider);
    return toDisposable(() => this._providers.delete(provider));
  }
  _toggleRevealReplace(revealReplace) {
    this._contextService.setContextValue(FIND_REPLACE_REPLACE_REVEALED, revealReplace);
  }
  _toggleDisplayRawFormula(force) {
    this._contextService.setContextValue(RENDER_RAW_FORMULA_KEY, force);
  }
};
FindReplaceService = __decorateClass([
  __decorateParam(0, Inject(Injector)),
  __decorateParam(1, IContextService)
], FindReplaceService);

// ../packages/find-replace/src/commands/commands/replace.command.ts
var ReplaceCurrentMatchCommand = {
  id: "ui.command.replace-current-match",
  type: 0 /* COMMAND */,
  handler: (accessor) => {
    const findReplaceService = accessor.get(IFindReplaceService);
    return findReplaceService.replace();
  }
};
var CONFIRM_REPLACE_ALL_ID = "CONFIRM_REPLACE_ALL";
var ReplaceAllMatchesCommand = {
  id: "ui.command.replace-all-matches",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    const confirmService = accessor.get(IConfirmService);
    const localeService = accessor.get(LocaleService);
    const messageService = accessor.get(IMessageService);
    if (!await confirmService.confirm({
      id: CONFIRM_REPLACE_ALL_ID,
      title: { title: localeService.t("find-replace.replace.confirm.title") },
      cancelText: localeService.t("find-replace.button.cancel"),
      confirmText: localeService.t("find-replace.button.confirm")
    })) {
      return false;
    }
    const findReplaceService = accessor.get(IFindReplaceService);
    const result = await findReplaceService.replaceAll();
    const { success, failure } = result;
    if (failure > 0) {
      if (success === 0) {
        messageService.show({
          type: "error" /* Error */,
          content: localeService.t("find-replace.replace.all-failure")
        });
      } else {
        messageService.show({
          type: "warning" /* Warning */,
          content: localeService.t("find-replace.replace.partial-success", `${success}`, `${failure}`)
        });
      }
      return false;
    }
    messageService.show({
      type: "success" /* Success */,
      content: localeService.t("find-replace.replace.all-success", `${success}`)
    });
    return true;
  }
};

// ../packages/find-replace/src/commands/operations/find-replace.operation.ts
var OpenFindDialogOperation = {
  id: "ui.operation.open-find-dialog",
  type: 1 /* OPERATION */,
  handler: (accessor) => {
    const findReplaceService = accessor.get(IFindReplaceService);
    if (!findReplaceService.revealed) {
      findReplaceService.start();
    } else {
      findReplaceService.focusFindInput();
    }
    return true;
  }
};
var OpenReplaceDialogOperation = {
  id: "ui.operation.open-replace-dialog",
  type: 1 /* OPERATION */,
  handler: (accessor) => {
    const findReplaceService = accessor.get(IFindReplaceService);
    if (!findReplaceService.revealed) {
      findReplaceService.start(true);
    } else if (!findReplaceService.replaceRevealed) {
      findReplaceService.revealReplace();
    } else {
      findReplaceService.focusFindInput();
    }
    return true;
  }
};
var GoToNextMatchOperation = {
  type: 1 /* OPERATION */,
  id: "ui.operation.go-to-next-match",
  handler: (accessor) => {
    const findReplaceService = accessor.get(IFindReplaceService);
    findReplaceService.moveToNextMatch();
    return true;
  }
};
var GoToPreviousMatchOperation = {
  type: 1 /* OPERATION */,
  id: "ui.operation.go-to-previous-match",
  handler: (accessor) => {
    const findReplaceService = accessor.get(IFindReplaceService);
    findReplaceService.moveToPreviousMatch();
    return true;
  }
};
var FocusSelectionOperation = {
  type: 1 /* OPERATION */,
  id: "ui.operation.focus-selection",
  handler: (accessor) => {
    const findReplaceService = accessor.get(IFindReplaceService);
    findReplaceService.focusSelection();
    return true;
  }
};

// ../packages/find-replace/src/menu/find-replace.menu.ts
function FindReplaceMenuItemFactory(accessor) {
  const contextService = accessor.get(IContextService);
  return {
    id: OpenFindDialogOperation.id,
    icon: "SearchIcon",
    tooltip: "find-replace.toolbar",
    type: 0 /* BUTTON */,
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */),
    disabled$: combineLatest([
      contextService.subscribeContextValue$(EDITOR_ACTIVATED),
      contextService.subscribeContextValue$(FOCUSING_SHEET)
    ]).pipe(map(([editorActivated, focusingSheet]) => editorActivated || !focusingSheet))
  };
}

// ../packages/find-replace/src/menu/schema.ts
var menuSchema2 = {
  ["ribbon.data.organization" /* ORGANIZATION */]: {
    [OpenFindDialogOperation.id]: {
      order: 2,
      menuItemFactory: FindReplaceMenuItemFactory
    }
  }
};

// ../packages/find-replace/src/views/dialog/FindReplaceDialog.tsx
var import_react3 = __toESM(require_react());

// ../packages/find-replace/src/views/dialog/SearchInput.tsx
var import_react2 = __toESM(require_react());
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
function SearchInput(props) {
  const {
    findCompleted: findComplete,
    localeService,
    matchesCount,
    matchesPosition,
    initialFindString,
    findReplaceService,
    onChange,
    ...rest
  } = props;
  const [value, setValue] = (0, import_react2.useState)(initialFindString);
  const noResult = findComplete && matchesCount === 0;
  const text = noResult ? localeService.t("find-replace.dialog.no-result") : matchesCount === 0 ? " " : void 0;
  function handleChangePosition(newIndex) {
    if (matchesPosition === matchesCount && newIndex === 1) {
      findReplaceService.moveToNextMatch();
    } else if (matchesPosition === 1 && newIndex === matchesCount) {
      findReplaceService.moveToPreviousMatch();
    } else if (newIndex < matchesPosition) {
      findReplaceService.moveToPreviousMatch();
    } else {
      findReplaceService.moveToNextMatch();
    }
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "univer-relative univer-flex univer-items-center univer-gap-2", onDrag: (e) => e.stopPropagation(), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    Input,
    {
      "data-u-comp": "search-input",
      autoFocus: true,
      placeholder: localeService.t("find-replace.dialog.find-placeholder"),
      value,
      onChange: (value2) => {
        setValue(value2);
        onChange == null ? void 0 : onChange(value2);
      },
      slot: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        Pager,
        {
          loop: true,
          text,
          value: matchesPosition,
          total: matchesCount,
          onChange: handleChangePosition
        }
      ),
      ...rest
    }
  ) });
}

// ../packages/find-replace/src/views/dialog/FindReplaceDialog.tsx
var import_jsx_runtime3 = __toESM(require_jsx_runtime());
function useFindInputFocus(findReplaceService, ref) {
  const focus = (0, import_react3.useCallback)(() => {
    var _a;
    (_a = document.querySelector(".univer-find-input input")) == null ? void 0 : _a.focus();
  }, []);
  const selectHasFocus = (0, import_react3.useCallback)(() => {
    const allInputs = document.querySelectorAll("[data-u-comp=find-replace-dialog] [data-u-comp=search-input]");
    return Array.from(allInputs).some((input) => input === document.activeElement);
  }, []);
  (0, import_react3.useImperativeHandle)(ref, () => ({ focus, selectHasFocus }));
  (0, import_react3.useEffect)(() => {
    const subscription = findReplaceService.focusSignal$.subscribe(() => focus());
    return () => subscription.unsubscribe();
  }, [findReplaceService, focus]);
  return { focus, selectHasFocus };
}
var FindDialog = (0, import_react3.forwardRef)(function FindDialogImpl(_props, ref) {
  const localeService = useDependency(LocaleService);
  const findReplaceService = useDependency(IFindReplaceService);
  const commandService = useDependency(ICommandService);
  const state = useObservable(findReplaceService.state$, void 0, true);
  const { findCompleted, findString, matchesCount, matchesPosition } = state;
  const revealReplace = (0, import_react3.useCallback)(() => {
    commandService.executeCommand(OpenReplaceDialogOperation.id);
  }, [commandService]);
  const onFindStringChange = useDebounceFn((findString2) => {
    return findReplaceService.changeFindString(findString2);
  }, 500);
  useFindInputFocus(findReplaceService, ref);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      SearchInput,
      {
        findCompleted,
        matchesCount,
        matchesPosition,
        findReplaceService,
        localeService,
        initialFindString: findString,
        onChange: onFindStringChange
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "univer-mt-4 univer-text-center", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "a",
      {
        className: `hover:univer-text-primary-500/80 univer-cursor-pointer univer-text-sm univer-text-primary-500 univer-transition-colors`,
        onClick: revealReplace,
        children: localeService.t("find-replace.dialog.advanced-finding")
      }
    ) })
  ] });
});
var ReplaceDialog = (0, import_react3.forwardRef)(function ReplaceDialogImpl(_props, ref) {
  const findReplaceService = useDependency(IFindReplaceService);
  const localeService = useDependency(LocaleService);
  const commandService = useDependency(ICommandService);
  const messageService = useDependency(IMessageService);
  const currentMatch = useObservable(findReplaceService.currentMatch$, void 0, true);
  const replaceables = useObservable(findReplaceService.replaceables$, void 0, true);
  const state = useObservable(findReplaceService.state$, void 0, true);
  const {
    matchesCount,
    matchesPosition,
    findString,
    inputtingFindString,
    replaceString,
    caseSensitive,
    matchesTheWholeCell,
    findDirection,
    findScope,
    findBy,
    findCompleted
  } = state;
  const findDisabled = inputtingFindString.length === 0;
  const replaceDisabled = matchesCount === 0 || !(currentMatch == null ? void 0 : currentMatch.replaceable);
  const replaceAllDisabled = replaceables.length === 0;
  const onFindStringChange = (0, import_react3.useCallback)(
    (newValue) => findReplaceService.changeInputtingFindString(newValue),
    [findReplaceService]
  );
  const onReplaceStringChange = (0, import_react3.useCallback)(
    (replaceString2) => findReplaceService.changeReplaceString(replaceString2),
    [findReplaceService]
  );
  const { focus } = useFindInputFocus(findReplaceService, ref);
  const onClickFindButton = (0, import_react3.useCallback)(() => {
    if (findString === inputtingFindString) {
      findReplaceService.moveToNextMatch();
    } else {
      findReplaceService.changeFindString(inputtingFindString);
      findReplaceService.find();
    }
  }, [findString, inputtingFindString, findReplaceService]);
  const onClickReplaceButton = (0, import_react3.useCallback)(() => commandService.executeCommand(ReplaceCurrentMatchCommand.id), [commandService]);
  const onClickReplaceAllButton = (0, import_react3.useCallback)(async () => {
    await commandService.executeCommand(ReplaceAllMatchesCommand.id);
    focus();
  }, [commandService]);
  const onChangeFindDirection = (0, import_react3.useCallback)((findDirection2) => {
    findReplaceService.changeFindDirection(findDirection2);
  }, [findReplaceService]);
  const onChangeFindScope = (0, import_react3.useCallback)((findScope2) => {
    findReplaceService.changeFindScope(findScope2);
  }, [findReplaceService]);
  const onChangeFindBy = (0, import_react3.useCallback)((findBy2) => {
    findReplaceService.changeFindBy(findBy2);
  }, [findReplaceService]);
  const findScopeOptions = useFindScopeOptions(localeService);
  const findDirectionOptions = useFindDirectionOptions(localeService);
  const findByOptions = useFindByOptions(localeService);
  (0, import_react3.useEffect)(() => {
    const shouldDisplayNoMatchInfo = findCompleted && matchesCount === 0;
    if (shouldDisplayNoMatchInfo) {
      messageService.show({
        content: localeService.t("find-replace.dialog.no-match"),
        type: "warning" /* Warning */,
        duration: 5e3
      });
    }
  }, [findCompleted, matchesCount, messageService, localeService]);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(FormLayout, { label: localeService.t("find-replace.dialog.find"), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      SearchInput,
      {
        findCompleted,
        className: "univer-find-input",
        matchesCount,
        matchesPosition,
        findReplaceService,
        localeService,
        initialFindString: inputtingFindString,
        onChange: onFindStringChange
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(FormLayout, { label: localeService.t("find-replace.dialog.replace"), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      Input,
      {
        placeholder: localeService.t("find-replace.dialog.replace-placeholder"),
        value: replaceString,
        onChange: (value) => onReplaceStringChange(value)
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(FormLayout, { label: localeService.t("find-replace.dialog.find-direction.title"), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Select, { value: findDirection, options: findDirectionOptions, onChange: onChangeFindDirection }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(FormDualColumnLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(FormLayout, { label: localeService.t("find-replace.dialog.find-scope.title"), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Select, { value: findScope, options: findScopeOptions, onChange: onChangeFindScope }) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(FormLayout, { label: localeService.t("find-replace.dialog.find-by.title"), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Select, { value: findBy, options: findByOptions, onChange: onChangeFindBy }) })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(FormDualColumnLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(FormLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        Checkbox,
        {
          checked: caseSensitive,
          onChange: (checked) => {
            findReplaceService.changeCaseSensitive(checked);
          },
          children: localeService.t("find-replace.dialog.case-sensitive")
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(FormLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        Checkbox,
        {
          checked: matchesTheWholeCell,
          onChange: (checked) => {
            findReplaceService.changeMatchesTheWholeCell(checked);
          },
          children: localeService.t("find-replace.dialog.match-the-whole-cell")
        }
      ) })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "univer-mt-6 univer-flex univer-justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { variant: "primary", onClick: onClickFindButton, disabled: findDisabled, children: localeService.t("find-replace.dialog.find") }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "univer-inline-flex univer-gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { disabled: replaceDisabled, onClick: onClickReplaceButton, children: localeService.t("find-replace.dialog.replace") }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { disabled: replaceAllDisabled, onClick: onClickReplaceAllButton, children: localeService.t("find-replace.dialog.replace-all") })
      ] })
    ] })
  ] });
});
function FindReplaceDialog() {
  const findReplaceService = useDependency(IFindReplaceService);
  const layoutService = useDependency(ILayoutService);
  const contextService = useDependency(IContextService);
  const state = useObservable(findReplaceService.state$, void 0, true);
  const dialogContainerRef = (0, import_react3.useRef)(null);
  (0, import_react3.useEffect)(() => {
    let disposable;
    if (dialogContainerRef.current) {
      disposable = layoutService.registerContainerElement(dialogContainerRef.current);
    }
    return () => disposable == null ? void 0 : disposable.dispose();
  }, [layoutService]);
  const focusRef = (0, import_react3.useRef)(null);
  const setDialogContainerFocus = (0, import_react3.useCallback)(
    (focused) => contextService.setContextValue(FIND_REPLACE_DIALOG_FOCUS, focused),
    [contextService]
  );
  const setDialogInputFocus = (0, import_react3.useCallback)(
    (focused) => contextService.setContextValue(FIND_REPLACE_INPUT_FOCUS, focused),
    [contextService]
  );
  (0, import_react3.useEffect)(() => {
    var _a;
    const focusSubscription = fromEvent(document, "focusin").subscribe((event) => {
      var _a2;
      if (event.target && ((_a2 = dialogContainerRef.current) == null ? void 0 : _a2.contains(event.target))) {
        setDialogContainerFocus(true);
      } else {
        setDialogContainerFocus(false);
      }
      if (!focusRef.current || !focusRef.current.selectHasFocus()) {
        setDialogInputFocus(false);
      } else {
        setDialogInputFocus(true);
      }
    });
    (_a = focusRef.current) == null ? void 0 : _a.focus();
    setDialogContainerFocus(true);
    setDialogInputFocus(true);
    return () => {
      focusSubscription.unsubscribe();
      setDialogContainerFocus(false);
    };
  }, [setDialogContainerFocus, setDialogInputFocus]);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { ref: dialogContainerRef, "data-u-comp": "find-replace-dialog", children: !state.replaceRevealed ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(FindDialog, { ref: focusRef }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ReplaceDialog, { ref: focusRef }) });
}
function useFindScopeOptions(localeService) {
  const locale = localeService.getCurrentLocale();
  const options = (0, import_react3.useMemo)(() => {
    return [
      { label: localeService.t("find-replace.dialog.find-scope.current-sheet"), value: "subunit" /* SUBUNIT */ },
      { label: localeService.t("find-replace.dialog.find-scope.workbook"), value: "unit" /* UNIT */ }
    ];
  }, [locale]);
  return options;
}
function useFindDirectionOptions(localeService) {
  const locale = localeService.getCurrentLocale();
  const options = (0, import_react3.useMemo)(() => {
    return [
      { label: localeService.t("find-replace.dialog.find-direction.row"), value: "row" /* ROW */ },
      { label: localeService.t("find-replace.dialog.find-direction.column"), value: "column" /* COLUMN */ }
    ];
  }, [locale]);
  return options;
}
function useFindByOptions(localeService) {
  const locale = localeService.getCurrentLocale();
  const options = (0, import_react3.useMemo)(() => {
    return [
      { label: localeService.t("find-replace.dialog.find-by.value"), value: "value" /* VALUE */ },
      { label: localeService.t("find-replace.dialog.find-by.formula"), value: "formula" /* FORMULA */ }
    ];
  }, [locale]);
  return options;
}

// ../packages/find-replace/src/controllers/find-replace.shortcut.ts
function whenFindReplaceDialogFocused(contextService) {
  return contextService.getContextValue(FIND_REPLACE_DIALOG_FOCUS);
}
function whenReplaceRevealed(contextService) {
  return contextService.getContextValue(FIND_REPLACE_REPLACE_REVEALED);
}
function whenFindReplaceInputFocused(contextService) {
  return contextService.getContextValue(FIND_REPLACE_INPUT_FOCUS);
}
var FIND_REPLACE_SHORTCUT_GROUP = "7_find-replace-shortcuts";
function whenSheetFocused(contextService) {
  return contextService.getContextValue(FOCUSING_SHEET);
}
function whenEditorNotActivated(contextService) {
  return !contextService.getContextValue(EDITOR_ACTIVATED);
}
var OpenFindDialogShortcutItem = {
  id: OpenFindDialogOperation.id,
  description: "find-replace.shortcut.open-find-dialog",
  binding: 70 /* F */ | 4096 /* CTRL_COMMAND */,
  group: FIND_REPLACE_SHORTCUT_GROUP,
  groupTitle: "find-replace.shortcut.panel",
  preconditions(contextService) {
    return !whenFindReplaceDialogFocused(contextService) && whenSheetFocused(contextService) && whenEditorNotActivated(contextService);
  }
};
var MacOpenFindDialogShortcutItem = {
  id: OpenFindDialogOperation.id,
  description: "find-replace.shortcut.open-find-dialog",
  binding: 70 /* F */ | 4096 /* CTRL_COMMAND */,
  mac: 70 /* F */ | 8192 /* MAC_CTRL */,
  preconditions(contextService) {
    return !whenFindReplaceDialogFocused(contextService) && whenSheetFocused(contextService) && whenEditorNotActivated(contextService);
  }
};
var OpenReplaceDialogShortcutItem = {
  id: OpenReplaceDialogOperation.id,
  description: "find-replace.shortcut.open-replace-dialog",
  binding: 72 /* H */ | 4096 /* CTRL_COMMAND */,
  mac: 72 /* H */ | 8192 /* MAC_CTRL */,
  group: FIND_REPLACE_SHORTCUT_GROUP,
  groupTitle: "find-replace.shortcut.panel",
  preconditions(contextService) {
    return whenSheetFocused(contextService) && whenEditorNotActivated(contextService) && (!whenFindReplaceDialogFocused(contextService) || !whenReplaceRevealed(contextService));
  }
};
var GoToNextFindMatchShortcutItem = {
  id: GoToNextMatchOperation.id,
  description: "find-replace.shortcut.go-to-next-match",
  binding: 13 /* ENTER */,
  group: FIND_REPLACE_SHORTCUT_GROUP,
  groupTitle: "find-replace.shortcut.panel",
  priority: 1e3,
  preconditions(contextService) {
    return whenFindReplaceInputFocused(contextService) && whenFindReplaceDialogFocused(contextService);
  }
};
var GoToPreviousFindMatchShortcutItem = {
  id: GoToPreviousMatchOperation.id,
  description: "find-replace.shortcut.go-to-previous-match",
  binding: 13 /* ENTER */ | 1024 /* SHIFT */,
  group: FIND_REPLACE_SHORTCUT_GROUP,
  groupTitle: "find-replace.shortcut.panel",
  priority: 1e3,
  preconditions(contextService) {
    return whenFindReplaceInputFocused(contextService) && whenFindReplaceDialogFocused(contextService);
  }
};
var FocusSelectionShortcutItem = {
  id: FocusSelectionOperation.id,
  description: "find-replace.shortcut.focus-selection",
  binding: 27 /* ESC */,
  group: FIND_REPLACE_SHORTCUT_GROUP,
  groupTitle: "find-replace.shortcut.panel",
  priority: 1e3,
  preconditions(contextService) {
    return whenFindReplaceDialogFocused(contextService);
  }
};

// ../packages/find-replace/src/controllers/find-replace.controller.ts
var FIND_REPLACE_DIALOG_ID = "DESKTOP_FIND_REPLACE_DIALOG";
var FIND_REPLACE_PANEL_WIDTH = 350;
var FIND_REPLACE_PANEL_RIGHT_PADDING = 20;
var FIND_REPLACE_PANEL_TOP_PADDING = 64;
var FindReplaceController = class extends RxDisposable {
  constructor(_univerInstanceService, _menuManagerService, _shortcutService, _commandService, _findReplaceService, _dialogService, _layoutService, _localeService, _componentManager) {
    super();
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_menuManagerService", _menuManagerService);
    __publicField(this, "_shortcutService", _shortcutService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_findReplaceService", _findReplaceService);
    __publicField(this, "_dialogService", _dialogService);
    __publicField(this, "_layoutService", _layoutService);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_componentManager", _componentManager);
    __publicField(this, "_closingListenerDisposable");
    this._initCommands();
    this._initUI();
    this._initShortcuts();
  }
  dispose() {
    var _a;
    super.dispose();
    (_a = this._closingListenerDisposable) == null ? void 0 : _a.dispose();
    this._closingListenerDisposable = null;
  }
  _initCommands() {
    [
      OpenFindDialogOperation,
      OpenReplaceDialogOperation,
      GoToNextMatchOperation,
      GoToPreviousMatchOperation,
      ReplaceAllMatchesCommand,
      ReplaceCurrentMatchCommand,
      FocusSelectionOperation
    ].forEach((c) => {
      this.disposeWithMe(this._commandService.registerCommand(c));
    });
  }
  _initShortcuts() {
    [
      OpenReplaceDialogShortcutItem,
      OpenFindDialogShortcutItem,
      MacOpenFindDialogShortcutItem,
      GoToPreviousFindMatchShortcutItem,
      GoToNextFindMatchShortcutItem,
      FocusSelectionShortcutItem
    ].forEach((s) => this.disposeWithMe(this._shortcutService.registerShortcut(s)));
  }
  _initUI() {
    [
      ["FindReplaceDialog", FindReplaceDialog],
      ["SearchIcon", SearchIcon]
    ].forEach(([key, comp]) => {
      this.disposeWithMe(
        this._componentManager.register(key, comp)
      );
    });
    this._menuManagerService.mergeMenu(menuSchema2);
    this._findReplaceService.stateUpdates$.pipe(takeUntil(this.dispose$)).subscribe((newState) => {
      if (newState.revealed === true) {
        this._openPanel();
      }
    });
  }
  _openPanel() {
    this._dialogService.open({
      id: FIND_REPLACE_DIALOG_ID,
      draggable: true,
      width: FIND_REPLACE_PANEL_WIDTH,
      title: { title: this._localeService.t("find-replace.dialog.title") },
      children: { label: "FindReplaceDialog" },
      destroyOnClose: true,
      mask: false,
      maskClosable: false,
      defaultPosition: getFindReplaceDialogDefaultPosition(),
      preservePositionOnDestroy: true,
      onClose: () => this.closePanel()
    });
    this._closingListenerDisposable = toDisposable(this._univerInstanceService.focused$.pipe(takeUntil(this.dispose$)).subscribe((focused) => {
      if (!focused || !this._univerInstanceService.getUniverSheetInstance(focused)) {
        this.closePanel();
      }
    }));
  }
  closePanel() {
    if (!this._closingListenerDisposable) {
      return;
    }
    this._closingListenerDisposable.dispose();
    this._closingListenerDisposable = null;
    this._dialogService.close(FIND_REPLACE_DIALOG_ID);
    this._findReplaceService.terminate();
    queueMicrotask(() => this._layoutService.focus());
  }
};
FindReplaceController = __decorateClass([
  __decorateParam(0, IUniverInstanceService),
  __decorateParam(1, IMenuManagerService),
  __decorateParam(2, IShortcutService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, IFindReplaceService),
  __decorateParam(5, IDialogService),
  __decorateParam(6, ILayoutService),
  __decorateParam(7, Inject(LocaleService)),
  __decorateParam(8, Inject(ComponentManager))
], FindReplaceController);
function getFindReplaceDialogDefaultPosition() {
  const { innerWidth } = window;
  const x = innerWidth - FIND_REPLACE_PANEL_WIDTH - FIND_REPLACE_PANEL_RIGHT_PADDING;
  const y = FIND_REPLACE_PANEL_TOP_PADDING;
  return { x, y };
}

// ../packages/find-replace/src/plugin.ts
var UniverFindReplacePlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig2, _injector, _configService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_configService", _configService);
    const { ...rest } = merge_default(
      {},
      defaultPluginConfig2,
      this._config
    );
    this._configService.setConfig(FIND_REPLACE_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    [
      [FindReplaceController],
      [IFindReplaceService, { useClass: FindReplaceService }]
    ].forEach((d) => this._injector.add(d));
  }
  onRendered() {
    this._injector.get(FindReplaceController);
  }
};
__publicField(UniverFindReplacePlugin, "pluginName", "UNIVER_FIND_REPLACE_PLUGIN");
__publicField(UniverFindReplacePlugin, "packageName", package_default2.name);
__publicField(UniverFindReplacePlugin, "version", package_default2.version);
UniverFindReplacePlugin = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IConfigService)
], UniverFindReplacePlugin);

export {
  FindModel,
  IFindReplaceService,
  FindReplaceModel,
  createInitFindReplaceState,
  FindReplaceState,
  FindReplaceController,
  UniverFindReplacePlugin,
  CROSSHAIR_HIGHLIGHT_COLORS,
  SheetsCrosshairHighlightService,
  ToggleCrosshairHighlightOperation,
  SetCrosshairHighlightColorOperation,
  EnableCrosshairHighlightOperation,
  DisableCrosshairHighlightOperation,
  UniverSheetsCrosshairHighlightPlugin
};
