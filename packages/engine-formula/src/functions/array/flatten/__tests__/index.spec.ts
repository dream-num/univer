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
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_ARRAY } from '../../function-names';
import { Flatten } from '../index';

describe('Test flatten function', () => {
    const testFunction = new Flatten(FUNCTION_NAMES_ARRAY.FLATTEN);

    describe('Flatten', () => {
        it('Value is normal', () => {
            const range1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3],
                ]),
                rowCount: 1,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const range2 = NumberValueObject.create(4);
            const result = testFunction.calculate(range1, range2);
            expect(getObjectValue(result)).toStrictEqual([
                [1],
                [2],
                [3],
                [4],
            ]);
        });

        it('Value is array', () => {
            const range1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, true, false, null],
                    [0, '100', -3, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const range2 = StringValueObject.create('test');
            const result = testFunction.calculate(range1, range2);
            expect(getObjectValue(result)).toStrictEqual([
                [1],
                [true],
                [false],
                [0],
                [0],
                [100],
                [-3],
                [ErrorType.NAME],
                ['test'],
            ]);
        });
    });
});
