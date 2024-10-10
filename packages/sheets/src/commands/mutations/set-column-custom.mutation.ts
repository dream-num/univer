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

export interface ISetColumnCustomMutationParams {
    unitId: string;
    subUnitId: string;
    custom: IObjectArrayPrimitiveType<Nullable<CustomData>>;
}

export const SetColumnCustomMutationFactory = (
    params: ISetColumnCustomMutationParams,
    worksheet: Worksheet
): ISetColumnCustomMutationParams => {
    const { unitId, subUnitId, custom } = params;

    const oldCustom: IObjectArrayPrimitiveType<Nullable<CustomData>> = {};
    const manager = worksheet.getColumnManager();

    // loop through the custom data and set the old custom data to the oldCustom
    for (const colIndex in custom) {
        const column = manager.getColumn(Number(colIndex));

        if (column === null || column === undefined) {
            oldCustom[colIndex] = null;
        } else {
            oldCustom[colIndex] = column.custom;
        }
    }

    return {
        unitId,
        subUnitId,
        custom: oldCustom,
    };
};

export const SetColumnCustomMutation: IMutation<ISetColumnCustomMutationParams> = {
    id: 'sheet.mutation.set-column-custom',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { custom } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { worksheet } = target;
        const manager = worksheet.getColumnManager();
        // loop through the custom data and set the custom data to the column
        for (const colIndex in custom) {
            const customData = custom[colIndex];
            const column = manager.getColumnOrCreate(Number(colIndex));
            column.custom = customData;
        }

        return true;
    },
};
