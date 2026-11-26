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
import { borderClassName } from '../../helper/class-utilities';
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
     * Placeholder shown when value is empty and no matching option is selected
     */
    placeholder?: string;

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
  univer-gap-2 univer-rounded-md univer-bg-gray-0 univer-px-2.5 univer-text-gray-900 univer-outline-none
  univer-transition-colors univer-duration-200
  aria-[invalid=true]:!univer-border-red-600
  focus-visible:!univer-border-primary-600 focus-visible:univer-outline-0 focus-visible:univer-ring-2
  focus-visible:univer-ring-primary-50
  aria-[invalid=true]:focus-visible:!univer-border-red-600 aria-[invalid=true]:focus-visible:univer-ring-red-50
  motion-reduce:univer-transition-none
  dark:!univer-bg-gray-700 dark:!univer-text-gray-0
  dark:aria-[invalid=true]:!univer-border-red-400
  dark:focus-visible:!univer-border-primary-300 dark:focus-visible:!univer-ring-primary-900
  dark:aria-[invalid=true]:focus-visible:!univer-border-red-400
  dark:aria-[invalid=true]:focus-visible:!univer-ring-red-900
`, borderClassName);

const EMPTY_OPTIONS: NonNullable<ISelectProps['options']> = [];

export function Select(props: ISelectProps) {
    const {
        className,
        size = 'small',
        value,
        placeholder,
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

    function handleOpenChange(nextOpen: boolean) {
        setOpen(nextOpen);
    }

    const items: IDropdownMenuProps['items'] = useMemo(() => {
        const selectOptions: (IOption | IOptionSeparator)[] = [];

        options.forEach((option, index) => {
            if (option.options) {
                option.options.forEach((opt) => {
                    selectOptions.push({
                        label: opt.label,
                        value: opt.value!,
                        disabled: opt.disabled,
                    });
                });
                if (index < options.length - 1) {
                    selectOptions.push({
                        type: 'separator',
                    });
                }
            } else {
                selectOptions.push({
                    label: option.label,
                    value: option.value!,
                    disabled: option.disabled,
                });
            }
        });

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
        let label: string | ReactNode = null;

        for (const option of options) {
            if (option.options) {
                for (const opt of option.options) {
                    if (opt.value === value) {
                        label = opt.label;
                        break;
                    }
                }
            } else if (option.value === value) {
                label = option.label;
                break;
            }
        }

        return label || value;
    }, [options, value]);

    const isPlaceholder = !displayValue && Boolean(placeholder);

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
                className={clsx(selectClassName, 'univer-font-normal', {
                    '!univer-border-primary-600 univer-outline-none univer-ring-2 univer-ring-primary-50 dark:!univer-border-primary-300 dark:!univer-ring-primary-900': open && !borderless,
                    'univer-border-transparent univer-bg-transparent hover:univer-border-transparent dark:!univer-border-transparent dark:!univer-bg-transparent': borderless,
                    'univer-cursor-not-allowed !univer-bg-gray-50 !univer-text-gray-400 dark:!univer-bg-gray-800 dark:!univer-text-gray-500': disabled,
                    'hover:univer-border-gray-300 hover:!univer-bg-gray-0 dark:hover:!univer-border-gray-500 dark:hover:!univer-bg-gray-700': !disabled && !borderless,
                    'univer-cursor-pointer': !disabled,
                }, className)}
            >
                <span
                    className={clsx(
                        'univer-flex-1 univer-truncate univer-text-start',
                        isPlaceholder
                            ? `
                              univer-text-gray-500
                              dark:!univer-text-gray-300
                            `
                            : `
                              univer-text-gray-900
                              dark:!univer-text-gray-0
                            `,
                        disabled && `
                          !univer-text-gray-400
                          dark:!univer-text-gray-500
                        `
                    )}
                >
                    {isPlaceholder ? placeholder : displayValue}
                </span>
                <MoreDownIcon
                    aria-hidden="true"
                    preserveStrokeWidth
                    className={clsx(
                        `
                          univer-size-4 univer-shrink-0 univer-text-gray-500 univer-transition-transform
                          univer-duration-200
                          motion-reduce:univer-transition-none
                          dark:!univer-text-gray-300
                        `,
                        open && 'univer-rotate-180'
                    )}
                />
            </Button>
        </DropdownMenu>
    );
}
