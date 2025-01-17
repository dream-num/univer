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

import type { CustomData, ICellData, IColumnData, IColumnRange, IDisposable, IFreeze, IObjectArrayPrimitiveType, IRange, IRowData, IRowRange, IStyleData, Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { ISetColDataCommandParams, ISetGridlinesColorCommandParams, ISetRangeValuesMutationParams, ISetRowDataCommandParams, ISetTextWrapCommandParams, IToggleGridlinesCommandParams } from '@univerjs/sheets';
import type { FDefinedName } from './f-defined-name';
import type { FWorkbook } from './f-workbook';
import { BooleanNumber, Direction, FBaseInitialable, ICommandService, ILogService, Inject, Injector, ObjectMatrix, RANGE_TYPE, WrapStrategy } from '@univerjs/core';
import { deserializeRangeWithSheet } from '@univerjs/engine-formula';
import { CancelFrozenCommand, ClearSelectionAllCommand, ClearSelectionContentCommand, ClearSelectionFormatCommand, copyRangeStyles, InsertColByRangeCommand, InsertRowByRangeCommand, MoveColsCommand, MoveRowsCommand, RemoveColByRangeCommand, RemoveRowByRangeCommand, SetColDataCommand, SetColHiddenCommand, SetColWidthCommand, SetFrozenCommand, SetGridlinesColorCommand, SetRangeValuesMutation, SetRowDataCommand, SetRowHeightCommand, SetRowHiddenCommand, SetSpecificColsVisibleCommand, SetSpecificRowsVisibleCommand, SetTabColorCommand, SetTextWrapCommand, SetWorksheetDefaultStyleMutation, SetWorksheetHideCommand, SetWorksheetNameCommand, SetWorksheetRowIsAutoHeightCommand, SetWorksheetRowIsAutoHeightMutation, SetWorksheetShowCommand, SheetsSelectionsService, ToggleGridlinesCommand } from '@univerjs/sheets';
import { FDefinedNameBuilder } from './f-defined-name';
import { FRange } from './f-range';
import { FSelection } from './f-selection';
import { covertToColRange, covertToRowRange } from './utils';

interface IFacadeClearOptions {
    contentsOnly?: boolean;
    formatOnly?: boolean;
}

/**
 * Represents a worksheet facade api instance. Which provides a set of methods to interact with the worksheet.
 */
export class FWorksheet extends FBaseInitialable {
    /**
     * Creates a new worksheet facade instance
     * @param {FWorkbook} _fWorkbook - The facade workbook instance
     * @param {Workbook} _workbook - The workbook instance
     * @param {Worksheet} _worksheet - The worksheet instance
     * @param {Injector} _injector - The injector instance
     * @param {SheetsSelectionsService} _selectionManagerService - The selection manager service
     * @param {ILogService} _logService - The log service
     * @param {ICommandService} _commandService - The command service
     */
    constructor(
        protected readonly _fWorkbook: FWorkbook,
        protected readonly _workbook: Workbook,
        protected readonly _worksheet: Worksheet,
        @Inject(Injector) protected override readonly _injector: Injector,
        @Inject(SheetsSelectionsService) protected readonly _selectionManagerService: SheetsSelectionsService,
        @Inject(ILogService) protected readonly _logService: ILogService,
        @ICommandService protected readonly _commandService: ICommandService
    ) {
        super(_injector);
    }

    /**
     * Returns the worksheet
     * @returns {Worksheet} The worksheet instance.
     * @example
     * ```typescript
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet().getSheet();
     * ```
     */
    getSheet(): Worksheet {
        return this._worksheet;
    }

    /**
     * Returns the injector
     * @returns {Injector} The injector
     * @example
     * ```typescript
     * const injector = univerAPI.getActiveWorkbook().getActiveSheet().getInject();
     * ```
     */
    getInject(): Injector {
        return this._injector;
    }

    /**
     * Returns the workbook
     * @returns {Workbook} The workbook instance.
     * @example
     * ```typescript
     * const workbook = univerAPI.getActiveWorkbook().getWorkbook();
     * ```
     */
    getWorkbook(): Workbook {
        return this._workbook;
    }

    /**
     * Returns the worksheet id.
     * @returns {string} The id of the worksheet.
     * @example
     * ```typescript
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * const id = sheet.getSheetId();
     * ```
     */
    getSheetId(): string {
        return this._worksheet.getSheetId();
    }

    /**
     * Returns the worksheet name.
     * @returns {string} The name of the worksheet.
     * @example
     * ```typescript
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * const name = sheet.getSheetName();
     * ```
     */
    getSheetName(): string {
        return this._worksheet.getName();
    }

    /**
     * Represents the selection ranges info of the worksheet.
     * @returns {FSelection} return the current selections of the worksheet or null if there is no selection.
     * @example
     * ```typescript
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * const selections = sheet.getSelection();
     * ```
     */
    getSelection(): FSelection | null {
        const selections = this._selectionManagerService.getCurrentSelections();
        if (!selections) {
            return null;
        }

        return this._injector.createInstance(FSelection, this._workbook, this._worksheet, selections);
    }

    // #region rows

    // #region default style

    /**
     * Get the default style of the worksheet
     * @returns {IStyleData} Default style of the worksheet.
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * const defaultStyle = sheet.getDefaultStyle();
     * ```
     */
    getDefaultStyle(): Nullable<IStyleData> | string {
        return this._worksheet.getDefaultCellStyle();
    }

    /**
     * Get the default style of the worksheet row
     * @param {number} index - The row index
     * @param {boolean} [keepRaw] - If true, return the raw style data maybe the style name or style data, otherwise return the data from row manager
     * @returns {(Nullable<IStyleData> | string)} The default style of the worksheet row name or style data
     * @example
     * ```typescript
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * // Get default style for row 0 (1)
     * const rowStyle = sheet.getRowDefaultStyle(0);
     * // Get raw style data for row 0
     * const rawRowStyle = sheet.getRowDefaultStyle(0, true);
     * ```
     */
    getRowDefaultStyle(index: number, keepRaw: boolean = false): Nullable<IStyleData> | string {
        return this._worksheet.getRowStyle(index, keepRaw);
    }

    /**
     * Get the default style of the worksheet column
     * @param {number} index - The column index
     * @param {boolean} [keepRaw] - If true, return the raw style data maybe the style name or style data, otherwise return the data from col manager
     * @returns {(Nullable<IStyleData> | string)} The default style of the worksheet column name or style data
     * @example
     * ```typescript
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * // Get default style for column 0 (A)
     * const colStyle = sheet.getColumnDefaultStyle(0);
     * // Get raw style data for column 0
     * const rawColStyle = sheet.getColumnDefaultStyle(0, true);
     * ```
     */
    getColumnDefaultStyle(index: number, keepRaw: boolean = false): Nullable<IStyleData> | string {
        return this._worksheet.getColumnStyle(index, keepRaw);
    }

    /**
     * Set the default style of the worksheet
     * @param {string} style - The style to set
     * @returns {FWorksheet} This worksheet instance for chaining
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * fWorksheet.setDefaultStyle('default');
     * ```
     */
    setDefaultStyle(style: string): FWorksheet {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        this._commandService.syncExecuteCommand(SetWorksheetDefaultStyleMutation.id, {
            unitId,
            subUnitId,
            defaultStyle: style,
        });
        this._worksheet.setDefaultCellStyle(style);
        return this;
    }

    /**
     * Set the default style of the worksheet row
     * @param {number} index - The row index
     * @param {string | Nullable<IStyleData>} style - The style name or style data
     * @returns {FWorksheet} This sheet, for chaining.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * fWorksheet.setRowDefaultStyle(0, 'default');
     * ```
     */
    setColumnDefaultStyle(index: number, style: string | Nullable<IStyleData>): FWorksheet {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();

        const params: ISetColDataCommandParams = {
            unitId,
            subUnitId,
            columnData: {
                [index]: {
                    s: style,
                },
            },
        };

        this._commandService.syncExecuteCommand(SetColDataCommand.id, params);
        return this;
    }

    /**
     * Set the default style of the worksheet column
     * @param {number} index - The column index
     * @param {string | Nullable<IStyleData>} style - The style name or style data
     * @returns {FWorksheet} This sheet, for chaining.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * fWorksheet.setColumnDefaultStyle(0, 'default');
     * ```
     */
    setRowDefaultStyle(index: number, style: string | Nullable<IStyleData>): FWorksheet {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();

        const params: ISetRowDataCommandParams = {
            unitId,
            subUnitId,
            rowData: {
                [index]: {
                    s: style,
                },
            },
        };

        this._commandService.syncExecuteCommand(SetRowDataCommand.id, params);
        return this;
    }

    // #endregion

    /**
     * Returns a Range object representing a single cell at the specified row and column.
     * @param {number} row - The row index of the cell.
     * @param {number} column - The column index of the cell.
     * @returns {FRange} A Range object representing the specified cell.
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Get range for cell at row 0, column 0 (A1)
     * const range = sheet.getRange(0, 0);
     * ```
     */
    getRange(row: number, column: number): FRange;
    /**
     * Returns a Range object representing a range starting at the specified row and column, with the specified number of rows.
     * @param {number} row - The starting row index of the range.
     * @param {number} column - The starting column index of the range.
     * @param {number} numRows - The number of rows in the range.
     * @returns {FRange} A Range object representing the specified range.
     */
    getRange(row: number, column: number, numRows: number): FRange;
    /**
     * Returns a Range object representing a range starting at the specified row and column, with the specified number of rows and columns.
     * @param {number} row - The starting row index of the range.
     * @param {number} column - The starting column index of the range.
     * @param {number} numRows - The number of rows in the range.
     * @param {number} numColumns - The number of columns in the range.
     * @returns {FRange} A Range object representing the specified range.
     */
    getRange(row: number, column: number, numRows: number, numColumns: number): FRange;
    /**
     * Returns a Range object specified by A1 notation.
     * @param {string} a1Notation - A string representing a range in A1 notation.
     * @returns {FRange} A Range object representing the specified range.
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Get range for cells A1:C3
     * const range = sheet.getRange("A1:C3");
     * // Get range for a single cell
     * const cell = sheet.getRange("B2");
     * // Get range with sheet name
     * const rangeWithSheet = sheet.getRange("Sheet1!A1:C3");
     * ```
     */
    getRange(a1Notation: string): FRange;
    /**
     * Returns a Range object for the specified range.
     * @param {IRange} range - The range specification.
     * @returns {FRange} A Range object representing the specified range.
     */
    getRange(range: IRange): FRange;
    getRange(rowOrA1Notation: IRange | number | string, column?: number, numRows?: number, numColumns?: number): FRange {
        let range: IRange;
        let sheet: Worksheet;

        if (typeof rowOrA1Notation === 'object') {
            range = rowOrA1Notation;
            sheet = this._worksheet;
        } else if (typeof rowOrA1Notation === 'string') {
            // A1 notation
            const { range: parsedRange, sheetName } = deserializeRangeWithSheet(rowOrA1Notation);

            const rangeSheet = sheetName ? this._workbook.getSheetBySheetName(sheetName) : this._worksheet;
            if (!rangeSheet) {
                throw new Error('Range not found');
            }
            sheet = rangeSheet;

            range = {
                ...parsedRange,
                unitId: this._workbook.getUnitId(),
                sheetId: sheet.getSheetId(),
                // Use the current range instead of the future actual range to match Apps Script behavior.
                // Users can create the latest range in real time when needed.
                rangeType: RANGE_TYPE.NORMAL,
                startRow: parsedRange.rangeType === RANGE_TYPE.COLUMN ? 0 : parsedRange.startRow,
                endRow: parsedRange.rangeType === RANGE_TYPE.COLUMN ? sheet.getMaxRows() - 1 : parsedRange.endRow,
                startColumn: parsedRange.rangeType === RANGE_TYPE.ROW ? 0 : parsedRange.startColumn,
                endColumn: parsedRange.rangeType === RANGE_TYPE.ROW ? sheet.getMaxColumns() - 1 : parsedRange.endColumn,
            };
        } else if (typeof rowOrA1Notation === 'number' && column !== undefined) {
            sheet = this._worksheet;
            // Range
            range = {
                startRow: rowOrA1Notation,
                endRow: rowOrA1Notation + (numRows ?? 1) - 1,
                startColumn: column,
                endColumn: column + (numColumns ?? 1) - 1,
                unitId: this._workbook.getUnitId(),
                sheetId: this._worksheet.getSheetId(),
            };
        } else {
            throw new Error('Invalid range specification');
        }

        return this._injector.createInstance(FRange, this._workbook, sheet, range);
    }

    /**
     * Returns the current number of columns in the sheet, regardless of content.
     * @returns {number} The maximum columns count of the sheet
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * const totalColumns = sheet.getMaxColumns();
     * console.log(`Sheet has ${totalColumns} columns`);
     * ```
     */
    getMaxColumns(): number {
        return this._worksheet.getMaxColumns();
    }

    /**
     * Returns the current number of rows in the sheet, regardless of content.
     * @returns {number}The maximum rows count of the sheet
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * const totalRows = sheet.getMaxRows();
     * console.log(`Sheet has ${totalRows} rows`);
     * ```
     */
    getMaxRows(): number {
        return this._worksheet.getMaxRows();
    }

    /**
     * Inserts a row after the given row position.
     * @param {number} afterPosition - The row after which the new row should be added, starting at 0 for the first row.
     * @returns {FWorksheet} This sheet, for chaining.
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Insert 3 rows at row index 2 (before the third row)
     * sheet.insertRowAfter(2);
     * // Insert 1 row at row index 0 (before the first row)
     * sheet.insertRowAfter(0);
     * ```
     */
    insertRowAfter(afterPosition: number): FWorksheet {
        return this.insertRowsAfter(afterPosition, 1);
    }

    /**
     * Inserts a row before the given row position.
     * @param {number} beforePosition - The row before which the new row should be added, starting at 0 for the first row.
     * @returns {FWorksheet} This sheet, for chaining.
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Insert 3 rows at row index 2 (before the third row)
     * sheet.insertRowBefore(2);
     * // Insert 1 row at row index 0 (before the first row)
     * sheet.insertRowBefore(0);
     * ```
     */
    insertRowBefore(beforePosition: number): FWorksheet {
        return this.insertRowsBefore(beforePosition, 1);
    }

    /**
     * Inserts one or more consecutive blank rows in a sheet starting at the specified location.
     * @param {number} rowIndex - The index indicating where to insert a row, starting at 0 for the first row.
     * @param {number} numRows - The number of rows to insert.
     * @returns {FWorksheet} This sheet, for chaining.
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Insert 3 rows at row index 2 (before the third row)
     * sheet.insertRows(2, 3);
     * // Insert 1 row at row index 0 (before the first row)
     * sheet.insertRows(0);
     * ```
     */
    insertRows(rowIndex: number, numRows: number = 1): FWorksheet {
        return this.insertRowsBefore(rowIndex, numRows);
    }

    /**
     * Inserts a number of rows after the given row position.
     * @param {number} afterPosition - The row after which the new rows should be added, starting at 0 for the first row.
     * @param {number} howMany - The number of rows to insert.
     * @returns {FWorksheet} This sheet, for chaining.
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Insert 3 rows at row index 2 (before the third row)
     * sheet.insertRowsAfter(2, 3);
     * // Insert 1 row at row index 0 (before the first row)
     * sheet.insertRowsAfter(0);
     * ```
     */
    insertRowsAfter(afterPosition: number, howMany: number): FWorksheet {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const direction = Direction.DOWN;

        const startRow = afterPosition + 1;
        const endRow = afterPosition + howMany;
        const startColumn = 0;
        const endColumn = this._worksheet.getColumnCount() - 1;

        // copy styles of the row below
        const cellValue = copyRangeStyles(this._worksheet, startRow, endRow, startColumn, endColumn, true, afterPosition);

        this._commandService.syncExecuteCommand(InsertRowByRangeCommand.id, {
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
     * @param {number} beforePosition - The row before which the new rows should be added, starting at 0 for the first row.
     * @param {number} howMany - The number of rows to insert.
     * @returns {FWorksheet} This sheet, for chaining.
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Insert 3 rows at row index 2 (before the third row)
     * sheet.insertRowsBefore(2, 3);
     * // Insert 1 row at row index 0 (before the first row)
     * sheet.insertRowsBefore(0);
     * ```
     */
    insertRowsBefore(beforePosition: number, howMany: number): FWorksheet {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const direction = Direction.UP;

        const startRow = beforePosition;
        const endRow = beforePosition + howMany - 1;
        const startColumn = 0;
        const endColumn = this._worksheet.getColumnCount() - 1;

        // copy styles of the row above
        const cellValue = copyRangeStyles(this._worksheet, startRow, endRow, startColumn, endColumn, true, beforePosition - 1);

        this._commandService.syncExecuteCommand(InsertRowByRangeCommand.id, {
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
     * @param {number} rowPosition - The position of the row, starting at 0 for the first row.
     * @returns {FWorksheet} This sheet, for chaining.
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Delete 3 rows at row index 2 (rows 3-5)
     * sheet.deleteRow(2);
     * // Delete 1 row at row index 0 (first row)
     * sheet.deleteRow(0);
     * ```
     */
    deleteRow(rowPosition: number): FWorksheet {
        return this.deleteRows(rowPosition, 1);
    }

    /**
     * Deletes a number of rows starting at the given row position.
     * @param {number} rowPosition - The position of the first row to delete, starting at 0 for the first row.
     * @param {number} howMany - The number of rows to delete.
     * @returns {FWorksheet} This sheet, for chaining.
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Delete 3 rows at row index 2 (rows 3-5)
     * sheet.deleteRows(2, 3);
     * // Delete 1 row at row index 0 (first row)
     * sheet.deleteRows(0);
     * ```
     */
    deleteRows(rowPosition: number, howMany: number): FWorksheet {
        const range = {
            startRow: rowPosition,
            endRow: rowPosition + howMany - 1,
            startColumn: 0,
            endColumn: this._worksheet.getColumnCount() - 1,
        };

        this._commandService.syncExecuteCommand(RemoveRowByRangeCommand.id, {
            range,
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
        });

        return this;
    }

    /**
     * Moves the rows selected by the given range to the position indicated by the destinationIndex. The rowSpec itself does not have to exactly represent an entire row or group of rows to move—it selects all rows that the range spans.
     * @param {FRange} rowSpec - A range spanning the rows that should be moved.
     * @param {number} destinationIndex - The index that the rows should be moved to. Note that this index is based on the coordinates before the rows are moved. Existing data is shifted down to make room for the moved rows while the source rows are removed from the grid. Therefore, the data may end up at a different index than originally specified. Use 0-index for this method.
     * @returns {FWorksheet} This sheet, for chaining.
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Move 3 rows at row index 2 (rows 3-5) to row index 0
     * sheet.moveRows(rowSpec, 0);
     * // Move 1 row at row index 0 (first row) to row index 2
     * sheet.moveRows(rowSpec, 2);
     * ```
     */
    moveRows(rowSpec: FRange, destinationIndex: number): FWorksheet {
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

        this._commandService.syncExecuteCommand(MoveRowsCommand.id, {
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
     * @param {FRange} row - The row range to hide.
     * @returns {FWorksheet} This sheet, for chaining.
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Hide 3 rows starting from row index 1 (rows 2-4)
     * sheet.hideRow(1);
     * // Hide single row at index 0 (first row)
     * sheet.hideRow(0);
     * ```
     */
    hideRow(row: FRange): FWorksheet {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const range = covertToRowRange(row.getRange(), this._worksheet);

        this._commandService.syncExecuteCommand(SetRowHiddenCommand.id, {
            unitId,
            subUnitId,
            ranges: [range],
        });

        return this;
    }

    /**
     * Hides one or more consecutive rows starting at the given index. Use 0-index for this method
     * @param {number} rowIndex - The starting index of the rows to hide
     * @param {number} numRow - The number of rows to hide
     * @returns {FWorksheet} This sheet, for chaining.
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Hide 3 rows starting from row index 1 (rows 2-4)
     * sheet.hideRows(1, 3);
     * // Hide single row at index 0 (first row)
     * sheet.hideRows(0);
     * ```
     */
    hideRows(rowIndex: number, numRow: number = 1): FWorksheet {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const range: IRange = {
            startRow: rowIndex,
            endRow: rowIndex + numRow - 1,
            startColumn: 0,
            endColumn: this._worksheet.getColumnCount() - 1,
            rangeType: RANGE_TYPE.ROW,
        };

        this._commandService.syncExecuteCommand(SetRowHiddenCommand.id, {
            unitId,
            subUnitId,
            ranges: [range],
        });
        return this;
    }

    /**
     * Make the row in the given range visible.
     * @param {FRange} row - The range to unhide, if hidden.
     * @returns {FWorksheet} This sheet, for chaining.
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Unhide 3 rows starting from row index 1 (rows 2-4)
     * sheet.unhideRow(1);
     * // Unhide single row at index 0 (first row)
     * sheet.unhideRow(0);
     * ```
     */
    unhideRow(row: FRange): FWorksheet {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const range = covertToRowRange(row.getRange(), this._worksheet);

        this._commandService.syncExecuteCommand(SetSpecificRowsVisibleCommand.id, {
            unitId,
            subUnitId,
            ranges: [range],
        });

        return this;
    }

    /**
     * Scrolling sheet to make specific rows visible.
     * @param {number} rowIndex - The starting index of the rows
     * @param {number} numRow - The number of rows
     * @returns {FWorksheet} This worksheet instance for chaining
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Show 3 rows starting from row index 1 (rows 2-4)
     * sheet.showRows(1);
     * // Show single row at index 0 (first row)
     * sheet.showRows(0);
     * ```
     */
    showRows(rowIndex: number, numRow: number = 1): FWorksheet {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const range: IRange = {
            startRow: rowIndex,
            endRow: rowIndex + numRow - 1,
            startColumn: 0,
            endColumn: this._worksheet.getColumnCount() - 1,
            rangeType: RANGE_TYPE.ROW,
        };

        this._commandService.syncExecuteCommand(SetSpecificRowsVisibleCommand.id, {
            unitId,
            subUnitId,
            ranges: [range],
        });

        return this;
    }

    /**
     * Sets the row height of the given row in pixels. By default, rows grow to fit cell contents. If you want to force rows to a specified height, use setRowHeightsForced(startRow, numRows, height).
     * @param {number} rowPosition - The row position to change.
     * @param {number} height - The height in pixels to set it to.
     * @returns {FWorksheet} This worksheet instance for chaining
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Set the height of the second row to 30 pixels
     * sheet.setRowHeight(1, 30);
     * // Set the height of the first row to 20 pixels
     * sheet.setRowHeight(0, 20);
     * ```
     */
    setRowHeight(rowPosition: number, height: number): FWorksheet {
        return this.setRowHeights(rowPosition, 1, height);
    }

    /**
     * Make certain row wrap and auto height.
     * @param rowPosition
     * @param auto
     * @returns {FWorksheet} this
     * @example
     * ```ts
     const fWorkbook = univerAPI.getActiveWorkbook();
     const fWorkSheet = fWorkbook.getActiveSheet();
     fWorkSheet.autoFitRow(24);
     * ```
     */
    autoFitRow(rowPosition: number, auto: BooleanNumber = BooleanNumber.TRUE): FWorksheet {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const ranges = [{
            startRow: rowPosition,
            endRow: rowPosition,
            startColumn: 0,
            endColumn: this._worksheet.getColumnCount() - 1,
        }];
        this._commandService.syncExecuteCommand(SetTextWrapCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: ranges[0],
            value: WrapStrategy.WRAP,
        } as ISetTextWrapCommandParams);
        this._commandService.syncExecuteCommand(SetWorksheetRowIsAutoHeightMutation.id,
            {
                unitId,
                subUnitId,
                ranges,
                autoHeightInfo: auto,
            });
        return this;
    }

    /**
     * Sets the height of the given rows in pixels.
     * By default, rows grow to fit cell contents. If you want to force rows to a specified height, use setRowHeightsForced(startRow, numRows, height).
     * @param {number} startRow - The starting row position to change
     * @param {number} numRows - The number of rows to change
     * @param {number} height - The height in pixels to set it to
     * @returns {FWorksheet} This worksheet instance for chaining
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * sheet.setRowHeights(1, 10, 30);
     * ```
     */
    setRowHeights(startRow: number, numRows: number, height: number): FWorksheet {
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
            this._commandService.syncExecuteCommand(SetRowHeightCommand.id, {
                unitId,
                subUnitId,
                ranges: rowHeightRanges,
                value: height,
            });
        }

        if (autoHeightRanges.length > 0) {
            this._commandService.syncExecuteCommand(SetWorksheetRowIsAutoHeightCommand.id, {
                unitId,
                subUnitId,
                ranges: autoHeightRanges,
            });
        }

        return this;
    }

    /**
     * Sets the height of the given rows to auto.
     * @param {number} startRow - The starting row position to change
     * @param {number} numRows - The number of rows to change
     * @returns {FWorksheet} This worksheet instance for chaining
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * sheet.setRowAutoHeight(1, 10);
     * ```
     */
    setRowAutoHeight(startRow: number, numRows: number): FWorksheet {
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

        this._commandService.syncExecuteCommand(SetWorksheetRowIsAutoHeightCommand.id, {
            unitId,
            subUnitId,
            ranges,
        });

        return this;
    }

    /**
     * Sets the height of the given rows in pixels. By default, rows grow to fit cell contents. When you use setRowHeightsForced, rows are forced to the specified height even if the cell contents are taller than the row height.
     * @param {number} startRow - The starting row position to change
     * @param {number} numRows - The number of rows to change
     * @param {number} height - The height in pixels to set it to
     * @returns {FWorksheet} This worksheet instance for chaining
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * sheet.setRowHeightsForced(1, 10, 30);
     * ```
     */
    setRowHeightsForced(startRow: number, numRows: number, height: number): FWorksheet {
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

        this._commandService.syncExecuteCommand(SetRowHeightCommand.id, {
            unitId,
            subUnitId,
            ranges,
            value: height,
        });

        return this;
    }

    // #endregion

    /**
     * Set custom properties for given rows.
     * @param {IObjectArrayPrimitiveType<CustomData>} custom - The custom properties to set
     * @returns {FWorksheet} This worksheet instance for chaining
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * fWorkSheet.setRowCustom({ key: 'value' });
     * ```
     */
    setRowCustom(custom: IObjectArrayPrimitiveType<CustomData>): FWorksheet {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();

        const rowData: IObjectArrayPrimitiveType<Nullable<IRowData>> = {};
        for (const [rowIndex, customData] of Object.entries(custom)) {
            rowData[Number(rowIndex)] = {
                custom: customData,
            };
        }

        const params: ISetRowDataCommandParams = {
            unitId,
            subUnitId,
            rowData,
        };

        this._commandService.syncExecuteCommand(SetRowDataCommand.id, params);

        return this;
    }

    // #region Column

    /**
     * Inserts a column after the given column position.
     * @param {number} afterPosition - The column after which the new column should be added, starting at 0 for the first column
     * @returns {FWorksheet} This worksheet instance for chaining
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Insert 3 columns at column index 2 (before column C)
     * sheet.insertColumnAfter(2);
     * // Insert 1 column at column index 0 (before column A)
     * sheet.insertColumnAfter(0);
     * ```
     */
    insertColumnAfter(afterPosition: number): FWorksheet {
        return this.insertColumnsAfter(afterPosition, 1);
    }

    /**
     * Inserts a column before the given column position.
     * @param {number} beforePosition - The column before which the new column should be added, starting at 0 for the first column
     * @returns {FWorksheet} This worksheet instance for chaining
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Insert 3 columns at column index 2 (before column C)
     * sheet.insertColumnBefore(2);
     * // Insert 1 column at column index 0 (before column A)
     * sheet.insertColumnBefore(0);
     * ```
     */
    insertColumnBefore(beforePosition: number): FWorksheet {
        return this.insertColumnsBefore(beforePosition, 1);
    }

    /**
     * Inserts one or more consecutive blank columns in a sheet starting at the specified location.
     * @param {number} columnIndex - The index indicating where to insert a column, starting at 0 for the first column
     * @param {number} numColumns - The number of columns to insert
     * @returns {FWorksheet} This sheet, for chaining
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Insert 3 columns at column index 2 (before column C)
     * sheet.insertColumns(2, 3);
     * // Insert 1 column at column index 0 (before column A)
     * sheet.insertColumns(0);
     * ```
     */
    insertColumns(columnIndex: number, numColumns: number = 1): FWorksheet {
        return this.insertColumnsBefore(columnIndex, numColumns);
    }

    /**
     * Inserts a given number of columns after the given column position.
     * @param {number} afterPosition - The column after which the new columns should be added, starting at 0 for the first column
     * @param {number} howMany - The number of columns to insert
     * @returns {FWorksheet} This sheet, for chaining
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Insert 3 columns at column index 2 (before column C)
     * sheet.insertColumnsAfter(2, 3);
     * // Insert 1 column at column index 0 (before column A)
     * sheet.insertColumnsAfter(0, 1);
     * ```
     */
    insertColumnsAfter(afterPosition: number, howMany: number): FWorksheet {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const direction = Direction.RIGHT;

        const startRow = 0;
        const endRow = this._worksheet.getRowCount() - 1;
        const startColumn = afterPosition + 1;
        const endColumn = afterPosition + howMany;

        // copy styles of the column to the right
        const cellValue = copyRangeStyles(this._worksheet, startRow, endRow, startColumn, endColumn, false, afterPosition);

        this._commandService.syncExecuteCommand(InsertColByRangeCommand.id, {
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
     * @param {number} beforePosition - The column before which the new columns should be added, starting at 0 for the first column
     * @param {number} howMany - The number of columns to insert
     * @returns {FWorksheet} This sheet, for chaining
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Insert 3 columns at column index 2 (before column C)
     * sheet.insertColumnsBefore(2, 3);
     * // Insert 1 column at column index 0 (before column A)
     * sheet.insertColumnsBefore(0, 1);
     * ```
     */
    insertColumnsBefore(beforePosition: number, howMany: number): FWorksheet {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const direction = Direction.LEFT;

        const startRow = 0;
        const endRow = this._worksheet.getRowCount() - 1;
        const startColumn = beforePosition;
        const endColumn = beforePosition + howMany - 1;

        // copy styles of the column to the left
        const cellValue = copyRangeStyles(this._worksheet, startRow, endRow, startColumn, endColumn, false, beforePosition - 1);

        this._commandService.syncExecuteCommand(InsertColByRangeCommand.id, {
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
     * @param {number} columnPosition - The position of the column, starting at 0 for the first column
     * @returns {FWorksheet} This sheet, for chaining
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Delete column C
     * sheet.deleteColumn(2);
     * // Delete column A
     * sheet.deleteColumn(0);
     * ```
     */
    deleteColumn(columnPosition: number): FWorksheet {
        return this.deleteColumns(columnPosition, 1);
    }

    /**
     * Deletes a number of columns starting at the given column position.
     * @param {number} columnPosition - The position of the first column to delete, starting at 0 for the first column
     * @param {number} howMany - The number of columns to delete
     * @returns {FWorksheet} This sheet, for chaining
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Delete 3 columns at column index 2 (columns C, D, E)
     * sheet.deleteColumns(2, 3);
     * // Delete 1 column at column index 0 (column A)
     * sheet.deleteColumns(0, 1);
     * ```
     */
    deleteColumns(columnPosition: number, howMany: number): FWorksheet {
        const range = {
            startRow: 0,
            endRow: this._worksheet.getRowCount() - 1,
            startColumn: columnPosition,
            endColumn: columnPosition + howMany - 1,
        };

        this._commandService.syncExecuteCommand(RemoveColByRangeCommand.id, {
            range,
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
        });

        return this;
    }

    /**
     * Moves the columns selected by the given range to the position indicated by the destinationIndex. The columnSpec itself does not have to exactly represent an entire column or group of columns to move—it selects all columns that the range spans.
     * @param {FRange} columnSpec - A range spanning the columns that should be moved
     * @param {number} destinationIndex - The index that the columns should be moved to. Note that this index is based on the coordinates before the columns are moved. Existing data is shifted right to make room for the moved columns while the source columns are removed from the grid. Therefore, the data may end up at a different index than originally specified. Use 0-index for this method
     * @returns {FWorksheet} This sheet, for chaining
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Move columns C, D, E to column index 2 (columns B, C, D)
     * sheet.moveColumns({ startColumn: 2, endColumn: 4 }, 1);
     * // Move column A to column index 0 (column A)
     * sheet.moveColumns({ startColumn: 0, endColumn: 0 }, 0);
     * ```
     */
    moveColumns(columnSpec: FRange, destinationIndex: number): FWorksheet {
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

        this._commandService.syncExecuteCommand(MoveColsCommand.id, {
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
     * @param {FRange} column - The column range to hide
     * @returns {FWorksheet} This sheet, for chaining
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Hide columns C, D, E
     * sheet.hideColumn({ startColumn: 2, endColumn: 4 });
     * // Hide column A
     * sheet.hideColumn({ startColumn: 0, endColumn: 0 });
     * ```
     */
    hideColumn(column: FRange): FWorksheet {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const range = covertToColRange(column.getRange(), this._worksheet);

        this._commandService.syncExecuteCommand(SetColHiddenCommand.id, {
            unitId,
            subUnitId,
            ranges: [range],
        });

        return this;
    }

    /**
     * Hides one or more consecutive columns starting at the given index. Use 0-index for this method
     * @param {number} columnIndex - The starting index of the columns to hide
     * @param {number} numColumn - The number of columns to hide
     * @returns {FWorksheet} This sheet, for chaining
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Hide columns C, D, E
     * sheet.hideColumns(2, 3);
     * // Hide column A
     * sheet.hideColumns(0, 1);
     * ```
     */
    hideColumns(columnIndex: number, numColumn: number = 1): FWorksheet {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const range: IRange = {
            startRow: 0,
            endRow: this._worksheet.getRowCount() - 1,
            startColumn: columnIndex,
            endColumn: columnIndex + numColumn - 1,
            rangeType: RANGE_TYPE.COLUMN,
        };

        this._commandService.syncExecuteCommand(SetColHiddenCommand.id, {
            unitId,
            subUnitId,
            ranges: [range],
        });

        return this;
    }

    /**
     * Show the column in the given range.
     * @param {FRange} column - The range to unhide, if hidden
     * @returns {FWorksheet} This sheet, for chaining
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Unhide columns C, D, E
     * sheet.unhideColumn({ startColumn: 2, endColumn: 4 });
     * // Unhide column A
     * sheet.unhideColumn({ startColumn: 0, endColumn: 0 });
     * ```
     */
    unhideColumn(column: FRange): FWorksheet {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const range = covertToColRange(column.getRange(), this._worksheet);

        this._commandService.syncExecuteCommand(SetSpecificColsVisibleCommand.id, {
            unitId,
            subUnitId,
            ranges: [range],
        });

        return this;
    }

    /**
     * Show one or more consecutive columns starting at the given index. Use 0-index for this method
     * @param {number} columnIndex - The starting index of the columns to unhide
     * @param {number} numColumn - The number of columns to unhide
     * @returns {FWorksheet} This sheet, for chaining
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Unhide columns C, D, E
     * sheet.unhideColumns(2, 3);
     * // Unhide column A
     * sheet.unhideColumns(0, 1);
     * ```
     */
    showColumns(columnIndex: number, numColumn: number = 1): FWorksheet {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const range: IRange = {
            startRow: 0,
            endRow: this._worksheet.getRowCount() - 1,
            startColumn: columnIndex,
            endColumn: columnIndex + numColumn - 1,
            rangeType: RANGE_TYPE.COLUMN,
        };

        this._commandService.syncExecuteCommand(SetSpecificColsVisibleCommand.id, {
            unitId,
            subUnitId,
            ranges: [range],
        });

        return this;
    }

    /**
     * Sets the width of the given column in pixels.
     * @param {number} columnPosition - The position of the given column to set
     * @param {number} width - The width in pixels to set it to
     * @returns {FWorksheet} This sheet, for chaining
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Set width of column B to 100 pixels
     * sheet.setColumnWidth(1, 100);
     * ```
     */
    setColumnWidth(columnPosition: number, width: number): FWorksheet {
        return this.setColumnWidths(columnPosition, 1, width);
    }

    /**
     * Sets the width of the given columns in pixels.
     * @param {number} startColumn - The starting column position to change
     * @param {number} numColumn - The number of columns to change
     * @param {number} width - The width in pixels to set it to
     * @returns {FWorksheet} This sheet, for chaining
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Set width of columns B-D (index 1-3) to 100 pixels
     * sheet.setColumnWidths(1, 3, 100);
     * ```
     */
    setColumnWidths(startColumn: number, numColumn: number, width: number): FWorksheet {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const ranges = [
            {
                startColumn,
                endColumn: startColumn + numColumn - 1,
                startRow: 0,
                endRow: this._worksheet.getRowCount() - 1,
            },
        ];

        this._commandService.syncExecuteCommand(SetColWidthCommand.id, {
            unitId,
            subUnitId,
            ranges,
            value: width,
        });

        return this;
    }

    // #endregion

    /**
     * Set custom properties for given columns.
     * @param {IObjectArrayPrimitiveType<CustomData>} custom - The custom properties to set
     * @returns {FWorksheet} This worksheet instance for chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * fWorkSheet.setColumnCustom({ 0: { key: 'value' } });
     * ```
     */
    setColumnCustom(custom: IObjectArrayPrimitiveType<CustomData>): FWorksheet {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();

        const columnData: IObjectArrayPrimitiveType<Nullable<IColumnData>> = {};
        for (const [columnIndex, customData] of Object.entries(custom)) {
            columnData[Number(columnIndex)] = {
                custom: customData,
            };
        }

        const params: ISetColDataCommandParams = {
            unitId,
            subUnitId,
            columnData,
        };

        this._commandService.syncExecuteCommand(SetColDataCommand.id, params);

        return this;
    }

    // #region merge cells

    /**
     * Get all merged cells in the current sheet
     * @returns {FRange[]} all merged cells
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Get all merged ranges in the sheet
     * const mergedRanges = sheet.getMergedRanges();
     * // Process each merged range
     * mergedRanges.forEach(range => {
     *   console.log(range.getA1Notation());
     * });
     * ```
     */
    getMergedRanges(): FRange[] {
        const snapshot = this._worksheet.getSnapshot();
        return snapshot.mergeData.map((merge) => this._injector.createInstance(FRange, this._workbook, this._worksheet, merge));
    }

    /**
     * Get the merged cell data of the specified row and column.
     * @param {number} row - The row index
     * @param {number} column - The column index
     * @returns {FRange|undefined} The merged cell data, or undefined if the cell is not merged
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * const merge = fWorkSheet.getCellMergeData(0, 0);
     * if (merge) {
     *   console.log('Merged range:', merge.getA1Notation());
     * }
     * ```
     */
    getCellMergeData(row: number, column: number): FRange | undefined {
        const worksheet = this._worksheet;
        const mergeData = worksheet.getMergedCell(row, column);
        if (mergeData) {
            return this._injector.createInstance(FRange, this._workbook, this._worksheet, mergeData);
        }
    }

    // #endregion

    /**
     * Returns the selected range in the active sheet, or null if there is no active range.
     * @returns {FRange | null} the active range
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Get the currently active range
     * const activeRange = sheet.getActiveRange();
     * if (activeRange) {
     *   console.log('Active range:', activeRange.getA1Notation());
     * }
     * ```
     */
    getActiveRange(): FRange | null {
        return this._fWorkbook.getActiveRange();
    }

    /**
     * Sets the active selection region for this sheet.
     * @param {FRange} range - The range to set as the active selection
     * @returns {FWorksheet} This sheet, for chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * fWorkSheet.setActiveRange(fWorkSheet.getRange('A1'));
     * ```
     */
    setActiveRange(range: FRange): FWorksheet {
        const { unitId, sheetId } = range.getRange();

        if (unitId !== this._workbook.getUnitId() || sheetId !== this._worksheet.getSheetId()) {
            throw new Error('Specified range must be part of the sheet.');
        }

        this._fWorkbook.setActiveRange(range);
        return this;
    }

    /**
     * Sets the active selection region for this sheet.
     * @param range - The range to set as the active selection
     * @returns This sheet, for chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * fWorkSheet.setActiveRange(fWorkSheet.getRange('A1'));
     * ```
     */
    setActiveSelection = this.setActiveRange;

    /**
     * Sets the frozen state of the current sheet.
     * @param {IFreeze} freeze - the scrolling viewport start range and count of freezed rows and columns.
     * that means if you want to freeze the first 3 rows and 2 columns, you should set freeze as { startRow: 3, startColumn: 2, xSplit: 2, ySplit: 3 }
     * @deprecated use `setFrozenRows` and `setFrozenColumns` instead.
     * @returns {FWorksheet} This worksheet instance for chaining
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Freeze first 3 rows and 2 columns
     * sheet.setFreeze({
     *   startRow: 3,
     *   startColumn: 2,
     *   xSplit: 2,
     *   ySplit: 3
     * });
     * ```
     */
    setFreeze(freeze: IFreeze): FWorksheet {
        this._logService.warn('setFreeze is deprecated, use setFrozenRows and setFrozenColumns instead');
        this._commandService.syncExecuteCommand(SetFrozenCommand.id, {
            ...freeze,
            unitId: this._workbook.getUnitId(),
            subUnitId: this.getSheetId(),
        });
        return this;
    }

    /**
     * Cancels the frozen state of the current sheet.
     * @returns {FWorksheet} This worksheet instance for chaining
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Cancel freeze
     * sheet.cancelFreeze();
     * ```
     */
    cancelFreeze(): FWorksheet {
        this._commandService.syncExecuteCommand(CancelFrozenCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this.getSheetId(),
        });

        return this;
    }

    /**
     * Get the freeze state of the current sheet.
     * @returns {IFreeze} The freeze state of the current sheet
     * @example
     * ```typescript
     * const sheet = workbook.getActiveSheet();
     * // Get the freeze state of the current sheet
     * const freeze = sheet.getFreeze();
     * console.log(freeze);
     * ```
     */
    getFreeze(): IFreeze {
        return this._worksheet.getFreeze();
    }

    /**
     * Set the number of frozen columns.
     * @param columns - The number of columns to freeze.
     * To unfreeze all columns, set this value to 0.
     * @returns {FWorksheet} This FWorksheet instance.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * // freeze the first 3 columns.
     * fWorkSheet.setFrozenColumns(3);
     * ```
     */
    setFrozenColumns(columns: number): FWorksheet;

    /**
     * Set freeze column, then the range from startColumn to endColumn will be fixed.
     * e.g. setFrozenColumns(0, 2) will fix the column range from 0 to 2.
     * e.g. setFrozenColumns(2, 3) will fix the column range from 2 to 3, And column from 0 to 1 will be invisible.
     * @param startColumn - The start column of the range to freeze
     * @param endColumn - The end column of the range to freeze
     * @returns {FWorksheet} This FWorksheet instance.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * // freeze the first too columns.
     * fWorkSheet.setFrozenColumns(0, 2);
     * ```
     */
    setFrozenColumns(startColumn: number, endColumn: number): FWorksheet;
    setFrozenColumns(...args: [number] | [number, number]): FWorksheet {
        const freezeCfg = this.getFreeze();
        if (arguments.length === 1) {
            const columns = args[0];
            this.setFreeze({
                ...freezeCfg,
                startColumn: columns > 0 ? columns : -1,
                xSplit: columns,
            });
        } else if (arguments.length === 2) {
            let [startColumn = 0, endColumn = 0] = args;
            if (startColumn > endColumn) {
                [startColumn, endColumn] = [endColumn, startColumn];
            }
            this._commandService.syncExecuteCommand(SetFrozenCommand.id, {
                startColumn: endColumn + 1,
                xSplit: endColumn - startColumn + 1,
                startRow: freezeCfg.startRow,
                ySplit: freezeCfg.ySplit,
                unitId: this._workbook.getUnitId(),
                subUnitId: this.getSheetId(),
            });
        }
        return this;
    }

    /**
     * Set the number of frozen rows.
     * @param rows - The number of rows to freeze.
     * To unfreeze all rows, set this value to 0.
     * @returns {FWorksheet} This FWorksheet instance.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * // freeze the first 3 rows.
     * fWorkSheet.setFrozenRows(3);
     * ```
     */
    setFrozenRows(rows: number): FWorksheet;

    /**
     * Set freeze row, then the range from startRow to endRow will be fixed.
     * e.g. setFrozenRows(0, 2) will fix the row range from 0 to 2.
     * e.g. setFrozenRows(2, 3) will fix the row range from 2 to 3, And row from 0 to 1 will be invisible.
     * @param startRow - The start row of the range to freeze
     * @param endRow - The end row of the range to freeze
     * @returns {FWorksheet} This FWorksheet instance.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * // freeze the first too rows.
     * fWorkSheet.setFrozenRows(0, 2);
     * ```
     */
    setFrozenRows(startRow: number, endRow: number): FWorksheet;
    setFrozenRows(...args: [number] | [number, number]): FWorksheet {
        const freezeCfg = this.getFreeze();
        if (arguments.length === 1) {
            const rows = args[0];
            this.setFreeze({
                ...freezeCfg,
                startRow: rows > 0 ? rows : -1,
                ySplit: rows,
            });
        } else if (arguments.length === 2) {
            let [startRow = 0, endRow = 0] = args;
            if (startRow > endRow) {
                [startRow, endRow] = [endRow, startRow];
            }
            this._commandService.syncExecuteCommand(SetFrozenCommand.id, {
                startRow: endRow + 1,
                ySplit: endRow - startRow + 1,
                startColumn: freezeCfg.startColumn,
                xSplit: freezeCfg.xSplit,
                unitId: this._workbook.getUnitId(),
                subUnitId: this.getSheetId(),
            });
        }
        return this;
    }

    /**
     * Get the number of frozen columns.
     * @returns {number} The number of frozen columns, returns 0 if no columns are frozen.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * // Get the number of frozen columns
     * const frozenColumns = fWorkSheet.getFrozenColumns();
     * console.log(frozenColumns);
     * ```
     */
    getFrozenColumns(): number {
        const freeze = this.getFreeze();
        if (freeze.startColumn === -1) {
            return 0;
        }
        return freeze.startColumn;
    }

    /**
     * Get the number of frozen rows.
     * @returns {number} The number of frozen rows. returns 0 if no rows are frozen.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * // Get the number of frozen rows
     * const frozenRows = fWorkSheet.getFrozenRows();
     * console.log(frozenRows);
     * ```
     */
    getFrozenRows(): number {
        const freeze = this.getFreeze();
        if (freeze.startRow === -1) {
            return 0;
        }
        return freeze.startRow;
    }

    /**
     * Get freezed rows.
     * @returns {IRowRange} The range of the frozen rows.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * // Get the range of the frozen rows
     * const frozenRows = fWorkSheet.getFrozenRowRange();
     * console.log(frozenRows);
     * ```
     */
    getFrozenRowRange(): IRowRange {
        const cfg = this._worksheet.getFreeze();
        return {
            startRow: cfg.startRow - cfg.ySplit,
            endRow: cfg.startRow - 1,
        };
    }

    /**
     * Get freezed columns
     * @returns {IColumnRange} The range of the frozen columns.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * // Get the range of the frozen columns
     * const frozenColumns = fWorkSheet.getFrozenColumnRange();
     * console.log(frozenColumns);
     * ```
     */
    getFrozenColumnRange(): IColumnRange {
        const cfg = this._worksheet.getFreeze();
        return {
            startColumn: cfg.startColumn - cfg.xSplit,
            endColumn: cfg.startColumn - 1,
        };
    }

    /**
     * Returns true if the sheet's gridlines are hidden; otherwise returns false. Gridlines are visible by default.
     * @returns {boolean} True if the sheet's gridlines are hidden; otherwise false.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * // check if the gridlines are hidden
     * if (fWorkSheet.hasHiddenGridLines()) {
     *    console.log('Gridlines are hidden');
     * }
     * ```
     */
    hasHiddenGridLines(): boolean {
        return this._worksheet.getConfig().showGridlines === BooleanNumber.FALSE;
    }

    /**
     * Hides or reveals the sheet gridlines.
     * @param {boolean} hidden - If `true`, hide gridlines in this sheet; otherwise show the gridlines.
     * @returns {FWorksheet} Returns the current worksheet instance for method chaining
     * @example
     * ``` ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * // hide the gridlines
     * fWorkSheet.setHiddenGridlines(true);
     * ```
     */
    setHiddenGridlines(hidden: boolean): FWorksheet {
        this._commandService.syncExecuteCommand(ToggleGridlinesCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            showGridlines: hidden ? BooleanNumber.FALSE : BooleanNumber.TRUE,
        } as IToggleGridlinesCommandParams);
        return this;
    }

    /**
     * Set the color of the gridlines in the sheet.
     * @param {string|undefined} color - The color to set for the gridlines.Undefined or null to reset to the default color.
     * @returns {FWorksheet} Returns the current worksheet instance for method chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * // set the gridlines color to red
     * fWorkSheet.setGridLinesColor('#ff0000');
     * ```
     */
    setGridLinesColor(color: string | undefined): FWorksheet {
        this._commandService.syncExecuteCommand(SetGridlinesColorCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            color,
        } as ISetGridlinesColorCommandParams);
        return this;
    }

    /**
     * Get the color of the gridlines in the sheet.
     * @returns {string | undefined} The color of the gridlines in the sheet or undefined. The default color is 'rgb(214, 216, 219)'.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * // get the gridlines color of the sheet
     * console.log(fWorkSheet.getGridLinesColor());
     * ```
     */
    getGridLinesColor(): string | undefined {
        return this._worksheet.getGridlinesColor() as string | undefined;
    }

    /**
     * Sets the sheet tab color.
     * @param {string|null|undefined} color - A color code in CSS notation (like '#ffffff' or 'white'), or null to reset the tab color.
     * @returns {FWorksheet} Returns the current worksheet instance for method chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * // set the tab color to red
     * fWorkSheet.setTabColor('#ff0000');
     * ```
     */
    setTabColor(color: string): FWorksheet {
        this._commandService.syncExecuteCommand(SetTabColorCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            color,
        });
        return this;
    }

    /**
     * Get the tab color of the sheet.
     * @returns {string} The tab color of the sheet or undefined.
     * The default color is css style property 'unset'.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * // get the tab color of the sheet
     * console.log(fWorkSheet.getTabColor());
     * ```
     */
    getTabColor(): string | undefined {
        return this._worksheet.getTabColor() as string | undefined;
    }

    // eslint-disable-next-line
    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.SheetValueChanged, callback)` instead
     */
    onCellDataChange(callback: (cellValue: ObjectMatrix<Nullable<ICellData>>) => void): IDisposable {
        const commandService = this._injector.get(ICommandService);
        return commandService.onCommandExecuted((command) => {
            if (command.id === SetRangeValuesMutation.id) {
                const params = command.params as ISetRangeValuesMutationParams;
                if (
                    params.unitId === this._workbook.getUnitId() &&
                    params.subUnitId === this._worksheet.getSheetId() &&
                    params.cellValue
                ) {
                    callback(new ObjectMatrix(params.cellValue));
                }
            }
        });
    }

    // eslint-disable-next-line
    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.SheetValueChanged, callback)` instead
     */
    onBeforeCellDataChange(callback: (cellValue: ObjectMatrix<Nullable<ICellData>>) => void): IDisposable {
        const commandService = this._injector.get(ICommandService);
        return commandService.beforeCommandExecuted((command) => {
            if (command.id === SetRangeValuesMutation.id) {
                const params = command.params as ISetRangeValuesMutationParams;
                if (params.unitId === this._workbook.getUnitId() && params.subUnitId === this._worksheet.getSheetId() && params.cellValue) {
                    callback(new ObjectMatrix(params.cellValue));
                }
            }
        });
    }

    /**
     * Hides this sheet. Has no effect if the sheet is already hidden. If this method is called on the only visible sheet, it throws an exception.
     * @returns {FWorksheet} Returns the current worksheet instance for method chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * // hide the active sheet
     * fWorkSheet.hideSheet();
     * ```
     */
    hideSheet(): FWorksheet {
        const commandService = this._injector.get(ICommandService);
        const workbook = this._workbook;
        const sheets = workbook.getSheets();
        const visibleSheets = sheets.filter((sheet) => sheet.isSheetHidden() !== BooleanNumber.TRUE);
        if (visibleSheets.length <= 1) {
            throw new Error('Cannot hide the only visible sheet');
        }

        commandService.syncExecuteCommand(SetWorksheetHideCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
        });

        return this;
    }

    /**
     * Shows this sheet. Has no effect if the sheet is already visible.
     * @returns {FWorksheet} Returns the current worksheet instance for method chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheets = fWorkbook.getSheets();
     * // show the last sheet
     * fWorkSheets[fWorkSheets.length - 1].showSheet();
     * ```
     */
    showSheet(): FWorksheet {
        const commandService = this._injector.get(ICommandService);
        commandService.syncExecuteCommand(SetWorksheetShowCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
        });
        return this;
    }

    /**
     * Returns true if the sheet is currently hidden.
     * @returns {boolean} True if the sheet is hidden; otherwise, false.
     */
    isSheetHidden(): boolean {
        return Boolean(this._worksheet.isSheetHidden() === BooleanNumber.TRUE);
    }

    /**
     * Sets the sheet name.
     * @param {string} name - The new name for the sheet.
     * @returns {FWorksheet} Returns the current worksheet instance for method chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * // set the sheet name to 'Sheet1'
     * fWorkSheet.setName('Sheet1');
     * ```
     */
    setName(name: string): FWorksheet {
        this._commandService.syncExecuteCommand(SetWorksheetNameCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            name,
        });

        return this;
    }

    /**
     * Activates this sheet. Does not alter the sheet itself, only the parent's notion of the active sheet.
     * @returns {FWorksheet} Current sheet, for chaining.
     */
    activate(): FWorksheet {
        this._fWorkbook.setActiveSheet(this);
        return this;
    }

    /**
     * Gets the position of the sheet in its parent spreadsheet. Starts at 0.
     * @returns {number} The position of the sheet in its parent spreadsheet.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * // get the position of the active sheet
     * const position = fWorkSheet.getIndex();
     * console.log(position); // 0
     * ```
     */
    getIndex(): number {
        return this._workbook.getSheetIndex(this._worksheet);
    }

    /**
     * Clears the sheet of content and formatting information.Or Optionally clears only the contents or only the formatting.
     * @param {IFacadeClearOptions} [options] - Options for clearing the sheet. If not provided, the contents and formatting are cleared both.
     * @param {boolean} [options.contentsOnly] - If true, the contents of the sheet are cleared. If false, the contents and formatting are cleared. Default is false.
     * @param {boolean} [options.formatOnly] - If true, the formatting of the sheet is cleared. If false, the contents and formatting are cleared. Default is false.
     * @returns {FWorksheet} Returns the current worksheet instance for method chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * // clear the sheet of content and formatting information
     * fWorkSheet.clear();
     * // clear the sheet of content only
     * fWorkSheet.clear({ contentsOnly: true });
     * ```
     */
    clear(options?: IFacadeClearOptions): FWorksheet {
        if (options && options.contentsOnly && !options.formatOnly) {
            this.clearContents();
        }

        if (options && options.formatOnly && !options.contentsOnly) {
            this.clearFormats();
        }

        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const commandService = this._injector.get(ICommandService);

        const range = {
            startRow: 0,
            endRow: this._worksheet.getRowCount() - 1,
            startColumn: 0,
            endColumn: this._worksheet.getColumnCount() - 1,
        };

        commandService.syncExecuteCommand(ClearSelectionAllCommand.id, {
            unitId,
            subUnitId,
            ranges: [range],
            options,
        });
        return this;
    }

    /**
     * Clears the sheet of contents, while preserving formatting information.
     * @returns {FWorksheet} Returns the current worksheet instance for method chaining
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * // clear the sheet of content only
     * fWorkSheet.clearContents();
     * ```
     */
    clearContents(): FWorksheet {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const commandService = this._injector.get(ICommandService);

        const range = {
            startRow: 0,
            endRow: this._worksheet.getRowCount() - 1,
            startColumn: 0,
            endColumn: this._worksheet.getColumnCount() - 1,
        };

        commandService.syncExecuteCommand(ClearSelectionContentCommand.id, {
            unitId,
            subUnitId,
            ranges: [range],
        });
        return this;
    }

    /**
     * Clears the sheet of formatting, while preserving contents.
     * @returns {FWorksheet} Returns the current worksheet instance for method chaining
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * // clear the sheet of formatting only
     * fWorkSheet.clearFormats();
     * ```
     */
    clearFormats(): FWorksheet {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const commandService = this._injector.get(ICommandService);

        const range = {
            startRow: 0,
            endRow: this._worksheet.getRowCount() - 1,
            startColumn: 0,
            endColumn: this._worksheet.getColumnCount() - 1,
        };

        commandService.syncExecuteCommand(ClearSelectionFormatCommand.id, {
            unitId,
            subUnitId,
            ranges: [range],
        });

        return this;
    }

    /**
     * Returns a Range corresponding to the dimensions in which data is present.
     * This is functionally equivalent to creating a Range bounded by A1 and (Sheet.getLastColumns(), Sheet.getLastRows()).
     * @returns {FRange} The range of the data in the sheet.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * // the sheet is a empty sheet
     * const cellRange = fWorkSheet.getRange(200, 10, 1, 1);
     * cellRange.setValue('Hello World');
     * console.log(fWorkSheet.getDataRange().getA1Notation()); // A1:J200
     * ```
     */
    getDataRange(): FRange {
        const lastRow = this.getLastRows();
        const lastColumn = this.getLastColumns();
        return this.getRange(0, 0, lastRow + 1, lastColumn + 1);
    }

    /**
     * Returns the position of the last column that has content.
     * @returns {number} the last column of the sheet that contains content.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * const fRange = fWorkSheet.getRange(100, 20, 1, 1);
     * console.log(fWorkSheet.getLastColumns()); // 20
     * ```
     */
    getLastColumns(): number {
        return this._worksheet.getLastColumnWithContent();
    }

    /**
     * @deprecated use getLastColumn instead.
     * Returns the position of the last column that has content. Same as getLastColumns.
     * @returns {number} the last column of the sheet that contains content.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * const fRange = fWorkSheet.getRange(100, 20, 1, 1);
     * console.log(fWorkSheet.getLastColumn());
     * ```
     */
    getLastColumn(): number {
        return this._worksheet.getLastColumnWithContent();
    }

    /**
     * @deprecated use getLastRow instead.
     * Returns the position of the last row that has content.
     * @returns {number} the last row of the sheet that contains content.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * const fRange = fWorkSheet.getRange(100,1,1,1);
     * fRange.setValue('Hello World');
     * console.log(fWorkSheet.getLastRows()); // 100
     */
    getLastRows(): number {
        return this._worksheet.getLastRowWithContent();
    }

    /**
     * Returns the position of the last row that has content, same as getLastRows().
     * @returns {number} the last row of the sheet that contains content.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * const fRange = fWorkSheet.getRange(100,1,1,1);
     * fRange.setValue('Hello World');
     * console.log(fWorkSheet.getLastRow());
     */
    getLastRow(): number {
        return this._worksheet.getLastRowWithContent();
    }

    /**
     * Judge whether provided FWorksheet is equal to current.
     * @param {FWorksheet} other - the FWorksheet to compare with.
     * @returns {boolean} true if the FWorksheet is equal to the current FWorksheet, false otherwise.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * const fWorkSheet2 = fWorkbook.getSheetByName('Sheet1');
     * console.log(fWorkSheet.equals(fWorkSheet2)); // true, if the active sheet is 'Sheet1'
     * ```
     */
    equalTo(other: FWorksheet): boolean {
        if (other instanceof FWorksheet) {
            return this._worksheet.getSheetId() === other.getSheetId() && this._workbook.getUnitId() === other.getWorkbook().getUnitId();
        }
        return false;
    }

    /*
    * Insert a defined name for worksheet.
     * @param {string} name - The name of the defined name to insert
     * @param {string} formulaOrRefString - The formula(=sum(A2:b10)) or reference(A1) string of the defined name to insert
     * @example
     * ```ts
     * // The code below inserts a defined name
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const sheet1 = activeSpreadsheet.getSheetByName('Sheet1');
     * sheet1.insertDefinedName('MyDefinedName', 'Sheet1!A1');
     * ```
     */
    insertDefinedName(name: string, formulaOrRefString: string): void {
        const definedNameBuilder = this._injector.createInstance(FDefinedNameBuilder);
        const param = definedNameBuilder.setName(name).setRef(formulaOrRefString).build();
        param.localSheetId = this.getSheetId();
        this._fWorkbook.insertDefinedNameBuilder(param);
    }

    /**
     * Get all the defined names in the worksheet.
     * @returns {FDefinedName[]} All the defined names in the worksheet
     * @example
     * ```ts
     * // The code below gets all the defined names in the worksheet
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const sheet1 = activeSpreadsheet.getSheetByName('Sheet1');
     * const definedNames = sheet1.getDefinedNames();
     * ```
     */
    getDefinedNames(): FDefinedName[] {
        const names = this._fWorkbook.getDefinedNames();
        return names.filter((name) => name.getLocalSheetId() === this.getSheetId());
    }

    /**
     * Set custom metadata of worksheet
     * @param {CustomData | undefined} custom - custom metadata
     * @returns {FWorksheet}
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * fWorkSheet.setCustomMetadata({ key: 'value' });
     * ```
     */
    setCustomMetadata(custom: CustomData | undefined): FWorksheet {
        this._worksheet.setCustomMetadata(custom);
        return this;
    }

    /**
     * Set custom metadata of row
     * @param {number} index - row index
     * @param {CustomData | undefined} custom - custom metadata
     * @returns {FWorksheet} Current worksheet, for chaining.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * fWorkSheet.setRowCustomMetadata(0, { key: 'value' });
     * ```
     */
    setRowCustomMetadata(index: number, custom: CustomData | undefined): FWorksheet {
        this._worksheet.getRowManager().setCustomMetadata(index, custom);
        return this;
    }

    /**
     * Set custom metadata of column
     * @param {number} index - column index
     * @param {CustomData | undefined} custom - custom metadata
     * @returns {FWorksheet} Current worksheet, for chaining.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * fWorkSheet.setColumnCustomMetadata(0, { key: 'value' });
     * ```
     */
    setColumnCustomMetadata(index: number, custom: CustomData | undefined): FWorksheet {
        this._worksheet.getColumnManager().setCustomMetadata(index, custom);
        return this;
    }

    /**
     * Get custom metadata of row
     * @param {number} index - row index
     * @returns {CustomData | undefined} custom metadata
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * const custom = fWorkSheet.getRowCustomMetadata(0);
     * ```
     */
    getRowCustomMetadata(index: number): CustomData | undefined {
        return this._worksheet.getRowManager().getCustomMetadata(index);
    }

    /**
     * Get custom metadata of column
     * @param {number} index - column index
     * @returns {CustomData | undefined} custom metadata
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * const custom = fWorkSheet.getColumnCustomMetadata(0);
     * ```
     */
    getColumnCustomMetadata(index: number): CustomData | undefined {
        return this._worksheet.getColumnManager().getCustomMetadata(index);
    }

    /**
     * Get all merged cells in the current worksheet
     * @returns {FRange[]} All the merged cells in the worksheet
     * @example
     * ```ts
     * const workbook = univerAPI.getActiveWorkbook();
     * const worksheet = workbook.getActiveSheet();
     * const rangeFirst = worksheet.getRange(0, 0, 2, 2);
     * const mergeFirst = rangeFirst.merge();
     * const rangeSecond = worksheet.getRange(5, 0, 2, 2);
     * const mergeSecond = rangeSecond.merge();
     * const mergeData = worksheet.getMergeData();
     * console.log('debugger', mergeData);
     * ```
     */
    getMergeData(): FRange[] {
        return this._worksheet.getMergeData().map((merge) => this._injector.createInstance(FRange, this._workbook, this._worksheet, merge));
    }
}
