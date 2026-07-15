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

// Derived from numfmt 3.2.6 (MIT), commit c2cfdfa01bb1f24df51e985825671eb480daed4c.
// See packages/core/src/shared/numfmt/LICENSE.

import type { DateTimeParts } from './types';
import { toYMD } from './to-ymd';

const floor = Math.floor;
const DAYSIZE = 86400;
const dateUTC = Date.UTC as (...values: unknown[]) => number;

/**
 * Convert a native JavaScript Date, or array to a spreadsheet serial date.
 *
 * Returns a serial date number if input was a Date object or an array of
 * numbers, or null.
 */
export function dateToSerial(
    date: unknown,
    options?: { ignoreTimezone?: boolean }
): number | null {
    let timestamp: number | null = null;
    if (Array.isArray(date)) {
        const [year, month, day, hours, minutes, seconds] = date;
        timestamp = dateUTC(
            year,
            month == null ? 0 : month - 1,
            day ?? 1,
            hours || 0,
            minutes || 0,
            seconds || 0
        );
    } else if (date instanceof Date) {
        timestamp = date.getTime();
        if (!options?.ignoreTimezone) {
            // Many timezones are offset in seconds but getTimezoneOffset() returns
            // time "rounded" to minutes, so reconstruct the local components in UTC.
            const localDate = new Date();
            localDate.setUTCFullYear(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            );
            localDate.setUTCHours(
                date.getHours(),
                date.getMinutes(),
                date.getSeconds(),
                date.getMilliseconds()
            );
            timestamp = localDate.getTime();
        }
    }
    if (timestamp != null && Number.isFinite(timestamp)) {
        const days = timestamp / 864e5;
        return days - (days <= -25509 ? -25568 : -25569);
    }
    return null;
}

/**
 * Convert a spreadsheet serial date to an array of date parts, accurate to a
 * second.
 */
export function dateFromSerial(
    serial: number,
    options?: { leap1900?: boolean }
): DateTimeParts {
    let date = serial | 0;
    const fractionalSeconds = DAYSIZE * (serial - date);
    let time = floor(fractionalSeconds);
    if ((fractionalSeconds - time) > 0.9999) {
        time += 1;
        if (time === DAYSIZE) {
            time = 0;
            date += 1;
        }
    }
    const normalizedTime = time < 0 ? DAYSIZE + time : time;
    const [year, month, day] = toYMD(serial, 0, options?.leap1900);
    const hours = floor((normalizedTime / 60) / 60) % 60;
    const minutes = floor(normalizedTime / 60) % 60;
    const seconds = floor(normalizedTime) % 60;
    return [year, month, day, hours, minutes, seconds];
}
