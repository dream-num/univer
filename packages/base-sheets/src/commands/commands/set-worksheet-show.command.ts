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
        const result = commandService.syncExecuteCommand(SetWorksheetHideMutation.id, redoMutationParams);

        const activeSheetMutationParams: ISetWorksheetActivateMutationParams = {
            workbookId,
            worksheetId,
        };

        const unActiveMutationParams = SetWorksheetUnActivateMutationFactory(accessor, activeSheetMutationParams);
        const activeResult = commandService.syncExecuteCommand(
            SetWorksheetActivateMutation.id,
            activeSheetMutationParams
        );

        if (result && activeResult) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: [
                    { id: SetWorksheetHideMutation.id, params: undoMutationParams },
                    { id: SetWorksheetActivateMutation.id, params: unActiveMutationParams },
                ],
                redoMutations: [
                    { id: SetWorksheetActivateMutation.id, params: activeSheetMutationParams },
                    { id: SetWorksheetHideMutation.id, params: redoMutationParams },
                ],
            });
            return true;
        }

        return false;
    },
};
