import {
  EditingRenderController,
  IEditorBridgeService,
  getCurrentExclusiveRangeInterest$,
  getCurrentRangeDisable$,
  getEditorObject
} from "./chunk-BHQGV2VJ.js";
import {
  DocBackScrollRenderController,
  IEditorService
} from "./chunk-7ZOWWEOA.js";
import {
  CheckMarkIcon,
  CloseIcon,
  IMenuManagerService,
  IShortcutService,
  ISidebarService,
  IZenZoneService,
  clsx,
  require_jsx_runtime,
  require_react,
  useDependency
} from "./chunk-VNXQUZSG.js";
import {
  RangeProtectionPermissionEditPoint,
  WorkbookEditablePermission,
  WorksheetEditPermission,
  WorksheetSetCellStylePermission,
  WorksheetSetCellValuePermission
} from "./chunk-Q6Y4PHRI.js";
import {
  IRenderManagerService
} from "./chunk-XOCU2XR6.js";
import {
  BehaviorSubject,
  DEFAULT_EMPTY_DOCUMENT_VALUE,
  DOCS_ZEN_EDITOR_UNIT_ID_KEY,
  Disposable,
  DocumentDataModel,
  EDITOR_ACTIVATED,
  FOCUSING_DOC,
  FOCUSING_EDITOR_STANDALONE,
  FOCUSING_UNIVER_EDITOR,
  ICommandService,
  IConfigService,
  IUniverInstanceService,
  Inject,
  Injector,
  Plugin,
  RxDisposable,
  Tools,
  createIdentifier,
  delayAnimationFrame,
  map,
  merge_default,
  switchMap,
  takeUntil
} from "./chunk-EJSPXROI.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField,
  __toESM
} from "./chunk-24OICD5T.js";

// ../packages/sheets-zen-editor/package.json
var package_default = {
  name: "@univerjs/sheets-zen-editor",
  version: "0.25.2",
  private: false,
  description: "Immersive cell editing experience for Univer Sheets.",
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
    "zen-editor",
    "cell-editor",
    "ui"
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
    "@univerjs/docs": "workspace:*",
    "@univerjs/docs-ui": "workspace:*",
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

// ../packages/sheets-zen-editor/src/config/config.ts
var SHEETS_ZEN_EDITOR_PLUGIN_CONFIG_KEY = "sheets-zen-editor.config";
var configSymbol = Symbol(SHEETS_ZEN_EDITOR_PLUGIN_CONFIG_KEY);
var defaultPluginConfig = {};

// ../packages/sheets-zen-editor/src/commands/commands/zen-editor.command.ts
var OpenZenEditorCommand = {
  id: "zen-editor.command.open-zen-editor",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    var _a;
    const zenZoneService = accessor.get(IZenZoneService);
    const editorService = accessor.get(IEditorService);
    const editorBridgeService = accessor.get(IEditorBridgeService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const sideBarService = accessor.get(ISidebarService);
    if (sideBarService.visible) {
      sideBarService.close();
      await delayAnimationFrame();
    }
    zenZoneService.open();
    const editor = editorService.getEditor(DOCS_ZEN_EDITOR_UNIT_ID_KEY);
    if (editor == null) {
      return false;
    }
    const editCellState = editorBridgeService.getLatestEditCellState();
    if (editCellState == null) {
      return false;
    }
    const snapshot = (_a = editCellState.documentLayoutObject.documentModel) == null ? void 0 : _a.getSnapshot();
    if (snapshot == null) {
      return false;
    }
    univerInstanceService.focusUnit(DOCS_ZEN_EDITOR_UNIT_ID_KEY);
    const { body, drawings, drawingsOrder, tableSource, settings } = Tools.deepClone(snapshot);
    const originSnapshot = editor.getDocumentData();
    const newSnapshot = {
      ...originSnapshot,
      body,
      drawings,
      drawingsOrder,
      tableSource,
      settings
    };
    const textRanges = [
      {
        startOffset: 0,
        endOffset: 0,
        collapsed: true
      }
    ];
    editor.focus();
    editor.setDocumentData(newSnapshot, textRanges);
    editor.clearUndoRedoHistory();
    return true;
  }
};
var CancelZenEditCommand = {
  id: "zen-editor.command.cancel-zen-edit",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    const zenZoneEditorService = accessor.get(IZenZoneService);
    const editorBridgeService = accessor.get(IEditorBridgeService);
    const univerInstanceManager = accessor.get(IUniverInstanceService);
    const sideBarService = accessor.get(ISidebarService);
    if (sideBarService.visible) {
      sideBarService.close();
      await delayAnimationFrame();
    }
    zenZoneEditorService.close();
    const currentSheetInstance = univerInstanceManager.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    if (currentSheetInstance) {
      univerInstanceManager.focusUnit(currentSheetInstance.getUnitId());
      editorBridgeService.refreshEditCellState();
      return true;
    }
    return false;
  }
};
var ConfirmZenEditCommand = {
  id: "zen-editor.command.confirm-zen-edit",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    var _a;
    const zenZoneEditorService = accessor.get(IZenZoneService);
    const editorBridgeService = accessor.get(IEditorBridgeService);
    const univerInstanceManager = accessor.get(IUniverInstanceService);
    const editorService = accessor.get(IEditorService);
    const sideBarService = accessor.get(ISidebarService);
    if (sideBarService.visible) {
      sideBarService.close();
      await delayAnimationFrame();
    }
    zenZoneEditorService.close();
    const editor = editorService.getEditor(DOCS_ZEN_EDITOR_UNIT_ID_KEY);
    if (editor == null) {
      return false;
    }
    const renderManagerService = accessor.get(IRenderManagerService);
    const currentSheetInstance = univerInstanceManager.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    if (currentSheetInstance) {
      const currentSheetId = currentSheetInstance.getUnitId();
      const editingRenderController = (_a = renderManagerService.getRenderById(currentSheetId)) == null ? void 0 : _a.with(EditingRenderController);
      if (editingRenderController) {
        const snapshot = Tools.deepClone(editor.getDocumentData());
        snapshot.documentStyle.documentFlavor = 0 /* UNSPECIFIED */;
        editingRenderController.submitCellData(new DocumentDataModel(snapshot));
      }
      univerInstanceManager.focusUnit(currentSheetInstance.getUnitId());
      editorBridgeService.refreshEditCellState();
      return true;
    }
    return false;
  }
};

// ../packages/sheets-zen-editor/src/menu/menu.ts
function ZenEditorMenuItemFactory(accessor) {
  const editorBridgeService = accessor.get(IEditorBridgeService);
  return {
    id: OpenZenEditorCommand.id,
    type: 0 /* BUTTON */,
    title: "sheets-zen-editor.rightClick.zenEditor",
    icon: "AmplifyIcon",
    hidden$: getCurrentExclusiveRangeInterest$(accessor),
    disabled$: editorBridgeService.currentEditCell$.pipe(
      switchMap((cell) => getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }).pipe(map((disabled) => {
        var _a, _b, _c, _d;
        return disabled || ((_d = (_c = (_b = (_a = cell == null ? void 0 : cell.documentLayoutObject.documentModel) == null ? void 0 : _a.getBody()) == null ? void 0 : _b.customBlocks) == null ? void 0 : _c.length) != null ? _d : 0) > 0;
      })))
    )
  };
}

// ../packages/sheets-zen-editor/src/menu/schema.ts
var menuSchema = {
  ["contextMenu.mainArea" /* MAIN_AREA */]: {
    ["contextMenu.others" /* OTHERS */]: {
      [OpenZenEditorCommand.id]: {
        order: 2,
        menuItemFactory: ZenEditorMenuItemFactory
      }
    }
  }
};

// ../packages/sheets-zen-editor/src/views/zen-editor/ZenEditor.tsx
var import_react = __toESM(require_react());

// ../packages/sheets-zen-editor/src/services/zen-editor.service.ts
var ZenEditorManagerService = class extends Disposable {
  constructor() {
    super(...arguments);
    __publicField(this, "_position", null);
    __publicField(this, "_position$", new BehaviorSubject(null));
    __publicField(this, "position$", this._position$.asObservable());
  }
  dispose() {
    this._position$.complete();
    this._position = null;
  }
  setPosition(param) {
    this._position = param;
    this._refresh(param);
  }
  getPosition() {
    return this._position;
  }
  _refresh(param) {
    this._position$.next(param);
  }
};
var IZenEditorManagerService = createIdentifier(
  "univer.sheet-zen-editor-manager.service"
);

// ../packages/sheets-zen-editor/src/views/zen-editor/ZenEditor.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime());
var COMPONENT_PREFIX = "ZEN_EDITOR_PLUGIN_";
var ZEN_EDITOR_COMPONENT = `${COMPONENT_PREFIX}ZEN_EDITOR_COMPONENT`;
var INITIAL_SNAPSHOT = {
  id: DOCS_ZEN_EDITOR_UNIT_ID_KEY,
  body: {
    dataStream: `${DEFAULT_EMPTY_DOCUMENT_VALUE}`,
    textRuns: [],
    tables: [],
    customBlocks: [],
    paragraphs: [
      {
        startIndex: 0
      }
    ],
    sectionBreaks: [{
      startIndex: 1
    }]
  },
  tableSource: {},
  documentStyle: {
    pageSize: {
      width: 595,
      height: Number.POSITIVE_INFINITY
    },
    documentFlavor: 2 /* MODERN */,
    marginTop: 0,
    marginBottom: 0,
    marginRight: 0,
    marginLeft: 0,
    renderConfig: {
      vertexAngle: 0,
      centerAngle: 0
    }
  },
  drawings: {},
  drawingsOrder: []
};
function ZenEditor() {
  const editorRef = (0, import_react.useRef)(null);
  const zenEditorService = useDependency(IZenEditorManagerService);
  const editorService = useDependency(IEditorService);
  const commandService = useDependency(ICommandService);
  (0, import_react.useEffect)(() => {
    const editorDom = editorRef.current;
    if (!editorDom) {
      return;
    }
    const registerSubscription = editorService.register({
      editorUnitId: DOCS_ZEN_EDITOR_UNIT_ID_KEY,
      initialSnapshot: INITIAL_SNAPSHOT,
      scrollBar: true,
      backScrollOffset: 100
    }, editorDom);
    const resizeObserver = new ResizeObserver(() => {
      zenEditorService.setPosition(editorDom.getBoundingClientRect());
    });
    resizeObserver.observe(editorDom);
    return () => {
      registerSubscription.dispose();
      resizeObserver.unobserve(editorDom);
    };
  }, []);
  function handleCloseBtnClick() {
    const editor = editorService.getEditor(DOCS_ZEN_EDITOR_UNIT_ID_KEY);
    editor == null ? void 0 : editor.blur();
    commandService.executeCommand(CancelZenEditCommand.id);
  }
  function handleConfirmBtnClick() {
    const editor = editorService.getEditor(DOCS_ZEN_EDITOR_UNIT_ID_KEY);
    editor == null ? void 0 : editor.blur();
    commandService.executeCommand(ConfirmZenEditCommand.id);
  }
  const containerClassName = "univer-flex univer-w-7 univer-cursor-pointer univer-items-center univer-justify-center univer-transition-colors";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      className: `univer-absolute univer-inset-0 univer-size-full univer-bg-white dark:!univer-bg-gray-800`,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "div",
          {
            className: `univer-absolute univer-right-6 univer-top-2 univer-z-10 univer-flex univer-items-center univer-justify-center`,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "span",
                {
                  className: clsx(containerClassName, `univer-text-red-500 hover:univer-text-red-600`),
                  onClick: handleCloseBtnClick,
                  children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloseIcon, { className: "univer-size-5" })
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "span",
                {
                  className: clsx(containerClassName, `univer-text-green-500 hover:univer-text-green-600`),
                  onClick: handleConfirmBtnClick,
                  children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckMarkIcon, { className: "univer-size-5" })
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: editorRef, className: "univer-absolute univer-inset-0 univer-size-full" })
      ]
    }
  );
}

// ../packages/sheets-zen-editor/src/controllers/shortcuts/zen-editor.shortcut.ts
var ZenEditorConfirmShortcut = {
  id: ConfirmZenEditCommand.id,
  description: "sheets-zen-editor.shortcut.sheet.zen-edit-confirm",
  group: "4_sheet-edit",
  groupTitle: "sheets-ui.shortcut.sheet-edit",
  preconditions: (contextService) => whenZenEditorActivated(contextService),
  binding: 13 /* ENTER */ | 2048 /* ALT */
};
var ZenEditorCancelShortcut = {
  id: CancelZenEditCommand.id,
  description: "sheets-zen-editor.shortcut.sheet.zen-edit-cancel",
  group: "4_sheet-edit",
  groupTitle: "sheets-ui.shortcut.sheet-edit",
  preconditions: (contextService) => whenZenEditorActivated(contextService),
  binding: 27 /* ESC */
};
function whenZenEditorActivated(contextService) {
  return contextService.getContextValue(FOCUSING_DOC) && contextService.getContextValue(FOCUSING_UNIVER_EDITOR) && contextService.getContextValue(EDITOR_ACTIVATED) && !contextService.getContextValue(FOCUSING_EDITOR_STANDALONE);
}

// ../packages/sheets-zen-editor/src/controllers/zen-editor-ui.controller.ts
var ZenEditorUIController = class extends Disposable {
  constructor(_zenZoneService, _commandService, _menuManagerService, _shortcutService) {
    super();
    __publicField(this, "_zenZoneService", _zenZoneService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_menuManagerService", _menuManagerService);
    __publicField(this, "_shortcutService", _shortcutService);
    this._initialize();
  }
  _initialize() {
    this._initCustomComponents();
    this._initCommands();
    this._initMenus();
    this._initShortcuts();
  }
  _initCustomComponents() {
    this.disposeWithMe(this._zenZoneService.set(ZEN_EDITOR_COMPONENT, ZenEditor));
  }
  _initCommands() {
    [OpenZenEditorCommand, CancelZenEditCommand, ConfirmZenEditCommand].forEach((c) => {
      this.disposeWithMe(this._commandService.registerCommand(c));
    });
  }
  _initMenus() {
    this._menuManagerService.mergeMenu(menuSchema);
  }
  _initShortcuts() {
    [ZenEditorConfirmShortcut, ZenEditorCancelShortcut].forEach((item) => {
      this.disposeWithMe(this._shortcutService.registerShortcut(item));
    });
  }
};
ZenEditorUIController = __decorateClass([
  __decorateParam(0, IZenZoneService),
  __decorateParam(1, ICommandService),
  __decorateParam(2, IMenuManagerService),
  __decorateParam(3, IShortcutService)
], ZenEditorUIController);

// ../packages/sheets-zen-editor/src/controllers/zen-editor.controller.ts
var ZenEditorController = class extends RxDisposable {
  constructor(_zenEditorManagerService, _renderManagerService) {
    super();
    __publicField(this, "_zenEditorManagerService", _zenEditorManagerService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    this._initialize();
  }
  _initialize() {
    this._syncZenEditorSize();
  }
  // Listen to changes in the size of the zen editor container to set the size of the editor.
  _syncZenEditorSize() {
    this._zenEditorManagerService.position$.pipe(takeUntil(this.dispose$)).subscribe((position) => {
      if (position == null) {
        return;
      }
      const { width, height } = position;
      const editorObject = getEditorObject(DOCS_ZEN_EDITOR_UNIT_ID_KEY, this._renderManagerService);
      if (editorObject == null) {
        return;
      }
      requestIdleCallback(() => {
        editorObject.engine.resizeBySize(width, height);
        this._calculatePagePosition(editorObject);
        this._scrollToTop();
      });
    });
  }
  _calculatePagePosition(currentRender) {
    const { document: docsComponent, scene, docBackground } = currentRender;
    const parent = scene == null ? void 0 : scene.getParent();
    const { width: docsWidth, height: docsHeight, pageMarginLeft, pageMarginTop } = docsComponent;
    if (parent == null || docsWidth === Number.POSITIVE_INFINITY || docsHeight === Number.POSITIVE_INFINITY) {
      return;
    }
    const { width: engineWidth, height: engineHeight } = parent;
    let docsLeft = 0;
    const docsTop = pageMarginTop;
    let sceneWidth = 0;
    let sceneHeight = 0;
    let scrollToX = Number.POSITIVE_INFINITY;
    const { scaleX, scaleY } = scene.getAncestorScale();
    if (engineWidth > (docsWidth + pageMarginLeft * 2) * scaleX) {
      docsLeft = engineWidth / 2 - docsWidth * scaleX / 2;
      docsLeft /= scaleX;
      sceneWidth = (engineWidth - pageMarginLeft * 2) / scaleX;
      scrollToX = 0;
    } else {
      docsLeft = pageMarginLeft;
      sceneWidth = docsWidth + pageMarginLeft * 2;
      scrollToX = (sceneWidth - engineWidth / scaleX) / 2;
    }
    if (engineHeight > docsHeight) {
      sceneHeight = (engineHeight - pageMarginTop * 2) / scaleY;
    } else {
      sceneHeight = docsHeight + pageMarginTop * 2;
    }
    scene.resize(sceneWidth, sceneHeight);
    docsComponent.translate(docsLeft, docsTop);
    docBackground.translate(docsLeft, docsTop);
    const viewport = scene.getViewport("viewMain" /* VIEW_MAIN */);
    if (scrollToX !== Number.POSITIVE_INFINITY && viewport != null) {
      const actualX = viewport.transScroll2ViewportScrollValue(scrollToX, 0).x;
      viewport.scrollToBarPos({
        x: actualX
      });
    }
    return this;
  }
  _scrollToTop() {
    var _a;
    const backScrollController = (_a = this._renderManagerService.getRenderById(DOCS_ZEN_EDITOR_UNIT_ID_KEY)) == null ? void 0 : _a.with(DocBackScrollRenderController);
    const textRange = {
      startOffset: 0,
      endOffset: 0
    };
    if (backScrollController) {
      backScrollController.scrollToRange(textRange);
    }
  }
};
ZenEditorController = __decorateClass([
  __decorateParam(0, IZenEditorManagerService),
  __decorateParam(1, IRenderManagerService)
], ZenEditorController);

// ../packages/sheets-zen-editor/src/plugin.ts
var UniverSheetsZenEditorPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig, _injector, _configService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_configService", _configService);
    const { menu, ...rest } = merge_default(
      {},
      defaultPluginConfig,
      this._config
    );
    if (menu) {
      this._configService.setConfig("menu", menu, { merge: true });
    }
    this._configService.setConfig(SHEETS_ZEN_EDITOR_PLUGIN_CONFIG_KEY, rest);
    this._initializeDependencies(this._injector);
  }
  _initializeDependencies(injector) {
    const dependencies = [
      [ZenEditorUIController],
      [ZenEditorController],
      [IZenEditorManagerService, { useClass: ZenEditorManagerService }]
    ];
    dependencies.forEach((dependency) => injector.add(dependency));
  }
  onReady() {
    this._injector.get(ZenEditorUIController);
  }
  onSteady() {
    this._injector.get(ZenEditorController);
  }
};
__publicField(UniverSheetsZenEditorPlugin, "pluginName", "SHEET_ZEN_EDITOR_PLUGIN");
__publicField(UniverSheetsZenEditorPlugin, "packageName", package_default.name);
__publicField(UniverSheetsZenEditorPlugin, "version", package_default.version);
__publicField(UniverSheetsZenEditorPlugin, "type", 2 /* UNIVER_SHEET */);
UniverSheetsZenEditorPlugin = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IConfigService)
], UniverSheetsZenEditorPlugin);

export {
  OpenZenEditorCommand,
  CancelZenEditCommand,
  ConfirmZenEditCommand,
  UniverSheetsZenEditorPlugin
};
