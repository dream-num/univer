// This file provide operations to change selection of sheets.

import { CommandType, IOperation } from '@univerjs/core';

import { IScrollManagerInsertParam, ScrollManagerService } from '../../services/scroll-manager.service';

export const SetScrollOperation: IOperation<IScrollManagerInsertParam> = {
    id: 'sheet.operation.set-scroll',
    type: CommandType.OPERATION,
    handler: async (accessor, params) => {
        const scrollManagerService = accessor.get(ScrollManagerService);
        scrollManagerService.addOrReplaceByParam(params!);
        return true;
    },
};
