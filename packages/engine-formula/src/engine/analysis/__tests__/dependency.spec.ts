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

import type { ICellData, Injector } from '@univerjs/core';
import { ObjectMatrix, Styles } from '@univerjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
    IDirtyUnitDefinedNameMap,
    IDirtyUnitSheetNameMap,
    IDirtyUnitSuperTableMap,
    IFormulaDatasetConfig,
    IUnitExcludedCell,
    IUnitSheetIdToNameMap,
} from '../../../basics/common';
import type { FormulaDependencyTreeVirtual } from '../../dependency/dependency-tree';
import { ErrorType } from '../../../basics/error-type';
import { FUNCTION_NAMES_LOOKUP } from '../../../functions/lookup/function-names';
import { Index } from '../../../functions/lookup/index';
import { Indirect } from '../../../functions/lookup/indirect';
import { Sum } from '../../../functions/math/sum';
import { ICalculateFormulaService } from '../../../services/calculate-formula.service';
import { IFormulaCurrentConfigService } from '../../../services/current-data.service';
import { IDefinedNamesService } from '../../../services/defined-names.service';
import { IDependencyManagerService } from '../../../services/dependency-manager.service';
import { IFeatureCalculationManagerService } from '../../../services/feature-calculation-manager.service';
import { IFunctionService } from '../../../services/function.service';
import { IOtherFormulaManagerService } from '../../../services/other-formula-manager.service';
import { IFormulaRuntimeService } from '../../../services/runtime.service';
import { FormulaDependencyTree } from '../../dependency/dependency-tree';
import { IFormulaDependencyGenerator } from '../../dependency/formula-dependency';
import { Interpreter } from '../../interpreter/interpreter';
import { FORMULA_AST_CACHE } from '../../utils/generate-ast-node';
import { ErrorValueObject } from '../../value-object/base-value-object';
import { createCommandTestBed } from './create-command-test-bed';

describe('value-dependent reference ranges', () => {
    it.each(['InputData', 'inputdata'])('rebinds %s after named-range expansion and later source edits', async (name) => {
        FORMULA_AST_CACHE.clear();
        const bed = createCommandTestBed();
        try {
            bed.get(IFunctionService).registerExecutors(new Sum('SUM'));
            const cells = bed.sheetData[bed.sheetId].cellData;
            for (let row = 0; row < 4; row++) {
                cells.setValue(row, 0, { v: row + 1 });
            }
            const names = bed.get(IDefinedNamesService);
            const setName = (end: number) => names.registerDefinedName(bed.unitId, {
                id: 'input-data',
                name: 'InputData',
                formulaOrRefString: `Main!$A$1:$A$${end}`,
            });
            const service = bed.get(ICalculateFormulaService);
            let actual: unknown;
            service.executionCompleteListener$.subscribe((data) => {
                actual = data.unitData[bed.unitId]?.[bed.sheetId]?.getValue(0, 5)?.v;
            });
            const calculate = async (forceCalculate: boolean, nameChanged = false) => {
                await service.execute({
                    formulaData: { [bed.unitId]: { [bed.sheetId]: { 0: { 5: { f: `=SUM(${name})` } } } } },
                    arrayFormulaCellData: {},
                    arrayFormulaRange: {},
                    forceCalculate,
                    dirtyRanges: forceCalculate
                        ? []
                        : [{ unitId: bed.unitId, sheetId: bed.sheetId, range: {
                            startRow: 3,
                            endRow: 3,
                            startColumn: 0,
                            endColumn: 0,
                        } }],
                    dirtyNameMap: {},
                    dirtyDefinedNameMap: nameChanged ? { [bed.unitId]: { InputData: 'Main!$A$1:$A$4' } } : {},
                    dirtySuperTableMap: {},
                    dirtyUnitFeatureMap: {},
                    dirtyUnitOtherFormulaMap: {},
                    clearDependencyTreeCache: {},
                    excludedCell: {},
                    unitSheetNameMap: { [bed.unitId]: { Main: bed.sheetId } },
                    allUnitData: { [bed.unitId]: bed.sheetData },
                });
                return actual;
            };
            setName(2);
            expect(await calculate(true)).toBe(3);
            setName(4);
            expect(await calculate(true, true)).toBe(10);
            cells.setValue(3, 0, { v: 40 });
            expect(await calculate(false)).toBe(46);
        } finally {
            bed.univer.dispose();
        }
    });
    it.each([
        ['vertical', false],
        ['vertical', true],
        ['horizontal', false],
        ['horizontal', true],
    ] as const)('updates %s INDEX endpoints after a selector edit (forced: %s)', async (direction, forceSelector) => {
        FORMULA_AST_CACHE.clear();
        const bed = createCommandTestBed();
        try {
            bed.get(IFunctionService).registerExecutors(new Index('INDEX'), new Sum('SUM'));
            const service = bed.get(ICalculateFormulaService);
            const horizontal = direction === 'horizontal';
            const formula = horizontal ? '=SUM(A1:INDEX(A1:D1,1,G1))' : '=SUM(A1:INDEX(A1:A4,D1))';
            const selector = horizontal ? [0, 6] : [0, 3];
            const last = horizontal ? [0, 3] : [3, 0];
            let hostValue: number | undefined;
            service.executionCompleteListener$.subscribe((data) => {
                const value = data.unitData[bed.unitId]?.[bed.sheetId]?.getValue(0, 5)?.v;
                if (typeof value === 'number') {
                    hostValue = value;
                }
            });
            const calculate = async (length: number, lastValue: number, dirty: number[], forceCalculate: boolean) => {
                const cells = new ObjectMatrix<ICellData>({});
                for (let index = 0; index < 4; index++) {
                    cells.setValue(horizontal ? 0 : index, horizontal ? index : 0, { v: index === 3 ? lastValue : index + 1 });
                }
                cells.setValue(selector[0], selector[1], { v: length });
                cells.setValue(0, 5, { f: formula, v: hostValue });
                await service.execute({
                    formulaData: { [bed.unitId]: { [bed.sheetId]: { 0: { 5: { f: formula } } } } },
                    arrayFormulaCellData: {},
                    arrayFormulaRange: {},
                    forceCalculate,
                    dirtyRanges: [{ unitId: bed.unitId, sheetId: bed.sheetId, range: { startRow: dirty[0], endRow: dirty[0], startColumn: dirty[1], endColumn: dirty[1] } }],
                    dirtyNameMap: {},
                    dirtyDefinedNameMap: {},
                    dirtySuperTableMap: {},
                    dirtyUnitFeatureMap: {},
                    dirtyUnitOtherFormulaMap: {},
                    clearDependencyTreeCache: {},
                    excludedCell: {},
                    unitSheetNameMap: { [bed.unitId]: { Main: bed.sheetId } },
                    unitStylesData: { [bed.unitId]: new Styles({}) },
                    allUnitData: { [bed.unitId]: { [bed.sheetId]: { cellData: cells, rowCount: 100, columnCount: 20, rowData: {}, columnData: {} } } },
                } as IFormulaDatasetConfig);
                return hostValue;
            };
            expect(await calculate(2, 4, selector, true)).toBe(3);
            expect(await calculate(4, 4, selector, forceSelector)).toBe(10);
            expect(await calculate(4, 40, last, false)).toBe(46);
            expect(await calculate(1, 40, selector, false)).toBe(1);
            expect(await calculate(1, 5, last, false)).toBe(1);
            expect(await calculate(4, 5, selector, false)).toBe(11);
        } finally {
            bed.univer.dispose();
        }
    });
});

describe('Test dependency', () => {
    let get: Injector['get'];
    let formulaDependencyGenerator: IFormulaDependencyGenerator;
    let formulaCurrentConfigService: IFormulaCurrentConfigService;
    let otherFormulaManagerService: IOtherFormulaManagerService;
    let testUnitId = 'test';
    let testSheetId = 'sheet1';
    let testSheetData = {};
    beforeEach(() => {
        const testBed = createCommandTestBed();

        get = testBed.get;

        formulaDependencyGenerator = get(IFormulaDependencyGenerator);

        formulaCurrentConfigService = get(IFormulaCurrentConfigService);

        otherFormulaManagerService = get(IOtherFormulaManagerService);

        const formulaRuntimeService = get(IFormulaRuntimeService);

        const sheetItem = testBed.sheetData[testBed.sheetId];

        testUnitId = testBed.unitId;
        testSheetId = testBed.sheetId;
        testSheetData = testBed.sheetData;

        formulaRuntimeService.setCurrent(
            0,
            0,
            sheetItem.rowCount,
            sheetItem.columnCount,
            testBed.sheetId,
            testBed.unitId
        );
    });

    describe('dependency normal', () => {
        it('test formula dependency simple ref', async () => {
            const testOtherFormulaId = 'sheet.cf_workbook-01_Q2oij1uNg7HLUT7aT2ikk_yhq9VWH_';
            const testOtherFormulaId2 = 'sheet.cf_workbook-01_Q2oij1uNg7HLUT7aT2ikk_idjs46G_';
            formulaCurrentConfigService.load({
                formulaData: {
                    [testUnitId]: {
                        [testSheetId]: {
                            3: {
                                12: {
                                    f: '=SUM(F27:J34)',
                                },
                            },
                            9: {
                                4: {
                                    f: '=A1:C4',
                                },
                            },
                            16: {
                                8: {
                                    f: '=SUM(E10:G13)',
                                },
                            },
                            22: {
                                6: {
                                    f: '=SUM(E10:I17)',
                                },
                            },
                            26: {
                                5: {
                                    f: '=E10:I23',
                                },
                            },
                        },
                    },
                },
                arrayFormulaCellData: {},
                arrayFormulaRange: {},
                forceCalculate: false,
                dirtyRanges: [
                    {
                        range: {
                            startRow: 0,
                            startColumn: 0,
                            endRow: 0,
                            endColumn: 0,
                        },
                        unitId: testUnitId,
                        sheetId: testSheetId,
                    },
                ],
                dirtyNameMap: {},
                dirtyDefinedNameMap: {},
                dirtyUnitFeatureMap: {},
                dirtyUnitOtherFormulaMap: {
                    [testUnitId]: {
                        [testSheetId]: {
                            [testOtherFormulaId]: true,
                            [testOtherFormulaId2]: true,
                        },
                    },
                },
                excludedCell: {},
                allUnitData: {
                    [testUnitId]: testSheetData,
                },
            });

            otherFormulaManagerService.batchRegister({
                [testUnitId]: {
                    [testSheetId]: {
                        [testOtherFormulaId]: {
                            f: '=A1>1',
                            ranges: [
                                {
                                    startRow: 0,
                                    startColumn: 0,
                                    endRow: 2,
                                    endColumn: 0,
                                    startAbsoluteRefType: 0,
                                    endAbsoluteRefType: 0,
                                    rangeType: 0,
                                },
                            ],
                        },
                        [testOtherFormulaId2]: {
                            f: '=A1>1',
                            ranges: [
                                {
                                    startRow: 0,
                                    startColumn: 0,
                                    endRow: 0,
                                    endColumn: 0,
                                },
                            ],
                        },
                    },
                },
            });

            const treeList = await formulaDependencyGenerator.generate();
            const treeJson = treeList.map((tree) => tree instanceof FormulaDependencyTree ? tree.formula : tree.refTree?.formula).reverse();

            expect(treeJson).toEqual(
                [
                    '=A1:C4',
                    '=SUM(E10:G13)',
                    '=SUM(E10:I17)',
                    '=E10:I23',
                    '=SUM(F27:J34)',
                    '=A1>1',
                    '=A1>1',
                    '=A1>1',
                    '=A1>1',
                ]
            );

            // Check the offset position of other formula
            // Note that the order is reversed
            const tree = treeList[2] as FormulaDependencyTreeVirtual;
            expect(tree.refOffsetX).toEqual(0);
            expect(tree.refOffsetY).toEqual(1);

            const tree2 = treeList[1] as FormulaDependencyTreeVirtual;
            expect(tree2.refOffsetX).toEqual(0);
            expect(tree2.refOffsetY).toEqual(2);
        });

        it('limits other formulas without sheet dimensions to one result slot', async () => {
            const formulaId = 'formula.shape-unit_shape_shape_shape-1_test';
            formulaCurrentConfigService.load({
                formulaData: {},
                arrayFormulaCellData: {},
                arrayFormulaRange: {},
                forceCalculate: false,
                dirtyRanges: [],
                dirtyNameMap: {},
                dirtyDefinedNameMap: {},
                dirtyUnitFeatureMap: {},
                dirtyUnitOtherFormulaMap: {
                    'shape-unit': {
                        shape: {
                            [formulaId]: true,
                        },
                    },
                },
                excludedCell: {},
                allUnitData: {
                    [testUnitId]: testSheetData,
                },
            });

            otherFormulaManagerService.batchRegister({
                'shape-unit': {
                    shape: {
                        [formulaId]: {
                            f: '=1',
                            ranges: [{
                                startRow: 0,
                                endRow: 2,
                                startColumn: 0,
                                endColumn: 2,
                            }],
                        },
                    },
                },
            });

            const treeList = await formulaDependencyGenerator.generate();
            const shapeTrees = treeList.filter((tree) => tree.formulaId === formulaId);

            expect(shapeTrees).toHaveLength(1);
            expect(shapeTrees[0]).toBeInstanceOf(FormulaDependencyTree);
        });

        it('should generate virtual dependency trees for shared formulas with offsets', async () => {
            formulaCurrentConfigService.load({
                formulaData: {
                    [testUnitId]: {
                        [testSheetId]: {
                            0: {
                                1: {
                                    f: '=A1',
                                    si: 'shared-formula-1',
                                },
                            },
                            1: {
                                1: {
                                    f: '=A1',
                                    si: 'shared-formula-1',
                                    x: 0,
                                    y: 1,
                                },
                            },
                            2: {
                                1: {
                                    f: '=A1',
                                    si: 'shared-formula-1',
                                    x: 0,
                                    y: 2,
                                },
                            },
                        },
                    },
                },
                arrayFormulaCellData: {},
                arrayFormulaRange: {},
                forceCalculate: true,
                dirtyRanges: [],
                dirtyNameMap: {},
                dirtyDefinedNameMap: {},
                dirtyUnitFeatureMap: {},
                dirtyUnitOtherFormulaMap: {},
                excludedCell: {},
                allUnitData: {
                    [testUnitId]: testSheetData,
                },
            });

            const treeList = await formulaDependencyGenerator.generate();
            const realTree = treeList.find((tree): tree is FormulaDependencyTree => tree instanceof FormulaDependencyTree && tree.row === 0 && tree.column === 1);
            const virtualTrees = treeList.filter((tree): tree is FormulaDependencyTreeVirtual => !(tree instanceof FormulaDependencyTree));

            expect(realTree?.formula).toBe('=A1');
            expect(virtualTrees).toHaveLength(2);
            expect(virtualTrees
                .map((tree) => [tree.refTree, tree.refOffsetX, tree.refOffsetY])
                .sort((a, b) => Number(a[2]) - Number(b[2]))).toEqual([
                [realTree, 0, 1],
                [realTree, 0, 2],
            ]);
        });

        it('orders a newly registered feature after formulas in its dependency range', async () => {
            formulaCurrentConfigService.load({
                formulaData: {
                    [testUnitId]: {
                        [testSheetId]: {
                            0: {
                                1: { f: '=A1' },
                            },
                        },
                    },
                },
                arrayFormulaCellData: {},
                arrayFormulaRange: {},
                forceCalculate: false,
                dirtyRanges: [{
                    unitId: testUnitId,
                    sheetId: testSheetId,
                    range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
                }],
                dirtyNameMap: {},
                dirtyDefinedNameMap: {},
                dirtyUnitFeatureMap: {},
                dirtyUnitOtherFormulaMap: {},
                excludedCell: {},
                allUnitData: {
                    [testUnitId]: testSheetData,
                },
            });

            get(IFeatureCalculationManagerService).register(testUnitId, testSheetId, 'feature-1', {
                unitId: testUnitId,
                subUnitId: testSheetId,
                dependencyRanges: [{
                    unitId: testUnitId,
                    sheetId: testSheetId,
                    range: { startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 },
                }],
                getDirtyData: () => ({
                    runtimeCellData: {},
                    dirtyRanges: {
                        [testUnitId]: {
                            [testSheetId]: [{ startRow: 0, endRow: 0, startColumn: 2, endColumn: 2 }],
                        },
                    },
                }),
            });

            const treeList = await formulaDependencyGenerator.generate();
            const executionOrder = treeList.toReversed().map((tree) => tree.featureId ?? tree.formula);

            expect(executionOrder).toEqual(['=A1', 'feature-1']);
        });

        it('ignores a non-reference result while collecting dependency ranges', async () => {
            formulaCurrentConfigService.load({
                formulaData: {
                    [testUnitId]: {
                        [testSheetId]: {
                            0: {
                                0: { f: '=A1' },
                            },
                        },
                    },
                },
                arrayFormulaCellData: {},
                arrayFormulaRange: {},
                forceCalculate: true,
                dirtyRanges: [],
                dirtyNameMap: {},
                dirtyDefinedNameMap: {},
                dirtyUnitFeatureMap: {},
                dirtyUnitOtherFormulaMap: {},
                excludedCell: {},
                allUnitData: {
                    [testUnitId]: testSheetData,
                },
            });
            vi.spyOn(get(Interpreter), 'execute').mockReturnValue(ErrorValueObject.create(ErrorType.REF));

            await expect(formulaDependencyGenerator.generate()).resolves.toHaveLength(1);
        });
    });

    describe('dependency reuse', () => {
        const load = (formula: string, options: {
            forceCalculate?: boolean;
            dirtyDefinedNameMap?: IDirtyUnitDefinedNameMap;
            dirtyNameMap?: IDirtyUnitSheetNameMap;
            dirtySuperTableMap?: IDirtyUnitSuperTableMap;
            clearDependencyTreeCache?: IUnitSheetIdToNameMap;
            excludedCell?: IUnitExcludedCell;
            sheetData?: unknown;
            sheetNameMap?: Record<string, string>;
        } = {}) => {
            formulaCurrentConfigService.load({
                formulaData: {
                    [testUnitId]: {
                        [testSheetId]: {
                            0: {
                                2: { f: formula },
                            },
                        },
                    },
                },
                arrayFormulaCellData: {},
                arrayFormulaRange: {},
                forceCalculate: options.forceCalculate ?? false,
                dirtyRanges: [{
                    unitId: testUnitId,
                    sheetId: testSheetId,
                    range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
                }],
                dirtyNameMap: options.dirtyNameMap ?? {},
                dirtyDefinedNameMap: options.dirtyDefinedNameMap ?? {},
                dirtySuperTableMap: options.dirtySuperTableMap ?? {},
                dirtyUnitFeatureMap: {},
                dirtyUnitOtherFormulaMap: {},
                clearDependencyTreeCache: options.clearDependencyTreeCache ?? {},
                excludedCell: options.excludedCell ?? {},
                unitSheetNameMap: { [testUnitId]: { Sheet1: testSheetId, ...options.sheetNameMap } },
                unitStylesData: { [testUnitId]: new Styles({}) },
                allUnitData: {
                    [testUnitId]: (options.sheetData ?? testSheetData) as never,
                },
            });
        };

        const spyRangeList = () => vi.spyOn(formulaDependencyGenerator as unknown as {
            _getRangeListByNode: () => unknown;
        }, '_getRangeListByNode');

        const rTreeEntryCount = () => {
            const dependencyManagerService = get(IDependencyManagerService) as unknown as {
                _dependencyRTreeCache: { getTree: (unitId: string, sheetId: string) => { all: () => unknown[] } };
            };
            return dependencyManagerService._dependencyRTreeCache.getTree(testUnitId, testSheetId).all().length;
        };

        it('reuses the resolved ranges of an unchanged formula', async () => {
            load('=SUM(A1:B10)', { forceCalculate: true });
            await formulaDependencyGenerator.generate();

            expect(rTreeEntryCount()).toBe(1);

            const spy = spyRangeList();
            load('=SUM(A1:B10)');
            await formulaDependencyGenerator.generate();

            expect(spy).not.toHaveBeenCalled();
            // Reusing the ranges also means the index entry is left untouched.
            expect(rTreeEntryCount()).toBe(1);
        });

        it('keeps the reused formula in the calculation when a referenced cell changes', async () => {
            load('=SUM(A1:B10)', { forceCalculate: true });
            await formulaDependencyGenerator.generate();

            const spy = spyRangeList();
            // The dirty range from the helper covers A1, which the formula references.
            load('=SUM(A1:B10)');
            const treeList = await formulaDependencyGenerator.generate();

            expect(spy).not.toHaveBeenCalled();
            expect(treeList).toHaveLength(1);
        });

        it('recomputes when the formula text changes', async () => {
            load('=SUM(A1:B10)', { forceCalculate: true });
            await formulaDependencyGenerator.generate();

            get(IDependencyManagerService).removeFormulaDependency(testUnitId, testSheetId, 0, 2);

            const spy = spyRangeList();
            load('=SUM(A1:C10)');
            await formulaDependencyGenerator.generate();

            expect(spy).toHaveBeenCalledTimes(1);
            expect(rTreeEntryCount()).toBe(1);
        });

        it('recomputes when a sheet name is dirty', async () => {
            load('=SUM(A1:B10)', { forceCalculate: true });
            await formulaDependencyGenerator.generate();

            const spy = spyRangeList();
            load('=SUM(A1:B10)', { dirtyNameMap: { [testUnitId]: { [testSheetId]: 'Renamed' } } });
            await formulaDependencyGenerator.generate();

            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('recomputes when the sheet size changes', async () => {
            load('=SUM(A1:B10)', { forceCalculate: true });
            await formulaDependencyGenerator.generate();

            const spy = spyRangeList();
            load('=SUM(A1:B10)', {
                sheetData: {
                    ...(testSheetData as Record<string, Record<string, unknown>>),
                    [testSheetId]: {
                        ...(testSheetData as Record<string, Record<string, unknown>>)[testSheetId],
                        rowCount: 200,
                    },
                },
            });
            await formulaDependencyGenerator.generate();

            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('recomputes when a referenced sheet is resized', async () => {
            const sheetData = (rowCount: number) => ({
                ...(testSheetData as Record<string, unknown>),
                sheet2: {
                    cellData: new ObjectMatrix({ 0: { 0: { v: 1 } } }),
                    rowCount,
                    columnCount: 20,
                },
            });

            load('=SUM(Sheet2!A:A)', {
                forceCalculate: true,
                sheetData: sheetData(100),
                sheetNameMap: { Sheet2: 'sheet2' },
            });
            await formulaDependencyGenerator.generate();

            const spy = spyRangeList();
            // Only the referenced sheet is resized; the formula sheet and its AST are untouched,
            // but an open-ended reference is clipped to the size of the sheet it points at.
            load('=SUM(Sheet2!A:A)', {
                sheetData: sheetData(200),
                sheetNameMap: { Sheet2: 'sheet2' },
            });
            await formulaDependencyGenerator.generate();

            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('reuses the ranges but re-indexes after a forced calculation', async () => {
            load('=SUM(A1:B10)', { forceCalculate: true });
            await formulaDependencyGenerator.generate();

            const spy = spyRangeList();
            load('=SUM(A1:B10)', { forceCalculate: true });
            await formulaDependencyGenerator.generate();

            // The ranges come from the still cached AST.
            expect(spy).not.toHaveBeenCalled();
            // The forced calculation reset the index, so the tree has to be written again.
            expect(rTreeEntryCount()).toBe(1);
        });

        it('recomputes when the dependency tree cache is cleared', async () => {
            load('=SUM(A1:B10)', { forceCalculate: true });
            await formulaDependencyGenerator.generate();

            const spy = spyRangeList();
            load('=SUM(A1:B10)', { clearDependencyTreeCache: { [testUnitId]: { [testSheetId]: 'Sheet1' } } });
            await formulaDependencyGenerator.generate();

            // A cleared dependency cache also drops the resolved ranges, so they are rebuilt.
            expect(spy).toHaveBeenCalledTimes(1);
            expect(rTreeEntryCount()).toBe(1);
        });

        it('recomputes when a defined name change marks the formula dirty', async () => {
            load('=SUM(A1:B10)', { forceCalculate: true });
            await formulaDependencyGenerator.generate();

            const spy = spyRangeList();
            // Dirty defined-name entries are keyed by the affected formula text; the AST cache
            // rebuilds those formulas, so the range list is resolved again from a new AST.
            load('=SUM(A1:B10)', { dirtyDefinedNameMap: { [testUnitId]: { 'SUM(A1:B10)': 'changed' } } });
            await formulaDependencyGenerator.generate();

            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('keeps reusing a formula that a super table change does not reference', async () => {
            load('=SUM(A1:B10)', { forceCalculate: true });
            await formulaDependencyGenerator.generate();

            const spy = spyRangeList();
            // The dirty table is not referenced by this formula, so its AST (and the ranges
            // resolved from it) stay valid.
            load('=SUM(A1:B10)', { dirtySuperTableMap: { [testUnitId]: { table1: 'changed' } } });
            await formulaDependencyGenerator.generate();

            expect(spy).not.toHaveBeenCalled();
        });

        it('does not reuse a formula whose references resolve while executing', async () => {
            // INDIRECT is only flagged as an address function when its executor is registered.
            get(IFunctionService).registerExecutors(new Indirect(FUNCTION_NAMES_LOOKUP.INDIRECT));

            load('=INDIRECT("A1")', { forceCalculate: true });
            await formulaDependencyGenerator.generate();

            const spy = spyRangeList();
            load('=INDIRECT("A1")');
            await formulaDependencyGenerator.generate();

            // The ranges are resolved again because the target only exists at execution time.
            expect(spy).toHaveBeenCalled();
        });

        it('does not reuse a cell excluded from the calculation', async () => {
            load('=SUM(A1:B10)', { forceCalculate: true });
            await formulaDependencyGenerator.generate();

            const spy = spyRangeList();
            load('=SUM(A1:B10)', {
                excludedCell: {
                    [testUnitId]: {
                        [testSheetId]: new ObjectMatrix<boolean>({ 0: { 2: true } }),
                    },
                },
            });
            await formulaDependencyGenerator.generate();

            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('recomputes after the AST cache is invalidated for a function', async () => {
            load('=SUM(A1:B10)', { forceCalculate: true });
            await formulaDependencyGenerator.generate();

            const spy = spyRangeList();
            // Unregistering a function removes its cached ASTs, so the next calculation parses
            // the formula again and the range list is resolved from the new AST.
            get(IFunctionService).deleteFormulaAstCacheKey('SUM' as never);
            load('=SUM(A1:B10)');
            await formulaDependencyGenerator.generate();

            expect(spy).toHaveBeenCalled();
        });

        it('does not reuse a formula that failed to parse', async () => {
            load('=1+', { forceCalculate: true });
            await formulaDependencyGenerator.generate();

            const spy = spyRangeList();
            load('=1+');
            await formulaDependencyGenerator.generate();

            expect(spy).toHaveBeenCalled();
        });
    });
});
