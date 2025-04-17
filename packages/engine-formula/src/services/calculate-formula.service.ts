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

import type { IUnitRange } from '@univerjs/core';
import type { Observable } from 'rxjs';
import type {
    IArrayFormulaRangeType,
    IFeatureDirtyRangeType,
    IFormulaDatasetConfig,
    IRuntimeUnitDataType,
    IUnitExcludedCell,
} from '../basics/common';

import type { IUniverEngineFormulaConfig } from '../controller/config.schema';
import type { LexerNode } from '../engine/analysis/lexer-node';
import type { FunctionVariantType } from '../engine/reference-object/base-reference-object';
import type { IAllRuntimeData, IExecutionInProgressParams } from './runtime.service';
import {
    AsyncLock,
    createIdentifier,
    Disposable,
    IConfigService,
    Inject,
    ObjectMatrix,
    requestImmediateMacroTask,
} from '@univerjs/core';
import { Subject } from 'rxjs';
import { ErrorType } from '../basics/error-type';
import { CELL_INVERTED_INDEX_CACHE } from '../basics/inverted-index-cache';
import { DEFAULT_CYCLE_REFERENCE_COUNT, ENGINE_FORMULA_PLUGIN_CONFIG_KEY } from '../controller/config.schema';
import { Lexer } from '../engine/analysis/lexer';
import { AstTreeBuilder } from '../engine/analysis/parser';
import { ErrorNode } from '../engine/ast-node/base-ast-node';
import { IFormulaDependencyGenerator } from '../engine/dependency/formula-dependency';
import { Interpreter } from '../engine/interpreter/interpreter';
import { FORMULA_REF_TO_ARRAY_CACHE } from '../engine/reference-object/base-reference-object';
import { ErrorValueObjectCache } from '../engine/value-object/base-value-object';
import { StringValueObjectCache } from '../engine/value-object/primitive-object';
import { IFormulaCurrentConfigService } from './current-data.service';
import { FormulaExecuteStageType, IFormulaRuntimeService } from './runtime.service';

export const DEFAULT_INTERVAL_COUNT = 500;

export const CYCLE_REFERENCE_COUNT = 'cycleReferenceCount';

export const EVERY_N_FUNCTION_EXECUTION_PAUSE = 100;

export interface ICalculateFormulaService {
    readonly executionInProgressListener$: Observable<IExecutionInProgressParams>;
    readonly executionCompleteListener$: Observable<IAllRuntimeData>;
    setRuntimeFeatureCellData(featureId: string, featureData: IRuntimeUnitDataType): void;
    setRuntimeFeatureRange(featureId: string, featureRange: IFeatureDirtyRangeType): void;
    execute(formulaDatasetConfig: IFormulaDatasetConfig): Promise<void>;
    stopFormulaExecution(): void;
    calculate(formulaString: string, transformSuffix?: boolean): void;
}

export const ICalculateFormulaService = createIdentifier<ICalculateFormulaService>('engine-formula.calculate-formula.service');

export class CalculateFormulaService extends Disposable implements ICalculateFormulaService {
    protected readonly _executionInProgressListener$ = new Subject<IExecutionInProgressParams>();
    readonly executionInProgressListener$ = this._executionInProgressListener$.asObservable();

    protected readonly _executionCompleteListener$ = new Subject<IAllRuntimeData>();
    readonly executionCompleteListener$ = this._executionCompleteListener$.asObservable();

    private _executeLock = new AsyncLock();

    constructor(
        @IConfigService protected readonly _configService: IConfigService,
        @Inject(Lexer) protected readonly _lexer: Lexer,
        @IFormulaCurrentConfigService protected readonly _currentConfigService: IFormulaCurrentConfigService,
        @IFormulaRuntimeService protected readonly _runtimeService: IFormulaRuntimeService,
        @IFormulaDependencyGenerator protected readonly _formulaDependencyGenerator: IFormulaDependencyGenerator,
        @Inject(Interpreter) protected readonly _interpreter: Interpreter,
        @Inject(AstTreeBuilder) protected readonly _astTreeBuilder: AstTreeBuilder
    ) {
        super();
    }

    override dispose() {
        super.dispose();

        this._executionInProgressListener$.complete();
        this._executionCompleteListener$.complete();
        FORMULA_REF_TO_ARRAY_CACHE.clear();
        CELL_INVERTED_INDEX_CACHE.clear();
        ErrorValueObjectCache.clear();
        StringValueObjectCache.clear();
    }

    /**
     * Stop the execution of the formula.
     */
    stopFormulaExecution() {
        this._runtimeService.stopExecution();
    }

    /**
     * When the feature is loading,
     * the pre-calculated content needs to be input to the formula engine in advance,
     * so that the formula can read the correct values.
     * @param featureId
     * @param featureData
     */
    setRuntimeFeatureCellData(featureId: string, featureData: IRuntimeUnitDataType) {
        this._runtimeService.setRuntimeFeatureCellData(featureId, featureData);
    }

    setRuntimeFeatureRange(featureId: string, featureRange: IFeatureDirtyRangeType) {
        this._runtimeService.setRuntimeFeatureRange(featureId, featureRange);
    }

    async execute(formulaDatasetConfig: IFormulaDatasetConfig) {
        this._runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.START);
        this._executionInProgressListener$.next(this._runtimeService.getRuntimeState());

        this._currentConfigService.load(formulaDatasetConfig);

        this._runtimeService.reset();

        const cycleReferenceCount = (formulaDatasetConfig.maxIteration || DEFAULT_CYCLE_REFERENCE_COUNT) as number;

        this._executeLock.acquire('FORMULA_EXECUTION_LOCK', async () => {
            for (let i = 0; i < cycleReferenceCount; i++) {
                this._runtimeService.setFormulaCycleIndex(i);
                await this._executeStep();

                FORMULA_REF_TO_ARRAY_CACHE.clear();

                const isCycleDependency = this._runtimeService.isCycleDependency();
                if (!isCycleDependency) {
                    break;
                }
            }

            this._runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.CALCULATION_COMPLETED);
            this._executionInProgressListener$.next(this._runtimeService.getRuntimeState());
            this._executionCompleteListener$.next(this._runtimeService.getAllRuntimeData());
            CELL_INVERTED_INDEX_CACHE.clear();
            this._runtimeService.reset();
        });
    }

    private async _executeStep() {
        const executeState = await this._apply();

        if (executeState == null) {
            return;
        }

        const { arrayFormulaRange, runtimeFeatureRange } = executeState;

        const { dirtyRanges, excludedCell } = this._getArrayFormulaDirtyRangeAndExcludedRange(
            arrayFormulaRange,
            runtimeFeatureRange
        );

        if (dirtyRanges == null || dirtyRanges.length === 0) {
            return true;
        }

        this._currentConfigService.loadDirtyRangesAndExcludedCell(dirtyRanges, excludedCell);

        await this._apply(true);

        return true;
    }

    private _getArrayFormulaDirtyRangeAndExcludedRange(
        arrayFormulaRange: IArrayFormulaRangeType,
        runtimeFeatureRange: { [featureId: string]: IFeatureDirtyRangeType }
    ) {
        const dirtyRanges: IUnitRange[] = [];
        const excludedCell: IUnitExcludedCell = {};
        Object.keys(arrayFormulaRange).forEach((unitId) => {
            const sheetArrayFormulaRange = arrayFormulaRange[unitId];

            if (sheetArrayFormulaRange == null) {
                return true;
            }

            Object.keys(sheetArrayFormulaRange).forEach((sheetId) => {
                const cellValue = new ObjectMatrix(sheetArrayFormulaRange[sheetId]);

                if (cellValue == null) {
                    return true;
                }

                const newCellData = new ObjectMatrix<boolean>();

                cellValue.forValue((row, column, range) => {
                    newCellData.setValue(row, column, true);

                    dirtyRanges.push({ unitId, sheetId, range });
                });

                if (excludedCell[unitId] == null) {
                    excludedCell[unitId] = {};
                }

                excludedCell[unitId]![sheetId] = newCellData;
            });
        });

        Object.keys(runtimeFeatureRange).forEach((featureId) => {
            const arrayRange = runtimeFeatureRange[featureId];
            Object.keys(arrayRange).forEach((unitId) => {
                const sheetArrayFormulaRange = arrayRange[unitId];

                if (sheetArrayFormulaRange == null) {
                    return true;
                }

                Object.keys(sheetArrayFormulaRange).forEach((sheetId) => {
                    const ranges = sheetArrayFormulaRange[sheetId];

                    if (ranges == null) {
                        return true;
                    }

                    for (const range of ranges) {
                        dirtyRanges.push({ unitId, sheetId, range });
                    }
                });
            });
        });

        return { dirtyRanges, excludedCell };
    }

    // eslint-disable-next-line max-lines-per-function
    protected async _apply(isArrayFormulaState = false) {
        if (isArrayFormulaState) {
            this._runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.START_DEPENDENCY_ARRAY_FORMULA);
        } else {
            this._runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.START_DEPENDENCY);
        }

        this._executionInProgressListener$.next(this._runtimeService.getRuntimeState());

        const treeList = (await this._formulaDependencyGenerator.generate()).reverse();

        const interpreter = this._interpreter;

        if (isArrayFormulaState) {
            this._runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.START_CALCULATION_ARRAY_FORMULA);

            this._runtimeService.setTotalArrayFormulasToCalculate(treeList.length);
        } else {
            this._runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.START_CALCULATION);

            this._runtimeService.setTotalFormulasToCalculate(treeList.length);
        }

        this._executionInProgressListener$.next(this._runtimeService.getRuntimeState());

        let pendingTasks: (() => void)[] = [];

        const config = this._configService.getConfig(ENGINE_FORMULA_PLUGIN_CONFIG_KEY) as IUniverEngineFormulaConfig;
        const intervalCount = config?.intervalCount || DEFAULT_INTERVAL_COUNT;

        const treeCount = treeList.length;
        for (let i = 0; i < treeCount; i++) {
            const tree = treeList[i];
            const nodeData = tree.nodeData;
            const getDirtyData = tree.getDirtyData;

            // Execute the await every 100 iterations
            if (i % intervalCount === 0) {
                /**
                 * For every functions, execute a setTimeout to wait for external command input.
                 */
                await new Promise((resolve) => {
                    const calCancelTask = requestImmediateMacroTask(resolve);
                    pendingTasks.push(calCancelTask);
                });

                if (isArrayFormulaState) {
                    this._runtimeService.setFormulaExecuteStage(
                        FormulaExecuteStageType.CURRENTLY_CALCULATING_ARRAY_FORMULA
                    );

                    this._runtimeService.setCompletedArrayFormulasCount(i + 1);
                } else {
                    this._runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.CURRENTLY_CALCULATING);

                    this._runtimeService.setCompletedFormulasCount(i + 1);
                }

                this._executionInProgressListener$.next(this._runtimeService.getRuntimeState());

                if (this._runtimeService.isStopExecution() || (nodeData == null && getDirtyData == null)) {
                    this._runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.IDLE);
                    this._runtimeService.markedAsStopFunctionsExecuted();
                    this._executionCompleteListener$.next(this._runtimeService.getAllRuntimeData());
                    return;
                }
            }

            this._runtimeService.setCurrent(
                tree.row,
                tree.column,
                tree.rowCount,
                tree.columnCount,
                tree.subUnitId,
                tree.unitId
            );

            let value: FunctionVariantType;

            if (getDirtyData != null && tree.featureId != null) {
                /**
                 * Execute the dependencies registered by the feature,
                 * and return the dirty area marked by the feature,
                 * so as to allow the formulas depending on the dirty area to continue the calculation.
                 */
                const { runtimeCellData, dirtyRanges } = getDirtyData(this._currentConfigService.getDirtyData(), this._runtimeService.getAllRuntimeData());

                this._runtimeService.setRuntimeFeatureCellData(tree.featureId, runtimeCellData);

                this._runtimeService.setRuntimeFeatureRange(tree.featureId, dirtyRanges);
            } else if (nodeData != null) {
                if (interpreter.checkAsyncNode(nodeData.node)) {
                    value = await interpreter.executeAsync(nodeData);
                } else {
                    value = interpreter.execute(nodeData);
                }

                if (tree.formulaId != null) {
                    this._runtimeService.setRuntimeOtherData(tree.formulaId, tree.refOffsetX, tree.refOffsetY, value);
                } else {
                    this._runtimeService.setRuntimeData(value);
                }
            }
        }

        // clear all pending tasks
        pendingTasks.forEach((cancel) => cancel());
        pendingTasks = [];

        if (treeCount > 0) {
            this._runtimeService.markedAsSuccessfullyExecuted();
        } else if (!isArrayFormulaState) {
            this._runtimeService.markedAsNoFunctionsExecuted();
        }

        // treeList.length = 0;

        return this._runtimeService.getAllRuntimeData();
    }

    calculate(formulaString: string, transformSuffix: boolean = true) {
        // TODO how to observe @alex
        // this.getObserver('onBeforeFormulaCalculateObservable')?.notifyObservers(formulaString);
        const lexerNode = this._lexer.treeBuilder(formulaString, transformSuffix);

        if (Object.values(ErrorType).includes(lexerNode as ErrorType)) {
            return ErrorNode.create(lexerNode as ErrorType);
        }

        // this.lexerTreeBuilder.suffixExpressionHandler(lexerNode); // suffix Express, 1+(3*4=4)*5+1 convert to 134*4=5*1++

        // console.log('sequence', this.lexerTreeBuilder.sequenceNodesBuilder(formulaString));

        // this.getObserver('onAfterFormulaLexerObservable')?.notifyObservers(lexerNode);

        // const astTreeBuilder = new AstTreeBuilder();

        const astNode = this._astTreeBuilder.parse(lexerNode as LexerNode);

        // console.log('astNode', astNode?.serialize());
        astNode?.serialize();

        // const interpreter = Interpreter.create();

        // if (astNode == null) {
        //     return;
        // }

        // if (interpreter.checkAsyncNode(astNode)) {
        //     const resultPromise = interpreter.executeAsync(astNode);

        //     resultPromise.then((value) => {
        //         console.log('formulaResult', value);
        //     });
        // } else {
        //     console.log(interpreter.execute(astNode));
        // }
    }
}
