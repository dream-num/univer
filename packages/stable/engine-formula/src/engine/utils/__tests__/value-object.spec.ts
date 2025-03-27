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

import { cellToRange, CellValueType } from '@univerjs/core';

import { describe, expect, it } from 'vitest';
import { ErrorType } from '../../../basics/error-type';
import { CellReferenceObject } from '../../reference-object/cell-reference-object';
import { ColumnReferenceObject } from '../../reference-object/column-reference-object';
import { RangeReferenceObject } from '../../reference-object/range-reference-object';
import { RowReferenceObject } from '../../reference-object/row-reference-object';
import { ArrayValueObject } from '../../value-object/array-value-object';
import { ErrorValueObject } from '../../value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../value-object/primitive-object';
import { convertTonNumber, isSingleValueObject, objectValueToCellValue } from '../value-object';

describe('Test object cover', () => {
    it('Function convertTonNumber', () => {
        expect(convertTonNumber(BooleanValueObject.create(true)).getValue()).toBe(1);
        expect(convertTonNumber(BooleanValueObject.create(false)).getValue()).toBe(0);
    });

    it('Function isSingleValueObject', () => {
        expect(isSingleValueObject(BooleanValueObject.create(true))).toBe(true);
        expect(isSingleValueObject(BooleanValueObject.create(false))).toBe(true);
        expect(isSingleValueObject(NumberValueObject.create(1))).toBe(true);
        expect(isSingleValueObject(StringValueObject.create('Univer'))).toBe(true);
        expect(isSingleValueObject(NullValueObject.create())).toBe(true);
        expect(isSingleValueObject(ErrorValueObject.create(ErrorType.VALUE))).toBe(true);

        expect(isSingleValueObject(ArrayValueObject.create(/*ts*/ `{
            1, 3;
            8, 7
        }`))).toBe(false);
        expect(isSingleValueObject(ArrayValueObject.create(/*ts*/ `{
            1
        }`))).toBe(true);

        expect(isSingleValueObject(new CellReferenceObject('A1'))).toBe(true);
        expect(isSingleValueObject(new RowReferenceObject('1:1'))).toBe(false);
        expect(isSingleValueObject(new ColumnReferenceObject('A:A'))).toBe(false);
        expect(isSingleValueObject(new RangeReferenceObject(cellToRange(0, 1)))).toBe(true);
        expect(isSingleValueObject(new RangeReferenceObject({ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }))).toBe(false);
    });

    it('Function objectValueToCellValue', () => {
        expect(objectValueToCellValue(NumberValueObject.create(1))).toStrictEqual({ v: 1, t: CellValueType.NUMBER });
        expect(objectValueToCellValue(StringValueObject.create('Univer'))).toStrictEqual({ v: 'Univer', t: CellValueType.STRING });
        expect(objectValueToCellValue(StringValueObject.create('0'))).toStrictEqual({ v: '0', t: CellValueType.STRING });
        expect(objectValueToCellValue(BooleanValueObject.create(true))).toStrictEqual({ v: 1, t: CellValueType.BOOLEAN });
        expect(objectValueToCellValue(BooleanValueObject.create(false))).toStrictEqual({ v: 0, t: CellValueType.BOOLEAN });
        expect(objectValueToCellValue(NullValueObject.create())).toStrictEqual({ v: null });
        expect(objectValueToCellValue(null)).toStrictEqual({ v: null });
        expect(objectValueToCellValue(ErrorValueObject.create(ErrorType.VALUE))).toStrictEqual({ v: ErrorType.VALUE, t: CellValueType.STRING });
        expect(objectValueToCellValue(StringValueObject.create('0').withCustomData({ test: 'abc' }))).toStrictEqual({ v: '0', t: CellValueType.STRING, custom: { test: 'abc' } });
    });
});
