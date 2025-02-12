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
import type { ArrayValueObject } from '../value-object/array-value-object';
import { ValueObjectFactory } from '../value-object/array-value-object';
import type { BaseValueObject } from '../value-object/base-value-object';
import { BooleanValueObject, createBooleanValueObjectByRawValue } from '../value-object/primitive-object';
import { expandArrayValueObject } from './array-object';

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

/**
 * When it contains both comparison characters and wildcard characters
 * 1. The value of apple* has the same effect as =apple*
 * 2. >=apple*: normal value, >apple: obtains the same effect as >=apple*
 * 3. <apple*: normal value, <=apple: obtains the same effect as <apple*
 */
export function valueObjectCompare(range: BaseValueObject, criteria: BaseValueObject, operator?: compareToken, isCaseSensitive?: boolean) {
    if (!operator) {
        // Only strings can extract comparison symbols, other types of values are 'equal to'
        // TODO: criteria: 32, ">32", B5, "3?", "apple*", "*~?", TODAY(), ">"&A1:B3
        if (criteria.isString()) {
            const criteriaValueString = `${criteria.getValue()}`;
            const [token, criteriaStringObject] = findCompareToken(criteriaValueString);
            operator = token;
            criteria = criteriaStringObject;
        } else {
            operator = compareToken.EQUALS;
        }
    }

    return range.compare(criteria, operator, isCaseSensitive);
}

/**
 * Find the Boolean intersection of two ArrayValueObjects
 * @param valueObject1
 * @param valueObject2
 */
export function booleanObjectIntersection(valueObject1: BaseValueObject, valueObject2: BaseValueObject) {
    const maxRowLength = Math.max(valueObject1.isArray() ? (valueObject1 as ArrayValueObject).getRowCount() : 1, valueObject2.isArray() ? (valueObject2 as ArrayValueObject).getRowCount() : 1);
    const maxColumnLength = Math.max(valueObject1.isArray() ? (valueObject1 as ArrayValueObject).getColumnCount() : 1, valueObject2.isArray() ? (valueObject2 as ArrayValueObject).getColumnCount() : 1);

    const valueObject1Array = expandArrayValueObject(maxRowLength, maxColumnLength, valueObject1);
    const valueObject2Array = expandArrayValueObject(maxRowLength, maxColumnLength, valueObject2);

    return valueObject1Array.mapValue((valueObject1, rowIndex, columnIndex) => {
        const valueObject2 = valueObject2Array.get(rowIndex, columnIndex);

        if (valueObject1?.isError()) {
            return valueObject1;
        }

        if (valueObject2?.isError()) {
            return valueObject2;
        }

        if (valueObject1?.isBoolean() && valueObject2?.isBoolean()) {
            return createBooleanValueObjectByRawValue(valueObject1.getValue() && valueObject2.getValue());
        }

        return BooleanValueObject.create(false);
    });
}
