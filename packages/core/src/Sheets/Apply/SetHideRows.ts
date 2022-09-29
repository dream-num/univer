import { RowManager } from '../Domain/RowManager';

/**
 *
 * @param rowIndex
 * @param rowCount
 * @param rowManager
 *
 * @internal
 */
export function SetHideRow(
    rowIndex: number = 0,
    rowCount: number,
    rowManager: RowManager
) {
    for (let i = rowIndex; i < rowIndex + rowCount; i++) {
        const row = rowManager.getRowOrCreate(i);
        if (row) {
            row.hd = 1;
        }
    }
}
