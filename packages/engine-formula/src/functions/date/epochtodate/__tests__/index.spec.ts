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
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_DATE } from '../../function-names';
import { Epochtodate } from '../index';

describe('Test epochtodate function', () => {
    const testFunction = new Epochtodate(FUNCTION_NAMES_DATE.EPOCHTODATE);

    describe('Epochtodate', () => {
        it('value is normal', () => {
            const timestamp = NumberValueObject.create(1655906710);
            const result = testFunction.calculate(timestamp);
            expect(getObjectValue(result)).toBe(44734.58692129629);
        });

        it('Timestamp value test', () => {
            const timestamp = NullValueObject.create();
            const result = testFunction.calculate(timestamp);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);

            const timestamp2 = StringValueObject.create('test');
            const result2 = testFunction.calculate(timestamp2);
            expect(getObjectValue(result2)).toBe(ErrorType.VALUE);

            const timestamp3 = BooleanValueObject.create(true);
            const result3 = testFunction.calculate(timestamp3);
            expect(getObjectValue(result3)).toBe(ErrorType.VALUE);

            const timestamp4 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(timestamp4);
            expect(getObjectValue(result4)).toBe(ErrorType.NAME);

            const timestamp5 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2],
                ]),
                rowCount: 1,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result5 = testFunction.calculate(timestamp5);
            expect(getObjectValue(result5)).toBe(ErrorType.VALUE);

            const timestamp6 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [-1],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result6 = testFunction.calculate(timestamp6);
            expect(getObjectValue(result6)).toBe(ErrorType.NUM);

            const timestamp7 = StringValueObject.create('50%');
            const result7 = testFunction.calculate(timestamp7);
            expect(getObjectValue(result7)).toBe(ErrorType.VALUE);
        });

        it('Unit value test', () => {
            const timestamp = NumberValueObject.create(1655906710);
            const unit = NumberValueObject.create(2);
            const result = testFunction.calculate(timestamp, unit);
            expect(getObjectValue(result)).toBe(25588.165586921295);

            const unit2 = NumberValueObject.create(3);
            const result2 = testFunction.calculate(timestamp, unit2);
            expect(getObjectValue(result2)).toBe(25569.019165578702);

            const unit3 = NullValueObject.create();
            const result3 = testFunction.calculate(timestamp, unit3);
            expect(getObjectValue(result3)).toBe(ErrorType.NUM);

            const unit4 = StringValueObject.create('test');
            const result4 = testFunction.calculate(timestamp, unit4);
            expect(getObjectValue(result4)).toBe(ErrorType.VALUE);

            const unit5 = BooleanValueObject.create(true);
            const result5 = testFunction.calculate(timestamp, unit5);
            expect(getObjectValue(result5)).toBe(44734.58692129629);

            const unit6 = ErrorValueObject.create(ErrorType.NAME);
            const result6 = testFunction.calculate(timestamp, unit6);
            expect(getObjectValue(result6)).toBe(ErrorType.NAME);

            const unit7 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2],
                ]),
                rowCount: 1,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result7 = testFunction.calculate(timestamp, unit7);
            expect(getObjectValue(result7)).toBe(ErrorType.VALUE);

            const unit8 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [-1],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result8 = testFunction.calculate(timestamp, unit8);
            expect(getObjectValue(result8)).toBe(ErrorType.NUM);
        });

        it('More test', () => {
            const timestamp = NumberValueObject.create(1656356678000410);
            const unit = NumberValueObject.create(1);
            const result = testFunction.calculate(timestamp, unit);
            expect(getObjectValue(result)).toBe(19170820453.264008);
        });
    });
});
