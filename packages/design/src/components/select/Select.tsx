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
import type { IDropdownMenuProps } from '../dropdown-menu/DropdownMenu';
import { MoreDownSingle } from '@univerjs/icons';
import { useMemo, useState } from 'react';
import { clsx } from '../../helper/clsx';
import { DropdownMenu } from '../dropdown-menu/DropdownMenu';

interface IOption {
    label?: string | ReactNode;
    value?: string;
    disabled?: boolean;
    options?: IOption[];
}

interface IOptionSeparator {
    type: 'separator';
}

export interface ISelectProps {
    className?: string;

    /**
     * The value of select
     */
    value: string;

    /**
     * select mode
     * @default 'combobox'
     */
    mode?: 'combobox' | 'multiple';

    /**
     * Whether the select is disabled
     * @default false
     */
    disabled?: boolean;

    /**
     * The options of select
     * @default []
     */
    options?: IOption[];

    /**
     * The style of select
     * @default false
     */
    borderless?: boolean;

    /**
     * The callback function that is triggered when the value is changed
     */
    onChange: (value: string) => void;
}

export function Select(props: ISelectProps) {
    const {
        className,
        value,
        mode,
        disabled = false,
        options = [],
        borderless = false,
        onChange,
    } = props;

    const [open, setOpen] = useState(false);

    function handleOpenChange(open: boolean) {
        setOpen(open);
    }

    const items: IDropdownMenuProps['items'] = useMemo(() => {
        const selectOptions: (IOption | IOptionSeparator)[] = [];

        for (const option of options) {
            if (option.options) {
                option.options.forEach((opt) => {
                    selectOptions.push({
                        label: opt.label,
                        value: opt.value!,
                        disabled: opt.disabled,
                    });
                });
                selectOptions.push({
                    type: 'separator',
                });
            } else {
                selectOptions.push({
                    label: option.label,
                    value: option.value!,
                    disabled: option.disabled,
                });
            }
        }

        return [{
            type: 'radio',
            value,
            hideIndicator: true,
            options: selectOptions,
            onSelect: (item) => {
                onChange(item);
            },
        }];
    }, [options]);

    const displayValue = useMemo(() => {
        let label = null;

        for (const option of options) {
            if (option.options) {
                for (const opt of option.options) {
                    if (opt.value === value) {
                        label = opt.label;
                        break;
                    }
                }
            } else {
                if (option.value === value) {
                    label = option.label;
                    break;
                }
            }
        }

        return label || value;
    }, [options, value]);

    return (
        <DropdownMenu
            className="univer-w-[var(--radix-popper-anchor-width)] univer-min-w-36"
            align="start"
            open={open}
            items={items}
            disabled={disabled}
            onOpenChange={handleOpenChange}
        >
            <div
                className={clsx(`
                  univer-box-border univer-inline-flex univer-h-8 univer-min-w-36 univer-cursor-pointer
                  univer-items-center univer-justify-between univer-gap-2 univer-rounded-lg univer-border
                  univer-border-solid univer-border-gray-200 univer-bg-white univer-px-2.5 univer-transition-colors
                  univer-duration-200
                  dark:univer-border-gray-600 dark:univer-bg-gray-700 dark:univer-text-white
                  hover:univer-border-primary-600
                `, {
                    'univer-border-primary-600 univer-outline-none univer-ring-2 univer-ring-primary-600/20': open && !borderless,
                    'univer-border-transparent univer-bg-transparent hover:univer-border-transparent': borderless,
                }, className)}
            >
                <span
                    className={`
                      univer-truncate univer-text-sm univer-text-gray-500
                      dark:univer-text-white
                    `}
                >
                    {displayValue}
                </span>
                <MoreDownSingle
                    className={`
                      univer-flex-shrink-0
                      dark:univer-text-white
                    `}
                />
            </div>
        </DropdownMenu>
    );
}
