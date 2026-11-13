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

import type { BaseReferenceObject } from '../../reference-object/base-reference-object';
import { Injector, ObjectMatrix } from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import { IFormulaCurrentConfigService } from '../../../services/current-data.service';
import { FormulaCacheService } from '../../../services/formula-cache.service';
import { IFormulaRuntimeService } from '../../../services/runtime.service';
import { createCommandTestBed } from '../../analysis/__tests__/create-command-test-bed';
import { Lexer } from '../../analysis/lexer';
import { AstTreeBuilder } from '../../analysis/parser';
import { Interpreter } from '../../interpreter/interpreter';
import { generateExecuteAstNodeData } from '../ast-node-tool';
import { generateAstNode } from '../generate-ast-node';

describe('generateAstNode defined name cache invalidation', () => {
    const injectors: Injector[] = [];
    afterEach(() => injectors.splice(0).forEach((injector) => injector.dispose()));

    it('keeps cached references bound to their own engine when document IDs match', () => {
        const clients = [createCommandTestBed(), createCommandTestBed()];
        try {
            const nodes = clients.map((client, index) => {
                const config = client.get(IFormulaCurrentConfigService);
                config.registerUnitData({
                    [client.unitId]: {
                        [client.sheetId]: {
                            ...client.sheetData[client.sheetId],
                            cellData: new ObjectMatrix({ 0: { 0: { v: index + 1 } } }),
                        },
                    },
                });
                client.get(IFormulaRuntimeService).setCurrent(0, 1, 1, 1, client.sheetId, client.unitId);
                return generateAstNode(
                    client.unitId,
                    '=A1',
                    client.get(Lexer),
                    client.get(AstTreeBuilder),
                    config,
                    client.sheetId
                );
            });

            expect(nodes[0]).not.toBe(nodes[1]);
            clients.forEach((client, index) => {
                const value = client.get(Interpreter).execute(generateExecuteAstNodeData(nodes[index]));
                expect((value as BaseReferenceObject).getCellByPosition().getValue()).toBe(index + 1);
                expect(generateAstNode(
                    client.unitId,
                    '=A1',
                    client.get(Lexer),
                    client.get(AstTreeBuilder),
                    client.get(IFormulaCurrentConfigService),
                    client.sheetId
                )).toBe(nodes[index]);
            });
        } finally {
            clients.forEach((client) => client.univer.dispose());
        }
    });

    function createHarness(
        dirtyDefinedNameMap: Record<string, Record<string, string>>,
        dirtySuperTableMap: Record<string, Record<string, string>> = {}
    ) {
        let parseCount = 0;
        let executeUnitId = 'unit-1';
        let executeSubUnitId = 'sheet-1';
        const node = {
            hasDefinedName: () => false,
        };

        const lexer = {
            treeBuilder: (formula: string) => formula,
        };
        const injector = new Injector([[FormulaCacheService]]);
        injectors.push(injector);
        const astTreeBuilder = {
            cacheService: injector.get(FormulaCacheService),
            parse: () => {
                parseCount++;
                return node;
            },
        };
        const currentConfigService = {
            getDirtyDefinedNameMap: () => dirtyDefinedNameMap,
            getDirtySuperTableMap: () => dirtySuperTableMap,
            getExecuteUnitId: () => executeUnitId,
            getExecuteSubUnitId: () => executeSubUnitId,
            setExecuteUnitId: (unitId: string) => {
                executeUnitId = unitId;
            },
            setExecuteSubUnitId: (subUnitId: string) => {
                executeSubUnitId = subUnitId;
            },
        };

        return {
            lexer,
            astTreeBuilder,
            currentConfigService,
            getParseCount: () => parseCount,
        };
    }

    it('does not reuse cache when dirty defined name key matches formula in the same unit', () => {
        const harness = createHarness({
            'unit-1': {
                'SUM(A1)': 'another formula text',
            },
        });

        generateAstNode(
            'unit-1',
            '=SUM(A1)',
            harness.lexer as never,
            harness.astTreeBuilder as never,
            harness.currentConfigService as never
        );
        generateAstNode(
            'unit-1',
            '=SUM(A1)',
            harness.lexer as never,
            harness.astTreeBuilder as never,
            harness.currentConfigService as never
        );

        expect(harness.getParseCount()).toBe(2);
    });

    it('ignores a leading equal sign when matching dirty defined name key', () => {
        const harness = createHarness({
            'unit-1': {
                '=SUM(A1)': 'another formula text',
            },
        });

        generateAstNode(
            'unit-1',
            '=SUM(A1)',
            harness.lexer as never,
            harness.astTreeBuilder as never,
            harness.currentConfigService as never
        );
        generateAstNode(
            'unit-1',
            '=SUM(A1)',
            harness.lexer as never,
            harness.astTreeBuilder as never,
            harness.currentConfigService as never
        );

        expect(harness.getParseCount()).toBe(2);
    });

    it('reuses the refreshed defined name AST after the dirty map is cleared', () => {
        const dirtyDefinedNameMap: Record<string, Record<string, string>> = {
            'unit-1': {
                'SUM(A1)': 'another formula text',
            },
        };
        const harness = createHarness(dirtyDefinedNameMap);

        generateAstNode(
            'unit-1',
            '=SUM(A1)',
            harness.lexer as never,
            harness.astTreeBuilder as never,
            harness.currentConfigService as never
        );
        delete dirtyDefinedNameMap['unit-1'];
        generateAstNode(
            'unit-1',
            '=SUM(A1)',
            harness.lexer as never,
            harness.astTreeBuilder as never,
            harness.currentConfigService as never
        );

        expect(harness.getParseCount()).toBe(1);
    });

    it('reuses cache when dirty defined name key matches another unit', () => {
        const harness = createHarness({
            'unit-2': {
                'SUM(A1)': 'another formula text',
            },
        });

        generateAstNode(
            'unit-1',
            '=SUM(A1)',
            harness.lexer as never,
            harness.astTreeBuilder as never,
            harness.currentConfigService as never
        );
        generateAstNode(
            'unit-1',
            '=SUM(A1)',
            harness.lexer as never,
            harness.astTreeBuilder as never,
            harness.currentConfigService as never
        );

        expect(harness.getParseCount()).toBe(1);
    });

    it('reuses cache when dirty defined name value matches formula but key does not', () => {
        const harness = createHarness({
            'unit-1': {
                'SUM(B1)': '=SUM(A1)',
            },
        });

        generateAstNode(
            'unit-1',
            '=SUM(A1)',
            harness.lexer as never,
            harness.astTreeBuilder as never,
            harness.currentConfigService as never
        );
        generateAstNode(
            'unit-1',
            '=SUM(A1)',
            harness.lexer as never,
            harness.astTreeBuilder as never,
            harness.currentConfigService as never
        );

        expect(harness.getParseCount()).toBe(1);
    });

    it('does not reuse cache when formula references a dirty super table in the same unit', () => {
        const harness = createHarness({}, {
            'unit-1': {
                Table1: '1',
            },
        });

        generateAstNode(
            'unit-1',
            '=SUM(Table1[col1])',
            harness.lexer as never,
            harness.astTreeBuilder as never,
            harness.currentConfigService as never
        );
        generateAstNode(
            'unit-1',
            '=SUM(Table1[col1])',
            harness.lexer as never,
            harness.astTreeBuilder as never,
            harness.currentConfigService as never
        );

        expect(harness.getParseCount()).toBe(2);
    });

    it('reuses the refreshed super table AST after the dirty map is cleared', () => {
        const dirtySuperTableMap: Record<string, Record<string, string>> = {
            'unit-1': {
                Table1: '1',
            },
        };
        const harness = createHarness({}, dirtySuperTableMap);

        generateAstNode(
            'unit-1',
            '=SUM(Table1[col1])',
            harness.lexer as never,
            harness.astTreeBuilder as never,
            harness.currentConfigService as never
        );
        delete dirtySuperTableMap['unit-1'];
        generateAstNode(
            'unit-1',
            '=SUM(Table1[col1])',
            harness.lexer as never,
            harness.astTreeBuilder as never,
            harness.currentConfigService as never
        );

        expect(harness.getParseCount()).toBe(1);
    });

    it('treats dirty super table names as literal text when building cache invalidation patterns', () => {
        const harness = createHarness({}, {
            'unit-1': {
                'Sales.Table+': '1',
            },
        });

        generateAstNode(
            'unit-1',
            '=SUM(Sales.Table+[col1])',
            harness.lexer as never,
            harness.astTreeBuilder as never,
            harness.currentConfigService as never
        );
        generateAstNode(
            'unit-1',
            '=SUM(SalesXTable+[col1])',
            harness.lexer as never,
            harness.astTreeBuilder as never,
            harness.currentConfigService as never
        );
        generateAstNode(
            'unit-1',
            '=SUM(SalesXTable+[col1])',
            harness.lexer as never,
            harness.astTreeBuilder as never,
            harness.currentConfigService as never
        );

        expect(harness.getParseCount()).toBe(2);
    });

    it('invalidates table references whose names contain spaces', () => {
        const harness = createHarness({}, {
            'unit-1': {
                'Regional Costs': '1',
            },
        });

        generateAstNode(
            'unit-1',
            '=SUM(Regional Costs[[#This Row],[Freight]])',
            harness.lexer as never,
            harness.astTreeBuilder as never,
            harness.currentConfigService as never
        );
        generateAstNode(
            'unit-1',
            '=SUM(Regional Costs[[#This Row],[Freight]])',
            harness.lexer as never,
            harness.astTreeBuilder as never,
            harness.currentConfigService as never
        );

        expect(harness.getParseCount()).toBe(2);
    });

    it('reuses cache when formula references a dirty super table in another unit', () => {
        const harness = createHarness({}, {
            'unit-2': {
                Table1: '1',
            },
        });

        generateAstNode(
            'unit-1',
            '=SUM(Table1[col1])',
            harness.lexer as never,
            harness.astTreeBuilder as never,
            harness.currentConfigService as never
        );
        generateAstNode(
            'unit-1',
            '=SUM(Table1[col1])',
            harness.lexer as never,
            harness.astTreeBuilder as never,
            harness.currentConfigService as never
        );

        expect(harness.getParseCount()).toBe(1);
    });

    it('does not reuse cache across sheets in the same unit', () => {
        const harness = createHarness({});

        generateAstNode(
            'unit-1',
            '=date_begin+6',
            harness.lexer as never,
            harness.astTreeBuilder as never,
            harness.currentConfigService as never,
            'sheet-1'
        );
        generateAstNode(
            'unit-1',
            '=date_begin+6',
            harness.lexer as never,
            harness.astTreeBuilder as never,
            harness.currentConfigService as never,
            'sheet-2'
        );

        expect(harness.getParseCount()).toBe(2);
    });
});
