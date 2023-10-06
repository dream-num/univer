import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    ISetFrozenMutationParams,
    SetFrozenMutation,
    SetFrozenMutationFactory,
} from '../mutations/set-frozen.mutation';

export const SetFrozenCancelCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-frozen-cancel',
    handler: async (accessor: IAccessor) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentUniverService
            .getCurrentUniverSheetInstance()

            .getActiveSheet()
            .getSheetId();

        const workbook = currentUniverService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const redoMutationParams: ISetFrozenMutationParams = {
            workbookId,
            worksheetId,
            startRow: -1,
            startColumn: -1,
            ySplit: 0,
            xSplit: 0,
        };

        const undoMutationParams: ISetFrozenMutationParams = SetFrozenMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(SetFrozenMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo() {
                    return commandService.executeCommand(SetFrozenMutation.id, undoMutationParams) as Promise<boolean>;
                },
                redo() {
                    return commandService.executeCommand(SetFrozenMutation.id, redoMutationParams) as Promise<boolean>;
                },
            });
            return true;
        }
        return false;
    },
};
