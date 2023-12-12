/**
 * Copyright 2023-present DreamNum Inc.
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
import type { BaseReferenceObject } from '../reference-object/base-reference-object';
import { ValueObjectFactory } from '../value-object/array-value-object';
import type { BaseValueObject } from '../value-object/base-value-object';

export function findCompareToken(str: string): [compareToken, BaseValueObject] {
    const comparisonTokens: compareToken[] = [
        compareToken.EQUALS,
        compareToken.NOT_EQUAL,
        compareToken.GREATER_THAN_OR_EQUAL,
        compareToken.GREATER_THAN,
        compareToken.LESS_THAN_OR_EQUAL,
        compareToken.LESS_THAN,
    ];

    for (const token of comparisonTokens) {
        if (str.startsWith(token)) {
            const content = str.substring(token.length);
            return [token, ValueObjectFactory.create(content) as BaseValueObject];
        }
    }

    return [compareToken.EQUALS, ValueObjectFactory.create(str) as BaseValueObject];
}

export function isWildcard(str: string) {
    return str.indexOf('*') > -1 || str.indexOf('?') > -1;
}

/**
 * When it contains both comparison characters and wildcard characters
 * 1. The value of apple* has the same effect as =apple*
 * 2. >=apple*: normal value, >apple: obtains the same effect as >=apple*
 * 3. <apple*: normal value, <=apple: obtains the same effect as <apple*
 */
export function valueObjectCompare(range: BaseReferenceObject, criteria: BaseValueObject) {
    const arrayValueObject = range.toArrayValueObject();
    const criteriaValueString = `${criteria.getValue()}`;

    const [token, criteriaStringObject] = findCompareToken(criteriaValueString);

    if (isWildcard(criteriaValueString)) {
        return arrayValueObject.wildcard(criteriaStringObject, token);
    }

    return arrayValueObject.compare(criteriaStringObject, token);
}
