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

import type { IMenuSchema } from '@univerjs/ui';
import type { IImagePopupMenuExtraProps } from './ImagePopupMenu';
import { ICommandService } from '@univerjs/core';
import { IDialogService, MenuItemType, MobileMenu, useDependency } from '@univerjs/ui';
import { of } from 'rxjs';

interface IMobileImagePopupMenuProps {
    popup: {
        extraProps?: Pick<IImagePopupMenuExtraProps, 'menuItems' | 'variant'> & { dialogId?: string };
    };
}

export function MobileImagePopupMenu({ popup }: IMobileImagePopupMenuProps) {
    const commandService = useDependency(ICommandService);
    const dialogService = useDependency(IDialogService);
    const menuItems = popup.extraProps?.menuItems;
    if (!menuItems) {
        return null;
    }

    const schemas: IMenuSchema[] = menuItems.map((item) => ({
        key: item.commandId,
        order: item.index,
        item: item.type === 'select'
            ? {
                id: item.commandId,
                type: MenuItemType.SELECTOR,
                title: item.label,
                value$: of(item.value),
                disabled$: of(item.disable || !item.options?.length),
                selections: item.options,
            }
            : {
                id: item.commandId,
                type: MenuItemType.BUTTON,
                title: item.label,
                disabled$: of(item.disable),
            },
    }));

    return (
        <MobileMenu
            presentation={popup.extraProps?.variant ? 'context-bar' : 'drawer'}
            schemas={schemas}
            onOptionSelect={async ({ id, value }) => {
                const item = menuItems.find((item) => item.commandId === id);
                if (!item || item.disable) {
                    return;
                }
                if (item.type === 'select' && (typeof value !== 'string' || !item.options?.some((option) => option.value === value))) {
                    return;
                }
                const params = item.type === 'select' && typeof value === 'string'
                    ? item.commandParamsFactory?.(value) ?? { ...item.commandParams, value }
                    : item.commandParams;
                await commandService.executeCommand(item.commandId, params);
                if (item.hideOnClick !== false && popup.extraProps?.dialogId) {
                    dialogService.close(popup.extraProps.dialogId);
                }
            }}
        />
    );
}
