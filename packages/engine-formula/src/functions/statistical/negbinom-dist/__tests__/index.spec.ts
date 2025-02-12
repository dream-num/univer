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
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { NegbinomDist } from '../index';

describe('Test negbinomDist function', () => {
    const testFunction = new NegbinomDist(FUNCTION_NAMES_STATISTICAL.NEGBINOM_DIST);

    describe('NegbinomDist', () => {
        it('Value is normal', () => {
            const numberF = NumberValueObject.create(6);
            const numberS = NumberValueObject.create(10);
            const probabilityS = NumberValueObject.create(0.5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(numberF, numberS, probabilityS, cumulative);
            expect(getObjectValue(result)).toBe(0.2272491455078125);
        });

        it('NumberF and numberS value test', () => {
            const numberF = NumberValueObject.create(-6);
            const numberS = NumberValueObject.create(10);
            const probabilityS = NumberValueObject.create(0.5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(numberF, numberS, probabilityS, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const numberF2 = NumberValueObject.create(11);
            const numberS2 = NumberValueObject.create(0.1);
            const result2 = testFunction.calculate(numberF2, numberS2, probabilityS, cumulative);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);
        });

        it('ProbabilityS value test', () => {
            const numberF = NumberValueObject.create(6);
            const numberS = NumberValueObject.create(10);
            const probabilityS = NumberValueObject.create(-0.5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(numberF, numberS, probabilityS, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const probabilityS2 = NumberValueObject.create(1.5);
            const result2 = testFunction.calculate(numberF, numberS, probabilityS2, cumulative);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);

            const probabilityS3 = NumberValueObject.create(0);
            const result3 = testFunction.calculate(numberF, numberS, probabilityS3, cumulative);
            expect(getObjectValue(result3)).toBe(ErrorType.NUM);

            const probabilityS4 = NumberValueObject.create(1);
            const result4 = testFunction.calculate(numberF, numberS, probabilityS4, cumulative);
            expect(getObjectValue(result4)).toBe(ErrorType.NUM);
        });

        it('Cumulative value test', () => {
            const numberF = NumberValueObject.create(6);
            const numberS = NumberValueObject.create(10);
            const probabilityS = NumberValueObject.create(0.5);
            const cumulative = BooleanValueObject.create(false);
            const result = testFunction.calculate(numberF, numberS, probabilityS, cumulative);
            expect(getObjectValue(result)).toBe(0.0763702392578125);

            const numberF2 = NumberValueObject.create(0);
            const numberS2 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(numberF2, numberS2, probabilityS, cumulative);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);

            const numberF3 = NumberValueObject.create(1);
            const numberS3 = NumberValueObject.create(1);
            const result3 = testFunction.calculate(numberF3, numberS3, probabilityS, cumulative);
            expect(getObjectValue(result3)).toBe(0.25);
        });

        it('Value is normal string', () => {
            const numberF = StringValueObject.create('test');
            const numberS = NumberValueObject.create(10);
            const probabilityS = NumberValueObject.create(0.5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(numberF, numberS, probabilityS, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const numberF = BooleanValueObject.create(true);
            const numberS = NumberValueObject.create(10);
            const probabilityS = NumberValueObject.create(0.5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(numberF, numberS, probabilityS, cumulative);
            expect(getObjectValue(result)).toBe(0.005859375);
        });

        it('Value is null', () => {
            const numberF = NullValueObject.create();
            const numberS = NumberValueObject.create(10);
            const probabilityS = NumberValueObject.create(0.5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(numberF, numberS, probabilityS, cumulative);
            expect(getObjectValue(result)).toBe(0.0009765625);
        });

        it('Value is error', () => {
            const numberF = ErrorValueObject.create(ErrorType.NAME);
            const numberS = NumberValueObject.create(10);
            const probabilityS = NumberValueObject.create(0.5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(numberF, numberS, probabilityS, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const numberF2 = NumberValueObject.create(6);
            const numberS2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(numberF2, numberS2, probabilityS, cumulative);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const probabilityS2 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(numberF2, numberS, probabilityS2, cumulative);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);

            const cumulative2 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(numberF2, numberS, probabilityS, cumulative2);
            expect(getObjectValue(result4)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const numberF = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const numberS = NumberValueObject.create(10);
            const probabilityS = NumberValueObject.create(0.5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(numberF, numberS, probabilityS, cumulative);
            expect(getObjectValue(result)).toStrictEqual([
                [0.005859375, ErrorType.VALUE, 0.005859375, 0.005859375, 0.0009765625, 0.0009765625],
                [0.0009765625, 0.9999999999999999, 0.019287109375, ErrorType.VALUE, ErrorType.NUM, ErrorType.NAME],
            ]);
        });
    });
});
