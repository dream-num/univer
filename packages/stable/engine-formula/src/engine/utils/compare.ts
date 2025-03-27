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

export function isMatchWildcard(currentValue: string, value: string) {
    const pattern = escapeRegExp(value).replace(/~?[*?]/g, (match) => {
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
    const regex = new RegExp(`^${pattern}$`);
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

export function compareWithWildcard(currentValue: string, value: string, operator: compareToken) {
    let result = false;

    switch (operator) {
        case compareToken.EQUALS:
            result = isMatchWildcard(currentValue, value);
            break;
        case compareToken.NOT_EQUAL:
            result = !isMatchWildcard(currentValue, value);
            break;
        case compareToken.GREATER_THAN:
        case compareToken.GREATER_THAN_OR_EQUAL:
            result = isMatchWildcard(currentValue, value) || currentValue > replaceWildcard(value);

            break;

        case compareToken.LESS_THAN:
        case compareToken.LESS_THAN_OR_EQUAL:
            result = currentValue < replaceWildcard(value);
            break;

        default:
            break;
    }

    return result;
}

export function escapeRegExp(str: string) {
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
