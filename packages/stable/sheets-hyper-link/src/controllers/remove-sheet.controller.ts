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
import type { IRemoveSheetCommandParams } from '@univerjs/sheets';
import { Disposable, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { RemoveSheetCommand, SheetInterceptorService } from '@univerjs/sheets';
import { AddHyperLinkMutation } from '../commands/mutations/add-hyper-link.mutation';
import { RemoveHyperLinkMutation } from '../commands/mutations/remove-hyper-link.mutation';
import { HyperLinkModel } from '../models/hyper-link.model';

export class SheetsHyperLinkRemoveSheetController extends Disposable {
    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService,
        @Inject(HyperLinkModel) private _hyperLinkModel: HyperLinkModel
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
                        const links = this._hyperLinkModel.getSubUnit(unitId, subUnitId);

                        const redos = links.map((link) => ({
                            id: RemoveHyperLinkMutation.id,
                            params: {
                                unitId,
                                subUnitId,
                                id: link.id,
                            },
                        }));

                        const undos = links.map((link) => ({
                            id: AddHyperLinkMutation.id,
                            params: {
                                unitId,
                                subUnitId,
                                link,
                            },
                        }));
                        return { redos, undos };
                    }
                    return { redos: [], undos: [] };
                },
            })
        );
    }
}
