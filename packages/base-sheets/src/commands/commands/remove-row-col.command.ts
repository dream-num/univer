import {
    CommandType,
    Dimension,
    ICommand,
    ICommandService,
    ICurrentUniverService,
    IRange,
    IUndoRedoService,
    Nullable,
    Rectangle,
    sequenceExecute,
    Tools,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    IAddWorksheetMergeMutationParams,
    IDeleteRangeMutationParams,
    IInsertColMutationParams,
    IInsertRangeMutationParams,
    IInsertRowMutationParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../../Basics/Interfaces/MutationInterface';
import { SelectionManagerService } from '../../services/selection-manager.service';
import { AddWorksheetMergeMutation, AddWorksheetMergeMutationFactory } from '../mutations/add-worksheet-merge.mutation';
import { DeleteRangeMutation, DeleteRangeUndoMutationFactory } from '../mutations/delete-range.mutation';
import { InsertRangeMutation } from '../mutations/insert-range.mutation';
import { InsertColMutation, InsertRowMutation } from '../mutations/insert-row-col.mutation';
import {
    IRemoveColMutationFactory,
    RemoveColMutation,
    RemoveRowMutation,
    RemoveRowsMutationFactory,
} from '../mutations/remove-row-col.mutation';
import {
    RemoveWorksheetMergeMutation,
    RemoveWorksheetMergeMutationFactory,
} from '../mutations/remove-worksheet-merge.mutation';

/**
 * This command would remove the selected rows. These selected rows can be non-continuous.
 */
export const RemoveRowCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.remove-row',
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelections();
        if (!selections?.length) {
            return false;
        }

        const currentUniverService = accessor.get(ICurrentUniverService);
        const workbook = currentUniverService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();

        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();
        const ranges = selections.map((s) => Rectangle.clone(s.range));
        const lastColumnIndex = worksheet.getMaxColumns() - 1;
        ranges.forEach((item) => {
            item.startColumn = 0;
            item.endColumn = lastColumnIndex;
        });

        // row count
        const removeRowsParams: IRemoveRowsMutationParams = {
            workbookId,
            worksheetId,
            ranges,
        };
        const undoRemoveRowsParams: IInsertRowMutationParams = RemoveRowsMutationFactory(removeRowsParams, worksheet);

        // cells' contents
        const deleteRangeValueParams: IDeleteRangeMutationParams = {
            workbookId,
            worksheetId,
            ranges,
            shiftDimension: Dimension.ROWS,
        };
        const undoDeleteRangeValueParams: Nullable<IInsertRangeMutationParams> = DeleteRangeUndoMutationFactory(
            accessor,
            deleteRangeValueParams
        );

        if (!undoDeleteRangeValueParams) return false;

        // adjust merged cells
        const mergeData: IRange[] = Tools.deepClone(worksheet.getMergeData());
        for (let i = 0; i < mergeData.length; i++) {
            const merge = mergeData[i];
            const { startRow: mergeStartRow, endRow: mergeEndRow } = merge;
            const mergedCellRowCount = mergeEndRow - mergeStartRow + 1;
            for (let j = 0; j < ranges.length; j++) {
                const { startRow, endRow } = ranges[j];
                const count = endRow - startRow + 1;
                if (endRow < mergeStartRow) {
                    // this merged cell should be moved up
                    merge.startRow -= count;
                    merge.endRow -= count;
                } else if (startRow > mergeEndRow) {
                    // this merged cell would not be affected
                    continue;
                } else if (startRow <= mergeStartRow && endRow >= mergeEndRow) {
                    // this merged cell should be removed
                    mergeData.splice(i, 1);
                    i--;
                } else {
                    const intersects = Rectangle.getIntersects(ranges[j], merge)!;
                    const interLength = intersects.endRow - intersects.startRow + 1;

                    if (interLength === mergedCellRowCount - 1) {
                        // if the merged cell's row count is reduced to 1 we should remove it as a merged cell
                        mergeData.splice(i, 1);
                        i--;
                    } else {
                        // otherwise we only need to shrink the merged cell's row count
                        merge.endRow -= intersects.endRow - intersects.startRow + 1;
                    }
                }
            }
        }
        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: Tools.deepClone(worksheet.getMergeData()),
        };
        const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams = RemoveWorksheetMergeMutationFactory(
            accessor,
            removeMergeMutationParams
        );
        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: mergeData,
        };
        const deleteMergeMutationParams: IRemoveWorksheetMergeMutationParams = AddWorksheetMergeMutationFactory(
            accessor,
            addMergeMutationParams
        );

        const commandService = accessor.get(ICommandService);
        const result = await sequenceExecute(
            [
                { id: DeleteRangeMutation.id, params: deleteRangeValueParams },
                { id: RemoveRowMutation.id, params: removeRowsParams },
                { id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams },
                { id: AddWorksheetMergeMutation.id, params: addMergeMutationParams },
            ],
            commandService
        );

        if (result.result) {
            accessor.get(IUndoRedoService).pushUndoRedo({
                URI: workbookId,
                undo: async () => {
                    const undoResult = await sequenceExecute(
                        [
                            { id: InsertRowMutation.id, params: undoRemoveRowsParams },
                            { id: InsertRangeMutation.id, params: undoDeleteRangeValueParams },
                            { id: RemoveWorksheetMergeMutation.id, params: deleteMergeMutationParams },
                            { id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams },
                        ],
                        commandService
                    );
                    return undoResult.result;
                },
                redo: async () => {
                    const result = await sequenceExecute(
                        [
                            { id: DeleteRangeMutation.id, params: deleteRangeValueParams },
                            { id: RemoveRowMutation.id, params: removeRowsParams },
                            { id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams },
                            { id: AddWorksheetMergeMutation.id, params: addMergeMutationParams },
                        ],
                        commandService
                    );

                    return result.result;
                },
            });
            return true;
        }
        return false;
    },
};

/**
 * This command would remove the selected columns. These selected rows can be non-continuous.
 */
export const RemoveColCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.remove-col',
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelections();
        if (!selections?.length) {
            return false;
        }

        const currentUniverService = accessor.get(ICurrentUniverService);
        const workbook = currentUniverService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();

        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();
        const ranges = selections.map((s) => Rectangle.clone(s.range));
        const lastRowIndex = worksheet.getMaxRows() - 1;
        ranges.forEach((item) => {
            item.startRow = 0;
            item.endRow = lastRowIndex;
        });

        // col count
        const removeColParams: IRemoveColMutationParams = {
            workbookId,
            worksheetId,
            ranges,
        };
        const undoRemoveColParams: IInsertColMutationParams = IRemoveColMutationFactory(accessor, removeColParams);

        // cells' contents
        const removeRangeValuesParams: IDeleteRangeMutationParams = {
            workbookId,
            worksheetId,
            ranges,
            shiftDimension: Dimension.COLUMNS,
        };
        const undoRemoveRangeValuesParams: Nullable<IInsertRangeMutationParams> = DeleteRangeUndoMutationFactory(
            accessor,
            removeRangeValuesParams
        );
        if (!undoRemoveRangeValuesParams) {
            throw new Error();
        }

        // adjust merged cells
        const mergeData: IRange[] = Tools.deepClone(worksheet.getMergeData());
        for (let i = 0; i < mergeData.length; i++) {
            const merge = mergeData[i];
            const { startColumn: mergeStartColumn, endColumn: mergeEndColumn } = merge;
            const mergedCellColumnCount = mergeEndColumn - mergeStartColumn + 1;
            for (let j = 0; j < ranges.length; j++) {
                const { startColumn, endColumn } = ranges[j];
                const count = endColumn - startColumn + 1;
                if (endColumn < merge.startColumn) {
                    merge.startColumn -= count;
                    merge.endColumn -= count;
                } else if (startColumn > merge.endColumn) {
                    continue;
                } else if (startColumn <= merge.startColumn && endColumn >= merge.endColumn) {
                    mergeData.splice(i, 1);
                    i--;
                } else {
                    const intersects = Rectangle.getIntersects(ranges[j], merge)!;
                    const interLength = intersects.endColumn - intersects.startColumn + 1;

                    if (interLength === mergedCellColumnCount - 1) {
                        mergeData.splice(i, 1);
                        i--;
                    } else {
                        merge.endColumn -= intersects.endColumn - intersects.startColumn + 1;
                    }
                }
            }
        }
        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: Tools.deepClone(worksheet.getMergeData()),
        };
        const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams = RemoveWorksheetMergeMutationFactory(
            accessor,
            removeMergeMutationParams
        );
        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: mergeData,
        };
        const undoAddMergeParams: IRemoveWorksheetMergeMutationParams = AddWorksheetMergeMutationFactory(
            accessor,
            addMergeMutationParams
        );

        const commandService = accessor.get(ICommandService);
        const result = await sequenceExecute(
            [
                { id: RemoveColMutation.id, params: removeColParams },
                { id: DeleteRangeMutation.id, params: removeRangeValuesParams },
                { id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams },
                { id: AddWorksheetMergeMutation.id, params: addMergeMutationParams },
            ],
            commandService
        );

        if (result.result) {
            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo: async () => {
                    const undoResult = await sequenceExecute(
                        [
                            { id: InsertColMutation.id, params: undoRemoveColParams },
                            { id: InsertRangeMutation.id, params: undoRemoveRangeValuesParams },
                            { id: RemoveWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams },
                            { id: AddWorksheetMergeMutation.id, params: undoAddMergeParams },
                        ],
                        commandService
                    );
                    return undoResult.result;
                },
                redo: async () => {
                    const result = await sequenceExecute(
                        [
                            { id: RemoveColMutation.id, params: removeColParams },
                            { id: DeleteRangeMutation.id, params: removeRangeValuesParams },
                            { id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams },
                            { id: AddWorksheetMergeMutation.id, params: addMergeMutationParams },
                        ],
                        commandService
                    );
                    return result.result;
                },
            });

            return true;
        }
        return false;
    },
};
