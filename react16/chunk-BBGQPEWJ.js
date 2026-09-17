import {
  RangeSelector
} from "./chunk-DMIB6PSO.js";
import {
  HoverManagerService,
  HoverRenderController,
  IEditorBridgeService,
  IMarkSelectionService,
  ISheetClipboardService,
  PREDEFINED_HOOK_NAME_PASTE,
  ScrollToRangeOperation,
  SheetCanvasPopManagerService,
  SheetSkeletonManagerService,
  getCurrentRangeDisable$,
  getCustomRangePosition,
  getEditingCustomRangePosition,
  getRepeatRange,
  virtualizeDiscreteRanges,
  whenSheetEditorFocused
} from "./chunk-BHQGV2VJ.js";
import {
  DocBackScrollRenderController,
  DocCanvasPopManagerService,
  DocEventManagerService,
  DocSelectionManagerService,
  DocSelectionRenderService,
  SheetDataValidationModel,
  UniverDocsUIPlugin,
  addCustomRangeBySelectionFactory,
  calcDocRangePositions,
  deleteCustomRangeFactory,
  replaceSelectionFactory
} from "./chunk-7ZOWWEOA.js";
import {
  AllBorderIcon,
  Button,
  ComponentManager,
  CopyIcon,
  FormLayout,
  IMenuManagerService,
  IMessageService,
  IShortcutService,
  IZenZoneService,
  Input,
  LinkIcon,
  Select,
  Tooltip,
  UnlinkIcon,
  WriteIcon,
  XlsxMultiIcon,
  borderClassName,
  clsx,
  getMenuHiddenObservable,
  require_jsx_runtime,
  require_react,
  useDependency,
  useEvent,
  useObservable
} from "./chunk-VNXQUZSG.js";
import {
  AFTER_CELL_EDIT,
  ClearSelectionAllCommand,
  ClearSelectionContentCommand,
  ClearSelectionFormatCommand,
  IAutoFillService,
  IDefinedNamesService,
  RangeProtectionPermissionEditPoint,
  RangeProtectionPermissionViewPoint,
  RefRangeService,
  RemoveSheetCommand,
  SetRangeValuesCommand,
  SetRangeValuesMutation,
  SetRangeValuesUndoMutationFactory,
  SetSelectionsOperation,
  SetWorksheetActiveOperation,
  SheetInterceptorService,
  SheetPermissionCheckController,
  SheetsSelectionsService,
  UniverSheetsPlugin,
  WorkbookCopyPermission,
  WorkbookEditablePermission,
  WorkbookViewPermission,
  WorksheetCopyPermission,
  WorksheetEditPermission,
  WorksheetInsertHyperlinkPermission,
  WorksheetSetCellValuePermission,
  WorksheetViewPermission,
  deserializeRangeWithSheet,
  getSheetCommandTarget,
  handleCommonRangeChangeWithEffectRefCommandsSkipNoInterests,
  handleDefaultRangeChangeWithEffectRefCommands,
  handleDefaultRangeChangeWithEffectRefCommandsSkipNoInterests,
  rangeToDiscreteRange,
  serializeRange,
  serializeRangeToRefString,
  serializeRangeWithSheet,
  tools_default
} from "./chunk-Q6Y4PHRI.js";
import {
  IRenderManagerService
} from "./chunk-XOCU2XR6.js";
import {
  BehaviorSubject,
  BuildTextUtils,
  ColorKit,
  DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
  DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
  DOCS_ZEN_EDITOR_UNIT_ID_KEY,
  DependentOn,
  Disposable,
  DisposableCollection,
  FOCUSING_SHEET,
  ICommandService,
  IConfigService,
  IContextService,
  IPermissionService,
  IUndoRedoService,
  IUniverInstanceService,
  Inject,
  Injector,
  LocaleService,
  ObjectMatrix,
  Observable,
  Plugin,
  Range,
  Rectangle,
  Subject,
  TextX,
  ThemeService,
  Tools,
  combineLatest,
  debounceTime,
  generateRandomId,
  getBodySlice,
  isSafeUrl,
  isValidRange,
  map,
  merge_default,
  of,
  registerDependencies,
  sequenceExecute,
  sequenceExecuteAsync,
  switchMap,
  toDisposable,
  touchDependencies
} from "./chunk-EJSPXROI.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField,
  __toESM
} from "./chunk-24OICD5T.js";

// ../packages/sheets-hyper-link/package.json
var package_default = {
  name: "@univerjs/sheets-hyper-link",
  version: "0.25.2",
  private: false,
  description: "Hyperlink model and commands for Univer Sheets.",
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
    "hyperlink",
    "link",
    "plugin"
  ],
  exports: {
    ".": "./src/index.ts",
    "./*": "./src/*",
    "./facade": "./src/facade/index.ts",
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
    rxjs: ">=7.0.0"
  },
  dependencies: {
    "@univerjs/core": "workspace:*",
    "@univerjs/docs": "workspace:*",
    "@univerjs/engine-formula": "workspace:*",
    "@univerjs/sheets": "workspace:*"
  },
  devDependencies: {
    "@univerjs-infra/shared": "workspace:*",
    rxjs: "^7.8.2",
    typescript: "^6.0.3",
    vitest: "^4.1.7"
  }
};

// ../packages/sheets-hyper-link/src/config/config.ts
var SHEETS_HYPER_LINK_PLUGIN_CONFIG_KEY = "sheets-hyper-link.config";
var configSymbol = Symbol(SHEETS_HYPER_LINK_PLUGIN_CONFIG_KEY);
var defaultPluginConfig = {};

// ../packages/sheets-hyper-link/src/models/hyper-link.model.ts
var HyperLinkModel = class extends Disposable {
  constructor(_univerInstanceService) {
    super();
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_linkUpdate$", new Subject());
    __publicField(this, "linkUpdate$", this._linkUpdate$.asObservable());
    __publicField(this, "_linkMap", /* @__PURE__ */ new Map());
    __publicField(this, "_linkPositionMap", /* @__PURE__ */ new Map());
    this.disposeWithMe({
      dispose: () => {
        this._linkUpdate$.complete();
      }
    });
  }
  _ensureMap(unitId, subUnitId) {
    let unitMap = this._linkMap.get(unitId);
    if (!unitMap) {
      unitMap = /* @__PURE__ */ new Map();
      this._linkMap.set(unitId, unitMap);
    }
    let matrix = unitMap.get(subUnitId);
    if (!matrix) {
      matrix = new ObjectMatrix();
      unitMap.set(subUnitId, matrix);
    }
    let positionUnitMap = this._linkPositionMap.get(unitId);
    if (!positionUnitMap) {
      positionUnitMap = /* @__PURE__ */ new Map();
      this._linkPositionMap.set(unitId, positionUnitMap);
    }
    let positionSubUnitMap = positionUnitMap.get(subUnitId);
    if (!positionSubUnitMap) {
      positionSubUnitMap = /* @__PURE__ */ new Map();
      positionUnitMap.set(subUnitId, positionSubUnitMap);
    }
    return {
      matrix,
      positionMap: positionSubUnitMap
    };
  }
  addHyperLink(unitId, subUnitId, link) {
    const { matrix, positionMap } = this._ensureMap(unitId, subUnitId);
    matrix.setValue(link.row, link.column, link);
    positionMap.set(link.id, { row: link.row, column: link.column, link });
    this._linkUpdate$.next({
      unitId,
      subUnitId,
      payload: link,
      type: "add"
    });
    return true;
  }
  updateHyperLink(unitId, subUnitId, id, payload, silent = false) {
    const { matrix, positionMap } = this._ensureMap(unitId, subUnitId);
    const position = positionMap.get(id);
    if (!position) {
      return true;
    }
    const link = matrix.getValue(position.row, position.column);
    if (!link) {
      return true;
    }
    Object.assign(link, payload);
    this._linkUpdate$.next({
      unitId,
      subUnitId,
      payload: {
        display: link.display,
        payload: link.payload
      },
      id,
      type: "update",
      silent
    });
    return true;
  }
  updateHyperLinkRef(unitId, subUnitId, id, payload, silent = false) {
    const { matrix, positionMap } = this._ensureMap(unitId, subUnitId);
    const position = positionMap.get(id);
    if (!position) {
      return true;
    }
    let link = matrix.getValue(position.row, position.column);
    if (!link || link.id !== id) {
      link = position.link;
    } else {
      matrix.realDeleteValue(position.row, position.column);
    }
    Object.assign(link, payload);
    positionMap.set(id, { ...payload, link });
    matrix.setValue(payload.row, payload.column, link);
    this._linkUpdate$.next({
      unitId,
      subUnitId,
      payload,
      id,
      type: "updateRef",
      silent
    });
    return true;
  }
  removeHyperLink(unitId, subUnitId, id) {
    const { matrix, positionMap } = this._ensureMap(unitId, subUnitId);
    const position = positionMap.get(id);
    if (!position) {
      return false;
    }
    positionMap.delete(id);
    const link = matrix.getValue(position.row, position.column);
    if (link && link.id === id) {
      matrix.realDeleteValue(position.row, position.column);
    }
    this._linkUpdate$.next({
      unitId,
      subUnitId,
      payload: position.link,
      type: "remove"
    });
    return true;
  }
  getHyperLink(unitId, subUnitId, id) {
    const { matrix, positionMap } = this._ensureMap(unitId, subUnitId);
    const position = positionMap.get(id);
    if (!position) {
      return void 0;
    }
    return matrix.getValue(position.row, position.column);
  }
  getHyperLinkByLocation(unitId, subUnitId, row, column) {
    const { matrix } = this._ensureMap(unitId, subUnitId);
    return matrix.getValue(row, column);
  }
  getHyperLinkByLocationSync(unitId, subUnitId, row, column) {
    var _a, _b, _c, _d, _e;
    const { matrix } = this._ensureMap(unitId, subUnitId);
    const workbook = this._univerInstanceService.getUnit(unitId, 2 /* UNIVER_SHEET */);
    const cell = (_a = workbook == null ? void 0 : workbook.getSheetBySheetId(subUnitId)) == null ? void 0 : _a.getCellRaw(row, column);
    const cellValueStr = ((_e = (_d = cell == null ? void 0 : cell.v) != null ? _d : (_c = (_b = cell == null ? void 0 : cell.p) == null ? void 0 : _b.body) == null ? void 0 : _c.dataStream.slice(0, -2)) != null ? _e : "").toString();
    const link = matrix.getValue(row, column);
    if (!link) {
      return void 0;
    }
    return {
      ...link,
      display: cellValueStr
    };
  }
  getSubUnit(unitId, subUnitId) {
    const { matrix } = this._ensureMap(unitId, subUnitId);
    const links = [];
    matrix.forValue((row, col, value) => {
      if (value) {
        links.push(value);
      }
    });
    return links;
  }
  getUnit(unitId) {
    const unitMap = this._linkMap.get(unitId);
    if (!unitMap) {
      return [];
    }
    return Array.from(unitMap.keys()).map((subUnitId) => {
      const links = this.getSubUnit(unitId, subUnitId);
      return {
        unitId,
        subUnitId,
        links
      };
    });
  }
  deleteUnit(unitId) {
    const links = this.getUnit(unitId);
    this._linkMap.delete(unitId);
    this._linkPositionMap.delete(unitId);
    this._linkUpdate$.next({
      type: "unload",
      unitId,
      unitLinks: links
    });
  }
  getAll() {
    const unitIds = Array.from(this._linkMap.keys());
    return unitIds.map((unitId) => this.getUnit(unitId));
  }
};
HyperLinkModel = __decorateClass([
  __decorateParam(0, IUniverInstanceService)
], HyperLinkModel);

// ../packages/sheets-hyper-link/src/commands/mutations/add-hyper-link.mutation.ts
var AddHyperLinkMutation = {
  type: 2 /* MUTATION */,
  id: "sheets.mutation.add-hyper-link",
  handler(accessor, params) {
    if (!params) {
      return false;
    }
    const model = accessor.get(HyperLinkModel);
    const { unitId, subUnitId, link } = params;
    return model.addHyperLink(unitId, subUnitId, link);
  }
};

// ../packages/sheets-hyper-link/src/commands/mutations/remove-hyper-link.mutation.ts
var RemoveHyperLinkMutation = {
  type: 2 /* MUTATION */,
  id: "sheets.mutation.remove-hyper-link",
  handler(accessor, params) {
    if (!params) {
      return false;
    }
    const model = accessor.get(HyperLinkModel);
    const { unitId, subUnitId, id } = params;
    return model.removeHyperLink(unitId, subUnitId, id);
  }
};

// ../packages/sheets-hyper-link/src/commands/mutations/update-hyper-link.mutation.ts
var UpdateHyperLinkMutation = {
  type: 2 /* MUTATION */,
  id: "sheets.mutation.update-hyper-link",
  handler(accessor, params) {
    if (!params) {
      return false;
    }
    const model = accessor.get(HyperLinkModel);
    const { unitId, subUnitId, payload, id } = params;
    return model.updateHyperLink(unitId, subUnitId, id, payload, false);
  }
};
var UpdateHyperLinkRefMutation = {
  type: 2 /* MUTATION */,
  id: "sheets.mutation.update-hyper-link-ref",
  handler(accessor, params) {
    if (!params) {
      return false;
    }
    const model = accessor.get(HyperLinkModel);
    const { unitId, subUnitId, id, row, column, silent } = params;
    return model.updateHyperLinkRef(unitId, subUnitId, id, { row, column }, silent);
  }
};
var UpdateRichHyperLinkMutation = {
  type: 2 /* MUTATION */,
  id: "sheets.mutation.update-rich-hyper-link",
  handler(accessor, params) {
    var _a, _b, _c;
    if (!params) {
      return false;
    }
    const { unitId, subUnitId, row, col, id, url } = params;
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const sheetTarget = getSheetCommandTarget(univerInstanceService, { unitId, subUnitId });
    if (!sheetTarget) {
      return false;
    }
    const { worksheet } = sheetTarget;
    const cell = worksheet.getCellRaw(row, col);
    const link = (_c = (_b = (_a = cell == null ? void 0 : cell.p) == null ? void 0 : _a.body) == null ? void 0 : _b.customRanges) == null ? void 0 : _c.find((range) => range.rangeType === 0 /* HYPERLINK */ && range.rangeId === id);
    if (!link) {
      return true;
    }
    link.properties.url = url;
    return true;
  }
};

// ../packages/sheets-hyper-link/src/types/const.ts
var SHEET_HYPER_LINK_PLUGIN = "SHEET_HYPER_LINK_PLUGIN";
var ERROR_RANGE = "err";

// ../packages/sheets-hyper-link/src/controllers/ref-range.controller.ts
var SheetsHyperLinkRefRangeController = class extends Disposable {
  constructor(_refRangeService, _hyperLinkModel, _selectionManagerService, _commandService) {
    super();
    __publicField(this, "_refRangeService", _refRangeService);
    __publicField(this, "_hyperLinkModel", _hyperLinkModel);
    __publicField(this, "_selectionManagerService", _selectionManagerService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_disposableMap", /* @__PURE__ */ new Map());
    __publicField(this, "_watchDisposableMap", /* @__PURE__ */ new Map());
    __publicField(this, "_rangeDisableMap", /* @__PURE__ */ new Map());
    __publicField(this, "_rangeWatcherMap", /* @__PURE__ */ new Map());
    __publicField(this, "_handlePositionChange", (unitId, subUnitId, link, resultRange, silent) => {
      const oldRange = {
        startColumn: link.column,
        endColumn: link.column,
        startRow: link.row,
        endRow: link.row
      };
      if (!resultRange) {
        return {
          redos: [{
            id: RemoveHyperLinkMutation.id,
            params: {
              unitId,
              subUnitId,
              id: link.id
            }
          }],
          undos: [{
            id: AddHyperLinkMutation.id,
            params: {
              unitId,
              subUnitId,
              link
            }
          }]
        };
      }
      return {
        redos: [{
          id: UpdateHyperLinkRefMutation.id,
          params: {
            unitId,
            subUnitId,
            id: link.id,
            row: resultRange.startRow,
            column: resultRange.startColumn,
            silent
          }
        }],
        undos: [{
          id: UpdateHyperLinkRefMutation.id,
          params: {
            unitId,
            subUnitId,
            id: link.id,
            row: oldRange.startRow,
            column: oldRange.startColumn,
            silent
          }
        }]
      };
    });
    this._initData();
    this._initRefRange();
  }
  _registerPosition(unitId, subUnitId, link) {
    const id = link.id;
    const oldRange = {
      startColumn: link.column,
      endColumn: link.column,
      startRow: link.row,
      endRow: link.row
    };
    const handleRefRangeChange = (commandInfo) => {
      const resultRanges = handleCommonRangeChangeWithEffectRefCommandsSkipNoInterests(oldRange, commandInfo, { selectionManagerService: this._selectionManagerService });
      const resultRange = Array.isArray(resultRanges) ? resultRanges[0] : resultRanges;
      if (resultRange && resultRange.startColumn === oldRange.startColumn && resultRange.startRow === oldRange.startRow) {
        return {
          undos: [],
          redos: []
        };
      }
      const res = this._handlePositionChange(unitId, subUnitId, link, resultRange, false);
      return res;
    };
    this._disposableMap.set(id, this._refRangeService.registerRefRange(oldRange, handleRefRangeChange, unitId, subUnitId));
  }
  _watchPosition(unitId, subUnitId, link) {
    const id = link.id;
    const oldRange = {
      startColumn: link.column,
      endColumn: link.column,
      startRow: link.row,
      endRow: link.row
    };
    this._watchDisposableMap.set(id, this._refRangeService.watchRange(unitId, subUnitId, oldRange, (before, after) => {
      const { redos } = this._handlePositionChange(unitId, subUnitId, link, after, true);
      sequenceExecuteAsync(redos, this._commandService, { onlyLocal: true });
    }, true));
  }
  _unregisterPosition(id) {
    const disposable = this._disposableMap.get(id);
    disposable == null ? void 0 : disposable.dispose();
    this._disposableMap.delete(id);
  }
  _unwatchPosition(id) {
    const disposable = this._watchDisposableMap.get(id);
    disposable == null ? void 0 : disposable.dispose();
    this._watchDisposableMap.delete(id);
  }
  _registerRange(unitId, id, payload, silent = false) {
    var _a, _b, _c;
    if (payload.startsWith("#")) {
      const search = new URLSearchParams(payload.slice(1));
      const searchObj = {
        gid: (_a = search.get("gid")) != null ? _a : "",
        range: (_b = search.get("range")) != null ? _b : "",
        rangeid: (_c = search.get("rangeid")) != null ? _c : ""
      };
      if (searchObj.range && searchObj.gid) {
        const subUnitId = searchObj.gid;
        const range = deserializeRangeWithSheet(searchObj.range).range;
        if (isValidRange(range) && searchObj.range !== ERROR_RANGE) {
          const handleRangeChange = (commandInfo) => {
            const resultRange = handleDefaultRangeChangeWithEffectRefCommandsSkipNoInterests(range, commandInfo, { selectionManagerService: this._selectionManagerService });
            if (resultRange && serializeRange(resultRange) === serializeRange(range)) {
              return {
                redos: [],
                undos: []
              };
            }
            return {
              redos: [{
                id: UpdateHyperLinkMutation.id,
                params: {
                  unitId,
                  subUnitId,
                  id,
                  payload: {
                    payload: `#gid=${subUnitId}&range=${resultRange ? serializeRange(resultRange) : "err"}`
                  }
                }
              }],
              undos: [{
                id: UpdateHyperLinkMutation.id,
                params: {
                  unitId,
                  subUnitId,
                  id,
                  payload: {
                    payload
                  }
                }
              }]
            };
          };
          this._rangeDisableMap.set(id, this._refRangeService.registerRefRange(range, handleRangeChange, unitId, subUnitId));
          if (!silent) {
            this._rangeWatcherMap.set(id, this._refRangeService.watchRange(unitId, subUnitId, range, (before, after) => {
              this._hyperLinkModel.updateHyperLink(unitId, subUnitId, id, {
                payload: `#gid=${subUnitId}&range=${after ? serializeRange(after) : "err"}`
              }, true);
            }, true));
          }
        }
      }
    }
  }
  _unregisterRange(id) {
    const disposable = this._rangeDisableMap.get(id);
    disposable == null ? void 0 : disposable.dispose();
    this._rangeDisableMap.delete(id);
  }
  _unwatchRange(id) {
    const disposable = this._rangeWatcherMap.get(id);
    disposable == null ? void 0 : disposable.dispose();
    this._rangeWatcherMap.delete(id);
  }
  _initData() {
    const data = this._hyperLinkModel.getAll();
    data.forEach((unitData) => {
      unitData.forEach((subUnitData) => {
        const { unitId, subUnitId, links } = subUnitData;
        links.forEach((link) => {
          this._registerPosition(unitId, subUnitId, link);
          this._watchPosition(unitId, subUnitId, link);
          this._registerRange(unitId, link.id, link.payload);
        });
      });
    });
  }
  _initRefRange() {
    this.disposeWithMe(
      this._hyperLinkModel.linkUpdate$.subscribe((option) => {
        switch (option.type) {
          case "add": {
            this._registerPosition(option.unitId, option.subUnitId, option.payload);
            this._watchPosition(option.unitId, option.subUnitId, option.payload);
            this._registerRange(option.unitId, option.payload.id, option.payload.payload);
            break;
          }
          case "remove": {
            this._unregisterPosition(option.payload.id);
            this._unwatchPosition(option.payload.id);
            this._unregisterRange(option.payload.id);
            this._unwatchRange(option.payload.id);
            break;
          }
          case "updateRef": {
            const { unitId, subUnitId, id, silent } = option;
            const link = this._hyperLinkModel.getHyperLink(unitId, subUnitId, id);
            if (!link) {
              return;
            }
            this._unregisterPosition(id);
            this._registerPosition(unitId, subUnitId, link);
            if (!silent) {
              this._unwatchPosition(id);
              this._watchPosition(unitId, subUnitId, link);
            }
            break;
          }
          case "unload": {
            const { unitLinks } = option;
            unitLinks.forEach((subUnitData) => {
              const { links } = subUnitData;
              links.forEach((link) => {
                this._unregisterPosition(link.id);
                this._unwatchPosition(link.id);
                this._unregisterRange(link.id);
                this._unwatchRange(link.id);
              });
            });
            break;
          }
          case "update": {
            if (!option.silent) {
              this._unwatchRange(option.id);
            }
            this._unregisterRange(option.id);
            this._registerRange(option.unitId, option.id, option.payload.payload, option.silent);
            break;
          }
        }
      })
    );
    this.disposeWithMe(toDisposable(() => {
      this._disposableMap.forEach((item) => {
        item.dispose();
      });
      this._disposableMap.clear();
    }));
  }
};
SheetsHyperLinkRefRangeController = __decorateClass([
  __decorateParam(0, Inject(RefRangeService)),
  __decorateParam(1, Inject(HyperLinkModel)),
  __decorateParam(2, Inject(SheetsSelectionsService)),
  __decorateParam(3, ICommandService)
], SheetsHyperLinkRefRangeController);

// ../packages/sheets-hyper-link/src/controllers/remove-sheet.controller.ts
var SheetsHyperLinkRemoveSheetController = class extends Disposable {
  constructor(_sheetInterceptorService, _univerInstanceService, _hyperLinkModel) {
    super();
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_hyperLinkModel", _hyperLinkModel);
    this._initSheetChange();
  }
  _initSheetChange() {
    this.disposeWithMe(
      this._sheetInterceptorService.interceptCommand({
        getMutations: (commandInfo) => {
          var _a;
          if (commandInfo.id === RemoveSheetCommand.id) {
            const params = commandInfo.params;
            const workbook = params.unitId ? this._univerInstanceService.getUnit(params.unitId) : this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
            if (!workbook) {
              return { redos: [], undos: [] };
            }
            const unitId = workbook.getUnitId();
            const subUnitId = params.subUnitId || ((_a = workbook.getActiveSheet()) == null ? void 0 : _a.getSheetId());
            if (!subUnitId) {
              return { redos: [], undos: [] };
            }
            const links = this._hyperLinkModel.getSubUnit(unitId, subUnitId);
            const redos = links.map((link) => ({
              id: RemoveHyperLinkMutation.id,
              params: {
                unitId,
                subUnitId,
                id: link.id
              }
            }));
            const undos = links.map((link) => ({
              id: AddHyperLinkMutation.id,
              params: {
                unitId,
                subUnitId,
                link
              }
            }));
            return { redos, undos };
          }
          return { redos: [], undos: [] };
        }
      })
    );
  }
};
SheetsHyperLinkRemoveSheetController = __decorateClass([
  __decorateParam(0, Inject(SheetInterceptorService)),
  __decorateParam(1, IUniverInstanceService),
  __decorateParam(2, Inject(HyperLinkModel))
], SheetsHyperLinkRemoveSheetController);

// ../packages/sheets-hyper-link/src/controllers/rich-text-ref-range.controller.ts
var SheetsHyperLinkRichTextRefRangeController = class extends Disposable {
  constructor(_commandService, _univerInstanceService, _refRangeService) {
    super();
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_refRangeService", _refRangeService);
    __publicField(this, "_refRangeMap", /* @__PURE__ */ new Map());
    this._initWorkbookLoad();
    this._initWorkbookUnload();
    this._initSetRangesListener();
  }
  _enusreMap(unitId, subUnitId) {
    let unitMap = this._refRangeMap.get(unitId);
    if (!unitMap) {
      unitMap = /* @__PURE__ */ new Map();
      this._refRangeMap.set(unitId, unitMap);
    }
    let subUnitMap = unitMap.get(subUnitId);
    if (!subUnitMap) {
      subUnitMap = new ObjectMatrix();
      unitMap.set(subUnitId, subUnitMap);
    }
    return subUnitMap;
  }
  _isLegalRangeUrl(unitId, payload) {
    var _a, _b, _c;
    const workbook = this._univerInstanceService.getUnit(unitId, 2 /* UNIVER_SHEET */);
    if (!workbook) {
      return null;
    }
    if (payload && payload.startsWith("#")) {
      const search = new URLSearchParams(payload.slice(1));
      const searchObj = {
        gid: (_a = search.get("gid")) != null ? _a : "",
        range: (_b = search.get("range")) != null ? _b : "",
        rangeid: (_c = search.get("rangeid")) != null ? _c : ""
      };
      if (searchObj.range && searchObj.gid) {
        const subUnitId = searchObj.gid;
        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) {
          return null;
        }
        const range = deserializeRangeWithSheet(searchObj.range).range;
        if (isValidRange(range, worksheet) && searchObj.range !== ERROR_RANGE) {
          return {
            range,
            worksheet
          };
        }
      }
    }
    return null;
  }
  _registerRange(unitId, subUnitId, row, col, p) {
    var _a, _b, _c, _d;
    const map2 = this._enusreMap(unitId, subUnitId);
    if ((_b = (_a = p.body) == null ? void 0 : _a.customRanges) == null ? void 0 : _b.some((customRange) => {
      var _a2;
      return customRange.rangeType === 0 /* HYPERLINK */ && this._isLegalRangeUrl(unitId, (_a2 = customRange.properties) == null ? void 0 : _a2.url);
    })) {
      const disposableCollection = new DisposableCollection();
      let hasWatch = false;
      (_d = (_c = p.body) == null ? void 0 : _c.customRanges) == null ? void 0 : _d.forEach((customRange) => {
        var _a2;
        if (customRange.rangeType === 0 /* HYPERLINK */) {
          const payload = (_a2 = customRange.properties) == null ? void 0 : _a2.url;
          const rangeInfo = this._isLegalRangeUrl(unitId, payload);
          if (rangeInfo) {
            const { range, worksheet } = rangeInfo;
            hasWatch = true;
            disposableCollection.add(
              this._refRangeService.registerRefRange(
                range,
                (commandInfo) => {
                  const newRange = handleDefaultRangeChangeWithEffectRefCommands(range, commandInfo);
                  if (newRange && Rectangle.equals(newRange, range)) {
                    return {
                      preRedos: [],
                      preUndos: [],
                      redos: [],
                      undos: []
                    };
                  }
                  return {
                    preRedos: [{
                      id: UpdateRichHyperLinkMutation.id,
                      params: {
                        unitId,
                        subUnitId,
                        row,
                        col,
                        id: customRange.rangeId,
                        url: `#gid=${subUnitId}&range=${newRange ? serializeRange(newRange) : ERROR_RANGE}`
                      }
                    }],
                    undos: [{
                      id: UpdateRichHyperLinkMutation.id,
                      params: {
                        unitId,
                        subUnitId,
                        row,
                        col,
                        id: customRange.rangeId,
                        url: payload
                      }
                    }],
                    redos: []
                  };
                },
                worksheet.getUnitId(),
                worksheet.getSheetId()
              )
            );
          }
        }
      });
      if (hasWatch) {
        map2.setValue(row, col, disposableCollection);
      }
    }
  }
  _initWorkbookLoad() {
    const handleWorkbook = (workbook) => {
      const unitId = workbook.getUnitId();
      workbook.getSheets().forEach((sheet) => {
        const subUnitId = sheet.getSheetId();
        const map2 = this._enusreMap(unitId, subUnitId);
        sheet.getCellMatrix().forValue((row, col, cell) => {
          const dispose = map2.getValue(row, col);
          if (dispose) {
            dispose.dispose();
          }
          if (cell && cell.p) {
            this._registerRange(unitId, subUnitId, row, col, cell.p);
          }
        });
      });
    };
    this._univerInstanceService.getAllUnitsForType(2 /* UNIVER_SHEET */).forEach((workbook) => {
      handleWorkbook(workbook);
    });
    this.disposeWithMe(
      this._univerInstanceService.unitAdded$.subscribe((event) => {
        const { unit } = event;
        if (unit.type === 2 /* UNIVER_SHEET */) {
          const workbook = unit;
          handleWorkbook(workbook);
        }
      })
    );
  }
  _initWorkbookUnload() {
    this.disposeWithMe(
      this._univerInstanceService.unitDisposed$.subscribe((unit) => {
        if (unit.type === 2 /* UNIVER_SHEET */) {
          const workbook = unit;
          const unitId = workbook.getUnitId();
          workbook.getSheets().forEach((sheet) => {
            const subUnitId = sheet.getSheetId();
            const map2 = this._enusreMap(unitId, subUnitId);
            map2.forValue((row, col, dispose) => {
              if (dispose) {
                dispose.dispose();
              }
            });
          });
          this._refRangeMap.delete(unitId);
        }
      })
    );
  }
  _initSetRangesListener() {
    this.disposeWithMe(
      this._commandService.onCommandExecuted((commandInfo) => {
        if (commandInfo.id === SetRangeValuesMutation.id) {
          const params = commandInfo.params;
          const { unitId, subUnitId, cellValue } = params;
          const map2 = this._enusreMap(unitId, subUnitId);
          if (cellValue) {
            new ObjectMatrix(cellValue).forValue((row, col, cell) => {
              const dispose = map2.getValue(row, col);
              if (dispose) {
                dispose.dispose();
              }
              if (cell && cell.p) {
                this._registerRange(unitId, subUnitId, row, col, cell.p);
              }
            });
          }
        }
      })
    );
    this.disposeWithMe(
      this._commandService.onCommandExecuted((commandInfo) => {
        if (commandInfo.id === UpdateRichHyperLinkMutation.id) {
          const params = commandInfo.params;
          const { unitId, subUnitId, row, col } = params;
          const sheetTarget = getSheetCommandTarget(this._univerInstanceService, { unitId, subUnitId });
          const map2 = this._enusreMap(unitId, subUnitId);
          const dispose = map2.getValue(row, col);
          if (dispose) {
            dispose.dispose();
          }
          if (sheetTarget) {
            const { worksheet } = sheetTarget;
            const cell = worksheet.getCellRaw(row, col);
            if (cell && cell.p) {
              this._registerRange(unitId, subUnitId, row, col, cell.p);
            }
          }
        }
      })
    );
  }
};
SheetsHyperLinkRichTextRefRangeController = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IUniverInstanceService),
  __decorateParam(2, Inject(RefRangeService))
], SheetsHyperLinkRichTextRefRangeController);

// ../packages/sheets-hyper-link/src/controllers/set-range.controller.ts
var SheetHyperLinkSetRangeController = class extends Disposable {
  constructor(_sheetInterceptorService, _hyperLinkModel, _selectionManagerService, _univerInstanceService) {
    super();
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_hyperLinkModel", _hyperLinkModel);
    __publicField(this, "_selectionManagerService", _selectionManagerService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    this._initCommandInterceptor();
    this._initAfterEditor();
  }
  _initCommandInterceptor() {
    this._initSetRangeValuesCommandInterceptor();
    this._initClearSelectionCommandInterceptor();
  }
  _initSetRangeValuesCommandInterceptor() {
    this.disposeWithMe(this._sheetInterceptorService.interceptCommand({
      getMutations: (command) => {
        if (command.id === SetRangeValuesCommand.id) {
          const params = command.params;
          const { unitId, subUnitId } = params;
          const redos = [];
          const undos = [];
          if (params.cellValue) {
            new ObjectMatrix(params.cellValue).forValue((row, col) => {
              const link = this._hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, row, col);
              if (link) {
                redos.push({
                  id: RemoveHyperLinkMutation.id,
                  params: {
                    unitId,
                    subUnitId,
                    id: link.id
                  }
                });
                undos.push({
                  id: AddHyperLinkMutation.id,
                  params: {
                    unitId,
                    subUnitId,
                    link
                  }
                });
              }
            });
          }
          return {
            undos,
            redos
          };
        }
        return {
          redos: [],
          undos: []
        };
      }
    }));
  }
  _initClearSelectionCommandInterceptor() {
    this.disposeWithMe(this._sheetInterceptorService.interceptCommand({
      getMutations: (command) => {
        if (command.id === ClearSelectionContentCommand.id || command.id === ClearSelectionAllCommand.id || command.id === ClearSelectionFormatCommand.id) {
          const redos = [];
          const undos = [];
          const selection = this._selectionManagerService.getCurrentLastSelection();
          const target = getSheetCommandTarget(this._univerInstanceService, command.params);
          if (selection && target) {
            const { unitId, subUnitId } = target;
            Range.foreach(selection.range, (row, col) => {
              const link = this._hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, row, col);
              if (link) {
                redos.push({
                  id: RemoveHyperLinkMutation.id,
                  params: {
                    unitId,
                    subUnitId,
                    id: link.id
                  }
                });
                undos.push({
                  id: AddHyperLinkMutation.id,
                  params: {
                    unitId,
                    subUnitId,
                    link
                  }
                });
              }
            });
          }
          return {
            redos,
            undos
          };
        }
        return {
          redos: [],
          undos: []
        };
      }
    }));
  }
  _initAfterEditor() {
    this.disposeWithMe(this._sheetInterceptorService.writeCellInterceptor.intercept(AFTER_CELL_EDIT, {
      handler: (cell, context, next) => {
        if (!cell || cell.p) {
          return next(cell);
        }
        if (typeof cell.v === "string" && Tools.isLegalUrl(cell.v) && cell.v[cell.v.length - 1] !== " ") {
          const { unitId, subUnitId, row, col } = context;
          const link = Tools.normalizeUrl(cell.v);
          const workbook = this._univerInstanceService.getUnit(unitId, 2 /* UNIVER_SHEET */);
          const worksheet = workbook == null ? void 0 : workbook.getSheetBySheetId(subUnitId);
          if (!worksheet) {
            return next(cell);
          }
          const doc = worksheet.getBlankCellDocumentModel(cell, row, col);
          if (!doc.documentModel) {
            return next(cell);
          }
          const textX = BuildTextUtils.selection.replace({
            selection: {
              startOffset: 0,
              endOffset: cell.v.length,
              collapsed: false
            },
            body: {
              dataStream: `${cell.v}`,
              customRanges: [{
                startIndex: 0,
                endIndex: cell.v.length - 1,
                rangeId: generateRandomId(),
                rangeType: 0 /* HYPERLINK */,
                properties: {
                  url: link
                }
              }]
            },
            doc: doc.documentModel
          });
          if (!textX) {
            return next(cell);
          }
          const body = doc.documentModel.getBody();
          TextX.apply(body, textX.serialize());
          return next({
            ...cell,
            p: {
              id: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
              body,
              documentStyle: {
                pageSize: {
                  width: Infinity,
                  height: Infinity
                }
              }
            }
          });
        }
        return next(cell);
      }
    }));
  }
};
SheetHyperLinkSetRangeController = __decorateClass([
  __decorateParam(0, Inject(SheetInterceptorService)),
  __decorateParam(1, Inject(HyperLinkModel)),
  __decorateParam(2, Inject(SheetsSelectionsService)),
  __decorateParam(3, IUniverInstanceService)
], SheetHyperLinkSetRangeController);

// ../packages/sheets-hyper-link/src/commands/commands/add-hyper-link.command.ts
var AddHyperLinkCommand = {
  type: 0 /* COMMAND */,
  id: "sheets.command.add-hyper-link",
  // eslint-disable-next-line max-lines-per-function
  async handler(accessor, params) {
    if (!params) return false;
    const commandService = accessor.get(ICommandService);
    const undoRedoService = accessor.get(IUndoRedoService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const hyperLinkModel = accessor.get(HyperLinkModel);
    const sheetInterceptorService = accessor.get(SheetInterceptorService);
    const target = getSheetCommandTarget(univerInstanceService, params);
    if (!target) return false;
    const { unitId, subUnitId, workbook, worksheet } = target;
    const { link } = params;
    const { payload, display, row, column, id } = link;
    const cellData = worksheet.getCell(row, column);
    const doc = worksheet.getBlankCellDocumentModel(cellData, row, column);
    const snapshot = doc.documentModel.getSnapshot();
    const body = Tools.deepClone(snapshot.body);
    if (!body) return false;
    let textX;
    if (display) {
      textX = BuildTextUtils.selection.replace({
        selection: {
          startOffset: 0,
          endOffset: body.dataStream.length - 2,
          collapsed: body.dataStream.length - 2 === 0
        },
        body: {
          dataStream: `${display}`,
          customRanges: [{
            startIndex: 0,
            endIndex: display.length - 1,
            rangeType: 0 /* HYPERLINK */,
            rangeId: id,
            properties: {
              url: payload
              // refId: id,
            }
          }]
        },
        doc: doc.documentModel
      });
    } else {
      textX = BuildTextUtils.customRange.add({
        body,
        ranges: [{ startOffset: 0, endOffset: body.dataStream.length - 2, collapsed: false }],
        rangeId: id,
        rangeType: 0 /* HYPERLINK */,
        properties: {
          url: payload,
          refId: id
        }
      });
    }
    if (!textX) return false;
    const newBody = TextX.apply(body, textX.serialize());
    const rangeValue = {
      ...snapshot,
      body: newBody
    };
    const newCellData = {
      p: rangeValue,
      t: 1 /* STRING */
    };
    const finalCellData = sheetInterceptorService.onWriteCell(workbook, worksheet, row, column, newCellData);
    const redoParams = {
      unitId,
      subUnitId,
      cellValue: {
        [link.row]: {
          [link.column]: finalCellData
        }
      }
    };
    const redo = {
      id: SetRangeValuesMutation.id,
      params: redoParams
    };
    const undoParams = SetRangeValuesUndoMutationFactory(accessor, redoParams);
    const undo = {
      id: SetRangeValuesMutation.id,
      params: undoParams
    };
    const redos = [redo];
    const undos = [undo];
    const modelLink = hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, row, column);
    if (modelLink) {
      redos.push({
        id: RemoveHyperLinkMutation.id,
        params: {
          unitId,
          subUnitId,
          id: modelLink.id
        }
      });
      undos.push({
        id: AddHyperLinkMutation.id,
        params: {
          unitId,
          subUnitId,
          link: modelLink
        }
      });
    }
    const res = await sequenceExecute(redos, commandService);
    if (res) {
      const isValid = await sheetInterceptorService.onValidateCell(workbook, worksheet, row, column);
      if (isValid === false) {
        sequenceExecute(undos, commandService);
        return false;
      }
      undoRedoService.pushUndoRedo({
        redoMutations: redos,
        undoMutations: undos,
        unitID: unitId
      });
      return true;
    }
    return false;
  }
};
var AddRichHyperLinkCommand = {
  id: "sheets.command.add-rich-hyper-link",
  type: 0 /* COMMAND */,
  handler: async (accessor, params) => {
    if (!params) {
      return false;
    }
    const { documentId, link } = params;
    const commandService = accessor.get(ICommandService);
    const newId = generateRandomId();
    const { payload } = link;
    const replaceSelection = addCustomRangeBySelectionFactory(accessor, {
      unitId: documentId,
      rangeId: newId,
      rangeType: 0 /* HYPERLINK */,
      properties: {
        url: payload,
        refId: newId
      }
    });
    if (replaceSelection) {
      return commandService.syncExecuteCommand(replaceSelection.id, replaceSelection.params);
    }
    return false;
  }
};

// ../packages/sheets-hyper-link/src/commands/commands/remove-hyper-link.command.ts
var CancelHyperLinkCommand = {
  type: 0 /* COMMAND */,
  id: "sheets.command.cancel-hyper-link",
  // eslint-disable-next-line max-lines-per-function
  handler(accessor, params) {
    var _a, _b;
    if (!params) return false;
    const commandService = accessor.get(ICommandService);
    const undoRedoService = accessor.get(IUndoRedoService);
    const instanceSrv = accessor.get(IUniverInstanceService);
    const hyperLinkModel = accessor.get(HyperLinkModel);
    const target = getSheetCommandTarget(instanceSrv, params);
    if (!target) return false;
    const { row, column, id } = params;
    const { unitId, subUnitId, worksheet } = target;
    const cellData = worksheet.getCell(row, column);
    if (!cellData) return false;
    const doc = worksheet.getCellDocumentModelWithFormula(cellData, row, column);
    if (!(doc == null ? void 0 : doc.documentModel)) return false;
    const snapshot = Tools.deepClone(doc.documentModel.getSnapshot());
    const range = (_b = (_a = snapshot.body) == null ? void 0 : _a.customRanges) == null ? void 0 : _b.find((range2) => `${range2.rangeId}` === id);
    if (!range) return false;
    const textX = BuildTextUtils.customRange.delete({ documentDataModel: doc.documentModel, rangeId: range.rangeId });
    if (!textX) return false;
    const newBody = TextX.apply(snapshot.body, textX.serialize());
    const redos = [];
    const undos = [];
    const setRangeParams = {
      unitId,
      subUnitId,
      cellValue: {
        [row]: {
          [column]: {
            p: {
              ...snapshot,
              body: newBody
            },
            t: 1 /* STRING */
          }
        }
      }
    };
    redos.push({
      id: SetRangeValuesMutation.id,
      params: setRangeParams
    });
    const undoParams = SetRangeValuesUndoMutationFactory(accessor, setRangeParams);
    undos.push({
      id: SetRangeValuesMutation.id,
      params: undoParams
    });
    const link = hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, row, column);
    if (link) {
      redos.push({
        id: RemoveHyperLinkMutation.id,
        params: {
          unitId,
          subUnitId,
          id: link.id
        }
      });
      undos.push({
        id: AddHyperLinkMutation.id,
        params: {
          unitId,
          subUnitId,
          link: {
            ...link
          }
        }
      });
    }
    const res = sequenceExecute(redos, commandService).result;
    if (res) {
      undoRedoService.pushUndoRedo({
        redoMutations: redos,
        undoMutations: undos,
        unitID: unitId
      });
      return true;
    }
    return false;
  }
};
var CancelRichHyperLinkCommand = {
  type: 0 /* COMMAND */,
  id: "sheets.command.cancel-rich-hyper-link",
  handler(accessor, params) {
    var _a, _b;
    if (!params) {
      return false;
    }
    const { id: linkId, documentId } = params;
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const doc = univerInstanceService.getUnit(documentId, 1 /* UNIVER_DOC */);
    const link = (_b = (_a = doc == null ? void 0 : doc.getBody()) == null ? void 0 : _a.customRanges) == null ? void 0 : _b.find((i) => i.rangeId === linkId);
    let insert = null;
    if (link && link.endIndex === doc.getBody().dataStream.length - 3) {
      insert = {
        dataStream: " "
      };
    }
    const doMutation = deleteCustomRangeFactory(accessor, { unitId: documentId, rangeId: linkId, insert });
    if (!doMutation) {
      return false;
    }
    return commandService.syncExecuteCommand(doMutation.id, doMutation.params);
  }
};

// ../packages/sheets-hyper-link/src/commands/commands/update-hyper-link.command.ts
var UpdateHyperLinkCommand = {
  type: 0 /* COMMAND */,
  id: "sheets.command.update-hyper-link",
  // eslint-disable-next-line max-lines-per-function
  async handler(accessor, params) {
    var _a, _b, _c;
    if (!params) return false;
    const commandService = accessor.get(ICommandService);
    const undoRedoService = accessor.get(IUndoRedoService);
    const instanceSrv = accessor.get(IUniverInstanceService);
    const hyperLinkModel = accessor.get(HyperLinkModel);
    const interceptorService = accessor.get(SheetInterceptorService);
    const target = getSheetCommandTarget(instanceSrv, {
      unitId: params.unitId,
      subUnitId: params.subUnitId
    });
    if (!target) return false;
    const { payload: link, row, column, id } = params;
    const { workbook, worksheet, unitId, subUnitId } = target;
    const { payload, display = "" } = link;
    const cellData = worksheet.getCell(row, column);
    if (!cellData) return false;
    const doc = worksheet.getCellDocumentModelWithFormula(cellData, row, column);
    if (!(doc == null ? void 0 : doc.documentModel)) return false;
    const snapshot = doc.documentModel.getSnapshot();
    const range = (_b = (_a = snapshot.body) == null ? void 0 : _a.customRanges) == null ? void 0 : _b.find((range2) => `${range2.rangeId}` === id);
    if (!range) return false;
    const newId = generateRandomId();
    const oldBody = getBodySlice(doc.documentModel.getBody(), range.startIndex, range.endIndex + 1);
    const textRun = (_c = oldBody.textRuns) == null ? void 0 : _c[0];
    if (textRun) {
      textRun.ed = display.length + 1;
    }
    const replaceSelection = replaceSelectionFactory(accessor, {
      unitId,
      body: {
        dataStream: `${display}`,
        customRanges: [{
          rangeId: newId,
          rangeType: 0 /* HYPERLINK */,
          startIndex: 0,
          endIndex: display.length - 1,
          properties: {
            url: payload
          }
        }],
        textRuns: textRun ? [textRun] : void 0
      },
      selection: {
        startOffset: range.startIndex,
        endOffset: range.endIndex + 1,
        collapsed: false
      },
      doc: doc.documentModel
    });
    if (!replaceSelection) {
      return false;
    }
    const newBody = TextX.apply(Tools.deepClone(snapshot.body), replaceSelection.textX.serialize());
    const newCellData = {
      p: {
        ...snapshot,
        body: newBody
      },
      t: 1 /* STRING */
    };
    const finalCellData = interceptorService.onWriteCell(workbook, worksheet, row, column, newCellData);
    const redo = {
      id: SetRangeValuesMutation.id,
      params: {
        unitId,
        subUnitId,
        cellValue: {
          [row]: {
            [column]: finalCellData
          }
        }
      }
    };
    const undoParams = SetRangeValuesUndoMutationFactory(accessor, redo.params);
    const undo = {
      id: SetRangeValuesMutation.id,
      params: undoParams
    };
    const redos = [redo];
    const undos = [undo];
    const modelLink = hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, row, column);
    if (modelLink) {
      redos.push({
        id: RemoveHyperLinkMutation.id,
        params: {
          unitId,
          subUnitId,
          id: modelLink.id
        }
      });
      undos.push({
        id: AddHyperLinkMutation.id,
        params: {
          unitId,
          subUnitId,
          link: modelLink
        }
      });
    }
    const res = sequenceExecute(redos, commandService);
    if (res.result) {
      const isValid = await interceptorService.onValidateCell(workbook, worksheet, row, column);
      if (isValid === false) {
        sequenceExecute(undos, commandService);
        return false;
      }
      undoRedoService.pushUndoRedo({
        redoMutations: redos,
        undoMutations: undos,
        unitID: unitId
      });
      return true;
    }
    return false;
  }
};
var UpdateRichHyperLinkCommand = {
  type: 0 /* COMMAND */,
  id: "sheets.command.update-rich-hyper-link",
  handler: (accessor, params) => {
    var _a, _b, _c, _d;
    if (!params) {
      return false;
    }
    const { documentId: unitId, payload, id: rangeId } = params;
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const commandService = accessor.get(ICommandService);
    const doc = univerInstanceService.getUnit(unitId, 1 /* UNIVER_DOC */);
    if (!doc) {
      return false;
    }
    const range = (_b = (_a = doc.getBody()) == null ? void 0 : _a.customRanges) == null ? void 0 : _b.find((range2) => range2.rangeId === rangeId);
    if (!range) {
      return false;
    }
    const display = (_c = params.payload.display) != null ? _c : "";
    const newId = generateRandomId();
    const oldBody = getBodySlice(doc.getBody(), range.startIndex, range.endIndex + 1);
    const textRun = (_d = oldBody.textRuns) == null ? void 0 : _d[0];
    if (textRun) {
      textRun.ed = display.length + 1;
    }
    const replaceSelection = replaceSelectionFactory(accessor, {
      unitId,
      body: {
        dataStream: `${display}`,
        customRanges: [{
          rangeId: newId,
          rangeType: 0 /* HYPERLINK */,
          startIndex: 0,
          endIndex: display.length - 1,
          properties: {
            url: payload.payload
          }
        }],
        textRuns: textRun ? [textRun] : void 0
      },
      selection: {
        startOffset: range.startIndex,
        endOffset: range.endIndex + 1,
        collapsed: false
      },
      doc
    });
    if (!replaceSelection) {
      return false;
    }
    return commandService.syncExecuteCommand(replaceSelection.id, replaceSelection.params);
  }
};

// ../packages/sheets-hyper-link/src/controllers/sheet-hyper-link.controller.ts
var SheetsHyperLinkController = class extends Disposable {
  constructor(_commandService) {
    super();
    __publicField(this, "_commandService", _commandService);
    this._registerCommands();
  }
  _registerCommands() {
    [
      AddHyperLinkCommand,
      UpdateHyperLinkCommand,
      CancelHyperLinkCommand,
      UpdateRichHyperLinkCommand,
      CancelRichHyperLinkCommand,
      AddRichHyperLinkCommand,
      AddHyperLinkMutation,
      UpdateHyperLinkMutation,
      RemoveHyperLinkMutation,
      UpdateHyperLinkRefMutation,
      UpdateRichHyperLinkMutation
    ].forEach((command) => {
      this._commandService.registerCommand(command);
    });
  }
};
SheetsHyperLinkController = __decorateClass([
  __decorateParam(0, ICommandService)
], SheetsHyperLinkController);

// ../packages/sheets-hyper-link/src/services/parser.service.ts
var SheetsHyperLinkParserService = class {
  constructor(_univerInstanceService, _localeService, _definedNamesService) {
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_definedNamesService", _definedNamesService);
  }
  buildHyperLink(defineNameIdOrRange, sheetId) {
    if (typeof defineNameIdOrRange === "string") {
      return `#${"rangeid" /* DEFINE_NAME */}=${defineNameIdOrRange}`;
    }
    let result = `#${"gid" /* SHEET */}=${sheetId}`;
    if (defineNameIdOrRange) {
      result += `&${"range" /* RANGE */}=${serializeRange(defineNameIdOrRange)}`;
    }
    return result;
  }
  parseHyperLink(urlStr) {
    var _a, _b, _c, _d;
    if (urlStr.startsWith("#")) {
      const search = new URLSearchParams(urlStr.slice(1));
      const searchObj = {
        gid: (_a = search.get("gid")) != null ? _a : "",
        range: (_b = search.get("range")) != null ? _b : "",
        rangeid: (_c = search.get("rangeid")) != null ? _c : "",
        unitid: (_d = search.get("unitid")) != null ? _d : ""
      };
      const urlInfo = this._getURLName(searchObj);
      return {
        type: urlInfo.type,
        name: urlInfo.name,
        url: urlStr,
        searchObj
      };
    } else {
      return {
        type: "url" /* URL */,
        name: urlStr,
        url: urlStr,
        searchObj: null
      };
    }
  }
  _getURLName(params) {
    var _a;
    const { gid, range, rangeid, unitid } = params;
    const workbook = unitid ? this._univerInstanceService.getUnit(unitid, 2 /* UNIVER_SHEET */) : this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    const invalidLink = {
      type: "invalid" /* INVALID */,
      name: this._localeService.t("sheets-hyper-link.message.refError")
    };
    if (!workbook) {
      return invalidLink;
    }
    const sheet = gid ? workbook.getSheetBySheetId(gid) : workbook.getActiveSheet();
    const sheetName = (_a = sheet == null ? void 0 : sheet.getName()) != null ? _a : "";
    if (range) {
      if (!sheet) return invalidLink;
      const rangeObj = deserializeRangeWithSheet(range).range;
      if (isValidRange(rangeObj, sheet) && range !== ERROR_RANGE) {
        return {
          type: "range" /* RANGE */,
          name: serializeRangeWithSheet(sheetName, rangeObj)
        };
      }
      return invalidLink;
    }
    if (rangeid) {
      const range2 = this._definedNamesService.getValueById(workbook.getUnitId(), rangeid);
      if (range2) {
        return {
          type: "rangeid" /* DEFINE_NAME */,
          name: range2.formulaOrRefString
        };
      }
      return invalidLink;
    }
    if (gid) {
      const worksheet = workbook.getSheetBySheetId(gid);
      if (worksheet) {
        return {
          type: "gid" /* SHEET */,
          name: worksheet.getName()
        };
      }
      return invalidLink;
    }
    return invalidLink;
  }
};
SheetsHyperLinkParserService = __decorateClass([
  __decorateParam(0, IUniverInstanceService),
  __decorateParam(1, Inject(LocaleService)),
  __decorateParam(2, IDefinedNamesService)
], SheetsHyperLinkParserService);

// ../packages/sheets-hyper-link/src/plugin.ts
var UniverSheetsHyperLinkPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig, _injector, _configService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_configService", _configService);
    const { ...rest } = merge_default(
      {},
      defaultPluginConfig,
      this._config
    );
    this._configService.setConfig(SHEETS_HYPER_LINK_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    registerDependencies(this._injector, [
      [HyperLinkModel],
      [SheetsHyperLinkParserService],
      [SheetsHyperLinkController],
      [SheetsHyperLinkRefRangeController],
      [SheetHyperLinkSetRangeController],
      [SheetsHyperLinkRemoveSheetController],
      [SheetsHyperLinkRichTextRefRangeController]
    ]);
    touchDependencies(this._injector, [
      [SheetsHyperLinkRefRangeController],
      [SheetsHyperLinkController],
      [SheetHyperLinkSetRangeController],
      [SheetsHyperLinkRemoveSheetController],
      [SheetsHyperLinkRichTextRefRangeController]
    ]);
  }
};
__publicField(UniverSheetsHyperLinkPlugin, "pluginName", SHEET_HYPER_LINK_PLUGIN);
__publicField(UniverSheetsHyperLinkPlugin, "packageName", package_default.name);
__publicField(UniverSheetsHyperLinkPlugin, "version", package_default.version);
__publicField(UniverSheetsHyperLinkPlugin, "type", 2 /* UNIVER_SHEET */);
UniverSheetsHyperLinkPlugin = __decorateClass([
  DependentOn(UniverSheetsPlugin),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IConfigService)
], UniverSheetsHyperLinkPlugin);

// ../packages/sheets-hyper-link-ui/package.json
var package_default2 = {
  name: "@univerjs/sheets-hyper-link-ui",
  version: "0.25.2",
  private: false,
  description: "Hyperlink editing UI for Univer Sheets.",
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
    "hyperlink",
    "link",
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
    "@univerjs/engine-formula": "workspace:*",
    "@univerjs/engine-render": "workspace:*",
    "@univerjs/icons": "1.4.0",
    "@univerjs/sheets": "workspace:*",
    "@univerjs/sheets-data-validation": "workspace:*",
    "@univerjs/sheets-formula-ui": "workspace:*",
    "@univerjs/sheets-hyper-link": "workspace:*",
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

// ../packages/sheets-hyper-link-ui/src/config/config.ts
var SHEETS_HYPER_LINK_UI_PLUGIN_CONFIG_KEY = "sheets-hyper-link-ui.config";
var configSymbol2 = Symbol(SHEETS_HYPER_LINK_UI_PLUGIN_CONFIG_KEY);
var defaultPluginConfig2 = {};

// ../packages/sheets-hyper-link-ui/src/types/const.ts
var SHEET_HYPER_LINK_UI_PLUGIN = "SHEET_HYPER_LINK_UI_PLUGIN";

// ../packages/sheets-hyper-link-ui/src/controllers/auto-fill.controller.ts
var SheetsHyperLinkAutoFillController = class extends Disposable {
  constructor(_autoFillService, _hyperLinkModel) {
    super();
    __publicField(this, "_autoFillService", _autoFillService);
    __publicField(this, "_hyperLinkModel", _hyperLinkModel);
    this._initAutoFill();
  }
  // eslint-disable-next-line max-lines-per-function
  _initAutoFill() {
    const noopReturnFunc = () => ({ redos: [], undos: [] });
    const generalApplyFunc = (location2, applyType) => {
      const { source: sourceRange, target: targetRange, unitId, subUnitId } = location2;
      const virtualRange = virtualizeDiscreteRanges([sourceRange, targetRange]);
      const [vSourceRange, vTargetRange] = virtualRange.ranges;
      const { mapFunc } = virtualRange;
      const sourceStartCell = {
        row: vSourceRange.startRow,
        col: vSourceRange.startColumn
      };
      const repeats = tools_default.getAutoFillRepeatRange(vSourceRange, vTargetRange);
      const redos = [];
      const undos = [];
      repeats.forEach((repeat) => {
        const targetStartCell = repeat.repeatStartCell;
        const relativeRange = repeat.relativeRange;
        const sourceRange2 = {
          startRow: sourceStartCell.row,
          startColumn: sourceStartCell.col,
          endColumn: sourceStartCell.col,
          endRow: sourceStartCell.row
        };
        const targetRange2 = {
          startRow: targetStartCell.row,
          startColumn: targetStartCell.col,
          endColumn: targetStartCell.col,
          endRow: targetStartCell.row
        };
        Range.foreach(relativeRange, (row, col) => {
          const sourcePositionRange = Rectangle.getPositionRange(
            {
              startRow: row,
              startColumn: col,
              endColumn: col,
              endRow: row
            },
            sourceRange2
          );
          const { row: sourceRow, col: sourceCol } = mapFunc(sourcePositionRange.startRow, sourcePositionRange.startColumn);
          const link = this._hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, sourceRow, sourceCol);
          const targetPositionRange = Rectangle.getPositionRange(
            {
              startRow: row,
              startColumn: col,
              endColumn: col,
              endRow: row
            },
            targetRange2
          );
          const { row: targetRow, col: targetCol } = mapFunc(targetPositionRange.startRow, targetPositionRange.startColumn);
          const id = generateRandomId();
          const currentLink = this._hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, targetRow, targetCol);
          if (currentLink) {
            redos.push({
              id: RemoveHyperLinkMutation.id,
              params: {
                unitId,
                subUnitId,
                id: currentLink.id
              }
            });
          }
          if (("COPY" /* COPY */ === applyType || "SERIES" /* SERIES */ === applyType) && link) {
            redos.push({
              id: AddHyperLinkMutation.id,
              params: {
                unitId,
                subUnitId,
                link: {
                  ...link,
                  id,
                  row: targetRow,
                  column: targetCol
                }
              }
            });
            undos.push({
              id: RemoveHyperLinkMutation.id,
              params: {
                unitId,
                subUnitId,
                id
              }
            });
          }
          if (currentLink) {
            undos.push({
              id: AddHyperLinkMutation.id,
              params: {
                unitId,
                subUnitId,
                link: currentLink
              }
            });
          }
        });
      });
      return {
        undos,
        redos
      };
    };
    const hook = {
      id: SHEET_HYPER_LINK_UI_PLUGIN,
      onFillData: (location2, direction, applyType) => {
        if (applyType === "COPY" /* COPY */ || applyType === "ONLY_FORMAT" /* ONLY_FORMAT */ || applyType === "SERIES" /* SERIES */) {
          return generalApplyFunc(location2, applyType);
        }
        return noopReturnFunc();
      }
    };
    this.disposeWithMe(this._autoFillService.addHook(hook));
  }
};
SheetsHyperLinkAutoFillController = __decorateClass([
  __decorateParam(0, IAutoFillService),
  __decorateParam(1, Inject(HyperLinkModel))
], SheetsHyperLinkAutoFillController);

// ../packages/sheets-hyper-link-ui/src/common/util.ts
function isLegalLink(link) {
  return Tools.isLegalUrl(link);
}
function hasProtocol(urlString) {
  const pattern = /^[a-zA-Z]+:\/\//;
  return pattern.test(urlString);
}
function isEmail(url) {
  const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return pattern.test(url);
}
function serializeUrl(urlStr) {
  if (isLegalLink(urlStr)) {
    const transformedUrl = hasProtocol(urlStr) ? urlStr : isEmail(urlStr) ? `mailto://${urlStr}` : `http://${urlStr}`;
    let url;
    try {
      url = new URL(transformedUrl);
    } catch {
      return urlStr;
    }
    if (url.hostname === location.hostname && url.port === location.port && url.protocol === location.protocol && url.pathname === location.pathname && url.hash && !url.search) {
      return url.hash;
    }
    return transformedUrl;
  }
  return urlStr;
}

// ../packages/sheets-hyper-link-ui/src/services/resolver.service.ts
function getContainRange(range, worksheet) {
  const mergedCells = worksheet.getMergeData();
  const maxCol = worksheet.getMaxColumns() - 1;
  const maxRow = worksheet.getMaxRows() - 1;
  if (maxCol < range.endColumn) {
    range.endColumn = maxCol;
  }
  if (maxRow < range.endRow) {
    range.endRow = maxRow;
  }
  if (range.rangeType === 2 /* COLUMN */ || 1 /* ROW */) {
    return range;
  }
  const relativeCells = [];
  mergedCells.forEach((cell) => {
    if (Rectangle.intersects(range, cell)) {
      relativeCells.push(cell);
    }
  });
  return Rectangle.realUnion(range, ...relativeCells);
}
var SheetsHyperLinkResolverService = class {
  constructor(_univerInstanceService, _commandService, _definedNamesService, _messageService, _localeService, _configService) {
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_definedNamesService", _definedNamesService);
    __publicField(this, "_messageService", _messageService);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_configService", _configService);
  }
  navigate(info) {
    switch (info.type) {
      case "url" /* URL */:
        this.navigateToOtherWebsite(info.url);
        break;
      default:
        this._navigateToUniver(info.searchObj);
    }
  }
  _navigateToUniver(params) {
    const { gid, range, rangeid } = params;
    const workbook = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    if (!workbook) {
      return;
    }
    const unitId = workbook.getUnitId();
    if (rangeid) {
      const item = this._definedNamesService.getValueById(unitId, rangeid);
      if (!item) {
        return;
      }
      const { formulaOrRefString } = item;
      const worksheet = this._definedNamesService.getWorksheetByRef(unitId, formulaOrRefString);
      if (!worksheet) {
        this._messageService.show({
          content: this._localeService.t("sheets-hyper-link-ui.message.refError"),
          type: "error" /* Error */
        });
        return;
      }
      const isHidden = worksheet.isSheetHidden();
      if (isHidden) {
        this._messageService.show({
          content: this._localeService.t("sheets-hyper-link-ui.message.hiddenSheet"),
          type: "error" /* Error */
        });
        return;
      }
      this.navigateToDefineName(unitId, rangeid);
    }
    if (!gid) {
      return;
    }
    if (range) {
      const rangeInfo = deserializeRangeWithSheet(range);
      if (isValidRange(rangeInfo.range) && range !== ERROR_RANGE) {
        this.navigateToRange(unitId, gid, rangeInfo.range);
      }
      return;
    }
    this.navigateToSheetById(unitId, gid);
  }
  async navigateToRange(unitId, subUnitId, range, forceTop) {
    const worksheet = await this.navigateToSheetById(unitId, subUnitId);
    if (worksheet) {
      const realRange = getContainRange(range, worksheet);
      await this._commandService.executeCommand(
        SetSelectionsOperation.id,
        {
          unitId,
          subUnitId,
          selections: [{
            range: realRange,
            primary: null
          }]
        }
      );
      await this._commandService.executeCommand(ScrollToRangeOperation.id, {
        range: realRange,
        forceTop
      });
    }
  }
  async navigateToSheetById(unitId, subUnitId) {
    const workbook = this._univerInstanceService.getUnit(unitId, 2 /* UNIVER_SHEET */);
    if (!workbook) {
      return false;
    }
    const worksheet = workbook.getActiveSheet();
    if (!worksheet) {
      return false;
    }
    if (worksheet.getSheetId() === subUnitId) {
      return worksheet;
    }
    const targetSheet = workbook.getSheetBySheetId(subUnitId);
    if (!targetSheet) {
      this._messageService.show({
        content: this._localeService.t("sheets-hyper-link-ui.message.noSheet"),
        type: "error" /* Error */
      });
      return false;
    }
    if (workbook.getHiddenWorksheets().indexOf(subUnitId) > -1) {
      this._messageService.show({
        content: this._localeService.t("sheets-hyper-link-ui.message.hiddenSheet"),
        type: "error" /* Error */
      });
      return false;
    }
    if (await this._commandService.executeCommand(SetWorksheetActiveOperation.id, { unitId, subUnitId })) {
      return targetSheet;
    }
    return false;
  }
  async navigateToDefineName(unitId, rangeId) {
    this._definedNamesService.focusRange(unitId, rangeId);
    return true;
  }
  async navigateToOtherWebsite(url) {
    var _a;
    if (!isSafeUrl(url)) {
      return;
    }
    const config = this._configService.getConfig(SHEETS_HYPER_LINK_UI_PLUGIN_CONFIG_KEY);
    if ((_a = config == null ? void 0 : config.urlHandler) == null ? void 0 : _a.navigateToOtherWebsite) {
      return config.urlHandler.navigateToOtherWebsite(url);
    }
    window.open(url, "_blank", "noopener noreferrer");
  }
};
SheetsHyperLinkResolverService = __decorateClass([
  __decorateParam(0, IUniverInstanceService),
  __decorateParam(1, ICommandService),
  __decorateParam(2, IDefinedNamesService),
  __decorateParam(3, IMessageService),
  __decorateParam(4, Inject(LocaleService)),
  __decorateParam(5, IConfigService)
], SheetsHyperLinkResolverService);

// ../packages/sheets-hyper-link-ui/src/controllers/copy-paste.controller.ts
var SheetsHyperLinkCopyPasteController = class extends Disposable {
  constructor(_sheetClipboardService, _hyperLinkModel, _injector, _resolverService) {
    super();
    __publicField(this, "_sheetClipboardService", _sheetClipboardService);
    __publicField(this, "_hyperLinkModel", _hyperLinkModel);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_resolverService", _resolverService);
    __publicField(this, "_plainTextFilter", /* @__PURE__ */ new Set());
    __publicField(this, "_copyInfo");
    this._initCopyPaste();
    this.disposeWithMe(() => {
      this._plainTextFilter.clear();
    });
  }
  registerPlainTextFilter(filter) {
    this._plainTextFilter.add(filter);
  }
  removePlainTextFilter(filter) {
    this._plainTextFilter.delete(filter);
  }
  /* If return false the process of paste text will be stop */
  _filterPlainText(text) {
    return Array.from(this._plainTextFilter).every((filter) => filter(text));
  }
  _initCopyPaste() {
    this._sheetClipboardService.addClipboardHook({
      id: SHEET_HYPER_LINK_UI_PLUGIN,
      onBeforeCopy: (unitId, subUnitId, range) => this._collect(unitId, subUnitId, range),
      onPasteCells: (pasteFrom, pasteTo, data, payload) => {
        const { copyType = "COPY" /* COPY */, pasteType } = payload;
        const { range: copyRange } = pasteFrom || {};
        const { range: pastedRange, unitId, subUnitId } = pasteTo;
        return this._generateMutations(pastedRange, { copyType, pasteType, copyRange, unitId, subUnitId });
      },
      onPastePlainText: (pasteTo, clipText) => {
        const filterResult = this._filterPlainText(clipText);
        if (isLegalLink(clipText) && filterResult) {
          const { range, unitId, subUnitId } = pasteTo;
          const { ranges: [pasteToRange], mapFunc } = virtualizeDiscreteRanges([range]);
          const redos = [];
          const undos = [];
          Range.foreach(pasteToRange, (originRow, originCol) => {
            const { row, col: column } = mapFunc(originRow, originCol);
            const link = this._hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, row, column);
            if (link) {
              redos.push({
                id: RemoveHyperLinkMutation.id,
                params: {
                  unitId,
                  subUnitId,
                  id: link.id
                }
              });
            }
            if (link) {
              undos.push({
                id: AddHyperLinkMutation.id,
                params: {
                  unitId,
                  subUnitId,
                  link
                }
              });
            }
          });
          return { redos, undos };
        }
        return { undos: [], redos: [] };
      },
      priority: 99
    });
  }
  _collect(unitId, subUnitId, range) {
    const matrix = new ObjectMatrix();
    this._copyInfo = {
      unitId,
      subUnitId,
      matrix
    };
    const discreteRange = this._injector.invoke((accessor) => {
      return rangeToDiscreteRange(range, accessor, unitId, subUnitId);
    });
    if (!discreteRange) {
      return;
    }
    const { rows, cols } = discreteRange;
    rows.forEach((row, rowIndex) => {
      cols.forEach((col, colIndex) => {
        var _a;
        const link = this._hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, row, col);
        matrix.setValue(rowIndex, colIndex, (_a = link == null ? void 0 : link.id) != null ? _a : "");
      });
    });
  }
  // eslint-disable-next-line max-lines-per-function
  _generateMutations(pastedRange, copyInfo) {
    if (!this._copyInfo) {
      return { redos: [], undos: [] };
    }
    if (!this._copyInfo || !this._copyInfo.matrix.getSizeOf() || !copyInfo.copyRange) {
      return { redos: [], undos: [] };
    }
    const specialPastes = [
      PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_COL_WIDTH,
      PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE,
      PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMAT,
      PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMULA
    ];
    if (specialPastes.includes(copyInfo.pasteType)) {
      return { redos: [], undos: [] };
    }
    const { unitId, subUnitId } = this._copyInfo;
    const redos = [];
    const undos = [];
    const { ranges: [vCopyRange, vPastedRange], mapFunc } = virtualizeDiscreteRanges([copyInfo.copyRange, pastedRange]);
    const repeatRange = getRepeatRange(vCopyRange, vPastedRange, true);
    repeatRange.forEach(({ startRange }) => {
      var _a;
      (_a = this._copyInfo) == null ? void 0 : _a.matrix.forValue((row, col, ruleId) => {
        const range = Rectangle.getPositionRange(
          {
            startRow: row,
            endRow: row,
            startColumn: col,
            endColumn: col
          },
          startRange
        );
        const oldLink = this._hyperLinkModel.getHyperLink(unitId, subUnitId, ruleId);
        const { row: startRow, col: startColumn } = mapFunc(range.startRow, range.startColumn);
        const currentLink = this._hyperLinkModel.getHyperLinkByLocation(copyInfo.unitId, copyInfo.subUnitId, startRow, startColumn);
        const id = generateRandomId();
        if (currentLink) {
          redos.push({
            id: RemoveHyperLinkMutation.id,
            params: {
              unitId: copyInfo.unitId,
              subUnitId: copyInfo.subUnitId,
              id: currentLink.id
            }
          });
        }
        if (oldLink) {
          redos.push({
            id: AddHyperLinkMutation.id,
            params: {
              unitId: copyInfo.unitId,
              subUnitId: copyInfo.subUnitId,
              link: {
                ...oldLink,
                id,
                row: startRow,
                column: startColumn
              }
            }
          });
          undos.push({
            id: RemoveHyperLinkMutation.id,
            params: {
              unitId: copyInfo.unitId,
              subUnitId: copyInfo.subUnitId,
              id
            }
          });
        }
        if (currentLink) {
          undos.push({
            id: AddHyperLinkMutation.id,
            params: {
              unitId: copyInfo.unitId,
              subUnitId: copyInfo.subUnitId,
              link: currentLink
            }
          });
        }
      });
    });
    return { redos, undos };
  }
};
SheetsHyperLinkCopyPasteController = __decorateClass([
  __decorateParam(0, ISheetClipboardService),
  __decorateParam(1, Inject(HyperLinkModel)),
  __decorateParam(2, Inject(Injector)),
  __decorateParam(3, Inject(SheetsHyperLinkResolverService))
], SheetsHyperLinkCopyPasteController);

// ../packages/sheets-hyper-link-ui/src/views/CellLinkEdit/index.tsx
var import_react = __toESM(require_react());

// ../packages/sheets-hyper-link-ui/src/services/side-panel.service.ts
var SheetsHyperLinkSidePanelService = class extends Disposable {
  constructor() {
    super(...arguments);
    __publicField(this, "_customHyperLinks", /* @__PURE__ */ new Map());
  }
  isBuiltInLinkType(type) {
    return type !== "url" /* URL */;
  }
  getOptions() {
    return Array.from(this._customHyperLinks.values()).map(({ option }) => option);
  }
  findCustomHyperLink(link) {
    const customLink = Array.from(this._customHyperLinks.values()).find((item) => item.match(link));
    return customLink;
  }
  registerCustomHyperLink(customHyperLink) {
    this._customHyperLinks.set(customHyperLink.type, customHyperLink);
  }
  getCustomHyperLink(type) {
    return this._customHyperLinks.get(type);
  }
  removeCustomHyperLink(type) {
    const { _customHyperLinks } = this;
    _customHyperLinks.delete(type);
  }
  dispose() {
    super.dispose();
    this._customHyperLinks.clear();
  }
};

// ../packages/sheets-hyper-link-ui/src/views/CellLinkEdit/utils.ts
function isBlankInput(value) {
  return value.trim().length === 0;
}
function resolveRangePayload(rangeText, defaultSheetName) {
  const [range] = rangeText.split(",").map(deserializeRangeWithSheet);
  if (!range || !isValidRange(range.range)) {
    return "";
  }
  if (!range.sheetName) {
    range.sheetName = defaultSheetName;
  }
  return serializeRangeToRefString(range);
}

// ../packages/sheets-hyper-link-ui/src/views/CellLinkEdit/index.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime());
var CellLinkEdit = () => {
  var _a;
  const [id, setId] = (0, import_react.useState)("");
  const [hide, setHide] = (0, import_react.useState)(false);
  const [display, _setDisplay] = (0, import_react.useState)("");
  const [showLabel, setShowLabel] = (0, import_react.useState)(true);
  const [type, setType] = (0, import_react.useState)("url" /* URL */);
  const [payload, setPayload] = (0, import_react.useState)("");
  const localeService = useDependency(LocaleService);
  const definedNameService = useDependency(IDefinedNamesService);
  const editorBridgeService = useDependency(IEditorBridgeService);
  const univerInstanceService = useDependency(IUniverInstanceService);
  const popupService = useDependency(SheetsHyperLinkPopupService);
  const editing = useObservable(popupService.currentEditing$);
  const parserService = useDependency(SheetsHyperLinkParserService);
  const resolverService = useDependency(SheetsHyperLinkResolverService);
  const commandService = useDependency(ICommandService);
  const sidePanelService = useDependency(SheetsHyperLinkSidePanelService);
  const sidePanelOptions = (0, import_react.useMemo)(() => sidePanelService.getOptions(), [sidePanelService]);
  const zenZoneService = useDependency(IZenZoneService);
  const renderManagerService = useDependency(IRenderManagerService);
  const markSelectionService = useDependency(IMarkSelectionService);
  const textSelectionService = useDependency(DocSelectionManagerService);
  const contextService = useDependency(IContextService);
  const themeService = useDependency(ThemeService);
  const docSelectionManagerService = useDependency(DocSelectionManagerService);
  const [selectorDialogVisible, setSelectorDialogVisible] = (0, import_react.useState)(false);
  const sheetsSelectionService = useDependency(SheetsSelectionsService);
  const selections = (0, import_react.useMemo)(() => sheetsSelectionService.getCurrentSelections(), []);
  const customHyperLinkSidePanel = (0, import_react.useMemo)(() => {
    if (sidePanelService.isBuiltInLinkType(type)) {
      return;
    }
    return sidePanelService.getCustomHyperLink(type);
  }, [sidePanelService, type]);
  const [showError, setShowError] = (0, import_react.useState)(false);
  const [isFocusRangeSelector, setIsFocusRangeSelector] = (0, import_react.useState)(false);
  const setByPayload = (0, import_react.useRef)(false);
  const workbook = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
  const subUnitId = (workbook == null ? void 0 : workbook.getActiveSheet().getSheetId()) || "";
  const setDisplay = (0, import_react.useCallback)((value) => {
    _setDisplay(value.replaceAll("" /* CUSTOM_RANGE_START */, "").replaceAll("" /* CUSTOM_RANGE_END */, ""));
  }, [_setDisplay]);
  (0, import_react.useEffect)(() => {
    var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
    if ((editing == null ? void 0 : editing.row) !== void 0 && editing.col !== void 0) {
      const { customRange, row, col } = editing;
      let { label } = editing;
      if (typeof label === "number") {
        label = `${label}`;
      }
      let link;
      if (customRange) {
        link = {
          id: (_a2 = customRange == null ? void 0 : customRange.rangeId) != null ? _a2 : "",
          display: label != null ? label : "",
          payload: (_c = (_b = customRange == null ? void 0 : customRange.properties) == null ? void 0 : _b.url) != null ? _c : "",
          row,
          column: col
        };
      } else {
        if (editing.type === "viewing" /* VIEWING */) {
          const workbook2 = univerInstanceService.getUnit(editing.unitId);
          const worksheet = workbook2 == null ? void 0 : workbook2.getSheetBySheetId(editing.subUnitId);
          const cell = worksheet == null ? void 0 : worksheet.getCellRaw(editing.row, editing.col);
          const range = (_f = (_e = (_d = cell == null ? void 0 : cell.p) == null ? void 0 : _d.body) == null ? void 0 : _e.customRanges) == null ? void 0 : _f.find((range2) => {
            var _a3;
            return range2.rangeType === 0 /* HYPERLINK */ && ((_a3 = range2.properties) == null ? void 0 : _a3.url);
          });
          const cellValue = cell == null ? void 0 : cell.v;
          if (cell && (!BuildTextUtils.transform.isEmptyDocument((_h = (_g = cell.p) == null ? void 0 : _g.body) == null ? void 0 : _h.dataStream) || Tools.isDefine(cellValue))) {
            setShowLabel(false);
          }
          link = {
            id: "",
            display: "",
            payload: (_j = (_i = range == null ? void 0 : range.properties) == null ? void 0 : _i.url) != null ? _j : "",
            row,
            column: col
          };
        } else {
          const doc = univerInstanceService.getCurrentUnitOfType(1 /* UNIVER_DOC */);
          const currentSelection = textSelectionService.getActiveTextRange();
          const body = doc == null ? void 0 : doc.getBody();
          const selection = currentSelection && body ? currentSelection : null;
          const customRange2 = selection && ((_l = BuildTextUtils.customRange.getCustomRangesInterestsWithSelection(selection, (_k = body == null ? void 0 : body.customRanges) != null ? _k : [])) == null ? void 0 : _l[0]);
          setShowLabel(false);
          link = {
            id: "",
            display: label != null ? label : "",
            payload: (_n = (_m = customRange2 == null ? void 0 : customRange2.properties) == null ? void 0 : _m.url) != null ? _n : "",
            row,
            column: col
          };
        }
      }
      setId(link.id);
      const customLink = sidePanelService.findCustomHyperLink(link);
      if (customLink) {
        const customLinkInfo = customLink.convert(link);
        setType(customLinkInfo.type);
        setPayload(customLinkInfo.payload);
        setDisplay(customLinkInfo.display);
        return;
      }
      setDisplay(link.display);
      const linkInfo = parserService.parseHyperLink(link.payload);
      setType(linkInfo.type === "invalid" /* INVALID */ ? "range" /* RANGE */ : linkInfo.type);
      switch (linkInfo.type) {
        case "url" /* URL */: {
          setPayload(linkInfo.url);
          if (linkInfo.url === link.display) {
            setByPayload.current = true;
          }
          break;
        }
        case "range" /* RANGE */: {
          const params = linkInfo.searchObj;
          const sheetName = params.gid ? (_q = (_p = (_o = univerInstanceService.getUnit(editing.unitId)) == null ? void 0 : _o.getSheetBySheetId(params.gid)) == null ? void 0 : _p.getName()) != null ? _q : "" : "";
          const payload2 = serializeRangeWithSheet(sheetName, deserializeRangeWithSheet(params.range).range);
          setPayload(payload2);
          if (payload2 === link.display) {
            setByPayload.current = true;
          }
          break;
        }
        case "gid" /* SHEET */: {
          const params = linkInfo.searchObj;
          setPayload(params.gid);
          break;
        }
        case "rangeid" /* DEFINE_NAME */: {
          const params = linkInfo.searchObj;
          setPayload(params.rangeid);
          break;
        }
        default:
          setPayload("");
          break;
      }
    }
  }, [editing, resolverService, sidePanelService, textSelectionService, univerInstanceService]);
  (0, import_react.useEffect)(() => {
    let id2 = null;
    if (editing && !editing.customRangeId && editing.type === "viewing" /* VIEWING */ && Tools.isDefine(editing.row) && Tools.isDefine(editing.col)) {
      const workbook2 = univerInstanceService.getUnit(editing.unitId, 2 /* UNIVER_SHEET */);
      const worksheet = workbook2 == null ? void 0 : workbook2.getSheetBySheetId(editing.subUnitId);
      const mergeInfo = worksheet == null ? void 0 : worksheet.getMergedCell(editing.row, editing.col);
      const color = new ColorKit(themeService.getColorFromTheme("primary.600")).toRgb();
      id2 = markSelectionService.addShape(
        {
          range: mergeInfo != null ? mergeInfo : {
            startColumn: editing.col,
            endColumn: editing.col,
            startRow: editing.row,
            endRow: editing.row
          },
          style: {
            // hasAutoFill: false,
            fill: `rgb(${color.r}, ${color.g}, ${color.b}, 0.12)`,
            strokeWidth: 1,
            stroke: "#FFBD37",
            widgets: {}
          },
          primary: null
        },
        [],
        -1
      );
    }
    return () => {
      if (id2) {
        markSelectionService.removeShape(id2);
      }
    };
  }, [editing, markSelectionService, themeService, univerInstanceService]);
  (0, import_react.useEffect)(() => {
    setIsFocusRangeSelector(type === "range" /* RANGE */);
  }, [type]);
  (0, import_react.useEffect)(() => {
    const render = (editing == null ? void 0 : editing.type) === "zen_mode" /* ZEN_EDITOR */ ? renderManagerService.getRenderById(DOCS_ZEN_EDITOR_UNIT_ID_KEY) : renderManagerService.getRenderById(editorBridgeService.getCurrentEditorId());
    const disposeCollection = new DisposableCollection();
    if (render) {
      const selectionRenderService = render.with(DocSelectionRenderService);
      selectionRenderService.setReserveRangesStatus(true);
      disposeCollection.add(() => {
        selectionRenderService.setReserveRangesStatus(false);
      });
    }
    return () => {
      editorBridgeService.disableForceKeepVisible();
      disposeCollection.dispose();
    };
  }, [editing == null ? void 0 : editing.type, editorBridgeService, renderManagerService]);
  (0, import_react.useEffect)(() => {
    if (isFocusRangeSelector) {
      popupService.setIsKeepVisible(isFocusRangeSelector);
    }
    popupService.setIsKeepVisible(selectorDialogVisible);
    return () => {
      popupService.setIsKeepVisible(false);
    };
  }, [isFocusRangeSelector, selectorDialogVisible, popupService]);
  (0, import_react.useEffect)(() => {
    return () => {
      if (zenZoneService.temporaryHidden) {
        zenZoneService.show();
        contextService.setContextValue(FOCUSING_SHEET, false);
      }
    };
  }, [contextService, zenZoneService]);
  (0, import_react.useEffect)(() => {
    if (isFocusRangeSelector) {
      editorBridgeService.enableForceKeepVisible();
      return () => {
        editorBridgeService.disableForceKeepVisible();
      };
    }
  }, [isFocusRangeSelector, editorBridgeService]);
  const linkTypeOptions = [
    {
      label: localeService.t("sheets-hyper-link-ui.form.link"),
      value: "url" /* URL */
    },
    {
      label: localeService.t("sheets-hyper-link-ui.form.range"),
      value: "range" /* RANGE */
    },
    {
      label: localeService.t("sheets-hyper-link-ui.form.worksheet"),
      value: "gid" /* SHEET */
    },
    {
      label: localeService.t("sheets-hyper-link-ui.form.definedName"),
      value: "rangeid" /* DEFINE_NAME */
    },
    ...sidePanelOptions
  ];
  if (!workbook) {
    return;
  }
  const hiddens = workbook.getHiddenWorksheets();
  const sheetsOption = workbook.getSheets().map((sheet) => ({ label: sheet.getName(), value: sheet.getSheetId() })).filter((opt) => hiddens.indexOf(opt.value) === -1);
  const definedNames = Object.values((_a = definedNameService.getDefinedNameMap(workbook.getUnitId())) != null ? _a : {}).map((value) => ({
    label: value.name,
    value: value.id
  }));
  const formatUrl = (type2, payload2) => {
    if (type2 === "url" /* URL */) {
      return serializeUrl(payload2);
    }
    if (type2 === "range" /* RANGE */) {
      const info = deserializeRangeWithSheet(payload2);
      const worksheet = workbook.getSheetBySheetName(info.sheetName);
      if (worksheet) {
        return `#gid=${worksheet.getSheetId()}&range=${serializeRange(info.range)}`;
      }
    }
    return `#${type2}=${payload2}`;
  };
  const handleRangeChange = useEvent((rangeText) => {
    var _a2;
    const newPayload = resolveRangePayload(rangeText, ((_a2 = workbook.getActiveSheet()) == null ? void 0 : _a2.getName()) || "");
    if (!newPayload) {
      setPayload("");
      return;
    }
    setPayload(newPayload);
    if (newPayload && (setByPayload.current || !display)) {
      setDisplay(newPayload);
      setByPayload.current = true;
    }
  });
  const handleSubmit = async () => {
    if (showLabel && isBlankInput(display) || !payload || type === "url" /* URL */ && !isLegalLink(payload)) {
      setShowError(true);
      return;
    }
    if (editing) {
      if (id) {
        const commandId = editing.type === "zen_mode" /* ZEN_EDITOR */ || editing.type === "editing" /* EDITING */ ? UpdateRichHyperLinkCommand.id : UpdateHyperLinkCommand.id;
        await commandService.executeCommand(commandId, {
          id,
          unitId: editing.unitId,
          subUnitId: editing.subUnitId,
          payload: {
            display: showLabel ? display : "",
            payload: formatUrl(type, payload)
          },
          row: editing.row,
          column: editing.col,
          documentId: editing.type === "zen_mode" /* ZEN_EDITOR */ ? DOCS_ZEN_EDITOR_UNIT_ID_KEY : editorBridgeService.getCurrentEditorId()
        });
      } else {
        const commandId = editing.type === "zen_mode" /* ZEN_EDITOR */ || editing.type === "editing" /* EDITING */ ? AddRichHyperLinkCommand.id : AddHyperLinkCommand.id;
        await commandService.executeCommand(commandId, {
          unitId: editing.unitId,
          subUnitId: editing.subUnitId,
          link: {
            id: generateRandomId(),
            row: editing.row,
            column: editing.col,
            payload: formatUrl(type, payload),
            display: showLabel ? display : ""
          },
          documentId: editing.type === "zen_mode" /* ZEN_EDITOR */ ? DOCS_ZEN_EDITOR_UNIT_ID_KEY : editorBridgeService.getCurrentEditorId()
        });
      }
    }
    if ((editing == null ? void 0 : editing.type) === "viewing" /* VIEWING */) {
      await commandService.executeCommand(SetWorksheetActiveOperation.id, {
        unitId: editing.unitId,
        subUnitId: editing.subUnitId
      });
      const GAP = 1;
      await commandService.executeCommand(ScrollToRangeOperation.id, {
        range: {
          startRow: Math.max(editing.row - GAP, 0),
          endRow: editing.row + GAP,
          startColumn: Math.max(editing.col - GAP, 0),
          endColumn: editing.col + GAP
        }
      });
    }
    commandService.executeCommand(CloseHyperLinkPopupOperation.id);
  };
  if (!editing) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      className: clsx(`univer-box-border univer-w-[296px] univer-rounded-xl univer-bg-white univer-p-4 univer-shadow-md dark:!univer-bg-gray-900`, borderClassName),
      children: [
        showLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          FormLayout,
          {
            label: localeService.t("sheets-hyper-link-ui.form.label"),
            error: showError && isBlankInput(display) ? localeService.t("sheets-hyper-link-ui.form.inputError") : "",
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              Input,
              {
                value: display,
                onChange: (v) => {
                  setDisplay(v);
                  setByPayload.current = false;
                },
                placeholder: localeService.t("sheets-hyper-link-ui.form.labelPlaceholder"),
                autoFocus: true,
                onKeyDown: (e) => {
                  if (e.keyCode === 13 /* ENTER */) {
                    handleSubmit();
                  }
                }
              }
            )
          }
        ) : null,
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormLayout, { label: localeService.t("sheets-hyper-link-ui.form.type"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          Select,
          {
            className: "univer-w-full",
            options: linkTypeOptions,
            value: type,
            onChange: (newType) => {
              setType(newType);
              setPayload("");
            }
          }
        ) }),
        type === "url" /* URL */ && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          FormLayout,
          {
            error: showError ? !payload ? localeService.t("sheets-hyper-link-ui.form.inputError") : !isLegalLink(payload) ? localeService.t("sheets-hyper-link-ui.form.linkError") : "" : "",
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              Input,
              {
                value: payload,
                onChange: (newLink) => {
                  setPayload(newLink);
                  if (newLink && (setByPayload.current || !display || display === newLink)) {
                    setDisplay(newLink);
                    setByPayload.current = true;
                  }
                },
                placeholder: localeService.t("sheets-hyper-link-ui.form.linkPlaceholder"),
                autoFocus: true,
                onKeyDown: (e) => {
                  if (e.keyCode === 13 /* ENTER */) {
                    handleSubmit();
                  }
                }
              }
            )
          }
        ),
        type === "range" /* RANGE */ && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormLayout, { error: showError && !payload ? localeService.t("sheets-hyper-link-ui.form.inputError") : "", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          RangeSelector,
          {
            unitId: workbook.getUnitId(),
            subUnitId,
            maxRangeCount: 1,
            supportAcrossSheet: true,
            initialValue: payload,
            resetRange: selections,
            onChange: (_, text) => handleRangeChange(text),
            onRangeSelectorDialogVisibleChange: async (visible) => {
              var _a2, _b;
              setSelectorDialogVisible(visible);
              if (visible) {
                if (editing.type === "zen_mode" /* ZEN_EDITOR */) {
                  zenZoneService.hide();
                  contextService.setContextValue(FOCUSING_SHEET, true);
                }
                if (editing.type !== "viewing" /* VIEWING */) {
                  editorBridgeService.enableForceKeepVisible();
                }
                setHide(true);
              } else {
                await resolverService.navigateToRange(editing.unitId, editing.subUnitId, { startRow: editing.row, endRow: editing.row, startColumn: editing.col, endColumn: editing.col }, true);
                if (editing.type === "zen_mode" /* ZEN_EDITOR */) {
                  await commandService.executeCommand(SetSelectionsOperation.id, {
                    unitId: editing.unitId,
                    subUnitId: editing.subUnitId,
                    selections: [{ range: { startRow: editing.row, endRow: editing.row, startColumn: editing.col, endColumn: editing.col } }]
                  });
                  zenZoneService.show();
                  contextService.setContextValue(FOCUSING_SHEET, false);
                  const docBackScrollRenderController = (_a2 = renderManagerService.getRenderById(DOCS_ZEN_EDITOR_UNIT_ID_KEY)) == null ? void 0 : _a2.with(DocBackScrollRenderController);
                  const range = (_b = docSelectionManagerService.getTextRanges({ unitId: DOCS_ZEN_EDITOR_UNIT_ID_KEY, subUnitId: DOCS_ZEN_EDITOR_UNIT_ID_KEY })) == null ? void 0 : _b[0];
                  if (docBackScrollRenderController && range) {
                    docBackScrollRenderController.scrollToRange(range);
                    docSelectionManagerService.refreshSelection({ unitId: DOCS_ZEN_EDITOR_UNIT_ID_KEY, subUnitId: DOCS_ZEN_EDITOR_UNIT_ID_KEY });
                  }
                }
                editorBridgeService.disableForceKeepVisible();
                setHide(false);
              }
            },
            onFocusChange: (focus) => setIsFocusRangeSelector(focus)
          }
        ) }),
        type === "gid" /* SHEET */ && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormLayout, { error: showError && !payload ? localeService.t("sheets-hyper-link-ui.form.selectError") : "", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          Select,
          {
            className: "univer-w-full",
            options: sheetsOption,
            value: payload,
            onChange: (newPayload) => {
              var _a2, _b;
              setPayload(newPayload);
              const label = (_a2 = sheetsOption.find((i) => i.value === newPayload)) == null ? void 0 : _a2.label;
              const oldLabel = (_b = sheetsOption.find((i) => i.value === payload)) == null ? void 0 : _b.label;
              if (label && (setByPayload.current || !display || display === oldLabel)) {
                setDisplay(label);
                setByPayload.current = true;
              }
            }
          }
        ) }),
        type === "rangeid" /* DEFINE_NAME */ && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormLayout, { error: showError && !payload ? localeService.t("sheets-hyper-link-ui.form.selectError") : "", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          Select,
          {
            className: "univer-w-full",
            options: definedNames,
            value: payload,
            onChange: (newValue) => {
              var _a2, _b;
              setPayload(newValue);
              const label = (_a2 = definedNames.find((i) => i.value === newValue)) == null ? void 0 : _a2.label;
              const oldLabel = (_b = definedNames.find((i) => i.value === payload)) == null ? void 0 : _b.label;
              if (label && (setByPayload.current || !display || display === oldLabel)) {
                setDisplay(label);
                setByPayload.current = true;
              }
            }
          }
        ) }),
        (customHyperLinkSidePanel == null ? void 0 : customHyperLinkSidePanel.Form) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          customHyperLinkSidePanel.Form,
          {
            linkId: id,
            payload,
            display,
            showError,
            setByPayload,
            setDisplay: (newLink) => {
              setDisplay(newLink);
              setByPayload.current = true;
            },
            setPayload
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "univer-flex univer-flex-row univer-justify-end univer-gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            Button,
            {
              onClick: () => {
                if (editing) {
                  resolverService.navigateToRange(editing.unitId, editing.subUnitId, { startRow: editing.row, endRow: editing.row, startColumn: editing.col, endColumn: editing.col }, true);
                }
                commandService.executeCommand(CloseHyperLinkPopupOperation.id);
              },
              children: localeService.t("sheets-hyper-link-ui.form.cancel")
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            Button,
            {
              variant: "primary",
              onClick: async () => {
                handleSubmit();
              },
              children: localeService.t("sheets-hyper-link-ui.form.ok")
            }
          )
        ] })
      ]
    }
  );
};
CellLinkEdit.componentKey = "univer.sheet.cell-link-edit";

// ../packages/sheets-hyper-link-ui/src/views/CellLinkPopup/index.tsx
var import_react2 = __toESM(require_react());
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
var iconsMap = {
  ["url" /* URL */]: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(LinkIcon, {}),
  ["gid" /* SHEET */]: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(XlsxMultiIcon, { className: "univer-text-green-500" }),
  ["range" /* RANGE */]: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(AllBorderIcon, {}),
  ["rangeid" /* DEFINE_NAME */]: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(AllBorderIcon, {}),
  ["invalid" /* INVALID */]: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(AllBorderIcon, {})
};
var CellLinkPopupPure = (props) => {
  var _a, _b;
  const popupService = useDependency(SheetsHyperLinkPopupService);
  const commandService = useDependency(ICommandService);
  const messageService = useDependency(IMessageService);
  const localeService = useDependency(LocaleService);
  const resolverService = useDependency(SheetsHyperLinkResolverService);
  const editorBridgeService = useDependency(IEditorBridgeService);
  const parserHyperLinkService = useDependency(SheetsHyperLinkParserService);
  const zenZoneService = useDependency(IZenZoneService);
  const { customRange, row, col, unitId, subUnitId, editPermission, copyPermission, type } = props;
  if (!((_a = customRange == null ? void 0 : customRange.properties) == null ? void 0 : _a.url)) {
    return null;
  }
  const linkObj = parserHyperLinkService.parseHyperLink((_b = customRange.properties.url) != null ? _b : "");
  const isError = linkObj.type === "invalid" /* INVALID */;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "div",
    {
      className: clsx(`univer-mb-1 univer-flex univer-max-w-80 univer-flex-row univer-items-center univer-justify-between univer-overflow-hidden univer-rounded-lg univer-bg-white univer-p-3 univer-shadow-md dark:!univer-bg-gray-900`, borderClassName),
      onClick: () => popupService.hideCurrentPopup(),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
          "div",
          {
            className: clsx(`univer-flex univer-h-6 univer-flex-1 univer-cursor-pointer univer-flex-row univer-items-center univer-truncate univer-text-sm univer-leading-5 univer-text-primary-600`, { "univer-text-red-500": isError }),
            onClick: () => {
              if (zenZoneService.visible) {
                return;
              }
              if (isError) {
                return;
              }
              resolverService.navigate(linkObj);
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                "div",
                {
                  className: `univer-mr-2 univer-flex univer-size-5 univer-flex-none univer-items-center univer-justify-center univer-text-base univer-text-gray-900 dark:!univer-text-white`,
                  children: iconsMap[linkObj.type]
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Tooltip, { showIfEllipsis: true, title: linkObj.name, asChild: true, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "univer-flex-1 univer-truncate", children: linkObj.name }) })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
          "div",
          {
            className: `univer-flex univer-h-6 univer-flex-none univer-flex-row univer-items-center univer-justify-center`,
            children: [
              copyPermission && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                "div",
                {
                  className: clsx(`univer-ml-2 univer-flex univer-size-6 univer-cursor-pointer univer-flex-row univer-items-center univer-justify-center univer-rounded univer-text-base hover:univer-bg-gray-100 dark:hover:!univer-bg-gray-700`, { "univer-text-red-500": isError }),
                  onClick: () => {
                    if (isError) {
                      return;
                    }
                    if (linkObj.type !== "url" /* URL */) {
                      const url = new URL(window.location.href);
                      url.hash = linkObj.url.slice(1);
                      navigator.clipboard.writeText(url.href);
                    } else {
                      navigator.clipboard.writeText(linkObj.url);
                    }
                    messageService.show({
                      content: localeService.t("sheets-hyper-link-ui.message.coped"),
                      type: "info" /* Info */
                    });
                  },
                  children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Tooltip, { placement: "bottom", title: localeService.t("sheets-hyper-link-ui.popup.copy"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(CopyIcon, { className: "dark:!univer-text-white" }) })
                }
              ),
              editPermission && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  "div",
                  {
                    className: `univer-ml-2 univer-flex univer-size-6 univer-cursor-pointer univer-flex-row univer-items-center univer-justify-center univer-rounded univer-text-base hover:univer-bg-gray-100 dark:hover:!univer-bg-gray-700`,
                    onClick: () => {
                      commandService.executeCommand(OpenHyperLinkEditPanelOperation.id, {
                        unitId,
                        subUnitId,
                        row,
                        col,
                        customRangeId: customRange.rangeId,
                        type
                      });
                    },
                    children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Tooltip, { placement: "bottom", title: localeService.t("sheets-hyper-link-ui.popup.edit"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(WriteIcon, { className: "dark:!univer-text-white" }) })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  "div",
                  {
                    className: `univer-ml-2 univer-flex univer-size-6 univer-cursor-pointer univer-flex-row univer-items-center univer-justify-center univer-rounded univer-text-base hover:univer-bg-gray-100 dark:hover:!univer-bg-gray-700`,
                    onClick: () => {
                      const commandId = type === "editing" /* EDITING */ || type === "zen_mode" /* ZEN_EDITOR */ ? CancelRichHyperLinkCommand.id : CancelHyperLinkCommand.id;
                      if (commandService.syncExecuteCommand(commandId, {
                        unitId,
                        subUnitId,
                        id: customRange.rangeId,
                        row,
                        column: col,
                        documentId: type === "zen_mode" /* ZEN_EDITOR */ ? DOCS_ZEN_EDITOR_UNIT_ID_KEY : editorBridgeService.getCurrentEditorId()
                      })) {
                        popupService.hideCurrentPopup(void 0, true);
                      }
                    },
                    children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Tooltip, { placement: "bottom", title: localeService.t("sheets-hyper-link-ui.popup.cancel"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(UnlinkIcon, { className: "dark:!univer-text-white" }) })
                  }
                )
              ] })
            ]
          }
        )
      ]
    }
  );
};
var CellLinkPopup = () => {
  var _a, _b;
  const popupService = useDependency(SheetsHyperLinkPopupService);
  const [currentPopup, setCurrentPopup] = (0, import_react2.useState)(null);
  const univerInstanceService = useDependency(IUniverInstanceService);
  (0, import_react2.useEffect)(() => {
    setCurrentPopup(popupService.currentPopup);
    const ob = popupService.currentPopup$.subscribe((popup) => {
      setCurrentPopup(popup);
    });
    return () => {
      ob.unsubscribe();
    };
  }, [popupService.currentPopup, popupService.currentPopup$]);
  if (!currentPopup) {
    return null;
  }
  if (currentPopup.showAll) {
    const workbook = univerInstanceService.getUnit(currentPopup.unitId, 2 /* UNIVER_SHEET */);
    const worksheet = workbook == null ? void 0 : workbook.getSheetBySheetId(currentPopup.subUnitId);
    const cell = worksheet == null ? void 0 : worksheet.getCell(currentPopup.row, currentPopup.col);
    const customRanges = (_b = (_a = cell == null ? void 0 : cell.p) == null ? void 0 : _a.body) == null ? void 0 : _b.customRanges;
    return (customRanges == null ? void 0 : customRanges.length) ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { children: customRanges.map((customRange) => {
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(CellLinkPopupPure, { ...currentPopup, customRange }, customRange.rangeId);
    }) }) : null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(CellLinkPopupPure, { ...currentPopup });
};
CellLinkPopup.componentKey = "univer.sheet.cell-link-popup";

// ../packages/sheets-hyper-link-ui/src/services/popup.service.ts
var isEqualLink = (a, b) => {
  var _a, _b;
  return a.unitId === b.unitId && a.subUnitId === b.subUnitId && a.row === b.row && a.col === b.col && ((_a = a.customRange) == null ? void 0 : _a.rangeId) === ((_b = b.customRange) == null ? void 0 : _b.rangeId) && a.type === b.type;
};
var SheetsHyperLinkPopupService = class extends Disposable {
  constructor(_sheetCanvasPopManagerService, _injector, _univerInstanceService, _editorBridgeService, _textSelectionManagerService, _docCanvasPopManagerService, _zenZoneService) {
    super();
    __publicField(this, "_sheetCanvasPopManagerService", _sheetCanvasPopManagerService);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_editorBridgeService", _editorBridgeService);
    __publicField(this, "_textSelectionManagerService", _textSelectionManagerService);
    __publicField(this, "_docCanvasPopManagerService", _docCanvasPopManagerService);
    __publicField(this, "_zenZoneService", _zenZoneService);
    __publicField(this, "_currentPopup", null);
    __publicField(this, "_currentPopup$", new Subject());
    __publicField(this, "currentPopup$", this._currentPopup$.asObservable());
    __publicField(this, "_currentEditingPopup", null);
    __publicField(this, "_currentEditing$", new BehaviorSubject(null));
    __publicField(this, "currentEditing$", this._currentEditing$.asObservable());
    __publicField(this, "_isKeepVisible", false);
    this.disposeWithMe(() => {
      this.hideCurrentPopup();
      this.endEditing();
      this._currentEditing$.complete();
      this._currentPopup$.complete();
    });
  }
  get currentPopup() {
    return this._currentPopup;
  }
  get currentEditing() {
    return this._currentEditing$.getValue();
  }
  setIsKeepVisible(v) {
    this._isKeepVisible = v;
  }
  getIsKeepVisible() {
    return this._isKeepVisible;
  }
  // eslint-disable-next-line max-lines-per-function
  showPopup(location2) {
    var _a;
    if (this._currentPopup && isEqualLink(location2, this._currentPopup)) {
      return;
    }
    this.hideCurrentPopup(void 0, true);
    if (location2.type !== "zen_mode" /* ZEN_EDITOR */ && this._zenZoneService.visible) {
      return;
    }
    const currentEditing = this._currentEditing$.getValue();
    if (currentEditing && isEqualLink(location2, currentEditing)) {
      return;
    }
    const { unitId, subUnitId, row, col, customRangeRect, customRange } = location2;
    let disposable;
    const popup = {
      componentKey: CellLinkPopup.componentKey,
      direction: "bottom",
      onClickOutside: () => {
        this.hideCurrentPopup();
      },
      onClick: () => {
        this.hideCurrentPopup(location2.type, true);
      }
    };
    if (location2.type === "editing" /* EDITING */) {
      if (!customRange) {
        return;
      }
      disposable = customRangeRect && this._sheetCanvasPopManagerService.attachPopupToAbsolutePosition(
        customRangeRect,
        popup
      );
    } else if (location2.type === "zen_mode" /* ZEN_EDITOR */) {
      if (!customRange) {
        return;
      }
      disposable = this._docCanvasPopManagerService.attachPopupToRange(
        {
          startOffset: customRange.startIndex,
          endOffset: customRange.endIndex + 1,
          collapsed: false
        },
        popup,
        DOCS_ZEN_EDITOR_UNIT_ID_KEY
      );
    } else {
      if (location2.showAll) {
        disposable = this._sheetCanvasPopManagerService.attachPopupToCell(location2.row, location2.col, popup, unitId, subUnitId);
      } else {
        if (!customRange) {
          return;
        }
        disposable = customRangeRect && this._sheetCanvasPopManagerService.attachPopupByPosition(
          customRangeRect,
          popup,
          location2
        );
      }
    }
    if (disposable) {
      if (this._currentPopup) {
        (_a = this._currentPopup.disposable) == null ? void 0 : _a.dispose();
      }
      this._currentPopup = {
        unitId,
        subUnitId,
        disposable,
        row,
        col,
        editPermission: !!location2.editPermission,
        copyPermission: !!location2.copyPermission,
        customRange,
        type: location2.type,
        showAll: location2.showAll
      };
      this._currentPopup$.next(this._currentPopup);
    }
  }
  hideCurrentPopup(type, force) {
    var _a, _b;
    if (!this._currentPopup) {
      return;
    }
    if ((!type || type === this._currentPopup.type) && this._currentPopup.disposable.canDispose() || force) {
      (_b = (_a = this._currentPopup) == null ? void 0 : _a.disposable) == null ? void 0 : _b.dispose();
      this._currentPopup = null;
      this._currentPopup$.next(null);
    }
  }
  dispose() {
    super.dispose();
    this.hideCurrentPopup();
    this.endEditing();
    this._currentPopup$.complete();
    this._currentEditing$.complete();
  }
  _getEditingRange() {
    var _a, _b, _c;
    const visible = this._editorBridgeService.isVisible().visible;
    const state = this._editorBridgeService.getEditCellState();
    if (visible && state) {
      const textRange = this._textSelectionManagerService.getActiveTextRange();
      const body = (_a = state.documentLayoutObject.documentModel) == null ? void 0 : _a.getBody();
      if (!body) {
        return null;
      }
      if (!textRange || textRange.collapsed) {
        return {
          startOffset: 0,
          endOffset: body.dataStream.length - 2,
          collapsed: body.dataStream.length - 2 === 0,
          label: BuildTextUtils.transform.getPlainText(body.dataStream)
        };
      }
      const links = BuildTextUtils.customRange.getCustomRangesInterestsWithSelection(textRange, (_c = (_b = body.customRanges) == null ? void 0 : _b.filter((i) => i.rangeType === 0 /* HYPERLINK */)) != null ? _c : []);
      let start = textRange.startOffset;
      let end = textRange.endOffset;
      links.forEach((link) => {
        start = Math.min(start, link.startIndex);
        end = Math.max(end, link.endIndex + 1);
      });
      return {
        startOffset: start,
        endOffset: end,
        collapsed: start === end,
        label: BuildTextUtils.transform.getPlainText(body.dataStream.slice(start, end))
      };
    }
    return null;
  }
  get _editPopup() {
    const popup = {
      componentKey: CellLinkEdit.componentKey,
      direction: "vertical",
      onClickOutside: () => {
        this.endEditing();
      },
      onContextMenu: () => {
        this.endEditing();
      },
      hiddenType: "hide"
    };
    return popup;
  }
  startAddEditing(link) {
    var _a, _b, _c, _d, _e;
    const { unitId, subUnitId, type } = link;
    if (type === "zen_mode" /* ZEN_EDITOR */) {
      const document = this._univerInstanceService.getUnit(DOCS_ZEN_EDITOR_UNIT_ID_KEY, 1 /* UNIVER_DOC */);
      if (!document) {
        return;
      }
      const range = this._textSelectionManagerService.getActiveTextRange();
      if (!range) {
        return;
      }
      this._currentEditingPopup = this._docCanvasPopManagerService.attachPopupToRange(
        range,
        this._editPopup,
        DOCS_ZEN_EDITOR_UNIT_ID_KEY
      );
      const label = (_a = document.getBody()) == null ? void 0 : _a.dataStream.slice(range.startOffset, range.endOffset);
      this._currentEditing$.next({
        ...link,
        label
      });
    } else if (type === "editing" /* EDITING */) {
      const range = this._getEditingRange();
      if (!range) {
        return;
      }
      this._textSelectionManagerService.replaceDocRanges([{ ...range }], { unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY, subUnitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY });
      const currentRender = this._injector.get(IRenderManagerService).getRenderById(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
      if (!currentRender) {
        return;
      }
      const rects = calcDocRangePositions(range, currentRender);
      if (!(rects == null ? void 0 : rects.length)) {
        return;
      }
      this._currentEditingPopup = this._sheetCanvasPopManagerService.attachPopupToAbsolutePosition(
        rects.pop(),
        this._editPopup,
        unitId,
        subUnitId
      );
      this._currentEditing$.next({
        ...link,
        label: (_b = range == null ? void 0 : range.label) != null ? _b : ""
      });
    } else {
      this._currentEditingPopup = this._sheetCanvasPopManagerService.attachPopupToCell(
        link.row,
        link.col,
        this._editPopup,
        unitId,
        subUnitId
      );
      const workbook = this._univerInstanceService.getUnit(unitId, 2 /* UNIVER_SHEET */);
      const worksheet = workbook == null ? void 0 : workbook.getSheetBySheetId(subUnitId);
      const cell = worksheet == null ? void 0 : worksheet.getCellRaw(link.row, link.col);
      this._currentEditing$.next({
        ...link,
        label: (cell == null ? void 0 : cell.p) ? BuildTextUtils.transform.getPlainText((_d = (_c = cell.p.body) == null ? void 0 : _c.dataStream) != null ? _d : "") : ((_e = cell == null ? void 0 : cell.v) != null ? _e : "").toString()
      });
    }
  }
  // eslint-disable-next-line complexity, max-lines-per-function
  startEditing(link) {
    var _a, _b, _c, _d, _e, _f;
    (_a = this._currentEditingPopup) == null ? void 0 : _a.dispose();
    this.hideCurrentPopup(void 0, true);
    const { unitId, subUnitId } = link;
    let customRange;
    let label;
    if (link.type === "zen_mode" /* ZEN_EDITOR */) {
      const document = this._univerInstanceService.getUnit(DOCS_ZEN_EDITOR_UNIT_ID_KEY, 1 /* UNIVER_DOC */);
      customRange = (_c = (_b = document == null ? void 0 : document.getBody()) == null ? void 0 : _b.customRanges) == null ? void 0 : _c.find((range) => range.rangeId === link.customRangeId);
      label = customRange ? (_d = document == null ? void 0 : document.getBody()) == null ? void 0 : _d.dataStream.slice(customRange.startIndex, customRange.endIndex + 1) : "";
      if (!customRange || !label) {
        return;
      }
      this._textSelectionManagerService.replaceTextRanges([
        {
          startOffset: customRange.startIndex,
          endOffset: customRange.endIndex + 1
        }
      ]);
      this._currentEditingPopup = this._docCanvasPopManagerService.attachPopupToRange(
        {
          startOffset: customRange.startIndex,
          endOffset: customRange.endIndex,
          collapsed: false
        },
        this._editPopup,
        DOCS_ZEN_EDITOR_UNIT_ID_KEY
      );
    } else if (link.type === "editing" /* EDITING */) {
      const customRangeInfo = getEditingCustomRangePosition(this._injector, link.unitId, link.subUnitId, link.row, link.col, link.customRangeId);
      if (!customRangeInfo || !((_e = customRangeInfo.rects) == null ? void 0 : _e.length)) {
        return;
      }
      customRange = customRangeInfo.customRange;
      label = customRangeInfo.label;
      this._textSelectionManagerService.replaceTextRanges([
        {
          startOffset: customRange.startIndex,
          endOffset: customRange.endIndex + 1
        }
      ]);
      this._currentEditingPopup = this._sheetCanvasPopManagerService.attachPopupToAbsolutePosition(
        customRangeInfo.rects.pop(),
        this._editPopup,
        unitId,
        subUnitId
      );
    } else {
      const workbook = this._univerInstanceService.getUnit(unitId, 2 /* UNIVER_SHEET */);
      const worksheet = workbook == null ? void 0 : workbook.getSheetBySheetId(subUnitId);
      const cell = worksheet == null ? void 0 : worksheet.getCellRaw(link.row, link.col);
      const style = workbook == null ? void 0 : workbook.getStyles().getStyleByCell(cell);
      const tr = style == null ? void 0 : style.tr;
      const customRangeInfo = getCustomRangePosition(this._injector, link.unitId, link.subUnitId, link.row, link.col, link.customRangeId);
      if (!customRangeInfo || !((_f = customRangeInfo.rects) == null ? void 0 : _f.length)) {
        return;
      }
      customRange = customRangeInfo.customRange;
      label = customRangeInfo.label;
      if (tr) {
        this._currentEditingPopup = this._sheetCanvasPopManagerService.attachPopupToCell(
          link.row,
          link.col,
          this._editPopup,
          unitId,
          subUnitId
        );
      } else {
        this._currentEditingPopup = this._sheetCanvasPopManagerService.attachPopupByPosition(
          customRangeInfo.rects.pop(),
          this._editPopup,
          {
            unitId,
            subUnitId,
            row: link.row,
            col: link.col
          }
        );
      }
    }
    this._currentEditing$.next({
      ...link,
      customRange,
      label
    });
  }
  endEditing(type) {
    var _a;
    if (this.getIsKeepVisible()) {
      return;
    }
    const current = this._currentEditing$.getValue();
    if (current && (!type || type === current.type)) {
      (_a = this._currentEditingPopup) == null ? void 0 : _a.dispose();
      this._currentEditing$.next(null);
    }
  }
};
SheetsHyperLinkPopupService = __decorateClass([
  __decorateParam(0, Inject(SheetCanvasPopManagerService)),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IUniverInstanceService),
  __decorateParam(3, IEditorBridgeService),
  __decorateParam(4, Inject(DocSelectionManagerService)),
  __decorateParam(5, Inject(DocCanvasPopManagerService)),
  __decorateParam(6, IZenZoneService)
], SheetsHyperLinkPopupService);

// ../packages/sheets-hyper-link-ui/src/utils/index.ts
var disables = /* @__PURE__ */ new Set([
  "checkbox" /* CHECKBOX */,
  "list" /* LIST */,
  "listMultiple" /* LIST_MULTIPLE */
]);
var getShouldDisableCellLink = (accessor, worksheet, row, col) => {
  var _a, _b, _c, _d, _e;
  const cell = worksheet.getCell(row, col);
  if ((cell == null ? void 0 : cell.f) || (cell == null ? void 0 : cell.si)) {
    return 1 /* DISABLED_BY_CELL */;
  }
  if ((_c = (_b = (_a = cell == null ? void 0 : cell.p) == null ? void 0 : _a.body) == null ? void 0 : _b.customBlocks) == null ? void 0 : _c.length) {
    return 1 /* DISABLED_BY_CELL */;
  }
  const dataValidationModel = accessor.has(SheetDataValidationModel) ? accessor.get(SheetDataValidationModel) : null;
  const rule = dataValidationModel == null ? void 0 : dataValidationModel.getRuleByLocation(worksheet.getUnitId(), worksheet.getSheetId(), row, col);
  if (rule && disables.has(rule.type)) {
    return true;
  }
  if ((_e = (_d = cell == null ? void 0 : cell.p) == null ? void 0 : _d.drawingsOrder) == null ? void 0 : _e.length) {
    return 2 /* ALLOW_ON_EDITING */;
  }
  return 0 /* ALLOWED */;
};
var getShouldDisableCurrentCellLink = (accessor) => {
  const unit = accessor.get(IUniverInstanceService).getCurrentUnitOfType(2 /* UNIVER_SHEET */);
  if (!unit) {
    return true;
  }
  const worksheet = unit.getActiveSheet();
  const selections = accessor.get(SheetsSelectionsService).getCurrentSelections();
  if (!selections.length) {
    return true;
  }
  const row = selections[0].range.startRow;
  const col = selections[0].range.startColumn;
  return getShouldDisableCellLink(accessor, worksheet, row, col) === 1 /* DISABLED_BY_CELL */;
};
var shouldDisableAddLink = (accessor) => {
  const textSelectionService = accessor.get(DocSelectionManagerService);
  const univerInstanceService = accessor.get(IUniverInstanceService);
  const textRanges = textSelectionService.getTextRanges();
  if (!(textRanges == null ? void 0 : textRanges.length)) {
    return true;
  }
  const doc = univerInstanceService.getCurrentUnitOfType(1 /* UNIVER_DOC */);
  if (!doc || textRanges.every((range) => range.collapsed)) {
    return true;
  }
  const body = doc.getSelfOrHeaderFooterModel(textRanges[0].segmentId).getBody();
  if (!body) {
    return true;
  }
  return false;
};

// ../packages/sheets-hyper-link-ui/src/commands/operations/popup.operations.ts
var OpenHyperLinkEditPanelOperation = {
  type: 1 /* OPERATION */,
  id: "sheet.operation.open-hyper-link-edit-panel",
  handler(accessor, params) {
    if (!params) {
      return false;
    }
    const popupService = accessor.get(SheetsHyperLinkPopupService);
    if (!params.customRangeId) {
      popupService.startAddEditing(params);
    } else {
      popupService.startEditing(params);
    }
    return true;
  }
};
var CloseHyperLinkPopupOperation = {
  type: 1 /* OPERATION */,
  id: "sheet.operation.close-hyper-link-popup",
  handler(accessor) {
    const popupService = accessor.get(SheetsHyperLinkPopupService);
    popupService.endEditing();
    return true;
  }
};
var InsertHyperLinkOperation = {
  type: 1 /* OPERATION */,
  id: "sheet.operation.insert-hyper-link",
  handler(accessor) {
    var _a;
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const target = getSheetCommandTarget(univerInstanceService);
    const editorBridgeService = accessor.get(IEditorBridgeService);
    if (!target) {
      return false;
    }
    const commandService = accessor.get(ICommandService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const selection = selectionManagerService.getCurrentLastSelection();
    if (!selection) {
      return false;
    }
    const row = selection.range.startRow;
    const col = selection.range.startColumn;
    const visible = editorBridgeService.isVisible();
    const isZenEditor = ((_a = univerInstanceService.getFocusedUnit()) == null ? void 0 : _a.getUnitId()) === DOCS_ZEN_EDITOR_UNIT_ID_KEY;
    return commandService.executeCommand(OpenHyperLinkEditPanelOperation.id, {
      unitId: target.unitId,
      subUnitId: target.subUnitId,
      row,
      col,
      type: isZenEditor ? "zen_mode" /* ZEN_EDITOR */ : visible.visible ? "editing" /* EDITING */ : "viewing" /* VIEWING */
    });
  }
};
var InsertHyperLinkToolbarOperation = {
  type: 1 /* OPERATION */,
  id: "sheet.operation.insert-hyper-link-toolbar",
  handler(accessor) {
    if (getShouldDisableCurrentCellLink(accessor)) {
      return false;
    }
    const commandService = accessor.get(ICommandService);
    const popupService = accessor.get(SheetsHyperLinkPopupService);
    if (popupService.currentEditing) {
      return commandService.executeCommand(CloseHyperLinkPopupOperation.id);
    } else {
      return commandService.executeCommand(InsertHyperLinkOperation.id);
    }
  }
};

// ../packages/sheets-hyper-link-ui/src/menu/menu.ts
var getEditingLinkDisable$ = (accessor, unitId = DOCS_ZEN_EDITOR_UNIT_ID_KEY) => {
  var _a;
  const univerInstanceService = accessor.get(IUniverInstanceService);
  const docSelctionService = (_a = accessor.get(IRenderManagerService).getRenderById(unitId)) == null ? void 0 : _a.with(DocSelectionRenderService);
  if (!docSelctionService) {
    return of(true);
  }
  return docSelctionService.textSelectionInner$.pipe(map(() => {
    const editorBridgeService = accessor.get(IEditorBridgeService);
    const state = editorBridgeService.getEditCellState();
    if (!state) {
      return true;
    }
    const target = getSheetCommandTarget(univerInstanceService, { unitId: state.unitId, subUnitId: state.sheetId });
    if (!(target == null ? void 0 : target.worksheet)) {
      return true;
    }
    if (getShouldDisableCellLink(accessor, target.worksheet, state.row, state.column) === 1) {
      return true;
    }
    return shouldDisableAddLink(accessor);
  }));
};
var getLinkDisable$ = (accessor) => {
  var _a;
  const univerInstanceService = accessor.get(IUniverInstanceService);
  const editorBridgeService = accessor.has(IEditorBridgeService) ? accessor.get(IEditorBridgeService) : null;
  const disableCell$ = (_a = editorBridgeService == null ? void 0 : editorBridgeService.currentEditCellState$.pipe(
    map((state) => {
      if (!state) {
        return 1 /* DISABLED_BY_CELL */;
      }
      const target = getSheetCommandTarget(univerInstanceService, { unitId: state.unitId, subUnitId: state.sheetId });
      if (!target) {
        return 1 /* DISABLED_BY_CELL */;
      }
      return getShouldDisableCellLink(accessor, target.worksheet, state.row, state.column);
    }),
    switchMap((disableCell) => {
      if (disableCell === 1 /* DISABLED_BY_CELL */) {
        return of(true);
      }
      const isEditing$ = editorBridgeService ? editorBridgeService.visible$ : of(null);
      return combineLatest([isEditing$, univerInstanceService.getCurrentTypeOfUnit$(1 /* UNIVER_DOC */)]).pipe(
        switchMap(
          ([editing, focusingDoc]) => {
            return (editing == null ? void 0 : editing.visible) ? (focusingDoc == null ? void 0 : focusingDoc.getUnitId()) === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY ? of(true) : getEditingLinkDisable$(accessor, DOCS_NORMAL_EDITOR_UNIT_ID_KEY) : of(disableCell !== 0 /* ALLOWED */);
          }
        )
      );
    })
  )) != null ? _a : of(true);
  return disableCell$.pipe(
    switchMap((disableCell) => {
      if (disableCell) {
        return of(true);
      } else {
        return getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission, WorksheetInsertHyperlinkPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }, true);
      }
    })
  );
};
var linkMenu = {
  commandId: InsertHyperLinkOperation.id,
  type: 0 /* BUTTON */,
  title: "sheets-hyper-link-ui.menu.add",
  icon: "LinkIcon"
};
var genZenEditorMenuId = (id) => `${id}-zen-editor`;
var insertLinkMenuFactory = (accessor) => {
  return {
    ...linkMenu,
    id: linkMenu.commandId,
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */),
    disabled$: getLinkDisable$(accessor)
    // disabled$: getObservableWithExclusiveRange$(accessor, getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission, WorksheetInsertHyperlinkPermission], rangeTypes: [RangeProtectionPermissionEditPoint] })),
  };
};
var zenEditorInsertLinkMenuFactory = (accessor) => {
  return {
    ...linkMenu,
    id: genZenEditorMenuId(linkMenu.commandId),
    hidden$: getMenuHiddenObservable(accessor, 1 /* UNIVER_DOC */, DOCS_ZEN_EDITOR_UNIT_ID_KEY),
    disabled$: getEditingLinkDisable$(accessor)
  };
};
var linkToolbarMenu = {
  tooltip: "sheets-hyper-link-ui.form.addTitle",
  commandId: InsertHyperLinkToolbarOperation.id,
  type: 0 /* BUTTON */,
  icon: "LinkIcon"
};
var insertLinkMenuToolbarFactory = (accessor) => {
  return {
    ...linkToolbarMenu,
    id: linkToolbarMenu.commandId,
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */),
    disabled$: getLinkDisable$(accessor)
  };
};
var zenEditorInsertLinkMenuToolbarFactory = (accessor) => {
  return {
    ...linkToolbarMenu,
    id: genZenEditorMenuId(linkToolbarMenu.commandId),
    hidden$: getMenuHiddenObservable(accessor, 1 /* UNIVER_DOC */, DOCS_ZEN_EDITOR_UNIT_ID_KEY),
    disabled$: getEditingLinkDisable$(accessor)
  };
};
var InsertLinkShortcut = {
  id: InsertHyperLinkToolbarOperation.id,
  binding: 75 /* K */ | 4096 /* CTRL_COMMAND */,
  preconditions: whenSheetEditorFocused
};

// ../packages/sheets-hyper-link-ui/src/controllers/hyper-link-permission.controller.ts
var SheetsHyperLinkPermissionController = class extends Disposable {
  constructor(_localeService, _commandService, _sheetPermissionCheckController) {
    super();
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_sheetPermissionCheckController", _sheetPermissionCheckController);
    this._commandExecutedListener();
  }
  _commandExecutedListener() {
    this.disposeWithMe(
      this._commandService.beforeCommandExecuted((command) => {
        if (command.id === InsertLinkShortcut.id) {
          const permission = this._sheetPermissionCheckController.permissionCheckWithRanges({
            workbookTypes: [WorkbookEditablePermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
            worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission, WorksheetInsertHyperlinkPermission]
          });
          if (!permission) {
            this._sheetPermissionCheckController.blockExecuteWithoutPermission(this._localeService.t("sheets-hyper-link-ui.permission.hyperLinkErr"));
          }
        }
      })
    );
  }
};
SheetsHyperLinkPermissionController = __decorateClass([
  __decorateParam(0, Inject(LocaleService)),
  __decorateParam(1, ICommandService),
  __decorateParam(2, Inject(SheetPermissionCheckController))
], SheetsHyperLinkPermissionController);

// ../packages/sheets-hyper-link-ui/src/controllers/popup.controller.ts
var SheetsHyperLinkPopupController = class extends Disposable {
  constructor(_hoverManagerService, _sheetsHyperLinkPopupService, _renderManagerService, _permissionService, _sheetPermissionCheckController, _commandService, _editorBridgeService, _textSelectionManagerService, _univerInstanceService, _zenZoneService) {
    super();
    __publicField(this, "_hoverManagerService", _hoverManagerService);
    __publicField(this, "_sheetsHyperLinkPopupService", _sheetsHyperLinkPopupService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_permissionService", _permissionService);
    __publicField(this, "_sheetPermissionCheckController", _sheetPermissionCheckController);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_editorBridgeService", _editorBridgeService);
    __publicField(this, "_textSelectionManagerService", _textSelectionManagerService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_zenZoneService", _zenZoneService);
    this._initHoverListener();
    this._initCommandListener();
    this._initHoverEditingListener();
    this._initTextSelectionListener();
    this._initZenEditor();
  }
  _getLinkPermission(location2) {
    const { unitId, subUnitId, row: currentRow, col: currentCol } = location2;
    const workbook = this._univerInstanceService.getUnit(unitId, 2 /* UNIVER_SHEET */);
    const worksheet = workbook == null ? void 0 : workbook.getSheetBySheetId(subUnitId);
    if (!worksheet) {
      return {
        viewPermission: false,
        editPermission: false,
        copyPermission: false
      };
    }
    const viewPermission = this._sheetPermissionCheckController.permissionCheckWithRanges({
      workbookTypes: [WorkbookViewPermission],
      worksheetTypes: [WorksheetViewPermission],
      rangeTypes: [RangeProtectionPermissionViewPoint]
    }, [{ startRow: currentRow, startColumn: currentCol, endRow: currentRow, endColumn: currentCol }], unitId, subUnitId);
    let editPermission = this._sheetPermissionCheckController.permissionCheckWithRanges({
      workbookTypes: [WorkbookEditablePermission],
      worksheetTypes: [WorksheetEditPermission, WorksheetInsertHyperlinkPermission],
      rangeTypes: [RangeProtectionPermissionEditPoint]
    }, [{ startRow: currentRow, startColumn: currentCol, endRow: currentRow, endColumn: currentCol }], unitId, subUnitId);
    const cell = worksheet.getCellRaw(currentRow, currentCol);
    if ((cell == null ? void 0 : cell.f) && cell.f.startsWith("=HYPERLINK(")) {
      editPermission = false;
    }
    const copyPermission = this._permissionService.composePermission([new WorkbookCopyPermission(unitId).id, new WorksheetCopyPermission(unitId, subUnitId).id]).every((permission) => permission.value);
    return {
      viewPermission,
      editPermission,
      copyPermission
    };
  }
  _initHoverListener() {
    this.disposeWithMe(
      // hover over not editing cell
      this._hoverManagerService.currentRichText$.pipe(debounceTime(200)).subscribe((currentCell) => {
        var _a, _b, _c;
        if (!currentCell || ((_a = currentCell.customRange) == null ? void 0 : _a.rangeType) !== 0 /* HYPERLINK */) {
          this._sheetsHyperLinkPopupService.hideCurrentPopup();
          return;
        }
        const { unitId, subUnitId, row, col } = currentCell;
        const renderer = this._renderManagerService.getRenderById(unitId);
        if (!renderer) {
          return;
        }
        const workbook = this._univerInstanceService.getUnit(unitId, 2 /* UNIVER_SHEET */);
        const worksheet = workbook == null ? void 0 : workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) {
          return;
        }
        const hoverRenderController = renderer.with(HoverRenderController);
        if (!hoverRenderController.active) {
          this._sheetsHyperLinkPopupService.hideCurrentPopup("viewing" /* VIEWING */);
          return;
        }
        const skeleton = (_b = renderer == null ? void 0 : renderer.with(SheetSkeletonManagerService).getSkeletonParam(subUnitId)) == null ? void 0 : _b.skeleton;
        const currentCol = col;
        const currentRow = row;
        let targetRow = currentRow;
        let targetCol = currentCol;
        if (skeleton) {
          skeleton.overflowCache.forValue((row2, col2, value) => {
            if (Rectangle.contains(value, { startColumn: currentCol, endColumn: currentCol, startRow: currentRow, endRow: currentRow })) {
              targetRow = row2;
              targetCol = col2;
            }
          });
        }
        const { viewPermission, editPermission, copyPermission } = this._getLinkPermission(currentCell);
        if (!viewPermission) {
          this._sheetsHyperLinkPopupService.hideCurrentPopup();
          return;
        }
        const cell = worksheet.getCellStyleOnly(targetRow, targetCol);
        const style = workbook.getStyles().getStyleByCell(cell);
        const tr = (_c = style == null ? void 0 : style.tr) == null ? void 0 : _c.a;
        if (!tr && !currentCell.customRange) {
          this._sheetsHyperLinkPopupService.hideCurrentPopup();
          return;
        }
        this._sheetsHyperLinkPopupService.showPopup({
          row: targetRow,
          col: targetCol,
          editPermission,
          copyPermission,
          customRange: currentCell.customRange,
          customRangeRect: currentCell.rect,
          type: "viewing" /* VIEWING */,
          unitId,
          subUnitId,
          showAll: Boolean(tr)
        });
      })
    );
  }
  _initHoverEditingListener() {
    let subscribe = null;
    this.disposeWithMe(
      this._editorBridgeService.currentEditCellState$.pipe(switchMap((state) => this._editorBridgeService.visible$.pipe(map((visible) => ({ visible, state }))))).subscribe(({ visible, state }) => {
        if (!state) {
          return;
        }
        if (state.editorUnitId !== DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
          return;
        }
        if (!visible.visible) {
          subscribe == null ? void 0 : subscribe.unsubscribe();
          this._sheetsHyperLinkPopupService.hideCurrentPopup("editing" /* EDITING */);
          this._sheetsHyperLinkPopupService.endEditing("editing" /* EDITING */);
          return;
        }
        const { editorUnitId, unitId, sheetId, row, column } = state;
        const renderer = this._renderManagerService.getRenderById(editorUnitId);
        if (!renderer) {
          return;
        }
        const { editPermission, viewPermission, copyPermission } = this._getLinkPermission({ unitId, subUnitId: sheetId, row, col: column });
        const docEventService = renderer.with(DocEventManagerService);
        if (!viewPermission) {
          return;
        }
        subscribe == null ? void 0 : subscribe.unsubscribe();
        subscribe = docEventService.hoverCustomRanges$.pipe(debounceTime(200)).subscribe((customRanges) => {
          var _a, _b;
          const customRange = customRanges.find((customRange2) => customRange2.range.rangeType === 0 /* HYPERLINK */);
          if (!customRange) {
            this._sheetsHyperLinkPopupService.hideCurrentPopup();
            return;
          }
          const rect = customRange.rects[customRange.rects.length - 1];
          const skeleton = (_b = (_a = this._renderManagerService.getRenderById(unitId)) == null ? void 0 : _a.with(SheetSkeletonManagerService).getSkeletonParam(sheetId)) == null ? void 0 : _b.skeleton;
          if (!skeleton || !rect) {
            return;
          }
          const canvasClientRect = renderer.engine.getCanvasElement().getBoundingClientRect();
          this._sheetsHyperLinkPopupService.showPopup({
            unitId,
            subUnitId: sheetId,
            row,
            col: column,
            customRange: customRange.range,
            customRangeRect: {
              left: rect.left + canvasClientRect.left,
              top: rect.top + canvasClientRect.top,
              bottom: rect.bottom + canvasClientRect.top,
              right: rect.right + canvasClientRect.left
            },
            editPermission,
            copyPermission,
            type: "editing" /* EDITING */
          });
        });
      })
    );
    this.disposeWithMe(() => {
      subscribe == null ? void 0 : subscribe.unsubscribe();
    });
  }
  _initZenEditor() {
    this.disposeWithMe(
      this._zenZoneService.visible$.subscribe((visible) => {
        if (visible) {
          this._sheetsHyperLinkPopupService.hideCurrentPopup("viewing" /* VIEWING */);
          this._sheetsHyperLinkPopupService.hideCurrentPopup("editing" /* EDITING */);
          this._sheetsHyperLinkPopupService.endEditing("editing" /* EDITING */);
          this._sheetsHyperLinkPopupService.hideCurrentPopup("viewing" /* VIEWING */);
        } else {
          this._sheetsHyperLinkPopupService.hideCurrentPopup("zen_mode" /* ZEN_EDITOR */);
          this._sheetsHyperLinkPopupService.endEditing("zen_mode" /* ZEN_EDITOR */);
        }
      })
    );
    this.disposeWithMe(
      this._univerInstanceService.focused$.pipe(
        switchMap((id) => {
          const render = id === DOCS_ZEN_EDITOR_UNIT_ID_KEY ? this._renderManagerService.getRenderById(id) : null;
          if (render) {
            return render.with(DocEventManagerService).hoverCustomRanges$.pipe(debounceTime(200));
          }
          return new Observable((sub) => {
            sub.next(null);
          });
        })
      ).subscribe((value) => {
        const range = value == null ? void 0 : value.find((range2) => range2.range.rangeType === 0 /* HYPERLINK */);
        const state = this._editorBridgeService.getEditCellState();
        if (range && state) {
          const { unitId, sheetId, row, column } = state;
          const { editPermission, viewPermission, copyPermission } = this._getLinkPermission({ unitId, subUnitId: sheetId, row, col: column });
          if (viewPermission) {
            this._sheetsHyperLinkPopupService.showPopup({
              type: "zen_mode" /* ZEN_EDITOR */,
              unitId,
              subUnitId: sheetId,
              row,
              col: column,
              customRange: range.range,
              editPermission,
              copyPermission
            });
          }
        } else {
          this._sheetsHyperLinkPopupService.hideCurrentPopup("zen_mode" /* ZEN_EDITOR */);
        }
      })
    );
  }
  _initTextSelectionListener() {
    this.disposeWithMe(
      this._textSelectionManagerService.textSelection$.subscribe((selection) => {
        if (selection && selection.unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
          this._sheetsHyperLinkPopupService.endEditing("editing" /* EDITING */);
        }
      })
    );
  }
  _initCommandListener() {
    const HIDE_COMMAND_LIST = [ClearSelectionContentCommand.id, ClearSelectionAllCommand.id, ClearSelectionFormatCommand.id];
    this.disposeWithMe(this._commandService.onCommandExecuted((command) => {
      if (HIDE_COMMAND_LIST.includes(command.id)) {
        this._sheetsHyperLinkPopupService.hideCurrentPopup();
      }
    }));
  }
};
SheetsHyperLinkPopupController = __decorateClass([
  __decorateParam(0, Inject(HoverManagerService)),
  __decorateParam(1, Inject(SheetsHyperLinkPopupService)),
  __decorateParam(2, Inject(IRenderManagerService)),
  __decorateParam(3, Inject(IPermissionService)),
  __decorateParam(4, Inject(SheetPermissionCheckController)),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IEditorBridgeService),
  __decorateParam(7, Inject(DocSelectionManagerService)),
  __decorateParam(8, IUniverInstanceService),
  __decorateParam(9, IZenZoneService)
], SheetsHyperLinkPopupController);

// ../packages/sheets-hyper-link-ui/src/controllers/render-controllers/render.controller.ts
var SheetsHyperLinkRenderController = class extends Disposable {
  constructor(_context, _hyperLinkModel) {
    super();
    __publicField(this, "_context", _context);
    __publicField(this, "_hyperLinkModel", _hyperLinkModel);
    this._initSkeletonChange();
  }
  _initSkeletonChange() {
    const markSkeletonDirty = () => {
      var _a;
      (_a = this._context.mainComponent) == null ? void 0 : _a.makeForceDirty();
    };
    this.disposeWithMe(this._hyperLinkModel.linkUpdate$.pipe(debounceTime(16)).subscribe(() => {
      markSkeletonDirty();
    }));
  }
};
SheetsHyperLinkRenderController = __decorateClass([
  __decorateParam(1, Inject(HyperLinkModel))
], SheetsHyperLinkRenderController);

// ../packages/sheets-hyper-link-ui/src/menu/schema.ts
var menuSchema = {
  ["ribbon.insert.media" /* MEDIA */]: {
    [InsertHyperLinkToolbarOperation.id]: {
      order: 1,
      menuItemFactory: insertLinkMenuToolbarFactory
    },
    [genZenEditorMenuId(InsertHyperLinkToolbarOperation.id)]: {
      order: 1,
      menuItemFactory: zenEditorInsertLinkMenuToolbarFactory
    }
  },
  ["contextMenu.mainArea" /* MAIN_AREA */]: {
    ["contextMenu.others" /* OTHERS */]: {
      order: 1,
      [InsertHyperLinkToolbarOperation.id]: {
        order: 0,
        menuItemFactory: insertLinkMenuFactory
      },
      [genZenEditorMenuId(InsertHyperLinkToolbarOperation.id)]: {
        order: 0,
        menuItemFactory: zenEditorInsertLinkMenuFactory
      }
    }
  }
};

// ../packages/sheets-hyper-link-ui/src/controllers/ui.controller.ts
var SheetsHyperLinkUIController = class extends Disposable {
  constructor(_componentManager, _commandService, _menuManagerService, _injector, _shortcutService) {
    super();
    __publicField(this, "_componentManager", _componentManager);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_menuManagerService", _menuManagerService);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_shortcutService", _shortcutService);
    this._initComponents();
    this._initCommands();
    this._initMenus();
    this._initShortCut();
  }
  _initComponents() {
    [
      [CellLinkPopup.componentKey, CellLinkPopup],
      [CellLinkEdit.componentKey, CellLinkEdit],
      ["LinkIcon", LinkIcon]
    ].forEach(([key, comp]) => {
      this._componentManager.register(key, comp);
    });
  }
  _initCommands() {
    [
      OpenHyperLinkEditPanelOperation,
      CloseHyperLinkPopupOperation,
      InsertHyperLinkOperation,
      InsertHyperLinkToolbarOperation
    ].forEach((command) => {
      this._commandService.registerCommand(command);
    });
  }
  _initMenus() {
    this._menuManagerService.mergeMenu(menuSchema);
  }
  _initShortCut() {
    this._shortcutService.registerShortcut(InsertLinkShortcut);
  }
};
SheetsHyperLinkUIController = __decorateClass([
  __decorateParam(0, Inject(ComponentManager)),
  __decorateParam(1, ICommandService),
  __decorateParam(2, IMenuManagerService),
  __decorateParam(3, Inject(Injector)),
  __decorateParam(4, Inject(IShortcutService))
], SheetsHyperLinkUIController);

// ../packages/sheets-hyper-link-ui/src/controllers/url.controller.ts
var SheetHyperLinkUrlController = class extends Disposable {
  constructor(_parserService, _resolverService) {
    super();
    __publicField(this, "_parserService", _parserService);
    __publicField(this, "_resolverService", _resolverService);
    this._handleInitUrl();
  }
  _handleInitUrl() {
    const hash = location.hash;
    if (hash) {
      const linkInfo = this._parserService.parseHyperLink(hash);
      this._resolverService.navigate(linkInfo);
    }
  }
};
SheetHyperLinkUrlController = __decorateClass([
  __decorateParam(0, Inject(SheetsHyperLinkParserService)),
  __decorateParam(1, Inject(SheetsHyperLinkResolverService))
], SheetHyperLinkUrlController);

// ../packages/sheets-hyper-link-ui/src/plugin.ts
var UniverSheetsHyperLinkUIPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig2, _injector, _configService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_configService", _configService);
    const { menu, ...rest } = merge_default(
      {},
      defaultPluginConfig2,
      this._config
    );
    if (menu) {
      this._configService.setConfig("menu", menu, { merge: true });
    }
    this._configService.setConfig(SHEETS_HYPER_LINK_UI_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    const dependencies = [
      [SheetsHyperLinkResolverService],
      [SheetsHyperLinkPopupService],
      [SheetsHyperLinkSidePanelService],
      [SheetsHyperLinkPopupController],
      [SheetsHyperLinkUIController],
      [SheetsHyperLinkAutoFillController],
      [SheetsHyperLinkCopyPasteController],
      [SheetsHyperLinkPermissionController],
      [SheetHyperLinkUrlController]
    ];
    dependencies.forEach((dep) => this._injector.add(dep));
  }
  onReady() {
    const renderManager = this._injector.get(IRenderManagerService);
    renderManager.registerRenderModule(2 /* UNIVER_SHEET */, [SheetsHyperLinkRenderController]);
    this._injector.get(SheetsHyperLinkAutoFillController);
    this._injector.get(SheetsHyperLinkCopyPasteController);
    this._injector.get(SheetsHyperLinkUIController);
  }
  onRendered() {
    this._injector.get(SheetsHyperLinkPermissionController);
    this._injector.get(SheetHyperLinkUrlController);
    this._injector.get(SheetsHyperLinkPopupController);
  }
};
__publicField(UniverSheetsHyperLinkUIPlugin, "pluginName", SHEET_HYPER_LINK_UI_PLUGIN);
__publicField(UniverSheetsHyperLinkUIPlugin, "packageName", package_default2.name);
__publicField(UniverSheetsHyperLinkUIPlugin, "version", package_default2.version);
__publicField(UniverSheetsHyperLinkUIPlugin, "type", 2 /* UNIVER_SHEET */);
UniverSheetsHyperLinkUIPlugin = __decorateClass([
  DependentOn(UniverSheetsHyperLinkPlugin, UniverDocsUIPlugin),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IConfigService)
], UniverSheetsHyperLinkUIPlugin);

export {
  SheetsHyperLinkParserService,
  UniverSheetsHyperLinkPlugin,
  SheetsHyperLinkResolverService,
  UniverSheetsHyperLinkUIPlugin
};
