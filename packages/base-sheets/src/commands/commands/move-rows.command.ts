import { INotificationService } from '@univerjs/base-ui';
import {
    CommandType,
    ICommand,
    ICommandService,
    ICurrentUniverService,
    IUndoRedoService,
    RANGE_TYPE,
    Rectangle,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { IInsertRowMutationParams, IRemoveRowsMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { SelectionManagerService } from '../../services/selection-manager.service';
import { InsertRowMutation, InsertRowMutationUndoFactory } from '../mutations/insert-row-col.mutation';
import { RemoveRowMutation, RemoveRowsMutationFactory } from '../mutations/remove-row-col.mutation';
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
        const ranges = selections?.filter(
            (selection) =>
                selection.range.rangeType === RANGE_TYPE.ROW &&
                selection.range.startRow <= params.fromRow &&
                params.fromRow <= selection.range.endRow
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

        // Warn use if only some parts of a merged cell are selected.
        const rangeToMove = ranges[0].range;
        const alignedRange = alignToMergedCellsBorders(rangeToMove, worksheet, false);
        if (!Rectangle.equals(rangeToMove, alignedRange)) {
            const notificationService = accessor.get(INotificationService);
            notificationService.show({
                title: 'Only part of a merged cell is selected.',
            });
            return false;
        }

        // TODO@wzhudev: we should add a move row mutation instead of using an insert mutation and a delete mutation
        // they are not logically the same

        const { startRow, endRow } = rangeToMove;
        const removeRowMutationParams: IRemoveRowsMutationParams = {
            workbookId,
            worksheetId,
            ranges: [
                {
                    startColumn: 0,
                    endColumn: 0,
                    startRow,
                    endRow,
                },
            ],
        };
        const undoRemoveRowMutationParams: IInsertRowMutationParams = RemoveRowsMutationFactory(
            removeRowMutationParams,
            worksheet
        );

        const insertRowMutationParams: IInsertRowMutationParams = {
            ...undoRemoveRowMutationParams,
            ranges: [
                {
                    startColumn: 0,
                    endColumn: 0,
                    startRow: params.toRow,
                    endRow: params.toRow + endRow - startRow,
                },
            ],
        };
        const undoMutationParams: IRemoveRowsMutationParams = InsertRowMutationUndoFactory(
            accessor,
            insertRowMutationParams
        );

        // TODO: we should expose a hook on a service to let other features to hook in mutations when rows are moved

        const commandService = accessor.get(ICommandService);
        const removeResult = commandService.executeCommand(RemoveRowMutation.id, removeRowMutationParams);
        const insertResult = commandService.executeCommand(InsertRowMutation.id, insertRowMutationParams);

        if (removeResult && insertResult) {
            accessor.get(IUndoRedoService).pushUndoRedo({
                URI: workbookId,
                async undo() {
                    const res = await commandService.executeCommand(InsertRowMutation.id, undoRemoveRowMutationParams);
                    if (res) return commandService.executeCommand(RemoveRowMutation.id, undoMutationParams);
                    return false;
                },
                async redo() {
                    const res = await commandService.executeCommand(RemoveRowMutation.id, removeRowMutationParams);
                    if (res) return commandService.executeCommand(InsertRowMutation.id, insertRowMutationParams);
                    return false;
                },
            });

            return true;
        }

        return false;
    },
};
