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

import type { HTMLAttributes } from 'react';
import { LocaleService } from '@univerjs/core';
import { borderBottomClassName, borderRightClassName, clsx } from '@univerjs/design';
import { useLayoutEffect, useRef, useState } from 'react';
import type { IMenuSchema } from '../../../services/menu/menu-manager.service';
import { useDependency } from '../../../utils/di';
import { placeRibbonGridItems } from './ribbon-grid-layout';
import { RibbonOverflow } from './RibbonOverflow';
import { ToolbarItem } from './ToolbarItem';
import { ToolbarDropdownProvider } from './TooltipButtonWrapper';

interface IRibbonGridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    groups: IMenuSchema[];
    title: string;
}

export function RibbonGrid({ groups, title, className, ...props }: IRibbonGridProps) {
    const localeService = useDependency(LocaleService);
    const containerRef = useRef<HTMLDivElement>(null);
    const moreRef = useRef<HTMLDivElement>(null);
    const groupsRef = useRef(new Map<string, HTMLDivElement>());
    const [visibleGroupCount, setVisibleGroupCount] = useState(groups.length);

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const measure = () => {
            const style = getComputedStyle(container);
            const availableWidth = container.clientWidth - Number.parseFloat(style.paddingLeft || '0') - Number.parseFloat(style.paddingRight || '0');
            const widths = groups.map((group) => groupsRef.current.get(group.key)?.getBoundingClientRect().width ?? 0);
            const totalWidth = widths.reduce((sum, width) => sum + width, 0);
            const limit = totalWidth <= availableWidth ? availableWidth : availableWidth - (moreRef.current?.getBoundingClientRect().width ?? 0);
            let used = 0;
            let count = 0;
            for (const width of widths) {
                if (used + width > limit) break;
                used += width;
                count += 1;
            }
            setVisibleGroupCount(count);
        };

        const observer = new ResizeObserver(measure);
        observer.observe(container);
        groupsRef.current.forEach((element) => observer.observe(element));
        if (moreRef.current) observer.observe(moreRef.current);
        return () => observer.disconnect();
    }, [groups, visibleGroupCount]);

    const hiddenGroups = groups.slice(visibleGroupCount);

    return (
        <div
            {...props}
            ref={containerRef}
            data-testid="ribbon-grid-toolbar"
            data-u-comp="ribbon-grid-toolbar"
            className={clsx(`
              univer-relative univer-box-border univer-flex univer-h-[73px] univer-min-w-0 univer-overflow-hidden
              univer-bg-gray-50 univer-px-2 univer-text-sm
              dark:!univer-bg-gray-900
            `, borderBottomClassName, className)}
            role="toolbar"
            aria-label={localeService.t(title)}
        >
            <ToolbarDropdownProvider key={visibleGroupCount}>
                <div className="univer-flex univer-min-w-0 univer-overflow-hidden">
                    {groups.map((group, index) => {
                        const placements = placeRibbonGridItems(group.children ?? []);
                        return (
                            <div
                                key={group.key}
                                ref={(element) => {
                                    if (element) groupsRef.current.set(group.key, element);
                                    else groupsRef.current.delete(group.key);
                                }}
                                data-u-comp="ribbon-grid-group"
                                data-group-key={group.key}
                                aria-hidden={index >= visibleGroupCount || undefined}
                                className={clsx(`
                                  univer-relative univer-box-border univer-flex univer-w-max univer-shrink-0
                                  univer-flex-col univer-px-2
                                `, index >= visibleGroupCount && `
                                  univer-pointer-events-none univer-invisible univer-absolute
                                `)}
                            >
                                <div
                                    data-testid="ribbon-grid-group-grid"
                                    className="
                                      univer-grid univer-min-h-0 univer-flex-1 univer-grid-flow-col
                                      univer-grid-rows-[repeat(2,1.5rem)] univer-content-center univer-gap-2 univer-py-2
                                      [&>div>span>span]:univer-h-full
                                    "
                                >
                                    {placements.map((placement) => placement.item.item && (
                                        <div
                                            key={placement.item.key}
                                            className={clsx(`
                                              univer-flex univer-items-stretch
                                              [&>span>button]:univer-h-full
                                              [&>span]:univer-h-full
                                            `, placement.width && `
                                              [&>span>span]:univer-w-full
                                              [&>span]:univer-w-full
                                              [&_[data-u-command]]:univer-w-full
                                            `)}
                                            style={{
                                                gridRow: `${placement.row} / span ${placement.rowSpan}`,
                                                gridColumn: `${placement.column} / span ${placement.columnSpan}`,
                                                width: placement.width,
                                            }}
                                        >
                                            <ToolbarItem
                                                {...placement.item.item}
                                                grid
                                                large={placement.rowSpan > 1}
                                                showLabel={placement.showLabel}
                                                iconSize={placement.iconSize}
                                                fullWidth={placement.width !== undefined}
                                                preserveStrokeWidth
                                            />
                                        </div>
                                    ))}
                                </div>
                                <span
                                    data-testid="ribbon-grid-group-divider"
                                    className={clsx(`
                                      univer-pointer-events-none univer-absolute univer-bottom-1.5 univer-right-0
                                      univer-top-3.5 !univer-border-gray-300 univer-opacity-50
                                      rtl:univer-left-0 rtl:univer-right-auto
                                    `, borderRightClassName)}
                                    aria-hidden="true"
                                />
                            </div>
                        );
                    })}
                </div>
                <div
                    ref={moreRef}
                    aria-hidden={hiddenGroups.length === 0 || undefined}
                    className={clsx(`
                      univer-box-border univer-w-16 univer-shrink-0 univer-py-2 univer-pl-2
                      rtl:univer-pl-0 rtl:univer-pr-2
                    `, hiddenGroups.length === 0 && 'univer-invisible univer-absolute')}
                >
                    {hiddenGroups.length > 0 && <RibbonOverflow groups={hiddenGroups} grid />}
                </div>
            </ToolbarDropdownProvider>
        </div>
    );
}
