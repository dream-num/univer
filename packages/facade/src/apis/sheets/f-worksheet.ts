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

import type { IRange, Nullable, ObjectMatrix, Workbook, Worksheet } from '@univerjs/core';
import type { ISetWorksheetColWidthMutationParams, ISetWorksheetRowHeightMutationParams } from '@univerjs/sheets';
import { SetWorksheetColWidthMutation, SetWorksheetRowHeightMutation, SheetsSelectionsService } from '@univerjs/sheets';
import { ICommandService, Inject, Injector } from '@univerjs/core';

import type { IDataValidationResCache } from '@univerjs/sheets-data-validation';
import { DataValidationModel, SheetsDataValidationValidatorService } from '@univerjs/sheets-data-validation';
import type { FilterModel } from '@univerjs/sheets-filter';
import { SheetsFilterService } from '@univerjs/sheets-filter';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { ComponentManager } from '@univerjs/ui';
import { SheetCanvasFloatDomManagerService } from '@univerjs/sheets-drawing-ui';
import { FRange } from './f-range';
import { FSelection } from './f-selection';
import { FDataValidation } from './f-data-validation';
import { FFilter } from './f-filter';
import { FThreadComment } from './f-thread-comment';
import type { IFICanvasFloatDom } from './f-workbook';
import { transformComponentKey } from './utils';

export class FWorksheet {
    constructor(
        private readonly _workbook: Workbook,
        private readonly _worksheet: Worksheet,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        // empty
    }

    /**
     * Returns the injector
     * @returns The injector
     */
    getInject(): Injector {
        return this._injector;
    }

    /**
     * Returns the workbook
     * @returns The workbook
     */
    getWorkbook(): Workbook {
        return this._workbook;
    }

    /**
     * Returns the worksheet id
     * @returns The id of the worksheet
     */
    getSheetId(): string {
        return this._worksheet.getSheetId();
    }

    /**
     * Returns the worksheet name
     * @returns The name of the worksheet
     */
    getSheetName(): string {
        return this._worksheet.getName();
    }

    getSelection(): FSelection | null {
        const selections = this._selectionManagerService.getCurrentSelections();
        if (!selections) {
            return null;
        }

        return this._injector.createInstance(FSelection, this._workbook, this._worksheet, selections);
    }

    getRange(row: number, col: number, height?: number, width?: number): FRange {
        const range: IRange = {
            startRow: row,
            endRow: row + (height ?? 1) - 1,
            startColumn: col,
            endColumn: col + (width ?? 1) - 1,
        };

        return this._injector.createInstance(FRange, this._workbook, this._worksheet, range);
    }

    setRowHeights(startRow: number, numRows: number, height: number): void {
        this._commandService.syncExecuteCommand(SetWorksheetRowHeightMutation.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            ranges: [
                {
                    startRow,
                    endRow: startRow + numRows - 1,
                    startColumn: 0,
                    endColumn: this._worksheet.getColumnCount() - 1,
                },
            ],
            rowHeight: height,
        } as ISetWorksheetRowHeightMutationParams);
    }

    setColumnWidths(startColumn: number, numColumns: number, width: number): void {
        this._commandService.syncExecuteCommand(SetWorksheetColWidthMutation.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            ranges: [
                {
                    startColumn,
                    endColumn: startColumn + numColumns - 1,
                    startRow: 0,
                    endRow: this._worksheet.getRowCount() - 1,
                },
            ],
            colWidth: width,
        } as ISetWorksheetColWidthMutationParams);
    }

    /**
     * Returns the current number of columns in the sheet, regardless of content.
     * @return The maximum columns count of the sheet
     */
    getMaxColumns(): number {
        return this._worksheet.getMaxColumns();
    }

    /**
     * Returns the current number of rows in the sheet, regardless of content.
     * @return The maximum rows count of the sheet
     */
    getMaxRows(): number {
        return this._worksheet.getMaxRows();
    }

     /**
      * get all data validation rules in current sheet
      * @returns all data validation rules
      */
    getDataValidations(): FDataValidation[] {
        const dataValidationModel = this._injector.get(DataValidationModel);
        return dataValidationModel.getRules(this._workbook.getUnitId(), this._worksheet.getSheetId()).map((rule) => new FDataValidation(rule));
    }

    /**
     * get data validation validator status for current sheet
     * @returns matrix of validator status
     */
    getValidatorStatus(): Promise<ObjectMatrix<Nullable<IDataValidationResCache>>> {
        const validatorService = this._injector.get(SheetsDataValidationValidatorService);
        return validatorService.validatorWorksheet(
            this._workbook.getUnitId(),
            this._worksheet.getSheetId()
        );
    }

    // #region Filter

    getFilter(): FFilter | null {
        const filterModel = this._getFilterModel();
        if (!filterModel) return null;

        return this._injector.createInstance(FFilter, this._workbook, this._worksheet, filterModel);
    }

    private _getFilterModel(): Nullable<FilterModel> {
        return this._injector.get(SheetsFilterService).getFilterModel(
            this._workbook.getUnitId(),
            this._worksheet.getSheetId()
        );
    }

    // #endregion

    // #region Comment
    /**
     * Get all comments in the current sheet
     * @returns all comments in the current sheet
     */
    getComments(): FThreadComment[] {
        const sheetsTheadCommentModel = this._injector.get(SheetsThreadCommentModel);
        const comments = sheetsTheadCommentModel.getSubUnitAll(this._workbook.getUnitId(), this._worksheet.getSheetId());
        return comments.map((comment) => this._injector.createInstance(FThreadComment, comment));
    }
    // #endregion

    /**
     * add a float dom to position
     * @param layer float dom config
     * @param id float dom id, if not given will be auto generated
     * @returns float dom id and dispose function
     */
    addFloatDomToPosition(layer: IFICanvasFloatDom, id?: string): Nullable<{
        id: string;
        dispose: () => void;
    }> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const { key, disposableCollection } = transformComponentKey(layer, this._injector.get(ComponentManager));
        const floatDomService = this._injector.get(SheetCanvasFloatDomManagerService);
        const res = floatDomService.addFloatDomToPosition({ ...layer, componentKey: key, unitId, subUnitId }, id);

        if (res) {
            disposableCollection.add(res.dispose);
            return {
                id: res.id,
                dispose: (): void => {
                    disposableCollection.dispose();
                    res.dispose();
                },
            };
        }

        disposableCollection.dispose();
        return null;
    }
}
