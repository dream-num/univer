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
import { clsx, Tooltip } from '@univerjs/design';

export type TinyMenuSizeVariant = 'default' | 'paragraph-t';
export type TinyMenuLayoutVariant = 'default' | 'compact';

const ICON_EXTEND = { colorChannel1: 'var(--univer-primary-600)' };

export interface ITinyMenuItem {
    onClick: () => void;
    className: string;
    Icon: ComponentType<{ className?: string; extend?: { colorChannel1?: string } }>;
    iconClassName?: string;
    key: string;
    active?: boolean;
    tooltip?: string;
}

export interface ITinyMenuGroupProps {
    items: ITinyMenuItem[];
    columns?: number;
    sizeVariant?: TinyMenuSizeVariant;
    layoutVariant?: TinyMenuLayoutVariant;
    hoverSuppressed?: boolean;
}

export function DesignTinyMenuGroup({ items, columns, sizeVariant = 'default', layoutVariant = 'default', hoverSuppressed = false }: ITinyMenuGroupProps) {
    const isParagraphTVariant = sizeVariant === 'paragraph-t';
    const isCompactParagraphVariant = isParagraphTVariant && layoutVariant === 'compact';

    return (
        <div
            className={clsx(
                'univer-menu-item-group univer-px-0',
                isCompactParagraphVariant
                    ? 'univer-gap-0.5 univer-p-0'
                    : isParagraphTVariant
                        ? 'univer-gap-2 univer-p-1'
                        : 'univer-gap-1.5 univer-p-0.5',
                columns
                    ? `
                      univer-grid
                      ${isCompactParagraphVariant ? 'univer-justify-items-start' : 'univer-justify-items-center'}
                      ${columns === 6 && !isCompactParagraphVariant ? 'univer-grid-cols-6' : ''}
                    `
                    : 'univer-flex univer-flex-wrap'
            )}
            style={isCompactParagraphVariant && columns
                ? { gridTemplateColumns: `repeat(${columns}, max-content)` }
                : undefined}
        >
            {items.map((item) => {
                const showTooltip = !isParagraphTVariant && item.tooltip;
                const ele = (
                    <button
                        key={item.key}
                        type="button"
                        aria-label={item.tooltip ?? item.key}
                        title={showTooltip ? item.tooltip : undefined}
                        className={clsx(
                            `
                              univer-flex univer-cursor-pointer univer-items-center univer-justify-center
                              univer-border-none univer-bg-transparent univer-p-0
                              focus:univer-bg-gray-50 focus:univer-outline-none
                              dark:focus:!univer-bg-gray-900
                            `,
                            !hoverSuppressed && `
                              hover:univer-bg-gray-50
                              dark:hover:!univer-bg-gray-900
                            `,
                            isCompactParagraphVariant
                                ? 'univer-size-6 univer-rounded-sm'
                                : isParagraphTVariant
                                    ? 'univer-size-8 univer-rounded-lg'
                                    : 'univer-size-6 univer-rounded-md',
                            {
                                'univer-bg-gray-50 dark:!univer-bg-gray-900': item.active,
                            },
                            item.className
                        )}
                        onClick={() => item.onClick()}
                    >
                        <item.Icon
                            className={clsx(
                                `
                                  univer-text-gray-900
                                  dark:!univer-text-gray-200
                                `,
                                isCompactParagraphVariant
                                    ? 'univer-size-5'
                                    : isParagraphTVariant
                                        ? 'univer-size-5'
                                        : 'univer-size-4',
                                item.iconClassName
                            )}
                            extend={ICON_EXTEND}
                        />
                    </button>
                );
                return showTooltip
                    ? (
                        <Tooltip key={item.key} title={item.tooltip}>
                            {ele}
                        </Tooltip>
                    )
                    : ele;
            })}
        </div>
    );
}
