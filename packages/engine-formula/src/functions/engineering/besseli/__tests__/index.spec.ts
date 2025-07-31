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
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_ENGINEERING } from '../../function-names';
import { Besseli } from '../index';

describe('Test besseli function', () => {
    const testFunction = new Besseli(FUNCTION_NAMES_ENGINEERING.BESSELI);

    describe('Besseli', () => {
        it('Value is normal number', () => {
            const x = NumberValueObject.create(1.5);
            const n = NumberValueObject.create(1);
            const result = testFunction.calculate(x, n);
            expect(getObjectValue(result, true)).toBe(0.981666428475);
        });

        it('n < 0 || x === Infinity', () => {
            const x = NumberValueObject.create(1.5);
            const n = NumberValueObject.create(-1);
            const result = testFunction.calculate(x, n);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const x2 = NumberValueObject.create(Infinity);
            const n2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(x2, n2);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);
        });

        it('Value is number string', () => {
            const x = StringValueObject.create('-0.5');
            const n = NumberValueObject.create(1);
            const result = testFunction.calculate(x, n);
            expect(getObjectValue(result, true)).toBe(-0.257894303289);
        });

        it('Value is normal string', () => {
            const x = StringValueObject.create('test');
            const n = NumberValueObject.create(1);
            const result = testFunction.calculate(x, n);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const x = BooleanValueObject.create(true);
            const n = NumberValueObject.create(1);
            const result = testFunction.calculate(x, n);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is null', () => {
            const x = NullValueObject.create();
            const n = NumberValueObject.create(1);
            const result = testFunction.calculate(x, n);
            expect(getObjectValue(result)).toBe(ErrorType.NA);
        });

        it('Value is blank cell', () => {
            const x = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const n = NumberValueObject.create(1);
            const result = testFunction.calculate(x, n);
            expect(getObjectValue(result)).toBe(0);
        });

        it('Value is error', () => {
            const x = ErrorValueObject.create(ErrorType.NAME);
            const n = NumberValueObject.create(1);
            const result = testFunction.calculate(x, n);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const x = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const n = NumberValueObject.create(1);
            const result = testFunction.calculate(x, n);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);
        });
    });
});
