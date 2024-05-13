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

import { ICommandService, type IRange, type Workbook, type Worksheet } from '@univerjs/core';
import type { ISetWorksheetColWidthMutationParams, ISetWorksheetRowHeightMutationParams } from '@univerjs/sheets';
import { SelectionManagerService, SetWorksheetColWidthMutation, SetWorksheetRowHeightMutation } from '@univerjs/sheets';
import { Inject, Injector } from '@wendellhu/redi';

import { FRange } from './f-range';
import { FSelection } from './f-selection';

export class FWorksheet {
    constructor(
        private readonly _workbook: Workbook,
        private readonly _worksheet: Worksheet,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        // empty
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
        const selections = this._selectionManagerService.getSelections();
        if (!selections) {
            return null;
        }

        return this._injector.createInstance(FSelection, this._workbook, this._worksheet, selections);
    }

    getRange(row: number, col: number, height?: number, width?: number): FRange | null {
        const range: IRange = {
            startRow: row,
            endRow: row + (height ?? 1) - 1,
            startColumn: col,
            endColumn: col + (width ?? 1) - 1,
        };

        return this._injector.createInstance(FRange, this._workbook, this._worksheet, range);
    }

    setRowHeights(startRow: number, numRows: number, height: number) {
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

    setColumnWidths(startColumn: number, numColumns: number, width: number) {
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
    getMaxColumns() {
        return this._worksheet.getMaxColumns();
    }

    /**
     * Returns the current number of rows in the sheet, regardless of content.
     * @return The maximum rows count of the sheet
     */
    getMaxRows() {
        return this._worksheet.getMaxRows();
    }
}
