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
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RANGE_TYPE,
    RedoCommand,
    Tools,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    ActiveDirtyManagerService,
    CalculateFormulaService,
    DefinedNamesService,
    FormulaCurrentConfigService,
    FormulaDataModel,
    FormulaRuntimeService,
    HyperlinkEngineFormulaService,
    IActiveDirtyManagerService,
    ICalculateFormulaService,
    IDefinedNamesService,
    IFormulaCurrentConfigService,
    IFormulaRuntimeService,
    IHyperlinkEngineFormulaService,
    ISheetRowFilteredService,
    ISuperTableService,
    LexerTreeBuilder,
    RemoveSuperTableMutation,
    SetSuperTableMutation,
    SheetRowFilteredService,
    SuperTableService,
} from '@univerjs/engine-formula';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import {
    AddWorksheetMergeMutation,
    ExclusiveRangeService,
    IExclusiveRangeService,
    MoveRangeMutation,
    RangeProtectionRuleModel,
    RefRangeService,
    RemoveWorksheetMergeMutation,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetActiveOperation,
    SetWorksheetColWidthMutation,
    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowHeightMutation,
    SheetInterceptorService,
    SheetRangeThemeModel,
    SheetRangeThemeService,
    SheetSkeletonService,
    SheetsSelectionsService,
    WorkbookPermissionService,
    WorksheetPermissionService,
    WorksheetProtectionPointModel,
    WorksheetProtectionRuleModel,
    ZebraCrossingCacheController,
} from '@univerjs/sheets';
import { TableManager, UniverSheetsTablePlugin } from '@univerjs/sheets-table';
import enUS from '@univerjs/sheets-table/locale/en-US';
import {
    IMarkSelectionService,
    ISheetClipboardService,
    MarkSelectionService,
    SelectAllCommand,
    SheetClipboardController,
    SheetClipboardService,
} from '@univerjs/sheets-ui';
import {
    IClipboardInterfaceService,
    IMessageService,
    INotificationService,
    IPlatformService,
    PlatformService,
} from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SheetTableSelectionController } from '../sheet-table-selection.controller';

describe('SheetTableSelectionController', () => {
    it('should toggle select-all behavior between table body and table with header', () => {
        let interceptCommandConfig: any;

        const tableRange = { startRow: 2, endRow: 5, startColumn: 1, endColumn: 3 };
        const table = {
            getRange: () => tableRange,
        };

        const worksheet = {
            getSheetId: () => 's1',
            getMergedCell: () => null,
        };

        const workbook = {
            getUnitId: () => 'u1',
            getActiveSheet: () => worksheet,
        };

        const controller = new SheetTableSelectionController(
            {
                interceptCommand: vi.fn((config: any) => {
                    interceptCommandConfig = config;
                    return { dispose: vi.fn() };
                }),
            } as any,
            {
                getCurrentUnitOfType: () => workbook,
            } as any,
            {
                getTablesBySubunitId: () => [table],
            } as any
        );

        const selectWholeTable = interceptCommandConfig.getMutations({
            id: SelectAllCommand.id,
            params: { range: tableRange },
        });
        expect(selectWholeTable).toEqual({ redos: [], undos: [] });

        const tableBodyRange = { ...tableRange, startRow: tableRange.startRow + 1 };
        const selectBodyThenExpandToHeader = interceptCommandConfig.getMutations({
            id: SelectAllCommand.id,
            params: { range: tableBodyRange },
        });

        expect(selectBodyThenExpandToHeader.redos).toHaveLength(1);
        expect(selectBodyThenExpandToHeader.redos[0]).toEqual({
            id: SetSelectionsOperation.id,
            params: expect.objectContaining({
                unitId: 'u1',
                subUnitId: 's1',
                selections: [expect.objectContaining({ range: tableRange })],
            }),
        });

        const randomRange = { startRow: 3, endRow: 3, startColumn: 1, endColumn: 2 };
        const selectRandomThenBody = interceptCommandConfig.getMutations({
            id: SelectAllCommand.id,
            params: { range: randomRange },
        });
        expect(selectRandomThenBody.redos).toHaveLength(1);
        expect(selectRandomThenBody.redos[0]).toEqual({
            id: SetSelectionsOperation.id,
            params: expect.objectContaining({
                selections: [expect.objectContaining({ range: tableBodyRange })],
            }),
        });

        controller.dispose();
    });
});

const TABLE_RANGE = { startRow: 2, endRow: 5, startColumn: 1, endColumn: 3 };

function createClipboardTestBed() {
    const data: IWorkbookData = {
        id: 'test',
        name: 'Tables',
        appVersion: '1.0.3',
        locale: LocaleType.EN_US,
        styles: {},
        sheetOrder: ['sheet1', 'sheet2'],
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'Source',
                rowCount: 20,
                columnCount: 20,
                cellData: {
                    2: { 1: { v: 'Name' }, 2: { v: 'Amount' }, 3: { v: 'Tax' } },
                    3: { 1: { v: 'A' }, 2: { v: 10 }, 3: { v: 1 } },
                    4: { 1: { v: 'B' }, 2: { v: 20 }, 3: { v: 2 } },
                    5: { 1: { v: 'C' }, 2: { v: 30 }, 3: { v: 3 } },
                },
            },
            sheet2: { id: 'sheet2', name: 'Target', rowCount: 20, columnCount: 20, cellData: {} },
        },
    };
    const clipboard: IClipboardInterfaceService = {
        supportClipboard: true,
        write: async () => {},
        writeText: async () => {},
        read: async () => [],
        readText: async () => '',
    };
    const univer = new Univer();
    const injector = univer.__getInjector();
    injector.add([SheetsSelectionsService]);
    injector.add([SheetInterceptorService]);
    injector.add([RangeProtectionRuleModel]);
    injector.add([WorksheetProtectionRuleModel]);
    injector.add([WorksheetProtectionPointModel]);
    injector.add([WorkbookPermissionService]);
    injector.add([WorksheetPermissionService]);
    injector.add([RefRangeService]);
    injector.add([SheetTableSelectionController]);
    injector.add([IExclusiveRangeService, { useClass: ExclusiveRangeService }]);
    injector.add([SheetRangeThemeModel]);
    injector.add([SheetRangeThemeService]);
    injector.add([ZebraCrossingCacheController]);
    injector.add([ISheetRowFilteredService, { useClass: SheetRowFilteredService }]);
    injector.add([IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }]);
    injector.add([ISuperTableService, { useClass: SuperTableService }]);
    injector.add([ICalculateFormulaService, { useClass: CalculateFormulaService }]);
    injector.add([FormulaDataModel]);
    injector.add([LexerTreeBuilder]);
    injector.add([IDefinedNamesService, { useClass: DefinedNamesService }]);
    injector.add([IHyperlinkEngineFormulaService, { useClass: HyperlinkEngineFormulaService }]);
    injector.add([IFormulaRuntimeService, { useClass: FormulaRuntimeService }]);
    injector.add([IFormulaCurrentConfigService, { useClass: FormulaCurrentConfigService }]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([SheetSkeletonService]);
    injector.add([IMarkSelectionService, { useClass: MarkSelectionService }]);
    injector.add([ISheetClipboardService, { useClass: SheetClipboardService }]);
    injector.add([SheetClipboardController]);
    injector.add([IClipboardInterfaceService, { useValue: clipboard }]);
    injector.add([IPlatformService, { useClass: PlatformService }]);
    injector.add([INotificationService, { useValue: { show: () => ({ dispose() {} }) } }]);
    injector.add([IMessageService, { useValue: {
        show: () => ({ dispose() {} }),
        remove() {},
        removeAll() {},
    } }]);
    const plugin = injector.createInstance(UniverSheetsTablePlugin, {});
    plugin.onStarting();
    injector.get(SheetInterceptorService);
    const sheet = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, data);
    injector.get(IUniverInstanceService).focusUnit('test');
    const commands = injector.get(ICommandService);
    commands.registerCommand(SetSuperTableMutation);
    commands.registerCommand(RemoveSuperTableMutation);
    plugin.onReady();
    injector.get(SheetClipboardController);
    return { univer, sheet, get: injector.get.bind(injector) };
}

function expandTableSelection(bed: ReturnType<typeof createClipboardTestBed>) {
    const range = bed.get(SheetsSelectionsService).getCurrentLastSelection()!.range;
    const mutations = bed.get(SheetInterceptorService).onCommandExecute({ id: SelectAllCommand.id, params: { range } });
    for (const mutation of mutations.redos) {
        bed.get(ICommandService).syncExecuteCommand(mutation.id, mutation.params);
    }
}

describe('Table selection and clipboard interaction', () => {
    let bed: ReturnType<typeof createClipboardTestBed>;

    beforeEach(() => {
        bed = createClipboardTestBed();
        const { get } = bed;
        const locale = get(LocaleService);
        locale.load({ enUS });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        get(WorkbookPermissionService);
        get(WorksheetPermissionService);
        get(SheetTableSelectionController);
        const commands = get(ICommandService);
        [
            MoveRangeMutation,
            SetSelectionsOperation,
            SetRangeValuesMutation,
            SetWorksheetActiveOperation,
            SetWorksheetColWidthMutation,
            SetWorksheetRowAutoHeightMutation,
            SetWorksheetRowHeightMutation,
            AddWorksheetMergeMutation,
            RemoveWorksheetMergeMutation,
        ].forEach((command) => commands.registerCommand(command));
        get(TableManager).addTable('test', 'sheet1', 'Orders', TABLE_RANGE, ['Name', 'Amount', 'Tax'], 'orders');
        get(SheetsSelectionsService).setSelections('test', 'sheet1', [{
            range: { startRow: 3, endRow: 3, startColumn: 1, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
            primary: null,
            style: null,
        }]);
    });

    afterEach(() => bed.univer.dispose());

    it('selects the table body first, then includes the header', () => {
        const selections = bed.get(SheetsSelectionsService);
        expandTableSelection(bed);
        expect(selections.getCurrentLastSelection()!.range).toEqual({ ...TABLE_RANGE, startRow: 3 });
        expandTableSelection(bed);
        expect(selections.getCurrentLastSelection()!.range).toEqual(TABLE_RANGE);
    });

    it.each(['sheet1', 'sheet2'])('cuts a fully selected table to %s with one undo step', async (sheetId) => {
        const commands = bed.get(ICommandService);
        expandTableSelection(bed);
        expandTableSelection(bed);
        const manager = bed.get(TableManager);
        const table = manager.getTableById('test', 'orders')!;
        const before = Tools.deepClone(table.toJSON());
        const source = bed.sheet.getSheetBySheetId('sheet1')!;
        const values = source.getRange(2, 1, 5, 3).getValues();
        const clipboard = bed.get(ISheetClipboardService);
        expect(await clipboard.cut()).toBe(true);
        const copyId = clipboard.copyContentCache().getLastCopyId()!;
        const range = { startRow: 10, endRow: 13, startColumn: 5, endColumn: 7 };
        expect(await clipboard.pasteByCopyId(copyId, undefined, {
            unitId: 'test',
            subUnitId: sheetId,
            range,
        })).toBe(true);
        expect(manager.getTableById('test', 'orders')).toBe(table);
        expect(table.toJSON()).toEqual({ ...before, range });
        expect(table.getSubunitId()).toBe(sheetId);
        expect(bed.sheet.getSheetBySheetId(sheetId)!.getRange(10, 5, 13, 7).getValues()).toEqual(values);
        expect(source.getCellRaw(3, 1)).toBeUndefined();
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(table.getSubunitId()).toBe('sheet1');
        expect(table.toJSON()).toEqual(before);
        expect(source.getRange(2, 1, 5, 3).getValues()).toEqual(values);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(table.toJSON()).toEqual({ ...before, range });
        expect(table.getSubunitId()).toBe(sheetId);
    });

    it('cuts the table body across sheets as ordinary cells and keeps the table definition in place', async () => {
        expandTableSelection(bed);
        const before = Tools.deepClone(bed.sheet.getSnapshot());
        const table = bed.get(TableManager).getTableById('test', 'orders')!;
        const tableBefore = Tools.deepClone(table.toJSON());
        const source = bed.sheet.getSheetBySheetId('sheet1')!;
        const values = source.getRange(3, 1, 5, 3).getValues();
        const clipboard = bed.get(ISheetClipboardService);
        expect(await clipboard.cut()).toBe(true);
        const copyId = clipboard.copyContentCache().getLastCopyId()!;
        expect(await clipboard.pasteByCopyId(copyId, undefined, {
            unitId: 'test',
            subUnitId: 'sheet2',
            range: { startRow: 10, endRow: 12, startColumn: 5, endColumn: 7 },
        })).toBe(true);
        expect(bed.sheet.getSheetBySheetId('sheet2')!.getRange(10, 5, 12, 7).getValues()).toEqual(values);
        expect(source.getCellRaw(3, 1)).toBeUndefined();
        expect(source.getCellRaw(2, 1)?.v).toBe('Name');
        expect(table.toJSON()).toEqual(tableBefore);
        expect(table.getSubunitId()).toBe('sheet1');
        expect(await bed.get(ICommandService).executeCommand(UndoCommand.id)).toBe(true);
        expect(bed.sheet.getSnapshot()).toEqual(before);
        expect(table.toJSON()).toEqual(tableBefore);
    });
});
