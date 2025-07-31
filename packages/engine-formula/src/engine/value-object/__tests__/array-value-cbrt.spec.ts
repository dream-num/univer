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

describe('arrayValueObject cbrt method test', () => {
    describe('cbrt', () => {
        it('origin nm, param nm', () => {
            const cbrtArrayValueObject = ArrayValueObject.create({
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
            const result = cbrtArrayValueObject.cbrt();

            expect(getObjectValue(result, true)).toStrictEqual([
                [2, 1, '#VALUE!', 1.07144126969, 1, 0],
                [3, 0, 4.64158883361, 1.32761439426, '#VALUE!', -1.44224957031],
            ]);
        });
    });
});
