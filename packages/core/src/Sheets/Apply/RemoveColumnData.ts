import { ICellData } from '../../Types/Interfaces/ICellData';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { IRemoveColumnDataAction } from '../../Types/Interfaces/ISheetActionInterfaces';

export function RemoveColumnDataApply(spreadsheetModel: SpreadsheetModel, data: IRemoveColumnDataAction): ObjectMatrixPrimitiveType<ICellData> {
    const worksheet = spreadsheetModel.worksheets[data.sheetId];
    return worksheet.cell.spliceColumns(data.columnIndex, data.columnCount).toJSON();
}
