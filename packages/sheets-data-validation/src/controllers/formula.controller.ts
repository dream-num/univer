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

import { DataValidationType, Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { IAddDataValidationMutationParams, IRemoveDataValidationCommandParams, IUpdateDataValidationMutationParams } from '@univerjs/data-validation';
import { AddDataValidationMutation, RemoveDataValidationMutation, UpdateDataValidationMutation, UpdateRuleType } from '@univerjs/data-validation';
import { Inject } from '@wendellhu/redi';
import { DataValidationFormulaService } from '../services/dv-formula.service';

@OnLifecycle(LifecycleStages.Rendered, DataValidationFormulaController)
export class DataValidationFormulaController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DataValidationFormulaService) private readonly _dataValidationFormulaService: DataValidationFormulaService
    ) {
        super();
        this._initCommandListener();
    }

    private _initCommandListener() {
        this.disposeWithMe(this._commandService.onCommandExecuted((command) => {
            switch (command.id) {
                case AddDataValidationMutation.id: {
                    const params = command.params as IAddDataValidationMutationParams;
                    const { unitId, subUnitId, rule } = params;
                    if (rule.type !== DataValidationType.CUSTOM) {
                        this._dataValidationFormulaService.addRule(
                            unitId,
                            subUnitId,
                            rule.uid,
                            rule.formula1,
                            rule.formula2
                        );
                    }
                    break;
                }

                case RemoveDataValidationMutation.id: {
                    const params = command.params as IRemoveDataValidationCommandParams;
                    const { unitId, subUnitId, ruleId } = params;
                    this._dataValidationFormulaService.removeRule(unitId, subUnitId, ruleId);
                    break;
                }

                case UpdateDataValidationMutation.id: {
                    const params = command.params as IUpdateDataValidationMutationParams;
                    const { unitId, subUnitId, ruleId, payload } = params;
                    if (payload.type === UpdateRuleType.SETTING && payload.payload.type !== DataValidationType.CUSTOM) {
                        this._dataValidationFormulaService.updateRuleFormulaText(
                            unitId,
                            subUnitId,
                            ruleId,
                            payload.payload.formula1,
                            payload.payload.formula2
                        );
                    }
                    break;
                }
                default:
                    break;
            }
        }));
    }
}
