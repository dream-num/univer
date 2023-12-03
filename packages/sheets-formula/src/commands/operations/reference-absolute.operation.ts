import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export const ReferenceAbsoluteOperation: ICommand = {
    id: 'formula-ui.operation.change-ref-to-absolute',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor) => true,
};
