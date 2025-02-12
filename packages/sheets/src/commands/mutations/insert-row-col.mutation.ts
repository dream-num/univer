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
import { CommandType, insertMatrixArray, IUniverInstanceService } from '@univerjs/core';

import type {
    IInsertColMutationParams,
    IInsertRowMutationParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
} from '../../basics/interfaces/mutation-interface';

export const InsertRowMutationUndoFactory = (
    accessor: IAccessor,
    params: IInsertRowMutationParams
): IRemoveRowsMutationParams => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const universheet = univerInstanceService.getUniverSheetInstance(params.unitId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
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
        const { unitId, subUnitId, range, rowInfo } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const universheet = univerInstanceService.getUniverSheetInstance(unitId);
        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const worksheet = universheet.getSheetBySheetId(subUnitId);
        if (worksheet == null) {
            throw new Error('worksheet is null error!');
        }

        // TODO@wzhudev: should not expose row data and let outside modules to modify it directly
        // the correct way to do this is to provide a method from RowManager to modify row data
        const rowWrapper = worksheet.getRowManager().getRowData();
        const defaultRowInfo = {
            h: worksheet.getConfig().defaultRowHeight,
            hd: 0,
        };

        const rowIndex = range.startRow;
        const rowCount = range.endRow - range.startRow + 1;

        for (let j = rowIndex; j < rowIndex + rowCount; j++) {
            if (rowInfo) {
                insertMatrixArray(j, rowInfo[j - range.startRow] ?? defaultRowInfo, rowWrapper);
            } else {
                insertMatrixArray(j, defaultRowInfo, rowWrapper);
            }
        }

        worksheet.setRowCount(worksheet.getRowCount() + range.endRow - range.startRow + 1);

        // remove cells contents by directly mutating worksheetCellMatrix
        const cellMatrix = worksheet.getCellMatrix();
        cellMatrix.insertRows(range.startRow, rowCount);

        return true;
    },
};

export const InsertColMutationUndoFactory = (
    accessor: IAccessor,
    params: IInsertColMutationParams
): IRemoveColMutationParams => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const universheet = univerInstanceService.getUniverSheetInstance(params.unitId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
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
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const universheet = univerInstanceService.getUniverSheetInstance(params.unitId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const worksheet = universheet.getSheetBySheetId(params.subUnitId);
        if (!worksheet) return false;
        const manager = worksheet.getColumnManager();
        const { range, colInfo } = params;
        const columnPrimitive = manager.getColumnData();
        const columnWrapper = columnPrimitive;

        const colIndex = range.startColumn;
        const colCount = range.endColumn - range.startColumn + 1;
        const defaultColWidth = worksheet.getConfig().defaultColumnWidth;
        for (let j = colIndex; j < colIndex + colCount; j++) {
            const defaultColInfo = {
                w: defaultColWidth,
                hd: 0,
            };
            if (colInfo) {
                insertMatrixArray(j, colInfo[j - range.startColumn] ?? defaultColInfo, columnWrapper);
            } else {
                insertMatrixArray(j, defaultColInfo, columnWrapper);
            }
        }

        worksheet.setColumnCount(worksheet.getColumnCount() + range.endColumn - range.startColumn + 1);

        // remove cells contents by directly mutating worksheetCellMatrix
        const cellMatrix = worksheet.getCellMatrix();
        cellMatrix.insertColumns(range.startColumn, colCount);

        return true;
    },
};
