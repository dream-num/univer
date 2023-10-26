import { IRowAutoHeightInfo } from '@univerjs/base-render';
import { CommandType, IMutation, IRange, IUniverInstanceService, Nullable, ObjectArray } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

const MAXIMUM_ROW_HEIGHT = 2000;

export interface ISetWorksheetRowHeightMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: IRange[];
    rowHeight: number | ObjectArray<number>;
}

export interface ISetWorksheetRowIsAutoHeightMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: IRange[];
    autoHeightInfo: boolean | ObjectArray<Nullable<boolean>>;
}

export interface ISetWorksheetRowAutoHeightMutationParams {
    workbookId: string;
    worksheetId: string;
    rowsAutoHeightInfo: IRowAutoHeightInfo[];
}

export const SetWorksheetRowHeightMutationFactory = (
    accessor: IAccessor,
    params: ISetWorksheetRowHeightMutationParams
): ISetWorksheetRowHeightMutationParams => {
    const { workbookId, worksheetId, ranges } = params;
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
    const worksheet = workbook?.getSheetBySheetId(worksheetId);

    if (worksheet == null) {
        throw new Error('worksheet is null error!');
    }

    const rowHeight = new ObjectArray<number>();
    const manager = worksheet.getRowManager();

    for (const { startRow, endRow } of ranges) {
        for (let rowIndex = startRow; rowIndex < endRow + 1; rowIndex++) {
            const row = manager.getRowOrCreate(rowIndex);
            rowHeight.set(rowIndex, row.h);
        }
    }

    return {
        workbookId,
        worksheetId,
        ranges,
        rowHeight,
    };
};

export const SetWorksheetRowIsAutoHeightMutationFactory = (
    accessor: IAccessor,
    params: ISetWorksheetRowIsAutoHeightMutationParams
): ISetWorksheetRowIsAutoHeightMutationParams => {
    const { workbookId, worksheetId, ranges } = params;

    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
    const worksheet = workbook!.getSheetBySheetId(worksheetId);

    const autoHeightInfo = new ObjectArray<Nullable<boolean>>();
    const manager = worksheet!.getRowManager();

    for (const { startRow, endRow } of ranges) {
        for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
            const row = manager.getRowOrCreate(rowIndex);

            autoHeightInfo.set(rowIndex, row.isAutoHeight);
        }
    }

    return {
        workbookId,
        worksheetId,
        ranges,
        autoHeightInfo,
    };
};

export const SetWorksheetRowAutoHeightMutationFactory = (
    accessor: IAccessor,
    params: ISetWorksheetRowAutoHeightMutationParams
): ISetWorksheetRowAutoHeightMutationParams => {
    const { workbookId, worksheetId, rowsAutoHeightInfo } = params;
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
    const worksheet = workbook?.getSheetBySheetId(worksheetId);

    const results: IRowAutoHeightInfo[] = [];
    const manager = worksheet!.getRowManager();

    for (const rowInfo of rowsAutoHeightInfo) {
        const { row } = rowInfo;
        const { ah } = manager.getRowOrCreate(row);

        results.push({
            row,
            autoHeight: ah,
        });
    }

    return {
        workbookId,
        worksheetId,
        rowsAutoHeightInfo: results,
    };
};

export const SetWorksheetRowHeightMutation: IMutation<ISetWorksheetRowHeightMutationParams> = {
    id: 'sheet.mutation.set-worksheet-row-height',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { workbookId, worksheetId, ranges, rowHeight } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);

        const worksheet = workbook?.getSheetBySheetId(worksheetId);
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
                    row.h = rowHeight.get(rowIndex) ?? defaultRowHeight;
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
        const { workbookId, worksheetId, ranges, autoHeightInfo } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);

        const worksheet = workbook?.getSheetBySheetId(worksheetId);
        if (!worksheet) {
            return false;
        }

        const defaultRowIsAutoHeight = undefined;
        const manager = worksheet.getRowManager();

        for (const { startRow, endRow } of ranges) {
            for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
                const row = manager.getRowOrCreate(rowIndex);

                if (typeof autoHeightInfo === 'boolean') {
                    row.isAutoHeight = autoHeightInfo;
                } else {
                    row.isAutoHeight = autoHeightInfo.get(rowIndex - startRow) ?? defaultRowIsAutoHeight;
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
        const { workbookId, worksheetId, rowsAutoHeightInfo } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        const worksheet = workbook?.getSheetBySheetId(worksheetId);

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
