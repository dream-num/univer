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
import type { IUpdateDataValidationMutationParams } from '@univerjs/data-validation';
import {
    DataValidationOperator,
    DataValidationType,
    ICommandService,
    ILogService,
    IResourceLoaderService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    RedoCommand,
    Tools,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { UniverDataValidationPlugin, UpdateDataValidationMutation } from '@univerjs/data-validation';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { MoveRangeCommand, SetSelectionsOperation, UniverSheetsPlugin } from '@univerjs/sheets';
import {
    AddSheetDataValidationCommand,
    DATA_VALIDATION_PLUGIN_NAME,
    SheetDataValidationModel,
    UniverSheetsDataValidationPlugin,
} from '@univerjs/sheets-data-validation';
import {
    COPY_TYPE,
    IMarkSelectionService,
    ISheetClipboardService,
    MarkSelectionService,
    PREDEFINED_HOOK_NAME_PASTE,
    SheetClipboardController,
    SheetClipboardService,
} from '@univerjs/sheets-ui';
import enUS from '@univerjs/sheets/locale/en-US';
import {
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
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DataValidationCopyPasteController } from '../dv-copy-paste.controller';

function createWorkbookData(id: string): IWorkbookData {
    return {
        id,
        appVersion: '1.0.0',
        locale: LocaleType.EN_US,
        name: id,
        styles: {},
        sheetOrder: ['sheet'],
        sheets: {
            sheet: {
                id: 'sheet',
                name: 'Sheet',
                rowCount: 30,
                columnCount: 20,
                cellData: {
                    1: { 0: { v: -1 }, 1: { v: 3 } },
                    3: { 3: { v: 'left' }, 4: { v: 'right' }, 5: { v: 11 } },
                },
            },
        },
    };
}

describe('DataValidationCopyPasteController real clipboard', () => {
    let univer: Univer;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([IUIPartsService, { useClass: UIPartsService }]);
        injector.add([INotificationService, { useClass: DesktopNotificationService }]);
        injector.add([IMessageService, { useClass: DesktopMessageService }]);
        injector.add([IPlatformService, { useClass: PlatformService }]);
        injector.add([IClipboardInterfaceService, { useValue: {
            supportClipboard: false,
            write: async () => {},
            writeText: async () => {},
            read: async () => [],
            readText: async () => '',
        } satisfies IClipboardInterfaceService }]);
        injector.add([IMarkSelectionService, { useClass: MarkSelectionService }]);
        injector.add([ISheetClipboardService, { useClass: SheetClipboardService }]);
        injector.add([SheetClipboardController]);
        injector.add([DataValidationCopyPasteController]);
        univer.registerPlugin(UniverDataValidationPlugin);
        univer.registerPlugin(UniverSheetsPlugin, { notExecuteFormula: true });
        univer.registerPlugin(UniverSheetsDataValidationPlugin);
        const locale = injector.get(LocaleService);
        locale.load({ enUS });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        injector.get(ILogService).setLogLevel(LogLevel.SILENT);
        univer.createUnit<IWorkbookData, Workbook>(
            UniverInstanceType.UNIVER_SHEET,
            createWorkbookData('source')
        );
        univer.createUnit<IWorkbookData, Workbook>(
            UniverInstanceType.UNIVER_SHEET,
            createWorkbookData('target')
        );
        injector.get(DataValidationCopyPasteController);
        injector.get(SheetClipboardController);
    });

    afterEach(() => {
        univer?.dispose();
    });

    it('keeps default-target moves on the explicit source worksheet and leaves caller parameters unchanged', async () => {
        const injector = univer.__getInjector();
        const commands = injector.get(ICommandService);
        const model = injector.get(SheetDataValidationModel);
        const loader = injector.get(IResourceLoaderService);
        injector.get(IUniverInstanceService).focusUnit('source');
        expect(await commands.executeCommand(AddSheetDataValidationCommand.id, {
            unitId: 'source',
            subUnitId: 'sheet',
            rule: {
                uid: 'positive',
                type: DataValidationType.DECIMAL,
                operator: DataValidationOperator.GREATER_THAN,
                formula1: '0',
                ranges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }],
            },
        })).toBe(true);
        injector.get(IUndoRedoService).clearUndoRedo('source');
        const before = loader.saveUnit<IWorkbookData>('source');
        const params = {
            fromUnitId: 'source',
            toUnitId: 'source',
            fromSubUnitId: 'sheet',
            fromRange: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
            toRange: { startRow: 3, endRow: 3, startColumn: 4, endColumn: 4 },
        };
        const originalParams = Tools.deepClone(params);
        expect(await commands.executeCommand(MoveRangeCommand.id, params)).toBe(true);
        expect(params).toEqual(originalParams);
        expect(model.getRuleByLocation('source', 'sheet', 1, 1)).toBeUndefined();
        expect(model.getRuleByLocation('source', 'sheet', 3, 4)?.uid).toBe('positive');
        const moved = loader.saveUnit<IWorkbookData>('source');
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(loader.saveUnit<IWorkbookData>('source')).toEqual(before);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(loader.saveUnit<IWorkbookData>('source')).toEqual(moved);
    });

    it('restores the original source and target rule order after moving multiple rules past retained sentinels', async () => {
        const injector = univer.__getInjector();
        const commands = injector.get(ICommandService);
        const model = injector.get(SheetDataValidationModel);
        const loader = injector.get(IResourceLoaderService);
        const data = createWorkbookData('ordered');
        data.sheets.sheet.cellData![2] = { 1: { v: 4 } };
        data.sheets.sheet.cellData![4] = { 1: { v: 7 } };
        data.sheetOrder.push('destination');
        data.sheets.destination = {
            id: 'destination',
            name: 'Destination',
            rowCount: 30,
            columnCount: 20,
            cellData: { 3: { 4: { v: 5 } }, 4: { 4: { v: 6 } }, 6: { 4: { v: 777 } } },
        };
        univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, data);
        for (const [subUnitId, items] of [
            ['sheet', [['a', 1, 1], ['b', 2, 1], ['c', 4, 1]]],
            ['destination', [['d', 3, 4], ['e', 4, 4], ['f', 6, 4]]],
        ] as const) {
            for (const [uid, row, column] of items) {
                expect(await commands.executeCommand(AddSheetDataValidationCommand.id, {
                    unitId: 'ordered',
                    subUnitId,
                    rule: {
                        uid,
                        type: DataValidationType.DECIMAL,
                        operator: DataValidationOperator.GREATER_THAN,
                        formula1: '0',
                        ranges: [{ startRow: row, endRow: row, startColumn: column, endColumn: column }],
                    },
                })).toBe(true);
            }
        }
        injector.get(IUniverInstanceService).focusUnit('ordered');
        injector.get(IUndoRedoService).clearUndoRedo('ordered');
        const before = loader.saveUnit<IWorkbookData>('ordered');
        expect(model.getRules('ordered', 'sheet').map((rule) => rule.uid)).toEqual(['a', 'b', 'c']);
        expect(model.getRules('ordered', 'destination').map((rule) => rule.uid)).toEqual(['d', 'e', 'f']);
        expect(await commands.executeCommand(MoveRangeCommand.id, {
            fromUnitId: 'ordered',
            toUnitId: 'ordered',
            fromSubUnitId: 'sheet',
            toSubUnitId: 'destination',
            fromRange: { startRow: 1, endRow: 2, startColumn: 1, endColumn: 1 },
            toRange: { startRow: 3, endRow: 4, startColumn: 4, endColumn: 4 },
        })).toBe(true);
        expect(model.getRules('ordered', 'sheet').map((rule) => rule.uid)).toEqual(['c']);
        expect(model.getRules('ordered', 'destination').map((rule) => rule.uid)).toEqual(['f', 'sheet-a', 'sheet-b']);
        const moved = loader.saveUnit<IWorkbookData>('ordered');
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(model.getRules('ordered', 'sheet').map((rule) => rule.uid)).toEqual(['a', 'b', 'c']);
        expect(model.getRules('ordered', 'destination').map((rule) => rule.uid)).toEqual(['d', 'e', 'f']);
        expect(loader.saveUnit<IWorkbookData>('ordered')).toEqual(before);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(loader.saveUnit<IWorkbookData>('ordered')).toEqual(moved);
    });

    it('partitions cross-sheet relative interval dependencies at both reference endpoints', async () => {
        const injector = univer.__getInjector();
        const commands = injector.get(ICommandService);
        const model = injector.get(SheetDataValidationModel);
        const loader = injector.get(IResourceLoaderService);
        const data = createWorkbookData('interval');
        data.sheets.sheet.cellData![2] = { 1: { v: 4 } };
        data.sheetOrder.push('destination', 'third');
        data.sheets.destination = { id: 'destination', name: 'Destination', rowCount: 30, columnCount: 20 };
        data.sheets.third = { id: 'third', name: 'Third', rowCount: 30, columnCount: 20 };
        univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, data);
        expect(await commands.executeCommand(AddSheetDataValidationCommand.id, {
            unitId: 'interval',
            subUnitId: 'third',
            rule: {
                uid: 'interval-reference',
                type: DataValidationType.CUSTOM,
                formula1: '=SUM(Sheet!B1:B2)>0',
                ranges: [{ startRow: 1, endRow: 3, startColumn: 9, endColumn: 9 }],
            },
        })).toBe(true);
        injector.get(IUndoRedoService).clearUndoRedo('interval');
        injector.get(IUniverInstanceService).focusUnit('interval');
        const before = loader.saveUnit<IWorkbookData>('interval');
        expect(await commands.executeCommand(MoveRangeCommand.id, {
            fromUnitId: 'interval',
            toUnitId: 'interval',
            fromSubUnitId: 'sheet',
            toSubUnitId: 'destination',
            fromRange: { startRow: 1, endRow: 2, startColumn: 1, endColumn: 1 },
            toRange: { startRow: 4, endRow: 5, startColumn: 12, endColumn: 12 },
        })).toBe(true);
        expect(model.getRuleByLocation('interval', 'third', 1, 9)?.formula1).toBe('=SUM(Sheet!B1:B2)>0');
        expect(model.getRuleByLocation('interval', 'third', 2, 9)?.formula1).toBe('=SUM(Destination!M5:M6)>0');
        const unaffected = model.getRuleByLocation('interval', 'third', 3, 9);
        expect(unaffected).toMatchObject({
            formula1: '=SUM(Sheet!B1:B2)>0',
            ranges: [
                { startRow: 1, endRow: 1, startColumn: 9, endColumn: 9 },
                { startRow: 3, endRow: 3, startColumn: 9, endColumn: 9 },
            ],
        });
        expect(unaffected?.uid).toBe(model.getRuleByLocation('interval', 'third', 1, 9)?.uid);
        const moved = loader.saveUnit<IWorkbookData>('interval');
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(loader.saveUnit<IWorkbookData>('interval')).toEqual(before);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(loader.saveUnit<IWorkbookData>('interval')).toEqual(moved);
    });

    it.each([DataValidationType.DECIMAL, DataValidationType.CUSTOM, DataValidationType.LIST].flatMap((type) => (
        [false, true].flatMap((remainder) => ['clipboard', 'command'].flatMap((entry) => (
            (type === DataValidationType.CUSTOM ? [false, true] : [false]).map((relative) => ({ type, remainder, entry, relative }))
        )))
    )).concat([{ type: DataValidationType.DECIMAL, remainder: false, entry: 'implicit-unit', relative: false }]))(
        '$entry moves $type validation across sheets with remainder=$remainder relative=$relative without updating removed rules',
        async ({ type, remainder, entry, relative }) => {
            const injector = univer.__getInjector();
            const commands = injector.get(ICommandService);
            const model = injector.get(SheetDataValidationModel);
            const clipboard = injector.get(ISheetClipboardService);
            const history = injector.get(IUndoRedoService);
            const loader = injector.get(IResourceLoaderService);
            const data = createWorkbookData('cut');
            data.sheets.sheet.cellData![2] = { 1: { v: 4 } };
            data.sheetOrder.push('destination');
            data.sheets.destination = {
                id: 'destination',
                name: 'Destination',
                rowCount: 30,
                columnCount: 20,
                cellData: { 3: { 3: { v: 'left' }, 4: { v: 'right' }, 5: { v: 11 } }, 4: { 4: { v: 777 } } },
            };
            data.sheetOrder.push('third');
            data.sheets.third = {
                id: 'third',
                name: 'Third',
                rowCount: 30,
                columnCount: 20,
                cellData: { 0: { 2: { v: 3 } } },
            };
            const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, data);
            let formula1 = '0';
            if (type === DataValidationType.CUSTOM) {
                formula1 = relative ? '=AND(B2>0,$A$2<0,"a""b"="a""b")' : '=AND($B$2>0,$A$2<0)';
            }
            if (type === DataValidationType.LIST) {
                formula1 = '3,4';
            }
            expect(await commands.executeCommand(AddSheetDataValidationCommand.id, {
                unitId: 'cut',
                subUnitId: 'sheet',
                rule: {
                    uid: 'positive',
                    type,
                    operator: DataValidationOperator.GREATER_THAN,
                    formula1,
                    ranges: [{ startRow: 1, endRow: remainder ? 2 : 1, startColumn: 1, endColumn: 1 }],
                },
            })).toBe(true);
            expect(await commands.executeCommand(AddSheetDataValidationCommand.id, {
                unitId: 'cut',
                subUnitId: 'destination',
                rule: {
                    uid: 'neighbor',
                    type: DataValidationType.DECIMAL,
                    operator: DataValidationOperator.LESS_THAN,
                    formula1: '20',
                    ranges: [{ startRow: 3, endRow: 3, startColumn: 5, endColumn: 5 }],
                },
            })).toBe(true);
            expect(await commands.executeCommand(AddSheetDataValidationCommand.id, {
                unitId: 'cut',
                subUnitId: 'destination',
                rule: {
                    uid: 'overwritten',
                    type: DataValidationType.CUSTOM,
                    formula1: '=AND(E4<0,Sheet!$B$2>0)',
                    ranges: [{ startRow: 3, endRow: 4, startColumn: 4, endColumn: 4 }],
                },
            })).toBe(true);
            expect(await commands.executeCommand(AddSheetDataValidationCommand.id, {
                unitId: 'cut',
                subUnitId: 'third',
                rule: {
                    uid: 'third-reference',
                    type: DataValidationType.CUSTOM,
                    formula1: '=Sheet!$B$2>0',
                    ranges: [{ startRow: 0, endRow: 0, startColumn: 2, endColumn: 2 }],
                },
            })).toBe(true);
            expect(await commands.executeCommand(AddSheetDataValidationCommand.id, {
                unitId: 'source',
                subUnitId: 'sheet',
                rule: {
                    uid: 'external-reference',
                    type: DataValidationType.CUSTOM,
                    formula1: '=[cut]Sheet!$B$2>0',
                    ranges: [{ startRow: 0, endRow: 0, startColumn: 2, endColumn: 2 }],
                },
            })).toBe(true);
            history.clearUndoRedo('cut');
            const before = loader.saveUnit<IWorkbookData>('cut');
            const externalBefore = loader.saveUnit<IWorkbookData>('source');
            const missingUpdates: IUpdateDataValidationMutationParams[] = [];
            const listener = commands.beforeCommandExecuted((command) => {
                if (command.id === UpdateDataValidationMutation.id) {
                    const params = command.params as IUpdateDataValidationMutationParams;
                    if (params.unitId === 'cut' && !model.getRuleById(params.unitId, params.subUnitId, params.ruleId)) {
                        missingUpdates.push(Tools.deepClone(params));
                    }
                }
            });
            try {
                injector.get(IUniverInstanceService).focusUnit('cut');
                expect(commands.syncExecuteCommand(SetSelectionsOperation.id, {
                    unitId: 'cut',
                    subUnitId: 'sheet',
                    selections: [{
                        range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                        primary: null,
                        style: null,
                    }],
                })).toBe(true);
                if (entry === 'clipboard') {
                    expect(await clipboard.cut()).toBe(true);
                    const copyId = clipboard.copyContentCache().getLastCopyId();
                    if (!copyId) {
                        throw new Error('Real cut did not populate its clipboard cache');
                    }
                    expect(await clipboard.pasteByCopyId(copyId, undefined, {
                        unitId: 'cut',
                        subUnitId: 'destination',
                        range: { startRow: 3, endRow: 3, startColumn: 4, endColumn: 4 },
                    })).toBe(true);
                } else {
                    expect(await commands.executeCommand(MoveRangeCommand.id, {
                        fromUnitId: 'cut',
                        fromSubUnitId: 'sheet',
                        ...(entry === 'implicit-unit' ? {} : { toUnitId: 'cut' }),
                        toSubUnitId: 'destination',
                        fromRange: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                        toRange: { startRow: 3, endRow: 3, startColumn: 4, endColumn: 4 },
                    })).toBe(true);
                }
                expect(missingUpdates).toEqual([]);
                expect(model.getRuleByLocation('cut', 'sheet', 1, 1)).toBeUndefined();
                expect(model.getRules('cut', 'sheet')).toHaveLength(remainder ? 1 : 0);
                if (remainder) {
                    let remainderFormula = formula1;
                    if (type === DataValidationType.CUSTOM) {
                        remainderFormula = relative ? '=AND(B3>0,$A$2<0,"a""b"="a""b")' : '=AND(Destination!$E$4>0,$A$2<0)';
                    }
                    expect(model.getRuleByLocation('cut', 'sheet', 2, 1)).toMatchObject({
                        uid: 'positive',
                        formula1: remainderFormula,
                        ranges: [{ startRow: 2, endRow: 2, startColumn: 1, endColumn: 1 }],
                    });
                }
                let movedFormula = formula1;
                if (type === DataValidationType.CUSTOM) {
                    movedFormula = relative ? '=AND(E4>0,Sheet!$A$2<0,"a""b"="a""b")' : '=AND($E$4>0,Sheet!$A$2<0)';
                }
                expect(model.getRuleByLocation('cut', 'destination', 3, 4)).toMatchObject({
                    uid: 'sheet-positive',
                    type,
                    formula1: movedFormula,
                    ranges: [{ startRow: 3, endRow: 3, startColumn: 4, endColumn: 4 }],
                });
                expect(model.getRuleByLocation('cut', 'destination', 3, 5)?.uid).toBe('neighbor');
                expect(model.getRuleById('cut', 'destination', 'overwritten')).toMatchObject({
                    formula1: '=AND(E5<0,Destination!$E$4>0)',
                    ranges: [{ startRow: 4, endRow: 4, startColumn: 4, endColumn: 4 }],
                });
                expect(model.getRuleById('cut', 'third', 'third-reference')?.formula1).toBe('=Destination!$E$4>0');
                expect(model.getRuleById('source', 'sheet', 'external-reference')?.formula1).toBe('=[cut]Destination!$E$4>0');
                expect(workbook.getSheetBySheetId('sheet')?.getCellRaw(1, 0)?.v).toBe(-1);
                expect(workbook.getSheetBySheetId('sheet')?.getCellRaw(1, 1)?.v).toBeUndefined();
                expect(workbook.getSheetBySheetId('destination')?.getCellRaw(3, 4)?.v).toBe(3);
                expect(history.getUndoRedoStatus('cut')).toEqual({ undos: 1, redos: 0 });
                const moved = loader.saveUnit<IWorkbookData>('cut');
                const externalMoved = loader.saveUnit<IWorkbookData>('source');
                expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
                expect(loader.saveUnit<IWorkbookData>('cut')).toEqual(before);
                expect(loader.saveUnit<IWorkbookData>('source')).toEqual(externalBefore);
                expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
                expect(missingUpdates).toEqual([]);
                expect(loader.saveUnit<IWorkbookData>('cut')).toEqual(moved);
                expect(loader.saveUnit<IWorkbookData>('source')).toEqual(externalMoved);
                if (!moved) {
                    throw new Error('Resource loader did not save the moved workbook');
                }
                const movedRules = ['sheet', 'destination', 'third'].map((id) => Tools.deepClone(model.getRules('cut', id)));
                injector.get(IUniverInstanceService).disposeUnit('cut');
                univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, moved);
                expect(['sheet', 'destination', 'third'].map((id) => model.getRules('cut', id))).toEqual(movedRules);
                expect(model.getRuleById('source', 'sheet', 'external-reference')?.formula1).toBe('=[cut]Destination!$E$4>0');
            } finally {
                listener.dispose();
            }
        }
    );

    it.each(['source', 'target'])(
        'copies an offset validation cell to %s without widening its range',
        async (targetId) => {
            const injector = univer.__getInjector();
            const instances = injector.get(IUniverInstanceService);
            const target = instances.getUnit<Workbook>(targetId, UniverInstanceType.UNIVER_SHEET)!;
            const commands = injector.get(ICommandService);
            const model = injector.get(SheetDataValidationModel);
            const clipboard = injector.get(ISheetClipboardService);
            const history = injector.get(IUndoRedoService);
            expect(await commands.executeCommand(AddSheetDataValidationCommand.id, {
                unitId: 'source',
                subUnitId: 'sheet',
                rule: {
                    uid: 'positive',
                    type: DataValidationType.DECIMAL,
                    operator: DataValidationOperator.GREATER_THAN,
                    formula1: '0',
                    ranges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }],
                },
            })).toBe(true);
            expect(await commands.executeCommand(AddSheetDataValidationCommand.id, {
                unitId: targetId,
                subUnitId: 'sheet',
                rule: {
                    uid: 'neighbor',
                    type: DataValidationType.DECIMAL,
                    operator: DataValidationOperator.LESS_THAN,
                    formula1: '20',
                    ranges: [{ startRow: 3, endRow: 3, startColumn: 5, endColumn: 5 }],
                },
            })).toBe(true);
            history.clearUndoRedo(targetId);
            const sourceBefore = injector.get(IResourceLoaderService).saveUnit<IWorkbookData>('source');
            const targetBeforeRules = Tools.deepClone(model.getRules(targetId, 'sheet'));
            injector.get(IUniverInstanceService).focusUnit('source');
            expect(commands.syncExecuteCommand(SetSelectionsOperation.id, {
                unitId: 'source',
                subUnitId: 'sheet',
                selections: [{
                    range: { startRow: 1, endRow: 1, startColumn: 0, endColumn: 1 },
                    primary: null,
                    style: null,
                }],
            })).toBe(true);
            expect(await clipboard.copy()).toBe(true);
            const copyId = clipboard.copyContentCache().getLastCopyId();
            expect(copyId).toBeTruthy();
            if (!copyId) {
                throw new Error('Real copy did not populate its clipboard cache');
            }
            injector.get(IUniverInstanceService).focusUnit(targetId);
            expect(await clipboard.pasteByCopyId(copyId, undefined, {
                unitId: targetId,
                subUnitId: 'sheet',
                range: { startRow: 3, endRow: 3, startColumn: 3, endColumn: 4 },
            })).toBe(true);
            expect(target.getActiveSheet()?.getCellRaw(3, 3)?.v).toBe(-1);
            expect(target.getActiveSheet()?.getCellRaw(3, 4)?.v).toBe(3);
            expect(model.getRuleByLocation(targetId, 'sheet', 3, 3)).toBeUndefined();
            expect(model.getRuleByLocation(targetId, 'sheet', 3, 4)?.ranges).toEqual([
                ...(targetId === 'source' ? [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }] : []),
                { startRow: 3, endRow: 3, startColumn: 4, endColumn: 4 },
            ]);
            expect(model.getRuleByLocation(targetId, 'sheet', 3, 5)?.uid).toBe('neighbor');
            if (targetId !== 'source') {
                expect(injector.get(IResourceLoaderService).saveUnit<IWorkbookData>('source')).toEqual(sourceBefore);
            }
            expect(history.getUndoRedoStatus(targetId)).toEqual({ undos: 1, redos: 0 });
            const pastedRules = Tools.deepClone(model.getRules(targetId, 'sheet'));
            expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
            expect(model.getRules(targetId, 'sheet')).toEqual(targetBeforeRules);
            expect(target.getActiveSheet()?.getCellRaw(3, 3)?.v).toBe('left');
            expect(target.getActiveSheet()?.getCellRaw(3, 4)?.v).toBe('right');
            expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
            expect(model.getRules(targetId, 'sheet')).toEqual(pastedRules);
            const saved = injector.get(IResourceLoaderService).saveUnit<IWorkbookData>(targetId);
            if (!saved) {
                throw new Error('Resource loader did not save the target workbook');
            }
            injector.get(IUniverInstanceService).disposeUnit(targetId);
            univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, saved);
            expect(model.getRules(targetId, 'sheet')).toEqual(pastedRules);
            expect(model.getRuleByLocation(targetId, 'sheet', 3, 5)?.uid).toBe('neighbor');
        }
    );

    it.each([
        {
            kind: 'one tile',
            pasteRange: { startRow: 10, endRow: 12, startColumn: 3, endColumn: 4 },
            expectedRanges: [{ startRow: 12, endRow: 12, startColumn: 4, endColumn: 4 }],
        },
        {
            kind: 'four tiles',
            pasteRange: { startRow: 10, endRow: 15, startColumn: 3, endColumn: 6 },
            expectedRanges: [
                { startRow: 12, endRow: 12, startColumn: 4, endColumn: 4 },
                { startRow: 12, endRow: 12, startColumn: 6, endColumn: 6 },
                { startRow: 15, endRow: 15, startColumn: 4, endColumn: 4 },
                { startRow: 15, endRow: 15, startColumn: 6, endColumn: 6 },
            ],
        },
    ])('places a rule at its source offset with $kind', async ({ pasteRange, expectedRanges }) => {
        const injector = univer.__getInjector();
        const commands = injector.get(ICommandService);
        const model = injector.get(SheetDataValidationModel);
        const clipboard = injector.get(ISheetClipboardService);
        const sourceRange: IRange = { startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 };
        expect(await commands.executeCommand(AddSheetDataValidationCommand.id, {
            unitId: 'source',
            subUnitId: 'sheet',
            rule: {
                uid: 'last-cell',
                type: DataValidationType.DECIMAL,
                formula1: '0',
                operator: DataValidationOperator.GREATER_THAN,
                ranges: [{ startRow: 2, endRow: 2, startColumn: 1, endColumn: 1 }],
            },
        })).toBe(true);
        injector.get(IUniverInstanceService).focusUnit('source');
        expect(commands.syncExecuteCommand(SetSelectionsOperation.id, {
            unitId: 'source',
            subUnitId: 'sheet',
            selections: [{ range: sourceRange, primary: null, style: null }],
        })).toBe(true);
        expect(await clipboard.copy()).toBe(true);
        const copyId = clipboard.copyContentCache().getLastCopyId();
        if (!copyId) {
            throw new Error('Real copy did not populate its clipboard cache');
        }
        expect(await clipboard.pasteByCopyId(copyId, undefined, {
            unitId: 'target',
            subUnitId: 'sheet',
            range: pasteRange,
        })).toBe(true);
        expect(model.getRules('target', 'sheet').flatMap((rule) => rule.ranges)).toEqual(expectedRanges);
    });

    it('maps an actual registered paste hook onto discrete target rows and columns', async () => {
        const injector = univer.__getInjector();
        const commands = injector.get(ICommandService);
        const model = injector.get(SheetDataValidationModel);
        const clipboard = injector.get(ISheetClipboardService);
        expect(await commands.executeCommand(AddSheetDataValidationCommand.id, {
            unitId: 'source',
            subUnitId: 'sheet',
            rule: {
                uid: 'last-cell',
                type: DataValidationType.DECIMAL,
                formula1: '0',
                operator: DataValidationOperator.GREATER_THAN,
                ranges: [{ startRow: 2, endRow: 2, startColumn: 1, endColumn: 1 }],
            },
        })).toBe(true);
        injector.get(IUniverInstanceService).focusUnit('source');
        expect(commands.syncExecuteCommand(SetSelectionsOperation.id, {
            unitId: 'source',
            subUnitId: 'sheet',
            selections: [{
                range: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 },
                primary: null,
                style: null,
            }],
        })).toBe(true);
        expect(await clipboard.copy()).toBe(true);
        const copyId = clipboard.copyContentCache().getLastCopyId();
        const copied = copyId && clipboard.copyContentCache().get(copyId);
        const hook = clipboard.getClipboardHooks().find((item) => item.id === DATA_VALIDATION_PLUGIN_NAME);
        if (!copied || !copied.matrix || !hook?.onPasteCells) {
            throw new Error('Real clipboard did not provide its cached copy and validation hook');
        }
        const sourceBefore = injector.get(IResourceLoaderService).saveUnit<IWorkbookData>('source');
        const targetBefore = Tools.deepClone(model.getRules('target', 'sheet'));
        const mutations = hook.onPasteCells(
            { unitId: 'source', subUnitId: 'sheet', range: copied.range },
            {
                unitId: 'target',
                subUnitId: 'sheet',
                range: { rows: [10, 11, 13, 14, 16, 17], cols: [3, 5] },
            },
            copied.matrix,
            { copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );
        for (const mutation of mutations.redos) {
            expect(commands.syncExecuteCommand(mutation.id, mutation.params)).toBe(true);
        }
        expect(model.getRules('target', 'sheet').flatMap((rule) => rule.ranges)).toEqual([
            { startRow: 13, endRow: 13, startColumn: 5, endColumn: 5 },
            { startRow: 17, endRow: 17, startColumn: 5, endColumn: 5 },
        ]);
        expect(model.getRuleByLocation('target', 'sheet', 12, 5)).toBeUndefined();
        expect(model.getRuleByLocation('target', 'sheet', 13, 4)).toBeUndefined();
        for (const mutation of mutations.undos) {
            expect(commands.syncExecuteCommand(mutation.id, mutation.params)).toBe(true);
        }
        expect(model.getRules('target', 'sheet')).toEqual(targetBefore);
        expect(injector.get(IResourceLoaderService).saveUnit<IWorkbookData>('source')).toEqual(sourceBefore);
    });
});
