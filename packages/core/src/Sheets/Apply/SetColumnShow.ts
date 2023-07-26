import { BooleanNumber } from '../../Types/Enum';
import { ISetColumnShowActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

/**
 *
 * @param columnIndex
 * @param columnCount
 * @param columnManager
 *
 * @internal
 */

export function SetColumnShowApply(spreadsheetModel: SpreadsheetModel, data: ISetColumnShowActionData): void {
    const worksheetModel = spreadsheetModel.worksheets[data.sheetId];
    const { column } = worksheetModel;
    const columnIndex = data.columnIndex;
    const columnCount = data.columnCount;

    for (let i = columnIndex; i < columnIndex + columnCount; i++) {
        const columnInfo = column.get(i);
        if (columnInfo) {
            columnInfo.hd = BooleanNumber.FALSE;
        } else {
            const defaultColumnInfo = {
                w: worksheetModel.defaultColumnWidth,
                hd: BooleanNumber.FALSE,
            };
            column.set(i, defaultColumnInfo);
        }
    }
}
