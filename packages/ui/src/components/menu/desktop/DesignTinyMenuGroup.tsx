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

export interface ITinyMenuItem {
    onClick: () => void;
    className: string;
    Icon: ComponentType<{ className?: string }>;
    iconClassName?: string;
    key: string;
    active?: boolean;
    tooltip?: string;
}

export interface ITinyMenuGroupProps {
    items: ITinyMenuItem[];
    columns?: number;
    sizeVariant?: TinyMenuSizeVariant;
}

export function DesignTinyMenuGroup({ items, columns, sizeVariant = 'default' }: ITinyMenuGroupProps) {
    const isParagraphTVariant = sizeVariant === 'paragraph-t';

    return (
        <div
            className={clsx(
                'univer-menu-item-group univer-px-0',
                isParagraphTVariant ? 'univer-gap-2 univer-p-1' : 'univer-gap-1.5 univer-p-0.5',
                columns
                    ? `
                      univer-grid univer-justify-items-center
                      ${columns === 6 ? 'univer-grid-cols-6' : ''}
                    `
                    : 'univer-flex univer-flex-wrap'
            )}
        >
            {items.map((item) => {
                const ele = (
                    <div
                        key={item.key}
                        className={clsx(
                            `
                              univer-flex univer-cursor-pointer univer-items-center univer-justify-center
                              hover:univer-bg-gray-50
                              dark:hover:!univer-bg-gray-900
                            `,
                            isParagraphTVariant
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
                                isParagraphTVariant ? 'univer-size-5' : 'univer-size-4',
                                item.iconClassName
                            )}
                        />
                    </div>
                );
                return item.tooltip
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
