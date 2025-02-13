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

export { UniverSheetsFilterPlugin } from './plugin';
export { FilterColumn, FilterModel } from './models/filter-model';
export {
    equals,
    getCustomFilterFn,
    greaterThan,
    greaterThanOrEqualTo,
    lessThan,
    lessThanOrEqualTo,
    notEquals,
} from './models/custom-filters';
export { SHEET_FILTER_SNAPSHOT_ID, SheetsFilterService } from './services/sheet-filter.service';
export type { IAutoFilter, ICustomFilter, ICustomFilters, IFilterColumn, IFilters } from './models/types';
export { CustomFilterOperator } from './models/types';
export { FILTER_MUTATIONS } from './common/const';

// #region - all commands

export {
    type ISetSheetsFilterCriteriaMutationParams,
    type ISetSheetsFilterRangeMutationParams,
    ReCalcSheetsFilterMutation,
    RemoveSheetsFilterMutation,
    SetSheetsFilterCriteriaMutation,
    SetSheetsFilterRangeMutation,
} from './commands/mutations/sheets-filter.mutation';
export {
    ClearSheetsFilterCriteriaCommand,
    type ISetSheetFilterRangeCommandParams,
    type ISetSheetsFilterCriteriaCommandParams,
    ReCalcSheetsFilterCommand,
    RemoveSheetFilterCommand,
    SetSheetFilterRangeCommand,
    SetSheetsFilterCriteriaCommand,
    SmartToggleSheetsFilterCommand,
} from './commands/commands/sheets-filter.command';

// #endregion
