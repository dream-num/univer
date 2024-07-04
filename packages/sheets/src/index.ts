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

export { type IUniverSheetsConfig, UniverSheetsPlugin } from './sheets-plugin';

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
    getNormalSelectionStyle,
    type ISelectionStyle,
    type ISelectionWidgetConfig,
    type ISelectionWithCoordAndStyle,
    type ISelectionWithStyle,
    type ISheetRangeLocation,
    SELECTION_CONTROL_BORDER_BUFFER_COLOR,
    SELECTION_CONTROL_BORDER_BUFFER_WIDTH,
    transformCellDataToSelectionData,
} from './basics/selection';
export { rangeMerge, createTopMatrixFromRanges, createTopMatrixFromMatrix, findAllRectangle, RangeMergeUtil } from './basics/rangeMerge';
export { getSheetCommandTarget, getSheetCommandTargetWorkbook, getSheetMutationTarget } from './commands/commands/utils/target-util';
export { alignToMergedCellsBorders, getCellAtRowCol, setEndForRange, isSingleCellSelection } from './commands/commands/utils/selection-utils';
export { getSelectionsService } from './commands/utils/selection-command-util';
export { followSelectionOperation, getPrimaryForRange } from './commands/commands/utils/selection-utils';
export { handleDeleteRangeMutation } from './commands/utils/handle-range-mutation';
export { getInsertRangeMutations, getRemoveRangeMutations } from './commands/utils/handle-range-mutation';
export { handleInsertRangeMutation } from './commands/utils/handle-range-mutation';
export { type ISheetCommandSharedParams } from './commands/utils/interface';
export { MAX_CELL_PER_SHEET_KEY } from './controllers/config/config';
export { BorderStyleManagerService, type IBorderInfo } from './services/border-style-manager.service';
export * from './services/permission/permission-point';
export { WorksheetPermissionService } from './services/permission/worksheet-permission/worksheet-permission.service';
export { WorkbookPermissionService } from './services/permission/workbook-permission/workbook-permission.service';
export {
    SheetsSelectionsService,
    WorkbookSelections,
    SelectionMoveType,
    DISABLE_NORMAL_SELECTIONS,
} from './services/selections/selection-manager.service';
export { IRefSelectionsService } from './services/selections/ref-selections.service';

export { getAddMergeMutationRangeByType } from './controllers/merge-cell.controller';
export { NumfmtService } from './services/numfmt/numfmt.service';
export type { INumfmtItem, INumfmtItemWithCache } from './services/numfmt/type';
export { INumfmtService } from './services/numfmt/type';
export { RefRangeService } from './services/ref-range/ref-range.service';
export type { EffectRefRangeParams, IOperator } from './services/ref-range/type';
export { EffectRefRangId, OperatorType } from './services/ref-range/type';
export { DefinedNameDataController } from './controllers/defined-name-data.controller';
export {
    handleBaseInsertRange,
    handleBaseMoveRowsCols,
    handleBaseRemoveRange,
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
    handleCommonDefaultRangeChangeWithEffectRefCommands,
    handleDefaultRangeChangeWithEffectRefCommands,
    handleDefaultRangeChangeWithEffectRefCommandsSkipNoInterests,
} from './services/ref-range/util';
export { INTERCEPTOR_POINT } from './services/sheet-interceptor/interceptor-const';
export { SheetInterceptorService } from './services/sheet-interceptor/sheet-interceptor.service';
export type { ISheetLocation, ISheetLocationBase, ISheetRowLocation } from './services/sheet-interceptor/utils/interceptor';
export { MergeCellController } from './controllers/merge-cell.controller';
export { AddMergeRedoSelectionsOperationFactory, AddMergeUndoSelectionsOperationFactory } from './commands/utils/handle-merge-operation';

export type { FormatType } from './services/numfmt/type';
export { expandToContinuousRange } from './basics/utils';

// permission
export { defaultWorksheetPermissionPoint, getAllWorksheetPermissionPoint, getAllWorksheetPermissionPointByPointPanel } from './services/permission';
export type { IWorksheetProtectionRule } from './services/permission/type';
export { WorksheetProtectionRuleModel, WorksheetProtectionPointModel } from './services/permission/worksheet-permission';
export { getAllWorkbookPermissionPoint, defaultWorkbookPermissionPoints } from './services/permission/workbook-permission';
export {
    WorksheetCopyPermission,
    WorksheetSelectProtectedCellsPermission,
    WorksheetSelectUnProtectedCellsPermission,
    WorksheetSetCellStylePermission,
    WorksheetSetCellValuePermission,
    WorksheetViewPermission,
    WorksheetSetRowStylePermission,
    WorksheetSetColumnStylePermission,
    WorksheetInsertRowPermission,
    WorksheetInsertColumnPermission,
    WorksheetInsertHyperlinkPermission,
    WorksheetDeleteRowPermission,
    WorksheetDeleteColumnPermission,
    WorksheetSortPermission,
    WorksheetFilterPermission,
    WorksheetPivotTablePermission,
    WorksheetEditExtraObjectPermission,
    WorksheetManageCollaboratorPermission,
    WorksheetEditPermission,

    WorkbookCommentPermission,
    WorkbookEditablePermission,
    WorkbookDuplicatePermission,
    WorkbookPrintPermission,
    WorkbookExportPermission,
    WorkbookMoveSheetPermission,
    WorkbookDeleteSheetPermission,
    WorkbookHideSheetPermission,
    WorkbookRenameSheetPermission,
    WorkbookCreateSheetPermission,
    WorkbookHistoryPermission,
    WorkbookViewPermission,
    WorkbookSharePermission,
    WorkbookCopyPermission,
    WorkbookManageCollaboratorPermission,
} from './services/permission/permission-point';

// range-protection
export { RangeProtectionRenderModel, type ICellPermission } from './model/range-protection-render.model';
export { RangeProtectionRuleModel, type IObjectModel, type IRangeProtectionRule, type IModel } from './model/range-protection-rule.model';
export type { IWorksheetProtectionRenderCellData } from './services/permission/worksheet-permission/type';

export { RangeProtectionRefRangeService } from './services/permission/range-permission/range-protection.ref-range';
export { RangeProtectionService } from './services/permission/range-permission/range-protection.service';
export {
    type IRangePermissionPoint,
    getAllRangePermissionPoint,
    getDefaultRangePermission,
} from './services/permission/range-permission/util';

export { RangeProtectionPermissionEditPoint } from './services/permission/permission-point/range/edit';
export { RangeProtectionPermissionViewPoint } from './services/permission/permission-point/range/view';

export { generateNullCellValue } from './basics/utils';

// #region - all commands

export { AddRangeProtectionCommand, type IAddRangeProtectionCommandParams } from './commands/commands/add-range-protection.command';
export {
    AddWorksheetMergeCommand,
    AddWorksheetMergeAllCommand,
    AddWorksheetMergeVerticalCommand,
    AddWorksheetMergeHorizontalCommand,
} from './commands/commands/add-worksheet-merge.command';
export { ClearSelectionAllCommand } from './commands/commands/clear-selection-all.command';
export { ClearSelectionContentCommand } from './commands/commands/clear-selection-content.command';
export { ClearSelectionFormatCommand } from './commands/commands/clear-selection-format.command';
export { CopySheetCommand } from './commands/commands/copy-worksheet.command';
export { DeleteRangeMoveLeftCommand, type IDeleteRangeMoveLeftCommandParams } from './commands/commands/delete-range-move-left.command';
export { DeleteRangeMoveUpCommand, type IDeleteRangeMoveUpCommandParams } from './commands/commands/delete-range-move-up.command';
export { DeleteRangeProtectionCommand, type IDeleteRangeProtectionCommandParams } from './commands/commands/delete-range-protection.command';
export { InsertDefinedNameCommand } from './commands/commands/insert-defined-name.command';
export { InsertRangeMoveDownCommand, type InsertRangeMoveDownCommandParams } from './commands/commands/insert-range-move-down.command';
export { InsertRangeMoveRightCommand, type InsertRangeMoveRightCommandParams } from './commands/commands/insert-range-move-right.command';
export {
    InsertRowCommand,
    InsertRowBeforeCommand,
    InsertRowAfterCommand,
    InsertColCommand,
    InsertColBeforeCommand,
    InsertColAfterCommand,
    type IInsertRowCommandParams,
    type IInsertColCommandParams,
} from './commands/commands/insert-row-col.command';
export { InsertSheetCommand, type IInsertSheetCommandParams } from './commands/commands/insert-sheet.command';
export { MoveRangeCommand, getMoveRangeUndoRedoMutations, type IMoveRangeCommandParams } from './commands/commands/move-range.command';
export {
    MoveRowsCommand,
    MoveColsCommand,
    type IMoveRowsCommandParams,
    type IMoveColsCommandParams,
} from './commands/commands/move-rows-cols.command';
export { RemoveDefinedNameCommand } from './commands/commands/remove-defined-name.command';
export { RemoveRowCommand, RemoveColCommand, type IRemoveRowColCommandParams } from './commands/commands/remove-row-col.command';
export { RemoveSheetCommand, type IRemoveSheetCommandParams } from './commands/commands/remove-sheet.command';
export { RemoveWorksheetMergeCommand } from './commands/commands/remove-worksheet-merge.command';
export { ReorderRangeCommand, type IReorderRangeCommandParams } from './commands/commands/reorder-range.command';
export {
    SetBorderBasicCommand,
    SetBorderPositionCommand,
    SetBorderStyleCommand,
    SetBorderColorCommand,
    SetBorderCommand,
    type ISetBorderBasicCommandParams,
    type ISetBorderPositionCommandParams,
    type ISetBorderStyleCommandParams,
    type ISetBorderColorCommandParams,
    type ISetBorderCommandParams,
} from './commands/commands/set-border-command';
export {
    SetSpecificColsVisibleCommand,
    SetSelectedColsVisibleCommand,
    SetColHiddenCommand,
    type ISetSpecificColsVisibleCommandParams,
} from './commands/commands/set-col-visible.command';
export { SetDefinedNameCommand, type ISetDefinedNameCommandParams } from './commands/commands/set-defined-name.command';
export { SetFrozenCancelCommand } from './commands/commands/set-frozen-cancel.command';
export { SetFrozenCommand } from './commands/commands/set-frozen.command';
export { SetHideGridlinesCommand } from './commands/commands/set-hide-gridlines.command';
export { SetRangeProtectionCommand, type ISetRangeProtectionCommandParams } from './commands/commands/set-range-protection.command';
export { SetRangeValuesCommand, type ISetRangeValuesCommandParams } from './commands/commands/set-range-values.command';
export {
    SetSpecificRowsVisibleCommand,
    SetSelectedRowsVisibleCommand,
    SetRowHiddenCommand,
    type ISetSpecificRowsVisibleCommandParams,
} from './commands/commands/set-row-visible.command';
export {
    SetStyleCommand,
    SetBoldCommand,
    SetItalicCommand,
    SetUnderlineCommand,
    SetStrikeThroughCommand,
    SetOverlineCommand,
    SetFontFamilyCommand,
    SetFontSizeCommand,
    SetTextColorCommand,
    ResetTextColorCommand,
    SetBackgroundColorCommand,
    ResetBackgroundColorCommand,
    SetVerticalTextAlignCommand,
    SetHorizontalTextAlignCommand,
    SetTextWrapCommand,
    SetTextRotationCommand,
    type ISetColorCommandParams,
    type ISetFontFamilyCommandParams,
    type ISetFontSizeCommandParams,
    type ISetHorizontalTextAlignCommandParams,
    type ISetStyleCommandParams,
    type ISetTextRotationCommandParams,
    type ISetTextWrapCommandParams,
    type ISetVerticalTextAlignCommandParams,
    type IStyleTypeValue,
} from './commands/commands/set-style.command';
export { SetTabColorCommand } from './commands/commands/set-tab-color.command';
export { SetWorkbookNameCommand, type ISetWorkbookNameCommandParams } from './commands/commands/set-workbook-name.command';
export {
    SetWorksheetActivateCommand,
    type ISetWorksheetActivateCommandParams,
} from './commands/commands/set-worksheet-activate.command';
export {
    DeltaColumnWidthCommand,
    SetColWidthCommand,
    type IDeltaColumnWidthCommandParams,
} from './commands/commands/set-worksheet-col-width.command';
export { SetWorksheetHideCommand } from './commands/commands/set-worksheet-hide.command';
export {
    SetWorksheetNameCommand,
    type ISetWorksheetNameCommandParams,
} from './commands/commands/set-worksheet-name.command';
export { SetWorksheetOrderCommand } from './commands/commands/set-worksheet-order.command';
export { SetWorksheetPermissionPointsCommand } from './commands/commands/set-worksheet-permission-points.command';
export { SetWorksheetRightToLeftCommand } from './commands/commands/set-worksheet-right-to-left.command';
export {
    DeltaRowHeightCommand,
    SetRowHeightCommand,
    SetWorksheetRowIsAutoHeightCommand,
    type IDeltaRowHeightCommand,
    type ISetWorksheetRowIsAutoHeightCommandParams,
} from './commands/commands/set-worksheet-row-height.command';
export { SetWorksheetShowCommand } from './commands/commands/set-worksheet-show.command';
export { AddRangeProtectionMutation, FactoryAddRangeProtectionMutation, type IAddRangeProtectionMutationParams } from './commands/mutations/add-range-protection.mutation';
export { AddWorksheetMergeMutation, AddMergeUndoMutationFactory } from './commands/mutations/add-worksheet-merge.mutation';
export { AddWorksheetProtectionMutation, type IAddWorksheetProtectionParams } from './commands/mutations/add-worksheet-protection.mutation';
export { DeleteRangeProtectionMutation, FactoryDeleteRangeProtectionMutation, type IDeleteSelectionProtectionMutationParams } from './commands/mutations/delete-range-protection.mutation';
export { DeleteWorksheetProtectionMutation } from './commands/mutations/delete-worksheet-protection.mutation';
export { EmptyMutation } from './commands/mutations/empty.mutation';
export {
    InsertRowMutation,
    InsertColMutation,
    InsertRowMutationUndoFactory,
    InsertColMutationUndoFactory,
} from './commands/mutations/insert-row-col.mutation';
export { InsertSheetMutation, InsertSheetUndoMutationFactory } from './commands/mutations/insert-sheet.mutation';
export { MoveRangeMutation, type IMoveRangeMutationParams } from './commands/mutations/move-range.mutation';
export {
    MoveRowsMutation,
    MoveColsMutation,
    MoveRowsMutationUndoFactory,
    MoveColsMutationUndoFactory,
    type IMoveRowsMutationParams,
    type IMoveColumnsMutationParams,
} from './commands/mutations/move-rows-cols.mutation';
export {
    SetNumfmtMutation,
    RemoveNumfmtMutation,
    factorySetNumfmtUndoMutation,
    factoryRemoveNumfmtUndoMutation,
    transformCellsToRange,
    type ISetNumfmtMutationParams,
    type IRemoveNumfmtMutationParams,
    type ISetCellsNumfmt,
} from './commands/mutations/numfmt-mutation';
export { RemoveRowMutation, RemoveColMutation } from './commands/mutations/remove-row-col.mutation';
export { RemoveSheetMutation, RemoveSheetUndoMutationFactory } from './commands/mutations/remove-sheet.mutation';
export { RemoveWorksheetMergeMutation, RemoveMergeUndoMutationFactory } from './commands/mutations/remove-worksheet-merge.mutation';
export { ReorderRangeMutation, ReorderRangeUndoMutationFactory, type IReorderRangeMutationParams } from './commands/mutations/reorder-range.mutation';
export {
    SetColHiddenMutation,
    SetColVisibleMutation,
    type ISetColHiddenMutationParams,
    type ISetColVisibleMutationParams,
} from './commands/mutations/set-col-visible.mutation';
export {
    SetFrozenMutation,
    SetFrozenMutationFactory,
    type ISetFrozenMutationParams,
} from './commands/mutations/set-frozen.mutation';
export { SetHideGridlinesMutation } from './commands/mutations/set-hide-gridlines.mutatiom';
export { SetRangeProtectionMutation, FactorySetRangeProtectionMutation, type ISetRangeProtectionMutationParams } from './commands/mutations/set-range-protection.mutation';
export {
    SetRangeValuesMutation,
    SetRangeValuesUndoMutationFactory,
    type ISetRangeValuesMutationParams,
    type ISetRangeValuesRangeMutationParams,
} from './commands/mutations/set-range-values.mutation';
export {
    SetRowVisibleMutation,
    SetRowHiddenMutation,
    type ISetRowVisibleMutationParams,
    type ISetRowHiddenMutationParams,
} from './commands/mutations/set-row-visible.mutation';
export { SetTabColorMutation, type ISetTabColorMutationParams } from './commands/mutations/set-tab-color.mutation';
export { SetWorkbookNameMutation, type ISetWorkbookNameMutationParams } from './commands/mutations/set-workbook-name.mutation';
export {
    SetWorksheetColWidthMutation,
    SetWorksheetColWidthMutationFactory,
    type ISetWorksheetColWidthMutationParams,
} from './commands/mutations/set-worksheet-col-width.mutation';
export { SetWorksheetHideMutation, type ISetWorksheetHideMutationParams } from './commands/mutations/set-worksheet-hide.mutation';
export { SetWorksheetNameMutation, type ISetWorksheetNameMutationParams } from './commands/mutations/set-worksheet-name.mutation';
export { SetWorksheetOrderMutation, type ISetWorksheetOrderMutationParams } from './commands/mutations/set-worksheet-order.mutation';
export { SetWorksheetPermissionPointsMutation } from './commands/mutations/set-worksheet-permission-points.mutation';
export { SetWorksheetProtectionMutation } from './commands/mutations/set-worksheet-protection.mutation';
export { SetWorksheetRightToLeftMutation } from './commands/mutations/set-worksheet-right-to-left.mutation';
export {
    SetWorksheetRowHeightMutation,
    SetWorksheetRowIsAutoHeightMutation,
    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowAutoHeightMutationFactory,
    type ISetWorksheetRowHeightMutationParams,
    type ISetWorksheetRowIsAutoHeightMutationParams,
    type ISetWorksheetRowAutoHeightMutationParams,
} from './commands/mutations/set-worksheet-row-height.mutation';

export { ScrollToCellOperation } from './commands/operations/scroll-to-cell.operation';
export { SetSelectionsOperation, type ISetSelectionsOperationParams } from './commands/operations/selection.operation';
export { SetWorksheetActiveOperation, type ISetWorksheetActiveOperationParams } from './commands/operations/set-worksheet-active.operation';

// #endregion
