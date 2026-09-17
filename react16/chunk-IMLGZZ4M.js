import {
  AddSheetTableCommand,
  AddTableThemeCommand,
  DeleteSheetTableCommand,
  RemoveTableThemeCommand,
  SHEET_TABLE_CUSTOM_THEME_PREFIX,
  SetSheetTableCommand,
  SetSheetTableFilterCommand,
  SheetDeleteNoteCommand,
  SheetTableInsertColCommand,
  SheetTableInsertColumnAtCommand,
  SheetTableInsertRowAtCommand,
  SheetTableInsertRowCommand,
  SheetTableRemoveColCommand,
  SheetTableRemoveColumnAtCommand,
  SheetTableRemoveRowCommand,
  SheetTableService,
  SheetToggleNotePopupCommand,
  SheetUpdateNoteCommand,
  SheetsNoteModel,
  SheetsTableController,
  TABLE_FILTER_EMPTY_VALUE,
  TableManager,
  UniverSheetsNotePlugin,
  UniverSheetsTablePlugin,
  customEmptyThemeWithBorderStyle,
  getExistingNamesSet,
  isConditionFilter,
  isManualTableFilter,
  processStyleWithBorderStyle,
  validateSheetTableName
} from "./chunk-SPJ3J4VO.js";
import {
  SortRangeCommand
} from "./chunk-7OGYBNIL.js";
import {
  RangeSelector
} from "./chunk-DMIB6PSO.js";
import {
  CellPopupManagerService,
  HoverManagerService,
  IEditorBridgeService,
  ISheetSelectionRenderService,
  SelectAllCommand,
  SetScrollOperation,
  SetZoomRatioOperation,
  SheetCanvasPopManagerService,
  SheetSkeletonManagerService,
  getCoordByCell,
  getCurrentRangeDisable$,
  getTransformCoord
} from "./chunk-BHQGV2VJ.js";
import {
  AddNoteIcon,
  AscendingIcon,
  Button,
  ButtonGroup,
  CascaderList,
  Checkbox,
  ColorPicker,
  ComponentManager,
  DatePicker,
  DateRangePicker,
  DeleteColumnDoubleIcon,
  DeleteNoteIcon,
  DescendingIcon,
  Dropdown,
  DropdownIcon,
  HideNoteIcon,
  IDialogService,
  IMenuManagerService,
  ISidebarService,
  IZenZoneService,
  Input,
  InputNumber,
  LeftInsertColumnDoubleIcon,
  MoreDownIcon,
  RightInsertColumnDoubleIcon,
  Segmented,
  Select,
  TableIcon,
  Textarea,
  borderClassName,
  clsx,
  getMenuHiddenObservable,
  require_jsx_runtime,
  require_react,
  scrollbarClassName,
  useConfigValue,
  useDebounceFn,
  useDependency,
  useObservable
} from "./chunk-VNXQUZSG.js";
import {
  IDefinedNamesService,
  INTERCEPTOR_POINT,
  RangeThemeStyle,
  SetRangeThemeMutation,
  SetRangeValuesMutation,
  SetSelectionsOperation,
  SetVerticalTextAlignCommand,
  SheetInterceptorService,
  SheetRangeThemeModel,
  SheetsSelectionsService,
  WorkbookEditablePermission,
  WorkbookPermissionService,
  WorksheetEditPermission,
  deserializeRangeWithSheet,
  expandToContinuousRange,
  getPrimaryForRange,
  getSheetCommandTarget,
  isSingleCellSelection,
  serializeRange
} from "./chunk-Q6Y4PHRI.js";
import {
  DEFAULT_FONTFACE_PLANE,
  IRenderManagerService,
  Rect,
  Shape
} from "./chunk-XOCU2XR6.js";
import {
  BehaviorSubject,
  ColorKit,
  DependentOn,
  Disposable,
  DisposableCollection,
  ErrorService,
  ICommandService,
  IConfigService,
  IContextService,
  IPermissionService,
  IUniverInstanceService,
  Inject,
  Injector,
  LocaleService,
  ObjectMatrix,
  Plugin,
  Rectangle,
  RxDisposable,
  Subject,
  cellToRange,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  fromCallback,
  generateRandomId,
  map,
  merge,
  merge_default,
  of,
  registerDependencies,
  startWith,
  switchMap,
  takeUntil,
  toDisposable,
  touchDependencies
} from "./chunk-EJSPXROI.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField,
  __toESM
} from "./chunk-24OICD5T.js";

// ../packages/sheets-note-ui/package.json
var package_default = {
  name: "@univerjs/sheets-note-ui",
  version: "0.25.2",
  private: false,
  description: "Cell note UI for Univer Sheets.",
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
    "note",
    "annotation",
    "ui"
  ],
  exports: {
    ".": "./src/index.ts",
    "./*": "./src/*",
    "./locale/*": "./src/locale/*.ts",
    "./facade": "./src/facade/index.ts"
  },
  main: "./lib/index.js",
  module: "./lib/index.js",
  types: "./lib/index.d.ts",
  files: [
    "lib"
  ],
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
  scripts: {
    test: "vitest run",
    "test:watch": "vitest",
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
    "@univerjs/sheets-note": "workspace:*",
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

// ../packages/sheets-note-ui/src/config/config.ts
var SHEETS_NOTE_UI_PLUGIN_CONFIG_KEY = "sheets-note-ui.config";
var configSymbol = Symbol(SHEETS_NOTE_UI_PLUGIN_CONFIG_KEY);
var defaultPluginConfig = {};

// ../packages/sheets-note-ui/src/controllers/sheets-cell-content.controller.ts
var SheetsCellContentController = class extends Disposable {
  constructor(_sheetInterceptorService, _sheetsNoteModel, _renderManagerService, _univerInstanceService) {
    super();
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_sheetsNoteModel", _sheetsNoteModel);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
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
            const note = this._sheetsNoteModel.getNote(unitId, subUnitId, { row, col });
            if (note) {
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
    this.disposeWithMe(this._sheetsNoteModel.change$.pipe(debounceTime(16)).subscribe(() => {
      markSkeletonDirty();
    }));
  }
};
SheetsCellContentController = __decorateClass([
  __decorateParam(0, Inject(SheetInterceptorService)),
  __decorateParam(1, Inject(SheetsNoteModel)),
  __decorateParam(2, IRenderManagerService),
  __decorateParam(3, IUniverInstanceService)
], SheetsCellContentController);

// ../packages/sheets-note-ui/src/views/config.ts
var SHEET_NOTE_COMPONENT = "SHEET_NOTE_COMPONENT";

// ../packages/sheets-note-ui/src/services/sheets-note-popup.service.ts
var SheetsNotePopupService = class extends Disposable {
  constructor(_zenZoneService, _cellPopupManagerService) {
    super();
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
        unitId,
        subUnitId,
        row,
        col
      },
      {
        componentKey: SHEET_NOTE_COMPONENT,
        onClickOutside: () => {
          this.hidePopup();
        },
        direction: "horizontal",
        extraProps: {
          location
        },
        priority: 3
      }
    );
    if (!popupDisposable) {
      throw new Error("[SheetsNotePopupService]: cannot show popup!");
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
  hidePopup(force) {
    if (!this._activePopup) {
      return;
    }
    if (!force && !this._activePopup.temp) return;
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
SheetsNotePopupService = __decorateClass([
  __decorateParam(0, IZenZoneService),
  __decorateParam(1, Inject(CellPopupManagerService))
], SheetsNotePopupService);

// ../packages/sheets-note-ui/src/controllers/sheets-note-attachment.controller.ts
var SheetsNoteAttachmentController = class extends Disposable {
  constructor(_sheetsNoteModel, _univerInstanceService, _cellPopupManagerService, _sheetsNotePopupService) {
    super();
    __publicField(this, "_sheetsNoteModel", _sheetsNoteModel);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_cellPopupManagerService", _cellPopupManagerService);
    __publicField(this, "_sheetsNotePopupService", _sheetsNotePopupService);
    __publicField(this, "_noteMatrix", new ObjectMatrix());
    this._initNoteChangeListener();
  }
  _showPopup(unitId, sheetId, row, col) {
    this._sheetsNotePopupService.hidePopup(true);
    return this._cellPopupManagerService.showPopup(
      {
        unitId,
        subUnitId: sheetId,
        row,
        col
      },
      {
        componentKey: SHEET_NOTE_COMPONENT,
        direction: "horizontal",
        extraProps: {
          location: {
            unitId,
            subUnitId: sheetId,
            row,
            col
          }
        },
        priority: 3
      }
    );
  }
  dispose() {
    super.dispose();
    this._noteMatrix.forValue((_, __, disposable) => {
      disposable.dispose();
    });
  }
  _initSheet(targetUnitId, targetSheetId) {
    var _a;
    const oldMatrix = this._noteMatrix;
    oldMatrix.forValue((_, __, disposable) => {
      disposable.dispose();
    });
    this._noteMatrix = new ObjectMatrix();
    const handleNote = (unitId, sheetId, row, col, note) => {
      const matrix = this._noteMatrix;
      const disposable = matrix.getValue(row, col);
      if (note == null ? void 0 : note.show) {
        if (!disposable) {
          const newDisposable = this._showPopup(unitId, sheetId, row, col);
          if (newDisposable) {
            matrix.setValue(row, col, newDisposable);
          }
        }
      } else {
        if (disposable) {
          disposable.dispose();
          matrix.realDeleteValue(row, col);
        }
      }
    };
    (_a = this._sheetsNoteModel.getSheetNotes(targetUnitId, targetSheetId)) == null ? void 0 : _a.forEach((note) => {
      handleNote(targetUnitId, targetSheetId, note.row, note.col, note);
    });
    return this._sheetsNoteModel.change$.subscribe((change) => {
      if (change.unitId !== targetUnitId || change.subUnitId !== targetSheetId) {
        return;
      }
      switch (change.type) {
        case "ref": {
          const { unitId, subUnitId, oldNote, newNote } = change;
          if (!newNote.show) return;
          const matrix = this._noteMatrix;
          const { row: oldRow, col: oldCol } = oldNote;
          const { row: newRow, col: newCol } = newNote;
          const disposable = matrix.getValue(oldRow, oldCol);
          if (disposable) {
            disposable.dispose();
            matrix.realDeleteValue(oldRow, oldCol);
          }
          const newDisposable = this._showPopup(unitId, subUnitId, newRow, newCol);
          if (newDisposable) {
            matrix.setValue(newRow, newCol, newDisposable);
          }
          break;
        }
        case "update": {
          const { unitId, subUnitId, oldNote, newNote } = change;
          const row = newNote ? newNote.row : oldNote.row;
          const col = newNote ? newNote.col : oldNote.col;
          handleNote(unitId, subUnitId, row, col, newNote);
          break;
        }
        default:
          break;
      }
    });
  }
  _initNoteChangeListener() {
    this.disposeWithMe(
      this._univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */).pipe(
        switchMap((workbook) => {
          var _a;
          return (_a = workbook == null ? void 0 : workbook.activeSheet$) != null ? _a : of(null);
        })
      ).subscribe((sheet) => {
        if (sheet) {
          const disposable = this._initSheet(sheet.getUnitId(), sheet.getSheetId());
          return () => {
            disposable.unsubscribe();
          };
        } else {
          this._noteMatrix.forValue((_, __, disposable) => {
            disposable.dispose();
          });
          this._noteMatrix = new ObjectMatrix();
        }
      })
    );
  }
};
SheetsNoteAttachmentController = __decorateClass([
  __decorateParam(0, Inject(SheetsNoteModel)),
  __decorateParam(1, Inject(IUniverInstanceService)),
  __decorateParam(2, Inject(CellPopupManagerService)),
  __decorateParam(3, Inject(SheetsNotePopupService))
], SheetsNoteAttachmentController);

// ../packages/sheets-note-ui/src/controllers/sheets-note-popup.controller.ts
var SheetsNotePopupController = class extends Disposable {
  constructor(_sheetsNotePopupService, _sheetsNoteModel, _sheetSelectionService, _editorBridgeService, _renderManagerService, _hoverManagerService) {
    super();
    __publicField(this, "_sheetsNotePopupService", _sheetsNotePopupService);
    __publicField(this, "_sheetsNoteModel", _sheetsNoteModel);
    __publicField(this, "_sheetSelectionService", _sheetSelectionService);
    __publicField(this, "_editorBridgeService", _editorBridgeService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_hoverManagerService", _hoverManagerService);
    __publicField(this, "_isSwitchingSheet", false);
    this._initSelectionUpdateListener();
    this._initEditorBridge();
    this._initHoverEvent();
    this._initDeleteNoteListener();
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
      this._sheetsNotePopupService.hidePopup();
      return;
    }
    const row = actualCell.actualRow;
    const col = actualCell.actualColumn;
    const note = this._sheetsNoteModel.getNote(unitId, subUnitId, { row, col });
    if (note == null ? void 0 : note.show) return;
    if (note) {
      this._sheetsNotePopupService.showPopup({
        unitId,
        subUnitId,
        noteId: note.id,
        row,
        col
      });
    } else {
      this._sheetsNotePopupService.hidePopup(true);
    }
  }
  _initSelectionUpdateListener() {
    this.disposeWithMe(
      this._sheetSelectionService.selectionMoveEnd$.subscribe((selections) => {
        if (this._isSwitchingSheet) {
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
          this._sheetsNotePopupService.hidePopup(true);
        }
      })
    );
  }
  _initHoverEvent() {
    this.disposeWithMe(
      this._hoverManagerService.currentCell$.pipe(debounceTime(100)).subscribe((cell) => {
        var _a;
        if (!(cell == null ? void 0 : cell.location)) return;
        const { unitId, subUnitId, row, col } = cell.location;
        const render = this._renderManagerService.getRenderById(unitId);
        const skeleton = (_a = render == null ? void 0 : render.with(SheetSkeletonManagerService).getSkeletonParam(subUnitId)) == null ? void 0 : _a.skeleton;
        let targetRow = row;
        let targetCol = col;
        let note = this._sheetsNoteModel.getNote(unitId, subUnitId, { row: targetRow, col: targetCol });
        if (!note && skeleton) {
          const actualCell = skeleton.getCellWithCoordByIndex(row, col);
          const { startRow, endRow, startColumn, endColumn } = actualCell.mergeInfo;
          if (startRow !== endRow || startColumn !== endColumn) {
            const sheetNotes = this._sheetsNoteModel.getSheetNotes(unitId, subUnitId);
            if (sheetNotes) {
              for (const [_id, _note] of sheetNotes) {
                if (_note.row >= startRow && _note.row <= endRow && _note.col >= startColumn && _note.col <= endColumn) {
                  note = _note;
                  targetRow = _note.row;
                  targetCol = _note.col;
                  break;
                }
              }
            }
          }
        }
        if (note == null ? void 0 : note.show) return;
        if (note) {
          this._sheetsNotePopupService.showPopup({
            unitId,
            subUnitId,
            noteId: note.id,
            row: targetRow,
            col: targetCol,
            temp: true
          });
        } else {
          this._sheetsNotePopupService.hidePopup();
        }
      })
    );
  }
  _initDeleteNoteListener() {
    this.disposeWithMe(
      this._sheetsNoteModel.change$.subscribe((change) => {
        if (!this._sheetsNotePopupService.activePopup) return;
        const { unitId, subUnitId, noteId, row, col } = this._sheetsNotePopupService.activePopup;
        const { oldNote, newNote } = change;
        if (newNote === null && change.unitId === unitId && change.subUnitId === subUnitId && ((oldNote == null ? void 0 : oldNote.id) && oldNote.id === noteId || (oldNote == null ? void 0 : oldNote.row) === row && oldNote.col === col)) {
          this._sheetsNotePopupService.hidePopup(true);
        }
      })
    );
  }
};
SheetsNotePopupController = __decorateClass([
  __decorateParam(0, Inject(SheetsNotePopupService)),
  __decorateParam(1, Inject(SheetsNoteModel)),
  __decorateParam(2, Inject(SheetsSelectionsService)),
  __decorateParam(3, IEditorBridgeService),
  __decorateParam(4, IRenderManagerService),
  __decorateParam(5, Inject(HoverManagerService))
], SheetsNotePopupController);

// ../packages/sheets-note-ui/src/commands/operations/add-note-popup.operation.ts
var AddNotePopupOperation = {
  id: "sheet.operation.add-note-popup",
  type: 1 /* OPERATION */,
  handler: async (accessor, params) => {
    var _a;
    const selectionService = accessor.get(SheetsSelectionsService);
    const notePopupService = accessor.get(SheetsNotePopupService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    if (!workbook) {
      return false;
    }
    const worksheet = workbook.getActiveSheet();
    const lastSelection = selectionService.getCurrentLastSelection();
    if (!(lastSelection == null ? void 0 : lastSelection.primary)) {
      return false;
    }
    const { primary } = lastSelection;
    notePopupService.showPopup({
      unitId: workbook.getUnitId(),
      subUnitId: worksheet.getSheetId(),
      row: primary.actualRow,
      col: primary.actualColumn,
      temp: false,
      trigger: (_a = params == null ? void 0 : params.trigger) != null ? _a : "add-note"
    });
    return true;
  }
};

// ../packages/sheets-note-ui/src/menu/note.menu.ts
function getHasNote$(accessor) {
  const sheetsSelectionsService = accessor.get(SheetsSelectionsService);
  const univerInstanceService = accessor.get(IUniverInstanceService);
  return sheetsSelectionsService.selectionMoveEnd$.pipe(map(() => {
    const selection = sheetsSelectionsService.getCurrentLastSelection();
    if (!(selection == null ? void 0 : selection.primary)) return false;
    const target = getSheetCommandTarget(univerInstanceService);
    if (!target) return false;
    const { actualColumn, actualRow } = selection.primary;
    const noteModel = accessor.get(SheetsNoteModel);
    return Boolean(noteModel.getNote(target.unitId, target.subUnitId, { row: actualRow, col: actualColumn }));
  }));
}
function sheetNoteContextMenuFactory(accessor) {
  return {
    id: AddNotePopupOperation.id,
    type: 0 /* BUTTON */,
    title: "sheets-note-ui.rightClick.addNote",
    icon: "AddNoteIcon",
    hidden$: combineLatest([getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */), getHasNote$(accessor)]).pipe(map(([hidden, hasNote]) => hidden || hasNote)),
    disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission] }),
    commandId: AddNotePopupOperation.id
  };
}
function sheetDeleteNoteMenuFactory(accessor) {
  return {
    id: SheetDeleteNoteCommand.id,
    type: 0 /* BUTTON */,
    title: "sheets-note-ui.rightClick.deleteNote",
    icon: "DeleteNoteIcon",
    hidden$: getHasNote$(accessor).pipe(map((hasNote) => !hasNote)),
    disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission] })
  };
}
function sheetNoteToggleMenuFactory(accessor) {
  return {
    id: SheetToggleNotePopupCommand.id,
    type: 0 /* BUTTON */,
    title: "sheets-note-ui.rightClick.toggleNote",
    icon: "HideNoteIcon",
    hidden$: getHasNote$(accessor).pipe(map((hasNote) => !hasNote))
  };
}

// ../packages/sheets-note-ui/src/menu/schema.ts
var menuSchema = {
  ["contextMenu.mainArea" /* MAIN_AREA */]: {
    ["contextMenu.others" /* OTHERS */]: {
      order: 0,
      [AddNotePopupOperation.id]: {
        order: 0,
        menuItemFactory: sheetNoteContextMenuFactory
      },
      [SheetDeleteNoteCommand.id]: {
        order: 0,
        menuItemFactory: sheetDeleteNoteMenuFactory
      },
      [SheetToggleNotePopupCommand.id]: {
        order: 0,
        menuItemFactory: sheetNoteToggleMenuFactory
      }
    }
  }
};

// ../packages/sheets-note-ui/src/views/Note.tsx
var import_react = __toESM(require_react());
var import_jsx_runtime = __toESM(require_jsx_runtime());
var SheetsNote = (props) => {
  var _a;
  const { popup } = props;
  const noteModel = useDependency(SheetsNoteModel);
  const localeService = useDependency(LocaleService);
  const renderManagerService = useDependency(IRenderManagerService);
  const notePopupService = useDependency(SheetsNotePopupService);
  const config = useConfigValue(SHEETS_NOTE_UI_PLUGIN_CONFIG_KEY);
  const activePopup = (_a = popup.extraProps) == null ? void 0 : _a.location;
  if (!activePopup) {
    console.error("Popup extraProps or location is undefined.");
    return null;
  }
  const textareaRef = (0, import_react.useRef)(null);
  const currentRender = renderManagerService.getRenderById(activePopup.unitId);
  const [note, setNote] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    var _a2, _b, _c, _d, _e, _f;
    const { unitId, subUnitId, row, col } = activePopup;
    const note2 = noteModel.getNote(unitId, subUnitId, { row, col });
    const width = (_c = (_b = note2 == null ? void 0 : note2.width) != null ? _b : (_a2 = config == null ? void 0 : config.defaultNoteSize) == null ? void 0 : _a2.width) != null ? _c : 160;
    const height = (_f = (_e = note2 == null ? void 0 : note2.height) != null ? _e : (_d = config == null ? void 0 : config.defaultNoteSize) == null ? void 0 : _d.height) != null ? _f : 72;
    if (!note2) {
      const initNote = {
        id: generateRandomId(6),
        width,
        height,
        note: ""
      };
      setNote(initNote);
      updateNote(initNote);
    } else {
      setNote(note2);
    }
    if (textareaRef.current) {
      textareaRef.current.style.width = `${width}px`;
      textareaRef.current.style.height = `${height}px`;
    }
  }, [activePopup, textareaRef]);
  (0, import_react.useEffect)(() => {
    if (!activePopup || activePopup.temp || !activePopup.trigger) return;
    if (!textareaRef.current) return;
    const focusId = requestAnimationFrame(() => {
      var _a2;
      (_a2 = textareaRef.current) == null ? void 0 : _a2.focus();
    });
    return () => cancelAnimationFrame(focusId);
  }, [activePopup]);
  const commandService = useDependency(ICommandService);
  const updateNote = useDebounceFn((newNote) => {
    if (!activePopup) return;
    const { unitId, subUnitId, row, col } = activePopup;
    const result = commandService.syncExecuteCommand(SheetUpdateNoteCommand.id, {
      unitId,
      sheetId: subUnitId,
      row,
      col,
      note: newNote
    });
    if (!result) {
      const oldNote = noteModel.getNote(unitId, subUnitId, { noteId: newNote.id, row, col });
      if (oldNote) {
        setNote(oldNote);
      } else {
        notePopupService.hidePopup(true);
      }
    }
  });
  const handleNoteChange = (0, import_react.useCallback)((value) => {
    if (!note) return;
    if (value === note.note) return;
    const newNote = { ...note, note: value };
    setNote(newNote);
    updateNote(newNote);
  }, [note]);
  const handleResize = (0, import_react.useCallback)((width, height) => {
    if (!note) return;
    if (width === note.width && height === note.height) return;
    const newNote = { ...note, width, height };
    setNote(newNote);
    updateNote(newNote);
  }, [note]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    Textarea,
    {
      ref: textareaRef,
      "data-u-comp": "note-textarea",
      className: clsx(`univer-ml-px univer-min-h-1 univer-min-w-1 univer-bg-white !univer-text-sm univer-shadow dark:!univer-bg-gray-800`),
      value: note == null ? void 0 : note.note,
      placeholder: localeService.t("sheets-note-ui.note.placeholder"),
      onResize: handleResize,
      onValueChange: handleNoteChange,
      onWheel: (e) => {
        if (document.activeElement !== textareaRef.current) {
          currentRender.engine.getCanvasElement().dispatchEvent(new WheelEvent(e.type, e.nativeEvent));
        }
      }
    }
  );
};

// ../packages/sheets-note-ui/src/controllers/sheets-note-ui.controller.ts
var SheetsNoteUIController = class extends Disposable {
  constructor(_componentManager, _menuManagerService, _commandService) {
    super();
    __publicField(this, "_componentManager", _componentManager);
    __publicField(this, "_menuManagerService", _menuManagerService);
    __publicField(this, "_commandService", _commandService);
    this._initComponents();
    this._initMenu();
    this._initCommands();
  }
  _initComponents() {
    [
      [SHEET_NOTE_COMPONENT, SheetsNote],
      ["AddNoteIcon", AddNoteIcon],
      ["DeleteNoteIcon", DeleteNoteIcon],
      ["HideNoteIcon", HideNoteIcon]
    ].forEach(([key, comp]) => {
      this.disposeWithMe(
        this._componentManager.register(key, comp)
      );
    });
  }
  _initMenu() {
    this._menuManagerService.mergeMenu(menuSchema);
  }
  _initCommands() {
    this._commandService.registerCommand(AddNotePopupOperation);
  }
};
SheetsNoteUIController = __decorateClass([
  __decorateParam(0, Inject(ComponentManager)),
  __decorateParam(1, Inject(IMenuManagerService)),
  __decorateParam(2, ICommandService)
], SheetsNoteUIController);

// ../packages/sheets-note-ui/src/plugin.ts
var UniverSheetsNoteUIPlugin = class extends Plugin {
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
    this._configService.setConfig(SHEETS_NOTE_UI_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    [
      [SheetsNotePopupService],
      [SheetsCellContentController],
      [SheetsNotePopupController],
      [SheetsNoteUIController],
      [SheetsNoteAttachmentController]
    ].forEach((dependency) => {
      this._injector.add(dependency);
    });
  }
  onReady() {
    touchDependencies(this._injector, [
      [SheetsNoteUIController],
      [SheetsCellContentController]
    ]);
  }
  onRendered() {
    touchDependencies(this._injector, [
      [SheetsNotePopupController],
      [SheetsNoteAttachmentController]
    ]);
  }
};
__publicField(UniverSheetsNoteUIPlugin, "pluginName", "SHEET_NOTE_UI_PLUGIN");
__publicField(UniverSheetsNoteUIPlugin, "packageName", package_default.name);
__publicField(UniverSheetsNoteUIPlugin, "version", package_default.version);
__publicField(UniverSheetsNoteUIPlugin, "type", 2 /* UNIVER_SHEET */);
UniverSheetsNoteUIPlugin = __decorateClass([
  DependentOn(UniverSheetsNotePlugin),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IConfigService)
], UniverSheetsNoteUIPlugin);

// ../packages/sheets-table-ui/package.json
var package_default2 = {
  name: "@univerjs/sheets-table-ui",
  version: "0.25.2",
  private: false,
  description: "Structured table UI for Univer Sheets.",
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
    "table",
    "structured-data",
    "ui"
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
    "@univerjs/engine-formula": "workspace:*",
    "@univerjs/engine-render": "workspace:*",
    "@univerjs/icons": "1.4.0",
    "@univerjs/sheets": "workspace:*",
    "@univerjs/sheets-formula-ui": "workspace:*",
    "@univerjs/sheets-sort": "workspace:*",
    "@univerjs/sheets-table": "workspace:*",
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

// ../packages/sheets-table-ui/src/const.ts
var PLUGIN_NAME = "SHEET_TABLE_UI_PLUGIN";
var SHEETS_TABLE_FILTER_PANEL_OPENED_KEY = "SHEETS_TABLE_FILTER_PANEL_OPENED_KEY";
var UNIVER_SHEET_TABLE_FILTER_PANEL_ID = "UNIVER_SHEET_Table_FILTER_PANEL_ID";
var TABLE_TOOLBAR_BUTTON = "TABLE_TOOLBAR_BUTTON";
var TABLE_SELECTOR_DIALOG = "TABLE_SELECTOR_DIALOG";
var SHEET_TABLE_RENAME_DIALOG = "SHEET_TABLE_RENAME_DIALOG";
var SHEET_TABLE_RENAME_DIALOG_ID = "SHEET_TABLE_RENAME_DIALOG_ID";
var SHEET_TABLE_THEME_PANEL_ID = "SHEET_TABLE_THEME_PANEL_ID";
var SHEET_TABLE_THEME_PANEL = "SHEET_TABLE_THEME_PANEL";
var TABLE_CUSTOM_NAME_PREFIX = "table-custom-";
var TABLE_DEFAULT_NAME_PREFIX = "table-default-";
var TABLE_DEFAULT_BG_COLOR = "rgb(255, 255, 255)";
var TABLE_BORDER_NONE = "none";
var TABLE_BORDER_DEFAULT = "1px solid rgb(var(--grey-200))";

// ../packages/sheets-table-ui/src/views/components/SheetTableFilterPanel.tsx
var import_react4 = __toESM(require_react());

// ../packages/sheets-table-ui/src/services/sheets-table-ui.service.ts
var SheetsTableUiService = class extends Disposable {
  constructor(_tableManager, _sheetTableService, _univerInstanceService, _commandService, _localeService) {
    super();
    __publicField(this, "_tableManager", _tableManager);
    __publicField(this, "_sheetTableService", _sheetTableService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_itemsCache", /* @__PURE__ */ new Map());
    this._registerTableFilterChangeEvent();
  }
  _registerTableFilterChangeEvent() {
    this._commandService.onCommandExecuted((command) => {
      if (command.id === SetRangeValuesMutation.id) {
        const { unitId, subUnitId, cellValue } = command.params;
        const tables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
        if (!tables.length) {
          return;
        }
        const matrix = new ObjectMatrix(cellValue);
        matrix.forValue((row, col, _value) => {
          const cellRange = cellToRange(row, col);
          const overlapTable = tables.find((table) => {
            const tableRange = table.getTableFilterRange();
            return Rectangle.intersects(tableRange, cellRange);
          });
          if (overlapTable) {
            const colIndex = col - overlapTable.getRange().startColumn;
            this._itemsCache.delete(overlapTable.getId() + colIndex);
          }
        });
      } else if (command.id === SetSheetTableFilterCommand.id) {
        const { unitId, tableId } = command.params;
        const table = this._tableManager.getTable(unitId, tableId);
        if (!table) {
          return;
        }
        const subUnitId = table.getSubunitId();
        const allSubTables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
        allSubTables.forEach((table2) => {
          const range = table2.getRange();
          for (let i = range.startColumn; i <= range.endColumn; i++) {
            this._itemsCache.delete(table2.getId() + i);
          }
        });
      }
    });
  }
  getTableFilterPanelInitProps(unitId, subUnitId, tableId, column) {
    const table = this._tableManager.getTable(unitId, tableId);
    const tableRange = table.getRange();
    const tableFilter = table.getTableFilterColumn(column - tableRange.startColumn);
    return {
      unitId,
      subUnitId,
      tableFilter,
      currentFilterBy: isConditionFilter(tableFilter) ? "condition" /* Condition */ : "items" /* Items */,
      tableId,
      columnIndex: column - tableRange.startColumn
    };
  }
  getTableFilterCheckedItems(unitId, tableId, columnIndex) {
    const table = this._tableManager.getTable(unitId, tableId);
    const checkedItems = [];
    if (table) {
      const filter2 = table.getTableFilterColumn(columnIndex);
      if (filter2 && isManualTableFilter(filter2)) {
        checkedItems.push(...filter2.values.map((value) => value === TABLE_FILTER_EMPTY_VALUE ? this._localeService.t("sheets-table-ui.condition.empty") : value));
      }
    }
    return checkedItems;
  }
  setTableFilter(unitId, tableId, columnIndex, tableFilter) {
    const table = this._tableManager.getTable(unitId, tableId);
    if (!table) {
      return;
    }
    const setTableFilterParams = {
      unitId,
      tableId,
      column: columnIndex,
      tableFilter
    };
    this._commandService.executeCommand(SetSheetTableFilterCommand.id, setTableFilterParams);
  }
  getTableFilterItems(unitId, subUnitId, tableId, columnIndex) {
    var _a;
    if (this._itemsCache.has(tableId + columnIndex)) {
      return this._itemsCache.get(tableId + columnIndex) || { data: [], itemsCountMap: /* @__PURE__ */ new Map(), allItemsCount: 0 };
    }
    const table = this._tableManager.getTable(unitId, tableId);
    if (!table) {
      return { data: [], itemsCountMap: /* @__PURE__ */ new Map(), allItemsCount: 0 };
    }
    const tableRange = table.getTableFilterRange();
    const { startRow, endRow, startColumn } = tableRange;
    const column = startColumn + columnIndex;
    const worksheet = (_a = this._univerInstanceService.getUnit(unitId)) == null ? void 0 : _a.getSheetBySheetId(subUnitId);
    if (!worksheet) {
      return { data: [], itemsCountMap: /* @__PURE__ */ new Map(), allItemsCount: 0 };
    }
    const data = [];
    const map2 = /* @__PURE__ */ new Map();
    const filteredRowsByOtherColumns = /* @__PURE__ */ new Set();
    const tableFilters = table.getTableFilters();
    for (let i = tableRange.startColumn; i <= tableRange.endColumn; i++) {
      const currentColumnIndex = i - tableRange.startColumn;
      if (currentColumnIndex !== columnIndex && table.getTableFilterColumn(currentColumnIndex)) {
        tableFilters.doColumnFilter(worksheet, tableRange, currentColumnIndex, filteredRowsByOtherColumns);
      }
    }
    let allItemsCount = 0;
    for (let row = startRow; row <= endRow; row++) {
      if (filteredRowsByOtherColumns.has(row)) {
        continue;
      }
      let stringItem = this._sheetTableService.getCellValueWithConditionType(worksheet, row, column);
      if (stringItem == null) {
        stringItem = this._localeService.t("sheets-table-ui.condition.empty");
      }
      if (!map2.has(stringItem)) {
        data.push({
          title: stringItem,
          key: `${column}_${row}`,
          leaf: true
        });
      }
      allItemsCount++;
      map2.set(stringItem, (map2.get(stringItem) || 0) + 1);
    }
    this._itemsCache.set(tableId + columnIndex, { data, itemsCountMap: map2, allItemsCount });
    return { data, itemsCountMap: map2, allItemsCount };
  }
};
SheetsTableUiService = __decorateClass([
  __decorateParam(0, Inject(TableManager)),
  __decorateParam(1, Inject(SheetTableService)),
  __decorateParam(2, Inject(IUniverInstanceService)),
  __decorateParam(3, ICommandService),
  __decorateParam(4, Inject(LocaleService))
], SheetsTableUiService);

// ../packages/sheets-table-ui/src/views/components/SheetTableConditionPanel.tsx
var import_react2 = __toESM(require_react());

// ../packages/sheets-table-ui/src/views/components/util.ts
function getCascaderListOptions(injector) {
  const localeService = injector.get(LocaleService);
  const t = localeService.t;
  return [
    {
      value: "string" /* String */,
      label: t(`sheets-table-ui.condition.${"string" /* String */}`),
      children: [
        {
          value: "equal" /* Equal */,
          label: t(`sheets-table-ui.string.compare.${"equal" /* Equal */}`)
        },
        {
          value: "notEqual" /* NotEqual */,
          label: t(`sheets-table-ui.string.compare.${"notEqual" /* NotEqual */}`)
        },
        {
          value: "contains" /* Contains */,
          label: t(`sheets-table-ui.string.compare.${"contains" /* Contains */}`)
        },
        {
          value: "notContains" /* NotContains */,
          label: t(`sheets-table-ui.string.compare.${"notContains" /* NotContains */}`)
        },
        {
          value: "startsWith" /* StartsWith */,
          label: t(`sheets-table-ui.string.compare.${"startsWith" /* StartsWith */}`)
        },
        {
          value: "endsWith" /* EndsWith */,
          label: t(`sheets-table-ui.string.compare.${"endsWith" /* EndsWith */}`)
        }
      ]
    },
    {
      value: "number" /* Number */,
      label: t(`sheets-table-ui.condition.${"number" /* Number */}`),
      children: [
        {
          value: "equal" /* Equal */,
          label: t(`sheets-table-ui.number.compare.${"equal" /* Equal */}`)
        },
        {
          value: "notEqual" /* NotEqual */,
          label: t(`sheets-table-ui.number.compare.${"notEqual" /* NotEqual */}`)
        },
        {
          value: "greaterThan" /* GreaterThan */,
          label: t(`sheets-table-ui.number.compare.${"greaterThan" /* GreaterThan */}`)
        },
        {
          value: "greaterThanOrEqual" /* GreaterThanOrEqual */,
          label: t(`sheets-table-ui.number.compare.${"greaterThanOrEqual" /* GreaterThanOrEqual */}`)
        },
        {
          value: "lessThan" /* LessThan */,
          label: t(`sheets-table-ui.number.compare.${"lessThan" /* LessThan */}`)
        },
        {
          value: "lessThanOrEqual" /* LessThanOrEqual */,
          label: t(`sheets-table-ui.number.compare.${"lessThanOrEqual" /* LessThanOrEqual */}`)
        },
        {
          value: "between" /* Between */,
          label: t(`sheets-table-ui.number.compare.${"between" /* Between */}`)
        },
        {
          value: "notBetween" /* NotBetween */,
          label: t(`sheets-table-ui.number.compare.${"notBetween" /* NotBetween */}`)
        },
        {
          value: "above" /* Above */,
          label: t(`sheets-table-ui.number.compare.${"above" /* Above */}`)
        },
        {
          value: "below" /* Below */,
          label: t(`sheets-table-ui.number.compare.${"below" /* Below */}`)
        }
        // {
        //     value: TableNumberCompareTypeEnum.TopN,
        //     label: t(`sheets-table-ui.number.compare.${TableNumberCompareTypeEnum.TopN}`),
        // },
      ]
    },
    {
      value: "date" /* Date */,
      label: t(`sheets-table-ui.condition.${"date" /* Date */}`),
      children: [
        {
          value: "equal" /* Equal */,
          label: t(`sheets-table-ui.date.compare.${"equal" /* Equal */}`)
        },
        {
          value: "notEqual" /* NotEqual */,
          label: t(`sheets-table-ui.date.compare.${"notEqual" /* NotEqual */}`)
        },
        {
          value: "after" /* After */,
          label: t(`sheets-table-ui.date.compare.${"after" /* After */}`)
        },
        {
          value: "afterOrEqual" /* AfterOrEqual */,
          label: t(`sheets-table-ui.date.compare.${"afterOrEqual" /* AfterOrEqual */}`)
        },
        {
          value: "before" /* Before */,
          label: t(`sheets-table-ui.date.compare.${"before" /* Before */}`)
        },
        {
          value: "beforeOrEqual" /* BeforeOrEqual */,
          label: t(`sheets-table-ui.date.compare.${"beforeOrEqual" /* BeforeOrEqual */}`)
        },
        {
          value: "between" /* Between */,
          label: t(`sheets-table-ui.date.compare.${"between" /* Between */}`)
        },
        {
          value: "notBetween" /* NotBetween */,
          label: t(`sheets-table-ui.date.compare.${"notBetween" /* NotBetween */}`)
        },
        {
          value: "today" /* Today */,
          label: t(`sheets-table-ui.date.compare.${"today" /* Today */}`)
        },
        {
          value: "yesterday" /* Yesterday */,
          label: t(`sheets-table-ui.date.compare.${"yesterday" /* Yesterday */}`)
        },
        {
          value: "tomorrow" /* Tomorrow */,
          label: t(`sheets-table-ui.date.compare.${"tomorrow" /* Tomorrow */}`)
        },
        {
          value: "thisWeek" /* ThisWeek */,
          label: t(`sheets-table-ui.date.compare.${"thisWeek" /* ThisWeek */}`)
        },
        {
          value: "lastWeek" /* LastWeek */,
          label: t(`sheets-table-ui.date.compare.${"lastWeek" /* LastWeek */}`)
        },
        {
          value: "nextWeek" /* NextWeek */,
          label: t(`sheets-table-ui.date.compare.${"nextWeek" /* NextWeek */}`)
        },
        {
          value: "thisMonth" /* ThisMonth */,
          label: t(`sheets-table-ui.date.compare.${"thisMonth" /* ThisMonth */}`)
        },
        {
          value: "lastMonth" /* LastMonth */,
          label: t(`sheets-table-ui.date.compare.${"lastMonth" /* LastMonth */}`)
        },
        {
          value: "nextMonth" /* NextMonth */,
          label: t(`sheets-table-ui.date.compare.${"nextMonth" /* NextMonth */}`)
        },
        {
          value: "thisYear" /* ThisYear */,
          label: t(`sheets-table-ui.date.compare.${"thisYear" /* ThisYear */}`)
        },
        {
          value: "lastYear" /* LastYear */,
          label: t(`sheets-table-ui.date.compare.${"lastYear" /* LastYear */}`)
        },
        {
          value: "nextYear" /* NextYear */,
          label: t(`sheets-table-ui.date.compare.${"nextYear" /* NextYear */}`)
        },
        {
          value: "quarter" /* Quarter */,
          label: t(`sheets-table-ui.date.compare.${"quarter" /* Quarter */}`)
        },
        {
          value: "month" /* Month */,
          label: t(`sheets-table-ui.date.compare.${"month" /* Month */}`)
        }
      ]
    }
  ];
}
function getConditionDateSelect(injector, dateType) {
  if (!dateType) {
    return [];
  }
  const localeService = injector.get(LocaleService);
  const t = localeService.t;
  switch (dateType) {
    case "quarter" /* Quarter */:
      return [
        {
          value: "q1" /* Q1 */,
          label: t(`sheets-table-ui.date.compare.${"q1" /* Q1 */}`)
        },
        {
          value: "q2" /* Q2 */,
          label: t(`sheets-table-ui.date.compare.${"q2" /* Q2 */}`)
        },
        {
          value: "q3" /* Q3 */,
          label: t(`sheets-table-ui.date.compare.${"q3" /* Q3 */}`)
        },
        {
          value: "q4" /* Q4 */,
          label: t(`sheets-table-ui.date.compare.${"q4" /* Q4 */}`)
        }
      ];
    case "month" /* Month */:
      return [
        {
          value: "m1" /* M1 */,
          label: t(`sheets-table-ui.date.compare.${"m1" /* M1 */}`)
        },
        {
          value: "m2" /* M2 */,
          label: t(`sheets-table-ui.date.compare.${"m2" /* M2 */}`)
        },
        {
          value: "m3" /* M3 */,
          label: t(`sheets-table-ui.date.compare.${"m3" /* M3 */}`)
        },
        {
          value: "m4" /* M4 */,
          label: t(`sheets-table-ui.date.compare.${"m4" /* M4 */}`)
        },
        {
          value: "m5" /* M5 */,
          label: t(`sheets-table-ui.date.compare.${"m5" /* M5 */}`)
        },
        {
          value: "m6" /* M6 */,
          label: t(`sheets-table-ui.date.compare.${"m6" /* M6 */}`)
        },
        {
          value: "m7" /* M7 */,
          label: t(`sheets-table-ui.date.compare.${"m7" /* M7 */}`)
        },
        {
          value: "m8" /* M8 */,
          label: t(`sheets-table-ui.date.compare.${"m8" /* M8 */}`)
        },
        {
          value: "m9" /* M9 */,
          label: t(`sheets-table-ui.date.compare.${"m9" /* M9 */}`)
        },
        {
          value: "m10" /* M10 */,
          label: t(`sheets-table-ui.date.compare.${"m10" /* M10 */}`)
        },
        {
          value: "m11" /* M11 */,
          label: t(`sheets-table-ui.date.compare.${"m11" /* M11 */}`)
        },
        {
          value: "m12" /* M12 */,
          label: t(`sheets-table-ui.date.compare.${"m12" /* M12 */}`)
        }
      ];
    default:
      return [];
  }
}
var datePickerSet = /* @__PURE__ */ new Set([
  "equal" /* Equal */,
  "notEqual" /* NotEqual */,
  "after" /* After */,
  "afterOrEqual" /* AfterOrEqual */,
  "before" /* Before */,
  "beforeOrEqual" /* BeforeOrEqual */
]);
function getSubComponentType(type, compare) {
  if (!compare) {
    return "None" /* None */;
  }
  if (type === "string" /* String */) {
    return "Input" /* Input */;
  } else if (type === "number" /* Number */) {
    if (compare === "between" /* Between */ || compare === "notBetween" /* NotBetween */) {
      return "Inputs" /* Inputs */;
    } else {
      return "Input" /* Input */;
    }
  } else if (type === "date" /* Date */) {
    if (compare === "between" /* Between */ || compare === "notBetween" /* NotBetween */) {
      return "DateRange" /* DateRange */;
    } else if (compare === "quarter" /* Quarter */ || compare === "month" /* Month */) {
      return "Select" /* Select */;
    } else if (datePickerSet.has(compare)) {
      return "DatePicker" /* DatePicker */;
    }
    return "None" /* None */;
  }
  return "None" /* None */;
}
function getInitConditionInfo(tableFilter) {
  if (!tableFilter || tableFilter.filterType !== "condition") {
    return {
      type: "string" /* String */,
      compareType: "equal" /* Equal */,
      info: {}
    };
  }
  const filterInfo = tableFilter.filterInfo;
  const { conditionType, compareType } = filterInfo;
  if (conditionType === "date" /* Date */) {
    if (compareType === "between" /* Between */ || compareType === "notBetween" /* NotBetween */) {
      let dateRange;
      if (Array.isArray(filterInfo.expectedValue)) {
        dateRange = filterInfo.expectedValue.map((i) => typeof i === "string" ? new Date(i) : i);
      }
      return {
        type: conditionType,
        compare: compareType,
        info: {
          dateRange
        }
      };
    } else if (compareType === "today" /* Today */ || compareType === "yesterday" /* Yesterday */ || compareType === "tomorrow" /* Tomorrow */ || compareType === "thisWeek" /* ThisWeek */ || compareType === "lastWeek" /* LastWeek */ || compareType === "nextWeek" /* NextWeek */ || compareType === "thisMonth" /* ThisMonth */ || compareType === "lastMonth" /* LastMonth */ || compareType === "nextMonth" /* NextMonth */ || compareType === "thisYear" /* ThisYear */ || compareType === "lastYear" /* LastYear */ || compareType === "nextYear" /* NextYear */) {
      return {
        type: conditionType,
        compare: compareType,
        info: {}
      };
    } else if (datePickerSet.has(compareType)) {
      let date;
      if (typeof filterInfo.expectedValue === "string") {
        date = new Date(filterInfo.expectedValue);
      } else if (Array.isArray(filterInfo.expectedValue)) {
        for (let i = 0; i < filterInfo.expectedValue.length; i++) {
          if (typeof filterInfo.expectedValue[i] === "string") {
            filterInfo.expectedValue[i] = new Date(filterInfo.expectedValue[i]);
          }
        }
      }
      return {
        type: conditionType,
        compare: compareType,
        info: {
          date
        }
      };
    } else {
      const quarter = /* @__PURE__ */ new Set(["q1" /* Q1 */, "q2" /* Q2 */, "q3" /* Q3 */, "q4" /* Q4 */]);
      if (quarter.has(compareType)) {
        return {
          type: conditionType,
          compare: "quarter" /* Quarter */,
          info: {
            dateSelect: filterInfo.compareType
          }
        };
      } else {
        return {
          type: conditionType,
          compare: "month" /* Month */,
          info: {
            dateSelect: filterInfo.compareType
          }
        };
      }
    }
  } else if (conditionType === "number" /* Number */) {
    if (compareType === "between" /* Between */ || compareType === "notBetween" /* NotBetween */) {
      return {
        type: conditionType,
        compare: compareType,
        info: {
          numberRange: filterInfo.expectedValue
        }
      };
    } else {
      return {
        type: conditionType,
        compare: compareType,
        info: {
          number: filterInfo.expectedValue
        }
      };
    }
  } else if (conditionType === "string" /* String */) {
    return {
      type: conditionType,
      compare: compareType,
      info: {
        string: filterInfo.expectedValue
      }
    };
  }
  return {
    type: "string" /* String */,
    compare: "equal" /* Equal */,
    info: {}
  };
}

// ../packages/sheets-table-ui/src/views/components/SheetTableConditionPanel.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
var SheetTableConditionPanel = (props) => {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const { conditionInfo, onChange } = props;
  const localeService = useDependency(LocaleService);
  const [conditionVisible, setConditionVisible] = (0, import_react2.useState)(false);
  const injector = useDependency(Injector);
  const cascaderOptions = getCascaderListOptions(injector);
  const handleConditionInfo = (info, type, compare) => {
    onChange({
      type: type != null ? type : conditionInfo.type,
      compare: compare != null ? compare : conditionInfo.compare,
      info
    });
  };
  const handleChange = (value) => {
    var _a2;
    const type = value[0];
    const compare = value[1];
    if (compare) {
      setConditionVisible(false);
    }
    ;
    const info = {};
    if (type === "date" /* Date */) {
      if (compare === "quarter" /* Quarter */) {
        info.dateSelect = "q1" /* Q1 */;
      } else if (compare === "month" /* Month */) {
        info.dateSelect = "m1" /* M1 */;
      } else if (datePickerSet.has(compare)) {
        info.date = /* @__PURE__ */ new Date();
      } else {
        info.dateRange = [/* @__PURE__ */ new Date(), /* @__PURE__ */ new Date()];
      }
    } else if (type === "number" /* Number */) {
      info.number = 0;
    } else if (type === "string" /* String */) {
      info.string = "";
    }
    handleConditionInfo(info, value[0], (_a2 = value[1]) != null ? _a2 : "equal" /* Equal */);
  };
  const subComponentType = getSubComponentType(conditionInfo.type, conditionInfo.compare);
  let selectType = "";
  if (conditionInfo.compare) {
    selectType = `${localeService.t(`sheets-table-ui.condition.${conditionInfo.type}`)} - ${localeService.t(`sheets-table-ui.${conditionInfo.type}.compare.${conditionInfo.compare}`)}`;
  } else {
    selectType = localeService.t(`sheets-table-ui.condition.${conditionInfo.type}`);
  }
  const conditionDateOptions = getConditionDateSelect(injector, conditionInfo.compare);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      Dropdown,
      {
        align: "start",
        open: conditionVisible,
        onOpenChange: setConditionVisible,
        overlay: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          CascaderList,
          {
            value: [conditionInfo.type, conditionInfo.compare],
            options: cascaderOptions,
            onChange: handleChange,
            contentClassName: "univer-flex-1",
            wrapperClassName: "!univer-h-[150px]"
          }
        ),
        children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
          "div",
          {
            className: clsx(`univer-box-border univer-flex univer-h-8 univer-w-full univer-items-center univer-justify-between univer-rounded-md univer-bg-white univer-px-2 univer-text-sm univer-transition-colors univer-duration-200 hover:univer-border-primary-600 focus:univer-border-primary-600 focus:univer-outline-none focus:univer-ring-2 dark:!univer-bg-gray-700 dark:!univer-text-white`, borderClassName),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: selectType }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(MoreDownIcon, {})
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "univer-mt-3 univer-w-full", children: [
      subComponentType === "Input" /* Input */ && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_jsx_runtime2.Fragment, { children: conditionInfo.type === "string" /* String */ ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        Input,
        {
          className: "univer-w-full",
          placeholder: "\u8BF7\u8F93\u5165",
          value: conditionInfo.info.string,
          onChange: (v) => handleConditionInfo({ string: v })
        }
      ) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        InputNumber,
        {
          className: "univer-h-7 univer-w-full",
          value: conditionInfo.info.number,
          controls: false,
          onChange: (v) => {
            if (v !== null) {
              handleConditionInfo({ number: v });
            }
          }
        }
      ) }),
      !!(subComponentType === "DatePicker" /* DatePicker */) && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { id: "univer-table-date-picker-wrapper", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        DatePicker,
        {
          className: "univer-w-full",
          value: (_a = conditionInfo.info.date) != null ? _a : /* @__PURE__ */ new Date(),
          onValueChange: (v) => handleConditionInfo({ date: v })
        }
      ) }),
      !!(subComponentType === "DateRange" /* DateRange */) && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { id: "univer-table-date-range-wrapper", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        DateRangePicker,
        {
          className: "univer-w-full",
          value: [(_c = (_b = conditionInfo.info.dateRange) == null ? void 0 : _b[0]) != null ? _c : /* @__PURE__ */ new Date(), (_e = (_d = conditionInfo.info.dateRange) == null ? void 0 : _d[1]) != null ? _e : /* @__PURE__ */ new Date()],
          onValueChange: (v) => {
            if (v) {
              handleConditionInfo({ dateRange: v });
            } else {
              handleConditionInfo({});
            }
          }
        }
      ) }),
      subComponentType === "Inputs" /* Inputs */ && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "univer-flex univer-items-center univer-gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          InputNumber,
          {
            className: "univer-w-full",
            value: (_f = conditionInfo.info.numberRange) == null ? void 0 : _f[0],
            onChange: (v) => {
              var _a2;
              if (v !== null) {
                handleConditionInfo({ numberRange: [v, (_a2 = conditionInfo.info.numberRange) == null ? void 0 : _a2[1]] });
              }
            },
            controls: false
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: " - " }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          InputNumber,
          {
            className: "univer-w-full",
            value: (_g = conditionInfo.info.numberRange) == null ? void 0 : _g[1],
            controls: false,
            onChange: (v) => {
              var _a2;
              if (v !== null) {
                handleConditionInfo({ numberRange: [(_a2 = conditionInfo.info.numberRange) == null ? void 0 : _a2[0], v] });
              }
            }
          }
        )
      ] }),
      !!(subComponentType === "Select" /* Select */) && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        Select,
        {
          className: "univer-w-full",
          value: (_h = conditionInfo.info.dateSelect) != null ? _h : conditionDateOptions[0].value,
          options: conditionDateOptions,
          onChange: (v) => handleConditionInfo({ dateSelect: v })
        }
      )
    ] })
  ] });
};

// ../packages/sheets-table-ui/src/views/components/SheetTableItemsFilterPanel.tsx
var import_react3 = __toESM(require_react());
var import_jsx_runtime3 = __toESM(require_jsx_runtime());
var getCheckedCount = (map2) => {
  let count = 0;
  map2.forEach((value) => {
    count += value;
  });
  return count;
};
function SheetTableItemsFilterPanel(props) {
  const { unitId, tableId, subUnitId, columnIndex, checkedItemSet, setCheckedItemSet, tableFilter } = props;
  const localeService = useDependency(LocaleService);
  const tableService = useDependency(SheetsTableUiService);
  const { data: items, itemsCountMap, allItemsCount } = tableService.getTableFilterItems(unitId, subUnitId, tableId, columnIndex);
  const [allChecked, setAllChecked] = (0, import_react3.useState)(tableFilter === void 0 ? true : checkedItemSet.size === itemsCountMap.size);
  const [checkedCount, setCheckedCount] = (0, import_react3.useState)(allChecked ? allItemsCount : getCheckedCount(itemsCountMap));
  const indeterminate = !allChecked && checkedItemSet.size > 0;
  const [searchText, setSearchText] = (0, import_react3.useState)("");
  const displayItems = (0, import_react3.useMemo)(() => {
    return searchText ? items.filter((item) => {
      return String(item.title).toLowerCase().includes(searchText.toLowerCase());
    }) : items;
  }, [searchText, items]);
  const onCheckAllToggled = (0, import_react3.useCallback)(() => {
    if (allChecked) {
      checkedItemSet.clear();
      setCheckedItemSet(new Set(checkedItemSet));
      setAllChecked(false);
    } else {
      displayItems.forEach((item) => {
        checkedItemSet.add(item.title);
      });
      setCheckedItemSet(new Set(checkedItemSet));
      setAllChecked(true);
    }
  }, [allChecked]);
  const onSearchValueChange = (0, import_react3.useCallback)((str) => {
    if (str === "") {
      setAllChecked(true);
      items.forEach((item) => {
        checkedItemSet.add(item.title);
      });
      setCheckedCount(allItemsCount);
    } else {
      checkedItemSet.clear();
      setAllChecked(false);
      setCheckedCount(0);
    }
    setSearchText(str);
  }, []);
  const onCheckItemToggled = (key) => {
    if (allChecked) {
      setAllChecked(false);
      const newSet = /* @__PURE__ */ new Set();
      for (const { title } of items) {
        if (key !== title) {
          newSet.add(title);
        }
      }
      setCheckedCount(allItemsCount - itemsCountMap.get(key));
      setCheckedItemSet(newSet);
    } else {
      if (checkedItemSet.has(key)) {
        checkedItemSet.delete(key);
        setCheckedCount(checkedCount - itemsCountMap.get(key));
      } else {
        checkedItemSet.add(key);
        setCheckedCount(checkedCount + itemsCountMap.get(key));
      }
      setCheckedItemSet(new Set(checkedItemSet));
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "univer-flex univer-h-full univer-flex-col", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Input, { autoFocus: true, value: searchText, placeholder: localeService.t("sheets-table-ui.filter.search-placeholder"), onChange: onSearchValueChange }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "div",
      {
        className: clsx(`univer-mt-2 univer-box-border univer-flex univer-h-[180px] univer-max-h-[180px] univer-flex-grow univer-flex-col univer-overflow-hidden univer-rounded-md univer-py-1.5 univer-pl-2`, borderClassName),
        children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "div",
          {
            className: clsx("univer-h-40 univer-min-w-0 univer-overflow-y-auto univer-py-1 univer-pl-2", scrollbarClassName),
            children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "univer-h-full", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "univer-flex univer-items-center univer-px-2 univer-py-1", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                Checkbox,
                {
                  className: "univer-min-w-0 univer-flex-1",
                  contentClassName: "univer-flex-1 univer-min-w-0",
                  indeterminate,
                  disabled: items.length === 0,
                  checked: allChecked,
                  onChange: onCheckAllToggled,
                  children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "univer-flex univer-h-5 univer-flex-1 univer-items-center univer-text-sm", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "univer-flex-1 univer-truncate", children: `${localeService.t("sheets-table-ui.filter.select-all")}` }),
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "univer-ml univer-text-gray-400", children: `(${checkedCount}/${searchText ? displayItems.length : allItemsCount})` })
                  ] })
                }
              ) }),
              displayItems.map((item) => {
                return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "div",
                  {
                    className: "univer-flex univer-items-center univer-px-2 univer-py-1",
                    children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                      Checkbox,
                      {
                        className: "univer-min-w-0 univer-flex-1",
                        contentClassName: "univer-flex-1 univer-min-w-0",
                        checked: allChecked || checkedItemSet.has(item.title),
                        onChange: () => {
                          onCheckItemToggled(item.title);
                        },
                        children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
                          "span",
                          {
                            className: `univer-flex univer-h-5 univer-flex-1 univer-items-center univer-text-sm`,
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "univer-flex-1 univer-truncate", children: item.title }),
                              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                                "span",
                                {
                                  className: `univer-ml-1 univer-inline-flex univer-h-full univer-items-center univer-text-gray-400`,
                                  children: `(${itemsCountMap.get(item.title) || 0})`
                                }
                              )
                            ]
                          }
                        )
                      }
                    )
                  },
                  item.key
                );
              })
            ] })
          }
        )
      }
    )
  ] });
}

// ../packages/sheets-table-ui/src/views/components/SheetTableFilterPanel.tsx
var import_jsx_runtime4 = __toESM(require_jsx_runtime());
function SheetTableFilterPanel() {
  var _a;
  const localeService = useDependency(LocaleService);
  const filterByItems = useFilterByOptions(localeService);
  const tableUiService = useDependency(SheetsTableUiService);
  const tableManager = useDependency(TableManager);
  const commandService = useDependency(ICommandService);
  const permissionService = useDependency(IPermissionService);
  const sheetsTableComponentController = useDependency(SheetsTableComponentController);
  const tableFilterPanelInfo = sheetsTableComponentController.getCurrentTableFilterInfo();
  const props = tableUiService.getTableFilterPanelInitProps(tableFilterPanelInfo.unitId, tableFilterPanelInfo.subUnitId, tableFilterPanelInfo.tableId, tableFilterPanelInfo.column);
  const { unitId, subUnitId, tableId, tableFilter, currentFilterBy, columnIndex } = props;
  const { data } = tableUiService.getTableFilterItems(unitId, subUnitId, tableId, columnIndex);
  const checkedItems = tableUiService.getTableFilterCheckedItems(unitId, tableId, columnIndex);
  const [checkedItemSet, setCheckedItemSet] = (0, import_react4.useState)(new Set(checkedItems));
  const [filterBy, setFilterBy] = (0, import_react4.useState)(currentFilterBy || "items" /* Items */);
  const [conditionInfo, setConditionInfo] = (0, import_react4.useState)(() => {
    const tableFilter2 = props.tableFilter;
    return getInitConditionInfo(tableFilter2);
  });
  const table = tableManager.getTable(unitId, tableId);
  if (!table) return null;
  const tableFilters = table.getTableFilters();
  const tableRange = table.getRange();
  const sortState = tableFilters.getSortState();
  const isAsc = sortState.columnIndex === columnIndex && sortState.sortState === "asc" /* Asc */;
  const isDesc = sortState.columnIndex === columnIndex && sortState.sortState === "desc" /* Desc */;
  const absoluteColumn = tableFilterPanelInfo.column;
  const canDeleteColumn = tableRange.endColumn > tableRange.startColumn;
  const closeDialog = () => {
    sheetsTableComponentController.closeFilterPanel();
  };
  const onCancel = () => {
    closeDialog();
  };
  const applySort = (asc) => {
    const range = table.getTableFilterRange();
    commandService.executeCommand(SortRangeCommand.id, {
      unitId,
      subUnitId,
      range,
      orderRules: [{ colIndex: columnIndex + range.startColumn, type: asc ? "asc" /* ASC */ : "desc" /* DESC */ }],
      hasTitle: false
    });
    tableFilters.setSortState(columnIndex, asc ? "asc" /* Asc */ : "desc" /* Desc */);
    closeDialog();
  };
  const insertColumn = (side) => {
    commandService.executeCommand(SheetTableInsertColumnAtCommand.id, {
      unitId,
      subUnitId,
      tableId,
      index: side === "left" ? absoluteColumn : absoluteColumn + 1,
      count: 1
    });
    closeDialog();
  };
  const deleteColumn = () => {
    if (!canDeleteColumn) {
      return;
    }
    commandService.executeCommand(SheetTableRemoveColumnAtCommand.id, {
      unitId,
      subUnitId,
      tableId,
      index: absoluteColumn,
      count: 1
    });
    closeDialog();
  };
  const onApply = () => {
    if (filterBy === "items" /* Items */) {
      const filteredItems = [];
      const emptyLabel = localeService.t("sheets-table-ui.condition.empty");
      for (const itemInfo of data) {
        if (checkedItemSet.has(itemInfo.title)) {
          filteredItems.push(itemInfo.title === emptyLabel ? TABLE_FILTER_EMPTY_VALUE : itemInfo.title);
        }
      }
      const originFilter = table.getTableFilterColumn(columnIndex);
      if (originFilter) {
        const originValue = originFilter.values;
        if (originValue.join(",") === filteredItems.join(",")) {
          closeDialog();
          return;
        }
      } else if (filteredItems.length === 0) {
        closeDialog();
        return;
      }
      const tableFilter2 = {
        filterType: "manual" /* manual */,
        values: filteredItems
      };
      tableUiService.setTableFilter(unitId, tableId, columnIndex, tableFilter2);
    } else {
      let filterInfo;
      if (conditionInfo.compare === "quarter" /* Quarter */ || conditionInfo.compare === "month" /* Month */) {
        filterInfo = {
          conditionType: conditionInfo.type,
          compareType: Object.values(conditionInfo.info)[0]
        };
      } else {
        filterInfo = {
          conditionType: conditionInfo.type,
          compareType: conditionInfo.compare,
          expectedValue: Object.values(conditionInfo.info)[0]
        };
      }
      const tableFilter2 = {
        filterType: "condition" /* condition */,
        // @ts-ignore
        filterInfo
      };
      tableUiService.setTableFilter(unitId, tableId, columnIndex, tableFilter2);
    }
    closeDialog();
  };
  const onClearFilter = () => {
    tableUiService.setTableFilter(unitId, tableId, columnIndex, void 0);
    closeDialog();
  };
  const workbookEditableId = new WorkbookEditablePermission(unitId).id;
  const editable = (_a = permissionService.getPermissionPoint(workbookEditableId)) == null ? void 0 : _a.value;
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "div",
    {
      className: `univer-box-border univer-flex univer-w-[400px] univer-flex-col univer-rounded-[10px] univer-bg-white univer-p-4 univer-shadow-lg dark:!univer-border-gray-600 dark:!univer-bg-gray-700`,
      children: [
        editable && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
            "div",
            {
              className: `-univer-mx-4 -univer-mt-2 univer-mb-3 univer-border-0 univer-border-b univer-border-solid univer-border-gray-200 univer-py-1`,
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
                  "button",
                  {
                    type: "button",
                    className: `univer-box-border univer-flex univer-h-10 univer-w-full univer-cursor-pointer univer-items-center univer-gap-3 univer-border-none univer-bg-transparent univer-px-4 univer-text-left univer-text-sm univer-text-gray-900 hover:univer-bg-gray-100 disabled:univer-cursor-not-allowed disabled:univer-text-gray-400 dark:!univer-text-white dark:hover:!univer-bg-gray-600`,
                    onClick: () => insertColumn("left"),
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(LeftInsertColumnDoubleIcon, { className: "univer-size-5", extend: { colorChannel1: "var(--univer-primary-600)" } }),
                      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: localeService.t("sheets-table-ui.columnMenu.insert-left") })
                    ]
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
                  "button",
                  {
                    type: "button",
                    className: `univer-box-border univer-flex univer-h-10 univer-w-full univer-cursor-pointer univer-items-center univer-gap-3 univer-border-none univer-bg-transparent univer-px-4 univer-text-left univer-text-sm univer-text-gray-900 hover:univer-bg-gray-100 disabled:univer-cursor-not-allowed disabled:univer-text-gray-400 dark:!univer-text-white dark:hover:!univer-bg-gray-600`,
                    onClick: () => insertColumn("right"),
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(RightInsertColumnDoubleIcon, { className: "univer-size-5", extend: { colorChannel1: "var(--univer-primary-600)" } }),
                      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: localeService.t("sheets-table-ui.columnMenu.insert-right") })
                    ]
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
                  "button",
                  {
                    type: "button",
                    className: `univer-box-border univer-flex univer-h-10 univer-w-full univer-cursor-pointer univer-items-center univer-gap-3 univer-border-none univer-bg-transparent univer-px-4 univer-text-left univer-text-sm univer-text-gray-900 hover:univer-bg-gray-100 disabled:univer-cursor-not-allowed disabled:univer-text-gray-400 dark:!univer-text-white dark:hover:!univer-bg-gray-600`,
                    disabled: !canDeleteColumn,
                    onClick: deleteColumn,
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(DeleteColumnDoubleIcon, { className: "univer-size-5", extend: { colorChannel1: "var(--univer-primary-600)" } }),
                      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: localeService.t("sheets-table-ui.columnMenu.delete") })
                    ]
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "univer-mb-3 univer-flex", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(ButtonGroup, { className: "univer-mb-3 !univer-flex univer-w-full", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Button, { className: "univer-w-1/2", onClick: () => applySort(true), children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(AscendingIcon, { className: "univer-mr-1" }),
              localeService.t("sheets-table-ui.sort.sort-asc")
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Button, { className: "univer-w-1/2", onClick: () => applySort(false), children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(DescendingIcon, { className: "univer-mr-1" }),
              localeService.t("sheets-table-ui.sort.sort-desc")
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "univer-w-full", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          Segmented,
          {
            value: filterBy,
            items: filterByItems,
            onChange: (value) => setFilterBy(value)
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "univer-z-10 univer-h-60", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "univer-mt-3 univer-size-full", children: filterBy === "items" /* Items */ ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          SheetTableItemsFilterPanel,
          {
            tableFilter,
            unitId,
            subUnitId,
            tableId,
            columnIndex,
            checkedItemSet,
            setCheckedItemSet
          }
        ) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          SheetTableConditionPanel,
          {
            tableFilter,
            unitId,
            subUnitId,
            tableId,
            columnIndex,
            conditionInfo,
            onChange: setConditionInfo
          }
        ) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
          "div",
          {
            className: `univer-flex-wrap-nowrap univer-mt-4 univer-inline-flex univer-flex-shrink-0 univer-flex-grow-0 univer-justify-between univer-gap-6 univer-overflow-hidden`,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                Button,
                {
                  disabled: tableFilter === void 0,
                  onClick: onClearFilter,
                  children: localeService.t("sheets-table-ui.filter.clear-filter")
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Button, { className: "univer-mr-2", onClick: onCancel, children: localeService.t("sheets-table-ui.filter.cancel") }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Button, { variant: "primary", onClick: onApply, children: localeService.t("sheets-table-ui.filter.confirm") })
              ] })
            ]
          }
        )
      ]
    }
  );
}
function useFilterByOptions(localeService) {
  const locale = localeService.getCurrentLocale();
  return (0, import_react4.useMemo)(() => [
    { label: localeService.t("sheets-table-ui.filter.by-values"), value: "items" /* Items */ },
    { label: localeService.t("sheets-table-ui.filter.by-conditions"), value: "condition" /* Condition */ }
  ], [locale, localeService]);
}

// ../packages/sheets-table-ui/src/views/components/SheetTableRenameDialog.tsx
var import_react5 = __toESM(require_react());
var import_jsx_runtime5 = __toESM(require_jsx_runtime());
function SheetTableRenameDialog(props) {
  var _a;
  const { unitId, tableId, onClose } = props;
  const localeService = useDependency(LocaleService);
  const commandService = useDependency(ICommandService);
  const tableManager = useDependency(TableManager);
  const univerInstanceService = useDependency(IUniverInstanceService);
  const definedNamesService = useDependency(IDefinedNamesService);
  const table = tableManager.getTableById(unitId, tableId);
  const [value, setValue] = (0, import_react5.useState)((_a = table == null ? void 0 : table.getDisplayName()) != null ? _a : "");
  const [error, setError] = (0, import_react5.useState)("");
  const existingNames = (0, import_react5.useMemo)(() => {
    const names = getExistingNamesSet(unitId, {
      univerInstanceService,
      tableManager,
      definedNamesService
    });
    const currentName = table == null ? void 0 : table.getDisplayName().toLowerCase();
    if (currentName) {
      names.delete(currentName);
    }
    return names;
  }, [definedNamesService, table, tableManager, unitId, univerInstanceService]);
  const handleConfirm = () => {
    const nextName = value.trim();
    if (!table || nextName === table.getDisplayName()) {
      onClose();
      return;
    }
    const validation = validateSheetTableName(nextName, existingNames);
    if (!validation.valid) {
      setError(localeService.t("sheets-table-ui.tableNameError"));
      return;
    }
    commandService.executeCommand(SetSheetTableCommand.id, {
      unitId,
      tableId,
      name: nextName
    });
    onClose();
  };
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    "div",
    {
      className: `univer-box-border univer-flex univer-w-full univer-flex-col univer-gap-4 univer-pb-3 univer-pt-2`,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          Input,
          {
            size: "middle",
            value,
            placeholder: localeService.t("sheets-table-ui.renamePlaceholder"),
            onChange: (nextValue) => {
              setValue(nextValue);
              setError("");
            },
            onKeyDown: (event) => {
              if (event.key === "Enter") {
                handleConfirm();
              }
            },
            autoFocus: true
          }
        ),
        error ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "-univer-mt-2 univer-text-sm univer-text-red-500", children: error }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "univer-flex univer-w-full univer-items-center univer-justify-end univer-gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { className: "univer-min-w-16", onClick: onClose, children: localeService.t("sheets-table-ui.cancel") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { className: "univer-min-w-16", variant: "primary", onClick: handleConfirm, children: localeService.t("sheets-table-ui.confirm") })
        ] })
      ]
    }
  );
}

// ../packages/sheets-table-ui/src/controllers/sheet-table-component.controller.ts
var SheetsTableComponentController = class extends Disposable {
  constructor(_componentManager, _contextService, _sheetCanvasPopupService, _dialogService) {
    super();
    __publicField(this, "_componentManager", _componentManager);
    __publicField(this, "_contextService", _contextService);
    __publicField(this, "_sheetCanvasPopupService", _sheetCanvasPopupService);
    __publicField(this, "_dialogService", _dialogService);
    __publicField(this, "_popupDisposable");
    __publicField(this, "_currentTableFilterInfo", null);
    this._initComponents();
    this._initUIPopup();
  }
  setCurrentTableFilterInfo(info) {
    this._currentTableFilterInfo = info;
  }
  openOrToggleFilterPanel(info) {
    var _a;
    const opened = this._contextService.getContextValue(SHEETS_TABLE_FILTER_PANEL_OPENED_KEY);
    if (opened && this._isSameFilterPanelInfo(this._currentTableFilterInfo, info)) {
      this.closeFilterPanel();
      return;
    }
    this.setCurrentTableFilterInfo(info);
    if (opened) {
      (_a = this._popupDisposable) == null ? void 0 : _a.dispose();
      this._popupDisposable = null;
      this._openFilterPopup();
      return;
    }
    this._contextService.setContextValue(SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, true);
  }
  clearCurrentTableFilterInfo() {
    this._currentTableFilterInfo = null;
  }
  getCurrentTableFilterInfo() {
    return this._currentTableFilterInfo;
  }
  _initComponents() {
    [
      [SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, SheetTableFilterPanel],
      [SHEET_TABLE_RENAME_DIALOG, SheetTableRenameDialog]
    ].forEach(([key, comp]) => {
      this.disposeWithMe(this._componentManager.register(key, comp));
    });
  }
  _initUIPopup() {
    this.disposeWithMe(this._contextService.subscribeContextValue$(SHEETS_TABLE_FILTER_PANEL_OPENED_KEY).pipe(startWith(void 0), distinctUntilChanged()).subscribe((open) => {
      if (open) {
        this._openFilterPopup();
      } else if (open === false) {
        this._closeFilterPopup();
      }
    }));
  }
  closeFilterPanel() {
    this._contextService.setContextValue(SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, false);
  }
  _openFilterPopup() {
    const currentFilterModel = this._currentTableFilterInfo;
    if (!currentFilterModel) {
      throw new Error("[SheetsFilterUIController]: no filter model when opening filter popup!");
    }
    const { row: startRow, column: col } = currentFilterModel;
    this._popupDisposable = this._sheetCanvasPopupService.attachPopupToCell(startRow, col, {
      componentKey: SHEETS_TABLE_FILTER_PANEL_OPENED_KEY,
      direction: "horizontal",
      onClickOutside: () => {
        this._dialogService.close(UNIVER_SHEET_TABLE_FILTER_PANEL_ID);
        this._contextService.setContextValue(SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, false);
      },
      offset: [5, 0],
      portal: true
    });
  }
  _closeFilterPopup() {
    var _a;
    (_a = this._popupDisposable) == null ? void 0 : _a.dispose();
    this._popupDisposable = null;
    this.clearCurrentTableFilterInfo();
  }
  _isSameFilterPanelInfo(a, b) {
    return Boolean(a && a.unitId === b.unitId && a.subUnitId === b.subUnitId && a.tableId === b.tableId && a.column === b.column && a.row === b.row);
  }
};
SheetsTableComponentController = __decorateClass([
  __decorateParam(0, Inject(ComponentManager)),
  __decorateParam(1, IContextService),
  __decorateParam(2, Inject(SheetCanvasPopManagerService)),
  __decorateParam(3, Inject(IDialogService))
], SheetsTableComponentController);

// ../packages/sheets-table-ui/src/commands/operations/open-table-filter-dialog.opration.ts
var OpenTableFilterPanelOperation = {
  type: 1 /* OPERATION */,
  id: "sheet.operation.open-table-filter-panel",
  async handler(accessor, params) {
    if (!params) {
      return false;
    }
    const { row, col, unitId, subUnitId, tableId } = params;
    const tableManager = accessor.get(TableManager);
    const sheetsTableComponentController = accessor.get(SheetsTableComponentController);
    const table = tableManager.getTable(unitId, tableId);
    if (!table) {
      return false;
    }
    sheetsTableComponentController.openOrToggleFilterPanel({ unitId, subUnitId, row, tableId, column: col });
    return true;
  }
};

// ../packages/sheets-table-ui/src/commands/operations/open-table-selector.operation.ts
var OpenTableSelectorOperation = {
  type: 1 /* OPERATION */,
  id: "sheet.operation.open-table-selector",
  async handler(accessor) {
    var _a;
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const commandService = accessor.get(ICommandService);
    const target = getSheetCommandTarget(univerInstanceService);
    if (!target) {
      return false;
    }
    const { unitId, subUnitId, worksheet } = target;
    const sheetsSelectionsService = accessor.get(SheetsSelectionsService);
    const lastSelection = sheetsSelectionsService.getCurrentLastSelection();
    const range = (_a = lastSelection == null ? void 0 : lastSelection.range) != null ? _a : { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 };
    const isSingleCell = isSingleCellSelection(lastSelection);
    const extendedRange = isSingleCell ? expandToContinuousRange(range, { up: true, left: true, right: true, down: true }, worksheet) : range;
    const rangeInfo = await openRangeSelector(accessor, unitId, subUnitId, extendedRange);
    if (!rangeInfo) {
      return false;
    }
    commandService.executeCommand(AddSheetTableCommand.id, { ...rangeInfo });
    return true;
  }
};
async function openRangeSelector(accessor, unitId, subUnitId, range, tableId) {
  const dialogService = accessor.get(IDialogService);
  const localeService = accessor.get(LocaleService);
  return new Promise((resolve) => {
    const dialogProps = {
      unitId,
      subUnitId,
      range,
      tableId,
      onConfirm: (info) => {
        resolve(info);
        dialogService.close(TABLE_SELECTOR_DIALOG);
      },
      onCancel: () => {
        resolve(null);
        dialogService.close(TABLE_SELECTOR_DIALOG);
      }
    };
    dialogService.open({
      id: TABLE_SELECTOR_DIALOG,
      title: { title: localeService.t("sheets-table-ui.selectRange") },
      draggable: true,
      destroyOnClose: true,
      mask: false,
      maskClosable: false,
      children: {
        label: {
          name: TABLE_SELECTOR_DIALOG,
          props: dialogProps
        }
      },
      width: 300,
      onClose: () => {
        resolve(null);
        dialogService.close(TABLE_SELECTOR_DIALOG);
      }
    });
  });
}

// ../packages/sheets-table-ui/src/config/config.ts
var SHEETS_TABLE_UI_PLUGIN_CONFIG_KEY = "sheets-table-ui.config";
var configSymbol2 = Symbol(SHEETS_TABLE_UI_PLUGIN_CONFIG_KEY);
var defaultPluginConfig2 = {
  anchorHeight: 24,
  anchorBackgroundColor: "rgb(134,139,156)"
};

// ../packages/sheets-table-ui/src/views/widgets/table-controls-util.ts
var TABLE_CONTROL_ANCHOR_HEIGHT = 28;
var TABLE_CONTROL_ANCHOR_RADIUS = 14;
var TABLE_CONTROL_MENU_WIDTH = 168;
var TABLE_CONTROL_MENU_ITEM_HEIGHT = 32;
var TABLE_CONTROL_INSERT_BUTTON_SIZE = 22;
var TABLE_CONTROL_TOP_GAP_SIZE = 32;
var TABLE_CONTROL_MENU_ACTIONS = ["rename", "update-range", "set-theme", "delete"];
function isPointInTableControlRegion(region, x, y) {
  return x >= region.left && x <= region.left + region.width && y >= region.top && y <= region.top + region.height;
}
function hitTestTableControl(regions, x, y) {
  for (let i = regions.length - 1; i >= 0; i--) {
    if (isPointInTableControlRegion(regions[i], x, y)) {
      return regions[i];
    }
  }
  return null;
}
function buildTableMenuRegions(tableId, left, top) {
  return TABLE_CONTROL_MENU_ACTIONS.map((action, index) => ({
    type: "menu-item",
    tableId,
    action,
    left,
    top: top + index * TABLE_CONTROL_MENU_ITEM_HEIGHT,
    width: TABLE_CONTROL_MENU_WIDTH,
    height: TABLE_CONTROL_MENU_ITEM_HEIGHT
  }));
}
function buildCenteredPlusSegments(centerX, centerY, size) {
  const halfSize = size / 2;
  return [
    { fromX: centerX - halfSize, fromY: centerY, toX: centerX + halfSize, toY: centerY },
    { fromX: centerX, fromY: centerY - halfSize, toX: centerX, toY: centerY + halfSize }
  ];
}

// ../packages/sheets-table-ui/src/views/widgets/table-controls.shape.ts
var ANCHOR_MIN_WIDTH = 122;
var ANCHOR_MAX_WIDTH = 240;
var ANCHOR_PADDING_X = 12;
var ANCHOR_TOGGLE_WIDTH = 30;
var ANCHOR_OFFSET_Y = 0;
var ANCHOR_BORDER = "rgba(0, 0, 0, 0.22)";
var ANCHOR_DIVIDER = "rgba(0, 0, 0, 0.20)";
var ANCHOR_TOGGLE_BG_ACTIVE = "rgba(0, 0, 0, 0.12)";
var MENU_RADIUS = 8;
var MENU_BORDER = "#d9dee7";
var MENU_HOVER_BG = "#f1f3f4";
var INSERT_BUTTON_VISUAL_SIZE = 18;
var INSERT_BUTTON_PLUS_SIZE = 8;
var SheetTableControlsShape = class extends Shape {
  constructor(key, _getSkeleton) {
    super(key, {
      evented: true,
      fill: "rgba(0, 0, 0, 0)",
      zIndex: 5001
    });
    __publicField(this, "_getSkeleton", _getSkeleton);
    __publicField(this, "_items", []);
    __publicField(this, "_regions", []);
    __publicField(this, "_openedMenuTableId", null);
    __publicField(this, "_hoveredRegion", null);
    __publicField(this, "_hoveredInsertRegion", null);
    __publicField(this, "_menuLabels", {
      rename: "Rename table",
      "update-range": "Update range",
      "set-theme": "Set theme",
      delete: "Remove table"
    });
  }
  setItems(items) {
    this._items = items;
    this.makeDirty(true);
  }
  setMenuLabels(labels) {
    this._menuLabels = labels;
    this.makeDirty(true);
  }
  setOpenedMenuTableId(tableId) {
    if (this._openedMenuTableId === tableId) {
      return;
    }
    this._openedMenuTableId = tableId;
    this.makeDirty(true);
  }
  getOpenedMenuTableId() {
    return this._openedMenuTableId;
  }
  setHoveredRegion(region) {
    if (this._hoveredRegion === region) {
      return;
    }
    this._hoveredRegion = region;
    this.makeDirty(true);
  }
  setHoveredInsertRegion(region) {
    if (this._hoveredInsertRegion === region) {
      return;
    }
    this._hoveredInsertRegion = region;
    this.makeDirty(true);
  }
  hitTest(x, y) {
    return hitTestTableControl(this._regions, x, y);
  }
  isHit(coord) {
    return this.hitTest(coord.x, coord.y) != null;
  }
  refreshBounds() {
    const skeleton = this._getSkeleton();
    if (!skeleton) {
      this.hide();
      return;
    }
    this.show();
    this.transformByState({
      left: 0,
      top: 0,
      width: skeleton.rowHeaderWidth + skeleton.columnTotalWidth,
      height: skeleton.columnHeaderHeight + skeleton.rowTotalHeight
    });
  }
  _draw(ctx) {
    var _a;
    this._regions = [];
    const skeleton = this._getSkeleton();
    if (!skeleton) {
      return;
    }
    ctx.save();
    ctx.textBaseline = "middle";
    for (const item of this._items) {
      this._drawAnchor(ctx, skeleton, item);
    }
    if (this._hoveredInsertRegion) {
      const item = this._items.find((renderItem) => {
        var _a2;
        return renderItem.tableId === ((_a2 = this._hoveredInsertRegion) == null ? void 0 : _a2.tableId);
      });
      this._drawInsertButton(ctx, this._hoveredInsertRegion, (_a = item == null ? void 0 : item.fill) != null ? _a : "#355bb7");
      this._regions.push(this._hoveredInsertRegion);
    }
    ctx.restore();
  }
  _drawAnchor(ctx, skeleton, item) {
    const position = skeleton.getNoMergeCellWithCoordByIndex(item.range.startRow, item.range.startColumn);
    const left = position.startX;
    const rawTop = position.startY - TABLE_CONTROL_ANCHOR_HEIGHT - ANCHOR_OFFSET_Y;
    const top = Math.max(0, rawTop);
    const width = Math.max(ANCHOR_MIN_WIDTH, Math.min(ANCHOR_MAX_WIDTH, item.tableName.length * 8.5 + ANCHOR_PADDING_X * 2 + ANCHOR_TOGGLE_WIDTH));
    const toggleRegion = {
      type: "anchor-menu-toggle",
      tableId: item.tableId,
      left: left + width - ANCHOR_TOGGLE_WIDTH,
      top,
      width: ANCHOR_TOGGLE_WIDTH,
      height: TABLE_CONTROL_ANCHOR_HEIGHT
    };
    ctx.save();
    ctx.translateWithPrecision(left, top);
    this._drawTopRoundedRect(ctx, width, TABLE_CONTROL_ANCHOR_HEIGHT, TABLE_CONTROL_ANCHOR_RADIUS, item.fill, ANCHOR_BORDER);
    this._drawAnchorToggle(ctx, width, item.text, this._openedMenuTableId === item.tableId || this._isSameRegion(this._hoveredRegion, toggleRegion));
    ctx.font = `600 13px ${DEFAULT_FONTFACE_PLANE}`;
    ctx.fillStyle = item.text;
    ctx.textAlign = "left";
    ctx.fillText(item.tableName, ANCHOR_PADDING_X, TABLE_CONTROL_ANCHOR_HEIGHT / 2);
    ctx.restore();
    this._regions.push({
      type: "anchor-main",
      tableId: item.tableId,
      left,
      top,
      width,
      height: TABLE_CONTROL_ANCHOR_HEIGHT
    });
    this._regions.push(toggleRegion);
    if (this._openedMenuTableId === item.tableId) {
      this._drawMenu(ctx, item.tableId, left, top + TABLE_CONTROL_ANCHOR_HEIGHT);
    }
  }
  _drawAnchorToggle(ctx, anchorWidth, color, active) {
    const toggleLeft = anchorWidth - ANCHOR_TOGGLE_WIDTH;
    if (active) {
      this._drawRightTopRoundedRect(ctx, toggleLeft, anchorWidth, TABLE_CONTROL_ANCHOR_HEIGHT, TABLE_CONTROL_ANCHOR_RADIUS, ANCHOR_TOGGLE_BG_ACTIVE);
    }
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = ANCHOR_DIVIDER;
    ctx.lineWidth = 1;
    ctx.moveTo(toggleLeft + 0.5, 5);
    ctx.lineTo(toggleLeft + 0.5, TABLE_CONTROL_ANCHOR_HEIGHT - 5);
    ctx.stroke();
    ctx.restore();
    const centerX = anchorWidth - ANCHOR_TOGGLE_WIDTH / 2;
    const centerY = TABLE_CONTROL_ANCHOR_HEIGHT / 2;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    ctx.moveTo(centerX - 5, centerY - 4);
    ctx.lineTo(centerX + 5, centerY - 4);
    ctx.moveTo(centerX - 5, centerY);
    ctx.lineTo(centerX + 5, centerY);
    ctx.moveTo(centerX - 5, centerY + 4);
    ctx.lineTo(centerX + 5, centerY + 4);
    ctx.stroke();
    ctx.restore();
  }
  _drawTopRoundedRect(ctx, width, height, radius, fill, stroke) {
    const r = Math.min(radius, width / 2, height);
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, r);
    ctx.arcTo(0, 0, r, 0, r);
    ctx.lineTo(width - r, 0);
    ctx.arcTo(width, 0, width, r, r);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  _drawRightTopRoundedRect(ctx, left, width, height, radius, fill) {
    const r = Math.min(radius, width - left, height);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(left, height);
    ctx.lineTo(left, 0);
    ctx.lineTo(width - r, 0);
    ctx.arcTo(width, 0, width, r, r);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.restore();
  }
  _drawMenu(ctx, tableId, left, top) {
    const regions = buildTableMenuRegions(tableId, left, top);
    ctx.save();
    ctx.translateWithPrecision(left, top);
    Rect.drawWith(ctx, {
      width: TABLE_CONTROL_MENU_WIDTH,
      height: regions.length * TABLE_CONTROL_MENU_ITEM_HEIGHT,
      radius: MENU_RADIUS,
      fill: "#fff",
      stroke: MENU_BORDER
    });
    ctx.restore();
    for (const region of regions) {
      const hovered = this._isSameRegion(this._hoveredRegion, region);
      if (hovered) {
        ctx.save();
        ctx.fillStyle = MENU_HOVER_BG;
        ctx.fillRectByPrecision(region.left, region.top, region.width, region.height);
        ctx.restore();
      }
      ctx.save();
      ctx.font = `12px ${DEFAULT_FONTFACE_PLANE}`;
      ctx.fillStyle = region.action === "delete" ? "#d92d20" : "#344054";
      ctx.textAlign = "left";
      ctx.fillText(this._menuLabels[region.action], region.left + 12, region.top + region.height / 2);
      ctx.restore();
    }
    this._regions.push(...regions);
  }
  _drawInsertButton(ctx, region, fill) {
    const centerX = region.left + region.width / 2;
    const centerY = region.top + region.height / 2;
    const radius = INSERT_BUTTON_VISUAL_SIZE / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = fill;
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = fill;
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    for (const segment of buildCenteredPlusSegments(centerX, centerY, INSERT_BUTTON_PLUS_SIZE)) {
      ctx.moveTo(segment.fromX, segment.fromY);
      ctx.lineTo(segment.toX, segment.toY);
    }
    ctx.stroke();
    ctx.restore();
  }
  _isSameRegion(a, b) {
    return Boolean(a && a.type === b.type && a.tableId === b.tableId && a.action === b.action && a.index === b.index);
  }
};

// ../packages/sheets-table-ui/src/controllers/sheet-table-theme-ui.controller.ts
var SheetTableThemeUIController = class extends Disposable {
  constructor(_commandService) {
    super();
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_refreshTable", new Subject());
    __publicField(this, "refreshTable$", this._refreshTable.asObservable());
    this._initListener();
  }
  _initListener() {
    this.disposeWithMe(
      this._commandService.onCommandExecuted((command) => {
        if (command.id === SetRangeThemeMutation.id) {
          const params = command.params;
          const { styleName } = params;
          if (styleName.startsWith(SHEET_TABLE_CUSTOM_THEME_PREFIX)) {
            this._refreshTable.next(Math.random());
          }
        }
      })
    );
  }
};
SheetTableThemeUIController = __decorateClass([
  __decorateParam(0, Inject(ICommandService))
], SheetTableThemeUIController);

// ../packages/sheets-table-ui/src/controllers/sheet-table-controls-render.controller.ts
var TABLE_CONTROLS_LAYER_INDEX = 5002;
var TABLE_CONTROL_GAP_ROW = 0;
var TABLE_RENDER_REFRESH_COMMANDS = /* @__PURE__ */ new Set([
  SetScrollOperation.id,
  SetZoomRatioOperation.id
]);
function isSameTopGap(left, right) {
  if (left === null || right === null) {
    return left === right;
  }
  return left.size === right.size && left.color === right.color && left.stripeColor === right.stripeColor;
}
var SheetTableControlsRenderController = class extends Disposable {
  constructor(_context, _injector, _sheetSkeletonManagerService, _commandService, _tableManager, _rangeThemeModel, _workbookPermissionService, _permissionService, _sheetsSelectionsService, _selectionRenderService, _sheetTableThemeUIController, _localeService, _dialogService, _sidebarService) {
    super();
    __publicField(this, "_context", _context);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_sheetSkeletonManagerService", _sheetSkeletonManagerService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_tableManager", _tableManager);
    __publicField(this, "_rangeThemeModel", _rangeThemeModel);
    __publicField(this, "_workbookPermissionService", _workbookPermissionService);
    __publicField(this, "_permissionService", _permissionService);
    __publicField(this, "_sheetsSelectionsService", _sheetsSelectionsService);
    __publicField(this, "_selectionRenderService", _selectionRenderService);
    __publicField(this, "_sheetTableThemeUIController", _sheetTableThemeUIController);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_dialogService", _dialogService);
    __publicField(this, "_sidebarService", _sidebarService);
    __publicField(this, "_shape");
    __publicField(this, "_topGapBaseBySkeleton", /* @__PURE__ */ new WeakMap());
    this._shape = new SheetTableControlsShape(
      "SheetTableControlsShape",
      () => this._sheetSkeletonManagerService.getCurrentSkeleton() || null
    );
    this._initShape();
    this._initRefresh();
    this._refresh();
  }
  _initShape() {
    var _a, _b;
    this._context.scene.addObjects([this._shape], TABLE_CONTROLS_LAYER_INDEX);
    this.disposeWithMe(toDisposable(() => {
      this._context.scene.removeObjects([this._shape]);
    }));
    this.disposeWithMe(this._shape.onPointerMove$.subscribeEvent((evt, state) => {
      this._handlePointerMove(evt, state);
    }));
    this.disposeWithMe(this._shape.onPointerLeave$.subscribeEvent((_evt, state) => {
      this._handlePointerLeave(state);
    }));
    this.disposeWithMe(this._shape.onPointerDown$.subscribeEvent((evt, state) => {
      this._handlePointerDown(evt, state);
    }));
    this.disposeWithMe((_b = (_a = this._context.components.get("__SpreadsheetRender__" /* MAIN */)) == null ? void 0 : _a.onPointerMove$.subscribeEvent((evt) => {
      const point = this._getLocalPoint(evt);
      const insertRegion = this._getInsertRegionFromPoint(point.x, point.y);
      this._shape.setHoveredInsertRegion(insertRegion);
    })) != null ? _b : toDisposable(() => {
    }));
  }
  _initRefresh() {
    const commandExecuted$ = fromCallback(this._commandService.onCommandExecuted.bind(this._commandService)).pipe(filter(([command]) => {
      if (command.type === 1 /* OPERATION */ && TABLE_RENDER_REFRESH_COMMANDS.has(command.id)) {
        this._closeFloatingControls();
        return true;
      }
      return command.type === 2 /* MUTATION */ || command.type === 0 /* COMMAND */;
    }));
    this.disposeWithMe(merge(
      this._context.unit.activeSheet$,
      this._sheetSkeletonManagerService.currentSkeleton$,
      this._tableManager.tableAdd$,
      this._tableManager.tableDelete$,
      this._tableManager.tableNameChanged$,
      this._tableManager.tableRangeChanged$,
      this._tableManager.tableThemeChanged$,
      this._sheetTableThemeUIController.refreshTable$,
      this._workbookPermissionService.unitPermissionInitStateChange$,
      this._permissionService.permissionPointUpdate$,
      this._sheetsSelectionsService.selectionChanged$,
      commandExecuted$
    ).subscribe(() => {
      this._closeFloatingControls();
      this._refresh();
    }));
  }
  _refresh() {
    const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
    const worksheet = this._context.unit.getActiveSheet();
    if (!skeleton || !worksheet || !this._canEditWorkbook()) {
      this._shape.setItems([]);
      this._shape.refreshBounds();
      this._context.scene.makeDirty();
      return;
    }
    this._syncTopTableGap(skeleton);
    this._shape.setMenuLabels({
      rename: this._localeService.t("sheets-table-ui.rename"),
      "update-range": this._localeService.t("sheets-table-ui.updateRange"),
      "set-theme": this._localeService.t("sheets-table-ui.setTheme"),
      delete: this._localeService.t("sheets-table-ui.removeTable")
    });
    const unitId = this._context.unit.getUnitId();
    const subUnitId = worksheet.getSheetId();
    const items = this._tableManager.getTablesBySubunitId(unitId, subUnitId).map((table) => {
      var _a, _b, _c, _d, _e, _f;
      const rangeTheme = this._rangeThemeModel.getRangeThemeStyle(unitId, table.getTableStyleId());
      return {
        tableId: table.getId(),
        tableName: table.getDisplayName(),
        range: table.getRange(),
        fill: (_c = (_b = (_a = rangeTheme == null ? void 0 : rangeTheme.getHeaderRowStyle()) == null ? void 0 : _a.bg) == null ? void 0 : _b.rgb) != null ? _c : "rgb(53,91,183)",
        text: (_f = (_e = (_d = rangeTheme == null ? void 0 : rangeTheme.getHeaderRowStyle()) == null ? void 0 : _d.cl) == null ? void 0 : _e.rgb) != null ? _f : "rgb(255,255,255)"
      };
    });
    this._shape.setItems(items);
    this._shape.refreshBounds();
    this._shape.makeDirty(true);
    this._context.scene.makeDirty();
  }
  _canEditWorkbook() {
    var _a;
    const unitId = this._context.unit.getUnitId();
    const workbookEditPermission = (_a = this._permissionService.getPermissionPoint(new WorkbookEditablePermission(unitId).id)) == null ? void 0 : _a.value;
    return workbookEditPermission !== false;
  }
  _handlePointerMove(evt, state) {
    const point = this._getLocalPoint(evt);
    const hit = this._shape.hitTest(point.x, point.y);
    const insertRegion = this._isInsertHit(hit) ? hit : hit ? null : this._getInsertRegionFromPoint(point.x, point.y);
    const activeHit = hit != null ? hit : insertRegion;
    this._shape.setHoveredRegion(this._isInsertHit(hit) ? null : hit);
    this._shape.setHoveredInsertRegion(insertRegion);
    if (activeHit) {
      state.stopPropagation();
      this._context.scene.setCursor("pointer" /* POINTER */);
    } else {
      this._context.scene.resetCursor();
    }
  }
  _isInsertHit(hit) {
    return (hit == null ? void 0 : hit.type) === "insert-row" || (hit == null ? void 0 : hit.type) === "insert-column";
  }
  _handlePointerLeave(state) {
    state.stopPropagation();
    this._shape.setHoveredRegion(null);
    this._shape.setHoveredInsertRegion(null);
    this._context.scene.resetCursor();
  }
  _handlePointerDown(evt, state) {
    var _a;
    if (evt.button === 2) {
      return;
    }
    const point = this._getLocalPoint(evt);
    const hit = (_a = this._shape.hitTest(point.x, point.y)) != null ? _a : this._getInsertRegionFromPoint(point.x, point.y);
    if (!hit) {
      this._closeFloatingControls();
      return;
    }
    state.stopPropagation();
    evt.stopPropagation();
    evt.preventDefault();
    this._handleHit(hit);
  }
  _handleHit(hit) {
    const worksheet = this._context.unit.getActiveSheet();
    if (!worksheet) {
      return;
    }
    const unitId = this._context.unit.getUnitId();
    const subUnitId = worksheet.getSheetId();
    if (hit.type === "anchor-menu-toggle" || hit.type === "anchor-main") {
      this._shape.setOpenedMenuTableId(this._shape.getOpenedMenuTableId() === hit.tableId ? null : hit.tableId);
      return;
    }
    if (hit.type === "insert-row") {
      this._commandService.executeCommand(SheetTableInsertRowAtCommand.id, {
        unitId,
        subUnitId,
        tableId: hit.tableId,
        index: hit.index,
        count: 1
      });
      this._closeFloatingControls();
      return;
    }
    if (hit.type === "insert-column") {
      this._commandService.executeCommand(SheetTableInsertColumnAtCommand.id, {
        unitId,
        subUnitId,
        tableId: hit.tableId,
        index: hit.index,
        count: 1
      });
      this._closeFloatingControls();
      return;
    }
    if (hit.type !== "menu-item") {
      return;
    }
    switch (hit.action) {
      case "rename":
        this._openRenameDialog(unitId, hit.tableId);
        break;
      case "update-range":
        this._openRangeSelector(unitId, subUnitId, hit.tableId);
        break;
      case "set-theme":
        this._openThemePanel(unitId, subUnitId, hit.tableId);
        break;
      case "delete":
        this._commandService.executeCommand(DeleteSheetTableCommand.id, {
          tableId: hit.tableId,
          subUnitId,
          unitId
        });
        break;
    }
    this._closeFloatingControls();
  }
  _openRenameDialog(unitId, tableId) {
    this._dialogService.open({
      id: SHEET_TABLE_RENAME_DIALOG_ID,
      title: { title: this._localeService.t("sheets-table-ui.rename") },
      draggable: true,
      destroyOnClose: true,
      mask: true,
      children: {
        label: {
          name: SHEET_TABLE_RENAME_DIALOG,
          props: {
            unitId,
            tableId,
            onClose: () => this._dialogService.close(SHEET_TABLE_RENAME_DIALOG_ID)
          }
        }
      },
      width: 360,
      onClose: () => this._dialogService.close(SHEET_TABLE_RENAME_DIALOG_ID)
    });
  }
  async _openRangeSelector(unitId, subUnitId, tableId) {
    const table = this._tableManager.getTableById(unitId, tableId);
    if (!table) {
      return;
    }
    const selection = await openRangeSelector(this._injector, unitId, subUnitId, table.getRange(), tableId);
    if (!selection) {
      return;
    }
    this._commandService.executeCommand(SetSheetTableCommand.id, {
      tableId,
      unitId,
      updateRange: {
        newRange: selection.range
      }
    });
  }
  _openThemePanel(unitId, subUnitId, tableId) {
    const table = this._tableManager.getTableById(unitId, tableId);
    if (!table) {
      return;
    }
    this._sidebarService.open({
      id: SHEET_TABLE_THEME_PANEL_ID,
      header: { title: this._localeService.t("sheets-table-ui.tableStyle") },
      children: {
        label: SHEET_TABLE_THEME_PANEL,
        oldConfig: table.getTableConfig(),
        unitId,
        subUnitId,
        tableId
      },
      width: 330
    });
  }
  _getInsertRegionFromPoint(x, y) {
    const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
    const worksheet = this._context.unit.getActiveSheet();
    if (!skeleton || !worksheet) {
      return null;
    }
    const unitId = this._context.unit.getUnitId();
    const subUnitId = worksheet.getSheetId();
    const tables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
    for (const table of tables) {
      const range = table.getRange();
      const tableBounds = this._getRangeBounds(skeleton, range);
      if (x < tableBounds.left || x > tableBounds.right || y < tableBounds.top || y > tableBounds.bottom) {
        continue;
      }
      const headerBounds = this._getRangeBounds(skeleton, {
        ...range,
        endRow: range.startRow
      });
      if (y > headerBounds.bottom) {
        for (let row = range.startRow + 1; row <= range.endRow; row++) {
          const cell = skeleton.getNoMergeCellWithCoordByIndex(row, range.startColumn);
          if (y >= cell.startY && y <= cell.endY) {
            return {
              type: "insert-row",
              tableId: table.getId(),
              index: row + 1,
              left: tableBounds.left - TABLE_CONTROL_INSERT_BUTTON_SIZE / 2,
              top: cell.endY - TABLE_CONTROL_INSERT_BUTTON_SIZE / 2,
              width: TABLE_CONTROL_INSERT_BUTTON_SIZE,
              height: TABLE_CONTROL_INSERT_BUTTON_SIZE
            };
          }
        }
      }
    }
    return null;
  }
  _getRangeBounds(skeleton, range) {
    const startCell = skeleton.getNoMergeCellWithCoordByIndex(range.startRow, range.startColumn);
    const endCell = skeleton.getNoMergeCellWithCoordByIndex(range.endRow, range.endColumn);
    return {
      left: startCell.startX,
      top: startCell.startY,
      right: endCell.endX,
      bottom: endCell.endY
    };
  }
  _syncTopTableGap(skeleton) {
    var _a;
    const worksheet = this._context.unit.getActiveSheet();
    if (!worksheet) {
      return;
    }
    const unitId = this._context.unit.getUnitId();
    const subUnitId = worksheet.getSheetId();
    const hasTopTable = this._tableManager.getTablesBySubunitId(unitId, subUnitId).some((table) => table.getRange().startRow === 0);
    const current = skeleton.gapConfig;
    const rowGaps = { ...current.rowGaps };
    const previousTopGap = rowGaps[TABLE_CONTROL_GAP_ROW] ? { ...rowGaps[TABLE_CONTROL_GAP_ROW] } : null;
    let shouldSync = false;
    if (hasTopTable) {
      if (!this._topGapBaseBySkeleton.has(skeleton)) {
        this._topGapBaseBySkeleton.set(
          skeleton,
          rowGaps[TABLE_CONTROL_GAP_ROW] ? { ...rowGaps[TABLE_CONTROL_GAP_ROW] } : null
        );
      }
      const baseGap = this._topGapBaseBySkeleton.get(skeleton);
      rowGaps[TABLE_CONTROL_GAP_ROW] = {
        ...baseGap != null ? baseGap : rowGaps[TABLE_CONTROL_GAP_ROW],
        size: ((_a = baseGap == null ? void 0 : baseGap.size) != null ? _a : 0) + TABLE_CONTROL_TOP_GAP_SIZE
      };
      shouldSync = true;
    } else if (this._topGapBaseBySkeleton.has(skeleton)) {
      const baseGap = this._topGapBaseBySkeleton.get(skeleton);
      if (baseGap) {
        rowGaps[TABLE_CONTROL_GAP_ROW] = { ...baseGap };
      } else {
        delete rowGaps[TABLE_CONTROL_GAP_ROW];
      }
      this._topGapBaseBySkeleton.delete(skeleton);
      shouldSync = true;
    }
    if (!shouldSync) {
      return;
    }
    const nextTopGap = rowGaps[TABLE_CONTROL_GAP_ROW] ? { ...rowGaps[TABLE_CONTROL_GAP_ROW] } : null;
    if (isSameTopGap(previousTopGap, nextTopGap)) {
      return;
    }
    skeleton.setGapConfig({ ...current, rowGaps });
    this._refreshSelections();
  }
  _refreshSelections() {
    this._selectionRenderService.resetSelectionsByModelData(this._sheetsSelectionsService.getCurrentSelections());
  }
  _closeFloatingControls() {
    this._shape.setOpenedMenuTableId(null);
    this._shape.setHoveredInsertRegion(null);
    this._shape.setHoveredRegion(null);
  }
  _getLocalPoint(evt) {
    const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
    if (skeleton) {
      return getTransformCoord(evt.offsetX, evt.offsetY, this._context.scene, skeleton);
    }
    return {
      x: evt.offsetX,
      y: evt.offsetY
    };
  }
};
SheetTableControlsRenderController = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, Inject(SheetSkeletonManagerService)),
  __decorateParam(3, ICommandService),
  __decorateParam(4, Inject(TableManager)),
  __decorateParam(5, Inject(SheetRangeThemeModel)),
  __decorateParam(6, Inject(WorkbookPermissionService)),
  __decorateParam(7, Inject(IPermissionService)),
  __decorateParam(8, Inject(SheetsSelectionsService)),
  __decorateParam(9, ISheetSelectionRenderService),
  __decorateParam(10, Inject(SheetTableThemeUIController)),
  __decorateParam(11, Inject(LocaleService)),
  __decorateParam(12, IDialogService),
  __decorateParam(13, ISidebarService)
], SheetTableControlsRenderController);

// ../packages/sheets-table-ui/src/views/widgets/table-filter-button.shape.ts
var FILTER_ICON_SIZE = 16;
var FILTER_ICON_PADDING = 1;
var FILTER_TRIGGER_HOVER_RADIUS = 4;
var SheetsTableFilterButtonShape = class extends Shape {
  constructor(key, props, _commandService) {
    super(key, props);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_cellWidth", 0);
    __publicField(this, "_cellHeight", 0);
    __publicField(this, "_filterParams");
    __publicField(this, "_iconColor", "#fff");
    __publicField(this, "_hoverBackground", "rgba(255, 255, 255, 0.92)");
    __publicField(this, "_hoverIconColor", "#202124");
    __publicField(this, "_hovered", false);
    this.setShapeProps(props);
    this.onPointerDown$.subscribeEvent((evt) => this.onPointerDown(evt));
    this.onPointerEnter$.subscribeEvent(() => this.onPointerEnter());
    this.onPointerLeave$.subscribeEvent(() => this.onPointerLeave());
  }
  setShapeProps(props) {
    if (typeof props.cellHeight !== "undefined") {
      this._cellHeight = props.cellHeight;
    }
    if (typeof props.cellWidth !== "undefined") {
      this._cellWidth = props.cellWidth;
    }
    if (typeof props.filterParams !== "undefined") {
      this._filterParams = props.filterParams;
    }
    if (typeof props.iconColor !== "undefined") {
      this._iconColor = props.iconColor;
    }
    if (typeof props.hoverBackground !== "undefined") {
      this._hoverBackground = props.hoverBackground;
    }
    if (typeof props.hoverIconColor !== "undefined") {
      this._hoverIconColor = props.hoverIconColor;
    }
    this.transformByState({
      width: props.width,
      height: props.height
    });
  }
  _draw(ctx) {
    var _a;
    const cellHeight = this._cellHeight;
    const cellWidth = this._cellWidth;
    const left = FILTER_ICON_SIZE - cellWidth;
    const top = FILTER_ICON_SIZE - cellHeight;
    ctx.save();
    const cellRegion = new Path2D();
    cellRegion.rect(left, top, cellWidth, cellHeight);
    ctx.clip(cellRegion);
    if (this._hovered) {
      ctx.save();
      ctx.fillStyle = this._hoverBackground;
      ctx.beginPath();
      (_a = ctx.roundRect) == null ? void 0 : _a.call(ctx, 0, 0, FILTER_ICON_SIZE, FILTER_ICON_SIZE, FILTER_TRIGGER_HOVER_RADIUS);
      if (!ctx.roundRect) {
        ctx.rect(0, 0, FILTER_ICON_SIZE, FILTER_ICON_SIZE);
      }
      ctx.fill();
      ctx.restore();
    }
    this._drawChevron(ctx, this._hovered ? this._hoverIconColor : this._iconColor);
    ctx.restore();
  }
  _drawChevron(ctx, color) {
    const centerX = FILTER_ICON_SIZE / 2;
    const centerY = FILTER_ICON_SIZE / 2;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(centerX - 4.5, centerY - 2.5);
    ctx.lineTo(centerX, centerY + 2);
    ctx.lineTo(centerX + 4.5, centerY - 2.5);
    ctx.stroke();
    ctx.restore();
  }
  onPointerDown(evt) {
    if (evt.button === 2) {
      return;
    }
    const { row, col, unitId, subUnitId, tableId } = this._filterParams;
    if (!this._commandService.hasCommand(OpenTableFilterPanelOperation.id)) {
      return;
    }
    setTimeout(() => {
      const cmdParams = {
        row,
        col,
        unitId,
        subUnitId,
        tableId
      };
      this._commandService.executeCommand(OpenTableFilterPanelOperation.id, cmdParams);
    }, 200);
  }
  onPointerEnter() {
    this._hovered = true;
    this.makeDirty(true);
  }
  onPointerLeave() {
    this._hovered = false;
    this.makeDirty(true);
  }
};
SheetsTableFilterButtonShape = __decorateClass([
  __decorateParam(2, ICommandService)
], SheetsTableFilterButtonShape);

// ../packages/sheets-table-ui/src/controllers/sheet-table-filter-button-render.controller.ts
var SHEETS_FILTER_BUTTON_Z_INDEX = 5e3;
var computeIconTop = (startY, endY, cellHeight, verticalAlign) => {
  switch (verticalAlign) {
    case 1 /* TOP */:
      return startY + FILTER_ICON_PADDING;
    case 2 /* MIDDLE */:
      return startY + Math.max(0, (cellHeight - FILTER_ICON_SIZE) / 2);
    case 3 /* BOTTOM */:
    default:
      return endY - FILTER_ICON_SIZE - FILTER_ICON_PADDING;
  }
};
var SheetsTableFilterButtonRenderController = class extends RxDisposable {
  constructor(_context, _injector, _sheetSkeletonManagerService, _sheetInterceptorService, _tableManager, _rangeThemeModel, _commandService) {
    super();
    __publicField(this, "_context", _context);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_sheetSkeletonManagerService", _sheetSkeletonManagerService);
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_tableManager", _tableManager);
    __publicField(this, "_rangeThemeModel", _rangeThemeModel);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_buttonRenderDisposable", null);
    __publicField(this, "_tableFilterButtonShapes", []);
    this._initRenderer();
    this._initCommandExecuted();
  }
  dispose() {
    super.dispose();
    this._disposeRendering();
  }
  _initRenderer() {
    const tableManager = this._tableManager;
    this._sheetSkeletonManagerService.currentSkeleton$.pipe(
      switchMap((skeletonParams) => {
        var _a;
        if (!skeletonParams) return of(null);
        const { unit: workbook, unitId } = this._context;
        const worksheetId = ((_a = workbook.getActiveSheet()) == null ? void 0 : _a.getSheetId()) || "";
        const getParams = () => ({
          unitId,
          worksheetId,
          tableFilterRanges: this._tableManager.getSheetFilterRangeWithState(workbook.getUnitId(), worksheetId),
          skeleton: skeletonParams.skeleton
        });
        return merge(
          tableManager.tableAdd$,
          tableManager.tableNameChanged$,
          tableManager.tableRangeChanged$,
          tableManager.tableThemeChanged$,
          tableManager.tableDelete$,
          tableManager.tableFilterChanged$
        ).pipe(
          map(() => getParams()),
          startWith(getParams())
        );
      }),
      takeUntil(this.dispose$)
    ).subscribe((renderParams) => {
      this._disposeRendering();
      if (!renderParams || !renderParams.tableFilterRanges) {
        return;
      }
      this._renderButtons(renderParams);
    });
  }
  _initCommandExecuted() {
    this.disposeWithMe(
      this._commandService.onCommandExecuted((command) => {
        var _a;
        if (command.id !== SetVerticalTextAlignCommand.id) {
          return;
        }
        const { unit: workbook, unitId } = this._context;
        const worksheetId = ((_a = workbook.getActiveSheet()) == null ? void 0 : _a.getSheetId()) || "";
        const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
        if (!skeleton) {
          return;
        }
        const renderParams = {
          unitId,
          worksheetId,
          tableFilterRanges: this._tableManager.getSheetFilterRangeWithState(workbook.getUnitId(), worksheetId),
          skeleton
        };
        this._disposeRendering();
        if (!renderParams || !renderParams.tableFilterRanges) {
          return;
        }
        this._renderButtons(renderParams);
      })
    );
  }
  _renderButtons(params) {
    var _a, _b, _c, _d, _e;
    const { tableFilterRanges, unitId, skeleton, worksheetId } = params;
    const { unit: workbook, scene } = this._context;
    const worksheet = workbook.getSheetBySheetId(worksheetId);
    if (!worksheet) {
      return;
    }
    for (const { range, states, tableId } of tableFilterRanges) {
      const { startRow, startColumn, endColumn } = range;
      const table = this._tableManager.getTableById(unitId, tableId);
      const headerStyle = table ? (_a = this._rangeThemeModel.getRangeThemeStyle(unitId, table.getTableStyleId())) == null ? void 0 : _a.getHeaderRowStyle() : null;
      const iconColor = (_c = (_b = headerStyle == null ? void 0 : headerStyle.cl) == null ? void 0 : _b.rgb) != null ? _c : "#fff";
      const hoverIconColor = (_e = (_d = headerStyle == null ? void 0 : headerStyle.bg) == null ? void 0 : _d.rgb) != null ? _e : "#202124";
      this._interceptCellContent(unitId, worksheetId, range);
      for (let col = startColumn; col <= endColumn; col++) {
        const key = `sheets-table-filter-button-${startRow}-${col}`;
        const startPosition = getCoordByCell(startRow, col, scene, skeleton);
        const cellStyle = worksheet.getCellStyle(startRow, col);
        const verticalAlign = (cellStyle == null ? void 0 : cellStyle.vt) || 3 /* BOTTOM */;
        const { startX, startY, endX, endY } = startPosition;
        const cellWidth = endX - startX;
        const cellHeight = endY - startY;
        if (cellHeight <= FILTER_ICON_PADDING || cellWidth <= FILTER_ICON_PADDING) {
          continue;
        }
        const state = states[col - startColumn];
        const iconStartX = endX - FILTER_ICON_SIZE - FILTER_ICON_PADDING;
        const iconStartY = computeIconTop(startY, endY, cellHeight, verticalAlign);
        const props = {
          left: iconStartX,
          top: iconStartY,
          height: FILTER_ICON_SIZE,
          width: FILTER_ICON_SIZE,
          zIndex: SHEETS_FILTER_BUTTON_Z_INDEX,
          iconColor,
          hoverBackground: iconColor,
          hoverIconColor,
          cellHeight,
          cellWidth,
          filterParams: { unitId, subUnitId: worksheetId, row: startRow, col, buttonState: state, tableId }
        };
        const buttonShape = this._injector.createInstance(SheetsTableFilterButtonShape, key, props);
        this._tableFilterButtonShapes.push(buttonShape);
      }
    }
    scene.addObjects(this._tableFilterButtonShapes);
    scene.makeDirty();
  }
  _interceptCellContent(workbookId, worksheetId, range) {
    const { startRow, startColumn, endColumn } = range;
    this._buttonRenderDisposable = this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
      effect: 1 /* Style */,
      handler: (cell, pos, next) => {
        const { row, col, unitId, subUnitId } = pos;
        if (unitId !== workbookId || subUnitId !== worksheetId || row !== startRow || col < startColumn || col > endColumn) {
          return next(cell);
        }
        if (!cell || cell === pos.rawData) {
          cell = { ...pos.rawData };
        }
        cell.fontRenderExtension = {
          ...cell == null ? void 0 : cell.fontRenderExtension,
          rightOffset: FILTER_ICON_SIZE + FILTER_ICON_PADDING + 2
        };
        return next(cell);
      },
      priority: 10
    });
  }
  _disposeRendering() {
    var _a;
    this._tableFilterButtonShapes.forEach((s) => s.dispose());
    (_a = this._buttonRenderDisposable) == null ? void 0 : _a.dispose();
    this._buttonRenderDisposable = null;
    this._tableFilterButtonShapes = [];
  }
};
SheetsTableFilterButtonRenderController = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, Inject(SheetSkeletonManagerService)),
  __decorateParam(3, Inject(SheetInterceptorService)),
  __decorateParam(4, Inject(TableManager)),
  __decorateParam(5, Inject(SheetRangeThemeModel)),
  __decorateParam(6, ICommandService)
], SheetsTableFilterButtonRenderController);

// ../packages/sheets-table-ui/src/controllers/sheet-table-render.controller.ts
var SheetsTableRenderController = class extends RxDisposable {
  constructor(_context, _injector, _sheetSkeletonManagerService, _tableManager, _sheetTableThemeUIController) {
    super();
    __publicField(this, "_context", _context);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_sheetSkeletonManagerService", _sheetSkeletonManagerService);
    __publicField(this, "_tableManager", _tableManager);
    __publicField(this, "_sheetTableThemeUIController", _sheetTableThemeUIController);
    this._initListener();
  }
  _dirtySkeleton() {
    var _a;
    (_a = this._context.mainComponent) == null ? void 0 : _a.makeDirty();
    const currentParam = this._sheetSkeletonManagerService.getCurrentParam();
    if (currentParam) {
      const param = { ...currentParam, dirty: true };
      this._sheetSkeletonManagerService.reCalculate(param);
    }
  }
  _initListener() {
    const tableManager = this._tableManager;
    const dirtySkeleton = this._dirtySkeleton.bind(this);
    this.disposeWithMe(
      merge(
        tableManager.tableAdd$,
        tableManager.tableDelete$,
        tableManager.tableNameChanged$,
        tableManager.tableRangeChanged$,
        tableManager.tableThemeChanged$,
        tableManager.tableFilterChanged$,
        tableManager.tableInitStatus$,
        this._sheetTableThemeUIController.refreshTable$
      ).subscribe(
        dirtySkeleton
      )
    );
  }
};
SheetsTableRenderController = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, Inject(SheetSkeletonManagerService)),
  __decorateParam(3, Inject(TableManager)),
  __decorateParam(4, Inject(SheetTableThemeUIController))
], SheetsTableRenderController);

// ../packages/sheets-table-ui/src/controllers/sheet-table-selection.controller.ts
var SheetTableSelectionController = class extends Disposable {
  constructor(_sheetInterceptorService, _univerInstanceService, _tableManager) {
    super();
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_tableManager", _tableManager);
    this._initSelectionChange();
  }
  _initSelectionChange() {
    this.disposeWithMe(
      this._sheetInterceptorService.interceptCommand({
        getMutations: (command) => {
          if (command.id === SelectAllCommand.id) {
            const target = getSheetCommandTarget(this._univerInstanceService);
            if (!target) {
              return { redos: [], undos: [] };
            }
            const params = command.params;
            const { range } = params;
            const { unitId, subUnitId, worksheet } = target;
            const subTables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
            const overlapTable = subTables.find((table) => {
              const tableRange = table.getRange();
              return Rectangle.contains(tableRange, range);
            });
            if (overlapTable) {
              const tableRange = overlapTable.getRange();
              const tableRangeWithoutHeader = {
                ...tableRange,
                startRow: tableRange.startRow + 1
              };
              if (Rectangle.equals(tableRange, range)) {
                return { undos: [], redos: [] };
              } else if (Rectangle.equals(tableRangeWithoutHeader, range)) {
                return {
                  undos: [],
                  redos: [
                    {
                      id: SetSelectionsOperation.id,
                      params: {
                        unitId,
                        subUnitId,
                        selections: [
                          {
                            range: tableRange,
                            primary: getPrimaryForRange(tableRange, worksheet)
                          }
                        ]
                      }
                    }
                  ]
                };
              } else {
                return {
                  undos: [],
                  redos: [
                    {
                      id: SetSelectionsOperation.id,
                      params: {
                        unitId,
                        subUnitId,
                        selections: [
                          {
                            range: tableRangeWithoutHeader,
                            primary: getPrimaryForRange(tableRangeWithoutHeader, worksheet)
                          }
                        ]
                      }
                    }
                  ]
                };
              }
            }
          }
          return { redos: [], undos: [] };
        }
      })
    );
  }
};
SheetTableSelectionController = __decorateClass([
  __decorateParam(0, Inject(SheetInterceptorService)),
  __decorateParam(1, Inject(IUniverInstanceService)),
  __decorateParam(2, Inject(TableManager))
], SheetTableSelectionController);

// ../packages/sheets-table-ui/src/views/components/SheetTableSelector.tsx
var import_react6 = __toESM(require_react());
var import_jsx_runtime6 = __toESM(require_jsx_runtime());
var SheetTableSelector = (props) => {
  const { unitId, subUnitId, range, onCancel, onConfirm, tableId } = props;
  const tableManager = useDependency(TableManager);
  const [selectedRange, setSelectedRange] = (0, import_react6.useState)(range);
  const [rangeError, setRangeError] = (0, import_react6.useState)("");
  const localeService = useDependency(LocaleService);
  const univerInstanceService = useDependency(IUniverInstanceService);
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      RangeSelector,
      {
        maxRangeCount: 1,
        unitId,
        subUnitId,
        initialValue: serializeRange(range),
        onChange: (_, text) => {
          const originValue = serializeRange(range);
          const newRange = deserializeRangeWithSheet(text).range;
          const target = getSheetCommandTarget(univerInstanceService, { unitId, subUnitId });
          if (!target) {
            return;
          }
          const worksheet = target.worksheet;
          const merges = worksheet.getMergeData();
          const hasOverlapWithMerge = merges.some((merge2) => {
            return Rectangle.intersects(newRange, merge2);
          });
          if (hasOverlapWithMerge) {
            setRangeError(localeService.t("sheets-table-ui.tableRangeWithMergeError"));
            return;
          }
          const hasOverlapWithOtherTable = tableManager.getTablesBySubunitId(unitId, subUnitId).some((table) => {
            if (table.getId() === tableId) {
              return false;
            }
            const tableRange = table.getRange();
            return Rectangle.intersects(newRange, tableRange);
          });
          if (hasOverlapWithOtherTable) {
            setRangeError(localeService.t("sheets-table-ui.tableRangeWithOtherTableError"));
            return;
          }
          const { startRow, endRow } = newRange;
          const isSingleRow = startRow === endRow;
          if (isSingleRow) {
            setRangeError(localeService.t("sheets-table-ui.tableRangeSingleRowError"));
            return;
          }
          if (originValue === text) {
            return;
          }
          if (tableId) {
            const table = tableManager.getTableById(unitId, tableId);
            if (table) {
              const oldRange = table.getRange();
              if (Rectangle.intersects(newRange, oldRange) && oldRange.startRow === newRange.startRow) {
                setSelectedRange(newRange);
                setRangeError("");
                onConfirm({
                  unitId,
                  subUnitId,
                  range: newRange
                });
                return;
              } else {
                setRangeError(localeService.t("sheets-table-ui.updateError"));
                return;
              }
            }
          }
          setSelectedRange(newRange);
          setRangeError("");
        },
        supportAcrossSheet: false
      }
    ),
    rangeError && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "univer-mt-1 univer-text-xs univer-text-red-500", children: rangeError }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "univer-mt-4 univer-flex univer-justify-end", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Button, { onClick: onCancel, children: localeService.t("sheets-table-ui.cancel") }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        Button,
        {
          variant: "primary",
          onClick: () => {
            if (rangeError) {
              return;
            }
            onConfirm({
              unitId,
              subUnitId,
              range: selectedRange
            });
          },
          className: "univer-ml-2",
          children: localeService.t("sheets-table-ui.confirm")
        }
      )
    ] })
  ] });
};

// ../packages/sheets-table-ui/src/views/components/SheetTableThemePanel.tsx
var import_react7 = __toESM(require_react());
var import_jsx_runtime7 = __toESM(require_jsx_runtime());
var SheetTableThemePanel = (props) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
  const { unitId, subUnitId, tableId } = props;
  const commandService = useDependency(ICommandService);
  const localeService = useDependency(LocaleService);
  const tableManager = useDependency(TableManager);
  const table = tableManager.getTableById(unitId, tableId);
  const rangeThemeModel = useDependency(SheetRangeThemeModel);
  const sheetTableThemeUIController = useDependency(SheetTableThemeUIController);
  const rangeThemeMapChanged = useObservable(rangeThemeModel.rangeThemeMapChange$);
  const tableRefresh = useObservable(sheetTableThemeUIController.refreshTable$);
  const errorService = useDependency(ErrorService);
  const [, setRefresh] = (0, import_react7.useState)(Math.random());
  const themeConfig = useObservable(tableManager.tableThemeChanged$, {
    theme: table == null ? void 0 : table.getTableStyleId(),
    oldTheme: table == null ? void 0 : table.getTableStyleId(),
    unitId,
    subUnitId,
    tableId
  });
  const defaultRangeThemes = rangeThemeModel.getRegisteredRangeThemes().filter((item) => item == null ? void 0 : item.startsWith(TABLE_DEFAULT_NAME_PREFIX));
  const customRangeThemes = rangeThemeModel.getALLRegisteredTheme(unitId).filter((item) => item == null ? void 0 : item.startsWith(TABLE_CUSTOM_NAME_PREFIX));
  const selectedTheme = table == null ? void 0 : table.getTableStyleId();
  const customSelected = customRangeThemes.find((item) => item === selectedTheme);
  const customStyleName = customSelected || customRangeThemes[0];
  const customStyle = rangeThemeModel.getCustomRangeThemeStyle(unitId, customStyleName);
  const headerBg = (_c = (_b = (_a = customStyle == null ? void 0 : customStyle.getHeaderRowStyle()) == null ? void 0 : _a.bg) == null ? void 0 : _b.rgb) != null ? _c : TABLE_DEFAULT_BG_COLOR;
  const firstRowBg = (_f = (_e = (_d = customStyle == null ? void 0 : customStyle.getFirstRowStyle()) == null ? void 0 : _d.bg) == null ? void 0 : _e.rgb) != null ? _f : TABLE_DEFAULT_BG_COLOR;
  const secondRowBg = (_i = (_h = (_g = customStyle == null ? void 0 : customStyle.getSecondRowStyle()) == null ? void 0 : _g.bg) == null ? void 0 : _h.rgb) != null ? _i : TABLE_DEFAULT_BG_COLOR;
  const lastRowBg = (_l = (_k = (_j = customStyle == null ? void 0 : customStyle.getLastRowStyle()) == null ? void 0 : _j.bg) == null ? void 0 : _k.rgb) != null ? _l : TABLE_DEFAULT_BG_COLOR;
  const [hoverCustomId, setHoverCustomId] = (0, import_react7.useState)(null);
  const handleThemeChange = (theme) => {
    commandService.executeCommand(SetSheetTableCommand.id, {
      unitId,
      tableId,
      theme
    });
  };
  const handleAddCustomTheme = () => {
    if (customRangeThemes.length >= 11) {
      errorService.emit(localeService.t("sheets-table-ui.customTooMore"));
      return;
    }
    const lastCustomTheme = customRangeThemes[customRangeThemes.length - 1];
    let newThemeName = `${TABLE_CUSTOM_NAME_PREFIX}1`;
    if (lastCustomTheme) {
      const index = Number(lastCustomTheme.split("-")[2]);
      newThemeName = `${TABLE_CUSTOM_NAME_PREFIX}${index + 1}`;
    }
    const newTheme = new RangeThemeStyle(newThemeName, { ...customEmptyThemeWithBorderStyle });
    commandService.executeCommand(AddTableThemeCommand.id, {
      unitId,
      tableId,
      themeStyle: newTheme
    });
  };
  const setCustomTheme = (themeName, tableThemeStyle) => {
    commandService.executeCommand(SetRangeThemeMutation.id, {
      unitId,
      subUnitId,
      styleName: themeName,
      style: tableThemeStyle
    });
  };
  const removeCustomTheme = (themeName) => {
    commandService.executeCommand(RemoveTableThemeCommand.id, {
      unitId,
      tableId,
      themeName
    });
  };
  (0, import_react7.useEffect)(() => {
    setRefresh(Math.random());
  }, [rangeThemeMapChanged, tableRefresh]);
  if (!table) return null;
  const headerBgIsDark = new ColorKit(headerBg).isDark();
  const firstRowBgIsDark = new ColorKit(firstRowBg).isDark();
  const secondRowBgIsDark = new ColorKit(secondRowBg).isDark();
  const lastRowBgIsDark = new ColorKit(lastRowBg).isDark();
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h5", { children: localeService.t("sheets-table-ui.defaultStyle") }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "univer-flex univer-gap-2", children: defaultRangeThemes.map((item) => {
      var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2;
      const rangeThemeItem = rangeThemeModel.getDefaultRangeThemeStyle(item);
      const headerRowBg = ((_b2 = (_a2 = rangeThemeItem == null ? void 0 : rangeThemeItem.getHeaderRowStyle()) == null ? void 0 : _a2.bg) == null ? void 0 : _b2.rgb) || TABLE_DEFAULT_BG_COLOR;
      const firstRowBg2 = ((_d2 = (_c2 = rangeThemeItem == null ? void 0 : rangeThemeItem.getFirstRowStyle()) == null ? void 0 : _c2.bg) == null ? void 0 : _d2.rgb) || TABLE_DEFAULT_BG_COLOR;
      const secondRowBg2 = ((_f2 = (_e2 = rangeThemeItem == null ? void 0 : rangeThemeItem.getSecondRowStyle()) == null ? void 0 : _e2.bg) == null ? void 0 : _f2.rgb) || TABLE_DEFAULT_BG_COLOR;
      const lastRowBg2 = ((_h2 = (_g2 = rangeThemeItem == null ? void 0 : rangeThemeItem.getLastRowStyle()) == null ? void 0 : _g2.bg) == null ? void 0 : _h2.rgb) || TABLE_DEFAULT_BG_COLOR;
      return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
        "div",
        {
          className: clsx(`univer-h-10 univer-w-8 univer-cursor-pointer univer-border univer-border-solid univer-border-gray-200 univer-p-px [&>div]:univer-box-border [&>div]:univer-h-2.5`, {
            "univer-border-blue-500": item === themeConfig.theme
          }),
          onClick: () => handleThemeChange(item),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: { background: headerRowBg, border: `${headerRowBg ? TABLE_BORDER_NONE : TABLE_BORDER_DEFAULT}` } }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: { background: firstRowBg2, border: `${firstRowBg2 ? TABLE_BORDER_NONE : TABLE_BORDER_DEFAULT}` } }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: { background: secondRowBg2, border: `${secondRowBg2 ? TABLE_BORDER_NONE : TABLE_BORDER_DEFAULT}` } }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: { background: lastRowBg2, border: `${lastRowBg2 ? TABLE_BORDER_NONE : TABLE_BORDER_DEFAULT}` } })
          ]
        },
        item
      );
    }) }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h5", { children: localeService.t("sheets-table-ui.customStyle") }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: clsx("univer-w-full univer-rounded-sm", borderClassName), children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "univer-flex univer-flex-wrap univer-gap-2 univer-p-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "div",
          {
            className: clsx(`univer-h-10 univer-w-8 univer-cursor-pointer univer-p-px univer-text-center univer-leading-10`, borderClassName),
            onClick: handleAddCustomTheme,
            children: "+"
          }
        ),
        customRangeThemes.map((item) => {
          var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2;
          const rangeThemeItem = rangeThemeModel.getCustomRangeThemeStyle(unitId, item);
          const headerRowBg = (_b2 = (_a2 = rangeThemeItem == null ? void 0 : rangeThemeItem.getHeaderRowStyle()) == null ? void 0 : _a2.bg) == null ? void 0 : _b2.rgb;
          const firstRowBg2 = (_d2 = (_c2 = rangeThemeItem == null ? void 0 : rangeThemeItem.getFirstRowStyle()) == null ? void 0 : _c2.bg) == null ? void 0 : _d2.rgb;
          const secondRowBg2 = (_f2 = (_e2 = rangeThemeItem == null ? void 0 : rangeThemeItem.getSecondRowStyle()) == null ? void 0 : _e2.bg) == null ? void 0 : _f2.rgb;
          const lastRowBg2 = (_h2 = (_g2 = rangeThemeItem == null ? void 0 : rangeThemeItem.getLastRowStyle()) == null ? void 0 : _g2.bg) == null ? void 0 : _h2.rgb;
          return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
            "div",
            {
              className: clsx(`univer-relative univer-h-10 univer-w-8 univer-cursor-pointer univer-border univer-border-solid univer-border-gray-200 univer-p-px`, {
                "univer-border-blue-500": item === themeConfig.theme
              }),
              onClick: () => handleThemeChange(item),
              onMouseEnter: () => setHoverCustomId(item),
              onMouseLeave: () => setHoverCustomId(null),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "univer-box-border univer-h-2.5", style: { background: headerRowBg != null ? headerRowBg : TABLE_BORDER_NONE, border: `${headerRowBg ? TABLE_BORDER_NONE : TABLE_BORDER_DEFAULT}` } }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "univer-box-border univer-h-2.5", style: { background: firstRowBg2 != null ? firstRowBg2 : TABLE_BORDER_NONE, border: `${firstRowBg2 ? TABLE_BORDER_NONE : TABLE_BORDER_DEFAULT}` } }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "univer-box-border univer-h-2.5", style: { background: secondRowBg2 != null ? secondRowBg2 : TABLE_BORDER_NONE, border: `${secondRowBg2 ? TABLE_BORDER_NONE : TABLE_BORDER_DEFAULT}` } }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "univer-box-border univer-h-2.5", style: { background: lastRowBg2 != null ? lastRowBg2 : TABLE_BORDER_NONE, border: `${lastRowBg2 ? TABLE_BORDER_NONE : TABLE_BORDER_DEFAULT}` } }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "div",
                  {
                    className: `univer-absolute univer-right-[-3px] univer-top-[-3px] univer-size-3 univer-rounded-md univer-bg-gray-200 univer-text-center univer-text-xs univer-leading-[10px]`,
                    style: { display: hoverCustomId === item ? "block" : "none" },
                    onClick: (e) => {
                      e.stopPropagation();
                      removeCustomTheme(item);
                    },
                    children: "x"
                  }
                )
              ]
            },
            item
          );
        })
      ] }),
      customSelected && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "univer-h-px univer-w-full univer-bg-gray-200" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "univer-flex univer-flex-col univer-gap-2 univer-p-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "univer-flex univer-h-9 univer-gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              "div",
              {
                className: clsx(`univer-box-border univer-h-full univer-w-52 univer-rounded-sm univer-text-center univer-leading-9`, borderClassName, {
                  "univer-text-white": headerBgIsDark,
                  "univer-text-gray-900": !headerBgIsDark
                }),
                style: {
                  background: headerBg
                },
                children: localeService.t("sheets-table-ui.header")
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              Dropdown,
              {
                overlay: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "univer-p-2", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  ColorPicker,
                  {
                    value: headerBg,
                    onChange: (val) => {
                      const headerRowStyle = processStyleWithBorderStyle("headerRowStyle", {
                        bg: {
                          rgb: val
                        },
                        cl: {
                          rgb: new ColorKit(val).isDark() ? "#fff" : "#000"
                        }
                      });
                      setCustomTheme(table.getTableStyleId(), { headerRowStyle });
                    }
                  }
                ) }),
                children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
                  "div",
                  {
                    className: clsx(`univer-flex univer-cursor-pointer univer-items-center univer-gap-2 univer-rounded-sm univer-bg-white univer-p-1`, borderClassName),
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                        "div",
                        {
                          className: clsx("univer-size-4 univer-rounded-lg univer-bg-gray-400", borderClassName, {
                            "univer-text-white": headerBgIsDark,
                            "univer-text-gray-900": !headerBgIsDark
                          }),
                          style: {
                            background: headerBg
                          }
                        }
                      ),
                      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(DropdownIcon, { className: "univer-size-2" })
                    ]
                  }
                )
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "univer-flex univer-h-9 univer-gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              "div",
              {
                className: clsx(`univer-box-border univer-h-full univer-w-52 univer-rounded-sm univer-text-center univer-leading-9`, borderClassName, {
                  "univer-text-white": firstRowBgIsDark,
                  "univer-text-gray-900": !firstRowBgIsDark
                }),
                style: {
                  background: firstRowBg
                },
                children: localeService.t("sheets-table-ui.firstLine")
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              Dropdown,
              {
                overlay: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "univer-p-2", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  ColorPicker,
                  {
                    value: firstRowBg,
                    onChange: (val) => {
                      setCustomTheme(table.getTableStyleId(), {
                        firstRowStyle: {
                          bg: {
                            rgb: val
                          },
                          cl: {
                            rgb: new ColorKit(val).isDark() ? "#fff" : "#000"
                          }
                        }
                      });
                    }
                  }
                ) }),
                children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
                  "div",
                  {
                    className: clsx(`univer-flex univer-cursor-pointer univer-items-center univer-gap-2 univer-rounded-sm univer-bg-white univer-p-1`, borderClassName),
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                        "div",
                        {
                          className: clsx("univer-size-4 univer-rounded-lg univer-bg-gray-400", borderClassName),
                          style: { background: firstRowBg }
                        }
                      ),
                      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(DropdownIcon, { className: "univer-size-2" })
                    ]
                  }
                )
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "univer-flex univer-h-9 univer-gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              "div",
              {
                className: clsx(`univer-box-border univer-h-full univer-w-52 univer-rounded-sm univer-text-center univer-leading-9`, borderClassName, {
                  "univer-text-white": secondRowBgIsDark,
                  "univer-text-gray-900": !secondRowBgIsDark
                }),
                style: {
                  background: secondRowBg
                },
                children: localeService.t("sheets-table-ui.secondLine")
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              Dropdown,
              {
                overlay: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "univer-p-2", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  ColorPicker,
                  {
                    value: secondRowBg,
                    onChange: (val) => setCustomTheme(table.getTableStyleId(), {
                      secondRowStyle: {
                        bg: {
                          rgb: val
                        },
                        cl: {
                          rgb: new ColorKit(val).isDark() ? "#fff" : "#000"
                        }
                      }
                    })
                  }
                ) }),
                children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
                  "div",
                  {
                    className: clsx(`univer-flex univer-cursor-pointer univer-items-center univer-gap-2 univer-rounded-sm univer-bg-white univer-p-1`, borderClassName),
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                        "div",
                        {
                          className: clsx("univer-size-4 univer-rounded-lg univer-bg-gray-400", borderClassName),
                          style: { background: secondRowBg }
                        }
                      ),
                      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(DropdownIcon, { className: "univer-size-2" })
                    ]
                  }
                )
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "univer-flex univer-h-9 univer-gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              "div",
              {
                className: clsx(`univer-box-border univer-h-full univer-w-52 univer-rounded-sm univer-text-center univer-leading-9`, borderClassName, {
                  "univer-text-white": lastRowBgIsDark,
                  "univer-text-gray-900": !lastRowBgIsDark
                }),
                style: {
                  background: lastRowBg
                },
                children: localeService.t("sheets-table-ui.footer")
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              Dropdown,
              {
                overlay: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "univer-p-2", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  ColorPicker,
                  {
                    value: lastRowBg,
                    onChange: (val) => {
                      const lastRowStyle = processStyleWithBorderStyle("lastRowStyle", {
                        bg: {
                          rgb: val
                        },
                        cl: {
                          rgb: new ColorKit(val).isDark() ? "#fff" : "#000"
                        }
                      });
                      setCustomTheme(table.getTableStyleId(), { lastRowStyle });
                    }
                  }
                ) }),
                children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
                  "div",
                  {
                    className: clsx(`univer-flex univer-cursor-pointer univer-items-center univer-gap-2 univer-rounded-sm univer-bg-white univer-p-1`, borderClassName),
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                        "div",
                        {
                          className: clsx("univer-size-4 univer-rounded-lg univer-bg-gray-400", borderClassName),
                          style: { background: lastRowBg }
                        }
                      ),
                      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(DropdownIcon, { className: "univer-size-2" })
                    ]
                  }
                )
              }
            )
          ] })
        ] })
      ] })
    ] })
  ] });
};

// ../packages/sheets-table-ui/src/menu/menu.ts
var SHEET_TABLE_CONTEXT_INSERT_MENU_ID = "sheet.table.context-insert_menu-id";
var SHEET_TABLE_CONTEXT_REMOVE_MENU_ID = "sheet.table.context-remove_menu-id";
function sheetTableToolbarInsertMenuFactory(accessor) {
  return {
    id: OpenTableSelectorOperation.id,
    type: 0 /* BUTTON */,
    icon: TABLE_TOOLBAR_BUTTON,
    tooltip: "sheets-table-ui.title",
    title: "sheets-table-ui.title",
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */),
    disabled$: getCurrentRangeDisable$(accessor, {}, true)
  };
}
function SheetTableInsertContextMenuFactory(accessor) {
  return {
    id: SHEET_TABLE_CONTEXT_INSERT_MENU_ID,
    type: 3 /* SUBITEMS */,
    icon: "InsertDoubleIcon",
    title: "sheets-table-ui.insert.main",
    hidden$: getSheetTableRowColOperationHidden$(accessor)
  };
}
function SheetTableRemoveContextMenuFactory(accessor) {
  return {
    id: SHEET_TABLE_CONTEXT_REMOVE_MENU_ID,
    type: 3 /* SUBITEMS */,
    icon: "ReduceDoubleIcon",
    title: "sheets-table-ui.remove.main",
    hidden$: getSheetTableRowColOperationHidden$(accessor)
  };
}
function SheetTableInsertRowMenuFactory(accessor) {
  return {
    id: SheetTableInsertRowCommand.id,
    type: 0 /* BUTTON */,
    title: "sheets-table-ui.insert.row",
    hidden$: getSheetTableHeaderOperationHidden$(accessor)
  };
}
function SheetTableInsertColMenuFactory(accessor) {
  return {
    id: SheetTableInsertColCommand.id,
    title: "sheets-table-ui.insert.col",
    type: 0 /* BUTTON */
  };
}
function SheetTableRemoveRowMenuFactory(accessor) {
  return {
    id: SheetTableRemoveRowCommand.id,
    type: 0 /* BUTTON */,
    title: "sheets-table-ui.remove.row",
    hidden$: getSheetTableHeaderOperationHidden$(accessor)
  };
}
function SheetTableRemoveColMenuFactory(accessor) {
  return {
    id: SheetTableRemoveColCommand.id,
    title: "sheets-table-ui.remove.col",
    type: 0 /* BUTTON */
  };
}
function getSheetTableRowColOperationHidden$(accessor) {
  const sheetsSelectionsService = accessor.get(SheetsSelectionsService);
  const univerInstanceService = accessor.get(IUniverInstanceService);
  const workbook$ = univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */);
  return workbook$.pipe(
    switchMap((workbook) => {
      if (!workbook) return of(true);
      return workbook.activeSheet$.pipe(
        switchMap((sheet) => {
          if (!sheet) return of(true);
          return sheetsSelectionsService.selectionMoveEnd$.pipe(
            switchMap((selections) => {
              if (!selections.length || selections.length > 1) return of(true);
              const selection = selections[0];
              const range = selection.range;
              const sheetsTableController = accessor.get(SheetsTableController);
              const isInTable = sheetsTableController.getContainerTableWithRange(workbook.getUnitId(), sheet.getSheetId(), range);
              return of(!isInTable);
            })
          );
        })
      );
    })
  );
}
function getSheetTableHeaderOperationHidden$(accessor) {
  const sheetsSelectionsService = accessor.get(SheetsSelectionsService);
  const univerInstanceService = accessor.get(IUniverInstanceService);
  const workbook$ = univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */);
  return workbook$.pipe(
    switchMap((workbook) => {
      if (!workbook) return of(true);
      return workbook.activeSheet$.pipe(
        switchMap((sheet) => {
          if (!sheet) return of(true);
          return sheetsSelectionsService.selectionMoveEnd$.pipe(
            switchMap((selections) => {
              if (!selections.length || selections.length > 1) return of(true);
              const selection = selections[0];
              const range = selection.range;
              const sheetsTableController = accessor.get(SheetsTableController);
              const isInTable = sheetsTableController.getContainerTableWithRange(workbook.getUnitId(), sheet.getSheetId(), range);
              if (!isInTable) {
                return of(true);
              }
              const tableRange = isInTable.getRange();
              if (range.startRow === tableRange.startRow) {
                return of(true);
              }
              return of(false);
            })
          );
        })
      );
    })
  );
}

// ../packages/sheets-table-ui/src/menu/schema.ts
var menuSchema2 = {
  ["ribbon.data.organization" /* ORGANIZATION */]: {
    [OpenTableSelectorOperation.id]: {
      order: 0,
      menuItemFactory: sheetTableToolbarInsertMenuFactory
    }
  },
  ["contextMenu.mainArea" /* MAIN_AREA */]: {
    ["contextMenu.layout" /* LAYOUT */]: {
      [SHEET_TABLE_CONTEXT_INSERT_MENU_ID]: {
        order: 5,
        menuItemFactory: SheetTableInsertContextMenuFactory,
        [SheetTableInsertRowCommand.id]: {
          order: 1,
          menuItemFactory: SheetTableInsertRowMenuFactory
        },
        [SheetTableInsertColCommand.id]: {
          order: 2,
          menuItemFactory: SheetTableInsertColMenuFactory
        }
      },
      [SHEET_TABLE_CONTEXT_REMOVE_MENU_ID]: {
        order: 6,
        menuItemFactory: SheetTableRemoveContextMenuFactory,
        [SheetTableRemoveRowCommand.id]: {
          order: 1,
          menuItemFactory: SheetTableRemoveRowMenuFactory
        },
        [SheetTableRemoveColCommand.id]: {
          order: 2,
          menuItemFactory: SheetTableRemoveColMenuFactory
        }
      }
    }
  }
};

// ../packages/sheets-table-ui/src/menu/sheet-table-menu.controller.ts
var SheetTableMenuController = class extends Disposable {
  constructor(_componentManager, _menuManagerService) {
    super();
    __publicField(this, "_componentManager", _componentManager);
    __publicField(this, "_menuManagerService", _menuManagerService);
    this._initComponents();
    this._initMenu();
  }
  _initComponents() {
    [
      [TABLE_TOOLBAR_BUTTON, TableIcon],
      [TABLE_SELECTOR_DIALOG, SheetTableSelector],
      [SHEET_TABLE_THEME_PANEL, SheetTableThemePanel]
    ].forEach(([key, comp]) => {
      this.disposeWithMe(this._componentManager.register(key, comp));
    });
  }
  _initMenu() {
    this._menuManagerService.mergeMenu(menuSchema2);
  }
};
SheetTableMenuController = __decorateClass([
  __decorateParam(0, Inject(ComponentManager)),
  __decorateParam(1, Inject(IMenuManagerService))
], SheetTableMenuController);

// ../packages/sheets-table-ui/src/plugin.ts
var UniverSheetsTableUIPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig2, _injector, _commandService, _configService, _renderManagerService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_configService", _configService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    const { menu, ...rest } = merge_default(
      {},
      defaultPluginConfig2,
      this._config
    );
    if (menu) {
      this._configService.setConfig("menu", menu, { merge: true });
    }
    this._configService.setConfig(SHEETS_TABLE_UI_PLUGIN_CONFIG_KEY, rest);
    this._initRegisterCommand();
  }
  onStarting() {
    registerDependencies(this._injector, [
      [SheetsTableComponentController],
      [SheetsTableUiService],
      [SheetTableMenuController],
      [SheetTableThemeUIController],
      [SheetTableSelectionController]
    ]);
  }
  onReady() {
    touchDependencies(this._injector, [
      [SheetsTableComponentController],
      [SheetsTableUiService],
      [SheetTableMenuController],
      [SheetTableThemeUIController],
      [SheetTableSelectionController]
    ]);
  }
  onRendered() {
    this._registerRenderModules();
  }
  _registerRenderModules() {
    const renderDependencies = [];
    if (this._config.hideAnchor !== true) {
      renderDependencies.push([SheetTableControlsRenderController]);
    }
    renderDependencies.push(
      [SheetsTableFilterButtonRenderController],
      [SheetsTableRenderController]
    );
    renderDependencies.forEach((m) => {
      this.disposeWithMe(this._renderManagerService.registerRenderModule(2 /* UNIVER_SHEET */, m));
    });
  }
  _initRegisterCommand() {
    [
      OpenTableFilterPanelOperation,
      OpenTableSelectorOperation
    ].forEach((m) => this._commandService.registerCommand(m));
  }
};
__publicField(UniverSheetsTableUIPlugin, "pluginName", PLUGIN_NAME);
__publicField(UniverSheetsTableUIPlugin, "packageName", package_default2.name);
__publicField(UniverSheetsTableUIPlugin, "version", package_default2.version);
__publicField(UniverSheetsTableUIPlugin, "type", 2 /* UNIVER_SHEET */);
UniverSheetsTableUIPlugin = __decorateClass([
  DependentOn(UniverSheetsTablePlugin),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, Inject(ICommandService)),
  __decorateParam(3, IConfigService),
  __decorateParam(4, IRenderManagerService)
], UniverSheetsTableUIPlugin);

export {
  UniverSheetsNoteUIPlugin,
  UniverSheetsTableUIPlugin
};
