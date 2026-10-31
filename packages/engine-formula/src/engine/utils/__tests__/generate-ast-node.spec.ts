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
import { ICommandService, LocaleService, LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SetDefinedNameMutation } from '../../../commands/mutations/set-defined-name.mutation';
import { UniverFormulaEnginePlugin } from '../../../plugin';
import { IFormulaCurrentConfigService } from '../../../services/current-data.service';
import { ISuperTableService } from '../../../services/super-table.service';
import { Lexer } from '../../analysis/lexer';
import { AstTreeBuilder } from '../../analysis/parser';
import { FORMULA_AST_CACHE, generateAstNode } from '../generate-ast-node';

describe('generateAstNode registry cache invalidation', () => {
    let univer: Univer;

    beforeEach(() => {
        FORMULA_AST_CACHE.clear();
    });

    afterEach(() => {
        univer.dispose();
        FORMULA_AST_CACHE.clear();
    });

    function createHarness(
        dirtyDefinedNameMap: Record<string, Record<string, string>>,
        dirtySuperTableMap: Record<string, Record<string, string>> = {}
    ) {
        univer = new Univer();
        univer.registerPlugin(UniverFormulaEnginePlugin);
        univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'unit-1',
            name: 'Cache',
            appVersion: '1',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['sheet-1', 'sheet-2'],
            sheets: {
                'sheet-1': { id: 'sheet-1', name: 'Data', rowCount: 20, columnCount: 10, cellData: {} },
                'sheet-2': { id: 'sheet-2', name: 'Other', rowCount: 20, columnCount: 10, cellData: {} },
            },
        });
        const injector = univer.__getInjector();
        const locale = injector.get(LocaleService);
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        const commands = injector.get(ICommandService);
        const config = injector.get(IFormulaCurrentConfigService);
        const lexer = injector.get(Lexer);
        const parser = injector.get(AstTreeBuilder);
        const tables = injector.get(ISuperTableService);
        for (const tableName of ['Table1', 'Sales.Table+', 'SalesXTable+', 'Regional Costs']) {
            tables.registerTable('unit-1', tableName, {
                sheetId: 'sheet-1',
                titleMap: new Map([['col1', 0], ['Freight', 0]]),
                range: { startRow: 0, endRow: 3, startColumn: 0, endColumn: 0 },
            });
        }
        function define(reference: string) {
            expect(commands.syncExecuteCommand(SetDefinedNameMutation.id, {
                unitId: 'unit-1',
                id: 'rate',
                name: 'ScopedRate',
                formulaOrRefString: reference,
            })).toBe(true);
        }
        define('Data!$A$1');
        function load() {
            config.load({
                formulaData: {},
                arrayFormulaCellData: {},
                arrayFormulaRange: {},
                forceCalculate: false,
                dirtyRanges: [],
                dirtyNameMap: {},
                dirtyDefinedNameMap,
                dirtySuperTableMap,
                dirtyUnitFeatureMap: {},
                dirtyUnitOtherFormulaMap: {},
                unitSheetNameMap: { 'unit-1': { Data: 'sheet-1', Other: 'sheet-2' } },
            });
        }
        load();
        return {
            define,
            load,
            parse: (formula: string, sheetId = 'sheet-1') => generateAstNode(
                'unit-1',
                formula,
                lexer,
                parser,
                config,
                sheetId
            ),
        };
    }

    it('does not reuse cache when dirty defined name key matches formula in the same unit', () => {
        const harness = createHarness({ 'unit-1': { 'SUM(A1)': 'another formula text' } });
        expect(harness.parse('=SUM(A1)')).not.toBe(harness.parse('=SUM(A1)'));
    });

    it('ignores a leading equal sign when matching dirty defined name key', () => {
        const harness = createHarness({ 'unit-1': { '=SUM(A1)': 'another formula text' } });
        expect(harness.parse('=SUM(A1)')).not.toBe(harness.parse('=SUM(A1)'));
    });

    it('reuses the refreshed defined name AST after the dirty map is cleared', () => {
        const dirty: Record<string, Record<string, string>> = { 'unit-1': { ScopedRate: 'Data!$B$1' } };
        const harness = createHarness(dirty);
        const original = harness.parse('=ScopedRate');
        harness.define('Data!$B$1');
        const refreshed = harness.parse('=ScopedRate');
        expect(refreshed).not.toBe(original);
        expect(JSON.stringify(refreshed.serialize())).toContain('$B$1');
        delete dirty['unit-1'];
        harness.load();
        expect(harness.parse('=ScopedRate')).toBe(refreshed);
    });

    it('reuses cache when dirty defined name key matches another unit', () => {
        const harness = createHarness({ 'unit-2': { 'SUM(A1)': 'another formula text' } });
        expect(harness.parse('=SUM(A1)')).toBe(harness.parse('=SUM(A1)'));
    });

    it('reuses cache when dirty defined name value matches formula but key does not', () => {
        const harness = createHarness({ 'unit-1': { 'SUM(B1)': '=SUM(A1)' } });
        expect(harness.parse('=SUM(A1)')).toBe(harness.parse('=SUM(A1)'));
    });

    it('does not reuse cache when formula references a dirty super table in the same unit', () => {
        const harness = createHarness({}, { 'unit-1': { Table1: '1' } });
        expect(harness.parse('=SUM(Table1[col1])')).not.toBe(harness.parse('=SUM(Table1[col1])'));
    });

    it('reuses the refreshed super table AST after the dirty map is cleared', () => {
        const dirty: Record<string, Record<string, string>> = { 'unit-1': { Table1: '1' } };
        const harness = createHarness({}, dirty);
        const refreshed = harness.parse('=SUM(Table1[col1])');
        delete dirty['unit-1'];
        harness.load();
        expect(harness.parse('=SUM(Table1[col1])')).toBe(refreshed);
    });

    it('treats dirty super table names as literal text when building cache invalidation patterns', () => {
        const harness = createHarness({}, { 'unit-1': { 'Sales.Table+': '1' } });
        const matched = harness.parse('=SUM(Sales.Table+[col1])');
        expect(harness.parse('=SUM(Sales.Table+[col1])')).not.toBe(matched);
        expect(harness.parse('=SUM(SalesXTable+[col1])')).toBe(harness.parse('=SUM(SalesXTable+[col1])'));
    });

    it('invalidates table references whose names contain spaces', () => {
        const harness = createHarness({}, { 'unit-1': { 'Regional Costs': '1' } });
        expect(harness.parse('=SUM(Regional Costs[[#This Row],[Freight]])'))
            .not
            .toBe(harness.parse('=SUM(Regional Costs[[#This Row],[Freight]])'));
    });

    it('reuses cache when formula references a dirty super table in another unit', () => {
        const harness = createHarness({}, { 'unit-2': { Table1: '1' } });
        expect(harness.parse('=SUM(Table1[col1])')).toBe(harness.parse('=SUM(Table1[col1])'));
    });

    it('does not reuse cache across sheets in the same unit', () => {
        const harness = createHarness({});
        expect(harness.parse('=ScopedRate+6', 'sheet-1')).not.toBe(harness.parse('=ScopedRate+6', 'sheet-2'));
    });

    it.each(['=sCoPeDrAtE', '=SUM(sCoPeDrAtE,1)'])('rebinds mixed-case cached names in %s', (formula) => {
        const dirty: Record<string, Record<string, string>> = {};
        const harness = createHarness(dirty);
        const original = harness.parse(formula);
        expect(original.getDefinedNames()).toContain('sCoPeDrAtE');
        harness.define('Data!$B$1');
        dirty['unit-1'] = { ScopedRate: 'Data!$B$1' };
        harness.load();
        const refreshed = harness.parse(formula);
        expect(refreshed).not.toBe(original);
        expect(refreshed.getDefinedNames()).toContain('sCoPeDrAtE');
        expect(JSON.stringify(refreshed.serialize())).toContain('$B$1');
        expect(JSON.stringify(refreshed.serialize())).not.toContain('$A$1');
        delete dirty['unit-1'];
        harness.load();
        expect(harness.parse(formula)).toBe(refreshed);
    });
});
