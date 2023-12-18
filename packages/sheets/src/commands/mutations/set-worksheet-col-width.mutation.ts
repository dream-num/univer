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

import type { IMutation, IObjectArrayPrimitiveType, IRange, Nullable } from '@univerjs/core';
import { CommandType, IUniverInstanceService } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

export interface ISetWorksheetColWidthMutationParams {
    unitId: string;
    subUnitId: string;
    ranges: IRange[];
    colWidth: number | IObjectArrayPrimitiveType<Nullable<number>>;
}

export const SetWorksheetColWidthMutationFactory = (
    accessor: IAccessor,
    params: ISetWorksheetColWidthMutationParams
): ISetWorksheetColWidthMutationParams => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const universheet = univerInstanceService.getUniverSheetInstance(params.unitId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    const worksheet = universheet.getSheetBySheetId(params.subUnitId);
    if (worksheet == null) {
        throw new Error('universheet is null error!');
    }
    const colWidth: IObjectArrayPrimitiveType<Nullable<number>> = {};
    const manager = worksheet.getColumnManager();
    const ranges = params.ranges;
    for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        for (let j = range.startColumn; j < range.endColumn + 1; j++) {
            const column = manager.getColumnOrCreate(j);
            colWidth[j] = column.w;
        }
    }

    return {
        unitId: params.unitId,
        subUnitId: params.subUnitId,
        ranges: params.ranges,
        colWidth,
    };
};

export const SetWorksheetColWidthMutation: IMutation<ISetWorksheetColWidthMutationParams> = {
    id: 'sheet.mutation.set-worksheet-col-width',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const universheet = univerInstanceService.getUniverSheetInstance(params.unitId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const worksheet = universheet.getSheetBySheetId(params.subUnitId);
        if (!worksheet) {
            return false;
        }

        const defaultColumnWidth = worksheet.getConfig().defaultColumnWidth;
        const manager = worksheet.getColumnManager();
        const ranges = params.ranges;

        for (let i = 0; i < ranges.length; i++) {
            const range = ranges[i];
            for (let j = range.startColumn; j < range.endColumn + 1; j++) {
                const column = manager.getColumnOrCreate(j);
                if (typeof params.colWidth === 'number') {
                    column.w = params.colWidth;
                } else {
                    column.w = params.colWidth[j - range.startColumn] ?? defaultColumnWidth;
                }
            }
        }

        return true;
    },
};
