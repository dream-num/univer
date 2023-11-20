import { CommandType, ICommand, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { IInsertDrawingMutation, InsertDrawingMutation } from '../mutations/insert-floating-object.mutation';
import { RemoveDrawingMutation } from '../mutations/remove-floating-object.mutation';

export const InsertDrawingCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'doc.command.insert-drawing',

    handler: async (accessor: IAccessor, params?: IInsertDrawingMutation) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        if (params == null) {
            return false;
        }

        const { documentId } = params;

        const documentModel = univerInstanceService.getUniverDocInstance(documentId);
        if (!documentModel) return false;

        const { snapshot } = documentModel;
        if (snapshot == null || snapshot.drawings == null) return false;

        const { objectId, drawing } = params;

        const redoMutationParams: IInsertDrawingMutation = {
            documentId,
            objectId,
            drawing,
        };

        const undoMutationParams = {
            documentId,
            objectId,
        };
        const result = commandService.syncExecuteCommand(InsertDrawingMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: documentId,
                undoMutations: [{ id: RemoveDrawingMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: InsertDrawingMutation.id, params: redoMutationParams }],
            });

            return true;
        }

        return false;
    },
};
