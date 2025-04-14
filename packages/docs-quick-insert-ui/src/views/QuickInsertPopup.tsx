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
import { CommandType, Direction, DisposableCollection, generateRandomId, ICommandService, LocaleService, toDisposable } from '@univerjs/core';
import { clsx, Menu, MenuItem, MenuItemGroup, Tooltip } from '@univerjs/design';
import { ComponentManager, IShortcutService, KeyCode, useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CloseQuickInsertPopupOperation } from '../commands/operations/quick-insert-popup.operation';
import { DocQuickInsertPopupService } from '../services/doc-quick-insert-popup.service';
import { QuickInsertPlaceholder } from './QuickInsertPlaceholder';

function filterMenusByKeyword(menus: DocPopupMenu[], keyword: string) {
    return menus
        .map((menu) => ({ ...menu }))
        .filter((menu) => {
            if ('children' in menu) {
                menu.children = filterMenusByKeyword(menu.children!, keyword) as IDocPopupMenuItem[];

                return menu.children.length > 0;
            }

            const keywords = (menu as IDocPopupMenuItem).keywords;

            if (keywords) {
                return keywords.some((word) => word.includes(keyword));
            }

            return menu.title.toLowerCase().includes(keyword);
        });
}

function translateMenus(menus: DocPopupMenu[], localeService: LocaleService) {
    return menus.map((_menu) => {
        const menu = { ..._menu } as DocPopupMenu;
        if ('children' in menu) {
            menu.children = translateMenus(menu.children!, localeService) as IDocPopupMenuItem[];
        }

        menu.title = localeService.t(menu.title);

        if ('keywords' in menu) {
            menu.keywords = menu.keywords!
                .concat(menu.title)
                .map((word) => word.toLowerCase());
        }

        return menu;
    });
}

const interceptKeys = [KeyCode.ARROW_UP, KeyCode.ARROW_DOWN, KeyCode.ENTER];

export const QuickInsertPopup = () => {
    const localeService = useDependency(LocaleService);
    const docQuickInsertPopupService = useDependency(DocQuickInsertPopupService);
    const componentManager = useDependency(ComponentManager);
    const shortcutService = useDependency(IShortcutService);
    const commandService = useDependency(ICommandService);

    const id = useMemo(() => generateRandomId(), []);

    const [focusedMenuIndex, setFocusedMenuIndex] = useState(0);
    const focusedMenuRef = useRef<IDocPopupMenuItem | null>(null);

    const menuIndexAccumulator = useRef(0);
    menuIndexAccumulator.current = 0;

    const filterKeyword = useObservable(docQuickInsertPopupService.filterKeyword$, '');
    const currentPopup = useObservable(docQuickInsertPopupService.editPopup$);
    const menus = useObservable<DocPopupMenu[]>(currentPopup?.popup.menus$, []);

    const translatedMenus = useMemo(() => {
        return translateMenus(menus, localeService);
    }, [menus]);

    const [filteredMenus, setFilteredMenus] = useState<DocPopupMenu[]>(() => {
        return filterMenusByKeyword(translatedMenus, filterKeyword.toLowerCase());
    });

    useEffect(() => {
        const id = requestIdleCallback(() => {
            setFilteredMenus(filterMenusByKeyword(translatedMenus, filterKeyword.toLowerCase()));
        });

        return () => {
            cancelIdleCallback(id);
        };
    }, [translatedMenus, filterKeyword]);

    const handleMenuSelect = (menu: IDocPopupMenuItem) => {
        docQuickInsertPopupService.emitMenuSelected(menu);
        commandService.executeCommand(CloseQuickInsertPopupOperation.id);
    };

    useEffect(() => {
        /** Use up or down to navigate the focused menu instead of moving the cursor in documents. */
        const disposableCollection = new DisposableCollection();

        const shortcutItems = shortcutService.getAllShortcuts();

        const interceptedShortcutItems = shortcutItems.filter((item) => item.binding && interceptKeys.includes(item.binding));
        // disable the shortcut items of moving the cursor in documents
        interceptedShortcutItems.forEach((item) => {
            const rawPreconditions = item.preconditions;

            item.preconditions = () => false;

            disposableCollection.add(toDisposable(() => {
                item.preconditions = rawPreconditions;
            }));
        });

        const enterCommand = {
            id: `quick.insert.popup.enter.${id}`,
            type: CommandType.OPERATION,
            handler: () => {
                const menu = focusedMenuRef.current;
                if (menu) {
                    handleMenuSelect(menu);
                }
            },
        };

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
        disposableCollection.add(commandService.registerCommand(enterCommand));
        disposableCollection.add(shortcutService.registerShortcut({
            priority: 1000,
            id: moveCursorUpCommand.id,
            binding: KeyCode.ARROW_UP,
            preconditions: () => true,
            staticParameters: {
                direction: Direction.UP,
            },
        }));

        disposableCollection.add(shortcutService.registerShortcut({
            priority: 1000,
            id: moveCursorDownCommand.id,
            binding: KeyCode.ARROW_DOWN,
            preconditions: () => true,
            staticParameters: {
                direction: Direction.DOWN,
            },
        }));

        disposableCollection.add(shortcutService.registerShortcut({
            priority: 1000,
            id: enterCommand.id,
            binding: KeyCode.ENTER,
            preconditions: () => true,
        }));

        return () => {
            disposableCollection.dispose();
        };
    }, []);

    useEffect(() => {
        setFocusedMenuIndex(0);
    }, [filteredMenus]);

    const menuNodeMapRef = useRef<Map<string, HTMLElement>>(new Map());

    useEffect(() => {
        return () => {
            menuNodeMapRef.current.clear();
        };
    }, []);

    function renderMenus(menus: DocPopupMenu[]) {
        return menus.map((menu) => {
            const iconKey = (menu as IDocPopupMenuItem).icon;
            const Icon = iconKey ? componentManager.get(iconKey) : null;

            if ('children' in menu) {
                return (
                    <MenuItemGroup
                        key={menu.id}
                        title={(
                            <div
                                className={`
                                  univer-mb-2 univer-flex univer-items-center univer-text-xs univer-text-gray-400
                                `}
                            >
                                {Icon && <span className="univer-mr-2 univer-inline-flex univer-text-base"><Icon /></span>}
                                <span>{menu.title}</span>
                            </div>
                        )}
                    >
                        {renderMenus(menu.children!)}
                    </MenuItemGroup>
                );
            }

            const currentMenuIndex = menuIndexAccumulator.current;
            const isFocused = focusedMenuIndex === currentMenuIndex;
            if (isFocused) {
                focusedMenuRef.current = menu as IDocPopupMenuItem;
                const node = menuNodeMapRef.current.get(menu.id);
                node?.scrollIntoView({
                    block: 'nearest',
                });
            }

            menuIndexAccumulator.current++;

            return (
                <MenuItem
                    // @ts-expect-error
                    ref={(node) => {
                        if (node) {
                            menuNodeMapRef.current.set(menu.id, node);
                        }
                    }}
                    onMouseEnter={() => setFocusedMenuIndex(currentMenuIndex)}
                    onMouseLeave={() => setFocusedMenuIndex(Number.NaN)}
                    key={menu.id}
                    className={clsx('univer-w-[calc(220px-var(--padding-base)*2)] univer-text-sm', {
                        'hover:univer-bg-transparent': !isFocused,
                        'univer-bg-gray-100': isFocused,
                    })}
                    onClick={() => {
                        handleMenuSelect(menu as IDocPopupMenuItem);
                    }}
                >
                    <div
                        className="univer-flex univer-w-full univer-items-center univer-px-1"
                    >
                        {Icon && <span className="univer-mr-2 univer-inline-flex univer-text-base"><Icon /></span>}
                        <Tooltip showIfEllipsis title={menu.title} placement="right">
                            <span className="univer-truncate">{menu.title}</span>
                        </Tooltip>
                    </div>
                </MenuItem>
            );
        });
    }

    const hasMenus = filteredMenus.length > 0;

    const Placeholder = currentPopup?.popup.Placeholder || componentManager.get(QuickInsertPlaceholder.componentKey);

    return (
        <div className={clsx('univer-mt-2')}>
            {hasMenus
                ? (
                    <Menu wrapperClass="univer-max-h-[360px] univer-w-[220px] univer-overflow-y-auto univer-overflow-x-hidden">
                        {renderMenus(filteredMenus)}
                    </Menu>
                )
                : Placeholder && <Placeholder />}
        </div>

    );
};

QuickInsertPopup.componentKey = 'docs.quick.insert.popup';
