import { CommandType, ICommand, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    ISetDocZoomRatioOperationParams,
    SetDocZoomRatioOperation,
    SetDocZoomRatioUndoMutationFactory,
} from '../operations/set-doc-zoom-ratio.operation';

export interface ISetDocZoomRatioCommandParams {
    zoomRatio?: number;
    documentId?: string;
}

export const SetDocZoomRatioCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'doc.command.set-zoom-ratio',

    handler: async (accessor: IAccessor, params?: ISetDocZoomRatioCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        let documentId = univerInstanceService.getCurrentUniverDocInstance().getUnitId();
        let zoomRatio = 1;

        if (params) {
            documentId = params.documentId ?? documentId;
            zoomRatio = params.zoomRatio ?? zoomRatio;
        }

        const workbook = univerInstanceService.getUniverDocInstance(documentId);
        if (!workbook) return false;

        const setZoomRatioMutationParams: ISetDocZoomRatioOperationParams = {
            zoomRatio,
            unitId: documentId,
        };

        const undoMutationParams = SetDocZoomRatioUndoMutationFactory(accessor, setZoomRatioMutationParams);
        const result = commandService.syncExecuteCommand(SetDocZoomRatioOperation.id, setZoomRatioMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: documentId,
                undo() {
                    return commandService.syncExecuteCommand(SetDocZoomRatioOperation.id, undoMutationParams);
                },
                redo() {
                    return commandService.syncExecuteCommand(SetDocZoomRatioOperation.id, setZoomRatioMutationParams);
                },
            });
            return true;
        }

        return false;
    },
};
