import type { ICommand } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

export const ReferenceAbsoluteOperation: ICommand = {
    id: 'formula-ui.operation.change-ref-to-absolute',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor) => true,
};
