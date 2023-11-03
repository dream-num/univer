import {
    CommandType,
    ICommand,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    Tools,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    ISetWorksheetConfigMutationParams,
    SetWorksheetConfigMutation,
    SetWorksheetConfigUndoMutationFactory,
} from '../mutations/set-worksheet-config.mutation';

export interface ICopySheetToCommandParams {
    workbookId?: string;
    worksheetId?: string;
    copyToWorkbookId?: string;
    copyToSheetId?: string;
}

export const CopySheetToCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.copy-sheet-to',
    handler: async (accessor: IAccessor, params: ICopySheetToCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbookId = params.workbookId || univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId =
            params.worksheetId || univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
        const copyToWorkbookId = params.workbookId || univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const copyToSheetId =
            params.copyToSheetId || univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;
        const copyToWorkbook = univerInstanceService.getUniverSheetInstance(copyToWorkbookId);
        if (!copyToWorkbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;
        const copyToWorksheet = workbook.getSheetBySheetId(copyToSheetId);
        if (!copyToWorksheet) return false;
        if (workbookId === copyToWorkbookId && worksheetId === copyToSheetId) return false;

        const config = Tools.deepClone(worksheet.getConfig());

        const setWorksheetConfigMutationParams: ISetWorksheetConfigMutationParams = {
            workbookId,
            worksheetId,
            config,
        };

        const undoMutationParams: ISetWorksheetConfigMutationParams = SetWorksheetConfigUndoMutationFactory(
            accessor,
            setWorksheetConfigMutationParams
        );
        const result = commandService.syncExecuteCommand(
            SetWorksheetConfigMutation.id,
            setWorksheetConfigMutationParams
        );
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undo() {
                    return commandService.syncExecuteCommand(SetWorksheetConfigMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(
                        SetWorksheetConfigMutation.id,
                        setWorksheetConfigMutationParams
                    );
                },
            });
            return true;
        }
        return false;
    },
};
