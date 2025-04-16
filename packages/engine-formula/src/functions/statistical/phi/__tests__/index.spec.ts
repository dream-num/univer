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
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Phi } from '../index';

describe('Test phi function', () => {
    const testFunction = new Phi(FUNCTION_NAMES_STATISTICAL.PHI);

    describe('Phi', () => {
        it('Value is normal', () => {
            const x = NumberValueObject.create(2.5);
            const result = testFunction.calculate(x);
            expect(getObjectValue(result)).toStrictEqual(0.01752830049356854);
        });

        it('Value is 0 or negative integers', () => {
            const x = NumberValueObject.create(0);
            const result = testFunction.calculate(x);
            expect(getObjectValue(result)).toStrictEqual(0.3989422804014327);

            const x2 = NumberValueObject.create(-1);
            const result2 = testFunction.calculate(x2);
            expect(getObjectValue(result2)).toStrictEqual(0.24197072451914337);
        });

        it('Value is number string', () => {
            const x = StringValueObject.create('4');
            const result = testFunction.calculate(x);
            expect(getObjectValue(result)).toStrictEqual(0.00013383022576488537);
        });

        it('Value is normal string', () => {
            const x = StringValueObject.create('test');
            const result = testFunction.calculate(x);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const x = BooleanValueObject.create(true);
            const result = testFunction.calculate(x);
            expect(getObjectValue(result)).toStrictEqual(0.24197072451914337);
        });

        it('Value is null', () => {
            const x = NullValueObject.create();
            const result = testFunction.calculate(x);
            expect(getObjectValue(result)).toStrictEqual(0.3989422804014327);
        });

        it('Value is error', () => {
            const x = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(x);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);
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
            const result = testFunction.calculate(x);
            expect(getObjectValue(result)).toStrictEqual([
                [0.24197072451914337, ErrorType.VALUE, 0.18723541817072956, 0.24197072451914337, 0.3989422804014327, 0.3989422804014327],
                [0.3989422804014327, 0, 0.02581657547158769, ErrorType.VALUE, 0.0044318484119380075, ErrorType.NAME],
            ]);

            const x2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0.123],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(x2);
            expect(getObjectValue(result2)).toStrictEqual(0.3959358668649187);
        });
    });
});
