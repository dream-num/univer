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

import { FUNCTION_NAMES_FINANCIAL } from '../../function-names';
import { Fvschedule } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test fvschedule function', () => {
    const testFunction = new Fvschedule(FUNCTION_NAMES_FINANCIAL.FVSCHEDULE);

    describe('Fvschedule', () => {
        it('Value is normal', () => {
            const principal = NumberValueObject.create(1);
            const schedule = ArrayValueObject.create('{0.09,0.11,0.1}');
            const result = testFunction.calculate(principal, schedule);
            expect(result.getValue()).toStrictEqual(1.3308900000000004);

            const schedule2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(principal, schedule2);
            expect(result2.getValue()).toStrictEqual(2);
        });

        it('Value is error', () => {
            const principal = ErrorValueObject.create(ErrorType.NAME);
            const schedule = ArrayValueObject.create('{0.09,0.11,0.1}');
            const result = testFunction.calculate(principal, schedule);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const principal = BooleanValueObject.create(true);
            const schedule = ArrayValueObject.create('{0.09,0.11,0.1}');
            const result = testFunction.calculate(principal, schedule);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);

            const principal2 = NumberValueObject.create(1);
            const schedule2 = BooleanValueObject.create(true);
            const result2 = testFunction.calculate(principal2, schedule2);
            expect(result2.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is blank cell', () => {
            const principal = NullValueObject.create();
            const schedule = ArrayValueObject.create('{0.09,0.11,0.1}');
            const result = testFunction.calculate(principal, schedule);
            expect(result.getValue()).toStrictEqual(0);
        });

        it('Value is normal string', () => {
            const principal = StringValueObject.create('test');
            const schedule = ArrayValueObject.create('{0.09,0.11,0.1}');
            const result = testFunction.calculate(principal, schedule);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);

            const principal2 = NumberValueObject.create(1);
            const schedule2 = StringValueObject.create('test');
            const result2 = testFunction.calculate(principal2, schedule2);
            expect(result2.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is array', () => {
            const principal = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['1.02', 'test', true, false, ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const schedule = ArrayValueObject.create('{0.09,0.11,0.1}');
            const result = testFunction.calculate(principal, schedule);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);

            const principal2 = NumberValueObject.create(1);
            const schedule2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['1.02', 'test', true, false, ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(principal2, schedule2);
            expect(result2.getValue()).toStrictEqual(ErrorType.VALUE);

            const schedule3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['1.02', true, 'test', false, ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(principal2, schedule3);
            expect(result3.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});
