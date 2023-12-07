import type { ICommandInfo, IUnitRange } from '@univerjs/core';
import { Disposable, ICommandService, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import type { IDirtyUnitFeatureMap, IDirtyUnitSheetNameMap, IFormulaData } from '../basics/common';
import type { ISetArrayFormulaDataMutationParams } from '../commands/mutations/set-array-formula-data.mutation';
import { SetArrayFormulaDataMutation } from '../commands/mutations/set-array-formula-data.mutation';
import type { ISetFormulaCalculationStartMutation } from '../commands/mutations/set-formula-calculation.mutation';
import {
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationResultMutation,
    SetFormulaCalculationStartMutation,
    SetFormulaCalculationStopMutation,
} from '../commands/mutations/set-formula-calculation.mutation';
import type { ISetFormulaDataMutationParams } from '../commands/mutations/set-formula-data.mutation';
import { SetFormulaDataMutation } from '../commands/mutations/set-formula-data.mutation';
import { FormulaDataModel } from '../models/formula-data.model';
import { IActiveDirtyManagerService } from '../services/active-dirty-manager.service';
import { FormulaEngineService } from '../services/formula-engine.service';
import type { IAllRuntimeData } from '../services/runtime.service';
import { FormulaExecutedStateType } from '../services/runtime.service';

@OnLifecycle(LifecycleStages.Ready, CalculateController)
export class CalculateController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(FormulaEngineService) private readonly _formulaEngineService: FormulaEngineService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel,
        @IActiveDirtyManagerService private readonly _activeDirtyManagerService: IActiveDirtyManagerService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._commandExecutedListener();
        this._initialExecuteFormulaListener();

        this._initialExecuteFormulaProcessListener();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo, options) => {
                if (command.id === SetFormulaCalculationStopMutation.id) {
                    this._formulaEngineService.stopFormulaExecution();
                } else if (command.id === SetFormulaDataMutation.id) {
                    const formulaData = (command.params as ISetFormulaDataMutationParams).formulaData as IFormulaData;
                    this._formulaDataModel.setFormulaData(formulaData);
                } else if (command.id === SetFormulaCalculationStartMutation.id) {
                    const params = command.params as ISetFormulaCalculationStartMutation;

                    if (params.forceCalculation === true) {
                        this._calculate(true);
                    } else {
                        const { dirtyRanges, dirtyNameMap, dirtyUnitFeatureMap } = this._generateDirty(params.commands);

                        this._calculate(false, dirtyRanges, dirtyNameMap, dirtyUnitFeatureMap);
                    }
                } else if (command.id === SetArrayFormulaDataMutation.id) {
                    const params = command.params as ISetArrayFormulaDataMutationParams;

                    if (params == null) {
                        return;
                    }

                    const { arrayFormulaRange, arrayFormulaCellData } = params;
                    this._formulaDataModel.setArrayFormulaRange(arrayFormulaRange);
                    this._formulaDataModel.setArrayFormulaCellData(arrayFormulaCellData);
                }
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

    private async _calculate(
        forceCalculate: boolean = false,
        dirtyRanges: IUnitRange[] = [],
        dirtyNameMap: IDirtyUnitSheetNameMap = {},
        dirtyUnitFeatureMap: IDirtyUnitFeatureMap = {}
    ) {
        if (
            dirtyRanges.length === 0 &&
            Object.keys(dirtyNameMap).length === 0 &&
            Object.keys(dirtyUnitFeatureMap).length === 0 &&
            forceCalculate === false
        ) {
            return;
        }

        const formulaData = this._formulaDataModel.getFormulaData();

        const arrayFormulaCellData = this._formulaDataModel.getArrayFormulaCellData();

        // Synchronous to the main thread
        // this._commandService.executeCommand(SetFormulaDataMutation.id, { formulaData });
        this._formulaEngineService.execute({
            formulaData,
            arrayFormulaCellData,
            forceCalculate,
            dirtyRanges,
            dirtyNameMap,
            dirtyUnitFeatureMap,
        });
    }

    // Notification
    private _initialExecuteFormulaListener() {
        /**
         * Assignment operation after formula calculation.
         */
        this._formulaEngineService.executionCompleteListener$.subscribe((data) => {
            const functionsExecutedState = data.functionsExecutedState;
            switch (functionsExecutedState) {
                case FormulaExecutedStateType.NOT_EXECUTED:
                    break;
                case FormulaExecutedStateType.STOP_EXECUTION:
                    break;
                case FormulaExecutedStateType.SUCCESS:
                    this._applyFormula(data);
                    break;
                case FormulaExecutedStateType.INITIAL:
                    break;
            }

            this._commandService.executeCommand(
                SetFormulaCalculationNotificationMutation.id,
                {
                    functionsExecutedState,
                },
                {
                    local: true,
                }
            );
        });
    }

    private _initialExecuteFormulaProcessListener() {
        /**
         * Assignment operation after formula calculation.
         */
        this._formulaEngineService.executionInProgressListener$.subscribe((data) => {
            const {
                totalFormulasToCalculate,
                completedFormulasCount,
                totalArrayFormulasToCalculate,
                completedArrayFormulasCount,
                stage,
            } = data;

            if (totalArrayFormulasToCalculate > 0) {
                console.log(
                    `Stage ${stage} Array formula.There are ${totalArrayFormulasToCalculate} functions to be executed, ${completedArrayFormulasCount} complete.`
                );
            } else {
                console.log(
                    `Stage ${stage} .There are ${totalFormulasToCalculate} functions to be executed, ${completedFormulasCount} complete.`
                );
            }

            this._commandService.executeCommand(
                SetFormulaCalculationNotificationMutation.id,
                {
                    stageInfo: data,
                },
                {
                    local: true,
                }
            );
        });
    }

    private async _applyFormula(data: IAllRuntimeData) {
        const { unitData, unitOtherData, arrayFormulaRange, arrayFormulaCellData, clearArrayFormulaCellData } = data;

        if (!unitData) {
            console.error('No sheetData from Formula Engine!');
            return;
        }

        // const deleteMutationInfo = this._deletePreviousArrayFormulaValue(arrayFormulaRange);

        if (arrayFormulaRange) {
            this._formulaDataModel.clearPreviousArrayFormulaCellData(clearArrayFormulaCellData);

            this._formulaDataModel.mergeArrayFormulaCellData(arrayFormulaCellData);

            this._formulaDataModel.mergeArrayFormulaRange(arrayFormulaRange);

            // Synchronous to the main thread
            this._commandService.executeCommand(
                SetArrayFormulaDataMutation.id,
                {
                    arrayFormulaRange: this._formulaDataModel.getArrayFormulaRange(),
                    arrayFormulaCellData: this._formulaDataModel.getArrayFormulaCellData(),
                },
                {
                    local: true,
                }
            );
        }

        this._commandService.executeCommand(
            SetFormulaCalculationResultMutation.id,
            {
                unitData,
                unitOtherData,
            },
            {
                local: true,
            }
        );
    }
}
