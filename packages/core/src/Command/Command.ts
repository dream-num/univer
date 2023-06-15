import { Class, Nullable } from '../Shared';
import { Workbook } from '../Sheets';
import {
    ActionBase,
    IActionData,
    ActionType,
    CommandInjector,
    CommandManager,
    ActionOperation,
} from './index';

import { DocumentModel } from '../Docs/Domain/DocumentModel';

export class CommandUnit {
    WorkBookUnit?: Workbook;

    DocumentUnit?: DocumentModel;
}

/**
 * Execute the undo-redo command
 *
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
        return this._actionList.map((action) => action.getOldActionData());
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
                        return commandThis._actionList[i] as unknown as Nullable<T>;
                    }
                }
                return null;
            }
        })();
    }

    canUndo(): boolean {
        return this._actionList.some((action) =>
            ActionOperation.hasUndo(action.getDoActionData())
        );
    }

    redo(): void {
        this._actionList.forEach((action) => {
            if (ActionOperation.hasUndo(action.getDoActionData())) {
                action.redo();
            }
        });
        CommandManager.getCommandObservers().notifyObservers({
            type: ActionType.REDO,
            actions: this._actionList,
        });
    }

    undo(): void {
        // Reverse is required, such as moving C:E to the back of column A, after copying the data of C:E
        // 1. removeColumn C:E 2.insertColumnData A,
        // when undo, it should be
        // 1. removeColumn A, 2. insertColumnData C:E
        this._actionList.reverse().forEach((action) => {
            if (ActionOperation.hasUndo(action.getOldActionData())) {
                action.undo();
            }
        });
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
