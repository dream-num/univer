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
import { Disposable, ICommandService, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import type { IDirtyUnitFeatureMap, IDirtyUnitOtherFormulaMap, IDirtyUnitSheetDefinedNameMap, IDirtyUnitSheetNameMap, IFormulaData } from '../basics/common';
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
import { CalculateFormulaService } from '../services/calculate-formula.service';
import type { IAllRuntimeData } from '../services/runtime.service';
import { FormulaExecutedStateType } from '../services/runtime.service';
import { convertRuntimeToUnitData } from '../basics/runtime';

@OnLifecycle(LifecycleStages.Ready, CalculateController)
export class CalculateController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(CalculateFormulaService) private readonly _calculateFormulaService: CalculateFormulaService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel
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
                    this._calculateFormulaService.stopFormulaExecution();
                } else if (command.id === SetFormulaDataMutation.id) {
                    const formulaData = (command.params as ISetFormulaDataMutationParams).formulaData as IFormulaData;

                    // formulaData is the incremental data sent from the main thread and needs to be merged into formulaDataModel
                    this._formulaDataModel.mergeFormulaData(formulaData);
                } else if (command.id === SetFormulaCalculationStartMutation.id) {
                    const params = command.params as ISetFormulaCalculationStartMutation;

                    if (params.forceCalculation === true) {
                        this._calculate(true);
                    } else {
                        const { dirtyRanges, dirtyNameMap, dirtyDefinedNameMap, dirtyUnitFeatureMap, dirtyUnitOtherFormulaMap } = params;

                        this._calculate(false, dirtyRanges, dirtyNameMap, dirtyDefinedNameMap, dirtyUnitFeatureMap, dirtyUnitOtherFormulaMap);
                    }
                } else if (command.id === SetArrayFormulaDataMutation.id) {
                    const params = command.params as ISetArrayFormulaDataMutationParams;

                    if (params == null) {
                        return;
                    }

                    const { arrayFormulaRange, arrayFormulaCellData } = params;
                    // TODO@Dushusir: Merge the array formula data into the formulaDataModel
                    this._formulaDataModel.setArrayFormulaRange(arrayFormulaRange);
                    this._formulaDataModel.setArrayFormulaCellData(arrayFormulaCellData);
                }
            })
        );
    }

    private async _calculate(
        forceCalculate: boolean = false,
        dirtyRanges: IUnitRange[] = [],
        dirtyNameMap: IDirtyUnitSheetNameMap = {},
        dirtyDefinedNameMap: IDirtyUnitSheetDefinedNameMap = {},
        dirtyUnitFeatureMap: IDirtyUnitFeatureMap = {},
        dirtyUnitOtherFormulaMap: IDirtyUnitOtherFormulaMap = {}
    ) {
        if (
            dirtyRanges.length === 0 &&
            Object.keys(dirtyNameMap).length === 0 &&
            Object.keys(dirtyDefinedNameMap).length === 0 &&
            Object.keys(dirtyUnitFeatureMap).length === 0 &&
            Object.keys(dirtyUnitOtherFormulaMap).length === 0 &&
            forceCalculate === false
        ) {
            return;
        }

        const formulaData = this._formulaDataModel.getFormulaData();

        const arrayFormulaCellData = this._formulaDataModel.getArrayFormulaCellData();

        this._calculateFormulaService.execute({
            formulaData,
            arrayFormulaCellData,
            forceCalculate,
            dirtyRanges,
            dirtyNameMap,
            dirtyDefinedNameMap,
            dirtyUnitFeatureMap,
            dirtyUnitOtherFormulaMap,
        });
    }

    // Notification
    private _initialExecuteFormulaListener() {
        /**
         * Assignment operation after formula calculation.
         */
        this._calculateFormulaService.executionCompleteListener$.subscribe((data) => {
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
                    onlyLocal: true,
                }
            );
        });
    }

    private _initialExecuteFormulaProcessListener() {
        /**
         * Assignment operation after formula calculation.
         */
        this._calculateFormulaService.executionInProgressListener$.subscribe((data) => {
            const {
                totalFormulasToCalculate,
                completedFormulasCount,
                totalArrayFormulasToCalculate,
                completedArrayFormulasCount,
                stage,
            } = data;

            if (totalArrayFormulasToCalculate > 0) {
                // console.log(
                //     `Stage ${stage} Array formula.There are ${totalArrayFormulasToCalculate} functions to be executed, ${completedArrayFormulasCount} complete.`
                // );
            } else {
                // console.log(
                //     `Stage ${stage} .There are ${totalFormulasToCalculate} functions to be executed, ${completedFormulasCount} complete.`
                // );
            }

            this._commandService.executeCommand(
                SetFormulaCalculationNotificationMutation.id,
                {
                    stageInfo: data,
                },
                {
                    onlyLocal: true,
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
                    onlyLocal: true,
                }
            );
        }

        this._commandService.executeCommand(
            SetFormulaCalculationResultMutation.id,
            {
                unitData: convertRuntimeToUnitData(unitData),
                unitOtherData,
            },
            {
                onlyLocal: true,
            }
        );
    }
}
