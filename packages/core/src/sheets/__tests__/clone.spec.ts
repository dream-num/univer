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
import { SheetTypes } from '../../types/enum/sheet-types';
import { BooleanNumber } from '../../types/enum/text-style';
import { cloneCellData, cloneCellDataWithSpanAndDisplay, cloneWorksheetData } from '../clone';
import { FormulaType } from '../typedef';
import { createCoreTestBed } from './create-core-test-bed';

describe('formula metadata cloning', () => {
    it.each([BooleanNumber.FALSE, BooleanNumber.TRUE])('retains the array kind and dynamic flag %s in cell and clipboard clones', (fd) => {
        const source = { f: '=SUM(A1:A2)', ft: FormulaType.ARRAY, fd };
        expect(cloneCellData(source)).toEqual(source);
        expect(cloneCellDataWithSpanAndDisplay({ ...source, rowSpan: 2, displayV: '3' })).toEqual({
            ...source,
            rowSpan: 2,
            displayV: '3',
        });
        expect(cloneCellData({ v: 'text' })).toEqual({ v: 'text' });
    });
});

describe('worksheet type snapshots', () => {
    it.each([undefined, BooleanNumber.FALSE, BooleanNumber.TRUE])('preserves optional Chart Sheet fit mode %s through clone, save and reopen', (zoomToFit) => {
        const { univer, sheet } = createCoreTestBed();
        try {
            sheet.addWorksheet('fit', 1, {
                id: 'fit',
                type: SheetTypes.CHART,
                zoomRatio: 0.75,
                ...(zoomToFit === undefined ? {} : { zoomToFit }),
            });
            const copy = cloneWorksheetData(sheet.getSheetBySheetId('fit')!.getSnapshot());
            copy.id = 'fit-copy';
            sheet.addWorksheet(copy.id, 2, copy);
            const saved = JSON.parse(JSON.stringify(sheet.save()));
            const reopened = createCoreTestBed(saved);
            try {
                for (const id of ['fit', 'fit-copy']) {
                    const actual = reopened.sheet.getSheetBySheetId(id)!.getSnapshot();
                    expect(actual.zoomRatio).toBe(0.75);
                    if (zoomToFit === undefined) {
                        expect(actual).not.toHaveProperty('zoomToFit');
                    } else {
                        expect(actual.zoomToFit).toBe(zoomToFit);
                    }
                }
            } finally {
                reopened.univer.dispose();
            }
        } finally {
            univer.dispose();
        }
    });

    it.each([undefined, SheetTypes.GRID])('preserves legacy grid type %s through clone, save and reopen without adding a missing field', (type) => {
        const { univer, sheet } = createCoreTestBed();
        try {
            const original = sheet.getSheetBySheetId('sheet1')!;
            if (type !== undefined) {
                original.getConfig().type = type;
            }
            const copy = cloneWorksheetData(original.getSnapshot());
            copy.id = 'grid-copy';
            sheet.addWorksheet(copy.id, 1, copy);
            const reopened = createCoreTestBed(JSON.parse(JSON.stringify(sheet.save())));
            try {
                for (const id of ['sheet1', copy.id]) {
                    const worksheet = reopened.sheet.getSheetBySheetId(id)!;
                    expect(worksheet.getCell(0, 0)?.v).toBe('A1');
                    expect(worksheet.getSnapshot().type).toBe(type);
                    expect('type' in worksheet.getSnapshot()).toBe(type !== undefined);
                }
            } finally {
                reopened.univer.dispose();
            }
        } finally {
            univer.dispose();
        }
    });

    it('preserves the chart sheet wire type and empty worksheet when cloning for insertion', () => {
        const { univer, sheet } = createCoreTestBed();
        try {
            sheet.addWorksheet('chart-sheet', 1, {
                id: 'chart-sheet',
                type: SheetTypes.CHART,
                cellData: {},
            });
            const chartSheet = sheet.getSheetBySheetId('chart-sheet')!;
            const copied = cloneWorksheetData(chartSheet.getSnapshot());
            copied.id = 'chart-copy';
            sheet.addWorksheet(copied.id, 2, cloneWorksheetData(copied));

            const chartCopy = sheet.getSheetBySheetId('chart-copy')!;
            expect(chartCopy.getSnapshot().type).toBe(3);
            expect(chartCopy.getSnapshot().cellData).toEqual({});
            expect(chartCopy).not.toBe(chartSheet);
            expect(sheet.getSheetBySheetId('chart-sheet')).toBe(chartSheet);
            expect(sheet.getSheetBySheetId('chart-copy')).toBe(chartCopy);
            expect(sheet.save().sheets['chart-copy'].type).toBe(3);
        } finally {
            univer.dispose();
        }
    });
});
