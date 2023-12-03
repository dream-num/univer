import type { IOperation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';

import type { FormatPainterStatus } from '../../services/format-painter/format-painter.service';
import { IFormatPainterService } from '../../services/format-painter/format-painter.service';

export interface ISetFormatPainterOperationParams {
    status: FormatPainterStatus;
}
export const SetFormatPainterOperation: IOperation<ISetFormatPainterOperationParams> = {
    id: 'sheet.operation.set-format-painter',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const formatPainterService = accessor.get(IFormatPainterService);
        formatPainterService.setStatus(params.status);
        return true;
    },
};
