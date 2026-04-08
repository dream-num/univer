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

import { DataValidationType } from '@univerjs/core';
import { AUTO_FILL_APPLY_TYPE, AutoFillTools } from '@univerjs/sheets';
import { DATA_VALIDATION_PLUGIN_NAME, getDataValidationDiffMutations } from '@univerjs/sheets-data-validation';
import { virtualizeDiscreteRanges } from '@univerjs/sheets-ui';
import { describe, expect, it, vi } from 'vitest';
import { DataValidationAutoFillController } from '../dv-auto-fill.controller';

vi.mock('@univerjs/sheets-ui', async (importActual) => {
    const actual = await importActual<typeof import('@univerjs/sheets-ui')>();
    return {
        ...actual,
        virtualizeDiscreteRanges: vi.fn(() => ({
            ranges: [
                { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 },
                { startRow: 1, startColumn: 1, endRow: 1, endColumn: 1 },
            ],
            mapFunc: (row: number, col: number) => ({ row, col }),
        })),
    };
});

vi.mock('@univerjs/sheets-data-validation', async (importActual) => {
    const actual = await importActual<typeof import('@univerjs/sheets-data-validation')>();
    return {
        ...actual,
        getDataValidationDiffMutations: vi.fn(() => ({ redoMutations: ['redo-dv'], undoMutations: ['undo-dv'] })),
    };
});

vi.mock('@univerjs/sheets', async (importActual) => {
    const actual = await importActual<typeof import('@univerjs/sheets')>();
    return {
        ...actual,
        AutoFillTools: {
            ...actual.AutoFillTools,
            getAutoFillRepeatRange: vi.fn(() => [{
                repeatStartCell: { row: 1, col: 1 },
                relativeRange: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            }]),
        },
    };
});

describe('DataValidationAutoFillController', () => {
    it('registers a hook and disables series fill when checkbox validation exists in source cells', () => {
        let hook: { id: string; onBeforeFillData: (location: { unitId: string; subUnitId: string; source: { rows: number[]; cols: number[] } }) => void } | undefined;
        const autoFillService = {
            addHook: vi.fn((registeredHook) => {
                hook = registeredHook;
                return { dispose: vi.fn() };
            }),
            setDisableApplyType: vi.fn(),
        };

        const controller = new DataValidationAutoFillController(
            autoFillService as never,
            {
                getRuleByLocation: vi.fn(() => ({ type: DataValidationType.CHECKBOX })),
            } as never,
            {} as never
        );

        expect(controller).toBeTruthy();
        expect(hook?.id).toBe(DATA_VALIDATION_PLUGIN_NAME);

        hook!.onBeforeFillData({
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            source: { rows: [0], cols: [0] },
        });

        expect(autoFillService.setDisableApplyType).toHaveBeenCalledWith(AUTO_FILL_APPLY_TYPE.SERIES, true);
    });

    it('builds diff mutations for copy and format autofill, and skips unsupported apply types', () => {
        let hook: { onFillData: (location: { unitId: string; subUnitId: string; source: { rows: number[]; cols: number[]; startRow: number; endRow: number; startColumn: number; endColumn: number }; target: { rows: number[]; cols: number[]; startRow: number; endRow: number; startColumn: number; endColumn: number } }, direction: unknown, applyType: AUTO_FILL_APPLY_TYPE) => { redos: unknown[]; undos: unknown[] } } | undefined;
        const ruleMatrixCopy = {
            addRangeRules: vi.fn(),
            diff: vi.fn(() => 'diffs'),
        };

        const controller = new DataValidationAutoFillController(
            {
                addHook: vi.fn((registeredHook) => {
                    hook = registeredHook;
                    return { dispose: vi.fn() };
                }),
                setDisableApplyType: vi.fn(),
            } as never,
            {
                getRuleByLocation: vi.fn(() => null),
                getRuleObjectMatrix: vi.fn(() => ({ clone: vi.fn(() => ruleMatrixCopy) })),
                getRuleIdByLocation: vi.fn(() => 'rule-1'),
                getRules: vi.fn(() => ['existing-rule']),
            } as never,
            {} as never
        );

        expect(controller).toBeTruthy();

        const location = {
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            source: { rows: [0], cols: [0], startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            target: { rows: [1], cols: [1], startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
        };
        const result = hook!.onFillData(location, 'down', AUTO_FILL_APPLY_TYPE.ONLY_FORMAT);

        expect(vi.mocked(virtualizeDiscreteRanges)).toHaveBeenCalledWith([location.source, location.target]);
        expect(vi.mocked(AutoFillTools.getAutoFillRepeatRange)).toHaveBeenCalled();
        expect(ruleMatrixCopy.addRangeRules).toHaveBeenCalledWith([{ id: 'rule-1', ranges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }] }]);
        expect(vi.mocked(getDataValidationDiffMutations)).toHaveBeenCalledWith('book-1', 'sheet-1', 'diffs', {}, 'patched', true);
        expect(result).toEqual({ redos: ['redo-dv'], undos: ['undo-dv'] });

        expect(hook!.onFillData(location, 'down', AUTO_FILL_APPLY_TYPE.NO_FORMAT)).toEqual({ redos: [], undos: [] });
    });
});
