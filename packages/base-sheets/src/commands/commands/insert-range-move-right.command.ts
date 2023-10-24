import {
    BooleanNumber,
    CommandType,
    Dimension,
    ICellData,
    IColumnData,
    ICommand,
    ICommandInfo,
    ICommandService,
    ILogService,
    IRange,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectArray,
    ObjectMatrix,
    Rectangle,
    sequenceExecute,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    IAddWorksheetMergeMutationParams,
    IDeleteRangeMutationParams,
    IInsertColMutationParams,
    IInsertRangeMutationParams,
    IRemoveColMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../../Basics/Interfaces/MutationInterface';
import { SelectionManagerService } from '../../services/selection/selection-manager.service';
import { AddMergeUndoMutationFactory, AddWorksheetMergeMutation } from '../mutations/add-worksheet-merge.mutation';
import { DeleteRangeMutation } from '../mutations/delete-range.mutation';
import { InsertRangeMutation, InsertRangeUndoMutationFactory } from '../mutations/insert-range.mutation';
import { InsertColMutation, InsertColMutationUndoFactory } from '../mutations/insert-row-col.mutation';
import { RemoveColMutation } from '../mutations/remove-row-col.mutation';
import {
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
} from '../mutations/remove-worksheet-merge.mutation';
import { calculateTotalLength, IInterval } from './utils/selection-util';

/**
 * The command to insert range.
 */
export const InsertRangeMoveRightCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-range-move-right',

    handler: async (accessor: IAccessor) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const logService = accessor.get(ILogService);
        const selectionManagerService = accessor.get(SelectionManagerService);

        if (selectionManagerService.isOverlapping()) {
            // TODO@Dushusir: use Dialog after Dialog component completed
            logService.error('Cannot use that command on overlapping selections.');
            return false;
        }

        const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
        const range = selectionManagerService.getRangeDatas();
        if (!range?.length) return false;

        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const redoMutations: ICommandInfo[] = [];
        const undoMutations: ICommandInfo[] = [];

        // 1. insert range
        const cellValue = new ObjectMatrix<ICellData>();
        for (let i = 0; i < range.length; i++) {
            const { startRow, endRow, startColumn, endColumn } = range[i];

            for (let r = startRow; r <= endRow; r++) {
                for (let c = startColumn; c <= endColumn; c++) {
                    cellValue.setValue(r, c, { m: '', v: '' });
                }
            }
        }

        const insertRangeMutationParams: IInsertRangeMutationParams = {
            ranges: range,
            worksheetId,
            workbookId,
            shiftDimension: Dimension.COLUMNS,
            cellValue: cellValue.getData(),
        };

        redoMutations.push({ id: InsertRangeMutation.id, params: insertRangeMutationParams });

        const deleteRangeMutationParams: IDeleteRangeMutationParams = InsertRangeUndoMutationFactory(
            accessor,
            insertRangeMutationParams
        );

        undoMutations.push({ id: DeleteRangeMutation.id, params: deleteRangeMutationParams });

        // 2. insert column
        // Only required when the last column has a value, and the column width is set to the column width of the last column
        let hasValueInLastColumn = false;
        let lastColumnWidth = 0;
        const lastColumnIndex = worksheet.getMaxColumns() - 1;
        const columnsObject: IInterval = {};
        for (let i = 0; i < range.length; i++) {
            const { startRow, endRow, startColumn, endColumn } = range[i];

            columnsObject[`${i}`] = [startColumn, endColumn];
            for (let row = startRow; row <= endRow; row++) {
                const lastCell = worksheet.getCell(row, lastColumnIndex);
                const lastCellValue = lastCell?.v;
                if (lastCellValue && lastCellValue !== '') {
                    hasValueInLastColumn = true;
                    lastColumnWidth = worksheet.getColumnWidth(lastColumnIndex);
                    break;
                }
            }
        }

        // There may be overlap and deduplication is required
        const columnsCount = calculateTotalLength(columnsObject);
        if (hasValueInLastColumn) {
            const lastColumnRange = {
                startRow: range[0].startRow,
                endRow: range[0].endRow,
                startColumn: lastColumnIndex,
                endColumn: lastColumnIndex,
            };
            const insertColParams: IInsertColMutationParams = {
                workbookId,
                worksheetId,
                ranges: [lastColumnRange],
                colInfo: new ObjectArray<IColumnData>(
                    new Array(columnsCount).fill(undefined).map(() => ({
                        w: lastColumnWidth,
                        hd: BooleanNumber.FALSE,
                    }))
                ),
            };

            redoMutations.push({
                id: InsertColMutation.id,
                params: insertColParams,
            });

            const undoColInsertionParams: IRemoveColMutationParams = InsertColMutationUndoFactory(
                accessor,
                insertColParams
            );

            undoMutations.push({ id: RemoveColMutation.id, params: undoColInsertionParams });
        }

        // 3. change merge cells
        // All merged cells that intersect with the area to the right of rang are removed
        // Merge cells completely in the right area of the range, added after recalculating the position
        const mergeData = worksheet.getMergeData();
        const removeMergeData: IRange[] = [];
        const addMergeData: IRange[] = [];
        mergeData.forEach((rect) => {
            for (let i = 0; i < range.length; i++) {
                const { startRow, endRow, startColumn } = range[i];

                const intersects = Rectangle.intersects(
                    {
                        startRow,
                        startColumn,
                        endRow,
                        endColumn: lastColumnIndex,
                    },
                    rect
                );

                // If the merge cell intersects with the range, it is removed
                if (intersects) {
                    removeMergeData.push(rect);
                    const contains = Rectangle.contains(
                        {
                            startRow,
                            startColumn,
                            endRow,
                            endColumn: lastColumnIndex,
                        },
                        rect
                    );

                    // If the merge cell is completely contained in the range, it is added after recalculating the position

                    if (contains) {
                        const currentColumnsCount = columnsObject[`${i}`][1] - columnsObject[`${i}`][0] + 1;
                        addMergeData.push({
                            startRow: rect.startRow,
                            startColumn: rect.startColumn + currentColumnsCount,
                            endRow: rect.endRow,
                            endColumn: rect.endColumn + currentColumnsCount,
                        });
                        break;
                    }
                }
            }
        });

        if (removeMergeData.length > 0) {
            const removeMergeParams: IRemoveWorksheetMergeMutationParams = {
                workbookId,
                worksheetId,
                ranges: removeMergeData,
            };
            redoMutations.push({
                id: RemoveWorksheetMergeMutation.id,
                params: removeMergeParams,
            });
            const undoRemoveMergeParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
                accessor,
                removeMergeParams
            );
            undoMutations.push({ id: AddWorksheetMergeMutation.id, params: undoRemoveMergeParams });
        }

        if (addMergeData.length > 0) {
            const addMergeParams: IAddWorksheetMergeMutationParams = {
                workbookId,
                worksheetId,
                ranges: addMergeData,
            };
            redoMutations.push({
                id: AddWorksheetMergeMutation.id,
                params: addMergeParams,
            });
            const undoAddMergeParams: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
                accessor,
                addMergeParams
            );
            undoMutations.push({ id: RemoveWorksheetMergeMutation.id, params: undoAddMergeParams });
        }

        // execute do mutations and add undo mutations to undo stack if completed
        const result = await sequenceExecute(redoMutations, commandService);
        if (result.result) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo: async () => (await sequenceExecute(undoMutations.reverse(), commandService)).result,
                redo: async () => (await sequenceExecute(redoMutations, commandService)).result,
            });

            return true;
        }

        return false;
    },
    // all subsequent mutations should succeed inorder to make the whole process succeed
    // Promise.all([]).then(() => true),
};
