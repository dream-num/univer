import {
  FormulaDataModel,
  ReorderRangeCommand,
  UniverFormulaEnginePlugin,
  UniverSheetsPlugin,
  getSheetCommandTarget
} from "./chunk-Q6Y4PHRI.js";
import {
  DependentOn,
  Disposable,
  ICommandService,
  IConfigService,
  IUniverInstanceService,
  Inject,
  Injector,
  Plugin,
  Rectangle,
  merge_default,
  sequenceExecute
} from "./chunk-EJSPXROI.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField
} from "./chunk-24OICD5T.js";

// ../packages/sheets-sort/package.json
var package_default = {
  name: "@univerjs/sheets-sort",
  version: "0.25.2",
  private: false,
  description: "Sorting model, commands, and services for Univer Sheets.",
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
    "sort",
    "spreadsheet",
    "plugin"
  ],
  exports: {
    ".": "./src/index.ts",
    "./*": "./src/*",
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
  dependencies: {
    "@univerjs/core": "workspace:*",
    "@univerjs/engine-formula": "workspace:*",
    "@univerjs/sheets": "workspace:*"
  },
  devDependencies: {
    "@univerjs-infra/shared": "workspace:*",
    typescript: "^6.0.3",
    vitest: "^4.1.7"
  }
};

// ../packages/sheets-sort/src/config/config.ts
var SHEETS_SORT_PLUGIN_CONFIG_KEY = "sheets-sort.config";
var configSymbol = Symbol(SHEETS_SORT_PLUGIN_CONFIG_KEY);
var defaultPluginConfig = {};

// ../packages/sheets-sort/src/controllers/utils.ts
var removeStringSymbol = (str) => {
  return str.replace(/-/gi, "").replace(/'/gi, "");
};
var compareNull = (a1, a2) => {
  const isA1Null = a1 === null || a1 === "";
  const isA2Null = a2 === null || a2 === "";
  if (isA1Null && isA2Null) return 0 /* ZERO */;
  if (isA1Null) return 1 /* POSITIVE */;
  if (isA2Null) return -1 /* NEGATIVE */;
  return null;
};
var compareNumber = (a1, a2, type) => {
  const isA1Num = typeof a1 === "number";
  const isA2Num = typeof a2 === "number";
  if (isA1Num && isA2Num) {
    if (a1 < a2) {
      return type === "asc" /* ASC */ ? -1 /* NEGATIVE */ : 1 /* POSITIVE */;
    }
    if (a1 > a2) {
      return type === "asc" /* ASC */ ? 1 /* POSITIVE */ : -1 /* NEGATIVE */;
    }
    return 0 /* ZERO */;
  }
  if (isA1Num) {
    return type === "asc" /* ASC */ ? 1 /* POSITIVE */ : -1 /* NEGATIVE */;
  }
  if (isA2Num) {
    return type === "asc" /* ASC */ ? -1 /* NEGATIVE */ : 1 /* POSITIVE */;
  }
  return null;
};
var compareString = (a1, a2, type) => {
  const isA1Str = typeof a1 === "string";
  const isA2Str = typeof a2 === "string";
  if (isA1Str) {
    a1 = removeStringSymbol(a1.toLocaleLowerCase());
  }
  if (isA2Str) {
    a2 = removeStringSymbol(a2.toLocaleLowerCase());
  }
  if (!isA1Str && !isA2Str) {
    return null;
  }
  if (isA1Str && isA2Str) {
    const a1AsString = a1;
    const a2AsString = a2;
    if (a1AsString < a2AsString) {
      return type === "asc" /* ASC */ ? -1 /* NEGATIVE */ : 1 /* POSITIVE */;
    }
    if (a1AsString > a2AsString) {
      return type === "asc" /* ASC */ ? 1 /* POSITIVE */ : -1 /* NEGATIVE */;
    }
    return 0 /* ZERO */;
  }
  if (isA1Str) {
    return type === "asc" /* ASC */ ? 1 /* POSITIVE */ : -1 /* NEGATIVE */;
  }
  if (isA2Str) {
    return type === "asc" /* ASC */ ? -1 /* NEGATIVE */ : 1 /* POSITIVE */;
  }
  return null;
};
var isNullValue = (cell) => {
  if (!cell) {
    return true;
  }
  if (Object.keys(cell).length === 0) {
    return true;
  }
  if ((cell == null ? void 0 : cell.v) == null && (cell == null ? void 0 : cell.p) == null) {
    return true;
  }
  return false;
};

// ../packages/sheets-sort/src/services/sheets-sort.service.ts
var SheetsSortService = class extends Disposable {
  constructor(_univerInstanceService, _commandService, _formulaDataModel) {
    super();
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_formulaDataModel", _formulaDataModel);
    __publicField(this, "_compareFns", []);
  }
  mergeCheck(location) {
    var _a;
    const { unitId, subUnitId, range } = location;
    const sheet = (_a = this._univerInstanceService.getUnit(unitId)) == null ? void 0 : _a.getSheetBySheetId(subUnitId);
    if (!sheet) {
      return false;
    }
    const mergeDataInRange = sheet.getMergeData().filter((merge) => Rectangle.contains(range, merge));
    if (mergeDataInRange.length === 0) {
      return true;
    }
    return isRangeDividedEqually(range, mergeDataInRange);
  }
  emptyCheck(location) {
    var _a;
    const { unitId, subUnitId, range } = location;
    const sheet = (_a = this._univerInstanceService.getUnit(unitId)) == null ? void 0 : _a.getSheetBySheetId(subUnitId);
    if (!sheet) {
      return false;
    }
    for (let row = range.startRow; row <= range.endRow; row++) {
      for (let col = range.startColumn; col <= range.endColumn; col++) {
        if (!isNullValue(sheet.getCellRaw(row, col))) {
          return true;
        }
      }
    }
    return false;
  }
  singleCheck(location) {
    if (location.range.startRow === location.range.endRow) {
      return false;
    }
    return true;
  }
  formulaCheck(location) {
    var _a, _b;
    const { unitId, subUnitId, range } = location;
    const arrayFormulaRange = (_b = (_a = this._formulaDataModel.getArrayFormulaRange()) == null ? void 0 : _a[unitId]) == null ? void 0 : _b[subUnitId];
    for (const row in arrayFormulaRange) {
      const rowData = arrayFormulaRange[Number(row)];
      for (const col in rowData) {
        const arrayFormula = rowData[Number(col)];
        if (arrayFormula && Rectangle.intersects(range, arrayFormula)) {
          return false;
        }
      }
    }
    return true;
  }
  registerCompareFn(fn) {
    this._compareFns.unshift(fn);
  }
  getAllCompareFns() {
    return this._compareFns;
  }
  applySort(sortOption, unitId, subUnitId) {
    var _a;
    const { unitId: _unitId, subUnitId: _subUnitId } = getSheetCommandTarget(this._univerInstanceService) || {};
    this._commandService.executeCommand(SortRangeCommand.id, {
      orderRules: sortOption.orderRules,
      range: sortOption.range,
      hasTitle: (_a = sortOption.hasTitle) != null ? _a : false,
      unitId: unitId || _unitId,
      subUnitId: subUnitId || _subUnitId
    });
  }
};
SheetsSortService = __decorateClass([
  __decorateParam(0, IUniverInstanceService),
  __decorateParam(1, ICommandService),
  __decorateParam(2, Inject(FormulaDataModel))
], SheetsSortService);
function isRangeDividedEqually(range, merges) {
  const rangeRows = range.endRow - range.startRow + 1;
  const rangeCols = range.endColumn - range.startColumn + 1;
  let mergeRows = null;
  let mergeCols = null;
  const totalArea = rangeRows * rangeCols;
  let totalMergeArea = 0;
  for (const merge of merges) {
    if (merge.startRow >= range.startRow && merge.endRow <= range.endRow && merge.startColumn >= range.startColumn && merge.endColumn <= range.endColumn) {
      const currentMergeRows = merge.endRow - merge.startRow + 1;
      const currentMergeCols = merge.endColumn - merge.startColumn + 1;
      if (mergeRows === null && mergeCols === null) {
        mergeRows = currentMergeRows;
        mergeCols = currentMergeCols;
      } else if (currentMergeRows !== mergeRows || currentMergeCols !== mergeCols) {
        return false;
      }
      totalMergeArea += currentMergeRows * currentMergeCols;
    }
  }
  return totalMergeArea === totalArea;
}

// ../packages/sheets-sort/src/commands/commands/sheets-sort.command.ts
var SortRangeCommand = {
  id: "sheet.command.sort-range",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    const { range, orderRules, hasTitle, unitId, subUnitId } = params;
    const sortService = accessor.get(SheetsSortService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const { worksheet } = getSheetCommandTarget(univerInstanceService, params) || {};
    if (!worksheet) {
      return false;
    }
    const mergeDataInRange = worksheet.getMergeData().filter((mergeData) => {
      return Rectangle.contains(range, mergeData);
    });
    const mergeMainRowIndexes = mergeDataInRange.map((mergeData) => {
      return mergeData.startRow;
    });
    const { startRow: rangeStartRow, endRow } = range;
    const startRow = hasTitle ? rangeStartRow + 1 : rangeStartRow;
    const toReorder = [];
    const oldOrder = [];
    for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
      if (worksheet.getRowFiltered(rowIndex)) {
        continue;
      }
      if (worksheet.getRowRawVisible(rowIndex) === false) {
        continue;
      }
      if (mergeDataInRange.length && !mergeMainRowIndexes.includes(rowIndex)) {
        continue;
      }
      toReorder.push({
        index: rowIndex,
        value: getRowCellData(worksheet, rowIndex, orderRules)
      });
      oldOrder.push(rowIndex);
    }
    const compareFns = sortService.getAllCompareFns();
    toReorder.sort(reorderFnGenerator(orderRules, combineCompareFnsAsOne(compareFns)));
    const order = {};
    toReorder.forEach(({ index, value }, oldIndex) => {
      order[oldOrder[oldIndex]] = index;
    });
    const reorderRangeCommand = {
      id: ReorderRangeCommand.id,
      params: {
        unitId,
        subUnitId,
        range,
        order
      }
    };
    const commandService = accessor.get(ICommandService);
    const res = sequenceExecute([reorderRangeCommand], commandService);
    return res.result;
  }
};
function getRowCellData(worksheet, rowIndex, orderRules) {
  const result = [];
  orderRules.forEach(({ colIndex }) => {
    result.push(worksheet.getCellRaw(rowIndex, colIndex));
  });
  return result;
}
function combineCompareFnsAsOne(compareFns) {
  return (type, a, b) => {
    for (let i = 0; i < compareFns.length; i++) {
      const res = compareFns[i](type, a, b);
      if (res != null) {
        return res;
      }
    }
    return 0;
  };
}
function reorderFnGenerator(orderRules, valueCompare) {
  return function(a, b) {
    let ret = null;
    for (let index = 0; index < orderRules.length; index++) {
      const aCellData = a.value[index];
      const bCellData = b.value[index];
      ret = valueCompare(orderRules[index].type, aCellData, bCellData);
      if (ret !== 0 && ret !== null && ret !== void 0) {
        return ret;
      }
    }
    return 0;
  };
}

// ../packages/sheets-sort/src/controllers/sheets-sort.controller.ts
var SheetsSortController = class extends Disposable {
  constructor(_commandService, _sortService) {
    super();
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_sortService", _sortService);
    this._initCommands();
    this._registerCompareFns();
  }
  _initCommands() {
    [
      SortRangeCommand
    ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
  }
  _registerCompareFns() {
    const commonFn = (type, a, b) => {
      const valueA = this._getCommonValue(a);
      const valueB = this._getCommonValue(b);
      const compareTypeFns = [
        compareNull,
        compareString,
        compareNumber
      ];
      for (let i = 0; i < compareTypeFns.length; i++) {
        const res = compareTypeFns[i](valueA, valueB, type);
        if (res !== null) {
          return res;
        }
      }
      return null;
    };
    this._sortService.registerCompareFn(commonFn);
  }
  _getCommonValue(a) {
    var _a, _b;
    if (isNullValue(a)) {
      return null;
    }
    const richTextValue = (_b = (_a = a == null ? void 0 : a.p) == null ? void 0 : _a.body) == null ? void 0 : _b.dataStream;
    if (richTextValue) {
      return richTextValue;
    }
    if ((a == null ? void 0 : a.t) === 2 /* NUMBER */) {
      return Number.parseFloat(`${a.v}`);
    }
    if ((a == null ? void 0 : a.t) === 1 /* STRING */) {
      if (typeof a.v === "number") {
        return a.v;
      }
      return `${a.v}`;
    }
    if ((a == null ? void 0 : a.t) === 3 /* BOOLEAN */) {
      return `${a.v}`;
    }
    if ((a == null ? void 0 : a.t) === 4 /* FORCE_STRING */) {
      return Number.parseFloat(`${a.v}`);
    }
    return `${a == null ? void 0 : a.v}`;
  }
};
SheetsSortController = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, Inject(SheetsSortService))
], SheetsSortController);

// ../packages/sheets-sort/src/plugin.ts
var UniverSheetsSortPlugin = class extends Plugin {
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
    this._configService.setConfig(SHEETS_SORT_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    [
      [SheetsSortController],
      [SheetsSortService]
    ].forEach((d) => this._injector.add(d));
  }
  onReady() {
    this._injector.get(SheetsSortController);
  }
};
__publicField(UniverSheetsSortPlugin, "type", 2 /* UNIVER_SHEET */);
__publicField(UniverSheetsSortPlugin, "pluginName", "SHEET_SORT_PLUGIN");
__publicField(UniverSheetsSortPlugin, "packageName", package_default.name);
__publicField(UniverSheetsSortPlugin, "version", package_default.version);
UniverSheetsSortPlugin = __decorateClass([
  DependentOn(UniverSheetsPlugin, UniverFormulaEnginePlugin),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IConfigService)
], UniverSheetsSortPlugin);

export {
  SheetsSortService,
  SortRangeCommand,
  UniverSheetsSortPlugin
};
