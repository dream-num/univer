import { ActionBase, IActionData } from './ActionBase';
import { Workbook } from '../Sheets/Domain';
import { CommandManager } from './CommandManager';
import { CommandInjector } from './CommandInjectorObservers';
import { Class, Nullable } from '../Shared';
import { ActionType } from './ActionObservers';
// import { ActionExtensionManager } from './ActionExtensionManager';

/**
 * Manage action instances and action data
 */
export class CommandBase {
    protected _actions: Array<ActionBase<IActionData>>;

    protected _workbook: Workbook;

    constructor(workbook: Workbook, ...list: IActionData[]) {
        this._workbook = workbook;
        this._actions = [];

        // TODO inject and invoke
        // const actionExtensionManager = new ActionExtensionManager();
        // actionExtensionManager.inject(this);

        list.forEach((data) => {
            const ActionClass = CommandManager.getAction(data.actionName);
            const observers = CommandManager.getActionObservers();
            const action = new ActionClass(data, this._workbook, observers);
            this._actions.push(action);
        });
        CommandManager.getCommandObservers().notifyObservers({
            type: ActionType.REDO,
            actions: this._actions,
        });
    }

    getDoData(): IActionData[] {
        return this._actions.map((action) => action.getDoActionData());
    }

    getOldData(): IActionData[] {
        return this._actions.map((action) => action.getOldActionDaa());
    }

    getInjector(): CommandInjector {
        const commandThis = this;
        return new (class implements CommandInjector {
            injectAction(action: ActionBase<IActionData, IActionData, void>): void {
                commandThis._actions.push(action);
            }

            getActions(): Array<ActionBase<IActionData>> {
                return commandThis._actions.concat([]);
            }

            include<T>(action: Class<T>): Nullable<T> {
                for (let i = 0; i < commandThis._actions.length; i++) {
                    if (commandThis._actions[i] instanceof action) {
                        return commandThis._actions[i] as T;
                    }
                }
                return null;
            }
        })();
    }
}
