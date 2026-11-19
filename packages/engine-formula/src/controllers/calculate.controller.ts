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
import { Disposable, ICommandService, Inject } from '@univerjs/core';
import type { ISetArrayFormulaDataMutationParams } from '../commands/mutations/set-array-formula-data.mutation';
import type {
    ISetFormulaCalculationStartMutation,
    ISetFormulaDependencyCalculationMutation,
    ISetFormulaStringBatchCalculationMutation,
    ISetQueryFormulaDependencyAllMutation,
    ISetQueryFormulaDependencyMutation,
} from '../commands/mutations/set-formula-calculation.mutation';
import type {
    IFormulaDependencyTreeJson,
    IFormulaDependentsAndInRangeResults,
} from '../engine/dependency/dependency-tree';
import type { IFormulaDirtyData } from '../services/current-data.service';
import { SetArrayFormulaDataMutation } from '../commands/mutations/set-array-formula-data.mutation';
import {
    SetCellFormulaDependencyCalculationMutation,
    SetCellFormulaDependencyCalculationResultMutation,
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationStartMutation,
    SetFormulaCalculationStopMutation,
    SetFormulaDependencyCalculationMutation,
    SetFormulaDependencyCalculationResultMutation,
    SetFormulaStringBatchCalculationMutation,
    SetFormulaStringBatchCalculationResultMutation,
    SetQueryFormulaDependencyAllMutation,
    SetQueryFormulaDependencyAllResultMutation,
    SetQueryFormulaDependencyMutation,
    SetQueryFormulaDependencyResultMutation,
} from '../commands/mutations/set-formula-calculation.mutation';
import { FormulaDataModel } from '../models/formula-data.model';
import { ICalculateFormulaService } from '../services/calculate-formula.service';

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
                } else if (command.id === SetFormulaStringBatchCalculationMutation.id) {
                    this._calculateFormulaString(command.params as ISetFormulaStringBatchCalculationMutation);
                } else if (command.id === SetFormulaDependencyCalculationMutation.id) {
                    this._generateAllDependencyTreeJson();
                } else if (command.id === SetCellFormulaDependencyCalculationMutation.id) {
                    this._generateCellDependencyTreeJson(command.params as ISetFormulaDependencyCalculationMutation);
                } else if (command.id === SetQueryFormulaDependencyMutation.id) {
                    const params = command.params as ISetQueryFormulaDependencyMutation;
                    this._queryFormulaDependencyJson(params);
                } else if (command.id === SetQueryFormulaDependencyAllMutation.id) {
                    const params = command.params as ISetQueryFormulaDependencyAllMutation;
                    this._queryFormulaDependencyAllJson(params);
                }
            })
        );
    }

    private async _calculate(formulaDirtyData: Partial<IFormulaDirtyData>) {
        const {
            dirtyIterationUnits,
            dirtyReferenceUnits,
            forceCalculation: forceCalculate = false,
            dirtyRanges = [],
            dirtyNameMap = {},
            dirtyDefinedNameMap = {},
            dirtySuperTableMap = {},
            dirtyUnitFeatureMap = {},
            dirtyUnitOtherFormulaMap = {},
            clearDependencyTreeCache = {},
            calculationSettings,
            rowData,
            externalReferences,
            isCalculateTreeModel = false,
        } = formulaDirtyData;

        const snapshotExecutor = this._calculateFormulaService.supportsFormulaDataSnapshot === true
            ? this._calculateFormulaService.executeWithFormulaDataSnapshot
            : undefined;
        // Capture at the same point as the eager list, before any later config reads.
        const snapshot = typeof snapshotExecutor === 'function'
            ? this._calculateFormulaService.prepareFormulaDataSnapshot?.()
            : undefined;
        const formulaData = snapshot ? undefined : this._formulaDataModel.getFormulaData();
        const arrayFormulaCellData = this._formulaDataModel.getArrayFormulaCellData();
        // array formula range is used to check whether the newly added array formula conflicts with the existing array formula
        const arrayFormulaRange = this._formulaDataModel.getArrayFormulaRange();

        const config = {
            dirtyIterationUnits,
            dirtyReferenceUnits,
            arrayFormulaCellData,
            arrayFormulaRange,
            forceCalculate,
            dirtyRanges,
            dirtyNameMap,
            dirtyDefinedNameMap,
            dirtySuperTableMap,
            dirtyUnitFeatureMap,
            dirtyUnitOtherFormulaMap,
            clearDependencyTreeCache,
            calculationSettings,
            isCalculateTreeModel,
            rowData,
            externalReferences,
        };
        if (snapshot && typeof snapshotExecutor === 'function') {
            snapshotExecutor.call(this._calculateFormulaService, config, snapshot);
        } else {
            this._calculateFormulaService.execute({ ...config, formulaData: formulaData! });
        }
    }

    private async _queryFormulaDependencyJson(param: ISetQueryFormulaDependencyMutation) {
        const { unitRanges, isInRange } = param;
        let result: IFormulaDependencyTreeJson[] = [];
        if (isInRange) {
            result = await this._calculateFormulaService.getInRangeFormulas(unitRanges);
        } else {
            result = await this._calculateFormulaService.getRangeDependents(unitRanges);
        }

        if (this._disposed) {
            return;
        }

        this._commandService.executeCommand(
            SetQueryFormulaDependencyResultMutation.id,
            {
                result,
            },
            {
                onlyLocal: true,
            }
        );
    }

    private async _queryFormulaDependencyAllJson(param: ISetQueryFormulaDependencyAllMutation) {
        const { unitRanges } = param;
        const result: IFormulaDependentsAndInRangeResults = await this._calculateFormulaService.getDependentsAndInRangeFormulas(unitRanges);
        if (this._disposed) {
            return;
        }
        this._commandService.executeCommand(
            SetQueryFormulaDependencyAllResultMutation.id,
            {
                result,
            },
            {
                onlyLocal: true,
            }
        );
    }

    private async _generateAllDependencyTreeJson() {
        const result = await this._calculateFormulaService.getAllDependencyJson();
        if (this._disposed) {
            return;
        }

        this._commandService.executeCommand(
            SetFormulaDependencyCalculationResultMutation.id,
            {
                result,
            },
            {
                onlyLocal: true,
            }
        );
    }

    private async _generateCellDependencyTreeJson(param: ISetFormulaDependencyCalculationMutation) {
        const { unitId, sheetId, row, column } = param;
        const result = await this._calculateFormulaService.getCellDependencyJson(unitId, sheetId, row, column);
        if (this._disposed) {
            return;
        }

        this._commandService.executeCommand(
            SetCellFormulaDependencyCalculationResultMutation.id,
            {
                result,
            },
            {
                onlyLocal: true,
            }
        );
    }

    private async _calculateFormulaString(param: ISetFormulaStringBatchCalculationMutation) {
        const { formulas } = param;
        const result = await this._calculateFormulaService.executeFormulas(
            formulas
        );
        if (this._disposed) {
            return;
        }

        this._commandService.executeCommand(
            SetFormulaStringBatchCalculationResultMutation.id,
            {
                result,
            },
            {
                onlyLocal: true,
            }
        );
    }

    // Notification
    private _initialExecuteFormulaListener() {
        /**
         * Assignment operation after formula calculation.
         */
        this.disposeWithMe(this._calculateFormulaService.executionCompleteListener$.subscribe((data) => {
            const functionsExecutedState = data.functionsExecutedState;
            this._commandService.executeCommand(
                SetFormulaCalculationNotificationMutation.id,
                {
                    functionsExecutedState,
                    circularReferences: data.circularReferences,
                },
                {
                    onlyLocal: true,
                }
            );
        }));

        /**
         * Assignment operation after formula calculation.
         */
        this.disposeWithMe(this._calculateFormulaService.executionInProgressListener$.subscribe((data) => {
            this._commandService.executeCommand(
                SetFormulaCalculationNotificationMutation.id,
                {
                    stageInfo: data,
                },
                {
                    onlyLocal: true,
                }
            );
        }));
    }
}
