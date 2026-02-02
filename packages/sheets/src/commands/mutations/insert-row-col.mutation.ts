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
import type {
    IInsertColMutationParams,
    IInsertRowMutationParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
} from '../../basics/interfaces/mutation-interface';
import { CommandType, insertMatrixArray, IUniverInstanceService } from '@univerjs/core';
import { getSheetMutationTarget } from '../commands/utils/target-util';

export const InsertRowMutationUndoFactory = (
    accessor: IAccessor,
    params: IInsertRowMutationParams
): IRemoveRowsMutationParams => {
    const target = getSheetMutationTarget(accessor.get(IUniverInstanceService), params);
    if (!target) {
        throw new Error('Workbook or Worksheet not found at InsertRowMutationUndoFactory');
    }

    return {
        unitId: params.unitId,
        subUnitId: params.subUnitId,
        range: params.range,
    };
};

export const InsertRowMutation: IMutation<IInsertRowMutationParams> = {
    id: 'sheet.mutation.insert-row',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const target = getSheetMutationTarget(accessor.get(IUniverInstanceService), params);
        if (!target) {
            throw new Error('Workbook or Worksheet not found at InsertRowMutation');
        }

        const { worksheet } = target;
        // TODO@wzhudev: should not expose row data and let outside modules to modify it directly
        // the correct way to do this is to provide a method from RowManager to modify row data
        const rowWrapper = worksheet.getRowManager().getRowData();
        const { range, rowInfo } = params;
        const { startRow, endRow } = range;

        for (let r = startRow; r <= endRow; r++) {
            if (rowInfo && rowInfo[r - startRow]) {
                insertMatrixArray(r, rowInfo[r - startRow], rowWrapper);
            }
        }

        const insertedRowCount = endRow - startRow + 1;
        worksheet.setRowCount(worksheet.getRowCount() + insertedRowCount);

        // remove cells contents by directly mutating worksheetCellMatrix
        const cellMatrix = worksheet.getCellMatrix();
        cellMatrix.insertRows(range.startRow, insertedRowCount);

        return true;
    },
};

export const InsertColMutationUndoFactory = (
    accessor: IAccessor,
    params: IInsertColMutationParams
): IRemoveColMutationParams => {
    const target = getSheetMutationTarget(accessor.get(IUniverInstanceService), params);
    if (!target) {
        throw new Error('Workbook or Worksheet not found at InsertColMutationUndoFactory');
    }

    return {
        unitId: params.unitId,
        subUnitId: params.subUnitId,
        range: params.range,
    };
};

export const InsertColMutation: IMutation<IInsertColMutationParams> = {
    id: 'sheet.mutation.insert-col',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const target = getSheetMutationTarget(accessor.get(IUniverInstanceService), params);
        if (!target) {
            throw new Error('Workbook or Worksheet not found at InsertColMutation');
        };

        const { worksheet } = target;
        const columnWrapper = worksheet.getColumnManager().getColumnData();
        const { range, colInfo } = params;
        const { startColumn, endColumn } = range;

        for (let c = startColumn; c <= endColumn; c++) {
            if (colInfo && colInfo[c - startColumn]) {
                insertMatrixArray(c, colInfo[c - startColumn], columnWrapper);
            }
        }

        const insertedColumnCount = endColumn - startColumn + 1;
        worksheet.setColumnCount(worksheet.getColumnCount() + insertedColumnCount);

        // remove cells contents by directly mutating worksheetCellMatrix
        const cellMatrix = worksheet.getCellMatrix();
        cellMatrix.insertColumns(range.startColumn, insertedColumnCount);

        return true;
    },
};
