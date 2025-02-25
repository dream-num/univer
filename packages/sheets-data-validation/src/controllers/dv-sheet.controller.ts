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

import type { Workbook } from '@univerjs/core';
import type { IAddDataValidationMutationParams, IRemoveDataValidationMutationParams } from '@univerjs/data-validation';
import type { IRemoveSheetCommandParams } from '@univerjs/sheets';
import { Disposable, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { AddDataValidationMutation, RemoveDataValidationMutation } from '@univerjs/data-validation';
import { RemoveSheetCommand, SheetInterceptorService } from '@univerjs/sheets';
import { SheetDataValidationModel } from '../models/sheet-data-validation-model';

export class SheetDataValidationSheetController extends Disposable {
    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(SheetDataValidationModel) private readonly _sheetDataValidationModel: SheetDataValidationModel
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
                        const unitId = params.unitId || this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
                        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
                        if (!workbook) {
                            return { redos: [], undos: [] };
                        }
                        const subUnitId = params.subUnitId || workbook.getActiveSheet()?.getSheetId();

                        if (!subUnitId) {
                            return { redos: [], undos: [] };
                        }

                        const rules = this._sheetDataValidationModel.getRules(unitId, subUnitId);

                        if (rules.length === 0) {
                            return { redos: [], undos: [] };
                        }

                        const ids = rules.map((i) => i.uid);
                        const redoParams: IRemoveDataValidationMutationParams = {
                            unitId,
                            subUnitId,
                            ruleId: ids,
                            source: 'patched',
                        };
                        const undoParams: IAddDataValidationMutationParams = {
                            unitId,
                            subUnitId,
                            rule: [...rules],
                            source: 'patched',
                        };

                        return {
                            redos: [{
                                id: RemoveDataValidationMutation.id,
                                params: redoParams,
                            }],
                            undos: [{
                                id: AddDataValidationMutation.id,
                                params: undoParams,
                            }],
                        };
                    }
                    return { redos: [], undos: [] };
                },
            })
        );
    }
}
