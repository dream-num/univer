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

describe('arrayValueObject tan method test', () => {
    describe('tan', () => {
        it('origin nm, param nm', () => {
            const tanArrayValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [8, 1, ' ', 1.23, true, false],
                    [27, 0, '100', '2.34', 'test', -3],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = tanArrayValueObject.tan();

            expect(getObjectValue(result, true)).toStrictEqual([
                [-6.79971145522, 1.55740772465, '#VALUE!', 2.81981573427, 1.55740772465, 0],
                [-3.27370380043, 0, -0.587213915157, -1.03292506338, '#VALUE!', 0.142546543074],
            ]);
        });
    });
});
