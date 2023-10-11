import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    ISetZoomRatioMutationParams,
    SetZoomRatioMutation,
    SetZoomRatioUndoMutationFactory,
} from '../mutations/set-zoom-ratio.mutation';

export interface ISetZoomRatioCommandParams {
    zoomRatio?: number;
    documentId?: string;
}

export const SetZoomRatioCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'doc.command.set-zoom-ratio',

    handler: async (accessor: IAccessor, params?: ISetZoomRatioCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        let documentId = currentUniverService.getCurrentUniverDocInstance().getUnitId();
        let zoomRatio = 1;

        if (params) {
            documentId = params.documentId ?? documentId;
            zoomRatio = params.zoomRatio ?? zoomRatio;
        }

        const workbook = currentUniverService.getUniverDocInstance(documentId);
        if (!workbook) return false;

        const setZoomRatioMutationParams: ISetZoomRatioMutationParams = {
            zoomRatio,
            documentId,
        };

        const undoMutationParams = SetZoomRatioUndoMutationFactory(accessor, setZoomRatioMutationParams);
        const result = commandService.executeCommand(SetZoomRatioMutation.id, setZoomRatioMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: documentId,
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
