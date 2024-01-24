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
import { Dropdown, Tooltip } from '@univerjs/design';
import { MoreFunctionSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import clsx from 'clsx';
import type { ComponentType } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import type { IDisplayMenuItem, IMenuItem } from '../../../services/menu/menu';
import { MenuGroup, MenuPosition } from '../../../services/menu/menu';
import { IMenuService } from '../../../services/menu/menu.service';
import { ComponentContainer } from '../ComponentContainer';
import { ToolbarButton } from './Button/ToolbarButton';
import styles from './index.module.less';
import { ToolbarItem } from './ToolbarItem';

interface IMenuGroup {
    name: MenuPosition;
    menuItems: Array<IDisplayMenuItem<IMenuItem>>;
}

export const positions = [
    MenuPosition.TOOLBAR_START,
    MenuPosition.TOOLBAR_INSERT,
    MenuPosition.TOOLBAR_FORMULAS,
    MenuPosition.TOOLBAR_DATA,
    MenuPosition.TOOLBAR_VIEW,
    MenuPosition.TOOLBAR_OTHERS,
];

export interface IToolbarProps {
    headerMenuComponents?: Set<() => ComponentType>;
}

export function Toolbar(props: IToolbarProps) {
    const { headerMenuComponents } = props;
    const localeService = useDependency(LocaleService);
    const menuService = useDependency(IMenuService);
    const [position, setPosition] = useState<MenuPosition>(MenuPosition.TOOLBAR_START);

    const toolbarRef = useRef<HTMLDivElement>(null);
    const toolbarContainerRef = useRef<HTMLDivElement>(null);
    const toolbarItemRefs = useRef<
        Record<
            string,
            {
                el: HTMLDivElement;
                key: string;
            }
        >
    >({});

    const [group, setGroup] = useState<IMenuGroup[]>([]);
    const [collapsedId, setCollapsedId] = useState<string[]>([]);

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
    }, [position]);

    useEffect(() => {
        function resize() {
            const wrapperWidth = toolbarRef.current?.clientWidth ?? 0;
            const containerWidth = toolbarContainerRef.current?.clientWidth ?? 0;

            const itemWidths = Object.entries(toolbarItemRefs.current).map(([key, ref]) => {
                return {
                    key: ref.key,
                    width: ref.el?.clientWidth,
                };
            });

            const gap = 8;

            const collapsedIds: string[] = [];

            let currentWidth = containerWidth + 120;
            for (let i = itemWidths.length - 1; i >= 0; i--) {
                const item = itemWidths[i];
                currentWidth -= item.width + gap;
                if (currentWidth >= wrapperWidth) {
                    collapsedIds.push(item.key);
                }
            }

            setCollapsedId(collapsedIds);
        }

        resize();
        const observer = new ResizeObserver(() => resize());

        observer.observe(document.body);

        return () => {
            observer.unobserve(document.body);
        };
    }, [group]);

    const toolbarGroups = useMemo(() => {
        return (
            group
                .find((g) => g.name === position)
                ?.menuItems.reduce(
                    (acc, item) => {
                        const key = item.group ?? MenuGroup.TOOLBAR_OTHERS;
                        if (!acc[key]) {
                            acc[key] = [];
                        }

                        acc[key].push(item);
                        return acc;
                    },
                    {} as Record<MenuGroup, Array<IDisplayMenuItem<IMenuItem>>>
                ) ?? ({} as Record<MenuGroup, Array<IDisplayMenuItem<IMenuItem>>>)
        );
    }, [group]);

    return (
        <>
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

            <div ref={toolbarRef} className={styles.toolbar}>
                <div className={styles.toolbarContainer}>
                    {Object.entries(toolbarGroups).map(([key, item]) => (
                        <div key={key} className={styles.toolbarGroup}>
                            {item.map(
                                (subItem) =>
                                    !collapsedId.includes(subItem.id) && <ToolbarItem key={subItem.id} {...subItem} />
                            )}
                        </div>
                    ))}

                    {collapsedId.length > 0 && (
                        <Tooltip title="更多" placement="bottom">
                            <Dropdown
                                className={styles.toolbarMore}
                                overlay={(
                                    <div className={styles.toolbarMoreContainer} onClick={(e) => e.stopPropagation()}>
                                        {Object.entries(toolbarGroups).map(([key, item]) => (
                                            <div key={key} className={styles.toolbarGroup}>
                                                {item.map(
                                                    (subItem) =>
                                                        collapsedId.includes(subItem.id) && (
                                                            <ToolbarItem key={subItem.id} {...subItem} />
                                                        )
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            >
                                <ToolbarButton className={styles.toolbarItemTextButton}>
                                    <MoreFunctionSingle />
                                </ToolbarButton>
                            </Dropdown>
                        </Tooltip>
                    )}
                </div>
            </div>

            {/* fake toolbar for calculating overflow width */}
            <div
                ref={toolbarContainerRef}
                className={styles.toolbarContainer}
                style={{
                    position: 'absolute',
                    top: -9999,
                    left: -9999,
                    opacity: 0,
                }}
            >
                {Object.entries(toolbarGroups).map(([key, item]) => (
                    <div key={key} className={styles.toolbarGroup}>
                        {item.map((subItem) => (
                            <ToolbarItem
                                key={subItem.id}
                                ref={(ref) => {
                                    toolbarItemRefs.current[subItem.id] = {
                                        el: ref?.nativeElement as HTMLDivElement,
                                        key: subItem.id,
                                    };
                                }}
                                {...subItem}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
}
