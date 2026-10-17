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

import type { Dependency, IWorkbookData } from '@univerjs/core';
import { LocaleService, LocaleType, LogLevel, Univer } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { ErrorType, IDefinedNamesService, SetDefinedNameMutation } from '@univerjs/engine-formula';
import {
    MoveRangeCommand,
    RemoveDefinedNameCommand,
    RemoveSheetCommand,
    SCOPE_WORKBOOK_VALUE_DEFINED_NAME,
    SetDefinedNameCommand,
    SetWorksheetNameCommand,
    SheetInterceptorService,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFacadeTestBed } from '../../facade/__tests__/create-test-bed';
import { UniverSheetsFormulaPlugin } from '../../plugin';
import { UpdateDefinedNameController } from '../update-defined-name.controller';
import '@univerjs/engine-formula/facade';
import '@univerjs/sheets/facade';
import '../../facade';

function createWorkbookData(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'test',
        sheetOrder: ['sheet1', 'sheet2'],
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'Sheet1',
                cellData: {},
                rowCount: 20,
                columnCount: 20,
            },
            sheet2: {
                id: 'sheet2',
                name: 'Sheet2',
                cellData: {},
                rowCount: 20,
                columnCount: 20,
            },
        },
        styles: {},
    };
}

function createControllerTestBed() {
    const dependencies: Dependency[] = [[UpdateDefinedNameController]];

    return createFacadeTestBed(createWorkbookData(), dependencies);
}

describe('UpdateDefinedNameController', () => {
    let testBed: ReturnType<typeof createControllerTestBed>;

    beforeEach(() => {
        testBed = createControllerTestBed();

        const definedNamesService = testBed.injector.get(IDefinedNamesService);
        definedNamesService.registerDefinedNames('test', {
            rangeName: {
                id: 'range-name',
                name: 'RANGE_NAME',
                formulaOrRefString: 'Sheet1!$A$1:$B$2',
                localSheetId: SCOPE_WORKBOOK_VALUE_DEFINED_NAME,
                comment: '',
            },
            rowsName: {
                id: 'rows-name',
                name: 'ROWS_NAME',
                formulaOrRefString: 'Sheet1!$1:$3',
                localSheetId: SCOPE_WORKBOOK_VALUE_DEFINED_NAME,
                comment: '',
            },
            otherSheetName: {
                id: 'other-sheet-name',
                name: 'OTHER_SHEET_NAME',
                formulaOrRefString: 'Sheet2!$C$3',
                localSheetId: SCOPE_WORKBOOK_VALUE_DEFINED_NAME,
                comment: '',
            },
        });

        testBed.injector.get(UpdateDefinedNameController);
    });

    afterEach(() => {
        testBed?.univer.dispose();
    });

    it('should ignore commands that are handled by UpdateFormulaController', () => {
        const interceptorService = testBed.injector.get(SheetInterceptorService);

        const setDefinedNameResult = interceptorService.onCommandExecute({
            id: SetDefinedNameCommand.id,
            params: {
                unitId: 'test',
                id: 'temp',
                name: 'TEMP_NAME',
                formulaOrRefString: 'Sheet1!$A$1',
                localSheetId: SCOPE_WORKBOOK_VALUE_DEFINED_NAME,
            },
        });
        const removeDefinedNameResult = interceptorService.onCommandExecute({
            id: RemoveDefinedNameCommand.id,
            params: {
                unitId: 'test',
                id: 'range-name',
                name: 'RANGE_NAME',
            },
        });

        expect(setDefinedNameResult).toEqual({ redos: [], undos: [], preRedos: [], preUndos: [] });
        expect(removeDefinedNameResult).toEqual({ redos: [], undos: [], preRedos: [], preUndos: [] });
    });

    it('should generate undo and redo mutations for moved references', () => {
        const interceptorService = testBed.injector.get(SheetInterceptorService);

        const result = interceptorService.onCommandExecute({
            id: MoveRangeCommand.id,
            params: {
                fromRange: {
                    startRow: 0,
                    startColumn: 0,
                    endRow: 1,
                    endColumn: 1,
                    rangeType: 0,
                },
                toRange: {
                    startRow: 0,
                    startColumn: 3,
                    endRow: 1,
                    endColumn: 4,
                    rangeType: 0,
                },
            },
        });

        expect(result.redos).toContainEqual({
            id: SetDefinedNameMutation.id,
            params: expect.objectContaining({
                unitId: 'test',
                name: 'RANGE_NAME',
                formulaOrRefString: 'Sheet1!$D$1:$E$2',
            }),
        });
        expect(result.undos).toContainEqual({
            id: SetDefinedNameMutation.id,
            params: expect.objectContaining({
                unitId: 'test',
                name: 'RANGE_NAME',
                formulaOrRefString: 'Sheet1!$A$1:$B$2',
            }),
        });
    });

    it('should rename references on the targeted sheet and skip references on other sheets', () => {
        const interceptorService = testBed.injector.get(SheetInterceptorService);

        const result = interceptorService.onCommandExecute({
            id: SetWorksheetNameCommand.id,
            params: {
                subUnitId: 'sheet1',
                name: 'Sheet1Rename',
            },
        });

        expect(result.redos).toContainEqual({
            id: SetDefinedNameMutation.id,
            params: expect.objectContaining({
                name: 'RANGE_NAME',
                formulaOrRefString: 'Sheet1Rename!$A$1:$B$2',
            }),
        });
        expect(result.redos).toContainEqual({
            id: SetDefinedNameMutation.id,
            params: expect.objectContaining({
                name: 'ROWS_NAME',
                formulaOrRefString: 'Sheet1Rename!$1:$3',
            }),
        });
        expect(result.redos.find((mutation) => (mutation.params as { name?: string } | undefined)?.name === 'OTHER_SHEET_NAME')).toBeUndefined();
    });

    it('should turn references into REF errors when the referenced sheet is removed', () => {
        const interceptorService = testBed.injector.get(SheetInterceptorService);

        const result = interceptorService.onCommandExecute({
            id: RemoveSheetCommand.id,
            params: {
                unitId: 'test',
                subUnitId: 'sheet1',
            },
        });

        expect(result.redos).toContainEqual({
            id: SetDefinedNameMutation.id,
            params: expect.objectContaining({
                name: 'RANGE_NAME',
                formulaOrRefString: ErrorType.REF,
            }),
        });
        expect(result.redos).toContainEqual({
            id: SetDefinedNameMutation.id,
            params: expect.objectContaining({
                name: 'ROWS_NAME',
                formulaOrRefString: ErrorType.REF,
            }),
        });
        expect(result.redos.find((mutation) => (mutation.params as { name?: string } | undefined)?.name === 'OTHER_SHEET_NAME')).toBeUndefined();
    });
});

describe('defined name recalculation after sheet rename', () => {
    const instances: Univer[] = [];

    async function createCalculationTestBed() {
        const univer = new Univer({
            locale: LocaleType.EN_US,
            locales: { [LocaleType.EN_US]: {} },
            logLevel: LogLevel.SILENT,
        });
        instances.push(univer);
        const localeService = univer.__getInjector().get(LocaleService);
        localeService.setLocale(LocaleType.EN_US);
        localeService.setDirection('ltr');
        univer.registerPlugin(UniverSheetsFormulaPlugin);
        const api = FUniver.newAPI(univer);
        const workbook = api.createWorkbook(createWorkbookData());
        const main = workbook.getSheetByName('Sheet1')!;
        const rates = workbook.getSheetByName('Sheet2')!;
        rates.getRange('A1').setValue(5);
        workbook.insertDefinedName('Q', 'Sheet2!$A$1');
        workbook.insertDefinedName('Alias', '=Q');
        main.getRange('D2:E2').setFormulas([['=q+1', '=alias+1']]);
        const settle = () => api.getFormula().onCalculationResultApplied(10_000);
        await settle();
        expect(main.getRange('D2:E2').getValues()).toEqual([[6, 6]]);
        return { api, workbook, main, rates, settle };
    }

    afterEach(() => {
        instances.forEach((univer) => univer.dispose());
        instances.length = 0;
    });

    it('keeps direct and nested names calculating through rename, undo, redo and reload', async () => {
        const { api, workbook, main, rates, settle } = await createCalculationTestBed();
        rates.setName('Rates2');
        await settle();
        expect(workbook.getDefinedName('Q')!.getFormulaOrRefString()).toBe('Rates2!$A$1');
        expect(main.getRange('D2:E2').getValues()).toEqual([[6, 6]]);

        workbook.undo();
        await settle();
        expect(rates.getSheetName()).toBe('Sheet2');
        expect(workbook.getDefinedName('Q')!.getFormulaOrRefString()).toBe('Sheet2!$A$1');

        workbook.redo();
        await settle();
        expect(rates.getSheetName()).toBe('Rates2');
        rates.getRange('A1').setValue(9);
        await settle();
        expect(main.getRange('D2:E2').getValues()).toEqual([[10, 10]]);

        const snapshot = workbook.save();
        api.disposeUnit(workbook.getId());
        const restored = api.createWorkbook(snapshot);
        await settle();
        const restoredMain = restored.getSheetByName('Sheet1')!;
        expect(restored.getDefinedName('Q')!.getFormulaOrRefString()).toBe('Rates2!$A$1');
        expect(restoredMain.getRange('D2:E2').getValues()).toEqual([[10, 10]]);
        restored.getSheetByName('Rates2')!.getRange('A1').setValue(12);
        await settle();
        expect(restoredMain.getRange('D2:E2').getValues()).toEqual([[13, 13]]);
    });

    it('rebuilds direct and nested cached formulas when a renamed name is retargeted', async () => {
        const { workbook, main, rates, settle } = await createCalculationTestBed();
        rates.setName('Rates2');
        await settle();
        rates.getRange('A2').setValue(8);
        workbook.getDefinedName('Q')!.setRef('Rates2!$A$2');
        await settle();
        expect(main.getRange('D2:E2').getValues()).toEqual([[9, 9]]);

        rates.getRange('A2').setValue(11);
        await settle();
        expect(main.getRange('D2:E2').getValues()).toEqual([[12, 12]]);
        workbook.getDefinedName('Alias')!.setRef('=Q*2');
        await settle();
        expect(main.getRange('D2:E2').getValues()).toEqual([[12, 23]]);
    });
});
