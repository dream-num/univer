import { ColumnManager } from '../Domain/ColumnManager';
import { CommandModel } from '../../Command';
import { ISetColumnShowActionData } from '../../Types/Interfaces/IActionModel';

/**
 *
 * @param columnIndex
 * @param columnCount
 * @param columnManager
 *
 * @internal
 */
export function SetColumnHide(columnIndex: number = 0, columnCount: number, columnManager: ColumnManager): void {
    for (let i = columnIndex; i < columnIndex + columnCount; i++) {
        const column = columnManager.getColumnOrCreate(i);
        column.hd = 1;
    }
}

export function SetColumnHideApply(unit: CommandModel, data: ISetColumnShowActionData) {
    const workbook = unit.WorkBookUnit;
    const worksheet = workbook!.getSheetBySheetId(data.sheetId)!;
    const columnIndex = data.columnIndex;
    const columnCount = data.columnCount;
    const columnManager = worksheet.getColumnManager();
    for (let i = columnIndex; i < columnIndex + columnCount; i++) {
        const column = columnManager.getColumnOrCreate(i);
        column.hd = 1;
    }
}
