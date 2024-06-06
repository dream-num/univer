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

import type { Workbook } from '@univerjs/core';
import { DataValidationStatus, Disposable, IUniverInstanceService, LifecycleStages, LocaleService, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { CellAlertManagerService, CellAlertType, HoverManagerService } from '@univerjs/sheets-ui';
import { Inject } from '@wendellhu/redi';
import type { BaseDataValidator } from '@univerjs/data-validation';
import { debounceTime } from 'rxjs';

const ALERT_KEY = 'SHEET_DATA_VALIDATION_ALERT';

@OnLifecycle(LifecycleStages.Rendered, DataValidationAlertController)
export class DataValidationAlertController extends Disposable {
    constructor(
        @Inject(HoverManagerService) private readonly _hoverManagerService: HoverManagerService,
        @Inject(CellAlertManagerService) private readonly _cellAlertManagerService: CellAlertManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();
        this._init();
    }

    private _init() {
        this._initCellAlertPopup();
    }

    private _initCellAlertPopup() {
        this.disposeWithMe(this._hoverManagerService.currentCell$.pipe(debounceTime(100)).subscribe((cellPos) => {
            if (cellPos) {
                const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                const worksheet = workbook.getActiveSheet();
                const cellData = worksheet.getCell(cellPos.location.row, cellPos.location.col);

                if (cellData?.dataValidation?.validStatus === DataValidationStatus.INVALID) {
                    const currentAlert = this._cellAlertManagerService.currentAlert.get(ALERT_KEY);
                    const currentLoc = currentAlert?.alert?.location;
                    if (
                        currentLoc &&
                        currentLoc.row === cellPos.location.row &&
                        currentLoc.col === cellPos.location.col &&
                        currentLoc.subUnitId === cellPos.location.subUnitId &&
                        currentLoc.unitId === cellPos.location.unitId
                    ) {
                        return;
                    }
                    const validator = cellData.dataValidation.validator as BaseDataValidator;
                    const rule = cellData.dataValidation.rule;
                    if (!validator) {
                        return;
                    }
                    this._cellAlertManagerService.showAlert({
                        type: CellAlertType.ERROR,
                        title: this._localeService.t('dataValidation.error.title'),
                        message: validator?.getRuleFinalError(rule),
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
}
