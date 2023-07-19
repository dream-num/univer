import { Command } from '../../Command';
import { IActionData } from '../../Command/ActionBase';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

export class SpreadsheetCommand extends Command {
    constructor(spreadsheetModel: SpreadsheetModel, ...list: IActionData[]) {
        super({ SpreadsheetModel: spreadsheetModel }, ...list);
    }
}
