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
import type { ISetDefinedNameMutationParam } from '../commands/mutations/set-defined-name.mutation';

import type {
    IRemoveFeatureCalculationMutationParam,
    ISetFeatureCalculationMutation,
} from '../commands/mutations/set-feature-calculation.mutation';
import type { ISetFormulaDataMutationParams } from '../commands/mutations/set-formula-data.mutation';
import type { IRemoveOtherFormulaMutationParams, ISetOtherFormulaMutationParams } from '../commands/mutations/set-other-formula.mutation';
import { Disposable, ICommandService, ObjectMatrix } from '@univerjs/core';
import { SetDefinedNameMutation } from '../commands/mutations/set-defined-name.mutation';
import {
    RemoveFeatureCalculationMutation,
    SetFeatureCalculationMutation,
} from '../commands/mutations/set-feature-calculation.mutation';
import { SetFormulaDataMutation } from '../commands/mutations/set-formula-data.mutation';
import { RemoveOtherFormulaMutation, SetOtherFormulaMutation } from '../commands/mutations/set-other-formula.mutation';
import { IDependencyManagerService } from '../services/dependency-manager.service';
import { IFeatureCalculationManagerService } from '../services/feature-calculation-manager.service';

export class SetDependencyController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IFeatureCalculationManagerService
        @IDependencyManagerService private readonly _dependencyManagerService: IDependencyManagerService,
        @IFeatureCalculationManagerService private readonly _featureCalculationManagerService: IFeatureCalculationManagerService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._commandExecutedListener();

        this._featureCalculationManagerServiceListener();
    }

    private _featureCalculationManagerServiceListener() {
        this.disposeWithMe(
            this._featureCalculationManagerService.onChanged$.subscribe((params) => {
                const { unitId, subUnitId, featureIds } = params;
                this._dependencyManagerService.removeFeatureFormulaDependency(unitId, subUnitId, featureIds);
            })
        );
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === RemoveFeatureCalculationMutation.id) {
                    const params = command.params as IRemoveFeatureCalculationMutationParam;
                    if (params == null) {
                        return;
                    }
                    const { featureIds, unitId, subUnitId } = params;
                    this._dependencyManagerService.removeFeatureFormulaDependency(unitId, subUnitId, featureIds);
                } else if (command.id === SetFeatureCalculationMutation.id) {
                    const params = command.params as ISetFeatureCalculationMutation;
                    if (params == null) {
                        return;
                    }
                    const { featureId, calculationParam } = params;
                    const { unitId, subUnitId } = calculationParam;
                    this._dependencyManagerService.removeFeatureFormulaDependency(unitId, subUnitId, [featureId]);
                } else if (command.id === RemoveOtherFormulaMutation.id) {
                    const params = command.params as IRemoveOtherFormulaMutationParams;
                    if (params == null) {
                        return;
                    }

                    this._dependencyManagerService.removeOtherFormulaDependency(params.unitId, params.subUnitId, params.formulaIdList);
                } else if (command.id === SetOtherFormulaMutation.id) {
                    const params = command.params as ISetOtherFormulaMutationParams;
                    if (params == null) {
                        return;
                    }

                    const formulaMap = params.formulaMap;
                    const formulaIdList: string[] = [];
                    Object.keys(formulaMap).forEach((formulaId) => {
                        formulaIdList.push(formulaId);
                    });
                    this._dependencyManagerService.removeOtherFormulaDependency(params.unitId, params.subUnitId, formulaIdList);
                } else if (command.id === SetFormulaDataMutation.id) {
                    const formulaData = (command.params as ISetFormulaDataMutationParams).formulaData;
                    Object.keys(formulaData).forEach((unitId) => {
                        const unitFormulaData = formulaData[unitId];
                        // undefined means do nothing
                        if (unitFormulaData === undefined) {
                            return;
                        }

                        // null means clear all formula data with the unitId
                        if (unitFormulaData === null) {
                            this._dependencyManagerService.clearFormulaDependency(unitId);
                            return;
                        }

                        Object.keys(unitFormulaData).forEach((subUnitId) => {
                            const formulaDataItem = unitFormulaData[subUnitId];

                            if (formulaDataItem === undefined) {
                                return;
                            }

                            if (formulaDataItem === null) {
                                this._dependencyManagerService.clearFormulaDependency(unitId, subUnitId);
                                return true;
                            }

                            new ObjectMatrix(formulaDataItem).forValue((row, column) => {
                                this._dependencyManagerService.removeFormulaDependency(unitId, subUnitId, row, column);
                            });
                        });
                    });
                } else if (command.id === SetDefinedNameMutation.id) {
                    this._handleSetDefinedName(command);
                }
            })
        );
    }

    private _handleSetDefinedName(
        command: ICommandInfo
    ): void {
        const params = command.params as ISetDefinedNameMutationParam;
        if (params == null) {
            return;
        }

        const { unitId, name } = params;

        this._dependencyManagerService.removeFormulaDependencyByDefinedName(unitId, name);
    }
}
