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

import type { Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { ISheetCommandSharedParams } from '@univerjs/sheets';
import type { FilterModel, IFilterColumn, ISetSheetsFilterCriteriaCommandParams } from '@univerjs/sheets-filter';

import { ICommandService, Inject, Injector } from '@univerjs/core';
import { ClearSheetsFilterCriteriaCommand, RemoveSheetFilterCommand, SetSheetsFilterCriteriaCommand } from '@univerjs/sheets-filter';
import { FRange } from '@univerjs/sheets/facade';

/**
 * This interface class provides methods to modify the filter settings of a worksheet.
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
     */
    getFilteredOutRows(): number[] {
        return Array.from(this._filterModel.filteredOutRows).sort();
    }

    /**
     * Get the filter criteria of a column.
     * @param {number} col The column number.
     * @returns {Nullable<IFilterColumn>} The filter criteria of the column.
     */
    getColumnFilterCriteria(col: number): Nullable<IFilterColumn> {
        return this._filterModel.getFilterColumn(col)?.getColumnData();
    }

    /**
     * Clear the filter criteria of a column.
     * @param {number} col The column number.
     * @returns {FFilter} The interface class to handle the filter.
     */
    removeColumnFilterCriteria(col: number): FFilter {
        this._commandSrv.syncExecuteCommand(SetSheetsFilterCriteriaCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            col,
            criteria: null,
        } as ISetSheetsFilterCriteriaCommandParams);
        return this;
    }

    /**
     * Set the filter criteria of a column.
     * @param {number} col  The column number.
     * @param {ISetSheetsFilterCriteriaCommandParams['criteria']} criteria The new filter criteria.
     * @returns {FFilter} The interface class to handle the filter.
     */
    setColumnFilterCriteria(col: number, criteria: ISetSheetsFilterCriteriaCommandParams['criteria']): FFilter {
        this._commandSrv.syncExecuteCommand(SetSheetsFilterCriteriaCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            col,
            criteria,
        } as ISetSheetsFilterCriteriaCommandParams);
        return this;
    }

    /**
     * Get the range of the filter.
     * @returns {FRange} The range of the filter.
     */
    getRange(): FRange {
        const range = this._filterModel.getRange();
        return this._injector.createInstance(FRange, this._workbook, this._worksheet, range);
    }

    /**
     * Remove the filter criteria of all columns.
     * @returns {Promise<boolean>} If the filter criteria is removed.
     */
    removeFilterCriteria(): FFilter {
        this._commandSrv.syncExecuteCommand(ClearSheetsFilterCriteriaCommand.id);
        return this;
    }

    /**
     * Remove the filter from the worksheet.
     * @returns {boolean} If the filter is removed.
     */
    remove(): boolean {
        return this._commandSrv.syncExecuteCommand(RemoveSheetFilterCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
        } as ISheetCommandSharedParams);
    }
}
