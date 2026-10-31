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

import type { Injector } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import {
    ICommandService,
    IUndoRedoService,
    LocaleService,
    LocaleType,
    RedoCommand,
    Tools,
    UndoCommand,
} from '@univerjs/core';
import { IDefinedNamesService, RemoveDefinedNameMutation, SetDefinedNameMutation } from '@univerjs/engine-formula';
import { RemoveDefinedNameCommand, SetDefinedNameCommand } from '@univerjs/sheets';
import enUS from '@univerjs/sheets/locale/en-US';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DefinedNameDataController, SCOPE_WORKBOOK_VALUE_DEFINED_NAME } from '../../controllers/defined-name-data.controller';
import { createFacadeTestBed } from './create-test-bed';

describe('Test FDefinedName', () => {
    let get: Injector['get'];
    let commandService: ICommandService;
    let univerAPI: FUniver;
    let testBed: ReturnType<typeof createFacadeTestBed>;

    beforeEach(() => {
        testBed = createFacadeTestBed({
            id: 'test',
            name: 'Scoped aliases',
            appVersion: '1.0.0',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['sheet1', 'scratch'],
            sheets: {
                sheet1: { id: 'sheet1', name: 'Orders', rowCount: 100, columnCount: 100 },
                scratch: { id: 'scratch', name: 'Scratch', rowCount: 20, columnCount: 10 },
            },
        }, [[DefinedNameDataController]]);
        get = testBed.get;
        univerAPI = testBed.univerAPI;
        get(DefinedNameDataController);
        get(LocaleService).load({ [LocaleType.EN_US]: enUS });
        get(LocaleService).setLocale(LocaleType.EN_US);
        get(LocaleService).setDirection('ltr');

        commandService = get(ICommandService);
        commandService.registerCommand(RemoveDefinedNameCommand);
        commandService.registerCommand(SetDefinedNameMutation);
        commandService.registerCommand(RemoveDefinedNameMutation);
        commandService.registerCommand(SetDefinedNameCommand);
    });

    afterEach(() => testBed.univer.dispose());

    it.each(['workbook-first', 'worksheet-first'])('allows independent same-name aliases across scopes: %s', (order) => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const orders = workbook.getActiveSheet();
        const scratch = workbook.getSheetByName('Scratch')!;
        const history = get(IUndoRedoService);
        const insertGlobal = () => workbook.insertDefinedName('ScopedRate', '=8');
        const insertLocal = () => orders.insertDefinedName('ScopedRate', '=5');
        if (order === 'workbook-first') {
            insertGlobal();
            insertLocal();
        } else {
            insertLocal();
            insertGlobal();
        }
        scratch.insertDefinedName('ScopedRate', '=7');

        expect(workbook.getDefinedNames().map((name) => ({
            scope: name.getLocalSheetId(),
            formula: name.getFormulaOrRefString(),
        }))).toEqual(expect.arrayContaining([
            { scope: SCOPE_WORKBOOK_VALUE_DEFINED_NAME, formula: '=8' },
            { scope: orders.getSheetId(), formula: '=5' },
            { scope: scratch.getSheetId(), formula: '=7' },
        ]));
        expect(workbook.getDefinedNames()).toHaveLength(3);
        const names = get(IDefinedNamesService);
        expect(names.getValueByName(workbook.getId(), 'ScopedRate', orders.getSheetId())?.formulaOrRefString).toBe('=5');
        expect(names.getValueByName(workbook.getId(), 'ScopedRate', scratch.getSheetId())?.formulaOrRefString).toBe('=7');
        expect(names.getValueByName(workbook.getId(), 'ScopedRate')?.formulaOrRefString).toBe('=8');
        const snapshot = () => Tools.deepClone({
            workbook: workbook.save(),
            status: history.getUndoRedoStatus(workbook.getId()),
            undo: history.pitchTopUndoElement(),
            redo: history.pitchTopRedoElement(),
        });
        const beforeDuplicate = snapshot();
        const normalizeNameResource = (data: ReturnType<typeof workbook.save>) => ({
            ...data,
            resources: data.resources?.map((resource) => resource.name === 'SHEET_DEFINED_NAME_PLUGIN'
                ? { ...resource, data: JSON.parse(resource.data) as Record<string, unknown> }
                : resource),
        });
        for (const insert of [
            () => workbook.insertDefinedName('scopedrate', '=9'),
            () => orders.insertDefinedName('SCOPEDRATE', '=9'),
            () => scratch.insertDefinedName('scopedrate', '=9'),
        ]) {
            expect(insert).toThrow('Name already exists');
            expect(snapshot()).toEqual(beforeDuplicate);
        }

        const local = orders.getDefinedNames()[0];
        const updated = local.toBuilder().setName('SCOPEDRATE').setFormula('6').build();
        workbook.updateDefinedNameBuilder(updated);
        expect(orders.getDefinedNames()[0].toBuilder().build().id).toBe(updated.id);
        expect(orders.getDefinedNames()[0].getFormulaOrRefString()).toBe('=6');
        const beforeScopeConflict = snapshot();
        expect(() => orders.getDefinedNames()[0].toBuilder().setScopeToWorkbook().build()).toThrow('Name already exists');
        expect(snapshot()).toEqual(beforeScopeConflict);
        expect(commandService.syncExecuteCommand(UndoCommand.id)).toBe(true);
        expect(orders.getDefinedNames()[0].getFormulaOrRefString()).toBe('=5');
        expect(normalizeNameResource(workbook.save())).toEqual(normalizeNameResource(beforeDuplicate.workbook));
        expect(commandService.syncExecuteCommand(RedoCommand.id)).toBe(true);
        expect(orders.getDefinedNames()[0].getFormulaOrRefString()).toBe('=6');
        expect(normalizeNameResource(workbook.save())).toEqual(normalizeNameResource(beforeScopeConflict.workbook));
        const saved = workbook.save();
        const savedNames = Tools.deepClone(names.getDefinedNameMap(workbook.getId()));
        expect(saved.resources?.find((resource) => resource.name === 'SHEET_DEFINED_NAME_PLUGIN')?.data)
            .toBe(JSON.stringify(savedNames));
        expect(univerAPI.disposeUnit(workbook.getId())).toBe(true);
        const restored = univerAPI.createWorkbook(saved);
        expect(names.getDefinedNameMap(restored.getId())).toEqual(savedNames);
        expect(restored.save().resources).toEqual(saved.resources);
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
