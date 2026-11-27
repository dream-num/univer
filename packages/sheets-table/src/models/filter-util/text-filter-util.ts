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

import type { Nullable } from '@univerjs/core';
import { regexp } from '@univerjs/core';
import type { ITableStringFilterInfo } from '../../types/type';
import { TableStringCompareTypeEnum } from '../../types/enum';

function createTextMatcher(pattern: string, negate = false) {
    const regex = regexp.createFromWildcard(pattern);
    const matchesBlank = pattern === '';
    return (value: Nullable<string | number>) => {
        // A formula that returns an empty string can still match a wildcard.
        const matches = value == null ? matchesBlank : regex.test(String(value));
        return negate ? !matches : matches;
    };
}

export function getTextFilterExecuteFunc(filter: ITableStringFilterInfo) {
    const { expectedValue } = filter;
    switch (filter.compareType) {
        case TableStringCompareTypeEnum.Equal:
            return createTextMatcher(expectedValue);
        case TableStringCompareTypeEnum.NotEqual:
            return createTextMatcher(expectedValue, true);
        case TableStringCompareTypeEnum.Contains:
            return createTextMatcher(`*${expectedValue}*`);
        case TableStringCompareTypeEnum.NotContains:
            return createTextMatcher(`*${expectedValue}*`, true);
        case TableStringCompareTypeEnum.StartsWith:
            return createTextMatcher(`${expectedValue}*`);
        case TableStringCompareTypeEnum.EndsWith:
            return createTextMatcher(`*${expectedValue}`);
        default:
            console.error(`Unknown filter operator: ${filter.compareType}`);
            return () => true;
    }
}
