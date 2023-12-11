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

import type { ICommand } from '@univerjs/core';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type { IInsertDrawingMutation } from '../mutations/insert-floating-object.mutation';
import { InsertDrawingMutation } from '../mutations/insert-floating-object.mutation';
import { RemoveDrawingMutation } from '../mutations/remove-floating-object.mutation';
import type { ISeachDrawingMutation } from '../mutations/set-floating-object.mutation';

export const RemoveDrawingCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'doc.command.remove-drawing',

    handler: async (accessor: IAccessor, params?: ISeachDrawingMutation) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        if (params == null) {
            return false;
        }

        const { documentId } = params;

        const documentModel = univerInstanceService.getUniverDocInstance(documentId);
        if (!documentModel) return false;

        const snapshot = documentModel.snapshot;
        if (snapshot == null || snapshot.drawings == null) return false;

        const { objectId } = params;

        const redoMutationParams: ISeachDrawingMutation = {
            documentId,
            objectId,
        };

        const undoMutationParams: IInsertDrawingMutation = {
            documentId,
            objectId,
            drawing: snapshot.drawings[objectId],
        };
        const result = commandService.syncExecuteCommand(RemoveDrawingMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: documentId,
                undoMutations: [{ id: InsertDrawingMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: RemoveDrawingMutation.id, params: redoMutationParams }],
            });
            return true;
        }

        return false;
    },
};
