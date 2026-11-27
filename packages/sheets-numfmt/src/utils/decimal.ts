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

import { numfmt } from '@univerjs/core';

const MAX_DECIMALS = 30;
const MASKED_CHAR = '\u0000';

interface IPatternSection {
    mask: string;
    text: string;
}

export const getDecimalString = (length: number) =>
    new Array(Math.min(Math.max(0, Number(length)), MAX_DECIMALS)).fill(0).join('');

/**
 * Replaces quoted literals, escaped characters, `[...]` blocks and the operands of `_` / `*` with a
 * placeholder. Format codes keep their position, so indexes found in the mask apply to the text.
 */
function maskSection(section: string) {
    const chars = section.split('');
    let inQuote = false;
    let inBracket = false;

    for (let i = 0; i < chars.length; i++) {
        const char = chars[i];

        if (inBracket) {
            chars[i] = MASKED_CHAR;
            if (char === ']') {
                inBracket = false;
            }
            continue;
        }

        if (char === '"') {
            chars[i] = MASKED_CHAR;
            inQuote = !inQuote;
            continue;
        }

        if (inQuote) {
            chars[i] = MASKED_CHAR;
            continue;
        }

        if (char === '\\' || char === '_' || char === '*') {
            chars[i] = MASKED_CHAR;
            if (i + 1 < chars.length) {
                chars[i + 1] = MASKED_CHAR;
                i += 1;
            }
            continue;
        }

        if (char === '[') {
            chars[i] = MASKED_CHAR;
            inBracket = true;
        }
    }

    return chars.join('');
}

function splitSections(pattern: string): IPatternSection[] {
    const mask = maskSection(pattern);
    const sections: IPatternSection[] = [];
    let start = 0;

    for (let i = 0; i <= mask.length; i++) {
        if (i === mask.length || mask[i] === ';') {
            sections.push({ mask: mask.slice(start, i), text: pattern.slice(start, i) });
            start = i + 1;
        }
    }

    return sections;
}

function isDateSection(section: IPatternSection) {
    return section.text !== '' && numfmt.getFormatInfo(section.text).isDate;
}

function isFractionPlaceholder(char: string | undefined) {
    return char === '0' || char === '#' || char === '?';
}

function findIntegerZero(mask: string) {
    for (let i = 0; i < mask.length; i++) {
        if (mask[i] === '0' && mask[i + 1] !== '0') {
            return i;
        }
    }

    return -1;
}

/**
 * Grows or shrinks the fractional placeholders of a number section one at a time, the way Excel does:
 * adding copies the last fractional placeholder, removing drops the last one and the decimal point
 * with the last placeholder.
 */
function setNumberSectionDecimal(section: IPatternSection, decimalLength: number) {
    const dotIndex = section.mask.indexOf('.');

    if (dotIndex < 0) {
        if (decimalLength === 0) {
            return section.text;
        }

        const zeroIndex = findIntegerZero(section.mask);
        if (zeroIndex < 0) {
            return section.text;
        }

        return `${section.text.slice(0, zeroIndex + 1)}.${getDecimalString(decimalLength)}${section.text.slice(zeroIndex + 1)}`;
    }

    let end = dotIndex + 1;
    while (isFractionPlaceholder(section.mask[end])) {
        end += 1;
    }

    const fraction = section.text.slice(dotIndex + 1, end);
    if (fraction.length === 0 && decimalLength === 0) {
        // a decimal point without digits is still a decimal point for Univer (`0.` -> `0`)
        return `${section.text.slice(0, dotIndex)}${section.text.slice(dotIndex + 1)}`;
    }

    if (decimalLength >= fraction.length) {
        const filler = fraction.length > 0 ? fraction[fraction.length - 1] : '0';
        return `${section.text.slice(0, end)}${filler.repeat(decimalLength - fraction.length)}${section.text.slice(end)}`;
    }

    const nextFraction = fraction.slice(0, decimalLength);
    return nextFraction.length > 0
        ? `${section.text.slice(0, dotIndex)}.${nextFraction}${section.text.slice(end)}`
        : `${section.text.slice(0, dotIndex)}${section.text.slice(end)}`;
}

/**
 * the function decimal just use positive,negative configuration ignored
 */
export const getDecimalFromPattern = (pattern: string, defaultValue: number = 0) => {
    if (!pattern) {
        return defaultValue;
    }

    const info = numfmt.getFormatInfo(pattern);
    return info.maxDecimals ?? defaultValue;
};

/**
 * Changes the decimal places of a number format. Date and time formats are returned unchanged, even
 * when they show fractional seconds, because Excel's increase/decrease decimal commands do not apply
 * to them.
 */
export const setPatternDecimal = (patterns: string, decimalLength: number) => {
    const length = Math.min(Math.max(0, Math.floor(Number(decimalLength) || 0)), MAX_DECIMALS);

    return splitSections(patterns)
        .map((section) => (isDateSection(section) ? section.text : setNumberSectionDecimal(section, length)))
        .join(';');
};

export const isPatternHasDecimal = (pattern: string) => /\.0?/.test(pattern) || /0([^0]?)|0$/.test(pattern);
