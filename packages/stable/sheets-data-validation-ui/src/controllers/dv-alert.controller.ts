/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { Workbook } from '@univerjs/core';
import type { BaseDataValidator } from '@univerjs/data-validation';
import { DataValidationStatus, Disposable, Inject, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { SheetDataValidationModel } from '@univerjs/sheets-data-validation';
import { CellAlertManagerService, CellAlertType, HoverManagerService } from '@univerjs/sheets-ui';
import { IZenZoneService } from '@univerjs/ui';
import { debounceTime } from 'rxjs';

const ALERT_KEY = 'SHEET_DATA_VALIDATION_ALERT';

export class DataValidationAlertController extends Disposable {
    constructor(
        @Inject(HoverManagerService) private readonly _hoverManagerService: HoverManagerService,
        @Inject(CellAlertManagerService) private readonly _cellAlertManagerService: CellAlertManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IZenZoneService private readonly _zenZoneService: IZenZoneService,
        @Inject(SheetDataValidationModel) private readonly _dataValidationModel: SheetDataValidationModel
    ) {
        super();
        this._init();
    }

    private _init() {
        this._initCellAlertPopup();
        this._initZenService();
    }

    private _initCellAlertPopup() {
        this.disposeWithMe(this._hoverManagerService.currentCell$.pipe(debounceTime(100)).subscribe((cellPos) => {
            if (cellPos) {
                const workbook = this._univerInstanceService.getUnit<Workbook>(cellPos.location.unitId, UniverInstanceType.UNIVER_SHEET)!;
                const worksheet = workbook.getSheetBySheetId(cellPos.location.subUnitId);
                if (!worksheet) return;
                const rule = this._dataValidationModel.getRuleByLocation(cellPos.location.unitId, cellPos.location.subUnitId, cellPos.location.row, cellPos.location.col);
                if (!rule) {
                    this._cellAlertManagerService.removeAlert(ALERT_KEY);
                    return;
                }

                const validStatus = this._dataValidationModel.validator(rule, { ...cellPos.location, workbook, worksheet });
                if (validStatus === DataValidationStatus.INVALID) {
                    const currentAlert = this._cellAlertManagerService.currentAlert.get(ALERT_KEY);
                    const currentLoc = currentAlert?.alert?.location;
                    if (
                        currentLoc &&
                        currentLoc.row === cellPos.location.row &&
                        currentLoc.col === cellPos.location.col &&
                        currentLoc.subUnitId === cellPos.location.subUnitId &&
                        currentLoc.unitId === cellPos.location.unitId
                    ) {
                        this._cellAlertManagerService.removeAlert(ALERT_KEY);
                        return;
                    }

                    const validator = this._dataValidationModel.getValidator(rule.type) as BaseDataValidator;
                    if (!validator) {
                        this._cellAlertManagerService.removeAlert(ALERT_KEY);
                        return;
                    }
                    this._cellAlertManagerService.showAlert({
                        type: CellAlertType.ERROR,
                        title: this._localeService.t('dataValidation.error.title'),
                        message: validator?.getRuleFinalError(rule, cellPos.location),
                        location: cellPos.location,
                        width: 200,
                        height: 74,
                        key: ALERT_KEY,
                    });
                    return;
                }
            }

            this._cellAlertManagerService.removeAlert(ALERT_KEY);
        }));
    }

    private _initZenService() {
        this.disposeWithMe(this._zenZoneService.visible$.subscribe((visible) => {
            if (visible) {
                this._cellAlertManagerService.removeAlert(ALERT_KEY);
            }
        }));
    }
}
