// This file provide operations to change selection of sheets.

import { CommandType, IOperation, IUniverInstanceService } from '@univerjs/core';

import { IScrollManagerInsertParam, ScrollManagerService } from '../../services/scroll-manager.service';

export const SetScrollOperation: IOperation<IScrollManagerInsertParam> = {
    id: 'sheet.operation.set-scroll',
    type: CommandType.OPERATION,
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }
        const scrollManagerService = accessor.get(ScrollManagerService);
        const currentService = accessor.get(IUniverInstanceService);
        const workbook = currentService.getUniverSheetInstance(params!.unitId);
        const worksheet = workbook!.getSheetBySheetId(params!.sheetId);
        const { xSplit, ySplit } = worksheet!.getConfig().freeze;
        scrollManagerService.addOrReplaceByParam({
            ...params,
            sheetViewStartRow: params.sheetViewStartRow - ySplit,
            sheetViewStartColumn: params.sheetViewStartColumn - xSplit,
        });
        return true;
    },
};
