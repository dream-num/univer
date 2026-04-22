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

import type { Ctor } from '@univerjs/core';
import type { IFunctionNames } from '../basics/function';
import type { IUniverEngineFormulaConfig } from '../config/config';
import type { BaseFunction } from '../functions/base-function';
import { Disposable, ICommandService, IConfigService, Optional } from '@univerjs/core';
import { DataSyncPrimaryController } from '@univerjs/rpc';
import { RegisterFunctionMutation } from '../commands/mutations/register-function.mutation';
import { SetArrayFormulaDataMutation } from '../commands/mutations/set-array-formula-data.mutation';
import { RemoveDefinedNameMutation, SetDefinedNameMutation } from '../commands/mutations/set-defined-name.mutation';
import { RemoveFeatureCalculationMutation, SetFeatureCalculationMutation } from '../commands/mutations/set-feature-calculation.mutation';
import {
    SetCellFormulaDependencyCalculationMutation,
    SetCellFormulaDependencyCalculationResultMutation,
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationResultMutation,
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
    SetTriggerFormulaCalculationStartMutation,
} from '../commands/mutations/set-formula-calculation.mutation';
import { SetFormulaDataMutation } from '../commands/mutations/set-formula-data.mutation';
import { SetImageFormulaDataMutation } from '../commands/mutations/set-image-formula-data.mutation';
import { RemoveOtherFormulaMutation, SetOtherFormulaMutation } from '../commands/mutations/set-other-formula.mutation';
import { RemoveSuperTableMutation, SetSuperTableMutation, SetSuperTableOptionMutation } from '../commands/mutations/set-super-table.mutation';
import { ENGINE_FORMULA_PLUGIN_CONFIG_KEY } from '../config/config';
import { ALL_IMPLEMENTED_FUNCTIONS } from '../functions';
import { IFunctionService } from '../services/function.service';

export class FormulaController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IFunctionService private readonly _functionService: IFunctionService,
        @IConfigService private readonly _configService: IConfigService,
        @Optional(DataSyncPrimaryController) private readonly _dataSyncPrimaryController?: DataSyncPrimaryController
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._registerCommands();
        this._registerFunctions();
    }

    private _registerCommands(): void {
        [
            SetFormulaDataMutation,
            SetArrayFormulaDataMutation,
            SetImageFormulaDataMutation,
            SetFormulaCalculationStartMutation,
            SetTriggerFormulaCalculationStartMutation,
            SetFormulaStringBatchCalculationMutation,
            SetFormulaStringBatchCalculationResultMutation,
            SetQueryFormulaDependencyMutation,
            SetQueryFormulaDependencyResultMutation,
            SetFormulaCalculationStopMutation,
            SetFormulaCalculationNotificationMutation,
            SetFormulaCalculationResultMutation,
            SetQueryFormulaDependencyAllMutation,
            SetQueryFormulaDependencyAllResultMutation,

            SetFormulaDependencyCalculationMutation,
            SetFormulaDependencyCalculationResultMutation,
            SetCellFormulaDependencyCalculationMutation,
            SetCellFormulaDependencyCalculationResultMutation,

            SetDefinedNameMutation,
            RemoveDefinedNameMutation,
            SetFeatureCalculationMutation,
            RemoveFeatureCalculationMutation,

            SetOtherFormulaMutation,
            RemoveOtherFormulaMutation,
            SetSuperTableMutation,
            RemoveSuperTableMutation,
            SetSuperTableOptionMutation,
            RegisterFunctionMutation,
        ].forEach((mutation) => {
            this._commandService.registerCommand(mutation);
            this._dataSyncPrimaryController?.registerSyncingMutations(mutation);
        });
    }

    private _registerFunctions() {
        const config = this._configService.getConfig<IUniverEngineFormulaConfig>(ENGINE_FORMULA_PLUGIN_CONFIG_KEY);

        const functions: BaseFunction[] = ALL_IMPLEMENTED_FUNCTIONS.concat(config?.function ?? [])
            .map((registerObject) => {
                const Func = registerObject[0] as Ctor<BaseFunction>;
                const name = registerObject[1] as IFunctionNames;

                return new Func(name);
            });

        this._functionService.registerExecutors(...functions);
    }
}
