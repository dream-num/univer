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

import type { Nullable } from '@univerjs/core';
import { Subject } from 'rxjs';
import { DataValidationModel } from '@univerjs/data-validation';
import { Inject } from '@wendellhu/redi';
import type { SheetDataValidationManager } from '../models/sheet-data-validation-manager';

export interface ICurrentDataValidationManager {
    manager: SheetDataValidationManager;
    unitId: string;
    subUnitId: string;
}

export class SheetDataValidationService {
    private _currentDataValidationManager: Nullable<ICurrentDataValidationManager>;

    private _currentDataValidationManager$ = new Subject<ICurrentDataValidationManager>();

    get currentDataValidationManager() {
        return this._currentDataValidationManager;
    }

    currentDataValidationManager$ = this._currentDataValidationManager$.asObservable();

    constructor(
        @Inject(DataValidationModel) private _dataValidationModel: DataValidationModel
    ) {}

    private _getOrCreateManager(unitId: string, subUnitId: string) {
        return this._dataValidationModel.getOrCreateManager(unitId, subUnitId) as SheetDataValidationManager;
    }

    switchCurrent(unitId: string, subUnitId: string) {
        const manager = this._getOrCreateManager(unitId, subUnitId) as SheetDataValidationManager;
        this._currentDataValidationManager = {
            manager,
            unitId,
            subUnitId,
        };
        this._currentDataValidationManager$.next(this._currentDataValidationManager);
    }
}
