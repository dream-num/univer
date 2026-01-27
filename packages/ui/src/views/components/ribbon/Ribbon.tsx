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
import type { RibbonType } from '../../../controllers/ui/ui.controller';
import type { IMenuSchema } from '../../../services/menu/menu-manager.service';
import { LocaleService, throttle } from '@univerjs/core';
import { borderBottomClassName, clsx, divideXClassName, Dropdown } from '@univerjs/design';
import { MoreFunctionIcon } from '@univerjs/icons';
import { Fragment, useCallback, useEffect, useMemo, useRef } from 'react';
import { RibbonPosition } from '../../../services/menu/types';
import { IRibbonService } from '../../../services/ribbon/ribbon.service';
import { useDependency, useObservable } from '../../../utils/di';
import { ComponentContainer } from '../ComponentContainer';
import { ClassicMenu } from './ribbon-menu/ClassicMenu';
import { DefaultMenu } from './ribbon-menu/DefaultMenu';
import { toolbarButtonClassName } from './ToolbarButton';
import { ToolbarItem } from './ToolbarItem';

interface IRibbonProps {
    ribbonType: RibbonType;
    headerMenuComponents?: Set<ComponentType>;
    headerMenu?: boolean;
}

export function Ribbon(props: IRibbonProps) {
    const { ribbonType, headerMenuComponents, headerMenu = true } = props;

    const ribbonService = useDependency(IRibbonService);
    const localeService = useDependency(LocaleService);

    const containerRef = useRef<HTMLDivElement>(null!);
    const toolbarItemRefs = useRef<Record<string, {
        el: HTMLElement;
        key: string;
        order: number;
        groupOrder: number;
        itemOrder: number;
    }>>({});

    const ribbonData = useObservable(ribbonService.ribbon$, []);
    const activatedTab = useObservable(ribbonService.activatedTab$, RibbonPosition.START);
    const collapsedIds = useObservable(ribbonService.collapsedIds$, []);
    const fakeToolbarVisible = useObservable(ribbonService.fakeToolbarVisible$, false);

    const ribbon = useMemo(() => {
        if (ribbonType === 'simple') {
            const simpleRibbon: IMenuSchema[] = [{ key: RibbonPosition.START, children: [], order: 0 }];
            ribbonData.forEach((group) => {
                group.children?.forEach((item) => {
                    simpleRibbon[0].children?.push(item);
                });
            });

            return simpleRibbon;
        }

        return ribbonData;
    }, [ribbonType, ribbonData]);

    const handleSelectTab = useCallback((group: IMenuSchema) => {
        toolbarItemRefs.current = {};
        ribbonService.setActivatedTab(group.key);
    }, []);

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
    }, [collapsedIds, ribbon, activatedTab]);

    useEffect(() => {
        let timer: number | null = null;
        const observer = new ResizeObserver(throttle((entries) => {
            for (const entry of entries) {
                ribbonService.setFakeToolbarVisible(true);

                timer = requestAnimationFrame(() => {
                    const { width: avaliableWidth } = entry.contentRect;
                    const toolbarItems = Object.values(toolbarItemRefs.current);
                    const sortedToolbarItems = toolbarItems.sort((a, b) => {
                        return a.order - b.order || a.groupOrder - b.groupOrder || a.itemOrder - b.itemOrder;
                    });

                    const newCollapsedIds: string[] = [];
                    let totalWidth = 32;
                    const allGroups = ribbon.find((group) => group.key === activatedTab)?.children ?? [];

                    const gapWidth = (allGroups.length - 1) * 8;
                    totalWidth += gapWidth;

                    for (const { el, key } of sortedToolbarItems) {
                        const { width } = el.getBoundingClientRect();
                        totalWidth += width + 8;

                        if (totalWidth > avaliableWidth) {
                            newCollapsedIds.push(key);
                        }
                    }

                    ribbonService.setCollapsedIds(newCollapsedIds);

                    ribbonService.setFakeToolbarVisible(false);
                });
            }
        }, 100));

        observer.observe(containerRef.current);

        return () => {
            timer && cancelAnimationFrame(timer);
            observer.disconnect();
        };
    }, [ribbon, activatedTab]);

    const fakeToolbar = useMemo(() => {
        return (
            <div
                aria-hidden="true"
                className={clsx(`
                  univer-invisible univer-absolute -univer-left-[99999] -univer-top-[99999] univer-box-border
                  univer-flex univer-h-10 univer-min-w-min univer-items-center univer-px-3 univer-opacity-0
                `, {
                    'univer-hidden': !fakeToolbarVisible,
                }, divideXClassName, borderBottomClassName)}
            >
                {activeGroup.allGroups.map((groupItem, index) => (groupItem.children?.length || groupItem.item) && (
                    <Fragment key={groupItem.key}>
                        <div className="univer-grid univer-shrink-0 univer-grid-flow-col univer-gap-2 univer-px-2">
                            {groupItem.children && groupItem.children?.map((child) => (
                                child.item && (
                                    <ToolbarItem
                                        key={child.key}
                                        {...child.item}
                                        ref={(ref) => {
                                            if (ref?.el) {
                                                toolbarItemRefs.current[child.key] = {
                                                    el: ref.el,
                                                    key: child.key,
                                                    order: index,
                                                    groupOrder: groupItem.order,
                                                    itemOrder: child.order,
                                                };
                                            }
                                        }}
                                    />
                                )
                            ))}
                        </div>
                    </Fragment>
                ))}
            </div>
        );
    }, [activeGroup.allGroups, fakeToolbarVisible]);

    return (
        <>
            <div
                data-u-comp="ribbon-header-menu"
                className={clsx('univer-relative univer-select-none', {
                    'univer-h-9': ribbonType === 'classic' || (headerMenuComponents && headerMenuComponents.size > 0),
                })}
            >
                {ribbonType === 'classic' && ribbon.length > 1 && (
                    <ClassicMenu
                        activatedTab={activatedTab}
                        ribbon={ribbon}
                        onSelectTab={handleSelectTab}
                    />
                )}

                {headerMenu && (headerMenuComponents && headerMenuComponents.size > 0) && (
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
            </div>

            <div
                className={clsx(`
                  univer-box-border univer-grid univer-h-10 univer-grid-flow-col univer-items-center univer-px-3
                  univer-text-sm
                `, {
                    'univer-grid-cols-[1fr] univer-justify-center': ribbonType === 'classic',
                    'univer-grid-cols-[auto,1fr]': ribbon.length > 1 && ribbonType !== 'classic',
                    'univer-grid-cols-none': ribbon.length === 1,
                }, borderBottomClassName)}
            >
                {ribbonType === 'default' && ribbon.length > 1 && (
                    <DefaultMenu
                        activatedTab={activatedTab}
                        ribbon={ribbon}
                        onSelectTab={handleSelectTab}
                    />
                )}

                <div
                    ref={containerRef}
                    data-u-comp="ribbon-toolbar"
                    aria-label={localeService.t(activatedTab)}
                    className={clsx('univer-flex univer-overflow-hidden', divideXClassName, {
                        'univer-justify-center': ribbonType === 'classic',
                    })}
                    role="toolbar"
                >
                    {activeGroup.visibleGroups.map((groupItem) => (groupItem.children?.length || groupItem.item) && (
                        <Fragment key={groupItem.key}>
                            <div className="univer-grid univer-shrink-0 univer-grid-flow-col univer-gap-2 univer-px-2">
                                {groupItem.children && groupItem.children?.map((child) => (
                                    child.item && <ToolbarItem key={child.key} {...child.item} />
                                ))}
                            </div>
                        </Fragment>
                    ))}

                    {/* More functions dropdown */}
                    {collapsedIds.length > 0 && (
                        <div
                            data-u-comp="ribbon-toolbar-more"
                            className={`
                              univer-pl-2
                              rtl:univer-pr-2
                            `}
                        >
                            <Dropdown
                                collisionPadding={{ right: 12, left: 12 }}
                                overlay={(
                                    <div
                                        className={`
                                          univer-box-border univer-grid univer-max-w-[--radix-popper-available-width]
                                          univer-gap-2 univer-p-2
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
                                onOpenAutoFocus={(e) => e.preventDefault()}
                            >
                                <button
                                    aria-haspopup="true"
                                    aria-label={localeService.t('ribbon.more')}
                                    className={toolbarButtonClassName}
                                    type="button"
                                >
                                    <MoreFunctionIcon />
                                </button>
                            </Dropdown>
                        </div>
                    )}
                </div>
            </div>

            {/* fake toolbar */}
            {fakeToolbar}
        </>
    );
}
