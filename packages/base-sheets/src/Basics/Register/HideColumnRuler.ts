import { BooleanNumber, ObjectArray } from '@univerjs/core';
import { SheetPlugin } from '../../SheetPlugin';
import { BaseColumnRuler, BaseColumnRulerFactory } from './ColumnRegister';
import { IColumnRulerData } from '../Interfaces/IRulerManager';

/**
 * TODO insertColumn/insertRange/insertRange/deleteRange
 */
export class HideColumnRuler extends BaseColumnRuler<SheetPlugin> {
    override getUpdatedHidden(): ObjectArray<IColumnRulerData> {
        const columnIndex = this._columnIndex;
        const numColumns = this._numColumns;
        const sheetId = this._sheetId;
        const columnData = this._plugin.getHideColumnController().getColumnData(sheetId);
        const newColumnData: ObjectArray<IColumnRulerData> = new ObjectArray();

        for (let i = columnIndex; i < columnIndex + numColumns; i++) {
            const data = columnData.get(i) || { hd: BooleanNumber.FALSE };
            newColumnData.set(i, data);
        }

        return newColumnData;
    }
}

export class HideColumnRulerFactory extends BaseColumnRulerFactory<SheetPlugin> {
    override get zIndex(): number {
        return 0;
    }

    override create(sheetId: string, columnIndex: number, numColumns: number): HideColumnRuler {
        return new HideColumnRuler(sheetId, columnIndex, numColumns, this._plugin);
    }
}
