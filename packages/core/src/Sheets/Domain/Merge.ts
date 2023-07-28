import { CommandManager } from '../../Command/CommandManager';
import { SHEET_ACTION_NAMES } from '../../Types/Const/SHEET_ACTION_NAMES';
import { IRangeData } from '../../Types/Interfaces/IRangeData';
import { IAddMergeActionData, IRemoveMergeActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';
import { SpreadsheetCommand } from './SpreadsheetCommand';

/**
 * Manage merged cells
 */
export class Merge {
    constructor(private readonly commandManager: CommandManager, private readonly spreadsheetModel: SpreadsheetModel) {}

    add(rectangle: IRangeData, sheetId: string): void {
        let removeAction: IRemoveMergeActionData = {
            actionName: SHEET_ACTION_NAMES.REMOVE_MERGE_ACTION,
            sheetId,
            rectangles: [rectangle],
        };
        let appendAction: IAddMergeActionData = {
            actionName: SHEET_ACTION_NAMES.ADD_MERGE_ACTION,
            sheetId,
            rectangles: [rectangle],
        };
        const command = new SpreadsheetCommand(this.spreadsheetModel, removeAction, appendAction);
        this.commandManager.invoke(command);
    }

    remove(rectangle: IRangeData, sheetId: string): void {
        let removeAction: IRemoveMergeActionData = {
            actionName: SHEET_ACTION_NAMES.REMOVE_MERGE_ACTION,
            sheetId,
            rectangles: [rectangle],
        };

        const command = new SpreadsheetCommand(this.spreadsheetModel, removeAction);
        this.commandManager.invoke(command);
    }
}
