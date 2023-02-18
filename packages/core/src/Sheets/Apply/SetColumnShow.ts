import { ColumnManager } from '../Domain/ColumnManager';
import { CommandUnit, ISetColumnShowActionData } from '../../Command';

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

export function SetColumnShowApply(
    unit: CommandUnit,
    data: ISetColumnShowActionData
): void {
    const workbook = unit.WorkBookUnit;
    const worksheet = workbook!.getSheetBySheetId(data.sheetId);
    const columnIndex = 0;
    const columnCount = 0;
    const columnManager = worksheet!.getColumnManager();

    for (let i = columnIndex; i < columnIndex + columnCount; i++) {
        const column = columnManager.getColumn(i);
        if (column) {
            column.hd = 0;
        }
    }
}
