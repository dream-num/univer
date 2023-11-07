import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { IAutoFillService } from '../../services/auto-fill/auto-fill.service';
import { APPLY_TYPE } from '../../services/auto-fill/type';

interface IRefillCommandParams {
    type: APPLY_TYPE;
}

export const RefillCommand: ICommand = {
    id: 'sheet.command.refill',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IRefillCommandParams) => {
        const autoFillService = accessor.get(IAutoFillService);
        autoFillService.setApplyType(params.type);
        return true;
    },
};
