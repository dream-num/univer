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
import { CommandType, Direction, DisposableCollection, ICommandService, LocaleService, toDisposable } from '@univerjs/core';
import { clsx, Menu, MenuItem, MenuItemGroup } from '@univerjs/design';
import { ComponentManager, IShortcutService, KeyCode, useDependency, useObservable } from '@univerjs/ui';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { DocQuickInsertPopupService } from '../services/doc-quick-insert-popup.service';

function filterMenusByKeyword(menus: DocPopupMenu[], keyword: string, localeService: LocaleService) {
    return menus.filter((menu) => {
        if ('children' in menu) {
            const newChildren = filterMenusByKeyword(menu.children!, keyword, localeService) as IDocPopupMenuItem[];

            return newChildren.length > 0;
        }

        const keywords = (menu as IDocPopupMenuItem).keywords;

        return keywords.some((word) => word.includes(keyword));
    });
}

function translateMenus(menus: DocPopupMenu[], localeService: LocaleService) {
    return menus.map((menu) => {
        const newMenu = { ...menu } as DocPopupMenu;
        if ('children' in newMenu) {
            newMenu.children = translateMenus(newMenu.children!, localeService) as IDocPopupMenuItem[];
        }

        newMenu.title = localeService.t(menu.title);
        (newMenu as IDocPopupMenuItem).keywords = (newMenu as IDocPopupMenuItem).keywords.concat(newMenu.title);

        return newMenu;
    });
}

const QuickInsertPopup = () => {
    const localeService = useDependency(LocaleService);
    const docQuickInsertPopupService = useDependency(DocQuickInsertPopupService);
    const componentManager = useDependency(ComponentManager);
    const shortcutService = useDependency(IShortcutService);
    const commandService = useDependency(ICommandService);
    // const menuManagerService = useDependency(IMenuManagerService);
    const id = useId();

    const filterKeyword = useObservable(docQuickInsertPopupService.filterKeyword$);
    const currentPopup = useObservable(docQuickInsertPopupService.editPopup$);
    const menus = useObservable<DocPopupMenu[]>(currentPopup?.popup.menus$, []);
    const translatedMenus = useMemo(() => {
        return translateMenus(menus, localeService);
    }, [menus]);

    const [focusedMenuIndex, setFocusedMenuIndex] = useState(0);
    const menuIndexAccumulator = useRef(0);
    menuIndexAccumulator.current = 0;

    const filteredMenus = useMemo(() => {
        return filterMenusByKeyword(translatedMenus, filterKeyword, localeService);
    }, [translatedMenus, filterKeyword]);

    const handleMouseEnter = useCallback(() => {
        setFocusedMenuIndex(Number.NaN);
    }, []);

    useEffect(() => {
        /** Use up or down to navigate the focused menu instead of moving the cursor in documents. */
        const disposableCollection = new DisposableCollection();

        const shortcutItems = shortcutService.getAllShortcuts();

        const interceptedShortcutItems = shortcutItems.filter((item) => {
            return item.binding === KeyCode.ARROW_DOWN || item.binding === KeyCode.ARROW_UP;
        });
        // disable the shortcut items of moving the cursor in documents
        interceptedShortcutItems.forEach((item) => {
            const rawPreconditions = item.preconditions;

            item.preconditions = () => false;

            disposableCollection.add(toDisposable(() => {
                item.preconditions = rawPreconditions;
            }));
        });

        const moveCursorUpCommand = {
            id: `quick.insert.popup.move.cursor.up.${id}`,
            type: CommandType.OPERATION,
            handler: () => {
                setFocusedMenuIndex((index) => {
                    const nextIndex = (index - 1);

                    return nextIndex >= 0 ? nextIndex : menuIndexAccumulator.current - 1;
                });
            },
        };
        const moveCursorDownCommand = {
            id: `quick.insert.popup.move.cursor.down.${id}`,
            type: CommandType.OPERATION,
            handler: () => {
                setFocusedMenuIndex((index) => {
                    const nextIndex = (index + 1);

                    return nextIndex <= (menuIndexAccumulator.current - 1) ? nextIndex : 0;
                });
            },
        };
        // register the commands of moving the focused menu up and down
        disposableCollection.add(commandService.registerCommand(moveCursorUpCommand));
        disposableCollection.add(commandService.registerCommand(moveCursorDownCommand));

        disposableCollection.add(shortcutService.registerShortcut({
            id: moveCursorUpCommand.id,
            binding: KeyCode.ARROW_UP,
            preconditions: () => true,
            staticParameters: {
                direction: Direction.UP,
            },
        }));

        disposableCollection.add(shortcutService.registerShortcut({
            id: moveCursorDownCommand.id,
            binding: KeyCode.ARROW_DOWN,
            preconditions: () => true,
            staticParameters: {
                direction: Direction.DOWN,
            },
        }));

        return () => {
            disposableCollection.dispose();
        };
    }, []);

    useEffect(() => {
        setFocusedMenuIndex(0);
    }, [filteredMenus]);

    function renderMenus(menus: DocPopupMenu[]) {
        return menus.map((menu) => {
            if ('children' in menu) {
                return (
                    <MenuItemGroup key={menu.id} title={localeService.t(menu.title)}>
                        {renderMenus(menu.children!)}
                    </MenuItemGroup>
                );
            }

            const iconKey = (menu as IDocPopupMenuItem).icon;
            const Icon = typeof iconKey === 'string' ? componentManager.get(iconKey) : null;

            const title = menu.title;
            const isFocused = focusedMenuIndex === menuIndexAccumulator.current;

            menuIndexAccumulator.current++;

            return (
                <MenuItem
                    onMouseEnter={handleMouseEnter}
                    key={menu.id}
                    className={clsx({
                        'univer-bg-[rgb(var(--bg-color-hover))]': isFocused,
                    })}
                    onClick={() => {}}
                >
                    {Icon && <Icon />}
                    <span>{localeService.t(title ?? '')}</span>
                </MenuItem>
            );
        });
    }

    return (
        <div className="univer-rounded-lg univer-border univer-border-solid univer-border-gray-100">
            <Menu>
                {renderMenus(filteredMenus)}
            </Menu>
        </div>

    );
};

QuickInsertPopup.componentKey = 'doc.quick-insert-popup';

export { QuickInsertPopup };
