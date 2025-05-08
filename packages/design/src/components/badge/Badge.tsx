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

import type { ReactNode } from 'react';
import { CloseSingle } from '@univerjs/icons';
import { clsx } from '../../helper/clsx';

export interface IBadgeProps {
    className?: string;
    children: ReactNode;
    closable?: boolean;
    onClose?: () => void;
}

export function Badge(props: IBadgeProps) {
    const { className, children, closable = false, onClose } = props;

    return (
        <span
            data-u-comp="badge"
            className={clsx(
                `
                  univer-box-border univer-inline-flex univer-items-center univer-gap-1 univer-truncate
                  univer-rounded-md univer-border univer-border-solid univer-border-gray-100 univer-bg-gray-100
                  univer-px-2.5 univer-py-0.5 univer-text-xs univer-font-medium univer-text-gray-900
                  dark:univer-border-gray-500 dark:univer-bg-gray-700 dark:univer-text-gray-300
                `,
                className
            )}
        >
            <span className="univer-flex-1 univer-truncate">
                {children}
            </span>

            {closable && (
                <a
                    className={`
                      univer-flex univer-cursor-pointer univer-items-center univer-justify-center
                      univer-transition-opacity
                      hover:univer-opacity-70
                    `}
                    onClick={onClose}
                >
                    <CloseSingle className="univer-text-current" />
                </a>
            )}
        </span>
    );
}
