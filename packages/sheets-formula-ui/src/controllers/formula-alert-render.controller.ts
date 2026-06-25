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
import type { LocaleKey } from '../locale/types';
import { Disposable, Inject, isICellData, LocaleService } from '@univerjs/core';
import { ErrorType, extractFormulaError, FormulaDataModel } from '@univerjs/engine-formula';
import { CellAlertManagerService, CellAlertType, HoverManagerService } from '@univerjs/sheets-ui';
import { debounceTime } from 'rxjs';

const ALERT_KEY = 'SHEET_FORMULA_ALERT';

const ErrorTypeToMessageMap = {
    [ErrorType.DIV_BY_ZERO]: 'divByZero',
    [ErrorType.NAME]: 'name',
    [ErrorType.VALUE]: 'value',
    [ErrorType.NUM]: 'num',
    [ErrorType.NA]: 'na',
    [ErrorType.CYCLE]: 'cycle',
    [ErrorType.REF]: 'ref',
    [ErrorType.SPILL]: 'spill',
    [ErrorType.CALC]: 'calc',
    [ErrorType.ERROR]: 'error',
    [ErrorType.CONNECT]: 'connect',
    [ErrorType.NULL]: 'null',
};

export class FormulaAlertRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(HoverManagerService) private readonly _hoverManagerService: HoverManagerService,
        @Inject(CellAlertManagerService) private readonly _cellAlertManagerService: CellAlertManagerService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel
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
                const workbook = this._context.unit;
                const worksheet = workbook.getActiveSheet();

                if (!worksheet) return this._hideAlert();

                const cellData = worksheet.getCell(cellPos.location.row, cellPos.location.col);

                const arrayFormulaCellData = this._formulaDataModel.getArrayFormulaCellData()?.
                    [cellPos.location.unitId]?.
                    [cellPos.location.subUnitId]?.
                    [cellPos.location.row]?.
                    [cellPos.location.col];

                // Preventing blank object
                if (isICellData(cellData)) {
                    const errorType = extractFormulaError(cellData, !!arrayFormulaCellData);

                    if (!errorType) {
                        // fix #4002
                        this._hideAlert();
                        return;
                    }

                    const currentAlert = this._cellAlertManagerService.currentAlert.get(ALERT_KEY);
                    const currentLoc = currentAlert?.alert?.location;
                    if (
                        currentLoc &&
                        currentLoc.row === cellPos.location.row &&
                        currentLoc.col === cellPos.location.col &&
                        currentLoc.subUnitId === cellPos.location.subUnitId &&
                        currentLoc.unitId === cellPos.location.unitId
                    ) {
                        this._hideAlert();
                        return;
                    }

                    this._cellAlertManagerService.showAlert({
                        type: CellAlertType.ERROR,
                        title: this._localeService.t<LocaleKey>('sheets-formula-ui.error.title'),
                        message: this._localeService.t(`sheets-formula-ui.error.${ErrorTypeToMessageMap[errorType]}`),
                        location: cellPos.location,
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

    private _hideAlert() {
        this._cellAlertManagerService.removeAlert(ALERT_KEY);
    }
}
