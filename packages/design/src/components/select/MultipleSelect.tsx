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
import { MoreDownIcon } from '@univerjs/icons';
import { useContext, useMemo, useState } from 'react';
import type { IDropdownMenuProps } from '../dropdown-menu/DropdownMenu';
import { clsx } from '../../helper/clsx';
import { Badge } from '../badge/Badge';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { DropdownMenu } from '../dropdown-menu/DropdownMenu';
import { FormLayoutContext } from '../form-layout/FormLayout';
import { selectClassName } from './Select';

interface IOption {
    label?: string | ReactNode;
    value?: string;
    disabled?: boolean;
}

export interface IMultipleSelectProps {
    id?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
    className?: string;
    size?: 'small' | 'large';
    placeholder?: string;

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
        id,
        'aria-label': ariaLabel,
        'aria-labelledby': ariaLabelledby,
        'aria-describedby': ariaDescribedby,
        'aria-invalid': ariaInvalid,
        className,
        size = 'small',
        placeholder,
        value = [],
        disabled = false,
        options = [],
        borderless = false,
        onChange,
    } = props;

    const { direction } = useContext(ConfigContext);
    const [open, setOpen] = useState(false);
    const invalid = useContext(FormLayoutContext);

    function handleOpenChange(nextOpen: boolean) {
        if (!disabled) {
            setOpen(nextOpen);
        }
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
    }, [onChange, options, value]);

    function handleClose(item: string) {
        if (disabled) return;
        const newValue = value.filter((v) => v !== item);
        onChange(newValue);
    }

    const displayValue = options
        .filter((option) => value.includes(option.value!))
        .map((option) => (
            <Badge
                key={option.value}
                className="univer-max-w-32"
                closable={!disabled && !option.disabled}
                onClose={() => handleClose(option.value!)}
            >
                {option.label}
            </Badge>
        ));

    return (
        <DropdownMenu
            className="univer-max-h-80 univer-w-[--radix-popper-anchor-width] univer-min-w-36 univer-overflow-auto"
            align="start"
            open={!disabled && open}
            items={items}
            disabled={disabled}
            onOpenChange={handleOpenChange}
        >
            <div
                id={id}
                dir={direction}
                role="combobox"
                tabIndex={disabled ? -1 : 0}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledby}
                aria-describedby={ariaDescribedby}
                aria-expanded={!disabled && open}
                aria-haspopup="menu"
                aria-disabled={disabled || undefined}
                data-u-comp="multiple-select"
                aria-invalid={ariaInvalid ?? (invalid || undefined)}
                className={clsx(
                    selectClassName,
                    size === 'large'
                        ? 'univer-h-auto univer-min-h-12 univer-py-1.5 univer-text-base'
                        : 'univer-h-auto univer-min-h-8 univer-py-1 univer-text-sm',
                    {
                        '!univer-border-primary-600 univer-outline-none univer-ring-2 univer-ring-primary-50 dark:!univer-border-primary-300 dark:!univer-ring-primary-900': !disabled && open && !borderless,
                        'univer-border-transparent univer-bg-transparent hover:univer-border-transparent dark:!univer-border-transparent dark:!univer-bg-transparent': borderless,
                        'univer-cursor-not-allowed !univer-bg-gray-50 !univer-text-gray-400 univer-opacity-60 dark:!univer-bg-gray-800 dark:!univer-text-gray-500': disabled,
                        'hover:univer-border-gray-300 dark:hover:!univer-border-gray-500': !disabled && !borderless,
                        'univer-cursor-pointer': !disabled,
                    },
                    className
                )}
            >
                <div
                    className="
                      univer-flex univer-min-w-0 univer-flex-1 univer-flex-wrap univer-items-center univer-gap-1
                    "
                >
                    {displayValue.length > 0
                        ? displayValue
                        : placeholder
                            ? (
                                <span
                                    className="
                                      univer-truncate univer-text-gray-500
                                      dark:!univer-text-gray-300
                                    "
                                >
                                    {placeholder}
                                </span>
                            )
                            : null}
                </div>
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
                        !disabled && open && 'univer-rotate-180'
                    )}
                />
            </div>
        </DropdownMenu>
    );
}
