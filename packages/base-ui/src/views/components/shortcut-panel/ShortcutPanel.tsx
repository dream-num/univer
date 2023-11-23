import { LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useCallback, useEffect } from 'react';

import { IShortcutService } from '../../../services/shortcut/shortcut.service';
import styles from './index.module.less';

// TODO@wzhudev: shortcuts should be displayed in groups

interface IRenderShortcutItem {
    title: string;
    shortcut: string;
}

/**
 * This component is responsible for rendering the shortcut panel on the desktop version of the app.
 */
export function ShortcutPanel() {
    const shortcutService = useDependency(IShortcutService);
    const localeService = useDependency(LocaleService);

    const [shortcutItems, setShortcutItems] = React.useState<IRenderShortcutItem[]>([]);

    const updateShortcuts = useCallback(() => {
        const shortcuts = shortcutService.getAllShortcuts();
        const shortcutItems: IRenderShortcutItem[] = [];

        for (const shortcut of shortcuts) {
            const shortcutItem: IRenderShortcutItem = {
                title: localeService.t(shortcut.description ?? shortcut.id),
                shortcut: shortcutService.getShortcutDisplay(shortcut.id)!,
            };

            shortcutItems.push(shortcutItem);
        }

        setShortcutItems(shortcutItems);
    }, [shortcutService]);

    useEffect(() => {
        // first update
        updateShortcuts();

        // subscribe to shortcut changes and re-render
        const subscription = shortcutService.shortcutChanged$.subscribe(() => updateShortcuts());
        return () => subscription.unsubscribe();
    }, [shortcutService]);

    // TODO@wzhudev: add some UI here

    return (
        <div className={styles.shortcutPanel}>
            {shortcutItems.map((item, index) => (
                <div className={styles.shortcutPanelItem} key={index}>
                    <span className={styles.shortcutPanelItemTitle}>{item.title}</span>
                    <span className={styles.shortcutPanelItemShortcut}>{item.shortcut}</span>
                </div>
            ))}
        </div>
    );
}
