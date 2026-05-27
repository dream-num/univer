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
}

export function DesignTinyMenuGroup({ items }: ITinyMenuGroupProps) {
    return (
        <div
            className="univer-menu-item-group univer-flex univer-flex-wrap univer-gap-2.5 univer-p-1 univer-px-0"
        >
            {items.map((item) => {
                const ele = (
                    <div
                        key={item.key}
                        className={clsx(`
                          univer-flex univer-size-6 univer-cursor-pointer univer-items-center univer-justify-center
                          univer-rounded-md
                          hover:univer-bg-gray-50
                          dark:hover:!univer-bg-gray-900
                        `, {
                            'univer-bg-gray-50 dark:!univer-bg-gray-900': item.active,
                        }, item.className)}
                        onClick={() => item.onClick()}
                    >
                        <item.Icon
                            className={clsx(
                                `
                                  univer-size-4 univer-text-gray-900
                                  dark:!univer-text-gray-200
                                `,
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
