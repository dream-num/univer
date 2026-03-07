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

import type { Injector } from '@univerjs/core';
import type { DataValidationModel } from '@univerjs/data-validation';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DataValidationFormulaService } from '../dv-formula.service';
import { DataValidationListCacheService } from '../dv-list-cache.service';

describe('DataValidationListCacheService', () => {
    it('computes, caches, invalidates, and clears list items', () => {
        const ruleChange$ = new Subject<any>();
        const formulaService = {
            getRuleFormulaResultSync: vi.fn(() => [
                { result: [[[[{ v: 'A' }, { v: 'B' }, { v: '#VALUE!' }, { v: 1, s: { n: { pattern: '0.00' } } }]]]] },
            ]),
        };
        const injector = {
            get(token: unknown) {
                if (token === DataValidationFormulaService) {
                    return formulaService;
                }

                throw new Error(`Unknown token: ${String(token)}`);
            },
        } as unknown as Injector;
        const dataValidationModel = {
            ruleChange$,
        } as unknown as DataValidationModel;

        const service = new DataValidationListCacheService(injector, dataValidationModel);
        const rule = {
            uid: 'rule-1',
            formula1: '=A1',
            formula2: '#f00,#0f0,#00f',
        } as any;

        const first = service.getOrCompute('unit-1', 'sheet-1', rule);
        expect(first.list).toEqual(['A', 'B', '1.00']);
        expect(first.listWithColor).toEqual([
            { label: 'A', color: '#f00' },
            { label: 'B', color: '#0f0' },
            { label: '1.00', color: '#00f' },
        ]);
        expect(first.colorMap).toEqual({ A: '#f00', B: '#0f0', '1.00': '#00f' });
        expect(first.set.has('A')).toBe(true);

        expect(service.getOrCompute('unit-1', 'sheet-1', rule)).toBe(first);
        expect(formulaService.getRuleFormulaResultSync).toHaveBeenCalledTimes(1);

        service.markRuleDirty('unit-1', 'sheet-1', 'rule-1');
        expect(service.getCache('unit-1', 'sheet-1', 'rule-1')).toBeUndefined();

        service.setCache('unit-1', 'sheet-1', 'rule-2', first);
        expect(service.getCache('unit-1', 'sheet-1', 'rule-2')).toBe(first);

        ruleChange$.next({ type: 'remove', unitId: 'unit-1', subUnitId: 'sheet-1', rule: { uid: 'rule-2' } });
        expect(service.getCache('unit-1', 'sheet-1', 'rule-2')).toBeUndefined();

        service.clear();
        expect(service.getCache('unit-1', 'sheet-1', 'rule-1')).toBeUndefined();
    });

    it('supports non-formula lists and update invalidation', () => {
        const ruleChange$ = new Subject<any>();
        const service = new DataValidationListCacheService(
            {
                get() {
                    return {
                        getRuleFormulaResultSync: vi.fn(),
                    };
                },
            } as unknown as Injector,
            { ruleChange$ } as unknown as DataValidationModel
        );

        const item = service.computeAndCache('unit-1', 'sheet-1', { uid: 'rule-3', formula1: 'x,y,,z', formula2: '' } as any, null);
        expect(item.list).toEqual(['x', 'y', 'z']);
        expect(item.colorMap).toEqual({});

        ruleChange$.next({ type: 'update', unitId: 'unit-1', subUnitId: 'sheet-1', rule: { uid: 'rule-3' } });
        expect(service.getCache('unit-1', 'sheet-1', 'rule-3')).toBeUndefined();
    });
});
