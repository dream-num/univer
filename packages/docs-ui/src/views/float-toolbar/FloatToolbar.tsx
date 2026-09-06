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
    popup?: { extraProps?: { onDismiss?: () => void } };
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
    const onDismiss = props.popup?.extraProps?.onDismiss;

    const menuManagerService = useDependency(IMenuManagerService);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const hoveredRef = useRef(false);
    const dismissedRef = useRef(false);

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

    useEffect(() => {
        const toolbar = toolbarRef.current;
        if (!toolbar || !onDismiss) {
            return;
        }
        const onPointerMove = (event: PointerEvent) => {
            if (hoveredRef.current || dismissedRef.current || event.pointerType === 'touch') {
                return;
            }
            const rect = toolbar.getBoundingClientRect();
            const distance = Math.max(rect.left - event.clientX, event.clientX - rect.right, rect.top - event.clientY, event.clientY - rect.bottom, 0);
            // Give the pointer a 10px safe area, then fade over the next 80px.
            const opacity = Math.max(0, 1 - Math.max(0, distance - 10) / 80);
            toolbar.style.opacity = String(opacity);
            if (opacity === 0) {
                dismissedRef.current = true;
                onDismiss();
            }
        };
        toolbar.ownerDocument.addEventListener('pointermove', onPointerMove);
        return () => toolbar.ownerDocument.removeEventListener('pointermove', onPointerMove);
    }, [onDismiss]);

    const retainToolbar = () => {
        hoveredRef.current = true;
        if (toolbarRef.current) {
            toolbarRef.current.style.opacity = '1';
        }
    };
    const selectors = menus.filter((menu) => menu.key === FLOAT_TEXT_STYLE_MENU_ID || menu.key === SetInlineFormatFontSizeCommand.id);
    const formatting = menus.filter((menu) => !selectors.includes(menu));

    return (
        <div
            ref={toolbarRef}
            data-doc-float-toolbar
            onPointerEnter={retainToolbar}
            onFocusCapture={retainToolbar}
            className={clsx(`
              univer-box-border univer-flex univer-flex-col univer-gap-1 univer-rounded univer-bg-gray-0 univer-p-1
              univer-shadow-sm
              dark:!univer-border-gray-700 dark:!univer-bg-gray-900
            `, borderClassName)}
        >
            <div
                className="
                  univer-flex univer-items-center univer-gap-1
                  [&_.univer-toolbar-selector-root]:univer-text-xs
                "
            >
                {selectors.map((menu) => menu.item && (
                    <div
                        key={menu.key}
                        className={menu.key === FLOAT_TEXT_STYLE_MENU_ID
                            ? `
                              univer-min-w-0 univer-flex-1
                              [&_.univer-toolbar-selector-root]:univer-box-border
                              [&_.univer-toolbar-selector-root]:univer-w-full
                              [&_.univer-toolbar-selector-root]:univer-justify-between
                            `
                            : 'univer-shrink-0'}
                    >
                        <ToolbarItem {...menu.item} iconSize={14} iconColor={menu.iconColor} />
                    </div>
                ))}
                {selectors.length > 0 && extraMenus.length > 0 && (
                    <div
                        className="
                          univer-mx-0.5 univer-h-4 univer-w-px univer-bg-gray-200
                          dark:univer-bg-gray-700
                        "
                    />
                )}
                {extraMenus.map((menu) => menu.item && <ToolbarItem key={menu.key} {...menu.item} iconSize={14} />)}
            </div>
            <div className="univer-flex univer-items-center univer-gap-0.5">
                {formatting.map((menu) => menu.item && (
                    <ToolbarItem key={menu.key} {...menu.item} iconSize={14} iconColor={menu.iconColor} />
                ))}
            </div>
        </div>
    );
}
