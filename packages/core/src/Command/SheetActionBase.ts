import { SpreadsheetModel } from '../Sheets/Model/SpreadsheetModel';
import { ActionBase, ActionObservers, IActionData } from './ActionBase';
import { CommandModel } from './CommandModel';

/**
 * Format of action data param
 */
export interface ISheetActionData extends IActionData {
    sheetId: string;
    rangeRef?: string;
}

/**
 * Basics class for action
 *
 * TODO: SlideAction/DocAction
 * @beta
 */
export abstract class SheetActionBase<D extends ISheetActionData, O extends ISheetActionData = D, R = void> extends ActionBase<D, O, R> {
    private _spreadsheetModel: SpreadsheetModel;

    protected constructor(actionData: D, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, observers);
        if (commandModel.SpreadsheetModel == null) {
            throw new Error('action workbook domain can not be null!');
        }
        this._spreadsheetModel = commandModel.SpreadsheetModel;
    }

    getSpreadsheetModel(): SpreadsheetModel {
        return this._spreadsheetModel;
    }
}
