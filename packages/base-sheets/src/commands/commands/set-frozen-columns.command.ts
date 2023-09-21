import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    ISetFrozenColumnsMutationParams,
    SetFrozenColumnsMutation,
    SetFrozenColumnsMutationFactory,
} from '../mutations/set-frozen-columns.mutation';

interface ISetFrozenColumnsCommandParams {
    value: number;
}

export const SetFrozenColumnsCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-frozen-columns',
    handler: async (accessor: IAccessor, params: ISetFrozenColumnsCommandParams) => {
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

        const redoMutationParams: ISetFrozenColumnsMutationParams = {
            workbookId,
            worksheetId,
            numColumns: params.value,
        };

        const undoMutationParams: ISetFrozenColumnsMutationParams = SetFrozenColumnsMutationFactory(
            accessor,
            redoMutationParams
        );
        const result = commandService.executeCommand(SetFrozenColumnsMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo() {
                    return commandService.executeCommand(SetFrozenColumnsMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetFrozenColumnsMutation.id, redoMutationParams);
                },
            });
            return true;
        }
        return false;
    },
};
