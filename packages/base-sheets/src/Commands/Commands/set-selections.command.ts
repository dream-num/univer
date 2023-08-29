import { CommandType, Direction, ICommand } from '@univerjs/core';

import { ISelectionManager } from '../../Services/tokens';

export interface IChangeSelectionCommandParams {
    direction: Direction;
    toEnd?: boolean;
}

export const ChangeSelectionCommand: ICommand<IChangeSelectionCommandParams> = {
    id: 'sheet.command.change-selection',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        const selectionManager = accessor.get(ISelectionManager);

        return true;
    },
};

export interface IExpandSelectionCommandParams {
    direction: Direction;
    toEnd?: boolean;
}

export const ExpandSelectionCommand: ICommand<IExpandSelectionCommandParams> = {
    id: 'sheet.command.expand-selection',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => true,
};
