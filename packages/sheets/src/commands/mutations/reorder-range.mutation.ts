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

import type { ICellData, IMutation, IRange, Nullable, Workbook } from '@univerjs/core';
import type { ISheetCommandSharedParams } from '../../commands/utils/interface';
import { CommandType, IUniverInstanceService, ObjectMatrix, Range, Tools } from '@univerjs/core';

export interface IReorderRangeMutationParams extends ISheetCommandSharedParams {
    range: IRange;
    order: { [key: number]: number };
}

export const ReorderRangeUndoMutationFactory = (params: IReorderRangeMutationParams): IReorderRangeMutationParams => {
    const { order } = params;
    const newOrder = {} as { [key: number]: number };
    Object.keys(order).forEach((key) => {
        newOrder[order[Number(key)]] = Number(key);
    });
    return {
        ...params,
        order: newOrder,
    };
};

export const ReorderRangeMutation: IMutation<IReorderRangeMutationParams> = {
    id: 'sheet.mutation.reorder-range',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { subUnitId, unitId, range, order } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getUnit(unitId) as Workbook;
        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            return false;
        }
        const cellDataMatrix = new ObjectMatrix<Nullable<ICellData>>();
        Range.foreach(range, (row, col) => {
            if (order.hasOwnProperty(row)) {
                const targetRow = order[row];
                const cloneCell = Tools.deepClone(worksheet.getCellRaw(targetRow, col));
                cellDataMatrix.setValue(row, col, cloneCell);
            }
        });

        const worksheetCellDataMatrix = worksheet.getCellMatrix();

        cellDataMatrix.forValue((row, col, cellData) => {
            worksheetCellDataMatrix.setValue(row, col, cellData);
        });
        return true;
    },

};
