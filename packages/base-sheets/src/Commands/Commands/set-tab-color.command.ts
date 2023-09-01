import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { ISetTabColorMutationParams, SetTabColorMutation, SetTabColorUndoMutationFactory } from '../Mutations/set-tab-color.mutation';

export interface ISetTabColorCommandParams {
    color?: string;
    workbookId?: string;
    worksheetId?: string;
}

export const SetTabColorCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-tab-color',

    handler: async (accessor: IAccessor, params: ISetTabColorCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const workbookId = params.workbookId || currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = params.worksheetId || currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        const color = params.color || '#000'; // Todo: 先默认黑色

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const setTabColorMutationParams: ISetTabColorMutationParams = {
            color,
            workbookId,
            worksheetId,
        };

        const undoMutationParams = SetTabColorUndoMutationFactory(accessor, setTabColorMutationParams);
        const result = commandService.executeCommand(SetTabColorMutation.id, setTabColorMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetTabColorMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetTabColorMutation.id, setTabColorMutationParams);
                },
            });
            return true;
        }

        return false;
    },
};
