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
import type { LocaleKey } from '../../../locale/types';
import type { IMenuSchema } from '../../../services/menu/menu-manager.service';
import { LocaleService, UniverInstanceType } from '@univerjs/core';
import {
    borderBottomClassName,
    borderClassName,
    borderRightClassName,
    clsx,
    ConfigContext,
    resetButtonClassName,
} from '@univerjs/design';
import { MoreHorizontalIcon, MoreLeftIcon, MoreRightIcon } from '@univerjs/icons';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RibbonPosition, RibbonStartGroup } from '../../../services/menu/types';
import { IRibbonService } from '../../../services/ribbon/ribbon.service';
import { IWorkbenchService } from '../../../services/workbench/workbench.service';
import { useDependency, useObservable } from '../../../utils/di';
import { ComponentContainer } from '../ComponentContainer';
import { ToolbarItem } from './ToolbarItem';

interface IMobileRibbonProps {
    headerMenuComponents?: Set<ComponentType>;
    headerMenu?: boolean;
}

const toolbarScrollOffset = 168;

export function MobileRibbon(props: IMobileRibbonProps) {
    const { headerMenuComponents, headerMenu = true } = props;

    const localeService = useDependency(LocaleService);
    const ribbonService = useDependency(IRibbonService);
    const workbenchService = useDependency(IWorkbenchService);

    const ribbon = useObservable(ribbonService.ribbon$, []);
    const activatedTab = useObservable(ribbonService.activatedTab$, RibbonPosition.START);
    const rootUnitType = useObservable(workbenchService.rootUnitType$, null, true);

    if (rootUnitType === UniverInstanceType.UNIVER_SHEET) {
        return (
            <MobileSheetTopBar
                ribbon={ribbon}
                headerMenu={headerMenu}
                headerMenuComponents={headerMenuComponents}
            />
        );
    }

    const activeIndex = useMemo(() => {
        const index = ribbon.findIndex((group) => group.key === activatedTab);
        return index === -1 ? 0 : index;
    }, [activatedTab, ribbon]);

    const activeGroup = ribbon[activeIndex];
    const activeGroups = activeGroup?.children ?? [];
    const hasHeaderMenu = !!(headerMenu && headerMenuComponents && headerMenuComponents.size > 0);

    const toolbarScrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    useEffect(() => {
        if (!activeGroup && ribbon.length > 0) {
            ribbonService.setActivatedTab(ribbon[0].key);
        }
    }, [activeGroup, ribbon, ribbonService]);

    useEffect(() => {
        const container = toolbarScrollRef.current;

        if (!container) {
            return;
        }

        const updateScrollState = () => {
            const { scrollLeft, clientWidth, scrollWidth } = container;
            setCanScrollLeft(scrollLeft > 4);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
        };

        updateScrollState();

        const resizeObserver = new ResizeObserver(updateScrollState);
        resizeObserver.observe(container);
        container.addEventListener('scroll', updateScrollState, { passive: true });

        return () => {
            resizeObserver.disconnect();
            container.removeEventListener('scroll', updateScrollState);
        };
    }, [activeGroup]);

    if (ribbon.length === 0 && !hasHeaderMenu) {
        return null;
    }

    function selectTab(index: number) {
        const nextGroup = ribbon[index];

        if (!nextGroup) {
            return;
        }

        ribbonService.setActivatedTab(nextGroup.key);
    }

    function scrollToolbar(direction: 'left' | 'right') {
        const container = toolbarScrollRef.current;

        if (!container) {
            return;
        }

        container.scrollBy({
            left: direction === 'left' ? -toolbarScrollOffset : toolbarScrollOffset,
            behavior: 'smooth',
        });
    }

    return (
        <div
            data-u-comp="mobile-ribbon"
            className={clsx(`
              univer-flex univer-flex-col univer-gap-1.5 univer-bg-gray-50 univer-px-3 univer-py-1.5 univer-text-sm
              dark:!univer-bg-gray-900
            `, borderBottomClassName)}
        >
            <div
                className="
                  univer-grid univer-grid-cols-[28px_minmax(0,1fr)_auto] univer-items-center univer-gap-1.5
                  univer-px-0.5 univer-py-0.5
                "
            >
                <div className="univer-flex univer-items-center">
                    <button
                        type="button"
                        className={clsx(resetButtonClassName, `
                          univer-size-7 univer-rounded-md univer-text-gray-500 univer-transition-colors
                          hover:univer-bg-gray-100
                          active:univer-bg-gray-200
                          dark:!univer-text-gray-300
                          dark:hover:!univer-bg-gray-700
                          dark:active:!univer-bg-gray-600
                        `, {
                            'univer-opacity-40': activeIndex === 0,
                        })}
                        disabled={activeIndex === 0}
                        aria-label={localeService.t<LocaleKey>('ui.navigation.previous')}
                        onClick={() => selectTab(activeIndex - 1)}
                    >
                        <MoreLeftIcon
                            className="univer-rotate-180 univer-text-sm"
                            preserveStrokeWidth
                        />
                    </button>
                </div>

                <div className="univer-flex univer-min-w-0 univer-items-center univer-justify-center univer-gap-2.5">
                    {ribbon.map((group, index) => {
                        const active = index === activeIndex;

                        return (
                            <button
                                key={group.key}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                className={clsx(`
                                  ${resetButtonClassName}
                                  univer-relative univer-shrink-0 univer-px-1 univer-py-1 univer-text-sm
                                  univer-font-semibold univer-transition-colors
                                `, active
                                    ? `
                                      univer-text-primary-600
                                      dark:!univer-text-primary-400
                                    `
                                    : `
                                      univer-text-gray-700
                                      dark:!univer-text-gray-200
                                    `)}
                                onClick={() => selectTab(index)}
                            >
                                {localeService.t(group.title || group.key)}
                                {active && (
                                    <span
                                        className="
                                          univer-absolute univer-bottom-0 univer-left-1/2 univer-h-0.5 univer-w-8
                                          -univer-translate-x-1/2 univer-rounded-full univer-bg-primary-600
                                          dark:!univer-bg-primary-400
                                        "
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="univer-flex univer-items-center univer-gap-1">
                    <button
                        type="button"
                        className={clsx(`
                          ${resetButtonClassName}
                          univer-size-7 univer-rounded-md univer-text-gray-500 univer-transition-colors
                          hover:univer-bg-gray-100
                          active:univer-bg-gray-200
                          dark:!univer-text-gray-300
                          dark:hover:!univer-bg-gray-700
                          dark:active:!univer-bg-gray-600
                        `, {
                            'univer-opacity-40': activeIndex >= ribbon.length - 1,
                        })}
                        disabled={activeIndex >= ribbon.length - 1}
                        aria-label={localeService.t<LocaleKey>('ui.navigation.next')}
                        onClick={() => selectTab(activeIndex + 1)}
                    >
                        <MoreRightIcon className="univer-text-sm" preserveStrokeWidth />
                    </button>

                    {hasHeaderMenu && (
                        <div
                            className="
                              univer-flex univer-items-center univer-gap-1
                              [&>*]:univer-m-0 [&>*]:univer-inline-flex [&>*]:univer-min-h-7 [&>*]:univer-min-w-7
                              [&>*]:univer-appearance-none [&>*]:univer-items-center [&>*]:univer-justify-center
                              [&>*]:univer-rounded-md [&>*]:univer-border-0 [&>*]:univer-px-1.5
                              [&>*]:univer-leading-none [&>*]:univer-outline-none
                            "
                        >
                            <ComponentContainer components={headerMenuComponents!} />
                        </div>
                    )}
                </div>
            </div>

            <div
                className={clsx(`
                  univer-grid univer-grid-cols-[22px_minmax(0,1fr)_22px] univer-items-center univer-gap-1.5
                  univer-rounded-xl univer-bg-gray-0 univer-px-2 univer-py-1
                  dark:!univer-bg-gray-800
                `, borderClassName)}
            >
                <button
                    type="button"
                    className={clsx(`
                      ${resetButtonClassName}
                      univer-h-8 univer-w-5 univer-text-gray-500 univer-transition-colors
                      dark:!univer-text-gray-300
                    `, {
                        'univer-opacity-30': !canScrollLeft,
                    })}
                    disabled={!canScrollLeft}
                    aria-label={localeService.t<LocaleKey>('ui.navigation.previous')}
                    onClick={() => scrollToolbar('left')}
                >
                    <MoreLeftIcon className="univer-text-sm" preserveStrokeWidth />
                </button>

                <div
                    ref={toolbarScrollRef}
                    data-u-comp="mobile-ribbon-toolbar"
                    className={`
                      univer-flex univer-min-w-0 univer-items-center univer-gap-1.5 univer-overflow-x-auto
                      univer-scroll-smooth univer-px-0.5
                      [&::-webkit-scrollbar]:univer-hidden
                    `}
                >
                    {activeGroups.map((groupItem, groupIndex) => {
                        const groupItems = groupItem.children?.filter((child) => !!child.item) ?? [];

                        if (!groupItems.length) {
                            return null;
                        }

                        return (
                            <div
                                key={groupItem.key}
                                className={clsx(`
                                  univer-flex univer-shrink-0 univer-items-center univer-gap-0.5 univer-pr-1.5
                                  rtl:univer-pl-1.5 rtl:univer-pr-0
                                `, {
                                    [borderRightClassName]: groupIndex !== activeGroups.length - 1,
                                })}
                            >
                                {groupItems.map((child) => (
                                    child.item && (
                                        <div
                                            key={child.key}
                                            className={clsx(`
                                              [&_button]:!univer-font-inherit
                                              univer-flex univer-h-8 univer-shrink-0 univer-items-center
                                              univer-rounded-md
                                              [&_*]:univer-box-border
                                              [&_.univer-custom-label]:univer-text-sm
                                              [&_.univer-custom-label]:univer-leading-none
                                              [&_.univer-toolbar-button-selector-main]:!univer-h-8
                                              [&_.univer-toolbar-button-selector-main]:!univer-rounded-none
                                              [&_.univer-toolbar-button-selector-main]:!univer-rounded-l-md
                                              [&_.univer-toolbar-button-selector-main]:!univer-px-1.5
                                              [&_.univer-toolbar-button-selector-root]:!univer-h-8
                                              [&_.univer-toolbar-button-selector-root]:univer-overflow-hidden
                                              [&_.univer-toolbar-button-selector-root]:!univer-rounded-md
                                              [&_.univer-toolbar-button-selector-root]:!univer-pr-0
                                              [&_.univer-toolbar-button-selector-trigger]:!univer-static
                                              [&_.univer-toolbar-button-selector-trigger]:!univer-h-8
                                              [&_.univer-toolbar-button-selector-trigger]:!univer-w-6
                                              [&_.univer-toolbar-button-selector-trigger]:!univer-rounded-none
                                              [&_.univer-toolbar-button-selector-trigger]:!univer-rounded-r-md
                                              [&_.univer-toolbar-selector-root]:!univer-h-8
                                              [&_.univer-toolbar-selector-root]:!univer-gap-1
                                              [&_.univer-toolbar-selector-root]:!univer-rounded-md
                                              [&_.univer-toolbar-selector-root]:!univer-px-1.5
                                              [&_.univer-toolbar-selector-trigger]:!univer-pl-0.5
                                              [&_.univer-tooltip]:univer-inline-flex [&_.univer-tooltip]:univer-h-full
                                              [&_.univer-tooltip]:univer-items-center
                                              [&_[data-u-command]]:!univer-h-8 [&_[data-u-command]]:!univer-min-h-8
                                              [&_[data-u-command]]:!univer-rounded-md
                                              [&_[data-u-command]]:!univer-px-1.5
                                              [&_button]:!univer-m-0 [&_button]:!univer-h-8 [&_button]:!univer-min-w-8
                                              [&_button]:!univer-appearance-none [&_button]:!univer-rounded-md
                                              [&_button]:!univer-border-0 [&_button]:!univer-bg-transparent
                                              [&_button]:!univer-p-0 [&_button]:!univer-px-1.5
                                              [&_button]:!univer-leading-none [&_button]:!univer-outline-none
                                              [&_input]:!univer-m-0 [&_input]:!univer-appearance-none
                                              [&_input]:!univer-border-0 [&_input]:!univer-bg-transparent
                                              [&_input]:!univer-p-0 [&_input]:!univer-leading-none
                                              [&_input]:!univer-outline-none
                                            `)}
                                        >
                                            <ToolbarItem {...child.item} preserveStrokeWidth />
                                        </div>
                                    )
                                ))}
                            </div>
                        );
                    })}
                </div>

                <button
                    type="button"
                    className={clsx(`
                      ${resetButtonClassName}
                      univer-h-8 univer-w-5 univer-text-gray-500 univer-transition-colors
                      dark:!univer-text-gray-300
                    `, {
                        'univer-opacity-30': !canScrollRight,
                    })}
                    disabled={!canScrollRight}
                    aria-label={localeService.t<LocaleKey>('ui.navigation.next')}
                    onClick={() => scrollToolbar('right')}
                >
                    <MoreRightIcon className="univer-text-sm" preserveStrokeWidth />
                </button>
            </div>
        </div>
    );
}

function MobileSheetTopBar(props: IMobileRibbonProps & { ribbon: IMenuSchema[] }) {
    const { headerMenuComponents, headerMenu = true, ribbon } = props;
    const [moreOpen, setMoreOpen] = useState(false);
    const moreTriggerRef = useRef<HTMLButtonElement>(null);
    const { mountContainer } = useContext(ConfigContext);
    const localeService = useDependency(LocaleService);
    const startGroup = ribbon.find((group) => group.key === RibbonPosition.START);
    const historyItems = startGroup?.children?.find((group) => group.key === RibbonStartGroup.HISTORY)?.children ?? [];
    const otherItems = startGroup?.children?.find((group) => group.key === RibbonStartGroup.OTHERS)?.children ?? [];
    const items = historyItems.filter((schema) => schema.item);
    const moreItems = otherItems.flatMap((schema) => schema.children?.length ? schema.children : [schema])
        .filter((schema) => schema.item);
    const hasHeaderMenu = !!(headerMenu && headerMenuComponents && headerMenuComponents.size > 0);

    if (items.length === 0 && moreItems.length === 0 && !hasHeaderMenu) {
        return null;
    }

    const triggerRect = moreOpen ? moreTriggerRef.current?.getBoundingClientRect() : undefined;
    const viewportWidth = moreTriggerRef.current?.ownerDocument.defaultView?.innerWidth ?? 0;
    const moreMenu = moreOpen && mountContainer && createPortal(
        <>
            <button
                type="button"
                aria-label={localeService.t<LocaleKey>('ui.rangeSelector.cancel')}
                className={clsx(
                    resetButtonClassName,
                    'univer-fixed univer-inset-0 univer-z-[1390] !univer-rounded-none !univer-bg-transparent'
                )}
                onClick={() => setMoreOpen(false)}
            />
            <div
                data-u-comp="mobile-sheet-more-menu"
                className={clsx(`
                  univer-fixed univer-z-[1400] univer-flex univer-w-60 univer-max-w-[calc(100vw-24px)] univer-flex-col
                  univer-gap-1 univer-rounded-2xl univer-bg-gray-0 univer-p-2 univer-shadow-lg
                  dark:!univer-bg-gray-800
                `, borderClassName)}
                style={{
                    top: (triggerRect?.bottom ?? 48) + 8,
                    right: Math.max(12, viewportWidth - (triggerRect?.right ?? viewportWidth)),
                }}
            >
                {moreItems.map((schema) => (
                    <div
                        key={schema.key}
                        className="
                          univer-w-full
                          [&>span]:univer-block [&>span]:univer-w-full
                          [&_button]:!univer-h-12 [&_button]:!univer-w-full [&_button]:!univer-justify-start
                          [&_button]:!univer-gap-3 [&_button]:!univer-rounded-xl [&_button]:!univer-px-4
                          [&_button]:!univer-text-base
                        "
                        onClick={() => setMoreOpen(false)}
                    >
                        <ToolbarItem {...schema.item!} grid showLabel preserveStrokeWidth />
                    </div>
                ))}
            </div>
        </>,
        mountContainer
    );

    return (
        <>
            <div
                data-u-comp="mobile-sheet-top-bar"
                className={clsx(`
                  univer-flex univer-h-12 univer-items-center univer-justify-end univer-gap-1 univer-bg-gray-0
                  univer-px-3
                  dark:!univer-bg-gray-800
                `, borderBottomClassName)}
            >
                <div
                    className="
                      univer-flex univer-items-center univer-gap-1
                      [&_button]:!univer-min-h-10 [&_button]:!univer-min-w-10 [&_button]:!univer-rounded-lg
                      [&_button_svg]:!univer-size-5
                    "
                >
                    {items.map((schema) => (
                        <ToolbarItem
                            key={schema.key}
                            {...schema.item!}
                        />
                    ))}
                </div>
                {hasHeaderMenu && (
                    <div
                        className="
                          univer-flex univer-items-center univer-gap-1
                          [&>*]:univer-m-0 [&>*]:univer-inline-flex [&>*]:univer-min-h-10 [&>*]:univer-min-w-10
                          [&>*]:univer-items-center [&>*]:univer-justify-center [&>*]:univer-rounded-lg
                        "
                    >
                        <ComponentContainer components={headerMenuComponents!} />
                    </div>
                )}
                {moreItems.length > 0 && (
                    <button
                        ref={moreTriggerRef}
                        type="button"
                        data-u-comp="mobile-sheet-more-trigger"
                        aria-label={localeService.t<LocaleKey>('ui.ribbon.more')}
                        aria-expanded={moreOpen}
                        className={clsx(resetButtonClassName, `
                          univer-flex univer-size-10 univer-items-center univer-justify-center univer-rounded-lg
                          univer-text-gray-700 univer-transition-colors
                          active:univer-bg-gray-100
                          dark:!univer-text-gray-200
                          dark:active:!univer-bg-gray-700
                        `)}
                        onClick={() => setMoreOpen((open) => !open)}
                    >
                        <MoreHorizontalIcon className="univer-size-5" preserveStrokeWidth />
                    </button>
                )}
            </div>
            {moreMenu}
        </>
    );
}
