import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { IFormulaPromptService } from '../../services/prompt.service';

export interface IHelpFunctionCommandParams {
    /**
     * show HelpFunction Component or not
     */
    show: boolean;
}

export const HelpFunctionOperation: ICommand = {
    id: 'formula.operation.help-function',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor, params: IHelpFunctionCommandParams) => {
        const promptService = accessor.get(IFormulaPromptService);
        promptService.setHelp(params.show);

        return true;
    },
};
