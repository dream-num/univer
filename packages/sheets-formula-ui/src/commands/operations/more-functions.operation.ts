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
import { CommandType } from '@univerjs/core';
import { ISidebarService } from '@univerjs/ui';

import { MORE_FUNCTIONS_COMPONENT } from '../../views/more-functions/interface';

export const MoreFunctionsOperation: ICommand = {
    id: 'formula-ui.operation.more-functions',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor) => {
        const sidebarService = accessor.get(ISidebarService);

        sidebarService.open({
            header: { title: 'formula.insert.tooltip' },
            children: { label: MORE_FUNCTIONS_COMPONENT },
        });

        return true;
    },
};
