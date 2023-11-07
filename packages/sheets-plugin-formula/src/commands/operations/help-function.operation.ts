import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { IFormulaPromptService, IHelpFunctionCommandParams } from '../../services/prompt.service';

export const HelpFunctionOperation: ICommand = {
    id: 'formula.operation.help-function',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor, params: IHelpFunctionCommandParams) => {
        const promptService = accessor.get(IFormulaPromptService);
        promptService.help(params);

        return true;
    },
};
