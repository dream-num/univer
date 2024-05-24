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

import type { BooleanNumber, IMutation, IObjectArrayPrimitiveType, IRange, Nullable, Workbook } from '@univerjs/core';
import { CommandType, IUniverInstanceService } from '@univerjs/core';
import type { IRowAutoHeightInfo } from '@univerjs/engine-render';
import type { IAccessor } from '@wendellhu/redi';

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
    accessor: IAccessor,
    params: ISetWorksheetRowHeightMutationParams
): ISetWorksheetRowHeightMutationParams => {
    const { unitId, subUnitId, ranges } = params;
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook = univerInstanceService.getUniverSheetInstance(unitId);
    const worksheet = workbook?.getSheetBySheetId(subUnitId);

    if (worksheet == null) {
        throw new Error('worksheet is null error!');
    }

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
    accessor: IAccessor,
    params: ISetWorksheetRowIsAutoHeightMutationParams
): ISetWorksheetRowIsAutoHeightMutationParams => {
    const { unitId, subUnitId, ranges } = params;

    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook = univerInstanceService.getUniverSheetInstance(unitId)!;
    const worksheet = workbook.getSheetBySheetId(subUnitId)!;

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
    accessor: IAccessor,
    params: ISetWorksheetRowAutoHeightMutationParams
): ISetWorksheetRowAutoHeightMutationParams => {
    const { unitId, subUnitId, rowsAutoHeightInfo } = params;
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook = univerInstanceService.getUniverSheetInstance(unitId);
    const worksheet = workbook?.getSheetBySheetId(subUnitId);

    if (!worksheet) {
        return {
            unitId,
            subUnitId,
            rowsAutoHeightInfo: [],
        };
    }

    const results: IRowAutoHeightInfo[] = [];
    const manager = worksheet.getRowManager();

    for (const rowInfo of rowsAutoHeightInfo) {
        const { row } = rowInfo;
        const { ah } = manager.getRowOrCreate(row);

        results.push({
            row,
            autoHeight: ah,
        });
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
        const { unitId, subUnitId, ranges, rowHeight } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getUniverSheetInstance(unitId);

        const worksheet = workbook?.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            return false;
        }

        const defaultRowHeight = worksheet.getConfig().defaultRowHeight;
        const manager = worksheet.getRowManager();

        for (const { startRow, endRow } of ranges) {
            for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
                const row = manager.getRowOrCreate(rowIndex);

                if (typeof rowHeight === 'number') {
                    row.h = rowHeight;
                } else {
                    row.h = rowHeight[rowIndex] ?? defaultRowHeight;
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
        const { unitId, subUnitId, ranges, autoHeightInfo } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getUniverSheetInstance(unitId);

        const worksheet = workbook?.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            return false;
        }

        const defaultRowIsAutoHeight = undefined;
        const manager = worksheet.getRowManager();

        for (const { startRow, endRow } of ranges) {
            for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
                const row = manager.getRowOrCreate(rowIndex);

                if (typeof autoHeightInfo === 'number') {
                    row.ia = autoHeightInfo;
                } else {
                    row.ia = autoHeightInfo[rowIndex - startRow] ?? defaultRowIsAutoHeight;
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
        const { unitId, subUnitId, rowsAutoHeightInfo } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getUnit<Workbook>(unitId);
        const worksheet = workbook?.getSheetBySheetId(subUnitId);

        if (!worksheet || !workbook) {
            return false;
        }

        const rowManager = worksheet.getRowManager();

        for (const { row, autoHeight } of rowsAutoHeightInfo) {
            const curRow = rowManager.getRowOrCreate(row);
            curRow.ah = autoHeight;
        }

        return true;
    },
};
