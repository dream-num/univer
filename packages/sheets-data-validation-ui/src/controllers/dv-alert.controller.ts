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

import type { IRange, Nullable, Workbook } from '@univerjs/core';
import type { BaseDataValidator } from '@univerjs/data-validation';
import type { ISheetLocationBase } from '@univerjs/sheets';
import type { IHoverCellPosition } from '@univerjs/sheets-ui';
import type { LocaleKey } from '../locale/types';
import {
    DataValidationStatus,
    Disposable,
    Inject,
    IUniverInstanceService,
    LocaleService,
    Rectangle,
    UniverInstanceType,
} from '@univerjs/core';
import { DataValidationCacheService, SheetDataValidationModel } from '@univerjs/sheets-data-validation';
import { CellAlertManagerService, CellAlertType, HoverManagerService } from '@univerjs/sheets-ui';
import { auditTime, debounceTime, filter, of, switchMap, tap } from 'rxjs';

const ALERT_KEY = 'SHEET_DATA_VALIDATION_ALERT';

export class DataValidationAlertController extends Disposable {
    private _hoveredCell: Nullable<IHoverCellPosition> = null;

    constructor(
        @Inject(HoverManagerService) private readonly _hoverManagerService: HoverManagerService,
        @Inject(CellAlertManagerService) private readonly _cellAlertManagerService: CellAlertManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(SheetDataValidationModel) private readonly _dataValidationModel: SheetDataValidationModel,
        @Inject(DataValidationCacheService) private readonly _dataValidationCacheService: DataValidationCacheService
    ) {
        super();
        this._init();
    }

    private _init() {
        this._initCellAlertPopup();
    }

    private _initCellAlertPopup() {
        this.disposeWithMe(this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET).pipe(
            switchMap((workbook) => workbook?.activeSheet$ ?? of(null))
        ).subscribe(() => {
            this._hoveredCell = null;
            this._cellAlertManagerService.removeAlert(ALERT_KEY);
        }));

        this.disposeWithMe(this._hoverManagerService.currentCell$.pipe(
            tap(() => {
                this._hoveredCell = null;
                this._cellAlertManagerService.removeAlert(ALERT_KEY);
            }),
            debounceTime(100)
        ).subscribe((cellPos) => {
            this._hoveredCell = cellPos;
            this._refreshAlert();
        }));

        this.disposeWithMe(this._dataValidationModel.ruleChange$.subscribe((change) => {
            if (this._affectsHoveredCell(change, [...change.rule.ranges, ...change.oldRule?.ranges ?? []])) {
                this._refreshAlert();
            }
        }));

        this.disposeWithMe(this._dataValidationCacheService.dirtyRanges$.pipe(
            filter((change) => this._affectsHoveredCell(change, change.ranges)),
            tap(() => this._cellAlertManagerService.removeAlert(ALERT_KEY)),
            // Rule updates invalidate caches before their location matrix has finished updating.
            auditTime(0)
        ).subscribe(() => this._refreshAlert()));

        this.disposeWithMe(this._dataValidationModel.validStatusChange$.subscribe((change) => {
            if (this._isHoveredLocation(change)) {
                const rule = this._dataValidationModel.getRuleByLocation(change.unitId, change.subUnitId, change.row, change.col);
                if (rule?.uid === change.ruleId) {
                    this._updateAlert(change.status);
                }
            }
        }));

        this.disposeWithMe(() => {
            this._hoveredCell = null;
            this._cellAlertManagerService.removeAlert(ALERT_KEY);
        });
    }

    private _isHoveredLocation(location: ISheetLocationBase) {
        const current = this._hoveredCell?.location;
        return current?.unitId === location.unitId && current?.subUnitId === location.subUnitId &&
            current?.row === location.row && current?.col === location.col;
    }

    private _affectsHoveredCell(location: Pick<ISheetLocationBase, 'unitId' | 'subUnitId'>, ranges: IRange[]) {
        const current = this._hoveredCell?.location;
        return current?.unitId === location.unitId && current?.subUnitId === location.subUnitId &&
            ranges.some((range) => Rectangle.contains(range, {
                startRow: current.row,
                endRow: current.row,
                startColumn: current.col,
                endColumn: current.col,
            }));
    }

    private _getHoveredContext() {
        const location = this._hoveredCell?.location;
        if (!location) {
            return;
        }
        const workbook = this._univerInstanceService.getUnit<Workbook>(location.unitId, UniverInstanceType.UNIVER_SHEET);
        const worksheet = workbook?.getActiveSheet();
        if (!workbook || !worksheet || worksheet.getSheetId() !== location.subUnitId) {
            return;
        }
        const rule = this._dataValidationModel.getRuleByLocation(location.unitId, location.subUnitId, location.row, location.col);
        if (rule) {
            return { location, workbook, worksheet, rule };
        }
    }

    private _refreshAlert() {
        const context = this._getHoveredContext();
        if (!context) {
            this._cellAlertManagerService.removeAlert(ALERT_KEY);
            return;
        }
        const { location, workbook, worksheet, rule } = context;
        this._updateAlert(this._dataValidationModel.validator(rule, { ...location, workbook, worksheet }));
    }

    private _updateAlert(status: DataValidationStatus) {
        const context = this._getHoveredContext();
        if (!context || status !== DataValidationStatus.INVALID) {
            this._cellAlertManagerService.removeAlert(ALERT_KEY);
            return;
        }
        const { location, rule } = context;
        const validator = this._dataValidationModel.getValidator(rule.type) as BaseDataValidator;
        if (!validator) {
            this._cellAlertManagerService.removeAlert(ALERT_KEY);
            return;
        }
        const title = this._localeService.t<LocaleKey>('sheets-data-validation-ui.error.title');
        const message = validator.getRuleFinalError(rule, location);
        const currentAlert = this._cellAlertManagerService.currentAlert.get(ALERT_KEY)?.alert;
        if (currentAlert && this._isHoveredLocation(currentAlert.location) && currentAlert.title === title && currentAlert.message === message) {
            return;
        }
        this._cellAlertManagerService.showAlert({
            type: CellAlertType.ERROR,
            title,
            message,
            location,
            width: 200,
            height: 74,
            key: ALERT_KEY,
        });
    }
}
