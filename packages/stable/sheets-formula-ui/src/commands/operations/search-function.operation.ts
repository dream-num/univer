/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IAccessor, ICommand } from '@univerjs/core';
import type { ISearchFunctionOperationParams } from '../../services/prompt.service';

import { CommandType } from '@univerjs/core';
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
