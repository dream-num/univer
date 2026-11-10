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
import { MoreDownIcon } from '@univerjs/icons';
import { useContext, useMemo, useState } from 'react';
import type { IDropdownMenuProps } from '../dropdown-menu/DropdownMenu';
import { borderClassName, focusClassName, inputStateClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { Button } from '../button/Button';
import { DropdownMenu } from '../dropdown-menu/DropdownMenu';
import { FormLayoutContext } from '../form-layout/FormLayout';

interface IOption {
    label?: string | ReactNode;
    value?: string;
    disabled?: boolean;
    options?: IOption[];
}

interface IOptionSeparator {
    type: 'separator';
}

export interface ISelectProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onChange' | 'value'> {
    className?: string;
    size?: 'small' | 'large';

    /**
     * The value of select
     */
    value: string;

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

    /** Preferred side for the options popup. */
    side?: IDropdownMenuProps['side'];

    /** Whether the options popup may flip to avoid viewport collisions. */
    avoidCollisions?: IDropdownMenuProps['avoidCollisions'];

    /**
     * The callback function that is triggered when the value is changed
     */
    onChange: (value: string) => void;
}

export const selectClassName = clsx(`
  univer-box-border univer-inline-flex univer-h-8 univer-min-w-36 univer-items-center univer-justify-between
  univer-gap-2 univer-rounded-md univer-bg-gray-0 univer-px-2.5 univer-transition-colors univer-duration-200
  dark:!univer-bg-gray-700 dark:!univer-text-gray-0
`, borderClassName, focusClassName, inputStateClassName);

const EMPTY_OPTIONS: NonNullable<ISelectProps['options']> = [];

export function Select(props: ISelectProps) {
    const {
        className,
        size = 'small',
        value,
        disabled = false,
        options = EMPTY_OPTIONS,
        borderless = false,
        side,
        avoidCollisions,
        onChange,
        ...triggerProps
    } = props;

    const [open, setOpen] = useState(false);
    const invalid = useContext(FormLayoutContext);

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
            options: selectOptions,
            onSelect: (item) => {
                onChange(item);
            },
        }];
    }, [onChange, options, value]);

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
            className="univer-max-h-80 univer-w-[--radix-popper-anchor-width] univer-min-w-36 univer-overflow-auto"
            align="start"
            open={open}
            items={items}
            disabled={disabled}
            side={side}
            avoidCollisions={avoidCollisions}
            onOpenChange={handleOpenChange}
        >
            <Button
                size={size === 'large' ? 'extra-large' : 'middle'}
                {...triggerProps}
                type="button"
                disabled={disabled}
                data-u-comp="select"
                aria-invalid={triggerProps['aria-invalid'] ?? (invalid || undefined)}
                className={clsx(selectClassName, {
                    '!univer-border-primary-600 univer-outline-none univer-ring-2 univer-ring-primary-50 dark:!univer-border-primary-300 dark:!univer-ring-primary-900': open && !borderless,
                    'univer-border-transparent univer-bg-transparent hover:univer-border-transparent': borderless,
                    'univer-cursor-not-allowed': disabled,
                    'hover:univer-border-primary-600': !disabled && !borderless,
                    'univer-cursor-pointer': !disabled && !open,
                }, className)}
            >
                <span
                    className={`
                      univer-flex-1 univer-truncate univer-text-start univer-text-gray-500
                      dark:!univer-text-gray-0
                    `}
                >
                    {displayValue}
                </span>
                <MoreDownIcon
                    className={`
                      univer-flex-shrink-0
                      dark:!univer-text-gray-0
                    `}
                />
            </Button>
        </DropdownMenu>
    );
}
