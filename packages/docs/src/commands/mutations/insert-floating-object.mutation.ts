import type { IDrawing, IMutation } from '@univerjs/core';
import { CommandType, IUniverInstanceService } from '@univerjs/core';

import type { ISeachDrawingMutation } from './set-floating-object.mutation';

export interface IInsertDrawingMutation extends ISeachDrawingMutation {
    drawing: IDrawing;
}

export const InsertDrawingMutation: IMutation<IInsertDrawingMutation> = {
    id: 'doc.mutation.insert-drawing',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const univerdoc = accessor.get(IUniverInstanceService).getUniverDocInstance(params.documentId);

        if (univerdoc == null) {
            return false;
        }

        let drawings = univerdoc.snapshot.drawings;

        if (drawings == null) {
            drawings = {};
            univerdoc.snapshot.drawings = drawings;
        }

        const { objectId, drawing } = params;

        drawings[objectId] = drawing;

        return true;
    },
};
