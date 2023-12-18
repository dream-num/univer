/**
 * Copyright 2023-present DreamNum Inc.
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

/* eslint-disable no-magic-numbers */
import { describe, expect, it } from 'vitest';

import { ArrayValueObject, transformToValueObject, ValueObjectFactory } from '../array-value-object';
import type { BooleanValueObject, NumberValueObject } from '../primitive-object';

describe('arrayValueObject test', () => {
    const originArrayValueObject = new ArrayValueObject({
        calculateValueList: transformToValueObject([
            [1, 2, 3, 4, 5],
            [6, 7, 8, 9, 10],
            [11, 12, 13, 14, 15],
        ]),
        rowCount: 3,
        columnCount: 5,
        unitId: '',
        sheetId: '',
        row: 0,
        column: 0,
    });

    describe('slice', () => {
        it('row==null;column=2,,', () => {
            expect(originArrayValueObject.slice(null, [2]).toValue()).toStrictEqual([
                [3, 4, 5],
                [8, 9, 10],
                [13, 14, 15],
            ]);
        });

        it('row==2,,;column=2,,', () => {
            expect(originArrayValueObject.slice([2], [2]).toValue()).toStrictEqual([[13, 14, 15]]);
        });

        it('row==,,2;column=2,,', () => {
            expect(originArrayValueObject.slice([undefined, undefined, 2], [2]).toValue()).toStrictEqual([
                [3, 4, 5],
                [13, 14, 15],
            ]);
        });

        it('row==1,,;column=null', () => {
            expect(originArrayValueObject.slice([1]).toValue()).toStrictEqual([
                [6, 7, 8, 9, 10],
                [11, 12, 13, 14, 15],
            ]);
        });

        it('row==0,1,;column=,,2', () => {
            expect(originArrayValueObject.slice([0, 1], [undefined, undefined, 2]).toValue()).toStrictEqual([
                [1, 3, 5],
                [6, 8, 10],
            ]);
        });
    });

    describe('pick', () => {
        it('normal', () => {
            const pickArrayValueObject = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [true, false, false, true, false],
                    [true, false, true, false, false],
                    [true, false, true, false, false],
                ]),
                rowCount: 3,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            expect(originArrayValueObject.pick(pickArrayValueObject).toValue()).toStrictEqual([[1, 4, 6, 8, 11, 13]]);
        });

        it('not boolean', () => {
            const pickArrayValueObject = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [true, false, false, 1, false],
                    [true, false, 1, false, false],
                    [true, false, 1, false, false],
                ]),
                rowCount: 3,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            expect(originArrayValueObject.pick(pickArrayValueObject).toValue()).toStrictEqual([[1, 6, 11]]);
        });

        it('pick and sum', () => {
            const pickArrayValueObject = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [true, false, false, true, false],
                    [true, false, true, false, false],
                    [true, false, true, false, false],
                ]),
                rowCount: 3,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            expect(originArrayValueObject.pick(pickArrayValueObject).sum().getValue()).toStrictEqual(43);
        });
    });

    describe('var', () => {
        it('normal', () => {
            expect(originArrayValueObject.var().getValue()).toStrictEqual(18.666666666666668);
        });
    });

    describe('std', () => {
        it('normal', () => {
            expect(originArrayValueObject.std().getValue()).toStrictEqual(4.320493798938574);
        });
    });

    describe('ValueObjectFactory', () => {
        it('ValueObjectFactory create BooleanValueObject ', () => {
            let booleanValueObject = ValueObjectFactory.create(true);

            expect((booleanValueObject as BooleanValueObject).isBoolean()).toBeTruthy();

            booleanValueObject = ValueObjectFactory.create(false);

            expect((booleanValueObject as BooleanValueObject).isBoolean()).toBeTruthy();

            booleanValueObject = ValueObjectFactory.create('true');

            expect((booleanValueObject as BooleanValueObject).isBoolean()).toBeTruthy();

            booleanValueObject = ValueObjectFactory.create('false');

            expect((booleanValueObject as BooleanValueObject).isBoolean()).toBeTruthy();
            booleanValueObject = ValueObjectFactory.create('TRUE');

            expect((booleanValueObject as BooleanValueObject).isBoolean()).toBeTruthy();

            booleanValueObject = ValueObjectFactory.create('FALSE');

            expect((booleanValueObject as BooleanValueObject).isBoolean()).toBeTruthy();
        });
        it('ValueObjectFactory create NumberValueObject ', () => {
            let numberValueObject = ValueObjectFactory.create(1);

            expect((numberValueObject as NumberValueObject).isNumber()).toBeTruthy();

            numberValueObject = ValueObjectFactory.create(0);

            expect((numberValueObject as NumberValueObject).isNumber()).toBeTruthy();
            numberValueObject = ValueObjectFactory.create(-1);

            expect((numberValueObject as NumberValueObject).isNumber()).toBeTruthy();

            numberValueObject = ValueObjectFactory.create('1');

            expect((numberValueObject as NumberValueObject).isNumber()).toBeTruthy();

            numberValueObject = ValueObjectFactory.create(1e2);

            expect((numberValueObject as NumberValueObject).isNumber()).toBeTruthy();

            numberValueObject = ValueObjectFactory.create('1e2');

            expect((numberValueObject as NumberValueObject).isNumber()).toBeTruthy();
        });

        it('ValueObjectFactory create ArrayValueObject ', () => {
            let arrayValueObject = ValueObjectFactory.create('{1,2,3;4,5,6}');

            expect((arrayValueObject as ArrayValueObject).isArray()).toBeTruthy();

            arrayValueObject = ValueObjectFactory.create('{1,2,3;4,5,6}');

            expect((arrayValueObject as ArrayValueObject).isArray()).toBeTruthy();
        });

        it('ValueObjectFactory create StringValueObject ', () => {
            const stringValueObject = ValueObjectFactory.create('test');

            expect(stringValueObject.isString()).toBeTruthy();
        });

        it('ValueObjectFactory create ErrorValueObject ', () => {
            let errorValueObject = ValueObjectFactory.create(NaN);

            expect(errorValueObject.isError()).toBeTruthy();

            errorValueObject = ValueObjectFactory.create(Infinity);

            expect(errorValueObject.isError()).toBeTruthy();

            errorValueObject = ValueObjectFactory.create(-Infinity);

            expect(errorValueObject.isError()).toBeTruthy();
        });
    });
});
