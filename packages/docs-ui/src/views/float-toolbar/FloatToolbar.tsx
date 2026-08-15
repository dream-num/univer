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
import { IMenuManagerService, MenuManagerPosition, preventBrowserZoomInContainers, ToolbarItem, useDependency } from '@univerjs/ui';
import { useEffect, useRef, useState } from 'react';
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
    avaliableMenus?: Array<string | IFloatToolbarMenuConfig>;
}

interface IFloatToolbarMenuConfig {
    id: string;
    iconColor?: string;
}

interface IFloatToolbarMenuSchema extends IMenuSchema {
    iconColor?: string;
}

export const FLOAT_MENU_COMPONENT_KEY = 'univer.doc.float-menu';

const DEFAULT_AVALIABLE_MENUS: Array<string | IFloatToolbarMenuConfig> = [
    FLOAT_TEXT_STYLE_MENU_ID,
    SetInlineFormatFontSizeCommand.id,
    SetInlineFormatBoldCommand.id,
    SetInlineFormatItalicCommand.id,
    SetInlineFormatUnderlineCommand.id,
    SetInlineFormatStrikethroughCommand.id,
    SetInlineFormatSubscriptCommand.id,
    SetInlineFormatSuperscriptCommand.id,
    SetInlineFormatTextColorCommand.id,
    {
        id: SetInlineFormatTextBackgroundColorCommand.id,
        iconColor: 'var(--univer-primary-600)',
    },
];

export function resolveFloatToolbarMenus(
    menuManagerService: IMenuManagerServiceType,
    avaliableMenus: Array<string | IFloatToolbarMenuConfig>
): { menus: IFloatToolbarMenuSchema[]; extraMenus: IMenuSchema[] } {
    const floatToolbarMenus = menuManagerService.getMenuByPositionKey(FLOAT_TOOLBAR_MENU_POSITION);
    const flatMenus = [
        ...menuManagerService.getFlatMenuByPositionKey(FLOAT_TOOLBAR_MENU_POSITION),
        ...menuManagerService.getFlatMenuByPositionKey(MenuManagerPosition.RIBBON),
    ];

    const menus: IFloatToolbarMenuSchema[] = [];
    const menuIds = avaliableMenus.map((config) => typeof config === 'string' ? config : config.id);
    for (const config of avaliableMenus) {
        const menuId = typeof config === 'string' ? config : config.id;
        const item = flatMenus.find((item) => item.key === menuId);
        if (item) {
            menus.push(typeof config === 'string' ? item : { ...item, iconColor: config.iconColor });
        }
    }

    return {
        menus,
        extraMenus: floatToolbarMenus.filter((item) => item.item && !menuIds.includes(item.key)),
    };
}

export function FloatToolbar(props: IFloatToolbarProps) {
    const { avaliableMenus = DEFAULT_AVALIABLE_MENUS } = props;

    const menuManagerService = useDependency(IMenuManagerService);
    const toolbarRef = useRef<HTMLDivElement>(null);

    const [menus, setMenus] = useState<IFloatToolbarMenuSchema[]>([]);
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

    useEffect(() => {
        const toolbar = toolbarRef.current;
        if (!toolbar) {
            return;
        }

        return preventBrowserZoomInContainers([toolbar]);
    }, []);

    return (
        <div
            ref={toolbarRef}
            className={clsx(`
              univer-box-border univer-flex univer-rounded univer-bg-gray-0 univer-py-1.5 univer-shadow-sm
              dark:!univer-border-gray-700 dark:!univer-bg-gray-900
            `, borderClassName)}
        >
            {menus.map((groupItem) => groupItem.item && (
                <div key={groupItem.key} className="univer-flex univer-flex-nowrap univer-gap-2 univer-px-2">
                    <ToolbarItem key={groupItem.key} {...groupItem.item} iconColor={groupItem.iconColor} />
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
