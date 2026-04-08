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
import { IUniverInstanceService } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import {
    SetGridlinesColorMutation,
    SetGridlinesColorUndoMutationFactory,
} from '../set-gridlines-color.mutation';
import { SetWorksheetHideMutation, SetWorksheetHideMutationFactory } from '../set-worksheet-hide.mutation';
import { SetWorksheetNameMutation, SetWorksheetNameMutationFactory } from '../set-worksheet-name.mutation';

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
});
