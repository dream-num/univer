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

import type { Dependency, Injector, IWorkbookData, Workbook, Worksheet } from '@univerjs/core';
import {
    cellToRange,
    CellValueType,
    ICommandService,
    IConfigService,
    ILogService,
    Inject,
    InterceptorEffectEnum,
    IUniverInstanceService,
    LocaleType,
    LogLevel,
    Plugin,
    Injector as RediInjector,
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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as patternUtils from '../../utils/pattern';
import { SHEETS_NUMFMT_PLUGIN_CONFIG_KEY } from '../config.schema';
import { SheetsNumfmtCellContentController } from '../numfmt-cell-content.controller';

function createWorkbookData(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.ZH_CN,
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
            @Inject(RediInjector) override readonly _injector: Injector
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
    let controller: SheetsNumfmtCellContentController;

    beforeEach(() => {
        const testBed = createControllerTestBed();
        univer = testBed.univer;
        get = testBed.get;
        workbook = testBed.sheet;

        commandService = get(ICommandService);
        numfmtService = get(INumfmtService);
        controller = get(SheetsNumfmtCellContentController);

        commandService.registerCommand(SetNumfmtMutation);
        commandService.registerCommand(SetRangeValuesMutation);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        univer.dispose();
    });

    it('skips unsupported cells and handles text format markers', () => {
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

        get(IConfigService).setConfig(SHEETS_NUMFMT_PLUGIN_CONFIG_KEY, { disableTextFormatMark: true });

        expect(getInterceptedCell(worksheet, workbook, 1, 0, get)).toEqual({
            v: '123',
            t: CellValueType.STRING,
            s: 'textStyle',
        });
    });

    it('formats numeric values and clears render cache on numfmt or value mutations', async () => {
        const worksheet = workbook.getSheetBySheetId('sheet1')!;
        const previewSpy = vi.spyOn(patternUtils, 'getPatternPreviewIgnoreGeneral');

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

        const previewCallsAfterFirstRender = previewSpy.mock.calls.length;

        getInterceptedCell(worksheet, workbook, 1, 1, get);
        expect(previewSpy).toHaveBeenCalledTimes(previewCallsAfterFirstRender);

        await commandService.executeCommand(SetNumfmtMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            refMap: {
                1: {
                    pattern: '0.00',
                },
            },
            values: {
                1: {
                    ranges: [cellToRange(1, 1)],
                },
            },
        });

        getInterceptedCell(worksheet, workbook, 1, 1, get);
        expect(previewSpy).toHaveBeenCalledTimes(previewCallsAfterFirstRender + 1);

        await commandService.executeCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: {
                1: {
                    1: {
                        v: '1234.5',
                        t: CellValueType.STRING,
                    },
                },
            },
        });

        getInterceptedCell(worksheet, workbook, 1, 1, get);
        expect(previewSpy).toHaveBeenCalledTimes(previewCallsAfterFirstRender + 2);
    });

    it('resets cached rendering when active sheet changes and supports locale override', () => {
        const sheet1 = workbook.getSheetBySheetId('sheet1')!;
        const sheet2 = workbook.getSheetBySheetId('sheet2')!;
        const previewSpy = vi.spyOn(patternUtils, 'getPatternPreviewIgnoreGeneral');

        numfmtService.setValues('test', 'sheet1', [{ pattern: '0.00', ranges: [cellToRange(1, 1)] }]);

        expect(getInterceptedCell(sheet1, workbook, 1, 1, get)).toMatchObject({ v: '1234.50', t: CellValueType.NUMBER });
        let previewCallCount = previewSpy.mock.calls.length;

        getInterceptedCell(sheet1, workbook, 1, 1, get);
        expect(previewSpy).toHaveBeenCalledTimes(previewCallCount);

        workbook.setActiveSheet(sheet2);

        getInterceptedCell(sheet1, workbook, 1, 1, get);
        previewCallCount += 1;
        expect(previewSpy).toHaveBeenCalledTimes(previewCallCount);

        workbook.setActiveSheet(sheet1);

        getInterceptedCell(sheet1, workbook, 1, 1, get);
        previewCallCount += 1;
        expect(previewSpy).toHaveBeenCalledTimes(previewCallCount);

        controller.setNumfmtLocal('fr');
        expect(controller.locale).toBe('fr');

        getInterceptedCell(sheet1, workbook, 1, 1, get);
        previewCallCount += 1;
        expect(previewSpy).toHaveBeenCalledTimes(previewCallCount);
    });
});
