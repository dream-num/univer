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

import type { IMutation, IObjectArrayPrimitiveType, IRowData, Nullable, Worksheet } from '@univerjs/core';
import { CommandType, IUniverInstanceService } from '@univerjs/core';
import { getOldRowData } from '../../basics/row-column-value';
import { getSheetCommandTarget } from '../commands/utils/target-util';

export interface ISetRowDataMutationParams {
    unitId: string;
    subUnitId: string;
    rowData: IObjectArrayPrimitiveType<Nullable<IRowData>>;
}

export const SetRowDataMutationFactory = (
    params: ISetRowDataMutationParams,
    worksheet: Worksheet
): ISetRowDataMutationParams => {
    const { unitId, subUnitId, rowData } = params;

    const oldRowData: IObjectArrayPrimitiveType<Nullable<IRowData>> = {};
    const manager = worksheet.getRowManager();

    // Loop through the row data and set the old row data
    for (const rowIndex in rowData) {
        const newRow = rowData[rowIndex];
        const currentRow = manager.getRow(Number(rowIndex));

        oldRowData[rowIndex] = getOldRowData(currentRow, newRow);
    }

    return {
        unitId,
        subUnitId,
        rowData: oldRowData,
    };
};

export const SetRowDataMutation: IMutation<ISetRowDataMutationParams> = {
    id: 'sheet.mutation.set-row-data',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { rowData } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { worksheet } = target;
        const manager = worksheet.getRowManager();

        // Loop through the custom row properties data and set the properties to the row
        for (const rowIndex in rowData) {
            const row = rowData[rowIndex];

            // Similar to setting the row height, we assume that null and undefined both have clear deletion meanings.
            if (row === null || row === undefined) {
                manager.removeRow(Number(rowIndex));
                continue;
            }

            const currentRow = manager.getRowOrCreate(Number(rowIndex));
            Object.assign(currentRow, row);
        }

        return true;
    },
};
