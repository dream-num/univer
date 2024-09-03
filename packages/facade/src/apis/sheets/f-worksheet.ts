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
import { copyRangeStyles, InsertColCommand, InsertRowCommand, MoveColsCommand, MoveRowsCommand, RemoveColCommand, RemoveRowCommand, SetColHiddenCommand, SetColWidthCommand, SetRowHeightCommand, SetRowHiddenCommand, SetSpecificColsVisibleCommand, SetSpecificRowsVisibleCommand, SetWorksheetRowIsAutoHeightCommand, SheetsSelectionsService } from '@univerjs/sheets';
import { Direction, ICommandService, Inject, Injector, RANGE_TYPE } from '@univerjs/core';

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
import { covertToColRange, covertToRowRange, transformComponentKey } from './utils';

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
    // #region Row

    /**
     * Inserts a row after the given row position.
     * @param afterPosition The row after which the new row should be added, starting at 0 for the first row.
     * @returns This sheet, for chaining.
     */
    async insertRowAfter(afterPosition: number): Promise<FWorksheet> {
        return this.insertRowsAfter(afterPosition, 1);
    }

    /**
     * Inserts a row before the given row position.
     * @param beforePosition The row before which the new row should be added, starting at 0 for the first row.
     * @returns This sheet, for chaining.
     */
    async insertRowBefore(beforePosition: number): Promise<FWorksheet> {
        return this.insertRowsBefore(beforePosition, 1);
    }

    /**
     * Inserts one or more consecutive blank rows in a sheet starting at the specified location.
     * @param rowIndex The index indicating where to insert a row, starting at 0 for the first row.
     * @param numRows The number of rows to insert.
     * @returns This sheet, for chaining.
     */
    async insertRows(rowIndex: number, numRows: number = 1): Promise<FWorksheet> {
        return this.insertRowsBefore(rowIndex, numRows);
    }

    /**
     * Inserts a number of rows after the given row position.
     * @param afterPosition The row after which the new rows should be added, starting at 0 for the first row.
     * @param howMany The number of rows to insert.
     * @returns This sheet, for chaining.
     */
    async insertRowsAfter(afterPosition: number, howMany: number): Promise<FWorksheet> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const direction = Direction.DOWN;

        const startRow = afterPosition + 1;
        const endRow = afterPosition + howMany;
        const startColumn = 0;
        const endColumn = this._worksheet.getColumnCount() - 1;

        // copy styles of the row below
        const cellValue = copyRangeStyles(this._worksheet, startRow, endRow, startColumn, endColumn, true, afterPosition);

        await this._commandService.executeCommand(InsertRowCommand.id, {
            unitId,
            subUnitId,
            direction,
            range: {
                startRow,
                endRow,
                startColumn,
                endColumn,
            },
            cellValue,
        });

        return this;
    }

    /**
     * Inserts a number of rows before the given row position.
     * @param beforePosition The row before which the new rows should be added, starting at 0 for the first row.
     * @param howMany The number of rows to insert.
     * @returns This sheet, for chaining.
     */
    async insertRowsBefore(beforePosition: number, howMany: number): Promise<FWorksheet> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const direction = Direction.UP;

        const startRow = beforePosition;
        const endRow = beforePosition + howMany - 1;
        const startColumn = 0;
        const endColumn = this._worksheet.getColumnCount() - 1;

        // copy styles of the row above
        const cellValue = copyRangeStyles(this._worksheet, startRow, endRow, startColumn, endColumn, true, beforePosition - 1);

        await this._commandService.executeCommand(InsertRowCommand.id, {
            unitId,
            subUnitId,
            direction,
            range: {
                startRow,
                endRow,
                startColumn,
                endColumn,
            },
            cellValue,
        });

        return this;
    }

    /**
     * Deletes the row at the given row position.
     * @param rowPosition The position of the row, starting at 0 for the first row.
     * @returns This sheet, for chaining.
     */
    async deleteRow(rowPosition: number): Promise<FWorksheet> {
        return this.deleteRows(rowPosition, 1);
    }

    /**
     * Deletes a number of rows starting at the given row position.
     * @param rowPosition The position of the first row to delete, starting at 0 for the first row.
     * @param howMany The number of rows to delete.
     * @returns This sheet, for chaining.
     */
    async deleteRows(rowPosition: number, howMany: number): Promise<FWorksheet> {
        const range = {
            startRow: rowPosition,
            endRow: rowPosition + howMany - 1,
            startColumn: 0,
            endColumn: this._worksheet.getColumnCount() - 1,
        };

        await this._commandService.executeCommand(RemoveRowCommand.id, {
            range,
        });

        return this;
    }

    /**
     * Moves the rows selected by the given range to the position indicated by the destinationIndex. The rowSpec itself does not have to exactly represent an entire row or group of rows to move—it selects all rows that the range spans.
     * @param rowSpec A range spanning the rows that should be moved.
     * @param destinationIndex The index that the rows should be moved to. Note that this index is based on the coordinates before the rows are moved. Existing data is shifted down to make room for the moved rows while the source rows are removed from the grid. Therefore, the data may end up at a different index than originally specified. Use 0-index for this method.
     * @returns This sheet, for chaining.
     */
    async moveRows(rowSpec: FRange, destinationIndex: number): Promise<FWorksheet> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const range = covertToRowRange(rowSpec.getRange(), this._worksheet);
        const fromRange = range;
        const toRange = {
            startRow: destinationIndex,
            endRow: destinationIndex,
            startColumn: range.startColumn,
            endColumn: range.endColumn,
        };

        await this._commandService.executeCommand(MoveRowsCommand.id, {
            unitId,
            subUnitId,
            range,
            fromRange,
            toRange,
        });

        return this;
    }

    /**
     * Hides the rows in the given range.
     * @param row The row range to hide.
     * @returns This sheet, for chaining.
     */
    async hideRow(row: FRange): Promise<FWorksheet> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const range = covertToRowRange(row.getRange(), this._worksheet);

        await this._commandService.executeCommand(SetRowHiddenCommand.id, {
            unitId,
            subUnitId,
            ranges: [range],
        });

        return this;
    }

    /**
     * Hides one or more consecutive rows starting at the given index. Use 0-index for this method.
     * @param rowIndex The starting index of the rows to hide.
     * @param numRows The number of rows to hide.
     * @returns This sheet, for chaining.
     */
    async hideRows(rowIndex: number, numRows: number = 1): Promise<FWorksheet> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const range: IRange = {
            startRow: rowIndex,
            endRow: rowIndex + numRows - 1,
            startColumn: 0,
            endColumn: this._worksheet.getColumnCount() - 1,
            rangeType: RANGE_TYPE.ROW,
        };

        await this._commandService.executeCommand(SetRowHiddenCommand.id, {
            unitId,
            subUnitId,
            ranges: [range],
        });
        return this;
    }

    /**
     * Unhides the row in the given range.
     * @param row The range to unhide, if hidden.
     * @returns This sheet, for chaining.
     */
    async unhideRow(row: FRange): Promise<FWorksheet> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const range = covertToRowRange(row.getRange(), this._worksheet);

        await this._commandService.executeCommand(SetSpecificRowsVisibleCommand.id, {
            unitId,
            subUnitId,
            ranges: [range],
        });

        return this;
    }

    /**
     * Unhides one or more consecutive rows starting at the given index. Use 0-index for this method.
     * @param rowIndex The starting index of the rows to unhide.
     * @param numRows The number of rows to unhide.
     * @returns This sheet, for chaining.
     */
    async showRows(rowIndex: number, numRows: number = 1): Promise<FWorksheet> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const range: IRange = {
            startRow: rowIndex,
            endRow: rowIndex + numRows - 1,
            startColumn: 0,
            endColumn: this._worksheet.getColumnCount() - 1,
            rangeType: RANGE_TYPE.ROW,
        };

        await this._commandService.executeCommand(SetSpecificRowsVisibleCommand.id, {
            unitId,
            subUnitId,
            ranges: [range],
        });

        return this;
    }

    /**
     * Sets the row height of the given row in pixels. By default, rows grow to fit cell contents. If you want to force rows to a specified height, use setRowHeightsForced(startRow, numRows, height).
     * @param rowPosition The row position to change.
     * @param height The height in pixels to set it to.
     * @returns This sheet, for chaining.
     */
    async setRowHeight(rowPosition: number, height: number): Promise<FWorksheet> {
        return this.setRowHeights(rowPosition, 1, height);
    }

    /**
     * Sets the height of the given rows in pixels. By default, rows grow to fit cell contents. If you want to force rows to a specified height, use setRowHeightsForced(startRow, numRows, height).
     * @param startRow The starting row position to change.
     * @param numRows The number of rows to change.
     * @param height The height in pixels to set it to.
     * @returns This sheet, for chaining.
     */
    async setRowHeights(startRow: number, numRows: number, height: number): Promise<FWorksheet> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const rowManager = this._worksheet.getRowManager();

        const autoHeightRanges: IRange[] = [];
        const rowHeightRanges: IRange[] = [];

        for (let i = startRow; i < startRow + numRows; i++) {
            const autoRowHeight = rowManager.getRow(i)?.ah || this._worksheet.getConfig().defaultRowHeight;
            const range = {
                startRow: i,
                endRow: i,
                startColumn: 0,
                endColumn: this._worksheet.getColumnCount() - 1,
            };

            // if the new height is less than the current height, set auto height
            if (height <= autoRowHeight) {
                autoHeightRanges.push(range);
            } else { // if the new height is greater than the current height, set the new height
                rowHeightRanges.push(range);
            }
        }

        if (rowHeightRanges.length > 0) {
            await this._commandService.executeCommand(SetRowHeightCommand.id, {
                unitId,
                subUnitId,
                ranges: rowHeightRanges,
                value: height,
            });
        }

        if (autoHeightRanges.length > 0) {
            await this._commandService.executeCommand(SetWorksheetRowIsAutoHeightCommand.id, {
                unitId,
                subUnitId,
                ranges: autoHeightRanges,
            });
        }

        return this;
    }

    /**
     * Sets the height of the given rows in pixels. By default, rows grow to fit cell contents. When you use setRowHeightsForced, rows are forced to the specified height even if the cell contents are taller than the row height.
     * @param startRow The starting row position to change.
     * @param numRows The number of rows to change.
     * @param height The height in pixels to set it to.
     * @returns This sheet, for chaining.
     */
    async setRowHeightsForced(startRow: number, numRows: number, height: number): Promise<FWorksheet> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const ranges = [
            {
                startRow,
                endRow: startRow + numRows - 1,
                startColumn: 0,
                endColumn: this._worksheet.getColumnCount() - 1,
            },
        ];

        await this._commandService.executeCommand(SetRowHeightCommand.id, {
            unitId,
            subUnitId,
            ranges,
            value: height,
        });

        return this;
    }

    // #endregion

    // #region Column

    /**
     * Inserts a column after the given column position.
     * @param afterPosition The column after which the new column should be added, starting at 0 for the first column.
     * @returns This sheet, for chaining.
     */
    async insertColumnAfter(afterPosition: number): Promise<FWorksheet> {
        return this.insertColumnsAfter(afterPosition, 1);
    }

    /**
     * Inserts a column before the given column position.
     * @param beforePosition The column before which the new column should be added, starting at 0 for the first column.
     * @returns This sheet, for chaining.
     */
    async insertColumnBefore(beforePosition: number): Promise<FWorksheet> {
        return this.insertColumnsBefore(beforePosition, 1);
    }

    /**
     * Inserts one or more consecutive blank columns in a sheet starting at the specified location.
     * @param columnIndex The index indicating where to insert a column, starting at 0 for the first column.
     * @param numColumns The number of columns to insert.
     * @returns This sheet, for chaining.
     */
    async insertColumns(columnIndex: number, numColumns: number = 1): Promise<FWorksheet> {
        return this.insertColumnsBefore(columnIndex, numColumns);
    }

    /**
     * Inserts a given number of columns after the given column position.
     * @param afterPosition The column after which the new column should be added, starting at 0 for the first column.
     * @param howMany The number of columns to insert.
     * @returns This sheet, for chaining.
     */
    async insertColumnsAfter(afterPosition: number, howMany: number): Promise<FWorksheet> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const direction = Direction.RIGHT;

        const startRow = 0;
        const endRow = this._worksheet.getRowCount() - 1;
        const startColumn = afterPosition + 1;
        const endColumn = afterPosition + howMany;

        // copy styles of the column to the right
        const cellValue = copyRangeStyles(this._worksheet, startRow, endRow, startColumn, endColumn, false, afterPosition);

        await this._commandService.executeCommand(InsertColCommand.id, {
            unitId,
            subUnitId,
            direction,
            range: {
                startRow,
                endRow,
                startColumn,
                endColumn,
            },
            cellValue,
        });

        return this;
    }

    /**
     * Inserts a number of columns before the given column position.
     * @param beforePosition The column before which the new column should be added, starting at 0 for the first column.
     * @param howMany The number of columns to insert.
     * @returns This sheet, for chaining.
     */
    async insertColumnsBefore(beforePosition: number, howMany: number): Promise<FWorksheet> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const direction = Direction.LEFT;

        const startRow = 0;
        const endRow = this._worksheet.getRowCount() - 1;
        const startColumn = beforePosition;
        const endColumn = beforePosition + howMany - 1;

        // copy styles of the column to the left
        const cellValue = copyRangeStyles(this._worksheet, startRow, endRow, startColumn, endColumn, false, beforePosition - 1);

        await this._commandService.executeCommand(InsertColCommand.id, {
            unitId,
            subUnitId,
            direction,
            range: {
                startRow,
                endRow,
                startColumn,
                endColumn,
            },
            cellValue,
        });

        return this;
    }

    /**
     * Deletes the column at the given column position.
     * @param columnPosition The position of the column, starting at 0 for the first column.
     * @returns This sheet, for chaining.
     */
    async deleteColumn(columnPosition: number): Promise<FWorksheet> {
        return this.deleteColumns(columnPosition, 1);
    }

    /**
     * Deletes a number of columns starting at the given column position.
     * @param columnPosition The position of the first column to delete, starting at 0 for the first column.
     * @param howMany The number of columns to delete.
     * @returns This sheet, for chaining.
     */
    async deleteColumns(columnPosition: number, howMany: number): Promise<FWorksheet> {
        const range = {
            startRow: 0,
            endRow: this._worksheet.getRowCount() - 1,
            startColumn: columnPosition,
            endColumn: columnPosition + howMany - 1,
        };

        await this._commandService.executeCommand(RemoveColCommand.id, {
            range,
        });

        return this;
    }

    /**
     * Moves the columns selected by the given range to the position indicated by the destinationIndex. The columnSpec itself does not have to exactly represent an entire column or group of columns to move—it selects all columns that the range spans.
     * @param columnSpec A range spanning the columns that should be moved.
     * @param destinationIndex The index that the columns should be moved to. Note that this index is based on the coordinates before the columns are moved. Existing data is shifted right to make room for the moved columns while the source columns are removed from the grid. Therefore, the data may end up at a different index than originally specified. Use 0-index for this method.
     * @returns This sheet, for chaining.
     */
    async moveColumns(columnSpec: FRange, destinationIndex: number): Promise<FWorksheet> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const range = covertToColRange(columnSpec.getRange(), this._worksheet);
        const fromRange = range;
        const toRange = {
            startRow: 0,
            endRow: this._worksheet.getRowCount() - 1,
            startColumn: destinationIndex,
            endColumn: destinationIndex,
        };

        await this._commandService.executeCommand(MoveColsCommand.id, {
            unitId,
            subUnitId,
            range,
            fromRange,
            toRange,
        });

        return this;
    }

    /**
     * Hides the column or columns in the given range.
     * @param column The column range to hide.
     * @returns This sheet, for chaining.
     */
    async hideColumn(column: FRange): Promise<FWorksheet> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const range = covertToColRange(column.getRange(), this._worksheet);

        await this._commandService.executeCommand(SetColHiddenCommand.id, {
            unitId,
            subUnitId,
            ranges: [range],
        });

        return this;
    }

    /**
     * Hides one or more consecutive columns starting at the given index. Use 0-index for this method.
     * @param columnIndex The starting index of the columns to hide.
     * @param numColumns The number of columns to hide.
     * @returns This sheet, for chaining.
     */
    async hideColumns(columnIndex: number, numColumns: number = 1): Promise<FWorksheet> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const range: IRange = {
            startRow: 0,
            endRow: this._worksheet.getRowCount() - 1,
            startColumn: columnIndex,
            endColumn: columnIndex + numColumns - 1,
            rangeType: RANGE_TYPE.COLUMN,
        };

        await this._commandService.executeCommand(SetColHiddenCommand.id, {
            unitId,
            subUnitId,
            ranges: [range],
        });

        return this;
    }

    /**
     * Unhides the column in the given range.
     * @param column The range to unhide, if hidden.
     * @returns This sheet, for chaining.
     */
    async unhideColumn(column: FRange): Promise<FWorksheet> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const range = covertToColRange(column.getRange(), this._worksheet);

        await this._commandService.executeCommand(SetSpecificColsVisibleCommand.id, {
            unitId,
            subUnitId,
            ranges: [range],
        });

        return this;
    }

    /**
     * Unhides one or more consecutive columns starting at the given index. Use 0-index for this method.
     * @param columnIndex The starting index of the columns to unhide.
     * @param numColumns The number of columns to unhide.
     * @returns This sheet, for chaining.
     */
    async showColumns(columnIndex: number, numColumns: number = 1): Promise<FWorksheet> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const range: IRange = {
            startRow: 0,
            endRow: this._worksheet.getRowCount() - 1,
            startColumn: columnIndex,
            endColumn: columnIndex + numColumns - 1,
            rangeType: RANGE_TYPE.COLUMN,
        };

        await this._commandService.executeCommand(SetSpecificColsVisibleCommand.id, {
            unitId,
            subUnitId,
            ranges: [range],
        });

        return this;
    }

    /**
     * Sets the width of the given column in pixels.
     * @param columnPosition The position of the given column to set.
     * @param width The width in pixels to set it to.
     * @returns This sheet, for chaining.
     */
    async setColumnWidth(columnPosition: number, width: number): Promise<FWorksheet> {
        return this.setColumnWidths(columnPosition, 1, width);
    }

    /**
     * Sets the width of the given columns in pixels.
     * @param startColumn The starting column position to change.
     * @param numColumns The number of columns to change.
     * @param width The width in pixels to set it to.
     * @returns This sheet, for chaining.
     */
    async setColumnWidths(startColumn: number, numColumns: number, width: number): Promise<FWorksheet> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const ranges = [
            {
                startColumn,
                endColumn: startColumn + numColumns - 1,
                startRow: 0,
                endRow: this._worksheet.getRowCount() - 1,
            },
        ];

        await this._commandService.executeCommand(SetColWidthCommand.id, {
            unitId,
            subUnitId,
            ranges,
            value: width,
        });

        return this;
    }

    // #endregion

    // #region merge cells

    /**
     * Get all merged cells in the current sheet
     * @returns all merged cells
     */
    getMergeCells(): IRange[] {
        const snapshot = this._worksheet.getSnapshot();
        return snapshot.mergeData;
    }

    // #endregion
}
