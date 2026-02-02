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
import { CommandType, IUniverInstanceService } from '@univerjs/core';
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
        const rowManager = worksheet.getRowManager();
        const { range, rowInfo } = params;
        const { startRow, endRow } = range;

        // insert row data
        rowManager.insertRowsWithData(startRow, endRow, rowInfo);

        // update worksheet row count
        const insertedRowCount = endRow - startRow + 1;
        worksheet.setRowCount(worksheet.getRowCount() + insertedRowCount);

        // remove cells contents by directly mutating worksheetCellMatrix
        const cellMatrix = worksheet.getCellMatrix();
        cellMatrix.insertRows(startRow, insertedRowCount);

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
        const columnManager = worksheet.getColumnManager();
        const { range, colInfo } = params;
        const { startColumn, endColumn } = range;

        // insert column data
        columnManager.insertColumnsWithData(startColumn, endColumn, colInfo);

        // update worksheet column count
        const insertedColumnCount = endColumn - startColumn + 1;
        worksheet.setColumnCount(worksheet.getColumnCount() + insertedColumnCount);

        // remove cells contents by directly mutating worksheetCellMatrix
        const cellMatrix = worksheet.getCellMatrix();
        cellMatrix.insertColumns(range.startColumn, insertedColumnCount);

        return true;
    },
};
