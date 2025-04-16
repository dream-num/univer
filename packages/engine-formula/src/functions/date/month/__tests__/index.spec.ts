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

import { describe, expect, it } from 'vitest';

import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_DATE } from '../../function-names';
import { Month } from '../index';

describe('Test month function', () => {
    const testFunction = new Month(FUNCTION_NAMES_DATE.MONTH);

    describe('Month', () => {
        it('Serial number is normal', () => {
            const serialNumber = NumberValueObject.create(43831);
            const result = testFunction.calculate(serialNumber);
            expect(result.getValue()).toStrictEqual(1);
        });

        it('Serial number is date string', () => {
            const serialNumber = StringValueObject.create('2020-01-02');
            const result = testFunction.calculate(serialNumber);
            expect(result.getValue()).toStrictEqual(1);
        });

        it('Serial number is array', () => {
            const serialNumber = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[1, ' ', 1.23, true, false, null], [0, '100', '2.34', 'test', -3, 1900]]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(serialNumber);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[1, '#VALUE!', 1, 1, 1, 1], [1, 4, 1, '#VALUE!', '#NUM!', 3]]);
        });
    });
});
