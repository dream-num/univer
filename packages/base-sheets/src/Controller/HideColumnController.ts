import { Inject } from '@wendellhu/redi';
import { BooleanNumber, ObjectArray } from '@univerjs/core';
import { IColumnRulerData } from '../Basics/Interfaces/IRulerManager';
import { ColumnRulerManager } from '../Basics/Register/ColumnRegister';

export interface IHideColumnData {
    [sheetId: string]: ObjectArray<IColumnRulerData>;
}

export class HideColumnController {
    // TODO workbook worksheet
    private _columnData: IHideColumnData = {};

    constructor(@Inject(ColumnRulerManager) private readonly _columnRulerManager: ColumnRulerManager) {}

    getColumnData(sheetId: string) {
        return this._columnData[sheetId];
    }

    /**
     * Set hidden columns and store them in RulerManager
     * @param columnIndex
     * @param numColumns
     */
    hideColumns(sheetId: string, columnIndex: number, numColumns: number) {
        for (let i = columnIndex; i < columnIndex + numColumns; i++) {
            let sheetData = this._columnData[sheetId];

            if (!sheetData) {
                this._columnData[sheetId] = new ObjectArray();
            }

            let column = this._columnData[sheetId].get(i);

            if (column) {
                column.hd = BooleanNumber.TRUE;
            } else {
                const create = {
                    hd: BooleanNumber.TRUE,
                };
                this._columnData[sheetId].set(i, create);
            }
        }

        this._columnRulerManager.setHidden(sheetId, columnIndex, numColumns);
    }
}