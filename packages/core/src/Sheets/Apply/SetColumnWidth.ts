import { BooleanNumber } from '../../Types/Enum';
import { ISetColumnWidthActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

/**
 *
 * @param columnIndex
 * @param columnWidth
 * @param columnManager
 * @returns
 *
 * @internal
 */
export function SetColumnWidthApply(spreadsheetModel: SpreadsheetModel, data: ISetColumnWidthActionData) {
    const worksheetModel = spreadsheetModel.worksheets[data.sheetId];
    const { column } = worksheetModel;
    const columnIndex = data.columnIndex;
    const columnWidth = data.columnWidth;

    const result: number[] = [];
    for (let i = columnIndex; i < columnIndex + columnWidth.length; i++) {
        const columnInfo = column.get(i);
        const width = columnWidth[i - columnIndex];
        if (columnInfo) {
            result[i - columnIndex] = columnInfo.w;
            columnInfo.w = width;
        } else {
            const defaultColumnInfo = {
                w: width,
                hd: BooleanNumber.FALSE,
            };
            column.set(i, defaultColumnInfo);
            result[i - columnIndex] = worksheetModel.defaultColumnWidth;
        }
    }
    return result;
}
