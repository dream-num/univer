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

import { Inject } from '@wendellhu/redi';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { Spreadsheet } from '@univerjs/engine-render';
import { throttleTime } from 'rxjs/operators';
import type { Workbook } from '@univerjs/core';
import { Disposable, IPermissionService, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { RANGE_PROTECTION_CAN_NOT_VIEW_RENDER_EXTENSION_KEY, RANGE_PROTECTION_CAN_VIEW_RENDER_EXTENSION_KEY, RangeProtectionCanNotViewRenderExtension, RangeProtectionCanViewRenderExtension, RangeProtectionRuleModel } from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { merge } from 'rxjs';

@OnLifecycle(LifecycleStages.Ready, PermissionRenderService)
export class PermissionRenderService extends Disposable {
    private _rangeProtectionCanViewRenderExtension = new RangeProtectionCanViewRenderExtension();
    private _rangeProtectionCanNotViewRenderExtension = new RangeProtectionCanNotViewRenderExtension();
    constructor(
        @Inject(IRenderManagerService) private _renderManagerService: IRenderManagerService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(RangeProtectionRuleModel) private _rangeProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(SheetSkeletonManagerService) private _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IPermissionService private _permissionService: IPermissionService
    ) {
        super();
        this._initRender();
        this._initSkeleton();
        this._rangeProtectionRuleModel.ruleChange$.subscribe((info) => {
            if ((info.oldRule?.id && this._rangeProtectionCanViewRenderExtension.renderCache.has(info.oldRule.id)) || this._rangeProtectionCanViewRenderExtension.renderCache.has(info.rule.id)) {
                this._rangeProtectionCanViewRenderExtension.clearCache();
            }
            if ((info.oldRule?.id && this._rangeProtectionCanNotViewRenderExtension.renderCache.has(info.oldRule.id)) || this._rangeProtectionCanNotViewRenderExtension.renderCache.has(info.rule.id)) {
                this._rangeProtectionCanNotViewRenderExtension.clearCache();
            }
        });
    }

    private _initRender() {
        const register = (renderId: string) => {
            const render = renderId && this._renderManagerService.getRenderById(renderId);
            const spreadsheetRender = render && render.mainComponent as Spreadsheet;
            if (spreadsheetRender) {
                if (!spreadsheetRender.getExtensionByKey(RANGE_PROTECTION_CAN_VIEW_RENDER_EXTENSION_KEY)) {
                    spreadsheetRender.register(this._rangeProtectionCanViewRenderExtension);
                }
                if (!spreadsheetRender.getExtensionByKey(RANGE_PROTECTION_CAN_NOT_VIEW_RENDER_EXTENSION_KEY)) {
                    spreadsheetRender.register(this._rangeProtectionCanNotViewRenderExtension);
                }
            }
        };
        this.disposeWithMe(this._renderManagerService.currentRender$.subscribe((renderId) => {
            renderId && register(renderId);
        }));
        const workbook = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_SHEET)!;
        if (workbook) {
            register(workbook.getUnitId());
        }
    }

    private _initSkeleton() {
        const markDirtySkeleton = () => {
            this._sheetSkeletonManagerService.reCalculate();
            const unitId = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
            this._renderManagerService.getRenderById(unitId)?.mainComponent?.makeDirty();
        };
        this.disposeWithMe(merge(this._permissionService.permissionPointUpdate$.pipe(throttleTime(300, undefined, { trailing: true })), this._rangeProtectionRuleModel.ruleChange$).pipe().subscribe(markDirtySkeleton));
    }
}
