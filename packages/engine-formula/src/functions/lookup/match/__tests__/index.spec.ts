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
import {
    NumberValueObject,
} from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Match } from '../index';
import { ErrorType } from '../../../../basics/error-type';

describe('Test match', () => {
    const testFunction = new Match(FUNCTION_NAMES_LOOKUP.MATCH);

    describe('The value of the match', () => {
        it('LookupArray asc, default matchType', async () => {
            const lookupValue = NumberValueObject.create(5);
            const lookupArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 3, 6, 7],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            const resultObject = testFunction.calculate(lookupValue, lookupArray);
            expect(resultObject.getValue()).toBe(2);
        });
        it('LookupArray asc, matchType is 1', async () => {
            const lookupValue = NumberValueObject.create(5);
            const lookupArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 3, 6, 7],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const matchType = NumberValueObject.create(1);

            const resultObject = testFunction.calculate(lookupValue, lookupArray, matchType);
            expect(resultObject.getValue()).toBe(2);
        });
        it('LookupArray desc, matchType is 1', async () => {
            const lookupValue = NumberValueObject.create(5);
            const lookupArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [7, 6, 3, 2],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const matchType = NumberValueObject.create(1);

            const resultObject = testFunction.calculate(lookupValue, lookupArray, matchType);

            // FIXME: fix this test
            // expect(resultObject.getValue()).toBe(ErrorType.NA);
        });

        it('LookupArray asc, matchType is 0', async () => {
            const lookupValue = NumberValueObject.create(5);
            const lookupArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 3, 6, 7],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const matchType = NumberValueObject.create(0);

            const resultObject = testFunction.calculate(lookupValue, lookupArray, matchType);
            expect(resultObject.getValue()).toBe(ErrorType.NA);
        });

        it('LookupArray asc, matchType is -1', async () => {
            const lookupValue = NumberValueObject.create(5);
            const lookupArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 3, 6, 7],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const matchType = NumberValueObject.create(-1);

            const resultObject = testFunction.calculate(lookupValue, lookupArray, matchType);

             // FIXME: fix this test
            // expect(resultObject.getValue()).toBe(ErrorType.NA);
        });
        it('LookupArray desc, matchType is -1', async () => {
            const lookupValue = NumberValueObject.create(5);
            const lookupArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [7, 6, 3, 2],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const matchType = NumberValueObject.create(-1);

            const resultObject = testFunction.calculate(lookupValue, lookupArray, matchType);

            expect(resultObject.getValue()).toBe(2);
        });
    });
});
