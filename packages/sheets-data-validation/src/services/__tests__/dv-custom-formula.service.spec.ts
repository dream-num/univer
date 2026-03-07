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

import type { IUniverInstanceService } from '@univerjs/core';
import type { DataValidationModel, DataValidatorRegistryService } from '@univerjs/data-validation';
import type { RegisterOtherFormulaService } from '@univerjs/engine-formula';
import type { DataValidationCacheService } from '../dv-cache.service';
import { DataValidationType, UniverInstanceType } from '@univerjs/core';
import { OtherFormulaBizType } from '@univerjs/engine-formula';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DataValidationCustomFormulaService } from '../dv-custom-formula.service';

describe('DataValidationCustomFormulaService', () => {
    it('registers offset formulas, reads cell results, marks dirty ranges, and deletes formula ids', async () => {
        const formulaResult$ = new Subject<any>();
        const dirtyRanges$ = new Subject<any>();
        const registerOtherFormulaService = {
            formulaResult$,
            registerFormulaWithRange: vi.fn((unitId: string, subUnitId: string, formula: string, _ranges, extra) => `${extra.ruleId}-${formula}`),
            deleteFormula: vi.fn(),
            getFormulaValue: vi.fn(async () => ({ result: [[[[{ v: 1 }]], [[{ v: 2 }]]], [[[{ v: 3 }]], [[{ v: 4 }]]]] })),
            getFormulaValueSync: vi.fn(() => ({ result: [[[[{ v: 1 }]], [[{ v: 2 }]]], [[[{ v: 3 }]], [[{ v: 4 }]]]] })),
            markFormulaDirty: vi.fn(),
        } as unknown as RegisterOtherFormulaService;
        const rule = {
            uid: 'rule-1',
            type: DataValidationType.DATE,
            formula1: '=A1',
            formula2: '=B1',
            ranges: [{ startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 }],
        } as any;
        const dataValidationModel = {
            getRuleById: vi.fn(() => rule),
            getRules: vi.fn(() => [rule]),
        } as unknown as DataValidationModel;
        const cacheService = {
            dirtyRanges$,
            markRangeDirty: vi.fn(),
        } as unknown as DataValidationCacheService;
        const service = new DataValidationCustomFormulaService(
            { getUnitType: vi.fn(() => UniverInstanceType.UNIVER_SHEET) } as unknown as IUniverInstanceService,
            registerOtherFormulaService,
            dataValidationModel,
            cacheService,
            { getValidatorItem: vi.fn(() => ({ offsetFormulaByRange: true })) } as unknown as DataValidatorRegistryService
        );

        service.addRule('unit-1', 'sheet-1', rule);

        expect(registerOtherFormulaService.registerFormulaWithRange).toHaveBeenCalledWith(
            'unit-1',
            'sheet-1',
            '=A1',
            rule.ranges,
            { ruleId: 'rule-1' },
            OtherFormulaBizType.DATA_VALIDATION_CUSTOM,
            'rule-1'
        );
        expect(service.getRuleFormulaInfo('unit-1', 'sheet-1', 'rule-1')).toEqual({
            formula: '=A1',
            originCol: 1,
            originRow: 1,
            formulaId: 'rule-1-=A1',
        });

        await expect(service.getCellFormulaValue('unit-1', 'sheet-1', 'rule-1', 2, 2)).resolves.toEqual({ v: 4 });
        await expect(service.getCellFormula2Value('unit-1', 'sheet-1', 'rule-1', 1, 2)).resolves.toEqual({ v: 2 });
        expect(service.getCellFormulaValueSync('unit-1', 'sheet-1', 'rule-1', 1, 1)).toEqual({ v: 1 });
        expect(service.getCellFormula2ValueSync('unit-1', 'sheet-1', 'rule-1', 2, 1)).toEqual({ v: 3 });

        formulaResult$.next({
            'unit-1': {
                'sheet-1': [{ extra: { ruleId: 'rule-1' } }],
            },
        });
        expect(cacheService.markRangeDirty).toHaveBeenCalledWith('unit-1', 'sheet-1', rule.ranges);

        dirtyRanges$.next({ unitId: 'unit-1', subUnitId: 'sheet-1', ranges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }], isSetRange: true });
        expect(registerOtherFormulaService.markFormulaDirty).toHaveBeenCalledWith('unit-1', 'sheet-1', 'rule-1-=A1');
        expect(registerOtherFormulaService.markFormulaDirty).toHaveBeenCalledWith('unit-1', 'sheet-1', 'rule-1-=B1');

        service.deleteByRuleId('unit-1', 'sheet-1', 'rule-1');
        expect(registerOtherFormulaService.deleteFormula).toHaveBeenCalledWith('unit-1', 'sheet-1', ['rule-1-=A1']);
        expect(registerOtherFormulaService.deleteFormula).toHaveBeenCalledWith('unit-1', 'sheet-1', ['rule-1-=B1']);

        service.dispose();
    });

    it('skips non-offset rules and returns undefined for missing formulas', async () => {
        const service = new DataValidationCustomFormulaService(
            { getUnitType: vi.fn(() => UniverInstanceType.UNIVER_DOC) } as unknown as IUniverInstanceService,
            {
                formulaResult$: new Subject<any>(),
                registerFormulaWithRange: vi.fn(),
                deleteFormula: vi.fn(),
                getFormulaValue: vi.fn(),
                getFormulaValueSync: vi.fn(),
                markFormulaDirty: vi.fn(),
            } as unknown as RegisterOtherFormulaService,
            {
                getRuleById: vi.fn(() => null),
                getRules: vi.fn(() => []),
            } as unknown as DataValidationModel,
            {
                dirtyRanges$: new Subject<any>(),
                markRangeDirty: vi.fn(),
            } as unknown as DataValidationCacheService,
            { getValidatorItem: vi.fn(() => ({ offsetFormulaByRange: false })) } as unknown as DataValidatorRegistryService
        );

        service.addRule('unit-1', 'sheet-1', { uid: 'rule-2', type: DataValidationType.DECIMAL, formula1: '=A1', ranges: [] } as any);

        await expect(service.getCellFormulaValue('unit-1', 'sheet-1', 'missing', 0, 0)).resolves.toBeUndefined();
        await expect(service.getCellFormula2Value('unit-1', 'sheet-1', 'missing', 0, 0)).resolves.toBeUndefined();
        expect(service.getCellFormulaValueSync('unit-1', 'sheet-1', 'missing', 0, 0)).toBeUndefined();
        expect(service.getCellFormula2ValueSync('unit-1', 'sheet-1', 'missing', 0, 0)).toBeUndefined();
        service.deleteByRuleId('unit-1', 'sheet-1', 'missing');
    });
});
