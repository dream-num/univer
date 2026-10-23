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
import type { ISetFormulaCalculationNotificationMutation } from '@univerjs/engine-formula';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Disposable, ICommandService, Inject, isICellData, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { ErrorType, extractFormulaError, FormulaDataModel, SetFormulaCalculationNotificationMutation } from '@univerjs/engine-formula';
import { SetRangeValuesMutation, SetWorkbookCalculationSettingsMutation, SheetSkeletonService, SheetsSelectionsService } from '@univerjs/sheets';
import { CellAlertManagerService, CellAlertType, IEditorBridgeService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import type { LocaleKey } from '../locale/types';
import { CalculationOptionsOperation } from '../commands/operations/calculation-options.operation';

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
    private _circularLocations = new Set<string>();

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetsSelectionsService) private readonly _selectionsService: SheetsSelectionsService,
        @Inject(CellAlertManagerService) private readonly _cellAlertManagerService: CellAlertManagerService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel,
        @Inject(SheetSkeletonService) private readonly _sheetSkeletonService: SheetSkeletonService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _instanceService: IUniverInstanceService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService
    ) {
        super();

        this.disposeWithMe(this._selectionsService.selectionChanged$.subscribe(() => this._updateAlert()));
        this.disposeWithMe(this._context.unit.activeSheet$.subscribe(() => this._updateAlert()));
        this.disposeWithMe(this._instanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET)
            .subscribe(() => this._updateAlert()));
        this.disposeWithMe(this._editorBridgeService.visible$.subscribe(() => this._updateAlert()));
        this.disposeWithMe(this._commandService.onCommandExecuted((command) => {
            if (command.id === SetFormulaCalculationNotificationMutation.id) {
                const params = command.params as ISetFormulaCalculationNotificationMutation;
                if (params.circularReferences) {
                    const locations = new Set(params.circularReferences
                        .filter((cell) => cell.unitId === this._context.unit.getUnitId())
                        .map((cell) => JSON.stringify([cell.sheetId, cell.row, cell.column])));
                    const changed = locations.size !== this._circularLocations.size ||
                        Array.from(locations).some((location) => !this._circularLocations.has(location));
                    this._circularLocations = locations;
                    this._formulaDataModel.setCircularReferences(params.circularReferences);
                    if (changed) {
                        this._refreshMarkers();
                    }
                    this._updateAlert();
                }
            } else if (command.id === SetRangeValuesMutation.id || command.id === SetWorkbookCalculationSettingsMutation.id) {
                if (command.id === SetWorkbookCalculationSettingsMutation.id &&
                    (command.params as { unitId: string }).unitId === this._context.unit.getUnitId()) {
                    this._refreshMarkers();
                }
                this._updateAlert();
            }
        }));
        this.disposeWithMe(() => this._hideAlert());
    }

    private _updateAlert(): void {
        const workbook = this._context.unit;
        const worksheet = workbook.getActiveSheet();
        const selection = this._selectionsService.currentSelectionParam;
        const currentWorkbook = this._instanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!worksheet || selection?.unitId !== workbook.getUnitId() || selection.sheetId !== worksheet.getSheetId() ||
            currentWorkbook?.getUnitId() !== workbook.getUnitId() || this._editorBridgeService.isVisible().visible) {
            this._hideAlert();
            return;
        }
        const selections = this._selectionsService.getCurrentSelections();
        const primary = selections?.[selections.length - 1]?.primary;
        if (!primary) {
            this._hideAlert();
            return;
        }
        const row = primary.actualRow;
        const col = primary.actualColumn;
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const cell = worksheet.getCell(row, col);
        const circular = !workbook.getCalculationSettings().iterativeCalculation && Boolean(cell?.f || cell?.si) &&
            this._formulaDataModel.isCircularReference(unitId, subUnitId, row, col);
        const arrayCell = this._formulaDataModel.getArrayFormulaCellData()?.[unitId]?.[subUnitId]?.[row]?.[col];
        const error = isICellData(cell) ? extractFormulaError(cell, !!arrayCell) : undefined;
        if (!circular && !error) {
            this._hideAlert();
            return;
        }
        const message = circular
            ? this._localeService.t<LocaleKey>('sheets-formula-ui.calculation.circular')
            : this._localeService.t<LocaleKey>(
                (`sheets-formula-ui.error.${ErrorTypeToMessageMap[error!]}`) as LocaleKey
            );
        const previous = this._cellAlertManagerService.currentAlert.get(this._alertKey)?.alert;
        if (previous?.location.row === row && previous.location.col === col &&
            previous.location.subUnitId === subUnitId && previous.message === message && Boolean(previous.action) === circular) {
            return;
        }
        this._cellAlertManagerService.showAlert({
            type: CellAlertType.ERROR,
            title: this._localeService.t<LocaleKey>(circular
                ? 'sheets-formula-ui.calculation.circularTitle'
                : 'sheets-formula-ui.error.title'),
            message,
            location: { unitId, subUnitId, row, col },
            width: 240,
            height: circular ? 124 : 74,
            key: this._alertKey,
            action: circular
                ? {
                    label: this._localeService.t<LocaleKey>('sheets-formula-ui.calculation.action'),
                    onSelect: () => {
                        this._commandService.syncExecuteCommand(CalculationOptionsOperation.id, { unitId });
                    },
                }
                : undefined,
        });
    }

    private get _alertKey(): string {
        return `${ALERT_KEY}:${this._context.unit.getUnitId()}`;
    }

    private _refreshMarkers(): void {
        // Circular diagnostics can change while cached cell values remain identical.
        this._sheetSkeletonService.getSkeletonsByUnitId(this._context.unit.getUnitId())
            .forEach((skeleton) => skeleton.resetCache());
        this._sheetSkeletonManagerService.reCalculate();
        this._context.mainComponent?.makeDirty();
    }

    private _hideAlert(): void {
        this._cellAlertManagerService.removeAlert(this._alertKey);
    }
}
