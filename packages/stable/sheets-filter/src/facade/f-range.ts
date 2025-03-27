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

import type { Nullable } from '@univerjs/core';
import type { FilterModel, ISetSheetFilterRangeCommandParams } from '@univerjs/sheets-filter';
import { SetSheetFilterRangeCommand, SheetsFilterService } from '@univerjs/sheets-filter';
import { FRange } from '@univerjs/sheets/facade';
import { FFilter } from './f-filter';

// TODO: add jsdoc comments for the following API

/**
 * @ignore
 */
export interface IFRangeFilter {
    /**
     * Create a filter for the current range. If the worksheet already has a filter, this method would return `null`.
     * @returns {FFilter | null} The FFilter instance to handle the filter.
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
     * console.log(fFilter, fFilter.getRange().getA1Notation());
     * ```
     */
    createFilter(this: FRange): FFilter | null;

    /**
     * Get the filter in the worksheet to which the range belongs. If the worksheet does not have a filter, this method would return `null`.
     * Normally, you can directly call `getFilter` on {@link FWorksheet}.
     * @returns {FFilter | null} The FFilter instance to handle the filter.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:D14');
     * let fFilter = fRange.getFilter();
     *
     * // If the worksheet does not have a filter, create a new filter.
     * if (!fFilter) {
     *    fFilter = fRange.createFilter();
     * }
     * console.log(fFilter, fFilter.getRange().getA1Notation());
     * ```
     */
    getFilter(): FFilter | null;
}

export class FRangeFilter extends FRange implements IFRangeFilter {
    override createFilter(): FFilter | null {
        if (this._getFilterModel()) return null;

        const success = this._commandService.syncExecuteCommand(SetSheetFilterRangeCommand.id, <ISetSheetFilterRangeCommandParams>{
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
        });

        if (!success) return null;

        return this.getFilter();
    }

    /**
     * Get the filter for the current range's worksheet.
     * @returns {FFilter | null} The interface class to handle the filter. If the worksheet does not have a filter,
     * this method would return `null`.
     */
    override getFilter(): FFilter | null {
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
}

FRange.extend(FRangeFilter);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FRange extends IFRangeFilter { }
}
