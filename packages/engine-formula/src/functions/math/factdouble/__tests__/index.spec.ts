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

import { Injector } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ErrorType } from '../../../../basics/error-type';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Factdouble } from '../index';

describe('Test factdouble function', () => {
    let injector: Injector;
    let testFunction: Factdouble;

    beforeEach(() => {
        injector = new Injector([
            [Factdouble, { useFactory: () => injector.createInstance(Factdouble, FUNCTION_NAMES_MATH.FACTDOUBLE) }],
        ]);
        testFunction = injector.get(Factdouble);
    });

    afterEach(() => injector.dispose());

    describe('Factdouble', () => {
        it('Value is normal number', () => {
            const number = NumberValueObject.create(8);
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toBe(384);
        });

        it('Value is big number', () => {
            const number = NumberValueObject.create(1000000);
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is number negative', () => {
            const number = NumberValueObject.create(-8);
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
            expect(getObjectValue(testFunction.calculate(NumberValueObject.create(-1)))).toBe(1);
            expect(getObjectValue(testFunction.calculate(NumberValueObject.create(-1.9)))).toBe(ErrorType.NUM);
        });

        it('Value is number string', () => {
            const number = StringValueObject.create('1.5');
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toBe(1);
        });

        it('Value is normal string', () => {
            const number = StringValueObject.create('test');
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const number = BooleanValueObject.create(true);
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });
        it('Value is blank cell', () => {
            const number = NullValueObject.create();
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toBe(1);
        });
        it('Value is error', () => {
            const number = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const number = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '6', '2.34', 'test', -3, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual([
                [1, ErrorType.VALUE, 1, ErrorType.VALUE, ErrorType.VALUE, 1],
                [1, 48, 2, ErrorType.VALUE, ErrorType.NUM, ErrorType.NAME],
            ]);

            const number2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [3],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(number2);
            expect(getObjectValue(result2)).toStrictEqual(3);
        });
    });
});
