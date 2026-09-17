import {
  AddRangeThemeMutation,
  CopySheetCommand,
  IDefinedNamesService,
  IExclusiveRangeService,
  INTERCEPTOR_POINT,
  InsertColCommand,
  InsertColMutation,
  InsertRowCommand,
  InsertRowMutation,
  RangeThemeStyle,
  RefRangeService,
  RemoveColCommand,
  RemoveColMutation,
  RemoveRangeThemeMutation,
  RemoveRowCommand,
  RemoveRowMutation,
  RemoveSheetCommand,
  RemoveSuperTableMutation,
  SetSuperTableMutation,
  SheetInterceptorService,
  SheetRangeThemeModel,
  SheetRangeThemeService,
  SheetsSelectionsService,
  UniverSheetsPlugin,
  ZebraCrossingCacheController,
  getMoveRangeUndoRedoMutations,
  getSheetCommandTarget,
  handleCommonRangeChangeWithEffectRefCommandsSkipNoInterests
} from "./chunk-Q6Y4PHRI.js";
import {
  BehaviorSubject,
  DependentOn,
  Disposable,
  ICommandService,
  IConfigService,
  ILogService,
  IResourceManagerService,
  IUndoRedoService,
  IUniverInstanceService,
  Inject,
  Injector,
  LocaleService,
  Plugin,
  RTree,
  Rectangle,
  Subject,
  createREGEXFromWildChar,
  customNameCharacterCheck,
  filter,
  generateRandomId,
  map,
  merge_default,
  registerDependencies,
  sequenceExecute,
  sequenceExecuteAsync,
  switchMap,
  touchDependencies
} from "./chunk-EJSPXROI.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField
} from "./chunk-24OICD5T.js";

// ../packages/sheets-note/package.json
var package_default = {
  name: "@univerjs/sheets-note",
  version: "0.25.2",
  private: false,
  description: "Cell note model and commands for Univer Sheets.",
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
    "@univerjs/sheets": "workspace:*"
  },
  devDependencies: {
    "@univerjs-infra/shared": "workspace:*",
    "@univerjs/engine-formula": "workspace:*",
    "@univerjs/engine-render": "workspace:*",
    "@univerjs/network": "workspace:*",
    rxjs: "^7.8.2",
    typescript: "^6.0.3",
    vitest: "^4.1.7"
  }
};

// ../packages/sheets-note/src/config/config.ts
var SHEETS_NOTE_PLUGIN_CONFIG_KEY = "sheets-note.config";
var configSymbol = Symbol(SHEETS_NOTE_PLUGIN_CONFIG_KEY);
var defaultPluginConfig = {};

// ../packages/sheets-note/src/const.ts
var PLUGIN_NAME = "SHEET_NOTE_PLUGIN";

// ../packages/sheets-note/src/models/sheets-note.model.ts
var SheetsNoteModel = class extends Disposable {
  constructor() {
    super(...arguments);
    __publicField(this, "_notesMap", /* @__PURE__ */ new Map());
    __publicField(this, "_change$", new Subject());
    __publicField(this, "change$", this._change$.asObservable());
  }
  _ensureNotesMap(unitId, subUnitId) {
    let unitMap = this._notesMap.get(unitId);
    if (!unitMap) {
      unitMap = /* @__PURE__ */ new Map();
      this._notesMap.set(unitId, unitMap);
    }
    let subUnitMap = unitMap.get(subUnitId);
    if (!subUnitMap) {
      subUnitMap = /* @__PURE__ */ new Map();
      unitMap.set(subUnitId, subUnitMap);
    }
    return subUnitMap;
  }
  _getNoteByPosition(unitId, subUnitId, row, col) {
    const subUnitMap = this._ensureNotesMap(unitId, subUnitId);
    for (const [_, note] of subUnitMap) {
      if (note.row === row && note.col === col) {
        return note;
      }
    }
  }
  _getNoteById(unitId, subUnitId, id) {
    const subUnitMap = this._ensureNotesMap(unitId, subUnitId);
    return subUnitMap.get(id);
  }
  _getNoteByParams(unitId, subUnitId, params) {
    const { noteId, row, col } = params;
    if (noteId) {
      return this._getNoteById(unitId, subUnitId, noteId);
    }
    if (row !== void 0 && col !== void 0) {
      return this._getNoteByPosition(unitId, subUnitId, row, col);
    }
    return null;
  }
  getSheetShowNotes$(unitId, subUnitId) {
    return this._change$.pipe(
      filter(({ unitId: u, subUnitId: s }) => u === unitId && s === subUnitId),
      map(() => {
        const subUnitMap = this._ensureNotesMap(unitId, subUnitId);
        const notes = [];
        for (const [_, note] of subUnitMap) {
          if (note.show) {
            notes.push({ loc: { row: note.row, col: note.col, unitId, subUnitId }, note });
          }
        }
        return notes;
      })
    );
  }
  getCellNoteChange$(unitId, subUnitId, row, col) {
    return this._change$.pipe(
      filter(({ unitId: u, subUnitId: s, oldNote }) => {
        if (u !== unitId || s !== subUnitId || !oldNote) {
          return false;
        }
        return oldNote.row === row && oldNote.col === col;
      }),
      map((newNote) => newNote)
    );
  }
  updateNote(unitId, subUnitId, row, col, note, silent) {
    const oldNote = this._getNoteByParams(unitId, subUnitId, { noteId: note == null ? void 0 : note.id, row, col });
    const subUnitMap = this._ensureNotesMap(unitId, subUnitId);
    const newNote = {
      ...note,
      id: (oldNote == null ? void 0 : oldNote.id) || note.id || generateRandomId(6),
      row,
      col
    };
    subUnitMap.set(newNote.id, newNote);
    this._change$.next({ unitId, subUnitId, oldNote, type: "update", newNote, silent });
  }
  removeNote(unitId, subUnitId, params) {
    const { noteId, row, col, silent } = params;
    const oldNote = this._getNoteByParams(unitId, subUnitId, { noteId, row, col });
    if (!oldNote) {
      return;
    }
    const subUnitMap = this._ensureNotesMap(unitId, subUnitId);
    subUnitMap.delete(oldNote.id);
    this._change$.next({ unitId, subUnitId, oldNote, type: "update", newNote: null, silent });
  }
  toggleNotePopup(unitId, subUnitId, params) {
    const { noteId, row, col, silent } = params;
    const oldNote = this._getNoteByParams(unitId, subUnitId, { noteId, row, col });
    if (!oldNote) {
      return;
    }
    const subUnitMap = this._ensureNotesMap(unitId, subUnitId);
    const newNote = { ...oldNote, show: !oldNote.show };
    subUnitMap.set(newNote.id, newNote);
    this._change$.next({ unitId, subUnitId, oldNote, type: "update", newNote, silent });
  }
  updateNotePosition(unitId, subUnitId, params) {
    const { noteId, row, col, newRow, newCol, silent } = params;
    const oldNote = this._getNoteByParams(unitId, subUnitId, { noteId, row, col });
    if (!oldNote) {
      return;
    }
    const subUnitMap = this._ensureNotesMap(unitId, subUnitId);
    const newNote = { ...oldNote, row: newRow, col: newCol };
    subUnitMap.set(newNote.id, newNote);
    this._change$.next({ unitId, subUnitId, oldNote, type: "ref", newNote, silent });
  }
  getNote(unitId, subUnitId, params) {
    return this._getNoteByParams(unitId, subUnitId, params);
  }
  getNotes() {
    return this._notesMap;
  }
  getUnitNotes(unitId) {
    return this._notesMap.get(unitId);
  }
  getSheetNotes(unitId, subUnitId) {
    const unitMap = this._notesMap.get(unitId);
    if (!unitMap) {
      return void 0;
    }
    return unitMap.get(subUnitId);
  }
  deleteUnitNotes(unitId) {
    this._notesMap.delete(unitId);
  }
};

// ../packages/sheets-note/src/commands/mutations/note.mutation.ts
var UpdateNoteMutation = {
  id: "sheet.mutation.update-note",
  type: 2 /* MUTATION */,
  handler: (accessor, params) => {
    const { unitId, sheetId, row, col, note, silent } = params;
    const sheetsNoteModel = accessor.get(SheetsNoteModel);
    sheetsNoteModel.updateNote(unitId, sheetId, row, col, note, silent);
    return true;
  }
};
var RemoveNoteMutation = {
  id: "sheet.mutation.remove-note",
  type: 2 /* MUTATION */,
  handler: (accessor, params) => {
    const { unitId, sheetId, noteId, row, col, silent } = params;
    const sheetsNoteModel = accessor.get(SheetsNoteModel);
    sheetsNoteModel.removeNote(unitId, sheetId, { noteId, row, col, silent });
    return true;
  }
};
var ToggleNotePopupMutation = {
  id: "sheet.mutation.toggle-note-popup",
  type: 2 /* MUTATION */,
  handler: (accessor, params) => {
    const { unitId, sheetId, noteId, row, col, silent } = params;
    const sheetsNoteModel = accessor.get(SheetsNoteModel);
    sheetsNoteModel.toggleNotePopup(unitId, sheetId, { noteId, row, col, silent });
    return true;
  }
};
var UpdateNotePositionMutation = {
  id: "sheet.mutation.update-note-position",
  type: 2 /* MUTATION */,
  handler: (accessor, params) => {
    const { unitId, sheetId, noteId, row, col, newPosition, silent } = params;
    const sheetsNoteModel = accessor.get(SheetsNoteModel);
    sheetsNoteModel.updateNotePosition(unitId, sheetId, { noteId, row, col, newRow: newPosition.row, newCol: newPosition.col, silent });
    return true;
  }
};

// ../packages/sheets-note/src/controllers/sheets-note-ref-range.controller.ts
var SheetsNoteRefRangeController = class extends Disposable {
  constructor(_refRangeService, _sheetsNoteModel, _selectionManagerService, _commandService) {
    super();
    __publicField(this, "_refRangeService", _refRangeService);
    __publicField(this, "_sheetsNoteModel", _sheetsNoteModel);
    __publicField(this, "_selectionManagerService", _selectionManagerService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_disposableMap", /* @__PURE__ */ new Map());
    __publicField(this, "_watcherMap", /* @__PURE__ */ new Map());
    __publicField(this, "_handleRangeChange", (unitId, subUnitId, note, row, col, resultRange, silent) => {
      if (!resultRange) {
        return {
          redos: [{
            id: RemoveNoteMutation.id,
            params: {
              unitId,
              sheetId: subUnitId,
              noteId: note.id
            }
          }],
          undos: [{
            id: UpdateNoteMutation.id,
            params: {
              unitId,
              sheetId: subUnitId,
              row,
              col,
              note
            }
          }]
        };
      }
      return {
        redos: [{
          id: UpdateNotePositionMutation.id,
          params: {
            unitId,
            sheetId: subUnitId,
            noteId: note.id,
            newPosition: {
              row: resultRange.startRow,
              col: resultRange.startColumn
            },
            silent
          }
        }],
        undos: [{
          id: UpdateNotePositionMutation.id,
          params: {
            unitId,
            sheetId: subUnitId,
            noteId: note.id,
            newPosition: {
              row,
              col
            },
            note,
            silent
          }
        }]
      };
    });
    this._initData();
    this._initRefRange();
  }
  _getIdWithUnitId(unitId, subUnitId, row, col) {
    return `${unitId}-${subUnitId}-${row}-${col}`;
  }
  _register(unitId, subUnitId, note, row, col) {
    const oldRange = {
      startColumn: col,
      endColumn: col,
      startRow: row,
      endRow: row
    };
    this._disposableMap.set(
      this._getIdWithUnitId(unitId, subUnitId, row, col),
      this._refRangeService.registerRefRange(oldRange, (commandInfo) => {
        const resultRanges = handleCommonRangeChangeWithEffectRefCommandsSkipNoInterests(oldRange, commandInfo, { selectionManagerService: this._selectionManagerService });
        const resultRange = Array.isArray(resultRanges) ? resultRanges[0] : resultRanges;
        if (resultRange && resultRange.startColumn === oldRange.startColumn && resultRange.startRow === oldRange.startRow) {
          return {
            undos: [],
            redos: []
          };
        }
        const res = this._handleRangeChange(unitId, subUnitId, note, row, col, resultRange, false);
        return res;
      }, unitId, subUnitId)
    );
  }
  _watch(unitId, subUnitId, note, row, col) {
    const oldRange = {
      startColumn: col,
      endColumn: col,
      startRow: row,
      endRow: row
    };
    this._watcherMap.set(
      this._getIdWithUnitId(unitId, subUnitId, row, col),
      this._refRangeService.watchRange(unitId, subUnitId, oldRange, (before, after) => {
        const { redos } = this._handleRangeChange(unitId, subUnitId, note, before.startRow, before.startColumn, after, true);
        sequenceExecuteAsync(redos, this._commandService, { onlyLocal: true });
      }, true)
    );
  }
  _unwatch(unitId, subUnitId, row, col) {
    var _a;
    const id = this._getIdWithUnitId(unitId, subUnitId, row, col);
    (_a = this._watcherMap.get(id)) == null ? void 0 : _a.dispose();
    this._watcherMap.delete(id);
  }
  _unregister(unitId, subUnitId, row, col) {
    var _a;
    const id = this._getIdWithUnitId(unitId, subUnitId, row, col);
    (_a = this._disposableMap.get(id)) == null ? void 0 : _a.dispose();
    this._disposableMap.delete(id);
  }
  _initData() {
    const unitNotes = this._sheetsNoteModel.getNotes();
    for (const [unitId, unitNote] of unitNotes) {
      for (const [subUnitId, notes] of unitNote) {
        notes.forEach((note) => {
          this._register(unitId, subUnitId, note, note.row, note.col);
          this._watch(unitId, subUnitId, note, note.row, note.col);
        });
      }
    }
  }
  _initRefRange() {
    this.disposeWithMe(
      this._sheetsNoteModel.change$.subscribe((option) => {
        switch (option.type) {
          case "update": {
            const { unitId, subUnitId, oldNote, newNote } = option;
            const row = newNote ? newNote.row : oldNote.row;
            const col = newNote ? newNote.col : oldNote.col;
            const id = this._getIdWithUnitId(unitId, subUnitId, row, col);
            if (newNote) {
              if (!this._disposableMap.has(id)) {
                this._register(unitId, subUnitId, newNote, row, col);
                this._watch(unitId, subUnitId, newNote, row, col);
              }
            } else {
              this._unregister(unitId, subUnitId, row, col);
              this._unwatch(unitId, subUnitId, row, col);
            }
            break;
          }
          case "ref": {
            const { unitId, subUnitId, oldNote, newNote, silent } = option;
            const { row: oldRow, col: oldCol } = oldNote;
            const { row: newRow, col: newCol } = newNote;
            this._unregister(unitId, subUnitId, oldRow, oldCol);
            if (!silent) {
              this._unwatch(unitId, subUnitId, oldRow, oldCol);
              this._watch(unitId, subUnitId, newNote, newRow, newCol);
            }
            this._register(unitId, subUnitId, newNote, newRow, newCol);
            break;
          }
        }
      })
    );
  }
};
SheetsNoteRefRangeController = __decorateClass([
  __decorateParam(0, Inject(RefRangeService)),
  __decorateParam(1, Inject(SheetsNoteModel)),
  __decorateParam(2, Inject(SheetsSelectionsService)),
  __decorateParam(3, ICommandService)
], SheetsNoteRefRangeController);

// ../packages/sheets-note/src/controllers/sheets-note-resource.controller.ts
var SheetsNoteResourceController = class extends Disposable {
  constructor(_resourceManagerService, _univerInstanceService, _sheetInterceptorService, _sheetsNoteModel) {
    super();
    __publicField(this, "_resourceManagerService", _resourceManagerService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_sheetsNoteModel", _sheetsNoteModel);
    this._initSnapshot();
    this._initSheetChange();
  }
  _initSnapshot() {
    const toJson = (unitId) => {
      const unitMap = this._sheetsNoteModel.getUnitNotes(unitId);
      if (!unitMap) {
        return "";
      }
      const result = {};
      unitMap.forEach((subUnitMap, subUnitId) => {
        const sheetNotes = {};
        subUnitMap.forEach((note) => {
          const { row, col } = note;
          if (!sheetNotes[row]) {
            sheetNotes[row] = {};
          }
          sheetNotes[row][col] = note;
        });
        if (Object.keys(sheetNotes).length > 0) {
          result[subUnitId] = sheetNotes;
        }
      });
      return JSON.stringify(result);
    };
    const parseJson = (json) => {
      if (!json) {
        return {};
      }
      try {
        return JSON.parse(json);
      } catch {
        return {};
      }
    };
    this.disposeWithMe(
      this._resourceManagerService.registerPluginResource({
        pluginName: PLUGIN_NAME,
        businesses: [2 /* UNIVER_SHEET */],
        toJson: (unitId) => toJson(unitId),
        parseJson: (json) => parseJson(json),
        onUnLoad: (unitId) => {
          this._sheetsNoteModel.deleteUnitNotes(unitId);
        },
        onLoad: (unitId, value) => {
          Object.entries(value).forEach(([sheetId, sheetNotes]) => {
            Object.entries(sheetNotes).forEach(([row, colNotes]) => {
              Object.entries(colNotes).forEach(([col, note]) => {
                this._sheetsNoteModel.updateNote(
                  unitId,
                  sheetId,
                  Number(row),
                  Number(col),
                  note
                );
              });
            });
          });
        }
      })
    );
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
            const sheetNotes = this._sheetsNoteModel.getSheetNotes(unitId, subUnitId);
            if (!sheetNotes) {
              return { redos: [], undos: [] };
            }
            const redos = [];
            const undos = [];
            sheetNotes.forEach((note) => {
              redos.push({
                id: RemoveNoteMutation.id,
                params: {
                  unitId,
                  sheetId: subUnitId,
                  noteId: note.id,
                  row: note.row,
                  col: note.col
                }
              });
              undos.push({
                id: UpdateNoteMutation.id,
                params: {
                  unitId,
                  sheetId: subUnitId,
                  row: note.row,
                  col: note.col,
                  note
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
            const sheetNotes = this._sheetsNoteModel.getSheetNotes(unitId, subUnitId);
            if (!sheetNotes) {
              return { redos: [], undos: [] };
            }
            const redos = [];
            const undos = [];
            sheetNotes.forEach((note) => {
              const newNote = { ...note, id: generateRandomId(6) };
              redos.push({
                id: UpdateNoteMutation.id,
                params: {
                  unitId,
                  sheetId: targetSubUnitId,
                  row: newNote.row,
                  col: newNote.col,
                  note: newNote
                }
              });
              undos.push({
                id: RemoveNoteMutation.id,
                params: {
                  unitId,
                  sheetId: targetSubUnitId,
                  noteId: newNote.id,
                  row: newNote.row,
                  col: newNote.col
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
SheetsNoteResourceController = __decorateClass([
  __decorateParam(0, IResourceManagerService),
  __decorateParam(1, IUniverInstanceService),
  __decorateParam(2, Inject(SheetInterceptorService)),
  __decorateParam(3, Inject(SheetsNoteModel))
], SheetsNoteResourceController);

// ../packages/sheets-note/src/commands/commands/note.command.ts
var SheetDeleteNoteCommand = {
  id: "sheet.command.delete-note",
  type: 0 /* COMMAND */,
  handler: (accessor) => {
    const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
    if (!target) return false;
    const sheetsSelectionsService = accessor.get(SheetsSelectionsService);
    const selection = sheetsSelectionsService.getCurrentLastSelection();
    if (!(selection == null ? void 0 : selection.primary)) return false;
    const sheetsNoteModel = accessor.get(SheetsNoteModel);
    const { unitId, subUnitId } = target;
    const { actualColumn, actualRow } = selection.primary;
    const note = sheetsNoteModel.getNote(unitId, subUnitId, { row: actualRow, col: actualColumn });
    if (!note) return false;
    const commandService = accessor.get(ICommandService);
    const undoRedoService = accessor.get(IUndoRedoService);
    const redoMutation = {
      id: RemoveNoteMutation.id,
      params: {
        unitId,
        sheetId: subUnitId,
        noteId: note.id
      }
    };
    const undoMutation = {
      id: UpdateNoteMutation.id,
      params: {
        unitId,
        sheetId: subUnitId,
        row: actualRow,
        col: actualColumn,
        note: { ...note }
      }
    };
    const result = commandService.syncExecuteCommand(redoMutation.id, redoMutation.params);
    if (result) {
      undoRedoService.pushUndoRedo({
        unitID: unitId,
        redoMutations: [redoMutation],
        undoMutations: [undoMutation]
      });
      return true;
    }
    return false;
  }
};
var SheetToggleNotePopupCommand = {
  id: "sheet.command.toggle-note-popup",
  type: 0 /* COMMAND */,
  handler: (accessor) => {
    const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
    if (!target) return false;
    const sheetsSelectionsService = accessor.get(SheetsSelectionsService);
    const selection = sheetsSelectionsService.getCurrentLastSelection();
    if (!(selection == null ? void 0 : selection.primary)) return false;
    const sheetsNoteModel = accessor.get(SheetsNoteModel);
    const { unitId, subUnitId } = target;
    const { actualColumn, actualRow } = selection.primary;
    const note = sheetsNoteModel.getNote(unitId, subUnitId, { row: actualRow, col: actualColumn });
    if (!note) return false;
    const commandService = accessor.get(ICommandService);
    const undoRedoService = accessor.get(IUndoRedoService);
    const redoMutation = {
      id: ToggleNotePopupMutation.id,
      params: {
        unitId,
        sheetId: subUnitId,
        noteId: note.id
      }
    };
    const undoMutation = {
      id: ToggleNotePopupMutation.id,
      params: {
        unitId,
        sheetId: subUnitId,
        noteId: note.id
      }
    };
    const result = commandService.syncExecuteCommand(redoMutation.id, redoMutation.params);
    if (result) {
      undoRedoService.pushUndoRedo({
        unitID: unitId,
        redoMutations: [redoMutation],
        undoMutations: [undoMutation]
      });
      return true;
    }
    return false;
  }
};
var SheetUpdateNoteCommand = {
  id: "sheet.command.update-note",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), params);
    if (!target) return false;
    const commandService = accessor.get(ICommandService);
    const undoRedoService = accessor.get(IUndoRedoService);
    const sheetsNoteModel = accessor.get(SheetsNoteModel);
    const { unitId, subUnitId } = target;
    const { row, col, note } = params;
    const oldNote = sheetsNoteModel.getNote(unitId, subUnitId, { noteId: note.id, row, col });
    const redoMutation = {
      id: UpdateNoteMutation.id,
      params: {
        unitId,
        sheetId: subUnitId,
        row,
        col,
        note
      }
    };
    const undoMutations = [];
    if (oldNote) {
      const undoMutation = {
        id: UpdateNoteMutation.id,
        params: {
          unitId,
          sheetId: subUnitId,
          row,
          col,
          note: { ...oldNote }
        }
      };
      undoMutations.push(undoMutation);
    } else {
      const undoMutation = {
        id: RemoveNoteMutation.id,
        params: {
          unitId,
          sheetId: subUnitId,
          row,
          col
        }
      };
      undoMutations.push(undoMutation);
    }
    const result = commandService.syncExecuteCommand(redoMutation.id, redoMutation.params);
    if (result) {
      undoRedoService.pushUndoRedo({
        unitID: unitId,
        redoMutations: [redoMutation],
        undoMutations
      });
      return true;
    }
    return false;
  }
};

// ../packages/sheets-note/src/controllers/sheets.note.controller.ts
var SheetsNoteController = class extends Disposable {
  constructor(_commandService) {
    super();
    __publicField(this, "_commandService", _commandService);
    this._initialize();
  }
  _initialize() {
    [
      UpdateNotePositionMutation,
      ToggleNotePopupMutation,
      UpdateNoteMutation,
      RemoveNoteMutation,
      SheetDeleteNoteCommand,
      SheetToggleNotePopupCommand,
      SheetUpdateNoteCommand
    ].forEach((command) => {
      this.disposeWithMe(
        this._commandService.registerCommand(command)
      );
    });
  }
};
SheetsNoteController = __decorateClass([
  __decorateParam(0, ICommandService)
], SheetsNoteController);

// ../packages/sheets-note/src/plugin.ts
var UniverSheetsNotePlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig, _configService, _injector) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_configService", _configService);
    __publicField(this, "_injector", _injector);
    const { ...rest } = merge_default(
      {},
      defaultPluginConfig,
      this._config
    );
    this._configService.setConfig(SHEETS_NOTE_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    [
      [SheetsNoteModel],
      [SheetsNoteController],
      [SheetsNoteResourceController],
      [SheetsNoteRefRangeController]
    ].forEach((dependency) => {
      this._injector.add(dependency);
    });
    touchDependencies(this._injector, [
      [SheetsNoteModel],
      [SheetsNoteController],
      [SheetsNoteResourceController]
    ]);
  }
  onReady() {
    touchDependencies(this._injector, [
      [SheetsNoteRefRangeController]
    ]);
  }
};
__publicField(UniverSheetsNotePlugin, "pluginName", PLUGIN_NAME);
__publicField(UniverSheetsNotePlugin, "packageName", package_default.name);
__publicField(UniverSheetsNotePlugin, "version", package_default.version);
__publicField(UniverSheetsNotePlugin, "type", 2 /* UNIVER_SHEET */);
UniverSheetsNotePlugin = __decorateClass([
  DependentOn(UniverSheetsPlugin),
  __decorateParam(1, IConfigService),
  __decorateParam(2, Inject(Injector))
], UniverSheetsNotePlugin);

// ../packages/sheets-table/package.json
var package_default2 = {
  name: "@univerjs/sheets-table",
  version: "0.25.2",
  private: false,
  description: "Structured table model and commands for Univer Sheets.",
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
    "@univerjs/sheets": "workspace:*"
  },
  devDependencies: {
    "@univerjs-infra/shared": "workspace:*",
    "@univerjs/engine-render": "workspace:*",
    "@univerjs/sheets-formula": "workspace:*",
    rxjs: "^7.8.2",
    typescript: "^6.0.3",
    vitest: "^4.1.7"
  }
};

// ../packages/sheets-table/src/types/enum.ts
var TableColumnFilterTypeEnum = /* @__PURE__ */ ((TableColumnFilterTypeEnum2) => {
  TableColumnFilterTypeEnum2["manual"] = "manual";
  TableColumnFilterTypeEnum2["condition"] = "condition";
  return TableColumnFilterTypeEnum2;
})(TableColumnFilterTypeEnum || {});
var TableConditionTypeEnum = /* @__PURE__ */ ((TableConditionTypeEnum2) => {
  TableConditionTypeEnum2["Date"] = "date";
  TableConditionTypeEnum2["Number"] = "number";
  TableConditionTypeEnum2["String"] = "string";
  TableConditionTypeEnum2["Logic"] = "logic";
  return TableConditionTypeEnum2;
})(TableConditionTypeEnum || {});
var TableNumberCompareTypeEnum = /* @__PURE__ */ ((TableNumberCompareTypeEnum2) => {
  TableNumberCompareTypeEnum2["Equal"] = "equal";
  TableNumberCompareTypeEnum2["NotEqual"] = "notEqual";
  TableNumberCompareTypeEnum2["GreaterThan"] = "greaterThan";
  TableNumberCompareTypeEnum2["GreaterThanOrEqual"] = "greaterThanOrEqual";
  TableNumberCompareTypeEnum2["LessThan"] = "lessThan";
  TableNumberCompareTypeEnum2["LessThanOrEqual"] = "lessThanOrEqual";
  TableNumberCompareTypeEnum2["Between"] = "between";
  TableNumberCompareTypeEnum2["NotBetween"] = "notBetween";
  TableNumberCompareTypeEnum2["Above"] = "above";
  TableNumberCompareTypeEnum2["Below"] = "below";
  TableNumberCompareTypeEnum2["TopN"] = "topN";
  return TableNumberCompareTypeEnum2;
})(TableNumberCompareTypeEnum || {});
var TableStringCompareTypeEnum = /* @__PURE__ */ ((TableStringCompareTypeEnum2) => {
  TableStringCompareTypeEnum2["Equal"] = "equal";
  TableStringCompareTypeEnum2["NotEqual"] = "notEqual";
  TableStringCompareTypeEnum2["Contains"] = "contains";
  TableStringCompareTypeEnum2["NotContains"] = "notContains";
  TableStringCompareTypeEnum2["StartsWith"] = "startsWith";
  TableStringCompareTypeEnum2["EndsWith"] = "endsWith";
  return TableStringCompareTypeEnum2;
})(TableStringCompareTypeEnum || {});
var TableDateCompareTypeEnum = /* @__PURE__ */ ((TableDateCompareTypeEnum2) => {
  TableDateCompareTypeEnum2["Equal"] = "equal";
  TableDateCompareTypeEnum2["NotEqual"] = "notEqual";
  TableDateCompareTypeEnum2["After"] = "after";
  TableDateCompareTypeEnum2["AfterOrEqual"] = "afterOrEqual";
  TableDateCompareTypeEnum2["Before"] = "before";
  TableDateCompareTypeEnum2["BeforeOrEqual"] = "beforeOrEqual";
  TableDateCompareTypeEnum2["Between"] = "between";
  TableDateCompareTypeEnum2["NotBetween"] = "notBetween";
  TableDateCompareTypeEnum2["Today"] = "today";
  TableDateCompareTypeEnum2["Yesterday"] = "yesterday";
  TableDateCompareTypeEnum2["Tomorrow"] = "tomorrow";
  TableDateCompareTypeEnum2["ThisWeek"] = "thisWeek";
  TableDateCompareTypeEnum2["LastWeek"] = "lastWeek";
  TableDateCompareTypeEnum2["NextWeek"] = "nextWeek";
  TableDateCompareTypeEnum2["ThisMonth"] = "thisMonth";
  TableDateCompareTypeEnum2["LastMonth"] = "lastMonth";
  TableDateCompareTypeEnum2["NextMonth"] = "nextMonth";
  TableDateCompareTypeEnum2["ThisQuarter"] = "thisQuarter";
  TableDateCompareTypeEnum2["LastQuarter"] = "lastQuarter";
  TableDateCompareTypeEnum2["NextQuarter"] = "nextQuarter";
  TableDateCompareTypeEnum2["ThisYear"] = "thisYear";
  TableDateCompareTypeEnum2["LastYear"] = "lastYear";
  TableDateCompareTypeEnum2["NextYear"] = "nextYear";
  TableDateCompareTypeEnum2["YearToDate"] = "yearToDate";
  TableDateCompareTypeEnum2["Quarter"] = "quarter";
  TableDateCompareTypeEnum2["Month"] = "month";
  TableDateCompareTypeEnum2["M1"] = "m1";
  TableDateCompareTypeEnum2["M2"] = "m2";
  TableDateCompareTypeEnum2["M3"] = "m3";
  TableDateCompareTypeEnum2["M4"] = "m4";
  TableDateCompareTypeEnum2["M5"] = "m5";
  TableDateCompareTypeEnum2["M6"] = "m6";
  TableDateCompareTypeEnum2["M7"] = "m7";
  TableDateCompareTypeEnum2["M8"] = "m8";
  TableDateCompareTypeEnum2["M9"] = "m9";
  TableDateCompareTypeEnum2["M10"] = "m10";
  TableDateCompareTypeEnum2["M11"] = "m11";
  TableDateCompareTypeEnum2["M12"] = "m12";
  TableDateCompareTypeEnum2["Q1"] = "q1";
  TableDateCompareTypeEnum2["Q2"] = "q2";
  TableDateCompareTypeEnum2["Q3"] = "q3";
  TableDateCompareTypeEnum2["Q4"] = "q4";
  return TableDateCompareTypeEnum2;
})(TableDateCompareTypeEnum || {});

// ../packages/sheets-table/src/util.ts
function getColumnName(columnIndex, columnText) {
  return `${columnText} ${columnIndex}`;
}
var BooleanTrue = "TRUE";
var BooleanFalse = "FALSE";
var getStringFromDataStream = (data) => {
  var _a;
  const dataStream = ((_a = data.body) == null ? void 0 : _a.dataStream.replace(/\r\n$/, "")) || "";
  return dataStream;
};
function convertCellDataToString(cellData) {
  if (cellData) {
    const { v, t, p } = cellData;
    if (p) {
      return getStringFromDataStream(p);
    }
    if ((t === 4 /* FORCE_STRING */ || t === 1 /* STRING */) && v !== void 0 && v !== null) {
      return String(v);
    } else if (t === 3 /* BOOLEAN */) {
      return v ? BooleanTrue : BooleanFalse;
    } else if (t === 2 /* NUMBER */) {
      return String(v);
    } else {
      const type = typeof v;
      if (type === "boolean") {
        return v ? BooleanTrue : BooleanFalse;
      }
      return v === void 0 || v === null ? "" : String(v);
    }
  }
  return "";
}
function getTableFilterState(tableFilter, sortState) {
  const hasFilter = tableFilter !== void 0 && tableFilter !== null;
  if (hasFilter) {
    switch (sortState) {
      case "asc" /* Asc */:
        return 2 /* FilteredSortAsc */;
      case "desc" /* Desc */:
        return 3 /* FilteredSortDesc */;
      default:
        return 1 /* FilteredSortNone */;
    }
  } else {
    switch (sortState) {
      case "asc" /* Asc */:
        return 5 /* FilterNoneSortAsc */;
      case "desc" /* Desc */:
        return 6 /* FilterNoneSortDesc */;
      default:
        return 4 /* FilterNoneSortNone */;
    }
  }
}
function isConditionFilter(filter2) {
  if (!filter2) {
    return false;
  }
  return filter2.filterType === "condition" /* condition */;
}
function isManualTableFilter(filter2) {
  if (!filter2) {
    return false;
  }
  return filter2.filterType === "manual" /* manual */;
}
function getExistingNamesSet(unitId, options) {
  const { univerInstanceService, tableManager, definedNamesService } = options;
  const existingNamesSet = /* @__PURE__ */ new Set();
  const workbook = univerInstanceService == null ? void 0 : univerInstanceService.getUnit(unitId, 2 /* UNIVER_SHEET */);
  if (workbook) {
    workbook.getSheets().forEach((sheet) => {
      existingNamesSet.add(sheet.getName().toLowerCase());
    });
  }
  const tableList = tableManager == null ? void 0 : tableManager.getTableList(unitId);
  if (tableList && tableList.length > 0) {
    tableList.forEach((tableItem) => {
      existingNamesSet.add(tableItem.name.toLowerCase());
    });
  }
  const definedNames = definedNamesService == null ? void 0 : definedNamesService.getDefinedNameMap(unitId);
  if (definedNames) {
    Object.values(definedNames).forEach((definedName) => {
      existingNamesSet.add(definedName.name.toLowerCase());
    });
  }
  return existingNamesSet;
}

// ../packages/sheets-table/src/config/config.ts
var tableDefaultBorderStyle = {
  s: 1 /* THIN */,
  cl: {
    rgb: "rgb(95, 101, 116)"
  }
};
var SHEETS_TABLE_PLUGIN_CONFIG_KEY = "sheets-table.config";
var configSymbol2 = Symbol(SHEETS_TABLE_PLUGIN_CONFIG_KEY);
var defaultPluginConfig2 = {};

// ../packages/sheets-table/src/controllers/table-theme.factory.ts
var customEmptyThemeWithBorderStyle = {
  headerRowStyle: {
    bd: {
      t: tableDefaultBorderStyle
    }
  },
  headerColumnStyle: {
    bd: {
      l: tableDefaultBorderStyle
    }
  },
  lastColumnStyle: {
    bd: {
      r: tableDefaultBorderStyle
    }
  },
  lastRowStyle: {
    bd: {
      b: tableDefaultBorderStyle
    }
  }
};
var processStyleWithBorderStyle = (key, style) => {
  if (key === "headerRowStyle") {
    if (!style.bd) {
      return {
        ...style,
        bd: {
          t: tableDefaultBorderStyle
        }
      };
    }
  } else if (key === "lastRowStyle") {
    if (!style.bd) {
      return {
        ...style,
        bd: {
          b: tableDefaultBorderStyle
        }
      };
    }
  } else if (key === "lastColumnStyle") {
    if (!style.bd) {
      return {
        ...style,
        bd: {
          r: tableDefaultBorderStyle
        }
      };
    }
  } else if (key === "headerColumnStyle") {
    if (!style.bd) {
      return {
        ...style,
        bd: {
          l: tableDefaultBorderStyle
        }
      };
    }
  }
  return style;
};
var tableDefaultThemeStyleArr = [
  [["#6280F9", "#FFFFFF", "#EEF2FF", "#DCE4FF"], ["#fff"]],
  [["#16BDCA", "#FFFFFF", "#EDFAFA", "#AFECEF"], ["#000"]],
  [["#31C48D", "#FFFFFF", "#F3FAF7", "#BCF0DA"], ["#fff"]],
  [["#AC94FA", "#FFFFFF", "#F6F5FF", "#EDEBFE"], ["#fff"]],
  [["#F17EBB", "#FFFFFF", "#FDF2F8", "#FCE8F3"], ["#fff"]],
  [["#F98080", "#FFFFFF", "#FDF2F2", "#FDE8E8"], ["#fff"]]
];
var tableThemeConfig = tableDefaultThemeStyleArr.map((item, index) => {
  const [backgroundArr, colorArr] = item;
  const [headerRowBg, firstRowBg, secondRowBg, lastRowBg] = backgroundArr;
  const [headerCl] = colorArr;
  return {
    name: `table-default-${index}`,
    style: {
      headerRowStyle: {
        bg: {
          rgb: headerRowBg
        },
        cl: {
          rgb: headerCl
        },
        bd: {
          t: tableDefaultBorderStyle
        }
      },
      headerColumnStyle: {
        bd: {
          l: tableDefaultBorderStyle
        }
      },
      firstRowStyle: {
        bg: {
          rgb: firstRowBg
        }
      },
      secondRowStyle: {
        bg: {
          rgb: secondRowBg
        }
      },
      lastRowStyle: {
        bg: {
          rgb: lastRowBg
        },
        bd: {
          b: tableDefaultBorderStyle
        }
      },
      lastColumnStyle: {
        bd: {
          r: tableDefaultBorderStyle
        }
      }
    }
  };
});

// ../packages/sheets-table/src/model/table-column.ts
var TableColumn = class {
  constructor(id, name) {
    __publicField(this, "dataType");
    __publicField(this, "id");
    __publicField(this, "displayName");
    __publicField(this, "formula");
    __publicField(this, "meta");
    __publicField(this, "style");
    this.id = id;
    this.displayName = name;
    this.dataType = "string" /* String */;
    this.formula = "";
    this.meta = {};
    this.style = {};
  }
  getMeta() {
    return this.meta;
  }
  setMeta(meta) {
    this.meta = meta;
  }
  getDisplayName() {
    return this.displayName;
  }
  toJSON() {
    return {
      id: this.id,
      displayName: this.displayName,
      dataType: this.dataType,
      formula: this.formula,
      meta: this.meta,
      style: this.style
    };
  }
  fromJSON(json) {
    this.id = json.id;
    this.displayName = json.displayName;
    this.dataType = json.dataType;
    this.formula = json.formula;
    this.meta = json.meta;
    this.style = json.style;
  }
};

// ../packages/sheets-table/src/const.ts
var PLUGIN_NAME2 = "SHEET_TABLE_PLUGIN";
var FEATURE_TABLE_ID = "SHEET_TABLE";
var SHEET_TABLE_CUSTOM_THEME_PREFIX = "table-custom";
var TABLE_FILTER_EMPTY_VALUE = "__UNIVER_TABLE_FILTER_EMPTY__";

// ../packages/sheets-table/src/model/filter-util/date-filter-util.ts
var dateQ1 = (date) => {
  const month = date.getMonth();
  return month <= 2;
};
var dateQ2 = (date) => {
  const month = date.getMonth();
  return month > 2 && month <= 5;
};
var dateQ3 = (date) => {
  const month = date.getMonth();
  return month > 5 && month <= 8;
};
var dateQ4 = (date) => {
  const month = date.getMonth();
  return month > 8 && month <= 11;
};
var dateM1 = (date) => {
  return date.getMonth() === 0;
};
var dateM2 = (date) => {
  return date.getMonth() === 1;
};
var dateM3 = (date) => {
  return date.getMonth() === 2;
};
var dateM4 = (date) => {
  return date.getMonth() === 3;
};
var dateM5 = (date) => {
  return date.getMonth() === 4;
};
var dateM6 = (date) => {
  return date.getMonth() === 5;
};
var dateM7 = (date) => {
  return date.getMonth() === 6;
};
var dateM8 = (date) => {
  return date.getMonth() === 7;
};
var dateM9 = (date) => {
  return date.getMonth() === 8;
};
var dateM10 = (date) => {
  return date.getMonth() === 9;
};
var dateM11 = (date) => {
  return date.getMonth() === 10;
};
var dateM12 = (date) => {
  return date.getMonth() === 11;
};
var today = (expectedDate, anchorTime = /* @__PURE__ */ new Date()) => {
  return expectedDate.toDateString() === anchorTime.toDateString();
};
var tomorrow = (date, anchorTime = /* @__PURE__ */ new Date()) => {
  const tomorrow2 = new Date(anchorTime);
  tomorrow2.setDate(tomorrow2.getDate() + 1);
  return date.toDateString() === tomorrow2.toDateString();
};
var yesterday = (date, anchorTime = /* @__PURE__ */ new Date()) => {
  const yesterday2 = new Date(anchorTime);
  yesterday2.setDate(yesterday2.getDate() - 1);
  return date.toDateString() === yesterday2.toDateString();
};
var getWeekStart = (date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(date);
  weekStart.setDate(diff);
  return weekStart;
};
var perWeek = 7 * 24 * 60 * 60 * 1e3;
var thisWeek = (date, anchorTime = /* @__PURE__ */ new Date()) => {
  const weekStart = getWeekStart(date);
  const anchorTimeWeekStart = getWeekStart(anchorTime);
  return weekStart.toDateString() === anchorTimeWeekStart.toDateString();
};
var nextWeek = (date, anchorTime = /* @__PURE__ */ new Date()) => {
  const weekStart = getWeekStart(date);
  const anchorTimeNextWeekStart = new Date(getWeekStart(anchorTime).getTime() + perWeek);
  return weekStart.toDateString() === anchorTimeNextWeekStart.toDateString();
};
var lastWeek = (date, anchorTime = /* @__PURE__ */ new Date()) => {
  const weekStart = getWeekStart(date);
  const anchorTimeLastWeekStart = new Date(getWeekStart(anchorTime).getTime() - perWeek);
  return weekStart.toDateString() === anchorTimeLastWeekStart.toDateString();
};
var thisMonth = (date, anchorTime = /* @__PURE__ */ new Date()) => {
  return date.getFullYear() === anchorTime.getFullYear() && date.getMonth() === anchorTime.getMonth();
};
var getMonthStart = (date) => {
  const monthStart = new Date(date);
  monthStart.setHours(0, 0, 0, 0);
  monthStart.setDate(1);
  return monthStart;
};
var nextMonth = (date, anchorTime = /* @__PURE__ */ new Date()) => {
  const nextMonthStart = new Date(anchorTime);
  nextMonthStart.setHours(0, 0, 0, 0);
  nextMonthStart.setMonth(nextMonthStart.getMonth() + 1, 1);
  const monthEnd = new Date(nextMonthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1, 0);
  const dateTime = date.getTime();
  return dateTime >= nextMonthStart.getTime() && dateTime < monthEnd.getTime();
};
var lastMonth = (date, anchorTime = /* @__PURE__ */ new Date()) => {
  const lastMonthStart = getMonthStart(anchorTime);
  const monthEnd = new Date(lastMonthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1, 0);
  const dateTime = date.getTime();
  return dateTime >= lastMonthStart.getTime() && dateTime < monthEnd.getTime();
};
var getQuarterStart = (date) => {
  const quarterStart = new Date(date);
  quarterStart.setHours(0, 0, 0, 0);
  quarterStart.setDate(1);
  const month = quarterStart.getMonth();
  quarterStart.setMonth(month - month % 3);
  return quarterStart;
};
var thisQuarter = (date, anchorTime = /* @__PURE__ */ new Date()) => {
  const quarterStart = getQuarterStart(anchorTime);
  const nextQuarterStart = new Date(quarterStart);
  nextQuarterStart.setMonth(nextQuarterStart.getMonth() + 3);
  const dateTime = date.getTime();
  return dateTime >= quarterStart.getTime() && dateTime < nextQuarterStart.getTime();
};
var nextQuarter = (date, anchorTime = /* @__PURE__ */ new Date()) => {
  const quarterStart = getQuarterStart(anchorTime);
  const nextQuarterStart = new Date(quarterStart);
  nextQuarterStart.setMonth(nextQuarterStart.getMonth() + 3);
  const nextQuarterEnd = new Date(nextQuarterStart);
  nextQuarterEnd.setMonth(nextQuarterEnd.getMonth() + 3, 0);
  const dateTime = date.getTime();
  return dateTime >= nextQuarterStart.getTime() && dateTime < nextQuarterEnd.getTime();
};
var lastQuarter = (date, anchorTime = /* @__PURE__ */ new Date()) => {
  const quarterStart = getQuarterStart(anchorTime);
  const lastQuarterStart = new Date(quarterStart);
  lastQuarterStart.setMonth(lastQuarterStart.getMonth() - 3);
  const lastQuarterEnd = new Date(quarterStart);
  lastQuarterEnd.setDate(0);
  const dateTime = date.getTime();
  return dateTime >= lastQuarterStart.getTime() && dateTime < lastQuarterEnd.getTime();
};
var thisYear = (date, anchorTime = /* @__PURE__ */ new Date()) => {
  return date.getFullYear() === anchorTime.getFullYear();
};
var nextYear = (date, anchorTime = /* @__PURE__ */ new Date()) => {
  return date.getFullYear() === anchorTime.getFullYear() + 1;
};
var lastYear = (date, anchorTime = /* @__PURE__ */ new Date()) => {
  return date.getFullYear() === anchorTime.getFullYear() - 1;
};
var yearToDate = (date, anchorTime = /* @__PURE__ */ new Date()) => {
  const yearStart = new Date(anchorTime);
  yearStart.setHours(0, 0, 0, 0);
  yearStart.setMonth(0, 1);
  const dateTime = date.getTime();
  return dateTime >= yearStart.getTime() && dateTime < anchorTime.getTime();
};
function getDateFilterExecuteFunc(filterInfo) {
  switch (filterInfo.compareType) {
    case "equal" /* Equal */: {
      const expected = new Date(filterInfo.expectedValue);
      return (date) => date.getTime() === expected.getTime();
    }
    case "notEqual" /* NotEqual */: {
      const expected = new Date(filterInfo.expectedValue);
      return (date) => date.getTime() !== expected.getTime();
    }
    case "after" /* After */: {
      const expected = new Date(filterInfo.expectedValue);
      return (date) => date.getTime() > expected.getTime();
    }
    case "before" /* Before */: {
      const expected = new Date(filterInfo.expectedValue);
      return (date) => date.getTime() < expected.getTime();
    }
    case "afterOrEqual" /* AfterOrEqual */: {
      const expected = new Date(filterInfo.expectedValue);
      return (date) => date.getTime() >= expected.getTime();
    }
    case "beforeOrEqual" /* BeforeOrEqual */: {
      const expected = new Date(filterInfo.expectedValue);
      return (date) => date.getTime() <= expected.getTime();
    }
    case "between" /* Between */:
      return (date) => {
        const [start, end] = filterInfo.expectedValue;
        return date.getTime() >= new Date(start).getTime() && date.getTime() <= new Date(end).getTime();
      };
    case "notBetween" /* NotBetween */:
      return (date) => {
        const [start, end] = filterInfo.expectedValue;
        return date.getTime() < new Date(start).getTime() || date.getTime() > new Date(end).getTime();
      };
    case "today" /* Today */: {
      const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : /* @__PURE__ */ new Date();
      return (date) => today(date, anchorTime);
    }
    case "yesterday" /* Yesterday */: {
      const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : /* @__PURE__ */ new Date();
      return (date) => yesterday(date, anchorTime);
    }
    case "tomorrow" /* Tomorrow */: {
      const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : /* @__PURE__ */ new Date();
      return (date) => tomorrow(date, anchorTime);
    }
    case "thisWeek" /* ThisWeek */: {
      const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : /* @__PURE__ */ new Date();
      return (date) => thisWeek(date, anchorTime);
    }
    case "lastWeek" /* LastWeek */: {
      const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : /* @__PURE__ */ new Date();
      return (date) => lastWeek(date, anchorTime);
    }
    case "nextWeek" /* NextWeek */: {
      const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : /* @__PURE__ */ new Date();
      return (date) => nextWeek(date, anchorTime);
    }
    case "thisMonth" /* ThisMonth */: {
      const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : /* @__PURE__ */ new Date();
      return (date) => thisMonth(date, anchorTime);
    }
    case "lastMonth" /* LastMonth */: {
      const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : /* @__PURE__ */ new Date();
      return (date) => lastMonth(date, anchorTime);
    }
    case "nextMonth" /* NextMonth */: {
      const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : /* @__PURE__ */ new Date();
      return (date) => nextMonth(date, anchorTime);
    }
    case "thisQuarter" /* ThisQuarter */: {
      const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : /* @__PURE__ */ new Date();
      return (date) => thisQuarter(date, anchorTime);
    }
    case "lastQuarter" /* LastQuarter */: {
      const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : /* @__PURE__ */ new Date();
      return (date) => lastQuarter(date, anchorTime);
    }
    case "nextQuarter" /* NextQuarter */: {
      const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : /* @__PURE__ */ new Date();
      return (date) => nextQuarter(date, anchorTime);
    }
    case "thisYear" /* ThisYear */: {
      const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : /* @__PURE__ */ new Date();
      return (date) => thisYear(date, anchorTime);
    }
    case "lastYear" /* LastYear */: {
      const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : /* @__PURE__ */ new Date();
      return (date) => lastYear(date, anchorTime);
    }
    case "nextYear" /* NextYear */: {
      const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : /* @__PURE__ */ new Date();
      return (date) => nextYear(date, anchorTime);
    }
    case "yearToDate" /* YearToDate */: {
      const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : /* @__PURE__ */ new Date();
      return (date) => yearToDate(date, anchorTime);
    }
    case "m1" /* M1 */:
      return dateM1;
    case "m2" /* M2 */:
      return dateM2;
    case "m3" /* M3 */:
      return dateM3;
    case "m4" /* M4 */:
      return dateM4;
    case "m5" /* M5 */:
      return dateM5;
    case "m6" /* M6 */:
      return dateM6;
    case "m7" /* M7 */:
      return dateM7;
    case "m8" /* M8 */:
      return dateM8;
    case "m9" /* M9 */:
      return dateM9;
    case "m10" /* M10 */:
      return dateM10;
    case "m11" /* M11 */:
      return dateM11;
    case "m12" /* M12 */:
      return dateM12;
    case "q1" /* Q1 */:
      return dateQ1;
    case "q2" /* Q2 */:
      return dateQ2;
    case "q3" /* Q3 */:
      return dateQ3;
    case "q4" /* Q4 */:
      return dateQ4;
    default:
      throw new Error("Unsupported compare type");
  }
}

// ../packages/sheets-table/src/model/filter-util/top-n.ts
var Heap = class {
  /**
   * Initializes a new instance of the Heap class.
   */
  constructor() {
    __publicField(this, "heap");
    this.heap = [];
  }
  /**
   * Swaps the elements at the given indices in the heap.
   * @param index1 The index of the first element.
   * @param index2 The index of the second element.
   */
  swap(index1, index2) {
    const temp = this.heap[index1];
    this.heap[index1] = this.heap[index2];
    this.heap[index2] = temp;
  }
  /**
   * Returns the index of the parent node for the given index.
   * @param index The index of the node.
   * @returns The index of the parent node.
   */
  getParentIndex(index) {
    return Math.floor((index - 1) / 2);
  }
  /**
   * Returns the index of the left child node for the given index.
   * @param index The index of the node.
   * @returns The index of the left child node.
   */
  getLeftIndex(index) {
    return index * 2 + 1;
  }
  /**
   * Returns the index of the right child node for the given index.
   * @param index The index of the node.
   * @returns The index of the right child node.
   */
  getRightIndex(index) {
    return index * 2 + 2;
  }
  /**
   * Returns the number of elements in the heap.
   * @returns The number of elements in the heap.
   */
  size() {
    return this.heap.length;
  }
  /**
   * Returns the minimum value in the heap without removing it.
   * @returns The minimum value in the heap.
   */
  peek() {
    return this.heap[0];
  }
  /**
   * @description Returns whether the heap includes the given value.
   * @param {number} value  The value to be checked.
   * @returns {boolean} return true if the heap includes the given value
   */
  include(value) {
    return this.heap.includes(value);
  }
};
var MinHeap = class extends Heap {
  /**
   * Initializes a new instance of the MinHeap class.
   */
  constructor() {
    super();
  }
  /**
   * Moves the element at the given index up the heap until it satisfies the min heap property.
   * @param index The index of the element to be shifted up.
   */
  shiftUp(index) {
    if (index === 0) {
      return;
    }
    const parentIndex = this.getParentIndex(index);
    if (this.heap[parentIndex] > this.heap[index]) {
      this.swap(parentIndex, index);
      this.shiftUp(parentIndex);
    }
  }
  /**
   * Moves the element at the given index down the heap until it satisfies the min heap property.
   * @param index The index of the element to be shifted down.
   */
  shiftDown(index) {
    const leftIndex = this.getLeftIndex(index);
    const rightIndex = this.getRightIndex(index);
    if (this.heap[leftIndex] < this.heap[index]) {
      this.swap(leftIndex, index);
      this.shiftDown(leftIndex);
    }
    if (this.heap[rightIndex] < this.heap[index]) {
      this.swap(rightIndex, index);
      this.shiftDown(rightIndex);
    }
  }
  /**
   * Inserts a new value into the min heap.
   * @param value The value to be inserted.
   */
  insert(value) {
    this.heap.push(value);
    this.shiftUp(this.heap.length - 1);
  }
  /**
   * Removes and returns the minimum value from the min heap.
   */
  pop() {
    this.heap[0] = this.heap.pop();
    this.shiftDown(0);
  }
};
var getLargestK = (list, k) => {
  const minHeap = new MinHeap();
  for (const item of list) {
    minHeap.insert(item);
    if (minHeap.size() > k) {
      minHeap.pop();
    }
  }
  return minHeap.heap;
};

// ../packages/sheets-table/src/model/filter-util/number-filter-util.ts
var above = (value, average) => {
  return value > average;
};
var below = (value, average) => {
  return value < average;
};
var getTopN = (list, top, expectedValue) => {
  const heap = getLargestK(list, top);
  return heap.includes(expectedValue);
};
function getNumberFilterExecuteFunc(filter2, calculatedOptions) {
  switch (filter2.compareType) {
    case "equal" /* Equal */: {
      const expectedValue = Number(filter2.expectedValue);
      return (value) => value === expectedValue;
    }
    case "notEqual" /* NotEqual */: {
      const expectedValue = Number(filter2.expectedValue);
      return (value) => value !== expectedValue;
    }
    case "greaterThan" /* GreaterThan */: {
      const expectedValue = Number(filter2.expectedValue);
      return (value) => value > expectedValue;
    }
    case "greaterThanOrEqual" /* GreaterThanOrEqual */: {
      const expectedValue = Number(filter2.expectedValue);
      return (value) => value >= expectedValue;
    }
    case "lessThan" /* LessThan */: {
      const expectedValue = Number(filter2.expectedValue);
      return (value) => value < expectedValue;
    }
    case "lessThanOrEqual" /* LessThanOrEqual */: {
      const expectedValue = Number(filter2.expectedValue);
      return (value) => value <= expectedValue;
    }
    case "between" /* Between */: {
      const [min, max] = filter2.expectedValue;
      const minValue = Number(min);
      const maxValue = Number(max);
      if (minValue > maxValue) {
        return (value) => value >= maxValue && value <= minValue;
      }
      return (value) => value >= minValue && value <= maxValue;
    }
    case "notBetween" /* NotBetween */: {
      const [min, max] = filter2.expectedValue;
      const minValue = Number(min);
      const maxValue = Number(max);
      if (minValue > maxValue) {
        return (value) => value < maxValue || value > minValue;
      }
      return (value) => value < minValue || value > maxValue;
    }
    case "above" /* Above */: {
      const average = calculatedOptions.average;
      return (value) => above(value, average);
    }
    case "below" /* Below */: {
      const average = calculatedOptions.average;
      return (value) => below(value, average);
    }
    case "topN" /* TopN */: {
      const list = calculatedOptions.list;
      const top = Number(filter2.expectedValue);
      return (value) => getTopN(list, top, value);
    }
  }
}

// ../packages/sheets-table/src/model/filter-util/text-filter-util.ts
var textEqual = (compareValue, expectedValue) => {
  const regex = createREGEXFromWildChar(expectedValue);
  return regex.test(compareValue);
};
var textNotEqual = (compareValue, expectedValue) => {
  const regex = createREGEXFromWildChar(expectedValue);
  return !regex.test(compareValue);
};
var textContain = (compareValue, expectedValue) => {
  const regex = createREGEXFromWildChar(`*${expectedValue}*`);
  return regex.test(compareValue);
};
var textNotContain = (compareValue, expectedValue) => {
  const regex = createREGEXFromWildChar(`*${expectedValue}*`);
  return !regex.test(compareValue);
};
var textStartWith = (compareValue, expectedValue) => {
  const regex = createREGEXFromWildChar(`${expectedValue}*`);
  return regex.test(compareValue);
};
var textEndWith = (compareValue, expectedValue) => {
  const regex = createREGEXFromWildChar(`*${expectedValue}`);
  return regex.test(compareValue);
};
function getTextFilterExecuteFunc(filter2) {
  switch (filter2.compareType) {
    case "equal" /* Equal */:
      return (value) => textEqual(value, filter2.expectedValue);
    case "notEqual" /* NotEqual */:
      return (value) => textNotEqual(value, filter2.expectedValue);
    case "contains" /* Contains */:
      return (value) => textContain(value, filter2.expectedValue);
    case "notContains" /* NotContains */:
      return (value) => textNotContain(value, filter2.expectedValue);
    case "startsWith" /* StartsWith */:
      return (value) => textStartWith(value, filter2.expectedValue);
    case "endsWith" /* EndsWith */:
      return (value) => textEndWith(value, filter2.expectedValue);
    default:
      console.error(`Unknown filter operator: ${filter2.compareType}`);
      return (value) => true;
  }
}

// ../packages/sheets-table/src/model/filter-util/condition.ts
var NumberDynamicFilterCompareTypeSet = /* @__PURE__ */ new Set([
  "above" /* Above */,
  "below" /* Below */,
  "topN" /* TopN */
]);
var DateDynamicFilterCompareTypeSet = /* @__PURE__ */ new Set([
  "today" /* Today */,
  "yesterday" /* Yesterday */,
  "tomorrow" /* Tomorrow */,
  "thisWeek" /* ThisWeek */,
  "lastWeek" /* LastWeek */,
  "nextWeek" /* NextWeek */,
  "thisMonth" /* ThisMonth */,
  "lastMonth" /* LastMonth */,
  "nextMonth" /* NextMonth */,
  "thisQuarter" /* ThisQuarter */,
  "lastQuarter" /* LastQuarter */,
  "nextQuarter" /* NextQuarter */,
  "nextYear" /* NextYear */,
  "thisYear" /* ThisYear */,
  "lastYear" /* LastYear */,
  "yearToDate" /* YearToDate */
]);
function isNumberDynamicFilter(compareType) {
  return NumberDynamicFilterCompareTypeSet.has(compareType);
}
function getConditionExecuteFunc(filter2, calculatedOptions) {
  if (isNumberDynamicFilter(filter2.filterInfo.compareType)) {
    return (value) => true;
  } else {
    switch (filter2.filterInfo.conditionType) {
      case "date" /* Date */:
        return getDateFilterExecuteFunc(filter2.filterInfo);
      case "number" /* Number */:
        return getNumberFilterExecuteFunc(filter2.filterInfo, calculatedOptions);
      case "string" /* String */:
        return getTextFilterExecuteFunc(filter2.filterInfo);
      case "logic" /* Logic */:
      default:
        return (value) => true;
    }
  }
}
function getCellValueWithConditionType(sheet, row, col, conditionType) {
  switch (conditionType) {
    case "date" /* Date */: {
      const dateNumber = getNumberCellValue(sheet, row, col);
      return dateNumber ? excelSerialToDateTime(dateNumber) : null;
    }
    case "number" /* Number */:
      return getNumberCellValue(sheet, row, col);
    case "string" /* String */:
    default:
      return getStringCellValue(sheet, row, col);
  }
}
var getStringFromDataStream2 = (data) => {
  var _a;
  const dataStream = ((_a = data.body) == null ? void 0 : _a.dataStream.replace(/\r\n$/, "")) || "";
  return dataStream;
};
function getStringCellValue(sheet, row, col) {
  const cellData = sheet.getCell(row, col);
  if (!cellData) return null;
  const { v, t, p } = cellData;
  if (p) {
    return getStringFromDataStream2(p);
  }
  if (typeof v === "string") {
    if (t === 3 /* BOOLEAN */) return v.toUpperCase();
    return v;
  }
  ;
  if (typeof v === "number") {
    if (t === 3 /* BOOLEAN */) return v ? "TRUE" : "FALSE";
    return v;
  }
  ;
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (v === void 0) {
    return void 0;
  }
  return String(v);
}
function getNumberCellValue(sheet, row, col) {
  const cellData = sheet.getCell(row, col);
  if (!cellData) return null;
  const { v, t, p } = cellData;
  if (p) {
    return null;
  }
  if (typeof v === "string" && t === 2 /* NUMBER */) {
    return Number(sheet.getCellRaw(row, col).v);
  }
  return Number(v);
}
function excelSerialToDateTime(serial) {
  const baseDate = new Date(Date.UTC(1900, 0, 1, 0, 0, 0));
  const leapDayDate = new Date(Date.UTC(1900, 1, 28, 0, 0, 0));
  let dayDifference = serial - 1;
  if (dayDifference > (leapDayDate.getTime() - baseDate.getTime()) / (1e3 * 3600 * 24)) {
    dayDifference -= 1;
  }
  if (dayDifference < 0) {
    dayDifference = serial;
  }
  const resultDate = new Date(baseDate.getTime() + dayDifference * (1e3 * 3600 * 24));
  return resultDate;
}

// ../packages/sheets-table/src/model/table-filter.ts
var TableFilters = class {
  constructor() {
    __publicField(this, "_tableColumnFilterList");
    __publicField(this, "_tableSortInfo");
    __publicField(this, "_filterOutRows");
    this._tableColumnFilterList = [];
  }
  setColumnFilter(columnIndex, filter2) {
    if (!filter2) {
      this._tableColumnFilterList[columnIndex] = void 0;
    } else {
      this._tableColumnFilterList[columnIndex] = filter2;
    }
  }
  setSortState(columnIndex, sortState) {
    this._tableSortInfo = { columnIndex, sortState };
  }
  getColumnFilter(columnIndex) {
    return this._tableColumnFilterList[columnIndex];
  }
  getFilterState(columnIndex) {
    var _a;
    const sortState = ((_a = this._tableSortInfo) == null ? void 0 : _a.columnIndex) === columnIndex ? this._tableSortInfo.sortState : "none" /* None */;
    return getTableFilterState(this._tableColumnFilterList[columnIndex], sortState);
  }
  getSortState() {
    var _a;
    return (_a = this._tableSortInfo) != null ? _a : {};
  }
  getFilterStates(range) {
    const states = [];
    const { startColumn, endColumn } = range;
    for (let i = startColumn; i <= endColumn; i++) {
      states.push(this.getFilterState(i - startColumn));
    }
    return states;
  }
  getFilterOutRows() {
    return this._filterOutRows;
  }
  doFilter(sheet, range) {
    const filterOutRows = /* @__PURE__ */ new Set();
    const tableColumnFilterList = this._tableColumnFilterList;
    for (let i = 0; i < tableColumnFilterList.length; i++) {
      const filter2 = tableColumnFilterList[i];
      if (filter2) {
        this.doColumnFilter(sheet, range, i, filterOutRows);
      }
    }
    this._filterOutRows = filterOutRows;
    return filterOutRows;
  }
  doColumnFilter(sheet, range, columnIndex, filterOutRows) {
    const filter2 = this._tableColumnFilterList[columnIndex];
    if (filter2 && sheet) {
      const { startRow, endRow, startColumn } = range;
      const column = startColumn + columnIndex;
      const executeFunc = this.getExecuteFunc(sheet, range, columnIndex, filter2);
      for (let row = startRow; row <= endRow; row++) {
        const conditionType = isConditionFilter(filter2) ? filter2.filterInfo.conditionType : "string" /* String */;
        const cellValue = getCellValueWithConditionType(sheet, row, column, conditionType);
        if (cellValue === null && !executeFunc(cellValue)) {
          filterOutRows.add(row);
        } else if (!executeFunc(getCellValueWithConditionType(sheet, row, column, conditionType))) {
          filterOutRows.add(row);
        }
      }
    }
  }
  _getNumberCalculatedOptions(sheet, range, columnIndex) {
    const { startRow, endRow, startColumn } = range;
    const column = startColumn + columnIndex;
    const list = [];
    let count = 0;
    let sum = 0;
    for (let row = startRow; row <= endRow; row++) {
      const val = getCellValueWithConditionType(sheet, row, column, "number" /* Number */);
      if (val !== null) {
        list.push(val);
        count++;
        sum += val;
      }
    }
    return {
      list,
      average: count > 0 ? sum / count : 0
    };
  }
  getExecuteFunc(sheet, range, columnIndex, filter2) {
    if (filter2.filterType === "manual" /* manual */) {
      const valuesSet = new Set(filter2.values);
      return (value) => {
        if (value == null) {
          return valuesSet.has(TABLE_FILTER_EMPTY_VALUE);
        }
        return valuesSet.has(value);
      };
    } else if (filter2.filterType === "condition" /* condition */) {
      const isDynamic = isNumberDynamicFilter(filter2.filterInfo.compareType);
      const calculatedOptions = isDynamic ? this._getNumberCalculatedOptions(sheet, range, columnIndex) : void 0;
      return getConditionExecuteFunc(filter2, calculatedOptions);
    } else {
      return (value) => {
        return true;
      };
    }
  }
  toJSON() {
    return {
      tableColumnFilterList: this._tableColumnFilterList,
      tableSortInfo: this._tableSortInfo
    };
  }
  fromJSON(json) {
    var _a;
    this._tableColumnFilterList = (_a = json.tableColumnFilterList) != null ? _a : [];
    if (json.tableSortInfo) {
      this._tableSortInfo = json.tableSortInfo;
    }
  }
  dispose() {
    this._tableColumnFilterList = [];
  }
};

// ../packages/sheets-table/src/model/table.ts
var Table = class {
  constructor(id, name, range, header, options = {}) {
    __publicField(this, "_id");
    __publicField(this, "_name");
    /**
     * @property {string} tableStyleId The table style id. If the property is empty, the default style will be used.
     */
    __publicField(this, "_tableStyleId");
    __publicField(this, "_showHeader");
    __publicField(this, "_showFooter");
    __publicField(this, "_range");
    __publicField(this, "_columns", /* @__PURE__ */ new Map());
    __publicField(this, "_columnOrder", []);
    __publicField(this, "tableMeta");
    __publicField(this, "_tableFilters");
    __publicField(this, "_subUnitId");
    this._id = id;
    this._range = range;
    this._name = name;
    this._tableFilters = new TableFilters();
    this._init(header, options);
  }
  _init(header, options) {
    var _a, _b;
    this._tableStyleId = options == null ? void 0 : options.tableStyleId;
    this._showHeader = (_a = options == null ? void 0 : options.showHeader) != null ? _a : true;
    this._showFooter = false;
    const range = this.getRange();
    const startColumn = range.startColumn;
    const endColumn = range.endColumn;
    for (let i = startColumn; i <= endColumn; i++) {
      const index = i - startColumn;
      let id;
      let columnName;
      if ((_b = options.columns) == null ? void 0 : _b[index]) {
        id = options.columns[index].id;
        columnName = options.columns[index].displayName;
      } else {
        id = generateRandomId();
        columnName = header[i - startColumn];
      }
      const column = new TableColumn(id, columnName);
      this._columns.set(id, column);
      this._columnOrder.push(id);
    }
    if (options.filters) {
      const filters = options.filters;
      filters.forEach((filter2, index) => {
        if (filter2) {
          this._tableFilters.setColumnFilter(index, filter2);
        }
      });
    }
  }
  setTableFilterColumn(columnIndex, filter2) {
    this._tableFilters.setColumnFilter(columnIndex, filter2);
  }
  getTableFilterColumn(columnIndex) {
    return this._tableFilters.getColumnFilter(columnIndex);
  }
  getTableFilters() {
    return this._tableFilters;
  }
  getTableFilterRange() {
    const tableRange = this.getRange();
    const showHeader = this.isShowHeader();
    const isShowFooter = this.isShowFooter();
    const { startRow, startColumn, endRow, endColumn } = tableRange;
    const start = showHeader ? startRow + 1 : startRow;
    const end = isShowFooter ? endRow - 1 : endRow;
    return {
      startRow: start,
      startColumn,
      endRow: end,
      endColumn
    };
  }
  setColumns(columns) {
    this._columns.clear();
    this._columnOrder = [];
    columns.forEach((columnJson) => {
      const column = new TableColumn(columnJson.id, columnJson.displayName);
      column.fromJSON(columnJson);
      this._columns.set(columnJson.id, column);
      this._columnOrder.push(columnJson.id);
    });
  }
  getColumnsCount() {
    return this._columnOrder.length;
  }
  insertColumn(index, column) {
    const columnId = column.id;
    this._columns.set(columnId, column);
    this._columnOrder.splice(index, 0, columnId);
  }
  removeColumn(index) {
    const columnId = this._columnOrder[index];
    this._columns.delete(columnId);
    this._columnOrder.splice(index, 1);
  }
  setTableMeta(meta) {
    this.tableMeta = meta;
  }
  getTableMeta() {
    return this.tableMeta;
  }
  getColumn(columnId) {
    return this._columns.get(columnId);
  }
  getTableColumnByIndex(index) {
    const id = this._columnOrder[index];
    return this.getColumn(id);
  }
  getColumnNameByIndex(index) {
    var _a;
    const id = this._columnOrder[index];
    return ((_a = this.getColumn(id)) == null ? void 0 : _a.getDisplayName()) || "";
  }
  getId() {
    return this._id;
  }
  getRangeInfo() {
    return {
      ...this._range
    };
  }
  getRange() {
    return { ...this._range };
  }
  setRange(range) {
    this._range = range;
  }
  setDisplayName(name) {
    this._name = name;
  }
  getDisplayName() {
    return this._name;
  }
  getSubunitId() {
    return this._subUnitId;
  }
  setSubunitId(subUnitId) {
    this._subUnitId = subUnitId;
  }
  getTableStyleId() {
    var _a;
    return (_a = this._tableStyleId) != null ? _a : tableThemeConfig[0].name;
  }
  setTableStyleId(tableStyleId) {
    this._tableStyleId = tableStyleId;
  }
  isShowHeader() {
    var _a;
    return (_a = this._showHeader) != null ? _a : true;
  }
  setShowHeader(showHeader) {
    this._showHeader = showHeader;
  }
  isShowFooter() {
    var _a;
    return (_a = this._showFooter) != null ? _a : false;
  }
  getTableInfo() {
    return {
      id: this._id,
      subUnitId: this._subUnitId,
      name: this._name,
      range: this.getRangeInfo(),
      meta: this.tableMeta,
      showHeader: this._showHeader,
      columns: this._columnOrder.map((columnId) => this._columns.get(columnId).toJSON())
    };
  }
  getTableConfig() {
    return {
      name: this.getDisplayName(),
      range: this.getRangeInfo(),
      options: {
        showHeader: this._showHeader,
        showFooter: this._showFooter
      },
      tableStyleId: this._tableStyleId
    };
  }
  getFilterStates(range) {
    return this._tableFilters.getFilterStates(range);
  }
  toJSON() {
    const columns = [];
    this._columns.forEach((column) => {
      columns.push(column.toJSON());
    });
    return {
      id: this._id,
      name: this._name,
      range: this.getRangeInfo(),
      options: {
        showHeader: this._showHeader,
        showFooter: this._showFooter,
        tableStyleId: this._tableStyleId
      },
      // TODO: support filter
      filters: this._tableFilters.toJSON(),
      columns,
      meta: this.tableMeta
    };
  }
  fromJSON(json) {
    var _a, _b;
    this._id = json.id;
    this._name = json.name;
    this._range = json.range;
    this.tableMeta = json.meta;
    this._tableStyleId = json.options.tableStyleId || "";
    this._showHeader = (_a = json.options.showHeader) != null ? _a : true;
    this._showFooter = (_b = json.options.showFooter) != null ? _b : true;
    const columns = json.columns;
    columns.forEach((column) => {
      const tableColumn = new TableColumn(column.id, column.displayName);
      tableColumn.fromJSON(column);
      this._columns.set(column.id, tableColumn);
      this._columnOrder.push(column.id);
    });
    this._tableFilters = new TableFilters();
    this._tableFilters.fromJSON(json.filters);
  }
  dispose() {
    this._id = "";
    this._name = "";
    this._tableStyleId = "";
    this._showHeader = true;
    this._showFooter = true;
    delete this._range;
    this._columns.clear();
    this._columnOrder = [];
  }
};

// ../packages/sheets-table/src/model/table-manager.ts
var TableManager = class extends Disposable {
  constructor(_univerInstanceService, _localeService) {
    super();
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_tableMap");
    __publicField(this, "_tableAdd$", new Subject());
    __publicField(this, "tableAdd$", this._tableAdd$.asObservable());
    __publicField(this, "_tableDelete$", new Subject());
    __publicField(this, "tableDelete$", this._tableDelete$.asObservable());
    __publicField(this, "_tableNameChanged$", new Subject());
    __publicField(this, "tableNameChanged$", this._tableNameChanged$.asObservable());
    __publicField(this, "_tableRangeChanged$", new Subject());
    __publicField(this, "tableRangeChanged$", this._tableRangeChanged$.asObservable());
    __publicField(this, "_tableThemeChanged$", new Subject());
    __publicField(this, "tableThemeChanged$", this._tableThemeChanged$.asObservable());
    __publicField(this, "_tableFilterChanged$", new Subject());
    __publicField(this, "tableFilterChanged$", this._tableFilterChanged$.asObservable());
    __publicField(this, "_tableInitStatus", new BehaviorSubject(false));
    __publicField(this, "tableInitStatus$", this._tableInitStatus.asObservable());
    this._tableMap = /* @__PURE__ */ new Map();
  }
  _ensureUnit(unitId) {
    if (!this._tableMap.has(unitId)) {
      this._tableMap.set(unitId, /* @__PURE__ */ new Map());
    }
    return this._tableMap.get(unitId);
  }
  getColumnHeader(unitId, subUnitId, range, prefixText) {
    var _a;
    const worksheet = (_a = this._univerInstanceService.getUnit(unitId)) == null ? void 0 : _a.getSheetBySheetId(subUnitId);
    const { startRow, startColumn, endColumn } = range;
    const header = [];
    const columnText = prefixText != null ? prefixText : "Column";
    for (let i = startColumn; i <= endColumn; i++) {
      header.push(convertCellDataToString(worksheet == null ? void 0 : worksheet.getCell(startRow, i)) || getColumnName(i - startColumn + 1, columnText));
    }
    return header;
  }
  /**
   * Add a table to univer.
   * @param {string} unitId The unit id of the table.
   * @param {string} subUnitId The subunit id of the table.
   * @param {string} name The table name, it should be unique in the unit or it will be appended with a number.
   * @param {ITableRange} range The range of the table, it contains the unit id and subunit id.
   * @param {string[]} [header] The header of the table, if not provided, it will be generated based on the range.
   * @param {string} [initId] The initial id of the table, if not provided, a random id will be generated.
   * @param {ITableOptions} [options] Other options of the table.
   * @returns {string} The table id.
   */
  addTable(unitId, subUnitId, name, range, header, initId, options) {
    var _a;
    const id = initId != null ? initId : generateRandomId();
    const tableHeader = header || this.getColumnHeader(unitId, subUnitId, range);
    const table = new Table(id, name, range, tableHeader, options);
    table.setSubunitId(subUnitId);
    const unitMap = this._ensureUnit(unitId);
    unitMap.set(id, table);
    this._tableAdd$.next({
      unitId,
      subUnitId,
      range,
      tableName: name,
      tableId: id,
      tableStyleId: options == null ? void 0 : options.tableStyleId
    });
    if (options == null ? void 0 : options.filters) {
      const worksheet = (_a = this._univerInstanceService.getUnit(unitId)) == null ? void 0 : _a.getSheetBySheetId(subUnitId);
      table.getTableFilters().doFilter(worksheet, range);
      this._tableFilterChanged$.next({
        unitId,
        subUnitId,
        tableId: id
      });
    }
    return id;
  }
  addFilter(unitId, tableId, column, filter2) {
    const table = this.getTable(unitId, tableId);
    if (table) {
      const tableFilter = table.getTableFilters();
      tableFilter.setColumnFilter(column, filter2);
      const subUnitId = table.getSubunitId();
      this._tableFilterChanged$.next({
        unitId,
        subUnitId,
        tableId
      });
    }
  }
  getFilterRanges(unitId, subUnitId) {
    const unitMap = this._tableMap.get(unitId);
    if (!unitMap) {
      return [];
    }
    const filterRanges = [];
    unitMap.forEach((table) => {
      if (table.getSubunitId() === subUnitId && table.isShowHeader()) {
        filterRanges.push(table.getRange());
      }
    });
    return filterRanges;
  }
  getSheetFilterRangeWithState(unitId, subUnitId) {
    const unitMap = this._tableMap.get(unitId);
    if (!unitMap) {
      return [];
    }
    const filterRanges = [];
    unitMap.forEach((table) => {
      if (table.getSubunitId() === subUnitId && table.isShowHeader()) {
        filterRanges.push({
          tableId: table.getId(),
          range: table.getRange(),
          states: table.getFilterStates(table.getRange())
        });
      }
    });
    return filterRanges;
  }
  getTable(unitId, tableId) {
    const unitMap = this._tableMap.get(unitId);
    if (!unitMap) {
      return void 0;
    }
    return unitMap.get(tableId);
  }
  /**
   * Get the unique table name, in excel, the table name should be unique because it is used as a reference.
   * @param {string} unitId The unit id of the table.
   * @param {string} baseName The base name of the table.
   * @returns {string} The unique table name
   */
  getUniqueTableName(unitId, baseName) {
    const unitMap = this._tableMap.get(unitId);
    if (!unitMap) {
      return baseName;
    }
    const tableNamesSet = new Set(Array.from(unitMap.values()).map((table) => table.getDisplayName()));
    let newName = baseName;
    let count = 1;
    while (tableNamesSet.has(newName)) {
      newName = `${baseName}-${count}`;
      count++;
    }
    return newName;
  }
  /**
   * Get table by unit id and table id.
   * @param {string} unitId  The unit id of the table.
   * @param {string} tableId The table id.
   * @returns {Table} The table.
   */
  getTableById(unitId, tableId) {
    return this.getTable(unitId, tableId);
  }
  getTableList(unitId) {
    const unitMap = this._tableMap.get(unitId);
    if (!unitMap) {
      return [];
    }
    return Array.from(unitMap.values()).map((table) => {
      return { ...table.getTableInfo(), unitId };
    });
  }
  /**
   * Get the table list by unit id and subunit id.
   * @param {string} unitId The unit id of the table.
   * @param {string} subUnitId The subunit id of the table.
   * @returns {Table[]} The table list.
   */
  getTablesBySubunitId(unitId, subUnitId) {
    const unitMap = this._tableMap.get(unitId);
    if (!unitMap) {
      return [];
    }
    return Array.from(unitMap.values()).filter((table) => table.getSubunitId() === subUnitId);
  }
  getTablesInfoBySubunitId(unitId, subUnitId) {
    return this.getTablesBySubunitId(unitId, subUnitId).map((table) => {
      return {
        id: table.getId(),
        name: table.getDisplayName(),
        range: table.getRange()
      };
    });
  }
  deleteTable(unitId, tableId) {
    const unitMap = this._tableMap.get(unitId);
    const table = unitMap == null ? void 0 : unitMap.get(tableId);
    if (table) {
      const tableInfo = table.getTableInfo();
      const tableStyleId = table.getTableStyleId();
      unitMap == null ? void 0 : unitMap.delete(tableId);
      const { subUnitId, range, name } = tableInfo;
      this._tableDelete$.next({
        unitId,
        subUnitId,
        tableId,
        range,
        tableName: name,
        tableStyleId
      });
    }
  }
  operationTableRowCol(unitId, tableId, config) {
    const table = this.getTableById(unitId, tableId);
    if (!table) return;
    const { operationType, rowColType, index, count, columnsJson } = config;
    const oldRange = table.getRange();
    const newRange = { ...oldRange };
    if (operationType === "insert" /* Insert */) {
      if (rowColType === "row") {
        newRange.endRow += count;
      } else if (rowColType === "column") {
        newRange.endColumn += count;
        for (let i = 0; i < count; i++) {
          const columnPrefix = this._localeService.t("sheets-table.columnPrefix");
          const column = new TableColumn(generateRandomId(), getColumnName(table.getColumnsCount() + 1 + i, columnPrefix));
          if (columnsJson == null ? void 0 : columnsJson[i]) {
            column.fromJSON(columnsJson[i]);
          }
          const columnIndex = index + i - oldRange.startColumn;
          table.insertColumn(columnIndex, column);
        }
      }
    } else {
      if (rowColType === "row") {
        newRange.endRow -= count;
      } else if (rowColType === "column") {
        newRange.endColumn -= count;
        for (let i = count - 1; i >= 0; i--) {
          const columnIndex = index + i - oldRange.startColumn;
          table.removeColumn(columnIndex);
        }
      }
    }
    table.setRange(newRange);
    this._tableRangeChanged$.next({
      unitId,
      subUnitId: table.getSubunitId(),
      tableId,
      range: newRange,
      oldRange
    });
  }
  updateTableRange(unitId, tableId, config) {
    const table = this.getTableById(unitId, tableId);
    if (!table) return;
    const oldRange = table.getRange();
    const newRange = config.newRange;
    if (newRange.startColumn < oldRange.startColumn) {
      const diff = oldRange.startColumn - newRange.startColumn;
      const columnPrefix = this._localeService.t("sheets-table.columnPrefix");
      for (let i = 0; i < diff; i++) {
        table.insertColumn(oldRange.startColumn, new TableColumn(generateRandomId(), getColumnName(table.getColumnsCount() + 1, columnPrefix)));
      }
    } else if (newRange.startColumn > oldRange.startColumn) {
      const diff = newRange.startColumn - oldRange.startColumn;
      for (let i = diff - 1; i >= 0; i--) {
        const columnIndex = newRange.startColumn + i - oldRange.startColumn;
        table.removeColumn(columnIndex);
      }
    }
    if (newRange.endColumn < oldRange.endColumn) {
      const diff = oldRange.endColumn - newRange.endColumn;
      for (let i = diff - 1; i >= 0; i--) {
        const columnIndex = newRange.endColumn + i - oldRange.startColumn;
        table.removeColumn(columnIndex);
      }
    } else if (newRange.endColumn > oldRange.endColumn) {
      const diff = newRange.endColumn - oldRange.endColumn;
      const columnPrefix = this._localeService.t("sheets-table.columnPrefix");
      for (let i = 0; i < diff; i++) {
        table.insertColumn(oldRange.endColumn, new TableColumn(generateRandomId(), getColumnName(table.getColumnsCount() + 1, columnPrefix)));
      }
    }
    table.setRange(newRange);
    this._tableRangeChanged$.next({
      unitId,
      subUnitId: table.getSubunitId(),
      tableId,
      range: newRange,
      oldRange
    });
  }
  setTableByConfig(unitId, tableId, config) {
    var _a;
    const unitMap = this._tableMap.get(unitId);
    const table = unitMap == null ? void 0 : unitMap.get(tableId);
    if (!table) return;
    const subUnitId = table.getSubunitId();
    const { name, updateRange, rowColOperation, theme, options } = config;
    if (name) {
      const oldTableName = table.getDisplayName();
      table.setDisplayName(name);
      this._tableNameChanged$.next({
        unitId,
        subUnitId,
        tableId,
        tableName: name,
        oldTableName
      });
    }
    if (rowColOperation) {
      this.operationTableRowCol(unitId, tableId, rowColOperation);
    }
    if (updateRange) {
      this.updateTableRange(unitId, tableId, updateRange);
    }
    if (theme) {
      const oldTheme = (_a = table.getTableStyleId()) != null ? _a : "default";
      table.setTableStyleId(theme);
      this._tableThemeChanged$.next({
        unitId,
        subUnitId,
        tableId,
        theme,
        oldTheme
      });
    }
    if (options) {
      if (options.showHeader !== void 0) {
        table.setShowHeader(options.showHeader);
      }
    }
  }
  toJSON(unitId) {
    const result = {};
    const unitMap = this._tableMap.get(unitId);
    if (unitMap) {
      unitMap.forEach((table) => {
        const subUnitId = table.getSubunitId();
        if (!result[subUnitId]) {
          const tableFilteredOutRows = /* @__PURE__ */ new Set();
          const tables = this.getTablesBySubunitId(unitId, subUnitId);
          tables.forEach((table2) => {
            const tableFilteredRows = table2.getTableFilters().getFilterOutRows();
            if (!tableFilteredRows) {
              return;
            }
            for (const row of tableFilteredRows) {
              tableFilteredOutRows.add(row);
            }
          });
          result[subUnitId] = {
            tables: [],
            tableFilteredOutRows: Array.from(tableFilteredOutRows)
          };
        }
        result[subUnitId].tables.push(table.toJSON());
      });
    }
    return result;
  }
  fromJSON(unitId, data) {
    const unitMap = this._ensureUnit(unitId);
    const subUnitIds = Object.keys(data);
    subUnitIds.forEach((subUnitId) => {
      const target = getSheetCommandTarget(this._univerInstanceService, { unitId, subUnitId });
      if (!target) {
        return;
      }
      const sheet = target.worksheet;
      let tables;
      if (data[subUnitId].tables) {
        tables = data[subUnitId].tables;
      } else if (Array.isArray(data[subUnitId])) {
        tables = data[subUnitId];
      }
      if (!tables) {
        return;
      }
      tables.forEach((table) => {
        const header = this.getColumnHeader(unitId, subUnitId, table.range);
        const tableInstance = new Table(table.id, table.name, table.range, header, table.options);
        tableInstance.setTableMeta(table.meta);
        if (table.columns.length) {
          tableInstance.setColumns(table.columns);
        }
        if (table.filters) {
          const tableFilter = tableInstance.getTableFilters();
          tableFilter.fromJSON(table.filters);
          tableFilter.doFilter(sheet, tableInstance.getTableFilterRange());
        }
        tableInstance.setSubunitId(subUnitId);
        unitMap.set(table.id, tableInstance);
        this._tableAdd$.next({
          unitId,
          subUnitId,
          range: table.range,
          tableName: table.name,
          tableId: table.id
        });
      });
    });
    this._tableInitStatus.next(true);
  }
  deleteUnitId(unitId) {
    const unitMap = this._tableMap.get(unitId);
    if (unitMap) {
      unitMap.forEach((table) => table.dispose());
    }
    this._tableMap.delete(unitId);
  }
  dispose() {
    super.dispose();
    this._tableAdd$.complete();
    this._tableDelete$.complete();
    this._tableNameChanged$.complete();
    this._tableRangeChanged$.complete();
    this._tableThemeChanged$.complete();
    this._tableFilterChanged$.complete();
    this._tableInitStatus.complete();
    this._tableMap.forEach((unitMap) => {
      unitMap.forEach((table) => table.dispose());
      unitMap.clear();
    });
    this._tableMap.clear();
  }
};
TableManager = __decorateClass([
  __decorateParam(0, IUniverInstanceService),
  __decorateParam(1, Inject(LocaleService))
], TableManager);

// ../packages/sheets-table/src/services/table.service.ts
var SheetTableService = class extends Disposable {
  constructor(_tableManager) {
    super();
    __publicField(this, "_tableManager", _tableManager);
  }
  getTableInfo(unitId, tableId) {
    const table = this._tableManager.getTable(unitId, tableId);
    if (!table) {
      return;
    }
    return {
      unitId,
      ...table.getTableInfo()
    };
  }
  getTableList(unitId) {
    return this._tableManager.getTableList(unitId);
  }
  addTable(unitId, subUnitId, tableName, rangeInfo, tableHeader, tableId, options) {
    return this._tableManager.addTable(unitId, subUnitId, tableName, rangeInfo, tableHeader, tableId, options);
  }
  deleteTable(unitId, subUnitId, tableId) {
    this._tableManager.deleteTable(unitId, tableId);
  }
  getTableMeta(unitId, tableId) {
    var _a;
    return (_a = this._tableManager.getTable(unitId, tableId)) == null ? void 0 : _a.getTableMeta();
  }
  setTableMeta(unitId, tableId, meta) {
    var _a;
    (_a = this._tableManager.getTable(unitId, tableId)) == null ? void 0 : _a.setTableMeta(meta);
  }
  getTableColumnMeta(unitId, tableId, index) {
    var _a, _b;
    return (_b = (_a = this._tableManager.getTable(unitId, tableId)) == null ? void 0 : _a.getTableColumnByIndex(index)) == null ? void 0 : _b.getMeta();
  }
  selTableColumnMeta(unitId, tableId, index, meta) {
    var _a, _b;
    (_b = (_a = this._tableManager.getTable(unitId, tableId)) == null ? void 0 : _a.getTableColumnByIndex(index)) == null ? void 0 : _b.setMeta(meta);
  }
  addFilter(unitId, tableId, column, filter2) {
    this._tableManager.addFilter(unitId, tableId, column, filter2);
  }
  getCellValueWithConditionType(sheet, row, col, conditionType = "string" /* String */) {
    return getCellValueWithConditionType(sheet, row, col, conditionType);
  }
};
SheetTableService = __decorateClass([
  __decorateParam(0, Inject(TableManager))
], SheetTableService);

// ../packages/sheets-table/src/commands/mutations/add-sheet-table.mutation.ts
var AddSheetTableMutation = {
  id: "sheet.mutation.add-table",
  type: 2 /* MUTATION */,
  handler: (accessor, params) => {
    const { tableId, unitId, subUnitId, name, range, header, options } = params;
    const sheetTableService = accessor.get(SheetTableService);
    sheetTableService.addTable(unitId, subUnitId, name, range, header, tableId, options);
    return true;
  }
};

// ../packages/sheets-table/src/commands/mutations/delete-sheet-table.mutation.ts
var DeleteSheetTableMutation = {
  id: "sheet.mutation.delete-table",
  type: 2 /* MUTATION */,
  handler: (accessor, params) => {
    const { unitId, subUnitId, tableId } = params;
    const sheetTableService = accessor.get(SheetTableService);
    sheetTableService.deleteTable(unitId, subUnitId, tableId);
    return true;
  }
};

// ../packages/sheets-table/src/commands/commands/add-sheet-table.command.ts
var AddSheetTableCommand = {
  id: "sheet.command.add-table",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    var _a;
    if (!params) {
      return false;
    }
    const undoRedoService = accessor.get(IUndoRedoService);
    const commandService = accessor.get(ICommandService);
    const localeService = accessor.get(LocaleService);
    const tableManager = accessor.get(TableManager);
    const tableId = (_a = params.id) != null ? _a : generateRandomId();
    const existingNamesSet = getExistingNamesSet(params.unitId, {
      univerInstanceService: accessor.get(IUniverInstanceService),
      tableManager,
      definedNamesService: accessor.get(IDefinedNamesService)
    });
    let tableName = params.name;
    if (!tableName || !customNameCharacterCheck(tableName.toLowerCase(), existingNamesSet)) {
      const prefix = localeService.t("sheets-table.tablePrefix");
      let index = tableManager.getTableList(params.unitId).length + 1;
      for (const name of existingNamesSet) {
        if (name.startsWith(prefix.toLowerCase())) {
          const n = Number(name.slice(prefix.length));
          if (Number.isInteger(n) && n >= index) {
            index = n + 1;
          }
        }
      }
      tableName = `${prefix}${index}`;
    }
    const redos = [];
    const undos = [];
    const { unitId, subUnitId, range } = params;
    const header = tableManager.getColumnHeader(unitId, subUnitId, range, localeService.t("sheets-table.columnPrefix"));
    redos.push({ id: AddSheetTableMutation.id, params: { ...params, tableId, name: tableName, header } });
    undos.push({ id: DeleteSheetTableMutation.id, params: { tableId, unitId: params.unitId } });
    const res = sequenceExecute(redos, commandService);
    if (res.result) {
      undoRedoService.pushUndoRedo({
        unitID: params.unitId,
        undoMutations: undos,
        redoMutations: redos
      });
      return true;
    }
    return false;
  }
};

// ../packages/sheets-table/src/commands/mutations/set-sheet-table.mutation.ts
var SetSheetTableMutation = {
  id: "sheet.mutation.set-sheet-table",
  type: 2 /* MUTATION */,
  handler: (accessor, params) => {
    if (!params) {
      return false;
    }
    const { unitId, tableId, config } = params;
    const tableManager = accessor.get(TableManager);
    tableManager.setTableByConfig(unitId, tableId, config);
    return true;
  }
};

// ../packages/sheets-table/src/commands/commands/add-table-theme.command.ts
var AddTableThemeCommand = {
  id: "sheet.command.add-table-theme",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    if (!params) {
      return false;
    }
    const tableManager = accessor.get(TableManager);
    const { unitId, tableId, themeStyle } = params;
    const redos = [];
    const undos = [];
    const table = tableManager.getTableById(unitId, tableId);
    if (!table) return false;
    const subUnitId = table.getSubunitId();
    redos.push({
      id: AddRangeThemeMutation.id,
      params: {
        unitId,
        subUnitId,
        styleJSON: themeStyle.toJson()
      }
    });
    redos.push({
      id: SetSheetTableMutation.id,
      params: {
        unitId,
        subUnitId,
        tableId,
        config: {
          theme: themeStyle.getName()
        }
      }
    });
    undos.push({
      id: SetSheetTableMutation.id,
      params: {
        unitId,
        subUnitId,
        tableId,
        config: {
          themeStyle: table.getTableStyleId()
        }
      }
    });
    undos.push({
      id: RemoveRangeThemeMutation.id,
      params: {
        unitId,
        subUnitId,
        styleName: themeStyle.getName()
      }
    });
    const commandService = accessor.get(ICommandService);
    const res = sequenceExecute(redos, commandService);
    if (res.result) {
      const undoRedoService = accessor.get(IUndoRedoService);
      undoRedoService.pushUndoRedo({
        unitID: unitId,
        undoMutations: undos,
        redoMutations: redos
      });
      return true;
    }
    return false;
  }
};

// ../packages/sheets-table/src/commands/commands/delete-sheet-table.command.ts
var DeleteSheetTableCommand = {
  id: "sheet.command.delete-table",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    var _a, _b;
    if (!params) {
      return false;
    }
    const undoRedoService = accessor.get(IUndoRedoService);
    const commandService = accessor.get(ICommandService);
    const sheetTableManager = accessor.get(TableManager);
    const logService = accessor.get(ILogService);
    const redos = [];
    const undos = [];
    const tableInstance = sheetTableManager.getTable(params.unitId, params.tableId);
    const tableConfig = tableInstance == null ? void 0 : tableInstance.toJSON();
    if (!tableConfig) {
      logService.error("[TableManager]: Table not found");
      return false;
    }
    const sheetInterceptorService = accessor.get(SheetInterceptorService);
    const interceptorCommands = sheetInterceptorService.onCommandExecute({
      id: DeleteSheetTableCommand.id,
      params: {
        ...params,
        tableName: tableConfig.name
      }
    });
    redos.push(...(_a = interceptorCommands.preRedos) != null ? _a : []);
    redos.push({ id: DeleteSheetTableMutation.id, params: { ...params } });
    redos.push(...interceptorCommands.redos);
    undos.push(...(_b = interceptorCommands.preUndos) != null ? _b : []);
    undos.push({
      id: AddSheetTableMutation.id,
      params: {
        unitId: params.unitId,
        subUnitId: params.subUnitId,
        tableId: params.tableId,
        name: tableConfig.name,
        range: tableConfig.range,
        options: tableConfig.options
      }
    });
    undos.push(...interceptorCommands.undos);
    const res = sequenceExecute(redos, commandService);
    if (res.result) {
      undoRedoService.pushUndoRedo({
        unitID: params.unitId,
        undoMutations: undos,
        redoMutations: redos
      });
      return true;
    }
    return false;
  }
};

// ../packages/sheets-table/src/commands/commands/remove-table-theme.command.ts
var RemoveTableThemeCommand = {
  id: "sheet.command.remove-table-theme",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    if (!params) {
      return false;
    }
    const { unitId, tableId, themeName } = params;
    const tableManager = accessor.get(TableManager);
    const rangeThemeModel = accessor.get(SheetRangeThemeModel);
    const table = tableManager.getTableById(unitId, tableId);
    if (!table) return false;
    const subUnitId = table.getSubunitId();
    const redos = [];
    const undos = [];
    const defaultRangeThemes = rangeThemeModel.getRegisteredRangeThemes().filter((item) => item == null ? void 0 : item.startsWith("table-default"));
    const customRangeThemes = rangeThemeModel.getRegisteredRangeThemes().filter((item) => item == null ? void 0 : item.startsWith(SHEET_TABLE_CUSTOM_THEME_PREFIX));
    let shouldBeSelectedTheme = customRangeThemes.find((item) => item !== themeName);
    if (!shouldBeSelectedTheme) {
      shouldBeSelectedTheme = defaultRangeThemes[0];
    }
    redos.push({ id: SetSheetTableMutation.id, params: { unitId, subUnitId, tableId, config: { theme: shouldBeSelectedTheme } } });
    redos.push({ id: RemoveRangeThemeMutation.id, params: { unitId, subUnitId, styleName: themeName } });
    const themeStyle = rangeThemeModel.getDefaultRangeThemeStyle(themeName);
    if (themeStyle) {
      undos.push({ id: AddRangeThemeMutation.id, params: { unitId, subUnitId, styleJSON: themeStyle.toJson() } });
      undos.push({ id: SetSheetTableMutation.id, params: { unitId, subUnitId, tableId, config: { theme: themeName } } });
    }
    const commandService = accessor.get(ICommandService);
    const res = sequenceExecute(redos, commandService);
    if (res.result) {
      const undoRedoService = accessor.get(IUndoRedoService);
      undoRedoService.pushUndoRedo({
        unitID: unitId,
        redoMutations: redos,
        undoMutations: undos
      });
      return true;
    }
    return false;
  }
};

// ../packages/sheets-table/src/util/table-name.ts
function validateSheetTableName(name, existingNamesSet) {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { valid: false, reason: "empty" };
  }
  const normalizedExistingNames = new Set(Array.from(existingNamesSet, (item) => item.toLowerCase()));
  const isValidName = customNameCharacterCheck(trimmedName.toLowerCase(), normalizedExistingNames);
  if (!isValidName) {
    return { valid: false, reason: "invalid" };
  }
  return { valid: true };
}

// ../packages/sheets-table/src/commands/commands/set-sheet-table.command.ts
var SetSheetTableCommand = {
  id: "sheet.command.set-table-config",
  type: 0 /* COMMAND */,
  // eslint-disable-next-line max-lines-per-function
  handler: (accessor, params) => {
    var _a, _b;
    if (!params) {
      return false;
    }
    const { unitId, tableId, name, updateRange, rowColOperation, theme } = params;
    const tableManager = accessor.get(TableManager);
    const table = tableManager.getTableById(unitId, tableId);
    if (!table) return false;
    const oldTableConfig = {};
    const newTableConfig = {};
    const localeService = accessor.get(LocaleService);
    const existingNamesSet = getExistingNamesSet(unitId, {
      univerInstanceService: accessor.get(IUniverInstanceService),
      tableManager,
      definedNamesService: accessor.get(IDefinedNamesService)
    });
    if (name) {
      const tableNameValidation = validateSheetTableName(name, existingNamesSet);
      if (!tableNameValidation.valid) {
        const logService = accessor.get(ILogService);
        logService.warn(localeService.t("sheets-table.tableNameError"));
        return false;
      }
      oldTableConfig.name = table.getDisplayName();
      newTableConfig.name = name;
    }
    if (rowColOperation) {
      oldTableConfig.rowColOperation = {
        operationType: rowColOperation.operationType === "insert" /* Insert */ ? "delete" /* Delete */ : "insert" /* Insert */,
        rowColType: rowColOperation.rowColType,
        index: rowColOperation.index,
        count: rowColOperation.count
      };
      newTableConfig.rowColOperation = rowColOperation;
    }
    if (updateRange) {
      oldTableConfig.updateRange = {
        newRange: table.getRange()
      };
      newTableConfig.updateRange = updateRange;
    }
    if (theme) {
      oldTableConfig.theme = table.getTableStyleId();
      newTableConfig.theme = theme;
    }
    const redoParams = {
      unitId,
      subUnitId: table.getSubunitId(),
      tableId,
      config: newTableConfig
    };
    const undoParams = {
      unitId,
      subUnitId: table.getSubunitId(),
      tableId,
      config: oldTableConfig
    };
    const sheetInterceptorService = accessor.get(SheetInterceptorService);
    const interceptorCommands = sheetInterceptorService.onCommandExecute({
      id: SetSheetTableCommand.id,
      params: {
        ...params,
        oldTableName: oldTableConfig.name
      }
    });
    const redos = [
      ...(_a = interceptorCommands.preRedos) != null ? _a : [],
      { id: SetSheetTableMutation.id, params: redoParams },
      ...interceptorCommands.redos
    ];
    const undos = [
      ...(_b = interceptorCommands.preUndos) != null ? _b : [],
      { id: SetSheetTableMutation.id, params: undoParams },
      ...interceptorCommands.undos
    ];
    const commandService = accessor.get(ICommandService);
    redos.forEach((mutation) => {
      commandService.executeCommand(mutation.id, mutation.params);
    });
    const undoRedoService = accessor.get(IUndoRedoService);
    undoRedoService.pushUndoRedo({
      unitID: unitId,
      undoMutations: undos,
      redoMutations: redos
    });
    return true;
  }
};

// ../packages/sheets-table/src/commands/mutations/set-table-filter.mutation.ts
var SetSheetTableFilterMutation = {
  id: "sheet.mutation.set-table-filter",
  type: 2 /* MUTATION */,
  handler: (accessor, params) => {
    const { tableId, unitId, column, tableFilter } = params;
    const tableManager = accessor.get(TableManager);
    tableManager.addFilter(unitId, tableId, column, tableFilter);
    return true;
  }
};

// ../packages/sheets-table/src/commands/commands/set-table-filter.command.ts
var SetSheetTableFilterCommand = {
  id: "sheet.command.set-table-filter",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    if (!params) {
      return false;
    }
    const undoRedoService = accessor.get(IUndoRedoService);
    const commandService = accessor.get(ICommandService);
    const tableId = params.tableId || generateRandomId();
    const redos = [];
    const undos = [];
    redos.push({ id: SetSheetTableFilterMutation.id, params: { ...params, tableId } });
    undos.push({ id: SetSheetTableFilterMutation.id, params: { ...params, tableId, tableFilter: void 0 } });
    const res = sequenceExecute(redos, commandService);
    if (res.result) {
      undoRedoService.pushUndoRedo({
        unitID: params.unitId,
        undoMutations: undos,
        redoMutations: redos
      });
      return true;
    }
    return false;
  }
};

// ../packages/sheets-table/src/controllers/sheets-table.controller.ts
var SheetsTableController = class extends Disposable {
  constructor(_univerInstanceService, _sheetInterceptorService, _tableManager, _resourceManagerService) {
    super();
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_tableManager", _tableManager);
    __publicField(this, "_resourceManagerService", _resourceManagerService);
    __publicField(this, "_tableRangeRTree", /* @__PURE__ */ new Map());
    this._initSnapshot();
    this._initSheetChange();
    this.registerTableChangeEvent();
    this.registerTableHeaderInterceptor();
  }
  getContainerTableWithRange(unitId, subUnitId, range) {
    const rTree = this._ensureTableRangeRTree(unitId);
    const ids = Array.from(rTree.bulkSearch([{ unitId, sheetId: subUnitId, range }]));
    const wrapperTableId = ids.find((id) => {
      const table = this._tableManager.getTable(unitId, String(id));
      if (table) {
        return Rectangle.contains(table.getRange(), range);
      }
      return false;
    });
    if (wrapperTableId) {
      const table = this._tableManager.getTable(unitId, String(wrapperTableId));
      return table;
    }
  }
  _ensureTableRangeRTree(unitId) {
    if (!this._tableRangeRTree.has(unitId)) {
      this._tableRangeRTree.set(unitId, new RTree());
    }
    return this._tableRangeRTree.get(unitId);
  }
  registerTableChangeEvent() {
    this.disposeWithMe(
      this._tableManager.tableAdd$.subscribe((event) => {
        const { range, tableId, unitId, subUnitId } = event;
        const rTree = this._ensureTableRangeRTree(unitId);
        rTree.insert({
          unitId,
          sheetId: subUnitId,
          id: tableId,
          range: { ...range }
        });
      })
    );
    this.disposeWithMe(
      this._tableManager.tableRangeChanged$.subscribe((event) => {
        const { range, tableId, unitId, subUnitId, oldRange } = event;
        const rTree = this._ensureTableRangeRTree(unitId);
        rTree.remove({
          unitId,
          sheetId: subUnitId,
          id: tableId,
          range: { ...oldRange }
        });
        rTree.insert({
          unitId,
          sheetId: subUnitId,
          id: tableId,
          range: { ...range }
        });
      })
    );
    this.disposeWithMe(
      this._tableManager.tableDelete$.subscribe((event) => {
        const { tableId, unitId, subUnitId, range } = event;
        const rTree = this._ensureTableRangeRTree(unitId);
        rTree.remove({
          unitId,
          sheetId: subUnitId,
          id: tableId,
          range: { ...range }
        });
      })
    );
  }
  registerTableHeaderInterceptor() {
    this.disposeWithMe(
      this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
        effect: 2 /* Value */,
        handler: (cell, context, next) => {
          const { row, col, unitId, subUnitId } = context;
          const rTree = this._ensureTableRangeRTree(unitId);
          const v = cell == null ? void 0 : cell.v;
          if (v === void 0 && rTree) {
            const ids = Array.from(rTree.bulkSearch([{ unitId, sheetId: subUnitId, range: { startColumn: col, endColumn: col, startRow: row, endRow: row } }]));
            if (ids.length > 0) {
              const table = this._tableManager.getTable(unitId, ids[0]);
              if (table) {
                const tableRange = table.getRange();
                const index = col - tableRange.startColumn;
                const tableStartRow = tableRange.startRow;
                if (tableStartRow === row) {
                  const columnName = table.getColumnNameByIndex(index);
                  if (!cell || cell === context.rawData) {
                    cell = { ...context.rawData };
                  }
                  cell.v = columnName;
                  return next(cell);
                }
              }
            }
          }
          return next(cell);
        }
      })
    );
  }
  _toJson(unitId) {
    return this._tableManager.toJSON(unitId);
  }
  _fromJSON(unitId, resources) {
    return this._tableManager.fromJSON(unitId, resources);
  }
  _deleteUnitId(unitId) {
    this._tableManager.deleteUnitId(unitId);
  }
  _initSnapshot() {
    this.disposeWithMe(this._resourceManagerService.registerPluginResource({
      toJson: (unitId) => {
        return JSON.stringify(this._toJson(unitId));
      },
      parseJson: (json) => {
        if (!json) {
          return {};
        }
        try {
          return JSON.parse(json);
        } catch (error) {
          return {};
        }
      },
      businesses: [2 /* UNIVER_SHEET */],
      pluginName: PLUGIN_NAME2,
      onLoad: (unitId, resources) => {
        this._fromJSON(unitId, resources);
      },
      onUnLoad: (unitId) => {
        this._deleteUnitId(unitId);
      }
    }));
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
            const tables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
            if (tables.length === 0) {
              return { redos: [], undos: [] };
            }
            const redos = [];
            const undos = [];
            tables.forEach((table) => {
              const tableJson = table.toJSON();
              redos.push({
                id: DeleteSheetTableMutation.id,
                params: {
                  unitId,
                  subUnitId,
                  tableId: tableJson.id
                }
              });
              undos.push({
                id: AddSheetTableMutation.id,
                params: {
                  unitId,
                  subUnitId,
                  name: tableJson.name,
                  range: tableJson.range,
                  tableId: tableJson.id,
                  options: {
                    ...tableJson.options,
                    columns: tableJson.columns,
                    filters: tableJson.filters.tableColumnFilterList
                  }
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
            const tables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
            if (tables.length === 0) {
              return { redos: [], undos: [] };
            }
            const redos = [];
            const undos = [];
            tables.forEach((table) => {
              const tableJson = table.toJSON();
              const tableId = generateRandomId();
              redos.push({
                id: AddSheetTableMutation.id,
                params: {
                  unitId,
                  subUnitId: targetSubUnitId,
                  name: tableJson.name,
                  range: {
                    ...tableJson.range,
                    sheetId: targetSubUnitId
                  },
                  tableId,
                  options: {
                    ...tableJson.options,
                    columns: tableJson.columns,
                    filters: tableJson.filters.tableColumnFilterList
                  }
                }
              });
              undos.push({
                id: DeleteSheetTableMutation.id,
                params: {
                  unitId,
                  subUnitId: targetSubUnitId,
                  tableId
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
  dispose() {
    super.dispose();
    this._tableRangeRTree.clear();
  }
};
SheetsTableController = __decorateClass([
  __decorateParam(0, Inject(IUniverInstanceService)),
  __decorateParam(1, Inject(SheetInterceptorService)),
  __decorateParam(2, Inject(TableManager)),
  __decorateParam(3, Inject(IResourceManagerService))
], SheetsTableController);

// ../packages/sheets-table/src/commands/commands/sheet-table-row-col.command.ts
function executeTableMutationSequence(accessor, unitId, redos, undos) {
  const commandService = accessor.get(ICommandService);
  const res = sequenceExecute(redos, commandService);
  if (res.result) {
    const undoRedoService = accessor.get(IUndoRedoService);
    undoRedoService.pushUndoRedo({
      unitID: unitId,
      undoMutations: undos,
      redoMutations: redos
    });
    return true;
  }
  return false;
}
var SheetTableInsertRowCommand = {
  id: "sheet.command.table-insert-row",
  type: 0 /* COMMAND */,
  handler: (accessor) => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const target = getSheetCommandTarget(univerInstanceService);
    if (!target) {
      return false;
    }
    const { workbook, worksheet, unitId, subUnitId } = target;
    const sheetsSelectionsService = accessor.get(SheetsSelectionsService);
    const selections = sheetsSelectionsService.getCurrentSelections();
    if (!selections.length || selections.length > 1) {
      return false;
    }
    const tableManager = accessor.get(TableManager);
    const selection = selections[0];
    const range = selection.range;
    const sheetsTableController = accessor.get(SheetsTableController);
    const table = sheetsTableController.getContainerTableWithRange(unitId, subUnitId, range);
    if (!table) return false;
    const insertRowCount = range.endRow - range.startRow + 1;
    const worksheetCount = worksheet.getRowCount();
    const worksheetLastRowIndex = worksheetCount - 1;
    const rowContentIndex = worksheet.getCellMatrix().getDataRange().endRow;
    const redos = [];
    const undos = [];
    if (worksheetLastRowIndex - rowContentIndex < insertRowCount) {
      redos.push({
        id: InsertRowMutation.id,
        params: {
          unitId,
          subUnitId,
          range: { ...range }
        }
      });
      redos.push({
        id: SetSheetTableMutation.id,
        params: {
          unitId,
          subUnitId,
          tableId: table.getId(),
          config: {
            updateRange: {
              newRange: {
                ...table.getRange(),
                endRow: table.getRange().endRow + insertRowCount
              }
            }
          }
        }
      });
      undos.push({
        id: SetSheetTableMutation.id,
        params: {
          unitId,
          subUnitId,
          tableId: table.getId(),
          config: {
            updateRange: {
              newRange: table.getRange()
            }
          }
        }
      });
      undos.push({
        id: RemoveRowMutation.id,
        params: {
          unitId,
          subUnitId,
          range: { ...range }
        }
      });
    } else {
      const oldRange = { ...table.getRange() };
      redos.push({
        id: SetSheetTableMutation.id,
        params: {
          unitId,
          subUnitId,
          tableId: table.getId(),
          config: {
            updateRange: {
              newRange: {
                ...oldRange,
                endRow: oldRange.endRow + insertRowCount
              }
            }
          }
        }
      });
      undos.push({
        id: SetSheetTableMutation.id,
        params: {
          unitId,
          subUnitId,
          tableId: table.getId(),
          config: {
            updateRange: {
              newRange: { ...oldRange }
            }
          }
        }
      });
      const moveRangeMutations = getMoveRangeUndoRedoMutations(
        accessor,
        {
          unitId,
          subUnitId,
          range: {
            startRow: range.startRow,
            endRow: rowContentIndex,
            startColumn: oldRange.startColumn,
            endColumn: oldRange.endColumn
          }
        },
        {
          unitId,
          subUnitId,
          range: {
            startRow: range.startRow + insertRowCount,
            endRow: rowContentIndex + insertRowCount,
            startColumn: oldRange.startColumn,
            endColumn: oldRange.endColumn
          }
        }
      );
      if (moveRangeMutations) {
        redos.push(...moveRangeMutations.redos);
        undos.push(...moveRangeMutations.undos);
      }
    }
    const commandService = accessor.get(ICommandService);
    const res = sequenceExecute(redos, commandService);
    if (res.result) {
      const undoRedoService = accessor.get(IUndoRedoService);
      undoRedoService.pushUndoRedo({
        unitID: unitId,
        undoMutations: undos,
        redoMutations: redos
      });
      return true;
    }
    return false;
  }
};
var SheetTableInsertRowAtCommand = {
  id: "sheet.command.table-insert-row-at",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    if (!params) {
      return false;
    }
    const { unitId, subUnitId, tableId, index, count = 1 } = params;
    if (count <= 0) {
      return false;
    }
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const target = getSheetCommandTarget(univerInstanceService, { unitId, subUnitId });
    if (!target) {
      return false;
    }
    const table = accessor.get(TableManager).getTableById(unitId, tableId);
    if (!table || table.getSubunitId() !== subUnitId) {
      return false;
    }
    const oldRange = table.getRange();
    if (index <= oldRange.startRow || index > oldRange.endRow + 1) {
      return false;
    }
    const redos = [{
      id: SetSheetTableMutation.id,
      params: {
        unitId,
        subUnitId,
        tableId,
        config: {
          updateRange: {
            newRange: {
              ...oldRange,
              endRow: oldRange.endRow + count
            }
          }
        }
      }
    }];
    const undos = [{
      id: SetSheetTableMutation.id,
      params: {
        unitId,
        subUnitId,
        tableId,
        config: {
          updateRange: {
            newRange: { ...oldRange }
          }
        }
      }
    }];
    const rowContentIndex = target.worksheet.getCellMatrix().getDataRange().endRow;
    const moveRangeMutations = getMoveRangeUndoRedoMutations(
      accessor,
      {
        unitId,
        subUnitId,
        range: {
          startRow: index,
          endRow: rowContentIndex,
          startColumn: oldRange.startColumn,
          endColumn: oldRange.endColumn
        }
      },
      {
        unitId,
        subUnitId,
        range: {
          startRow: index + count,
          endRow: rowContentIndex + count,
          startColumn: oldRange.startColumn,
          endColumn: oldRange.endColumn
        }
      }
    );
    if (moveRangeMutations) {
      redos.push(...moveRangeMutations.redos);
      undos.push(...moveRangeMutations.undos);
    }
    return executeTableMutationSequence(accessor, unitId, redos, undos);
  }
};
var SheetTableInsertColCommand = {
  id: "sheet.command.table-insert-col",
  type: 0 /* COMMAND */,
  handler: (accessor) => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const target = getSheetCommandTarget(univerInstanceService);
    if (!target) {
      return false;
    }
    const { worksheet, unitId, subUnitId } = target;
    const sheetsSelectionsService = accessor.get(SheetsSelectionsService);
    const selections = sheetsSelectionsService.getCurrentSelections();
    if (!selections.length || selections.length > 1) {
      return false;
    }
    const selection = selections[0];
    const range = selection.range;
    const sheetsTableController = accessor.get(SheetsTableController);
    const table = sheetsTableController.getContainerTableWithRange(unitId, subUnitId, range);
    if (!table) return false;
    const insertColCount = range.endColumn - range.startColumn + 1;
    const worksheetCount = worksheet.getColumnCount();
    const worksheetLastColIndex = worksheetCount - 1;
    const colContentIndex = worksheet.getCellMatrix().getDataRange().endColumn;
    const redos = [];
    const undos = [];
    if (worksheetLastColIndex - colContentIndex < insertColCount) {
      redos.push({
        id: InsertColMutation.id,
        params: {
          unitId,
          subUnitId,
          range: { ...range }
        }
      });
      redos.push({
        id: SetSheetTableMutation.id,
        params: {
          unitId,
          subUnitId,
          tableId: table.getId(),
          config: {
            rowColOperation: {
              operationType: "insert" /* Insert */,
              rowColType: "column" /* Col */,
              index: range.startColumn,
              count: insertColCount
            }
          }
        }
      });
      undos.push({
        id: SetSheetTableMutation.id,
        params: {
          unitId,
          subUnitId,
          tableId: table.getId(),
          config: {
            rowColOperation: {
              operationType: "delete" /* Delete */,
              rowColType: "column" /* Col */,
              index: range.startColumn,
              count: insertColCount
            }
          }
        }
      });
      undos.push({
        id: RemoveColMutation.id,
        params: {
          unitId,
          subUnitId,
          range: { ...range }
        }
      });
    } else {
      const oldRange = table.getRange();
      redos.push({
        id: SetSheetTableMutation.id,
        params: {
          unitId,
          subUnitId,
          tableId: table.getId(),
          config: {
            rowColOperation: {
              operationType: "insert" /* Insert */,
              rowColType: "column" /* Col */,
              index: range.startColumn,
              count: insertColCount
            }
          }
        }
      });
      undos.push({
        id: SetSheetTableMutation.id,
        params: {
          unitId,
          subUnitId,
          tableId: table.getId(),
          config: {
            rowColOperation: {
              operationType: "delete" /* Delete */,
              rowColType: "column" /* Col */,
              index: range.startColumn,
              count: insertColCount
            }
          }
        }
      });
      const moveRangeMutations = getMoveRangeUndoRedoMutations(
        accessor,
        {
          unitId,
          subUnitId,
          range: {
            startRow: oldRange.startRow,
            endRow: oldRange.endRow,
            startColumn: range.startColumn,
            endColumn: colContentIndex
          }
        },
        {
          unitId,
          subUnitId,
          range: {
            startRow: oldRange.startRow,
            endRow: oldRange.endRow,
            startColumn: range.startColumn + insertColCount,
            endColumn: colContentIndex + insertColCount
          }
        }
      );
      if (moveRangeMutations) {
        redos.push(...moveRangeMutations.redos);
        undos.push(...moveRangeMutations.undos);
      }
    }
    const commandService = accessor.get(ICommandService);
    const res = sequenceExecute(redos, commandService);
    if (res.result) {
      const undoRedoService = accessor.get(IUndoRedoService);
      undoRedoService.pushUndoRedo({
        unitID: unitId,
        undoMutations: undos,
        redoMutations: redos
      });
      return true;
    }
    return false;
  }
};
var SheetTableInsertColumnAtCommand = {
  id: "sheet.command.table-insert-column-at",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    if (!params) {
      return false;
    }
    const { unitId, subUnitId, tableId, index, count = 1 } = params;
    if (count <= 0) {
      return false;
    }
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const target = getSheetCommandTarget(univerInstanceService, { unitId, subUnitId });
    if (!target) {
      return false;
    }
    const table = accessor.get(TableManager).getTableById(unitId, tableId);
    if (!table || table.getSubunitId() !== subUnitId) {
      return false;
    }
    const oldRange = table.getRange();
    if (index < oldRange.startColumn || index > oldRange.endColumn + 1) {
      return false;
    }
    const redos = [{
      id: SetSheetTableMutation.id,
      params: {
        unitId,
        subUnitId,
        tableId,
        config: {
          rowColOperation: {
            operationType: "insert" /* Insert */,
            rowColType: "column" /* Col */,
            index,
            count
          }
        }
      }
    }];
    const undos = [{
      id: SetSheetTableMutation.id,
      params: {
        unitId,
        subUnitId,
        tableId,
        config: {
          rowColOperation: {
            operationType: "delete" /* Delete */,
            rowColType: "column" /* Col */,
            index,
            count
          }
        }
      }
    }];
    const colContentIndex = target.worksheet.getCellMatrix().getDataRange().endColumn;
    if (index <= colContentIndex) {
      const moveRangeMutations = getMoveRangeUndoRedoMutations(
        accessor,
        {
          unitId,
          subUnitId,
          range: {
            startRow: oldRange.startRow,
            endRow: oldRange.endRow,
            startColumn: index,
            endColumn: colContentIndex
          }
        },
        {
          unitId,
          subUnitId,
          range: {
            startRow: oldRange.startRow,
            endRow: oldRange.endRow,
            startColumn: index + count,
            endColumn: colContentIndex + count
          }
        }
      );
      if (moveRangeMutations) {
        redos.push(...moveRangeMutations.redos);
        undos.push(...moveRangeMutations.undos);
      }
    }
    return executeTableMutationSequence(accessor, unitId, redos, undos);
  }
};
var SheetTableRemoveColumnAtCommand = {
  id: "sheet.command.table-remove-column-at",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    var _a, _b;
    if (!params) {
      return false;
    }
    const { unitId, subUnitId, tableId, index, count = 1 } = params;
    if (count <= 0) {
      return false;
    }
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const target = getSheetCommandTarget(univerInstanceService, { unitId, subUnitId });
    if (!target) {
      return false;
    }
    const table = accessor.get(TableManager).getTableById(unitId, tableId);
    if (!table || table.getSubunitId() !== subUnitId) {
      return false;
    }
    const oldRange = table.getRange();
    if (index < oldRange.startColumn || index + count - 1 > oldRange.endColumn || count >= oldRange.endColumn - oldRange.startColumn + 1) {
      return false;
    }
    const tableInfo = table.getTableInfo();
    const columns = [];
    const gap = index - oldRange.startColumn;
    for (let i = 0; i < count; i++) {
      const column = tableInfo.columns[gap + i];
      if (column) {
        columns.push(column);
      }
    }
    const sheetInterceptorService = accessor.get(SheetInterceptorService);
    const interceptorCommands = sheetInterceptorService.onCommandExecute({
      id: SheetTableRemoveColumnAtCommand.id,
      params: {
        ...params,
        tableName: tableInfo.name,
        removedColumnNames: columns.map((column) => column.displayName)
      }
    });
    const redos = [
      ...(_a = interceptorCommands.preRedos) != null ? _a : [],
      {
        id: SetSheetTableMutation.id,
        params: {
          unitId,
          subUnitId,
          tableId,
          config: {
            rowColOperation: {
              operationType: "delete" /* Delete */,
              rowColType: "column" /* Col */,
              index,
              count
            }
          }
        }
      },
      ...interceptorCommands.redos
    ];
    const undos = [
      ...(_b = interceptorCommands.preUndos) != null ? _b : [],
      {
        id: SetSheetTableMutation.id,
        params: {
          unitId,
          subUnitId,
          tableId,
          config: {
            rowColOperation: {
              operationType: "insert" /* Insert */,
              rowColType: "column" /* Col */,
              index,
              count,
              columnsJson: columns
            }
          }
        }
      },
      ...interceptorCommands.undos
    ];
    const colContentIndex = target.worksheet.getCellMatrix().getDataRange().endColumn;
    if (index + count <= colContentIndex) {
      const moveRangeMutations = getMoveRangeUndoRedoMutations(
        accessor,
        {
          unitId,
          subUnitId,
          range: {
            startRow: oldRange.startRow,
            endRow: oldRange.endRow,
            startColumn: index + count,
            endColumn: colContentIndex
          }
        },
        {
          unitId,
          subUnitId,
          range: {
            startRow: oldRange.startRow,
            endRow: oldRange.endRow,
            startColumn: index,
            endColumn: colContentIndex - count
          }
        }
      );
      if (moveRangeMutations) {
        redos.push(...moveRangeMutations.redos);
        undos.push(...moveRangeMutations.undos);
      }
    }
    return executeTableMutationSequence(accessor, unitId, redos, undos);
  }
};
var SheetTableRemoveRowCommand = {
  id: "sheet.command.table-remove-row",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    if (!params) {
      return false;
    }
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const target = getSheetCommandTarget(univerInstanceService, params);
    if (!target) {
      return false;
    }
    const { unitId, subUnitId } = target;
    const sheetsSelectionsService = accessor.get(SheetsSelectionsService);
    const selections = sheetsSelectionsService.getCurrentSelections();
    if (!selections.length || selections.length > 1) {
      return false;
    }
    const selection = selections[0];
    const range = selection.range;
    const sheetsTableController = accessor.get(SheetsTableController);
    const table = sheetsTableController.getContainerTableWithRange(unitId, subUnitId, range);
    if (!table) return false;
    const removeRowCount = range.endRow - range.startRow + 1;
    const redos = [];
    const undos = [];
    const oldRange = table.getRange();
    redos.push({
      id: SetSheetTableMutation.id,
      params: {
        unitId,
        subUnitId,
        tableId: table.getId(),
        config: {
          updateRange: {
            newRange: {
              ...oldRange,
              endRow: oldRange.endRow - removeRowCount
            }
          }
        }
      }
    });
    undos.push({
      id: SetSheetTableMutation.id,
      params: {
        unitId,
        subUnitId,
        tableId: table.getId(),
        config: {
          updateRange: {
            newRange: { ...oldRange }
          }
        }
      }
    });
    const worksheet = target.worksheet;
    const rowContentIndex = worksheet.getCellMatrix().getDataRange().endRow;
    const moveRangeMutations = getMoveRangeUndoRedoMutations(
      accessor,
      {
        unitId,
        subUnitId,
        range: {
          startRow: range.endRow + 1,
          endRow: rowContentIndex,
          startColumn: oldRange.startColumn,
          endColumn: oldRange.endColumn
        }
      },
      {
        unitId,
        subUnitId,
        range: {
          startRow: range.startRow,
          endRow: rowContentIndex - removeRowCount,
          startColumn: oldRange.startColumn,
          endColumn: oldRange.endColumn
        }
      }
    );
    if (moveRangeMutations) {
      redos.push(...moveRangeMutations.redos);
      undos.push(...moveRangeMutations.undos);
    }
    const commandService = accessor.get(ICommandService);
    const res = sequenceExecute(redos, commandService);
    if (res.result) {
      const undoRedoService = accessor.get(IUndoRedoService);
      undoRedoService.pushUndoRedo({
        unitID: unitId,
        undoMutations: undos,
        redoMutations: redos
      });
      return true;
    }
    return false;
  }
};
var SheetTableRemoveColCommand = {
  id: "sheet.command.table-remove-col",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    var _a, _b;
    if (!params) {
      return false;
    }
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const target = getSheetCommandTarget(univerInstanceService, params);
    if (!target) {
      return false;
    }
    const { workbook, unitId, subUnitId } = target;
    const tableManager = accessor.get(TableManager);
    const sheetsSelectionsService = accessor.get(SheetsSelectionsService);
    const selections = sheetsSelectionsService.getCurrentSelections();
    if (!selections.length || selections.length > 1) {
      return false;
    }
    const selection = selections[0];
    const range = selection.range;
    const sheetsTableController = accessor.get(SheetsTableController);
    const table = sheetsTableController.getContainerTableWithRange(unitId, subUnitId, range);
    if (!table) return false;
    const removeColCount = range.endColumn - range.startColumn + 1;
    const redos = [];
    const undos = [];
    const oldRange = table.getRange();
    redos.push({
      id: SetSheetTableMutation.id,
      params: {
        unitId,
        subUnitId,
        tableId: table.getId(),
        config: {
          rowColOperation: {
            operationType: "delete" /* Delete */,
            rowColType: "column" /* Col */,
            index: range.startColumn,
            count: removeColCount
          }
        }
      }
    });
    const tableInfo = table.getTableInfo();
    const columns = [];
    const gap = range.startColumn - oldRange.startColumn;
    for (let i = 0; i < removeColCount; i++) {
      const column = tableInfo.columns[gap + i];
      if (column) {
        columns.push(column);
      }
    }
    const sheetInterceptorService = accessor.get(SheetInterceptorService);
    const interceptorCommands = sheetInterceptorService.onCommandExecute({
      id: SheetTableRemoveColCommand.id,
      params: {
        ...params,
        tableName: tableInfo.name,
        removedColumnNames: columns.map((column) => column.displayName)
      }
    });
    redos.unshift(...(_a = interceptorCommands.preRedos) != null ? _a : []);
    redos.push(...interceptorCommands.redos);
    undos.unshift(...(_b = interceptorCommands.preUndos) != null ? _b : []);
    undos.push({
      id: SetSheetTableMutation.id,
      params: {
        unitId,
        subUnitId,
        tableId: table.getId(),
        config: {
          rowColOperation: {
            operationType: "insert" /* Insert */,
            rowColType: "column" /* Col */,
            index: range.startColumn,
            count: removeColCount,
            columnsJson: columns
          }
        }
      }
    });
    undos.push(...interceptorCommands.undos);
    const worksheet = target.worksheet;
    const colContentIndex = worksheet.getCellMatrix().getDataRange().endColumn;
    const moveRangeMutations = getMoveRangeUndoRedoMutations(
      accessor,
      {
        unitId,
        subUnitId,
        range: {
          startRow: oldRange.startRow,
          endRow: oldRange.endRow,
          startColumn: range.endColumn + 1,
          endColumn: colContentIndex
        }
      },
      {
        unitId,
        subUnitId,
        range: {
          startRow: oldRange.startRow,
          endRow: oldRange.endRow,
          startColumn: range.startColumn,
          endColumn: colContentIndex - removeColCount
        }
      }
    );
    if (moveRangeMutations) {
      redos.push(...moveRangeMutations.redos);
      undos.push(...moveRangeMutations.undos);
    }
    const commandService = accessor.get(ICommandService);
    const res = sequenceExecute(redos, commandService);
    if (res.result) {
      const undoRedoService = accessor.get(IUndoRedoService);
      undoRedoService.pushUndoRedo({
        unitID: unitId,
        undoMutations: undos,
        redoMutations: redos
      });
      return true;
    }
    return false;
  }
};

// ../packages/sheets-table/src/controllers/sheet-table-formula.controller.ts
var SheetTableFormulaController = class extends Disposable {
  constructor(_tableManager, _commandService) {
    super();
    __publicField(this, "_tableManager", _tableManager);
    __publicField(this, "_commandService", _commandService);
    this._initRangeListener();
  }
  _initRangeListener() {
    this.disposeWithMe(
      this._tableManager.tableRangeChanged$.subscribe((event) => {
        const { tableId, unitId } = event;
        const table = this._tableManager.getTableById(unitId, tableId);
        if (!table) {
          return;
        }
        this._updateSuperTable(unitId, table);
      })
    );
    this.disposeWithMe(
      this._tableManager.tableAdd$.subscribe((event) => {
        const { tableId, unitId } = event;
        const table = this._tableManager.getTableById(unitId, tableId);
        if (!table) {
          return;
        }
        this._updateSuperTable(unitId, table);
      })
    );
    this.disposeWithMe(
      this._tableManager.tableDelete$.subscribe((event) => {
        const { unitId, tableName } = event;
        this._commandService.executeCommand(RemoveSuperTableMutation.id, {
          unitId,
          tableName
        });
      })
    );
    this.disposeWithMe(
      this._tableManager.tableNameChanged$.subscribe((event) => {
        const { tableId, unitId, oldTableName } = event;
        this._commandService.executeCommand(RemoveSuperTableMutation.id, {
          unitId,
          tableName: oldTableName
        });
        const table = this._tableManager.getTableById(unitId, tableId);
        if (!table) {
          return;
        }
        this._updateSuperTable(unitId, table, oldTableName);
      })
    );
  }
  _updateSuperTable(unitId, table, oldTableName) {
    const tableInfo = table.getTableInfo();
    const name = tableInfo.name;
    const columns = tableInfo.columns;
    const titleMap = /* @__PURE__ */ new Map();
    columns.forEach((column, index) => {
      titleMap.set(column.displayName, index);
    });
    this._commandService.executeCommand(SetSuperTableMutation.id, {
      unitId,
      tableName: name,
      oldTableName,
      reference: {
        range: tableInfo.range,
        sheetId: tableInfo.subUnitId,
        titleMap
      }
    });
  }
};
SheetTableFormulaController = __decorateClass([
  __decorateParam(0, Inject(TableManager)),
  __decorateParam(1, ICommandService)
], SheetTableFormulaController);

// ../packages/sheets-table/src/controllers/sheet-table-range.controller.ts
var SheetTableRangeController = class extends Disposable {
  constructor(_tableManager, _exclusiveRangeService) {
    super();
    __publicField(this, "_tableManager", _tableManager);
    __publicField(this, "_exclusiveRangeService", _exclusiveRangeService);
    this._initRangeListener();
  }
  _initRangeListener() {
    this.disposeWithMe(
      this._tableManager.tableRangeChanged$.subscribe((event) => {
        const { range, tableId, unitId, subUnitId } = event;
        this._exclusiveRangeService.clearExclusiveRangesByGroupId(unitId, subUnitId, FEATURE_TABLE_ID, tableId);
        this._exclusiveRangeService.addExclusiveRange(unitId, subUnitId, FEATURE_TABLE_ID, [{
          range: { ...range },
          groupId: tableId
        }]);
      })
    );
    this.disposeWithMe(
      this._tableManager.tableAdd$.subscribe((event) => {
        const { tableId, unitId, subUnitId, range } = event;
        this._exclusiveRangeService.addExclusiveRange(unitId, subUnitId, FEATURE_TABLE_ID, [{
          range: { ...range },
          groupId: tableId
        }]);
      })
    );
    this.disposeWithMe(
      this._tableManager.tableDelete$.subscribe((event) => {
        const { tableId, unitId, subUnitId } = event;
        this._exclusiveRangeService.clearExclusiveRangesByGroupId(unitId, subUnitId, FEATURE_TABLE_ID, tableId);
      })
    );
  }
};
SheetTableRangeController = __decorateClass([
  __decorateParam(0, Inject(TableManager)),
  __decorateParam(1, Inject(IExclusiveRangeService))
], SheetTableRangeController);

// ../packages/sheets-table/src/controllers/sheet-table-ref-range.controller.ts
var SHEET_TABLE_REMOVE_COL_COMMAND_ID = "sheet.command.table-remove-col";
var DELETE_SHEET_TABLE_COMMAND_ID = "sheet.command.delete-table";
var SheetTableRefRangeController = class extends Disposable {
  constructor(_commandService, _refRangeService, _univerInstanceService, _injector, _sheetInterceptorService, _tableManager, _localeService) {
    super();
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_refRangeService", _refRangeService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_tableManager", _tableManager);
    __publicField(this, "_localeService", _localeService);
    this._initCommandInterceptor();
    this._initCommandListener();
  }
  _initCommandInterceptor() {
    const self = this;
    this._sheetInterceptorService.interceptCommand({
      priority: -1,
      getMutations(commandInfo) {
        const defaultReturn = { redos: [], undos: [] };
        const { id, params } = commandInfo;
        switch (id) {
          case InsertRowCommand.id:
            return self._generateTableMutationWithInsertRow(params);
          case InsertColCommand.id:
            return self._generateTableMutationWithInsertCol(params);
          case RemoveRowCommand.id:
            return self._generateTableMutationWithRemoveRow(params);
          case RemoveColCommand.id:
            return self._generateTableMutationWithRemoveCol(params);
        }
        return defaultReturn;
      }
    });
  }
  _generateTableMutationWithInsertRow(insertParams) {
    const undos = [];
    const redos = [];
    const target = getSheetCommandTarget(this._univerInstanceService, insertParams);
    if (!target) {
      return { undos, redos };
    }
    const { unitId, subUnitId } = target;
    const allSubUnitTables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
    if (!allSubUnitTables.length) {
      return { undos, redos };
    }
    const { range } = insertParams;
    allSubUnitTables.forEach((table) => {
      const tableRange = table.getRange();
      if (range.startRow > tableRange.startRow && range.startRow <= tableRange.endRow) {
        const insertRowCount = range.endRow - range.startRow + 1;
        redos.push({
          id: SetSheetTableMutation.id,
          params: {
            unitId,
            subUnitId,
            tableId: table.getId(),
            config: {
              updateRange: {
                newRange: {
                  ...tableRange,
                  endRow: tableRange.endRow + insertRowCount
                }
              }
            }
          }
        });
        undos.push({
          id: SetSheetTableMutation.id,
          params: {
            unitId,
            subUnitId,
            tableId: table.getId(),
            config: {
              updateRange: {
                newRange: {
                  ...tableRange
                }
              }
            }
          }
        });
      }
    });
    return { undos, redos };
  }
  _generateTableMutationWithInsertCol(insertParams) {
    const undos = [];
    const redos = [];
    const target = getSheetCommandTarget(this._univerInstanceService, insertParams);
    if (!target) {
      return { undos, redos };
    }
    const { unitId, subUnitId } = target;
    const allSubUnitTables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
    if (!allSubUnitTables.length) {
      return { undos, redos };
    }
    const { range } = insertParams;
    allSubUnitTables.forEach((table) => {
      const tableRange = table.getRange();
      if (range.startColumn > tableRange.startColumn && range.startColumn <= tableRange.endColumn) {
        const insertColCount = range.endColumn - range.startColumn + 1;
        redos.push({
          id: SetSheetTableMutation.id,
          params: {
            unitId,
            subUnitId,
            tableId: table.getId(),
            config: {
              rowColOperation: {
                operationType: "insert" /* Insert */,
                rowColType: "column" /* Col */,
                index: range.startColumn,
                count: insertColCount
              }
            }
          }
        });
        undos.push({
          id: SetSheetTableMutation.id,
          params: {
            unitId,
            subUnitId,
            tableId: table.getId(),
            config: {
              rowColOperation: {
                operationType: "delete" /* Delete */,
                rowColType: "column" /* Col */,
                index: range.startColumn,
                count: insertColCount
              }
            }
          }
        });
      }
    });
    return { undos, redos };
  }
  _generateTableMutationWithRemoveRow(removeParams) {
    const undos = [];
    const redos = [];
    const preRedos = [];
    const preUndos = [];
    const target = getSheetCommandTarget(this._univerInstanceService);
    if (!target) {
      return { undos, redos, preRedos, preUndos };
    }
    const { unitId, subUnitId } = target;
    const allSubUnitTables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
    if (!allSubUnitTables.length) {
      return { undos, redos, preRedos, preUndos };
    }
    const { range } = removeParams;
    const removeRowCount = range.endRow - range.startRow + 1;
    allSubUnitTables.forEach((table) => {
      const tableRange = table.getRange();
      if (Rectangle.intersects(tableRange, range)) {
        if (range.startRow <= tableRange.startRow && range.endRow >= tableRange.startRow) {
          preRedos.push({
            id: DeleteSheetTableMutation.id,
            params: {
              unitId,
              subUnitId,
              tableId: table.getId()
            }
          });
          const tableJson = table.toJSON();
          undos.push({
            id: AddSheetTableMutation.id,
            params: {
              unitId,
              subUnitId,
              tableId: tableJson.id,
              name: tableJson.name,
              range: tableJson.range,
              options: tableJson.options
            }
          });
        } else if (range.startRow > tableRange.startRow && range.startRow <= tableRange.endRow) {
          redos.push({
            id: SetSheetTableMutation.id,
            params: {
              unitId,
              subUnitId,
              tableId: table.getId(),
              config: {
                updateRange: {
                  newRange: {
                    ...tableRange,
                    endRow: tableRange.endRow - removeRowCount
                  }
                }
              }
            }
          });
          undos.push({
            id: SetSheetTableMutation.id,
            params: {
              unitId,
              subUnitId,
              tableId: table.getId(),
              config: {
                updateRange: {
                  newRange: {
                    ...tableRange
                  }
                }
              }
            }
          });
        } else if (range.startRow < tableRange.endRow && range.endRow >= tableRange.endRow) {
          redos.push({
            id: SetSheetTableMutation.id,
            params: {
              unitId,
              subUnitId,
              tableId: table.getId(),
              config: {
                updateRange: {
                  newRange: {
                    ...tableRange,
                    endRow: range.startRow - 1
                  }
                }
              }
            }
          });
          undos.push({
            id: SetSheetTableMutation.id,
            params: {
              unitId,
              subUnitId,
              tableId: table.getId(),
              config: {
                updateRange: {
                  newRange: {
                    ...tableRange
                  }
                }
              }
            }
          });
        }
      }
    });
    return { undos, redos, preRedos, preUndos };
  }
  _generateTableMutationWithRemoveCol(removeParams) {
    const undos = [];
    const redos = [];
    const preRedos = [];
    const preUndos = [];
    const target = getSheetCommandTarget(this._univerInstanceService);
    if (!target) {
      return { undos, redos, preRedos, preUndos };
    }
    const { unitId, subUnitId } = target;
    const allSubUnitTables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
    if (!allSubUnitTables.length) {
      return { undos, redos, preRedos, preUndos };
    }
    const { range } = removeParams;
    const removeColCount = range.endColumn - range.startColumn + 1;
    allSubUnitTables.forEach((table) => {
      var _a, _b;
      const tableRange = table.getRange();
      if (Rectangle.intersects(tableRange, range)) {
        if (range.startColumn <= tableRange.startColumn && range.endColumn >= tableRange.endColumn) {
          const tableInfo = table.getTableInfo();
          const formulaMutations = this._sheetInterceptorService.onCommandExecute({
            id: DELETE_SHEET_TABLE_COMMAND_ID,
            params: {
              unitId,
              subUnitId,
              tableId: table.getId(),
              tableName: tableInfo.name
            }
          });
          preRedos.push(...(_a = formulaMutations.preRedos) != null ? _a : [], ...formulaMutations.redos);
          preRedos.push({
            id: DeleteSheetTableMutation.id,
            params: {
              unitId,
              subUnitId,
              tableId: table.getId()
            }
          });
          const tableJson = table.toJSON();
          const { startRow, startColumn, endColumn } = tableJson.range;
          const workbook = this._univerInstanceService.getUnit(unitId);
          const worksheet = workbook == null ? void 0 : workbook.getSheetBySheetId(subUnitId);
          if (!worksheet) {
            return { undos, redos, preRedos, preUndos };
          }
          const header = [];
          for (let i = startColumn; i <= endColumn; i++) {
            header.push(convertCellDataToString(worksheet == null ? void 0 : worksheet.getCell(startRow, i)) || getColumnName(i - startColumn + 1, this._localeService.t("sheets-table.columnPrefix")));
          }
          undos.push({
            id: AddSheetTableMutation.id,
            params: {
              unitId,
              subUnitId,
              tableId: tableJson.id,
              name: tableJson.name,
              header,
              range: tableJson.range,
              options: tableJson.options
            }
          });
          undos.push(...(_b = formulaMutations.preUndos) != null ? _b : [], ...formulaMutations.undos);
        } else if (range.startColumn <= tableRange.startColumn && range.endColumn >= tableRange.startColumn) {
          const tableJson = table.toJSON();
          const removeColumnCount = range.endColumn - tableRange.startColumn + 1;
          redos.push({
            id: SetSheetTableMutation.id,
            params: {
              unitId,
              subUnitId,
              tableId: table.getId(),
              config: {
                rowColOperation: {
                  operationType: "delete" /* Delete */,
                  rowColType: "column" /* Col */,
                  index: tableRange.startColumn,
                  count: removeColumnCount
                }
              }
            }
          });
          const columns = [];
          for (let i = 0; i < removeColumnCount; i++) {
            const column = table.getTableColumnByIndex(i);
            if (column) {
              columns.push(column.toJSON());
            }
          }
          preUndos.push(this._getDeleteTableMutation(unitId, subUnitId, table.getId()));
          undos.push(this._getAddTableMutation(unitId, subUnitId, tableJson));
          this._appendTableColumnFormulaMutations(redos, undos, {
            unitId,
            subUnitId,
            tableId: table.getId(),
            tableName: table.getTableInfo().name,
            range,
            columns
          });
        } else if (range.startColumn > tableRange.startColumn && range.endColumn > tableRange.endColumn) {
          const tableJson = table.toJSON();
          const removeColumnCount = tableRange.endColumn - range.startColumn + 1;
          redos.push({
            id: SetSheetTableMutation.id,
            params: {
              unitId,
              subUnitId,
              tableId: table.getId(),
              config: {
                rowColOperation: {
                  operationType: "delete" /* Delete */,
                  rowColType: "column" /* Col */,
                  index: range.startColumn,
                  count: removeColumnCount
                }
              }
            }
          });
          const columns = [];
          const gap = range.startColumn - tableRange.startColumn;
          for (let i = 0; i < removeColumnCount; i++) {
            const column = table.getTableColumnByIndex(i + gap);
            if (column) {
              columns.push(column.toJSON());
            }
          }
          preUndos.push(this._getDeleteTableMutation(unitId, subUnitId, table.getId()));
          undos.push(this._getAddTableMutation(unitId, subUnitId, tableJson));
          this._appendTableColumnFormulaMutations(redos, undos, {
            unitId,
            subUnitId,
            tableId: table.getId(),
            tableName: table.getTableInfo().name,
            range,
            columns
          });
        } else if (range.startColumn > tableRange.startColumn && range.endColumn <= tableRange.endColumn) {
          const tableJson = table.toJSON();
          redos.push({
            id: SetSheetTableMutation.id,
            params: {
              unitId,
              subUnitId,
              tableId: table.getId(),
              config: {
                rowColOperation: {
                  operationType: "delete" /* Delete */,
                  rowColType: "column" /* Col */,
                  index: range.startColumn,
                  count: removeColCount
                }
              }
            }
          });
          const columns = [];
          const gap = range.startColumn - tableRange.startColumn;
          for (let i = 0; i < removeColCount; i++) {
            const column = table.getTableColumnByIndex(i + gap);
            if (column) {
              columns.push(column.toJSON());
            }
          }
          preUndos.push(this._getDeleteTableMutation(unitId, subUnitId, table.getId()));
          undos.push(this._getAddTableMutation(unitId, subUnitId, tableJson));
          this._appendTableColumnFormulaMutations(redos, undos, {
            unitId,
            subUnitId,
            tableId: table.getId(),
            tableName: table.getTableInfo().name,
            range,
            columns
          });
        }
      }
    });
    return { undos, redos, preRedos, preUndos };
  }
  _getDeleteTableMutation(unitId, subUnitId, tableId) {
    return {
      id: DeleteSheetTableMutation.id,
      params: {
        unitId,
        subUnitId,
        tableId
      }
    };
  }
  _getAddTableMutation(unitId, subUnitId, tableJson) {
    const header = tableJson.columns.map((column) => column.displayName);
    return {
      id: AddSheetTableMutation.id,
      params: {
        unitId,
        subUnitId,
        tableId: tableJson.id,
        name: tableJson.name,
        header,
        range: tableJson.range,
        options: {
          ...tableJson.options,
          columns: tableJson.columns,
          filters: tableJson.filters.tableColumnFilterList
        }
      }
    };
  }
  _appendTableColumnFormulaMutations(redos, undos, info) {
    var _a, _b;
    const removedColumnNames = info.columns.map((column) => column.displayName);
    if (!removedColumnNames.length) {
      return;
    }
    const formulaMutations = this._sheetInterceptorService.onCommandExecute({
      id: SHEET_TABLE_REMOVE_COL_COMMAND_ID,
      params: {
        unitId: info.unitId,
        subUnitId: info.subUnitId,
        tableId: info.tableId,
        tableName: info.tableName,
        range: info.range,
        removedColumnNames
      }
    });
    redos.splice(Math.max(redos.length - 1, 0), 0, ...(_a = formulaMutations.preRedos) != null ? _a : [], ...formulaMutations.redos);
    undos.push(...(_b = formulaMutations.preUndos) != null ? _b : [], ...formulaMutations.undos);
  }
  _initCommandListener() {
    this._commandService.onCommandExecuted((commandInfo) => {
      if (commandInfo.id === InsertRowMutation.id) {
        const params = commandInfo.params;
        const { unitId, subUnitId, range } = params;
        const insertCount = range.endRow - range.startRow + 1;
        const allTables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
        allTables.forEach((table) => {
          const tableRange = table.getRange();
          if (range.startRow <= tableRange.startRow) {
            this._tableManager.updateTableRange(unitId, table.getId(), {
              newRange: {
                ...tableRange,
                startRow: tableRange.startRow + insertCount,
                endRow: tableRange.endRow + insertCount
              }
            });
          }
        });
      } else if (commandInfo.id === InsertColMutation.id) {
        const params = commandInfo.params;
        const { unitId, subUnitId, range } = params;
        const insertCount = range.endColumn - range.startColumn + 1;
        const allTables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
        allTables.forEach((table) => {
          const tableRange = table.getRange();
          if (range.startColumn <= tableRange.startColumn) {
            this._tableManager.updateTableRange(unitId, table.getId(), {
              newRange: {
                ...tableRange,
                startColumn: tableRange.startColumn + insertCount,
                endColumn: tableRange.endColumn + insertCount
              }
            });
          }
        });
      } else if (commandInfo.id === RemoveRowMutation.id) {
        const params = commandInfo.params;
        const { unitId, subUnitId, range } = params;
        const removeCount = range.endRow - range.startRow + 1;
        const allTables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
        allTables.forEach((table) => {
          const tableRange = table.getRange();
          if (range.startRow < tableRange.startRow) {
            this._tableManager.updateTableRange(unitId, table.getId(), {
              newRange: {
                ...tableRange,
                startRow: tableRange.startRow - removeCount,
                endRow: tableRange.endRow - removeCount
              }
            });
          }
        });
      } else if (commandInfo.id === RemoveColMutation.id) {
        const params = commandInfo.params;
        const { unitId, subUnitId, range } = params;
        const removeCount = range.endColumn - range.startColumn + 1;
        const allTables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
        allTables.forEach((table) => {
          const tableRange = table.getRange();
          if (range.startColumn < tableRange.startColumn) {
            this._tableManager.updateTableRange(unitId, table.getId(), {
              newRange: {
                ...tableRange,
                startColumn: tableRange.startColumn - removeCount,
                endColumn: tableRange.endColumn - removeCount
              }
            });
          }
        });
      }
    });
  }
};
SheetTableRefRangeController = __decorateClass([
  __decorateParam(0, Inject(ICommandService)),
  __decorateParam(1, Inject(RefRangeService)),
  __decorateParam(2, Inject(IUniverInstanceService)),
  __decorateParam(3, Inject(Injector)),
  __decorateParam(4, Inject(SheetInterceptorService)),
  __decorateParam(5, Inject(TableManager)),
  __decorateParam(6, Inject(LocaleService))
], SheetTableRefRangeController);

// ../packages/sheets-table/src/controllers/sheet-table-theme.controller.ts
var SheetsTableThemeController = class extends Disposable {
  constructor(_tableManager, _sheetRangeThemeService, _sheetRangeThemeModel, _configService) {
    super();
    __publicField(this, "_tableManager", _tableManager);
    __publicField(this, "_sheetRangeThemeService", _sheetRangeThemeService);
    __publicField(this, "_sheetRangeThemeModel", _sheetRangeThemeModel);
    __publicField(this, "_configService", _configService);
    __publicField(this, "_defaultThemeIndex", 0);
    __publicField(this, "_allThemes", []);
    this._initUserTableTheme();
    this.registerTableChangeEvent();
    this._initDefaultTableTheme();
  }
  registerTableChangeEvent() {
    this.disposeWithMe(
      this._tableManager.tableAdd$.subscribe((event) => {
        const { range, tableId, unitId, subUnitId, tableStyleId } = event;
        const table = this._tableManager.getTable(unitId, tableId);
        const _tableStyleId = tableStyleId || this._allThemes[this._defaultThemeIndex].name;
        table.setTableStyleId(_tableStyleId);
        this._sheetRangeThemeService.registerRangeThemeStyle(_tableStyleId, {
          unitId,
          subUnitId,
          range: { ...range }
        });
      })
    );
    this.disposeWithMe(
      this._tableManager.tableRangeChanged$.subscribe((event) => {
        const { range, oldRange, tableId, unitId, subUnitId } = event;
        const table = this._tableManager.getTable(unitId, tableId);
        let tableStyleId = table.getTableStyleId();
        if (!tableStyleId) {
          tableStyleId = this._allThemes[this._defaultThemeIndex].name;
          table.setTableStyleId(tableStyleId);
        }
        this._sheetRangeThemeService.removeRangeThemeRule(tableStyleId, {
          unitId,
          subUnitId,
          range: { ...oldRange }
        });
        this._sheetRangeThemeService.registerRangeThemeStyle(tableStyleId, {
          unitId,
          subUnitId,
          range: { ...range }
        });
      })
    );
    this.disposeWithMe(
      this._tableManager.tableThemeChanged$.subscribe((event) => {
        const { theme, oldTheme, tableId, unitId, subUnitId } = event;
        const table = this._tableManager.getTable(unitId, tableId);
        const range = table.getRange();
        this._sheetRangeThemeService.removeRangeThemeRule(oldTheme, {
          unitId,
          subUnitId,
          range: { ...range }
        });
        this._sheetRangeThemeService.registerRangeThemeStyle(theme, {
          unitId,
          subUnitId,
          range: { ...range }
        });
      })
    );
    this.disposeWithMe(
      this._tableManager.tableDelete$.subscribe((event) => {
        const { range, unitId, subUnitId, tableStyleId = this._allThemes[this._defaultThemeIndex].name } = event;
        this._sheetRangeThemeService.removeRangeThemeRule(tableStyleId, {
          unitId,
          subUnitId,
          range: { ...range }
        });
      })
    );
  }
  _initUserTableTheme() {
    const tableConfig = this._configService.getConfig(SHEETS_TABLE_PLUGIN_CONFIG_KEY) || {};
    const defaultThemeIndex = tableConfig.defaultThemeIndex || 0;
    const userThemes = tableConfig.userThemes || [];
    this._defaultThemeIndex = defaultThemeIndex;
    this._allThemes = userThemes.concat(tableThemeConfig);
  }
  _initDefaultTableTheme() {
    for (let i = 0; i < this._allThemes.length; i++) {
      const { name, style } = this._allThemes[i];
      const rangeThemeStyle = new RangeThemeStyle(name, style);
      this._sheetRangeThemeModel.registerDefaultRangeTheme(rangeThemeStyle);
    }
  }
  dispose() {
    super.dispose();
    this._allThemes = [];
    this._defaultThemeIndex = 0;
  }
};
SheetsTableThemeController = __decorateClass([
  __decorateParam(0, Inject(TableManager)),
  __decorateParam(1, Inject(SheetRangeThemeService)),
  __decorateParam(2, Inject(SheetRangeThemeModel)),
  __decorateParam(3, IConfigService)
], SheetsTableThemeController);

// ../packages/sheets-table/src/controllers/table-filter.controller.ts
var TableFilterController = class extends Disposable {
  constructor(_tableManager, _sheetInterceptorService, _univerInstanceService, _zebraCrossingCacheController) {
    super();
    __publicField(this, "_tableManager", _tableManager);
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_zebraCrossingCacheController", _zebraCrossingCacheController);
    __publicField(this, "_tableFilteredOutRows", /* @__PURE__ */ new Map());
    __publicField(this, "_subscription", null);
    this.registerFilterChangeEvent();
    this.initTableHiddenRowIntercept();
    this._initFilteredOutRows();
  }
  initTableHiddenRowIntercept() {
    this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.ROW_FILTERED, {
      // Priority must be higher than sheet filtering, because filtering has no next, and those below filtering will not trigger interceptor
      priority: 100,
      handler: (filtered, rowLocation, next) => {
        if (filtered) return true;
        const isTableFiltered = this._getTableFilteredOutRows(rowLocation.unitId, rowLocation.subUnitId).has(rowLocation.row);
        return isTableFiltered ? true : next(isTableFiltered);
      }
    }));
  }
  _initFilteredOutRows() {
    this._tableManager.tableInitStatus$.pipe(
      filter((initialized) => initialized),
      switchMap(() => {
        return this._univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */);
      }),
      filter((workbook) => workbook !== null && workbook !== void 0),
      switchMap((workbook) => workbook.activeSheet$),
      filter((sheet) => sheet !== null && sheet !== void 0)
    ).subscribe(() => {
      const target = getSheetCommandTarget(this._univerInstanceService);
      if (!target) {
        return;
      }
      const { unitId, subUnitId } = target;
      this._refreshTableFilteredOutRows(unitId, subUnitId);
    });
  }
  registerFilterChangeEvent() {
    this.disposeWithMe(
      this._tableManager.tableFilterChanged$.subscribe((event) => {
        var _a;
        const { unitId, subUnitId, tableId } = event;
        const worksheet = (_a = this._univerInstanceService.getUnit(unitId)) == null ? void 0 : _a.getSheetBySheetId(subUnitId);
        const table = this._tableManager.getTable(unitId, tableId);
        if (!worksheet || !table) {
          return;
        }
        const tableFilter = table.getTableFilters();
        tableFilter.doFilter(worksheet, table.getTableFilterRange());
        this._refreshTableFilteredOutRows(unitId, subUnitId);
        this._zebraCrossingCacheController.updateZebraCrossingCache(unitId, subUnitId);
      })
    );
  }
  _refreshTableFilteredOutRows(unitId, subUnitId) {
    const filteredOutRows = /* @__PURE__ */ new Set();
    const tables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
    tables.forEach((table) => {
      const tableFilteredRows = table.getTableFilters().getFilterOutRows();
      if (!tableFilteredRows) {
        return;
      }
      for (const row of tableFilteredRows) {
        filteredOutRows.add(row);
      }
    });
    this._tableFilteredOutRows.set(this._getSheetKey(unitId, subUnitId), filteredOutRows);
  }
  _getTableFilteredOutRows(unitId, subUnitId) {
    var _a;
    return (_a = this._tableFilteredOutRows.get(this._getSheetKey(unitId, subUnitId))) != null ? _a : /* @__PURE__ */ new Set();
  }
  _getSheetKey(unitId, subUnitId) {
    return `${unitId}|${subUnitId}`;
  }
  dispose() {
    var _a;
    super.dispose();
    (_a = this._subscription) == null ? void 0 : _a.unsubscribe();
  }
};
TableFilterController = __decorateClass([
  __decorateParam(0, Inject(TableManager)),
  __decorateParam(1, Inject(SheetInterceptorService)),
  __decorateParam(2, Inject(IUniverInstanceService)),
  __decorateParam(3, Inject(ZebraCrossingCacheController))
], TableFilterController);

// ../packages/sheets-table/src/plugin.ts
var UniverSheetsTablePlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig2, _injector, _configService, _commandService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_configService", _configService);
    __publicField(this, "_commandService", _commandService);
    const { ...rest } = merge_default(
      {},
      defaultPluginConfig2,
      this._config
    );
    this._configService.setConfig(SHEETS_TABLE_PLUGIN_CONFIG_KEY, rest);
    this._initRegisterCommand();
  }
  onStarting() {
    registerDependencies(this._injector, [
      [TableManager],
      [SheetsTableThemeController],
      [SheetsTableController],
      [SheetTableService],
      [TableFilterController],
      [SheetTableRangeController],
      [SheetTableRefRangeController],
      [SheetTableFormulaController]
    ]);
  }
  onReady() {
    touchDependencies(this._injector, [
      [SheetTableFormulaController],
      [SheetTableRangeController],
      [SheetTableRefRangeController],
      [SheetsTableThemeController],
      [SheetsTableController],
      [SheetTableService],
      [TableFilterController]
    ]);
    touchDependencies(this._injector, [
      [TableManager]
    ]);
  }
  _initRegisterCommand() {
    [
      AddSheetTableCommand,
      AddSheetTableMutation,
      DeleteSheetTableCommand,
      DeleteSheetTableMutation,
      SetSheetTableFilterMutation,
      SetSheetTableFilterCommand,
      SetSheetTableCommand,
      SetSheetTableMutation,
      AddTableThemeCommand,
      RemoveTableThemeCommand,
      SheetTableInsertRowCommand,
      SheetTableInsertColCommand,
      SheetTableInsertRowAtCommand,
      SheetTableInsertColumnAtCommand,
      SheetTableRemoveRowCommand,
      SheetTableRemoveColCommand,
      SheetTableRemoveColumnAtCommand
    ].forEach((m) => this._commandService.registerCommand(m));
  }
};
__publicField(UniverSheetsTablePlugin, "pluginName", PLUGIN_NAME2);
__publicField(UniverSheetsTablePlugin, "packageName", package_default2.name);
__publicField(UniverSheetsTablePlugin, "version", package_default2.version);
__publicField(UniverSheetsTablePlugin, "type", 2 /* UNIVER_SHEET */);
UniverSheetsTablePlugin = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IConfigService),
  __decorateParam(3, Inject(ICommandService))
], UniverSheetsTablePlugin);

export {
  SheetsNoteModel,
  UpdateNoteMutation,
  RemoveNoteMutation,
  SheetDeleteNoteCommand,
  SheetToggleNotePopupCommand,
  SheetUpdateNoteCommand,
  UniverSheetsNotePlugin,
  TableColumnFilterTypeEnum,
  TableConditionTypeEnum,
  TableNumberCompareTypeEnum,
  TableStringCompareTypeEnum,
  TableDateCompareTypeEnum,
  isConditionFilter,
  isManualTableFilter,
  getExistingNamesSet,
  customEmptyThemeWithBorderStyle,
  processStyleWithBorderStyle,
  SHEET_TABLE_CUSTOM_THEME_PREFIX,
  TABLE_FILTER_EMPTY_VALUE,
  TableManager,
  SheetTableService,
  AddSheetTableCommand,
  AddTableThemeCommand,
  DeleteSheetTableCommand,
  RemoveTableThemeCommand,
  validateSheetTableName,
  SetSheetTableCommand,
  SetSheetTableFilterCommand,
  SheetsTableController,
  SheetTableInsertRowCommand,
  SheetTableInsertRowAtCommand,
  SheetTableInsertColCommand,
  SheetTableInsertColumnAtCommand,
  SheetTableRemoveColumnAtCommand,
  SheetTableRemoveRowCommand,
  SheetTableRemoveColCommand,
  UniverSheetsTablePlugin
};
