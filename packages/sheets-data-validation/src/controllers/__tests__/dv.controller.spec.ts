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
    CellValueType,
    DataValidationOperator,
    DataValidationType,
    ICommandService,
    IResourceLoaderService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    Tools,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { ClearSelectionAllCommand, UniverSheetsPlugin } from '@univerjs/sheets';
import sheetsEnUS from '@univerjs/sheets/locale/en-US';
import { describe, expect, it } from 'vitest';
import { AddSheetDataValidationCommand } from '../../commands/commands/data-validation.command';
import enUS from '../../locale/en-US';
import { SheetDataValidationModel } from '../../models/sheet-data-validation-model';
import { UniverSheetsDataValidationPlugin } from '../../plugin';
import { DataValidationController } from '../dv.controller';
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
        sheetOrder: ['orders', 'summary'],
        sheets: {
            orders: {
                id: 'orders',
                name: 'Orders',
                rowCount: 20,
                columnCount: 15,
                cellData: {
                    1: { 10: { v: 11, t: CellValueType.NUMBER } },
                    6: { 4: { v: 5, t: CellValueType.NUMBER }, 9: { v: 'target', t: CellValueType.STRING } },
                    7: { 4: { v: 6, t: CellValueType.NUMBER } },
                    8: { 4: { v: 7, t: CellValueType.NUMBER } },
                },
            },
            summary: {
                id: 'summary',
                name: 'Summary',
                rowCount: 20,
                columnCount: 15,
                cellData: { 1: { 1: { v: 77, t: CellValueType.NUMBER } } },
            },
        },
    };
}

describe('DataValidationController clear ownership', () => {
    for (const branch of ['inactive sheet', 'independent workbook', 'current selection'] as const) {
        it(`clears only the requested validation cells with ${branch}, symmetric history and resource recovery`, async () => {
            const univer = new Univer();
            const injector = univer.__getInjector();
            univer.registerPlugin(UniverSheetsPlugin, { notExecuteFormula: true });
            univer.registerPlugin(UniverSheetsDataValidationPlugin);
            const locale = injector.get(LocaleService);
            locale.load({ [LocaleType.EN_US]: { ...sheetsEnUS, ...enUS } });
            locale.setLocale(LocaleType.EN_US);
            locale.setDirection('ltr');
            try {
                for (const unitId of ['owner', 'independent']) {
                    univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookData(unitId));
                }
                const controller = injector.get(DataValidationController);
                expect(controller).toBeInstanceOf(DataValidationController);
                const commands = injector.get(ICommandService);
                const model = injector.get(SheetDataValidationModel);
                const instances = injector.get(IUniverInstanceService);
                const loader = injector.get(IResourceLoaderService);
                const history = injector.get(IUndoRedoService);
                const api = FUniver.newAPI(injector);
                for (const unitId of ['owner', 'independent']) {
                    for (const item of [
                        { subUnitId: 'orders', uid: 'quantity', range: { startRow: 6, endRow: 8, startColumn: 4, endColumn: 4 } },
                        { subUnitId: 'orders', uid: 'outside', range: { startRow: 1, endRow: 1, startColumn: 10, endColumn: 10 } },
                        { subUnitId: 'summary', uid: 'summary-positive', range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } },
                    ]) {
                        expect(await commands.executeCommand(AddSheetDataValidationCommand.id, {
                            unitId,
                            subUnitId: item.subUnitId,
                            rule: {
                                uid: item.uid,
                                type: DataValidationType.DECIMAL,
                                operator: DataValidationOperator.GREATER_THAN,
                                formula1: '0',
                                ranges: [item.range],
                            },
                        })).toBe(true);
                    }
                }
                const owner = api.getWorkbook('owner')!;
                const orders = owner.getSheetBySheetId('orders')!;
                const target = orders.getRange('E7:J7');
                const beforeRules = Tools.deepClone(model.getRules('owner', 'orders'));
                const beforeSummary = Tools.deepClone(model.getRules('owner', 'summary'));
                const beforeCells = target.getCellDatas();
                const beforeResource = loader.saveUnit<IWorkbookData>('owner')!.resources;
                const beforeHistory = history.getUndoRedoStatus('owner');
                const independentHistory = history.getUndoRedoStatus('independent');
                if (branch === 'independent workbook') {
                    instances.focusUnit('independent');
                    api.getWorkbook('independent')!.getSheetBySheetId('summary')!.getRange('B2').activate();
                } else if (branch === 'inactive sheet') {
                    instances.focusUnit('owner');
                    owner.getSheetBySheetId('summary')!.getRange('B2').activate();
                } else {
                    instances.focusUnit('owner');
                    target.activate();
                }
                const independentBefore = loader.saveUnit<IWorkbookData>('independent')!;
                if (branch === 'current selection') {
                    expect(await commands.executeCommand(ClearSelectionAllCommand.id)).toBe(true);
                } else {
                    target.clear();
                }
                expect(model.getRules('owner', 'summary')).toEqual(beforeSummary);
                expect(loader.saveUnit<IWorkbookData>('independent')).toEqual(independentBefore);
                expect(history.getUndoRedoStatus('independent')).toEqual(independentHistory);
                expect(target.getValues()).toEqual([[null, null, null, null, null, null]]);
                expect(model.getRules('owner', 'orders')).toEqual([
                    { ...beforeRules[0], ranges: [{ startRow: 7, endRow: 8, startColumn: 4, endColumn: 4 }] },
                    beforeRules[1],
                ]);
                expect(history.getUndoRedoStatus('owner')).toEqual({ undos: beforeHistory.undos + 1, redos: 0 });
                const clearedRules = Tools.deepClone(model.getRules('owner', 'orders'));
                const clearedResource = loader.saveUnit<IWorkbookData>('owner')!.resources;
                instances.focusUnit('owner');
                owner.undo();
                expect(model.getRules('owner', 'orders')).toEqual(beforeRules);
                expect(model.getRules('owner', 'summary')).toEqual(beforeSummary);
                expect(target.getCellDatas()).toEqual(beforeCells);
                expect(loader.saveUnit<IWorkbookData>('owner')!.resources).toEqual(beforeResource);
                owner.redo();
                expect(model.getRules('owner', 'orders')).toEqual(clearedRules);
                expect(loader.saveUnit<IWorkbookData>('owner')!.resources).toEqual(clearedResource);
                expect(loader.saveUnit<IWorkbookData>('independent')).toEqual(independentBefore);
                const snapshot = loader.saveUnit<IWorkbookData>('owner')!;
                instances.disposeUnit('owner');
                univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, JSON.parse(JSON.stringify(snapshot)));
                const restored = api.getWorkbook('owner')!.getSheetBySheetId('orders')!;
                expect(model.getRules('owner', 'orders')).toEqual(clearedRules);
                expect(restored.getRange('E7').getDataValidation()).toBeUndefined();
                expect(restored.getRange('E8').getDataValidation()?.rule.uid).toBe('quantity');
                restored.getRange('E8').setValue(-1);
                expect(await restored.getRange('E8').getValidatorStatus()).toEqual([['invalid']]);
                restored.getRange('E8').setValue(8);
                expect(await restored.getRange('E8').getValidatorStatus()).toEqual([['valid']]);
                expect(model.getRules('owner', 'summary')).toEqual(beforeSummary);
                expect(loader.saveUnit<IWorkbookData>('independent')).toEqual(independentBefore);
            } finally {
                univer.dispose();
            }
        });
    }
});
