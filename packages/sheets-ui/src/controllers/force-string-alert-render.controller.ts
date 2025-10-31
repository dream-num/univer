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
import type { IUniverSheetsUIConfig } from './config.schema';
import { CellValueType, Disposable, IConfigService, Inject, isRealNum, LocaleService, numfmt } from '@univerjs/core';
import { IZenZoneService } from '@univerjs/ui';
import { CellAlertManagerService, CellAlertType } from '../services/cell-alert-manager.service';
import { HoverManagerService } from '../services/hover-manager.service';
import { SHEETS_UI_PLUGIN_CONFIG_KEY } from './config.schema';

const ALERT_KEY = 'SHEET_FORCE_STRING_ALERT';

export class ForceStringAlertRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(HoverManagerService) private readonly _hoverManagerService: HoverManagerService,
        @Inject(CellAlertManagerService) private readonly _cellAlertManagerService: CellAlertManagerService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IZenZoneService private readonly _zenZoneService: IZenZoneService,
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
        this.disposeWithMe(this._hoverManagerService.currentCell$.subscribe((cellPos) => {
            if (cellPos) {
                const location = cellPos.location;
                const workbook = this._context.unit;
                const worksheet = workbook.getActiveSheet();

                if (!worksheet) return;

                const cellData = worksheet.getCell(location.row, location.col);

                if (!cellData || cellData.v === null || cellData.v === undefined) return;

                /**
                 * If the cell type is string or force string, and the value is a pure number or a string that can be converted to a number, show the force string alert.
                 * '123 -> yes
                 * '20% -> yes
                 * '1,234.56 -> yes
                 * 'abc -> no
                 * '2025-09-17 -> no
                 */
                if (
                    (cellData.t === CellValueType.FORCE_STRING || cellData.t === CellValueType.STRING) &&
                    (isRealNum(cellData.v) || (typeof cellData.v === 'string' && numfmt.parseNumber(cellData.v)))
                ) {
                    const currentAlerts = this._cellAlertManagerService.currentAlert;

                    for (const [_, value] of currentAlerts.entries()) {
                        const currentLoc = value?.alert?.location;

                        if (
                            currentLoc &&
                            currentLoc.row === location.row &&
                            currentLoc.col === location.col &&
                            currentLoc.subUnitId === location.subUnitId &&
                            currentLoc.unitId === location.unitId
                        ) {
                            return;
                        }
                    }

                    // If the user has disabled the force string alert, do not show it
                    if (this._configService.getConfig<IUniverSheetsUIConfig>(SHEETS_UI_PLUGIN_CONFIG_KEY)?.disableForceStringAlert) {
                        return;
                    }

                    this._cellAlertManagerService.showAlert({
                        type: CellAlertType.ERROR,
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
