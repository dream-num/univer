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
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_LOGICAL } from '../../function-names';
import { Ifna } from '../index';

describe('Test ifna function', () => {
    let injector: Injector;
    let textFunction: Ifna;

    beforeEach(() => {
        injector = new Injector([
            [Ifna, { useFactory: () => injector.createInstance(Ifna, FUNCTION_NAMES_LOGICAL.IFNA) }],
        ]);
        textFunction = injector.get(Ifna);
    });

    afterEach(() => injector.dispose());

    it('coerces array blanks without changing scalar blanks or its input', () => {
        const value = ArrayValueObject.create({ calculateValueList: transformToValueObject([[null], [''], [false], [0]]), rowCount: 4, columnCount: 1, unitId: '', sheetId: '', row: 0, column: 0 });
        const result = textFunction.calculate(value, NumberValueObject.create(99)) as ArrayValueObject;
        expect(transformToValue(result.getArrayValue())).toEqual([[0], [''], [false], [0]]);
        expect(value.getFirstCell().isNull()).toBe(true);
        expect(textFunction.calculate(NullValueObject.create(), NumberValueObject.create(99)).isNull()).toBe(true);
    });

    it('ignores an unused error fallback and replaces missing array positions', () => {
        expect(textFunction.calculate(NumberValueObject.create(1), ErrorValueObject.create(ErrorType.NA)).getValue()).toBe(1);
        const result = textFunction.calculate(ArrayValueObject.create('{1;2}'), ArrayValueObject.create('{99;99;99}')) as ArrayValueObject;
        expect(transformToValue(result.getArrayValue())).toEqual([[1], [2], [99]]);
    });

    describe('Ifna', () => {
        it('Value is normal', () => {
            const value = NumberValueObject.create(1);
            const valueIfNa = StringValueObject.create('N/A');
            const result = textFunction.calculate(value, valueIfNa);
            expect(result.getValue()).toBe(1);
        });

        it('Value is #N/A error', () => {
            const value = ErrorValueObject.create(ErrorType.NA);
            const valueIfNa = StringValueObject.create('N/A');
            const result = textFunction.calculate(value, valueIfNa);
            expect(result.getValue()).toBe('N/A');
        });

        it('Value is another error type', () => {
            const value = ErrorValueObject.create(ErrorType.VALUE);
            const valueIfNa = StringValueObject.create('N/A');
            const result = textFunction.calculate(value, valueIfNa);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is array with #N/A error', () => {
            const value = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    ['#N/A'],
                    [3],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const valueIfNa = StringValueObject.create('N/A');
            const result = textFunction.calculate(value, valueIfNa);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [1],
                ['N/A'],
                [3],
            ]);
        });

        it('Value is array and valueIfNa is array', () => {
            const value = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, '#N/A', 3],
                    ['#N/A', 5, '#N/A'],
                ]),
                rowCount: 2,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const valueIfNa = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['a1', 'a2', 'a3'],
                    ['b1', 'b2', 'b3'],
                ]),
                rowCount: 2,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = textFunction.calculate(value, valueIfNa);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [1, 'a2', 3],
                ['b1', 5, 'b3'],
            ]);
        });
    });
});
