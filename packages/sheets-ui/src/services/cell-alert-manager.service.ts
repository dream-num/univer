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
import { type IPosition, IUniverInstanceService, type Nullable } from '@univerjs/core';
import type { ISheetLocation } from '@univerjs/sheets';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IPopupService } from '@univerjs/ui/services/popup/popup.service.js';
import { CELL_ALERT_KEY } from '../views/cell-alert';
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
    private _currentPopupId: Nullable<string> = undefined;

    private _currentAlert: Nullable<ICellAlert> = null;

    get currentAlert() {
        return this._currentAlert;
    }

    currentAlert$ = this._currentAlert$.asObservable();

    constructor(
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IPopupService private readonly _popupService: IPopupService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {}

    showAlert(alert: ICellAlert) {
        this._currentPopupId && this._popupService.removePopup(this._currentPopupId);
        this._currentPopupId = null;

        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const unitId = workbook.getUnitId();
        const subUnitId = workbook.getActiveSheet().getSheetId();
        const currentRender = this._renderManagerService.getRenderById(unitId);
        if (!currentRender) {
            return;
        }
        const { position } = alert;
        const bounding = currentRender.engine.getCanvasElement().getBoundingClientRect();
        this._currentAlert = alert;
        this._currentAlert$.next(alert);

        this._currentPopupId = this._popupService.addPopup({
            anchorRect: {
                top: position.startY + bounding.top,
                bottom: position.endY + bounding.top,
                left: position.startX,
                right: position.endX,
            },
            unitId,
            subUnitId,
            componentKey: CELL_ALERT_KEY,
            direction: 'horizontal',
        });
    }

    clearAlert() {
        this._currentPopupId && this._popupService.removePopup(this._currentPopupId);
        this._currentPopupId = null;
        this._currentAlert = null;
        this._currentAlert$.next(null);
    }
}
