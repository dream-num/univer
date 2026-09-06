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

import type { IImagePopupMenuExtraProps, IImagePopupMenuItem } from './ImagePopupMenu';
import { ICommandService, LocaleService } from '@univerjs/core';
import { MobileActionRow } from '@univerjs/design';
import { IDialogService, MenuItemType, MobileMenu, useDependency } from '@univerjs/ui';
import { of } from 'rxjs';

interface IMobileImagePopupMenuProps {
    popup: {
        extraProps?: Pick<IImagePopupMenuExtraProps, 'menuItems' | 'variant'> & { dialogId?: string };
    };
}

export function MobileImagePopupMenu({ popup }: IMobileImagePopupMenuProps) {
    const menuItems = popup?.extraProps?.menuItems;
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const dialogService = useDependency(IDialogService);

    if (!menuItems) {
        return null;
    }

    const handleSelect = async (item: IImagePopupMenuItem) => {
        await commandService.executeCommand(item.commandId, item.commandParams);
        if (popup.extraProps?.dialogId) {
            dialogService.close(popup.extraProps.dialogId);
        }
    };

    if (popup.extraProps?.variant === 'doc-floating-toolbar' || popup.extraProps?.variant === 'doc-chart-floating-toolbar') {
        return (
            <MobileMenu
                presentation="context-bar"
                schemas={menuItems.map((item) => ({
                    key: item.commandId,
                    order: item.index,
                    item: {
                        id: item.commandId,
                        type: MenuItemType.BUTTON,
                        title: item.label,
                        disabled$: of(item.disable),
                    },
                }))}
                onOptionSelect={async ({ id }) => {
                    const item = menuItems.find((item) => item.commandId === id);
                    if (item && !item.disable) {
                        await handleSelect(item);
                    }
                }}
            />
        );
    }

    return (
        <div className="univer-flex univer-flex-col univer-gap-2">
            {menuItems.map((item) => {
                const label = localeService.t(item.label);

                return (
                    <MobileActionRow
                        key={`${item.commandId}-${item.label}`}
                        title={label}
                        aria-label={label}
                        variant="subtle"
                        disabled={item.disable}
                        onClick={() => handleSelect(item)}
                    />
                );
            })}
        </div>
    );
}
