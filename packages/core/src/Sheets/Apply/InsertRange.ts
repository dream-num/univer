import { Dimension } from '../../Types/Enum';
import { ICellData } from '../../Types/Interfaces';
import { IInsertRangeActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

export function InsertRangeApply(spreadsheetModel: SpreadsheetModel, data: IInsertRangeActionData) {
    const worksheet = spreadsheetModel.worksheets[data.sheetId];
    const cellMatrix = worksheet.cell;
    const rowCount = cellMatrix.getLength();
    const columnCount = cellMatrix.getRange().endColumn;

    const { startRow, endRow, startColumn, endColumn } = data.rangeData;
    const rows = endRow - startRow + 1;
    const columns = endColumn - startColumn + 1;

    const lastEndRow = rowCount;
    const lastEndColumn = columnCount;

    if (data.shiftDimension === Dimension.ROWS) {
        // build new data
        for (let r = lastEndRow; r >= startRow; r--) {
            for (let c = startColumn; c <= endColumn; c++) {
                // get value blow current range
                const value = cellMatrix.getValue(r, c);
                cellMatrix.setValue(r + rows, c, value as ICellData);
            }
        }
        // insert cell value from user
        for (let r = endRow; r >= startRow; r--) {
            for (let c = startColumn; c <= endColumn; c++) {
                cellMatrix.setValue(r, c, data.cellValue[r - startRow][c - startColumn]);
            }
        }
    } else if (data.shiftDimension === Dimension.COLUMNS) {
        for (let r = startRow; r <= endRow; r++) {
            for (let c = lastEndColumn; c >= startColumn; c--) {
                // get value blow current range
                const value = cellMatrix.getValue(r, c);

                cellMatrix.setValue(r, c + columns, value as ICellData);
            }
        }
        for (let r = startRow; r <= endRow; r++) {
            for (let c = endColumn; c >= startColumn; c--) {
                cellMatrix.setValue(r, c, data.cellValue[r - startRow][c - startColumn]);
            }
        }
    }
}
