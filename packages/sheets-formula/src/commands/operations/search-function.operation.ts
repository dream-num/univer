import type { ICommand } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type { ISearchFunctionOperationParams } from '../../services/prompt.service';
import { IFormulaPromptService } from '../../services/prompt.service';

export const SearchFunctionOperation: ICommand = {
    id: 'formula-ui.operation.search-function',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor, params: ISearchFunctionOperationParams) => {
        const promptService = accessor.get(IFormulaPromptService);
        promptService.search(params);

        return true;
    },
};
