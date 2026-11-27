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
    alignStart?: boolean;
}

export function RibbonGrid({ groups, title, alignStart, className, ...props }: IRibbonGridProps) {
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
            const availableWidth = Number.parseFloat(style.width) - [style.paddingLeft, style.paddingRight, style.borderLeftWidth, style.borderRightWidth]
                .reduce((sum, width) => sum + Number.parseFloat(width || '0'), 0);
            // Keep fractional CSS widths; transformed bounds and rounded offsets can hide More at the boundary.
            const getWidth = (element: HTMLElement | null | undefined) => element ? Number.parseFloat(getComputedStyle(element).width) || 0 : 0;
            const getWidths = () => groups.map((group) => getWidth(groupsRef.current.get(group.key)));
            container.style.setProperty('--ribbon-grid-density', '0');
            let widths = getWidths();
            if (widths.reduce((sum, width) => sum + width, 0) > availableWidth) {
                container.style.setProperty('--ribbon-grid-density', '1');
                widths = getWidths();
            }
            const totalWidth = widths.reduce((sum, width) => sum + width, 0);
            const limit = totalWidth <= availableWidth ? availableWidth : availableWidth - getWidth(moreRef.current);
            let used = 0;
            let count = 0;
            for (const width of widths) {
                if (used + width > limit) break;
                used += width;
                count += 1;
            }
            setVisibleGroupCount(count);
        };

        measure();
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
              univer-relative univer-box-border univer-flex univer-h-[calc(4.25rem+1px)] univer-min-w-0
              univer-overflow-hidden univer-bg-gray-50 univer-text-xs
              dark:!univer-bg-gray-900
              [&_.univer-text-sm:not(svg)]:univer-text-xs
              [&_[data-u-comp='button']]:univer-gap-1
              [&_input]:!univer-text-xs
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
                                `, index >= visibleGroupCount && `
                                  univer-pointer-events-none univer-invisible univer-absolute
                                `)}
                            >
                                <div
                                    data-testid="ribbon-grid-group-grid"
                                    className="
                                      univer-grid univer-min-h-0 univer-flex-1 univer-grid-flow-col
                                      univer-grid-rows-[repeat(2,1.5rem)] univer-content-center univer-gap-1 univer-p-2
                                      [&>div>span>span]:univer-h-full
                                    "
                                >
                                    {/* Fading individual controls can shift their icons at fractional positions in Chrome. */}
                                    {placements.map((placement) => placement.item.item && (
                                        <div
                                            key={placement.item.key}
                                            className="
                                              univer-flex univer-min-w-full univer-items-stretch
                                              [&>span>button]:univer-h-full
                                              [&>span>span]:univer-w-full
                                              [&>span]:univer-h-full [&>span]:univer-w-full
                                              [&_[data-u-command]]:univer-w-full
                                              [&_[data-u-command]]:univer-animate-none
                                            "
                                            style={{
                                                gridRow: `${placement.row} / span ${placement.rowSpan}`,
                                                gridColumn: `${placement.column} / span ${placement.columnSpan}`,
                                                width: placement.minWidth === undefined
                                                    ? placement.width
                                                    : `calc(${placement.width}px - ${placement.width! - placement.minWidth}px * var(--ribbon-grid-density, 0))`,
                                            }}
                                        >
                                            <ToolbarItem
                                                {...placement.item.item}
                                                grid
                                                large={placement.rowSpan > 1}
                                                alignStart={alignStart && placement.rowSpan === 1}
                                                showLabel={placement.showLabel}
                                                iconSize={placement.iconSize}
                                                fullWidth={placement.width !== undefined}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <span
                                    data-testid="ribbon-grid-group-divider"
                                    className={clsx(`
                                      univer-pointer-events-none univer-my-2 univer-shrink-0 !univer-border-gray-300
                                      univer-opacity-50
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
                    className={clsx('univer-box-border univer-w-[4.5rem] univer-shrink-0 univer-p-2', hiddenGroups.length === 0 && `
                      univer-invisible univer-absolute
                    `)}
                >
                    {hiddenGroups.length > 0 && <RibbonOverflow groups={hiddenGroups} grid />}
                </div>
            </ToolbarDropdownProvider>
        </div>
    );
}
