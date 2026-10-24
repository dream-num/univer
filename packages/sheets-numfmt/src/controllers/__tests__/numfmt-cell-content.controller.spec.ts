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

import type { Dependency, IWorkbookData, Workbook, Worksheet } from '@univerjs/core';
import {
    cellToRange,
    CellValueType,
    DateSystem,
    ICommandService,
    IConfigService,
    ILogService,
    Inject,
    Injector,
    InterceptorEffectEnum,
    IUniverInstanceService,
    LocaleType,
    LogLevel,
    Plugin,
    ThemeService,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    INTERCEPTOR_POINT,
    INumfmtService,
    NumfmtService,
    SetNumfmtMutation,
    SetRangeValuesMutation,
    SheetInterceptorService,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SHEETS_NUMFMT_PLUGIN_CONFIG_KEY } from '../../config/config';
import { SheetsNumfmtCellContentController } from '../numfmt-cell-content.controller';

function createWorkbookData(
    id = 'test',
    locale = LocaleType.ZH_CN,
    dateSystem = DateSystem.Date1900
): IWorkbookData {
    return {
        id,
        appVersion: '3.0.0-alpha',
        locale,
        dateSystem,
        name: '',
        sheetOrder: ['sheet1', 'sheet2'],
        styles: {
            textStyle: {
                n: {
                    pattern: '@',
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
                        0: { v: true, t: CellValueType.BOOLEAN },
                        1: { v: '001', t: CellValueType.FORCE_STRING },
                        2: { v: 'text', t: CellValueType.STRING },
                    },
                    1: {
                        0: { v: '123', t: CellValueType.STRING, s: 'textStyle' },
                        1: { v: '1234.5', t: CellValueType.STRING },
                        2: { v: -12.3, t: CellValueType.NUMBER },
                        3: { v: '20%', t: CellValueType.STRING, s: 'textStyle' },
                        4: { v: 0, t: CellValueType.NUMBER },
                    },
                },
            },
            sheet2: {
                id: 'sheet2',
                name: 'Sheet2',
                rowCount: 20,
                columnCount: 20,
                cellData: {
                    1: {
                        1: { v: '9.9', t: CellValueType.STRING },
                    },
                },
            },
        },
    };
}

function createControllerTestBed(workbookData?: IWorkbookData) {
    const univer = new Univer();
    const injector = univer.__getInjector();

    class TestPlugin extends Plugin {
        static override pluginName = 'test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            const dependencies: Dependency[] = [
                [SheetInterceptorService],
                [INumfmtService, { useClass: NumfmtService }],
                [SheetsNumfmtCellContentController],
            ];

            dependencies.forEach((dependency) => this._injector.add(dependency));
        }
    }

    univer.registerPlugin(TestPlugin);
    const sheet = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookData ?? createWorkbookData());

    const get = injector.get.bind(injector);
    get(IUniverInstanceService).focusUnit('test');
    get(ILogService).setLogLevel(LogLevel.SILENT);

    return {
        univer,
        get,
        sheet,
    };
}

function getInterceptedCell(worksheet: Worksheet, workbook: Workbook, row: number, col: number, get: Injector['get']) {
    const interceptorService = get(SheetInterceptorService);
    const rawData = worksheet.getCellRaw(row, col);

    return interceptorService.fetchThroughInterceptors(INTERCEPTOR_POINT.CELL_CONTENT, InterceptorEffectEnum.Style | InterceptorEffectEnum.Value)(
        rawData,
        {
            unitId: workbook.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            row,
            col,
            worksheet,
            workbook,
            rawData,
        }
    );
}

describe('SheetsNumfmtCellContentController', () => {
    let univer: Univer;
    let get: Injector['get'];
    let workbook: Workbook;
    let commandService: ICommandService;
    let numfmtService: INumfmtService;

    beforeEach(() => {
        const testBed = createControllerTestBed();
        univer = testBed.univer;
        get = testBed.get;
        workbook = testBed.sheet;

        commandService = get(ICommandService);
        numfmtService = get(INumfmtService);

        commandService.registerCommand(SetNumfmtMutation);
        commandService.registerCommand(SetRangeValuesMutation);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('skips unsupported cells and handles text format markers', () => {
        get(SheetsNumfmtCellContentController);
        const worksheet = workbook.getSheetBySheetId('sheet1')!;

        expect(getInterceptedCell(worksheet, workbook, 0, 0, get)).toEqual({ v: true, t: CellValueType.BOOLEAN });
        expect(getInterceptedCell(worksheet, workbook, 0, 1, get)).toEqual({ v: '001', t: CellValueType.FORCE_STRING });
        expect(getInterceptedCell(worksheet, workbook, 0, 2, get)).toEqual({ v: 'text', t: CellValueType.STRING });

        expect(getInterceptedCell(worksheet, workbook, 1, 0, get)).toEqual({
            v: '123',
            t: CellValueType.STRING,
            s: 'textStyle',
            markers: {
                tl: {
                    size: 6,
                    color: '#409f11',
                },
            },
        });

        expect(getInterceptedCell(worksheet, workbook, 1, 3, get)).toEqual({
            v: '20%',
            t: CellValueType.STRING,
            s: 'textStyle',
            markers: {
                tl: {
                    size: 6,
                    color: '#409f11',
                },
            },
        });

        get(IConfigService).setConfig(SHEETS_NUMFMT_PLUGIN_CONFIG_KEY, { disableTextFormatMark: true });

        expect(getInterceptedCell(worksheet, workbook, 1, 0, get)).toEqual({
            v: '123',
            t: CellValueType.STRING,
            s: 'textStyle',
        });
        expect(getInterceptedCell(worksheet, workbook, 1, 3, get)).toEqual({
            v: '20%',
            t: CellValueType.STRING,
            s: 'textStyle',
        });
    });

    it('formats numeric values and clears render cache on numfmt or value mutations', async () => {
        get(SheetsNumfmtCellContentController);
        const worksheet = workbook.getSheetBySheetId('sheet1')!;

        numfmtService.setValues('test', 'sheet1', [
            { pattern: '0.00', ranges: [cellToRange(1, 1)] },
            { pattern: '[Red]0.00', ranges: [cellToRange(1, 2)] },
        ]);

        const firstFormatted = getInterceptedCell(worksheet, workbook, 1, 1, get);
        expect(firstFormatted).toMatchObject({ v: '1234.50', t: CellValueType.NUMBER });
        expect(worksheet.getCellRaw(1, 1)).toMatchObject({ v: '1234.5', t: CellValueType.STRING });

        const negativeFormatted = getInterceptedCell(worksheet, workbook, 1, 2, get);
        expect(negativeFormatted).toMatchObject({
            v: '-12.30',
            t: CellValueType.NUMBER,
            interceptorStyle: {
                cl: {
                    rgb: expect.any(String),
                },
            },
        });

        await commandService.executeCommand(SetNumfmtMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            refMap: {
                1: {
                    pattern: '0.0',
                },
            },
            values: {
                1: {
                    ranges: [cellToRange(1, 1)],
                },
            },
        });

        expect(getInterceptedCell(worksheet, workbook, 1, 1, get)).toMatchObject({ v: '1234.5' });

        await commandService.executeCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: {
                1: {
                    1: {
                        v: '42',
                        t: CellValueType.STRING,
                    },
                },
            },
        });

        expect(getInterceptedCell(worksheet, workbook, 1, 1, get)).toMatchObject({ v: '42.0' });
    });

    it('updates section colors after value and format edits while preserving the raw font color', async () => {
        get(SheetsNumfmtCellContentController);
        const worksheet = workbook.getSheetBySheetId('sheet1')!;
        const themeService = get(ThemeService);
        const originalStyle = { cl: { rgb: '#663399' } };

        numfmtService.setValues('test', 'sheet1', [{
            pattern: '[Red]0.00;[Green]\\-0.00;[Blue]0.00',
            ranges: [cellToRange(1, 1)],
        }]);

        for (const { value, color } of [
            { value: 12.34, color: 'red' },
            { value: -12.34, color: 'green' },
            { value: 0, color: 'blue' },
        ]) {
            await commandService.executeCommand(SetRangeValuesMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                cellValue: { 1: { 1: { v: value, t: CellValueType.NUMBER, s: originalStyle } } },
            });

            expect(getInterceptedCell(worksheet, workbook, 1, 1, get)).toMatchObject({
                v: value.toFixed(2),
                interceptorStyle: { cl: { rgb: themeService.getColorFromTheme(`${color}.500`) } },
            });
            expect(worksheet.getCellRaw(1, 1)).toMatchObject({ v: value });
            expect(workbook.getStyles().get(worksheet.getCellRaw(1, 1)?.s)).toMatchObject(originalStyle);
        }

        await commandService.executeCommand(SetNumfmtMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            refMap: { 1: { pattern: '0.00' } },
            values: { 1: { ranges: [cellToRange(1, 1)] } },
        });

        const cell = getInterceptedCell(worksheet, workbook, 1, 1, get);
        expect(cell).toMatchObject({ v: '0.00' });
        expect(cell?.interceptorStyle).toBeUndefined();
        expect(workbook.getStyles().get(cell?.s)).toMatchObject(originalStyle);
    });

    it('formats each workbook with its own locale and date system', () => {
        get(SheetsNumfmtCellContentController);
        const date1900Sheet = workbook.getSheetBySheetId('sheet1')!;
        const date1904Workbook = univer.createUnit<IWorkbookData, Workbook>(
            UniverInstanceType.UNIVER_SHEET,
            createWorkbookData('date1904', LocaleType.FR_FR, DateSystem.Date1904)
        );
        const date1904Sheet = date1904Workbook.getSheetBySheetId('sheet1')!;

        numfmtService.setValues('test', 'sheet1', [{ pattern: 'yyyy-mm-dd', ranges: [cellToRange(1, 4)] }]);
        numfmtService.setValues('date1904', 'sheet1', [{ pattern: 'yyyy-mm-dd', ranges: [cellToRange(1, 4)] }]);

        expect(getInterceptedCell(date1900Sheet, workbook, 1, 4, get)).toMatchObject({ v: '1900-01-00' });
        expect(getInterceptedCell(date1904Sheet, date1904Workbook, 1, 4, get)).toMatchObject({ v: '1904-01-01' });
    });

    it('preserves a legitimate empty number-format result across renders', () => {
        get(SheetsNumfmtCellContentController);
        const worksheet = workbook.getSheetBySheetId('sheet1')!;

        numfmtService.setValues('test', 'sheet1', [{ pattern: ';;;', ranges: [cellToRange(1, 1)] }]);

        const formattedCell = getInterceptedCell(worksheet, workbook, 1, 1, get);
        expect(formattedCell).toMatchObject({
            v: '',
            t: CellValueType.NUMBER,
            coverable: false,
        });
        expect(worksheet.getCellRaw(1, 1)).toMatchObject({ v: '1234.5', t: CellValueType.STRING });

        expect(getInterceptedCell(worksheet, workbook, 1, 1, get)).toEqual(formattedCell);
    });

    it('formats sheets independently and applies locale overrides after switching sheets', () => {
        const controller = get(SheetsNumfmtCellContentController);
        const sheet1 = workbook.getSheetBySheetId('sheet1')!;
        const sheet2 = workbook.getSheetBySheetId('sheet2')!;

        numfmtService.setValues('test', 'sheet1', [{ pattern: '0.00', ranges: [cellToRange(1, 1)] }]);
        numfmtService.setValues('test', 'sheet2', [{ pattern: '0.0', ranges: [cellToRange(1, 1)] }]);

        expect(getInterceptedCell(sheet1, workbook, 1, 1, get)).toMatchObject({ v: '1234.50', t: CellValueType.NUMBER });
        workbook.setActiveSheet(sheet2);
        expect(getInterceptedCell(sheet2, workbook, 1, 1, get)).toMatchObject({ v: '9.9' });

        workbook.setActiveSheet(sheet1);

        expect(getInterceptedCell(sheet1, workbook, 1, 1, get)).toMatchObject({ v: '1234.50' });

        controller.setNumfmtLocal('fr');
        expect(getInterceptedCell(sheet1, workbook, 1, 1, get)).toMatchObject({ v: '1234,50' });
        expect(getInterceptedCell(sheet2, workbook, 1, 1, get)).toMatchObject({ v: '9,9' });
    });
});
