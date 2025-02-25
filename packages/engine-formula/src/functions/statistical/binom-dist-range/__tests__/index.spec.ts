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
import { BinomDistRange } from '../index';

describe('Test binomDistRange function', () => {
    const testFunction = new BinomDistRange(FUNCTION_NAMES_STATISTICAL.BINOM_DIST_RANGE);

    describe('BinomDistRange', () => {
        it('Value is normal', () => {
            const trials = NumberValueObject.create(60);
            const probabilityS = NumberValueObject.create(0.75);
            const numberS = NumberValueObject.create(45);
            const numberS2 = NumberValueObject.create(50);
            const result = testFunction.calculate(trials, probabilityS, numberS, numberS2);
            expect(getObjectValue(result)).toBe(0.5236297934718872);

            const result2 = testFunction.calculate(trials, probabilityS, numberS);
            expect(getObjectValue(result2)).toBe(0.11822800461154298);
        });

        it('Trials and numberS and numberS2 value test', () => {
            const trials = NumberValueObject.create(-60);
            const probabilityS = NumberValueObject.create(0.75);
            const numberS = NumberValueObject.create(45);
            const numberS2 = NumberValueObject.create(50);
            const result = testFunction.calculate(trials, probabilityS, numberS, numberS2);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const trials2 = NumberValueObject.create(60);
            const numberS3 = NumberValueObject.create(-45);
            const result2 = testFunction.calculate(trials2, probabilityS, numberS3, numberS2);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);

            const numberS4 = NumberValueObject.create(-50);
            const result3 = testFunction.calculate(trials2, probabilityS, numberS, numberS4);
            expect(getObjectValue(result3)).toBe(ErrorType.NUM);

            const numberS5 = NumberValueObject.create(65);
            const result4 = testFunction.calculate(trials2, probabilityS, numberS, numberS5);
            expect(getObjectValue(result4)).toBe(ErrorType.NUM);

            const result5 = testFunction.calculate(trials2, probabilityS, numberS5, numberS2);
            expect(getObjectValue(result5)).toBe(ErrorType.NUM);

            const result6 = testFunction.calculate(trials2, probabilityS, numberS2, numberS);
            expect(getObjectValue(result6)).toBe(ErrorType.NUM);
        });

        it('ProbabilityS value test', () => {
            const trials = NumberValueObject.create(60);
            const probabilityS = NumberValueObject.create(-0.75);
            const numberS = NumberValueObject.create(45);
            const numberS2 = NumberValueObject.create(50);
            const result = testFunction.calculate(trials, probabilityS, numberS, numberS2);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const probabilityS2 = NumberValueObject.create(1.75);
            const result2 = testFunction.calculate(trials, probabilityS2, numberS, numberS2);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);
        });

        it('Value is normal string', () => {
            const trials = StringValueObject.create('test');
            const probabilityS = NumberValueObject.create(0.75);
            const numberS = NumberValueObject.create(45);
            const numberS2 = NumberValueObject.create(50);
            const result = testFunction.calculate(trials, probabilityS, numberS, numberS2);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const trials = NumberValueObject.create(60);
            const probabilityS = NumberValueObject.create(0.75);
            const numberS = BooleanValueObject.create(true);
            const numberS2 = NumberValueObject.create(50);
            const result = testFunction.calculate(trials, probabilityS, numberS, numberS2);
            expect(getObjectValue(result)).toBe(0.9548325185075196);
        });

        it('Value is null', () => {
            const trials = NumberValueObject.create(60);
            const probabilityS = NumberValueObject.create(0.75);
            const numberS = NullValueObject.create();
            const numberS2 = NumberValueObject.create(50);
            const result = testFunction.calculate(trials, probabilityS, numberS, numberS2);
            expect(getObjectValue(result)).toBe(0.9548325185075196);

            const result2 = testFunction.calculate(trials, probabilityS, numberS2, numberS);
            expect(getObjectValue(result2)).toBe(0.04071929032886058);
        });

        it('Value is error', () => {
            const trials = ErrorValueObject.create(ErrorType.NAME);
            const probabilityS = NumberValueObject.create(0.75);
            const numberS = NumberValueObject.create(45);
            const numberS2 = NumberValueObject.create(50);
            const result = testFunction.calculate(trials, probabilityS, numberS, numberS2);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const trials2 = NumberValueObject.create(60);
            const probabilityS2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(trials2, probabilityS2, numberS, numberS2);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const numberS3 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(trials2, probabilityS, numberS3, numberS2);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);

            const result4 = testFunction.calculate(trials2, probabilityS, numberS, numberS3);
            expect(getObjectValue(result4)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const trials = NumberValueObject.create(60);
            const probabilityS = NumberValueObject.create(0.75);
            const numberS = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, null],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const numberS2 = NumberValueObject.create(50);
            const result = testFunction.calculate(trials, probabilityS, numberS, numberS2);
            expect(getObjectValue(result)).toStrictEqual([
                [0.9548325185075196, ErrorType.VALUE, 0.9548325185075196, 0.9548325185075196, 0.9548325185075196, 0.9548325185075196],
                [0.9548325185075196, ErrorType.NUM, 0.9548325185075196, ErrorType.VALUE, ErrorType.NUM, 0.9548325185075196],
            ]);
        });
    });
});
