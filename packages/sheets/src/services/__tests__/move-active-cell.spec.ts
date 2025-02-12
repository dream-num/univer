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

import type { ISelectionWithStyle } from '../../basics';
import { Direction, type Worksheet } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { getNextPrimaryCell } from '../selections/move-active-cell-util';
import { createTestBase } from './util';

describe('Test move active cell', () => {
    let sheet: Worksheet;
    let selections: ISelectionWithStyle[];
    beforeEach(() => {
        const testBed = createTestBase(undefined);
        sheet = testBed.sheet.getActiveSheet()!;
        selections = [
            {
                range: {
                    startRow: 0,
                    startColumn: 0,
                    endRow: 3,
                    endColumn: 2,
                    rangeType: 0,
                    unitId: 'workbook-01',
                    sheetId: 'cEJnka85APUJkzGG8SB4w',
                },
                primary: null,
                style: {
                    strokeWidth: 1,
                    stroke: '#274fee',
                    fill: 'rgba(39,79,238,0.07)',
                    widgets: {},
                    widgetSize: 6,
                    widgetStrokeWidth: 1,
                    widgetStroke: '#ffffff',
                    autofillSize: 6,
                    autofillStrokeWidth: 1,
                    autofillStroke: '#ffffff',
                    rowHeaderFill: 'rgba(39,79,238,0.07)',
                    rowHeaderStroke: '#274fee',
                    rowHeaderStrokeWidth: 1,
                    columnHeaderFill: 'rgba(39,79,238,0.07)',
                    columnHeaderStroke: '#274fee',
                    columnHeaderStrokeWidth: 1,
                    expandCornerSize: 40,
                },
            },
            {
                range: {
                    startRow: 4,
                    startColumn: 3,
                    endRow: 7,
                    endColumn: 5,
                    rangeType: 0,
                    unitId: 'workbook-01',
                    sheetId: 'cEJnka85APUJkzGG8SB4w',
                },
                primary: {
                    actualRow: 4,
                    actualColumn: 3,
                    isMerged: false,
                    isMergedMainCell: false,
                    startRow: 4,
                    startColumn: 3,
                    endRow: 4,
                    endColumn: 3,
                },
                style: {
                    strokeWidth: 1,
                    stroke: '#274fee',
                    fill: 'rgba(39,79,238,0.07)',
                    widgets: {},
                    widgetSize: 6,
                    widgetStrokeWidth: 1,
                    widgetStroke: '#ffffff',
                    autofillSize: 6,
                    autofillStrokeWidth: 1,
                    autofillStroke: '#ffffff',
                    rowHeaderFill: 'rgba(39,79,238,0.07)',
                    rowHeaderStroke: '#274fee',
                    rowHeaderStrokeWidth: 1,
                    columnHeaderFill: 'rgba(39,79,238,0.07)',
                    columnHeaderStroke: '#274fee',
                    columnHeaderStrokeWidth: 1,
                    expandCornerSize: 40,
                },
            },
        ];
    });
    it('move up', () => {
        const rs = getNextPrimaryCell(selections, Direction.UP, sheet);
        expect(rs).toEqual({
            startRow: 3,
            startColumn: 2,
            endRow: 3,
            endColumn: 2,
        });
    });
    it('move right', () => {
        const rs = getNextPrimaryCell(selections, Direction.RIGHT, sheet);
        expect(rs).toEqual({
            startRow: 4,
            startColumn: 4,
            endRow: 4,
            endColumn: 4,
        });
    });
    it('move down', () => {
        const rs = getNextPrimaryCell(selections, Direction.DOWN, sheet);
        expect(rs).toEqual({
            startRow: 5,
            startColumn: 3,
            endRow: 5,
            endColumn: 3,
        });
    });
    it('move left', () => {
        const rs = getNextPrimaryCell(selections, Direction.LEFT, sheet);
        expect(rs).toEqual({
            startRow: 3,
            startColumn: 2,
            endRow: 3,
            endColumn: 2,
        });
    });
});

describe('Test move active cell with merged cell', () => {
    let sheet: Worksheet;
    let selections: ISelectionWithStyle[];
    beforeEach(() => {
        const testBed = createTestBase(undefined);
        sheet = testBed.sheet.getActiveSheet()!;
        sheet.setMergeData([{
            startRow: 1,
            startColumn: 1,
            endRow: 2,
            endColumn: 2,
            rangeType: 0,
            unitId: 'workbook-01',
            sheetId: 'QzJ-nUESkG_1_4KWI_EUz',
        }]);
        selections = [
            {
                range: {
                    startRow: 0,
                    startColumn: 0,
                    endRow: 3,
                    endColumn: 3,
                    rangeType: 0,
                    unitId: 'workbook-01',
                    sheetId: 'QzJ-nUESkG_1_4KWI_EUz',
                },
                primary: {
                    actualRow: 1,
                    actualColumn: 3,
                    isMerged: false,
                    isMergedMainCell: true,
                    startRow: 1,
                    startColumn: 3,
                    endRow: 1,
                    endColumn: 3,
                },
                style: {
                    strokeWidth: 1,
                    stroke: '#274fee',
                    fill: 'rgba(39,79,238,0.07)',
                    widgets: {},
                    widgetSize: 6,
                    widgetStrokeWidth: 1,
                    widgetStroke: '#ffffff',
                    autofillSize: 6,
                    autofillStrokeWidth: 1,
                    autofillStroke: '#ffffff',
                    rowHeaderFill: 'rgba(39,79,238,0.07)',
                    rowHeaderStroke: '#274fee',
                    rowHeaderStrokeWidth: 1,
                    columnHeaderFill: 'rgba(39,79,238,0.07)',
                    columnHeaderStroke: '#274fee',
                    columnHeaderStrokeWidth: 1,
                    expandCornerSize: 40,
                },
            },
        ];
    });
    it('move up', () => {
        const rs = getNextPrimaryCell(selections, Direction.UP, sheet);
        expect(rs).toEqual({
            startRow: 0,
            startColumn: 3,
            endRow: 0,
            endColumn: 3,
        });
    });
    it('last cell move right', () => {
        const rs = getNextPrimaryCell(selections, Direction.RIGHT, sheet);
        expect(rs).toEqual({
            startRow: 2,
            startColumn: 0,
            endRow: 2,
            endColumn: 0,
        });
    });
    it('move down', () => {
        const rs = getNextPrimaryCell(selections, Direction.DOWN, sheet);
        expect(rs).toEqual({
            startRow: 2,
            startColumn: 3,
            endRow: 2,
            endColumn: 3,
        });
    });
    it('move left', () => {
        const rs = getNextPrimaryCell(selections, Direction.LEFT, sheet);
        // return the merged cell in B2:C3
        expect(rs).toEqual({
            startRow: 1,
            startColumn: 1,
            endRow: 2,
            endColumn: 2,
        });
    });
});
