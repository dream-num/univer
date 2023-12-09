import type { ICommandInfo, IUnitRange } from '@univerjs/core';
import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type {
    IDirtyUnitFeatureMap,
    IDirtyUnitSheetNameMap,
    ISetFormulaCalculationNotificationMutation,
} from '@univerjs/engine-formula';
import {
    FormulaExecutedStateType,
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationStartMutation,
} from '@univerjs/engine-formula';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { SetRangeValuesMutation, SetStyleCommand } from '@univerjs/sheets';

import { IActiveDirtyManagerService } from '../services/active-dirty-manager.service';

@OnLifecycle(LifecycleStages.Ready, TriggerCalculationController)
export class TriggerCalculationController extends Disposable {
    private _waitingCommandQueue: ICommandInfo[] = [];

    private _setTimeoutKey: NodeJS.Timeout | number = -1;

    private _startExecutionTime: number = 0;

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IActiveDirtyManagerService private readonly _activeDirtyManagerService: IActiveDirtyManagerService
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

                    if ((options && options.local === true) || params.trigger === SetStyleCommand.id) {
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
                            local: true,
                        }
                    );

                    this._startExecutionTime = performance.now();
                }, 100);
            })
        );
    }

    private _generateDirty(commands: ICommandInfo[]) {
        const allDirtyRanges: IUnitRange[] = [];
        const allDirtyNameMap: IDirtyUnitSheetNameMap = {};
        const allDirtyUnitFeatureMap: IDirtyUnitFeatureMap = {};

        for (const command of commands) {
            const conversion = this._activeDirtyManagerService.get(command.id);

            if (conversion == null) {
                continue;
            }

            const params = conversion.getDirtyData(command);

            const { dirtyRanges, dirtyNameMap, dirtyUnitFeatureMap } = params;

            if (dirtyRanges != null) {
                allDirtyRanges.push(...dirtyRanges);
            }

            if (dirtyNameMap != null) {
                this._mergeDirtyNameMap(allDirtyNameMap, dirtyNameMap);
            }

            if (dirtyUnitFeatureMap != null) {
                this._mergeDirtyUnitFeatureMap(allDirtyUnitFeatureMap, dirtyUnitFeatureMap);
            }
        }

        return {
            dirtyRanges: allDirtyRanges,
            dirtyNameMap: allDirtyNameMap,
            dirtyUnitFeatureMap: allDirtyUnitFeatureMap,
        };
    }

    private _mergeDirtyNameMap(allDirtyNameMap: IDirtyUnitSheetNameMap, dirtyNameMap: IDirtyUnitSheetNameMap) {
        Object.keys(dirtyNameMap).forEach((unitId) => {
            if (allDirtyNameMap[unitId] == null) {
                allDirtyNameMap[unitId] = {};
            }
            Object.keys(dirtyNameMap[unitId]).forEach((sheetId) => {
                allDirtyNameMap[unitId][sheetId] = dirtyNameMap[unitId][sheetId];
            });
        });
    }

    private _mergeDirtyUnitFeatureMap(
        allDirtyUnitFeatureMap: IDirtyUnitFeatureMap,
        dirtyUnitFeatureMap: IDirtyUnitFeatureMap
    ) {
        Object.keys(dirtyUnitFeatureMap).forEach((unitId) => {
            if (allDirtyUnitFeatureMap[unitId] == null) {
                allDirtyUnitFeatureMap[unitId] = {};
            }
            Object.keys(dirtyUnitFeatureMap[unitId]).forEach((sheetId) => {
                if (allDirtyUnitFeatureMap[unitId][sheetId] == null) {
                    allDirtyUnitFeatureMap[unitId][sheetId] = {};
                }
                Object.keys(dirtyUnitFeatureMap[unitId][sheetId]).forEach((featureId) => {
                    allDirtyUnitFeatureMap[unitId][sheetId][featureId] =
                        dirtyUnitFeatureMap[unitId][sheetId][featureId];
                });
            });
        });
    }

    private _initialExecuteFormulaProcessListener() {
        /**
         * Assignment operation after formula calculation.
         */

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
                    if (totalArrayFormulasToCalculate > 0) {
                        console.log(
                            `Stage ${stage} Array formula.There are ${totalArrayFormulasToCalculate} functions to be executed, ${completedArrayFormulasCount} complete.`
                        );
                    } else {
                        console.log(
                            `Stage ${stage} .There are ${totalFormulasToCalculate} functions to be executed, ${completedFormulasCount} complete.`
                        );
                    }
                } else {
                    const state = params.functionsExecutedState;
                    let result = '';
                    switch (state) {
                        case FormulaExecutedStateType.NOT_EXECUTED:
                            result = 'No tasks are being executed anymore';
                            break;
                        case FormulaExecutedStateType.STOP_EXECUTION:
                            result = 'The execution of the formula has been stopped';
                            break;
                        case FormulaExecutedStateType.SUCCESS:
                            result = `Formula calculation succeeded, Total time consumed: ${
                                performance.now() - this._startExecutionTime
                            } ms`;
                            break;
                        case FormulaExecutedStateType.INITIAL:
                            result = 'Waiting for calculation';
                            break;
                    }
                    console.log(`execution result${result}`);
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
                local: true,
            }
        );
    }
}
