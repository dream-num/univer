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

import type { IAccessor } from '@univerjs/core';
import { BooleanNumber, IUniverInstanceService } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
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

function createAccessor(instanceService: unknown): IAccessor {
    return {
        get: (token: unknown) => {
            if (token === IUniverInstanceService) {
                return instanceService as never;
            }
            return null as never;
        },
        has: () => true,
    } as unknown as IAccessor;
}

describe('worksheet meta mutations', () => {
    it('SetGridlinesColorUndoMutationFactory should read current sheet and throw on null sheet', () => {
        const goodAccessor = createAccessor({
            getUniverSheetInstance: vi.fn(() => ({})),
        });
        expect(
            SetGridlinesColorUndoMutationFactory(goodAccessor, {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                color: '#ff0000',
            })
        ).toEqual({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            color: '#ff0000',
        });

        const badAccessor = createAccessor({
            getUniverSheetInstance: vi.fn(() => null),
        });
        expect(() =>
            SetGridlinesColorUndoMutationFactory(badAccessor, {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                color: '#ff0000',
            })
        ).toThrowError('universheet is null error!');
    });

    it('SetGridlinesColorMutation should set color and return false when target missing', () => {
        const worksheetConfig: { gridlinesColor?: string } = {};
        const worksheet = {
            getConfig: () => worksheetConfig,
            getSheetId: () => 'sheet-1',
        };
        const workbook = {
            getSheetBySheetId: vi.fn(() => worksheet),
            getUnitId: () => 'unit-1',
        };
        const accessor = createAccessor({
            getUnit: vi.fn(() => workbook),
        });
        expect(
            SetGridlinesColorMutation.handler(accessor, {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                color: '#00ff00',
            })
        ).toBe(true);
        expect(worksheetConfig.gridlinesColor).toBe('#00ff00');

        const badAccessor = createAccessor({
            getUnit: vi.fn(() => null),
        });
        expect(
            SetGridlinesColorMutation.handler(badAccessor, {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                color: '#00ff00',
            })
        ).toBe(false);
    });

    it('SetWorksheetHide mutation factory and handler should cover true/false paths', () => {
        const worksheetConfig: { hidden?: number } = {};
        const worksheet = {
            getConfig: () => worksheetConfig,
            getSheetId: () => 'sheet-1',
            isSheetHidden: () => 1,
        };
        const workbook = {
            getSheetBySheetId: vi.fn(() => worksheet),
        };

        const accessor = createAccessor({
            getUnit: vi.fn(() => workbook),
            getUniverSheetInstance: vi.fn(() => workbook),
        });

        expect(
            SetWorksheetHideMutationFactory(accessor, {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                hidden: 0,
            })
        ).toEqual({
            hidden: 1,
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
        });

        expect(
            SetWorksheetHideMutation.handler(accessor, {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                hidden: 0,
            })
        ).toBe(true);
        expect(worksheetConfig.hidden).toBe(0);

        const noWorkbookAccessor = createAccessor({
            getUniverSheetInstance: vi.fn(() => null),
        });
        expect(
            SetWorksheetHideMutation.handler(noWorkbookAccessor, {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                hidden: 0,
            })
        ).toBe(false);

        const noSheetAccessor = createAccessor({
            getUniverSheetInstance: vi.fn(() => ({
                getSheetBySheetId: vi.fn(() => null),
            })),
        });
        expect(
            SetWorksheetHideMutation.handler(noSheetAccessor, {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                hidden: 0,
            })
        ).toBe(false);

        const badFactoryAccessor = createAccessor({
            getUnit: vi.fn(() => null),
        });
        expect(() =>
            SetWorksheetHideMutationFactory(badFactoryAccessor, {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                hidden: 0,
            })
        ).toThrowError('[SetWorksheetHideMutationFactory]: worksheet is null error!');
    });

    it('SetWorksheetName mutation factory and handler should cover true/false paths', () => {
        const worksheetConfig: { name?: string } = {};
        const worksheet = {
            getConfig: () => worksheetConfig,
            getSheetId: () => 'sheet-1',
            getName: () => 'old-name',
        };
        const workbook = {
            getSheetBySheetId: vi.fn(() => worksheet),
        };

        const accessor = createAccessor({
            getUnit: vi.fn(() => workbook),
            getUniverSheetInstance: vi.fn(() => workbook),
        });

        expect(
            SetWorksheetNameMutationFactory(accessor, {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                name: 'new-name',
            })
        ).toEqual({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            name: 'old-name',
        });

        expect(
            SetWorksheetNameMutation.handler(accessor, {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                name: 'new-name',
            })
        ).toBe(true);
        expect(worksheetConfig.name).toBe('new-name');

        const noWorkbookAccessor = createAccessor({
            getUniverSheetInstance: vi.fn(() => null),
        });
        expect(
            SetWorksheetNameMutation.handler(noWorkbookAccessor, {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                name: 'new-name',
            })
        ).toBe(false);

        const noSheetAccessor = createAccessor({
            getUniverSheetInstance: vi.fn(() => ({
                getSheetBySheetId: vi.fn(() => null),
            })),
        });
        expect(
            SetWorksheetNameMutation.handler(noSheetAccessor, {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                name: 'new-name',
            })
        ).toBe(false);

        const badFactoryAccessor = createAccessor({
            getUnit: vi.fn(() => null),
        });
        expect(() =>
            SetWorksheetNameMutationFactory(badFactoryAccessor, {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                name: 'new-name',
            })
        ).toThrowError('[SetWorksheetNameMutationFactory]: worksheet is null error!');
    });

    it('row height mutations should update height, auto-height flag, and measured auto height', () => {
        const rows: Record<number, { h?: number; ia?: BooleanNumber; ah?: number }> = {
            1: { h: 24, ia: BooleanNumber.TRUE, ah: 28 },
            2: {},
        };
        const manager = {
            getRow: (row: number) => rows[row],
            getRowOrCreate: (row: number) => {
                rows[row] ??= {};
                return rows[row];
            },
            setRowHeight: (row: number, height: number) => {
                rows[row] ??= {};
                rows[row].h = height;
            },
        };
        const worksheet = {
            getSheetId: () => 'sheet-1',
            getConfig: () => ({ defaultRowHeight: 19 }),
            getRowManager: () => manager,
        };
        const workbook = {
            getUnitId: () => 'unit-1',
            getSheetBySheetId: vi.fn((subUnitId: string) => subUnitId === 'sheet-1' ? worksheet : null),
        };
        const accessor = createAccessor({
            getUnit: vi.fn((unitId: string) => unitId === 'unit-1' ? workbook : null),
            getCurrentUnitOfType: vi.fn(() => workbook),
        });
        const ranges = [{ startRow: 1, endRow: 2, startColumn: 0, endColumn: 3 }];

        expect(SetWorksheetRowHeightMutationFactory({ unitId: 'unit-1', subUnitId: 'sheet-1', ranges, rowHeight: 40 }, worksheet as never)).toEqual({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ranges,
            rowHeight: { 1: 24, 2: 19 },
        });
        expect(SetWorksheetRowHeightMutation.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', ranges, rowHeight: { 1: 31, 2: null } })).toBe(true);
        expect(rows[1].h).toBe(31);
        expect(rows[2].h).toBeUndefined();
        expect(SetWorksheetRowHeightMutation.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', ranges, rowHeight: 33 })).toBe(true);
        expect(rows[1].h).toBe(33);
        expect(rows[2].h).toBe(33);

        expect(SetWorksheetRowIsAutoHeightMutationFactory({ unitId: 'unit-1', subUnitId: 'sheet-1', ranges, autoHeightInfo: BooleanNumber.FALSE }, worksheet as never)).toEqual({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ranges,
            autoHeightInfo: { 1: BooleanNumber.TRUE, 2: undefined },
        });
        expect(SetWorksheetRowIsAutoHeightMutation.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', ranges, autoHeightInfo: { 1: BooleanNumber.FALSE, 2: null } })).toBe(true);
        expect(rows[1].ia).toBe(BooleanNumber.FALSE);
        expect(rows[2].ia).toBeUndefined();
        expect(SetWorksheetRowIsAutoHeightMutation.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', ranges, autoHeightInfo: BooleanNumber.TRUE })).toBe(true);
        expect(rows[1].ia).toBe(BooleanNumber.TRUE);
        expect(rows[2].ia).toBe(BooleanNumber.TRUE);

        expect(SetWorksheetRowAutoHeightMutationFactory({ unitId: 'unit-1', subUnitId: 'sheet-1', rowsAutoHeightInfo: [{ row: 1, autoHeight: 50 }, { row: 2, autoHeight: 60 }] }, worksheet as never)).toEqual({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            rowsAutoHeightInfo: [{ row: 1, autoHeight: 28 }, { row: 2, autoHeight: 19 }],
        });
        expect(SetWorksheetRowAutoHeightMutation.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', rowsAutoHeightInfo: [{ row: 1, autoHeight: 51 }, { row: 3, autoHeight: 61 }] })).toBe(true);
        expect(rows[1].ah).toBe(51);
        expect(rows[3].ah).toBe(61);

        expect(SetWorksheetRowHeightMutation.handler(createAccessor({ getUnit: vi.fn(() => null) }), { unitId: 'missing', subUnitId: 'sheet-1', ranges, rowHeight: 20 })).toBe(false);
        expect(SetWorksheetRowIsAutoHeightMutation.handler(createAccessor({ getUnit: vi.fn(() => null) }), { unitId: 'missing', subUnitId: 'sheet-1', ranges, autoHeightInfo: BooleanNumber.TRUE })).toBe(false);
        expect(SetWorksheetRowAutoHeightMutation.handler(createAccessor({ getUnit: vi.fn(() => null) }), { unitId: 'missing', subUnitId: 'sheet-1', rowsAutoHeightInfo: [] })).toBe(false);
    });
});
