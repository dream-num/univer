import { CommandType, ICommand, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { IInsertDrawingMutation, InsertDrawingMutation } from '../mutations/insert-floating-object.mutation';
import { RemoveDrawingMutation } from '../mutations/remove-floating-object.mutation';
import { ISeachDrawingMutation } from '../mutations/set-floating-object.mutation';

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

        const documentId = params.documentId;

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
                URI: documentId,
                undo() {
                    return commandService.syncExecuteCommand(InsertDrawingMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.syncExecuteCommand(RemoveDrawingMutation.id, redoMutationParams);
                },
            });
            return true;
        }

        return false;
    },
};
