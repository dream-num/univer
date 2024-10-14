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

import type { Nullable } from '@univerjs/core';
import type { FilterModel } from '../models/filter-model';
import { FWorksheet } from '@univerjs/sheets/facade';
import { SheetsFilterService } from '../services/sheet-filter.service';
import { FFilter } from './f-filter';

interface IFWorksheetFilter {
    getFilter(): FFilter | null;
}

class FWorksheetFilter extends FWorksheet implements IFWorksheetFilter {
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
    interface FWorksheet extends IFWorksheetFilter {}
}
