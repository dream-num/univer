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

import type { IWorkbookData } from '@univerjs/core';
import { BooleanNumber, LocaleType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    SetGridlinesColorMutation,
    SetGridlinesColorUndoMutationFactory,
} from '../set-gridlines-color.mutation';
import { SetWorksheetHideMutation, SetWorksheetHideMutationFactory } from '../set-worksheet-hide.mutation';
import { SetWorksheetNameMutation, SetWorksheetNameMutationFactory } from '../set-worksheet-name.mutation';
import {
    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowAutoHeightMutationFactory,
    SetWorksheetRowHeightMutation,
    SetWorksheetRowHeightMutationFactory,
    SetWorksheetRowIsAutoHeightMutation,
    SetWorksheetRowIsAutoHeightMutationFactory,
} from '../set-worksheet-row-height.mutation';
import { createCommandTestBed } from './create-command-test-bed';

const WORKBOOK_DATA: IWorkbookData = {
    id: 'unit-1',
    appVersion: '3.0.0-alpha',
    locale: LocaleType.EN_US,
    name: 'Test workbook',
    styles: {},
    sheetOrder: ['sheet-1'],
    sheets: {
        'sheet-1': {
            id: 'sheet-1',
            name: 'old-name',
            hidden: BooleanNumber.TRUE,
            rowCount: 100,
            columnCount: 20,
            defaultRowHeight: 19,
            cellData: {},
            rowData: {
                1: { h: 24, ia: BooleanNumber.TRUE, ah: 28 },
                2: {},
            },
        },
    },
};

describe('worksheet meta mutations', () => {
    let testBed: ReturnType<typeof createCommandTestBed>;

    beforeEach(() => {
        testBed = createCommandTestBed(WORKBOOK_DATA);
    });

    afterEach(() => testBed.univer.dispose());

    it('SetGridlinesColorUndoMutationFactory should read current sheet and throw on null sheet', () => {
        expect(
            SetGridlinesColorUndoMutationFactory(testBed, {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                color: '#ff0000',
            })
        ).toEqual({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            color: '#ff0000',
        });

        expect(() =>
            SetGridlinesColorUndoMutationFactory(testBed, {
                unitId: 'missing',
                subUnitId: 'sheet-1',
                color: '#ff0000',
            })
        ).toThrowError('universheet is null error!');
    });

    it('SetGridlinesColorMutation should set color and return false when target missing', () => {
        const worksheet = testBed.sheet.getSheetBySheetId('sheet-1')!;
        expect(
            SetGridlinesColorMutation.handler(testBed, {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                color: '#00ff00',
            })
        ).toBe(true);
        expect(worksheet.getConfig().gridlinesColor).toBe('#00ff00');

        expect(
            SetGridlinesColorMutation.handler(testBed, {
                unitId: 'missing',
                subUnitId: 'sheet-1',
                color: '#00ff00',
            })
        ).toBe(false);
    });

    it('SetWorksheetHide mutation factory and handler should cover true/false paths', () => {
        const worksheet = testBed.sheet.getSheetBySheetId('sheet-1')!;

        expect(
            SetWorksheetHideMutationFactory(testBed, {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                hidden: BooleanNumber.FALSE,
            })
        ).toEqual({
            hidden: BooleanNumber.TRUE,
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
        });

        expect(
            SetWorksheetHideMutation.handler(testBed, {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                hidden: BooleanNumber.FALSE,
            })
        ).toBe(true);
        expect(worksheet.getConfig().hidden).toBe(BooleanNumber.FALSE);
        expect(SetWorksheetHideMutation.handler(testBed, { unitId: 'missing', subUnitId: 'sheet-1', hidden: BooleanNumber.FALSE })).toBe(false);
        expect(SetWorksheetHideMutation.handler(testBed, { unitId: 'unit-1', subUnitId: 'missing', hidden: BooleanNumber.FALSE })).toBe(false);
        expect(() => SetWorksheetHideMutationFactory(testBed, { unitId: 'missing', subUnitId: 'sheet-1', hidden: BooleanNumber.FALSE }))
            .toThrowError('[SetWorksheetHideMutationFactory]: worksheet is null error!');
    });

    it('SetWorksheetName mutation factory and handler should cover true/false paths', () => {
        const worksheet = testBed.sheet.getSheetBySheetId('sheet-1')!;

        expect(
            SetWorksheetNameMutationFactory(testBed, {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                name: 'new-name',
            })
        ).toEqual({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            name: 'old-name',
        });

        expect(SetWorksheetNameMutation.handler(testBed, { unitId: 'unit-1', subUnitId: 'sheet-1', name: 'new-name' })).toBe(true);
        expect(worksheet.getConfig().name).toBe('new-name');
        expect(SetWorksheetNameMutation.handler(testBed, { unitId: 'missing', subUnitId: 'sheet-1', name: 'new-name' })).toBe(false);
        expect(SetWorksheetNameMutation.handler(testBed, { unitId: 'unit-1', subUnitId: 'missing', name: 'new-name' })).toBe(false);
        expect(() => SetWorksheetNameMutationFactory(testBed, { unitId: 'missing', subUnitId: 'sheet-1', name: 'new-name' }))
            .toThrowError('[SetWorksheetNameMutationFactory]: worksheet is null error!');
    });

    it('row height mutations should update height, auto-height flag, and measured auto height', () => {
        const worksheet = testBed.sheet.getSheetBySheetId('sheet-1')!;
        const manager = worksheet.getRowManager();
        const ranges = [{ startRow: 1, endRow: 2, startColumn: 0, endColumn: 3 }];

        expect(SetWorksheetRowHeightMutationFactory({ unitId: 'unit-1', subUnitId: 'sheet-1', ranges, rowHeight: 40 }, worksheet)).toEqual({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ranges,
            rowHeight: { 1: 24, 2: 19 },
        });
        expect(SetWorksheetRowHeightMutation.handler(testBed, { unitId: 'unit-1', subUnitId: 'sheet-1', ranges, rowHeight: { 1: 31, 2: null } })).toBe(true);
        expect(manager.getRow(1)?.h).toBe(31);
        expect(manager.getRow(2)?.h).toBeUndefined();
        expect(SetWorksheetRowHeightMutation.handler(testBed, { unitId: 'unit-1', subUnitId: 'sheet-1', ranges, rowHeight: 33 })).toBe(true);
        expect(manager.getRow(1)?.h).toBe(33);
        expect(manager.getRow(2)?.h).toBe(33);

        expect(SetWorksheetRowIsAutoHeightMutationFactory({ unitId: 'unit-1', subUnitId: 'sheet-1', ranges, autoHeightInfo: BooleanNumber.FALSE }, worksheet)).toEqual({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ranges,
            autoHeightInfo: { 1: BooleanNumber.TRUE, 2: undefined },
        });
        expect(SetWorksheetRowIsAutoHeightMutation.handler(testBed, { unitId: 'unit-1', subUnitId: 'sheet-1', ranges, autoHeightInfo: { 1: BooleanNumber.FALSE, 2: null } })).toBe(true);
        expect(manager.getRow(1)?.ia).toBe(BooleanNumber.FALSE);
        expect(manager.getRow(2)?.ia).toBeUndefined();
        expect(SetWorksheetRowIsAutoHeightMutation.handler(testBed, { unitId: 'unit-1', subUnitId: 'sheet-1', ranges, autoHeightInfo: BooleanNumber.TRUE })).toBe(true);
        expect(manager.getRow(1)?.ia).toBe(BooleanNumber.TRUE);
        expect(manager.getRow(2)?.ia).toBe(BooleanNumber.TRUE);

        expect(SetWorksheetRowAutoHeightMutationFactory({ unitId: 'unit-1', subUnitId: 'sheet-1', rowsAutoHeightInfo: [{ row: 1, autoHeight: 50 }, { row: 2, autoHeight: 60 }] }, worksheet)).toEqual({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            rowsAutoHeightInfo: [{ row: 1, autoHeight: 28 }, { row: 2, autoHeight: 19 }],
        });
        expect(SetWorksheetRowAutoHeightMutation.handler(testBed, { unitId: 'unit-1', subUnitId: 'sheet-1', rowsAutoHeightInfo: [{ row: 1, autoHeight: 51 }, { row: 3, autoHeight: 61 }] })).toBe(true);
        expect(manager.getRow(1)?.ah).toBe(51);
        expect(manager.getRow(3)?.ah).toBe(61);

        expect(SetWorksheetRowHeightMutation.handler(testBed, { unitId: 'missing', subUnitId: 'sheet-1', ranges, rowHeight: 20 })).toBe(false);
        expect(SetWorksheetRowIsAutoHeightMutation.handler(testBed, { unitId: 'missing', subUnitId: 'sheet-1', ranges, autoHeightInfo: BooleanNumber.TRUE })).toBe(false);
        expect(SetWorksheetRowAutoHeightMutation.handler(testBed, { unitId: 'missing', subUnitId: 'sheet-1', rowsAutoHeightInfo: [] })).toBe(false);
    });
});
