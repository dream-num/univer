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

import { Disposable, IResourceManagerService, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { DataValidationModel } from '@univerjs/data-validation';
import { Inject, Injector } from '@wendellhu/redi';
import { SheetDataValidationManager } from '../models/sheet-data-validation-manager';

@OnLifecycle(LifecycleStages.Starting, DataValidationModelController)
export class DataValidationModelController extends Disposable {
    constructor(
        @IResourceManagerService private readonly _resourceManagerService: IResourceManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DataValidationModel) private readonly _dataValidationModel: DataValidationModel,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();
        this._initDataValidationDataSource();
    }

    private _createSheetDataValidationManager(unitId: string, subUnitId: string) {
        return new SheetDataValidationManager(
            unitId,
            subUnitId,
            [],
            this._injector
        );
    }

    private _initDataValidationDataSource() {
        this._dataValidationModel.setManagerCreator(this._createSheetDataValidationManager.bind(this));
    }
}
