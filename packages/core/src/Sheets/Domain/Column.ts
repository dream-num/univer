import { CommandManager } from '../../Command';
import { SHEET_ACTION_NAMES } from '../../Types/Const';
import { ISetColumnWidthActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
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
    setColumnWidth(columnIndex: number, columnCount: number, columnWidth: number, sheetId: string): void {
        const width = [];
        for (let i = 0; i < columnCount; i++) {
            width.push(columnWidth);
        }

        const setColumnWidthAction: ISetColumnWidthActionData = {
            sheetId,
            actionName: SHEET_ACTION_NAMES.SET_COLUMN_WIDTH_ACTION,
            columnIndex,
            columnWidth: width,
        };
        const command = new SpreadsheetCommand(this.spreadsheetModel, setColumnWidthAction);
        this.commandManager.invoke(command);
    }
}
