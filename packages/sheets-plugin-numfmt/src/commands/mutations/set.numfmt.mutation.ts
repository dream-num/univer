import { CommandType, ICommand, IUniverInstanceService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { FormatType } from '../../base/types';
import { NumfmtService } from '../../service/numfmt.service';

export type SetNumfmtMutationParams = {
    values: Array<{ pattern: string; row: string; col: string; type: FormatType }>;
};
export const SetNumfmtMutation: ICommand<SetNumfmtMutationParams> = {
    id: 'sheet.set.numfmt.mutation',
    type: CommandType.MUTATION,
    handler: async (accessor: IAccessor, params) => {
        const values = params?.values || [];
        const numfmtService = accessor.get(NumfmtService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const workbookId = workbook.getUnitId();
        const worksheet = workbook.getActiveSheet();
        const sheetId = worksheet.getSheetId();
        values.forEach((item) => {
            const value = item.pattern ? { pattern: item.pattern, type: item.type } : null;
            numfmtService.setValue(workbookId, sheetId, Number(item.row), Number(item.col), value);
        });
        return true;
    },
};
