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

import type { DocPopupMenu, IDocPopupMenuItem } from '../services/doc-quick-insert-popup.service';
import { borderBottomClassName, borderClassName, clsx, scrollbarClassName, Tooltip } from '@univerjs/design';
import { IconManager, useDependency } from '@univerjs/ui';
import { useEffect, useMemo, useRef } from 'react';

interface IQuickInsertMenuProps {
    menus: DocPopupMenu[];
    focusedMenuIndex: number;
    onFocusedMenuIndexChange: (index: number) => void;
    onFocusedMenuChange: (menu: IDocPopupMenuItem | null) => void;
    onSelect: (menu: IDocPopupMenuItem) => void;
}

function isMenuGroup(menu: DocPopupMenu): menu is DocPopupMenu & { children: IDocPopupMenuItem[] } {
    return 'children' in menu;
}

function flattenMenuItems(menus: DocPopupMenu[]): IDocPopupMenuItem[] {
    return menus.flatMap((menu) => {
        if (isMenuGroup(menu)) {
            return flattenMenuItems(menu.children);
        }

        return menu;
    });
}

export function getQuickInsertMenuLeafCount(menus: DocPopupMenu[]) {
    return flattenMenuItems(menus).length;
}

export function QuickInsertMenu(props: IQuickInsertMenuProps) {
    const {
        menus,
        focusedMenuIndex,
        onFocusedMenuIndexChange,
        onFocusedMenuChange,
        onSelect,
    } = props;

    const iconManager = useDependency(IconManager);
    const flatMenus = useMemo(() => flattenMenuItems(menus), [menus]);
    const menuNodeMapRef = useRef(new Map<string, HTMLElement>());

    useEffect(() => {
        const focusedMenu = Number.isNaN(focusedMenuIndex)
            ? null
            : flatMenus[focusedMenuIndex] ?? null;

        onFocusedMenuChange(focusedMenu);

        if (!focusedMenu) {
            return;
        }

        menuNodeMapRef.current.get(focusedMenu.id)?.scrollIntoView({
            block: 'nearest',
        });
    }, [flatMenus, focusedMenuIndex, onFocusedMenuChange]);

    useEffect(() => {
        const menuNodeMap = menuNodeMapRef.current;

        return () => {
            menuNodeMap.clear();
        };
    }, []);

    const itemIndexRef = useRef(0);
    itemIndexRef.current = 0;

    function renderMenus(currentMenus: DocPopupMenu[]) {
        return currentMenus.map((menu, index) => {
            const iconKey = menu.icon;
            const Icon = iconKey ? iconManager.get(iconKey) : null;

            if (isMenuGroup(menu)) {
                return (
                    <div
                        key={menu.id}
                        className={clsx('univer-grid univer-gap-1 univer-py-1', index !== currentMenus.length - 1 && borderBottomClassName)}
                    >
                        <div
                            className={`
                              univer-box-border univer-inline-flex univer-items-center univer-gap-2 univer-px-2
                              univer-text-xs univer-font-semibold univer-text-gray-600
                              dark:!univer-text-gray-300
                            `}
                        >
                            {Icon && <span className="univer-inline-flex univer-text-base"><Icon /></span>}
                            <span>{menu.title}</span>
                        </div>
                        <div className="univer-grid univer-gap-1">
                            {renderMenus(menu.children)}
                        </div>
                    </div>
                );
            }

            const currentMenuIndex = itemIndexRef.current;
            const isFocused = focusedMenuIndex === currentMenuIndex;
            itemIndexRef.current += 1;

            return (
                <div
                    key={menu.id}
                    ref={(node) => {
                        if (node) {
                            menuNodeMapRef.current.set(menu.id, node);
                            return;
                        }

                        menuNodeMapRef.current.delete(menu.id);
                    }}
                    role="button"
                    tabIndex={-1}
                    className={clsx(`
                      univer-relative univer-box-border univer-flex univer-min-h-8 univer-w-full univer-cursor-pointer
                      univer-items-center univer-justify-between univer-gap-3 univer-rounded-md univer-border-none
                      univer-bg-transparent univer-px-2 univer-text-left univer-text-sm univer-text-gray-900
                      univer-outline-none
                      hover:univer-bg-gray-50
                      dark:!univer-text-white
                      dark:hover:!univer-bg-gray-600
                    `, {
                        'hover:univer-bg-transparent': !isFocused,
                        'univer-bg-gray-50 dark:!univer-bg-gray-600': isFocused,
                    })}
                    onMouseEnter={() => onFocusedMenuIndexChange(currentMenuIndex)}
                    onMouseLeave={() => onFocusedMenuIndexChange(Number.NaN)}
                    onClick={() => onSelect(menu)}
                >
                    <div className="univer-inline-flex univer-w-full univer-items-center univer-gap-2">
                        {Icon && <span className="univer-inline-flex univer-text-base"><Icon /></span>}
                        <Tooltip showIfEllipsis title={menu.title} placement="right">
                            <span className="univer-truncate">{menu.title}</span>
                        </Tooltip>
                    </div>
                </div>
            );
        });
    }

    return (
        <div
            className={clsx(`
              univer-box-border univer-grid univer-max-h-[360px] univer-gap-1 univer-overflow-y-auto
              univer-overflow-x-hidden univer-overscroll-contain univer-rounded-md univer-bg-white univer-px-2
              univer-py-1 univer-text-sm univer-text-gray-900 univer-shadow-md
              dark:!univer-bg-gray-700 dark:!univer-text-white
            `, borderClassName, scrollbarClassName)}
            onWheel={(event) => event.stopPropagation()}
        >
            {renderMenus(menus)}
        </div>
    );
}
