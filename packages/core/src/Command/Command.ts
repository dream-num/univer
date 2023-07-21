import { Class, Nullable } from '../Shared/Types';
import { ActionBase, ActionObservers, ActionType, IActionData } from './ActionBase';
import { ActionOperation } from './ActionOperation';
import { CommandInjector } from './CommandInjectorObservers';
import { CommandModel } from './CommandModel';
import { CommonParameter } from './CommonParameter';
import { Observable } from '../Observer';
import { RegisterAction } from './RegisterAction';

/**
 * Command observer props
 */
interface ICommandObserverProps {
    type: ActionType;
    actions: Array<ActionBase<IActionData>>;
}

/**
 * Command observers
 */
export class CommandObservers extends Observable<ICommandObserverProps> {}

/**
 * Execute the undo-redo command
 *
 */
export class Command {
    private static _commandObservers: CommandObservers;

    private static _actionObservers: ActionObservers;

    actionDataList: IActionData[];

    actionList: Array<ActionBase<IActionData>>;

    commandModel: CommandModel;

    private _commonParameter = new CommonParameter();

    constructor(commandModel: CommandModel, ...list: IActionData[]) {
        this.commandModel = commandModel;
        this.actionList = [];
        this.actionDataList = list;
    }

    static getCommandObservers(): CommandObservers {
        return this._commandObservers;
    }

    static getActionObservers(): ActionObservers {
        return this._actionObservers;
    }

    redo(): void {
        this.actionList.forEach((action) => {
            if (ActionOperation.hasUndo(action.getDoActionData())) {
                action.redo(this._commonParameter.reset());
            }
        });
        Command.getCommandObservers().notifyObservers({
            type: ActionType.REDO,
            actions: this.actionList,
        });
    }

    undo(): void {
        // Reverse is required, such as moving C:E to the back of column A, after copying the data of C:E
        // 1. removeColumn C:E 2.insertColumnData A,
        // when undo, it should be
        // 1. removeColumn A, 2. insertColumnData C:E
        this.actionList.forEach((action) => {
            if (ActionOperation.hasUndo(action.getOldActionData())) {
                action.undo(this._commonParameter.reset());
            }
        });
        Command.getCommandObservers().notifyObservers({
            type: ActionType.UNDO,
            actions: this.actionList,
        });
    }

    invoke(): void {
        this.actionDataList.forEach((data) => {
            const ActionClass = RegisterAction.getAction(data.actionName);
            if (!ActionClass) return;
            const observers = Command.getActionObservers();
            const action = new ActionClass(data, this.commandModel, observers, this._commonParameter.reset());
            this.actionList.push(action);
        });

        Command.getCommandObservers().notifyObservers({
            type: ActionType.REDO,
            actions: this.actionList,
        });
    }

    getOldData(): IActionData[] {
        return this.actionList.map((action) => action.getOldActionData());
    }

    getDoData(): IActionData[] {
        return this.actionList.map((action) => action.getDoActionData());
    }

    getInjector(): CommandInjector {
        const commandThis = this;
        return new (class implements CommandInjector {
            injectAction(action: ActionBase<IActionData, IActionData, void>): void {
                commandThis.actionList.push(action);
            }

            getActions(): Array<ActionBase<IActionData>> {
                return commandThis.actionList.concat([]);
            }

            include<T>(action: Class<T>): Nullable<T> {
                for (let i = 0; i < commandThis.actionList.length; i++) {
                    if (commandThis.actionList[i] instanceof action) {
                        return commandThis.actionList[i] as unknown as Nullable<T>;
                    }
                }
                return null;
            }
        })();
    }
}
