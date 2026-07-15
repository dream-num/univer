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
    InterceptorEffectEnum,
    LocaleType,
} from '@univerjs/core';
import {
    FormulaDataModel,
    SetArrayFormulaDataMutation,
} from '@univerjs/engine-formula';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFacadeTestBed } from '../../facade/__tests__/create-test-bed';
import { ArrayFormulaCellInterceptorController } from '../array-formula-cell-interceptor.controller';

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
    let formulaDataModel: FormulaDataModel;
    let interceptorService: SheetInterceptorService;
    let workbook: Workbook;
    let worksheet: Worksheet;

    beforeEach(() => {
        testBed = createControllerTestBed();
        commandService = testBed.injector.get(ICommandService);
        formulaDataModel = testBed.injector.get(FormulaDataModel);
        interceptorService = testBed.injector.get(SheetInterceptorService);
        workbook = testBed.sheet as Workbook;
        worksheet = workbook.getActiveSheet()!;

        commandService.registerCommand(SetArrayFormulaDataMutation);

        testBed.injector.get(ArrayFormulaCellInterceptorController);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        testBed?.univer.dispose();
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
