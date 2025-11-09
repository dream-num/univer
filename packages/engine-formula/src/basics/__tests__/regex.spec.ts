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
import { isReferenceString, REFERENCE_TABLE_ALL_COLUMN_REGEX, REFERENCE_TABLE_MULTIPLE_COLUMN_REGEX, REFERENCE_TABLE_SINGLE_COLUMN_REGEX, regexTestColumn, regexTestMultipleRange, regexTestRow, regexTestSingeRange } from '../regex';

describe('Test ref regex', () => {
    it('Single range', () => {
        expect(regexTestSingeRange('A1')).toBe(true);
        expect(regexTestSingeRange('Sheet1!A1')).toBe(true);
        expect(regexTestSingeRange('[workbook]Sheet1!A1')).toBe(true);
        expect(regexTestSingeRange('[workbook]\'Sheet-1\'!A1')).toBe(true);
        expect(regexTestSingeRange('\'[workbook]Sheet1\'!A1')).toBe(true);
    });

    it('Multiple range', () => {
        expect(regexTestMultipleRange('A1:B10')).toBe(true);
        expect(regexTestMultipleRange('Sheet1!A1:B10')).toBe(true);
        expect(regexTestMultipleRange('[workbook]Sheet1!A1:B10')).toBe(true);
        expect(regexTestMultipleRange('[workbook]\'Sheet-1\'!A1:B10')).toBe(true);
        expect(regexTestMultipleRange('\'[workbook]Sheet1\'!A1:B10')).toBe(true);
    });

    it('Row range', () => {
        expect(regexTestRow('1:10')).toBe(true);
        expect(regexTestRow('Sheet1!1:10')).toBe(true);
        expect(regexTestRow('[workbook]Sheet1!1:10')).toBe(true);
        expect(regexTestRow('[workbook]\'Sheet-1\'!1:10')).toBe(true);
        expect(regexTestRow('\'[workbook]Sheet1\'!1:10')).toBe(true);
    });

    it('Column range', () => {
        expect(regexTestColumn('A:B')).toBe(true);
        expect(regexTestColumn('Sheet1!A:B')).toBe(true);
        expect(regexTestColumn('[workbook]Sheet1!A:B')).toBe(true);
        expect(regexTestColumn('[workbook]\'Sheet-1\'!A:B')).toBe(true);
        expect(regexTestColumn('\'[workbook]Sheet1\'!A:B')).toBe(true);
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

    // Structured Reference extra tests (comments in English)
    // Assumes REFERENCE_TABLE_SINGLE_COLUMN_REGEX / REFERENCE_TABLE_MULTIPLE_COLUMN_REGEX are already imported.
    describe('Structured Reference – Single Column (positive)', () => {
        const RE_SINGLE = new RegExp(REFERENCE_TABLE_SINGLE_COLUMN_REGEX);

        it('matches basic single column', () => {
            expect(RE_SINGLE.test('Table1[Column1]')).toBe(true);
        });

        it('matches double-bracket single column', () => {
            expect(RE_SINGLE.test('Table1[[Column1]]')).toBe(true);
        });

        it('matches with #Headers tag', () => {
            expect(RE_SINGLE.test('Table1[[#Headers],[Column1]]')).toBe(true);
        });

        it('matches with #Data tag', () => {
            expect(RE_SINGLE.test('Table1[[#Data],[Column1]]')).toBe(true);
        });

        it('matches with #All tag', () => {
            expect(RE_SINGLE.test('Table1[[#All],[Column1]]')).toBe(true);
        });

        it('matches with #Totals tag', () => {
            expect(RE_SINGLE.test('Table1[[#Totals],[Column1]]')).toBe(true);
        });

        it('matches with #This Row tag', () => {
            expect(RE_SINGLE.test('Table1[[#This Row],[Column1]]')).toBe(true);
        });

        it('matches with #Title tag (allowed in your grammar)', () => {
            expect(RE_SINGLE.test('Table1[[#Title],[Column1]]')).toBe(true);
        });

        it('matches tag order swapped (column before tag)', () => {
            expect(RE_SINGLE.test('Table1[[Column1],[#Data]]')).toBe(true);
        });

        it('matches spaces around tokens', () => {
            expect(RE_SINGLE.test('Table1[[  Column1  ]]')).toBe(true);
        });

        it('matches spaces and comma spacing', () => {
            expect(RE_SINGLE.test('Table1[[#Data] , [Column1]]')).toBe(true);
        });

        it('matches mixed spacing inside brackets', () => {
            expect(RE_SINGLE.test('Table1[[ #All ],[ Column1 ]]')).toBe(true);
        });

        it('matches unicode/space column name', () => {
            expect(RE_SINGLE.test('Table1[[客户 名称]]')).toBe(true);
        });

        it('matches special char column name', () => {
            expect(RE_SINGLE.test('Table1[[Order-ID]]')).toBe(true);
        });

        it('matches pure unicode column name', () => {
            expect(RE_SINGLE.test('Table1[[中文列名]]')).toBe(true);
        });
    });

    describe('Structured Reference – Single Column (negative)', () => {
        const RE_SINGLE = new RegExp(REFERENCE_TABLE_SINGLE_COLUMN_REGEX);

        it('does not match #All only', () => {
            expect(RE_SINGLE.test('Table1[#All]')).toBe(false);
        });

        it('does not match #Headers only', () => {
            expect(RE_SINGLE.test('Table1[#Headers]')).toBe(false);
        });

        it('does not match #Data only', () => {
            expect(RE_SINGLE.test('Table1[#Data]')).toBe(false);
        });

        it('does not match #Totals only', () => {
            expect(RE_SINGLE.test('Table1[#Totals]')).toBe(false);
        });

        it('does not match multi-column range', () => {
            expect(RE_SINGLE.test('Table1[[Column1]:[Column10]]')).toBe(false);
        });

        it('does not match multi-column with tag', () => {
            expect(RE_SINGLE.test('Table1[[#Data],[Column1]:[Column10]]')).toBe(false);
        });

        it('does not match comma-separated multi-columns (list, not range)', () => {
            expect(RE_SINGLE.test('Table1[[Column1],[Column2]]')).toBe(false);
        });

        it('does not match A1-style column', () => {
            expect(RE_SINGLE.test('Table1[A1]')).toBe(false);
        });

        it('does not match empty bracket', () => {
            expect(RE_SINGLE.test('Table1[]')).toBe(false);
        });

        it('does not match table name only', () => {
            expect(RE_SINGLE.test('Table1')).toBe(false);
        });
    });

    describe('Structured Reference – Multi Column (positive)', () => {
        const RE_MULTI = new RegExp(REFERENCE_TABLE_MULTIPLE_COLUMN_REGEX);

        it('matches basic column range', () => {
            expect(RE_MULTI.test('Table1[[Column1]:[Column10]]')).toBe(true);
        });

        it('matches column range with #Headers', () => {
            expect(RE_MULTI.test('Table1[[#Headers],[Column1]:[Column10]]')).toBe(true);
        });

        it('matches column range with #Data', () => {
            expect(RE_MULTI.test('Table1[[#Data],[Column1]:[Column10]]')).toBe(true);
        });

        it('matches column range with #All', () => {
            expect(RE_MULTI.test('Table1[[#All],[Column1]:[Column10]]')).toBe(true);
        });

        it('matches column range with #Totals', () => {
            expect(RE_MULTI.test('Table1[[#Totals],[Column1]:[Column10]]')).toBe(true);
        });

        it('matches column range with #This Row', () => {
            expect(RE_MULTI.test('Table1[[#This Row],[Column1]:[Column10]]')).toBe(true);
        });

        it('matches column range with #Title', () => {
            expect(RE_MULTI.test('Table1[[#Title],[Column1]:[Column10]]')).toBe(true);
        });

        it('matches column range with multi tags', () => {
            expect(RE_MULTI.test('Table1[[#Headers],[#Data],[Column1]:[Column10]]')).toBe(true);
        });

        it('matches column range with spaces around tokens', () => {
            expect(RE_MULTI.test('Table1[[ Column1 ]:[ Column10 ]]')).toBe(true);
        });

        it('matches column range with spaced colon and tag', () => {
            expect(RE_MULTI.test('Table1[[#Data], [ Column1 ] : [ Column10 ]]')).toBe(true);
        });

        it('matches unicode/special char names in range', () => {
            expect(RE_MULTI.test('Table1[[客户 名称]:[订单-ID]]')).toBe(true);
        });
    });

    describe('Structured Reference – Multi Column (negative)', () => {
        const RE_MULTI = new RegExp(REFERENCE_TABLE_MULTIPLE_COLUMN_REGEX);

        it('does not match single column simple', () => {
            expect(RE_MULTI.test('Table1[Column1]')).toBe(false);
        });

        it('does not match single column with tag', () => {
            expect(RE_MULTI.test('Table1[[#Data],[Column1]]')).toBe(false);
        });

        it('does not match comma-separated multiple columns (list, not range)', () => {
            expect(RE_MULTI.test('Table1[[Column1],[Column2]]')).toBe(false);
        });

        it('does not match comma-separated with tag', () => {
            expect(RE_MULTI.test('Table1[[#Data],[Column1],[Column3]]')).toBe(false);
        });

        it('does not match #All only', () => {
            expect(RE_MULTI.test('Table1[#All]')).toBe(false);
        });

        it('does not match #Headers only', () => {
            expect(RE_MULTI.test('Table1[#Headers]')).toBe(false);
        });

        it('does not match A1-style range', () => {
            expect(RE_MULTI.test('Table1[A1:B10]')).toBe(false);
        });

        it('does not match empty bracket', () => {
            expect(RE_MULTI.test('Table1[]')).toBe(false);
        });

        it('does not match table name only', () => {
            expect(RE_MULTI.test('Table1')).toBe(false);
        });
    });

    describe('Structured Reference – Cross guard', () => {
        const RE_SINGLE = new RegExp(REFERENCE_TABLE_SINGLE_COLUMN_REGEX);
        const RE_MULTI = new RegExp(REFERENCE_TABLE_MULTIPLE_COLUMN_REGEX);

        it('single-regex should not match multi-column range', () => {
            expect(RE_SINGLE.test('Table1[[Column1]:[Column10]]')).toBe(false);
        });

        it('multi-regex should not match single-column (double bracket)', () => {
            expect(RE_MULTI.test('Table1[[Column1]]')).toBe(false);
        });

        it('multi-regex should not match single-column (simple)', () => {
            expect(RE_MULTI.test('Table1[Column1]')).toBe(false);
        });
    });

    describe('Structured Reference – Order & spacing edge cases', () => {
        const RE_SINGLE = new RegExp(REFERENCE_TABLE_SINGLE_COLUMN_REGEX);
        const RE_MULTI = new RegExp(REFERENCE_TABLE_MULTIPLE_COLUMN_REGEX);

        // Single
        it('single: tag order after column (Totals)', () => {
            expect(RE_SINGLE.test('Table1[[Column1],[#Totals]]')).toBe(false);
        });

        it('single: multiple tags after column', () => {
            expect(RE_SINGLE.test('Table1[[Column1],[#Headers],[#Data]]')).toBe(false);
        });

        it('single: excessive spaces around comma', () => {
            expect(RE_SINGLE.test('Table1[[#Data]   ,   [Column1]]')).toBe(true);
        });

        // Multi
        it('multi: tag after range', () => {
            expect(RE_MULTI.test('Table1[[Column1]:[Column10],[#All]]')).toBe(false);
        });

        it('multi: multiple tags before range', () => {
            expect(RE_MULTI.test('Table1[[#Data],[#Totals],[Column1]:[Column10]]')).toBe(true);
        });

        it('multi: excessive spaces around colon and tags', () => {
            expect(RE_MULTI.test('Table1[[#All]  , [Column1]  :   [Column10]]')).toBe(true);
        });
    });

    describe('Single all column test', () => {
        const FULL_SINGLE = new RegExp(REFERENCE_TABLE_ALL_COLUMN_REGEX);

    // Should match a plain table name (shorthand for #All)
        it('matches plain table name', () => {
            expect(FULL_SINGLE.test('Table1')).toBe(true);
        });

    // Should not match an empty bracket (invalid structured reference)
        it('rejects empty brackets', () => {
            expect(FULL_SINGLE.test('Table1[]')).toBe(false);
        });

    // Should not match strings with non-table prefix
        it('rejects prefixed string', () => {
            expect(FULL_SINGLE.test('122Table1')).toBe(false);
        });

    // Should not match column-qualified reference (not a pure whole-table reference)
        it('rejects table with column reference', () => {
            expect(FULL_SINGLE.test('Table1[Column1]')).toBe(false);
        });
    });
});
