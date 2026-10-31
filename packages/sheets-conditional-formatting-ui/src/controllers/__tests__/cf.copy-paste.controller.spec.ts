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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import type { IConditionFormattingRule } from '@univerjs/sheets-conditional-formatting';
import {
    CellValueType,
    ICommandService,
    IResourceLoaderService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    Range,
    RedoCommand,
    Tools,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import {
    MoveRangeCommand,
    SetRangeValuesCommand,
    SetSelectionsOperation,
    SetWorksheetActiveOperation,
    UniverSheetsPlugin,
} from '@univerjs/sheets';
import {
    AddCfCommand,
    AddConditionalRuleMutation,
    CFRuleType,
    CFSubRuleType,
    CFTextOperator,
    ConditionalFormattingRuleModel,
    ConditionalFormattingService,
    ConditionalFormattingStyleComposer,
    ConditionalFormattingViewModel,
    DeleteConditionalRuleMutation,
    SetConditionalRuleMutation,
    UniverSheetsConditionalFormattingPlugin,
} from '@univerjs/sheets-conditional-formatting';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import {
    COPY_TYPE,
    IMarkSelectionService,
    ISheetClipboardService,
    MarkSelectionService,
    PREDEFINED_HOOK_NAME_PASTE,
    SheetClipboardController,
    SheetClipboardService,
} from '@univerjs/sheets-ui';
import sheetsEnUS from '@univerjs/sheets/locale/en-US';
import {
    BrowserClipboardService,
    DesktopMessageService,
    DesktopNotificationService,
    IClipboardInterfaceService,
    IMessageService,
    INotificationService,
    IPlatformService,
    IUIPartsService,
    PlatformService,
    UIPartsService,
} from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCfUiTestBed } from '../../__tests__/create-cf-ui-test-bed';
import { ConditionalFormattingFormulaRefRangeController } from '../cf-formula-ref-range.controller';
import { ConditionalFormattingCopyPasteController } from '../cf.copy-paste.controller';

describe('ConditionalFormattingCopyPasteController', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it.each([
        { branch: 'whole', absolute: false, mode: 'clipboard' },
        { branch: 'partial', absolute: false, mode: 'clipboard' },
        { branch: 'whole', absolute: true, mode: 'clipboard' },
        { branch: 'partial', absolute: true, mode: 'clipboard' },
        { branch: 'partial', absolute: false, mode: 'command' },
        { branch: 'partial', absolute: true, mode: 'command' },
    ])('moves a $branch formula rule across sheets with absolute=$absolute through $mode without retaining destination coordinates in the source owner', async ({ branch, absolute, mode }) => {
        const univer = new Univer();
        univer.registerPlugin(UniverSheetsPlugin);
        univer.registerPlugin(UniverSheetsFormulaPlugin);
        univer.registerPlugin(UniverSheetsConditionalFormattingPlugin);
        const injector = univer.__getInjector();
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([IMarkSelectionService, { useClass: MarkSelectionService }]);
        injector.add([IPlatformService, { useClass: PlatformService }]);
        injector.add([IUIPartsService, { useClass: UIPartsService }]);
        injector.add([INotificationService, { useClass: DesktopNotificationService }]);
        injector.add([IMessageService, { useClass: DesktopMessageService }]);
        injector.add([IClipboardInterfaceService, { useClass: BrowserClipboardService }]);
        injector.add([ISheetClipboardService, { useClass: SheetClipboardService }]);
        injector.add([SheetClipboardController]);
        injector.add([ConditionalFormattingFormulaRefRangeController]);
        injector.add([ConditionalFormattingCopyPasteController]);
        try {
            const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
                id: 'cut-rules',
                name: 'Cut rules',
                locale: LocaleType.EN_US,
                styles: {},
                sheetOrder: ['source', 'target', 'consumer', 'priority'],
                sheets: {
                    source: { id: 'source', name: 'Source', cellData: { 1: { 0: { v: 5, t: CellValueType.NUMBER }, 1: { v: 10, t: CellValueType.NUMBER } }, 2: { 1: { v: -10, t: CellValueType.NUMBER } }, 9: { 9: { v: 77, t: CellValueType.NUMBER } } } },
                    target: { id: 'target', name: 'Target', cellData: { 3: { 4: { v: -99, t: CellValueType.NUMBER } }, 4: { 4: { v: -88, t: CellValueType.NUMBER } }, 9: { 9: { v: 88, t: CellValueType.NUMBER } } } },
                    consumer: { id: 'consumer', name: 'Consumer', cellData: { 9: { 9: { v: 99, t: CellValueType.NUMBER } } } },
                    priority: { id: 'priority', name: 'Priority', cellData: { 1: { 9: { v: 1, t: CellValueType.NUMBER } }, 2: { 9: { v: 1, t: CellValueType.NUMBER } } } },
                },
            });
            const locale = injector.get(LocaleService);
            locale.load({ [LocaleType.EN_US]: sheetsEnUS });
            locale.setLocale(LocaleType.EN_US);
            locale.setDirection('ltr');
            // Production initializes formula ref tracking before the rendered clipboard hook.
            injector.get(ConditionalFormattingFormulaRefRangeController);
            injector.get(SheetClipboardController);
            injector.get(ConditionalFormattingCopyPasteController);
            const commands = injector.get(ICommandService);
            const model = injector.get(ConditionalFormattingRuleModel);
            const view = injector.get(ConditionalFormattingViewModel);
            const instances = injector.get(IUniverInstanceService);
            instances.focusUnit(workbook.getUnitId());
            instances.setCurrentUnitForType(workbook.getUnitId());
            const sourceRule: IConditionFormattingRule = {
                cfId: 'cut-formula',
                ranges: [{ startRow: 1, endRow: branch === 'whole' ? 1 : 2, startColumn: 1, endColumn: 1 }],
                stopIfTrue: false,
                rule: { type: CFRuleType.highlightCell, subType: CFSubRuleType.formula, value: absolute ? '=AND($B$2>0,$A$2>0)' : '=AND(B2>0,$A$2>0)', style: { bl: 1 } },
            };
            const targetRule: IConditionFormattingRule = {
                cfId: 'target-existing',
                ranges: [{ startRow: 3, endRow: 4, startColumn: 4, endColumn: 4 }],
                stopIfTrue: false,
                rule: { type: CFRuleType.highlightCell, subType: CFSubRuleType.formula, value: '=E4<0', style: { it: 1 } },
            };
            const consumerRule: IConditionFormattingRule = {
                cfId: 'consumer-dependency',
                ranges: [{ startRow: 9, endRow: 9, startColumn: 9, endColumn: 9 }],
                stopIfTrue: false,
                rule: { type: CFRuleType.highlightCell, subType: CFSubRuleType.formula, value: '=Source!$B$2>0', style: { bl: 1 } },
            };
            const sourceOutside: IConditionFormattingRule = {
                cfId: 'source-outside',
                ranges: [{ startRow: 9, endRow: 9, startColumn: 9, endColumn: 9 }],
                stopIfTrue: true,
                rule: { type: CFRuleType.highlightCell, subType: CFSubRuleType.formula, value: '=J10>0', style: { it: 1 } },
            };
            const targetOutside = { ...sourceOutside, cfId: 'target-outside' };
            const splitRule: IConditionFormattingRule = {
                cfId: 'split-rule',
                ranges: [{ startRow: 1, endRow: 2, startColumn: 9, endColumn: 9 }],
                stopIfTrue: false,
                rule: { type: CFRuleType.highlightCell, subType: CFSubRuleType.formula, value: '=Source!B1>0', style: { bl: 1 } },
            };
            const highRule: IConditionFormattingRule = {
                cfId: 'high-rule',
                ranges: [{ startRow: 2, endRow: 2, startColumn: 9, endColumn: 9 }],
                stopIfTrue: true,
                rule: { type: CFRuleType.highlightCell, subType: CFSubRuleType.formula, value: '=J3>0', style: { it: 1 } },
            };
            const lowRule = { ...splitRule, cfId: 'low-rule', rule: { ...splitRule.rule, value: '=J2>0' } };
            for (const [subUnitId, rule] of [
                ['source', sourceRule],
                ['source', sourceOutside],
                ['target', targetRule],
                ['target', targetOutside],
                ['consumer', consumerRule],
                ['priority', lowRule],
                ['priority', splitRule],
                ['priority', highRule],
            ] as const) {
                expect(await commands.executeCommand(AddCfCommand.id, { unitId: 'cut-rules', subUnitId, rule })).toBe(true);
            }
            const beforeSource = Tools.deepClone(model.getSubunitRules('cut-rules', 'source'));
            const beforeTarget = Tools.deepClone(model.getSubunitRules('cut-rules', 'target'));
            const beforeConsumer = Tools.deepClone(model.getSubunitRules('cut-rules', 'consumer'));
            const beforePriority = Tools.deepClone(model.getSubunitRules('cut-rules', 'priority'));
            expect(beforePriority!.map((rule) => rule.cfId)).toEqual(['high-rule', 'split-rule', 'low-rule']);
            const beforeSourceOutside = Tools.deepClone(sourceOutside);
            const beforeTargetOutside = Tools.deepClone(targetOutside);
            const sourceCells = Tools.deepClone(workbook.getSheetBySheetId('source')!.getSnapshot().cellData);
            const targetCells = Tools.deepClone(workbook.getSheetBySheetId('target')!.getSnapshot().cellData);
            expect(await commands.executeCommand(SetSelectionsOperation.id, {
                unitId: 'cut-rules',
                subUnitId: 'source',
                selections: [{ range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }, primary: null, style: null }],
            })).toBe(true);
            const clipboard = injector.get(ISheetClipboardService);
            vi.spyOn(injector.get(IClipboardInterfaceService), 'write').mockResolvedValue();
            const destination = { startRow: 3, endRow: 3, startColumn: 4, endColumn: 4 };
            if (mode === 'clipboard') {
                expect(await clipboard.copy({ copyType: COPY_TYPE.CUT })).toBe(true);
                expect(await clipboard.pasteByCopyId(clipboard.copyContentCache().getLastCopyId()!, PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE, {
                    unitId: 'cut-rules',
                    subUnitId: 'target',
                    range: destination,
                })).toBe(true);
            } else {
                expect(await commands.executeCommand(MoveRangeCommand.id, {
                    fromUnitId: 'cut-rules',
                    toUnitId: 'cut-rules',
                    fromSubUnitId: 'source',
                    toSubUnitId: 'target',
                    fromRange: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                    toRange: destination,
                })).toBe(true);
            }
            expect(model.getRule('cut-rules', 'consumer', consumerRule.cfId)).toMatchObject({
                ranges: [{ startRow: 9, endRow: 9, startColumn: 9, endColumn: 9 }],
                rule: { value: '=Target!$E$4>0' },
            });
            const priorityRules = model.getSubunitRules('cut-rules', 'priority')!;
            const newPriority = priorityRules.filter((rule) => !['high-rule', 'split-rule', 'low-rule'].includes(rule.cfId));
            expect(newPriority).toHaveLength(1);
            expect(newPriority[0]).toMatchObject({
                ranges: [{ startRow: 2, endRow: 2, startColumn: 9, endColumn: 9 }],
                rule: { value: '=Target!E4>0' },
            });
            expect(priorityRules.map((rule) => rule.cfId)).toEqual(['high-rule', 'split-rule', newPriority[0].cfId, 'low-rule']);
            await expect.poll(() => injector.get(ConditionalFormattingService).composeStyle('cut-rules', 'priority', 2, 9)?.style)
                .toEqual({ it: 1 });
            expect(model.getRule('cut-rules', 'source', sourceOutside.cfId)).toEqual(beforeSourceOutside);
            expect(model.getRule('cut-rules', 'target', targetOutside.cfId)).toEqual(beforeTargetOutside);
            const afterSource = (model.getSubunitRules('cut-rules', 'source') || []).filter((rule) => rule.cfId !== sourceOutside.cfId);
            expect(afterSource).toHaveLength(branch === 'whole' ? 0 : 1);
            if (branch === 'partial') {
                expect(afterSource[0]).toMatchObject({
                    cfId: sourceRule.cfId,
                    ranges: [{ startRow: 2, endRow: 2, startColumn: 1, endColumn: 1 }],
                    rule: { value: absolute ? '=AND(Target!$E$4>0,$A$2>0)' : '=AND(B3>0,$A$2>0)' },
                });
            }
            const moved = (model.getSubunitRules('cut-rules', 'target') || []).filter((rule) => rule.cfId !== targetRule.cfId && rule.cfId !== targetOutside.cfId);
            expect(moved).toHaveLength(1);
            expect(moved[0].cfId).not.toBe(sourceRule.cfId);
            expect(moved[0]).toMatchObject({
                ranges: [{ startRow: 3, endRow: 3, startColumn: 4, endColumn: 4 }],
                rule: { value: absolute ? '=AND($E$4>0,Source!$A$2>0)' : '=AND(E4>0,Source!$A$2>0)', style: { bl: 1 } },
            });
            expect(model.getRule('cut-rules', 'target', targetRule.cfId)).toMatchObject({
                ranges: [{ startRow: 4, endRow: 4, startColumn: 4, endColumn: 4 }],
                rule: { value: '=E5<0' },
            });
            expect((model.getSubunitRules('cut-rules', 'target') || []).filter((rule) => rule.cfId !== moved[0].cfId).map((rule) => rule.cfId))
                .toEqual([targetOutside.cfId, targetRule.cfId]);
            await expect.poll(() => view.getCellCfs('cut-rules', 'target', 3, 4)?.some((item) => item.result?.bl === 1) ?? false).toBe(true);
            await expect.poll(() => view.getCellCfs('cut-rules', 'target', 4, 4)?.some((item) => item.result?.it === 1) ?? false).toBe(true);
            if (branch === 'partial') {
                await expect.poll(() => view.getCellCfs('cut-rules', 'source', 2, 1)?.some((item) => item.result?.bl === 1) ?? false).toBe(absolute);
            }
            expect(workbook.getSheetBySheetId('source')!.getCellRaw(1, 1)?.v ?? null).toBeNull();
            expect(workbook.getSheetBySheetId('source')!.getCellRaw(1, 0)?.v).toBe(5);
            expect(workbook.getSheetBySheetId('target')!.getCellRaw(3, 4)?.v).toBe(10);
            expect(workbook.getSheetBySheetId('source')!.getCellRaw(9, 9)?.v).toBe(77);
            expect(workbook.getSheetBySheetId('target')!.getCellRaw(9, 9)?.v).toBe(88);
            const movedSource = Tools.deepClone(model.getSubunitRules('cut-rules', 'source') || []);
            const movedTarget = Tools.deepClone(model.getSubunitRules('cut-rules', 'target') || []);
            const movedConsumer = Tools.deepClone(model.getSubunitRules('cut-rules', 'consumer') || []);
            const movedPriority = Tools.deepClone(priorityRules);
            instances.focusUnit('cut-rules');
            expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
            expect(model.getSubunitRules('cut-rules', 'source')).toEqual(beforeSource);
            expect(model.getSubunitRules('cut-rules', 'target')).toEqual(beforeTarget);
            expect(model.getSubunitRules('cut-rules', 'consumer')).toEqual(beforeConsumer);
            expect(model.getSubunitRules('cut-rules', 'priority')).toEqual(beforePriority);
            expect(workbook.getSheetBySheetId('source')!.getSnapshot().cellData).toEqual(sourceCells);
            expect(workbook.getSheetBySheetId('target')!.getSnapshot().cellData).toEqual(targetCells);
            expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
            expect(model.getSubunitRules('cut-rules', 'source') || []).toEqual(movedSource);
            expect(model.getSubunitRules('cut-rules', 'target') || []).toEqual(movedTarget);
            expect(model.getSubunitRules('cut-rules', 'consumer') || []).toEqual(movedConsumer);
            expect(model.getSubunitRules('cut-rules', 'priority') || []).toEqual(movedPriority);
            const snapshot = injector.get(IResourceLoaderService).saveUnit<IWorkbookData>('cut-rules')!;
            instances.disposeUnit('cut-rules');
            univer.createUnit(UniverInstanceType.UNIVER_SHEET, JSON.parse(JSON.stringify(snapshot)));
            instances.focusUnit('cut-rules');
            expect(model.getSubunitRules('cut-rules', 'source') || []).toEqual(movedSource);
            expect(model.getSubunitRules('cut-rules', 'target') || []).toEqual(movedTarget);
            expect(model.getSubunitRules('cut-rules', 'consumer') || []).toEqual(movedConsumer);
            expect(model.getSubunitRules('cut-rules', 'priority') || []).toEqual(movedPriority);
            expect(await commands.executeCommand(SetRangeValuesCommand.id, {
                unitId: 'cut-rules',
                subUnitId: 'target',
                range: destination,
                value: { v: -1 },
            })).toBe(true);
            await expect.poll(() => view.getCellCfs('cut-rules', 'target', 3, 4)?.some((item) => item.result?.bl === 1) ?? false).toBe(false);
            await expect.poll(() => view.getCellCfs('cut-rules', 'consumer', 9, 9)?.some((item) => item.result?.bl === 1) ?? false).toBe(false);
            expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
            await expect.poll(() => view.getCellCfs('cut-rules', 'target', 3, 4)?.some((item) => item.result?.bl === 1) ?? false).toBe(true);
            expect(await commands.executeCommand(SetRangeValuesCommand.id, {
                unitId: 'cut-rules',
                subUnitId: 'source',
                range: { startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 },
                value: { v: -5 },
            })).toBe(true);
            await expect.poll(() => view.getCellCfs('cut-rules', 'target', 3, 4)?.some((item) => item.result?.bl === 1) ?? false).toBe(false);
            await expect.poll(() => view.getCellCfs('cut-rules', 'consumer', 9, 9)?.some((item) => item.result?.bl === 1) ?? false).toBe(true);
            expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
            await expect.poll(() => view.getCellCfs('cut-rules', 'target', 3, 4)?.some((item) => item.result?.bl === 1) ?? false).toBe(true);
        } finally {
            univer.dispose();
        }
    });

    it.each([
        {
            name: 'single copy',
            targetRange: { startRow: 4, endRow: 4, startColumn: 3, endColumn: 4 },
            expectedRanges: [{ startRow: 4, endRow: 4, startColumn: 4, endColumn: 4 }],
        },
        {
            name: 'repeated copy',
            targetRange: { startRow: 4, endRow: 5, startColumn: 3, endColumn: 6 },
            expectedRanges: [
                { startRow: 4, endRow: 5, startColumn: 4, endColumn: 4 },
                { startRow: 4, endRow: 5, startColumn: 6, endColumn: 6 },
            ],
        },
    ])('copies an offset rule into another workbook with independent history and persisted identity: $name', async ({ targetRange, expectedRanges }) => {
        const testBed = createCfUiTestBed(undefined, true);
        try {
            const { injector, commandService, ruleModel } = testBed;
            injector.add([ConditionalFormattingStyleComposer]);
            injector.add([ConditionalFormattingService]);
            injector.add([ConditionalFormattingCopyPasteController]);
            injector.get(ConditionalFormattingService);
            injector.get(ConditionalFormattingCopyPasteController);
            for (const command of [
                AddCfCommand,
                SetSelectionsOperation,
                SetWorksheetActiveOperation,
            ]) {
                commandService.registerCommand(command);
            }
            const targetId = 'clipboard-target';
            testBed.univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
                id: targetId,
                appVersion: '3.0.0-alpha',
                name: 'Independent target',
                locale: LocaleType.EN_US,
                sheetOrder: [testBed.subUnitId],
                sheets: { [testBed.subUnitId]: { id: testBed.subUnitId, name: 'Scratch', cellData: {} } },
                styles: {},
            });
            const sourceRule: IConditionFormattingRule = {
                cfId: 'positive-source',
                ranges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }],
                stopIfTrue: false,
                rule: {
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.text,
                    operator: CFTextOperator.notContainsText,
                    value: 'negative',
                    style: { bl: 1 },
                },
            };
            expect(await commandService.executeCommand(AddCfCommand.id, {
                unitId: testBed.unitId,
                subUnitId: testBed.subUnitId,
                rule: sourceRule,
            })).toBe(true);
            const source = testBed.get(IUniverInstanceService).getUnit<Workbook>(testBed.unitId)!.getActiveSheet()!;
            expect(await commandService.executeCommand(SetRangeValuesCommand.id, {
                unitId: testBed.unitId,
                subUnitId: testBed.subUnitId,
                range: { startRow: 1, endRow: 1, startColumn: 0, endColumn: 1 },
                value: [[{ v: 10 }, { f: '=A2*2' }]],
            })).toBe(true);
            const clipboard = injector.get(ISheetClipboardService);
            vi.spyOn(injector.get(IClipboardInterfaceService), 'write').mockResolvedValue();
            const instances = testBed.get(IUniverInstanceService);
            instances.focusUnit(testBed.unitId);
            instances.setCurrentUnitForType(testBed.unitId);
            testBed.setSelection({
                startRow: 1,
                endRow: 1,
                startColumn: 0,
                endColumn: 1,
            });
            expect(await clipboard.copy()).toBe(true);
            const copyId = clipboard.copyContentCache().getLastCopyId()!;
            expect(clipboard.copyContentCache().get(copyId)?.unitId).toBe(testBed.unitId);
            expect(await commandService.executeCommand(SetRangeValuesCommand.id, {
                unitId: testBed.unitId,
                subUnitId: testBed.subUnitId,
                range: { startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 },
                value: { v: 20 },
            })).toBe(true);
            expect(source.getCell(1, 0)?.v).toBe(20);
            const sourceRules = Tools.deepClone(ruleModel.getSubunitRules(testBed.unitId, testBed.subUnitId) || []);
            expect(await clipboard.pasteByCopyId(copyId, PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE, {
                unitId: targetId,
                subUnitId: testBed.subUnitId,
                range: targetRange,
            })).toBe(true);
            const pastedRules = Tools.deepClone(ruleModel.getSubunitRules(targetId, testBed.subUnitId) || []);
            expect(pastedRules).toHaveLength(1);
            expect(pastedRules[0]).toMatchObject({
                rule: sourceRule.rule,
                stopIfTrue: false,
            });
            expect(pastedRules[0].ranges).toEqual(expectedRanges);
            expect(pastedRules[0].cfId).not.toBe(sourceRule.cfId);
            instances.focusUnit(targetId);
            instances.setCurrentUnitForType(targetId);
            expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
            expect(ruleModel.getSubunitRules(targetId, testBed.subUnitId)).toEqual([]);
            expect(ruleModel.getSubunitRules(testBed.unitId, testBed.subUnitId)).toEqual(sourceRules);
            expect(source.getCell(1, 0)?.v).toBe(20);
            expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
            expect(ruleModel.getSubunitRules(targetId, testBed.subUnitId)).toEqual(pastedRules);
            const snapshot = testBed.get(IResourceLoaderService).saveUnit<IWorkbookData>(targetId)!;
            expect(snapshot.resources.some((resource) => resource.data.includes(pastedRules[0].cfId))).toBe(true);
            instances.disposeUnit(targetId);
            testBed.univer.createUnit(UniverInstanceType.UNIVER_SHEET, JSON.parse(JSON.stringify(snapshot)));
            expect(ruleModel.getSubunitRules(targetId, testBed.subUnitId)).toEqual(pastedRules);
            expect(ruleModel.getSubunitRules(testBed.unitId, testBed.subUnitId)).toEqual(sourceRules);
        } finally {
            testBed.univer.dispose();
        }
    });

    it.each([
        {
            name: 'repeated contiguous target',
            rows: [10, 11, 12, 13, 14, 15],
            cols: [3, 4, 5, 6],
            expectedRanges: [
                { startRow: 12, endRow: 12, startColumn: 4, endColumn: 4 },
                { startRow: 15, endRow: 15, startColumn: 4, endColumn: 4 },
                { startRow: 12, endRow: 12, startColumn: 6, endColumn: 6 },
                { startRow: 15, endRow: 15, startColumn: 6, endColumn: 6 },
            ],
        },
        {
            name: 'repeated discrete target hook',
            rows: [10, 12, 14, 20, 22, 24],
            cols: [3, 4, 7, 8],
            expectedRanges: [
                { startRow: 14, endRow: 14, startColumn: 4, endColumn: 4 },
                { startRow: 24, endRow: 24, startColumn: 4, endColumn: 4 },
                { startRow: 14, endRow: 14, startColumn: 8, endColumn: 8 },
                { startRow: 24, endRow: 24, startColumn: 8, endColumn: 8 },
            ],
        },
    ])('clips offset source rules before mapping them to $name', async ({ name, rows, cols, expectedRanges }) => {
        const testBed = createCfUiTestBed(undefined, true);
        try {
            const { injector, commandService, ruleModel } = testBed;
            injector.add([ConditionalFormattingCopyPasteController]);
            injector.get(ConditionalFormattingCopyPasteController);
            commandService.registerCommand(AddCfCommand);
            commandService.registerCommand(SetSelectionsOperation);
            commandService.registerCommand(SetWorksheetActiveOperation);
            const targetId = 'independent-target';
            testBed.univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
                id: targetId,
                appVersion: '3.0.0-alpha',
                name: 'Target',
                locale: LocaleType.EN_US,
                sheetOrder: [testBed.subUnitId],
                sheets: { [testBed.subUnitId]: { id: testBed.subUnitId, name: 'Scratch', cellData: {} } },
                styles: {},
            });
            const sourceRule: IConditionFormattingRule = {
                cfId: 'clipped-source',
                ranges: [{ startRow: 3, endRow: 5, startColumn: 1, endColumn: 2 }],
                stopIfTrue: false,
                rule: {
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.text,
                    operator: CFTextOperator.notContainsText,
                    value: 'negative',
                    style: { bl: 1 },
                },
            };
            expect(await commandService.executeCommand(AddCfCommand.id, {
                unitId: testBed.unitId,
                subUnitId: testBed.subUnitId,
                rule: sourceRule,
            })).toBe(true);
            const instances = injector.get(IUniverInstanceService);
            instances.focusUnit(testBed.unitId);
            instances.setCurrentUnitForType(testBed.unitId);
            const clipboard = injector.get(ISheetClipboardService);
            vi.spyOn(injector.get(IClipboardInterfaceService), 'write').mockResolvedValue();
            testBed.setSelection({ startRow: 1, endRow: 3, startColumn: 0, endColumn: 1 });
            expect(await clipboard.copy()).toBe(true);
            const copyId = clipboard.copyContentCache().getLastCopyId()!;
            if (name === 'repeated contiguous target') {
                expect(await clipboard.pasteByCopyId(copyId, PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE, {
                    unitId: targetId,
                    subUnitId: testBed.subUnitId,
                    range: { startRow: 10, endRow: 15, startColumn: 3, endColumn: 6 },
                })).toBe(true);
            } else {
                const hook = clipboard.getClipboardHooks().find((item) => item.onPasteCells)!;
                const result = hook.onPasteCells!(
                    { unitId: testBed.unitId, subUnitId: testBed.subUnitId, range: { rows: [1, 2, 3], cols: [0, 1] } },
                    { unitId: targetId, subUnitId: testBed.subUnitId, range: { rows, cols } },
                    clipboard.copyContentCache().get(copyId)!.matrix!,
                    { copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
                )!;
                for (const mutation of result.redos) {
                    expect(await commandService.executeCommand(mutation.id, mutation.params)).toBe(true);
                }
            }
            const copiedRules = ruleModel.getSubunitRules(targetId, testBed.subUnitId)!;
            expect(copiedRules).toHaveLength(1);
            expect(copiedRules[0].ranges).toEqual(expectedRanges);
            expect(ruleModel.getSubunitRules(testBed.unitId, testBed.subUnitId)).toEqual([sourceRule]);
        } finally {
            testBed.univer.dispose();
        }
    });

    it('creates copy-paste mutations from the real rule model and view model', async () => {
        vi.spyOn(Range, 'foreach').mockImplementation(() => {
            throw new Error('must not enumerate cells');
        });
        const testBed = createCfUiTestBed();
        testBed.injector.add([ConditionalFormattingCopyPasteController]);
        testBed.injector.get(ConditionalFormattingCopyPasteController);

        const sourceRule: IConditionFormattingRule = {
            cfId: 'cf-source',
            ranges: [{
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 0,
            }],
            stopIfTrue: false,
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.text,
                operator: CFTextOperator.notContainsText,
                value: 'A1',
                style: { bg: { rgb: '#0f0' } },
            },
        };
        const targetRule: IConditionFormattingRule = {
            cfId: 'cf-target',
            ranges: [{
                startRow: 1,
                endRow: 1,
                startColumn: 1,
                endColumn: 1,
            }],
            stopIfTrue: false,
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.text,
                operator: CFTextOperator.notContainsText,
                value: 'B2',
                style: { bg: { rgb: '#f00' } },
            },
        };

        await testBed.commandService.executeCommand(AddConditionalRuleMutation.id, {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            rule: sourceRule,
        });
        await testBed.commandService.executeCommand(AddConditionalRuleMutation.id, {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            rule: targetRule,
        });

        const hook = testBed.getClipboardHook()!;
        expect(hook).toBeDefined();

        hook.onBeforeCopy(testBed.unitId, testBed.subUnitId, {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        });

        const result = hook.onPasteCells(
            {
                unitId: testBed.unitId,
                subUnitId: testBed.subUnitId,
                range: { rows: [0], cols: [0] },
            },
            {
                unitId: testBed.unitId,
                subUnitId: testBed.subUnitId,
                range: { rows: [1], cols: [1] },
            },
            null,
            {
                copyType: COPY_TYPE.COPY,
                pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE,
            }
        ) as {
            redos: Array<{ id: string; params: unknown }>;
            undos: Array<{ id: string; params: unknown }>;
        };

        const redoIds = result.redos.map((item: { id: string }) => item.id);
        expect(redoIds).toContain(DeleteConditionalRuleMutation.id);
        expect(redoIds.some((id: string) => id === AddConditionalRuleMutation.id || id === SetConditionalRuleMutation.id)).toBe(true);
        expect(result.undos.length).toBeGreaterThan(0);

        const copiedRuleRedo = result.redos.find((item) => {
            const params = item.params as {
                rule?: {
                    cfId?: string;
                    ranges?: Array<{ startRow: number; endRow: number; startColumn: number; endColumn: number }>;
                };
            };

            return (item.id === AddConditionalRuleMutation.id || item.id === SetConditionalRuleMutation.id) &&
                params.rule?.cfId === 'cf-source';
        });
        const copiedRuleParams = copiedRuleRedo?.params as {
            rule?: {
                ranges?: Array<{ startRow: number; endRow: number; startColumn: number; endColumn: number }>;
            };
        } | undefined;
        expect(copiedRuleParams?.rule?.ranges?.some((range: { startRow: number; endRow: number; startColumn: number; endColumn: number }) =>
            range.startRow <= 1 &&
            range.endRow >= 1 &&
            range.startColumn <= 1 &&
            range.endColumn >= 1
        )).toBe(true);

        testBed.univer.dispose();
    });

    it.each([
        {
            name: 'cross-sheet partial copy',
            sourceRanges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 2 }],
            copy: { startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 },
            target: { startRow: 3, endRow: 3, startColumn: 4, endColumn: 4 },
            crossSheet: true,
            formula: '=A2>0',
            expected: '=D4>0',
        },
        {
            name: 'cross-sheet copy with mixed absolute references',
            sourceRanges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 2 }],
            copy: { startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 },
            target: { startRow: 3, endRow: 3, startColumn: 4, endColumn: 4 },
            crossSheet: true,
            formula: '=AND(A2>0,$A$2>0)',
            expected: '=AND(D4>0,$A$2>0)',
        },
        {
            name: 'same-sheet copy before the original anchor',
            sourceRanges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }],
            copy: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
            target: { startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 },
            crossSheet: false,
            formula: '=A2>0',
            expected: '=A1>0',
        },
    ])('keeps relative formula references aligned after $name', async ({ sourceRanges, copy, target, crossSheet, formula, expected }) => {
        const testBed = createCfUiTestBed();
        try {
            const workbook = testBed.get(IUniverInstanceService).getUnit<Workbook>(testBed.unitId, UniverInstanceType.UNIVER_SHEET)!;
            if (crossSheet) {
                workbook.addWorksheet('sheet2', 1, { id: 'sheet2', name: 'sheet2' });
            }
            testBed.injector.add([LexerTreeBuilder]);
            testBed.injector.add([ConditionalFormattingCopyPasteController]);
            testBed.injector.get(ConditionalFormattingCopyPasteController);
            const sourceRule: IConditionFormattingRule = {
                cfId: 'formula-source',
                ranges: sourceRanges,
                stopIfTrue: false,
                rule: { type: CFRuleType.highlightCell, subType: CFSubRuleType.formula, value: formula, style: { bl: 1 } },
            };
            expect(await testBed.commandService.executeCommand(AddConditionalRuleMutation.id, {
                unitId: testBed.unitId,
                subUnitId: testBed.subUnitId,
                rule: sourceRule,
            })).toBe(true);

            const hook = testBed.getClipboardHook()!;
            hook.onBeforeCopy(testBed.unitId, testBed.subUnitId, copy);
            const destinationSheet = crossSheet ? 'sheet2' : testBed.subUnitId;
            const result = hook.onPasteCells(
                { unitId: testBed.unitId, subUnitId: testBed.subUnitId, range: { rows: [copy.startRow], cols: [copy.startColumn] } },
                { unitId: testBed.unitId, subUnitId: destinationSheet, range: { rows: [target.startRow], cols: [target.startColumn] } },
                null,
                { copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
            );
            for (const mutation of result.redos) {
                expect(await testBed.commandService.executeCommand(mutation.id, mutation.params as Record<string, unknown>)).toBe(true);
            }
            const pastedRules = testBed.ruleModel.getSubunitRules(testBed.unitId, destinationSheet)!;
            const pastedRule = pastedRules.find((rule) => rule.ranges.some((range) =>
                range.startRow <= target.startRow && range.endRow >= target.endRow &&
                range.startColumn <= target.startColumn && range.endColumn >= target.endColumn
            ));
            expect(pastedRule?.rule).toMatchObject({ value: expected });
            if (crossSheet) {
                expect(testBed.ruleModel.getRule(testBed.unitId, testBed.subUnitId, sourceRule.cfId)).toEqual(sourceRule);
            }
            for (const mutation of result.undos) {
                expect(await testBed.commandService.executeCommand(mutation.id, mutation.params as Record<string, unknown>)).toBe(true);
            }
            expect(testBed.ruleModel.getRule(testBed.unitId, testBed.subUnitId, sourceRule.cfId)).toEqual(sourceRule);
            if (crossSheet) {
                expect(testBed.ruleModel.getSubunitRules(testBed.unitId, destinationSheet)).toEqual([]);
            }
            for (const mutation of result.redos) {
                expect(await testBed.commandService.executeCommand(mutation.id, mutation.params as Record<string, unknown>)).toBe(true);
            }
            expect(testBed.ruleModel.getSubunitRules(testBed.unitId, destinationSheet)?.find((rule) =>
                rule.ranges.some((range) => range.startRow <= target.startRow && range.endRow >= target.endRow &&
                    range.startColumn <= target.startColumn && range.endColumn >= target.endColumn)
            )?.rule).toMatchObject({ value: expected });
        } finally {
            testBed.univer.dispose();
        }
    });

    it('preserves a remaining target formula rule when paste removes its first cell', async () => {
        const testBed = createCfUiTestBed();
        try {
            testBed.injector.add([LexerTreeBuilder]);
            testBed.injector.add([ConditionalFormattingCopyPasteController]);
            testBed.injector.get(ConditionalFormattingCopyPasteController);
            const sourceRange = { startRow: 3, endRow: 3, startColumn: 4, endColumn: 4 };
            const targetRange = { startRow: 1, endRow: 1, startColumn: 1, endColumn: 2 };
            for (const rule of [
                { cfId: 'target-formula', ranges: [targetRange], stopIfTrue: false, rule: { type: CFRuleType.highlightCell, subType: CFSubRuleType.formula, value: '=A2>0', style: { bl: 1 } } },
                { cfId: 'source-formula', ranges: [sourceRange], stopIfTrue: false, rule: { type: CFRuleType.highlightCell, subType: CFSubRuleType.formula, value: '=D4>0', style: { it: 1 } } },
            ] as IConditionFormattingRule[]) {
                expect(await testBed.commandService.executeCommand(AddConditionalRuleMutation.id, {
                    unitId: testBed.unitId,
                    subUnitId: testBed.subUnitId,
                    rule,
                })).toBe(true);
            }
            const hook = testBed.getClipboardHook()!;
            hook.onBeforeCopy(testBed.unitId, testBed.subUnitId, sourceRange);
            const result = hook.onPasteCells(
                { unitId: testBed.unitId, subUnitId: testBed.subUnitId, range: { rows: [3], cols: [4] } },
                { unitId: testBed.unitId, subUnitId: testBed.subUnitId, range: { rows: [1], cols: [1] } },
                null,
                { copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
            );
            for (const mutation of result.redos) {
                expect(await testBed.commandService.executeCommand(mutation.id, mutation.params as Record<string, unknown>)).toBe(true);
            }
            expect(testBed.ruleModel.getRule(testBed.unitId, testBed.subUnitId, 'target-formula')).toMatchObject({
                ranges: [{ startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 }],
                rule: { value: '=B2>0' },
            });
            expect(testBed.ruleModel.getRule(testBed.unitId, testBed.subUnitId, 'source-formula')).toMatchObject({
                rule: { value: '=A2>0' },
            });
        } finally {
            testBed.univer.dispose();
        }
    });

    it('keeps the source rule intact when an earlier copy makes its formula reference invalid', async () => {
        const testBed = createCfUiTestBed();
        try {
            testBed.injector.add([LexerTreeBuilder]);
            testBed.injector.add([ConditionalFormattingCopyPasteController]);
            testBed.injector.get(ConditionalFormattingCopyPasteController);
            const sourceRule: IConditionFormattingRule = {
                cfId: 'source-formula',
                ranges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }],
                stopIfTrue: false,
                rule: { type: CFRuleType.highlightCell, subType: CFSubRuleType.formula, value: '=A2>0', style: { bl: 1 } },
            };
            expect(await testBed.commandService.executeCommand(AddConditionalRuleMutation.id, {
                unitId: testBed.unitId,
                subUnitId: testBed.subUnitId,
                rule: sourceRule,
            })).toBe(true);
            const hook = testBed.getClipboardHook()!;
            hook.onBeforeCopy(testBed.unitId, testBed.subUnitId, sourceRule.ranges[0]);
            const result = hook.onPasteCells(
                { unitId: testBed.unitId, subUnitId: testBed.subUnitId, range: { rows: [1], cols: [1] } },
                { unitId: testBed.unitId, subUnitId: testBed.subUnitId, range: { rows: [0], cols: [0] } },
                null,
                { copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
            );
            for (const mutation of result.redos) {
                expect(await testBed.commandService.executeCommand(mutation.id, mutation.params as Record<string, unknown>)).toBe(true);
            }
            const rules = testBed.ruleModel.getSubunitRules(testBed.unitId, testBed.subUnitId)!;
            expect(rules).toHaveLength(2);
            expect(rules[0]).toEqual(sourceRule);
            expect(rules[1].ranges).toEqual([{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }]);
            expect(rules[1].rule).toMatchObject({ value: '=#REF!>0' });
            for (const mutation of result.undos) {
                expect(await testBed.commandService.executeCommand(mutation.id, mutation.params as Record<string, unknown>)).toBe(true);
            }
            expect(testBed.ruleModel.getSubunitRules(testBed.unitId, testBed.subUnitId)).toEqual([sourceRule]);
            for (const mutation of result.redos) {
                expect(await testBed.commandService.executeCommand(mutation.id, mutation.params as Record<string, unknown>)).toBe(true);
            }
            expect(testBed.ruleModel.getSubunitRules(testBed.unitId, testBed.subUnitId)?.[0]).toEqual(sourceRule);
        } finally {
            testBed.univer.dispose();
        }
    });

    it('keeps identical overlapping source rules distinct when copying', async () => {
        const testBed = createCfUiTestBed();
        testBed.injector.add([ConditionalFormattingCopyPasteController]);
        testBed.injector.get(ConditionalFormattingCopyPasteController);
        const config: IConditionFormattingRule['rule'] = {
            type: CFRuleType.highlightCell,
            subType: CFSubRuleType.text,
            operator: CFTextOperator.notContainsText,
            value: 'A1',
            style: { bg: { rgb: '#0f0' } },
        };

        for (const cfId of ['cf-source-1', 'cf-source-2']) {
            await testBed.commandService.executeCommand(AddConditionalRuleMutation.id, {
                unitId: testBed.unitId,
                subUnitId: testBed.subUnitId,
                rule: {
                    cfId,
                    ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
                    stopIfTrue: false,
                    rule: config,
                },
            });
        }

        const hook = testBed.getClipboardHook()!;
        hook.onBeforeCopy(testBed.unitId, testBed.subUnitId, {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        });
        const result = hook.onPasteCells(
            { unitId: testBed.unitId, subUnitId: testBed.subUnitId, range: { rows: [0], cols: [0] } },
            { unitId: testBed.unitId, subUnitId: testBed.subUnitId, range: { rows: [1], cols: [1] } },
            null,
            { copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );

        const copiedRuleIds = result.redos.flatMap((mutation) => {
            if (mutation.id !== AddConditionalRuleMutation.id && mutation.id !== SetConditionalRuleMutation.id) {
                return [];
            }
            const rule = (mutation.params as { rule: IConditionFormattingRule }).rule;
            return rule.ranges.some((range) => range.startRow <= 1 && range.endRow >= 1 && range.startColumn <= 1 && range.endColumn >= 1)
                ? [rule.cfId]
                : [];
        });
        expect(new Set(copiedRuleIds)).toEqual(new Set(['cf-source-1', 'cf-source-2']));
        testBed.univer.dispose();
    });

    it('does not reuse a target rule with different stop-if-true semantics', async () => {
        const testBed = createCfUiTestBed();
        const workbook = testBed.get(IUniverInstanceService).getUnit<Workbook>(testBed.unitId, UniverInstanceType.UNIVER_SHEET)!;
        workbook.addWorksheet('sheet2', 1, { id: 'sheet2', name: 'sheet2' });
        testBed.injector.add([ConditionalFormattingCopyPasteController]);
        testBed.injector.get(ConditionalFormattingCopyPasteController);
        const config: IConditionFormattingRule['rule'] = {
            type: CFRuleType.highlightCell,
            subType: CFSubRuleType.text,
            operator: CFTextOperator.notContainsText,
            value: 'A1',
            style: { bg: { rgb: '#0f0' } },
        };
        await testBed.commandService.executeCommand(AddConditionalRuleMutation.id, {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            rule: {
                cfId: 'cf-source',
                ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
                stopIfTrue: true,
                rule: config,
            },
        });
        await testBed.commandService.executeCommand(AddConditionalRuleMutation.id, {
            unitId: testBed.unitId,
            subUnitId: 'sheet2',
            rule: {
                cfId: 'cf-target',
                ranges: [{ startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 }],
                stopIfTrue: false,
                rule: config,
            },
        });

        const hook = testBed.getClipboardHook()!;
        hook.onBeforeCopy(testBed.unitId, testBed.subUnitId, {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        });
        const result = hook.onPasteCells(
            { unitId: testBed.unitId, subUnitId: testBed.subUnitId, range: { rows: [0], cols: [0] } },
            { unitId: testBed.unitId, subUnitId: 'sheet2', range: { rows: [1], cols: [1] } },
            null,
            { copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );

        const addedRule = result.redos.find((mutation) => mutation.id === AddConditionalRuleMutation.id)?.params as { rule: IConditionFormattingRule } | undefined;
        expect(addedRule?.rule.stopIfTrue).toBe(true);
        testBed.univer.dispose();
    });

    it.each([
        { name: 'matching semantics', targetValue: 'source' },
        { name: 'different semantics', targetValue: 'target' },
    ])('isolates source and target rules with colliding IDs during cross-sheet cut: $name', async ({ targetValue }) => {
        const univer = new Univer();
        univer.registerPlugin(UniverSheetsPlugin);
        univer.registerPlugin(UniverSheetsFormulaPlugin);
        univer.registerPlugin(UniverSheetsConditionalFormattingPlugin);
        const injector = univer.__getInjector();
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([IMarkSelectionService, { useClass: MarkSelectionService }]);
        injector.add([IPlatformService, { useClass: PlatformService }]);
        injector.add([IUIPartsService, { useClass: UIPartsService }]);
        injector.add([INotificationService, { useClass: DesktopNotificationService }]);
        injector.add([IMessageService, { useClass: DesktopMessageService }]);
        injector.add([IClipboardInterfaceService, { useClass: BrowserClipboardService }]);
        injector.add([ISheetClipboardService, { useClass: SheetClipboardService }]);
        injector.add([SheetClipboardController]);
        injector.add([ConditionalFormattingFormulaRefRangeController]);
        injector.add([ConditionalFormattingCopyPasteController]);
        try {
            const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
                id: 'collision-rules',
                name: 'Collision rules',
                locale: LocaleType.EN_US,
                styles: {},
                sheetOrder: ['source', 'target'],
                sheets: {
                    source: { id: 'source', name: 'Source', cellData: { 0: { 0: { v: 1, t: CellValueType.NUMBER } } } },
                    target: { id: 'target', name: 'Target', cellData: { 1: { 1: { v: 2, t: CellValueType.NUMBER } }, 2: { 2: { v: 3, t: CellValueType.NUMBER } } } },
                },
            });
            const locale = injector.get(LocaleService);
            locale.load({ [LocaleType.EN_US]: sheetsEnUS });
            locale.setLocale(LocaleType.EN_US);
            locale.setDirection('ltr');
            injector.get(ConditionalFormattingFormulaRefRangeController);
            injector.get(SheetClipboardController);
            injector.get(ConditionalFormattingCopyPasteController);
            const commands = injector.get(ICommandService);
            const model = injector.get(ConditionalFormattingRuleModel);
            const instances = injector.get(IUniverInstanceService);
            instances.focusUnit('collision-rules');
            instances.setCurrentUnitForType('collision-rules');
            const createRule = (value: string, ranges: IConditionFormattingRule['ranges']): IConditionFormattingRule => ({
                cfId: 'cf-collision',
                ranges,
                stopIfTrue: false,
                rule: {
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.text,
                    operator: CFTextOperator.notContainsText,
                    value,
                    style: { bg: { rgb: value === 'source' ? '#0f0' : '#f00' } },
                },
            });
            const sourceRule = createRule('source', [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }]);
            const targetRule = createRule(targetValue, [
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 },
            ]);
            expect(await commands.executeCommand(AddCfCommand.id, {
                unitId: 'collision-rules',
                subUnitId: 'source',
                rule: sourceRule,
            })).toBe(true);
            expect(await commands.executeCommand(AddCfCommand.id, {
                unitId: 'collision-rules',
                subUnitId: 'target',
                rule: targetRule,
            })).toBe(true);
            const beforeSource = Tools.deepClone(model.getSubunitRules('collision-rules', 'source'));
            const beforeTarget = Tools.deepClone(model.getSubunitRules('collision-rules', 'target'));
            const sourceCells = Tools.deepClone(workbook.getSheetBySheetId('source')!.getSnapshot().cellData);
            const targetCells = Tools.deepClone(workbook.getSheetBySheetId('target')!.getSnapshot().cellData);
            expect(await commands.executeCommand(SetSelectionsOperation.id, {
                unitId: 'collision-rules',
                subUnitId: 'source',
                selections: [{ range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }, primary: null, style: null }],
            })).toBe(true);
            const clipboard = injector.get(ISheetClipboardService);
            vi.spyOn(injector.get(IClipboardInterfaceService), 'write').mockResolvedValue();
            expect(await clipboard.copy({ copyType: COPY_TYPE.CUT })).toBe(true);
            expect(await clipboard.pasteByCopyId(clipboard.copyContentCache().getLastCopyId()!, PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE, {
                unitId: 'collision-rules',
                subUnitId: 'target',
                range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
            })).toBe(true);
            expect(model.getRule('collision-rules', 'source', 'cf-collision')).toBeFalsy();
            expect(model.getRule('collision-rules', 'target', 'cf-collision')).toEqual({ ...beforeTarget![0], ranges: [
                { startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 },
            ] });
            const copiedRules = model.getSubunitRules('collision-rules', 'target')?.filter((rule) => (
                rule.cfId !== 'cf-collision' && rule.rule.type === CFRuleType.highlightCell && 'value' in rule.rule && rule.rule.value === 'source'
            ));
            expect(copiedRules).toHaveLength(1);
            expect(copiedRules?.[0]).toEqual({
                ...beforeSource![0],
                cfId: copiedRules![0].cfId,
                ranges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }],
            });

            const movedSource = Tools.deepClone(model.getSubunitRules('collision-rules', 'source') || []);
            const movedTarget = Tools.deepClone(model.getSubunitRules('collision-rules', 'target') || []);
            const movedSourceCells = Tools.deepClone(workbook.getSheetBySheetId('source')!.getSnapshot().cellData);
            const movedTargetCells = Tools.deepClone(workbook.getSheetBySheetId('target')!.getSnapshot().cellData);
            expect(workbook.getSheetBySheetId('source')!.getCellRaw(0, 0)?.v ?? null).toBeNull();
            expect(workbook.getSheetBySheetId('target')!.getCellRaw(1, 1)?.v).toBe(1);
            expect(workbook.getSheetBySheetId('target')!.getCellRaw(2, 2)?.v).toBe(3);
            expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
            expect(model.getSubunitRules('collision-rules', 'source')).toEqual(beforeSource);
            expect(model.getSubunitRules('collision-rules', 'target')).toEqual(beforeTarget);
            expect(workbook.getSheetBySheetId('source')!.getSnapshot().cellData).toEqual(sourceCells);
            expect(workbook.getSheetBySheetId('target')!.getSnapshot().cellData).toEqual(targetCells);
            expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
            expect(model.getSubunitRules('collision-rules', 'source') || []).toEqual(movedSource);
            expect(model.getSubunitRules('collision-rules', 'target')).toEqual(movedTarget);
            expect(workbook.getSheetBySheetId('source')!.getSnapshot().cellData).toEqual(movedSourceCells);
            expect(workbook.getSheetBySheetId('target')!.getSnapshot().cellData).toEqual(movedTargetCells);
            const snapshot = injector.get(IResourceLoaderService).saveUnit<IWorkbookData>('collision-rules')!;
            instances.disposeUnit('collision-rules');
            const reopened = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, JSON.parse(JSON.stringify(snapshot)));
            expect(model.getSubunitRules('collision-rules', 'source') || []).toEqual(movedSource);
            expect(model.getSubunitRules('collision-rules', 'target')).toEqual(movedTarget);
            expect(reopened.getSheetBySheetId('source')!.getSnapshot().cellData).toEqual(movedSourceCells);
            expect(reopened.getSheetBySheetId('target')!.getSnapshot().cellData).toEqual(movedTargetCells);
        } finally {
            univer.dispose();
        }
    });

    it('preserves source rule priority when copying across worksheets', async () => {
        const testBed = createCfUiTestBed();
        const workbook = testBed.get(IUniverInstanceService).getUnit<Workbook>(testBed.unitId, UniverInstanceType.UNIVER_SHEET)!;
        workbook.addWorksheet('sheet2', 1, { id: 'sheet2', name: 'sheet2' });
        testBed.injector.add([ConditionalFormattingCopyPasteController]);
        testBed.injector.get(ConditionalFormattingCopyPasteController);
        for (const value of ['low', 'high']) {
            await testBed.commandService.executeCommand(AddConditionalRuleMutation.id, {
                unitId: testBed.unitId,
                subUnitId: testBed.subUnitId,
                rule: {
                    cfId: `cf-${value}`,
                    ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
                    stopIfTrue: false,
                    rule: {
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.text,
                        operator: CFTextOperator.notContainsText,
                        value,
                        style: { bg: { rgb: value === 'high' ? '#0f0' : '#f00' } },
                    },
                },
            });
        }

        const hook = testBed.getClipboardHook()!;
        hook.onBeforeCopy(testBed.unitId, testBed.subUnitId, {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        });
        const result = hook.onPasteCells(
            { unitId: testBed.unitId, subUnitId: testBed.subUnitId, range: { rows: [0], cols: [0] } },
            { unitId: testBed.unitId, subUnitId: 'sheet2', range: { rows: [1], cols: [1] } },
            null,
            { copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        ) as { redos: Array<{ id: string; params: object }>; undos: Array<{ id: string; params: object }> };
        for (const mutation of result.redos) {
            await testBed.commandService.executeCommand(mutation.id, mutation.params);
        }

        const copiedValues = testBed.ruleModel.getSubunitRules(testBed.unitId, 'sheet2')?.map((rule) => (
            rule.rule.type === CFRuleType.highlightCell && 'value' in rule.rule ? rule.rule.value : undefined
        ));
        expect(copiedValues).toEqual(['high', 'low']);
        for (const mutation of result.undos) {
            await testBed.commandService.executeCommand(mutation.id, mutation.params);
        }
        expect(testBed.ruleModel.getSubunitRules(testBed.unitId, 'sheet2')).toEqual([]);
        testBed.univer.dispose();
    });
});
