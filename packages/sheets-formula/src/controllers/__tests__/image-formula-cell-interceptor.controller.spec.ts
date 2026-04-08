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
import type { IImageFormulaInfo } from '@univerjs/engine-formula';
import { CellValueType, ICommandService, InterceptorEffectEnum, LocaleType, ObjectMatrix } from '@univerjs/core';
import { ErrorType, FormulaDataModel, SetImageFormulaDataMutation } from '@univerjs/engine-formula';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFacadeTestBed } from '../../facade/__tests__/create-test-bed';
import { ImageFormulaCellInterceptorController } from '../image-formula-cell-interceptor.controller';

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
                cellData: {},
            },
        },
        styles: {},
    };
}

function createControllerTestBed() {
    const dependencies: Dependency[] = [[ImageFormulaCellInterceptorController]];

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

async function waitForAssertion(assertion: () => void, timeout = 1000, interval = 10) {
    const start = Date.now();

    while (Date.now() - start < timeout) {
        try {
            assertion();
            return;
        } catch {
            await new Promise((resolve) => setTimeout(resolve, interval));
        }
    }

    assertion();
}

describe('ImageFormulaCellInterceptorController', () => {
    let testBed: ReturnType<typeof createControllerTestBed>;
    let controller: ImageFormulaCellInterceptorController;
    let commandService: ICommandService;
    let formulaDataModel: FormulaDataModel;
    let interceptorService: SheetInterceptorService;
    let workbook: Workbook;
    let worksheet: Worksheet;

    beforeEach(() => {
        testBed = createControllerTestBed();
        commandService = testBed.injector.get(ICommandService);
        commandService.registerCommand(SetImageFormulaDataMutation);
        controller = testBed.injector.get(ImageFormulaCellInterceptorController);
        formulaDataModel = testBed.injector.get(FormulaDataModel);
        interceptorService = testBed.injector.get(SheetInterceptorService);
        workbook = testBed.sheet as Workbook;
        worksheet = workbook.getActiveSheet()!;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        testBed?.univer.dispose();
    });

    it('hydrates natural image size from mutation data and injects a document snapshot into cell content', async () => {
        const refreshRender = vi.fn();

        class MockImage {
            width = 320;
            height = 240;
            private _src = '';
            onload: null | (() => void) = null;
            onerror: null | (() => void) = null;

            get src() {
                return this._src;
            }

            set src(value: string) {
                this._src = value;
                if (value === 'https://img.test/success.png') {
                    queueMicrotask(() => this.onload?.());
                } else {
                    queueMicrotask(() => this.onerror?.());
                }
            }
        }

        vi.stubGlobal('Image', MockImage as unknown as typeof Image);
        controller.registerRefreshRenderFunction(refreshRender);

        await commandService.executeCommand(SetImageFormulaDataMutation.id, {
            imageFormulaData: [{
                unitId: 'test',
                sheetId: 'sheet1',
                row: 0,
                column: 0,
                source: 'https://img.test/success.png',
            }],
        });
        await waitForAssertion(() => {
            expect(formulaDataModel.getUnitImageFormulaData()?.test?.sheet1?.getValue(0, 0)).toMatchObject({
                source: 'https://img.test/success.png',
                imageNaturalWidth: 320,
                imageNaturalHeight: 240,
                isErrorImage: false,
            });
        });
        expect(refreshRender).toHaveBeenCalledTimes(1);
        expect(getInterceptedCell(worksheet, workbook, 0, 0, interceptorService)).toEqual(expect.objectContaining({
            p: expect.any(Object),
        }));
    });

    it('returns VALUE errors for failed images and ignores empty mutation payloads', async () => {
        const refreshRender = vi.fn();

        controller.registerRefreshRenderFunction(refreshRender);

        await commandService.executeCommand(SetImageFormulaDataMutation.id, {
            imageFormulaData: [],
        });
        expect(refreshRender).not.toHaveBeenCalled();

        const matrix = new ObjectMatrix<IImageFormulaInfo>();
        matrix.setValue(1, 1, {
            altText: '',
            sizing: 0,
            height: 0,
            width: 0,
            source: 'https://img.test/fail.png',
            isErrorImage: true,
        });
        formulaDataModel.mergeUnitImageFormulaData({
            test: {
                sheet1: matrix,
            },
        });

        expect(getInterceptedCell(worksheet, workbook, 1, 1, interceptorService)).toEqual({
            v: ErrorType.VALUE,
            t: CellValueType.STRING,
        });
    });
});
