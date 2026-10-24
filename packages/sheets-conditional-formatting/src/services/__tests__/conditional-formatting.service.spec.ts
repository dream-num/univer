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

import type { Workbook } from '@univerjs/core';
import { ICommandService, Injector, IResourceManagerService, IUniverInstanceService } from '@univerjs/core';
import { RemoveOtherFormulaMutation } from '@univerjs/engine-formula';
import {
    CopySheetCommand,
    InsertColMutation,
    InsertRowMutation,
    InsertSheetMutation,
    MoveColsMutation,
    MoveRangeMutation,
    MoveRowsMutation,
    RemoveSheetCommand,
    RemoveSheetMutation,
    ReorderRangeMutation,
    SetRangeValuesMutation,
    SheetInterceptorService,
} from '@univerjs/sheets';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CFNumberOperator, CFRuleType, CFSubRuleType } from '../../base/const';
import { AddConditionalRuleMutation } from '../../commands/mutations/add-conditional-rule.mutation';
import { createTestBed } from '../../models/calculate-unit-v2/__tests__/test.util';
import { ConditionalFormattingRangeIndexModel } from '../../models/conditional-formatting-range-index-model';
import { ConditionalFormattingRuleModel } from '../../models/conditional-formatting-rule-model';
import { ConditionalFormattingViewModel } from '../../models/conditional-formatting-view-model';
import { ConditionalFormattingStyleComposer } from '../conditional-formatting-style-composer.service';
import { ConditionalFormattingService } from '../conditional-formatting.service';

describe('ConditionalFormattingService', () => {
    let service: ConditionalFormattingService;
    let composeStyle: ReturnType<typeof vi.fn>;
    let resourceConfig: any;
    let sheetInterceptorConfig: any;
    let commandListener: (commandInfo: any) => void;
    let unitRules: Map<string, unknown[]> | null;
    let deleteUnitId: ReturnType<typeof vi.fn>;
    let addRule: ReturnType<typeof vi.fn>;
    let rebuild: ReturnType<typeof vi.fn>;
    let clearCache: ReturnType<typeof vi.fn>;
    let markRuleDirty: ReturnType<typeof vi.fn>;

    class TestConditionalFormattingRuleModel {
        getUnitRules = () => unitRules;
        getSubunitRules = (_unitId: string, subUnitId: string) => unitRules?.get(subUnitId);
        deleteUnitId = deleteUnitId;
        addRule = addRule;
        createCfId = (_unitId: string, subUnitId: string) => `${subUnitId}-new-cf`;
    }

    class TestConditionalFormattingRangeIndexModel {
        rebuild = rebuild;
        getRulesByRanges = (_unitId: string, _subUnitId: string, ranges: unknown[]) => ranges.length ? [{ cfId: 'cf-1' }] : [];
        remove = vi.fn();
        add = vi.fn();
    }

    class TestConditionalFormattingStyleComposer {
        composeStyle = composeStyle;
    }

    class TestConditionalFormattingViewModel {
        clearCache = clearCache;
        markRuleDirty = markRuleDirty;
        markCellDirty = vi.fn();
    }

    const worksheet = {
        getSheetId: () => 'sheet-1',
        getRowCount: () => 100,
        getColumnCount: () => 50,
    };
    const workbook = {
        getUnitId: () => 'book-1',
        getSheetBySheetId: (sheetId: string) => (sheetId === 'sheet-1' || sheetId === 'sheet-2' ? { ...worksheet, getSheetId: () => sheetId } : null),
        getActiveSheet: () => worksheet,
    };

    class TestUniverInstanceService {
        getUnit = (unitId: string) => (unitId === 'book-1' ? workbook : null);
        getCurrentUnitOfType = () => workbook;
    }

    class TestResourceManagerService {
        registerPluginResource(config: unknown) {
            resourceConfig = config;
            return { dispose: vi.fn() };
        }
    }

    class TestSheetInterceptorService {
        interceptCommand = vi.fn((config: unknown) => {
            sheetInterceptorConfig = config;
            return { dispose: vi.fn() };
        });
    }

    class TestCommandService {
        onCommandExecuted(listener: (commandInfo: any) => void) {
            commandListener = listener;
            return { dispose: vi.fn() };
        }
    }

    beforeEach(() => {
        composeStyle = vi.fn(() => ({ style: { bg: { rgb: '#fff000' } } }));
        resourceConfig = null;
        sheetInterceptorConfig = null;
        commandListener = () => undefined;
        unitRules = null;
        deleteUnitId = vi.fn();
        addRule = vi.fn();
        rebuild = vi.fn();
        clearCache = vi.fn();
        markRuleDirty = vi.fn();
        const injector = new Injector();
        injector.add([ConditionalFormattingRuleModel, { useClass: TestConditionalFormattingRuleModel as never }]);
        injector.add([ConditionalFormattingRangeIndexModel, { useClass: TestConditionalFormattingRangeIndexModel as never }]);
        injector.add([ConditionalFormattingStyleComposer, { useClass: TestConditionalFormattingStyleComposer as never }]);
        injector.add([ConditionalFormattingViewModel, { useClass: TestConditionalFormattingViewModel as never }]);
        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([IResourceManagerService, { useClass: TestResourceManagerService as never }]);
        injector.add([SheetInterceptorService, { useClass: TestSheetInterceptorService as never }]);
        injector.add([ICommandService, { useClass: TestCommandService as never }]);
        injector.add([ConditionalFormattingService]);
        service = injector.get(ConditionalFormattingService);
    });

    it('composes the conditional style for the requested cell through the style composer', () => {
        expect(service.composeStyle('book-1', 'sheet-1', 2, 3)).toEqual({ style: { bg: { rgb: '#fff000' } } });
        expect(composeStyle).toHaveBeenCalledWith('book-1', 'sheet-1', 2, 3);
    });

    it('serializes, loads, and unloads conditional-formatting snapshot resources', () => {
        const firstRule = { cfId: 'cf-1', ranges: [] };
        const secondRule = { cfId: 'cf-2', ranges: [] };
        unitRules = new Map([['sheet-1', [firstRule, secondRule]]]);

        expect(resourceConfig.toJson('book-1')).toBe(JSON.stringify({ 'sheet-1': [firstRule, secondRule] }));
        expect(resourceConfig.parseJson('')).toEqual({});
        expect(resourceConfig.parseJson('{bad')).toEqual({});
        expect(resourceConfig.parseJson('{"sheet-1":[]}')).toEqual({ 'sheet-1': [] });

        resourceConfig.onLoad('book-2', { 'sheet-2': [firstRule, secondRule] });
        expect(addRule).toHaveBeenNthCalledWith(1, 'book-2', 'sheet-2', secondRule);
        expect(addRule).toHaveBeenNthCalledWith(2, 'book-2', 'sheet-2', firstRule);

        resourceConfig.onUnLoad('book-1');
        expect(deleteUnitId).toHaveBeenCalledWith('book-1');
        expect(rebuild).toHaveBeenCalled();
        expect(clearCache).toHaveBeenCalled();
    });

    it('marks affected conditional-formatting rules dirty after cell value and reorder mutations', () => {
        commandListener({
            id: SetRangeValuesMutation.id,
            params: {
                unitId: 'book-1',
                subUnitId: 'sheet-1',
                cellValue: {
                    1: { 2: { v: 10 } },
                    3: { 4: { s: 'style-only' } },
                },
            },
        });
        commandListener({
            id: ReorderRangeMutation.id,
            params: {
                unitId: 'book-1',
                subUnitId: 'sheet-1',
                range: { startRow: 1, endRow: 3, startColumn: 0, endColumn: 2 },
            },
        });
        commandListener({ id: 'unrelated.command', params: {} });

        expect(markRuleDirty).toHaveBeenCalledTimes(2);
        expect(markRuleDirty).toHaveBeenCalledWith('book-1', 'sheet-1', 'cf-1');
    });

    it('creates conditional-formatting undo redo mutations for sheet remove and copy commands', () => {
        const firstRule = { cfId: 'cf-1', ranges: [] };
        const secondRule = { cfId: 'cf-2', ranges: [] };
        unitRules = new Map([['sheet-1', [firstRule, secondRule]]]);

        const removeResult = sheetInterceptorConfig.getMutations({
            id: RemoveSheetCommand.id,
            params: { unitId: 'book-1', subUnitId: 'sheet-1' },
        });
        expect(removeResult.redos).toEqual([
            { id: 'sheet.mutation.delete-conditional-rule', params: { unitId: 'book-1', subUnitId: 'sheet-1', cfId: 'cf-1' } },
            { id: 'sheet.mutation.delete-conditional-rule', params: { unitId: 'book-1', subUnitId: 'sheet-1', cfId: 'cf-2' } },
        ]);
        expect(removeResult.undos.length).toBeGreaterThan(0);

        const copyResult = sheetInterceptorConfig.getMutations({
            id: CopySheetCommand.id,
            params: { unitId: 'book-1', subUnitId: 'sheet-1', targetSubUnitId: 'sheet-2' },
        });
        expect(copyResult.redos).toEqual([
            {
                id: 'sheet.mutation.add-conditional-rule',
                params: { unitId: 'book-1', subUnitId: 'sheet-2', rule: { cfId: 'sheet-2-new-cf', ranges: [] } },
            },
            {
                id: 'sheet.mutation.add-conditional-rule',
                params: { unitId: 'book-1', subUnitId: 'sheet-2', rule: { cfId: 'sheet-2-new-cf', ranges: [] } },
            },
        ]);
        expect(sheetInterceptorConfig.getMutations({ id: 'unrelated.command', params: {} })).toEqual({ redos: [], undos: [] });
        expect(sheetInterceptorConfig.getMutations({ id: RemoveSheetCommand.id, params: { unitId: 'missing', subUnitId: 'sheet-1' } })).toEqual({ redos: [], undos: [] });
    });

    it('marks conditional-formatting rules dirty after row and column structure changes', () => {
        const range = { startRow: 2, endRow: 3, startColumn: 4, endColumn: 5 };
        commandListener({ id: InsertColMutation.id, params: { unitId: 'book-1', subUnitId: 'sheet-1', range } });
        commandListener({ id: InsertRowMutation.id, params: { unitId: 'book-1', subUnitId: 'sheet-1', range } });
        commandListener({
            id: MoveRowsMutation.id,
            params: {
                unitId: 'book-1',
                subUnitId: 'sheet-1',
                sourceRange: { startRow: 5, endRow: 6, startColumn: 0, endColumn: 10 },
                targetRange: { startRow: 1, endRow: 2, startColumn: 0, endColumn: 10 },
            },
        });
        commandListener({
            id: MoveColsMutation.id,
            params: {
                unitId: 'book-1',
                subUnitId: 'sheet-1',
                sourceRange: { startRow: 0, endRow: 10, startColumn: 5, endColumn: 6 },
                targetRange: { startRow: 0, endRow: 10, startColumn: 1, endColumn: 2 },
            },
        });
        commandListener({
            id: MoveRangeMutation.id,
            params: {
                unitId: 'book-1',
                from: { subUnitId: 'sheet-1', value: { 0: { 0: { v: 1 } } } },
                to: { subUnitId: 'sheet-1', value: { 2: { 2: { v: 1 } } } },
            },
        });

        expect(markRuleDirty).toHaveBeenCalledWith('book-1', 'sheet-1', 'cf-1');
        expect(markRuleDirty.mock.calls.length).toBeGreaterThanOrEqual(6);
    });
});

it('preserves stop-if-true priority when copying a sheet, undoing, and redoing', async () => {
    vi.useFakeTimers();
    const testBed = createTestBed();
    try {
        const service = testBed.getConditionalFormattingService();
        const ruleModel = testBed.getConditionalFormattingRuleModel();
        const workbook = testBed.get(IUniverInstanceService).getUnit<Workbook>(testBed.unitId)!;
        testBed.commandService.registerCommand(InsertSheetMutation);
        testBed.commandService.registerCommand(RemoveSheetMutation);
        testBed.commandService.registerCommand(RemoveOtherFormulaMutation);
        const ranges = [{ startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 }];
        const base = {
            type: CFRuleType.highlightCell,
            subType: CFSubRuleType.number,
            operator: CFNumberOperator.greaterThan,
            value: 0,
        };
        for (const rule of [
            { cfId: 'red', ranges, stopIfTrue: false, rule: { ...base, style: { bg: { rgb: '#ff0000' } } } },
            { cfId: 'stop', ranges, stopIfTrue: true, rule: { ...base, style: {} } },
            { cfId: 'higher', ranges, stopIfTrue: false, rule: { ...base, style: { cl: { rgb: '#333333' } } } },
        ]) {
            testBed.commandService.syncExecuteCommand(AddConditionalRuleMutation.id, {
                unitId: testBed.unitId,
                subUnitId: testBed.subUnitId,
                rule,
            });
        }
        const source = service.composeStyle(testBed.unitId, testBed.subUnitId, 0, 1);
        expect(source).toEqual({ style: { cl: { rgb: '#333333' } } });
        const sourceRules = ruleModel.getSubunitRules(testBed.unitId, testBed.subUnitId)!;
        const targetSubUnitId = 'copied';
        const insertParams = {
            unitId: testBed.unitId,
            index: 1,
            sheet: { ...workbook.getActiveSheet()!.getConfig(), id: targetSubUnitId, name: targetSubUnitId },
        };
        const { redos, undos } = testBed.get(SheetInterceptorService).onCommandExecute({
            id: CopySheetCommand.id,
            params: { unitId: testBed.unitId, subUnitId: testBed.subUnitId, targetSubUnitId },
        });
        for (let attempt = 0; attempt < 2; attempt++) {
            expect(testBed.commandService.syncExecuteCommand(InsertSheetMutation.id, insertParams)).toBe(true);
            for (const mutation of redos) {
                expect(testBed.commandService.syncExecuteCommand(mutation.id, mutation.params)).toBe(true);
            }
            await vi.advanceTimersByTimeAsync(100);
            expect(service.composeStyle(testBed.unitId, targetSubUnitId, 0, 1)).toEqual(source);
            const copiedRules = ruleModel.getSubunitRules(testBed.unitId, targetSubUnitId)!;
            expect(copiedRules.map(({ cfId, ...rule }) => rule))
                .toEqual(sourceRules.map(({ cfId, ...rule }) => rule));
            expect(copiedRules.every((rule) => !sourceRules.some((sourceRule) => sourceRule.cfId === rule.cfId))).toBe(true);
            expect(sourceRules.map((rule) => rule.cfId)).toEqual(['higher', 'stop', 'red']);

            expect(testBed.commandService.syncExecuteCommand(RemoveSheetMutation.id, {
                unitId: testBed.unitId,
                subUnitId: targetSubUnitId,
            })).toBe(true);
            for (const mutation of undos) {
                expect(testBed.commandService.syncExecuteCommand(mutation.id, mutation.params)).toBe(true);
            }
            expect(ruleModel.getSubunitRules(testBed.unitId, targetSubUnitId)).toEqual([]);
        }
    } finally {
        testBed.univer.dispose();
        vi.useRealTimers();
    }
});
