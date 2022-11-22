import { Class, Nullable } from '../Shared';
import { Workbook } from '../Sheets/Domain';
import { ActionBase, IActionData } from './ActionBase';
import { ActionType } from './ActionObservers';
import { CommandInjector } from './CommandInjectorObservers';
import { CommandManager } from './CommandManager';

export class CommandUnit {
    WorkBookUnit: Workbook;
}

/**
 * Execute the undo-redo command
 *
 * TODO: SlideCommand/DocCommand
 */
export class Command {
    _unit: CommandUnit;

    _actionDataList: IActionData[];

    _actionList: Array<ActionBase<IActionData>>;

    constructor(commandUnit: CommandUnit, ...list: IActionData[]) {
        this._unit = commandUnit;

        this._actionDataList = list;
        this._actionList = [];
    }

    getDoData(): IActionData[] {
        return this._actionList.map((action) => action.getDoActionData());
    }

    getOldData(): IActionData[] {
        return this._actionList.map((action) => action.getOldActionDaa());
    }

    getInjector(): CommandInjector {
        const commandThis = this;
        return new (class implements CommandInjector {
            injectAction(action: ActionBase<IActionData, IActionData, void>): void {
                commandThis._actionList.push(action);
            }

            getActions(): Array<ActionBase<IActionData>> {
                return commandThis._actionList.concat([]);
            }

            include<T>(action: Class<T>): Nullable<T> {
                for (let i = 0; i < commandThis._actionList.length; i++) {
                    if (commandThis._actionList[i] instanceof action) {
                        return commandThis._actionList[i] as T;
                    }
                }
                return null;
            }
        })();
    }

    redo(): void {
        this._actionList.forEach((action) => action.redo());
        CommandManager.getCommandObservers().notifyObservers({
            type: ActionType.REDO,
            actions: this._actionList,
        });
    }

    undo(): void {
        this._actionList.forEach((action) => action.undo());
        CommandManager.getCommandObservers().notifyObservers({
            type: ActionType.UNDO,
            actions: this._actionList,
        });
    }

    invoke(): void {
        CommandManager.getCommandInjectorObservers().notifyObservers(
            this.getInjector()
        );
        CommandManager.getCommandObservers().notifyObservers({
            type: ActionType.REDO,
            actions: this._actionList,
        });
    }
}
