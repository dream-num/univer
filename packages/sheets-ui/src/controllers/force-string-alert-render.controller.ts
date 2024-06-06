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
import { CellValueType, Disposable, isRealNum, LifecycleStages, LocaleService, OnLifecycle } from '@univerjs/core';

import { Inject } from '@wendellhu/redi';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { HoverManagerService } from '../services/hover-manager.service';
import { CellAlertManagerService, CellAlertType } from '../services/cell-alert-manager.service';

const ALERT_KEY = 'SHEET_FORCE_STRING_ALERT';

@OnLifecycle(LifecycleStages.Rendered, ForceStringAlertRenderController)
export class ForceStringAlertRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(HoverManagerService) private readonly _hoverManagerService: HoverManagerService,
        @Inject(CellAlertManagerService) private readonly _cellAlertManagerService: CellAlertManagerService,
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
                const workbook = this._context.unit;
                const worksheet = workbook.getActiveSheet();
                const cellData = worksheet.getCell(cellPos.location.row, cellPos.location.col);

                if (cellData?.t === CellValueType.FORCE_STRING && cellData.v && isRealNum(cellData.v)) {
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

                    this._cellAlertManagerService.showAlert({
                        type: CellAlertType.ERROR,
                        title: this._localeService.t('info.error'),
                        message: this._localeService.t('info.forceStringInfo'),
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
