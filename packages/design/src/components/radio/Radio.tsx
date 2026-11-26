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

import type { ChangeEvent, CSSProperties, ReactNode } from 'react';
import { useRef } from 'react';
import { clsx } from '../../helper/clsx';

export interface IRadioProps {
    id?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
    contentClassName?: string;
    name?: string;

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
     * Set the handler to handle `change` event
     */
    onChange?: (value: string | number | boolean) => void;
}

/**
 * Radio Component
 */
export function Radio(props: IRadioProps) {
    const {
        id,
        'aria-label': ariaLabel,
        'aria-labelledby': ariaLabelledby,
        'aria-describedby': ariaDescribedby,
        children,
        className,
        style,
        contentClassName,
        name,
        checked,
        value,
        disabled = false,
        onChange,
    } = props;

    const inputRef = useRef<HTMLInputElement>(null);

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        e.stopPropagation();

        if (!onChange || disabled) {
            return;
        }

        if (typeof value !== 'undefined') {
            onChange(value);
        } else {
            const nextChecked = inputRef.current?.checked ?? false;
            onChange(nextChecked);
        }
    }

    const hasChildren = children !== undefined && children !== null && children !== false;

    return (
        <label
            data-u-comp="radio"
            className={clsx(
                'univer-group univer-box-border univer-inline-flex univer-gap-2 univer-text-sm',
                hasChildren ? 'univer-items-start' : 'univer-items-center',
                disabled
                    ? `
                      univer-cursor-not-allowed univer-text-gray-400
                      dark:!univer-text-gray-500
                    `
                    : `
                      univer-cursor-pointer univer-text-gray-900
                      dark:!univer-text-gray-0
                    `,
                className
            )}
            style={style}
        >
            <span
                className={clsx(
                    'univer-relative univer-flex univer-shrink-0 univer-items-center',
                    hasChildren && 'univer-min-h-[1lh]'
                )}
            >
                <input
                    ref={inputRef}
                    id={id}
                    aria-label={ariaLabel}
                    aria-labelledby={ariaLabelledby}
                    aria-describedby={ariaDescribedby}
                    className="univer-peer univer-sr-only"
                    type="radio"
                    name={name}
                    checked={checked}
                    disabled={disabled}
                    onChange={handleChange}
                />
                <span
                    className={clsx(
                        `
                          univer-relative univer-box-border univer-flex univer-size-4 univer-items-center
                          univer-justify-center univer-overflow-hidden univer-rounded-full univer-border
                          univer-border-solid univer-transition-all univer-duration-200
                          peer-focus-visible:univer-outline peer-focus-visible:univer-outline-2
                          peer-focus-visible:univer-outline-offset-2 peer-focus-visible:univer-outline-primary-600
                          motion-reduce:univer-transition-none
                          dark:peer-focus-visible:!univer-outline-primary-300
                          peer-checked:[&>span]:univer-scale-100 peer-checked:[&>span]:univer-opacity-100
                        `,
                        disabled
                            ? `
                              univer-border-gray-200 univer-bg-gray-100
                              peer-checked:!univer-border-primary-600 peer-checked:!univer-bg-primary-600
                              peer-checked:univer-opacity-50
                              dark:!univer-border-gray-600 dark:!univer-bg-gray-800
                            `
                            : `
                              univer-border-gray-300 univer-bg-gray-0
                              group-hover:univer-border-primary-600 group-hover:univer-bg-primary-50
                              group-active:univer-scale-95 group-active:univer-border-primary-700
                              peer-checked:!univer-border-primary-600 peer-checked:!univer-bg-primary-600
                              group-hover:peer-checked:!univer-border-primary-500
                              group-hover:peer-checked:!univer-bg-primary-500
                              group-active:peer-checked:!univer-border-primary-700
                              group-active:peer-checked:!univer-bg-primary-700
                              motion-reduce:group-active:univer-scale-100
                              dark:!univer-border-gray-500 dark:!univer-bg-gray-700
                              dark:group-hover:!univer-border-primary-300 dark:group-hover:!univer-bg-gray-600
                            `
                    )}
                >
                    <span
                        aria-hidden="true"
                        className="
                          univer-block univer-size-1.5 univer-scale-0 univer-rounded-full univer-bg-gray-0
                          univer-opacity-0 univer-transition-all univer-duration-200
                          motion-reduce:univer-transition-none
                        "
                    />
                </span>
            </span>

            {hasChildren && <span className={clsx('univer-select-none', contentClassName)}>{children}</span>}
        </label>
    );
}
