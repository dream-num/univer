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

import type { ICellData, Nullable, Styles } from '@univerjs/core';
import { LocaleType, numfmt } from '@univerjs/core';
import { FormulaAstLRU } from '../../basics/cache-lru';
import { operatorToken } from '../../basics/token';

const currencySymbols = [
    '$',
    '£',
    '¥',
    '¤',
    '֏',
    '؋',
    '৳',
    '฿',
    '៛',
    '₡',
    '₦',
    '₩',
    '₪',
    '₫',
    '€',
    '₭',
    '₮',
    '₱',
    '₲',
    '₴',
    '₸',
    '₹',
    '₺',
    '₼',
    '₽',
    '₾',
    '₿',
];

type FormatType =
    | 'currency'
    | 'date'
    | 'datetime'
    | 'error'
    | 'fraction'
    | 'general'
    | 'grouped'
    | 'number'
    | 'percent'
    | 'scientific'
    | 'text'
    | 'time';

enum NumberFormatType {
    General,
    Number,
    Currency,
    Accounting,
    Date,
    Time,
    Percentage,
    Fraction,
    Scientific,
    Text,
    Special,
    Custom,
}

// except error/grouped
const NumberFormatTypeMap = {
    currency: NumberFormatType.Currency,
    date: NumberFormatType.Date,
    datetime: NumberFormatType.Time,
    error: NumberFormatType.Custom,
    fraction: NumberFormatType.Fraction,
    general: NumberFormatType.General,
    grouped: NumberFormatType.Custom,
    number: NumberFormatType.Number,
    percent: NumberFormatType.Percentage,
    scientific: NumberFormatType.Scientific,
    text: NumberFormatType.Text,
    time: NumberFormatType.Time,
    unknown: NumberFormatType.Custom,
};
/**
 * Handling number formats in styles
 *
 * @param oldCell
 * @param cell
 */
export function handleNumfmtInCell(oldCell: Nullable<ICellData>, cell: Nullable<ICellData>, styles: Styles | undefined) {
    if (oldCell == null || cell == null) {
        return cell;
    }

    const oldCellStyle = styles?.getStyleByCell(oldCell) || oldCell.s;
    const cellStyle = styles?.getStyleByCell(cell) || cell.s;

    if (oldCellStyle == null || cellStyle == null || typeof oldCellStyle !== 'object' || typeof cellStyle !== 'object') {
        return cell;
    }

    const oldPattern = oldCellStyle?.n?.pattern;
    const pattern = cellStyle?.n?.pattern;

    if (oldPattern == null || pattern == null) {
        return cell;
    }

    // The number format calculated by the formula, if the current cell already has a number format, the original format is used, if not, a new one is set.
    // Why?
    // Due to the forced calculation mechanism during initialization, if the formula may overwrite the original number format, the number format set for the formula cell may never take effect.
    const newPattern = oldPattern || pattern;

    cellStyle!.n!.pattern = newPattern;

    return cell;
}

/**
 * Process the priority of the newly set number format and the original format.
 *
 * Here is the priority of the number format in Excel:
 * ┌─────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                 │ new format                                                                                                                                       │
 * ├─────────────────┼────────────┬────────────┬────────────┬────────────┬──────────┬──────────┬────────────┬──────────┬────────────┬──────────┬────────────┬───────────┤
 * │ Original format │ General    │ Number     │ Currency   │ Accounting │ Date     │ Time     │ Percentage │ Fraction │ Scientific │ Text     │ Special    │ Custom    │
 * ├─────────────────┼────────────┼────────────┼────────────┼────────────┼──────────┼──────────┼────────────┼──────────┼────────────┼──────────┼────────────┼───────────┤
 * │ General         │ General    │ Number     │ Currency   │ Accounting │ Date     │ Time     │ Percentage │ Fraction │ Scientific │ Text     │ Special    │ Custom    │
 * │ Number          │ Number     │ Number     │ Number     │ Number     │ Number   │ Number   │ Number     │ Number   │ Number     │ Number   │ Number     │ Number    │
 * │ Currency        │ Currency   │ Currency   │ Currency   │ Currency   │ Currency │ Currency │ Currency   │ Currency │ Currency   │ Currency │ Currency   │ Currency  │
 * │ Accounting      │ Accounting │ Accounting │ Accounting │ Accounting │ Date     │ Time     │ Percentage │ Fraction │ Scientific │ Text     │ Accounting │ Custom    │
 * │ Date            │ Date       │ Date       │ Currency   │ Accounting │ Date     │ Time     │ Percentage │ Fraction │ Scientific │ Text     │ Date       │ Custom    │
 * │ Time            │ Time       │ Time       │ Time       │ Time       │ Time     │ Time     │ Time       │ Time     │ Time       │ Time     │ Time       │ Time      │
 * │ Percentage      │ Percentage │ Percentage │ Currency   │ Accounting │ Date     │ Time     │ Percentage │ Fraction │ Scientific │ Text     │ Percentage │ Custom    │
 * │ Fraction        │ Fraction   │ Fraction   │ Currency   │ Accounting │ Date     │ Time     │ Percentage │ Fraction │ Scientific │ Text     │ Fraction   │ Custom    │
 * │ Scientific      │ Scientific │ Scientific │ Currency   │ Accounting │ Date     │ Time     │ Percentage │ Fraction │ Scientific │ Text     │ Scientific │ Custom    │
 * │ Text            │ Text       │ Text       │ Text       │ Text       │ Text     │ Text     │ Text       │ Text     │ Text       │ Text     │ Text       │ Text      │
 * │ Special         │ Special    │ Special    │ Special    │ Special    │ Special  │ Special  │ Special    │ Special  │ Special    │ Special  │ Special    │ Special   │
 * │ Custom          │ Custom     │ Custom     │ Currency   │ Accounting │ Date     │ Custom   │ Percentage │ Fraction │ Scientific │ Text     │ Custom     │ Custom    │
 * └─────────────────┴────────────┴────────────┴────────────┴────────────┴──────────┴──────────┴────────────┴──────────┴────────────┴──────────┴────────────┴───────────┘
 *
 * The number formats supported by Univer are different from Excel, so it only processes the parts that are the same as Excel. For different parts, we consider the newly set number format to have a higher priority.
 *
 * In the future, if Univer completely matches Excel, we will implement Excel’s priority rules.
 *
 * @param oldPattern
 * @param pattern
 * @returns
 */
export function compareNumfmtPriority(oldPattern: string, pattern: string) {
    const oldPatternType = getNumberFormatType(oldPattern);
    const patternType = getNumberFormatType(pattern);

    if (oldPatternType === NumberFormatType.General) {
        return pattern;
    }

    if ([NumberFormatType.Number, NumberFormatType.Currency, NumberFormatType.Time, NumberFormatType.Text, NumberFormatType.Special].includes(oldPatternType)) {
        return oldPattern;
    }

    if (oldPatternType === NumberFormatType.Accounting) {
        if ([NumberFormatType.Date, NumberFormatType.Time, NumberFormatType.Percentage, NumberFormatType.Fraction, NumberFormatType.Scientific, NumberFormatType.Text, NumberFormatType.Custom].includes(patternType)) {
            return pattern;
        }
        return oldPattern;
    }

    if ([NumberFormatType.Date, NumberFormatType.Percentage, NumberFormatType.Fraction, NumberFormatType.Scientific].includes(oldPatternType)) {
        if ([NumberFormatType.Currency, NumberFormatType.Accounting, NumberFormatType.Date, NumberFormatType.Time, NumberFormatType.Percentage, NumberFormatType.Fraction, NumberFormatType.Scientific, NumberFormatType.Text, NumberFormatType.Custom].includes(patternType)) {
            return pattern;
        }
        return oldPattern;
    }

    if (oldPatternType === NumberFormatType.Custom) {
        if ([NumberFormatType.Currency, NumberFormatType.Accounting, NumberFormatType.Date, NumberFormatType.Percentage, NumberFormatType.Fraction, NumberFormatType.Scientific, NumberFormatType.Text].includes(patternType)) {
            return pattern;
        }
        return oldPattern;
    }

    return oldPattern;
}

const numberFormatTypeCache = new FormulaAstLRU<NumberFormatType>(100000);
function getNumberFormatType(pattern: string) {
    const patternTypeCache = numberFormatTypeCache.get(pattern);
    if (patternTypeCache !== undefined) {
        return patternTypeCache;
    }

    const type = getNumberFormatTypeRaw(pattern);
    numberFormatTypeCache.set(pattern, type);

    return type;
}

export function clearNumberFormatTypeCache() {
    numberFormatTypeCache.clear();
}

/**
 * Get the type of the number format
 *
 * @param pattern
 * @returns
 */
function getNumberFormatTypeRaw(pattern: string): NumberFormatType {
    if (isAccounting(pattern)) {
        return NumberFormatType.Accounting;
    }

    const type = numfmt.getInfo(pattern).type as FormatType || 'unknown';
    return NumberFormatTypeMap[type];
}

function isAccounting(pattern: string) {
    return !!currencySymbols.find((code) => pattern.includes(code)) && pattern.startsWith('_(');
};

/**
 * The number format of the formula inherits the number format of the referenced cell, usually taking the format of the cell at the front position, but some formats have higher priority, there are some special cases.
 *
 * e.g.
 * Currency * Currency = General
 * Currency / Currency = General
 *
 * For two cells with the same number format, the calculated result should inherit the following number format
 * ┌─────┬─────────┬──────────┬────────────┬─────────┬─────────┬────────────┬──────────┬────────────┬──────┬─────────┬──────────┐
 * │     │ Number  │ Currency │ Accounting │ Date    │ Time    │ Percentage │ Fraction │ Scientific │ Text │ Special │ Custom   │
 * ├─────┼─────────┼──────────┼────────────┼─────────┼─────────┼────────────┼──────────┼────────────┼──────┼─────────┼──────────┤
 * │  +  │ Number  │ Currency │ Accounting │ General │ Time    │ Percentage │ Fraction │ Scientific │ Text │ Special │ General  │
 * │  -  │ Number  │ Currency │ Accounting │ General │ Time    │ Percentage │ Fraction │ Scientific │ Text │ Special │ General  │
 * │  *  │ General │ General  │ General    │ General │ General │ Percentage │ Fraction │ Scientific │ Text │ General │ General  │
 * │  /  │ General │ General  │ General    │ General │ General │ Percentage │ Fraction │ Scientific │ Text │ General │ General  │
 * └─────┴─────────┴──────────┴────────────┴─────────┴─────────┴────────────┴──────────┴────────────┴──────┴─────────┴──────────┘
 *
 * @param previousPattern
 * @param nextPattern
 */
export function comparePatternPriority(previousPattern: string, nextPattern: string, operator: operatorToken) {
    if (previousPattern === '') {
        return nextPattern;
    } else if (nextPattern === '') {
        return previousPattern;
    }

    const previousPatternType = getNumberFormatType(previousPattern);
    const nextPatternType = getNumberFormatType(nextPattern);

    if (operator === operatorToken.PLUS || operator === operatorToken.MINUS) {
        if ((previousPatternType === NumberFormatType.Date && nextPatternType === NumberFormatType.Date) || (previousPatternType === NumberFormatType.Custom && nextPatternType === NumberFormatType.Custom)) {
            return '';
        }

        return nextPattern;
    }

    if (operator === operatorToken.MULTIPLY || operator === operatorToken.DIVIDED) {
        if ((previousPatternType === NumberFormatType.Percentage && nextPatternType === NumberFormatType.Percentage) || (previousPatternType === NumberFormatType.Fraction && nextPatternType === NumberFormatType.Fraction) || (previousPatternType === NumberFormatType.Scientific && nextPatternType === NumberFormatType.Scientific) || (previousPatternType === NumberFormatType.Text && nextPatternType === NumberFormatType.Text)) {
            return nextPattern;
        }

        return '';
    }

    return previousPattern || nextPattern;
}

/**
 * Get the currency symbol based on the locale
 * Now define it here
 * TODO: import from sheet-numfmt currencySymbolMap later
 *
 * @param locale
 * @returns
 */
const countryCurrencySymbolMap = new Map<LocaleType, string>([
    [LocaleType.EN_US, '$'],
    // [LocaleType.JA_JP, '¥'],
    [LocaleType.RU_RU, '₽'],
    [LocaleType.VI_VN, '₫'],
    [LocaleType.ZH_CN, '¥'],
    [LocaleType.ZH_TW, 'NT$'],
]);

function getCurrencySymbol(locale: LocaleType): string {
    return countryCurrencySymbolMap.get(locale) || '$';
}

export function getCurrencyFormat(locale: LocaleType, numberDigits: number = 2): string {
    let _numberDigits = numberDigits;

    if (numberDigits > 127) {
        _numberDigits = 127;
    }

    let decimal = '';

    if (_numberDigits > 0) {
        decimal = `.${'0'.repeat(_numberDigits)}`;
    }

    return `"${getCurrencySymbol(locale)}"#,##0${decimal}_);[Red]("${getCurrencySymbol(locale)}"#,##0${decimal})`;
}

export function applyCurrencyFormat(locale: LocaleType, number: number, numberDigits: number = 2): string {
    return numfmt.format(getCurrencyFormat(locale, numberDigits), number);
}

/**
 * String is number pattern or date or time, for example
 * "20%"
 * "2012-12-12"
 * "16:48:00"
 *
 * @param locale
 * @returns
 */
const stringToNumberPatternCache = new FormulaAstLRU<{
    value: number;
    pattern: string;
}>(100000);

export function stringIsNumberPattern(input: string) {
    let _input = input;

    if (_input.startsWith('"') && _input.endsWith('"')) {
        _input = _input.slice(1, -1);
    }

    const cacheValue = stringToNumberPatternCache.get(_input);

    if (cacheValue) {
        return {
            isNumberPattern: true,
            value: cacheValue.value,
            pattern: cacheValue.pattern,
        };
    }

    const numberPattern = numfmt.parseNumber(_input);

    if (numberPattern && numberPattern.z) {
        return setNumberPatternCache(_input, numberPattern.v as number, numberPattern.z as string);
    }

    const datePattern = numfmt.parseDate(_input);

    if (datePattern && datePattern.z) {
        return setNumberPatternCache(_input, datePattern.v as number, datePattern.z as string);
    }

    const timePattern = numfmt.parseTime(_input);

    if (timePattern && timePattern.z) {
        return setNumberPatternCache(_input, timePattern.v as number, timePattern.z as string);
    }

    return {
        isNumberPattern: false,
    };
}

function setNumberPatternCache(input: string, value: number, pattern: string) {
    stringToNumberPatternCache.set(input, {
        value,
        pattern,
    });

    return {
        isNumberPattern: true,
        value,
        pattern,
    };
}

export function clearStringToNumberPatternCache() {
    stringToNumberPatternCache.clear();
}
