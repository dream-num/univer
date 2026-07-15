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

import type {
    FormatColor,
    FormatDateInfo,
    FormatInfo,
    FormatOptions,
    ParsedPattern,
    ResolvedFormatOptions,
} from './types';
import {
    TOKEN_AMPM,
    TOKEN_BREAK,
    TOKEN_CALENDAR,
    TOKEN_CHAR,
    TOKEN_COLOR,
    TOKEN_COMMA,
    TOKEN_CONDITION,
    TOKEN_DATETIME,
    TOKEN_DBNUM,
    TOKEN_DIGIT,
    TOKEN_DURATION,
    TOKEN_ERROR,
    TOKEN_ESCAPED,
    TOKEN_EXP,
    TOKEN_FILL,
    TOKEN_GENERAL,
    TOKEN_GROUP,
    TOKEN_HASH,
    TOKEN_LOCALE,
    TOKEN_MINUS,
    TOKEN_MODIFIER,
    TOKEN_NATNUM,
    TOKEN_PAREN,
    TOKEN_PERCENT,
    TOKEN_PLUS,
    TOKEN_POINT,
    TOKEN_QMARK,
    TOKEN_SCALE,
    TOKEN_SKIP,
    TOKEN_SLASH,
    TOKEN_SPACE,
    TOKEN_STRING,
    TOKEN_TEXT,
    TOKEN_ZERO,
} from './constants';
import { dateInfo, info, isDate, isPercent, isText } from './format-info';
import { formatValue, formatColor as formatValueColor } from './format-number';
import { defaultOptions } from './options';
import { parsePattern } from './parse-pattern';
import { dateToSerial as handleDates } from './serial-date';

export { dec2frac } from './dec-to-frac';
export { addLocale, getLocale, parseLocale } from './locale';
export { parseBool, parseDate, parseNumber, parseTime, parseValue } from './parse-value';
export { round } from './round';
export { dateFromSerial, dateToSerial } from './serial-date';
export { tokenize } from './tokenize';

export type {
    FormatDateInfo,
    FormatInfo,
    FormatToken,
    LocaleData,
    LocaleToken,
    ParseData,
} from './types';

const parseDataCache: Record<string, ParsedPattern> = Object.create({});

function prepareFormatterData(pattern: string, shouldThrow: boolean = false): ParsedPattern {
    const normalizedPattern = pattern || 'General';

    let parseData = parseDataCache[normalizedPattern];
    if (!parseData) {
        try {
            parseData = parsePattern(normalizedPattern);
            parseDataCache[normalizedPattern] = parseData;
        } catch (error: unknown) {
            // if the options say to throw errors, then do so
            if (shouldThrow) {
                throw error;
            }
            // else we set the parse data to error
            const message = error instanceof Error ? error.message : String(error);
            const errorPart = {
                tokens: [{ type: 'error' }],
                error: message,
            };
            parseData = {
                pattern: normalizedPattern,
                partitions: [errorPart, errorPart, errorPart, errorPart],
                error: message,
                locale: null,
            };
        }
    }
    return parseData;
}

/**
 * Formats a value as a string and returns the result.
 */
export function format(
    pattern: string,
    value: unknown,
    options: FormatOptions = {}
): string {
    const resolvedOptions = Object.assign({}, defaultOptions, options) as ResolvedFormatOptions;
    const data = prepareFormatterData(pattern, resolvedOptions.throws);
    const normalizedValue = handleDates(value, resolvedOptions) ?? value;
    return formatValue(normalizedValue, data, resolvedOptions);
}

/**
 * Find the color appropriate to a value as dictated by a format pattern.
 */
export function formatColor(
    pattern: string,
    value: unknown,
    options?: FormatOptions
): FormatColor {
    const resolvedOptions = Object.assign({}, defaultOptions, options) as ResolvedFormatOptions;
    const data = prepareFormatterData(pattern, resolvedOptions.throws);
    const normalizedValue = handleDates(value, resolvedOptions) ?? value;
    return formatValueColor(normalizedValue, data, resolvedOptions);
}

/** Determine if a given format pattern is a date pattern. */
export function isDateFormat(pattern: string): boolean {
    const data = prepareFormatterData(pattern, false);
    return isDate(data.partitions);
}

/** Determine if a given format pattern is a percentage pattern. */
export function isPercentFormat(pattern: string): boolean {
    const data = prepareFormatterData(pattern, false);
    return isPercent(data.partitions);
}

/** Determine if a given format pattern is a text only pattern. */
export function isTextFormat(pattern: string): boolean {
    const data = prepareFormatterData(pattern, false);
    return isText(data.partitions);
}

/** Determine if a given format pattern is valid. */
export function isValidFormat(pattern: string): boolean {
    try {
        prepareFormatterData(pattern, true);
        return true;
    } catch {
        return false;
    }
}

/** Returns metadata describing a parsed format pattern. */
export function getFormatInfo(
    pattern: string,
    options: { currency?: string } = {}
): FormatInfo {
    const data = prepareFormatterData(pattern, false);
    if (!data.info) {
        data.info = info(data.partitions, options?.currency);
    }
    return data.info;
}

/** Gets information about date codes used in a format string. */
export function getFormatDateInfo(pattern: string): FormatDateInfo {
    const data = prepareFormatterData(pattern, false);
    if (!data.dateInfo) {
        data.dateInfo = dateInfo(data.partitions);
    }
    return data.dateInfo;
}

/** A dictionary of the types used to identify token variants. */
export const tokenTypes = Object.freeze({
    AMPM: TOKEN_AMPM,
    BREAK: TOKEN_BREAK,
    CALENDAR: TOKEN_CALENDAR,
    CHAR: TOKEN_CHAR,
    COLOR: TOKEN_COLOR,
    COMMA: TOKEN_COMMA,
    CONDITION: TOKEN_CONDITION,
    DATETIME: TOKEN_DATETIME,
    DBNUM: TOKEN_DBNUM,
    DIGIT: TOKEN_DIGIT,
    DURATION: TOKEN_DURATION,
    ERROR: TOKEN_ERROR,
    ESCAPED: TOKEN_ESCAPED,
    EXP: TOKEN_EXP,
    FILL: TOKEN_FILL,
    GENERAL: TOKEN_GENERAL,
    GROUP: TOKEN_GROUP,
    HASH: TOKEN_HASH,
    LOCALE: TOKEN_LOCALE,
    MINUS: TOKEN_MINUS,
    MODIFIER: TOKEN_MODIFIER,
    NATNUM: TOKEN_NATNUM,
    PAREN: TOKEN_PAREN,
    PERCENT: TOKEN_PERCENT,
    PLUS: TOKEN_PLUS,
    POINT: TOKEN_POINT,
    QMARK: TOKEN_QMARK,
    SCALE: TOKEN_SCALE,
    SKIP: TOKEN_SKIP,
    SLASH: TOKEN_SLASH,
    SPACE: TOKEN_SPACE,
    STRING: TOKEN_STRING,
    TEXT: TOKEN_TEXT,
    ZERO: TOKEN_ZERO,
});
