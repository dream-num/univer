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

interface ITimeInputProps {
    className?: string;
    value?: Date;
    onValueChange?: (value: Date) => void;
}

export function TimeInput(props: ITimeInputProps) {
    const { className, value, onValueChange } = props;

    function handleChangeTime(event: ChangeEvent<HTMLInputElement>) {
        const timeString = event.target.value;
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        const newValue = new Date(value ?? Date.now());
        newValue.setHours(hours, minutes, seconds, 0);

        onValueChange?.(newValue);
    };

    return (
        <div data-u-comp="time-input" className="univer-relative univer-mx-auto univer-mt-1 univer-w-fit">
            <ClockIcon
                className={`
                  univer-absolute univer-left-2 univer-top-1/2 -univer-translate-y-1/2 univer-text-gray-600
                  dark:!univer-text-gray-400
                `}
            />
            <input
                className={clsx(`
                  univer-box-border univer-block univer-h-7 univer-w-fit univer-appearance-none univer-rounded-md
                  univer-bg-gray-0 univer-pl-6 univer-pr-2 univer-text-center univer-text-sm univer-text-gray-800
                  univer-transition-all univer-duration-200
                  dark:!univer-bg-gray-700 dark:!univer-text-gray-0
                  [&::-webkit-calendar-picker-indicator]:univer-hidden
                  [&::-webkit-calendar-picker-indicator]:univer-appearance-none
                `, borderClassName, inputStateClassName, className)}
                type="time"
                step="1"
                value={formatDateWithPattern(value, 'HH:mm:ss')}
                onChange={handleChangeTime}
            />
        </div>
    );
}
