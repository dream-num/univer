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

import { Disposable, ICommandService, Inject } from '@univerjs/core';
import type { ISetFormulaCalculationResultMutation } from '../commands/mutations/set-formula-calculation.mutation';
import type { IAllRuntimeData } from './runtime.service';
import { convertRuntimeToUnitData } from '../basics/runtime';
import { SetArrayFormulaDataMutation } from '../commands/mutations/set-array-formula-data.mutation';
import { SetFormulaCalculationResultMutation, SetFormulaDependencyCalculationResultMutation } from '../commands/mutations/set-formula-calculation.mutation';
import { SetImageFormulaDataMutation } from '../commands/mutations/set-image-formula-data.mutation';
import { FormulaDataModel } from '../models/formula-data.model';
import { IFormulaRuntimeService } from './runtime.service';

/** Applies calculation batches for every engine; completion notifications never resubmit them. */
export class FormulaResultService extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel,
        @IFormulaRuntimeService private readonly _runtimeService: IFormulaRuntimeService
    ) { super(); }

    async applyTreeResult(data: IAllRuntimeData): Promise<void> {
        if (this._disposed || this._runtimeService.isStopExecution()) return;
        const { dependencyTreeModelData } = data;
        if (dependencyTreeModelData.length > 0) {
            await this._commandService.executeCommand(
                SetFormulaDependencyCalculationResultMutation.id,
                {
                    result: dependencyTreeModelData,
                },
                {
                    onlyLocal: true,
                }
            );
        }
    }

    async applyResult(data: IAllRuntimeData, result?: ISetFormulaCalculationResultMutation): Promise<void> {
        if (this._disposed || this._runtimeService.isStopExecution()) return;
        const {
            unitData,
            sourceFormulaData,
            unitOtherData,
            arrayFormulaRange,
            arrayFormulaCellData,
            clearArrayFormulaCellData,
            arrayFormulaEmbedded,
            imageFormulaData,
        } = data;

        if (!unitData) {
            await this.applyTreeResult(data);
            console.error('No sheetData from Formula Engine!');
            return;
        }

        if (arrayFormulaRange || arrayFormulaEmbedded) {
            this._formulaDataModel.clearPreviousArrayFormulaCellData(clearArrayFormulaCellData);
            this._formulaDataModel.mergeArrayFormulaCellData(arrayFormulaCellData);
            this._formulaDataModel.mergeArrayFormulaRange(arrayFormulaRange);

            await this._commandService.executeCommand(
                SetArrayFormulaDataMutation.id,
                {
                    arrayFormulaRange: this._formulaDataModel.getArrayFormulaRange(),
                    arrayFormulaCellData: this._formulaDataModel.getArrayFormulaCellData(),
                    arrayFormulaEmbedded,
                },
                {
                    onlyLocal: true,
                    fromFormula: true,
                }
            );
        }

        if (this._disposed || this._runtimeService.isStopExecution()) return;

        // handle image formula data
        if (imageFormulaData && imageFormulaData.length > 0) {
            await this._commandService.executeCommand(
                SetImageFormulaDataMutation.id,
                {
                    imageFormulaData,
                },
                {
                    onlyLocal: true,
                }
            );
        }

        await this.applyTreeResult(data);
        if (this._disposed || this._runtimeService.isStopExecution()) return;

        await this._commandService.executeCommand(
            SetFormulaCalculationResultMutation.id,
            result ?? {
                unitData: convertRuntimeToUnitData(unitData),
                sourceFormulaData,
                unitOtherData,
            },
            {
                onlyLocal: true,
                applyFormulaCalculationResult: true,
            }
        );
    }
}
