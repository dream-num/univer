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
import { FUNCTION_NAMES_COMPATIBILITY } from '../../function-names';
import { Hypgeomdist } from '../index';

describe('Test hypgeomdist function', () => {
    const testFunction = new Hypgeomdist(FUNCTION_NAMES_COMPATIBILITY.HYPGEOMDIST);

    describe('Hypgeomdist', () => {
        it('Value is normal', () => {
            const sampleS = NumberValueObject.create(1);
            const numberSample = NumberValueObject.create(4);
            const populationS = NumberValueObject.create(8);
            const numberPop = NumberValueObject.create(20);
            const result = testFunction.calculate(sampleS, numberSample, populationS, numberPop);
            expect(getObjectValue(result)).toBe(0.3632610939112487);
        });

        it('Value is large number', () => {
            const sampleS = NumberValueObject.create(1);
            const numberSample = NumberValueObject.create(100000);
            const populationS = NumberValueObject.create(1000000);
            const numberPop = NumberValueObject.create(10000000);
            const result = testFunction.calculate(sampleS, numberSample, populationS, numberPop);
            expect(getObjectValue(result)).toBe(0);
        });

        it('SampleS value test', () => {
            const sampleS = NumberValueObject.create(-1);
            const numberSample = NumberValueObject.create(4);
            const populationS = NumberValueObject.create(8);
            const numberPop = NumberValueObject.create(20);
            const result = testFunction.calculate(sampleS, numberSample, populationS, numberPop);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const sampleS2 = NumberValueObject.create(5);
            const result2 = testFunction.calculate(sampleS2, numberSample, populationS, numberPop);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);

            const sampleS3 = BooleanValueObject.create(true);
            const result3 = testFunction.calculate(sampleS3, numberSample, populationS, numberPop);
            expect(getObjectValue(result3)).toBe(0.3632610939112487);

            const sampleS4 = NullValueObject.create();
            const result4 = testFunction.calculate(sampleS4, numberSample, populationS, numberPop);
            expect(getObjectValue(result4)).toBe(0.1021671826625387);

            const sampleS5 = StringValueObject.create('test');
            const result5 = testFunction.calculate(sampleS5, numberSample, populationS, numberPop);
            expect(getObjectValue(result5)).toBe(ErrorType.VALUE);

            const sampleS6 = ErrorValueObject.create(ErrorType.NAME);
            const result6 = testFunction.calculate(sampleS6, numberSample, populationS, numberPop);
            expect(getObjectValue(result6)).toBe(ErrorType.NAME);
        });

        it('NumberSample value test', () => {
            const sampleS = NumberValueObject.create(1);
            const numberSample = NumberValueObject.create(-1);
            const populationS = NumberValueObject.create(8);
            const numberPop = NumberValueObject.create(20);
            const result = testFunction.calculate(sampleS, numberSample, populationS, numberPop);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const numberSample2 = NumberValueObject.create(22);
            const result2 = testFunction.calculate(sampleS, numberSample2, populationS, numberPop);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);

            const numberSample3 = BooleanValueObject.create(true);
            const result3 = testFunction.calculate(sampleS, numberSample3, populationS, numberPop);
            expect(getObjectValue(result3)).toBe(0.4);

            const numberSample4 = NullValueObject.create();
            const result4 = testFunction.calculate(sampleS, numberSample4, populationS, numberPop);
            expect(getObjectValue(result4)).toBe(ErrorType.NUM);

            const numberSample5 = StringValueObject.create('test');
            const result5 = testFunction.calculate(sampleS, numberSample5, populationS, numberPop);
            expect(getObjectValue(result5)).toBe(ErrorType.VALUE);

            const numberSample6 = ErrorValueObject.create(ErrorType.NAME);
            const result6 = testFunction.calculate(sampleS, numberSample6, populationS, numberPop);
            expect(getObjectValue(result6)).toBe(ErrorType.NAME);
        });

        it('PopulationS value test', () => {
            const sampleS = NumberValueObject.create(1);
            const numberSample = NumberValueObject.create(4);
            const populationS = NumberValueObject.create(-1);
            const numberPop = NumberValueObject.create(20);
            const result = testFunction.calculate(sampleS, numberSample, populationS, numberPop);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const populationS2 = NumberValueObject.create(21);
            const result2 = testFunction.calculate(sampleS, numberSample, populationS2, numberPop);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);

            const populationS3 = BooleanValueObject.create(true);
            const result3 = testFunction.calculate(sampleS, numberSample, populationS3, numberPop);
            expect(getObjectValue(result3)).toBe(0.2);

            const populationS4 = NullValueObject.create();
            const result4 = testFunction.calculate(sampleS, numberSample, populationS4, numberPop);
            expect(getObjectValue(result4)).toBe(ErrorType.NUM);

            const populationS5 = StringValueObject.create('test');
            const result5 = testFunction.calculate(sampleS, numberSample, populationS5, numberPop);
            expect(getObjectValue(result5)).toBe(ErrorType.VALUE);

            const populationS6 = ErrorValueObject.create(ErrorType.NAME);
            const result6 = testFunction.calculate(sampleS, numberSample, populationS6, numberPop);
            expect(getObjectValue(result6)).toBe(ErrorType.NAME);
        });

        it('NumberPop value test', () => {
            const sampleS = NumberValueObject.create(1);
            const numberSample = NumberValueObject.create(4);
            const populationS = NumberValueObject.create(8);
            const numberPop = NumberValueObject.create(-20);
            const result = testFunction.calculate(sampleS, numberSample, populationS, numberPop);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const numberPop2 = BooleanValueObject.create(true);
            const result2 = testFunction.calculate(sampleS, numberSample, populationS, numberPop2);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);

            const numberPop3 = NullValueObject.create();
            const result3 = testFunction.calculate(sampleS, numberSample, populationS, numberPop3);
            expect(getObjectValue(result3)).toBe(ErrorType.NUM);

            const numberPop4 = StringValueObject.create('test');
            const result4 = testFunction.calculate(sampleS, numberSample, populationS, numberPop4);
            expect(getObjectValue(result4)).toBe(ErrorType.VALUE);

            const numberPop5 = ErrorValueObject.create(ErrorType.NAME);
            const result5 = testFunction.calculate(sampleS, numberSample, populationS, numberPop5);
            expect(getObjectValue(result5)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const sampleS = ArrayValueObject.create({
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
            const numberSample = NumberValueObject.create(4);
            const populationS = NumberValueObject.create(8);
            const numberPop = NumberValueObject.create(20);
            const result = testFunction.calculate(sampleS, numberSample, populationS, numberPop);
            expect(getObjectValue(result)).toStrictEqual([
                [0.3632610939112487, ErrorType.VALUE, 0.3632610939112487, 0.3632610939112487, 0.1021671826625387, 0.1021671826625387],
                [0.1021671826625387, ErrorType.NUM, 0.3814241486068111, ErrorType.VALUE, ErrorType.NUM, ErrorType.NAME],
            ]);

            const sampleS2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    [4],
                    [8],
                    [20],
                ]),
                rowCount: 4,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const numberSample2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [4],
                    [8],
                    [20],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(sampleS2, numberSample2, populationS, numberPop);
            expect(getObjectValue(result2)).toStrictEqual([
                [0.3632610939112487],
                [0.27506549178375805],
                [1],
                [ErrorType.NA],
            ]);
        });

        it('More test', () => {
            const sampleS = NumberValueObject.create(20);
            const numberSample = NumberValueObject.create(20);
            const populationS = NumberValueObject.create(20);
            const numberPop = NumberValueObject.create(20);
            const result = testFunction.calculate(sampleS, numberSample, populationS, numberPop);
            expect(getObjectValue(result)).toBe(1);
        });
    });
});
