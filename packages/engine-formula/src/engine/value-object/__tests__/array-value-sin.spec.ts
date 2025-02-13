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

            expect((tanArrayValueObject.sin() as ArrayValueObject).toValue()).toStrictEqual([
                [0.9893582466233818, 0.8414709848078965, '#VALUE!', 0.9424888019316975, 0.8414709848078965, 0],
                [0.956375928404503, 0, -0.5063656411097588, 0.7184647930691261, '#VALUE!', -0.1411200080598672],
            ]);
        });
    });
});
