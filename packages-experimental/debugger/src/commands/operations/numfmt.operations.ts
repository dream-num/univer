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

import { CommandType, ICommandService } from '@univerjs/core';
import type { IAccessor, ICommand } from '@univerjs/core';

export interface INumfmtOperationCommandParams {
    value: 'close' | 'open';
}

export const NumfmtOperation: ICommand = {
    id: 'debugger.operation.numfmt',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: INumfmtOperationCommandParams) => {
        const confirmService = accessor.get(ICommandService);
        if (params.value === 'open') {
            confirmService.executeCommand('sheet.operation.open.numfmt.panel');
        } else {
            confirmService.executeCommand('sheet.operation.close.numfmt.panel');
        }
        return true;
    },
};
