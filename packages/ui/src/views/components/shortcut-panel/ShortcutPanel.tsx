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

import { dedupeBy, LocaleService } from '@univerjs/core';

import { clsx, divideYClassName, KBD } from '@univerjs/design';
import { useCallback, useEffect, useState } from 'react';
import { IShortcutService } from '../../../services/shortcut/shortcut.service';
import { useDependency, useObservable } from '../../../utils/di';

interface IRenderShortcutItem {
    title: string;
    shortcut: string | null;
}

interface IShortcutGroup {
    items: IRenderShortcutItem[];
    sequence: number;
    name: string;
}

/**
 * This component is responsible for rendering the shortcut panel on the desktop version of the app.
 */
export function ShortcutPanel() {
    const shortcutService = useDependency(IShortcutService);
    const localeService = useDependency(LocaleService);
    const currentLocale = useObservable(localeService.currentLocale$);

    const [shortcutItems, setShortcutItems] = useState<IShortcutGroup[]>([]);

    const updateShortcuts = useCallback(() => {
        const shortcutGroups = new Map<string, IRenderShortcutItem[]>();

        const shortcuts = shortcutService.getAllShortcuts().filter((item) => !!item.group);
        for (const shortcut of shortcuts) {
            const group = shortcut.group!;
            const shortcutItem: IRenderShortcutItem = {
                title: localeService.t(shortcut.description ?? shortcut.id),
                shortcut: shortcutService.getShortcutDisplay(shortcut),
            };

            if (!/\d+_[a-zA-Z0-9]/.test(group)) {
                throw new Error(`[ShortcutPanel]: Invalid shortcut group: ${group}!`);
            }

            if (!shortcutGroups.has(group)) {
                shortcutGroups.set(group, []);
            }

            shortcutGroups.get(group)!.push(shortcutItem);
        }

        const toRender = Array.from(shortcutGroups.entries())
            .map(([name, items]) => {
                const groupSequence = name.split('_')[0];
                const groupName = name.slice(groupSequence.length + 1);

                return {
                    sequence: +groupSequence,
                    name: localeService.t(groupName),
                    items: dedupeBy(items, (item) => item.title + item.shortcut),
                };
            })
            .sort((a, b) => a.sequence - b.sequence);

        // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
        setShortcutItems(toRender);
    }, [shortcutService, localeService, currentLocale]);

    useEffect(() => {
        updateShortcuts();

        const subscription = shortcutService.shortcutChanged$.subscribe(() => updateShortcuts());
        return () => subscription.unsubscribe();
    }, [shortcutService, updateShortcuts]);

    return (
        <ul
            className={`
              univer-m-0 univer-list-none univer-p-0 univer-text-gray-900
              dark:univer-text-white
            `}
        >
            {shortcutItems.map((group) => (
                <li key={group.name}>
                    <div className="univer-flex univer-h-10 univer-items-center univer-text-sm univer-font-semibold">
                        {group.name}
                    </div>

                    <ul
                        className={clsx('univer-list-none univer-p-0', divideYClassName)}
                    >
                        {group.items.map((item) => (
                            <li
                                key={`${item.title}-${item.shortcut}`}
                                className={`
                                  univer-flex univer-h-10 univer-items-center univer-justify-between univer-text-sm
                                  last:univer-border-b-0
                                `}
                            >
                                <span className="univer-line-clamp-1">{item.title}</span>
                                {item.shortcut && <KBD keyboard={item.shortcut} />}
                            </li>
                        ))}
                    </ul>
                </li>
            ))}
        </ul>
    );
}
