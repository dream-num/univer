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
import { useContext, useMemo } from 'react';
import { borderClassName, scrollbarClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { ConfigContext } from '../config-provider/ConfigProvider';

export interface ICascaderOption {
    label: string;
    value: string;
    color?: string;
    children?: ICascaderOption[];
}

export interface ICascaderListProps {
    /**
     * The value of select
     */
    value: string[];

    /**
     * The options of select
     * @default []
     */
    options?: ICascaderOption[];

    /**
     * The callback function that is triggered when the value is changed
     */
    onChange: (value: string[]) => void;

    /**
     * The class name of the content
     */
    contentClassName?: string;

    /**
     * The class name of the wrapper
     */
    wrapperClassName?: string;
}

function Empty({ emptyText }: { emptyText?: string }) {
    return (
        <section
            className={`
              univer-h-8 univer-px-2 univer-pr-32 univer-text-sm/8 univer-text-gray-600
              dark:univer-text-gray-200
            `}
        >
            {emptyText}
        </section>
    );
}

export function CascaderList(props: ICascaderListProps) {
    const { value, options = [], onChange, contentClassName, wrapperClassName } = props;

    const { locale } = useContext(ConfigContext);

    const activeOptions = useMemo(() => {
        const activeOptions = [options];
        value.forEach((item, index) => {
            const option = activeOptions[index].find((option) => option.value === item);

            if (option?.children) {
                activeOptions.push(option.children);
            }
        });

        return activeOptions;
    }, [value]);

    function handleChange(index: number, v: string) {
        if (v === value[index]) {
            return;
        }

        if (value[index + 1]) {
            const newValue = value.slice(0, index + 1);
            newValue[index] = v;

            onChange(newValue);
            return;
        }

        const newValue = [...value];
        newValue[index] = v;

        onChange(newValue);
    }

    return (
        <section
            data-u-comp="cascader-list"
            className={clsx(`
              univer-overflow-auto-y univer-grid univer-h-full univer-max-h-80 univer-grid-flow-col univer-rounded
              univer-py-2 univer-text-gray-900
              [&>ul:not(:last-child)]:univer-border-0 [&>ul:not(:last-child)]:univer-border-r
              [&>ul:not(:last-child)]:univer-border-solid [&>ul:not(:last-child)]:univer-border-r-gray-200
              dark:univer-text-white
            `, borderClassName, scrollbarClassName, wrapperClassName)}
        >
            {activeOptions.map((options, index) =>
                options.length
                    ? (
                        <ul
                            key={index}
                            className={clsx(`
                              univer-m-0 univer-h-full univer-max-h-full univer-list-none univer-overflow-auto
                              univer-px-2
                            `, scrollbarClassName, contentClassName)}
                        >
                            {options.map((option) => (
                                <li key={option.value}>
                                    <a
                                        className={clsx(`
                                          univer-relative univer-block univer-h-8 univer-cursor-pointer univer-rounded
                                          univer-text-sm/8
                                        `, {
                                            'univer-px-7': index > 0,
                                            'univer-px-1.5': index === 0,
                                            'univer-bg-gray-200 dark:univer-bg-gray-600': option.value === value[index],
                                        })}
                                        onClick={() => handleChange(index, option.value)}
                                    >
                                        {index > 0 && (
                                            <span
                                                className={`
                                                  univer-absolute univer-left-2 univer-flex univer-h-full
                                                  univer-items-center
                                                `}
                                            >
                                                {option.value === value[index] && (
                                                    <CheckMarkSingle
                                                        className="univer-text-primary-600"
                                                    />
                                                )}
                                            </span>
                                        )}
                                        <span>{option.label}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )
                    : (
                        <Empty key={index} emptyText={locale?.CascaderList.empty} />
                    )
            )}
            {value.length <= 0 && (
                <Empty emptyText={locale?.CascaderList.empty} />
            )}
        </section>
    );
}
