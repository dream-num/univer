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

import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Unique } from '../index';
import { BooleanValueObject, NullValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorType } from '../../../../basics/error-type';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test unique function', () => {
    const testFunction = new Unique(FUNCTION_NAMES_LOOKUP.UNIQUE);

    describe('Unique', () => {
        it('Value is normal', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 2],
                    [2, 2],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const resultObject = testFunction.calculate(array);
            expect(getObjectValue(resultObject)).toStrictEqual([
                [2, 2],
            ]);
        });

        it('ByCol value test', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 2],
                    [2, 2],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const byCol = BooleanValueObject.create(true);
            const resultObject = testFunction.calculate(array, byCol);
            expect(getObjectValue(resultObject)).toStrictEqual([
                [2],
                [2],
            ]);

            const byCol2 = NullValueObject.create();
            const resultObject2 = testFunction.calculate(array, byCol2);
            expect(getObjectValue(resultObject2)).toStrictEqual([
                [2, 2],
            ]);

            const byCol3 = StringValueObject.create('test');
            const resultObject3 = testFunction.calculate(array, byCol3);
            expect(getObjectValue(resultObject3)).toStrictEqual(ErrorType.VALUE);

            const byCol4 = ErrorValueObject.create(ErrorType.NAME);
            const resultObject4 = testFunction.calculate(array, byCol4);
            expect(getObjectValue(resultObject4)).toStrictEqual(ErrorType.NAME);
        });

        it('ExactlyOnce value test', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 2],
                    [2, 2],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const byCol = BooleanValueObject.create(false);
            const exactlyOnce = BooleanValueObject.create(true);
            const resultObject = testFunction.calculate(array, byCol, exactlyOnce);
            expect(getObjectValue(resultObject)).toStrictEqual(ErrorType.CALC);

            const exactlyOnce2 = NullValueObject.create();
            const resultObject2 = testFunction.calculate(array, byCol, exactlyOnce2);
            expect(getObjectValue(resultObject2)).toStrictEqual([
                [2, 2],
            ]);

            const exactlyOnce3 = StringValueObject.create('test');
            const resultObject3 = testFunction.calculate(array, byCol, exactlyOnce3);
            expect(getObjectValue(resultObject3)).toStrictEqual(ErrorType.VALUE);

            const exactlyOnce4 = ErrorValueObject.create(ErrorType.NAME);
            const resultObject4 = testFunction.calculate(array, byCol, exactlyOnce4);
            expect(getObjectValue(resultObject4)).toStrictEqual(ErrorType.NAME);
        });

        it('ByCol and exactlyOnce Value is array', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 2],
                    [2, 2],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const byCol = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['test', 1],
                    [null, false],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const exactlyOnce = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true, 0, null],
                    [1, 'test', null],
                    [null, null, null],
                ]),
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const resultObject = testFunction.calculate(array, byCol, exactlyOnce);
            expect(getObjectValue(resultObject)).toStrictEqual([
                [ErrorType.VALUE, 2, ErrorType.NA],
                [ErrorType.CALC, ErrorType.VALUE, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);
        });
    });
});
