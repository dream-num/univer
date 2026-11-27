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

import type { VariantProps } from 'class-variance-authority';
import { CalendarIcon } from '@univerjs/icons';
import { cva } from 'class-variance-authority';
import { useContext, useState } from 'react';
import { borderClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { formatDateWithPattern } from '../../helper/date';
import { Calendar } from '../calendar/Calendar';
import { Dropdown } from '../dropdown/Dropdown';
import { FormLayoutContext } from '../form-layout/FormLayout';

export const dateTriggerVariants = cva(
    `
      univer-box-border univer-inline-flex univer-items-center univer-justify-between univer-gap-2 univer-rounded-md
      univer-bg-gray-0 univer-tabular-nums univer-text-gray-900 univer-outline-none univer-transition-colors
      univer-duration-200
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
    `,
    {
        variants: {
            size: {
                mini: 'univer-h-7 univer-px-2 univer-text-sm',
                small: 'univer-h-8 univer-px-2.5 univer-text-sm',
                middle: 'univer-h-10 univer-px-3 univer-text-base',
                large: 'univer-h-12 univer-px-4 univer-text-lg',
            },
        },
        defaultVariants: {
            size: 'small',
        },
    }
);

export interface IDatePickerProps extends VariantProps<typeof dateTriggerVariants> {
    id?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;

    /**
     * Additional CSS classes for the date picker.
     */
    className?: string;

    /**
     * The value of the date picker.
     */
    value?: Date;

    /**
     * Placeholder shown when value is undefined.
     */
    placeholder?: string;

    /**
     * Display format pattern.
     */
    pattern?: string;

    /**
     * Minimum selectable date.
     */
    min?: Date;

    /**
     * Maximum selectable date.
     */
    max?: Date;

    /**
     * Whether to show the time selector in the calendar popover.
     */
    showTime?: boolean;

    /**
     * Whether the date picker is disabled.
     * @default false
     */
    disabled?: boolean;

    /**
     * Callback when the value of the date picker changes.
     */
    onValueChange?: (date: Date) => void;
}

export function DatePicker(props: IDatePickerProps) {
    const {
        id,
        'aria-label': ariaLabel,
        'aria-labelledby': ariaLabelledby,
        'aria-describedby': ariaDescribedby,
        'aria-invalid': ariaInvalid,
        value,
        placeholder,
        pattern,
        min,
        max,
        showTime = false,
        size,
        disabled = false,
        onValueChange,
        className,
    } = props;

    const [open, setOpen] = useState(false);
    const invalid = useContext(FormLayoutContext);

    function handleValueChange(date: Date, changeType?: 'date' | 'time') {
        onValueChange?.(date);
        if (changeType !== 'time') {
            setOpen(false);
        }
    }

    const displayPattern = pattern ?? (showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD');
    const isPlaceholder = value === undefined && placeholder !== undefined;
    const displayText = isPlaceholder ? placeholder : formatDateWithPattern(value, displayPattern);

    return (
        <Dropdown
            align="start"
            disabled={disabled}
            overlay={(
                <div className="univer-p-3">
                    <Calendar
                        value={value}
                        min={min}
                        max={max}
                        showTime={showTime}
                        onValueChange={handleValueChange}
                    />
                </div>
            )}
            open={!disabled && open}
            onOpenChange={(nextOpen) => {
                if (!disabled) {
                    setOpen(nextOpen);
                }
            }}
        >
            <button
                id={id}
                data-u-comp="date-picker"
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledby}
                aria-describedby={ariaDescribedby}
                aria-invalid={ariaInvalid ?? (invalid || undefined)}
                aria-expanded={!disabled && open}
                aria-haspopup="dialog"
                disabled={disabled}
                className={clsx(
                    dateTriggerVariants({ size }),
                    borderClassName,
                    disabled
                        ? `
                          univer-cursor-not-allowed univer-bg-gray-50 univer-text-gray-400
                          dark:!univer-bg-gray-800 dark:!univer-text-gray-500
                        `
                        : `
                          univer-cursor-pointer
                          hover:univer-border-gray-300
                          dark:hover:!univer-border-gray-500
                        `,
                    !disabled && open && `
                      !univer-border-primary-600 univer-ring-2 univer-ring-primary-50
                      dark:!univer-border-primary-300 dark:!univer-ring-primary-900
                    `,
                    className
                )}
                type="button"
            >
                <span
                    className={clsx(
                        'univer-truncate univer-text-start',
                        isPlaceholder && `
                          univer-text-gray-500
                          dark:!univer-text-gray-300
                        `
                    )}
                >
                    {displayText}
                </span>

                <CalendarIcon
                    aria-hidden="true"
                    className={clsx(
                        'univer-size-4 univer-shrink-0',
                        disabled
                            ? `
                              univer-text-gray-400
                              dark:!univer-text-gray-500
                            `
                            : `
                              univer-text-gray-500
                              dark:!univer-text-gray-300
                            `
                    )}
                />
            </button>
        </Dropdown>
    );
}
