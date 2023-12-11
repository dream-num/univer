/**
 * Copyright 2023 DreamNum Inc.
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

import type { IColumnData, IMutation, IRowData, Worksheet } from '@univerjs/core';
import { CommandType, IUniverInstanceService, ObjectArray } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type {
    IInsertColMutationParams,
    IInsertRowMutationParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
} from '../../basics/interfaces/mutation-interface';

export const RemoveRowsUndoMutationFactory = (
    params: IRemoveRowsMutationParams,
    worksheet: Worksheet
): IInsertRowMutationParams => {
    const manager = worksheet.getRowManager();
    const rowPrimitive = manager.getRowData().toJSON();
    const rowWrapper = new ObjectArray(rowPrimitive);
    const rowInfo = new ObjectArray<IRowData>();

    for (let i = 0; i < params.ranges.length; i++) {
        const range = params.ranges[i];
        const slice = rowWrapper.slice(range.startRow, range.endRow);
        rowInfo.concat(slice);
    }

    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        ranges: params.ranges,
        rowInfo,
    };
};

export const RemoveRowMutation: IMutation<IRemoveRowsMutationParams> = {
    id: 'sheet.mutation.remove-rows',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const universheet = univerInstanceService.getUniverSheetInstance(params.workbookId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const worksheet = universheet.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;

        const manager = worksheet.getRowManager();
        const rowPrimitive = manager.getRowData().toJSON();
        const rowWrapper = new ObjectArray(rowPrimitive);

        for (let i = 0; i < params.ranges.length; i++) {
            const range = params.ranges[i];
            const start = range.startRow;
            const end = range.endRow;

            for (let j = start; j <= end; j++) {
                rowWrapper.splice(j, 1);
            }
        }

        worksheet.setRowCount(
            worksheet.getRowCount() - params.ranges.reduce((acc, range) => acc + range.endRow - range.startRow + 1, 0)
        );

        return true;
    },
};

export const RemoveColMutationFactory = (
    accessor: IAccessor,
    params: IRemoveColMutationParams
): IInsertColMutationParams => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const universheet = univerInstanceService.getUniverSheetInstance(params.workbookId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    const worksheet = universheet.getSheetBySheetId(params.worksheetId);

    if (worksheet == null) {
        throw new Error('worksheet is null error!');
    }

    const manager = worksheet.getColumnManager();
    const columnPrimitive = manager.getColumnData().toJSON();
    const columnWrapper = new ObjectArray(columnPrimitive);
    const colInfo = new ObjectArray<IColumnData>();

    for (let i = 0; i < params.ranges.length; i++) {
        const range = params.ranges[i];

        const slice = columnWrapper.slice(range.startColumn, range.endColumn);
        colInfo.concat(slice);
    }

    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        ranges: params.ranges,
        colInfo,
    };
};

export const RemoveColMutation: IMutation<IRemoveColMutationParams> = {
    id: 'sheet.mutation.remove-col',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const universheet = univerInstanceService.getUniverSheetInstance(params.workbookId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const worksheet = universheet.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;

        const manager = worksheet.getColumnManager();
        const columnPrimitive = manager.getColumnData().toJSON();
        const columnWrapper = new ObjectArray(columnPrimitive);

        for (let i = 0; i < params.ranges.length; i++) {
            const range = params.ranges[i];
            const start = range.startColumn;
            const end = range.endColumn;

            for (let j = start; j <= end; j++) {
                columnWrapper.splice(j, 1);
            }
        }

        worksheet.setColumnCount(
            worksheet.getColumnCount() -
                params.ranges.reduce((acc, range) => acc + range.endColumn - range.startColumn + 1, 0)
        );

        return true;
    },
};
