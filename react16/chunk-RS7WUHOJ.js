import {
  SetActiveCommentOperation,
  ThreadCommentPanel,
  ThreadCommentPanelService,
  ThreadCommentTree,
  UniverThreadCommentUIPlugin
} from "./chunk-3WOCRIC2.js";
import {
  SheetsThreadCommentModel,
  UniverSheetsThreadCommentPlugin
} from "./chunk-NJGSTZSU.js";
import {
  AddCommentCommand,
  AddCommentMutation,
  DeleteCommentCommand,
  DeleteCommentMutation,
  DeleteCommentTreeCommand,
  IThreadCommentDataSourceService,
  ResolveCommentCommand,
  UpdateCommentCommand
} from "./chunk-CER5CEC6.js";
import {
  CellPopupManagerService,
  HoverManagerService,
  IEditorBridgeService,
  IMarkSelectionService,
  ISheetClipboardService,
  ScrollToRangeOperation,
  SheetCanvasPopManagerService,
  SheetSkeletonManagerService,
  getCurrentRangeDisable$,
  whenSheetEditorFocused
} from "./chunk-BHQGV2VJ.js";
import {
  CommentIcon,
  ComponentManager,
  IMenuManagerService,
  IShortcutService,
  ISidebarService,
  IZenZoneService,
  getMenuHiddenObservable,
  require_jsx_runtime,
  require_react,
  useDependency,
  useObservable
} from "./chunk-VNXQUZSG.js";
import {
  INTERCEPTOR_POINT,
  RangeProtectionPermissionViewPoint,
  SetWorksheetActiveOperation,
  SheetInterceptorService,
  SheetPermissionCheckController,
  SheetsSelectionsService,
  WorkbookCommentPermission,
  WorksheetViewPermission,
  getSheetCommandTarget,
  serializeRange,
  singleReferenceToGrid
} from "./chunk-Q6Y4PHRI.js";
import {
  IRenderManagerService
} from "./chunk-XOCU2XR6.js";
import {
  BehaviorSubject,
  DependentOn,
  Disposable,
  DisposableCollection,
  ICommandService,
  IConfigService,
  IUniverInstanceService,
  Inject,
  Injector,
  LocaleService,
  Plugin,
  Range,
  Rectangle,
  Tools,
  debounceTime,
  map,
  merge_default
} from "./chunk-EJSPXROI.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField,
  __toESM
} from "./chunk-24OICD5T.js";

// ../packages/sheets-thread-comment-ui/package.json
var package_default = {
  name: "@univerjs/sheets-thread-comment-ui",
  version: "0.25.2",
  private: false,
  description: "Thread comment UI integration for Univer Sheets.",
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
    "ui"
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
    "@univerjs/engine-formula": "workspace:*",
    "@univerjs/engine-render": "workspace:*",
    "@univerjs/icons": "1.4.0",
    "@univerjs/sheets": "workspace:*",
    "@univerjs/sheets-thread-comment": "workspace:*",
    "@univerjs/sheets-ui": "workspace:*",
    "@univerjs/thread-comment": "workspace:*",
    "@univerjs/thread-comment-ui": "workspace:*",
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

// ../packages/sheets-thread-comment-ui/src/types/const.ts
var SHEETS_THREAD_COMMENT_MODAL = "univer.sheet.thread-comment-modal";
var SHEETS_THREAD_COMMENT_PANEL = "univer.sheet.thread-comment-panel";
var PLUGIN_NAME = "SHEET_THREAD_COMMENT_UI_PLUGIN";

// ../packages/sheets-thread-comment-ui/src/services/sheets-thread-comment-popup.service.ts
var SheetsThreadCommentPopupService = class extends Disposable {
  constructor(_canvasPopupManagerService, _zenZoneService, _cellPopupManagerService) {
    super();
    __publicField(this, "_canvasPopupManagerService", _canvasPopupManagerService);
    __publicField(this, "_zenZoneService", _zenZoneService);
    __publicField(this, "_cellPopupManagerService", _cellPopupManagerService);
    __publicField(this, "_lastPopup", null);
    __publicField(this, "_activePopup");
    __publicField(this, "_activePopup$", new BehaviorSubject(null));
    __publicField(this, "activePopup$", this._activePopup$.asObservable());
    this._initZenVisible();
    this.disposeWithMe(() => {
      this._activePopup$.complete();
    });
  }
  get activePopup() {
    return this._activePopup;
  }
  _initZenVisible() {
    this.disposeWithMe(this._zenZoneService.visible$.subscribe((visible) => {
      if (visible) {
        this.hidePopup();
      }
    }));
  }
  dispose() {
    super.dispose();
    this.hidePopup();
  }
  showPopup(location, onHide) {
    var _a;
    const { row, col, unitId, subUnitId } = location;
    if (this._activePopup && row === this._activePopup.row && col === this._activePopup.col && unitId === this._activePopup.unitId && subUnitId === ((_a = this.activePopup) == null ? void 0 : _a.subUnitId)) {
      this._activePopup = location;
      this._activePopup$.next(location);
      return;
    }
    if (this._lastPopup) {
      this._lastPopup.dispose();
    }
    ;
    if (this._zenZoneService.visible) {
      return;
    }
    this._activePopup = location;
    this._activePopup$.next(location);
    const popupDisposable = this._cellPopupManagerService.showPopup(
      {
        row,
        col,
        unitId,
        subUnitId
      },
      {
        componentKey: SHEETS_THREAD_COMMENT_MODAL,
        onClickOutside: () => {
          this.hidePopup();
        },
        direction: "horizontal",
        excludeOutside: [
          ...Array.from(document.querySelectorAll(".univer-thread-comment")),
          document.getElementById("thread-comment-add")
        ].filter(Boolean),
        priority: 2
      }
    );
    if (!popupDisposable) {
      throw new Error("[SheetsThreadCommentPopupService]: cannot show popup!");
    }
    const disposableCollection = new DisposableCollection();
    disposableCollection.add(popupDisposable);
    disposableCollection.add({
      dispose: () => {
        onHide == null ? void 0 : onHide();
      }
    });
    this._lastPopup = disposableCollection;
  }
  hidePopup() {
    if (!this._activePopup) {
      return;
    }
    if (this._lastPopup) {
      this._lastPopup.dispose();
    }
    this._lastPopup = null;
    this._activePopup = null;
    this._activePopup$.next(null);
  }
  persistPopup() {
    if (!this._activePopup || !this._activePopup.temp) {
      return;
    }
    this._activePopup = {
      ...this._activePopup,
      temp: false
    };
    this._activePopup$.next(this._activePopup);
  }
};
SheetsThreadCommentPopupService = __decorateClass([
  __decorateParam(0, Inject(SheetCanvasPopManagerService)),
  __decorateParam(1, IZenZoneService),
  __decorateParam(2, Inject(CellPopupManagerService))
], SheetsThreadCommentPopupService);

// ../packages/sheets-thread-comment-ui/src/commands/operations/comment.operation.ts
var ShowAddSheetCommentModalOperation = {
  type: 1 /* OPERATION */,
  id: "sheet.operation.show-comment-modal",
  handler(accessor) {
    var _a;
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const sheetsThreadCommentPopupService = accessor.get(SheetsThreadCommentPopupService);
    const threadCommentPanelService = accessor.get(ThreadCommentPanelService);
    const activeCell = (_a = selectionManagerService.getCurrentLastSelection()) == null ? void 0 : _a.primary;
    const model = accessor.get(SheetsThreadCommentModel);
    if (!activeCell) {
      return false;
    }
    const result = getSheetCommandTarget(univerInstanceService);
    if (!result) {
      return false;
    }
    const { workbook, worksheet, unitId, subUnitId } = result;
    const location = {
      workbook,
      worksheet,
      unitId,
      subUnitId,
      row: activeCell.startRow,
      col: activeCell.startColumn
    };
    sheetsThreadCommentPopupService.showPopup(location);
    const rootId = model.getByLocation(unitId, subUnitId, activeCell.startRow, activeCell.startColumn);
    if (rootId) {
      threadCommentPanelService.setActiveComment({
        unitId,
        subUnitId,
        commentId: rootId,
        trigger: "context-menu"
      });
    }
    return true;
  }
};
var ToggleSheetCommentPanelOperation = {
  id: "sheet.operation.toggle-comment-panel",
  type: 1 /* OPERATION */,
  handler(accessor) {
    const sidebarService = accessor.get(ISidebarService);
    const panelService = accessor.get(ThreadCommentPanelService);
    if (panelService.panelVisible) {
      sidebarService.close();
      panelService.setPanelVisible(false);
    } else {
      sidebarService.open({
        header: { title: "sheets-thread-comment-ui.panel.title" },
        children: { label: SHEETS_THREAD_COMMENT_PANEL },
        width: 360
      });
      panelService.setPanelVisible(true);
    }
    return true;
  }
};

// ../packages/sheets-thread-comment-ui/src/config/config.ts
var SHEETS_THREAD_COMMENT_UI_PLUGIN_CONFIG_KEY = "sheets-thread-comment.config";
var configSymbol = Symbol(SHEETS_THREAD_COMMENT_UI_PLUGIN_CONFIG_KEY);
var defaultPluginConfig = {};

// ../packages/sheets-thread-comment-ui/src/controllers/render-controllers/render.controller.ts
var SheetsThreadCommentRenderController = class extends Disposable {
  constructor(_sheetInterceptorService, _sheetsThreadCommentModel, _univerInstanceService, _renderManagerService) {
    super();
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_sheetsThreadCommentModel", _sheetsThreadCommentModel);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    this._initViewModelIntercept();
    this._initSkeletonChange();
  }
  _initViewModelIntercept() {
    this.disposeWithMe(
      this._sheetInterceptorService.intercept(
        INTERCEPTOR_POINT.CELL_CONTENT,
        {
          effect: 1 /* Style */,
          handler: (cell, pos, next) => {
            const { row, col, unitId, subUnitId } = pos;
            if (this._sheetsThreadCommentModel.showCommentMarker(unitId, subUnitId, row, col)) {
              if (!cell || cell === pos.rawData) {
                cell = { ...pos.rawData };
              }
              cell.markers = {
                ...cell == null ? void 0 : cell.markers,
                tr: {
                  color: "#FFBD37",
                  size: 6
                }
              };
              return next(cell);
            }
            return next(cell);
          },
          priority: 100
        }
      )
    );
  }
  _initSkeletonChange() {
    const markSkeletonDirty = () => {
      var _a;
      const workbook = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
      if (!workbook) return;
      const unitId = workbook.getUnitId();
      const currentRender = this._renderManagerService.getRenderById(unitId);
      (_a = currentRender == null ? void 0 : currentRender.mainComponent) == null ? void 0 : _a.makeForceDirty();
    };
    this.disposeWithMe(this._sheetsThreadCommentModel.commentUpdate$.pipe(debounceTime(16)).subscribe(() => {
      markSkeletonDirty();
    }));
  }
};
SheetsThreadCommentRenderController = __decorateClass([
  __decorateParam(0, Inject(SheetInterceptorService)),
  __decorateParam(1, Inject(SheetsThreadCommentModel)),
  __decorateParam(2, IUniverInstanceService),
  __decorateParam(3, IRenderManagerService)
], SheetsThreadCommentRenderController);

// ../packages/sheets-thread-comment-ui/src/controllers/sheets-thread-comment-copy-paste.controller.ts
var transformRef = (ref, source, target) => {
  const refObj = singleReferenceToGrid(ref);
  const offsetRow = target.row - source.row;
  const offsetCol = target.column - source.column;
  const targetRange = {
    startColumn: refObj.column + offsetCol,
    startRow: refObj.row + offsetRow,
    endColumn: refObj.column + offsetCol,
    endRow: refObj.row + offsetRow
  };
  return serializeRange(targetRange);
};
var SheetsThreadCommentCopyPasteController = class extends Disposable {
  constructor(_sheetClipboardService, _sheetsThreadCommentModel, _threadCommentDataSourceService) {
    super();
    __publicField(this, "_sheetClipboardService", _sheetClipboardService);
    __publicField(this, "_sheetsThreadCommentModel", _sheetsThreadCommentModel);
    __publicField(this, "_threadCommentDataSourceService", _threadCommentDataSourceService);
    __publicField(this, "_copyInfo");
    this._initClipboardHook();
  }
  // eslint-disable-next-line max-lines-per-function
  _initClipboardHook() {
    this.disposeWithMe(
      this._sheetClipboardService.addClipboardHook({
        id: PLUGIN_NAME,
        onBeforeCopy: (unitId, subUnitId, range) => {
          this._copyInfo = {
            unitId,
            subUnitId,
            range
          };
        },
        // eslint-disable-next-line max-lines-per-function
        onPasteCells: (_pasteFrom, pasteTo, _data, payload) => {
          const { unitId: targetUnitId, subUnitId: targetSubUnitId, range } = pasteTo;
          const targetPos = {
            row: range.rows[0],
            column: range.cols[0]
          };
          if (payload.copyType === "CUT" /* CUT */ && this._copyInfo) {
            const { range: range2, unitId: sourceUnitId, subUnitId: sourceSubUnitId } = this._copyInfo;
            const sourcePos = {
              row: range2.startRow,
              column: range2.startColumn
            };
            if (!(targetUnitId === sourceUnitId && targetSubUnitId === sourceSubUnitId)) {
              const roots = [];
              Range.foreach(range2, (row, col) => {
                const comments = this._sheetsThreadCommentModel.getAllByLocation(sourceUnitId, sourceSubUnitId, row, col);
                if (this._threadCommentDataSourceService.syncUpdateMutationToColla) {
                  comments.forEach((comment) => {
                    roots.push(comment);
                  });
                } else {
                  comments.forEach(({ children, ...comment }) => {
                    if (!comment.parentId) {
                      roots.push(comment);
                    }
                  });
                }
              });
              const sourceRedos = [];
              const sourceUndos = [];
              const targetRedos = [];
              const targetUndos = [];
              const handleCommentItem = (item) => {
                sourceRedos.unshift({
                  id: DeleteCommentMutation.id,
                  params: {
                    unitId: sourceUnitId,
                    subUnitId: sourceSubUnitId,
                    commentId: item.id
                  }
                });
                targetRedos.push({
                  id: AddCommentMutation.id,
                  params: {
                    unitId: targetUnitId,
                    subUnitId: targetSubUnitId,
                    comment: {
                      ...item,
                      ref: transformRef(item.ref, sourcePos, targetPos),
                      unitId: targetUnitId,
                      subUnitId: targetSubUnitId
                    },
                    sync: true
                  }
                });
                sourceUndos.push({
                  id: AddCommentMutation.id,
                  params: {
                    unitId: sourceUnitId,
                    subUnitId: sourceSubUnitId,
                    comment: item,
                    sync: true
                  }
                });
                targetUndos.unshift({
                  id: DeleteCommentMutation.id,
                  params: {
                    unitId: targetUnitId,
                    subUnitId: targetSubUnitId,
                    commentId: item.id
                  }
                });
              };
              roots.forEach((root) => {
                handleCommentItem(root);
              });
              return {
                redos: [...sourceRedos, ...targetRedos],
                undos: [...targetUndos, ...sourceUndos]
              };
            }
          }
          return {
            redos: [],
            undos: []
          };
        }
      })
    );
  }
};
SheetsThreadCommentCopyPasteController = __decorateClass([
  __decorateParam(0, Inject(ISheetClipboardService)),
  __decorateParam(1, Inject(SheetsThreadCommentModel)),
  __decorateParam(2, IThreadCommentDataSourceService)
], SheetsThreadCommentCopyPasteController);

// ../packages/sheets-thread-comment-ui/src/controllers/sheets-thread-comment-hover.controller.ts
var SheetsThreadCommentHoverController = class extends Disposable {
  constructor(_hoverManagerService, _sheetsThreadCommentPopupService, _sheetsThreadCommentModel, _sheetPermissionCheckController) {
    super();
    __publicField(this, "_hoverManagerService", _hoverManagerService);
    __publicField(this, "_sheetsThreadCommentPopupService", _sheetsThreadCommentPopupService);
    __publicField(this, "_sheetsThreadCommentModel", _sheetsThreadCommentModel);
    __publicField(this, "_sheetPermissionCheckController", _sheetPermissionCheckController);
    this._initHoverEvent();
  }
  _initHoverEvent() {
    this.disposeWithMe(
      this._hoverManagerService.currentCell$.pipe(debounceTime(100)).subscribe((cell) => {
        const currentPopup = this._sheetsThreadCommentPopupService.activePopup;
        if (cell && (currentPopup && currentPopup.temp || !currentPopup)) {
          const { location } = cell;
          const { unitId, subUnitId, row, col } = location;
          const commentId = this._sheetsThreadCommentModel.getByLocation(unitId, subUnitId, row, col);
          if (commentId) {
            const commentPermission = this._sheetPermissionCheckController.permissionCheckWithRanges({
              workbookTypes: [WorkbookCommentPermission],
              worksheetTypes: [WorksheetViewPermission],
              rangeTypes: [RangeProtectionPermissionViewPoint]
            }, [{ startRow: row, startColumn: col, endRow: row, endColumn: col }], unitId, subUnitId);
            if (!commentPermission) {
              return;
            }
            const comment = this._sheetsThreadCommentModel.getComment(unitId, subUnitId, commentId);
            if (comment && !comment.resolved) {
              this._sheetsThreadCommentPopupService.showPopup({
                unitId,
                subUnitId,
                row,
                col,
                commentId,
                temp: true
              });
            }
          } else {
            if (currentPopup) {
              this._sheetsThreadCommentPopupService.hidePopup();
            }
          }
        }
      })
    );
  }
};
SheetsThreadCommentHoverController = __decorateClass([
  __decorateParam(0, Inject(HoverManagerService)),
  __decorateParam(1, Inject(SheetsThreadCommentPopupService)),
  __decorateParam(2, Inject(SheetsThreadCommentModel)),
  __decorateParam(3, Inject(SheetPermissionCheckController))
], SheetsThreadCommentHoverController);

// ../packages/sheets-thread-comment-ui/src/controllers/sheets-thread-comment-permission.controller.ts
var SheetsThreadCommentPermissionController = class extends Disposable {
  constructor(_localeService, _commandService, _sheetPermissionCheckController, _sheetsThreadCommentModel) {
    super();
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_sheetPermissionCheckController", _sheetPermissionCheckController);
    __publicField(this, "_sheetsThreadCommentModel", _sheetsThreadCommentModel);
    this._commandExecutedListener();
  }
  _commandExecutedListener() {
    this.disposeWithMe(
      this._commandService.beforeCommandExecuted((command) => {
        const { id } = command;
        if (id === ShowAddSheetCommentModalOperation.id || id === ToggleSheetCommentPanelOperation.id) {
          const permission = this._sheetPermissionCheckController.permissionCheckWithoutRange({
            workbookTypes: [WorkbookCommentPermission],
            worksheetTypes: [WorksheetViewPermission]
          });
          if (!permission) {
            this._sheetPermissionCheckController.blockExecuteWithoutPermission(this._localeService.t("sheets-thread-comment-ui.permission.commentErr"));
          }
        } else if (id === AddCommentCommand.id) {
          const params = command.params;
          const { unitId, subUnitId, comment } = params;
          const location = singleReferenceToGrid(comment.ref);
          const { row, column } = location;
          const permission = this._sheetPermissionCheckController.permissionCheckWithRanges({
            workbookTypes: [WorkbookCommentPermission],
            worksheetTypes: [WorksheetViewPermission],
            rangeTypes: [RangeProtectionPermissionViewPoint]
          }, [{ startRow: row, startColumn: column, endRow: row, endColumn: column }], unitId, subUnitId);
          if (!permission) {
            this._sheetPermissionCheckController.blockExecuteWithoutPermission(this._localeService.t("sheets-thread-comment-ui.permission.commentErr"));
          }
        } else if (id === UpdateCommentCommand.id) {
          const params = command.params;
          const { unitId, subUnitId, payload } = params;
          const { commentId } = payload;
          const comment = this._sheetsThreadCommentModel.getComment(unitId, subUnitId, commentId);
          if (comment) {
            const location = singleReferenceToGrid(comment.ref);
            const { row, column } = location;
            const permission = this._sheetPermissionCheckController.permissionCheckWithRanges({
              workbookTypes: [WorkbookCommentPermission],
              worksheetTypes: [WorksheetViewPermission],
              rangeTypes: [RangeProtectionPermissionViewPoint]
            }, [{ startRow: row, startColumn: column, endRow: row, endColumn: column }], unitId, subUnitId);
            if (!permission) {
              this._sheetPermissionCheckController.blockExecuteWithoutPermission(this._localeService.t("sheets-thread-comment-ui.permission.commentErr"));
            }
          }
        } else if (id === ResolveCommentCommand.id || id === DeleteCommentCommand.id || id === DeleteCommentTreeCommand.id) {
          const params = command.params;
          const { unitId, subUnitId, commentId } = params;
          const comment = this._sheetsThreadCommentModel.getComment(unitId, subUnitId, commentId);
          if (comment) {
            const location = singleReferenceToGrid(comment.ref);
            const { row, column } = location;
            const permission = this._sheetPermissionCheckController.permissionCheckWithRanges({
              workbookTypes: [WorkbookCommentPermission],
              worksheetTypes: [WorksheetViewPermission],
              rangeTypes: [RangeProtectionPermissionViewPoint]
            }, [{ startRow: row, startColumn: column, endRow: row, endColumn: column }], unitId, subUnitId);
            if (!permission) {
              this._sheetPermissionCheckController.blockExecuteWithoutPermission(this._localeService.t("sheets-thread-comment-ui.permission.commentErr"));
            }
          }
        }
      })
    );
  }
};
SheetsThreadCommentPermissionController = __decorateClass([
  __decorateParam(0, Inject(LocaleService)),
  __decorateParam(1, ICommandService),
  __decorateParam(2, Inject(SheetPermissionCheckController)),
  __decorateParam(3, Inject(SheetsThreadCommentModel))
], SheetsThreadCommentPermissionController);

// ../packages/sheets-thread-comment-ui/src/controllers/sheets-thread-comment-popup.controller.ts
var SheetsThreadCommentPopupController = class extends Disposable {
  constructor(_commandService, _sheetsThreadCommentPopupService, _sheetsThreadCommentModel, _threadCommentPanelService, _univerInstanceService, _sheetPermissionCheckController, _markSelectionService, _sheetSelectionService, _editorBridgeService, _renderManagerService) {
    super();
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_sheetsThreadCommentPopupService", _sheetsThreadCommentPopupService);
    __publicField(this, "_sheetsThreadCommentModel", _sheetsThreadCommentModel);
    __publicField(this, "_threadCommentPanelService", _threadCommentPanelService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_sheetPermissionCheckController", _sheetPermissionCheckController);
    __publicField(this, "_markSelectionService", _markSelectionService);
    __publicField(this, "_sheetSelectionService", _sheetSelectionService);
    __publicField(this, "_editorBridgeService", _editorBridgeService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_isSwitchToCommenting", false);
    __publicField(this, "_selectionShapeInfo", null);
    this._initCommandListener();
    this._initPanelListener();
    this._initMarkSelection();
    this._initSelectionUpdateListener();
    this._initEditorBridge();
  }
  _handleSelectionChange(selections, unitId, subUnitId) {
    var _a, _b, _c;
    const range = (_a = selections[0]) == null ? void 0 : _a.range;
    const render = this._renderManagerService.getRenderById(unitId);
    const skeleton = (_b = render == null ? void 0 : render.with(SheetSkeletonManagerService).getSkeletonParam(subUnitId)) == null ? void 0 : _b.skeleton;
    if (!skeleton) {
      return;
    }
    if (!range) {
      return;
    }
    const actualCell = skeleton.getCellWithCoordByIndex(range.startRow, range.startColumn);
    const rangeType = (_c = range.rangeType) != null ? _c : 0 /* NORMAL */;
    if ((rangeType !== 0 /* NORMAL */ || range.endColumn - range.startColumn > 0 || range.endRow - range.startRow > 0) && !((actualCell.isMerged || actualCell.isMergedMainCell) && Rectangle.equals(actualCell.mergeInfo, range))) {
      if (this._threadCommentPanelService.activeCommentId) {
        this._commandService.executeCommand(SetActiveCommentOperation.id);
      }
      return;
    }
    const row = actualCell.actualRow;
    const col = actualCell.actualColumn;
    if (!this._sheetsThreadCommentModel.showCommentMarker(unitId, subUnitId, row, col)) {
      if (this._threadCommentPanelService.activeCommentId) {
        this._commandService.executeCommand(SetActiveCommentOperation.id);
      }
      return;
    }
    const commentId = this._sheetsThreadCommentModel.getByLocation(unitId, subUnitId, row, col);
    if (commentId) {
      this._commandService.executeCommand(SetActiveCommentOperation.id, {
        unitId,
        subUnitId,
        commentId
      });
    }
  }
  _initSelectionUpdateListener() {
    this.disposeWithMe(
      this._sheetSelectionService.selectionMoveEnd$.subscribe((selections) => {
        if (this._isSwitchToCommenting) {
          return;
        }
        const current = this._sheetSelectionService.currentSelectionParam;
        if (!current) {
          return;
        }
        this._handleSelectionChange(selections, current.unitId, current.sheetId);
      })
    );
  }
  _initEditorBridge() {
    this.disposeWithMe(
      this._editorBridgeService.visible$.subscribe((visible) => {
        if (visible.visible) {
          this._sheetsThreadCommentPopupService.hidePopup();
        }
      })
    );
  }
  _initCommandListener() {
    this._commandService.onCommandExecuted((commandInfo) => {
      if (commandInfo.id === DeleteCommentMutation.id) {
        const params = commandInfo.params;
        const active = this._sheetsThreadCommentPopupService.activePopup;
        if (!active) {
          return;
        }
        const { unitId, subUnitId, commentId } = active;
        if (params.unitId === unitId && params.subUnitId === subUnitId && params.commentId === commentId) {
          this._sheetsThreadCommentPopupService.hidePopup();
        }
      }
    });
  }
  _initPanelListener() {
    this.disposeWithMe(this._threadCommentPanelService.activeCommentId$.subscribe(async (commentInfo) => {
      var _a;
      if (commentInfo) {
        const { unitId, subUnitId, commentId, trigger } = commentInfo;
        const comment = this._sheetsThreadCommentModel.getComment(unitId, subUnitId, commentId);
        if (!comment || comment.resolved) {
          return;
        }
        const currentUnit = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
        if (!currentUnit) {
          return;
        }
        const currentUnitId = currentUnit.getUnitId();
        if (currentUnitId !== unitId) {
          return;
        }
        this._isSwitchToCommenting = true;
        const currentSheetId = (_a = currentUnit.getActiveSheet()) == null ? void 0 : _a.getSheetId();
        if (currentSheetId !== subUnitId) {
          await this._commandService.executeCommand(SetWorksheetActiveOperation.id, {
            unitId,
            subUnitId
          });
        }
        this._isSwitchToCommenting = false;
        const location = singleReferenceToGrid(comment.ref);
        const { row, column: col } = location;
        const commentPermission = this._sheetPermissionCheckController.permissionCheckWithRanges({
          workbookTypes: [WorkbookCommentPermission],
          worksheetTypes: [WorksheetViewPermission],
          rangeTypes: [RangeProtectionPermissionViewPoint]
        }, [{ startRow: row, startColumn: col, endRow: row, endColumn: col }], unitId, subUnitId);
        if (!commentPermission) {
          return;
        }
        const GAP = 1;
        await this._commandService.executeCommand(ScrollToRangeOperation.id, {
          range: {
            startRow: Math.max(location.row - GAP, 0),
            endRow: location.row + GAP,
            startColumn: Math.max(location.column - GAP, 0),
            endColumn: location.column + GAP
          }
        });
        if (this._editorBridgeService.isVisible().visible) {
          return;
        }
        this._sheetsThreadCommentPopupService.showPopup({
          unitId,
          subUnitId,
          row: location.row,
          col: location.column,
          commentId: comment.id,
          trigger
        });
      } else {
        this._sheetsThreadCommentPopupService.hidePopup();
      }
    }));
  }
  _initMarkSelection() {
    this.disposeWithMe(this._threadCommentPanelService.activeCommentId$.pipe(debounceTime(100)).subscribe((activeComment) => {
      var _a, _b;
      if (!activeComment) {
        if (this._selectionShapeInfo) {
          this._markSelectionService.removeShape(this._selectionShapeInfo.shapeId);
          this._selectionShapeInfo = null;
        }
        return;
      }
      const { unitId, subUnitId, commentId } = activeComment;
      if (this._selectionShapeInfo) {
        this._markSelectionService.removeShape(this._selectionShapeInfo.shapeId);
        this._selectionShapeInfo = null;
      }
      const comment = this._sheetsThreadCommentModel.getComment(unitId, subUnitId, commentId);
      if (!comment) {
        return;
      }
      const location = singleReferenceToGrid(comment.ref);
      const { row, column } = location;
      if (Number.isNaN(row) || Number.isNaN(column)) {
        return null;
      }
      const worksheet = (_a = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */)) == null ? void 0 : _a.getSheetBySheetId(subUnitId);
      const mergeInfo = (_b = worksheet == null ? void 0 : worksheet.getMergedCell(row, column)) != null ? _b : {
        startColumn: column,
        endColumn: column,
        startRow: row,
        endRow: row
      };
      const shapeId = this._markSelectionService.addShape(
        {
          range: mergeInfo,
          style: {
            // hasAutoFill: false,
            fill: "rgba(255, 189, 55, 0.35)",
            strokeWidth: 1,
            stroke: "#FFBD37",
            widgets: {}
          },
          primary: null
        },
        [],
        -1
      );
      if (!shapeId) {
        return;
      }
      this._selectionShapeInfo = {
        ...activeComment,
        shapeId
      };
    }));
  }
};
SheetsThreadCommentPopupController = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, Inject(SheetsThreadCommentPopupService)),
  __decorateParam(2, Inject(SheetsThreadCommentModel)),
  __decorateParam(3, Inject(ThreadCommentPanelService)),
  __decorateParam(4, IUniverInstanceService),
  __decorateParam(5, Inject(SheetPermissionCheckController)),
  __decorateParam(6, IMarkSelectionService),
  __decorateParam(7, Inject(SheetsSelectionsService)),
  __decorateParam(8, IEditorBridgeService),
  __decorateParam(9, IRenderManagerService)
], SheetsThreadCommentPopupController);

// ../packages/sheets-thread-comment-ui/src/menu/menu.ts
var threadCommentMenuFactory = (accessor) => {
  return {
    id: ShowAddSheetCommentModalOperation.id,
    type: 0 /* BUTTON */,
    icon: "CommentIcon",
    title: "sheets-thread-comment-ui.menu.addComment",
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */),
    disabled$: getCurrentRangeDisable$(accessor, {
      workbookTypes: [WorkbookCommentPermission],
      worksheetTypes: [WorksheetViewPermission],
      rangeTypes: [RangeProtectionPermissionViewPoint]
    })
  };
};
var threadPanelMenuFactory = (accessor) => {
  return {
    id: ToggleSheetCommentPanelOperation.id,
    type: 0 /* BUTTON */,
    icon: "CommentIcon",
    tooltip: "sheets-thread-comment-ui.menu.commentManagement",
    disabled$: getCurrentRangeDisable$(accessor, {
      workbookTypes: [WorkbookCommentPermission],
      worksheetTypes: [WorksheetViewPermission],
      rangeTypes: [RangeProtectionPermissionViewPoint]
    }),
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */)
  };
};
var AddCommentShortcut = {
  id: ShowAddSheetCommentModalOperation.id,
  binding: 77 /* M */ | 4096 /* CTRL_COMMAND */ | 2048 /* ALT */,
  preconditions: whenSheetEditorFocused
};

// ../packages/sheets-thread-comment-ui/src/menu/schema.ts
var menuSchema = {
  ["ribbon.insert.media" /* MEDIA */]: {
    [ToggleSheetCommentPanelOperation.id]: {
      order: 2,
      menuItemFactory: threadPanelMenuFactory
    }
  },
  ["contextMenu.mainArea" /* MAIN_AREA */]: {
    ["contextMenu.others" /* OTHERS */]: {
      [ShowAddSheetCommentModalOperation.id]: {
        order: 0,
        menuItemFactory: threadCommentMenuFactory
      }
    }
  }
};

// ../packages/sheets-thread-comment-ui/src/views/sheets-thread-comment-cell/index.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime());
var SheetsThreadCommentCell = () => {
  const univerInstanceService = useDependency(IUniverInstanceService);
  const sheetsThreadCommentPopupService = useDependency(SheetsThreadCommentPopupService);
  const activePopup = useObservable(sheetsThreadCommentPopupService.activePopup$);
  const sheetThreadCommentModel = useDependency(SheetsThreadCommentModel);
  useObservable(sheetThreadCommentModel.commentUpdate$);
  if (!activePopup) {
    return null;
  }
  const { row, col, unitId, subUnitId, trigger } = activePopup;
  const rootId = sheetThreadCommentModel.getByLocation(unitId, subUnitId, row, col);
  const ref = `${Tools.chatAtABC(col)}${row + 1}`;
  const onClose = () => {
    sheetsThreadCommentPopupService.hidePopup();
  };
  const getSubUnitName = (id) => {
    var _a, _b, _c;
    return (_c = (_b = (_a = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */)) == null ? void 0 : _a.getSheetBySheetId(id)) == null ? void 0 : _b.getName()) != null ? _c : "";
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ThreadCommentTree,
    {
      onClick: () => {
        sheetsThreadCommentPopupService.persistPopup();
      },
      location: "CELL" /* CELL */,
      id: rootId,
      unitId,
      subUnitId,
      type: 2 /* UNIVER_SHEET */,
      refStr: ref,
      onClose,
      getSubUnitName,
      autoFocus: trigger === "context-menu"
    }
  );
};

// ../packages/sheets-thread-comment-ui/src/views/sheets-thread-comment-panel/index.tsx
var import_react = __toESM(require_react());
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
var SheetsThreadCommentPanel = () => {
  var _a;
  const markSelectionService = useDependency(IMarkSelectionService);
  const univerInstanceService = useDependency(IUniverInstanceService);
  const sheetsThreadCommentPopupService = useDependency(SheetsThreadCommentPopupService);
  const workbook = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
  const unitId = workbook.getUnitId();
  const commandService = useDependency(ICommandService);
  const subUnitId$ = (0, import_react.useMemo)(() => workbook.activeSheet$.pipe(map((i) => i == null ? void 0 : i.getSheetId())), [workbook.activeSheet$]);
  const subUnitId = useObservable(subUnitId$, (_a = workbook.getActiveSheet()) == null ? void 0 : _a.getSheetId());
  const hoverShapeId = (0, import_react.useRef)(null);
  const panelService = useDependency(ThreadCommentPanelService);
  const activeCommentId = useObservable(panelService.activeCommentId$);
  const panelVisible = useObservable(panelService.panelVisible$, panelService.panelVisible);
  const sortComments = (0, import_react.useCallback)((comments) => {
    const worksheets = workbook.getSheets();
    const sheetIndex = {};
    worksheets.forEach((sheet, i) => {
      sheetIndex[sheet.getSheetId()] = i;
    });
    const sort = (comments2) => {
      return comments2.map((comment) => {
        var _a2;
        const ref = singleReferenceToGrid(comment.ref);
        const p = [(_a2 = sheetIndex[comment.subUnitId]) != null ? _a2 : 0, ref.row, ref.column];
        return { ...comment, p };
      }).sort((pre, aft) => {
        if (pre.p[0] === aft.p[0]) {
          if (pre.p[1] === aft.p[1]) {
            return pre.p[2] - aft.p[2];
          }
          return pre.p[1] - aft.p[1];
        }
        return pre.p[0] - aft.p[0];
      });
    };
    return [
      ...sort(comments.filter((comment) => !comment.resolved)),
      ...sort(comments.filter((comment) => comment.resolved))
    ];
  }, [workbook]);
  const showShape = (0, import_react.useCallback)((comment) => {
    var _a2;
    if (comment.unitId === unitId && comment.subUnitId === subUnitId && !comment.resolved) {
      const { row, column } = singleReferenceToGrid(comment.ref);
      const worksheet = workbook.getSheetBySheetId(comment.subUnitId);
      const mergeInfo = (_a2 = worksheet == null ? void 0 : worksheet.getMergedCell(row, column)) != null ? _a2 : {
        startColumn: column,
        endColumn: column,
        startRow: row,
        endRow: row
      };
      if (!Number.isNaN(row) && !Number.isNaN(column)) {
        return markSelectionService.addShape({
          range: mergeInfo,
          style: {
            // hasAutoFill: false,
            fill: "rgb(255, 189, 55, 0.35)",
            strokeWidth: 1,
            stroke: "#FFBD37",
            widgets: {}
          },
          primary: null
        });
      }
    }
    return null;
  }, [markSelectionService, subUnitId, unitId]);
  const getSubUnitName = (id) => {
    var _a2, _b;
    return (_b = (_a2 = workbook.getSheetBySheetId(id)) == null ? void 0 : _a2.getName()) != null ? _b : "";
  };
  const handleAdd = () => {
    commandService.executeCommand(ShowAddSheetCommentModalOperation.id);
  };
  const handleHover = (comment) => {
    if (activeCommentId && activeCommentId.unitId === comment.unitId && activeCommentId.subUnitId === comment.subUnitId && activeCommentId.commentId === comment.id) {
      return;
    }
    if (hoverShapeId.current) {
      markSelectionService.removeShape(hoverShapeId.current);
      hoverShapeId.current = null;
    }
    hoverShapeId.current = showShape(comment);
  };
  const handleLeave = () => {
    if (hoverShapeId.current) {
      markSelectionService.removeShape(hoverShapeId.current);
      hoverShapeId.current = null;
    }
  };
  const handleResolve = (id, resolved) => {
    if (resolved) {
      sheetsThreadCommentPopupService.hidePopup();
    }
  };
  (0, import_react.useEffect)(() => {
    if (!panelVisible && hoverShapeId.current) {
      markSelectionService.removeShape(hoverShapeId.current);
    }
  }, [markSelectionService, panelVisible]);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    ThreadCommentPanel,
    {
      unitId,
      subUnitId$,
      type: 2 /* UNIVER_SHEET */,
      onAdd: handleAdd,
      getSubUnitName,
      onResolve: handleResolve,
      sortComments,
      onItemEnter: handleHover,
      onItemLeave: handleLeave,
      onDeleteComment: () => {
        handleLeave();
        return true;
      }
    }
  );
};

// ../packages/sheets-thread-comment-ui/src/controllers/sheets-thread-comment.controller.ts
var SheetsThreadCommentController = class extends Disposable {
  constructor(_menuManagerService, _componentManager, _shortcutService) {
    super();
    __publicField(this, "_menuManagerService", _menuManagerService);
    __publicField(this, "_componentManager", _componentManager);
    __publicField(this, "_shortcutService", _shortcutService);
    this._initMenu();
    this._initShortcut();
    this._initComponent();
  }
  _initShortcut() {
    this._shortcutService.registerShortcut(AddCommentShortcut);
  }
  _initMenu() {
    this._menuManagerService.mergeMenu(menuSchema);
  }
  _initComponent() {
    [
      [SHEETS_THREAD_COMMENT_MODAL, SheetsThreadCommentCell],
      [SHEETS_THREAD_COMMENT_PANEL, SheetsThreadCommentPanel],
      ["CommentIcon", CommentIcon]
    ].forEach(([key, comp]) => {
      this.disposeWithMe(
        this._componentManager.register(key, comp)
      );
    });
  }
};
SheetsThreadCommentController = __decorateClass([
  __decorateParam(0, IMenuManagerService),
  __decorateParam(1, Inject(ComponentManager)),
  __decorateParam(2, IShortcutService)
], SheetsThreadCommentController);

// ../packages/sheets-thread-comment-ui/src/plugin.ts
var UniverSheetsThreadCommentUIPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig, _injector, _commandService, _configService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_configService", _configService);
    const { menu, ...rest } = merge_default(
      {},
      defaultPluginConfig,
      this._config
    );
    if (menu) {
      this._configService.setConfig("menu", menu, { merge: true });
    }
    this._configService.setConfig(SHEETS_THREAD_COMMENT_UI_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    [
      [SheetsThreadCommentController],
      [SheetsThreadCommentRenderController],
      [SheetsThreadCommentCopyPasteController],
      [SheetsThreadCommentHoverController],
      [SheetsThreadCommentPopupController],
      [SheetsThreadCommentPopupService],
      [SheetsThreadCommentPermissionController]
    ].forEach((dep) => {
      this._injector.add(dep);
    });
    [
      ShowAddSheetCommentModalOperation,
      ToggleSheetCommentPanelOperation
    ].forEach((command) => {
      this._commandService.registerCommand(command);
    });
    this._injector.get(SheetsThreadCommentController);
  }
  onReady() {
    this._injector.get(SheetsThreadCommentRenderController);
  }
  onRendered() {
    this._injector.get(SheetsThreadCommentCopyPasteController);
    this._injector.get(SheetsThreadCommentHoverController);
    this._injector.get(SheetsThreadCommentPopupController);
    this._injector.get(SheetsThreadCommentPermissionController);
  }
};
__publicField(UniverSheetsThreadCommentUIPlugin, "pluginName", PLUGIN_NAME);
__publicField(UniverSheetsThreadCommentUIPlugin, "packageName", package_default.name);
__publicField(UniverSheetsThreadCommentUIPlugin, "version", package_default.version);
__publicField(UniverSheetsThreadCommentUIPlugin, "type", 2 /* UNIVER_SHEET */);
UniverSheetsThreadCommentUIPlugin = __decorateClass([
  DependentOn(UniverThreadCommentUIPlugin, UniverSheetsThreadCommentPlugin),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, Inject(ICommandService)),
  __decorateParam(3, IConfigService)
], UniverSheetsThreadCommentUIPlugin);

export {
  UniverSheetsThreadCommentUIPlugin
};
