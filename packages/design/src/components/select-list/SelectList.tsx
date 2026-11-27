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

import type { CSSProperties, KeyboardEvent } from 'react';
import { CheckMarkIcon } from '@univerjs/icons';
import { useContext, useRef } from 'react';
import { borderClassName, focusClassName, scrollbarClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { ConfigContext } from '../config-provider/ConfigProvider';

export interface ISelectListProps {
    /**
     * The value of select
     */
    value: string | string[];

    /**
     * The options of select
     * @default []
     */
    options?: Array<{
        label: string;
        value: string;
        color?: string;
    }>;

    /**
     * Whether to hide the check mark
     * @default false
     */
    hideCheckMark?: boolean;

    /**
     * The callback function that is triggered when the value is changed
     */
    onChange: (value: string | string[] | undefined) => void;

    multiple?: boolean;

    /**
     * The className each option
     */
    optionClassName?: string;

    /**
     * The className of the wrapper
     */
    className?: string;

    style?: CSSProperties;
}

const EMPTY_OPTIONS: NonNullable<ISelectListProps['options']> = [];

export function SelectList(props: ISelectListProps) {
    const { value: _value, options = EMPTY_OPTIONS, hideCheckMark = false, onChange, multiple, className, optionClassName, style } = props;
    const { direction } = useContext(ConfigContext);
    const optionListRef = useRef<Array<HTMLButtonElement | null>>([]);

    const value = Array.isArray(_value) ? _value : [_value];

    function handleSelect(newValue: string) {
        const index = value.indexOf(newValue);

        if (!multiple) {
            if (index > -1) {
                onChange(undefined);
            } else {
                onChange(newValue);
            }
        } else {
            if (index > -1) {
                onChange(value.filter((i) => i !== newValue));
            } else {
                onChange([...value, newValue]);
            }
        }
    }

    function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
        if (options.length === 0) {
            return;
        }

        let nextIndex = -1;
        if (event.key === 'ArrowDown') {
            nextIndex = (index + 1) % options.length;
        } else if (event.key === 'ArrowUp') {
            nextIndex = (index - 1 + options.length) % options.length;
        } else if (event.key === 'Home') {
            nextIndex = 0;
        } else if (event.key === 'End') {
            nextIndex = options.length - 1;
        } else {
            return;
        }

        event.preventDefault();
        optionListRef.current[nextIndex]?.focus();
    }

    return (
        <ul
            data-u-comp="select-list"
            dir={direction}
            role="listbox"
            aria-multiselectable={multiple || undefined}
            className={clsx(
                `
                  univer-m-0 univer-grid univer-max-h-80 univer-list-none univer-gap-0.5 univer-overflow-y-auto
                  univer-rounded-md univer-bg-gray-0 univer-p-1.5
                  dark:!univer-bg-gray-700
                `,
                borderClassName,
                scrollbarClassName,
                className
            )}
            style={style}
        >
            {options.map((option, index) => {
                const checked = value.includes(option.value);
                return (
                    <li key={option.value} role="presentation">
                        <button
                            ref={(el) => {
                                optionListRef.current[index] = el;
                            }}
                            type="button"
                            role="option"
                            aria-selected={checked}
                            className={clsx(
                                `
                                  univer-relative univer-flex univer-w-full univer-cursor-pointer univer-select-none
                                  univer-items-center univer-rounded univer-border-none univer-bg-transparent
                                  univer-py-1.5 univer-text-left univer-text-sm univer-text-gray-900
                                  univer-transition-colors univer-duration-200
                                  hover:univer-bg-gray-100
                                  motion-reduce:univer-transition-none
                                  rtl:univer-text-right
                                  dark:!univer-text-gray-0
                                  dark:hover:!univer-bg-gray-600
                                `,
                                focusClassName,
                                hideCheckMark
                                    ? 'univer-px-2'
                                    : `
                                      univer-pl-8 univer-pr-2
                                      rtl:univer-pl-2 rtl:univer-pr-8
                                    `,
                                checked && `
                                  univer-bg-primary-50 univer-font-medium
                                  dark:!univer-bg-gray-600
                                `,
                                optionClassName
                            )}
                            onClick={() => handleSelect(option.value)}
                            onKeyDown={(event) => handleKeyDown(event, index)}
                        >
                            {!hideCheckMark && checked && (
                                <CheckMarkIcon
                                    aria-hidden="true"
                                    preserveStrokeWidth
                                    className={`
                                      univer-absolute univer-left-2 univer-top-1/2 univer-size-4 -univer-translate-y-1/2
                                      univer-text-primary-600
                                      rtl:univer-left-auto rtl:univer-right-2
                                      dark:!univer-text-primary-300
                                    `}
                                />
                            )}
                            <span className="univer-truncate" style={{ color: option.color }}>
                                {option.label}
                            </span>
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}
