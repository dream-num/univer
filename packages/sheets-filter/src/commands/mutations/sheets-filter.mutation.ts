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

import type { IMutation, IRange, Nullable } from '@univerjs/core';
import type { ISheetCommandSharedParams } from '@univerjs/sheets';
import type { IFilterColumn } from '../../models/types';

import { CommandType } from '@univerjs/core';
import { ReCalcSheetsFilterMutationId, RemoveSheetsFilterMutationId, SetSheetsFilterCriteriaMutationId, SetSheetsFilterRangeMutationId } from '../../common/const';
import { SheetsFilterService } from '../../services/sheet-filter.service';

/**
 * Parameters of mutation {@link SetSheetsFilterRangeMutation}.
 * @property range - the range to be set as filter range.
 */
export interface ISetSheetsFilterRangeMutationParams extends ISheetCommandSharedParams {
    range: IRange;
}

/**
 * A {@link CommandType.MUTATION} to set filter range in a {@link Worksheet}. If no {@link FilterModel} exists,
 * a new `FilterModel` will be created.
 *
 * Since there could only be a filter on a worksheet, when you want to update the range, you
 * don't necessarily need to remove the filter first, you can just execute this mutation.
 */
export const SetSheetsFilterRangeMutation: IMutation<ISetSheetsFilterRangeMutationParams> = {
    id: SetSheetsFilterRangeMutationId,
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

/**
 * Parameters of mutation {@link SetSheetsFilterCriteriaMutation}.
 * @property {number} col - the column index to set filter criteria.
 * @property {IFilterColumn | null} criteria - the filter criteria to set. If it is `null`, the criteria will be removed.
 * @property {boolean} [reCalc=true] - if it should trigger calculation on this `FilterColumn`.
 */
export interface ISetSheetsFilterCriteriaMutationParams extends ISheetCommandSharedParams {
    col: number;
    criteria: Nullable<IFilterColumn>;
    reCalc?: boolean;
}

/**
 * A {@link CommandType.MUTATION} to set filter criteria of a given column of a {@link FilterModel}.
 */
export const SetSheetsFilterCriteriaMutation: IMutation<ISetSheetsFilterCriteriaMutationParams> = {
    id: SetSheetsFilterCriteriaMutationId,
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

/**
 * A {@link CommandType.MUTATION} to remove a {@link FilterModel} in a {@link Worksheet}.
 */
export const RemoveSheetsFilterMutation: IMutation<ISheetCommandSharedParams> = {
    id: RemoveSheetsFilterMutationId,
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { unitId, subUnitId } = params;
        const sheetsFilterService = accessor.get(SheetsFilterService);
        return sheetsFilterService.removeFilterModel(unitId, subUnitId);
    },
};

/**
 * A {@link CommandType.MUTATION} to re-calculate a {@link FilterModel}.
 */
export const ReCalcSheetsFilterMutation: IMutation<ISheetCommandSharedParams> = {
    id: ReCalcSheetsFilterMutationId,
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
