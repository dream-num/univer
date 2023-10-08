import { INotificationService } from '@univerjs/base-ui';
import {
    CommandType,
    ICommand,
    ICommandService,
    ICurrentUniverService,
    IRange,
    IUndoRedoService,
    RANGE_TYPE,
    Rectangle,
    sequenceExecute,
    Tools,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    IAddWorksheetMergeMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../../Basics/Interfaces/MutationInterface';
import { SelectionManagerService } from '../../services/selection-manager.service';
import { AddMergeUndoMutationFactory, AddWorksheetMergeMutation } from '../mutations/add-worksheet-merge.mutation';
import {
    IMoveRowsMutationParams,
    MoveRowsMutation,
    MoveRowsMutationUndoFactory,
} from '../mutations/move-row-col.mutation';
import {
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
} from '../mutations/remove-worksheet-merge.mutation';
import { rowAcrossMergedCell } from './utils/merged-cell-util';
import { alignToMergedCellsBorders } from './utils/selection-util';

export interface IMoveRowsCommandParams {
    fromRow: number;
    toRow: number;
}

/**
 * Command to move the selected rows (must currently selected) to the specified row.
 */
export const MoveRowsCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.move-rows',
    handler: async (accessor: IAccessor, params: IMoveRowsCommandParams) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelections();
        const { fromRow, toRow } = params;
        const ranges = selections?.filter(
            (selection) =>
                selection.range.rangeType === RANGE_TYPE.ROW &&
                selection.range.startRow <= fromRow &&
                fromRow <= selection.range.endRow
        );
        if (ranges?.length !== 1) {
            return false;
        }

        const currentUniverService = accessor.get(ICurrentUniverService);
        const workbook = currentUniverService.getCurrentUniverSheetInstance();
        if (!workbook) {
            return false;
        }
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return false;
        }

        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();

        const notificationService = accessor.get(INotificationService);
        // Forbid action when some parts of a merged cell are selected.
        const rangeToMove = ranges[0].range;
        const alignedRange = alignToMergedCellsBorders(rangeToMove, worksheet, false);
        if (!Rectangle.equals(rangeToMove, alignedRange)) {
            // TODO@wzhudev: use rightfully implemented notification service when it's ready
            notificationService.show({
                title: 'Only part of a merged cell is selected.',
            });
            return false;
        }

        if (rowAcrossMergedCell(toRow, worksheet)) {
            // TODO@wzhudev: use rightfully implemented notification service when it's ready
            notificationService.show({
                title: 'Across a merged cell',
            });
            return false;
        }

        const destinationRange: IRange = {
            ...rangeToMove,
            startRow: toRow,
            endRow: toRow + rangeToMove.endRow - rangeToMove.startRow,
        };
        const moveRowsParams: IMoveRowsMutationParams = {
            workbookId,
            worksheetId,
            sourceRange: rangeToMove,
            targetRange: destinationRange,
        };
        const undoMoveRowsParams = MoveRowsMutationUndoFactory(accessor, moveRowsParams);

        // we could just move the merged cells because other situations are not allowed
        // we should only deal with merged cell that is between the range of the rows to move
        const count = rangeToMove.endRow - rangeToMove.startRow + 1;
        const movedLength = toRow - fromRow;
        const moveBackward = movedLength < 0;
        const mergedCells: IRange[] = Tools.deepClone(worksheet.getMergeData());
        for (let i = 0; i < mergedCells.length; i++) {
            const mergedCell = mergedCells[i];
            const { startRow: mergeStartRow, endRow: mergedEndRow } = mergedCell;
            if (moveBackward) {
                // merged cells between `rangeToMove` to `destination` should be moved forward
                // merged cells in the `rangeToMove` should be moved backward
                if (Rectangle.contains(rangeToMove, mergedCell)) {
                    mergedCell.startRow += movedLength;
                    mergedCell.endRow += movedLength;
                } else if (mergedEndRow < rangeToMove.startRow && mergeStartRow >= destinationRange.startRow) {
                    mergedCell.startRow += count;
                    mergedCell.endRow += count;
                }
            } else {
                // move forward
                if (Rectangle.contains(rangeToMove, mergedCell)) {
                    mergedCell.startRow += movedLength;
                    mergedCell.endRow += movedLength;
                } else if (rangeToMove.endRow < mergeStartRow && mergedEndRow < destinationRange.startRow) {
                    mergedCell.startRow -= count;
                    mergedCell.endRow -= count;
                }
            }
        }
        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: Tools.deepClone(worksheet.getMergeData()),
        };
        const undoRemoveMergeMutationParams = RemoveMergeUndoMutationFactory(accessor, removeMergeMutationParams);
        const addMergeParams: IAddWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: mergedCells,
        };
        const undoAddMergeParams = AddMergeUndoMutationFactory(accessor, addMergeParams);

        const commandService = accessor.get(ICommandService);
        const result = await sequenceExecute(
            [
                { id: MoveRowsMutation.id, params: moveRowsParams },
                { id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams },
                { id: AddWorksheetMergeMutation.id, params: addMergeParams },
            ],
            commandService
        );

        // TODO: should deal with cursor selection as well

        if (result.result) {
            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                async undo() {
                    const undoResult = await sequenceExecute(
                        [
                            { id: MoveRowsMutation.id, params: undoMoveRowsParams },
                            { id: RemoveWorksheetMergeMutation.id, params: undoAddMergeParams },
                            { id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams },
                        ],
                        commandService
                    );

                    return undoResult.result;
                },
                async redo() {
                    const redoResult = await sequenceExecute(
                        [
                            { id: MoveRowsMutation.id, params: moveRowsParams },
                            { id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams },
                            { id: AddWorksheetMergeMutation.id, params: addMergeParams },
                        ],
                        commandService
                    );
                    return redoResult.result;
                },
            });
            return true;
        }

        return false;
    },
};
