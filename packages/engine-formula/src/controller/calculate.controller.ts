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

import type { ICommandInfo } from '@univerjs/core';

import type { ISetArrayFormulaDataMutationParams } from '../commands/mutations/set-array-formula-data.mutation';
import type { ISetFormulaCalculationStartMutation } from '../commands/mutations/set-formula-calculation.mutation';
import type { IFormulaDirtyData } from '../services/current-data.service';
import type { IAllRuntimeData } from '../services/runtime.service';
import { Disposable, ICommandService, Inject } from '@univerjs/core';
import { convertRuntimeToUnitData } from '../basics/runtime';
import { SetArrayFormulaDataMutation } from '../commands/mutations/set-array-formula-data.mutation';
import {
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationResultMutation,
    SetFormulaCalculationStartMutation,
    SetFormulaCalculationStopMutation,
} from '../commands/mutations/set-formula-calculation.mutation';
import { FormulaDataModel } from '../models/formula-data.model';
import { ICalculateFormulaService } from '../services/calculate-formula.service';
import { FormulaExecutedStateType } from '../services/runtime.service';
import { DEFAULT_CYCLE_REFERENCE_COUNT } from './config.schema';

export class CalculateController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @ICalculateFormulaService private readonly _calculateFormulaService: ICalculateFormulaService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._commandExecutedListener();
        this._initialExecuteFormulaListener();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetFormulaCalculationStopMutation.id) {
                    this._calculateFormulaService.stopFormulaExecution();
                } else if (command.id === SetFormulaCalculationStartMutation.id) {
                    this._calculate(command.params as ISetFormulaCalculationStartMutation);
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
        formulaDirtyData: Partial<IFormulaDirtyData>
    ) {
        const { forceCalculation: forceCalculate = false, dirtyRanges = [], dirtyNameMap = {}, dirtyDefinedNameMap = {}, dirtyUnitFeatureMap = {}, dirtyUnitOtherFormulaMap = {}, clearDependencyTreeCache = {}, maxIteration = DEFAULT_CYCLE_REFERENCE_COUNT, rowData } = formulaDirtyData;

        const formulaData = this._formulaDataModel.getFormulaData();
        const arrayFormulaCellData = this._formulaDataModel.getArrayFormulaCellData();
        // array formula range is used to check whether the newly added array formula conflicts with the existing array formula
        const arrayFormulaRange = this._formulaDataModel.getArrayFormulaRange();

        this._calculateFormulaService.execute({
            formulaData,
            arrayFormulaCellData,
            arrayFormulaRange,
            forceCalculate,
            dirtyRanges,
            dirtyNameMap,
            dirtyDefinedNameMap,
            dirtyUnitFeatureMap,
            dirtyUnitOtherFormulaMap,
            clearDependencyTreeCache,
            maxIteration,
            rowData,
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
                    this._applyResult(data);
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

        /**
         * Assignment operation after formula calculation.
         */
        this._calculateFormulaService.executionInProgressListener$.subscribe((data) => {
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

    private async _applyResult(data: IAllRuntimeData) {
        const { unitData, unitOtherData, arrayFormulaRange, arrayFormulaCellData, clearArrayFormulaCellData } = data;

        if (!unitData) {
            console.error('No sheetData from Formula Engine!');
            return;
        }

        if (arrayFormulaRange) {
            this._formulaDataModel.clearPreviousArrayFormulaCellData(clearArrayFormulaCellData);
            this._formulaDataModel.mergeArrayFormulaCellData(arrayFormulaCellData);
            this._formulaDataModel.mergeArrayFormulaRange(arrayFormulaRange);

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
