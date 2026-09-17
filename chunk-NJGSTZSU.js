import {
  AddCommentMutation,
  DeleteCommentMutation,
  IThreadCommentDataSourceService,
  ThreadCommentModel,
  UniverThreadCommentPlugin,
  UpdateCommentRefMutation
} from "./chunk-CER5CEC6.js";
import {
  CopySheetCommand,
  RefRangeService,
  RemoveSheetCommand,
  SheetInterceptorService,
  SheetsSelectionsService,
  handleCommonRangeChangeWithEffectRefCommandsSkipNoInterests,
  serializeRange,
  singleReferenceToGrid
} from "./chunk-Q6Y4PHRI.js";
import {
  DependentOn,
  Disposable,
  ICommandService,
  IUniverInstanceService,
  Inject,
  Injector,
  ObjectMatrix,
  Plugin,
  Subject,
  generateRandomId,
  sequenceExecuteAsync,
  toDisposable,
  touchDependencies
} from "./chunk-EJSPXROI.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField
} from "./chunk-24OICD5T.js";

// ../packages/sheets-thread-comment/package.json
var package_default = {
  name: "@univerjs/sheets-thread-comment",
  version: "0.25.2",
  private: false,
  description: "Thread comment integration for Univer Sheets.",
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
    "comment",
    "thread-comment",
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
    "@univerjs/engine-formula": "workspace:*",
    "@univerjs/sheets": "workspace:*",
    "@univerjs/thread-comment": "workspace:*"
  },
  devDependencies: {
    "@univerjs-infra/shared": "workspace:*",
    rxjs: "^7.8.2",
    typescript: "^6.0.3",
    vitest: "^4.1.7"
  }
};

// ../packages/sheets-thread-comment/src/config/config.ts
var SHEETS_THREAD_COMMENT_PLUGIN_CONFIG_KEY = "sheets-thread-comment.config";
var configSymbol = Symbol(SHEETS_THREAD_COMMENT_PLUGIN_CONFIG_KEY);
var defaultPluginConfig = {};

// ../packages/sheets-thread-comment/src/models/sheets-thread-comment.model.ts
var SheetsThreadCommentModel = class extends Disposable {
  constructor(_threadCommentModel, _univerInstanceService) {
    super();
    __publicField(this, "_threadCommentModel", _threadCommentModel);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_matrixMap", /* @__PURE__ */ new Map());
    __publicField(this, "_locationMap", /* @__PURE__ */ new Map());
    __publicField(this, "_commentUpdate$", new Subject());
    __publicField(this, "commentUpdate$", this._commentUpdate$.asObservable());
    this._init();
    this.disposeWithMe(() => {
      this._commentUpdate$.complete();
    });
  }
  _init() {
    this._initData();
    this._initUpdateTransform();
  }
  _ensureCommentMatrix(unitId, subUnitId) {
    let unitMap = this._matrixMap.get(unitId);
    if (!unitMap) {
      unitMap = /* @__PURE__ */ new Map();
      this._matrixMap.set(unitId, unitMap);
    }
    let subUnitMap = unitMap.get(subUnitId);
    if (!subUnitMap) {
      subUnitMap = new ObjectMatrix();
      unitMap.set(subUnitId, subUnitMap);
    }
    return subUnitMap;
  }
  _ensureCommentLocationMap(unitId, subUnitId) {
    let unitMap = this._locationMap.get(unitId);
    if (!unitMap) {
      unitMap = /* @__PURE__ */ new Map();
      this._locationMap.set(unitId, unitMap);
    }
    let subUnitMap = unitMap.get(subUnitId);
    if (!subUnitMap) {
      subUnitMap = /* @__PURE__ */ new Map();
      unitMap.set(subUnitId, subUnitMap);
    }
    return subUnitMap;
  }
  _addCommentToMatrix(matrix, row, column, commentId) {
    var _a;
    const current = (_a = matrix.getValue(row, column)) != null ? _a : /* @__PURE__ */ new Set();
    current.add(commentId);
    matrix.setValue(row, column, current);
  }
  _deleteCommentFromMatrix(matrix, row, column, commentId) {
    if (row >= 0 && column >= 0) {
      const current = matrix.getValue(row, column);
      if (current && current.has(commentId)) {
        current.delete(commentId);
        if (current.size === 0) {
          matrix.realDeleteValue(row, column);
        }
      }
    }
  }
  _ensure(unitId, subUnitId) {
    const matrix = this._ensureCommentMatrix(unitId, subUnitId);
    const locationMap = this._ensureCommentLocationMap(unitId, subUnitId);
    return { matrix, locationMap };
  }
  _initData() {
    const datas = this._threadCommentModel.getAll();
    for (const data of datas) {
      for (const thread of data.threads) {
        const { unitId, subUnitId, root } = thread;
        this._addComment(unitId, subUnitId, root);
      }
    }
  }
  _addComment(unitId, subUnitId, comment) {
    const location = singleReferenceToGrid(comment.ref);
    const parentId = comment.parentId;
    const { row, column } = location;
    const commentId = comment.id;
    const { matrix, locationMap } = this._ensure(unitId, subUnitId);
    if (!parentId && row >= 0 && column >= 0) {
      this._addCommentToMatrix(matrix, row, column, commentId);
      locationMap.set(commentId, { row, column });
    }
    if (!parentId) {
      this._commentUpdate$.next({
        unitId,
        subUnitId,
        payload: comment,
        type: "add",
        isRoot: !parentId,
        ...location
      });
    }
  }
  // eslint-disable-next-line max-lines-per-function
  _initUpdateTransform() {
    this.disposeWithMe(this._threadCommentModel.commentUpdate$.subscribe((update) => {
      const { unitId, subUnitId } = update;
      try {
        const type = this._univerInstanceService.getUnitType(unitId);
        if (type !== 2 /* UNIVER_SHEET */) {
          return;
        }
      } catch (error) {
      }
      const { matrix, locationMap } = this._ensure(unitId, subUnitId);
      switch (update.type) {
        case "add": {
          this._addComment(update.unitId, update.subUnitId, update.payload);
          break;
        }
        case "delete": {
          const { isRoot, comment } = update.payload;
          if (isRoot) {
            const location = singleReferenceToGrid(comment.ref);
            const { row, column } = location;
            this._deleteCommentFromMatrix(matrix, row, column, comment.id);
            this._commentUpdate$.next({
              ...update,
              ...location
            });
          }
          break;
        }
        case "update": {
          const { commentId } = update.payload;
          const comment = this._threadCommentModel.getComment(unitId, subUnitId, commentId);
          if (!comment) {
            return;
          }
          const location = singleReferenceToGrid(comment.ref);
          this._commentUpdate$.next({
            ...update,
            ...location
          });
          break;
        }
        case "updateRef": {
          const location = singleReferenceToGrid(update.payload.ref);
          const { commentId } = update.payload;
          const currentLoc = locationMap.get(commentId);
          if (!currentLoc) {
            return;
          }
          const { row, column } = currentLoc;
          this._deleteCommentFromMatrix(matrix, row, column, commentId);
          locationMap.delete(commentId);
          if (location.row >= 0 && location.column >= 0) {
            this._addCommentToMatrix(matrix, location.row, location.column, commentId);
            locationMap.set(commentId, { row: location.row, column: location.column });
          }
          this._commentUpdate$.next({
            ...update,
            ...location
          });
          break;
        }
        case "resolve": {
          const { unitId: unitId2, subUnitId: subUnitId2, payload } = update;
          const { locationMap: locationMap2 } = this._ensure(unitId2, subUnitId2);
          const location = locationMap2.get(payload.commentId);
          if (location) {
            this._commentUpdate$.next({
              ...update,
              ...location
            });
          }
          break;
        }
        default:
          break;
      }
    }));
  }
  getByLocation(unitId, subUnitId, row, column) {
    var _a;
    const comments = this.getAllByLocation(unitId, subUnitId, row, column);
    const activeComments = comments.filter((comment) => !comment.resolved);
    return (_a = activeComments[0]) == null ? void 0 : _a.id;
  }
  getAllByLocation(unitId, subUnitId, row, column) {
    const matrix = this._ensureCommentMatrix(unitId, subUnitId);
    const current = matrix.getValue(row, column);
    if (!current) {
      return [];
    }
    const comments = [];
    for (const id of current) {
      const comment = this.getComment(unitId, subUnitId, id);
      if (comment) {
        comments.push(comment);
      }
    }
    return comments;
  }
  getComment(unitId, subUnitId, commentId) {
    return this._threadCommentModel.getComment(unitId, subUnitId, commentId);
  }
  getCommentWithChildren(unitId, subUnitId, row, column) {
    const commentId = this.getByLocation(unitId, subUnitId, row, column);
    if (!commentId) {
      return void 0;
    }
    const comment = this.getComment(unitId, subUnitId, commentId);
    if (!comment) {
      return void 0;
    }
    return this._threadCommentModel.getThread(unitId, subUnitId, comment.threadId);
  }
  showCommentMarker(unitId, subUnitId, row, column) {
    const commentId = this.getByLocation(unitId, subUnitId, row, column);
    if (!commentId) {
      return false;
    }
    const comment = this.getComment(unitId, subUnitId, commentId);
    if (comment && !comment.resolved) {
      return true;
    }
    return false;
  }
  getSubUnitAll(unitId, subUnitId) {
    return this._threadCommentModel.getUnit(unitId).filter((i) => i.subUnitId === subUnitId).map((i) => i.root);
  }
};
SheetsThreadCommentModel = __decorateClass([
  __decorateParam(0, Inject(ThreadCommentModel)),
  __decorateParam(1, IUniverInstanceService)
], SheetsThreadCommentModel);

// ../packages/sheets-thread-comment/src/controllers/sheets-thread-comment-ref-range.controller.ts
var SheetsThreadCommentRefRangeController = class extends Disposable {
  constructor(_refRangeService, _sheetsThreadCommentModel, _threadCommentModel, _selectionManagerService, _commandService) {
    super();
    __publicField(this, "_refRangeService", _refRangeService);
    __publicField(this, "_sheetsThreadCommentModel", _sheetsThreadCommentModel);
    __publicField(this, "_threadCommentModel", _threadCommentModel);
    __publicField(this, "_selectionManagerService", _selectionManagerService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_disposableMap", /* @__PURE__ */ new Map());
    __publicField(this, "_watcherMap", /* @__PURE__ */ new Map());
    __publicField(this, "_handleRangeChange", (unitId, subUnitId, comment, resultRange, silent) => {
      const commentId = comment.id;
      const oldRange = {
        startColumn: comment.column,
        endColumn: comment.column,
        startRow: comment.row,
        endRow: comment.row
      };
      if (!resultRange) {
        return {
          redos: [{
            id: DeleteCommentMutation.id,
            params: {
              unitId,
              subUnitId,
              commentId
            }
          }],
          undos: [{
            id: AddCommentMutation.id,
            params: {
              unitId,
              subUnitId,
              comment,
              sync: true
            }
          }]
        };
      }
      return {
        redos: [{
          id: UpdateCommentRefMutation.id,
          params: {
            unitId,
            subUnitId,
            payload: {
              ref: serializeRange(resultRange),
              commentId
            },
            silent
          }
        }],
        undos: [{
          id: UpdateCommentRefMutation.id,
          params: {
            unitId,
            subUnitId,
            payload: {
              ref: serializeRange(oldRange),
              commentId
            },
            silent
          }
        }]
      };
    });
    this._initData();
    this._initRefRange();
  }
  _getIdWithUnitId(unitId, subUnitId, id) {
    return `${unitId}-${subUnitId}-${id}`;
  }
  _register(unitId, subUnitId, comment) {
    const commentId = comment.id;
    const oldRange = {
      startColumn: comment.column,
      endColumn: comment.column,
      startRow: comment.row,
      endRow: comment.row
    };
    this._disposableMap.set(
      this._getIdWithUnitId(unitId, subUnitId, commentId),
      this._refRangeService.registerRefRange(oldRange, (commandInfo) => {
        const resultRanges = handleCommonRangeChangeWithEffectRefCommandsSkipNoInterests(oldRange, commandInfo, { selectionManagerService: this._selectionManagerService });
        const resultRange = Array.isArray(resultRanges) ? resultRanges[0] : resultRanges;
        if (resultRange && resultRange.startColumn === oldRange.startColumn && resultRange.startRow === oldRange.startRow) {
          return {
            undos: [],
            redos: []
          };
        }
        const res = this._handleRangeChange(unitId, subUnitId, comment, resultRange, false);
        return res;
      }, unitId, subUnitId)
    );
  }
  _watch(unitId, subUnitId, comment) {
    const commentId = comment.id;
    const oldRange = {
      startColumn: comment.column,
      endColumn: comment.column,
      startRow: comment.row,
      endRow: comment.row
    };
    this._watcherMap.set(
      this._getIdWithUnitId(unitId, subUnitId, commentId),
      this._refRangeService.watchRange(unitId, subUnitId, oldRange, (before, after) => {
        const { redos } = this._handleRangeChange(unitId, subUnitId, comment, after, true);
        sequenceExecuteAsync(redos, this._commandService, { onlyLocal: true });
      }, true)
    );
  }
  _unwatch(unitId, subUnitId, commentId) {
    var _a;
    const id = this._getIdWithUnitId(unitId, subUnitId, commentId);
    (_a = this._watcherMap.get(id)) == null ? void 0 : _a.dispose();
    this._watcherMap.delete(id);
  }
  _unregister(unitId, subUnitId, commentId) {
    var _a;
    const id = this._getIdWithUnitId(unitId, subUnitId, commentId);
    (_a = this._disposableMap.get(id)) == null ? void 0 : _a.dispose();
    this._disposableMap.delete(id);
  }
  _initData() {
    const datas = this._threadCommentModel.getAll();
    for (const data of datas) {
      for (const thread of data.threads) {
        const { unitId, subUnitId, root } = thread;
        const pos = singleReferenceToGrid(root.ref);
        const sheetComment = {
          ...root,
          ...pos
        };
        this._register(unitId, subUnitId, sheetComment);
        this._watch(unitId, subUnitId, sheetComment);
      }
    }
  }
  _initRefRange() {
    this.disposeWithMe(
      this._sheetsThreadCommentModel.commentUpdate$.subscribe((option) => {
        const { unitId, subUnitId } = option;
        switch (option.type) {
          case "add": {
            if (option.payload.parentId) {
              return;
            }
            const comment = {
              ...option.payload,
              row: option.row,
              column: option.column
            };
            this._register(option.unitId, option.subUnitId, comment);
            this._watch(option.unitId, option.subUnitId, comment);
            break;
          }
          case "delete": {
            this._unregister(unitId, subUnitId, option.payload.commentId);
            this._unwatch(unitId, subUnitId, option.payload.commentId);
            break;
          }
          case "updateRef": {
            const comment = this._sheetsThreadCommentModel.getComment(unitId, subUnitId, option.payload.commentId);
            if (!comment) {
              return;
            }
            this._unregister(unitId, subUnitId, option.payload.commentId);
            const sheetComment = {
              ...comment,
              row: option.row,
              column: option.column
            };
            if (!option.silent) {
              this._unwatch(unitId, subUnitId, option.payload.commentId);
              this._watch(unitId, subUnitId, sheetComment);
            }
            this._register(option.unitId, option.subUnitId, sheetComment);
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
SheetsThreadCommentRefRangeController = __decorateClass([
  __decorateParam(0, Inject(RefRangeService)),
  __decorateParam(1, Inject(SheetsThreadCommentModel)),
  __decorateParam(2, Inject(ThreadCommentModel)),
  __decorateParam(3, Inject(SheetsSelectionsService)),
  __decorateParam(4, ICommandService)
], SheetsThreadCommentRefRangeController);

// ../packages/sheets-thread-comment/src/controllers/sheets-thread-comment-resource.controller.ts
var SheetsThreadCommentResourceController = class extends Disposable {
  constructor(_univerInstanceService, _sheetInterceptorService, _threadCommentModel, _threadCommentDataSourceService) {
    super();
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_threadCommentModel", _threadCommentModel);
    __publicField(this, "_threadCommentDataSourceService", _threadCommentDataSourceService);
    this._initSheetChange();
  }
  // eslint-disable-next-line max-lines-per-function
  _initSheetChange() {
    this.disposeWithMe(
      this._sheetInterceptorService.interceptCommand({
        // eslint-disable-next-line max-lines-per-function
        getMutations: (commandInfo) => {
          var _a;
          if (commandInfo.id === RemoveSheetCommand.id) {
            const params = commandInfo.params;
            const unitId = params.unitId || this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */).getUnitId();
            const subUnitId = params.subUnitId || ((_a = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */).getActiveSheet()) == null ? void 0 : _a.getSheetId());
            if (!unitId || !subUnitId) {
              return { redos: [], undos: [] };
            }
            const commentMap = this._threadCommentModel.ensureMap(unitId, subUnitId);
            const comments = Array.from(commentMap.values()).filter((comment) => !comment.parentId);
            const shouldSync = this._threadCommentDataSourceService.syncUpdateMutationToColla;
            const redos = [];
            const undos = [];
            comments.forEach(({ children, ...comment }) => {
              redos.push({
                id: DeleteCommentMutation.id,
                params: {
                  unitId,
                  subUnitId,
                  commentId: comment.id
                }
              });
              undos.push({
                id: AddCommentMutation.id,
                params: {
                  unitId,
                  subUnitId,
                  comment: {
                    ...comment,
                    children: shouldSync ? children : void 0
                  },
                  sync: !shouldSync
                }
              });
            });
            return { redos, undos };
          } else if (commandInfo.id === CopySheetCommand.id) {
            const params = commandInfo.params;
            const { unitId, subUnitId, targetSubUnitId } = params;
            if (!unitId || !subUnitId || !targetSubUnitId) {
              return { redos: [], undos: [] };
            }
            const commentMap = this._threadCommentModel.ensureMap(unitId, subUnitId);
            const comments = Array.from(commentMap.values()).map((comment) => {
              return {
                ...comment,
                subUnitId: targetSubUnitId,
                id: generateRandomId(),
                threadId: generateRandomId()
              };
            }).filter((comment) => !comment.parentId);
            const shouldSync = this._threadCommentDataSourceService.syncUpdateMutationToColla;
            const redos = [];
            const undos = [];
            comments.forEach(({ children, ...comment }) => {
              redos.push({
                id: AddCommentMutation.id,
                params: {
                  unitId,
                  subUnitId: targetSubUnitId,
                  comment: {
                    ...comment,
                    children: shouldSync ? children : void 0
                  },
                  sync: !shouldSync
                }
              });
              undos.push({
                id: DeleteCommentMutation.id,
                params: {
                  unitId,
                  subUnitId: targetSubUnitId,
                  commentId: comment.id
                }
              });
            });
            return { redos, undos };
          }
          return { redos: [], undos: [] };
        }
      })
    );
  }
};
SheetsThreadCommentResourceController = __decorateClass([
  __decorateParam(0, IUniverInstanceService),
  __decorateParam(1, Inject(SheetInterceptorService)),
  __decorateParam(2, Inject(ThreadCommentModel)),
  __decorateParam(3, IThreadCommentDataSourceService)
], SheetsThreadCommentResourceController);

// ../packages/sheets-thread-comment/src/types/const.ts
var SHEET_THREAD_COMMENT_BASE = "SHEET_THREAD_COMMENT_BASE_PLUGIN";

// ../packages/sheets-thread-comment/src/plugin.ts
var UniverSheetsThreadCommentPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig, _injector, _commandService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_commandService", _commandService);
  }
  onStarting() {
    [
      [SheetsThreadCommentModel],
      [SheetsThreadCommentRefRangeController],
      [SheetsThreadCommentResourceController]
    ].forEach((dep) => {
      this._injector.add(dep);
    });
    touchDependencies(this._injector, [
      [SheetsThreadCommentRefRangeController],
      [SheetsThreadCommentResourceController]
    ]);
  }
};
__publicField(UniverSheetsThreadCommentPlugin, "pluginName", SHEET_THREAD_COMMENT_BASE);
__publicField(UniverSheetsThreadCommentPlugin, "packageName", package_default.name);
__publicField(UniverSheetsThreadCommentPlugin, "version", package_default.version);
__publicField(UniverSheetsThreadCommentPlugin, "type", 2 /* UNIVER_SHEET */);
UniverSheetsThreadCommentPlugin = __decorateClass([
  DependentOn(UniverThreadCommentPlugin),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, Inject(ICommandService))
], UniverSheetsThreadCommentPlugin);

export {
  SheetsThreadCommentModel,
  UniverSheetsThreadCommentPlugin
};
