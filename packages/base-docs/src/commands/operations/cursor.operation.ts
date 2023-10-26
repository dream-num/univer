import { CommandType, Direction, IOperation } from '@univerjs/core';

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
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        // const univerInstanceService = accessor.get(IUniverInstanceService);
        // const inputController = accessor.get(InputController);

        // inputController.moveCursor(univerInstanceService.getCurrentUniverDocInstance(), params.direction);

        return true;
    },
};
