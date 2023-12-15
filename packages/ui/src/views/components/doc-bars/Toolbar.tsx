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

import { Dropdown, Tooltip } from '@univerjs/design';
import { MoreFunctionSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useObservable } from '../../../components/hooks/observable';
import type { IDisplayMenuItem, IMenuItem } from '../../../services/menu/menu';
import { MenuGroup, MenuPosition } from '../../../services/menu/menu';
import { IMenuService } from '../../../services/menu/menu.service';
import { ToolbarButton } from './Button/ToolbarButton';
import type { IMenuGroup } from './hooks/menu';
import { position$, positions } from './hooks/menu';
import styles from './index.module.less';
import { ToolbarItem } from './ToolbarItem';

export function Toolbar() {
    const menuService = useDependency(IMenuService);

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

    const position = useObservable(position$, MenuPosition.TOOLBAR_START, true);

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

    function isEmtpyGroup(group: Array<IDisplayMenuItem<IMenuItem>>) {
        return group.filter((item) => !collapsedId.includes(item.id)).length === 0;
    }

    function isEmtpyCollapsedGroup(group: Array<IDisplayMenuItem<IMenuItem>>) {
        return group.filter((item) => collapsedId.includes(item.id)).length === 0;
    }

    return (
        <>
            <div ref={toolbarRef} className={styles.toolbar}>
                <div className={styles.toolbarContainer}>
                    {Object.entries(toolbarGroups).map(
                        ([key, item]) =>
                            !isEmtpyGroup(item) && (
                                <div key={key} className={styles.toolbarGroup}>
                                    {item.map(
                                        (subItem) =>
                                            !collapsedId.includes(subItem.id) && (
                                                <ToolbarItem key={subItem.id} {...subItem} />
                                            )
                                    )}
                                </div>
                            )
                    )}

                    {collapsedId.length > 0 && (
                        <Tooltip title="more" placement="bottom">
                            <Dropdown
                                className={styles.toolbarMore}
                                overlay={
                                    <div className={styles.toolbarMoreContainer} onClick={(e) => e.stopPropagation()}>
                                        {Object.entries(toolbarGroups).map(
                                            ([key, item]) =>
                                                !isEmtpyCollapsedGroup(item) && (
                                                    <div key={key} className={styles.toolbarGroup}>
                                                        {item.map(
                                                            (subItem) =>
                                                                collapsedId.includes(subItem.id) && (
                                                                    <ToolbarItem key={subItem.id} {...subItem} />
                                                                )
                                                        )}
                                                    </div>
                                                )
                                        )}
                                    </div>
                                }
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
