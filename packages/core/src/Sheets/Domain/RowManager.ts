import { Nullable, ObjectArray, ObjectArrayType, Tools } from '../../Shared';
import { BooleanNumber } from '../../Types/Enum';
import { IRowData, IWorksheetConfig } from '../../Types/Interfaces';

/**
 * Manage configuration information of all rows, get row height, row length, set row height, etc.
 */
export class RowManager {
    private _rowData: ObjectArray<IRowData>;

    constructor(
        private readonly _config: IWorksheetConfig,
        data: ObjectArrayType<Partial<IRowData>>
    ) {
        this._rowData = Tools.createObjectArray(data) as ObjectArray<IRowData>;
    }

    /**
     * Get height and hidden status of columns in the sheet
     * @returns
     */
    getRowData(): ObjectArray<IRowData> {
        return this._rowData;
    }

    getRowDatas(rowPos: number, numRows: number): ObjectArray<IRowData> {
        const rowData = new ObjectArray<IRowData>();
        for (let i = rowPos; i < rowPos + numRows; i++) {
            const data = this.getRowOrCreate(i);
            rowData.push(data);
        }
        return rowData;
    }

    getRowHeight(rowPos: number): number;
    getRowHeight(rowPos: number, count: number): number;
    getRowHeight(rowPos: number, count: number = 1): number {
        const { _rowData } = this;
        const config = this._config;
        let height: number = 0;

        for (let i = 0; i < count; i++) {
            const row = _rowData.obtain(i + rowPos, {
                hd: BooleanNumber.FALSE,
                h: config.defaultRowHeight,
            });
            height += row.h;
        }

        return height;
    }

    /**
     * Get row data of given row
     * @param rowPos row index
     * @returns
     */
    getRow(rowPos: number): Nullable<IRowData> {
        const { _rowData } = this;
        return _rowData.get(rowPos);
    }

    /**
     * Get count of column in the sheet
     * @returns
     */
    getSize(): number {
        return this._rowData.getLength();
    }

    /**
     * Get given row data or create a row data when it's null
     * @param rowPos row index
     * @returns
     */
    getRowOrCreate(rowPos: number): IRowData {
        const { _rowData } = this;
        const row = _rowData.get(rowPos);
        if (row) {
            return row;
        }
        const config = this._config;
        const create = { hd: BooleanNumber.FALSE, h: config.defaultRowHeight };
        _rowData.set(rowPos, create);
        return create;
    }
}
