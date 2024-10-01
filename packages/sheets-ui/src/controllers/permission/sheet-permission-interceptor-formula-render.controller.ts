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
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { DisposableCollection, Inject, Injector, IPermissionService, IUniverInstanceService, LifecycleStages, OnLifecycle, RxDisposable } from '@univerjs/core';
import { NullValueObject } from '@univerjs/engine-formula';
import { UnitAction } from '@univerjs/protocol';
import { getSheetCommandTarget, RangeProtectionCache, RangeProtectionRenderModel, WorksheetViewPermission } from '@univerjs/sheets';
import { StatusBarController } from '../status-bar.controller';

export const SHEET_PERMISSION_PASTE_PLUGIN = 'SHEET_PERMISSION_PASTE_PLUGIN';

@OnLifecycle(LifecycleStages.Steady, SheetPermissionInterceptorFormulaRenderController)
export class SheetPermissionInterceptorFormulaRenderController extends RxDisposable implements IRenderModule {
    disposableCollection = new DisposableCollection();

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(Injector) private readonly _injector: Injector,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @Inject(StatusBarController) private readonly _statusBarController: StatusBarController,
        @Inject(RangeProtectionRenderModel) private _rangeProtectionRenderModel: RangeProtectionRenderModel,
        @Inject(RangeProtectionCache) private _rangeProtectionCache: RangeProtectionCache
    ) {
        super();
        this._initStatusBarPermissionInterceptor();
    }

    private _initStatusBarPermissionInterceptor() {
        this.disposeWithMe(
            this._statusBarController.interceptor.intercept(this._statusBarController.interceptor.getInterceptPoints().STATUS_BAR_PERMISSION_CORRECT, {
                priority: 100,
                handler: (defaultValue, originValue) => {
                    const target = getSheetCommandTarget(this._univerInstanceService);
                    if (!target) {
                        return defaultValue ?? [];
                    }
                    const { worksheet, unitId, subUnitId } = target;
                    const sheetViewPermission = this._permissionService.getPermissionPoint(new WorksheetViewPermission(unitId, subUnitId).id)?.value;
                    if (sheetViewPermission === false) {
                        originValue.forEach((item) => {
                            const itemValue = item.getArrayValue();
                            itemValue.forEach((row, rowIndex) => {
                                row.forEach((col, colIndex) => {
                                    itemValue[rowIndex][colIndex] = NullValueObject.create();
                                });
                            });
                        });
                    } else {
                        originValue.forEach((item) => {
                            const itemValue = item.getArrayValue();
                            const startRow = item.getCurrentRow();
                            const startCol = item.getCurrentColumn();
                            itemValue.forEach((row, rowIndex) => {
                                row.forEach((col, colIndex) => {
                                    const cellValue = worksheet.getCellRaw(rowIndex + startRow, colIndex + startCol)?.v;
                                    if (cellValue === undefined) {
                                        return;
                                    }
                                    const permission = this._rangeProtectionCache.getCellInfo(unitId, subUnitId, rowIndex + startRow, colIndex + startCol);
                                    if (permission?.[UnitAction.View] === false) {
                                        itemValue[rowIndex][colIndex] = NullValueObject.create();
                                    }
                                });
                            });
                        });
                    }
                    return originValue;
                },
            })
        );
    }
}
