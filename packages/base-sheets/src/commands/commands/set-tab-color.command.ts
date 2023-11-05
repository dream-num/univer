import { CommandType, ICommand, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    ISetTabColorMutationParams,
    SetTabColorMutation,
    SetTabColorUndoMutationFactory,
} from '../mutations/set-tab-color.mutation';

export interface ISetTabColorCommandParams {
    value: string;
}

export const SetTabColorCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-tab-color',

    handler: async (accessor: IAccessor, params: ISetTabColorCommandParams) => {
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

        const setTabColorMutationParams: ISetTabColorMutationParams = {
            color: params.value,
            workbookId,
            worksheetId,
        };

        const undoMutationParams = SetTabColorUndoMutationFactory(accessor, setTabColorMutationParams);
        const result = commandService.syncExecuteCommand(SetTabColorMutation.id, setTabColorMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undo() {
                    return commandService.syncExecuteCommand(SetTabColorMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.syncExecuteCommand(SetTabColorMutation.id, setTabColorMutationParams);
                },
            });
            return true;
        }

        return false;
    },
};
