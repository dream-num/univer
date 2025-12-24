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

import type { IAccessor, IMutation } from '@univerjs/core';
import type { IAddWorksheetMergeMutationParams, IRemoveWorksheetMergeMutationParams } from '../../basics/interfaces/mutation-interface';
import { CommandType, IUniverInstanceService, Tools } from '@univerjs/core';
import { getSheetMutationTarget } from '../commands/utils/target-util';

export const AddMergeUndoMutationFactory = (
    accessor: IAccessor,
    params: IAddWorksheetMergeMutationParams
): IRemoveWorksheetMergeMutationParams => {
    const target = getSheetMutationTarget(accessor.get(IUniverInstanceService), params);
    if (!target) {
        throw new Error('Workbook or worksheet is null error!');
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
        const target = getSheetMutationTarget(accessor.get(IUniverInstanceService), params);
        if (!target) {
            throw new Error('Workbook or worksheet is null error!');
        }

        const { worksheet } = target;
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
