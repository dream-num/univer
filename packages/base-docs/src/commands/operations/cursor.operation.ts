import { CommandType, Direction, ICurrentUniverService, IOperation } from '@univerjs/core';

import { InputController } from '../../Controller/InputController';

export interface IMoveCursorOperationParams {
    direction: Direction;
}

// TODO@wzhudev: it should be moved to a command then trigger the operation.

/**
 * The operation to move cursor in the current document.
 */
export const MoveCursorOperation: IOperation<IMoveCursorOperationParams> = {
    id: 'doc.operation.move-cursor',
    type: CommandType.OPERATION,
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }

        const currentUniverService = accessor.get(ICurrentUniverService);
        const inputController = accessor.get(InputController);

        inputController.moveCursor(currentUniverService.getCurrentUniverDocInstance().getDocument(), params.direction);

        return true;
    },
};
