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

type DateKitCoreUnit = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
export type DateKitUnitType =
    | DateKitCoreUnit
    | 'milliseconds'
    | 'ms'
    | 'seconds'
    | 's'
    | 'minutes'
    | 'm'
    | 'hours'
    | 'h'
    | 'days'
    | 'd'
    | 'weeks'
    | 'w'
    | 'months'
    | 'M'
    | 'years'
    | 'y';
export type DateKitInput = Date | number | string | IDateKit | null | undefined;

const MILLISECOND = 1;
const SECOND = 1000 * MILLISECOND;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK_START_DAY = 0; // Sunday

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_NAMES_MIN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const LOCALIZED_FORMAT_MAP: Record<string, string> = {
    L: 'MM/DD/YYYY',
    LL: 'MMMM D, YYYY',
    LLL: 'MMMM D, YYYY h:mm A',
    LLLL: 'dddd, MMMM D, YYYY h:mm A',
    l: 'M/D/YYYY',
    ll: 'MMM D, YYYY',
    lll: 'MMM D, YYYY h:mm A',
    llll: 'ddd, MMM D, YYYY h:mm A',
};

const UNIT_ALIASES: Record<string, DateKitCoreUnit> = {
    millisecond: 'millisecond',
    milliseconds: 'millisecond',
    ms: 'millisecond',
    second: 'second',
    seconds: 'second',
    s: 'second',
    minute: 'minute',
    minutes: 'minute',
    m: 'minute',
    hour: 'hour',
    hours: 'hour',
    h: 'hour',
    day: 'day',
    days: 'day',
    d: 'day',
    week: 'week',
    weeks: 'week',
    w: 'week',
    month: 'month',
    months: 'month',
    M: 'month',
    year: 'year',
    years: 'year',
    y: 'year',
};

interface IDateParts {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    millisecond: number;
    dayOfWeek: number;
}

export interface IDateKit {
    isValid(): boolean;
    format(template?: string): string;
    formatIntl(locale?: string | string[], options?: Intl.DateTimeFormatOptions): string;
    valueOf(): number;
    toDate(): Date;
    add(value: number, unit?: DateKitUnitType): IDateKit;
    subtract(value: number, unit?: DateKitUnitType): IDateKit;
    startOf(unit: DateKitUnitType): IDateKit;
    endOf(unit: DateKitUnitType): IDateKit;
    utc(): IDateKit;
    local(): IDateKit;
    weekday(): number;
    weekday(value: number): IDateKit;
    week(): number;
    week(value: number): IDateKit;
}

export type DateKit = IDateKit;
export type OpUnitType = DateKitUnitType;

class DateKitImpl implements IDateKit {
    constructor(private readonly _date: Date, private readonly _isUTC: boolean) {}

    isValid() {
        return !Number.isNaN(this._date.getTime());
    }

    format(template = 'YYYY-MM-DDTHH:mm:ssZ') {
        if (!this.isValid()) {
            return 'Invalid Date';
        }
        return formatDate(this._date, template, this._isUTC);
    }

    formatIntl(locale?: string | string[], options: Intl.DateTimeFormatOptions = {}) {
        if (!this.isValid()) {
            return 'Invalid Date';
        }
        if (typeof Intl === 'undefined' || typeof Intl.DateTimeFormat !== 'function') {
            return this.format();
        }

        const formatOptions = this._isUTC && !options.timeZone
            ? { ...options, timeZone: 'UTC' }
            : options;

        return new Intl.DateTimeFormat(locale, formatOptions).format(this._date);
    }

    valueOf() {
        return this._date.getTime();
    }

    toDate() {
        return new Date(this.valueOf());
    }

    private _clone() {
        return new DateKitImpl(this.toDate(), this._isUTC);
    }

    add(value: number, unit: DateKitUnitType = 'millisecond') {
        const normalizedUnit = normalizeUnit(unit);
        if (!this.isValid() || !normalizedUnit || !Number.isFinite(value)) {
            return this._clone();
        }
        return new DateKitImpl(addDate(this._date, value, normalizedUnit, this._isUTC), this._isUTC);
    }

    subtract(value: number, unit: DateKitUnitType = 'millisecond') {
        return this.add(-value, unit);
    }

    startOf(unit: DateKitUnitType) {
        const normalizedUnit = normalizeUnit(unit);
        if (!normalizedUnit || !this.isValid()) {
            return this._clone();
        }
        return new DateKitImpl(startOf(this._date, normalizedUnit, this._isUTC), this._isUTC);
    }

    endOf(unit: DateKitUnitType) {
        const normalizedUnit = normalizeUnit(unit);
        if (!normalizedUnit || !this.isValid()) {
            return this._clone();
        }
        if (normalizedUnit === 'millisecond') {
            return this._clone();
        }
        return this.startOf(normalizedUnit).add(1, normalizedUnit).subtract(1, 'millisecond');
    }

    utc() {
        return new DateKitImpl(this.toDate(), true);
    }

    local() {
        return new DateKitImpl(this.toDate(), false);
    }

    weekday(): number;
    weekday(value: number): IDateKit;
    weekday(value?: number): number | IDateKit {
        const day = getDateParts(this._date, this._isUTC).dayOfWeek;
        const current = (day - WEEK_START_DAY + 7) % 7;
        if (value === undefined) {
            return current;
        }
        return this.add(value - current, 'day');
    }

    week(): number;
    week(value: number): IDateKit;
    week(value?: number): number | IDateKit {
        const currentWeek = getWeekOfYear(this._date, this._isUTC);
        if (value === undefined) {
            return currentWeek;
        }
        return this.add((value - currentWeek) * 7, 'day');
    }
}

function pad(value: number, length = 2) {
    return String(Math.abs(value)).padStart(length, '0');
}

function getDateParts(date: Date, isUTC: boolean): IDateParts {
    return isUTC
        ? {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1,
            day: date.getUTCDate(),
            hour: date.getUTCHours(),
            minute: date.getUTCMinutes(),
            second: date.getUTCSeconds(),
            millisecond: date.getUTCMilliseconds(),
            dayOfWeek: date.getUTCDay(),
        }
        : {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            hour: date.getHours(),
            minute: date.getMinutes(),
            second: date.getSeconds(),
            millisecond: date.getMilliseconds(),
            dayOfWeek: date.getDay(),
        };
}

function toDate(input: DateKitInput, isUTC: boolean) {
    if (input instanceof DateKitImpl) {
        return input.toDate();
    }
    if (input === undefined) {
        return new Date();
    }
    if (input === null) {
        return new Date(Number.NaN);
    }
    if (input instanceof Date) {
        return new Date(input.getTime());
    }
    if (typeof input === 'number') {
        return new Date(input);
    }
    if (typeof input === 'string') {
        return parseDateString(input, isUTC);
    }
    return new Date(Number.NaN);
}

function createDateWithParts(year: number, month: number, day: number, hour: number, minute: number, second: number, millisecond: number, isUTC: boolean) {
    const parsed = isUTC
        ? new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond))
        : new Date(year, month - 1, day, hour, minute, second, millisecond);
    const parts = getDateParts(parsed, isUTC);
    if (
        parts.year !== year
        || parts.month !== month
        || parts.day !== day
        || parts.hour !== hour
        || parts.minute !== minute
        || parts.second !== second
    ) {
        return new Date(Number.NaN);
    }
    return parsed;
}

function parseDateString(input: string, isUTC: boolean) {
    const text = input.trim();
    if (!text) {
        return new Date(Number.NaN);
    }

    const cjkMatch = text.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日(?:\s+(\d{1,2})(?::(\d{1,2})(?::(\d{1,2}))?)?)?$/);
    if (cjkMatch) {
        const [, y, m, d, hh = '0', mm = '0', ss = '0'] = cjkMatch;
        return createDateWithParts(Number(y), Number(m), Number(d), Number(hh), Number(mm), Number(ss), 0, isUTC);
    }

    const standardMatch = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{1,2})(?::(\d{1,2})(?::(\d{1,2})(?:\.(\d{1,3}))?)?)?)?$/);
    if (standardMatch) {
        const [, y, m, d, hh = '0', mm = '0', ss = '0', mss = '0'] = standardMatch;
        return createDateWithParts(Number(y), Number(m), Number(d), Number(hh), Number(mm), Number(ss), Number(mss), isUTC);
    }

    if (/^-?\d+(\.\d+)?$/.test(text)) {
        return new Date(Number(text));
    }

    return new Date(text);
}

function normalizeUnit(unit: DateKitUnitType) {
    return UNIT_ALIASES[unit] ?? UNIT_ALIASES[String(unit).toLowerCase()];
}

function daysInMonth(year: number, month: number, isUTC: boolean) {
    return isUTC
        ? new Date(Date.UTC(year, month, 0)).getUTCDate()
        : new Date(year, month, 0).getDate();
}

function setDatePart(date: Date, isUTC: boolean, part: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond', value: number) {
    const next = new Date(date.getTime());
    if (isUTC) {
        switch (part) {
            case 'year':
                next.setUTCFullYear(value);
                break;
            case 'month':
                next.setUTCMonth(value);
                break;
            case 'day':
                next.setUTCDate(value);
                break;
            case 'hour':
                next.setUTCHours(value);
                break;
            case 'minute':
                next.setUTCMinutes(value);
                break;
            case 'second':
                next.setUTCSeconds(value);
                break;
            case 'millisecond':
                next.setUTCMilliseconds(value);
                break;
        }
        return next;
    }

    switch (part) {
        case 'year':
            next.setFullYear(value);
            break;
        case 'month':
            next.setMonth(value);
            break;
        case 'day':
            next.setDate(value);
            break;
        case 'hour':
            next.setHours(value);
            break;
        case 'minute':
            next.setMinutes(value);
            break;
        case 'second':
            next.setSeconds(value);
            break;
        case 'millisecond':
            next.setMilliseconds(value);
            break;
    }
    return next;
}

function addDate(date: Date, value: number, unit: DateKitCoreUnit, isUTC: boolean) {
    switch (unit) {
        case 'millisecond':
            return new Date(date.getTime() + value);
        case 'second':
            return new Date(date.getTime() + value * SECOND);
        case 'minute':
            return new Date(date.getTime() + value * MINUTE);
        case 'hour':
            return new Date(date.getTime() + value * HOUR);
        case 'day':
            return setDatePart(date, isUTC, 'day', (isUTC ? date.getUTCDate() : date.getDate()) + value);
        case 'week':
            return setDatePart(date, isUTC, 'day', (isUTC ? date.getUTCDate() : date.getDate()) + value * 7);
        case 'month': {
            const current = getDateParts(date, isUTC);
            const anchor = createDateWithParts(current.year, current.month, 1, current.hour, current.minute, current.second, current.millisecond, isUTC);
            const moved = setDatePart(anchor, isUTC, 'month', (isUTC ? anchor.getUTCMonth() : anchor.getMonth()) + value);
            const movedParts = getDateParts(moved, isUTC);
            const maxDay = daysInMonth(movedParts.year, movedParts.month, isUTC);
            return setDatePart(moved, isUTC, 'day', Math.min(current.day, maxDay));
        }
        case 'year':
            return addDate(date, value * 12, 'month', isUTC);
    }
}

function startOf(date: Date, unit: DateKitCoreUnit, isUTC: boolean) {
    const parts = getDateParts(date, isUTC);
    switch (unit) {
        case 'year':
            return createDateWithParts(parts.year, 1, 1, 0, 0, 0, 0, isUTC);
        case 'month':
            return createDateWithParts(parts.year, parts.month, 1, 0, 0, 0, 0, isUTC);
        case 'week': {
            const day = parts.dayOfWeek;
            const diff = (day - WEEK_START_DAY + 7) % 7;
            const anchor = createDateWithParts(parts.year, parts.month, parts.day, 0, 0, 0, 0, isUTC);
            return setDatePart(anchor, isUTC, 'day', (isUTC ? anchor.getUTCDate() : anchor.getDate()) - diff);
        }
        case 'day':
            return createDateWithParts(parts.year, parts.month, parts.day, 0, 0, 0, 0, isUTC);
        case 'hour':
            return createDateWithParts(parts.year, parts.month, parts.day, parts.hour, 0, 0, 0, isUTC);
        case 'minute':
            return createDateWithParts(parts.year, parts.month, parts.day, parts.hour, parts.minute, 0, 0, isUTC);
        case 'second':
            return createDateWithParts(parts.year, parts.month, parts.day, parts.hour, parts.minute, parts.second, 0, isUTC);
        case 'millisecond':
        default:
            return new Date(date.getTime());
    }
}

function getWeekOfYear(date: Date, isUTC: boolean) {
    const currentWeekStart = startOf(date, 'week', isUTC);
    const yearStart = startOf(date, 'year', isUTC);
    const firstWeekStart = startOf(yearStart, 'week', isUTC);
    return Math.floor((currentWeekStart.getTime() - firstWeekStart.getTime()) / DAY / 7) + 1;
}

function getTimezoneString(date: Date, isUTC: boolean, compact = false) {
    if (isUTC) {
        return compact ? '+0000' : '+00:00';
    }
    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const abs = Math.abs(offsetMinutes);
    const hours = pad(Math.floor(abs / 60), 2);
    const minutes = pad(abs % 60, 2);
    return compact ? `${sign}${hours}${minutes}` : `${sign}${hours}:${minutes}`;
}

function ordinal(value: number) {
    const v = value % 100;
    if (v >= 11 && v <= 13) {
        return `${value}th`;
    }
    switch (value % 10) {
        case 1:
            return `${value}st`;
        case 2:
            return `${value}nd`;
        case 3:
            return `${value}rd`;
        default:
            return `${value}th`;
    }
}

function replaceLocalizedTokens(template: string) {
    return template.replace(/LLLL|LLL|LL|L|llll|lll|ll|l/g, (token) => LOCALIZED_FORMAT_MAP[token] ?? token);
}

function formatDate(date: Date, template: string, isUTC: boolean) {
    const parts = getDateParts(date, isUTC);
    const hour12Raw = parts.hour % 12;
    const hour12 = hour12Raw === 0 ? 12 : hour12Raw;
    const quarter = Math.ceil(parts.month / 3);

    const tokenMap: Record<string, string> = {
        YYYY: String(parts.year),
        YY: pad(parts.year % 100, 2),
        MMMM: MONTH_NAMES[parts.month - 1],
        MMM: MONTH_NAMES_SHORT[parts.month - 1],
        MM: pad(parts.month, 2),
        M: String(parts.month),
        DD: pad(parts.day, 2),
        D: String(parts.day),
        Do: ordinal(parts.day),
        dddd: WEEKDAY_NAMES[parts.dayOfWeek],
        ddd: WEEKDAY_NAMES_SHORT[parts.dayOfWeek],
        dd: WEEKDAY_NAMES_MIN[parts.dayOfWeek],
        d: String(parts.dayOfWeek),
        HH: pad(parts.hour, 2),
        H: String(parts.hour),
        hh: pad(hour12, 2),
        h: String(hour12),
        mm: pad(parts.minute, 2),
        m: String(parts.minute),
        ss: pad(parts.second, 2),
        s: String(parts.second),
        SSS: pad(parts.millisecond, 3),
        A: parts.hour >= 12 ? 'PM' : 'AM',
        a: parts.hour >= 12 ? 'pm' : 'am',
        Q: String(quarter),
        Qo: ordinal(quarter),
        X: String(Math.floor(date.getTime() / 1000)),
        x: String(date.getTime()),
        Z: getTimezoneString(date, isUTC, false),
        ZZ: getTimezoneString(date, isUTC, true),
    };

    const escapedBlocks: string[] = [];
    const escaped = template.replace(/\[([^\]]+)]/g, (_, value: string) => {
        const index = escapedBlocks.push(value) - 1;
        return `\u0000${index}\u0000`;
    });

    const localizedExpanded = replaceLocalizedTokens(escaped);
    const replaced = localizedExpanded.replace(
        /YYYY|YY|MMMM|MMM|MM|M|DD|Do|D|dddd|ddd|dd|d|HH|H|hh|h|mm|m|ss|s|SSS|A|a|Qo|Q|X|x|ZZ|Z/g,
        (token) => tokenMap[token] ?? token
    );

    return replaced.replace(/\u0000(\d+)\u0000/g, (_, indexText: string) => escapedBlocks[Number(indexText)] ?? '');
}

interface IDateKitStatic {
    (input?: DateKitInput): IDateKit;
    utc: (input?: DateKitInput) => IDateKit;
    isDateKit: (value: unknown) => value is IDateKit;
    unix: (timestamp: number) => IDateKit;
}

function createDateKit(input?: DateKitInput) {
    return new DateKitImpl(toDate(input, false), false);
}

export const dateKit: IDateKitStatic = Object.assign(createDateKit, {
    utc: (input?: DateKitInput) => new DateKitImpl(toDate(input, true), true),
    isDateKit: (value: unknown): value is IDateKit => value instanceof DateKitImpl,
    unix: (timestamp: number) => createDateKit(timestamp * 1000),
});
