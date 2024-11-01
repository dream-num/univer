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

import type { ICommandInfo, IUnitRange, Nullable, Workbook } from '@univerjs/core';
import type {
    IDirtyUnitFeatureMap,
    IDirtyUnitOtherFormulaMap,
    IDirtyUnitSheetNameMap,
    IExecutionInProgressParams,
    IFormulaDirtyData,
    ISetFormulaCalculationNotificationMutation,
    ISetFormulaCalculationStartMutation } from '@univerjs/engine-formula';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import type { IUniverSheetsFormulaBaseConfig } from './config.schema';
import { Disposable, ICommandService, IConfigService, ILogService, Inject, IUniverInstanceService, RANGE_TYPE } from '@univerjs/core';
import {
    FormulaDataModel,
    FormulaExecutedStateType,
    FormulaExecuteStageType,
    IActiveDirtyManagerService,
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationStartMutation,
    SetFormulaCalculationStopMutation } from '@univerjs/engine-formula';
import {
    ClearSelectionFormatCommand,
    SetBorderCommand,
    SetRangeValuesMutation,
    SetStyleCommand,
} from '@univerjs/sheets';
import { BehaviorSubject } from 'rxjs';
import { CalculationMode, PLUGIN_CONFIG_KEY_BASE } from './config.schema';

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
     * The mark of forced calculation. If a new mutation triggers dirty area calculation during the forced calculation process, forced calculation is still required.
     */
    private _forceCalculating = false;

    private readonly _progress$ = new BehaviorSubject<ICalculationProgress>(NilProgress);

    readonly progress$ = this._progress$.asObservable();

    private _emitProgress(label?: string): void {
        this._progress$.next({ done: this._doneCalculationTaskCount, count: this._totalCalculationTaskCount, label });
    }

    private _startProgress(): void {
        this._doneCalculationTaskCount = 0;
        this._totalCalculationTaskCount = 1;

        this._emitProgress('Analyzing');
    }

    private _calculateProgress(label: string): void {
        if (this._executionInProgressParams) {
            const { totalFormulasToCalculate, completedFormulasCount, totalArrayFormulasToCalculate, completedArrayFormulasCount } = this._executionInProgressParams;
            this._doneCalculationTaskCount = completedFormulasCount + completedArrayFormulasCount;
            this._totalCalculationTaskCount = totalFormulasToCalculate + totalArrayFormulasToCalculate;

            this._emitProgress(label);
        }
    }

    private _completeProgress(): void {
        this._doneCalculationTaskCount = this._totalCalculationTaskCount;
        this._emitProgress('Done');
    }

    clearProgress(): void {
        this._doneCalculationTaskCount = 0;
        this._totalCalculationTaskCount = 0;
        this._emitProgress();
    }

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IActiveDirtyManagerService private readonly _activeDirtyManagerService: IActiveDirtyManagerService,
        @ILogService private readonly _logService: ILogService,
        @IConfigService private readonly _configService: IConfigService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
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

            // eslint-disable-next-line max-lines-per-function, complexity
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetFormulaCalculationStartMutation.id) {
                    const { forceCalculation } = command.params as ISetFormulaCalculationStartMutation;
                    if (forceCalculation) {
                        this._forceCalculating = true;
                    }

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
                } else if (command.id === SetFormulaCalculationStopMutation.id) {
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

                    if (stage === FormulaExecuteStageType.CURRENTLY_CALCULATING) {
                        this._executionInProgressParams = params.stageInfo;

                        if (startDependencyTimer === null) {
                            this._calculateProgress('Calculating');
                        }
                    } else if (stage === FormulaExecuteStageType.START_DEPENDENCY_ARRAY_FORMULA) {
                        this._executionInProgressParams = params.stageInfo;

                        if (startDependencyTimer === null) {
                            this._calculateProgress('Array Analysis');
                        }
                    } else if (stage === FormulaExecuteStageType.CURRENTLY_CALCULATING_ARRAY_FORMULA) {
                        this._executionInProgressParams = params.stageInfo;

                        if (startDependencyTimer === null) {
                            this._calculateProgress('Array Calculation');
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
                            calculationProcessCount = 0;
                            break;
                        case FormulaExecutedStateType.SUCCESS:
                            result = 'Formula calculation succeeded';

                            // When the calculation is stopped and then a successful calculation is triggered, the value is -1
                            if (calculationProcessCount === 0 || calculationProcessCount === -1) {
                                result += `. Total time consumed: ${performance.now() - this._startExecutionTime} ms`;
                            }

                            this._resetExecutingDirtyData();
                            break;
                        case FormulaExecutedStateType.INITIAL:
                            result = 'Waiting for calculation';
                            this._resetExecutingDirtyData();
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

                    this._logService.debug('[TriggerCalculationController]', result);
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
        const config = this._configService.getConfig<IUniverSheetsFormulaBaseConfig>(PLUGIN_CONFIG_KEY_BASE);
        const calculationMode = config?.calculationMode ?? CalculationMode.WHEN_EMPTY;
        const params = this._getDiryDataByCalculationMode(calculationMode);
        this._commandService.executeCommand(SetFormulaCalculationStartMutation.id, params, lo);
    }

    private _getDiryDataByCalculationMode(calculationMode: CalculationMode): IFormulaDirtyData {
        const forceCalculation = calculationMode === CalculationMode.FORCED;

        // loop all sheets cell data, and get the dirty data
        const dirtyRanges: IUnitRange[] = calculationMode === CalculationMode.WHEN_EMPTY ? this._getFormulaRanges() : [];

        const dirtyNameMap: IDirtyUnitSheetNameMap = {};
        const dirtyDefinedNameMap: IDirtyUnitSheetNameMap = {};
        const dirtyUnitFeatureMap: IDirtyUnitFeatureMap = {};
        const dirtyUnitOtherFormulaMap: IDirtyUnitOtherFormulaMap = {};
        const clearDependencyTreeCache: IDirtyUnitSheetNameMap = {};

        return {
            forceCalculation,
            dirtyRanges,
            dirtyNameMap,
            dirtyDefinedNameMap,
            dirtyUnitFeatureMap,
            dirtyUnitOtherFormulaMap,
            clearDependencyTreeCache,
        };
    }

    /**
     * Function to get all formula ranges
     * @returns
     */
    private _getFormulaRanges(): IUnitRange[] {
        const formulaData = this._formulaDataModel.getFormulaData();

        const dirtyRanges: IUnitRange[] = [];

        for (const unitId in formulaData) {
            const workbook = formulaData[unitId];

            if (!workbook) continue;

            const workbookInstance = this._univerInstanceService.getUnit<Workbook>(unitId);

            if (!workbookInstance) continue;

            for (const sheetId in workbook) {
                const sheet = workbook[sheetId];

                if (!sheet) continue;

                const sheetInstance = workbookInstance.getSheetBySheetId(sheetId);

                if (!sheetInstance) continue;

                // Object to store continuous cell ranges by column
                const columnRanges: { [column: number]: { startRow: number; endRow: number }[] } = {};

                for (const rowStr of Object.keys(sheet)) {
                    const row = Number(rowStr);

                    for (const columnStr in sheet[row]) {
                        const column = Number(columnStr);

                        const currentCell = sheetInstance.getCellRaw(row, column);
                        // Calculation is only required when there is only a formula and no value
                        if (!currentCell || !currentCell.f || ('v' in currentCell)) continue;

                        if (!columnRanges[column]) columnRanges[column] = [];

                        const lastRange = columnRanges[column].slice(-1)[0];

                        // If the current row is continuous with the last range, extend endRow
                        if (lastRange && lastRange.endRow === row - 1) {
                            lastRange.endRow = row;
                        } else {
                            // Otherwise, start a new range
                            columnRanges[column].push({ startRow: row, endRow: row });
                        }
                    }
                }

                // Convert collected column ranges to IUnitRange format
                for (const column in columnRanges) {
                    const currentColumnRanges = columnRanges[column];
                    for (let i = 0; i < currentColumnRanges.length; i++) {
                        const range = currentColumnRanges[i];
                        dirtyRanges.push({
                            unitId,
                            sheetId,
                            range: {
                                rangeType: RANGE_TYPE.NORMAL,
                                startRow: range.startRow,
                                endRow: range.endRow, // Use endRow as the inclusive end row
                                startColumn: Number(column),
                                endColumn: Number(column),
                            },
                        });
                    }
                }
            }
        }

        return dirtyRanges;
    }
}
