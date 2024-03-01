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

import { IUniverInstanceService, LifecycleStages, OnLifecycle, RxDisposable } from '@univerjs/core';
import { DataValidationModel, DataValidationPanelName } from '@univerjs/data-validation';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { Inject } from '@wendellhu/redi';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import type { Spreadsheet } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DataValidationPanel } from '../views/components';
import { DataValidationMenu } from './dv.menu';

@OnLifecycle(LifecycleStages.Rendered, DataValidationRenderController)
export class DataValidationRenderController extends RxDisposable {
    constructor(
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @IMenuService private _menuService: IMenuService,
        @Inject(DataValidationModel) private readonly _dataValidationModel: DataValidationModel,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._init();
    }

    private _init() {
        this.disposeWithMe(
            this._componentManager.register(
                DataValidationPanelName,
                DataValidationPanel
            )
        );
        this.disposeWithMe(
            this._menuService.addMenuItem(
                DataValidationMenu
            )
        );

        this._initSkeletonChange();
    }

    private _initSkeletonChange() {
        const markSkeletonDirty = () => {
            const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
            const unitId = workbook.getUnitId();
            const subUnitId = workbook.getActiveSheet().getSheetId();
            const skeleton = this._sheetSkeletonManagerService.getOrCreateSkeleton({ unitId, sheetId: subUnitId });
            const currentRender = this._renderManagerService.getRenderById(unitId);

            skeleton?.makeDirty(true);
            skeleton?.calculate();

            if (currentRender) {
                (currentRender.mainComponent as Spreadsheet).makeForceDirty();
            }
        };

        this.disposeWithMe(this._dataValidationModel.ruleChange$.subscribe(() => {
            markSkeletonDirty();
        }));

        this.disposeWithMe(this._dataValidationModel.validStatusChange$.subscribe(() => {
            markSkeletonDirty();
        }));
    }
}
