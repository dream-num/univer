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

import { DataValidationStatus, Disposable, IUniverInstanceService, LifecycleStages, LocaleService, OnLifecycle } from '@univerjs/core';
import { CellAlertManagerService, CellAlertType, HoverManagerService } from '@univerjs/sheets-ui';
import { Inject } from '@wendellhu/redi';
import { SheetDataValidationService } from '../services/dv.service';

@OnLifecycle(LifecycleStages.Rendered, DataValidationAlertController)
export class DataValidationAlertController extends Disposable {
    constructor(
        @Inject(HoverManagerService) private readonly _hoverManagerService: HoverManagerService,
        @Inject(CellAlertManagerService) private readonly _cellAlertManagerService: CellAlertManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetDataValidationService) private readonly _sheetDataValidationService: SheetDataValidationService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();
        this._init();
    }

    private _init() {
        this._initCellAlertPopup();
    }

    private _initCellAlertPopup() {
        this.disposeWithMe(this._hoverManagerService.currentCell$.subscribe((cellPos) => {
            if (cellPos) {
                const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
                const worksheet = workbook.getActiveSheet();
                const manager = this._sheetDataValidationService.currentManager?.manager;
                const cellData = worksheet.getCell(cellPos.location.row, cellPos.location.col);

                if (cellData?.dataValidation?.validStatus === DataValidationStatus.INVALID) {
                    const currentLoc = this._cellAlertManagerService.currentAlert?.location;
                    if (
                        currentLoc &&
                        currentLoc.row === cellPos.location.row &&
                        currentLoc.col === cellPos.location.col &&
                        currentLoc.subUnitId === cellPos.location.subUnitId &&
                        currentLoc.unitId === cellPos.location.unitId
                    ) {
                        return;
                    }
                    this._cellAlertManagerService.showAlert({
                        type: CellAlertType.ERROR,
                        title: this._localeService.t('dataValidation.error.title'),
                        message: manager?.getRuleErrorMsg(cellData.dataValidation.ruleId),
                        location: cellPos.location,
                        width: 200,
                        height: 74,
                    });
                    return;
                }

                // if (cellData?.dataValidation?.rule.showInputMessage) {
                //     this._cellAlertManagerService.showAlert({
                //         type: CellAlertType.INFO,
                //         title: this._localeService.t('dataValidation.error.title'),
                //         message: manager?.getRuleErrorMsg(cellData.dataValidation.ruleId),
                //         location: cellPos.location,
                //         width: 200,
                //         height: 74,
                //     });
                //     return;
                // }
            }

            this._cellAlertManagerService.clearAlert();
        }));
    }
}
