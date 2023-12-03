import type { ICommand } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type { IHelpFunctionOperationParams } from '../../services/prompt.service';
import { IFormulaPromptService } from '../../services/prompt.service';

export const HelpFunctionOperation: ICommand = {
    id: 'formula-ui.operation.help-function',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor, params: IHelpFunctionOperationParams) => {
        const promptService = accessor.get(IFormulaPromptService);
        promptService.help(params);

        return true;
    },
};
