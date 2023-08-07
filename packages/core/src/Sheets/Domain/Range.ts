import { CommandManager } from '../../Command/CommandManager';
import { Nullable, ObjectMatrix, ObjectMatrixPrimitiveType } from '../../Shared';
import { SHEET_ACTION_NAMES } from '../../Types/Const';
import { Dimension } from '../../Types/Enum/Dimension';
import { ICellData, ICellV, IOptionData, IRangeData } from '../../Types/Interfaces';
import { IClearRangeActionData, IDeleteRangeActionData, IInsertRangeActionData, ISetRangeDataActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';
import { SpreadsheetCommand } from './SpreadsheetCommand';

export class Range {
    constructor(private readonly commandManager: CommandManager, private readonly spreadsheetModel: SpreadsheetModel) {}

    /**
     * set a value for the entire range
     * @param cell
     * @param rangeData
     * @param sheetId
     * @returns
     */
    setRangeValue(cell: Nullable<ICellV>, rangeData: IRangeData, sheetId: string) {
        let { startRow, startColumn, endRow, endColumn } = rangeData;
        let cellValue = new ObjectMatrix<ICellData>();
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                cellValue.setValue(startRow, startColumn, {
                    m: `${cell}`,
                    v: cell,
                });
            }
        }

        this.setRangeData(cellValue.getData(), sheetId);
    }

    /**
     * Set multiple values for an entire range
     * @param matrixData
     * @param sheetId
     * @returns
     */
    setRangeData(matrixData: ObjectMatrixPrimitiveType<ICellData>, sheetId: string) {
        const setRangeDataAction: ISetRangeDataActionData = {
            actionName: SHEET_ACTION_NAMES.SET_RANGE_DATA_ACTION,
            sheetId,
            cellValue: matrixData,
        };
        const command = new SpreadsheetCommand(this.spreadsheetModel, setRangeDataAction);
        this.commandManager.invoke(command);
    }

    /**
     * Clears the range of contents and/or format, as specified with the given advanced options. By default all data is cleared.
     *
     * @param options A JavaScript object that specifies advanced parameters, as listed below.
     * @param rangeData range data
     * @param sheetId sheet id
     * @returns void
     */
    clearRange(options: IOptionData, rangeData: IRangeData, sheetId: string) {
        const clearDataAction: IClearRangeActionData = {
            actionName: SHEET_ACTION_NAMES.CLEAR_RANGE_ACTION,
            sheetId,
            options,
            rangeData,
        };
        const command = new SpreadsheetCommand(this.spreadsheetModel, clearDataAction);
        this.commandManager.invoke(command);
    }

    /**
     * Deletes this range of cells. Existing data in the sheet along the provided dimension is shifted towards the deleted range.
     *
     * solution: Clear the range to be deleted, and then set the new value of the cell content at the bottom using setValue
     * @param  {Dimension} shiftDimension The dimension along which to shift existing data.
     * @param rangeData range data
     * @param sheetId sheet id
     * @returns void
     */
    deleteRange(shiftDimension: Dimension, rangeData: IRangeData, sheetId: string): void {
        const deleteDataAction: IDeleteRangeActionData = {
            sheetId,
            actionName: SHEET_ACTION_NAMES.DELETE_RANGE_ACTION,
            shiftDimension,
            rangeData,
        };
        const command = new SpreadsheetCommand(this.spreadsheetModel, deleteDataAction);
        this.commandManager.invoke(command);
    }

    /**
     * Inserts empty cells into this range. The new cells retain any formatting present in the cells previously occupying this range. Existing data in the sheet along the provided dimension is shifted away from the inserted range.
     * @param shiftDimension The dimension along which to shift existing data.
     * @param rangeData range data
     * @param sheetId sheet id
     */
    insertRange(shiftDimension: Dimension, rangeData: IRangeData, sheetId: string) {
        const { startRow, endRow, startColumn, endColumn } = rangeData;

        // build blank values
        let cellValue = new ObjectMatrix<ICellData>();

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                cellValue.setValue(r, c, { m: '', v: '' });
            }
        }

        const insertRange: IInsertRangeActionData = {
            sheetId,
            actionName: SHEET_ACTION_NAMES.INSERT_RANGE_ACTION,
            shiftDimension,
            rangeData,
            cellValue: cellValue.getData(),
        };

        const command = new SpreadsheetCommand(this.spreadsheetModel, insertRange);
        this.commandManager.invoke(command);
    }

    insertRangeData(shiftDimension: Dimension, destination: ObjectMatrixPrimitiveType<ICellData>, rangeData: IRangeData, sheetId: string) {
        const insertRange: IInsertRangeActionData = {
            sheetId,
            actionName: SHEET_ACTION_NAMES.INSERT_RANGE_ACTION,
            shiftDimension,
            rangeData,
            cellValue: destination,
        };

        const command = new SpreadsheetCommand(this.spreadsheetModel, insertRange);
        this.commandManager.invoke(command);
    }
}
