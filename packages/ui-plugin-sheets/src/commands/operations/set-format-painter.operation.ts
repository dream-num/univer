import { CommandType, IOperation } from '@univerjs/core';

import { FormatPainterStatus, IFormatPainterService } from '../../services/format-painter/format-painter.service';

export interface ISetFormatPainterOperationParams {
    status: FormatPainterStatus;
}
export const SetFormatPainterOperation: IOperation<ISetFormatPainterOperationParams> = {
    id: 'sheet.operation.set-format-painter',
    type: CommandType.OPERATION,
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }
        const formatPainterService = accessor.get(IFormatPainterService);
        formatPainterService.setStatus(params.status);
        return true;
    },
};
