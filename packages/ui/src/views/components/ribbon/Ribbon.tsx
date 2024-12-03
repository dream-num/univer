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

import type { ComponentType } from 'react';
import type { IMenuSchema } from '../../../services/menu/menu-manager.service';
import { LocaleService, useDependency } from '@univerjs/core';
import { MoreFunctionSingle } from '@univerjs/icons';
import clsx from 'clsx';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IMenuManagerService } from '../../../services/menu/menu-manager.service';
import { MenuManagerPosition, RibbonPosition } from '../../../services/menu/types';
import { ComponentContainer } from '../ComponentContainer';
import { ToolbarButton } from '../ribbon/Button/ToolbarButton';
import styles from './index.module.less';
import { ToolbarItem } from './ToolbarItem';
import { DropdownWrapper, TooltipWrapper } from './TooltipButtonWrapper';

interface IRibbonProps {
    headerMenuComponents?: Set<ComponentType>;
}

export function Ribbon(props: IRibbonProps) {
    const { headerMenuComponents } = props;

    const menuManagerService = useDependency(IMenuManagerService);
    const localeService = useDependency(LocaleService);

    const toolbarRef = useRef<HTMLDivElement>(null);
    const toolbarItemRefs = useRef<Record<string, { el: HTMLDivElement;key: string }>>({});

    const [ribbon, setRibbon] = useState<IMenuSchema[]>([]);
    const [category, setCategory] = useState<string>(RibbonPosition.START);
    const [collapsedIds, setCollapsedIds] = useState<string[]>([]);

    // subscribe to menu changes
    useEffect(() => {
        function getRibbon(): void {
            const ribbon = menuManagerService.getMenuByPositionKey(MenuManagerPosition.RIBBON);
            setRibbon(ribbon);
        }
        getRibbon();

        const subscription = menuManagerService.menuChanged$.subscribe(getRibbon);

        return () => {
            subscription.unsubscribe();
        };
    }, [menuManagerService]);

    // resize observer
    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            const toolbar = entries[0].target;
            const toolbarWidth = toolbar.clientWidth;
            const toolbarItems = Object.values(toolbarItemRefs.current);
            const collapsedIds: string[] = [];
            let totalWidth = 90;

            for (const { el, key } of toolbarItems) {
                if (!el) continue;

                totalWidth += el.clientWidth + 8;
                if (totalWidth > toolbarWidth) {
                    collapsedIds.push(key);
                }
            }

            setCollapsedIds(collapsedIds);
        });

        if (toolbarRef.current) {
            observer.observe(toolbarRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [ribbon]);

    // Should the header when there is at least one header menu components or menu groups.
    const hasHeaderMenu = useMemo(() => (headerMenuComponents && headerMenuComponents.size > 0) || ribbon.length > 1, [headerMenuComponents, ribbon]);

    const activeGroup = useMemo(() => {
        const allGroups = ribbon.find((group) => group.key === category)?.children ?? [];
        const visibleGroups: IMenuSchema[] = [];
        const hiddenGroups: IMenuSchema[] = [];

        for (const item of allGroups) {
            if (item.children) {
                const visibleChildren = item.children.filter((child) => !collapsedIds.includes(child.key));
                visibleGroups.push({ ...item, children: visibleChildren });

                if (visibleChildren.length < item.children.length) {
                    hiddenGroups.push({ ...item, children: item.children.filter((child) => collapsedIds.includes(child.key)) });
                }
            }
        }

        return {
            allGroups,
            visibleGroups,
            hiddenGroups,
        };
    }, [ribbon, category, collapsedIds]);

    const fakeToolbarContent = useMemo(() => (
        activeGroup.allGroups.map((groupItem) => (
            <div key={groupItem.key} className={styles.toolbarGroup}>
                {groupItem.children?.map((child) => (
                    child.item && (
                        <ToolbarItem
                            key={child.key}
                            ref={(ref) => {
                                toolbarItemRefs.current[child.key] = {
                                    el: ref?.nativeElement as HTMLDivElement,
                                    key: child.key,
                                };
                            }}
                            {...child.item}
                        />
                    )
                ))}
            </div>
        ))
    ), [activeGroup.allGroups]);

    return (
        <>
            {/* header */}
            {hasHeaderMenu && (
                <header className={styles.headerbar}>
                    <div className={styles.menubar}>
                        {ribbon.length > 1 && ribbon.map((group) => (
                            <a
                                key={group.key}
                                className={clsx(styles.menubarItem, {
                                    [styles.menubarItemActive]: group.key === category,
                                })}
                                onClick={() => {
                                    setCategory(group.key);
                                }}
                            >
                                {localeService.t(group.key)}
                            </a>
                        ))}
                    </div>
                    <div className={styles.headerMenu}>
                        <ComponentContainer components={headerMenuComponents} />
                    </div>
                </header>
            )}

            <section role="ribbon" className={styles.toolbar}>
                <div className={styles.toolbarContainer}>
                    {activeGroup.visibleGroups.map((groupItem) => (groupItem.children?.length || groupItem.item) && (
                        <div key={groupItem.key} className={styles.toolbarGroup}>
                            {groupItem.children
                                ? groupItem.children?.map((child) => (
                                    child.item && <ToolbarItem key={child.key} {...child.item} />
                                ))
                                : (
                                    groupItem.item && <ToolbarItem key={groupItem.key} {...groupItem.item} />
                                )}
                        </div>
                    ))}

                    {/* overflow menu items */}
                    {collapsedIds.length > 0 && (
                        <TooltipWrapper title={localeService.t('ribbon.more')} placement="bottom">
                            <DropdownWrapper
                                forceRender
                                overlay={(
                                    <div className={styles.toolbarMoreContainer}>
                                        {activeGroup.hiddenGroups.map((groupItem) => (
                                            <div key={groupItem.key} className={styles.toolbarGroup}>
                                                {groupItem.children
                                                    ? groupItem.children?.map((child) => (
                                                        child.item && <ToolbarItem key={child.key} {...child.item} />
                                                    ))
                                                    : (
                                                        groupItem.item && <ToolbarItem key={groupItem.key} {...groupItem.item} />
                                                    )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            >
                                <ToolbarButton className={styles.toolbarItemTextButton}>
                                    <MoreFunctionSingle />
                                </ToolbarButton>
                            </DropdownWrapper>
                        </TooltipWrapper>
                    )}
                </div>
            </section>

            {/* fake toolbar for calculating overflow width */}
            <div
                ref={toolbarRef}
                className={styles.toolbarContainer}
                style={{
                    position: 'absolute',
                    top: -9999,
                    left: 0,
                    right: 0,
                    // top: 0,
                    // left: 0,
                    // opacity: 1,
                }}
            >
                {fakeToolbarContent}
            </div>
        </>
    );
}
