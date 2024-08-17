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

import { CommandType } from '@univerjs/core';
import type { IMutation, IRange, Nullable } from '@univerjs/core';
import type { ISheetCommandSharedParams } from '@univerjs/sheets';

import { SheetsFilterService } from '../../services/sheet-filter.service';
import type { IFilterColumn } from '../../models/types';

export interface ISetSheetsFilterRangeMutationParams extends ISheetCommandSharedParams {
    range: IRange;
}

/**
 * Set filter range in a Worksheet. If the `FilterModel` does not exist, it will be created.
 *
 * Since there could only be a filter on a worksheet, when you want to update the range, you
 * don't necessarily need to remove the filter first, you can just execute this mutation.
 */
export const SetSheetsFilterRangeMutation: IMutation<ISetSheetsFilterRangeMutationParams> = {
    id: 'sheet.mutation.set-filter-range',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { subUnitId, unitId, range } = params;
        const sheetsFilterService = accessor.get(SheetsFilterService);

        // check if the range is in bound?
        const filterModel = sheetsFilterService.ensureFilterModel(unitId, subUnitId);
        filterModel.setRange(range);

        return true;
    },
};

export interface ISetSheetsFilterCriteriaMutationParams extends ISheetCommandSharedParams {
    col: number;

    /**
     * Filter criteria to set. If it is `null`, the criteria will be removed.
     */
    criteria: Nullable<IFilterColumn>;

    /**
     * If it should trigger calculation on this `FilterColumn`.
     *
     * @default true
     */
    reCalc?: boolean;
}
/**
 * Set filter criteria of a Worksheet.
 */
export const SetSheetsFilterCriteriaMutation: IMutation<ISetSheetsFilterCriteriaMutationParams> = {
    id: 'sheet.mutation.set-filter-criteria',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { subUnitId, unitId, criteria, col, reCalc = true } = params;
        const sheetsFilterService = accessor.get(SheetsFilterService);

        const filterModel = sheetsFilterService.getFilterModel(unitId, subUnitId);
        if (!filterModel) return false;

        filterModel.setCriteria(col, criteria, reCalc);
        return true;
    },
};

export interface IRemoveSheetsFilterMutationParams extends ISheetCommandSharedParams { }
export const RemoveSheetsFilterMutation: IMutation<IRemoveSheetsFilterMutationParams> = {
    id: 'sheet.mutation.remove-filter',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { unitId, subUnitId } = params;
        const sheetsFilterService = accessor.get(SheetsFilterService);
        return sheetsFilterService.removeFilterModel(unitId, subUnitId);
    },
};

export interface IReCalcSheetsFilterMutationParams extends ISheetCommandSharedParams { }
export const ReCalcSheetsFilterMutation: IMutation<IReCalcSheetsFilterMutationParams> = {
    id: 'sheet.mutation.re-calc-filter',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { unitId, subUnitId } = params;
        const sheetsFilterService = accessor.get(SheetsFilterService);
        const filterModel = sheetsFilterService.getFilterModel(unitId, subUnitId);
        if (!filterModel) {
            return false;
        }

        filterModel.reCalc();
        return true;
    },
};
