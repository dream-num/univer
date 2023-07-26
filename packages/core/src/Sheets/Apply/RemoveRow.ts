import { IRowData } from '../../Types/Interfaces';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';
import { ObjectArray } from '../../Shared/ObjectArray';
import { IRemoveRowActionData } from '../../Types/Interfaces/ISheetActionInterfaces';

export function RemoveRowApply(spreadsheetModel: SpreadsheetModel, data: IRemoveRowActionData): number {
    const worksheet = spreadsheetModel.worksheets[data.sheetId];
    const result = new ObjectArray<IRowData>();
    const start = data.rowIndex;
    const end = data.rowIndex + data.rowCount;
    for (let i = start; i < end; i++) {
        const splice = worksheet.row.splice(data.rowIndex, 1);
        if (splice.getLength()) {
            result.set(i, splice.first() as IRowData);
        }
    }
    return result.getLength();
}
