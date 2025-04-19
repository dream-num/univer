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
import { IConfirmService } from '@univerjs/ui';

export interface IUIComponentCommandParams {
    value: string;
}

export const ConfirmOperation: ICommand = {
    id: 'debugger.operation.confirm',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IUIComponentCommandParams) => {
        const confirmService = accessor.get(IConfirmService);

        confirmService.open({
            id: 'confirm1',
            children: { title: 'Confirm Content' },
            title: { title: 'Confirm Title' },
            confirmText: 'hello',
            cancelText: 'world',
            onClose() {
                confirmService.close('confirm1');
            },
        });

        confirmService.open({
            id: 'confirm2',
            children: { title: 'Confirm2 Content' },
            title: { title: 'Confirm2 Title' },
            onClose() {
                confirmService.close('confirm2');
            },
        });

        return true;
    },
};
