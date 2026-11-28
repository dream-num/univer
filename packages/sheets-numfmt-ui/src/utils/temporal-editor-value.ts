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

import type { DateSystem, INumfmtLocaleTag } from '@univerjs/core';
import { getRegionalDatePattern, getRegionalNumberFormat, getRegionalTimePattern, numfmt } from '@univerjs/core';

interface ITemporalEditorValueOptions {
    region?: string;
    serial: number;
    pattern: string;
    locale: INumfmtLocaleTag;
    dateSystem: DateSystem;
}

interface IParseTemporalEditorValueOptions {
    region?: string;
    content: string;
    originalSerial: number;
    pattern: string;
    locale: INumfmtLocaleTag;
    dateSystem: DateSystem;
}

type TemporalType = 'date' | 'datetime' | 'duration' | 'time';

function getTemporalType(pattern: string): TemporalType | null {
    const dateInfo = numfmt.getFormatDateInfo(pattern);
    if (dateInfo.isDuration) {
        // Elapsed-time formats can exceed 24 hours and therefore cannot use calendar-time parsing.
        return 'duration';
    }

    const type = numfmt.getFormatInfo(pattern).type;
    return type === 'date' || type === 'datetime' || type === 'time' ? type : null;
}

function serializeDuration(serial: number, clock: string, decimal: string): string {
    // Round once at the editor's millisecond precision so carries stay consistent across every component.
    const totalMilliseconds = Math.round(Math.abs(serial) * 86400000);
    const hours = Math.floor(totalMilliseconds / 3600000);
    const minutes = Math.floor(totalMilliseconds / 60000) % 60;
    const seconds = Math.floor(totalMilliseconds / 1000) % 60;
    const milliseconds = totalMilliseconds % 1000;
    const fraction = milliseconds
        ? `${decimal}${String(milliseconds).padStart(3, '0').replace(/0+$/, '')}`
        : '';
    return `${serial < 0 ? '-' : ''}${hours}${clock}${String(minutes).padStart(2, '0')}${clock}${String(seconds).padStart(2, '0')}${fraction}`;
}

export function serializeTemporalEditorValue(options: ITemporalEditorValueOptions): string | null {
    const { serial, pattern, locale, dateSystem, region } = options;
    const type = getTemporalType(pattern);
    if (!type || !Number.isFinite(serial) || (serial < 0 && type !== 'duration')) {
        return null;
    }
    if (type === 'duration') {
        const clock = region ? getRegionalTimePattern(region).match(/[:. ]/)![0] : ':';
        const decimal = region ? getRegionalNumberFormat(region).decimal : numfmt.getLocale(locale)?.decimal ?? '.';
        return serializeDuration(serial, clock, decimal);
    }

    let canonicalPattern = numfmt.getDateTimeEditPattern(pattern, serial);
    if (!canonicalPattern) return null;
    if (region && type === 'time') {
        // The edit field retains the format's hour width and shows every clock component.
        const separator = getRegionalTimePattern(region).match(/[:. ]/)![0];
        canonicalPattern = canonicalPattern.replace(/:/g, `"${separator}"`);
    } else if (region && (type === 'date' || type === 'datetime')) {
        const shortDate = getRegionalDatePattern(region, locale).replace(/y+/, 'yyyy').replace(/[.-]/g, '/');
        canonicalPattern = type === 'date' ? shortDate : `${shortDate} h:mm:ss`;
    }
    return numfmt.format(canonicalPattern, serial, { locale, region, dateSystem, throws: false });
}

function parseDuration(content: string, locale: INumfmtLocaleTag, region?: string): number | null {
    const decimal = region ? getRegionalNumberFormat(region).decimal : numfmt.getLocale(locale)?.decimal ?? '.';
    const clock = region ? getRegionalTimePattern(region).match(/[:. ]/)![0] : ':';
    const fields = content.trim().split(clock);
    if (fields.length !== 3 || (decimal !== '.' && fields[2].includes('.'))) return null;
    fields[2] = fields[2].replace(decimal, '.');
    const normalized = fields.join(':');
    const match = /^\s*([+-])?(\d+):([0-5]?\d):([0-5]?\d)(\.\d{1,10})?\s*$/.exec(normalized);
    if (!match) {
        return null;
    }

    const sign = match[1] === '-' ? -1 : 1;
    const hours = Number(match[2]);
    const minutes = Number(match[3]);
    const seconds = Number(match[4]);
    const fractionalSecond = Number(match[5] ?? 0);
    return sign * (hours * 3600 + minutes * 60 + seconds + fractionalSecond) / 86400;
}

export function parseTemporalEditorValue(options: IParseTemporalEditorValueOptions): number | null {
    const { content, originalSerial, pattern, locale, dateSystem } = options;
    const type = getTemporalType(pattern);
    if (!type || !Number.isFinite(originalSerial) || (originalSerial < 0 && type !== 'duration')) {
        return null;
    }

    // The formula bar rounds time to seconds. Accepting its unchanged content preserves the hidden fraction.
    if (content === serializeTemporalEditorValue({ ...options, serial: originalSerial })) return originalSerial;
    if (type === 'duration') {
        return parseDuration(content, locale, options.region);
    }

    if (type === 'time') {
        const parsed = numfmt.parseTime(content, { locale, dateSystem, region: options.region });
        // A time-only edit must not discard a date component hidden by the cell format.
        return parsed ? Math.floor(originalSerial) + Number(parsed.v) : null;
    }

    const parsed = numfmt.parseDate(content, { locale, dateSystem, region: options.region });
    if (!parsed || typeof parsed.v !== 'number') {
        return null;
    }

    if (type === 'date') {
        // A date-only edit must not discard time and subsecond components hidden by the cell format.
        return Math.floor(parsed.v) + (originalSerial - Math.floor(originalSerial));
    }

    return parsed.v;
}
