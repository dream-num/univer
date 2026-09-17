import {
  HTTPService,
  WebSocketService
} from "./chunk-BMS77Y3S.js";
import {
  FRange,
  FWorkbook,
  FWorksheet
} from "./chunk-POBEMVCS.js";
import {
  AddSheetTableCommand,
  AddTableThemeCommand,
  DeleteSheetTableCommand,
  RemoveNoteMutation,
  SetSheetTableCommand,
  SetSheetTableFilterCommand,
  SheetDeleteNoteCommand,
  SheetTableService,
  SheetToggleNotePopupCommand,
  SheetUpdateNoteCommand,
  SheetsNoteModel,
  TableColumnFilterTypeEnum,
  TableConditionTypeEnum,
  TableDateCompareTypeEnum,
  TableNumberCompareTypeEnum,
  TableStringCompareTypeEnum,
  UpdateNoteMutation
} from "./chunk-SPJ3J4VO.js";
import {
  FBase,
  FEnum,
  FEventName,
  FUniver
} from "./chunk-2WA7JL2E.js";
import {
  GlobalRangeSelectorService
} from "./chunk-DMIB6PSO.js";
import {
  RangeThemeStyle,
  SheetsSelectionsService,
  getSheetCommandTarget
} from "./chunk-Q6Y4PHRI.js";
import {
  CanceledError,
  ICommandService,
  ILogService,
  IUniverInstanceService,
  Inject,
  Injector,
  LocaleService,
  Rectangle,
  cellToRange,
  customNameCharacterCheck
} from "./chunk-EJSPXROI.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField
} from "./chunk-24OICD5T.js";

// ../packages/sheets-formula-ui/src/facade/f-univer.ts
var FUniverSheetsFormulaUIMixin = class extends FUniver {
  showRangeSelectorDialog(opts) {
    const globalRangeSelectorService = this._injector.get(GlobalRangeSelectorService);
    return globalRangeSelectorService.showRangeSelectorDialog(opts);
  }
};
FUniver.extend(FUniverSheetsFormulaUIMixin);

// ../packages/sheets-table/src/facade/f-workbook.ts
var FWorkbookSheetsTableMixin = class extends FWorkbook {
  getTableInfo(tableId) {
    const unitId = this.getId();
    const sheetTableService = this._injector.get(SheetTableService);
    return sheetTableService.getTableInfo(unitId, tableId);
  }
  getTableList() {
    const unitId = this.getId();
    const sheetTableService = this._injector.get(SheetTableService);
    return sheetTableService.getTableList(unitId);
  }
  async addTable(subUnitId, tableName, rangeInfo, tableId, options) {
    var _a;
    const sheetTableService = this._injector.get(SheetTableService);
    const localeService = this._injector.get(LocaleService);
    const univerInstanceService = this._injector.get(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    const sheetNameSet = /* @__PURE__ */ new Set();
    if (workbook) {
      workbook.getSheets().forEach((sheet) => {
        sheetNameSet.add(sheet.getName());
      });
    }
    const isValidName = customNameCharacterCheck(tableName, sheetNameSet);
    if (!isValidName) {
      const logService = this._injector.get(ILogService);
      logService.warn(localeService.t("sheets-table.tableNameError"));
      return void 0;
    }
    const addTableParams = {
      unitId: this.getId(),
      name: tableName,
      subUnitId,
      range: rangeInfo,
      options,
      id: tableId
    };
    const rs = await this._commandService.executeCommand(AddSheetTableCommand.id, addTableParams);
    if (rs) {
      return (_a = sheetTableService.getTableList(this.getId()).find((table) => table.name === tableName)) == null ? void 0 : _a.id;
    }
    return void 0;
  }
  async removeTable(tableId) {
    var _a;
    const subUnitId = (_a = this.getTableInfo(tableId)) == null ? void 0 : _a.subUnitId;
    if (!subUnitId) {
      return false;
    }
    const removedTableParams = {
      unitId: this.getId(),
      subUnitId,
      tableId
    };
    return this._commandService.executeCommand(DeleteSheetTableCommand.id, removedTableParams);
  }
  getTableInfoByName(tableName) {
    const tableList = this.getTableList();
    return tableList.find((table) => table.name === tableName);
  }
  setTableFilter(tableId, column, filter) {
    const setTableFilterParams = {
      unitId: this.getId(),
      tableId,
      column,
      tableFilter: filter
    };
    return this._commandService.executeCommand(SetSheetTableFilterCommand.id, setTableFilterParams);
  }
};
FWorkbook.extend(FWorkbookSheetsTableMixin);

// ../packages/sheets-table/src/facade/f-worksheet.ts
var FWorksheetTableMixin = class extends FWorksheet {
  addTable(tableName, rangeInfo, tableId, options) {
    const subUnitId = this.getSheetId();
    const workbook = this.getWorkbook();
    const unitId = workbook.getUnitId();
    const localeService = this._injector.get(LocaleService);
    const sheetNameSet = /* @__PURE__ */ new Set();
    if (workbook) {
      workbook.getSheets().forEach((sheet) => {
        sheetNameSet.add(sheet.getName());
      });
    }
    const isValidName = customNameCharacterCheck(tableName, sheetNameSet);
    if (!isValidName) {
      const logService = this._injector.get(ILogService);
      logService.warn(localeService.t("sheets-table.tableNameError"));
      return false;
    }
    const addTableParams = {
      unitId,
      subUnitId,
      name: tableName,
      range: rangeInfo,
      id: tableId,
      options
    };
    return this._commandService.executeCommand(AddSheetTableCommand.id, addTableParams);
  }
  setTableFilter(tableId, column, filter) {
    const setTableFilterParams = {
      unitId: this.getWorkbook().getUnitId(),
      tableId,
      column,
      tableFilter: filter
    };
    return this._commandService.executeCommand(SetSheetTableFilterCommand.id, setTableFilterParams);
  }
  removeTable(tableId) {
    const removedTableParams = {
      unitId: this._fWorkbook.getId(),
      subUnitId: this.getSheetId(),
      tableId
    };
    return this._commandService.executeCommand(DeleteSheetTableCommand.id, removedTableParams);
  }
  setTableRange(tableId, rangeInfo) {
    const tableSetConfig = {
      unitId: this.getWorkbook().getUnitId(),
      tableId,
      updateRange: {
        newRange: rangeInfo
      }
    };
    return this._commandService.executeCommand(SetSheetTableCommand.id, tableSetConfig);
  }
  setTableName(tableId, tableName) {
    const workbook = this.getWorkbook();
    const localeService = this._injector.get(LocaleService);
    const sheetNameSet = /* @__PURE__ */ new Set();
    if (workbook) {
      workbook.getSheets().forEach((sheet) => {
        sheetNameSet.add(sheet.getName());
      });
    }
    const isValidName = customNameCharacterCheck(tableName, sheetNameSet);
    if (!isValidName) {
      const logService = this._injector.get(ILogService);
      logService.warn(localeService.t("sheets-table.tableNameError"));
      return false;
    }
    const tableSetConfig = {
      unitId: this.getWorkbook().getUnitId(),
      tableId,
      name: tableName
    };
    return this._commandService.executeCommand(SetSheetTableCommand.id, tableSetConfig);
  }
  getSubTableInfos() {
    const unitId = this._fWorkbook.getId();
    const sheetTableService = this._injector.get(SheetTableService);
    return sheetTableService.getTableList(unitId).filter((table) => table.subUnitId === this.getSheetId());
  }
  resetFilter(tableId, column) {
    const setTableFilterParams = {
      unitId: this._fWorkbook.getId(),
      tableId,
      column,
      tableFilter: void 0
    };
    return this._commandService.executeCommand(SetSheetTableFilterCommand.id, setTableFilterParams);
  }
  getTableByCell(row, column) {
    const unitId = this._fWorkbook.getId();
    const sheetTableService = this._injector.get(SheetTableService);
    const allSubTableInfos = sheetTableService.getTableList(unitId).filter((table) => table.subUnitId === this.getSheetId());
    const cellRange = cellToRange(row, column);
    return allSubTableInfos.find((table) => {
      const tableRange = table.range;
      return Rectangle.intersects(tableRange, cellRange);
    });
  }
  addTableTheme(tableId, themeStyleJSON) {
    const themeStyle = new RangeThemeStyle("table-style");
    themeStyle.fromJson(themeStyleJSON);
    return this._commandService.executeCommand(AddTableThemeCommand.id, {
      unitId: this._fWorkbook.getId(),
      tableId,
      themeStyle
    });
  }
};
FWorksheet.extend(FWorksheetTableMixin);

// ../packages/sheets-table/src/facade/f-enum.ts
var FSheetsTableEnumMixin = class extends FEnum {
  get TableColumnFilterTypeEnum() {
    return TableColumnFilterTypeEnum;
  }
  get TableConditionTypeEnum() {
    return TableConditionTypeEnum;
  }
  get TableNumberCompareTypeEnum() {
    return TableNumberCompareTypeEnum;
  }
  get TableStringCompareTypeEnum() {
    return TableStringCompareTypeEnum;
  }
  get TableDateCompareTypeEnum() {
    return TableDateCompareTypeEnum;
  }
};
FEnum.extend(FSheetsTableEnumMixin);

// ../packages/network/src/facade/f-network.ts
var FNetwork = class extends FBase {
  constructor(_injector, _httpService) {
    super();
    __publicField(this, "_injector", _injector);
    __publicField(this, "_httpService", _httpService);
  }
  /**
   * Send a GET request to the server.
   * @param {string} url - The requested URL.
   * @param {IRequestParams} [params] - Query parameters.
   * @returns {Promise<HTTPResponse>} Network response.
   */
  get(url, params) {
    return this._httpService.get(url, params);
    ;
  }
  /**
   * Send a POST request to the server.
   * @param {string} url - The requested URL.
   * @param {IPostRequestParams} [params] - Query parameters.
   * @returns {Promise<HTTPResponse>} Network response.
   */
  post(url, params) {
    return this._httpService.post(url, params);
    ;
  }
  /**
   * Send a PUT request to the server.
   * @param {string} url - The requested URL
   * @param {IPostRequestParams} [params] - Query parameters
   * @returns {Promise<HTTPResponse>} Network response
   */
  put(url, params) {
    return this._httpService.put(url, params);
    ;
  }
  /**
   * Send DELETE request to the server.
   * @param {string} url - The requested URL
   * @param {IRequestParams} [params] - Query parameters
   * @returns {Promise<HTTPResponse>} Network response
   */
  delete(url, params) {
    return this._httpService.delete(url, params);
    ;
  }
  /**
   * Send PATCH request to the server.
   * @param {string} url - The requested URL
   * @param {IPostRequestParams} [params] - Query parameters
   * @returns {Promise<HTTPResponse>} Network response
   */
  patch(url, params) {
    return this._httpService.patch(url, params);
  }
  /**
   * Request for a stream of server-sent events. Instead of a single response, the server sends a stream of responses,
   * Univer wraps the stream in an [`Observable`](https://rxjs.dev/guide/observable) which you can call `subscribe` on.
   * @param {HTTPRequestMethod} method - HTTP request method
   * @param {string} url - The requested URL
   * @param {IPostRequestParams} [params] - params Query parameters
   * @returns {Observable<HTTPEvent>} An observable that emits the network response.
   */
  getSSE(method, url, params) {
    return this._httpService.getSSE(method, url, params);
  }
};
FNetwork = __decorateClass([
  __decorateParam(0, Inject(Injector)),
  __decorateParam(1, Inject(HTTPService))
], FNetwork);

// ../packages/network/src/facade/f-univer.ts
var FUniverNetworkMixin = class extends FUniver {
  getNetwork() {
    return this._injector.createInstance(FNetwork);
  }
  createSocket(url) {
    const wsService = this._injector.createInstance(WebSocketService);
    const ws = wsService.createSocket(url);
    if (!ws) {
      throw new Error("[WebSocketService]: failed to create socket!");
    }
    return ws;
  }
};
FUniver.extend(FUniverNetworkMixin);

// ../packages/sheets-note/src/facade/f-event.ts
var FSheetsNoteEventNameMixin = class extends FEventName {
  get SheetNoteAdd() {
    return "SheetNoteAdd";
  }
  get SheetNoteDelete() {
    return "SheetNoteDelete";
  }
  get SheetNoteUpdate() {
    return "SheetNoteUpdate";
  }
  get SheetNoteShow() {
    return "SheetNoteShow";
  }
  get SheetNoteHide() {
    return "SheetNoteHide";
  }
  get BeforeSheetNoteAdd() {
    return "BeforeSheetNoteAdd";
  }
  get BeforeSheetNoteDelete() {
    return "BeforeSheetNoteDelete";
  }
  get BeforeSheetNoteUpdate() {
    return "BeforeSheetNoteUpdate";
  }
  get BeforeSheetNoteShow() {
    return "BeforeSheetNoteShow";
  }
  get BeforeSheetNoteHide() {
    return "BeforeSheetNoteHide";
  }
};
FEventName.extend(FSheetsNoteEventNameMixin);

// ../packages/sheets-note/src/facade/f-range.ts
var FRangeSheetsNoteMixin = class extends FRange {
  createOrUpdateNote(note) {
    this._commandService.syncExecuteCommand(
      UpdateNoteMutation.id,
      {
        unitId: this.getUnitId(),
        sheetId: this.getSheetId(),
        row: this.getRow(),
        col: this.getColumn(),
        note
      }
    );
    return this;
  }
  deleteNote() {
    this._commandService.syncExecuteCommand(
      RemoveNoteMutation.id,
      {
        unitId: this.getUnitId(),
        sheetId: this.getSheetId(),
        row: this.getRow(),
        col: this.getColumn()
      }
    );
    return this;
  }
  getNote() {
    const model = this._injector.get(SheetsNoteModel);
    return model.getNote(this.getUnitId(), this.getSheetId(), { row: this.getRow(), col: this.getColumn() });
  }
};
FRange.extend(FRangeSheetsNoteMixin);

// ../packages/sheets-note/src/facade/f-univer.ts
var FUniverSheetsNoteMixin = class extends FUniver {
  // eslint-disable-next-line max-lines-per-function
  _initialize(injector) {
    const commandService = injector.get(ICommandService);
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.SheetNoteAdd,
        () => {
          const model = injector.get(SheetsNoteModel);
          return model.change$.subscribe((change) => {
            if (change.type === "update" && !change.oldNote && change.newNote) {
              const { unitId, subUnitId, newNote } = change;
              const target = this.getSheetTarget(unitId, subUnitId);
              if (!target) {
                return;
              }
              const { workbook, worksheet } = target;
              const eventParams = {
                workbook,
                worksheet,
                row: newNote.row,
                col: newNote.col,
                note: newNote
              };
              this.fireEvent(this.Event.SheetNoteAdd, eventParams);
            }
          });
        }
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.SheetNoteDelete,
        () => {
          const model = injector.get(SheetsNoteModel);
          return model.change$.subscribe((change) => {
            if (change.type === "update" && change.oldNote && !change.newNote) {
              const { unitId, subUnitId, oldNote } = change;
              const target = this.getSheetTarget(unitId, subUnitId);
              if (!target) {
                return;
              }
              const { workbook, worksheet } = target;
              const eventParams = {
                workbook,
                worksheet,
                row: oldNote.row,
                col: oldNote.col,
                oldNote
              };
              this.fireEvent(this.Event.SheetNoteDelete, eventParams);
            }
          });
        }
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.SheetNoteUpdate,
        () => {
          const model = injector.get(SheetsNoteModel);
          return model.change$.subscribe((change) => {
            if (change.type === "update" && change.oldNote && change.newNote) {
              const { unitId, subUnitId, oldNote, newNote } = change;
              const target = this.getSheetTarget(unitId, subUnitId);
              if (!target) {
                return;
              }
              const { workbook, worksheet } = target;
              const eventParams = {
                workbook,
                worksheet,
                row: newNote.row,
                col: newNote.col,
                note: newNote,
                oldNote
              };
              this.fireEvent(this.Event.SheetNoteUpdate, eventParams);
            }
          });
        }
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.SheetNoteShow,
        () => {
          const model = injector.get(SheetsNoteModel);
          return model.change$.subscribe((change) => {
            if (change.type === "update" && change.oldNote && change.newNote && !change.oldNote.show && change.newNote.show) {
              const { unitId, subUnitId, newNote } = change;
              const target = this.getSheetTarget(unitId, subUnitId);
              if (!target) {
                return;
              }
              const { workbook, worksheet } = target;
              const eventParams = {
                workbook,
                worksheet,
                row: newNote.row,
                col: newNote.col
              };
              this.fireEvent(this.Event.SheetNoteShow, eventParams);
            }
          });
        }
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.SheetNoteHide,
        () => {
          const model = injector.get(SheetsNoteModel);
          return model.change$.subscribe((change) => {
            if (change.type === "update" && change.oldNote && change.newNote && change.oldNote.show && !change.newNote.show) {
              const { unitId, subUnitId, newNote } = change;
              const target = this.getSheetTarget(unitId, subUnitId);
              if (!target) {
                return;
              }
              const { workbook, worksheet } = target;
              const eventParams = {
                workbook,
                worksheet,
                row: newNote.row,
                col: newNote.col
              };
              this.fireEvent(this.Event.SheetNoteHide, eventParams);
            }
          });
        }
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.BeforeSheetNoteAdd,
        () => commandService.beforeCommandExecuted((command) => {
          if (command.id === SheetUpdateNoteCommand.id) {
            const { unitId, sheetId, row, col, note } = command.params;
            const target = this.getSheetTarget(unitId, sheetId);
            if (!target) return;
            const model = injector.get(SheetsNoteModel);
            const oldNote = model.getNote(unitId, sheetId, { noteId: note.id, row, col });
            if (oldNote) return;
            const { workbook, worksheet } = target;
            const eventParams = {
              workbook,
              worksheet,
              row,
              col,
              note
            };
            const cancel = this.fireEvent(this.Event.BeforeSheetNoteAdd, eventParams);
            if (cancel) {
              throw new CanceledError();
            }
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.BeforeSheetNoteDelete,
        () => commandService.beforeCommandExecuted((command) => {
          if (command.id === SheetDeleteNoteCommand.id) {
            const { unitId, sheetId, row, col } = command.params;
            const target = this.getSheetTarget(unitId, sheetId);
            if (!target) return;
            if (row === void 0 || col === void 0) return;
            const model = injector.get(SheetsNoteModel);
            const oldNote = model.getNote(unitId, sheetId, { row, col });
            if (!oldNote) return;
            const { workbook, worksheet } = target;
            const eventParams = {
              workbook,
              worksheet,
              row,
              col,
              oldNote
            };
            const cancel = this.fireEvent(this.Event.BeforeSheetNoteDelete, eventParams);
            if (cancel) {
              throw new CanceledError();
            }
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.BeforeSheetNoteUpdate,
        () => commandService.beforeCommandExecuted((command) => {
          if (command.id === SheetUpdateNoteCommand.id) {
            const { unitId, sheetId, row, col, note } = command.params;
            const target = this.getSheetTarget(unitId, sheetId);
            if (!target) return;
            const model = injector.get(SheetsNoteModel);
            const oldNote = model.getNote(unitId, sheetId, { row, col });
            if (!oldNote) return;
            const { workbook, worksheet } = target;
            const eventParams = {
              workbook,
              worksheet,
              row,
              col,
              note,
              oldNote
            };
            const cancel = this.fireEvent(this.Event.BeforeSheetNoteUpdate, eventParams);
            if (cancel) {
              throw new CanceledError();
            }
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.BeforeSheetNoteShow,
        () => commandService.beforeCommandExecuted((command) => {
          if (command.id === SheetToggleNotePopupCommand.id) {
            const target = getSheetCommandTarget(injector.get(IUniverInstanceService));
            if (!target) return;
            const { unitId, subUnitId } = target;
            const workbook = this.getUniverSheet(unitId);
            if (!workbook) return;
            const worksheet = workbook.getSheetBySheetId(subUnitId);
            if (!worksheet) return;
            const sheetsSelectionsService = injector.get(SheetsSelectionsService);
            const selection = sheetsSelectionsService.getCurrentLastSelection();
            if (!(selection == null ? void 0 : selection.primary)) return;
            const sheetsNoteModel = injector.get(SheetsNoteModel);
            const { actualColumn, actualRow } = selection.primary;
            const note = sheetsNoteModel.getNote(unitId, subUnitId, { row: actualRow, col: actualColumn });
            if (!note || note.show) return;
            const eventParams = {
              workbook,
              worksheet,
              row: actualRow,
              col: actualColumn
            };
            const cancel = this.fireEvent(this.Event.BeforeSheetNoteShow, eventParams);
            if (cancel) {
              throw new CanceledError();
            }
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.BeforeSheetNoteHide,
        () => commandService.beforeCommandExecuted((command) => {
          if (command.id === SheetToggleNotePopupCommand.id) {
            const target = getSheetCommandTarget(injector.get(IUniverInstanceService));
            if (!target) return;
            const { unitId, subUnitId } = target;
            const workbook = this.getUniverSheet(unitId);
            if (!workbook) return;
            const worksheet = workbook.getSheetBySheetId(subUnitId);
            if (!worksheet) return;
            const sheetsSelectionsService = injector.get(SheetsSelectionsService);
            const selection = sheetsSelectionsService.getCurrentLastSelection();
            if (!(selection == null ? void 0 : selection.primary)) return;
            const sheetsNoteModel = injector.get(SheetsNoteModel);
            const { actualColumn, actualRow } = selection.primary;
            const note = sheetsNoteModel.getNote(unitId, subUnitId, { row: actualRow, col: actualColumn });
            if (!note || !note.show) return;
            const eventParams = {
              workbook,
              worksheet,
              row: actualRow,
              col: actualColumn
            };
            const cancel = this.fireEvent(this.Event.BeforeSheetNoteHide, eventParams);
            if (cancel) {
              throw new CanceledError();
            }
          }
        })
      )
    );
  }
};
FUniver.extend(FUniverSheetsNoteMixin);

// ../packages/sheets-note/src/facade/f-worksheet.ts
var FWorksheetNoteMixin = class extends FWorksheet {
  getNotes() {
    const model = this._injector.get(SheetsNoteModel);
    const notes = model.getSheetNotes(this.getWorkbook().getUnitId(), this.getSheetId());
    if (!notes) {
      return [];
    }
    return Array.from(notes.values()).map((note) => ({ ...note }));
  }
};
FWorksheet.extend(FWorksheetNoteMixin);
