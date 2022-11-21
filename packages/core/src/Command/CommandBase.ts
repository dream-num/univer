import { ActionBase, IActionData } from './ActionBase';
import { CommandManager } from './CommandManager';
import { CommandInjector } from './CommandInjectorObservers';
import { Class, Nullable } from '../Shared';
// import { ActionType } from './ActionObservers';
import { ActionType } from './ActionObservers';
import { ActionExtensionManager } from './ActionExtensionManager';

/**
 * Manage action instances and action data
 */
export class CommandBase {
    protected _actions: Array<ActionBase<IActionData>>;

    constructor(list: IActionData[]) {
        const actionExtensionManager = new ActionExtensionManager();
        actionExtensionManager.handle(list);
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

    redo(): void {
        this._actions.forEach((action) => action.redo());
        CommandManager.getCommandObservers().notifyObservers({
            type: ActionType.REDO,
            actions: this._actions,
        });
    }

    undo(): void {
        this._actions.forEach((action) => action.undo());
        CommandManager.getCommandObservers().notifyObservers({
            type: ActionType.UNDO,
            actions: this._actions,
        });
    }

    invoke(): void {
        CommandManager.getCommandInjectorObservers().notifyObservers(
            this.getInjector()
        );
        CommandManager.getCommandObservers().notifyObservers({
            type: ActionType.REDO,
            actions: this._actions,
        });
    }
}
