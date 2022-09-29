import { ColumnManager } from '../Domain/ColumnManager';

/**
 *
 * @param columnIndex
 * @param columnCount
 * @param columnManager
 *
 * @internal
 */
export function SetColumnShow(
    columnIndex: number = 0,
    columnCount: number,
    columnManager: ColumnManager
): void {
    for (let i = columnIndex; i < columnIndex + columnCount; i++) {
        const column = columnManager.getColumn(i);
        if (column) {
            column.hd = 0;
        }
    }
}
