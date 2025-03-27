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
import type { FilterModel } from '@univerjs/sheets-filter';
import { SheetsFilterService } from '@univerjs/sheets-filter';
import { FWorksheet } from '@univerjs/sheets/facade';
import { FFilter } from './f-filter';

/**
 * @ignore
 */
export interface IFWorksheetFilter {
    /**
     * Get the filter for the current worksheet.
     * @returns {FFilter | null} The interface class to handle the filter. If the worksheet does not have a filter,
     * this method would return `null`.
     * @example
     * ```typescript
     * const workbook = univerAPI.getActiveWorkbook();
     * const worksheet = workbook.getActiveSheet();
     * const filter = worksheet.getFilter();
     * console.log(filter, filter?.getRange().getA1Notation());
     * ```
     */
    getFilter(): FFilter | null;
}

export class FWorksheetFilter extends FWorksheet implements IFWorksheetFilter {
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

FWorksheet.extend(FWorksheetFilter);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorksheetFilter { }
}
