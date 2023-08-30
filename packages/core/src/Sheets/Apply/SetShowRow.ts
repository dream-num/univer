import { RowManager } from '../Domain/RowManager';

/**
 *
 * @param rowIndex
 * @param rowCount
 * @param rowManager
 *
 * @internal
 */
export function SetShowRow(rowIndex: number = 0, rowCount: number, rowManager: RowManager) {
    for (let i = rowIndex; i < rowIndex + rowCount; i++) {
        const row = rowManager.getRow(i);
        if (row) {
            row.hd = 0;
        }
    }
}
