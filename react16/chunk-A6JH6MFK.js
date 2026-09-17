import {
  FindModel,
  FindReplaceController,
  IFindReplaceService,
  UniverFindReplacePlugin
} from "./chunk-PRZ2MIYX.js";
import {
  ScrollToCellCommand,
  SheetSkeletonManagerService,
  getCoordByCell,
  getSheetObject
} from "./chunk-BHQGV2VJ.js";
import {
  SelectRangeCommand,
  SetRangeValuesCommand,
  SetSelectionsOperation,
  SetWorksheetActivateCommand,
  SetWorksheetActiveOperation,
  SheetsSelectionsService,
  UniverSheetsPlugin
} from "./chunk-Q6Y4PHRI.js";
import {
  IRenderManagerService,
  RENDER_RAW_FORMULA_KEY,
  Rect,
  Shape
} from "./chunk-XOCU2XR6.js";
import {
  ColorKit,
  DependentOn,
  Disposable,
  EDITOR_ACTIVATED,
  ICommandService,
  IConfigService,
  IContextService,
  IUndoRedoService,
  IUniverInstanceService,
  Inject,
  Injector,
  ObjectMatrix,
  Plugin,
  Rectangle,
  Subject,
  ThemeService,
  Tools,
  debounceTime,
  escapeRegExp,
  filter,
  fromCallback,
  groupBy,
  merge,
  merge_default,
  replaceInDocumentBody,
  rotate,
  skip,
  throttleTime
} from "./chunk-EJSPXROI.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField
} from "./chunk-24OICD5T.js";

// ../packages/sheets-find-replace/package.json
var package_default = {
  name: "@univerjs/sheets-find-replace",
  version: "0.25.2",
  private: false,
  description: "Find and replace integration for Univer Sheets.",
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
    "find-replace",
    "search",
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
  peerDependencies: {
    rxjs: ">=7.0.0"
  },
  dependencies: {
    "@univerjs/core": "workspace:*",
    "@univerjs/engine-render": "workspace:*",
    "@univerjs/find-replace": "workspace:*",
    "@univerjs/sheets": "workspace:*",
    "@univerjs/sheets-ui": "workspace:*"
  },
  devDependencies: {
    "@univerjs-infra/shared": "workspace:*",
    rxjs: "^7.8.2",
    typescript: "^6.0.3",
    vitest: "^4.1.7"
  }
};

// ../packages/sheets-find-replace/src/config/config.ts
var SHEETS_FIND_REPLACE_PLUGIN_CONFIG_KEY = "sheets-find-replace.config";
var configSymbol = Symbol(SHEETS_FIND_REPLACE_PLUGIN_CONFIG_KEY);
var defaultPluginConfig = {};

// ../packages/sheets-find-replace/src/commands/commands/sheet-replace.command.ts
var SheetReplaceCommand = {
  id: "sheet.command.replace",
  type: 0 /* COMMAND */,
  handler: async (accessor, params) => {
    const undoRedoService = accessor.get(IUndoRedoService);
    const commandService = accessor.get(ICommandService);
    const { unitId, replacements } = params;
    const disposeBatchingHandler = undoRedoService.__tempBatchingUndoRedo(unitId);
    const results = await Promise.all(replacements.map((replacement) => commandService.executeCommand(SetRangeValuesCommand.id, {
      unitId,
      subUnitId: replacement.subUnitId,
      value: replacement.value
    })));
    disposeBatchingHandler.dispose();
    return getReplaceAllResult(results, replacements);
  }
};
function getReplaceAllResult(results, replacements) {
  let success = 0;
  let failure = 0;
  results.forEach((r, index) => {
    const count = replacements[index].count;
    if (r) {
      success += count;
    } else {
      failure += count;
    }
  });
  return { success, failure };
}

// ../packages/sheets-find-replace/src/views/shapes/find-replace-highlight.shape.ts
var SheetFindReplaceHighlightShape = class extends Shape {
  constructor(key, props) {
    super(key, props);
    __publicField(this, "_activated", false);
    __publicField(this, "_inHiddenRange", false);
    __publicField(this, "_color");
    if (props) {
      this.setShapeProps(props);
    }
  }
  setShapeProps(props) {
    this._activated = !!props.activated;
    if (typeof props.inHiddenRange !== "undefined") {
      this._inHiddenRange = props.inHiddenRange;
    }
    if (typeof props.color !== "undefined") {
      this._color = props.color;
    }
    this.transformByState({
      width: props.width,
      height: props.height
    });
  }
  _draw(ctx) {
    const activated = this._activated;
    const color = `rgba(${this._color.r}, ${this._color.g}, ${this._color.b}, 0.35)`;
    const borderColor = `rgb(${this._color.r}, ${this._color.g}, ${this._color.b})`;
    Rect.drawWith(ctx, {
      width: this.width,
      height: this.height,
      fill: color,
      stroke: activated ? borderColor : void 0,
      strokeWidth: activated ? 2 : 0,
      evented: false
    });
  }
};

// ../packages/sheets-find-replace/src/controllers/utils.ts
function isSamePosition(range1, range2) {
  return range1.startRow === range2.startRow && range1.startColumn === range2.startColumn;
}
function isBehindPositionWithRowPriority(range1, range2) {
  return range1.startRow < range2.startRow || range1.startRow === range2.startRow && range1.startColumn <= range2.startColumn;
}
function isBehindPositionWithColumnPriority(range1, range2) {
  return range1.startColumn < range2.startColumn || range1.startColumn === range2.startColumn && range1.startRow <= range2.startRow;
}
function isBeforePositionWithRowPriority(range1, range2) {
  return range1.startRow > range2.startRow || range1.startRow === range2.startRow && range1.startColumn >= range2.startColumn;
}
function isBeforePositionWithColumnPriority(range1, range2) {
  return range1.startColumn > range2.startColumn || range1.startColumn === range2.startColumn && range1.startRow >= range2.startRow;
}
function isSelectionSingleCell(selection, worksheet) {
  const { range } = selection;
  const { startRow, startColumn } = range;
  const hasMergedCell = worksheet.getMergedCell(startRow, startColumn);
  if (hasMergedCell) {
    return Rectangle.equals(range, hasMergedCell);
  } else {
    return range.endRow === range.startRow && range.endColumn === range.startColumn;
  }
}

// ../packages/sheets-find-replace/src/controllers/sheet-find-replace.controller.ts
var SheetsFindReplaceController = class extends Disposable {
  constructor(_injector, _findReplaceController, _contextService, _findReplaceService, _commandService) {
    super();
    __publicField(this, "_injector", _injector);
    __publicField(this, "_findReplaceController", _findReplaceController);
    __publicField(this, "_contextService", _contextService);
    __publicField(this, "_findReplaceService", _findReplaceService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_provider");
    this._init();
    this._initCommands();
  }
  dispose() {
    super.dispose();
    this._findReplaceController.closePanel();
    this._provider.dispose();
  }
  _init() {
    const provider = this._injector.createInstance(SheetsFindReplaceProvider);
    this._provider = provider;
    this.disposeWithMe(this._findReplaceService.registerFindReplaceProvider(provider));
    this.disposeWithMe(this._contextService.subscribeContextValue$(EDITOR_ACTIVATED).pipe(filter((v) => !!v)).subscribe(() => this._findReplaceController.closePanel()));
  }
  _initCommands() {
    [SheetReplaceCommand].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
  }
};
SheetsFindReplaceController = __decorateClass([
  __decorateParam(0, Inject(Injector)),
  __decorateParam(1, Inject(FindReplaceController)),
  __decorateParam(2, IContextService),
  __decorateParam(3, IFindReplaceService),
  __decorateParam(4, ICommandService)
], SheetsFindReplaceController);
var SHEETS_FIND_REPLACE_PROVIDER_NAME = "sheets-find-replace-provider";
var FIND_REPLACE_Z_INDEX = 1e4;
var SheetFindModel = class extends FindModel {
  constructor(_workbook, _sheetSkeletonManagerService, _univerInstanceService, _renderManagerService, _commandService, _contextService, _themeService, _selectionManagerService) {
    super();
    __publicField(this, "_workbook", _workbook);
    __publicField(this, "_sheetSkeletonManagerService", _sheetSkeletonManagerService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_contextService", _contextService);
    __publicField(this, "_themeService", _themeService);
    // We can directly inject the `FindReplaceService` here, and call its methods instead of using the observables.
    __publicField(this, "_matchesUpdate$", new Subject());
    __publicField(this, "matchesUpdate$", this._matchesUpdate$.asObservable());
    __publicField(this, "_activelyChangingMatch$", new Subject());
    __publicField(this, "activelyChangingMatch$", this._activelyChangingMatch$.asObservable());
    /** Hold matches by the worksheet they are in. Make it easier to track the next (or previous) match when searching in the whole workbook. */
    __publicField(this, "_matchesByWorksheet", /* @__PURE__ */ new Map());
    /** Hold all matches in the currently searching scope. */
    __publicField(this, "_matches", []);
    /** Position of the current focused ISheetCellMatch, starting from 1. */
    __publicField(this, "_matchesPosition", 0);
    __publicField(this, "_activeHighlightIndex", -1);
    __publicField(this, "_highlightShapes", []);
    __publicField(this, "_currentHighlightShape", null);
    /** This properties holds the query params during this searching session. */
    __publicField(this, "_query", null);
    __publicField(this, "_workbookSelections");
    this._workbookSelections = _selectionManagerService.getWorkbookSelections(this.unitId);
  }
  get _matchesCount() {
    return this._matches.length;
  }
  get unitId() {
    return this._workbook.getUnitId();
  }
  get matchesCount() {
    return this._matchesCount;
  }
  get matchesPosition() {
    return this._matchesPosition;
  }
  get currentMatch() {
    return this._matchesPosition > 0 ? this._matches[this._matchesPosition - 1] : null;
  }
  dispose() {
    super.dispose();
    this._disposeHighlights();
    this._toggleDisplayRawFormula(false);
  }
  getMatches() {
    return this._matches;
  }
  start(query) {
    this._query = query;
    if (query.findBy === "formula" /* FORMULA */) {
      this._toggleDisplayRawFormula(true);
    } else {
      this._toggleDisplayRawFormula(false);
    }
    switch (query.findScope) {
      case "unit" /* UNIT */:
        this.findInWorkbook(query);
        break;
      case "subunit" /* SUBUNIT */:
      default:
        this.findInActiveWorksheet(query);
        break;
    }
  }
  focusSelection() {
    const currentMatch = this.currentMatch;
    if (!currentMatch) return;
    this._commandService.executeCommand(SelectRangeCommand.id, {
      unitId: currentMatch.unitId,
      subUnit: currentMatch.range.subUnitId,
      range: currentMatch.range.range
    });
  }
  _toggleDisplayRawFormula(force) {
    this._contextService.setContextValue(RENDER_RAW_FORMULA_KEY, force);
  }
  /**
   * Find all matches in the current workbook no matter which worksheet is activated.
   * @param query the query object
   * @returns the query complete event
   */
  findInWorkbook(query) {
    const unitId = this._workbook.getUnitId();
    let complete;
    let firstSearch = true;
    const findInWorkbook = () => {
      const allCompletes = this._workbook.getSheets().filter((worksheet) => !worksheet.isSheetHidden()).map((worksheet) => {
        const complete2 = this._findInWorksheet(worksheet, query, unitId);
        const sheetId = worksheet.getSheetId();
        const { results } = complete2;
        if (results.length) {
          this._matchesByWorksheet.set(sheetId, complete2.results);
        } else {
          this._matchesByWorksheet.delete(sheetId);
        }
        return complete2;
      });
      this._matches = allCompletes.map((c) => c.results).flat();
      this._updateFindHighlight();
      if (firstSearch) {
        complete = { results: this._matches };
        firstSearch = false;
      } else {
        this._matchesUpdate$.next(this._matches);
      }
    };
    this.disposeWithMe(this._sheetSkeletonManagerService.currentSkeleton$.subscribe(() => {
      this._updateFindHighlight();
      this._updateCurrentHighlightShape(this._activeHighlightIndex);
    }));
    this.disposeWithMe(
      fromCallback(this._commandService.onCommandExecuted.bind(this._commandService)).pipe(filter(([command, options]) => command.id === SetWorksheetActiveOperation.id && !(options == null ? void 0 : options.fromFindReplace))).subscribe(() => {
        const activeSheet = this._workbook.getActiveSheet();
        if (!activeSheet) {
          return;
        }
        const activeSheetId = activeSheet.getSheetId();
        if (!this._matchesByWorksheet.has(activeSheetId)) {
          return;
        }
        this._findNextMatchOnActiveSheetChange(activeSheet);
      })
    );
    this.disposeWithMe(
      fromCallback(this._commandService.onCommandExecuted.bind(this._commandService)).pipe(
        filter(
          ([command]) => command.type === 2 /* MUTATION */ && command.params.unitId === this._workbook.getUnitId()
        ),
        throttleTime(600, void 0, { leading: false, trailing: true })
      ).subscribe(() => findInWorkbook())
    );
    findInWorkbook();
    return complete;
  }
  /**
   * This method is used in `findInWorkbook`. When the active sheet changes, this method helps to find the next match
   * in the new worksheet.
   */
  _findNextMatchOnActiveSheetChange(activeSheet) {
    let match;
    let index;
    let globalIndex = 0;
    const matchesByWorksheet = this._matchesByWorksheet.get(activeSheet.getSheetId());
    const selections = this._workbookSelections.getCurrentSelections();
    if (!(selections == null ? void 0 : selections.length)) {
      match = matchesByWorksheet[0];
      index = 0;
      globalIndex = this._matches.findIndex((m) => m === match);
    } else {
      [match, globalIndex] = this._findNextMatchByRange(matchesByWorksheet, selections[0].range);
      index = matchesByWorksheet.findIndex((m) => m === match);
    }
    this._matchesPosition = globalIndex + 1;
    this._activelyChangingMatch$.next(match);
    this._activeHighlightIndex = index;
    this._updateFindHighlight();
    this._updateCurrentHighlightShape(index);
  }
  /**
   * Find all matches (only) in the currently activated worksheet.
   * @param query the query object
   * @returns the query complete event
   */
  findInActiveWorksheet(query) {
    const unitId = this._workbook.getUnitId();
    const checkShouldFindInSelections = () => {
      var _a;
      const currentWorksheet = this._workbook.getActiveSheet();
      if (!currentWorksheet) return false;
      const currentSelections = this._workbookSelections.getCurrentSelections();
      const shouldFindInSelections = (_a = currentSelections == null ? void 0 : currentSelections.some((selection) => !isSelectionSingleCell(selection, currentWorksheet))) != null ? _a : false;
      return shouldFindInSelections;
    };
    let complete;
    let firstSearch = true;
    let findBySelections = false;
    const performFindInWorksheet = () => {
      const currentWorksheet = this._workbook.getActiveSheet();
      if (!currentWorksheet) return { results: [] };
      const lastMatch = this.currentMatch;
      findBySelections = checkShouldFindInSelections();
      const currentSelections = this._workbookSelections.getCurrentSelections();
      const newComplete = findBySelections ? this._findInSelections(currentWorksheet, currentSelections, query, unitId) : this._findInWorksheet(currentWorksheet, query, unitId);
      this._matches = newComplete.results;
      this._matchesPosition = this._tryRestoreLastMatchesPosition(lastMatch, this._matches);
      if (firstSearch) {
        complete = newComplete;
        firstSearch = false;
      } else {
        this._matchesUpdate$.next(this._matches);
      }
      this._updateFindHighlight();
      return newComplete;
    };
    this.disposeWithMe(this._sheetSkeletonManagerService.currentSkeleton$.subscribe(() => this._updateFindHighlight()));
    this.disposeWithMe(
      merge(
        fromCallback(this._commandService.onCommandExecuted.bind(this._commandService)).pipe(
          filter(([command]) => {
            if (command.type === 2 /* MUTATION */ && command.params.unitId === this._workbook.getUnitId()) {
              return true;
            }
            ;
            if (command.id === SetSelectionsOperation.id && command.params.unitId === unitId) {
              const shouldFindBySelections = checkShouldFindInSelections();
              if (shouldFindBySelections === false && findBySelections === false) {
                return false;
              }
              findBySelections = shouldFindBySelections;
              return true;
            }
            return false;
          })
        ),
        // activeSheet$ is a BehaviorSubject, so we need to skip the first
        this._workbook.activeSheet$.pipe(skip(1))
      ).pipe(debounceTime(200)).subscribe(() => performFindInWorksheet())
    );
    performFindInWorksheet();
    return complete;
  }
  _findInRange(worksheet, query, range, unitId, dedupeFn) {
    const results = [];
    const subUnitId = worksheet.getSheetId();
    const iter = (query.findDirection === "column" /* COLUMN */ ? worksheet.iterateByColumn : worksheet.iterateByRow).bind(worksheet)(range);
    for (const value of iter) {
      const { row, col, colSpan, rowSpan, value: cellData } = value;
      if ((dedupeFn == null ? void 0 : dedupeFn(row, col)) || !cellData) {
        continue;
      }
      ;
      if (worksheet.getRowFiltered(row)) {
        continue;
      }
      const { hit, replaceable, isFormula } = hitCell(worksheet, row, col, query, cellData);
      if (hit) {
        const result = {
          provider: SHEETS_FIND_REPLACE_PROVIDER_NAME,
          unitId,
          replaceable,
          isFormula,
          range: {
            subUnitId,
            range: {
              startRow: row,
              startColumn: col,
              endColumn: col + (colSpan != null ? colSpan : 1) - 1,
              endRow: row + (rowSpan != null ? rowSpan : 1) - 1
            }
          }
        };
        results.push(result);
      }
    }
    return { results };
  }
  _findInSelections(worksheet, selections, query, unitId) {
    const { findDirection } = query;
    const sortFn = findDirection === "row" /* ROW */ ? isBehindPositionWithRowPriority : isBehindPositionWithColumnPriority;
    const dedupeSet = /* @__PURE__ */ new Set();
    const finds = selections.map((selection) => this._findInRange(worksheet, query, selection.range, unitId, (row, col) => {
      const key = `${row}-${col}`;
      if (dedupeSet.has(key)) return true;
      dedupeSet.add(key);
      return false;
    }).results).flat().sort((a, b) => sortFn(a.range.range, b.range.range) ? -1 : 1);
    return { results: finds };
  }
  /** Find matches in a given worksheet. */
  _findInWorksheet(worksheet, query, unitId) {
    const rowCount = worksheet.getRowCount();
    const colCount = worksheet.getColumnCount();
    const range = { startRow: 0, startColumn: 0, endRow: rowCount - 1, endColumn: colCount - 1 };
    return this._findInRange(worksheet, query, range, unitId);
  }
  _disposeHighlights() {
    var _a;
    this._highlightShapes.forEach((shape) => {
      var _a2;
      (_a2 = shape.getScene()) == null ? void 0 : _a2.makeDirty();
      shape.dispose();
    });
    this._highlightShapes = [];
    (_a = this._currentHighlightShape) == null ? void 0 : _a.dispose();
    this._currentHighlightShape = null;
  }
  _updateFindHighlight() {
    this._disposeHighlights();
    const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
    if (!skeleton) {
      return;
    }
    const unitId = this._workbook.getUnitId();
    const currentRender = this._renderManagerService.getRenderById(unitId);
    if (currentRender == null) {
      return;
    }
    const { scene } = currentRender;
    const matches = this._matches;
    const searchBackgroundColor = this._themeService.getColorFromTheme("yellow.400");
    const color = new ColorKit(searchBackgroundColor).toRgb();
    const worksheet = this._workbook.getActiveSheet();
    if (!worksheet) {
      return;
    }
    const activeSheetId = worksheet.getSheetId();
    const highlightShapes = matches.filter((match) => match.range.subUnitId === activeSheetId).map((find, index) => {
      const { startColumn, startRow, endColumn, endRow } = find.range.range;
      const startPosition = getCoordByCell(startRow, startColumn, scene, skeleton);
      const endPosition = getCoordByCell(endRow, endColumn, scene, skeleton);
      const { startX, startY } = startPosition;
      const { endX, endY } = endPosition;
      let isAllRowHidden = true;
      for (let row = startRow; row <= endRow; row++) {
        if (worksheet.getRowRawVisible(row)) {
          isAllRowHidden = false;
          break;
        }
      }
      let isAllColHidden = true;
      for (let col = startColumn; col <= endColumn; col++) {
        if (worksheet.getColVisible(col)) {
          isAllColHidden = false;
          break;
        }
      }
      const inHiddenRange = isAllRowHidden || isAllColHidden;
      const width = isAllColHidden ? 2 : endX - startX;
      const height = isAllRowHidden ? 2 : endY - startY;
      const props = {
        left: startX,
        top: startY,
        color,
        width,
        height,
        evented: false,
        inHiddenRange,
        zIndex: FIND_REPLACE_Z_INDEX
      };
      return new SheetFindReplaceHighlightShape(`find-highlight-${index}`, props);
    });
    scene.addObjects(highlightShapes);
    this._highlightShapes = highlightShapes;
    scene.makeDirty();
  }
  _updateCurrentHighlightShape(matchIndex) {
    var _a;
    (_a = this._currentHighlightShape) == null ? void 0 : _a.setShapeProps({ activated: false });
    this._currentHighlightShape = null;
    if (matchIndex !== void 0) {
      const shape = this._highlightShapes[matchIndex];
      if (!shape) {
        return;
      }
      this._currentHighlightShape = shape;
      shape.setShapeProps({ activated: true });
    }
  }
  _getSheetObject() {
    return getSheetObject(this._univerInstanceService, this._renderManagerService);
  }
  async _focusMatch(match) {
    var _a;
    const { subUnitId, range } = match.range;
    if (subUnitId !== ((_a = this._workbook.getActiveSheet()) == null ? void 0 : _a.getSheetId())) {
      const unitId = this._workbook.getUnitId();
      await this._commandService.executeCommand(
        SetWorksheetActivateCommand.id,
        {
          unitId,
          subUnitId
        },
        {
          fromFindReplace: true
        }
      );
    }
    this._commandService.executeCommand(
      ScrollToCellCommand.id,
      {
        range
      },
      {
        fromFindReplace: true
      }
    );
  }
  _tryRestoreLastMatchesPosition(lastMatch, newMatches) {
    if (!lastMatch) return 0;
    const { subUnitId: lastSubUnitId } = lastMatch.range;
    const { startColumn: lastStartColumn, startRow: lastStartRow } = lastMatch.range.range;
    const index = newMatches.findIndex((match) => {
      if (lastSubUnitId !== match.range.subUnitId) {
        return false;
      }
      const { startColumn, startRow } = match.range.range;
      return startColumn === lastStartColumn && startRow === lastStartRow;
    });
    return index > -1 ? index + 1 : 0;
  }
  moveToNextMatch(params) {
    var _a, _b, _c, _d;
    if (!this._matches.length) {
      return null;
    }
    const loop = (_a = params == null ? void 0 : params.loop) != null ? _a : false;
    const stayIfOnMatch = (_b = params == null ? void 0 : params.stayIfOnMatch) != null ? _b : false;
    const noFocus = (_c = params == null ? void 0 : params.noFocus) != null ? _c : false;
    const ignoreSelection = (_d = params == null ? void 0 : params.ignoreSelection) != null ? _d : false;
    const matchToMove = this._findNextMatch(loop, stayIfOnMatch, ignoreSelection);
    if (matchToMove) {
      const [match, index] = matchToMove;
      this._matchesPosition = index + 1;
      if (this._query.findScope === "unit" /* UNIT */) {
        this._activeHighlightIndex = this._matchesByWorksheet.get(match.range.subUnitId).findIndex((m) => m === match);
      } else {
        this._activeHighlightIndex = index;
      }
      if (!noFocus) this._focusMatch(match);
      this._updateCurrentHighlightShape(this._activeHighlightIndex);
      return match;
    }
    this._matchesPosition = 0;
    this._updateCurrentHighlightShape();
    return null;
  }
  moveToPreviousMatch(params) {
    var _a, _b, _c, _d;
    if (!this._matches.length) {
      return null;
    }
    const loop = (_a = params == null ? void 0 : params.loop) != null ? _a : false;
    const stayIfOnMatch = (_b = params == null ? void 0 : params.stayIfOnMatch) != null ? _b : false;
    const noFocus = (_c = params == null ? void 0 : params.noFocus) != null ? _c : false;
    const ignoreSelection = (_d = params == null ? void 0 : params.ignoreSelection) != null ? _d : false;
    const matchToMove = this._findPreviousMatch(loop, stayIfOnMatch, ignoreSelection);
    if (matchToMove) {
      const [match, index] = matchToMove;
      this._matchesPosition = index + 1;
      if (this._query.findScope === "unit" /* UNIT */) {
        this._activeHighlightIndex = this._matchesByWorksheet.get(match.range.subUnitId).findIndex((m) => m === match);
      } else {
        this._activeHighlightIndex = index;
      }
      if (!noFocus) this._focusMatch(match);
      this._updateCurrentHighlightShape(this._activeHighlightIndex);
      return match;
    }
    this._matchesPosition = 0;
    this._updateCurrentHighlightShape();
    return null;
  }
  _findPreviousMatch(loop = false, stayIfOnMatch = false, ignoreSelection = false) {
    var _a;
    if (this.currentMatch) {
      const currentMatchIndex = this._matches.findIndex((match) => match === this.currentMatch);
      if (stayIfOnMatch) {
        return [this.currentMatch, currentMatchIndex];
      }
      const nextMatchIndex = currentMatchIndex - 1;
      if (!loop && nextMatchIndex < 0) {
        return null;
      }
      const length = this._matches.length;
      const modded = (nextMatchIndex + length) % length;
      return [this._matches[modded], modded];
    }
    const lastSelection = this._workbookSelections.getCurrentLastSelection();
    if (ignoreSelection || !lastSelection) {
      const lastIndex = this._matches.length - 1;
      return [this._matches[lastIndex], lastIndex];
    }
    if (this._query.findScope !== "unit" /* UNIT */) {
      return this._findPreviousMatchByRange(this._matches, lastSelection.range);
    }
    const currentSheetId = (_a = this._workbook.getActiveSheet()) == null ? void 0 : _a.getSheetId();
    if (!currentSheetId) {
      return null;
    }
    const worksheetThatHasMatch = this._findPreviousWorksheetThatHasAMatch(currentSheetId, loop);
    if (!worksheetThatHasMatch) {
      return null;
    }
    return this._findPreviousMatchByRange(this._matchesByWorksheet.get(worksheetThatHasMatch), lastSelection.range);
  }
  _findNextMatch(loop = false, stayIfOnMatch = false, ignoreSelection = false) {
    var _a;
    if (this.currentMatch) {
      const currentMatchIndex = this._matches.findIndex((match) => match === this.currentMatch);
      if (stayIfOnMatch) {
        return [this.currentMatch, currentMatchIndex];
      }
      const nextMatchIndex = currentMatchIndex + 1;
      const length = this._matches.length;
      if (!loop && nextMatchIndex >= length) {
        return null;
      }
      const modded = nextMatchIndex % length;
      return [this._matches[modded], modded];
    }
    const last = this._workbookSelections.getCurrentLastSelection();
    if (ignoreSelection || !last) {
      return [this._matches[0], 0];
    }
    if (this._query.findScope !== "unit" /* UNIT */) {
      return this._findNextMatchByRange(this._matches, last.range, stayIfOnMatch);
    }
    const currentSheetId = (_a = this._workbook.getActiveSheet()) == null ? void 0 : _a.getSheetId();
    if (!currentSheetId) {
      return null;
    }
    const worksheetThatHasMatch = this._findNextWorksheetThatHasAMatch(currentSheetId, loop);
    if (!worksheetThatHasMatch) {
      return null;
    }
    return this._findNextMatchByRange(this._matchesByWorksheet.get(worksheetThatHasMatch), last.range);
  }
  _findPreviousWorksheetThatHasAMatch(currentWorksheet, loop = false) {
    const rawWorksheetsInOrder = this._workbook.getSheetOrders();
    const currentSheetIndex = rawWorksheetsInOrder.findIndex((sheet) => sheet === currentWorksheet);
    const worksheetsToSearch = loop ? rotate(rawWorksheetsInOrder, currentSheetIndex + 1) : rawWorksheetsInOrder.slice(0, currentSheetIndex + 1);
    const first = worksheetsToSearch.findLast((worksheet) => this._matchesByWorksheet.has(worksheet));
    return first != null ? first : null;
  }
  _findNextWorksheetThatHasAMatch(currentWorksheet, loop = false) {
    const rawWorksheetsInOrder = this._workbook.getSheetOrders();
    const currentSheetIndex = rawWorksheetsInOrder.findIndex((sheet) => sheet === currentWorksheet);
    const worksheetsToSearch = loop ? rotate(rawWorksheetsInOrder, currentSheetIndex) : rawWorksheetsInOrder.slice(currentSheetIndex);
    const first = worksheetsToSearch.find((worksheet) => this._matchesByWorksheet.has(worksheet));
    return first != null ? first : null;
  }
  _findNextMatchByRange(matches, range, stayIfOnMatch = false) {
    const findByRow = this._query.findDirection === "row" /* ROW */;
    let index = matches.findIndex((match2) => {
      const matchRange = match2.range.range;
      const isBehind = findByRow ? isBehindPositionWithRowPriority(range, matchRange) : isBehindPositionWithColumnPriority(range, matchRange);
      if (!isBehind) {
        return false;
      }
      const isSame = isSamePosition(range, matchRange);
      return stayIfOnMatch ? isSame : !isSame;
    });
    if (index === -1) {
      index = matches.length - 1;
    }
    const match = matches[index];
    return [match, this._matches.findIndex((m) => m === match)];
  }
  _findPreviousMatchByRange(matches, range, stayIfOnMatch = false) {
    const findByRow = this._query.findDirection === "row" /* ROW */;
    let index = this._matches.findLastIndex((match2) => {
      const matchRange = match2.range.range;
      const isBefore = findByRow ? isBeforePositionWithRowPriority(range, matchRange) : isBeforePositionWithColumnPriority(range, matchRange);
      if (!isBefore) {
        return false;
      }
      const isSame = isSamePosition(range, matchRange);
      return stayIfOnMatch ? isSame : !isSame;
    });
    if (index === -1) {
      index = 0;
    }
    const match = matches[index];
    return [match, this._matches.findIndex((m) => m === match)];
  }
  async replace(replaceString) {
    if (this._matchesCount === 0 || !this.currentMatch || !this._query || !this.currentMatch.replaceable) {
      return false;
    }
    const range = this.currentMatch.range;
    const targetWorksheet = this._workbook.getSheetBySheetId(this.currentMatch.range.subUnitId);
    const newContent = this._getReplacedCellData(
      this.currentMatch,
      targetWorksheet,
      this._query.findBy === "formula" /* FORMULA */,
      this._query.findString,
      replaceString,
      this._query.caseSensitive ? "g" : "ig"
    );
    const params = {
      unitId: this.currentMatch.unitId,
      subUnitId: range.subUnitId,
      value: {
        [range.range.startRow]: {
          [range.range.startColumn]: newContent
        }
      }
    };
    return this._commandService.executeCommand(SetRangeValuesCommand.id, params);
  }
  async replaceAll(replaceString) {
    if (this._matchesCount === 0 || !this._query) {
      return { success: 0, failure: 0 };
    }
    const unitId = this._workbook.getUnitId();
    const { findString, caseSensitive, findBy } = this._query;
    const shouldReplaceFormula = findBy === "formula" /* FORMULA */;
    const replaceFlag = caseSensitive ? "g" : "ig";
    const replacements = [];
    const matchesByWorksheet = groupBy(this._matches.filter((m) => m.replaceable), (match) => match.range.subUnitId);
    matchesByWorksheet.forEach((matches, subUnitId) => {
      const matrix = new ObjectMatrix();
      const worksheet = this._workbook.getSheetBySheetId(subUnitId);
      matches.forEach((match) => {
        const { startColumn, startRow } = match.range.range;
        const newCellData = this._getReplacedCellData(match, worksheet, shouldReplaceFormula, findString, replaceString, replaceFlag);
        if (newCellData) {
          matrix.setValue(startRow, startColumn, newCellData);
        }
      });
      replacements.push({
        count: matches.length,
        subUnitId,
        value: matrix.getMatrix()
      });
    });
    if (!replacements) {
      return { success: 0, failure: 0 };
    }
    return this._commandService.executeCommand(SheetReplaceCommand.id, {
      unitId,
      replacements
    });
  }
  _getReplacedCellData(match, worksheet, shouldReplaceFormula, findString, replaceString, replaceFlag) {
    var _a;
    const range = match.range.range;
    const { startRow, startColumn } = range;
    const currentContent = worksheet.getCellRaw(startRow, startColumn);
    if (match.isFormula) {
      if (!shouldReplaceFormula) {
        return null;
      }
      const newContent2 = currentContent.f.replace(new RegExp(escapeRegExp(findString), replaceFlag), replaceString);
      return { f: newContent2, v: null };
    }
    const isRichText = !!((_a = currentContent.p) == null ? void 0 : _a.body);
    if (isRichText) {
      const clonedRichText = Tools.deepClone(currentContent.p);
      replaceInDocumentBody(clonedRichText.body, findString, replaceString, this._query.caseSensitive);
      return { p: clonedRichText };
    }
    const newContent = currentContent.v.toString().replace(new RegExp(escapeRegExp(findString), replaceFlag), replaceString);
    return { v: newContent };
  }
};
SheetFindModel = __decorateClass([
  __decorateParam(2, IUniverInstanceService),
  __decorateParam(3, IRenderManagerService),
  __decorateParam(4, ICommandService),
  __decorateParam(5, IContextService),
  __decorateParam(6, Inject(ThemeService)),
  __decorateParam(7, Inject(SheetsSelectionsService))
], SheetFindModel);
var SheetsFindReplaceProvider = class extends Disposable {
  constructor(_univerInstanceService, _renderManagerService, _injector) {
    super();
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_injector", _injector);
    /**
     * Hold all find results in this kind of univer business instances (Workbooks).
     */
    __publicField(this, "_findModelsByUnitId", /* @__PURE__ */ new Map());
  }
  async find(query) {
    this._terminate();
    const workbook = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    if (!workbook) return [];
    const parsedQuery = this._preprocessQuery(query);
    const skeletonManagerService = this._renderManagerService.getRenderById(workbook.getUnitId()).with(SheetSkeletonManagerService);
    const sheetFind = this._injector.createInstance(SheetFindModel, workbook, skeletonManagerService);
    this._findModelsByUnitId.set(workbook.getUnitId(), sheetFind);
    sheetFind.start(parsedQuery);
    return [sheetFind];
  }
  terminate() {
    this._terminate();
  }
  _terminate() {
    this._findModelsByUnitId.forEach((model) => model.dispose());
    this._findModelsByUnitId.clear();
  }
  /**
   * Parsed the query object before do actual searching in favor of performance.
   * @param query the raw query object
   * @returns the parsed query object
   */
  _preprocessQuery(query) {
    let findString = query.caseSensitive ? query.findString : query.findString.toLowerCase();
    findString = findString.trim();
    return {
      ...query,
      findString
    };
  }
};
SheetsFindReplaceProvider = __decorateClass([
  __decorateParam(0, IUniverInstanceService),
  __decorateParam(1, IRenderManagerService),
  __decorateParam(2, Inject(Injector))
], SheetsFindReplaceProvider);
var VALUE_PASSING_OBJECT = { hit: false, replaceable: false, isFormula: false, rawData: null };
function hitCell(worksheet, row, col, query, cellData) {
  const { findBy } = query;
  const findByFormula = findBy === "formula" /* FORMULA */;
  const rawData = worksheet.getCellRaw(row, col);
  VALUE_PASSING_OBJECT.rawData = rawData;
  const hasFormula = !!(rawData == null ? void 0 : rawData.f);
  if (hasFormula) {
    VALUE_PASSING_OBJECT.isFormula = true;
    if (findByFormula) {
      const formulaMatch = matchCellData({ v: rawData.f }, query);
      if (formulaMatch) {
        VALUE_PASSING_OBJECT.hit = true;
        VALUE_PASSING_OBJECT.replaceable = true;
        return VALUE_PASSING_OBJECT;
      }
      VALUE_PASSING_OBJECT.hit = false;
      VALUE_PASSING_OBJECT.replaceable = false;
      return VALUE_PASSING_OBJECT;
    }
    VALUE_PASSING_OBJECT.replaceable = false;
    if (matchCellData(cellData, query)) {
      VALUE_PASSING_OBJECT.hit = true;
    } else {
      VALUE_PASSING_OBJECT.hit = false;
    }
    return VALUE_PASSING_OBJECT;
  }
  VALUE_PASSING_OBJECT.isFormula = false;
  if (!matchCellData(cellData, query)) {
    VALUE_PASSING_OBJECT.hit = false;
    VALUE_PASSING_OBJECT.replaceable = false;
  } else if (!rawData) {
    VALUE_PASSING_OBJECT.hit = true;
    VALUE_PASSING_OBJECT.replaceable = false;
  } else {
    VALUE_PASSING_OBJECT.hit = true;
    VALUE_PASSING_OBJECT.replaceable = true;
  }
  return VALUE_PASSING_OBJECT;
}
function matchCellData(cellData, query) {
  let value = extractPureValue(cellData);
  if (!value) {
    return false;
  }
  if (query.matchesTheWholeCell) {
    value = trimLeadingTrailingWhitespace(value);
    return query.caseSensitive ? value === query.findString : value.toLowerCase() === query.findString;
  }
  return query.caseSensitive ? value.indexOf(query.findString) > -1 : value.toLowerCase().indexOf(query.findString) > -1;
}
function extractPureValue(cell) {
  var _a, _b, _c;
  const rawValue = (_c = (_b = (_a = cell == null ? void 0 : cell.p) == null ? void 0 : _a.body) == null ? void 0 : _b.dataStream) != null ? _c : cell == null ? void 0 : cell.v;
  if (typeof rawValue === "number") {
    return `${rawValue}`;
  }
  if (typeof rawValue === "boolean") {
    return rawValue ? "1" : "0";
  }
  return rawValue;
}
function trimLeadingTrailingWhitespace(value) {
  return value.replace(/^ +/g, "").replace(/ +$/g, "");
}

// ../packages/sheets-find-replace/src/plugin.ts
var UniverSheetsFindReplacePlugin = class extends Plugin {
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
    this._configService.setConfig(SHEETS_FIND_REPLACE_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    [[SheetsFindReplaceController]].forEach((d) => this._injector.add(d));
  }
  onSteady() {
    this._injector.get(SheetsFindReplaceController);
  }
};
__publicField(UniverSheetsFindReplacePlugin, "pluginName", "SHEET_FIND_REPLACE_PLUGIN");
__publicField(UniverSheetsFindReplacePlugin, "packageName", package_default.name);
__publicField(UniverSheetsFindReplacePlugin, "version", package_default.version);
__publicField(UniverSheetsFindReplacePlugin, "type", 2 /* UNIVER_SHEET */);
UniverSheetsFindReplacePlugin = __decorateClass([
  DependentOn(UniverSheetsPlugin, UniverSheetsPlugin, UniverFindReplacePlugin),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IConfigService)
], UniverSheetsFindReplacePlugin);

export {
  UniverSheetsFindReplacePlugin
};
