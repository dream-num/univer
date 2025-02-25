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

import { CommandType, IUniverInstanceService, Tools } from '@univerjs/core';
import type { IAccessor, IMutation } from '@univerjs/core';

import type {
    IAddWorksheetMergeMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../../basics/interfaces/mutation-interface';

export const AddMergeUndoMutationFactory = (
    accessor: IAccessor,
    params: IAddWorksheetMergeMutationParams
): IRemoveWorksheetMergeMutationParams => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const universheet = univerInstanceService.getUniverSheetInstance(params.unitId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    return {
        unitId: params.unitId,
        subUnitId: params.subUnitId,
        ranges: Tools.deepClone(params.ranges),
    };
};

export const AddWorksheetMergeMutation: IMutation<IAddWorksheetMergeMutationParams> = {
    id: 'sheet.mutation.add-worksheet-merge',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params: IAddWorksheetMergeMutationParams) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const universheet = univerInstanceService.getUniverSheetInstance(params.unitId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const worksheet = universheet.getSheetBySheetId(params.subUnitId);
        if (!worksheet) return false;

        const config = worksheet.getConfig()!;
        const mergeConfigData = config.mergeData;
        const mergeAppendData = params.ranges;
        for (let i = 0; i < mergeAppendData.length; i++) {
            mergeConfigData.push(mergeAppendData[i]);
        }
        worksheet.getSpanModel().rebuild(mergeConfigData);

        return true;
    },
};
