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

import { cellToRange, CellValueType, DateSystem } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { ErrorType } from '../../../basics/error-type';
import { compareToken } from '../../../basics/token';
import { CellReferenceObject } from '../../reference-object/cell-reference-object';
import { ColumnReferenceObject } from '../../reference-object/column-reference-object';
import { RangeReferenceObject } from '../../reference-object/range-reference-object';
import { RowReferenceObject } from '../../reference-object/row-reference-object';
import { ArrayValueObject } from '../../value-object/array-value-object';
import { ErrorValueObject } from '../../value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../value-object/primitive-object';
import { valueObjectCompare } from '../object-compare';
import {
    convertTonNumber,
    filterSameValueObjectResult,
    getPairedRangeAndCriteriaResult,
    isSingleValueObject,
    objectValueToCellValue,
} from '../value-object';

describe('Test object cover', () => {
    it('preserves error-looking text through runtime serialization', () => {
        expect(objectValueToCellValue(StringValueObject.create('#REF!'))).toEqual({ v: '#REF!', t: CellValueType.FORCE_STRING });
        expect(objectValueToCellValue(ErrorValueObject.create(ErrorType.REF))).toEqual({ v: '#REF!', t: CellValueType.STRING });
    });

    it.each([
        ['1', '<>1', false, true],
        ['01', '<>1', false, true],
        ['1', '01', true, true],
        ['1', '1.0', true, true],
        ['1e0', '=1', true, true],
        ['1', '>0', true, false],
        ['\t1', '=1', true, false],
        ['\t1', '\t1', false, true],
        ['0x10', '0x10', false, true],
        ['Infinity', '<>Infinity', true, false],
        ['2026-1-1', '<>2026-1-1', true, true],
    ])('matches Excel numeric and text criteria: %s, %s', (text, criteria, numericMatch, textMatch) => {
        const range = ArrayValueObject.create({
            calculateValueList: [[NumberValueObject.create(1)], [StringValueObject.create(text)]],
            rowCount: 2,
            columnCount: 1,
            unitId: '',
            sheetId: '',
            row: -1,
            column: -1,
        });
        const criterion = StringValueObject.create(criteria);
        const comparison = valueObjectCompare(range, criterion) as ArrayValueObject;
        const result = filterSameValueObjectResult(comparison, range, criterion);
        expect(result.toValue()).toEqual([[numericMatch], [textMatch]]);
    });

    it('Function convertTonNumber', () => {
        expect(convertTonNumber(BooleanValueObject.create(true)).getValue()).toBe(1);
        expect(convertTonNumber(BooleanValueObject.create(false)).getValue()).toBe(0);
    });

    it('Boolean values are not equal to text values', () => {
        expect(BooleanValueObject.create(false).compare(StringValueObject.create(''), compareToken.EQUALS).getValue()).toBe(false);
        expect(BooleanValueObject.create(false).compare(StringValueObject.create(''), compareToken.NOT_EQUAL).getValue()).toBe(true);
    });

    it('uses the supplied date system when matching date criteria against serial numbers', () => {
        const range = ArrayValueObject.createByArray([[0]]);
        const criteria = StringValueObject.create('1904-1-1').withDateSystem(DateSystem.Date1904);
        const comparison = valueObjectCompare(range, criteria) as ArrayValueObject;

        expect(comparison.get(0, 0)?.getValue()).toBe(true);
        const result = filterSameValueObjectResult(comparison, range, criteria);

        expect(result.get(0, 0)?.getValue()).toBe(true);
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

describe('COUNTIFS array criteria', () => {
    it.each(['text', 'numeric'])('does not rescan the entire lookup range for each %s criterion', (kind) => {
        const range = ArrayValueObject.createByArray(Array.from({ length: 200 }, (_, i) => [kind === 'text' ? `ID-${i}` : `${10000000000 + i}`]));
        const criteria = ArrayValueObject.createByArray(Array.from({ length: 100 }, (_, i) => [kind === 'text' ? `id-${i}` : 10000000000 + i]));
        const roles = ArrayValueObject.createByArray(Array.from({ length: 200 }, (_, i) => [i % 2 ? 'Staff' : 'Manager']));
        const reads = vi.spyOn(range, 'get');
        try {
            const result = getPairedRangeAndCriteriaResult([range, criteria, roles, StringValueObject.create('Manager')], {
                formulaName: 'COUNTIFS',
                maxRowLength: 100,
                maxColumnLength: 1,
                isNumberSensitive: true,
            });
            expect(result.map((row) => row.map((value) => value.getValue())))
                .toEqual(Array.from({ length: 100 }, (_, i) => [i % 2 ? 0 : 1]));
            // A larger input must not turn each criterion into a full-range scan.
            expect(reads.mock.calls.length).toBeLessThan(1000);
        } finally {
            reads.mockRestore();
        }
    });
});

describe('COUNTIFS indexed equality semantics', () => {
    it('preserves duplicates, numeric text, paired two-dimensional criteria and fallback comparisons', () => {
        const range = ArrayValueObject.create({
            calculateValueList: [
                [StringValueObject.create('Alpha'), StringValueObject.create('ALPHA'), NumberValueObject.create(1)],
                [StringValueObject.create('1'), StringValueObject.create('01'), StringValueObject.create('Beta')],
                [NullValueObject.create(), StringValueObject.create(''), ErrorValueObject.create(ErrorType.NA)],
                [BooleanValueObject.create(true), NumberValueObject.create(0.1 + 0.2), StringValueObject.create('a*b')],
            ],
            rowCount: 4,
            columnCount: 3,
            unitId: '',
            sheetId: '',
            row: -1,
            column: -1,
        });
        const groups = ArrayValueObject.createByArray([[1, 2, 1], [1, 1, 2], [1, 1, 1], [1, 1, 1]]);
        const criteria = [
            [StringValueObject.create('=alpha'), NumberValueObject.create(1), StringValueObject.create('01')],
            [StringValueObject.create('a*'), StringValueObject.create('>0'), NumberValueObject.create(0.3)],
            [StringValueObject.create(''), ErrorValueObject.create(ErrorType.NA), BooleanValueObject.create(true)],
            [StringValueObject.create('missing'), StringValueObject.create('a~*b'), StringValueObject.create('<>Beta')],
        ];
        const criteriaArray = ArrayValueObject.create({
            calculateValueList: criteria,
            rowCount: 4,
            columnCount: 3,
            unitId: '',
            sheetId: '',
            row: -1,
            column: -1,
        });
        const groupCriteria = ArrayValueObject.createByArray([[1, 1, 1], [1, 1, 1], [1, 1, 1], [2, 1, 1]]);
        const result = getPairedRangeAndCriteriaResult([range, criteriaArray, groups, groupCriteria], {
            formulaName: 'COUNTIFS',
            maxRowLength: 4,
            maxColumnLength: 3,
            isNumberSensitive: true,
        });
        const expected = criteria.map((row, r) => row.map((criterion, c) => getPairedRangeAndCriteriaResult([
            range,
            criterion,
            groups,
            groupCriteria.get(r, c)!,
        ], {
            formulaName: 'COUNTIFS',
            maxRowLength: 1,
            maxColumnLength: 1,
            isNumberSensitive: true,
        })[0][0].getValue()));
        expect(result.map((row) => row.map((value) => value.getValue()))).toEqual(expected);
        expect(expected[0]).toEqual([1, 3, 3]);
        expect(expected[1][2]).toBe(1);
    });

    it.each([DateSystem.Date1900, DateSystem.Date1904])('preserves text normalization and date-system %s criteria', (dateSystem) => {
        const values = [
            StringValueObject.create('Straße'),
            StringValueObject.create('STRASSE'),
            StringValueObject.create('é'),
            StringValueObject.create('e\u0301'),
            StringValueObject.create('1e-310'),
            NumberValueObject.create(0),
            StringValueObject.create('\t1'),
            StringValueObject.create('0x10'),
            NumberValueObject.create(1),
            NumberValueObject.create(16),
            StringValueObject.create('1904-1-1').withDateSystem(dateSystem),
            NumberValueObject.create(44561.99999999999, 'yyyy-mm-dd').withDateSystem(dateSystem),
        ];
        const range = ArrayValueObject.create({
            calculateValueList: values.map((value) => [value]),
            rowCount: values.length,
            columnCount: 1,
            unitId: '',
            sheetId: '',
            row: -1,
            column: -1,
        });
        const criteria = [
            StringValueObject.create('strasse'),
            StringValueObject.create('é'),
            NumberValueObject.create(0),
            StringValueObject.create('1e-310'),
            NumberValueObject.create(1),
            StringValueObject.create('0x10'),
            StringValueObject.create('1904-1-1').withDateSystem(dateSystem),
            NumberValueObject.create(44562, 'yyyy-mm-dd').withDateSystem(dateSystem),
        ];
        const criteriaArray = ArrayValueObject.create({
            calculateValueList: criteria.map((value) => [value]),
            rowCount: criteria.length,
            columnCount: 1,
            unitId: '',
            sheetId: '',
            row: -1,
            column: -1,
        });
        const params = { formulaName: 'COUNTIFS', maxRowLength: criteria.length, maxColumnLength: 1, isNumberSensitive: true };
        const result = getPairedRangeAndCriteriaResult([range, criteriaArray], params);
        const expected = criteria.map((criterion) => getPairedRangeAndCriteriaResult([range, criterion], { ...params, maxRowLength: 1 })[0][0].getValue());
        expect(result.map((row) => row[0].getValue())).toEqual(expected);
        expect(expected.slice(0, 2)).toEqual([2, 2]);
        const zeroMatches = dateSystem === DateSystem.Date1904 ? 3 : 2;
        expect(expected.slice(2, 4)).toEqual([zeroMatches, zeroMatches]);
        expect(expected[7]).toBe(1);
    });

    it('rebuilds its lookup after range data changes', () => {
        const range = ArrayValueObject.createByArray([['Alpha'], ['Beta']]);
        const criteria = ArrayValueObject.createByArray([['Alpha'], ['Beta']]);
        const params = { formulaName: 'COUNTIFS', maxRowLength: 2, maxColumnLength: 1, isNumberSensitive: true };
        expect(getPairedRangeAndCriteriaResult([range, criteria], params).map((row) => row[0].getValue())).toEqual([1, 1]);
        range.set(0, 0, StringValueObject.create('Beta'));
        expect(getPairedRangeAndCriteriaResult([range, criteria], params).map((row) => row[0].getValue())).toEqual([0, 2]);
    });
});
