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

import type { KeyboardEvent } from 'react';
import { CheckMarkIcon, MoreRightIcon } from '@univerjs/icons';
import { useContext, useMemo, useRef } from 'react';
import { borderClassName, divideXClassName, focusClassName, scrollbarClassName } from '../../helper/class-utilities';
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

const EMPTY_OPTIONS: ICascaderOption[] = [];

function Empty({ emptyText }: { emptyText?: string }) {
    return (
        <section
            className={`
              univer-flex univer-h-8 univer-min-w-28 univer-items-center univer-px-3 univer-text-sm univer-text-gray-500
              dark:!univer-text-gray-300
            `}
        >
            {emptyText}
        </section>
    );
}

export function CascaderList(props: ICascaderListProps) {
    const { value, options = EMPTY_OPTIONS, onChange, contentClassName, wrapperClassName } = props;

    const { direction, locale } = useContext(ConfigContext);
    const columnOptionMapRef = useRef<Map<string, HTMLButtonElement>>(new Map());

    const activeOptions = useMemo(() => {
        const columns = [options];
        value.forEach((item, index) => {
            const currentLevel = columns[index];
            if (!currentLevel) {
                return;
            }
            const option = currentLevel.find((opt) => opt.value === item);

            if (option?.children) {
                columns.push(option.children);
            }
        });

        return columns;
    }, [options, value]);

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

    function handleKeyDown(
        event: KeyboardEvent<HTMLButtonElement>,
        colIndex: number,
        rowIndex: number,
        colOptions: ICascaderOption[]
    ) {
        const rtl = direction === 'rtl';
        const forwardKey = rtl ? 'ArrowLeft' : 'ArrowRight';
        const backwardKey = rtl ? 'ArrowRight' : 'ArrowLeft';

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            const nextRow = (rowIndex + 1) % colOptions.length;
            columnOptionMapRef.current.get(`${colIndex}:${nextRow}`)?.focus();
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            const prevRow = (rowIndex - 1 + colOptions.length) % colOptions.length;
            columnOptionMapRef.current.get(`${colIndex}:${prevRow}`)?.focus();
        } else if (event.key === forwardKey) {
            const option = colOptions[rowIndex];
            if (option?.children?.length) {
                event.preventDefault();
                handleChange(colIndex, option.value);
                columnOptionMapRef.current.get(`${colIndex + 1}:0`)?.focus();
            }
        } else if (event.key === backwardKey && colIndex > 0) {
            event.preventDefault();
            const parentCol = activeOptions[colIndex - 1] ?? [];
            const selectedParentIdx = Math.max(0, parentCol.findIndex((opt) => opt.value === value[colIndex - 1]));
            columnOptionMapRef.current.get(`${colIndex - 1}:${selectedParentIdx}`)?.focus();
        }
    }

    return (
        <section
            data-u-comp="cascader-list"
            dir={direction}
            className={clsx(
                `
                  univer-grid univer-h-full univer-max-h-80 univer-grid-flow-col univer-overflow-y-auto
                  univer-rounded-md univer-bg-gray-0 univer-py-1.5 univer-text-gray-900
                  dark:!univer-bg-gray-700 dark:!univer-text-gray-0
                `,
                borderClassName,
                divideXClassName,
                scrollbarClassName,
                wrapperClassName
            )}
        >
            {activeOptions.map((colOptions, index) => {
                const columnKey = index === 0 ? 'root' : `col-${value.slice(0, index).join('/') || 'empty'}`;

                return colOptions.length
                    ? (
                        <ul
                            key={columnKey}
                            role="listbox"
                            className={clsx(
                                `
                                  univer-m-0 univer-flex univer-h-full univer-max-h-full univer-list-none
                                  univer-flex-col univer-gap-0.5 univer-overflow-auto univer-px-1.5
                                `,
                                scrollbarClassName,
                                contentClassName
                            )}
                        >
                            {colOptions.map((option, rowIndex) => {
                                const selected = option.value === value[index];
                                const hasChildren = Boolean(option.children && option.children.length > 0);

                                return (
                                    <li key={option.value} role="presentation">
                                        <button
                                            ref={(el) => {
                                                const key = `${index}:${rowIndex}`;
                                                if (el) {
                                                    columnOptionMapRef.current.set(key, el);
                                                } else {
                                                    columnOptionMapRef.current.delete(key);
                                                }
                                            }}
                                            type="button"
                                            role="option"
                                            aria-selected={selected}
                                            className={clsx(
                                                `
                                                  univer-relative univer-flex univer-h-8 univer-w-full
                                                  univer-cursor-pointer univer-select-none univer-items-center
                                                  univer-gap-2 univer-rounded univer-border-none univer-bg-transparent
                                                  univer-text-left univer-text-sm univer-text-gray-900
                                                  univer-transition-colors univer-duration-200
                                                  hover:univer-bg-gray-100
                                                  motion-reduce:univer-transition-none
                                                  rtl:univer-text-right
                                                  dark:!univer-text-gray-0
                                                  dark:hover:!univer-bg-gray-600
                                                `,
                                                focusClassName,
                                                index > 0
                                                    ? `
                                                      univer-pl-7 univer-pr-2
                                                      rtl:univer-pl-2 rtl:univer-pr-7
                                                    `
                                                    : 'univer-px-2',
                                                selected && `
                                                  univer-bg-primary-50 univer-font-medium
                                                  dark:!univer-bg-gray-600
                                                `
                                            )}
                                            onClick={() => handleChange(index, option.value)}
                                            onKeyDown={(event) => handleKeyDown(event, index, rowIndex, colOptions)}
                                        >
                                            {index > 0 && selected && (
                                                <CheckMarkIcon
                                                    aria-hidden="true"
                                                    preserveStrokeWidth
                                                    className={`
                                                      univer-absolute univer-left-2 univer-top-1/2 univer-size-4
                                                      -univer-translate-y-1/2 univer-text-primary-600
                                                      rtl:univer-left-auto rtl:univer-right-2
                                                      dark:!univer-text-primary-300
                                                    `}
                                                />
                                            )}
                                            <span className="univer-truncate" style={{ color: option.color }}>
                                                {option.label}
                                            </span>
                                            {hasChildren && (
                                                <MoreRightIcon
                                                    aria-hidden="true"
                                                    preserveStrokeWidth
                                                    className={`
                                                      univer-ml-auto univer-size-3.5 univer-shrink-0
                                                      univer-text-gray-500
                                                      rtl:univer-ml-0 rtl:univer-mr-auto rtl:univer-rotate-180
                                                      dark:!univer-text-gray-300
                                                    `}
                                                />
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )
                    : (
                        <Empty key={columnKey} emptyText={locale?.CascaderList.empty} />
                    );
            })}
            {value.length <= 0 && (
                <Empty emptyText={locale?.CascaderList.empty} />
            )}
        </section>
    );
}
