/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export { UniverSheetsPlugin } from './sheets-plugin';

// #region services
export { COMMAND_LISTENER_SKELETON_CHANGE, COMMAND_LISTENER_VALUE_CHANGE } from './basics/const/command-listener-const';
export {
    type IAddWorksheetMergeMutationParams,
    type IDeleteRangeMutationParams,
    type IInsertColMutationParams,
    type IInsertRangeMutationParams,
    type IInsertRowMutationParams,
    type IInsertSheetMutationParams,
    type IRemoveColMutationParams,
    type IRemoveRowsMutationParams,
    type IRemoveSheetMutationParams,
    type IRemoveWorksheetMergeMutationParams,
} from './basics/interfaces/mutation-interface';
export {
    convertPrimaryWithCoordToPrimary,
    convertSelectionDataToRange,
    type ISelectionWidgetConfig,
    type ISelectionWithCoord,
    type ISelectionWithStyle,
    type ISheetRangeLocation,
    type ISelectionStyle,
    SELECTION_CONTROL_BORDER_BUFFER_COLOR,
    SELECTION_CONTROL_BORDER_BUFFER_WIDTH,
} from './basics/selection';
export { createTopMatrixFromMatrix, createTopMatrixFromRanges, findAllRectangle, rangeMerge, RangeMergeUtil } from './basics/rangeMerge';
export { type IUniverSheetsConfig } from './controllers/config.schema';
export { MAX_CELL_PER_SHEET_KEY } from './controllers/config/config';
export { BorderStyleManagerService, type IBorderInfo } from './services/border-style-manager.service';
export * from './services/permission/permission-point';
export { WorksheetPermissionService } from './services/permission/worksheet-permission/worksheet-permission.service';
export { WorkbookPermissionService } from './services/permission/workbook-permission/workbook-permission.service';
export {
    DISABLE_NORMAL_SELECTIONS,
    IRefSelectionsService,
    RefSelectionsService,
    SelectionMoveType,
    SheetsSelectionsService,
    WorkbookSelectionDataModel,
} from './services/selections';
export { getAddMergeMutationRangeByType } from './controllers/merge-cell.controller';
export { NumfmtService } from './services/numfmt/numfmt.service';
export type { INumfmtItem, INumfmtItemWithCache } from './services/numfmt/type';
export { INumfmtService } from './services/numfmt/type';
export { RefRangeService } from './services/ref-range/ref-range.service';
export type { EffectRefRangeParams, IOperator } from './services/ref-range/type';
export { EffectRefRangId, OperatorType } from './services/ref-range/type';
export { DefinedNameDataController } from './controllers/defined-name-data.controller';
export {
    getSeparateEffectedRangesOnCommand,
    handleBaseInsertRange,
    handleBaseMoveRowsCols,
    handleBaseRemoveRange,
    handleCommonDefaultRangeChangeWithEffectRefCommands,
    handleCommonRangeChangeWithEffectRefCommandsSkipNoInterests,
    handleDefaultRangeChangeWithEffectRefCommands,
    handleDefaultRangeChangeWithEffectRefCommandsSkipNoInterests,
    handleDeleteRangeMoveLeft,
    handleDeleteRangeMoveUp,
    handleInsertCol,
    handleInsertRangeMoveDown,
    handleInsertRangeMoveRight,
    handleInsertRow,
    handleIRemoveCol,
    handleIRemoveRow,
    handleMoveCols,
    handleMoveRange,
    handleMoveRows,
    rotateRange,
    runRefRangeMutations,
} from './services/ref-range/util';
export { InterceptCellContentPriority, INTERCEPTOR_POINT } from './services/sheet-interceptor/interceptor-const';
export { AFTER_CELL_EDIT, AFTER_CELL_EDIT_ASYNC, BEFORE_CELL_EDIT, SheetInterceptorService } from './services/sheet-interceptor/sheet-interceptor.service';
export type { ISheetLocation, ISheetLocationBase, ISheetRowLocation } from './services/sheet-interceptor/utils/interceptor';
export { MERGE_CELL_INTERCEPTOR_CHECK, MergeCellController } from './controllers/merge-cell.controller';
export { AddMergeRedoSelectionsOperationFactory, AddMergeUndoSelectionsOperationFactory } from './commands/utils/handle-merge-operation';

export type { FormatType } from './services/numfmt/type';
export { expandToContinuousRange } from './basics/expand-range';

export { ExclusiveRangeService, IExclusiveRangeService } from './services/exclusive-range/exclusive-range-service';

// permission
export { defaultWorksheetPermissionPoint, getAllWorksheetPermissionPoint, getAllWorksheetPermissionPointByPointPanel } from './services/permission';
export type { IWorksheetProtectionRule } from './services/permission/type';
export { WorksheetProtectionPointModel, WorksheetProtectionRuleModel } from './services/permission/worksheet-permission';
export { defaultWorkbookPermissionPoints, getAllWorkbookPermissionPoint } from './services/permission/workbook-permission';
export {
    WorkbookCommentPermission,
    WorkbookCopyPermission,
    WorkbookCreateProtectPermission,
    WorkbookCreateSheetPermission,
    WorkbookDeleteSheetPermission,
    WorkbookDuplicatePermission,
    WorkbookEditablePermission,
    WorkbookExportPermission,
    WorkbookHideSheetPermission,
    WorkbookHistoryPermission,
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
    WorksheetSelectProtectedCellsPermission,
    WorksheetSelectUnProtectedCellsPermission,
    WorksheetSetCellStylePermission,
    WorksheetSetCellValuePermission,
    WorksheetSetColumnStylePermission,
    WorksheetSetRowStylePermission,
    WorksheetSortPermission,
    WorksheetViewPermission,
} from './services/permission/permission-point';
export { UnitAction, UnitObject } from '@univerjs/protocol';
export { checkRangesEditablePermission } from './services/permission/util';

// range-protection
export { type ICellPermission, RangeProtectionRenderModel } from './model/range-protection-render.model';
export { EditStateEnum, type IModel, type IObjectModel, type IRangeProtectionRule, RangeProtectionRuleModel, ViewStateEnum } from './model/range-protection-rule.model';
export { RangeProtectionCache } from './model/range-protection.cache';
export type { IWorksheetProtectionRenderCellData } from './services/permission/worksheet-permission/type';

export { RangeProtectionRefRangeService } from './services/permission/range-permission/range-protection.ref-range';
export { RangeProtectionService } from './services/permission/range-permission/range-protection.service';
export {
    getAllRangePermissionPoint,
    getDefaultRangePermission,
    type IRangePermissionPoint,
} from './services/permission/range-permission/util';

export { RangeProtectionPermissionEditPoint } from './services/permission/permission-point/range/edit';
export { RangeProtectionPermissionViewPoint } from './services/permission/permission-point/range/view';
export { RangeProtectionPermissionManageCollaPoint } from './services/permission/permission-point/range/manage-collaborator';
export { RangeProtectionPermissionDeleteProtectionPoint } from './services/permission/permission-point/range/delete-protection';
export { baseProtectionActions } from './services/permission/range-permission/util';

export { generateNullCell, generateNullCellValue } from './basics/utils';
export { getSheetCommandTarget, getSheetCommandTargetWorkbook, getSheetMutationTarget } from './commands/commands/utils/target-util';
export { alignToMergedCellsBorders, getCellAtRowCol, isSingleCellSelection, setEndForRange } from './commands/commands/utils/selection-utils';
export { getSelectionsService } from './commands/utils/selection-command-util';
export { followSelectionOperation, getPrimaryForRange } from './commands/commands/utils/selection-utils';
export { handleDeleteRangeMutation } from './commands/utils/handle-range-mutation';
export { getInsertRangeMutations, getRemoveRangeMutations } from './commands/utils/handle-range-mutation';
export { handleInsertRangeMutation } from './commands/utils/handle-range-mutation';
export { type ISheetCommandSharedParams } from './commands/utils/interface';
export { copyRangeStyles } from './commands/commands/utils/selection-utils';

// #region - all commands

export { AddRangeProtectionCommand, type IAddRangeProtectionCommandParams } from './commands/commands/add-range-protection.command';
export { AddWorksheetProtectionCommand } from './commands/commands/add-worksheet-protection.command';
export { SetWorksheetProtectionCommand } from './commands/commands/set-worksheet-protection.command';
export { DeleteWorksheetProtectionCommand } from './commands/commands/delete-worksheet-protection.command';
export {
    addMergeCellsUtil,
    AddWorksheetMergeAllCommand,
    AddWorksheetMergeCommand,
    AddWorksheetMergeHorizontalCommand,
    AddWorksheetMergeVerticalCommand,
} from './commands/commands/add-worksheet-merge.command';
export { ClearSelectionAllCommand } from './commands/commands/clear-selection-all.command';
export { ClearSelectionContentCommand } from './commands/commands/clear-selection-content.command';
export { ClearSelectionFormatCommand } from './commands/commands/clear-selection-format.command';
export { CopySheetCommand } from './commands/commands/copy-worksheet.command';
export type { ICopySheetCommandParams } from './commands/commands/copy-worksheet.command';
export { DeleteRangeMoveLeftCommand, type IDeleteRangeMoveLeftCommandParams } from './commands/commands/delete-range-move-left.command';
export { DeleteRangeMoveUpCommand, type IDeleteRangeMoveUpCommandParams } from './commands/commands/delete-range-move-up.command';
export { DeleteRangeProtectionCommand, type IDeleteRangeProtectionCommandParams } from './commands/commands/delete-range-protection.command';
export { InsertDefinedNameCommand } from './commands/commands/insert-defined-name.command';
export { InsertRangeMoveDownCommand, type InsertRangeMoveDownCommandParams } from './commands/commands/insert-range-move-down.command';
export { InsertRangeMoveRightCommand, type InsertRangeMoveRightCommandParams } from './commands/commands/insert-range-move-right.command';
export { type ISetWorksheetDefaultStyleMutationParams, SetWorksheetDefaultStyleMutation, SetWorksheetDefaultStyleMutationFactory } from './commands/mutations/set-worksheet-default-style.mutation';
export { SetWorksheetDefaultStyleCommand } from './commands/commands/set-worksheet-default-style.command';
export { type ISetRowDataMutationParams, SetRowDataMutation, SetRowDataMutationFactory } from './commands/mutations/set-row-data.mutation';
export { type ISetRowDataCommandParams, SetRowDataCommand } from './commands/commands/set-row-data.command';
export { type ISetColDataMutationParams, SetColDataMutation, SetColDataMutationFactory } from './commands/mutations/set-col-data.mutation';
export { type ISetColDataCommandParams, SetColDataCommand } from './commands/commands/set-col-data.command';
export {
    type IInsertColCommandParams,
    type IInsertRowCommandParams,
    InsertColAfterCommand,
    InsertColBeforeCommand,
    InsertColCommand,
    InsertRowAfterCommand,
    InsertRowBeforeCommand,
    InsertRowCommand,
} from './commands/commands/insert-row-col.command';
export { type IInsertSheetCommandParams, InsertSheetCommand } from './commands/commands/insert-sheet.command';
export { getMoveRangeUndoRedoMutations, type IMoveRangeCommandParams, MoveRangeCommand } from './commands/commands/move-range.command';
export {
    type IMoveColsCommandParams,
    type IMoveRowsCommandParams,
    MoveColsCommand,
    MoveRowsCommand,
} from './commands/commands/move-rows-cols.command';
export { RemoveDefinedNameCommand } from './commands/commands/remove-defined-name.command';
export { type IRemoveRowColCommandInterceptParams, type IRemoveRowColCommandParams, RemoveColCommand, RemoveRowCommand } from './commands/commands/remove-row-col.command';
export { type IRemoveSheetCommandParams, RemoveSheetCommand } from './commands/commands/remove-sheet.command';
export { RemoveWorksheetMergeCommand } from './commands/commands/remove-worksheet-merge.command';
export { type IReorderRangeCommandParams, ReorderRangeCommand } from './commands/commands/reorder-range.command';
export {
    type ISetBorderBasicCommandParams,
    type ISetBorderColorCommandParams,
    type ISetBorderCommandParams,
    type ISetBorderPositionCommandParams,
    type ISetBorderStyleCommandParams,
    SetBorderBasicCommand,
    SetBorderColorCommand,
    SetBorderCommand,
    SetBorderPositionCommand,
    SetBorderStyleCommand,
} from './commands/commands/set-border-command';
export {
    type ISetSpecificColsVisibleCommandParams,
    SetColHiddenCommand,
    SetSelectedColsVisibleCommand,
    SetSpecificColsVisibleCommand,
} from './commands/commands/set-col-visible.command';

export { SetDefinedNameCommand } from './commands/commands/set-defined-name.command';
export { type ICancelFrozenCommandParams, type ISetFrozenCommandParams } from './commands/commands/set-frozen.command';
export { CancelFrozenCommand, SetFrozenCommand } from './commands/commands/set-frozen.command';
export { type IToggleGridlinesCommandParams, ToggleGridlinesCommand } from './commands/commands/toggle-gridlines.command';
export { type ISetRangeValuesCommandParams, SetRangeValuesCommand } from './commands/commands/set-range-values.command';
export {
    type ISetSpecificRowsVisibleCommandParams,
    SetRowHiddenCommand,
    SetSelectedRowsVisibleCommand,
    SetSpecificRowsVisibleCommand,
} from './commands/commands/set-row-visible.command';
export {
    type ISetColorCommandParams,
    type ISetFontFamilyCommandParams,
    type ISetFontSizeCommandParams,
    type ISetHorizontalTextAlignCommandParams,
    type ISetStyleCommandParams,
    type ISetTextRotationCommandParams,
    type ISetTextWrapCommandParams,
    type ISetVerticalTextAlignCommandParams,
    type IStyleTypeValue,
    ResetBackgroundColorCommand,
    ResetTextColorCommand,
    SetBackgroundColorCommand,
    SetBoldCommand,
    SetFontFamilyCommand,
    SetFontSizeCommand,
    SetHorizontalTextAlignCommand,
    SetItalicCommand,
    SetOverlineCommand,
    SetStrikeThroughCommand,
    SetStyleCommand,
    SetTextColorCommand,
    SetTextRotationCommand,
    SetTextWrapCommand,
    SetUnderlineCommand,
    SetVerticalTextAlignCommand,
} from './commands/commands/set-style.command';
export { SetTabColorCommand } from './commands/commands/set-tab-color.command';
export { type ISetWorkbookNameCommandParams, SetWorkbookNameCommand } from './commands/commands/set-workbook-name.command';
export {
    type ISetWorksheetActivateCommandParams,
    SetWorksheetActivateCommand,
} from './commands/commands/set-worksheet-activate.command';
export {
    DeltaColumnWidthCommand,
    type IDeltaColumnWidthCommandParams,
    SetColWidthCommand,
} from './commands/commands/set-worksheet-col-width.command';
export { SetWorksheetHideCommand } from './commands/commands/set-worksheet-hide.command';
export {
    type ISetWorksheetNameCommandParams,
    SetWorksheetNameCommand,
} from './commands/commands/set-worksheet-name.command';
export { SetWorksheetOrderCommand } from './commands/commands/set-worksheet-order.command';
export { SetWorksheetPermissionPointsCommand } from './commands/commands/set-worksheet-permission-points.command';
export { SetWorksheetRightToLeftCommand } from './commands/commands/set-worksheet-right-to-left.command';
export {
    DeltaRowHeightCommand,
    type IDeltaRowHeightCommand,
    type ISetWorksheetRowIsAutoHeightCommandParams,
    SetRowHeightCommand,
    SetWorksheetRowIsAutoHeightCommand,
} from './commands/commands/set-worksheet-row-height.command';
export { SetWorksheetShowCommand } from './commands/commands/set-worksheet-show.command';
export type { ISetWorksheetShowCommandParams } from './commands/commands/set-worksheet-show.command';
export { AddRangeProtectionMutation, FactoryAddRangeProtectionMutation, type IAddRangeProtectionMutationParams } from './commands/mutations/add-range-protection.mutation';
export { SetProtectionCommand } from './commands/commands/set-protection.command';
export { AddMergeUndoMutationFactory, AddWorksheetMergeMutation } from './commands/mutations/add-worksheet-merge.mutation';
export { AddWorksheetProtectionMutation, type IAddWorksheetProtectionParams } from './commands/mutations/add-worksheet-protection.mutation';
export { DeleteRangeProtectionMutation, FactoryDeleteRangeProtectionMutation, type IDeleteRangeProtectionMutationParams } from './commands/mutations/delete-range-protection.mutation';
export { DeleteWorksheetProtectionMutation } from './commands/mutations/delete-worksheet-protection.mutation';
export type { IDeleteWorksheetProtectionParams } from './commands/mutations/delete-worksheet-protection.mutation';
export { EmptyMutation } from './commands/mutations/empty.mutation';
export {
    InsertColMutation,
    InsertColMutationUndoFactory,
    InsertRowMutation,
    InsertRowMutationUndoFactory,
} from './commands/mutations/insert-row-col.mutation';
export { InsertSheetMutation, InsertSheetUndoMutationFactory } from './commands/mutations/insert-sheet.mutation';
export { type IMoveRangeMutationParams, MoveRangeMutation } from './commands/mutations/move-range.mutation';
export {
    type IMoveColumnsMutationParams,
    type IMoveRowsMutationParams,
    MoveColsMutation,
    MoveColsMutationUndoFactory,
    MoveRowsMutation,
    MoveRowsMutationUndoFactory,
} from './commands/mutations/move-rows-cols.mutation';
export {
    factoryRemoveNumfmtUndoMutation,
    factorySetNumfmtUndoMutation,
    type IRemoveNumfmtMutationParams,
    type ISetCellsNumfmt,
    type ISetNumfmtMutationParams,
    RemoveNumfmtMutation,
    SetNumfmtMutation,
    transformCellsToRange,
} from './commands/mutations/numfmt-mutation';
export { RemoveColMutation, RemoveRowMutation } from './commands/mutations/remove-row-col.mutation';
export { RemoveSheetMutation, RemoveSheetUndoMutationFactory } from './commands/mutations/remove-sheet.mutation';
export { RemoveMergeUndoMutationFactory, RemoveWorksheetMergeMutation } from './commands/mutations/remove-worksheet-merge.mutation';
export { type IReorderRangeMutationParams, ReorderRangeMutation, ReorderRangeUndoMutationFactory } from './commands/mutations/reorder-range.mutation';
export {
    type ISetColHiddenMutationParams,
    type ISetColVisibleMutationParams,
    SetColHiddenMutation,
    SetColVisibleMutation,
} from './commands/mutations/set-col-visible.mutation';
export {
    type ISetFrozenMutationParams,
    SetFrozenMutation,
    SetFrozenMutationFactory,
} from './commands/mutations/set-frozen.mutation';
export { type IToggleGridlinesMutationParams, ToggleGridlinesMutation } from './commands/mutations/toggle-gridlines.mutation';
export { FactorySetRangeProtectionMutation, type ISetRangeProtectionMutationParams, SetRangeProtectionMutation } from './commands/mutations/set-range-protection.mutation';
export {
    type ISetRangeValuesMutationParams,
    type ISetRangeValuesRangeMutationParams,
    SetRangeValuesMutation,
    SetRangeValuesUndoMutationFactory,
} from './commands/mutations/set-range-values.mutation';
export {
    type ISetRowHiddenMutationParams,
    type ISetRowVisibleMutationParams,
    SetRowHiddenMutation,
    SetRowVisibleMutation,
} from './commands/mutations/set-row-visible.mutation';
export { type ISetTabColorMutationParams, SetTabColorMutation } from './commands/mutations/set-tab-color.mutation';
export { type ISetWorkbookNameMutationParams, SetWorkbookNameMutation } from './commands/mutations/set-workbook-name.mutation';
export {
    type ISetWorksheetColWidthMutationParams,
    SetWorksheetColWidthMutation,
    SetWorksheetColWidthMutationFactory,
} from './commands/mutations/set-worksheet-col-width.mutation';
export { type ISetWorksheetHideMutationParams, SetWorksheetHideMutation } from './commands/mutations/set-worksheet-hide.mutation';
export { type ISetWorksheetNameMutationParams, SetWorksheetNameMutation } from './commands/mutations/set-worksheet-name.mutation';
export { type ISetWorksheetOrderMutationParams, SetWorksheetOrderMutation } from './commands/mutations/set-worksheet-order.mutation';
export { SetWorksheetPermissionPointsMutation } from './commands/mutations/set-worksheet-permission-points.mutation';
export type { ISetWorksheetPermissionPointsMutationParams } from './commands/mutations/set-worksheet-permission-points.mutation';
export { SetWorksheetProtectionMutation } from './commands/mutations/set-worksheet-protection.mutation';
export type { ISetWorksheetProtectionParams } from './commands/mutations/set-worksheet-protection.mutation';
export { SetWorksheetRightToLeftMutation } from './commands/mutations/set-worksheet-right-to-left.mutation';
export {
    type ISetWorksheetRowAutoHeightMutationParams,
    type ISetWorksheetRowHeightMutationParams,
    type ISetWorksheetRowIsAutoHeightMutationParams,

    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowAutoHeightMutationFactory,
    SetWorksheetRowHeightMutation,
    SetWorksheetRowIsAutoHeightMutation,
} from './commands/mutations/set-worksheet-row-height.mutation';

export { ScrollToCellOperation } from './commands/operations/scroll-to-cell.operation';
export { type ISetSelectionsOperationParams, SetSelectionsOperation } from './commands/operations/selection.operation';
export { type ISetWorksheetActiveOperationParams, SetWorksheetActiveOperation } from './commands/operations/set-worksheet-active.operation';
export { type IToggleCellCheckboxCommandParams, ToggleCellCheckboxCommand } from './commands/commands/toggle-checkbox.command';

// #endregion
