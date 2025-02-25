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

import type { IMutation, IObjectArrayPrimitiveType, IRange, Nullable, Worksheet } from '@univerjs/core';
import { CommandType, IUniverInstanceService } from '@univerjs/core';

import { getSheetCommandTarget } from '../commands/utils/target-util';

export interface ISetWorksheetColWidthMutationParams {
    unitId: string;
    subUnitId: string;
    ranges: IRange[];
    colWidth: number | IObjectArrayPrimitiveType<Nullable<number>>;
}

/**
 * This factory is for generating undo mutations for command {@link DeltaColumnWidthCommand}.
 *
 * Note that this mutation may return multi mutations params if the column width is different
 * for each column in the range.
 */
export const SetWorksheetColWidthMutationFactory = (
    params: ISetWorksheetColWidthMutationParams,
    worksheet: Worksheet
): ISetWorksheetColWidthMutationParams => {
    const { unitId, subUnitId, ranges } = params;
    const colWidth: IObjectArrayPrimitiveType<Nullable<number>> = {};
    const manager = worksheet.getColumnManager();

    for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        for (let j = range.startColumn; j < range.endColumn + 1; j++) {
            const column = manager.getColumnOrCreate(j);
            colWidth[j] = column.w;
        }
    }

    return {
        unitId,
        subUnitId,
        ranges,
        colWidth,
    };
};

/**
 * Set width of column manually
 */
export const SetWorksheetColWidthMutation: IMutation<ISetWorksheetColWidthMutationParams> = {
    id: 'sheet.mutation.set-worksheet-col-width',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { worksheet } = target;
        const defaultColumnWidth = worksheet.getConfig().defaultColumnWidth;
        const manager = worksheet.getColumnManager();
        const ranges = params.ranges;
        for (let i = 0; i < ranges.length; i++) {
            const range = ranges[i];
            for (let j = range.startColumn; j < range.endColumn + 1; j++) {
                const visible = worksheet.getColVisible(j);
                if (!visible) continue;
                const column = manager.getColumnOrCreate(j);
                if (typeof params.colWidth === 'number') {
                    column.w = params.colWidth;
                } else {
                    column.w = params.colWidth[j] ?? defaultColumnWidth;
                }
            }
        }

        return true;
    },
};
