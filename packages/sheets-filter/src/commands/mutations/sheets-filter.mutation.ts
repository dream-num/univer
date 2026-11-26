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
import type { FilterModel } from '../../models/filter-model';
import type { IFilterColumn } from '../../models/types';
import { CommandType } from '@univerjs/core';
import {
    ReCalcSheetsFilterMutationId,
    RemoveSheetsFilterMutationId,
    SetSheetsFilterCriteriaMutationId,
    SetSheetsFilterRangeMutationId,
} from '../../common/const';
import { SheetsFilterService } from '../../services/sheet-filter.service';

interface ISheetsFilterMutationResult extends ISheetCommandSharedParams {
    filteredOutRows?: number[];
    sheetFilterActive?: boolean;
    removedFilterRange?: IRange;
}

function setFilterMutationResult(params: ISheetsFilterMutationResult, model?: FilterModel): void {
    params.filteredOutRows = model ? Array.from(model.filteredOutRows) : [];
    params.sheetFilterActive = model?.hasCriteria ?? false;
}

/**
 * Parameters of mutation {@link SetSheetsFilterRangeMutation}.
 * @property range - the range to be set as filter range.
 */
export interface ISetSheetsFilterRangeMutationParams extends ISheetsFilterMutationResult {
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
        setFilterMutationResult(params, filterModel);

        return true;
    },
};

/**
 * Parameters of mutation {@link SetSheetsFilterCriteriaMutation}.
 * @property {number} col - the column index to set filter criteria.
 * @property {IFilterColumn | null} criteria - the filter criteria to set. If it is `null`, the criteria will be removed.
 * @property {boolean} [reCalc=true] - if it should trigger calculation on this `FilterColumn`.
 */
export interface ISetSheetsFilterCriteriaMutationParams extends ISheetsFilterMutationResult {
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
        setFilterMutationResult(params, filterModel);
        return true;
    },
};

/**
 * A {@link CommandType.MUTATION} to remove a {@link FilterModel} in a {@link Worksheet}.
 */
export const RemoveSheetsFilterMutation: IMutation<ISheetsFilterMutationResult> = {
    id: RemoveSheetsFilterMutationId,
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { unitId, subUnitId } = params;
        const sheetsFilterService = accessor.get(SheetsFilterService);
        const range = sheetsFilterService.getFilterModel(unitId, subUnitId)?.getRange();
        const removed = sheetsFilterService.removeFilterModel(unitId, subUnitId);
        if (removed) {
            params.removedFilterRange = range;
            setFilterMutationResult(params);
        }
        // Cleanup can race with worksheet disposal, which also removes the model. Treat an
        // already-removed model as a successful, idempotent cleanup.
        return true;
    },
};

/**
 * A {@link CommandType.MUTATION} to re-calculate a {@link FilterModel}.
 */
export const ReCalcSheetsFilterMutation: IMutation<ISheetsFilterMutationResult> = {
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
        setFilterMutationResult(params, filterModel);
        return true;
    },
};
