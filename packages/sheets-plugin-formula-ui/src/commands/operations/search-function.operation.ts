import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { IFormulaPromptService, ISearchFunctionParams } from '../../services/prompt.service';

export const SearchFunctionOperation: ICommand = {
    id: 'formula-ui.operation.search-function',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor, params: ISearchFunctionParams) => {
        const promptService = accessor.get(IFormulaPromptService);
        promptService.search(params);

        return true;
    },
};
