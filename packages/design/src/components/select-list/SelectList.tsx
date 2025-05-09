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

import { CheckMarkSingle } from '@univerjs/icons';
import { borderClassName, scrollbarClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';

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
}

export function SelectList(props: ISelectListProps) {
    const { value: _value, options = [], hideCheckMark = false, onChange, multiple, className, optionClassName } = props;

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
                onChange(value.filter((i) => i === newValue));
            } else {
                onChange([...value, newValue]);
            }
        }
    }

    return (
        <ul
            className={clsx(`
              univer-m-0 univer-grid univer-max-h-80 univer-list-none univer-gap-1 univer-overflow-y-auto univer-rounded
              univer-p-1.5
            `, borderClassName, scrollbarClassName, className)}
        >
            {options.map((option, index) => {
                const checked = value.indexOf(option.value) > -1;
                return (
                    <li key={index}>
                        <a
                            className={clsx(`
                              univer-relative univer-block univer-cursor-pointer univer-select-none univer-rounded
                              univer-py-1.5 univer-pl-8 univer-pr-2 univer-text-sm univer-text-gray-900
                              univer-transition-colors
                              dark:univer-text-white dark:hover:univer-bg-gray-600
                              hover:univer-bg-gray-100
                            `, optionClassName, {
                                'univer-bg-gray-200 dark:univer-bg-gray-500': checked,
                            })}
                            onClick={() => handleSelect(option.value)}
                        >
                            {!hideCheckMark && (
                                checked && (
                                    <CheckMarkSingle
                                        className={`
                                          univer-absolute univer-left-0 univer-top-1/2 -univer-translate-y-1/2
                                          univer-pl-2 univer-text-primary-600
                                        `}
                                    />
                                )
                            )}
                            <span style={{ color: option.color }}>{option.label}</span>
                        </a>
                    </li>
                );
            })}
        </ul>
    );
}
