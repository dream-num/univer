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
import { getRegionalCurrencyFormat } from '../../services/region/currency-format';
import { getRegionalDatePattern, getRegionalTimePattern } from '../../services/region/date-format';
import { getRegionalNumberFormat } from '../../services/region/number-format';
import { getRegionParts } from '../../services/region/region-rules';
import { DateSystem } from '../../types/enum/date-system';
import { currencyInputCharacters, reCurrencySymbols } from './constants';
import { isValidNumberGrouping } from './grouping';
import { defaultLocale, getLocale } from './locale';
import { nativeDigitFormat, normalizeNativeDigits } from './native-digits';
import { getNativeCalendarFormat, getRegionalCalendarLocale, parseEastAsianDate, usesEnglishCalendarNames } from './regional-calendar';
import { excelDateTimePartsToSerial } from './serial-date';

// eslint-disable-next-line ts/naming-convention
export interface ParseOptions {
    locale?: string;
    region?: string;
    dateSystem?: DateSystem;
    uiLocale?: string;
    inputSource?: 'text-paste' | 'html-paste';
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
export function parseNumber(input: string, options: ParseOptions = {}): ParseData<number> | null {
    const l10n = getLocale(options.locale || '') || defaultLocale;
    const regional = options.region ? getRegionalNumberFormat(options.region) : undefined;
    const native = regional && /[^\p{ASCII}]/u.test(input) ? normalizeNativeDigits(input, options.region, options.uiLocale ?? options.locale) : undefined;
    const value = native?.value ?? input;
    const decimal = regional?.decimal ?? l10n.decimal;
    const regionalGroup = options.inputSource === 'html-paste' ? regional?.htmlGroup : regional?.group;
    const groupingChars = regionalGroup != null ? [regionalGroup] : [...(dec2group[decimal] || [AP, AG])];
    if (
        !regional && !groupingChars.includes(l10n.group) &&
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
    let plus = false;
    let openParen = false;
    let closeParen = false;
    let percent = false;
    let currency = false;
    let currencySymbol = '';
    let currencyTrailing = false;
    const regionalCurrency = options.region ? getRegionalCurrencyFormat(options.region) : undefined;
    let index = 0;

    const prefixChars = [SP, NS, NN, '+', '%', '(', '-'].concat(currencyInputCharacters);
    const localSymbol = regionalCurrency?.symbol;
    const localCurrencyAt = (offset: number) => localSymbol && value.startsWith(localSymbol, offset) ? localSymbol : undefined;
    while (prefixChars.includes(value.charAt(index)) || localCurrencyAt(index)) {
        const char = value.charAt(index);
        if (char === '-') {
            if (minus || openParen) {
                return null;
            }
            minus = true;
            sign = -1;
        } else if (localCurrencyAt(index) || reCurrencySymbols.test(char)) {
            if (currency) {
                return null;
            }
            currency = true;
            currencySymbol = localCurrencyAt(index) ?? char;
            index += currencySymbol.length - 1;
        } else if (char === '+') {
            // Excel treats "(+5)" as text: a parenthesis already carries the
            // sign, so it cannot be combined with an explicit one.
            if (openParen) {
                return null;
            }
            plus = true;
        } else if (char === '(') {
            if (openParen || minus || plus) {
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

    const integerStart = index;
    let integerEnd = -1;
    let haveDecimal = false;
    let grouping: string | undefined;
    if (value.charAt(index) === decimal || isDigit(value.charAt(index))) {
        while (index < value.length) {
            const char = value.charAt(index);
            if (char === regionalGroup && (haveDecimal || !isDigit(value[index + 1]))) break;
            if (!grouping && groupingChars.includes(char)) {
                grouping = char;
            } else if (grouping && grouping === char) {
                // Keep consuming the selected grouping separator.
            } else if (char === decimal) {
                if (haveDecimal) {
                    break;
                }
                integerEnd = index;
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

    if (regional && grouping) {
        const integer = value.slice(integerStart, integerEnd < 0 ? index : integerEnd);
        const secondary = options.inputSource === 'html-paste' ? 3 : regional.grouping[1];
        if (!isValidNumberGrouping(integer, grouping, secondary)) return null;
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

    const suffixChars = [SP, NS, NN, '%', '$', ')'].concat(currencyInputCharacters);
    while (suffixChars.includes(value.charAt(index)) || localCurrencyAt(index)) {
        const char = value.charAt(index);
        if (localCurrencyAt(index) || reCurrencySymbols.test(char)) {
            if (currency) {
                return null;
            }
            currency = true;
            currencySymbol = localCurrencyAt(index) ?? char;
            index += currencySymbol.length - 1;
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

    if (openParen && !closeParen) {
        return null;
    }

    let mantissa = number;
    let power = Number(exponent.slice(1)) - (percent ? 2 : 0);
    if (regional) {
        // Excel stores the first 15 significant input digits, including for decimal scripts.
        const [whole, fraction = ''] = number.split('.');
        const digits = whole + fraction;
        const significantStart = digits.search(/[1-9]/);
        const end = significantStart + 15;
        if (significantStart >= 0 && end < digits.length) {
            mantissa = digits.slice(significantStart, end);
            power += whole.length - end;
        }
    }
    // Apply percentage scaling in decimal before converting to a double.
    const parsed = Number(`${mantissa}e${power}`);
    if (!Number.isFinite(parsed) || (regional && parsed >= 1e308)) {
        return null;
    }

    const numberValue = regional && parsed < 2 ** -1022 ? 0 : parsed;
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
    } else if (currency) {
        const currencyFormat = number.includes('.') ? '#,##0.00' : '#,##0';
        if (regionalCurrency) {
            // Excel additionally recognizes the euro sign on either side, with General display.
            const symbolMatches = currencySymbol === regionalCurrency.symbol;
            if (!symbolMatches && currencySymbol !== '€') return null;
            if (symbolMatches && currencyTrailing === regionalCurrency.positive.endsWith('$')) {
                format = `$${currencyFormat}_);[Red]($${currencyFormat})`;
            }
        } else {
            format = currencyTrailing ? currencyFormat + currencySymbol : currencySymbol + currencyFormat;
        }
    } else if (grouping) {
        format = number.includes('.') ? '#,##0.00' : '#,##0';
    }

    if (native?.system && !exponent) {
        const fraction = number.split('.')[1];
        if (percent) format = '0.00%';
        if (grouping && fraction && !currency && !percent) {
            format = `#,##0.${'0'.repeat(Math.min(30, Math.max(3, fraction.length)))}`;
        }
        if (!format) {
            if (numberValue >= 1e11 || (numberValue > 0 && numberValue < 1e-9)) {
                const [, mantissaFraction = ''] = numberValue.toExponential(5).split('e')[0].split('.');
                const places = mantissaFraction.replace(/0+$/, '').length;
                const point = places || fraction === undefined ? '.' : '';
                format = `0${point}${'#'.repeat(places)}E${fraction === undefined ? '+' : '-'}00`;
            } else {
                const places = numberValue && Math.min(14, fraction?.length ?? 0);
                format = places ? `0.${'#'.repeat(places)}` : '0';
            }
        }
        format = nativeDigitFormat(native.system, native.locale, format);
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
    region?: string;
    dateSystem: DateSystem;
}

type DateLocaleLookups = Omit<IDateLocaleData, 'dateSystem' | 'locale' | 'region'>;

interface ICachedDateLocaleLookups {
    lookups: DateLocaleLookups;
    mmmm: string[];
    mmm: string[];
    dddd: string[];
    ddd: string[];
}

const dateLocaleLookupCache = new WeakMap<LocaleData, ICachedDateLocaleLookups>();

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
                const match = /^(0{1,2}|0?[1-9]|1\d|2\d|3[01])\b/.exec(string);
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
                const time = parseTime(string, localeData);
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
        const year = result?.year || 1916;
        const month = result?.month || 1;
        const day = result?.day ? +result.day : 1;
        const isDate1900SerialZero = localeData.dateSystem === DateSystem.Date1900 && year === 1900 && month === 1 && day === 0;
        if (result && (isDate1900SerialZero || isValidDate(year, month, day))) {
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

const tokensMatch = (values: string[], cachedValues: string[]): boolean =>
    values.length === cachedValues.length && values.every((value, index) => value === cachedValues[index]);

const getDateLocaleLookups = (locale: LocaleData): DateLocaleLookups => {
    let cached = dateLocaleLookupCache.get(locale);
    if (
        !cached ||
        !tokensMatch(locale.mmmm, cached.mmmm) ||
        !tokensMatch(locale.mmm, cached.mmm) ||
        !tokensMatch(locale.dddd, cached.dddd) ||
        !tokensMatch(locale.ddd, cached.ddd)
    ) {
        cached = {
            lookups: {
                mon: getLookups(locale.mmmm, 'F').concat(getLookups(locale.mmm, 'M')),
                mp: locale.mmm[0].endsWith('.'),
                day: getLookups(locale.dddd, 'l').concat(getLookups(locale.ddd, 'D')),
                dp: locale.ddd[0].endsWith('.'),
            },
            mmmm: [...locale.mmmm],
            mmm: [...locale.mmm],
            dddd: [...locale.dddd],
            ddd: [...locale.ddd],
        };
        dateLocaleLookupCache.set(locale, cached);
    }
    return cached.lookups;
};

const regionalMonthCache = new WeakMap<LocaleData, LocaleLookup[]>();

function getRegionalMonthLookups(locale: LocaleData, language?: string): LocaleLookup[] {
    const cached = regionalMonthCache.get(locale);
    if (cached) return cached;
    const months = getDateLocaleLookups(locale).mon;
    const prefixes = new Map<string, number>();
    for (const [name, month] of months) {
        for (let end = 3; end < name.length; end++) {
            const prefix = name.slice(0, end);
            const previous = prefixes.get(prefix);
            prefixes.set(prefix, previous === undefined || previous === month ? month : 0);
        }
    }
    if (language === 'fr') {
        prefixes.set('jun', 6);
        prefixes.set('jul', 7);
    }
    const lookups = [...months];
    for (const [prefix, month] of prefixes) {
        if (month) lookups.push([prefix, month, 'M']);
    }
    lookups.sort((a, b) => b[0].length - a[0].length);
    regionalMonthCache.set(locale, lookups);
    return lookups;
}

function parseRegionalDateFields(parts: RegExpExecArray, pattern: string): IDateParseState | undefined {
    const [, left, sep, middle, right] = parts;
    if (sep === '.' && !pattern.includes('.')) return undefined;
    const first = Number(left);
    const second = Number(middle);
    const date = (yearText: string, month: number, day: number, path: string) => {
        let year = Number(yearText);
        if (yearText.length <= 2) year += year < 30 ? 2000 : 1900;
        if (!isValidDate(year, month, day)) return undefined;
        return { year, month, day: String(day), _mon: String(month), sep, path };
    };
    if (right !== undefined) {
        if (left.length === 4 || pattern.startsWith('y')) return date(left, second, Number(right), 'm/d/yy');
        return pattern.startsWith('m') ? date(right, first, second, 'm/d/yy') : date(right, second, first, 'm/d/yy');
    }

    const currentYear = String(new Date().getUTCFullYear());
    // A year-first region tries month/day, then day/month, before interpreting year/month.
    if (pattern.startsWith('y')) {
        return date(currentYear, first, second, 'd-mmm') ?? date(currentYear, second, first, 'd-mmm')
            ?? (first > 0 ? date(left, second, 1, 'mmm-yy') : undefined);
    }
    const dayFirst = pattern.startsWith('d');
    const monthDay = dayFirst ? date(currentYear, second, first, 'd-mmm') : date(currentYear, first, second, 'd-mmm');
    return monthDay ?? (dayFirst && second === 0 ? undefined : date(middle, first, 1, 'mmm-yy'));
}

/** Parse a date or datetime string and return its serial value and format. */
export function parseDate(value: string, options: ParseOptions = {}): ParseData<number> | null {
    const region = options.region;
    const locale = options.uiLocale ?? options.locale;
    const l10n = region ? getRegionalCalendarLocale(region, locale) : getLocale(options.locale || '') || defaultLocale;
    const localeData: IDateLocaleData = {
        ...getDateLocaleLookups(l10n),
        locale,
        region,
        dateSystem: options.dateSystem ?? DateSystem.Date1900,
    };
    const language = region && getRegionParts(region)?.language;
    if (region) localeData.mon = getRegionalMonthLookups(l10n, language);
    const shortDate = region ? getRegionalDatePattern(region, locale) : undefined;
    const monthFirst = shortDate ? shortDate.startsWith('m') : l10n.preferMDY;
    const native = region ? normalizeNativeDigits(value, region, locale) : { value, system: 0 };
    const text = normDateStr(native.value);
    const fields = shortDate && /^(\d{1,4})([./-])(\d{1,4})(?:\2(\d{1,4}))?(?: (.+))?$/.exec(text);
    const spaced = shortDate?.includes('.') && /^(\d{4})\. (\d{1,2})\. (\d{1,2})\.?$/.exec(native.value.trim());
    const eastern = region && parseEastAsianDate(text, region, locale);
    let date: IDateParseState | undefined;
    let englishCalendar = false;
    if (eastern) {
        date = { ...eastern, day: String(eastern.day), _mon: String(eastern.month) };
    } else if (fields && shortDate) {
        date = parseRegionalDateFields(fields, shortDate);
        if (date && fields[5]) {
            if (getRegionalTimePattern(region!).includes(' ')) return null;
            const clock = shortDate.includes('.') ? fields[5].replace(/(:\d{1,2}:\d{1,2})\.\d+$/, '$1') : fields[5];
            const time = parseTime(clock, options);
            if (!time) return null;
            date.time = time.v;
            date.tf = time.z;
        }
    } else if (spaced && shortDate === 'yyyy.mm.dd') {
        date = { year: +spaced[1], month: +spaced[2], _mon: spaced[2], day: spaced[3], path: 'm/d/yy' };
    } else {
        if (region && (/^\d{4}\.\s/.test(text) || /年|년/.test(text))) return null;
        const trie = monthFirst ? dateTrieMD : dateTrieDM;
        date = nextToken(text, trie, { path: '' }, localeData);
        if (!date && region && usesEnglishCalendarNames(region)) {
            date = nextToken(text, trie, { path: '' }, { ...localeData, ...getDateLocaleLookups(defaultLocale) });
            englishCalendar = !!date;
        }
    }
    if (!date) {
        return null;
    }
    if (options.region && date.sep === ' ' && /^[\d ]+$/.test(value.trim()) && getRegionalTimePattern(options.region).includes(' ')) {
        return null;
    }
    if (date.sep === '.' && (shortDate ? !shortDate.includes('.') : date.path.length === 3)) {
        return null;
    }
    if (date.month == null || date._mon == null) {
        return null;
    }

    const year = +(date.year ?? new Date().getUTCFullYear());
    const day = date.day ?? '1';
    const dateSystem = options.dateSystem ?? DateSystem.Date1900;
    const dateSerial = excelDateTimePartsToSerial({
        year,
        month: date.month,
        day: +day,
        hours: 0,
        minutes: 0,
        seconds: 0,
        fractionalSecond: 0,
    }, { dateSystem });
    if (dateSerial == null) {
        return null;
    }
    const dateValue = dateSerial + (date.time || 0);
    const maxDateSerial = excelDateTimePartsToSerial({
        year: 9999,
        month: 12,
        day: 31,
        hours: 0,
        minutes: 0,
        seconds: 0,
        fractionalSecond: 0,
    }, { dateSystem })!;
    if (dateValue >= maxDateSerial + 1) {
        return null;
    }

    if (region && shortDate) {
        let pattern = date.path;
        if (date.time !== undefined) {
            if (!date.tf || date.tf === '[h]:mm:ss') return { v: dateValue };
            pattern = date.tf === 'mm:ss.0' ? date.tf : 'm/d/yy h:mm';
        } else if (!fields && !spaced && !eastern) {
            if (/[FM]/.test(pattern)) {
                if (/^[FM]/.test(pattern) && date.day && date.year !== undefined) {
                    const eastAsianEdition = l10n === defaultLocale && (language === 'ja' || language === 'ko' || language === 'zh');
                    const acceptsMonthFirst = monthFirst || eastAsianEdition || language === 'hu' || language === 'fa' || language === 'vi';
                    if (!acceptsMonthFirst || !text.includes(',')) return null;
                }
                // The regional date separator also delimits abbreviated month names (e.g. Russian).
                if (text.includes('. ') && !shortDate.includes('.')) return null;
                if (date.year === undefined) pattern = 'd-mmm';
                else pattern = date.day ? 'd-mmm-yy' : 'mmm-yy';
            } else {
                return null;
            }
        }
        if (native.system) {
            const z = getNativeCalendarFormat(pattern, region, native.system, shortDate);
            return z ? { v: dateValue, z } : { v: dateValue };
        }
        if (englishCalendar) pattern = `B1${language === 'he' ? pattern.replace(/-/g, '/') : pattern}`;
        return { v: dateValue, z: pattern };
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

function parseRegionalTime(value: string, region: string, locale?: string): ParseData<number> | null {
    const native = normalizeNativeDigits(value.trim(), region, locale);
    const clockSeparator = getRegionalTimePattern(region).match(/[:. ]/)![0];
    const { decimal } = getRegionalNumberFormat(region);
    const [am, pm] = getRegionalCalendarLocale(region, locale).ampm;
    const meridiem = /\s+([^\d:.,\s][^\d:]*?)$/u.exec(native.value);
    const suffix = meridiem ? meridiem[1].toLowerCase().replace(/\s/g, ' ') : '';
    const afternoon = suffix && [pm.toLowerCase().replace(/\s/g, ' '), 'p', 'pm'].includes(suffix);
    if (suffix && (clockSeparator === ' ' || (!afternoon && ![am.toLowerCase().replace(/\s/g, ' '), 'a', 'am'].includes(suffix)))) return null;

    const source = meridiem ? native.value.slice(0, meridiem.index) : native.value;
    const [clock, fraction, extra] = clockSeparator === decimal ? [source] : source.split(decimal);
    if (extra !== undefined || (fraction !== undefined && !/^\d+$/.test(fraction))) return null;
    if (fraction !== undefined && getRegionalDatePattern(region, locale).includes(decimal)) return null;
    // Both the fixed colon and the region's clock punctuation identify clock fields.
    const normalized = clockSeparator === ':' ? clock : clock.split(clockSeparator).map((part) => part.trim()).join(':');
    const fields = normalized.split(':');
    if (fields.length > 1 && fields[fields.length - 1] === '') fields.pop();
    if ((!suffix && !normalized.includes(':')) || fields.length > 3 || !fields.every((part) => /^\d{1,4}$/.test(part))) return null;
    if (fraction !== undefined && fields.length < 2) return null;
    const hasSeconds = fields.length === 3;
    if (fraction !== undefined && !hasSeconds) fields.unshift('0');
    let [hour, minute = 0, second = 0] = fields.map(Number);
    const overflows = Number(hour >= 24) + Number(minute >= 60) + Number(second >= 60);
    if (overflows > 1 || fields.some((part) => part.length > 2 && part[0] === '0')) return null;
    if (suffix) {
        if (hour > 12) return null;
        hour = hour % 12 + (afternoon ? 12 : 0);
    }
    // Excel stores time literals to the nearest millisecond, even when more digits are entered.
    const milliseconds = fraction === undefined ? 0 : Math.round(Number(`0.${fraction}`) * 1000);
    const v = ((hour * 60 + minute) * 60 + second + milliseconds / 1000) / 86400;
    if (fraction === undefined && (minute >= 60 || second >= 60)) return { v };
    let z: string;
    if (fraction !== undefined) z = 'mm:ss.0';
    else if (hour >= 24) z = '[h]:mm:ss';
    else z = `h:mm${hasSeconds ? ':ss' : ''}${suffix ? ' AM/PM' : ''}`;
    if (native.system) {
        if (fraction !== undefined && decimal === '٫') return { v };
        const pattern = getNativeCalendarFormat(z, region, native.system, '');
        return pattern ? { v, z: pattern } : { v };
    }
    return { v, z };
}

/** Parse a time string and return its day fraction and inferred format. */
// eslint-disable-next-line complexity
export function parseTime(value: string, options: ParseOptions = {}): ParseData<number> | null {
    if (options.region) {
        return parseRegionalTime(value, options.region, options.uiLocale ?? options.locale);
    }
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
