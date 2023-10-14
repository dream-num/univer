import { Nullable, Tools } from '../Shared';
import { ObjectArray, ObjectArrayType } from '../Shared/ObjectArray';
import { BooleanNumber } from '../Types/Enum';
import { IColumnData, IRange, IWorksheetConfig, RANGE_TYPE } from '../Types/Interfaces';

/**
 * Manage configuration information of all columns, get column width, column length, set column width, etc.
 */
export class ColumnManager {
    private _columnData: ObjectArray<IColumnData>;

    constructor(
        private readonly _config: IWorksheetConfig,
        data: ObjectArrayType<Partial<IColumnData>>
    ) {
        this._columnData = Tools.createObjectArray(data) as ObjectArray<IColumnData>;
    }

    /**
     * Get width and hidden status of columns in the sheet
     * @returns
     */
    getColumnData(): ObjectArray<IColumnData> {
        return this._columnData;
    }

    getColVisible(colPos: number): boolean {
        const { _columnData } = this;
        const col = _columnData.get(colPos);
        if (!col) {
            return true;
        }
        return col.hd !== BooleanNumber.TRUE;
    }

    getHiddenCols(): IRange[] {
        const len = this._columnData.getLength();
        const hiddenCols: IRange[] = [];

        let inHiddenRange = false;
        let startColumn = -1;

        for (let i = 0; i < len; i++) {
            const visible = this.getColVisible(i);
            if (inHiddenRange && visible) {
                inHiddenRange = false;
                hiddenCols.push({
                    rangeType: RANGE_TYPE.COLUMN,
                    startColumn,
                    endColumn: i - 1,
                    startRow: 0,
                    endRow: 0,
                });
            } else if (!inHiddenRange && !visible) {
                inHiddenRange = true;
                startColumn = i;
            }
        }

        if (inHiddenRange) {
            hiddenCols.push({
                startRow: 0,
                endRow: 0,
                startColumn,
                endColumn: len - 1,
                rangeType: RANGE_TYPE.COLUMN,
            });
        }

        return hiddenCols;
    }

    getColumnDatas(columnPos: number, numColumns: number): ObjectArray<IColumnData> {
        const columnData = new ObjectArray<IColumnData>();
        for (let i = columnPos; i < columnPos + numColumns; i++) {
            const data = this.getColumnOrCreate(i);
            columnData.push(data);
        }
        return columnData;
    }

    /**
     * Get count of column in the sheet
     * @returns
     */
    getSize(): number {
        return this._columnData.getLength();
    }

    /**
     * Get the width of column
     * @param columnPos column index
     * @returns
     */
    getColumnWidth(columnPos: number): number;
    /**
     * Get the width of column
     * @param columnPos column index
     * @param numColumns column count
     * @returns
     */
    getColumnWidth(columnPos: number, numColumns: number): number;
    getColumnWidth(...argument: any): number {
        const { _columnData } = this;
        const config = this._config;
        let width: number = 0;
        if (argument.length === 1) {
            const column = _columnData.obtain(argument[0], {
                hd: BooleanNumber.FALSE,
                w: config.defaultColumnWidth,
            });
            width = column.w;
        } else if (argument.length === 2) {
            for (let i = argument[0]; i < argument[0] + argument[1]; i++) {
                const column = _columnData.obtain(i, {
                    hd: BooleanNumber.FALSE,
                    w: config.defaultColumnWidth,
                });
                width += column.w;
            }
        }

        return width;
    }

    /**
     * get given column data
     * @param columnPos column index
     * @returns
     */
    getColumn(columnPos: number): Nullable<IColumnData> {
        const column = this._columnData.get(columnPos);
        if (column) {
            return column;
        }
    }

    /**
     * get given column data or create a column data when it's null
     * @param columnPos column index
     * @returns
     */
    getColumnOrCreate(columnPos: number): IColumnData {
        const { _columnData } = this;
        const config = this._config;
        const column = _columnData.get(columnPos);
        if (column) {
            return column;
        }
        const create = {
            w: config.defaultColumnWidth,
            hd: BooleanNumber.FALSE,
        };
        this._columnData.set(columnPos, create);
        return create;
    }
}
