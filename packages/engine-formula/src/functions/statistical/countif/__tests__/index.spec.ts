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
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Countif } from '../index';
import { StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test countif function', () => {
    const testFunction = new Countif(FUNCTION_NAMES_STATISTICAL.COUNTIF);

    describe('Countif', () => {
        it('Range and criteria', async () => {
            const range = ArrayValueObject.create(/*ts*/ `{
                1;
                4;
                44;
                444;
                Univer
            }`);

            const criteria = StringValueObject.create('>40');

            const resultObject = testFunction.calculate(range, criteria);
            expect(resultObject.getValue()).toBe(2);
        });

        it('Average range with wildcard asterisk', async () => {
            const range = ArrayValueObject.create(/*ts*/ `{
                Ada;
                test1;
                test12;
                Univer
            }`);

            const criteria = StringValueObject.create('test*');

            const resultObject = testFunction.calculate(range, criteria);
            expect(resultObject.getValue()).toBe(2);
        });

        it('Average range with boolean', async () => {
            const range = ArrayValueObject.create(/*ts*/ `{
                TRUE;
                FALSE
            }`);

            const criteria = StringValueObject.create('>FALSE');

            const resultObject = testFunction.calculate(range, criteria);
            expect(resultObject.getValue()).toBe(1);
        });

        it('ArrayValueObject range and ArrayValueObject criteria', async () => {
            const range = ArrayValueObject.create(/*ts*/ `{
                1;
                4;
                44;
                444
            }`);

            const criteria = ArrayValueObject.create(/*ts*/ `{
                4;
                4;
                44;
                444
            }`);

            const resultObject = testFunction.calculate(range, criteria);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[1], [1], [1], [1]]);
        });

        it('ArrayValueObject range and ArrayValueObject criteria multi type cell', async () => {
            const range = ArrayValueObject.create({
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

            const criteria = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['>1', '> ', '>1.23', '>true', '>false', '>'],
                    ['>0', '>100', '>2.34', '>test', '>-3', ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            const resultObject = testFunction.calculate(range, criteria);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[3, 1, 2, 0, 1, 0], [4, 0, 1, 0, 5, 1]]);
        });

        it('ArrayValueObject range equals ArrayValueObject criteria multi types cell', async () => {
            const range = ArrayValueObject.create({
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

            const criteria = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['=1', '= ', '=1.23', '=true', '=false', '=0'],
                    ['=0', '=100', '=2.34', '=test', '=-3', ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            const resultObject = testFunction.calculate(range, criteria);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([
                [1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1],
            ]);
        });
    });
});
