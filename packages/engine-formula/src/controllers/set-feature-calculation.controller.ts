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
import type {
    IRemoveFeatureCalculationMutationParam,
    ISetFeatureCalculationMutation,
} from '../commands/mutations/set-feature-calculation.mutation';
import { Disposable, ICommandService } from '@univerjs/core';
import {
    RemoveFeatureCalculationMutation,
    SetFeatureCalculationMutation,
} from '../commands/mutations/set-feature-calculation.mutation';
import { IFeatureCalculationManagerService } from '../services/feature-calculation-manager.service';

export class SetFeatureCalculationController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IFeatureCalculationManagerService
        private readonly _featureCalculationManagerService: IFeatureCalculationManagerService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetFeatureCalculationMutation.id) {
                    const params = command.params as ISetFeatureCalculationMutation;
                    if (params == null) {
                        return;
                    }
                    const { featureId, calculationParam } = params;
                    const { unitId, subUnitId } = calculationParam;
                    this._featureCalculationManagerService.register(unitId, subUnitId, featureId, calculationParam);
                } else if (command.id === RemoveFeatureCalculationMutation.id) {
                    const params = command.params as IRemoveFeatureCalculationMutationParam;
                    if (params == null) {
                        return;
                    }
                    const { featureIds, unitId, subUnitId } = params;
                    this._featureCalculationManagerService.remove(unitId, subUnitId, featureIds);
                }
            })
        );
    }
}
