import {
  BaseSelectionRenderService,
  COPY_SPECIAL_MENU_ID,
  CellAlertManagerService,
  EMBEDDING_FORMULA_EDITOR,
  EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY,
  ExpandSelectionCommand,
  HoverManagerService,
  IEditorBridgeService,
  IMarkSelectionService,
  ISheetClipboardService,
  MoveSelectionCommand,
  PASTE_SPECIAL_MENU_ID,
  PREDEFINED_HOOK_NAME_COPY,
  PREDEFINED_HOOK_NAME_PASTE,
  RANGE_SELECTOR_COMPONENT_KEY,
  SelectionControl,
  SetCellEditVisibleOperation,
  SheetPasteCommand,
  SheetSkeletonManagerService,
  genNormalSelectionStyle,
  getCoordByOffset,
  getCurrentRangeDisable$,
  getSheetObject,
  matchedSelectionByRowColIndex,
  menuClipboardDisabledObservable,
  selectionDataForSelectAll,
  useActiveWorkbook,
  whenSheetEditorActivated,
  whenSheetEditorFocused
} from "./chunk-BHQGV2VJ.js";
import {
  DocBackScrollRenderController,
  DocSelectionManagerService,
  DocSelectionRenderService,
  IEditorService,
  MoveCursorOperation,
  MoveSelectionOperation,
  ReplaceTextRunsCommand,
  RichTextEditor,
  useKeyboardEvent,
  useResize
} from "./chunk-7ZOWWEOA.js";
import {
  Button,
  CheckMarkIcon,
  CloseIcon,
  ComponentManager,
  DeleteIcon,
  Dialog,
  IContextMenuService,
  IMenuManagerService,
  IShortcutService,
  ISidebarService,
  IUIPartsService,
  IZenZoneService,
  IncreaseIcon,
  Input,
  MoreIcon,
  ProgressBar,
  RectPopup,
  Select,
  SelectRangeIcon,
  Tooltip,
  borderClassName,
  borderLeftClassName,
  borderTopClassName,
  clsx,
  connectInjector,
  getMenuHiddenObservable,
  require_jsx_runtime,
  require_react,
  scrollbarClassName,
  useDependency,
  useEvent,
  useObservable,
  useUpdateEffect
} from "./chunk-VNXQUZSG.js";
import {
  IDescriptionService,
  ImageFormulaCellInterceptorController,
  InsertFunctionCommand,
  PLUGIN_CONFIG_KEY_BASE,
  QuickSumCommand,
  TriggerCalculationController,
  UniverSheetsFormulaPlugin
} from "./chunk-YVPSS3XX.js";
import {
  BEFORE_CELL_EDIT,
  FormulaDataModel,
  FunctionType,
  INTERCEPTOR_POINT,
  IRefSelectionsService,
  LexerTreeBuilder,
  REF_SELECTIONS_ENABLED,
  RangeProtectionPermissionEditPoint,
  RangeProtectionPermissionViewPoint,
  ReorderRangeCommand,
  SetArrayFormulaDataMutation,
  SetFormulaCalculationResultMutation,
  SetFormulaCalculationStopMutation,
  SetRangeValuesMutation,
  SetRangeValuesUndoMutationFactory,
  SetSelectionsOperation,
  SetWorksheetActiveOperation,
  SetWorksheetRowAutoHeightMutation,
  SheetInterceptorService,
  SheetSkeletonService,
  SheetsSelectionsService,
  WorkbookCopyPermission,
  WorkbookEditablePermission,
  WorksheetCopyPermission,
  WorksheetEditPermission,
  WorksheetSetCellValuePermission,
  attachSelectionWithCoord,
  convertSelectionDataToRange,
  deserializeRangeWithSheet,
  deserializeRangeWithSheetWithCache,
  extractFormulaError,
  generateStringWithSequence,
  getAbsoluteRefTypeWithSingleString,
  getCellAtRowCol,
  getSheetCommandTarget,
  handleRefStringInfo,
  isFormulaLexerToken,
  matchRefDrawToken,
  serializeRange,
  serializeRangeToRefString,
  serializeRangeWithSheet,
  serializeRangeWithSpreadsheet,
  setEndForRange
} from "./chunk-Q6Y4PHRI.js";
import {
  IRenderManagerService,
  Vector2
} from "./chunk-XOCU2XR6.js";
import {
  BehaviorSubject,
  BuildTextUtils,
  ColorKit,
  DEFAULT_EMPTY_DOCUMENT_VALUE,
  DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
  DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
  DependentOn,
  Disposable,
  DisposableCollection,
  EDITOR_ACTIVATED,
  ICommandService,
  IConfigService,
  IContextService,
  ILogService,
  IUniverInstanceService,
  Inject,
  Injector,
  LocaleService,
  ObjectMatrix,
  Plugin,
  Range,
  Rectangle,
  RichTextBuilder,
  RxDisposable,
  Subject,
  ThemeService,
  Tools,
  combineLatestWith,
  createIdentifier,
  createInternalEditorID,
  debounceTime,
  distinctUntilChanged,
  filter,
  generateRandomId,
  getBodySlice,
  getCellValueType,
  getEmptyCell,
  isFormulaId,
  isFormulaString,
  isICellData,
  isRealNum,
  map,
  merge,
  merge_default,
  noop,
  registerDependencies,
  throttleTime,
  toDisposable,
  touchDependencies
} from "./chunk-EJSPXROI.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField,
  __toESM
} from "./chunk-24OICD5T.js";

// ../packages/sheets-formula-ui/package.json
var package_default = {
  name: "@univerjs/sheets-formula-ui",
  version: "0.25.2",
  private: false,
  description: "Formula editing UI for Univer Sheets.",
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
    "formula",
    "formula-editor",
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
    "@univerjs/sheets-formula": "workspace:*",
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

// ../packages/sheets-formula-ui/src/common/plugin-name.ts
var FORMULA_UI_PLUGIN_NAME = "SHEET_FORMULA_UI_PLUGIN";

// ../packages/sheets-formula-ui/src/config/config.ts
var PLUGIN_CONFIG_KEY_BASE2 = "sheets-formula-ui.base.config";
var configSymbolBase = Symbol(PLUGIN_CONFIG_KEY_BASE2);
var defaultPluginConfig = {};

// ../packages/sheets-formula-ui/src/controllers/formula-alert-render.controller.ts
var ALERT_KEY = "SHEET_FORMULA_ALERT";
var ErrorTypeToMessageMap = {
  ["#DIV/0!" /* DIV_BY_ZERO */]: "divByZero",
  ["#NAME?" /* NAME */]: "name",
  ["#VALUE!" /* VALUE */]: "value",
  ["#NUM!" /* NUM */]: "num",
  ["#N/A" /* NA */]: "na",
  ["#CYCLE!" /* CYCLE */]: "cycle",
  ["#REF!" /* REF */]: "ref",
  ["#SPILL!" /* SPILL */]: "spill",
  ["#CALC!" /* CALC */]: "calc",
  ["#ERROR!" /* ERROR */]: "error",
  ["#GETTING_DATA" /* CONNECT */]: "connect",
  ["#NULL!" /* NULL */]: "null"
};
var FormulaAlertRenderController = class extends Disposable {
  constructor(_context, _hoverManagerService, _cellAlertManagerService, _localeService, _formulaDataModel, _zenZoneService) {
    super();
    __publicField(this, "_context", _context);
    __publicField(this, "_hoverManagerService", _hoverManagerService);
    __publicField(this, "_cellAlertManagerService", _cellAlertManagerService);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_formulaDataModel", _formulaDataModel);
    __publicField(this, "_zenZoneService", _zenZoneService);
    this._init();
  }
  _init() {
    this._initCellAlertPopup();
    this._initZenService();
  }
  _initCellAlertPopup() {
    this.disposeWithMe(this._hoverManagerService.currentCell$.pipe(debounceTime(100)).subscribe((cellPos) => {
      var _a, _b, _c, _d, _e;
      if (cellPos) {
        const workbook = this._context.unit;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return this._hideAlert();
        const cellData = worksheet.getCell(cellPos.location.row, cellPos.location.col);
        const arrayFormulaCellData = (_d = (_c = (_b = (_a = this._formulaDataModel.getArrayFormulaCellData()) == null ? void 0 : _a[cellPos.location.unitId]) == null ? void 0 : _b[cellPos.location.subUnitId]) == null ? void 0 : _c[cellPos.location.row]) == null ? void 0 : _d[cellPos.location.col];
        if (isICellData(cellData)) {
          const errorType = extractFormulaError(cellData, !!arrayFormulaCellData);
          if (!errorType) {
            this._hideAlert();
            return;
          }
          const currentAlert = this._cellAlertManagerService.currentAlert.get(ALERT_KEY);
          const currentLoc = (_e = currentAlert == null ? void 0 : currentAlert.alert) == null ? void 0 : _e.location;
          if (currentLoc && currentLoc.row === cellPos.location.row && currentLoc.col === cellPos.location.col && currentLoc.subUnitId === cellPos.location.subUnitId && currentLoc.unitId === cellPos.location.unitId) {
            this._hideAlert();
            return;
          }
          this._cellAlertManagerService.showAlert({
            type: 2 /* ERROR */,
            title: this._localeService.t("sheets-formula-ui.error.title"),
            message: this._localeService.t(`sheets-formula-ui.error.${ErrorTypeToMessageMap[errorType]}`),
            location: cellPos.location,
            width: 200,
            height: 74,
            key: ALERT_KEY
          });
          return;
        }
      }
      this._hideAlert();
    }));
  }
  _initZenService() {
    this.disposeWithMe(this._zenZoneService.visible$.subscribe((visible) => {
      if (visible) {
        this._hideAlert();
      }
    }));
  }
  _hideAlert() {
    this._cellAlertManagerService.removeAlert(ALERT_KEY);
  }
};
FormulaAlertRenderController = __decorateClass([
  __decorateParam(1, Inject(HoverManagerService)),
  __decorateParam(2, Inject(CellAlertManagerService)),
  __decorateParam(3, Inject(LocaleService)),
  __decorateParam(4, Inject(FormulaDataModel)),
  __decorateParam(5, IZenZoneService)
], FormulaAlertRenderController);

// ../packages/sheets-formula-ui/src/controllers/formula-clipboard.controller.ts
var DEFAULT_PASTE_FORMULA = "default-paste-formula";
var FormulaClipboardController = class extends Disposable {
  constructor(_univerInstanceService, _lexerTreeBuilder, _sheetClipboardService, _injector, _formulaDataModel) {
    super();
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_lexerTreeBuilder", _lexerTreeBuilder);
    __publicField(this, "_sheetClipboardService", _sheetClipboardService);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_formulaDataModel", _formulaDataModel);
    this._initialize();
  }
  _initialize() {
    this._registerClipboardHook();
  }
  _registerClipboardHook() {
    this.disposeWithMe(this._sheetClipboardService.addClipboardHook(this._copyFormulaOnlyHook()));
    this.disposeWithMe(this._sheetClipboardService.addClipboardHook(this._pasteFormulaHook()));
    this.disposeWithMe(this._sheetClipboardService.addClipboardHook(this._pasteWithFormulaHook()));
  }
  _copyFormulaOnlyHook() {
    const self = this;
    let currentSheet = null;
    return {
      id: PREDEFINED_HOOK_NAME_COPY.SPECIAL_COPY_FORMULA_ONLY,
      priority: 10,
      onBeforeCopy(unitId, subUnitId) {
        currentSheet = self._getWorksheet(unitId, subUnitId);
      },
      onCopyCellContent(row, col) {
        if (!currentSheet) return "";
        const cell = currentSheet.getCellRaw(row, col);
        if (!cell) return "";
        if (isFormulaString(cell.f)) return cell.f;
        if (isFormulaId(cell.si)) {
          const formulaDataModel = self._formulaDataModel;
          const formulaString = formulaDataModel.getFormulaStringByCell(row, col, currentSheet.getSheetId(), currentSheet.getUnitId());
          return formulaString || "";
        }
        return "";
      },
      onAfterCopy() {
        currentSheet = null;
      },
      getFilteredOutRows(unitId, subUnitId, range) {
        const worksheet = self._getWorksheet(unitId, subUnitId);
        if (!worksheet) return [];
        const { startRow, endRow } = range;
        const res = [];
        for (let r = startRow; r <= endRow; r++) {
          if (worksheet.getRowFiltered(r)) {
            res.push(r);
          }
        }
        return res;
      },
      handleMatrixOnCell(row, column, rowIndexInMatrix, columnIndexInMatrix, matrix, matrixFragment, plainMatrix) {
        const cellData = matrix.getValue(row, column);
        if (currentSheet && cellData && (isFormulaString(cellData.f) || isFormulaId(cellData.si))) {
          const formulaString = isFormulaString(cellData.f) ? cellData.f : self._formulaDataModel.getFormulaStringByCell(row, column, currentSheet.getSheetId(), currentSheet.getUnitId());
          matrixFragment.setValue(rowIndexInMatrix, columnIndexInMatrix, {
            ...getEmptyCell(),
            f: formulaString
          });
          plainMatrix.setValue(rowIndexInMatrix, columnIndexInMatrix, {
            ...getEmptyCell(),
            f: formulaString,
            displayV: formulaString
          });
        } else {
          matrix.setValue(row, column, getEmptyCell());
          matrixFragment.setValue(rowIndexInMatrix, columnIndexInMatrix, getEmptyCell());
          plainMatrix.setValue(rowIndexInMatrix, columnIndexInMatrix, getEmptyCell());
        }
      }
    };
  }
  _pasteFormulaHook() {
    return {
      id: PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMULA,
      priority: 10,
      specialPasteInfo: { label: "specialPaste.formula" },
      onPasteCells: (pasteFrom, pasteTo, data, payload) => this._onPasteCells(pasteFrom, pasteTo, data, payload, true)
    };
  }
  _pasteWithFormulaHook() {
    return {
      id: DEFAULT_PASTE_FORMULA,
      priority: 10,
      onPasteCells: (pasteFrom, pasteTo, data, payload) => this._onPasteCells(pasteFrom, pasteTo, data, payload, false)
    };
  }
  _getWorkbook(unitId) {
    if (unitId) {
      return this._univerInstanceService.getUnit(unitId, 2 /* UNIVER_SHEET */);
    }
    return this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
  }
  _getWorksheet(unitId, subUnitId) {
    const workbook = this._getWorkbook(unitId);
    if (subUnitId) {
      return workbook == null ? void 0 : workbook.getSheetBySheetId(subUnitId);
    }
    return workbook == null ? void 0 : workbook.getActiveSheet();
  }
  _onPasteCells(pasteFrom, pasteTo, data, payload, isSpecialPaste) {
    var _a;
    const specialPastes = [
      PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMAT,
      PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_COL_WIDTH
    ];
    if (specialPastes.includes(payload.pasteType)) {
      return {
        undos: [],
        redos: []
      };
    }
    if (payload.copyType === "CUT" /* CUT */ && !isSpecialPaste) {
      return {
        undos: [],
        redos: []
      };
    }
    const workbook = this._getWorkbook();
    const unitId = pasteTo.unitId || (workbook == null ? void 0 : workbook.getUnitId());
    const subUnitId = pasteTo.subUnitId || ((_a = workbook == null ? void 0 : workbook.getActiveSheet()) == null ? void 0 : _a.getSheetId());
    if (!unitId || !subUnitId) {
      return {
        undos: [],
        redos: []
      };
    }
    const pastedRange = pasteTo.range;
    const matrix = data;
    const copyInfo = {
      copyType: payload.copyType || "COPY" /* COPY */,
      copyRange: pasteFrom == null ? void 0 : pasteFrom.range,
      pasteType: payload.pasteType
    };
    return this._injector.invoke((accessor) => getSetCellFormulaMutations(
      unitId,
      subUnitId,
      pastedRange,
      matrix,
      accessor,
      copyInfo,
      this._lexerTreeBuilder,
      this._formulaDataModel,
      isSpecialPaste,
      pasteFrom
    ));
  }
};
FormulaClipboardController = __decorateClass([
  __decorateParam(0, IUniverInstanceService),
  __decorateParam(1, Inject(LexerTreeBuilder)),
  __decorateParam(2, ISheetClipboardService),
  __decorateParam(3, Inject(Injector)),
  __decorateParam(4, Inject(FormulaDataModel))
], FormulaClipboardController);
function getSetCellFormulaMutations(unitId, subUnitId, range, matrix, accessor, copyInfo, lexerTreeBuilder, formulaDataModel, _isSpecialPaste = false, pasteFrom) {
  const redoMutationsInfo = [];
  const undoMutationsInfo = [];
  const valueMatrix = getValueMatrix(unitId, subUnitId, range, matrix, copyInfo, lexerTreeBuilder, formulaDataModel, pasteFrom);
  if (!valueMatrix.hasValue()) {
    return {
      undos: [],
      redos: []
    };
  }
  const setValuesMutation = {
    unitId,
    subUnitId,
    cellValue: valueMatrix.getData()
  };
  redoMutationsInfo.push({
    id: SetRangeValuesMutation.id,
    params: setValuesMutation
  });
  const undoSetValuesMutation = SetRangeValuesUndoMutationFactory(
    accessor,
    setValuesMutation
  );
  undoMutationsInfo.push({
    id: SetRangeValuesMutation.id,
    params: undoSetValuesMutation
  });
  return {
    undos: undoMutationsInfo,
    redos: redoMutationsInfo
  };
}
function getValueMatrix(unitId, subUnitId, range, matrix, copyInfo, lexerTreeBuilder, formulaDataModel, pasteFrom) {
  if (!pasteFrom) {
    return getValueMatrixOfPasteFromIsNull(unitId, subUnitId, range, matrix, formulaDataModel);
  }
  if (copyInfo.pasteType === PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE) {
    return getSpecialPasteValueValueMatrix(unitId, subUnitId, range, matrix, formulaDataModel, pasteFrom);
  }
  if (copyInfo.pasteType === PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMULA) {
    return getSpecialPasteFormulaValueMatrix(unitId, subUnitId, range, matrix, lexerTreeBuilder, formulaDataModel, pasteFrom);
  }
  return getDefaultPasteValueMatrix(unitId, subUnitId, range, matrix, copyInfo.copyType, lexerTreeBuilder, formulaDataModel, pasteFrom);
}
function getValueMatrixOfPasteFromIsNull(unitId, subUnitId, range, matrix, formulaDataModel) {
  const valueMatrix = new ObjectMatrix();
  const formulaData = formulaDataModel.getSheetFormulaData(unitId, subUnitId);
  matrix.forValue((row, col, value) => {
    var _a;
    const toRow = range.rows[row];
    const toCol = range.cols[col];
    const valueObject = {};
    if (isFormulaString(value.v)) {
      valueObject.v = null;
      valueObject.f = `${value.v}`;
      valueObject.si = null;
      valueObject.p = null;
      valueMatrix.setValue(toRow, toCol, valueObject);
    } else if ((_a = formulaData == null ? void 0 : formulaData[toRow]) == null ? void 0 : _a[toCol]) {
      valueObject.v = value.v;
      valueObject.f = null;
      valueObject.si = null;
      valueObject.p = null;
      valueMatrix.setValue(toRow, toCol, valueObject);
    }
  });
  return valueMatrix;
}
function getSpecialPasteValueValueMatrix(unitId, subUnitId, range, matrix, formulaDataModel, pasteFrom) {
  var _a, _b;
  const valueMatrix = new ObjectMatrix();
  const arrayFormulaCellData = (_b = (_a = formulaDataModel.getArrayFormulaCellData()) == null ? void 0 : _a[pasteFrom.unitId]) == null ? void 0 : _b[pasteFrom.subUnitId];
  const formulaData = formulaDataModel.getSheetFormulaData(unitId, subUnitId);
  matrix.forValue((row, col, value) => {
    var _a2, _b2;
    const fromRow = pasteFrom.range.rows[row % pasteFrom.range.rows.length];
    const fromCol = pasteFrom.range.cols[col % pasteFrom.range.cols.length];
    const toRow = range.rows[row];
    const toCol = range.cols[col];
    const valueObject = {};
    if (isFormulaString(value.f) || isFormulaId(value.si)) {
      valueObject.v = value.v;
      valueObject.f = null;
      valueObject.si = null;
      valueObject.p = null;
      valueMatrix.setValue(toRow, toCol, valueObject);
    } else if ((_a2 = arrayFormulaCellData == null ? void 0 : arrayFormulaCellData[fromRow]) == null ? void 0 : _a2[fromCol]) {
      const cell = arrayFormulaCellData[fromRow][fromCol];
      valueObject.v = cell.v;
      valueObject.f = null;
      valueObject.si = null;
      valueObject.p = null;
      valueMatrix.setValue(toRow, toCol, valueObject);
    } else if ((_b2 = formulaData == null ? void 0 : formulaData[toRow]) == null ? void 0 : _b2[toCol]) {
      valueObject.v = value.v;
      valueObject.f = null;
      valueObject.si = null;
      valueObject.p = null;
      if (value.p) {
        const richText = getCellRichText(value);
        if (richText) {
          valueObject.v = richText;
        }
      }
      valueMatrix.setValue(toRow, toCol, valueObject);
    }
  });
  return valueMatrix;
}
function getSpecialPasteFormulaValueMatrix(unitId, subUnitId, range, matrix, lexerTreeBuilder, formulaDataModel, pasteFrom) {
  const valueMatrix = new ObjectMatrix();
  const formulaIdMap = /* @__PURE__ */ new Map();
  matrix.forValue((row, col, value) => {
    const toRow = range.rows[row];
    const toCol = range.cols[col];
    const valueObject = {};
    if (isFormulaId(value.si)) {
      if (pasteFrom.unitId !== unitId || pasteFrom.subUnitId !== subUnitId) {
        const formulaString = formulaDataModel.getFormulaStringByCell(
          pasteFrom.range.rows[row % pasteFrom.range.rows.length],
          pasteFrom.range.cols[col % pasteFrom.range.cols.length],
          pasteFrom.subUnitId,
          pasteFrom.unitId
        );
        const offsetX = range.cols[col] - pasteFrom.range.cols[col % pasteFrom.range.cols.length];
        const offsetY = range.rows[row] - pasteFrom.range.rows[row % pasteFrom.range.rows.length];
        const shiftedFormula = lexerTreeBuilder.moveFormulaRefOffset(formulaString || "", offsetX, offsetY);
        valueObject.si = null;
        valueObject.f = shiftedFormula;
      } else {
        valueObject.si = value.si;
        valueObject.f = null;
      }
      valueObject.v = null;
      valueObject.p = null;
      valueMatrix.setValue(toRow, toCol, valueObject);
    } else if (isFormulaString(value.f)) {
      const index = `${row % pasteFrom.range.rows.length}_${col % pasteFrom.range.cols.length}`;
      let formulaId = formulaIdMap.get(index);
      if (!formulaId) {
        formulaId = generateRandomId(6);
        formulaIdMap.set(index, formulaId);
        const offsetX = range.cols[col] - pasteFrom.range.cols[col % pasteFrom.range.cols.length];
        const offsetY = range.rows[row] - pasteFrom.range.rows[row % pasteFrom.range.rows.length];
        const shiftedFormula = lexerTreeBuilder.moveFormulaRefOffset(value.f || "", offsetX, offsetY);
        valueObject.si = formulaId;
        valueObject.f = shiftedFormula;
      } else {
        valueObject.si = formulaId;
        valueObject.f = null;
      }
      valueObject.v = null;
      valueObject.p = null;
      valueMatrix.setValue(toRow, toCol, valueObject);
    } else {
      valueObject.v = value.v;
      valueObject.f = null;
      valueObject.si = null;
      valueObject.p = null;
      if (value.p) {
        const richText = getCellRichText(value);
        if (richText) {
          valueObject.v = richText;
        }
      }
      valueMatrix.setValue(toRow, toCol, valueObject);
    }
  });
  return valueMatrix;
}
function getDefaultPasteValueMatrix(unitId, subUnitId, range, matrix, copyType, lexerTreeBuilder, formulaDataModel, pasteFrom) {
  const valueMatrix = new ObjectMatrix();
  const formulaIdMap = /* @__PURE__ */ new Map();
  const formulaData = formulaDataModel.getSheetFormulaData(unitId, subUnitId);
  const cutFormulaIds = [];
  if (copyType === "CUT" /* CUT */) {
    matrix.forValue((row, col, value) => {
      const toRow = range.rows[row];
      const toCol = range.cols[col];
      const valueObject = {};
      if (isFormulaId(value.si)) {
        if (isFormulaString(value.f)) {
          cutFormulaIds.push(value.si);
          valueObject.f = value.f;
          valueObject.si = value.si;
        } else if (cutFormulaIds.includes(value.si)) {
          valueObject.f = null;
          valueObject.si = value.si;
        } else {
          const formulaString = formulaDataModel.getFormulaStringByCell(
            pasteFrom.range.rows[row % pasteFrom.range.rows.length],
            pasteFrom.range.cols[col % pasteFrom.range.cols.length],
            pasteFrom.subUnitId,
            pasteFrom.unitId
          );
          valueObject.f = formulaString;
          valueObject.si = null;
        }
        valueObject.v = null;
        valueObject.p = null;
        valueMatrix.setValue(toRow, toCol, valueObject);
      } else if (isFormulaString(value.f)) {
        valueObject.f = value.f;
        valueObject.si = null;
        valueObject.v = null;
        valueObject.p = null;
        valueMatrix.setValue(toRow, toCol, valueObject);
      }
    });
  } else {
    matrix.forValue((row, col, value) => {
      var _a;
      const toRow = range.rows[row];
      const toCol = range.cols[col];
      const valueObject = {};
      if (isFormulaId(value.si)) {
        if (pasteFrom.unitId !== unitId || pasteFrom.subUnitId !== subUnitId) {
          const formulaString = formulaDataModel.getFormulaStringByCell(
            pasteFrom.range.rows[row % pasteFrom.range.rows.length],
            pasteFrom.range.cols[col % pasteFrom.range.cols.length],
            pasteFrom.subUnitId,
            pasteFrom.unitId
          );
          const offsetX = range.cols[col] - pasteFrom.range.cols[col % pasteFrom.range.cols.length];
          const offsetY = range.rows[row] - pasteFrom.range.rows[row % pasteFrom.range.rows.length];
          const shiftedFormula = lexerTreeBuilder.moveFormulaRefOffset(formulaString || "", offsetX, offsetY);
          valueObject.si = null;
          valueObject.f = shiftedFormula;
        } else {
          valueObject.si = value.si;
          valueObject.f = null;
        }
        valueObject.v = null;
        valueObject.p = null;
        valueMatrix.setValue(toRow, toCol, valueObject);
      } else if (isFormulaString(value.f)) {
        const index = `${row % pasteFrom.range.rows.length}_${col % pasteFrom.range.cols.length}`;
        let formulaId = formulaIdMap.get(index);
        if (!formulaId) {
          formulaId = generateRandomId(6);
          formulaIdMap.set(index, formulaId);
          const offsetX = range.cols[col] - pasteFrom.range.cols[col % pasteFrom.range.cols.length];
          const offsetY = range.rows[row] - pasteFrom.range.rows[row % pasteFrom.range.rows.length];
          const shiftedFormula = lexerTreeBuilder.moveFormulaRefOffset(value.f || "", offsetX, offsetY);
          valueObject.si = formulaId;
          valueObject.f = shiftedFormula;
        } else {
          valueObject.si = formulaId;
          valueObject.f = null;
        }
        valueObject.v = null;
        valueObject.p = null;
        valueMatrix.setValue(toRow, toCol, valueObject);
      } else if ((_a = formulaData == null ? void 0 : formulaData[toRow]) == null ? void 0 : _a[toCol]) {
        valueObject.v = value.v;
        valueObject.f = null;
        valueObject.si = null;
        valueObject.p = value.p;
        valueMatrix.setValue(toRow, toCol, valueObject);
      }
    });
  }
  if (cutFormulaIds.length > 0) {
    new ObjectMatrix(formulaData).forValue((row, col, value) => {
      if (!(pasteFrom.range.rows.includes(row) && pasteFrom.range.cols.includes(col)) && !(range.rows.includes(row) && range.cols.includes(col)) && cutFormulaIds.includes(value == null ? void 0 : value.si)) {
        const formulaString = formulaDataModel.getFormulaStringByCell(
          row,
          col,
          pasteFrom.subUnitId,
          pasteFrom.unitId
        );
        valueMatrix.setValue(row, col, {
          f: formulaString,
          si: null,
          v: null,
          p: null
        });
      }
    });
  }
  return valueMatrix;
}
function getCellRichText(cell) {
  if (cell == null ? void 0 : cell.p) {
    const body = cell == null ? void 0 : cell.p.body;
    if (body == null) {
      return;
    }
    const data = body.dataStream;
    const lastString = data.substring(data.length - 2, data.length);
    const newDataStream = lastString === DEFAULT_EMPTY_DOCUMENT_VALUE ? data.substring(0, data.length - 2) : data;
    return newDataStream;
  }
}

// ../packages/sheets-formula-ui/src/controllers/formula-editor-show.controller.ts
var FormulaEditorShowController = class extends Disposable {
  constructor(_context, _sheetInterceptorService, _sheetSkeletonService, _formulaDataModel, _themeService, _renderManagerService, _sheetSkeletonManagerService, _commandService, _logService) {
    super();
    __publicField(this, "_context", _context);
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_sheetSkeletonService", _sheetSkeletonService);
    __publicField(this, "_formulaDataModel", _formulaDataModel);
    __publicField(this, "_themeService", _themeService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_sheetSkeletonManagerService", _sheetSkeletonManagerService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_logService", _logService);
    __publicField(this, "_previousShape");
    __publicField(this, "_skeleton");
    this._initSkeletonChangeListener();
    this._initInterceptorEditorStart();
    this._commandExecutedListener();
  }
  _initSkeletonChangeListener() {
    this.disposeWithMe(
      this._sheetSkeletonManagerService.currentSkeleton$.subscribe((param) => {
        var _a, _b;
        if (param == null) {
          this._logService.debug("[FormulaEditorShowController]: should not receive currentSkeleton$ as null!");
        } else {
          const { skeleton } = param;
          const prevSheetId = (_b = (_a = this._skeleton) == null ? void 0 : _a.worksheet) == null ? void 0 : _b.getSheetId();
          this._changeRuntime(skeleton);
          if (prevSheetId !== skeleton.worksheet.getSheetId()) {
            this._removeArrayFormulaRangeShape();
          } else {
            const { unitId, sheetId } = param;
            this._updateArrayFormulaRangeShape(unitId, sheetId);
          }
        }
      })
    );
  }
  _changeRuntime(skeleton) {
    this._skeleton = skeleton;
  }
  _initInterceptorEditorStart() {
    this.disposeWithMe(
      toDisposable(
        this._sheetInterceptorService.writeCellInterceptor.intercept(BEFORE_CELL_EDIT, {
          handler: (value, context, next) => {
            var _a, _b, _c, _d;
            const { row, col, unitId, subUnitId, worksheet } = context;
            const arrayFormulaMatrixRange = this._formulaDataModel.getArrayFormulaRange();
            const arrayFormulaMatrixCell = this._formulaDataModel.getArrayFormulaCellData();
            this._removeArrayFormulaRangeShape();
            if (value == null) {
              return next(value);
            }
            let cellInfo = null;
            const formulaString = this._formulaDataModel.getFormulaStringByCell(row, col, subUnitId, unitId);
            if (formulaString !== null) {
              cellInfo = { f: formulaString };
            }
            if (value.v != null && value.v !== "" && ((_c = (_b = (_a = arrayFormulaMatrixCell[unitId]) == null ? void 0 : _a[subUnitId]) == null ? void 0 : _b[row]) == null ? void 0 : _c[col]) == null) {
              if (cellInfo) {
                return { ...value, ...cellInfo };
              }
              return next(value);
            }
            const matrixRange = (_d = arrayFormulaMatrixRange == null ? void 0 : arrayFormulaMatrixRange[unitId]) == null ? void 0 : _d[subUnitId];
            if (matrixRange != null) {
              cellInfo = this._displayArrayFormulaRangeShape(matrixRange, row, col, unitId, subUnitId, worksheet, cellInfo);
            }
            if (cellInfo) {
              return { ...value, ...cellInfo };
            }
            return next(value);
          }
        })
      )
    );
  }
  _commandExecutedListener() {
    this.disposeWithMe(this._commandService.onCommandExecuted((command, options) => {
      if (command.id === SetFormulaCalculationResultMutation.id || command.id === SetArrayFormulaDataMutation.id && options && options.remove) {
        this._removeArrayFormulaRangeShape();
      }
    }));
    this.disposeWithMe(
      this._commandService.beforeCommandExecuted((command) => {
        if (SetWorksheetRowAutoHeightMutation.id === command.id) {
          requestIdleCallback(() => {
            const params = command.params;
            const { unitId, subUnitId, rowsAutoHeightInfo } = params;
            this._refreshArrayFormulaRangeShapeByRow(unitId, subUnitId, rowsAutoHeightInfo);
          });
        }
      })
    );
  }
  _displayArrayFormulaRangeShape(matrixRange, row, col, unitId, subUnitId, worksheet, cellInfo) {
    new ObjectMatrix(matrixRange).forValue((rowIndex, columnIndex, range) => {
      if (range == null) {
        return true;
      }
      const { startRow, startColumn, endRow, endColumn } = range;
      if (rowIndex === row && columnIndex === col) {
        this._createArrayFormulaRangeShape(range, unitId, subUnitId);
        return false;
      }
      if (row >= startRow && row <= endRow && col >= startColumn && col <= endColumn) {
        const mainCellValue = worksheet.getCell(startRow, startColumn);
        if ((mainCellValue == null ? void 0 : mainCellValue.v) === "#SPILL!" /* SPILL */ || (mainCellValue == null ? void 0 : mainCellValue.f) == null) {
          return;
        }
        if (cellInfo == null) {
          cellInfo = {
            f: mainCellValue.f,
            isInArrayFormulaRange: true
          };
        }
        this._createArrayFormulaRangeShape(range, unitId, subUnitId);
        return false;
      }
    });
    return cellInfo;
  }
  _createArrayFormulaRangeShape(arrayRange, unitId, subUnitId) {
    const renderUnit = this._renderManagerService.getRenderById(unitId);
    const skeleton = this._sheetSkeletonService.getSkeleton(unitId, subUnitId);
    if (!renderUnit || !skeleton) return;
    const { scene } = renderUnit;
    if (!scene) return;
    const selectionWithStyle = {
      range: arrayRange,
      primary: null,
      style: {
        strokeWidth: 1,
        stroke: this._themeService.getColorFromTheme("primary.600"),
        fill: new ColorKit(this._themeService.getColorFromTheme("white")).setAlpha(0).toString(),
        widgets: {}
      }
    };
    const selectionWithCoord = attachSelectionWithCoord(selectionWithStyle, skeleton);
    const { rowHeaderWidth, columnHeaderHeight } = skeleton;
    const control = new SelectionControl(scene, 100 /* FORMULA_EDITOR_SHOW */, this._themeService, {
      highlightHeader: false,
      rowHeaderWidth,
      columnHeaderHeight
    });
    control.updateRangeBySelectionWithCoord(selectionWithCoord);
    control.setEvent(false);
    this._previousShape = control;
  }
  _removeArrayFormulaRangeShape() {
    if (this._previousShape == null) {
      return;
    }
    this._previousShape.dispose();
    this._previousShape = null;
  }
  _refreshArrayFormulaRangeShape(unitId, subUnitId) {
    if (this._previousShape) {
      const { startRow, endRow, startColumn, endColumn } = this._previousShape.getRange();
      const range = { startRow, endRow, startColumn, endColumn };
      this._removeArrayFormulaRangeShape();
      this._createArrayFormulaRangeShape(range, unitId, subUnitId);
    }
  }
  _checkCurrentSheet(unitId, subUnitId) {
    const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
    if (!skeleton) return false;
    const worksheet = skeleton.worksheet;
    if (!worksheet) return false;
    if (worksheet.unitId === unitId && worksheet.getSheetId() === subUnitId) {
      return true;
    }
    return false;
  }
  _updateArrayFormulaRangeShape(unitId, subUnitId) {
    if (!this._checkCurrentSheet(unitId, subUnitId)) return;
    if (!this._previousShape) return;
    this._refreshArrayFormulaRangeShape(unitId, subUnitId);
  }
  _refreshArrayFormulaRangeShapeByRow(unitId, subUnitId, rowAutoHeightInfo) {
    if (!this._checkCurrentSheet(unitId, subUnitId)) return;
    if (!this._previousShape) return;
    const { startRow: shapeStartRow } = this._previousShape.getRange();
    for (let i = 0; i < rowAutoHeightInfo.length; i++) {
      const { row } = rowAutoHeightInfo[i];
      if (shapeStartRow >= row) {
        this._refreshArrayFormulaRangeShape(unitId, subUnitId);
        break;
      }
    }
  }
};
FormulaEditorShowController = __decorateClass([
  __decorateParam(1, Inject(SheetInterceptorService)),
  __decorateParam(2, Inject(SheetSkeletonService)),
  __decorateParam(3, Inject(FormulaDataModel)),
  __decorateParam(4, Inject(ThemeService)),
  __decorateParam(5, IRenderManagerService),
  __decorateParam(6, Inject(SheetSkeletonManagerService)),
  __decorateParam(7, ICommandService),
  __decorateParam(8, ILogService)
], FormulaEditorShowController);

// ../packages/sheets-formula-ui/src/controllers/formula-render.controller.ts
var FORMULA_ERROR_MARK = {
  tl: {
    size: 6,
    color: "#409f11"
  }
};
var FormulaRenderManagerController = class extends RxDisposable {
  constructor(_sheetInterceptorService, _formulaDataModel) {
    super();
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_formulaDataModel", _formulaDataModel);
    this.disposeWithMe(this._sheetInterceptorService.intercept(
      INTERCEPTOR_POINT.CELL_CONTENT,
      {
        effect: 1 /* Style */,
        handler: (cell, pos, next) => {
          var _a, _b, _c, _d;
          const arrayFormulaCellData = (_d = (_c = (_b = (_a = this._formulaDataModel.getArrayFormulaCellData()) == null ? void 0 : _a[pos.unitId]) == null ? void 0 : _b[pos.subUnitId]) == null ? void 0 : _c[pos.row]) == null ? void 0 : _d[pos.col];
          const errorType = extractFormulaError(cell, !!arrayFormulaCellData);
          if (!errorType) {
            return next(cell);
          }
          if (!cell) {
            return next(cell);
          }
          if (cell === pos.rawData) {
            cell = { ...pos.rawData };
          }
          cell.markers = {
            ...cell == null ? void 0 : cell.markers,
            ...FORMULA_ERROR_MARK
          };
          return next(cell);
        },
        priority: 10
      }
    ));
  }
};
FormulaRenderManagerController = __decorateClass([
  __decorateParam(0, Inject(SheetInterceptorService)),
  __decorateParam(1, Inject(FormulaDataModel))
], FormulaRenderManagerController);

// ../packages/sheets-formula-ui/src/controllers/formula-reorder.controller.ts
var FormulaReorderController = class extends Disposable {
  constructor(_sheetInterceptorService, _univerInstanceService, _formulaDataModel, _lexerTreeBuilder) {
    super();
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_formulaDataModel", _formulaDataModel);
    __publicField(this, "_lexerTreeBuilder", _lexerTreeBuilder);
    this._initialize();
  }
  _initialize() {
    this.disposeWithMe(this._sheetInterceptorService.interceptCommand({
      getMutations: (command) => {
        if (command.id === ReorderRangeCommand.id) {
          return this._reorderFormula(command.params);
        }
        return {
          redos: [],
          undos: []
        };
      }
    }));
  }
  _reorderFormula(params) {
    const redos = [];
    const undos = [];
    const { unitId, subUnitId, range, order } = params;
    const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
    const worksheet = workbook == null ? void 0 : workbook.getSheetBySheetId(subUnitId);
    if (!worksheet) {
      return {
        redos,
        undos
      };
    }
    const cellMatrix = worksheet.getCellMatrix();
    const redoFormulaMatrix = new ObjectMatrix();
    const undoFormulaMatrix = new ObjectMatrix();
    let hasFormula = false;
    Range.foreach(range, (row, col) => {
      let targetRow = row;
      if (order.hasOwnProperty(row)) {
        targetRow = order[row];
      }
      const targetCell = cellMatrix.getValue(targetRow, col);
      if ((targetCell == null ? void 0 : targetCell.f) || (targetCell == null ? void 0 : targetCell.si)) {
        hasFormula = true;
        const formulaString = this._formulaDataModel.getFormulaStringByCell(targetRow, col, subUnitId, unitId);
        const shiftedFormula = this._lexerTreeBuilder.moveFormulaRefOffset(
          formulaString,
          0,
          row - targetRow
        );
        const newCell = Tools.deepClone(targetCell);
        newCell.f = shiftedFormula;
        newCell.si = null;
        redoFormulaMatrix.setValue(row, col, newCell);
      } else {
        redoFormulaMatrix.setValue(row, col, targetCell);
      }
      undoFormulaMatrix.setValue(row, col, cellMatrix.getValue(row, col));
    });
    if (!hasFormula) {
      return {
        redos,
        undos
      };
    }
    redos.push({
      id: SetRangeValuesMutation.id,
      params: {
        unitId,
        subUnitId,
        cellValue: redoFormulaMatrix.getMatrix()
      }
    });
    undos.push({
      id: SetRangeValuesMutation.id,
      params: {
        unitId,
        subUnitId,
        cellValue: undoFormulaMatrix.getMatrix()
      }
    });
    return {
      redos,
      undos
    };
  }
};
FormulaReorderController = __decorateClass([
  __decorateParam(0, Inject(SheetInterceptorService)),
  __decorateParam(1, Inject(IUniverInstanceService)),
  __decorateParam(2, Inject(FormulaDataModel)),
  __decorateParam(3, Inject(LexerTreeBuilder))
], FormulaReorderController);

// ../packages/sheets-formula-ui/src/commands/commands/formula-clipboard.command.ts
var SheetCopyFormulaOnlyCommand = {
  id: "sheet.command.copy-formula-only",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    const sheetClipboardService = accessor.get(ISheetClipboardService);
    return sheetClipboardService.copy({
      copyHookType: PREDEFINED_HOOK_NAME_COPY.SPECIAL_COPY_FORMULA_ONLY
    });
  }
};
var SheetOnlyPasteFormulaCommand = {
  id: "sheet.command.paste-formula",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    const commandService = accessor.get(ICommandService);
    return commandService.executeCommand(SheetPasteCommand.id, {
      value: PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMULA
    });
  }
};

// ../packages/sheets-formula-ui/src/services/prompt.service.ts
var FORMULA_PROMPT_ACTIVATED = "FORMULA_PROMPT_ACTIVATED";
var IFormulaPromptService = createIdentifier("formula-ui.prompt-service");
var FormulaPromptService = class {
  constructor(_contextService) {
    __publicField(this, "_contextService", _contextService);
    __publicField(this, "_search$", new Subject());
    __publicField(this, "_help$", new Subject());
    __publicField(this, "_navigate$", new Subject());
    __publicField(this, "_accept$", new Subject());
    __publicField(this, "_acceptFormulaName$", new Subject());
    __publicField(this, "search$", this._search$.asObservable());
    __publicField(this, "help$", this._help$.asObservable());
    __publicField(this, "navigate$", this._navigate$.asObservable());
    __publicField(this, "accept$", this._accept$.asObservable());
    __publicField(this, "acceptFormulaName$", this._acceptFormulaName$.asObservable());
    __publicField(this, "_searching", false);
    __publicField(this, "_helping", false);
    __publicField(this, "_sequenceNodes", []);
    __publicField(this, "_isLockedOnSelectionChangeRefString", false);
    __publicField(this, "_isLockedOnSelectionInsertRefString", false);
  }
  dispose() {
    this._search$.complete();
    this._help$.complete();
    this._navigate$.complete();
    this._accept$.complete();
    this._acceptFormulaName$.complete();
    this._sequenceNodes = [];
  }
  search(param) {
    this._contextService.setContextValue(FORMULA_PROMPT_ACTIVATED, param.visible);
    this._searching = param.visible;
    this._search$.next(param);
  }
  isSearching() {
    return this._searching;
  }
  help(param) {
    this._helping = param.visible;
    this._help$.next(param);
  }
  isHelping() {
    return this._helping;
  }
  navigate(param) {
    this._navigate$.next(param);
  }
  accept(param) {
    this._accept$.next(param);
  }
  acceptFormulaName(param) {
    this._acceptFormulaName$.next(param);
  }
  getSequenceNodes() {
    return [...this._sequenceNodes];
  }
  setSequenceNodes(nodes) {
    this._sequenceNodes = nodes;
  }
  clearSequenceNodes() {
    this._sequenceNodes = [];
  }
  getCurrentSequenceNode(strIndex) {
    return this._sequenceNodes[this.getCurrentSequenceNodeIndex(strIndex)];
  }
  getCurrentSequenceNodeByIndex(nodeIndex) {
    return this._sequenceNodes[nodeIndex];
  }
  /**
   * Query the text coordinates in the sequenceNodes and determine the actual insertion index.
   * @param strIndex
   */
  getCurrentSequenceNodeIndex(strIndex) {
    let nodeIndex = 0;
    const firstNode = this._sequenceNodes[0];
    for (let i = 0, len = this._sequenceNodes.length; i < len; i++) {
      const node = this._sequenceNodes[i];
      if (typeof node === "string") {
        nodeIndex++;
      } else {
        const { endIndex } = node;
        nodeIndex = endIndex;
      }
      if (strIndex <= nodeIndex) {
        if (typeof firstNode === "string" && strIndex !== 0) {
          return i + 1;
        }
        return i;
      }
    }
    return this._sequenceNodes.length;
  }
  /**
   * Synchronize the reference text based on the changes of the selection.
   * @param nodeIndex
   * @param refString
   */
  updateSequenceRef(nodeIndex, refString) {
    const node = this._sequenceNodes[nodeIndex];
    if (typeof node === "string" || node.nodeType !== 4 /* REFERENCE */) {
      return;
    }
    const difference = refString.length - node.token.length;
    const newNode = { ...node };
    newNode.token = refString;
    newNode.endIndex += difference;
    this._sequenceNodes[nodeIndex] = newNode;
    for (let i = nodeIndex + 1, len = this._sequenceNodes.length; i < len; i++) {
      const node2 = this._sequenceNodes[i];
      if (typeof node2 === "string") {
        continue;
      }
      const newNode2 = { ...node2 };
      newNode2.startIndex += difference;
      newNode2.endIndex += difference;
      this._sequenceNodes[i] = newNode2;
    }
  }
  /**
   * When the cursor is on the right side of a formula token,
   * you can add reference text to the formula by drawing a selection.
   * @param index
   * @param refString
   */
  insertSequenceRef(index, refString) {
    const refStringCount = refString.length;
    const nodeIndex = this.getCurrentSequenceNodeIndex(index);
    this._sequenceNodes.splice(nodeIndex, 0, {
      token: refString,
      startIndex: index,
      endIndex: index + refStringCount - 1,
      nodeType: 4 /* REFERENCE */
    });
    for (let i = nodeIndex + 1, len = this._sequenceNodes.length; i < len; i++) {
      const node = this._sequenceNodes[i];
      if (typeof node === "string") {
        continue;
      }
      const newNode = { ...node };
      newNode.startIndex += refStringCount;
      newNode.endIndex += refStringCount;
      this._sequenceNodes[i] = newNode;
    }
  }
  /**
   * Insert a string at the cursor position in the text corresponding to the sequenceNodes.
   * @param index
   * @param content
   */
  insertSequenceString(index, content) {
    const nodeIndex = this.getCurrentSequenceNodeIndex(index);
    const str = content.split("");
    this._sequenceNodes.splice(nodeIndex, 0, ...str);
    const contentCount = str.length;
    for (let i = nodeIndex + contentCount, len = this._sequenceNodes.length; i < len; i++) {
      const node = this._sequenceNodes[i];
      if (typeof node === "string") {
        continue;
      }
      const newNode = { ...node };
      newNode.startIndex += contentCount;
      newNode.endIndex += contentCount;
      this._sequenceNodes[i] = newNode;
    }
  }
  enableLockedSelectionChange() {
    this._isLockedOnSelectionChangeRefString = true;
  }
  disableLockedSelectionChange() {
    this._isLockedOnSelectionChangeRefString = false;
  }
  isLockedSelectionChange() {
    return this._isLockedOnSelectionChangeRefString;
  }
  enableLockedSelectionInsert() {
    this._isLockedOnSelectionInsertRefString = true;
  }
  disableLockedSelectionInsert() {
    this._isLockedOnSelectionInsertRefString = false;
  }
  isLockedSelectionInsert() {
    return this._isLockedOnSelectionInsertRefString;
  }
};
FormulaPromptService = __decorateClass([
  __decorateParam(0, IContextService)
], FormulaPromptService);

// ../packages/sheets-formula-ui/src/commands/operations/help-function.operation.ts
var HelpFunctionOperation = {
  id: "formula-ui.operation.help-function",
  type: 1 /* OPERATION */,
  handler: async (accessor, params) => {
    const promptService = accessor.get(IFormulaPromptService);
    promptService.help(params);
    return true;
  }
};

// ../packages/sheets-formula-ui/src/commands/operations/insert-function.operation.ts
var InsertFunctionOperation = {
  id: "formula-ui.operation.insert-function",
  type: 1 /* OPERATION */,
  // eslint-disable-next-line
  handler: async (accessor, params) => {
    var _a, _b;
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const editorService = accessor.get(IEditorService);
    const currentSelections = selectionManagerService.getCurrentSelections();
    if (!currentSelections || !currentSelections.length) {
      return false;
    }
    const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
    if (!target) return false;
    const { worksheet, unitId, subUnitId } = target;
    const cellMatrix = worksheet.getCellMatrix();
    const { value } = params;
    const commandService = accessor.get(ICommandService);
    const editorBridgeService = accessor.get(IEditorBridgeService);
    const list = [];
    const listOfRangeHasNumber = [];
    let editRange = null;
    let editRow = 0;
    let editColumn = 0;
    let editFormulaRangeString = "";
    if (currentSelections.length === 1 && (isSingleCell(currentSelections[0].range) || isMultiRowsColumnsRange(currentSelections[0].range) && rangeHasNoNumber(cellMatrix, currentSelections[0].range))) {
      const { range, primary } = currentSelections[0];
      const row = (_a = primary == null ? void 0 : primary.actualRow) != null ? _a : range.startRow;
      const column = (_b = primary == null ? void 0 : primary.actualColumn) != null ? _b : range.startColumn;
      editRange = range;
      editRow = row;
      editColumn = column;
      const refRange = findRefRange(cellMatrix, row, column);
      if (refRange) {
        editFormulaRangeString = serializeRange(refRange);
      }
    } else {
      currentSelections.some((selection) => {
        var _a2, _b2;
        const { range, primary } = selection;
        if (rangeHasNoNumber(cellMatrix, range)) {
          const row = (_a2 = primary == null ? void 0 : primary.actualRow) != null ? _a2 : range.startRow;
          const column = (_b2 = primary == null ? void 0 : primary.actualColumn) != null ? _b2 : range.startColumn;
          const refRange = findRefRange(cellMatrix, row, column);
          if (!refRange) {
            editRange = range;
            editRow = row;
            editColumn = column;
            return true;
          }
          const rangeString = serializeRange(refRange);
          const formulaString = `=${value}(${rangeString})`;
          list.push({
            range,
            primary: {
              row,
              column
            },
            formula: formulaString
          });
        } else {
          const { startRow, startColumn, endRow, endColumn } = range;
          if (startRow === endRow) {
            const blankCellColumn = findBlankCellOfRow(cellMatrix, startRow, endColumn, worksheet.getColumnCount() - 1);
            const newEndColumn = blankCellColumn === endColumn ? endColumn - 1 : endColumn;
            const rangeString = serializeRange({
              startRow,
              endRow,
              startColumn,
              endColumn: newEndColumn
            });
            const formulaString = `=${value}(${rangeString})`;
            listOfRangeHasNumber.push({
              range,
              primary: {
                row: startRow,
                column: blankCellColumn
              },
              formula: formulaString
            });
          } else {
            let maxBlankCellRow = -1;
            for (let c = startColumn; c <= endColumn; c++) {
              const blankCellRow = findBlankCellOfColumn(cellMatrix, c, endRow, worksheet.getRowCount() - 1);
              maxBlankCellRow = Math.max(maxBlankCellRow, blankCellRow);
            }
            const newEndRow = maxBlankCellRow === endRow ? endRow - 1 : endRow;
            for (let c = startColumn; c <= endColumn; c++) {
              const rangeString = serializeRange({
                startRow,
                endRow: newEndRow,
                startColumn: c,
                endColumn: c
              });
              const formulaString = `=${value}(${rangeString})`;
              listOfRangeHasNumber.push({
                range,
                primary: {
                  row: maxBlankCellRow,
                  column: c
                },
                formula: formulaString
              });
            }
          }
        }
        return false;
      });
    }
    if (editRange) {
      const destRange = getCellAtRowCol(editRow, editColumn, worksheet);
      const resultRange = {
        range: Rectangle.clone(editRange),
        primary: {
          startRow: destRange.startRow,
          startColumn: destRange.startColumn,
          endRow: destRange.endRow,
          endColumn: destRange.endColumn,
          actualRow: editRow,
          actualColumn: editColumn,
          isMerged: destRange.isMerged,
          isMergedMainCell: destRange.startRow === editRow && destRange.startColumn === editColumn
        }
      };
      const setSelectionParams = {
        unitId,
        subUnitId,
        selections: [resultRange]
      };
      await commandService.executeCommand(SetSelectionsOperation.id, setSelectionParams);
      const editor = editorService.getEditor(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
      const formulaEditor = editorService.getEditor(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
      commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, {
        visible: true,
        unitId,
        eventType: 3 /* Dblclick */
      });
      const formulaText = `=${value}(${editFormulaRangeString}`;
      editor == null ? void 0 : editor.replaceText(formulaText);
      formulaEditor == null ? void 0 : formulaEditor.replaceText(formulaText, false);
    }
    if (list.length === 0 && listOfRangeHasNumber.length === 0) return false;
    return commandService.executeCommand(InsertFunctionCommand.id, {
      list,
      listOfRangeHasNumber
    });
  }
};
function findRefRange(cellMatrix, row, column) {
  const startRow = findStartRow(cellMatrix, row, column);
  if (startRow !== row) {
    return {
      startRow,
      endRow: row - 1,
      startColumn: column,
      endColumn: column
    };
  }
  const startColumn = findStartColumn(cellMatrix, row, column);
  if (startColumn !== column) {
    return {
      startRow: row,
      endRow: row,
      startColumn,
      endColumn: column - 1
    };
  }
  return null;
}
function findStartRow(cellMatrix, row, column) {
  let isFirstNumber = false;
  if (row === 0) return row;
  for (let r = row - 1; r >= 0; r--) {
    const cell = cellMatrix.getValue(r, column);
    if (isNumberCell(cell) && !isFirstNumber) {
      if (r === 0) return 0;
      isFirstNumber = true;
    } else if (isFirstNumber && !isNumberCell(cell)) {
      return r + 1;
    } else if (isFirstNumber && r === 0) {
      return 0;
    }
  }
  return row;
}
function findStartColumn(cellMatrix, row, column) {
  let isFirstNumber = false;
  if (column === 0) return column;
  for (let c = column - 1; c >= 0; c--) {
    const cell = cellMatrix.getValue(row, c);
    if (isNumberCell(cell) && !isFirstNumber) {
      if (c === 0) return 0;
      isFirstNumber = true;
    } else if (isFirstNumber && !isNumberCell(cell)) {
      return c + 1;
    } else if (isFirstNumber && c === 0) {
      return 0;
    }
  }
  return column;
}
function isNumberCell(cell) {
  if (cell == null ? void 0 : cell.p) {
    const body = cell == null ? void 0 : cell.p.body;
    if (body == null) {
      return false;
    }
    const data = body.dataStream;
    const lastString = data.substring(data.length - 2, data.length);
    const newDataStream = lastString === DEFAULT_EMPTY_DOCUMENT_VALUE ? data.substring(0, data.length - 2) : data;
    return isRealNum(newDataStream);
  }
  return cell && (cell.t === 2 /* NUMBER */ || getCellValueType(cell) === 2 /* NUMBER */);
}
function isSingleCell(range) {
  return range.startRow === range.endRow && range.startColumn === range.endColumn;
}
function isMultiRowsColumnsRange(range) {
  return range.startRow !== range.endRow && range.startColumn !== range.endColumn;
}
function rangeHasNoNumber(cellMatrix, range) {
  for (let i = range.startRow; i <= range.endRow; i++) {
    for (let j = range.startColumn; j <= range.endColumn; j++) {
      if (isNumberCell(cellMatrix.getValue(i, j))) {
        return false;
      }
    }
  }
  return true;
}
function findBlankCellOfRow(cellMatrix, row, startColumn, endColumn) {
  for (let c = startColumn; c <= endColumn; c++) {
    if (!cellMatrix.getValue(row, c)) {
      return c;
    }
  }
  return endColumn;
}
function findBlankCellOfColumn(cellMatrix, column, startRow, endRow) {
  for (let r = startRow; r <= endRow; r++) {
    if (!cellMatrix.getValue(r, column)) {
      return r;
    }
  }
  return endRow;
}

// ../packages/sheets-formula-ui/src/views/more-functions/interface.ts
var MORE_FUNCTIONS_COMPONENT = `${FORMULA_UI_PLUGIN_NAME}_MORE_FUNCTIONS_COMPONENT`;

// ../packages/sheets-formula-ui/src/commands/operations/more-functions.operation.ts
var MoreFunctionsOperation = {
  id: "formula-ui.operation.more-functions",
  type: 1 /* OPERATION */,
  handler: async (accessor) => {
    const sidebarService = accessor.get(ISidebarService);
    sidebarService.open({
      header: { title: "sheets-formula-ui.insert.tooltip" },
      children: { label: MORE_FUNCTIONS_COMPONENT }
    });
    return true;
  }
};

// ../packages/sheets-formula-ui/src/commands/utils/reference-absolute.ts
var CELL_REFERENCE_REGEX = /^\$?[A-Za-z]+\$?\d+$/;
function toggleReferenceAbsoluteAtCursor(lexerTreeBuilder, formulaText, cursorOffset) {
  if (!formulaText.startsWith("=") || formulaText.length <= 1) {
    return null;
  }
  const sequenceNodes = lexerTreeBuilder.sequenceNodesBuilder(formulaText);
  if (!(sequenceNodes == null ? void 0 : sequenceNodes.length)) {
    return null;
  }
  const normalizedCursorOffset = Math.min(Math.max(cursorOffset, 0), formulaText.length);
  const relativeCursorOffset = normalizedCursorOffset - 1;
  if (relativeCursorOffset < 0) {
    return null;
  }
  const matchedReference = sequenceNodes.find((node) => {
    if (typeof node === "string" || node.nodeType !== 4 /* REFERENCE */) {
      return false;
    }
    return relativeCursorOffset >= node.startIndex && relativeCursorOffset <= node.endIndex + 1;
  });
  if (!matchedReference || typeof matchedReference === "string") {
    return null;
  }
  const nextReferenceState = _toggleReferenceToken(matchedReference, relativeCursorOffset - matchedReference.startIndex);
  if (nextReferenceState == null || nextReferenceState.token === matchedReference.token) {
    return null;
  }
  const nextSequenceNodes = sequenceNodes.map((node) => {
    if (node !== matchedReference) {
      return node;
    }
    return {
      ...node,
      token: nextReferenceState.token,
      endIndex: node.startIndex + nextReferenceState.token.length - 1
    };
  });
  const nextFormulaText = `=${generateStringWithSequence(nextSequenceNodes)}`;
  const nextCursorOffset = _translateCursorOffset(
    normalizedCursorOffset,
    matchedReference.startIndex + 1,
    matchedReference.endIndex + 2,
    nextReferenceState.token.length,
    nextReferenceState
  );
  return {
    formulaText: nextFormulaText,
    cursorOffset: nextCursorOffset
  };
}
function _toggleReferenceToken(referenceNode, offsetInToken) {
  const sequenceGrid = deserializeRangeWithSheetWithCache(referenceNode.token);
  if (sequenceGrid == null) {
    return null;
  }
  const { range } = sequenceGrid;
  if (range.rangeType === 1 /* ROW */ || range.rangeType === 2 /* COLUMN */) {
    const newToken = serializeRangeToRefString({
      ...sequenceGrid,
      range: {
        ...range,
        startAbsoluteRefType: range.startAbsoluteRefType === 0 /* NONE */ ? 3 /* ALL */ : 0 /* NONE */,
        endAbsoluteRefType: range.endAbsoluteRefType === 0 /* NONE */ ? 3 /* ALL */ : 0 /* NONE */
      }
    });
    return {
      token: newToken,
      referenceTarget: "both",
      previousSeparatorOffset: null,
      nextSeparatorOffset: null
    };
  }
  const { refBody } = handleRefStringInfo(referenceNode.token);
  const referenceParts = refBody.split(":");
  const previousSeparatorOffset = referenceParts.length === 2 ? referenceNode.token.indexOf(":") : null;
  if (referenceParts.some((part) => !CELL_REFERENCE_REGEX.test(part))) {
    return null;
  }
  const isRangeReference = referenceParts.length === 2;
  const referenceTarget = !isRangeReference ? "start" : _getRangeReferenceTarget(referenceNode.token, refBody, offsetInToken);
  const nextRange = {
    ...range
  };
  if (referenceTarget === "start" || referenceTarget === "both") {
    const nextAbsoluteRefType = _getNextAbsoluteRefType(getAbsoluteRefTypeWithSingleString(referenceParts[0]));
    nextRange.startAbsoluteRefType = nextAbsoluteRefType;
    if (!isRangeReference) {
      nextRange.endAbsoluteRefType = nextAbsoluteRefType;
    }
  }
  if (referenceTarget === "end" || referenceTarget === "both") {
    nextRange.endAbsoluteRefType = _getNextAbsoluteRefType(getAbsoluteRefTypeWithSingleString(referenceParts[1]));
  }
  const token = serializeRangeToRefString({
    ...sequenceGrid,
    range: nextRange
  });
  return {
    token,
    referenceTarget,
    previousSeparatorOffset,
    nextSeparatorOffset: referenceParts.length === 2 ? token.indexOf(":") : null
  };
}
function _getRangeReferenceTarget(token, refBody, offsetInToken) {
  const prefixLength = token.length - refBody.length;
  const separatorOffset = prefixLength + refBody.indexOf(":");
  if (offsetInToken === separatorOffset || offsetInToken === separatorOffset + 1) {
    return "both";
  }
  return offsetInToken < separatorOffset ? "start" : "end";
}
function _getNextAbsoluteRefType(absoluteRefType) {
  switch (absoluteRefType) {
    case 0 /* NONE */:
      return 3 /* ALL */;
    case 3 /* ALL */:
      return 1 /* ROW */;
    case 1 /* ROW */:
      return 2 /* COLUMN */;
    case 2 /* COLUMN */:
    default:
      return 0 /* NONE */;
  }
}
function _translateCursorOffset(cursorOffset, replaceStartOffset, replaceEndOffsetExclusive, nextLength, toggleResult) {
  if (toggleResult.referenceTarget === "both" && toggleResult.previousSeparatorOffset != null && toggleResult.nextSeparatorOffset != null) {
    const previousColonOffset = replaceStartOffset + toggleResult.previousSeparatorOffset;
    const nextColonOffset = replaceStartOffset + toggleResult.nextSeparatorOffset;
    if (cursorOffset === previousColonOffset) {
      return nextColonOffset;
    }
    if (cursorOffset === previousColonOffset + 1) {
      return nextColonOffset + 1;
    }
  }
  if (cursorOffset <= replaceStartOffset) {
    return cursorOffset;
  }
  const previousLength = replaceEndOffsetExclusive - replaceStartOffset;
  const lengthDiff = nextLength - previousLength;
  if (cursorOffset >= replaceEndOffsetExclusive) {
    return cursorOffset + lengthDiff;
  }
  const offsetInsideReference = cursorOffset - replaceStartOffset;
  return replaceStartOffset + Math.min(offsetInsideReference, nextLength);
}

// ../packages/sheets-formula-ui/src/commands/operations/reference-absolute.operation.ts
var ReferenceAbsoluteOperation = {
  id: "formula-ui.operation.change-ref-to-absolute",
  type: 1 /* OPERATION */,
  handler: async (accessor) => {
    var _a, _b;
    const editorService = accessor.get(IEditorService);
    const docSelectionManagerService = accessor.get(DocSelectionManagerService);
    const lexerTreeBuilder = accessor.get(LexerTreeBuilder);
    const focusEditor = editorService.getFocusEditor();
    if (!focusEditor) {
      return false;
    }
    const editorId = focusEditor.getEditorId();
    if (editorId !== DOCS_NORMAL_EDITOR_UNIT_ID_KEY && editorId !== DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) {
      return false;
    }
    const activeTextRange = docSelectionManagerService.getActiveTextRange();
    if (!activeTextRange) {
      return false;
    }
    const formulaText = BuildTextUtils.transform.getPlainText((_b = (_a = focusEditor.getDocumentData().body) == null ? void 0 : _a.dataStream) != null ? _b : "");
    const nextReferenceState = toggleReferenceAbsoluteAtCursor(lexerTreeBuilder, formulaText, activeTextRange.endOffset);
    if (!nextReferenceState) {
      return false;
    }
    focusEditor.replaceText(nextReferenceState.formulaText, [{
      startOffset: nextReferenceState.cursorOffset,
      endOffset: nextReferenceState.cursorOffset,
      collapsed: true
    }]);
    return true;
  }
};

// ../packages/sheets-formula-ui/src/commands/operations/search-function.operation.ts
var SearchFunctionOperation = {
  id: "formula-ui.operation.search-function",
  type: 1 /* OPERATION */,
  handler: async (accessor, params) => {
    const promptService = accessor.get(IFormulaPromptService);
    promptService.search(params);
    return true;
  }
};

// ../packages/sheets-formula-ui/src/menu/menu.ts
function InsertCommonFunctionMenuItemFactory(accessor) {
  const commonFunctions = ["SUMIF", "SUM", "AVERAGE", "IF", "COUNT", "SIN", "MAX"];
  let selections = commonFunctions.map((name) => ({
    label: {
      name,
      selectable: false
    },
    value: name
  }));
  try {
    const descriptionService = accessor.get(IDescriptionService);
    const filtered = commonFunctions.filter((name) => Boolean(descriptionService.getFunctionInfo(name)));
    if (filtered.length > 0) {
      selections = filtered.map((name) => ({
        label: {
          name,
          selectable: false
        },
        value: name
      }));
    }
  } catch {
  }
  return {
    id: `${InsertFunctionOperation.id}.common`,
    commandId: InsertFunctionOperation.id,
    title: "sheets-formula-ui.insert.common",
    tooltip: "sheets-formula-ui.insert.tooltip",
    icon: "FunctionIcon",
    type: 1 /* SELECTOR */,
    selections,
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */)
  };
}
function createInsertFunctionCategoryMenuItemFactory(functionType, categoryKey, icon) {
  return function insertFunctionCategoryMenuItemFactory(accessor) {
    let selections = [];
    try {
      const descriptionService = accessor.get(IDescriptionService);
      selections = descriptionService.getSearchListByType(functionType).map(({ name }) => ({
        label: {
          name,
          selectable: false
        },
        value: name
      }));
    } catch {
      selections = [];
    }
    return {
      id: `${InsertFunctionOperation.id}.${categoryKey}`,
      commandId: InsertFunctionOperation.id,
      title: `sheets-formula-ui.functionType.${categoryKey}`,
      tooltip: "sheets-formula-ui.insert.tooltip",
      icon,
      type: 1 /* SELECTOR */,
      selections,
      hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */)
    };
  };
}
var InsertFinancialFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(0 /* Financial */, "financial");
var InsertLogicalFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(7 /* Logical */, "logical");
var InsertTextFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(6 /* Text */, "text");
var InsertDateFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(1 /* Date */, "date");
var InsertLookupFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(4 /* Lookup */, "lookup");
var InsertMathFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(2 /* Math */, "math");
var InsertStatisticalFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(3 /* Statistical */, "statistical");
var InsertEngineeringFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(9 /* Engineering */, "engineering");
var InsertInformationFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(8 /* Information */, "information");
var InsertDatabaseFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(5 /* Database */, "database");
function AllFunctionsMenuItemFactory(accessor) {
  return {
    id: MoreFunctionsOperation.id,
    title: "sheets-formula-ui.moreFunctions.allFunctions",
    tooltip: "sheets-formula-ui.insert.tooltip",
    type: 0 /* BUTTON */,
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */),
    disabled$: getCurrentRangeDisable$(accessor, {
      workbookTypes: [WorkbookEditablePermission],
      worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission],
      rangeTypes: [RangeProtectionPermissionEditPoint]
    })
  };
}
function CopyFormulaOnlyMenuItemFactory(accessor) {
  return {
    id: SheetCopyFormulaOnlyCommand.id,
    type: 0 /* BUTTON */,
    title: "sheets-formula-ui.operation.copyFormulaOnly",
    disabled$: getCurrentRangeDisable$(accessor, {
      workbookTypes: [WorkbookCopyPermission],
      worksheetTypes: [WorksheetCopyPermission],
      rangeTypes: [RangeProtectionPermissionViewPoint]
    }),
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */)
  };
}
function PasteFormulaMenuItemFactory(accessor) {
  return {
    id: SheetOnlyPasteFormulaCommand.id,
    type: 0 /* BUTTON */,
    title: "sheets-formula-ui.operation.pasteFormula",
    disabled$: menuClipboardDisabledObservable(accessor).pipe(
      combineLatestWith(getCurrentRangeDisable$(accessor, {
        workbookTypes: [WorkbookEditablePermission],
        rangeTypes: [RangeProtectionPermissionEditPoint],
        worksheetTypes: [WorksheetSetCellValuePermission, WorksheetEditPermission]
      })),
      map(([d1, d2]) => d1 || d2)
    ),
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */)
  };
}

// ../packages/sheets-formula-ui/src/menu/schema.ts
var menuSchema = {
  ["ribbon.formulas.basic" /* BASIC */]: {
    [`${InsertFunctionOperation.id}.common`]: {
      order: 0,
      menuItemFactory: InsertCommonFunctionMenuItemFactory,
      [MoreFunctionsOperation.id]: {
        order: 0,
        menuItemFactory: AllFunctionsMenuItemFactory
      }
    },
    [`${InsertFunctionOperation.id}.financial`]: {
      order: 1,
      menuItemFactory: InsertFinancialFunctionMenuItemFactory,
      [MoreFunctionsOperation.id]: {
        order: 0,
        menuItemFactory: AllFunctionsMenuItemFactory
      }
    },
    [`${InsertFunctionOperation.id}.logical`]: {
      order: 2,
      menuItemFactory: InsertLogicalFunctionMenuItemFactory,
      [MoreFunctionsOperation.id]: {
        order: 0,
        menuItemFactory: AllFunctionsMenuItemFactory
      }
    },
    [`${InsertFunctionOperation.id}.text`]: {
      order: 3,
      menuItemFactory: InsertTextFunctionMenuItemFactory,
      [MoreFunctionsOperation.id]: {
        order: 0,
        menuItemFactory: AllFunctionsMenuItemFactory
      }
    },
    [`${InsertFunctionOperation.id}.date`]: {
      order: 4,
      menuItemFactory: InsertDateFunctionMenuItemFactory,
      [MoreFunctionsOperation.id]: {
        order: 0,
        menuItemFactory: AllFunctionsMenuItemFactory
      }
    },
    [`${InsertFunctionOperation.id}.lookup`]: {
      order: 5,
      menuItemFactory: InsertLookupFunctionMenuItemFactory,
      [MoreFunctionsOperation.id]: {
        order: 0,
        menuItemFactory: AllFunctionsMenuItemFactory
      }
    },
    [`${InsertFunctionOperation.id}.math`]: {
      order: 6,
      menuItemFactory: InsertMathFunctionMenuItemFactory,
      [MoreFunctionsOperation.id]: {
        order: 0,
        menuItemFactory: AllFunctionsMenuItemFactory
      }
    },
    [`${InsertFunctionOperation.id}.statistical`]: {
      order: 7,
      menuItemFactory: InsertStatisticalFunctionMenuItemFactory,
      [MoreFunctionsOperation.id]: {
        order: 0,
        menuItemFactory: AllFunctionsMenuItemFactory
      }
    },
    [`${InsertFunctionOperation.id}.engineering`]: {
      order: 8,
      menuItemFactory: InsertEngineeringFunctionMenuItemFactory,
      [MoreFunctionsOperation.id]: {
        order: 0,
        menuItemFactory: AllFunctionsMenuItemFactory
      }
    },
    [`${InsertFunctionOperation.id}.information`]: {
      order: 9,
      menuItemFactory: InsertInformationFunctionMenuItemFactory,
      [MoreFunctionsOperation.id]: {
        order: 0,
        menuItemFactory: AllFunctionsMenuItemFactory
      }
    },
    [`${InsertFunctionOperation.id}.database`]: {
      order: 10,
      menuItemFactory: InsertDatabaseFunctionMenuItemFactory,
      [MoreFunctionsOperation.id]: {
        order: 0,
        menuItemFactory: AllFunctionsMenuItemFactory
      }
    }
  },
  [COPY_SPECIAL_MENU_ID]: {
    [SheetCopyFormulaOnlyCommand.id]: {
      order: 0,
      menuItemFactory: CopyFormulaOnlyMenuItemFactory
    }
  },
  [PASTE_SPECIAL_MENU_ID]: {
    [SheetOnlyPasteFormulaCommand.id]: {
      order: 4,
      menuItemFactory: PasteFormulaMenuItemFactory
    }
  }
};

// ../packages/sheets-formula-ui/src/views/formula-progress/FormulaProgress.tsx
var import_react = __toESM(require_react());
var import_jsx_runtime = __toESM(require_jsx_runtime());
function FormulaProgressBar() {
  const triggerCalculationController = useDependency(TriggerCalculationController);
  const commandService = useDependency(ICommandService);
  const progress = useObservable(triggerCalculationController.progress$);
  const terminateCalculation = (0, import_react.useCallback)(() => {
    commandService.executeCommand(SetFormulaCalculationStopMutation.id);
  }, [commandService]);
  const clearProgress = (0, import_react.useCallback)(() => {
    triggerCalculationController.clearProgress();
  }, [triggerCalculationController]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBar, { progress, onTerminate: terminateCalculation, onClearProgress: clearProgress });
}

// ../packages/sheets-formula-ui/src/views/more-functions/MoreFunctions.tsx
var import_react4 = __toESM(require_react());

// ../packages/sheets-formula-ui/src/views/more-functions/input-params/InputParams.tsx
var import_react2 = __toESM(require_react());

// ../packages/sheets-formula-ui/src/services/utils.ts
function getFunctionTypeValues(localeService, customFormula) {
  return Object.keys(FunctionType).filter((key) => isNaN(Number(key)) && key !== "DefinedName" && key !== "Table" && (customFormula || key !== "User")).map((key) => ({
    label: localeService.t(`sheets-formula-ui.functionType.${key.toLocaleLowerCase()}`),
    value: `${FunctionType[key]}`
  }));
}
function generateParam(param) {
  if (!param.require && !param.repeat) {
    return `[${param.name}]`;
  } else if (param.require && !param.repeat) {
    return param.name;
  } else if (!param.require && param.repeat) {
    return `[${param.name},...]`;
  } else if (param.require && param.repeat) {
    return `${param.name},...`;
  }
}

// ../packages/sheets-formula-ui/src/views/more-functions/function-help/FunctionHelp.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
function FunctionHelp(props) {
  const { prefix, value } = props;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
      prefix,
      "("
    ] }),
    value && value.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: generateParam(item) }),
      i === value.length - 1 ? "" : ","
    ] }, i)),
    ")"
  ] });
}

// ../packages/sheets-formula-ui/src/views/more-functions/function-params/FunctionParams.tsx
var import_jsx_runtime3 = __toESM(require_jsx_runtime());
function FunctionParams(props) {
  const { className, value, title } = props;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "univer-mb-2 univer-text-xs", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "div",
      {
        className: clsx(`univer-mb-2 univer-font-medium univer-text-gray-500 dark:!univer-text-gray-300`, className),
        children: title
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "div",
      {
        className: `univer-break-all univer-text-gray-900 dark:!univer-text-white`,
        children: value
      }
    )
  ] });
}

// ../packages/sheets-formula-ui/src/views/more-functions/input-params/InputParams.tsx
var import_jsx_runtime4 = __toESM(require_jsx_runtime());
function InputParams(props) {
  const { functionInfo, onChange } = props;
  if (!functionInfo) return null;
  const [params, setParams] = (0, import_react2.useState)([]);
  const [functionParameter, setFunctionParameter] = (0, import_react2.useState)(functionInfo.functionParameter);
  const [activeIndex, setActiveIndex] = (0, import_react2.useState)(-1);
  function handleChange(range, paramIndex) {
    const newParams = [...params];
    newParams[paramIndex] = range;
    setParams(newParams);
    onChange(newParams);
  }
  function handleActive(i) {
    if (i === functionParameter.length - 1 && functionParameter[i].repeat) {
      const newFunctionParameter = [...functionParameter];
      newFunctionParameter.push(functionParameter[i]);
      setFunctionParameter(newFunctionParameter);
    }
    setActiveIndex(i);
  }
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: clsx("univer-h-[364px] univer-overflow-y-auto", scrollbarClassName), children: functionParameter.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "univer-text-sm", children: item.name }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "univer-mb-2 univer-mt-1" })
    ] }, i)) }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: clsx("univer-flex-1 univer-p-3", borderLeftClassName), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      FunctionParams,
      {
        title: activeIndex === -1 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(FunctionHelp, { prefix: functionInfo.functionName, value: functionParameter }) : functionParameter[activeIndex].name,
        value: activeIndex === -1 ? functionInfo.description : functionParameter[activeIndex].detail
      }
    ) })
  ] });
}

// ../packages/sheets-formula-ui/src/views/more-functions/select-function/SelectFunction.tsx
var import_react3 = __toESM(require_react());
var import_jsx_runtime5 = __toESM(require_jsx_runtime());
function SelectFunction(props) {
  var _a;
  const configService = useDependency(IConfigService);
  const customFunction = (_a = configService.getConfig(PLUGIN_CONFIG_KEY_BASE)) == null ? void 0 : _a.function;
  const { onChange } = props;
  const allTypeValue = "-1";
  const [searchText, setSearchText] = (0, import_react3.useState)("");
  const [selectList, setSelectList] = (0, import_react3.useState)([]);
  const [active, setActive] = (0, import_react3.useState)(0);
  const [typeSelected, setTypeSelected] = (0, import_react3.useState)(allTypeValue);
  const [nameSelected, setNameSelected] = (0, import_react3.useState)(0);
  const [functionInfo, setFunctionInfo] = (0, import_react3.useState)(null);
  const descriptionService = useDependency(IDescriptionService);
  const localeService = useDependency(LocaleService);
  const sidebarService = useDependency(ISidebarService);
  const sidebarOptions = useObservable(sidebarService.sidebarOptions$);
  const options = getFunctionTypeValues(localeService, Boolean(customFunction)).filter(
    (option) => descriptionService.getSearchListByType(Number(option.value)).length > 0
  );
  options.unshift({
    label: localeService.t("sheets-formula-ui.moreFunctions.allFunctions"),
    value: allTypeValue
  });
  const required = localeService.t("sheets-formula-ui.prompt.required");
  const optional = localeService.t("sheets-formula-ui.prompt.optional");
  (0, import_react3.useEffect)(() => {
    handleSelectChange(allTypeValue);
  }, []);
  (0, import_react3.useEffect)(() => {
    setCurrentFunctionInfo(0);
  }, [selectList]);
  (0, import_react3.useEffect)(() => {
    if (sidebarOptions == null ? void 0 : sidebarOptions.visible) {
      setSearchText("");
      setSelectList([]);
      setActive(0);
      setTypeSelected(allTypeValue);
      setNameSelected(0);
      setFunctionInfo(null);
      handleSelectChange(allTypeValue);
    }
  }, [sidebarOptions]);
  const highlightSearchText = (text) => {
    if (searchText.trim() === "") return text;
    const regex = new RegExp(`(${searchText.toLocaleUpperCase()})`);
    const parts = text.split(regex).filter(Boolean);
    return parts.map((part, index) => {
      if (part.match(regex)) {
        return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "univer-text-red-500", children: part }, index);
      }
      return part;
    });
  };
  const setCurrentFunctionInfo = (selectedIndex) => {
    if (selectList.length === 0) {
      setFunctionInfo(null);
      onChange(null);
      return;
    }
    setNameSelected(selectedIndex);
    const functionInfo2 = descriptionService.getFunctionInfo(selectList[selectedIndex].name);
    if (!functionInfo2) {
      setFunctionInfo(null);
      onChange(null);
      return;
    }
    setFunctionInfo(functionInfo2);
    onChange(functionInfo2);
  };
  function handleSelectChange(value) {
    setTypeSelected(value);
    const selectList2 = descriptionService.getSearchListByType(+value);
    setSelectList(selectList2);
  }
  function handleSearchInputChange(value) {
    setSearchText(value);
    const selectList2 = descriptionService.getSearchListByName(value);
    setSelectList(selectList2);
  }
  function handleSelectListKeyDown(e) {
    e.stopPropagation();
    if (e.key === "ArrowDown") {
      const nextActive = active + 1;
      setActive(nextActive === selectList.length ? 0 : nextActive);
    } else if (e.key === "ArrowUp") {
      const nextActive = active - 1;
      setActive(nextActive === -1 ? selectList.length - 1 : nextActive);
    } else if (e.key === "Enter") {
      setCurrentFunctionInfo(active);
    }
  }
  const handleLiMouseEnter = (index) => {
    setActive(index);
  };
  const handleLiMouseLeave = () => {
    setActive(-1);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "univer-flex univer-items-center univer-justify-between univer-gap-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Select, { value: typeSelected, options, onChange: handleSelectChange }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        Input,
        {
          placeholder: localeService.t("sheets-formula-ui.moreFunctions.searchFunctionPlaceholder"),
          onKeyDown: handleSelectListKeyDown,
          value: searchText,
          onChange: handleSearchInputChange,
          size: "small",
          allowClear: true
        }
      )
    ] }),
    selectList.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      "ul",
      {
        className: clsx(`univer-mb-0 univer-mt-2 univer-box-border univer-max-h-72 univer-w-full univer-select-none univer-list-none univer-overflow-y-auto univer-rounded univer-p-3 univer-outline-none`, borderClassName, scrollbarClassName),
        onKeyDown: handleSelectListKeyDown,
        tabIndex: -1,
        children: selectList.map(({ name }, index) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
          "li",
          {
            className: clsx(`univer-relative univer-box-border univer-cursor-pointer univer-rounded univer-px-7 univer-py-1 univer-text-sm univer-text-gray-900 univer-transition-colors dark:!univer-text-white`, {
              "univer-bg-gray-200 dark:!univer-bg-gray-600": active === index
            }),
            onMouseEnter: () => handleLiMouseEnter(index),
            onMouseLeave: handleLiMouseLeave,
            onClick: () => setCurrentFunctionInfo(index),
            children: [
              nameSelected === index && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                CheckMarkIcon,
                {
                  className: `univer-absolute univer-left-1.5 univer-top-1/2 univer-inline-flex -univer-translate-y-1/2 univer-text-base univer-text-primary-600`
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "univer-block", children: highlightSearchText(name) })
            ]
          },
          index
        ))
      }
    ),
    functionInfo && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: clsx("univer-mx-0 univer-my-2 univer-overflow-y-auto", scrollbarClassName), children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FunctionParams, { title: functionInfo.functionName, value: functionInfo.description }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        FunctionParams,
        {
          title: localeService.t("sheets-formula-ui.moreFunctions.syntax"),
          value: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FunctionHelp, { prefix: functionInfo.functionName, value: functionInfo.functionParameter })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        FunctionParams,
        {
          title: localeService.t("sheets-formula-ui.prompt.helpExample"),
          value: `${functionInfo.functionName}(${functionInfo.functionParameter.map((item) => item.example).join(",")})`
        }
      ),
      functionInfo.functionParameter && functionInfo.functionParameter.map((item) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        FunctionParams,
        {
          title: item.name,
          value: `${item.require ? required : optional} ${item.detail}`
        },
        item.name
      ))
    ] })
  ] });
}

// ../packages/sheets-formula-ui/src/views/more-functions/MoreFunctions.tsx
var import_jsx_runtime6 = __toESM(require_jsx_runtime());
function MoreFunctions() {
  const workbook = useActiveWorkbook();
  const [selectFunction, setSelectFunction] = (0, import_react4.useState)(true);
  const [inputParams, setInputParams] = (0, import_react4.useState)(false);
  const [functionInfo, setFunctionInfo] = (0, import_react4.useState)(null);
  const editorBridgeService = useDependency(IEditorBridgeService);
  const localeService = useDependency(LocaleService);
  const editorService = useDependency(IEditorService);
  const univerInstanceService = useDependency(IUniverInstanceService);
  const commandService = useDependency(ICommandService);
  function handleClickNextPrev() {
    if (selectFunction) {
    }
    setSelectFunction(!selectFunction);
    setInputParams(!inputParams);
  }
  function handleConfirm() {
    const sheetTarget = getSheetCommandTarget(univerInstanceService);
    if (!sheetTarget) return;
    commandService.executeCommand(SetCellEditVisibleOperation.id, {
      visible: true,
      unitId: sheetTarget.unitId,
      eventType: 3 /* Dblclick */
    });
    const editor = editorService.getEditor(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
    const formulaEditor = editorService.getEditor(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
    const formulaText = `=${functionInfo == null ? void 0 : functionInfo.functionName}(`;
    editor == null ? void 0 : editor.replaceText(formulaText);
    formulaEditor == null ? void 0 : formulaEditor.replaceText(formulaText, false);
  }
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
    "div",
    {
      "data-u-comp": "sheets-formula-functions-panel",
      className: "univer-box-border univer-flex univer-h-full univer-flex-col univer-justify-between univer-py-2",
      children: [
        selectFunction && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(SelectFunction, { onChange: setFunctionInfo }),
        inputParams && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(InputParams, { functionInfo, onChange: () => {
        } }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "univer-flex univer-justify-end", children: [
          inputParams && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            Button,
            {
              variant: "primary",
              onClick: handleClickNextPrev,
              className: "univer-mb-5 univer-ml-4 univer-mr-0 univer-mt-0",
              children: localeService.t("sheets-formula-ui.moreFunctions.next")
            }
          ),
          inputParams && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Button, { onClick: handleClickNextPrev, className: "univer-mb-5 univer-ml-4 univer-mr-0 univer-mt-0", children: localeService.t("sheets-formula-ui.moreFunctions.prev") }),
          selectFunction && !!workbook && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            Button,
            {
              disabled: !functionInfo,
              variant: "primary",
              onClick: handleConfirm,
              className: "univer-mb-5 univer-ml-4 univer-mr-0 univer-mt-0",
              children: localeService.t("sheets-formula-ui.moreFunctions.confirm")
            }
          )
        ] })
      ]
    }
  );
}

// ../packages/sheets-formula-ui/src/controllers/shortcuts/prompt.shortcut.ts
var ChangeRefToAbsoluteShortcut = {
  id: ReferenceAbsoluteOperation.id,
  binding: 115 /* F4 */,
  preconditions: (contextService) => whenSheetEditorActivated(contextService)
};

// ../packages/sheets-formula-ui/src/controllers/shortcuts/quick-sum.shortcut.ts
var QuickSumShortcut = {
  id: QuickSumCommand.id,
  binding: 2048 /* ALT */ | 187 /* EQUAL */,
  preconditions: whenSheetEditorFocused,
  mac: 4096 /* CTRL_COMMAND */ | 2048 /* ALT */ | 187 /* EQUAL */,
  description: "sheets-formula-ui.shortcut.quick-sum",
  group: "4_sheet-edit",
  groupTitle: "sheets-ui.shortcut.sheet-edit"
};

// ../packages/sheets-formula-ui/src/controllers/formula-ui.controller.ts
var FormulaUIController = class extends Disposable {
  constructor(_injector, _menuManagerService, _commandService, _shortcutService, _uiPartsService, _renderManagerService, _componentManager) {
    super();
    __publicField(this, "_injector", _injector);
    __publicField(this, "_menuManagerService", _menuManagerService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_shortcutService", _shortcutService);
    __publicField(this, "_uiPartsService", _uiPartsService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_componentManager", _componentManager);
    this._initialize();
  }
  _initialize() {
    this._registerCommands();
    this._registerMenus();
    this._registerShortcuts();
    this._registerComponents();
    this._registerRenderModules();
  }
  _registerMenus() {
    this._menuManagerService.mergeMenu(menuSchema);
  }
  _registerCommands() {
    [
      SheetCopyFormulaOnlyCommand,
      SheetOnlyPasteFormulaCommand,
      InsertFunctionOperation,
      MoreFunctionsOperation,
      SearchFunctionOperation,
      HelpFunctionOperation,
      ReferenceAbsoluteOperation
    ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
  }
  _registerShortcuts() {
    [
      QuickSumShortcut,
      ChangeRefToAbsoluteShortcut
    ].forEach((item) => {
      this.disposeWithMe(this._shortcutService.registerShortcut(item));
    });
  }
  _registerComponents() {
    this.disposeWithMe(this._uiPartsService.registerComponent("formula-aux" /* FORMULA_AUX */, () => connectInjector(FormulaProgressBar, this._injector)));
    this._componentManager.register(MORE_FUNCTIONS_COMPONENT, MoreFunctions);
  }
  _registerRenderModules() {
    this.disposeWithMe(this._renderManagerService.registerRenderModule(2 /* UNIVER_SHEET */, [FormulaEditorShowController]));
  }
};
FormulaUIController = __decorateClass([
  __decorateParam(0, Inject(Injector)),
  __decorateParam(1, IMenuManagerService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IShortcutService),
  __decorateParam(4, IUIPartsService),
  __decorateParam(5, IRenderManagerService),
  __decorateParam(6, Inject(ComponentManager))
], FormulaUIController);

// ../packages/sheets-formula-ui/src/controllers/image-formula-render.controller.ts
var ImageFormulaRenderController = class extends Disposable {
  constructor(_imageFormulaCellInterceptorController, _renderManagerService, _univerInstanceService) {
    super();
    __publicField(this, "_imageFormulaCellInterceptorController", _imageFormulaCellInterceptorController);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    this._imageFormulaCellInterceptorController.registerRefreshRenderFunction(() => {
      const workbook = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
      if (!workbook) return;
      const render = this._renderManagerService.getRenderById(workbook.getUnitId());
      if (!render) return;
      render.with(SheetSkeletonManagerService).reCalculate();
      const mainComponent = render.mainComponent;
      if (!mainComponent) return;
      mainComponent.makeDirty();
    });
  }
};
ImageFormulaRenderController = __decorateClass([
  __decorateParam(0, Inject(ImageFormulaCellInterceptorController)),
  __decorateParam(1, IRenderManagerService),
  __decorateParam(2, IUniverInstanceService)
], ImageFormulaRenderController);

// ../packages/sheets-formula-ui/src/services/range-selector.service.ts
var GlobalRangeSelectorService = class {
  constructor() {
    __publicField(this, "_currentSelector$", new BehaviorSubject(null));
    __publicField(this, "currentSelector$", this._currentSelector$.asObservable());
  }
  showRangeSelectorDialog(opts) {
    const callback = opts.callback;
    const promise = new Promise((resolve) => {
      opts.callback = (ranges) => {
        resolve(ranges);
        callback(ranges);
      };
    });
    this._currentSelector$.next(opts);
    return promise;
  }
};

// ../packages/sheets-formula-ui/src/services/render-services/ref-selections.render.service.ts
var RefSelectionsRenderService = class extends BaseSelectionRenderService {
  constructor(_context, injector, themeService, shortcutService, sheetSkeletonManagerService, _contextService, _refSelectionsService) {
    super(
      injector,
      themeService,
      shortcutService,
      sheetSkeletonManagerService,
      _contextService
    );
    __publicField(this, "_context", _context);
    __publicField(this, "_contextService", _contextService);
    __publicField(this, "_refSelectionsService", _refSelectionsService);
    __publicField(this, "_workbookSelections");
    __publicField(this, "_eventDisposables");
    this._workbookSelections = this._refSelectionsService.getWorkbookSelections(this._context.unitId);
    this._initSelectionChangeListener();
    this._initSkeletonChangeListener();
    this._initUserActionSyncListener();
    this._setSelectionStyle(getDefaultRefSelectionStyle(this._themeService));
    this._remainLastEnabled = true;
    this._highlightHeader = false;
  }
  getLocation() {
    return this._skeleton.getLocation();
  }
  setRemainLastEnabled(enabled) {
    this._remainLastEnabled = enabled;
  }
  /**
   * This is set to true when you need to add a new selection.
   * @param {boolean} enabled
   * @memberof RefSelectionsRenderService
   */
  setSkipLastEnabled(enabled) {
    this._skipLastEnabled = enabled;
  }
  clearLastSelection() {
    const last = this._selectionControls[this._selectionControls.length - 1];
    if (last) {
      last.dispose();
      this._selectionControls.pop();
    }
  }
  /**
   * Call this method and user will be able to select on the canvas to update selections.
   */
  enableSelectionChanging() {
    this._disableSelectionChanging();
    this._eventDisposables = this._initCanvasEventListeners();
    return toDisposable(() => this._disableSelectionChanging());
  }
  _disableSelectionChanging() {
    var _a;
    (_a = this._eventDisposables) == null ? void 0 : _a.dispose();
    this._eventDisposables = null;
  }
  disableSelectionChanging() {
    this._disableSelectionChanging();
  }
  _initCanvasEventListeners() {
    const sheetObject = this._getSheetObject();
    const { spreadsheetRowHeader, spreadsheetColumnHeader, spreadsheet, spreadsheetLeftTopPlaceholder } = sheetObject;
    const { scene } = this._context;
    const listenerDisposables = new DisposableCollection();
    listenerDisposables.add(spreadsheet == null ? void 0 : spreadsheet.onPointerDown$.subscribeEvent((evt, state) => {
      if (!this.inRefSelectionMode()) return;
      this._onPointerDown(evt, spreadsheet.zIndex + 1, 0 /* NORMAL */, this._getActiveViewport(evt));
      if (evt.button !== 2) {
        state.stopPropagation();
      }
    }));
    listenerDisposables.add(
      spreadsheetRowHeader == null ? void 0 : spreadsheetRowHeader.onPointerDown$.subscribeEvent((evt, state) => {
        if (!this.inRefSelectionMode()) return;
        const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
        if (!skeleton) return;
        const { row } = getCoordByOffset(evt.offsetX, evt.offsetY, scene, skeleton);
        const matchSelectionData = matchedSelectionByRowColIndex(this._workbookSelections.getCurrentSelections(), row, 1 /* ROW */);
        if (matchSelectionData) return;
        this._onPointerDown(evt, (spreadsheet.zIndex || 1) + 1, 1 /* ROW */, this._getActiveViewport(evt), 2 /* Y */);
        if (evt.button !== 2) {
          state.stopPropagation();
        }
      })
    );
    listenerDisposables.add(spreadsheetColumnHeader == null ? void 0 : spreadsheetColumnHeader.onPointerDown$.subscribeEvent((evt, state) => {
      if (!this.inRefSelectionMode()) return;
      const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
      if (!skeleton) return;
      const { column } = getCoordByOffset(evt.offsetX, evt.offsetY, scene, skeleton);
      const matchSelectionData = matchedSelectionByRowColIndex(this._workbookSelections.getCurrentSelections(), column, 2 /* COLUMN */);
      if (matchSelectionData) return;
      this._onPointerDown(evt, (spreadsheet.zIndex || 1) + 1, 2 /* COLUMN */, this._getActiveViewport(evt), 1 /* X */);
      if (evt.button !== 2) {
        state.stopPropagation();
      }
    }));
    listenerDisposables.add(spreadsheetLeftTopPlaceholder == null ? void 0 : spreadsheetLeftTopPlaceholder.onPointerDown$.subscribeEvent((evt, state) => {
      this._reset();
      if (!this.inRefSelectionMode()) return;
      const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
      if (!skeleton) return;
      const selectionWithStyle = selectionDataForSelectAll(skeleton);
      this._addSelectionControlByModelData(selectionWithStyle);
      this._selectionMoveStart$.next(this.getSelectionDataWithStyle());
      const dispose = scene.onPointerUp$.subscribeEvent(() => {
        dispose.unsubscribe();
        this._selectionMoveEnd$.next(this.getSelectionDataWithStyle());
      });
      if (evt.button !== 2) {
        state.stopPropagation();
      }
    }));
    return listenerDisposables;
  }
  /**
   * Add a selection in spreadsheet, create a new SelectionControl and then update this control by range derives from selection.
   * For ref selection, create selectionShapeExtension to handle user action.
   * @param {ISelectionWithCoord} selectionWithStyle
   */
  _addSelectionControlByModelData(selectionWithStyle) {
    var _a;
    const skeleton = this._skeleton;
    const style = (_a = selectionWithStyle.style) != null ? _a : genNormalSelectionStyle(this._themeService);
    const scene = this._scene;
    selectionWithStyle.style = style;
    const control = this.newSelectionControl(scene, skeleton, selectionWithStyle);
    return control;
  }
  _initSelectionChangeListener() {
    this.disposeWithMe(this._refSelectionsService.selectionSet$.subscribe((selectionsWithStyles) => {
      this._reset();
      const skeleton = this._skeleton;
      if (!skeleton) return;
      this.resetSelectionsByModelData(selectionsWithStyles || []);
    }));
  }
  /**
   * Update selectionModel in this._workbookSelections by user action in spreadsheet area.
   */
  _initUserActionSyncListener() {
    this.disposeWithMe(this.selectionMoveStart$.subscribe((selectionDataWithStyle) => {
      this._updateSelections(selectionDataWithStyle, 0 /* MOVE_START */);
    }));
    this.disposeWithMe(this.selectionMoving$.subscribe((selectionDataWithStyle) => {
      this._updateSelections(selectionDataWithStyle, 1 /* MOVING */);
    }));
    this.disposeWithMe(this.selectionMoveEnd$.subscribe((selectionDataWithStyle) => {
      this._updateSelections(selectionDataWithStyle, 2 /* MOVE_END */);
    }));
  }
  _updateSelections(selectionDataWithStyleList, type) {
    const workbook = this._context.unit;
    const sheetId = workbook.getActiveSheet().getSheetId();
    if (selectionDataWithStyleList.length === 0) return;
    this._workbookSelections.setSelections(
      sheetId,
      selectionDataWithStyleList.map((selectionDataWithStyle) => convertSelectionDataToRange(selectionDataWithStyle)),
      type
    );
  }
  _initSkeletonChangeListener() {
    this.disposeWithMe(this._sheetSkeletonManagerService.currentSkeleton$.subscribe((param) => {
      var _a;
      if (!param) {
        return;
      }
      const { skeleton } = param;
      const { scene } = this._context;
      const viewportMain = scene.getViewport("viewMain" /* VIEW_MAIN */);
      if (this._skeleton && ((_a = this._skeleton.worksheet) == null ? void 0 : _a.getSheetId()) !== skeleton.worksheet.getSheetId()) {
        this._reset();
      }
      this._changeRuntime(skeleton, scene, viewportMain);
      const currentSelections = this._workbookSelections.getCurrentSelections();
      this.resetSelectionsByModelData(currentSelections);
    }));
  }
  _getActiveViewport(evt) {
    const sheetObject = this._getSheetObject();
    return sheetObject == null ? void 0 : sheetObject.scene.getActiveViewportByCoord(Vector2.FromArray([evt.offsetX, evt.offsetY]));
  }
  _getSheetObject() {
    return getSheetObject(this._context.unit, this._context);
  }
  /**
   * Handle pointer down event, bind pointermove & pointerup handler.
   * then trigger selectionMoveStart$.
   *
   * @param evt
   * @param _zIndex
   * @param rangeType
   * @param viewport
   * @param scrollTimerType
   */
  // eslint-disable-next-line complexity, max-lines-per-function
  _onPointerDown(evt, _zIndex = 0, rangeType = 0 /* NORMAL */, viewport, scrollTimerType = 3 /* ALL */) {
    var _a;
    this._rangeType = rangeType;
    const skeleton = this._skeleton;
    const scene = this._scene;
    if (!scene || !skeleton) {
      return;
    }
    if (viewport) {
      this._activeViewport = viewport;
    }
    const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
    const viewportMain = scene.getViewport("viewMain" /* VIEW_MAIN */);
    if (!viewportMain) return;
    const relativeCoords = scene.getCoordRelativeToViewport(Vector2.FromArray([evtOffsetX, evtOffsetY]));
    const { x: offsetX, y: offsetY } = relativeCoords;
    this._startViewportPosX = offsetX;
    this._startViewportPosY = offsetY;
    const scrollXY = scene.getScrollXYInfoByViewport(relativeCoords);
    const { scaleX, scaleY } = scene.getAncestorScale();
    const selectCell = this._skeleton.getCellByOffset(offsetX, offsetY, scaleX, scaleY, scrollXY);
    if (!selectCell) return;
    switch (rangeType) {
      case 0 /* NORMAL */:
        break;
      case 1 /* ROW */:
        selectCell.startColumn = 0;
        selectCell.endColumn = this._skeleton.getColumnCount() - 1;
        break;
      case 2 /* COLUMN */:
        selectCell.startRow = 0;
        selectCell.endRow = this._skeleton.getRowCount() - 1;
        break;
      case 3 /* ALL */:
        selectCell.startRow = 0;
        selectCell.startColumn = 0;
        selectCell.endRow = this._skeleton.getRowCount() - 1;
        selectCell.endColumn = this._skeleton.getColumnCount() - 1;
    }
    let selectionWithStyle = { range: selectCell, primary: selectCell, style: null };
    if (selectCell.isMerged || selectCell.isMergedMainCell) {
      selectionWithStyle = {
        range: {
          ...selectCell,
          startRow: selectCell.startRow,
          endRow: selectCell.startRow,
          startColumn: selectCell.startColumn,
          endColumn: selectCell.startColumn
        },
        primary: {
          ...selectCell,
          actualRow: selectCell.startRow,
          actualColumn: selectCell.startColumn,
          startRow: selectCell.startRow,
          endRow: selectCell.startRow,
          startColumn: selectCell.startColumn,
          endColumn: selectCell.startColumn
        },
        style: null
      };
    }
    selectionWithStyle.range.rangeType = rangeType;
    const selectionCellWithCoord = attachSelectionWithCoord(selectionWithStyle, this._skeleton);
    this._startRangeWhenPointerDown = { ...selectionCellWithCoord.rangeWithCoord };
    const cursorCellRangeWithRangeType = { ...selectionCellWithCoord.rangeWithCoord, rangeType };
    let activeSelectionControl = this.getActiveSelectionControl();
    const curControls = this.getSelectionControls();
    for (const control of curControls) {
      if (evt.button === 2 && Rectangle.contains(control.model, cursorCellRangeWithRangeType)) {
        activeSelectionControl = control;
        return;
      }
      if (control.model.isEqual(cursorCellRangeWithRangeType)) {
        activeSelectionControl = control;
        break;
      }
    }
    this._checkClearPreviousControls(evt);
    const currentCell = activeSelectionControl == null ? void 0 : activeSelectionControl.model.currentCell;
    const expandByShiftKey = evt.shiftKey && currentCell;
    const remainLastEnable = this._remainLastEnabled && !evt.ctrlKey && !evt.shiftKey && !this._skipLastEnabled && !this._singleSelectionEnabled;
    if (expandByShiftKey && currentCell) {
      this._makeSelectionByTwoCells(
        currentCell,
        cursorCellRangeWithRangeType,
        skeleton,
        rangeType,
        activeSelectionControl
        // Get updated in this method
      );
    } else if (remainLastEnable && activeSelectionControl) {
      activeSelectionControl.updateRangeBySelectionWithCoord(selectionCellWithCoord);
    } else {
      activeSelectionControl = this.newSelectionControl(scene, skeleton, selectionWithStyle);
    }
    for (let i = 0; i < this.getSelectionControls().length - 1; i++) {
      this.getSelectionControls()[i].clearHighlight();
    }
    this._selectionMoveStart$.next(this.getSelectionDataWithStyle());
    scene.disableObjectsEvent();
    this._clearUpdatingListeners();
    this._addEndingListeners();
    (_a = scene.getTransformer()) == null ? void 0 : _a.clearSelectedObjects();
    this._setupPointerMoveListener(viewportMain, activeSelectionControl, rangeType, scrollTimerType, offsetX, offsetY);
    this._escapeShortcutDisposable = this._shortcutService.forceEscape();
    this._scenePointerUpSub = scene.onPointerUp$.subscribeEvent(() => {
      var _a2;
      this._clearUpdatingListeners();
      this._selectionMoveEnd$.next(this.getSelectionDataWithStyle());
      (_a2 = this._escapeShortcutDisposable) == null ? void 0 : _a2.dispose();
      this._escapeShortcutDisposable = null;
    });
  }
  /**
   * Diff between normal selection, no highlightHeader for ref selections.
   * @param scene
   * @param skeleton
   * @param selectionWithCoord
   * @returns {SelectionControl} selectionControl just created
   */
  newSelectionControl(scene, skeleton, selection) {
    const zIndex = this.getSelectionControls().length;
    const { rowHeaderWidth, columnHeaderHeight } = skeleton;
    const control = new SelectionControl(scene, zIndex, this._themeService, {
      highlightHeader: this._highlightHeader,
      enableAutoFill: false,
      rowHeaderWidth,
      columnHeaderHeight
    });
    const selectionWithCoord = attachSelectionWithCoord(selection, skeleton);
    control.updateRangeBySelectionWithCoord(selectionWithCoord);
    this._selectionControls.push(control);
    control.setControlExtension({
      skeleton,
      scene,
      themeService: this._themeService,
      injector: this._injector,
      selectionHooks: {
        selectionMoveEnd: () => {
          this._selectionMoveEnd$.next(this.getSelectionDataWithStyle());
        }
      }
    });
    return control;
  }
};
RefSelectionsRenderService = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, Inject(ThemeService)),
  __decorateParam(3, IShortcutService),
  __decorateParam(4, Inject(SheetSkeletonManagerService)),
  __decorateParam(5, IContextService),
  __decorateParam(6, IRefSelectionsService)
], RefSelectionsRenderService);
function getDefaultRefSelectionStyle(themeService) {
  const style = genNormalSelectionStyle(themeService);
  style.widgets = { tl: true, tc: true, tr: true, ml: true, mr: true, bl: true, bc: true, br: true };
  return style;
}

// ../packages/sheets-formula-ui/src/views/formula-editor/index.tsx
var import_react21 = __toESM(require_react());

// ../packages/sheets-formula-ui/src/views/range-selector/utils/find-index-from-sequence-nodes.ts
var findIndexFromSequenceNodes = (sequenceNode, targetIndex, isEqual = true) => {
  let result = -1;
  sequenceNode.reduce((pre, cur, index) => {
    if (pre.isFinish) {
      return pre;
    }
    const oldIndex = pre.currentIndex;
    if (typeof cur !== "string") {
      pre.currentIndex += cur.token.length;
    } else {
      const length = cur.length;
      pre.currentIndex += length;
    }
    if (isEqual ? pre.currentIndex === targetIndex : targetIndex > oldIndex && targetIndex <= pre.currentIndex) {
      result = index;
      pre.isFinish = true;
    }
    return pre;
  }, { currentIndex: 0, isFinish: false });
  return result;
};
var findRefSequenceIndex = (sequenceNode, targetIndex) => {
  const last = sequenceNode[targetIndex];
  let result = -1;
  if (!last || typeof last === "string" || last.nodeType !== 4 /* REFERENCE */) return -1;
  for (let i = 0; i <= targetIndex; i++) {
    const currentNode = sequenceNode[i];
    if (typeof currentNode !== "string" && currentNode.nodeType === 4 /* REFERENCE */) {
      result++;
    }
  }
  return result;
};

// ../packages/sheets-formula-ui/src/views/formula-editor/help-function/HelpFunction.tsx
var import_react9 = __toESM(require_react());

// ../packages/sheets-formula-ui/src/views/formula-editor/hooks/use-editor-position.ts
var import_react6 = __toESM(require_react());

// ../packages/sheets-formula-ui/src/views/formula-editor/hooks/use-resize-scroll-observer.ts
var import_react5 = __toESM(require_react());
var useResizeScrollObserver = (callback, delay = 100) => {
  (0, import_react5.useEffect)(() => {
    let throttleTimeout = null;
    const throttledCallback = () => {
      if (throttleTimeout === null) {
        throttleTimeout = window.setTimeout(() => {
          callback();
          throttleTimeout = null;
        }, delay);
      }
    };
    window.addEventListener("scroll", throttledCallback);
    window.addEventListener("resize", throttledCallback);
    return () => {
      if (throttleTimeout !== null) {
        clearTimeout(throttleTimeout);
      }
      window.removeEventListener("scroll", throttledCallback);
      window.removeEventListener("resize", throttledCallback);
    };
  }, [callback, delay]);
};
var use_resize_scroll_observer_default = useResizeScrollObserver;

// ../packages/sheets-formula-ui/src/views/formula-editor/hooks/use-editor-position.ts
function useEditorPosition(editorId, ready, deps) {
  const editorService = useDependency(IEditorService);
  const position$ = (0, import_react6.useMemo)(() => new BehaviorSubject({ left: -999, top: -999, right: -999, bottom: -999 }), []);
  const sidebarService = useDependency(ISidebarService);
  const univerInstanceService = useDependency(IUniverInstanceService);
  const updatePosition = useEvent(() => {
    var _a;
    const doc = editorService.getEditor(editorId);
    if (!doc) {
      return;
    }
    const position = doc.getBoundingClientRect();
    const { marginTop = 0, marginBottom = 0 } = doc.getDocumentData().documentStyle;
    const skeleton = doc.getSkeleton();
    if (!skeleton) return;
    const height = (_a = skeleton.getSkeletonData()) == null ? void 0 : _a.pages[0].height;
    let { left, top, right, bottom } = position;
    top = top + marginTop;
    bottom = height ? top + height : bottom - marginBottom;
    const current = position$.getValue();
    if (current.left === left && current.top === top && current.right === right && current.bottom === bottom) {
      return;
    }
    position$.next({ left: left - 1, right: right + 1, top: top - 1, bottom: bottom + 1 });
    return position;
  });
  (0, import_react6.useEffect)(() => {
    if (!ready) {
      return;
    }
    updatePosition();
  }, [editorId, editorService, univerInstanceService.unitAdded$, updatePosition, ready, ...deps != null ? deps : []]);
  use_resize_scroll_observer_default(updatePosition);
  (0, import_react6.useEffect)(() => {
    const sidebarSubscription = sidebarService.scrollEvent$.pipe(throttleTime(100)).subscribe(updatePosition);
    return () => {
      sidebarSubscription.unsubscribe();
    };
  }, []);
  return [position$, updatePosition];
}

// ../packages/sheets-formula-ui/src/views/formula-editor/hooks/use-formula-describe.ts
var import_react8 = __toESM(require_react());

// ../packages/sheets-formula-ui/src/views/formula-editor/hooks/use-state-ref.ts
var import_react7 = __toESM(require_react());
var useStateRef = (value) => {
  const cache = (0, import_react7.useRef)(value);
  cache.current = value;
  return cache;
};

// ../packages/sheets-formula-ui/src/views/formula-editor/hooks/use-formula-describe.ts
var useFormulaDescribe = (isNeed, formulaText, editor) => {
  const formulaPromptService = useDependency(IFormulaPromptService);
  const descriptionService = useDependency(IDescriptionService);
  const lexerTreeBuilder = useDependency(LexerTreeBuilder);
  const [functionInfo, setFunctionInfo] = (0, import_react8.useState)();
  const [paramIndex, setParamIndex] = (0, import_react8.useState)(-1);
  const [isShow, setIsShow] = (0, import_react8.useState)(true);
  const isShowRef = useStateRef(isShow);
  const formulaTextRef = (0, import_react8.useRef)(formulaText);
  formulaTextRef.current = formulaText;
  const reset = () => {
    setFunctionInfo(void 0);
    setParamIndex(-1);
    setIsShow(false);
  };
  (0, import_react8.useEffect)(() => {
    const nodes = lexerTreeBuilder.sequenceNodesBuilder(formulaText.slice(1));
    formulaPromptService.setSequenceNodes(nodes != null ? nodes : []);
  }, [formulaText]);
  (0, import_react8.useEffect)(() => {
    if (editor && isNeed) {
      const d = editor.selectionChange$.pipe(debounceTime(50)).subscribe((e) => {
        if (e.textRanges.length === 1) {
          const [range] = e.textRanges;
          if (range.collapsed && isShowRef.current) {
            const { startOffset } = range;
            const nodeIndex = formulaPromptService.getCurrentSequenceNodeIndex(startOffset - 2);
            const currentSequenceNode = formulaPromptService.getCurrentSequenceNodeByIndex(nodeIndex);
            const nextSequenceNode = formulaPromptService.getCurrentSequenceNodeByIndex(nodeIndex + 1);
            if (currentSequenceNode) {
              if (typeof currentSequenceNode !== "string" && currentSequenceNode.nodeType === 3 && !descriptionService.hasDefinedNameDescription(currentSequenceNode.token.trim()) && nextSequenceNode === "(" /* OPEN_BRACKET */) {
                const info = descriptionService.getFunctionInfo(currentSequenceNode.token);
                setFunctionInfo(info);
                setParamIndex(-1);
                return;
              } else {
                const res = lexerTreeBuilder.getFunctionAndParameter(`${formulaTextRef.current}A`, startOffset - 1);
                if (res) {
                  const { functionName, paramIndex: paramIndex2 } = res;
                  const info = descriptionService.getFunctionInfo(functionName);
                  setFunctionInfo(info);
                  setParamIndex(paramIndex2);
                  return;
                }
              }
            }
          }
        }
        setFunctionInfo(void 0);
        setParamIndex(-1);
      });
      const d2 = editor.selectionChange$.pipe(
        filter((e) => e.textRanges.length === 1),
        map((e) => e.textRanges[0].startOffset),
        distinctUntilChanged()
      ).subscribe(() => {
        setIsShow(true);
      });
      return () => {
        d.unsubscribe();
        d2.unsubscribe();
      };
    }
  }, [editor, isNeed]);
  (0, import_react8.useEffect)(() => {
    if (!isNeed) {
      reset();
    }
  }, [isNeed]);
  return {
    functionInfo,
    paramIndex,
    reset
  };
};

// ../packages/sheets-formula-ui/src/views/formula-editor/help-function/HelpHiddenTip.tsx
var import_jsx_runtime7 = __toESM(require_jsx_runtime());
var HelpHiddenTip = ({ onClick }) => {
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
    "div",
    {
      className: `univer-z-[15] univer-box-border univer-h-[18px] univer-cursor-pointer univer-overflow-visible univer-whitespace-nowrap univer-rounded-l univer-border univer-border-r-0 univer-border-gray-600 univer-bg-primary-600 univer-p-0.5 univer-text-xs univer-font-bold univer-leading-[13px] univer-text-white`,
      onClick,
      children: "?"
    }
  );
};

// ../packages/sheets-formula-ui/src/views/formula-editor/help-function/HelpFunction.tsx
var import_jsx_runtime8 = __toESM(require_jsx_runtime());
var Params = ({ className, title, value }) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "univer-my-2", children: [
  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
    "div",
    {
      className: clsx(`univer-mb-2 univer-text-sm univer-font-medium univer-text-gray-900 dark:!univer-text-white`, className),
      children: title
    }
  ),
  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
    "div",
    {
      className: "univer-whitespace-pre-wrap univer-break-words univer-text-xs univer-text-gray-500",
      children: value
    }
  )
] });
var Help = (props) => {
  const { prefix, value, active, onClick } = props;
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { children: [
      prefix,
      "("
    ] }),
    value && value.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "span",
        {
          className: active === i ? "univer-text-primary-500" : "",
          onClick: () => onClick(i),
          children: generateParam(item)
        }
      ),
      i === value.length - 1 ? "" : ","
    ] }, item.name)),
    ")"
  ] });
};
function HelpFunction(props) {
  const { onParamsSwitch = noop, onClose: propColose = noop, isFocus, editor, formulaText } = props;
  const { functionInfo, paramIndex, reset } = useFormulaDescribe(isFocus, formulaText, editor);
  const editorBridgeService = useDependency(IEditorBridgeService);
  const hidden = !useObservable(editorBridgeService.helpFunctionVisible$);
  const [contentVisible, setContentVisible] = (0, import_react9.useState)(false);
  const localeService = useDependency(LocaleService);
  const required = localeService.t("sheets-formula-ui.prompt.required");
  const optional = localeService.t("sheets-formula-ui.prompt.optional");
  const editorId = editor.getEditorId();
  const [position$] = useEditorPosition(editorId, !!functionInfo, [functionInfo, paramIndex]);
  function handleSwitchActive(paramIndex2) {
    onParamsSwitch && onParamsSwitch(paramIndex2);
  }
  const setHidden = useEvent((v) => {
    editorBridgeService.helpFunctionVisible$.next(!v);
  });
  const onClose = () => {
    setHidden(true);
    propColose();
  };
  return functionInfo ? hidden ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(RectPopup, { portal: true, anchorRect$: position$, direction: "left-center", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(HelpHiddenTip, { onClick: () => setHidden(false) }) }, "hidden") : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(RectPopup, { portal: true, onClickOutside: () => reset(), anchorRect$: position$, direction: "vertical", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
    "div",
    {
      className: clsx(`univer-m-0 univer-box-border univer-w-[250px] univer-select-none univer-list-none univer-rounded-lg univer-bg-white univer-leading-5 univer-shadow-md univer-outline-none dark:!univer-bg-gray-900`, borderClassName),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
          "div",
          {
            className: clsx(`univer-box-border univer-flex univer-items-center univer-justify-between univer-px-4 univer-py-3 univer-text-xs univer-font-medium univer-text-gray-900 dark:!univer-text-white`, borderTopClassName),
            style: {
              overflowWrap: "anywhere"
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                Help,
                {
                  prefix: functionInfo.functionName,
                  value: functionInfo.functionParameter,
                  active: paramIndex,
                  onClick: handleSwitchActive
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "univer-flex", children: [
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                  "div",
                  {
                    className: `univer-ml-2 univer-flex univer-size-6 univer-cursor-pointer univer-items-center univer-justify-center univer-rounded univer-bg-transparent univer-p-0 univer-text-xs univer-text-gray-500 univer-outline-none univer-transition-colors hover:univer-bg-gray-200 dark:hover:!univer-bg-gray-600`,
                    style: { transform: contentVisible ? "rotateZ(-90deg)" : "rotateZ(90deg)" },
                    onClick: () => setContentVisible(!contentVisible),
                    children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(MoreIcon, {})
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                  "div",
                  {
                    className: `univer-ml-2 univer-flex univer-size-6 univer-cursor-pointer univer-items-center univer-justify-center univer-rounded univer-bg-transparent univer-p-0 univer-text-xs univer-text-gray-600 univer-outline-none univer-transition-colors hover:univer-bg-gray-300 dark:!univer-text-gray-200 dark:hover:!univer-bg-gray-600`,
                    onClick: onClose,
                    children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(CloseIcon, {})
                  }
                )
              ] })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "div",
          {
            className: clsx(`univer-box-border univer-max-h-[350px] univer-overflow-y-auto univer-px-4 univer-pb-3 univer-pt-0`, scrollbarClassName),
            style: {
              height: contentVisible ? "unset" : 0,
              padding: contentVisible ? "revert-layer" : 0
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "univer-mt-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                Params,
                {
                  title: localeService.t("sheets-formula-ui.prompt.helpExample"),
                  value: `${functionInfo.functionName}(${functionInfo.functionParameter.map((item) => item.example).join(",")})`
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                Params,
                {
                  title: localeService.t("sheets-formula-ui.prompt.helpAbstract"),
                  value: functionInfo.description
                }
              ),
              functionInfo && functionInfo.functionParameter && functionInfo.functionParameter.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                Params,
                {
                  className: paramIndex === i ? "univer-text-primary-500" : "",
                  title: item.name,
                  value: `${item.require ? required : optional} ${item.detail}`
                },
                i
              ))
            ] })
          }
        )
      ]
    }
  ) }, "show") : null;
}

// ../packages/sheets-formula-ui/src/views/formula-editor/hooks/use-focus.ts
var useFocus = (editor) => {
  const editorService = useDependency(IEditorService);
  const focus = useEvent((offset) => {
    var _a, _b;
    if (editor) {
      editorService.focus(editor.getEditorId());
      const selections = [...editor.getSelectionRanges()];
      if (Tools.isDefine(offset)) {
        editor.setSelectionRanges([{ startOffset: offset, endOffset: offset }]);
      } else if (!selections.length && !editor.docSelectionRenderService.isOnPointerEvent) {
        const body = (_b = (_a = editor.getDocumentData().body) == null ? void 0 : _a.dataStream) != null ? _b : "\r\n";
        const offset2 = Math.max(body.length - 2, 0);
        editor.setSelectionRanges([{ startOffset: offset2, endOffset: offset2 }]);
      } else {
        editor.setSelectionRanges(selections);
      }
    }
    ;
  });
  return focus;
};

// ../packages/sheets-formula-ui/src/views/formula-editor/hooks/use-formula-selection.ts
var import_react10 = __toESM(require_react());
function getCurrentBodyDataStreamAndOffset(accssor) {
  var _a, _b;
  const univerInstanceService = accssor.get(IUniverInstanceService);
  const documentModel = univerInstanceService.getCurrentUniverDocInstance();
  if (!(documentModel == null ? void 0 : documentModel.getBody())) {
    return;
  }
  const dataStream = (_b = (_a = documentModel.getBody()) == null ? void 0 : _a.dataStream) != null ? _b : "";
  return { dataStream, offset: 0 };
}
function useFormulaSelecting(opts) {
  var _a;
  const { editorId, isFocus, disableOnClick, unitId, subUnitId } = opts;
  const renderManagerService = useDependency(IRenderManagerService);
  const univerInstanceService = useDependency(IUniverInstanceService);
  const sheetRenderer = renderManagerService.getRenderById(unitId);
  const renderer = renderManagerService.getRenderById(editorId);
  const docSelectionRenderService = renderer == null ? void 0 : renderer.with(DocSelectionRenderService);
  const docSelectionManagerService = useDependency(DocSelectionManagerService);
  const injector = useDependency(Injector);
  const [isSelecting, innerSetIsSelecting] = (0, import_react10.useState)(0 /* NOT_SELECT */);
  const lexerTreeBuilder = useDependency(LexerTreeBuilder);
  const isDisabledByPointer = (0, import_react10.useRef)(true);
  const refSelectionsRenderService = sheetRenderer == null ? void 0 : sheetRenderer.with(RefSelectionsRenderService);
  const isSelectingRef = useStateRef(isSelecting);
  const workbook = univerInstanceService.getUnit(unitId, 2 /* UNIVER_SHEET */);
  const sourceSheet = workbook == null ? void 0 : workbook.getSheetBySheetId(subUnitId);
  const setIsSelecting = useEvent((v) => {
    if (refSelectionsRenderService) {
      refSelectionsRenderService.setSkipLastEnabled(v === 1 /* NEED_ADD */ || v === 3 /* EDIT_OTHER_SHEET_REFERENCE */ || v === 4 /* EDIT_OTHER_WORKBOOK_REFERENCE */);
    }
    isSelectingRef.current = v;
    innerSetIsSelecting(v);
  });
  const calculateSelectingType = useEvent(() => {
    var _a2, _b, _c;
    const currentWorkbook = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    if (!currentWorkbook) return;
    const currentSheet = currentWorkbook.getActiveSheet();
    const activeRange = docSelectionRenderService == null ? void 0 : docSelectionRenderService.getActiveTextRange();
    const index = (activeRange == null ? void 0 : activeRange.collapsed) ? activeRange.startOffset : -1;
    const config = getCurrentBodyDataStreamAndOffset(injector);
    if (!config) return;
    const dataStream = (_a2 = config == null ? void 0 : config.dataStream) == null ? void 0 : _a2.slice(0, -2);
    const nodes = ((_b = lexerTreeBuilder.sequenceNodesBuilder(dataStream)) != null ? _b : []).map((node) => {
      if (typeof node === "object") {
        if (node.nodeType === 4 /* REFERENCE */) {
          return {
            ...node,
            range: deserializeRangeWithSheetWithCache(node.token)
          };
        }
        return {
          ...node,
          range: void 0
        };
      }
      return node;
    });
    const char = dataStream[index - 1];
    const nextChar = dataStream[index];
    const focusingNode = nodes.find((node) => typeof node === "object" && node.nodeType === 4 /* REFERENCE */ && index === node.endIndex + 2);
    const adding = char && matchRefDrawToken(char) && (!nextChar || isFormulaLexerToken(nextChar) && nextChar !== "(" /* OPEN_BRACKET */);
    const editing = Boolean(focusingNode);
    if ((dataStream == null ? void 0 : dataStream.substring(0, 1)) === "=" && (adding || editing)) {
      if (editing) {
        if (isDisabledByPointer.current) {
          return;
        }
        const { sheetName, unitId: unitId2 } = focusingNode.range;
        const currentUnitId = (_c = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */)) == null ? void 0 : _c.getUnitId();
        if (unitId2 && unitId2 !== currentUnitId) {
          setIsSelecting(4 /* EDIT_OTHER_WORKBOOK_REFERENCE */);
        } else if (!sheetName && currentSheet.getSheetId() === (sourceSheet == null ? void 0 : sourceSheet.getSheetId()) || sheetName === currentSheet.getName()) {
          setIsSelecting(2 /* CAN_EDIT */);
        } else {
          setIsSelecting(3 /* EDIT_OTHER_SHEET_REFERENCE */);
        }
      } else {
        isDisabledByPointer.current = false;
        setIsSelecting(1 /* NEED_ADD */);
      }
    } else {
      setIsSelecting(0 /* NOT_SELECT */);
    }
  });
  (0, import_react10.useEffect)(() => {
    const sub = docSelectionManagerService.textSelection$.pipe(filter((param) => param.unitId === editorId)).subscribe(() => {
      calculateSelectingType();
    });
    return () => sub.unsubscribe();
  }, [calculateSelectingType, docSelectionManagerService.textSelection$, editorId]);
  (0, import_react10.useEffect)(() => {
    if (!isFocus) {
      setIsSelecting(0 /* NOT_SELECT */);
      isDisabledByPointer.current = true;
    }
  }, [isFocus, setIsSelecting]);
  (0, import_react10.useEffect)(() => {
    var _a2;
    if (!disableOnClick) return;
    const sub = (_a2 = renderer == null ? void 0 : renderer.mainComponent) == null ? void 0 : _a2.onPointerDown$.subscribeEvent(() => {
      setIsSelecting(0 /* NOT_SELECT */);
      isDisabledByPointer.current = true;
    });
    return () => sub == null ? void 0 : sub.unsubscribe();
  }, [disableOnClick, (_a = renderer == null ? void 0 : renderer.mainComponent) == null ? void 0 : _a.onPointerDown$, setIsSelecting]);
  (0, import_react10.useEffect)(() => {
    if (!isFocus) return;
    const sub = workbook == null ? void 0 : workbook.activeSheet$.subscribe(() => {
      calculateSelectingType();
    });
    const sub2 = univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */).subscribe(() => {
      calculateSelectingType();
    });
    return () => {
      sub == null ? void 0 : sub.unsubscribe();
      sub2 == null ? void 0 : sub2.unsubscribe();
    };
  }, [calculateSelectingType, isFocus, workbook == null ? void 0 : workbook.activeSheet$, univerInstanceService.getCurrentTypeOfUnit$]);
  return { isSelecting, isSelectingRef };
}

// ../packages/sheets-formula-ui/src/views/formula-editor/hooks/use-formula-token.ts
var import_react11 = __toESM(require_react());
var useFormulaToken = () => {
  const lexerTreeBuilder = useDependency(LexerTreeBuilder);
  const getFormulaToken = (0, import_react11.useCallback)((text) => lexerTreeBuilder.sequenceNodesBuilder(text) || [], [lexerTreeBuilder]);
  return getFormulaToken;
};

// ../packages/sheets-formula-ui/src/views/formula-editor/hooks/use-highlight.ts
var import_react12 = __toESM(require_react());

// ../packages/sheets-formula-ui/src/common/selection.ts
function genFormulaRefSelectionStyle(themeService, refColor, id) {
  const fill = new ColorKit(refColor).setAlpha(0.05).toRgbString();
  return {
    id,
    strokeWidth: 1,
    stroke: refColor,
    fill,
    widgets: { tl: true, tc: true, tr: true, ml: true, mr: true, bl: true, bc: true, br: true },
    widgetSize: 6,
    widgetStrokeWidth: 1,
    widgetStroke: themeService.getColorFromTheme("white")
  };
}

// ../packages/sheets-formula-ui/src/views/formula-editor/hooks/use-highlight.ts
function calcHighlightRanges(opts) {
  var _a, _b;
  const {
    unitId,
    subUnitId,
    currentWorkbook,
    refSelections,
    editor,
    refSelectionsService,
    refSelectionsRenderService,
    sheetSkeletonManagerService,
    themeService,
    univerInstanceService
  } = opts;
  const currentUnitId = currentWorkbook.getUnitId();
  const workbook = univerInstanceService.getUnit(unitId, 2 /* UNIVER_SHEET */);
  const worksheet = workbook == null ? void 0 : workbook.getActiveSheet();
  const selectionWithStyle = [];
  if (!workbook || !worksheet) {
    refSelectionsService.setSelections(selectionWithStyle);
    return;
  }
  const currentSheetId = worksheet.getSheetId();
  const getSheetIdByName = (name) => {
    var _a2;
    return (_a2 = workbook == null ? void 0 : workbook.getSheetBySheetName(name)) == null ? void 0 : _a2.getSheetId();
  };
  const skeleton = sheetSkeletonManagerService == null ? void 0 : sheetSkeletonManagerService.getSkeleton(currentSheetId);
  if (!skeleton) return;
  const endIndexes = [];
  for (let i = 0, len = refSelections.length; i < len; i++) {
    const refSelection = refSelections[i];
    const { themeColor, token, refIndex, endIndex } = refSelection;
    const unitRangeName = deserializeRangeWithSheet(token);
    const { unitId: refUnitId, sheetName, range: rawRange } = unitRangeName;
    const refSheetId = getSheetIdByName(sheetName);
    if (!refSheetId && sheetName) {
      continue;
    }
    if (currentUnitId !== unitId && refUnitId !== currentUnitId) {
      continue;
    }
    if (refUnitId && refUnitId !== currentUnitId) {
      continue;
    }
    if (refSheetId && refSheetId !== currentSheetId || !refSheetId && currentSheetId !== subUnitId) {
      continue;
    }
    const range = setEndForRange(rawRange, worksheet.getRowCount(), worksheet.getColumnCount());
    range.unitId = unitId;
    range.sheetId = currentSheetId;
    selectionWithStyle.push({
      range,
      primary: null,
      style: genFormulaRefSelectionStyle(themeService, themeColor, refIndex.toString())
    });
    endIndexes.push(endIndex);
  }
  if (editor) {
    const cursor = (_b = (_a = editor.getSelectionRanges()) == null ? void 0 : _a[0]) == null ? void 0 : _b.startOffset;
    const activeIndex = endIndexes.findIndex((end) => end + 2 === cursor);
    if (activeIndex !== -1) {
      refSelectionsRenderService == null ? void 0 : refSelectionsRenderService.setActiveSelectionIndex(activeIndex);
    } else {
      refSelectionsRenderService == null ? void 0 : refSelectionsRenderService.resetActiveSelectionIndex();
    }
  }
  return selectionWithStyle;
}
function useSheetHighlight(unitId, subUnitId) {
  const univerInstanceService = useDependency(IUniverInstanceService);
  const themeService = useDependency(ThemeService);
  const refSelectionsService = useDependency(IRefSelectionsService);
  const renderManagerService = useDependency(IRenderManagerService);
  const currentWorkbook = useObservable((0, import_react12.useMemo)(() => univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */), [univerInstanceService]));
  const currentRender = currentWorkbook ? renderManagerService.getRenderById(currentWorkbook.getUnitId()) : null;
  const refSelectionsRenderService = currentRender == null ? void 0 : currentRender.with(RefSelectionsRenderService);
  const sheetSkeletonManagerService = currentRender == null ? void 0 : currentRender.with(SheetSkeletonManagerService);
  const highlightSheet = useEvent((refSelections, editor) => {
    const currentWorkbook2 = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    if (!currentWorkbook2) return;
    if (refSelectionsRenderService == null ? void 0 : refSelectionsRenderService.selectionMoving) return;
    const selectionWithStyle = calcHighlightRanges({
      unitId,
      subUnitId,
      currentWorkbook: currentWorkbook2,
      refSelections,
      editor,
      refSelectionsService,
      refSelectionsRenderService,
      sheetSkeletonManagerService,
      themeService,
      univerInstanceService
    });
    if (!selectionWithStyle) return;
    const allControls = (refSelectionsRenderService == null ? void 0 : refSelectionsRenderService.getSelectionControls()) || [];
    if (allControls.length === selectionWithStyle.length) {
      refSelectionsRenderService == null ? void 0 : refSelectionsRenderService.resetSelectionsByModelData(selectionWithStyle);
    } else {
      refSelectionsService.setSelections(selectionWithStyle);
    }
  });
  (0, import_react12.useEffect)(() => {
    return () => {
      refSelectionsRenderService == null ? void 0 : refSelectionsRenderService.resetActiveSelectionIndex();
    };
  }, [refSelectionsRenderService]);
  return highlightSheet;
}
function useDocHight(_leadingCharacter = "") {
  const descriptionService = useDependency(IDescriptionService);
  const colorMap = useColor();
  const commandService = useDependency(ICommandService);
  const leadingCharacterLength = (0, import_react12.useMemo)(() => _leadingCharacter.length, [_leadingCharacter]);
  const highlightDoc = useEvent((editor, sequenceNodes, isNeedResetSelection = true, newSelections) => {
    const data = editor.getDocumentData();
    const editorId = editor.getEditorId();
    if (!data) {
      return [];
    }
    const body = data.body;
    if (!body) {
      return [];
    }
    const str = body.dataStream.slice(0, body.dataStream.length - 2);
    const cloneBody = { dataStream: "", ...data.body };
    if (!str.startsWith(_leadingCharacter)) return [];
    if (sequenceNodes == null || sequenceNodes.length === 0) {
      cloneBody.textRuns = [];
      commandService.syncExecuteCommand(ReplaceTextRunsCommand.id, {
        unitId: editorId,
        body: getBodySlice(cloneBody, 0, cloneBody.dataStream.length - 2)
      });
      return [];
    } else {
      const { textRuns, refSelections } = buildTextRuns(descriptionService, colorMap, sequenceNodes);
      if (leadingCharacterLength) {
        textRuns.forEach((e) => {
          e.ed = e.ed + leadingCharacterLength;
          e.st = e.st + leadingCharacterLength;
        });
      }
      cloneBody.textRuns = [{ st: 0, ed: 1, ts: { fs: 11 } }, ...textRuns];
      const text = sequenceNodes.reduce((pre, cur) => {
        if (typeof cur === "string") {
          return `${pre}${cur}`;
        }
        return `${pre}${cur.token}`;
      }, "");
      cloneBody.dataStream = `${_leadingCharacter}${text}\r
`;
      let selections;
      if (isNeedResetSelection) {
        selections = editor.getSelectionRanges();
        const maxOffset = cloneBody.dataStream.length - 2 + leadingCharacterLength;
        selections.forEach((selection) => {
          selection.startOffset = Math.max(0, Math.min(selection.startOffset, maxOffset));
          selection.endOffset = Math.max(0, Math.min(selection.endOffset, maxOffset));
        });
      }
      commandService.syncExecuteCommand(ReplaceTextRunsCommand.id, {
        unitId: editorId,
        body: getBodySlice(cloneBody, 0, cloneBody.dataStream.length - 2),
        textRanges: newSelections != null ? newSelections : selections
      });
      return refSelections;
    }
  });
  return highlightDoc;
}
function useColor() {
  const themeService = useDependency(ThemeService);
  const theme = themeService.getCurrentTheme();
  const result = (0, import_react12.useMemo)(() => {
    const formulaRefColors = [
      themeService.getColorFromTheme("loop-color.1"),
      themeService.getColorFromTheme("loop-color.2"),
      themeService.getColorFromTheme("loop-color.3"),
      themeService.getColorFromTheme("loop-color.4"),
      themeService.getColorFromTheme("loop-color.5"),
      themeService.getColorFromTheme("loop-color.6"),
      themeService.getColorFromTheme("loop-color.7"),
      themeService.getColorFromTheme("loop-color.8"),
      themeService.getColorFromTheme("loop-color.9"),
      themeService.getColorFromTheme("loop-color.10"),
      themeService.getColorFromTheme("loop-color.11"),
      themeService.getColorFromTheme("loop-color.12")
    ].map((color) => themeService.isValidThemeColor(color) ? themeService.getColorFromTheme(color) : color);
    const numberColor = themeService.getColorFromTheme("blue.700");
    const stringColor = themeService.getColorFromTheme("jiqing.800");
    const plainTextColor = themeService.getColorFromTheme("black");
    return { formulaRefColors, numberColor, stringColor, plainTextColor };
  }, [theme]);
  return result;
}
function buildTextRuns(descriptionService, colorMap, sequenceNodes) {
  const { formulaRefColors, numberColor, stringColor, plainTextColor } = colorMap;
  const textRuns = [];
  const refSelections = [];
  const themeColorMap = /* @__PURE__ */ new Map();
  let refColorIndex = 0;
  for (let i = 0, len = sequenceNodes.length; i < len; i++) {
    const node = sequenceNodes[i];
    if (typeof node === "string") {
      const theLastItem = textRuns[textRuns.length - 1];
      const start = theLastItem ? theLastItem.ed : 0;
      const end = start + node.length;
      textRuns.push({
        st: start,
        ed: end,
        ts: {
          cl: {
            rgb: plainTextColor
          },
          fs: 11
        }
      });
      continue;
    }
    if (descriptionService.hasDefinedNameDescription(node.token.trim())) {
      textRuns.push({
        st: node.startIndex,
        ed: node.endIndex + 1,
        ts: {
          cl: {
            rgb: plainTextColor
          },
          fs: 11
        }
      });
      continue;
    }
    const { startIndex, endIndex, nodeType, token } = node;
    let themeColor = "";
    if (nodeType === 4 /* REFERENCE */) {
      if (themeColorMap.has(token)) {
        themeColor = themeColorMap.get(token);
      } else {
        const colorIndex = refColorIndex % formulaRefColors.length;
        themeColor = formulaRefColors[colorIndex];
        themeColorMap.set(token, themeColor);
        refColorIndex++;
      }
      refSelections.push({
        refIndex: i,
        themeColor,
        token,
        startIndex: node.startIndex,
        endIndex: node.endIndex,
        index: refSelections.length
      });
    } else if (nodeType === 1 /* NUMBER */) {
      themeColor = numberColor;
    } else if (nodeType === 2 /* STRING */) {
      themeColor = stringColor;
    } else if (nodeType === 5 /* ARRAY */) {
      themeColor = stringColor;
    }
    if (themeColor && themeColor.length > 0) {
      textRuns.push({
        st: startIndex,
        ed: endIndex + 1,
        ts: {
          cl: {
            rgb: themeColor
          },
          fs: 11
        }
      });
    } else {
      textRuns.push({
        st: startIndex,
        ed: endIndex + 1,
        ts: {
          cl: {
            rgb: plainTextColor
          },
          fs: 11
        }
      });
    }
  }
  return { textRuns, refSelections };
}

// ../packages/sheets-formula-ui/src/views/formula-editor/hooks/use-left-and-right-arrow.ts
var import_react13 = __toESM(require_react());
var useLeftAndRightArrow = (isNeed, shouldMoveSelection, editor, onMoveInEditor) => {
  const commandService = useDependency(ICommandService);
  const shortcutService = useDependency(IShortcutService);
  const shouldMoveSelectionRef = (0, import_react13.useRef)(shouldMoveSelection);
  shouldMoveSelectionRef.current = shouldMoveSelection;
  const onMoveInEditorRef = (0, import_react13.useRef)(onMoveInEditor);
  onMoveInEditorRef.current = onMoveInEditor;
  (0, import_react13.useEffect)(() => {
    if (!editor || !isNeed) {
      return;
    }
    const editorId = editor.getEditorId();
    const operationId = `sheet.formula-embedding-editor.${editorId}`;
    const d = new DisposableCollection();
    const handleMoveInEditor = (keycode, metaKey) => {
      if (onMoveInEditorRef.current) {
        onMoveInEditorRef.current(keycode, metaKey);
        return;
      }
      let direction = 3 /* LEFT */;
      if (keycode === 40 /* ARROW_DOWN */) {
        direction = 2 /* DOWN */;
      } else if (keycode === 38 /* ARROW_UP */) {
        direction = 0 /* UP */;
      } else if (keycode === 39 /* ARROW_RIGHT */) {
        direction = 1 /* RIGHT */;
      }
      if (metaKey === 1024 /* SHIFT */) {
        commandService.executeCommand(MoveSelectionOperation.id, {
          direction
        });
      } else {
        commandService.executeCommand(MoveCursorOperation.id, {
          direction
        });
      }
    };
    const handleKeycode = (keycode, metaKey) => {
      let direction = 2 /* DOWN */;
      if (keycode === 40 /* ARROW_DOWN */) {
        direction = 2 /* DOWN */;
      } else if (keycode === 38 /* ARROW_UP */) {
        direction = 0 /* UP */;
      } else if (keycode === 37 /* ARROW_LEFT */) {
        direction = 3 /* LEFT */;
      } else if (keycode === 39 /* ARROW_RIGHT */) {
        direction = 1 /* RIGHT */;
      }
      if (shouldMoveSelectionRef.current) {
        if (metaKey === 4096 /* CTRL_COMMAND */) {
          commandService.executeCommand(MoveSelectionCommand.id, {
            direction,
            jumpOver: 1 /* moveGap */,
            extra: "formula-editor",
            fromCurrentSelection: shouldMoveSelectionRef.current === 1 /* NEED_ADD */ || shouldMoveSelectionRef.current === 3 /* EDIT_OTHER_SHEET_REFERENCE */
          });
        } else if (metaKey === 1024 /* SHIFT */) {
          commandService.executeCommand(ExpandSelectionCommand.id, {
            direction,
            extra: "formula-editor"
          });
        } else if (metaKey === (4096 /* CTRL_COMMAND */ | 1024 /* SHIFT */)) {
          commandService.executeCommand(ExpandSelectionCommand.id, {
            direction,
            jumpOver: 1 /* moveGap */,
            extra: "formula-editor"
          });
        } else {
          commandService.executeCommand(MoveSelectionCommand.id, {
            direction,
            extra: "formula-editor",
            fromCurrentSelection: shouldMoveSelectionRef.current === 1 /* NEED_ADD */ || shouldMoveSelectionRef.current === 3 /* EDIT_OTHER_SHEET_REFERENCE */
          });
        }
      } else {
        handleMoveInEditor(keycode, metaKey);
      }
    };
    d.add(commandService.registerCommand({
      id: operationId,
      type: 1 /* OPERATION */,
      handler(_event, params) {
        const { keyCode, metaKey } = params;
        handleKeycode(keyCode, metaKey);
      }
    }));
    const keyCodes = [
      { keyCode: 40 /* ARROW_DOWN */ },
      { keyCode: 37 /* ARROW_LEFT */ },
      { keyCode: 39 /* ARROW_RIGHT */ },
      { keyCode: 38 /* ARROW_UP */ },
      { keyCode: 40 /* ARROW_DOWN */, metaKey: 1024 /* SHIFT */ },
      { keyCode: 37 /* ARROW_LEFT */, metaKey: 1024 /* SHIFT */ },
      { keyCode: 39 /* ARROW_RIGHT */, metaKey: 1024 /* SHIFT */ },
      { keyCode: 38 /* ARROW_UP */, metaKey: 1024 /* SHIFT */ },
      { keyCode: 40 /* ARROW_DOWN */, metaKey: 4096 /* CTRL_COMMAND */ },
      { keyCode: 37 /* ARROW_LEFT */, metaKey: 4096 /* CTRL_COMMAND */ },
      { keyCode: 39 /* ARROW_RIGHT */, metaKey: 4096 /* CTRL_COMMAND */ },
      { keyCode: 38 /* ARROW_UP */, metaKey: 4096 /* CTRL_COMMAND */ },
      { keyCode: 40 /* ARROW_DOWN */, metaKey: 4096 /* CTRL_COMMAND */ | 1024 /* SHIFT */ },
      { keyCode: 37 /* ARROW_LEFT */, metaKey: 4096 /* CTRL_COMMAND */ | 1024 /* SHIFT */ },
      { keyCode: 39 /* ARROW_RIGHT */, metaKey: 4096 /* CTRL_COMMAND */ | 1024 /* SHIFT */ },
      { keyCode: 38 /* ARROW_UP */, metaKey: 4096 /* CTRL_COMMAND */ | 1024 /* SHIFT */ }
    ];
    keyCodes.map(({ keyCode, metaKey }) => {
      return {
        id: operationId,
        binding: metaKey ? keyCode | metaKey : keyCode,
        preconditions: () => true,
        priority: 900,
        staticParameters: {
          eventType: 4 /* Keyboard */,
          keyCode,
          metaKey
        }
      };
    }).forEach((item) => {
      d.add(shortcutService.registerShortcut(item));
    });
    return () => {
      d.dispose();
    };
  }, [commandService, editor, isNeed, shortcutService]);
};

// ../packages/sheets-formula-ui/src/views/formula-editor/hooks/use-refactor-effect.ts
var import_react14 = __toESM(require_react());
var useRefactorEffect = (isNeed, selecting, unitId, editorId, disableContextMenu = true) => {
  var _a;
  const renderManagerService = useDependency(IRenderManagerService);
  const contextService = useDependency(IContextService);
  const contextMenuService = useDependency(IContextMenuService);
  const refSelectionsService = useDependency(IRefSelectionsService);
  const univerInstanceService = useDependency(IUniverInstanceService);
  const currentUnit = useObservable((0, import_react14.useMemo)(() => univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */), [univerInstanceService]));
  const render = renderManagerService.getRenderById((_a = currentUnit == null ? void 0 : currentUnit.getUnitId()) != null ? _a : "");
  const refSelectionsRenderService = render == null ? void 0 : render.with(RefSelectionsRenderService);
  (0, import_react14.useLayoutEffect)(() => {
    if (isNeed) {
      contextService.setContextValue(EDITOR_ACTIVATED, true);
      disableContextMenu && contextMenuService.disable();
      return () => {
        const currentDoc = univerInstanceService.getCurrentUnitOfType(1 /* UNIVER_DOC */);
        if ((currentDoc == null ? void 0 : currentDoc.getUnitId()) === editorId) {
          contextService.setContextValue(EDITOR_ACTIVATED, false);
        }
        disableContextMenu && contextMenuService.enable();
        refSelectionsService.clear();
      };
    }
  }, [contextService, isNeed, refSelectionsService, disableContextMenu, editorId]);
  (0, import_react14.useLayoutEffect)(() => {
    if (isNeed && selecting) {
      const d1 = refSelectionsRenderService == null ? void 0 : refSelectionsRenderService.enableSelectionChanging();
      contextService.setContextValue(REF_SELECTIONS_ENABLED, true);
      return () => {
        contextService.setContextValue(REF_SELECTIONS_ENABLED, false);
        d1 == null ? void 0 : d1.dispose();
      };
    }
  }, [contextService, isNeed, refSelectionsRenderService, selecting]);
  (0, import_react14.useEffect)(() => {
    if (isNeed) {
      refSelectionsRenderService == null ? void 0 : refSelectionsRenderService.setSkipLastEnabled(false);
    }
  }, [isNeed, refSelectionsRenderService]);
};

// ../packages/sheets-formula-ui/src/views/formula-editor/hooks/use-reset-selection.ts
var import_react15 = __toESM(require_react());
var useResetSelection = (isNeed, unitId, subUnitId) => {
  const univerInstanceService = useDependency(IUniverInstanceService);
  const sheetsSelectionsService = useDependency(SheetsSelectionsService);
  const resetSelection = (0, import_react15.useCallback)(() => {
    if (isNeed) {
      const selections = [...sheetsSelectionsService.getWorkbookSelections(unitId).getSelectionsOfWorksheet(subUnitId)];
      const workbook = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
      const currentSheet = workbook == null ? void 0 : workbook.getActiveSheet();
      if ((workbook == null ? void 0 : workbook.getUnitId()) !== unitId) {
        univerInstanceService.setCurrentUnitForType(unitId);
      }
      if (currentSheet && currentSheet.getSheetId() === subUnitId) {
        sheetsSelectionsService.setSelections(selections);
      }
    }
    ;
  }, [isNeed, sheetsSelectionsService, subUnitId, unitId, univerInstanceService]);
  return resetSelection;
};

// ../packages/sheets-formula-ui/src/views/formula-editor/hooks/use-sheet-selection-change.ts
var import_react16 = __toESM(require_react());

// ../packages/sheets-formula-ui/src/views/range-selector/utils/get-offset-from-sequence-nodes.ts
var getOffsetFromSequenceNodes = (sequenceNode) => {
  return sequenceNode.reduce((pre, cur) => {
    if (typeof cur === "string") {
      return pre + cur.length;
    }
    return pre + cur.token.length;
  }, 0);
};

// ../packages/sheets-formula-ui/src/views/range-selector/utils/sequence-node-to-text.ts
var sequenceNodeToText = (sequenceNode) => sequenceNode.map((item) => typeof item === "string" ? item : item.token).join("");

// ../packages/sheets-formula-ui/src/views/range-selector/utils/unit-ranges-to-text.ts
var unitRangesToText = (ranges, isNeedSheetName = false, originSheetName = "", isNeedWorkbookName = false) => {
  if (!isNeedSheetName && !isNeedWorkbookName) {
    return ranges.map((item) => serializeRange(item.range));
  } else {
    return ranges.map((item) => {
      if (isNeedWorkbookName) {
        return serializeRangeToRefString(item);
      }
      if (item.sheetName !== "" && item.sheetName !== originSheetName) {
        return serializeRangeWithSheet(item.sheetName, item.range);
      }
      return serializeRange(item.range);
    });
  }
};

// ../packages/sheets-formula-ui/src/views/formula-editor/hooks/use-sheet-selection-change.ts
var prepareSelectionChangeContext = (opts) => {
  var _a, _b, _c;
  const { editor, lexerTreeBuilder } = opts;
  const currentDocSelections = editor == null ? void 0 : editor.getSelectionRanges();
  if ((currentDocSelections == null ? void 0 : currentDocSelections.length) !== 1) {
    return;
  }
  const docRange = currentDocSelections[0];
  const offset = docRange.startOffset - 1;
  const dataStream = ((_b = (_a = editor == null ? void 0 : editor.getDocumentData().body) == null ? void 0 : _a.dataStream) != null ? _b : "\r\n").slice(0, -2);
  const sequenceNodes = (_c = lexerTreeBuilder.sequenceNodesBuilder(dataStream.slice(1))) != null ? _c : [];
  const nodeIndex = findIndexFromSequenceNodes(sequenceNodes, offset, false);
  const updatingRefIndex = findRefSequenceIndex(sequenceNodes, nodeIndex);
  return {
    nodeIndex,
    updatingRefIndex,
    sequenceNodes,
    offset
  };
};
var useSheetSelectionChange = (isNeed, isFocus, isSelectingRef, unitId, subUnitId, refSelectionRef, isSupportAcrossSheet, listenSelectionSet, editor, handleRangeChange = noop) => {
  var _a;
  const renderManagerService = useDependency(IRenderManagerService);
  const univerInstanceService = useDependency(IUniverInstanceService);
  const commandService = useDependency(ICommandService);
  const docSelectionManagerService = useDependency(DocSelectionManagerService);
  const themeService = useDependency(ThemeService);
  const lexerTreeBuilder = useDependency(LexerTreeBuilder);
  const workbook = univerInstanceService.getUnit(unitId);
  const getSheetNameById = useEvent((unitId2, sheetId) => {
    var _a2, _b, _c;
    return (_c = (_b = (_a2 = univerInstanceService.getUnit(unitId2)) == null ? void 0 : _a2.getSheetBySheetId(sheetId)) == null ? void 0 : _b.getName()) != null ? _c : "";
  });
  const sheetName = (0, import_react16.useMemo)(() => getSheetNameById(unitId, subUnitId), [getSheetNameById, subUnitId, unitId]);
  const activeSheet = useObservable(workbook == null ? void 0 : workbook.activeSheet$);
  const contextRef = useStateRef({ activeSheet, sheetName });
  const currentUnit = useObservable((0, import_react16.useMemo)(() => univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */), [univerInstanceService]));
  const render = renderManagerService.getRenderById((_a = currentUnit == null ? void 0 : currentUnit.getUnitId()) != null ? _a : "");
  const refSelectionsRenderService = render == null ? void 0 : render.with(RefSelectionsRenderService);
  const sheetSkeletonManagerService = render == null ? void 0 : render.with(SheetSkeletonManagerService);
  const refSelectionsService = useDependency(IRefSelectionsService);
  const onSelectionsChange = useEvent((selections, isEnd, isCtrlAddMode) => {
    var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    const ctx = prepareSelectionChangeContext({ editor, lexerTreeBuilder });
    if (!ctx) return;
    const { nodeIndex, updatingRefIndex, sequenceNodes, offset } = ctx;
    if (isSelectingRef.current === 1 /* NEED_ADD */) {
      if (offset !== 0) {
        if (nodeIndex === -1 && sequenceNodes.length) {
          return;
        }
        const range = selections[selections.length - 1];
        const lastNodes = sequenceNodes.splice(nodeIndex + 1);
        const rangeSheetId = (_a2 = range.sheetId) != null ? _a2 : subUnitId;
        const unitRangeName = {
          range,
          unitId: (_b = range.unitId) != null ? _b : currentUnit.getUnitId(),
          sheetName: getSheetNameById((_c = range.unitId) != null ? _c : currentUnit.getUnitId(), rangeSheetId)
        };
        const isAcrossSheet = rangeSheetId !== subUnitId;
        const isAcrossWorkbook = (currentUnit == null ? void 0 : currentUnit.getUnitId()) !== unitId;
        const refRanges = unitRangesToText([unitRangeName], isSupportAcrossSheet && (isAcrossSheet || isAcrossWorkbook), sheetName, isAcrossWorkbook);
        sequenceNodes.push({ token: refRanges[0], nodeType: 4 /* REFERENCE */ });
        const newSequenceNodes = [...sequenceNodes, ...lastNodes];
        const result = sequenceNodeToText(newSequenceNodes);
        handleRangeChange(result, getOffsetFromSequenceNodes(sequenceNodes), isEnd);
      } else {
        const range = selections[selections.length - 1];
        const rangeSheetId = (_d = range.sheetId) != null ? _d : subUnitId;
        const unitRangeName = {
          range,
          unitId: (_e = range.unitId) != null ? _e : currentUnit.getUnitId(),
          sheetName: getSheetNameById((_f = range.unitId) != null ? _f : currentUnit.getUnitId(), rangeSheetId)
        };
        const isAcrossSheet = rangeSheetId !== subUnitId;
        const isAcrossWorkbook = (currentUnit == null ? void 0 : currentUnit.getUnitId()) !== unitId;
        const refRanges = unitRangesToText([unitRangeName], isSupportAcrossSheet && (isAcrossSheet || isAcrossWorkbook), sheetName, isAcrossWorkbook);
        sequenceNodes.unshift({ token: refRanges[0], nodeType: 4 /* REFERENCE */ });
        const result = sequenceNodeToText(sequenceNodes);
        handleRangeChange(result, refRanges[0].length, isEnd);
      }
    } else if (isSelectingRef.current === 3 /* EDIT_OTHER_SHEET_REFERENCE */ || isSelectingRef.current === 4 /* EDIT_OTHER_WORKBOOK_REFERENCE */) {
      const last = selections.pop();
      if (!last) return;
      const node = sequenceNodes[nodeIndex];
      if (typeof node === "object" && node.nodeType === 4 /* REFERENCE */) {
        const oldToken = node.token;
        const isAcrossWorkbook = (currentUnit == null ? void 0 : currentUnit.getUnitId()) !== unitId;
        if (isAcrossWorkbook) {
          node.token = serializeRangeWithSpreadsheet((_g = currentUnit == null ? void 0 : currentUnit.getUnitId()) != null ? _g : "", sheetName, last);
        } else {
          node.token = sheetName === (activeSheet == null ? void 0 : activeSheet.getName()) ? serializeRange(last) : serializeRangeWithSheet(activeSheet.getName(), last);
        }
        const newOffset = offset + (node.token.length - oldToken.length);
        handleRangeChange(generateStringWithSequence(sequenceNodes), newOffset, isEnd);
      }
    } else {
      const orderedSelections = [...selections];
      if (!isCtrlAddMode && updatingRefIndex !== -1) {
        const last = orderedSelections.pop();
        last && orderedSelections.splice(updatingRefIndex, 0, last);
      }
      let currentRefIndex = 0;
      const newTokens = sequenceNodes.map((item) => {
        var _a3, _b2, _c2, _d2;
        if (typeof item === "string") {
          return item;
        }
        if (item.nodeType === 4 /* REFERENCE */) {
          const nodeRange = deserializeRangeWithSheet(item.token);
          if (!nodeRange.sheetName) {
            nodeRange.sheetName = sheetName;
          }
          if ((nodeRange.unitId || unitId) !== (currentUnit == null ? void 0 : currentUnit.getUnitId())) {
            return item.token;
          }
          if (isSupportAcrossSheet) {
            if (((_a3 = contextRef.current.activeSheet) == null ? void 0 : _a3.getName()) !== nodeRange.sheetName) {
              return item.token;
            }
          }
          const selection = orderedSelections[currentRefIndex];
          currentRefIndex++;
          if (!selection) {
            return "";
          }
          const rangeSheetId = (_b2 = selection.sheetId) != null ? _b2 : subUnitId;
          const unitRangeName = {
            range: selection,
            unitId: (_c2 = selection.unitId) != null ? _c2 : currentUnit.getUnitId(),
            sheetName: getSheetNameById((_d2 = selection.unitId) != null ? _d2 : currentUnit.getUnitId(), rangeSheetId)
          };
          const isAcrossWorkbook = (currentUnit == null ? void 0 : currentUnit.getUnitId()) !== unitId;
          const isAcrossSheet = rangeSheetId !== subUnitId;
          const refRanges = unitRangesToText([unitRangeName], isSupportAcrossSheet && (isAcrossSheet || isAcrossWorkbook), sheetName, isAcrossWorkbook);
          return refRanges[0];
        }
        return item.token;
      });
      let currentText = "";
      let newOffset;
      newTokens.forEach((item, index) => {
        currentText += item;
        if (index === nodeIndex) {
          newOffset = currentText.length;
        }
      });
      const theLastList = [];
      for (let index = currentRefIndex; index <= selections.length - 1; index++) {
        const selection = selections[index];
        const rangeSheetId = (_h = selection.sheetId) != null ? _h : subUnitId;
        const unitRangeName = {
          range: selection,
          unitId: (_i = selection.unitId) != null ? _i : currentUnit.getUnitId(),
          sheetName: getSheetNameById((_j = selection.unitId) != null ? _j : currentUnit.getUnitId(), rangeSheetId)
        };
        const isAcrossWorkbook = (currentUnit == null ? void 0 : currentUnit.getUnitId()) !== unitId;
        const isAcrossSheet = rangeSheetId !== subUnitId;
        const refRanges = unitRangesToText([unitRangeName], isSupportAcrossSheet && (isAcrossSheet || isAcrossWorkbook), sheetName, isAcrossWorkbook);
        theLastList.push(refRanges[0]);
      }
      const preNode = sequenceNodes[sequenceNodes.length - 1];
      const isPreNodeRef = preNode && (typeof preNode === "string" ? false : preNode.nodeType === 4 /* REFERENCE */);
      const result = `${currentText}${theLastList.length && isPreNodeRef ? "," : ""}${theLastList.join(",")}`;
      handleRangeChange(result, !theLastList.length && newOffset ? newOffset : result.length, isEnd);
    }
  });
  (0, import_react16.useEffect)(() => {
    if (refSelectionsRenderService && isNeed) {
      let isFirst = true;
      let prevSelectionsCount = 0;
      const handleSelectionsChange = (selections, isEnd) => {
        if (isFirst) {
          isFirst = false;
          prevSelectionsCount = selections.length;
          return;
        }
        const isCtrlAddMode = selections.length > prevSelectionsCount;
        if (isEnd) {
          prevSelectionsCount = selections.length;
        }
        onSelectionsChange(selections.map((i) => i.rangeWithCoord), isEnd, isCtrlAddMode);
      };
      const disposableCollection = new DisposableCollection();
      disposableCollection.add(refSelectionsRenderService.selectionMoving$.subscribe((selections) => {
        handleSelectionsChange(selections, false);
      }));
      disposableCollection.add(refSelectionsRenderService.selectionMoveEnd$.subscribe((selections) => {
        handleSelectionsChange(selections, true);
      }));
      return () => {
        disposableCollection.dispose();
      };
    }
  }, [isNeed, onSelectionsChange, refSelectionsRenderService]);
  (0, import_react16.useEffect)(() => {
    if (isFocus && refSelectionsRenderService && editor) {
      const disposableCollection = new DisposableCollection();
      const reListen = () => {
        disposableCollection.dispose();
        const controls = refSelectionsRenderService.getSelectionControls();
        controls.forEach((control, index) => {
          disposableCollection.add(
            control.selectionScaling$.subscribe((newRange) => {
              const selections = refSelectionsRenderService.getSelectionDataWithStyle().map((i) => i.rangeWithCoord);
              const current = selections[index];
              newRange.sheetId = current.sheetId;
              newRange.unitId = current.unitId;
              selections[index] = newRange;
              onSelectionsChange(selections, false);
            })
          );
          disposableCollection.add(
            control.selectionMoving$.subscribe((newRange) => {
              const selections = refSelectionsRenderService.getSelectionDataWithStyle().map((i) => i.rangeWithCoord);
              const current = selections[index];
              newRange.sheetId = current.sheetId;
              newRange.unitId = current.unitId;
              selections[index] = newRange;
              onSelectionsChange(selections, true);
            })
          );
        });
      };
      const dispose = merge(
        editor.input$,
        refSelectionsService.selectionSet$,
        refSelectionsRenderService.selectionMoveEnd$
      ).pipe(
        debounceTime(50)
      ).subscribe(() => {
        reListen();
      });
      return () => {
        dispose.unsubscribe();
        disposableCollection.dispose();
      };
    }
  }, [editor, isFocus, onSelectionsChange, refSelectionsRenderService, refSelectionsService.selectionSet$]);
  refSelectionsRenderService == null ? void 0 : refSelectionsRenderService.getSelectionDataWithStyle();
  (0, import_react16.useEffect)(() => {
    if (listenSelectionSet) {
      const d = commandService.onCommandExecuted((commandInfo) => {
        var _a2;
        if (commandInfo.id !== SetSelectionsOperation.id) {
          return;
        }
        const params = commandInfo.params;
        if (params.extra !== "formula-editor") {
          return;
        }
        if (params.selections.length) {
          const last = params.selections[params.selections.length - 1];
          if (last) {
            const { range, primary } = last;
            if (((primary == null ? void 0 : primary.isMergedMainCell) || (primary == null ? void 0 : primary.isMerged)) && Rectangle.contains(primary, range)) {
              range.startRow = primary.startRow;
              range.endRow = primary.startRow;
              range.startColumn = primary.startColumn;
              range.endColumn = primary.startColumn;
            }
            range.unitId = params.unitId;
            range.sheetId = params.subUnitId;
            const isAdd = isSelectingRef.current === 1 /* NEED_ADD */;
            const selections = ((_a2 = refSelectionsRenderService == null ? void 0 : refSelectionsRenderService.getSelectionDataWithStyle()) != null ? _a2 : []).map((i) => i.rangeWithCoord);
            if (isAdd) {
              selections.push(range);
            } else {
              selections[selections.length - 1] = range;
            }
            onSelectionsChange(selections, true);
          }
        }
      });
      return () => {
        d.dispose();
      };
    }
  }, [commandService, editor, isSelectingRef, lexerTreeBuilder, listenSelectionSet, onSelectionsChange, refSelectionsRenderService]);
  (0, import_react16.useEffect)(() => {
    if (!editor) {
      return;
    }
    const sub = docSelectionManagerService.textSelection$.subscribe((e) => {
      if (e.unitId !== editor.getEditorId()) {
        return;
      }
      calcHighlightRanges({
        unitId,
        subUnitId,
        refSelections: refSelectionRef.current,
        editor,
        refSelectionsService,
        refSelectionsRenderService,
        sheetSkeletonManagerService,
        themeService,
        univerInstanceService,
        currentWorkbook: currentUnit
      });
    });
    return () => sub.unsubscribe();
  }, [docSelectionManagerService.textSelection$, editor, refSelectionRef, refSelectionsRenderService, refSelectionsService, sheetSkeletonManagerService, subUnitId, themeService, unitId, univerInstanceService]);
};

// ../packages/sheets-formula-ui/src/views/formula-editor/hooks/use-switch-sheet.ts
var import_react17 = __toESM(require_react());
var useSwitchSheet = (isNeed, unitId, isSupportAcrossSheet, isFocusSet, onBlur, refresh) => {
  const commandService = useDependency(ICommandService);
  const editorService = useDependency(IEditorService);
  const renderManagerService = useDependency(IRenderManagerService);
  const render = renderManagerService.getRenderById(unitId);
  const univerInstanceService = useDependency(IUniverInstanceService);
  const refSelectionsRenderService = render == null ? void 0 : render.with(RefSelectionsRenderService);
  (0, import_react17.useEffect)(() => {
    if (isNeed && refSelectionsRenderService) {
      if (isSupportAcrossSheet) {
        const handleRefresh = () => {
          const length = refSelectionsRenderService.getSelectionControls().length;
          for (let index = 1; index <= length; index++) {
            refSelectionsRenderService.clearLastSelection();
          }
          return setTimeout(() => {
            refresh();
          }, 30);
        };
        const d = commandService.onCommandExecuted((info) => {
          if (info.id === SetWorksheetActiveOperation.id) {
            handleRefresh();
          }
        });
        const d2 = univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */).subscribe((unit) => {
          handleRefresh();
        });
        return () => {
          d.dispose();
          d2.unsubscribe();
        };
      } else {
        const d = commandService.beforeCommandExecuted((info) => {
          if (info.id === SetWorksheetActiveOperation.id) {
            isFocusSet(false);
            onBlur();
            refresh();
            const editor = editorService.getEditor(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
            editor == null ? void 0 : editor.focus();
          }
        });
        return () => {
          d.dispose();
        };
      }
    }
  }, [isNeed, refSelectionsRenderService]);
};

// ../packages/sheets-formula-ui/src/views/formula-editor/hooks/use-verify.ts
var import_react18 = __toESM(require_react());
var useVerify = (isNeed, onVerify, formulaText) => {
  const lexerTreeBuilder = useDependency(LexerTreeBuilder);
  const isInitRender = (0, import_react18.useRef)(true);
  (0, import_react18.useEffect)(() => {
    if (isNeed) {
      const time = setTimeout(() => {
        isInitRender.current = false;
      }, 500);
      return () => {
        clearTimeout(time);
      };
    }
  }, [isNeed]);
  (0, import_react18.useEffect)(() => {
    if (!isInitRender.current) {
      if (onVerify) {
        const result = lexerTreeBuilder.checkIfAddBracket(formulaText);
        onVerify(result === 0 && formulaText.startsWith("=" /* EQUALS */), `${formulaText}`);
      }
    }
  }, [formulaText, onVerify]);
};

// ../packages/sheets-formula-ui/src/views/formula-editor/search-function/SearchFunction.tsx
var import_react20 = __toESM(require_react());

// ../packages/sheets-formula-ui/src/views/formula-editor/hooks/use-formula-search.ts
var import_react19 = __toESM(require_react());
function shouldAppendOpenBracket(functionType) {
  return functionType !== 16 /* DefinedName */ && functionType !== 17 /* Table */;
}
function getFormulaReplaceResult(nodes, index, formulaName, functionType) {
  const cloneNodes = [...nodes];
  if (index !== -1) {
    const lastNodes = cloneNodes.splice(index + 1);
    const oldNode = cloneNodes.pop() || "";
    let offset = (typeof oldNode === "string" ? oldNode.length : oldNode.token.length) - formulaName.length;
    cloneNodes.push(formulaName);
    if (lastNodes[0] !== "(" /* OPEN_BRACKET */ && shouldAppendOpenBracket(functionType)) {
      cloneNodes.push("(" /* OPEN_BRACKET */);
      offset--;
    }
    const text = sequenceNodeToText([...cloneNodes, ...lastNodes]);
    return { text, offset };
  }
}
var useFormulaSearch = (isNeed, nodes = [], editor) => {
  const descriptionService = useDependency(IDescriptionService);
  const [searchList, setSearchList] = (0, import_react19.useState)([]);
  const [searchText, setSearchText] = (0, import_react19.useState)("");
  const indexRef = (0, import_react19.useRef)(-1);
  const stateRef = useStateRef({ nodes });
  const reset = () => {
    setSearchList([]);
    setSearchText("");
    indexRef.current = -1;
  };
  (0, import_react19.useEffect)(() => {
    if (editor && isNeed) {
      const d = editor.input$.pipe(debounceTime(300)).subscribe(() => {
        const selections = editor.getSelectionRanges();
        if (selections.length === 1) {
          const nodes2 = stateRef.current.nodes;
          const range = selections[0];
          if (range.collapsed) {
            const currentNodeIndex = findIndexFromSequenceNodes(nodes2, range.startOffset - 1, false);
            indexRef.current = currentNodeIndex;
            const currentNode = nodes2[currentNodeIndex];
            if (currentNode && typeof currentNode !== "string" && currentNode.nodeType === 3 /* FUNCTION */) {
              indexRef.current = currentNodeIndex;
              const token = currentNode.token;
              const list = descriptionService.getSearchListByNameFirstLetter(token);
              setSearchList(list.slice(0, 10));
              setSearchText(token);
              return;
            }
          }
        }
        indexRef.current = -1;
        setSearchText("");
        setSearchList((pre) => {
          if (!(pre == null ? void 0 : pre.length)) {
            return pre;
          }
          return [];
        });
      });
      return () => {
        d.unsubscribe();
      };
    }
    ;
  }, [editor, isNeed]);
  (0, import_react19.useEffect)(() => {
    if (!isNeed) {
      reset();
    }
  }, [isNeed]);
  const handlerFormulaReplace = (formulaName, functionType) => {
    return getFormulaReplaceResult(stateRef.current.nodes, indexRef.current, formulaName, functionType);
  };
  return {
    searchList,
    searchText,
    handlerFormulaReplace,
    reset
  };
};

// ../packages/sheets-formula-ui/src/views/formula-editor/search-function/SearchFunction.tsx
var import_jsx_runtime9 = __toESM(require_jsx_runtime());
var SearchFunction = (0, import_react20.forwardRef)(SearchFunctionFactory);
function SearchFunctionFactory(props, ref) {
  const { isFocus, sequenceNodes, onSelect, editor, onClose = noop } = props;
  const editorId = editor.getEditorId();
  const shortcutService = useDependency(IShortcutService);
  const commandService = useDependency(ICommandService);
  const { searchList, searchText, handlerFormulaReplace, reset: resetFormulaSearch } = useFormulaSearch(isFocus, sequenceNodes, editor);
  const visible = (0, import_react20.useMemo)(() => !!searchList.length, [searchList]);
  const ulRef = (0, import_react20.useRef)(void 0);
  const [active, setActive] = (0, import_react20.useState)(0);
  const isEnableMouseEnterOrOut = (0, import_react20.useRef)(false);
  const [position$] = useEditorPosition(editorId, visible, [searchText, searchList]);
  const stateRef = useStateRef({ searchList, active });
  const handleFunctionSelect = (v, functionType) => {
    const res = handlerFormulaReplace(v, functionType);
    if (res) {
      resetFormulaSearch();
      onSelect(res);
    }
  };
  function handleLiMouseEnter(index) {
    if (!isEnableMouseEnterOrOut.current) {
      return;
    }
    setActive(index);
  }
  function handleLiMouseLeave() {
    if (!isEnableMouseEnterOrOut.current) {
      return;
    }
    setActive(-1);
  }
  (0, import_react20.useEffect)(() => {
    if (!searchList.length) {
      return;
    }
    const operationId = `sheet.formula-embedding-editor.search_function.${editorId}`;
    const d = new DisposableCollection();
    const handleKeycode = (keycode) => {
      const { searchList: searchList2, active: active2 } = stateRef.current;
      switch (keycode) {
        case 38 /* ARROW_UP */: {
          setActive((pre) => {
            const res = Math.max(0, pre - 1);
            scrollToVisible(res);
            return res;
          });
          break;
        }
        case 40 /* ARROW_DOWN */: {
          setActive((pre) => {
            const res = Math.min(searchList2.length - 1, pre + 1);
            scrollToVisible(res);
            return res;
          });
          break;
        }
        case 9 /* TAB */:
        case 13 /* ENTER */: {
          const item = searchList2[active2];
          handleFunctionSelect(item.name, item.functionType);
          break;
        }
        case 27 /* ESC */: {
          resetFormulaSearch();
          onClose();
          break;
        }
      }
    };
    d.add(commandService.registerCommand({
      id: operationId,
      type: 1 /* OPERATION */,
      handler(_event, params) {
        const { keyCode } = params;
        handleKeycode(keyCode);
      }
    }));
    [38 /* ARROW_UP */, 40 /* ARROW_DOWN */, 13 /* ENTER */, 27 /* ESC */, 9 /* TAB */].map((keyCode) => {
      return {
        id: operationId,
        binding: keyCode,
        preconditions: () => true,
        priority: 1e3,
        staticParameters: {
          eventType: 4 /* Keyboard */,
          keyCode
        }
      };
    }).forEach((item) => {
      d.add(shortcutService.registerShortcut(item));
    });
    return () => {
      d.dispose();
    };
  }, [searchList]);
  function scrollToVisible(liIndex) {
    const ulElement = ulRef.current;
    if (!ulElement) return;
    const liElement = ulElement.children[liIndex];
    if (!liElement) return;
    const ulRect = ulElement.getBoundingClientRect();
    const ulTop = ulRect.top;
    const ulHeight = ulElement.offsetHeight;
    const liRect = liElement.getBoundingClientRect();
    const liTop = liRect.top;
    const liHeight = liRect.height;
    if (liTop >= 0 && liTop > ulTop && liTop - ulTop + liHeight <= ulHeight) {
      return;
    }
    const scrollTo = liElement.offsetTop - (ulHeight - liHeight) / 2;
    ulElement.scrollTo({
      top: scrollTo,
      behavior: "smooth"
    });
  }
  const debounceResetMouseState = (0, import_react20.useMemo)(() => {
    let time = "";
    return () => {
      clearTimeout(time);
      isEnableMouseEnterOrOut.current = true;
      time = setTimeout(() => {
        isEnableMouseEnterOrOut.current = false;
      }, 300);
    };
  }, []);
  return searchList.length > 0 && visible && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(RectPopup, { portal: true, anchorRect$: position$, direction: "vertical", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
    "ul",
    {
      ref: (v) => {
        ulRef.current = v;
        if (ref) {
          ref.current = v;
        }
      },
      "data-u-comp": "sheets-formula-editor",
      className: clsx(`univer-m-0 univer-box-border univer-max-h-[400px] univer-w-[250px] univer-list-none univer-overflow-y-auto univer-rounded-lg univer-bg-white univer-p-2 univer-leading-5 univer-shadow-md univer-outline-none dark:!univer-bg-gray-900`, borderClassName, scrollbarClassName),
      children: searchList.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
        "li",
        {
          className: clsx(`univer-box-border univer-cursor-pointer univer-rounded univer-px-2 univer-py-1 univer-text-gray-900 univer-transition-colors dark:!univer-text-white`, {
            "univer-bg-gray-200 dark:!univer-bg-gray-600": active === index
          }),
          onMouseEnter: () => handleLiMouseEnter(index),
          onMouseLeave: handleLiMouseLeave,
          onMouseMove: debounceResetMouseState,
          onClick: () => {
            handleFunctionSelect(item.name, item.functionType);
            if (editor) {
              editor.focus();
            }
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "univer-block univer-truncate univer-text-xs", children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "univer-text-red-500", children: item.name.substring(0, searchText.length) }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { children: item.name.slice(searchText.length) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              "span",
              {
                className: "univer-block univer-text-xs univer-text-gray-400",
                children: item.desc
              }
            )
          ]
        },
        item.name
      ))
    }
  ) });
}

// ../packages/sheets-formula-ui/src/views/formula-editor/utils/get-formula-text.ts
var getFormulaText = (formula) => {
  if (formula.startsWith("=" /* EQUALS */)) {
    return formula.slice(1);
  }
  return "";
};

// ../packages/sheets-formula-ui/src/views/formula-editor/index.tsx
var import_jsx_runtime10 = __toESM(require_jsx_runtime());
var FormulaEditor = (0, import_react21.forwardRef)((props, ref) => {
  var _a, _b, _c, _d;
  const {
    errorText,
    initValue,
    unitId,
    subUnitId,
    isFocus: _isFocus = true,
    isSupportAcrossSheet = false,
    onFocus = noop,
    onBlur = noop,
    onChange: propOnChange,
    onVerify,
    className,
    editorId: propEditorId,
    moveCursor = true,
    onFormulaSelectingChange: propOnFormulaSelectingChange,
    keyboardEventConfig,
    onMoveInEditor,
    resetSelectionOnBlur = true,
    autoScrollbar = true,
    isSingle = true,
    disableSelectionOnClick = false,
    autofocus = true,
    disableContextMenu,
    style,
    borderless = false,
    canvasStyle
  } = props;
  const editorService = useDependency(IEditorService);
  const sheetEmbeddingRef = (0, import_react21.useRef)(null);
  const onChange = useEvent(propOnChange);
  (0, import_react21.useImperativeHandle)(ref, () => ({
    isClickOutSide: (e) => {
      if (sheetEmbeddingRef.current) {
        return !sheetEmbeddingRef.current.contains(e.target);
      }
      return false;
    }
  }));
  const onFormulaSelectingChange = useEvent(propOnFormulaSelectingChange);
  const searchFunctionRef = (0, import_react21.useRef)(null);
  const editorRef = (0, import_react21.useRef)(void 0);
  const editor = editorRef.current;
  const [isFocus, setIsFocus] = (0, import_react21.useState)(_isFocus);
  const formulaEditorContainerRef = (0, import_react21.useRef)(null);
  const editorId = (0, import_react21.useMemo)(() => propEditorId != null ? propEditorId : createInternalEditorID(`${EMBEDDING_FORMULA_EDITOR}-${generateRandomId(4)}`), []);
  const isError = (0, import_react21.useMemo)(() => errorText !== void 0, [errorText]);
  const univerInstanceService = useDependency(IUniverInstanceService);
  const document = univerInstanceService.getUnit(editorId);
  useObservable(document == null ? void 0 : document.change$);
  const getFormulaToken = useFormulaToken();
  const formulaText = BuildTextUtils.transform.getPlainText((_b = (_a = document == null ? void 0 : document.getBody()) == null ? void 0 : _a.dataStream) != null ? _b : "");
  const formulaTextRef = useStateRef(formulaText);
  const formulaWithoutEqualSymbol = (0, import_react21.useMemo)(() => getFormulaText(formulaText), [formulaText]);
  const sequenceNodes = (0, import_react21.useMemo)(() => getFormulaToken(formulaWithoutEqualSymbol), [formulaWithoutEqualSymbol, getFormulaToken]);
  const { isSelecting, isSelectingRef } = useFormulaSelecting({ unitId, subUnitId, editorId, isFocus, disableOnClick: disableSelectionOnClick });
  const highTextRef = (0, import_react21.useRef)("");
  const renderManagerService = useDependency(IRenderManagerService);
  const renderer = renderManagerService.getRenderById(editorId);
  const docSelectionRenderService = renderer == null ? void 0 : renderer.with(DocSelectionRenderService);
  const isFocusing = docSelectionRenderService == null ? void 0 : docSelectionRenderService.isFocusing;
  const currentDoc$ = (0, import_react21.useMemo)(() => univerInstanceService.getCurrentTypeOfUnit$(1 /* UNIVER_DOC */), [univerInstanceService]);
  const currentDoc = useObservable(currentDoc$);
  const docFocusing = (currentDoc == null ? void 0 : currentDoc.getUnitId()) === editorId;
  const refSelections = (0, import_react21.useRef)([]);
  const selectingMode = isSelecting;
  const configService = useDependency(IConfigService);
  const functionScreenTips = (_d = (_c = configService.getConfig(PLUGIN_CONFIG_KEY_BASE2)) == null ? void 0 : _c.functionScreenTips) != null ? _d : true;
  useUpdateEffect(() => {
    onChange(formulaText);
  }, [formulaText, onChange]);
  const highlightDoc = useDocHight("=");
  const highlightSheet = useSheetHighlight(unitId, subUnitId);
  const highlight = useEvent((text, isNeedResetSelection = true, isEnd, newSelections) => {
    if (!editorRef.current) return;
    highTextRef.current = text;
    const formulaStr = text[0] === "=" ? text.slice(1) : "";
    const sequenceNodes2 = getFormulaToken(formulaStr);
    const parsedFormula = sequenceNodes2.reduce((pre, cur) => typeof cur === "object" ? `${pre}${cur.token}` : `${pre}${cur}`, "");
    const ranges = highlightDoc(
      editorRef.current,
      parsedFormula === formulaStr ? sequenceNodes2 : [],
      isNeedResetSelection,
      newSelections
    );
    refSelections.current = ranges;
    if (isEnd) {
      const currentDocSelections = newSelections != null ? newSelections : editor == null ? void 0 : editor.getSelectionRanges();
      if ((currentDocSelections == null ? void 0 : currentDocSelections.length) !== 1) {
        return;
      }
      const docRange = currentDocSelections[0];
      const offset = docRange.startOffset - 1;
      const nodeIndex = findIndexFromSequenceNodes(sequenceNodes2, offset, false);
      const refIndex = findRefSequenceIndex(sequenceNodes2, nodeIndex);
      if (refIndex >= 0) {
        const target = ranges.splice(refIndex, 1)[0];
        target && ranges.push(target);
      }
      highlightSheet(isFocus ? ranges : [], editorRef.current);
    }
  });
  (0, import_react21.useEffect)(() => {
    if (isFocus) {
      highlight(formulaText, false, true);
    }
  }, [isFocus]);
  (0, import_react21.useEffect)(() => {
    if (isFocus) {
      if (highTextRef.current === formulaText) return;
      highlight(formulaText, false, true);
    }
  }, [formulaText]);
  useVerify(isFocus, onVerify, formulaText);
  const focus = useFocus(editor);
  const resetSelection = useResetSelection(isFocus, unitId, subUnitId);
  (0, import_react21.useEffect)(() => {
    var _a2;
    onFormulaSelectingChange(isSelecting, (_a2 = docSelectionRenderService == null ? void 0 : docSelectionRenderService.isFocusing) != null ? _a2 : true);
  }, [onFormulaSelectingChange, isSelecting]);
  useKeyboardEvent(isFocus, keyboardEventConfig, editor);
  (0, import_react21.useLayoutEffect)(() => {
    var _a2;
    let dispose;
    if (formulaEditorContainerRef.current) {
      dispose = editorService.register({
        autofocus,
        editorUnitId: editorId,
        initialSnapshot: {
          id: editorId,
          body: {
            dataStream: `${initValue}\r
`,
            textRuns: [],
            customBlocks: [],
            customDecorations: [],
            customRanges: []
          },
          documentStyle: {
            pageSize: {
              width: Number.POSITIVE_INFINITY,
              height: Number.POSITIVE_INFINITY
            },
            documentFlavor: 0 /* UNSPECIFIED */,
            marginTop: 0,
            marginBottom: 0,
            marginRight: 0,
            marginLeft: 0,
            paragraphLineGapDefault: 0,
            renderConfig: {
              horizontalAlign: 0 /* UNSPECIFIED */,
              verticalAlign: 1 /* TOP */
            }
          }
        },
        canvasStyle: {
          ...canvasStyle,
          backgroundColor: (_a2 = canvasStyle == null ? void 0 : canvasStyle.backgroundColor) != null ? _a2 : "#fff"
        }
      }, formulaEditorContainerRef.current);
      const editor2 = editorService.getEditor(editorId);
      editorRef.current = editor2;
      highlight(initValue, false, true);
    }
    return () => {
      dispose == null ? void 0 : dispose.dispose();
    };
  }, []);
  (0, import_react21.useLayoutEffect)(() => {
    let focusRetryFrame = 0;
    let finalFocusRetryFrame = 0;
    const retryFocus = () => {
      if (_isFocus && !(docSelectionRenderService == null ? void 0 : docSelectionRenderService.isFocusing)) {
        focus();
      }
    };
    if (_isFocus) {
      setIsFocus(_isFocus);
      focus();
      focusRetryFrame = requestAnimationFrame(() => {
        retryFocus();
        finalFocusRetryFrame = requestAnimationFrame(retryFocus);
      });
    } else {
      if (resetSelectionOnBlur) {
        editor == null ? void 0 : editor.blur();
        resetSelection();
      }
      setIsFocus(_isFocus);
    }
    return () => {
      cancelAnimationFrame(focusRetryFrame);
      cancelAnimationFrame(finalFocusRetryFrame);
    };
  }, [_isFocus, docSelectionRenderService, editor, focus, resetSelection, resetSelectionOnBlur]);
  const { checkScrollBar } = useResize(editor, isSingle, autoScrollbar);
  useRefactorEffect(isFocus, Boolean(isSelecting && docFocusing), unitId, editorId, disableContextMenu);
  useLeftAndRightArrow(Boolean(isFocus && isFocusing && moveCursor), selectingMode, editor, onMoveInEditor);
  const handleSelectionChange = useEvent((refString, offset, isEnd) => {
    if (!isFocusing) {
      return;
    }
    const newSelections = offset !== -1 ? [{ startOffset: offset + 1, endOffset: offset + 1, collapsed: true }] : void 0;
    highlight(`=${refString}`, true, isEnd, newSelections);
    if (isEnd) {
      focus();
      if (offset !== -1) {
        setTimeout(() => {
          const range = { startOffset: offset + 1, endOffset: offset + 1 };
          const docBackScrollRenderController = editor == null ? void 0 : editor.render.with(DocBackScrollRenderController);
          docBackScrollRenderController == null ? void 0 : docBackScrollRenderController.scrollToRange({ ...range, collapsed: true });
        }, 50);
      }
      checkScrollBar();
    }
  });
  useSheetSelectionChange(
    isFocus && Boolean(isSelecting && docFocusing),
    isFocus,
    isSelectingRef,
    unitId,
    subUnitId,
    refSelections,
    isSupportAcrossSheet,
    Boolean(selectingMode),
    editor,
    handleSelectionChange
  );
  useSwitchSheet(isFocus && Boolean(isSelecting && docFocusing), unitId, isSupportAcrossSheet, setIsFocus, onBlur, () => {
    highlight(formulaTextRef.current, false, true);
  });
  const handleFunctionSelect = (res) => {
    if (res) {
      const selections = editor == null ? void 0 : editor.getSelectionRanges();
      if (selections && selections.length === 1) {
        const range = selections[0];
        if (range.collapsed) {
          const offset = res.offset;
          setTimeout(() => {
            editor == null ? void 0 : editor.setSelectionRanges([{ startOffset: range.startOffset - offset, endOffset: range.endOffset - offset }]);
          }, 30);
        }
      }
      focus();
      highlight(`=${res.text}`);
    }
  };
  const handleMouseUp = () => {
    setIsFocus(true);
    onFocus();
    focus();
  };
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className, children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      "div",
      {
        ref: sheetEmbeddingRef,
        className: clsx(`univer-relative univer-box-border univer-flex univer-size-full univer-items-center univer-justify-around univer-gap-2 univer-rounded-none univer-p-0`, {
          "univer-ring-1": !borderless,
          "univer-ring-primary-500": isFocus && !borderless,
          "univer-ring-red-500": isError && !borderless
        }),
        children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
          "div",
          {
            ref: formulaEditorContainerRef,
            className: "univer-relative univer-size-full",
            onMouseUp: handleMouseUp
          }
        )
      }
    ),
    errorText !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "univer-my-1 univer-text-xs univer-text-red-500", children: errorText }),
    functionScreenTips && editor && formulaWithoutEqualSymbol !== "" && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      HelpFunction,
      {
        editor,
        isFocus,
        formulaText,
        onClose: () => focus()
      }
    ),
    functionScreenTips && !!editor && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      SearchFunction,
      {
        isFocus,
        sequenceNodes,
        onSelect: handleFunctionSelect,
        ref: searchFunctionRef,
        editor
      }
    )
  ] });
});

// ../packages/sheets-formula-ui/src/views/range-selector/index.tsx
var import_react24 = __toESM(require_react());

// ../packages/sheets-formula-ui/src/views/range-selector/hooks/use-ranges-highlight.ts
var import_react22 = __toESM(require_react());
function useRangesHighlight(editor, focusing, unitId, subUnitId) {
  var _a;
  const lexerTreeBuilder = useDependency(LexerTreeBuilder);
  const highlightDoc = useDocHight("");
  const change = useObservable((_a = editor == null ? void 0 : editor.getDocumentDataModel()) == null ? void 0 : _a.change$);
  const [sequenceNodes, setSequenceNodes] = (0, import_react22.useState)([]);
  const markSelectionService = useDependency(IMarkSelectionService);
  const last = (0, import_react22.useRef)("");
  const univerInstanceService = useDependency(IUniverInstanceService);
  (0, import_react22.useEffect)(() => {
    if (!editor) return;
    const text = editor.getDocumentDataModel().getPlainText();
    if (last.current === text) {
      return;
    }
    last.current = text;
    const nodes = lexerTreeBuilder.sequenceNodesBuilder(text);
    setSequenceNodes(nodes != null ? nodes : []);
  }, [change, editor, lexerTreeBuilder]);
  (0, import_react22.useEffect)(() => {
    var _a2, _b;
    if (!editor) return;
    if (!focusing) {
      const current = editor.getDocumentData();
      editor.setDocumentData({
        ...current,
        body: {
          ...current.body,
          dataStream: (_b = (_a2 = current.body) == null ? void 0 : _a2.dataStream) != null ? _b : "",
          textRuns: []
        }
      });
      return;
    }
    const selections = highlightDoc(editor, sequenceNodes, false);
    const disposable = new DisposableCollection();
    selections.forEach((selection) => {
      const range = deserializeRangeWithSheet(selection.token);
      const workbook = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
      const worksheet = workbook == null ? void 0 : workbook.getActiveSheet();
      if (!range.sheetName && subUnitId !== (worksheet == null ? void 0 : worksheet.getSheetId()) || range.sheetName && (worksheet == null ? void 0 : worksheet.getName()) !== range.sheetName) {
        return;
      }
      const rgb = new ColorKit(selection.themeColor).toRgb();
      const id = markSelectionService.addShape({
        range: range.range,
        style: {
          stroke: selection.themeColor,
          fill: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
          strokeDash: 12
        },
        primary: null
      });
      if (id) {
        disposable.add(() => markSelectionService.removeShape(id));
      }
    });
    return () => {
      disposable.dispose();
    };
  }, [editor, focusing, highlightDoc, markSelectionService, sequenceNodes]);
  return { sequenceNodes };
}

// ../packages/sheets-formula-ui/src/views/range-selector/hooks/use-selection-change.ts
var import_react23 = __toESM(require_react());
function useRangeSelectorSelectionChange(opts) {
  const sheetsSelectionsService = useDependency(SheetsSelectionsService);
  const { supportAcrossSheet = false, keepSheetReference = false, unitId, subUnitId, onChange: _onChange } = opts;
  const univerInstanceService = useDependency(IUniverInstanceService);
  const workbook = univerInstanceService.getUnit(unitId, 2 /* UNIVER_SHEET */);
  const onChange = useEvent(_onChange);
  const handleSelectionChange = useEvent((selections, isStart) => {
    const currentSheet = workbook == null ? void 0 : workbook.getActiveSheet();
    if (!currentSheet) return;
    if (!supportAcrossSheet && currentSheet.getSheetId() !== subUnitId) return;
    if (!(selections == null ? void 0 : selections.length)) return;
    const sheetName = keepSheetReference ? currentSheet.getName() : currentSheet.getSheetId() === subUnitId ? "" : currentSheet.getName();
    const ranges = selections.map((item) => ({
      range: item.range,
      unitId,
      sheetName
    }));
    onChange(ranges, isStart);
  });
  (0, import_react23.useEffect)(() => {
    const disposableCollection = new DisposableCollection();
    disposableCollection.add(sheetsSelectionsService.selectionMoveStart$.subscribe((selections) => {
      handleSelectionChange(selections, true);
    }));
    disposableCollection.add(sheetsSelectionsService.selectionMoving$.subscribe((selections) => {
      handleSelectionChange(selections, false);
    }));
    disposableCollection.add(sheetsSelectionsService.selectionMoveEnd$.subscribe((selections) => {
      handleSelectionChange(selections, false);
    }));
    return () => {
      disposableCollection.dispose();
    };
  }, [handleSelectionChange, sheetsSelectionsService.selectionMoveEnd$, sheetsSelectionsService.selectionMoveStart$, sheetsSelectionsService.selectionMoving$]);
}

// ../packages/sheets-formula-ui/src/views/range-selector/util.ts
var verifyRange = (sequenceNodes) => {
  const isFail = sequenceNodes.some((item) => {
    if (typeof item === "string") {
      if (item !== "," /* COMMA */) {
        return true;
      }
    } else {
      if (item.nodeType !== 4 /* REFERENCE */) {
        return true;
      }
    }
    return false;
  });
  return !isFail;
};

// ../packages/sheets-formula-ui/src/views/range-selector/utils/range-pre-process.ts
var rangePreProcess = (range) => {
  if (range.endColumn < range.startColumn) {
    const end = range.endColumn;
    range.endColumn = range.startColumn;
    range.startColumn = end;
  }
  if (range.endRow < range.startRow) {
    const end = range.endRow;
    range.endRow = range.startRow;
    range.startRow = end;
  }
  return range;
};

// ../packages/sheets-formula-ui/src/views/range-selector/index.tsx
var import_jsx_runtime11 = __toESM(require_jsx_runtime());
function RangeSelectorDialog(props) {
  const {
    visible,
    initialValue,
    unitId,
    subUnitId,
    maxRangeCount = Infinity,
    supportAcrossSheet,
    keepSheetReference,
    onConfirm,
    onClose,
    onShowBySelection
  } = props;
  const localeService = useDependency(LocaleService);
  const lexerTreeBuilder = useDependency(LexerTreeBuilder);
  const [ranges, setRanges] = (0, import_react24.useState)([]);
  const [focusIndex, setFocusIndex] = (0, import_react24.useState)(0);
  const scrollbarRef = (0, import_react24.useRef)(null);
  (0, import_react24.useEffect)(() => {
    if (visible && initialValue.length) {
      const newRanges = initialValue.map((range) => range.sheetName ? serializeRangeWithSheet(range.sheetName, range.range) : serializeRange(range.range));
      setRanges(newRanges);
      setFocusIndex(newRanges.length - 1);
    } else {
      setRanges([""]);
      setFocusIndex(0);
    }
  }, [visible]);
  const handleRangeInput = (index, value) => {
    const newRanges = [...ranges];
    newRanges[index] = value;
    setRanges(newRanges);
  };
  const handleRangeAdd = () => {
    setRanges([...ranges, ""]);
    setFocusIndex(ranges.length);
  };
  const handleRangeRemove = (index) => {
    ranges.splice(index, 1);
    setRanges([...ranges]);
  };
  useRangeSelectorSelectionChange({
    unitId,
    subUnitId,
    supportAcrossSheet,
    keepSheetReference,
    onChange: (selections, isStart) => {
      if (!visible) {
        if (onShowBySelection == null ? void 0 : onShowBySelection(selections)) {
          return;
        }
      }
      const current = new Set(ranges);
      const addedRangesOrigin = selections.map((range) => !range.sheetName ? serializeRange(range.range) : serializeRangeWithSheet(range.sheetName, range.range));
      const addedRanges = addedRangesOrigin.filter((item) => !current.has(item));
      if (!addedRanges.length) return;
      const newRanges = [...ranges];
      if (addedRangesOrigin.length > 1) {
        if (!isStart) {
          newRanges.splice(focusIndex, 1);
        }
        newRanges.push(...addedRanges);
        const finalRanges = newRanges.slice(0, maxRangeCount);
        setRanges(finalRanges);
        setFocusIndex(finalRanges.length - 1);
        requestAnimationFrame(() => {
          var _a;
          (_a = scrollbarRef.current) == null ? void 0 : _a.scrollTo({ top: scrollbarRef.current.scrollHeight });
        });
      } else {
        newRanges.splice(focusIndex, 1, ...addedRanges);
        const finalRanges = newRanges.slice(0, maxRangeCount);
        setRanges(finalRanges);
        setFocusIndex(focusIndex + addedRanges.length - 1);
      }
    }
  });
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
    Dialog,
    {
      width: "328px",
      open: visible,
      title: localeService.t("sheets-formula-ui.rangeSelector.title"),
      draggable: true,
      mask: false,
      maskClosable: false,
      footer: /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("footer", { className: "univer-flex univer-gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Button, { onClick: onClose, children: localeService.t("sheets-formula-ui.rangeSelector.cancel") }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
          Button,
          {
            variant: "primary",
            onClick: () => {
              onConfirm(
                ranges.filter((text) => {
                  const nodes = lexerTreeBuilder.sequenceNodesBuilder(text);
                  return nodes && nodes.length === 1 && typeof nodes[0] !== "string" && nodes[0].nodeType === 4 /* REFERENCE */;
                }).map((text) => deserializeRangeWithSheet(text)).map((unitRange) => ({ ...unitRange, range: rangePreProcess(unitRange.range) }))
              );
            },
            children: localeService.t("sheets-formula-ui.rangeSelector.confirm")
          }
        )
      ] }),
      onClose,
      children: /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
        "div",
        {
          ref: scrollbarRef,
          className: clsx("-univer-mx-6 univer-max-h-60 univer-overflow-y-auto univer-px-6", scrollbarClassName),
          children: [
            ranges.map((text, index) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
              "div",
              {
                className: "univer-mb-2 univer-flex univer-items-center univer-gap-4",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
                    Input,
                    {
                      className: clsx("univer-w-full", {
                        "univer-border-primary-600": focusIndex === index
                      }),
                      placeholder: localeService.t("sheets-formula-ui.rangeSelector.placeHolder"),
                      onFocus: () => setFocusIndex(index),
                      value: text,
                      onChange: (value) => handleRangeInput(index, value)
                    }
                  ),
                  ranges.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
                    DeleteIcon,
                    {
                      className: "univer-cursor-pointer",
                      onClick: () => handleRangeRemove(index)
                    }
                  )
                ]
              },
              index
            )),
            ranges.length < maxRangeCount && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(Button, { variant: "link", onClick: handleRangeAdd, children: [
              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(IncreaseIcon, {}),
              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { children: localeService.t("sheets-formula-ui.rangeSelector.addAnotherRange") })
            ] }) })
          ]
        }
      )
    }
  );
}
function parseRanges(rangeString) {
  return rangeString.split("," /* COMMA */).filter((e) => !!e).map((text) => deserializeRangeWithSheet(text));
}
function stringifyRanges(ranges) {
  return ranges.map((range) => range.sheetName ? serializeRangeWithSheet(range.sheetName, range.range) : serializeRange(range.range)).join("," /* COMMA */);
}
function RangeSelector(props) {
  const [editor, setEditor] = (0, import_react24.useState)(null);
  const {
    onVerify,
    selectorRef,
    unitId,
    subUnitId,
    maxRangeCount,
    supportAcrossSheet,
    keepSheetReference,
    autoFocus,
    onChange,
    onRangeSelectorDialogVisibleChange,
    onClickOutside,
    onFocusChange,
    forceShowDialogWhenSelectionChanged,
    hideEditor,
    resetRange
  } = props;
  const [focusing, setFocusing] = (0, import_react24.useState)(autoFocus != null ? autoFocus : false);
  const [popupVisible, setPopupVisible] = (0, import_react24.useState)(false);
  const [rangeSelectorRanges, setRangeSelectorRanges] = (0, import_react24.useState)([]);
  const localeService = useDependency(LocaleService);
  const editorService = useDependency(IEditorService);
  const { sequenceNodes } = useRangesHighlight(editor, focusing, unitId, subUnitId);
  const sequenceNodesRef = useStateRef(sequenceNodes);
  const commandService = useDependency(ICommandService);
  const blurEditor = useEvent(() => {
    editor == null ? void 0 : editor.setSelectionRanges([]);
    editor == null ? void 0 : editor.blur();
    editorService.blur();
  });
  const handleOpenModal = useEvent(() => {
    var _a, _b;
    blurEditor();
    setRangeSelectorRanges(parseRanges((_b = (_a = editor == null ? void 0 : editor.getDocumentDataModel()) == null ? void 0 : _a.getPlainText()) != null ? _b : ""));
    setPopupVisible(true);
  });
  (0, import_react24.useEffect)(() => {
    if (!selectorRef) return;
    selectorRef.current = {
      get editor() {
        return editor;
      },
      focus() {
        editorService.focus(editor.getEditorId());
      },
      blur: blurEditor,
      verify: () => verifyRange(sequenceNodesRef.current),
      showDialog: (ranges) => {
        blurEditor();
        setRangeSelectorRanges(ranges);
        setPopupVisible(true);
      },
      hideDialog: () => {
        setRangeSelectorRanges([]);
        setPopupVisible(false);
      },
      getValue: () => {
        var _a, _b;
        return (_b = (_a = editor == null ? void 0 : editor.getDocumentDataModel()) == null ? void 0 : _a.getPlainText()) != null ? _b : "";
      }
    };
  }, [blurEditor, editor, editorService, selectorRef, sequenceNodesRef]);
  (0, import_react24.useEffect)(() => {
    var _a, _b;
    onVerify == null ? void 0 : onVerify(verifyRange(sequenceNodes), (_b = (_a = editor == null ? void 0 : editor.getDocumentDataModel()) == null ? void 0 : _a.getPlainText()) != null ? _b : "");
  }, [sequenceNodes]);
  (0, import_react24.useEffect)(() => {
    onRangeSelectorDialogVisibleChange == null ? void 0 : onRangeSelectorDialogVisibleChange(popupVisible);
  }, [popupVisible]);
  (0, import_react24.useEffect)(() => {
    if (popupVisible && resetRange) {
      return () => {
        const params = {
          unitId,
          subUnitId,
          selections: resetRange
        };
        commandService.executeCommand(SetSelectionsOperation.id, params);
      };
    }
  }, [popupVisible]);
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, { children: [
    !hideEditor ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
      RichTextEditor,
      {
        isSingle: true,
        ...props,
        onFocusChange: (focusing2, newValue) => {
          setFocusing(focusing2);
          onFocusChange == null ? void 0 : onFocusChange(focusing2, newValue);
        },
        editorRef: setEditor,
        onClickOutside: () => {
          setFocusing(false);
          blurEditor();
          onClickOutside == null ? void 0 : onClickOutside();
        },
        icon: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Tooltip, { title: localeService.t("sheets-formula-ui.rangeSelector.buttonTooltip"), placement: "bottom", children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
          SelectRangeIcon,
          {
            className: `univer-cursor-pointer dark:!univer-text-gray-300`,
            onClick: handleOpenModal
          }
        ) })
      }
    ) : null,
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
      RangeSelectorDialog,
      {
        initialValue: rangeSelectorRanges,
        unitId,
        subUnitId,
        visible: popupVisible,
        maxRangeCount,
        onConfirm: (ranges) => {
          const resultStr = stringifyRanges(ranges);
          const empty = RichTextBuilder.newEmptyData();
          empty.body.dataStream = resultStr;
          editor == null ? void 0 : editor.replaceText(resultStr, false);
          onChange == null ? void 0 : onChange(empty, resultStr);
          setPopupVisible(false);
          setRangeSelectorRanges([]);
          requestAnimationFrame(() => {
            blurEditor();
          });
        },
        onClose: () => {
          setPopupVisible(false);
          setRangeSelectorRanges([]);
        },
        supportAcrossSheet,
        keepSheetReference,
        onShowBySelection: (ranges) => {
          if (focusing || forceShowDialogWhenSelectionChanged) {
            setRangeSelectorRanges(ranges);
            setPopupVisible(true);
            return false;
          } else {
            return true;
          }
        }
      }
    )
  ] });
}

// ../packages/sheets-formula-ui/src/views/range-selector/Global.tsx
var import_react25 = __toESM(require_react());
var import_jsx_runtime12 = __toESM(require_jsx_runtime());
var GlobalRangeSelector = () => {
  var _a, _b;
  const rangeSelectorService = useDependency(GlobalRangeSelectorService);
  const current = useObservable(rangeSelectorService.currentSelector$);
  const instance = (0, import_react25.useRef)(null);
  (0, import_react25.useEffect)(() => {
    var _a2, _b2;
    if (current) {
      (_b2 = instance.current) == null ? void 0 : _b2.showDialog((_a2 = current.initialValue) != null ? _a2 : []);
      return () => {
        var _a3;
        (_a3 = instance.current) == null ? void 0 : _a3.hideDialog();
      };
    }
  }, [current]);
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
    RangeSelector,
    {
      unitId: (_a = current == null ? void 0 : current.unitId) != null ? _a : "",
      subUnitId: (_b = current == null ? void 0 : current.subUnitId) != null ? _b : "",
      hideEditor: true,
      selectorRef: instance,
      onChange: (_, value) => {
        var _a2;
        current == null ? void 0 : current.callback((_a2 = value == null ? void 0 : value.split(",").map((i) => deserializeRangeWithSheet(i))) != null ? _a2 : []);
      }
    }
  );
};

// ../packages/sheets-formula-ui/src/plugin.ts
var UniverSheetsFormulaUIPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig, _injector, _renderManagerService, _configService, _uiPartsService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_configService", _configService);
    __publicField(this, "_uiPartsService", _uiPartsService);
    const { menu, ...rest } = merge_default(
      defaultPluginConfig,
      this._config
    );
    if (menu) {
      this._configService.setConfig("menu", menu, { merge: true });
    }
    this._configService.setConfig(PLUGIN_CONFIG_KEY_BASE2, rest, { merge: true });
  }
  onStarting() {
    registerDependencies(this._injector, [
      [IFormulaPromptService, { useClass: FormulaPromptService }],
      [GlobalRangeSelectorService],
      [FormulaUIController],
      [FormulaClipboardController],
      [FormulaEditorShowController],
      [FormulaRenderManagerController],
      [FormulaReorderController],
      [ImageFormulaRenderController]
    ]);
    this._initUIPart();
  }
  onReady() {
    [
      [RefSelectionsRenderService]
    ].forEach((dep) => {
      this.disposeWithMe(this._renderManagerService.registerRenderModule(2 /* UNIVER_SHEET */, dep));
    });
  }
  onRendered() {
    [
      [FormulaAlertRenderController]
    ].forEach((dep) => {
      this.disposeWithMe(this._renderManagerService.registerRenderModule(2 /* UNIVER_SHEET */, dep));
    });
    touchDependencies(this._injector, [
      [FormulaUIController],
      // FormulaProgressBar relies on TriggerCalculationController, but it is necessary to ensure that the formula calculation is done after rendered.
      [FormulaClipboardController],
      [FormulaRenderManagerController],
      [ImageFormulaRenderController]
    ]);
  }
  onSteady() {
    this._injector.get(FormulaReorderController);
  }
  _initUIPart() {
    const componentManager = this._injector.get(ComponentManager);
    this.disposeWithMe(componentManager.register(RANGE_SELECTOR_COMPONENT_KEY, RangeSelector));
    this.disposeWithMe(componentManager.register(EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY, FormulaEditor));
    this.disposeWithMe(this._uiPartsService.registerComponent("global" /* GLOBAL */, () => connectInjector(GlobalRangeSelector, this._injector)));
  }
};
__publicField(UniverSheetsFormulaUIPlugin, "pluginName", FORMULA_UI_PLUGIN_NAME);
__publicField(UniverSheetsFormulaUIPlugin, "packageName", package_default.name);
__publicField(UniverSheetsFormulaUIPlugin, "version", package_default.version);
__publicField(UniverSheetsFormulaUIPlugin, "type", 2 /* UNIVER_SHEET */);
UniverSheetsFormulaUIPlugin = __decorateClass([
  DependentOn(UniverSheetsFormulaPlugin),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IRenderManagerService),
  __decorateParam(3, IConfigService),
  __decorateParam(4, IUIPartsService)
], UniverSheetsFormulaUIPlugin);

export {
  GlobalRangeSelectorService,
  FormulaEditor,
  RangeSelector,
  UniverSheetsFormulaUIPlugin
};
