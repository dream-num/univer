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
import type { IMenuSchema } from '../../../services/menu/menu-manager.service';
import { LocaleService } from '@univerjs/core';
import { borderBottomClassName, borderRightClassName, clsx, scrollbarClassName } from '@univerjs/design';
import { useDependency } from '../../../utils/di';
import { placeRibbonGridItems } from './ribbon-grid-layout';
import { ToolbarItem } from './ToolbarItem';
import { ToolbarDropdownProvider } from './TooltipButtonWrapper';

interface IRibbonGridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    groups: IMenuSchema[];
    title: string;
}

export function RibbonGrid({ groups, title, className, ...props }: IRibbonGridProps) {
    const localeService = useDependency(LocaleService);

    return (
        <div
            {...props}
            data-testid="ribbon-grid-toolbar"
            data-u-comp="ribbon-grid-toolbar"
            className={clsx(`
              univer-box-border univer-flex univer-h-[88px] univer-overflow-x-auto univer-overflow-y-hidden
              univer-bg-gray-50 univer-px-2 univer-text-sm
              dark:!univer-bg-gray-900
            `, borderBottomClassName, scrollbarClassName, className)}
            role="toolbar"
            aria-label={localeService.t(title)}
        >
            <ToolbarDropdownProvider>
                {groups.map((group) => {
                    const placements = placeRibbonGridItems(group.children ?? []);
                    return (
                        <div
                            key={group.key}
                            data-u-comp="ribbon-grid-group"
                            className="
                              univer-relative univer-box-border univer-flex univer-min-w-16 univer-shrink-0
                              univer-flex-col univer-px-2
                            "
                        >
                            <div
                                data-testid="ribbon-grid-group-grid"
                                className="
                                  univer-grid univer-min-h-0 univer-flex-1 univer-grid-flow-col univer-grid-rows-2
                                  univer-content-center univer-gap-x-1 univer-gap-y-2 univer-py-2
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
            </ToolbarDropdownProvider>
        </div>
    );
}
