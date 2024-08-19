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

export { UniverSheetsFilterPlugin } from './plugin';
export { FilterColumn, FilterModel } from './models/filter-model';
export {
    equals,
    notEquals,
    getCustomFilterFn,
    greaterThan,
    greaterThanOrEqualTo,
    lessThan,
    lessThanOrEqualTo,
} from './models/custom-filters';
export { SheetsFilterService, FILTER_MUTATIONS, SHEET_FILTER_SNAPSHOT_ID } from './services/sheet-filter.service';
export type { IAutoFilter, IFilterColumn, IFilters, ICustomFilters, ICustomFilter } from './models/types';
export { CustomFilterOperator } from './models/types';

// #region - all commands

export {
    type ISetSheetsFilterRangeMutationParams,
    type ISetSheetsFilterCriteriaMutationParams,
    SetSheetsFilterRangeMutation,
    SetSheetsFilterCriteriaMutation,
    RemoveSheetsFilterMutation,
    ReCalcSheetsFilterMutation,
} from './commands/mutations/sheets-filter.mutation';

// #endregion
