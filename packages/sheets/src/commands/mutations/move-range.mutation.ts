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

import type { ICellData, IMutation, IObjectMatrixPrimitiveType, Nullable } from '@univerjs/core';
import { CommandType, IUniverInstanceService, ObjectMatrix } from '@univerjs/core';

export interface IMoveRangeMutationParams {
    unitId: string;
    subUnitId: string;
    from: IObjectMatrixPrimitiveType<Nullable<ICellData>>;
    to: IObjectMatrixPrimitiveType<Nullable<ICellData>>;
}

export const MoveRangeMutation: IMutation<IMoveRangeMutationParams, boolean> = {
    id: 'sheet.mutation.move-range',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { from, to } = params;

        if (!from || !to) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        if (!workbook) {
            return false;
        }

        const worksheet = workbook.getSheetBySheetId(params.subUnitId);
        if (!worksheet) {
            return false;
        }

        const cellMatrix = worksheet.getCellMatrix();

        new ObjectMatrix<Nullable<ICellData>>(from).forValue((row, col, newVal) => {
            cellMatrix.setValue(row, col, newVal);
        });

        new ObjectMatrix<Nullable<ICellData>>(to).forValue((row, col, newVal) => {
            cellMatrix.setValue(row, col, newVal);
        });

        return true;
    },
};
