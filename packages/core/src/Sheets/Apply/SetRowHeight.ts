import { RowManager } from '../Domain/RowManager';

/**
 *
 * @param rowIndex
 * @param rowHeight
 * @param rowManager
 * @returns
 *
 * @internal
 */
export function SetRowHeight(
    rowIndex: number = 0,
    rowHeight: number[],
    rowManager: RowManager
) {
    const result: number[] = [];
    for (let i = rowIndex; i < rowIndex + rowHeight.length; i++) {
        const row = rowManager.getRowOrCreate(i);
        result[i - rowIndex] = row.h;
        row.h = rowHeight[i - rowIndex];
    }
    return result;
}
