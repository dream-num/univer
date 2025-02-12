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

describe('arrayValueObject log10 method test', () => {
    const originArrayValueObject = ArrayValueObject.create({
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

    describe('log10', () => {
        it('origin nm', () => {
            expect((originArrayValueObject.log10() as ArrayValueObject).toValue()).toStrictEqual([
                [0.9030899869919435, 0, '#VALUE!', 0.08990511143939792, 0, '#NUM!'],
                [1.4313637641589874, '#NUM!', 2, 0.36921585741014284, '#VALUE!', '#NUM!'],
            ]);
        });
    });
});
