import { CommandManager } from '../../Command/CommandManager';
import { SHEET_ACTION_NAMES } from '../../Types/Const';
import { ISetRowHeightActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';
import { SpreadsheetCommand } from './SpreadsheetCommand';

export class Row {
    constructor(private commandManager: CommandManager, private spreadsheetModel: SpreadsheetModel) {}

    /**
     * Set height of one or more rows
     * @param rowIndex row index
     * @param rowHeight row height array
     * @returns
     */
    setRowHeight(rowIndex: number, rowHeight: number[], sheetId: string) {
        const setRowHeightAction: ISetRowHeightActionData = {
            sheetId,
            actionName: SHEET_ACTION_NAMES.SET_ROW_HEIGHT_ACTION,
            rowIndex,
            rowHeight,
        };
        const command = new SpreadsheetCommand(this.spreadsheetModel, setRowHeightAction);
        this.commandManager.invoke(command);
    }
}
