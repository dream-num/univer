import {
    BooleanNumber,
    CommandType,
    Dimension,
    ICellData,
    ICommand,
    ICommandInfo,
    ICommandService,
    ILogService,
    IRange,
    IRowData,
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
    IInsertRangeMutationParams,
    IInsertRowMutationParams,
    IRemoveRowsMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../../Basics/Interfaces/MutationInterface';
import { SelectionManagerService } from '../../services/selection/selection-manager.service';
import { AddMergeUndoMutationFactory, AddWorksheetMergeMutation } from '../mutations/add-worksheet-merge.mutation';
import { DeleteRangeMutation } from '../mutations/delete-range.mutation';
import { InsertRangeMutation, InsertRangeUndoMutationFactory } from '../mutations/insert-range.mutation';
import { InsertRowMutation, InsertRowMutationUndoFactory } from '../mutations/insert-row-col.mutation';
import { RemoveRowMutation } from '../mutations/remove-row-col.mutation';
import {
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
} from '../mutations/remove-worksheet-merge.mutation';
import { calculateTotalLength, IInterval } from './utils/selection-util';

/**
 * The command to insert range.
 */
export const InsertRangeMoveDownCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-range-move-down',

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
        const worksheetId = univerInstanceService
            .getCurrentUniverSheetInstance()

            .getActiveSheet()
            .getSheetId();
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
            shiftDimension: Dimension.ROWS,
            cellValue: cellValue.getData(),
        };

        redoMutations.push({ id: InsertRangeMutation.id, params: insertRangeMutationParams });

        const deleteRangeMutationParams: IDeleteRangeMutationParams = InsertRangeUndoMutationFactory(
            accessor,
            insertRangeMutationParams
        );

        undoMutations.push({ id: DeleteRangeMutation.id, params: deleteRangeMutationParams });

        // 2. insert row
        // Only required when the last row has a value, and the row height is set to the row height of the last row
        let hasValueInLastRow = false;
        let lastRowHeight = 0;
        const lastRowIndex = worksheet.getMaxRows() - 1;
        const rowsObject: IInterval = {};
        for (let i = 0; i < range.length; i++) {
            const { startRow, endRow, startColumn, endColumn } = range[i];
            rowsObject[`${i}`] = [startRow, endRow];
            for (let column = startColumn; column <= endColumn; column++) {
                const lastCell = worksheet.getCell(lastRowIndex, column);
                const lastCellValue = lastCell?.v;
                if (lastCellValue && lastCellValue !== '') {
                    hasValueInLastRow = true;
                    lastRowHeight = worksheet.getRowHeight(lastRowIndex);
                    break;
                }
            }
        }

        // There may be overlap and deduplication is required
        const rowsCount = calculateTotalLength(rowsObject);
        if (hasValueInLastRow) {
            const lastRowRange = {
                startRow: lastRowIndex,
                endRow: lastRowIndex,
                startColumn: range[0].startColumn,
                endColumn: range[0].endColumn,
            };
            const insertRowParams: IInsertRowMutationParams = {
                workbookId,
                worksheetId,
                ranges: [lastRowRange],
                rowInfo: new ObjectArray<IRowData>(
                    new Array(rowsCount).fill(undefined).map(() => ({
                        h: lastRowHeight,
                        hd: BooleanNumber.FALSE,
                    }))
                ),
            };

            redoMutations.push({
                id: InsertRowMutation.id,
                params: insertRowParams,
            });

            const undoRowInsertionParams: IRemoveRowsMutationParams = InsertRowMutationUndoFactory(
                accessor,
                insertRowParams
            );

            undoMutations.push({ id: RemoveRowMutation.id, params: undoRowInsertionParams });
        }

        // 3. change merge cells
        // All merged cells that intersect with the area to the bottom of rang are removed
        // Merge cells completely in the bottom area of the range, added after recalculating the position
        const mergeData = worksheet.getMergeData();
        const removeMergeData: IRange[] = [];
        const addMergeData: IRange[] = [];
        mergeData.forEach((rect) => {
            for (let i = 0; i < range.length; i++) {
                const { startRow, startColumn, endColumn } = range[i];

                const intersects = Rectangle.intersects(
                    { startRow, startColumn, endRow: lastRowIndex, endColumn },
                    rect
                );

                // If the merge cell intersects with the range, it is removed
                if (intersects) {
                    removeMergeData.push(rect);
                    const contains = Rectangle.contains(
                        { startRow, startColumn, endRow: lastRowIndex, endColumn },
                        rect
                    );

                    // If the merge cell is completely contained in the range, it is added after recalculating the position
                    if (contains) {
                        const currentRowsCount = rowsObject[`${i}`][1] - rowsObject[`${i}`][0] + 1;
                        addMergeData.push({
                            startRow: rect.startRow + currentRowsCount,
                            startColumn: rect.startColumn,
                            endRow: rect.endRow + currentRowsCount,
                            endColumn: rect.endColumn,
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
        if (result) {
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
