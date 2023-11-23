import { LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import clsx from 'clsx';
import React, { ComponentType, useEffect, useState } from 'react';

import { useObservable } from '../../../components/hooks/observable';
import { MenuPosition } from '../../../services/menu/menu';
import { IMenuService } from '../../../services/menu/menu.service';
import { ComponentContainer } from '../ComponentContainer';
import { IMenuGroup, position$, positions, setPosition } from './hooks/menu';
import styles from './index.module.less';

export interface IMenuBarProps {
    headerMenuComponents?: Set<() => ComponentType>;
}

export function MenuBar(props: IMenuBarProps) {
    const { headerMenuComponents } = props;
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
        <header className={styles.headerbar}>
            <div className={styles.menubar}>
                {group.length > 1 &&
                    group.map((item, index) => (
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
            <div className={styles.headerMenu}>
                <ComponentContainer components={headerMenuComponents} />
            </div>
        </header>
    );
}
