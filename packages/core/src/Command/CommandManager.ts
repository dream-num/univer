import { Command } from './Command';
import { CommandInjectorObservers } from './CommandInjectorObservers';
import { UndoManager } from './UndoManager';
import { ActionExtensionManager } from './ActionExtensionManager';

/**
 * Manage command
 */
export class CommandManager {
    private static _commandInjectorObservers: CommandInjectorObservers;

    private _undoManager: UndoManager;

    private _actionExtensionManager: ActionExtensionManager;

    constructor(undoManager: UndoManager) {
        this._undoManager = undoManager;
        this._actionExtensionManager = new ActionExtensionManager();
    }

    static staticInitialize() {
        this._commandInjectorObservers = new CommandInjectorObservers();
    }

    static getCommandInjectorObservers(): CommandInjectorObservers {
        return this._commandInjectorObservers;
    }

    getActionExtensionManager(): ActionExtensionManager {
        return this._actionExtensionManager;
    }

    undo(): void {
        const { _undoManager } = this;
        const command = _undoManager.undo();
        if (command) {
            command.undo();
        }
    }

    redo(): void {
        const { _undoManager } = this;
        const command = _undoManager.redo();
        if (command) {
            command.redo();
        }
    }

    invoke(command: Command): void {
        const { _undoManager } = this;
        const { actionDataList } = command;

        // Action may be added or reissued
        this._actionExtensionManager.handle(actionDataList);

        CommandManager.getCommandInjectorObservers().notifyObservers(command.getInjector());
        command.invoke();
        _undoManager.push(command);
    }
}

CommandManager.staticInitialize();
