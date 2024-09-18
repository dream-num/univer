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

import { CommandType, IUniverInstanceService, Rectangle } from '@univerjs/core';
import type { IAccessor, IMutation } from '@univerjs/core';

import type {
    IAddWorksheetMergeMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../../basics/interfaces/mutation-interface';

export const RemoveMergeUndoMutationFactory = (
    accessor: IAccessor,
    params: IRemoveWorksheetMergeMutationParams
): IAddWorksheetMergeMutationParams => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const universheet = univerInstanceService.getUniverSheetInstance(params.unitId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    const worksheet = universheet.getSheetBySheetId(params.subUnitId);
    if (worksheet == null) {
        throw new Error('worksheet is null error!');
    }
    const config = worksheet.getConfig();
    const mergeConfigData = config.mergeData;
    const mergeRemoveData = params.ranges;
    const ranges = [];
    for (let j = 0; j < mergeRemoveData.length; j++) {
        for (let i = mergeConfigData.length - 1; i >= 0; i--) {
            const configMerge = mergeConfigData[i];
            const removeMerge = mergeRemoveData[j];
            if (Rectangle.intersects(configMerge, removeMerge)) {
                ranges.push(mergeConfigData[i]);
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
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const universheet = univerInstanceService.getUniverSheetInstance(params.unitId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const worksheet = universheet.getSheetBySheetId(params.subUnitId);
        if (!worksheet) return false;
        const config = worksheet.getConfig();
        const mergeConfigData = config.mergeData;
        const mergeRemoveData = params.ranges;
        for (let j = 0; j < mergeRemoveData.length; j++) {
            for (let i = mergeConfigData.length - 1; i >= 0; i--) {
                const configMerge = mergeConfigData[i];
                const removeMerge = mergeRemoveData[j];
                if (Rectangle.intersects(configMerge, removeMerge)) {
                    mergeConfigData.splice(i, 1);
                }
            }
        }
        // update merge data cache
        worksheet.getSpanModel().rebuild(mergeConfigData);
        return true;
    },
};
