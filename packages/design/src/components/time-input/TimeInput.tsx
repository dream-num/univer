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

import type { ChangeEvent } from 'react';
import { ClockIcon } from '@univerjs/icons';
import { borderClassName, inputStateClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { formatDateWithPattern } from '../../helper/date';

export interface ITimeInputProps {
    className?: string;
    value?: Date;
    disabled?: boolean;
    onValueChange?: (value: Date) => void;
}

export function TimeInput(props: ITimeInputProps) {
    const { className, value, disabled = false, onValueChange } = props;

    function handleChangeTime(event: ChangeEvent<HTMLInputElement>) {
        const timeString = event.target.value;
        if (!timeString) {
            return;
        }
        const [hours = 0, minutes = 0, seconds = 0] = timeString.split(':').map(Number);
        if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) {
            return;
        }
        const newValue = new Date(value ?? Date.now());
        newValue.setHours(hours, minutes, seconds, 0);

        onValueChange?.(newValue);
    }

    return (
        <div data-u-comp="time-input" className="univer-relative univer-mx-auto univer-w-fit">
            <ClockIcon
                aria-hidden="true"
                className="
                  univer-pointer-events-none univer-absolute univer-left-2 univer-top-1/2 univer-size-4
                  -univer-translate-y-1/2 univer-text-gray-500
                  rtl:univer-left-auto rtl:univer-right-2
                  dark:!univer-text-gray-300
                "
            />
            <input
                className={clsx(
                    `
                      univer-box-border univer-block univer-h-8 univer-w-fit univer-appearance-none univer-rounded-md
                      univer-bg-gray-0 univer-pl-7 univer-pr-2.5 univer-text-center univer-text-sm univer-tabular-nums
                      univer-text-gray-900 univer-transition-colors univer-duration-200
                      motion-reduce:univer-transition-none
                      rtl:univer-pl-2.5 rtl:univer-pr-7
                      dark:!univer-bg-gray-700 dark:!univer-text-gray-0
                      [&::-webkit-calendar-picker-indicator]:univer-hidden
                      [&::-webkit-calendar-picker-indicator]:univer-appearance-none
                    `,
                    !disabled && `
                      hover:univer-border-gray-300
                      dark:hover:!univer-border-gray-500
                    `,
                    disabled && `
                      univer-cursor-not-allowed univer-bg-gray-50 univer-text-gray-400
                      dark:!univer-bg-gray-800 dark:!univer-text-gray-500
                    `,
                    borderClassName,
                    inputStateClassName,
                    className
                )}
                type="time"
                step="1"
                disabled={disabled}
                value={formatDateWithPattern(value, 'HH:mm:ss')}
                onChange={handleChangeTime}
            />
        </div>
    );
}
