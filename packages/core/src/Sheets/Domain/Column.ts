import { CommandManager } from '../../Command';
import { ACTION_NAMES } from '../../Types/Const';
import { ISetColumnWidthActionData } from '../../Types/Interfaces/IActionModel';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';
import { SpreadsheetCommand } from './SpreadsheetCommand';

export class Column {
    constructor(private commandManager: CommandManager, private spreadsheetModel: SpreadsheetModel) {}

    /**
     * set one or more column width
     * @param columnIndex column index
     * @param columnWidth column width Array
     * @returns
     */
    setColumnWidth(columnIndex: number, columnWidth: number[], sheetId: string): void {
        const setColumnWidthAction: ISetColumnWidthActionData = {
            sheetId,
            actionName: ACTION_NAMES.SET_COLUMN_WIDTH_ACTION,
            columnIndex,
            columnWidth,
        };
        const command = new SpreadsheetCommand(this.spreadsheetModel, setColumnWidthAction);
        this.commandManager.invoke(command);
    }
}
