import { CommandType, ICommand, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
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
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = univerInstanceService
            .getCurrentUniverSheetInstance()

            .getActiveSheet()
            .getSheetId();

        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
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
        const result = commandService.syncExecuteCommand(SetFrozenMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undo() {
                    return commandService.syncExecuteCommand(
                        SetFrozenMutation.id,
                        undoMutationParams
                    ) as Promise<boolean>;
                },
                redo() {
                    return commandService.syncExecuteCommand(
                        SetFrozenMutation.id,
                        redoMutationParams
                    ) as Promise<boolean>;
                },
            });
            return true;
        }
        return false;
    },
};
