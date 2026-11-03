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
import { DataValidationModel, DataValidatorRegistryService } from '@univerjs/data-validation';
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

describe('DataValidationFormulaService', () => {
    it('refreshes list caches before range subscribers consume recalculated results', async () => {
        const injector = univer.__getInjector();
        const service = injector.get(DataValidationFormulaService);
        const lists = injector.get(DataValidationListCacheService);
        injector.get(DataValidationModel).addRule('unit-1', 'sheet-1', rule, 'command');
        service.addRule('unit-1', 'sheet-1', rule);
        const formulaId = service.getRuleFormulaInfo('unit-1', 'sheet-1', rule.uid)![0]!.id;
        const pending = service.getRuleFormulaResult('unit-1', 'sheet-1', rule.uid);
        lists.computeAndCache('unit-1', 'sheet-1', rule, null);
        const observed = vi.fn(() => lists.getOrCompute('unit-1', 'sheet-1', rule).list);
        injector.get(DataValidationCacheService).dirtyRanges$.subscribe(observed);
        await injector.get(ICommandService).executeCommand(SetFormulaCalculationResultMutation.id, {
            unitOtherData: { 'unit-1': { 'sheet-1': { [formulaId]: { 0: { 0: [[{ v: 'A' }, { v: 'B' }]] } } } } },
        });
        expect(observed).toHaveReturnedWith(['A', 'B']);
        expect((await pending)?.[0]?.extra?.ruleId).toBe(rule.uid);
        expect(service.getRuleFormulaResultSync('unit-1', 'sheet-1', rule.uid)?.[0]?.extra?.ruleId).toBe(rule.uid);
        await injector.get(ICommandService).executeCommand(SetFormulaCalculationResultMutation.id, {
            unitOtherData: { 'unit-1': { 'sheet-1': { [formulaId]: { 0: { 0: [[{ v: 'Updated' }]] } } } } },
        });
        expect(lists.getOrCompute('unit-1', 'sheet-1', rule).list).toEqual(['Updated']);
        service.removeRule('unit-1', 'sheet-1', rule.uid);
        expect(injector.get(RegisterOtherFormulaService).getFormulaValueSync('unit-1', 'sheet-1', formulaId)).toBeUndefined();
    });

    it('skips non-formula and checkbox rules and safely handles missing registrations', async () => {
        const service = univer.__getInjector().get(DataValidationFormulaService);
        service.addRule('unit-1', 'sheet-1', { ...rule, formula1: 'A,B', formula2: '' });
        expect(service.getRuleFormulaInfo('unit-1', 'sheet-1', rule.uid)).toBeUndefined();
        service.addRule('unit-1', 'sheet-1', { ...rule, type: DataValidationType.CHECKBOX });
        expect(service.getRuleFormulaInfo('unit-1', 'sheet-1', rule.uid)).toBeUndefined();
        await expect(service.getRuleFormulaResult('unit-1', 'sheet-1', 'missing')).resolves.toBeNull();
        expect(service.getRuleFormulaResultSync('unit-1', 'sheet-1', 'missing')).toBeUndefined();
        service.removeRule('unit-1', 'sheet-1', 'missing');
    });

    it('completes formula change subscriptions on disposal', () => {
        const service = univer.__getInjector().get(DataValidationFormulaService);
        const complete = vi.fn();
        service.ruleFormulaResultChanged$.subscribe({ complete });
        service.dispose();
        expect(complete).toHaveBeenCalledOnce();
    });
});
