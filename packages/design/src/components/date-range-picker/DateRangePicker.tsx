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
import { useContext, useState } from 'react';
import { borderClassName, divideXClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { formatDateWithPattern } from '../../helper/date';
import { Calendar } from '../calendar/Calendar';
import { dateTriggerVariants } from '../date-picker/DatePicker';
import { Dropdown } from '../dropdown/Dropdown';
import { FormLayoutContext } from '../form-layout/FormLayout';

export interface IDateRangePickerProps extends VariantProps<typeof dateTriggerVariants> {
    id?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;

    /**
     * Additional CSS classes for the date range picker.
     */
    className?: string;

    /**
     * The value of the date range picker.
     */
    value?: [Date, Date];

    /**
     * Display format pattern.
     * @default 'YYYY-MM-DD'
     */
    pattern?: string;

    /**
     * Whether the date range picker is disabled.
     * @default false
     */
    disabled?: boolean;

    /**
     * Callback when the value of the date range picker changes.
     */
    onValueChange?: (date: [Date, Date]) => void;
}

export function DateRangePicker(props: IDateRangePickerProps) {
    const {
        id,
        'aria-label': ariaLabel,
        'aria-labelledby': ariaLabelledby,
        'aria-describedby': ariaDescribedby,
        'aria-invalid': ariaInvalid,
        value = [new Date(), new Date()],
        pattern = 'YYYY-MM-DD',
        size,
        disabled = false,
        onValueChange,
        className,
    } = props;

    const [open, setOpen] = useState(false);
    const invalid = useContext(FormLayoutContext);

    function handleValueChange(date: [Date, Date]) {
        let [start, end] = date;

        // Ensure start date is before end date
        if (start > end) {
            // Swap the dates if they are in the wrong order
            [start, end] = [end, start];
        }
        onValueChange?.([start, end]);
        setOpen(false);
    }

    return (
        <Dropdown
            align="start"
            disabled={disabled}
            overlay={(
                <div className={clsx('univer-grid univer-grid-cols-2', divideXClassName)}>
                    <div className="univer-p-3">
                        <Calendar
                            value={value[0]}
                            max={value[1]}
                            onValueChange={(date) => {
                                handleValueChange([date, value[1]]);
                            }}
                        />
                    </div>
                    <div className="univer-p-3">
                        <Calendar
                            value={value[1]}
                            min={value[0]}
                            onValueChange={(date) => {
                                handleValueChange([value[0], date]);
                            }}
                        />
                    </div>
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
                data-u-comp="date-range-picker"
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
                <span className="univer-inline-flex univer-min-w-0 univer-items-center univer-gap-1.5">
                    <span className="univer-truncate">{formatDateWithPattern(value[0], pattern)}</span>
                    <span
                        aria-hidden="true"
                        className="
                          univer-text-gray-500
                          dark:!univer-text-gray-300
                        "
                    >
                        -
                    </span>
                    <span className="univer-truncate">{formatDateWithPattern(value[1], pattern)}</span>
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
