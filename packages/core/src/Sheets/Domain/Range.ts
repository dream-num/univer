import { CommandManager } from '../../Command/CommandManager';
import { Nullable, ObjectMatrix, ObjectMatrixPrimitiveType } from '../../Shared';
import { SHEET_ACTION_NAMES } from '../../Types/Const';
import { ICellData, ICellV, IOptionData, IRangeData } from '../../Types/Interfaces';
import { IClearRangeActionData, ISetRangeDataActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
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
    setRangeData(cell: Nullable<ICellV>, rangeData: IRangeData, sheetId: string) {
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

        return this.setMatrixData(cellValue.getData(), sheetId);
    }

    /**
     * Set multiple values for an entire range
     * @param matrixData
     * @param sheetId
     * @returns
     */
    setMatrixData(matrixData: ObjectMatrixPrimitiveType<ICellData>, sheetId: string) {
        const setRangeDataAction: ISetRangeDataActionData = {
            actionName: SHEET_ACTION_NAMES.SET_RANGE_DATA_ACTION,
            sheetId,
            cellValue: matrixData,
        };
        const command = new SpreadsheetCommand(this.spreadsheetModel, setRangeDataAction);
        this.commandManager.invoke(command);
        return setRangeDataAction.sheetId;
    }

    clear(options: IOptionData, rangeData: IRangeData, sheetId: string) {
        const clearDataAction: IClearRangeActionData = {
            actionName: SHEET_ACTION_NAMES.CLEAR_RANGE_ACTION,
            sheetId,
            options,
            rangeData,
        };
        const command = new SpreadsheetCommand(this.spreadsheetModel, clearDataAction);
        this.commandManager.invoke(command);
        return clearDataAction.sheetId;
    }
}
