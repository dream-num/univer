/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICommand, ISize, ObjectPositionH, ObjectPositionV } from '@univerjs/core';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type { IDrawingTransformMutation } from '../mutations/set-floating-object.mutation';
import {
    SetDrawingTransformMutation,
    SetDrawingTransformMutationFactory,
} from '../mutations/set-floating-object.mutation';

export interface ISetDrawingSizeCommandParams {
    documentId: string;
    objectId: string;
    size: ISize;
}

export const SetDrawingSizeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'doc.command.set-drawing-size',

    handler: async (accessor: IAccessor, params?: ISetDrawingSizeCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        if (params == null) {
            return false;
        }

        const documentId = params.documentId;

        const documentModel = univerInstanceService.getUniverDocInstance(documentId);
        if (!documentModel) return false;

        const snapshot = documentModel.snapshot;
        if (snapshot == null) return false;

        const { objectId, size } = params;

        const redoMutationParams: IDrawingTransformMutation = {
            documentId,
            objectId,
            size,
        };

        const undoMutationParams = SetDrawingTransformMutationFactory(accessor, redoMutationParams);
        const result = commandService.syncExecuteCommand(SetDrawingTransformMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: documentId,
                undoMutations: [{ id: SetDrawingTransformMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetDrawingTransformMutation.id, params: redoMutationParams }],
            });
            return true;
        }

        return false;
    },
};

export interface ISetDrawingPositionCommandParams {
    documentId: string;
    objectId: string;
    positionH: ObjectPositionH;
    positionV: ObjectPositionV;
}

export const SetDrawingPositionCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'doc.command.set-drawing-size',

    handler: async (accessor: IAccessor, params?: ISetDrawingPositionCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        if (params == null) {
            return false;
        }

        const documentId = params.documentId;

        const documentModel = univerInstanceService.getUniverDocInstance(documentId);
        if (!documentModel) return false;

        const snapshot = documentModel.snapshot;
        if (snapshot == null) return false;

        const { objectId, positionH, positionV } = params;

        const redoMutationParams: IDrawingTransformMutation = {
            documentId,
            objectId,
            positionH,
            positionV,
        };

        const undoMutationParams = SetDrawingTransformMutationFactory(accessor, redoMutationParams);
        const result = commandService.syncExecuteCommand(SetDrawingTransformMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: documentId,
                undoMutations: [{ id: SetDrawingTransformMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetDrawingTransformMutation.id, params: redoMutationParams }],
            });
            return true;
        }

        return false;
    },
};
