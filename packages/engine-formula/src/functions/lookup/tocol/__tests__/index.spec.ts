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
import { NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Tocol } from '../index';

describe('Test tocol function', () => {
    const testFunction = new Tocol(FUNCTION_NAMES_LOOKUP.TOCOL);

    describe('Tocol', () => {
        it('Value is normal', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['Ben', 1, 'Mary', -2],
                    [true, ErrorType.NAME, null, 'James'],
                    [false, 'Harry', 1.23, '彭德威'],
                ]),
                rowCount: 3,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const ignore = NumberValueObject.create(3);
            const scanByColumn = NumberValueObject.create(0);
            const result = testFunction.calculate(array, ignore, scanByColumn);
            expect(getObjectValue(result)).toStrictEqual([
                ['Ben'],
                [1],
                ['Mary'],
                [-2],
                [true],
                ['James'],
                [false],
                ['Harry'],
                [1.23],
                ['彭德威'],
            ]);
        });

        it('Array value test', async () => {
            const array = ErrorValueObject.create(ErrorType.NAME);
            const ignore = NumberValueObject.create(3);
            const scanByColumn = NumberValueObject.create(0);
            const result = testFunction.calculate(array, ignore, scanByColumn);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);

            const array2 = NullValueObject.create();
            const result2 = testFunction.calculate(array2, ignore, scanByColumn);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.VALUE);

            const array3 = StringValueObject.create('test');
            const result3 = testFunction.calculate(array3, ignore, scanByColumn);
            expect(getObjectValue(result3)).toStrictEqual('test');

            const array4 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [ErrorType.NAME, null],
                ]),
                rowCount: 1,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result4 = testFunction.calculate(array4, ignore, scanByColumn);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.CALC);
        });

        it('Ignore value test', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['Ben', 1, 'Mary', -2],
                    [true, ErrorType.NAME, null, 'James'],
                    [false, 'Harry', 1.23, '彭德威'],
                ]),
                rowCount: 3,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const ignore = NumberValueObject.create(0);
            const scanByColumn = NumberValueObject.create(0);
            const result = testFunction.calculate(array, ignore, scanByColumn);
            expect(getObjectValue(result)).toStrictEqual([
                ['Ben'],
                [1],
                ['Mary'],
                [-2],
                [true],
                [ErrorType.NAME],
                [0],
                ['James'],
                [false],
                ['Harry'],
                [1.23],
                ['彭德威'],
            ]);

            const ignore2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(array, ignore2, scanByColumn);
            expect(getObjectValue(result2)).toStrictEqual([
                ['Ben'],
                [1],
                ['Mary'],
                [-2],
                [true],
                [ErrorType.NAME],
                ['James'],
                [false],
                ['Harry'],
                [1.23],
                ['彭德威'],
            ]);

            const ignore3 = NumberValueObject.create(2);
            const result3 = testFunction.calculate(array, ignore3, scanByColumn);
            expect(getObjectValue(result3)).toStrictEqual([
                ['Ben'],
                [1],
                ['Mary'],
                [-2],
                [true],
                [0],
                ['James'],
                [false],
                ['Harry'],
                [1.23],
                ['彭德威'],
            ]);

            const ignore4 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(array, ignore4, scanByColumn);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.NAME);

            const ignore5 = StringValueObject.create('test');
            const result5 = testFunction.calculate(array, ignore5, scanByColumn);
            expect(getObjectValue(result5)).toStrictEqual(ErrorType.VALUE);
        });

        it('ScanByColumn value test', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['Ben', 1, 'Mary', -2],
                    [true, ErrorType.NAME, null, 'James'],
                    [false, 'Harry', 1.23, '彭德威'],
                ]),
                rowCount: 3,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const ignore = NumberValueObject.create(3);
            const scanByColumn = NumberValueObject.create(1);
            const result = testFunction.calculate(array, ignore, scanByColumn);
            expect(getObjectValue(result)).toStrictEqual([
                ['Ben'],
                [true],
                [false],
                [1],
                ['Harry'],
                ['Mary'],
                [1.23],
                [-2],
                ['James'],
                ['彭德威'],
            ]);

            const scanByColumn2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(array, ignore, scanByColumn2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NAME);

            const scanByColumn3 = StringValueObject.create('test');
            const result3 = testFunction.calculate(array, ignore, scanByColumn3);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.VALUE);

            const scanByColumn4 = ArrayValueObject.create('{1,0,-1}');
            const result4 = testFunction.calculate(array, ignore, scanByColumn4);
            expect(getObjectValue(result4)).toStrictEqual([
                ['Ben', 'Ben', 'Ben'],
            ]);
        });
    });
});
