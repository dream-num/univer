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

import { ErrorType } from '../../../../basics/error-type';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Marginoferror } from '../index';

describe('Test marginoferror function', () => {
    const testFunction = new Marginoferror(FUNCTION_NAMES_STATISTICAL.MARGINOFERROR);

    describe('Marginoferror', () => {
        it('Value is normal', () => {
            const range = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2],
                    [3, 4],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const confidence = NumberValueObject.create(0.1);
            const result = testFunction.calculate(range, confidence);
            expect(getObjectValue(result)).toBe(0.0881737585364693);
        });

        it('Range value test', () => {
            const range = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2.34, true, false, null],
                    [0, '100', 'test', -3, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const confidence = NumberValueObject.create(0.1);
            const result = testFunction.calculate(range, confidence);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const range2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, null],
                    [true, false],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(range2, confidence);
            expect(getObjectValue(result2)).toBe(ErrorType.DIV_BY_ZERO);
        });

        it('Confidence value test', () => {
            const range = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2],
                    [3, 4],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const confidence = NumberValueObject.create(-0.1);
            const result = testFunction.calculate(range, confidence);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const confidence2 = NullValueObject.create();
            const result2 = testFunction.calculate(range, confidence2);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);

            const confidence3 = BooleanValueObject.create(true);
            const result3 = testFunction.calculate(range, confidence3);
            expect(getObjectValue(result3)).toBe(ErrorType.NUM);

            const confidence4 = StringValueObject.create('test');
            const result4 = testFunction.calculate(range, confidence4);
            expect(getObjectValue(result4)).toBe(ErrorType.VALUE);

            const confidence5 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0.1, 0.2],
                ]),
                rowCount: 1,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result5 = testFunction.calculate(range, confidence5);
            expect(getObjectValue(result5)).toBe(ErrorType.VALUE);
        });

        it('Value stdev is 0', () => {
            const range = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 1],
                    [1, 1],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const confidence = NumberValueObject.create(0.1);
            const result = testFunction.calculate(range, confidence);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });
    });
});
