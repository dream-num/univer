import { CommandManager } from '../../Command/CommandManager';
import { Nullable, ObjectMatrix, ObjectMatrixPrimitiveType } from '../../Shared';
import { ACTION_NAMES } from '../../Types/Const';
import { ICellData, ICellV, IRangeData } from '../../Types/Interfaces';
import { ISetRangeDataActionData } from '../../Types/Interfaces/IActionModel';
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
            actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
            sheetId,
            cellValue: matrixData,
        };
        const command = new SpreadsheetCommand(this.spreadsheetModel, setRangeDataAction);
        this.commandManager.invoke(command);
        return setRangeDataAction.sheetId;
    }
}
