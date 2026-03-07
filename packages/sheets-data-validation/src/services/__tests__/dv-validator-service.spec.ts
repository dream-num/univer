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

import type { IDataValidationRule, IRange, IUniverInstanceService, LifecycleService, Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { ISheetLocation } from '@univerjs/sheets';
import type { SheetDataValidationModel } from '../../models/sheet-data-validation-model';
import type { DataValidationCacheService } from '../dv-cache.service';
import { ObjectMatrix as CoreObjectMatrix, DataValidationStatus, LifecycleStages } from '@univerjs/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SheetsDataValidationValidatorService } from '../dv-validator-service';

function createRule(uid: string, ranges: IRange[]): IDataValidationRule {
    return { uid, ranges } as IDataValidationRule;
}

function createService() {
    const dirtyRanges$ = new Subject<{ unitId: string; subUnitId: string; ranges: IRange[] }>();
    const lifecycle$ = new BehaviorSubject(LifecycleStages.Rendered);
    const worksheet = {
        getSheetId: () => 'sheet-1',
        getMergedCell: vi.fn(() => null),
        getCell: vi.fn((row: number, col: number) => ({ v: `${row},${col}` })),
        getMaxColumns: () => 20,
        getMaxRows: () => 20,
    } as unknown as Worksheet;
    const workbook = {
        getUnitId: () => 'unit-1',
        getActiveSheet: () => worksheet,
        getSheetBySheetId: vi.fn((sheetId: string) => (sheetId === 'sheet-1' ? worksheet : null)),
    } as unknown as Workbook;
    const cache = new CoreObjectMatrix<Nullable<DataValidationStatus>>();
    const rule = createRule('rule-1', [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }]);
    const model = {
        getRuleByLocation: vi.fn(() => rule),
        validator: vi.fn((_rule: IDataValidationRule, _pos: ISheetLocation, onComplete?: (status: DataValidationStatus, changed: boolean) => void) => {
            onComplete?.(DataValidationStatus.INVALID, true);
            return DataValidationStatus.INVALID;
        }),
        getRules: vi.fn(() => [rule]),
        getSubUnitIds: vi.fn(() => ['sheet-1']),
        getRuleObjectMatrix: vi.fn(() => ({
            getValue: vi.fn((row: number, col: number) => (row === 0 && col === 0 ? 'rule-1' : undefined)),
        })),
        getRuleById: vi.fn((_, __, id: string) => (id === 'rule-1' ? rule : undefined)),
    } as unknown as SheetDataValidationModel;
    const cacheService = {
        dirtyRanges$,
        getValue: vi.fn(() => DataValidationStatus.INVALID),
        ensureCache: vi.fn(() => cache),
    } as unknown as DataValidationCacheService;
    const univerInstanceService = {
        getUnit: vi.fn((unitId: string) => (unitId === 'unit-1' ? workbook : null)),
        getCurrentUnitForType: vi.fn(() => workbook),
    } as unknown as IUniverInstanceService;
    const lifecycleService = {
        lifecycle$,
        stage: LifecycleStages.Rendered,
    } as unknown as LifecycleService;

    return {
        dirtyRanges$,
        lifecycle$,
        worksheet,
        workbook,
        cache,
        model,
        cacheService,
        univerInstanceService,
        lifecycleService,
        service: new SheetsDataValidationValidatorService(univerInstanceService, model, cacheService, lifecycleService),
    };
}

describe('SheetsDataValidationValidatorService', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.stubGlobal('requestIdleCallback', (callback: IdleRequestCallback) => {
            callback({ didTimeout: false, timeRemaining: () => 1 } as IdleDeadline);
            return 1;
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('validates single cells, merged cells, ranges, worksheets, and workbooks', async () => {
        const { service, worksheet, model, cacheService } = createService();

        await expect(service.validatorCell('missing', 'sheet-1', 0, 0)).rejects.toThrow('cannot find current workbook');
        await expect(service.validatorCell('unit-1', 'missing', 0, 0)).rejects.toThrow('cannot find current worksheet');

        worksheet.getMergedCell = vi.fn(() => ({ startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 }));
        expect(await service.validatorCell('unit-1', 'sheet-1', 1, 1)).toBe(DataValidationStatus.INVALID);
        expect(model.getRuleByLocation).toHaveBeenCalledWith('unit-1', 'sheet-1', 0, 0);

        model.validator = vi.fn((_rule: IDataValidationRule, _pos: ISheetLocation, onComplete?: (status: DataValidationStatus, changed: boolean) => void) => {
            onComplete?.(DataValidationStatus.VALIDATING, true);
            return DataValidationStatus.VALIDATING;
        });
        const rangeStatuses = await service.validatorRanges('unit-1', 'sheet-1', [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }]);
        expect(rangeStatuses).toEqual([[DataValidationStatus.INVALID]]);

        expect(await service.validatorRanges('unit-1', 'sheet-1', [])).toEqual([]);
        expect(await service.validatorWorksheet('unit-1', 'sheet-1')).toBe(cacheService.ensureCache('unit-1', 'sheet-1'));
        expect(await service.validatorWorkbook('unit-1')).toEqual({
            'sheet-1': cacheService.ensureCache('unit-1', 'sheet-1'),
        });
    });

    it('returns matched data validations and reacts to dirty ranges after render', async () => {
        const { service, dirtyRanges$, lifecycle$, model } = createService();
        const validatorRangesSpy = vi.spyOn(service, 'validatorRanges').mockResolvedValue([]);

        expect(service.getDataValidations('unit-1', 'sheet-1', [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }])).toEqual([
            createRule('rule-1', [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }]),
        ]);
        expect(service.getDataValidation('unit-1', 'sheet-1', [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }])?.uid).toBe('rule-1');

        dirtyRanges$.next({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
        });
        lifecycle$.next(LifecycleStages.Rendered);
        await vi.runAllTimersAsync();

        expect(validatorRangesSpy).toHaveBeenCalledWith('unit-1', 'sheet-1', [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }]);

        model.getRuleById = vi.fn(() => undefined);
        expect(service.getDataValidations('unit-1', 'sheet-1', [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }])).toEqual([]);

        service.dispose();
    });
});
