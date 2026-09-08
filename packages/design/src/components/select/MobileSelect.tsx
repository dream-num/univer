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
import type { IMobileDropdownMenuProps } from '../dropdown-menu/MobileDropdownMenu';
import type { ISelectProps } from './Select';
import { MoreDownIcon } from '@univerjs/icons';
import { useMemo, useState } from 'react';
import { clsx } from '../../helper/clsx';
import { MobileDropdownMenu } from '../dropdown-menu/MobileDropdownMenu';
import { selectClassName } from './Select';

interface IOptionSeparator {
    type: 'separator';
}

const EMPTY_OPTIONS: NonNullable<ISelectProps['options']> = [];

export type IMobileSelectProps = ISelectProps;

export function MobileSelect(props: IMobileSelectProps) {
    const {
        className,
        value,
        disabled = false,
        options = EMPTY_OPTIONS,
        borderless = false,
        onChange,
    } = props;
    const [open, setOpen] = useState(false);
    const items: IMobileDropdownMenuProps['items'] = useMemo(() => {
        const selectOptions: Array<IOptionSeparator | { label?: ReactNode; value: string; disabled?: boolean }> = [];

        for (const option of options) {
            if (option.options) {
                for (const nestedOption of option.options) {
                    selectOptions.push({
                        label: nestedOption.label,
                        value: nestedOption.value!,
                        disabled: nestedOption.disabled,
                    });
                }
                selectOptions.push({ type: 'separator' });
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

    return (
        <MobileDropdownMenu
            open={open}
            items={items}
            disabled={disabled}
            onOpenChange={setOpen}
        >
            <button
                type="button"
                disabled={disabled}
                aria-expanded={open}
                data-u-comp="mobile-select"
                className={clsx(selectClassName, '!univer-h-auto !univer-min-h-12 univer-text-left', {
                    'univer-border-primary-600 univer-outline-none univer-ring-2 univer-ring-primary-50 dark:!univer-ring-primary-900': open && !borderless,
                    'univer-border-transparent univer-bg-transparent': borderless,
                    'univer-cursor-not-allowed': disabled,
                    'univer-cursor-pointer': !disabled,
                }, className)}
            >
                <div
                    className="
                      univer-flex-1 univer-truncate univer-text-base univer-text-gray-500
                      dark:!univer-text-gray-0
                    "
                >
                    {displayValue}
                </div>
                <MoreDownIcon
                    className="
                      univer-flex-shrink-0
                      dark:!univer-text-gray-0
                    "
                />
            </button>
        </MobileDropdownMenu>
    );
}
