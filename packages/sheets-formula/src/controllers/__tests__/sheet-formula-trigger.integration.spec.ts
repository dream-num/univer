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
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UniverSheetsFormulaPlugin } from '../../plugin';
import '@univerjs/engine-formula/facade';
import '@univerjs/sheets/facade';
import '../../facade';

function createWorkbookData() {
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
    let univer: Univer | undefined;

    afterEach(() => {
        univer?.dispose();
        univer = undefined;
        vi.restoreAllMocks();
    });

    it('calculates on cold start and recalculates after value and formula edits', async () => {
        vi.mocked(isNodeEnv).mockReturnValue(false);

        univer = new Univer();
        const injector = univer.__getInjector();
        injector.get(LocaleService).load({ [LocaleType.EN_US]: {} });
        injector.get(LocaleService).setLocale(LocaleType.EN_US);
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
