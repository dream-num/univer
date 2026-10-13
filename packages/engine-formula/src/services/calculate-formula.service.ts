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

import type { ICellData, IUnitRange, IWorkbookCalculationSettings } from '@univerjs/core';
import type { Observable } from 'rxjs';
import type {
    IArrayFormulaRangeType,
    IFeatureDirtyRangeType,
    IFormulaDatasetConfig,
    IFormulaExecuteResultItem,
    IFormulaExecuteResultMap,
    IFormulaStringMap,
    IRuntimeUnitDataType,
    IUnitExcludedCell,
    IUnitRowData,
} from '../basics/common';
import type { IUniverEngineFormulaConfig } from '../config/config';
import type { LexerNode } from '../engine/analysis/lexer-node';
import type {
    IFormulaDependencyTreeFullJson,
    IFormulaDependencyTreeJson,
    IFormulaDependentsAndInRangeResults,
} from '../engine/dependency/dependency-tree';
import type { BaseReferenceObject, FunctionVariantType } from '../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../engine/value-object/array-value-object';
import type { BaseValueObject } from '../engine/value-object/base-value-object';
import type { IAllRuntimeData, IExecutionInProgressParams } from './runtime.service';
import {
    AsyncLock,
    CellValueType,
    createIdentifier,
    Disposable,
    IConfigService,
    Inject,
    normalizeWorkbookCalculationSettings,
    ObjectMatrix,
    requestImmediateMacroTask,
} from '@univerjs/core';
import { Subject } from 'rxjs';
import { ErrorType } from '../basics/error-type';
import { CELL_INVERTED_INDEX_CACHE } from '../basics/inverted-index-cache';
import { ENGINE_FORMULA_PLUGIN_CONFIG_KEY } from '../config/config';
import { Lexer } from '../engine/analysis/lexer';
import { AstTreeBuilder } from '../engine/analysis/parser';
import { IFormulaDependencyGenerator } from '../engine/dependency/formula-dependency';
import { Interpreter } from '../engine/interpreter/interpreter';
import { FORMULA_REF_TO_ARRAY_CACHE } from '../engine/reference-object/base-reference-object';
import { generateAstNode } from '../engine/utils/generate-ast-node';
import { ErrorValueObjectCache } from '../engine/value-object/base-value-object';
import { StringValueObjectCache } from '../engine/value-object/primitive-object';
import { FUNCTION_NAMES_LOOKUP } from '../functions/lookup/function-names';
import { IFormulaCurrentConfigService } from './current-data.service';
import { FormulaExecuteStageType, IFormulaRuntimeService } from './runtime.service';

export const DEFAULT_INTERVAL_COUNT = 500;

export const EVERY_N_FUNCTION_EXECUTION_PAUSE = 100;

export interface ICalculateFormulaService {
    readonly executionInProgressListener$: Observable<IExecutionInProgressParams>;
    readonly executionCompleteListener$: Observable<IAllRuntimeData>;
    setRuntimeFeatureCellData(featureId: string, featureData: IRuntimeUnitDataType): void;
    setRuntimeFeatureRange(featureId: string, featureRange: IFeatureDirtyRangeType): void;
    execute(formulaDatasetConfig: IFormulaDatasetConfig): Promise<void>;
    stopFormulaExecution(): void;
    calculate(formulaString: string, transformSuffix?: boolean, unitId?: string): void;
    executeFormulas(formulas: IFormulaStringMap, rowData?: IUnitRowData): Promise<IFormulaExecuteResultMap>;
    getAllDependencyJson(rowData?: IUnitRowData): Promise<IFormulaDependencyTreeJson[]>;
    getCellDependencyJson(unitId: string, sheetId: string, row: number, column: number, rowData?: IUnitRowData): Promise<IFormulaDependencyTreeFullJson | undefined>;
    getRangeDependents(unitRanges: IUnitRange[]): Promise<IFormulaDependencyTreeJson[]>;
    getInRangeFormulas(unitRanges: IUnitRange[]): Promise<IFormulaDependencyTreeJson[]>;
    getDependentsAndInRangeFormulas(unitRanges: IUnitRange[]): Promise<IFormulaDependentsAndInRangeResults>;
}

export const ICalculateFormulaService = createIdentifier<ICalculateFormulaService>('engine-formula.calculate-formula.service');

export class CalculateFormulaService extends Disposable implements ICalculateFormulaService {
    protected readonly _executionInProgressListener$ = new Subject<IExecutionInProgressParams>();
    readonly executionInProgressListener$ = this._executionInProgressListener$.asObservable();

    protected readonly _executionCompleteListener$ = new Subject<IAllRuntimeData>();
    readonly executionCompleteListener$ = this._executionCompleteListener$.asObservable();

    protected _executeLock = new AsyncLock();

    protected _isCalculateTreeModel: boolean = false;
    protected _workbookCalculationSettings: Record<string, IWorkbookCalculationSettings> = {};
    protected _preserveCircularUnits = new Set<string>();
    private readonly _normalizedCalculationSettings = new Map<string, IWorkbookCalculationSettings>();

    protected _loadCalculationSettings(settings?: Record<string, IWorkbookCalculationSettings>): void {
        this._workbookCalculationSettings = settings ?? {};
        this._normalizedCalculationSettings.clear();
    }

    protected _getCalculationSettings(unitId: string): IWorkbookCalculationSettings {
        let settings = this._normalizedCalculationSettings.get(unitId);
        if (settings == null) {
            settings = normalizeWorkbookCalculationSettings(this._workbookCalculationSettings[unitId]);
            this._normalizedCalculationSettings.set(unitId, settings);
        }
        return settings;
    }

    protected _getIterationCell(tree: { unitId: string; subUnitId: string; row: number; column: number }): Pick<ICellData, 'v' | 't'> {
        const cell = this._runtimeService.getUnitData()[tree.unitId]?.[tree.subUnitId]?.getValue(tree.row, tree.column) ??
            this._currentConfigService.getUnitData()[tree.unitId]?.[tree.subUnitId]?.cellData.getValue(tree.row, tree.column) ??
            { v: 0 };
        return cell.v == null ? { v: 0, t: CellValueType.NUMBER } : cell;
    }

    protected async* _iterateCalculationGroup<T extends { unitId: string; subUnitId: string; row: number; column: number; formula?: string }>(
        group: T[],
        groupId: string
    ) {
        const settings = group.map((item) => this._getCalculationSettings(item.unitId));
        if (group.every((item, i) => {
            const cell = this._currentConfigService.getUnitData()[item.unitId]?.[item.subUnitId]?.cellData.getValue(item.row, item.column);
            const formula = (item.formula ?? cell?.f ?? '').toUpperCase();
            // Match native materialization: INDEX can narrow a static self-containing
            // range to another cell, while classic LOOKUP retains cache-backed cycles.
            const requiresRecalculation = formula.includes(`${FUNCTION_NAMES_LOOKUP.INDEX}(`) &&
                !(formula.includes(`${FUNCTION_NAMES_LOOKUP.LOOKUP}(`) && !formula.includes(`${FUNCTION_NAMES_LOOKUP.XLOOKUP}(`));
            return settings[i].iterativeCalculation && this._preserveCircularUnits.has(item.unitId) &&
                cell?.v != null && !requiresRecalculation;
        })) {
            for (const tree of group) {
                yield { tree, preserve: true, iteration: 0 };
            }
            this._runtimeService.recordCircularReferences(group.map((item) => ({
                unitId: item.unitId,
                sheetId: item.subUnitId,
                row: item.row,
                column: item.column,
                groupId,
                iterations: 0,
            })));
            return;
        }
        const limit = settings.reduce((limit, setting) => Math.max(limit, setting.iterativeCalculation ? setting.maxIterations : 0), 1);
        let converged = false;
        let iterations = 0;
        const beforeValues: ICellData['v'][] = [];
        const beforeTypes: ICellData['t'][] = [];
        for (let iteration = 0; iteration < limit; iteration++) {
            for (let i = 0; i < group.length; i++) {
                if (settings[i].iterativeCalculation) {
                    const before = this._getIterationCell(group[i]);
                    beforeValues[i] = before.v;
                    beforeTypes[i] = before.t;
                }
            }
            for (let i = 0; i < group.length; i++) {
                if (iteration < (settings[i].iterativeCalculation ? settings[i].maxIterations : 1)) {
                    // Each member can change a range read by the next member in this round.
                    FORMULA_REF_TO_ARRAY_CACHE.clear();
                    yield { tree: group[i], preserve: !settings[i].iterativeCalculation, iteration };
                }
            }
            iterations = iteration + 1;
            converged = group.every((item, i) => {
                if (!settings[i].iterativeCalculation) {
                    return true;
                }
                const after = this._getIterationCell(item);
                const previousValue = beforeValues[i];
                return typeof after.v === 'number' && typeof previousValue === 'number' &&
                    (after.t == null || after.t === CellValueType.NUMBER) &&
                    (beforeTypes[i] == null || beforeTypes[i] === CellValueType.NUMBER)
                    ? Number.isFinite(after.v) && Math.abs(after.v - previousValue) <= settings[i].maxChange
                    : after.t === beforeTypes[i] && after.v === previousValue;
            });
            if (converged) {
                break;
            }
        }
        FORMULA_REF_TO_ARRAY_CACHE.clear();
        this._runtimeService.recordCircularReferences(group.map((item, i) => ({
            unitId: item.unitId,
            sheetId: item.subUnitId,
            row: item.row,
            column: item.column,
            groupId,
            iterations: settings[i].iterativeCalculation ? Math.min(iterations, settings[i].maxIterations) : 0,
            converged: settings[i].iterativeCalculation ? converged : undefined,
        })));
    }

    protected async* _getCalculationSteps<T extends { cycleGroup?: string; unitId: string; subUnitId: string; row: number; column: number }>(trees: T[]) {
        while (trees.length) {
            const tree = trees.pop()!;
            if (tree.cycleGroup == null) {
                yield { tree, preserve: false, iteration: 0 };
                continue;
            }
            const group = [tree];
            while (trees.length && trees[trees.length - 1].cycleGroup === tree.cycleGroup) {
                group.push(trees.pop()!);
            }
            yield* this._iterateCalculationGroup(group, tree.cycleGroup);
        }
    }

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
        return this._executeLock.acquire('FORMULA_EXECUTION_LOCK', async () => {
            this._runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.START);
            this._executionInProgressListener$.next(this._runtimeService.getRuntimeState());

            this._currentConfigService.load(formulaDatasetConfig);

            this._runtimeService.reset();

            this._loadCalculationSettings(formulaDatasetConfig.calculationSettings);
            this._preserveCircularUnits = new Set(formulaDatasetConfig.preserveCircularUnits);
            this._runtimeService.beginCircularReferences();
            this._isCalculateTreeModel = formulaDatasetConfig.isCalculateTreeModel || false;
            await this._executeStep();
            this._runtimeService.completeCircularReferences();
            this._runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.CALCULATION_COMPLETED);
            this._executionInProgressListener$.next(this._runtimeService.getRuntimeState());
            this._executionCompleteListener$.next(this._runtimeService.getAllRuntimeData());
            CELL_INVERTED_INDEX_CACHE.clear();
            this._runtimeService.reset();
        });
    }

    protected async _executeStep() {
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

        FORMULA_REF_TO_ARRAY_CACHE.clear();

        this._currentConfigService.loadDirtyRangesAndExcludedCell(dirtyRanges, excludedCell);

        await this._apply(true);

        return true;
    }

    protected _getArrayFormulaDirtyRangeAndExcludedRange(
        arrayFormulaRange: IArrayFormulaRangeType,
        runtimeFeatureRange: { [featureId: string]: IFeatureDirtyRangeType }
    ) {
        const dirtyRanges: IUnitRange[] = [];
        const excludedCell: IUnitExcludedCell = Object.create(null);
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
                    excludedCell[unitId] = Object.create(null);
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

    protected async _apply(isArrayFormulaState = false) {
        if (isArrayFormulaState) {
            this._runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.START_DEPENDENCY_ARRAY_FORMULA);
        } else {
            this._runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.START_DEPENDENCY);
        }

        this._executionInProgressListener$.next(this._runtimeService.getRuntimeState());

        const treeList = await this._formulaDependencyGenerator.generate(this._isCalculateTreeModel);

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
        let i = 0;
        const treeCount = treeList.length;
        for await (const { tree, preserve, iteration } of this._getCalculationSteps(treeList)) {
            this._runtimeService.setFormulaCycleIndex(iteration);

            this._runtimeService.setCurrent(
                tree.row,
                tree.column,
                tree.rowCount,
                tree.columnCount,
                tree.subUnitId,
                tree.unitId
            );

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

                if (this._runtimeService.isStopExecution()) {
                    this._runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.IDLE);
                    this._runtimeService.markedAsStopFunctionsExecuted();
                    return;
                }
            }

            if (preserve) {
                this._runtimeService.preserveCurrentCellData();
                i++;
                continue;
            }

            const node = generateAstNode(
                tree.unitId,
                tree.formula,
                this._lexer,
                this._astTreeBuilder,
                this._currentConfigService,
                tree.subUnitId,
                tree.column,
                tree.row
            );
            const nodeData = {
                node,
                refOffsetX: tree.refOffsetX,
                refOffsetY: tree.refOffsetY,
            };
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

            node.resetCalculationState();

            i++;
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

    async executeFormulas(formulas: IFormulaStringMap, rowData?: IUnitRowData) {
        this._currentConfigService.loadDataLite(
            rowData
        );

        const unitData = this._currentConfigService.getUnitData();

        this._runtimeService.reset();

        const result: IFormulaExecuteResultMap = Object.create(null);

        for (const unitId of Object.keys(formulas)) {
            const sheetFormulas = formulas[unitId];
            if (sheetFormulas == null) continue;

            result[unitId] = Object.create(null);

            for (const sheetId of Object.keys(sheetFormulas)) {
                const rowFormulas = sheetFormulas[sheetId];
                if (rowFormulas == null) continue;

                const sheetItem = unitData[unitId]?.[sheetId];

                if (sheetItem == null) continue;

                result[unitId]![sheetId] = Object.create(null);

                for (const rowString of Object.keys(rowFormulas)) {
                    const row = Number.parseInt(rowString);
                    result[unitId]![sheetId]![row] = Object.create(null);

                    const cellData = rowFormulas[row];
                    if (!cellData) continue;

                    for (const columnString of Object.keys(cellData)) {
                        const column = Number.parseInt(columnString);
                        const formulaStrings = cellData[column];
                        if (!formulaStrings) continue;

                        const rowCount = sheetItem.rowCount || 0;
                        const columnCount = sheetItem.columnCount || 0;

                        this._runtimeService.setCurrent(
                            row,
                            column,
                            rowCount,
                            columnCount,
                            sheetId,
                            unitId
                        );

                        const item: IFormulaExecuteResultItem[] = [];

                        for (const formulaString of formulaStrings) {
                            let resultCell = await this.calculate(formulaString);
                            if (!resultCell) {
                                item.push({
                                    value: null,
                                    formula: formulaString,
                                });

                                continue;
                            }

                            if (resultCell.isReferenceObject()) {
                                resultCell = (resultCell as BaseReferenceObject).toArrayValueObject();
                            }

                            const resultRefObject = resultCell as BaseValueObject;

                            if (resultRefObject.isArray()) {
                                const resultRefArrayObject = resultRefObject as ArrayValueObject;
                                if (resultRefArrayObject.getRowCount() === 1 && resultRefArrayObject.getColumnCount() === 1) {
                                    item.push({
                                        value: resultRefArrayObject.getFirstCell().getValue(),
                                        formula: formulaString,
                                    });
                                    continue;
                                }

                                item.push({
                                    value: resultRefArrayObject.toValue(),
                                    formula: formulaString,
                                });

                                continue;
                            }

                            item.push({
                                value: resultRefObject.getValue(),
                                formula: formulaString,
                            });
                        }

                        result[unitId]![sheetId]![row]![column] = item;
                    }
                }
            }
        }

        return result;
    }

    async calculate(formulaString: string, transformSuffix = true, unitId?: string) {
        // TODO how to observe @alex
        // this.getObserver('onBeforeFormulaCalculateObservable')?.notifyObservers(formulaString);
        const executeUnitId = unitId || this._runtimeService.currentUnitId || this._currentConfigService.getExecuteUnitId();
        const lexerNode = this._lexer.treeBuilder(formulaString, transformSuffix, executeUnitId);

        if (Object.values(ErrorType).includes(lexerNode as ErrorType)) {
            return;
        }

        const astNode = this._astTreeBuilder.parse(lexerNode as LexerNode);

        const interpreter = this._interpreter;

        if (astNode == null) {
            return;
        }

        const nodeData = {
            node: astNode,
            refOffsetX: 0,
            refOffsetY: 0,
        };

        if (interpreter.checkAsyncNode(astNode)) {
            return await interpreter.executeAsync(nodeData);
        } else {
            return interpreter.execute(nodeData);
        }
    }

    async getAllDependencyJson(): Promise<IFormulaDependencyTreeJson[]> {
        this._currentConfigService.loadDataLite();
        return this._formulaDependencyGenerator.getAllDependencyJson();
    }

    async getCellDependencyJson(unitId: string, sheetId: string, row: number, column: number): Promise<IFormulaDependencyTreeFullJson | undefined> {
        this._currentConfigService.loadDataLite();
        return this._formulaDependencyGenerator.getCellDependencyJson(unitId, sheetId, row, column);
    }

    async getRangeDependents(unitRanges: IUnitRange[]): Promise<IFormulaDependencyTreeJson[]> {
        this._currentConfigService.loadDataLite();
        return this._formulaDependencyGenerator.getRangeDependents(unitRanges);
    }

    async getInRangeFormulas(unitRanges: IUnitRange[]): Promise<IFormulaDependencyTreeJson[]> {
        this._currentConfigService.loadDataLite();
        return this._formulaDependencyGenerator.getInRangeFormulas(unitRanges);
    }

    async getDependentsAndInRangeFormulas(unitRanges: IUnitRange[]): Promise<IFormulaDependentsAndInRangeResults> {
        this._currentConfigService.loadDataLite();
        return this._formulaDependencyGenerator.getRangeDependentsAndInRangeFormulas(unitRanges);
    }
}
