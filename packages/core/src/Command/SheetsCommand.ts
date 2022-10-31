import { CommandBase } from './CommandBase';
import { CommandManager } from './CommandManager';
import {Workbook} from "../Sheets/Domain";
import {IActionData} from "./ActionBase";
import {ActionExtensionManager} from "./ActionExtensionManager";

/**
 * Execute the undo-redo command
 */
export class SheetsCommand extends CommandBase {
    protected unit: Workbook | docs|slider;

    constructor(workbook: Workbook, ...list: IActionData[]) {
        super();
        this.unit = workbook;
        this._actions = [];

        // TODO inject and invoke
        const actionExtensionManager = new ActionExtensionManager();
        actionExtensionManager.handle(list);

        list.forEach((data) => {
            const ActionClass = CommandManager.getAction(data.actionName);
            const observers = CommandManager.getActionObservers();
            const action = new ActionClass(data, this._workbook, observers);
            this._actions.push(action);
        });
        // CommandManager.getCommandObservers().notifyObservers({
        //     type: ActionType.REDO,
        //     actions: this._actions,
        // });
    }
}
