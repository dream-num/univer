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
import {
    CanceledError,
    DataValidationOperator,
    DataValidationType,
    ICommandService,
    IResourceLoaderService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RedoCommand,
    Tools,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { UpdateDataValidationMutation } from '@univerjs/data-validation';
import { SetWorksheetNameCommand, UniverSheetsPlugin } from '@univerjs/sheets';
import sheetsEnUS from '@univerjs/sheets/locale/en-US';
import { describe, expect, it } from 'vitest';
import { AddSheetDataValidationCommand, UpdateSheetDataValidationSettingCommand } from '../../commands/commands/data-validation.command';
import { UpdateDataValidationFormulaBySheetRenameMutation } from '../../commands/mutations/update-data-validation-formula-by-sheet-rename.mutation';
import enUS from '../../locale/en-US';
import { SheetDataValidationModel } from '../../models/sheet-data-validation-model';
import { UniverSheetsDataValidationPlugin } from '../../plugin';
import { DataValidationRefRangeController } from '../dv-ref-range.controller';
import '@univerjs/sheets/facade';
import '../../facade/f-range';
import '../../facade/f-univer';
import '../../facade/f-worksheet';

function workbookData(id: string): IWorkbookData {
    return {
        id,
        name: id,
        appVersion: '0.1.0',
        locale: LocaleType.EN_US,
        styles: {},
        sheetOrder: ['rules', 'source'],
        sheets: {
            rules: { id: 'rules', name: 'Rules', rowCount: 20, columnCount: 10, cellData: {} },
            source: {
                id: 'source',
                name: 'Scratch',
                rowCount: 20,
                columnCount: 10,
                cellData: { 0: { 0: { v: 'Done' } }, 1: { 0: { v: 'Pending' } } },
            },
        },
    };
}

describe('DataValidationRefRangeController source rename', () => {
    it.each([false, true])('retains rule references, history and resources when the source is inactive in another workbook=%s', async (foreignFocus) => {
        const univer = new Univer();
        univer.registerPlugin(UniverSheetsPlugin, { notExecuteFormula: true });
        univer.registerPlugin(UniverSheetsDataValidationPlugin);
        const injector = univer.__getInjector();
        const locale = injector.get(LocaleService);
        locale.load({ [LocaleType.EN_US]: { ...sheetsEnUS, ...enUS } });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        try {
            for (const unitId of ['owner', 'independent']) {
                univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookData(unitId));
            }
            expect(injector.get(DataValidationRefRangeController)).toBeInstanceOf(DataValidationRefRangeController);
            const commands = injector.get(ICommandService);
            const loader = injector.get(IResourceLoaderService);
            const model = injector.get(SheetDataValidationModel);
            const history = injector.get(IUndoRedoService);
            const instances = injector.get(IUniverInstanceService);
            const api = FUniver.newAPI(injector);
            const owner = api.getWorkbook('owner')!;
            const independent = api.getWorkbook('independent')!;
            for (const workbook of [owner, independent]) {
                workbook.getSheetBySheetId('rules')!.getRange('H2:H3').setDataValidation(
                    api.newDataValidation().requireValueInRange(workbook.getSheetBySheetId('source')!.getRange('A1:A2')).build()
                );
            }
            expect(await commands.executeCommand(AddSheetDataValidationCommand.id, {
                unitId: 'independent',
                subUnitId: 'rules',
                rule: {
                    uid: 'external',
                    type: DataValidationType.DECIMAL,
                    operator: DataValidationOperator.BETWEEN,
                    formula1: '=[owner]Scratch!$A$1',
                    formula2: '=[owner]Scratch!$A$2',
                    ranges: [{ startRow: 5, endRow: 5, startColumn: 7, endColumn: 7 }],
                },
            })).toBe(true);
            for (const [index, formula1] of [
                '=Scratch!$A$1',
                '=$A$1',
                '=IF(Scratch!$A$1="say ""Done""","Scratch!A1",Scratch!$A$2)',
                "='[owner]Scratch'!$A$1",
            ].entries()) {
                expect(await commands.executeCommand(AddSheetDataValidationCommand.id, {
                    unitId: 'owner',
                    subUnitId: 'rules',
                    rule: {
                        uid: `expression-${index}`,
                        type: DataValidationType.CUSTOM,
                        formula1,
                        formula2: undefined,
                        allowBlank: true,
                        operator: undefined,
                        ranges: [{ startRow: 7 + index, endRow: 7 + index, startColumn: 7, endColumn: 7 }],
                    },
                })).toBe(true);
            }
            const originalRules = Tools.deepClone(model.getRules('owner', 'rules'));
            const independentRules = Tools.deepClone(model.getRules('independent', 'rules'));
            const original = loader.saveUnit<IWorkbookData>('owner')!;
            const originalIndependent = loader.saveUnit<IWorkbookData>('independent')!;
            expect(await commands.executeCommand(SetWorksheetNameCommand.id, {
                unitId: 'owner',
                subUnitId: 'source',
                name: 'Scratch',
            })).toBe(true);
            expect(loader.saveUnit<IWorkbookData>('owner')).toEqual(original);
            expect(loader.saveUnit<IWorkbookData>('independent')).toEqual(originalIndependent);
            const beforeHistory = history.getUndoRedoStatus('owner');
            const independentHistory = history.getUndoRedoStatus('independent');
            instances.focusUnit(foreignFocus ? 'independent' : 'owner');
            const updatedRules: string[] = [];
            const observation = commands.onCommandExecuted((command) => {
                if (command.id === UpdateDataValidationFormulaBySheetRenameMutation.id) {
                    updatedRules.push((command.params as { ruleId: string }).ruleId);
                }
            });
            expect(await commands.executeCommand(SetWorksheetNameCommand.id, {
                unitId: 'owner',
                subUnitId: 'source',
                name: "Choice's Source",
            })).toBe(true);
            observation.dispose();
            expect(updatedRules).toHaveLength(5);
            expect(new Set(updatedRules).size).toBe(5);
            expect(model.getRules('owner', 'rules')).toEqual([
                { ...originalRules[0], operator: undefined, allowBlank: undefined, formula1: "='[owner]Choice''s Source'!A1:A2" },
                { ...originalRules[1], formula1: "='Choice''s Source'!$A$1" },
                originalRules[2],
                { ...originalRules[3], formula1: '=IF(\'Choice\'\'s Source\'!$A$1="say ""Done""","Scratch!A1",\'Choice\'\'s Source\'!$A$2)' },
                { ...originalRules[4], formula1: "='[owner]Choice''s Source'!$A$1" },
            ]);
            expect(model.getRules('independent', 'rules')).toEqual([
                independentRules[0],
                { ...independentRules[1], allowBlank: undefined, formula1: "='[owner]Choice''s Source'!$A$1", formula2: "='[owner]Choice''s Source'!$A$2" },
            ]);
            expect(history.getUndoRedoStatus('owner')).toEqual({ undos: beforeHistory.undos + 1, redos: 0 });
            expect(history.getUndoRedoStatus('independent')).toEqual(independentHistory);
            const renamed = loader.saveUnit<IWorkbookData>('owner')!;
            const renamedIndependent = loader.saveUnit<IWorkbookData>('independent')!;
            const refused = commands.beforeCommandExecuted((command) => {
                if (command.id === SetWorksheetNameCommand.id) {
                    throw new CanceledError();
                }
            });
            expect(await commands.executeCommand(SetWorksheetNameCommand.id, {
                unitId: 'owner',
                subUnitId: 'source',
                name: 'Rules',
            })).toBe(false);
            refused.dispose();
            expect(loader.saveUnit<IWorkbookData>('owner')).toEqual(renamed);
            expect(loader.saveUnit<IWorkbookData>('independent')).toEqual(renamedIndependent);
            expect(history.getUndoRedoStatus('owner')).toEqual({ undos: beforeHistory.undos + 1, redos: 0 });
            instances.focusUnit('owner');
            expect(commands.syncExecuteCommand(UndoCommand.id)).toBe(true);
            expect(loader.saveUnit<IWorkbookData>('owner')).toEqual(original);
            expect(loader.saveUnit<IWorkbookData>('independent')).toEqual(originalIndependent);
            expect(commands.syncExecuteCommand(RedoCommand.id)).toBe(true);
            expect(loader.saveUnit<IWorkbookData>('owner')).toEqual(renamed);
            expect(loader.saveUnit<IWorkbookData>('independent')).toEqual(renamedIndependent);
            expect(instances.disposeUnit('owner')).toBe(true);
            univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, renamed);
            const restored = api.getWorkbook('owner')!;
            restored.getSheetBySheetId('source')!.setName('Choice Source');
            expect(model.getRules('owner', 'rules')[0]).toEqual({ ...originalRules[0], operator: undefined, allowBlank: undefined, formula1: "='[owner]Choice Source'!A1:A2" });
            restored.getSheetBySheetId('source')!.insertRowsBefore(1, 1);
            expect(model.getRules('owner', 'rules')[0]).toEqual({ ...originalRules[0], operator: undefined, allowBlank: undefined, formula1: "='[owner]Choice Source'!A1:A3" });
            restored.getSheetBySheetId('source')!.getRange('A1').setValue('Closed');
            expect(restored.getSheetBySheetId('source')!.getRange('A1').getRawValue()).toBe('Closed');
            const independentBeforeReplace = loader.saveUnit<IWorkbookData>('independent');
            expect(instances.disposeUnit('owner')).toBe(true);
            expect(loader.saveUnit<IWorkbookData>('independent')).toEqual(independentBeforeReplace);
            const replacement = workbookData('owner');
            replacement.sheets.source.name = 'Choice Source';
            univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, replacement);
            const newOwner = api.getWorkbook('owner')!;
            const newSource = newOwner.getSheetBySheetId('source')!;
            newOwner.getSheetBySheetId('rules')!.getRange('H2:H3').setDataValidation(
                api.newDataValidation().requireValueInRange(newSource.getRange('A1:A2')).build()
            );
            const newRule = Tools.deepClone(model.getRules('owner', 'rules')[0]);
            expect(originalRules.map((rule) => rule.uid)).not.toContain(newRule.uid);
            const ownerUpdates: string[] = [];
            const replacementObservation = commands.onCommandExecuted((command) => {
                const params = command.params as { unitId: string; ruleId: string } | undefined;
                if ((command.id === UpdateDataValidationMutation.id || command.id === UpdateDataValidationFormulaBySheetRenameMutation.id) && params?.unitId === 'owner') {
                    ownerUpdates.push(params.ruleId);
                }
            });
            newSource.setName('Final Source');
            newSource.insertRowsBefore(1, 1);
            replacementObservation.dispose();
            expect(model.getRules('owner', 'rules')).toEqual([
                { ...newRule, operator: undefined, allowBlank: undefined, formula1: "='[owner]Final Source'!A1:A3" },
            ]);
            expect(ownerUpdates).toHaveLength(2);
            expect(new Set(ownerUpdates)).toEqual(new Set([newRule.uid]));
            expect(model.getRules('independent', 'rules')[0]).toEqual(independentRules[0]);
            expect(history.getUndoRedoStatus('independent')).toEqual(independentHistory);
        } finally {
            univer.dispose();
        }
    });

    it.each([false, true])('preserves later validation edits in another workbook when undoing a source rename (formula changed=%s)', async (formulaChanged) => {
        const univer = new Univer();
        univer.registerPlugin(UniverSheetsPlugin, { notExecuteFormula: true });
        univer.registerPlugin(UniverSheetsDataValidationPlugin);
        const injector = univer.__getInjector();
        const locale = injector.get(LocaleService);
        locale.load({ [LocaleType.EN_US]: { ...sheetsEnUS, ...enUS } });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        try {
            for (const unitId of ['owner', 'independent']) {
                univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookData(unitId));
            }
            const commands = injector.get(ICommandService);
            const instances = injector.get(IUniverInstanceService);
            const model = injector.get(SheetDataValidationModel);
            expect(await commands.executeCommand(AddSheetDataValidationCommand.id, {
                unitId: 'independent',
                subUnitId: 'rules',
                rule: {
                    uid: 'external',
                    type: DataValidationType.DECIMAL,
                    operator: DataValidationOperator.BETWEEN,
                    formula1: '=[owner]Scratch!$A$1',
                    formula2: '=[owner]Scratch!$A$2',
                    ranges: [{ startRow: 5, endRow: 5, startColumn: 7, endColumn: 7 }],
                },
            })).toBe(true);
            expect(await commands.executeCommand(SetWorksheetNameCommand.id, {
                unitId: 'owner',
                subUnitId: 'source',
                name: 'Renamed',
            })).toBe(true);
            expect(await commands.executeCommand(UpdateSheetDataValidationSettingCommand.id, {
                unitId: 'independent',
                subUnitId: 'rules',
                ruleId: 'external',
                setting: {
                    type: DataValidationType.DECIMAL,
                    operator: DataValidationOperator.BETWEEN,
                    formula1: formulaChanged ? '1' : '=[owner]Renamed!$A$1',
                    formula2: formulaChanged ? '2' : '=[owner]Renamed!$A$2',
                    allowBlank: true,
                },
            })).toBe(true);
            instances.focusUnit('owner');
            expect(commands.syncExecuteCommand(UndoCommand.id)).toBe(true);
            expect(instances.getUnit<Workbook>('owner')?.getSheetBySheetId('source')?.getName()).toBe('Scratch');
            expect(model.getRuleById('independent', 'rules', 'external')).toMatchObject({
                formula1: formulaChanged ? '1' : '=[owner]Scratch!$A$1',
                formula2: formulaChanged ? '2' : '=[owner]Scratch!$A$2',
                allowBlank: true,
            });
            expect(commands.syncExecuteCommand(RedoCommand.id)).toBe(true);
            expect(model.getRuleById('independent', 'rules', 'external')).toMatchObject({
                formula1: formulaChanged ? '1' : '=[owner]Renamed!$A$1',
                formula2: formulaChanged ? '2' : '=[owner]Renamed!$A$2',
                allowBlank: true,
            });
            expect(instances.disposeUnit('independent')).toBe(true);
            expect(model.getAll().some(([unitId]) => unitId === 'independent')).toBe(false);
            expect(commands.syncExecuteCommand(UndoCommand.id)).toBe(true);
            expect(model.getAll().some(([unitId]) => unitId === 'independent')).toBe(false);
        } finally {
            univer.dispose();
        }
    });
});
