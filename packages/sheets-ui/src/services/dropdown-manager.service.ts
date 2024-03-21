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

import { type IPosition, IUniverInstanceService, type Nullable } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { ISheetLocation } from '@univerjs/sheets';
import { IGlobalPopupManagerService } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { Inject } from '@wendellhu/redi';
import { DROP_DOWN_KEY } from '../views/drop-down';

export interface IDropdownParam {
    componentKey: string;
    location: ISheetLocation;
    position: IPosition;
    width: number;
    height: number;
    onHide?: () => void;
}

export interface IDropdownComponentProps {
    componentKey: string;
    location: ISheetLocation;
    width: number;
    height: number;
    hideFn: () => void;
}

export class DropdownManagerService {
    private _activeDropdown: Nullable<IDropdownParam>;
    private _activeDropdown$ = new Subject<Nullable<IDropdownParam>>();
    private _currentPopupId: Nullable<string> = null;
    activeDropdown$ = this._activeDropdown$.asObservable();

    get activeDropdown() {
        return this._activeDropdown;
    }

    constructor(
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IGlobalPopupManagerService private readonly _popupService: IGlobalPopupManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {}

    showDropdown(param: IDropdownParam) {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const unitId = workbook.getUnitId();
        const subUnitId = workbook.getActiveSheet().getSheetId();
        const currentRender = this._renderManagerService.getRenderById(unitId);
        if (!currentRender) {
            return;
        }
        this._activeDropdown = param;
        this._activeDropdown$.next(this._activeDropdown);

        const { position } = param;
        const bounding = currentRender.engine.getCanvasElement().getBoundingClientRect();
        this._currentPopupId = this._popupService.addPopup({
            anchorRect: {
                top: position.startY + bounding.top - 3,
                bottom: position.endY + bounding.top + 3,
                left: position.startX,
                right: position.endX,
            },
            unitId,
            subUnitId,
            componentKey: DROP_DOWN_KEY,
            mask: true,
            onMaskClick: () => {
                this.hideDropdown();
            },
        });
    }

    hideDropdown() {
        if (!this._activeDropdown) {
            return;
        }
        const activeDropdown = this._activeDropdown;
        this._currentPopupId && this._popupService.removePopup(this._currentPopupId);
        this._currentPopupId = null;
        this._activeDropdown = null;
        this._activeDropdown$.next(null);
        activeDropdown.onHide?.();
    }
}
