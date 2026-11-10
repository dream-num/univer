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

// @vitest-environment node

import type { ICommandInfo, IWorkbookData } from '@univerjs/core';
import { CommandType, ICommandService, LocaleType, LogLevel, Tools, Univer } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { ReorderRangeCommand, ReorderRangeMutation, SetRangeValuesMutation, SheetInterceptorService } from '@univerjs/sheets';
import { afterEach, describe, expect, it } from 'vitest';
import { UniverSheetsFormulaPlugin } from '../../plugin';
import { FormulaReorderController } from '../formula-reorder.controller';
import '@univerjs/engine-formula/facade';
import '@univerjs/sheets/facade';

const WORKBOOK_DATA: IWorkbookData = {
    id: 'unit',
    appVersion: 'test',
    locale: LocaleType.EN_US,
    name: 'Sort formulas',
    styles: {},
    sheetOrder: ['sheet'],
    sheets: {
        sheet: {
            id: 'sheet',
            name: 'Sheet1',
            rowCount: 10,
            columnCount: 10,
            cellData: {
                0: { 0: { v: 'b' }, 1: { v: 2 }, 2: { f: '=B1*10' }, 3: { f: '=$B1+B$1+$B$1' } },
                1: { 0: { v: 'a' }, 1: { v: 1 }, 2: { f: '=B2*10' }, 3: { f: '=$B2+B$1+$B$1' } },
            },
        },
    },
};

const REORDER_PARAMS = {
    unitId: 'unit',
    subUnitId: 'sheet',
    range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 3 },
    order: { 0: 1, 1: 0 },
};

describe('FormulaReorderController without a UI plugin', () => {
    const instances: Univer[] = [];

    async function createTestBed(data: IWorkbookData = WORKBOOK_DATA) {
        const univer = new Univer({
            locale: LocaleType.EN_US,
            locales: { [LocaleType.EN_US]: {} },
            logLevel: LogLevel.SILENT,
        });
        instances.push(univer);
        univer.registerPlugin(UniverSheetsFormulaPlugin);

        const api = FUniver.newAPI(univer);
        const workbook = api.createWorkbook(Tools.deepClone(data));
        const sheet = workbook.getActiveSheet();
        const injector = univer.__getInjector();
        await api.getFormula().onCalculationResultApplied();

        return { api, workbook, sheet, injector, commandService: injector.get(ICommandService) };
    }

    afterEach(() => {
        instances.forEach((univer) => univer.dispose());
        instances.length = 0;
    });

    it.each([false, true])('keeps relative, mixed and absolute references correct through reorder, undo and redo (shared: %s)', async (shared) => {
        const data = Tools.deepClone(WORKBOOK_DATA);
        if (shared) {
            data.sheets.sheet.cellData![0][2] = { f: '=B1*10', si: 'shared' };
            data.sheets.sheet.cellData![1][2] = { si: 'shared' };
        }
        const { api, workbook, sheet, commandService } = await createTestBed(data);
        const formulas = [['=B1*10', '=$B1+B$1+$B$1'], ['=B2*10', '=$B2+B$1+$B$1']];

        expect(commandService.syncExecuteCommand(ReorderRangeCommand.id, REORDER_PARAMS)).toBe(true);
        await api.getFormula().onCalculationResultApplied();
        expect(sheet.getRange('A1:D2').getValues()).toEqual([['a', 1, 10, 3], ['b', 2, 20, 4]]);
        expect(sheet.getRange('C1:D2').getFormulas()).toEqual(formulas);

        workbook.undo();
        await api.getFormula().onCalculationResultApplied();
        expect(sheet.getRange('A1:D2').getValues()).toEqual([['b', 2, 20, 6], ['a', 1, 10, 5]]);
        expect(sheet.getRange('C1:D2').getFormulas()).toEqual(formulas);

        workbook.redo();
        await api.getFormula().onCalculationResultApplied();
        expect(sheet.getRange('A1:D2').getValues()).toEqual([['a', 1, 10, 3], ['b', 2, 20, 4]]);
        expect(sheet.getRange('C1:D2').getFormulas()).toEqual(formulas);
    });

    it('skips unrelated commands, missing worksheets and ranges without formulas, and unregisters on disposal', async () => {
        const { injector } = await createTestBed();
        const interceptor = injector.get(SheetInterceptorService);

        expect(interceptor.onCommandExecute({ id: 'other-command', params: {} })).toMatchObject({ redos: [], undos: [] });
        expect(interceptor.onCommandExecute({
            id: ReorderRangeCommand.id,
            params: { ...REORDER_PARAMS, subUnitId: 'missing' },
        })).toMatchObject({ redos: [], undos: [] });
        expect(interceptor.onCommandExecute({
            id: ReorderRangeCommand.id,
            params: { ...REORDER_PARAMS, range: { ...REORDER_PARAMS.range, endColumn: 1 } },
        })).toMatchObject({ redos: [], undos: [] });

        injector.get(FormulaReorderController).dispose();
        expect(interceptor.onCommandExecute({ id: ReorderRangeCommand.id, params: REORDER_PARAMS })).toMatchObject({ redos: [], undos: [] });
    });

    it('preserves corrected formulas when saving a snapshot or replaying recorded mutations', async () => {
        const { api, workbook, sheet, commandService } = await createTestBed();
        const original = workbook.save();
        const mutations: ICommandInfo[] = [];
        const recording = commandService.onCommandExecuted((command, options) => {
            if (command.type === CommandType.MUTATION && !options?.onlyLocal) {
                mutations.push(Tools.deepClone(command));
            }
        });

        expect(commandService.syncExecuteCommand(ReorderRangeCommand.id, REORDER_PARAMS)).toBe(true);
        recording.dispose();
        await api.getFormula().onCalculationResultApplied();
        expect(mutations.map((mutation) => mutation.id)).toEqual([ReorderRangeMutation.id, SetRangeValuesMutation.id]);

        const restored = await createTestBed(JSON.parse(JSON.stringify(workbook.save())));
        expect(restored.sheet.getRange('A1:D2').getValues()).toEqual([['a', 1, 10, 3], ['b', 2, 20, 4]]);
        expect(restored.sheet.getRange('C1:D2').getFormulas()).toEqual(sheet.getRange('C1:D2').getFormulas());

        const replica = await createTestBed(original);
        for (const mutation of mutations) {
            expect(replica.commandService.syncExecuteCommand(mutation.id, mutation.params, { fromChangeset: true })).toBe(true);
        }
        await replica.api.getFormula().onCalculationResultApplied();
        expect(replica.sheet.getRange('A1:D2').getValues()).toEqual([['a', 1, 10, 3], ['b', 2, 20, 4]]);
        expect(replica.sheet.getRange('C1:D2').getFormulas()).toEqual(sheet.getRange('C1:D2').getFormulas());
    });
});
