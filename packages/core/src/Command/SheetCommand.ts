import { CommandBase } from './CommandBase';
import { CommandManager } from './CommandManager';
import { Workbook } from '../Sheets/Domain';
import { ISheetActionData } from './SheetAction';

/**
 * Execute the undo-redo command
 *
 * TODO: SlideCommand/DocCommand
 */
export class SheetCommand extends CommandBase {
    protected unit: Workbook;

    constructor(workbook: Workbook, ...list: ISheetActionData[]) {
        super(list);
        this.unit = workbook;
        this._actions = [];

        list.forEach((data) => {
            const ActionClass = CommandManager.getAction(data.actionName);
            const observers = CommandManager.getActionObservers();
            const action = new ActionClass(data, workbook, observers);
            this._actions.push(action);
        });
        // CommandManager.getCommandObservers().notifyObservers({
        //     type: ActionType.REDO,
        //     actions: this._actions,
        // });
    }
}
