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

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorType } from '../../basics/error-type';
import { ENGINE_FORMULA_PLUGIN_CONFIG_KEY } from '../../controllers/config.schema';
import { FORMULA_REF_TO_ARRAY_CACHE } from '../../engine/reference-object/base-reference-object';
import { CalculateFormulaService } from '../calculate-formula.service';
import { FormulaExecuteStageType } from '../runtime.service';

function createService() {
    const configService = {
        getConfig: vi.fn(() => ({ intervalCount: 9999 })),
    };
    const lexer = {
        treeBuilder: vi.fn(),
    };
    const currentConfigService = {
        load: vi.fn(),
        loadDataLite: vi.fn(),
        loadDirtyRangesAndExcludedCell: vi.fn(),
        getRuntimeState: vi.fn(),
        getUnitData: vi.fn(() => ({
            unit: {
                sheet: {
                    rowCount: 20,
                    columnCount: 10,
                },
            },
        })),
        getDirtyData: vi.fn(() => ({})),
    };
    const runtimeService = {
        setFormulaExecuteStage: vi.fn(),
        getRuntimeState: vi.fn(() => ({ stage: FormulaExecuteStageType.IDLE })),
        reset: vi.fn(),
        setFormulaCycleIndex: vi.fn(),
        isCycleDependency: vi.fn(() => false),
        setRuntimeFeatureCellData: vi.fn(),
        setRuntimeFeatureRange: vi.fn(),
        stopExecution: vi.fn(),
        getAllRuntimeData: vi.fn(() => ({
            unitData: {},
            unitOtherData: {},
            arrayFormulaRange: {},
            arrayFormulaEmbedded: {},
            functionsExecutedState: 0,
            arrayFormulaCellData: {},
            clearArrayFormulaCellData: {},
            imageFormulaData: [],
            runtimeFeatureRange: {},
            runtimeFeatureCellData: {},
            dependencyTreeModelData: [],
        })),
        setTotalArrayFormulasToCalculate: vi.fn(),
        setTotalFormulasToCalculate: vi.fn(),
        setCompletedArrayFormulasCount: vi.fn(),
        setCompletedFormulasCount: vi.fn(),
        isStopExecution: vi.fn(() => false),
        setCurrent: vi.fn(),
        setRuntimeData: vi.fn(),
        setRuntimeOtherData: vi.fn(),
        markedAsSuccessfullyExecuted: vi.fn(),
        markedAsNoFunctionsExecuted: vi.fn(),
        markedAsStopFunctionsExecuted: vi.fn(),
    };
    const formulaDependencyGenerator = {
        generate: vi.fn(async () => []),
        getAllDependencyJson: vi.fn(async () => [{ treeId: 1 }]),
        getCellDependencyJson: vi.fn(async () => ({ treeId: 2 })),
        getRangeDependents: vi.fn(async () => [{ treeId: 3 }]),
        getInRangeFormulas: vi.fn(async () => [{ treeId: 4 }]),
        getRangeDependentsAndInRangeFormulas: vi.fn(async () => ({ dependents: [], inRanges: [] })),
    };
    const interpreter = {
        checkAsyncNode: vi.fn(() => false),
        executeAsync: vi.fn(async () => ({ async: true })),
        execute: vi.fn(() => ({ value: true })),
    };
    const astTreeBuilder = {
        parse: vi.fn(),
    };

    const service = new CalculateFormulaService(
        configService as never,
        lexer as never,
        currentConfigService as never,
        runtimeService as never,
        formulaDependencyGenerator as never,
        interpreter as never,
        astTreeBuilder as never
    );

    // Make execution deterministic in tests.
    (service as any)._executeLock = {
        acquire: vi.fn(async (_key: string, callback: () => Promise<void>) => {
            await callback();
        }),
    };

    return {
        service,
        mocks: {
            configService,
            lexer,
            currentConfigService,
            runtimeService,
            formulaDependencyGenerator,
            interpreter,
            astTreeBuilder,
        },
    };
}

describe('CalculateFormulaService', () => {
    beforeEach(() => {
        FORMULA_REF_TO_ARRAY_CACHE.clear();
    });

    it('should forward stop and feature runtime setters', () => {
        const { service, mocks } = createService();

        service.stopFormulaExecution();
        expect(mocks.runtimeService.stopExecution).toHaveBeenCalledTimes(1);

        service.setRuntimeFeatureCellData('feature-1', { unit: {} } as never);
        expect(mocks.runtimeService.setRuntimeFeatureCellData).toHaveBeenCalledWith('feature-1', { unit: {} });

        service.setRuntimeFeatureRange('feature-1', { unit: {} } as never);
        expect(mocks.runtimeService.setRuntimeFeatureRange).toHaveBeenCalledWith('feature-1', { unit: {} });
    });

    it('should execute by cycle and notify progress/completion', async () => {
        const { service, mocks } = createService();
        const executeStepSpy = vi.spyOn(service as any, '_executeStep')
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(true);
        mocks.runtimeService.isCycleDependency
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(false);

        const progress: any[] = [];
        const complete: any[] = [];
        const completedPromise = new Promise<void>((resolve) => {
            service.executionCompleteListener$.subscribe(() => resolve());
        });
        service.executionInProgressListener$.subscribe((state) => progress.push(state));
        service.executionCompleteListener$.subscribe((data) => complete.push(data));

        await service.execute({
            formulaData: {},
            arrayFormulaCellData: {},
            arrayFormulaRange: {},
            forceCalculate: true,
            dirtyRanges: [],
            dirtyNameMap: {},
            dirtyDefinedNameMap: {},
            dirtyUnitFeatureMap: {},
            dirtyUnitOtherFormulaMap: {},
            maxIteration: 3,
        } as never);
        await completedPromise;

        expect(executeStepSpy).toHaveBeenCalledTimes(2);
        expect(mocks.currentConfigService.load).toHaveBeenCalledTimes(1);
        expect(mocks.runtimeService.setFormulaCycleIndex).toHaveBeenCalledWith(0);
        expect(mocks.runtimeService.setFormulaCycleIndex).toHaveBeenCalledWith(1);
        expect(mocks.runtimeService.setFormulaExecuteStage).toHaveBeenCalledWith(FormulaExecuteStageType.CALCULATION_COMPLETED);
        expect(progress.length).toBeGreaterThanOrEqual(2);
        expect(complete.length).toBe(1);
        expect(mocks.runtimeService.reset).toHaveBeenCalledTimes(2);
    });

    it('should merge array dirty ranges and excluded cells', () => {
        const { service } = createService();
        const result = (service as any)._getArrayFormulaDirtyRangeAndExcludedRange(
            {
                u1: {
                    s1: {
                        0: {
                            1: {
                                startRow: 1,
                                endRow: 2,
                                startColumn: 3,
                                endColumn: 4,
                            },
                        },
                    },
                },
            },
            {
                featureA: {
                    u2: {
                        s2: [
                            { startRow: 7, endRow: 7, startColumn: 8, endColumn: 8 },
                        ],
                    },
                },
            }
        );

        expect(result.dirtyRanges).toEqual([
            {
                unitId: 'u1',
                sheetId: 's1',
                range: { startRow: 1, endRow: 2, startColumn: 3, endColumn: 4 },
            },
            {
                unitId: 'u2',
                sheetId: 's2',
                range: { startRow: 7, endRow: 7, startColumn: 8, endColumn: 8 },
            },
        ]);
        expect(result.excludedCell.u1?.s1?.getValue(0, 1)).toBe(true);
    });

    it('should execute extra apply when array dirty ranges exist', async () => {
        const { service, mocks } = createService();
        const applySpy = vi.spyOn(service as any, '_apply')
            .mockResolvedValueOnce({
                arrayFormulaRange: {
                    u1: {
                        s1: {
                            0: {
                                0: {
                                    startRow: 1,
                                    endRow: 1,
                                    startColumn: 1,
                                    endColumn: 1,
                                },
                            },
                        },
                    },
                },
                runtimeFeatureRange: {},
            })
            .mockResolvedValueOnce({
                arrayFormulaRange: {},
                runtimeFeatureRange: {},
            });

        await (service as any)._executeStep();
        expect(mocks.currentConfigService.loadDirtyRangesAndExcludedCell).toHaveBeenCalledTimes(1);
        expect(applySpy).toHaveBeenNthCalledWith(2, true);
    });

    it('should skip second apply when no dirty range exists', async () => {
        const { service } = createService();
        const applySpy = vi.spyOn(service as any, '_apply').mockResolvedValueOnce({
            arrayFormulaRange: {},
            runtimeFeatureRange: {},
        });

        const result = await (service as any)._executeStep();
        expect(result).toBe(true);
        expect(applySpy).toHaveBeenCalledTimes(1);
    });

    it('should return when apply returns null in execute step', async () => {
        const { service } = createService();
        vi.spyOn(service as any, '_apply').mockResolvedValueOnce(null);

        const result = await (service as any)._executeStep();
        expect(result).toBeUndefined();
    });

    it('should apply trees for feature callbacks and formula execution', async () => {
        const { service, mocks } = createService();
        const resetNode = { resetCalculationState: vi.fn() };
        const featureDirtyData = {
            runtimeCellData: { u: {} },
            dirtyRanges: { u: {} },
        };

        mocks.formulaDependencyGenerator.generate.mockResolvedValueOnce([
            {
                row: 1,
                column: 2,
                rowCount: 20,
                columnCount: 10,
                subUnitId: 'sheet',
                unitId: 'unit',
                nodeData: {
                    node: resetNode,
                    refOffsetX: 0,
                    refOffsetY: 0,
                },
                getDirtyData: null,
                featureId: null,
                formulaId: null,
                refOffsetX: 0,
                refOffsetY: 0,
            },
            {
                row: 3,
                column: 4,
                rowCount: 20,
                columnCount: 10,
                subUnitId: 'sheet',
                unitId: 'unit',
                nodeData: {
                    node: resetNode,
                    refOffsetX: 0,
                    refOffsetY: 0,
                },
                getDirtyData: null,
                featureId: null,
                formulaId: 'formula-id',
                refOffsetX: 1,
                refOffsetY: 2,
            },
            {
                row: 5,
                column: 6,
                rowCount: 20,
                columnCount: 10,
                subUnitId: 'sheet',
                unitId: 'unit',
                nodeData: {
                    node: resetNode,
                    refOffsetX: 0,
                    refOffsetY: 0,
                },
                getDirtyData: () => featureDirtyData,
                featureId: 'feature-id',
                formulaId: null,
                refOffsetX: 0,
                refOffsetY: 0,
            },
        ] as never);

        await (service as any)._apply(false);

        expect(mocks.configService.getConfig).toHaveBeenCalledWith(ENGINE_FORMULA_PLUGIN_CONFIG_KEY);
        expect(mocks.runtimeService.setCurrent).toHaveBeenCalled();
        expect(mocks.interpreter.execute).toHaveBeenCalled();
        expect(mocks.runtimeService.setRuntimeData).toHaveBeenCalledTimes(1);
        expect(mocks.runtimeService.setRuntimeOtherData).toHaveBeenCalledWith('formula-id', 1, 2, expect.anything());
        expect(mocks.runtimeService.setRuntimeFeatureCellData).toHaveBeenCalledWith('feature-id', featureDirtyData.runtimeCellData);
        expect(mocks.runtimeService.setRuntimeFeatureRange).toHaveBeenCalledWith('feature-id', featureDirtyData.dirtyRanges);
        expect(mocks.runtimeService.markedAsSuccessfullyExecuted).toHaveBeenCalledTimes(1);
        expect(resetNode.resetCalculationState).toHaveBeenCalledTimes(3);
    });

    it('should use async interpreter branch when node is async', async () => {
        const { service, mocks } = createService();
        const resetNode = { resetCalculationState: vi.fn() };
        mocks.formulaDependencyGenerator.generate.mockResolvedValueOnce([
            {
                row: 1,
                column: 1,
                rowCount: 10,
                columnCount: 10,
                subUnitId: 's',
                unitId: 'u',
                nodeData: {
                    node: resetNode,
                    refOffsetX: 0,
                    refOffsetY: 0,
                },
                getDirtyData: null,
                featureId: null,
                formulaId: null,
                refOffsetX: 0,
                refOffsetY: 0,
            },
        ] as never);
        mocks.interpreter.checkAsyncNode.mockReturnValueOnce(true);

        await (service as any)._apply(false);
        expect(mocks.interpreter.executeAsync).toHaveBeenCalledTimes(1);
    });

    it('should stop apply when stop-state is set', async () => {
        const { service, mocks } = createService();
        mocks.formulaDependencyGenerator.generate.mockResolvedValueOnce([
            {
                row: 1,
                column: 1,
                rowCount: 10,
                columnCount: 10,
                subUnitId: 's',
                unitId: 'u',
                nodeData: null,
                getDirtyData: null,
                featureId: null,
                formulaId: null,
                refOffsetX: 0,
                refOffsetY: 0,
            },
        ] as never);
        mocks.runtimeService.isStopExecution.mockReturnValueOnce(true);
        const completed: any[] = [];
        service.executionCompleteListener$.subscribe((item) => completed.push(item));

        await (service as any)._apply(false);

        expect(mocks.runtimeService.setFormulaExecuteStage).toHaveBeenCalledWith(FormulaExecuteStageType.IDLE);
        expect(mocks.runtimeService.markedAsStopFunctionsExecuted).toHaveBeenCalledTimes(1);
        expect(completed.length).toBe(1);
    });

    it('should mark no-functions-executed when tree list is empty', async () => {
        const { service, mocks } = createService();
        mocks.formulaDependencyGenerator.generate.mockResolvedValueOnce([]);

        await (service as any)._apply(false);
        expect(mocks.runtimeService.markedAsNoFunctionsExecuted).toHaveBeenCalledTimes(1);
    });

    it('should execute formulas with null, reference, scalar and array variants', async () => {
        const { service, mocks } = createService();
        const oneCellArray = {
            isReferenceObject: () => false,
            isArray: () => true,
            getRowCount: () => 1,
            getColumnCount: () => 1,
            getFirstCell: () => ({ getValue: () => 10 }),
        };
        const multiArray = {
            isReferenceObject: () => false,
            isArray: () => true,
            getRowCount: () => 2,
            getColumnCount: () => 2,
            toValue: () => [[1, 2], [3, 4]],
        };
        const scalar = {
            isReferenceObject: () => false,
            isArray: () => false,
            getValue: () => 99,
        };
        const referenceObject = {
            isReferenceObject: () => true,
            toArrayValueObject: () => oneCellArray,
        };

        vi.spyOn(service, 'calculate' as any)
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(referenceObject as never)
            .mockResolvedValueOnce(multiArray as never)
            .mockResolvedValueOnce(scalar as never);

        const result = await service.executeFormulas({
            unit: {
                sheet: {
                    1: {
                        1: ['=A1', '=A2', '=A3', '=A4'],
                    },
                },
            },
        } as never);

        expect(mocks.currentConfigService.loadDataLite).toHaveBeenCalledTimes(1);
        expect(mocks.runtimeService.reset).toHaveBeenCalledTimes(1);
        expect(mocks.runtimeService.setCurrent).toHaveBeenCalledTimes(1);
        expect(result.unit?.sheet?.[1]?.[1]).toEqual([
            { value: null, formula: '=A1' },
            { value: 10, formula: '=A2' },
            { value: [[1, 2], [3, 4]], formula: '=A3' },
            { value: 99, formula: '=A4' },
        ]);
    });

    it('should parse and calculate formula through lexer/parser/interpreter', async () => {
        const { service, mocks } = createService();
        const astNode = { nodeType: 'mock' };

        mocks.lexer.treeBuilder.mockReturnValueOnce(ErrorType.NAME);
        await expect(service.calculate('=BAD()')).resolves.toBeUndefined();

        mocks.lexer.treeBuilder.mockReturnValueOnce({ token: 'ok' });
        mocks.astTreeBuilder.parse.mockReturnValueOnce(null);
        await expect(service.calculate('=A1')).resolves.toBeUndefined();

        mocks.lexer.treeBuilder.mockReturnValueOnce({ token: 'ok2' });
        mocks.astTreeBuilder.parse.mockReturnValueOnce(astNode);
        mocks.interpreter.checkAsyncNode.mockReturnValueOnce(true);
        await service.calculate('=ASYNC()');
        expect(mocks.interpreter.executeAsync).toHaveBeenCalledWith({
            node: astNode,
            refOffsetX: 0,
            refOffsetY: 0,
        });

        mocks.lexer.treeBuilder.mockReturnValueOnce({ token: 'ok3' });
        mocks.astTreeBuilder.parse.mockReturnValueOnce(astNode);
        mocks.interpreter.checkAsyncNode.mockReturnValueOnce(false);
        await service.calculate('=SYNC()');
        expect(mocks.interpreter.execute).toHaveBeenCalledWith({
            node: astNode,
            refOffsetX: 0,
            refOffsetY: 0,
        });
    });

    it('should delegate dependency query APIs after loading lite data', async () => {
        const { service, mocks } = createService();
        await expect(service.getAllDependencyJson()).resolves.toEqual([{ treeId: 1 }]);
        await expect(service.getCellDependencyJson('u', 's', 1, 1)).resolves.toEqual({ treeId: 2 });
        await expect(service.getRangeDependents([])).resolves.toEqual([{ treeId: 3 }]);
        await expect(service.getInRangeFormulas([])).resolves.toEqual([{ treeId: 4 }]);
        await expect(service.getDependentsAndInRangeFormulas([])).resolves.toEqual({ dependents: [], inRanges: [] });
        expect(mocks.currentConfigService.loadDataLite).toHaveBeenCalledTimes(5);
    });
});
