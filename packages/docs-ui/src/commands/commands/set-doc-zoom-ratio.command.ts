/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IAccessor, ICommand } from '@univerjs/core';
import type { ISetDocZoomRatioOperationParams } from '../operations/set-doc-zoom-ratio.operation';

import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
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

        let documentId = univerInstanceService.getCurrentUniverDocInstance()?.getUnitId();
        if (!documentId) return false;

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
