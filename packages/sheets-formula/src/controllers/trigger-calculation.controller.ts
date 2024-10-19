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

import type { ICommandInfo, IUnitRange } from '@univerjs/core';
import type {
    IDirtyUnitFeatureMap,
    IDirtyUnitOtherFormulaMap,
    IDirtyUnitSheetNameMap,
    IFormulaDirtyData,
    ISetFormulaCalculationNotificationMutation,
} from '@univerjs/engine-formula';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { Disposable, ICommandService } from '@univerjs/core';
import {
    IActiveDirtyManagerService,
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationResultMutation,
    SetFormulaCalculationStartMutation,
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

    private _totalCalculationTaskCount = 0;

    private _doneCalculationTaskCount = 0;

    private readonly _progress$ = new BehaviorSubject<ICalculationProgress>(NilProgress);

    readonly progress$ = this._progress$.asObservable();

    private _progressTimer: NodeJS.Timeout | null = null;

    private _emitProgress(): void {
        this._progress$.next({ done: this._doneCalculationTaskCount, count: this._totalCalculationTaskCount });
    }

    private _addTotalCount(count: number): void {
        this._totalCalculationTaskCount += count;
        this._emitProgress();
    }

    private _addDoneTask(count: number): void {
        this._doneCalculationTaskCount += count;
        this._doneCalculationTaskCount = Math.min(this._doneCalculationTaskCount, this._totalCalculationTaskCount);
        this._emitProgress();
    }

    private _startProgress(formulaCount: number): void {
        const timePerFormula = 7 / 500000; // seconds per formula
        const estimatedTime = formulaCount * timePerFormula * 1000; // convert to milliseconds

        const startProgress = 10; // starting from 10%
        const maxProgress = 90; // maximum progress is 90%
        const progressRange = maxProgress - startProgress; // total progress increment is 80%

        // Set total calculation task count to 1000 for percentage calculation
        this._totalCalculationTaskCount = 1000;
        // Initialize done task count to represent 10%
        this._doneCalculationTaskCount = startProgress * 10;

        const startTime = Date.now();
        const updateInterval = 100; // update every 100ms

        // Clear any existing progress timer
        if (this._progressTimer !== null) {
            clearInterval(this._progressTimer);
            this._progressTimer = null;
        }

        // Start the progress timer
        this._progressTimer = setInterval(() => {
            const elapsedTime = Date.now() - startTime;

            if (elapsedTime >= estimatedTime) {
                // Reached estimated time, set progress to 90% and clear the timer
                this._doneCalculationTaskCount = maxProgress * 10;
                this._emitProgress();
                if (this._progressTimer !== null) {
                    clearInterval(this._progressTimer);
                    this._progressTimer = null;
                }
                return;
            }

            // Calculate progress percentage based on elapsed time
            const progressPercent = startProgress + (elapsedTime / estimatedTime) * progressRange;
            this._doneCalculationTaskCount = progressPercent * 10; // since total is 1000

            // Ensure the progress does not exceed 90%
            if (this._doneCalculationTaskCount > maxProgress * 10) {
                this._doneCalculationTaskCount = maxProgress * 10;
            }

            this._emitProgress();
        }, updateInterval);
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

                    this._commandService.executeCommand(SetFormulaCalculationStartMutation.id, { ...this._executingDirtyData }, lo);

                    this._startExecutionTime = performance.now();

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
            forceCalculation: false,
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

    private _initialExecuteFormulaProcessListener() {
        // Assignment operation after formula calculation.
        let startDependencyTimer: NodeJS.Timeout | null = null;
        let calculationProcessCount = 0; // Multiple calculations are performed in parallel, but only one progress bar is displayed, and the progress is only closed after the last calculation is completed.

        this.disposeWithMe(

            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                const { id } = command;
                if (id === SetFormulaCalculationStartMutation.id) {
                    // Increment the calculation process count and assign a new ID
                    calculationProcessCount++;

                    // Clear any existing timer to prevent duplicate executions
                    if (startDependencyTimer !== null) {
                        clearTimeout(startDependencyTimer);
                        startDependencyTimer = null;
                    }

                    // If the total calculation time exceeds 1s, a progress bar is displayed. The first progress shows 10%
                    startDependencyTimer = setTimeout(() => {
                        // Ignore progress deviations, and finally the complete method ensures the correct completion of the progress
                        this._addTotalCount(10);
                        this._addDoneTask(1);
                        startDependencyTimer = null;
                    }, 1000);
                } else if (id === SetFormulaCalculationNotificationMutation.id) {
                    const { formulaCount } = command.params as ISetFormulaCalculationNotificationMutation;
                    this._startProgress(formulaCount);
                } else if (id === SetFormulaCalculationResultMutation.id) {
                    // Decrement the calculation process count
                    calculationProcessCount--;

                    console.warn(`Formula calculation succeeded, Total time consumed: ${performance.now() - this._startExecutionTime
                    } ms`);

                    this._resetExecutingDirtyData();

                    if (calculationProcessCount === 0) {
                        if (startDependencyTimer) {
                            // The total calculation time does not exceed 1s, and the progress bar is not displayed.
                            clearTimeout(startDependencyTimer);
                            startDependencyTimer = null;
                        } else {
                            // Manually hide the progress bar only if no other calculations are in process
                            this._completeProgress();
                            setTimeout(() => {
                                this._clearProgress();
                            }, 1500);
                        }

                        this._doneCalculationTaskCount = 0;
                        this._totalCalculationTaskCount = 0;
                    }
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
