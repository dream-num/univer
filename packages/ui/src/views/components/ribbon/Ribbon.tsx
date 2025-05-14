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
import { borderBottomClassName, borderClassName, clsx, divideXClassName, Dropdown } from '@univerjs/design';
import { HomeSingle, MoreDownSingle, MoreFunctionSingle } from '@univerjs/icons';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IMenuManagerService } from '../../../services/menu/menu-manager.service';
import { MenuManagerPosition, RibbonPosition } from '../../../services/menu/types';
import { useDependency } from '../../../utils/di';
import { ComponentContainer } from '../ComponentContainer';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarItem } from './ToolbarItem';

interface IRibbonProps {
    headerMenuComponents?: Set<ComponentType>;
    headerMenu?: boolean;
}

const iconMap = {
    [RibbonPosition.START]: HomeSingle,
    [RibbonPosition.INSERT]: HomeSingle,
    [RibbonPosition.FORMULAS]: HomeSingle,
    [RibbonPosition.DATA]: HomeSingle,
    [RibbonPosition.VIEW]: HomeSingle,
    [RibbonPosition.OTHERS]: HomeSingle,
};

export function Ribbon(props: IRibbonProps) {
    const { headerMenuComponents, headerMenu = true } = props;

    const menuManagerService = useDependency(IMenuManagerService);
    const localeService = useDependency(LocaleService);

    const containerRef = useRef<HTMLDivElement>(null!);
    const fakeToolbarRef = useRef<HTMLDivElement>(null!);

    // const fakeToolbarRef = useRef<HTMLDivElement>(null);
    // const toolbarItemRefs = useRef<Record<string, {
    //     el: HTMLSpanElement;
    //     key: string;
    //     groupOrder: number;
    //     order: number;
    // }>>({});

    const [ribbon, setRibbon] = useState<IMenuSchema[]>([]);
    const [activatedTab, setActivatedTab] = useState<string>(RibbonPosition.START);
    const [groupSelectorVisible, setGroupSelectorVisible] = useState(false);
    // const [changingActiveTab, setChangingActiveTab] = useState(false);
    // const [collapsedIds, setCollapsedIds] = useState<string[]>([]);

    // const separatorClassName = `[&>*:last-child:after]:univer-absolute [&>*:last-child:after]:-univer-right-2
    // [&>*:last-child:after]:univer-top-1/2 [&>*:last-child:after]:univer-h-5 [&>*:last-child:after]:univer-translate-x-[3px]
    // [&>*:last-child:after]:univer-w-px [&>*:last-child:after]:-univer-translate-y-1/2
    // [&>*:last-child:after]:univer-bg-gray-200 [&>*:last-child:after]:univer-content-['']
    // [&>*:last-child]:univer-relative dark:[&>*:last-child:after]:univer-bg-gray-600`;

    const handleSelectTab = useCallback((group: IMenuSchema) => {
        // toolbarItemRefs.current = {};
        // setChangingActiveTab(true);
        // const timer = setTimeout(() => {
        //     setChangingActiveTab(false);
        // }, 300);
        setActivatedTab(group.key);
        setGroupSelectorVisible(false);

        return () => {
            // clearTimeout(timer);
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

        return {
            allGroups,
        };
    }, [ribbon, activatedTab]);

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width: avaliableWidth } = entry.contentRect;
                const { width: overflowWidth } = fakeToolbarRef.current.getBoundingClientRect();
                // console.log(avaliableWidth, overflowWidth);

                if (overflowWidth > avaliableWidth) {
                    // toolbarItemRefs.current = {};
                    // setChangingActiveTab(true);
                    // const timer = setTimeout(() => {
                    //     setChangingActiveTab(false);
                    // }, 300);
                }
            }
        });

        observer.observe(containerRef.current);
    }, [activatedTab]);

    return (
        <>
            {headerMenu && (headerMenuComponents && headerMenuComponents.size > 0) && (
                <header className={clsx('univer-relative univer-h-11 univer-select-none', borderBottomClassName)}>
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
                </header>
            )}

            <div
                className={clsx(`
                  univer-box-border univer-grid univer-h-11 univer-grid-flow-col univer-items-center univer-px-3
                `, 'univer-grid-cols-[auto,1fr]', borderBottomClassName)}
            >
                {/* <search className="univer-mr-1 univer-w-20">
                    <Input />
                </search> */}

                {ribbon.length > 1 && (
                    <Dropdown
                        className="!univer-rounded-xl univer-animate-in univer-fade-in"
                        align="start"
                        open={groupSelectorVisible}
                        overlay={(
                            <div className="univer-grid univer-gap-1 univer-px-2 univer-py-1">
                                {ribbon.map((group) => {
                                    const Icon = iconMap[group.key as RibbonPosition];

                                    return (
                                        <a
                                            key={group.key}
                                            className={`
                                              univer-box-border univer-flex univer-cursor-pointer univer-items-center
                                              univer-gap-2.5 univer-rounded-lg univer-px-2 univer-py-1.5
                                              dark:hover:univer-bg-gray-700
                                              hover:univer-bg-gray-100
                                            `}
                                            onClick={() => handleSelectTab(group)}
                                        >
                                            <span
                                                className={clsx(`
                                                  univer-box-border univer-flex univer-size-9 univer-items-center
                                                  univer-justify-center univer-rounded-lg
                                                `, borderClassName)}
                                            >
                                                <Icon
                                                    className={`
                                                      univer-text-gray-500
                                                      dark:univer-text-gray-300
                                                    `}
                                                />
                                            </span>
                                            <span className="univer-flex univer-flex-col">
                                                <strong
                                                    className={`
                                                      univer-text-sm univer-font-semibold univer-text-gray-800
                                                      dark:univer-text-gray-200
                                                    `}
                                                >
                                                    {localeService.t(group.key)}
                                                </strong>
                                                <span className="univer-text-xs univer-text-gray-400">
                                                    {localeService.t(`${group.key}Desc`)}
                                                </span>
                                            </span>
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                        onOpenChange={setGroupSelectorVisible}
                    >
                        <a
                            className={`
                              univer-mr-2 univer-flex univer-h-7 univer-cursor-pointer univer-items-center
                              univer-gap-1.5 univer-whitespace-nowrap !univer-rounded-full univer-bg-gray-700
                              univer-pl-3 univer-pr-2 univer-text-sm univer-text-white
                              dark:univer-bg-gray-200 dark:univer-text-gray-800
                            `}
                        >
                            {localeService.t(activatedTab)}
                            <MoreDownSingle
                                className={`
                                  univer-text-gray-200
                                  dark:univer-text-gray-500
                                `}
                            />
                        </a>
                    </Dropdown>
                )}

                <div ref={containerRef} className={clsx('univer-flex univer-overflow-hidden', divideXClassName)}>
                    {activeGroup.allGroups.map((groupItem) => (groupItem.children?.length || groupItem.item) && (
                        <Fragment key={groupItem.key}>
                            <div className="univer-grid univer-grid-flow-col univer-gap-2 univer-px-2">
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

                    <div className="univer-pl-2">
                        <Dropdown
                            overlay={(
                                <div>
                                    123
                                </div>
                            )}
                        >
                            <ToolbarButton>
                                <MoreFunctionSingle />
                            </ToolbarButton>
                        </Dropdown>
                    </div>
                </div>
            </div>

            <div
                ref={fakeToolbarRef}
                aria-hidden
                className={clsx(`
                  univer-invisible univer-absolute -univer-left-[99999] -univer-top-[99999] univer-box-border
                  univer-flex univer-h-11 univer-min-w-min univer-items-center univer-px-3 univer-opacity-0
                `, borderBottomClassName)}
            >
                {activeGroup.allGroups.map((groupItem) => (groupItem.children?.length || groupItem.item) && (
                    <Fragment key={groupItem.key}>
                        <div className="univer-grid univer-grid-flow-col univer-gap-2 univer-px-2">
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
            </div>
        </>
    );
}
