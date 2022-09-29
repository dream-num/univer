import { ColumnManager } from '../Domain/ColumnManager';

/**
 *
 * @param columnIndex
 * @param columnWidth
 * @param columnManager
 * @returns
 *
 * @internal
 */
export function SetColumnWidth(
    columnIndex: number = 0,
    columnWidth: number[],
    columnManager: ColumnManager
) {
    const result: number[] = [];
    for (let i = columnIndex; i < columnIndex + columnWidth.length; i++) {
        const column = columnManager.getColumnOrCreate(i);
        result[i] = column.w;
        column.w = columnWidth[i];
    }
    return result;
}
