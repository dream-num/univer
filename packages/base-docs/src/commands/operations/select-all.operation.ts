import { ITextRangeWithStyle } from '@univerjs/base-render';
import { CommandType, ICommand, IUniverInstanceService } from '@univerjs/core';

import { TextSelectionManagerService } from '../../services/text-selection-manager.service';

interface ISelectAllOperationParams {}

export const SelectAllOperation: ICommand<ISelectAllOperationParams> = {
    id: 'doc.operation.select-all',

    type: CommandType.COMMAND,

    handler: async (accessor) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);

        const prevBody = univerInstanceService.getCurrentUniverDocInstance().getSnapshot().body;

        if (prevBody == null) {
            return false;
        }

        const textRanges: ITextRangeWithStyle[] = [
            {
                startOffset: 0,
                endOffset: prevBody.dataStream.length - 2,
                collapsed: false,
            },
        ];

        textSelectionManagerService.replaceTextRanges(textRanges);

        return true;
    },
};
