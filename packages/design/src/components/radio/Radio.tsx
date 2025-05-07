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

import React, { useRef } from 'react';
import { clsx } from '../../helper/clsx';

export interface IRadioProps {
    children?: React.ReactNode;

    /**
     * Used for setting the currently selected value
     * @default false
     */
    checked?: boolean;

    /**
     * Used for setting the currently selected value
     */
    value?: string | number | boolean;

    /**
     * Specifies whether the radio is disabled
     * @default false
     */
    disabled?: boolean;

    /**
     * Set the handler to handle `click` event
     */
    onChange?: (value: string | number | boolean) => void;
}

/**
 * Radio Component
 */
export function Radio(props: IRadioProps) {
    const { children, checked, value, disabled = false, onChange } = props;

    const inputRef = useRef<HTMLInputElement>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        e.stopPropagation();

        if (!onChange || disabled) return;

        if (typeof value !== 'undefined') {
            onChange && onChange(value);
        } else {
            const checked = inputRef?.current?.checked!;
            onChange && onChange(checked);
        }
    }

    return (
        <label
            className={clsx('univer-box-border univer-inline-flex univer-items-center univer-gap-2 univer-text-sm', {
                'univer-cursor-pointer univer-text-gray-900 dark:univer-text-white': !disabled,
                'univer-text-gray-400': disabled,
            })}
        >
            <span className="univer-relative univer-block">
                <input
                    ref={inputRef}
                    className="univer-absolute univer-size-0 univer-opacity-0"
                    type="radio"
                    checked={checked}
                    disabled={disabled}
                    onChange={handleChange}
                />
                <span
                    className={clsx(`
                      univer-relative univer-box-border univer-flex univer-size-4 univer-items-center
                      univer-justify-center univer-overflow-hidden univer-rounded-full univer-border univer-border-solid
                      univer-border-gray-300 univer-bg-gray-50 univer-transition-colors
                      dark:univer-border-gray-500 dark:univer-bg-gray-600
                    `, {
                        'univer-opacity-50': disabled,
                        'univer-border-primary-600 univer-bg-primary-600 dark:univer-bg-primary-600': checked,
                    })}
                >
                    {checked && (
                        <span
                            className={`
                              univer-absolute univer-left-1/2 univer-top-1/2 univer-block univer-size-2
                              -univer-translate-x-1/2 -univer-translate-y-1/2 univer-rounded-full univer-bg-white
                            `}
                        />
                    )}
                </span>
            </span>

            <span>{children}</span>
        </label>
    );
}
