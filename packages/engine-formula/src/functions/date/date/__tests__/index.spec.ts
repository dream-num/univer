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

import { FUNCTION_NAMES_DATE } from '../../function-names';
import { DateFunction } from '..';
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';

describe('Test date function', () => {
    const textFunction = new DateFunction(FUNCTION_NAMES_DATE.DATE);

    describe('Date', () => {
        it('Value is normal', () => {
            const year = new NumberValueObject(2024);
            const month = new NumberValueObject(1);
            const day = new NumberValueObject(1);
            const result = textFunction.calculate(year, month, day);
            expect(result.getValue()).toBe(45292);
        });
    });
});
