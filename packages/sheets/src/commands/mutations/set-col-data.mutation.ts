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

import type { IColumnData, IMutation, IObjectArrayPrimitiveType, Nullable, Worksheet } from '@univerjs/core';
import { CommandType, IUniverInstanceService } from '@univerjs/core';
import { getOldColumnData } from '../../basics/row-column-value';
import { getSheetCommandTarget } from '../commands/utils/target-util';

export interface ISetColDataMutationParams {
    unitId: string;
    subUnitId: string;
    columnData: IObjectArrayPrimitiveType<Nullable<IColumnData>>;
}

export const SetColDataMutationFactory = (
    params: ISetColDataMutationParams,
    worksheet: Worksheet
): ISetColDataMutationParams => {
    const { unitId, subUnitId, columnData } = params;

    const oldColData: IObjectArrayPrimitiveType<Nullable<IColumnData>> = {};
    const manager = worksheet.getColumnManager();

    // Loop through the column data and set the old column data
    for (const colIndex in columnData) {
        const newCol = columnData[colIndex];
        const currentCol = manager.getColumn(Number(colIndex));

        oldColData[colIndex] = getOldColumnData(currentCol, newCol);
    }

    return {
        unitId,
        subUnitId,
        columnData: oldColData,
    };
};

export const SetColDataMutation: IMutation<ISetColDataMutationParams> = {
    id: 'sheet.mutation.set-col-data',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { columnData } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { worksheet } = target;
        const manager = worksheet.getColumnManager();

        // Loop through the custom column properties data and set the properties to the column
        for (const colIndex in columnData) {
            const col = columnData[colIndex];

            // Similar to setting the column width, we assume that null and undefined both have clear deletion meanings.
            if (col === null || col === undefined) {
                manager.removeColumn(Number(colIndex));
                continue;
            }

            const currentCol = manager.getColumnOrCreate(Number(colIndex));
            Object.assign(currentCol, col);
        }

        return true;
    },
};
