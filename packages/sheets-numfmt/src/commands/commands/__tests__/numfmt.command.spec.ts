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

import type { Dependency, IWorkbookData, Injector as RediInjector, Workbook } from '@univerjs/core';
import {
    CellValueType,
    DEFAULT_TEXT_FORMAT_EXCEL,
    ICommandService,
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    Plugin,
    RANGE_TYPE,
    RedoCommand,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    INumfmtService,
    NumfmtService,
    RemoveNumfmtMutation,
    SetNumfmtMutation,
    SetRangeValuesMutation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getCurrencyFormat } from '../../../base/const/currency-symbols';
import { AddDecimalCommand } from '../add-decimal.command';
import { SetCurrencyCommand } from '../set-currency.command';
import { SetNumfmtCommand } from '../set-numfmt.command';
import { SetPercentCommand } from '../set-percent.command';
import { SubtractDecimalCommand } from '../subtract-decimal.command';

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
                    },
                    1: {
                        0: { v: 1.23, t: CellValueType.NUMBER, s: 'twoDecimals' },
                    },
                },
            },
        },
    };
}

function createCommandTestBed(workbookData?: IWorkbookData) {
    const univer = new Univer();
    const injector = univer.__getInjector();

    class TestPlugin extends Plugin {
        static override pluginName = 'test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: RediInjector
        ) {
            super();
        }

        override onStarting(): void {
            const dependencies: Dependency[] = [
                [SheetsSelectionsService],
                [INumfmtService, { useClass: NumfmtService }],
            ];

            dependencies.forEach((dependency) => this._injector.add(dependency));
        }
    }

    univer.registerPlugin(TestPlugin);
    const sheet = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookData ?? createWorkbookData());

    const get = injector.get.bind(injector);
    get(IUniverInstanceService).focusUnit('test');
    get(LocaleService).setLocale(LocaleType.ZH_CN);
    get(ILogService).setLogLevel(LogLevel.SILENT);

    return {
        univer,
        get,
        sheet,
    };
}

describe('Sheets numfmt commands', () => {
    let univer: Univer;
    let get: RediInjector['get'];
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

        [
            SetRangeValuesMutation,
            SetNumfmtMutation,
            RemoveNumfmtMutation,
            SetNumfmtCommand,
            AddDecimalCommand,
            SubtractDecimalCommand,
            SetPercentCommand,
            SetCurrencyCommand,
        ].forEach((command) => {
            commandService.registerCommand(command);
        });
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

        await expect(commandService.executeCommand(SetCurrencyCommand.id)).resolves.toBe(true);
        expect(numfmtService.getValue('test', 'sheet1', 0, 4)).toEqual({
            pattern: getCurrencyFormat(LocaleType.ZH_CN),
        });
    });

    it('returns false for quick commands when there is no current selection', async () => {
        await expect(commandService.executeCommand(AddDecimalCommand.id)).resolves.toBe(false);
        await expect(commandService.executeCommand(SubtractDecimalCommand.id)).resolves.toBe(false);
        await expect(commandService.executeCommand(SetPercentCommand.id)).resolves.toBe(false);
        await expect(commandService.executeCommand(SetCurrencyCommand.id)).resolves.toBe(false);
    });
});
