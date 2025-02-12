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

import { CommandType, IUniverInstanceService } from '@univerjs/core';
import type { BooleanNumber, IMutation, IObjectArrayPrimitiveType, IRange, IRowAutoHeightInfo, Nullable, Worksheet } from '@univerjs/core';
import { getSheetCommandTarget } from '../commands/utils/target-util';

const MAXIMUM_ROW_HEIGHT = 2000;

export interface ISetWorksheetRowHeightMutationParams {
    unitId: string;
    subUnitId: string;
    ranges: IRange[];
    rowHeight: number | IObjectArrayPrimitiveType<Nullable<number>>;
}

export interface ISetWorksheetRowIsAutoHeightMutationParams {
    unitId: string;
    subUnitId: string;
    ranges: IRange[];
    autoHeightInfo: BooleanNumber | IObjectArrayPrimitiveType<Nullable<BooleanNumber>>;
}

export interface ISetWorksheetRowAutoHeightMutationParams {
    unitId: string;
    subUnitId: string;
    rowsAutoHeightInfo: IRowAutoHeightInfo[];
}

export const SetWorksheetRowHeightMutationFactory = (
    params: ISetWorksheetRowHeightMutationParams,
    worksheet: Worksheet
): ISetWorksheetRowHeightMutationParams => {
    const { unitId, subUnitId, ranges } = params;

    const rowHeight: IObjectArrayPrimitiveType<Nullable<number>> = {};
    const manager = worksheet.getRowManager();

    for (const { startRow, endRow } of ranges) {
        for (let rowIndex = startRow; rowIndex < endRow + 1; rowIndex++) {
            const row = manager.getRowOrCreate(rowIndex);
            rowHeight[rowIndex] = row.h;
        }
    }

    return {
        unitId,
        subUnitId,
        ranges,
        rowHeight,
    };
};

export const SetWorksheetRowIsAutoHeightMutationFactory = (
    params: ISetWorksheetRowIsAutoHeightMutationParams,
    worksheet: Worksheet
): ISetWorksheetRowIsAutoHeightMutationParams => {
    const { unitId, subUnitId, ranges } = params;

    const autoHeightHash: IObjectArrayPrimitiveType<Nullable<BooleanNumber>> = {};
    const manager = worksheet.getRowManager();

    for (const { startRow, endRow } of ranges) {
        for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
            const row = manager.getRowOrCreate(rowIndex);

            autoHeightHash[rowIndex] = row.ia;
        }
    }

    return {
        unitId,
        subUnitId,
        ranges,
        autoHeightInfo: autoHeightHash,
    };
};

export const SetWorksheetRowAutoHeightMutationFactory = (
    params: ISetWorksheetRowAutoHeightMutationParams,
    worksheet: Worksheet
): ISetWorksheetRowAutoHeightMutationParams => {
    const { unitId, subUnitId, rowsAutoHeightInfo } = params;
    const results: IRowAutoHeightInfo[] = [];
    const manager = worksheet.getRowManager();

    for (const rowInfo of rowsAutoHeightInfo) {
        const { row } = rowInfo;
        const { ah } = manager.getRowOrCreate(row);

        results.push({ row, autoHeight: ah });
    }

    return {
        unitId,
        subUnitId,
        rowsAutoHeightInfo: results,
    };
};

export const SetWorksheetRowHeightMutation: IMutation<ISetWorksheetRowHeightMutationParams> = {
    id: 'sheet.mutation.set-worksheet-row-height',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { ranges, rowHeight } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { worksheet } = target;
        const manager = worksheet.getRowManager();
        const defaultRowHeight = worksheet.getConfig().defaultRowHeight;
        for (const { startRow, endRow } of ranges) {
            for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
                const row = manager.getRowOrCreate(rowIndex);

                if (typeof rowHeight === 'number') {
                    row.h = rowHeight;
                } else {
                    row.h = rowHeight[rowIndex] ?? defaultRowHeight; // Start from startRow
                }

                row.h = Math.min(MAXIMUM_ROW_HEIGHT, row.h);
            }
        }

        return true;
    },
};

export const SetWorksheetRowIsAutoHeightMutation: IMutation<ISetWorksheetRowIsAutoHeightMutationParams> = {
    id: 'sheet.mutation.set-worksheet-row-is-auto-height',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { ranges, autoHeightInfo } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const manager = target.worksheet.getRowManager();
        for (const { startRow, endRow } of ranges) {
            for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
                const row = manager.getRowOrCreate(rowIndex);

                if (typeof autoHeightInfo === 'number') {
                    row.ia = autoHeightInfo;
                } else {
                    row.ia = autoHeightInfo[rowIndex] ?? undefined;
                }
            }
        }

        return true;
    },
};

export const SetWorksheetRowAutoHeightMutation: IMutation<ISetWorksheetRowAutoHeightMutationParams> = {
    id: 'sheet.mutation.set-worksheet-row-auto-height',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { rowsAutoHeightInfo } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const rowManager = target.worksheet.getRowManager();

        for (const { row, autoHeight } of rowsAutoHeightInfo) {
            const curRow = rowManager.getRowOrCreate(row);
            curRow.ah = autoHeight;
        }

        return true;
    },
};
