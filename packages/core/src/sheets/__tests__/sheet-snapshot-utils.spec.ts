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
import type { IWorksheetData } from '../typedef';
import { BooleanNumber } from '../../types/enum';
import {
    DEFAULT_WORKSHEET_COLUMN_WIDTH,
    DEFAULT_WORKSHEET_ROW_HEIGHT,
    mergeWorksheetSnapshotWithDefault,
} from '../sheet-snapshot-utils';
import { createCoreTestBed } from './create-core-test-bed';

describe('worksheet dimension normalization', () => {
    it.each([-232.90908628521544, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, '88', null])(
        'repairs invalid dimensions %s without losing column or row metadata',
        (value) => {
            const snapshot = mergeWorksheetSnapshotWithDefault({
                defaultColumnWidth: 90.5,
                defaultRowHeight: 25.5,
                columnData: { 0: { w: value as number, hd: BooleanNumber.TRUE, s: 'column-style' } },
                rowData: { 0: { h: value as number, ah: value as number, ia: BooleanNumber.TRUE, s: 'row-style' } },
            });
            expect(snapshot.columnData[0]).toEqual({ w: 0, hd: BooleanNumber.TRUE, s: 'column-style' });
            expect(snapshot.rowData[0]).toEqual({ h: 0, ia: BooleanNumber.TRUE, s: 'row-style' });
        }
    );

    it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, '24', null])(
        'uses built-in defaults when worksheet defaults are invalid: %s',
        (value) => {
            const snapshot = mergeWorksheetSnapshotWithDefault({
                defaultColumnWidth: value as number,
                defaultRowHeight: value as number,
                columnData: { 0: { w: -1 } },
                rowData: { 0: { h: -1 } },
            });
            expect(snapshot.defaultColumnWidth).toBe(DEFAULT_WORKSHEET_COLUMN_WIDTH);
            expect(snapshot.defaultRowHeight).toBe(DEFAULT_WORKSHEET_ROW_HEIGHT);
            expect(snapshot.columnData[0].w).toBe(0);
            expect(snapshot.rowData[0].h).toBe(0);
        }
    );

    it('preserves zero sizes, fractional sizes, hidden state and sparse data', () => {
        const snapshot = mergeWorksheetSnapshotWithDefault({
            columnData: { 0: { w: 0 }, 100: { w: 114.3671875, hd: BooleanNumber.TRUE } },
            rowData: { 0: { h: 0, ah: 0 }, 100: { h: 25.5, ah: 32.5 } },
        });
        expect(snapshot.columnData).toEqual({ 0: { w: 0 }, 100: { w: 114.3671875, hd: BooleanNumber.TRUE } });
        expect(snapshot.rowData).toEqual({ 0: { h: 0, ah: 0 }, 100: { h: 25.5, ah: 32.5 } });
    });

    it('uses worksheet defaults for missing dimensions instead of collapsing the row or column', () => {
        const testBed = createCoreTestBed();
        try {
            const worksheet = testBed.sheet.getActiveSheet()!;
            const config = worksheet.getConfig();
            config.defaultColumnWidth = 90.5;
            config.defaultRowHeight = 25.5;
            config.columnData[0] = { s: 'column-style' };
            config.rowData[0] = { ah: 0, s: 'row-style' };
            expect(worksheet.getColumnWidth(0)).toBe(90.5);
            expect(worksheet.getRowHeight(0)).toBe(25.5);
            expect(worksheet.getColumnWidth(2)).toBe(90.5);
            expect(worksheet.getRowHeight(2)).toBe(25.5);
        } finally {
            testBed.univer.dispose();
        }
    });

    it('persists repaired dimensions through save and reload without changing cell data', () => {
        const testBed = createCoreTestBed();
        let reloaded: ReturnType<typeof createCoreTestBed> | undefined;
        try {
            const snapshot = testBed.sheet.save();
            const sheetId = testBed.sheet.getActiveSheet()!.getSheetId();
            const sheet = snapshot.sheets[sheetId] as IWorksheetData;
            sheet.columnData = { 0: { w: -232.90908628521544 }, 1: { w: 114.3671875 } };
            sheet.rowData = { 0: { h: -5, ah: Number.POSITIVE_INFINITY } };
            reloaded = createCoreTestBed(snapshot);
            const saved = reloaded.sheet.save();
            expect(saved.sheets[sheetId].columnData?.[0].w).toBe(0);
            expect(saved.sheets[sheetId].rowData?.[0]).toEqual({ h: 0 });
            expect(saved.sheets[sheetId].cellData).toEqual(sheet.cellData);
            expect(mergeWorksheetSnapshotWithDefault(saved.sheets[sheetId])).toEqual(saved.sheets[sheetId]);
        } finally {
            reloaded?.univer.dispose();
            testBed.univer.dispose();
        }
    });
});
