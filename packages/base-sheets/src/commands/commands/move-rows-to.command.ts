import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { IInsertRowMutationParams, IRemoveRowMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { SelectionManagerService } from '../../services/selection-manager.service';
import { InsertRowMutation, InsertRowMutationUndoFactory } from '../mutations/insert-row-col.mutation';
import { IRemoveRowMutationFactory, RemoveRowMutation } from '../mutations/remove-row-col.mutation';

export interface IMoveRowsToCommandParams {
    destinationIndex: number;
}

export const MoveRowsToCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.move-rows-to',
    handler: async (accessor: IAccessor, params: IMoveRowsToCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);
        const selectionManagerService = accessor.get(SelectionManagerService);

        const originRange = selectionManagerService.getRangeDatas()?.[0];
        if (!originRange) {
            return false;
        }

        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentUniverService
            .getCurrentUniverSheetInstance()
            .getWorkBook()
            .getActiveSheet()
            .getSheetId();
        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const { startRow, endRow } = originRange;

        const removeRowMutationParams: IRemoveRowMutationParams = {
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
        const undoRemoveRowMutationParams: IInsertRowMutationParams = IRemoveRowMutationFactory(
            accessor,
            removeRowMutationParams
        );

        const removeResult = commandService.executeCommand(RemoveRowMutation.id, removeRowMutationParams);

        const insertRowMutationParams: IInsertRowMutationParams = {
            ...undoRemoveRowMutationParams,
            ranges: [
                {
                    startColumn: 0,
                    endColumn: 0,
                    startRow: params.destinationIndex,
                    endRow: params.destinationIndex + endRow - startRow,
                },
            ],
        };

        const undoMutationParams: IRemoveRowMutationParams = InsertRowMutationUndoFactory(
            accessor,
            insertRowMutationParams
        );

        const result = commandService.executeCommand(InsertRowMutation.id, insertRowMutationParams);

        if (removeResult && result) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo() {
                    return (
                        commandService.executeCommand(
                            InsertRowMutation.id,
                            undoRemoveRowMutationParams
                        ) as Promise<boolean>
                    ).then((res) => {
                        if (res) return commandService.executeCommand(RemoveRowMutation.id, undoMutationParams);
                        return false;
                    });
                },
                redo() {
                    return (
                        commandService.executeCommand(RemoveRowMutation.id, removeRowMutationParams) as Promise<boolean>
                    ).then((res) => {
                        if (res) return commandService.executeCommand(InsertRowMutation.id, insertRowMutationParams);
                        return false;
                    });
                },
            });
            return true;
        }

        return false;
    },
};
