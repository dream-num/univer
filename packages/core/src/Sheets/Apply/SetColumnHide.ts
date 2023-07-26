import { ISetColumnShowActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';
import { BooleanNumber } from '../../Types/Enum';

/**
 *
 * @param columnIndex
 * @param columnCount
 * @param columnManager
 *
 * @internal
 */

export function SetColumnHideApply(spreadsheetModel: SpreadsheetModel, data: ISetColumnShowActionData) {
    const worksheetModel = spreadsheetModel.worksheets[data.sheetId];
    const { column } = worksheetModel;
    const columnIndex = data.columnIndex;
    const columnCount = data.columnCount;

    for (let i = columnIndex; i < columnIndex + columnCount; i++) {
        const columnInfo = column.get(i);
        if (columnInfo) {
            columnInfo.hd = BooleanNumber.TRUE;
        } else {
            const defaultColumnInfo = {
                w: worksheetModel.defaultColumnWidth,
                hd: BooleanNumber.TRUE,
            };
            column.set(i, defaultColumnInfo);
        }
    }
}
