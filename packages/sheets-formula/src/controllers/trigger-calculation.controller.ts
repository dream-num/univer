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
import { Disposable, ICommandService, LifecycleStages, OnLifecycle, throttle, Tools } from '@univerjs/core';
import type {
    IDirtyUnitFeatureMap,
    IDirtyUnitOtherFormulaMap,
    IDirtyUnitSheetNameMap,
    ISetFormulaCalculationNotificationMutation
} from '@univerjs/engine-formula';
import {
    FormulaDataModel,
    FormulaExecutedStateType,
    FormulaExecuteStageType,
    IActiveDirtyManagerService,
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationStartMutation,
} from '@univerjs/engine-formula';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import {
    ClearSelectionFormatCommand,
    INumfmtService,
    SetBorderCommand,
    SetRangeValuesMutation,
    SetStyleCommand,
} from '@univerjs/sheets';
import { IProgressService } from '@univerjs/ui';

import { Inject } from '@wendellhu/redi';

const MINIMUM_FORMULA_NUMBER = 500;

@OnLifecycle(LifecycleStages.Ready, TriggerCalculationController)
export class TriggerCalculationController extends Disposable {
    private _waitingCommandQueue: ICommandInfo[] = [];

    private _executingCommandQueue: ICommandInfo[] = [];

    private _setTimeoutKey: NodeJS.Timeout | number = -1;

    private _startExecutionTime: number = 0;

    private _formulaCalculationDoneCount: number = 0;

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IActiveDirtyManagerService private readonly _activeDirtyManagerService: IActiveDirtyManagerService,
        @Inject(INumfmtService) private readonly _numfmtService: INumfmtService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel,
        @Inject(IProgressService) private readonly _progressService: IProgressService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._commandExecutedListener();

        this._initialExecuteFormulaProcessListener();

        this._initialExecuteFormula();
    }

    private _commandExecutedListener() {
        // const updateCommandList = [
        //     SetRangeValuesMutation.id,
        //     MoveRangeMutation.id,
        //     MoveRowsMutation.id,
        //     MoveColsMutation.id,
        //     DeleteRangeMutation.id,
        //     InsertRangeMutation.id,
        //     RemoveRowMutation.id,
        //     RemoveColMutation.id,
        //     RemoveSheetMutation.id,
        //     // SetWorksheetNameMutation.id,
        //     InsertSheetMutation.id,
        // ];

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
                    this._commandService.executeCommand(
                        SetFormulaCalculationStartMutation.id,
                        {
                            ...this._generateDirty(this._waitingCommandQueue),
                        },
                        {
                            onlyLocal: true,
                        }
                    );

                    this._startExecutionTime = performance.now();

                    this._executingCommandQueue = this._waitingCommandQueue;

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

        // const numfmtItemMap: INumfmtItemMap = Tools.deepClone(this._formulaDataModel.getNumfmtItemMap());

        for (const command of commands) {
            const conversion = this._activeDirtyManagerService.get(command.id);

            if (conversion == null) {
                continue;
            }

            const params = conversion.getDirtyData(command);

            const { dirtyRanges, dirtyNameMap, dirtyDefinedNameMap, dirtyUnitFeatureMap, dirtyUnitOtherFormulaMap } = params;

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
        }

        return {
            dirtyRanges: allDirtyRanges,
            dirtyNameMap: allDirtyNameMap,
            dirtyDefinedNameMap: allDirtyDefinedNameMap,
            dirtyUnitFeatureMap: allDirtyUnitFeatureMap,
            dirtyUnitOtherFormulaMap: allDirtyUnitOtherFormulaMap,
            // numfmtItemMap,
        };
    }

    private _mergeDirtyNameMap(allDirtyNameMap: IDirtyUnitSheetNameMap, dirtyNameMap: IDirtyUnitSheetNameMap) {
        Object.keys(dirtyNameMap).forEach((unitId) => {
            if (allDirtyNameMap[unitId] == null) {
                allDirtyNameMap[unitId] = {};
            }

            Object.keys(dirtyNameMap[unitId]!).forEach((sheetId) => {
                if (dirtyNameMap[unitId]?.[sheetId]) {
                    if (allDirtyNameMap[unitId] == null) {
                        allDirtyNameMap[unitId] = {};
                    }
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
        /**
         * Assignment operation after formula calculation.
         */
        const debouncedPushTask = throttle(this._pushTask.bind(this), 300);
        let startDependencyTimer: NodeJS.Timeout;

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id !== SetFormulaCalculationNotificationMutation.id) {
                    return;
                }

                const params = command.params as ISetFormulaCalculationNotificationMutation;

                if (params.stageInfo != null) {
                    const {
                        totalFormulasToCalculate,
                        completedFormulasCount,
                        totalArrayFormulasToCalculate,
                        completedArrayFormulasCount,
                        stage,
                    } = params.stageInfo;

                    if (stage === FormulaExecuteStageType.START_DEPENDENCY) {
                        // If the dependency analysis is not completed within 500ms, it means that the amount of calculation is very large, and the progress is displayed as 5%.
                        startDependencyTimer = setTimeout(() => {
                            this._progressService.insertTaskCount(100);
                            this._progressService.pushTask({ count: 5 });
                        }, 500);
                    } else if (stage === FormulaExecuteStageType.START_CALCULATION) {
                        // Clear the timer directly, ignore the progress error in setTimeout, and finally the complete method ensures the correct completion of the progress
                        clearTimeout(startDependencyTimer);

                        if (totalFormulasToCalculate >= MINIMUM_FORMULA_NUMBER) {
                            // Array formulas also go through the calculation process, so the total is twice
                            this._progressService.insertTaskCount(totalFormulasToCalculate * 2);
                        }
                    } else if (stage === FormulaExecuteStageType.CURRENTLY_CALCULATING) {
                        debouncedPushTask(completedFormulasCount);
                    } else if (stage === FormulaExecuteStageType.CURRENTLY_CALCULATING_ARRAY_FORMULA) {
                        debouncedPushTask(completedArrayFormulasCount);
                    }


                    // if (totalArrayFormulasToCalculate > 0) {
                    // console.warn(
                    //     `Stage ${stage} Array formula.There are ${totalArrayFormulasToCalculate} functions to be executed, ${completedArrayFormulasCount} complete.`
                    // );
                    // } else {
                    //     console.warn(
                    //         `Stage ${stage} .There are ${totalFormulasToCalculate} functions to be executed, ${completedFormulasCount} complete.`
                    //     );
                    // }
                } else {
                    const state = params.functionsExecutedState;
                    let result = '';
                    switch (state) {
                        case FormulaExecutedStateType.NOT_EXECUTED:
                            result = 'No tasks are being executed anymore';
                            // this._waitingCommandQueue.unshift(...this._executingCommandQueue);
                            this._executingCommandQueue = [];
                            break;
                        case FormulaExecutedStateType.STOP_EXECUTION:
                            result = 'The execution of the formula has been stopped';
                            this._waitingCommandQueue.unshift(...this._executingCommandQueue);
                            this._executingCommandQueue = [];
                            break;
                        case FormulaExecutedStateType.SUCCESS:
                            result = `Formula calculation succeeded, Total time consumed: ${performance.now() - this._startExecutionTime
                            } ms`;
                            this._executingCommandQueue = [];
                            break;
                        case FormulaExecutedStateType.INITIAL:
                            result = 'Waiting for calculation';
                            this._executingCommandQueue = [];
                            break;
                    }

                    //  Manually hide the progress bar to prevent the progress bar from not being hidden due to pushTask statistical errors
                    this._progressService.complete();
                    console.warn(`execution result${result}`);
                }
            })
        );
    }

    private _initialExecuteFormula() {
        this._commandService.executeCommand(
            SetFormulaCalculationStartMutation.id,
            {
                commands: [],
                forceCalculation: true,
            },
            {
                onlyLocal: true,
            }
        );
    }

    /**
     * Update progress by completed count
     * @param completedCount
     */
    private _pushTask(completedCount: number) {
        const count = completedCount - this._formulaCalculationDoneCount;
        this._formulaCalculationDoneCount = completedCount;
        this._progressService.pushTask({ count });
    }
}
