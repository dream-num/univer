import type { ICommand } from '@univerjs/core';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type { ISetDocZoomRatioOperationParams } from '../operations/set-doc-zoom-ratio.operation';
import {
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
                unitID: documentId,
                undoMutations: [{ id: SetDocZoomRatioOperation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetDocZoomRatioOperation.id, params: setZoomRatioMutationParams }],
            });
            return true;
        }

        return false;
    },
};
