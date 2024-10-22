/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICommandInfo, IUnitRange, Nullable } from '@univerjs/core';
import type {
    IDirtyUnitFeatureMap,
    IDirtyUnitOtherFormulaMap,
    IDirtyUnitSheetNameMap,
    IExecutionInProgressParams,
    IFormulaDirtyData,
    ISetFormulaCalculationNotificationMutation,
    ISetFormulaCalculationStartMutation,
} from '@univerjs/engine-formula';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { Disposable, ICommandService } from '@univerjs/core';
import {
    FormulaExecutedStateType,
    FormulaExecuteStageType,
    IActiveDirtyManagerService,
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationStartMutation,
    SetFormulaCalculationStopMutation,
} from '@univerjs/engine-formula';
import {
    ClearSelectionFormatCommand,
    SetBorderCommand,
    SetRangeValuesMutation,
    SetStyleCommand,
} from '@univerjs/sheets';
import { BehaviorSubject } from 'rxjs';

/**
 * This interface is for the progress bar to display the calculation progress.
 */
export interface ICalculationProgress {
    /** Task that already completed. */
    done: number;
    /** The total number of formulas need to calculate. */
    count: number;
}

const NilProgress: ICalculationProgress = { done: 0, count: 0 };

const lo = { onlyLocal: true };

export class TriggerCalculationController extends Disposable {
    private _waitingCommandQueue: ICommandInfo[] = [];

    private _executingDirtyData: IFormulaDirtyData = {
        forceCalculation: false,
        dirtyRanges: [],
        dirtyNameMap: {},
        dirtyDefinedNameMap: {},
        dirtyUnitFeatureMap: {},
        dirtyUnitOtherFormulaMap: {},
        clearDependencyTreeCache: {},
    };

    private _setTimeoutKey: NodeJS.Timeout | number = -1;

    private _startExecutionTime: number = 0;

    private _totalCalculationTaskCount: number = 0;

    private _doneCalculationTaskCount: number = 0;

    private _executionInProgressParams: Nullable<IExecutionInProgressParams> = null;

    private _restartCalculation = false;

    /**
     *
     */
    private _forceCalculating = false;

    private readonly _progress$ = new BehaviorSubject<ICalculationProgress>(NilProgress);

    readonly progress$ = this._progress$.asObservable();

    private _emitProgress(): void {
        this._progress$.next({ done: this._doneCalculationTaskCount, count: this._totalCalculationTaskCount });
    }

    private _startProgress(): void {
        if (this._executionInProgressParams) {
            const { totalFormulasToCalculate, completedFormulasCount, totalArrayFormulasToCalculate, completedArrayFormulasCount } = this._executionInProgressParams;
            this._doneCalculationTaskCount = completedFormulasCount + completedArrayFormulasCount;
            this._totalCalculationTaskCount = totalFormulasToCalculate + totalArrayFormulasToCalculate;

            this._emitProgress();
        }
    }

    private _completeProgress(): void {
        this._doneCalculationTaskCount = this._totalCalculationTaskCount;
        this._emitProgress();
    }

    private _clearProgress(): void {
        this._doneCalculationTaskCount = 0;
        this._totalCalculationTaskCount = 0;
        this._emitProgress();
    }

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IActiveDirtyManagerService private readonly _activeDirtyManagerService: IActiveDirtyManagerService
    ) {
        super();

        this._commandExecutedListener();
        this._initialExecuteFormulaProcessListener();
        this._initialExecuteFormula();
    }

    override dispose(): void {
        super.dispose();

        this._progress$.next(NilProgress);
        this._progress$.complete();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo, options) => {
                if (!this._activeDirtyManagerService.get(command.id)) {
                    return;
                }

                if (command.id === SetRangeValuesMutation.id) {
                    const params = command.params as ISetRangeValuesMutationParams;

                    if (
                        (options && options.onlyLocal === true) ||
                        params.trigger === SetStyleCommand.id ||
                        params.trigger === SetBorderCommand.id ||
                        params.trigger === ClearSelectionFormatCommand.id
                    ) {
                        return;
                    }
                }

                this._waitingCommandQueue.push(command);

                clearTimeout(this._setTimeoutKey);

                this._setTimeoutKey = setTimeout(() => {
                    const dirtyData = this._generateDirty(this._waitingCommandQueue);
                    this._executingDirtyData = this._mergeDirty(this._executingDirtyData, dirtyData);

                    if (this._executionInProgressParams == null) {
                        this._commandService.executeCommand(SetFormulaCalculationStartMutation.id, { ...this._executingDirtyData }, lo);
                    } else {
                        this._restartCalculation = true;
                        this._commandService.executeCommand(SetFormulaCalculationStopMutation.id, {});
                    }

                    this._waitingCommandQueue = [];
                }, 100);
            })
        );
    }

    private _generateDirty(commands: ICommandInfo[]) {
        const allDirtyRanges: IUnitRange[] = [];
        const allDirtyNameMap: IDirtyUnitSheetNameMap = {};
        const allDirtyDefinedNameMap: IDirtyUnitSheetNameMap = {};
        const allDirtyUnitFeatureMap: IDirtyUnitFeatureMap = {};
        const allDirtyUnitOtherFormulaMap: IDirtyUnitOtherFormulaMap = {};
        const allClearDependencyTreeCache: IDirtyUnitSheetNameMap = {};

        // const numfmtItemMap: INumfmtItemMap = Tools.deepClone(this._formulaDataModel.getNumfmtItemMap());

        for (const command of commands) {
            const conversion = this._activeDirtyManagerService.get(command.id);

            if (conversion == null) {
                continue;
            }

            const params = conversion.getDirtyData(command);

            const { dirtyRanges, dirtyNameMap, dirtyDefinedNameMap, dirtyUnitFeatureMap, dirtyUnitOtherFormulaMap, clearDependencyTreeCache } = params;

            if (dirtyRanges != null) {
                allDirtyRanges.push(...dirtyRanges);
            }

            if (dirtyNameMap != null) {
                this._mergeDirtyNameMap(allDirtyNameMap, dirtyNameMap);
            }

            if (dirtyDefinedNameMap != null) {
                this._mergeDirtyNameMap(allDirtyDefinedNameMap, dirtyDefinedNameMap);
            }

            if (dirtyUnitFeatureMap != null) {
                this._mergeDirtyUnitFeatureOrOtherFormulaMap(allDirtyUnitFeatureMap, dirtyUnitFeatureMap);
            }

            if (dirtyUnitOtherFormulaMap != null) {
                this._mergeDirtyUnitFeatureOrOtherFormulaMap(allDirtyUnitOtherFormulaMap, dirtyUnitOtherFormulaMap);
            }

            if (clearDependencyTreeCache != null) {
                this._mergeDirtyNameMap(allClearDependencyTreeCache, clearDependencyTreeCache);
            }
        }

        return {
            dirtyRanges: allDirtyRanges,
            dirtyNameMap: allDirtyNameMap,
            dirtyDefinedNameMap: allDirtyDefinedNameMap,
            dirtyUnitFeatureMap: allDirtyUnitFeatureMap,
            dirtyUnitOtherFormulaMap: allDirtyUnitOtherFormulaMap,
            forceCalculation: false,
            clearDependencyTreeCache: allClearDependencyTreeCache,
            // numfmtItemMap,
        };
    }

    private _mergeDirty(dirtyData1: IFormulaDirtyData, dirtyData2: IFormulaDirtyData) {
        const allDirtyRanges: IUnitRange[] = [...dirtyData1.dirtyRanges, ...dirtyData2.dirtyRanges];
        const allDirtyNameMap: IDirtyUnitSheetNameMap = { ...dirtyData1.dirtyNameMap };
        const allDirtyDefinedNameMap: IDirtyUnitSheetNameMap = { ...dirtyData1.dirtyDefinedNameMap };
        const allDirtyUnitFeatureMap: IDirtyUnitFeatureMap = { ...dirtyData1.dirtyUnitFeatureMap };
        const allDirtyUnitOtherFormulaMap: IDirtyUnitOtherFormulaMap = { ...dirtyData1.dirtyUnitOtherFormulaMap };
        const allClearDependencyTreeCache: IDirtyUnitSheetNameMap = { ...dirtyData1.clearDependencyTreeCache };

        this._mergeDirtyNameMap(allDirtyNameMap, dirtyData2.dirtyNameMap);
        this._mergeDirtyNameMap(allDirtyDefinedNameMap, dirtyData2.dirtyDefinedNameMap);
        this._mergeDirtyUnitFeatureOrOtherFormulaMap(allDirtyUnitFeatureMap, dirtyData2.dirtyUnitFeatureMap);
        this._mergeDirtyUnitFeatureOrOtherFormulaMap(allDirtyUnitOtherFormulaMap, dirtyData2.dirtyUnitOtherFormulaMap);
        this._mergeDirtyNameMap(allClearDependencyTreeCache, dirtyData2.clearDependencyTreeCache);

        return {
            dirtyRanges: allDirtyRanges,
            dirtyNameMap: allDirtyNameMap,
            dirtyDefinedNameMap: allDirtyDefinedNameMap,
            dirtyUnitFeatureMap: allDirtyUnitFeatureMap,
            dirtyUnitOtherFormulaMap: allDirtyUnitOtherFormulaMap,
            forceCalculation: !!this._forceCalculating,
            clearDependencyTreeCache: allClearDependencyTreeCache,
        };
    }

    private _mergeDirtyNameMap(allDirtyNameMap: IDirtyUnitSheetNameMap, dirtyNameMap: IDirtyUnitSheetNameMap) {
        Object.keys(dirtyNameMap).forEach((unitId) => {
            if (allDirtyNameMap[unitId] == null) {
                allDirtyNameMap[unitId] = {};
            }

            Object.keys(dirtyNameMap[unitId]!).forEach((sheetId) => {
                if (dirtyNameMap[unitId]?.[sheetId]) {
                    allDirtyNameMap[unitId]![sheetId] = dirtyNameMap[unitId]![sheetId];
                }
            });
        });
    }

    private _mergeDirtyUnitFeatureOrOtherFormulaMap(
        allDirtyUnitFeatureOrOtherFormulaMap: IDirtyUnitFeatureMap | IDirtyUnitOtherFormulaMap,
        dirtyUnitFeatureOrOtherFormulaMap: IDirtyUnitFeatureMap | IDirtyUnitOtherFormulaMap
    ) {
        Object.keys(dirtyUnitFeatureOrOtherFormulaMap).forEach((unitId) => {
            if (allDirtyUnitFeatureOrOtherFormulaMap[unitId] == null) {
                allDirtyUnitFeatureOrOtherFormulaMap[unitId] = {};
            }
            Object.keys(dirtyUnitFeatureOrOtherFormulaMap[unitId]!).forEach((sheetId) => {
                if (allDirtyUnitFeatureOrOtherFormulaMap[unitId]![sheetId] == null) {
                    allDirtyUnitFeatureOrOtherFormulaMap[unitId]![sheetId] = {};
                }
                Object.keys(dirtyUnitFeatureOrOtherFormulaMap[unitId]![sheetId]).forEach((featureIdOrFormulaId) => {
                    allDirtyUnitFeatureOrOtherFormulaMap[unitId]![sheetId][featureIdOrFormulaId] =
                        dirtyUnitFeatureOrOtherFormulaMap[unitId]![sheetId]![featureIdOrFormulaId] || false;
                });
            });
        });
    }

    // eslint-disable-next-line max-lines-per-function
    private _initialExecuteFormulaProcessListener() {
        // Assignment operation after formula calculation.
        let startDependencyTimer: NodeJS.Timeout | null = null;
        let calculationProcessCount = 0; // Multiple calculations are performed in parallel, but only one progress bar is displayed, and the progress is only closed after the last calculation is completed.

        this.disposeWithMe(

            // eslint-disable-next-line max-lines-per-function
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetFormulaCalculationStartMutation.id) {
                    const { forceCalculation } = command.params as ISetFormulaCalculationStartMutation;
                    if (forceCalculation) {
                        this._forceCalculating = true;
                    }
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
                        }, 1000);
                    } else if (stage === FormulaExecuteStageType.CURRENTLY_CALCULATING || stage === FormulaExecuteStageType.CURRENTLY_CALCULATING_ARRAY_FORMULA) {
                        this._executionInProgressParams = params.stageInfo;

                        if (startDependencyTimer === null) {
                            this._startProgress();
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
                            this._resetExecutingDirtyData();
                            break;
                        case FormulaExecutedStateType.STOP_EXECUTION:
                            result = 'The execution of the formula has been stopped';
                            // this._executingCommandQueue = [];
                            this._clearProgress();
                            calculationProcessCount = 0;
                            break;
                        case FormulaExecutedStateType.SUCCESS:
                            result = 'Formula calculation succeeded';

                            if (calculationProcessCount === 0) {
                                result += `. Total time consumed: ${performance.now() - this._startExecutionTime} ms`;
                            }

                            this._resetExecutingDirtyData();
                            break;
                        case FormulaExecutedStateType.INITIAL:
                            result = 'Waiting for calculation';
                            this._resetExecutingDirtyData();
                            break;
                    }

                    if (calculationProcessCount === 0) {
                        if (startDependencyTimer) {
                            // The total calculation time does not exceed 1s, and the progress bar is not displayed.
                            clearTimeout(startDependencyTimer);
                            startDependencyTimer = null;
                            this._clearProgress();
                        } else {
                            // Manually hide the progress bar only if no other calculations are in process
                            this._completeProgress();
                        }

                        this._doneCalculationTaskCount = 0;
                        this._totalCalculationTaskCount = 0;
                        this._forceCalculating = false;
                    }

                    if (state === FormulaExecutedStateType.STOP_EXECUTION && this._restartCalculation) {
                        this._restartCalculation = false;
                        this._commandService.executeCommand(
                            SetFormulaCalculationStartMutation.id,
                            {
                                ...this._executingDirtyData,
                            },
                            lo
                        );
                    } else {
                        this._executionInProgressParams = null;
                    }

                    console.warn(`Execution result: ${result}`);
                }
            })
        );
    }

    private _resetExecutingDirtyData() {
        this._executingDirtyData = {
            dirtyRanges: [],
            dirtyNameMap: {},
            dirtyDefinedNameMap: {},
            dirtyUnitFeatureMap: {},
            dirtyUnitOtherFormulaMap: {},
            forceCalculation: false,
            clearDependencyTreeCache: {},
        };
    }

    private _initialExecuteFormula() {
        this._commandService.executeCommand(
            SetFormulaCalculationStartMutation.id,
            {
                commands: [],
                forceCalculation: true,
            },
            lo
        );
    }
}
