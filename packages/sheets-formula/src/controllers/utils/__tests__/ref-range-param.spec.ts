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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import { LocaleType, RANGE_TYPE } from '@univerjs/core';
import {
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    InsertColCommand,
    InsertRangeMoveDownCommand,
    InsertRangeMoveRightCommand,
    InsertRowCommand,
    MoveColsCommand,
    MoveRangeCommand,
    MoveRowsCommand,
    RemoveColCommand,
    RemoveDefinedNameCommand,
    RemoveRowCommand,
    RemoveSheetCommand,
    SetDefinedNameCommand,
    SetWorksheetNameCommand,
} from '@univerjs/sheets';
import { afterEach, describe, expect, it } from 'vitest';

import { createFacadeTestBed } from '../../../facade/__tests__/create-test-bed';
import { FormulaReferenceMoveType } from '../ref-range-formula';
import { getReferenceMoveParams } from '../ref-range-param';

function createWorkbookData(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        name: 'test',
        sheetOrder: ['sheet1'],
        locale: LocaleType.EN_US,
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'Sheet1',
                rowCount: 12,
                columnCount: 8,
                cellData: {},
            },
        },
        styles: {},
    };
}

describe('getReferenceMoveParams', () => {
    afterEach(() => {
        // disposal is handled per test to keep workbook state isolated
    });

    it('returns null for unknown commands or missing params', () => {
        const testBed = createFacadeTestBed(createWorkbookData());
        const workbook = testBed.sheet as Workbook;

        expect(getReferenceMoveParams(workbook, { id: 'unknown.command' })).toBeNull();
        expect(getReferenceMoveParams(workbook, { id: MoveRangeCommand.id })).toBeNull();
        expect(getReferenceMoveParams(workbook, { id: MoveRowsCommand.id })).toBeNull();

        testBed.univer.dispose();
    });

    it('builds move params for range, row, and column operations from the active sheet', () => {
        const testBed = createFacadeTestBed(createWorkbookData());
        const workbook = testBed.sheet as Workbook;

        expect(getReferenceMoveParams(workbook, {
            id: MoveRangeCommand.id,
            params: {
                fromRange: { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 },
                toRange: { startRow: 4, endRow: 5, startColumn: 3, endColumn: 4 },
            },
        })).toEqual({
            type: FormulaReferenceMoveType.MoveRange,
            unitId: 'test',
            sheetId: 'sheet1',
            from: { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 },
            to: { startRow: 4, endRow: 5, startColumn: 3, endColumn: 4 },
        });

        expect(getReferenceMoveParams(workbook, {
            id: MoveRowsCommand.id,
            params: {
                fromRange: { startRow: 2, endRow: 4, startColumn: 0, endColumn: 0 },
                toRange: { startRow: 6, endRow: 8, startColumn: 0, endColumn: 0 },
            },
        })).toEqual({
            type: FormulaReferenceMoveType.MoveRows,
            unitId: 'test',
            sheetId: 'sheet1',
            from: {
                startRow: 2,
                endRow: 4,
                startColumn: 0,
                endColumn: 7,
                rangeType: RANGE_TYPE.ROW,
            },
            to: {
                startRow: 6,
                endRow: 8,
                startColumn: 0,
                endColumn: 7,
                rangeType: RANGE_TYPE.ROW,
            },
        });

        expect(getReferenceMoveParams(workbook, {
            id: MoveColsCommand.id,
            params: {
                fromRange: { startRow: 0, endRow: 0, startColumn: 1, endColumn: 2 },
                toRange: { startRow: 0, endRow: 0, startColumn: 4, endColumn: 5 },
            },
        })).toEqual({
            type: FormulaReferenceMoveType.MoveCols,
            unitId: 'test',
            sheetId: 'sheet1',
            from: {
                startRow: 0,
                endRow: 11,
                startColumn: 1,
                endColumn: 2,
                rangeType: RANGE_TYPE.COLUMN,
            },
            to: {
                startRow: 0,
                endRow: 11,
                startColumn: 4,
                endColumn: 5,
                rangeType: RANGE_TYPE.COLUMN,
            },
        });

        testBed.univer.dispose();
    });

    it('builds insert, remove, and delete params with the expected sheet identity', () => {
        const testBed = createFacadeTestBed(createWorkbookData());
        const workbook = testBed.sheet as Workbook;
        const range = { startRow: 3, endRow: 4, startColumn: 2, endColumn: 3 };

        expect(getReferenceMoveParams(workbook, {
            id: InsertRowCommand.id,
            params: { range, unitId: 'test', subUnitId: 'sheet1' },
        })).toEqual({
            type: FormulaReferenceMoveType.InsertRow,
            unitId: 'test',
            sheetId: 'sheet1',
            range,
        });
        expect(getReferenceMoveParams(workbook, {
            id: InsertColCommand.id,
            params: { range, unitId: 'test', subUnitId: 'sheet1' },
        })).toEqual({
            type: FormulaReferenceMoveType.InsertColumn,
            unitId: 'test',
            sheetId: 'sheet1',
            range,
        });
        expect(getReferenceMoveParams(workbook, {
            id: InsertRangeMoveRightCommand.id,
            params: { range },
        })).toEqual({
            type: FormulaReferenceMoveType.InsertMoveRight,
            unitId: 'test',
            sheetId: 'sheet1',
            range,
        });
        expect(getReferenceMoveParams(workbook, {
            id: InsertRangeMoveDownCommand.id,
            params: { range },
        })).toEqual({
            type: FormulaReferenceMoveType.InsertMoveDown,
            unitId: 'test',
            sheetId: 'sheet1',
            range,
        });
        expect(getReferenceMoveParams(workbook, {
            id: RemoveRowCommand.id,
            params: { range },
        })).toEqual({
            type: FormulaReferenceMoveType.RemoveRow,
            unitId: 'test',
            sheetId: 'sheet1',
            range,
            rangeFilteredRows: [],
        });
        expect(getReferenceMoveParams(workbook, {
            id: RemoveColCommand.id,
            params: { range },
        })).toEqual({
            type: FormulaReferenceMoveType.RemoveColumn,
            unitId: 'test',
            sheetId: 'sheet1',
            range,
        });
        expect(getReferenceMoveParams(workbook, {
            id: DeleteRangeMoveUpCommand.id,
            params: { range },
        })).toEqual({
            type: FormulaReferenceMoveType.DeleteMoveUp,
            unitId: 'test',
            sheetId: 'sheet1',
            range,
        });
        expect(getReferenceMoveParams(workbook, {
            id: DeleteRangeMoveLeftCommand.id,
            params: { range },
        })).toEqual({
            type: FormulaReferenceMoveType.DeleteMoveLeft,
            unitId: 'test',
            sheetId: 'sheet1',
            range,
        });

        testBed.univer.dispose();
    });

    it('builds sheet rename, sheet removal, and defined-name params with explicit ids', () => {
        const testBed = createFacadeTestBed(createWorkbookData());
        const workbook = testBed.sheet as Workbook;

        expect(getReferenceMoveParams(workbook, {
            id: SetWorksheetNameCommand.id,
            params: {
                unitId: 'other-unit',
                subUnitId: 'other-sheet',
                name: 'Renamed Sheet',
            },
        })).toEqual({
            type: FormulaReferenceMoveType.SetName,
            unitId: 'other-unit',
            sheetId: 'other-sheet',
            sheetName: 'Renamed Sheet',
        });
        expect(getReferenceMoveParams(workbook, {
            id: RemoveSheetCommand.id,
            params: {
                unitId: 'other-unit',
                subUnitId: 'other-sheet',
            },
        })).toEqual({
            type: FormulaReferenceMoveType.RemoveSheet,
            unitId: 'other-unit',
            sheetId: 'other-sheet',
        });
        expect(getReferenceMoveParams(workbook, {
            id: SetDefinedNameCommand.id,
            params: {
                unitId: 'test',
                id: 'defined-name-id',
                name: 'Revenue',
            },
        })).toEqual({
            type: FormulaReferenceMoveType.SetDefinedName,
            unitId: 'test',
            sheetId: 'sheet1',
            definedName: 'Revenue',
            definedNameId: 'defined-name-id',
        });
        expect(getReferenceMoveParams(workbook, {
            id: RemoveDefinedNameCommand.id,
            params: {
                unitId: 'test',
                id: 'defined-name-id',
                name: 'Revenue',
            },
        })).toEqual({
            type: FormulaReferenceMoveType.RemoveDefinedName,
            unitId: 'test',
            sheetId: 'sheet1',
            definedName: 'Revenue',
            definedNameId: 'defined-name-id',
        });

        testBed.univer.dispose();
    });
});
