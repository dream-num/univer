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

import type { ITableStringFilterInfo } from '../../types/type';
import { TableStringCompareTypeEnum } from '../../types/enum';

/**
 * Converts a pattern with ? and * to a regular expression.
 * @param {string} pattern - The pattern to convert.
 * @returns {RegExp} The regular expression.
 */
const patternToRegExp = (pattern: string): RegExp => {
    const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexPattern = escapedPattern.replace(/\\\*/g, '.*').replace(/\\\?/g, '.');
    return new RegExp(`^${regexPattern}$`);
};

export const textEqual = (compareValue: string, expectedValue: string) => {
    const regex = patternToRegExp(expectedValue);
    return regex.test(compareValue);
};

export const textNotEqual = (compareValue: string, expectedValue: string) => {
    const regex = patternToRegExp(expectedValue);
    return !regex.test(compareValue);
};

export const textContain = (compareValue: string, expectedValue: string) => {
    const regex = patternToRegExp(`*${expectedValue}*`);
    return regex.test(compareValue);
};

export const textNotContain = (compareValue: string, expectedValue: string) => {
    const regex = patternToRegExp(`*${expectedValue}*`);
    return !regex.test(compareValue);
};

export const textStartWith = (compareValue: string, expectedValue: string) => {
    const regex = patternToRegExp(`${expectedValue}*`);
    return regex.test(compareValue);
};

export const textEndWith = (compareValue: string, expectedValue: string) => {
    const regex = patternToRegExp(`*${expectedValue}`);
    return regex.test(compareValue);
};

export function getTextFilterExecuteFunc(filter: ITableStringFilterInfo) {
    switch (filter.compareType) {
        case TableStringCompareTypeEnum.Equal:
            return (value: string) => textEqual(value, filter.expectedValue);
        case TableStringCompareTypeEnum.NotEqual:
            return (value: string) => textNotEqual(value, filter.expectedValue);
        case TableStringCompareTypeEnum.Contains:
            return (value: string) => textContain(value, filter.expectedValue);
        case TableStringCompareTypeEnum.NotContains:
            return (value: string) => textNotContain(value, filter.expectedValue);
        case TableStringCompareTypeEnum.StartsWith:
            return (value: string) => textStartWith(value, filter.expectedValue);
        case TableStringCompareTypeEnum.EndsWith:
            return (value: string) => textEndWith(value, filter.expectedValue);
        default:
            console.error(`Unknown filter operator: ${filter.compareType}`);
            return (value: string) => true;
    }
}
