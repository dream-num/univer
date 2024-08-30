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

import type { Workbook } from '@univerjs/core';
import { Disposable, Inject, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import type { IAddDataValidationMutationParams, IRemoveDataValidationMutationParams } from '@univerjs/data-validation';
import { AddDataValidationMutation, DataValidationModel, RemoveDataValidationMutation } from '@univerjs/data-validation';
import type { IRemoveSheetCommandParams } from '@univerjs/sheets';
import { RemoveSheetCommand, SheetInterceptorService } from '@univerjs/sheets';

@OnLifecycle(LifecycleStages.Ready, DataValidationRemoveSheetController)
export class DataValidationRemoveSheetController extends Disposable {
    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService,
        @Inject(DataValidationModel) private _dataValidationModel: DataValidationModel
    ) {
        super();
        this._initSheetChange();
    }

    private _initSheetChange() {
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommand({
                getMutations: (commandInfo) => {
                    if (commandInfo.id === RemoveSheetCommand.id) {
                        const params = commandInfo.params as IRemoveSheetCommandParams;
                        const workbook = params.unitId ? this._univerInstanceService.getUnit<Workbook>(params.unitId) : this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                        if (!workbook) {
                            return { redos: [], undos: [] };
                        }
                        const unitId = workbook.getUnitId();
                        const subUnitId = params.subUnitId || workbook.getActiveSheet()?.getSheetId();
                        if (!subUnitId) {
                            return { redos: [], undos: [] };
                        }
                        const manager = this._dataValidationModel.ensureManager(unitId, subUnitId);
                        const rules = manager.getDataValidations();

                        const redos = [{
                            id: RemoveDataValidationMutation.id,
                            params: {
                                unitId,
                                subUnitId,
                                ruleId: rules.map((rule) => rule.uid),
                            } as IRemoveDataValidationMutationParams,
                        }];

                        const undos = [{
                            id: AddDataValidationMutation.id,
                            params: {
                                unitId,
                                subUnitId,
                                rule: rules,
                            } as IAddDataValidationMutationParams,
                        }];
                        return { redos, undos };
                    }
                    return { redos: [], undos: [] };
                },
            })
        );
    }
}
