import { LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useEffect, useMemo, useState } from 'react';

import { IDisplayMenuItem, IMenuItem, MenuGroup, MenuPosition } from '../../../services/menu/menu';
import { IMenuService } from '../../../services/menu/menu.service';
import { joinClassNames } from '../../../Utils';
import styles from './index.module.less';
import { ToolbarItem } from './ToolbarItem';

interface IMenuGroup {
    name: string;
    menuItems: Array<IDisplayMenuItem<IMenuItem>>;
}

export function DocBars() {
    const menuService = useDependency(IMenuService);
    const localeService = useDependency(LocaleService);

    const [menuGroups, setMenuGroups] = useState<IMenuGroup[]>([]);
    const [activeMenuGroup, setActiveMenuGroup] = useState<IMenuGroup | null>(null);

    useEffect(() => {
        const listener = menuService.menuChanged$.subscribe(() => {
            const menuGroups = [
                MenuPosition.TOOLBAR_START,
                MenuPosition.TOOLBAR_INSERT,
                MenuPosition.TOOLBAR_FORMULAS,
                MenuPosition.TOOLBAR_DATA,
                MenuPosition.TOOLBAR_VIEW,
                MenuPosition.TOOLBAR_OTHERS,
            ]
                .map((position) => ({
                    name: position,
                    menuItems: menuService.getMenuItems(position),
                }))
                .filter((group) => group.menuItems.length);

            setMenuGroups(menuGroups);

            if (activeMenuGroup === null) {
                setActiveMenuGroup(menuGroups[0]);
            }
        });

        return () => {
            listener.unsubscribe();
        };
    }, []);

    const toolbarGroups = useMemo(() => {
        if (!activeMenuGroup?.menuItems) return [];

        return activeMenuGroup.menuItems.reduce(
            (acc, item) => {
                const key = item.group ?? MenuGroup.TOOLBAR_OTHERS;
                if (!acc[key]) {
                    acc[key] = [];
                }

                acc[key].push(item);
                return acc;
            },
            {} as Record<MenuGroup, Array<IDisplayMenuItem<IMenuItem>>>
        );
    }, [activeMenuGroup]);

    return (
        <section className={styles.docBars}>
            <div className={styles.menubar}>
                {menuGroups.map((group, index) => (
                    <a
                        key={index}
                        className={joinClassNames(styles.menubarItem, {
                            [styles.menubarItemActive]: group.name === activeMenuGroup?.name,
                        })}
                        onClick={() => setActiveMenuGroup(group)}
                    >
                        {localeService.t(group.name) ?? ''}
                    </a>
                ))}
            </div>

            <div className={styles.toolbar}>
                <div className={styles.toolbarContainer}>
                    {Object.entries(toolbarGroups).map(([key, item], index) => (
                        <div className={styles.toolbarGroup}>
                            {item.map((subItem) => (
                                <ToolbarItem key={subItem.id} {...subItem} />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
