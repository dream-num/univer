import { IColumnData } from '../../Types/Interfaces/IColumnData';
import { IRemoveColumnAction } from '../../Types/Interfaces/ISheetActionInterfaces';
import { ObjectArray } from '../../Shared/ObjectArray';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

export function RemoveColumnApply(spreadsheetModel: SpreadsheetModel, data: IRemoveColumnAction) {
    const worksheetModel = spreadsheetModel.worksheets[data.sheetId]; //unit.WorkBookUnit!.getSheetBySheetId(data.sheetId);
    const columnModel = worksheetModel.column;
    const start = data.columnIndex;
    const end = data.columnIndex + data.columnCount;
    const result = new ObjectArray<IColumnData>();
    for (let i = start; i < end; i++) {
        const splice = columnModel.splice(data.columnIndex, 1);
        if (splice.getLength()) {
            result.set(i, splice.first() as IColumnData);
        }
    }
    return result.getLength();
}
