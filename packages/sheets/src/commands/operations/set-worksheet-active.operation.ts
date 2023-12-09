import type { IOperation } from '@univerjs/core';
import { BooleanNumber, CommandType, IUniverInstanceService } from '@univerjs/core';

export interface ISetWorksheetActiveOperationParams {
    workbookId: string;
    worksheetId: string;
}

export const SetWorksheetActiveOperation: IOperation<ISetWorksheetActiveOperationParams> = {
    id: 'sheet.operation.set-worksheet-active',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        const universheet = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.workbookId);
        if (!universheet) return false;

        // TODO: this should be changed to a inner state
        const worksheets = universheet.getWorksheets();
        for (const [, worksheet] of worksheets) {
            if (worksheet.getSheetId() === params.worksheetId) {
                worksheet.getConfig().status = BooleanNumber.TRUE;
            } else {
                worksheet.getConfig().status = BooleanNumber.FALSE;
            }
        }

        return true;
    },
};
