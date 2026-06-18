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

import type { ICellData, Injector, Nullable } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import { ICommandService, IUniverInstanceService } from '@univerjs/core';
import { RemoveDefinedNameMutation, SetDefinedNameMutation } from '@univerjs/engine-formula';
import { RemoveDefinedNameCommand, SetDefinedNameCommand } from '@univerjs/sheets';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFacadeTestBed } from './create-test-bed';

describe('Test FDefinedName', () => {
    let get: Injector['get'];
    let commandService: ICommandService;
    let univerAPI: FUniver;
    let getValueByPosition: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Nullable<ICellData>;

    beforeEach(() => {
        const testBed = createFacadeTestBed();
        get = testBed.get;
        univerAPI = testBed.univerAPI;

        commandService = get(ICommandService);
        commandService.registerCommand(RemoveDefinedNameCommand);
        commandService.registerCommand(SetDefinedNameMutation);
        commandService.registerCommand(RemoveDefinedNameMutation);
        commandService.registerCommand(SetDefinedNameCommand);

        getValueByPosition = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Nullable<ICellData> =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValue();
    });

    it('defined name insertDefinedName', () => {
        const activeSpreadsheet = univerAPI.getActiveWorkbook()!;
        activeSpreadsheet.insertDefinedName('test1', 'A1');
        const definedName = activeSpreadsheet.getDefinedName('test1');
        expect(definedName?.getName()).eq('test1');
    });

    it('defined name getDefinedNames', () => {
        const activeSpreadsheet = univerAPI.getActiveWorkbook()!;
        activeSpreadsheet.insertDefinedName('test', 'A1');
        activeSpreadsheet.insertDefinedName('test1', '=SUM(A1)');
        activeSpreadsheet.insertDefinedName('test2', '=A1');
        activeSpreadsheet.insertDefinedName('test3', 'A1:B10');
        expect(activeSpreadsheet.getDefinedNames().length).toBe(4);
    });

    it('defined name deleteDefinedName', () => {
        const activeSpreadsheet = univerAPI.getActiveWorkbook()!;
        activeSpreadsheet.insertDefinedName('test', 'A1');
        activeSpreadsheet.insertDefinedName('test1', '=SUM(A1)');
        activeSpreadsheet.insertDefinedName('test2', '=A1');
        activeSpreadsheet.insertDefinedName('test3', 'A1:B10');

        activeSpreadsheet.deleteDefinedName('test2');
        activeSpreadsheet.deleteDefinedName('test3');

        expect(activeSpreadsheet.getDefinedNames().length).toBe(2);
    });

    it('defined name insertDefinedNameBuilder', () => {
        const activeSpreadsheet = univerAPI.getActiveWorkbook()!;
        const builder = activeSpreadsheet.newDefinedNameBuilder();
        const param = builder.setName('test').setFormula('A1').setComment('test comment').setHidden(true).build();
        activeSpreadsheet.insertDefinedNameBuilder(param);
        const definedName = activeSpreadsheet.getDefinedName('test');
        expect(definedName?.getComment()).eq('test comment');
    });

    it('defined name updateDefinedName', () => {
        const activeSpreadsheet = univerAPI.getActiveWorkbook()!;
        const sheet = activeSpreadsheet.getActiveSheet();
        sheet.insertDefinedName('test11', 'A1');
        expect(activeSpreadsheet.getDefinedName('test11')?.getLocalSheetId()).eq(sheet.getSheetId());
    });

    it('defined names can be maintained as workbook and worksheet level business aliases', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const sheet = workbook.getActiveSheet();

        const initialParam = workbook.newDefinedNameBuilder()
            .setName('QuarterRevenue')
            .setRefByRange(1, 1, 2, 1)
            .setComment('Revenue input cells')
            .setScopeToWorksheet(sheet)
            .setHidden(false)
            .build();
        workbook.insertDefinedNameBuilder(initialParam);

        const localName = workbook.getDefinedName('QuarterRevenue')!;
        expect(localName.getFormulaOrRefString()).toBe('B2:B3');
        expect(localName.getComment()).toBe('Revenue input cells');
        expect(localName.getLocalSheetId()).toBe(sheet.getSheetId());
        expect(localName.isWorkbookScope()).toBe(false);
        expect(sheet.getDefinedNames().map((name) => name.getName())).toEqual(['QuarterRevenue']);

        localName.setName('RegionalRevenue');
        expect(workbook.getDefinedName('QuarterRevenue')).toBeNull();
        expect(workbook.getDefinedName('RegionalRevenue')?.getFormulaOrRefString()).toBe('B2:B3');

        const regionalRevenue = workbook.getDefinedName('RegionalRevenue')!;
        regionalRevenue.setFormula('SUM(B2:B3)');
        expect(regionalRevenue.getFormulaOrRefString()).toBe('=SUM(B2:B3)');
        regionalRevenue.setRef('C2:C3');
        expect(regionalRevenue.getFormulaOrRefString()).toBe('C2:C3');
        regionalRevenue.setRefByRange(4, 4, 2, 1);
        expect(regionalRevenue.getFormulaOrRefString()).toBe('E5:E6');
        regionalRevenue.setComment('Approved revenue range');
        expect(regionalRevenue.getComment()).toBe('Approved revenue range');
        regionalRevenue.setHidden(true);
        regionalRevenue.setScopeToWorkbook();
        expect(regionalRevenue.isWorkbookScope()).toBe(true);
        expect(sheet.getDefinedNames()).toEqual([]);
        regionalRevenue.setScopeToWorksheet(sheet);
        expect(regionalRevenue.isWorkbookScope()).toBe(false);
        expect(sheet.getDefinedNames().map((name) => name.getName())).toEqual(['RegionalRevenue']);

        const updatedParam = regionalRevenue.toBuilder()
            .setName('ApprovedRevenue')
            .setRefByRange(3, 3, 1, 2)
            .setScopeToWorksheet(sheet)
            .build();
        workbook.updateDefinedNameBuilder(updatedParam);

        expect(workbook.getDefinedName('RegionalRevenue')).toBeNull();
        expect(workbook.getDefinedName('ApprovedRevenue')?.getFormulaOrRefString()).toBe('D4:E4');
        expect(sheet.getDefinedNames().map((name) => name.getName())).toEqual(['ApprovedRevenue']);

        workbook.getDefinedName('ApprovedRevenue')?.delete();
        expect(workbook.getDefinedName('ApprovedRevenue')).toBeNull();
        expect(workbook.deleteDefinedName('missing-name')).toBe(false);
    });

    it('generates a default name when an existing defined name is renamed to blank', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        workbook.insertDefinedName('Name1', 'A1');
        const definedName = workbook.getDefinedName('Name1')!;

        definedName.setName('');

        expect(definedName.getName()).not.toBe('');
        expect(workbook.getDefinedNames().map((name) => name.getName())).toContain(definedName.getName());
    });
});
