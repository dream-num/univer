import {
    BooleanNumber,
    CommandType,
    ICommand,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    ISetWorksheetActivateMutationParams,
    SetWorksheetActivateMutation,
    SetWorksheetUnActivateMutationFactory,
} from '../mutations/set-worksheet-activate.mutation';
import {
    ISetWorksheetHideMutationParams,
    SetWorksheetHideMutation,
    SetWorksheetHideMutationFactory,
} from '../mutations/set-worksheet-hide.mutation';

export interface ISetWorksheetShowCommandParams {
    value?: string;
}

export const SetWorksheetShowCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-show',

    handler: async (accessor: IAccessor, params?: ISetWorksheetShowCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        let worksheetId = univerInstanceService
            .getCurrentUniverSheetInstance()

            .getActiveSheet()
            .getSheetId();

        if (params) {
            worksheetId = params.value ?? worksheetId;
        }

        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const hidden = worksheet.getConfig().hidden;
        if (hidden === BooleanNumber.FALSE) return false;

        const redoMutationParams: ISetWorksheetHideMutationParams = {
            workbookId,
            worksheetId,
            hidden: BooleanNumber.FALSE,
        };

        const undoMutationParams = SetWorksheetHideMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(SetWorksheetHideMutation.id, redoMutationParams);

        const activeSheetMutationParams: ISetWorksheetActivateMutationParams = {
            workbookId,
            worksheetId,
        };

        const unActiveMutationParams = SetWorksheetUnActivateMutationFactory(accessor, activeSheetMutationParams);
        const activeResult = commandService.executeCommand(SetWorksheetActivateMutation.id, activeSheetMutationParams);

        if (result && activeResult) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo() {
                    return (
                        commandService.executeCommand(
                            SetWorksheetActivateMutation.id,
                            unActiveMutationParams
                        ) as Promise<boolean>
                    ).then((res) => {
                        if (res) return commandService.executeCommand(SetWorksheetHideMutation.id, undoMutationParams);
                        return false;
                    });
                },
                redo() {
                    return (
                        commandService.executeCommand(
                            SetWorksheetActivateMutation.id,
                            activeSheetMutationParams
                        ) as Promise<boolean>
                    ).then((res) => {
                        if (res) return commandService.executeCommand(SetWorksheetHideMutation.id, redoMutationParams);
                        return false;
                    });
                },
            });
            return true;
        }

        return false;
    },
};
