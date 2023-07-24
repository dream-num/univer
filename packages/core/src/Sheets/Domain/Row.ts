import { CommandManager } from '../../Command/CommandManager';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

export class Row {
    constructor(private commandManager: CommandManager, private spreadsheetModel: SpreadsheetModel) {}
}
