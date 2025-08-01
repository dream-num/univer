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

import { CalendarIcon } from '@univerjs/icons';
import dayjs from 'dayjs';
import { useState } from 'react';
import { borderClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { Calendar } from '../calendar/Calendar';
import { Dropdown } from '../dropdown/Dropdown';

interface IDateRangePickerProps {
    /**
     * Additional CSS classes for the date picker.
     */
    className?: string;

    /**
     * The value of the date picker.
     */
    value?: [Date, Date];

    /**
     * Callback when the value of the date picker changes.
     */
    onValueChange?: (date: [Date, Date]) => void;
}

export function DateRangePicker(props: IDateRangePickerProps) {
    const { value = [new Date(), new Date()], onValueChange, className } = props;

    const [open, setOpen] = useState(false);

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
            overlay={(
                <div className="univer-grid univer-grid-cols-2 univer-gap-2 univer-p-2">
                    <Calendar
                        value={value[0]}
                        max={value[1]}
                        onValueChange={(date) => {
                            handleValueChange([date, value[1]]);
                        }}
                    />
                    <Calendar
                        value={value[1]}
                        min={value[0]}
                        onValueChange={(date) => {
                            handleValueChange([value[0], date]);
                        }}
                    />
                </div>
            )}
            open={open}
            onOpenChange={setOpen}
        >
            <button
                className={clsx(`
                  univer-flex univer-h-8 univer-items-center univer-justify-between univer-gap-2 univer-rounded-md
                  univer-bg-transparent univer-px-2 univer-text-sm univer-text-gray-800 univer-transition-all
                  hover:univer-border-primary-600
                  dark:!univer-text-white
                `, borderClassName, className)}
                type="button"
            >
                <span className="univer-flex univer-gap-1">
                    <span>{dayjs(value[0]).format('YYYY-MM-DD')}</span>
                    <span>-</span>
                    <span>{dayjs(value[1]).format('YYYY-MM-DD')}</span>
                </span>

                <CalendarIcon
                    className={`
                      univer-text-gray-600
                      dark:!univer-text-gray-400
                    `}
                />
            </button>
        </Dropdown>
    );
}
