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
import type { IUniverSheetsFormulaBaseConfig } from './config.schema';
import { Disposable, ICommandService, IConfigService, ILogService, Inject, LocaleService } from '@univerjs/core';
import {
    ENGINE_FORMULA_CYCLE_REFERENCE_COUNT,
    FormulaDataModel,
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
import { RegisterOtherFormulaService } from '../services/register-other-formula.service';
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

        const analyzing = this._localeService.t('formula.progress.analyzing');
        this._emitProgress(analyzing);
    }

    private _calculateProgress(label: string): void {
        if (this._executionInProgressParams) {
            const { totalFormulasToCalculate, completedFormulasCount, totalArrayFormulasToCalculate, completedArrayFormulasCount } = this._executionInProgressParams;
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

        const done = this._localeService.t('formula.progress.done');
        this._emitProgress(done);
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
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(RegisterOtherFormulaService) private readonly _registerOtherFormulaService: RegisterOtherFormulaService
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
        // clear timer when disposed
        clearTimeout(this._setTimeoutKey);
    }

    private _getCalculationMode(): CalculationMode {
        const config = this._configService.getConfig<IUniverSheetsFormulaBaseConfig>(PLUGIN_CONFIG_KEY_BASE);
        return config?.initialFormulaComputing ?? CalculationMode.WHEN_EMPTY;
    }

    private _commandExecutedListener() {
        // The filtering information is not synchronized to the worker and must be passed in from the main thread each time
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetFormulaCalculationStartMutation.id) {
                    const params = command.params as ISetFormulaCalculationStartMutation;

                    params.rowData = this._formulaDataModel.getHiddenRowsFiltered();
                }
            })
        );

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
                this._mergeDirtyRanges(allDirtyRanges, dirtyRanges);
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
            maxIteration: (this._configService.getConfig(ENGINE_FORMULA_CYCLE_REFERENCE_COUNT)) as number | undefined,
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

        const maxIteration = dirtyData1.maxIteration || dirtyData2.maxIteration;

        return {
            dirtyRanges: allDirtyRanges,
            dirtyNameMap: allDirtyNameMap,
            dirtyDefinedNameMap: allDirtyDefinedNameMap,
            dirtyUnitFeatureMap: allDirtyUnitFeatureMap,
            dirtyUnitOtherFormulaMap: allDirtyUnitOtherFormulaMap,
            forceCalculation: !!this._forceCalculating,
            clearDependencyTreeCache: allClearDependencyTreeCache,
            maxIteration,
        };
    }

    /**
     * dirtyRanges may overlap with the ranges in allDirtyRanges and need to be deduplicated
     * @param allDirtyRanges
     * @param dirtyRanges
     */
    private _mergeDirtyRanges(allDirtyRanges: IUnitRange[], dirtyRanges: IUnitRange[]) {
        for (const range of dirtyRanges) {
            let isDuplicate = false;
            for (const existingRange of allDirtyRanges) {
                // Check if the ranges are in the same unit and sheet
                if (range.unitId === existingRange.unitId && range.sheetId === existingRange.sheetId) {
                    // Check if the ranges overlap
                    const { startRow, startColumn, endRow, endColumn } = range.range;
                    const { startRow: existingStartRow, startColumn: existingStartColumn, endRow: existingEndRow, endColumn: existingEndColumn } = existingRange.range;
                    if (
                        startRow === existingStartRow &&
                        startColumn === existingStartColumn &&
                        endRow === existingEndRow &&
                        endColumn === existingEndColumn
                    ) {
                        isDuplicate = true;
                        break;
                    }
                }
            }
            if (!isDuplicate) {
                allDirtyRanges.push(range);
            }
        }
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
                    const { forceCalculation = false } = command.params as ISetFormulaCalculationStartMutation;

                    if (forceCalculation) {
                        this._forceCalculating = true;
                    }
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
                            const calculating = this._localeService.t('formula.progress.calculating');
                            this._calculateProgress(calculating);
                        }
                    } else if (stage === FormulaExecuteStageType.START_DEPENDENCY_ARRAY_FORMULA) {
                        this._executionInProgressParams = params.stageInfo;

                        if (startDependencyTimer === null) {
                            const arrayAnalysis = this._localeService.t('formula.progress.array-analysis');
                            this._calculateProgress(arrayAnalysis);
                        }
                    } else if (stage === FormulaExecuteStageType.CURRENTLY_CALCULATING_ARRAY_FORMULA) {
                        this._executionInProgressParams = params.stageInfo;

                        if (startDependencyTimer === null) {
                            const arrayCalculation = this._localeService.t('formula.progress.array-calculation');
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
        const calculationMode = this._getCalculationMode();
        const params = this._getDirtyDataByCalculationMode(calculationMode);
        this._commandService.executeCommand(SetFormulaCalculationStartMutation.id, params, lo);

        this._registerOtherFormulaService.calculateStarted$.next(true);
    }

    private _getDirtyDataByCalculationMode(calculationMode: CalculationMode): IFormulaDirtyData {
        const forceCalculation = calculationMode === CalculationMode.FORCED;

        // loop all sheets cell data, and get the dirty data
        const dirtyRanges: IUnitRange[] = calculationMode === CalculationMode.WHEN_EMPTY ? this._formulaDataModel.getFormulaDirtyRanges() : [];

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
            maxIteration: this._configService.getConfig(ENGINE_FORMULA_CYCLE_REFERENCE_COUNT) as number | undefined,
        };
    }
}
