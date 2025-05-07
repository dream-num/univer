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

import type { CSSProperties, ReactNode } from 'react';
import { CheckMarkSingle } from '@univerjs/icons';
import { useRef } from 'react';
import { clsx } from '../../helper/clsx';

export interface ICheckboxProps {
    children?: ReactNode;

    /**
     * The class name of the checkbox group
     */
    className?: string;

    /**
     * The style of the checkbox group
     */
    style?: CSSProperties;

    /**
     * Used for setting the currently selected value
     * @default false
     */
    checked?: boolean;

    /**
     * Used for setting the checkbox to indeterminate
     * @default false
     */
    indeterminate?: boolean;

    /**
     * Used for setting the currently selected value
     * Only used when the checkbox is in a group
     */
    value?: string | number | boolean;

    /**
     * Specifies whether the checkbox is disabled
     * @default false
     */
    disabled?: boolean;

    /**
     * Set the handler to handle `click` event
     */
    onChange?: (value: string | number | boolean) => void;

    contentClassName?: string;
}

/**
 * Checkbox Component
 */
export function Checkbox(props: ICheckboxProps) {
    const { children, className, style, checked = false, indeterminate = false, value, disabled = false, onChange, contentClassName } = props;

    const inputRef = useRef<HTMLInputElement>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        e.stopPropagation();

        if (!onChange || disabled) return;

        if (typeof value !== 'undefined') {
            onChange?.(value);
        } else {
            const checked = inputRef?.current?.checked ?? false;
            onChange?.(checked);
        }
    }

    return (
        <label
            className={clsx('univer-box-border univer-inline-flex univer-items-center univer-gap-2 univer-text-sm', {
                'univer-cursor-pointer univer-text-gray-900 dark:univer-text-white': !disabled,
                'univer-text-gray-400': disabled,
            }, className)}
            style={style}
        >
            <span className="univer-relative univer-block">
                <input
                    ref={inputRef}
                    className="univer-absolute univer-size-0 univer-opacity-0"
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={handleChange}
                />
                <span
                    className={clsx(`
                      univer-relative univer-box-border univer-flex univer-size-4 univer-items-center
                      univer-justify-center univer-overflow-hidden univer-rounded univer-border univer-border-solid
                      univer-border-gray-300 univer-bg-gray-50 univer-transition-colors
                      dark:univer-border-gray-500 dark:univer-bg-gray-600
                    `, {
                        'univer-opacity-50': disabled,
                        'univer-border-primary-600 univer-bg-primary-600': checked || indeterminate,
                    })}
                >
                    {checked && (
                        <CheckMarkSingle
                            className={`
                              univer-absolute univer-left-1/2 univer-top-1/2 univer-block univer-size-3
                              -univer-translate-x-1/2 -univer-translate-y-1/2 univer-text-white
                            `}
                        />
                    )}
                    {indeterminate && !checked && (
                        <span
                            className={`
                              univer-absolute univer-left-1/2 univer-top-1/2 univer-block univer-h-0.5 univer-w-2.5
                              -univer-translate-x-1/2 -univer-translate-y-1/2 univer-rounded univer-bg-white
                            `}
                        />
                    )}
                </span>
            </span>

            <span className={clsx('univer-select-none', contentClassName)}>{children}</span>
        </label>
    );
}
