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

import type { IUnitRange, IWorkbookData } from '@univerjs/core';
import type { ISheetData } from '../../../basics/common';
import type { IFormulaDependencyTree } from '../../dependency/dependency-tree';

import { CellValueType, LocaleType } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFunctionTestBed } from '../../../functions/__tests__/create-function-test-bed';
import { FUNCTION_NAMES_LOGICAL } from '../../../functions/logical/function-names';
import { Let } from '../../../functions/logical/let';
import { Choosecols } from '../../../functions/lookup/choosecols';
import { Filter } from '../../../functions/lookup/filter';
import { FUNCTION_NAMES_LOOKUP } from '../../../functions/lookup/function-names';
import { Vstack } from '../../../functions/lookup/vstack';
import { FUNCTION_NAMES_MATH } from '../../../functions/math/function-names';
import { Sum } from '../../../functions/math/sum';
import { Compare } from '../../../functions/meta/compare';
import { FUNCTION_NAMES_META } from '../../../functions/meta/function-names';
import { getObjectValue } from '../../../functions/util';
import { IFormulaCurrentConfigService } from '../../../services/current-data.service';
import { DependencyManagerService, IDependencyManagerService } from '../../../services/dependency-manager.service';
import {
    FeatureCalculationManagerService,
    IFeatureCalculationManagerService,
} from '../../../services/feature-calculation-manager.service';
import { IFunctionService } from '../../../services/function.service';
import { IFormulaRuntimeService } from '../../../services/runtime.service';
import { Lexer } from '../../analysis/lexer';
import { LexerNode } from '../../analysis/lexer-node';
import { AstTreeBuilder } from '../../analysis/parser';
import { FormulaDependencyTree } from '../../dependency/dependency-tree';
import { IFormulaDependencyGenerator } from '../../dependency/formula-dependency';
import { Interpreter } from '../../interpreter/interpreter';
import { generateExecuteAstNodeData } from '../../utils/ast-node-tool';
import { BaseAstNode } from '../base-ast-node';

class CapturingDependencyManagerService extends DependencyManagerService {
    readonly capturedRanges = new Map<number, IUnitRange[]>();

    override addDependencyRTreeCache(tree: IFormulaDependencyTree): void {
        this.capturedRanges.set(tree.treeId, [...tree.rangeList]);
        super.addDependencyRTreeCache(tree);
    }
}

function createWorkbookData(): IWorkbookData {
    const sampleRowsBySheet: Record<string, Array<Array<number | string>>> = {
        jan: [
            [45148, 'Red', 1, 9],
            [45166, 'Blue', 7, 70],
            [45163, 'Green', 2, 16],
        ],
        feb: [
            [45174, 'Purple', 6, 72],
            [45177, 'Red', 2, 18],
            [45184, 'Purple', 2, 24],
            [45188, 'Green', 6, 48],
            [45194, 'Purple', 1, 12],
        ],
        mar: [
            [45200, 'Blue', 5, 50],
            [45205, 'Red', 4, 28],
            [45210, 'Green', 4, 32],
            [45213, 'Purple', 3, 36],
        ],
    };
    sampleRowsBySheet.sheet1 = sampleRowsBySheet.jan;
    sampleRowsBySheet.sheet2 = sampleRowsBySheet.feb;
    sampleRowsBySheet.sheet3 = sampleRowsBySheet.mar;

    const createSheet = (id: string, name: string, values: number[]) => {
        const cellData: Record<number, Record<number, { v: number | string; t: CellValueType }>> = {
            1: {
                1: { v: values[0], t: CellValueType.NUMBER },
                2: { v: values[1], t: CellValueType.NUMBER },
            },
            2: {
                1: { v: values[2], t: CellValueType.NUMBER },
                2: { v: values[3], t: CellValueType.NUMBER },
            },
        };
        sampleRowsBySheet[id]?.forEach((row, rowIndex) => {
            cellData[rowIndex + 4] = Object.fromEntries(
                row.map((value, columnIndex) => [
                    columnIndex + 1,
                    {
                        v: value,
                        t: typeof value === 'number' ? CellValueType.NUMBER : CellValueType.STRING,
                    },
                ])
            );
        });

        return {
            id,
            name,
            rowCount: 20,
            columnCount: 20,
            cellData,
        };
    };

    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: '3D reference',
        sheetOrder: ['jan', 'feb', 'mar', 'sheet1', 'sheet2', 'sheet3', 'result'],
        sheets: {
            jan: createSheet('jan', 'Jan', [1, 2, 3, 4]),
            feb: createSheet('feb', 'Feb', [10, 20, 30, 40]),
            mar: createSheet('mar', 'Mar', [100, 200, 300, 400]),
            sheet1: createSheet('sheet1', 'Sheet1', [0, 0, 0, 0]),
            sheet2: createSheet('sheet2', 'Sheet2', [0, 0, 0, 0]),
            sheet3: createSheet('sheet3', 'Sheet3', [0, 0, 0, 0]),
            result: createSheet('result', 'Result', [0, 0, 0, 0]),
        },
        styles: {},
    };
}

describe('three-dimensional sheet reference', () => {
    let calculate: (formula: string) => string | number | boolean | null | (string | number | boolean | null)[][];
    let currentConfigService: IFormulaCurrentConfigService;
    let dependencyGenerator: IFormulaDependencyGenerator;
    let dependencyManager: CapturingDependencyManagerService;
    let unitId: string;
    let activeSheetId: string;
    let sheetData: ISheetData;

    beforeEach(() => {
        const testBed = createFunctionTestBed(createWorkbookData(), [
            [IFeatureCalculationManagerService, { useClass: FeatureCalculationManagerService }],
            [IDependencyManagerService, { useClass: CapturingDependencyManagerService }],
        ]);
        const lexer = testBed.get(Lexer);
        const astTreeBuilder = testBed.get(AstTreeBuilder);
        const interpreter = testBed.get(Interpreter);
        currentConfigService = testBed.get(IFormulaCurrentConfigService);
        dependencyGenerator = testBed.get(IFormulaDependencyGenerator);
        const manager = testBed.get(IDependencyManagerService);
        if (!(manager instanceof CapturingDependencyManagerService)) {
            throw new TypeError('Expected CapturingDependencyManagerService');
        }
        dependencyManager = manager;
        const runtimeService = testBed.get(IFormulaRuntimeService);
        unitId = testBed.unitId;
        activeSheetId = testBed.sheetId;
        sheetData = testBed.sheetData;

        currentConfigService.load({
            formulaData: {},
            arrayFormulaCellData: {},
            arrayFormulaRange: {},
            forceCalculate: false,
            dirtyRanges: [],
            dirtyNameMap: {},
            dirtyDefinedNameMap: {},
            dirtyUnitFeatureMap: {},
            dirtyUnitOtherFormulaMap: {},
            excludedCell: {},
            allUnitData: {
                [testBed.unitId]: testBed.sheetData,
            },
        });

        const activeSheet = testBed.sheetData[testBed.sheetId];
        runtimeService.setCurrent(
            0,
            0,
            activeSheet.rowCount,
            activeSheet.columnCount,
            testBed.sheetId,
            testBed.unitId
        );
        testBed.get(IFunctionService).registerExecutors(
            new Sum(FUNCTION_NAMES_MATH.SUM),
            new Let(FUNCTION_NAMES_LOGICAL.LET),
            new Vstack(FUNCTION_NAMES_LOOKUP.VSTACK),
            new Filter(FUNCTION_NAMES_LOOKUP.FILTER),
            new Choosecols(FUNCTION_NAMES_LOOKUP.CHOOSECOLS),
            new Compare(FUNCTION_NAMES_META.COMPARE)
        );

        calculate = (formula: string) => {
            const lexerNode = lexer.treeBuilder(formula);
            if (!(lexerNode instanceof LexerNode)) {
                throw new TypeError(`Failed to parse formula: ${formula}`);
            }
            const astNode = astTreeBuilder.parse(lexerNode);
            if (!(astNode instanceof BaseAstNode)) {
                throw new TypeError(`Failed to build AST: ${formula}`);
            }
            const result = interpreter.execute(generateExecuteAstNodeData(astNode));
            return getObjectValue(result);
        };
    });

    it('sums the same cell from every sheet in the inclusive range', () => {
        expect(calculate('=SUM(Jan:Mar!B2)')).toBe(111);
        expect(calculate("=SUM('Jan':'Mar'!B2)")).toBe(111);
    });

    it('sums every cell from every sheet instead of only each area first cell', () => {
        expect(calculate('=SUM(Jan:Mar!B2:C3)')).toBe(1110);
    });

    it('calculates the combine-data sample formula with all 12 source rows', () => {
        expect(calculate('=LET(data,VSTACK(Sheet1:Sheet3!B5:E16),FILTER(data,CHOOSECOLS(data,1)<>""))')).toEqual([
            [45148, 'Red', 1, 9],
            [45166, 'Blue', 7, 70],
            [45163, 'Green', 2, 16],
            [45174, 'Purple', 6, 72],
            [45177, 'Red', 2, 18],
            [45184, 'Purple', 2, 24],
            [45188, 'Green', 6, 48],
            [45194, 'Purple', 1, 12],
            [45200, 'Blue', 5, 50],
            [45205, 'Red', 4, 28],
            [45210, 'Green', 4, 32],
            [45213, 'Purple', 3, 36],
        ]);
    });

    it('tracks every sheet in the range as a dependency', async () => {
        currentConfigService.load({
            formulaData: {
                [unitId]: {
                    [activeSheetId]: {
                        0: {
                            0: { f: '=SUM(Jan:Mar!B2)' },
                        },
                    },
                },
            },
            arrayFormulaCellData: {},
            arrayFormulaRange: {},
            forceCalculate: false,
            dirtyRanges: [{
                unitId,
                sheetId: activeSheetId,
                range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 },
            }],
            dirtyNameMap: {},
            dirtyDefinedNameMap: {},
            dirtyUnitFeatureMap: {},
            dirtyUnitOtherFormulaMap: {},
            excludedCell: {},
            allUnitData: {
                [unitId]: sheetData,
            },
        });

        const trees = await dependencyGenerator.generate();
        const tree = trees.find(
            (item): item is FormulaDependencyTree =>
                item instanceof FormulaDependencyTree && item.formula === '=SUM(Jan:Mar!B2)'
        );

        if (!tree) {
            throw new TypeError('Expected a dependency tree for the 3D reference');
        }
        expect(dependencyManager.capturedRanges.get(tree.treeId)?.map(({ sheetId }) => sheetId)).toEqual([
            'jan',
            'feb',
            'mar',
        ]);
    });
});
