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
import type { DataValidationListCacheService } from '../dv-list-cache.service';
import { DataValidationType, UniverInstanceType } from '@univerjs/core';
import { OtherFormulaBizType } from '@univerjs/engine-formula';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DataValidationFormulaService } from '../dv-formula.service';

describe('DataValidationFormulaService', () => {
    it('registers formula rules, fetches results, removes them, and reacts to formula result changes', async () => {
        const formulaResult$ = new Subject<any>();
        const registerOtherFormulaService = {
            formulaResult$,
            registerFormulaWithRange: vi.fn((unitId: string, subUnitId: string, formula: string, _ranges, extra) => `${extra.ruleId}-${formula}`),
            deleteFormula: vi.fn(),
            getFormulaValue: vi.fn(async (_unitId: string, _subUnitId: string, id: string) => ({ id })),
            getFormulaValueSync: vi.fn((_unitId: string, _subUnitId: string, id: string) => ({ id })),
        } as unknown as RegisterOtherFormulaService;
        const cacheService = {
            markRangeDirty: vi.fn(),
        } as unknown as DataValidationCacheService;
        const listCacheService = {
            markRuleDirty: vi.fn(),
        } as unknown as DataValidationListCacheService;
        const rule = {
            uid: 'rule-1',
            type: DataValidationType.DECIMAL,
            formula1: '=A1',
            formula2: '=B1',
            ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
        } as any;
        const dataValidationModel = {
            getRuleById: vi.fn(() => rule),
        } as unknown as DataValidationModel;
        const validatorRegistryService = {
            getValidatorItem: vi.fn(() => ({ offsetFormulaByRange: false })),
        } as unknown as DataValidatorRegistryService;
        const instanceService = {
            getUnitType: vi.fn(() => UniverInstanceType.UNIVER_SHEET),
        } as unknown as IUniverInstanceService;

        const service = new DataValidationFormulaService(
            instanceService,
            registerOtherFormulaService,
            cacheService,
            dataValidationModel,
            validatorRegistryService,
            listCacheService
        );

        service.addRule('unit-1', 'sheet-1', rule);

        expect(registerOtherFormulaService.registerFormulaWithRange).toHaveBeenCalledWith(
            'unit-1',
            'sheet-1',
            '=A1',
            [{ startColumn: 0, endColumn: 0, startRow: 0, endRow: 0 }],
            { ruleId: 'rule-1' },
            OtherFormulaBizType.DATA_VALIDATION,
            'rule-1'
        );
        expect(service.getRuleFormulaInfo('unit-1', 'sheet-1', 'rule-1')).toEqual([
            { id: 'rule-1-=A1', text: '=A1' },
            { id: 'rule-1-=B1', text: '=B1' },
        ]);

        await expect(service.getRuleFormulaResult('unit-1', 'sheet-1', 'rule-1')).resolves.toEqual([
            { id: 'rule-1-=A1' },
            { id: 'rule-1-=B1' },
        ]);
        expect(service.getRuleFormulaResultSync('unit-1', 'sheet-1', 'rule-1')).toEqual([
            { id: 'rule-1-=A1' },
            { id: 'rule-1-=B1' },
        ]);

        formulaResult$.next({
            'unit-1': {
                'sheet-1': [
                    { extra: { ruleId: 'rule-1' } },
                ],
            },
        });

        expect(listCacheService.markRuleDirty).toHaveBeenCalledWith('unit-1', 'sheet-1', 'rule-1');
        expect(cacheService.markRangeDirty).toHaveBeenCalledWith('unit-1', 'sheet-1', rule.ranges);

        service.removeRule('unit-1', 'sheet-1', 'rule-1');
        expect(registerOtherFormulaService.deleteFormula).toHaveBeenCalledWith('unit-1', 'sheet-1', ['rule-1-=A1', 'rule-1-=B1']);
    });

    it('skips registration for non-formula rules, checkbox rules, and missing entries', async () => {
        const formulaResult$ = new Subject<any>();
        const registerOtherFormulaService = {
            formulaResult$,
            registerFormulaWithRange: vi.fn(),
            deleteFormula: vi.fn(),
            getFormulaValue: vi.fn(),
            getFormulaValueSync: vi.fn(),
        } as unknown as RegisterOtherFormulaService;

        const service = new DataValidationFormulaService(
            { getUnitType: vi.fn(() => UniverInstanceType.UNIVER_DOC) } as unknown as IUniverInstanceService,
            registerOtherFormulaService,
            { markRangeDirty: vi.fn() } as unknown as DataValidationCacheService,
            { getRuleById: vi.fn(() => null) } as unknown as DataValidationModel,
            { getValidatorItem: vi.fn(() => ({ offsetFormulaByRange: true })) } as unknown as DataValidatorRegistryService,
            { markRuleDirty: vi.fn() } as unknown as DataValidationListCacheService
        );

        service.addRule('unit-1', 'sheet-1', {
            uid: 'rule-2',
            type: DataValidationType.DECIMAL,
            formula1: '1',
            formula2: '2',
        } as any);
        service.addRule('unit-1', 'sheet-1', {
            uid: 'rule-3',
            type: DataValidationType.CHECKBOX,
            formula1: '=A1',
            formula2: '=B1',
        } as any);

        expect(registerOtherFormulaService.registerFormulaWithRange).not.toHaveBeenCalled();
        await expect(service.getRuleFormulaResult('unit-1', 'sheet-1', 'missing')).resolves.toBeNull();
        expect(service.getRuleFormulaResultSync('unit-1', 'sheet-1', 'missing')).toBeUndefined();
        service.removeRule('unit-1', 'sheet-1', 'missing');
        expect(registerOtherFormulaService.deleteFormula).not.toHaveBeenCalled();
    });
});
