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
    ICommandService,
    IResourceLoaderService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RedoCommand,
    Tools,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { RegisterOtherFormulaService } from '@univerjs/engine-formula';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import {
    AddWorksheetMergeMutation,
    AUTO_FILL_APPLY_TYPE,
    AutoFillCommand,
    AutoFillController,
    AutoFillService,
    IAutoFillService,
    RemoveWorksheetMergeMutation,
    SetRangeValuesCommand,
    SetSelectionsOperation,
    UniverSheetsPlugin,
} from '@univerjs/sheets';
import {
    AddCfCommand,
    CFRuleType,
    CFSubRuleType,
    CFTextOperator,
    ConditionalFormattingRuleModel,
    ConditionalFormattingService,
    ConditionalFormattingStyleComposer,
    UniverSheetsConditionalFormattingPlugin,
} from '@univerjs/sheets-conditional-formatting';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import sheetsEnUS from '@univerjs/sheets/locale/en-US';
import { describe, expect, it } from 'vitest';
import { createCfUiTestBed } from '../../__tests__/create-cf-ui-test-bed';
import { ConditionalFormattingAutoFillController } from '../cf.auto-fill.controller';

describe('ConditionalFormattingAutoFillController', () => {
    it.each([
        {
            direction: 'up',
            source: { startRow: 5, endRow: 5, startColumn: 1, endColumn: 1 },
            target: { startRow: 2, endRow: 5, startColumn: 1, endColumn: 1 },
            formula: '=A6>0',
            expectedFormula: '=A3>0',
            expectedRegisteredFormulas: 1,
            copiedBold: 1,
            copiedCell: [2, 1],
            sourceCell: [5, 1],
        },
        {
            direction: 'left',
            source: { startRow: 5, endRow: 5, startColumn: 5, endColumn: 5 },
            target: { startRow: 5, endRow: 5, startColumn: 2, endColumn: 5 },
            formula: '=F5>0',
            expectedFormula: '=C5>0',
            expectedRegisteredFormulas: 1,
            copiedBold: 1,
            copiedCell: [5, 2],
            sourceCell: [5, 5],
        },
        {
            direction: 'up with an absolute reference',
            source: { startRow: 5, endRow: 5, startColumn: 1, endColumn: 1 },
            target: { startRow: 2, endRow: 5, startColumn: 1, endColumn: 1 },
            formula: '=$A$6>0',
            expectedFormula: '=$A$6>0',
            expectedRegisteredFormulas: 1,
            copiedBold: 1,
            copiedCell: [2, 1],
            sourceCell: [5, 1],
        },
        {
            direction: 'up past the first row',
            source: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
            target: { startRow: 0, endRow: 1, startColumn: 1, endColumn: 1 },
            formula: '=A1>0',
            expectedFormula: null,
            expectedRegisteredFormulas: 2,
            copiedBold: 0,
            copiedCell: [0, 1],
            sourceCell: [1, 1],
        },
    ])('keeps formula rule results anchored after filling $direction', async ({ source, target, formula, expectedFormula, expectedRegisteredFormulas, copiedBold, copiedCell, sourceCell }) => {
        const univer = new Univer();
        univer.registerPlugin(UniverSheetsPlugin);
        univer.registerPlugin(UniverSheetsFormulaPlugin);
        univer.registerPlugin(UniverSheetsConditionalFormattingPlugin);
        const injector = univer.__getInjector();
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([ConditionalFormattingAutoFillController]);
        try {
            univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
                id: 'formula-fill',
                appVersion: '3.0.0-alpha',
                name: 'Formula fill',
                locale: LocaleType.EN_US,
                styles: {},
                sheetOrder: ['sheet1'],
                sheets: {
                    sheet1: {
                        id: 'sheet1',
                        name: 'Sheet1',
                        cellData: {
                            0: { 0: { v: 1 } },
                            1: { 1: { v: 10 } },
                            2: { 0: { v: 1 } },
                            4: { 2: { v: 1 }, 5: { v: 1 }, 8: { v: -1 } },
                            5: { 0: { v: 1 }, 1: { v: 10 }, 5: { v: 10 } },
                            8: { 0: { v: -1 } },
                        },
                    },
                },
            });
            const locale = injector.get(LocaleService);
            locale.load({ [LocaleType.EN_US]: sheetsEnUS });
            locale.setLocale(LocaleType.EN_US);
            locale.setDirection('ltr');
            injector.get(ConditionalFormattingAutoFillController);
            const commands = injector.get(ICommandService);
            const styles = injector.get(ConditionalFormattingService);
            const model = injector.get(ConditionalFormattingRuleModel);
            const registeredFormulas = injector.get(RegisterOtherFormulaService);
            const instances = injector.get(IUniverInstanceService);
            instances.focusUnit('formula-fill');
            instances.setCurrentUnitForType('formula-fill');
            expect(await commands.executeCommand(AddCfCommand.id, {
                unitId: 'formula-fill',
                subUnitId: 'sheet1',
                rule: {
                    cfId: 'relative-formula',
                    ranges: [source],
                    stopIfTrue: false,
                    rule: { type: CFRuleType.highlightCell, subType: CFSubRuleType.formula, value: formula, style: { bl: 1 } },
                },
            })).toBe(true);
            await expect.poll(() => styles.composeStyle('formula-fill', 'sheet1', sourceCell[0], sourceCell[1])?.style?.bl ?? 0).toBe(1);

            expect(await commands.executeCommand(AutoFillCommand.id, {
                unitId: 'formula-fill',
                subUnitId: 'sheet1',
                sourceRange: source,
                targetRange: target,
                applyType: AUTO_FILL_APPLY_TYPE.COPY,
            })).toBe(true);
            await expect.poll(() => styles.composeStyle('formula-fill', 'sheet1', copiedCell[0], copiedCell[1])?.style?.bl ?? 0).toBe(copiedBold);
            await expect.poll(() => styles.composeStyle('formula-fill', 'sheet1', sourceCell[0], sourceCell[1])?.style?.bl ?? 0).toBe(1);
            if (expectedFormula) {
                expect(model.getRule('formula-fill', 'sheet1', 'relative-formula')?.rule).toMatchObject({ value: expectedFormula });
            } else {
                expect(model.getRule('formula-fill', 'sheet1', 'relative-formula')?.rule).toMatchObject({ value: formula });
                expect(model.getSubunitRules('formula-fill', 'sheet1')).toHaveLength(2);
            }
            expect(Object.keys(registeredFormulas.getFormulaDirtyMap('formula-fill').sheet1 ?? {})).toHaveLength(expectedRegisteredFormulas);
            const filledRules = Tools.deepClone(model.getSubunitRules('formula-fill', 'sheet1'));
            expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
            expect(model.getRule('formula-fill', 'sheet1', 'relative-formula')?.rule).toMatchObject({ value: formula });
            expect(model.getSubunitRules('formula-fill', 'sheet1')).toHaveLength(1);
            await expect.poll(() => styles.composeStyle('formula-fill', 'sheet1', sourceCell[0], sourceCell[1])?.style?.bl ?? 0).toBe(1);
            expect(Object.keys(registeredFormulas.getFormulaDirtyMap('formula-fill').sheet1 ?? {})).toHaveLength(1);
            expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
            if (expectedFormula) {
                expect(model.getRule('formula-fill', 'sheet1', 'relative-formula')?.rule).toMatchObject({ value: expectedFormula });
            } else {
                expect(model.getRule('formula-fill', 'sheet1', 'relative-formula')?.rule).toMatchObject({ value: formula });
                expect(model.getSubunitRules('formula-fill', 'sheet1')).toHaveLength(2);
            }
            expect(model.getSubunitRules('formula-fill', 'sheet1')).toEqual(filledRules);
            await expect.poll(() => styles.composeStyle('formula-fill', 'sheet1', copiedCell[0], copiedCell[1])?.style?.bl ?? 0).toBe(copiedBold);
            await expect.poll(() => styles.composeStyle('formula-fill', 'sheet1', sourceCell[0], sourceCell[1])?.style?.bl ?? 0).toBe(1);
            expect(Object.keys(registeredFormulas.getFormulaDirtyMap('formula-fill').sheet1 ?? {})).toHaveLength(expectedRegisteredFormulas);
            const snapshot = injector.get(IResourceLoaderService).saveUnit<IWorkbookData>('formula-fill')!;
            instances.disposeUnit('formula-fill');
            univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, JSON.parse(JSON.stringify(snapshot)));
            expect(model.getSubunitRules('formula-fill', 'sheet1')).toEqual(filledRules);
            await expect.poll(() => styles.composeStyle('formula-fill', 'sheet1', copiedCell[0], copiedCell[1])?.style?.bl ?? 0).toBe(copiedBold);
            await expect.poll(() => styles.composeStyle('formula-fill', 'sheet1', sourceCell[0], sourceCell[1])?.style?.bl ?? 0).toBe(1);
        } finally {
            univer.dispose();
        }
    });

    it.each([
        { owner: 'non-current sheet', independentUnit: false, applyType: AUTO_FILL_APPLY_TYPE.COPY },
        { owner: 'non-current sheet', independentUnit: false, applyType: AUTO_FILL_APPLY_TYPE.ONLY_FORMAT },
        { owner: 'independent unit with matching sheet ID', independentUnit: true, applyType: AUTO_FILL_APPLY_TYPE.COPY },
        { owner: 'independent unit with matching sheet ID', independentUnit: true, applyType: AUTO_FILL_APPLY_TYPE.ONLY_FORMAT },
    ])('fills only the explicit $owner with $applyType', async ({ independentUnit, applyType }) => {
        const workbookData: IWorkbookData = {
            id: 'test',
            appVersion: '3.0.0-alpha',
            name: 'CF owners',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['sheet1', 'sheet2'],
            sheets: {
                sheet1: { id: 'sheet1', name: 'Orders', cellData: { 3: { 1: { v: 100 } } } },
                sheet2: { id: 'sheet2', name: 'Scratch', cellData: {} },
            },
        };
        const testBed = createCfUiTestBed(workbookData, true);
        try {
            const { injector, commandService, ruleModel } = testBed;
            injector.add([IAutoFillService, { useClass: AutoFillService }]);
            injector.add([AutoFillController]);
            injector.add([ConditionalFormattingAutoFillController]);
            injector.add([ConditionalFormattingStyleComposer]);
            injector.add([ConditionalFormattingService]);
            injector.get(ConditionalFormattingService);
            injector.get(AutoFillController);
            injector.get(ConditionalFormattingAutoFillController);
            for (const command of [AddCfCommand, AutoFillCommand, SetSelectionsOperation, AddWorksheetMergeMutation, RemoveWorksheetMergeMutation]) {
                commandService.registerCommand(command);
            }
            const unitId = independentUnit ? 'independent' : 'test';
            const subUnitId = independentUnit ? 'sheet1' : 'sheet2';
            if (independentUnit) {
                testBed.univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
                    ...workbookData,
                    id: unitId,
                    sheetOrder: ['sheet1'],
                    sheets: { sheet1: { id: 'sheet1', name: 'Scratch', cellData: {} } },
                });
            }
            const instances = injector.get(IUniverInstanceService);
            instances.setCurrentUnitForType('test');
            instances.focusUnit('test');
            expect(instances.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet()?.getSheetId()).toBe('sheet1');
            const sourceRange = { startRow: 3, endRow: 5, startColumn: 0, endColumn: 1 };
            const selection = { startRow: 3, endRow: 8, startColumn: 0, endColumn: 1 };
            expect(await commandService.executeCommand(SetRangeValuesCommand.id, {
                unitId,
                subUnitId,
                range: sourceRange,
                value: [[{ v: 10 }, { v: 11 }], [{ v: 20 }, { v: 21 }], [{ v: 30 }, { v: 31 }]],
            })).toBe(true);
            expect(await commandService.executeCommand(SetRangeValuesCommand.id, {
                unitId,
                subUnitId,
                range: { startRow: 6, endRow: 8, startColumn: 0, endColumn: 1 },
                value: [[{ v: 70 }, { v: 71 }], [{ v: 80 }, { v: 81 }], [{ v: 90 }, { v: 91 }]],
            })).toBe(true);
            const ruleConfig: IConditionFormattingRule['rule'] = {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.text,
                operator: CFTextOperator.notContainsText,
                value: 'negative',
                style: { bl: 1 },
            };
            for (const rule of [
                { unitId: 'test', subUnitId: 'sheet1', cfId: 'active-sentinel', ranges: [{ startRow: 3, endRow: 3, startColumn: 1, endColumn: 1 }] },
                { unitId, subUnitId, cfId: 'owner-source', ranges: [{ startRow: 3, endRow: 3, startColumn: 1, endColumn: 1 }] },
                { unitId, subUnitId, cfId: 'owner-outside', ranges: [{ startRow: 12, endRow: 12, startColumn: 4, endColumn: 4 }] },
            ]) {
                const { unitId: ruleUnit, subUnitId: ruleSheet, ...data } = rule;
                expect(await commandService.executeCommand(AddCfCommand.id, {
                    unitId: ruleUnit,
                    subUnitId: ruleSheet,
                    rule: { ...data, rule: ruleConfig, stopIfTrue: false },
                })).toBe(true);
            }
            const activeRules = Tools.deepClone(ruleModel.getSubunitRules('test', 'sheet1'));
            const originalRules = Tools.deepClone(ruleModel.getSubunitRules(unitId, subUnitId));
            const assertFilled = () => {
                expect(ruleModel.getRule(unitId, subUnitId, 'owner-source')?.ranges).toEqual([
                    { startRow: 3, endRow: 3, startColumn: 1, endColumn: 1 },
                    { startRow: 6, endRow: 6, startColumn: 1, endColumn: 1 },
                ]);
                expect(ruleModel.getRule(unitId, subUnitId, 'owner-outside')).toEqual(originalRules?.find((rule) => rule.cfId === 'owner-outside'));
                expect(ruleModel.getSubunitRules('test', 'sheet1')).toEqual(activeRules);
                const sheet = instances.getUnit<Workbook>(unitId)!.getSheetBySheetId(subUnitId)!;
                expect([6, 7, 8].map((row) => [sheet.getCell(row, 0)?.v, sheet.getCell(row, 1)?.v])).toEqual(
                    applyType === AUTO_FILL_APPLY_TYPE.COPY ? [[10, 11], [20, 21], [30, 31]] : [[70, 71], [80, 81], [90, 91]]
                );
            };
            const fill = () => commandService.executeCommand(AutoFillCommand.id, {
                unitId,
                subUnitId,
                sourceRange,
                targetRange: selection,
                applyType,
            });
            expect(await fill()).toBe(true);
            assertFilled();
            instances.focusUnit(unitId);
            expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
            expect(ruleModel.getSubunitRules(unitId, subUnitId)).toEqual(originalRules);
            expect(ruleModel.getSubunitRules('test', 'sheet1')).toEqual(activeRules);
            expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
            assertFilled();
            const snapshot = injector.get(IResourceLoaderService).saveUnit<IWorkbookData>(unitId)!;
            instances.disposeUnit(unitId);
            testBed.univer.createUnit(UniverInstanceType.UNIVER_SHEET, JSON.parse(JSON.stringify(snapshot)));
            assertFilled();
            instances.setCurrentUnitForType('test');
            instances.focusUnit('test');
            expect(await fill()).toBe(true);
            assertFilled();
        } finally {
            testBed.univer.dispose();
        }
    });

    it.each([
        {
            direction: 'DOWN',
            firstTargetRow: 6,
            lastTargetRow: 8,
            lastTargetColumn: 1,
            sourceRange: { startRow: 3, endRow: 5, startColumn: 0, endColumn: 1 },
            selection: { startRow: 3, endRow: 8, startColumn: 0, endColumn: 1 },
            filledValues: [[10, 11], [20, 21], [30, 31]],
            bottomRanges: [
                { startRow: 5, endRow: 5, startColumn: 1, endColumn: 1 },
                { startRow: 8, endRow: 8, startColumn: 1, endColumn: 1 },
            ],
            startRanges: [
                { startRow: 3, endRow: 3, startColumn: 0, endColumn: 0 },
                { startRow: 6, endRow: 6, startColumn: 0, endColumn: 0 },
            ],
            middleRanges: [
                { startRow: 4, endRow: 4, startColumn: 0, endColumn: 0 },
                { startRow: 7, endRow: 7, startColumn: 0, endColumn: 0 },
            ],
        },
        {
            direction: 'UP remainder',
            firstTargetRow: 2,
            lastTargetRow: 2,
            lastTargetColumn: 1,
            sourceRange: { startRow: 3, endRow: 5, startColumn: 0, endColumn: 1 },
            selection: { startRow: 2, endRow: 5, startColumn: 0, endColumn: 1 },
            filledValues: [[30, 31]],
            bottomRanges: [
                { startRow: 2, endRow: 2, startColumn: 1, endColumn: 1 },
                { startRow: 5, endRow: 5, startColumn: 1, endColumn: 1 },
            ],
            startRanges: [{ startRow: 3, endRow: 3, startColumn: 0, endColumn: 0 }],
            middleRanges: [{ startRow: 4, endRow: 4, startColumn: 0, endColumn: 0 }],
        },
        {
            direction: 'LEFT remainder',
            firstTargetRow: 3,
            lastTargetRow: 5,
            lastTargetColumn: 0,
            sourceRange: { startRow: 3, endRow: 5, startColumn: 1, endColumn: 2 },
            selection: { startRow: 3, endRow: 5, startColumn: 0, endColumn: 2 },
            filledValues: [[11], [21], [31]],
            bottomRanges: [
                { startRow: 5, endRow: 5, startColumn: 0, endColumn: 0 },
                { startRow: 5, endRow: 5, startColumn: 2, endColumn: 2 },
            ],
            startRanges: [{ startRow: 3, endRow: 3, startColumn: 1, endColumn: 1 }],
            middleRanges: [{ startRow: 4, endRow: 4, startColumn: 1, endColumn: 1 }],
        },
    ])('fills offset rules and preserves the source through $direction copy, Undo/Redo and reopen', async ({ firstTargetRow, lastTargetRow, lastTargetColumn, sourceRange, selection, filledValues, bottomRanges, startRanges, middleRanges }) => {
        const testBed = createCfUiTestBed({
            id: 'test',
            appVersion: '3.0.0-alpha',
            name: 'CF fill',
            locale: LocaleType.EN_US,
            sheetOrder: ['sheet1'],
            sheets: {
                sheet1: {
                    id: 'sheet1',
                    name: 'Scratch',
                    cellData: {
                        2: { 0: { v: 70 }, 1: { v: 71 } },
                        3: { 0: { v: 10 }, 1: { v: 11 } },
                        4: { 0: { v: 20 }, 1: { v: 21 } },
                        5: { 0: { v: 30 }, 1: { v: 31 } },
                        6: { 0: { v: 70 }, 1: { v: 71 } },
                        7: { 0: { v: 80 }, 1: { v: 81 } },
                        8: { 0: { v: 90 }, 1: { v: 91 } },
                    },
                },
            },
            styles: {},
        }, true);
        try {
            const { injector, commandService, ruleModel } = testBed;
            injector.add([IAutoFillService, { useClass: AutoFillService }]);
            injector.add([AutoFillController]);
            injector.add([ConditionalFormattingAutoFillController]);
            injector.add([ConditionalFormattingStyleComposer]);
            injector.add([ConditionalFormattingService]);
            injector.get(ConditionalFormattingService);
            injector.get(AutoFillController);
            injector.get(ConditionalFormattingAutoFillController);
            for (const command of [AddCfCommand, AutoFillCommand, SetSelectionsOperation, AddWorksheetMergeMutation, RemoveWorksheetMergeMutation]) {
                commandService.registerCommand(command);
            }
            expect(await commandService.executeCommand(SetRangeValuesCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: sourceRange,
                value: [[{ v: 10 }, { v: 11 }], [{ v: 20 }, { v: 21 }], [{ v: 30 }, { v: 31 }]],
            })).toBe(true);
            const ruleConfig: IConditionFormattingRule['rule'] = {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.text,
                operator: CFTextOperator.notContainsText,
                value: 'negative',
                style: { bl: 1 },
            };
            for (const rule of [
                { cfId: 'source-bottom', ranges: [{ startRow: 5, endRow: 5, startColumn: sourceRange.endColumn, endColumn: sourceRange.endColumn }] },
                { cfId: 'source-start', ranges: [{ startRow: 3, endRow: 3, startColumn: sourceRange.startColumn, endColumn: sourceRange.startColumn }] },
                { cfId: 'source-middle', ranges: [{ startRow: 4, endRow: 4, startColumn: sourceRange.startColumn, endColumn: sourceRange.startColumn }] },
                { cfId: 'old-target', ranges: [{ startRow: firstTargetRow, endRow: firstTargetRow, startColumn: 0, endColumn: 0 }] },
            ]) {
                expect(await commandService.executeCommand(AddCfCommand.id, {
                    unitId: 'test',
                    subUnitId: 'sheet1',
                    rule: { ...rule, rule: ruleConfig, stopIfTrue: false },
                })).toBe(true);
            }
            const originalRules = Tools.deepClone(ruleModel.getSubunitRules('test', 'sheet1') || []);
            const instances = injector.get(IUniverInstanceService);
            const values = () => {
                const sheet = instances.getUnit<Workbook>('test')!.getSheetBySheetId('sheet1')!;
                return Array.from({ length: lastTargetRow - firstTargetRow + 1 }, (_, index) =>
                    Array.from({ length: lastTargetColumn + 1 }, (_, column) => sheet.getCell(firstTargetRow + index, column)?.v));
            };
            const originalValues = values();
            const fill = () => commandService.executeCommand(AutoFillCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                sourceRange,
                targetRange: selection,
                applyType: AUTO_FILL_APPLY_TYPE.COPY,
            });
            const assertRules = () => {
                expect(ruleModel.getRule('test', 'sheet1', 'source-bottom')?.ranges).toEqual(bottomRanges);
                expect(ruleModel.getRule('test', 'sheet1', 'source-start')?.ranges).toEqual(startRanges);
                expect(ruleModel.getRule('test', 'sheet1', 'source-middle')?.ranges).toEqual(middleRanges);
                expect(ruleModel.getRule('test', 'sheet1', 'old-target')).toBeFalsy();
            };
            expect(await fill()).toBe(true);
            expect(values()).toEqual(filledValues);
            assertRules();
            expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
            expect(values()).toEqual(originalValues);
            expect(ruleModel.getSubunitRules('test', 'sheet1')).toEqual(originalRules);
            expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
            expect(values()).toEqual(filledValues);
            assertRules();
            const finalRules = Tools.deepClone(ruleModel.getSubunitRules('test', 'sheet1') || []);
            const snapshot = injector.get(IResourceLoaderService).saveUnit<IWorkbookData>('test')!;
            instances.disposeUnit('test');
            testBed.univer.createUnit(UniverInstanceType.UNIVER_SHEET, JSON.parse(JSON.stringify(snapshot)));
            expect(ruleModel.getSubunitRules('test', 'sheet1')).toEqual(finalRules);
            expect(await fill()).toBe(true);
            assertRules();
        } finally {
            testBed.univer.dispose();
        }
    });
});
