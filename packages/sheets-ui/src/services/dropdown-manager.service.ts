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

import { DisposableCollection, type IPosition, IUniverInstanceService, type Nullable } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { ISheetLocation } from '@univerjs/sheets';
import { IGlobalPopupManagerService } from '@univerjs/ui';
import { Subject } from 'rxjs';
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';
import { DROP_DOWN_KEY } from '../views/drop-down';
import { CanvasPopManagerService } from '..';

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
    private _currentPopup: Nullable<IDisposable> = null;

    activeDropdown$ = this._activeDropdown$.asObservable();

    get activeDropdown() {
        return this._activeDropdown;
    }

    constructor(
        @Inject(CanvasPopManagerService) private readonly _canvasPopupManagerService: CanvasPopManagerService
    ) {}

    showDropdown(param: IDropdownParam) {
        const { location } = param;
        const { row, col } = location;

        this._currentPopup && this._currentPopup.dispose();

        this._activeDropdown = param;
        this._activeDropdown$.next(this._activeDropdown);
        const disposableCollection = new DisposableCollection();

        disposableCollection.add(this._canvasPopupManagerService.attachPopupToCell(
            row,
            col,
            {
                componentKey: DROP_DOWN_KEY,
                mask: true,
                onMaskClick: () => {
                    this.hideDropdown();
                },
            }
        ));

        disposableCollection.add({
            dispose: () => {
                this._activeDropdown?.onHide?.();
            },
        });

        this._currentPopup = disposableCollection;
    }

    hideDropdown() {
        if (!this._activeDropdown) {
            return;
        }
        this._currentPopup && this._currentPopup.dispose();
        this._currentPopup = null;

        this._activeDropdown = null;
        this._activeDropdown$.next(null);
    }
}
