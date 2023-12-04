import type { IMutation } from '@univerjs/core';
import { CommandType, IUniverInstanceService } from '@univerjs/core';

import type { ISeachDrawingMutation } from './set-floating-object.mutation';

export const RemoveDrawingMutation: IMutation<ISeachDrawingMutation> = {
    id: 'doc.mutation.remove-drawing',
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

        delete drawings[params.objectId];

        return true;
    },
};
