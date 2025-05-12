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
import { borderClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { Badge } from '../badge/Badge';
import { DropdownMenu } from '../dropdown-menu/DropdownMenu';

interface IOption {
    label?: string | ReactNode;
    value?: string;
    disabled?: boolean;
}

export interface IMultipleSelectProps {
    className?: string;

    /**
     * The value of select
     */
    value: string[];

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
    onChange: (values: string[]) => void;
}

export function MultipleSelect(props: IMultipleSelectProps) {
    const {
        className,
        value = [],
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
        return options.map((option) => {
            return {
                type: 'checkbox',
                value: option.value!,
                label: option.label,
                disabled: option.disabled,
                checked: value.includes(option.value!),
                onSelect: (item: string) => {
                    const newValue = value.includes(item) ? value.filter((v) => v !== item) : [...value, item];

                    onChange(newValue);
                },
            };
        });
    }, [options]);

    function handleClose(item: string) {
        const newValue = value.filter((v) => v !== item);
        onChange(newValue);
    }

    const displayValue = useMemo(() => {
        return options
            .filter((option) => value.includes(option.value!))
            .map((option, index) => (
                <Badge
                    key={index}
                    className="univer-max-w-32"
                    closable
                    onClose={() => handleClose(option.value!)}
                >
                    {option.label}
                </Badge>
            ));
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
                data-u-comp="multiple-select"
                className={clsx(`
                  univer-box-border univer-inline-flex univer-h-8 univer-min-w-36 univer-items-center
                  univer-justify-between univer-rounded-lg univer-bg-white univer-px-2.5 univer-transition-colors
                  univer-duration-200
                  dark:univer-bg-gray-700 dark:univer-text-white
                `, borderClassName, {
                    'univer-border-primary-600 univer-outline-none univer-ring-2 univer-ring-primary-50': open && !borderless,
                    'univer-border-transparent univer-bg-transparent hover:univer-border-transparent': borderless,
                    'univer-cursor-not-allowed': disabled,
                    'hover:univer-border-primary-600': !disabled && !borderless,
                    'univer-cursor-pointer': !disabled && !open,
                }, className)}
            >
                <div
                    className="univer-box-border univer-flex univer-w-[calc(100%-16px)] univer-gap-2 univer-pr-2"
                >
                    {displayValue}
                </div>
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
