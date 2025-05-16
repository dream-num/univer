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

import { IConfirmService, IDialogService, useDependency } from '@univerjs/ui';

const menu = [
    {
        label: 'Open dialog',
        value: 'dialog',
    },
    {
        label: 'Draggable dialog',
        value: 'draggable',
    },
    {
        label: 'Open confirm',
        value: 'confirm',
    },
];

export function useDialog() {
    const dialogService = useDependency(IDialogService);
    const confirmService = useDependency(IConfirmService);

    const onSelect = (value: string) => {
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
        } else if (value === 'dialog') {
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
        } else if (value === 'confirm') {
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
        }
    };

    return {
        type: 'subItem' as const,
        children: '💬 Dialog & Confirm',
        options: menu.map((item) => ({
            type: 'item' as const,
            children: item.label,
            onSelect: () => onSelect(item.value),
        })),
    };
}
