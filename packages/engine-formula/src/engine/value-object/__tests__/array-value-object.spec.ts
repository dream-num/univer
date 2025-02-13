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

import type { Nullable } from '@univerjs/core';
import { ArrayValueObject, transformToValueObject, ValueObjectFactory } from '../array-value-object';
import { BooleanValueObject, NumberValueObject } from '../primitive-object';
import type { BaseValueObject } from '../base-value-object';
import { ErrorValueObject } from '../base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { stripErrorMargin } from '../../utils/math-kit';

describe('arrayValueObject test', () => {
    const originArrayValueObject = ArrayValueObject.create({
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
            expect(originArrayValueObject.slice(null, [2])?.toValue()).toStrictEqual([
                [3, 4, 5],
                [8, 9, 10],
                [13, 14, 15],
            ]);
        });

        it('row==2,,;column=2,,', () => {
            expect(originArrayValueObject.slice([2], [2])?.toValue()).toStrictEqual([[13, 14, 15]]);
        });

        it('row==,,2;column=2,,', () => {
            expect(originArrayValueObject.slice([undefined, undefined, 2], [2])?.toValue()).toStrictEqual([
                [3, 4, 5],
                [13, 14, 15],
            ]);
        });

        it('row==1,,;column=null', () => {
            expect(originArrayValueObject.slice([1])?.toValue()).toStrictEqual([
                [6, 7, 8, 9, 10],
                [11, 12, 13, 14, 15],
            ]);
        });

        it('row==0,1,;column=,,2', () => {
            expect(originArrayValueObject.slice([0, 1], [undefined, undefined, 2])?.toValue()).toStrictEqual([
                [1, 3, 5],
            ]);
        });

        it('row==0,1,;column=,,2,first undefined', () => {
            expect(originArrayValueObject.slice(undefined, [2, 3])?.toValue()).toStrictEqual([[3], [8], [13]]);
        });

        it('row==1,3,;column=1,4,', () => {
            expect(originArrayValueObject.slice([1, 3], [1, 4])?.toValue()).toStrictEqual([
                [7, 8, 9],
                [12, 13, 14],
            ]);
        });

        it('row==3,,;column=,,', () => {
            expect(originArrayValueObject.slice([3])?.toValue()).toBeUndefined();
        });

        it('row==,,;column=5,,', () => {
            expect(originArrayValueObject.slice(undefined, [5])?.toValue()).toBeUndefined();
        });
    });

    describe('Count', () => {
        it('Normal count', () => {
            const originValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false],
                    [0, '100', '2.34', 'test', -3],
                ]),
                rowCount: 2,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            expect(originValueObject.count()?.getValue()).toBe(6);
        });
        it('Counta', () => {
            const originValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false],
                    [0, '100', '2.34', 'test', -3],
                ]),
                rowCount: 2,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            expect(originValueObject.countA()?.getValue()).toBe(10);
        });
        it('CountBlank', () => {
            const originValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, '', null],
                    [0, '100', '2.34', 'test', -3, ErrorType.VALUE, null],
                ]),
                rowCount: 2,
                columnCount: 7,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            expect(originValueObject.countBlank()?.getValue()).toBe(3);
        });
    });

    describe('pick', () => {
        it('normal', () => {
            const pickArrayValueObject = ArrayValueObject.create({
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
            const pickArrayValueObject = ArrayValueObject.create({
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
            const pickArrayValueObject = ArrayValueObject.create({
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

    describe('sum', () => {
        it('normal', () => {
            expect(originArrayValueObject.sum().getValue()).toStrictEqual(120);
        });

        // like numpy array
        // [
        //     [1, 0, 1.23, 1, 0],
        //     [0, 100, 2.34, 0, -3],
        // ]
        it('nm multiple formats', () => {
            const originValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false],
                    [0, '100', '2.34', 'test', -3],
                ]),
                rowCount: 2,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            expect(stripErrorMargin(Number(originValueObject.sum().getValue()))).toStrictEqual(101.57);
        });
    });

    describe('mean', () => {
        it('normal', () => {
            expect(originArrayValueObject.mean().getValue()).toStrictEqual(8);
        });

        // like numpy array
        // [
        //     [1, 0, 1.23, 1, 0],
        //     [0, 100, 2.34, 0, -3],
        // ]
        it('nm multiple formats', () => {
            const originValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false],
                    [0, '100', '2.34', 'test', -3],
                ]),
                rowCount: 2,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            expect(originValueObject.mean().getValue()).toStrictEqual(16.928333333333335);
        });
    });

    describe('var', () => {
        it('normal', () => {
            expect(originArrayValueObject.var().getValue()).toStrictEqual(18.666666666666668);
        });

        it('var nm multiple formats', () => {
            const originValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false],
                    [0, '100', '2.34', 'test', -3],
                ]),
                rowCount: 2,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            expect(originValueObject.var().getValue()).toStrictEqual(1382.9296138888888);
        });
    });

    describe('std', () => {
        it('normal', () => {
            expect(originArrayValueObject.std().getValue()).toStrictEqual(4.320493798938574);
        });

        it('nm multiple formats', () => {
            const originValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false],
                    [0, '100', '2.34', 'test', -3],
                ]),
                rowCount: 2,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            expect(originValueObject.std().getValue()).toStrictEqual(37.187761614392564);
        });
    });

    describe('getNegative', () => {
        it('normal', () => {
            expect((originArrayValueObject.getNegative() as ArrayValueObject).toValue()).toStrictEqual([
                [-1, -2, -3, -4, -5],
                [-6, -7, -8, -9, -10],
                [-11, -12, -13, -14, -15],
            ]);
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

            arrayValueObject = ValueObjectFactory.create(`{
                1 , 2;
                4 , 5
            }`);

            expect((arrayValueObject as ArrayValueObject).toValue()).toStrictEqual([
                [1, 2],
                [4, 5],
            ]);
        });

        it('ValueObjectFactory create StringValueObject ', () => {
            let stringValueObject = ValueObjectFactory.create('test');

            expect(stringValueObject.isString()).toBeTruthy();

            stringValueObject = ValueObjectFactory.create(' ');

            expect(stringValueObject.isString()).toBeTruthy();
        });

        it('ValueObjectFactory create ErrorValueObject ', () => {
            let errorValueObject = ValueObjectFactory.create(Number.NaN);

            expect(errorValueObject.isError()).toBeTruthy();

            errorValueObject = ValueObjectFactory.create(Number.POSITIVE_INFINITY);

            expect(errorValueObject.isError()).toBeTruthy();

            errorValueObject = ValueObjectFactory.create(Number.NEGATIVE_INFINITY);

            expect(errorValueObject.isError()).toBeTruthy();
        });
    });

    describe('Test DefaultValue', () => {
        it('After set defaultValue, use ', () => {
            const calculateValueList: Nullable<BaseValueObject>[][] = [[]];
            calculateValueList[0][1] = NumberValueObject.create(2);

            const arrayValueObject = ArrayValueObject.create({
                calculateValueList,
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            arrayValueObject.setDefaultValue(BooleanValueObject.create(false));

            // getFirstCell
            expect(arrayValueObject.getFirstCell().getValue()).toStrictEqual(false);

            // getLastCell
            expect(arrayValueObject.getLastCell().getValue()).toStrictEqual(false);

            // iterator
            arrayValueObject.iterator(iterator);

            // iteratorReverse
            arrayValueObject.iteratorReverse(iterator);

            arrayValueObject.mapValue(mapValue);

            function iterator(valueObject: Nullable<BaseValueObject>, row: number, column: number) {
                if (!valueObject) {
                    return;
                }

                const value = valueObject.getValue();

                if (row === 0 && column === 0) {
                    expect(value).toStrictEqual(false);
                } else if (row === 0 && column === 1) {
                    expect(value).toStrictEqual(2);
                } else if (row === 1 && column === 0) {
                    expect(value).toStrictEqual(false);
                } else if (row === 1 && column === 1) {
                    expect(value).toStrictEqual(false);
                }
            }

            function mapValue(valueObject: Nullable<BaseValueObject>, row: number, column: number) {
                if (!valueObject) {
                    return ErrorValueObject.create(ErrorType.NA);
                }

                iterator(valueObject, row, column);

                return valueObject;
            }

            // flatten
            const flatten = arrayValueObject.flatten();
            expect(flatten.getFirstCell().getValue()).toStrictEqual(false);

            // slice
            const firstColumn = arrayValueObject.slice([0, 1], [0, 1]);
            if (!firstColumn) {
                throw new Error('firstColumn is null');
            }
            expect(firstColumn.getFirstCell().getValue()).toStrictEqual(false);

            // transpose
            const transpose = arrayValueObject.transpose();
            expect(transpose.getFirstCell().getValue()).toStrictEqual(false);
        });
    });
    describe('Test utils', () => {
        it('ArrayValueObject static createByArray', () => {
            const arrayValueObject = ArrayValueObject.createByArray([['cell1', 2, null], ['1', false, true]]);
            expect(arrayValueObject.toValue()).toStrictEqual([['cell1', 2, 0], [1, false, true]]);
        });
    });
});
