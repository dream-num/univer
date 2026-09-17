import {
  FBase,
  FBaseInitialable,
  FEnum,
  FEventName,
  FUniver
} from "./chunk-2WA7JL2E.js";
import {
  AddRangeProtectionMutation,
  AddWorksheetProtectionMutation,
  AppendRowCommand,
  AutoFillCommand,
  COMMAND_LISTENER_VALUE_CHANGE,
  CancelFrozenCommand,
  ClearSelectionAllCommand,
  ClearSelectionContentCommand,
  ClearSelectionFormatCommand,
  CopySheetCommand,
  DeleteRangeMoveLeftCommand,
  DeleteRangeMoveUpCommand,
  DeleteRangeProtectionMutation,
  DeleteWorksheetProtectionMutation,
  DeleteWorksheetRangeThemeStyleCommand,
  FormulaDataModel,
  IDefinedNamesService,
  IFunctionService,
  ISuperTableService,
  InsertColByRangeCommand,
  InsertRangeMoveDownCommand,
  InsertRangeMoveRightCommand,
  InsertRowByRangeCommand,
  InsertSheetCommand,
  MoveColsCommand,
  MoveRowsCommand,
  RangeProtectionPermissionDeleteProtectionPoint,
  RangeProtectionPermissionEditPoint,
  RangeProtectionPermissionManageCollaPoint,
  RangeProtectionPermissionViewPoint,
  RangeProtectionRuleModel,
  RangeThemeStyle,
  RegisterWorksheetRangeThemeStyleCommand,
  RemoveColByRangeCommand,
  RemoveDefinedNameCommand,
  RemoveRowByRangeCommand,
  RemoveSheetCommand,
  RemoveWorksheetMergeCommand,
  SCOPE_WORKBOOK_VALUE_DEFINED_NAME,
  SetBorderBasicCommand,
  SetColDataCommand,
  SetColHiddenCommand,
  SetColWidthCommand,
  SetDefinedNameCommand,
  SetFrozenCommand,
  SetGridlinesColorCommand,
  SetHorizontalTextAlignCommand,
  SetRangeCustomMetadataCommand,
  SetRangeProtectionMutation,
  SetRangeValuesCommand,
  SetRowDataCommand,
  SetRowHeightCommand,
  SetRowHiddenCommand,
  SetSelectionsOperation,
  SetSpecificColsVisibleCommand,
  SetSpecificRowsVisibleCommand,
  SetStyleCommand,
  SetTabColorCommand,
  SetTabColorMutation,
  SetTextRotationCommand,
  SetTextWrapCommand,
  SetVerticalTextAlignCommand,
  SetWorkbookNameCommand,
  SetWorksheetActiveOperation,
  SetWorksheetColumnCountCommand,
  SetWorksheetDefaultStyleMutation,
  SetWorksheetHideCommand,
  SetWorksheetHideMutation,
  SetWorksheetNameCommand,
  SetWorksheetOrderCommand,
  SetWorksheetOrderMutation,
  SetWorksheetRangeThemeStyleCommand,
  SetWorksheetRowCountCommand,
  SetWorksheetRowIsAutoHeightCommand,
  SetWorksheetRowIsAutoHeightMutation,
  SetWorksheetShowCommand,
  SheetRangeThemeService,
  SheetSkeletonChangeType,
  SheetValueChangeType,
  SheetsFreezeSyncController,
  SheetsSelectionsService,
  SplitDelimiterEnum,
  SplitTextToColumnsCommand,
  ToggleGridlinesCommand,
  UnregisterWorksheetRangeThemeStyleCommand,
  WorkbookCommentPermission,
  WorkbookCopyPermission,
  WorkbookCopySheetPermission,
  WorkbookCreateProtectPermission,
  WorkbookCreateSheetPermission,
  WorkbookDeleteColumnPermission,
  WorkbookDeleteRowPermission,
  WorkbookDeleteSheetPermission,
  WorkbookDuplicatePermission,
  WorkbookEditablePermission,
  WorkbookExportPermission,
  WorkbookHideSheetPermission,
  WorkbookInsertColumnPermission,
  WorkbookInsertRowPermission,
  WorkbookManageCollaboratorPermission,
  WorkbookMoveSheetPermission,
  WorkbookPrintPermission,
  WorkbookRecoverHistoryPermission,
  WorkbookRenameSheetPermission,
  WorkbookSharePermission,
  WorkbookViewHistoryPermission,
  WorkbookViewPermission,
  WorksheetCopyPermission,
  WorksheetDeleteColumnPermission,
  WorksheetDeleteProtectionPermission,
  WorksheetDeleteRowPermission,
  WorksheetEditExtraObjectPermission,
  WorksheetEditPermission,
  WorksheetFilterPermission,
  WorksheetInsertColumnPermission,
  WorksheetInsertHyperlinkPermission,
  WorksheetInsertRowPermission,
  WorksheetManageCollaboratorPermission,
  WorksheetPivotTablePermission,
  WorksheetProtectionPointModel,
  WorksheetProtectionRuleModel,
  WorksheetSelectProtectedCellsPermission,
  WorksheetSelectUnProtectedCellsPermission,
  WorksheetSetCellStylePermission,
  WorksheetSetCellValuePermission,
  WorksheetSetColumnStylePermission,
  WorksheetSetRowStylePermission,
  WorksheetSortPermission,
  WorksheetViewPermission,
  addMergeCellsUtil,
  copyRangeStyles,
  deserializeRangeWithSheet,
  getAddMergeMutationRangeByType,
  getAllWorksheetPermissionPoint,
  getAllWorksheetPermissionPointByPointPanel,
  getNextPrimaryCell,
  getPrimaryForRange,
  getValueChangedEffectedRange,
  serializeRange,
  serializeRangeWithSheet,
  validateDefinedName
} from "./chunk-Q6Y4PHRI.js";
import {
  CanceledError,
  DEFAULT_STYLES,
  IAuthzIoService,
  ICommandService,
  ILogService,
  IPermissionService,
  IResourceLoaderService,
  IUniverInstanceService,
  Inject,
  Injector,
  LocaleService,
  ObjectMatrix,
  Rectangle,
  RedoCommand,
  RichTextValue,
  TextStyleValue,
  Tools,
  UndoCommand,
  cellToRange,
  covertCellValue,
  covertCellValues,
  generateIntervalsByPoints,
  generateRandomId,
  isNullCell,
  mergeWorksheetSnapshotWithDefault,
  toDisposable
} from "./chunk-EJSPXROI.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField
} from "./chunk-24OICD5T.js";

// ../packages/sheets/src/facade/f-defined-name.ts
function getDefinedNameFieldName(unitId, localeService, definedNamesService) {
  const definedNameMap = definedNamesService.getDefinedNameMap(unitId);
  if (definedNameMap == null) {
    return localeService.t("sheets.definedName.defaultName") + 1;
  }
  const definedNames = Array.from(Object.values(definedNameMap));
  const count = definedNames.length + 1;
  const name = localeService.t("sheets.definedName.defaultName") + count;
  if (definedNamesService.getValueByName(unitId, name) == null) {
    return name;
  }
  let i = count + 1;
  while (true) {
    const newName = localeService.t("sheets.definedName.defaultName") + i;
    if (definedNamesService.getValueByName(unitId, newName) == null) {
      return newName;
    }
    i++;
  }
}
var FDefinedNameBuilder = class {
  constructor(unitId, _injector) {
    __publicField(this, "unitId", unitId);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_definedNameParam");
    this._definedNameParam = {
      id: generateRandomId(10),
      unitId,
      name: "",
      formulaOrRefString: "",
      localSheetId: SCOPE_WORKBOOK_VALUE_DEFINED_NAME
    };
  }
  /**
   * Sets the name of the defined name builder.
   * @param {string} name The name of the defined name.
   * @returns {FDefinedNameBuilder} The instance of `FDefinedNameBuilder` for method chaining.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedNameParam = fWorkbook.newDefinedNameBuilder()
   *   .setName('MyDefinedName')
   *   .setRef('Sheet1!$A$1')
   *   .build();
   * fWorkbook.insertDefinedNameBuilder(definedNameParam);
   * ```
   */
  setName(name) {
    this._definedNameParam.name = name;
    return this;
  }
  /**
   * Sets the formula of the defined name builder.
   * @param {string }formula The formula of the defined name.
   * @returns {FDefinedNameBuilder} The instance of `FDefinedNameBuilder` for method chaining.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedNameParam = fWorkbook.newDefinedNameBuilder()
   *   .setName('MyDefinedName')
   *   .setFormula('SUM(Sheet1!$A$1)')
   *   .build();
   * fWorkbook.insertDefinedNameBuilder(definedNameParam);
   * ```
   */
  setFormula(formula) {
    this._definedNameParam.formulaOrRefString = `=${formula}`;
    return this;
  }
  /**
   * Sets the reference of the defined name builder.
   * @param {string} a1Notation The reference of the defined name.
   * @returns {FDefinedNameBuilder} The instance of `FDefinedNameBuilder` for method chaining.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedNameParam = fWorkbook.newDefinedNameBuilder()
   *   .setName('MyDefinedName')
   *   .setRef('Sheet1!$A$1')
   *   .build();
   * fWorkbook.insertDefinedNameBuilder(definedNameParam);
   * ```
   */
  setRef(a1Notation) {
    this._definedNameParam.formulaOrRefString = a1Notation;
    return this;
  }
  /**
   * Sets the reference of the defined name builder by range .
   * @param {number} row The start row index of the range. index start at 0.
   * @param {number} column The start column index of the range. index start at 0.
   * @param {number} numRows The number of rows in the range.
   * @param {number} numColumns The number of columns in the range.
   * @returns {FDefinedNameBuilder} The instance of `FDefinedNameBuilder` for method chaining.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedNameParam = fWorkbook.newDefinedNameBuilder()
   *   .setName('MyDefinedName')
   *   .setRefByRange(1, 3, 2, 5) // D2:H3
   *   .build();
   * fWorkbook.insertDefinedNameBuilder(definedNameParam);
   * ```
   */
  setRefByRange(row, column, numRows, numColumns) {
    this._definedNameParam.formulaOrRefString = serializeRange({
      startRow: row,
      endRow: row + (numRows != null ? numRows : 1) - 1,
      startColumn: column,
      endColumn: column + (numColumns != null ? numColumns : 1) - 1
    });
    return this;
  }
  /**
   * Sets the comment of the defined name builder.
   * @param {string} comment The comment of the defined name.
   * @returns {FDefinedNameBuilder} The instance of `FDefinedNameBuilder` for method chaining.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedNameParam = fWorkbook.newDefinedNameBuilder()
   *   .setName('MyDefinedName')
   *   .setRef('Sheet1!$A$1')
   *   .setComment('A reference to A1 cell in Sheet1')
   *   .build();
   * fWorkbook.insertDefinedNameBuilder(definedNameParam);
   * ```
   */
  setComment(comment) {
    this._definedNameParam.comment = comment;
    return this;
  }
  /**
   * Sets the scope of the defined name to the worksheet.
   * @param {FWorksheet} worksheet The worksheet to set the scope to.
   * @returns {FDefinedNameBuilder} The instance of `FDefinedNameBuilder` for method chaining.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const sheets = fWorkbook.getSheets();
   *
   * // Create a defined name and make it available only in the second worksheet
   * const definedNameParam = fWorkbook.newDefinedNameBuilder()
   *   .setName('MyDefinedName')
   *   .setRef('Sheet1!$A$1')
   *   .setScopeToWorksheet(sheets[1])
   *   .build();
   * fWorkbook.insertDefinedNameBuilder(definedNameParam);
   * ```
   */
  setScopeToWorksheet(worksheet) {
    this._definedNameParam.localSheetId = worksheet.getSheetId();
    return this;
  }
  /**
   * Sets the scope of the defined name to the workbook.
   * @returns {FDefinedNameBuilder} The instance of `FDefinedNameBuilder` for method chaining.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   *
   * // Create a defined name and make it available in the entire workbook
   * const definedNameParam = fWorkbook.newDefinedNameBuilder()
   *   .setName('MyDefinedName')
   *   .setRef('Sheet1!$A$1')
   *   .setScopeToWorkbook()
   *   .build();
   * fWorkbook.insertDefinedNameBuilder(definedNameParam);
   * ```
   */
  setScopeToWorkbook() {
    this._definedNameParam.localSheetId = SCOPE_WORKBOOK_VALUE_DEFINED_NAME;
    return this;
  }
  /**
   * Sets the hidden status of the defined name builder.
   * @param {boolean} hidden The hidden status of the defined name.
   * @returns {FDefinedNameBuilder} The instance of `FDefinedNameBuilder` for method chaining.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedNameParam = fWorkbook.newDefinedNameBuilder()
   *   .setName('MyDefinedName')
   *   .setRef('Sheet1!$A$1')
   *   .setHidden(true)
   *   .build();
   * fWorkbook.insertDefinedNameBuilder(definedNameParam);
   * ```
   */
  setHidden(hidden) {
    this._definedNameParam.hidden = hidden;
    return this;
  }
  /**
   * Builds the defined name parameter.
   * @returns {ISetDefinedNameMutationParam} The defined name mutation parameter.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedNameParam = fWorkbook.newDefinedNameBuilder()
   *   .setName('MyDefinedName')
   *   .setRef('Sheet1!$A$1')
   *   .setComment('A reference to A1 cell in Sheet1')
   *   .build();
   * fWorkbook.insertDefinedNameBuilder(definedNameParam);
   * ```
   */
  build() {
    const { unitId, name, formulaOrRefString, id } = this._definedNameParam;
    const validationResult = validateDefinedName(name, {
      unitId,
      formulaOrRefString,
      univerInstanceService: this._injector.get(IUniverInstanceService),
      definedNamesService: this._injector.get(IDefinedNamesService),
      superTableService: this._injector.get(ISuperTableService),
      functionService: this._injector.get(IFunctionService),
      id
    });
    if (typeof validationResult === "string") {
      throw new TypeError(this._injector.get(LocaleService).t(validationResult));
    }
    return this._definedNameParam;
  }
  /**
   * Loads the defined name mutation parameter.
   * @param {ISetDefinedNameMutationParam} param - defined name mutation parameter
   * @returns {FDefinedNameBuilder} The instance of `FDefinedNameBuilder` for method chaining.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedNameParam = fWorkbook.newDefinedNameBuilder()
   *   .load({
   *     id: '4TMPceoqg8',
   *     name: 'MyDefinedName',
   *     formulaOrRefString: 'Sheet1!$A$1',
   *   })
   *   .build();
   * fWorkbook.insertDefinedNameBuilder(definedNameParam);
   * ```
   */
  load(param) {
    this._definedNameParam = {
      ...this._definedNameParam,
      ...param
    };
    return this;
  }
};
FDefinedNameBuilder = __decorateClass([
  __decorateParam(1, Inject(Injector))
], FDefinedNameBuilder);
var FDefinedName = class extends FBase {
  constructor(_definedNameParam, _injector, _commandService, _permissionService, _worksheetProtectionRuleModel, _rangeProtectionRuleModel, _worksheetProtectionPointRuleModel, _authzIoService, _localeService, _definedNamesService) {
    super();
    __publicField(this, "_definedNameParam", _definedNameParam);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_permissionService", _permissionService);
    __publicField(this, "_worksheetProtectionRuleModel", _worksheetProtectionRuleModel);
    __publicField(this, "_rangeProtectionRuleModel", _rangeProtectionRuleModel);
    __publicField(this, "_worksheetProtectionPointRuleModel", _worksheetProtectionPointRuleModel);
    __publicField(this, "_authzIoService", _authzIoService);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_definedNamesService", _definedNamesService);
  }
  _apply() {
    if (this._definedNameParam.name === "") {
      this._definedNameParam.name = getDefinedNameFieldName(this._definedNameParam.unitId, this._localeService, this._definedNamesService);
    }
    this._commandService.syncExecuteCommand(SetDefinedNameCommand.id, this._definedNameParam);
  }
  /**
   * Gets the name of the defined name.
   * @returns {string} The name of the defined name.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedName = fWorkbook.getDefinedNames()[0];
   * console.log(definedName?.getName());
   * ```
   */
  getName() {
    return this._definedNameParam.name;
  }
  /**
   * Sets the name of the defined name.
   * @param {string} name The name of the defined name.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedName = fWorkbook.getDefinedNames()[0];
   * definedName?.setName('NewDefinedName');
   * ```
   */
  setName(name) {
    this._definedNameParam.name = name;
    this._apply();
  }
  /**
   * Sets the formula of the defined name.
   * @param {string} formula The formula of the defined name.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedName = fWorkbook.getDefinedNames()[0];
   * definedName?.setFormula('SUM(Sheet1!$A$1)');
   * ```
   */
  setFormula(formula) {
    this._definedNameParam.formulaOrRefString = `=${formula}`;
    this._apply();
  }
  /**
   * Sets the reference of the defined name.
   * @param {string} refString The reference of the defined name.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedName = fWorkbook.getDefinedNames()[0];
   * definedName?.setRef('Sheet1!$A$1');
   * ```
   */
  setRef(refString) {
    this._definedNameParam.formulaOrRefString = refString;
    this._apply();
  }
  /**
   * Gets the formula or reference string of the defined name.
   * @returns {string} The formula or reference string of the defined name.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedName = fWorkbook.getDefinedNames()[0];
   * console.log(definedName?.getFormulaOrRefString());
   * ```
   */
  getFormulaOrRefString() {
    return this._definedNameParam.formulaOrRefString;
  }
  /**
   * Sets the reference of the defined name by range.
   * @param {number} row The start row of the range.
   * @param {number} column The start column of the range.
   * @param {number} numRows The number of rows in the range.
   * @param {number} numColumns The number of columns in the range.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedName = fWorkbook.getDefinedNames()[0];
   * definedName?.setRefByRange(1, 3, 2, 5); // D2:H3
   * ```
   */
  setRefByRange(row, column, numRows, numColumns) {
    this._definedNameParam.formulaOrRefString = serializeRange({
      startRow: row,
      endRow: row + (numRows != null ? numRows : 1) - 1,
      startColumn: column,
      endColumn: column + (numColumns != null ? numColumns : 1) - 1
    });
    this._apply();
  }
  /**
   * Gets the comment of the defined name.
   * @returns {string | undefined} The comment of the defined name.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedName = fWorkbook.getDefinedNames()[0];
   * console.log(definedName?.getComment());
   * ```
   */
  getComment() {
    return this._definedNameParam.comment;
  }
  /**
   * Sets the comment of the defined name.
   * @param {string} comment The comment of the defined name.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedName = fWorkbook.getDefinedNames()[0];
   * definedName?.setComment('This is a comment');
   * ```
   */
  setComment(comment) {
    this._definedNameParam.comment = comment;
    this._apply();
  }
  /**
   * Sets the scope of the defined name to the worksheet.
   * @param {FWorksheet} worksheet The worksheet to set the scope to.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const sheets = fWorkbook.getSheets();
   *
   * // Get the first defined name and make it available only in the second worksheet
   * const definedName = fWorkbook.getDefinedNames()[0];
   * definedName?.setScopeToWorksheet(sheets[1]);
   * ```
   */
  setScopeToWorksheet(worksheet) {
    this._definedNameParam.localSheetId = worksheet.getSheetId();
    this._apply();
  }
  /**
   * Sets the scope of the defined name to the workbook.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedName = fWorkbook.getDefinedNames()[0];
   * definedName?.setScopeToWorkbook();
   * ```
   */
  setScopeToWorkbook() {
    this._definedNameParam.localSheetId = SCOPE_WORKBOOK_VALUE_DEFINED_NAME;
    this._apply();
  }
  /**
   * Sets the hidden status of the defined name.
   * @param {boolean} hidden The hidden status of the defined name.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedName = fWorkbook.getDefinedNames()[0];
   * definedName?.setHidden(true);
   * ```
   */
  setHidden(hidden) {
    this._definedNameParam.hidden = hidden;
    this._apply();
  }
  /**
   * Deletes the defined name.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedName = fWorkbook.getDefinedNames()[0];
   * definedName?.delete();
   * ```
   */
  delete() {
    this._commandService.syncExecuteCommand(RemoveDefinedNameCommand.id, this._definedNameParam);
  }
  /**
   * Gets the local sheet id of the defined name.
   * @returns {string | undefined} The local sheet id of the defined name.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedName = fWorkbook.getDefinedNames()[0];
   * console.log(definedName?.getLocalSheetId());
   * ```
   */
  getLocalSheetId() {
    return this._definedNameParam.localSheetId;
  }
  /**
   * Checks if the defined name is in the workbook scope.
   * @returns {boolean} True if the defined name is in the workbook scope, false otherwise.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedName = fWorkbook.getDefinedNames()[0];
   * console.log(definedName?.isWorkbookScope());
   * ```
   */
  isWorkbookScope() {
    return this._definedNameParam.localSheetId === SCOPE_WORKBOOK_VALUE_DEFINED_NAME;
  }
  /**
   * Converts the defined name to a defined name builder.
   * @returns {FDefinedNameBuilder} The defined name builder.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedName = fWorkbook.getDefinedNames()[0];
   * if (!definedName) return;
   * const definedNameParam = definedName
   *   .toBuilder()
   *   .setName('NewDefinedName')
   *   .setFormula('SUM(Sheet1!$A$1)')
   *   .build();
   * fWorkbook.updateDefinedNameBuilder(definedNameParam);
   * ```
   */
  toBuilder() {
    if (!this._definedNameParam.unitId) {
      throw new Error("unitId is required to convert to FDefinedNameBuilder");
    }
    const builder = this._injector.createInstance(FDefinedNameBuilder);
    builder.load(this._definedNameParam);
    return builder;
  }
};
FDefinedName = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IPermissionService),
  __decorateParam(4, Inject(WorksheetProtectionRuleModel)),
  __decorateParam(5, Inject(RangeProtectionRuleModel)),
  __decorateParam(6, Inject(WorksheetProtectionPointModel)),
  __decorateParam(7, Inject(IAuthzIoService)),
  __decorateParam(8, Inject(LocaleService)),
  __decorateParam(9, IDefinedNamesService)
], FDefinedName);

// ../packages/sheets/src/facade/f-selection.ts
var FSelection = class {
  constructor(_workbook, _worksheet, _selections, _injector) {
    __publicField(this, "_workbook", _workbook);
    __publicField(this, "_worksheet", _worksheet);
    __publicField(this, "_selections", _selections);
    __publicField(this, "_injector", _injector);
  }
  /**
   * Represents the active selection in the sheet. Which means the selection contains the active cell.
   * @returns {FRange | null} The active selection.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A10:B11');
   * fRange.activate();
   * const fSelection = fWorksheet.getSelection();
   * console.log(fSelection.getActiveRange().getA1Notation()); // A10:B11
   * ```
   */
  getActiveRange() {
    const active = this._selections.find((selection) => !!selection.primary);
    if (!active) {
      return null;
    }
    return this._injector.createInstance(FRange, this._workbook, this._worksheet, active.range);
  }
  /**
   * Represents the active selection list in the sheet.
   * @returns {FRange[]} The active selection list.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fSelection = fWorksheet.getSelection();
   * const activeRangeList = fSelection.getActiveRangeList();
   * activeRangeList.forEach((range) => {
   *   console.log(range.getA1Notation());
   * });
   * ```
   */
  getActiveRangeList() {
    return this._selections.map((selection) => {
      return this._injector.createInstance(FRange, this._workbook, this._worksheet, selection.range);
    });
  }
  /**
   * Represents the current select cell in the sheet.
   * @returns {ISelectionCell} The current select cell info.Pay attention to the type of the return value.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A10:B11');
   * fRange.activate();
   * const fSelection = fWorksheet.getSelection();
   * const currentCell = fSelection.getCurrentCell();
   * const { actualRow, actualColumn } = currentCell;
   * console.log(currentCell);
   * console.log(`actualRow: ${actualRow}, actualColumn: ${actualColumn}`); // actualRow: 9, actualColumn: 0
   * ```
   */
  getCurrentCell() {
    const current = this._selections.find((selection) => !!selection.primary);
    if (!current) {
      return null;
    }
    return current.primary;
  }
  /**
   * Returns the active sheet in the spreadsheet.
   * @returns {FWorksheet} The active sheet in the spreadsheet.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fSelection = fWorksheet.getSelection();
   * const activeSheet = fSelection.getActiveSheet();
   * console.log(activeSheet.equalTo(fWorksheet));
   * ```
   */
  getActiveSheet() {
    const fWorkbook = this._injector.createInstance(FWorkbook, this._workbook);
    return this._injector.createInstance(FWorksheet, fWorkbook, this._workbook, this._worksheet);
  }
  /**
   * Update the primary cell in the selection. if the primary cell not exists in selections, add it to the selections and clear the old selections.
   * @param {FRange} cell The new primary cell to update.
   * @returns {FSelection} The new selection after updating the primary cell.Because the selection is immutable, the return value is a new selection.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A10:B11');
   * fRange.activate();
   * const cell = fWorksheet.getRange('B11');
   *
   * let fSelection = fWorksheet.getSelection();
   * fSelection = fSelection.updatePrimaryCell(cell);
   *
   * const currentCell = fSelection.getCurrentCell();
   * const { actualRow, actualColumn } = currentCell;
   * console.log(currentCell);
   * console.log(`actualRow: ${actualRow}, actualColumn: ${actualColumn}`); // actualRow: 10, actualColumn: 1
   * ```
   */
  updatePrimaryCell(cell) {
    const commandService = this._injector.get(ICommandService);
    let newSelections = [];
    let hasSetPrimary = false;
    for (const { range, style } of this._selections) {
      if (Rectangle.contains(range, cell.getRange())) {
        newSelections.push({
          range,
          primary: getPrimaryForRange(cell.getRange(), this._worksheet),
          style
        });
        hasSetPrimary = true;
      } else {
        newSelections.push({
          range,
          primary: null,
          style
        });
      }
    }
    if (!hasSetPrimary) {
      newSelections = [
        {
          range: cell.getRange(),
          primary: getPrimaryForRange(cell.getRange(), this._worksheet)
        }
      ];
    }
    const setSelectionOperationParams = {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      selections: newSelections
    };
    commandService.syncExecuteCommand(SetSelectionsOperation.id, setSelectionOperationParams);
    return new FSelection(this._workbook, this._worksheet, newSelections, this._injector);
  }
  /**
   * Get the next primary cell in the specified direction. If the primary cell not exists in selections, return null.
   * The next primary cell in the specified direction is the next cell only within the current selection range.
   * For example, if the current selection is A1:B2, and the primary cell is B1, the next cell in the right direction is A2 instead of C1.
   * @param {Direction} direction The direction to move the primary cell.The enum value is maybe one of the following: UP(0),RIGHT(1), DOWN(2), LEFT(3).
   * @returns {FRange | null} The next primary cell in the specified direction.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // make sure the active cell is A1 and selection is A1:B2
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.activate();
   *
   * // get the next cell in the right direction, and update the primary cell to the next cell, now the active cell is B1
   * let fSelection = fWorksheet.getSelection();
   * const nextCell = fSelection.getNextDataRange(univerAPI.Enum.Direction.RIGHT);
   * console.log(nextCell?.getA1Notation()); // B1
   * fSelection = fSelection.updatePrimaryCell(nextCell);
   *
   * // get the next cell in the right direction, the next cell is A2
   * const nextCell2 = fSelection.getNextDataRange(univerAPI.Enum.Direction.RIGHT);
   * console.log(nextCell2?.getA1Notation()); // A2
   * ```
   */
  getNextDataRange(direction) {
    const active = this._selections.find((selection) => !!selection.primary);
    if (!active) {
      return null;
    }
    const range = getNextPrimaryCell(this._selections.concat(), direction, this._worksheet);
    if (range) {
      return this._injector.createInstance(FRange, this._workbook, this._worksheet, range);
    }
    return null;
  }
};
FSelection = __decorateClass([
  __decorateParam(3, Inject(Injector))
], FSelection);

// ../packages/sheets/src/facade/permission/permission-types.ts
var UnitRole = /* @__PURE__ */ ((UnitRole3) => {
  UnitRole3[UnitRole3["Reader"] = 0] = "Reader";
  UnitRole3[UnitRole3["Editor"] = 1] = "Editor";
  UnitRole3[UnitRole3["Owner"] = 2] = "Owner";
  return UnitRole3;
})(UnitRole || {});
var WorkbookPermissionPoint = /* @__PURE__ */ ((WorkbookPermissionPoint2) => {
  WorkbookPermissionPoint2["Edit"] = "WorkbookEdit";
  WorkbookPermissionPoint2["View"] = "WorkbookView";
  WorkbookPermissionPoint2["Print"] = "WorkbookPrint";
  WorkbookPermissionPoint2["Export"] = "WorkbookExport";
  WorkbookPermissionPoint2["Share"] = "WorkbookShare";
  WorkbookPermissionPoint2["CopyContent"] = "WorkbookCopy";
  WorkbookPermissionPoint2["DuplicateFile"] = "WorkbookDuplicate";
  WorkbookPermissionPoint2["Comment"] = "WorkbookComment";
  WorkbookPermissionPoint2["ManageCollaborator"] = "WorkbookManageCollaborator";
  WorkbookPermissionPoint2["CreateSheet"] = "WorkbookCreateSheet";
  WorkbookPermissionPoint2["DeleteSheet"] = "WorkbookDeleteSheet";
  WorkbookPermissionPoint2["RenameSheet"] = "WorkbookRenameSheet";
  WorkbookPermissionPoint2["MoveSheet"] = "WorkbookMoveSheet";
  WorkbookPermissionPoint2["HideSheet"] = "WorkbookHideSheet";
  WorkbookPermissionPoint2["ViewHistory"] = "WorkbookViewHistory";
  WorkbookPermissionPoint2["RecoverHistory"] = "WorkbookRecoverHistory";
  WorkbookPermissionPoint2["CreateProtection"] = "WorkbookCreateProtect";
  WorkbookPermissionPoint2["InsertRow"] = "WorkbookInsertRow";
  WorkbookPermissionPoint2["InsertColumn"] = "WorkbookInsertColumn";
  WorkbookPermissionPoint2["DeleteRow"] = "WorkbookDeleteRow";
  WorkbookPermissionPoint2["DeleteColumn"] = "WorkbookDeleteColumn";
  WorkbookPermissionPoint2["CopySheet"] = "WorkbookCopySheet";
  return WorkbookPermissionPoint2;
})(WorkbookPermissionPoint || {});
var WorksheetPermissionPoint = /* @__PURE__ */ ((WorksheetPermissionPoint2) => {
  WorksheetPermissionPoint2["Edit"] = "WorksheetEdit";
  WorksheetPermissionPoint2["View"] = "WorksheetView";
  WorksheetPermissionPoint2["Copy"] = "WorksheetCopy";
  WorksheetPermissionPoint2["SetCellValue"] = "WorksheetSetCellValue";
  WorksheetPermissionPoint2["SetCellStyle"] = "WorksheetSetCellStyle";
  WorksheetPermissionPoint2["SetRowStyle"] = "WorksheetSetRowStyle";
  WorksheetPermissionPoint2["SetColumnStyle"] = "WorksheetSetColumnStyle";
  WorksheetPermissionPoint2["InsertRow"] = "WorksheetInsertRow";
  WorksheetPermissionPoint2["InsertColumn"] = "WorksheetInsertColumn";
  WorksheetPermissionPoint2["DeleteRow"] = "WorksheetDeleteRow";
  WorksheetPermissionPoint2["DeleteColumn"] = "WorksheetDeleteColumn";
  WorksheetPermissionPoint2["Sort"] = "WorksheetSort";
  WorksheetPermissionPoint2["Filter"] = "WorksheetFilter";
  WorksheetPermissionPoint2["PivotTable"] = "WorksheetPivotTable";
  WorksheetPermissionPoint2["InsertHyperlink"] = "WorksheetInsertHyperlink";
  WorksheetPermissionPoint2["EditExtraObject"] = "WorksheetEditExtraObject";
  WorksheetPermissionPoint2["ManageCollaborator"] = "WorksheetManageCollaborator";
  WorksheetPermissionPoint2["DeleteProtection"] = "WorksheetDeleteProtection";
  WorksheetPermissionPoint2["SelectProtectedCells"] = "WorksheetSelectProtectedCells";
  WorksheetPermissionPoint2["SelectUnProtectedCells"] = "WorksheetSelectUnProtectedCells";
  return WorksheetPermissionPoint2;
})(WorksheetPermissionPoint || {});
var RangePermissionPoint = /* @__PURE__ */ ((RangePermissionPoint2) => {
  RangePermissionPoint2["Edit"] = "RangeEdit";
  RangePermissionPoint2["View"] = "RangeView";
  RangePermissionPoint2["ManageCollaborator"] = "RangeManageCollaborator";
  RangePermissionPoint2["Delete"] = "RangeDeleteProtection";
  return RangePermissionPoint2;
})(RangePermissionPoint || {});

// ../packages/sheets/src/facade/permission/permission-point-map.ts
var WORKBOOK_PERMISSION_POINT_MAP = {
  ["WorkbookEdit" /* Edit */]: WorkbookEditablePermission,
  ["WorkbookView" /* View */]: WorkbookViewPermission,
  ["WorkbookPrint" /* Print */]: WorkbookPrintPermission,
  ["WorkbookExport" /* Export */]: WorkbookExportPermission,
  ["WorkbookShare" /* Share */]: WorkbookSharePermission,
  ["WorkbookCopy" /* CopyContent */]: WorkbookCopyPermission,
  ["WorkbookDuplicate" /* DuplicateFile */]: WorkbookDuplicatePermission,
  ["WorkbookComment" /* Comment */]: WorkbookCommentPermission,
  ["WorkbookManageCollaborator" /* ManageCollaborator */]: WorkbookManageCollaboratorPermission,
  ["WorkbookCreateSheet" /* CreateSheet */]: WorkbookCreateSheetPermission,
  ["WorkbookDeleteSheet" /* DeleteSheet */]: WorkbookDeleteSheetPermission,
  ["WorkbookRenameSheet" /* RenameSheet */]: WorkbookRenameSheetPermission,
  ["WorkbookMoveSheet" /* MoveSheet */]: WorkbookMoveSheetPermission,
  ["WorkbookHideSheet" /* HideSheet */]: WorkbookHideSheetPermission,
  ["WorkbookViewHistory" /* ViewHistory */]: WorkbookViewHistoryPermission,
  ["WorkbookRecoverHistory" /* RecoverHistory */]: WorkbookRecoverHistoryPermission,
  ["WorkbookCreateProtect" /* CreateProtection */]: WorkbookCreateProtectPermission,
  ["WorkbookInsertRow" /* InsertRow */]: WorkbookInsertRowPermission,
  ["WorkbookInsertColumn" /* InsertColumn */]: WorkbookInsertColumnPermission,
  ["WorkbookDeleteRow" /* DeleteRow */]: WorkbookDeleteRowPermission,
  ["WorkbookDeleteColumn" /* DeleteColumn */]: WorkbookDeleteColumnPermission,
  ["WorkbookCopySheet" /* CopySheet */]: WorkbookCopySheetPermission
};
var WORKSHEET_PERMISSION_POINT_MAP = {
  ["WorksheetEdit" /* Edit */]: WorksheetEditPermission,
  ["WorksheetView" /* View */]: WorksheetViewPermission,
  ["WorksheetCopy" /* Copy */]: WorksheetCopyPermission,
  ["WorksheetSetCellValue" /* SetCellValue */]: WorksheetSetCellValuePermission,
  ["WorksheetSetCellStyle" /* SetCellStyle */]: WorksheetSetCellStylePermission,
  ["WorksheetSetRowStyle" /* SetRowStyle */]: WorksheetSetRowStylePermission,
  ["WorksheetSetColumnStyle" /* SetColumnStyle */]: WorksheetSetColumnStylePermission,
  ["WorksheetInsertRow" /* InsertRow */]: WorksheetInsertRowPermission,
  ["WorksheetInsertColumn" /* InsertColumn */]: WorksheetInsertColumnPermission,
  ["WorksheetDeleteRow" /* DeleteRow */]: WorksheetDeleteRowPermission,
  ["WorksheetDeleteColumn" /* DeleteColumn */]: WorksheetDeleteColumnPermission,
  ["WorksheetSort" /* Sort */]: WorksheetSortPermission,
  ["WorksheetFilter" /* Filter */]: WorksheetFilterPermission,
  ["WorksheetPivotTable" /* PivotTable */]: WorksheetPivotTablePermission,
  ["WorksheetInsertHyperlink" /* InsertHyperlink */]: WorksheetInsertHyperlinkPermission,
  ["WorksheetEditExtraObject" /* EditExtraObject */]: WorksheetEditExtraObjectPermission,
  ["WorksheetManageCollaborator" /* ManageCollaborator */]: WorksheetManageCollaboratorPermission,
  ["WorksheetDeleteProtection" /* DeleteProtection */]: WorksheetDeleteProtectionPermission,
  ["WorksheetSelectProtectedCells" /* SelectProtectedCells */]: WorksheetSelectProtectedCellsPermission,
  ["WorksheetSelectUnProtectedCells" /* SelectUnProtectedCells */]: WorksheetSelectUnProtectedCellsPermission
};
var RANGE_PERMISSION_POINT_MAP = {
  ["RangeEdit" /* Edit */]: RangeProtectionPermissionEditPoint,
  ["RangeView" /* View */]: RangeProtectionPermissionViewPoint,
  ["RangeManageCollaborator" /* ManageCollaborator */]: RangeProtectionPermissionManageCollaPoint,
  ["RangeDeleteProtection" /* Delete */]: RangeProtectionPermissionDeleteProtectionPoint
};

// ../packages/sheets/src/facade/permission/util.ts
function determineViewState(allowViewByOthers) {
  if (allowViewByOthers === false) {
    return "noOneElseCanView" /* NoOneElseCanView */;
  }
  return "othersCanView" /* OthersCanView */;
}
function determineEditState(allowedUsers) {
  if (allowedUsers == null ? void 0 : allowedUsers.length) {
    return "designedUserCanEdit" /* DesignedUserCanEdit */;
  }
  return "onlyMe" /* OnlyMe */;
}
function determineScope(editState, viewState) {
  return {
    edit: editState === "designedUserCanEdit" /* DesignedUserCanEdit */ ? 0 /* SomeCollaborator */ : 2 /* OneSelf */,
    read: viewState === "othersCanView" /* OthersCanView */ ? 1 /* AllCollaborator */ : 0 /* SomeCollaborator */
  };
}
function handleWorksheetRangePermissionIsEmpty(injector, unitId, subUnitId) {
  const rangeProtectionRuleModel = injector.get(RangeProtectionRuleModel);
  const worksheetProtectionPointModel = injector.get(WorksheetProtectionPointModel);
  const permissionService = injector.get(IPermissionService);
  const rules = rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId);
  if (rules.length > 0) {
    return;
  }
  worksheetProtectionPointModel.deleteRule(unitId, subUnitId);
  [...getAllWorksheetPermissionPointByPointPanel()].forEach((F) => {
    const instance = new F(unitId, subUnitId);
    permissionService.updatePermissionPoint(instance.id, instance.value);
  });
}
async function getListRangeProtectionRules(injector, unitId, subUnitId, options) {
  const rangeProtectionRuleModel = injector.get(RangeProtectionRuleModel);
  const authzIoService = injector.get(IAuthzIoService);
  const { worksheet, specificRange, ignoreCollaborators = false } = options;
  let rules = rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId);
  if (specificRange) {
    rules = rules.filter(
      (rule) => rule.ranges.some((ruleRange) => Rectangle.intersects(ruleRange, specificRange.getRange()))
    );
  }
  const rulesWithOptions = await Promise.all(
    rules.map(async (rule) => {
      const ranges = rule.ranges.map((range) => worksheet.getRange(range));
      const options2 = {
        name: rule.description || "",
        allowViewByOthers: rule.viewState !== "noOneElseCanView" /* NoOneElseCanView */
      };
      if (rule.editState === "designedUserCanEdit" /* DesignedUserCanEdit */) {
        options2.allowedUsers = [];
        if (!ignoreCollaborators) {
          try {
            const collaborators = await authzIoService.listCollaborators({
              objectID: rule.permissionId,
              unitID: unitId
            });
            options2.allowedUsers = collaborators.map((c) => {
              var _a;
              return ((_a = c.subject) == null ? void 0 : _a.userID) || c.id;
            });
          } catch (error) {
            console.warn(`Failed to fetch collaborators for rule ${rule.id}:`, error);
          }
        }
      }
      return {
        id: rule.id,
        permissionId: rule.permissionId,
        ranges,
        options: options2
      };
    })
  );
  return rulesWithOptions.map(
    ({ id, permissionId, ranges, options: options2 }) => injector.createInstance(
      FRangeProtectionRule,
      unitId,
      subUnitId,
      id,
      permissionId,
      ranges,
      options2
    )
  );
}

// ../packages/sheets/src/facade/permission/f-range-protection-rule.ts
var FRangeProtectionRule = class {
  constructor(_unitId, _subUnitId, _ruleId, _permissionId, _ranges, _options, _injector, _permissionService, _authzIoService, _commandService, _rangeProtectionRuleModel) {
    __publicField(this, "_unitId", _unitId);
    __publicField(this, "_subUnitId", _subUnitId);
    __publicField(this, "_ruleId", _ruleId);
    __publicField(this, "_permissionId", _permissionId);
    __publicField(this, "_ranges", _ranges);
    __publicField(this, "_options", _options);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_permissionService", _permissionService);
    __publicField(this, "_authzIoService", _authzIoService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_rangeProtectionRuleModel", _rangeProtectionRuleModel);
  }
  /**
   * Get the rule ID.
   */
  get id() {
    return this._ruleId;
  }
  /**
   * Get the permission ID associated with this rule.
   */
  get permissionId() {
    return this._permissionId;
  }
  /**
   * Get the protected ranges.
   */
  get ranges() {
    return this._ranges;
  }
  /**
   * Get the protection options.
   */
  get options() {
    return { ...this._options };
  }
  /**
   * Update the protected ranges.
   * @param {FRange[]} ranges New ranges to protect.
   * @returns {Promise<void>} A promise that resolves when the ranges are updated.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const rules = await fWorksheet.getWorksheetPermission().listRangeProtectionRules();
   * // Update the ranges to A1:C3 for the first rule
   * if (rules.length > 0) {
   *   const rule = rules[0];
   *   const result = await rule.updateRanges([fWorksheet.getRange('A1:C3')]);
   *   console.log(result);
   * }
   * ```
   */
  async updateRanges(ranges) {
    if (!ranges || ranges.length === 0) {
      throw new Error("Ranges cannot be empty");
    }
    const rule = this._rangeProtectionRuleModel.getRule(this._unitId, this._subUnitId, this._ruleId);
    if (!rule) {
      throw new Error(`Rule ${this._ruleId} not found`);
    }
    const subUnitRuleList = this._rangeProtectionRuleModel.getSubunitRuleList(this._unitId, this._subUnitId).filter((r) => r.id !== this._ruleId);
    const hasOverlap = subUnitRuleList.some(
      (otherRule) => otherRule.ranges.some(
        (otherRange) => ranges.some((newRange) => Rectangle.intersects(otherRange, newRange.getRange()))
      )
    );
    if (hasOverlap) {
      throw new Error("Range protection cannot intersect with other protection rules");
    }
    const result = await this._commandService.executeCommand(SetRangeProtectionMutation.id, {
      unitId: this._unitId,
      subUnitId: this._subUnitId,
      ruleId: this._ruleId,
      rule: {
        ...rule,
        ranges: ranges.map((range) => range.getRange())
      }
    });
    if (result) {
      this._ranges.length = 0;
      this._ranges.push(...ranges);
    }
    return result;
  }
  /**
   * Delete the current protection rule.
   * @returns {Promise<void>} A promise that resolves when the rule is removed.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const rules = await fWorksheet.getWorksheetPermission().listRangeProtectionRules();
   * // Remove the first protection rule
   * if (rules.length > 0) {
   *   const rule = rules[0];
   *   const result = await rule.remove();
   *   console.log(result);
   * }
   * ```
   */
  async remove() {
    const result = await this._commandService.executeCommand(DeleteRangeProtectionMutation.id, {
      unitId: this._unitId,
      subUnitId: this._subUnitId,
      ruleIds: [this._ruleId]
    });
    if (result) {
      handleWorksheetRangePermissionIsEmpty(this._injector, this._unitId, this._subUnitId);
    }
    return result;
  }
  /**
   * Set a specific permission point for the range rule (low-level API).
   *
   * **Important:** This method only updates the permission point value for an existing protection rule.
   * It does NOT create permission checks that will block actual editing operations.
   * You must call `protect()` first to create a protection rule before using this method.
   *
   * This method is useful for:
   * - Fine-tuning permissions after creating a protection rule with `protect()`
   * - Dynamically adjusting permissions based on runtime conditions
   * - Advanced permission management scenarios
   *
   * @param {RangePermissionPoint} point The permission point to set.
   * @param {boolean} value The value to set (true = allowed, false = denied).
   * @returns {Promise<void>} A promise that resolves when the point is set.
   * @throws {Error} If no protection rule exists for this range.
   *
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * // First, create a protection rule
   * const rule = await fRange.getRangePermission().protect({ name: 'My Range', allowEdit: true });
   * // Then you can dynamically update permission points
   * await rule.setPoint(univerAPI.Enum.RangePermissionPoint.Edit, false); // Now disable edit
   * await rule.setPoint(univerAPI.Enum.RangePermissionPoint.View, true);  // Ensure view is enabled
   * ```
   */
  async setPoint(point, value) {
    const PermissionPointClass = RANGE_PERMISSION_POINT_MAP[point];
    if (!PermissionPointClass) {
      throw new Error(`Unknown range permission point: ${point}`);
    }
    const instance = new PermissionPointClass(this._unitId, this._subUnitId, this._permissionId);
    const permissionPoint = this._permissionService.getPermissionPoint(instance.id);
    if (permissionPoint && permissionPoint.value === value) {
      return;
    }
    if (!permissionPoint) {
      this._permissionService.addPermissionPoint(instance);
    }
    await this._authzIoService.update({
      objectType: 3 /* SelectRange */,
      objectID: this._permissionId,
      unitID: this._unitId,
      share: void 0,
      name: this._options.name || "",
      strategies: [{
        action: instance.subType,
        role: value ? 1 /* Editor */ : 2 /* Owner */
      }],
      scope: void 0,
      collaborators: void 0
    });
    this._permissionService.updatePermissionPoint(instance.id, value);
  }
  /**
   * Get the value of a specific permission point.
   * @param {RangePermissionPoint} point The range permission point to query.
   * @returns {boolean} true if allowed, false if denied.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const rules = await fWorksheet.getWorksheetPermission().listRangeProtectionRules();
   * // Check if the first rule allows editing
   * if (rules.length > 0) {
   *   const rule = rules[0];
   *   const canEdit = rule.getPoint(univerAPI.Enum.RangePermissionPoint.Edit);
   *   console.log(canEdit);
   * }
   * ```
   */
  getPoint(point) {
    const PermissionPointClass = RANGE_PERMISSION_POINT_MAP[point];
    if (!PermissionPointClass) {
      console.warn(`Unknown permission point: ${point}`);
      return false;
    }
    const permissionPoint = new PermissionPointClass(this._unitId, this._subUnitId, this._permissionId);
    const permission = this._permissionService.getPermissionPoint(permissionPoint.id);
    if (permission) {
      return permission.value;
    }
    return true;
  }
  /**
   * Check if the current user can edit this range.
   * @returns {boolean} true if editable, false otherwise.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const rules = await fWorksheet.getWorksheetPermission().listRangeProtectionRules();
   * // Check if the first rule allows editing
   * const rule = rules[0];
   * if (rule?.canEdit()) {
   *   console.log(`You can edit this range ${rule.ranges.map(r => r.getA1Notation()).join(', ')}`);
   * }
   * ```
   */
  canEdit() {
    return this.getPoint("RangeEdit" /* Edit */);
  }
  /**
   * Check if the current user can view this range.
   * @returns {boolean} true if viewable, false otherwise.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const rules = await fWorksheet.getWorksheetPermission().listRangeProtectionRules();
   * // Check if the first rule allows viewing
   * const rule = rules[0];
   * if (rule?.canView()) {
   *   console.log(`You can view this range ${rule.ranges.map(r => r.getA1Notation()).join(', ')}`);
   * }
   * ```
   */
  canView() {
    return this.getPoint("RangeView" /* View */);
  }
  /**
   * Check if the current user can manage collaborators for this range.
   * @returns {boolean} true if can manage collaborators, false otherwise.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const rules = await fWorksheet.getWorksheetPermission().listRangeProtectionRules();
   * // Check if the first rule allows managing collaborators
   * const rule = rules[0];
   * if (rule?.canManageCollaborator()) {
   *   console.log(`You can manage collaborators for this range ${rule.ranges.map(r => r.getA1Notation()).join(', ')}`);
   * }
   * ```
   */
  canManageCollaborator() {
    return this.getPoint("RangeManageCollaborator" /* ManageCollaborator */);
  }
  /**
   * Check if the current user can delete this protection rule.
   * @returns {boolean} true if can delete rule, false otherwise.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const rules = await fWorksheet.getWorksheetPermission().listRangeProtectionRules();
   * // Check if the first rule allows deleting the rule
   * const rule = rules[0];
   * if (rule?.canDelete()) {
   *   console.log(`You can delete this protection rule for this range ${rule.ranges.map(r => r.getA1Notation()).join(', ')}`);
   * }
   * ```
   */
  canDelete() {
    return this.getPoint("RangeDeleteProtection" /* Delete */);
  }
  /**
   * Get the current permission snapshot.
   * @returns {RangePermissionSnapshot} Snapshot of all permission points.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const rules = await fWorksheet.getWorksheetPermission().listRangeProtectionRules();
   * // Get the permission snapshot of the first rule
   * if (rules.length > 0) {
   *   const rule = rules[0];
   *   const snapshot = rule.getSnapshot();
   *   console.log(snapshot);
   * }
   * ```
   */
  getSnapshot() {
    const snapshot = {};
    Object.values(RangePermissionPoint).forEach((point) => {
      snapshot[point] = this.getPoint(point);
    });
    return snapshot;
  }
};
FRangeProtectionRule = __decorateClass([
  __decorateParam(6, Inject(Injector)),
  __decorateParam(7, IPermissionService),
  __decorateParam(8, IAuthzIoService),
  __decorateParam(9, ICommandService),
  __decorateParam(10, Inject(RangeProtectionRuleModel))
], FRangeProtectionRule);

// ../packages/sheets/src/facade/permission/f-worksheet-permission.ts
var FWorksheetPermission = class extends FBase {
  constructor(_worksheet, _injector, _permissionService, _authzIoService, _commandService, _rangeProtectionRuleModel, _worksheetProtectionPointModel, _worksheetProtectionRuleModel) {
    super();
    __publicField(this, "_worksheet", _worksheet);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_permissionService", _permissionService);
    __publicField(this, "_authzIoService", _authzIoService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_rangeProtectionRuleModel", _rangeProtectionRuleModel);
    __publicField(this, "_worksheetProtectionPointModel", _worksheetProtectionPointModel);
    __publicField(this, "_worksheetProtectionRuleModel", _worksheetProtectionRuleModel);
    __publicField(this, "_unitId");
    __publicField(this, "_subUnitId");
    this._unitId = this._worksheet.getWorkbook().getUnitId();
    this._subUnitId = this._worksheet.getSheetId();
  }
  /**
   * Check if worksheet is currently protected.
   * @returns {boolean} true if protected, false otherwise.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * if (fWorksheet.getWorksheetPermission().isProtected()) {
   *   console.log('Worksheet is protected');
   * }
   * ```
   */
  isProtected() {
    const rule = this._worksheetProtectionRuleModel.getRule(this._unitId, this._subUnitId);
    return !!rule;
  }
  /**
   * Create worksheet protection with collaborators support.
   * This must be called before setting permission points for collaboration to work.
   * @param {IWorksheetProtectionOptions} options Protection options including allowed users.
   * @returns {Promise<string>} The permissionId for the created protection.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const permission = fWorksheet.getWorksheetPermission();
   *
   * // Create worksheet protection with collaborators
   * const permissionId = await permission.protect({
   *   allowedUsers: ['user1', 'user2'],
   *   name: 'My Worksheet Protection'
   * });
   *
   * // Now set permission points
   * await permission?.setMode('readOnly');
   * ```
   */
  async protect(options) {
    if (this.isProtected()) {
      throw new Error("Worksheet is already protected. Call unprotect() first.");
    }
    const editState = determineEditState(options == null ? void 0 : options.allowedUsers);
    const viewState = determineViewState(options == null ? void 0 : options.allowViewByOthers);
    const scope = determineScope(editState, viewState);
    const collaborators = [];
    if (editState === "designedUserCanEdit" /* DesignedUserCanEdit */) {
      const existingCollaborators = await this._authzIoService.listCollaborators({
        objectID: this._unitId,
        unitID: this._unitId
      });
      options.allowedUsers.forEach((userId) => {
        const existingCollaborator = existingCollaborators.find((c) => {
          var _a;
          return ((_a = c.subject) == null ? void 0 : _a.userID) === userId || c.id === userId;
        });
        if (!existingCollaborator) {
          console.error(`User ${userId} not found in existing collaborators`);
          return;
        }
        collaborators.push({
          id: existingCollaborator.id,
          role: 1 /* Editor */,
          subject: existingCollaborator.subject
        });
      });
    }
    const permissionId = await this._authzIoService.create({
      objectType: 2 /* Worksheet */,
      worksheetObject: {
        collaborators,
        unitID: this._unitId,
        strategies: [
          { role: 1 /* Editor */, action: 1 /* Edit */ },
          { role: 0 /* Reader */, action: 0 /* View */ }
        ],
        name: (options == null ? void 0 : options.name) || "",
        scope
      }
    });
    const result = this._commandService.syncExecuteCommand(AddWorksheetProtectionMutation.id, {
      unitId: this._unitId,
      subUnitId: this._subUnitId,
      rule: {
        permissionId,
        description: options == null ? void 0 : options.name,
        unitType: 2 /* Worksheet */,
        unitId: this._unitId,
        subUnitId: this._subUnitId,
        viewState,
        editState
      }
    });
    if (!result) {
      throw new Error("Failed to create worksheet protection");
    }
    return permissionId;
  }
  /**
   * Remove worksheet protection.
   * This deletes the protection rule and resets all permission points to allowed.
   * @returns {Promise<void>} A promise that resolves when protection is removed.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * await fWorksheet.getWorksheetPermission().unprotect();
   * ```
   */
  async unprotect() {
    if (!this.isProtected()) {
      return true;
    }
    const result = this._commandService.syncExecuteCommand(DeleteWorksheetProtectionMutation.id, {
      unitId: this._unitId,
      subUnitId: this._subUnitId
    });
    [...getAllWorksheetPermissionPoint(), ...getAllWorksheetPermissionPointByPointPanel()].forEach((F) => {
      const instance = new F(this._unitId, this._subUnitId);
      this._permissionService.updatePermissionPoint(instance.id, true);
    });
    this._worksheetProtectionPointModel.deleteRule(this._unitId, this._subUnitId);
    return result;
  }
  /**
   * Set permission mode for the worksheet.
   * Automatically creates worksheet protection if not already protected.
   * @param {WorksheetMode} mode The permission mode to set ('editable' | 'readOnly' | 'filterOnly' | 'commentOnly').
   * @returns {Promise<void>} A promise that resolves when the mode is set.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * await fWorksheet.getWorksheetPermission().setMode('readOnly');
   * ```
   */
  async setMode(mode) {
    const pointsToSet = this._getModePermissions(mode);
    await Promise.all(
      Object.entries(pointsToSet).map(([point, value]) => this.setPoint(point, value))
    );
  }
  /**
   * Get permission configuration for a specific mode
   * @private
   */
  _getModePermissions(mode) {
    const pointsToSet = {};
    Object.values(WorksheetPermissionPoint).forEach((point) => {
      pointsToSet[point] = false;
    });
    switch (mode) {
      case "editable":
        Object.values(WorksheetPermissionPoint).forEach((point) => {
          pointsToSet[point] = true;
        });
        break;
      case "readOnly":
        pointsToSet["WorksheetView" /* View */] = true;
        break;
      case "filterOnly":
        pointsToSet["WorksheetView" /* View */] = true;
        pointsToSet["WorksheetSort" /* Sort */] = true;
        pointsToSet["WorksheetFilter" /* Filter */] = true;
        break;
    }
    return pointsToSet;
  }
  /**
   * Set the worksheet to read-only mode.
   * @returns {Promise<void>} A promise that resolves when the mode is set.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * await fWorksheet.getWorksheetPermission().setReadOnly();
   * ```
   */
  async setReadOnly() {
    await this.setMode("readOnly");
  }
  /**
   * Set the worksheet to editable mode.
   * @returns {Promise<void>} A promise that resolves when the mode is set.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * await fWorksheet.getWorksheetPermission().setEditable();
   * ```
   */
  async setEditable() {
    await this.setMode("editable");
  }
  /**
   * Set a specific permission point for the worksheet.
   * Automatically creates worksheet protection if not already protected.
   * @param {WorksheetPermissionPoint} point The permission point to set.
   * @param {boolean} value The value to set (true = allowed, false = denied).
   * @returns {Promise<void>} A promise that resolves when the point is set.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const permission = fWorksheet.getWorksheetPermission();
   * await permission.setPoint(univerAPI.Enum.WorksheetPermissionPoint.InsertRow, false);
   * ```
   */
  async setPoint(point, value) {
    const PermissionPointClass = WORKSHEET_PERMISSION_POINT_MAP[point];
    if (!PermissionPointClass) {
      throw new Error(`Unknown worksheet permission point: ${point}`);
    }
    const worksheetProtectionRule = this._worksheetProtectionRuleModel.getRule(this._unitId, this._subUnitId);
    if (!worksheetProtectionRule) {
      throw new Error(`Cannot set ${point} permission point because worksheet protection does not exist. Call protect() first.`);
    }
    const instance = new PermissionPointClass(this._unitId, this._subUnitId);
    const permissionPoint = this._permissionService.getPermissionPoint(instance.id);
    if (permissionPoint && permissionPoint.value === value) {
      return;
    }
    if (!permissionPoint) {
      this._permissionService.addPermissionPoint(instance);
    }
    await this._authzIoService.update({
      objectType: 2 /* Worksheet */,
      objectID: worksheetProtectionRule.permissionId,
      unitID: this._unitId,
      share: void 0,
      name: worksheetProtectionRule.description || "",
      strategies: [{
        action: instance.subType,
        role: value ? 1 /* Editor */ : 2 /* Owner */
      }],
      scope: void 0,
      collaborators: void 0
    });
    this._permissionService.updatePermissionPoint(instance.id, value);
  }
  /**
   * Check if the worksheet is editable.
   * @returns {boolean} true if the worksheet can be edited, false otherwise.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * if (fWorksheet.getWorksheetPermission().canEdit()) {
   *   console.log('Worksheet is editable');
   * }
   * ```
   */
  canEdit() {
    return this.getPoint("WorksheetEdit" /* Edit */);
  }
  /**
   * Check if a specific cell can be edited.
   * @param {number} row Row index.
   * @param {number} col Column index.
   * @returns {boolean} true if the cell can be edited, false otherwise.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Check if cell C3 can be edited
   * const fRange = fWorksheet.getRange('C3');
   * const canEdit = fWorksheet.getWorksheetPermission().canEditCell(fRange.getRow(), fRange.getColumn());
   * console.log(canEdit);
   * ```
   */
  canEditCell(row, col) {
    var _a;
    if (!this.canEdit()) {
      return false;
    }
    const rules = this._rangeProtectionRuleModel.getSubunitRuleList(this._unitId, this._subUnitId);
    for (const rule of rules) {
      for (const range of rule.ranges) {
        if (row >= range.startRow && row <= range.endRow && col >= range.startColumn && col <= range.endColumn) {
          const permissionPoint = new RangeProtectionPermissionEditPoint(
            this._unitId,
            this._subUnitId,
            rule.permissionId
          );
          const permission = this._permissionService.getPermissionPoint(permissionPoint.id);
          return (_a = permission == null ? void 0 : permission.value) != null ? _a : false;
        }
      }
    }
    return true;
  }
  /**
   * Check if the worksheet is viewable.
   * @returns {boolean} true if the worksheet can be viewed, false otherwise.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * if (fWorksheet.getWorksheetPermission().canView()) {
   *   console.log('Worksheet is viewable');
   * }
   */
  canView() {
    return this.getPoint("WorksheetView" /* View */);
  }
  /**
   * Check if a specific cell can be viewed.
   * @param {number} row Row index.
   * @param {number} col Column index.
   * @returns {boolean} true if the cell can be viewed, false otherwise.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Check if cell C3 can be viewed
   * const fRange = fWorksheet.getRange('C3');
   * const canView = fWorksheet.getWorksheetPermission().canViewCell(fRange.getRow(), fRange.getColumn());
   * console.log(canView);
   * ```
   */
  canViewCell(row, col) {
    var _a;
    if (!this.canView()) {
      return false;
    }
    const rules = this._rangeProtectionRuleModel.getSubunitRuleList(this._unitId, this._subUnitId);
    for (const rule of rules) {
      for (const range of rule.ranges) {
        if (row >= range.startRow && row <= range.endRow && col >= range.startColumn && col <= range.endColumn) {
          const permissionPoint = new RangeProtectionPermissionViewPoint(
            this._unitId,
            this._subUnitId,
            rule.permissionId
          );
          const permission = this._permissionService.getPermissionPoint(permissionPoint.id);
          return (_a = permission == null ? void 0 : permission.value) != null ? _a : false;
        }
      }
    }
    return true;
  }
  /**
   * Get the value of a specific permission point.
   * @param {WorksheetPermissionPoint} point The permission point to query.
   * @returns {boolean} true if allowed, false if denied.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const permission = fWorksheet.getWorksheetPermission();
   * const canInsertRow = permission.getPoint(univerAPI.Enum.WorksheetPermissionPoint.InsertRow);
   * console.log(canInsertRow);
   * ```
   */
  getPoint(point) {
    var _a;
    const PointClass = WORKSHEET_PERMISSION_POINT_MAP[point];
    if (!PointClass) {
      throw new Error(`Unknown worksheet permission point: ${point}`);
    }
    const instance = new PointClass(this._unitId, this._subUnitId);
    const permissionPoint = this._permissionService.getPermissionPoint(instance.id);
    return (_a = permissionPoint == null ? void 0 : permissionPoint.value) != null ? _a : true;
  }
  /**
   * Get a snapshot of all permission points.
   * @returns {WorksheetPermissionSnapshot} An object containing all permission point values.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const snapshot = fWorksheet.getWorksheetPermission().getSnapshot();
   * console.log(snapshot);
   * ```
   */
  getSnapshot() {
    const snapshot = {};
    for (const point in WorksheetPermissionPoint) {
      const pointKey = WorksheetPermissionPoint[point];
      snapshot[pointKey] = this.getPoint(pointKey);
    }
    return snapshot;
  }
  /**
   * Apply a permission configuration to the worksheet.
   * @param {IWorksheetPermissionConfig} config The configuration to apply.
   * @returns {Promise<void>} A promise that resolves when the configuration is applied.
   * @example
   * ```ts
   * const worksheet = univerAPI.getActiveWorkbook()?.getSheetByName('Sheet1');
   * if (!worksheet) return;
   * const permission = worksheet?.getWorksheetPermission();
   * await permission?.applyConfig({
   *   mode: 'readOnly',
   *   points: {
   *     [univerAPI.Enum.WorksheetPermissionPoint.View]: true,
   *     [univerAPI.Enum.WorksheetPermissionPoint.Edit]: false
   *   }
   * });
   * ```
   */
  async applyConfig(config) {
    if (config.mode) {
      await this.setMode(config.mode);
    }
    if (config.points) {
      for (const [point, value] of Object.entries(config.points)) {
        if (typeof value === "boolean") {
          await this.setPoint(point, value);
        }
      }
    }
    if (config.rangeProtections && config.rangeProtections.length > 0) {
      const protectionConfigs = config.rangeProtections.map((protection) => ({
        ranges: protection.rangeRefs.map((rangeRef) => this._worksheet.getRange(rangeRef)),
        options: protection.options
      }));
      await this.protectRanges(protectionConfigs);
    }
  }
  /**
   * Protect multiple ranges at once (batch operation).
   * @param {Array<{ ranges: FRange[]; options?: IRangeProtectionOptions }>} configs Array of protection configurations.
   * @returns {Promise<FRangeProtectionRule[]>} Array of created protection rules.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const rules = await fWorksheet.getWorksheetPermission().protectRanges([
   *   {
   *     ranges: [fWorksheet.getRange('A1:B2')],
   *     options: { name: 'Protected Area 1', allowedUsers: ['user1', 'user2'], allowViewByOthers: true }
   *   },
   *   {
   *     ranges: [fWorksheet.getRange('C3:D4')],
   *     options: { name: 'Protected Area 2', allowViewByOthers: false }
   *   }
   * ]);
   * console.log(rules);
   * ```
   */
  // eslint-disable-next-line max-lines-per-function
  async protectRanges(configs) {
    if (!configs || configs.length === 0) {
      throw new Error("Configs cannot be empty");
    }
    const rules = this._rangeProtectionRuleModel.getSubunitRuleList(this._unitId, this._subUnitId);
    let existingCollaborators = [];
    let fetchCollaborators = false;
    const addRules = [];
    for (let i = 0; i < configs.length; i++) {
      const { ranges, options } = configs[i];
      if (ranges.some(
        (range) => rules.some(
          (rule) => rule.ranges.some((ruleRange) => Rectangle.intersects(ruleRange, range.getRange()))
        )
      )) {
        throw new Error(`The specified ranges overlap with existing protected ranges: ${ranges.map((r) => r.getA1Notation()).join(", ")}`);
      }
      const editState = determineEditState(options == null ? void 0 : options.allowedUsers);
      const viewState = determineViewState(options == null ? void 0 : options.allowViewByOthers);
      const scope = determineScope(editState, viewState);
      const collaborators = [];
      if (editState === "designedUserCanEdit" /* DesignedUserCanEdit */) {
        if (!fetchCollaborators) {
          existingCollaborators = await this._authzIoService.listCollaborators({
            objectID: this._unitId,
            unitID: this._unitId
          });
          fetchCollaborators = true;
        }
        options.allowedUsers.forEach((userId) => {
          const existingCollaborator = existingCollaborators.find((c) => {
            var _a;
            return ((_a = c.subject) == null ? void 0 : _a.userID) === userId || c.id === userId;
          });
          if (!existingCollaborator) {
            console.error(`User ${userId} not found in existing collaborators`);
            return;
          }
          collaborators.push({
            id: existingCollaborator.id,
            role: 1 /* Editor */,
            subject: existingCollaborator.subject
          });
        });
      }
      const permissionId = await this._authzIoService.create({
        objectType: 3 /* SelectRange */,
        selectRangeObject: {
          collaborators,
          unitID: this._unitId,
          name: (options == null ? void 0 : options.name) || "",
          scope
        }
      });
      const ruleId = `ruleId_${generateRandomId(6)}`;
      addRules.push({
        ranges: ranges.map((r) => r.getRange()),
        permissionId,
        id: ruleId,
        description: options == null ? void 0 : options.name,
        unitType: 3 /* SelectRange */,
        unitId: this._unitId,
        subUnitId: this._subUnitId,
        viewState,
        editState
      });
    }
    const result = this._commandService.syncExecuteCommand(AddRangeProtectionMutation.id, {
      unitId: this._unitId,
      subUnitId: this._subUnitId,
      rules: addRules
    });
    if (!result) {
      throw new Error("Failed to create range protection rules");
    }
    const rangeProtectionRules = addRules.map((item, i) => {
      const rule = this._injector.createInstance(
        FRangeProtectionRule,
        this._unitId,
        this._subUnitId,
        item.id,
        item.permissionId,
        configs[i].ranges,
        configs[i].options || {}
      );
      return rule;
    });
    return rangeProtectionRules;
  }
  /**
   * Remove multiple protection rules at once.
   * @param {string[]} ruleIds Array of rule IDs to remove.
   * @returns {Promise<void>} A promise that resolves when the rules are removed.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const worksheetPermission = fWorksheet.getWorksheetPermission();
   * const rules = await worksheetPermission.listRangeProtectionRules();
   * // Unprotect the first rule as an example
   * if (rules.length > 0) {
   *   const result = await worksheetPermission.unprotectRules([rules[0].id]);
   *   console.log(result);
   * }
   * ```
   */
  async unprotectRules(ruleIds) {
    if (!ruleIds || ruleIds.length === 0) {
      return true;
    }
    const result = await this._commandService.executeCommand(DeleteRangeProtectionMutation.id, {
      unitId: this._unitId,
      subUnitId: this._subUnitId,
      ruleIds
    });
    if (result) {
      handleWorksheetRangePermissionIsEmpty(this._injector, this._unitId, this._subUnitId);
    }
    return result;
  }
  /**
   * List all range protection rules for the worksheet.
   * @returns {Promise<FRangeProtectionRule[]>} Array of protection rules.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const rules = await fWorksheet.getWorksheetPermission().listRangeProtectionRules();
   * console.log(rules);
   * ```
   */
  async listRangeProtectionRules(options) {
    return getListRangeProtectionRules(
      this._injector,
      this._unitId,
      this._subUnitId,
      {
        worksheet: this._worksheet,
        ignoreCollaborators: options == null ? void 0 : options.ignoreCollaborators
      }
    );
  }
  /**
   * Debug cell permission information.
   * @param {number} row Row index.
   * @param {number} col Column index.
   * @returns {FRangeProtectionRule | undefined} Debug information about which rules affect this cell, or null if no rules apply.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Get debug info for cell C3
   * const fRange = fWorksheet.getRange('C3');
   * const debugInfo = await fWorksheet.getWorksheetPermission().debugCellPermission(fRange.getRow(), fRange.getColumn());
   * console.log(debugInfo);
   * ```
   */
  async debugCellPermission(row, col) {
    const rules = this._rangeProtectionRuleModel.getSubunitRuleList(this._unitId, this._subUnitId);
    const cellRange = cellToRange(row, col);
    const rule = rules.find(
      (rule2) => rule2.ranges.some((range) => Rectangle.intersects(cellRange, range))
    );
    if (!rule) {
      return;
    }
    const ranges = rule.ranges.map((range) => this._worksheet.getRange(range));
    const options = {
      name: rule.description || "",
      allowViewByOthers: rule.viewState !== "noOneElseCanView" /* NoOneElseCanView */
    };
    if (rule.editState === "designedUserCanEdit" /* DesignedUserCanEdit */) {
      options.allowedUsers = [];
      try {
        const collaborators = await this._authzIoService.listCollaborators({
          objectID: rule.permissionId,
          unitID: this._unitId
        });
        options.allowedUsers = collaborators.map((c) => {
          var _a;
          return ((_a = c.subject) == null ? void 0 : _a.userID) || c.id;
        });
      } catch (error) {
        console.error(`Failed to fetch collaborators for rule ${rule.id}:`, error);
      }
    }
    return this._injector.createInstance(
      FRangeProtectionRule,
      this._unitId,
      this._subUnitId,
      rule.id,
      rule.permissionId,
      ranges,
      options
    );
  }
};
FWorksheetPermission = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IPermissionService),
  __decorateParam(3, IAuthzIoService),
  __decorateParam(4, ICommandService),
  __decorateParam(5, Inject(RangeProtectionRuleModel)),
  __decorateParam(6, Inject(WorksheetProtectionPointModel)),
  __decorateParam(7, Inject(WorksheetProtectionRuleModel))
], FWorksheetPermission);

// ../packages/sheets/src/facade/utils.ts
function transformFacadeHorizontalAlignment(value) {
  switch (value) {
    case "left":
      return 1 /* LEFT */;
    case "center":
      return 2 /* CENTER */;
    case "normal":
      return 3 /* RIGHT */;
    default:
      throw new Error(`Invalid horizontal alignment: ${value}`);
  }
}
function transformCoreHorizontalAlignment(value) {
  switch (value) {
    case 1 /* LEFT */:
      return "left";
    case 2 /* CENTER */:
      return "center";
    case 3 /* RIGHT */:
      return "normal";
    default:
      return "general";
  }
}
function transformFacadeVerticalAlignment(value) {
  switch (value) {
    case "top":
      return 1 /* TOP */;
    case "middle":
      return 2 /* MIDDLE */;
    case "bottom":
      return 3 /* BOTTOM */;
    default:
      throw new Error(`Invalid vertical alignment: ${value}`);
  }
}
function transformCoreVerticalAlignment(value) {
  switch (value) {
    case 1 /* TOP */:
      return "top";
    case 2 /* MIDDLE */:
      return "middle";
    case 3 /* BOTTOM */:
      return "bottom";
    default:
      return "general";
  }
}
function covertToRowRange(range, worksheet) {
  return {
    startRow: range.startRow,
    endRow: range.endRow,
    startColumn: 0,
    endColumn: worksheet.getColumnCount() - 1,
    rangeType: 1 /* ROW */
  };
}
function covertToColRange(range, worksheet) {
  return {
    startRow: 0,
    endRow: worksheet.getRowCount() - 1,
    startColumn: range.startColumn,
    endColumn: range.endColumn,
    rangeType: 2 /* COLUMN */
  };
}

// ../packages/sheets/src/facade/f-worksheet.ts
var FWorksheet = class extends FBaseInitialable {
  /**
   * Creates a new worksheet facade instance
   * @param {FWorkbook} _fWorkbook - The facade workbook instance
   * @param {Workbook} _workbook - The workbook instance
   * @param {Worksheet} _worksheet - The worksheet instance
   * @param {Injector} _injector - The injector instance
   * @param {SheetsSelectionsService} _selectionManagerService - The selection manager service
   * @param {ILogService} _logService - The log service
   * @param {ICommandService} _commandService - The command service
   */
  constructor(_fWorkbook, _workbook, _worksheet, _injector, _selectionManagerService, _logService, _commandService) {
    super(_injector);
    __publicField(this, "_fWorkbook", _fWorkbook);
    __publicField(this, "_workbook", _workbook);
    __publicField(this, "_worksheet", _worksheet);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_selectionManagerService", _selectionManagerService);
    __publicField(this, "_logService", _logService);
    __publicField(this, "_commandService", _commandService);
    /**
     * Sets the active selection region for this sheet.
     * @param range - The range to set as the active selection
     * @returns This sheet, for chaining
     * @example
     * ```ts
     * const fWorkSheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
     * if (!fWorkSheet) return;
     * fWorkSheet.setActiveSelection(fWorkSheet.getRange('A10:B10'));
     * ```
     */
    __publicField(this, "setActiveSelection", this.setActiveRange);
  }
  dispose() {
    super.dispose();
    delete this._fWorkbook;
    delete this._workbook;
    delete this._worksheet;
  }
  /**
   * Get the worksheet instance.
   * @returns {Worksheet} The worksheet instance.
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const sheet = fWorksheet.getSheet();
   * console.log(sheet);
   * ```
   */
  getSheet() {
    return this._worksheet;
  }
  /**
   * Get the injector instance.
   * @returns {Injector} The injector instance.
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const injector = fWorksheet.getInject();
   * console.log(injector);
   * ```
   */
  getInject() {
    return this._injector;
  }
  /**
   * Get the workbook instance.
   * @returns {Workbook} The workbook instance.
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const workbook = fWorksheet.getWorkbook();
   * console.log(workbook);
   * ```
   */
  getWorkbook() {
    return this._workbook;
  }
  /**
   * Get the worksheet id.
   * @returns {string} The id of the worksheet.
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const sheetId = fWorksheet.getSheetId();
   * console.log(sheetId);
   * ```
   */
  getSheetId() {
    return this._worksheet.getSheetId();
  }
  /**
   * Get the worksheet name.
   * @returns {string} The name of the worksheet.
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const sheetName = fWorksheet.getSheetName();
   * console.log(sheetName);
   * ```
   */
  getSheetName() {
    return this._worksheet.getName();
  }
  /**
   * Get the current selection of the worksheet.
   * @returns {FSelection} return the current selections of the worksheet or null if there is no selection.
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const selection = fWorksheet.getSelection();
   * console.log(selection);
   * ```
   */
  getSelection() {
    const selections = this._selectionManagerService.getCurrentSelections();
    if (!selections) {
      return null;
    }
    return this._injector.createInstance(FSelection, this._workbook, this._worksheet, selections);
  }
  // #region rows
  // #region default style
  /**
   * Get the default style of the worksheet.
   * @returns {IStyleData} Default style of the worksheet.
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const defaultStyle = fWorksheet.getDefaultStyle();
   * console.log(defaultStyle);
   * ```
   */
  getDefaultStyle() {
    return this._worksheet.getDefaultCellStyle();
  }
  /**
   * Get the default style of the worksheet row
   * @param {number} index - The row index
   * @param {boolean} [keepRaw] - If true, return the raw style data maybe the style name or style data, otherwise return the data from row manager
   * @returns {(Nullable<IStyleData> | string)} The default style of the worksheet row name or style data
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Get default style for row 0 (1)
   * const rowStyle = fWorksheet.getRowDefaultStyle(0);
   * console.log(rowStyle);
   * // Get raw style data for row 0
   * const rawRowStyle = fWorksheet.getRowDefaultStyle(0, true);
   * console.log(rawRowStyle);
   * ```
   */
  getRowDefaultStyle(index, keepRaw = false) {
    return keepRaw ? this._worksheet.getRowStyle(index, keepRaw) : this._worksheet.getRowStyle(index);
  }
  /**
   * Get the default style of the worksheet column
   * @param {number} index - The column index
   * @param {boolean} [keepRaw] - If true, return the raw style data maybe the style name or style data, otherwise return the data from col manager
   * @returns {(Nullable<IStyleData> | string)} The default style of the worksheet column name or style data
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Get default style for column 0 (A)
   * const colStyle = fWorksheet.getColumnDefaultStyle(0);
   * console.log(colStyle);
   * // Get raw style data for column 0
   * const rawColStyle = fWorksheet.getColumnDefaultStyle(0, true);
   * console.log(rawColStyle);
   * ```
   */
  getColumnDefaultStyle(index, keepRaw = false) {
    return keepRaw ? this._worksheet.getColumnStyle(index, keepRaw) : this._worksheet.getColumnStyle(index);
  }
  /**
   * Set the default style of the worksheet
   * @param {string} style - The style to set
   * @returns {FWorksheet} This worksheet instance for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * fWorksheet.setDefaultStyle('default');
   * // or
   * // fWorksheet.setDefaultStyle({fs: 12, ff: 'Arial'});
   * ```
   */
  setDefaultStyle(style) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    this._commandService.syncExecuteCommand(SetWorksheetDefaultStyleMutation.id, {
      unitId,
      subUnitId,
      defaultStyle: style
    });
    this._worksheet.setDefaultCellStyle(style);
    return this;
  }
  /**
   * Set the default style of the worksheet row
   * @param {number} index - The row index
   * @param {string | Nullable<IStyleData>} style - The style name or style data
   * @returns {FWorksheet} This sheet, for chaining.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * fWorksheet.setColumnDefaultStyle(0, 'default');
   * // or
   * // fWorksheet.setColumnDefaultStyle(0, {fs: 12, ff: 'Arial'});
   * ```
   */
  setColumnDefaultStyle(index, style) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const params = {
      unitId,
      subUnitId,
      columnData: {
        [index]: {
          s: style
        }
      }
    };
    this._commandService.syncExecuteCommand(SetColDataCommand.id, params);
    return this;
  }
  /**
   * Set the default style of the worksheet column
   * @param {number} index - The column index
   * @param {string | Nullable<IStyleData>} style - The style name or style data
   * @returns {FWorksheet} This sheet, for chaining.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * fWorksheet.setRowDefaultStyle(0, 'default');
   * // or
   * // fWorksheet.setRowDefaultStyle(0, {fs: 12, ff: 'Arial'});
   * ```
   */
  setRowDefaultStyle(index, style) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const params = {
      unitId,
      subUnitId,
      rowData: {
        [index]: {
          s: style
        }
      }
    };
    this._commandService.syncExecuteCommand(SetRowDataCommand.id, params);
    return this;
  }
  getRange(rowOrA1Notation, column, numRows, numColumns) {
    let range;
    let sheet;
    if (typeof rowOrA1Notation === "object") {
      range = rowOrA1Notation;
      sheet = this._worksheet;
    } else if (typeof rowOrA1Notation === "string") {
      const { range: parsedRange, sheetName } = deserializeRangeWithSheet(rowOrA1Notation);
      const rangeSheet = sheetName ? this._workbook.getSheetBySheetName(sheetName) : this._worksheet;
      if (!rangeSheet) {
        throw new Error("Range not found");
      }
      sheet = rangeSheet;
      range = {
        ...parsedRange,
        unitId: this._workbook.getUnitId(),
        sheetId: sheet.getSheetId(),
        // Use the current range instead of the future actual range to match Apps Script behavior.
        // Users can create the latest range in real time when needed.
        rangeType: 0 /* NORMAL */,
        startRow: parsedRange.rangeType === 2 /* COLUMN */ ? 0 : parsedRange.startRow,
        endRow: parsedRange.rangeType === 2 /* COLUMN */ ? sheet.getMaxRows() - 1 : parsedRange.endRow,
        startColumn: parsedRange.rangeType === 1 /* ROW */ ? 0 : parsedRange.startColumn,
        endColumn: parsedRange.rangeType === 1 /* ROW */ ? sheet.getMaxColumns() - 1 : parsedRange.endColumn
      };
    } else if (typeof rowOrA1Notation === "number" && column !== void 0) {
      sheet = this._worksheet;
      range = {
        startRow: rowOrA1Notation,
        endRow: rowOrA1Notation + (numRows != null ? numRows : 1) - 1,
        startColumn: column,
        endColumn: column + (numColumns != null ? numColumns : 1) - 1,
        unitId: this._workbook.getUnitId(),
        sheetId: this._worksheet.getSheetId()
      };
    } else {
      throw new Error("Invalid range specification");
    }
    return this._injector.createInstance(FRange, this._workbook, sheet, range);
  }
  /**
   * Returns the current number of columns in the sheet, regardless of content.
   * @returns {number} The maximum columns count of the sheet
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const totalColumns = fWorksheet.getMaxColumns();
   * console.log(`Sheet has ${totalColumns} columns`);
   * ```
   */
  getMaxColumns() {
    return this._worksheet.getMaxColumns();
  }
  /**
   * Returns the current number of rows in the sheet, regardless of content.
   * @returns {number}The maximum rows count of the sheet
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const totalRows = fWorksheet.getMaxRows();
   * console.log(`Sheet has ${totalRows} rows`);
   * ```
   */
  getMaxRows() {
    return this._worksheet.getMaxRows();
  }
  /**
   * Inserts a row after the given row position.
   * @param {number} afterPosition - The row after which the new row should be added, starting at 0 for the first row.
   * @returns {FWorksheet} This sheet, for chaining.
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Insert a row after the third row
   * fWorksheet.insertRowAfter(2);
   * // Insert a row after the first row
   * fWorksheet.insertRowAfter(0);
   * ```
   */
  insertRowAfter(afterPosition) {
    return this.insertRowsAfter(afterPosition, 1);
  }
  /**
   * Inserts a row before the given row position.
   * @param {number} beforePosition - The row before which the new row should be added, starting at 0 for the first row.
   * @returns {FWorksheet} This sheet, for chaining.
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Insert a row before the third row
   * fWorksheet.insertRowBefore(2);
   * // Insert a row before the first row
   * fWorksheet.insertRowBefore(0);
   * ```
   */
  insertRowBefore(beforePosition) {
    return this.insertRowsBefore(beforePosition, 1);
  }
  /**
   * Inserts one or more consecutive blank rows in a sheet starting at the specified location.
   * @param {number} rowIndex - The index indicating where to insert a row, starting at 0 for the first row.
   * @param {number} numRows - The number of rows to insert.
   * @returns {FWorksheet} This sheet, for chaining.
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Insert 3 rows before the third row
   * fWorksheet.insertRows(2, 3);
   * // Insert 1 row before the first row
   * fWorksheet.insertRows(0);
   * ```
   */
  insertRows(rowIndex, numRows = 1) {
    return this.insertRowsBefore(rowIndex, numRows);
  }
  /**
   * Inserts a number of rows after the given row position.
   * @param {number} afterPosition - The row after which the new rows should be added, starting at 0 for the first row.
   * @param {number} howMany - The number of rows to insert.
   * @returns {FWorksheet} This sheet, for chaining.
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Insert 3 rows after the third row
   * fWorksheet.insertRowsAfter(2, 3);
   * // Insert 1 row after the first row
   * fWorksheet.insertRowsAfter(0, 1);
   * ```
   */
  insertRowsAfter(afterPosition, howMany) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const direction = 2 /* DOWN */;
    const startRow = afterPosition + 1;
    const endRow = afterPosition + howMany;
    const startColumn = 0;
    const endColumn = this._worksheet.getColumnCount() - 1;
    const cellValue = copyRangeStyles(this._worksheet, startRow, endRow, startColumn, endColumn, true, afterPosition);
    this._commandService.syncExecuteCommand(InsertRowByRangeCommand.id, {
      unitId,
      subUnitId,
      direction,
      range: {
        startRow,
        endRow,
        startColumn,
        endColumn
      },
      cellValue
    });
    return this;
  }
  /**
   * Inserts a number of rows before the given row position.
   * @param {number} beforePosition - The row before which the new rows should be added, starting at 0 for the first row.
   * @param {number} howMany - The number of rows to insert.
   * @returns {FWorksheet} This sheet, for chaining.
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Insert 3 rows before the third row
   * fWorksheet.insertRowsBefore(2, 3);
   * // Insert 1 row before the first row
   * fWorksheet.insertRowsBefore(0, 1);
   * ```
   */
  insertRowsBefore(beforePosition, howMany) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const direction = 0 /* UP */;
    const startRow = beforePosition;
    const endRow = beforePosition + howMany - 1;
    const startColumn = 0;
    const endColumn = this._worksheet.getColumnCount() - 1;
    const cellValue = copyRangeStyles(this._worksheet, startRow, endRow, startColumn, endColumn, true, beforePosition - 1);
    this._commandService.syncExecuteCommand(InsertRowByRangeCommand.id, {
      unitId,
      subUnitId,
      direction,
      range: {
        startRow,
        endRow,
        startColumn,
        endColumn
      },
      cellValue
    });
    return this;
  }
  /**
   * Deletes the row at the given row position.
   * @param {number} rowPosition - The position of the row, starting at 0 for the first row.
   * @returns {FWorksheet} This sheet, for chaining.
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Delete the third row
   * fWorksheet.deleteRow(2);
   * // Delete the first row
   * fWorksheet.deleteRow(0);
   * ```
   */
  deleteRow(rowPosition) {
    return this.deleteRows(rowPosition, 1);
  }
  /**
   * Deletes a number of rows starting at the given row position.
   * @param {number} rowPosition - The position of the first row to delete, starting at 0 for the first row.
   * @param {number} howMany - The number of rows to delete.
   * @returns {FWorksheet} This sheet, for chaining.
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Delete 3 rows at row index 2 (rows 3-5)
   * fWorksheet.deleteRows(2, 3);
   * // Delete 1 row at row index 0 (first row)
   * fWorksheet.deleteRows(0, 1);
   * ```
   */
  deleteRows(rowPosition, howMany) {
    const range = {
      startRow: rowPosition,
      endRow: rowPosition + howMany - 1,
      startColumn: 0,
      endColumn: this._worksheet.getColumnCount() - 1
    };
    this._commandService.syncExecuteCommand(RemoveRowByRangeCommand.id, {
      range,
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId()
    });
    return this;
  }
  /**
   * Deletes the rows specified by the given row points. Each point can be a single row index or a tuple representing a range of rows.
   * @param {Array<number | [number, number]>} rowPoints - An array of row points to delete. Each point can be a single row index or a tuple representing a range of rows.
   * @returns {FWorksheet} This sheet, for chaining.
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Delete rows at index 2, and range from index 4 to 6 (rows 3, 5-7)
   * fWorksheet.deleteRowsByPoints([2, [4, 6]]);
   * ```
   */
  deleteRowsByPoints(rowPoints) {
    const rowIntervals = generateIntervalsByPoints(rowPoints);
    rowIntervals.reverse().forEach((interval) => {
      this.deleteRows(interval[0], interval[1] - interval[0] + 1);
    });
    return this;
  }
  /**
   * Moves the rows selected by the given range to the position indicated by the destinationIndex. The rowSpec itself does not have to exactly represent an entire row or group of rows to move—it selects all rows that the range spans.
   * @param {FRange} rowSpec - A range spanning the rows that should be moved.
   * @param {number} destinationIndex - The index that the rows should be moved to. Note that this index is based on the coordinates before the rows are moved. Existing data is shifted down to make room for the moved rows while the source rows are removed from the grid. Therefore, the data may end up at a different index than originally specified. Use 0-index for this method.
   * @returns {FWorksheet} This sheet, for chaining.
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Move 3 rows at row index 2 (rows 3-5) to row index 0
   * const rowSpec1 = fWorksheet.getRange('3:5');
   * fWorksheet.moveRows(rowSpec1, 0);
   * // Move 1 row at row index 0 (first row) to row index 2
   * const rowSpec2 = fWorksheet.getRange('1:1');
   * fWorksheet.moveRows(rowSpec2, 2);
   * ```
   */
  moveRows(rowSpec, destinationIndex) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const range = covertToRowRange(rowSpec.getRange(), this._worksheet);
    const fromRange = range;
    const toRange = {
      startRow: destinationIndex,
      endRow: destinationIndex,
      startColumn: range.startColumn,
      endColumn: range.endColumn
    };
    this._commandService.syncExecuteCommand(MoveRowsCommand.id, {
      unitId,
      subUnitId,
      range,
      fromRange,
      toRange
    });
    return this;
  }
  /**
   * Hides the rows in the given range.
   * @param {FRange} row - The row range to hide.
   * @returns {FWorksheet} This sheet, for chaining.
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Hide 3 rows starting from row index 1 (rows 2-4)
   * const row1 = fWorksheet.getRange('2:4');
   * fWorksheet.hideRow(row1);
   * // Hide single row at index 0 (first row)
   * const row2 = fWorksheet.getRange('1:1');
   * fWorksheet.hideRow(row2);
   * ```
   */
  hideRow(row) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const range = covertToRowRange(row.getRange(), this._worksheet);
    this._commandService.syncExecuteCommand(SetRowHiddenCommand.id, {
      unitId,
      subUnitId,
      ranges: [range]
    });
    return this;
  }
  /**
   * Hides one or more consecutive rows starting at the given index. Use 0-index for this method
   * @param {number} rowIndex - The starting index of the rows to hide
   * @param {number} numRow - The number of rows to hide
   * @returns {FWorksheet} This sheet, for chaining.
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Hide 3 rows starting from row index 1 (rows 2-4)
   * fWorksheet.hideRows(1, 3);
   * // Hide single row at index 0 (first row)
   * fWorksheet.hideRows(0);
   * ```
   */
  hideRows(rowIndex, numRow = 1) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const range = {
      startRow: rowIndex,
      endRow: rowIndex + numRow - 1,
      startColumn: 0,
      endColumn: this._worksheet.getColumnCount() - 1,
      rangeType: 1 /* ROW */
    };
    this._commandService.syncExecuteCommand(SetRowHiddenCommand.id, {
      unitId,
      subUnitId,
      ranges: [range]
    });
    return this;
  }
  /**
   * Make the row in the given range visible.
   * @param {FRange} row - The range to unhide, if hidden.
   * @returns {FWorksheet} This sheet, for chaining.
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Unhide 3 rows starting from row index 1 (rows 2-4)
   * const row1 = fWorksheet.getRange('2:4');
   * fWorksheet.unhideRow(row1);
   * // Unhide single row at index 0 (first row)
   * const row2 = fWorksheet.getRange('1:1');
   * fWorksheet.unhideRow(row2);
   * ```
   */
  unhideRow(row) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const range = covertToRowRange(row.getRange(), this._worksheet);
    this._commandService.syncExecuteCommand(SetSpecificRowsVisibleCommand.id, {
      unitId,
      subUnitId,
      ranges: [range]
    });
    return this;
  }
  /**
   * Scrolling sheet to make specific rows visible.
   * @param {number} rowIndex - The starting index of the rows
   * @param {number} numRows - The number of rows
   * @returns {FWorksheet} This worksheet instance for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Show 3 rows starting from row index 1 (rows 2-4)
   * fWorksheet.showRows(1, 3);
   * // Show single row at index 0 (first row)
   * fWorksheet.showRows(0);
   * ```
   */
  showRows(rowIndex, numRows = 1) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const range = {
      startRow: rowIndex,
      endRow: rowIndex + numRows - 1,
      startColumn: 0,
      endColumn: this._worksheet.getColumnCount() - 1,
      rangeType: 1 /* ROW */
    };
    this._commandService.syncExecuteCommand(SetSpecificRowsVisibleCommand.id, {
      unitId,
      subUnitId,
      ranges: [range]
    });
    return this;
  }
  /**
   * Sets the row height of the given row in pixels. By default, rows grow to fit cell contents. If you want to force rows to a specified height, use setRowHeightsForced(startRow, numRows, height).
   * @param {number} rowPosition - The row position to change.
   * @param {number} height - The height in pixels to set it to.
   * @returns {FWorksheet} This worksheet instance for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Set the height of the second row to 30 pixels
   * fWorksheet.setRowHeight(1, 30);
   * // Set the height of the first row to 20 pixels
   * fWorksheet.setRowHeight(0, 20);
   * ```
   */
  setRowHeight(rowPosition, height) {
    return this.setRowHeights(rowPosition, 1, height);
  }
  /**
   * Make certain row wrap and auto height.
   * @param {number} rowPosition - The row position to change.
   * @param {BooleanNumber} auto - Whether to auto fit the row height.
   * @returns {FWorksheet} This worksheet instance for chaining
   * @example
   * ```ts
   * const fWorkSheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * fWorkSheet.autoFitRow(24);
   * ```
   */
  autoFitRow(rowPosition, auto = 1 /* TRUE */) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const ranges = [{
      startRow: rowPosition,
      endRow: rowPosition,
      startColumn: 0,
      endColumn: this._worksheet.getColumnCount() - 1
    }];
    this._commandService.syncExecuteCommand(SetTextWrapCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: ranges[0],
      value: 3 /* WRAP */
    });
    this._commandService.syncExecuteCommand(SetWorksheetRowIsAutoHeightMutation.id, {
      unitId,
      subUnitId,
      ranges,
      autoHeightInfo: auto
    });
    return this;
  }
  /**
   * Sets the height of the given rows in pixels.
   * By default, rows grow to fit cell contents. If you want to force rows to a specified height, use setRowHeightsForced(startRow, numRows, height).
   * @param {number} startRow - The starting row position to change
   * @param {number} numRows - The number of rows to change
   * @param {number} height - The height in pixels to set it to
   * @returns {FWorksheet} This worksheet instance for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * fWorksheet.setRowHeights(1, 10, 30);
   * ```
   */
  setRowHeights(startRow, numRows, height) {
    var _a;
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const rowManager = this._worksheet.getRowManager();
    const autoHeightRanges = [];
    const rowHeightRanges = [];
    for (let i = startRow; i < startRow + numRows; i++) {
      const autoRowHeight = ((_a = rowManager.getRow(i)) == null ? void 0 : _a.ah) || this._worksheet.getConfig().defaultRowHeight;
      const range = {
        startRow: i,
        endRow: i,
        startColumn: 0,
        endColumn: this._worksheet.getColumnCount() - 1
      };
      if (height <= autoRowHeight) {
        autoHeightRanges.push(range);
      } else {
        rowHeightRanges.push(range);
      }
    }
    if (rowHeightRanges.length > 0) {
      this._commandService.syncExecuteCommand(SetRowHeightCommand.id, {
        unitId,
        subUnitId,
        ranges: rowHeightRanges,
        value: height
      });
    }
    if (autoHeightRanges.length > 0) {
      this._commandService.syncExecuteCommand(SetWorksheetRowIsAutoHeightCommand.id, {
        unitId,
        subUnitId,
        ranges: autoHeightRanges
      });
    }
    return this;
  }
  /**
   * Gets the height in pixels of the given row.
   * @param {number} rowPosition - The position of the row to examine. index starts at 0.
   * @returns {number} The height in pixels of the given row.
   * @example
   * ```typescript
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   *
   * // Set the value of the cell A1 to 'Hello, Univer!', set the font size to 30 and font weight to bold
   * const fRange = fWorksheet.getRange('A1');
   * fRange.setValue('Hello, Univer!').setFontSize(30).setFontWeight('bold');
   *
   * // Get the height of the first row
   * console.log(fWorksheet.getRowHeight(0));
   * ```
   */
  getRowHeight(rowPosition) {
    return this._worksheet.getRowHeight(rowPosition);
  }
  /**
   * Sets the height of the given rows to auto.
   * @param {number} startRow - The starting row position to change
   * @param {number} numRows - The number of rows to change
   * @returns {FWorksheet} This worksheet instance for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * fWorksheet.setRowAutoHeight(1, 10);
   * ```
   */
  setRowAutoHeight(startRow, numRows) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const ranges = [
      {
        startRow,
        endRow: startRow + numRows - 1,
        startColumn: 0,
        endColumn: this._worksheet.getColumnCount() - 1
      }
    ];
    this._commandService.syncExecuteCommand(SetWorksheetRowIsAutoHeightCommand.id, {
      unitId,
      subUnitId,
      ranges
    });
    return this;
  }
  /**
   * Sets the height of the given ranges to auto.
   * @param {IRange[]} ranges - The ranges to change
   * @returns {FWorksheet} This worksheet instance for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const ranges = [
   * { startRow: 1, endRow: 10, startColumn: 0, endColumn: 10 },
   * { startRow: 11, endRow: 20, startColumn: 0, endColumn: 10 },
   * ]
   * fWorksheet.setRangesAutoHeight(ranges);
   * ```
   */
  setRangesAutoHeight(ranges) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    this._commandService.syncExecuteCommand(SetWorksheetRowIsAutoHeightCommand.id, {
      unitId,
      subUnitId,
      ranges
    });
    return this;
  }
  /**
   * Sets the height of the given rows in pixels. By default, rows grow to fit cell contents. When you use setRowHeightsForced, rows are forced to the specified height even if the cell contents are taller than the row height.
   * @param {number} startRow - The starting row position to change
   * @param {number} numRows - The number of rows to change
   * @param {number} height - The height in pixels to set it to
   * @returns {FWorksheet} This worksheet instance for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * fWorksheet.setRowHeightsForced(1, 10, 30);
   * ```
   */
  setRowHeightsForced(startRow, numRows, height) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const ranges = [
      {
        startRow,
        endRow: startRow + numRows - 1,
        startColumn: 0,
        endColumn: this._worksheet.getColumnCount() - 1
      }
    ];
    this._commandService.syncExecuteCommand(SetRowHeightCommand.id, {
      unitId,
      subUnitId,
      ranges,
      value: height
    });
    return this;
  }
  // #endregion
  /**
   * Set custom properties for given rows.
   * @param {IObjectArrayPrimitiveType<CustomData>} custom - The custom properties to set
   * @returns {FWorksheet} This worksheet instance for chaining
   * @example
   * ```typescript
   * const fWorkSheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * fWorkSheet.setRowCustom({ 0: { key: 'value' } });
   * ```
   */
  setRowCustom(custom) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const rowData = {};
    for (const [rowIndex, customData] of Object.entries(custom)) {
      rowData[Number(rowIndex)] = {
        custom: customData
      };
    }
    const params = {
      unitId,
      subUnitId,
      rowData
    };
    this._commandService.syncExecuteCommand(SetRowDataCommand.id, params);
    return this;
  }
  // #region Column
  /**
   * Inserts a column after the given column position.
   * @param {number} afterPosition - The column after which the new column should be added, starting at 0 for the first column
   * @returns {FWorksheet} This worksheet instance for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Insert a column after column C
   * fWorksheet.insertColumnAfter(2);
   * // Insert a column after column A
   * fWorksheet.insertColumnAfter(0);
   * ```
   */
  insertColumnAfter(afterPosition) {
    return this.insertColumnsAfter(afterPosition, 1);
  }
  /**
   * Inserts a column before the given column position.
   * @param {number} beforePosition - The column before which the new column should be added, starting at 0 for the first column
   * @returns {FWorksheet} This worksheet instance for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Insert a column before column C
   * fWorksheet.insertColumnBefore(2);
   * // Insert a column before column A
   * fWorksheet.insertColumnBefore(0);
   * ```
   */
  insertColumnBefore(beforePosition) {
    return this.insertColumnsBefore(beforePosition, 1);
  }
  /**
   * Inserts one or more consecutive blank columns in a sheet starting at the specified location.
   * @param {number} columnIndex - The index indicating where to insert a column, starting at 0 for the first column
   * @param {number} numColumns - The number of columns to insert
   * @returns {FWorksheet} This sheet, for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Insert 3 columns before column C
   * fWorksheet.insertColumns(2, 3);
   * // Insert 1 column before column A
   * fWorksheet.insertColumns(0);
   * ```
   */
  insertColumns(columnIndex, numColumns = 1) {
    return this.insertColumnsBefore(columnIndex, numColumns);
  }
  /**
   * Inserts a given number of columns after the given column position.
   * @param {number} afterPosition - The column after which the new columns should be added, starting at 0 for the first column
   * @param {number} howMany - The number of columns to insert
   * @returns {FWorksheet} This sheet, for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Insert 3 columns after column C
   * fWorksheet.insertColumnsAfter(2, 3);
   * // Insert 1 column after column A
   * fWorksheet.insertColumnsAfter(0, 1);
   * ```
   */
  insertColumnsAfter(afterPosition, howMany) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const direction = 1 /* RIGHT */;
    const startRow = 0;
    const endRow = this._worksheet.getRowCount() - 1;
    const startColumn = afterPosition + 1;
    const endColumn = afterPosition + howMany;
    const cellValue = copyRangeStyles(this._worksheet, startRow, endRow, startColumn, endColumn, false, afterPosition);
    this._commandService.syncExecuteCommand(InsertColByRangeCommand.id, {
      unitId,
      subUnitId,
      direction,
      range: {
        startRow,
        endRow,
        startColumn,
        endColumn
      },
      cellValue
    });
    return this;
  }
  /**
   * Inserts a number of columns before the given column position.
   * @param {number} beforePosition - The column before which the new columns should be added, starting at 0 for the first column
   * @param {number} howMany - The number of columns to insert
   * @returns {FWorksheet} This sheet, for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Insert 3 columns before column C
   * fWorksheet.insertColumnsBefore(2, 3);
   * // Insert 1 column before column A
   * fWorksheet.insertColumnsBefore(0, 1);
   * ```
   */
  insertColumnsBefore(beforePosition, howMany) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const direction = 3 /* LEFT */;
    const startRow = 0;
    const endRow = this._worksheet.getRowCount() - 1;
    const startColumn = beforePosition;
    const endColumn = beforePosition + howMany - 1;
    const cellValue = copyRangeStyles(this._worksheet, startRow, endRow, startColumn, endColumn, false, beforePosition - 1);
    this._commandService.syncExecuteCommand(InsertColByRangeCommand.id, {
      unitId,
      subUnitId,
      direction,
      range: {
        startRow,
        endRow,
        startColumn,
        endColumn
      },
      cellValue
    });
    return this;
  }
  /**
   * Deletes the column at the given column position.
   * @param {number} columnPosition - The position of the column, starting at 0 for the first column
   * @returns {FWorksheet} This sheet, for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Delete column C
   * fWorksheet.deleteColumn(2);
   * // Delete column A
   * fWorksheet.deleteColumn(0);
   * ```
   */
  deleteColumn(columnPosition) {
    return this.deleteColumns(columnPosition, 1);
  }
  /**
   * Deletes a number of columns starting at the given column position.
   * @param {number} columnPosition - The position of the first column to delete, starting at 0 for the first column
   * @param {number} howMany - The number of columns to delete
   * @returns {FWorksheet} This sheet, for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Delete 3 columns at column index 2 (columns C, D, E)
   * fWorksheet.deleteColumns(2, 3);
   * // Delete 1 column at column index 0 (column A)
   * fWorksheet.deleteColumns(0, 1);
   * ```
   */
  deleteColumns(columnPosition, howMany) {
    const range = {
      startRow: 0,
      endRow: this._worksheet.getRowCount() - 1,
      startColumn: columnPosition,
      endColumn: columnPosition + howMany - 1
    };
    this._commandService.syncExecuteCommand(RemoveColByRangeCommand.id, {
      range,
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId()
    });
    return this;
  }
  /**
   * Deletes the columns specified by the given column points. Each point can be a single column index or a tuple representing a range of columns.
   * @param {Array<number | [number, number]>} columnPoints - An array of column points to delete. Each point can be a single column index or a tuple representing a range of columns.
   * @returns {FWorksheet} This sheet, for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Delete columns at index 2, and range from index 4 to 6 (columns C, E-G)
   * fWorksheet.deleteColumnsByPoints([2, [4, 6]]);
   * ```
   */
  deleteColumnsByPoints(columnPoints) {
    const columnIntervals = generateIntervalsByPoints(columnPoints);
    columnIntervals.reverse().forEach((interval) => {
      this.deleteColumns(interval[0], interval[1] - interval[0] + 1);
    });
    return this;
  }
  /**
   * Moves the columns selected by the given range to the position indicated by the destinationIndex. The columnSpec itself does not have to exactly represent an entire column or group of columns to move—it selects all columns that the range spans.
   * @param {FRange} columnSpec - A range spanning the columns that should be moved
   * @param {number} destinationIndex - The index that the columns should be moved to. Note that this index is based on the coordinates before the columns are moved. Existing data is shifted right to make room for the moved columns while the source columns are removed from the grid. Therefore, the data may end up at a different index than originally specified. Use 0-index for this method
   * @returns {FWorksheet} This sheet, for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Move columns C, D, E to column index 2 (columns B, C, D)
   * const columnSpec1 = fWorksheet.getRange('C:E');
   * fWorksheet.moveColumns(columnSpec1, 1);
   * // Move column F to column index 0 (column A)
   * const columnSpec2 = fWorksheet.getRange('F:F');
   * fWorksheet.moveColumns(columnSpec2, 0);
   * ```
   */
  moveColumns(columnSpec, destinationIndex) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const range = covertToColRange(columnSpec.getRange(), this._worksheet);
    const fromRange = range;
    const toRange = {
      startRow: 0,
      endRow: this._worksheet.getRowCount() - 1,
      startColumn: destinationIndex,
      endColumn: destinationIndex
    };
    this._commandService.syncExecuteCommand(MoveColsCommand.id, {
      unitId,
      subUnitId,
      range,
      fromRange,
      toRange
    });
    return this;
  }
  /**
   * Hides the column or columns in the given range.
   * @param {FRange} column - The column range to hide
   * @returns {FWorksheet} This sheet, for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Hide columns C, D, E
   * const column1 = fWorksheet.getRange('C:E');
   * fWorksheet.hideColumn(column1);
   * // Hide column A
   * const column2 = fWorksheet.getRange('A:A');
   * fWorksheet.hideColumn(column2);
   * ```
   */
  hideColumn(column) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const range = covertToColRange(column.getRange(), this._worksheet);
    this._commandService.syncExecuteCommand(SetColHiddenCommand.id, {
      unitId,
      subUnitId,
      ranges: [range]
    });
    return this;
  }
  /**
   * Hides one or more consecutive columns starting at the given index. Use 0-index for this method
   * @param {number} columnIndex - The starting index of the columns to hide
   * @param {number} numColumn - The number of columns to hide
   * @returns {FWorksheet} This sheet, for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Hide columns C, D, E
   * fWorksheet.hideColumns(2, 3);
   * // Hide column A
   * fWorksheet.hideColumns(0, 1);
   * ```
   */
  hideColumns(columnIndex, numColumn = 1) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const range = {
      startRow: 0,
      endRow: this._worksheet.getRowCount() - 1,
      startColumn: columnIndex,
      endColumn: columnIndex + numColumn - 1,
      rangeType: 2 /* COLUMN */
    };
    this._commandService.syncExecuteCommand(SetColHiddenCommand.id, {
      unitId,
      subUnitId,
      ranges: [range]
    });
    return this;
  }
  /**
   * Show the column in the given range.
   * @param {FRange} column - The range to unhide, if hidden
   * @returns {FWorksheet} This sheet, for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Unhide columns C, D, E
   * const column1 = fWorksheet.getRange('C:E');
   * fWorksheet.unhideColumn(column1);
   * // Unhide column A
   * const column2 = fWorksheet.getRange('A:A');
   * fWorksheet.unhideColumn(column2);
   * ```
   */
  unhideColumn(column) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const range = covertToColRange(column.getRange(), this._worksheet);
    this._commandService.syncExecuteCommand(SetSpecificColsVisibleCommand.id, {
      unitId,
      subUnitId,
      ranges: [range]
    });
    return this;
  }
  /**
   * Show one or more consecutive columns starting at the given index. Use 0-index for this method
   * @param {number} columnIndex - The starting index of the columns to unhide
   * @param {number} numColumns - The number of columns to unhide
   * @returns {FWorksheet} This sheet, for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Unhide columns C, D, E
   * fWorksheet.showColumns(2, 3);
   * // Unhide column A
   * fWorksheet.showColumns(0, 1);
   * ```
   */
  showColumns(columnIndex, numColumns = 1) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const range = {
      startRow: 0,
      endRow: this._worksheet.getRowCount() - 1,
      startColumn: columnIndex,
      endColumn: columnIndex + numColumns - 1,
      rangeType: 2 /* COLUMN */
    };
    this._commandService.syncExecuteCommand(SetSpecificColsVisibleCommand.id, {
      unitId,
      subUnitId,
      ranges: [range]
    });
    return this;
  }
  /**
   * Sets the width of the given column in pixels.
   * @param {number} columnPosition - The position of the given column to set
   * @param {number} width - The width in pixels to set it to
   * @returns {FWorksheet} This sheet, for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Set width of column B to 100 pixels
   * fWorksheet.setColumnWidth(1, 100);
   * ```
   */
  setColumnWidth(columnPosition, width) {
    return this.setColumnWidths(columnPosition, 1, width);
  }
  /**
   * Sets the width of the given columns in pixels.
   * @param {number} startColumn - The starting column position to change
   * @param {number} numColumn - The number of columns to change
   * @param {number} width - The width in pixels to set it to
   * @returns {FWorksheet} This sheet, for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Set width of columns B-D (index 1-3) to 100 pixels
   * fWorksheet.setColumnWidths(1, 3, 100);
   * ```
   */
  setColumnWidths(startColumn, numColumn, width) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const ranges = [
      {
        startColumn,
        endColumn: startColumn + numColumn - 1,
        startRow: 0,
        endRow: this._worksheet.getRowCount() - 1
      }
    ];
    this._commandService.syncExecuteCommand(SetColWidthCommand.id, {
      unitId,
      subUnitId,
      ranges,
      value: width
    });
    return this;
  }
  /**
   * Gets the width in pixels of the given column.
   * @param {number} columnPosition - The position of the column to examine. index starts at 0.
   * @returns {number} The width of the column in pixels
   * @example
   * ```typescript
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   *
   * // Set the long text value in cell A1
   * const fRange = fWorksheet.getRange('A1');
   * fRange.setValue('Whenever it is a damp, drizzly November in my soul...');
   *
   * // Set the column A to a width which fits the text
   * fWorksheet.autoResizeColumn(0);
   *
   * // Get the width of the column A
   * console.log(fWorksheet.getColumnWidth(0));
   * ```
   */
  getColumnWidth(columnPosition) {
    return this._worksheet.getColumnWidth(columnPosition);
  }
  // #endregion
  /**
   * Set custom properties for given columns.
   * @param {IObjectArrayPrimitiveType<CustomData>} custom - The custom properties to set
   * @returns {FWorksheet} This worksheet instance for chaining
   * @example
   * ```ts
   * const fWorkSheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * fWorkSheet.setColumnCustom({ 0: { key: 'value' } });
   * ```
   */
  setColumnCustom(custom) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const columnData = {};
    for (const [columnIndex, customData] of Object.entries(custom)) {
      columnData[Number(columnIndex)] = {
        custom: customData
      };
    }
    const params = {
      unitId,
      subUnitId,
      columnData
    };
    this._commandService.syncExecuteCommand(SetColDataCommand.id, params);
    return this;
  }
  // #region merge cells
  /**
   * Get all merged cells in the current worksheet
   * @returns {FRange[]} All the merged cells in the worksheet
   * @example
   * ```ts
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Get all merged ranges in the sheet
   * const mergedData = fWorksheet.getMergeData();
   * // Process each merged range
   * mergedData.forEach(range => {
   *   console.log(range.getA1Notation());
   * });
   * ```
   */
  getMergeData() {
    return this._worksheet.getMergeData().map((merge) => this._injector.createInstance(FRange, this._workbook, this._worksheet, merge));
  }
  /**
   * Get all merged cells in the current sheet
   * @returns {FRange[]} all merged cells
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Get all merged ranges in the sheet
   * const mergedRanges = fWorksheet.getMergedRanges();
   * // Process each merged range
   * mergedRanges.forEach(range => {
   *   console.log(range.getA1Notation());
   * });
   * ```
   */
  getMergedRanges() {
    const snapshot = this._worksheet.getSnapshot();
    return snapshot.mergeData.map((merge) => this._injector.createInstance(FRange, this._workbook, this._worksheet, merge));
  }
  /**
   * Get the merged cell data of the specified row and column.
   * @param {number} row - The row index
   * @param {number} column - The column index
   * @returns {FRange|undefined} The merged cell data, or undefined if the cell is not merged
   * @example
   * ```ts
   * const fWorkSheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * const merge = fWorkSheet.getCellMergeData(0, 0);
   * if (merge) {
   *   console.log('Merged range:', merge.getA1Notation());
   * }
   * ```
   */
  getCellMergeData(row, column) {
    const worksheet = this._worksheet;
    const mergeData = worksheet.getMergedCell(row, column);
    if (mergeData) {
      return this._injector.createInstance(FRange, this._workbook, this._worksheet, mergeData);
    }
  }
  // #endregion
  /**
   * Returns the selected range in the active sheet, or null if there is no active range.
   * @returns {FRange | null} the active range
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Get the currently active range
   * const activeRange = fWorksheet.getActiveRange();
   * if (activeRange) {
   *   console.log('Active range:', activeRange.getA1Notation());
   * }
   * ```
   */
  getActiveRange() {
    return this._fWorkbook.getActiveRange();
  }
  /**
   * Sets the active selection region for this sheet.
   * @param {FRange} range - The range to set as the active selection
   * @returns {FWorksheet} This sheet, for chaining
   * @example
   * ```ts
   * const fWorkSheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * fWorkSheet.setActiveRange(fWorkSheet.getRange('A10:B10'));
   * ```
   */
  setActiveRange(range) {
    const { unitId, sheetId } = range.getRange();
    if (unitId !== this._workbook.getUnitId() || sheetId !== this._worksheet.getSheetId()) {
      throw new Error("Specified range must be part of the sheet.");
    }
    this._fWorkbook.setActiveRange(range);
    return this;
  }
  /**
   * Returns the active cell in this sheet.
   * @returns {FRange | null} The active cell
   * @example
   * ```typescript
   * const fWorkSheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * console.log(fWorkSheet.getActiveCell().getA1Notation());
   * ```
   */
  getActiveCell() {
    return this._fWorkbook.getActiveCell();
  }
  /**
   * Sets the frozen state of the current sheet.
   * @param {IFreeze} freeze - the scrolling viewport start range and count of freezed rows and columns.
   * that means if you want to freeze the first 3 rows and 2 columns, you should set freeze as { startRow: 3, startColumn: 2, xSplit: 2, ySplit: 3 }
   * @returns {FWorksheet} This worksheet instance for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Freeze first 3 rows and 2 columns
   * fWorksheet.setFreeze({
   *   startRow: 3,
   *   startColumn: 2,
   *   xSplit: 2,
   *   ySplit: 3
   * });
   * ```
   */
  setFreeze(freeze) {
    this._commandService.syncExecuteCommand(SetFrozenCommand.id, {
      ...freeze,
      unitId: this._workbook.getUnitId(),
      subUnitId: this.getSheetId()
    });
    return this;
  }
  /**
   * Cancels the frozen state of the current sheet.
   * @returns {FWorksheet} This worksheet instance for chaining
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Cancel freeze
   * fWorksheet.cancelFreeze();
   * ```
   */
  cancelFreeze() {
    this._commandService.syncExecuteCommand(CancelFrozenCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this.getSheetId()
    });
    return this;
  }
  /**
   * Get the freeze state of the current sheet.
   * @returns {IFreeze} The freeze state of the current sheet
   * @example
   * ```typescript
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * // Get the freeze state of the current sheet
   * const freeze = fWorksheet.getFreeze();
   * console.log(freeze);
   * ```
   */
  getFreeze() {
    return this._worksheet.getFreeze();
  }
  setFrozenColumns(...args) {
    const freezeCfg = this.getFreeze();
    if (arguments.length === 1) {
      const columns = args[0];
      this.setFreeze({
        ...freezeCfg,
        startColumn: columns > 0 ? columns : -1,
        xSplit: columns
      });
    } else if (arguments.length === 2) {
      let [startColumn = 0, endColumn = 0] = args;
      if (startColumn > endColumn) {
        [startColumn, endColumn] = [endColumn, startColumn];
      }
      this._commandService.syncExecuteCommand(SetFrozenCommand.id, {
        startColumn: endColumn + 1,
        xSplit: endColumn - startColumn + 1,
        startRow: freezeCfg.startRow,
        ySplit: freezeCfg.ySplit,
        unitId: this._workbook.getUnitId(),
        subUnitId: this.getSheetId()
      });
    }
    return this;
  }
  setFrozenRows(...args) {
    const freezeCfg = this.getFreeze();
    if (arguments.length === 1) {
      const rows = args[0];
      this.setFreeze({
        ...freezeCfg,
        startRow: rows > 0 ? rows : -1,
        ySplit: rows
      });
    } else if (arguments.length === 2) {
      let [startRow = 0, endRow = 0] = args;
      if (startRow > endRow) {
        [startRow, endRow] = [endRow, startRow];
      }
      this._commandService.syncExecuteCommand(SetFrozenCommand.id, {
        startRow: endRow + 1,
        ySplit: endRow - startRow + 1,
        startColumn: freezeCfg.startColumn,
        xSplit: freezeCfg.xSplit,
        unitId: this._workbook.getUnitId(),
        subUnitId: this.getSheetId()
      });
    }
    return this;
  }
  /**
   * Get the number of frozen columns.
   * @returns {number} The number of frozen columns, returns 0 if no columns are frozen.
   * @example
   * ```typescript
   * const fWorkSheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * // Get the number of frozen columns
   * const frozenColumns = fWorkSheet.getFrozenColumns();
   * console.log(frozenColumns);
   * ```
   */
  getFrozenColumns() {
    const freeze = this.getFreeze();
    if (freeze.startColumn === -1) {
      return 0;
    }
    return freeze.startColumn;
  }
  /**
   * Get the number of frozen rows.
   * @returns {number} The number of frozen rows. returns 0 if no rows are frozen.
   * @example
   * ```typescript
   * const fWorkSheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * // Get the number of frozen rows
   * const frozenRows = fWorkSheet.getFrozenRows();
   * console.log(frozenRows);
   * ```
   */
  getFrozenRows() {
    const freeze = this.getFreeze();
    if (freeze.startRow === -1) {
      return 0;
    }
    return freeze.startRow;
  }
  /**
   * Get freezed rows.
   * @returns {IRowRange} The range of the frozen rows.
   * @example
   * ```ts
   * const fWorkSheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * // Get the range of the frozen rows
   * const frozenRows = fWorkSheet.getFrozenRowRange();
   * console.log(frozenRows);
   * ```
   */
  getFrozenRowRange() {
    const cfg = this._worksheet.getFreeze();
    return {
      startRow: cfg.startRow - cfg.ySplit,
      endRow: cfg.startRow - 1
    };
  }
  /**
   * Get freezed columns
   * @returns {IColumnRange} The range of the frozen columns.
   * @example
   * ```ts
   * const fWorkSheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * // Get the range of the frozen columns
   * const frozenColumns = fWorkSheet.getFrozenColumnRange();
   * console.log(frozenColumns);
   * ```
   */
  getFrozenColumnRange() {
    const cfg = this._worksheet.getFreeze();
    return {
      startColumn: cfg.startColumn - cfg.xSplit,
      endColumn: cfg.startColumn - 1
    };
  }
  /**
   * Returns true if the sheet's gridlines are hidden; otherwise returns false. Gridlines are visible by default.
   * @returns {boolean} True if the sheet's gridlines are hidden; otherwise false.
   * @example
   * ```ts
   * const fWorkSheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * // check if the gridlines are hidden
   * if (fWorkSheet.hasHiddenGridLines()) {
   *    console.log('Gridlines are hidden');
   * }
   * ```
   */
  hasHiddenGridLines() {
    return this._worksheet.getConfig().showGridlines === 0 /* FALSE */;
  }
  /**
   * Hides or reveals the sheet gridlines.
   * @param {boolean} hidden - If `true`, hide gridlines in this sheet; otherwise show the gridlines.
   * @returns {FWorksheet} Returns the current worksheet instance for method chaining
   * @example
   * ``` ts
   * const fWorkSheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * // hide the gridlines
   * fWorkSheet.setHiddenGridlines(true);
   * ```
   */
  setHiddenGridlines(hidden) {
    this._commandService.syncExecuteCommand(ToggleGridlinesCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      showGridlines: hidden ? 0 /* FALSE */ : 1 /* TRUE */
    });
    return this;
  }
  /**
   * Set the color of the gridlines in the sheet.
   * @param {string|undefined} color - The color to set for the gridlines.Undefined or null to reset to the default color.
   * @returns {FWorksheet} Returns the current worksheet instance for method chaining
   * @example
   * ```ts
   * const fWorkSheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * // set the gridlines color to red
   * fWorkSheet.setGridLinesColor('#ff0000');
   * ```
   */
  setGridLinesColor(color) {
    this._commandService.syncExecuteCommand(SetGridlinesColorCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      color
    });
    return this;
  }
  /**
   * Get the color of the gridlines in the sheet.
   * @returns {string | undefined} The color of the gridlines in the sheet or undefined. The default color is 'rgb(214, 216, 219)'.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * // get the gridlines color of the sheet
   * console.log(fWorkSheet.getGridLinesColor());
   * ```
   */
  getGridLinesColor() {
    return this._worksheet.getGridlinesColor();
  }
  /**
   * Sets the sheet tab color.
   * @param {string|null|undefined} color - A color code in CSS notation (like '#ffffff' or 'white'), or null to reset the tab color.
   * @returns {FWorksheet} Returns the current worksheet instance for method chaining
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * // set the tab color to red
   * fWorkSheet.setTabColor('#ff0000');
   * ```
   */
  setTabColor(color) {
    this._commandService.syncExecuteCommand(SetTabColorCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      value: color
    });
    return this;
  }
  /**
   * Get the tab color of the sheet.
   * @returns {string} The tab color of the sheet or undefined.
   * The default color is css style property 'unset'.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * // get the tab color of the sheet
   * console.log(fWorkSheet.getTabColor());
   * ```
   */
  getTabColor() {
    return this._worksheet.getTabColor();
  }
  /**
   * Hides this sheet. Has no effect if the sheet is already hidden. If this method is called on the only visible sheet, it throws an exception.
   * @returns {FWorksheet} Returns the current worksheet instance for method chaining
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * // hide the active sheet
   * fWorkSheet.hideSheet();
   * ```
   */
  hideSheet() {
    const commandService = this._injector.get(ICommandService);
    const workbook = this._workbook;
    const sheets = workbook.getSheets();
    const visibleSheets = sheets.filter((sheet) => sheet.isSheetHidden() !== 1 /* TRUE */);
    if (visibleSheets.length <= 1) {
      throw new Error("Cannot hide the only visible sheet");
    }
    commandService.syncExecuteCommand(SetWorksheetHideCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId()
    });
    return this;
  }
  /**
   * Shows this sheet. Has no effect if the sheet is already visible.
   * @returns {FWorksheet} Returns the current worksheet instance for method chaining
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheets = fWorkbook.getSheets();
   * // show the last sheet
   * fWorkSheets[fWorkSheets.length - 1].showSheet();
   * ```
   */
  showSheet() {
    const commandService = this._injector.get(ICommandService);
    commandService.syncExecuteCommand(SetWorksheetShowCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId()
    });
    return this;
  }
  /**
   * Returns true if the sheet is currently hidden.
   * @returns {boolean} True if the sheet is hidden; otherwise, false.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheets = fWorkbook.getSheets();
   * // check if the last sheet is hidden
   * console.log(fWorkSheets[fWorkSheets.length - 1].isSheetHidden());
   * ```
   */
  isSheetHidden() {
    return Boolean(this._worksheet.isSheetHidden() === 1 /* TRUE */);
  }
  /**
   * Sets the sheet name.
   * @param {string} name - The new name for the sheet.
   * @returns {FWorksheet} Returns the current worksheet instance for method chaining
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * // set the sheet name to 'Sheet1'
   * fWorkSheet.setName('NewSheet1');
   * ```
   */
  setName(name) {
    this._commandService.syncExecuteCommand(SetWorksheetNameCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      name
    });
    return this;
  }
  /**
   * Activates this sheet. Does not alter the sheet itself, only the parent's notion of the active sheet.
   * @returns {FWorksheet} Current sheet, for chaining.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheets = fWorkbook.getSheets();
   * // activate the last sheet
   * fWorkSheets[fWorkSheets.length - 1].activate();
   * ```
   */
  activate() {
    this._fWorkbook.setActiveSheet(this);
    return this;
  }
  /**
   * Gets the position of the sheet in its parent spreadsheet. Starts at 0.
   * @returns {number} The position of the sheet in its parent spreadsheet.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * // get the position of the active sheet
   * const position = fWorkSheet.getIndex();
   * console.log(position);
   * ```
   */
  getIndex() {
    return this._workbook.getSheetIndex(this._worksheet);
  }
  /**
   * Clears the sheet of content and formatting information.Or Optionally clears only the contents or only the formatting.
   * @param {IFacadeClearOptions} [options] - Options for clearing the sheet. If not provided, the contents and formatting are cleared both.
   * @param {boolean} [options.contentsOnly] - If true, the contents of the sheet are cleared. If false, the contents and formatting are cleared. Default is false.
   * @param {boolean} [options.formatOnly] - If true, the formatting of the sheet is cleared. If false, the contents and formatting are cleared. Default is false.
   * @returns {FWorksheet} Returns the current worksheet instance for method chaining
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * // clear the sheet of content and formatting information
   * fWorkSheet.clear();
   * // clear the sheet of content only
   * fWorkSheet.clear({ contentsOnly: true });
   * ```
   */
  clear(options) {
    if (options && options.contentsOnly && !options.formatOnly) {
      return this.clearContents();
    }
    if (options && options.formatOnly && !options.contentsOnly) {
      return this.clearFormats();
    }
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const commandService = this._injector.get(ICommandService);
    const range = {
      startRow: 0,
      endRow: this._worksheet.getRowCount() - 1,
      startColumn: 0,
      endColumn: this._worksheet.getColumnCount() - 1
    };
    commandService.syncExecuteCommand(ClearSelectionAllCommand.id, {
      unitId,
      subUnitId,
      ranges: [range],
      options
    });
    return this;
  }
  /**
   * Clears the sheet of contents, while preserving formatting information.
   * @returns {FWorksheet} Returns the current worksheet instance for method chaining
   * @example
   * ```typescript
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * // clear the sheet of content only
   * fWorkSheet.clearContents();
   * ```
   */
  clearContents() {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const commandService = this._injector.get(ICommandService);
    const range = {
      startRow: 0,
      endRow: this._worksheet.getRowCount() - 1,
      startColumn: 0,
      endColumn: this._worksheet.getColumnCount() - 1
    };
    commandService.syncExecuteCommand(ClearSelectionContentCommand.id, {
      unitId,
      subUnitId,
      ranges: [range]
    });
    return this;
  }
  /**
   * Clears the sheet of formatting, while preserving contents.
   * @returns {FWorksheet} Returns the current worksheet instance for method chaining
   * @example
   * ```typescript
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * // clear the sheet of formatting only
   * fWorkSheet.clearFormats();
   * ```
   */
  clearFormats() {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    const commandService = this._injector.get(ICommandService);
    const range = {
      startRow: 0,
      endRow: this._worksheet.getRowCount() - 1,
      startColumn: 0,
      endColumn: this._worksheet.getColumnCount() - 1
    };
    commandService.syncExecuteCommand(ClearSelectionFormatCommand.id, {
      unitId,
      subUnitId,
      ranges: [range]
    });
    return this;
  }
  /**
   * Returns a Range corresponding to the dimensions in which data is present.
   * Empty cells with style or formatting will also be included in the data range. If there is no data on the sheet, returns a Range corresponding to the top-left cell of the sheet (A1).
   * @returns {FRange} The range of the data in the sheet.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * // Assume the sheet is a empty sheet
   * const cellRange = fWorkSheet.getRange('J50');
   * cellRange.setValue('Hello World');
   * console.log(fWorkSheet.getDataRange().getA1Notation()); // A1:J50
   * ```
   */
  getDataRange() {
    const { startRow, endRow, startColumn, endColumn } = this._worksheet.getDataRealRange();
    return this.getRange(startRow, startColumn, endRow - startRow + 1, endColumn - startColumn + 1);
  }
  /**
   * Returns the column index of the last column that contains content.
   * @returns {number} the column index of the last column that contains content.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * // Assume the sheet is a empty sheet
   * const cellRange = fWorkSheet.getRange('J50');
   * cellRange.setValue('Hello World');
   * console.log(fWorkSheet.getLastColumn()); // 9
   * ```
   */
  getLastColumn() {
    return this._worksheet.getLastColumnWithContent();
  }
  /**
   * Returns the row index of the last row that contains content.
   * @returns {number} the row index of the last row that contains content.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * // Assume the sheet is a empty sheet
   * const cellRange = fWorkSheet.getRange('J50');
   * cellRange.setValue('Hello World');
   * console.log(fWorkSheet.getLastRow()); // 49
   * ```
   */
  getLastRow() {
    return this._worksheet.getLastRowWithContent();
  }
  /**
   * Judge whether provided FWorksheet is equal to current.
   * @param {FWorksheet} other - the FWorksheet to compare with.
   * @returns {boolean} true if the FWorksheet is equal to the current FWorksheet, false otherwise.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const sheets = fWorkbook.getSheets();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * console.log(fWorkSheet.equalTo(sheets[0])); // true, if the active sheet is the first sheet.
   * ```
   */
  equalTo(other) {
    if (other instanceof FWorksheet) {
      return this._worksheet.getSheetId() === other.getSheetId() && this._workbook.getUnitId() === other.getWorkbook().getUnitId();
    }
    return false;
  }
  /**
   * Insert a defined name for worksheet.
   * @param {string} name - The name of the defined name to insert
   * @param {string} formulaOrRefString - The formula(=sum(A2:b10)) or reference(A1) string of the defined name to insert
   * @example
   * ```ts
   * // The code below inserts a defined name
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * fWorksheet.insertDefinedName('MyDefinedName', 'Sheet1!$A$1');
   * ```
   */
  insertDefinedName(name, formulaOrRefString) {
    const definedNameBuilder = this._injector.createInstance(FDefinedNameBuilder, this._fWorkbook.getId());
    const definedNameParam = definedNameBuilder.setName(name).setRef(formulaOrRefString).setScopeToWorksheet(this).build();
    this._fWorkbook.insertDefinedNameBuilder(definedNameParam);
  }
  /**
   * Get all the defined names in the worksheet.
   * @returns {FDefinedName[]} All the defined names in the worksheet
   * @example
   * ```ts
   * // The code below gets all the defined names in the worksheet
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const definedNames = fWorksheet.getDefinedNames();
   * console.log(definedNames, definedNames[0]?.getFormulaOrRefString());
   * ```
   */
  getDefinedNames() {
    const names = this._fWorkbook.getDefinedNames();
    return names.filter((name) => name.getLocalSheetId() === this.getSheetId());
  }
  /**
   * Set custom metadata of worksheet
   * @param {CustomData | undefined} custom - custom metadata
   * @returns {FWorksheet} Current worksheet, for chaining.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * fWorkSheet.setCustomMetadata({ key: 'value' });
   * ```
   */
  setCustomMetadata(custom) {
    this._worksheet.setCustomMetadata(custom);
    return this;
  }
  /**
   * Get custom metadata of worksheet
   * @returns {CustomData | undefined} custom metadata
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * const custom = fWorkSheet.getCustomMetadata();
   * console.log(custom);
   * ```
   */
  getCustomMetadata() {
    return this._worksheet.getCustomMetadata();
  }
  /**
   * Set custom metadata of row
   * @param {number} index - row index
   * @param {CustomData | undefined} custom - custom metadata
   * @returns {FWorksheet} Current worksheet, for chaining.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * fWorkSheet.setRowCustomMetadata(0, { key: 'value' });
   * ```
   */
  setRowCustomMetadata(index, custom) {
    this._worksheet.getRowManager().setCustomMetadata(index, custom);
    return this;
  }
  /**
   * Set custom metadata of column
   * @param {number} index - column index
   * @param {CustomData | undefined} custom - custom metadata
   * @returns {FWorksheet} Current worksheet, for chaining.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * fWorkSheet.setColumnCustomMetadata(0, { key: 'value' });
   * ```
   */
  setColumnCustomMetadata(index, custom) {
    this._worksheet.getColumnManager().setCustomMetadata(index, custom);
    return this;
  }
  /**
   * Get custom metadata of row
   * @param {number} index - row index
   * @returns {CustomData | undefined} custom metadata
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * const custom = fWorkSheet.getRowCustomMetadata(0);
   * console.log(custom);
   * ```
   */
  getRowCustomMetadata(index) {
    return this._worksheet.getRowManager().getCustomMetadata(index);
  }
  /**
   * Get custom metadata of column
   * @param {number} index - column index
   * @returns {CustomData | undefined} custom metadata
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * const custom = fWorkSheet.getColumnCustomMetadata(0);
   * console.log(custom);
   * ```
   */
  getColumnCustomMetadata(index) {
    return this._worksheet.getColumnManager().getCustomMetadata(index);
  }
  /**
   * Appends a row to the bottom of the current data region in the sheet. If a cell's content begins with =, it's interpreted as a formula.
   * @param {CellValue[]} rowContents - An array of values for the new row.
   * @returns {FWorksheet} Returns the current worksheet instance for method chaining.
   * @example
   * ```ts
   * // Appends a new row with 4 columns to the bottom of the current
   * // data region in the sheet containing the values in the array.
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * fWorkSheet.appendRow([1, 'Hello Univer', true, '=A1']);
   * ```
   */
  appendRow(rowContents) {
    const hasValue = this._worksheet.getCellMatrix().hasValue();
    const lastRow = this._worksheet.getLastRowWithContent();
    const maxRows = this._worksheet.getRowCount();
    const maxColumns = this._worksheet.getColumnCount();
    const row = hasValue ? lastRow + 1 : lastRow;
    const cellMatrix = new ObjectMatrix();
    for (let c = 0; c < rowContents.length; c++) {
      cellMatrix.setValue(row, c, covertCellValue(rowContents[c]));
    }
    this._commandService.syncExecuteCommand(AppendRowCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      cellValue: cellMatrix.getMatrix(),
      insertRowNums: row > maxRows - 1 ? 1 : 0,
      insertColumnNums: rowContents.length > maxColumns ? rowContents.length - maxColumns : 0,
      maxRows,
      maxColumns
    });
    return this;
  }
  /**
   * Sets the number of rows in the worksheet.
   * @param {number} rowCount - The number of rows to set.
   * @returns {FWorksheet} Returns the current worksheet instance for method chaining.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   *
   * // Set the number of rows in the worksheet to 40
   * fWorkSheet.setRowCount(40);
   * ```
   */
  setRowCount(rowCount) {
    this._commandService.syncExecuteCommand(SetWorksheetRowCountCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      rowCount
    });
    return this;
  }
  /**
   * Sets the number of columns in the worksheet.
   * @param {number} columnCount - The number of columns to set.
   * @returns {FWorksheet} Returns the current worksheet instance for method chaining.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   *
   * // Set the number of columns in the worksheet to 10
   * fWorkSheet.setColumnCount(10);
   * ```
   */
  setColumnCount(columnCount) {
    this._commandService.syncExecuteCommand(SetWorksheetColumnCountCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      columnCount
    });
    return this;
  }
  /**
   * Get the WorksheetPermission instance for managing worksheet-level permissions.
   * This is the new permission API that provides worksheet-specific permission control.
   * @returns {FWorksheetPermission} - The WorksheetPermission instance.
   * @example
   * ```ts
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const permission = fWorksheet.getWorksheetPermission();
   *
   * // Set worksheet to read-only mode
   * await permission.setMode('readOnly');
   *
   * // Check if a specific cell can be edited
   * const canEdit = permission.canEditCell(0, 0);
   *
   * // Protect multiple ranges at once
   * const range1 = fWorksheet.getRange('A1:B10');
   * const range2 = fWorksheet.getRange('D1:E10');
   * await permission.protectRanges([
   *   { ranges: [range1], options: { name: 'Range 1', allowEdit: false } },
   *   { ranges: [range2], options: { name: 'Range 2', allowEdit: false } }
   * ]);
   *
   * // Subscribe to permission changes
   * permission.permission$.subscribe(snapshot => {
   *   console.log('Worksheet permissions changed:', snapshot);
   * });
   * ```
   */
  getWorksheetPermission() {
    return this._injector.createInstance(
      FWorksheetPermission,
      this
    );
  }
};
FWorksheet = __decorateClass([
  __decorateParam(3, Inject(Injector)),
  __decorateParam(4, Inject(SheetsSelectionsService)),
  __decorateParam(5, Inject(ILogService)),
  __decorateParam(6, ICommandService)
], FWorksheet);

// ../packages/sheets/src/facade/permission/f-range-permission.ts
var FRangePermission = class extends FBase {
  constructor(_unitId, _subUnitId, _range, _worksheet, _injector, _authzIoService, _commandService, _rangeProtectionRuleModel) {
    super();
    __publicField(this, "_unitId", _unitId);
    __publicField(this, "_subUnitId", _subUnitId);
    __publicField(this, "_range", _range);
    __publicField(this, "_worksheet", _worksheet);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_authzIoService", _authzIoService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_rangeProtectionRuleModel", _rangeProtectionRuleModel);
  }
  /**
   * Check if the current range is protected.
   * @returns {boolean} True if the range is protected, false otherwise.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * // Check if the A1:B2 range is protected
   * const isProtected = fRange.getRangePermission().isProtected();
   * console.log(isProtected);
   * ```
   */
  isProtected() {
    const rules = this._rangeProtectionRuleModel.getSubunitRuleList(this._unitId, this._subUnitId);
    const matchingRules = rules.filter(
      (rule) => rule.ranges.some((ruleRange) => Rectangle.intersects(ruleRange, this._range.getRange()))
    );
    return matchingRules.length > 0;
  }
  /**
   * Protect the current range.
   * @param {IRangeProtectionOptions} options Protection options.
   * @returns {Promise<FRangeProtectionRule>} The created protection rule.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * const rule = await fRange.getRangePermission().protect({
   *   name: 'My protected range',
   *   allowedUsers: ['user1', 'user2'],
   *   allowViewByOthers: false,
   * });
   * console.log(rule);
   * ```
   */
  async protect(options) {
    if (this.isProtected()) {
      throw new Error("Range is already protected");
    }
    const editState = determineEditState(options == null ? void 0 : options.allowedUsers);
    const viewState = determineViewState(options == null ? void 0 : options.allowViewByOthers);
    const scope = determineScope(editState, viewState);
    const collaborators = [];
    if (editState === "designedUserCanEdit" /* DesignedUserCanEdit */) {
      const existingCollaborators = await this._authzIoService.listCollaborators({
        objectID: this._unitId,
        unitID: this._unitId
      });
      options.allowedUsers.forEach((userId) => {
        const existingCollaborator = existingCollaborators.find((c) => {
          var _a;
          return ((_a = c.subject) == null ? void 0 : _a.userID) === userId || c.id === userId;
        });
        if (!existingCollaborator) {
          console.error(`User ${userId} not found in existing collaborators`);
          return;
        }
        collaborators.push({
          id: existingCollaborator.id,
          role: 1 /* Editor */,
          subject: existingCollaborator.subject
        });
      });
    }
    const permissionId = await this._authzIoService.create({
      objectType: 3 /* SelectRange */,
      selectRangeObject: {
        collaborators,
        unitID: this._unitId,
        name: (options == null ? void 0 : options.name) || "",
        scope
      }
    });
    const ruleId = `ruleId_${generateRandomId(6)}`;
    const result = this._commandService.syncExecuteCommand(AddRangeProtectionMutation.id, {
      unitId: this._unitId,
      subUnitId: this._subUnitId,
      rules: [{
        ranges: [this._range.getRange()],
        permissionId,
        id: ruleId,
        description: options == null ? void 0 : options.name,
        unitType: 3 /* SelectRange */,
        unitId: this._unitId,
        subUnitId: this._subUnitId,
        viewState,
        editState
      }]
    });
    if (!result) {
      throw new Error("Failed to add range protection");
    }
    const rule = this._injector.createInstance(
      FRangeProtectionRule,
      this._unitId,
      this._subUnitId,
      ruleId,
      permissionId,
      [this._range],
      options || {}
    );
    return rule;
  }
  /**
   * Cancel all protection rules that intersect with the current range.
   * @returns {Promise<boolean>} True if all rules were successfully removed, false otherwise.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * const result = await fRange.getRangePermission().unprotect();
   * console.log(result);
   * ```
   */
  async unprotect() {
    const rules = await this.listRules({ ignoreCollaborators: true });
    if (rules.length === 0) return true;
    const results = await Promise.all(rules.map((rule) => rule.remove()));
    for (const result of results) {
      if (!result) {
        console.error("Failed to remove some range protection rules");
        return false;
      }
    }
    return true;
  }
  /**
   * List all protection rules that intersect with the current range.
   * @returns {Promise<FRangeProtectionRule[]>} Array of protection rules.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * const rules = await fRange.getRangePermission().listRules();
   * console.log(rules);
   * ```
   */
  async listRules(options) {
    return getListRangeProtectionRules(
      this._injector,
      this._unitId,
      this._subUnitId,
      {
        worksheet: this._worksheet,
        specificRange: this._range,
        ignoreCollaborators: options == null ? void 0 : options.ignoreCollaborators
      }
    );
  }
};
FRangePermission = __decorateClass([
  __decorateParam(4, Inject(Injector)),
  __decorateParam(5, Inject(IAuthzIoService)),
  __decorateParam(6, Inject(ICommandService)),
  __decorateParam(7, Inject(RangeProtectionRuleModel))
], FRangePermission);

// ../packages/sheets/src/facade/f-range.ts
var FRange = class extends FBaseInitialable {
  constructor(_workbook, _worksheet, _range, _injector, _commandService, _formulaDataModel) {
    super(_injector);
    __publicField(this, "_workbook", _workbook);
    __publicField(this, "_worksheet", _worksheet);
    __publicField(this, "_range", _range);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_formulaDataModel", _formulaDataModel);
    const maxRows = this._worksheet.getRowCount();
    const maxColumns = this._worksheet.getColumnCount();
    if (this._range.startRow < 0 || this._range.startColumn < 0 || this._range.endRow >= maxRows || this._range.endColumn >= maxColumns) {
      throw new Error(`Range is out of bounds. Max rows: ${maxRows}, Max columns: ${maxColumns}, Given range: ${JSON.stringify(this._range)}`);
    }
    this._runInitializers(
      this._injector,
      this._workbook,
      this._worksheet,
      this._range,
      this._commandService,
      this._formulaDataModel
    );
  }
  /**
   * Get the unit ID of the current workbook
   * @returns {string} The unit ID of the workbook
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getUnitId());
   * ```
   */
  getUnitId() {
    return this._workbook.getUnitId();
  }
  /**
   * Gets the name of the worksheet
   * @returns {string} The name of the worksheet
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getSheetName());
   * ```
   */
  getSheetName() {
    return this._worksheet.getName();
  }
  /**
   * Gets the ID of the worksheet
   * @returns {string} The ID of the worksheet
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getSheetId());
   * ```
   */
  getSheetId() {
    return this._worksheet.getSheetId();
  }
  /**
   * Gets the area where the statement is applied
   * @returns {IRange} The area where the statement is applied
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * const range = fRange.getRange();
   * const { startRow, startColumn, endRow, endColumn } = range;
   * console.log(range);
   * ```
   */
  getRange() {
    return this._range;
  }
  /**
   * Gets the starting row index of the range. index starts at 0.
   * @returns {number} The starting row index of the range.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getRow()); // 0
   * ```
   */
  getRow() {
    return this._range.startRow;
  }
  /**
   * Gets the ending row index of the range. index starts at 0.
   * @returns {number} The ending row index of the range.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getLastRow()); // 1
   * ```
   */
  getLastRow() {
    return this._range.endRow;
  }
  /**
   * Gets the starting column index of the range. index starts at 0.
   * @returns {number} The starting column index of the range.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getColumn()); // 0
   * ```
   */
  getColumn() {
    return this._range.startColumn;
  }
  /**
   * Gets the ending column index of the range. index starts at 0.
   * @returns {number} The ending column index of the range.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getLastColumn()); // 1
   * ```
   */
  getLastColumn() {
    return this._range.endColumn;
  }
  /**
   * Gets the width of the applied area
   * @returns {number} The width of the area
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getWidth());
   * ```
   */
  getWidth() {
    return this._range.endColumn - this._range.startColumn + 1;
  }
  /**
   * Gets the height of the applied area
   * @returns {number} The height of the area
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getHeight());
   * ```
   */
  getHeight() {
    return this._range.endRow - this._range.startRow + 1;
  }
  /**
   * Return range whether this range is merged
   * @returns {boolean} if true is merged
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.isMerged());
   * // merge cells A1:B2
   * fRange.merge();
   * console.log(fRange.isMerged());
   * ```
   */
  isMerged() {
    const { startColumn, startRow, endColumn, endRow } = this._range;
    const mergedCells = this._worksheet.getMergedCellRange(startRow, startColumn, endRow, endColumn);
    return mergedCells.some((range) => Rectangle.equals(range, this._range));
  }
  /**
   * Return first cell style data in this range. Please note that if there are row styles, col styles and (or)
   * worksheet style, they will be merged into the cell style. You can use `type` to specify the type of the style to get.
   *
   * @param {GetStyleType} type - The type of the style to get. 'row' means get the composed style of row, col and
   * default worksheet style. 'col' means get the composed style of col, row and default worksheet style.
   * 'cell' means get the style of cell without merging row style, col style and default worksheet style.
   * Default is 'row'.
   *
   * @returns {IStyleData | null} The cell style data
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getCellStyleData());
   * ```
   */
  getCellStyleData(type = "row") {
    if (type !== "cell") {
      return this._worksheet.getComposedCellStyle(this._range.startRow, this._range.startColumn, type === "row");
    }
    return this._worksheet.getCellStyle(this._range.startRow, this._range.startColumn);
  }
  /**
   * Get the font family of the cell.
   *
   * @param {GetStyleType} type - The type of the style to get. 'row' means get the composed style of row, col and
   * default worksheet style. 'col' means get the composed style of col, row and default worksheet style.
   * 'cell' means get the style of cell without merging row style, col style and default worksheet style.
   * Default is 'row'.
   *
   * @returns {string | null} The font family of the cell
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getFontFamily());
   * ```
   */
  getFontFamily(type = "row") {
    var _a, _b;
    return (_b = (_a = this.getCellStyleData(type)) == null ? void 0 : _a.ff) != null ? _b : null;
  }
  /**
   * Get the font size of the cell.
   *
   * @param {GetStyleType} type - The type of the style to get. 'row' means get the composed style of row, col and
   * default worksheet style. 'col' means get the composed style of col, row and default worksheet style.
   * 'cell' means get the style of cell without merging row style, col style and default worksheet style.
   * Default is 'row'.
   *
   * @returns {number | null} The font size of the cell
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getFontSize());
   * ```
   */
  getFontSize(type = "row") {
    var _a, _b;
    return (_b = (_a = this.getCellStyleData(type)) == null ? void 0 : _a.fs) != null ? _b : null;
  }
  /**
   * Return first cell style in this range.
   *
   * @param {GetStyleType} type - The type of the style to get. 'row' means get the composed style of row, col and
   * default worksheet style. 'col' means get the composed style of col, row and default worksheet style.
   * 'cell' means get the style of cell without merging row style, col style and default worksheet style.
   * Default is 'row'.
   *
   * @returns {TextStyleValue | null} The cell style
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getCellStyle());
   * ```
   */
  getCellStyle(type = "row") {
    const data = this.getCellStyleData(type);
    return data ? TextStyleValue.create(data) : null;
  }
  /**
   * Returns the cell styles for the cells in the range.
   *
   * @param {GetStyleType} type - The type of the style to get. 'row' means get the composed style of row, col and
   * default worksheet style. 'col' means get the composed style of col, row and default worksheet style.
   * 'cell' means get the style of cell without merging row style, col style and default worksheet style.
   * Default is 'row'.
   *
   * @returns {Array<Array<TextStyleValue | null>>} A two-dimensional array of cell styles.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getCellStyles());
   * ```
   */
  getCellStyles(type = "row") {
    const cells = this.getCellDatas();
    return cells.map((row, rowIndex) => row.map((cell, colIndex) => {
      if (!cell) return null;
      const style = type !== "cell" ? this._worksheet.getComposedCellStyle(rowIndex + this._range.startRow, colIndex + this._range.startColumn, type === "row") : this._worksheet.getCellStyle(rowIndex + this._range.startRow, colIndex + this._range.startColumn);
      return style ? TextStyleValue.create(style) : null;
    }));
  }
  getValue(includeRichText) {
    var _a, _b;
    if (includeRichText) {
      return this.getValueAndRichTextValue();
    }
    return (_b = (_a = this._worksheet.getCell(this._range.startRow, this._range.startColumn)) == null ? void 0 : _a.v) != null ? _b : null;
  }
  /**
   * Returns the raw value of the top-left cell in the range. Empty cells return `null`.
   * @returns {Nullable<CellValue>} The raw value of the cell. Returns `null` if the cell is empty.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setValueForCell({
   *   v: 0.2,
   *   s: {
   *     n: {
   *       pattern: '0%',
   *     },
   *   },
   * });
   * console.log(fRange.getRawValue()); // 0.2
   * ```
   */
  getRawValue() {
    var _a, _b;
    const cell = this._worksheet.getCellMatrix().getValue(this._range.startRow, this._range.startColumn);
    if ((cell == null ? void 0 : cell.p) && ((_a = cell.p.body) == null ? void 0 : _a.dataStream)) return cell.p.body.dataStream;
    return (_b = cell == null ? void 0 : cell.v) != null ? _b : null;
  }
  /**
   * Returns the displayed value of the top-left cell in the range. The value is a String. Empty cells return an empty string.
   * @returns {string} The displayed value of the cell. Returns an empty string if the cell is empty.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setValueForCell({
   *   v: 0.2,
   *   s: {
   *     n: {
   *       pattern: '0%',
   *     },
   *   },
   * });
   * console.log(fRange.getDisplayValue()); // 20%
   * ```
   */
  getDisplayValue() {
    var _a, _b, _c;
    const cell = this._worksheet.getCell(this._range.startRow, this._range.startColumn);
    if ((cell == null ? void 0 : cell.p) && ((_a = cell.p.body) == null ? void 0 : _a.dataStream)) return cell.p.body.dataStream;
    return (_c = (_b = cell == null ? void 0 : cell.v) == null ? void 0 : _b.toString()) != null ? _c : "";
  }
  getValues(includeRichText) {
    var _a, _b;
    if (includeRichText) {
      return this.getValueAndRichTextValues();
    }
    const { startRow, endRow, startColumn, endColumn } = this._range;
    const range = [];
    for (let r = startRow; r <= endRow; r++) {
      const row = [];
      for (let c = startColumn; c <= endColumn; c++) {
        row.push((_b = (_a = this._worksheet.getCell(r, c)) == null ? void 0 : _a.v) != null ? _b : null);
      }
      range.push(row);
    }
    return range;
  }
  /**
   * Returns a two-dimensional array of the range raw values. Empty cells return `null`.
   * @returns {Array<Array<Nullable<CellValue>>>} The raw value of the cell. Returns `null` if the cell is empty.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setValues([
   *   [
   *     {
   *       v: 0.2,
   *       s: {
   *         n: {
   *           pattern: '0%',
   *         },
   *       },
   *     },
   *     {
   *       v: 45658,
   *       s: {
   *         n: {
   *           pattern: 'yyyy-mm-dd',
   *         },
   *       },
   *     }
   *   ],
   *   [
   *     {
   *       v: 1234.567,
   *       s: {
   *         n: {
   *           pattern: '#,##0.00',
   *         }
   *       }
   *     },
   *     null,
   *   ],
   * ]);
   * console.log(fRange.getRawValues()); // [[0.2, 45658], [1234.567, null]]
   * ```
   */
  getRawValues() {
    var _a, _b;
    const cellMatrix = this._worksheet.getCellMatrix();
    const { startRow, endRow, startColumn, endColumn } = this._range;
    const values = [];
    for (let r = startRow; r <= endRow; r++) {
      const row = [];
      for (let c = startColumn; c <= endColumn; c++) {
        const cell = cellMatrix.getValue(r, c);
        if ((cell == null ? void 0 : cell.p) && ((_a = cell.p.body) == null ? void 0 : _a.dataStream)) {
          row.push(cell.p.body.dataStream);
        } else {
          row.push((_b = cell == null ? void 0 : cell.v) != null ? _b : null);
        }
      }
      values.push(row);
    }
    return values;
  }
  /**
   * Returns a two-dimensional array of the range displayed values. Empty cells return an empty string.
   * @returns {string[][]} A two-dimensional array of values.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setValues([
   *   [
   *     {
   *       v: 0.2,
   *       s: {
   *         n: {
   *           pattern: '0%',
   *         },
   *       },
   *     },
   *     {
   *       v: 45658,
   *       s: {
   *         n: {
   *           pattern: 'yyyy-mm-dd',
   *         },
   *       },
   *     }
   *   ],
   *   [
   *     {
   *       v: 1234.567,
   *       s: {
   *         n: {
   *           pattern: '#,##0.00',
   *         }
   *       }
   *     },
   *     null,
   *   ],
   * ]);
   * console.log(fRange.getDisplayValues()); // [['20%', '2025-01-01'], ['1,234.57', '']]
   * ```
   */
  getDisplayValues() {
    var _a, _b, _c;
    const { startRow, endRow, startColumn, endColumn } = this._range;
    const values = [];
    for (let r = startRow; r <= endRow; r++) {
      const row = [];
      for (let c = startColumn; c <= endColumn; c++) {
        const cell = this._worksheet.getCell(r, c);
        if ((cell == null ? void 0 : cell.p) && ((_a = cell.p.body) == null ? void 0 : _a.dataStream)) {
          row.push(cell.p.body.dataStream);
        } else {
          row.push((_c = (_b = cell == null ? void 0 : cell.v) == null ? void 0 : _b.toString()) != null ? _c : "");
        }
      }
      values.push(row);
    }
    return values;
  }
  /**
   * Return first cell model data in this range
   * @returns {ICellData | null} The cell model data
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getCellData());
   * ```
   */
  getCellData() {
    var _a;
    return (_a = this._worksheet.getCell(this._range.startRow, this._range.startColumn)) != null ? _a : null;
  }
  /**
   * Alias for getCellDataGrid.
   * @returns {Nullable<ICellData>[][]} A two-dimensional array of cell data.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getCellDatas());
   * ```
   */
  getCellDatas() {
    return this.getCellDataGrid();
  }
  /**
   * Returns the cell data for the cells in the range.
   * @returns {Nullable<ICellData>[][]} A two-dimensional array of cell data.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getCellDataGrid());
   * ```
   */
  getCellDataGrid() {
    const { startRow, endRow, startColumn, endColumn } = this._range;
    const range = [];
    for (let r = startRow; r <= endRow; r++) {
      const row = [];
      for (let c = startColumn; c <= endColumn; c++) {
        row.push(this._worksheet.getCellRaw(r, c));
      }
      range.push(row);
    }
    return range;
  }
  /**
   * Returns the rich text value for the cell at the start of this range.
   * @returns {Nullable<RichTextValue>} The rich text value
   * @internal
   * @beta
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getRichTextValue());
   * ```
   */
  getRichTextValue() {
    const data = this.getCellData();
    if (data == null ? void 0 : data.p) {
      return new RichTextValue(data.p);
    }
    return null;
  }
  /**
   * Returns the rich text value for the cells in the range.
   * @returns {Nullable<RichTextValue>[][]} A two-dimensional array of RichTextValue objects.
   * @internal
   * @beta
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getRichTextValues());
   * ```
   */
  getRichTextValues() {
    const dataGrid = this.getCellDataGrid();
    return dataGrid.map((row) => row.map((data) => (data == null ? void 0 : data.p) ? new RichTextValue(data.p) : null));
  }
  /**
   * Returns the value and rich text value for the cell at the start of this range.
   * @returns {Nullable<CellValue | RichTextValue>} The value and rich text value
   * @internal
   * @beta
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getValueAndRichTextValue());
   * ```
   */
  getValueAndRichTextValue() {
    const cell = this.getCellData();
    return (cell == null ? void 0 : cell.p) ? new RichTextValue(cell.p) : cell == null ? void 0 : cell.v;
  }
  /**
   * Returns the value and rich text value for the cells in the range.
   * @returns {Nullable<CellValue | RichTextValue>[][]} A two-dimensional array of value and rich text value
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getValueAndRichTextValues());
   * ```
   */
  getValueAndRichTextValues() {
    const dataGrid = this.getCellDatas();
    return dataGrid.map((row) => row.map((data) => (data == null ? void 0 : data.p) ? new RichTextValue(data.p) : data == null ? void 0 : data.v));
  }
  /**
   * Returns the formula (A1 notation) of the top-left cell in the range, or an empty string if the cell is empty or doesn't contain a formula.
   * @returns {string} The formula for the cell.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getFormula());
   * ```
   */
  getFormula() {
    var _a;
    return (_a = this._formulaDataModel.getFormulaStringByCell(
      this._range.startRow,
      this._range.startColumn,
      this._worksheet.getSheetId(),
      this._workbook.getUnitId()
    )) != null ? _a : "";
  }
  /**
   * Returns the formulas (A1 notation) for the cells in the range. Entries in the 2D array are empty strings for cells with no formula.
   * @returns {string[][]} A two-dimensional array of formulas in string format.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getFormulas());
   * ```
   */
  getFormulas() {
    const formulas = [];
    const { startRow, endRow, startColumn, endColumn } = this._range;
    const sheetId = this._worksheet.getSheetId();
    const unitId = this._workbook.getUnitId();
    for (let row = startRow; row <= endRow; row++) {
      const rowFormulas = [];
      for (let col = startColumn; col <= endColumn; col++) {
        const formulaString = this._formulaDataModel.getFormulaStringByCell(row, col, sheetId, unitId);
        rowFormulas.push(formulaString || "");
      }
      formulas.push(rowFormulas);
    }
    return formulas;
  }
  /**
   * Gets whether text wrapping is enabled for top-left cell in the range.
   * @returns {boolean} whether text wrapping is enabled for the cell.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getWrap());
   * ```
   */
  getWrap() {
    return this._worksheet.getRange(this._range).getWrap() === 1 /* TRUE */;
  }
  /**
   * Gets whether text wrapping is enabled for cells in the range.
   * @returns {boolean[][]} A two-dimensional array of whether text wrapping is enabled for each cell in the range.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getWraps());
   */
  getWraps() {
    const cells = this.getCellDatas();
    const styles = this._workbook.getStyles();
    return cells.map((row) => row.map((cell) => {
      var _a;
      return ((_a = styles.getStyleByCell(cell)) == null ? void 0 : _a.tb) === 3 /* WRAP */;
    }));
  }
  /**
   * Returns the text wrapping strategy for the top left cell of the range.
   * @returns {WrapStrategy} The text wrapping strategy
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getWrapStrategy());
   * ```
   */
  getWrapStrategy() {
    return this._worksheet.getRange(this._range).getWrapStrategy();
  }
  /**
   * Returns the horizontal alignment of the text (left/center/right) of the top-left cell in the range.
   * @returns {string} The horizontal alignment of the text in the cell.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getHorizontalAlignment());
   * ```
   */
  getHorizontalAlignment() {
    const coreHorizontalAlignment = this._worksheet.getRange(this._range).getHorizontalAlignment();
    return transformCoreHorizontalAlignment(coreHorizontalAlignment);
  }
  /**
   * Returns the horizontal alignments of the cells in the range.
   * @returns {string[][]} A two-dimensional array of horizontal alignments of text associated with cells in the range.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getHorizontalAlignments());
   * ```
   */
  getHorizontalAlignments() {
    const coreHorizontalAlignments = this._worksheet.getRange(this._range).getHorizontalAlignments();
    return coreHorizontalAlignments.map((row) => row.map((alignment) => transformCoreHorizontalAlignment(alignment)));
  }
  /**
   * Returns the vertical alignment (top/middle/bottom) of the top-left cell in the range.
   * @returns {string} The vertical alignment of the text in the cell.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getVerticalAlignment());
   * ```
   */
  getVerticalAlignment() {
    return transformCoreVerticalAlignment(this._worksheet.getRange(this._range).getVerticalAlignment());
  }
  /**
   * Returns the vertical alignments of the cells in the range.
   * @returns {string[][]} A two-dimensional array of vertical alignments of text associated with cells in the range.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getVerticalAlignments());
   * ```
   */
  getVerticalAlignments() {
    const coreVerticalAlignments = this._worksheet.getRange(this._range).getVerticalAlignments();
    return coreVerticalAlignments.map((row) => row.map((alignment) => transformCoreVerticalAlignment(alignment)));
  }
  /**
   * Set custom meta data for first cell in current range.
   * @param {CustomData} data The custom meta data
   * @returns {FRange} This range, for chaining
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setCustomMetaData({ key: 'value' });
   * console.log(fRange.getCustomMetaData());
   * ```
   */
  setCustomMetaData(data) {
    const params = {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: this._range,
      customMetadata: {
        custom: data
      }
    };
    this._commandService.syncExecuteCommand(SetRangeCustomMetadataCommand.id, params);
    return this;
  }
  /**
   * Set custom meta data for current range.
   * @param {CustomData[][]} datas The custom meta data
   * @returns {FRange} This range, for chaining
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setCustomMetaDatas([
   *   [{ key: 'value' }, { key: 'value2' }],
   *   [{ key: 'value3' }, { key: 'value4' }],
   * ]);
   * console.log(fRange.getCustomMetaDatas());
   * ```
   */
  setCustomMetaDatas(datas) {
    const params = {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: this._range,
      customMetadata: datas.map((row) => row.map((data) => ({ custom: data })))
    };
    this._commandService.syncExecuteCommand(SetRangeCustomMetadataCommand.id, params);
    return this;
  }
  /**
   * Returns the custom meta data for the cell at the start of this range.
   * @returns {CustomData | null} The custom meta data
   * @example
   * ```
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getCustomMetaData());
   * ```
   */
  getCustomMetaData() {
    var _a;
    const cell = this.getCellData();
    return (_a = cell == null ? void 0 : cell.custom) != null ? _a : null;
  }
  /**
   * Returns the custom meta data for the cells in the range.
   * @returns {CustomData[][]} A two-dimensional array of custom meta data
   * @example
   * ```
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getCustomMetaDatas());
   * ```
   */
  getCustomMetaDatas() {
    const dataGrid = this.getCellDataGrid();
    return dataGrid.map((row) => row.map((data) => {
      var _a;
      return (_a = data == null ? void 0 : data.custom) != null ? _a : null;
    }));
  }
  /**
   * Sets basic border properties for the current range.
   * @param {BorderType} type The type of border to apply
   * @param {BorderStyleTypes} style The border style
   * @param {string} [color] Optional border color in CSS notation
   * @returns {FRange} This range, for chaining
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setBorder(univerAPI.Enum.BorderType.ALL, univerAPI.Enum.BorderStyleTypes.THIN, '#ff0000');
   * ```
   */
  setBorder(type, style, color) {
    this._commandService.syncExecuteCommand(SetBorderBasicCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      ranges: [this._range],
      value: {
        type,
        style,
        color
      }
    });
    return this;
  }
  // #region editing
  /**
   * Returns the background color of the top-left cell in the range.
   * @returns {string} The color code of the background.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getBackground());
   * ```
   */
  getBackground() {
    var _a, _b;
    const style = this.getCellStyle();
    return (_b = (_a = style == null ? void 0 : style.background) == null ? void 0 : _a.rgb) != null ? _b : DEFAULT_STYLES.bg.rgb;
  }
  /**
   * Returns the background colors of the cells in the range.
   * @returns {string[][]} A two-dimensional array of color codes of the backgrounds.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getBackgrounds());
   * ```
   */
  getBackgrounds() {
    const styles = this.getCellStyles();
    return styles.map((row) => row.map((style) => {
      var _a, _b;
      return (_b = (_a = style == null ? void 0 : style.background) == null ? void 0 : _a.rgb) != null ? _b : DEFAULT_STYLES.bg.rgb;
    }));
  }
  /**
   * Set background color for current range.
   * @param {string} color The background color
   * @returns {FRange} This range, for chaining
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setBackgroundColor('red');
   * ```
   */
  setBackgroundColor(color) {
    this._commandService.syncExecuteCommand(SetStyleCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: this._range,
      style: {
        type: "bg",
        value: {
          rgb: color
        }
      }
    });
    return this;
  }
  /**
   * Set background color for current range.
   * @param {string} color The background color
   * @returns {FRange} This range, for chaining
   * @example
   * ```typescript
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setBackground('red');
   * ```
   */
  setBackground(color) {
    this.setBackgroundColor(color);
    return this;
  }
  /**
   * Set rotation for text in current range.
   * @param {number} rotation - The rotation angle in degrees
   * @returns This range, for chaining
   * @example
   * ```typescript
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setTextRotation(45);
   * ```
   */
  setTextRotation(rotation) {
    this._commandService.syncExecuteCommand(SetTextRotationCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: this._range,
      value: rotation
    });
    return this;
  }
  /**
   * Sets the value of the range.
   * @param {CellValue | ICellData} value The value can be a number, string, boolean, or standard cell format. If it begins with `=`, it is interpreted as a formula. The value is tiled to all cells in the range.
   * @returns {FRange} This range, for chaining
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('B2');
   * fRange.setValue(123);
   *
   * // or
   * fRange.setValue({ v: 234, s: { bg: { rgb: '#ff0000' } } });
   * ```
   */
  setValue(value) {
    const realValue = covertCellValue(value);
    if (!realValue) {
      throw new Error("Invalid value");
    }
    this._commandService.syncExecuteCommand(SetRangeValuesCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: this._range,
      value: realValue
    });
    return this;
  }
  /**
   * Set new value for current cell, first cell in this range.
   * @param {CellValue | ICellData} value  The value can be a number, string, boolean, or standard cell format. If it begins with `=`, it is interpreted as a formula. The value is tiled to all cells in the range.
   * @returns {FRange} This range, for chaining
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setValueForCell(123);
   *
   * // or
   * fRange.setValueForCell({ v: 234, s: { bg: { rgb: '#ff0000' } } });
   * ```
   */
  setValueForCell(value) {
    const realValue = covertCellValue(value);
    if (!realValue) {
      throw new Error("Invalid value");
    }
    this._commandService.syncExecuteCommand(SetRangeValuesCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: {
        startColumn: this._range.startColumn,
        startRow: this._range.startRow,
        endColumn: this._range.startColumn,
        endRow: this._range.startRow
      },
      value: realValue
    });
    return this;
  }
  /**
   * Set the rich text value for the cell at the start of this range.
   * @param {RichTextValue | IDocumentData} value The rich text value
   * @returns {FRange} The range
   * @example
   * ```
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getValue(true));
   *
   * // Set A1 cell value to rich text
   * const richText = univerAPI.newRichText()
   *   .insertText('Hello World')
   *   .setStyle(0, 1, { bl: 1, cl: { rgb: '#c81e1e' } })
   *   .setStyle(6, 7, { bl: 1, cl: { rgb: '#c81e1e' } });
   * fRange.setRichTextValueForCell(richText);
   * console.log(fRange.getValue(true).toPlainText()); // Hello World
   * ```
   */
  setRichTextValueForCell(value) {
    const p = value instanceof RichTextValue ? value.getData() : value;
    const params = {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: {
        startColumn: this._range.startColumn,
        startRow: this._range.startRow,
        endColumn: this._range.startColumn,
        endRow: this._range.startRow
      },
      value: { p }
    };
    this._commandService.syncExecuteCommand(SetRangeValuesCommand.id, params);
    return this;
  }
  /**
   * Set the rich text value for the cells in the range.
   * @param {RichTextValue[][]} values The rich text value
   * @returns {FRange} The range
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getValue(true));
   *
   * // Set A1:B2 cell value to rich text
   * const richText = univerAPI.newRichText()
   *   .insertText('Hello World')
   *   .setStyle(0, 1, { bl: 1, cl: { rgb: '#c81e1e' } })
   *   .setStyle(6, 7, { bl: 1, cl: { rgb: '#c81e1e' } });
   * fRange.setRichTextValues([
   *   [richText, richText],
   *   [null, null]
   * ]);
   * console.log(fRange.getValue(true).toPlainText()); // Hello World
   * ```
   */
  setRichTextValues(values) {
    const cellDatas = values.map((row) => row.map((item) => item && { p: item instanceof RichTextValue ? item.getData() : item }));
    const realValue = covertCellValues(cellDatas, this._range);
    const params = {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: this._range,
      value: realValue
    };
    this._commandService.syncExecuteCommand(SetRangeValuesCommand.id, params);
    return this;
  }
  /**
   * Set the cell wrap of the given range.
   * Cells with wrap enabled (the default) resize to display their full content. Cells with wrap disabled display as much as possible in the cell without resizing or running to multiple lines.
   * @param {boolean} isWrapEnabled Whether to enable wrap
   * @returns {FRange} this range, for chaining
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setWrap(true);
   * console.log(fRange.getWrap());
   * ```
   */
  setWrap(isWrapEnabled) {
    this._commandService.syncExecuteCommand(SetTextWrapCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: this._range,
      value: isWrapEnabled ? 3 /* WRAP */ : 0 /* UNSPECIFIED */
    });
    return this;
  }
  /**
   * Sets the text wrapping strategy for the cells in the range.
   * @param {WrapStrategy} strategy The text wrapping strategy
   * @returns {FRange} this range, for chaining
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setWrapStrategy(univerAPI.Enum.WrapStrategy.WRAP);
   * console.log(fRange.getWrapStrategy());
   * ```
   */
  setWrapStrategy(strategy) {
    this._commandService.syncExecuteCommand(SetTextWrapCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: this._range,
      value: strategy
    });
    return this;
  }
  /**
   * Set the vertical (top to bottom) alignment for the given range (top/middle/bottom).
   * @param {"top" | "middle" | "bottom"} alignment The vertical alignment
   * @returns {FRange} this range, for chaining
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setVerticalAlignment('top');
   * ```
   */
  setVerticalAlignment(alignment) {
    this._commandService.syncExecuteCommand(SetVerticalTextAlignCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: this._range,
      value: transformFacadeVerticalAlignment(alignment)
    });
    return this;
  }
  /**
   * Set the horizontal (left to right) alignment for the given range (left/center/right).
   * @param {"left" | "center" | "normal"} alignment The horizontal alignment
   * @returns {FRange} this range, for chaining
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setHorizontalAlignment('left');
   * ```
   */
  setHorizontalAlignment(alignment) {
    this._commandService.syncExecuteCommand(SetHorizontalTextAlignCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: this._range,
      value: transformFacadeHorizontalAlignment(alignment)
    });
    return this;
  }
  /**
   * Sets a different value for each cell in the range. The value can be a two-dimensional array or a standard range matrix (must match the dimensions of this range), consisting of numbers, strings, Boolean values or Composed of standard cell formats. If a value begins with `=`, it is interpreted as a formula.
   * @param {CellValue[][] | IObjectMatrixPrimitiveType<CellValue> | ICellData[][] | IObjectMatrixPrimitiveType<ICellData>} value The value can be a two-dimensional array or a standard range matrix (must match the dimensions of this range), consisting of numbers, strings, Boolean values or Composed of standard cell formats.
   * @returns {FRange} This range, for chaining
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setValues([
   *   [1, { v: 2, s: { bg: { rgb: '#ff0000' } } }],
   *   [3, 4]
   * ]);
   * ```
   */
  setValues(value) {
    const realValue = covertCellValues(value, this._range);
    this._commandService.syncExecuteCommand(SetRangeValuesCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: this._range,
      value: realValue
    });
    return this;
  }
  /**
   * Sets the font weight for the given range (normal/bold),
   * @param {FontWeight|null} fontWeight The font weight, either 'normal' or 'bold'; a null value resets the font weight.
   * @returns {FRange} This range, for chaining
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setFontWeight('bold');
   * ```
   */
  setFontWeight(fontWeight) {
    let value;
    if (fontWeight === "bold") {
      value = 1 /* TRUE */;
    } else if (fontWeight === "normal") {
      value = 0 /* FALSE */;
    } else if (fontWeight === null) {
      value = null;
    } else {
      throw new Error("Invalid fontWeight");
    }
    const style = {
      type: "bl",
      value
    };
    const setStyleParams = {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: this._range,
      style
    };
    this._commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);
    return this;
  }
  /**
   * Sets the font style for the given range ('italic' or 'normal').
   * @param {FontStyle|null} fontStyle The font style, either 'italic' or 'normal'; a null value resets the font style.
   * @returns {FRange} This range, for chaining
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setFontStyle('italic');
   * ```
   */
  setFontStyle(fontStyle) {
    let value;
    if (fontStyle === "italic") {
      value = 1 /* TRUE */;
    } else if (fontStyle === "normal") {
      value = 0 /* FALSE */;
    } else if (fontStyle === null) {
      value = null;
    } else {
      throw new Error("Invalid fontStyle");
    }
    const style = {
      type: "it",
      value
    };
    const setStyleParams = {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: this._range,
      style
    };
    this._commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);
    return this;
  }
  /**
   * Sets the font line style of the given range ('underline', 'line-through', or 'none').
   * @param {FontLine|null} fontLine The font line style, either 'underline', 'line-through', or 'none'; a null value resets the font line style.
   * @returns {FRange} This range, for chaining
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setFontLine('underline');
   * ```
   */
  setFontLine(fontLine) {
    if (fontLine === "underline") {
      this._setFontUnderline({
        s: 1 /* TRUE */
      });
    } else if (fontLine === "line-through") {
      this._setFontStrikethrough({
        s: 1 /* TRUE */
      });
    } else if (fontLine === "none") {
      this._setFontUnderline({
        s: 0 /* FALSE */
      });
      this._setFontStrikethrough({
        s: 0 /* FALSE */
      });
    } else if (fontLine === null) {
      this._setFontUnderline(null);
      this._setFontStrikethrough(null);
    } else {
      throw new Error("Invalid fontLine");
    }
    return this;
  }
  /**
   * Sets the font underline style of the given ITextDecoration
   * @param {ITextDecoration|null} value The font underline style of the given ITextDecoration; a null value resets the font underline style
   * @returns {void}
   */
  _setFontUnderline(value) {
    const style = {
      type: "ul",
      value
    };
    const setStyleParams = {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: this._range,
      style
    };
    this._commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);
  }
  /**
   * Sets the font strikethrough style of the given ITextDecoration
   * @param {ITextDecoration|null} value The font strikethrough style of the given ITextDecoration; a null value resets the font strikethrough style
   * @returns {void}
   */
  _setFontStrikethrough(value) {
    const style = {
      type: "st",
      value
    };
    const setStyleParams = {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: this._range,
      style
    };
    this._commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);
  }
  /**
   * Sets the font family, such as "Arial" or "Helvetica".
   * @param {string|null} fontFamily The font family to set; a null value resets the font family.
   * @returns {FRange} This range, for chaining
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setFontFamily('Arial');
   * ```
   */
  setFontFamily(fontFamily) {
    const style = {
      type: "ff",
      value: fontFamily
    };
    const setStyleParams = {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: this._range,
      style
    };
    this._commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);
    return this;
  }
  /**
   * Sets the font size, with the size being the point size to use.
   * @param {number|null} size A font size in point size. A null value resets the font size.
   * @returns {FRange} This range, for chaining
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setFontSize(24);
   * ```
   */
  setFontSize(size) {
    const style = {
      type: "fs",
      value: size
    };
    const setStyleParams = {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: this._range,
      style
    };
    this._commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);
    return this;
  }
  /**
   * Sets the font color in CSS notation (such as '#ffffff' or 'white').
   * @param {string|null} color The font color in CSS notation (such as '#ffffff' or 'white'); a null value resets the color.
   * @returns {FRange} This range, for chaining
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setFontColor('#ff0000');
   * ```
   */
  setFontColor(color) {
    const value = color === null ? null : { rgb: color };
    const style = {
      type: "cl",
      value
    };
    const setStyleParams = {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: this._range,
      style
    };
    this._commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);
    return this;
  }
  // #endregion editing
  //#region Merge cell
  /**
   * Merge cells in a range into one merged cell
   * @param {IMergeCellsUtilOptions} [options] - The options for merging cells.
   * @param {boolean} [options.defaultMerge] - If true, only the value in the upper left cell is retained. If false, a confirm dialog will be shown to the user. Default is true.
   * @param {boolean} [options.isForceMerge] - If true, the overlapping merged cells will be removed before performing the new merge. Default is false.
   * @returns {FRange} This range, for chaining
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.merge();
   * console.log(fRange.isMerged());
   * ```
   *
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('B1:C2');
   * // Assume A1:B2 is already merged.
   * fRange.merge({ isForceMerge: true });
   * ```
   */
  merge(options) {
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    addMergeCellsUtil(this._injector, unitId, subUnitId, [this._range], options);
    return this;
  }
  /**
   * Merges cells in a range horizontally.
   * @param {IMergeCellsUtilOptions} [options] - The options for merging cells.
   * @param {boolean} [options.defaultMerge] - If true, only the value in the upper left cell is retained. If false, a confirm dialog will be shown to the user. Default is true.
   * @param {boolean} [options.isForceMerge] - If true, the overlapping merged cells will be removed before performing the new merge. Default is false.
   * @returns {FRange} This range, for chaining
   * @example
   * ```ts
   * // Assume the active sheet is a new sheet with no merged cells.
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.mergeAcross();
   * // There will be two merged cells. A1:B1 and A2:B2.
   * const mergeData = fWorksheet.getMergeData();
   * mergeData.forEach((item) => {
   *   console.log(item.getA1Notation());
   * });
   * ```
   *
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('B1:C2');
   * // Assume A1:B2 is already merged.
   * fRange.mergeAcross({ isForceMerge: true });
   * ```
   */
  mergeAcross(options) {
    const ranges = getAddMergeMutationRangeByType([this._range], 1 /* ROWS */);
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    addMergeCellsUtil(this._injector, unitId, subUnitId, ranges, options);
    return this;
  }
  /**
   * Merges cells in a range vertically.
   * @param {IMergeCellsUtilOptions} [options] - The options for merging cells.
   * @param {boolean} [options.defaultMerge] - If true, only the value in the upper left cell is retained. If false, a confirm dialog will be shown to the user. Default is true.
   * @param {boolean} [options.isForceMerge] - If true, the overlapping merged cells will be removed before performing the new merge. Default is false.
   * @returns {FRange} This range, for chaining
   * @example
   * ```ts
   * // Assume the active sheet is a new sheet with no merged cells.
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.mergeVertically();
   * // There will be two merged cells. A1:A2 and B1:B2.
   * const mergeData = fWorksheet.getMergeData();
   * mergeData.forEach((item) => {
   *   console.log(item.getA1Notation());
   * });
   * ```
   *
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('B1:C2');
   * // Assume A1:B2 is already merged.
   * fRange.mergeVertically({ isForceMerge: true });
   * ```
   */
  mergeVertically(options) {
    const ranges = getAddMergeMutationRangeByType([this._range], 0 /* COLUMNS */);
    const unitId = this._workbook.getUnitId();
    const subUnitId = this._worksheet.getSheetId();
    addMergeCellsUtil(this._injector, unitId, subUnitId, ranges, options);
    return this;
  }
  /**
   * Returns true if cells in the current range overlap a merged cell.
   * @returns {boolean} is overlap with a merged cell
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.merge();
   * const anchor = fWorksheet.getRange('A1');
   * console.log(anchor.isPartOfMerge()); // true
   * ```
   */
  isPartOfMerge() {
    const { startRow, startColumn, endRow, endColumn } = this._range;
    return this._worksheet.getMergedCellRange(startRow, startColumn, endRow, endColumn).length > 0;
  }
  /**
   * Break all horizontally- or vertically-merged cells contained within the range list into individual cells again.
   * @returns {FRange} This range, for chaining
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.merge();
   * const anchor = fWorksheet.getRange('A1');
   * console.log(anchor.isPartOfMerge()); // true
   * fRange.breakApart();
   * console.log(anchor.isPartOfMerge()); // false
   * ```
   */
  breakApart() {
    this._commandService.syncExecuteCommand(RemoveWorksheetMergeCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      ranges: [this._range]
    });
    return this;
  }
  //#endregion
  /**
   * Iterate cells in this range. Merged cells will be respected.
   * @param {Function} callback the callback function to be called for each cell in the range
   * @param {number} callback.row the row number of the cell
   * @param {number} callback.col the column number of the cell
   * @param {ICellData} callback.cell the cell data
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.forEach((row, col, cell) => {
   *   console.log(row, col, cell);
   * });
   * ```
   */
  forEach(callback) {
    const { startColumn, startRow, endColumn, endRow } = this._range;
    this._worksheet.getMatrixWithMergedCells(startRow, startColumn, endRow, endColumn).forValue((row, col, value) => {
      callback(row, col, value);
    });
  }
  /**
   * Returns a string description of the range, in A1 notation.
   * @param {boolean} [withSheet] - If true, the sheet name is included in the A1 notation.
   * @param {AbsoluteRefType} [startAbsoluteRefType] - The absolute reference type for the start cell.
   * @param {AbsoluteRefType} [endAbsoluteRefType] - The absolute reference type for the end cell.
   * @returns {string} The A1 notation of the range.
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   *
   * // By default, the A1 notation is returned without the sheet name and without absolute reference types.
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getA1Notation()); // A1:B2
   *
   * // By setting withSheet to true, the sheet name is included in the A1 notation.
   * fWorksheet.setName('Sheet1');
   * console.log(fRange.getA1Notation(true)); // Sheet1!A1:B2
   *
   * // By setting startAbsoluteRefType, the absolute reference type for the start cell is included in the A1 notation.
   * console.log(fRange.getA1Notation(false, univerAPI.Enum.AbsoluteRefType.ROW)); // A$1:B2
   * console.log(fRange.getA1Notation(false, univerAPI.Enum.AbsoluteRefType.COLUMN)); // $A1:B2
   * console.log(fRange.getA1Notation(false, univerAPI.Enum.AbsoluteRefType.ALL)); // $A$1:B2
   *
   * // By setting endAbsoluteRefType, the absolute reference type for the end cell is included in the A1 notation.
   * console.log(fRange.getA1Notation(false, null, univerAPI.Enum.AbsoluteRefType.ROW)); // A1:B$2
   * console.log(fRange.getA1Notation(false, null, univerAPI.Enum.AbsoluteRefType.COLUMN)); // A1:$B2
   * console.log(fRange.getA1Notation(false, null, univerAPI.Enum.AbsoluteRefType.ALL)); // A1:$B$2
   *
   * // By setting all parameters example
   * console.log(fRange.getA1Notation(true, univerAPI.Enum.AbsoluteRefType.ALL, univerAPI.Enum.AbsoluteRefType.ALL)); // Sheet1!$A$1:$B$2
   * ```
   */
  getA1Notation(withSheet, startAbsoluteRefType, endAbsoluteRefType) {
    const range = {
      ...this._range,
      startAbsoluteRefType,
      endAbsoluteRefType
    };
    return withSheet ? serializeRangeWithSheet(this._worksheet.getName(), range) : serializeRange(range);
  }
  /**
   * Sets the specified range as the active range, with the top left cell in the range as the current cell.
   * @returns {FRange}  This range, for chaining.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.activate(); // the active cell will be A1
   * ```
   */
  activate() {
    const fWorkbook = this._injector.createInstance(FWorkbook, this._workbook);
    fWorkbook.setActiveRange(this);
    return this;
  }
  /**
   * Sets the specified cell as the current cell.
   * If the specified cell is present in an existing range, then that range becomes the active range with the cell as the current cell.
   * If the specified cell is not part of an existing range, then a new range is created with the cell as the active range and the current cell.
   * @returns {FRange}  This range, for chaining.
   * @description If the range is not a single cell, an error will be thrown.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   *
   * // Set the range A1:B2 as the active range, default active cell is A1
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.activate();
   * console.log(fWorksheet.getActiveRange().getA1Notation()); // A1:B2
   * console.log(fWorksheet.getActiveCell().getA1Notation()); // A1
   *
   * // Set the cell B2 as the active cell
   * // Because B2 is in the active range A1:B2, the active range will not change, and the active cell will be changed to B2
   * const cell = fWorksheet.getRange('B2');
   * cell.activateAsCurrentCell();
   * console.log(fWorksheet.getActiveRange().getA1Notation()); // A1:B2
   * console.log(fWorksheet.getActiveCell().getA1Notation()); // B2
   *
   * // Set the cell C3 as the active cell
   * // Because C3 is not in the active range A1:B2, a new active range C3:C3 will be created, and the active cell will be changed to C3
   * const cell2 = fWorksheet.getRange('C3');
   * cell2.activateAsCurrentCell();
   * console.log(fWorksheet.getActiveRange().getA1Notation()); // C3:C3
   * console.log(fWorksheet.getActiveCell().getA1Notation()); // C3
   * ```
   */
  activateAsCurrentCell() {
    const mergeInfo = this._worksheet.getMergedCell(this._range.startRow, this._range.startColumn);
    const valid = mergeInfo && Rectangle.equals(mergeInfo, this._range) || !mergeInfo && this._range.startRow === this._range.endRow && this._range.startColumn === this._range.endColumn;
    if (valid) {
      const fWorkbook = this._injector.createInstance(FWorkbook, this._workbook);
      const activeRange = fWorkbook.getActiveRange();
      if (!activeRange || activeRange.getUnitId() !== this.getUnitId() || activeRange.getSheetId() !== this.getSheetId()) {
        return this.activate();
      }
      if (Rectangle.contains(activeRange.getRange(), this._range)) {
        const setSelectionOperationParams = {
          unitId: this.getUnitId(),
          subUnitId: this.getSheetId(),
          selections: [
            {
              range: activeRange.getRange(),
              primary: getPrimaryForRange(this.getRange(), this._worksheet),
              style: null
            }
          ]
        };
        this._commandService.syncExecuteCommand(SetSelectionsOperation.id, setSelectionOperationParams);
        return this;
      }
      return this.activate();
    } else {
      throw new Error("The range is not a single cell");
    }
  }
  /**
   * Splits a column of text into multiple columns based on a custom specified delimiter.
   * @param {boolean} [treatMultipleDelimitersAsOne] Whether to treat multiple continuous delimiters as one. The default value is false.
   * @param {SplitDelimiterEnum} [delimiter] The delimiter to use to split the text. The default delimiter is Tab(1)、Comma(2)、Semicolon(4)、Space(8)、Custom(16).A delimiter like 6 (SplitDelimiterEnum.Comma|SplitDelimiterEnum.Semicolon) means using Comma and Semicolon to split the text.
   * @param {string} [customDelimiter] The custom delimiter to split the text. An error will be thrown if custom delimiter is set but the customDelimiter is not a character.
   * @example Show how to split text to columns with custom delimiter
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   *
   * // A1:A3 has following values:
   * //     A   |
   * //  1#2#3  |
   * //  4##5#6 |
   * const fRange = fWorksheet.getRange('A1:A3');
   * fRange.setValues([
   *   ['A'],
   *   ['1#2#3'],
   *   ['4##5#6']
   * ]);
   *
   * // After calling splitTextToColumns(false, univerAPI.Enum.SplitDelimiterType.Custom, '#'), the range will be:
   * //  A |   |   |
   * //  1 | 2 | 3 |
   * //  4 |   | 5 | 6
   * fRange.splitTextToColumns(false, univerAPI.Enum.SplitDelimiterType.Custom, '#');
   *
   * // After calling splitTextToColumns(true, univerAPI.Enum.SplitDelimiterType.Custom, '#'), the range will be:
   * //  A |   |
   * //  1 | 2 | 3
   * //  4 | 5 | 6
   * fRange.splitTextToColumns(true, univerAPI.Enum.SplitDelimiterType.Custom, '#');
   * ```
   */
  splitTextToColumns(treatMultipleDelimitersAsOne, delimiter, customDelimiter) {
    this._commandService.syncExecuteCommand(SplitTextToColumnsCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: this._range,
      delimiter,
      customDelimiter,
      treatMultipleDelimitersAsOne
    });
  }
  /**
   * Set the theme style for the range.
   * @param {string|undefined} themeName The name of the theme style to apply.If a undefined value is passed, the theme style will be removed if it exist.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:E20');
   * fRange.useThemeStyle('default');
   * ```
   */
  useThemeStyle(themeName) {
    if (themeName === null || themeName === void 0) {
      const usedThemeName = this.getUsedThemeStyle();
      if (usedThemeName) {
        this.removeThemeStyle(usedThemeName);
      }
    } else {
      this._commandService.syncExecuteCommand(SetWorksheetRangeThemeStyleCommand.id, {
        unitId: this._workbook.getUnitId(),
        subUnitId: this._worksheet.getSheetId(),
        range: this._range,
        themeName
      });
    }
  }
  /**
   * Remove the theme style for the range.
   * @param {string} themeName The name of the theme style to remove.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:E20');
   * fRange.removeThemeStyle('default');
   * ```
   */
  removeThemeStyle(themeName) {
    this._commandService.syncExecuteCommand(DeleteWorksheetRangeThemeStyleCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: this._range,
      themeName
    });
  }
  /**
   * Gets the theme style applied to the range.
   * @returns {string | undefined} The name of the theme style applied to the range or not exist.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:E20');
   * console.log(fRange.getUsedThemeStyle()); // undefined
   * fRange.useThemeStyle('default');
   * console.log(fRange.getUsedThemeStyle()); // 'default'
   * ```
   */
  getUsedThemeStyle() {
    return this._injector.get(SheetRangeThemeService).getAppliedRangeThemeStyle({
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      range: this._range
    });
  }
  /**
   * Clears content and formatting information of the range. Or Optionally clears only the contents or only the formatting.
   * @param {IFacadeClearOptions} [options] - Options for clearing the range. If not provided, the contents and formatting are cleared both.
   * @param {boolean} [options.contentsOnly] - If true, the contents of the range are cleared. If false, the contents and formatting are cleared. Default is false.
   * @param {boolean} [options.formatOnly] - If true, the formatting of the range is cleared. If false, the contents and formatting are cleared. Default is false.
   * @returns {FWorksheet} Returns the current worksheet instance for method chaining
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * const fRange = fWorkSheet.getRange('A1:D10');
   *
   * // clear the content and format of the range A1:D10
   * fRange.clear();
   *
   * // clear the content only of the range A1:D10
   * fRange.clear({ contentsOnly: true });
   * ```
   */
  clear(options) {
    if (options && options.contentsOnly && !options.formatOnly) {
      return this.clearContent();
    }
    if (options && options.formatOnly && !options.contentsOnly) {
      return this.clearFormat();
    }
    this._commandService.syncExecuteCommand(ClearSelectionAllCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      ranges: [this._range],
      options
    });
    return this;
  }
  /**
   * Clears content of the range, while preserving formatting information.
   * @returns {FWorksheet} Returns the current worksheet instance for method chaining
   * @example
   * ```typescript
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * const fRange = fWorkSheet.getRange('A1:D10');
   *
   * // clear the content only of the range A1:D10
   * fRange.clearContent();
   * ```
   */
  clearContent() {
    this._commandService.syncExecuteCommand(ClearSelectionContentCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      ranges: [this._range]
    });
    return this;
  }
  /**
   * Clears formatting information of the range, while preserving contents.
   * @returns {FWorksheet} Returns the current worksheet instance for method chaining
   * @example
   * ```typescript
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorkSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorkSheet) return;
   * const fRange = fWorkSheet.getRange('A1:D10');
   * // clear the format only of the range A1:D10
   * fRange.clearFormat();
   * ```
   */
  clearFormat() {
    this._commandService.syncExecuteCommand(ClearSelectionFormatCommand.id, {
      unitId: this._workbook.getUnitId(),
      subUnitId: this._worksheet.getSheetId(),
      ranges: [this._range]
    });
    return this;
  }
  /**
   * Inserts empty cells into this range. Existing data in the sheet along the provided dimension is shifted away from the inserted range.
   * @param {Dimension} shiftDimension - The dimension along which to shift existing data.
   * @example
   * ```ts
   * // Assume the active sheet empty sheet.
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const values = [
   *   [1, 2, 3, 4],
   *   [2, 3, 4, 5],
   *   [3, 4, 5, 6],
   *   [4, 5, 6, 7],
   *   [5, 6, 7, 8],
   * ];
   *
   * // Set the range A1:D5 with some values, the range A1:D5 will be:
   * // 1 | 2 | 3 | 4
   * // 2 | 3 | 4 | 5
   * // 3 | 4 | 5 | 6
   * // 4 | 5 | 6 | 7
   * // 5 | 6 | 7 | 8
   * const fRange = fWorksheet.getRange('A1:D5');
   * fRange.setValues(values);
   * console.log(fWorksheet.getRange('A1:D5').getValues()); // [[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6], [4, 5, 6, 7], [5, 6, 7, 8]]
   *
   * // Insert the empty cells into the range A1:B2 along the columns dimension, the range A1:D5 will be:
   * //   |   | 1 | 2
   * //   |   | 2 | 3
   * // 3 | 4 | 5 | 6
   * // 4 | 5 | 6 | 7
   * // 5 | 6 | 7 | 8
   * const fRange2 = fWorksheet.getRange('A1:B2');
   * fRange2.insertCells(univerAPI.Enum.Dimension.COLUMNS);
   * console.log(fWorksheet.getRange('A1:D5').getValues()); // [[null, null, 1, 2], [null, null, 2, 3], [3, 4, 5, 6], [4, 5, 6, 7], [5, 6, 7, 8]]
   *
   * // Set the range A1:D5 values again, the range A1:D5 will be:
   * // 1 | 2 | 3 | 4
   * // 2 | 3 | 4 | 5
   * // 3 | 4 | 5 | 6
   * // 4 | 5 | 6 | 7
   * // 5 | 6 | 7 | 8
   * fRange.setValues(values);
   *
   * // Insert the empty cells into the range A1:B2 along the rows dimension, the range A1:D5 will be:
   * //   |   | 3 | 4
   * //   |   | 4 | 5
   * // 1 | 2 | 5 | 6
   * // 2 | 3 | 6 | 7
   * // 3 | 4 | 7 | 8
   * const fRange3 = fWorksheet.getRange('A1:B2');
   * fRange3.insertCells(univerAPI.Enum.Dimension.ROWS);
   * console.log(fWorksheet.getRange('A1:D5').getValues()); // [[null, null, 3, 4], [null, null, 4, 5], [1, 2, 5, 6], [2, 3, 6, 7], [3, 4, 7, 8]]
   * ```
   */
  insertCells(shiftDimension) {
    if (shiftDimension === 1 /* ROWS */) {
      this._commandService.executeCommand(InsertRangeMoveDownCommand.id, {
        range: this._range
      });
    } else {
      this._commandService.executeCommand(InsertRangeMoveRightCommand.id, {
        range: this._range
      });
    }
  }
  /**
   * Deletes this range of cells. Existing data in the sheet along the provided dimension is shifted towards the deleted range.
   * @param {Dimension} shiftDimension - The dimension along which to shift existing data.
   * @example
   * ```ts
   * // Assume the active sheet empty sheet.
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const values = [
   *   [1, 2, 3, 4],
   *   [2, 3, 4, 5],
   *   [3, 4, 5, 6],
   *   [4, 5, 6, 7],
   *   [5, 6, 7, 8],
   * ];
   *
   * // Set the range A1:D5 with some values, the range A1:D5 will be:
   * // 1 | 2 | 3 | 4
   * // 2 | 3 | 4 | 5
   * // 3 | 4 | 5 | 6
   * // 4 | 5 | 6 | 7
   * // 5 | 6 | 7 | 8
   * const fRange = fWorksheet.getRange('A1:D5');
   * fRange.setValues(values);
   * console.log(fWorksheet.getRange('A1:D5').getValues()); // [[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6], [4, 5, 6, 7], [5, 6, 7, 8]]
   *
   * // Delete the range A1:B2 along the columns dimension, the range A1:D5 will be:
   * // 3 | 4 |   |
   * // 4 | 5 |   |
   * // 3 | 4 | 5 | 6
   * // 4 | 5 | 6 | 7
   * // 5 | 6 | 7 | 8
   * const fRange2 = fWorksheet.getRange('A1:B2');
   * fRange2.deleteCells(univerAPI.Enum.Dimension.COLUMNS);
   * console.log(fWorksheet.getRange('A1:D5').getValues()); // [[3, 4, null, null], [4, 5, null, null], [3, 4, 5, 6], [4, 5, 6, 7], [5, 6, 7, 8]]
   *
   * // Set the range A1:D5 values again, the range A1:D5 will be:
   * // 1 | 2 | 3 | 4
   * // 2 | 3 | 4 | 5
   * // 3 | 4 | 5 | 6
   * // 4 | 5 | 6 | 7
   * // 5 | 6 | 7 | 8
   * fRange.setValues(values);
   *
   * // Delete the range A1:B2 along the rows dimension, the range A1:D5 will be:
   * // 3 | 4 | 3 | 4
   * // 4 | 5 | 4 | 5
   * // 5 | 6 | 5 | 6
   * //   |   | 6 | 7
   * //   |   | 7 | 8
   * const fRange3 = fWorksheet.getRange('A1:B2');
   * fRange3.deleteCells(univerAPI.Enum.Dimension.ROWS);
   * console.log(fWorksheet.getRange('A1:D5').getValues()); // [[3, 4, 3, 4], [4, 5, 4, 5], [5, 6, 5, 6], [null, null, 6, 7], [null, null, 7, 8]]
   * ```
   */
  deleteCells(shiftDimension) {
    if (shiftDimension === 1 /* ROWS */) {
      this._commandService.executeCommand(DeleteRangeMoveUpCommand.id, {
        range: this._range
      });
    } else {
      this._commandService.executeCommand(DeleteRangeMoveLeftCommand.id, {
        range: this._range
      });
    }
  }
  /**
   * Returns a copy of the range expanded `Direction.UP` and `Direction.DOWN` if the specified dimension is `Dimension.ROWS`, or `Direction.NEXT` and `Direction.PREVIOUS` if the dimension is `Dimension.COLUMNS`.
   * The expansion of the range is based on detecting data next to the range that is organized like a table.
   * The expanded range covers all adjacent cells with data in them along the specified dimension including the table boundaries.
   * If the original range is surrounded by empty cells along the specified dimension, the range itself is returned.
   * @param {Dimension} [dimension] - The dimension along which to expand the range. If not provided, the range will be expanded in both dimensions.
   * @returns {FRange} The range's data region or a range covering each column or each row spanned by the original range.
   * @example
   * ```ts
   * // Assume the active sheet is a new sheet with no data.
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   *
   * // Set the range A1:D4 with some values, the range A1:D4 will be:
   * //  |     |     |
   * //  |     | 100 |
   * //  | 100 |     | 100
   * //  |     | 100 |
   * fWorksheet.getRange('C2').setValue(100);
   * fWorksheet.getRange('B3').setValue(100);
   * fWorksheet.getRange('D3').setValue(100);
   * fWorksheet.getRange('C4').setValue(100);
   *
   * // Get C3 data region along the rows dimension, the range will be C2:D4
   * const range = fWorksheet.getRange('C3').getDataRegion(univerAPI.Enum.Dimension.ROWS);
   * console.log(range.getA1Notation()); // C2:C4
   *
   * // Get C3 data region along the columns dimension, the range will be B3:D3
   * const range2 = fWorksheet.getRange('C3').getDataRegion(univerAPI.Enum.Dimension.COLUMNS);
   * console.log(range2.getA1Notation()); // B3:D3
   *
   * // Get C3 data region along the both dimension, the range will be B2:D4
   * const range3 = fWorksheet.getRange('C3').getDataRegion();
   * console.log(range3.getA1Notation()); // B2:D4
   * ```
   */
  // eslint-disable-next-line complexity
  getDataRegion(dimension) {
    const { startRow, startColumn, endRow, endColumn } = this._range;
    const maxRows = this._worksheet.getMaxRows();
    const maxColumns = this._worksheet.getMaxColumns();
    const cellMatrix = this._worksheet.getCellMatrix();
    let newStartRow = startRow;
    let newStartColumn = startColumn;
    let newEndRow = endRow;
    let newEndColumn = endColumn;
    if (dimension !== 0 /* COLUMNS */) {
      let topRowHasValue = false;
      let bottomRowHasValue = false;
      for (let c = startColumn; c <= endColumn; c++) {
        if (startRow > 0 && !isNullCell(cellMatrix.getValue(startRow - 1, c))) {
          topRowHasValue = true;
        }
        if (endRow < maxRows - 1 && !isNullCell(cellMatrix.getValue(endRow + 1, c))) {
          bottomRowHasValue = true;
        }
        if (topRowHasValue && bottomRowHasValue) {
          break;
        }
      }
      if (topRowHasValue) {
        newStartRow = startRow - 1;
      }
      if (bottomRowHasValue) {
        newEndRow = endRow + 1;
      }
    }
    if (dimension !== 1 /* ROWS */) {
      let leftColumnHasValue = false;
      let rightColumnHasValue = false;
      for (let r = startRow; r <= endRow; r++) {
        if (startColumn > 0 && !isNullCell(cellMatrix.getValue(r, startColumn - 1))) {
          leftColumnHasValue = true;
        }
        if (endColumn < maxColumns - 1 && !isNullCell(cellMatrix.getValue(r, endColumn + 1))) {
          rightColumnHasValue = true;
        }
        if (leftColumnHasValue && rightColumnHasValue) {
          break;
        }
      }
      if (leftColumnHasValue) {
        newStartColumn = startColumn - 1;
      }
      if (rightColumnHasValue) {
        newEndColumn = endColumn + 1;
      }
    }
    return this._injector.createInstance(FRange, this._workbook, this._worksheet, {
      startRow: newStartRow,
      startColumn: newStartColumn,
      endRow: newEndRow,
      endColumn: newEndColumn
    });
  }
  /**
   * Returns true if the range is totally blank.
   * @returns {boolean} true if the range is blank; false otherwise.
   * @example
   * ```ts
   * // Assume the active sheet is a new sheet with no data.
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.isBlank()); // true
   *
   * // Set the range A1:B2 with some values
   * fRange.setValueForCell(123);
   * console.log(fRange.isBlank()); // false
   * ```
   */
  isBlank() {
    const cellMatrix = this._worksheet.getCellMatrix();
    const { startRow, startColumn, endRow, endColumn } = this._range;
    let isBlank = true;
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startColumn; c <= endColumn; c++) {
        if (!isNullCell(cellMatrix.getValue(r, c))) {
          isBlank = false;
          break;
        }
      }
      if (!isBlank) {
        break;
      }
    }
    return isBlank;
  }
  /**
   * Returns a new range that is relative to the current range, whose upper left point is offset from the current range by the given rows and columns, and with the given height and width in cells.
   * @param {number} rowOffset - The number of rows down from the range's top-left cell; negative values represent rows up from the range's top-left cell.
   * @param {number} columnOffset - The number of columns right from the range's top-left cell; negative values represent columns left from the range's top-left cell.
   * @param {number} numRows - The height in rows of the new range.
   * @param {number} numColumns - The width in columns of the new range.
   * @returns {FRange} The new range.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * console.log(fRange.getA1Notation()); // A1:B2
   *
   * // Offset the range by 1 row and 1 column, and set the height of the new range to 3 and the width to 3
   * const newRange = fRange.offset(1, 1, 3, 3);
   * console.log(newRange.getA1Notation()); // B2:D4
   * ```
   */
  offset(rowOffset, columnOffset, numRows, numColumns) {
    const { startRow, startColumn, endRow, endColumn } = this._range;
    const newStartRow = startRow + rowOffset;
    const newStartColumn = startColumn + columnOffset;
    const newEndRow = numRows ? newStartRow + numRows - 1 : endRow + rowOffset;
    const newEndColumn = numColumns ? newStartColumn + numColumns - 1 : endColumn + columnOffset;
    if (newStartRow < 0 || newStartColumn < 0 || newEndRow < 0 || newEndColumn < 0) {
      throw new Error("The row or column index is out of range");
    }
    return this._injector.createInstance(FRange, this._workbook, this._worksheet, {
      startRow: newStartRow,
      startColumn: newStartColumn,
      endRow: newEndRow,
      endColumn: newEndColumn
    });
  }
  /**
   * Updates the formula for this range. The given formula must be in A1 notation.
   * @param {string} formula - A string representing the formula to set for the cell.
   * @returns {FRange} This range instance for chaining.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1');
   * fRange.setFormula('=SUM(A2:A5)');
   * console.log(fRange.getFormula()); // '=SUM(A2:A5)'
   * ```
   */
  setFormula(formula) {
    return this.setValue({
      f: formula
    });
  }
  /**
   * Sets a rectangular grid of formulas (must match dimensions of this range). The given formulas must be in A1 notation.
   * @param {string[][]} formulas - A two-dimensional string array of formulas.
   * @returns {FRange} This range instance for chaining.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setFormulas([
   *   ['=SUM(A2:A5)', '=SUM(B2:B5)'],
   *   ['=SUM(A6:A9)', '=SUM(B6:B9)'],
   * ]);
   * console.log(fRange.getFormulas()); // [['=SUM(A2:A5)', '=SUM(B2:B5)'], ['=SUM(A6:A9)', '=SUM(B6:B9)']]
   * ```
   */
  setFormulas(formulas) {
    return this.setValues(formulas.map((row) => row.map((formula) => ({ f: formula }))));
  }
  /**
   * Get the RangePermission instance for managing range-level permissions.
   * This is the new permission API that provides range-specific permission control.
   * @returns {FRangePermission} - The RangePermission instance.
   * @example
   * ```ts
   * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B10');
   * const permission = fRange.getRangePermission();
   *
   * // Protect the range
   * await permission.protect({ name: 'Protected Area', allowEdit: false });
   *
   * // Check if range is protected
   * const isProtected = permission.isProtected();
   *
   * // Check if current user can edit
   * const canEdit = permission.canEdit();
   *
   * // Unprotect the range
   * await permission.unprotect();
   *
   * // Subscribe to protection changes
   * permission.protectionChange$.subscribe(change => {
   *   console.log('Protection changed:', change);
   * });
   * ```
   */
  getRangePermission() {
    const fWorksheet = this._injector.createInstance(FWorksheet, this._injector.createInstance(FWorkbook, this._workbook), this._workbook, this._worksheet);
    return this._injector.createInstance(
      FRangePermission,
      this._workbook.getUnitId(),
      this._worksheet.getSheetId(),
      this,
      fWorksheet
    );
  }
  /**
   * Fills the target range with data based on the data in the current range.
   * @param {FRange} targetRange - The range to be filled with data.
   * @param {AUTO_FILL_APPLY_TYPE} [applyType] - The type of data fill to be applied.
   * @returns {Promise<boolean>} A promise that resolves to true if the fill operation was successful, false otherwise.
   * @example
   * ```ts
   * // Auto-fill the range D1:D10 based on the data in the range C1:C2
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:A4');
   *
   * // Auto-fill without specifying applyType (default behavior)
   * await fRange.autoFill(fWorksheet.getRange('A1:A20'))
   *
   * // Auto-fill with 'COPY' type
   * await fRange.autoFill(fWorksheet.getRange('A1:A20'), 'COPY')
   *
   * // Auto-fill with 'SERIES' type
   * await fRange.autoFill(fWorksheet.getRange('A1:A20'), 'SERIES')
   * ```
   *
   * ```ts
   * // Operate on a specific worksheet
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetBySheetId('sheetId');
   * const fRange = fWorksheet.getRange('A1:A4');
   *
   * // Auto-fill without specifying applyType (default behavior)
   * await fRange.autoFill(fWorksheet.getRange('A1:A20'))
   *
   * // Auto-fill with 'COPY' type
   * await fRange.autoFill(fWorksheet.getRange('A1:A20'), 'COPY')
   *
   * // Auto-fill with 'SERIES' type
   * await fRange.autoFill(fWorksheet.getRange('A1:A20'), 'SERIES')
   * ```
   */
  autoFill(targetRange, applyType) {
    const _sourceRange = this.getRange();
    const _targetRange = targetRange.getRange();
    if (!Rectangle.contains(_targetRange, _sourceRange)) {
      throw new Error("AutoFill target range must contain source range");
    }
    const { startRow: sourceStartRow, startColumn: sourceStartColumn, endRow: sourceEndRow, endColumn: sourceEndColumn } = _sourceRange;
    const { startRow: targetStartRow, startColumn: targetStartColumn, endRow: targetEndRow, endColumn: targetEndColumn } = _targetRange;
    if (sourceEndRow - sourceStartRow !== targetEndRow - targetStartRow && sourceEndColumn - sourceStartColumn !== targetEndColumn - targetStartColumn) {
      throw new Error("AutoFill can only fill in one direction");
    }
    if (sourceEndRow - sourceStartRow === targetEndRow - targetStartRow && sourceStartColumn !== targetStartColumn && sourceEndColumn !== targetEndColumn) {
      throw new Error("AutoFill can only fill in one direction");
    }
    if (sourceEndColumn - sourceStartColumn === targetEndColumn - targetStartColumn && sourceStartRow !== targetStartRow && sourceEndRow !== targetEndRow) {
      throw new Error("AutoFill can only fill in one direction");
    }
    return this._commandService.executeCommand(AutoFillCommand.id, {
      sourceRange: _sourceRange,
      targetRange: _targetRange,
      unitId: this.getUnitId(),
      subUnitId: this.getSheetId(),
      applyType
    });
  }
};
FRange._enableManualInit();
FRange = __decorateClass([
  __decorateParam(3, Inject(Injector)),
  __decorateParam(4, ICommandService),
  __decorateParam(5, Inject(FormulaDataModel))
], FRange);

// ../packages/sheets/src/facade/permission/f-workbook-permission.ts
var FWorkbookPermission = class extends FBase {
  constructor(_unitId, _injector, _permissionService, _authzIoService) {
    super();
    __publicField(this, "_unitId", _unitId);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_permissionService", _permissionService);
    __publicField(this, "_authzIoService", _authzIoService);
  }
  /**
   * Set permission mode for the workbook.
   * @param {WorkbookMode} mode The permission mode to set ('owner' | 'editor' | 'viewer' | 'commenter').
   * @returns {Promise<void>} A promise that resolves when the mode is set.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * await fWorkbook.getWorkbookPermission().setMode('editor');
   * ```
   */
  async setMode(mode) {
    const pointsToSet = this._getModePermissions(mode);
    await Promise.all(
      Object.entries(pointsToSet).map(([point, value]) => this.setPoint(point, value))
    );
  }
  /**
   * Get permission configuration for a specific mode
   * @private
   */
  _getModePermissions(mode) {
    const pointsToSet = {};
    Object.values(WorkbookPermissionPoint).forEach((point) => {
      pointsToSet[point] = false;
    });
    switch (mode) {
      case "owner":
        Object.values(WorkbookPermissionPoint).forEach((point) => {
          pointsToSet[point] = true;
        });
        break;
      case "editor":
        pointsToSet["WorkbookEdit" /* Edit */] = true;
        pointsToSet["WorkbookView" /* View */] = true;
        pointsToSet["WorkbookPrint" /* Print */] = true;
        pointsToSet["WorkbookExport" /* Export */] = true;
        pointsToSet["WorkbookCopy" /* CopyContent */] = true;
        pointsToSet["WorkbookComment" /* Comment */] = true;
        pointsToSet["WorkbookCreateSheet" /* CreateSheet */] = true;
        pointsToSet["WorkbookDeleteSheet" /* DeleteSheet */] = true;
        pointsToSet["WorkbookRenameSheet" /* RenameSheet */] = true;
        pointsToSet["WorkbookMoveSheet" /* MoveSheet */] = true;
        pointsToSet["WorkbookHideSheet" /* HideSheet */] = true;
        pointsToSet["WorkbookInsertRow" /* InsertRow */] = true;
        pointsToSet["WorkbookInsertColumn" /* InsertColumn */] = true;
        pointsToSet["WorkbookDeleteRow" /* DeleteRow */] = true;
        pointsToSet["WorkbookDeleteColumn" /* DeleteColumn */] = true;
        pointsToSet["WorkbookCopySheet" /* CopySheet */] = true;
        pointsToSet["WorkbookCreateProtect" /* CreateProtection */] = true;
        break;
      case "viewer":
        pointsToSet["WorkbookView" /* View */] = true;
        pointsToSet["WorkbookPrint" /* Print */] = true;
        break;
      case "commenter":
        pointsToSet["WorkbookView" /* View */] = true;
        pointsToSet["WorkbookComment" /* Comment */] = true;
        pointsToSet["WorkbookPrint" /* Print */] = true;
        break;
    }
    return pointsToSet;
  }
  /**
   * Set the workbook to read-only mode (viewer mode).
   * @returns {Promise<void>} A promise that resolves when the mode is set.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * await fWorkbook.getWorkbookPermission().setReadOnly();
   * ```
   */
  async setReadOnly() {
    await this.setMode("viewer");
  }
  /**
   * Set the workbook to editable mode (editor mode).
   * @returns {Promise<void>} A promise that resolves when the mode is set.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * await fWorkbook.getWorkbookPermission().setEditable();
   * ```
   */
  async setEditable() {
    await this.setMode("editor");
  }
  /**
   * Set a specific permission point.
   * @param {WorkbookPermissionPoint} point The permission point to set.
   * @param {boolean} value The value to set (true = allowed, false = denied).
   * @returns {Promise<void>} A promise that resolves when the point is set.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const permission = fWorkbook.getWorkbookPermission();
   * await permission.setPoint(univerAPI.Enum.WorkbookPermissionPoint.Print, false);
   * ```
   */
  async setPoint(point, value) {
    const PermissionPointClass = WORKBOOK_PERMISSION_POINT_MAP[point];
    if (!PermissionPointClass) {
      throw new Error(`Unknown workbook permission point: ${point}`);
    }
    const instance = new PermissionPointClass(this._unitId);
    const permissionPoint = this._permissionService.getPermissionPoint(instance.id);
    if (permissionPoint && permissionPoint.value === value) {
      return;
    }
    if (!permissionPoint) {
      this._permissionService.addPermissionPoint(instance);
    }
    await this._authzIoService.update({
      objectType: 1 /* Workbook */,
      objectID: this._unitId,
      unitID: this._unitId,
      share: void 0,
      name: "",
      strategies: [{
        action: instance.subType,
        role: value ? 1 /* Editor */ : 2 /* Owner */
      }],
      scope: void 0,
      collaborators: void 0
    });
    this._permissionService.updatePermissionPoint(instance.id, value);
  }
  /**
   * Check if the workbook is editable.
   * @returns {boolean} true if the workbook can be edited, false otherwise.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * if (fWorkbook.getWorkbookPermission().canEdit()) {
   *   console.log('Workbook is editable');
   * }
   * ```
   */
  canEdit() {
    return this.getPoint("WorkbookEdit" /* Edit */);
  }
  /**
   * Get the value of a specific permission point.
   * @param {WorkbookPermissionPoint} point The permission point to query.
   * @returns {boolean} true if allowed, false if denied.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const permission = fWorkbook.getWorkbookPermission();
   * const canPrint = permission.getPoint(univerAPI.Enum.WorkbookPermissionPoint.Print);
   * console.log(canPrint);
   * ```
   */
  getPoint(point) {
    var _a;
    const PointClass = WORKBOOK_PERMISSION_POINT_MAP[point];
    if (!PointClass) {
      throw new Error(`Unknown workbook permission point: ${point}`);
    }
    const instance = new PointClass(this._unitId);
    const permissionPoint = this._permissionService.getPermissionPoint(instance.id);
    return (_a = permissionPoint == null ? void 0 : permissionPoint.value) != null ? _a : true;
  }
  /**
   * Get a snapshot of all permission points.
   * @returns {WorkbookPermissionSnapshot} An object containing all permission point values.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const snapshot = fWorkbook.getWorkbookPermission().getSnapshot();
   * console.log(snapshot);
   * ```
   */
  getSnapshot() {
    const snapshot = {};
    for (const point in WorkbookPermissionPoint) {
      const pointKey = WorkbookPermissionPoint[point];
      snapshot[pointKey] = this.getPoint(pointKey);
    }
    return snapshot;
  }
  /**
   * Set multiple collaborators at once (replaces existing collaborators).
   * @param {Array<{ user: IUser; role: UnitRole }>} collaborators Array of collaborators with user information and role.
   * @returns {Promise<void>} A promise that resolves when the collaborators are set.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const permission = fWorkbook.getWorkbookPermission();
   * await permission.setCollaborators([
   *   {
   *     user: { userID: 'user1', name: 'John Doe', avatar: 'https://...' },
   *     role: univerAPI.Enum.UnitRole.Editor
   *   },
   *   {
   *     user: { userID: 'user2', name: 'Jane Smith', avatar: '' },
   *     role: univerAPI.Enum.UnitRole.Reader
   *   }
   * ]);
   * ```
   */
  async setCollaborators(collaborators) {
    const protocolCollaborators = collaborators.map((c) => ({
      id: c.user.userID,
      subject: c.user,
      role: c.role
    }));
    await this._authzIoService.putCollaborators({
      objectID: this._unitId,
      unitID: this._unitId,
      collaborators: protocolCollaborators
    });
  }
  /**
   * Add a single collaborator.
   * @param {IUser} user The user information (userID, name, avatar).
   * @param {UnitRole} role The role to assign.
   * @returns {Promise<void>} A promise that resolves when the collaborator is added.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const permission = fWorkbook.getWorkbookPermission();
   * await permission.addCollaborator(
   *   { userID: 'user1', name: 'John Doe', avatar: 'https://...' },
   *   univerAPI.Enum.UnitRole.Editor
   * );
   * ```
   */
  async addCollaborator(user, role) {
    await this._authzIoService.createCollaborator({
      objectID: this._unitId,
      unitID: this._unitId,
      collaborators: [{
        id: user.userID,
        subject: user,
        role
      }]
    });
  }
  /**
   * Update an existing collaborator's role and information.
   * @param {IUser} user The updated user information (userID, name, avatar).
   * @param {UnitRole} role The new role to assign.
   * @returns {Promise<void>} A promise that resolves when the collaborator is updated.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const permission = fWorkbook.getWorkbookPermission();
   * await permission.updateCollaborator(
   *   { userID: 'user1', name: 'John Doe Updated', avatar: 'https://...' },
   *   univerAPI.Enum.UnitRole.Reader
   * );
   * ```
   */
  async updateCollaborator(user, role) {
    await this._authzIoService.updateCollaborator({
      objectID: this._unitId,
      unitID: this._unitId,
      collaborator: {
        id: user.userID,
        subject: user,
        role
      }
    });
  }
  /**
   * Remove a collaborator from the workbook.
   * @param {string} userId The user ID to remove.
   * @returns {Promise<void>} A promise that resolves when the collaborator is removed.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const permission = fWorkbook.getWorkbookPermission();
   * await permission.removeCollaborator('user1');
   * ```
   */
  async removeCollaborator(userId) {
    await this._authzIoService.deleteCollaborator({
      objectID: this._unitId,
      unitID: this._unitId,
      collaboratorID: userId
    });
  }
  /**
   * Remove multiple collaborators at once.
   * @param {string[]} userIds Array of user IDs to remove.
   * @returns {Promise<void>} A promise that resolves when the collaborators are removed.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const permission = fWorkbook.getWorkbookPermission();
   * await permission.removeCollaborators(['user1', 'user2']);
   * ```
   */
  async removeCollaborators(userIds) {
    await Promise.all(
      userIds.map((userId) => this.removeCollaborator(userId))
    );
  }
  /**
   * List all collaborators of the workbook.
   * @returns {Promise<ICollaborator[]>} Array of collaborators with their roles.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const permission = fWorkbook.getWorkbookPermission();
   * const collaborators = await permission.listCollaborators();
   * console.log(collaborators);
   * ```
   */
  async listCollaborators() {
    const protocolCollaborators = await this._authzIoService.listCollaborators({
      objectID: this._unitId,
      unitID: this._unitId
    });
    return protocolCollaborators.map((c) => {
      var _a, _b, _c;
      return {
        user: {
          userID: ((_a = c.subject) == null ? void 0 : _a.userID) || c.id,
          name: ((_b = c.subject) == null ? void 0 : _b.name) || "",
          avatar: ((_c = c.subject) == null ? void 0 : _c.avatar) || ""
        },
        role: c.role
      };
    });
  }
};
FWorkbookPermission = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IPermissionService),
  __decorateParam(3, IAuthzIoService)
], FWorkbookPermission);

// ../packages/sheets/src/facade/f-workbook.ts
var FWorkbook = class extends FBaseInitialable {
  constructor(_workbook, _injector, _resourceLoaderService, _selectionManagerService, _univerInstanceService, _commandService, _permissionService, _logService, _localeService, _definedNamesService) {
    super(_injector);
    __publicField(this, "_workbook", _workbook);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_resourceLoaderService", _resourceLoaderService);
    __publicField(this, "_selectionManagerService", _selectionManagerService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_permissionService", _permissionService);
    __publicField(this, "_logService", _logService);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_definedNamesService", _definedNamesService);
    __publicField(this, "id");
    this.id = this._workbook.getUnitId();
  }
  /**
   * Get the Workbook instance.
   * @returns {Workbook} The Workbook instance.
   * @example
   * ```ts
   * // The code below gets the Workbook instance
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const workbook = fWorkbook.getWorkbook();
   * console.log(workbook);
   * ```
   */
  getWorkbook() {
    return this._workbook;
  }
  dispose() {
    super.dispose();
    this._workbook = null;
  }
  /**
   * Get the id of the workbook.
   * @returns {string} The id of the workbook.
   * @example
   * ```ts
   * // The code below gets the id of the workbook
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const unitId = fWorkbook.getId();
   * console.log(unitId);
   * ```
   */
  getId() {
    return this.id;
  }
  /**
   * Get the name of the workbook.
   * @returns {string} The name of the workbook.
   * @example
   * ```ts
   * // The code below gets the name of the workbook
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const name = fWorkbook.getName();
   * console.log(name);
   * ```
   */
  getName() {
    return this._workbook.name;
  }
  /**
   * Set the name of the workbook.
   * @param {string} name The new name of the workbook.
   * @example
   * ```ts
   * // The code below sets the name of the workbook
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * fWorkbook.setName('MyWorkbook');
   * ```
   */
  setName(name) {
    this._commandService.syncExecuteCommand(SetWorkbookNameCommand.id, {
      unitId: this._workbook.getUnitId(),
      name
    });
    return this;
  }
  /**
   * Save workbook snapshot data, including conditional formatting, data validation, and other plugin data.
   * @returns {IWorkbookData} Workbook snapshot data
   * @example
   * ```ts
   * // The code below saves the workbook snapshot data
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const snapshot = fWorkbook.save();
   * console.log(snapshot);
   * ```
   */
  save() {
    const snapshot = this._resourceLoaderService.saveUnit(this._workbook.getUnitId());
    return snapshot;
  }
  /**
   * @deprecated use 'save' instead.
   * @returns {IWorkbookData} Workbook snapshot data
   * @memberof FWorkbook
   * @example
   * ```ts
   * // The code below saves the workbook snapshot data
   * const activeSpreadsheet = univerAPI.getActiveWorkbook();
   * const snapshot = activeSpreadsheet.getSnapshot();
   * ```
   */
  getSnapshot() {
    this._logService.warn("use 'save' instead of 'getSnapshot'");
    return this.save();
  }
  /**
   * Get the active sheet of the workbook.
   * @returns {FWorksheet} The active sheet of the workbook
   * @example
   * ```ts
   * // The code below gets the active sheet of the workbook
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getActiveSheet();
   * if (!fWorksheet) return;
   * console.log(fWorksheet);
   * ```
   */
  getActiveSheet() {
    const activeSheet = this._workbook.getActiveSheet();
    return this._injector.createInstance(FWorksheet, this, this._workbook, activeSheet);
  }
  /**
   * Gets all the worksheets in this workbook
   * @returns {FWorksheet[]} An array of all the worksheets in the workbook
   * @example
   * ```ts
   * // The code below gets all the worksheets in the workbook
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const sheets = fWorkbook.getSheets();
   * console.log(sheets);
   * ```
   */
  getSheets() {
    return this._workbook.getSheets().map((sheet) => {
      return this._injector.createInstance(FWorksheet, this, this._workbook, sheet);
    });
  }
  /**
   * Create a new worksheet and returns a handle to it.
   * @param {string} name Name of the new sheet
   * @param {number} rows How many rows would the new sheet have
   * @param {number} columns How many columns would the new sheet have
   * @param {Pick<IInsertSheetCommandParams, 'index' | 'sheet'>} [options] The options for the new sheet
   * @param {number} [options.index] The position index where the new sheet is to be inserted
   * @param {Partial<IWorksheetData>} [options.sheet] The data configuration for the new sheet
   * @returns {FWorksheet} The new created sheet
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   *
   * // Create a new sheet named 'MyNewSheet' with 10 rows and 10 columns
   * const newSheet = fWorkbook.create('MyNewSheet', 10, 10);
   * console.log(newSheet);
   *
   * // Create a new sheet named 'MyNewSheetWithData' with 10 rows and 10 columns and some data, and set it as the first sheet
   * const sheetData = {
   *   // ... Omit other properties
   *   cellData: {
   *     0: {
   *       0: {
   *         v: 'Hello Univer!',
   *       }
   *     }
   *   },
   *   // ... Omit other properties
   * };
   * const newSheetWithData = fWorkbook.create('MyNewSheetWithData', 10, 10, {
   *   index: 0,
   *   sheet: sheetData,
   * });
   * console.log(newSheetWithData);
   * ```
   */
  create(name, rows, columns, options) {
    var _a, _b, _c;
    const newSheet = mergeWorksheetSnapshotWithDefault(Tools.deepClone((_a = options == null ? void 0 : options.sheet) != null ? _a : {}));
    newSheet.name = name;
    newSheet.rowCount = rows;
    newSheet.columnCount = columns;
    newSheet.id = (_b = options == null ? void 0 : options.sheet) == null ? void 0 : _b.id;
    const newSheetIndex = (_c = options == null ? void 0 : options.index) != null ? _c : this._workbook.getSheets().length;
    this._commandService.syncExecuteCommand(InsertSheetCommand.id, {
      unitId: this.id,
      index: newSheetIndex,
      sheet: newSheet
    });
    this._commandService.syncExecuteCommand(SetWorksheetActiveOperation.id, {
      unitId: this.id,
      subUnitId: this._workbook.getSheets()[newSheetIndex].getSheetId()
    });
    const worksheet = this._workbook.getActiveSheet();
    if (!worksheet) {
      throw new Error("No active sheet found");
    }
    return this._injector.createInstance(FWorksheet, this, this._workbook, worksheet);
  }
  /**
   * Get a worksheet by sheet id.
   * @param {string} sheetId The id of the sheet to get.
   * @returns {FWorksheet | null} The worksheet with given sheet id
   * @example
   * ```ts
   * // The code below gets a worksheet by sheet id
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const sheet = fWorkbook.getSheetBySheetId('sheetId');
   * console.log(sheet);
   * ```
   */
  getSheetBySheetId(sheetId) {
    const worksheet = this._workbook.getSheetBySheetId(sheetId);
    if (!worksheet) {
      return null;
    }
    return this._injector.createInstance(FWorksheet, this, this._workbook, worksheet);
  }
  /**
   * Get a worksheet by sheet name.
   * @param {string} name The name of the sheet to get.
   * @returns {FWorksheet | null} The worksheet with given sheet name
   * @example
   * ```ts
   * // The code below gets a worksheet by sheet name
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const sheet = fWorkbook.getSheetByName('Sheet1');
   * console.log(sheet);
   * ```
   */
  getSheetByName(name) {
    const worksheet = this._workbook.getSheetBySheetName(name);
    if (!worksheet) {
      return null;
    }
    return this._injector.createInstance(FWorksheet, this, this._workbook, worksheet);
  }
  /**
   * Sets the given worksheet to be the active worksheet in the workbook.
   * @param {FWorksheet | string} sheet The instance or id of the worksheet to set as active.
   * @returns {FWorksheet} The active worksheet
   * @example
   * ```ts
   * // The code below sets the given worksheet to be the active worksheet
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const sheet = fWorkbook.getSheets()[1];
   * fWorkbook.setActiveSheet(sheet);
   * ```
   */
  setActiveSheet(sheet) {
    this._commandService.syncExecuteCommand(SetWorksheetActiveOperation.id, {
      unitId: this.id,
      subUnitId: typeof sheet === "string" ? sheet : sheet.getSheetId()
    });
    return typeof sheet === "string" ? this.getSheetBySheetId(sheet) : sheet;
  }
  /**
   * Inserts a new worksheet into the workbook.
   * Using a default sheet name. The new sheet becomes the active sheet
   * @param {string} [sheetName] The name of the new sheet
   * @param {Pick<IInsertSheetCommandParams, 'index' | 'sheet'>} [options] The options for the new sheet
   * @param {number} [options.index] The position index where the new sheet is to be inserted
   * @param {Partial<IWorksheetData>} [options.sheet] The data configuration for the new sheet
   * @returns {FWorksheet} The new sheet
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   *
   * // Create a new sheet with default configuration
   * const newSheet = fWorkbook.insertSheet();
   * console.log(newSheet);
   *
   * // Create a new sheet with custom name and default configuration
   * const newSheetWithName = fWorkbook.insertSheet('MyNewSheet');
   * console.log(newSheetWithName);
   *
   * // Create a new sheet with custom name and custom configuration
   * const sheetData = {
   *   // ... Omit other properties
   *   cellData: {
   *     0: {
   *       0: {
   *         v: 'Hello Univer!',
   *       }
   *     }
   *   },
   *   // ... Omit other properties
   * };
   * const newSheetWithData = fWorkbook.insertSheet('MyNewSheetWithData', {
   *   index: 0,
   *   sheet: sheetData,
   * });
   * console.log(newSheetWithData);
   * ```
   */
  insertSheet(sheetName, options) {
    var _a, _b, _c;
    const newSheet = mergeWorksheetSnapshotWithDefault(Tools.deepClone((_a = options == null ? void 0 : options.sheet) != null ? _a : {}));
    if (sheetName !== void 0) {
      newSheet.name = sheetName;
    } else {
      delete newSheet.name;
    }
    newSheet.id = (_b = options == null ? void 0 : options.sheet) == null ? void 0 : _b.id;
    const newSheetIndex = (_c = options == null ? void 0 : options.index) != null ? _c : this._workbook.getSheets().length;
    this._commandService.syncExecuteCommand(InsertSheetCommand.id, {
      unitId: this.id,
      index: newSheetIndex,
      sheet: newSheet
    });
    this._commandService.syncExecuteCommand(SetWorksheetActiveOperation.id, {
      unitId: this.id,
      subUnitId: this._workbook.getSheets()[newSheetIndex].getSheetId()
    });
    const worksheet = this._workbook.getActiveSheet();
    if (!worksheet) {
      throw new Error("No active sheet found");
    }
    return this._injector.createInstance(FWorksheet, this, this._workbook, worksheet);
  }
  /**
   * Deletes the specified worksheet.
   * @param {FWorksheet | string} sheet The instance or id of the worksheet to delete.
   * @returns {boolean} True if the worksheet was deleted, false otherwise.
   * @example
   * ```ts
   * // The code below deletes the specified worksheet
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const sheet = fWorkbook.getSheets()[1];
   * fWorkbook.deleteSheet(sheet);
   *
   * // The code below deletes the specified worksheet by id
   * // fWorkbook.deleteSheet(sheet.getSheetId());
   * ```
   */
  deleteSheet(sheet) {
    const unitId = this.id;
    const subUnitId = typeof sheet === "string" ? sheet : sheet.getSheetId();
    return this._commandService.syncExecuteCommand(RemoveSheetCommand.id, {
      unitId,
      subUnitId
    });
  }
  // #region editing
  /**
   * Undo the last action.
   * @returns {FWorkbook} A promise that resolves to true if the undo was successful, false otherwise.
   * @example
   * ```ts
   * // The code below undoes the last action
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * fWorkbook.undo();
   * ```
   */
  undo() {
    this._univerInstanceService.focusUnit(this.id);
    this._commandService.syncExecuteCommand(UndoCommand.id);
    return this;
  }
  /**
   * Redo the last undone action.
   * @returns {FWorkbook} A promise that resolves to true if the redo was successful, false otherwise.
   * @example
   * ```ts
   * // The code below redoes the last undone action
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * fWorkbook.redo();
   * ```
   */
  redo() {
    this._univerInstanceService.focusUnit(this.id);
    this._commandService.syncExecuteCommand(RedoCommand.id);
    return this;
  }
  /**
   * Callback for command execution.
   * @callback onBeforeCommandExecuteCallback
   * @param {ICommandInfo<ISheetCommandSharedParams>} command The command that was executed.
   */
  /**
   * Register a callback that will be triggered before invoking a command targeting the Univer sheet.
   * @param {onBeforeCommandExecuteCallback} callback the callback.
   * @returns {IDisposable} A function to dispose the listening.
   * @example
   * ```ts
   * // The code below registers a callback that will be triggered before invoking a command targeting the Univer sheet
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * fWorkbook.onBeforeCommandExecute((command) => {
   *   console.log('Before command execute:', command);
   * });
   * ```
   */
  onBeforeCommandExecute(callback) {
    return this._commandService.beforeCommandExecuted((command) => {
      var _a;
      if (((_a = command.params) == null ? void 0 : _a.unitId) !== this.id) {
        return;
      }
      callback(command);
    });
  }
  /**
   * Callback for command execution.
   * @callback onCommandExecutedCallback
   * @param {ICommandInfo<ISheetCommandSharedParams>} command The command that was executed
   */
  /**
   * Register a callback that will be triggered when a command is invoked targeting the Univer sheet.
   * @param {onCommandExecutedCallback} callback the callback.
   * @returns {IDisposable} A function to dispose the listening.
   * @example
   * ```ts
   * // The code below registers a callback that will be triggered when a command is invoked targeting the Univer sheet
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * fWorkbook.onCommandExecuted((command) => {
   *   console.log('Command executed:', command);
   * });
   * ```
   */
  onCommandExecuted(callback) {
    return this._commandService.onCommandExecuted((command) => {
      var _a;
      if (((_a = command.params) == null ? void 0 : _a.unitId) !== this.id) {
        return;
      }
      callback(command);
    });
  }
  /**
   * Callback for selection changes.
   * @callback onSelectionChangeCallback
   * @param {IRange[]} selections The new selection.
   */
  /**
   * Register a callback that will be triggered when the selection changes.
   * @param {onSelectionChangeCallback} callback The callback.
   * @returns {IDisposable} A function to dispose the listening
   * @example
   * ```ts
   * // The code below registers a callback that will be triggered when the selection changes
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * fWorkbook.onSelectionChange((selections) => {
   *   console.log('Selection changed:', selections);
   * });
   * ```
   */
  onSelectionChange(callback) {
    return toDisposable(
      this._selectionManagerService.selectionMoveEnd$.subscribe((selections) => {
        if (this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */).getUnitId() !== this.id) {
          return;
        }
        if (!(selections == null ? void 0 : selections.length)) {
          callback([]);
        } else {
          callback(selections.map((s) => s.range));
        }
      })
    );
  }
  /**
   * Used to modify the editing permissions of the workbook. When the value is false, editing is not allowed.
   * @param {boolean} value  editable value want to set
   * @returns {FWorkbook} FWorkbook instance
   * @example
   * ```ts
   * // The code below sets the editing permissions of the workbook
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * fWorkbook.setEditable(false);
   * ```
   */
  setEditable(value) {
    const instance = new WorkbookEditablePermission(this._workbook.getUnitId());
    const editPermissionPoint = this._permissionService.getPermissionPoint(instance.id);
    if (!editPermissionPoint) {
      this._permissionService.addPermissionPoint(instance);
    }
    this._permissionService.updatePermissionPoint(instance.id, value);
    return this;
  }
  /**
   * Sets the selection region for active sheet.
   * @param {FRange} range The range to set as the active selection.
   * @returns {FWorkbook} FWorkbook instance
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const range = fWorksheet.getRange('A10:B10');
   * fWorkbook.setActiveRange(range);
   * ```
   */
  setActiveRange(range) {
    const sheet = this.getActiveSheet();
    const sheetId = range.getRange().sheetId || sheet.getSheetId();
    const worksheet = sheetId ? this._workbook.getSheetBySheetId(sheetId) : this._workbook.getActiveSheet(true);
    if (!worksheet) {
      throw new Error("No active sheet found");
    }
    if (worksheet.getSheetId() !== sheet.getSheetId()) {
      this.setActiveSheet(this._injector.createInstance(FWorksheet, this, this._workbook, worksheet));
    }
    const setSelectionOperationParams = {
      unitId: this.getId(),
      subUnitId: sheetId,
      selections: [range].map((r) => ({ range: r.getRange(), primary: getPrimaryForRange(r.getRange(), worksheet), style: null }))
    };
    this._commandService.syncExecuteCommand(SetSelectionsOperation.id, setSelectionOperationParams);
    return this;
  }
  /**
   * Returns the selected range in the active sheet, or null if there is no active range.
   * @returns {FRange | null} The active range
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const activeRange = fWorkbook.getActiveRange();
   * console.log(activeRange);
   * ```
   */
  // could sheet have no active range ?
  getActiveRange() {
    const activeSheet = this._workbook.getActiveSheet();
    const selections = this._selectionManagerService.getCurrentSelections();
    const active = selections.find((selection) => !!selection.primary);
    if (!active) {
      return null;
    }
    return this._injector.createInstance(FRange, this._workbook, activeSheet, active.range);
  }
  /**
   * Returns the active cell in this spreadsheet.
   * @returns {FRange | null} The active cell
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * console.log(fWorkbook.getActiveCell().getA1Notation());
   * ```
   */
  getActiveCell() {
    const activeSheet = this._workbook.getActiveSheet();
    const selections = this._selectionManagerService.getCurrentSelections();
    const active = selections.find((selection) => !!selection.primary);
    if (!active) {
      return null;
    }
    const cell = {
      ...active.primary,
      rangeType: 0 /* NORMAL */
    };
    return this._injector.createInstance(FRange, this._workbook, activeSheet, cell);
  }
  /**
   * Deletes the currently active sheet.
   * @returns {boolean} true if the sheet was deleted, false otherwise
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * fWorkbook.deleteActiveSheet();
   * ```
   */
  deleteActiveSheet() {
    const sheet = this.getActiveSheet();
    return this.deleteSheet(sheet);
  }
  /**
   * Duplicates the given worksheet.
   * @param {FWorksheet} sheet The worksheet to duplicate.
   * @returns {FWorksheet} The duplicated worksheet
   * @example
   * ```ts
   * // The code below duplicates the given worksheet
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const activeSheet = fWorkbook.getSheetByName('Sheet1');
   * if (!activeSheet) return;
   * const duplicatedSheet = fWorkbook.duplicateSheet(activeSheet);
   * console.log(duplicatedSheet);
   * ```
   */
  duplicateSheet(sheet) {
    this._commandService.syncExecuteCommand(CopySheetCommand.id, {
      unitId: sheet.getWorkbook().getUnitId(),
      subUnitId: sheet.getSheetId()
    });
    return this._injector.createInstance(FWorksheet, this, this._workbook, this._workbook.getActiveSheet());
  }
  /**
   * Duplicates the active sheet.
   * @returns {FWorksheet} The duplicated worksheet
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const duplicatedSheet = fWorkbook.duplicateActiveSheet();
   * console.log(duplicatedSheet);
   * ```
   */
  duplicateActiveSheet() {
    const sheet = this.getActiveSheet();
    return this.duplicateSheet(sheet);
  }
  /**
   * Get the number of sheets in the workbook.
   * @returns {number} The number of sheets in the workbook
   * @example
   * ```ts
   * // The code below gets the number of sheets in the workbook
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * console.log(fWorkbook.getNumSheets());
   * ```
   */
  getNumSheets() {
    return this._workbook.getSheets().length;
  }
  /**
   * Get the locale of the workbook.
   * @returns {LocaleType} The locale of the workbook
   * @example
   * ```ts
   * // The code below gets the locale of the workbook
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * console.log(fWorkbook.getLocale());
   * ```
   */
  getLocale() {
    return this._localeService.getCurrentLocale();
  }
  /**
   * @deprecated use `setSpreadsheetLocale` instead.
   * @param {LocaleType} locale - The locale to set
   */
  setLocale(locale) {
    this._localeService.setLocale(locale);
  }
  /**
   * Set the locale of the workbook.
   * @param {LocaleType} locale The locale to set
   * @returns {FWorkbook} This workbook, for chaining
   * @example
   * ```ts
   * // The code below sets the locale of the workbook
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * fWorkbook.setSpreadsheetLocale(univerAPI.Enum.LocaleType.EN_US);
   * console.log(fWorkbook.getLocale());
   * ```
   */
  setSpreadsheetLocale(locale) {
    this._localeService.setLocale(locale);
    return this;
  }
  /**
   * Get the URL of the workbook.
   * @returns {string} The URL of the workbook
   * @example
   * ```ts
   * // The code below gets the URL of the workbook
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const url = fWorkbook.getUrl();
   * console.log(url);
   * ```
   */
  getUrl() {
    return location.href;
  }
  /**
   * Move the sheet to the specified index.
   * @param {FWorksheet} sheet The sheet to move
   * @param {number} index The index to move the sheet to
   * @returns {FWorkbook} This workbook, for chaining
   * @example
   * ```ts
   * // The code below moves the sheet to the specified index
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const sheet = fWorkbook.getSheetByName('Sheet1');
   * if (!sheet) return;
   * fWorkbook.moveSheet(sheet, 1);
   * ```
   */
  moveSheet(sheet, index) {
    let sheetIndexVal = index;
    if (sheetIndexVal < 0) {
      sheetIndexVal = 0;
    } else if (sheetIndexVal > this._workbook.getSheets().length - 1) {
      sheetIndexVal = this._workbook.getSheets().length - 1;
    }
    this._commandService.syncExecuteCommand(SetWorksheetOrderCommand.id, {
      unitId: sheet.getWorkbook().getUnitId(),
      order: sheetIndexVal,
      subUnitId: sheet.getSheetId()
    });
    return this;
  }
  /**
   * Move the active sheet to the specified index.
   * @param {number} index The index to move the active sheet to
   * @returns {FWorkbook} This workbook, for chaining
   * @example
   * ```ts
   * // The code below moves the active sheet to the specified index
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * fWorkbook.moveActiveSheet(1);
   * ```
   */
  moveActiveSheet(index) {
    const sheet = this.getActiveSheet();
    return this.moveSheet(sheet, index);
  }
  /**
   * Get the WorkbookPermission instance for managing workbook-level permissions.
   * This is the new permission API that provides a more intuitive and type-safe interface.
   * @returns {FWorkbookPermission} - The WorkbookPermission instance.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const permission = fWorkbook.getWorkbookPermission();
   *
   * // Set workbook to read-only mode
   * await permission.setMode('viewer');
   *
   * // Add a collaborator
   * await permission.addCollaborator({
   *   userId: 'user123',
   *   name: 'John Doe',
   *   role: 'editor'
   * });
   *
   * // Subscribe to permission changes
   * permission.permission$.subscribe(snapshot => {
   *   console.log('Permissions changed:', snapshot);
   * });
   * ```
   */
  getWorkbookPermission() {
    return this._injector.createInstance(FWorkbookPermission, this._workbook.getUnitId());
  }
  /**
   * Get the defined name by name.
   * @param {string} name The name of the defined name to get
   * @returns {FDefinedName | null} The defined name with the given name
   * @example
   * ```ts
   * // The code below gets the defined name by name
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedName = fWorkbook.getDefinedName('MyDefinedName');
   * console.log(definedName?.getFormulaOrRefString());
   * ```
   */
  getDefinedName(name) {
    const definedName = this._definedNamesService.getValueByName(this.id, name);
    if (!definedName) {
      return null;
    }
    return this._injector.createInstance(FDefinedName, { ...definedName, unitId: this.id });
  }
  /**
   * Get all the defined names in the workbook.
   * @returns {FDefinedName[]} All the defined names in the workbook
   * @example
   * ```ts
   * // The code below gets all the defined names in the workbook
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedNames = fWorkbook.getDefinedNames();
   * console.log(definedNames, definedNames[0]?.getFormulaOrRefString());
   * ```
   */
  getDefinedNames() {
    const definedNames = this._definedNamesService.getDefinedNameMap(this.id);
    if (!definedNames) {
      return [];
    }
    return Object.values(definedNames).map((definedName) => {
      return this._injector.createInstance(FDefinedName, { ...definedName, unitId: this.id });
    });
  }
  /**
   * Create a new defined name builder.
   * @returns {FDefinedNameBuilder} - The defined name builder.
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedNameParam = fWorkbook.newDefinedNameBuilder()
   *   .setRef('Sheet1!$A$1')
   *   .setName('MyDefinedName')
   *   .setComment('This is a comment');
   *   .build();
   * console.log(definedNameParam);
   * fWorkbook.insertDefinedNameBuilder(definedNameParam);
   * ```
   */
  newDefinedNameBuilder() {
    return this._injector.createInstance(FDefinedNameBuilder, this.id);
  }
  /**
   * Insert a defined name by builder param.
   * @param {ISetDefinedNameMutationParam} param The param to insert the defined name
   * @returns {void}
   * @example
   * ```ts
   * // The code below inserts a defined name by builder param
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedNameParam = fWorkbook.newDefinedNameBuilder()
   *   .setRef('Sheet1!$A$1')
   *   .setName('MyDefinedName')
   *   .setComment('This is a comment')
   *   .build();
   * fWorkbook.insertDefinedNameBuilder(definedNameParam);
   * ```
   */
  insertDefinedNameBuilder(param) {
    this._commandService.syncExecuteCommand(SetDefinedNameCommand.id, param);
  }
  /**
   * Update the defined name with the given name.
   * @param {ISetDefinedNameMutationParam} param The param to insert the defined name
   * @returns {void}
   * @example
   * ```ts
   * // The code below updates the defined name with the given name
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const definedName = fWorkbook.getDefinedName('MyDefinedName');
   * console.log(definedName?.getFormulaOrRefString());
   *
   * // Update the defined name
   * if (definedName) {
   *   const newDefinedNameParam = definedName.toBuilder()
   *     .setName('NewDefinedName')
   *     .setRef('Sheet1!$A$2')
   *     .build();
   *   fWorkbook.updateDefinedNameBuilder(newDefinedNameParam);
   * }
   * ```
   */
  updateDefinedNameBuilder(param) {
    this._commandService.syncExecuteCommand(SetDefinedNameCommand.id, param);
  }
  /**
   * Insert a defined name.
   * @param {string} name The name of the defined name to insert
   * @param {string} formulaOrRefString The formula(=sum(A2:b10)) or reference(A1) string of the defined name to insert
   * @returns {FWorkbook} The current FWorkbook instance
   * @example
   * ```ts
   * // The code below inserts a defined name
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * fWorkbook.insertDefinedName('MyDefinedName', 'Sheet1!$A$1');
   * ```
   */
  insertDefinedName(name, formulaOrRefString) {
    const definedNameParam = this.newDefinedNameBuilder().setName(name).setRef(formulaOrRefString).setScopeToWorkbook().build();
    this.insertDefinedNameBuilder(definedNameParam);
    return this;
  }
  /**
   * Delete the defined name with the given name.
   * @param {string} name The name of the defined name to delete
   * @returns {boolean} true if the defined name was deleted, false otherwise
   * @example
   * ```ts
   * // The code below deletes the defined name with the given name
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * fWorkbook.deleteDefinedName('MyDefinedName');
   * ```
   */
  deleteDefinedName(name) {
    const definedName = this.getDefinedName(name);
    if (definedName) {
      definedName.delete();
      return true;
    }
    return false;
  }
  /**
   * Gets the registered range themes.
   * @returns {string[]} The name list of registered range themes.
   * @example
   * ```ts
   * // The code below gets the registered range themes
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const themes = fWorkbook.getRegisteredRangeThemes();
   * console.log(themes);
   * ```
   */
  getRegisteredRangeThemes() {
    return this._injector.get(SheetRangeThemeService).getRegisteredRangeThemes();
  }
  /**
   * Register a custom range theme style.
   * @param {RangeThemeStyle} rangeThemeStyle The range theme style to register
   * @returns {void}
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const rangeThemeStyle = fWorkbook.createRangeThemeStyle('MyTheme', {
   *   secondRowStyle: {
   *     bg: {
   *       rgb: 'rgb(214,231,241)',
   *     },
   *   },
   * });
   * fWorkbook.registerRangeTheme(rangeThemeStyle);
   * ```
   */
  registerRangeTheme(rangeThemeStyle) {
    this._commandService.syncExecuteCommand(RegisterWorksheetRangeThemeStyleCommand.id, {
      unitId: this.getId(),
      rangeThemeStyle
    });
  }
  /**
   * Unregister a custom range theme style.
   * @param {string} themeName The name of the theme to unregister
   * @returns {void}
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * fWorkbook.unregisterRangeTheme('MyTheme');
   * ```
   */
  unregisterRangeTheme(themeName) {
    this._commandService.syncExecuteCommand(UnregisterWorksheetRangeThemeStyleCommand.id, {
      unitId: this.getId(),
      themeName
    });
  }
  /**
   * Create a range theme style.
   * @param {string} themeName - The name of the theme to register
   * @param {Omit<IRangeThemeStyleJSON, 'name'>} themeStyleJson - The theme style json to register
   * @returns {RangeThemeStyle} - The created range theme style
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const rangeThemeStyle = fWorkbook.createRangeThemeStyle('MyTheme', {
   *   secondRowStyle: {
   *     bg: {
   *       rgb: 'rgb(214,231,241)',
   *     },
   *   },
   * });
   * console.log(rangeThemeStyle);
   * ```
   */
  createRangeThemeStyle(themeName, themeStyleJson) {
    return new RangeThemeStyle(themeName, themeStyleJson);
  }
  /**
   * Set custom metadata of workbook
   * @param {CustomData | undefined} custom custom metadata
   * @returns {FWorkbook} FWorkbook
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * fWorkbook.setCustomMetadata({ key: 'value' });
   * ```
   */
  setCustomMetadata(custom) {
    this._workbook.setCustomMetadata(custom);
    return this;
  }
  /**
   * Get custom metadata of workbook
   * @returns {CustomData | undefined} custom metadata
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   * const custom = fWorkbook.getCustomMetadata();
   * console.log(custom);
   * ```
   */
  getCustomMetadata() {
    return this._workbook.getCustomMetadata();
  }
  /**
   * Add styles to the workbook styles.
   * @param {Record<string, IStyleData>} styles Styles to add
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   *
   * // Add styles to the workbook styles
   * const styles = {
   *   'custom-style-1': {
   *     bg: {
   *       rgb: 'rgb(255, 0, 0)',
   *     }
   *   },
   *   'custom-style-2': {
   *     fs: 20,
   *     n: {
   *       pattern: '@'
   *     }
   *   }
   * };
   * fWorkbook.addStyles(styles);
   *
   * // Set values with the new styles
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setValues([
   *   [{ v: 'Hello', s: 'custom-style-1' }, { v: 'Univer', s: 'custom-style-1' }],
   *   [{ v: 'To', s: 'custom-style-1' }, { v: '0001', s: 'custom-style-2' }],
   * ]);
   * ```
   */
  addStyles(styles) {
    this._workbook.addStyles(styles);
  }
  /**
   * Remove styles from the workbook styles.
   * @param {string[]} styleKeys Style keys to remove
   * @example
   * ```ts
   * const fWorkbook = univerAPI.getActiveWorkbook();
   *
   * // Add styles to the workbook styles
   * const styles = {
   *   'custom-style-1': {
   *     bg: {
   *       rgb: 'rgb(255, 0, 0)',
   *     }
   *   },
   *   'custom-style-2': {
   *     fs: 20,
   *     n: {
   *       pattern: '@'
   *     }
   *   }
   * };
   * fWorkbook.addStyles(styles);
   *
   * // Set values with the new styles
   * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
   * if (!fWorksheet) return;
   * const fRange = fWorksheet.getRange('A1:B2');
   * fRange.setValues([
   *   [{ v: 'Hello', s: 'custom-style-1' }, { v: 'Univer', s: 'custom-style-1' }],
   *   [{ v: 'To', s: 'custom-style-1' }, { v: '0001', s: 'custom-style-2' }],
   * ]);
   *
   * // Remove the style `custom-style-1` after 2 seconds
   * setTimeout(() => {
   *   fWorkbook.removeStyles(['custom-style-1']);
   *   fWorksheet.refreshCanvas();
   * }, 2000);
   * ```
   */
  removeStyles(styleKeys) {
    this._workbook.removeStyles(styleKeys);
  }
};
FWorkbook = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, Inject(IResourceLoaderService)),
  __decorateParam(3, Inject(SheetsSelectionsService)),
  __decorateParam(4, IUniverInstanceService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IPermissionService),
  __decorateParam(7, ILogService),
  __decorateParam(8, Inject(LocaleService)),
  __decorateParam(9, IDefinedNamesService)
], FWorkbook);

// ../packages/sheets/src/facade/f-univer.ts
var FUniverSheetsMixin = class extends FUniver {
  getCommandSheetTarget(commandInfo) {
    var _a;
    const params = commandInfo.params;
    if (!params) return this.getActiveSheet();
    const workbook = params.unitId ? this.getUniverSheet(params.unitId) : (_a = this.getActiveWorkbook) == null ? void 0 : _a.call(this);
    if (!workbook) {
      return;
    }
    const worksheet = workbook.getSheetBySheetId(params.subUnitId || params.sheetId) || workbook.getActiveSheet();
    if (!worksheet) {
      return;
    }
    return { workbook, worksheet };
  }
  getSheetTarget(unitId, subUnitId) {
    const workbook = this.getUniverSheet(unitId);
    if (!workbook) {
      return;
    }
    const worksheet = workbook.getSheetBySheetId(subUnitId);
    if (!worksheet) {
      return;
    }
    return { workbook, worksheet };
  }
  _initWorkbookEvent(injector) {
    const univerInstanceService = injector.get(IUniverInstanceService);
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.WorkbookDisposed,
        () => univerInstanceService.unitDisposed$.subscribe((unit) => {
          if (unit.type === 2 /* UNIVER_SHEET */) {
            const eventParams = {
              unitId: unit.getUnitId(),
              unitType: unit.type,
              snapshot: unit.getSnapshot()
            };
            this.fireEvent(this.Event.WorkbookDisposed, eventParams);
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.WorkbookCreated,
        () => univerInstanceService.unitAdded$.subscribe((event) => {
          const { unit } = event;
          if (unit.type === 2 /* UNIVER_SHEET */) {
            const workbook = unit;
            const workbookUnit = injector.createInstance(FWorkbook, workbook);
            const eventParams = {
              unitId: unit.getUnitId(),
              type: unit.type,
              workbook: workbookUnit,
              unit: workbookUnit
            };
            this.fireEvent(this.Event.WorkbookCreated, eventParams);
          }
        })
      )
    );
  }
  /**
   * @ignore
   */
  // eslint-disable-next-line max-lines-per-function
  _initialize(injector) {
    const univerInstanceService = injector.get(IUniverInstanceService);
    const commandService = injector.get(ICommandService);
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.BeforeSheetCreate,
        () => commandService.beforeCommandExecuted((commandInfo) => {
          var _a;
          if (commandInfo.id === InsertSheetCommand.id) {
            const params = commandInfo.params;
            const { unitId, index, sheet } = params || {};
            const workbook = unitId ? this.getUniverSheet(unitId) : (_a = this.getActiveWorkbook) == null ? void 0 : _a.call(this);
            if (!workbook) {
              return;
            }
            const eventParams = {
              workbook,
              index,
              sheet
            };
            this.fireEvent(this.Event.BeforeSheetCreate, eventParams);
            if (eventParams.cancel) {
              throw new CanceledError();
            }
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.BeforeActiveSheetChange,
        () => commandService.beforeCommandExecuted((commandInfo) => {
          var _a;
          if (commandInfo.id === SetWorksheetActiveOperation.id) {
            const { subUnitId: sheetId, unitId } = commandInfo.params;
            const workbook = unitId ? this.getUniverSheet(unitId) : (_a = this.getActiveWorkbook) == null ? void 0 : _a.call(this);
            if (!workbook || !sheetId) return;
            const activeSheet = workbook.getSheetBySheetId(sheetId);
            const oldActiveSheet = workbook.getActiveSheet();
            if (!activeSheet || !oldActiveSheet) return;
            const eventParams = {
              workbook,
              activeSheet,
              oldActiveSheet
            };
            this.fireEvent(this.Event.BeforeActiveSheetChange, eventParams);
            if (eventParams.cancel) {
              throw new CanceledError();
            }
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.BeforeSheetDelete,
        () => commandService.beforeCommandExecuted((commandInfo) => {
          if (commandInfo.id === RemoveSheetCommand.id) {
            const target = this.getCommandSheetTarget(commandInfo);
            if (!target) return;
            const { workbook, worksheet } = target;
            const eventParams = {
              workbook,
              worksheet
            };
            this.fireEvent(this.Event.BeforeSheetDelete, eventParams);
            if (eventParams.cancel) {
              throw new CanceledError();
            }
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.BeforeSheetMove,
        () => commandService.beforeCommandExecuted((commandInfo) => {
          if (commandInfo.id === SetWorksheetOrderMutation.id) {
            const { fromOrder, toOrder } = commandInfo.params;
            const target = this.getCommandSheetTarget(commandInfo);
            if (!target) return;
            const eventParams = {
              workbook: target.workbook,
              worksheet: target.worksheet,
              newIndex: toOrder,
              oldIndex: fromOrder
            };
            this.fireEvent(this.Event.BeforeSheetMove, eventParams);
            if (eventParams.cancel) {
              throw new CanceledError();
            }
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.BeforeSheetNameChange,
        () => commandService.beforeCommandExecuted((commandInfo) => {
          if (commandInfo.id === SetWorksheetNameCommand.id) {
            const { name } = commandInfo.params;
            const target = this.getCommandSheetTarget(commandInfo);
            if (!target) return;
            const eventParams = {
              workbook: target.workbook,
              worksheet: target.worksheet,
              newName: name,
              oldName: target.worksheet.getSheetName()
            };
            this.fireEvent(this.Event.BeforeSheetNameChange, eventParams);
            if (eventParams.cancel) {
              throw new CanceledError();
            }
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.BeforeSheetTabColorChange,
        () => commandService.beforeCommandExecuted((commandInfo) => {
          if (commandInfo.id === SetTabColorMutation.id) {
            const { color } = commandInfo.params;
            const target = this.getCommandSheetTarget(commandInfo);
            if (!target) return;
            const eventParams = {
              workbook: target.workbook,
              worksheet: target.worksheet,
              newColor: color,
              oldColor: target.worksheet.getTabColor()
            };
            this.fireEvent(this.Event.BeforeSheetTabColorChange, eventParams);
            if (eventParams.cancel) {
              throw new CanceledError();
            }
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.BeforeSheetHideChange,
        () => commandService.beforeCommandExecuted((commandInfo) => {
          if (commandInfo.id === SetWorksheetHideMutation.id) {
            const { hidden } = commandInfo.params;
            const target = this.getCommandSheetTarget(commandInfo);
            if (!target) return;
            const eventParams = {
              workbook: target.workbook,
              worksheet: target.worksheet,
              hidden: Boolean(hidden)
            };
            this.fireEvent(this.Event.BeforeSheetHideChange, eventParams);
            if (eventParams.cancel) {
              throw new CanceledError();
            }
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.BeforeGridlineColorChange,
        () => commandService.beforeCommandExecuted((commandInfo) => {
          var _a;
          if (commandInfo.id === SetGridlinesColorCommand.id) {
            const target = this.getCommandSheetTarget(commandInfo);
            if (!target) return;
            const eventParams = {
              ...target,
              color: (_a = commandInfo.params) == null ? void 0 : _a.color
            };
            this.fireEvent(this.Event.BeforeGridlineColorChange, eventParams);
            if (eventParams.cancel) {
              throw new CanceledError();
            }
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.BeforeGridlineEnableChange,
        () => commandService.beforeCommandExecuted((commandInfo) => {
          var _a, _b;
          if (commandInfo.id === ToggleGridlinesCommand.id) {
            const target = this.getCommandSheetTarget(commandInfo);
            if (!target) return;
            const showGridlines = (_b = (_a = commandInfo.params) == null ? void 0 : _a.showGridlines) != null ? _b : !target.worksheet.hasHiddenGridLines();
            const eventParams = {
              ...target,
              enabled: Boolean(showGridlines)
            };
            this.fireEvent(this.Event.BeforeGridlineEnableChange, eventParams);
            if (eventParams.cancel) {
              throw new CanceledError();
            }
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.SheetValueChanged,
        () => commandService.onCommandExecuted((commandInfo) => {
          if (COMMAND_LISTENER_VALUE_CHANGE.indexOf(commandInfo.id) > -1) {
            const sheet = this.getActiveSheet();
            if (!sheet) return;
            const ranges = getValueChangedEffectedRange(univerInstanceService, commandInfo).map(
              (range) => {
                var _a, _b;
                return (_b = (_a = this.getWorkbook(range.unitId)) == null ? void 0 : _a.getSheetBySheetId(range.subUnitId)) == null ? void 0 : _b.getRange(range.range);
              }
            ).filter(Boolean);
            if (!ranges.length) return;
            const eventParams = {
              payload: commandInfo,
              effectedRanges: ranges
            };
            this.fireEvent(this.Event.SheetValueChanged, eventParams);
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.SheetCreated,
        () => commandService.onCommandExecuted((commandInfo) => {
          var _a;
          if (commandInfo.id === InsertSheetCommand.id) {
            const params = commandInfo.params;
            const { unitId } = params || {};
            const workbook = unitId ? this.getUniverSheet(unitId) : (_a = this.getActiveWorkbook) == null ? void 0 : _a.call(this);
            if (!workbook) {
              return;
            }
            const worksheet = workbook.getActiveSheet();
            if (!worksheet) {
              return;
            }
            const eventParams = {
              workbook,
              worksheet
            };
            this.fireEvent(this.Event.SheetCreated, eventParams);
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.ActiveSheetChanged,
        () => commandService.onCommandExecuted((commandInfo) => {
          if (commandInfo.id === SetWorksheetActiveOperation.id) {
            const target = this.getActiveSheet();
            if (!target) return;
            const { workbook, worksheet: activeSheet } = target;
            const eventParams = {
              workbook,
              activeSheet
            };
            this.fireEvent(this.Event.ActiveSheetChanged, eventParams);
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.SheetDeleted,
        () => commandService.onCommandExecuted((commandInfo) => {
          var _a;
          if (commandInfo.id === RemoveSheetCommand.id) {
            const { subUnitId: sheetId, unitId } = commandInfo.params;
            const workbook = unitId ? this.getUniverSheet(unitId) : (_a = this.getActiveWorkbook) == null ? void 0 : _a.call(this);
            if (!workbook || !sheetId) return;
            const eventParams = {
              workbook,
              sheetId
            };
            this.fireEvent(this.Event.SheetDeleted, eventParams);
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.SheetMoved,
        () => commandService.onCommandExecuted((commandInfo) => {
          if (commandInfo.id === SetWorksheetOrderMutation.id) {
            const { toOrder: toIndex } = commandInfo.params;
            const target = this.getCommandSheetTarget(commandInfo);
            if (!target) return;
            const { workbook, worksheet } = target;
            const eventParams = {
              workbook,
              worksheet,
              newIndex: toIndex
            };
            this.fireEvent(this.Event.SheetMoved, eventParams);
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.SheetNameChanged,
        () => commandService.onCommandExecuted((commandInfo) => {
          if (commandInfo.id === SetWorksheetNameCommand.id) {
            const { name } = commandInfo.params;
            const target = this.getCommandSheetTarget(commandInfo);
            if (!target) return;
            const { workbook, worksheet } = target;
            const eventParams = {
              workbook,
              worksheet,
              newName: name
            };
            this.fireEvent(this.Event.SheetNameChanged, eventParams);
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.SheetTabColorChanged,
        () => commandService.onCommandExecuted((commandInfo) => {
          if (commandInfo.id === SetTabColorMutation.id) {
            const { color } = commandInfo.params;
            const target = this.getCommandSheetTarget(commandInfo);
            if (!target) return;
            const { workbook, worksheet } = target;
            const eventParams = {
              workbook,
              worksheet,
              newColor: color
            };
            this.fireEvent(this.Event.SheetTabColorChanged, eventParams);
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.SheetHideChanged,
        () => commandService.onCommandExecuted((commandInfo) => {
          if (commandInfo.id === SetWorksheetHideMutation.id) {
            const { hidden } = commandInfo.params;
            const target = this.getCommandSheetTarget(commandInfo);
            if (!target) return;
            const { workbook, worksheet } = target;
            const eventParams = {
              workbook,
              worksheet,
              hidden: Boolean(hidden)
            };
            this.fireEvent(this.Event.SheetHideChanged, eventParams);
          }
        })
      )
    );
    this.disposeWithMe(
      this.registerEventHandler(
        this.Event.GridlineChanged,
        () => commandService.onCommandExecuted((commandInfo) => {
          if (commandInfo.id === SetGridlinesColorCommand.id || commandInfo.id === ToggleGridlinesCommand.id) {
            const target = this.getCommandSheetTarget(commandInfo);
            if (!target) return;
            const eventParams = {
              ...target,
              enabled: !target.worksheet.hasHiddenGridLines(),
              color: target.worksheet.getGridLinesColor()
            };
            this.fireEvent(this.Event.GridlineChanged, eventParams);
          }
        })
      )
    );
    this._initWorkbookEvent(injector);
  }
  createUniverSheet(data, options) {
    const instanceService = this._injector.get(IUniverInstanceService);
    const workbook = instanceService.createUnit(2 /* UNIVER_SHEET */, data, options);
    return this._injector.createInstance(FWorkbook, workbook);
  }
  createWorkbook(data, options) {
    return this.createUniverSheet(data, options);
  }
  getActiveWorkbook() {
    const workbook = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    if (!workbook) {
      return null;
    }
    return this._injector.createInstance(FWorkbook, workbook);
  }
  getActiveUniverSheet() {
    return this.getActiveWorkbook();
  }
  getUniverSheet(id) {
    const workbook = this._univerInstanceService.getUnit(id, 2 /* UNIVER_SHEET */);
    if (!workbook) {
      return null;
    }
    return this._injector.createInstance(FWorkbook, workbook);
  }
  getWorkbook(id) {
    return this.getUniverSheet(id);
  }
  onUniverSheetCreated(callback) {
    const subscription = this._univerInstanceService.getTypeOfUnitAdded$(2 /* UNIVER_SHEET */).subscribe((event) => {
      const fworkbook = this._injector.createInstance(FWorkbook, event.unit);
      callback(fworkbook);
    });
    return toDisposable(subscription);
  }
  getActiveSheet() {
    const workbook = this.getActiveWorkbook();
    if (!workbook) {
      return null;
    }
    const worksheet = workbook.getActiveSheet();
    if (!worksheet) {
      return null;
    }
    return { workbook, worksheet };
  }
  setFreezeSync(enabled) {
    const controller = this._injector.get(SheetsFreezeSyncController);
    controller.setEnabled(enabled);
  }
};
FUniver.extend(FUniverSheetsMixin);

// ../packages/sheets/src/facade/f-enum.ts
var FSheetsEnumMixin = class extends FEnum {
  get SheetValueChangeType() {
    return SheetValueChangeType;
  }
  get SheetSkeletonChangeType() {
    return SheetSkeletonChangeType;
  }
  get SplitDelimiterType() {
    return SplitDelimiterEnum;
  }
  get UnitRole() {
    return UnitRole;
  }
  get WorkbookPermissionPoint() {
    return WorkbookPermissionPoint;
  }
  get WorksheetPermissionPoint() {
    return WorksheetPermissionPoint;
  }
  get RangePermissionPoint() {
    return RangePermissionPoint;
  }
};
FEnum.extend(FSheetsEnumMixin);

// ../packages/sheets/src/facade/f-event.ts
var FSheetsEventNameMixin = class extends FEventName {
  get SheetCreated() {
    return "SheetCreated";
  }
  get BeforeSheetCreate() {
    return "BeforeSheetCreate";
  }
  get WorkbookCreated() {
    return "WorkbookCreated";
  }
  get WorkbookDisposed() {
    return "WorkbookDisposed";
  }
  get GridlineChanged() {
    return "GridlineChanged";
  }
  get BeforeGridlineEnableChange() {
    return "BeforeGridlineEnableChange";
  }
  get BeforeGridlineColorChange() {
    return "BeforeGridlineColorChange";
  }
  get BeforeActiveSheetChange() {
    return "BeforeActiveSheetChange";
  }
  get ActiveSheetChanged() {
    return "ActiveSheetChanged";
  }
  get SheetDeleted() {
    return "SheetDeleted";
  }
  get BeforeSheetDelete() {
    return "BeforeSheetDelete";
  }
  get SheetMoved() {
    return "SheetMoved";
  }
  get BeforeSheetMove() {
    return "BeforeSheetMove";
  }
  get SheetNameChanged() {
    return "SheetNameChanged";
  }
  get BeforeSheetNameChange() {
    return "BeforeSheetNameChange";
  }
  get SheetTabColorChanged() {
    return "SheetTabColorChanged";
  }
  get BeforeSheetTabColorChange() {
    return "BeforeSheetTabColorChange";
  }
  get SheetHideChanged() {
    return "SheetHideChanged";
  }
  get BeforeSheetHideChange() {
    return "BeforeSheetHideChange";
  }
  get SheetValueChanged() {
    return "SheetValueChanged";
  }
};
FEventName.extend(FSheetsEventNameMixin);

// ../packages/sheets/src/facade/f-sheet-hooks.ts
var FSheetHooks = class extends FBase {
  constructor(_injector) {
    super();
    __publicField(this, "_injector", _injector);
  }
};
FSheetHooks = __decorateClass([
  __decorateParam(0, Inject(Injector))
], FSheetHooks);

export {
  FWorksheet,
  FRange,
  FWorkbookPermission,
  FWorkbook,
  FSheetHooks
};
