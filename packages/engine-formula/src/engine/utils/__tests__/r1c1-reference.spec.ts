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

import { AbsoluteRefType, type IRange } from '@univerjs/core';
import { describe, expect, it } from 'vitest';

import { deserializeRangeForR1C1, serializeRangeToR1C1 } from '../r1c1-reference';

describe('Test Reference R1C1', () => {
    it('deserializeRangeForR1C1', () => {
        expect(deserializeRangeForR1C1('[workbook1]sheet1!R1C1:R5C10')).toStrictEqual({
            range: {
                endAbsoluteRefType: 0,
                endColumn: 9,
                endRow: 4,
                startAbsoluteRefType: 0,
                startColumn: 0,
                startRow: 0,
            },
            sheetName: 'sheet1',
            unitId: 'workbook1',
        });

        expect(deserializeRangeForR1C1('[workbook1]sheet1!R[-3]C[-3]:R5C10', 4, 5)).toStrictEqual({
            range: {
                endAbsoluteRefType: 0,
                endColumn: 9,
                endRow: 4,
                startAbsoluteRefType: 0,
                startColumn: 2,
                startRow: 1,
            },
            sheetName: 'sheet1',
            unitId: 'workbook1',
        });

        expect(deserializeRangeForR1C1('[workbook1]sheet1!R3C[-3]:R5C[2]', 4, 5)).toStrictEqual({
            range: {
                endAbsoluteRefType: 0,
                endColumn: 7,
                endRow: 4,
                startAbsoluteRefType: 0,
                startColumn: 2,
                startRow: 2,
            },
            sheetName: 'sheet1',
            unitId: 'workbook1',
        });
    });

    describe('serializeRangeToR1C1', () => {
        it('should convert single cell reference correctly', () => {
            const range: IRange = { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 };
            expect(serializeRangeToR1C1(range)).toEqual('R1C1:R2C2');
        });

        it('should convert range reference correctly', () => {
            const range: IRange = { startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 };
            expect(serializeRangeToR1C1(range)).toEqual('R1C1:R3C3');
        });

        it('should handle absolute row references', () => {
            const range: IRange = {
                startRow: 1,
                startColumn: 1,
                endRow: 2,
                endColumn: 2,
                startAbsoluteRefType: AbsoluteRefType.ROW,
                endAbsoluteRefType: AbsoluteRefType.ROW,
            };
            expect(serializeRangeToR1C1(range)).toEqual('R2C[2]:R3C[3]');
        });

        it('should handle absolute column references', () => {
            const range: IRange = {
                startRow: 1,
                startColumn: 1,
                endRow: 2,
                endColumn: 2,
                startAbsoluteRefType: AbsoluteRefType.COLUMN,
                endAbsoluteRefType: AbsoluteRefType.COLUMN,
            };
            expect(serializeRangeToR1C1(range)).toEqual('R[2]C2:R[3]C3');
        });

        it('should handle all absolute references', () => {
            const range: IRange = {
                startRow: 1,
                startColumn: 1,
                endRow: 2,
                endColumn: 2,
                startAbsoluteRefType: AbsoluteRefType.ALL,
                endAbsoluteRefType: AbsoluteRefType.ALL,
            };
            expect(serializeRangeToR1C1(range)).toEqual('R2C2:R3C3');
        });
        it('should handle all absolute references', () => {
            const range: IRange = {
                startRow: 1,
                startColumn: 1,
                endRow: 2,
                endColumn: 2,
                startAbsoluteRefType: AbsoluteRefType.NONE,
                endAbsoluteRefType: AbsoluteRefType.NONE,
            };
            expect(serializeRangeToR1C1(range)).toEqual('R[2]C[2]:R[3]C[3]');
        });
        it('should handle all absolute references', () => {
            const range: IRange = {
                startRow: 1,
                startColumn: 1,
                endRow: 2,
                endColumn: 2,
            };
            expect(serializeRangeToR1C1(range)).toEqual('R2C2:R3C3');
        });
    });
});
