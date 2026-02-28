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
import {
    isReferenceString,
    REFERENCE_TABLE_ALL_COLUMN_REGEX,
    REFERENCE_TABLE_MULTIPLE_COLUMN_REGEX,
    REFERENCE_TABLE_SINGLE_COLUMN_REGEX,
    REFERENCE_TABLE_TITLE_ONLY_ANY_HASH_REGEX,
    regexTestColumn,
    regexTestMultipleRange,
    regexTestRow,
    regexTestSingeRange,
} from '../regex';

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
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1[Column1]')).toBe(true);
        });

        it('matches double-bracket single column', () => {
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1[[Column1]]')).toBe(true);
        });

        it('matches with #Headers tag', () => {
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1[[#Headers],[Column1]]')).toBe(true);
        });

        it('matches with #Data tag', () => {
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1[[#Data],[Column1]]')).toBe(true);
        });

        it('matches with #All tag', () => {
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1[[#All],[Column1]]')).toBe(true);
        });

        it('matches with #Totals tag', () => {
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1[[#Totals],[Column1]]')).toBe(true);
        });

        it('matches with #This Row tag', () => {
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1[[#This Row],[Column1]]')).toBe(true);
        });

        it('matches with #Title tag (allowed in your grammar)', () => {
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1[[#Title],[Column1]]')).toBe(true);
        });

        it('matches tag order swapped (column before tag)', () => {
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1[[Column1],[#Data]]')).toBe(false);
        });

        it('matches spaces around tokens', () => {
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1[[  Column1  ]]')).toBe(true);
        });

        it('matches spaces and comma spacing', () => {
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1[[#Data] , [Column1]]')).toBe(true);
        });

        it('matches mixed spacing inside brackets', () => {
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1[[ #All ],[ Column1 ]]')).toBe(false);
        });

        it('matches unicode/space column name', () => {
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1[[客户 名称]]')).toBe(true);
        });

        it('matches special char column name', () => {
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1[[Order-ID]]')).toBe(true);
        });

        it('matches pure unicode column name', () => {
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1[[中文列名]]')).toBe(true);
        });

        it('matches empty bracket', () => {
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1[]')).toBe(true);
        });
    });

    describe('Structured Reference – Single Column (negative)', () => {
        const RE_SINGLE = new RegExp(REFERENCE_TABLE_SINGLE_COLUMN_REGEX);

        it('does not match #All only', () => {
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1[#All]')).toBe(false);
        });

        it('does not match #Headers only', () => {
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1[#Headers]')).toBe(false);
        });

        it('does not match #Data only', () => {
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1[#Data]')).toBe(false);
        });

        it('does not match #Totals only', () => {
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1[#Totals]')).toBe(false);
        });

        it('does not match table name only', () => {
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1')).toBe(false);
        });
    });

    describe('Structured Reference – Multi Column (positive)', () => {
        const RE_MULTI = new RegExp(REFERENCE_TABLE_MULTIPLE_COLUMN_REGEX);

        it('matches basic column range', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[[Column1]:[Column10]]')).toBe(true);
        });

        it('matches column range with #Headers', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[[#Headers],[Column1]:[Column10]]')).toBe(true);
        });

        it('matches column range with #Data', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[[#Data],[Column1]:[Column10]]')).toBe(true);
        });

        it('matches column range with #All', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[[#All],[Column1]:[Column10]]')).toBe(true);
        });

        it('matches column range with #Totals', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[[#Totals],[Column1]:[Column10]]')).toBe(true);
        });

        it('matches column range with #This Row', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[[#This Row],[Column1]:[Column10]]')).toBe(true);
        });

        it('matches column range with #Title', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[[#Title],[Column1]:[Column10]]')).toBe(true);
        });

        it('matches column range with multi tags', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[[#Headers],[#Data],[Column1]:[Column10]]')).toBe(true);
        });

        it('matches column range with spaces around tokens', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[[ Column1 ]:[ Column10 ]]')).toBe(true);
        });

        it('matches column range with spaced colon and tag', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[[#Data], [ Column1 ] : [ Column10 ]]')).toBe(true);
        });

        it('matches unicode/special char names in range', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[[客户 名称]:[订单-ID]]')).toBe(true);
        });
    });

    describe('Structured Reference – Multi Column (negative)', () => {
        const RE_MULTI = new RegExp(REFERENCE_TABLE_MULTIPLE_COLUMN_REGEX);

        it('does not match single column simple', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[Column1]')).toBe(false);
        });

        it('does not match single column with tag', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[[#Data],[Column1]]')).toBe(false);
        });

        it('does not match comma-separated multiple columns (list, not range)', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[[Column1],[Column2]]')).toBe(false);
        });

        it('does not match comma-separated with tag', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[[#Data],[Column1],[Column3]]')).toBe(false);
        });

        it('does not match #All only', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[#All]')).toBe(false);
        });

        it('does not match #Headers only', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[#Headers]')).toBe(false);
        });

        it('does not match A1-style range', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[A1:B10]')).toBe(false);
        });

        it('does not match empty bracket', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[]')).toBe(false);
        });
    });

    describe('Structured Reference – Cross guard', () => {
        const RE_MULTI = new RegExp(REFERENCE_TABLE_MULTIPLE_COLUMN_REGEX);

        it('multi-regex should not match single-column (double bracket)', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[[Column1]]')).toBe(false);
        });

        it('multi-regex should not match single-column (simple)', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[Column1]')).toBe(false);
        });
    });

    describe('Structured Reference – Order & spacing edge cases', () => {
        const RE_SINGLE = new RegExp(REFERENCE_TABLE_SINGLE_COLUMN_REGEX);
        const RE_MULTI = new RegExp(REFERENCE_TABLE_MULTIPLE_COLUMN_REGEX);

        // Single
        it('single: tag order after column (Totals)', () => {
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1[[Column1],[#Totals]]')).toBe(false);
        });

        it('single: multiple tags after column', () => {
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1[[Column1],[#Headers],[#Data]]')).toBe(false);
        });

        it('single: excessive spaces around comma', () => {
            RE_SINGLE.lastIndex = 0;
            expect(RE_SINGLE.test('Table1[[#Data]   ,   [Column1]]')).toBe(true);
        });

        // Multi
        it('multi: tag after range', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[[Column1]:[Column10],[#All]]')).toBe(false);
        });

        it('multi: multiple tags before range', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[[#Data],[#Totals],[Column1]:[Column10]]')).toBe(true);
        });

        it('multi: excessive spaces around colon and tags', () => {
            RE_MULTI.lastIndex = 0;
            expect(RE_MULTI.test('Table1[[#All]  , [Column1]  :   [Column10]]')).toBe(true);
        });
    });

    describe('Single all column test', () => {
        const FULL_SINGLE = new RegExp(REFERENCE_TABLE_ALL_COLUMN_REGEX);

        // Should match a plain table name (shorthand for #All)
        it('matches plain table name', () => {
            FULL_SINGLE.lastIndex = 0;
            expect(FULL_SINGLE.test('Table1')).toBe(true);
        });

        // Should not match an empty bracket (invalid structured reference)
        it('rejects empty brackets', () => {
            FULL_SINGLE.lastIndex = 0;
            expect(FULL_SINGLE.test('Table1[]')).toBe(false);
        });

        // Should not match strings with non-table prefix
        it('rejects prefixed string', () => {
            FULL_SINGLE.lastIndex = 0;
            expect(FULL_SINGLE.test('122Table1')).toBe(true);
        });

        // Should not match column-qualified reference (not a pure whole-table reference)
        it('rejects table with column reference', () => {
            FULL_SINGLE.lastIndex = 0;
            expect(FULL_SINGLE.test('Table1[Column1]')).toBe(false);
        });
    });

    describe('Title-only hash test', () => {
        const TITLE_ONLY = new RegExp(REFERENCE_TABLE_TITLE_ONLY_ANY_HASH_REGEX);

        // Should match a basic title-only structured reference, e.g. Table1[#Headers]
        it('matches simple hash title', () => {
            TITLE_ONLY.lastIndex = 0;
            expect(TITLE_ONLY.test('Table1[#Headers]')).toBe(true);
        });

        // Should match arbitrary hash names, not only Excel built-ins
        it('matches any #title content', () => {
            TITLE_ONLY.lastIndex = 0;
            expect(TITLE_ONLY.test('Table1[#FooBar]')).toBe(true);
        });

        // Should allow spaces inside the bracket
        it('matches hash title with spaces', () => {
            TITLE_ONLY.lastIndex = 0;
            expect(TITLE_ONLY.test('Table1[#This Row]')).toBe(true);
        });

        // Should allow sheet/unit prefix if UNIT_NAME_REGEX supports it
        it('rejects unit prefix', () => {
            TITLE_ONLY.lastIndex = 0;
            expect(TITLE_ONLY.test('Sheet1!TableA[#Data]')).toBe(false);
        });

        // Should reject non-hash titles
        it('rejects normal column name', () => {
            TITLE_ONLY.lastIndex = 0;
            expect(TITLE_ONLY.test('Table1[Column1]')).toBe(false);
        });

        // Should reject missing content after #
        it('rejects # with no content', () => {
            TITLE_ONLY.lastIndex = 0;
            expect(TITLE_ONLY.test('Table1[#]')).toBe(false);
        });

        // Should reject nested blocks (multiple bracket groups)
        it('rejects multiple bracket segments', () => {
            TITLE_ONLY.lastIndex = 0;
            expect(TITLE_ONLY.test('Table1[#Headers][#Data]')).toBe(false);
        });

        // Should reject empty bracket
        it('rejects empty bracket', () => {
            TITLE_ONLY.lastIndex = 0;
            expect(TITLE_ONLY.test('Table1[]')).toBe(false);
        });

        // Should reject malformed formats
        it('rejects malformed hash block', () => {
            TITLE_ONLY.lastIndex = 0;
            expect(TITLE_ONLY.test('Table1[#Headers')).toBe(false); // missing ]
        });

        // Should reject trailing characters after the bracket
        it('rejects trailing characters', () => {
            TITLE_ONLY.lastIndex = 0;
            expect(TITLE_ONLY.test('Table1[#Headers]Extra')).toBe(false);
        });
    });
});
