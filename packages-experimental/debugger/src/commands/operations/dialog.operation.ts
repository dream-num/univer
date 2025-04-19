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
import { IDialogService } from '@univerjs/ui';

export interface IUIComponentCommandParams {
    value: string;
}

export const DialogOperation: ICommand = {
    id: 'debugger.operation.dialog',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IUIComponentCommandParams) => {
        const dialogService = accessor.get(IDialogService);
        const { value } = params;

        if (value === 'draggable') {
            dialogService.open({
                id: 'draggable',
                children: { title: 'Draggable Dialog Content' },
                title: { title: 'Draggable Dialog' },
                draggable: true,
                destroyOnClose: true,
                preservePositionOnDestroy: true,
                width: 350,
                onClose() {
                    // dialogService.close('draggable');
                },
                onOpenChange(open: boolean) {
                    if (!open) {
                        dialogService.close('draggable');
                    }
                },
            });
        } else {
            dialogService.open({
                id: 'dialog1',
                children: { title: 'Dialog Content' },
                footer: { title: 'Dialog Footer' },
                title: { title: 'Dialog Title' },
                draggable: false,
                onClose() {
                    // dialogService.close('dialog1');
                },
                onOpenChange(open: boolean) {
                    if (!open) {
                        dialogService.close('dialog1');
                    }
                },
            });
        }

        return true;
    },
};
