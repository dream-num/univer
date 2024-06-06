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

import { Disposable, DisposableCollection, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, IUniverInstanceService, type Nullable } from '@univerjs/core';
import type { ISheetLocation } from '@univerjs/sheets';
import { Subject } from 'rxjs';
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';
import { SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import { DataValidationModel, DataValidatorRegistryService } from '@univerjs/data-validation';
import { IZenZoneService } from '@univerjs/ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DROP_DOWN_KEY } from '../views/drop-down';
import type { SheetDataValidationManager } from '../models/sheet-data-validation-manager';

export interface IDropdownParam {
    location: ISheetLocation;
    onHide?: () => void;
    componentKey: string;
}

export interface IDropdownComponentProps {
    componentKey: string;
    location: ISheetLocation;
    hideFn: () => void;
}

export class DataValidationDropdownManagerService extends Disposable {
    private _activeDropdown: Nullable<IDropdownParam>;
    private _activeDropdown$ = new Subject<Nullable<IDropdownParam>>();
    private _currentPopup: Nullable<IDisposable> = null;

    activeDropdown$ = this._activeDropdown$.asObservable();

    private _zenVisible = false;

    get activeDropdown() {
        return this._activeDropdown;
    }

    constructor(
        @Inject(SheetCanvasPopManagerService) private readonly _canvasPopupManagerService: SheetCanvasPopManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DataValidatorRegistryService) private readonly _dataValidatorRegistryService: DataValidatorRegistryService,
        @IZenZoneService private readonly _zenZoneService: IZenZoneService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(DataValidationModel) private readonly _dataValidationModel: DataValidationModel
    ) {
        super();
        this._init();
    }

    private _init() {
        this.disposeWithMe(this._zenZoneService.visible$.subscribe((visible) => {
            this._zenVisible = visible;
            if (visible) {
                this.hideDropdown();
            }
        }));
    }

    showDropdown(param: IDropdownParam) {
        const { location } = param;
        const { row, col } = location;

        this._currentPopup && this._currentPopup.dispose();

        if (this._zenVisible) {
            return;
        }

        this._activeDropdown = param;
        this._activeDropdown$.next(this._activeDropdown);
        const currentRender = this._renderManagerService.getRenderById(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
        const popupDisposable = this._canvasPopupManagerService.attachPopupToCell(
            row,
            col,
            {
                componentKey: DROP_DOWN_KEY,
                onClickOutside: () => {
                    this.hideDropdown();
                },
                offset: [0, 3],
                excludeOutside: [currentRender?.engine.getCanvasElement()].filter(Boolean) as HTMLElement[],
            }
        );

        if (!popupDisposable) {
            throw new Error('[DataValidationDropdownManagerService]: cannot show dropdown!');
        }

        const disposableCollection = new DisposableCollection();
        disposableCollection.add(popupDisposable);
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

    showDataValidationDropdown(unitId: string, subUnitId: string, row: number, col: number, onHide?: () => void) {
        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
        if (!workbook) {
            return;
        }

        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            return;
        }

        const manager = this._dataValidationModel.ensureManager(unitId, subUnitId) as SheetDataValidationManager;
        const rule = manager.getRuleByLocation(row, col);
        if (!rule) {
            return;
        }

        const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);
        if (!validator || !validator.dropdown) {
            this.hideDropdown();
            return;
        }

        this.showDropdown({
            location: {
                workbook,
                worksheet,
                row,
                col,
                unitId,
                subUnitId,
            },
            componentKey: validator.dropdown,
            onHide,
        });
    }
}
