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

import { describe, expect, it } from 'vitest';

import { FUNCTION_NAMES_META } from '../../function-names';
import { Compare } from '../index';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { compareToken } from '../../../../basics/token';

describe('Test compare function', () => {
    const testFunction = new Compare(FUNCTION_NAMES_META.COMPARE);

    describe('Compoare', () => {
        it('Comparing Boolean and number', () => {
            const value1 = BooleanValueObject.create(false);
            const value2 = NumberValueObject.create(2);

            testFunction.setCompareType(compareToken.GREATER_THAN);
            const result = testFunction.calculate(value1, value2);
            expect(result.getValue()).toBe(true);
        });
        it('Comparing Boolean and string', () => {
            const value1 = BooleanValueObject.create(false);
            const value2 = StringValueObject.create('Univer');

            testFunction.setCompareType(compareToken.GREATER_THAN);
            const result = testFunction.calculate(value1, value2);
            expect(result.getValue()).toBe(true);
        });
    });
});
