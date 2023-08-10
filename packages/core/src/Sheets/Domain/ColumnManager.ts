import { Inject } from '@wendellhu/redi';

import { CurrentUniverService, ICurrentUniverService } from '../../Service/Current.service';
import { Command, CommandManager } from '../../Command';
import { ISetColumnWidthActionData } from '../Action';
import { ACTION_NAMES } from '../../Types/Const';
import { BooleanNumber } from '../../Types/Enum';
import { IColumnData } from '../../Types/Interfaces';
import { Nullable, Tools } from '../../Shared';
import { ObjectArray, ObjectArrayType } from '../../Shared/ObjectArray';
import { Worksheet } from './Worksheet';

/**
 * Manage configuration information of all columns, get column width, column length, set column width, etc.
 */
export class ColumnManager {
    private _columnData: ObjectArray<IColumnData>;

    private _workSheet: Worksheet;

    constructor(
        workSheet: Worksheet,
        data: ObjectArrayType<Partial<IColumnData>>,
        @ICurrentUniverService private readonly _currentUniverSheet: CurrentUniverService,
        @Inject(CommandManager) private readonly _commandManager: CommandManager
    ) {
        this._workSheet = workSheet;
        this._columnData = Tools.createObjectArray(data) as ObjectArray<IColumnData>;
    }

    /**
     * Get width and hidden status of columns in the sheet
     * @returns
     */
    getColumnData(): ObjectArray<IColumnData> {
        return this._columnData;
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
        const { _workSheet } = this;
        const { _columnData } = this;
        const config = _workSheet.getConfig();
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
     * set one or more column width
     * @param columnIndex column index
     * @param columnWidth column width Array
     * @returns
     */
    setColumnWidth(columnIndex: number, columnWidth: number[]): void {
        const setColumnWidth: ISetColumnWidthActionData = {
            sheetId: this._workSheet.getSheetId(),
            actionName: ACTION_NAMES.SET_COLUMN_WIDTH_ACTION,
            columnIndex,
            columnWidth,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverSheet.getCurrentUniverSheetInstance().getWorkBook(),
            },
            setColumnWidth
        );
        this._commandManager.invoke(command);
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
        const { _workSheet } = this;
        const { _columnData } = this;
        const config = _workSheet.getConfig();
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