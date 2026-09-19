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

import { compareToken } from '../../basics/token';

/**
 * For SearchType
 */
export enum ArrayBinarySearchType {
    MIN, // Ascending order
    MAX, // Descending order
}

/**
 * For MatchType
 */
export enum ArrayOrderSearchType {
    NORMAL, // Exact match.
    MIN, // Exact match. If none found, return the next smaller item.
    MAX, // Exact match. If none found, return the next larger item.
}

export function getCompare() {
    if (Intl && Intl.Collator) {
        return new Intl.Collator(undefined, { numeric: false }).compare;
    }

    return (a: string, b: string): number => {
        return a.localeCompare(b);
    };
}

export function isWildcard(str: string) {
    return str.indexOf('*') > -1 || str.indexOf('?') > -1;
}

const TEXT_LIGATURES: Record<string, string> = {
    ß: 'ss',
    æ: 'ae',
    œ: 'oe',
    ﬀ: 'ff',
    ﬁ: 'fi',
    ﬂ: 'fl',
    ﬃ: 'ffi',
    ﬄ: 'ffl',
    ﬅ: 'st',
    ﬆ: 'st',
};

export function normalizeTextForComparison(value: string): string {
    const lower = value.toLowerCase();
    // Excel's literal comparisons equate linguistic ligatures, while retaining
    // accents and the distinction between dotted/dotless I.
    return /[\u0080-\uFFFF]/.test(lower)
        ? lower.normalize('NFC').replace(/[ßæœﬀ-ﬆ]/g, (character) => TEXT_LIGATURES[character])
        : lower;
}

export function isMatchWildcard(currentValue: string, value: string) {
    const pattern = escapeRegExpForWildcard(value).replace(/~?[*?]/g, (match) => {
        if (match.startsWith('~')) {
            return `\\${match.substring(1)}`;
        }
        if (match === '*') {
            return '.*';
        }
        if (match === '?') {
            return '.';
        }
        return match;
    });
    const regex = new RegExp(`^${pattern}$`, 's');
    return regex.test(currentValue);
}

export function replaceWildcard(value: string) {
    return value.replace(/~?[*?]/g, (match) => {
        if (match.startsWith('~')) {
            return match.substring(1);
        }
        return ' ';
    });
}

export function compareWithWildcard(currentValue: string, value: string, operator: compareToken, isCaseSensitive = true) {
    let currentText = currentValue;
    let pattern = value;
    if (!isCaseSensitive) {
        // Wildcards count UTF-16 characters in Excel. Folding must not expand
        // a character (for example, İ into i plus a combining dot, or ß into ss).
        const fold = (text: string) => {
            if (!/[\u0080-\uFFFF]/.test(text)) {
                return text.toLowerCase();
            }
            return text.replace(/[\s\S]/g, (character) => {
                const lower = character.toLowerCase();
                return lower.length === 1 ? lower : character;
            });
        };
        currentText = fold(currentText);
        pattern = fold(pattern);
    }
    let result = false;

    switch (operator) {
        case compareToken.EQUALS:
            result = isMatchWildcard(currentText, pattern);
            break;
        case compareToken.NOT_EQUAL:
            result = !isMatchWildcard(currentText, pattern);
            break;
        case compareToken.GREATER_THAN:
        case compareToken.GREATER_THAN_OR_EQUAL:
            result = isMatchWildcard(currentText, pattern) || currentText > replaceWildcard(pattern);

            break;

        case compareToken.LESS_THAN:
        case compareToken.LESS_THAN_OR_EQUAL:
            result = currentText < replaceWildcard(pattern);
            break;

        default:
            break;
    }

    return result;
}

function escapeRegExpForWildcard(str: string) {
    // Keep * and ? unescaped so wildcard replacement can handle them below.
    return str.replace(/[.+^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function getMatchModeValue(matchModeValue: number) {
    switch (matchModeValue) {
        case 1:
            return ArrayOrderSearchType.MAX;
        case 0:
            return ArrayOrderSearchType.NORMAL;
        case -1:
            return ArrayOrderSearchType.MIN;
        default:
            return ArrayOrderSearchType.NORMAL;
    }
}

export function getSearchModeValue(searchModeValue: number) {
    return searchModeValue === -2 ? ArrayBinarySearchType.MAX : ArrayBinarySearchType.MIN;
}
