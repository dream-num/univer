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
import { excelSerialToDateTimeParts, numfmt } from '@univerjs/core';

interface ITemporalEditorValueOptions {
    serial: number;
    pattern: string;
    locale: INumfmtLocaleTag;
    dateSystem: DateSystem;
}

interface IParseTemporalEditorValueOptions {
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

function trimFraction(value: string, locale: INumfmtLocaleTag): string {
    const decimal = numfmt.getLocale(locale)?.decimal ?? '.';
    const decimalIndex = value.lastIndexOf(decimal);
    if (decimalIndex < 0) {
        return value;
    }

    const suffixStart = value.indexOf(' ', decimalIndex);
    const end = suffixStart < 0 ? value.length : suffixStart;
    let fractionEnd = end;
    while (fractionEnd > decimalIndex + 1 && value[fractionEnd - 1] === '0') {
        fractionEnd--;
    }

    return value.slice(0, fractionEnd) + value.slice(end);
}

function serializeDuration(serial: number, locale: INumfmtLocaleTag): string {
    // Round once at the editor's millisecond precision so carries stay consistent across every component.
    const totalMilliseconds = Math.round(Math.abs(serial) * 86400000);
    const hours = Math.floor(totalMilliseconds / 3600000);
    const minutes = Math.floor(totalMilliseconds / 60000) % 60;
    const seconds = Math.floor(totalMilliseconds / 1000) % 60;
    const milliseconds = totalMilliseconds % 1000;
    const fraction = milliseconds
        ? `${numfmt.getLocale(locale)?.decimal ?? '.'}${String(milliseconds).padStart(3, '0').replace(/0+$/, '')}`
        : '';
    return `${serial < 0 ? '-' : ''}${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}${fraction}`;
}

export function serializeTemporalEditorValue(options: ITemporalEditorValueOptions): string | null {
    const { serial, pattern, locale, dateSystem } = options;
    const type = getTemporalType(pattern);
    if (!type || !Number.isFinite(serial) || (serial < 0 && type !== 'duration')) {
        return null;
    }
    if (type === 'duration') return serializeDuration(serial, locale);

    const parts = excelSerialToDateTimeParts(serial, { dateSystem });
    if (!parts) return null;
    const hasFraction = Math.round(parts.fractionalSecond * 1000) > 0;
    // This complete pattern is only for the editable text; the cell's persisted numfmt remains unchanged.
    const canonicalPattern = numfmt.getDateTimeEditPattern(pattern, serial);
    if (!canonicalPattern) return null;

    const value = numfmt.format(canonicalPattern, serial, { locale, dateSystem, throws: false });
    return hasFraction ? trimFraction(value, locale) : value;
}

function parseDuration(content: string, locale: INumfmtLocaleTag): number | null {
    const decimal = numfmt.getLocale(locale)?.decimal ?? '.';
    const normalized = decimal === '.' ? content : content.replace(decimal, '.');
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

    if (type === 'duration') {
        return parseDuration(content, locale);
    }

    if (type === 'time') {
        const parsed = numfmt.parseTime(content, { locale, dateSystem });
        // A time-only edit must not discard a date component hidden by the cell format.
        return parsed ? Math.floor(originalSerial) + Number(parsed.v) : null;
    }

    const parsed = numfmt.parseDate(content, { locale, dateSystem });
    if (!parsed || typeof parsed.v !== 'number') {
        return null;
    }

    if (type === 'date') {
        // A date-only edit must not discard time and subsecond components hidden by the cell format.
        return Math.floor(parsed.v) + (originalSerial - Math.floor(originalSerial));
    }

    return parsed.v;
}
