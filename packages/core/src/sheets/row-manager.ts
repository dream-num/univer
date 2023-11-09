import { Nullable, ObjectArray, ObjectArrayType, Tools } from '../shared';
import { BooleanNumber } from '../types/enum';
import { IRange, IRowData, IWorksheetConfig, RANGE_TYPE } from '../types/interfaces';

/**
 * Manage configuration information of all rows, get row height, row length, set row height, etc.
 *
 * @deprecated This class is not necessary. It increases the complexity of the code and does not bring any benefits.
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
            const { isAutoHeight, ah, h } = row;

            height += (isAutoHeight == null || !!isAutoHeight) && typeof ah === 'number' ? ah : h;
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

    getHiddenRows(start: number = 0, end: number = this._rowData.getLength() - 1): IRange[] {
        const hiddenRows: IRange[] = [];

        let inHiddenRange = false;
        let startRow = -1;

        for (let i = start; i <= end; i++) {
            const visible = this.getRowVisible(i);
            if (inHiddenRange && visible) {
                inHiddenRange = false;
                hiddenRows.push({
                    startRow,
                    endRow: i - 1,
                    startColumn: 0,
                    endColumn: 0,
                    rangeType: RANGE_TYPE.ROW,
                });
            } else if (!inHiddenRange && !visible) {
                inHiddenRange = true;
                startRow = i;
            }
        }

        if (inHiddenRange) {
            hiddenRows.push({ startRow, endRow: end, startColumn: 0, endColumn: 0, rangeType: RANGE_TYPE.ROW });
        }

        return hiddenRows;
    }

    getRowVisible(rowPos: number): boolean {
        const row = this.getRow(rowPos);
        if (!row) {
            return true;
        }

        return row.hd !== BooleanNumber.TRUE;
    }

    /**
     * Get count of row in the sheet
     * @returns
     */
    getSize(): number {
        return this._rowData.getLength();
    }
}
