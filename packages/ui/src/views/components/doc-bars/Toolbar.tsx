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
import { ComponentContainer } from '../ComponentContainer';
import { ToolbarButton } from './Button/ToolbarButton';
import styles from './index.module.less';
import { ToolbarItem } from './ToolbarItem';
import { useToolbarGroups } from './hook';

export interface IMenuGroup {
    name: MenuPosition;
    menuItems: Array<IDisplayMenuItem<IMenuItem>>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const MENU_POSITIONS = [
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

/**
 * Univer's built in toolbar component.
 */
export function Toolbar(props: IToolbarProps) {
    const { headerMenuComponents } = props;
    const localeService = useDependency(LocaleService);

    const toolbarRef = useRef<HTMLDivElement>(null);
    const toolbarItemRefs = useRef<Record<string, {
        el: HTMLDivElement;
        key: string;
    }>>({});

    const { setCategory, visibleItems, groups, category } = useToolbarGroups();
    const [collapsedId, setCollapsedId] = useState<string[]>([]);

    // Deal with toolbar collapsing.
    useEffect(() => {
        function resize() {
            const wrapperWidth = toolbarRef.current?.clientWidth ?? 0;
            const GAP = 8;
            const itemWidths = Object.entries(toolbarItemRefs.current)
                .filter(([_, ref]) => ref.el && ref.key && visibleItems.find((item) => item.id === ref.key))
                .map(([_, ref]) => ({
                    key: ref.key,
                    width: ref.el?.clientWidth + GAP,
                }));

            const collapsedId: string[] = [];

            let currentWidth = 182;
            for (const item of itemWidths) {
                currentWidth += item.width;

                if (currentWidth > wrapperWidth) {
                    collapsedId.push(item.key);
                }
            }

            setCollapsedId(collapsedId);
        }

        resize();
        const observer = new ResizeObserver(() => resize());
        observer.observe(document.body);
        return () => observer.unobserve(document.body);
    }, [visibleItems, groups, category]);

    const groupsByKey = useMemo(() => {
        return groups.find((g) => g.name === category)?.menuItems.reduce(
            (acc, item) => {
                const key = item.group ?? MenuGroup.TOOLBAR_OTHERS;
                if (!acc[key]) {
                    acc[key] = [];
                }

                acc[key].push(item);
                return acc;
            },
            {} as Record<MenuGroup, Array<IDisplayMenuItem<IMenuItem>>>
        ) ?? ({} as Record<MenuGroup, Array<IDisplayMenuItem<IMenuItem>>>);
    }, [groups, category]);

    // Should the header when there is at least one header menu components or menu groups.
    const hasHeaderMenu = useMemo(() => (headerMenuComponents && headerMenuComponents.size > 0) || groups.length > 1, [headerMenuComponents, groups]);

    return (
        <>
            {hasHeaderMenu
                ? (
                    <header className={styles.headerbar}>
                        <div className={styles.menubar}>
                            {groups.length > 1 &&
                                groups.map((item, index) => (
                                    <a
                                        key={index}
                                        className={clsx(styles.menubarItem, {
                                            [styles.menubarItemActive]: item.name === category,
                                        })}
                                        onClick={() => {
                                            setCategory(item.name);
                                        }}
                                    >
                                        {localeService.t(item.name)}
                                    </a>
                                ))}
                        </div>
                        <div className={styles.headerMenu}>
                            <ComponentContainer components={headerMenuComponents} />
                        </div>
                    </header>
                )
                : null}

            <div ref={toolbarRef} className={styles.toolbar}>
                <div className={styles.toolbarContainer}>
                    {Object.entries(groupsByKey)
                        .filter(([_, item]) => {
                            const count = item.filter((subItem) => !collapsedId.includes(subItem.id)).length;
                            return count;
                        })
                        .map(([key, item]) => (
                            <div key={key} className={styles.toolbarGroup}>
                                {item.map(
                                    (subItem) =>
                                        !collapsedId.includes(subItem.id) && (
                                            <ToolbarItem key={subItem.id} {...subItem} />
                                        )
                                )}
                            </div>
                        ))}

                    {collapsedId.length > 0 && (
                        <Tooltip title={localeService.t('more')} placement="bottom">
                            <Dropdown
                                forceRender
                                className={styles.toolbarMore}
                                overlay={(
                                    <div className={styles.toolbarMoreContainer} onClick={(e) => e.stopPropagation()}>
                                        {Object.entries(groupsByKey).map(([key, item]) => (
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
                className={styles.toolbarContainer}
                style={{
                    position: 'absolute',
                    top: -9999,
                    left: -9999,
                    opacity: 0,
                }}
            >
                {Object.entries(groupsByKey).map(([key, item]) => (
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
