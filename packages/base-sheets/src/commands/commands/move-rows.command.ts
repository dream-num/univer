import {
    CommandType,
    ICommand,
    ICommandService,
    ICurrentUniverService,
    IUndoRedoService,
    RANGE_TYPE,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { IInsertRowMutationParams, IRemoveRowsMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { SelectionManagerService } from '../../services/selection-manager.service';
import { InsertRowMutation, InsertRowMutationUndoFactory } from '../mutations/insert-row-col.mutation';
import { RemoveRowMutation, RemoveRowsMutationFactory } from '../mutations/remove-row-col.mutation';

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
        if (!selections?.length) {
            return false;
        }

        const findMoveRanges = selections.filter(
            (s) =>
                s.range.rangeType === RANGE_TYPE.ROW &&
                s.range.startRow <= params.fromRow &&
                params.fromRow <= s.range.endRow
        );
        if (findMoveRanges.length !== 1) {
            return false;
        }

        const movedRanges = findMoveRanges[0];
        const currentUniverService = accessor.get(ICurrentUniverService);
        const workbook = currentUniverService.getCurrentUniverSheetInstance();
        if (!workbook) return false;
        const workbookId = workbook.getUnitId();
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return false;
        const worksheetId = worksheet.getSheetId();

        // TODO: we should add a move row mutation instead of using an insert mutation and a delete mutation
        // they are not logically the same

        const { startRow, endRow } = movedRanges.range;
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
