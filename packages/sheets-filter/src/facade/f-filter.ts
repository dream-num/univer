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

import type { Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { ISheetCommandSharedParams } from '@univerjs/sheets';
import type { FilterModel, IFilterColumn, ISetSheetsFilterCriteriaCommandParams } from '@univerjs/sheets-filter';

import { ICommandService, Inject, Injector } from '@univerjs/core';
import { ClearSheetsFilterCriteriaCommand, RemoveSheetFilterCommand, SetSheetsFilterCriteriaCommand } from '@univerjs/sheets-filter';
import { FRange } from '@univerjs/sheets/facade';

/**
 * This interface class provides methods to modify the filter settings of a worksheet.
 * @hideconstructor
 */
export class FFilter {
    constructor(
        private readonly _workbook: Workbook,
        private readonly _worksheet: Worksheet,
        private readonly _filterModel: FilterModel,
        @Inject(Injector) private readonly _injector: Injector,
        @ICommandService private readonly _commandSrv: ICommandService
    ) {
        // empty
    }

    /**
     * Get the filtered out rows by this filter.
     * @returns {number[]} Filtered out rows by this filter.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Set some values of the range C1:F10
     * const fRange = fWorksheet.getRange('C1:F10');
     * fRange.setValues([
     *   [1, 2, 3, 4],
     *   [2, 3, 4, 5],
     *   [3, 4, 5, 6],
     *   [4, 5, 6, 7],
     *   [5, 6, 7, 8],
     *   [6, 7, 8, 9],
     *   [7, 8, 9, 10],
     *   [8, 9, 10, 11],
     *   [9, 10, 11, 12],
     *   [10, 11, 12, 13],
     * ]);
     *
     * // Create a filter on the range C1:F10
     * let fFilter = fRange.createFilter();
     *
     * // If the filter already exists, remove it and create a new one
     * if (!fFilter) {
     *   fRange.getFilter().remove();
     *   fFilter = fRange.createFilter();
     * }
     *
     * // Set the filter criteria of the column C, filter out the rows that are not 1, 5, 9
     * const column = fWorksheet.getRange('C:C').getColumn();
     * fFilter.setColumnFilterCriteria(column, {
     *   colId: 0,
     *   filters: {
     *     filters: ['1', '5', '9'],
     *   },
     * });
     *
     * // Get the filtered out rows
     * console.log(fFilter.getFilteredOutRows()); // [1, 2, 3, 5, 6, 7, 9]
     * ```
     */
    getFilteredOutRows(): number[] {
        return Array.from(this._filterModel.filteredOutRows).sort();
    }

    /**
     * Get the filter criteria of a column.
     * @param {number} column - The column index.
     * @returns {Nullable<IFilterColumn>} The filter criteria of the column.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Set some values of the range C1:F10
     * const fRange = fWorksheet.getRange('C1:F10');
     * fRange.setValues([
     *   [1, 2, 3, 4],
     *   [2, 3, 4, 5],
     *   [3, 4, 5, 6],
     *   [4, 5, 6, 7],
     *   [5, 6, 7, 8],
     *   [6, 7, 8, 9],
     *   [7, 8, 9, 10],
     *   [8, 9, 10, 11],
     *   [9, 10, 11, 12],
     *   [10, 11, 12, 13],
     * ]);
     *
     * // Create a filter on the range C1:F10
     * let fFilter = fRange.createFilter();
     *
     * // If the filter already exists, remove it and create a new one
     * if (!fFilter) {
     *   fRange.getFilter().remove();
     *   fFilter = fRange.createFilter();
     * }
     *
     * // Set the filter criteria of the column C, filter out the rows that are not 1, 5, 9
     * const column = fWorksheet.getRange('C:C').getColumn();
     * fFilter.setColumnFilterCriteria(column, {
     *   colId: 0,
     *   filters: {
     *     filters: ['1', '5', '9'],
     *   },
     * });
     *
     * // Print the filter criteria of the column C and D
     * console.log(fFilter.getColumnFilterCriteria(column)); // { colId: 0, filters: { filters: ['1', '5', '9'] } }
     * console.log(fFilter.getColumnFilterCriteria(column + 1)); // undefined
     * ```
     */
    getColumnFilterCriteria(column: number): Nullable<IFilterColumn> {
        return this._filterModel.getFilterColumn(column)?.getColumnData();
    }

    /**
     * Clear the filter criteria of a column.
     * @param {number} column - The column index.
     * @returns {FFilter} The FFilter instance for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Set some values of the range C1:F10
     * const fRange = fWorksheet.getRange('C1:F10');
     * fRange.setValues([
     *   [1, 2, 3, 4],
     *   [2, 3, 4, 5],
     *   [3, 4, 5, 6],
     *   [4, 5, 6, 7],
     *   [5, 6, 7, 8],
     *   [6, 7, 8, 9],
     *   [7, 8, 9, 10],
     *   [8, 9, 10, 11],
     *   [9, 10, 11, 12],
     *   [10, 11, 12, 13],
     * ]);
     *
     * // Create a filter on the range C1:F10
     * let fFilter = fRange.createFilter();
     *
     * // If the filter already exists, remove it and create a new one
     * if (!fFilter) {
     *   fRange.getFilter().remove();
     *   fFilter = fRange.createFilter();
     * }
     *
     * // Set the filter criteria of the column C, filter out the rows that are not 1, 5, 9
     * const column = fWorksheet.getRange('C:C').getColumn();
     * fFilter.setColumnFilterCriteria(column, {
     *   colId: 0,
     *   filters: {
     *     filters: ['1', '5', '9'],
     *   },
     * });
     *
     * // Clear the filter criteria of the column C after 3 seconds
     * setTimeout(() => {
     *   fFilter.removeColumnFilterCriteria(column);
     * }, 3000);
     * ```
     */
    removeColumnFilterCriteria(column: number): FFilter {
        this._commandSrv.syncExecuteCommand(SetSheetsFilterCriteriaCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            col: column,
            criteria: null,
        } as ISetSheetsFilterCriteriaCommandParams);
        return this;
    }

    /**
     * Set the filter criteria of a column.
     * @param {number} column - The column index.
     * @param {ISetSheetsFilterCriteriaCommandParams['criteria']} criteria - The new filter criteria.
     * @returns {FFilter} The FFilter instance for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Set some values of the range C1:F10
     * const fRange = fWorksheet.getRange('C1:F10');
     * fRange.setValues([
     *   [1, 2, 3, 4],
     *   [2, 3, 4, 5],
     *   [3, 4, 5, 6],
     *   [4, 5, 6, 7],
     *   [5, 6, 7, 8],
     *   [6, 7, 8, 9],
     *   [7, 8, 9, 10],
     *   [8, 9, 10, 11],
     *   [9, 10, 11, 12],
     *   [10, 11, 12, 13],
     * ]);
     *
     * // Create a filter on the range C1:F10
     * let fFilter = fRange.createFilter();
     *
     * // If the filter already exists, remove it and create a new one
     * if (!fFilter) {
     *   fRange.getFilter().remove();
     *   fFilter = fRange.createFilter();
     * }
     *
     * // Set the filter criteria of the column C, filter out the rows that are not 1, 5, 9
     * const column = fWorksheet.getRange('C:C').getColumn();
     * fFilter.setColumnFilterCriteria(column, {
     *   colId: 0,
     *   filters: {
     *     filters: ['1', '5', '9'],
     *   },
     * });
     * ```
     */
    setColumnFilterCriteria(column: number, criteria: ISetSheetsFilterCriteriaCommandParams['criteria']): FFilter {
        this._commandSrv.syncExecuteCommand(SetSheetsFilterCriteriaCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            col: column,
            criteria,
        } as ISetSheetsFilterCriteriaCommandParams);
        return this;
    }

    /**
     * Get the range of the filter.
     * @returns {FRange} The range of the filter.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fFilter = fWorksheet.getFilter();
     * console.log(fFilter?.getRange().getA1Notation());
     * ```
     */
    getRange(): FRange {
        const range = this._filterModel.getRange();
        return this._injector.createInstance(FRange, this._workbook, this._worksheet, range);
    }

    /**
     * Remove the filter criteria of all columns.
     * @returns {FFilter} The FFilter instance for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Set some values of the range C1:F10
     * const fRange = fWorksheet.getRange('C1:F10');
     * fRange.setValues([
     *   [1, 2, 3, 4],
     *   [2, 3, 4, 5],
     *   [3, 4, 5, 6],
     *   [4, 5, 6, 7],
     *   [5, 6, 7, 8],
     *   [6, 7, 8, 9],
     *   [7, 8, 9, 10],
     *   [8, 9, 10, 11],
     *   [9, 10, 11, 12],
     *   [10, 11, 12, 13],
     * ]);
     *
     * // Create a filter on the range C1:F10
     * let fFilter = fRange.createFilter();
     *
     * // If the filter already exists, remove it and create a new one
     * if (!fFilter) {
     *   fRange.getFilter().remove();
     *   fFilter = fRange.createFilter();
     * }
     *
     * // Set the filter criteria of the column C, filter out the rows that are not 1, 5, 9
     * const column = fWorksheet.getRange('C:C').getColumn();
     * fFilter.setColumnFilterCriteria(column, {
     *   colId: 0,
     *   filters: {
     *     filters: ['1', '5', '9'],
     *   },
     * });
     *
     * // Clear the filter criteria of all columns after 3 seconds
     * setTimeout(() => {
     *   fFilter.removeFilterCriteria();
     * }, 3000);
     * ```
     */
    removeFilterCriteria(): FFilter {
        this._commandSrv.syncExecuteCommand(ClearSheetsFilterCriteriaCommand.id);
        return this;
    }

    /**
     * Remove the filter from the worksheet.
     * @returns {boolean} True if the filter is removed successfully; otherwise, false.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:D14');
     * let fFilter = fRange.createFilter();
     *
     * // If the worksheet already has a filter, remove it and create a new filter.
     * if (!fFilter) {
     *   fWorksheet.getFilter().remove();
     *   fFilter = fRange.createFilter();
     * }
     * console.log(fFilter);
     * ```
     */
    remove(): boolean {
        return this._commandSrv.syncExecuteCommand(RemoveSheetFilterCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
        } as ISheetCommandSharedParams);
    }
}
