import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    ISetFrozenMutationParams,
    SetFrozenMutation,
    SetFrozenMutationFactory,
} from '../mutations/set-frozen.mutation';

interface ISetFrozenCommandParams {
    startRow: number;
    startColumn: number;
    ySplit: number;
    xSplit: number;
}

export const SetFrozenCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-frozen',
    handler: async (accessor: IAccessor, params: ISetFrozenCommandParams) => {
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

        const redoMutationParams: ISetFrozenMutationParams = {
            workbookId,
            worksheetId,
            ...params,
        };

        const undoMutationParams: ISetFrozenMutationParams = SetFrozenMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(SetFrozenMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo() {
                    return commandService.executeCommand(SetFrozenMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetFrozenMutation.id, redoMutationParams);
                },
            });
            return true;
        }
        return false;
    },
};
