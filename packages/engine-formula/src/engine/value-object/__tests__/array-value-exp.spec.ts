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
import { getObjectValue } from '../../../functions/util';
import { ArrayValueObject, transformToValueObject } from '../array-value-object';

describe('arrayValueObject exp method test', () => {
    const originArrayValueObject = ArrayValueObject.create({
        calculateValueList: transformToValueObject([
            [1, ' ', 1.23, true, false],
            [0, '100', '2.34', 'test', -3],
        ]),
        rowCount: 2,
        columnCount: 5,
        unitId: '',
        sheetId: '',
        row: 0,
        column: 0,
    });

    describe('exp', () => {
        it('origin nm', () => {
            const result = originArrayValueObject.exp();

            expect(getObjectValue(result, true)).toStrictEqual([
                [2.71828182846, '#VALUE!', 3.42122953629, 2.71828182846, 1],
                [1, 2.6881171418161356e43, 10.3812365627, '#VALUE!', 0.0497870683679],
            ]);
        });
    });
});
