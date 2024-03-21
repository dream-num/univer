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
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';
import type { Nullable } from '@univerjs/core';
import type { ISheetLocation } from '@univerjs/sheets';
import { IRenderManagerService } from '@univerjs/engine-render';
import { CELL_ALERT_KEY } from '../views/cell-alert';
import { CanvasPopManagerService } from './canvas-pop-manager.service';

export enum CellAlertType {
    INFO,
    WARNING,
    ERROR,
}

export interface ICellAlert {
    type: CellAlertType;
    title: React.ReactNode;
    message: React.ReactNode;
    location: ISheetLocation;
    width: number;
    height: number;
}

export class CellAlertManagerService {
    private _currentAlert$ = new Subject<Nullable<ICellAlert>>();
    private _currentPopup: Nullable<IDisposable> = undefined;

    private _currentAlert: Nullable<ICellAlert> = null;

    get currentAlert() {
        return this._currentAlert;
    }

    currentAlert$ = this._currentAlert$.asObservable();

    constructor(
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(CanvasPopManagerService) private readonly _canvasPopManagerService: CanvasPopManagerService
    ) {}

    showAlert(alert: ICellAlert) {
        this._currentPopup && this._currentPopup.dispose();
        this._currentPopup = null;

        const { location } = alert;
        const { row, col, unitId } = location;

        const currentRender = this._renderManagerService.getRenderById(unitId);
        if (!currentRender) {
            return;
        }

        this._currentAlert = alert;
        this._currentAlert$.next(alert);
        this._currentPopup = this._canvasPopManagerService.addPopupToCell(row, col, {
            componentKey: CELL_ALERT_KEY,
            direction: 'horizontal',
        });
    }

    clearAlert() {
        this._currentPopup && this._currentPopup.dispose();
        this._currentPopup = null;
        this._currentAlert = null;
        this._currentAlert$.next(null);
    }
}
