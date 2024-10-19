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
import type { IDirtyUnitFeatureMap, IDirtyUnitOtherFormulaMap, IDirtyUnitSheetDefinedNameMap, IDirtyUnitSheetNameMap, IFormulaData } from '../basics/common';

import type { ISetArrayFormulaDataMutationParams } from '../commands/mutations/set-array-formula-data.mutation';
import type { ISetFormulaCalculationNotificationMutation, ISetFormulaCalculationStartMutation } from '../commands/mutations/set-formula-calculation.mutation';
import type { ISetFormulaDataMutationParams } from '../commands/mutations/set-formula-data.mutation';
import type { IAllRuntimeData } from '../services/runtime.service';
import { Disposable, ICommandService, Inject } from '@univerjs/core';
import { convertRuntimeToUnitData } from '../basics/runtime';
import { SetArrayFormulaDataMutation } from '../commands/mutations/set-array-formula-data.mutation';
import {
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationResultMutation,
    SetFormulaCalculationStartMutation,
} from '../commands/mutations/set-formula-calculation.mutation';
import { SetFormulaDataMutation } from '../commands/mutations/set-formula-data.mutation';
import { FormulaDataModel } from '../models/formula-data.model';
import { CalculateFormulaService } from '../services/calculate-formula.service';

export class CalculateController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(CalculateFormulaService) private readonly _calculateFormulaService: CalculateFormulaService,
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
                if (command.id === SetFormulaDataMutation.id) {
                    const formulaData = (command.params as ISetFormulaDataMutationParams).formulaData as IFormulaData;

                    // formulaData is the incremental data sent from the main thread and needs to be merged into formulaDataModel
                    this._formulaDataModel.mergeFormulaData(formulaData);
                } else if (command.id === SetFormulaCalculationStartMutation.id) {
                    const params = command.params as ISetFormulaCalculationStartMutation;

                    if (params.forceCalculation === true) {
                        this._calculate(true);
                    } else {
                        const { dirtyRanges, dirtyNameMap, dirtyDefinedNameMap, dirtyUnitFeatureMap, dirtyUnitOtherFormulaMap, clearDependencyTreeCache } = params;

                        this._calculate(false, dirtyRanges, dirtyNameMap, dirtyDefinedNameMap, dirtyUnitFeatureMap, dirtyUnitOtherFormulaMap, clearDependencyTreeCache);
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
        dirtyUnitOtherFormulaMap: IDirtyUnitOtherFormulaMap = {},
        clearDependencyTreeCache: IDirtyUnitSheetNameMap = {}
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
        });
    }

    // Notification
    private _initialExecuteFormulaListener() {
        this._calculateFormulaService.executionStartListener$.subscribe(() => {
            const params: ISetFormulaCalculationNotificationMutation = {
                startCalculate: true,
                formulaCount: 0,
            };

            this._commandService.executeCommand(
                SetFormulaCalculationNotificationMutation.id,
                params,
                {
                    onlyLocal: true,
                }
            );
        });

        this._calculateFormulaService.executionInProgressListener$.subscribe((formulaCount) => {
            const params: ISetFormulaCalculationNotificationMutation = {
                startCalculate: false,
                formulaCount,
            };

            this._commandService.executeCommand(
                SetFormulaCalculationNotificationMutation.id,
                params,
                {
                    onlyLocal: true,
                }
            );
        });

        /**
         * Assignment operation after formula calculation.
         */
        this._calculateFormulaService.executionCompleteListener$.subscribe((data) => {
            this._applyResult(data);
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
