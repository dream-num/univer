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

import type { ICommandInfo, Injector, IWorkbookData, Workbook } from '@univerjs/core';
import {
    CellValueType,
    CommandType,
    DEFAULT_TEXT_FORMAT_EXCEL,
    ICommandService,
    ILogService,
    IResourceManagerService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    RANGE_TYPE,
    RedoCommand,
    RegionService,
    SheetTypes,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { INumfmtService, SheetsSelectionsService, UniverSheetsPlugin } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getCurrencyFormat } from '../../../base/const/currency-symbols';
import { UniverSheetsNumfmtPlugin } from '../../../plugin';
import { AddDecimalCommand } from '../add-decimal.command';
import { SetCurrencyCommand } from '../set-currency.command';
import { SetNumfmtCommand } from '../set-numfmt.command';
import { SetPercentCommand } from '../set-percent.command';
import { SubtractDecimalCommand } from '../subtract-decimal.command';

const range = { startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 };

describe('Chart Sheet sheets-numfmt edit boundary', () => {
    let univer: Univer;
    let workbook: Workbook;
    let commands: ICommandService;
    let history: IUndoRedoService;
    let mutations: ICommandInfo[];
    let observer: { dispose(): void };

    beforeEach(() => {
        univer = new Univer();
        univer.registerPlugin(UniverFormulaEnginePlugin);
        univer.registerPlugin(UniverSheetsPlugin);
        univer.registerPlugin(UniverSheetsNumfmtPlugin);
        workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'feature-workbook',
            appVersion: '1.0.0',
            locale: LocaleType.EN_US,
            name: 'Feature boundary',
            sheetOrder: ['grid', 'chart', 'other'],
            styles: {},
            sheets: {
                grid: { id: 'grid', name: 'Grid', cellData: { 0: { 0: { v: 2 } }, 1: { 0: { v: 1 } } } },
                chart: { id: 'chart', name: 'Chart', type: SheetTypes.CHART, cellData: {} },
                other: { id: 'other', name: 'Other', type: SheetTypes.GANTT, cellData: { 0: { 0: { v: 5 } } } },
            },
        });
        const injector = univer.__getInjector();
        injector.get(IUniverInstanceService).focusUnit(workbook.getUnitId());
        commands = injector.get(ICommandService);
        history = injector.get(IUndoRedoService);
        mutations = [];
        observer = commands.onCommandExecuted((command) => {
            if (command.type === CommandType.MUTATION) {
                mutations.push(command);
            }
        });
    });

    afterEach(() => {
        observer.dispose();
        univer.dispose();
    });

    async function expectRefused(id: string, params?: object) {
        const before = JSON.parse(JSON.stringify(workbook.save()));
        const resources = JSON.parse(JSON.stringify(univer.__getInjector().get(IResourceManagerService).getResources(workbook.getUnitId(), UniverInstanceType.UNIVER_SHEET)));
        const undo = history.pitchTopUndoElement();
        const redo = history.pitchTopRedoElement();
        const count = mutations.length;
        expect(await commands.executeCommand(id, params)).toBe(false);
        expect(JSON.parse(JSON.stringify(workbook.save()))).toEqual(before);
        expect(univer.__getInjector().get(IResourceManagerService).getResources(workbook.getUnitId(), UniverInstanceType.UNIVER_SHEET)).toEqual(resources);
        expect(history.pitchTopUndoElement()).toBe(undo);
        expect(history.pitchTopRedoElement()).toBe(redo);
        expect(mutations).toHaveLength(count);
    }

    it('refuses explicit chart formats while Grid is active and edits an explicit Grid while Chart is active', async () => {
        await expectRefused(SetNumfmtCommand.id, { unitId: workbook.getUnitId(), subUnitId: 'chart', values: [{ row: 0, col: 0, pattern: '0.00' }] });
        workbook.setActiveSheet(workbook.getSheetBySheetId('chart')!);
        expect(await commands.executeCommand(SetNumfmtCommand.id, { unitId: workbook.getUnitId(), subUnitId: 'grid', values: [{ row: 0, col: 0, pattern: '0.00' }] })).toBe(true);
        expect(workbook.getSheetBySheetId('grid')!.getComposedCellStyle(0, 0).n?.pattern).toBe('0.00');
        expect(workbook.getSheetBySheetId('chart')!.getCellMatrix().getSizeOf()).toBe(0);
        expect(await commands.executeCommand(SetNumfmtCommand.id, {
            unitId: workbook.getUnitId(),
            subUnitId: 'other',
            values: [{ row: 0, col: 0, pattern: '0.0' }],
        })).toBe(true);
        expect(workbook.getSheetBySheetId('other')!.getComposedCellStyle(0, 0).n?.pattern).toBe('0.0');
    });

    it('refuses decimal, currency and percent shortcuts with a real selection on Chart', async () => {
        workbook.setActiveSheet(workbook.getSheetBySheetId('chart')!);
        univer.__getInjector().get(SheetsSelectionsService).setSelections(workbook.getUnitId(), 'chart', [{ range, primary: null, style: null }]);
        await expectRefused(AddDecimalCommand.id);
        await expectRefused(SubtractDecimalCommand.id);
        await expectRefused(SetCurrencyCommand.id);
        await expectRefused(SetPercentCommand.id);
    });
});

function createWorkbookData(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: ['sheet1'],
        styles: {
            textStyle: {
                n: {
                    pattern: DEFAULT_TEXT_FORMAT_EXCEL,
                },
            },
            twoDecimals: {
                n: {
                    pattern: '0.00',
                },
            },
        },
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'Sheet1',
                rowCount: 20,
                columnCount: 20,
                cellData: {
                    0: {
                        0: { v: 1.2, t: CellValueType.NUMBER },
                        1: { v: 123, t: CellValueType.STRING, s: 'textStyle' },
                        2: { v: 12, t: CellValueType.NUMBER },
                        3: { v: 0.375, t: CellValueType.NUMBER },
                        4: { v: 8, t: CellValueType.NUMBER },
                        5: { v: 1e21, t: CellValueType.NUMBER },
                        6: { v: 1.2345e31, t: CellValueType.NUMBER },
                    },
                    1: {
                        0: { v: 1.23, t: CellValueType.NUMBER, s: 'twoDecimals' },
                    },
                },
            },
        },
    };
}

function createCommandTestBed(workbookData: IWorkbookData = createWorkbookData()) {
    const univer = new Univer();
    univer.registerPlugin(UniverFormulaEnginePlugin);
    univer.registerPlugin(UniverSheetsPlugin);
    univer.registerPlugin(UniverSheetsNumfmtPlugin);
    const injector = univer.__getInjector();
    const sheet = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookData);
    const get = injector.get.bind(injector);
    get(IUniverInstanceService).focusUnit(sheet.getUnitId());
    get(LocaleService).setLocale(LocaleType.ZH_CN);
    get(LocaleService).setDirection('ltr');
    get(ILogService).setLogLevel(LogLevel.SILENT);

    return { univer, get, sheet };
}

describe('Sheets numfmt commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let selectionService: SheetsSelectionsService;
    let numfmtService: INumfmtService;
    let workbook: Workbook;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;
        workbook = testBed.sheet;

        commandService = get(ICommandService);
        selectionService = get(SheetsSelectionsService);
        numfmtService = get(INumfmtService);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('sets and removes number formats through SetNumfmtCommand and supports undo/redo', async () => {
        const sheet = workbook.getActiveSheet();

        await expect(commandService.executeCommand(SetNumfmtCommand.id, {
            values: [
                { row: 0, col: 0, pattern: DEFAULT_TEXT_FORMAT_EXCEL },
                { row: 0, col: 1 },
            ],
        })).resolves.toBe(true);

        expect(numfmtService.getValue('test', 'sheet1', 0, 0)).toEqual({ pattern: DEFAULT_TEXT_FORMAT_EXCEL });
        expect(numfmtService.getValue('test', 'sheet1', 0, 1)).toBeNull();
        expect(sheet.getCellRaw(0, 0)?.t).toBe(CellValueType.NUMBER);
        expect(sheet.getCellRaw(0, 1)).toMatchObject({ v: 123, t: CellValueType.NUMBER });

        await expect(commandService.executeCommand(UndoCommand.id)).resolves.toBe(true);

        expect(numfmtService.getValue('test', 'sheet1', 0, 0)).toBeNull();
        expect(numfmtService.getValue('test', 'sheet1', 0, 1)).toEqual({ pattern: DEFAULT_TEXT_FORMAT_EXCEL });
        expect(sheet.getCellRaw(0, 1)).toMatchObject({ v: '123', t: CellValueType.STRING });

        await expect(commandService.executeCommand(RedoCommand.id)).resolves.toBe(true);

        expect(numfmtService.getValue('test', 'sheet1', 0, 0)).toEqual({ pattern: DEFAULT_TEXT_FORMAT_EXCEL });
        expect(numfmtService.getValue('test', 'sheet1', 0, 1)).toBeNull();
    });

    it('only allows general, text, and scientific formats for scientific notation numeric values', async () => {
        await expect(commandService.executeCommand(SetNumfmtCommand.id, {
            values: [{ row: 0, col: 5, pattern: '0.00' }],
        })).resolves.toBe(false);
        expect(numfmtService.getValue('test', 'sheet1', 0, 5)).toBeNull();

        await expect(commandService.executeCommand(SetNumfmtCommand.id, {
            values: [{ row: 0, col: 5, pattern: '0.00E+00' }],
        })).resolves.toBe(true);
        expect(numfmtService.getValue('test', 'sheet1', 0, 5)).toEqual({ pattern: '0.00E+00' });

        await expect(commandService.executeCommand(SetNumfmtCommand.id, {
            values: [{ row: 0, col: 5, pattern: DEFAULT_TEXT_FORMAT_EXCEL }],
        })).resolves.toBe(true);
        expect(numfmtService.getValue('test', 'sheet1', 0, 5)).toEqual({ pattern: DEFAULT_TEXT_FORMAT_EXCEL });

        await expect(commandService.executeCommand(SetNumfmtCommand.id, {
            values: [{ row: 0, col: 5 }],
        })).resolves.toBe(true);
        expect(numfmtService.getValue('test', 'sheet1', 0, 5)).toBeNull();
    });

    it('adds decimals to general scientific notation numeric values with a scientific format', async () => {
        selectionService.addSelections([
            {
                range: { startRow: 0, startColumn: 5, endRow: 0, endColumn: 5, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
        ]);

        await expect(commandService.executeCommand(AddDecimalCommand.id)).resolves.toBe(true);

        expect(numfmtService.getValue('test', 'sheet1', 0, 5)).toEqual({ pattern: '0.000E+00' });
    });

    it('adds decimals based on the current mantissa decimals for general scientific notation numeric values', async () => {
        selectionService.addSelections([
            {
                range: { startRow: 0, startColumn: 6, endRow: 0, endColumn: 6, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
        ]);

        await expect(commandService.executeCommand(AddDecimalCommand.id)).resolves.toBe(true);

        expect(numfmtService.getValue('test', 'sheet1', 0, 6)).toEqual({ pattern: '0.00000E+00' });
    });

    it('adds decimals to mixed general numbers without forcing regular numbers into scientific format', async () => {
        selectionService.addSelections([
            {
                range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
            {
                range: { startRow: 0, startColumn: 6, endRow: 0, endColumn: 6, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
        ]);

        await expect(commandService.executeCommand(AddDecimalCommand.id)).resolves.toBe(true);

        expect(numfmtService.getValue('test', 'sheet1', 0, 0)).toEqual({ pattern: '0.00000' });
        expect(numfmtService.getValue('test', 'sheet1', 0, 6)).toEqual({ pattern: '0.00000E+00' });
    });

    it('subtracts decimals from general scientific notation numeric values with a scientific format', async () => {
        selectionService.addSelections([
            {
                range: { startRow: 0, startColumn: 5, endRow: 0, endColumn: 5, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
        ]);

        await expect(commandService.executeCommand(SubtractDecimalCommand.id)).resolves.toBe(true);

        expect(numfmtService.getValue('test', 'sheet1', 0, 5)).toEqual({ pattern: '0.0E+00' });
    });

    it('subtracts decimals based on the current mantissa decimals for general scientific notation numeric values', async () => {
        selectionService.addSelections([
            {
                range: { startRow: 0, startColumn: 6, endRow: 0, endColumn: 6, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
        ]);

        await expect(commandService.executeCommand(SubtractDecimalCommand.id)).resolves.toBe(true);

        expect(numfmtService.getValue('test', 'sheet1', 0, 6)).toEqual({ pattern: '0.000E+00' });
    });

    it('adds and subtracts decimals based on selections and existing formats', async () => {
        selectionService.addSelections([
            {
                range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
            {
                range: { startRow: 1, startColumn: 0, endRow: 1, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
        ]);

        await expect(commandService.executeCommand(AddDecimalCommand.id)).resolves.toBe(true);

        expect(numfmtService.getValue('test', 'sheet1', 0, 0)).toEqual({ pattern: '0.000' });
        expect(numfmtService.getValue('test', 'sheet1', 1, 0)).toEqual({ pattern: '0.000' });

        await expect(commandService.executeCommand(SubtractDecimalCommand.id)).resolves.toBe(true);

        expect(numfmtService.getValue('test', 'sheet1', 0, 0)).toEqual({ pattern: '0.00' });
        expect(numfmtService.getValue('test', 'sheet1', 1, 0)).toEqual({ pattern: '0.00' });
    });

    it('subtracts decimals from raw numeric cells when no number format exists yet', async () => {
        selectionService.addSelections([
            {
                range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
        ]);

        await expect(commandService.executeCommand(SubtractDecimalCommand.id)).resolves.toBe(true);

        expect(numfmtService.getValue('test', 'sheet1', 0, 0)).toEqual({ pattern: '0' });
    });

    it('applies percent and currency formats to current selections', async () => {
        selectionService.addSelections([
            {
                range: { startRow: 0, startColumn: 3, endRow: 0, endColumn: 3, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
        ]);

        await expect(commandService.executeCommand(SetPercentCommand.id)).resolves.toBe(true);
        expect(numfmtService.getValue('test', 'sheet1', 0, 3)).toEqual({ pattern: '0%' });

        selectionService.addSelections([
            {
                range: { startRow: 0, startColumn: 4, endRow: 0, endColumn: 4, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
        ]);

        get(RegionService).setRegion(LocaleType.FR_FR);
        await expect(commandService.executeCommand(SetCurrencyCommand.id)).resolves.toBe(true);
        expect(numfmtService.getValue('test', 'sheet1', 0, 4)).toEqual({
            pattern: getCurrencyFormat(LocaleType.FR_FR),
        });
    });

    it('returns false for quick commands when there is no current selection', async () => {
        await expect(commandService.executeCommand(AddDecimalCommand.id)).resolves.toBe(false);
        await expect(commandService.executeCommand(SubtractDecimalCommand.id)).resolves.toBe(false);
        await expect(commandService.executeCommand(SetPercentCommand.id)).resolves.toBe(false);
        await expect(commandService.executeCommand(SetCurrencyCommand.id)).resolves.toBe(false);
    });
});
