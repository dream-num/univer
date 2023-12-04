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
