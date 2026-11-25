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

import type { IWorkbookData } from '@univerjs/core';
import {
    ICommandService,
    isNodeEnv,
    LifecycleService,
    LifecycleStages,
    LocaleService,
    LocaleType,
    Univer,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { SetFormulaCalculationStartMutation } from '@univerjs/engine-formula';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UniverSheetsFormulaPlugin } from '../../plugin';
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
        univer = new Univer();
        const locale = univer.__getInjector().get(LocaleService);
        locale.load({ [LocaleType.EN_US]: {} });
        locale.setLocale(LocaleType.EN_US);
    });

    afterEach(() => {
        univer.dispose();
        vi.restoreAllMocks();
    });

    it('keeps the selected IF range for lookup arguments on cold start and after edits', async () => {
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
