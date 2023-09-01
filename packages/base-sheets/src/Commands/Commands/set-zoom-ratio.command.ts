import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { ISetZoomRatioMutationParams, SetZoomRatioMutation, SetZoomRatioUndoMutationFactory } from '../Mutations/set-zoom-ratio.mutation';

export interface ISetZoomRatioCommandParams {
    zoomRatio?: number;
    workbookId?: string;
    worksheetId?: string;
}

export const SetZoomRatioCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-zoom-ratio',

    handler: async (accessor: IAccessor, params: ISetZoomRatioCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const workbookId = params.workbookId || currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = params.worksheetId || currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        const zoomRatio = params.zoomRatio ?? 1;

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const setZoomRatioMutationParams: ISetZoomRatioMutationParams = {
            zoomRatio,
            workbookId,
            worksheetId,
        };

        const undoMutationParams = SetZoomRatioUndoMutationFactory(accessor, setZoomRatioMutationParams);
        const result = commandService.executeCommand(SetZoomRatioMutation.id, setZoomRatioMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetZoomRatioMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetZoomRatioMutation.id, setZoomRatioMutationParams);
                },
            });
            return true;
        }

        return false;
    },
};
