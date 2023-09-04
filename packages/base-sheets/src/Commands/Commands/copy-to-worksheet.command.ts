import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService, Tools } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { ISetWorksheetConfigMutationParams, SetWorksheetConfigMutation, SetWorksheetConfigUndoMutationFactory } from '../Mutations/set-worksheet-config.mutation';

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
        const currentUniverService = accessor.get(ICurrentUniverService);

        const workbookId = params.workbookId || currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = params.worksheetId || currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        const copyToWorkbookId = params.workbookId || currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const copyToSheetId = params.copyToSheetId || currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const copyToWorkbook = currentUniverService.getUniverSheetInstance(copyToWorkbookId)?.getWorkBook();
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

        const undoMutationParams: ISetWorksheetConfigMutationParams = SetWorksheetConfigUndoMutationFactory(accessor, setWorksheetConfigMutationParams);
        const result = commandService.executeCommand(SetWorksheetConfigMutation.id, setWorksheetConfigMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetWorksheetConfigMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetConfigMutation.id, setWorksheetConfigMutationParams);
                },
            });
            return true;
        }
        return false;
    },
};
