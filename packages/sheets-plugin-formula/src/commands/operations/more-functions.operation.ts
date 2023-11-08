import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export const MoreFunctionsOperation: ICommand = {
    id: 'formula.operation.more-functions',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor) => true,
};
