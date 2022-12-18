import { ActionExtensionManager } from './ActionExtensionManager';
import { UndoManager } from './UndoManager';
import { Class } from '../Shared';
import { ActionBase, IActionData } from './ActionBase';
import { ActionObservers } from './ActionObservers';
import { CommandObservers } from './CommandObservers';
import { CommandInjectorObservers } from './CommandInjectorObservers';
import { ContextBase } from '../Basics/ContextBase';
import { Command } from './Command';

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

    getActionExtensionManager(): ActionExtensionManager {
        return this._actionExtensionManager;
    }

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
            _actionList.push(action);
        });
        command.invoke();
        _undoManager.push(command);
        // server.pushMessageQueue(command.getDoData());
    }
}

CommandManager.staticInitialize();
