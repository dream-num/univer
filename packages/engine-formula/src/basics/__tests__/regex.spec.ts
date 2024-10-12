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

import { describe, expect, it } from 'vitest';
import { isReferenceString, REFERENCE_REGEX_COLUMN_PRECOMPILING, REFERENCE_REGEX_ROW_PRECOMPILING, REFERENCE_SINGLE_RANGE_REGEX_PRECOMPILING, REFERENCE_TABLE_MULTIPLE_COLUMN_REGEX, REFERENCE_TABLE_SINGLE_COLUMN_REGEX } from '../regex';

describe('Test ref regex', () => {
    it('Single range', () => {
        expect(REFERENCE_SINGLE_RANGE_REGEX_PRECOMPILING.test('A1')).toBe(true);
        expect(REFERENCE_SINGLE_RANGE_REGEX_PRECOMPILING.test('Sheet1!A1')).toBe(true);
        expect(REFERENCE_SINGLE_RANGE_REGEX_PRECOMPILING.test('[workbook]Sheet1!A1')).toBe(true);
        expect(REFERENCE_SINGLE_RANGE_REGEX_PRECOMPILING.test('[workbook]\'Sheet-1\'!A1')).toBe(true);
        expect(REFERENCE_SINGLE_RANGE_REGEX_PRECOMPILING.test('\'[workbook]Sheet1\'!A1')).toBe(true);
    });

    it('Multiple range', () => {
        expect(REFERENCE_SINGLE_RANGE_REGEX_PRECOMPILING.test('A1:B10')).toBe(true);
        expect(REFERENCE_SINGLE_RANGE_REGEX_PRECOMPILING.test('Sheet1!A1:B10')).toBe(true);
        expect(REFERENCE_SINGLE_RANGE_REGEX_PRECOMPILING.test('[workbook]Sheet1!A1:B10')).toBe(true);
        expect(REFERENCE_SINGLE_RANGE_REGEX_PRECOMPILING.test('[workbook]\'Sheet-1\'!A1:B10')).toBe(true);
        expect(REFERENCE_SINGLE_RANGE_REGEX_PRECOMPILING.test('\'[workbook]Sheet1\'!A1:B10')).toBe(true);
    });

    it('Row range', () => {
        expect(REFERENCE_REGEX_ROW_PRECOMPILING.test('1:10')).toBe(true);
        expect(REFERENCE_REGEX_ROW_PRECOMPILING.test('Sheet1!1:10')).toBe(true);
        expect(REFERENCE_REGEX_ROW_PRECOMPILING.test('[workbook]Sheet1!1:10')).toBe(true);
        expect(REFERENCE_REGEX_ROW_PRECOMPILING.test('[workbook]\'Sheet-1\'!1:10')).toBe(true);
        expect(REFERENCE_REGEX_ROW_PRECOMPILING.test('\'[workbook]Sheet1\'!1:10')).toBe(true);
    });

    it('Column range', () => {
        expect(REFERENCE_REGEX_COLUMN_PRECOMPILING.test('A:B')).toBe(true);
        expect(REFERENCE_REGEX_COLUMN_PRECOMPILING.test('Sheet1!A:B')).toBe(true);
        expect(REFERENCE_REGEX_COLUMN_PRECOMPILING.test('[workbook]Sheet1!A:B')).toBe(true);
        expect(REFERENCE_REGEX_COLUMN_PRECOMPILING.test('[workbook]\'Sheet-1\'!A:B')).toBe(true);
        expect(REFERENCE_REGEX_COLUMN_PRECOMPILING.test('\'[workbook]Sheet1\'!A:B')).toBe(true);
    });

    it('Table single range', () => {
        expect(new RegExp(REFERENCE_TABLE_SINGLE_COLUMN_REGEX).test('Table1[[#Title],[#Data],[Column1]]')).toBe(true);
    });

    it('Table multiple range', () => {
        expect(new RegExp(REFERENCE_TABLE_MULTIPLE_COLUMN_REGEX).test('Table1[[#Title],[#Data],[Column1]:[Column10]]')).toBe(true);
    });

    it('isReferenceString', () => {
        expect(isReferenceString('A1')).toBeTruthy();
        expect(isReferenceString('Sheet1!A1')).toBeTruthy();
        expect(isReferenceString('[workbook]Sheet1!A1')).toBeTruthy();
        expect(isReferenceString('[workbook]\'Sheet-1\'!A1')).toBeTruthy();
        expect(isReferenceString('\'[workbook]Sheet1\'!A1')).toBeTruthy();

        expect(isReferenceString('A1:B10')).toBeTruthy();
        expect(isReferenceString('Sheet1!A1:B10')).toBeTruthy();
        expect(isReferenceString('[workbook]Sheet1!A1:B10')).toBeTruthy();
        expect(isReferenceString('[workbook]\'Sheet-1\'!A1:B10')).toBeTruthy();
        expect(isReferenceString('\'[workbook]Sheet1\'!A1:B10')).toBeTruthy();

        expect(isReferenceString('1:10')).toBeTruthy();
        expect(isReferenceString('Sheet1!1:10')).toBeTruthy();
        expect(isReferenceString('[workbook]Sheet1!1:10')).toBeTruthy();
        expect(isReferenceString('[workbook]\'Sheet-1\'!1:10')).toBeTruthy();
        expect(isReferenceString('\'[workbook]Sheet1\'!1:10')).toBeTruthy();

        expect(isReferenceString('A:B')).toBeTruthy();
        expect(isReferenceString('Sheet1!A:B')).toBeTruthy();
        expect(isReferenceString('[workbook]Sheet1!A:B')).toBeTruthy();
        expect(isReferenceString('[workbook]\'Sheet-1\'!A:B')).toBeTruthy();
        expect(isReferenceString('\'[workbook]Sheet1\'!A:B')).toBeTruthy();
    });
});
