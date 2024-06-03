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

import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { type Ctor, Optional } from '@wendellhu/redi';
import { DataSyncPrimaryController } from '@univerjs/rpc';

import type { IFunctionNames } from '../basics/function';
import { RegisterFunctionMutation } from '../commands/mutations/register-function.mutation';
import { SetArrayFormulaDataMutation } from '../commands/mutations/set-array-formula-data.mutation';
import { RemoveDefinedNameMutation, SetDefinedNameMutation } from '../commands/mutations/set-defined-name.mutation';
import {
    RemoveFeatureCalculationMutation,
    SetFeatureCalculationMutation,
} from '../commands/mutations/set-feature-calculation.mutation';
import {
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationResultMutation,
    SetFormulaCalculationStartMutation,
    SetFormulaCalculationStopMutation,
} from '../commands/mutations/set-formula-calculation.mutation';
import { SetFormulaDataMutation } from '../commands/mutations/set-formula-data.mutation';
import { RemoveOtherFormulaMutation, SetOtherFormulaMutation } from '../commands/mutations/set-other-formula.mutation';
import {
    RemoveSuperTableMutation,
    SetSuperTableMutation,
    SetSuperTableOptionMutation,
} from '../commands/mutations/set-super-table.mutation';
import { UnregisterFunctionMutation } from '../commands/mutations/unregister-function.mutation';
import { functionArray } from '../functions/array/function-map';
import type { BaseFunction } from '../functions/base-function';
import { functionCompatibility } from '../functions/compatibility/function-map';
import { functionCube } from '../functions/cube/function-map';
import { functionDatabase } from '../functions/database/function-map';
import { functionDate } from '../functions/date/function-map';
import { functionEngineering } from '../functions/engineering/function-map';
import { functionFinancial } from '../functions/financial/function-map';
import { functionInformation } from '../functions/information/function-map';
import { functionLogical } from '../functions/logical/function-map';
import { functionLookup } from '../functions/lookup/function-map';
import { functionMath } from '../functions/math/function-map';
import { functionMeta } from '../functions/meta/function-map';
import { functionStatistical } from '../functions/statistical/function-map';
import { functionText } from '../functions/text/function-map';
import { functionUniver } from '../functions/univer/function-map';
import { functionWeb } from '../functions/web/function-map';
import { IFunctionService } from '../services/function.service';

@OnLifecycle(LifecycleStages.Ready, FormulaController)
export class FormulaController extends Disposable {
    constructor(
        private _function: Array<[Ctor<BaseFunction>, IFunctionNames]> = [],
        @ICommandService private readonly _commandService: ICommandService,
        @IFunctionService private readonly _functionService: IFunctionService,
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
            SetFormulaCalculationStartMutation,
            SetFormulaCalculationStopMutation,
            SetFormulaCalculationNotificationMutation,
            SetFormulaCalculationResultMutation,

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
            UnregisterFunctionMutation,
        ].forEach((mutation) => {
            this._commandService.registerCommand(mutation);
            this._dataSyncPrimaryController?.registerSyncingMutations(mutation);
        });
    }

    private _registerFunctions() {
        const functions: BaseFunction[] = (
            [
                ...functionArray,
                ...functionCompatibility,
                ...functionCube,
                ...functionDatabase,
                ...functionDate,
                ...functionEngineering,
                ...functionFinancial,
                ...functionInformation,
                ...functionLogical,
                ...functionLookup,
                ...functionMath,
                ...functionMeta,
                ...functionStatistical,
                ...functionText,
                ...functionUniver,
                ...functionWeb,
            ] as Array<[Ctor<BaseFunction>, IFunctionNames]>
        )
            .concat(this._function)
            .map((registerObject) => {
                const Func = registerObject[0] as Ctor<BaseFunction>;
                const name = registerObject[1] as IFunctionNames;

                return new Func(name);
            });

        this._functionService.registerExecutors(...functions);
    }
}
