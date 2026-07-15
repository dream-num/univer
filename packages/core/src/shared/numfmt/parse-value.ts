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

import type { LocaleData, ParseData } from './types';
import { currencySymbols, reCurrencySymbols } from './constants';
import { defaultLocale, getLocale } from './locale';

// eslint-disable-next-line ts/naming-convention
export interface ParseOptions {
    locale?: string;
}

/*
 * This is the list of allowed date formats. Legend:
 *
 * - `-`: any date separator
 * - `j`/`d`: day without/with a leading zero
 * - `D`/`l`: abbreviated/full day name
 * - `n`/`m`: month without/with a leading zero
 * - `M`/`F`: abbreviated/full month name
 * - `y`/`Y`: two-/four-digit year
 * - `x`: time of day
 * - `!`/`?`: date-first/month-first locales only
 */
const okDateFormats = [
    // day-month-year
    '!d-m-y',
    '!d-m-Y',
    '!j-m-y',
    '!j-m-Y',
    '!d-n-y',
    '!d-n-Y',
    '!j-n-y',
    '!j-n-Y',
    // month-day-year
    '?m-d-y',
    '?m-d-Y',
    '?m-j-y',
    '?m-j-Y',
    '?n-d-y',
    '?n-d-Y',
    '?n-j-y',
    '?n-j-Y',
    // unabbreviated
    'd-M-y',
    'd-M-Y',
    'j-M-y',
    'j-M-Y',
    'M-d-y',
    'M-d-Y',
    'M-j-y',
    'M-j-Y',
    'd-F-y',
    'd-F-Y',
    'F-d-y',
    'F-d-Y',
    'F-j-y',
    'F-j-Y',
    'j-F-y',
    'j-F-Y',
    'y-F-d',
    'y-F-j',
    'y-M-d',
    'y-M-j',
    'Y-F-d',
    'Y-F-j',
    'Y-M-d',
    'Y-m-d',
    'Y-M-j',
    'Y-m-j',
    'Y-n-d',
    'Y-n-j',
    'j-F',
    'j-M',
    'd-F',
    'd-M',
    'n-d',
    'n-j',
    'n-Y',
    'm-d',
    'm-j',
    'm-Y',
    'M-Y',
    'M-y',
    'F-y',
    'F-Y',
    'Y-M',
    'Y-n',
    'Y-m',
    'Y-F',
    'Y-M',
];

const tx0: Record<string, string> = {
    j: 'd',
    d: 'd',
    D: 'ddd',
    l: 'dddd',
    n: 'm',
    m: 'm',
    M: 'mmm',
    F: 'mmmm',
    y: 'yy',
    Y: 'yyyy',
};
const tx00: Record<string, string> = {
    j: 'dd',
    d: 'dd',
    D: 'ddd',
    l: 'dddd',
    n: 'mm',
    m: 'mm',
    M: 'mmm',
    F: 'mmmm',
    y: 'yy',
    Y: 'yyyy',
};

interface IDateTrie {
    [token: string]: IDateTrie | number | undefined;
}

const dateTrieDM: IDateTrie = {};
const dateTrieMD: IDateTrie = {};

function packDate(format: string, node: IDateTrie, allowType: number = 1): void {
    if (format) {
        const char = format[0];
        const next = format.slice(1);
        if (char === '!') {
            packDate(next, node, 4);
        } else if (char === '?') {
            packDate(next, node, 2);
        } else {
            let branch = node[char];
            if (typeof branch !== 'object') {
                branch = {};
                node[char] = branch;
            }
            packDate(next, branch, allowType);
        }
    } else {
        node.$ = allowType;
    }
}

function addFormatToTrie(format: string, trie: IDateTrie): void {
    packDate(format, trie);
    packDate(`${format} x`, trie);
    packDate(`${format} l`, trie);
    packDate(`${format} l x`, trie);
    packDate(`l ${format}`, trie);
    packDate(`l ${format} x`, trie);
    packDate(`${format} D`, trie);
    packDate(`${format} D x`, trie);
    packDate(`D ${format}`, trie);
    packDate(`D ${format} x`, trie);
}

okDateFormats.forEach((format) => {
    if (!format.startsWith('?')) {
        addFormatToTrie(format, dateTrieDM);
    }
    if (!format.startsWith('!')) {
        addFormatToTrie(format, dateTrieMD);
    }
});

const currentYear = new Date().getUTCFullYear();

const PT = '.';
const CM = ',';
const SP = ' ';
const NS = ' ';
const NN = ' ';
const AP = "'";
const AG = '٬';
const dec2group: Record<string, string[]> = {
    '.': [CM, NS, NN, AP, AG],
    ',': [PT, NS, NN, AP, AG],
    '٫': [PT, NS, NN, AP, AG],
};

const isDigit = (digit: string | undefined): boolean =>
    digit?.length === 1 && digit >= '0' && digit <= '9';

/** Parse a numeric string and return its value and inferred format. */
// eslint-disable-next-line max-lines-per-function, complexity
export function parseNumber(value: string, options: ParseOptions = {}): ParseData<number> | null {
    const l10n = getLocale(options.locale || '') || defaultLocale;
    const decimal = l10n.decimal;
    const groupingChars = [...(dec2group[decimal] || [AP, AG])];
    if (
        !groupingChars.includes(l10n.group) &&
        l10n.group !== SP &&
        l10n.group !== decimal
    ) {
        groupingChars.push(l10n.group);
    }

    let number = '';
    let exponent = '';
    let sign = 1;
    let format = '';
    let minus = false;
    let openParen = false;
    let closeParen = false;
    let percent = false;
    let currency = false;
    let currencySymbol = '';
    let currencyTrailing = false;
    let index = 0;

    const prefixChars = [SP, NS, NN, '+', '%', '(', '-'].concat(currencySymbols);
    while (prefixChars.includes(value.charAt(index))) {
        const char = value.charAt(index);
        if (char === '-') {
            if (minus || openParen) {
                return null;
            }
            minus = true;
            sign = -1;
        } else if (reCurrencySymbols.test(char)) {
            if (currency) {
                return null;
            }
            currency = true;
            currencySymbol = char;
        } else if (char === '(') {
            if (openParen || minus) {
                return null;
            }
            openParen = true;
            sign = -1;
        } else if (char === '%') {
            if (percent) {
                return null;
            }
            percent = true;
        }
        index++;
    }

    let haveDecimal = false;
    let grouping: string | undefined;
    if (value.charAt(index) === decimal || isDigit(value.charAt(index))) {
        while (index < value.length) {
            const char = value.charAt(index);
            if (!grouping && groupingChars.includes(char)) {
                grouping = char;
            } else if (grouping && grouping === char) {
                // Keep consuming the selected grouping separator.
            } else if (char === decimal) {
                if (haveDecimal) {
                    break;
                }
                number += '.';
                haveDecimal = true;
            } else if (isDigit(char)) {
                number += char;
            } else {
                break;
            }
            index++;
        }
    }

    if (value.charAt(index) === 'e' || value.charAt(index) === 'E') {
        exponent += value.charAt(index);
        index++;
        if (value.charAt(index) === '+' || value.charAt(index) === '-') {
            exponent += value.charAt(index);
            index++;
        }
        const exponentStart = index;
        while (isDigit(value.charAt(index))) {
            exponent += value.charAt(index);
            index++;
        }
        if (exponentStart === index) {
            return null;
        }
    }

    const suffixChars = [SP, NS, NN, '%', '$', ')'].concat(currencySymbols);
    while (suffixChars.includes(value.charAt(index))) {
        const char = value.charAt(index);
        if (reCurrencySymbols.test(char)) {
            if (currency) {
                return null;
            }
            currency = true;
            currencySymbol = char;
            currencyTrailing = true;
        } else if (char === ')') {
            if (closeParen || !openParen) {
                return null;
            }
            closeParen = true;
        } else if (char === '%') {
            if (percent) {
                return null;
            }
            percent = true;
        }
        index++;
    }

    if (index !== value.length) {
        return null;
    }

    let numberValue = Number.parseFloat(number + exponent);
    if (!Number.isFinite(numberValue)) {
        return null;
    }

    if (exponent) {
        if (percent || currency) {
            return null;
        }
        format = '0.00E+00';
    } else if (percent) {
        if (currency) {
            return null;
        }
        format = number.includes('.') ? '0.00%' : '0%';
        numberValue *= 0.01;
    } else if (currency) {
        const currencyFormat = number.includes('.') ? '#,##0.00' : '#,##0';
        format = currencyTrailing
            ? currencyFormat + currencySymbol
            : currencySymbol + currencyFormat;
    } else if (grouping) {
        format = number.includes('.') ? '#,##0.00' : '#,##0';
    }

    const result: ParseData<number> = { v: numberValue * sign };
    if (format) {
        result.z = format;
    }
    return result;
}

// eslint-disable-next-line complexity
export function isValidDate(year: number, month: number, day: number): boolean {
    if (day < 1) {
        return false;
    }
    if (month < 1 || month > 12) {
        return false;
    }
    if (month === 2) {
        const isLeapYear = (
            ((year % 4 === 0) && (year % 100 !== 0)) ||
            (year % 400 === 0)
        );
        const februaryDays = isLeapYear || year === 1900 ? 29 : 28;
        if (day > februaryDays) {
            return false;
        }
    } else if (
        ((month === 4 || month === 6 || month === 9 || month === 11) && day > 30) ||
        (
            (month === 1 || month === 3 || month === 5 || month === 7 || month === 8 || month === 10 || month === 12) &&
            day > 31
        )
    ) {
        return false;
    }
    return true;
}

type LookupSymbol = 'F' | 'M' | 'l' | 'D';
type LocaleLookup = [text: string, value: number, symbol: LookupSymbol];

interface IDateLocaleData {
    mon: LocaleLookup[];
    mp: boolean;
    day: LocaleLookup[];
    dp: boolean;
    locale?: string;
}

interface IDateParseState {
    path: string;
    sep?: string;
    day?: string;
    month?: number;
    _mon?: string;
    year?: number;
    time?: number;
    tf?: string;
}

const matchRec = (
    string: string,
    data: LocaleLookup[],
    skipPeriod: boolean = false
): [string, LocaleLookup | null] => {
    for (const item of data) {
        if (string.startsWith(item[0])) {
            let length = item[0].length;
            if (
                skipPeriod &&
                (item[2] === 'D' || item[2] === 'M') &&
                string[length] === '.'
            ) {
                length++;
            }
            return [string.slice(0, length), item];
        }
    }
    return ['', null];
};

/* eslint-disable max-lines-per-function, complexity */
const nextToken = (
    string: string,
    node: IDateTrie,
    data: IDateParseState,
    localeData: IDateLocaleData
): IDateParseState | undefined => {
    const path = data.path || '';
    const matchOrder = Object.keys(node);
    for (const token of matchOrder) {
        const branch = node[token];
        let result: IDateParseState | undefined;
        if (!branch) {
            continue;
        }
        if (token === '$' || token === '€') {
            if (!string) {
                result = data;
            }
        } else {
            if (typeof branch !== 'object') {
                continue;
            }
            if (token === '-') {
                const match = /^(\s*([./-]|,\s)\s*|\s+)/.exec(string);
                if (match) {
                    const separator = (
                        match[1] === '-' || match[1] === '/' || match[1] === '.'
                    )
                        ? match[1]
                        : ' ';
                    if (!data.sep || data.sep === separator) {
                        const normalizedSeparator = match[0].replace(/\s+/g, ' ');
                        result = nextToken(
                            string.slice(match[0].length),
                            branch,
                            { ...data, sep: separator, path: path + normalizedSeparator },
                            localeData
                        );
                    }
                }
            } else if (token === ' ') {
                const match = /^[,.]?\s+/.exec(string);
                if (match) {
                    const normalizedSeparator = match[0].replace(/\s+/g, ' ');
                    result = nextToken(
                        string.slice(match[0].length),
                        branch,
                        { ...data, path: path + normalizedSeparator },
                        localeData
                    );
                }
            } else if (token === 'j' || token === 'd') {
                const match = /^(0?[1-9]|1\d|2\d|3[01])\b/.exec(string);
                if (match) {
                    result = nextToken(
                        string.slice(match[0].length),
                        branch,
                        { ...data, day: match[0], path: path + token },
                        localeData
                    );
                }
            } else if (token === 'n' || token === 'm') {
                const match = /^(0?[1-9]|1[012])\b/.exec(string);
                if (match) {
                    result = nextToken(
                        string.slice(match[0].length),
                        branch,
                        { ...data, month: +match[0], _mon: match[0], path: path + token },
                        localeData
                    );
                }
            } else if (token === 'F' || token === 'M') {
                const [matchedText, match] = matchRec(string, localeData.mon, localeData.mp);
                if (match?.[2] === token) {
                    result = nextToken(
                        string.slice(matchedText.length),
                        branch,
                        { ...data, month: match[1], _mon: matchedText, path: path + token },
                        localeData
                    );
                }
            } else if (token === 'l' || token === 'D') {
                const [matchedText, match] = matchRec(string, localeData.day, localeData.dp);
                if (match?.[2] === token) {
                    result = nextToken(
                        string.slice(matchedText.length),
                        branch,
                        { ...data, path: path + token },
                        localeData
                    );
                }
            } else if (token === 'y') {
                const match = /^\d\d\b/.exec(string);
                if (match) {
                    const year = +match[0] >= 30 ? +match[0] + 1900 : +match[0] + 2000;
                    result = nextToken(
                        string.slice(match[0].length),
                        branch,
                        { ...data, year, path: path + token },
                        localeData
                    );
                }
            } else if (token === 'Y') {
                const match = /^\d\d\d\d\b/.exec(string);
                if (match) {
                    result = nextToken(
                        string.slice(match[0].length),
                        branch,
                        { ...data, year: +match[0], path: path + token },
                        localeData
                    );
                }
            } else if (token === 'x') {
                const time = parseTime(string, { locale: localeData.locale });
                if (time) {
                    result = nextToken(
                        '',
                        branch,
                        { ...data, time: time.v, tf: time.z, path: path + token },
                        localeData
                    );
                }
            } else {
                throw new Error(`Unknown date token "${token}"`);
            }
        }
        if (
            result &&
            isValidDate(data.year || 1916, data.month || 1, data.day ? +data.day : 1)
        ) {
            return result;
        }
    }
};
/* eslint-enable max-lines-per-function, complexity */

const normDateStr = (string: string): string =>
    string
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/’/, "'")
        .replace(/\.$/, '')
        .toLowerCase();

const getLookups = (values: string[], symbol: LookupSymbol): LocaleLookup[] => {
    const lookups: LocaleLookup[] = values.map((value, index) => [
        normDateStr(value),
        index + 1,
        symbol,
    ]);
    lookups.sort((a, b) => b[0].length - a[0].length);
    return lookups;
};

/** Parse a date or datetime string and return its serial value and format. */
// eslint-disable-next-line complexity
export function parseDate(value: string, options: ParseOptions = {}): ParseData<number> | null {
    const l10n = getLocale(options.locale || '') || defaultLocale;
    const localeData: IDateLocaleData = {
        mon: getLookups(l10n.mmmm, 'F').concat(getLookups(l10n.mmm, 'M')),
        mp: l10n.mmm[0].at(-1) === '.',
        day: getLookups(l10n.dddd, 'l').concat(getLookups(l10n.ddd, 'D')),
        dp: l10n.ddd[0].at(-1) === '.',
        locale: options.locale,
    };
    const date = nextToken(
        normDateStr(value),
        l10n.preferMDY ? dateTrieMD : dateTrieDM,
        { path: '' },
        localeData
    );
    if (!date) {
        return null;
    }
    if (date.sep === '.' && date.path.length === 3) {
        return null;
    }
    if (date.month == null || date._mon == null) {
        return null;
    }

    const year = +(date.year ?? currentYear);
    const day = date.day ?? '1';
    let epoch = -Infinity;
    if (year < 1900) {
        return null;
    } else if (year <= 1900 && date.month <= 2) {
        epoch = 25568;
    } else if (year < 10000) {
        epoch = 25569;
    }
    const dateValue = (
        Date.UTC(year, date.month - 1, +day) / 864e5
    ) + epoch + (date.time || 0);
    if (dateValue < 0 || dateValue > 2958465) {
        return null;
    }

    const lead0 = (
        date._mon[0] === '0' ||
        day[0] === '0' ||
        (date._mon.length === 2 && day.length === 2)
    );
    const format = date.path.replace(/[jdlDnmMFyYx]/g, (token) => {
        if (token === 'x') {
            return date.tf || '';
        }
        return (lead0 ? tx00[token] : tx0[token]) || token;
    });
    return { v: dateValue, z: format };
}

const normAMPMStr = (string: string): string =>
    string.replace(/\s+/g, '').trim().replace(/\./g, '').toLowerCase();

/** Parse a time string and return its day fraction and inferred format. */
// eslint-disable-next-line complexity
export function parseTime(value: string, options: ParseOptions = {}): ParseData<number> | null {
    const l10n = getLocale(options.locale || '') || defaultLocale;
    const parts = /^\s*([10]?\d|2[0-4])(?::([0-5]\d|\d))?(?::([0-5]\d|\d))?(\.\d{1,10})?(?=\s*[^\s\d]|$)/.exec(value);
    let ampm = '';
    if (parts) {
        const tail = normAMPMStr(value.slice(parts[0].length));
        if (tail === normAMPMStr(l10n.ampm[0]) || tail === 'a' || tail === 'am') {
            ampm = 'a';
        } else if (tail === normAMPMStr(l10n.ampm[1]) || tail === 'p' || tail === 'pm') {
            ampm = 'p';
        } else if (tail === ':') {
            if (!parts[3]) {
                parts[3] = '0';
            }
            if (!parts[2]) {
                parts[2] = '0';
            }
        } else if (tail) {
            return null;
        }
    }
    if (!parts) {
        return null;
    }

    const [, hoursPart, minutesPart, secondsPart, fractionPart] = parts;
    if (fractionPart && !secondsPart) {
        return null;
    }
    if (!ampm && !minutesPart && !secondsPart) {
        return null;
    }

    let hours = +(hoursPart || 0);
    if (ampm) {
        if (hours >= 13) {
            return null;
        }
        if (ampm === 'a') {
            if (hours === 12) {
                hours = 0;
            }
        } else if (ampm === 'p' && hours !== 12) {
            hours += 12;
        }
    }
    const minutes = +(minutesPart || 0);
    const seconds = +(secondsPart || 0);
    const milliseconds = +(fractionPart || 0);

    const hourFormat = hoursPart.length === 2 ? 'hh' : 'h';
    const secondsFormat = secondsPart ? ':ss' : '';
    const ampmFormat = ampm ? ' AM/PM' : '';
    return {
        v: ((hours * 60 * 60) + (minutes * 60) + seconds + milliseconds) / (60 * 60 * 24),
        z: `${hourFormat}:mm${secondsFormat}${ampmFormat}`,
    };
}

/** Parse a localized or English boolean string. */
export function parseBool(value: string, options: ParseOptions = {}): ParseData<boolean> | null {
    const l10n: LocaleData = getLocale(options.locale || '') || defaultLocale;
    const normalizedValue = value.trim().toLowerCase();
    const localizedTrue = l10n.bool[0].toLowerCase();
    if (normalizedValue === 'true' || normalizedValue === localizedTrue) {
        return { v: true };
    }
    const localizedFalse = l10n.bool[1].toLowerCase();
    if (normalizedValue === 'false' || normalizedValue === localizedFalse) {
        return { v: false };
    }
    return null;
}

/** Parse a spreadsheet input as a number, date, time, or boolean. */
export function parseValue(value: string, options?: ParseOptions): ParseData | null {
    return (
        parseNumber(value, options) ??
        parseDate(value, options) ??
        parseTime(value, options) ??
        parseBool(value, options)
    );
}
