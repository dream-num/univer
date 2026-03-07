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
    CellValueType,
    ICommandService,
    IConfigService,
    InterceptorEffectEnum,
    LocaleType,
} from '@univerjs/core';
import {
    FormulaDataModel,
    IDefinedNamesService,
    LexerTreeBuilder,
    SetArrayFormulaDataMutation,
    SetDefinedNameMutation,
    SetFormulaCalculationResultMutation,
} from '@univerjs/engine-formula';
import { INTERCEPTOR_POINT, SetRangeValuesMutation, SheetInterceptorService } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFacadeTestBed } from '../../facade/__tests__/create-test-bed';
import { ArrayFormulaCellInterceptorController } from '../array-formula-cell-interceptor.controller';
import { PLUGIN_CONFIG_KEY_BASE } from '../config.schema';

function createWorkbookData(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'test',
        sheetOrder: ['sheet1'],
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'Sheet1',
                rowCount: 20,
                columnCount: 20,
                cellData: {
                    1: {
                        1: { v: '1.2300000000000002', t: CellValueType.NUMBER },
                    },
                    2: {
                        2: { v: 'stale', t: CellValueType.STRING },
                    },
                    3: {
                        0: { f: '=SUM(A1)' },
                        1: { f: '=SUM(A1)' },
                        2: { f: '=SKIP()', x: 1 } as unknown as never,
                    },
                },
            },
        },
        styles: {},
    };
}

function createControllerTestBed() {
    const dependencies: Dependency[] = [[ArrayFormulaCellInterceptorController]];

    return createFacadeTestBed(createWorkbookData(), dependencies);
}

function getInterceptedCell(worksheet: Worksheet, workbook: Workbook, row: number, col: number, interceptorService: SheetInterceptorService) {
    const rawData = worksheet.getCellRaw(row, col);

    return interceptorService.fetchThroughInterceptors(INTERCEPTOR_POINT.CELL_CONTENT, InterceptorEffectEnum.Value)(
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

describe('ArrayFormulaCellInterceptorController', () => {
    let testBed: ReturnType<typeof createControllerTestBed>;
    let commandService: ICommandService;
    let configService: IConfigService;
    let formulaDataModel: FormulaDataModel;
    let interceptorService: SheetInterceptorService;
    let workbook: Workbook;
    let worksheet: Worksheet;

    beforeEach(() => {
        testBed = createControllerTestBed();
        commandService = testBed.injector.get(ICommandService);
        configService = testBed.injector.get(IConfigService);
        formulaDataModel = testBed.injector.get(FormulaDataModel);
        interceptorService = testBed.injector.get(SheetInterceptorService);
        workbook = testBed.sheet as Workbook;
        worksheet = workbook.getActiveSheet()!;

        commandService.registerCommand(SetArrayFormulaDataMutation);
        commandService.registerCommand(SetDefinedNameMutation);
        commandService.registerCommand(SetFormulaCalculationResultMutation);
        commandService.registerCommand(SetRangeValuesMutation);

        testBed.injector.get(ArrayFormulaCellInterceptorController);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        testBed?.univer.dispose();
    });

    it('should sync array formula data to the model and write snapshot refs when configured', async () => {
        configService.setConfig(PLUGIN_CONFIG_KEY_BASE, { writeArrayFormulaToSnapshot: true });

        const executeCommandSpy = vi.spyOn(commandService, 'executeCommand');

        const arrayFormulaRange = {
            test: {
                sheet1: {
                    0: {
                        0: {
                            startRow: 0,
                            endRow: 1,
                            startColumn: 0,
                            endColumn: 1,
                        },
                    },
                },
            },
        };
        const arrayFormulaEmbedded = {
            test: {
                sheet1: {
                    0: {
                        0: {},
                        2: {},
                    },
                },
            },
        };
        const arrayFormulaCellData = {
            test: {
                sheet1: {
                    0: {
                        0: { v: 1, t: CellValueType.NUMBER },
                        1: { v: 2, t: CellValueType.NUMBER },
                    },
                },
            },
        };

        await commandService.executeCommand(SetArrayFormulaDataMutation.id, {
            arrayFormulaRange,
            arrayFormulaEmbedded,
            arrayFormulaCellData,
        });

        expect(formulaDataModel.getArrayFormulaRange()).toEqual(arrayFormulaRange);
        expect(formulaDataModel.getArrayFormulaCellData()).toEqual(arrayFormulaCellData);

        const setRangeValuesCalls = executeCommandSpy.mock.calls.filter(([id]) => id === SetRangeValuesMutation.id);

        expect(setRangeValuesCalls).toHaveLength(3);
        expect(setRangeValuesCalls[0]?.[1]).toMatchObject({
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: {
                0: {
                    0: { ref: 'A1:B2' },
                },
            },
        });
        expect(setRangeValuesCalls[1]?.[1]).toMatchObject({
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: {
                0: {
                    2: { ref: 'C1' },
                },
            },
        });
        expect(setRangeValuesCalls[2]?.[1]).toMatchObject({
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: arrayFormulaCellData.test.sheet1,
        });
    });

    it('should add prefixed formulas for workbook cells and defined names when calculation results arrive', async () => {
        configService.setConfig(PLUGIN_CONFIG_KEY_BASE, { writeArrayFormulaToSnapshot: true });

        const definedNamesService = testBed.injector.get(IDefinedNamesService);
        const lexerTreeBuilder = testBed.injector.get(LexerTreeBuilder);
        const executeCommandSpy = vi.spyOn(commandService, 'executeCommand');
        const prefixSpy = vi
            .spyOn(lexerTreeBuilder, 'getNewFormulaWithPrefix')
            .mockImplementation((formula) => `PREFIX:${formula}`);

        definedNamesService.registerDefinedNames('test', {
            formulaName: {
                id: 'formula-name',
                name: 'FORMULA_NAME',
                formulaOrRefString: '=SUM(A1)',
                localSheetId: 'AllDefaultWorkbook',
                comment: '',
            },
            refName: {
                id: 'ref-name',
                name: 'REF_NAME',
                formulaOrRefString: 'Sheet1!$A$1',
                localSheetId: 'AllDefaultWorkbook',
                comment: '',
            },
        });

        await commandService.executeCommand(SetFormulaCalculationResultMutation.id, {
            unitData: {},
            unitOtherData: {},
        });

        const setRangeValuesCalls = executeCommandSpy.mock.calls.filter(([id]) => id === SetRangeValuesMutation.id);
        const setDefinedNameCalls = executeCommandSpy.mock.calls.filter(([id]) => id === SetDefinedNameMutation.id);

        expect(prefixSpy).toHaveBeenCalledWith('=SUM(A1)', expect.any(Function));
        expect(prefixSpy).toHaveBeenCalledWith('=SKIP()', expect.any(Function));
        expect(setRangeValuesCalls.at(-1)?.[1]).toMatchObject({
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: {
                3: {
                    0: { xf: 'PREFIX:=SUM(A1)' },
                    1: { xf: 'PREFIX:=SUM(A1)' },
                },
            },
        });
        expect(setDefinedNameCalls).toContainEqual([
            SetDefinedNameMutation.id,
            expect.objectContaining({
                unitId: 'test',
                name: 'FORMULA_NAME',
                formulaOrRefStringWithPrefix: 'PREFIX:=SUM(A1)',
            }),
            expect.objectContaining({
                onlyLocal: true,
                fromFormula: true,
            }),
        ]);
    });

    it('should intercept array formula cells with default values, precision cleanup, raw passthrough and array values', () => {
        formulaDataModel.setArrayFormulaCellData({
            test: {
                sheet1: {
                    0: {
                        0: { v: null, t: null },
                    },
                    1: {
                        1: { v: 99, t: CellValueType.NUMBER },
                    },
                    2: {
                        2: { v: 7, t: CellValueType.NUMBER },
                    },
                },
            },
        });

        expect(getInterceptedCell(worksheet, workbook, 0, 0, interceptorService)).toEqual({
            v: 0,
            t: CellValueType.NUMBER,
        });
        expect(getInterceptedCell(worksheet, workbook, 1, 1, interceptorService)).toEqual({
            v: 1.23,
            t: CellValueType.NUMBER,
        });
        expect(getInterceptedCell(worksheet, workbook, 2, 2, interceptorService)).toEqual({
            v: 7,
            t: CellValueType.NUMBER,
        });
        expect(getInterceptedCell(worksheet, workbook, 4, 4, interceptorService)).toBeUndefined();
    });
});
