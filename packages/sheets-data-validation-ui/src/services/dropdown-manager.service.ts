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

import type { IDisposable, Nullable, Workbook } from '@univerjs/core';
import { Disposable, DisposableCollection, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DataValidatorRegistryService } from '@univerjs/data-validation';
import { IRenderManagerService } from '@univerjs/engine-render';
import { type ISheetLocation, SheetsSelectionsService } from '@univerjs/sheets';
import { SheetDataValidationModel } from '@univerjs/sheets-data-validation';
import { SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import { IZenZoneService } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { DROP_DOWN_KEY } from '../views/components/drop-down';

export interface IDropdownParam {
    location: ISheetLocation;
    onHide?: () => void;
    componentKey: string;
    trigger?: 'editor-bridge';
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
        @Inject(SheetDataValidationModel) private readonly _dataValidationModel: SheetDataValidationModel,
        @Inject(SheetsSelectionsService) private readonly _sheetsSelectionsService: SheetsSelectionsService
    ) {
        super();
        this._init();

        this._initSelectionChange();
        this.disposeWithMe(() => {
            this._activeDropdown$.complete();
        });
    }

    private _init() {
        this.disposeWithMe(this._zenZoneService.visible$.subscribe((visible) => {
            this._zenVisible = visible;
            if (visible) {
                this.hideDropdown();
            }
        }));
    }

    private _getDropdownByCell(unitId: string | undefined, subUnitId: string | undefined, row: number, col: number) {
        const workbook = unitId ?
            this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET)
            : this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return;
        }

        const worksheet = subUnitId ? workbook.getSheetBySheetId(subUnitId) : workbook.getActiveSheet();
        if (!worksheet) {
            return;
        }

        const rule = this._dataValidationModel.getRuleByLocation(workbook.getUnitId(), worksheet.getSheetId(), row, col);
        if (!rule) {
            return;
        }

        const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);

        return validator?.dropdown;
    }

    private _initSelectionChange() {
        this.disposeWithMe(this._sheetsSelectionsService.selectionMoveEnd$.subscribe((selections) => {
            if (selections && selections.every((selection) => !(selection.primary && this._getDropdownByCell(selection.primary.unitId, selection.primary.sheetId, selection.primary.actualRow, selection.primary.actualColumn)))) {
                this.hideDropdown();
            }
        }));
    }

    showDropdown(param: IDropdownParam, closeOnOutSide = true) {
        const { location } = param;
        const { row, col, unitId, subUnitId } = location;

        if (this._currentPopup) {
            this._currentPopup.dispose();
        };

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
                    if (closeOnOutSide) {
                        this.hideDropdown();
                    }
                },
                offset: [0, 3],
                excludeOutside: [currentRender?.engine.getCanvasElement()].filter(Boolean) as HTMLElement[],
            },
            unitId,
            subUnitId
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
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return;
        }

        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            return;
        }

        const rule = this._dataValidationModel.getRuleByLocation(workbook.getUnitId(), worksheet.getSheetId(), row, col);
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
