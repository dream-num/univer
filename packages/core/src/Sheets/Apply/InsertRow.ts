import { IRowData } from '../../Types/Interfaces';
import { ObjectArray, ObjectArrayPrimitiveType } from '../../Shared';
import { CommandModel } from '../../Command';
import { IInsertRowActionData } from '../Action';

/**
 * Inserts addData into rowData
 * @param rowIndex
 * @param rowData
 * @param insertData
 *
 * @internal
 */
export function InsertRow(rowIndex: number = 0, rowCount: number = 1, primitiveData: ObjectArrayPrimitiveType<IRowData>) {
    const wrapper = new ObjectArray(primitiveData);
    wrapper.inserts(rowIndex, new ObjectArray(rowCount));
}

export function InsertRowApply(unit: CommandModel, data: IInsertRowActionData) {
    const worksheet = unit.WorkBookUnit!.getSheetBySheetId(data.sheetId);
    const rowManager = worksheet!.getRowManager()!;
    const primitiveData = rowManager.getRowData().toJSON();

    const wrapper = new ObjectArray(primitiveData);
    wrapper.inserts(data.rowIndex, new ObjectArray(data.rowCount));
}
