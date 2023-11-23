import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { IFormulaPromptService, IHelpFunctionOperationParams } from '../../services/prompt.service';

export const HelpFunctionOperation: ICommand = {
    id: 'formula-ui.operation.help-function',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor, params: IHelpFunctionOperationParams) => {
        const promptService = accessor.get(IFormulaPromptService);
        promptService.help(params);

        return true;
    },
};
