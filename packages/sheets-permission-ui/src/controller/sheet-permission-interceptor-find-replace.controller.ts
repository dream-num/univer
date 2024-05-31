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

import type { ICellDataForSheetInterceptor, IRange, Nullable, Workbook } from '@univerjs/core';
import { Disposable, DisposableCollection, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { SheetsFindReplaceController } from '@univerjs/sheets-find-replace';
import { UnitAction } from '@univerjs/protocol';

type ICellPermission = Record<UnitAction, boolean> & { ruleId?: string; ranges?: IRange[] };

export const SHEET_PERMISSION_PASTE_PLUGIN = 'SHEET_PERMISSION_PASTE_PLUGIN';

@OnLifecycle(LifecycleStages.Steady, SheetPermissionInterceptorFindReplaceController)
export class SheetPermissionInterceptorFindReplaceController extends Disposable {
    disposableCollection = new DisposableCollection();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetsFindReplaceController) private _sheetsFindReplaceController: SheetsFindReplaceController
    ) {
        super();
        this._initSheetFindPermissionInterceptor();
    }

    private _initSheetFindPermissionInterceptor() {
        this.disposeWithMe(
            this._sheetsFindReplaceController.interceptor.intercept(this._sheetsFindReplaceController.interceptor.getInterceptPoints().FIND_PERMISSION_CHECK, {
                handler: (_: Nullable<boolean>, _cellInfo: { row: number; col: number; unitId: string; subUnitId: string }) => {
                    const { row, col, subUnitId } = _cellInfo;
                    const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                    const worksheet = workbook.getSheetBySheetId(subUnitId);
                    if (!worksheet) {
                        return false;
                    }
                    const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                    return permission?.[UnitAction.View] !== false;
                },
            })
        );
    }
}
