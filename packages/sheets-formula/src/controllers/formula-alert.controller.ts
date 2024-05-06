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
import { Disposable, IUniverInstanceService, LifecycleStages, LocaleService, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { ErrorType } from '@univerjs/engine-formula';
import { CellAlertManagerService, CellAlertType, HoverManagerService } from '@univerjs/sheets-ui';
import { Inject } from '@wendellhu/redi';
import { extractFormulaError } from './utils/utils';

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

@OnLifecycle(LifecycleStages.Rendered, FormulaAlertController)
export class FormulaAlertController extends Disposable {
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
        this.disposeWithMe(this._hoverManagerService.currentCell$.subscribe((cellPos) => {
            if (cellPos) {
                const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                const worksheet = workbook.getActiveSheet();
                const cellData = worksheet.getCell(cellPos.location.row, cellPos.location.col);

                if (cellData) {
                    const errorType = extractFormulaError(cellData);

                    if (!errorType) {
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
                        return;
                    }

                    this._cellAlertManagerService.showAlert({
                        type: CellAlertType.ERROR,
                        title: this._localeService.t('formula.error.title'),
                        message: this._localeService.t(`formula.error.${ErrorTypeToMessageMap[errorType]}`),
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
