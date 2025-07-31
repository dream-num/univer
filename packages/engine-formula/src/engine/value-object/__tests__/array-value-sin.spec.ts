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

describe('arrayValueObject sin method test', () => {
    describe('sin', () => {
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
            const result = tanArrayValueObject.sin();

            expect(getObjectValue(result, true)).toStrictEqual([
                [0.989358246623, 0.841470984808, '#VALUE!', 0.942488801932, 0.841470984808, 0],
                [0.956375928405, 0, -0.50636564111, 0.718464793069, '#VALUE!', -0.14112000806],
            ]);
        });
    });
});
