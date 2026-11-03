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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import {
    Direction,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    UniverInstanceType,
} from '@univerjs/core';
import {
    InsertColCommand,
    InsertColMutation,
    InsertRowCommand,
    InsertRowMutation,
    RemoveColMutation,
    RemoveRowMutation,
    SetRangeValuesMutation,
    SetSelectionsOperation,
} from '@univerjs/sheets';
import sheetsEnUS from '@univerjs/sheets/locale/en-US';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ITestBed } from './util';
import { FormulaRefRangeService } from '../formula-ref-range.service';
import { createCommandTestBed } from './util';

describe('FormulaRefRangeService service coverage', () => {
    let testBed: ITestBed;

    beforeEach(() => {
        testBed = createCommandTestBed();
    });

    afterEach(() => {
        testBed.univer.dispose();
    });

    it('updates sheet formula references when a referenced range moves', () => {
        const service = testBed.get(FormulaRefRangeService);

        const transformedFormula = service.transformFormulaByEffectCommand('test', 'sheet1', '=SUM(A1)', {
            id: 'sheet.command.move-range',
            params: {
                fromRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
                toRange: { startRow: 2, endRow: 2, startColumn: 1, endColumn: 1 },
            },
        });

        expect(transformedFormula).toBe('=SUM(B3)');
    });

    it.each([
        { label: 'relative', initial: 'J2', afterRow: 'J3', afterColumn: 'K2' },
        { label: 'absolute', initial: '$J$2', afterRow: '$J$3', afterColumn: '$K$2' },
        { label: 'row-absolute', initial: 'J$2', afterRow: 'J$3', afterColumn: 'K$2' },
        { label: 'column-absolute', initial: '$J2', afterRow: '$J3', afterColumn: '$K2' },
        { label: 'range', initial: 'J1:$K$3', afterRow: 'J1:$K$4', afterColumn: 'K1:$L$3' },
    ].flatMap((reference) => [
        { name: 'inactive source sheet row', row: true, externalUnit: false },
        { name: 'inactive source sheet column', row: false, externalUnit: false },
        { name: 'inactive source workbook row', row: true, externalUnit: true },
        { name: 'inactive source workbook column', row: false, externalUnit: true },
    ].map((target) => ({ ...reference, ...target }))))('updates registered $label formula references for $name using explicit command target', async ({ row, externalUnit, initial, afterRow, afterColumn }) => {
        testBed.univer.dispose();
        testBed = createCommandTestBed({
            id: 'test',
            appVersion: '3.0.0-alpha',
            name: 'Rules workbook',
            locale: LocaleType.EN_US,
            sheetOrder: ['sheet1', 'source'],
            sheets: {
                sheet1: { id: 'sheet1', name: 'Rules', cellData: {} },
                source: { id: 'source', name: 'Source', cellData: {} },
            },
            styles: {},
        });
        const sourceUnitId = externalUnit ? 'external' : 'test';
        const sourceWorkbook = externalUnit
            ? testBed.univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
                id: sourceUnitId,
                appVersion: '3.0.0-alpha',
                name: 'Source workbook',
                locale: LocaleType.EN_US,
                sheetOrder: ['source'],
                sheets: { source: { id: 'source', name: 'Source', cellData: {} } },
                styles: {},
            })
            : testBed.sheet;
        const instances = testBed.get(IUniverInstanceService);
        instances.setCurrentUnitForType('test');
        expect(instances.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET)).toBe(testBed.sheet);
        expect(testBed.sheet.getActiveSheet().getSheetId()).toBe('sheet1');
        const locale = testBed.get(LocaleService);
        locale.load({ [LocaleType.EN_US]: sheetsEnUS });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        const commands = testBed.get(ICommandService);
        for (const command of [
            InsertRowCommand,
            InsertRowMutation,
            InsertColMutation,
            RemoveRowMutation,
            RemoveColMutation,
            SetRangeValuesMutation,
            SetSelectionsOperation,
        ]) {
            commands.registerCommand(command);
        }
        const formulas: string[] = [];
        const registration = testBed.get(FormulaRefRangeService).registerFormula(
            'test',
            'sheet1',
            `=[${sourceUnitId}]Source!${initial}>0`,
            (formula) => {
                formulas.push(formula);
                return { redos: [], undos: [] };
            }
        );
        const sourceSheet = sourceWorkbook.getSheetBySheetId('source')!;
        expect(await commands.executeCommand(row ? InsertRowCommand.id : InsertColCommand.id, {
            unitId: sourceUnitId,
            subUnitId: 'source',
            range: row
                ? { startRow: 1, endRow: 1, startColumn: 0, endColumn: sourceSheet.getColumnCount() - 1 }
                : { startRow: 0, endRow: sourceSheet.getRowCount() - 1, startColumn: 9, endColumn: 9 },
            direction: row ? Direction.UP : Direction.LEFT,
        })).toBe(true);
        expect(formulas).toEqual([`=[${sourceUnitId}]Source!${row ? afterRow : afterColumn}>0`]);
        registration.dispose();
    });
});
