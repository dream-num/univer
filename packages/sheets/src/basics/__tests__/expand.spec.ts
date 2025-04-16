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

import { beforeEach, describe, expect, it } from 'vitest';
import type { Workbook } from '@univerjs/core';
import { createCoreTestBed } from '@univerjs/core/sheets/__tests__/create-core-test-bed.js';
import { expandToContinuousRange } from '../expand-range';
import { snapshot } from './expand.data';

// the work book can be get 'unit=YSvbxFMCTxugbku-IWNyxQ&type=2&subunit=U_wr1DEF84N_mbesFNmxR' in pro
describe('Test expandToContinuousRange', () => {
    let workbook: Workbook;
    const directions = {
        left: true,
        right: true,
        up: true,
        down: true,
    };

    beforeEach(() => {
        const testBed = createCoreTestBed(snapshot);
        workbook = testBed.sheet;
    });
    it('Test expandToContinuousRange all', () => {
        const range = {
            startRow: 13,
            startColumn: 7,
            endRow: 13,
            endColumn: 7,
        };
        const result = expandToContinuousRange(range, directions, workbook.getActiveSheet());
        const { startRow, startColumn, endColumn, endRow } = result;
        expect(startRow).toEqual(3);
        expect(startColumn).toEqual(3);
        expect(endColumn).toEqual(17);
        expect(endRow).toEqual(21);
    });
    it('can not expand', () => {
        const range = {
            startRow: 28,
            startColumn: 9,
            endRow: 28,
            endColumn: 9,
        };
        const result = expandToContinuousRange(range, directions, workbook.getActiveSheet());
        const { startRow, startColumn, endColumn, endRow } = result;
        expect(startRow).toEqual(range.startRow);
        expect(startColumn).toEqual(range.startColumn);
        expect(endColumn).toEqual(range.endColumn);
        expect(endRow).toEqual(range.endRow);
    });

    it('Test expandToContinuousRange with range', () => {
        const range = {
            startRow: 8,
            startColumn: 7,
            endRow: 12,
            endColumn: 8,
        };
        const result = expandToContinuousRange(range, directions, workbook.getActiveSheet());
        const { startRow, startColumn, endColumn, endRow } = result;
        expect(startRow).toEqual(3);
        expect(startColumn).toEqual(3);
        expect(endColumn).toEqual(17);
        expect(endRow).toEqual(21);
    });

    it('expand to right', () => {
        const range = {
            startRow: 29,
            startColumn: 16,
            endRow: 29,
            endColumn: 16,
        };
        const result = expandToContinuousRange(range, directions, workbook.getActiveSheet());
        const { startRow, startColumn, endColumn, endRow } = result;
        expect(startRow).toEqual(27);
        expect(startColumn).toEqual(16);
        expect(endColumn).toEqual(19);
        expect(endRow).toEqual(29);
    });
    it('expand to left', () => {
        const range = {
            startRow: 41,
            startColumn: 8,
            endRow: 41,
            endColumn: 8,
        };
        const result = expandToContinuousRange(range, directions, workbook.getActiveSheet());
        const { startRow, startColumn, endColumn, endRow } = result;
        expect(startRow).toEqual(41);
        expect(startColumn).toEqual(5);
        expect(endColumn).toEqual(8);
        expect(endRow).toEqual(44);
    });

    it('expand to empty span', () => {
        const range = {
            startRow: 41,
            startColumn: 4,
            endRow: 41,
            endColumn: 4,
        };
        const result = expandToContinuousRange(range, directions, workbook.getActiveSheet());
        const { startRow, startColumn, endColumn, endRow } = result;
        expect(startRow).toEqual(41);
        expect(startColumn).toEqual(4);
        expect(endColumn).toEqual(7);
        expect(endRow).toEqual(43);
    });
});
