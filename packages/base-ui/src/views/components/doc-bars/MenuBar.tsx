import { LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { useObservable } from '../../../components/hooks/observable';
import { MenuPosition } from '../../../services/menu/menu';
import { IMenuService } from '../../../services/menu/menu.service';
import { IMenuGroup, position$, positions, setPosition } from './hooks/menu';
import styles from './index.module.less';

export function MenuBar() {
    const localeService = useDependency(LocaleService);
    const menuService = useDependency(IMenuService);

    const [group, setGroup] = useState<IMenuGroup[]>([]);

    useEffect(() => {
        const listener = menuService.menuChanged$.subscribe(() => {
            const group: IMenuGroup[] = [];
            for (const position of positions) {
                const menuItems = menuService.getMenuItems(position);

                if (menuItems.length) {
                    group.push({
                        name: position,
                        menuItems,
                    });
                }
            }

            setGroup(group);
        });

        return () => {
            listener.unsubscribe();
        };
    }, []);

    const position = useObservable(position$, MenuPosition.TOOLBAR_START, true);

    return (
        <div className={styles.menubar}>
            {group.map((item, index) => (
                <a
                    key={index}
                    className={clsx(styles.menubarItem, {
                        [styles.menubarItemActive]: item.name === position,
                    })}
                    onClick={() => setPosition(item.name)}
                >
                    {localeService.t(item.name)}
                </a>
            ))}
        </div>
    );
}
