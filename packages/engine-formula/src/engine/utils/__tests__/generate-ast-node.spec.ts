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

import { beforeEach, describe, expect, it } from 'vitest';
import { FORMULA_AST_CACHE, generateAstNode } from '../generate-ast-node';

describe('generateAstNode defined name cache invalidation', () => {
    beforeEach(() => {
        FORMULA_AST_CACHE.clear();
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
        const astTreeBuilder = {
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
