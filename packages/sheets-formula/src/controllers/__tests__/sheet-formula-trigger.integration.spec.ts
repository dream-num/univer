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

import type { IWorkbookData, Univer } from '@univerjs/core';
import {
    ICommandService,
    isNodeEnv,
    LifecycleService,
    LifecycleStages,
    LocaleService,
    LocaleType,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import {
    excelLegacyLookupFunctions,
    excelReferenceInformationFunctions,
    SetFormulaCalculationStartMutation,
    UniverFormulaEnginePlugin,
} from '@univerjs/engine-formula';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UniverSheetsFormulaPlugin } from '../../plugin';
import { createFormulaTestBed } from '../../services/__tests__/util';
import '@univerjs/engine-formula/facade';
import '@univerjs/sheets/facade';
import '../../facade';

function createWorkbookData(): IWorkbookData {
    return {
        id: 'standalone-sheet-formula',
        name: 'Standalone Sheet Formula',
        appVersion: 'test',
        locale: LocaleType.EN_US,
        styles: {},
        sheetOrder: ['sheet-1'],
        sheets: {
            'sheet-1': {
                id: 'sheet-1',
                name: 'Sheet1',
                rowCount: 20,
                columnCount: 20,
                cellData: {
                    0: {
                        0: { v: 2 },
                        1: { f: '=A1*2' },
                    },
                },
            },
        },
    };
}

describe('standalone Sheet formula calculation trigger', () => {
    let univer: Univer;

    beforeEach(() => {
        vi.mocked(isNodeEnv).mockReturnValue(false);
        const testBed = createFormulaTestBed();
        univer = testBed.univer;
        const locale = testBed.get(LocaleService);
        locale.load({ [LocaleType.EN_US]: {} });
        locale.setLocale(LocaleType.EN_US);
    });

    afterEach(() => {
        univer.dispose();
        vi.restoreAllMocks();
    });

    it.each([false, true])('keeps the selected IF range for lookup arguments on cold start and after edits (Excel overrides: %s)', async (excelOverrides) => {
        if (excelOverrides) {
            univer.registerPlugin(UniverFormulaEnginePlugin, { function: excelLegacyLookupFunctions });
        }
        univer.registerPlugin(UniverSheetsFormulaPlugin);
        const api = FUniver.newAPI(univer);
        const data = createWorkbookData();
        const lookup = '=XLOOKUP(3,IF(B1,B2:B4,B5:B7),IF(B1,C2:C4,C5:C7))';
        data.sheets['sheet-1']!.cellData = {
            0: { 0: { f: lookup }, 1: { v: 1 } },
            1: { 0: { f: '=VLOOKUP(3,IF(B1,B2:C4,B5:C7),2,FALSE)' }, 1: { v: 2 }, 2: { v: 20 } },
            2: { 0: { f: lookup }, 1: { v: 3 }, 2: { v: 30 } },
            3: { 0: { f: '=LOOKUP(3,B2:B4,IF(B1,C2:C4,C5:C7))' }, 1: { v: 4 }, 2: { v: 40 } },
            4: { 0: { f: '=HLOOKUP(IF(B1,2,4),IF(B1,B2:C4,B5:C7),2,FALSE)' }, 1: { v: 4 }, 2: { v: 50 } },
            5: { 0: { f: '=XMATCH(3,IF(B1,B2:B4,B5:B7))' }, 1: { v: 3 }, 2: { v: 60 } },
            6: { 0: { f: '=INDEX(IF(B1,B2:C4,B5:C7),2,2)' }, 1: { v: 2 }, 2: { v: 70 } },
        };
        const sheet = api.createWorkbook(data).getActiveSheet();
        const results = sheet.getRange('A1:A7');
        const initial = api.getFormula().onCalculationResultApplied(10_000);
        univer.__getInjector().get(LifecycleService).stage = LifecycleStages.Rendered;
        await initial;
        expect(results.getValues()).toEqual([[30], [30], [30], [30], [3], [2], [30]]);

        const switched = api.getFormula().onCalculationResultApplied(10_000);
        sheet.getRange('B1').setValue(0);
        await switched;
        expect(results.getValues()).toEqual([[60], [60], [60], [60], [3], [2], [60]]);

        const edited = api.getFormula().onCalculationResultApplied(10_000);
        sheet.getRange('C6').setValue(61);
        await edited;
        expect(results.getValues()).toEqual([[61], [61], [61], [61], [3], [2], [61]]);
    });

    it.each([false, true])('uses the selected IF reference for dimensions, coordinates and sheet metadata after a branch change (Excel overrides: %s)', async (excelOverrides) => {
        if (excelOverrides) {
            univer.registerPlugin(UniverFormulaEnginePlugin, { function: excelReferenceInformationFunctions });
        }
        univer.registerPlugin(UniverSheetsFormulaPlugin);
        const api = FUniver.newAPI(univer);
        const data = createWorkbookData();
        const selected = 'IF(B1,B2:C4,C5:E6)';
        data.sheets['sheet-1']!.cellData = {
            0: {
                1: { v: 1 },
                7: { f: `=ROWS(${selected})` },
                8: { f: `=COLUMNS(${selected})` },
                9: { f: `=INDEX(ROW(${selected}),1)` },
                10: { f: `=INDEX(COLUMN(${selected}),1)` },
                11: { f: `=AREAS(${selected})` },
                12: { f: `=INDEX(FORMULATEXT(${selected}),1,1)` },
                13: { f: `=SHEET(${selected})` },
                14: { f: `=SHEETS(${selected})` },
                15: { f: `=CELL("row",${selected})` },
                16: { f: `=--INDEX(ISFORMULA(${selected}),1,1)` },
                17: { f: `=SUM(OFFSET(${selected},0,0))` },
            },
            1: { 1: { f: '=1+1' } },
            4: { 2: { f: '=2+2' } },
        };
        const sheet = api.createWorkbook(data).getActiveSheet();
        const results = sheet.getRange('H1:R1');
        const initial = api.getFormula().onCalculationResultApplied(10_000);
        univer.__getInjector().get(LifecycleService).stage = LifecycleStages.Rendered;
        await initial;
        expect(results.getValues()).toEqual([[3, 2, 2, 2, 1, '=1+1', 1, 1, 2, 1, 2]]);

        const switched = api.getFormula().onCalculationResultApplied(10_000);
        sheet.getRange('B1').setValue(0);
        await switched;
        expect(results.getValues()).toEqual([[2, 3, 5, 3, 1, '=2+2', 1, 1, 5, 1, 4]]);

        const edited = api.getFormula().onCalculationResultApplied(10_000);
        sheet.getRange('C5').setValue(8);
        await edited;
        expect(results.getValues()).toEqual([[2, 3, 5, 3, 1, '#N/A', 1, 1, 5, 0, 8]]);
    });

    it('preserves range arguments in conditional aggregates on cold start and after edits', async () => {
        univer.registerPlugin(UniverSheetsFormulaPlugin);
        const api = FUniver.newAPI(univer);
        const data = createWorkbookData();
        const selected = 'IF(B1,B2:B4,C2:C4)';
        const formulas = [
            `=COUNTIF(${selected},">2")`,
            `=SUMIF(${selected},">2",${selected})`,
            `=AVERAGEIF(${selected},">2",${selected})`,
            `=COUNTIFS(${selected},">2",${selected},"<10")`,
            `=SUMIFS(${selected},${selected},">2",${selected},"<10")`,
            `=AVERAGEIFS(${selected},${selected},">2")`,
            `=MINIFS(${selected},${selected},">2")`,
            `=MAXIFS(${selected},${selected},">2")`,
            `=SUBTOTAL(9,${selected})`,
        ];
        data.sheets['sheet-1']!.cellData = {
            0: { 1: { v: 1 }, ...Object.fromEntries(formulas.map((f, index) => [index + 4, { f }])) },
            1: { 1: { v: 1 }, 2: { v: 4 } },
            2: { 1: { v: 3 }, 2: { v: 6 } },
            3: { 1: { v: 5 }, 2: { v: 12 } },
        };
        const sheet = api.createWorkbook(data).getActiveSheet();
        const results = sheet.getRange('E1:M1');
        const initial = api.getFormula().onCalculationResultApplied(10_000);
        univer.__getInjector().get(LifecycleService).stage = LifecycleStages.Rendered;
        await initial;
        expect(results.getValues()).toEqual([[2, 8, 4, 2, 8, 4, 3, 5, 9]]);

        const switched = api.getFormula().onCalculationResultApplied(10_000);
        sheet.getRange('B1').setValue(0);
        await switched;
        expect(results.getValues()).toEqual([[3, 22, 22 / 3, 2, 10, 22 / 3, 4, 12, 22]]);

        const edited = api.getFormula().onCalculationResultApplied(10_000);
        sheet.getRange('C4').setValue(8);
        await edited;
        expect(results.getValues()).toEqual([[3, 18, 6, 3, 18, 6, 4, 8, 18]]);
    });

    it('calculates on cold start and recalculates after value and formula edits', async () => {
        const injector = univer.__getInjector();
        univer.registerPlugin(UniverSheetsFormulaPlugin);

        let calculationStarts = 0;
        injector.get(ICommandService).onCommandExecuted((command) => {
            if (command.id === SetFormulaCalculationStartMutation.id) {
                calculationStarts++;
            }
        });

        const api = FUniver.newAPI(univer);
        const workbook = api.createWorkbook(createWorkbookData());
        const sheet = workbook.getActiveSheet();
        const input = sheet.getRange('A1');
        const output = sheet.getRange('B1');

        const startupResultApplied = api.getFormula().onCalculationResultApplied(10_000);
        injector.get(LifecycleService).stage = LifecycleStages.Rendered;
        await startupResultApplied;
        expect(output.getValue()).toBe(4);
        expect(calculationStarts).toBe(1);

        const valueEditResultApplied = api.getFormula().onCalculationResultApplied(10_000);
        input.setValue(3);
        await valueEditResultApplied;
        expect(output.getValue()).toBe(6);
        expect(calculationStarts).toBe(2);

        const formulaEditResultApplied = api.getFormula().onCalculationResultApplied(10_000);
        output.setFormula('=A1*3');
        await formulaEditResultApplied;
        expect(output.getValue()).toBe(9);
        expect(calculationStarts).toBe(3);
    });
});

vi.mock('@univerjs/core', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/core')>();

    return {
        ...actual,
        isNodeEnv: vi.fn(actual.isNodeEnv),
    };
});
