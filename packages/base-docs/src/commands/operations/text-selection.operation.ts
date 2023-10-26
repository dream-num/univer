// This file provide operations to change selection of sheets.

import { ITextSelectionRangeWithStyle } from '@univerjs/base-render';
import { CommandType, IOperation } from '@univerjs/core';

import { TextSelectionManagerService } from '../../services/text-selection-manager.service';

export interface ISetTextSelectionsOperationParams {
    unitId: string;
    pluginName: string;
    ranges: ITextSelectionRangeWithStyle[];
}

export const SetTextSelectionsOperation: IOperation<ISetTextSelectionsOperationParams> = {
    id: 'doc.operation.set-selections',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        textSelectionManagerService.replace(params!.ranges);
        return true;
    },
};
