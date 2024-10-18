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

import { CommandType, type CustomData, type IMutation, type IObjectArrayPrimitiveType, IUniverInstanceService, type Nullable, type Worksheet } from '@univerjs/core';
import { getSheetCommandTarget } from '../commands/utils/target-util';

export interface ISetRowCustomMutationParams {
    unitId: string;
    subUnitId: string;
    custom: IObjectArrayPrimitiveType<Nullable<CustomData>>;
}

export const SetRowCustomMutationFactory = (
    params: ISetRowCustomMutationParams,
    worksheet: Worksheet
): ISetRowCustomMutationParams => {
    const { unitId, subUnitId, custom } = params;

    const oldCustom: IObjectArrayPrimitiveType<Nullable<CustomData>> = {};
    const manager = worksheet.getRowManager();

    // loop through the custom data and set the old custom data to the oldCustom
    for (const rowIndex in custom) {
        const row = manager.getRow(Number(rowIndex));

        if (row === null || row === undefined || row.custom === null || row.custom === undefined) {
            oldCustom[rowIndex] = null;
        } else {
            oldCustom[rowIndex] = row.custom;
        }
    }

    return {
        unitId,
        subUnitId,
        custom: oldCustom,
    };
};

export const SetRowCustomMutation: IMutation<ISetRowCustomMutationParams> = {
    id: 'sheet.mutation.set-row-custom',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { custom } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { worksheet } = target;
        const manager = worksheet.getRowManager();
        // loop through the custom data and set the custom data to the row
        for (const rowIndex in custom) {
            const customData = custom[rowIndex];
            const row = manager.getRowOrCreate(Number(rowIndex));
            if (customData !== undefined) {
                // Custom will overwrite the original value
                row.custom = customData;
            }
        }

        return true;
    },
};
