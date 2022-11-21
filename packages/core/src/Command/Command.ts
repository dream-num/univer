import { CommandBase } from './CommandBase';
import { CommandManager } from './CommandManager';
import { Workbook } from '../Sheets/Domain';
import { IActionData } from './ActionBase';

export class CommandUnit {
    WorkBookUnit: Workbook;
}

/**
 * Execute the undo-redo command
 *
 * TODO: SlideCommand/DocCommand
 */
export class Command extends CommandBase {
    protected unit: CommandUnit;

    constructor(commandUnit: CommandUnit, ...list: IActionData[]) {
        super(list);
        this.unit = commandUnit;
        this._actions = [];

        list.forEach((data) => {
            const ActionClass = CommandManager.getAction(data.actionName);
            const observers = CommandManager.getActionObservers();
            const action = new ActionClass(data, commandUnit, observers);
            this._actions.push(action);
        });
        // CommandManager.getCommandObservers().notifyObservers({
        //     type: ActionType.REDO,
        //     actions: this._actions,
        // });
    }
}
