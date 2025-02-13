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

import { AbsoluteRefType, RANGE_TYPE } from '@univerjs/core';
import { describe, expect, it } from 'vitest';

import {
    deserializeRangeWithSheet,
    getAbsoluteRefTypeWithSingleString,
    getAbsoluteRefTypeWitString,
    handleRefStringInfo,
    isReferenceStrings,
    isReferenceStringWithEffectiveColumn,
    needsQuoting,
    serializeRange,
    serializeRangeToRefString,
} from '../reference';

describe('Test Reference', () => {
    it('getAbsoluteRefTypeWithSingleString', () => {
        expect(getAbsoluteRefTypeWithSingleString('A4')).toEqual(AbsoluteRefType.NONE);

        expect(getAbsoluteRefTypeWithSingleString('$A4')).toEqual(AbsoluteRefType.COLUMN);

        expect(getAbsoluteRefTypeWithSingleString('A$4')).toEqual(AbsoluteRefType.ROW);

        expect(getAbsoluteRefTypeWithSingleString('$A$4')).toEqual(AbsoluteRefType.ALL);
    });

    it('getAbsoluteRefTypeWitString', () => {
        expect(getAbsoluteRefTypeWitString('A5')).toStrictEqual({ startAbsoluteRefType: AbsoluteRefType.NONE });

        expect(getAbsoluteRefTypeWitString('A5:B10')).toStrictEqual({
            startAbsoluteRefType: AbsoluteRefType.NONE,
            endAbsoluteRefType: AbsoluteRefType.NONE,
        });

        expect(getAbsoluteRefTypeWitString('A5:B$10')).toStrictEqual({
            startAbsoluteRefType: AbsoluteRefType.NONE,
            endAbsoluteRefType: AbsoluteRefType.ROW,
        });

        expect(getAbsoluteRefTypeWitString('$A$5:$B$10')).toStrictEqual({
            startAbsoluteRefType: AbsoluteRefType.ALL,
            endAbsoluteRefType: AbsoluteRefType.ALL,
        });
    });

    it('serializeRange', () => {
        expect(
            serializeRange({
                startColumn: 0,
                endColumn: 10,
                startRow: 5,
                endRow: 10,
            })
        ).toEqual('A6:K11');

        expect(
            serializeRange({
                startColumn: 0,
                endColumn: 10,
                startRow: 5,
                endRow: 10,
                rangeType: RANGE_TYPE.COLUMN,
            })
        ).toEqual('A:K');

        expect(
            serializeRange({
                startColumn: 0,
                endColumn: 10,
                startRow: 5,
                endRow: 10,
                rangeType: RANGE_TYPE.ROW,
            })
        ).toEqual('6:11');

        expect(
            serializeRange({
                startColumn: 0,
                endColumn: 10,
                startRow: 5,
                endRow: 10,
                rangeType: RANGE_TYPE.ALL,
            })
        ).toEqual('6:11');
    });

    it('serializeRangeToRefString', () => {
        expect(
            serializeRangeToRefString({
                range: {
                    startColumn: 0,
                    endColumn: 10,
                    startRow: 5,
                    endRow: 10,
                    rangeType: RANGE_TYPE.COLUMN,
                },
                sheetName: '',
                unitId: '',
            })
        ).toEqual('A:K');
        expect(
            serializeRangeToRefString({
                range: {
                    startColumn: 0,
                    endColumn: 10,
                    startRow: 5,
                    endRow: 10,
                    rangeType: RANGE_TYPE.COLUMN,
                },
                sheetName: 'sheet1',
                unitId: 'workbook1',
            })
        ).toEqual('[workbook1]sheet1!A:K');
        expect(
            serializeRangeToRefString({
                range: {
                    startColumn: Number.NaN,
                    endColumn: Number.NaN,
                    startRow: 15,
                    endRow: 15,
                    rangeType: RANGE_TYPE.ROW,
                },
                sheetName: 'sheet-1',
                unitId: 'workbook1',
            })
        ).toEqual("'[workbook1]sheet-1'!16:16");
        expect(
            serializeRangeToRefString({
                range: {
                    startColumn: Number.NaN,
                    endColumn: Number.NaN,
                    startRow: 15,
                    endRow: 15,
                    rangeType: RANGE_TYPE.ROW,
                },
                sheetName: 'sheet1',
                unitId: 'workbook-1',
            })
        ).toEqual("'[workbook-1]sheet1'!16:16");
        expect(
            serializeRangeToRefString({
                range: {
                    startColumn: Number.NaN,
                    endColumn: Number.NaN,
                    startRow: 15,
                    endRow: 15,
                    rangeType: RANGE_TYPE.ROW,
                },
                sheetName: "sheet'1",
                unitId: '',
            })
        ).toEqual("'sheet''1'!16:16");
        expect(
            serializeRangeToRefString({
                range: {
                    startColumn: Number.NaN,
                    endColumn: Number.NaN,
                    startRow: 15,
                    endRow: 15,
                    rangeType: RANGE_TYPE.ROW,
                },
                sheetName: "sheet''1",
                unitId: '',
            })
        ).toEqual("'sheet''''1'!16:16");
        expect(
            serializeRangeToRefString({
                range: {
                    startColumn: Number.NaN,
                    endColumn: Number.NaN,
                    startRow: 15,
                    endRow: 15,
                    rangeType: RANGE_TYPE.ROW,
                },
                sheetName: "sheet'1",
                unitId: 'workbook-1',
            })
        ).toEqual("'[workbook-1]sheet''1'!16:16");
    });

    it('deserializeRangeWithSheet', () => {
        expect(deserializeRangeWithSheet('[workbook1]sheet1!A5:B10')).toStrictEqual({
            range: {
                endAbsoluteRefType: 0,
                endColumn: 1,
                endRow: 9,
                startAbsoluteRefType: 0,
                startColumn: 0,
                startRow: 4,
                rangeType: RANGE_TYPE.NORMAL,
            },
            sheetName: 'sheet1',
            unitId: 'workbook1',
        });

        expect(deserializeRangeWithSheet('[workbook2]sheet1!A5:B$10')).toStrictEqual({
            range: {
                endAbsoluteRefType: AbsoluteRefType.ROW,
                endColumn: 1,
                endRow: 9,
                startAbsoluteRefType: 0,
                startColumn: 0,
                startRow: 4,
                rangeType: RANGE_TYPE.NORMAL,
            },
            sheetName: 'sheet1',
            unitId: 'workbook2',
        });

        expect(deserializeRangeWithSheet('[workbook2]sheet1!A:B')).toStrictEqual({
            range: {
                endAbsoluteRefType: AbsoluteRefType.NONE,
                endColumn: 1,
                endRow: Number.NaN,
                startAbsoluteRefType: AbsoluteRefType.NONE,
                startColumn: 0,
                startRow: Number.NaN,
                rangeType: RANGE_TYPE.COLUMN,
            },
            sheetName: 'sheet1',
            unitId: 'workbook2',
        });

        expect(deserializeRangeWithSheet('[workbook2]sheet1!10:100')).toStrictEqual({
            range: {
                endAbsoluteRefType: AbsoluteRefType.NONE,
                endColumn: Number.NaN,
                endRow: 99,
                startAbsoluteRefType: AbsoluteRefType.NONE,
                startColumn: Number.NaN,
                startRow: 9,
                rangeType: RANGE_TYPE.ROW,
            },
            sheetName: 'sheet1',
            unitId: 'workbook2',
        });

        expect(deserializeRangeWithSheet('10:100')).toStrictEqual({
            range: {
                endAbsoluteRefType: AbsoluteRefType.NONE,
                endColumn: Number.NaN,
                endRow: 99,
                startAbsoluteRefType: AbsoluteRefType.NONE,
                startColumn: Number.NaN,
                startRow: 9,
                rangeType: RANGE_TYPE.ROW,
            },
            sheetName: '',
            unitId: '',
        });

        expect(deserializeRangeWithSheet('[workbook2]\'sheet-1\'!10:100')).toStrictEqual({
            range: {
                endAbsoluteRefType: AbsoluteRefType.NONE,
                endColumn: Number.NaN,
                endRow: 99,
                startAbsoluteRefType: AbsoluteRefType.NONE,
                startColumn: Number.NaN,
                startRow: 9,
                rangeType: RANGE_TYPE.ROW,
            },
            sheetName: 'sheet-1',
            unitId: 'workbook2',
        });

        expect(deserializeRangeWithSheet('[workbook1]sheet1!$A$5:$B$10')).toStrictEqual({
            range: {
                endAbsoluteRefType: 3,
                endColumn: 1,
                endRow: 9,
                startAbsoluteRefType: 3,
                startColumn: 0,
                startRow: 4,
                rangeType: RANGE_TYPE.NORMAL,
            },
            sheetName: 'sheet1',
            unitId: 'workbook1',
        });
    });

    it('needsQuoting', () => {
        const testTrueCases = [
            'sheet-1',
            'sheet 1',
            'B1048577',
            'RC',
            'RC2',
            'R5C',
            'R-4C',
            'RC-8',
            'R',
            'C',
            '99',
            '1.5',
            '12a',
            '💩a',
            '❤️b',
            "Sheet'1",
            '!Sheet',
            '！Sheet',
            'Sheet1（副本）',
            'Sheet4(Copy)',
        ];
        const testFalseCase = ['Sheet1', '工作表1'];

        testTrueCases.forEach((testTrueCase) => {
            expect(needsQuoting(testTrueCase)).toBeTruthy();
        });
        testFalseCase.forEach((testFalseCase) => {
            expect(needsQuoting(testFalseCase)).toBeFalsy();
        });
    });

    it('handleRefStringInfo', () => {
        expect(handleRefStringInfo('A1:A2')).toStrictEqual({
            refBody: 'A1:A2',
            sheetName: '',
            unitId: '',
        });

        expect(handleRefStringInfo('sheet1!A1')).toStrictEqual({
            refBody: 'A1',
            sheetName: 'sheet1',
            unitId: '',
        });

        expect(handleRefStringInfo('[Book1]Sheet1!A1')).toStrictEqual({
            refBody: 'A1',
            sheetName: 'Sheet1',
            unitId: 'Book1',
        });
        expect(handleRefStringInfo("'[Book1]Sheet1'!R2C3")).toStrictEqual({
            refBody: 'R2C3',
            sheetName: 'Sheet1',
            unitId: 'Book1',
        });

        expect(handleRefStringInfo("'sheet-1'!A1")).toStrictEqual({
            refBody: 'A1',
            sheetName: 'sheet-1',
            unitId: '',
        });

        // with single quote
        expect(handleRefStringInfo("'sheet''1'!A1")).toStrictEqual({
            refBody: 'A1',
            sheetName: "sheet'1",
            unitId: '',
        });

        // with double quote
        expect(handleRefStringInfo("'sheet''''1'!A1")).toStrictEqual({
            refBody: 'A1',
            sheetName: "sheet''1",
            unitId: '',
        });

        expect(handleRefStringInfo("'[Book-1.xlsx]Sheet1'!$A$4")).toStrictEqual({
            refBody: '$A$4',
            sheetName: 'Sheet1',
            unitId: 'Book-1.xlsx',
        });

        // with single quote
        expect(handleRefStringInfo("'[Book''1.xlsx]Sheet1'!$A$4")).toStrictEqual({
            refBody: '$A$4',
            sheetName: 'Sheet1',
            unitId: "Book'1.xlsx",
        });

        // with double quote
        expect(handleRefStringInfo("'[Book''''1.xlsx]Sheet1'!$A$4")).toStrictEqual({
            refBody: '$A$4',
            sheetName: 'Sheet1',
            unitId: "Book''1.xlsx",
        });

        expect(handleRefStringInfo("'[Book-1.xlsx]sheet-1'!$A$4")).toStrictEqual({
            refBody: '$A$4',
            sheetName: 'sheet-1',
            unitId: 'Book-1.xlsx',
        });
    });

    it('isReferenceStringWithEffectiveColumn', () => {
        expect(isReferenceStringWithEffectiveColumn('A1:A2')).toBeTruthy();

        expect(isReferenceStringWithEffectiveColumn('AAA1')).toBeTruthy();

        expect(isReferenceStringWithEffectiveColumn('DefinedName1')).toBeFalsy();

        expect(isReferenceStringWithEffectiveColumn('XFD1')).toBeTruthy();

        expect(isReferenceStringWithEffectiveColumn('XFE1')).toBeFalsy();
    });

    it('isReferenceStrings', () => {
        expect(isReferenceStrings('A1:B10,B30:C20')).toBeTruthy();
        expect(isReferenceStrings('A1:B10,DefinedName1')).toBeFalsy();
        expect(isReferenceStrings('A1:B10,XFD1,Sheet1!A1')).toBeTruthy();
        expect(isReferenceStrings('A1:B10,Sheet1!A1')).toBeTruthy();
        expect(isReferenceStrings('A1:B10,Sheet1!A1,Sheet2!A1')).toBeTruthy();
        expect(isReferenceStrings('A1:B10,Sheet1!A1,Sheet2!A1,DefinedName1')).toBeFalsy();
        expect(isReferenceStrings('A1:B10,Sheet1!A1,Sheet2!A1,DefinedName1,Sheet3!A1')).toBeFalsy();
        expect(isReferenceStrings('A1:B10,')).toBeFalsy();
        expect(isReferenceStrings('A1:B10,  B30:C20')).toBeTruthy();
    });
});
