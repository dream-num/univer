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
    actionDataList: IActionData[];

    unit: CommandUnit;

    actionList: Array<ActionBase<IActionData>>;

    constructor(commandUnit: CommandUnit, ...list: IActionData[]) {
        this.unit = commandUnit;
        this.actionDataList = list;
        this.actionList = [];
    }

    getDoData(): IActionData[] {
        return this.actionList.map((action) => action.getDoActionData());
    }

    getOldData(): IActionData[] {
        return this.actionList.map((action) => action.getOldActionData());
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

    redo(): void {
        this.actionList.forEach((action) => {
            if (ActionOperation.hasUndo(action.getDoActionData())) {
                action.redo();
            }
        });
        CommandManager.getCommandObservers().notifyObservers({
            type: ActionType.REDO,
            actions: this.actionList,
        });
    }

    undo(): void {
        // Reverse is required, such as moving C:E to the back of column A, after copying the data of C:E
        // 1. removeColumn C:E 2.insertColumnData A,
        // when undo, it should be
        // 1. removeColumn A, 2. insertColumnData C:E
        this.actionList.reverse().forEach((action) => {
            if (ActionOperation.hasUndo(action.getOldActionData())) {
                action.undo();
            }
        });
        CommandManager.getCommandObservers().notifyObservers({
            type: ActionType.UNDO,
            actions: this.actionList,
        });
    }

    invoke(): void {
        CommandManager.getCommandInjectorObservers().notifyObservers(
            this.getInjector()
        );
        CommandManager.getCommandObservers().notifyObservers({
            type: ActionType.REDO,
            actions: this.actionList,
        });
    }
}
