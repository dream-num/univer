/**
 * Copyright 2023-present DreamNum Inc.
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

import { LocaleService, useDependency } from '@univerjs/core';
import React, { useCallback, useEffect } from 'react';

import { useObservable } from '../../../components/hooks/observable';
import { IShortcutService } from '../../../services/shortcut/shortcut.service';
import styles from './index.module.less';

interface IRenderShortcutItem {
    title: string;
    shortcut: string;
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

    const [shortcutItems, setShortcutItems] = React.useState<IShortcutGroup[]>([]);

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
                    items,
                };
            })
            .sort((a, b) => a.sequence - b.sequence);

        setShortcutItems(toRender);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shortcutService, localeService, currentLocale]);

    useEffect(() => {
        updateShortcuts();

        const subscription = shortcutService.shortcutChanged$.subscribe(() => updateShortcuts());
        return () => subscription.unsubscribe();
    }, [shortcutService, updateShortcuts]);

    return (
        <div className={styles.shortcutPanel}>
            {shortcutItems.map((group) => (
                <div className={styles.shortcutPanelGroup} key={group.name}>
                    <div className={styles.shortcutPanelGroupTitle}>{group.name}</div>
                    {group.items.map((item, index) => (
                        <div className={styles.shortcutPanelItem} key={`${item.title}-${item.shortcut}`}>
                            <span className={styles.shortcutPanelItemTitle}>{item.title}</span>
                            <span className={styles.shortcutPanelItemShortcut}>{item.shortcut}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
