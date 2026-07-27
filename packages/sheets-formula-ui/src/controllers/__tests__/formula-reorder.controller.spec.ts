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
import { LocaleType } from '@univerjs/core';
import { ReorderRangeCommand, SetRangeValuesMutation, SheetInterceptorService } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FormulaReorderController } from '../formula-reorder.controller';
import { createCommandTestBed } from './create-command-test-bed';

const WORKBOOK_DATA: IWorkbookData = {
    id: 'unit',
    appVersion: '3.0.0-alpha',
    locale: LocaleType.EN_US,
    name: 'Test workbook',
    styles: {},
    sheetOrder: ['sheet'],
    sheets: {
        sheet: {
            id: 'sheet',
            name: 'Sheet 1',
            cellData: {
                0: { 0: { v: 'old-row' } },
                1: { 0: { f: '=A2', si: 'shared' } },
            },
        },
    },
};

describe('FormulaReorderController', () => {
    let univer: ReturnType<typeof createCommandTestBed>['univer'];
    let controller: FormulaReorderController;
    let sheetInterceptorService: SheetInterceptorService;

    beforeEach(() => {
        const testBed = createCommandTestBed(WORKBOOK_DATA, [[FormulaReorderController]]);
        univer = testBed.univer;
        controller = testBed.get(FormulaReorderController);
        sheetInterceptorService = testBed.get(SheetInterceptorService);
    });

    afterEach(() => univer.dispose());

    it('creates redo and undo mutations with formula references shifted to the reordered row', () => {
        const result = sheetInterceptorService.onCommandExecute({
            id: ReorderRangeCommand.id,
            params: {
                unitId: 'unit',
                subUnitId: 'sheet',
                range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
                order: { 0: 1 },
            },
        });

        expect(result.redos).toEqual([{
            id: SetRangeValuesMutation.id,
            params: {
                unitId: 'unit',
                subUnitId: 'sheet',
                cellValue: {
                    0: {
                        0: { f: '=A1', si: null },
                    },
                },
            },
        }]);
        expect(result.undos).toEqual([{
            id: SetRangeValuesMutation.id,
            params: {
                unitId: 'unit',
                subUnitId: 'sheet',
                cellValue: {
                    0: {
                        0: { v: 'old-row' },
                    },
                },
            },
        }]);

        controller.dispose();
        expect(sheetInterceptorService.onCommandExecute({ id: ReorderRangeCommand.id, params: {} })).toEqual({
            preUndos: [],
            undos: [],
            preRedos: [],
            redos: [],
        });
    });

    it('returns empty mutations for non-reorder commands, missing worksheets and ranges without formulas', () => {
        expect(sheetInterceptorService.onCommandExecute({ id: 'other-command', params: {} })).toMatchObject({ redos: [], undos: [] });
        expect(sheetInterceptorService.onCommandExecute({
            id: ReorderRangeCommand.id,
            params: { unitId: 'unit', subUnitId: 'missing', range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }, order: {} },
        })).toMatchObject({ redos: [], undos: [] });
        expect(sheetInterceptorService.onCommandExecute({
            id: ReorderRangeCommand.id,
            params: { unitId: 'unit', subUnitId: 'sheet', range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }, order: {} },
        })).toMatchObject({ redos: [], undos: [] });
    });
});
