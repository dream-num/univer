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

import type { ICommandInfo, IUnitRange, Nullable, Workbook } from '@univerjs/core';
import type {
    IDirtyUnitDefinedNameMap,
    IDirtyUnitFeatureMap,
    IDirtyUnitOtherFormulaMap,
    IDirtyUnitSheetNameMap,
    IDirtyUnitSuperTableMap,
    IExecutionInProgressParams,
    IFormulaDirtyData,
    ISetFormulaCalculationNotificationMutation,
    ISetFormulaCalculationStartMutation,
} from '@univerjs/engine-formula';
import type { IUniverSheetsFormulaBaseConfig } from '../config/config';
import type { LocaleKey } from '../locale/types';
import {
    Disposable,
    ICommandService,
    IConfigService,
    ILogService,
    Inject,
    IUniverInstanceService,
    LocaleService,
    UniverInstanceType,
} from '@univerjs/core';
import {
    ENGINE_FORMULA_CYCLE_REFERENCE_COUNT,
    ENGINE_FORMULA_RETURN_DEPENDENCY_TREE,
    FormulaDataModel,
    FormulaExecutedStateType,
    FormulaExecuteStageType,
    RegisterOtherFormulaService,
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationStartMutation,
    SetFormulaCalculationStopMutation,
    SetFormulaStringBatchCalculationMutation,
    SetTriggerFormulaCalculationStartMutation,
} from '@univerjs/engine-formula';
import { BehaviorSubject } from 'rxjs';
import { CalculationMode, PLUGIN_CONFIG_KEY_BASE } from '../config/config';

/**
 * This interface is for the progress bar to display the calculation progress.
 */
export interface ICalculationProgress {
    /** Task that already completed. */
    done: number;
    /** The total number of formulas need to calculate. */
    count: number;
    /** The label of the calculation progress. */
    label?: string;
}

const NilProgress: ICalculationProgress = { done: 0, count: 0 };

const lo = { onlyLocal: true };

export class TriggerCalculationController extends Disposable {
    private _startExecutionTime: number = 0;

    private _totalCalculationTaskCount: number = 0;

    private _doneCalculationTaskCount: number = 0;

    private _executionInProgressParams: Nullable<IExecutionInProgressParams> = null;

    private readonly _progress$ = new BehaviorSubject<ICalculationProgress>(NilProgress);

    readonly progress$ = this._progress$.asObservable();

    private _emitProgress(label?: string): void {
        this._progress$.next({ done: this._doneCalculationTaskCount, count: this._totalCalculationTaskCount, label });
    }

    private _startProgress(): void {
        this._doneCalculationTaskCount = 0;
        this._totalCalculationTaskCount = 1;

        const analyzing = this._localeService.t<LocaleKey>('sheets-formula.progress.analyzing');
        this._emitProgress(analyzing);
    }

    private _calculateProgress(label: string): void {
        if (this._executionInProgressParams) {
            const {
                totalFormulasToCalculate,
                completedFormulasCount,
                totalArrayFormulasToCalculate,
                completedArrayFormulasCount,
            } = this._executionInProgressParams;
            this._doneCalculationTaskCount = completedFormulasCount + completedArrayFormulasCount;
            this._totalCalculationTaskCount = totalFormulasToCalculate + totalArrayFormulasToCalculate;

            if (this._totalCalculationTaskCount === 0) {
                return;
            }

            this._emitProgress(label);
        }
    }

    private _completeProgress(): void {
        this._doneCalculationTaskCount = this._totalCalculationTaskCount = 1;

        const done = this._localeService.t<LocaleKey>('sheets-formula.progress.done');
        this._emitProgress(done);
    }

    clearProgress(): void {
        this._doneCalculationTaskCount = 0;
        this._totalCalculationTaskCount = 0;
        this._emitProgress();
    }

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ILogService private readonly _logService: ILogService,
        @IConfigService private readonly _configService: IConfigService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(RegisterOtherFormulaService) private readonly _registerOtherFormulaService: RegisterOtherFormulaService
    ) {
        super();

        this._commandExecutedListener();
        this._initialExecuteFormulaProcessListener();

        this._initialExecuteFormula();

        this.disposeWithMe(
            this._univerInstanceService.getTypeOfUnitAdded$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe(() => {
                this._initialExecuteFormula();
            })
        );
    }

    override dispose(): void {
        super.dispose();

        this._progress$.next(NilProgress);
        this._progress$.complete();
    }

    private _getCalculationMode(): CalculationMode {
        const config = this._configService.getConfig<IUniverSheetsFormulaBaseConfig>(PLUGIN_CONFIG_KEY_BASE);
        return config?.initialFormulaComputing ?? CalculationMode.WHEN_EMPTY;
    }

    private _commandExecutedListener() {
        // The filtering information is not synchronized to the worker and must be passed in from the main thread each time
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetFormulaCalculationStartMutation.id || command.id === SetFormulaStringBatchCalculationMutation.id) {
                    const params = command.params as ISetFormulaCalculationStartMutation;
                    if (command.id === SetFormulaCalculationStartMutation.id) {
                        const isCalculateTreeModel = this._configService.getConfig<boolean>(ENGINE_FORMULA_RETURN_DEPENDENCY_TREE) || false;
                        params.isCalculateTreeModel = isCalculateTreeModel;
                    }

                    params.maxIteration = this._configService.getConfig(ENGINE_FORMULA_CYCLE_REFERENCE_COUNT) as number | undefined;
                    params.rowData = this._formulaDataModel.getHiddenRowsFiltered();
                }
            })
        );
    }

    // eslint-disable-next-line max-lines-per-function
    private _initialExecuteFormulaProcessListener() {
        // Assignment operation after formula calculation.
        let startDependencyTimer: NodeJS.Timeout | null = null;
        let calculationProcessCount = 0; // Multiple calculations are performed in parallel, but only one progress bar is displayed, and the progress is only closed after the last calculation is completed.

        this.disposeWithMe(

            // eslint-disable-next-line max-lines-per-function, complexity
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetFormulaCalculationStopMutation.id) {
                    this.clearProgress();
                }

                if (command.id !== SetFormulaCalculationNotificationMutation.id) {
                    return;
                }

                const params = command.params as ISetFormulaCalculationNotificationMutation;

                if (params.stageInfo != null) {
                    const {
                        stage,
                    } = params.stageInfo;

                    if (stage === FormulaExecuteStageType.START) {
                        // When calculations are started multiple times in succession, only the first time is recognized
                        if (calculationProcessCount === 0) {
                            this._startExecutionTime = performance.now();
                        }

                        // Increment the calculation process count and assign a new ID
                        calculationProcessCount++;

                        // Clear any existing timer to prevent duplicate executions
                        if (startDependencyTimer !== null) {
                            clearTimeout(startDependencyTimer);
                            startDependencyTimer = null;
                        }

                        // If the total calculation time exceeds 1s, a progress bar is displayed.
                        startDependencyTimer = setTimeout(() => {
                            startDependencyTimer = null;
                            this._startProgress();
                        }, 1000);
                    } else if (stage === FormulaExecuteStageType.CURRENTLY_CALCULATING) {
                        this._executionInProgressParams = params.stageInfo;

                        if (startDependencyTimer === null) {
                            const calculating = this._localeService.t<LocaleKey>('sheets-formula.progress.calculating');
                            this._calculateProgress(calculating);
                        }
                    } else if (stage === FormulaExecuteStageType.START_DEPENDENCY_ARRAY_FORMULA) {
                        this._executionInProgressParams = params.stageInfo;

                        if (startDependencyTimer === null) {
                            const arrayAnalysis = this._localeService.t<LocaleKey>('sheets-formula.progress.array-analysis');
                            this._calculateProgress(arrayAnalysis);
                        }
                    } else if (stage === FormulaExecuteStageType.CURRENTLY_CALCULATING_ARRAY_FORMULA) {
                        this._executionInProgressParams = params.stageInfo;

                        if (startDependencyTimer === null) {
                            const arrayCalculation = this._localeService.t<LocaleKey>('sheets-formula.progress.array-calculation');
                            this._calculateProgress(arrayCalculation);
                        }
                    }
                } else {
                    const state = params.functionsExecutedState;
                    let result = '';

                    // Decrement the calculation process count
                    calculationProcessCount--;

                    switch (state) {
                        case FormulaExecutedStateType.NOT_EXECUTED:
                            result = 'No tasks are being executed anymore';
                            break;
                        case FormulaExecutedStateType.STOP_EXECUTION:
                            result = 'The execution of the formula has been stopped';
                            calculationProcessCount = 0;
                            break;
                        case FormulaExecutedStateType.SUCCESS:
                            result = 'Formula calculation succeeded';

                            // When the calculation is stopped and then a successful calculation is triggered, the value is -1
                            if (calculationProcessCount === 0 || calculationProcessCount === -1) {
                                result += `. Total time consumed: ${performance.now() - this._startExecutionTime} ms`;
                            }
                            break;
                        case FormulaExecutedStateType.INITIAL:
                            result = 'Waiting for calculation';
                            break;
                    }

                    // When the calculation is stopped and then a successful calculation is triggered, the value is -1
                    if (calculationProcessCount === 0 || calculationProcessCount === -1) {
                        if (startDependencyTimer) {
                            // The total calculation time does not exceed 1s, and the progress bar is not displayed.
                            clearTimeout(startDependencyTimer);
                            startDependencyTimer = null;
                            this.clearProgress();
                        } else {
                            // Manually hide the progress bar only if no other calculations are in process
                            this._completeProgress();
                        }

                        calculationProcessCount = 0;
                        this._doneCalculationTaskCount = 0;
                        this._totalCalculationTaskCount = 0;
                    }

                    this._executionInProgressParams = null;

                    this._logService.debug('[TriggerCalculationController]', result);
                }
            })
        );
    }

    private _initialExecuteFormula() {
        const calculationMode = this._getCalculationMode();
        const params = this._getDirtyDataByCalculationMode(calculationMode);
        this._commandService.executeCommand(SetTriggerFormulaCalculationStartMutation.id, params, lo);

        this._registerOtherFormulaService.calculateStarted$.next(true);
    }

    private _getDirtyDataByCalculationMode(calculationMode: CalculationMode): IFormulaDirtyData {
        const forceCalculation = calculationMode === CalculationMode.FORCED;

        // loop all sheets cell data, and get the dirty data
        const dirtyRanges: IUnitRange[] = calculationMode === CalculationMode.WHEN_EMPTY ? this._formulaDataModel.getFormulaDirtyRanges() : [];

        const dirtyNameMap: IDirtyUnitSheetNameMap = {};
        const dirtyDefinedNameMap: IDirtyUnitDefinedNameMap = {};
        const dirtySuperTableMap: IDirtyUnitSuperTableMap = {};
        const dirtyUnitFeatureMap: IDirtyUnitFeatureMap = {};
        const dirtyUnitOtherFormulaMap: IDirtyUnitOtherFormulaMap = {};
        const clearDependencyTreeCache: IDirtyUnitSheetNameMap = {};

        return {
            forceCalculation,
            dirtyRanges,
            dirtyNameMap,
            dirtyDefinedNameMap,
            dirtySuperTableMap,
            dirtyUnitFeatureMap,
            dirtyUnitOtherFormulaMap,
            clearDependencyTreeCache,
        };
    }
}
