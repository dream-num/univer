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

import type { IRange, IWorkbookData, Workbook } from '@univerjs/core';
import type { IConditionFormattingRule } from '@univerjs/sheets-conditional-formatting';
import {
    CellValueType,
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
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import {
    ClearSelectionAllCommand,
    ClearSelectionFormatCommand,
    SetRangeValuesCommand,
    SetSelectionsOperation,
    SetWorksheetActiveOperation,
    UniverSheetsPlugin,
} from '@univerjs/sheets';
import {
    AddCfCommand,
    CFRuleType,
    CFSubRuleType,
    CFTextOperator,
    ConditionalFormattingRuleModel,
    UniverSheetsConditionalFormattingPlugin,
} from '@univerjs/sheets-conditional-formatting';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import sheetsEnUS from '@univerjs/sheets/locale/en-US';
import { describe, expect, it } from 'vitest';
import { ConditionalFormattingClearController } from '../cf.clear.controller';

function workbookData(id: string): IWorkbookData {
    return {
        id,
        name: 'CF clear owners',
        appVersion: '3.0.0',
        locale: LocaleType.EN_US,
        styles: { bold: { bl: 1 } },
        sheetOrder: ['orders', 'summary'],
        sheets: {
            orders: { id: 'orders', name: 'Orders', rowCount: 30, columnCount: 20, cellData: { 1: { 1: { v: 77 } }, 6: { 6: { v: 5, t: CellValueType.NUMBER, s: 'bold' } } } },
            summary: { id: 'summary', name: 'Summary', rowCount: 30, columnCount: 20, cellData: { 1: { 1: { v: 88 } } } },
        },
    };
}

function createClearBed() {
    const univer = new Univer();
    univer.registerPlugin(UniverSheetsPlugin);
    univer.registerPlugin(UniverSheetsFormulaPlugin);
    univer.registerPlugin(UniverSheetsConditionalFormattingPlugin);
    const injector = univer.__getInjector();
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([ConditionalFormattingClearController]);
    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookData('test'));
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: sheetsEnUS });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    injector.get(ConditionalFormattingClearController);
    const instances = injector.get(IUniverInstanceService);
    instances.setCurrentUnitForType('test');
    instances.focusUnit('test');
    return {
        univer,
        injector,
        workbook,
        instances,
        commands: injector.get(ICommandService),
        model: injector.get(ConditionalFormattingRuleModel),
    };
}

function rule(cfId: string, ranges: IRange[]): IConditionFormattingRule {
    return {
        cfId,
        ranges,
        stopIfTrue: false,
        rule: { type: CFRuleType.highlightCell, subType: CFSubRuleType.text, operator: CFTextOperator.notContainsText, value: 'A', style: { bl: 1 } },
    };
}

describe('ConditionalFormattingClearController', () => {
    it.each([ClearSelectionFormatCommand, ClearSelectionAllCommand])('keeps remaining formula references when $id removes the rule anchor', async (command) => {
        const bed = createClearBed();
        try {
            const original: IConditionFormattingRule = {
                cfId: 'formula-to-clear',
                ranges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 2 }],
                stopIfTrue: false,
                rule: { type: CFRuleType.highlightCell, subType: CFSubRuleType.formula, value: '=A2>0', style: { bl: 1 } },
            };
            expect(await bed.commands.executeCommand(AddCfCommand.id, { unitId: 'test', subUnitId: 'orders', rule: original })).toBe(true);
            expect(await bed.commands.executeCommand(command.id, {
                unitId: 'test',
                subUnitId: 'orders',
                ranges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }],
            })).toBe(true);
            expect(bed.model.getRule('test', 'orders', original.cfId)).toMatchObject({
                ranges: [{ startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 }],
                rule: { value: '=B2>0' },
            });
            expect(await bed.commands.executeCommand(UndoCommand.id)).toBe(true);
            expect(bed.model.getRule('test', 'orders', original.cfId)).toEqual(original);
            expect(await bed.commands.executeCommand(RedoCommand.id)).toBe(true);
            expect(bed.model.getRule('test', 'orders', original.cfId)?.rule).toMatchObject({ value: '=B2>0' });
        } finally {
            bed.univer.dispose();
        }
    });

    it.each([
        { command: ClearSelectionFormatCommand, independent: false },
        { command: ClearSelectionAllCommand, independent: false },
        { command: ClearSelectionFormatCommand, independent: true },
        { command: ClearSelectionAllCommand, independent: true },
    ])('clears only explicit owner/ranges for $command.id, independent workbook=$independent', async ({ command, independent }) => {
        const bed = createClearBed();
        try {
            const { commands, instances, model, injector } = bed;
            const unitId = independent ? 'other' : 'test';
            if (independent) {
                bed.univer.createUnit(UniverInstanceType.UNIVER_SHEET, workbookData(unitId));
            }
            const activeSheetId = independent ? 'orders' : 'summary';
            instances.setCurrentUnitForType('test');
            instances.focusUnit('test');
            expect(await commands.executeCommand(SetWorksheetActiveOperation.id, { unitId: 'test', subUnitId: activeSheetId })).toBe(true);
            const b2 = { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 };
            expect(await commands.executeCommand(SetSelectionsOperation.id, { unitId: 'test', subUnitId: activeSheetId, selections: [{ range: b2, primary: null, style: null }] })).toBe(true);
            const originalRules = [
                rule('owner-outside', [b2]),
                rule('owner-partial', [{ startRow: 6, endRow: 6, startColumn: 3, endColumn: 10 }]),
                rule('owner-full', [{ startRow: 6, endRow: 6, startColumn: 6, endColumn: 6 }]),
            ];
            for (const data of originalRules) {
                expect(await commands.executeCommand(AddCfCommand.id, { unitId, subUnitId: 'orders', rule: data })).toBe(true);
            }
            expect(await commands.executeCommand(AddCfCommand.id, { unitId: 'test', subUnitId: activeSheetId, rule: rule('owner-full', [b2]) })).toBe(true);
            const before = Tools.deepClone(model.getSubunitRules(unitId, 'orders'));
            const activeBefore = Tools.deepClone(model.getSubunitRules('test', activeSheetId));
            const cellsBefore = Tools.deepClone(instances.getUnit<Workbook>(unitId)!.getSheetBySheetId('orders')!.getConfig().cellData);
            const params = { unitId, subUnitId: 'orders', ranges: [{ startRow: 6, endRow: 6, startColumn: 4, endColumn: 9 }] };
            const paramsBefore = Tools.deepClone(params);
            const assertCleared = () => {
                expect(model.getRule(unitId, 'orders', 'owner-full')).toBeUndefined();
                expect(model.getRule(unitId, 'orders', 'owner-partial')).toEqual(rule('owner-partial', [
                    { startRow: 6, endRow: 6, startColumn: 3, endColumn: 3 },
                    { startRow: 6, endRow: 6, startColumn: 10, endColumn: 10 },
                ]));
                expect(model.getRule(unitId, 'orders', 'owner-outside')).toEqual(originalRules[0]);
                expect(model.getSubunitRules('test', activeSheetId)).toEqual(activeBefore);
                const target = instances.getUnit<Workbook>(unitId)!.getSheetBySheetId('orders')!;
                expect(target.getCell(1, 1)?.v).toBe(77);
                expect(target.getCell(6, 6)?.v ?? null).toBe(command.id === ClearSelectionAllCommand.id ? null : 5);
                expect(instances.getUnit<Workbook>('test')?.getSheetBySheetId(activeSheetId)?.getCell(1, 1)?.v).toBe(independent ? 77 : 88);
            };
            expect(await commands.executeCommand(command.id, params)).toBe(true);
            expect(params).toEqual(paramsBefore);
            assertCleared();
            const cleared = Tools.deepClone(model.getSubunitRules(unitId, 'orders'));
            instances.focusUnit(unitId);
            expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
            expect(model.getSubunitRules(unitId, 'orders')).toEqual(before);
            expect(model.getSubunitRules('test', activeSheetId)).toEqual(activeBefore);
            expect(instances.getUnit<Workbook>(unitId)!.getSheetBySheetId('orders')!.getConfig().cellData).toEqual(cellsBefore);
            expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
            assertCleared();
            const snapshot = injector.get(IResourceLoaderService).saveUnit<IWorkbookData>(unitId);
            if (!snapshot) {
                throw new Error('Cleared workbook snapshot missing');
            }
            expect(instances.disposeUnit(unitId)).toBe(true);
            bed.univer.createUnit(UniverInstanceType.UNIVER_SHEET, JSON.parse(JSON.stringify(snapshot)));
            expect(model.getSubunitRules(unitId, 'orders')).toEqual(cleared);
            expect(await commands.executeCommand(SetRangeValuesCommand.id, { unitId, subUnitId: 'orders', range: { startRow: 6, endRow: 6, startColumn: 6, endColumn: 6 }, value: { v: 9 } })).toBe(true);
            expect(instances.getUnit<Workbook>(unitId)!.getSheetBySheetId('orders')?.getCell(6, 6)?.v).toBe(9);
            expect(model.getSubunitRules(unitId, 'orders')).toEqual(cleared);
        } finally {
            bed.univer.dispose();
        }
    });

    it.each([ClearSelectionFormatCommand, ClearSelectionAllCommand])('retains current-selection fallback for $id', async (command) => {
        const bed = createClearBed();
        try {
            const b2 = { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 };
            expect(await bed.commands.executeCommand(AddCfCommand.id, { unitId: 'test', subUnitId: 'orders', rule: rule('partial', [{ ...b2, endColumn: 2 }]) })).toBe(true);
            expect(await bed.commands.executeCommand(AddCfCommand.id, { unitId: 'test', subUnitId: 'orders', rule: rule('full', [b2]) })).toBe(true);
            expect(await bed.commands.executeCommand(SetSelectionsOperation.id, { unitId: 'test', subUnitId: 'orders', selections: [{ range: b2, primary: null, style: null }] })).toBe(true);
            expect(await bed.commands.executeCommand(command.id)).toBe(true);
            expect(bed.model.getRule('test', 'orders', 'full')).toBeUndefined();
            expect(bed.model.getRule('test', 'orders', 'partial')).toEqual(rule('partial', [{ startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 }]));
        } finally {
            bed.univer.dispose();
        }
    });
});
