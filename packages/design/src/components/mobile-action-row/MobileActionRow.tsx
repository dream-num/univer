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

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { borderBottomClassName, resetButtonClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';

export interface IMobileActionRowProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title' | 'value'> {
    title: ReactNode;
    icon?: ReactNode;
    value?: string;
    valueType?: 'color' | 'text';
    trailing?: ReactNode;
    bordered?: boolean;
    variant?: 'surface' | 'subtle';
}

export function MobileActionRow(props: IMobileActionRowProps) {
    const {
        title,
        icon,
        value,
        valueType = 'color',
        trailing,
        bordered,
        variant = 'surface',
        className,
        type = 'button',
        ...buttonProps
    } = props;

    return (
        <button
            type={type}
            className={clsx(resetButtonClassName, `
              univer-flex univer-min-h-12 univer-w-full univer-items-center univer-gap-3 univer-rounded-xl univer-px-4
              univer-text-left univer-text-base univer-font-medium univer-text-gray-900
              disabled:univer-opacity-40
              dark:!univer-text-gray-100
              [&>svg]:univer-size-5
            `, {
                'univer-bg-gray-0 active:univer-bg-gray-100 dark:!univer-bg-gray-800 dark:active:!univer-bg-gray-700': variant === 'surface',
                'univer-bg-gray-100 active:univer-bg-gray-200 dark:!univer-bg-gray-800 dark:active:!univer-bg-gray-700': variant === 'subtle',
            }, bordered && borderBottomClassName, className)}
            {...buttonProps}
        >
            {icon}
            <span className="univer-flex-1">{title}</span>
            {value && valueType === 'color' && (
                <span
                    className="
                      univer-size-6 univer-rounded-md univer-border univer-border-solid univer-border-gray-200
                      dark:!univer-border-gray-600
                    "
                    style={{ backgroundColor: value }}
                />
            )}
            {value && valueType === 'text' && (
                <span
                    className="
                      univer-max-w-32 univer-truncate univer-text-sm univer-font-normal univer-text-gray-500
                      dark:!univer-text-gray-400
                    "
                >
                    {value}
                </span>
            )}
            {trailing}
        </button>
    );
}
