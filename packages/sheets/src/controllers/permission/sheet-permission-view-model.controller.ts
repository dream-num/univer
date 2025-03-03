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

import type { IWorksheetProtectionRenderCellData } from '../../services/permission/worksheet-permission/type';
import { Disposable, Inject, InterceptorEffectEnum, IPermissionService } from '@univerjs/core';
import { UnitAction } from '@univerjs/protocol';
import { RangeProtectionCache } from '../../model/range-protection.cache';
import { WorksheetEditPermission, WorksheetViewPermission } from '../../services/permission/permission-point';
import { WorksheetProtectionRuleModel } from '../../services/permission/worksheet-permission';
import { INTERCEPTOR_POINT } from '../../services/sheet-interceptor/interceptor-const';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';

export class SheetPermissionViewModelController extends Disposable {
    constructor(
        @IPermissionService private _permissionService: IPermissionService,
        @Inject(WorksheetProtectionRuleModel) private _worksheetProtectionRuleModel: WorksheetProtectionRuleModel,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(RangeProtectionCache) private _rangeProtectionCache: RangeProtectionCache
    ) {
        super();
        this._initViewModelByRangeInterceptor();
        this._initViewModelBySheetInterceptor();
    }

    private _initViewModelByRangeInterceptor() {
        this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            // permissions are placed at a high level to prioritize whether to filter subsequent renderings.
            priority: 999,
            effect: InterceptorEffectEnum.Value | InterceptorEffectEnum.Style,
            handler: (cell = {}, context, next) => {
                const { unitId, subUnitId, row, col } = context;

                const selectionProtection = this._rangeProtectionCache.getCellInfo(unitId, subUnitId, row, col);

                if (selectionProtection) {
                    const isSkipRender = selectionProtection[UnitAction.View] === false;
                    const _cellData = { ...cell, selectionProtection: [selectionProtection] };
                    if (isSkipRender) {
                        delete _cellData.s;
                        delete _cellData.v;
                        delete _cellData.p;
                        return _cellData;
                    }
                    return next(_cellData);
                }
                return next(cell);
            },

        }));
    }

    private _initViewModelBySheetInterceptor() {
        this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            // permissions are placed at a high level to prioritize whether to filter subsequent renderings.
            priority: 999,
            effect: InterceptorEffectEnum.Value | InterceptorEffectEnum.Style,
            handler: (cell = {}, context, next) => {
                const { unitId, subUnitId } = context;
                const worksheetRule = this._worksheetProtectionRuleModel.getRule(unitId, subUnitId);
                if (worksheetRule?.permissionId) {
                    const selectionProtection = [{
                        [UnitAction.View]: this._permissionService.getPermissionPoint(new WorksheetViewPermission(unitId, subUnitId).id)?.value ?? false,
                        [UnitAction.Edit]: this._permissionService.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id)?.value ?? false,
                    }];
                    const isSkipRender = !selectionProtection[0]?.[UnitAction.View];
                    const _cellData: IWorksheetProtectionRenderCellData = { ...cell, hasWorksheetRule: true, selectionProtection };
                    if (isSkipRender) {
                        delete _cellData.s;
                        delete _cellData.v;
                        delete _cellData.p;
                        return _cellData;
                    }
                    return next(_cellData);
                }
                return next(cell);
            },
        }));
    }
}
