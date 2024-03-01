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

import { Subject } from 'rxjs';
import { Inject } from '@wendellhu/redi';
import type { IPosition, Nullable } from '@univerjs/core';
import type { ISheetLocation } from '@univerjs/sheets';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';

export enum CellAlertType {
    INFO,
    WARNING,
    ERROR,
}

export interface ICellAlert {
    type: CellAlertType;
    title: React.ReactNode;
    message: React.ReactNode;
    position: IPosition;
    location: ISheetLocation;
    width: number;
    height: number;
}

export class CellAlertManagerService {
    private _currentAlert$ = new Subject<Nullable<ICellAlert>>();

    currentAlert$ = this._currentAlert$.asObservable();

    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {}

    showAlert(alert: ICellAlert) {
        this._currentAlert$.next(alert);
    }

    clearAlert() {
        this._currentAlert$.next(null);
    }
}
