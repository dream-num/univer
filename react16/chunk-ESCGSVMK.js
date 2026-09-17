import {
  CopySheetCommand,
  DataSyncPrimaryController,
  EffectRefRangId,
  IActiveDirtyManagerService,
  INTERCEPTOR_POINT,
  ISheetRowFilteredService,
  InsertColCommand,
  InsertColMutation,
  InsertRowCommand,
  InsertRowMutation,
  MarkDirtyFilterChangeMutation,
  MoveColsMutation,
  MoveRangeCommand,
  MoveRowsCommand,
  RefRangeService,
  RemoveColCommand,
  RemoveColMutation,
  RemoveRowCommand,
  RemoveRowMutation,
  RemoveSheetCommand,
  SetRangeValuesMutation,
  SetWorksheetActiveOperation,
  SheetInterceptorService,
  SheetsSelectionsService,
  ZebraCrossingCacheController,
  expandToContinuousRange,
  getSheetCommandTarget,
  isSingleCellSelection
} from "./chunk-Q6Y4PHRI.js";
import {
  COLOR_BLACK_RGB
} from "./chunk-XOCU2XR6.js";
import {
  BehaviorSubject,
  ColorKit,
  Disposable,
  DisposableCollection,
  ErrorService,
  ICommandService,
  IConfigService,
  IResourceManagerService,
  IUndoRedoService,
  IUniverInstanceService,
  Inject,
  Injector,
  LocaleService,
  Optional,
  Plugin,
  Rectangle,
  Tools,
  createREGEXFromWildChar,
  extractPureTextFromCell,
  filter,
  fromCallback,
  isNumeric,
  merge,
  mergeSets,
  merge_default,
  moveMatrixArray,
  of,
  sequenceExecute,
  switchMap,
  touchDependencies
} from "./chunk-EJSPXROI.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField
} from "./chunk-24OICD5T.js";

// ../packages/sheets-filter/package.json
var package_default = {
  name: "@univerjs/sheets-filter",
  version: "0.25.2",
  private: false,
  description: "Filtering model, commands, and services for Univer Sheets.",
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
    "filter",
    "spreadsheet",
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
    "@univerjs/engine-formula": "workspace:*",
    "@univerjs/engine-render": "workspace:*",
    "@univerjs/rpc": "workspace:*",
    "@univerjs/sheets": "workspace:*"
  },
  devDependencies: {
    "@univerjs-infra/shared": "workspace:*",
    rxjs: "^7.8.2",
    typescript: "^6.0.3",
    vitest: "^4.1.7"
  }
};

// ../packages/sheets-filter/src/config/config.ts
var SHEETS_FILTER_PLUGIN_CONFIG_KEY = "sheets-filter.config";
var configSymbol = Symbol(SHEETS_FILTER_PLUGIN_CONFIG_KEY);
var defaultPluginConfig = {};

// ../packages/sheets-filter/src/common/const.ts
var SetSheetsFilterRangeMutationId = "sheet.mutation.set-filter-range";
var SetSheetsFilterCriteriaMutationId = "sheet.mutation.set-filter-criteria";
var RemoveSheetsFilterMutationId = "sheet.mutation.remove-filter";
var ReCalcSheetsFilterMutationId = "sheet.mutation.re-calc-filter";
var FILTER_MUTATIONS = /* @__PURE__ */ new Set([
  SetSheetsFilterRangeMutationId,
  SetSheetsFilterCriteriaMutationId,
  RemoveSheetsFilterMutationId,
  ReCalcSheetsFilterMutationId
]);

// ../packages/sheets-filter/src/models/types.ts
var CustomFilterOperator = /* @__PURE__ */ ((CustomFilterOperator2) => {
  CustomFilterOperator2["EQUAL"] = "equal";
  CustomFilterOperator2["GREATER_THAN"] = "greaterThan";
  CustomFilterOperator2["GREATER_THAN_OR_EQUAL"] = "greaterThanOrEqual";
  CustomFilterOperator2["LESS_THAN"] = "lessThan";
  CustomFilterOperator2["LESS_THAN_OR_EQUAL"] = "lessThanOrEqual";
  CustomFilterOperator2["NOT_EQUALS"] = "notEqual";
  return CustomFilterOperator2;
})(CustomFilterOperator || {});

// ../packages/sheets-filter/src/models/custom-filters.ts
var greaterThan = {
  operator: "greaterThan" /* GREATER_THAN */,
  fn: (value, compare) => {
    if (!ensureNumber(value)) {
      return false;
    }
    return value > compare;
  }
};
var greaterThanOrEqualTo = {
  operator: "greaterThanOrEqual" /* GREATER_THAN_OR_EQUAL */,
  fn: (value, compare) => {
    if (!ensureNumber(value)) {
      return false;
    }
    return value >= compare;
  }
};
var lessThan = {
  operator: "lessThan" /* LESS_THAN */,
  fn: (value, compare) => {
    if (!ensureNumber(value)) {
      return false;
    }
    return value < compare;
  }
};
var lessThanOrEqualTo = {
  operator: "lessThanOrEqual" /* LESS_THAN_OR_EQUAL */,
  fn: (value, compare) => {
    if (!ensureNumber(value)) {
      return false;
    }
    return value <= compare;
  }
};
var equals = {
  operator: "equal" /* EQUAL */,
  fn: (value, compare) => {
    if (!ensureNumber(value)) {
      return false;
    }
    return value === compare;
  }
};
var notEquals = {
  operator: "notEqual" /* NOT_EQUALS */,
  fn: (value, compare) => {
    if (typeof compare === "string") {
      if (compare === " ") {
        if (value !== void 0 && value !== null) return true;
        return false;
      }
      ;
      const ensuredString = ensureString(value);
      if (ensuredString && isWildCardString(compare)) return !createREGEXFromWildChar(compare).test(ensuredString);
      return ensuredString !== compare;
    }
    if (!ensureNumber(value)) return true;
    return value !== compare;
  }
};
var CustomFilterFnRegistry = /* @__PURE__ */ new Map([]);
var ALL_CUSTOM_FILTER_FUNCTIONS = [greaterThan, greaterThanOrEqualTo, lessThan, lessThanOrEqualTo, equals, notEquals];
ALL_CUSTOM_FILTER_FUNCTIONS.forEach((fn) => {
  CustomFilterFnRegistry.set(fn.operator, fn);
});
function isNumericFilterFn(operator) {
  return !!operator;
}
var textMatch = {
  fn: (value, compare) => {
    const ensured = ensureString(value);
    if (ensured === null) {
      if (compare === "") return true;
      return false;
    }
    return createREGEXFromWildChar(compare).test(ensured);
  }
};
function getCustomFilterFn(operator) {
  if (!operator) {
    return textMatch;
  }
  return CustomFilterFnRegistry.get(operator);
}
function ensureNumber(value) {
  return typeof value === "number";
}
function ensureNumeric(value) {
  if (typeof value === "number") {
    return true;
  }
  ;
  if (typeof value === "string" && isNumeric(value)) {
    return true;
  }
  return false;
}
function ensureString(value) {
  if (typeof value === "boolean" || value == null) {
    return null;
  }
  return typeof value === "string" ? value : value.toString();
}
function isWildCardString(str) {
  if (typeof str === "number") {
    return false;
  }
  return str.indexOf("*") !== -1 || str.indexOf("?") !== -1;
}

// ../packages/sheets-filter/src/models/filter-model.ts
var EMPTY = () => /* @__PURE__ */ new Set();
var FilterModel = class _FilterModel extends Disposable {
  constructor(unitId, subUnitId, _worksheet) {
    super();
    __publicField(this, "unitId", unitId);
    __publicField(this, "subUnitId", subUnitId);
    __publicField(this, "_worksheet", _worksheet);
    __publicField(this, "_filteredOutRows$", new BehaviorSubject(EMPTY()));
    /** An observable value. A set of filtered out rows. */
    __publicField(this, "filteredOutRows$", this._filteredOutRows$.asObservable());
    // TODO: we may need to update which cols have criteria rather than simple boolean
    __publicField(this, "_hasCriteria$", new BehaviorSubject(false));
    __publicField(this, "hasCriteria$", this._hasCriteria$.asObservable());
    __publicField(this, "_filterColumnByIndex", /* @__PURE__ */ new Map());
    __publicField(this, "_alreadyFilteredOutRows", EMPTY());
    __publicField(this, "_range");
  }
  get filteredOutRows() {
    return this._filteredOutRows$.getValue();
  }
  set filteredOutRows(rows) {
    this._alreadyFilteredOutRows = rows;
    this._filteredOutRows$.next(rows);
  }
  dispose() {
    super.dispose();
    this._filteredOutRows$.complete();
    this._hasCriteria$.complete();
    this._worksheet = null;
  }
  /**
   * Serialize this filter model to the JSON format representation.
   */
  serialize() {
    const result = {
      ref: Rectangle.clone(this._range),
      filterColumns: this._getAllFilterColumns(true).sort(([offset1], [offset2]) => offset1 - offset2).map(([_, filterColumn]) => filterColumn.serialize())
    };
    if (this._alreadyFilteredOutRows) {
      result.cachedFilteredOut = Array.from(this._alreadyFilteredOutRows).sort();
    }
    return result;
  }
  /**
   * Deserialize auto filter info to construct a `FilterModel` object.
   * @param unitId workbook id
   * @param subUnitId worksheet id
   * @param worksheet the Worksheet object
   * @param autoFilter auto filter data
   */
  static deserialize(unitId, subUnitId, worksheet, autoFilter) {
    const filterModel = new _FilterModel(unitId, subUnitId, worksheet);
    filterModel._dump(autoFilter);
    return filterModel;
  }
  _dump(autoFilter) {
    var _a;
    this.setRange(autoFilter.ref);
    (_a = autoFilter.filterColumns) == null ? void 0 : _a.filter((filterColumn) => {
      if (!filterColumn.filters && !filterColumn.colorFilters && !filterColumn.customFilters) {
        return false;
      }
      return true;
    }).forEach((filterColumn) => this._setCriteriaWithoutReCalc(filterColumn.colId, filterColumn));
    if (autoFilter.cachedFilteredOut) {
      this._alreadyFilteredOutRows = new Set(autoFilter.cachedFilteredOut);
      this._emit();
    } else if (autoFilter.filterColumns && autoFilter.filterColumns.length > 0) {
      this._reCalcAllColumns();
      this._emit();
    }
    this._emitHasCriteria();
  }
  isRowFiltered(row) {
    return this._alreadyFilteredOutRows.has(row);
  }
  getRange() {
    if (!this._range) {
      throw new Error("[FilterModel] could not get range before a range is set!");
    }
    return this._range;
  }
  /**
   * Get filtered out rows except the specific column. This method is considered as "pure". In
   * another word it would not change `filteredOutRows` on `FilterModel` nor `FilterColumn`.
   * @param col
   */
  getFilteredOutRowsExceptCol(col) {
    return this._getAllFilterColumns(true).filter(([colOffset]) => colOffset !== col).reduce((acc, [, filterColumn]) => {
      const newResult = filterColumn.calc({ getAlreadyFilteredOutRows: () => acc });
      if (newResult) return mergeSets(acc, newResult);
      return acc;
    }, /* @__PURE__ */ new Set());
  }
  /**
   * Set range of the filter model, this would remove some `IFilterColumn`
   * if the new range not overlaps the old range.
   */
  setRange(range) {
    this._range = range;
    this._getAllFilterColumns(true).forEach(([col, filterColumn]) => {
      filterColumn.setRangeAndColumn({
        startRow: range.startRow,
        endRow: range.endRow,
        startColumn: col,
        endColumn: col
      }, col);
    });
  }
  /**
   * Set or remove filter criteria on a specific row.
   */
  setCriteria(col, criteria, reCalc = false) {
    if (!this._range) {
      throw new Error("[FilterModel] could not set criteria before a range is set!");
    }
    if (!criteria) {
      this._removeCriteria(col);
      this._rebuildAlreadyFilteredOutRowsWithCache();
      if (reCalc) {
        this._reCalcAllColumns();
      }
      this._emit();
      this._emitHasCriteria();
      return;
    }
    this._setCriteriaWithoutReCalc(col, criteria);
    if (reCalc) {
      this._rebuildAlreadyFilteredOutRowsWithCache();
      this._getAllFilterColumns().forEach((filterColumn) => filterColumn.__clearCache());
      this._reCalcWithNoCacheColumns();
      this._emit();
      this._emitHasCriteria();
    }
  }
  getAllFilterColumns() {
    return this._getAllFilterColumns(true);
  }
  getFilterColumn(index) {
    var _a;
    return (_a = this._filterColumnByIndex.get(index)) != null ? _a : null;
  }
  reCalc() {
    this._reCalcAllColumns();
    this._emit();
  }
  _getAllFilterColumns(withCol = false) {
    const columns = Array.from(this._filterColumnByIndex.entries());
    if (withCol) {
      return columns;
    }
    return columns.map(([_, filterColumn]) => filterColumn);
  }
  _reCalcAllColumns() {
    this._alreadyFilteredOutRows = EMPTY();
    this._getAllFilterColumns().forEach((filterColumn) => filterColumn.__clearCache());
    this._reCalcWithNoCacheColumns();
  }
  _setCriteriaWithoutReCalc(col, criteria) {
    const range = this._range;
    if (!range) {
      throw new Error("[FilterModel] could not set criteria before a range is set!");
    }
    const { startColumn, endColumn } = range;
    if (col > endColumn || col < startColumn) {
      throw new Error(`[FilterModel] could not set criteria on column ${col} which is out of range!`);
    }
    let filterColumn;
    if (this._filterColumnByIndex.has(col)) {
      filterColumn = this._filterColumnByIndex.get(col);
    } else {
      filterColumn = new FilterColumn(
        this.unitId,
        this.subUnitId,
        this._worksheet,
        criteria,
        { getAlreadyFilteredOutRows: () => this._alreadyFilteredOutRows }
      );
      filterColumn.setRangeAndColumn(range, col);
      this._filterColumnByIndex.set(col, filterColumn);
    }
    filterColumn.setCriteria(criteria);
  }
  _removeCriteria(col) {
    const filterColumn = this._filterColumnByIndex.get(col);
    if (filterColumn) {
      filterColumn.dispose();
      this._filterColumnByIndex.delete(col);
    }
  }
  _emit() {
    this._filteredOutRows$.next(this._alreadyFilteredOutRows);
  }
  _emitHasCriteria() {
    this._hasCriteria$.next(this._filterColumnByIndex.size > 0);
  }
  _rebuildAlreadyFilteredOutRowsWithCache() {
    const newFilteredOutRows = this._getAllFilterColumns().filter((filterColumn) => filterColumn.hasCache()).reduce((acc, filterColumn) => {
      return mergeSets(acc, filterColumn.filteredOutRows);
    }, /* @__PURE__ */ new Set());
    this._alreadyFilteredOutRows = newFilteredOutRows;
  }
  _reCalcWithNoCacheColumns() {
    const noCacheFilteredOutRows = this._getAllFilterColumns().filter((filterColumn) => !filterColumn.hasCache());
    for (const filterColumn of noCacheFilteredOutRows) {
      const filteredRows = filterColumn.reCalc();
      if (filteredRows) {
        this._alreadyFilteredOutRows = mergeSets(this._alreadyFilteredOutRows, filteredRows);
      }
    }
  }
};
var FilterColumn = class extends Disposable {
  constructor(unitId, subUnitId, _worksheet, _criteria, _filterColumnContext) {
    super();
    __publicField(this, "unitId", unitId);
    __publicField(this, "subUnitId", subUnitId);
    __publicField(this, "_worksheet", _worksheet);
    __publicField(this, "_criteria", _criteria);
    __publicField(this, "_filterColumnContext", _filterColumnContext);
    __publicField(this, "_filteredOutRows", null);
    /** Cache the filter function.  */
    __publicField(this, "_filterFn", null);
    __publicField(this, "_range", null);
    __publicField(this, "_column", 0);
    __publicField(this, "_filterBy", 0 /* VALUES */);
  }
  get filteredOutRows() {
    return this._filteredOutRows;
  }
  get filterBy() {
    return this._filterBy;
  }
  dispose() {
    super.dispose();
    this._filteredOutRows = null;
  }
  /**
   * @internal
   */
  __clearCache() {
    this._filteredOutRows = null;
  }
  serialize() {
    if (!this._criteria) {
      throw new Error("[FilterColumn]: could not serialize without a filter column!");
    }
    return Tools.deepClone({
      ...this._criteria,
      colId: this._column
    });
  }
  hasCache() {
    return this._filteredOutRows !== null;
  }
  // The first row should be omitted!
  setRangeAndColumn(range, column) {
    this._range = range;
    this._column = column;
  }
  setCriteria(criteria) {
    this._criteria = criteria;
    this._generateFilterFn();
    this._filteredOutRows = null;
  }
  getColumnData() {
    return Tools.deepClone(this._criteria);
  }
  /**
   * Trigger new calculation on this `FilterModel` instance.
   *
   * @external DO NOT EVER call this method from `FilterColumn` itself. The whole process heavily relies on
   * `filteredOutByOthers`, and it is more comprehensible if we let `FilterModel` take full control over the process.
   */
  reCalc() {
    this._filteredOutRows = this.calc(this._filterColumnContext);
    return this._filteredOutRows;
  }
  calc(context) {
    if (!this._filterFn) {
      throw new Error("[FilterColumn] cannot calculate without a filter fn!");
    }
    if (!this._range) {
      throw new Error("[FilterColumn] cannot calculate without a range!");
    }
    if (typeof this._column !== "number") {
      throw new TypeError("[FilterColumn] cannot calculate without a column offset!");
    }
    const column = this._column;
    const iterateRange = { startColumn: column, endColumn: column, startRow: this._range.startRow + 1, endRow: this._range.endRow };
    const filteredOutRows = /* @__PURE__ */ new Set();
    const filteredOutByOthers = context.getAlreadyFilteredOutRows();
    for (const range of this._worksheet.iterateByColumn(iterateRange, false, false)) {
      const { row, rowSpan, col } = range;
      if (filteredOutByOthers.has(row) && (!rowSpan || rowSpan === 1)) {
        continue;
      }
      const filterResult = this._filterBy === 0 /* VALUES */ ? this._filterFn(extractPureTextFromCell(this._worksheet.getCell(row, col))) : this._filterBy === 1 /* COLORS */ ? this._filterFn(this._worksheet.getComposedCellStyle(row, col)) : this._filterFn(getFilterValueForConditionalFiltering(this._worksheet, row, col));
      if (!filterResult) {
        filteredOutRows.add(row);
        if (rowSpan) {
          for (let i = 1; i < rowSpan; i++) {
            filteredOutRows.add(row + i);
          }
        }
      }
    }
    return filteredOutRows;
  }
  _generateFilterFn() {
    if (!this._criteria) {
      return;
    }
    this._filterFn = generateFilterFn(this._criteria);
    this._filterBy = this._criteria.filters ? 0 /* VALUES */ : this._criteria.colorFilters ? 1 /* COLORS */ : 2 /* CONDITIONS */;
  }
};
function generateFilterFn(column) {
  if (column.filters) {
    return filterByValuesFnFactory(column.filters);
  }
  if (column.colorFilters) {
    return filterByColorsFnFactory(column.colorFilters);
  }
  if (column.customFilters) {
    return customFilterFnFactory(column.customFilters);
  }
  throw new Error("[FilterModel]: other types of filters are not supported yet.");
}
function filterByValuesFnFactory(values) {
  const includeBlank = !!values.blank;
  const valuesSet = new Set(values.filters);
  return (value) => {
    if (value === void 0 || value === "") return includeBlank;
    return valuesSet.has(typeof value === "string" ? value : `${value}`);
  };
}
function filterByColorsFnFactory(colorFilters) {
  if (colorFilters.cellFillColors) {
    const fillColorsSet = new Set(colorFilters.cellFillColors);
    return (cellStyle) => {
      var _a;
      if (!cellStyle || !((_a = cellStyle.bg) == null ? void 0 : _a.rgb)) {
        if (fillColorsSet.has(null)) return true;
        return false;
      }
      const bg = new ColorKit(cellStyle.bg.rgb).toRgbString();
      return fillColorsSet.has(bg);
    };
  }
  if (colorFilters.cellTextColors) {
    const textColorsSet = new Set(colorFilters.cellTextColors);
    return (cellStyle) => {
      var _a;
      if (!cellStyle || !((_a = cellStyle.cl) == null ? void 0 : _a.rgb)) {
        if (textColorsSet.has(COLOR_BLACK_RGB)) return true;
        return false;
      }
      const cl = new ColorKit(cellStyle.cl.rgb).toRgbString();
      return textColorsSet.has(cl);
    };
  }
  throw new Error("[FilterModel]: color filters are not supported yet.");
}
function customFilterFnFactory(customFilters) {
  const customFilterFns = customFilters.customFilters.map((filter2) => generateCustomFilterFn(filter2));
  if (isCompoundCustomFilter(customFilterFns)) {
    if (customFilters.and) {
      return AND(customFilterFns);
    }
    return OR(customFilterFns);
  }
  return customFilterFns[0];
}
function AND(filterFns) {
  const [fn1, fn2] = filterFns;
  return (value) => fn1(value) && fn2(value);
}
function OR(filterFns) {
  const [fn1, fn2] = filterFns;
  return (value) => fn1(value) || fn2(value);
}
function isCompoundCustomFilter(filter2) {
  return filter2.length === 2;
}
function generateCustomFilterFn(filter2) {
  const compare = filter2.val;
  if (filter2.operator === "notEqual" /* NOT_EQUALS */) {
    const ensured = ensureNumeric(compare);
    if (!ensured) return (value) => notEquals.fn(value, compare);
  }
  if (isNumericFilterFn(filter2.operator)) {
    const ensured = ensureNumeric(compare);
    if (!ensured) return () => false;
    const customFilterFn2 = getCustomFilterFn(filter2.operator);
    const ensuredNumber = Number(compare);
    return (value) => customFilterFn2.fn(value, ensuredNumber);
  }
  const customFilterFn = getCustomFilterFn(filter2.operator);
  return (value) => customFilterFn.fn(value, compare);
}
function getFilterValueForConditionalFiltering(worksheet, row, col) {
  const interceptedCell = worksheet.getCell(row, col);
  if (!interceptedCell) return null;
  const rawCell = worksheet.getCellRaw(row, col);
  if (interceptedCell && !rawCell) return extractFilterValueFromCell(interceptedCell);
  if (!rawCell) return null;
  if (interceptedCell.t === 2 /* NUMBER */ && typeof interceptedCell.v === "string") {
    return rawCell.v;
  }
  if (interceptedCell.t === 2 /* NUMBER */) {
    return Number(rawCell.v);
  }
  return extractFilterValueFromCell(rawCell);
}
function extractFilterValueFromCell(cell) {
  var _a, _b;
  const richTextValue = (_b = (_a = cell.p) == null ? void 0 : _a.body) == null ? void 0 : _b.dataStream;
  if (richTextValue) return richTextValue.trimEnd();
  const rawValue = cell.v;
  if (typeof rawValue === "string") {
    if (cell.t === 3 /* BOOLEAN */) return rawValue.toUpperCase();
    return rawValue;
  }
  ;
  if (typeof rawValue === "number") {
    if (cell.t === 3 /* BOOLEAN */) return rawValue ? "TRUE" : "FALSE";
    return rawValue;
  }
  ;
  if (typeof rawValue === "boolean") return rawValue ? "TRUE" : "FALSE";
  return "";
}

// ../packages/sheets-filter/src/services/sheet-filter.service.ts
var SHEET_FILTER_SNAPSHOT_ID = "SHEET_FILTER_PLUGIN";
var SheetsFilterService = class extends Disposable {
  constructor(_resourcesManagerService, _univerInstanceService, _commandService) {
    super();
    __publicField(this, "_resourcesManagerService", _resourcesManagerService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_filterModels", /* @__PURE__ */ new Map());
    __publicField(this, "_loadedUnitId$", new BehaviorSubject(null));
    __publicField(this, "loadedUnitId$", this._loadedUnitId$.asObservable());
    __publicField(this, "_errorMsg$", new BehaviorSubject(null));
    __publicField(this, "errorMsg$", this._errorMsg$.asObservable());
    __publicField(this, "_activeFilterModel$", new BehaviorSubject(null));
    /** An observable value emitting the current Workbook's active Worksheet's filter model (if there is one). */
    __publicField(this, "activeFilterModel$", this._activeFilterModel$.asObservable());
    this._initModel();
    this._initActiveFilterModel();
  }
  /** The current Workbook's active Worksheet's filter model (if there is one). */
  get activeFilterModel() {
    return this._activeFilterModel$.getValue();
  }
  /**
   *
   * @param unitId
   * @param subUnitId
   */
  ensureFilterModel(unitId, subUnitId) {
    const already = this.getFilterModel(unitId, subUnitId);
    if (already) {
      return already;
    }
    const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
    if (!workbook) {
      throw new Error(`[SheetsFilterService]: could not create "FilterModel" on a non-existing workbook ${unitId}!`);
    }
    const worksheet = workbook.getSheetBySheetId(subUnitId);
    if (!worksheet) {
      throw new Error(`[SheetsFilterService]: could not create "FilterModel" on a non-existing worksheet ${subUnitId}!`);
    }
    const filterModel = new FilterModel(unitId, subUnitId, worksheet);
    this._cacheFilterModel(unitId, subUnitId, filterModel);
    return filterModel;
  }
  getFilterModel(unitId, subUnitId) {
    var _a, _b;
    return (_b = (_a = this._filterModels.get(unitId)) == null ? void 0 : _a.get(subUnitId)) != null ? _b : null;
  }
  removeFilterModel(unitId, subUnitId) {
    const already = this.getFilterModel(unitId, subUnitId);
    if (already) {
      already.dispose();
      this._filterModels.get(unitId).delete(subUnitId);
      return true;
    }
    return false;
  }
  setFilterErrorMsg(content) {
    this._errorMsg$.next(content);
  }
  _updateActiveFilterModel() {
    let workbook;
    try {
      workbook = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
      if (!workbook) {
        this._activeFilterModel$.next(null);
        return;
      }
    } catch (err) {
      console.error("[SheetsFilterService]: could not get active workbook!", err);
      return;
    }
    const activeSheet = workbook.getActiveSheet(true);
    if (!activeSheet) {
      this._activeFilterModel$.next(null);
      return;
    }
    const unitId = activeSheet.getUnitId();
    const subUnitId = activeSheet.getSheetId();
    const filterModel = this.getFilterModel(unitId, subUnitId);
    this._activeFilterModel$.next(filterModel);
  }
  _initActiveFilterModel() {
    this.disposeWithMe(
      merge(
        // source1: executing filter related mutations
        fromCallback(this._commandService.onCommandExecuted.bind(this._commandService)).pipe(filter(([command]) => command.type === 2 /* MUTATION */ && FILTER_MUTATIONS.has(command.id))),
        // source2: activate sheet changes
        this._univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */).pipe(switchMap((workbook) => {
          var _a;
          return (_a = workbook == null ? void 0 : workbook.activeSheet$) != null ? _a : of(null);
        }))
      ).subscribe(() => this._updateActiveFilterModel())
    );
  }
  _serializeAutoFiltersForUnit(unitId) {
    const allFilterModels = this._filterModels.get(unitId);
    if (!allFilterModels) {
      return "{}";
    }
    const json = {};
    allFilterModels.forEach((model, worksheetId) => {
      json[worksheetId] = model.serialize();
    });
    return JSON.stringify(json);
  }
  _deserializeAutoFiltersForUnit(unitId, json) {
    const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
    Object.keys(json).forEach((worksheetId) => {
      const autoFilter = json[worksheetId];
      const filterModel = FilterModel.deserialize(unitId, worksheetId, workbook.getSheetBySheetId(worksheetId), autoFilter);
      this._cacheFilterModel(unitId, worksheetId, filterModel);
    });
  }
  dispose() {
    super.dispose();
    this._loadedUnitId$.complete();
    this._errorMsg$.complete();
    this._activeFilterModel$.complete();
    this._filterModels.forEach((allFilterModels) => {
      allFilterModels.forEach((model) => model.dispose());
      allFilterModels.clear();
    });
    this._filterModels.clear();
  }
  _initModel() {
    this._resourcesManagerService.registerPluginResource({
      pluginName: SHEET_FILTER_SNAPSHOT_ID,
      businesses: [2 /* UNIVER_SHEET */],
      toJson: (id) => this._serializeAutoFiltersForUnit(id),
      parseJson: (json) => JSON.parse(json),
      onLoad: (unitId, value) => {
        this._deserializeAutoFiltersForUnit(unitId, value);
        this._loadedUnitId$.next(unitId);
        this._updateActiveFilterModel();
      },
      onUnLoad: (unitId) => {
        const allFilterModels = this._filterModels.get(unitId);
        if (allFilterModels) {
          allFilterModels.forEach((model) => model.dispose());
          this._filterModels.delete(unitId);
        }
      }
    });
  }
  _cacheFilterModel(unitId, subUnitId, filterModel) {
    if (!this._filterModels.has(unitId)) {
      this._filterModels.set(unitId, /* @__PURE__ */ new Map());
    }
    this._filterModels.get(unitId).set(subUnitId, filterModel);
  }
};
SheetsFilterService = __decorateClass([
  __decorateParam(0, IResourceManagerService),
  __decorateParam(1, IUniverInstanceService),
  __decorateParam(2, ICommandService)
], SheetsFilterService);

// ../packages/sheets-filter/src/commands/mutations/sheets-filter.mutation.ts
var SetSheetsFilterRangeMutation = {
  id: SetSheetsFilterRangeMutationId,
  type: 2 /* MUTATION */,
  handler: (accessor, params) => {
    const { subUnitId, unitId, range } = params;
    const sheetsFilterService = accessor.get(SheetsFilterService);
    const filterModel = sheetsFilterService.ensureFilterModel(unitId, subUnitId);
    filterModel.setRange(range);
    return true;
  }
};
var SetSheetsFilterCriteriaMutation = {
  id: SetSheetsFilterCriteriaMutationId,
  type: 2 /* MUTATION */,
  handler: (accessor, params) => {
    const { subUnitId, unitId, criteria, col, reCalc = true } = params;
    const sheetsFilterService = accessor.get(SheetsFilterService);
    const filterModel = sheetsFilterService.getFilterModel(unitId, subUnitId);
    if (!filterModel) return false;
    filterModel.setCriteria(col, criteria, reCalc);
    return true;
  }
};
var RemoveSheetsFilterMutation = {
  id: RemoveSheetsFilterMutationId,
  type: 2 /* MUTATION */,
  handler: (accessor, params) => {
    const { unitId, subUnitId } = params;
    const sheetsFilterService = accessor.get(SheetsFilterService);
    return sheetsFilterService.removeFilterModel(unitId, subUnitId);
  }
};
var ReCalcSheetsFilterMutation = {
  id: ReCalcSheetsFilterMutationId,
  type: 2 /* MUTATION */,
  handler: (accessor, params) => {
    const { unitId, subUnitId } = params;
    const sheetsFilterService = accessor.get(SheetsFilterService);
    const filterModel = sheetsFilterService.getFilterModel(unitId, subUnitId);
    if (!filterModel) {
      return false;
    }
    filterModel.reCalc();
    return true;
  }
};

// ../packages/sheets-filter/src/commands/commands/sheets-filter.command.ts
var SetSheetFilterRangeCommand = {
  id: "sheet.command.set-filter-range",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    const sheetsFilterService = accessor.get(SheetsFilterService);
    const commandService = accessor.get(ICommandService);
    const undoRedoService = accessor.get(IUndoRedoService);
    const instanceSrv = accessor.get(IUniverInstanceService);
    const { unitId, subUnitId, range } = params;
    const commandTarget = getSheetCommandTarget(instanceSrv, params);
    if (!commandTarget) return false;
    const filterModel = sheetsFilterService.getFilterModel(unitId, subUnitId);
    if (filterModel) return false;
    if (range.endRow === range.startRow) {
      const errorService = accessor.get(ErrorService);
      const localeService = accessor.get(LocaleService);
      errorService.emit(localeService.t("sheets-filter.command.not-valid-filter-range"));
      return false;
    }
    const redoMutation = { id: SetSheetsFilterRangeMutation.id, params: { unitId, subUnitId, range } };
    const result = commandService.syncExecuteCommand(redoMutation.id, redoMutation.params);
    if (result) {
      undoRedoService.pushUndoRedo({
        unitID: unitId,
        undoMutations: [{ id: RemoveSheetsFilterMutation.id, params: { unitId, subUnitId } }],
        redoMutations: [redoMutation]
      });
    }
    return result;
  }
};
var RemoveSheetFilterCommand = {
  id: "sheet.command.remove-sheet-filter",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), params);
    if (!target) return false;
    const sheetsFilterService = accessor.get(SheetsFilterService);
    const { unitId, subUnitId } = target;
    const filterModel = sheetsFilterService.getFilterModel(unitId, subUnitId);
    if (!filterModel) return false;
    const filterRange = filterModel.getRange();
    if (!filterRange) return false;
    const commandService = accessor.get(ICommandService);
    const undoRedoService = accessor.get(IUndoRedoService);
    const autoFilter = filterModel.serialize();
    const undoMutations = destructFilterModel(unitId, subUnitId, autoFilter);
    const result = commandService.syncExecuteCommand(RemoveSheetsFilterMutation.id, { unitId, subUnitId });
    if (result) {
      undoRedoService.pushUndoRedo({
        unitID: unitId,
        undoMutations,
        redoMutations: [{ id: RemoveSheetsFilterMutation.id, params: { unitId, subUnitId } }]
      });
      commandService.executeCommand(MarkDirtyFilterChangeMutation.id, {
        unitId,
        subUnitId,
        filterRange
      });
    }
    return result;
  }
};
var SmartToggleSheetsFilterCommand = {
  id: "sheet.command.smart-toggle-filter",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const sheetsFilterService = accessor.get(SheetsFilterService);
    const commandService = accessor.get(ICommandService);
    const currentWorkbook = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    const currentWorksheet = currentWorkbook == null ? void 0 : currentWorkbook.getActiveSheet();
    if (!currentWorksheet || !currentWorkbook) return false;
    const unitId = currentWorkbook.getUnitId();
    const subUnitId = currentWorksheet.getSheetId();
    const filterModel = sheetsFilterService.getFilterModel(unitId, subUnitId);
    if (filterModel) {
      return commandService.executeCommand(RemoveSheetFilterCommand.id, { unitId, subUnitId });
    }
    const selectionManager = accessor.get(SheetsSelectionsService);
    const lastSelection = selectionManager.getCurrentLastSelection();
    if (!lastSelection) return false;
    const startRange = lastSelection.range;
    const targetFilterRange = (
      // If the selection is a single cell, we should expand it to a continuous range in all directions.
      isSingleCellSelection(lastSelection) ? expandToContinuousRange(startRange, { left: true, right: true, up: true, down: true }, currentWorksheet) : startRange.startRow === startRange.endRow ? expandToContinuousRange(startRange, { down: true }, currentWorksheet) : startRange
    );
    return commandService.executeCommand(SetSheetFilterRangeCommand.id, {
      unitId,
      subUnitId,
      range: targetFilterRange
    });
  }
};
var SetSheetsFilterCriteriaCommand = {
  id: "sheet.command.set-filter-criteria",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), params);
    if (!target) return false;
    const sheetsFilterService = accessor.get(SheetsFilterService);
    const { unitId, subUnitId } = target;
    const filterModel = sheetsFilterService.getFilterModel(unitId, subUnitId);
    if (!filterModel) return false;
    const { col, criteria } = params;
    const filterRange = filterModel.getRange();
    if (!filterRange || col < filterRange.startColumn || col > filterRange.endColumn) return false;
    const commandService = accessor.get(ICommandService);
    const undoRedoService = accessor.get(IUndoRedoService);
    const filterColumn = filterModel.getFilterColumn(col);
    const undoMutation = destructFilterColumn(unitId, subUnitId, col, filterColumn);
    const redoMutation = {
      id: SetSheetsFilterCriteriaMutation.id,
      params: {
        unitId,
        subUnitId,
        col,
        criteria
      }
    };
    const result = commandService.syncExecuteCommand(redoMutation.id, redoMutation.params);
    if (result) {
      undoRedoService.pushUndoRedo({
        unitID: unitId,
        undoMutations: [undoMutation],
        redoMutations: [redoMutation]
      });
      commandService.executeCommand(MarkDirtyFilterChangeMutation.id, {
        unitId,
        subUnitId,
        filterRange
      });
    }
    return result;
  }
};
var ClearSheetsFilterCriteriaCommand = {
  id: "sheet.command.clear-filter-criteria",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), params);
    if (!target) return false;
    const sheetsFilterService = accessor.get(SheetsFilterService);
    const { unitId, subUnitId } = target;
    const filterModel = sheetsFilterService.getFilterModel(unitId, subUnitId);
    if (!filterModel) return false;
    const filterRange = filterModel.getRange();
    if (!filterRange) return false;
    const undoRedoService = accessor.get(IUndoRedoService);
    const commandService = accessor.get(ICommandService);
    const autoFilter = filterModel.serialize();
    const undoMutations = destructFilterCriteria(unitId, subUnitId, autoFilter);
    const redoMutations = generateRemoveCriteriaMutations(unitId, subUnitId, autoFilter);
    const result = sequenceExecute(redoMutations, commandService);
    if (result.result) {
      undoRedoService.pushUndoRedo({
        unitID: unitId,
        undoMutations,
        redoMutations
      });
      commandService.executeCommand(MarkDirtyFilterChangeMutation.id, {
        unitId,
        subUnitId,
        filterRange
      });
      return true;
    }
    return false;
  }
};
var ReCalcSheetsFilterCommand = {
  id: "sheet.command.re-calc-filter",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    const sheetsFilterService = accessor.get(SheetsFilterService);
    const commandService = accessor.get(ICommandService);
    const instanceSrv = accessor.get(IUniverInstanceService);
    const commandTarget = getSheetCommandTarget(instanceSrv, params);
    if (!commandTarget) return false;
    const { unitId, subUnitId } = commandTarget;
    const filterModel = sheetsFilterService.getFilterModel(commandTarget.unitId, commandTarget.subUnitId);
    if (!filterModel) return false;
    return commandService.executeCommand(ReCalcSheetsFilterMutation.id, { unitId, subUnitId });
  }
};
function destructFilterModel(unitId, subUnitId, autoFilter) {
  const mutations = [];
  const setFilterMutation = {
    id: SetSheetsFilterRangeMutation.id,
    params: {
      unitId,
      subUnitId,
      range: autoFilter.ref
    }
  };
  mutations.push(setFilterMutation);
  const criteriaMutations = destructFilterCriteria(unitId, subUnitId, autoFilter);
  criteriaMutations.forEach((m) => mutations.push(m));
  return mutations;
}
function destructFilterCriteria(unitId, subUnitId, autoFilter) {
  var _a;
  const mutations = [];
  (_a = autoFilter.filterColumns) == null ? void 0 : _a.forEach((filterColumn) => {
    const setFilterCriteriaMutation = {
      id: SetSheetsFilterCriteriaMutation.id,
      params: {
        unitId,
        subUnitId,
        col: filterColumn.colId,
        criteria: filterColumn
      }
    };
    mutations.push(setFilterCriteriaMutation);
  });
  return mutations;
}
function generateRemoveCriteriaMutations(unitId, subUnitId, autoFilter) {
  var _a;
  const mutations = [];
  (_a = autoFilter.filterColumns) == null ? void 0 : _a.forEach((filterColumn) => {
    const removeFilterCriteriaMutation = {
      id: SetSheetsFilterCriteriaMutation.id,
      params: {
        unitId,
        subUnitId,
        col: filterColumn.colId,
        criteria: null
      }
    };
    mutations.push(removeFilterCriteriaMutation);
  });
  return mutations;
}
function destructFilterColumn(unitId, subUnitId, colId, filterColumn) {
  if (!filterColumn) {
    return {
      id: SetSheetsFilterCriteriaMutation.id,
      params: {
        unitId,
        subUnitId,
        col: colId,
        criteria: null
      }
    };
  }
  const serialize = filterColumn.serialize();
  return {
    id: SetSheetsFilterCriteriaMutation.id,
    params: {
      unitId,
      subUnitId,
      col: colId,
      criteria: serialize
    }
  };
}

// ../packages/sheets-filter/src/utils.ts
function objectsShaker(target, isEqual) {
  for (let i = 0; i < target.length; i++) {
    let cur = i;
    if (target[i]) {
      for (let j = i + 1; j < target.length; j++) {
        if (target[cur] && target[j] && isEqual(target[cur], target[j])) {
          target[cur] = null;
          cur = j;
        }
      }
    }
  }
  return target.filter((o) => o !== null);
}
function mergeSetFilterCriteria(mutations) {
  return objectsShaker(mutations, (o1, o2) => o1.id === SetSheetsFilterCriteriaMutation.id && o2.id === SetSheetsFilterCriteriaMutation.id && o1.params.unitId === o2.params.unitId && o1.params.subUnitId === o2.params.subUnitId && o1.params.col === o2.params.col);
}

// ../packages/sheets-filter/src/controllers/sheets-filter.controller.ts
var SheetsFilterController = class extends Disposable {
  constructor(_commandService, _sheetInterceptorService, _sheetsFilterService, _univerInstanceService, _refRangeService, _dataSyncPrimaryController, _zebraCrossingCacheController) {
    super();
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_sheetsFilterService", _sheetsFilterService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_refRangeService", _refRangeService);
    __publicField(this, "_dataSyncPrimaryController", _dataSyncPrimaryController);
    __publicField(this, "_zebraCrossingCacheController", _zebraCrossingCacheController);
    __publicField(this, "_disposableCollection", new DisposableCollection());
    this._initCommands();
    this._initRowFilteredInterceptor();
    this._initInterceptors();
    this._commandExecutedListener();
    this._initErrorHandling();
    this._initZebraCrossingCacheListener();
  }
  _initZebraCrossingCacheListener() {
    this.disposeWithMe(
      this._sheetsFilterService.activeFilterModel$.subscribe((filterModel) => {
        if (!filterModel) return;
        this.disposeWithMe(
          filterModel.filteredOutRows$.subscribe(() => {
            this._zebraCrossingCacheController.updateZebraCrossingCache(filterModel.unitId, filterModel.subUnitId);
          })
        );
      })
    );
  }
  _initCommands() {
    [
      SetSheetFilterRangeCommand,
      RemoveSheetFilterCommand,
      SetSheetsFilterCriteriaCommand,
      ClearSheetsFilterCriteriaCommand,
      ReCalcSheetsFilterCommand
    ].forEach((command) => {
      this.disposeWithMe(this._commandService.registerCommand(command));
    });
    [
      SetSheetsFilterCriteriaMutation,
      SetSheetsFilterRangeMutation,
      ReCalcSheetsFilterMutation,
      RemoveSheetsFilterMutation
    ].forEach((command) => {
      var _a;
      this.disposeWithMe(this._commandService.registerCommand(command));
      (_a = this._dataSyncPrimaryController) == null ? void 0 : _a.registerSyncingMutations(command);
    });
  }
  _initInterceptors() {
    this.disposeWithMe(this._sheetInterceptorService.interceptCommand({
      getMutations: (command) => this._getUpdateFilter(command)
    }));
    this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
      if (commandInfo.id === SetWorksheetActiveOperation.id) {
        const params = commandInfo.params;
        const sheetId = params.subUnitId;
        const unitId = params.unitId;
        if (!sheetId || !unitId) {
          return;
        }
        this._registerRefRange(unitId, sheetId);
      }
      if (commandInfo.id === SetSheetsFilterRangeMutation.id) {
        const params = commandInfo.params;
        const sheetId = params.subUnitId;
        const unitId = params.unitId;
        if (!sheetId || !unitId) {
          return;
        }
        this._registerRefRange(params.unitId, params.subUnitId);
      }
    }));
    this.disposeWithMe(this._sheetsFilterService.loadedUnitId$.subscribe((unitId) => {
      if (unitId) {
        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
        const sheet = workbook == null ? void 0 : workbook.getActiveSheet();
        if (sheet) {
          this._registerRefRange(unitId, sheet.getSheetId());
        }
      }
    }));
  }
  _registerRefRange(unitId, subUnitId) {
    var _a;
    this._disposableCollection.dispose();
    const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
    const workSheet = workbook == null ? void 0 : workbook.getSheetBySheetId(subUnitId);
    if (!workbook || !workSheet) return;
    const range = (_a = this._sheetsFilterService.getFilterModel(unitId, subUnitId)) == null ? void 0 : _a.getRange();
    const handler = (config) => {
      switch (config.id) {
        case InsertRowCommand.id: {
          const params = config.params;
          const _unitId = params.unitId || unitId;
          const _subUnitId = params.subUnitId || subUnitId;
          return this._handleInsertRowCommand(params, _unitId, _subUnitId);
        }
        case InsertColCommand.id: {
          const params = config.params;
          const _unitId = params.unitId || unitId;
          const _subUnitId = params.subUnitId || subUnitId;
          return this.handleInsertColCommand(params.range, _unitId, _subUnitId);
        }
        case RemoveColCommand.id: {
          const params = config.params;
          return this.handleRemoveColCommand(params.range, unitId, subUnitId);
        }
        case RemoveRowCommand.id: {
          const params = config.params;
          return this._handleRemoveRowCommand(params, unitId, subUnitId);
        }
        case EffectRefRangId.MoveColsCommandId: {
          const params = config.params;
          return this.handleMoveColsCommand({
            fromRange: params.fromRange,
            toRange: params.toRange
          }, unitId, subUnitId);
        }
        case EffectRefRangId.MoveRowsCommandId: {
          const params = config.params;
          return this._handleMoveRowsCommand(params, unitId, subUnitId);
        }
        case MoveRangeCommand.id: {
          const params = config.params;
          return this._handleMoveRangeCommand(params, unitId, subUnitId);
        }
      }
      return { redos: [], undos: [] };
    };
    if (range) {
      this._disposableCollection.add(this._refRangeService.registerRefRange(range, handler, unitId, subUnitId));
    }
  }
  _getUpdateFilter(command) {
    const { id } = command;
    switch (id) {
      case RemoveSheetCommand.id: {
        const params = command.params;
        return this._handleRemoveSheetCommand(params, params.unitId, params.subUnitId);
      }
      case CopySheetCommand.id: {
        const params = command.params;
        const { targetSubUnitId, unitId, subUnitId } = params;
        if (!unitId || !subUnitId || !targetSubUnitId) {
          return this._handleNull();
        }
        return this._handleCopySheetCommand(unitId, subUnitId, targetSubUnitId);
      }
    }
    return {
      redos: [],
      undos: []
    };
  }
  handleInsertColCommand(range, unitId, subUnitId) {
    var _a;
    const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
    const filterRange = (_a = filterModel == null ? void 0 : filterModel.getRange()) != null ? _a : null;
    if (!filterModel || !filterRange) {
      return this._handleNull();
    }
    const { startColumn, endColumn } = filterRange;
    const { startColumn: insertStartColumn, endColumn: insertEndColumn } = range;
    const count = insertEndColumn - insertStartColumn + 1;
    if (insertEndColumn > endColumn) {
      return this._handleNull();
    }
    const redos = [];
    const undos = [];
    const anchor = insertStartColumn;
    const setFilterRangeMutationParams = {
      unitId,
      subUnitId,
      range: {
        ...filterRange,
        startColumn: insertStartColumn <= startColumn ? startColumn + count : startColumn,
        endColumn: endColumn + count
      }
    };
    const undoSetFilterRangeMutationParams = {
      unitId,
      subUnitId,
      range: filterRange
    };
    redos.push({ id: SetSheetsFilterRangeMutation.id, params: setFilterRangeMutationParams });
    undos.push({ id: SetSheetsFilterRangeMutation.id, params: undoSetFilterRangeMutationParams });
    const filterColumn = filterModel.getAllFilterColumns();
    const effected = filterColumn.filter((column) => column[0] >= anchor);
    if (effected.length !== 0) {
      const { newRange, oldRange } = this._moveCriteria(unitId, subUnitId, effected, count);
      redos.push(...oldRange.redos, ...newRange.redos);
      undos.push(...newRange.undos, ...oldRange.undos);
    }
    return { redos: mergeSetFilterCriteria(redos), undos: mergeSetFilterCriteria(undos) };
  }
  _handleInsertRowCommand(config, unitId, subUnitId) {
    var _a;
    const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
    const filterRange = (_a = filterModel == null ? void 0 : filterModel.getRange()) != null ? _a : null;
    if (!filterModel || !filterRange) {
      return this._handleNull();
    }
    const { startRow, endRow } = filterRange;
    const { startRow: insertStartRow, endRow: insertEndRow } = config.range;
    const rowCount = insertEndRow - insertStartRow + 1;
    if (insertEndRow > endRow) {
      return this._handleNull();
    }
    const redos = [];
    const undos = [];
    const setFilterRangeParams = {
      unitId,
      subUnitId,
      range: {
        ...filterRange,
        startRow: insertStartRow <= startRow ? startRow + rowCount : startRow,
        endRow: endRow + rowCount
      }
    };
    const undoSetFilterRangeMutationParams = {
      unitId,
      subUnitId,
      range: filterRange
    };
    redos.push({ id: SetSheetsFilterRangeMutation.id, params: setFilterRangeParams });
    undos.push({ id: SetSheetsFilterRangeMutation.id, params: undoSetFilterRangeMutationParams });
    return {
      redos: mergeSetFilterCriteria(redos),
      undos: mergeSetFilterCriteria(undos)
    };
  }
  handleRemoveColCommand(range, unitId, subUnitId) {
    var _a;
    const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
    const filterRange = (_a = filterModel == null ? void 0 : filterModel.getRange()) != null ? _a : null;
    if (!filterModel || !filterRange) {
      return this._handleNull();
    }
    const { startColumn, endColumn } = filterRange;
    const { startColumn: removeStartColumn, endColumn: removeEndColumn } = range;
    if (removeStartColumn > endColumn) {
      return this._handleNull();
    }
    const redos = [];
    const undos = [];
    const rangeRemoveCount = removeEndColumn < startColumn ? 0 : Math.min(removeEndColumn, endColumn) - Math.max(removeStartColumn, startColumn) + 1;
    const removeCount = removeEndColumn - removeStartColumn + 1;
    const filterColumn = filterModel.getAllFilterColumns();
    filterColumn.forEach((column) => {
      const [col, filter2] = column;
      if (col <= removeEndColumn && col >= removeStartColumn) {
        redos.push({ id: SetSheetsFilterCriteriaMutation.id, params: { unitId, subUnitId, col, criteria: null } });
        undos.push({ id: SetSheetsFilterCriteriaMutation.id, params: { unitId, subUnitId, col, criteria: { ...filter2.serialize(), colId: col } } });
      }
    });
    const shifted = filterColumn.filter((column) => {
      const [col, _] = column;
      return col > removeEndColumn;
    });
    let newRangeCriteria = { undos: [], redos: [] };
    if (shifted.length > 0) {
      const { oldRange, newRange } = this._moveCriteria(unitId, subUnitId, shifted, -removeCount);
      newRangeCriteria = newRange;
      redos.push(...oldRange.redos);
      undos.unshift(...oldRange.undos);
    }
    if (rangeRemoveCount === endColumn - startColumn + 1) {
      const removeFilterRangeMutationParams = {
        unitId,
        subUnitId
      };
      redos.push({ id: RemoveSheetsFilterMutation.id, params: removeFilterRangeMutationParams });
      undos.unshift({ id: SetSheetsFilterRangeMutation.id, params: { range: filterRange, unitId, subUnitId } });
    } else {
      const newStartColumn = startColumn <= removeStartColumn ? startColumn : rangeRemoveCount === 0 ? startColumn - removeCount : removeStartColumn;
      const newEndColumn = startColumn <= removeStartColumn ? endColumn - rangeRemoveCount : endColumn - removeCount;
      const setFilterRangeMutationParams = {
        unitId,
        subUnitId,
        range: { ...filterRange, startColumn: newStartColumn, endColumn: newEndColumn }
      };
      redos.push({ id: SetSheetsFilterRangeMutation.id, params: setFilterRangeMutationParams });
      undos.unshift({ id: SetSheetsFilterRangeMutation.id, params: { range: filterRange, unitId, subUnitId } });
      redos.push(...newRangeCriteria.redos);
      undos.unshift(...newRangeCriteria.undos);
    }
    return {
      undos,
      redos
    };
  }
  _handleRemoveRowCommand(config, unitId, subUnitId) {
    var _a;
    const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
    if (!filterModel) {
      return this._handleNull();
    }
    const filterRange = filterModel.getRange();
    const { startRow, endRow } = filterRange;
    const { startRow: removeStartRow, endRow: removeEndRow } = config.range;
    if (removeStartRow > endRow) {
      return this._handleNull();
    }
    if (removeEndRow < startRow) {
      return {
        undos: [{ id: SetSheetsFilterRangeMutation.id, params: { range: filterRange, unitId, subUnitId } }],
        redos: [{
          id: SetSheetsFilterRangeMutation.id,
          params: {
            range: {
              ...filterRange,
              startRow: startRow - (removeEndRow - removeStartRow + 1),
              endRow: endRow - (removeEndRow - removeStartRow + 1)
            },
            unitId,
            subUnitId
          }
        }]
      };
    }
    const redos = [];
    const undos = [];
    const filterColumn = filterModel.getAllFilterColumns();
    const filterHeaderIsRemoved = startRow <= removeEndRow && startRow >= removeStartRow;
    undos.push({ id: SetSheetsFilterRangeMutation.id, params: { range: filterRange, unitId, subUnitId } });
    const count = Math.min(removeEndRow, endRow) - Math.max(removeStartRow, startRow) + 1;
    if (count === endRow - startRow + 1 || filterHeaderIsRemoved) {
      const removeFilterRangeMutationParams = {
        unitId,
        subUnitId
      };
      redos.push({ id: RemoveSheetsFilterMutation.id, params: removeFilterRangeMutationParams });
      filterColumn.forEach((column) => {
        const [offset, filter2] = column;
        const setCriteriaMutationParams = {
          unitId,
          subUnitId,
          col: offset,
          criteria: { ...filter2.serialize(), colId: offset }
        };
        undos.push({ id: SetSheetsFilterCriteriaMutation.id, params: setCriteriaMutationParams });
      });
    } else {
      const worksheet = (_a = this._univerInstanceService.getUniverSheetInstance(unitId)) == null ? void 0 : _a.getSheetBySheetId(subUnitId);
      if (!worksheet) {
        return this._handleNull();
      }
      const hiddenRowCount = this._getFilteredRowCount(worksheet, removeStartRow, removeEndRow);
      const afterStartRow = Math.min(startRow, removeStartRow);
      const afterEndRow = afterStartRow + (endRow - startRow) - count + hiddenRowCount;
      const setFilterRangeMutationParams = {
        unitId,
        subUnitId,
        range: {
          ...filterRange,
          startRow: afterStartRow,
          endRow: afterEndRow
        }
      };
      redos.push({ id: SetSheetsFilterRangeMutation.id, params: setFilterRangeMutationParams });
    }
    return {
      undos: mergeSetFilterCriteria(undos),
      redos: mergeSetFilterCriteria(redos)
    };
  }
  _getFilteredRowCount(worksheet, startRow, endRow) {
    let count = 0;
    for (let row = startRow; row <= endRow; row++) {
      if (worksheet.getRowFiltered(row)) {
        count++;
      }
    }
    return count;
  }
  // eslint-disable-next-line max-lines-per-function
  handleMoveColsCommand({ fromRange, toRange }, unitId, subUnitId) {
    var _a;
    const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
    const filterRange = (_a = filterModel == null ? void 0 : filterModel.getRange()) != null ? _a : null;
    if (!filterModel || !filterRange) {
      return this._handleNull();
    }
    const { startColumn, endColumn } = filterRange;
    if (fromRange.endColumn < startColumn && toRange.startColumn <= startColumn || fromRange.startColumn > endColumn && toRange.endColumn > endColumn) {
      return this._handleNull();
    }
    const redos = [];
    const undos = [];
    const filterCol = {};
    for (let col = startColumn; col <= endColumn; col++) {
      filterCol[col] = {
        colIndex: col,
        filter: filterModel.getFilterColumn(col)
      };
    }
    moveMatrixArray(fromRange.startColumn, fromRange.endColumn - fromRange.startColumn + 1, toRange.startColumn, filterCol);
    let startBorder = filterRange.startColumn;
    let endBorder = filterRange.endColumn;
    if (startColumn >= fromRange.startColumn && startColumn <= fromRange.endColumn && toRange.startColumn > fromRange.startColumn && fromRange.endColumn < endColumn) {
      startBorder = fromRange.endColumn + 1;
    }
    if (endColumn >= fromRange.startColumn && endColumn <= fromRange.endColumn && toRange.startColumn < fromRange.startColumn && fromRange.startColumn > startColumn) {
      endBorder = fromRange.startColumn - 1;
    }
    const numberCols = Object.keys(filterCol).map((col) => Number(col));
    const newEnd = numberCols.find((col) => filterCol[col].colIndex === endBorder);
    const newStart = numberCols.find((col) => filterCol[col].colIndex === startBorder);
    numberCols.forEach((col) => {
      var _a2, _b;
      const { colIndex: oldColIndex, filter: filter2 } = filterCol[col];
      const newColIndex = col;
      if (filter2) {
        if (newColIndex >= newStart && newColIndex <= newEnd) {
          const setCriteriaMutationParams = {
            unitId,
            subUnitId,
            col: newColIndex,
            criteria: { ...filter2.serialize(), colId: newColIndex }
          };
          const undoSetCriteriaMutationParams = {
            unitId,
            subUnitId,
            col: newColIndex,
            criteria: filterModel.getFilterColumn(newColIndex) ? { ...(_a2 = filterModel.getFilterColumn(newColIndex)) == null ? void 0 : _a2.serialize(), colId: newColIndex } : null
          };
          redos.push({ id: SetSheetsFilterCriteriaMutation.id, params: setCriteriaMutationParams });
          undos.push({ id: SetSheetsFilterCriteriaMutation.id, params: undoSetCriteriaMutationParams });
        }
        if (!((_b = filterCol[oldColIndex]) == null ? void 0 : _b.filter)) {
          const setCriteriaMutationParams = {
            unitId,
            subUnitId,
            col: oldColIndex,
            criteria: null
          };
          redos.push({ id: SetSheetsFilterCriteriaMutation.id, params: setCriteriaMutationParams });
          undos.push({ id: SetSheetsFilterCriteriaMutation.id, params: { unitId, subUnitId, col: oldColIndex, criteria: { ...filter2.serialize(), colId: oldColIndex } } });
        }
      }
    });
    if (startColumn !== newStart || endColumn !== newEnd) {
      const setFilterRangeMutationParams = {
        unitId,
        subUnitId,
        range: {
          ...filterRange,
          startColumn: newStart,
          endColumn: newEnd
        }
      };
      redos.unshift({ id: SetSheetsFilterRangeMutation.id, params: setFilterRangeMutationParams });
      undos.unshift({ id: SetSheetsFilterRangeMutation.id, params: { range: filterRange, unitId, subUnitId } });
    }
    return {
      undos,
      redos
    };
  }
  _handleMoveRowsCommand(config, unitId, subUnitId) {
    var _a;
    const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
    const filterRange = (_a = filterModel == null ? void 0 : filterModel.getRange()) != null ? _a : null;
    if (!filterModel || !filterRange) {
      return this._handleNull();
    }
    const { startRow, endRow } = filterRange;
    const { fromRange, toRange } = config;
    if (fromRange.endRow < startRow && toRange.startRow <= startRow || fromRange.startRow > endRow && toRange.endRow > endRow) {
      return this._handleNull();
    }
    const redos = [];
    const undos = [];
    const filterRow = {};
    for (let row = startRow; row <= endRow; row++) {
      filterRow[row] = {
        oldIndex: row
      };
    }
    const startBorder = startRow;
    let endBorder = endRow;
    if (endRow >= fromRange.startRow && endRow <= fromRange.endRow && toRange.startRow < fromRange.startRow && fromRange.startRow > startRow) {
      endBorder = fromRange.startRow - 1;
    }
    moveMatrixArray(fromRange.startRow, fromRange.endRow - fromRange.startRow + 1, toRange.startRow, filterRow);
    const numberRows = Object.keys(filterRow).map((row) => Number(row));
    const newEnd = numberRows.find((row) => filterRow[row].oldIndex === endBorder);
    const newStart = numberRows.find((row) => filterRow[row].oldIndex === startBorder);
    if (startRow !== newStart || endRow !== newEnd) {
      const setFilterRangeMutationParams = {
        unitId,
        subUnitId,
        range: {
          ...filterRange,
          startRow: newStart,
          endRow: newEnd
        }
      };
      redos.push({ id: SetSheetsFilterRangeMutation.id, params: setFilterRangeMutationParams }, { id: ReCalcSheetsFilterMutation.id, params: { unitId, subUnitId } });
      undos.push({ id: SetSheetsFilterRangeMutation.id, params: { range: filterRange, unitId, subUnitId } }, { id: ReCalcSheetsFilterMutation.id, params: { unitId, subUnitId } });
    }
    return {
      redos,
      undos
    };
  }
  _handleMoveRangeCommand(config, unitId, subUnitId) {
    const { fromRange, toRange } = config;
    const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
    if (!filterModel) {
      return this._handleNull();
    }
    const filterRange = filterModel.getRange();
    if (!filterRange) {
      return this._handleNull();
    }
    const redos = [];
    const undos = [];
    if (Rectangle.contains(fromRange, filterRange)) {
      const rowOffset = filterRange.startRow - fromRange.startRow;
      const colOffset = filterRange.startColumn - fromRange.startColumn;
      const newFilterRange = {
        startRow: toRange.startRow + rowOffset,
        startColumn: toRange.startColumn + colOffset,
        endRow: toRange.startRow + rowOffset + (filterRange.endRow - filterRange.startRow),
        endColumn: toRange.startColumn + colOffset + (filterRange.endColumn - filterRange.startColumn)
      };
      const removeFilter = {
        id: RemoveSheetsFilterMutation.id,
        params: {
          unitId,
          subUnitId
        }
      };
      const setNewFilterRange = { id: SetSheetsFilterRangeMutation.id, params: { unitId, subUnitId, range: newFilterRange } };
      const setOldFilterRange = { id: SetSheetsFilterRangeMutation.id, params: { unitId, subUnitId, range: filterRange } };
      redos.push(removeFilter, setNewFilterRange);
      undos.push(removeFilter, setOldFilterRange);
      const filterColumn = filterModel.getAllFilterColumns();
      const moveColDelta = toRange.startColumn - fromRange.startColumn;
      filterColumn.forEach((column) => {
        const [col, criteria] = column;
        if (criteria) {
          redos.push({ id: SetSheetsFilterCriteriaMutation.id, params: { unitId, subUnitId, col: col + moveColDelta, criteria: { ...criteria.serialize(), colId: col + moveColDelta } } });
          undos.push({ id: SetSheetsFilterCriteriaMutation.id, params: { unitId, subUnitId, col, criteria: { ...criteria.serialize(), colId: col } } });
        }
      });
    } else if (Rectangle.intersects(toRange, filterRange)) {
      const newFilterRange = {
        ...filterRange,
        endRow: Math.max(filterRange.endRow, toRange.endRow)
      };
      redos.push({ id: SetSheetsFilterRangeMutation.id, params: { unitId, subUnitId, range: newFilterRange } });
      undos.push({ id: SetSheetsFilterRangeMutation.id, params: { unitId, subUnitId, range: filterRange } });
    }
    return {
      redos,
      undos
    };
  }
  _handleRemoveSheetCommand(config, unitId, subUnitId) {
    const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
    if (!filterModel) {
      return this._handleNull();
    }
    const filterRange = filterModel.getRange();
    if (!filterRange) {
      return this._handleNull();
    }
    const redos = [];
    const undos = [];
    const filterCols = filterModel.getAllFilterColumns();
    filterCols.forEach(([col, filter2]) => {
      undos.push({ id: SetSheetsFilterCriteriaMutation.id, params: { unitId, subUnitId, col, criteria: { ...filter2.serialize(), colId: col } } });
    });
    redos.push({ id: RemoveSheetsFilterMutation.id, params: { unitId, subUnitId, range: filterRange } });
    undos.unshift({ id: SetSheetsFilterRangeMutation.id, params: { range: filterRange, unitId, subUnitId } });
    return {
      undos,
      redos
    };
  }
  _handleCopySheetCommand(unitId, subUnitId, targetSubUnitId) {
    const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
    if (!filterModel) {
      return this._handleNull();
    }
    const filterRange = filterModel.getRange();
    if (!filterRange) {
      return this._handleNull();
    }
    const redos = [];
    const undos = [];
    const preUndos = [];
    const preRedos = [];
    const filterCols = filterModel.getAllFilterColumns();
    filterCols.forEach(([col, filter2]) => {
      redos.push({ id: SetSheetsFilterCriteriaMutation.id, params: { unitId, subUnitId: targetSubUnitId, col, criteria: { ...filter2.serialize(), colId: col } } });
      preUndos.push({ id: SetSheetsFilterCriteriaMutation.id, params: { unitId, subUnitId: targetSubUnitId, col, criteria: null } });
    });
    preUndos.push({ id: RemoveSheetsFilterMutation.id, params: { unitId, subUnitId: targetSubUnitId, range: filterRange } });
    redos.unshift({ id: SetSheetsFilterRangeMutation.id, params: { range: filterRange, unitId, subUnitId: targetSubUnitId } });
    return {
      undos,
      redos,
      preUndos,
      preRedos
    };
  }
  _handleNull() {
    return { redos: [], undos: [] };
  }
  _initRowFilteredInterceptor() {
    this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.ROW_FILTERED, {
      // sheet-interceptor.service.ts
      handler: (filtered, rowLocation) => {
        var _a, _b;
        if (filtered) return true;
        return (_b = (_a = this._sheetsFilterService.getFilterModel(
          rowLocation.unitId,
          rowLocation.subUnitId
        )) == null ? void 0 : _a.isRowFiltered(rowLocation.row)) != null ? _b : false;
      }
    }));
  }
  _moveCriteria(unitId, subUnitId, target, step) {
    const defaultSetCriteriaMutationParams = {
      unitId,
      subUnitId,
      criteria: null,
      col: -1
    };
    const oldUndos = [];
    const oldRedos = [];
    const newUndos = [];
    const newRedos = [];
    target.forEach((column) => {
      const [offset, filter2] = column;
      oldRedos.push({
        id: SetSheetsFilterCriteriaMutation.id,
        params: {
          ...defaultSetCriteriaMutationParams,
          col: offset
        }
      });
      oldUndos.push({
        id: SetSheetsFilterCriteriaMutation.id,
        params: {
          ...defaultSetCriteriaMutationParams,
          col: offset,
          criteria: { ...filter2.serialize(), colId: offset }
        }
      });
    });
    target.forEach((column) => {
      const [offset, filter2] = column;
      newRedos.push({
        id: SetSheetsFilterCriteriaMutation.id,
        params: {
          ...defaultSetCriteriaMutationParams,
          col: offset + step,
          criteria: { ...filter2.serialize(), colId: offset + step }
        }
      });
      newUndos.push({
        id: SetSheetsFilterCriteriaMutation.id,
        params: {
          ...defaultSetCriteriaMutationParams,
          col: offset + step,
          criteria: null
        }
      });
    });
    return {
      newRange: {
        redos: newRedos,
        undos: newUndos
      },
      oldRange: {
        redos: oldRedos,
        undos: oldUndos
      }
    };
  }
  _commandExecutedListener() {
    this.disposeWithMe(this._commandService.onCommandExecuted((command, options) => {
      var _a, _b;
      const { unitId, subUnitId } = command.params || {};
      const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
      if (!filterModel) return;
      const filteredOutRows = Array.from(filterModel.filteredOutRows).sort((a, b) => a - b);
      const newFilteredOutRows = [];
      let changed = false;
      if (command.id === RemoveRowMutation.id) {
        const { startRow, endRow } = command.params.range;
        const filterOutInRemove = filteredOutRows.filter((row) => row >= startRow && row <= endRow);
        filteredOutRows.forEach((row) => {
          if (row < startRow) {
            newFilteredOutRows.push(row);
          } else {
            changed = true;
            if (row <= endRow) {
              const newIndex = Math.max(startRow, newFilteredOutRows.length ? newFilteredOutRows[newFilteredOutRows.length - 1] + 1 : startRow);
              newFilteredOutRows.push(newIndex);
            } else {
              newFilteredOutRows.push(row - (endRow - startRow + 1 - filterOutInRemove.length));
            }
          }
        });
      }
      if (command.id === InsertRowMutation.id) {
        const { startRow, endRow } = command.params.range;
        filteredOutRows.forEach((row) => {
          if (row >= startRow) {
            changed = true;
            newFilteredOutRows.push(row + (endRow - startRow + 1));
          } else {
            newFilteredOutRows.push(row);
          }
        });
      }
      if (changed) {
        filterModel.filteredOutRows = new Set(newFilteredOutRows);
      }
      if (command.id === SetRangeValuesMutation.id && !(options == null ? void 0 : options.onlyLocal)) {
        const extendRegion = this._getExtendRegion(unitId, subUnitId);
        if (extendRegion) {
          const cellValue = command.params.cellValue;
          if (cellValue) {
            for (let col = extendRegion.startColumn; col <= extendRegion.endColumn; col++) {
              const cell = (_a = cellValue == null ? void 0 : cellValue[extendRegion.startRow]) == null ? void 0 : _a[col];
              if (cell && this._cellHasValue(cell)) {
                const worksheet = (_b = this._univerInstanceService.getUnit(unitId)) == null ? void 0 : _b.getSheetBySheetId(subUnitId);
                if (worksheet) {
                  const extendedRange = expandToContinuousRange(extendRegion, { down: true }, worksheet);
                  const filterModel2 = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
                  const filterRange = filterModel2.getRange();
                  filterModel2.setRange({
                    ...filterRange,
                    endRow: extendedRange.endRow
                  });
                  this._registerRefRange(unitId, subUnitId);
                }
              }
            }
          }
        }
      }
    }));
  }
  _getExtendRegion(unitId, subUnitId) {
    var _a;
    const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
    if (!filterModel) {
      return null;
    }
    const worksheet = (_a = this._univerInstanceService.getUnit(unitId)) == null ? void 0 : _a.getSheetBySheetId(subUnitId);
    if (!worksheet) {
      return null;
    }
    const filterRange = filterModel.getRange();
    if (!filterRange) {
      return null;
    }
    const maxRowIndex = worksheet.getRowCount() - 1;
    const rowManager = worksheet.getRowManager();
    for (let row = filterRange.endRow + 1; row <= maxRowIndex; row++) {
      if (rowManager.getRowRawVisible(row)) {
        return {
          startRow: row,
          endRow: row,
          startColumn: filterRange.startColumn,
          endColumn: filterRange.endColumn
        };
      }
    }
    return null;
  }
  _initErrorHandling() {
    this.disposeWithMe(this._commandService.beforeCommandExecuted((command) => {
      const params = command.params;
      const target = getSheetCommandTarget(this._univerInstanceService, params);
      if (!target) return;
      const { subUnitId, unitId } = target;
      const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
      if (!filterModel) return;
      const filterRange = filterModel.getRange();
      if (command.id === MoveRowsCommand.id && params.fromRange.startRow <= filterRange.startRow && params.fromRange.endRow < filterRange.endRow && params.fromRange.endRow >= filterRange.startRow) {
        this._sheetsFilterService.setFilterErrorMsg("sheets-filter.msg.filter-header-forbidden");
        throw new Error("[SheetsFilterController]: Cannot move header row of filter");
      }
    }));
  }
  _cellHasValue(cell) {
    const values = Object.values(cell);
    if (values.length === 0 || values.every((v) => v == null)) {
      return false;
    }
    return true;
  }
};
SheetsFilterController = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, Inject(SheetInterceptorService)),
  __decorateParam(2, Inject(SheetsFilterService)),
  __decorateParam(3, IUniverInstanceService),
  __decorateParam(4, Inject(RefRangeService)),
  __decorateParam(5, Optional(DataSyncPrimaryController)),
  __decorateParam(6, Inject(ZebraCrossingCacheController))
], SheetsFilterController);

// ../packages/sheets-filter/src/controllers/sheets-filter-sync.controller.ts
var sheetsFilterOnlyLocalMutationIds = [
  SetSheetsFilterCriteriaMutation.id,
  ReCalcSheetsFilterMutation.id
];
var effectedByOnlyLocalMutationIds = [
  InsertColMutation.id,
  RemoveColMutation.id,
  MoveColsMutation.id
];
var SheetsFilterSyncController = class extends Disposable {
  constructor(_sheetsFilterController, _commandService, _configService) {
    var _a;
    super();
    __publicField(this, "_sheetsFilterController", _sheetsFilterController);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_configService", _configService);
    __publicField(this, "_d", new DisposableCollection());
    __publicField(this, "_visible$", new BehaviorSubject(false));
    __publicField(this, "visible$", this._visible$.asObservable());
    __publicField(this, "_enabled$", new BehaviorSubject(true));
    __publicField(this, "enabled$", this._enabled$.asObservable());
    const config = this._configService.getConfig(SHEETS_FILTER_PLUGIN_CONFIG_KEY);
    if (config == null ? void 0 : config.enableSyncSwitch) {
      this._visible$.next(true);
      if (typeof config.enableSyncSwitch === "object") {
        this.setEnabled((_a = config.enableSyncSwitch.defaultValue) != null ? _a : true);
      }
    }
  }
  get visible() {
    return this._visible$.getValue();
  }
  get enabled() {
    return this._enabled$.getValue();
  }
  setEnabled(enabled) {
    this._enabled$.next(enabled);
    if (enabled) {
      this._d.dispose();
    } else {
      this._initOnlyLocalListener();
    }
  }
  _initOnlyLocalListener() {
    this._d.add(
      this._commandService.beforeCommandExecuted((commandInfo, options) => {
        if (sheetsFilterOnlyLocalMutationIds.includes(commandInfo.id)) {
          if (!options) options = {};
          options.onlyLocal = true;
        }
      })
    );
    this._d.add(
      this._commandService.onCommandExecuted((commandInfo, options) => {
        if (effectedByOnlyLocalMutationIds.includes(commandInfo.id) && (options == null ? void 0 : options.fromCollab)) {
          if (commandInfo.id === InsertColMutation.id) {
            const { range, unitId, subUnitId } = commandInfo.params;
            const { redos } = this._sheetsFilterController.handleInsertColCommand(range, unitId, subUnitId);
            sequenceExecute(redos, this._commandService, options);
          } else if (commandInfo.id === RemoveColMutation.id) {
            const { range, unitId, subUnitId } = commandInfo.params;
            const { redos } = this._sheetsFilterController.handleRemoveColCommand(range, unitId, subUnitId);
            sequenceExecute(redos, this._commandService, options);
          } else if (commandInfo.id === MoveColsMutation.id) {
            const { sourceRange: fromRange, targetRange: toRange, unitId, subUnitId } = commandInfo.params;
            const { redos } = this._sheetsFilterController.handleMoveColsCommand({ fromRange, toRange }, unitId, subUnitId);
            sequenceExecute(redos, this._commandService, options);
          }
        }
      })
    );
  }
};
SheetsFilterSyncController = __decorateClass([
  __decorateParam(0, Inject(SheetsFilterController)),
  __decorateParam(1, ICommandService),
  __decorateParam(2, IConfigService)
], SheetsFilterSyncController);

// ../packages/sheets-filter/src/services/sheet-filter-formula.service.ts
var SheetsFilterFormulaService = class extends Disposable {
  constructor(_activeDirtyManagerService, _sheetRowFilteredService, _sheetsFilterService, _univerInstanceService) {
    super();
    __publicField(this, "_activeDirtyManagerService", _activeDirtyManagerService);
    __publicField(this, "_sheetRowFilteredService", _sheetRowFilteredService);
    __publicField(this, "_sheetsFilterService", _sheetsFilterService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    this._initFormulaDirtyRange();
    this._registerSheetRowFiltered();
  }
  _initFormulaDirtyRange() {
    FILTER_MUTATIONS.forEach((commandId) => {
      this._activeDirtyManagerService.register(
        commandId,
        {
          commandId,
          getDirtyData: (commandInfo) => {
            const params = commandInfo.params;
            const { unitId, subUnitId } = params;
            return {
              dirtyRanges: this._getHideRowMutation(unitId, subUnitId),
              clearDependencyTreeCache: {
                [unitId]: {
                  [subUnitId]: "1"
                }
              }
            };
          }
        }
      );
    });
  }
  _getHideRowMutation(unitId, subUnitId) {
    var _a, _b;
    const range = (_a = this._sheetsFilterService.getFilterModel(unitId, subUnitId)) == null ? void 0 : _a.getRange();
    const sheet = (_b = this._univerInstanceService.getUnit(unitId)) == null ? void 0 : _b.getSheetBySheetId(subUnitId);
    if (range == null || sheet == null) {
      return [];
    }
    const { startRow, endRow } = range;
    const dirtyRanges = [{
      unitId,
      sheetId: subUnitId,
      range: {
        startRow,
        startColumn: 0,
        endRow,
        endColumn: sheet.getColumnCount() - 1
      }
    }];
    return dirtyRanges;
  }
  _registerSheetRowFiltered() {
    this._sheetRowFilteredService.register((unitId, subUnitId, row) => {
      var _a, _b;
      return (_b = (_a = this._sheetsFilterService.getFilterModel(unitId, subUnitId)) == null ? void 0 : _a.isRowFiltered(row)) != null ? _b : false;
    });
  }
};
SheetsFilterFormulaService = __decorateClass([
  __decorateParam(0, Inject(IActiveDirtyManagerService)),
  __decorateParam(1, Inject(ISheetRowFilteredService)),
  __decorateParam(2, Inject(SheetsFilterService)),
  __decorateParam(3, IUniverInstanceService)
], SheetsFilterFormulaService);

// ../packages/sheets-filter/src/plugin.ts
var UniverSheetsFilterPlugin = class extends Plugin {
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
    this._configService.setConfig(SHEETS_FILTER_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    [
      [SheetsFilterFormulaService],
      [SheetsFilterService],
      [SheetsFilterController],
      [SheetsFilterSyncController]
    ].forEach((d) => this._injector.add(d));
  }
  onReady() {
    touchDependencies(this._injector, [
      [SheetsFilterFormulaService],
      [SheetsFilterController],
      [SheetsFilterSyncController]
    ]);
  }
};
__publicField(UniverSheetsFilterPlugin, "type", 2 /* UNIVER_SHEET */);
__publicField(UniverSheetsFilterPlugin, "pluginName", SHEET_FILTER_SNAPSHOT_ID);
__publicField(UniverSheetsFilterPlugin, "packageName", package_default.name);
__publicField(UniverSheetsFilterPlugin, "version", package_default.version);
UniverSheetsFilterPlugin = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IConfigService)
], UniverSheetsFilterPlugin);

export {
  FILTER_MUTATIONS,
  CustomFilterOperator,
  SheetsFilterService,
  SetSheetsFilterRangeMutation,
  SetSheetsFilterCriteriaMutation,
  RemoveSheetsFilterMutation,
  ReCalcSheetsFilterMutation,
  SetSheetFilterRangeCommand,
  RemoveSheetFilterCommand,
  SmartToggleSheetsFilterCommand,
  SetSheetsFilterCriteriaCommand,
  ClearSheetsFilterCriteriaCommand,
  ReCalcSheetsFilterCommand,
  SheetsFilterSyncController,
  UniverSheetsFilterPlugin
};
