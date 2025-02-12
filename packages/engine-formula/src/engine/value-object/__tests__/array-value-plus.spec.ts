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

import { ArrayValueObject, transformToValueObject } from '../array-value-object';
import { NumberValueObject } from '../primitive-object';
import { ErrorType } from '../../../basics/error-type';

describe('ArrayValueObject plus method test', () => {
    describe('Plus', () => {
        it('Origin nm, param 1', () => {
            const arrayValueObject = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, ErrorType.VALUE],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            const valueObject = new NumberValueObject(1);

            expect((arrayValueObject.plus(valueObject) as ArrayValueObject).toValue()).toStrictEqual([
                [2, ErrorType.VALUE, 2.23, 2, 1, 1],
                [1, 101, 3.34, ErrorType.VALUE, -2, ErrorType.VALUE],
            ]);
        });
    });
});
