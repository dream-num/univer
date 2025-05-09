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
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { IUniverSheetsNumfmtConfig } from '@univerjs/sheets-numfmt';
import { Disposable, IConfigService, Inject, isRealNum, LocaleService } from '@univerjs/core';
import { isTextFormat } from '@univerjs/engine-numfmt';
import { INumfmtService } from '@univerjs/sheets';
import { SHEETS_NUMFMT_PLUGIN_CONFIG_KEY } from '@univerjs/sheets-numfmt';
import { CellAlertManagerService, CellAlertType, HoverManagerService } from '@univerjs/sheets-ui';
import { IZenZoneService } from '@univerjs/ui';
import { debounceTime } from 'rxjs';

const ALERT_KEY = 'SHEET_NUMFMT_ALERT';

export class NumfmtAlertRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(HoverManagerService) private readonly _hoverManagerService: HoverManagerService,
        @Inject(CellAlertManagerService) private readonly _cellAlertManagerService: CellAlertManagerService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IZenZoneService private readonly _zenZoneService: IZenZoneService,
        @Inject(INumfmtService) private _numfmtService: INumfmtService,
        @IConfigService private readonly _configService: IConfigService
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
                const location = cellPos.location;
                const workbook = this._context.unit;
                const worksheet = workbook.getActiveSheet();
                if (!worksheet) return;

                const unitId = location.unitId;
                const sheetId = location.subUnitId;
                let numfmtValue;

                const cellData = worksheet.getCell(location.row, location.col);

                if (cellData?.s) {
                    const style = workbook.getStyles().get(cellData.s);
                    if (style?.n) {
                        numfmtValue = style.n;
                    }
                }

                if (!numfmtValue) {
                    numfmtValue = this._numfmtService.getValue(unitId, sheetId, location.row, location.col);
                }

                if (!numfmtValue) {
                    this._hideAlert();
                    return;
                }

                // Preventing blank object
                if (isTextFormat(numfmtValue.pattern) && cellData?.v && isRealNum(cellData.v)) {
                    // If the user has disabled the text format alert, do not show it
                    if (this._configService.getConfig<IUniverSheetsNumfmtConfig>(SHEETS_NUMFMT_PLUGIN_CONFIG_KEY)?.disableTextFormatAlert) {
                        return;
                    }

                    const currentAlert = this._cellAlertManagerService.currentAlert.get(ALERT_KEY);
                    const currentLoc = currentAlert?.alert?.location;
                    if (
                        currentLoc &&
                        currentLoc.row === location.row &&
                        currentLoc.col === location.col &&
                        currentLoc.subUnitId === location.subUnitId &&
                        currentLoc.unitId === location.unitId
                    ) {
                        return;
                    }

                    this._cellAlertManagerService.showAlert({
                        type: CellAlertType.WARNING,
                        title: this._localeService.t('info.error'),
                        message: this._localeService.t('info.forceStringInfo'),
                        location,
                        width: 200,
                        height: 74,
                        key: ALERT_KEY,
                    });
                    return;
                }
            }

            this._hideAlert();
        }));
    }

    private _initZenService() {
        this.disposeWithMe(this._zenZoneService.visible$.subscribe((visible) => {
            if (visible) {
                this._hideAlert();
            }
        }));
    }

    private _hideAlert() {
        this._cellAlertManagerService.removeAlert(ALERT_KEY);
    }
}
