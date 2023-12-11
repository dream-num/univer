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

import { LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import clsx from 'clsx';
import type { ComponentType } from 'react';
import React, { useEffect, useState } from 'react';

import { useObservable } from '../../../components/hooks/observable';
import { MenuPosition } from '../../../services/menu/menu';
import { IMenuService } from '../../../services/menu/menu.service';
import { ComponentContainer } from '../ComponentContainer';
import type { IMenuGroup } from './hooks/menu';
import { position$, positions, setPosition } from './hooks/menu';
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
