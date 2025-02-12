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

            expect((tanArrayValueObject.tan() as ArrayValueObject).toValue()).toStrictEqual([
                [-6.799711455220379, 1.5574077246549023, '#VALUE!', 2.819815734268152, 1.5574077246549023, 0],
                [-3.273703800428119, 0, -0.5872139151569291, -1.032925063376592, '#VALUE!', 0.1425465430742778],
            ]);
        });
    });
});
