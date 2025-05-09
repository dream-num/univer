/**
 * Copyright 2023-present DreamNum Co., Ltd.
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
import { LocaleService } from '@univerjs/core';
import { borderBottomClassName, clsx } from '@univerjs/design';
import { MoreFunctionSingle } from '@univerjs/icons';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IMenuManagerService } from '../../../services/menu/menu-manager.service';
import { MenuManagerPosition, RibbonPosition } from '../../../services/menu/types';
import { useDependency } from '../../../utils/di';
import { ComponentContainer } from '../ComponentContainer';
import { ToolbarButton } from '../ribbon/Button/ToolbarButton';
import { ToolbarItem } from './ToolbarItem';
import { DropdownWrapper, TooltipWrapper } from './TooltipButtonWrapper';

interface IRibbonProps {
    headerMenuComponents?: Set<ComponentType>;
    headerMenu?: boolean;
}

export function Ribbon(props: IRibbonProps) {
    const { headerMenuComponents, headerMenu = true } = props;

    const menuManagerService = useDependency(IMenuManagerService);
    const localeService = useDependency(LocaleService);

    const fakeToolbarRef = useRef<HTMLDivElement>(null);
    const toolbarItemRefs = useRef<Record<string, {
        el: HTMLSpanElement;
        key: string;
        groupOrder: number;
        order: number;
    }>>({});

    const [ribbon, setRibbon] = useState<IMenuSchema[]>([]);
    const [activatedTab, setActivatedTab] = useState<string>(RibbonPosition.START);
    const [changingActiveTab, setChangingActiveTab] = useState(false);
    const [collapsedIds, setCollapsedIds] = useState<string[]>([]);

    const separatorClassName = `[&>*:last-child:after]:univer-absolute [&>*:last-child:after]:-univer-right-2
    [&>*:last-child:after]:univer-top-1/2 [&>*:last-child:after]:univer-h-5 [&>*:last-child:after]:univer-translate-x-[3px]
    [&>*:last-child:after]:univer-w-px [&>*:last-child:after]:-univer-translate-y-1/2
    [&>*:last-child:after]:univer-bg-gray-200 [&>*:last-child:after]:univer-content-['']
    [&>*:last-child]:univer-relative dark:[&>*:last-child:after]:univer-bg-gray-600`;

    const handleSelectTab = useCallback((group: IMenuSchema) => {
        toolbarItemRefs.current = {};
        setChangingActiveTab(true);
        const timer = setTimeout(() => {
            setChangingActiveTab(false);
        }, 300);
        setActivatedTab(group.key);

        return () => {
            clearTimeout(timer);
        };
    }, []);

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

    const activeGroup = useMemo(() => {
        const allGroups = ribbon.find((group) => group.key === activatedTab)?.children ?? [];
        const visibleGroups: IMenuSchema[] = [];
        const hiddenGroups: IMenuSchema[] = [];

        for (const item of allGroups) {
            if (item.children) {
                const visibleChildren = item.children.filter((child) => !collapsedIds.includes(child.key));
                if (visibleChildren.length > 0) {
                    visibleGroups.push({
                        ...item,
                        children: visibleChildren,
                    });
                }

                if (visibleChildren.length < item.children.length) {
                    hiddenGroups.push({
                        ...item,
                        children: item.children.filter((child) => collapsedIds.includes(child.key)),
                    });
                }
            }
        }

        return {
            allGroups,
            visibleGroups,
            hiddenGroups,
        };
    }, [ribbon, activatedTab, collapsedIds]);

    // resize observer
    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            const toolbar = entries[0].target;
            const toolbarWidth = toolbar.clientWidth;
            const toolbarItems = Object.values(toolbarItemRefs.current);
            const sortedToolbarItems = toolbarItems.sort((a, b) => {
                if (a.groupOrder === b.groupOrder) {
                    return a.order - b.order;
                }
                return a.groupOrder - b.groupOrder;
            });

            const newCollapsedIds: string[] = [];
            let totalWidth = 0;

            const allGroups = ribbon.find((group) => group.key === activatedTab)?.children ?? [];

            const gapWidth = (allGroups.length - 1) * 8;
            totalWidth += gapWidth;

            for (const { el, key } of sortedToolbarItems) {
                if (!el) continue;

                totalWidth += el?.getBoundingClientRect().width + 8;

                if (totalWidth > toolbarWidth - 32 - gapWidth) {
                    newCollapsedIds.push(key);
                }
            }

            if (JSON.stringify(newCollapsedIds) !== JSON.stringify(collapsedIds)) {
                setCollapsedIds(newCollapsedIds);
            }
        });

        if (fakeToolbarRef.current) {
            observer.observe(fakeToolbarRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [ribbon, activatedTab, collapsedIds]);

    const fakeToolbarContent = useMemo(() => (
        activeGroup.allGroups.map((groupItem) => (
            <Fragment key={groupItem.key}>
                <div className={clsx('univer-flex univer-flex-nowrap univer-gap-2 univer-px-2', separatorClassName)}>
                    {groupItem.children?.map((child) => (
                        child.item && (
                            <ToolbarItem
                                key={child.key}
                                {...child.item}
                                ref={(ref) => {
                                    if (ref?.el) {
                                        toolbarItemRefs.current[child.key] = {
                                            el: ref.el,
                                            key: child.key,
                                            groupOrder: groupItem.order,
                                            order: child.order,
                                        };
                                    }
                                }}
                            />
                        )
                    ))}
                </div>
            </Fragment>
        ))
    ), [activeGroup.allGroups]);

    return (
        <>
            {/* header */}
            {headerMenu && (
                <header className="univer-relative univer-select-none">
                    <div
                        className={clsx(`
                          univer-flex univer-h-0 univer-items-center univer-justify-center univer-gap-2
                          univer-overflow-hidden univer-transition-all univer-animate-in
                        `, {
                            'univer-h-8 univer-slide-in-from-top-full': ribbon.length > 1 || (headerMenuComponents && headerMenuComponents.size > 0),
                        })}
                    >
                        {ribbon.length > 1 && ribbon.map((group) => (
                            <a
                                key={group.key}
                                className={clsx(`
                                  univer-box-border univer-cursor-pointer univer-rounded univer-px-2 univer-py-0.5
                                  univer-text-sm univer-text-gray-700 univer-transition-colors
                                  dark:univer-text-white dark:hover:univer-bg-gray-700
                                  hover:univer-bg-gray-100
                                `, {
                                    'univer-bg-primary-500 univer-text-white hover:!univer-bg-primary-500': group.key === activatedTab,
                                })}
                                onClick={() => handleSelectTab(group)}
                            >
                                {localeService.t(group.key)}
                            </a>
                        ))}
                    </div>

                    {(headerMenuComponents && headerMenuComponents.size > 0) && (
                        <div
                            className={`
                              univer-absolute univer-right-2 univer-top-0 univer-flex univer-h-full univer-items-center
                              univer-gap-2
                              [&>*]:univer-inline-flex [&>*]:univer-h-6 [&>*]:univer-items-center [&>*]:univer-rounded
                              [&>*]:univer-px-1 [&>*]:univer-transition-colors
                              hover:[&>*]:univer-bg-gray-100
                            `}
                        >
                            <ComponentContainer components={headerMenuComponents} />
                        </div>
                    )}
                </header>
            )}

            <section
                role="toolbar"
                className={clsx(`
                  univer-relative univer-box-border univer-flex univer-h-8 univer-select-none univer-items-center
                  univer-bg-white univer-text-base univer-text-gray-800 univer-transition-opacity
                  dark:univer-bg-gray-900
                `, borderBottomClassName)}
            >
                <div
                    className={clsx(`
                      univer-mx-auto univer-box-border univer-flex univer-h-full univer-flex-1 univer-items-center
                      univer-justify-center univer-gap-1 univer-overflow-hidden univer-bg-gray-50 univer-px-4
                      dark:univer-bg-gray-900
                    `, {
                        'univer-duration-300 univer-animate-in univer-fade-in': changingActiveTab,
                    })}
                >
                    {activeGroup.visibleGroups.map((groupItem) => (groupItem.children?.length || groupItem.item) && (
                        <Fragment key={groupItem.key}>
                            <div className={clsx('univer-flex univer-flex-nowrap univer-gap-2 univer-px-2', separatorClassName)}>
                                {groupItem.children
                                    ? groupItem.children?.map((child) => (
                                        child.item && <ToolbarItem key={child.key} {...child.item} />
                                    ))
                                    : (
                                        groupItem.item && <ToolbarItem key={groupItem.key} {...groupItem.item} />
                                    )}
                            </div>
                        </Fragment>
                    ))}

                    {/* overflow menu items */}
                    {collapsedIds.length > 0 && (
                        <div className="univer-px-2">
                            <TooltipWrapper title={localeService.t('ribbon.more')} placement="bottom">
                                <DropdownWrapper
                                    align="end"
                                    overlay={(
                                        <div
                                            className={`
                                              univer-box-border univer-grid
                                              univer-max-w-[var(--radix-popper-available-width)] univer-gap-2 univer-p-2
                                            `}
                                        >
                                            {activeGroup.hiddenGroups.map((groupItem) => (
                                                <div
                                                    key={groupItem.key}
                                                    className="univer-flex univer-items-center univer-gap-2"
                                                >
                                                    <div className="univer-flex univer-flex-wrap univer-gap-2">
                                                        {groupItem.children
                                                            ? groupItem.children?.map((child) => (
                                                                child.item && <ToolbarItem key={child.key} {...child.item} />
                                                            ))
                                                            : (
                                                                groupItem.item && <ToolbarItem key={groupItem.key} {...groupItem.item} />
                                                            )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                >
                                    <ToolbarButton>
                                        <MoreFunctionSingle />
                                    </ToolbarButton>
                                </DropdownWrapper>
                            </TooltipWrapper>
                        </div>
                    )}
                </div>
            </section>

            {/* fake toolbar for calculating overflow width */}
            <div
                aria-hidden
                ref={fakeToolbarRef}
                className={`
                  univer-invisible univer-absolute univer-left-0 univer-right-0 univer-top-[-99999px] univer-mx-auto
                  univer-box-border univer-flex univer-h-full univer-flex-1 univer-items-center univer-justify-center
                  univer-gap-1 univer-overflow-hidden univer-px-4
                `}
            >
                {fakeToolbarContent}
            </div>
        </>
    );
}
