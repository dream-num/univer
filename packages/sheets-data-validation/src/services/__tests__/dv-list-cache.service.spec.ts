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

import type { ISheetDataValidationRule } from '@univerjs/core';
import { DataValidationType, ICommandService, Univer, UniverInstanceType } from '@univerjs/core';
import { DataValidationModel, DataValidatorRegistryService, UpdateRuleType } from '@univerjs/data-validation';
import {
    ActiveDirtyManagerService,
    IActiveDirtyManagerService,
    OtherFormulaMarkDirty,
    RegisterOtherFormulaService,
    RemoveOtherFormulaMutation,
    SetFormulaCalculationResultMutation,
    SetOtherFormulaMutation,
} from '@univerjs/engine-formula';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DataValidationCacheService } from '../dv-cache.service';
import { DataValidationFormulaService } from '../dv-formula.service';
import { DataValidationListCacheService } from '../dv-list-cache.service';

let univer: Univer;
beforeEach(() => {
    univer = new Univer();
    const injector = univer.__getInjector();
    injector.add([DataValidationModel]);
    injector.add([DataValidatorRegistryService]);
    injector.add([DataValidationCacheService]);
    injector.add([IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }]);
    injector.add([RegisterOtherFormulaService]);
    injector.add([DataValidationFormulaService]);
    injector.add([DataValidationListCacheService]);
    const commands = injector.get(ICommandService);
    for (const command of [SetOtherFormulaMutation, RemoveOtherFormulaMutation, OtherFormulaMarkDirty, SetFormulaCalculationResultMutation]) {
        commands.registerCommand(command);
    }
    univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
        id: 'unit-1',
        sheets: { 'sheet-1': { id: 'sheet-1', name: 'Sheet1', rowCount: 10, columnCount: 10 } },
        sheetOrder: ['sheet-1'],
    });
});
afterEach(() => univer.dispose());

const rule: ISheetDataValidationRule = {
    uid: 'rule-1',
    type: DataValidationType.LIST,
    formula1: '=A1:A2',
    formula2: '#f00,#0f0,#00f',
    ranges: [{ startRow: 0, endRow: 0, startColumn: 2, endColumn: 2 }],
};

describe('DataValidationListCacheService', () => {
    it('computes and caches formatted formula lists and invalidates removed rules', async () => {
        const injector = univer.__getInjector();
        const service = injector.get(DataValidationListCacheService);
        const formulas = injector.get(DataValidationFormulaService);
        injector.get(DataValidationModel).addRule('unit-1', 'sheet-1', rule, 'command');
        formulas.addRule('unit-1', 'sheet-1', rule);
        const formulaId = formulas.getRuleFormulaInfo('unit-1', 'sheet-1', rule.uid)![0]!.id;
        await injector.get(ICommandService).executeCommand(SetFormulaCalculationResultMutation.id, {
            unitOtherData: { 'unit-1': { 'sheet-1': { [formulaId]: { 0: { 0: [[
                { v: 'A' },
                { v: 'B' },
                { v: '#VALUE!' },
                { v: 1, s: { n: { pattern: '0.00' } } },
            ]] } } } } },
        });
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
        service.markRuleDirty('unit-1', 'sheet-1', rule.uid);
        expect(service.getCache('unit-1', 'sheet-1', rule.uid)).toBeUndefined();
        service.setCache('unit-1', 'sheet-1', rule.uid, first);
        injector.get(DataValidationModel).removeRule('unit-1', 'sheet-1', rule.uid, 'command');
        expect(service.getCache('unit-1', 'sheet-1', rule.uid)).toBeUndefined();
        service.setCache('unit-1', 'sheet-1', rule.uid, first);
        service.clear();
        expect(service.getCache('unit-1', 'sheet-1', rule.uid)).toBeUndefined();
    });

    it('supports literal lists and removes subscriptions on disposal', () => {
        const injector = univer.__getInjector();
        const service = injector.get(DataValidationListCacheService);
        const item = service.computeAndCache('unit-1', 'sheet-1', { ...rule, formula1: 'x,y,,z', formula2: '' }, null);
        expect(item.list).toEqual(['x', 'y', 'z']);
        expect(item.colorMap).toEqual({});
        const model = injector.get(DataValidationModel);
        model.addRule('unit-1', 'sheet-1', rule, 'command');
        model.updateRule('unit-1', 'sheet-1', rule.uid, {
            type: UpdateRuleType.SETTING,
            payload: { type: DataValidationType.LIST, formula1: 'Updated' },
        }, 'command');
        expect(service.getCache('unit-1', 'sheet-1', rule.uid)).toBeUndefined();
        const dirty = vi.spyOn(service, 'markRuleDirty');
        service.dispose();
        injector.get(DataValidationModel).addRule('unit-1', 'sheet-1', rule, 'command');
        injector.get(DataValidationModel).removeRule('unit-1', 'sheet-1', rule.uid, 'command');
        expect(dirty).not.toHaveBeenCalled();
    });
});
