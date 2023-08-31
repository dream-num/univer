import { RowManager } from '../Domain';
import { CommandUnit } from '../../Command';
import { ISetRowHeightActionData } from '../Action';

/**
 *
 * @param rowIndex
 * @param rowHeight
 * @param rowManager
 * @returns
 *
 * @internal
 */
export function SetRowHeight(rowIndex: number = 0, rowHeight: number[], rowManager: RowManager) {
    const result: number[] = [];
    for (let i = rowIndex; i < rowIndex + rowHeight.length; i++) {
        const row = rowManager.getRowOrCreate(i);
        result[i - rowIndex] = row.h;
        row.h = rowHeight[i - rowIndex];
    }
    return result;
}

export function SetRowHeightApply(unit: CommandUnit, data: ISetRowHeightActionData) {
    const workbook = unit.WorkBookUnit;
    const worksheet = workbook!.getSheetBySheetId(data.sheetId);
    const rowIndex = data.rowIndex;
    const rowHeight = data.rowHeight;
    const rowManager = worksheet!.getRowManager();

    const result: number[] = [];
    for (let i = rowIndex; i < rowIndex + rowHeight.length; i++) {
        const row = rowManager.getRowOrCreate(i);
        result[i - rowIndex] = row.h;
        row.h = rowHeight[i - rowIndex];
    }
    return result;
}
