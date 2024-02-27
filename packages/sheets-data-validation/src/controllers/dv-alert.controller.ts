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

import { DataValidationStatus, Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { CellAlertManagerService, CellAlertType, HoverManagerService } from '@univerjs/sheets-ui';
import { Inject } from '@wendellhu/redi';
import { SheetDataValidationService } from '../services/dv.service';

@OnLifecycle(LifecycleStages.Rendered, DataValidationAlertController)
export class DataValidationAlertController extends Disposable {
    constructor(
        @Inject(HoverManagerService) private _hoverManagerService: HoverManagerService,
        @Inject(CellAlertManagerService) private _cellAlertManagerService: CellAlertManagerService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService,
        @Inject(SheetDataValidationService) private _sheetDataValidationService: SheetDataValidationService
    ) {
        super();

        this._init();
    }

    private _init() {
        this.disposeWithMe(this._hoverManagerService.currentCell$.subscribe((cellPos) => {
            if (cellPos) {
                const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
                const worksheet = workbook.getActiveSheet();
                const manager = this._sheetDataValidationService.currentDataValidationManager?.manager;
                const cellData = worksheet.getCell(cellPos.row, cellPos.col);

                if (cellData?.dataValidation?.validStatus === DataValidationStatus.INVALID) {
                    this._cellAlertManagerService.showAlert({
                        type: CellAlertType.ERROR,
                        title: 'invalid:',
                        message: manager?.getRuleErrorMsg(cellData.dataValidation.ruleId),
                        offsetX: cellPos.offsetX,
                        offsetY: cellPos.offsetY,
                    });
                    return;
                }
            }

            this._cellAlertManagerService.clearAlert();
        }));
    }
}
