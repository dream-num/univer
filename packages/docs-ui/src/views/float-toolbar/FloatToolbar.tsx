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

import type { IMenuManagerService as IMenuManagerServiceType, IMenuSchema } from '@univerjs/ui';
import { borderClassName, clsx } from '@univerjs/design';
import { IMenuManagerService, MenuManagerPosition, ToolbarItem, useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import {
    SetInlineFormatBoldCommand,
    SetInlineFormatFontSizeCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatSubscriptCommand,
    SetInlineFormatSuperscriptCommand,
    SetInlineFormatTextBackgroundColorCommand,
    SetInlineFormatTextColorCommand,
    SetInlineFormatUnderlineCommand,
} from '../../commands/commands/inline-format.command';
import { FLOAT_TEXT_STYLE_MENU_ID, FLOAT_TOOLBAR_MENU_POSITION } from '../../menu/menu';

interface IFloatToolbarProps {
    avaliableMenus?: string[];
}

export const FLOAT_MENU_COMPONENT_KEY = 'univer.doc.float-menu';

const DEFAULT_AVALIABLE_MENUS: string[] = [
    FLOAT_TEXT_STYLE_MENU_ID,
    SetInlineFormatFontSizeCommand.id,
    SetInlineFormatBoldCommand.id,
    SetInlineFormatItalicCommand.id,
    SetInlineFormatUnderlineCommand.id,
    SetInlineFormatStrikethroughCommand.id,
    SetInlineFormatSubscriptCommand.id,
    SetInlineFormatSuperscriptCommand.id,
    SetInlineFormatTextColorCommand.id,
    SetInlineFormatTextBackgroundColorCommand.id,
];

export function resolveFloatToolbarMenus(
    menuManagerService: IMenuManagerServiceType,
    avaliableMenus: string[]
): { menus: IMenuSchema[]; extraMenus: IMenuSchema[] } {
    const floatToolbarMenus = menuManagerService.getMenuByPositionKey(FLOAT_TOOLBAR_MENU_POSITION);
    const flatMenus = [
        ...menuManagerService.getFlatMenuByPositionKey(FLOAT_TOOLBAR_MENU_POSITION),
        ...menuManagerService.getFlatMenuByPositionKey(MenuManagerPosition.RIBBON),
    ];

    const menus: IMenuSchema[] = [];
    for (const key of avaliableMenus) {
        const item = flatMenus.find((item) => item.key === key);
        if (item) {
            menus.push(item);
        }
    }

    return {
        menus,
        extraMenus: floatToolbarMenus.filter((item) => item.item && !avaliableMenus.includes(item.key)),
    };
}

export function FloatToolbar(props: IFloatToolbarProps) {
    const { avaliableMenus = DEFAULT_AVALIABLE_MENUS } = props;

    const menuManagerService = useDependency(IMenuManagerService);

    const [menus, setMenus] = useState<IMenuSchema[]>([]);
    const [extraMenus, setExtraMenus] = useState<IMenuSchema[]>([]);

    // subscribe to menu changes
    useEffect(() => {
        function getRibbon(): void {
            const { menus, extraMenus } = resolveFloatToolbarMenus(menuManagerService, avaliableMenus);
            setMenus(menus);
            setExtraMenus(extraMenus);
        }
        getRibbon();

        const subscription = menuManagerService.menuChanged$.subscribe(getRibbon);

        return () => {
            subscription.unsubscribe();
        };
    }, [avaliableMenus, menuManagerService]);

    return (
        <div
            className={clsx(`
              univer-box-border univer-flex univer-rounded univer-bg-white univer-py-1.5 univer-shadow-sm
              dark:!univer-border-gray-700 dark:!univer-bg-gray-900
            `, borderClassName)}
        >
            {menus.map((groupItem) => groupItem.item && (
                <div key={groupItem.key} className="univer-flex univer-flex-nowrap univer-gap-2 univer-px-2">
                    <ToolbarItem key={groupItem.key} {...groupItem.item} />
                </div>
            ))}
            {extraMenus.length > 0 && (
                <div
                    className="
                      univer-my-1 univer-w-px univer-bg-gray-200
                      dark:univer-bg-gray-700
                    "
                />
            )}
            {extraMenus.map((groupItem) => groupItem.item && (
                <div key={groupItem.key} className="univer-flex univer-flex-nowrap univer-gap-2 univer-px-2">
                    <ToolbarItem key={groupItem.key} {...groupItem.item} />
                </div>
            ))}
        </div>
    );
}
