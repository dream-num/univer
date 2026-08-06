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

import type { CellValue, Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { IUniverSheetsNumfmtConfig } from '@univerjs/sheets-numfmt';
import type { LocaleKey } from '../locale/types';
import { Disposable, getNumfmtParseValueFilter, ICommandService, IConfigService, Inject, isRealNum, isTextFormat, IUniverInstanceService, LocaleService, Tools, UniverInstanceType } from '@univerjs/core';
import { INumfmtService, SheetsSelectionsService, TextToNumberCommand } from '@univerjs/sheets';
import { SHEETS_NUMFMT_PLUGIN_CONFIG_KEY } from '@univerjs/sheets-numfmt';
import { CellAlertManagerService, CellAlertType } from '@univerjs/sheets-ui';

const ALERT_KEY = 'SHEET_NUMFMT_ALERT';

export class NumfmtAlertRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @Inject(CellAlertManagerService) private readonly _cellAlertManagerService: CellAlertManagerService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(INumfmtService) private _numfmtService: INumfmtService,
        @IConfigService private readonly _configService: IConfigService,
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._init();
    }

    private _init() {
        this._initCellAlertPopup();
    }

    private _initCellAlertPopup() {
        this.disposeWithMe(this._selectionManagerService.selectionChanged$.subscribe((selections) => this._updateAlert(selections)));
        this.disposeWithMe(this._context.unit.activeSheet$.subscribe(() => this._updateAlert(this._selectionManagerService.getCurrentSelections())));
        this.disposeWithMe(
            this._univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe(() =>
                this._updateAlert(this._selectionManagerService.getCurrentSelections())
            )
        );
    }

    private _isCurrentSheet(worksheet: Nullable<Worksheet>): worksheet is Worksheet {
        const selectionParam = this._selectionManagerService.currentSelectionParam;
        return Boolean(
            worksheet &&
            selectionParam?.unitId === this._context.unit.getUnitId() &&
            selectionParam.sheetId === worksheet.getSheetId()
        );
    }

    private _updateAlert(selections: Nullable<Readonly<ISelectionWithStyle[]>>) {
        this._hideAlert();
        const workbook = this._context.unit;
        const worksheet = workbook.getActiveSheet();
        if (!this._isCurrentSheet(worksheet)) {
            return;
        }

        if (selections?.length !== 1) {
            return;
        }

        if (this._configService.getConfig<IUniverSheetsNumfmtConfig>(SHEETS_NUMFMT_PLUGIN_CONFIG_KEY)?.disableTextFormatAlert) {
            return;
        }

        const selection = selections[0];
        const primary = selection.primary;
        if (!primary) {
            return;
        }

        const row = primary.actualRow;
        const col = primary.actualColumn;
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const cellData = worksheet.getCell(row, col);
        let numfmtValue;

        if (cellData?.s) {
            numfmtValue = workbook.getStyles().get(cellData.s)?.n;
        }
        if (!numfmtValue) {
            numfmtValue = this._numfmtService.getValue(unitId, subUnitId, row, col);
        }

        const cellValue = cellData?.v;
        const isConvertibleNumber = isRealNum(cellValue as CellValue) ||
            (typeof cellValue === 'string' && typeof getNumfmtParseValueFilter(cellValue)?.v === 'number');
        if (!isTextFormat(numfmtValue?.pattern) || !Tools.isDefine(cellValue) || !isConvertibleNumber) {
            return;
        }

        const range = { ...selection.range };
        this._cellAlertManagerService.showAlert({
            type: CellAlertType.WARNING,
            title: this._localeService.t<LocaleKey>('sheets-numfmt-ui.info.error'),
            message: this._localeService.t<LocaleKey>('sheets-numfmt-ui.info.forceStringInfo'),
            location: { unitId, subUnitId, row, col },
            width: 200,
            height: 74,
            key: this._alertKey,
            menu: [{
                label: this._localeService.t<LocaleKey>('sheets-numfmt-ui.info.convertToNumber'),
                onSelect: () => {
                    const result = this._commandService.syncExecuteCommand(TextToNumberCommand.id, {
                        unitId,
                        subUnitId,
                        ranges: [range],
                    });
                    if (result) {
                        this._hideAlert();
                    }
                },
            }],
        });
    }

    private get _alertKey() {
        return `${ALERT_KEY}:${this._context.unit.getUnitId()}`;
    }

    private _hideAlert() {
        this._cellAlertManagerService.removeAlert(this._alertKey);
    }
}
