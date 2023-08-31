import { ColumnManager } from '../Domain/ColumnManager';
import { CommandUnit } from '../../Command';
import { ISetColumnWidthActionData } from '../Action';

/**
 *
 * @param columnIndex
 * @param columnWidth
 * @param columnManager
 * @returns
 *
 * @internal
 */
export function SetColumnWidth(columnIndex: number = 0, columnWidth: number[], columnManager: ColumnManager) {
    const result: number[] = [];
    for (let i = columnIndex; i < columnIndex + columnWidth.length; i++) {
        const column = columnManager.getColumnOrCreate(i);
        result[i - columnIndex] = column.w;
        column.w = columnWidth[i - columnIndex];
    }
    return result;
}

export function SetColumnWidthApply(unit: CommandUnit, data: ISetColumnWidthActionData) {
    const workbook = unit.WorkBookUnit;
    const worksheet = workbook!.getSheetBySheetId(data.sheetId);
    const columnIndex = data.columnIndex;
    const columnWidth = data.columnWidth;
    const columnManager = worksheet!.getColumnManager();

    const result: number[] = [];
    for (let i = columnIndex; i < columnIndex + columnWidth.length; i++) {
        const column = columnManager.getColumnOrCreate(i);
        result[i - columnIndex] = column.w;
        column.w = columnWidth[i - columnIndex];
    }
    return result;
}
