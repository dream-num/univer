// This file provide operations to change selection of sheets.

import { ITextRangeWithStyle } from '@univerjs/base-render';
import { CommandType, IOperation } from '@univerjs/core';

import { TextSelectionManagerService } from '../../services/text-selection-manager.service';

export interface ISetTextSelectionsOperationParams {
    unitId: string;
    pluginName: string;
    ranges: ITextRangeWithStyle[];
}

export const SetTextSelectionsOperation: IOperation<ISetTextSelectionsOperationParams> = {
    id: 'doc.operation.set-selections',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);

        textSelectionManagerService.replaceWithNoRefresh(params!.ranges);

        return true;
    },
};
