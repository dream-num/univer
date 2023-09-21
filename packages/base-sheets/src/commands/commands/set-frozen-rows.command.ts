import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    ISetFrozenRowsMutationParams,
    SetFrozenRowsMutation,
    SetFrozenRowsMutationFactory,
} from '../mutations/set-frozen-rows.mutation';

interface ISetFrozenRowsCommandParams {
    value: number;
}

export const SetFrozenRowsCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-frozen-rows',
    handler: async (accessor: IAccessor, params: ISetFrozenRowsCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

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

        const redoMutationParams: ISetFrozenRowsMutationParams = {
            workbookId,
            worksheetId,
            numRows: params.value,
        };

        const undoMutationParams: ISetFrozenRowsMutationParams = SetFrozenRowsMutationFactory(
            accessor,
            redoMutationParams
        );
        const result = commandService.executeCommand(SetFrozenRowsMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo() {
                    return commandService.executeCommand(SetFrozenRowsMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetFrozenRowsMutation.id, redoMutationParams);
                },
            });
            return true;
        }
        return false;
    },
};
