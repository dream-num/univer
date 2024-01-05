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

import type { IMutation } from '@univerjs/core';
import { CommandType, IUniverInstanceService, Rectangle } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type {
    IAddWorksheetMergeMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../../basics/interfaces/mutation-interface';
import { MergeCellService } from '../../services/merge-cell/merge-cell.service';

export const RemoveMergeUndoMutationFactory = (
    accessor: IAccessor,
    params: IRemoveWorksheetMergeMutationParams
): IAddWorksheetMergeMutationParams => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const mergeCellService = accessor.get(MergeCellService);

    const universheet = univerInstanceService.getUniverSheetInstance(params.unitId);
    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    const worksheet = universheet.getSheetBySheetId(params.subUnitId);
    if (worksheet == null) {
        throw new Error('worksheet is null error!');
    }
    const mergeData = mergeCellService.getMergeData(params.unitId, params.subUnitId);
    const mergeRemoveData = params.ranges;
    const ranges = [];
    for (let j = 0; j < mergeRemoveData.length; j++) {
        for (let i = mergeData.length - 1; i >= 0; i--) {
            const configMerge = mergeData[i];
            const removeMerge = mergeRemoveData[j];
            if (Rectangle.intersects(configMerge, removeMerge)) {
                ranges.push(mergeData[i]);
            }
        }
    }

    return {
        unitId: params.unitId,
        subUnitId: params.subUnitId,
        ranges,
    };
};

export const RemoveWorksheetMergeMutation: IMutation<IRemoveWorksheetMergeMutationParams> = {
    id: 'sheet.mutation.remove-worksheet-merge',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params: IRemoveWorksheetMergeMutationParams) => {
        const mergeCellService = accessor.get(MergeCellService);

        const mergeData = mergeCellService.getMergeData(params.unitId, params.subUnitId);

        const mergeRemoveData = params.ranges;
        for (let j = 0; j < mergeRemoveData.length; j++) {
            for (let i = mergeData.length - 1; i >= 0; i--) {
                const configMerge = mergeData[i];
                const removeMerge = mergeRemoveData[j];
                if (Rectangle.intersects(configMerge, removeMerge)) {
                    mergeData.splice(i, 1);
                }
            }
        }
        return true;
    },
};
