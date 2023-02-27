import {
    UndoManager,
    ActionBase,
    ActionExtensionManager,
    IActionData,
    ActionObservers,
    CommandObservers,
    CommandInjectorObservers,
    Command,
    ActionOperation,
} from './index';
import { Class } from '../Shared';
import { ContextBase } from '../Basics';

/**
 * Manage command
 */
export class CommandManager {
    private static _actionClass: Map<string, Class<ActionBase<IActionData>>>;

    private static _commandObservers: CommandObservers;

    private static _actionObservers: ActionObservers;

    private static _commandInjectorObservers: CommandInjectorObservers;

    private _undoManager: UndoManager;

    private _actionExtensionManager: ActionExtensionManager;

    constructor(context: ContextBase) {
        this._undoManager = context.getUndoManager();
        this._actionExtensionManager = new ActionExtensionManager();
    }

    static staticInitialize() {
        this._actionClass = new Map<string, Class<ActionBase<IActionData>>>();
        this._actionObservers = new ActionObservers();
        this._commandObservers = new CommandObservers();
        this._commandInjectorObservers = new CommandInjectorObservers();
    }

    static getAction(name: string) {
        return this._actionClass[name];
    }

    static getActionObservers(): ActionObservers {
        return this._actionObservers;
    }

    static getCommandObservers(): CommandObservers {
        return this._commandObservers;
    }

    static register(name: string, clazz: Class<ActionBase<IActionData>>) {
        this._actionClass[name] = clazz;
    }

    static getCommandInjectorObservers(): CommandInjectorObservers {
        return this._commandInjectorObservers;
    }

    getActionExtensionManager(): ActionExtensionManager {
        return this._actionExtensionManager;
    }

    undo(): void {
        const { _undoManager } = this;
        // const server = _workbook.getServer();
        const command = _undoManager.undo();
        if (command) {
            command.undo();
            // server.pushMessageQueue(command.getOldData());
        }
    }

    redo(): void {
        const { _undoManager } = this;
        // const server = _workbook.getServer();
        const command = _undoManager.redo();
        if (command) {
            command.redo();
            // server.pushMessageQueue(command.getDoData());
        }
    }

    invoke(command: Command): void {
        const { _undoManager } = this;
        const { _actionDataList, _unit, _actionList } = command;
        // const server = _workbook.getServer();
        this._actionExtensionManager.handle(_actionDataList);

        _actionDataList.forEach((data) => {
            const ActionClass = CommandManager.getAction(data.actionName);
            const observers = CommandManager.getActionObservers();
            const action = new ActionClass(data, _unit, observers);
            // if (ActionOperation.hasUndo(data)) {
            _actionList.push(action);

            // }
        });
        command.invoke();
        // if (_actionList.length === 0) {
        //     return;
        // }
        _undoManager.push(command);
        // server.pushMessageQueue(command.getDoData());
    }
}

CommandManager.staticInitialize();
