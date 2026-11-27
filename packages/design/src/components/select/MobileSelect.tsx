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
import type { IMobileDropdownMenuProps } from '../dropdown-menu/MobileDropdownMenu';
import type { ISelectProps } from './Select';
import { clsx } from '../../helper/clsx';
import { Button } from '../button/Button';
import { MobileDropdownMenu } from '../dropdown-menu/MobileDropdownMenu';
import { FormLayoutContext } from '../form-layout/FormLayout';
import { selectClassName } from './Select';

interface IOptionSeparator {
    type: 'separator';
}

const EMPTY_OPTIONS: NonNullable<ISelectProps['options']> = [];

export type IMobileSelectProps = ISelectProps;

export function MobileSelect(props: IMobileSelectProps) {
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
    const items: IMobileDropdownMenuProps['items'] = useMemo(() => {
        const selectOptions: Array<IOptionSeparator | { label?: ReactNode; value: string; disabled?: boolean }> = [];

        options.forEach((option, index) => {
            if (option.options) {
                for (const nestedOption of option.options) {
                    selectOptions.push({
                        label: nestedOption.label,
                        value: nestedOption.value!,
                        disabled: nestedOption.disabled,
                    });
                }
                if (index < options.length - 1) {
                    selectOptions.push({ type: 'separator' });
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
            hideIndicator: true,
            options: selectOptions,
            onSelect: onChange,
        }];
    }, [onChange, options, value]);
    const displayValue = useMemo(() => {
        for (const option of options) {
            if (option.options) {
                const nestedOption = option.options.find((item) => item.value === value);
                if (nestedOption) {
                    return nestedOption.label || value;
                }
            } else if (option.value === value) {
                return option.label || value;
            }
        }

        return value;
    }, [options, value]);

    const isPlaceholder = !displayValue && Boolean(placeholder);

    return (
        <MobileDropdownMenu
            open={open}
            items={items}
            disabled={disabled}
            side={side}
            avoidCollisions={avoidCollisions}
            onOpenChange={setOpen}
        >
            <Button
                size={size === 'large' ? 'extra-large' : 'middle'}
                {...triggerProps}
                type="button"
                disabled={disabled}
                aria-expanded={open}
                data-u-comp="mobile-select"
                aria-invalid={triggerProps['aria-invalid'] ?? (invalid || undefined)}
                className={clsx(selectClassName, 'univer-text-start univer-font-normal', {
                    '!univer-border-primary-600 univer-outline-none univer-ring-2 univer-ring-primary-50 dark:!univer-border-primary-300 dark:!univer-ring-primary-900': open && !borderless,
                    'univer-border-transparent univer-bg-transparent dark:!univer-border-transparent dark:!univer-bg-transparent': borderless,
                    'univer-cursor-not-allowed !univer-bg-gray-50 !univer-text-gray-400 dark:!univer-bg-gray-800 dark:!univer-text-gray-500': disabled,
                    'univer-cursor-pointer': !disabled,
                }, className)}
            >
                <span
                    className={clsx(
                        'univer-flex-1 univer-truncate',
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
        </MobileDropdownMenu>
    );
}
