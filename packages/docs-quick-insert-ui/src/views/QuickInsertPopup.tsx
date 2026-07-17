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
import {
    CommandType,
    Direction,
    DisposableCollection,
    generateRandomId,
    ICommandService,
    LocaleService,
    toDisposable,
} from '@univerjs/core';
import { IShortcutService, KeyCode, useDependency, useObservable } from '@univerjs/ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CloseQuickInsertPopupOperation } from '../commands/operations/quick-insert-popup.operation';
import { DocQuickInsertPopupService } from '../services/doc-quick-insert-popup.service';
import { getQuickInsertMenuLeafCount, QuickInsertMenu } from './QuickInsertMenu';
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
    const shortcutService = useDependency(IShortcutService);
    const commandService = useDependency(ICommandService);

    const id = useMemo(() => generateRandomId(), []);

    const [focusedMenuIndex, setFocusedMenuIndex] = useState(0);
    const focusedMenuRef = useRef<IDocPopupMenuItem | null>(null);

    const filterKeyword = useObservable(docQuickInsertPopupService.filterKeyword$, '');
    const currentPopup = useObservable(docQuickInsertPopupService.editPopup$);
    const menus = useObservable<DocPopupMenu[]>(currentPopup?.popup.menus$, []);

    const translatedMenus = useMemo(() => {
        return translateMenus(menus, localeService);
    }, [menus]);

    const [filteredMenus, setFilteredMenus] = useState<DocPopupMenu[]>(() => {
        return filterMenusByKeyword(translatedMenus, filterKeyword.toLowerCase());
    });
    const filteredMenuCount = useMemo(() => getQuickInsertMenuLeafCount(filteredMenus), [filteredMenus]);
    const filteredMenuCountRef = useRef(filteredMenuCount);

    useEffect(() => {
        filteredMenuCountRef.current = filteredMenuCount;
    }, [filteredMenuCount]);

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

    const handleFocusedMenuChange = useCallback((menu: IDocPopupMenuItem | null) => {
        focusedMenuRef.current = menu;
    }, []);

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
                    if (filteredMenuCountRef.current <= 0) {
                        return 0;
                    }

                    const nextIndex = (index - 1);

                    return nextIndex >= 0 ? nextIndex : filteredMenuCountRef.current - 1;
                });
            },
        };
        const moveCursorDownCommand = {
            id: `quick.insert.popup.move.cursor.down.${id}`,
            type: CommandType.OPERATION,
            handler: () => {
                setFocusedMenuIndex((index) => {
                    if (filteredMenuCountRef.current <= 0) {
                        return 0;
                    }

                    const nextIndex = (index + 1);

                    return nextIndex <= (filteredMenuCountRef.current - 1) ? nextIndex : 0;
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
    }, [commandService, id, shortcutService]);

    useEffect(() => {
        setFocusedMenuIndex(0);
    }, [filteredMenus]);

    const hasMenus = filteredMenus.length > 0;

    const Placeholder = currentPopup?.popup.Placeholder || QuickInsertPlaceholder;

    return (
        <div className="univer-mt-2">
            {hasMenus
                ? (
                    <QuickInsertMenu
                        menus={filteredMenus}
                        focusedMenuIndex={focusedMenuIndex}
                        onFocusedMenuIndexChange={setFocusedMenuIndex}
                        onFocusedMenuChange={handleFocusedMenuChange}
                        onSelect={handleMenuSelect}
                    />
                )
                : Placeholder && <Placeholder />}
        </div>

    );
};

QuickInsertPopup.componentKey = 'docs.quick.insert.popup';
